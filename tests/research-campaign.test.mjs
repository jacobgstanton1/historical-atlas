import test from 'node:test';
import assert from 'node:assert/strict';
import {readContext,readJSON,digest} from '../scripts/research-common.mjs';
import {campaignJobs,campaignOptions,campaignArguments} from '../scripts/research-campaign.mjs';
test('campaign creates bounded entity assignments deterministically without mutating production',()=>{
  const c=readContext(),before=digest(c),selection=readJSON(new URL('../research/campaign-01/selection.json',import.meta.url)).entities;
  const a=campaignJobs(c,selection),b=campaignJobs(c,selection);assert.equal(a.length,30);assert.equal(digest(a),digest(b));assert.equal(digest(c),before);
  assert.ok(a.every(j=>j.category==='core-state'&&j.categories.length===4&&j.gapOpportunities>0));assert.equal(new Set(a.map(j=>j.id)).size,30);
});
test('campaign rejects global, duplicate and unmapped selections',()=>{
  const c=readContext(),s=readJSON(new URL('../research/campaign-01/selection.json',import.meta.url)).entities;
  assert.throws(()=>campaignJobs(c,[...s,s[0]]),/1–30/);assert.throws(()=>campaignJobs(c,[s[0],s[0]]),/Duplicate/);assert.throws(()=>campaignJobs(c,[{entityId:'invented',period:{from:'1900',until:'1910'}}]),/Unknown|Invalid/);
});

import {smokePlan} from '../scripts/campaign-browser-smoke.mjs';
test('campaign options preserve first campaign and parse isolated directory/config',()=>{
 const defaults=campaignOptions();assert.equal(defaults.config.campaign,'campaign-01');assert.equal(defaults.config.maxAssignments,30);assert.equal(defaults.config.smokeMaxChecks,null);
 const parsed=campaignArguments(['apply','entity','--directory','research/campaign-02','--config','research/campaign-02/config.json']);assert.deepEqual(parsed.positional,['apply','entity']);assert.equal(parsed.options.directory,'research/campaign-02');
 assert.throws(()=>campaignArguments(['--directory']),/Invalid/);assert.throws(()=>campaignArguments(['--config','a','--config','b']),/Invalid/);assert.throws(()=>campaignOptions({directory:'../elsewhere'}),/inside research/);
});
test('campaign two deterministic assignments retain field/identity bounds and provenance',()=>{
 const c=readContext(),s=readJSON(new URL('../research/campaign-01/selection.json',import.meta.url)).entities.slice(0,2),before=digest(c),options={settings:{campaign:'campaign-02',idPrefix:'c02-',maxAssignments:60,expectedAssignments:60,fields:['capital','leadership','currency','political-institutional','historical-flag'],checkpointSize:12,smokeMaxChecks:20}};
 const a=campaignJobs(c,s,options);assert.equal(digest(a),digest(campaignJobs(c,s,options)));assert.equal(digest(c),before);assert.ok(a.every(j=>j.id.startsWith('c02-')&&j.provenance.campaign==='campaign-02'&&j.categories.includes('historical-flag')&&Array.isArray(j.existingFacts.flags)));assert.deepEqual(a[0].period,s[0].period);
 assert.throws(()=>campaignOptions({settings:{fields:['population-statistics']}}),/Invalid/);assert.throws(()=>campaignOptions({settings:{smokeMaxChecks:754}}),/Invalid/);
});
test('bounded browser plan samples categories without repeating hundreds of claim checks',()=>{
 const jobs=Array.from({length:12},(_,i)=>({entityId:'e'+i,package:{claims:['capital','leadership','currency','historical-flag'].map((category,k)=>({id:i+'-'+k,category}))}}));
 assert.equal(smokePlan(jobs,{smokeMaxChecks:null}).length,48);const plan=smokePlan(jobs,{smokeMaxChecks:20});assert.equal(plan.length,4);assert.equal(new Set(plan.map(x=>x.c.category)).size,4);assert.ok(plan.length*4+2<=20);
 assert.ok(smokePlan(jobs,{smokeMaxChecks:40,smokeBoundaryChecks:2}).length*5+2<=40);
});
