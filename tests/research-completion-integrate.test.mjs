import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {digest,readContext,readJSON} from '../scripts/research-common.mjs';
import {integrateCertified} from '../scripts/research-completion-integrate.mjs';
const file='data/historical-entities.json',hash=()=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function inputs(){const cohort={id:'test-intake',worker:'test-extractor',claims:[]};return{cohort,certificate:{cohortHash:digest(cohort),bodyReviewed:true,reviewer:'test-independent-review',acceptedClaimIds:[],inputBindings:[{path:file,sha256:hash()}],rationale:'Test certificate only.'}};}
test('changed cohort and self-review fail before production mutation',()=>{const {cohort,certificate}=inputs(),before=readContext().productionFingerprint;assert.throws(()=>integrateCertified({...cohort,id:'changed'},certificate));assert.throws(()=>integrateCertified(cohort,{...certificate,reviewer:cohort.worker}));assert.equal(readContext().productionFingerprint,before);});
test('changed source certificate fails closed',()=>{const {cohort,certificate}=inputs();certificate.inputBindings[0].sha256='0'.repeat(64);assert.throws(()=>integrateCertified(cohort,certificate),/Certified input changed/);});
test('empty preview is immutable and preserves existing accepted packages',()=>{const {cohort,certificate}=inputs(),before=digest(readJSON('data/comprehensive-dossiers.json'));const r=integrateCertified(cohort,certificate);assert.equal(r.integrations.length,0);assert.equal(r.before.productionFingerprint,r.after.productionFingerprint);assert.equal(digest(readJSON('data/comprehensive-dossiers.json')),before);});
test('unaccepted claims cannot enter serial intake',()=>{const {cohort,certificate}=inputs();cohort.claims=[{id:'not-reviewed',entityId:'united-states'}];certificate.cohortHash=digest(cohort);assert.throws(()=>integrateCertified(cohort,certificate),/Unaccepted claim/);});
