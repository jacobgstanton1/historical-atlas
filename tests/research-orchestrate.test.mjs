import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {runAction} from '../scripts/research-orchestrate.mjs';
import {readJSON,digest} from '../scripts/research-common.mjs';
const packageTemplate=readJSON(new URL('../research/fixtures/valid-package.json',import.meta.url));
test('model-independent adapter persists an independently reviewed package without touching context',()=>{
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'atlas-orchestration-'));
  try {
    const context={productionFingerprint:packageTemplate.productionFingerprint,db:{entities:[{id:packageTemplate.entityId,existence:{validFrom:'1800',validUntil:'1961'}}],mappings:packageTemplate.mapIds.map(mapId=>({mapId,entityId:packageTemplate.entityId,validFrom:'1800',validUntil:'1961'}))},registry:{sources:[]},manifest:{}};
    const before=digest(context),queue=path.join(directory,'queue.json'),jobs=path.join(directory,'jobs.json'),pkg=path.join(directory,'package.json'),review=path.join(directory,'review.json');
    const job={id:packageTemplate.jobId,entityId:packageTemplate.entityId,mapIds:packageTemplate.mapIds,period:packageTemplate.period,category:packageTemplate.category,productionFingerprint:packageTemplate.productionFingerprint};
    fs.writeFileSync(jobs,JSON.stringify({concurrency:3,jobs:[job]}));fs.writeFileSync(pkg,JSON.stringify(packageTemplate));
    runAction('init',queue,jobs,undefined,{context});runAction('claim',queue,job.id,packageTemplate.worker.id,{context});runAction('submit',queue,job.id,pkg,{context});
    const validated=runAction('validate',queue,job.id,undefined,{context});assert.equal(validated.jobs[0].status,'historical-review');
    fs.writeFileSync(review,JSON.stringify({rationale:'Synthetic coordinator evidence review only.',reviewResolved:true,reviewedIssues:validated.jobs[0].validation.review}));
    const accepted=runAction('accept',queue,job.id,review,{context});assert.equal(accepted.jobs[0].status,'accepted');assert.equal(accepted.jobs[0].receipt.packageHash,digest(packageTemplate));assert.equal(digest(context),before);
    assert.throws(()=>runAction('claim',queue,job.id,'another-worker',{context}),/not queued/);
  } finally {fs.rmSync(directory,{recursive:true,force:true});}
});
