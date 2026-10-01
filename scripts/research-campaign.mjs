import fs from 'node:fs';
import path from 'node:path';
import {readContext,readJSON,saveJSON,digest,periodBounds,overlap,root,isCLI} from './research-common.mjs';
import {scan} from './research-scan.mjs';
import {scopeId} from './research-generate.mjs';
import {initializeQueue} from './research-queue.mjs';
export const coreFields=['capital','leadership','political-institutional','currency'];
export function campaignJobs(context,selection){
  if(!Array.isArray(selection)||!selection.length||selection.length>30)throw Error('Explicit bounded selection of 1–30 entities required');
  if(new Set(selection.map(s=>s.entityId)).size!==selection.length)throw Error('Duplicate campaign entity');
  const result=scan(context,{entityIds:selection.map(s=>s.entityId)});
  return selection.map((s,i)=>{
    const entity=context.db.entities.find(e=>e.id===s.entityId),range=periodBounds(s.period);
    if(!entity||range[0]>=range[1]||range[0]<Date.UTC(1800,0,1)||range[1]>Date.UTC(1961,0,1))throw Error('Invalid entity/period');
    const mappings=context.db.mappings.filter(m=>m.entityId===s.entityId),mapIds=[...new Set(mappings.map(m=>m.mapId))].sort();
    const gaps=result.gaps.filter(g=>g.entityId===s.entityId&&coreFields.includes(g.category)&&overlap(periodBounds(g.period),range));
    if(!mapIds.length||!gaps.length)throw Error('Selection has no mapped identity or core-field gap: '+s.entityId);
    const job={entityId:s.entityId,mapIds,period:s.period,category:'core-state',categories:[...coreFields],name:entity.names[0].value,
      priority:100-i,reason:s.rationale||'Bounded core-state gaps',existingFacts:Object.fromEntries(['capitals','leaders','governments','politicalStatus','descriptions','currencies'].map(k=>[k,entity[k]||[]])),
      mappings,sourceIds:[...new Set(Object.values(entity).filter(Array.isArray).flat().flatMap(f=>f.sourceIds||[]))].sort(),
      cautions:[...new Set(gaps.flatMap(g=>g.cautions||[]))],gapOpportunities:gaps.length,productionFingerprint:context.productionFingerprint,
      prohibitedAssumptions:['No historical continuity, sovereignty or succession from geometry, names, SUBJECTO or PARTOF.','No observation interpolation.','Preserve existing sourced facts and identity boundaries.','Do not edit production or Git.'],
      expectedSchema:'research/schemas/research-package.schema.json',provenance:{campaign:'campaign-01',selectionIndex:i,selectionDigest:digest(s),scanSchemaVersion:result.schemaVersion}};
    job.scopeId=scopeId(job);job.id='c01-'+digest({scope:job.scopeId,productionFingerprint:context.productionFingerprint}).slice(0,24);return job;
  });
}
if(isCLI(import.meta.url)){
  if(process.argv[2]!=='init')throw Error('Usage: research-campaign.mjs init');
  const directory=path.join(root,'research/campaign-01'),selection=readJSON(path.join(directory,'selection.json'));
  if(fs.existsSync(path.join(directory,'queue.json')))throw Error('Campaign queue already exists; preserve existing state');
  const context=readContext(),jobs=campaignJobs(context,Array.isArray(selection)?selection:selection.entities);
  initializeQueue(path.join(directory,'queue.json'),jobs,{concurrency:3});
  saveJSON(path.join(directory,'jobs.json'),{schemaVersion:1,productionFingerprint:context.productionFingerprint,jobs});
  saveJSON(path.join(directory,'before.json'),{schemaVersion:1,productionFingerprint:context.productionFingerprint,metrics:scan(context,{entityIds:jobs.map(j=>j.entityId)}).metrics});
  console.log(JSON.stringify({jobs:jobs.length,naiveCategoryYearOpportunities:jobs.reduce((n,j)=>n+j.gapOpportunities,0)}));
}
