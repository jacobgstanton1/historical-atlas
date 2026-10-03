// Field-specific historical compatibility. Research tooling only; never a fuzzy-name approval.
import {digest,periodBounds,dateRange} from './research-common.mjs';
export const mappingClasses=['A','B','C','D'];
export const statisticalFields=['population-statistics','area-statistics','density','economy'];
export const entityFields=['identity','political-institutional','leadership','capital','currency','historical-flag','relationships'];
export const territorialClasses=['EXACT','NEAR-EQUIVALENT','QUALIFIED-COMPATIBLE','INCOMPATIBLE'];
export const mappingContent=m=>Object.fromEntries(Object.entries(m).filter(([key])=>key!=='review'));
export function validateMapping(m){
 const errors=[];const need=(ok,label)=>{if(!ok)errors.push(label);};
 need(m&&typeof m==='object','Mapping object required');if(errors.length)return errors;
 need(!!m.id&&!!m.atlasEntityId,'Stable mapping/entity IDs required');
 need(!!m.external?.dataset&&!!m.external?.id&&!!m.external?.name,'Original dataset, identifier and name required');
 need(mappingClasses.includes(m.class),'A/B/C/D class required');
 need(Array.isArray(m.fields)&&m.fields.length>0&&new Set(m.fields).size===m.fields.length&&m.fields.every(f=>[...statisticalFields,...entityFields,'events-context','important-figures','overview','historical-context-status'].includes(f)),'Explicit distinct known field permissions required');
 try{const b=periodBounds(m.period);need(!!m.period?.from&&!!m.period?.until&&b[0]<b[1],'Bounded ordered mapping interval required');}catch{errors.push('Invalid mapping dates');}
 need(territorialClasses.includes(m.territorial?.classification),'Territorial class required');
 need(!!m.territorial?.sourceScope?.trim()&&!!m.territorial?.atlasScope?.trim()&&!!m.territorial?.differences?.trim(),'Both scopes and explicit differences required');
 need(typeof m.territorial?.materialDifference==='boolean','Material difference assessment required');
 need(!!m.rationale?.trim()&&Array.isArray(m.evidence)&&m.evidence.length>0&&m.evidence.every(e=>e.sourceId&&e.locator),'Documented mapping rationale and evidence required');
 if(m.class==='A')need(m.territorial?.classification==='EXACT'&&m.territorial.materialDifference===false,'A must be exact, never relabel a proxy exact');
 if(['B','C'].includes(m.class)){
  need(m.territorial?.materialDifference===false&&m.territorial.classification!=='INCOMPATIBLE','Material territorial mismatch remains held');
  need(!!m.review?.reviewer&&!!m.worker&&m.review.reviewer!==m.worker&&m.review.decision==='accepted'&&m.review.contentHash===digest(mappingContent(m)),'Independent content-bound B/C mapping review required');
 }
 if(m.class==='B')need(m.continuityEstablished===true&&m.competingEntity===false,'B needs documented continuity and no competing entity');
 if(m.class==='C')need(Array.isArray(m.fields)&&m.fields.every(f=>statisticalFields.includes(f)),'C is field-specific quantitative permission, never general polity equivalence');
 return errors;
}
export function assessCompatibility(mapping,claim,{requestedYear}={}){
 const errors=validateMapping(mapping),need=(ok,label)=>{if(!ok)errors.push(label);};
 if(errors.length)return{accepted:false,errors};
 need(mapping.class!=='D','D mappings remain held');
 need(mapping.atlasEntityId===claim.entityId,'Wrong atlas entity');
 need(mapping.fields.includes(claim.category),'Field not permitted by mapping');
 let b;try{
  const t=claim.temporal;b=t.kind==='interval'?periodBounds(t):dateRange(t.observationDate||t.date);
  const mb=periodBounds(mapping.period);need(b[0]>=mb[0]&&b[1]<=mb[1],'Claim outside mapping interval');
  if(requestedYear!==undefined){const y=dateRange(String(requestedYear));need(y[0]>=mb[0]&&y[1]<=mb[1],'Requested snapshot outside mapping interval');}
 }catch{errors.push('Invalid claim/mapping temporal data');}
 if(mapping.class==='C'){
  need(statisticalFields.includes(claim.category)&&claim.temporal.kind==='observation','C requires dated statistical observation');
  need(!!claim.scope?.description&&claim.qualifications?.some(q=>q.includes(mapping.territorial.sourceScope)),'Original statistical scope must remain explicitly qualified');
  if(claim.category==='density')need(!!mapping.mutualScopeEvidence?.trim(),'Density requires explicit population/area mutual compatibility');
 }
 if(['events-context','important-figures'].includes(claim.category))need(['A','B'].includes(mapping.class)||mapping.directAssociationEvidence,'Association must be directly evidenced');
 if(claim.category==='overview')need(!!claim.derivation?.acceptedClaimIds?.length,'Overview only from accepted underlying claims');
 return{accepted:errors.length===0,class:mapping.class,errors};
}
export function qualifiedCompatibility(claim){return !!claim.compatibility&&assessCompatibility(claim.compatibility,claim).accepted;}
export function rankMappingReviews(candidates){return candidates.map(c=>({...c,expectedSlotsPerEffort:c.expectedNewSlots/c.reviewEffort})).sort((a,b)=>b.expectedSlotsPerEffort-a.expectedSlotsPerEffort||b.expectedNewSlots-a.expectedNewSlots||a.id.localeCompare(b.id));}
