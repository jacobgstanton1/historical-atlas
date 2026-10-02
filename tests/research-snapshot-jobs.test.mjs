import test from 'node:test';
import assert from 'node:assert/strict';
import {readContext,digest} from '../scripts/research-common.mjs';
import {generateSnapshotJobs} from '../scripts/research-generate.mjs';
const context=readContext(),entityId='france-political-frameworks';
const gap=(year,category='leadership')=>({entityId,mapIds:['entity-france'],period:{from:String(year),until:String(year)},category,priority:80,cautions:['Preserve chronology'],reason:'Missing dated evidence',sourceIds:[]});
const result={model:'snapshot-entity-category',productionFingerprint:context.productionFingerprint,snapshots:[{year:1878,file:'world_1878.geojson'},{year:1880,file:'world_1880.geojson'}],gaps:[gap(1878),gap(1880),gap(1880,'capital')]};
test('Snapshot gaps become one bounded comprehensive job with multi-snapshot reuse',()=>{
  const before=digest(context),r=generateSnapshotJobs(result,context,{limit:1});
  assert.equal(r.jobs.length,1);assert.deepEqual(r.jobs[0].targetSnapshots,[1878,1880]);assert.deepEqual(r.jobs[0].period,{from:'1878',until:'1880'});assert.deepEqual(r.jobs[0].researchCategories,['capital','leadership']);assert.equal(r.jobs[0].categories.length,14);assert.equal(digest(context),before);
});
test('Snapshot job IDs are deterministic across gap order and prevent active duplicate work',()=>{
  const first=generateSnapshotJobs(result,context,{limit:1});assert.deepEqual(first,generateSnapshotJobs({...result,gaps:[...result.gaps].reverse()},context,{limit:1}));
  assert.equal(generateSnapshotJobs(result,context,{existingJobs:first.jobs}).jobs.length,0);
  assert.equal(generateSnapshotJobs(result,context,{existingJobs:[{entityId,period:{from:'1870',until:'1890'},categories:['leadership','capital'],status:'researching'}]}).jobs.length,0);
  assert.equal(generateSnapshotJobs(result,context,{existingJobs:first.jobs.map(j=>({...j,status:'integrated'}))}).jobs.length,1);
});
test('Snapshot generator refuses stale scans, unknown categories and unbounded job counts',()=>{
  assert.throws(()=>generateSnapshotJobs({...result,productionFingerprint:'stale'},context),/stale/);assert.throws(()=>generateSnapshotJobs(result,context,{limit:0}),/limit/);assert.throws(()=>generateSnapshotJobs(result,context,{categories:['made-up']}),/category/);
});
test('Unresolved raw identities remain review cases rather than guessed production assignments',()=>{
  const r=generateSnapshotJobs({...result,gaps:[{...gap(1880),entityId:null,category:'identity-review'}]},context);assert.equal(r.jobs.length,0);
});
