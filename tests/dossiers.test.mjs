import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createMetadataIndex, validInYear, observationsForYear} from '../historical-metadata.js';
import {geometryFingerprint, createBoundaryHistory} from '../boundary-history.js';
const db=JSON.parse(fs.readFileSync(new URL('../data/historical-entities.json',import.meta.url)));
const sources=JSON.parse(fs.readFileSync(new URL('../data/historical-sources.json',import.meta.url)));
const index=createMetadataIndex(db,sources);
test('all historical records have traceable sources and safe flags',()=>{
 const ids=new Set(sources.sources.map(s=>s.id));
 assert.equal(ids.size,sources.sources.length);
 for(const s of sources.sources) { assert.ok(s.institution && s.title && s.accessed); assert.equal(new URL(s.url).protocol,'https:'); }
 assert.equal(new Set(db.entities.map(e=>e.id)).size,db.entities.length);
 for(const e of db.entities) {
   for(const field of Object.keys(e)) {
     if(!Array.isArray(e[field])) continue;
     for(const f of e[field]) {
       assert.ok(f.sourceIds?.length, e.id+' '+field);
       for(const id of f.sourceIds) assert.ok(ids.has(id),id);
       for(const k of ['validFrom','validUntil','asOf','date']) if(f[k]) assert.match(f[k],/^[0-9]{4}(-[0-9]{2})?(-[0-9]{2})?$/);
       if(f.asset) {
         assert.ok(f.license && f.attribution && f.validFrom);
         const svg=fs.readFileSync(new URL('../'+f.asset,import.meta.url),'utf8');
         assert.match(svg,/<svg/); assert.doesNotMatch(svg,/<script|<foreignObject|[ ]on[a-z]+[ ]*=/i);
       }
     }
   }
   if(e.existence) for(const id of e.existence.sourceIds) assert.ok(ids.has(id));
 }
 for(const mapping of db.mappings) assert.ok(db.entities.some(e=>e.id===mapping.entityId));
});
test('year resolution retains intra-year leadership transitions and excludes modern substitutions',()=>{
 const leaders=index.resolve('entity-germany',1934).leaders;
 assert.equal(leaders.length,2);
 assert.equal(index.resolve('entity-germany',1960).entity,null);
 assert.equal(index.resolve('entity-japan',1938).entity,null);
 assert.equal(index.resolve('entity-empire-of-japan',1938).entity.id,'japan-meiji-framework');
 assert.equal(index.resolve('entity-japan',1960).entity.id,'japan-postwar-framework');
 assert.equal(index.resolve('entity-united-states',1932).leaders.length,0);
 assert.equal(index.resolve('entity-united-states',1933).leaders.length,1);
 assert.equal(validInYear({validFrom:'1937-05',validUntil:'1940-05'},1940),true);
 assert.equal(validInYear({validUntil:'1939-01-01'},1939),false);
});
test('flag changes include each applicable period of a transition year',()=>{
 assert.deepEqual(index.resolve('entity-united-states',1938).flags.map(f=>f.asset),['./assets/flags/us-48.svg']);
 assert.equal(index.resolve('entity-united-states',1959).flags.length,2);
 assert.deepEqual(index.resolve('entity-united-states',1960).flags.map(f=>f.asset),['./assets/flags/us-49.svg','./assets/flags/us-50.svg']);
 assert.equal(index.resolve('entity-united-states',1911).flags.length,0);
});
test('observations use actual dates, never future data or interpolation',()=>{
 const records=[{value:10,asOf:'1930'},{value:20,asOf:'1940'}];
 assert.equal(observationsForYear(records,1938)[0].value,10);
 assert.equal(observationsForYear(records,1920).length,0);
 const p=index.resolve('entity-united-states',1938).population[0];
 assert.equal(p.asOf,'1930'); assert.equal(p.value,122775046); assert.match(p.scope,/excludes/i);
});
const feature=(coordinates,id='entity-test')=>({geometry:{type:'Polygon',coordinates},properties:{_stableId:id}});
const outer=[[0,0],[4,0],[4,4],[0,4],[0,0]],hole=[[1,1],[2,1],[2,2],[1,2],[1,1]];
test('geometry ignores ring start, winding, feature/polygon order and tiny numeric noise',()=>{
 const shifted=[[4,4],[4,0],[0,0],[0,4],[4,4]];
 assert.equal(geometryFingerprint([feature([outer,hole])]),geometryFingerprint([feature([shifted,[...hole].reverse()])]));
 const island=feature([[[8,8],[9,8],[9,9],[8,8]]]);
 assert.equal(geometryFingerprint([feature([outer]),island]),geometryFingerprint([island,feature([outer])]));
 const jitter=outer.map(([x,y])=>[x+0.00000001,y]);
 assert.equal(geometryFingerprint([feature([outer])]),geometryFingerprint([feature([jitter])]));
 assert.notEqual(geometryFingerprint([feature([outer,hole])]),geometryFingerprint([feature([outer])]));
 assert.notEqual(geometryFingerprint([feature([outer])]),geometryFingerprint([island]));
});
test('boundary navigation skips absence and identical geometry, reports incomplete scans',async()=>{
 const snapshots=[{year:1900},{year:1914},{year:1930},{year:1938},{year:1945},{year:1960}];
 const shapes=[feature([hole]),null,feature([outer]),feature([[...outer].reverse()]),null,feature([hole])];
 const history=createBoundaryHistory(snapshots,async s=>({features:shapes[snapshots.indexOf(s)]?[shapes[snapshots.indexOf(s)]]:[]}));
 const result=await history('entity-test',3);
 assert.equal(result.previous.year,1900); assert.equal(result.next.year,1960); assert.equal(result.incomplete,false);
 assert.equal((await history('entity-test',4)).absent,true);
 const broken=createBoundaryHistory(snapshots,async s=>{if(s.year===1960)throw Error('offline');return {features:[feature([outer])]};});
 assert.equal((await broken('entity-test',3)).incomplete,true);
});
test('identity mappings are explicit, ambiguity is omitted and aliases do not create map entities',()=>{
 const synthetic=createMetadataIndex({entities:[{id:'a'},{id:'b'}],mappings:[{mapId:'x',entityId:'a',validUntil:'1947-05-03'},{mapId:'x',entityId:'b',validFrom:'1947-05-03'}]},sources);
 assert.equal(synthetic.resolve('x',1947).ambiguous,true);
 assert.equal(synthetic.resolve('x',1946).entity.id,'a');
 assert.ok(index.searchTerms('entity-british-raj',1938).includes('British India'));
 assert.deepEqual(index.searchTerms('missing',1938),[]);
});
