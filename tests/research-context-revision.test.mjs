import test from 'node:test';
import assert from 'node:assert/strict';
import {createQueue,transitionQueue,packageDigest} from '../scripts/research-queue.mjs';
const actor={role:'coordinator',id:'reviewer'},original='a'.repeat(64),fresh='b'.repeat(64);
function submitted(){const j={id:'j',entityId:'e',mapIds:['raw'],period:{from:'1900',until:'1910'},category:'leadership',productionFingerprint:original};let q=createQueue([j]);q=transitionQueue(q,'claim',{jobId:'j',workerId:'w'});return transitionQueue(q,'submit',{jobId:'j',workerId:'w',package:{jobId:'j',worker:{id:'w'},productionFingerprint:original,claims:[{value:'Sourced leader'}]}});}
const args=q=>({jobId:'j',actor,reason:'Previous serial integration changed context; source/chronology must be reviewed again',expectedPackageHash:q.jobs[0].packageHash,productionFingerprint:fresh});
test('context revision archives unchanged evidence and removes any old acceptance',()=>{
  const q=submitted(),old=structuredClone(q.jobs[0].package);q.jobs[0].status='accepted';q.jobs[0].receipt={status:'accepted'};
  const next=transitionQueue(q,'recontextualize',args(q),{context:{productionFingerprint:fresh}}),j=next.jobs[0];
  assert.equal(j.status,'submitted');assert.equal(j.receipt,undefined);assert.equal(j.validation,undefined);assert.deepEqual(j.contextRevisions[0].package,old);
  assert.deepEqual(j.package.claims,old.claims);assert.equal(j.packageHash,packageDigest(j.package));assert.equal(q.jobs[0].productionFingerprint,original);
});
test('workers, stale hashes, unverified context and integrated packages cannot revise context',()=>{
  const q=submitted();assert.throws(()=>transitionQueue(q,'recontextualize',{...args(q),actor:{role:'worker',id:'w'}},{context:{productionFingerprint:fresh}}),/Coordinator/);
  assert.throws(()=>transitionQueue(q,'recontextualize',{...args(q),expectedPackageHash:'bad'},{context:{productionFingerprint:fresh}}),/expected package hash/);
  assert.throws(()=>transitionQueue(q,'recontextualize',args(q)),/Verified new/);q.jobs[0].status='integrated';assert.throws(()=>transitionQueue(q,'recontextualize',args(q),{context:{productionFingerprint:fresh}}),/unintegrated/);
});
