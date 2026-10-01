import test from 'node:test';
import assert from 'node:assert/strict';
import {scan} from '../scripts/research-scan.mjs';
import {generateJobs} from '../scripts/research-generate.mjs';
import {readContext} from '../scripts/research-common.mjs';

const source={id:'s',url:'https://example.org/primary',title:'Primary record',institution:'Archive'};
const fact=(value,validFrom='1900-01-01',validUntil='1901-01-01')=>({value,validFrom,validUntil,sourceIds:['s']});
function fixture(){return{productionFingerprint:'fixed',db:{entities:[{id:'e',names:[fact('Polity')],existence:fact('Editorial envelope'),politicalStatus:[fact('Republic')],governments:[fact('Council')],descriptions:[fact('Sourced political framework')],population:[{value:100,asOf:'1899-07',sourceIds:['s']}]}],mappings:[{mapId:'raw',entityId:'e',validFrom:'1900-01-01',validUntil:'1901-01-01',sourceIds:['s']}]},registry:{sources:[source]},manifest:{identities:[{stableMapId:'raw',displayName:'Raw polity',snapshotYears:[1900],classification:{classification:'political-polity'}}]},plan:{reviews:{}}};}

test('partial-day framework stays a research gap without filling annual coverage',()=>{
  const c=fixture();c.db.entities[0].governments=[fact('Council','1900-07-01','1901-01-01')];
  const r=scan(c,{from:1900,until:1900});const gap=r.gaps.find(g=>g.category==='political-institutional');
  assert.ok(gap);assert.match(gap.reason,/only part/);assert.deepEqual(gap.period,{from:'1900',until:'1900'});
  assert.equal(gap.existingFacts.find(f=>f.value==='Council').validFrom,'1900-07-01');
});
test('nearby population evidence does not satisfy exact observation-year coverage',()=>{
  const c=fixture();let r=scan(c,{from:1900,until:1900});let gap=r.gaps.find(g=>g.category==='population-statistics');
  assert.equal(gap.existingFacts[0].asOf,'1899-07');assert.equal(r.metrics.nearbyDatedEvidenceGaps,1);
  c.db.entities[0].population.push({value:110,asOf:'1900-06-12',scope:'Historical polity census geography',sourceIds:['s']});r=scan(c,{from:1900,until:1900});
  assert.equal(r.gaps.some(g=>g.category==='population-statistics'),false);assert.equal(r.metrics.exactObservedYears,1);
});
test('broken source references create evidence gaps; absent source kind does not',()=>{
  const c=fixture();assert.equal(scan(c,{from:1900,until:1900}).gaps.some(g=>g.category==='political-institutional'),false);
  c.db.entities[0].politicalStatus[0].sourceIds=['missing'];const r=scan(c,{from:1900,until:1900});
  assert.ok(r.gaps.find(g=>g.category==='political-institutional'));assert.ok(r.metrics.weakSourceGaps>0);
});
test('legacy entities without existence remain scanned using dated facts and mappings',()=>{
  const c=fixture();delete c.db.entities[0].existence;const r=scan(c,{from:1900,until:1900});
  assert.equal(r.metrics.entitiesScanned,1);assert.equal(r.metrics.entityYearsScanned,1);
  assert.ok(r.gaps.every(g=>g.cautions.some(x=>x.includes('derived from existing dated'))));
});
test('raw political resolver gaps and unresolved identity counts do not infer fallback',()=>{
  const c=fixture();c.db.mappings=[];c.manifest.identities.push({stableMapId:'unknown',displayName:'Unresolved',snapshotYears:[1900],classification:{classification:'unresolved'}});
  const r=scan(c,{from:1900,until:1900});assert.equal(r.metrics.unresolvedClassifications,1);
  assert.equal(r.gaps.find(g=>g.category==='resolver').entityId,null);
  assert.deepEqual(r.gaps.find(g=>g.category==='identity-review').mapIds,['unknown']);
});
test('bounded jobs have deterministic IDs, explicit scope and stale scan protection',()=>{
  const c=fixture(),s=scan(c,{from:1900,until:1900}),opts={limit:2,categories:['capital','leadership']};
  const a=generateJobs(s,c,opts),b=generateJobs({...s,gaps:[...s.gaps].reverse()},c,opts);
  assert.deepEqual(a,b);assert.equal(a.jobs.length,2);assert.equal(a.concurrency,3);
  assert.ok(a.jobs.every(j=>j.period.from===j.period.until&&j.prohibitedAssumptions.length));
  assert.throws(()=>generateJobs(s,{...c,productionFingerprint:'changed'},opts),/stale/);
  assert.throws(()=>generateJobs(s,c,{limit:0}),/limit/);
});
test('important figures use relevance intervals and events use dated context intervals',()=>{
  const c=fixture(),e=c.db.entities[0];e.importantFigures=[{value:'Scientist',relevance:{from:'1895',until:'1905'},sourceIds:['s']}];e.events=[fact('Constitutional conflict','1899-11','1900-03')];
  const r=scan(c,{from:1900,until:1900});assert.equal(r.gaps.some(g=>g.category==='important-figures'),false);assert.equal(r.gaps.some(g=>g.category==='events-context'),false);
  e.importantFigures[0].relevance={from:'1880',until:'1890'};assert.ok(scan(c,{from:1900,until:1900}).gaps.some(g=>g.category==='important-figures'));
});
test('missing descriptions remain a political core gap',()=>{
  const c=fixture();delete c.db.entities[0].descriptions;const r=scan(c,{from:1900,until:1900});assert.match(r.gaps.find(g=>g.category==='political-institutional').reason,/descriptions/);
  assert.equal(r.metrics.fieldCoverage['political-institutional'].partialYears,1);
});
test('between-snapshot entity mapping gaps do not assert raw polygon presence',()=>{
  const c=fixture();c.db.entities[0].existence.validUntil='1903-01-01';c.db.mappings[0].validUntil='1900-06-01';const r=scan(c,{from:1900,until:1902});
  const middle=r.gaps.find(g=>g.entityId==='e'&&g.category==='mapping-review'&&g.period.from==='1901');assert.ok(middle);assert.ok(middle.cautions.some(x=>x.includes('not proof that any raw polygon is present')));
  assert.equal(r.metrics.rawResolverYearsScanned,1);assert.equal(r.metrics.transitionYearGaps,1);assert.ok(r.gaps.some(g=>g.entityId===null&&g.category==='resolver'&&g.period.from==='1900'&&g.reason.includes('partial framework')));
});
test('field coverage separates exact observations, missing years and partial institutions',()=>{
  const c=fixture();c.manifest.classification={politicalCoverage:{candidates:401,covered:362}};const r=scan(c,{from:1900,until:1900});
  assert.deepEqual(r.metrics.resolverAvailability,{candidates:401,covered:362});assert.equal(r.metrics.fieldCoverage['population-statistics'].missingYears,1);assert.equal(r.metrics.fieldCoverage['population-statistics'].observationYears,0);
  assert.equal(r.metrics.fieldCoverage['political-institutional'].fullySupportedYears,1);
});
test('imprecise final year remains a temporal gap even when resolver displays its records',()=>{
  const c=fixture();c.db.entities[0].governments[0].validUntil='1900';
  assert.ok(scan(c,{from:1900,until:1900}).gaps.some(g=>g.category==='political-institutional'));
});
test('observations without geographic scope are not statistical completeness',()=>{
  const c=fixture();c.db.entities[0].population=[{value:110,asOf:'1900',sourceIds:['s']}];
  const r=scan(c,{from:1900,until:1900});assert.equal(r.metrics.fieldCoverage['population-statistics'].observationYears,0);assert.ok(r.gaps.some(g=>g.category==='population-statistics'));
});
test('France 1958 remains incomplete between snapshots despite visible Fourth Republic records',()=>{
  const c=readContext(),r=scan(c,{from:1958,until:1958,entityIds:['france-political-frameworks']});
  const gap=r.gaps.find(g=>g.category==='political-institutional');assert.ok(gap);
  assert.ok(gap.existingFacts.some(f=>f.validUntil==='1958'));
  assert.equal(r.metrics.fieldCoverage['political-institutional'].fullySupportedYears,0);
  assert.equal(r.metrics.fieldCoverage['political-institutional'].partialYears,1);
});
