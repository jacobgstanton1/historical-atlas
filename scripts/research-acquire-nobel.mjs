// Official CC0 API adapter. Birthplace, nationality, countryNow and geometry never match entities.
import fs from 'node:fs';
import {readJSON,saveJSON,digest,readContext,isCLI} from './research-common.mjs';
import {fields,generateDossierJob,dateBounds,temporalBounds} from './research-comprehensive.mjs';
export const affiliationRules=[
 ['USA',1901,1960,'united-states'],['United Kingdom',1901,1960,'united-kingdom'],['France',1901,1960,'france-political-frameworks'],
 ['Germany',1901,1917,'germany-imperial-framework'],['Germany',1920,1932,'germany-weimar-framework'],['Germany',1934,1944,'germany-nazi-period'],
 ['Germany',1951,1960,'germany-federal-1949-framework','Göttingen|Goettingen|Heidelberg|Munich|München|Tübingen|Frankfurt|Freiburg|Kiel|Würzburg'],
 ['Sweden',1901,1960,'sweden-kingdom'],['Denmark',1901,1960,'denmark-post-kiel'],['Switzerland',1901,1960,'swiss-federal-state'],
 ['the Netherlands',1901,1960,'netherlands-kingdom'],['Belgium',1901,1960,'belgium-kingdom'],['Portugal',1901,1960,'portugal-political-frameworks'],
 ['Finland',1918,1960,'finland-independent'],['Spain',1901,1960,'spain-political-frameworks'],['Italy',1901,1921,'italy-liberal-monarchy-framework'],
 ['Italy',1948,1960,'italy-republican-1948-framework'],['Japan',1948,1960,'japan-postwar-framework'],['India',1901,1946,'british-raj'],
 ['USSR',1923,1960,'soviet-union'],['Russia',1907,1916,'russian-imperial-fundamental-laws-framework'],
 ['Austria',1901,1917,'austria-hungary-dual-framework'],['Austria',1919,1932,'austria-first-republic-framework'],['Austria',1934,1937,'austria-authoritarian-framework'],['Austria',1946,1960,'austria-second-republic-framework'],
 ['Hungary',1921,1943,'hungary-horthy-framework'],['Canada',1901,1930,'canada-1867-federal-framework'],['Canada',1932,1960,'canada-westminster-federal-framework'],
 ['Australia',1914,1938,'australia-prewestminster-federal-core'],['Australia',1945,1960,'australia-postadoption-federal-core'],
 ['Ireland',1923,1960,'ireland-independent'],['Czechoslovakia',1921,1937,'czechoslovakia-first-republic-framework'],['Czechoslovakia',1949,1960,'czechoslovakia-communist-constitutional-framework'],
 ['Tunisia',1901,1938,'tunisia-french-protectorate-framework']
];
export function extractNobelCandidates(pages,context,rules=affiliationRules){
 const rows=pages.flatMap(p=>p.laureates),ids=new Set(rows.map(l=>l.id));
 if(ids.size!==rows.length||rows.length!==pages[0].meta.count)throw Error('Incomplete/duplicate API pagination');
 const mapped=[],held=[],outOfScope=[];
 for(const l of rows)for(const p of l.nobelPrizes||[]){
  const y=Number(p.awardYear);if(y<1800||y>1960){outOfScope.push(l.id+'/'+p.awardYear+'/'+p.category.en);continue;}
  const key=l.id+'/'+p.awardYear+'/'+p.category.en;
  const common={key,laureateId:l.id,name:l.knownName?.en||l.fullName?.en,awardYear:p.awardYear,category:p.category.en,motivation:p.motivation?.en,prizeStatus:p.prizeStatus,birth:l.birth?.date,death:l.death?.date,dateAwarded:p.dateAwarded,apiRecordHash:digest(l),sourceURL:'https://api.nobelprize.org/2.1/laureate/'+l.id};
  if(p.dateAwarded&&Number(p.dateAwarded.slice(0,4))!==y){held.push({...common,reason:'Prize year and announcement year differ; no automatic affiliation dating'});continue;}
  if(!p.affiliations?.length){held.push({...common,reason:'No award-time institutional affiliation; birthplace/nationality not substituted'});continue;}
  try{dateBounds(common.birth);dateBounds(common.death);}catch{held.push({...common,reason:'Missing/unsupported lifespan precision'});continue;}
  const groups=new Map();
  for(const a of p.affiliations){const country=a.country?.en,city=a.city?.en;const match=rules.filter(([name,from,until,,pattern])=>country===name&&y>=from&&y<=until&&(!pattern||new RegExp(pattern).test(city||'')));
   if(match.length!==1){held.push({...common,affiliation:{name:a.name?.en,city,country},reason:'No unique independently reviewable historical entity/period rule'});continue;}
   const entityId=match[0][3],entity=context.db.entities.find(e=>e.id===entityId);if(!entity){held.push({...common,reason:'Unknown historical entity '+entityId});continue;}
   const t={kind:'interval',from:String(y),until:String(y),certainty:'exact'},b=temporalBounds(t),life=temporalBounds({kind:'interval',from:common.birth,until:common.death});
   if(b.lo<life.lo||b.hi>life.hi){held.push({...common,reason:'Whole-year relevance crosses lifespan boundary; requires narrower evidence'});continue;}
   const ex=entity.existence; if(ex){const eb=temporalBounds({kind:'interval',from:ex.validFrom||String(y),until:ex.validUntil||String(y)});if(b.lo<eb.lo||b.hi>eb.hi){held.push({...common,reason:'Outside accepted entity coverage envelope'});continue;}}
   const value={name:(a.name?.en||'').replace(/\s*\(now[^)]*\)/gi,''),city,country};if(!value.name||!city||!country){held.push({...common,reason:'Incomplete original affiliation location'});continue;}
   if(!groups.has(entityId))groups.set(entityId,[]);groups.get(entityId).push(value);
  }
  for(const [entityId,affiliations]of groups)mapped.push({...common,entityId,affiliations:[...new Map(affiliations.map(a=>[digest(a),a])).values()]});
 }
 return {mapped,held,outOfScopeCount:outOfScope.length,pagination:{records:rows.length,distinctIds:ids.size,expected:pages[0].meta.count},rulesHash:digest(rules)};
}
export function nobelPackages(result,context){
 const byEntity=new Map();for(const r of result.mapped){if(!byEntity.has(r.entityId))byEntity.set(r.entityId,[]);byEntity.get(r.entityId).push(r);}
 return [...byEntity].sort(([a],[b])=>a.localeCompare(b)).map(([entityId,records])=>{
  const years=records.map(r=>Number(r.awardYear)),job=generateDossierJob(entityId,{from:String(Math.min(...years)),until:String(Math.max(...years))},context);
  const source={id:'scale-nobel-official-api',title:'Nobel Prize official API2.1: historical laureates, prizes and award-time affiliations',institution:'Nobel Prize Outreach',url:'https://api.nobelprize.org/2.1/laureates',accessed:'2026-10-02',usage:'Award-year institutional affiliation and prize metadata, not citizenship, birthplace-derived nationality or continuous employment.',kind:'institutional-structured-data',license:'CC0 1.0'};
  const claims=records.map(r=>{const temporal={kind:'interval',from:r.awardYear,until:r.awardYear,certainty:'exact'},name=r.name;
   return {id:'scale-nobel-'+entityId+'-'+digest(r.key).slice(0,16),category:'important-figures',value:{name,prizeCategory:r.category,prizeYear:r.awardYear,prizeStatus:r.prizeStatus,affiliations:r.affiliations},entityId,temporal,scope:{id:entityId+'-award-time-institutions',description:'Named institution/location at the time of the prize; entity association is contextual, not a nationality or sovereignty claim.',relationship:'same'},sourceIds:[source.id],evidence:[{sourceId:source.id,locator:'laureate/'+r.laureateId+'; nobelPrizes[awardYear='+r.awardYear+',category='+r.category+']; affiliations/birth/death',note:'Official API original historical affiliation country/city and prize fields. Record SHA256 '+r.apiRecordHash+'. No countryNow or birthplace mapping.',precision:'year',temporal,interpretation:'contextual'}],status:'supported',risks:[],qualifications:['Award-year context only; no full-year employment interval or modern-nationality inference. Multiple institutions in the same entity grouped into one meaningful person/prize record.'],figure:{personId:'nobel-'+r.laureateId,name,categories:[r.category==='Physiology or Medicine'?'medical scientist':r.category.toLowerCase()+' researcher'],lifespan:{from:r.birth,until:r.death},relationship:r.affiliations.map(a=>a.name+' ('+a.city+', '+a.country+')').join('; ')+'; official affiliation at award time.',activity:'Nobel Prize '+r.category+', '+r.awardYear+'; status recorded as '+r.prizeStatus+'.',contribution:r.motivation||'Officially recognized work in '+r.category},origin:{kind:'bulk-candidate',reference:r.sourceURL,sourceIdentifier:r.key}};});
  const pkg={schemaVersion:2,id:'scale-nobel-'+entityId,jobId:job.id,entityId,mapIds:job.mapIds,worker:{id:'official-nobel-deterministic-adapter',assignmentType:'comprehensive-entity-period'},productionFingerprint:job.productionFingerprint,chronology:{calendar:'proleptic-gregorian',yearConvention:'astronomical'},period:job.period,claims,sources:[source],investigation:fields.map(category=>({category,status:category==='important-figures'?'partial':'unresolved',rationale:category==='important-figures'?'Computational supplement to dossier: reviewed official award-time institutional associations, not exhaustive people coverage.':'Bulk adapter does not establish this category; existing dossier and dedicated research gaps remain separate.',consultedSourceIds:category==='important-figures'?[source.id]:[],gaps:[category==='important-figures'?'Non-Nobel figures and non-award-year activity remain unfilled.':'Requires complementary existing/deep dossier evidence; no blanket completeness.']})),conflicts:[],provenance:{createdAt:'2026-10-02',method:'Official CC0 API bulk acquisition; complete pagination, local1800–1960filter, explicit historical affiliation rules, independent mapping/source review, serial integration.',preservedPackageHashes:[]}};
  return {pkg,job};
 });
}
if(isCLI(import.meta.url)){
 const pages=['research/scale-01/cache/nobel-laureates.json','research/scale-01/cache/nobel-laureates-page2.json'].map(readJSON),context=readContext(),result=extractNobelCandidates(pages,context);
 saveJSON('research/scale-01/nobel/acquisition.json',result);saveJSON('research/scale-01/nobel/rules.json',affiliationRules);
 saveJSON('research/scale-01/nobel/cache-manifest.json',{provider:'Nobel Prize official API2.1',license:'CC0 1.0',licenseURL:pages[0].meta.license,retrievedAt:'2026-10-02',pages:pages.map(p=>({metadata:p.meta,hash:digest(p)})),termsHash:digest(fs.readFileSync('research/scale-01/cache/nobel-terms.html','utf8'))});
 for(const {pkg,job}of nobelPackages(result,context)){saveJSON('research/scale-01/nobel/packages/'+pkg.entityId+'.json',pkg);saveJSON('research/scale-01/nobel/jobs/'+pkg.entityId+'.json',job);}
 console.log(JSON.stringify({mappedClaims:result.mapped.length,heldRecords:result.held.length,entities:new Set(result.mapped.map(r=>r.entityId)).size,pagination:result.pagination}));
}
