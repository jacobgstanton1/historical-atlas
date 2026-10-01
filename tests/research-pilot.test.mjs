import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {readContext,readJSON,digest,productionFingerprint} from '../scripts/research-common.mjs';
import {auditResearch} from '../scripts/research-audit.mjs';
import {buildReport} from '../scripts/research-report.mjs';
import {scan} from '../scripts/research-scan.mjs';
// Replay the retained pilot against its actual historical baseline, so a later
// explicitly authorised integration does not rewrite or invalidate Stage 1 history.
const baseline=readJSON(new URL('../research/baseline.json',import.meta.url));
const archived=file=>JSON.parse(execFileSync('git',['show',baseline.phase2Commit+':'+file],{encoding:'utf8',maxBuffer:20*1024*1024}));
const context={db:archived('data/historical-entities.json'),registry:archived('data/historical-sources.json'),manifest:archived('development/coverage/manifest.json'),plan:archived('development/coverage/research-plan.json'),productionFingerprint:baseline.productionFingerprint};
const queue=readJSON(new URL('../research/pilot/queue.json',import.meta.url));
const packages=fs.readdirSync(new URL('../research/pilot/packages/',import.meta.url)).filter(f=>f.endsWith('.json')).sort().map(f=>readJSON(new URL('../research/pilot/packages/'+f,import.meta.url)));
test('saved seven-package pilot has consistent references, receipts and durable outcomes',()=>{
  const report=auditResearch(context,queue,packages,{requireFinished:true});assert.deepEqual(report.errors,[]);assert.equal(report.packages,7);assert.equal(report.claims,11);assert.deepEqual(report.states,{accepted:6,'historical-review':1});
});
test('pilot research and review leave all audited production bytes unchanged',()=>{
  const before=productionFingerprint();auditResearch(context,queue,packages,{requireFinished:true});assert.equal(productionFingerprint(),before);
  assert.equal(queue.jobs.filter(j=>j.status==='integrated').length,0);assert.equal(context.db.entities.length,617);assert.equal(context.registry.sources.length,689);
});
test('population scope uncertainty remains outside acceptance; observation month stays explicit',()=>{
  const j=queue.jobs.find(j=>j.category==='population-statistics');assert.equal(j.status,'historical-review');assert.equal(j.package.claims[0].temporal.observationDate,'1925-06');assert.equal(j.package.claims[0].geographicScope.relationship,'uncertain');assert.equal(j.receipt,undefined);
});
test('Important Figures pilot uses selected-period activity and explicit colonial association',()=>{
  const j=queue.jobs.find(j=>j.category==='important-figures'),c=j.package.claims[0];assert.equal(j.status,'accepted');assert.equal(c.figure.personId,'albert-camus-1913-1960');assert.equal(c.figure.relevance.from,'1957-12-10');assert.match(c.figure.relationship,/French Algeria/);assert.ok(c.cautions.length);
});
test('tampered hashes, orphan packages and incomplete queue cannot pass research audit',()=>{
  const before=digest(context),q=structuredClone(queue);q.jobs[0].packageHash='tampered';assert.ok(auditResearch(context,q,packages).errors.some(e=>e.includes('hash retained')));
  const ps=structuredClone(packages);ps[0].jobId='orphan';assert.ok(auditResearch(context,queue,ps).errors.includes('No orphan packages'));
  q.jobs[0].status='researching';assert.ok(auditResearch(context,q,packages,{requireFinished:true}).errors.some(e=>e.includes('durable outcome')));assert.equal(digest(context),before);
});
test('reports separate accepted research from unchanged production figure coverage',()=>{
  const r=buildReport(scan(context),queue);assert.equal(r.queue.jobs,7);assert.equal(r.researchEvidence.acceptedClaimsByCategory['important-figures'],1);assert.equal(r.metrics.fieldCoverage['important-figures'].fullySupportedYears,0);assert.equal(r.metrics.resolverAvailability.covered,362);
});
