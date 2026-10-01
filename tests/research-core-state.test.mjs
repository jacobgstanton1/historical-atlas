import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validatePackage} from '../scripts/research-validator.mjs';

const fixture=JSON.parse(readFileSync(new URL('../research/fixtures/valid-package.json',import.meta.url)));
const context={productionFingerprint:'a'.repeat(64),db:{entities:[{id:'example-polity',existence:{validFrom:'1800',validUntil:'1961'}}],mappings:[{mapId:'entity-example',entityId:'example-polity',validFrom:'1800',validUntil:'1961'}]},registry:{sources:[]},manifest:{}};
function pair(){
  const pkg=structuredClone(fixture);
  pkg.category='core-state';pkg.categories=['capital','leadership','political-institutional','currency'];pkg.worker.specialism='entity-core';
  Object.assign(pkg.claims[0].evidence[0],{from:pkg.period.from,until:pkg.period.until});
  for(const [category,value]of [['capital','Example capital'],['leadership','Example officeholder'],['currency','Example currency']]){
    const c=structuredClone(pkg.claims[0]);c.id=category+'-claim';c.category=category;c.value=value;delete c.metric;
    if(category==='leadership')c.role='Head of state';pkg.claims.push(c);
  }
  const job={id:pkg.jobId,entityId:pkg.entityId,mapIds:pkg.mapIds,period:pkg.period,category:pkg.category,categories:[...pkg.categories],productionFingerprint:pkg.productionFingerprint,cautions:[]};
  return {pkg,job};
}
function validate(mutate=()=>{}){const pairData=pair();mutate(pairData.pkg,pairData.job);return validatePackage(pairData.pkg,pairData.job,context);}
test('entity-centric package supports four separately dated sourced core fields and still needs independent review',()=>{
  const result=validate();assert.equal(result.valid,true,result.errors.join('\n'));assert.equal(result.status,'historical-review');
});
test('existing simultaneous distinct offices are not contradictory leaders',()=>{
  const {pkg,job}=pair(),ctx=structuredClone(context);
  ctx.db.entities[0].leaders=[{value:'Different person',role:'Head of government',validFrom:pkg.period.from,validUntil:pkg.period.until}];
  assert.equal(validatePackage(pkg,job,ctx).review.some(x=>/existing leaders fact/.test(x)),false);
  ctx.db.entities[0].leaders[0].role='Head of state';assert.equal(validatePackage(pkg,job,ctx).review.some(x=>/existing leaders fact/.test(x)),true);
});
test('entity-centric assignment categories are explicit, bounded, unique and job-bound',()=>{
  for(const mutate of [(p)=>delete p.categories,(p,j)=>delete j.categories,(p,j)=>j.categories.push('population-statistics'),(p,j)=>j.categories.push('capital'),(p)=>p.categories.pop()]){
    const result=validate(mutate);assert.equal(result.valid,false);assert.ok(result.errors.length);
  }
});
test('core assignment cannot import observations, figures, statistics or arbitrary unassigned fields',()=>{
  for(const category of ['population-statistics','important-figures','relationships','core-state'])assert.equal(validate(p=>p.claims[0].category=category).valid,false);
  assert.equal(validate(p=>p.claims[0].temporal={kind:'observation',observationDate:'1905'}).valid,false);
  const {pkg}=pair();pkg.claims[0].figure={personId:'example-person',name:'Example',categories:['writer'],lifespan:{from:'1800',until:'1950'},relevance:{from:'1900',until:'1910'},relationship:'Documented',activity:'Documented',contribution:'Documented'};
  assert.equal(validatePackage(pkg,pair().job,context).valid,false);
});
test('all core claims need body evidence with explicit supported interval bounds',()=>{
  const result=validate(p=>delete p.claims[0].evidence[0].until);assert.equal(result.valid,false);assert.ok(result.errors.some(e=>/source-supported interval endpoints/.test(e)));
  const leaked=validate(p=>p.claims[0].evidence[0].from='1905-01-01');assert.equal(leaked.valid,false);assert.ok(leaked.errors.some(e=>/source-supported historical period/.test(e)));
});
test('ordinary specialist jobs remain single-category and cannot borrow entity-core permissions',()=>{
  const {pkg,job}=pair();pkg.category=job.category='political-institutional';pkg.worker.specialism='political-institutional';pkg.claims=[pkg.claims[0]];
  assert.equal(validatePackage(pkg,job,context).valid,false);delete pkg.categories;delete job.categories;
  assert.equal(validatePackage(pkg,job,context).valid,true);pkg.worker.specialism='entity-core';assert.equal(validatePackage(pkg,job,context).valid,false);
});
test('multi-field overlap review compares actual claim fields and roles',()=>{
  assert.equal(validate().review.some(x=>/contradictory/.test(x)),false);
  const result=validate(p=>p.claims.push({...structuredClone(p.claims[1]),id:'second-capital',value:'Different capital'}));
  assert.equal(result.valid,true);assert.ok(result.review.some(x=>/contradictory/.test(x)));
});
test('entity-centric worker cannot bypass fingerprint or ambiguity review safeguards',()=>{
  assert.equal(validate(p=>p.productionFingerprint='b'.repeat(64)).valid,false);
  const result=validate(p=>{p.claims[0].riskFlags=['contested-sovereignty'];p.claims[0].reviewStatus='unresolved';});
  assert.equal(result.valid,true);assert.ok(result.review.some(x=>/contested-sovereignty/.test(x)));
  assert.equal(validate(p=>p.worker.specialism='leadership').valid,false);
});
