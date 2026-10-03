// Offline accounting audit. No acquisition, claim integration or runtime imports.
import fs from 'node:fs';
import path from 'node:path';
import {readJSON,saveJSON,digest,readContext,isCLI,productionFingerprint} from './research-common.mjs';
import {completionCategories,validateResolutions} from './research-completion.mjs';
import {temporalBounds} from './research-comprehensive.mjs';
import {fullYear} from './research-snapshot-scan.mjs';

export const applicabilityPolicy={
 identity:{group:'core',question:'Historical identity at the snapshot',rule:'Political identity is relevant; absent or ambiguous identity stays open.'},
 'political-institutional':{group:'core',question:'Historically appropriate political framework',rule:'Do not require modern constitutional offices or institutions.'},
 leadership:{group:'core',question:'Historically appropriate leadership or governing arrangement',rule:'A council, administrator or other arrangement may apply; absence of a president is not N/A.'},
 capital:{group:'core',question:'Capital, seat or historically appropriate governing location',rule:'No permanent single capital requires evidence; missing capital does not establish N/A.'},
 currency:{group:'reference',question:'Applicable monetary units or system',rule:'Multiple units or nonmodern monetary arrangements are possible; no modern fallback.'},
 'historical-flag':{group:'conditional',question:'Historically used flag or symbol',rule:'A polity need not have a modern national flag; absence/non-applicability requires evidence.'},
 'population-statistics':{group:'reference',question:'Dated compatible population observation',rule:'No surviving census is different from no research; scope/date must be explicit.'},
 'area-statistics':{group:'reference',question:'Qualified historical or mapped territory area',rule:'Mapped area is derived geometry, not an official historical statistic.'},
 density:{group:'derived',question:'Density from mutually compatible population and area',rule:'Uncertified inputs block derivation; they do not establish historical N/A.'},
 economy:{group:'enrichment',question:'Historically defensible broader economic evidence',rule:'Not every polity has comparable GDP; missing series is not proven unavailability.'},
 'events-context':{group:'enrichment',question:'Significant entity-relevant dated events',rule:'No recorded major event is not proof that none occurred. Enrichment is separate from core coverage.'},
 relationships:{group:'conditional',question:'Directly evidenced political relationships',rule:'Do not assume modern predecessor/successor patterns or infer them from geometry.'},
 overview:{group:'derived',question:'Snapshot-relevant synthesis of accepted evidence',rule:'No independent new historical assertions. Existing evidence presence is not exhaustive narrative completeness.'},
 'important-figures':{group:'enrichment',question:'Significant people with dated historical association',rule:'No required quota, modern nationality inference or leadership-to-significance shortcut.'},
 'historical-context-status':{group:'conditional',question:'Sourced historical status/qualifications',rule:'Ordinary sourced status is eligible; lack of exceptional circumstances is not automatic N/A.'}
};
const openStates=new Set(['missing','partial','held']);
const states=['supported','partial','missing','held','uncertain','known-unavailable','not-applicable','territorially-incompatible'];
const pct=(n,d)=>d?100*n/d:0;
function summary(rows){
 const counts=Object.fromEntries(states.map(s=>[s,rows.filter(r=>r.status===s).length]));
 const total=rows.length,na=counts['not-applicable'],applicable=total-na,resolved=total-counts.missing-counts.partial-counts.held;
 return{total,states:counts,rawSupported:counts.supported,rawUnresolved:counts.missing+counts.partial+counts.held,rawEvidenceCoverage:pct(counts.supported,total),applicableDenominator:applicable,supportedApplicableEvidence:counts.supported,applicableEvidenceCoverage:pct(counts.supported,applicable),resolvedSlots:resolved,researchResolution:pct(resolved,total),legitimateNonApplicable:na,documentedUnavailable:counts['known-unavailable'],documentedUncertain:counts.uncertain,documentedCategoryIncompatible:counts['territorially-incompatible'],missingWithoutRecordedInvestigation:rows.filter(r=>r.status==='missing'&&!r.recordedInvestigation).length,missingWithRecordedInvestigation:rows.filter(r=>r.status==='missing'&&r.recordedInvestigation).length};
}
export function auditApplicability(matrix,{rich={packages:[]},resolutions=[],context}={}){
 if(Object.keys(applicabilityPolicy).length!==15||completionCategories.some(c=>!applicabilityPolicy[c]))throw Error('All 15 categories must have policy');
 if(matrix.errors?.some(e=>!e.reason?.includes('temporal')))throw Error('Unexpected scanner integrity error');
 if(context)validateResolutions(resolutions,context,matrix.rows,rich);
 const packages=new Map();for(const p of rich.packages){const list=packages.get(p.entityId)||[];list.push(p);packages.set(p.entityId,list);}
 const slots=[],keys=new Set();
 for(const r of matrix.rows){
  if(Object.keys(r.categories).length!==15)throw Error('Dossier does not have 15 categories');
  for(const category of completionCategories){
   const cell=r.categories[category],key=r.entityId+'|'+r.snapshotYear+'|'+category;if(keys.has(key))throw Error('Duplicate dossier/category');keys.add(key);
   if(!states.includes(cell.status))throw Error('Unrecognized state');
   if(['not-applicable','uncertain','known-unavailable','territorially-incompatible'].includes(cell.status)){
    const resolution=resolutions.find(e=>e.id===cell.resolutionId&&e.entityId===r.entityId&&e.category===category&&e.status===cell.status);
    if(!context||!resolution||!fullYear({temporal:{...resolution.period,kind:'interval'}},r.snapshotYear))throw Error('Resolution state needs independently validated whole-snapshot evidence ledger, not empty-field inference');
   }
   const relevant=(packages.get(r.entityId)||[]).filter(p=>{try{const a=temporalBounds({...p.period,kind:'interval'}),b=temporalBounds({kind:'observation',observationDate:String(r.snapshotYear)});return a.lo<b.hi&&a.hi>b.lo;}catch{return false;}});
   const consulted=relevant.filter(p=>p.investigation?.some(i=>i.category===category&&i.consultedSourceIds?.length));
   slots.push({entityId:r.entityId,name:r.name,snapshotYear:r.snapshotYear,category,group:applicabilityPolicy[category].group,status:cell.status,applicability:cell.status==='not-applicable'?'evidence-established-non-applicable':cell.status==='supported'?'evidence-present':'assessment-pending; retained in denominator',recordedInvestigation:consulted.length>0,investigationPackageIds:consulted.map(p=>p.id),recordIds:cell.records||[],resolutionId:cell.resolutionId,issues:cell.issues||[],mappingPartial:!!r.mappingPartial,mapIds:r.mapIds});
  }
 }
 const totals=summary(slots),core=summary(slots.filter(s=>s.group==='core'));
 const extended=summary(slots.filter(s=>['core','reference'].includes(s.group)));
 return{schemaVersion:1,productionFingerprint:matrix.productionFingerprint,inputMatrixHash:digest(matrix),policy:applicabilityPolicy,methodology:{denominator:'Raw15 slots minus individually evidence-established N/A only. Unassessed applicability remains provisionally included; this is an accountable denominator, not proof all concepts existed.',support:'Existing scanner category support is evidence presence, not exhaustive subfield completeness. Partial remains separate, no subjective fractional score.',resolution:'Supported plus independently established uncertainty, unavailability, N/A and whole-category territorial incompatibility. Held, partial and missing remain unresolved.',unresearched:'Missing without a recorded category-specific source consultation in an overlapping package is an operational proxy; off-repository/legacy research history is not knowable. Recorded consultation is not exhaustive research.',core:'Existing four-category core: identity, political framework, leadership, capital. Extended reference view also includes currency, population and area.',enrichment:'Major Events and Important Figures are separately reported; their gaps are not counted as missing core facts. They remain in the raw15 comparison, not fabricated N/A.',sources:'Sources/Methodology is a presentation/provenance section, not an additional sixteenth research category.'},totals,core:{...core,genuinelyMissingCoreSlots:core.states.missing,otherUnresolvedCoreSlots:core.states.partial+core.states.held},extendedReference:extended,byCategory:Object.fromEntries(completionCategories.map(c=>[c,{...applicabilityPolicy[c],...summary(slots.filter(s=>s.category===c))}])),bySnapshot:Object.fromEntries([...new Set(slots.map(s=>s.snapshotYear))].sort((a,b)=>a-b).map(y=>[y,summary(slots.filter(s=>s.snapshotYear===y))])),enrichment:Object.fromEntries(['events-context','important-figures'].map(c=>[c,summary(slots.filter(s=>s.category===c))])),unresolvedRawIdentityOccurrences:matrix.unresolvedRawIdentities?.length||0,scannerErrors:matrix.errors||[],slots};
}
export function regionalAudit(report,definitions){
 const batches=definitions.map(d=>{
  const ids=new Set(d.rawMapIdentities),slots=report.slots.filter(s=>s.mapIds.some(id=>ids.has(id))),open=slots.filter(s=>openStates.has(s.status));
  const dossiers=new Set(slots.map(s=>s.entityId+'|'+s.snapshotYear)),core=open.filter(s=>s.group==='core'),straightforward=core.filter(s=>s.status==='missing'&&!s.mappingPartial);
  const sourcePacketGroups=new Set(straightforward.map(s=>s.entityId));
  return{batch:d.batch,title:d.title,dossiers:dossiers.size,...summary(slots),missingCore:core.filter(s=>s.status==='missing').length,unresolvedCore:core.length,nonTransitionMissingCore:straightforward.length,entityGroupsForCoreResearch:sourcePacketGroups.size,coreSlotPerEntityGroup:sourcePacketGroups.size?straightforward.length/sourcePacketGroups.size:0,needs:open.map(({entityId,name,snapshotYear,category,group,status,mappingPartial})=>({entityId,name,snapshotYear,category,group,status,mappingPartial}))};
 }).sort((a,b)=>b.nonTransitionMissingCore-a.nonTransitionMissingCore||b.coreSlotPerEntityGroup-a.coreSlotPerEntityGroup||b.rawUnresolved-a.rawUnresolved||a.batch.localeCompare(b.batch));
 const membership=new Map();for(const b of batches)for(const s of b.needs){const k=s.entityId+'|'+s.snapshotYear;membership.set(k,new Set([...(membership.get(k)||[]),b.batch]));}
 return{rankingPolicy:'Nontransition fully missing core slots first; cross-snapshot core slots per entity research group next; unresolved total breaks ties. This is a workload/efficiency proxy, not a measured safe acquisition yield or credit estimate.',batches,overlappingDossiers:[...membership].filter(([,b])=>b.size>1).map(([dossier,b])=>({dossier,batches:[...b]})),warning:'Regional cohorts overlap; never sum regional totals as global total. Held/partial and enrichment remain separate from straightforward missing core opportunities.'};
}
export function writeAudit(report,ranking,directory){
 saveJSON(path.join(directory,'applicability.json'),report);saveJSON(path.join(directory,'regional-workload.json'),ranking);
 const t=report.totals,lines=['# Fifteen-category applicability audit','',`Raw theoretical slots: **${t.total}**; supported **${t.rawSupported}**; unresolved **${t.rawUnresolved}**.`,`Raw Evidence Coverage: **${t.rawEvidenceCoverage.toFixed(2)}%**.`,`Applicable denominator: **${t.applicableDenominator}**; supported applicable evidence: **${t.supportedApplicableEvidence}**; Applicable Evidence Coverage: **${t.applicableEvidenceCoverage.toFixed(2)}%**.`,`Research Resolution: **${t.researchResolution.toFixed(2)}%**.`,`Evidence-established N/A: ${t.legitimateNonApplicable}; unavailable: ${t.documentedUnavailable}; uncertain: ${t.documentedUncertain}; whole-category incompatible: ${t.documentedCategoryIncompatible}.`,`Missing without recorded category investigation: ${t.missingWithoutRecordedInvestigation}; missing with recorded investigation: ${t.missingWithRecordedInvestigation}. These are registry-history proxies, not proof that no research ever occurred.`,`Core: ${report.core.genuinelyMissingCoreSlots} fully missing; ${report.core.states.partial} partial; ${report.core.states.held} held; ${report.core.rawUnresolved} unresolved of ${report.core.total}. Extended core/reference unresolved: ${report.extendedReference.rawUnresolved} of ${report.extendedReference.total}.`,'','No denominator reduction is justified merely by missing evidence, conditional applicability, blocked derivation or an optional enrichment category. Unassessed applicability remains visible. This audit establishes the recorded workload; it cannot prove historical non-applicability without new evidence.','', '| Category | Role | Supported | Partial | Held | Missing | N/A | Applicable evidence % |','| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |'];
 for(const[c,v]of Object.entries(report.byCategory))lines.push(`| ${c} | ${v.group} | ${v.states.supported} | ${v.states.partial} | ${v.states.held} | ${v.states.missing} | ${v.legitimateNonApplicable} | ${v.applicableEvidenceCoverage.toFixed(2)} |`);
 lines.push('','## Corrected regional priority','',ranking.rankingPolicy,'','| Rank | Batch | Region | Missing core | Nontransition missing core | Unresolved total |','| ---: | --- | --- | ---: | ---: | ---: |');ranking.batches.forEach((b,i)=>lines.push(`| ${i+1} | ${b.batch} | ${b.title} | ${b.missingCore} | ${b.nonTransitionMissingCore} | ${b.rawUnresolved} |`));
 lines.push('',ranking.warning,'','The former 15-category comparison remains unchanged. Core categorisation changes workload priority, not historical facts or raw completion. Major Events and Important Figures remain enrichment measurements rather than universal mandatory quotas. No production changes, source acquisition or frontend/browser work occurred.');
 fs.writeFileSync(path.join(directory,'REPORT.md'),lines.join('\n')+'\n');
}
if(isCLI(import.meta.url)){
 const output=process.argv[2]||'research/applicability-01',context=readContext(),before=productionFingerprint(),matrix=readJSON('research/completion-01/reports/completion.json');if(matrix.productionFingerprint!==context.productionFingerprint)throw Error('Stale completion matrix');
 const rich=readJSON('data/comprehensive-dossiers.json'),resolutions=fs.existsSync('research/completion/resolutions.json')?readJSON('research/completion/resolutions.json'):[];
 const report=auditApplicability(matrix,{rich,resolutions,context}),definitions=Array.from({length:21},(_,i)=>{const batch=String(i+1).padStart(2,'0');return{batch,title:fs.readFileSync(`development/coverage/BATCH-${batch}.md`,'utf8').split('\n')[0].replace(/^#\s*/,'').trim(),...readJSON(`development/coverage/research-batch-${batch}.json`)};});
 const ranking=regionalAudit(report,definitions);writeAudit(report,ranking,output);if(productionFingerprint()!==before)throw Error('Audit mutated production');console.log(JSON.stringify({totals:report.totals,core:report.core,ranking:ranking.batches.map(b=>({batch:b.batch,missingCore:b.missingCore,nonTransitionMissingCore:b.nonTransitionMissingCore}))}));
}
