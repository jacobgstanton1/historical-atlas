import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {root,readJSON,readContext,digest} from '../scripts/research-common.mjs';
import {wrapFlagBundle,verifyFlagBundle} from '../scripts/research-wrap-flags.mjs';
const directory=path.join(root,'research/scale-01/flags');
const bundle=readJSON(path.join(directory,'bundles/belgium-kingdom.json'));
const review=readJSON(path.join(directory,'reviews/belgium-kingdom.json'));
test('technical envelope preserves dated meaning and original decisions',()=>{
 const x=wrapFlagBundle(bundle,review,readContext(),directory);
 assert.deepEqual(x.pkg.claims[0].temporal,bundle.claims[0].temporal);
 assert.equal(x.pkg.claims[0].value,bundle.claims[0].value);
 assert.deepEqual(x.pkg.claims[0].flag,bundle.claims[0].flag);
 assert.deepEqual(x.review.decisions,review.decisions);
 assert.equal(x.review.packageHash,digest(x.pkg));
 assert.deepEqual(x.review.originalBundleReview,review);
 assert.equal(x.pkg.investigation.length,14);
 assert.equal(x.pkg.investigation.filter(i=>i.status==='unresolved').length,13);
 assert.ok(x.validation.errors.every(e=>e==='Flag asset missing or unreadable'));
});
test('exact source URL reuse aliases claim/evidence/asset provenance together',()=>{
 const context=readContext(),assetSource=bundle.sources.find(s=>s.id===bundle.claims[0].flag.assetSourceIds[0]),reused={...assetSource,id:'test-reused-flag-source'};
 context.registry.sources.push(reused);
 const x=wrapFlagBundle(bundle,review,context,directory),claim=x.pkg.claims[0];
 assert.ok(claim.sourceIds.includes(reused.id));
 assert.deepEqual(claim.flag.assetSourceIds,[reused.id]);
 assert.ok(claim.evidence.some(e=>e.sourceId===reused.id));
 assert.ok(!x.pkg.sources.some(s=>s.url===assetSource.url));
});
test('review binding rejects changed flag temporal meaning',()=>{
 const changed=structuredClone(bundle);changed.claims[0].temporal.from='1800';
 assert.throws(()=>verifyFlagBundle(changed,review,directory),/changed since independent review/);
});
test('review binding rejects altered staged SVG and supplied source body hash',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'atlas-wrap-flags-test-'));fs.mkdirSync(path.join(temp,'staged-assets'));fs.mkdirSync(path.join(temp,'cache'));
 for(const relative of Object.keys(review.sourceBodyHashes))fs.copyFileSync(path.join(directory,relative),path.join(temp,relative));
 const asset=path.join(temp,'staged-assets',path.basename(bundle.claims[0].flag.asset));fs.copyFileSync(path.join(directory,'staged-assets',path.basename(asset)),asset);
 const bad=structuredClone(review);bad.sourceBodyHashes['cache/be-history.html']='0'.repeat(64);
 assert.throws(()=>verifyFlagBundle(bundle,bad,temp),/source body cache changed/);
 fs.writeFileSync(asset,'<svg xmlns="http://www.w3.org/2000/svg"></svg>');
 assert.throws(()=>verifyFlagBundle(bundle,review,temp),/staged SVG changed/);
});
test('absent optional cache preserves independently route-reviewed evidence',()=>{
 const italy=readJSON(path.join(directory,'bundles/italy-republican-1948-framework.json')),original=readJSON(path.join(directory,'reviews/italy-republican-1948-framework.json'));
 const x=wrapFlagBundle(italy,original,readContext(),directory);
 assert.ok(x.review.uncachedSourceBodies.includes('cache/it-history.html'));
 assert.ok(x.review.rationale.includes('no invented hash'));
 assert.deepEqual(x.review.originalBundleReview,original);
});
test('held original decisions never become accepted through wrapping',()=>{
 const narrowed=structuredClone(review);narrowed.decisions[bundle.claims[0].id]='held';
 const x=wrapFlagBundle(bundle,narrowed,readContext(),directory);
 assert.equal(x.review.decisions[bundle.claims[0].id],'held');
});
