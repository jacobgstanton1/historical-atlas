// Normalize the frozen, independently reviewed source-wide Archigos tranche.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {readJSON,readContext,saveJSON,digest} from './research-common.mjs';
const base='research/completion-01/leadership/',raw=readJSON(base+'candidate-tranche.json'),review=readJSON(base+'independent-review.json'),context=readContext();
if(digest(review)!=='071e9886c957423c60820068958af350ee09b7a9da17518aabbd77da0b65c463'||review.inputCanonicalDigest!==digest(raw))throw Error('Changed independent review');
const bindings=review.sourceBindings.filter(b=>!b.path.endsWith('/priority-queue.json'));
for(const b of bindings)if(crypto.createHash('sha256').update(fs.readFileSync(b.path)).digest('hex')!==b.sha256)throw Error('Changed source input '+b.path);
const claims=review.rows.filter(r=>r.decision==='source-and-mapping-approved').map(r=>{
 const original=raw.candidates.find(c=>c.id===r.claimId),f=r.approvedMappedFields,entity=context.db.entities.find(e=>e.id===f.entityId);
 if(digest(original)!==r.originalCandidateDigest||digest(entity)!==r.mapping.entityRecordDigest||!review.acceptedRowIds.includes(r.claimId))throw Error('Changed accepted row/entity');
 const temporal={kind:'interval',from:f.from,until:f.until,certainty:'exact'},sourceTemporal={kind:'interval',...f.originalTerm,certainty:'exact'};
 return{id:'completion-leadership-'+digest(r.claimId).slice(0,24),entityId:f.entityId,category:'leadership',value:f.value,role:f.role,temporal,scope:{id:f.entityId+'-central-office',description:f.scope,relationship:'same'},sourceIds:[f.sourceId],evidence:[{sourceId:f.sourceId,locator:f.locator,note:'Independently approved source row '+r.originalRowDigest+'; original table lines '+JSON.stringify(r.originalSourceTableLines)+'. '+r.reason,precision:'day',temporal:sourceTemporal,interpretation:'direct'}],status:'supported',risks:[],qualifications:[f.qualification,...(r.qualification?[r.qualification]:[])],origin:{kind:'bulk-candidate',reference:r.claimId,sourceIdentifier:f.locator}};
});
const cohort={id:'completion01-reviewed-archigos-leadership',worker:'completion-archigos-source-normalizer',claims};
bindings.push({path:base+'independent-review.json',sha256:crypto.createHash('sha256').update(fs.readFileSync(base+'independent-review.json')).digest('hex')});
saveJSON(base+'cohort.json',cohort);saveJSON(base+'certificate.json',{cohortHash:digest(cohort),reviewer:review.reviewer,bodyReviewed:true,acceptedClaimIds:claims.map(c=>c.id),inputBindings:bindings,rationale:review.reviewMethod+' Source-wide literal role/date/entity review is reused; the priority queue was selection context, not historical evidence. Its original hash remains in the preserved receipt but is excluded from source certification because completion reports are regenerated. No ambiguous proposal is included.'});console.log({accepted:claims.length,held:review.heldRowIds.length});
