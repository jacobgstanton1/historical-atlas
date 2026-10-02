// Serial intake of immutable, source-certified cohorts through the existing integrator.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {readJSON,readContext,saveJSON,digest,isCLI} from './research-common.mjs';
import {fields,temporalBounds,generateDossierJob,validateDossier,acceptDossier,integrateDossier} from './research-comprehensive.mjs';
import {auditRichProduction} from './research-scale-audit.mjs';
export function integrateCertified(cohort,certificate,{apply=false,output}={}){
 if(certificate.cohortHash!==digest(cohort)||!certificate.bodyReviewed||!certificate.reviewer||certificate.reviewer===cohort.worker)throw Error('Missing independent source/category certificate');
 if(!certificate.inputBindings?.length)throw Error('Unbound source certificate');
 for(const b of certificate.inputBindings)if(crypto.createHash('sha256').update(fs.readFileSync(b.path)).digest('hex')!==b.sha256)throw Error('Certified input changed: '+b.path);
 const before=auditRichProduction(readContext());if(!before.valid)throw Error(before.errors.join('; '));
 const groups=new Map();for(const c of cohort.claims){if(!certificate.acceptedClaimIds.includes(c.id))throw Error('Unaccepted claim');let g=groups.get(c.entityId)||[];g.push(c);groups.set(c.entityId,g);}
 const result={cohortId:cohort.id,cohortHash:digest(cohort),certificateHash:digest(certificate),before,integrations:[],held:[],browserChecks:0};
 for(const [entityId,claims]of groups){
  const context=readContext(),store=readJSON('data/comprehensive-dossiers.json'),id=cohort.id+'-'+entityId,existing=store.packages.find(p=>p.id===id);
  if(existing){if(digest(existing.claims)!==digest(claims))throw Error('Changed resumed claims');result.integrations.push({id,claims:claims.length,resumed:true});continue;}
  const ordered=claims.toSorted((a,b)=>temporalBounds(a.temporal).lo-temporalBounds(b.temporal).lo),ends=claims.toSorted((a,b)=>temporalBounds(a.temporal).hi-temporalBounds(b.temporal).hi);
  const first=ordered[0].temporal,last=ends.at(-1).temporal;
  const period={from:first.from||first.observationDate||first.date,until:last.until||(last.observationDate||last.date).slice(0,4)},job=generateDossierJob(entityId,period,context),categories=new Set(claims.map(c=>c.category)),sourceIds=[...new Set(claims.flatMap(c=>c.sourceIds))];
  const knownSources=[...context.registry.sources,...store.packages.flatMap(p=>p.sources)],sources=(cohort.sources||[]).filter(s=>sourceIds.includes(s.id)&&!knownSources.some(old=>old.id===s.id));
  for(const s of cohort.sources||[]){const old=knownSources.find(old=>old.id===s.id);if(old&&digest(old)!==digest(s))throw Error('Unsafe source overwrite');}
  const pkg={schemaVersion:2,id,jobId:job.id,entityId,mapIds:job.mapIds,worker:{id:cohort.worker,assignmentType:'comprehensive-entity-period'},productionFingerprint:job.productionFingerprint,chronology:{calendar:'proleptic-gregorian',yearConvention:'astronomical'},period,claims,sources,investigation:fields.map(category=>({category,status:categories.has(category)?'partial':'unresolved',rationale:'Bounded source-wide intake; no assertion of exhaustive category research.',consultedSourceIds:categories.has(category)?sourceIds:[],gaps:['Uncovered facts and periods remain open.']})),conflicts:[],provenance:{createdAt:'2026-10-02',method:certificate.rationale,preservedPackageHashes:[digest(cohort),digest(certificate)]}};
  const validation=validateDossier(pkg,job,context);
  if(!validation.valid||validation.review.some(x=>x!=='Candidate claims require independent original-source review')){result.held.push({entityId,claimIds:claims.map(c=>c.id),errors:validation.errors,review:validation.review});continue;}
  const review={reviewer:certificate.reviewer,packageHash:digest(pkg),bodyReviewed:true,rationale:certificate.rationale,reviewedIssues:validation.review,decisions:Object.fromEntries(claims.map(c=>[c.id,'accepted']))};
  const receipt=acceptDossier(pkg,job,context,review);if(output)saveJSON(output+'/packages/'+entityId+'.json',{job,package:pkg,receipt});
  const integration=integrateDossier(pkg,job,context,receipt,{apply});result.integrations.push({id,claims:claims.length,applied:integration.applied});
  if(output)saveJSON(output+'/integration.json',result);
 }
 result.after=auditRichProduction(readContext());if(!result.after.valid)throw Error(result.after.errors.join('; '));if(output)saveJSON(output+'/integration.json',result);return result;
}
if(isCLI(import.meta.url)){const [cohortPath,certificatePath]=process.argv.slice(2);const r=integrateCertified(readJSON(cohortPath),readJSON(certificatePath),{apply:process.argv.includes('--apply'),output:cohortPath.replace(/\/[^/]+$/,'')});console.log(JSON.stringify({claims:r.integrations.reduce((n,p)=>n+p.claims,0),packages:r.integrations.length,held:r.held,after:r.after}));}
