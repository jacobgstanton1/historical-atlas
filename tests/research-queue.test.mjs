import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createQueue,transitionQueue,initializeQueue,updateQueue,readQueue,withLock,packageDigest,inspectLock,recoverLock} from '../scripts/research-queue.mjs';
const actor={role:'coordinator',id:'reviewer'};
const job=id=>({id,entityId:'e',mapIds:['raw'],category:'leadership',period:{from:'1900',until:'1901'},productionFingerprint:'a'.repeat(64)});
const pkg=id=>({jobId:id,worker:{id:'worker'},productionFingerprint:'a'.repeat(64),claims:[{reviewStatus:'clear',geographicScope:{relationship:'same'}}]});
const validation=(p)=>({valid:true,errors:[],review:['Independent historical review required'],status:'historical-review',packageHash:packageDigest(p)});
function submitted(){let s=createQueue([job('one')]);s=transitionQueue(s,'claim',{jobId:'one',workerId:'worker'});return transitionQueue(s,'submit',{jobId:'one',workerId:'worker',package:pkg('one')});}
test('claim ownership and capacity are exclusive and input stays immutable',()=>{
  const input=createQueue([job('one'),job('two')],{concurrency:1});const s=transitionQueue(input,'claim',{jobId:'one',workerId:'worker'});
  assert.equal(input.jobs[0].status,'queued');assert.throws(()=>transitionQueue(s,'claim',{jobId:'two',workerId:'other'}),/concurrency/);
  assert.throws(()=>transitionQueue(s,'submit',{jobId:'one',workerId:'other',package:pkg('one')}),/own/);
  assert.throws(()=>transitionQueue(s,'claim',{jobId:'one',workerId:'worker'}),/queued/);
});
test('workers cannot self-accept; independent coordinator review and exact hash required',()=>{
  let s=submitted();assert.throws(()=>transitionQueue(s,'accept',{jobId:'one',actor:{role:'worker',id:'worker'}}),/Coordinator/);
  s=transitionQueue(s,'validate',{jobId:'one',actor},{validatePackage:validation,context:{}});assert.equal(s.jobs[0].status,'historical-review');
  assert.throws(()=>transitionQueue(s,'accept',{jobId:'one',actor,productionFingerprint:'a'.repeat(64),rationale:'Read body'}),/explicitly resolved/);
  s=transitionQueue(s,'accept',{jobId:'one',actor,productionFingerprint:'a'.repeat(64),reviewResolved:true,reviewedIssues:s.jobs[0].validation.review,rationale:'Independently read the cited body and confirmed the dated office.'});assert.equal(s.jobs[0].receipt.packageHash,packageDigest(pkg('one')));
  assert.throws(()=>transitionQueue(s,'retry',{jobId:'one',actor,reason:'reset'}),/retried/);
});
test('lock rejects asynchronous operations and recovery refuses a live owner',async()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'atlas-lock-test-')),file=path.join(dir,'queue.json');try{
    assert.throws(()=>withLock(file,async()=>{}),/synchronous/);
    let resolve;const pending=new Promise(r=>{resolve=r;});assert.throws(()=>withLock(file,()=>pending),/synchronous/);assert.ok(inspectLock(file));resolve();await pending;await new Promise(r=>setImmediate(r));assert.equal(inspectLock(file),null);
    withLock(file,()=>assert.throws(()=>recoverLock(file,{actor,reason:'Interrupted process',expectedOwner:inspectLock(file)}),/alive/));
    fs.writeFileSync(file+'.lock',JSON.stringify({pid:2147483647,createdAt:'synthetic exited owner'}));const owner=inspectLock(file);
    assert.throws(()=>recoverLock(file,{actor,reason:'Confirmed process exited',expectedOwner:{...owner,pid:123}}),/changed/);
    assert.equal(recoverLock(file,{actor,reason:'Confirmed process exited',expectedOwner:owner}).recovered,true);
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('integrated transition requires verified journal receipt and actual fingerprint',()=>{
  let s=submitted();s=transitionQueue(s,'validate',{jobId:'one',actor},{validatePackage:validation,context:{}});s=transitionQueue(s,'accept',{jobId:'one',actor,productionFingerprint:'a'.repeat(64),reviewResolved:true,reviewedIssues:s.jobs[0].validation.review,rationale:'Independently confirmed.'});
  const integrationReceipt={applied:true,jobId:'one',packageHash:s.jobs[0].packageHash,beforeFingerprint:'a'.repeat(64),afterFingerprint:'b'.repeat(64)};
  assert.throws(()=>transitionQueue(s,'integrated',{jobId:'one',actor,integrationReceipt}),/verified current/);
  assert.throws(()=>transitionQueue(s,'integrated',{jobId:'one',actor,integrationReceipt},{productionFingerprint:'b'.repeat(64),verifyIntegration:()=>false}),/durable completed/);
  assert.equal(transitionQueue(s,'integrated',{jobId:'one',actor,integrationReceipt},{productionFingerprint:'b'.repeat(64),verifyIntegration:()=>true}).jobs[0].status,'integrated');
});
test('required/unresolved claims require amended resubmission rather than generic rationale',()=>{
  for(const status of ['required','unresolved']){let s=submitted();s.jobs[0].package.claims[0].reviewStatus=status;s.jobs[0].packageHash=packageDigest(s.jobs[0].package);s=transitionQueue(s,'validate',{jobId:'one',actor},{validatePackage:validation,context:{}});assert.throws(()=>transitionQueue(s,'accept',{jobId:'one',actor,productionFingerprint:'a'.repeat(64),reviewResolved:true,rationale:'Looks fine'}),/amended package/);}
});
test('retry and interrupted recovery retain history and cannot revoke acceptance',()=>{
  let s=createQueue([job('one')]);s=transitionQueue(s,'claim',{jobId:'one',workerId:'worker'});
  assert.throws(()=>transitionQueue(s,'recover',{jobId:'one',actor,reason:'interrupt'}),/interruption/);
  s=transitionQueue(s,'recover',{jobId:'one',actor,reason:'process interrupted',interrupted:true});assert.equal(s.jobs[0].status,'queued');assert.equal(s.jobs[0].history.length,2);
  s=transitionQueue(s,'reject',{jobId:'one',actor,reason:'insufficient sources'});s=transitionQueue(s,'retry',{jobId:'one',actor,reason:'new source available'});assert.equal(s.jobs[0].status,'queued');assert.equal(s.jobs[0].attempt,1);
});
test('durable queue refuses competing lock and saves exactly one revision',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'atlas-queue-test-')),file=path.join(dir,'queue.json');try{
    initializeQueue(file,[job('one')]);assert.throws(()=>initializeQueue(file,[job('one')]),/exists/);
    withLock(file,()=>assert.throws(()=>updateQueue(file,'claim',{jobId:'one',workerId:'worker'}),/lock is held/));
    updateQueue(file,'claim',{jobId:'one',workerId:'worker'});assert.equal(readQueue(file).revision,1);assert.equal(fs.existsSync(file+'.lock'),false);
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('null identities are reserved for review jobs',()=>{
  assert.equal(createQueue([{...job('one'),entityId:null,category:'identity-review'}]).jobs[0].entityId,null);
  assert.throws(()=>createQueue([{...job('one'),entityId:null}]),/Incomplete/);
});
