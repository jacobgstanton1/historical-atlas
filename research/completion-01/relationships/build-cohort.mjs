import fs from 'node:fs';
import crypto from 'node:crypto';
import {readContext,digest} from '../../../scripts/research-common.mjs';
import {dateBounds,temporalBounds} from '../../../scripts/research-comprehensive.mjs';
const base='research/completion-01/relationships',read=p=>JSON.parse(fs.readFileSync(p)),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const selection=read(base+'/selection.json'),context=readContext(),sources=new Map(context.registry.sources.map(s=>[s.id,s]));
const claims=[],held=[],bindings=selection.inputBindings.filter(x=>!x.path.includes('comprehensive-dossiers.json')&&!x.path.includes('/reports/')).map(x=>({...x}));
for(const s of selection.selection.filter(s=>s.missingSlots.length)){
 const entity=context.db.entities.find(e=>e.id===s.entityId),existence=entity.existence||entity,original=s.originalFact;
 const temporal={...s.proposedTemporal,certainty:'exact'};
 let sourceRange,entityRange;try{sourceRange=temporalBounds(temporal);entityRange=temporalBounds({kind:'interval',from:existence.validFrom||temporal.from,until:existence.validUntil||temporal.until});}catch{held.push({originalClaimId:s.originalClaimId,entityId:s.entityId,reason:'Original interval requires coordinator precision review'});continue;}
 if(sourceRange.lo<Math.max(dateBounds('1800').lo,entityRange.lo)||sourceRange.hi>Math.min(dateBounds('1961-01-01').lo,entityRange.hi)){held.push({originalClaimId:s.originalClaimId,entityId:s.entityId,reason:'Original interval outside atlas/entity bounds; held rather than silently redated',originalFactDigest:s.originalFactDigest});continue;}
 const evidenceTemporal={kind:'interval',from:s.proposedTemporal.from,until:s.proposedTemporal.until||'1961',certainty:'exact'};
 const precision=['year','month','day'].toSorted((a,b)=>({year:1,month:2,day:3}[b]-{year:1,month:2,day:3}[a])).find(p=>[dateBounds(evidenceTemporal.from).precision,dateBounds(evidenceTemporal.until).precision].includes(p));
 const qualifications=[...(Array.isArray(original.notes)?original.notes:typeof original.notes==='string'?[original.notes]:[]),...(typeof original.note==='string'?[original.note]:[]),'Exact reuse of an already accepted sourced political-status statement; no additional sovereignty, succession, occupation legitimacy or target-entity assertion.','Named party is a literal text marker only, without inferred historical entity ID.','Original interval dates and precision are copied exactly inside the existing source/entity/atlas validity envelope.'];
 claims.push({id:'completion-status-relationship-'+digest({originalClaimId:s.originalClaimId,temporal}).slice(0,24),category:'relationships',value:original.value,entityId:s.entityId,temporal,scope:{id:s.entityId,description:'Existing accepted political-status scope of '+s.entityName+'; original statement and qualifications preserved.',relationship:'same'},sourceIds:[...original.sourceIds],evidence:original.sourceIds.map(sourceId=>({sourceId,locator:'data/historical-entities.json entity '+s.entityId+' politicalStatus['+s.originalIndex+']; original '+s.originalClaimId+'; source '+(sources.get(sourceId)?.url||''),note:'Existing accepted source record SHA (canonical JSON) '+s.originalFactDigest+'. Literal reused statement: '+original.value,precision,temporal:evidenceTemporal,interpretation:'direct'})),status:'supported',risks:[],qualifications:[...new Set(qualifications)],relatedParty:s.predicate.literalPartyMarker,origin:{kind:'production-reuse',reference:s.originalClaimId,sourceIdentifier:s.originalFactDigest}});
}
const cohort={id:'completion01-explicit-status-relationships',worker:'campaign2-flags',claims};
for(const path of [base+'/selection.json',base+'/build-selection.mjs',base+'/build-cohort.mjs'])bindings.push({path,sha256:sha(path)});
const draft={cohortHash:digest(cohort),reviewer:null,bodyReviewed:false,acceptedClaimIds:[],inputBindings:bindings,rationale:'DRAFT ONLY: independent coordinator category certification required. Reuse exact previously accepted politicalStatus statements, dates, sources and notes. No new source-body retrieval. Literal party marker is not a historical entity-ID mapping.',draft:true,originalSourceClaimBindings:claims.map(c=>({claimId:c.id,originalClaimId:c.origin.reference,originalFactDigest:c.origin.sourceIdentifier}))};
fs.writeFileSync(base+'/cohort.json',JSON.stringify(cohort,null,2)+'\n');
fs.writeFileSync(base+'/certificate-draft.json',JSON.stringify(draft,null,2)+'\n');
fs.writeFileSync(base+'/cohort-held.json',JSON.stringify(held,null,2)+'\n');
const missing=selection.selection.flatMap(s=>s.missingSlots.filter(slot=>claims.some(c=>c.origin.reference===s.originalClaimId&&slot.potentialSupport==='full-calendar-year')).map(slot=>slot.entityId+':'+slot.snapshotYear));
console.log({claims:claims.length,held:held.length,fullMissingSlots:new Set(missing).size,independentReview:false,productionEdited:false});
