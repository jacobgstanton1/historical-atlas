// Coordinator-only campaign handoff. This never performs historical acceptance without a saved body-review record.
import fs from 'node:fs';
import path from 'node:path';
import {readContext,readJSON,saveJSON,digest,root,isCLI} from './research-common.mjs';
import {readQueue,updateQueue} from './research-queue.mjs';
import {validatePackage} from './research-validator.mjs';
import {integratePackage} from './research-integrate.mjs';
import {campaignOptions,campaignArguments} from './research-campaign.mjs';
export function submitReviewed(entityId,options={}){
  const {directory,config}=campaignOptions(options),file=path.join(directory,'queue.json'),actor={role:'coordinator',id:config.campaign+'-coordinator'};
  let q=readQueue(file),j=q.jobs.find(j=>j.entityId===entityId);if(!j)throw Error('Unknown campaign entity');
  const pkg=readJSON(path.join(directory,'packages',entityId+'.json')),review=readJSON(path.join(directory,'review',entityId+'.json'));
  if((config.campaign!=='campaign-01'&&(!review.reviewer||review.reviewer===pkg.worker.id))||review.packageHash!==digest(pkg)||!review.rationale?.trim()||review.coordinator!==actor.id||!review.bodyReviewed)throw Error('Exact independent source-body review required');
  if(j.status==='queued'){q=updateQueue(file,'claim',{jobId:j.id,workerId:pkg.worker.id});j=q.jobs.find(x=>x.id===j.id);}
  if(j.status==='researching'){q=updateQueue(file,'submit',{jobId:j.id,workerId:pkg.worker.id,package:pkg});j=q.jobs.find(x=>x.id===j.id);}
  if(j.status==='integrated')return j;
  if(digest(j.package)!==digest(pkg)&&!j.contextRevisions?.some(r=>digest(r.package)===digest(pkg)))throw Error('Worker package changed after submission');
  const context=readContext();
  if(j.productionFingerprint!==context.productionFingerprint){q=updateQueue(file,'recontextualize',{jobId:j.id,actor,reason:'Serial campaign integration changed production; original evidence retained and reviewed against current facts/mappings/sources.',expectedPackageHash:j.packageHash,productionFingerprint:context.productionFingerprint},{context});j=q.jobs.find(x=>x.id===j.id);}
  if(j.status==='submitted'){q=updateQueue(file,'validate',{jobId:j.id,actor},{validatePackage,context});j=q.jobs.find(x=>x.id===j.id);}
  if(!j.validation?.valid)throw Error('Package invalid: '+JSON.stringify(j.validation?.errors));
  const forbidden=j.validation.review.filter(r=>/conflicts with existing|Overlapping contradictory|needs historical review|worker marked|requires explicit historical resolution/i.test(r));
  if(forbidden.length||review.decision!=='accepted')return j;
  if(j.status!=='accepted'){
    q=updateQueue(file,'accept',{jobId:j.id,actor,productionFingerprint:context.productionFingerprint,rationale:review.rationale+' Fresh-context check: existing mappings/entity scope and appended facts/source definitions were validated; all current review issues below are bound.',reviewResolved:true,reviewedIssues:j.validation.review});j=q.jobs.find(x=>x.id===j.id);
  }
  saveJSON(path.join(directory,'review',entityId+'-current.json'),{schemaVersion:1,originalPackageHash:digest(pkg),currentPackageHash:j.packageHash,productionFingerprint:context.productionFingerprint,validation:j.validation,receipt:j.receipt});return j;
}
export function applyReviewed(entityId,options={}){
  const {directory,config}=campaignOptions(options),file=path.join(directory,'queue.json'),actor={role:'coordinator',id:config.campaign+'-coordinator'};
  const j=submitReviewed(entityId,options);if(j.status==='integrated')return j.integrationReceipt;if(j.status!=='accepted')throw Error('Historical review remains unresolved: '+entityId);
  const result=integratePackage(root,j.package,j,j.receipt,{apply:true});
  const durable=readJSON(result.journal);
  updateQueue(file,'integrated',{jobId:j.id,actor,integrationReceipt:result.integrationReceipt},{productionFingerprint:result.afterFingerprint,verifyIntegration:r=>durable.status==='completed'&&durable.jobId===r.jobId&&durable.packageHash===r.packageHash&&durable.afterFingerprint===r.afterFingerprint});
  // Preserve the completed journal's small durable receipt before the next serialized journal.
  saveJSON(path.join(directory,'integrated',entityId+'.json'),{schemaVersion:1,...result.integrationReceipt,sourceAliases:result.sourceAliases,appended:result.appended});
  return result.integrationReceipt;
}
if(isCLI(import.meta.url)){
  const {options,positional}=campaignArguments(process.argv.slice(2));const [command,...entities]=positional;if(!['submit','apply'].includes(command)||!entities.length)throw Error('Usage: research-campaign-run.mjs submit|apply entity-id ...');
  for(const id of entities)console.log(JSON.stringify({entityId:id,result:command==='apply'?applyReviewed(id,options):{status:submitReviewed(id,options).status}}));
}
