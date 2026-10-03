import {canonicalSections,communityIds,politicalIds,missingText,dataState,stateText,isExchange,exchangeGroups} from './dossier-layout.js?v=canonical-cleanup1';
import {entityTitle,splitPresentation,presentationPeriod,factLabel,publicFigure,headerValue} from './dossier-presentation.js';
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
      confidence:f.confidence,dataState:f.dataState,unit:f.unit,metric:f.metric,observationType:f.observationType,flag,type:field==='predecessors'?'Preceded by':field==='successors'?'Succeeded by':f.type,mapIds:f.mapIds,legacyField:field});
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
  const markers=(element,ids=[])=>{
    const valid=[...new Set(ids)].filter(id=>{const source=registry.get(id);return source&&/^https:\/\//.test(source.url||'');});
    for(const id of valid)if(!used.has(id))used.set(id,used.size+1);
    const link=(id,text)=>{const a=node('a',text,'fact-source');a.href='#dossier-source-'+id;a.setAttribute('aria-label','Source '+used.get(id)+': '+registry.get(id).title);a.addEventListener('click',()=>{if(sourceDetails)sourceDetails.open=true;});return a;};
    if(valid.length===1)element.append(' ',link(valid[0],String(used.get(valid[0]))));
    else if(valid.length>1){const group=node('details',undefined,'citation-group'),summary=node('summary',['h1','figcaption'].includes(element.tagName.toLowerCase())?String(used.get(valid[0]))+'+':'Sources ('+valid.length+')','fact-source'),links=node('span',undefined,'citation-links');summary.setAttribute('aria-label',valid.length+' supporting sources');for(const id of valid)links.append(link(id,registry.get(id).title));group.append(summary,links);element.append(' ',group);}return element;
  };
  const sections=new Map();let currentFramework='';
  const canonical=!communityIds.has(stableId)&&(politicalIds.has(stableId)||!!resolved.entity||!!resolved.ambiguous);
  const empty=(parent,state='missing',text,record)=>{const p=node('p',text||stateText[state]||missingText,'dossier-empty');p.dataset.state=state;parent.append(p);if(record?.explanation||record?.note)parent.append(markers(node('small',record.explanation||record.note,'fact-context'),record.sourceIds));};
  const section=(parent,title)=>{let s=sections.get(title);if(!s){s=node('section',undefined,'dossier-section');s.dataset.section=title;s.append(node('h2',title));sections.set(title,s);parent.append(s);}if(currentFramework&&s.dataset.lastFramework!==currentFramework){s.append(node('h3',currentFramework,'dossier-framework-title'));s.dataset.lastFramework=currentFramework;}return s;};
  const groupRecords=resolved.ambiguous?resolved.identityPeriods||[]:[resolved];
  const titleRecords=resolved.entity?resolveDossierRecords(resolved,rich,year,registry,{mappings:resolved.mappings||[]}):[],title=entityTitle(resolved,titleRecords,savedName),name=title.text;
  const header=node('header',undefined,'dossier-header'),heading=markers(node('h1',name),title.sourceIds.length?title.sourceIds:['basemaps']);heading.id='territory-name';header.append(node('div','Historical dossier','inspector-kicker'),heading);
  const date=node('p',historicalYear(year),'dossier-snapshot');date.setAttribute('aria-label','Selected historical year '+historicalYear(year));header.append(date);
  if(year!==snapshotYear||context.boundaryLoadFailed)header.append(node('p','Boundary map: '+historicalYear(snapshotYear)+(context.boundaryLoadFailed?' · requested boundaries unavailable':' · nearest available snapshot'),'dossier-boundary-note'));
  header.dataset.section='Identity Header';content.append(header);
  if(!features.length)content.append(node('p','This identity is absent from the displayed boundary snapshot. No successor has been substituted.','dossier-notice'));
  if(resolved.calendarYear?.isTransition)content.append(node('p',resolved.ambiguous?'This year spans several historical identities. Each framework and its dated evidence are shown separately.':'A political transition or partial dated framework occurs during this year. Dates below qualify which part of the year each record describes.','dossier-notice'));
  if(context.richError)content.append(node('p','Additional dossier records are temporarily unavailable. Available historical evidence is shown below.','dossier-notice'));
  if(context.metadataError)content.append(node('p','Historical identity records are temporarily unavailable. The boundary map name is retained.','dossier-notice'));
  const present=(r,text)=>{const p=splitPresentation(text);for(const note of p.notes){const key=note+'|'+r.sourceIds.join(',');coverageNotes.set(key,{note,sourceIds:r.sourceIds});}return p.text;};
  const detail=r=>[presentationPeriod(r,r.presentationEntity),r.mode==='nearby-observation'?'Earlier measurement · dated context for the selected '+historicalYear(year)+' snapshot':'',['population-statistics','area-statistics','density','economy'].includes(r.category)?present(r,r.scope?.description||''):'',...(r.qualifications||[]).map(q=>present(r,q))].filter(Boolean).join(' · ');
  const humanLabel=value=>value?value.replaceAll('-', ' ').replace(/^./,c=>c.toUpperCase()):'Historical record';
  const fact=(parent,r,label)=>{const row=node('div',undefined,'dossier-row'),dd=markers(node('dd',present(r,displayValue(r))),r.sourceIds);row.dataset.state=dataState(r);if(dataState(r)==='uncertain')dd.prepend(node('span','Uncertain · ','dossier-state'));if(dataState(r)==='not-applicable'){dd.replaceChildren(node('span','Not applicable','dossier-state'));markers(dd,r.sourceIds);}if(detail(r)){if(isExchange(r)){dd.append(node('small',presentationPeriod(r,r.presentationEntity),'fact-context'));const notes=node('details',undefined,'quotation-notes');notes.append(node('summary','Quotation scope & notes'),node('small',detail(r),'fact-context'));dd.append(notes);}else dd.append(node('small',detail(r),'fact-context'));}row.append(node('dt',humanLabel(label||r.role||r.metric)),dd);parent.append(row);};
  const allRecords=groupRecords.filter(f=>f.entity).flatMap(f=>resolveDossierRecords(f,rich,year,registry,{mappings:f.mappings||[]}).map(r=>({...r,presentationEntity:f.entity})));
  if(canonical){
    // A short supported descriptor supplements the title; detailed facts remain below.
    if(!resolved.ambiguous){
      const descriptor=allRecords.find(r=>r.category==='political-institutional'&&['governments','politicalStatus'].includes(r.legacyField)&&dataState(r)==='supported'&&displayValue(r).length<=120);
      if(descriptor){const text=present(descriptor,displayValue(descriptor));if(text)header.append(markers(node('p',text,'dossier-status-line'),descriptor.sourceIds));}
    }
    const flagBox=node('div',undefined,'dossier-flags');flagBox.dataset.field='historical-flag';
    const flags=allRecords.filter(r=>r.category==='historical-flag'&&safeFlag(r.flag));
    if(!flags.length)empty(flagBox,'missing','Flag / symbol not yet documented');
    for(const r of flags){assetCredits.set(r.flag.asset,{value:displayValue(r),license:r.flag.license,attribution:r.flag.attribution});const figure=node('figure',undefined,'dossier-flag'),img=node('img');img.src=r.flag.asset;img.alt=r.flag.alt||displayValue(r);img.addEventListener('error',()=>{img.hidden=true;empty(figure,'missing','Historical flag image unavailable');},{once:true});figure.append(img,markers(node('figcaption',r.flag.type||'Historical flag'),r.sourceIds));figure.dataset.state=dataState(r);if(dataState(r)==='uncertain')figure.append(node('span','Uncertain','dossier-state'));for(const q of r.qualifications)coverageNotes.set((r.id||r.flag.asset)+'-flag-'+q,{note:q,sourceIds:r.sourceIds});coverageNotes.set(r.id+'-flag',{note:'Flag evidence covers '+formatHistoricalPeriod(r.temporal)+'.',sourceIds:r.sourceIds});flagBox.append(figure);}header.append(flagBox);
    const glance=node('dl',undefined,'dossier-glance');
    for(const [category,label]of [['capital','Capital'],['population-statistics','Population'],['area-statistics','Area'],['density','Population density'],['currency','Currency'],['political-institutional','Government / state type']]){
      const matches=allRecords.filter(r=>r.category===category&&(category!=='political-institutional'||r.legacyField==='politicalStatus'||['government','state-type','government-system'].includes(r.metric)||r.legacyField==='governments'));
      const preferred=category==='political-institutional'&&matches.some(r=>r.legacyField==='politicalStatus')?matches.filter(r=>r.legacyField==='politicalStatus'):matches;
      const rows=category==='currency'?[...preferred].sort((a,b)=>historicalInterval(b.temporal).lo-historicalInterval(a.temporal).lo).filter((r,i,a)=>a.findIndex(x=>displayValue(x)===displayValue(r))===i):preferred;
      const item=node('div');item.dataset.field=category;item.append(node('dt',label));
      if(!rows.length){const explicit=resolved.fieldStates?.[category],state=dataState(explicit);const dd=node('dd',state==='missing'?'Not yet documented':stateText[state]||'Unavailable','dossier-empty');dd.dataset.state=state;dd.setAttribute('aria-label',stateText[state]||missingText);item.append(dd);}else for(const r of rows){const dd=markers(node('dd',headerValue(r,displayValue(r,{compact:true}))),r.sourceIds);dd.dataset.state=dataState(r);if(dataState(r)==='uncertain')dd.prepend(node('span','Uncertain · ','dossier-state'));if(r.temporal.kind==='observation'||rows.length>1)dd.append(node('small',presentationPeriod(r,r.presentationEntity),'fact-context'));item.append(dd);if(category==='capital')coverageNotes.set((r.id||displayValue(r))+'-capital',{note:[displayValue(r),detail(r),r.scope?.description].filter(Boolean).join(' · '),sourceIds:r.sourceIds});}glance.append(item);
    }header.append(glance);
  }
  for(const framework of groupRecords){
    if(!framework.entity||!canonical)continue;
    const parent=content;currentFramework=resolved.ambiguous?entityTitle(framework,[],savedName).text+' · '+(framework.mappings||[]).map(period).join('; '):'';
    const records=resolveDossierRecords(framework,rich,year,registry,{mappings:framework.mappings||[]}),by=category=>records.filter(r=>r.category===category);
    for(const r of records)r.presentationEntity=framework.entity;
    const status=by('political-institutional').find(r=>r.legacyField==='politicalStatus');
    const identities=by('identity');if(identities.length){const s=section(parent,'Government & Politics'),dl=node('dl');for(const r of identities)fact(dl,r,'Official / historical name');s.append(dl);}
    if(by('overview').length){const s=section(parent,'Overview');for(const r of by('overview'))s.append(markers(node('p',present(r,displayValue(r))),r.sourceIds),node('small',detail(r),'fact-context'));}
    if(by('political-institutional').length){const s=section(parent,'Government & Politics'),dl=node('dl');for(const r of by('political-institutional'))fact(dl,r,factLabel(r));s.append(dl);}
    if(by('leadership').length){const s=section(parent,'Leadership'),grid=node('div',undefined,'dossier-offices');for(const r of by('leadership')){const card=node('article',undefined,'dossier-office');card.dataset.state=dataState(r);if(dataState(r)==='uncertain')card.append(node('span','Uncertain','dossier-state'));card.append(node('h3',r.role||'Recorded officeholder'),markers(node('p',displayValue(r)),r.sourceIds),node('small',detail(r),'fact-context'));grid.append(card);}s.append(grid);}
    const territory=['population-statistics','area-statistics','density'].flatMap(by);if(territory.length){const s=section(parent,'Population & Territory'),dl=node('dl');for(const r of territory)fact(dl,r,{'population-statistics':'Population','area-statistics':'Area',density:'Density'}[r.category]);s.append(dl);}
    const economy=[...by('currency'),...by('economy')];if(economy.length){const s=section(parent,'Economy'),dl=node('dl');for(const r of economy.filter(r=>!isExchange(r)))fact(dl,r,r.category==='currency'?'Currency':r.metric||'Economic evidence');if(dl.childNodes.length)s.append(dl);
      const groups=exchangeGroups(economy,year);if(groups.length){const box=node('div',undefined,'dossier-exchange');box.append(node('h3','Exchange-rate evidence'));const primary=node('dl');for(const g of groups)fact(primary,g.primary,g.label);box.append(primary);const additional=groups.reduce((n,g)=>n+g.additional.length,0);if(additional){const more=node('details',undefined,'dossier-more exchange-additional');more.append(node('summary','Additional historical quotations ('+additional+')'));for(const g of groups.filter(g=>g.additional.length)){more.append(node('h4',g.label));const series=node('dl');for(const r of g.additional)fact(series,r,presentationPeriod(r,r.presentationEntity));more.append(series);}box.append(more);}s.append(box);}}

    if(by('events-context').length){const s=section(parent,'Major Events'),ol=node('ol',undefined,'dossier-events');for(const r of by('events-context').sort((a,b)=>historicalInterval(a.temporal).lo-historicalInterval(b.temporal).lo)){const li=node('li');li.append(node('time',presentationPeriod(r,framework.entity)),markers(node('p',displayValue(r)),r.sourceIds));if(r.qualifications.length)li.append(node('small',r.qualifications.map(q=>present(r,q)).filter(Boolean).join(' · '),'fact-context'));ol.append(li);}if(ol.childNodes.length>8){const more=node('details',undefined,'dossier-more');more.append(node('summary','All '+ol.childNodes.length+' events'),ol);s.append(more);}else s.append(ol);}
    if(by('important-figures').length){const s=section(parent,'Important Figures'),grid=node('div',undefined,'dossier-figures');for(const r of by('important-figures')){const f=publicFigure(r.figure,r.value),card=node('article',undefined,'dossier-figure-card');card.append(markers(node('h3',f.name),r.sourceIds),node('p',f.categories.join(' · '),'figure-category'),node('small',presentationPeriod({temporal:{...f.lifespan,kind:'interval'}}),'fact-context'),node('p',f.contribution),node('p',f.relationship,'figure-association'),node('small',presentationPeriod(r,framework.entity),'fact-context'),node('p',f.activity,'figure-activity'));if(f.activity!==r.figure.activity)coverageNotes.set(r.id+'-activity',{note:r.figure.activity,sourceIds:r.sourceIds});if(r.mode==='dated-figure-context')coverageNotes.set(r.id+'-period',{note:'The association and achievement are documented for '+presentationPeriod(r,framework.entity)+', not an assertion of continued employment in '+year+'.',sourceIds:r.sourceIds});if(r.qualifications.length)card.append(node('small',r.qualifications.map(q=>present(r,q)).filter(Boolean).join(' · '),'fact-context'));grid.append(card);}s.append(grid);}
    if(by('relationships').length){const s=section(parent,'Historical Relationships'),dl=node('dl');for(const r of by('relationships'))fact(dl,r,r.type||r.role||'Historical relationship');s.append(dl);}
  }
  currentFramework='';
  if(canonical){
    const contextual=allRecords.flatMap(r=>(r.qualifications||[]).filter(q=>/disput|occupation|civil war|government in exile|competing government|recognition|sovereignty uncertainty/i.test(q)).map(value=>({...r,value})));
    if(contextual.length){const s=section(content,'Historical Context & Status');for(const r of contextual)s.append(markers(node('p',present(r,displayValue(r))),r.sourceIds));}
    for(const title of canonicalSections){const s=section(content,title);if(s.childNodes.length===1){s.classList.add('is-empty');const category={'Overview':'overview','Government & Politics':'political-institutional','Leadership':'leadership','Population & Territory':'population-statistics','Economy':'economy','Major Events':'events-context','Important Figures':'important-figures','Historical Relationships':'relationships','Historical Context & Status':'historical-context'}[title],state=dataState(resolved.fieldStates?.[category]);empty(s,state,undefined,resolved.fieldStates?.[category]);}content.append(s);}
  }
  if(!resolved.entity&&!resolved.ambiguous&&!context.metadataError)content.append(node('p','This territory is shown on the historical map, but a detailed sourced dossier is not yet available for this year.','dossier-muted'));
  const boundary=node('details',undefined,'dossier-methodology');boundary.append(node('summary','Map & boundary context'));const dl=node('dl');fact(dl,{value:historicalYear(year),sourceIds:[],temporal:{kind:'interval'},qualifications:[]},'Selected year');fact(dl,{value:historicalYear(snapshotYear),sourceIds:['basemaps'],temporal:{kind:'interval'},qualifications:[]},'Boundary snapshot');boundary.append(dl,node('p','Boundary snapshots describe mapped geometry, not the precise dates of sovereignty or succession.','dossier-muted'));const navigation=node('div',undefined,'boundary-navigation');boundary.append(navigation);let checked=false;
  boundary.addEventListener('toggle',()=>{if(!boundary.open||checked||!features.length||!context.findBoundaries)return;checked=true;navigation.append(node('p','Checking mapped snapshots…','dossier-muted'));context.findBoundaries(stableId,context.boundaryIndex).then(result=>{if(!navigation.isConnected)return;navigation.replaceChildren();for(const [key,label]of [['previous','Previous mapped change'],['next','Next mapped change']]){const c=result[key];if(c){const b=node('button',label+' · '+historicalYear(c.year),'dossier-link');b.type='button';b.addEventListener('click',()=>context.goYear(c.year));navigation.append(b);}}if(result.incomplete)navigation.append(node('p','Some boundary files are unavailable.','dossier-muted'));}).catch(()=>navigation.replaceChildren(node('p','Boundary history is temporarily unavailable.','dossier-muted')));});
  sourceDetails=node('details',undefined,'dossier-methodology');if(coverageNotes.size){const notes=node('div',undefined,'dossier-coverage-notes');notes.append(node('h3','Coverage & interpretation notes'));for(const {note,sourceIds}of coverageNotes.values())notes.append(markers(node('p',note),sourceIds));sourceDetails.append(notes);}sourceDetails.append(node('summary','Sources & Methodology · '+used.size+' sources'),node('p','Historical records are resolved for the selected year. Observation and event dates remain distinct. Nearby evidence is explicitly dated; political transition years retain their separate frameworks. Exact end dates mark applicability boundaries; year and month dates retain their source precision.','dossier-muted'));const sources=node('ol',undefined,'dossier-sources');for(const[id,number]of used){const s=registry.get(id),li=node('li');li.id='dossier-source-'+id;li.value=number;const a=node('a',s.title);a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';li.append(a,node('small',[s.institution,s.publicationDate,s.license,s.attribution].filter(Boolean).join(' · '),'fact-context'));sources.append(li);}sourceDetails.append(sources,boundary);content.append(sourceDetails);sourceDetails.dataset.section='Sources & Methodology';
  if(assetCredits.size){sourceDetails.append(node('h3','Flag / symbol credits'));for(const credit of assetCredits.values())sourceDetails.append(node('p',[credit.value,credit.license,credit.attribution].join(' · '),'dossier-muted'));}
  container.replaceChildren(content);
}
