import fs from 'node:fs';
import path from 'node:path';
import {readJSON,saveJSON,readContext,digest,root,isCLI} from './research-common.mjs';
import {fingerprint,temporalBounds,validateDossier,acceptDossier,integrateDossier} from './research-comprehensive.mjs';
const assert=(ok,message)=>{if(!ok)throw Error(message);};
export function reuseCatalogue(context,accepted=[],candidates=[]){
 const file=path.join(context.directory,'data/comprehensive-dossiers.json');
 const rich=fs.existsSync(file)?readJSON(file).packages:[];
 return {productionFingerprint:fingerprint(context.directory),productionEntities:context.db.entities,productionPackages:rich,
  sources:[...new Map([...context.registry.sources,...rich.flatMap(p=>p.sources)].map(s=>[s.id,s])).values()],accepted,candidates,
  lookupOrder:['production facts','registered sources','accepted evidence','structured cache','new research']};
}
export function duplicateProductionClaim(c,context,catalogue){
 if(catalogue.productionPackages.some(p=>p.claims.some(old=>old.id===c.id)))return 'existing rich claim ID';
 const e=context.db.entities.find(e=>e.id===c.entityId),key={identity:'names','political-institutional':'governments',leadership:'leaders',capital:'capitals',currency:'currencies','historical-flag':'flags',overview:'descriptions'}[c.category];
 if(c.origin.kind==='production-reuse')return 'explicit existing production evidence';
 for(const old of e?.[key]||[]){
  if(old.researchProvenance?.claimId&&c.id.includes(old.researchProvenance.claimId))return 'previously integrated provenance';
  if(digest(old.value)!==digest(c.value)||(c.role||'')!==(old.role||''))continue;
  if(c.category==='historical-flag'&&old.asset!==c.flag?.asset)continue;
  try{const a=temporalBounds({kind:'interval',from:old.validFrom||'1800',until:old.validUntil||'1960'}),b=temporalBounds(c.temporal);if(b.lo>=a.lo&&b.hi<=a.hi)return 'already covered sourced value';}catch{}
 }
 return null;
}
export function prepareReviewedIntegration(original,originalJob,independentReview,context){
 assert(independentReview.packageHash===digest(original)&&independentReview.bodyReviewed&&independentReview.reviewer!==original.worker.id,'Original independent review binding required');
 assert(originalJob.id===original.jobId&&digest(originalJob.period)===digest(original.period),'Original job binding required');
 const catalogue=reuseCatalogue(context),byURL=new Map(catalogue.sources.map(s=>[s.url,s])),byID=new Map(catalogue.sources.map(s=>[s.id,s]));
 const pkg=structuredClone(original),job=structuredClone(originalJob),aliases={};
 for(const s of pkg.sources){if(byID.has(s.id))assert(byID.get(s.id).url===s.url,'Source ID collision');if(byURL.has(s.url))aliases[s.id]=byURL.get(s.url).id;}
 const resolve=id=>aliases[id]||id;
 pkg.sources=pkg.sources.filter(s=>!byURL.has(s.url));
 for(const c of pkg.claims){c.sourceIds=[...new Set(c.sourceIds.map(resolve))];for(const e of c.evidence)e.sourceId=resolve(e.sourceId);if(c.flag)c.flag.assetSourceIds=[...new Set(c.flag.assetSourceIds.map(resolve))];}
 for(const i of pkg.investigation)i.consultedSourceIds=[...new Set(i.consultedSourceIds.map(resolve))];
 job.productionFingerprint=pkg.productionFingerprint=fingerprint(context.directory);
 const validation=validateDossier(pkg,job,context);assert(validation.valid,validation.errors.join('; '));
 const decisions={...independentReview.decisions},skipped={};
 for(const c of pkg.claims){assert(['accepted','held','rejected'].includes(decisions[c.id]),'Missing reviewed claim disposition');if(decisions[c.id]==='accepted'){const reason=duplicateProductionClaim(c,context,catalogue);if(reason){decisions[c.id]='held';skipped[c.id]=reason;}}}
 // Acceptance may only narrow the prior independent decision; historical content is unchanged.
 const review={reviewer:'serial-coordinator-cached-independent-review',packageHash:digest(pkg),bodyReviewed:true,reviewedIssues:validation.review,decisions,originalPackageHash:digest(original),originalIndependentReview:structuredClone(independentReview),sourceAliases:aliases,
  rationale:'Prior independent source-body review reused: '+independentReview.reviewer+'. Only production-context fingerprint and source-ID aliases changed; duplicate publication excluded. Original rationale: '+independentReview.rationale};
 const receipt=acceptDossier(pkg,job,context,review);
 return {pkg,job,receipt,validation,skipped,contextChange:{originalPackageHash:digest(original),originalReview:independentReview,sourceAliases:aliases,originalFingerprint:original.productionFingerprint,currentFingerprint:pkg.productionFingerprint}};
}
export function integrateReviewedFiles(packageFile,jobFile,reviewFile,directory=root){
 const context=readContext(directory),original=readJSON(packageFile),ledgerFile=path.join(directory,'research/scale-01/integration-ledger.json');
 const ledger=fs.existsSync(ledgerFile)?readJSON(ledgerFile):{baselineCommit:'d26de062cf1f05a7056ce33de6d1e067d76a59c3',integrations:[]};
 if(ledger.integrations.some(x=>x.originalPackageHash===digest(original)))return {alreadyIntegrated:true};
 const storeFile=path.join(directory,'data/comprehensive-dossiers.json');
 const existing=fs.existsSync(storeFile)?readJSON(storeFile).packages.find(p=>p.acceptance.review.originalPackageHash===digest(original)):null;
 if(existing){
  const j=readJSON(path.join(directory,'research/comprehensive/integration-journal.json'));
  assert(j.status==='completed'&&j.packageHash===existing.acceptance.packageHash&&digest(JSON.parse(j.after).packages.find(p=>p.id===existing.id))===digest(existing),'Inspect recovery receipt');
  assert(j.afterFingerprint===fingerprint(directory),'Changed production requires explicit recovery review');
  assert(digest(readJSON(reviewFile))===digest(existing.acceptance.review.originalIndependentReview),'Independent review changed during recovery');
  ledger.integrations.push({entityId:existing.entityId,period:existing.period,packageId:existing.id,originalPackageHash:digest(original),integratedClaimIds:existing.claims.map(c=>c.id),newResearchClaims:existing.claims.filter(c=>c.origin.kind==='new-research').length,reusedEvidenceClaims:existing.claims.filter(c=>c.origin.kind!=='new-research').length,claimsByCategory:Object.fromEntries([...new Set(existing.claims.map(c=>c.category))].map(f=>[f,existing.claims.filter(c=>c.category===f).length])),result:{applied:true,recovered:true,afterFingerprint:j.afterFingerprint}});
  saveJSON(ledgerFile,ledger);return {recovered:true,entityId:existing.entityId,integrated:existing.claims.length};
 }
 const prepared=prepareReviewedIntegration(original,readJSON(jobFile),readJSON(reviewFile),context);
 const journalFile=path.join(directory,'research/comprehensive/integration-journal.json');
 let result;
 if(fs.existsSync(journalFile)){const j=readJSON(journalFile);if(j.status==='completed'&&j.packageHash===digest(prepared.pkg)&&j.afterFingerprint===fingerprint(directory))result={applied:true,afterFingerprint:j.afterFingerprint,recovered:true};}
 result??=prepared.receipt.acceptedClaimIds.length?integrateDossier(prepared.pkg,prepared.job,context,prepared.receipt,{apply:true}):{applied:false,acceptedClaims:0};
 const integrated=prepared.pkg.claims.filter(c=>prepared.receipt.acceptedClaimIds.includes(c.id));
 ledger.integrations.push({entityId:original.entityId,period:original.period,packageId:original.id,originalPackageHash:digest(original),integratedClaimIds:integrated.map(c=>c.id),newResearchClaims:integrated.filter(c=>c.origin.kind==='new-research').length,
  reusedEvidenceClaims:integrated.filter(c=>c.origin.kind!=='new-research').length,claimsByCategory:Object.fromEntries([...new Set(integrated.map(c=>c.category))].map(f=>[f,integrated.filter(c=>c.category===f).length])),
  held:Object.values(readJSON(reviewFile).decisions).filter(d=>d==='held').length,rejected:Object.values(readJSON(reviewFile).decisions).filter(d=>d==='rejected').length,skippedDuplicates:prepared.skipped,validationChecks:prepared.validation.checks.length,contextChange:prepared.contextChange,result});
 saveJSON(ledgerFile,ledger);saveJSON(path.join(directory,'research/scale-01/integrated',original.entityId+'-'+digest(original.period).slice(0,8)+'.json'),prepared);
 return {entityId:original.entityId,integrated:integrated.length,newResearch:integrated.filter(c=>c.origin.kind==='new-research').length,duplicates:Object.keys(prepared.skipped).length};
}
if(isCLI(import.meta.url)){const[p,j,r]=process.argv.slice(2);console.log(JSON.stringify(integrateReviewedFiles(p,j,r),null,2));}
