import test from 'node:test';
import assert from 'node:assert/strict';
import {digest,dateRange,periodBounds,overlap,readContext,productionFingerprint,readJSON} from '../scripts/research-common.mjs';
import {sourceCatalogue} from '../scripts/research-sources.mjs';
test('canonical fingerprints ignore object ordering but preserve array order',()=>{
  assert.equal(digest({a:1,b:2}),digest({b:2,a:1}));assert.notEqual(digest([1,2]),digest([2,1]));
});
test('calendar validation rejects invented calendar dates while retaining partial precision',()=>{
  for(const d of ['1939-02-29','1937-13','1939-04-31','1939-1-01','not-a-date'])assert.throws(()=>dateRange(d));
  assert.equal(dateRange('1940-02-29')[1]-dateRange('1940-02-29')[0],86400000);
  assert.equal(dateRange('1939')[0],Date.UTC(1939,0,1));assert.equal(dateRange('1939')[1],Date.UTC(1940,0,1));
});
test('exact interval endpoints exclude the following day while imprecise ends retain uncertainty',()=>{
  assert.deepEqual(periodBounds({from:'1939-01-01',until:'1940-01-01'}),dateRange('1939'));
  assert.equal(periodBounds({from:'1939',until:'1940'})[1],Date.UTC(1941,0,1));
  assert.equal(overlap(dateRange('1939'),dateRange('1940')),false);
});
test('source catalogue reuses every production ID without guessing quality or mutating data',()=>{
  const c=readContext(),before=digest(c),a=sourceCatalogue(c),b=sourceCatalogue(c);
  assert.equal(a.sources.length,c.registry.sources.length);assert.equal(new Set(a.sources.map(s=>s.id)).size,c.registry.sources.length);
  assert.equal(digest(a),digest(b));assert.equal(digest(c),before);
  assert.ok(a.sources.every(s=>s.kind==='unclassified'||s.classificationBasis==='Existing explicit classification'));
});
test('pre-integration research reads preserve actual production bytes',()=>{
  const before=productionFingerprint();sourceCatalogue(readContext());assert.equal(productionFingerprint(),before);
});
