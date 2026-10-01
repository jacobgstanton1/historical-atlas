import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {scan} from './research-scan.mjs';
import {readContext} from './research-common.mjs';

export function buildReport(result,queue={jobs:[]}){
  const groups={};for(const g of result.gaps){const row=groups[g.category]||={gaps:0,entityIds:new Set(),mapIds:new Set(),sourceWeaknessGaps:0,nearbyObservationGaps:0};row.gaps++;if(g.entityId)row.entityIds.add(g.entityId);g.mapIds.forEach(id=>row.mapIds.add(id));if(/weak source/.test(g.reason))row.sourceWeaknessGaps++;if(g.cautions.some(c=>c.startsWith('Nearby observations')))row.nearbyObservationGaps++;}
  const statuses=Object.fromEntries(['queued','researching','submitted','validation-failed','historical-review','awaiting-review','accepted','rejected','integrated'].map(s=>[s,0]));for(const j of queue.jobs||[])statuses[j.status]=(statuses[j.status]||0)+1;
  const researchEvidence={submittedPackages:0,acceptedPackages:0,acceptedClaimsByCategory:{},reviewClaimsByCategory:{}};
  for(const j of queue.jobs||[])if(j.package){researchEvidence.submittedPackages++;if(j.status==='accepted')researchEvidence.acceptedPackages++;
    const counts=j.status==='accepted'?researchEvidence.acceptedClaimsByCategory:j.status==='historical-review'?researchEvidence.reviewClaimsByCategory:null;
    if(counts)for(const c of j.package.claims)counts[c.category]=(counts[c.category]||0)+1;}
  return{schemaVersion:1,productionFingerprint:result.productionFingerprint,range:result.range,metrics:structuredClone(result.metrics),
    categories:Object.fromEntries(Object.keys(groups).sort().map(k=>[k,{...groups[k],entityIds:[...groups[k].entityIds].sort(),mapIds:[...groups[k].mapIds].sort()}])),
    queue:{jobs:(queue.jobs||[]).length,statuses,staleJobs:(queue.jobs||[]).filter(j=>j.productionFingerprint!==result.productionFingerprint).map(j=>j.id)},researchEvidence,
    qualifications:['Gap counts are category/year research opportunities, not distinct states or missing required annual censuses.','The political denominator counts distinct provisionally eligible raw map IDs; unresolved classifications and mapping reviews are separate fields.','Statistics require explicit observed-year evidence for coverage; nearby dated evidence does not fill a year and is not interpolated.','Field coverage measures source-backed category/year records, not historical truth or exhaustive institutions; contextual events and figures need relevant evidence, not a complete annual census.','Source quality flags concern missing/broken provenance and explicitly uncertain confidence, not automatic institutional ranking.','Editorial existence envelopes and shared map geometry do not establish historical lifetime, sovereignty or succession.','Queued, researched and accepted production coverage are separate states; job completion does not itself change production.']};
}
export function renderReport(report){
  const lines=['# Historical Atlas research gap report','',`Range: ${report.range.from}–${report.range.until}. Production fingerprint: ${report.productionFingerprint}.`,'',`Entities scanned: ${report.metrics.entitiesScanned}; entity/year pairs: ${report.metrics.entityYearsScanned}; category/year gaps: ${report.metrics.totalGaps}.`,'',`Political raw denominator: ${report.metrics.politicalDenominator}; unresolved classifications: ${report.metrics.unresolvedClassifications}; mapping-review identities: ${report.metrics.mappingReviewIdentities}.`,'','| Category | Gaps | Distinct entities | Distinct raw IDs | Weak evidence gaps |','| --- | ---: | ---: | ---: | ---: |'];
  for(const[k,row]of Object.entries(report.categories))lines.push(`| ${k} | ${row.gaps} | ${row.entityIds.length} | ${row.mapIds.length} | ${row.sourceWeaknessGaps} |`);
  const available=report.metrics.resolverAvailability;
  lines.push('','## Resolver availability and field coverage','',`Resolver availability: ${available?.covered??'unavailable'}/${available?.candidates??report.metrics.politicalDenominator} eligible raw IDs. Political candidates investigated: ${report.metrics.politicalCandidatesInvestigated??'unavailable'}. Transition-year research gaps: ${report.metrics.transitionYearGaps??'unavailable'}.`,'','| Field category | Eligible entity/years | Supported | Partial | Observed | Missing |','| --- | ---: | ---: | ---: | ---: | ---: |');
  for(const[k,c]of Object.entries(report.metrics.fieldCoverage||{}).sort())lines.push(`| ${k} | ${c.entityYearsEligible} | ${c.fullySupportedYears} | ${c.partialYears} | ${c.observationYears} | ${c.missingYears} |`);
  const f=report.metrics.flagCoverage;if(f)lines.push('','## Historical flag/symbol coverage','',`Eligible entities: ${f.distinctEntitiesEligible}; entities with fully supported years: ${f.distinctEntitiesSupported}; partial/qualified years: ${f.partialYears}; historical-review years: ${f.historicalReviewYears||0}; missing years: ${f.missingYears}. Entity sets overlap across different requested years. Civil/colonial/office/royal types remain explicitly qualified; an undated asset never establishes lifetime coverage.`);
  lines.push('','## Queue','',`Jobs: ${report.queue.jobs}; stale fingerprints: ${report.queue.staleJobs.length}.`,...Object.entries(report.queue.statuses).sort().map(([s,n])=>`- ${s}: ${n}`),'',`Submitted research packages: ${report.researchEvidence.submittedPackages}; accepted outside production: ${report.researchEvidence.acceptedPackages}.`,'',...Object.entries(report.researchEvidence.acceptedClaimsByCategory).sort().map(([c,n])=>`- Accepted research claims (${c}): ${n}`),'','Accepted research is separate from production field coverage.','', '## Interpretation','',...report.qualifications.map(x=>'- '+x),'');return lines.join('\n');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const root=path.resolve(fileURLToPath(new URL('../',import.meta.url))),dir=path.join(root,'research/reports'),result=scan(readContext(root));
  const args=process.argv.slice(2);if(args.length&&!(args.length===2&&args[0]==='--queue'&&args[1]))throw Error('Usage: research-report.mjs [--queue queue.json]');
  const explicit=args[1]||null;
  const queuePath=explicit||['research/jobs/queue.json','research/pilot/queue.json'].map(p=>path.join(root,p)).find(p=>fs.existsSync(p));
  const queue=queuePath?JSON.parse(fs.readFileSync(queuePath,'utf8')):{jobs:[]};
  const report=buildReport(result,queue);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'research-report.json'),JSON.stringify(report,null,2)+'\n');fs.writeFileSync(path.join(dir,'research-report.md'),renderReport(report));console.log(JSON.stringify({gaps:report.metrics.totalGaps,categories:Object.keys(report.categories).length,jobs:report.queue.jobs}));
}
