import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {root,readJSON,productionFingerprint,saveJSON,isCLI} from './research-common.mjs';
import {campaignOptions,campaignArguments} from './research-campaign.mjs';
export function smokePlan(jobs,config) {
  const all=jobs.flatMap(job=>job.package.claims.map(c=>({job,c})));
  if(config.smokeMaxChecks===null)return all;
  const limit=Math.floor((config.smokeMaxChecks-2)/(config.smokeBoundaryChecks===2?5:4)),chosen=[],seen=new Set();
  // Prefer category diversity, then distinct entities; exhaustive chronology belongs to deterministic audit.
  for(const item of all)if(!seen.has(item.c.category)&&chosen.length<limit){chosen.push(item);seen.add(item.c.category);}
  for(const item of all)if(chosen.length<limit&&!chosen.includes(item)&&!chosen.some(x=>x.job.entityId===item.job.entityId))chosen.push(item);
  for(const item of all)if(chosen.length<limit&&!chosen.includes(item))chosen.push(item);
  return chosen;
}
export async function campaignBrowserSmoke(checkpoint,options={}) {
const {directory,config}=campaignOptions(options);
if(!options.final&&(!Number.isInteger(checkpoint)||checkpoint<1||checkpoint>config.checkpointCount))throw Error('Explicit configured checkpoint required');
const selection=readJSON(path.join(directory,'selection.json')).entities.filter(e=>options.final||e.checkpoint===checkpoint),queue=readJSON(path.join(directory,'queue.json'));

const jobs=selection.map(e=>queue.jobs.find(j=>j.entityId===e.entityId)).filter(j=>j.status==='integrated');if(!jobs.length)throw Error('No integrated checkpoint');
const plan=smokePlan(jobs,options.final?{...config,smokeMaxChecks:config.smokeMaxChecks===null?null:40,smokeBoundaryChecks:2}:config);
const manifest=readJSON(path.join(root,'development/coverage/manifest.json'));
const {chromium}=await import(process.env.ATLAS_PLAYWRIGHT_MODULE||new URL('file:///'+path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs').replaceAll('\\','/')).href);
const server=http.createServer((req,res)=>{
 const target=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!target.startsWith(path.resolve(root)+path.sep)){res.writeHead(403).end();return;}
 try{let content=fs.readFileSync(target);if(target.endsWith('app.js'))content=Buffer.from(content.toString()+'\nglobalThis.__atlas={get features(){return currentFeatures;},get requestedYear(){return requestedYear;},get metadata(){return metadata;},goToRequestedYear,selectFeature};');res.writeHead(200,{'Content-Type':target.endsWith('.html')?'text/html':target.endsWith('.js')?'text/javascript':target.endsWith('.css')?'text/css':target.endsWith('.svg')?'image/svg+xml':'application/json'}).end(content);}catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:900},ignoreHTTPSErrors:true}),checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
const check=(label,result)=>{assert.ok(result,label);checks.push(label);console.log('PASS '+label);};
const fields={capital:'capitals',leadership:'leaders',currency:'currencies','historical-flag':'flags'};
try{
 await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.__atlas?.metadata&&window.__atlas.features.length&&document.querySelector('#loading-indicator').hidden,null,{timeout:90000});
 for(const {job,c} of plan){
   const first=Number(c.temporal.from.slice(0,4)),last=Number(c.temporal.until.slice(0,4)),year=Math.floor((first+last)/2),field=fields[c.category]||{government:'governments',politicalStatus:'politicalStatus',description:'descriptions'}[c.metric];
   await page.evaluate(y=>window.__atlas.goToRequestedYear(y),year);await page.waitForFunction(y=>window.__atlas.requestedYear===y&&document.querySelector('#loading-indicator').hidden,year,{timeout:90000});
   let mapId=await page.evaluate(ids=>ids.find(id=>window.__atlas.features.some(f=>f.properties?._stableId===id))||null,job.mapIds);
   if(!mapId){
     const represented=job.mapIds.map(id=>manifest.identities.find(r=>r.stableMapId===id)).find(r=>r?.snapshotYears?.length);assert.ok(represented,'Identity has an independently represented seed snapshot');mapId=represented.stableMapId;
     const seed=represented.snapshotYears[0];await page.evaluate(y=>window.__atlas.goToRequestedYear(y),seed);await page.waitForFunction(y=>window.__atlas.requestedYear===y&&document.querySelector('#loading-indicator').hidden,seed,{timeout:90000});
     await page.evaluate(id=>window.__atlas.selectFeature(id),mapId);await page.waitForSelector('#inspector.is-open');
     await page.evaluate(y=>window.__atlas.goToRequestedYear(y),year);await page.waitForFunction(y=>window.__atlas.requestedYear===y&&document.querySelector('#loading-indicator').hidden,year,{timeout:90000});
   }else{await page.evaluate(id=>window.__atlas.selectFeature(id),mapId);await page.waitForSelector('#inspector.is-open');}
   const body=await page.locator('#dossier-content').textContent();
   if(!body.includes(c.value))console.log(JSON.stringify({claimId:c.id,mapId,year,body,resolved:await page.evaluate(({id,y})=>window.__atlas.metadata.resolve(id,y),{id:mapId,y:year})}));
   if(c.category==='historical-flag'){check(c.id+' dated flag asset',await page.locator('#dossier-content img').evaluateAll((images,asset)=>images.some(img=>img.getAttribute('src')===asset&&img.complete&&img.naturalWidth>0),c.flag.asset));}else check(c.id+' dossier value',body.includes(c.value));
   check(c.id+' requested year',await page.evaluate(y=>window.__atlas.requestedYear===y,year));
   check(c.id+' citation links',await page.locator('.dossier-sources a').evaluateAll(links=>links.length>0&&links.every(a=>a.href.startsWith('https://')&&a.rel.includes('noopener'))));
   for(const boundaryYear of [first-1,last+1].filter(y=>y>=1800&&y<=1960)){
     if(config.smokeMaxChecks!==null&&!options.final&&boundaryYear!==[first-1,last+1].filter(y=>y>=1800&&y<=1960)[checkpoint%2])continue;
     const absent=await page.evaluate(({mapId,y,field,id})=>{const r=window.__atlas.metadata.resolve(mapId,y),records=r.entity?r[field]||[]:(r.identityPeriods||[]).flatMap(p=>p[field]||[]);return !records.some(f=>f.researchProvenance?.claimId===id);},{mapId,y:boundaryYear,field,id:c.id});
     check(c.id+' no leakage in '+boundaryYear,absent);
   }
 }
 check('No runtime errors',errors.length===0);check('Visible version v0.6.1',(await page.content()).includes('v0.6.1'));
 const report={schemaVersion:1,campaign:config.campaign,checkpoint:options.final?'final':checkpoint,productionFingerprint:productionFingerprint(),sampledClaims:plan.map(x=>x.c.id),policy:config.smokeMaxChecks===null?'all integrated claims':'bounded representative smoke; exhaustive dates validated separately',passed:checks.length,checks,errors};saveJSON(path.join(directory,'reports',options.final?'final-browser.json':'checkpoint-'+checkpoint+'-browser.json'),report);return report;
}finally{await browser.close();await new Promise(r=>server.close(r));}

}
if(isCLI(import.meta.url)){const {options,positional}=campaignArguments(process.argv.slice(2));if(positional.length!==1)throw Error('Usage: campaign-browser-smoke.mjs checkpoint|--final [--directory path]');await campaignBrowserSmoke(Number(positional[0]),{...options,final:positional[0]==='--final'});}
