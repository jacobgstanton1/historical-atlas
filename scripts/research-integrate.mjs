import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {digest,readContext,productionFingerprint,productionFiles,dateRange,periodBounds,overlap,isCLI,root as defaultRoot} from './research-common.mjs';
import {validatePackage} from './research-validator.mjs';
import {withLock,atomicWrite} from './research-queue.mjs';

const targets={'leadership':'leaders','capital':'capitals','population-statistics':'population','area-statistics':'area','currency':'currencies','economy':'economy','events-context':'events','relationships':'relationships'};
const writeFiles=['data/historical-entities.json','data/historical-sources.json'];
const fileHash=text=>crypto.createHash('sha256').update(text).digest('hex');
function check(ok,message){if(!ok)throw new Error(message);}
function aliasesIn(value,aliases){
  if(Array.isArray(value))return value.map(v=>aliasesIn(v,aliases));
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,k==='sourceId'?(aliases[v]||v):k==='sourceIds'?v.map(id=>aliases[id]||id):aliasesIn(v,aliases)]));
  return value;
}
function fieldFor(claim){
  if(claim.category==='political-institutional'){
    check(['government','politicalStatus','description'].includes(claim.metric),'Political claims require explicit government/politicalStatus/description metric');
    return {government:'governments',politicalStatus:'politicalStatus',description:'descriptions'}[claim.metric];
  }
  check(targets[claim.category],'Unsupported production category: '+claim.category+' (Stage 1 cannot create Important Figures, entities or mappings)');
  return targets[claim.category];
}
function recordFor(claim){
  const field=fieldFor(claim),fact={value:structuredClone(claim.value),sourceIds:[...claim.sourceIds],confidence:'documented',note:claim.evidence.map(e=>e.note).join(' ')};
  check(typeof claim.value==='string'||(['population','economy','area'].includes(field)&&typeof claim.value==='number'),'Structured or non-displayable claim value requires a separately reviewed production adapter');
  if(field==='relationships'){check(typeof claim.metric==='string'&&claim.metric.trim(),'Relationship claim requires explicit type in metric');fact.type=claim.metric;}
  if(field==='events')fact.title=claim.value;
  if(claim.role)fact.role=claim.role;
  if(claim.metric&&claim.category!=='political-institutional')fact.metric=claim.metric;
  if(claim.temporal.kind==='observation'){
    check(['population','economy','events'].includes(field),'Observation cannot be represented safely in production field '+field);
    fact[field==='events'?'date':'asOf']=claim.temporal.observationDate;
    if(field==='population'||field==='economy')fact.scope=claim.geographicScope.description;
  }else{
    check(!['population','economy','events'].includes(field),'Production '+field+' requires an observation, not an inferred interval');
    fact.validFrom=claim.temporal.from;fact.validUntil=claim.temporal.until;
  }
  return {field,fact};
}
function factRange(fact){return fact.asOf?dateRange(fact.asOf):fact.date?dateRange(fact.date):periodBounds(fact);}
function sameSlot(a,b,field){
  if(field==='leaders')return (a.role||'')===(b.role||'');
  if(['population','economy','area'].includes(field))return (a.metric||'')===(b.metric||'')&&(a.scope||'')===(b.scope||'');
  return true;
}
export function planIntegration(pkg,job,context,receipt){
  check(receipt?.status==='accepted'&&receipt.coordinator?.role==='coordinator'&&receipt.coordinator.id&&receipt.rationale?.trim(),'Explicit accepted coordinator receipt required');
  check(receipt.jobId===job.id&&pkg.jobId===job.id,'Receipt/job mismatch');
  check(receipt.packageHash===digest(pkg),'Stale package hash');
  check(receipt.productionFingerprint===context.productionFingerprint&&pkg.productionFingerprint===context.productionFingerprint&&job.productionFingerprint===context.productionFingerprint,'Stale production fingerprint');
  check(pkg.claims.every(c=>c.reviewStatus==='clear'&&c.geographicScope.relationship==='same'),'Unsafe historical/geographical review remains unresolved');
  for(const claim of pkg.claims)fieldFor(claim);
  const db=structuredClone(context.db),registry=structuredClone(context.registry),aliases={},normalized=structuredClone(pkg);
  for(const s of pkg.sources){
    const existing=registry.sources.find(x=>x.id===s.id),same=registry.sources.find(x=>x.url===s.url);
    check(!existing||existing.url===s.url,'Source ID overwrite refused: '+s.id);
    if(same){aliases[s.id]=same.id;continue;}
    check(!existing,'Existing source overwrite refused');registry.sources.push(structuredClone(s));
  }
  const aliased=aliasesIn(normalized,aliases);aliased.sources=aliased.sources.filter(s=>!aliases[s.id]);
  const referencedSources=new Set(pkg.claims.flatMap(c=>c.sourceIds));
  check(pkg.sources.every(s=>referencedSources.has(s.id)),'Unused source proposals refused');
  check(new Set(pkg.sources.map(s=>s.url)).size===pkg.sources.length,'Duplicate package source URLs refused');
  const validation=(context.validatePackage||validatePackage)(pkg,job,context);
  check(validation.valid,'Package validation failed: '+validation.errors.join('; '));
  check(receipt.reviewResolved===true,'Independent historical review receipt required');
  check(Array.isArray(receipt.reviewedIssues)&&digest([...receipt.reviewedIssues].sort())===digest([...validation.review].sort()),'Receipt must bind every validation review issue');
  const entity=db.entities.find(e=>e.id===pkg.entityId);check(entity,'Unknown production entity');
  const appended=[];
  for(const claim of aliased.claims){
    const {field,fact}=recordFor(claim);check(Array.isArray(entity[field]),'Production field unavailable: '+field);
    check(!entity[field].some(f=>digest(f)===digest(fact)),'Duplicate production fact refused');
    for(const old of entity[field]){
      if(!sameSlot(old,fact,field)||!overlap(factRange(old),factRange(fact)))continue;
      const sameValue=digest(old.value)===digest(fact.value);
      check(sameValue,'Conflicting production '+field+' fact; amendments require separate historical workflow');
      check(field==='descriptions'||field==='events'||field==='relationships','Overlapping duplicate production fact refused');
    }
    entity[field].push(fact);appended.push({claimId:claim.id,field,fact});
  }
  check(digest(db.mappings)===digest(context.db.mappings),'Mapping mutation refused');
  check(db.entities.length===context.db.entities.length,'Entity creation refused');
  for(const oldEntity of context.db.entities){
    const next=db.entities.find(e=>e.id===oldEntity.id);check(next,'Existing entity removed');
    for(const [field,old]of Object.entries(oldEntity))if(Array.isArray(old))check(digest(next[field].slice(0,old.length))===digest(old),'Unsafe existing fact overwrite');else check(digest(next[field])===digest(old),'Unsafe entity metadata overwrite');
  }
  const sourceIds=new Set(registry.sources.map(s=>s.id));check(sourceIds.size===registry.sources.length,'Duplicate production source IDs');
  check(new Set(registry.sources.map(s=>s.url)).size===registry.sources.length,'Duplicate production source URLs');
  for(const {fact}of appended){check(fact.sourceIds.length&&fact.sourceIds.every(id=>sourceIds.has(id)),'Orphan appended fact source');const range=factRange(fact);check(range[0]<range[1],'Invalid appended fact calendar interval');}
  return {db,registry,sourceAliases:aliases,appended,validation,packageHash:digest(pkg),productionFingerprint:context.productionFingerprint,outputs:Object.fromEntries([[writeFiles[0],db],[writeFiles[1],registry]])};
}
function journalPaths(directory){return {file:path.join(directory,'research','.integration-journal.json'),lock:path.join(directory,'research','.integration-state')};}
function rawWrite(file,text){
  const temporary=file+'.'+crypto.randomUUID()+'.tmp';let fd;
  try{fd=fs.openSync(temporary,'wx');fs.writeFileSync(fd,text);fs.fsyncSync(fd);fs.closeSync(fd);fd=undefined;fs.renameSync(temporary,file);}finally{if(fd!==undefined)fs.closeSync(fd);if(fs.existsSync(temporary))fs.unlinkSync(temporary);}
}
function journalCheck(directory,journal){
  check(journal.schemaVersion===1&&journal.root===path.resolve(directory),'Invalid integration journal root/schema');
  check(JSON.stringify(Object.keys(journal.files).sort())===JSON.stringify([...writeFiles].sort()),'Unsafe journal write set');
  for(const [name,entry]of Object.entries(journal.files))check(fileHash(entry.before)===entry.beforeHash&&fileHash(entry.after)===entry.afterHash,'Corrupt journal backup: '+name);
  for(const name of productionFiles){
    const current=fileHash(fs.readFileSync(path.join(directory,name),'utf8')),entry=journal.files[name];
    check(entry?(current===entry.beforeHash||current===entry.afterHash):current===journal.otherHashes[name],'External production modification; recovery refused: '+name);
  }
}
export function integratePackage(directory,pkg,job,receipt,{apply=false,afterWrite}={}){
  const paths=journalPaths(directory);
  if(!apply)return {applied:false,...planIntegration(pkg,job,readContext(directory),receipt)};
  return withLock(paths.lock,()=>{
    if(fs.existsSync(paths.file)){const old=JSON.parse(fs.readFileSync(paths.file,'utf8'));check(['completed','rolled-back'].includes(old.status),'Interrupted integration must be recovered first');}
    const context=readContext(directory),plan=planIntegration(pkg,job,context,receipt);
    const journal={schemaVersion:1,root:path.resolve(directory),status:'prepared',jobId:job.id,packageHash:plan.packageHash,receipt:structuredClone(receipt),beforeFingerprint:context.productionFingerprint,files:{},otherHashes:{}};
    for(const name of productionFiles){const before=fs.readFileSync(path.join(directory,name),'utf8');if(writeFiles.includes(name)){const after=JSON.stringify(plan.outputs[name],null,2)+'\n';journal.files[name]={before,after,beforeHash:fileHash(before),afterHash:fileHash(after)};}else journal.otherHashes[name]=fileHash(before);}
    atomicWrite(paths.file,journal);
    for(const [index,name]of writeFiles.entries()){
      journalCheck(directory,journal);check(fileHash(fs.readFileSync(path.join(directory,name),'utf8'))===journal.files[name].beforeHash,'Unsafe overwrite refused');
      rawWrite(path.join(directory,name),journal.files[name].after);journal.status='writing';journal.written=index+1;atomicWrite(paths.file,journal);afterWrite?.(index+1);
    }
    journalCheck(directory,journal);for(const name of writeFiles)check(digest(JSON.parse(fs.readFileSync(path.join(directory,name),'utf8')))===digest(plan.outputs[name]),'Written output differs from validated plan');journal.status='completed';journal.afterFingerprint=productionFingerprint(directory);atomicWrite(paths.file,journal);
    const integrationReceipt={applied:true,jobId:job.id,packageHash:plan.packageHash,beforeFingerprint:context.productionFingerprint,afterFingerprint:journal.afterFingerprint,journal:paths.file};
    return {applied:true,...plan,journal:paths.file,afterFingerprint:journal.afterFingerprint,integrationReceipt};
  });
}
export function recoverIntegration(directory,{apply=false}={}){
  const paths=journalPaths(directory);
  const inspect=()=>{check(fs.existsSync(paths.file),'No integration journal');const journal=JSON.parse(fs.readFileSync(paths.file,'utf8'));journalCheck(directory,journal);return journal;};
  if(!apply){const journal=inspect();return {applied:false,status:journal.status,action:['completed','rolled-back'].includes(journal.status)?'none':'rollback',files:writeFiles};}
  return withLock(paths.lock,()=>{
    const journal=inspect();if(['completed','rolled-back'].includes(journal.status))return {applied:false,status:journal.status};
    for(const name of writeFiles){journalCheck(directory,journal);rawWrite(path.join(directory,name),journal.files[name].before);}
    check(productionFingerprint(directory)===journal.beforeFingerprint,'Recovery fingerprint mismatch');journal.status='rolled-back';atomicWrite(paths.file,journal);return {applied:true,status:'rolled-back'};
  });
}
if(isCLI(import.meta.url)){
  try{
    const args=process.argv.slice(2),directory=args.includes('--root')?args[args.indexOf('--root')+1]:defaultRoot,apply=args.includes('--apply');
    if(args.includes('--recover'))console.log(JSON.stringify(recoverIntegration(directory,{apply}),null,2));
    else{
      const paths=args.filter((a,i)=>!a.startsWith('--')&&args[i-1]!=='--root');check(paths.length===3,'Usage: research-integrate package.json job.json receipt.json [--root directory] [--apply] | --recover [--apply]');
      const [pkg,job,receipt]=paths.map(p=>JSON.parse(fs.readFileSync(p,'utf8')));const result=integratePackage(directory,pkg,job,receipt,{apply});console.log(JSON.stringify({applied:result.applied,packageHash:result.packageHash,sourceAliases:result.sourceAliases,appended:result.appended.length,outputs:Object.keys(result.outputs)},null,2));
    }
  }catch(error){console.error(error.message);process.exitCode=1;}
}
