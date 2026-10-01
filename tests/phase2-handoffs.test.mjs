import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {context,hash} from '../scripts/phase2-pipeline.mjs';
import {createMetadataIndex} from '../historical-metadata.js';
const {db,registry,manifest,plan}=context(),index=createMetadataIndex(db,registry);
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
test('the completed Batch 07 production checkpoint remains immutable',()=>{
 const b=read('tests/fixtures/batch07-checkpoint.json');
 for(const ref of b.entities){const e=db.entities.find(e=>e.id===ref.id);assert.ok(e,ref.id);const old=Object.fromEntries(ref.keys.map(k=>[k,Array.isArray(e[k])?e[k].slice(0,ref.counts[k]):e[k]]));assert.equal(hash(old),ref.hash,ref.id);}
 assert.equal(hash(db.mappings.slice(0,b.mappingCount)),b.mappingsHash);assert.equal(hash(registry.sources.slice(0,b.sourceCount)),b.sourceHash);
});
for(const b of manifest.phase2Batches.filter(b=>b.order>=8&&plan.batchReviews[b.id]))test('serial handoff membership, references and requested-year cases: '+b.id,()=>{
 const n=String(b.order).padStart(2,'0'),a=read(`development/coverage/research-batch-${n}.json`);assert.deepEqual(a.rawMapIdentities,b.mapIds);assert.deepEqual(a.researchedIdentities,b.mapIds);assert.deepEqual(Object.keys(a.decisions).sort(),[...b.mapIds].sort());
 assert.deepEqual(a.classificationPrerequisites.map(p=>p.mapId).sort(),[...b.classificationPrerequisites].sort());
 for(const id of a.historicalEntitiesCreated)assert.ok(a.browserCases.some(c=>c.entityId===id),'Missing rendered case '+id);
 for(const c of a.browserCases){const r=index.resolve(c.mapId,c.year);assert.ok(r.entity?.id===c.entityId||r.identityPeriods?.some(p=>p.entity?.id===c.entityId),c.entityId+' '+c.year);assert.ok(manifest.identities.find(r=>r.stableMapId===c.mapId).snapshotYears.includes(c.seedYear));}
 for(const c of a.reviewCases||[]){const r=index.resolve(c.mapId,c.year);assert.ok(!r.entity&&!r.identityPeriods?.length,c.mapId);}
 for(const c of a.transitionCases||[])assert.equal(index.resolve(c.mapId,c.year).calendarYear?.isTransition,true,c.mapId+' '+c.year);
 for(const m of a.mappingsAdded)assert.ok(db.mappings.some(existing=>hash(existing)===hash(m)));
 for(const id of a.sourcesAdded)assert.ok(registry.sources.some(s=>s.id===id));
});
