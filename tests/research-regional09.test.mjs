import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {digest} from '../scripts/research-common.mjs';
const json=p=>JSON.parse(fs.readFileSync(p));
const baseline='13311a1a873a27636aa327f1ed86392a086bc5f1';
test('South America intake preserves every previously accepted package',()=>{
 const old=JSON.parse(execFileSync('git',['show',baseline+':data/comprehensive-dossiers.json'],{maxBuffer:100*1024*1024}));
 const current=json('data/comprehensive-dossiers.json');
 for(const p of old.packages)assert.equal(digest(current.packages.find(x=>x.id===p.id)),digest(p));
});
test('Frozen product and historical entity/source registries remain unchanged',()=>{
 for(const path of ['app.js','styles.css','index.html','data-pipeline.js','rich-dossier.js','dossier-presentation.js','atlas-state.js','data/historical-entities.json','data/historical-sources.json']){
  if(!fs.existsSync(path))continue;
  assert.equal(fs.readFileSync(path,'utf8').replaceAll('\r\n','\n'),execFileSync('git',['show',baseline+':'+path],{maxBuffer:100*1024*1024,encoding:'utf8'}).replaceAll('\r\n','\n'));
 }
});
for(const dir of ['brazil','southern','andean','guianas'])test('Independent immutable source certificate: '+dir,()=>{
 const base='research/regional-09/'+dir+'/',c=json(base+'accepted-cohort.json'),r=json(base+'certificate.json');
 assert.equal(r.cohortHash,digest(c));assert.notEqual(r.reviewer,c.worker);assert.equal(r.bodyReviewed,true);
 assert.deepEqual(r.acceptedClaimIds.toSorted(),c.claims.map(x=>x.id).toSorted());
 for(const b of r.inputBindings)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(b.path)).digest('hex'),b.sha256);
 const result=json(base+'integration.json');assert.deepEqual(result.held,[]);assert.equal(result.after.valid,true);
});
