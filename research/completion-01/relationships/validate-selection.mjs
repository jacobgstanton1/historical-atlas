import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readContext,digest} from '../../../scripts/research-common.mjs';
import {dateBounds,temporalBounds} from '../../../scripts/research-comprehensive.mjs';
import {relationshipStatusPredicate as predicate} from './predicate.mjs';
const base='research/completion-01/relationships',load=p=>JSON.parse(fs.readFileSync(p)),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const selection=load(base+'/selection.json'),cohort=load(base+'/cohort.json'),certificate=load(base+'/certificate-draft.json'),baseline=load('research/completion-01/reports/completion.json'),context=readContext();let checks=0;
const check=(v,message)=>{assert(v,message);checks++;};
for(const binding of certificate.inputBindings)check(sha(binding.path)===binding.sha256,'Bound input changed: '+binding.path);
const reject=['Independent republic','German state under National Socialist rule','Constitutional monarchy under the Crown','Kingdom before union with Great Britain','Independent state formerly under British occupation','United kingdom under a shared Crown and Parliament','Occupied former Italian colonial territory','Federal republic after termination of the Occupation Statute; continuing Allied reserved rights','Independent state before French occupation',null,''];
for(const value of reject)check(!predicate(value).eligible,'Incorrect semantic eligibility: '+value);
for(const value of ['British colony','Sovereign kingdom in personal union with Denmark','French colonial territory with contested and uneven effective control','Under Allied occupation','Recognised sovereignty with contested French military presence','Former German territory under French administration before League mandate','British colony before 1946 constitutional changes','East India Company presidency administration'])check(predicate(value).eligible,'Missing literal relationship: '+value);
const seenOriginal=new Set(),sourceClaim=new Map();
for(const row of [...selection.selection,...selection.holds]){
 const entity=context.db.entities.find(e=>e.id===row.entityId),original=entity.politicalStatus[row.originalIndex];
 check(digest(original)===row.originalFactDigest,'Changed original fact');check(digest(original)===digest(row.originalFact),'Literal source object not retained');
 check(row.proposedRelationshipValue===original.value,'Value rewritten');check(digest(row.proposedSourceIds)===digest(original.sourceIds),'Source IDs changed');
 check(row.proposedTemporal.from===(original.validFrom||original.from),'Start date changed');check(row.proposedTemporal.until===(original.validUntil||original.until),'End date changed');
 check(digest(row.predicate)===digest(predicate(original.value)),'Predicate changed');check(!row.newHistoricalAssertion&&row.inferredTargetCount===0&&row.newTargetEntityIds.length===0,'Inferred entity/assertion');
 check(!seenOriginal.has(row.entityId+':'+row.originalIndex),'Duplicate original');seenOriginal.add(row.entityId+':'+row.originalIndex);sourceClaim.set(row.originalClaimId,row);
 if(selection.selection.includes(row))check(row.issues.length===0&&row.predicate.eligible,'Ineligible selected');else check(row.issues.length>0,'Unexplained hold');
 for(const slot of row.missingSlots){const existing=baseline.rows.find(x=>x.entityId===row.entityId&&x.snapshotYear===slot.snapshotYear);check(existing.categories.relationships.status==='missing','Already complete slot');check(existing.categories['political-institutional'].records.includes(row.originalClaimId),'Not an existing supported source claim');}
}
const ids=new Set(),gained=new Set();
for(const claim of cohort.claims){
 const row=sourceClaim.get(claim.origin.reference);check(!!row,'Unbound claim');check(!ids.has(claim.id),'Duplicate claim');ids.add(claim.id);
 check(claim.value===row.originalFact.value,'Claim text changed');check(digest(claim.sourceIds)===digest(row.proposedSourceIds),'Claim source IDs changed');check(claim.origin.sourceIdentifier===row.originalFactDigest,'Source digest changed');
 check(claim.category==='relationships'&&claim.origin.kind==='production-reuse','Wrong category/origin');check(claim.relatedParty===row.predicate.literalPartyMarker&&claim.value.toLowerCase().includes(claim.relatedParty.toLowerCase()),'Party not a literal marker');
 check(!Object.hasOwn(claim,'relatedEntityIds'),'Invented related entity IDs');check(claim.temporal.from===row.proposedTemporal.from&&claim.temporal.until===row.proposedTemporal.until,'Original claim dates/precision changed');
 const eb=context.db.entities.find(e=>e.id===claim.entityId).existence||{},interval=temporalBounds(claim.temporal);
 const originalRange=temporalBounds({...row.proposedTemporal,certainty:'exact'}),entityRange=temporalBounds({kind:'interval',from:eb.validFrom||claim.temporal.from,until:eb.validUntil||claim.temporal.until});
 check(interval.lo>=originalRange.lo&&interval.hi<=originalRange.hi,'Outside source interval');check(interval.lo>=entityRange.lo&&interval.hi<=entityRange.hi,'Outside entity interval');
 check(interval.lo>=dateBounds('1800').lo&&interval.hi<=dateBounds('1961-01-01').lo,'Outside configured timeline');
 for(const note of [row.originalFact.note,...(Array.isArray(row.originalFact.notes)?row.originalFact.notes:[row.originalFact.notes])].filter(x=>typeof x==='string'))check(claim.qualifications.includes(note),'Original note lost');
 for(const evidence of claim.evidence){check(claim.sourceIds.includes(evidence.sourceId),'Orphan evidence source');check(evidence.temporal.from===row.proposedTemporal.from,'Original evidence start changed');check(evidence.temporal.until===(row.proposedTemporal.until||'1961'),'Original evidence end changed');const b=temporalBounds(evidence.temporal);check(interval.lo>=b.lo&&interval.hi<=b.hi,'Evidence does not bound claim');}
 for(const slot of row.missingSlots)if(slot.potentialSupport==='full-calendar-year'){check(slot.potentialSupport==='full-calendar-year','Partial slot counted as full');gained.add(slot.entityId+':'+slot.snapshotYear);}
}
check(gained.size===selection.summary.fullMissingRelationshipSlots,'Unexpected normalized slot gain');check(certificate.reviewer===null&&!certificate.bodyReviewed&&certificate.acceptedClaimIds.length===0,'Self-certified historical review');check(certificate.cohortHash===digest(cohort),'Draft cohort digest mismatch');
const files=['selection.json','cohort.json','certificate-draft.json','cohort-held.json'],hashes=files.map(f=>sha(base+'/'+f));
for(const parser of ['build-selection.mjs','build-cohort.mjs']){check(!fs.readFileSync(base+'/'+parser).includes(13),'New parser must be LF');const r=spawnSync(process.execPath,[base+'/'+parser],{encoding:'utf8'});check(r.status===0,'Parser failed');}
files.forEach((f,i)=>check(sha(base+'/'+f)===hashes[i],'Nondeterministic generation: '+f));
for(const binding of certificate.inputBindings)check(sha(binding.path)===binding.sha256,'Frozen input mutated');
const out={pass:true,checks,productionEdited:false,independentHistoricalReview:false,deterministic:true,originalPoliticalStatusFacts:selection.summary.originalPoliticalStatusFacts,candidateClaims:cohort.claims.length,fullMissingRelationshipSlots:gained.size,selectionSha256:sha(base+'/selection.json'),cohortSha256:sha(base+'/cohort.json'),cohortCanonicalHash:digest(cohort),predicateSha256:sha(base+'/predicate.mjs'),certificateDraftSha256:sha(base+'/certificate-draft.json'),inputBindings:certificate.inputBindings};
fs.writeFileSync(base+'/validation.json',JSON.stringify(out,null,2)+'\n');console.log({...out,inputBindings:undefined});
