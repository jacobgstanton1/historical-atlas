import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {readJSON,readContext,saveJSON,root,isCLI} from './research-common.mjs';
import {fields,fingerprint} from './research-comprehensive.mjs';
export function summarizeScale(store,baseline,registry){
 const claims=store.packages.flatMap(p=>p.claims),oldIds=new Set(baseline.packages.flatMap(p=>p.claims.map(c=>c.id))),added=claims.filter(c=>!oldIds.has(c.id));
 const countBy=(rows,key)=>Object.fromEntries([...new Set(rows.map(key))].sort().map(k=>[k,rows.filter(r=>key(r)===k).length]));
 const sources=new Map([...registry.sources,...store.packages.flatMap(p=>p.sources)].map(s=>[s.id,s])),oldSources=new Set([...registry.sources,...baseline.packages.flatMap(p=>p.sources)].map(s=>s.id));
 const dossierPackages=store.packages.filter(p=>!p.id.startsWith('scale-nobel-')&&!p.id.startsWith('scale-flag-'));
 const held=new Set(),rejected=new Set(),duplicates=new Set();
 for(const p of store.packages){const review=p.acceptance?.review,original=review?.originalIndependentReview||review;if(!original)continue;
  for(const [id,status]of Object.entries(original.decisions||{})){if(status==='held')held.add(id);if(status==='rejected')rejected.add(id);}
  for(const [id,status]of Object.entries(review.decisions||{}))if(status==='held'&&original.decisions?.[id]==='accepted')duplicates.add(id);
 }
 const categoryCounts=Object.fromEntries(fields.map(category=>[category,claims.filter(c=>c.category===category).length]));
 return {baselineCommit:'04f3ae69edc1406016ce5a5caf4f9ca31f5ba155',baselineClaims:oldIds.size,
  totalClaimsAddedAcrossScalePhase:claims.length,claimsAddedSince60ClaimCheckpoint:added.length,
  entitiesEnriched:new Set(claims.map(c=>c.entityId)).size,comprehensiveDossierResearchPasses:dossierPackages.length,
  comprehensiveDossierEntities:new Set(dossierPackages.map(p=>p.entityId)).size,
  qualification:'Comprehensive research passes are separate from lighter flag/bulk enrichment; category support does not prove exhaustive dossier completeness.',
  claimsByCategory:categoryCounts,originsAcrossPhase:countBy(claims,c=>c.origin.kind),originsSince60ClaimCheckpoint:countBy(added,c=>c.origin.kind),
  flags:{claims:categoryCounts['historical-flag'],licensedAssets:new Set(claims.filter(c=>c.flag).map(c=>c.flag.asset)).size},
  importantFigureClaims:categoryCounts['important-figures'],distinctImportantPeople:new Set(claims.filter(c=>c.figure).map(c=>c.figure.personId)).size,
  statistics:{population:categoryCounts['population-statistics'],area:categoryCounts['area-statistics'],density:categoryCounts.density,economy:categoryCounts.economy},
  events:categoryCounts['events-context'],relationships:categoryCounts.relationships,
  sources:{registered:sources.size,newSince60ClaimCheckpoint:[...sources.keys()].filter(id=>!oldSources.has(id)).length,newSinceLegacyRegistry:[...sources.keys()].filter(id=>!registry.sources.some(s=>s.id===id)).length,reusedBaselineSourcesCitedByAddedClaims:new Set(added.flatMap(c=>c.sourceIds).filter(id=>oldSources.has(id))).size},
  dispositions:{heldHistoricalClaims:held.size,rejectedHistoricalClaims:rejected.size,duplicatePublicationExclusions:duplicates.size},
  averagePublishedClaimsPerEnrichedEntity:claims.length/new Set(claims.map(c=>c.entityId)).size,
  averagePublishedClaimsPerComprehensivePass:dossierPackages.flatMap(p=>p.claims).length/dossierPackages.length,
  modelResearchCalls:'Not reliably metered; no claims-per-call or credits-efficiency figure invented.'};
}
if(isCLI(import.meta.url)){
 const context=readContext(),store=readJSON(path.join(root,'data/comprehensive-dossiers.json'));
 const baseline=JSON.parse(execFileSync('git',['show','04f3ae69edc1406016ce5a5caf4f9ca31f5ba155:data/comprehensive-dossiers.json'],{cwd:root,encoding:'utf8'}));
 const result={...summarizeScale(store,baseline,context.registry),productionFingerprint:fingerprint(),snapshotCoverage:readJSON(path.join(root,'research/reports/research-report.json')).metrics,productionAudit:readJSON(path.join(root,'research/scale-01/production-audit.json'))};
 const acquisition=path.join(root,'research/scale-01/nobel/acquisition.json');if(fs.existsSync(acquisition)){const a=readJSON(acquisition);result.bulkNobel={acceptedProductionClaims:store.packages.filter(p=>p.id.startsWith('scale-nobel-')).flatMap(p=>p.claims).length,heldAcquisitionRecords:a.held?.length??null,qualification:'Award-year historical affiliations, not modern nationality. Held acquisition records are separate from held package claims.'};}
 saveJSON(path.join(root,'research/scale-01/progress.json'),result);console.log(JSON.stringify({claims:result.totalClaimsAddedAcrossScalePhase,added:result.claimsAddedSince60ClaimCheckpoint,entities:result.entitiesEnriched,dossierPasses:result.comprehensiveDossierResearchPasses}));
}
