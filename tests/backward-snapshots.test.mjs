import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {readSnapshotConfig} from '../scripts/research-snapshot-scan.mjs';
import {formatSnapshotYear,selectableYear} from '../snapshot-years.js';
import {readAtlasState} from '../atlas-state.js';
const snapshots=readSnapshotConfig(), app=fs.readFileSync('app.js','utf8');
const earlier=[-4000,-3000,-2000,-1500,-1000,-700,-500,-400,-323,-300,-200,-100,-1,100,200,300,400,500,600,700,800,900,1000,1100,1200,1279,1300,1400,1500,1530,1600,1650,1700,1715,1783];
test('Exact source catalogue is chronological, has no year zero and ends at 1960',()=>{
 assert.deepEqual(snapshots.filter(s=>s.year<1800).map(s=>s.year),earlier);
 assert.equal(snapshots.length,46);assert.equal(snapshots.at(-1).year,1960);
 for(const [i,s] of snapshots.entries()){assert.notEqual(s.year,0);if(i)assert.ok(s.year>snapshots[i-1].year);assert.equal(s.file,`world_${s.year<0?'bc'+(-s.year):s.year}.geojson`);}
});
test('All eleven existing snapshot definitions and historical production files are unchanged',()=>{
 const baseline=execFileSync('git',['show','860f31135141cdc90000bc0d0d50885ee953d394:app.js'],{encoding:'utf8'});
 assert.equal(app.match(/const SNAPSHOTS = \[([\s\S]*?)\];/)[1].split('\n').filter(l=>/year: (18|19)/.test(l)).join('\n'),baseline.match(/const SNAPSHOTS = \[([\s\S]*?)\];/)[1].split('\n').filter(l=>/year: (18|19)/.test(l)).join('\n'));
 assert.equal(execFileSync('git',['diff','860f31135141cdc90000bc0d0d50885ee953d394','--','data','assets/flags'],{encoding:'utf8'}),'');
});
test('BCE formatting follows source negative-magnitude convention',()=>{
 for(const [year,label] of [[-4000,'4000 BCE'],[-323,'323 BCE'],[-1,'1 BCE'],[100,'100'],[1960,'1960']])assert.equal(formatSnapshotYear(year),label);
 assert.throws(()=>formatSnapshotYear(0));
});
test('Navigation selects every real map; unsupported ancient years select a real date',()=>{
 for(const s of snapshots){assert.equal(selectableYear(s.year,snapshots),s.year);assert.equal(readAtlasState('https://example.org/?year='+s.year).year,s.year);}
 assert.equal(selectableYear(-2,snapshots),-1);assert.equal(selectableYear(1,snapshots),-1);
 assert.equal(selectableYear(2026,snapshots),1960);assert.ok(Number.isNaN(selectableYear(0,snapshots)));
 assert.equal(selectableYear(1939,snapshots),1939);
});
test('Exact-file loader and normal polygon/label pipeline are preserved byte-for-byte',()=>{
 const baseline=execFileSync('git',['show','860f31135141cdc90000bc0d0d50885ee953d394:app.js'],{encoding:'utf8'}).replaceAll('\r\n','\n');
 const loader=s=>s.slice(s.indexOf('async function loadSnapshotData('),s.indexOf('async function loadSnapshotData(')+s.slice(s.indexOf('async function loadSnapshotData(')).indexOf('\nfunction '));
 assert.equal(loader(app),loader(baseline));
 assert.match(app,/buildLabelCollection\(prepared\)/);assert.match(app,/prepareCollection\(raw, snapshot.year\)/);
 assert.doesNotMatch(app,/boundaryStatus|unpopulated/);
});
