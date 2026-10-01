import fs from 'node:fs/promises';
import path from 'node:path';
import {root,loadInputs,productionPipeline,sha} from './coverage-inputs.mjs';
import {buildCoverage} from './coverage-model.mjs';
import {classifyCoverage,combinedReport} from './classification.mjs';
const args=new Set(process.argv.slice(2));
if([...args].some(a=>!['--check','--refresh-inputs'].includes(a))||args.has('--check')&&args.has('--refresh-inputs'))throw Error('Usage: node scripts/coverage.mjs [--check | --refresh-inputs]');
const {loaded,lock,lockPath}=await loadInputs({refresh:args.has('--refresh-inputs')});
const {pipeline,geo}=await productionPipeline();
const snapshots=loaded.map(({record,collection})=>{
 const prepared=pipeline.prepareCollection(collection,record.year);
 return {year:record.year,features:prepared.features,centroids:new Map(prepared.features.map(f=>[f.id,geo.geoCentroid(f)]))};
});
const read=async p=>JSON.parse(await fs.readFile(path.join(root,p)));
const textHash=async p=>sha((await fs.readFile(path.join(root,p),'utf8')).replace(/\r\n/g,'\n'));
const [db,sources,plan]=await Promise.all(['data/historical-entities.json','data/historical-sources.json','development/coverage/research-plan.json'].map(read));
const classification=await read('development/coverage/classification-plan.json');
const manifest=classifyCoverage(buildCoverage(snapshots,db,sources,plan),classification,plan);
manifest.inputs={upstreamRevision:lock.upstreamRevision,snapshots:lock.snapshots,pipelineSha256:await textHash('data-pipeline.js'),resolverSha256:await textHash('historical-metadata.js'),metadataSha256:await textHash('data/historical-entities.json'),sourcesSha256:await textHash('data/historical-sources.json'),planSha256:await textHash('development/coverage/research-plan.json'),classificationPlanSha256:await textHash('development/coverage/classification-plan.json'),classificationModuleSha256:await textHash('scripts/classification.mjs')};
const outputs=[[lockPath,JSON.stringify(lock,null,2)+'\n'],[path.join(root,'development/coverage/manifest.json'),JSON.stringify(manifest,null,2)+'\n'],[path.join(root,'development/coverage/REPORT.md'),combinedReport(manifest,lock)]];
if(args.has('--check')){
 for(const [file,content]of outputs)if((await fs.readFile(file,'utf8')).replace(/\r\n/g,'\n')!==content)throw Error('Stale generated output: '+file);
 console.log('Reproducibility check passed.');
}else{for(const [file,content]of outputs)await fs.writeFile(file,content);}
console.log(JSON.stringify(manifest.summary,null,2));console.table(manifest.bySnapshot);
console.log('Political classification',manifest.classification.totals);console.log('Political coverage',manifest.classification.politicalCoverage);console.table(manifest.classification.bySnapshot.map(s=>({year:s.year,raw:s.rawIdentities,...s.classifications,political:s.politicalCandidates,covered:s.politicalCovered,uncovered:s.politicalUncovered,percentage:s.politicalPercentage})));console.log('Phase 2 batches',manifest.phase2Batches.length,'Reviewed:',Object.keys(plan.batchReviews||{}).join(', '));
