import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readJSON,digest} from '../scripts/research-common.mjs';
const checkpoint='fc7e7e6008750c5b127f1b52a18c0beac508565a';
const original=file=>execFileSync('git',['show',checkpoint+':'+file],{maxBuffer:50000000});
test('every previously accepted package remains byte-equivalent canonically',()=>{
 const old=JSON.parse(original('data/comprehensive-dossiers.json')),now=readJSON('data/comprehensive-dossiers.json');
 const packages=new Map(now.packages.map(p=>[p.id,p]));
 for(const p of old.packages)assert.equal(digest(packages.get(p.id)),digest(p),p.id);
});
test('frozen frontend and historical registries remain unchanged',()=>{
 for(const file of ['app.js','data-pipeline.js','rich-dossier.js','dossier-presentation.js','styles.css','index.html','data/historical-entities.json','data/historical-sources.json']){
  execFileSync('git',['diff','--exit-code',checkpoint,'--',file]);
  assert.equal(fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n'),original(file).toString('utf8').replace(/\r\n/g,'\n'),file);
 }
});
test('regional needs exclude supported cells and preserve original cohort overlap',()=>{
 const w=readJSON('research/regional-01/workload.json'),m=readJSON('research/regional-01/baseline-completion.json');
 assert.equal(w.batches.length,21);assert.equal(w.batches[0].batch,'01');
 const rows=new Map(m.rows.map(r=>[r.entityId+'|'+r.snapshotYear,r])),assigned=new Set();
 for(const b of w.batches){let count=0;for(const r of b.needs){assigned.add(r.entityId+'|'+r.snapshot);for(const[c,status]of Object.entries(r.categories)){assert.ok(['missing','partial','held'].includes(status));assert.equal(rows.get(r.entityId+'|'+r.snapshot).categories[c].status,status);count++;}}assert.equal(count,b.unresolved);assert.ok(b.sourceReuseOpportunity.sharedEntitySources.every(s=>s.sourceId!=='basemaps'));}
 assert.equal(assigned.size,w.cohortOverlap.uniqueAssignedDossiers);
});
test('all reviewed inputs retain exact certificate hashes',()=>{
 for(const [dir,cohort,certificate]of [['western','cohort.json','certificate.json'],['western','figures-only-cohort.json','figures-only-certificate.json'],['lowcountries','cohort.json','certificate.json'],['nordic','cohort.json','certificate.json'],['treaties','cohort.json','certificate.json']]){
  const base='research/regional-01/'+dir+'/',c=readJSON(base+cohort),cert=readJSON(base+certificate);
  assert.equal(cert.cohortHash,digest(c));assert.notEqual(cert.reviewer,c.worker);
  for(const b of cert.inputBindings)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(b.path)).digest('hex'),b.sha256,b.path);
 }
});
test('figure publication chronology and qualified historical associations remain bounded',()=>{
 const western=readJSON('research/regional-01/western/cohort.json').claims;
 assert.equal(western.find(c=>c.figure?.personId==='charles-darwin').temporal.from,'1877');
 assert.equal(western.find(c=>c.figure?.personId==='rudyard-kipling').temporal.from,'1911');
 assert.doesNotMatch(western.find(c=>c.figure?.personId==='francisco-goya').figure.contribution,/Disasters/i);
 const nordic=readJSON('research/regional-01/nordic/cohort.json').claims;
 assert.equal(nordic.find(c=>c.figure?.personId==='alvar-aalto'&&c.temporal.until==='1960').temporal.from,'1959');
 for(const c of nordic.filter(c=>c.figure))assert.ok(c.qualifications.some(q=>q.includes('not birthplace')));
});
test('historical treaty membership does not back-project later founders or merge sovereignty',()=>{
 const c=readJSON('research/regional-01/treaties/cohort.json').claims;
 const nato=c.filter(c=>c.sourceIds.includes('r01-nato-founders'));
 assert.equal(nato.length,9);
 for(const x of nato){assert.equal(x.temporal.from,'1950');assert.equal(x.temporal.until,'1960');assert.ok(!/spain|sweden|finland/.test(x.entityId));assert.ok(x.relatedEntityIds.every(id=>!id.startsWith('nato')));}
});
