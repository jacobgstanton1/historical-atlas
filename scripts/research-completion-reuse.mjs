// Literal affiliations may identify a named group without a safely resolved target entity ID.
// This exception is restricted to exact reuse of an existing accepted status record.
import {digest} from './research-common.mjs';
import {relationshipStatusPredicate} from '../research/completion-01/relationships/predicate.mjs';
export function validateLiteralRelationshipReuse(claim,context,bounds){
 if(claim.category!=='relationships'||claim.origin?.kind!=='production-reuse'||typeof claim.relatedParty!=='string'||claim.relatedEntityIds?.length)return false;
 const entity=context.db.entities.find(e=>e.id===claim.entityId);
 for(const original of entity?.politicalStatus||[]){
  const temporal={kind:'interval',from:original.validFrom||original.from,until:original.validUntil||original.until};
  const reference='legacy-'+digest({entityId:entity.id,category:'political-institutional',value:original.value??original.text??original.name??original.asset,temporal,role:original.role,metric:original.metric});
  if(reference!==claim.origin.reference)continue;
  if(claim.origin.sourceIdentifier!==digest(original))return false;
  const predicate=relationshipStatusPredicate(original.value);
  if(original.confidence!=='documented'||['required','unresolved'].includes(original.reviewStatus)||!predicate.eligible||predicate.literalPartyMarker!==claim.relatedParty||claim.value!==original.value||digest(claim.sourceIds)!==digest(original.sourceIds)||claim.sourceIds.includes('basemaps'))return false;
  if(original.note&&!claim.qualifications.includes(original.note))return false;
  // Open source intervals are bounded only by the existing entity and atlas envelope.
  const source={...temporal,until:temporal.until||entity.existence?.validUntil||'1961-01-01'};
  const a=bounds(claim.temporal),b=bounds(source);
  return a.lo>=b.lo&&a.hi<=b.hi&&claim.evidence.every(e=>claim.sourceIds.includes(e.sourceId)&&e.locator.includes(reference));
 }
 return false;
}
