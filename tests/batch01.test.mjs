import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {createMetadataIndex,dateBounds,validInYear} from '../historical-metadata.js';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
const db=read('data/historical-entities.json'),sources=read('data/historical-sources.json'),audit=read('development/coverage/research-batch-01.json'),fixture=read('tests/fixtures/v061-reference-hashes.json'),plan=read('development/coverage/research-plan.json');
const index=createMetadataIndex(db,sources),hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
test('all original reference facts and original source records are preserved',()=>{
 for(const ref of fixture.entities){const e=db.entities.find(e=>e.id===ref.id);assert.ok(e);
 const original=Object.fromEntries(ref.originalKeys.map(k=>[k,Array.isArray(e[k])?e[k].slice(0,ref.arrayCounts[k]):e[k]]));
 // UK existence is explicitly expanded on sourced Union Acts; all original fact arrays remain intact.
 if(ref.id==='united-kingdom')delete original.existence;
 assert.equal(hash(original),ref.hash,ref.id);
 }
 assert.equal(hash(sources.sources.slice(0,fixture.sourceCount)),fixture.sourceHash);
});
test('batch scope, unique sources, mappings and dated provenance validate',()=>{
 assert.equal(audit.rawMapIdentities.length,24);assert.ok(Object.keys(plan.reviews).length>=24);
 assert.deepEqual(Object.keys(plan.reviews).filter(id=>audit.rawMapIdentities.includes(id)).sort(),audit.rawMapIdentities.slice().sort());
 assert.ok(db.entities.length>=fixture.entities.length+audit.historicalEntitiesCreated.length);
 assert.equal(new Set(db.entities.map(e=>e.id)).size,db.entities.length);
 assert.equal(new Set(sources.sources.map(s=>s.id)).size,sources.sources.length);
 assert.ok(sources.sources.length>=fixture.sourceCount+audit.sourceIdsAdded.length);
 const registry=new Set(sources.sources.map(s=>s.id)),urls=new Set(sources.sources.slice(0,fixture.sourceCount).map(s=>s.url));
 for(const id of audit.sourceIdsAdded){const s=sources.sources.find(s=>s.id===id);assert.ok(s);assert.match(s.url,/^https:\/\//);assert.ok(!urls.has(s.url),s.url);urls.add(s.url);}
 const date=d=>{assert.match(d,/^\d{4}(-\d{2})?(-\d{2})?$/);const [y,m=1,day=1]=d.split('-').map(Number),dt=new Date(dateBounds(d)[0]);assert.equal(dt.getUTCFullYear(),y);assert.equal(dt.getUTCMonth()+1,m);assert.equal(dt.getUTCDate(),day);};
 const walk=x=>{if(!x||typeof x!=='object')return;if(x.sourceIds){assert.ok(x.sourceIds.length);for(const id of x.sourceIds)assert.ok(registry.has(id),id);}for(const k of ['validFrom','validUntil','asOf','date'])if(x[k])date(x[k]);if(x.validFrom&&x.validUntil)assert.ok(dateBounds(x.validFrom)[0]<(x.validUntil.length===10?dateBounds(x.validUntil)[0]:dateBounds(x.validUntil)[1]));for(const v of Object.values(x))if(typeof v==='object')walk(v);};
 for(const id of audit.historicalEntitiesCreated){const e=db.entities.find(e=>e.id===id);assert.ok(e);walk(e);assert.equal(e.flags.length,0);assert.equal(e.population.length,0);assert.equal(e.economy.length,0);assert.equal(e.area.length,0);assert.ok(db.mappings.some(m=>m.entityId===id));}
 for(const r of Object.values(plan.reviews))walk(r);
 for(const mapping of db.mappings.filter(m=>audit.historicalEntitiesCreated.includes(m.entityId))){assert.ok(audit.rawMapIdentities.includes(mapping.mapId));assert.ok(Array.from({length:161},(_,i)=>i+1800).some(y=>index.resolve(mapping.mapId,y).entity?.id===mapping.entityId));}
 assert.equal(plan.batchReviews['political-batch-01'].state,'researched-with-partial-coverage');assert.ok(Object.keys(plan.batchReviews).length>=1);
});
test('British and Irish labels resolve independent historical identities and dated names',()=>{
 assert.equal(index.resolve('entity-united-kingdom',1800).entity.id,'great-britain-1707');
 assert.equal(index.resolve('entity-united-kingdom',1801).entity.id,'united-kingdom');
 assert.equal(index.resolve('entity-kingdom-of-ireland',1800).entity.id,'kingdom-of-ireland');
 assert.equal(index.resolve('entity-kingdom-of-ireland',1801).entity,null);
 assert.equal(index.resolve('entity-united-kingdom-of-great-britain-and-ireland',1930).entity.id,'united-kingdom');
 assert.ok(index.searchTerms('entity-united-kingdom-of-great-britain-and-ireland',1930).some(n=>n.includes('Northern Ireland')));
 assert.equal(index.resolve('entity-ireland',1938).entity.id,'ireland-independent');
 assert.ok(index.searchTerms('entity-ireland',1930).some(n=>n.includes('Saorst')));
 assert.ok(!index.searchTerms('entity-ireland',1938).some(n=>n.includes('Saorst')));
});
test('union, constituent and successor chronology never uses modern identity fallback',()=>{
 for(const [map,y,id] of [['entity-denmark-norway',1800,'denmark-norway-monarchy'],['entity-denmark',1815,'denmark-post-kiel'],['entity-sweden-norway',1900,'sweden-norway-union'],['entity-norway',1906,'norway-constitutional-kingdom'],['entity-sweden',1800,'sweden-kingdom'],['entity-finland',1914,'finland-grand-duchy'],['entity-finland',1920,'finland-independent'],['entity-iceland',1914,'iceland-danish-administration'],['entity-iceland',1920,'iceland-sovereign'],['entity-switzerland',1815,'swiss-confederation-1815'],['entity-switzerland',1850,'swiss-federal-state']])assert.equal(index.resolve(map,y).entity?.id,id);
 for(const [map,y]of [['entity-finland',1917],['entity-iceland',1918],['entity-switzerland',1848]])assert.equal(index.resolve(map,y).ambiguous,true);
 for(const [map,y]of [['entity-denmark-norway',1815],['entity-sweden-norway',1906],['entity-austrian-netherlands',1800],['entity-luxembourg',1800],['entity-portugal',1800]])assert.ok(!index.resolve(map,y).entity);
 assert.equal(index.resolve('entity-switzerland',1850).leaders.some(l=>(l.value||'').includes('Federal Council')),true);
 assert.ok(!index.resolve('entity-denmark',1873).currencies.some(c=>/krone/i.test(c.value)));
 assert.ok(index.resolve('entity-denmark',1875).currencies.some(c=>/krone/i.test(c.value)));
 assert.ok(!index.resolve('entity-portugal',1900).currencies.some(c=>/escudo/i.test(c.value)));
 assert.ok(index.resolve('entity-portugal',1914).currencies.some(c=>/escudo/i.test(c.value)));
 assert.ok(index.resolve('entity-france',1960).currencies.some(c=>/new franc/i.test(c.value)));
});
test('accepted core intervals resolve sourced required fields at represented calendar years',()=>{
 for(const [map,r]of Object.entries(plan.reviews).filter(([,r])=>r.status==='core-complete'))for(const interval of r.intervals){const years=Array.from({length:161},(_,i)=>1800+i).filter(y=>validInYear(interval,y));for(const y of years){const resolved=index.resolve(map,y);assert.ok(resolved.entity,map+' '+y);for(const field of ['names','politicalStatus','capitals','governments','leaders','currencies','descriptions'])assert.ok(resolved[field].length,map+' '+y+' '+field);}}
});
