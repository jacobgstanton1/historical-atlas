import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildBackwardExport,cohort,runtimeIdentity} from '../scripts/export-backward-dossier-workload.mjs';
import {productionHashes} from '../scripts/export-dossier-workload.mjs';
const root=process.cwd(),result=buildBackwardExport(root);
test('exact cohort occurrence coverage, without name-alias expansion',()=>{
 assert.equal(result.occurrences.length,92);
 for(const [name,years] of Object.entries(cohort))assert.deepEqual(result.occurrences.filter(o=>o.raw_map_name===name).map(o=>o.snapshot_year),years);
 assert.ok(!result.occurrences.some(o=>o.raw_map_name==='Kingdom of France'));
});
test('one occurrence per runtime map identity/year, multiple source features preserved',()=>{
 assert.equal(new Set(result.occurrences.map(o=>o.map_stable_id+'/'+o.snapshot_year)).size,92);
 assert.ok(result.occurrences.some(o=>o.feature_count>1));
 for(const o of result.occurrences){assert.equal(o.feature_count,o.census_occurrence_ids.length);assert.equal(o.feature_count,o.source_feature_indices.length);assert.ok(o.polygon_count>=o.feature_count);}
});
test('canonical 15 categories including religion, unique immutable cells',()=>{
 assert.equal(result.rows.length,1380);assert.equal(new Set(result.rows.map(r=>r.cell_id)).size,1380);
 for(const o of result.occurrences)assert.deepEqual(result.rows.filter(r=>r.occurrence_id===o.occurrence_id).map(r=>r.dossier_category),result.summary.categories);
 assert.ok(result.summary.categories.includes('religion'));assert.ok(!result.summary.categories.includes('density'));
});
test('no modern evidence leakage or invented non-applicability',()=>{
 assert.deepEqual(result.summary.statuses,{MISSING:1380});
 for(const r of result.rows){assert.deepEqual(r.current_evidence,[]);assert.deepEqual(r.source_ids,[]);assert.equal(r.atlas_entity_id,'');assert.equal(r.proposals_json,'');assert.equal(r.identity_review_required,true);}
 const stable=runtimeIdentity(root);for(const o of result.occurrences)assert.equal(o.map_stable_id,stable(o.map_display_name));
});
test('export matches deterministic regeneration and production byte hashes',()=>{
 const exported=JSON.parse(fs.readFileSync('exports/backward-dossier-workload/cohort-01/MASTER.json','utf8'));
 assert.deepEqual(exported.cells,result.rows);assert.deepEqual(result.summary.production_hashes,productionHashes(root));
 assert.equal(fs.readFileSync('exports/backward-dossier-workload/cohort-01/MASTER.csv','utf8'),fs.readFileSync('exports/backward-dossier-workload/cohort-01/MISSING-ONLY.csv','utf8'));
});
