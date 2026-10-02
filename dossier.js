import {entityTitle,splitPresentation,presentationPeriod,factLabel,publicFigure} from './dossier-presentation.js';
import {historicalDate,historicalInterval,intersects,yearString,historicalYear,formatHistoricalPeriod} from './historical-chronology.js';
const node=(tag,text,className)=>{const e=document.createElement(tag);if(text!==undefined&&text!==null)e.textContent=String(text);if(className)e.className=className;return e;};
export const period=fact=>formatHistoricalPeriod({kind:'interval',from:fact.validFrom,until:fact.validUntil});
const legacyFields={names:'identity',politicalStatus:'political-institutional',governments:'political-institutional',leaders:'leadership',capitals:'capital',currencies:'currency',flags:'historical-flag',population:'population-statistics',area:'area-statistics',economy:'economy',events:'events-context',relationships:'relationships',predecessors:'relationships',successors:'relationships',descriptions:'overview'};
const safeFlag=flag=>flag?.license&&flag.attribution&&/^\.\/assets\/flags\/[\w-]+\.svg$/.test(flag.asset||'');
export function resolveDossierRecords(resolved,rich,year,registry,{mappings=[]}={}){
  const records=rich?.resolve(resolved.entity?.id,year,{registry,mappings})||[],selected=historicalDate(yearString(year));
  for(const [field,category]of Object.entries(legacyFields))for(const f of resolved[field]||[]){
    if(!f.sourceIds?.length||f.sourceIds.some(id=>!registry.has(id)))continue;
    const value=f.value??(category==='events-context'?[f.title,f.note].filter(Boolean).join(' — '):undefined);
    if(value===undefined||value===null||value==='')continue;
    const temporal=f.asOf?{kind:'observation',observationDate:f.asOf}:f.date?{kind:'event',date:f.date}:{kind:'interval',from:f.validFrom,until:f.validUntil};
    let mode='applicable';try{
      if(temporal.kind==='interval'&&!temporal.from&&!temporal.until)continue;
      const b=historicalInterval(temporal);
      if(temporal.kind==='interval'&&!intersects(b,selected))continue;
      if(temporal.kind!=='interval'){
        const distance=year-historicalDate(temporal.observationDate||temporal.date).year;
        if(distance<0||distance>(temporal.kind==='observation'?10:5))continue;
        if(temporal.kind==='observation'&&!f.scope)continue;
        if(distance>0)mode=temporal.kind==='observation'?'nearby-observation':'dated-context';
      }
    }catch{continue;}
    const flag=category==='historical-flag'?{asset:f.asset,type:f.flagType||f.type||f.value,alt:f.alt||f.value,license:f.license,attribution:f.attribution}:undefined;
    if(flag&&!safeFlag(flag))continue;
    records.push({category,value,role:f.role||f.label,sourceIds:f.sourceIds,temporal,actualTemporal:temporal,mode,
      qualifications:[f.note,f.confidence&&!['high','documented'].includes(f.confidence)?'Evidence: '+f.confidence:''].filter(Boolean),scope:typeof f.scope==='string'?{description:f.scope}:f.scope,
      unit:f.unit,metric:f.metric,observationType:f.observationType,flag,type:field==='predecessors'?'Preceded by':field==='successors'?'Succeeded by':f.type,mapIds:f.mapIds,legacyField:field});
  }
  const merged=new Map();
  for(const r of records){const t=r.temporal,key=JSON.stringify([r.category,r.value,r.role||null,r.type||null,t.kind,t.from||null,t.until||null,t.observationDate||t.date||null,r.flag?.asset||null]);
    if(merged.has(key)){const old=merged.get(key);old.sourceIds=[...new Set([...old.sourceIds,...r.sourceIds])];old.qualifications=[...new Set([...old.qualifications,...r.qualifications])];}
    else merged.set(key,{...r,sourceIds:[...r.sourceIds],qualifications:[...(r.qualifications||[])]});
  }
  return [...merged.values()];
}
export function displayValue(record,{compact=false}={}){
  const value=record.value;
  if(typeof value==='number'){
    if(compact&&record.category==='population-statistics'&&value>=1000000)return (value/1000000).toLocaleString('en-US',{maximumFractionDigits:1})+' million';
    return value.toLocaleString('en-US',{maximumFractionDigits:3})+(record.unit?' '+record.unit:'');
  }
  if(typeof value==='string')return value;
  return value?.text||value?.description||value?.title||value?.name||'';
}
export function renderDossier(container,context){
  const {stableId,savedName,year,snapshotYear,metadata,rich,features=[]}=context,resolved=metadata?.resolve(stableId,year)||{};
  const registry=new Map([...(metadata?.registry||[]),...(rich?.registry||[])]),used=new Map(),assetCredits=new Map(),coverageNotes=new Map(),content=node('div',undefined,'territory-dossier');let sourceDetails;
  if(!registry.has('basemaps'))registry.set('basemaps',{title:'Historical Basemaps',institution:'Historical Basemaps project',url:'https://github.com/aourednik/historical-basemaps'});
  const markers=(element,ids=[])=>{for(const id of [...new Set(ids)]){const source=registry.get(id);if(!source||!/^https:\/\//.test(source.url||''))continue;if(!used.has(id))used.set(id,used.size+1);const a=node('a',String(used.get(id)),'fact-source');a.href='#dossier-source-'+id;a.setAttribute('aria-label','Source '+used.get(id)+': '+source.title);a.addEventListener('click',()=>{if(sourceDetails)sourceDetails.open=true;});element.append(' ',a);}return element;};
  const section=(parent,title)=>{const s=node('section',undefined,'dossier-section');s.append(node('h2',title));parent.append(s);return s;};
  const groupRecords=resolved.ambiguous?resolved.identityPeriods||[]:[resolved];
  const titleRecords=resolved.entity?resolveDossierRecords(resolved,rich,year,registry,{mappings:resolved.mappings||[]}):[],title=entityTitle(resolved,titleRecords,savedName),name=title.text;
  const header=node('header',undefined,'dossier-header'),heading=markers(node('h1',name),title.sourceIds.length?title.sourceIds:['basemaps']);heading.id='territory-name';header.append(node('div','Historical dossier','inspector-kicker'),heading);
  const date=node('p',historicalYear(year),'dossier-snapshot');date.setAttribute('aria-label','Selected historical year '+historicalYear(year));header.append(date);
  if(year!==snapshotYear||context.boundaryLoadFailed)header.append(node('p','Boundary map: '+historicalYear(snapshotYear)+(context.boundaryLoadFailed?' · requested boundaries unavailable':' · nearest available snapshot'),'dossier-boundary-note'));
  content.append(header);
  if(!features.length)content.append(node('p','This identity is absent from the displayed boundary snapshot. No successor has been substituted.','dossier-notice'));
  if(resolved.calendarYear?.isTransition)content.append(node('p',resolved.ambiguous?'This year spans several historical identities. Each framework and its dated evidence are shown separately.':'A political transition or partial dated framework occurs during this year. Dates below qualify which part of the year each record describes.','dossier-notice'));
  if(context.richError)content.append(node('p','Additional dossier records are temporarily unavailable. Available historical evidence is shown below.','dossier-notice'));
  if(context.metadataError)content.append(node('p','Historical identity records are temporarily unavailable. The boundary map name is retained.','dossier-notice'));
  const present=(r,text)=>{const p=splitPresentation(text);for(const note of p.notes){const key=note+'|'+r.sourceIds.join(',');coverageNotes.set(key,{note,sourceIds:r.sourceIds});}return p.text;};
  const detail=r=>[presentationPeriod(r,r.presentationEntity),['population-statistics','area-statistics','density','economy'].includes(r.category)?present(r,r.scope?.description||''):'',...(r.qualifications||[]).map(q=>present(r,q))].filter(Boolean).join(' · ');
  const humanLabel=value=>value?value.replaceAll('-', ' ').replace(/^./,c=>c.toUpperCase()):'Historical record';
  const fact=(parent,r,label)=>{const row=node('div',undefined,'dossier-row'),dd=markers(node('dd',displayValue(r)),r.sourceIds);if(detail(r))dd.append(node('small',detail(r),'fact-context'));row.append(node('dt',humanLabel(label||r.role||r.metric)),dd);parent.append(row);};
  for(const framework of groupRecords){
    if(!framework.entity)continue;
    const parent=resolved.ambiguous?node('article',undefined,'dossier-framework'):content;if(resolved.ambiguous){parent.append(node('h2',entityTitle(framework,[],savedName).text));for(const m of framework.mappings||[])parent.append(node('small',period(m),'fact-context'));content.append(parent);}
    const records=resolveDossierRecords(framework,rich,year,registry,{mappings:framework.mappings||[]}),by=category=>records.filter(r=>r.category===category);
    for(const r of records)r.presentationEntity=framework.entity;
    const identities=by('identity').filter(r=>displayValue(r)!==name&&!/—.*framework/i.test(displayValue(r)));if(identities.length){const s=section(parent,'Historical identity'),dl=node('dl');for(const r of identities)fact(dl,r,r.role||'Name / designation');s.append(dl);}
    const flags=by('historical-flag').filter(r=>safeFlag(r.flag));
    if(flags.length){const strip=node('div',undefined,'dossier-flags');for(const r of flags){assetCredits.set(r.flag.asset,{value:displayValue(r),license:r.flag.license,attribution:r.flag.attribution});const figure=node('figure',undefined,'dossier-flag'),img=node('img');img.src=r.flag.asset;img.alt=r.flag.alt||displayValue(r);img.addEventListener('error',()=>figure.remove(),{once:true});figure.append(img,markers(node('figcaption',r.flag.type||'Historical flag'),r.sourceIds));for(const q of r.qualifications){const text=present(r,q);if(text)figure.append(node('small',text,'fact-context'));}coverageNotes.set(r.id+'-flag',{note:'Flag evidence covers '+formatHistoricalPeriod(r.temporal)+'.',sourceIds:r.sourceIds});strip.append(figure);}parent.append(strip);}
    const glance=node('dl',undefined,'dossier-glance');
    for(const [category,label]of [['capital','Capital'],['population-statistics','Population'],['area-statistics','Area'],['density','Density'],['currency','Currency']]){const rows=by(category);if(rows.length===1){const r=rows[0],item=node('div'),dd=markers(node('dd',displayValue(r,{compact:true})),r.sourceIds);if(r.temporal.kind==='observation')dd.append(node('small',formatHistoricalPeriod(r.temporal),'fact-context'));item.append(node('dt',label),dd);glance.append(item);}}
    const status=by('political-institutional').find(r=>r.legacyField==='politicalStatus');if(status){const item=node('div');item.append(node('dt','State / regime'),markers(node('dd',displayValue(status)),status.sourceIds));item.append(node('small',detail(status),'fact-context'));glance.append(item);}if(glance.childNodes.length)parent.append(glance);
    if(by('overview').length){const s=section(parent,'Overview');for(const r of by('overview'))s.append(markers(node('p',present(r,displayValue(r))),r.sourceIds),node('small',detail(r),'fact-context'));}
    if(by('political-institutional').some(r=>r!==status)){const s=section(parent,'Government & Politics'),dl=node('dl');for(const r of by('political-institutional').filter(r=>r!==status))fact(dl,r,factLabel(r));s.append(dl);}
    if(by('leadership').length){const s=section(parent,'Leadership'),dl=node('dl');for(const r of by('leadership'))fact(dl,r,r.role||'Leader');s.append(dl);}
    const territory=['population-statistics','area-statistics','density'].flatMap(by);if(territory.length){const s=section(parent,'Population & Territory'),dl=node('dl');for(const r of territory)fact(dl,r,{'population-statistics':'Population','area-statistics':'Area',density:'Density'}[r.category]);s.append(dl);}
    const economy=[...by('currency'),...by('economy')];if(economy.length){const s=section(parent,'Economy'),dl=node('dl');for(const r of economy)fact(dl,r,r.category==='currency'?'Currency':r.metric||'Economic evidence');s.append(dl);}
    if(by('events-context').length){const s=section(parent,'Major Events'),ol=node('ol',undefined,'dossier-events');for(const r of by('events-context').sort((a,b)=>historicalInterval(a.temporal).lo-historicalInterval(b.temporal).lo)){const li=node('li');li.append(node('time',presentationPeriod(r,framework.entity)),markers(node('p',displayValue(r)),r.sourceIds));if(r.qualifications.length)li.append(node('small',r.qualifications.map(q=>present(r,q)).filter(Boolean).join(' · '),'fact-context'));ol.append(li);}if(ol.childNodes.length>8){const more=node('details',undefined,'dossier-more');more.append(node('summary','All '+ol.childNodes.length+' events'),ol);s.append(more);}else s.append(ol);}
    if(by('important-figures').length){const s=section(parent,'Important Figures'),grid=node('div',undefined,'dossier-figures');for(const r of by('important-figures')){const f=publicFigure(r.figure,r.value),card=node('article',undefined,'dossier-figure-card');card.append(markers(node('h3',f.name),r.sourceIds),node('p',f.categories.join(' · '),'figure-category'),node('small',presentationPeriod({temporal:{...f.lifespan,kind:'interval'}}),'fact-context'),node('p',f.contribution),node('p',f.relationship,'figure-association'),node('small',presentationPeriod(r,framework.entity),'fact-context'),node('p',f.activity,'figure-activity'));if(f.activity!==r.figure.activity)coverageNotes.set(r.id+'-activity',{note:r.figure.activity,sourceIds:r.sourceIds});if(r.mode==='dated-figure-context')coverageNotes.set(r.id+'-period',{note:'The association and achievement are documented for '+presentationPeriod(r,framework.entity)+', not an assertion of continued employment in '+year+'.',sourceIds:r.sourceIds});if(r.qualifications.length)card.append(node('small',r.qualifications.map(q=>present(r,q)).filter(Boolean).join(' · '),'fact-context'));grid.append(card);}s.append(grid);}
    if(by('relationships').length){const s=section(parent,'Historical Relationships'),dl=node('dl');for(const r of by('relationships'))fact(dl,r,r.type||r.role||'Historical relationship');s.append(dl);}
  }
  if(!resolved.entity&&!resolved.ambiguous&&!context.metadataError)content.append(node('p','This territory is shown on the historical map, but a detailed sourced dossier is not yet available for this year.','dossier-muted'));
  const boundary=node('details',undefined,'dossier-methodology');boundary.append(node('summary','Map & boundary context'));const dl=node('dl');fact(dl,{value:historicalYear(year),sourceIds:[],temporal:{kind:'interval'},qualifications:[]},'Selected year');fact(dl,{value:historicalYear(snapshotYear),sourceIds:['basemaps'],temporal:{kind:'interval'},qualifications:[]},'Boundary snapshot');boundary.append(dl,node('p','Boundary snapshots describe mapped geometry, not the precise dates of sovereignty or succession.','dossier-muted'));const navigation=node('div',undefined,'boundary-navigation');boundary.append(navigation);let checked=false;
  boundary.addEventListener('toggle',()=>{if(!boundary.open||checked||!features.length||!context.findBoundaries)return;checked=true;navigation.append(node('p','Checking mapped snapshots…','dossier-muted'));context.findBoundaries(stableId,context.boundaryIndex).then(result=>{if(!navigation.isConnected)return;navigation.replaceChildren();for(const [key,label]of [['previous','Previous mapped change'],['next','Next mapped change']]){const c=result[key];if(c){const b=node('button',label+' · '+historicalYear(c.year),'dossier-link');b.type='button';b.addEventListener('click',()=>context.goYear(c.year));navigation.append(b);}}if(result.incomplete)navigation.append(node('p','Some boundary files are unavailable.','dossier-muted'));}).catch(()=>navigation.replaceChildren(node('p','Boundary history is temporarily unavailable.','dossier-muted')));});content.append(boundary);
  sourceDetails=node('details',undefined,'dossier-methodology');if(coverageNotes.size){const notes=node('div',undefined,'dossier-coverage-notes');notes.append(node('h3','Coverage & interpretation notes'));for(const {note,sourceIds}of coverageNotes.values())notes.append(markers(node('p',note),sourceIds));sourceDetails.append(notes);}sourceDetails.append(node('summary','Sources & Methodology · '+used.size+' sources'),node('p','Historical records are resolved for the selected year. Observation and event dates remain distinct. Nearby evidence is explicitly dated; political transition years retain their separate frameworks. Exact end dates mark applicability boundaries; year and month dates retain their source precision.','dossier-muted'));const sources=node('ol',undefined,'dossier-sources');for(const[id,number]of used){const s=registry.get(id),li=node('li');li.id='dossier-source-'+id;li.value=number;const a=node('a',s.title);a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';li.append(a,node('small',[s.institution,s.publicationDate,s.license,s.attribution].filter(Boolean).join(' · '),'fact-context'));sources.append(li);}sourceDetails.append(sources);content.append(sourceDetails);
  if(assetCredits.size){sourceDetails.append(node('h3','Flag / symbol credits'));for(const credit of assetCredits.values())sourceDetails.append(node('p',[credit.value,credit.license,credit.attribution].join(' · '),'dossier-muted'));}
  container.replaceChildren(content);
}
