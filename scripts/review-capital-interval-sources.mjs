// Retrieve only the unique source URLs explicitly supplied in the V2 return.
import fs from 'node:fs';
import crypto from 'node:crypto';
const dir='research/external-capital-interval-wave-01';
const sources=JSON.parse(fs.readFileSync(dir+'/source-manifest.json','utf8'));
fs.mkdirSync(dir+'/cache',{recursive:true});
const results=[];let next=0;
await Promise.all(Array.from({length:5},async()=>{
 while(next<sources.length){const i=next++,s=sources[i],prefix=dir+'/cache/'+String(i).padStart(2,'0');
  if(fs.existsSync(prefix+'.json')){results.push(JSON.parse(fs.readFileSync(prefix+'.json','utf8')));continue;}
  try{const r=await fetch(s.url,{headers:{'User-Agent':'HistoricalAtlas source verification (bounded supplied-URL review)'},signal:AbortSignal.timeout(25000)}),bytes=Buffer.from(await r.arrayBuffer());
   const type=r.headers.get('content-type')||'',pdf=type.includes('pdf')||bytes.subarray(0,4).toString()==='%PDF';fs.writeFileSync(prefix+(pdf?'.pdf':'.html'),bytes);
   const record={i,url:s.url,finalUrl:r.url,httpStatus:r.status,contentType:type,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),pdf};
   if(!pdf){let text=bytes.toString('utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<(?:p|div|br|li|h[1-6])\b[^>]*>/gi,'\n').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/[ \t]+/g,' ').replace(/\n\s*\n/g,'\n').trim();fs.writeFileSync(prefix+'.txt',text,'utf8');record.textLength=text.length;}
   fs.writeFileSync(prefix+'.json',JSON.stringify(record,null,2)+'\n');results.push(record);
  }catch(error){const record={i,url:s.url,error:error.message};fs.writeFileSync(prefix+'.json',JSON.stringify(record,null,2)+'\n');results.push(record);}
 }
}));
results.sort((a,b)=>a.i-b.i);fs.writeFileSync(dir+'/source-retrieval.json',JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results.map(r=>({i:r.i,status:r.httpStatus,length:r.textLength,pdf:r.pdf,error:r.error})),null,2));
