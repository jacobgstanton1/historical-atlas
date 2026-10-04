import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildCoverage} from '../scripts/coverage-model.mjs';
import {combinedReport} from '../scripts/classification.mjs';
import {LEGACY_SNAPSHOTS} from '../snapshots.js';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
const manifest=read('development/coverage/manifest.json');
const plan=read('development/coverage/research-plan.json');
const db=read('data/historical-entities.json'),sources=read('data/historical-sources.json');
const snapshot=(year,ids)=>({year,features:ids.map((id,i)=>({id:id+'-'+year+'-'+i,properties:{_stableId:id,_name:id,_area:1}}))});
test('inventory includes all configured snapshots and reconciles snapshot/identity totals',()=>{
 // The research inventory describes populated snapshots, not empty timeline targets.
 const years=LEGACY_SNAPSHOTS.map(s=>s.year);
 assert.deepEqual(manifest.bySnapshot.map(r=>r.year),years);assert.equal(years.length,11);
 assert.equal(new Set(manifest.identities.map(r=>r.stableMapId)).size,manifest.summary.totalIdentities);
 assert.equal(manifest.summary.curatedMetadataEntities,db.entities.length);
 assert.equal(manifest.summary.coveredIdentities,manifest.identities.filter(r=>r.currentlyResolvesToDossier).length);
 for(const row of manifest.bySnapshot){
  const present=manifest.identities.filter(r=>r.snapshotYears.includes(row.year));
  assert.equal(row.selectableIdentities,present.length);assert.equal(row.covered,present.filter(r=>r.snapshotCoverage.find(c=>c.year===row.year).receivesCuratedDossier).length);
  assert.equal(row.covered+row.uncovered,row.selectableIdentities);
 }
 assert.ok(manifest.identities.some(r=>r.stableMapId==='entity-unnamed-territory'));
 assert.ok(!manifest.identities.some(r=>/antarct/i.test(r.sourceNames.join(' '))));
});
test('research batches partition the inventory and never mark source names complete',()=>{
 const ids=manifest.batches.flatMap(b=>b.mapIds);
 assert.equal(ids.length,new Set(ids).size);assert.deepEqual([...ids].sort(),manifest.identities.map(r=>r.stableMapId).sort());
 assert.equal(manifest.batches.reduce((sum,b)=>sum+b.uncuratedIdentities,0),manifest.summary.uncoveredIdentities);
 assert.ok(manifest.batches.every(b=>b.totalIdentities<=30));
 for(const row of manifest.identities){assert.equal(row.continuity.state,row.researchDecision?'reviewed-with-dated-decisions':'unresolved');if(!row.researchDecision)assert.ok(!['core-complete','enriched'].includes(row.researchStatus));}
 for(const q of manifest.questions){assert.equal(q.state,'unresolved');assert.ok(q.mapIds.length);assert.ok(q.linkedBatchIds.length);}
 assert.equal(manifest.questions.length,manifest.summary.unresolvedQuestions);
});
test('coverage uses dated runtime mappings, not merely mapping/name presence',()=>{
 const byId=id=>manifest.identities.find(r=>r.stableMapId===id);
 assert.equal(byId('entity-japan').snapshotCoverage.find(c=>c.year===1800).receivesCuratedDossier,true);
 assert.equal(byId('entity-japan').snapshotCoverage.find(c=>c.year===1960).receivesCuratedDossier,true);
 assert.equal(byId('entity-germany').snapshotCoverage.find(c=>c.year===1930).receivesCuratedDossier,true);
 assert.equal(byId('entity-germany').snapshotCoverage.find(c=>c.year===1938).receivesCuratedDossier,true);
 assert.ok(!manifest.questions.some(q=>q.id==='existence-entity-soviet-union-1920'));
 assert.equal(byId('entity-soviet-union').snapshotCoverage.find(c=>c.year===1920).receivesCuratedDossier,false);
 assert.equal(byId('entity-soviet-union').researchStatus,'mapping-review');
 assert.ok(manifest.identities.some(r=>r.stableMapId==='entity-imperial-japan'&&r.currentlyResolvesToDossier));
 assert.equal(byId('entity-manchu-empire').snapshotCoverage.find(c=>c.year===1914).receivesCuratedDossier,false);
});
test('broken mappings, orphan metadata and ambiguous calendar-year mappings are diagnosed',()=>{
 const d={entities:[{id:'a'},{id:'b'},{id:'orphan'}],mappings:[
 {mapId:'x',entityId:'a',validUntil:'1947-05-03'},{mapId:'x',entityId:'b',validFrom:'1947-05-03'},
 {mapId:'absent',entityId:'a'},{mapId:'broken',entityId:'missing'}]};
 const m=buildCoverage([snapshot(1946,['x','broken']),snapshot(1947,['x','broken']),snapshot(1948,['x','broken'])],d,sources,plan);
 assert.equal(m.summary.brokenMappings,2);assert.deepEqual(m.orphanMetadataEntities,['orphan']);
 assert.deepEqual(m.ambiguousMappings,[{mapId:'x',requestedYear:1947}]);
 assert.equal(m.bySnapshot[1].covered,0);assert.equal(m.bySnapshot[0].covered,1);
});
test('repeated names, presence gaps and authority data remain unresolved evidence',()=>{
 const snapshots=[snapshot(1900,['x']),snapshot(1914,[]),snapshot(1920,['x'])];
 snapshots[0].features[0].properties.SUBJECTO='Empire';snapshots[2].features[0].properties.PARTOF='Grouping';
 const m=buildCoverage(snapshots,{entities:[],mappings:[]},sources,plan);
 const row=m.identities[0];assert.equal(row.firstAvailableSnapshot,1900);assert.equal(row.lastAvailableSnapshot,1920);
 assert.ok(m.questions.some(q=>q.type==='source-presence-gap'));assert.ok(m.questions.some(q=>q.type==='authority-grouping'));
 assert.equal(row.continuity.state,'unresolved');assert.equal(row.currentlyResolvesToDossier,false);
 assert.ok(!('predecessors' in row)&&!('politicalStatus' in row));
});
test('an explicit accepted tier requires reviewed source-backed intervals',()=>{
 const p={...plan,reviews:{x:{status:'core-complete',tier:'core'}}};
 assert.throws(()=>buildCoverage([snapshot(1900,['x'])],{entities:[],mappings:[]},sources,p),/Incomplete reviewed/);
});
test('report and manifest are deterministic development artifacts',()=>{
 const lock=read('development/coverage/inputs.lock.json');
 const report=fs.readFileSync(new URL('../development/coverage/REPORT.md',import.meta.url),'utf8').replace(/\r\n/g,'\n');
 assert.equal(report,combinedReport(manifest,lock));
 assert.ok(manifest.inputs.snapshots.every(s=>/^[a-f0-9]{64}$/.test(s.sha256)));
 const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
 assert.ok(!app.includes('development/coverage'));assert.match(app,/v=0\.6\.1/);
});

test('an unmapped name cannot acquire an accepted coverage tier',()=>{
 const p={...plan,reviews:{x:{status:'core-complete',tier:'core',reviewerNote:'Name only',intervals:[{validFrom:'1900',sourceIds:['basemaps']}]}}};
 assert.throws(()=>buildCoverage([snapshot(1900,['x'])],{entities:[],mappings:[]},sources,p),/mapped curated entity/);
});
