import fs from 'node:fs';
import path from 'node:path';
import {saveJSON,readJSON} from '../../../scripts/research-common.mjs';
import {assetHash,inspectFlagAsset} from '../../../scripts/research-flags.mjs';
const base='research/completion-02/flags',records=readJSON(base+'/prepared-records.json').records,results=[];
const state=base+'/asset-validation.json';
let permanentHolds=new Map();
if(fs.existsSync(state)){
 const previous=readJSON(state),retryAt=previous.status==='rate-limited'?(previous.retryNotBefore?Date.parse(previous.retryNotBefore):fs.statSync(state).mtimeMs+600000):0;
 if(Date.now()<retryAt)throw Error('Honor Commons cooldown; resume after '+new Date(retryAt).toISOString());
 permanentHolds=new Map(previous.results.filter(r=>r.errors?.includes('Asset size outside limit')).map(r=>[r.assetId,r]));
}
for(const r of [...new Map(records.map(r=>[r.assetId,r])).values()]){
 if(permanentHolds.has(r.assetId)){results.push(permanentHolds.get(r.assetId));continue;}
 try{
  const url=new URL(r.info.url);if(url.protocol!=='https:'||url.hostname!=='upload.wikimedia.org')throw Error('Unapproved download host');
  let bytes;
  if(fs.existsSync(r.staged))bytes=fs.readFileSync(r.staged);
  else {
   await new Promise(resolve=>setTimeout(resolve,5000));
   const response=await fetch(url,{redirect:'error',headers:{'User-Agent':'HistoricalAtlas/1.0 (dated flag asset ingestion)'},signal:AbortSignal.timeout(30000)});
   if(response.status===429){const retrySeconds=Math.max(600,Number(response.headers.get('retry-after'))||600);results.push({assetId:r.assetId,errors:['HTTP 429; acquisition paused, pending files preserved'],retryAfter:response.headers.get('retry-after'),acceptedTechnical:false});saveJSON(state,{results,productionInstalled:false,status:'rate-limited',rateLimitedAt:new Date().toISOString(),retryNotBefore:new Date(Date.now()+retrySeconds*1000).toISOString(),remainingAssets:[...new Set(records.map(r=>r.assetId))].filter(id=>!results.some(r=>r.assetId===id&&r.acceptedTechnical))});break;}
   if(!response.ok)throw Error('HTTP '+response.status);bytes=Buffer.from(await response.arrayBuffer());if(!bytes.length||bytes.length>1024*1024)throw Error('Asset size outside limit');fs.mkdirSync(path.dirname(r.staged),{recursive:true});fs.writeFileSync(r.staged,bytes);
  }
  const asset='./assets/flags/'+r.assetId+'.svg',directory=path.resolve(base,'staging'),destination=path.resolve(directory,asset);
  fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,bytes);
  const errors=inspectFlagAsset(asset,directory,assetHash(bytes));
  results.push({assetId:r.assetId,sourceUrl:r.info.url,staged:r.staged,sha256:assetHash(bytes),license:r.license,errors,acceptedTechnical:errors.length===0});
 }catch(e){results.push({assetId:r.assetId,errors:[e.message],acceptedTechnical:false});}
 saveJSON(base+'/asset-validation.json',{results,productionInstalled:false});
}
console.log(JSON.stringify({processedAssets:results.length,safe:results.filter(r=>r.acceptedTechnical).length,held:results.filter(r=>!r.acceptedTechnical)}));
