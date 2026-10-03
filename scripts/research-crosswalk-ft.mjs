// Rerun the complete existing FT crosswalk and its held set; never alter certified inputs.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {readJSON,saveJSON,digest,readContext,isCLI} from './research-common.mjs';
import {screenFederico,populationClaim} from './research-federico-tena.mjs';
import {mappingContent,assessCompatibility} from './research-crosswalk.mjs';
export function buildGradedFederico(){
 const base='research/crosswalk-01',review=readJSON(base+'/ft-review.json'),matrix=readJSON('research/completion-01/reports/completion.json'),context=readContext();
 for(const b of review.inputBindings)if(crypto.createHash('sha256').update(fs.readFileSync(b.path)).digest('hex')!==b.sha256)throw Error('Reviewed FT input changed');
 const observations=readJSON('research/completion-03/population/observations.json'),old=readJSON('research/completion-03/population/historical-crosswalk.json');
 const strict=screenFederico({observations:observations.observations,mappings:old.mappings,matrix,entities:context.db.entities});
 const accepted=[],mappings=[],holds=[];
 for(const d of review.decisions){
  if(d.rowDisposition!=='MAPPING_REVIEW_ELIGIBLE'||d.entityId==='united-states'){
   holds.push({...d,coordinatorDisposition:'held',coordinatorRationale:d.entityId==='united-states'&&d.observationYear===1800?'Source-native population geography relative to the early polity is not established; Alaska/Hawaii alone do not settle scope. No exactness or immaterial-difference assumption.':d.rationale});continue;
  }
  const row=matrix.rows.find(r=>r.entityId===d.entityId&&r.snapshotYear===d.observationYear);
  if(row.categories['population-statistics'].status==='supported')continue;
  const prior=old.mappings.find(m=>m.entityId===d.entityId&&m.year===d.observationYear),hits=observations.observations.filter(r=>r.polity===d.polity&&r.year===d.observationYear);
  if(hits.length!==1||!['A','B','C'].includes(hits[0].quality))throw Error('Nonunique or poor-quality FT observation');
  const original=hits[0];if(crypto.createHash('sha256').update(fs.readFileSync(original.file)).digest('hex')!==original.fileSHA256)throw Error('Original FT workbook changed');
  const mapping={id:'ft-graded-'+digest([d.entityId,d.observationYear]).slice(0,20),atlasEntityId:d.entityId,external:{dataset:'Federico–Tena historical-border population 2025',id:original.sheet+':'+original.column,name:d.polity},class:d.mappingClass,period:{from:d.observationYear+'-01-01',until:(d.observationYear+1)+'-01-01'},fields:['population-statistics'],territorial:{classification:d.populationCompatibility,sourceScope:`Federico–Tena ${d.observationYear} ${d.polity} national population reconstruction`,atlasScope:row.name,differences:'Source-year national statistical scope retained; no claim of exact map polygon congruence. '+d.qualifications.join(' '),materialDifference:false},continuityEstablished:true,competingEntity:false,rationale:d.rationale,evidence:[{sourceId:'ftwphd-methodology-2025',locator:d.sourceLocators.map(s=>s.locator).join('; ')}],worker:'/root-ft-graded-normalizer'};
  mapping.review={reviewer:review.reviewer,decision:'accepted',contentHash:digest(mappingContent(mapping))};
  const claim=populationClaim({mapping:{...prior,confidence:'B',scopeRationale:mapping.territorial.sourceScope+'. '+d.qualifications.join(' ')},row:original});
  claim.compatibility=mapping;claim.scope.relationship='compatible';claim.qualifications.push(mapping.territorial.sourceScope,...d.qualifications);claim.origin.reference+='; compatibility B; source scope NEAR-EQUIVALENT; population-only permission';
  const a=assessCompatibility(mapping,claim,{requestedYear:d.observationYear});if(!a.accepted)throw Error(a.errors.join('; '));
  accepted.push(claim);mappings.push(mapping);
 }
 const cohort={id:'crosswalk01-ft-reviewed-historical-equivalence',worker:'/root-ft-graded-normalizer',claims:accepted};
 saveJSON(base+'/ft-intake/cohort.json',cohort);saveJSON(base+'/ft-intake/mappings.json',mappings);saveJSON(base+'/ft-intake/held.json',holds);
 const counts=Object.fromEntries(['A','B','C','D'].map(k=>[k,review.decisions.filter(d=>d.mappingClass===k).length]));
 saveJSON(base+'/ft-intake/yield.json',{sourceObservations:observations.observations.length,oldBoundedMappings:old.mappings.length,oldStrictCurrentNewCandidates:strict.accepted.length,oldStrictCurrentHeld:strict.held.length,alreadySupported:strict.skipped.length,heldSetRetested:review.decisions.length,mappingClasses:counts,newGradedCandidateClaims:accepted.length,mappingPermissionBeforeRowChecks:review.summary.mappingPermitted,coordinatorHeld:holds.length,reason:'Source quality, chronology, and territorial ambiguity remain separate from A/B/C naming/scope permission; figures are candidates until validated and integrated.'});
 return {claims:accepted.length,classes:counts};
}
if(isCLI(import.meta.url))console.log(JSON.stringify(buildGradedFederico()));
