import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {digest,productionFiles,readContext,productionFingerprint} from '../scripts/research-common.mjs';
import {planIntegration,integratePackage,recoverIntegration} from '../scripts/research-integrate.mjs';
import {withLock,inspectLock,recoverLock} from '../scripts/research-queue.mjs';
import {validatePackage} from '../scripts/research-validator.mjs';
function fixture(){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'atlas-integration-test-'));
  const entity={id:'e',existence:{validFrom:'1900-01-01',validUntil:'1910-01-01',sourceIds:['old']}};
  for(const field of ['names','aliases','flags','politicalStatus','capitals','governments','leaders','population','economy','area','currencies','relationships','predecessors','successors','events','descriptions'])entity[field]=[];
  const db={schemaVersion:1,entities:[entity],mappings:[{mapId:'raw',entityId:'e'}]},registry={schemaVersion:1,sources:[{id:'old',title:'Original institutional report',institution:'Archive',url:'https://example.org/original',accessed:'2026-10-01',usage:'Primary body read'}]};
  for(const file of productionFiles){const abs=path.join(dir,file);fs.mkdirSync(path.dirname(abs),{recursive:true});fs.writeFileSync(abs,file.endsWith('historical-entities.json')?JSON.stringify(db):file.endsWith('historical-sources.json')?JSON.stringify(registry):'synthetic fixture '+file);}
  const dev=path.join(dir,'development','coverage');fs.mkdirSync(dev,{recursive:true});for(const file of ['manifest.json','research-plan.json'])fs.writeFileSync(path.join(dev,file),'{}');
  const fingerprint=productionFingerprint(dir),job={id:'job',entityId:'e',mapIds:['raw'],period:{from:'1900-01-01',until:'1910-01-01'},category:'leadership',productionFingerprint:fingerprint};
  const pkg={schemaVersion:1,id:'package',jobId:'job',worker:{id:'worker',specialism:'leadership'},productionFingerprint:fingerprint,entityId:'e',mapIds:['raw'],period:job.period,category:'leadership',claims:[{id:'claim',category:'leadership',value:'Historically documented officeholder',entityId:'e',role:'Prime minister',temporal:{kind:'interval',from:'1901-01-01',until:'1902-01-01'},geographicScope:{description:'Same historical entity',relationship:'same'},sourceIds:['old'],evidence:[{sourceId:'old',note:'Independently read primary body identifies this exact term.',supportedPrecision:'day',supportsClaim:true}],reviewStatus:'clear',cautions:[]}],sources:[],absenceOfEvidence:[],reviewNotes:[]};
  const receipt=(context=readContext(dir))=>({schemaVersion:1,status:'accepted',jobId:'job',packageHash:digest(pkg),productionFingerprint:fingerprint,coordinator:{id:'reviewer',role:'coordinator'},rationale:'Independently reviewed body and dated role; no political inference.',reviewResolved:true,reviewedIssues:validatePackage(pkg,job,context).review});
  return {dir,job,pkg,receipt,cleanup:()=>fs.rmSync(dir,{recursive:true,force:true})};
}
test('pure planning and default dry-run leave every production byte unchanged',()=>{
  const f=fixture();try{const before=productionFingerprint(f.dir),c=readContext(f.dir),p=planIntegration(f.pkg,f.job,c,f.receipt());assert.equal(p.db.entities[0].leaders.length,1);assert.equal(c.db.entities[0].leaders.length,0);const r=integratePackage(f.dir,f.pkg,f.job,f.receipt());assert.equal(r.applied,false);assert.equal(productionFingerprint(f.dir),before);assert.equal(fs.existsSync(path.join(f.dir,'research')),false);}finally{f.cleanup();}
});
test('accepted apply appends only two data files and preserves existing records/maps',()=>{
  const f=fixture();try{const front=productionFiles.slice(2).map(x=>fs.readFileSync(path.join(f.dir,x),'utf8'));const r=integratePackage(f.dir,f.pkg,f.job,f.receipt(),{apply:true});assert.equal(r.applied,true);assert.equal(readContext(f.dir).db.entities[0].leaders.length,1);assert.deepEqual(readContext(f.dir).db.mappings,[{mapId:'raw',entityId:'e'}]);assert.deepEqual(productionFiles.slice(2).map(x=>fs.readFileSync(path.join(f.dir,x),'utf8')),front);assert.throws(()=>integratePackage(f.dir,f.pkg,f.job,f.receipt(),{apply:true}),/Stale production/);}finally{f.cleanup();}
});
test('receipt tampering, unsafe reviews and Important Figures fail closed',()=>{
  const f=fixture();try{assert.throws(()=>planIntegration(f.pkg,f.job,readContext(f.dir),{...f.receipt(),packageHash:'bad'}),/package hash/);f.pkg.claims[0].reviewStatus='required';assert.throws(()=>planIntegration(f.pkg,f.job,readContext(f.dir),f.receipt()),/Unsafe historical/);f.pkg.claims[0].reviewStatus='clear';f.pkg.category=f.job.category=f.pkg.claims[0].category='important-figures';assert.throws(()=>planIntegration(f.pkg,f.job,readContext(f.dir),f.receipt()),/Unsupported production category/);}finally{f.cleanup();}
});
test('source exact URL reuse retains original source, remaps claim and refuses source overwrite',()=>{
  const f=fixture();try{f.pkg.sources=[{id:'proposal',title:'Independent reading',institution:'Archive',url:'https://example.org/original',accessed:'2026-10-01',usage:'Read full primary body.',kind:'primary'}];f.pkg.claims[0].sourceIds=['proposal'];f.pkg.claims[0].evidence[0].sourceId='proposal';const p=planIntegration(f.pkg,f.job,readContext(f.dir),f.receipt());assert.equal(p.registry.sources.length,1);assert.deepEqual(p.appended[0].fact.sourceIds,['old']);assert.equal(p.registry.sources[0].title,'Original institutional report');f.pkg.sources[0].id='old';f.pkg.sources[0].url='https://example.org/other';assert.throws(()=>planIntegration(f.pkg,f.job,readContext(f.dir),f.receipt()),/overwrite refused/);}finally{f.cleanup();}
});
test('conflicting overlapping office facts refuse even with accepted review receipt',()=>{
  const f=fixture();try{const c=readContext(f.dir);c.db.entities[0].leaders.push({value:'Different officeholder',role:'Prime minister',validFrom:'1901-01-01',validUntil:'1903-01-01',sourceIds:['old']});assert.throws(()=>planIntegration(f.pkg,f.job,c,f.receipt(c)),/Conflicting production/);}finally{f.cleanup();}
});
test('distinct same-day events coexist, duplicate event identities refuse, provenance survives',()=>{
  const f=fixture();try{
    f.job.category=f.pkg.category=f.pkg.claims[0].category='events-context';f.pkg.worker.specialism='events-context';
    f.pkg.claims[0].value='A sourced constitutional event';f.pkg.claims[0].temporal={kind:'observation',observationDate:'1901-01-01'};
    const c=readContext(f.dir);c.db.entities[0].events.push({date:'1901-01-01',title:'Another independently sourced event',sourceIds:['old']});
    const p=planIntegration(f.pkg,f.job,c,f.receipt(c));assert.equal(p.db.entities[0].events.length,2);assert.equal(p.appended[0].fact.title,'A sourced constitutional event');assert.equal(p.appended[0].fact.researchProvenance.jobId,'job');
    c.db.entities[0].events[0].title='A sourced constitutional event';assert.throws(()=>planIntegration(f.pkg,f.job,c,f.receipt(c)),/Duplicate dated event/);
  }finally{f.cleanup();}
});
test('serialized apply refuses held lock and journal rolls back a partial write',()=>{
  const f=fixture();try{const before=productionFingerprint(f.dir);withLock(path.join(f.dir,'research','.integration-state'),()=>assert.throws(()=>integratePackage(f.dir,f.pkg,f.job,f.receipt(),{apply:true}),/lock is held/));assert.throws(()=>integratePackage(f.dir,f.pkg,f.job,f.receipt(),{apply:true,afterWrite:()=>{throw Error('Simulated interruption');}}),/Simulated interruption/);assert.equal(recoverIntegration(f.dir).action,'rollback');assert.notEqual(productionFingerprint(f.dir),before);assert.throws(()=>integratePackage(f.dir,f.pkg,f.job,f.receipt(),{apply:true}),/recovered first/);assert.equal(recoverIntegration(f.dir,{apply:true}).status,'rolled-back');assert.equal(productionFingerprint(f.dir),before);}finally{f.cleanup();}
});
test('recovery refuses unrelated edits rather than clobbering them',()=>{
  const f=fixture();try{assert.throws(()=>integratePackage(f.dir,f.pkg,f.job,f.receipt(),{apply:true,afterWrite:()=>{throw Error('interrupt');}}));fs.writeFileSync(path.join(f.dir,'app.js'),'externally edited');assert.throws(()=>recoverIntegration(f.dir,{apply:true}),/External production modification/);assert.equal(fs.readFileSync(path.join(f.dir,'app.js'),'utf8'),'externally edited');}finally{f.cleanup();}
});
test('hard process exit retains lock and journal; inspected exited owner can be explicitly recovered',()=>{
  const f=fixture();try{
    const before=productionFingerprint(f.dir),module=new URL('../scripts/research-integrate.mjs',import.meta.url).href;
    const script=`import {integratePackage} from ${JSON.stringify(module)};const [directory,pkg,job,receipt]=process.argv.slice(1);integratePackage(directory,JSON.parse(pkg),JSON.parse(job),JSON.parse(receipt),{apply:true,afterWrite:()=>process.exit(73)});`;
    const child=spawnSync(process.execPath,['--input-type=module','-e',script,f.dir,JSON.stringify(f.pkg),JSON.stringify(f.job),JSON.stringify(f.receipt())],{encoding:'utf8'});assert.equal(child.status,73,child.stderr);
    const lock=path.join(f.dir,'research','.integration-state'),owner=inspectLock(lock);assert.ok(owner);assert.throws(()=>recoverIntegration(f.dir,{apply:true}),/lock is held/);
    recoverLock(lock,{actor:{role:'coordinator',id:'reviewer'},reason:'Child process exit verified with code 73',expectedOwner:owner});assert.equal(recoverIntegration(f.dir,{apply:true}).status,'rolled-back');assert.equal(productionFingerprint(f.dir),before);
  }finally{f.cleanup();}
});
test('unused source proposals and incomplete review receipts cannot reach production',()=>{
  const f=fixture();try{
    assert.throws(()=>planIntegration(f.pkg,f.job,readContext(f.dir),{...f.receipt(),reviewedIssues:[]}),/every validation review/);
    f.pkg.sources.push({id:'unused',title:'Unused report',institution:'Archive',url:'https://example.org/unused',accessed:'2026-10-01',usage:'Full body read',kind:'primary'});assert.throws(()=>planIntegration(f.pkg,f.job,readContext(f.dir),f.receipt()),/Unused source/);
  }finally{f.cleanup();}
});
test('area observations remain explicitly unintegrated because production area uses intervals',()=>{
  const f=fixture();try{
    f.pkg.category=f.job.category=f.pkg.claims[0].category='area-statistics';f.pkg.worker.specialism='population-statistics';f.pkg.claims[0].temporal={kind:'observation',observationDate:'1901'};f.pkg.claims[0].value=123;f.pkg.claims[0].metric='Square kilometres';delete f.pkg.claims[0].role;
    assert.throws(()=>planIntegration(f.pkg,f.job,readContext(f.dir),f.receipt()),/Observation cannot be represented safely in production field area/);
  }finally{f.cleanup();}
});
