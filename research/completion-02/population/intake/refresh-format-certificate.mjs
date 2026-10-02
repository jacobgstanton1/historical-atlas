import fs from 'node:fs';
import assert from 'node:assert/strict';
import {digest,readJSON,saveJSON} from '../../../../scripts/research-common.mjs';
const b='research/completion-02/population/intake/';
const old=readJSON(b+'certificate.json'),cohort=readJSON(b+'cohort.json');
const prior=structuredClone(cohort);
for(const c of prior.claims){
 assert.deepEqual(c.risks,[],'Only empty risk assessment schema addition is authorized');
 delete c.risks;
 assert.equal(digest(c),old.claimReceipts.find(r=>r.claimId===c.id)?.claimDigest,'Source claim fields unchanged');
}
assert.equal(digest(prior),old.cohortHash,'Entire prior cohort unchanged except added risks arrays');
saveJSON(b+'format-rejected-certificate.json',old);
saveJSON(b+'format-refresh-review.json',{reviewer:'officeholder_sources',previousCohortHash:old.cohortHash,newCohortHash:digest(cohort),method:'Removed only risks:[] from each of 106 current claims; resulting complete cohort digest exactly matches previously source-reviewed cohort. Every original claim digest independently unchanged. No repeat source research required.',claimsChecked:cohort.claims.length});
console.log(JSON.stringify({onlyEmptyRisksAdded:true,claimsChecked:cohort.claims.length,newCohortHash:digest(cohort)}));
