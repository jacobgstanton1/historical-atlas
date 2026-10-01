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
if(plan.batchReviews['political-batch-13'])test('Ottoman source/calendar corrections keep uncertain periods partial',()=>{
 const mappings=db.mappings.filter(m=>m.mapId==='entity-ottoman-empire');
 assert.equal(mappings.find(m=>m.entityId==='ottoman-second-constitutional-core').validFrom,'1909-08-21');
 assert.equal(index.resolve('entity-ottoman-empire',1909).calendarYear.needsResearch,true);
 const first=mappings.find(m=>m.entityId==='ottoman-first-constitutional-core'),adjourned=mappings.find(m=>m.entityId==='ottoman-abdulhamid-adjourned-framework');
 assert.equal(first.validUntil,'1878-02-01');assert.equal(adjourned.validFrom,'1878-03-01');
 assert.equal(index.resolve('entity-ottoman-empire',1878).calendarYear.kind,'identity-transition');
 const audit=read('development/coverage/research-batch-13.json');assert.equal(audit.priorBatchCorrections.beforeRecords.mappings.length,3);assert.ok(audit.priorBatchCorrections.sourcesAdded.every(id=>registry.sources.some(s=>s.id===id)));
});
if(plan.batchReviews['political-batch-16'])test('shared West African raw labels reuse administrations and preserve earlier facts',()=>{
 assert.equal(index.resolve('entity-gold-coast-gb',1914).entity.id,index.resolve('entity-ghana',1914).entity.id);
 assert.equal(index.resolve('entity-gold-coast-gb',1930).entity.id,index.resolve('entity-ghana',1930).entity.id);
 assert.equal(index.resolve('entity-gold-coast-gb',1938).entity.id,index.resolve('entity-gold-coast',1938).entity.id);
 assert.equal(index.resolve('entity-fulani-empire',1815).entity.id,index.resolve('entity-sokoto-caliphate',1880).entity.id);
 const a=read('development/coverage/research-batch-15.json'),b=read('development/coverage/research-batch-16.json');
 for(const id of b.existingEntitiesExtended){const before=a.entities.find(e=>e.id===id),after=db.entities.find(e=>e.id===id);for(const[k,v]of Object.entries(before))if(Array.isArray(v))assert.deepEqual(after[k].slice(0,v.length),v);}
 assert.ok(!db.entities.some(e=>['b16-gold-coast-1902','b16-senegal-aof','b16-sokoto-1815'].includes(e.id)));
});
