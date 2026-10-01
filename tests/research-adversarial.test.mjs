import test from 'node:test';
import assert from 'node:assert/strict';
import {readJSON,digest} from '../scripts/research-common.mjs';
import {validatePackage} from '../scripts/research-validator.mjs';
const fixtures=readJSON(new URL('../research/fixtures/adversarial-packages.json',import.meta.url));
for(const c of fixtures.cases)test('historical adversarial fixture: '+c.id,()=>{
  const before=digest(fixtures.context),result=validatePackage(c.package,c.job,fixtures.context);
  assert.equal(result.status,c.expected,result.errors.join('; '));assert.equal(digest(fixtures.context),before);
  assert.notEqual(result.status,'accepted');
});
