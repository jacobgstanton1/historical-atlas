import {readContext,readJSON,saveJSON,digest,isCLI} from './research-common.mjs';
import {completionMatrix} from './research-completion.mjs';
import fs from 'node:fs';
const baselinePath='research/completion-01/baseline.json';
export function captureBaseline(){
 if(fs.existsSync(baselinePath))throw Error('Campaign baseline already exists; never reset');
 const r=completionMatrix(readContext()),rich=readJSON('data/comprehensive-dossiers.json');
 const baseline={checkpoint:'0225d279aa854d7fda3b671db641c9f81ce8e51b',productionClaims:rich.packages.reduce((n,p)=>n+p.claims.length,0),packageDigests:Object.fromEntries(rich.packages.map(p=>[p.id,digest(p)])),metrics:r.metrics,bySnapshot:r.bySnapshot,byCategory:r.byCategory,dossiers:r.rows.map(row=>({entityId:row.entityId,snapshotYear:row.snapshotYear,supportedSlots:row.supportedSlots,resolvedSlots:row.resolvedSlots,criticallySparse:row.criticallySparse})),creditsReportedStart:505.012};saveJSON(baselinePath,baseline);return baseline;
}
export function completionDelta(){
 const before=readJSON(baselinePath),after=completionMatrix(readContext()),rich=readJSON('data/comprehensive-dossiers.json');
 for(const[id,hash]of Object.entries(before.packageDigests)){const p=rich.packages.find(p=>p.id===id);if(!p||digest(p)!==hash)throw Error('Previously accepted production package changed: '+id);}
 const previous=new Map(before.dossiers.map(r=>[r.entityId+'|'+r.snapshotYear,r]));
 const added=rich.packages.filter(p=>!Object.hasOwn(before.packageDigests,p.id)).flatMap(p=>p.claims);
 return{before:before.metrics,after:after.metrics,productionClaimsBefore:before.productionClaims,productionClaimsAfter:rich.packages.reduce((n,p)=>n+p.claims.length,0),uniqueClaimsAdded:added.length,claimsByCategory:Object.fromEntries([...new Set(added.map(c=>c.category))].sort().map(c=>[c,added.filter(a=>a.category===c).length])),supportedSlotsGained:after.metrics.states.supported-before.metrics.states.supported,resolvedSlotsGained:after.rows.reduce((n,r)=>n+r.resolvedSlots,0)-before.dossiers.reduce((n,r)=>n+r.resolvedSlots,0),dossiersImproved:after.rows.filter(r=>r.supportedSlots>(previous.get(r.entityId+'|'+r.snapshotYear)?.supportedSlots??0)).length,criticallySparseEliminated:after.rows.filter(r=>previous.get(r.entityId+'|'+r.snapshotYear)?.criticallySparse&&!r.criticallySparse).length,byCategory:Object.fromEntries(Object.entries(after.byCategory).map(([c,v])=>[c,{supportedSlotsGained:v.states.supported-before.byCategory[c].states.supported,before:before.byCategory[c],after:v}])),bySnapshot:Object.fromEntries(Object.entries(after.bySnapshot).map(([y,v])=>[y,{supportedSlotsGained:v.states.supported-before.bySnapshot[y].states.supported,before:before.bySnapshot[y],after:v}])),previousPackagesUnchanged:true,browserChecks:0};
}
if(isCLI(import.meta.url)){if(process.argv.includes('--baseline'))console.log(JSON.stringify(captureBaseline().metrics));else{const r=completionDelta();saveJSON('research/completion-01/reports/campaign-delta.json',r);console.log(JSON.stringify({claims:r.uniqueClaimsAdded,slots:r.supportedSlotsGained,dossiers:r.dossiersImproved,before:r.before.evidenceCoverage,after:r.after.evidenceCoverage}));}}
