import fs from 'node:fs';
import path from 'node:path';
import {digest,readJSON,saveJSON,productionFingerprint,root,isCLI} from './research-common.mjs';
import {withLock,atomicWrite} from './research-queue.mjs';
import {validateFlagClaim} from './research-flags.mjs';
import {validateLiteralRelationshipReuse} from './research-completion-reuse.mjs';
import {assessCompatibility,qualifiedCompatibility} from './research-crosswalk.mjs';
export const fields=['identity','political-institutional','leadership','capital','currency','historical-flag','population-statistics','area-statistics','density','economy','events-context','relationships','overview','important-figures'];
export const fingerprint=(directory=root)=>{
 const store=fs.existsSync(path.join(directory,'data/comprehensive-dossiers.json'))?readJSON(path.join(directory,'data/comprehensive-dossiers.json')):null;
 const assets=Object.fromEntries((store?.packages||[]).flatMap(p=>p.claims.filter(c=>c.flag).map(c=>[c.flag.asset,digest([...fs.readFileSync(path.resolve(directory,c.flag.asset))])])));
 return digest({atlas:productionFingerprint(directory),comprehensive:store,assets});
};
const required=(ok,message)=>{if(!ok)throw Error(message);};
const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
export function schemaCheck(value,rule,schema,where='$',errors=[]){
 if(rule.$ref)return schemaCheck(value,schema.$defs[rule.$ref.split('/').at(-1)],schema,where,errors);
 if(rule.oneOf){const matches=rule.oneOf.filter(r=>schemaCheck(value,r,schema,where,[]).length===0);if(matches.length!==1)errors.push(where+': schema variant');return errors;}
 const types={object:plain(value),array:Array.isArray(value),string:typeof value==='string',number:typeof value==='number'&&Number.isFinite(value),integer:Number.isInteger(value),boolean:typeof value==='boolean',null:value===null};
 if(rule.type&&!(Array.isArray(rule.type)?rule.type:[rule.type]).some(t=>types[t])){errors.push(where+': type');return errors;}
 if(rule.const!==undefined&&value!==rule.const)errors.push(where+': constant');
 if(rule.enum&&!rule.enum.includes(value))errors.push(where+': enum');
 if(typeof value==='string'&&((rule.minLength&&value.trim().length<rule.minLength)||(rule.pattern&&!new RegExp(rule.pattern).test(value))))errors.push(where+': string');
 if(Array.isArray(value)){if(rule.minItems&&value.length<rule.minItems)errors.push(where+': minItems');if(rule.uniqueItems&&new Set(value.map(digest)).size!==value.length)errors.push(where+': duplicates');value.forEach((v,i)=>schemaCheck(v,rule.items||{},schema,where+'['+i+']',errors));}
 if(plain(value)){for(const k of rule.required||[])if(!Object.hasOwn(value,k))errors.push(where+'.'+k+': required');for(const[k,v]of Object.entries(value))if(rule.properties?.[k])schemaCheck(v,rule.properties[k],schema,where+'.'+k,errors);else if(rule.additionalProperties===false)errors.push(where+'.'+k+': unknown');}
 if(plain(value)&&rule.minProperties&&Object.keys(value).length<rule.minProperties)errors.push(where+': minProperties');
 return errors;
}
// Astronomical year numbering: year 0 = 1 BCE; -003999 = 4000 BCE.
// This research chronology does not expand the production map or legacy resolver.
export function dateBounds(value){
 required(typeof value==='string'&&/^(?:\d{4}|-\d{6}|\+\d{6})(?:-\d{2}(?:-\d{2})?)?$/.test(value),'Invalid chronology date');
 const m=value.match(/^([+-]?\d{4,6})(?:-(\d{2})(?:-(\d{2}))?)?$/),year=Number(m[1]),month=Number(m[2]||1),day=Number(m[3]||1),precision=m[3]?'day':m[2]?'month':'year';
 const leap=year%4===0&&(year%100!==0||year%400===0),days=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31];required(month>=1&&month<=12&&day>=1&&day<=days[month-1],'Impossible calendar date');
 const ordinal=(y,mo,d)=>y*372+(mo-1)*31+d-1,lo=ordinal(year,month,day),hi=precision==='year'?ordinal(year+1,1,1):precision==='month'?ordinal(year,month+1,1):lo+1;
 return {lo,hi,year,precision};
}
export function temporalBounds(t){if(t.kind==='observation'||t.kind==='event')return dateBounds(t.observationDate||t.date);const a=dateBounds(t.from),b=dateBounds(t.until),hi=b.precision==='day'?b.lo:b.hi;required(a.lo<hi,'Reversed or empty interval');return{lo:a.lo,hi,precision:a.precision};}
const intersect=(a,b)=>a.lo<b.hi&&b.lo<a.hi;
const sourcesOf=context=>{
 const file=path.join(context.directory||root,'data/comprehensive-dossiers.json');
 const rich=fs.existsSync(file)?readJSON(file).packages.flatMap(p=>p.sources):[];
 return [...(context.registry?.sources||[]),...rich];
};
export function sourceIndex(context,preserved=[]){
 const sources=sourcesOf(context);return {schemaVersion:1,productionFingerprint:fingerprint(context.directory||root),sources:sources.map(s=>({...s,search:[s.id,s.title,s.institution,s.url].filter(Boolean).join(' ').normalize('NFKD').toLowerCase()})),preserved:preserved.map(p=>({id:p.id,entityId:p.entityId,period:p.period,packageHash:digest(p),sourceIds:[...new Set(p.claims.flatMap(c=>c.sourceIds))]}))};
}
export const lookupSources=(index,query)=>{const tokens=query.toLowerCase().normalize('NFKD').split(/\s+/).filter(Boolean);return index.sources.map(s=>({source:s,score:tokens.filter(t=>s.search.includes(t)).length})).filter(x=>x.score).sort((a,b)=>b.score-a.score||a.source.id.localeCompare(b.source.id));};
export function generateDossierJob(entityId,period,context){
 required(context.db.entities.some(e=>e.id===entityId),'Unknown historical entity');temporalBounds({...period,kind:'interval'});
 const mappings=context.db.mappings.filter(m=>m.entityId===entityId);required(mappings.length,'No reviewed map association');
 return {id:'dossier-'+digest({entityId,period}).slice(0,24),entityId,period:structuredClone(period),mapIds:[...new Set(mappings.map(m=>m.mapId))].sort(),category:'comprehensive-dossier',productionFingerprint:fingerprint(context.directory||root),categories:[...fields],status:'queued',requiredInvestigation:'All applicable categories, with explicit gaps, conflicts and applicability decisions',prohibitedAssumptions:['geometry sovereignty/succession','modern fallback/nationality','statistical interpolation'],integrationConcurrency:1};
}
export function ingestCandidates(rows,provider,context){
 required(provider.id&&provider.url?.startsWith('https://')&&provider.license&&provider.retrievedAt,'Provider provenance/license required');
 const seen=new Set(),entities=new Set(context.db.entities.map(e=>e.id));
 const schema=readJSON(path.join(root,'research/comprehensive/schemas/candidate.schema.json'));
 return rows.map(row=>{required(schemaCheck(row,schema,schema).length===0,'Candidate schema/provenance invalid');temporalBounds(row.temporal);required(row.sourceIdentifier&&fields.includes(row.category),'Candidate identifier/category required');required(!seen.has(row.sourceIdentifier),'Duplicate provider identifier');seen.add(row.sourceIdentifier);
 const mapped=entities.has(row.entityId);return {schemaVersion:1,id:'candidate-'+digest({provider:provider.id,identifier:row.sourceIdentifier}).slice(0,24),provider:structuredClone(provider),sourceIdentifier:row.sourceIdentifier,retrieved:structuredClone(row),entityId:mapped?row.entityId:null,mappingStatus:mapped?'explicit-existing-entity':'historical-review',status:'candidate',productionTruth:false};});
}
export function validateDossier(pkg,job,context){
 const schema=readJSON(path.join(root,'research/comprehensive/schemas/dossier.schema.json')),errors=schemaCheck(pkg,schema,schema),review=[],checks=[];
 const check=(label,ok)=>{checks.push(label);if(!ok)errors.push(label);};
 if(errors.length)return {valid:false,status:'validation-failed',errors,review,checks,packageHash:digest(pkg)};
 check('Job identity and bounded period',job&&pkg.jobId===job.id&&pkg.entityId===job.entityId&&digest(pkg.period)===digest(job.period));
 check('Current complete production fingerprint',pkg.productionFingerprint===fingerprint(context.directory||root)&&job.productionFingerprint===pkg.productionFingerprint);
 const entity=context.db.entities.find(e=>e.id===pkg.entityId);check('Existing historical entity',!!entity);
 check('Known explicit map associations',pkg.mapIds.every(id=>context.db.mappings.some(m=>m.mapId===id&&m.entityId===pkg.entityId)));
 const sourceMap=new Map(sourcesOf(context).map(s=>[s.id,s])),urls=new Map(sourcesOf(context).map(s=>[s.url,s.id]));
 check('Distinct proposed source IDs and URLs',new Set(pkg.sources.map(s=>s.id)).size===pkg.sources.length&&new Set(pkg.sources.map(s=>s.url)).size===pkg.sources.length);
 for(const s of pkg.sources){check('Source provenance '+s.id,!!s.title&&!!s.institution&&/^https:\/\//.test(s.url));check('No source overwrite '+s.id,!sourceMap.has(s.id)||digest(sourceMap.get(s.id))===digest(s));check('Reuse existing source ID '+s.id,!urls.has(s.url)||urls.get(s.url)===s.id);sourceMap.set(s.id,s);}
 let period;try{period=temporalBounds({...pkg.period,kind:'interval'});}catch(e){errors.push(e.message);}
 const existence=entity?.existence||entity;
 if(period&&existence&&(existence.validFrom||existence.validUntil))try{const eb=temporalBounds({kind:'interval',from:existence.validFrom||pkg.period.from,until:existence.validUntil||pkg.period.until});check('Entity validity envelope',period.lo>=eb.lo&&period.hi<=eb.hi);}catch(e){errors.push(e.message);}
 const claims=new Map(),signatures=new Set();
 check('All categories investigated or explicitly qualified',fields.every(f=>pkg.investigation.some(i=>i.category===f))&&pkg.investigation.length===fields.length);
 for(const i of pkg.investigation){check('Consulted sources resolve '+i.category,i.consultedSourceIds.every(id=>sourceMap.has(id)));if(['not-applicable','unresolved','partial'].includes(i.status))check('Explicit applicability/gap rationale '+i.category,!!i.rationale.trim());}
 for(const c of pkg.claims){
 if(c.category==='historical-flag')errors.push(...validateFlagClaim({sourceIds:c.sourceIds,temporal:c.temporal,flag:c.flag},sourceMap,context.directory));
 check('Unique claim ID '+c.id,!claims.has(c.id));claims.set(c.id,c);
 check('Claim entity scope '+c.id,c.entityId===pkg.entityId);
 check('Claim provenance resolves '+c.id,c.sourceIds.length>0&&c.sourceIds.every(id=>sourceMap.has(id))&&c.evidence.length>0&&c.evidence.every(e=>c.sourceIds.includes(e.sourceId)&&e.locator&&e.note));
 check('Claim category applicability '+c.id,pkg.investigation.find(i=>i.category===c.category)?.status!=='not-applicable');
 const signature=digest({category:c.category,value:c.value,temporal:c.temporal,role:c.role||null,metric:c.metric||null,scope:c.scope});check('No artificially duplicated meaningful claim '+c.id,!signatures.has(signature));signatures.add(signature);
 try{const b=temporalBounds(c.temporal);check('Within requested research period '+c.id,period&&b.lo>=period.lo&&b.hi<=period.hi);
 const stats=['population-statistics','area-statistics','economy','density'];check('Observation distinct from validity '+c.id,!stats.includes(c.category)||c.temporal.kind==='observation');
 if(c.temporal.certainty!=='exact')review.push(c.id+': uncertain/disputed chronology requires review');
 if(c.compatibility){const decision=assessCompatibility(c.compatibility,c);check('Certified field-specific historical compatibility '+c.id,decision.accepted);check('Mapping evidence sources resolve '+c.id,c.compatibility.evidence.every(e=>sourceMap.has(e.sourceId)&&c.sourceIds.includes(e.sourceId)));}
 if(c.scope.relationship!=='same'&&!qualifiedCompatibility(c))review.push(c.id+': geographic comparability requires review');
 if(c.status!=='supported')review.push(c.id+': partial/unresolved support');
 for(const e of c.evidence){const eb=temporalBounds(e.temporal);check('Evidence bounds claimed date '+c.id,b.lo>=eb.lo&&b.hi<=eb.hi);if(c.temporal.kind==='observation')check('Observation date unchanged '+c.id,e.temporal.kind==='observation'&&e.temporal.observationDate===c.temporal.observationDate);const rank={year:1,month:2,day:3},precision=c.temporal.kind==='interval'?Math.max(rank[dateBounds(c.temporal.from).precision],rank[dateBounds(c.temporal.until).precision]):rank[b.precision];check('No invented precision '+c.id,precision<=rank[e.precision]);}
 if(stats.includes(c.category))check('Statistic methodology/unit '+c.id,typeof c.value==='number'&&c.value>=0&&!!c.metric&&!!c.unit&&c.qualifications.length>0);
 if(c.category==='leadership')check('Dated office title '+c.id,!!c.role);
 if(c.temporal.kind==='event')check('Events use event temporal form '+c.id,c.category==='events-context');
 if(c.category==='events-context')check('Selected-period event date '+c.id,c.temporal.kind==='event');
 if(c.category==='important-figures'){check('Figure relationship/activity '+c.id,!!c.figure?.relationship&&!!c.figure?.activity&&!!c.figure?.contribution&&!!c.figure?.personId);const life=temporalBounds({...c.figure.lifespan,kind:'interval'});check('Figure relevance within lifespan '+c.id,b.lo>=life.lo&&b.hi<=life.hi);}
 if(c.category==='relationships')check('Related entity IDs or exact sourced literal affiliation resolve '+c.id,c.relatedParty?validateLiteralRelationshipReuse(c,context,temporalBounds):c.relatedEntityIds?.length&&c.relatedEntityIds.every(id=>context.db.entities.some(e=>e.id===id)));
 }catch(e){errors.push(c.id+': '+e.message);}
 for(const risk of c.risks||[])if(['geometry-succession','modern-nationality','modern-fallback','subjecto-succession','interpolated-statistic'].includes(risk))errors.push(c.id+': prohibited '+risk);else review.push(c.id+': '+risk);
 }
 for(const c of pkg.claims){
 if(c.category==='density'){
 const pop=claims.get(c.derivation?.populationClaimId),area=claims.get(c.derivation?.areaClaimId);check('Density compatible observations '+c.id,pop?.category==='population-statistics'&&area?.category==='area-statistics'&&pop.temporal.observationDate===area.temporal.observationDate&&c.temporal.observationDate===pop.temporal.observationDate&&pop.scope.id===area.scope.id&&c.scope.id===pop.scope.id&&pop.unit==='persons'&&area.unit==='km2'&&c.unit==='persons/km2'&&area.value>0&&typeof pop.value==='number'&&Math.abs(c.value-pop.value/area.value)<1e-9);}
 }
 for(let a=0;a<pkg.claims.length;a++)for(let b=a+1;b<pkg.claims.length;b++){const x=pkg.claims[a],y=pkg.claims[b];if(x.category!==y.category||(x.role||'')!==(y.role||'')||(x.metric||'')!==(y.metric||'')||x.scope.id!==y.scope.id||['events-context','important-figures','relationships','overview','identity'].includes(x.category))continue;try{if(intersect(temporalBounds(x.temporal),temporalBounds(y.temporal))&&digest(x.value)!==digest(y.value))review.push('Conflicting records '+x.id+' / '+y.id);}catch{}}
 for(const c of pkg.claims){const key={capital:'capitals',currency:'currencies',leadership:'leaders'}[c.category];if(!key)continue;for(const old of entity?.[key]||[]){if(c.category==='leadership'&&(c.role||'')!==(old.role||''))continue;try{if(intersect(temporalBounds(c.temporal),temporalBounds({kind:'interval',from:old.validFrom||pkg.period.from,until:old.validUntil||pkg.period.until}))&&digest(c.value)!==digest(old.value))review.push('Conflicting legacy record '+c.id);}catch{errors.push(c.id+': invalid legacy interval');}}}
 if(pkg.claims.some(c=>c.origin?.kind==='bulk-candidate'))review.push('Candidate claims require independent original-source review');
 for(const conflict of pkg.conflicts){if(typeof conflict==='string')review.push('Package source conflict: '+conflict);else{check('Conflict affected IDs resolve '+conflict.description,conflict.claimIds.every(id=>claims.has(id)));review.push('Scoped source conflict: '+conflict.description+' ['+conflict.claimIds.join(', ')+']');}}
 return {valid:errors.length===0,status:errors.length?'validation-failed':review.length?'historical-review':'validated',errors,review:[...new Set(review)].sort(),checks,packageHash:digest(pkg)};
}
export function selectForYear(claims,year,{nearbyObservations=false}={}){
 required(Number.isInteger(year),'Requested year must be an integer');const formatted=year<0?'-'+String(-year).padStart(6,'0'):year>9999?'+'+String(year).padStart(6,'0'):String(year).padStart(4,'0');
 const range=temporalBounds({kind:'interval',from:formatted,until:formatted});return claims.filter(c=>{const b=temporalBounds(c.temporal);return intersect(range,b)||nearbyObservations&&c.temporal.kind==='observation';}).map(c=>({claim:structuredClone(c),requestedYear:year,actualTemporal:structuredClone(c.temporal),contextRequired:c.temporal.kind!=='interval'||c.temporal.certainty!=='exact'||temporalBounds(c.temporal).lo>range.lo||temporalBounds(c.temporal).hi<range.hi}));
}
export function acceptDossier(pkg,job,context,review){
 const v=validateDossier(pkg,job,context);required(v.valid,'Invalid comprehensive dossier');required(review.reviewer&&review.reviewer!==pkg.worker.id&&review.packageHash===digest(pkg)&&review.bodyReviewed&&review.rationale?.trim(),'Independent exact-package body review required');required(digest([...(review.reviewedIssues||[])].sort())===digest(v.review),'Every historical review issue must be bound');
 required(review.decisions&&pkg.claims.every(c=>['accepted','held','rejected'].includes(review.decisions[c.id])),'Every claim needs explicit disposition');
 for(const c of pkg.claims.filter(c=>review.decisions[c.id]==='accepted')){required(c.status==='supported'&&c.temporal.certainty==='exact'&&(c.scope.relationship==='same'||c.scope.relationship==='compatible'&&qualifiedCompatibility(c))&&!(c.risks||[]).length,'Unsafe claims cannot automatically be accepted');required(!v.review.some(issue=>(issue.startsWith('Conflicting records ')||issue.startsWith('Conflicting legacy record '))&&issue.includes(c.id))&&!pkg.conflicts.some(x=>typeof x==='string'||x.claimIds.includes(c.id)),'Conflicting claims must remain held');if(c.category==='density')required([c.derivation.populationClaimId,c.derivation.areaClaimId].every(id=>review.decisions[id]==='accepted'),'Derived dependencies must also be accepted');}
 return {status:'accepted',packageHash:digest(pkg),productionFingerprint:pkg.productionFingerprint,jobId:job.id,review:structuredClone(review),acceptedClaimIds:pkg.claims.filter(c=>review.decisions[c.id]==='accepted').map(c=>c.id)};
}
// Rich claims enter a separate reviewed production store for a future reader, not silently
// squeezed into legacy fields. Current frontend and timeline remain untouched.
export function integrateDossier(pkg,job,context,receipt,{apply=false}={}){
 const directory=context.directory||root,storePath=path.join(directory,'data/comprehensive-dossiers.json'),journalPath=path.join(directory,'research/comprehensive/integration-journal.json');
 required(receipt?.status==='accepted'&&receipt.packageHash===digest(pkg)&&receipt.productionFingerprint===fingerprint(directory),'Stale or missing acceptance receipt');
 const fresh=acceptDossier(pkg,job,context,receipt.review);required(digest(fresh)===digest(receipt),'Receipt tampering');
 const claims=pkg.claims.filter(c=>receipt.acceptedClaimIds.includes(c.id));required(claims.length,'No accepted claims');
 for(const c of claims){const b=temporalBounds(c.temporal);required(b.lo>=1800*372&&b.hi<=1961*372,'Ancient/future production integration is not authorized');}
 const store=fs.existsSync(storePath)?readJSON(storePath):{schemaVersion:2,packages:[]};required(!store.packages.some(p=>p.id===pkg.id||p.claims.some(c=>claims.some(n=>n.id===c.id))),'Duplicate integrated package/claim');
 const oldClaims=store.packages.flatMap(p=>p.claims);for(const c of claims)for(const old of oldClaims)if(c.entityId===old.entityId&&c.category===old.category&&(c.role||'')===(old.role||'')&&(c.metric||'')===(old.metric||'')&&c.scope.id===old.scope.id&&!['events-context','relationships','important-figures','overview','identity'].includes(c.category))required(!intersect(temporalBounds(c.temporal),temporalBounds(old.temporal)),'Unsafe overlapping overwrite');
 // Investigation provenance may cite consulted sources for deliberately unresolved gaps.
 // Retain that catalogue metadata too; unsupported claims themselves never enter production.
 store.packages.push({...structuredClone(pkg),claims:structuredClone(claims),sources:structuredClone(pkg.sources),acceptance:structuredClone(receipt)});
 if(!apply)return {applied:false,store,acceptedClaims:claims.length};
 return withLock(path.join(directory,'research/.integration-state'),()=>{required(!fs.existsSync(journalPath)||readJSON(journalPath).status!=='prepared','Recover interrupted integration first');required(fingerprint(directory)===receipt.productionFingerprint,'Production changed before lock');fs.mkdirSync(path.dirname(journalPath),{recursive:true});const before=fs.existsSync(storePath)?fs.readFileSync(storePath,'utf8'):null,after=JSON.stringify(store,null,2)+'\n';atomicWrite(journalPath,{status:'prepared',packageHash:digest(pkg),before,after,beforeFingerprint:receipt.productionFingerprint});atomicWrite(storePath,store);const afterFingerprint=fingerprint(directory);atomicWrite(journalPath,{status:'completed',packageHash:digest(pkg),before,after,beforeFingerprint:receipt.productionFingerprint,afterFingerprint});return {applied:true,acceptedClaims:claims.length,afterFingerprint};});
}
export function recoverDossierIntegration(directory=root){return withLock(path.join(directory,'research/.integration-state'),()=>{const p=path.join(directory,'research/comprehensive/integration-journal.json'),j=readJSON(p);required(j.status==='prepared','No interrupted integration');const file=path.join(directory,'data/comprehensive-dossiers.json'),current=fs.existsSync(file)?fs.readFileSync(file,'utf8'):null;required(current===j.before||current===j.after,'External edit: recovery refused');if(current===j.after){j.status='completed';j.afterFingerprint=fingerprint(directory);}else j.status='not-applied';atomicWrite(p,j);return j.status;});}
export function dossierMetrics(packages){return {assignments:packages.length,claims:packages.reduce((n,p)=>n+p.claims.length,0),claimsByCategory:Object.fromEntries(fields.map(f=>[f,packages.reduce((n,p)=>n+p.claims.filter(c=>c.category===f).length,0)])),claimsPerAssignment:packages.length?packages.reduce((n,p)=>n+p.claims.length,0)/packages.length:0,qualification:'Research claims are not integration counts; imported prior claims are separately identifiable through origin metadata.'};}
if(isCLI(import.meta.url)){const [command,file]=process.argv.slice(2);required(command==='inspect'&&file,'Usage: research-comprehensive.mjs inspect package.json');console.log(JSON.stringify(dossierMetrics([readJSON(file)]),null,2));}
