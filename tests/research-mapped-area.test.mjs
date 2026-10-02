import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import {readJSON,digest} from '../scripts/research-common.mjs';
import {integrateCertified} from '../scripts/research-completion-integrate.mjs';
const base='research/completion-02/area',cohort=readJSON(base+'/intake/cohort.json'),cert=readJSON(base+'/intake/certificate.json'),raw=readJSON(base+'/derived-observations.json'),baseline=readJSON(base+'/baseline.json');
test('Source certificate binds every exact snapshot and immutable extractor input',()=>{
 assert.equal(cert.cohortHash,digest(cohort));
 assert.equal(cert.inputBindings.filter(b=>b.path.endsWith('.geojson')).length,11);
 for(const b of cert.inputBindings)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(b.path)).digest('hex'),b.sha256,b.path);
});
test('No existing supported area slot overwritten, no point turned into interval',()=>{
 const seen=new Set();
 for(const c of cohort.claims){
  const key=c.entityId+':'+c.temporal.observationDate;assert(!seen.has(key));seen.add(key);
  const row=baseline.rows.find(r=>r.entityId===c.entityId&&String(r.snapshotYear)===c.temporal.observationDate);
  assert(row);assert.notEqual(row.categories['area-statistics'].status,'supported');assert(!row.mappingPartial);
  assert.equal(c.temporal.kind,'observation');assert.equal(c.evidence[0].temporal.observationDate,c.temporal.observationDate);
  assert(c.qualifications.some(s=>s.includes('not an official')));
 }
});
test('Invalid topology and partial mappings remain outside accepted claims',()=>{
 assert(raw.held.some(r=>r.reason.includes('Invalid source polygon')));
 assert(raw.held.some(r=>r.reason.includes('Partial year/entity mapping')));
 for(const h of raw.held)assert(!cohort.claims.some(c=>c.entityId===h.entityId&&c.temporal.observationDate===String(h.year)));
});
test('Tampered candidate rejected before production read or mutation',()=>{
 const changed=structuredClone(cohort);changed.claims[0].value++;
 assert.throws(()=>integrateCertified(changed,cert),/certificate/);
});
test('Tampered source binding rejected before any integration',()=>{
 const changed=structuredClone(cert);changed.inputBindings[0].sha256='0'.repeat(64);
 assert.throws(()=>integrateCertified(cohort,changed),/Certified input changed/);
});
