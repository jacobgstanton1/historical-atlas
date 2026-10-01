import test from 'node:test';
import assert from 'node:assert/strict';
import {buildReport,renderReport} from '../scripts/research-report.mjs';
const input={schemaVersion:1,productionFingerprint:'fingerprint',range:{from:1900,until:1901},metrics:{entitiesScanned:1,entityYearsScanned:2,totalGaps:2,politicalDenominator:401,unresolvedClassifications:72,mappingReviewIdentities:62},gaps:[1900,1901].map(y=>({entityId:'e',mapIds:['raw'],category:'population-statistics',reason:'No adequately sourced observation for the requested year.',period:{from:String(y),until:String(y)},cautions:['Nearby observations are evidence leads only: no interpolation.']}))};
test('report distinguishes year gaps from unique identities and queue status',()=>{
  const report=buildReport(input,{jobs:[{id:'a',status:'queued',productionFingerprint:'fingerprint'},{id:'b',status:'validated',productionFingerprint:'old'}]});
  assert.equal(report.categories['population-statistics'].gaps,2);assert.deepEqual(report.categories['population-statistics'].entityIds,['e']);
  assert.equal(report.metrics.politicalDenominator,401);assert.equal(report.queue.statuses.queued,1);assert.deepEqual(report.queue.staleJobs,['b']);
  assert.equal(report.categories['population-statistics'].nearbyObservationGaps,2);assert.match(renderReport(report),/not distinct states or missing required annual censuses/);
});
test('report is deterministic and leaves scan input untouched',()=>{
  const before=structuredClone(input);assert.deepEqual(buildReport(input),buildReport(input));assert.deepEqual(input,before);
  const text=renderReport(buildReport(input));assert.match(text,/unresolved classifications: 72/);assert.match(text,/mapping-review identities: 62/);
});
test('availability numerator and zero queue states remain explicit',()=>{
  const c=structuredClone(input);c.metrics.resolverAvailability={covered:362,candidates:401};const r=buildReport(c);assert.match(renderReport(r),/362\/401/);assert.equal(r.queue.statuses.accepted,0);assert.equal(r.queue.statuses.rejected,0);assert.equal(r.queue.statuses['awaiting-review'],0);assert.equal(r.queue.statuses.integrated,0);
});
