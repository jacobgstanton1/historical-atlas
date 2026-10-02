import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readContext,digest} from '../../../scripts/research-common.mjs';
import {fields,generateDossierJob,validateDossier,temporalBounds} from '../../../scripts/research-comprehensive.mjs';
const base='research/completion-01/office-figures',load=p=>JSON.parse(fs.readFileSync(p)),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const t=load(base+'/candidate-tranche.json'),cohort=load(base+'/cohort.json'),draft=load(base+'/certificate-draft.json'),cert=load(base+'/person-field-certification.json'),context=readContext(),store=load('data/comprehensive-dossiers.json');let checks=0;const check=(v,m)=>{assert(v,m);checks++;};
check(cert.mismatches.length===0,'Focused metadata mismatch');check(cert.focusedFieldComparisons===960,'Unexpected focused comparison count');check(cert.candidateTrancheSha256===sha(base+'/candidate-tranche.json'),'Stale metadata certificate');check(t.reuseCoreCertification.fieldComparisons===20454&&!t.reuseCoreCertification.biographyFieldsCertified,'Core certificate misrepresented as biography evidence');
for(const b of draft.inputBindings)check(sha(b.path)===b.sha256,'Bound input changed '+b.path);
check(draft.reviewer===null&&!draft.bodyReviewed&&!draft.acceptedClaimIds.length,'Worker self-certified review');check(draft.cohortHash===digest(cohort),'Cohort digest mismatch');
const originals=new Map(store.packages.flatMap(p=>p.claims).map(c=>[c.id,c])),slots=new Set(),groups=new Map();
for(const r of t.candidates){
 const c=cohort.claims.find(c=>c.id===r.id),old=originals.get(r.originalClaimId);check(!!c&&!!old,'Missing original/candidate');check(digest(old)===r.originalClaimHash,'Accepted source claim changed');
 check(c.value===old.value&&c.figure.name===old.value&&c.value===r.originalSourceRow.leader,'Name expanded or changed');check(c.figure.personId==='archigos-'+r.sourceLeadid,'Person ID changed');
 check(digest(c.temporal)===digest(old.temporal),'Activity interval widened');check(digest(c.scope)===digest(old.scope),'Entity/geographic scope changed');check(digest(c.sourceIds)===digest(old.sourceIds),'Sources changed');check(c.entityId===old.entityId,'Historical entity changed');
 check(digest(c.figure.lifespan)===digest(r.lifespan),'Lifespan changed');check(r.issues.length===0,'Held source row became candidate');
 for(const q of old.qualifications)check(c.qualifications.includes(q),'Original qualification lost');
 const b=temporalBounds(c.temporal),life=temporalBounds({...c.figure.lifespan,kind:'interval'});check(b.lo>=life.lo&&b.hi<=life.hi,'Relevance outside lifespan');
 check(c.figure.categories.length===1&&c.figure.categories[0]==='political','Unsupported figure category');check(c.figure.contribution==='Served as '+old.role+'; no additional historical achievement asserted.','Invented contribution');
 check(!Object.hasOwn(c.figure,'nationality')&&!Object.hasOwn(c.figure,'portraitMetadata'),'Added unsupported nationality/portrait');
 for(const slot of r.missingSlots){slots.add(slot.entityId+':'+slot.snapshotYear);check(slot.originalLeadershipClaimId===old.id&&slot.entityId===c.entityId,'Unbound target slot');}
 const g=groups.get(c.entityId)||[];g.push(c);groups.set(c.entityId,g);
}
for(const r of t.held)check(r.issues.length>0&&!cohort.claims.some(c=>c.id===r.id),'Unexplained or accepted hold');
check(slots.size===t.summary.targetMissingFigureSlots,'Missing-slot gain mismatch');
let packageChecks=0;
for(const [entityId,claims] of groups){
 const first=claims.toSorted((a,b)=>temporalBounds(a.temporal).lo-temporalBounds(b.temporal).lo)[0],last=claims.toSorted((a,b)=>temporalBounds(a.temporal).hi-temporalBounds(b.temporal).hi).at(-1),period={from:first.temporal.from,until:last.temporal.until},job=generateDossierJob(entityId,period,context);
 const sourceIds=[...new Set(claims.flatMap(c=>c.sourceIds))],pkg={schemaVersion:2,id:'test-'+entityId,jobId:job.id,entityId,mapIds:job.mapIds,worker:{id:cohort.worker,assignmentType:'comprehensive-entity-period'},productionFingerprint:job.productionFingerprint,chronology:{calendar:'proleptic-gregorian',yearConvention:'astronomical'},period,claims,sources:[],investigation:fields.map(category=>({category,status:category==='important-figures'?'partial':'unresolved',rationale:'Bounded accepted-office reuse test; no completeness assertion.',consultedSourceIds:category==='important-figures'?sourceIds:[],gaps:['Other periods and categories remain open.']})),conflicts:[],provenance:{createdAt:'2026-10-02',method:'Technical fixture only; independent metadata review required.',preservedPackageHashes:[digest(cohort)]}};
 const v=validateDossier(pkg,job,context);check(v.valid,'Dossier validator: '+v.errors.join('; '));check(v.review.length===0,'Unexpected review issue: '+v.review.join('; '));packageChecks+=v.checks.length;
 const invalid=structuredClone(pkg);invalid.claims[0].figure.lifespan.until=invalid.claims[0].figure.lifespan.from;check(!validateDossier(invalid,job,context).valid,'Impossible lifespan accepted');
}
const hash=sha(base+'/cohort.json');check(spawnSync(process.execPath,[base+'/build-cohort.mjs'],{encoding:'utf8'}).status===0,'Builder failed');check(sha(base+'/cohort.json')===hash,'Nondeterministic cohort');for(const b of draft.inputBindings)check(sha(b.path)===b.sha256,'Frozen input changed');
const out={pass:true,focusedChecks:checks,existingValidatorChecks:packageChecks,existingValidatorPackages:groups.size,personMetadataDirectComparisons:cert.focusedFieldComparisons,original20454CoreFieldCertificateReused:true,candidates:cohort.claims.length,targetMissingFigureSlots:slots.size,cohortSha256:hash,cohortCanonicalHash:digest(cohort),candidateTrancheSha256:sha(base+'/candidate-tranche.json'),personCertificationSha256:sha(base+'/person-field-certification.json'),historicalAcceptance:false,productionEdited:false};fs.writeFileSync(base+'/validation.json',JSON.stringify(out,null,2)+'\n');console.log(out);
