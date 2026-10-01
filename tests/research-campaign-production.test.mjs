import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readContext,readJSON,digest} from '../scripts/research-common.mjs';
const archived=f=>JSON.parse(execFileSync('git',['show','c1309b4:'+f],{encoding:'utf8',maxBuffer:20*1024*1024}));
test('Campaign 1 preserves every existing sourced fact and source as immutable prefixes',()=>{
 const c=readContext(),old=archived('data/historical-entities.json'),sources=archived('data/historical-sources.json');
 for(const e of old.entities){const now=c.db.entities.find(x=>x.id===e.id);assert.ok(now,e.id);for(const [key,value]of Object.entries(e))assert.equal(digest(Array.isArray(value)?now[key].slice(0,value.length):now[key]),digest(value),e.id+' '+key);}
 assert.equal(digest(c.registry.sources.slice(0,sources.sources.length)),digest(sources.sources));assert.equal(digest(c.db.mappings.slice(0,old.mappings.length)),digest(old.mappings));
});
test('completed campaign receipts identify actual dated sourced append-only production claims',()=>{
 const c=readContext(),q=readJSON(new URL('../research/campaign-01/queue.json',import.meta.url));
 for(const j of q.jobs.filter(j=>j.status==='integrated'))for(const claim of j.package.claims){
  const e=c.db.entities.find(e=>e.id===j.entityId),facts=Object.values(e).filter(Array.isArray).flat(),matches=facts.filter(f=>f.researchProvenance?.claimId===claim.id);
  assert.equal(matches.length,1,claim.id);const f=matches[0];assert.equal(f.value,claim.value);assert.equal(f.validFrom,claim.temporal.from);assert.equal(f.validUntil,claim.temporal.until);assert.ok(f.sourceIds.every(id=>c.registry.sources.some(s=>s.id===id)));assert.equal(j.integrationReceipt.packageHash,j.packageHash);
 }
});
