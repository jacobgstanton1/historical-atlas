import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizeScale} from '../scripts/research-scale-report.mjs';
const claim=(id,category='leadership',kind='new-research')=>({id,entityId:'state',category,origin:{kind},sourceIds:['old']});
const pkg=(id,claims)=>({id,entityId:'state',claims,sources:[],acceptance:{review:{decisions:{a:'accepted',b:'held',duplicate:'held'},originalIndependentReview:{decisions:{a:'accepted',b:'held',duplicate:'accepted'}}}}});
test('Progress separates new publication, prior research, bulk and lighter enrichment',()=>{
 const base={packages:[pkg('initial',[claim('a')])]},store={packages:[...base.packages,pkg('scale-nobel-state',[claim('n','important-figures','bulk-candidate')]),pkg('deep-second',[claim('new')])]};
 const result=summarizeScale(store,base,{sources:[{id:'old'}]});assert.equal(result.claimsAddedSince60ClaimCheckpoint,2);assert.equal(result.originsSince60ClaimCheckpoint['bulk-candidate'],1);assert.equal(result.comprehensiveDossierResearchPasses,2);assert.equal(result.dispositions.heldHistoricalClaims,1);assert.equal(result.dispositions.duplicatePublicationExclusions,1);assert.equal(result.sources.reusedBaselineSourcesCitedByAddedClaims,1);
});
test('Progress is deterministic and does not mutate research/production inputs',()=>{
 const base={packages:[]},store={packages:[pkg('deep',[claim('a')])]},registry={sources:[{id:'old'}]},before=JSON.stringify(store);assert.deepEqual(summarizeScale(store,base,registry),summarizeScale(store,base,registry));assert.equal(JSON.stringify(store),before);
});
