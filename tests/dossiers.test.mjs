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

const showcase=['entity-united-states','entity-united-kingdom','entity-germany','entity-soviet-union','entity-empire-of-japan','entity-british-raj'];
test('all six 1939 showcases have sourced basics and sustained overview coverage',()=>{
 assert.ok(db.entities.length>=7); assert.ok(db.mappings.length>=7);
 for(const id of showcase) for(const year of [1938,1939,1940]) {
  const r=index.resolve(id,year);assert.ok(r.entity,id);
  for(const field of ['names','flags','politicalStatus','capitals','population','governments','leaders','currencies','descriptions','events'])
   assert.ok(r[field].length,id+' '+year+' '+field);
  for(const p of r.population) {assert.ok(p.asOf&&p.observationType&&p.scope&&p.note);assert.ok(Number(p.asOf.slice(0,4))<=year);}
 }
});
test('expanded observations preserve dates, scopes and precision without future substitution',()=>{
 for(const [id,year,date,value] of [
 ['entity-united-kingdom',1938,'1931-06',46073600],['entity-united-kingdom',1939,'1939-06',47547700],
 ['entity-germany',1938,'1933-06',65218000],['entity-germany',1939,'1939-05',69314000],
 ['entity-soviet-union',1939,'1926',147027915],['entity-soviet-union',1960,'1959',208826650],
 ['entity-empire-of-japan',1939,'1935-10-01',69254000],['entity-empire-of-japan',1940,'1940-10-01',73114000],
 ['entity-british-raj',1939,'1931',338171000],['entity-british-raj',1945,'1941',388800000],
 ['entity-japan',1960,'1960-10-01',94302000]]) {
  const p=index.resolve(id,year).population[0];assert.equal(p.asOf,date);assert.equal(p.value,value);
 }
 assert.match(index.resolve('entity-germany',1939).population[0].note,/1937/);
 assert.match(index.resolve('entity-empire-of-japan',1939).population[0].scope,/excludes/i);
 assert.match(index.resolve('entity-british-raj',1939).population[0].scope,/Burma/);
 assert.match(index.resolve('entity-japan',1960).population[0].note,/December/);
});
test('historical flags resolve by actual design periods and keep licensing/provenance',()=>{
 const assets=(id,year)=>index.resolve(id,year).flags.map(f=>f.asset);
 assert.deepEqual(assets('entity-germany',1934),[]);
 assert.deepEqual(assets('entity-germany',1939),['./assets/flags/de-1935.svg']);
 assert.deepEqual(assets('entity-soviet-union',1939),['./assets/flags/su-1936.svg']);
 assert.equal(assets('entity-soviet-union',1955).length,2);
 assert.deepEqual(assets('entity-soviet-union',1960),['./assets/flags/su-1955.svg']);
 assert.deepEqual(assets('entity-empire-of-japan',1939),['./assets/flags/jp-1870.svg']);
 assert.deepEqual(assets('entity-japan',1960),['./assets/flags/jp-1870.svg']);
 const raj=index.resolve('entity-british-raj',1939).flags[0];assert.match(raj.note,/not a national flag/i);
 for(const e of db.entities)for(const f of e.flags||[]) {
  assert.ok(f.alt&&f.license&&f.attribution);
  const svg=fs.readFileSync(new URL('../'+f.asset,import.meta.url),'utf8');
  assert.doesNotMatch(svg,/<script\b|<foreignObject\b|\bon[a-z]+\s*=|javascript:/i);
 }
});
test('leadership preserves real offices and changes within a selected year',()=>{
 const names=(id,year)=>index.resolve(id,year).leaders.map(f=>f.value).join('|');
 assert.match(names('entity-united-kingdom',1940),/Chamberlain/);assert.match(names('entity-united-kingdom',1940),/Churchill/);
 assert.match(names('entity-united-states',1945),/Roosevelt/);assert.match(names('entity-united-states',1945),/Truman/);
 assert.match(names('entity-united-kingdom',1960),/Elizabeth II/);assert.match(names('entity-united-kingdom',1960),/Macmillan/);
 assert.doesNotMatch(names('entity-united-kingdom',1960),/George VI|Chamberlain/);
 const japan=index.resolve('entity-empire-of-japan',1939).leaders;
 for(const n of ['Konoe','Hiranuma','Abe'])assert.ok(japan.some(f=>f.value.includes(n)),n);
 assert.equal(japan.filter(f=>f.role==='Prime minister').length,3);
 assert.match(names('entity-japan',1960),/Kishi/);assert.match(names('entity-japan',1960),/Ikeda/);
 const soviet=index.resolve('entity-soviet-union',1939).leaders;
 assert.ok(soviet.some(f=>f.value.includes('Stalin')&&/Party-state/.test(f.role)));
 assert.ok(soviet.some(f=>f.value.includes('Molotov')&&/Council/.test(f.role)));
 assert.ok(soviet.some(f=>f.value.includes('Kalinin')&&/Presidium/.test(f.role)));
});
test('overview and constitutional transitions resolve meaningful successive periods',()=>{
 const prose=(id,year)=>index.resolve(id,year).descriptions.map(f=>f.value).join(' ');
 assert.notEqual(prose('entity-germany',1938),prose('entity-germany',1940));
 assert.notEqual(prose('entity-soviet-union',1938),prose('entity-soviet-union',1940));
 assert.notEqual(prose('entity-british-raj',1938),prose('entity-british-raj',1940));
 assert.equal(index.resolve('entity-japan',1952).descriptions.length,2);
 assert.match(prose('entity-japan',1950),/Allied occupation/);
 assert.match(prose('entity-japan',1960),/ending the Allied occupation/);
 assert.match(index.resolve('entity-japan',1960).leaders.find(f=>f.value==='Hirohito').role,/symbol/i);
 for(const [id,years] of [
 ['entity-united-states',[1945,1960]],['entity-united-kingdom',[1945,1960]],
 ['entity-germany',[1945]],['entity-soviet-union',[1945,1960]],
 ['entity-british-raj',[1945]],['entity-japan',[1960]]])
 for(const y of years)assert.ok(index.resolve(id,y).descriptions.length,id+' '+y);
 assert.equal(index.resolve('entity-empire-of-japan',1945).entity,null);
 assert.equal(index.resolve('entity-british-raj',1960).entity,null);
 assert.equal(index.resolve('entity-germany',1960).entity,null);
});
test('succession is explicit and constitutional changes do not infer new map identity',()=>{
 for(const e of db.entities) for(const f of [...(e.predecessors||[]),...(e.successors||[])]) {
  assert.ok(Array.isArray(f.mapIds)&&f.sourceIds.length&&f.date);
 }
 assert.equal(index.resolve('entity-british-raj',1939).successors.length,2);
 const successors=index.resolve('entity-soviet-union',1939).successors;
 assert.equal(successors.length,3);assert.ok(successors.every(f=>/partial|not/i.test(f.note)));
 assert.match(index.resolve('entity-germany',1939).predecessors[0].note,/constitutional|order/i);
 assert.match(index.resolve('entity-empire-of-japan',1939).successors[0].note,/constitutional/i);
 assert.equal(index.resolve('entity-japan',1939).entity,null);
 assert.ok(index.searchTerms('entity-soviet-union',1939).includes('USSR'));
 assert.ok(index.searchTerms('entity-british-raj',1939).includes('British India'));
});

test('formal government and alias coverage remains distinct from functional leadership',()=>{
 assert.ok(index.resolve('entity-soviet-union',1945).leaders.some(f=>f.value==='Joseph Stalin'&&/People’s Commissars/.test(f.role)));
 assert.ok(index.resolve('entity-soviet-union',1950).leaders.some(f=>f.value==='Joseph Stalin'&&/Council of Ministers/.test(f.role)));
 assert.ok(index.resolve('entity-united-kingdom',1956).leaders.some(f=>f.value==='Anthony Eden'));
 assert.ok(index.searchTerms('entity-united-kingdom',1960).includes('UK'));
 assert.equal(index.searchTerms('entity-soviet-union',1939).filter(t=>t==='USSR').length,1);
});
