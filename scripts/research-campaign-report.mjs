import fs from 'node:fs';
import path from 'node:path';
import {readContext,readJSON,saveJSON,root} from './research-common.mjs';
import {scan} from './research-scan.mjs';
import {coreFields} from './research-campaign.mjs';
const dir=path.join(root,'research/campaign-01'),selection=readJSON(path.join(dir,'selection.json')),queue=readJSON(path.join(dir,'queue.json')),context=readContext();
const add=(a,b)=>Object.fromEntries(['entityYearsEligible','fullySupportedYears','partialYears','missingYears'].map(k=>[k,(a?.[k]||0)+(b?.[k]||0)]));
const fields=Object.fromEntries(coreFields.map(f=>[f,{before:{},after:{}}]));
for(const e of selection.entities){const now=scan(context,{entityIds:[e.entityId],from:Number(e.period.from.slice(0,4)),until:Number(e.period.until.slice(0,4))});for(const f of coreFields){fields[f].before=add(fields[f].before,e.fieldCoverageBefore[f]);fields[f].after=add(fields[f].after,now.metrics.fieldCoverage[f]);}}
const integrated=queue.jobs.filter(j=>j.status==='integrated'),claims=integrated.flatMap(j=>j.package.claims);
// Source proposals are counted through actual completed integration aliases, never package declarations alone.
const aliases=integrated.map(j=>readJSON(path.join(dir,'integrated',j.entityId+'.json'))),added=new Set(),reused=new Set();
for(let i=0;i<integrated.length;i++){const p=integrated[i].package,a=aliases[i].sourceAliases;for(const s of p.sources)if(!a[s.id])added.add(s.id);for(const id of p.claims.flatMap(c=>c.sourceIds))if(a[id]||!p.sources.some(s=>s.id===id))reused.add(a[id]||id);}
const browsers=fs.existsSync(path.join(dir,'reports'))?fs.readdirSync(path.join(dir,'reports')).filter(f=>/^checkpoint-\d+-browser.json$/.test(f)).map(f=>readJSON(path.join(dir,'reports',f))):[];
const report={schemaVersion:1,campaign:'campaign-01',productionFingerprint:context.productionFingerprint,selectedEntities:selection.entities.length,researchedPeriods:selection.entities.map(e=>({entityId:e.entityId,period:e.period})),packagesSaved:fs.readdirSync(path.join(dir,'packages')).filter(f=>f.endsWith('.json')).length,
 statuses:queue.jobs.reduce((a,j)=>(a[j.status]=(a[j.status]||0)+1,a),{}),integratedEntities:integrated.length,claimsIntegrated:claims.length,claimsByField:claims.reduce((a,c)=>(a[c.category]=(a[c.category]||0)+1,a),{}),newSourcesAdded:added.size,existingSourcesReused:reused.size,totalRegisteredSources:context.registry.sources.length,
 entityYearCoverage:fields,naiveCategoryYearOpportunities:selection.naiveCategoryYearOpportunities,entityCentricAssignments:queue.jobs.length,targetedBrowserChecks:browsers.reduce((n,b)=>n+b.passed,0),
 qualifications:['Coverage is bounded to selected entity/periods, not all lifetime facts.','Partial source dates remain partial coverage; unsupported currencies/office transitions stay missing.','Job reduction compares assignment granularity; it is not a measured token/speedup benchmark.','Integrated facts are append-only and separately sourced; original worker packages and context revisions retained.']};
saveJSON(path.join(dir,'reports/progress.json'),report);
fs.writeFileSync(path.join(dir,'reports/progress.md'),['# Campaign 1 checkpoint report','',`Selected ${report.selectedEntities}; integrated ${report.integratedEntities}; claims ${report.claimsIntegrated}; sources added ${report.newSourcesAdded}, reused ${report.existingSourcesReused}.`,`Fingerprint: ${report.productionFingerprint}.`,'','| Field | Eligible entity/years | Supported before | Supported after | Partial before | Partial after |','| --- | ---: | ---: | ---: | ---: | ---: |',...Object.entries(fields).map(([f,x])=>`| ${f} | ${x.before.entityYearsEligible} | ${x.before.fullySupportedYears} | ${x.after.fullySupportedYears} | ${x.before.partialYears} | ${x.after.partialYears} |`),'',...report.qualifications.map(x=>'- '+x),''].join('\n'));
console.log(JSON.stringify({integrated:report.integratedEntities,claims:report.claimsIntegrated,fields:report.claimsByField,newSources:report.newSourcesAdded,reused:report.existingSourcesReused,browser:report.targetedBrowserChecks}));
