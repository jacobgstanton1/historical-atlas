import test from 'node:test';
import assert from 'node:assert/strict';
import {readContext,readJSON,digest} from '../scripts/research-common.mjs';
import {campaignJobs} from '../scripts/research-campaign.mjs';
test('campaign creates bounded entity assignments deterministically without mutating production',()=>{
  const c=readContext(),before=digest(c),selection=readJSON(new URL('../research/campaign-01/selection.json',import.meta.url)).entities;
  const a=campaignJobs(c,selection),b=campaignJobs(c,selection);assert.equal(a.length,30);assert.equal(digest(a),digest(b));assert.equal(digest(c),before);
  assert.ok(a.every(j=>j.category==='core-state'&&j.categories.length===4&&j.gapOpportunities>0));assert.equal(new Set(a.map(j=>j.id)).size,30);
});
test('campaign rejects global, duplicate and unmapped selections',()=>{
  const c=readContext(),s=readJSON(new URL('../research/campaign-01/selection.json',import.meta.url)).entities;
  assert.throws(()=>campaignJobs(c,[...s,s[0]]),/1–30/);assert.throws(()=>campaignJobs(c,[s[0],s[0]]),/Duplicate/);assert.throws(()=>campaignJobs(c,[{entityId:'invented',period:{from:'1900',until:'1910'}}]),/Unknown|Invalid/);
});
