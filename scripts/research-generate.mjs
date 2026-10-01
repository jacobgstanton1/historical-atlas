import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {digest, categories as allowed, readContext} from './research-common.mjs';
import {scan} from './research-scan.mjs';

export function generateJobs(result,context,{limit=10,categories,entityIds}={}) {
  if(!Number.isInteger(limit)||limit<1||limit>100)throw Error('Job limit must be an integer1–100.');
  if(result.productionFingerprint!==context.productionFingerprint)throw Error('Scan fingerprint is stale.');
  if(categories?.some(c=>!allowed.includes(c)))throw Error('Unknown research category.');
  const chooseCategories=categories&&new Set(categories),chooseEntities=entityIds&&new Set(entityIds);
  if(chooseEntities&&[...chooseEntities].some(id=>!context.db.entities.some(e=>e.id===id)))throw Error('Unknown entity selection.');
  const gaps=result.gaps.filter(g=>(!chooseCategories||chooseCategories.has(g.category))&&(!chooseEntities||chooseEntities.has(g.entityId)))
    .sort((a,b)=>b.priority-a.priority||digest(a).localeCompare(digest(b)));
  const seen=new Set(),jobs=[];
  for(const gap of gaps){const key=digest({productionFingerprint:result.productionFingerprint,gap});if(seen.has(key))continue;seen.add(key);
    jobs.push({id:'research-'+key.slice(0,24),...structuredClone(gap),status:'queued',productionFingerprint:result.productionFingerprint,
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
  const range={};if(args.includes('--from'))range.from=Number(value('--from'));if(args.includes('--until'))range.until=Number(value('--until'));
  const result=generateJobs(scan(context,{...range,entityIds:options.entityIds}),context,options),dir=path.join(root,'research/reports');fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'generated-jobs.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({jobs:result.jobs.length,concurrency:result.concurrency}));
}
