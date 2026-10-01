// Development-only handoffs. Native agents research; the coordinator alone applies.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createMetadataIndex, intervalBounds} from '../historical-metadata.js';
export const root=fileURLToPath(new URL('../',import.meta.url));
export const workspace=path.join(os.tmpdir(),'historical-atlas-phase2-144aeb5');
export const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const save=(p,d)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(d,null,2)+'\n');};
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
export function claim(state,id,worker){
 const job=state.jobs.find(j=>j.batchId===id);assert.ok(job,'Unknown batch');
 assert.equal(job.status,'queued','Already assigned or completed');
 assert.ok(!state.jobs.some(j=>j.status==='researching'&&j.worker===worker),'Worker already assigned');
 assert.ok(state.jobs.filter(j=>j.status==='researching').length<state.concurrency,'Capacity exceeded');
 job.status='researching';job.worker=worker;job.assignedAt=new Date().toISOString();return job;
}
export function context(){return {db:read(path.join(root,'data/historical-entities.json')),registry:read(path.join(root,'data/historical-sources.json')),manifest:read(path.join(root,'development/coverage/manifest.json')),plan:read(path.join(root,'development/coverage/research-plan.json'))};}
function remap(value,aliases){
 if(Array.isArray(value))return value.map(v=>remap(v,aliases));
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,k==='sourceIds'?v.map(id=>aliases.get(id)||id):remap(v,aliases)]));
 return value;
}
export function planIntegration(input,current){
 const c=structuredClone(current),p=structuredClone(input),scope=c.manifest.phase2Batches.find(b=>b.id===p.batchId);
 assert.equal(p.schemaVersion,1);assert.ok(scope,'Unknown batch');
 assert.deepEqual(p.assignedRawIdentities,scope.mapIds,'Scope drift');assert.deepEqual(p.researchedIdentities,scope.mapIds,'Incomplete research');
 for(const k of ['entities','extensions','mappings','sources','browserCases','classificationPrerequisites','classificationChanges','existingEntitiesReused','limitations','partialIdentities','unresolvedIdentities','mappingReviewIdentities','exclusions','historicalCautions','overviewPeriods','leadershipRecords','eventsRelationships','filesRequired'])assert.ok(Array.isArray(p[k]),'Missing handoff '+k);
 assert.ok(p.workerValidation?.state==='passed','Worker validation incomplete');
 assert.equal(p.classificationChanges.length,0,'Classification changes require separate coordinator evidence review');
 assert.deepEqual(Object.keys(p.decisions).sort(),[...scope.mapIds].sort(),'Missing individual decisions');
 assert.deepEqual(p.classificationPrerequisites.map(x=>x.mapId).sort(),[...scope.classificationPrerequisites].sort(),'Prerequisite drift');
 const aliases=new Map(),newSources=[];
 for(const s of p.sources){
  assert.ok(s.id&&s.title&&s.institution&&s.accessed&&s.usage,'Incomplete provenance');assert.equal(new URL(s.url).protocol,'https:');
  const sameId=c.registry.sources.find(x=>x.id===s.id),sameUrl=c.registry.sources.find(x=>x.url===s.url);
  if(sameId)assert.equal(sameId.url,s.url,'Source ID collision');
  if(sameUrl){aliases.set(s.id,sameUrl.id);continue;}
  assert.ok(!sameId,'Source ID collision');c.registry.sources.push(s);newSources.push(s.id);
 }
 const normalized=remap(p,aliases),newEntities=[];
 for(const e of normalized.entities){assert.ok(!c.db.entities.some(x=>x.id===e.id),'Entity collision '+e.id);assert.ok(e.names?.length&&e.politicalStatus?.length&&e.descriptions?.length&&e.existence,'Incomplete political core '+e.id);c.db.entities.push(e);newEntities.push(e.id);}
 for(const extension of normalized.extensions){
  const e=c.db.entities.find(x=>x.id===extension.entityId);assert.ok(e,'Missing extension entity');assert.equal(hash(e),extension.expectedHash,'Stale extension');
  for(const [field,facts]of Object.entries(extension.append)){assert.ok(Array.isArray(e[field])&&Array.isArray(facts),'Only append extensions supported');e[field].push(...facts);}
 }
 const sourceIds=new Set(c.registry.sources.map(s=>s.id));
 const auditRecord=(r,label)=>{
  assert.ok(r.sourceIds?.length,'Unsourced '+label);for(const id of r.sourceIds)assert.ok(sourceIds.has(id),'Missing source '+id);
  for(const key of ['validFrom','validUntil','asOf','date'])if(r[key]){assert.match(r[key],/^\d{4}(-\d{2})?(-\d{2})?$/);const [y,m=1,d=1]=r[key].split('-').map(Number),dt=new Date(Date.UTC(y,m-1,d));assert.ok(m>=1&&m<=12&&d>=1&&dt.getUTCDate()===d,'Invalid date');}
  if(r.validFrom&&r.validUntil)assert.ok(intervalBounds(r)[0]<intervalBounds(r)[1],'Invalid interval '+label);
 };
 for(const e of normalized.entities){auditRecord(e.existence,e.id);for(const [k,values]of Object.entries(e))if(Array.isArray(values))for(const r of values)auditRecord(r,e.id+' '+k);}
 const warnings=[];
 for(const mapping of normalized.mappings){
  assert.ok(scope.mapIds.includes(mapping.mapId),'Out-of-scope mapping');assert.ok(c.db.entities.some(e=>e.id===mapping.entityId),'Unknown entity');assert.ok(mapping.validFrom&&mapping.validUntil,'Undated mapping');auditRecord(mapping,mapping.mapId);
  for(const old of c.db.mappings.filter(m=>m.mapId===mapping.mapId&&m.entityId!==mapping.entityId)){const a=intervalBounds(old),b=intervalBounds(mapping);if(Math.max(a[0],b[0])<Math.min(a[1],b[1])){assert.ok(normalized.historicalCautions.length,'Overlapping identity requires review');warnings.push({mapId:mapping.mapId,entities:[old.entityId,mapping.entityId],reason:'Overlap retained for explicit coordinator historical review'});}}
  assert.ok(!c.db.mappings.some(m=>hash(m)===hash(mapping)),'Duplicate mapping');c.db.mappings.push(mapping);
 }
 for(const [raw,decision]of Object.entries(normalized.decisions)){
  assert.ok(['needs-research','existing-enriched','mapping-review'].includes(decision.status));assert.ok(decision.sourceIds?.length&&decision.intervals?.length&&decision.reviewerNote&&decision.identityResolution,'Incomplete review '+raw);
  for(const r of decision.intervals)auditRecord(r,raw);for(const id of decision.sourceIds)assert.ok(sourceIds.has(id));c.plan.reviews[raw]=decision;
 }
 const index=createMetadataIndex(c.db,c.registry);
 for(const id of newEntities)assert.ok(normalized.browserCases.some(t=>t.entityId===id),'Missing browser case '+id);
 for(const t of normalized.browserCases){assert.ok(scope.mapIds.includes(t.mapId));const raw=c.manifest.identities.find(r=>r.stableMapId===t.mapId);assert.ok(raw.snapshotYears.includes(t.seedYear),'Unselectable seed');const result=index.resolve(t.mapId,t.year);assert.ok(result.entity?.id===t.entityId||result.identityPeriods?.some(r=>r.entity?.id===t.entityId),'Unresolvable browser case');}
 c.plan.batchReviews[p.batchId]={state:'researched-with-partial-coverage',report:`research-batch-${String(scope.order).padStart(2,'0')}.json`,reviewedOn:p.researchedOn||new Date().toISOString().slice(0,10),note:'Isolated worker research; coordinator serial integration. Partial bounds and reviews remain explicit.'};
 return {normalized,db:c.db,registry:c.registry,plan:c.plan,scope,newEntities,newSources,warnings,sourceAliases:Object.fromEntries(aliases)};
}
function cli(){
 const [command,id,worker]=process.argv.slice(2),statePath=path.join(workspace,'queue.json');
 if(command==='init'){
  assert.ok(!fs.existsSync(statePath),'Queue already exists; use status to resume');const c=context();save(statePath,{schemaVersion:1,baseCommit:git('rev-parse','HEAD'),concurrency:3,workspace,jobs:c.manifest.phase2Batches.filter(b=>b.order>=8).map(b=>({batchId:b.id,order:b.order,status:c.plan.batchReviews[b.id]?'integrated':'queued'}))});
 }else if(command==='status')console.log(JSON.stringify(read(statePath),null,2));
 else if(command==='claim'){const s=read(statePath);claim(s,id,worker);save(statePath,s);console.log(path.join(workspace,id));}
 else if(command==='ready'){const s=read(statePath),j=s.jobs.find(j=>j.batchId===id);assert.equal(j.status,'researching');planIntegration(read(path.join(workspace,id,'package.json')),context());j.status='ready';save(statePath,s);}
 else if(command==='validate'||command==='apply'){
  const s=read(statePath),j=s.jobs.find(j=>j.batchId===id);assert.ok(j);const result=planIntegration(read(path.join(workspace,id,'package.json')),context());
  if(command==='validate'){console.log(JSON.stringify({batch:id,entities:result.newEntities.length,sources:result.newSources.length,mappings:result.normalized.mappings.length,sourceAliases:result.sourceAliases,warnings:result.warnings}));return;}
  assert.equal(j.status,'ready');assert.ok(s.jobs.filter(x=>x.order<j.order).every(x=>x.status==='integrated'),'Integration must be serial and ordered');assert.equal(git('branch','--show-current'),'main');assert.equal(git('status','--porcelain'),'','Main must be clean before integration');assert.equal(git('rev-parse','HEAD'),git('rev-parse','origin/main'),'Main must be synchronized');
  const n=String(result.scope.order).padStart(2,'0'),before=context();const audit={...result.normalized,baselineCommit:git('rev-parse','HEAD'),scope:result.scope,rawMapIdentities:result.scope.mapIds,beforePoliticalCoverage:before.manifest.classification.politicalCoverage,historicalEntitiesCreated:result.newEntities,existingEntitiesExtended:result.normalized.extensions.map(e=>e.entityId),mappingsAdded:result.normalized.mappings,mappingsCorrected:[],sourcesAdded:result.newSources,sourceAliases:result.sourceAliases,integrationWarnings:result.warnings,validation:{state:'pending'}};
  // Validate the complete write set before any authoritative file is touched.
  const outputs=[['data/historical-entities.json',result.db],['data/historical-sources.json',result.registry],['development/coverage/research-plan.json',result.plan],[`development/coverage/research-batch-${n}.json`,audit]];
  save(path.join(workspace,id,'integration-backup.json'),{baselineCommit:audit.baselineCommit,files:Object.fromEntries(outputs.filter(([p])=>fs.existsSync(path.join(root,p))).map(([p])=>[p,fs.readFileSync(path.join(root,p),'utf8')]))});
  for(const [p,d]of outputs)save(path.join(root,p),d);
  for(const p of ['app.js','historical-metadata.js','index.html']){const target=path.join(root,p);fs.writeFileSync(target,fs.readFileSync(target,'utf8').replace(/data=b\d+/g,'data=b'+n));}
  j.status='integrating';save(statePath,s);console.log('Applied '+id+'; coordinator must validate/document/commit/push before checkpoint.');
 }else if(command==='checkpoint'){
  const s=read(statePath),j=s.jobs.find(j=>j.batchId===id);assert.equal(j.status,'integrating');assert.equal(git('status','--porcelain'),'');assert.equal(git('rev-parse','HEAD'),git('rev-parse','origin/main'));const n=String(j.order).padStart(2,'0');assert.equal(read(path.join(root,`development/coverage/research-batch-${n}.json`)).validation.state,'passed');j.status='integrated';j.commit=git('rev-parse','HEAD');save(statePath,s);
 }else throw Error('Commands: init, status, claim batch worker, ready batch, validate batch, apply batch, checkpoint batch');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))cli();
