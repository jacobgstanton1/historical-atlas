import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {root,readJSON,productionFingerprint,saveJSON} from './research-common.mjs';
const checkpoint=Number(process.argv[2]);if(!Number.isInteger(checkpoint)||checkpoint<1||checkpoint>5)throw Error('Explicit checkpoint 1–5 required');
const selection=readJSON(path.join(root,'research/campaign-01/selection.json')).entities.filter(e=>e.checkpoint===checkpoint),queue=readJSON(path.join(root,'research/campaign-01/queue.json'));
const jobs=selection.map(e=>queue.jobs.find(j=>j.entityId===e.entityId)).filter(j=>j.status==='integrated');if(!jobs.length)throw Error('No integrated checkpoint');
const manifest=readJSON(path.join(root,'development/coverage/manifest.json'));
const {chromium}=await import(process.env.ATLAS_PLAYWRIGHT_MODULE||new URL('file:///'+path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs').replaceAll('\\','/')).href);
const server=http.createServer((req,res)=>{
 const target=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!target.startsWith(path.resolve(root)+path.sep)){res.writeHead(403).end();return;}
 try{let content=fs.readFileSync(target);if(target.endsWith('app.js'))content=Buffer.from(content.toString()+'\nglobalThis.__atlas={get features(){return currentFeatures;},get requestedYear(){return requestedYear;},get metadata(){return metadata;},goToRequestedYear,selectFeature};');res.writeHead(200,{'Content-Type':target.endsWith('.html')?'text/html':target.endsWith('.js')?'text/javascript':target.endsWith('.css')?'text/css':'application/json'}).end(content);}catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:900},ignoreHTTPSErrors:true}),checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
const check=(label,result)=>{assert.ok(result,label);checks.push(label);console.log('PASS '+label);};
const fields={capital:'capitals',leadership:'leaders',currency:'currencies'};
try{
 await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.__atlas?.metadata&&window.__atlas.features.length&&document.querySelector('#loading-indicator').hidden,null,{timeout:90000});
 for(const job of jobs)for(const c of job.package.claims){
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
   check(c.id+' dossier value',body.includes(c.value));
   check(c.id+' requested year',await page.evaluate(y=>window.__atlas.requestedYear===y,year));
   check(c.id+' citation links',await page.locator('.dossier-sources a').evaluateAll(links=>links.length>0&&links.every(a=>a.href.startsWith('https://')&&a.rel.includes('noopener'))));
   for(const boundaryYear of [first-1,last+1].filter(y=>y>=1800&&y<=1960)){
     const absent=await page.evaluate(({mapId,y,field,id})=>{const r=window.__atlas.metadata.resolve(mapId,y),records=r.entity?r[field]||[]:(r.identityPeriods||[]).flatMap(p=>p[field]||[]);return !records.some(f=>f.researchProvenance?.claimId===id);},{mapId,y:boundaryYear,field,id:c.id});
     check(c.id+' no leakage in '+boundaryYear,absent);
   }
 }
 check('No runtime errors',errors.length===0);check('Visible version v0.6.1',(await page.content()).includes('v0.6.1'));
 saveJSON(path.join(root,'research/campaign-01/reports/checkpoint-'+checkpoint+'-browser.json'),{schemaVersion:1,checkpoint,productionFingerprint:productionFingerprint(),passed:checks.length,checks,errors});
}finally{await browser.close();await new Promise(r=>server.close(r));}
