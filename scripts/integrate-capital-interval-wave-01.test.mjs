import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readJSON,digest,readContext} from './research-common.mjs';
import {integrateDossier,temporalBounds} from './research-comprehensive.mjs';
const dir='research/external-capital-interval-wave-01';
const supplied=readJSON(dir+'/supplied-package.json'),audit=readJSON(dir+'/validation.json'),store=readJSON('data/comprehensive-dossiers.json');
test('Every supplied interval and immutable target cell has an explicit disposition',()=>{
 assert.equal(digest(supplied),audit.originalInputHash);assert.equal(audit.dispositions.length,29);
 assert.deepEqual(audit.dispositions.map(d=>d.claimId),supplied.claims.map(c=>c.claimId));
 assert.equal(audit.dispositions.flatMap(d=>d.cells).length,140);
 for(const p of supplied.claims){const d=audit.dispositions.find(x=>x.claimId===p.claimId);assert.deepEqual(d.originalTemporal,p.temporal);assert.deepEqual(d.cells.map(c=>c.cellId),p.applicableCellIds);for(const c of d.cells)assert.ok(c.status==='integrated'||c.status==='held'&&c.reasons.length);}
});
test('Six accepted intervals span 29 listed cells without snapshot claim duplication',()=>{
 const additions=store.packages.filter(p=>p.id.startsWith('external-capital-interval-wave-01-'));
 assert.equal(additions.length,6);assert.equal(additions.flatMap(p=>p.claims).length,6);
 assert.equal(audit.dispositions.flatMap(d=>d.cells).filter(c=>c.status==='integrated').length,29);
 for(const pkg of additions){const c=pkg.claims[0];assert.equal(c.temporal.kind,'interval');assert.equal(c.origin.temporalBasis,'bounded-research-subset');assert.ok(/^\d{4}$/.test(c.temporal.from)&&/^\d{4}$/.test(c.temporal.until));const b=temporalBounds(c.temporal);for(const e of c.evidence){assert.equal(e.precision,'year');const eb=temporalBounds(e.temporal);assert.ok(eb.lo<=b.lo&&eb.hi>=b.hi);}const result=audit.results.find(r=>r.package.id===pkg.id);assert.ok(result.validation.valid);assert.equal(result.review.packageHash,digest(result.package));assert.notEqual(result.review.reviewer,pkg.worker.id);}
});
test('Existing accepted production packages, mappings and sources remain unchanged',()=>{
 const baseline=JSON.parse(execFileSync('git',['show','5a59fac49bfe9139e3299beb7abcff438fc31029:data/comprehensive-dossiers.json'],{encoding:'utf8',maxBuffer:50_000_000}));
 for(const p of baseline.packages)assert.deepEqual(store.packages.find(x=>x.id===p.id),p);
 const hashes=readJSON(dir+'/before-summary.json').inputHashes;
 // Compare captured working-tree bytes: Git may normalize pre-existing mixed line endings.
 for(const file of ['data/historical-entities.json','data/historical-sources.json'])assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),hashes[file]);
});
test('Protected overlap and Ceylon 1930 conflict remain held',()=>{
 const aef=audit.dispositions.find(d=>d.claimId==='capint-020');assert.equal(aef.status,'held');assert.ok(aef.reasons.some(r=>r.includes('Unsafe overlapping overwrite')));
 const ceylon=audit.dispositions.find(d=>d.claimId==='capint-029');assert.equal(ceylon.status,'partially-integrated');assert.ok(ceylon.cells.find(c=>c.cellId.includes('@1930')).reasons.some(r=>r.includes('Galle Face')));
});
test('Stale receipts cannot replay integration or mutate production',()=>{
 const r=audit.results.find(r=>r.integration?.applied),before=fs.readFileSync('data/comprehensive-dossiers.json');
 assert.throws(()=>integrateDossier(r.package,r.job,readContext(process.cwd()),r.receipt,{apply:true}),/Stale or missing acceptance receipt/);
 assert.deepEqual(fs.readFileSync('data/comprehensive-dossiers.json'),before);
});
