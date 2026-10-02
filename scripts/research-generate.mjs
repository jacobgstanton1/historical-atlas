import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {digest, categories as allowed, readContext,readJSON} from './research-common.mjs';
import {scan} from './research-scan.mjs';
import {scanSnapshots,readSnapshotConfig} from './research-snapshot-scan.mjs';
import {generateDossierJob,fields,temporalBounds} from './research-comprehensive.mjs';

// One bounded dossier assignment can investigate several real snapshot gaps.
// Target snapshots are viewing contexts, never replacement fact dates.
export function generateSnapshotJobs(result,context,{limit=10,entityIds,categories,existingJobs=[]}={}) {
  if(result.model!=='snapshot-entity-category'||result.productionFingerprint!==context.productionFingerprint)throw Error('Snapshot scan is stale or has the wrong model.');
  if(!Number.isInteger(limit)||limit<1||limit>100)throw Error('Job limit must be an integer1–100.');
  if(categories?.some(c=>!fields.includes(c)))throw Error('Unknown dossier category.');
  const selected=entityIds&&new Set(entityIds),chosen=categories&&new Set(categories),groups=new Map();
  if(selected&&[...selected].some(id=>!context.db.entities.some(e=>e.id===id)))throw Error('Unknown entity selection.');
  for(const gap of result.gaps||[]){
    if(!gap.entityId||!fields.includes(gap.category)||selected&&!selected.has(gap.entityId)||chosen&&!chosen.has(gap.category))continue;
    if(existingJobs.some(j=>{
      if(j.entityId!==gap.entityId||!(j.categories||[j.category]).includes(gap.category)||['rejected','validation-failed'].includes(j.status))return false;
      if(j.targetSnapshots)return j.targetSnapshots.includes(Number(gap.period.from));
      try{const a=temporalBounds({...j.period,kind:'interval'}),b=temporalBounds({...gap.period,kind:'interval'});return a.lo<=b.lo&&a.hi>=b.hi;}catch{return false;}
    }))continue;
    if(!groups.has(gap.entityId))groups.set(gap.entityId,[]);
    groups.get(gap.entityId).push(gap);
  }
  const ranked=[...groups].map(([entityId,gaps])=>({entityId,gaps,priority:Math.max(...gaps.map(g=>g.priority)),targetSnapshots:[...new Set(gaps.map(g=>Number(g.period.from)))].sort((a,b)=>a-b)})).sort((a,b)=>b.priority-a.priority||b.targetSnapshots.length-a.targetSnapshots.length||a.entityId.localeCompare(b.entityId));
  const year=y=>y<0?'-'+String(-y).padStart(6,'0'):y>9999?'+'+String(y).padStart(6,'0'):String(y).padStart(4,'0');
  const jobs=ranked.slice(0,limit).map(g=>{
    const period={from:year(g.targetSnapshots[0]),until:year(g.targetSnapshots.at(-1))},base=generateDossierJob(g.entityId,period,context),researchCategories=[...new Set(g.gaps.map(x=>x.category))].sort();
    const scope={entityId:g.entityId,period,targetSnapshots:g.targetSnapshots,researchCategories};
    return {...base,id:'snapshot-dossier-'+digest(scope).slice(0,24),targetSnapshots:g.targetSnapshots,researchCategories,priority:g.priority,
      name:context.db.entities.find(e=>e.id===g.entityId).canonicalName||g.entityId,
      existingSourceIds:[...new Set(g.gaps.flatMap(x=>x.sourceIds||[]))].sort(),
      snapshotGaps:[...g.gaps].sort((a,b)=>Number(a.period.from)-Number(b.period.from)||a.category.localeCompare(b.category)).map(x=>({snapshotYear:Number(x.period.from),category:x.category,reason:x.reason,cautions:x.cautions})),
      cautions:['Investigate dated facts once for reuse across target snapshots; no annual completeness quota.','The bounded assignment does not assert continuous political identity, observation geography or leadership between snapshots.','Observation/event dates and uncertain transition boundaries must remain explicit.'],
      expectedSchema:'research/comprehensive/schemas/dossier.schema.json',provenance:{model:result.model,snapshotConfigurationHash:digest(result.snapshots),scopeHash:digest(scope),productionFingerprint:result.productionFingerprint}};
  });
  return {schemaVersion:2,model:result.model,concurrency:3,integrationConcurrency:1,productionFingerprint:result.productionFingerprint,jobs};
}

export const scopeId=job=>'scope-'+digest({entityId:job.entityId,mapIds:[...job.mapIds].sort(),period:job.period,category:job.category}).slice(0,24);
export function generateJobs(result,context,{limit=10,categories,entityIds,existingJobs=[]}={}) {
  if(!Number.isInteger(limit)||limit<1||limit>100)throw Error('Job limit must be an integer1–100.');
  if(result.productionFingerprint!==context.productionFingerprint)throw Error('Scan fingerprint is stale.');
  if(categories?.some(c=>!allowed.includes(c)))throw Error('Unknown research category.');
  const chooseCategories=categories&&new Set(categories),chooseEntities=entityIds&&new Set(entityIds);
  if(chooseEntities&&[...chooseEntities].some(id=>!context.db.entities.some(e=>e.id===id)))throw Error('Unknown entity selection.');
  const retained=new Set(existingJobs.map(scopeId));
  const gaps=result.gaps.filter(g=>!retained.has(scopeId(g))&&(!chooseCategories||chooseCategories.has(g.category))&&(!chooseEntities||chooseEntities.has(g.entityId)))
    .sort((a,b)=>b.priority-a.priority||digest(a).localeCompare(digest(b)));
  const seen=new Set(),jobs=[];
  for(const gap of gaps){const key=digest({productionFingerprint:result.productionFingerprint,gap});if(seen.has(key))continue;seen.add(key);
    jobs.push({id:'research-'+key.slice(0,24),scopeId:scopeId(gap),...structuredClone(gap),status:'queued',productionFingerprint:result.productionFingerprint,
      expectedSchema:'research/schemas/research-package.schema.json',prohibitedAssumptions:['No modern historical fallback.','No geometry-derived sovereignty, succession or borders.','No population/economic interpolation or guessed observation dates.','No automatic community/people political dossiers.','No broad tenure or annual coverage from a single-day attestation.','Do not change production files or Git state.'],
      provenance:{scanSchemaVersion:result.schemaVersion,scanRange:result.range,selection:{limit,categories:categories?[...categories].sort():null,entityIds:entityIds?[...entityIds].sort():null},gapFingerprint:digest(gap)}});
    if(jobs.length===limit)break;
  }
  return{schemaVersion:1,concurrency:3,productionFingerprint:result.productionFingerprint,jobs};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=process.argv.slice(2),value=k=>args[args.indexOf(k)+1];
  if(!args.includes('--limit'))throw Error('Explicit --limit is required; global job creation is disabled.');
  const root=path.resolve(fileURLToPath(new URL('../',import.meta.url))),context=readContext(root),options={limit:Number(value('--limit'))};
  if(args.includes('--categories'))options.categories=value('--categories').split(',');if(args.includes('--entities'))options.entityIds=value('--entities').split(',');
  const queuePath=args.includes('--queue')?value('--queue'):['research/jobs/queue.json','research/pilot/queue.json'].map(p=>path.join(root,p)).find(p=>fs.existsSync(p));
  if(queuePath)options.existingJobs=readJSON(queuePath).jobs;
  const range={};if(args.includes('--from'))range.from=Number(value('--from'));if(args.includes('--until'))range.until=Number(value('--until'));
  const annual=args.includes('--annual-integrity');
  const result=annual?generateJobs(scan(context,{...range,entityIds:options.entityIds}),context,options):generateSnapshotJobs(scanSnapshots(context,{entityIds:options.entityIds,snapshots:readSnapshotConfig(root).filter(s=>(range.from===undefined||s.year>=range.from)&&(range.until===undefined||s.year<=range.until))}),context,options),dir=path.join(root,'research/reports');fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'generated-jobs.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({jobs:result.jobs.length,concurrency:result.concurrency}));
}
