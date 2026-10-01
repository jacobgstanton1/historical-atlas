import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {createMetadataIndex,validInYear,intervalBounds} from '../historical-metadata.js';
import {period} from '../dossier.js';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
const db=read('data/historical-entities.json'),sources=read('data/historical-sources.json'),index=createMetadataIndex(db,sources);
const calendar=(id,y)=>index.resolve(id,y).calendarYear;
test('France 1815 exposes partial framework coverage instead of treating restoration as the whole year',()=>{
 const r=index.resolve('entity-france',1815);assert.equal(r.calendarYear.kind,'partial-framework');assert.equal(r.calendarYear.needsResearch,true);
 assert.equal(r.politicalStatus.length,1);assert.equal(r.politicalStatus[0].validFrom,'1815-08-17');assert.ok(!r.leaders.some(l=>/Napoleon/.test(l.value)),'No missing Hundred Days chronology fabricated');
});
test('ordinary framework years and routine leadership changes remain ordinary',()=>{
 for(const [id,y]of [['entity-france',1900],['entity-denmark-norway',1800],['entity-sweden-norway',1900],['entity-united-kingdom',1801],['entity-united-kingdom',1936],['entity-united-states',1945],['entity-germany',1939]])assert.equal(calendar(id,y).isTransition,false,id+' '+y);
 const r=index.resolve('entity-united-states',1945);assert.ok(r.leaders.some(l=>l.value==='Franklin D. Roosevelt'));assert.ok(r.leaders.some(l=>l.value==='Harry S. Truman'));
});
test('all requested Batch 01 transition cases expose transition or incomplete dated coverage',()=>{
 for(const [id,y,kind]of [['entity-finland',1917,'identity-transition'],['entity-iceland',1918,'identity-transition'],['entity-ireland',1922,'partial-framework'],['entity-sweden-norway',1905,'partial-framework'],['entity-denmark-norway',1814,'partial-framework'],['entity-norway',1814,'partial-framework'],['entity-switzerland',1848,'identity-transition']])assert.equal(calendar(id,y).kind,kind,id+' '+y);
 assert.ok(!index.resolve('entity-sweden-norway',1906).entity);
});
test('ambiguous identities remain unchosen and expose separately dated sourced records',()=>{
 for(const [id,y]of [['entity-finland',1917],['entity-iceland',1918],['entity-switzerland',1848]]){const r=index.resolve(id,y);assert.equal(r.entity,null);assert.equal(r.ambiguous,true);assert.equal(r.identityPeriods.length,2);for(const p of r.identityPeriods){assert.ok(p.names.length);assert.ok(p.mappings.length);assert.ok(p.politicalStatus.every(f=>f.sourceIds.length));}assert.deepEqual(index.searchTerms(id,y),[]);}
});
test('additional constitutional transitions retain each applicable framework and leader',()=>{
 for(const [id,y]of [['entity-denmark',1849],['entity-sweden',1809],['entity-norway',1905],['entity-finland',1919],['entity-iceland',1944],['entity-ireland',1937],['entity-ireland',1949],['entity-france',1940],['entity-france',1944],['entity-france',1946],['entity-portugal',1910],['entity-portugal',1926],['entity-spain',1936],['entity-spain',1939],['entity-batavian-republic',1801],['entity-helvetic-republic',1800]])assert.equal(calendar(id,y).kind,'framework-transition',id+' '+y);
 const r=index.resolve('entity-iceland',1944);assert.ok(r.leaders.some(l=>/Christian X/.test(l.value)));assert.ok(r.leaders.some(l=>/Sveinn/.test(l.value)));
});
test('the rule is data driven and excludes full-year simultaneous institutions and leader-only turnover',()=>{
 const make=fields=>createMetadataIndex({entities:[{id:'test',...fields}],mappings:[{mapId:'test',entityId:'test'}]},sources).resolve('test',1900);
 assert.equal(make({politicalStatus:[{value:'Republic',validFrom:'1890'}],leaders:[{value:'A',validUntil:'1900-06-01'},{value:'B',validFrom:'1900-06-01'}]}).calendarYear.isTransition,false);
 assert.equal(make({governments:[{value:'Executive',validFrom:'1890'},{value:'Legislature',validFrom:'1890'}]}).calendarYear.isTransition,false);
 assert.equal(make({politicalStatus:[{value:'Monarchy',validUntil:'1900-06-01'},{value:'Republic',validFrom:'1900-06-01'}]}).calendarYear.kind,'framework-transition');
 assert.equal(make({politicalStatus:[{value:'Republic',validFrom:'1900-08'}]}).calendarYear.kind,'partial-framework');
 assert.equal(make({politicalStatus:[{value:'Republic',validFrom:'1900-01-01'}]}).calendarYear.isTransition,false);
});
test('exact, month and year precision plus exclusive endpoints remain unchanged',()=>{
 assert.equal(validInYear({validUntil:'1900-01-01'},1900),false);
 assert.equal(validInYear({validUntil:'1900-06'},1900),true);
 assert.equal(validInYear({validUntil:'1900'},1900),true);
 assert.equal(validInYear({validUntil:'1900'},1901),false);
 assert.equal(intervalBounds({validUntil:'1900-06-01'})[1],Date.UTC(1900,5,1));
 assert.equal(period({validFrom:'1900-06',validUntil:'1901'}),'1900-06 – ends during 1901');
 assert.equal(period({validFrom:'1900-06-01',validUntil:'1901-01-01'}),'1900-06-01 – before 1901-01-01');
});
test('all pre-programme facts, mappings and source records are preserved as immutable prefixes',()=>{
 const baseline=read('tests/fixtures/programme-baseline.json'),hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
 for(const ref of baseline.entities){const entity=db.entities.find(e=>e.id===ref.id);assert.ok(entity,ref.id);const preserved=Object.fromEntries(ref.keys.map(k=>[k,Array.isArray(entity[k])?entity[k].slice(0,ref.counts[k]):entity[k]]));assert.equal(hash(preserved),ref.hash,ref.id);}
 assert.equal(hash(db.mappings.slice(0,baseline.mappingCount)),baseline.mappingsHash);assert.equal(hash(sources.sources.slice(0,baseline.sourceCount)),baseline.sourceHash);
 const groups=db.entities.find(e=>e.id==='united-kingdom').frameworkContinuity;for(const g of groups){assert.ok(g.values.length>1);assert.ok(g.sourceIds.every(id=>index.registry.has(id)));assert.ok(g.note);}
});

test('Batch 02 immutable checkpoint remains preserved',()=>{const baseline=read('tests/fixtures/batch02-checkpoint.json'),hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');for(const ref of baseline.entities){const entity=db.entities.find(e=>e.id===ref.id);assert.ok(entity,ref.id);assert.equal(hash(Object.fromEntries(ref.keys.map(k=>[k,Array.isArray(entity[k])?entity[k].slice(0,ref.counts[k]):entity[k]]))),ref.hash,ref.id);}assert.equal(hash(db.mappings.slice(0,baseline.mappingCount)),baseline.mappingsHash);assert.equal(hash(sources.sources.slice(0,baseline.sourceCount)),baseline.sourceHash);});

test('Batch 03 immutable checkpoint remains preserved',()=>{const baseline=read('tests/fixtures/batch03-checkpoint.json'),hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');for(const ref of baseline.entities){const entity=db.entities.find(e=>e.id===ref.id);assert.ok(entity,ref.id);assert.equal(hash(Object.fromEntries(ref.keys.map(k=>[k,Array.isArray(entity[k])?entity[k].slice(0,ref.counts[k]):entity[k]]))),ref.hash,ref.id);}assert.equal(hash(db.mappings.slice(0,baseline.mappingCount)),baseline.mappingsHash);assert.equal(hash(sources.sources.slice(0,baseline.sourceCount)),baseline.sourceHash);});
