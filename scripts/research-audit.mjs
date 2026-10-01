import fs from 'node:fs';
import path from 'node:path';
import {readContext,readJSON,saveJSON,digest,root,isCLI} from './research-common.mjs';
import {validatePackage} from './research-validator.mjs';
export function auditResearch(context,queue,packages,{requireFinished=false}={}) {
  const errors=[],checks=[];const check=(label,condition)=>{checks.push({label,passed:!!condition});if(!condition)errors.push(label);};
  check('Unique queue job IDs',new Set(queue.jobs.map(j=>j.id)).size===queue.jobs.length);
  check('Unique package IDs',new Set(packages.map(p=>p.id)).size===packages.length);
  const claims=packages.flatMap(p=>p.claims);check('Unique claim IDs across packages',new Set(claims.map(c=>c.id)).size===claims.length);
  check('No orphan packages',packages.every(p=>queue.jobs.some(j=>j.id===p.jobId)));
  const sources=new Map(context.registry.sources.map(s=>[s.id,s.url]));
  for(const p of packages)for(const s of p.sources){check('Source ID retains URL: '+s.id,!sources.has(s.id)||sources.get(s.id)===s.url);sources.set(s.id,s.url);}
  const active=queue.jobs.filter(j=>j.status==='researching');check('Concurrency bound',active.length<=queue.concurrency);
  check('Unique active worker owners',new Set(active.map(j=>j.owner)).size===active.length&&active.every(j=>j.owner));
  for(const j of queue.jobs){
    const p=packages.find(p=>p.jobId===j.id);
    check('Fresh job fingerprint: '+j.id,j.productionFingerprint===context.productionFingerprint||j.status==='integrated');
    if(requireFinished)check('Pilot job reached a durable outcome: '+j.id,['accepted','historical-review','rejected','integrated'].includes(j.status));
    if(!p){if(!['queued','researching'].includes(j.status))check('Submitted package retained: '+j.id,false);continue;}
    const result=validatePackage(p,j,context);check('Package structurally valid: '+p.id,result.valid);
    check('Submitted package hash retained: '+p.id,j.packageHash===digest(p)&&digest(j.package)===digest(p));
    check('All claim source references resolve: '+p.id,p.claims.every(c=>c.sourceIds.every(id=>sources.has(id))));
    if(j.status==='accepted'){
      check('Accepted receipt hash and coordinator: '+p.id,j.receipt?.packageHash===digest(p)&&j.receipt.coordinator?.role==='coordinator'&&!!j.receipt.rationale);
      check('Accepted receipt binds every current review issue: '+p.id,digest([...(j.receipt?.reviewedIssues||[])].sort())===digest([...result.review].sort()));
      check('No unresolved fact accepted: '+p.id,p.claims.every(c=>c.reviewStatus==='clear'&&c.geographicScope.relationship==='same'));
    }
  }
  return {schemaVersion:1,productionFingerprint:context.productionFingerprint,passed:checks.length-errors.length,errors,checks,packages:packages.length,claims:claims.length,states:queue.jobs.reduce((a,j)=>(a[j.status]=(a[j.status]||0)+1,a),{})};
}
if(isCLI(import.meta.url)) {
  const directory=path.join(root,'research/pilot'),packages=fs.readdirSync(path.join(directory,'packages')).filter(f=>f.endsWith('.json')).sort().map(f=>readJSON(path.join(directory,'packages',f)));
  const report=auditResearch(readContext(),readJSON(path.join(directory,'queue.json')),packages,{requireFinished:true});
  saveJSON(path.join(root,'research/reports/pilot-audit.json'),report);console.log(JSON.stringify({passed:report.passed,errors:report.errors,states:report.states}));if(report.errors.length)process.exitCode=1;
}
