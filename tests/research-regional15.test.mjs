import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {digest} from '../scripts/research-common.mjs';
const json=p=>JSON.parse(fs.readFileSync(p));
const baseline='d55d22afa31ebdb72b46025033e6b4a404f75606';
test('West Africa intake preserves every previously accepted package',()=>{
 const old=JSON.parse(execFileSync('git',['show',baseline+':data/comprehensive-dossiers.json'],{maxBuffer:100*1024*1024}));
 const current=json('data/comprehensive-dossiers.json');
 for(const p of old.packages)assert.equal(digest(current.packages.find(x=>x.id===p.id)),digest(p));
});
test('Frozen runtime and entity/source registries remain byte-identical',()=>{
 for(const path of ['app.js','styles.css','index.html','data-pipeline.js','rich-dossier.js','dossier-presentation.js','data/historical-entities.json','data/historical-sources.json']){
 if(!fs.existsSync(path))continue;
 assert.equal(fs.readFileSync(path,'utf8').replaceAll('\r\n','\n'),execFileSync('git',['show',baseline+':'+path],{maxBuffer:100*1024*1024,encoding:'utf8'}).replaceAll('\r\n','\n'));
 }
});
for(const [dir,file] of [['kingdoms-liberia-guinea','accepted-cohort.json'],['french','cohort.json'],['british','cohort.json']])test('Independent immutable certificate: '+dir,()=>{
 const base='research/regional-15/'+dir+'/',c=json(base+file),r=json(base+'certificate.json');
 assert.equal(r.cohortHash,digest(c));assert.notEqual(r.reviewer,c.worker);assert.equal(r.bodyReviewed,true);
 assert.deepEqual(r.acceptedClaimIds.toSorted(),c.claims.map(x=>x.id).toSorted());
 for(const b of r.inputBindings)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(b.path)).digest('hex'),b.sha256);
 const result=json(base+'integration.json');assert.deepEqual(result.held,[]);assert.equal(result.after.valid,true);
});
test('Held French mandate claim stays outside production',()=>{
 const held=json('research/regional-15/french/coordinator-held.json');
 const text=fs.readFileSync('data/comprehensive-dossiers.json','utf8');
 for(const item of Array.isArray(held)?held:held.claims||[])if(item.claim?.id)assert.equal(text.includes('"'+item.claim.id+'"'),false);
 assert.equal(json('research/regional-15/french/cohort.json').claims.length,14);
});
