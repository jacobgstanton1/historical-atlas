import fs from 'node:fs';
import path from 'node:path';
import {readContext,readJSON,saveJSON,digest,periodBounds,overlap,root,isCLI} from './research-common.mjs';
import {scan} from './research-scan.mjs';
import {scopeId} from './research-generate.mjs';
import {initializeQueue} from './research-queue.mjs';
export const coreFields=['capital','leadership','political-institutional','currency'];
export function campaignOptions(options={}) {
  const directory=path.resolve(root,options.directory||'research/campaign-01');
  if(!directory.startsWith(path.resolve(root,'research')+path.sep))throw Error('Campaign directory must remain inside research');
  const configPath=options.config?path.resolve(root,options.config):path.join(directory,'config.json');
  const configured=fs.existsSync(configPath)?readJSON(configPath):{};
  const config={campaign:'campaign-01',idPrefix:'c01-',maxAssignments:30,expectedAssignments:30,fields:coreFields,baselineCommit:'c1309b4c1c8f24461dcc0ecc9eb64843bdcabbf1',checkpointSize:6,checkpointCount:5,smokeMaxChecks:null,...configured,...options.settings};
  if(!/^[a-z0-9-]+$/.test(config.campaign)||!/^c\d+-$/.test(config.idPrefix)||!Number.isInteger(config.maxAssignments)||config.maxAssignments<1||config.maxAssignments>100||!Array.isArray(config.fields)||!config.fields.length||config.fields.some(f=>![...coreFields,'historical-flag'].includes(f))||new Set(config.fields).size!==config.fields.length||!Number.isInteger(config.checkpointSize)||config.checkpointSize<1||!Number.isInteger(config.checkpointCount)||config.checkpointCount<1||config.smokeMaxChecks!==null&&(!Number.isInteger(config.smokeMaxChecks)||config.smokeMaxChecks<10||config.smokeMaxChecks>50))throw Error('Invalid bounded campaign configuration');
  return {directory,config};
}
export function campaignArguments(args) {
  const options={},positional=[];
  for(let i=0;i<args.length;i++)if(['--directory','--config'].includes(args[i])){const key=args[i].slice(2),value=args[++i];if(!value||value.startsWith('--')||options[key])throw Error('Invalid campaign option');options[key]=value;}else positional.push(args[i]);
  return {options,positional};
}
export function campaignJobs(context,selection,options={}){
  const {config}=campaignOptions(options),fields=config.fields;
  if(!Array.isArray(selection)||!selection.length||selection.length>config.maxAssignments)throw Error('Explicit bounded selection of 1–'+config.maxAssignments+' entities required');
  if(new Set(selection.map(s=>s.entityId)).size!==selection.length)throw Error('Duplicate campaign entity');
  const result=scan(context,{entityIds:selection.map(s=>s.entityId)});
  return selection.map((s,i)=>{
    const entity=context.db.entities.find(e=>e.id===s.entityId),range=periodBounds(s.period);
    if(!entity||range[0]>=range[1]||range[0]<Date.UTC(1800,0,1)||range[1]>Date.UTC(1961,0,1))throw Error('Invalid entity/period');
    const mappings=context.db.mappings.filter(m=>m.entityId===s.entityId),mapIds=[...new Set(mappings.map(m=>m.mapId))].sort();
    const gaps=result.gaps.filter(g=>g.entityId===s.entityId&&fields.includes(g.category)&&overlap(periodBounds(g.period),range));
    if(!mapIds.length||!gaps.length)throw Error('Selection has no mapped identity or core-field gap: '+s.entityId);
    const job={entityId:s.entityId,mapIds,period:s.period,category:'core-state',categories:[...fields],name:entity.names[0].value,
      priority:100-i,reason:s.rationale||'Bounded core-state gaps',existingFacts:Object.fromEntries(['capitals','leaders','governments','politicalStatus','descriptions','currencies',...(fields.includes('historical-flag')?['flags']:[])].map(k=>[k,entity[k]||[]])),
      mappings,sourceIds:[...new Set(Object.values(entity).filter(Array.isArray).flat().flatMap(f=>f.sourceIds||[]))].sort(),
      cautions:[...new Set(gaps.flatMap(g=>g.cautions||[]))],gapOpportunities:gaps.length,productionFingerprint:context.productionFingerprint,
      prohibitedAssumptions:['No historical continuity, sovereignty or succession from geometry, names, SUBJECTO or PARTOF.','No observation interpolation.','Preserve existing sourced facts and identity boundaries.','Do not edit production or Git.'],
      expectedSchema:'research/schemas/research-package.schema.json',provenance:{campaign:config.campaign,selectionIndex:i,selectionDigest:digest(s),scanSchemaVersion:result.schemaVersion}};
    job.scopeId=scopeId(job);job.id=config.idPrefix+digest({scope:job.scopeId,productionFingerprint:context.productionFingerprint}).slice(0,24);return job;
  });
}
if(isCLI(import.meta.url)){
  const {options,positional}=campaignArguments(process.argv.slice(2));
  if(positional.length!==1||positional[0]!=='init')throw Error('Usage: research-campaign.mjs init [--directory research/campaign-02] [--config path]');
  const {directory,config}=campaignOptions(options),selection=readJSON(path.join(directory,'selection.json'));
  if(fs.existsSync(path.join(directory,'queue.json')))throw Error('Campaign queue already exists; preserve existing state');
  const context=readContext(),jobs=campaignJobs(context,Array.isArray(selection)?selection:selection.entities,options);
  initializeQueue(path.join(directory,'queue.json'),jobs,{concurrency:3});
  saveJSON(path.join(directory,'jobs.json'),{schemaVersion:1,productionFingerprint:context.productionFingerprint,jobs});
  saveJSON(path.join(directory,'before.json'),{schemaVersion:1,productionFingerprint:context.productionFingerprint,metrics:scan(context,{entityIds:jobs.map(j=>j.entityId)}).metrics});
  console.log(JSON.stringify({jobs:jobs.length,naiveCategoryYearOpportunities:jobs.reduce((n,j)=>n+j.gapOpportunities,0)}));
}
