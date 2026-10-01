import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {readContext,readJSON,saveJSON,digest,root,isCLI} from './research-common.mjs';
import {validatePackage} from './research-validator.mjs';
import {createMetadataIndex} from '../historical-metadata.js';
import {auditResearchFlags} from './research-flags.mjs';
import {campaignOptions,campaignArguments} from './research-campaign.mjs';
export function campaignAudit(options={}) {
const {directory:dir,config}=campaignOptions(options),context=readContext(),q=readJSON(path.join(dir,'queue.json')),index=createMetadataIndex(context.db,context.registry),checks=[],errors=[];
const partial=!!options.checkpoint;
const check=(label,ok)=>{checks.push({label,passed:!!ok});if(!ok)errors.push(label);};
const baseline=f=>JSON.parse(execFileSync('git',['show',config.baselineCommit+':'+f],{encoding:'utf8',maxBuffer:20*1024*1024})),old=baseline('data/historical-entities.json'),oldSources=baseline('data/historical-sources.json');
check('Bounded assignments; required integrations or explicit historical dispositions complete',q.jobs.length===config.expectedAssignments&&(partial||q.jobs.every(j=>j.status==='integrated'||config.campaign!=='campaign-01'&&['historical-review','rejected'].includes(j.status))));
check('No entity creation or identity mapping change',context.db.entities.length===old.entities.length&&digest(context.db.mappings)===digest(old.mappings));
check('Existing production source definitions preserved',digest(context.registry.sources.slice(0,oldSources.sources.length))===digest(oldSources.sources));
check('Unique entity IDs',new Set(context.db.entities.map(e=>e.id)).size===context.db.entities.length);
check('Unique source IDs and URLs',new Set(context.registry.sources.map(s=>s.id)).size===context.registry.sources.length&&new Set(context.registry.sources.map(s=>s.url)).size===context.registry.sources.length);
const sources=new Set(context.registry.sources.map(s=>s.id)),used=new Set(context.db.entities.flatMap(e=>Object.values(e).filter(Array.isArray).flat().flatMap(f=>f.sourceIds||[])));
const flagAudit=auditResearchFlags(context);
check('Integrated flag assets, licensing and provenance resolve',flagAudit.valid);
errors.push(...flagAudit.errors);
check('Every added source is used',context.registry.sources.slice(oldSources.sources.length).every(s=>used.has(s.id)));
for(const e of old.entities){const now=context.db.entities.find(x=>x.id===e.id);check('Immutable fact prefixes '+e.id,!!now&&Object.entries(e).every(([k,v])=>digest(Array.isArray(v)?now[k].slice(0,v.length):now[k])===digest(v)));}
const fields={capital:'capitals',leadership:'leaders',currency:'currencies','historical-flag':'flags'};
let temporalChecks=0;
for(const j of q.jobs.filter(j=>j.status==='integrated')){
 const worker=readJSON(path.join(dir,'packages',j.entityId+'.json')),review=readJSON(path.join(dir,'review',j.entityId+'.json'));
 check('Original body review binds package '+j.entityId,review.bodyReviewed&&review.decision==='accepted'&&review.packageHash===digest(worker));
 check('Distinct evidence reviewer '+j.entityId,!review.reviewer||review.reviewer!==worker.worker.id);
 check('Archived worker evidence retained '+j.entityId,digest(j.package)===digest(worker)||j.contextRevisions?.some(r=>digest(r.package)===digest(worker)));
 check('Completed receipt hash '+j.entityId,j.packageHash===digest(j.package)&&j.receipt.packageHash===j.packageHash&&j.integrationReceipt.packageHash===j.packageHash);
 // Read-only revalidation against present additive context is not a new acceptance or integration.
 const p=structuredClone(j.package),job=structuredClone(j);p.productionFingerprint=job.productionFingerprint=context.productionFingerprint;
 check('Current structural source/date/entity validation '+j.entityId,validatePackage(p,job,context).valid);
 for(const c of p.claims){
  const field=fields[c.category]||{government:'governments',politicalStatus:'politicalStatus',description:'descriptions'}[c.metric],e=context.db.entities.find(e=>e.id===j.entityId),fact=e[field].find(f=>f.researchProvenance?.claimId===c.id);
  check('Exact integrated claim/source provenance '+c.id,!!fact&&(c.category==='historical-flag'?fact.asset===c.flag.asset:fact.value===c.value)&&fact.validFrom===c.temporal.from&&fact.validUntil===c.temporal.until&&fact.sourceIds.every(id=>sources.has(id)));
  for(const mapId of j.mapIds)for(let y=1800;y<=1960;y++){
   const r=index.resolve(mapId,y),sections=r.entity?[r]:(r.identityPeriods||[]),records=sections.flatMap(s=>s[field]||[]),visible=records.some(f=>f.researchProvenance?.claimId===c.id),entityPresent=sections.some(s=>s.entity?.id===j.entityId);
   // Calendar-year intersection, with exclusive exact endpoints and reduced precision retained.
   const parts=c.temporal.until.split('-').map(Number),end=parts.length===3?Date.UTC(parts[0],parts[1]-1,parts[2]):parts.length===2?Date.UTC(parts[0],parts[1],1):Date.UTC(parts[0]+1,0,1);
   const fromParts=c.temporal.from.split('-').map(Number),begin=Date.UTC(fromParts[0],(fromParts[1]||1)-1,fromParts[2]||1),expected=entityPresent&&begin<Date.UTC(y+1,0,1)&&end>Date.UTC(y,0,1);
   if(visible!==expected)errors.push('Selected-year claim leakage/missing '+c.id+' '+mapId+' '+y);temporalChecks++;
  }
 }
}
const report={schemaVersion:1,productionFingerprint:context.productionFingerprint,passed:checks.filter(c=>c.passed).length,temporalChecks,errors,checks};saveJSON(path.join(dir,'reports',partial?'checkpoint-audit.json':'final-audit.json'),report);return report;
}
if(isCLI(import.meta.url)){const {options,positional}=campaignArguments(process.argv.slice(2));if(positional.some(x=>x!=='--checkpoint')||positional.length>1)throw Error('Usage: research-campaign-audit.mjs [--checkpoint] [--directory path]');const report=campaignAudit({...options,checkpoint:positional.includes('--checkpoint')});console.log(JSON.stringify({passed:report.passed,temporalChecks:report.temporalChecks,errors:report.errors}));if(report.errors.length)process.exitCode=1;}
