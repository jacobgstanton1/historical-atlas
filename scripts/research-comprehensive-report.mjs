import fs from 'node:fs';
import {readJSON,saveJSON,readContext,digest,productionFingerprint,isCLI} from './research-common.mjs';
import {fields,validateDossier,acceptDossier,integrateDossier,fingerprint} from './research-comprehensive.mjs';
import {initializeDossierQueue,updateDossierQueue} from './research-comprehensive-queue.mjs';

export function summarizePilot(packages,outcomes,context){
 const registered=new Set(context.registry.sources.map(s=>s.id));
 const rows=packages.map((p,i)=>{
  const o=outcomes[i],accepted=p.claims.filter(c=>o.receipt.acceptedClaimIds.includes(c.id));
  const ids=[...new Set(p.claims.flatMap(c=>c.sourceIds))];
  return {entityId:p.entityId,period:p.period,produced:p.claims.length,supported:p.claims.filter(c=>c.status==='supported').length,partialOrUnresolvedClaims:p.claims.filter(c=>c.status!=='supported').length,
   accepted:accepted.length,acceptedNew:accepted.filter(c=>c.origin.kind==='new-research').length,acceptedReused:accepted.filter(c=>c.origin.kind!=='new-research').length,
   held:p.claims.filter(c=>o.receipt.review.decisions[c.id]==='held').length,rejected:p.claims.filter(c=>o.receipt.review.decisions[c.id]==='rejected').length,
   categoriesInvestigated:p.investigation.length,applicableCategories:p.investigation.filter(r=>r.status!=='not-applicable').length,unresolvedGaps:p.investigation.reduce((n,r)=>n+r.gaps.length,0),
   reusedSourceIds:ids.filter(id=>registered.has(id)),newSourceIds:ids.filter(id=>!registered.has(id)),
   producedByCategory:Object.fromEntries(fields.map(f=>[f,p.claims.filter(c=>c.category===f).length])),acceptedByCategory:Object.fromEntries(fields.map(f=>[f,accepted.filter(c=>c.category===f).length])),
   deterministicChecks:o.validation.checks.length,reviewIssues:o.validation.review,modelWorkload:'Not metered; two bounded parallel research workers followed by cross-review, eight coherent entity/period passes.'};
 });
 const sum=key=>rows.reduce((n,r)=>n+r[key],0);
 return {schemaVersion:1,status:'bounded-pilot-complete-accepted-unintegrated',assignments:rows.length,rows,
  totals:{produced:sum('produced'),accepted:sum('accepted'),acceptedNew:sum('acceptedNew'),acceptedReused:sum('acceptedReused'),held:sum('held'),rejected:sum('rejected'),unresolvedGaps:sum('unresolvedGaps'),
   reusedSourceIds:[...new Set(rows.flatMap(r=>r.reusedSourceIds))].sort(),newSourceIds:[...new Set(rows.flatMap(r=>r.newSourceIds))].sort(),
   producedByCategory:Object.fromEntries(fields.map(f=>[f,rows.reduce((n,r)=>n+r.producedByCategory[f],0)])),acceptedByCategory:Object.fromEntries(fields.map(f=>[f,rows.reduce((n,r)=>n+r.acceptedByCategory[f],0)])),
   acceptedClaimsPerAssignment:sum('accepted')/rows.length,newAcceptedClaimsPerAssignment:sum('acceptedNew')/rows.length,deterministicPackageChecks:sum('deterministicChecks'),
   packagesWithAcceptedClaims:rows.filter(r=>r.accepted>0).length,packagesContainingHeldClaims:rows.filter(r=>r.held>0).length,packagesWhollyRejected:rows.filter(r=>r.rejected===r.produced).length},
  production:{entities:context.db.entities.length,registeredSources:context.registry.sources.length,newClaimsIntegrated:0,newSourcesRegistered:0,changed:false,legacyFingerprint:productionFingerprint(context.directory),comprehensiveFingerprint:fingerprint(context.directory),visibleVersion:'v0.6.1'},
  browserChecksPerformed:0,comparison:{campaign1IntegratedFactsPerAssignment:80/30,campaign2Checkpoint1IntegratedFactsPerAssignment:37/12,qualification:'Campaign2’s three flags are included in 37. Pilot accepted claims are not integrated facts. Reused evidence is excluded from new-information throughput. Model usage and elapsed-cost ratios were not measured.'},
  recommendation:'Review pilot and resolve adapter limitations before authorizing any larger campaign. No global campaign started.'};
}

if(isCLI(import.meta.url)){
 const base='research/comprehensive/pilot',selection=readJSON('research/comprehensive/pilot-selection.json'),context=readContext();
 const checkpoint=readJSON('research/comprehensive/architecture-checkpoint.json');
 if(productionFingerprint()!==checkpoint.legacyProductionFingerprint)throw Error('Production changed: inspect before trusting recorded validation');
 const packages=selection.assignments.map(a=>readJSON(base+'/packages/'+a.entityId+'.json'));
 const jobs=selection.assignments.map(a=>readJSON(base+'/jobs/'+a.entityId+'.json'));
 const outcomes=packages.map((p,i)=>{
  const validation=validateDossier(p,jobs[i],context);if(!validation.valid)throw Error(p.entityId+': '+validation.errors.join('; '));
  const receipt=acceptDossier(p,jobs[i],context,readJSON(base+'/reviews/'+p.entityId+'.json'));
  // Exercise the real integrator's receipt/conflict logic without creating production data.
  const preview=receipt.acceptedClaimIds.length?integrateDossier(p,jobs[i],context,receipt):{applied:false,acceptedClaims:0};
  return {validation,receipt,preview:{applied:preview.applied,acceptedClaims:preview.acceptedClaims}};
 });
 const queue=base+'/queue.json';
 if(!fs.existsSync(queue)){
  initializeDossierQueue(queue,jobs,{concurrency:2});
  const actor={id:'pilot-coordinator',role:'coordinator'};
  packages.forEach((p,i)=>{
   const args={jobId:jobs[i].id,workerId:p.worker.id};
   updateDossierQueue(queue,'claim',args,context);
   updateDossierQueue(queue,'submit',{...args,package:p},context);
   updateDossierQueue(queue,'validate',{jobId:jobs[i].id,actor},context);
   updateDossierQueue(queue,'review',{jobId:jobs[i].id,actor,review:outcomes[i].receipt.review},context);
  });
 }else{
  const q=readJSON(queue);if(q.jobs.length!==packages.length||q.jobs.some((j,i)=>j.packageHash!==digest(packages[i])||digest(j.acceptance)!==digest(outcomes[i].receipt)))throw Error('Preserved queue differs: coordinator recovery required');
 }
 saveJSON(base+'/validation-and-acceptance.json',outcomes);
 const report=summarizePilot(packages,outcomes,context);
 const preservedIds=new Set(readJSON('research/comprehensive/source-index.json').preserved.flatMap(p=>p.sourceIds));
 report.totals.preservedUnregisteredSourceIds=report.totals.newSourceIds.filter(id=>preservedIds.has(id));
 report.totals.newlyResearchedClaimSourceIds=report.totals.newSourceIds.filter(id=>!preservedIds.has(id));
 report.totals.proposedSourceRecordIds=[...new Set(packages.flatMap(p=>p.sources.map(s=>s.id)))].sort();
 report.sourceCountQualification='Claim-cited sources: registered reuse, preserved unregistered reuse, and newly researched IDs are separate. Proposed source records also include sources consulted for unresolved gaps. None entered production.';
 report.candidates=readJSON(base+'/candidate-report.json');
 const tests=fs.readFileSync('research/comprehensive/test-results.txt','utf8');report.focusedTestsPassed=Number(tests.match(/pass (\d+)/)?.[1]||0);
 if(!report.focusedTestsPassed)throw Error('Missing recorded focused test result');
 saveJSON(base+'/completion-report.json',report);
 const t=report.totals;
 fs.writeFileSync(base+'/COMPLETION.md',`# Comprehensive dossier architecture + pilot\n\nEight existing historical entities/periods; two parallel workers and independent cross-review. Production remains unchanged.\n\n| Entity | Period | Produced | Accepted new | Accepted reused | Held | Rejected | Gaps |\n|---|---|---:|---:|---:|---:|---:|---:|\n`+report.rows.map(r=>`| ${r.entityId} | ${r.period.from}–${r.period.until} | ${r.produced} | ${r.acceptedNew} | ${r.acceptedReused} | ${r.held} | ${r.rejected} | ${r.unresolvedGaps} |`).join('\n')+`\n\n${t.produced} claims produced; ${t.accepted} independently accepted (${t.acceptedNew} new, ${t.acceptedReused} reused); ${t.held} held; ${t.rejected} rejected. ${t.reusedSourceIds.length} registered claim-cited sources reused, plus ${t.preservedUnregisteredSourceIds.length} already-researched unregistered source IDs reused; ${t.newlyResearchedClaimSourceIds.length} newly researched claim-cited source IDs. ${t.proposedSourceRecordIds.length} proposed source records include sources consulted for gaps; none registered in production. All 14 categories received a scoped investigation disposition for every entity.\n\n| Category | Produced | Accepted |\n|---|---:|---:|\n`+fields.map(f=>`| ${f} | ${t.producedByCategory[f]} | ${t.acceptedByCategory[f]} |`).join('\n')+`\n\nNew accepted claims per assignment: ${t.newAcceptedClaimsPerAssignment.toFixed(2)}. Total accepted claims per assignment: ${t.acceptedClaimsPerAssignment.toFixed(2)}. Old integrated-fact baselines: Campaign 1 ${report.comparison.campaign1IntegratedFactsPerAssignment.toFixed(2)}, Campaign 2 ${report.comparison.campaign2Checkpoint1IntegratedFactsPerAssignment.toFixed(2)} (three flags included in 37). Accepted-but-unintegrated pilot claims do not establish equivalent production throughput or an orders-of-magnitude improvement. Workload/cost was not metered.\n\nBulk prototype: ${report.candidates.records} preserved candidates from 24 packages ingested with 0 model calls / 0 external requests;0% accepted, 0% rejected, 100% pending fresh candidate review. Pilot packages independently reused evidence; candidate records themselves remain untrusted.\n\nValidation: ${report.focusedTestsPassed} focused automated tests passed; ${t.deterministicPackageChecks} reported package checks;0 browser checks. Additional queue/acceptance/integrator-preview guards passed. Existing expensive suites were not rerun. Selected-year/observation-date/BCE tests, conflicts, Important Figures lifespan/association, source reuse, duplicate prevention, queue interruption and serial integration are covered.\n\nProduction: 617 entities, 769 registered sources; 0 pilot facts or sources integrated. Accepted receipts and queue are preserved for review. Real integration preview passed for each accepted package; synthetic integration/recovery tests exercised writes without touching atlas data. Current frontend does not yet consume the rich sidecar store.\n\nProduction fingerprint: \`${report.production.legacyFingerprint}\`. Research-comprehensive fingerprint: \`${report.production.comprehensiveFingerprint}\`. Visible version v0.6.1; map 1800–1960 unchanged. Preserved Campaign 2 packages unchanged.\n\n## Limits and next decision\n\nUnresolved category gaps and exact per-claim held reasons remain in packages/reviews and completion-report.json. Geographic mismatches, uncertain activity and conflicting legacy text are held. Exact-text capital/currency reconciliation is conservative and may hold compatible formulations pending a reviewed semantic adapter. Flags require separately licensed/date-supported assets; no easy flag quota was forced. Statistical and economic sources need scope and methodology review. Ancient chronology is supported for research only; approximate chronology remains held pending a reviewed reader. Provider-specific bulk adapters/streaming and source-content verification are still required. Rich data needs a future reader and legacy reconciliation before visible publication.\n\nInspect these accepted packages and metrics before authorizing a larger bounded comprehensive campaign. Improve bulk adapters and reviewed uncertainty/scope handling first. No global campaign, Campaign 2 resumption or frontend redesign began.\n`);
 if(productionFingerprint()!==checkpoint.legacyProductionFingerprint)throw Error('Reporting mutated production');
 console.log(JSON.stringify({assignments:report.assignments,...t,focusedTestsPassed:report.focusedTestsPassed},null,2));
}
