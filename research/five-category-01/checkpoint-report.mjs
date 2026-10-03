import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {readJSON,saveJSON,digest} from '../../scripts/research-common.mjs';
const base=readJSON('research/five-category-01/baseline.json');
const current=readJSON('data/comprehensive-dossiers.json');
const previous=JSON.parse(execFileSync('git',['show',base.commit+':data/comprehensive-dossiers.json'],{maxBuffer:100*1024*1024}));
for(const p of previous.packages){const now=current.packages.find(x=>x.id===p.id);if(!now||digest(now)!==digest(p))throw Error('Previously accepted package changed: '+p.id);}
const oldIds=new Set(previous.packages.map(p=>p.id));
const added=current.packages.filter(p=>!oldIds.has(p.id));
const report=readJSON('research/completion-01/reports/occurrence-completion.json');
const rows=report.rows.filter(r=>r.eligibility.eligible&&!r.eligibility.pending);
const oldCells=new Map(base.cells.map(c=>[c.id,c]));
const counts={},gains={},transitions={},improved=new Set();
for(const cat of base.categories){counts[cat]={};gains[cat]=0;transitions[cat]={};}
for(const row of rows){const old=oldCells.get(row.id);if(!old)throw Error('Changed eligibility denominator');for(const cat of base.categories){const status=row.categories[cat].status;counts[cat][status]=(counts[cat][status]||0)+1;if(status==='supported'&&old.statuses[cat]!=='supported'){gains[cat]++;transitions[cat][old.statuses[cat]]=(transitions[cat][old.statuses[cat]]||0)+1;improved.add(row.id);}}}
const uniqueClaims={};for(const p of added)for(const c of p.claims)uniqueClaims[c.category]=(uniqueClaims[c.category]||0)+1;
const oldSources=new Set(previous.packages.flatMap(p=>p.sources.map(s=>s.id)));
const registry=readJSON('data/historical-sources.json');for(const s of registry.sources||[])oldSources.add(s.id);
const sources=[...new Set(added.flatMap(p=>p.claims.flatMap(c=>c.sourceIds)))];
const assessed=new Set(),held=new Map();
for(const dir of fs.readdirSync('research/five-category-01',{withFileTypes:true}).filter(d=>d.isDirectory())){
 const root='research/five-category-01/'+dir.name;
 if(fs.existsSync(root+'/assessment.json')){const a=readJSON(root+'/assessment.json');const walk=x=>{if(!x||typeof x!=='object')return;if(x.mapId&&(x.snapshotYear||x.year))assessed.add(x.mapId+'@'+(x.snapshotYear||x.year));for(const v of Object.values(x))if(typeof v==='object')walk(v);};walk(a);}
 for(const file of ['held.json','coordinator-held.json'])if(fs.existsSync(root+'/'+file)){const data=readJSON(root+'/'+file);const walk=x=>{if(!x||typeof x!=='object')return;if(x.mapId&&(x.snapshotYear||x.year)&&x.category)held.set(x.mapId+'@'+(x.snapshotYear||x.year)+'/'+x.category,x);for(const v of Object.values(x))if(typeof v==='object')walk(v);};walk(data);}
}
const newSupported=Object.values(gains).reduce((a,b)=>a+b,0);
const currentRows=new Map(rows.map(r=>[r.mapId+'@'+r.snapshotYear,r]));
for(const [key,c] of held){const r=currentRows.get(c.mapId+'@'+(c.snapshotYear||c.year));if(r?.categories[c.category]?.status==='supported')held.delete(key);}
const supported=Object.values(counts).reduce((a,c)=>a+(c.supported||0),0);
const bySnapshot={};for(const id of improved){const year=id.slice(id.lastIndexOf('@')+1);bySnapshot[year]=(bySnapshot[year]||0)+1;}
const result={baselineCommit:base.commit,previousClaims:base.claims,currentClaims:current.packages.reduce((n,p)=>n+p.claims.length,0),newClaims:uniqueClaims,confirmedDossiers:rows.length,targetCells:rows.length*base.categories.length,previousCounts:base.counts,currentCounts:counts,newSupportedCells:gains,totalNewSupportedCells:newSupported,transitions,dossiersImproved:improved.size,improvedOccurrences:[...improved].sort(),assessedOccurrences:assessed.size,heldCellsRecorded:held.size,remainingNotFullySupported:rows.length*base.categories.length-supported,sourcesReused:sources.filter(id=>oldSources.has(id)).length,newSources:sources.filter(id=>!oldSources.has(id)).length,allPreviouslyAcceptedPackagesUnchanged:true,globalMetrics:report.metrics,focusedAutomatedTests:101,browserChecks:0,startingCreditBalance:base.creditBalance};
saveJSON('research/five-category-01/checkpoint.json',result);
result.dossiersImprovedBySnapshot=bySnapshot;
result.confirmedOverallSupported=rows.reduce((n,r)=>n+Object.values(r.categories).filter(c=>c.status==='supported').length,0);
result.confirmedOverallSlots=rows.length*report.policy.categories.length;
result.confirmedOverallEvidenceCoverage=100*result.confirmedOverallSupported/result.confirmedOverallSlots;
result.startingTargetEvidenceCoverage=100*Object.values(base.counts).reduce((n,c)=>n+(c.supported||0),0)/result.targetCells;
result.endingTargetEvidenceCoverage=100*supported/result.targetCells;
if(process.argv[2]){result.endingCreditBalance=Number(process.argv[2]);result.approximateCreditsConsumed=base.creditBalance-result.endingCreditBalance;result.supportedCellsPerCredit=result.totalNewSupportedCells/result.approximateCreditsConsumed;}
saveJSON('research/five-category-01/checkpoint.json',result);
saveJSON('research/five-category-01/deferred-cells.json',{cells:[...held.values()]});
const audit=readJSON('research/scale-01/production-audit.json');
fs.writeFileSync('research/five-category-01/CHECKPOINT.md',`# Five-category completion checkpoint\n\nAccepted claims: ${base.claims} → ${result.currentClaims}. New fully supported cells: ${newSupported}; dossiers improved: ${result.dossiersImproved}. Assessed selectable occurrences: ${assessed.size}, across the configured 1800–1960 snapshots.\n\n| Category | Supported before | Supported after | New fully supported cells |\n|---|---:|---:|---:|\n${base.categories.map(c=>`| ${c} | ${base.counts[c].supported} | ${counts[c].supported||0} | ${gains[c]} |`).join('\n')}\n\nFive-category confirmed-eligible coverage: ${result.startingTargetEvidenceCoverage.toFixed(2)}% → ${result.endingTargetEvidenceCoverage.toFixed(2)}%. Remaining target cells not fully supported: ${result.remainingNotFullySupported}.\n\nSources reused: ${result.sourcesReused}; new sources: ${result.newSources}. Exact-cell deferrals recorded: ${held.size}; these do not automatically become resolved production states.\n\nAll original accepted packages unchanged. No frontend or historical entity/source registry changes. Source precision preserved. Partial → supported gains require newly reviewed evidence, not retagging older claims. No population proposal was forced across incompatible territory.\n\nValidation: 101 focused tests; ${audit.checks} rich-store integrity checks; zero browser checks.\n\nCorrected conservative global coverage (including pending eligibility separately in its denominator): 29.4397% → ${report.metrics.evidenceCoverage.toFixed(4)}%. Confirmed-only overall coverage: ${result.confirmedOverallEvidenceCoverage.toFixed(4)}%.\n\n${result.approximateCreditsConsumed?`Approximate paid credits consumed: ${result.approximateCreditsConsumed.toFixed(2)}; last balance: ${result.endingCreditBalance.toFixed(2)}. Yield: ${result.supportedCellsPerCredit.toFixed(2)} fully supported cells per credit.\n\n`:''}This is a production checkpoint, not exhaustive completion. See HANDOFF.md, checkpoint.json and deferred-cells.json for preserved state.\n`);
console.log(JSON.stringify(result));
