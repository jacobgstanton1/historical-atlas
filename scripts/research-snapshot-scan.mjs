// Offline snapshot coverage. Does not change runtime resolution or historical data.
import fs from 'node:fs';
import path from 'node:path';
import {fields,dateBounds,temporalBounds} from './research-comprehensive.mjs';
import {root,readContext,readJSON,saveJSON,digest,isCLI} from './research-common.mjs';
import {inspectFlagAsset} from './research-flags.mjs';
import {qualifiedCompatibility,assessCompatibility} from './research-crosswalk.mjs';
export function readSnapshotConfig(directory=root){
 const text=fs.readFileSync(path.join(directory,'app.js'),'utf8');
 const block=text.match(/const\s+SNAPSHOTS\s*=\s*\[([\s\S]*?)\];/);
 if(!block)throw Error('Authoritative SNAPSHOTS configuration not found.');
 const entry=/\{\s*year:\s*(-?\d+),\s*file:\s*['"]([^'"]+)['"]\s*\}/g;
 const snapshots=[...block[1].matchAll(entry)].map(m=>({year:Number(m[1]),file:m[2]}));
 if(block[1].replace(entry,'').replace(/[\s,]/g,''))throw Error('Unparsed authoritative snapshot entry.');
 if(!snapshots.length||new Set(snapshots.map(s=>s.year)).size!==snapshots.length)throw Error('Invalid or duplicate snapshot configuration.');
 return snapshots;
}
const yearDate=y=>y<0?'-'+String(-y).padStart(6,'0'):y>9999?'+'+String(y).padStart(6,'0'):String(y).padStart(4,'0');
const unique=a=>[...new Set(a)].sort();
const overlaps=(a,b)=>a.lo<b.hi&&b.lo<a.hi;
const legacyFields={identity:['names'],'political-institutional':['politicalStatus','governments'],leadership:['leaders'],capital:['capitals'],currency:['currencies'],'historical-flag':['flags'],'population-statistics':['population'],'area-statistics':['area'],density:['density'],economy:['economy'],'events-context':['events'],relationships:['relationships','predecessors','successors'],overview:['descriptions'],'important-figures':['importantFigures']};
const core=['identity','political-institutional','leadership','capital'];
function bounds(t){if(t.kind==='interval'&&(!t.from||!t.until)){const b=t.until&&dateBounds(t.until);return{lo:t.from?dateBounds(t.from).lo:-Infinity,hi:b?(b.precision==='day'?b.lo:b.hi):Infinity};}return temporalBounds(t);}
function legacyClaim(e,field,r){
 const category=Object.keys(legacyFields).find(c=>legacyFields[c].includes(field));
 let temporal;
 if(r.asOf||r.observationDate)temporal={kind:'observation',observationDate:r.asOf||r.observationDate};
 else if(r.date)temporal={kind:'event',date:r.date};
 else {const rel=r.relevance||r.figure?.relevance||r;temporal={kind:'interval',from:rel.validFrom||rel.from,until:rel.validUntil||rel.until};}
 const signature={entityId:e.id,category,value:r.value??r.text??r.name??r.asset,temporal,role:r.role,metric:r.metric};
 return{...signature,id:'legacy-'+digest(signature),sourceIds:r.sourceIds||[],status:['low','inferred','speculative','uncertain'].includes(r.confidence)?'review':'supported',scope:r.scope,scopeRelationship:r.scopeRelationship||r.snapshotCompatibility?.scopeRelationship,temporal,legacy:true,field,flag:category==='historical-flag'?{asset:r.asset,license:r.license,attribution:r.attribution,sha256:r.assetSha256}:undefined,reviewRequired:r.reviewStatus==='required'||r.reviewStatus==='unresolved',snapshotCompatibility:r.snapshotCompatibility};
}
export function fullYear(c,year){
 if(c.temporal.kind!=='interval')return true;
 const y=dateBounds(yearDate(year));let b=bounds(c.temporal);
 // A certified research subset is not a historical introduction/dissolution date.
 // Keep source precision, and require EVERY cited interval to prove the whole year.
 // Existing unmarked records and source transition boundaries remain conservative.
 if(c.origin?.temporalBasis==='bounded-research-subset'&&b.lo<=y.lo&&b.hi>=y.hi&&
    c.evidence?.length&&c.evidence.every(e=>e.temporal?.kind==='interval'&&
      e.temporal.certainty==='exact'&&fullYear({temporal:e.temporal},year)))return true;
 // Unknown endpoint precision stays partial at that boundary; never invent a day.
 const from=c.temporal.from,until=c.temporal.until;
 if(from&&dateBounds(from).precision!=='day')b={...b,lo:dateBounds(from).hi};
 if(until&&dateBounds(until).precision!=='day')b={...b,hi:dateBounds(until).lo};
 return b.lo<=y.lo&&b.hi>=y.hi;
}
// Combine only documented intervals for the same field/office and territorial scope.
// Conservative inner bounds leave coarse endpoints and real gaps unresolved.
export function collectiveFullYear(claims,year){
 if(claims.some(c=>fullYear(c,year)))return true;
 const allowed=new Set(['identity','political-institutional','leadership','capital','currency','historical-flag','relationships']);
 const groups=new Map(),y=dateBounds(yearDate(year));
 for(const c of claims){if(c.temporal.kind!=='interval'||!allowed.has(c.category))continue;
  const key=JSON.stringify([c.category,c.field||'',c.role||'',c.metric||'',c.scope?.id||'']);
  let b=bounds(c.temporal);if(c.temporal.from&&dateBounds(c.temporal.from).precision!=='day')b={...b,lo:dateBounds(c.temporal.from).hi};if(c.temporal.until&&dateBounds(c.temporal.until).precision!=='day')b={...b,hi:dateBounds(c.temporal.until).lo};
  if(b.lo>=b.hi)continue;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(b);
 }
 for(const list of groups.values()){let end=y.lo;for(const b of list.sort((a,b)=>a.lo-b.lo||a.hi-b.hi)){if(b.hi<=end)continue;if(b.lo>end)break;end=b.hi;if(end>=y.hi)return true;}}
 return false;
}
function match(c,year,options){
 const t=c.temporal,y=dateBounds(yearDate(year));
 if(t.kind==='interval')return overlaps(bounds(t),y)?{mode:'applicable',actualTemporal:t}:null;
 const actual=t.observationDate||t.date,b=dateBounds(actual),distance=year-b.year;
 if(distance<0)return null; // No future statistics/events in a selected snapshot.
 if(overlaps(b,y))return{mode:t.kind==='observation'?'observation':'event',actualTemporal:t};
 if(c.category==='area-statistics'&&c.metric==='Area (derived mapped geometry)')return null;
 const window=t.kind==='observation'?options.observationWindowYears:options.contextWindowYears;
 if(distance>window)return null;
 return{mode:t.kind==='observation'?'nearby-observation':'dated-context',actualTemporal:t};
}
function strong(c,sources){return c.sourceIds.length>0&&c.sourceIds.every(id=>{const s=sources.get(id);return s?.title&&s?.institution&&/^https?:\/\//.test(s.url||'');});}
function compatible(c){return c.scope?.relationship==='same'||c.scopeRelationship==='same';}
function conflict(a,b){
 if(a.category!==b.category||digest(a.value??null)===digest(b.value??null)||a.temporal.kind!=='interval'||b.temporal.kind!=='interval'||!overlaps(bounds(a.temporal),bounds(b.temporal)))return false;
 if(a.category==='leadership')return !!a.role&&a.role===b.role;
 if(a.category==='capital'||a.category==='currency')return (a.role||a.metric||'default')===(b.role||b.metric||'default');
 return a.category==='political-institutional'&&a.legacy&&b.legacy&&a.field===b.field&&a.field==='governments';
}
export function datedMappingReviewAllows(review,mappings,entityIds,year,sources){
 if(review?.status!=='mapping-review')return true;
 if(entityIds.length!==1)return false;
 const id=entityIds[0];
 return (review.intervals||[]).some(r=>r.entityId===id&&r.sourceIds?.length&&r.sourceIds.every(s=>sources.has(s))&&
   fullYear({temporal:{kind:'interval',from:r.validFrom,until:r.validUntil}},year)&&
   mappings.some(m=>m.entityId===id&&m.sourceIds?.length&&m.sourceIds.every(s=>sources.has(s))));
}
export function scanSnapshots(context,{snapshots,entityIds,rich,queue,eligibility,observationWindowYears=5,contextWindowYears=5}={}){
 snapshots=snapshots||readSnapshotConfig(context.directory||root);
 if(!snapshots.length||snapshots.some(s=>!Number.isInteger(s.year))||new Set(snapshots.map(s=>s.year)).size!==snapshots.length)throw Error('Unique integer snapshots required.');
 if(!Number.isInteger(observationWindowYears)||observationWindowYears<0||!Number.isInteger(contextWindowYears)||contextWindowYears<0)throw Error('Nonnegative integer contextual windows required.');
 const selected=entityIds&&new Set(entityIds),entities=new Map(context.db.entities.map(e=>[e.id,e]));
 if(selected&&[...selected].some(id=>!entities.has(id)))throw Error('Unknown entity selection.');
 const file=path.join(context.directory||root,'data/comprehensive-dossiers.json');
 rich=rich||context.rich||(fs.existsSync(file)?readJSON(file):{packages:[]});
 const sources=new Map([...context.registry.sources,...rich.packages.flatMap(p=>p.sources||[])].map(s=>[s.id,s]));
 const ledgerPath=path.join(context.directory||root,'research/completion/occurrence-eligibility.json');
 const ledger=eligibility|| (fs.existsSync(ledgerPath)?readJSON(ledgerPath):{occurrences:[]});
 const allClaims=new Map(),byEntity=new Map(),errors=[];
 const add=c=>{try{bounds(c.temporal);if(c.temporal.kind==='interval'&&!c.temporal.from&&!c.temporal.until)throw Error('Undated');}catch{errors.push({claimId:c.id,entityId:c.entityId,category:c.category,reason:'Invalid or absent temporal bounds'});return;}const temporal={...c.temporal};delete temporal.certainty;const key=digest({entityId:c.entityId,category:c.category,value:c.value,temporal,role:c.role,metric:c.metric});if(!allClaims.has(key)){allClaims.set(key,c);if(!byEntity.has(c.entityId))byEntity.set(c.entityId,[]);byEntity.get(c.entityId).push(c);}};
 // Rich records first: production store contains only serially accepted claims.
 for(const p of rich.packages)for(const c of p.claims||[])if(entities.has(c.entityId))add(c);else errors.push({claimId:c.id,reason:'Orphan historical entity'});
 for(const e of entities.values())for(const fs of Object.values(legacyFields))for(const field of fs)for(const r of e[field]||[])add(legacyClaim(e,field,r));
 const rows=[],rawReview=[],presence=new Map(),excluded=new Set(),configurationWarnings=[];
 for(const s of [...snapshots].sort((a,b)=>a.year-b.year)){
  const y=dateBounds(yearDate(s.year));let occurrences=0;
  for(const raw of context.manifest.identities){
   if(!(raw.snapshotYears||raw.occurrences?.map(o=>o.year)||[]).includes(s.year))continue;
   occurrences++;
   const reviewed=ledger.occurrences.find(r=>r.mapId===raw.stableMapId&&r.snapshotYear===s.year);
   if(reviewed){const certificate=readJSON(path.join(context.directory||root,reviewed.review.path));if(digest(certificate)!==reviewed.review.hash||certificate.reviewer!==reviewed.review.reviewer||reviewed.review.decision!=='accepted'||reviewed.sourceIds.some(id=>!sources.has(id)))throw Error('Uncertified occurrence eligibility');}
   const classification=reviewed?.classification||raw.classification?.classification||'unresolved';
   if(classification==='community-people'||/antarctica/i.test(raw.stableMapId+' '+raw.displayName)){excluded.add(raw.stableMapId);continue;}
   const issues=[];
   if(!['political-polity','dependent-administration','name-variant-or-duplicate','composite-political-region'].includes(classification))issues.push('Unresolved or non-political classification');
   const mappings=context.db.mappings.filter(m=>m.mapId===raw.stableMapId).filter(m=>{try{return overlaps(bounds({kind:'interval',from:m.validFrom,until:m.validUntil}),y);}catch{issues.push('Invalid mapping date');return false;}});
   const ids=unique(mappings.map(m=>m.entityId));
   if(ids.length!==1)issues.push(ids.length?'Competing dated entity mappings':'No dated entity mapping');
   if(ids.some(id=>!entities.has(id)))issues.push('Broken entity mapping');
   const planReview=(Array.isArray(context.plan?.reviews)?context.plan.reviews.find(r=>(r.mapId||r.stableMapId)===raw.stableMapId):context.plan?.reviews?.[raw.stableMapId])||raw.researchDecision;
   if(!reviewed&&!datedMappingReviewAllows(planReview,mappings,ids,s.year,sources))issues.push('Explicit unresolved mapping-review interval');
   if(issues.length){if(!selected||ids.some(id=>selected.has(id)))rawReview.push({snapshotYear:s.year,boundarySnapshot:s.file,rawMapId:raw.stableMapId,candidateEntityIds:ids,status:'historical-review',issues:unique(issues)});continue;}
   const id=ids[0];if(selected&&!selected.has(id))continue;
   const e=entities.get(id);
   try{if(e.existence&&!overlaps(bounds({kind:'interval',from:e.existence.validFrom,until:e.existence.validUntil}),y)){rawReview.push({snapshotYear:s.year,rawMapId:raw.stableMapId,candidateEntityIds:ids,status:'historical-review',issues:['Mapping outside entity existence']});continue;}}catch{rawReview.push({snapshotYear:s.year,rawMapId:raw.stableMapId,status:'historical-review',issues:['Invalid entity existence']});continue;}
   const key=s.year+'|'+id;if(!presence.has(key))presence.set(key,{snapshot:s,entity:e,mapIds:new Set(),mappings:[]});const p=presence.get(key);p.mapIds.add(raw.stableMapId);p.mappings.push(...mappings);
  }
  if(!occurrences)configurationWarnings.push('No manifest presence for snapshot '+s.year);
 }
 const usage=new Map();
 for(const p of [...presence.values()].sort((a,b)=>a.snapshot.year-b.snapshot.year||a.entity.id.localeCompare(b.entity.id))){
  const categories={},candidates=byEntity.get(p.entity.id)||[],year=p.snapshot.year;
  const mappingPartial=p.mappings.some(m=>!fullYear({temporal:{kind:'interval',from:m.validFrom,until:m.validUntil}},year));
  for(const category of fields){
   const facts=candidates.filter(c=>c.category===category).map(c=>({c,m:match(c,year,{observationWindowYears,contextWindowYears})})).filter(x=>x.m),issues=[];
   const supported=[],eligible=[];let complete=false;
   for(const {c,m} of facts){
    if(!strong(c,sources)){issues.push('Missing source provenance: '+c.id);continue;}
    if(c.value===undefined||c.value===null){issues.push('Missing substantive value: '+c.id);continue;}
    if(c.status!=='supported'||c.reviewRequired||(c.risks||[]).length||c.temporal.certainty&&c.temporal.certainty!=='exact'){issues.push('Unresolved evidence: '+c.id);continue;}
    if(category==='important-figures'&&c.figure?.lifespan){try{const life=bounds({...c.figure.lifespan,kind:'interval'}),relevance=bounds(c.temporal);if(relevance.lo<life.lo||relevance.hi>life.hi){issues.push('Figure relevance outside lifespan: '+c.id);continue;}}catch{issues.push('Invalid figure lifespan: '+c.id);continue;}}
    if(category==='historical-flag'){try{if(!c.flag?.asset||!c.flag.license||!c.flag.attribution||inspectFlagAsset(c.flag.asset,context.directory||root,c.flag.sha256).length){issues.push('Flag asset/license requires review: '+c.id);continue;}}catch{issues.push('Flag asset unavailable: '+c.id);continue;}}
    const statistical=['population-statistics','area-statistics','density','economy'].includes(category);
    if(statistical&&(!c.scope||typeof c.scope==='string'&&!c.scope.trim())){issues.push('Missing statistical scope: '+c.id);continue;}
    const fieldCompatible=qualifiedCompatibility(c);
    if(c.compatibility&&!assessCompatibility(c.compatibility,c,{requestedYear:year}).accepted){issues.push('Field/interval mapping permission requires review: '+c.id);continue;}
    if((m.mode==='nearby-observation'||m.mode==='dated-context'||statistical&&!c.legacy)&&!compatible(c)&&!fieldCompatible){issues.push('Scope compatibility requires review: '+c.id);continue;}
    if(c.scope?.relationship&&c.scope.relationship!=='same'&&!(c.scope.relationship==='compatible'&&fieldCompatible)){issues.push('Different territorial scope: '+c.id);continue;}
    supported.push({claimId:c.id,value:c.value,sourceIds:c.sourceIds,actualTemporal:m.actualTemporal,mode:m.mode,scope:c.scope,qualifications:c.qualifications||[]});
    eligible.push(c);
   }
   for(let i=0;i<facts.length;i++)for(let j=i+1;j<facts.length;j++)if(conflict(facts[i].c,facts[j].c))issues.push('Conflicting facts: '+facts[i].c.id+' / '+facts[j].c.id);
   complete=collectiveFullYear(eligible,year);
   const explicitNA=!facts.length&&rich.packages.some(pkg=>pkg.entityId===p.entity.id&&fullYear({temporal:{...pkg.period,kind:'interval'}},year)&&pkg.investigation?.some(i=>i.category===category&&i.status==='not-applicable'&&i.rationale&&i.consultedSourceIds?.length&&i.consultedSourceIds.every(id=>sources.has(id))));
   const status=issues.length?'historical-review':supported.length?(complete?'supported':'partial'):explicitNA?'not-applicable':'missing';
   categories[category]={status,records:supported,issues:unique(issues)};
   if(status==='supported'||status==='partial')for(const f of supported){const k=f.claimId;if(!usage.has(k))usage.set(k,new Set());usage.get(k).add(year+'|'+p.entity.id+'|'+category);}
  }
  const count=Object.values(categories).filter(c=>c.status==='supported').length,review=mappingPartial||Object.values(categories).some(c=>c.status==='historical-review');
  const status=review?'historical-review':core.every(c=>categories[c].status==='supported')?(count>=10?'substantially-complete':'core-covered'):count>=3?'partial':'sparse';
  rows.push({snapshotYear:year,boundarySnapshot:p.snapshot.file,entityId:p.entity.id,mapIds:[...p.mapIds].sort(),status,mappingPartial,categories});
 }
 const fieldCoverage=Object.fromEntries(fields.map(c=>[c,{supported:0,partial:0,missing:0,historicalReview:0,notApplicable:0}])),byStatus={};
 for(const r of rows){byStatus[r.status]=(byStatus[r.status]||0)+1;for(const c of fields){const s=r.categories[c].status;fieldCoverage[c][s==='historical-review'?'historicalReview':s==='not-applicable'?'notApplicable':s]++;}}
 const applications=[...usage.values()].reduce((n,s)=>n+s.size,0);
 const priorities={identity:100,'political-institutional':95,leadership:90,capital:85,'historical-flag':80,currency:75,overview:70,'events-context':65,'population-statistics':60,relationships:55,'important-figures':50,economy:40,'area-statistics':35,density:30},gaps=[];
 for(const r of rows)for(const category of fields){const slot=r.categories[category];if(['supported','not-applicable'].includes(slot.status))continue;const e=entities.get(r.entityId),mappings=context.db.mappings.filter(m=>r.mapIds.includes(m.mapId)&&m.entityId===r.entityId);gaps.push({entityId:r.entityId,mapIds:r.mapIds,name:e.names?.[0]?.value||r.entityId,period:{from:yearDate(r.snapshotYear),until:yearDate(r.snapshotYear)},snapshotYear:r.snapshotYear,boundarySnapshot:r.boundarySnapshot,category,priority:priorities[category]+(r.status==='sparse'?10:0),reason:slot.issues.join('; ')||'Snapshot category '+slot.status,cautions:['Snapshot context does not rewrite applicability, observation or event dates.','Store dated claims once; reuse across applicable snapshots.','No geometry-derived identity, sovereignty or succession.',...(r.mappingPartial?['Partial mapping within snapshot year; preserve transition ambiguity.']:[])],existingFacts:slot.records,sourceIds:unique(slot.records.flatMap(f=>f.sourceIds)),mappings});}
 for(const r of rawReview)gaps.push({entityId:null,mapIds:[r.rawMapId],name:r.rawMapId,period:{from:yearDate(r.snapshotYear),until:yearDate(r.snapshotYear)},snapshotYear:r.snapshotYear,boundarySnapshot:r.boundarySnapshot,category:'mapping-review',priority:110,reason:r.issues.join('; '),cautions:['Unresolved identity cannot be automatically integrated.','Do not infer sovereignty or succession from geometry.'],existingFacts:[],sourceIds:[],mappings:context.db.mappings.filter(m=>m.mapId===r.rawMapId)});
 gaps.sort((a,b)=>b.priority-a.priority||a.snapshotYear-b.snapshotYear||String(a.entityId||a.name).localeCompare(String(b.entityId||b.name))||a.category.localeCompare(b.category));
 const queueTotals={};for(const j of Array.isArray(queue)?queue:queue?.jobs||[])queueTotals[j.status||j.state||'unknown']=(queueTotals[j.status||j.state||'unknown']||0)+1;
 return{schemaVersion:1,model:'snapshot-entity-category',productionFingerprint:context.productionFingerprint,snapshots,policy:{snapshotContext:'Calendar year; intra-year transitions remain partial/review.',observationWindowYears,contextWindowYears,nearbyEvidence:'Past dates only; actual temporal data retained; explicit scope compatibility mandatory; no interpolation.'},metrics:{resolverAvailability:context.manifest.classification?.politicalCoverage||{},snapshotEntityOpportunities:rows.length,snapshotCategoryOpportunities:rows.length*fields.length,applicableSnapshotCategoryOpportunities:rows.length*fields.length-Object.values(fieldCoverage).reduce((n,v)=>n+v.notApplicable,0),rawHistoricalReviewCases:rawReview.length,excludedRawIdentities:excluded.size,uniqueDatedClaims:allClaims.size,uniqueClaimsSupportingSnapshots:usage.size,claimSnapshotApplications:applications,reusedApplications:applications-usage.size,supportedSnapshotCategorySlots:rows.reduce((n,r)=>n+Object.values(r.categories).filter(c=>c.status==='supported').length,0),byStatus,fieldCoverage,queueTotals},rows,rawReview,gaps,errors,configurationWarnings};
}
export function writeSnapshotReport(report,directory,{basename='snapshot-coverage'}={}){
 // The in-memory scanner retains rich generator context. Persist evidence once,
 // with references from snapshot slots, rather than repeating it in every gap.
 const records={};
 const rows=report.rows.map(r=>({...r,categories:Object.fromEntries(Object.entries(r.categories).map(([category,slot])=>{
   const references=slot.records.map(f=>{const {mode,...fact}=f;records[f.claimId]=fact;return{claimId:f.claimId,mode};});
   return [category,{status:slot.status,...(references.length?{records:references}:{}),...(slot.issues.length?{issues:slot.issues}:{})}];
 }))}));
 const gaps=report.gaps.map(gap=>({entityId:gap.entityId,snapshotYear:gap.snapshotYear,category:gap.category,priority:gap.priority,...(!gap.entityId?{mapIds:gap.mapIds}:{}),...(!/^Snapshot category /.test(gap.reason)?{reason:gap.reason}:{})}));
 const compact={...report,reportFormat:'deduplicated-snapshot-report',records,rows,gaps};
 saveJSON(path.join(directory,basename+'.json'),compact);
 const m=report.metrics,a=m.resolverAvailability,lines=['# Snapshot dossier coverage','',`Existing resolver availability: ${a.covered??a.available??'unknown'}/${a.candidates??a.total??'unknown'} (a separate metric).`,`Snapshot/entity opportunities: ${m.snapshotEntityOpportunities}. Supported category slots: ${m.supportedSnapshotCategorySlots} of ${m.applicableSnapshotCategoryOpportunities} applicable slots (${m.snapshotCategoryOpportunities} total).`,`Unique dated records: ${m.uniqueDatedClaims}; supporting records: ${m.uniqueClaimsSupportingSnapshots}; claim/snapshot applications: ${m.claimSnapshotApplications}; additional reused applications: ${m.reusedApplications}.`,`Raw identity cases awaiting review: ${m.rawHistoricalReviewCases}.`,...['substantially-complete','core-covered','partial','sparse','historical-review'].map(s=>`${s}: ${m.byStatus[s]||0}.`),'','| Category | Supported | Partial | Missing | Review | Not applicable |','| --- | ---: | ---: | ---: | ---: | ---: |'];for(const[c,v]of Object.entries(m.fieldCoverage))lines.push(`| ${c} | ${v.supported} | ${v.partial} | ${v.missing} | ${v.historicalReview} | ${v.notApplicable} |`);lines.push('','Observation and event dates remain actual dates. Nearby evidence is qualified context, never a rewritten selected-year observation. Core coverage and breadth are operational research metrics, not declarations of historical completeness.','Persisted records are indexed by claim ID; snapshot slots reference them without duplicating facts.');fs.writeFileSync(path.join(directory,basename+'.md'),lines.join('\n')+'\n');return compact;
}
if(isCLI(import.meta.url)){const out=process.argv[2]||'research/scale-01/reports';const report=scanSnapshots(readContext());writeSnapshotReport(report,out);console.log(JSON.stringify(report.metrics));}
