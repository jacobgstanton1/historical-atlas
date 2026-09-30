import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
export const root=fileURLToPath(new URL('../',import.meta.url));
export const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const cache=path.join(os.tmpdir(),'historical-atlas-coverage-cache');
async function cached(url,expected){
 await fs.mkdir(cache,{recursive:true});const file=path.join(cache,sha(url));
 try {const b=await fs.readFile(file);if(!expected||sha(b)===expected)return b;} catch {}
 const response=await fetch(url,{signal:AbortSignal.timeout(120000)});
 if(!response.ok)throw Error('Coverage input '+response.status+': '+url);
 const bytes=Buffer.from(await response.arrayBuffer());
 if(expected&&sha(bytes)!==expected)throw Error('Input hash changed: '+url+'. Use an explicit --refresh-inputs audit.');
 await fs.writeFile(file,bytes);return bytes;
}
// Evaluate the repository's complete production pipeline unchanged except that
// its pinned CDN dependency is made importable in Node. No identity logic is copied.
export async function productionPipeline(){
 const resolved=new Map();
 async function moduleURL(url){
  if(resolved.has(url))return resolved.get(url);
  if(!/^https:\/\/cdn\.jsdelivr\.net\/npm\/(?:d3-geo@3\.1\.1|d3-array@3\.2\.4|internmap@2\.0\.3)\/\+esm$/.test(url))throw Error('Unexpected development import: '+url);
  let code=(await cached(url)).toString();
  const matches=[...code.matchAll(/\b(?:from|import)\s*["']([^"']+)["']/g)];
  for(const m of matches){const dependency=await moduleURL(new URL(m[1],url).href);code=code.replace(m[0],m[0].replace(m[1],dependency));}
  const data='data:text/javascript;base64,'+Buffer.from(code).toString('base64');resolved.set(url,data);return data;
 }
 const source=await fs.readFile(path.join(root,'data-pipeline.js'),'utf8');
 const url='https://cdn.jsdelivr.net/npm/d3-geo@3.1.1/+esm';
 const pipeline=await import('data:text/javascript;base64,'+Buffer.from(source.replace(url,await moduleURL(url))).toString('base64'));
 const geo=await import(await moduleURL(url));return {pipeline,geo};
}
export async function loadInputs({refresh=false}={}){
 const app=await fs.readFile(path.join(root,'app.js'),'utf8');
 const block=app.match(/const SNAPSHOTS = \[([\s\S]*?)\];/);if(!block)throw Error('Snapshot configuration not found');
 const snapshots=[...block[1].matchAll(/\{\s*year:\s*(\d+),\s*file:\s*'([^']+)'\s*\}/g)].map(m=>({year:Number(m[1]),file:m[2]}));
 if(!snapshots.length)throw Error('No configured snapshots');
 const base=app.match(/const HISTORICAL_BASE = '([^']+)'/)[1];
 const lockPath=path.join(root,'development/coverage/inputs.lock.json');
 let lock;try{lock=JSON.parse(await fs.readFile(lockPath));}catch{}
 if(!lock||refresh){
  const r=await fetch('https://api.github.com/repos/aourednik/historical-basemaps/commits/master',{signal:AbortSignal.timeout(60000)});
  if(!r.ok)throw Error('Unable to pin upstream revision: '+r.status);
  lock={schemaVersion:1,upstreamRevision:(await r.json()).sha,productionBase:base,snapshots:[]};
 }else if(lock.productionBase!==base)throw Error('Production URL changed; refresh the input audit explicitly');
 const loaded=[];
 for(const snapshot of snapshots){
  const local=path.join(root,'data',snapshot.file);let bytes,record;
  try {bytes=await fs.readFile(local);record={...snapshot,origin:'local',url:'data/'+snapshot.file,sha256:sha(bytes)};}catch(error){if(error.code!=='ENOENT')throw error;}
  if(!bytes){
   const previous=lock.snapshots.find(s=>s.year===snapshot.year&&s.file===snapshot.file);
   const url=previous?.url||base.replace('@master/','@'+lock.upstreamRevision+'/')+snapshot.file;
   bytes=await cached(url,refresh?undefined:previous?.sha256);
   record={...snapshot,origin:'remote',url,productionUrl:base+snapshot.file,sha256:sha(bytes)};
   // New pins must reproduce the current production CDN response, not assume
   // that @master and the GitHub HEAD contain identical data.
   if(!previous||refresh){const current=Buffer.from(await (await fetch(base+snapshot.file,{signal:AbortSignal.timeout(120000)})).arrayBuffer());
    if(sha(current)!==record.sha256)throw Error('Production CDN differs from pinned revision for '+snapshot.file);}
  }
  const old=lock.snapshots.find(s=>s.year===snapshot.year);
  if(old&&!refresh&&(old.origin!==record.origin||old.sha256!==record.sha256))throw Error('Snapshot input changed; use --refresh-inputs');
  const collection=JSON.parse(bytes.toString());if(collection.type!=='FeatureCollection'||!Array.isArray(collection.features))throw Error('Invalid snapshot '+snapshot.year);
  loaded.push({record,collection});
  console.log('Loaded',snapshot.year,collection.features.length,'source features');
 }
 lock.snapshots=loaded.map(x=>x.record);
 return {loaded,lock,lockPath,app};
}
