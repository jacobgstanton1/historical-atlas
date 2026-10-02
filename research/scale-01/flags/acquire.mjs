import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const base=path.dirname(fileURLToPath(import.meta.url));
export const digest=x=>crypto.createHash('sha256').update(x).digest('hex');
export function destination(relative){
  if(!/^(?:cache|staged-assets)\/[a-zA-Z0-9_.-]+$/.test(relative))throw Error('Isolated acquisition destination required');
  return path.join(base,relative);
}
export async function acquire(manifest,transport=fetch){
  const records=[];
  for(const row of manifest.resources){
    const file=destination(row.path),url=new URL(row.url);
    if(url.protocol!=='https:'||!manifest.allowedHosts.includes(url.hostname))throw Error('Unapproved source host');
    let bytes;const reused=fs.existsSync(file);
    try{
    if(reused)bytes=fs.readFileSync(file);
    else{
      const response=await transport(url,{redirect:'error',signal:AbortSignal.timeout(30000)});
      if(!response.ok)throw Error('Source HTTP '+response.status+': '+row.id);
      bytes=Buffer.from(await response.arrayBuffer());
      if(!bytes.length||bytes.length>10*1024*1024)throw Error('Source size out of bounds');
      if(row.sha256&&digest(bytes)!==row.sha256)throw Error('Source hash mismatch: '+row.id);
      fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes);
    }
    if(row.sha256&&digest(bytes)!==row.sha256)throw Error('Preserved source hash mismatch: '+row.id);
    records.push({...row,sha256:digest(bytes),bytes:bytes.length,reused,status:'acquired'});
    }catch(error){records.push({...row,status:'acquisition-failed',error:error.message});}
  }
  return {schemaVersion:1,resources:records,notice:'Acquisition is not historical acceptance. Sources and SVG remain untrusted; no production installation.'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const manifest=JSON.parse(fs.readFileSync(path.join(base,'acquisition.json'),'utf8'));
  const result=await acquire(manifest);fs.writeFileSync(path.join(base,'acquisition-ledger.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({resources:result.resources.length,stagingOnly:true}));
}
