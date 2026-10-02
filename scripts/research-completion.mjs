// Internal completion accounting only. Never imported by the atlas runtime.
import fs from 'node:fs';
import path from 'node:path';
import {scanSnapshots} from './research-snapshot-scan.mjs';
import {fields} from './research-comprehensive.mjs';
import {readContext,readJSON,saveJSON,digest,dateRange,isCLI} from './research-common.mjs';
export const completionCategories=[...fields,'historical-context-status'];
export const resolutionStates=['uncertain','known-unavailable','not-applicable','territorially-incompatible'];
const resolved=new Set(['supported',...resolutionStates]);
const core=['identity','political-institutional','leadership','capital'];
const priorities={identity:100,'political-institutional':95,leadership:90,capital:85,'population-statistics':80,'area-statistics':75,density:70,currency:65,economy:60,'events-context':55,relationships:50,'important-figures':45,overview:40,'historical-context-status':35,'historical-flag':83};
export function validateResolutions(entries,context,rows,rich=readJSON(path.join(context.directory,'data/comprehensive-dossiers.json'))){
 const sources=new Set([...context.registry.sources,...rich.packages.flatMap(p=>p.sources||[])].filter(s=>s.title&&s.institution&&/^https?:\/\//.test(s.url)).map(s=>s.id)),seen=new Set();
 for(const r of entries){
  if(!r.id||seen.has(r.id))throw Error('Duplicate/missing resolution ID');seen.add(r.id);
  if(!resolutionStates.includes(r.status)||!completionCategories.includes(r.category))throw Error('Invalid resolution state/category');
  if(!context.db.entities.some(e=>e.id===r.entityId))throw Error('Unknown resolution entity');
  const from=dateRange(r.period?.from),until=dateRange(r.period?.until);if(from[0]>=until[0])throw Error('Invalid resolution interval');
  if(!r.rationale?.trim()||!r.evidenceNote?.trim()||!r.scope?.trim()||!r.sourceIds?.length||r.sourceIds.some(id=>!sources.has(id)))throw Error('Resolution lacks evidence/scope/provenance');
  if(!r.review?.reviewer||!r.worker||r.review.reviewer===r.worker||r.review.decision!=='accepted'||r.review.contentHash!==digest(Object.fromEntries(Object.entries(r).filter(([k])=>k!=='review'))))throw Error('Independent resolution review required');
  if(r.status==='territorially-incompatible'&&r.assessmentScope!=='category-question-resolved')throw Error('One incompatible candidate does not resolve the category');
  if(!rows.some(row=>row.entityId===r.entityId))throw Error('Resolution has no represented dossier');
 }
 for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++){const a=entries[i],b=entries[j];if(a.entityId===b.entityId&&a.category===b.category&&dateRange(a.period.from)[0]<dateRange(b.period.until)[0]&&dateRange(b.period.from)[0]<dateRange(a.period.until)[0])throw Error('Overlapping resolution assessments');}
 return true;
}
function summarize(rows){
 const states=Object.fromEntries(['supported','partial','missing','held',...resolutionStates].map(s=>[s,0]));
 let criticallySparse=0,completelyUnresolved=0,coreSupported=0;
 for(const r of rows){let supported=0,resolution=0;for(const slot of Object.values(r.categories)){states[slot.status]++;supported+=slot.status==='supported';resolution+=resolved.has(slot.status);}if(supported<3)criticallySparse++;if(!resolution)completelyUnresolved++;if(core.every(c=>r.categories[c].status==='supported'))coreSupported++;}
 const total=rows.length*completionCategories.length,applicable=total-states['not-applicable'];
 return{dossiers:rows.length,totalSlots:total,applicableSlots:applicable,states,evidenceCoverage:applicable?100*states.supported/applicable:0,researchResolution:total?100*(states.supported+resolutionStates.reduce((n,s)=>n+states[s],0))/total:0,criticallySparse,completelyUnresolved,coreSupported};
}
export function completionMatrix(context,{scan=scanSnapshots(context),resolutions=[],held=[],rich=readJSON(path.join(context.directory,'data/comprehensive-dossiers.json'))}={}){
 if(scan.configurationWarnings.length)throw Error('Scanner configuration warnings must be resolved before reporting completion');
 validateResolutions(resolutions,context,scan.rows,rich);
 const entities=new Map(context.db.entities.map(e=>[e.id,e]));
 const statusIds=new Set();
 for(const e of context.db.entities)for(const r of e.politicalStatus||[]){const temporal=r.asOf||r.observationDate?{kind:'observation',observationDate:r.asOf||r.observationDate}:r.date?{kind:'event',date:r.date}:{kind:'interval',from:r.validFrom||r.from,until:r.validUntil||r.until};statusIds.add('legacy-'+digest({entityId:e.id,category:'political-institutional',value:r.value??r.text??r.name??r.asset,temporal,role:r.role,metric:r.metric}));}
 for(const p of rich.packages)for(const c of p.claims||[])if(c.category==='political-institutional'&&['political-status','historical-status','occupation-status','recognition-status'].includes(c.metric))statusIds.add(c.id);
 const rows=scan.rows.map(row=>{
  const categories=Object.fromEntries(Object.entries(row.categories).map(([c,s])=>[c,{...s,status:s.status==='historical-review'?'held':s.status}]));
  const political=categories['political-institutional'],records=political.records.filter(r=>statusIds.has(r.claimId));
  categories['historical-context-status']={status:records.length?(political.status==='supported'?'supported':political.status==='partial'?'partial':'held'):'missing',records,issues:records.length?political.issues:[]};
  for(const category of completionCategories){const slot=categories[category],assessments=resolutions.filter(r=>r.entityId===row.entityId&&r.category===category&&(r.period.from.length===10?dateRange(r.period.from)[0]:dateRange(r.period.from)[1])<=Date.UTC(row.snapshotYear,0,1)&&dateRange(r.period.until)[0]>=Date.UTC(row.snapshotYear+1,0,1));
   if(assessments.length){if(slot.records.length)throw Error('Resolution would overwrite sourced facts');slot.status=assessments[0].status;slot.resolutionId=assessments[0].id;}
   const candidates=held.filter(h=>h.entityId===row.entityId&&h.category===category&&h.snapshotYears?.includes(row.snapshotYear));
   if(candidates.length){if(candidates.some(h=>!h.id||!h.reason||!h.evidencePath))throw Error('Held evidence lacks provenance');slot.heldEvidenceIds=candidates.map(h=>h.id);if(slot.status==='missing')slot.status='held';}
  }
  const supported=Object.values(categories).filter(s=>s.status==='supported').length;
  return{...row,name:entities.get(row.entityId)?.names?.[0]?.value||row.entityId,categories,supportedSlots:supported,resolvedSlots:Object.values(categories).filter(s=>resolved.has(s.status)).length,criticallySparse:supported<3};
 });
 const queue=rows.flatMap(r=>Object.entries(r.categories).filter(([,s])=>!resolved.has(s.status)).map(([category,slot])=>({id:'completion-'+digest({entityId:r.entityId,snapshotYear:r.snapshotYear,category}).slice(0,24),entityId:r.entityId,name:r.name,snapshotYear:r.snapshotYear,category,status:slot.status,priority:priorities[category]+(r.criticallySparse?200:0),mapIds:r.mapIds,existingClaimIds:slot.records.map(f=>f.claimId),heldEvidenceIds:slot.heldEvidenceIds||[],cautions:['Selected snapshot does not retime observations or events.','Reuse one dated claim across applicable snapshots.','No geometry-derived sovereignty, succession or modern identity fallback.',...(r.mappingPartial?['Transition mapping requires review.']:[])]}))).sort((a,b)=>b.priority-a.priority||a.snapshotYear-b.snapshotYear||a.entityId.localeCompare(b.entityId)||a.category.localeCompare(b.category));
 return{schemaVersion:1,productionFingerprint:context.productionFingerprint,policy:{categories:completionCategories,partial:'Reported separately; never fractional completion.',resolution:'Independent evidence-backed assessment required. Missing, held and partial do not count.',context:'Explicit sourced political-status records only; government form or methodological caveats alone do not supply context.',rawIdentities:'Unresolved raw identity occurrences are reported separately, never silently assigned to modern states.',criticallySparse:'Fewer than three fully supported categories.',substantiallySupported:'Core identity, government, leadership and capital all supported; not a claim of exhaustive historical completion.'},metrics:summarize(rows),legacy14CategoryMetrics:scan.metrics,bySnapshot:Object.fromEntries(scan.snapshots.map(s=>[s.year,summarize(rows.filter(r=>r.snapshotYear===s.year))])),byCategory:Object.fromEntries(completionCategories.map(c=>{const states=Object.fromEntries(Object.keys(summarize([]).states).map(s=>[s,0]));for(const r of rows)states[r.categories[c].status]++;const total=rows.length,applicable=total-states['not-applicable'];return[c,{states,total,applicable,evidenceCoverage:applicable?100*states.supported/applicable:0,researchResolution:total?100*(states.supported+resolutionStates.reduce((n,s)=>n+states[s],0))/total:0}];})),rows,queue,unresolvedRawIdentities:scan.rawReview,errors:scan.errors,configurationWarnings:scan.configurationWarnings};
}
export function writeCompletion(report,directory){
 const records={};const rows=report.rows.map(r=>({...r,categories:Object.fromEntries(Object.entries(r.categories).map(([c,s])=>[c,{...s,records:s.records.map(f=>{records[f.claimId]=f;return f.claimId;})}]))}));
 saveJSON(path.join(directory,'completion.json'),{...report,rows,records,queue:undefined});saveJSON(path.join(directory,'priority-queue.json'),report.queue);
 const m=report.metrics,lines=['# 1800–1960 dossier completion','',`Evidence coverage: **${m.evidenceCoverage.toFixed(2)}%** (${m.states.supported}/${m.applicableSlots} applicable slots).`,`Research resolution: **${m.researchResolution.toFixed(2)}%** (${m.totalSlots-m.states.partial-m.states.missing-m.states.held}/${m.totalSlots} assessed slots).`,`Dossiers: ${m.dossiers}; critically sparse: ${m.criticallySparse}; completely unresolved: ${m.completelyUnresolved}; core-supported: ${m.coreSupported}.`,`Unresolved raw identity/snapshot occurrences outside the resolved-entity denominator: ${report.unresolvedRawIdentities.length}. These remain open identity work, not resolved coverage.`,`Prior 14-category metric: ${report.legacy14CategoryMetrics.supportedSnapshotCategorySlots}/${report.legacy14CategoryMetrics.applicableSnapshotCategoryOpportunities}. The new status category changes the denominator.`,`States: ${JSON.stringify(m.states)}.`,'','| Category | Supported | Partial | Missing | Held | Evidence % | Resolution % |','| --- | ---: | ---: | ---: | ---: | ---: | ---: |'];
 for(const[c,v]of Object.entries(report.byCategory))lines.push(`| ${c} | ${v.states.supported} | ${v.states.partial} | ${v.states.missing} | ${v.states.held} | ${v.evidenceCoverage.toFixed(2)} | ${v.researchResolution.toFixed(2)} |`);
 lines.push('','| Snapshot | Dossiers | Evidence % | Resolution % | Sparse |','| --- | ---: | ---: | ---: | ---: |');for(const[y,v]of Object.entries(report.bySnapshot))lines.push(`| ${y} | ${v.dossiers} | ${v.evidenceCoverage.toFixed(2)} | ${v.researchResolution.toFixed(2)} | ${v.criticallySparse} |`);
 lines.push('','Partial evidence is not scored fractionally. Population observations retain actual dates and explicit scope. Not applicable requires existing sourced investigation or independently reviewed resolution. A territorially incompatible candidate remains held unless an evidence-backed assessment resolves the entire category question. Priority favours sparse dossiers, then core categories; source-wide yield should guide selection among ranked jobs. Detailed dossier slots, supporting records and unresolved identities are in completion.json; bounded entity/year/category jobs are in priority-queue.json.');fs.writeFileSync(path.join(directory,'completion.md'),lines.join('\n')+'\n');
}
if(isCLI(import.meta.url)){const directory=process.argv[2]||'research/completion-01/reports',ledger='research/completion/resolutions.json',heldPath='research/completion/held.json';const report=completionMatrix(readContext(),{resolutions:fs.existsSync(ledger)?readJSON(ledger):[],held:fs.existsSync(heldPath)?readJSON(heldPath):[]});writeCompletion(report,directory);console.log(JSON.stringify(report.metrics));}
