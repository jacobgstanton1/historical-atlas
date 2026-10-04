import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {readSnapshotConfig} from '../scripts/research-snapshot-scan.mjs';
import {censusSnapshot,summarize,provisionalType,upstreamCommit} from '../scripts/backward-timeline-census.mjs';
test('Only 1492 is removed; remote maps and presence index are pinned',()=>{
 const old=execFileSync('git',['show','56ba291e9a7f8c33ff3d29e0ff2df25df6278609:app.js'],{encoding:'utf8'});
 const before=[...old.match(/const SNAPSHOTS = \[([\s\S]*?)\];/)[1].matchAll(/year: (-?\d+), file: '([^']+)'/g)].map(m=>({year:+m[1],file:m[2]}));
 assert.deepEqual(readSnapshotConfig(),before.filter(s=>s.year!==1492));
 const app=fs.readFileSync('app.js','utf8');assert.equal(app.includes('historical-basemaps@master'),false);
 assert.ok(app.includes(`historical-basemaps@${upstreamCommit}/geojson/`));assert.ok(app.includes(`historical-basemaps@${upstreamCommit}/index.json`));
 assert.ok(JSON.parse(fs.readFileSync('development/backward-timeline/source-files.json')).snapshots.some(s=>s.year===1492));
 assert.equal(execFileSync('git',['diff','56ba291e9a7f8c33ff3d29e0ff2df25df6278609','--','data','assets','styles.css','dossier.js','historical-metadata.js'],{encoding:'utf8'}),'');
});
test('Raw occurrence metadata, polygon counts and IDs are deterministic',()=>{
 const s={year:-500,file:'world_bc500.geojson'},raw={type:'FeatureCollection',features:[{properties:{NAME:'Example Empire',SUBJECTO:'Authority',PARTOF:'Region',BORDERPRECISION:3},geometry:{type:'MultiPolygon',coordinates:[[],[]]}}]};
 const a=censusSnapshot(s,raw);assert.deepEqual(a,censusSnapshot(s,raw));assert.equal(a[0].display_year,'500 BCE');assert.equal(a[0].polygon_count,2);assert.equal(a[0].raw_SUBJECTO,'Authority');assert.equal(a[0].accepted_historical_evidence,false);assert.equal(a[0].provisional_classification,'polity');assert.throws(()=>censusSnapshot(s,{type:'FeatureCollection',features:[]}));
});
test('Name recurrence counts distinct snapshots, keeps variants separate and never merges IDs',()=>{
 const make=(y,names)=>censusSnapshot({year:y,file:`world_${y}.geojson`},{type:'FeatureCollection',features:names.map(NAME=>({properties:{NAME},geometry:{type:'Polygon',coordinates:[]}}))});
 const rows=[...make(1400,['X','X','x']),...make(1500,['X','Y'])],r=summarize(rows);
 assert.equal(new Set(rows.map(x=>x.occurrence_id)).size,5);assert.equal(r.uniqueRawNames,3);assert.deepEqual(r.recurrenceDistribution,{'1':2,'2':1});assert.equal(r.recurrence[0].occurrences,3);assert.equal(r.recurrence[0].snapshotCount,2);
});
test('Classification is limited to name-semantic triage; ambiguous names stay unknown',()=>{
 for(const [NAME,type] of [['Kingdom of Example','polity'],['Example Protectorate','dependent-polity'],['Example peoples','people-or-cultural-region'],['Example culture','archaeological-culture'],['Egypt','unknown']])assert.equal(provisionalType({NAME}),type);
 assert.equal(provisionalType({NAME:'Unknown',SUBJECTO:'Empire'}),'unknown');
});
