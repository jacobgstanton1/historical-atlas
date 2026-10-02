// Bounded frontend validation, using the real year/search controls locally and live.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const root=path.resolve(import.meta.dirname,'..');
const {chromium}=await import(pathToFileURL(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')));
let server;const live=process.argv.includes('--live');
if(!live){server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!p.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{const content=fs.readFileSync(p);res.writeHead(200,{'Content-Type':p.endsWith('.html')?'text/html':p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':p.endsWith('.svg')?'image/svg+xml':'application/json'}).end(content);}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));}
const url=live?'https://jacobgstanton1.github.io/historical-atlas/':'http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:900},ignoreHTTPSErrors:true}),checks=[],errors=[];
page.on('pageerror',e=>errors.push(e.message));
const check=(name,result)=>{assert.ok(result,name);checks.push(name);console.log('PASS '+name);};
const loaded=()=>page.waitForFunction(()=>document.querySelector('#loading-indicator').hidden&&document.querySelector('#status').textContent.includes('1938'),null,{timeout:90000});
async function select(query,year){await page.locator('#year-jump').fill(String(year));await page.locator('#year-form button').click();await page.waitForFunction(y=>document.querySelector('#year-label').textContent.startsWith(String(y))&&document.querySelector('#loading-indicator').hidden,year,{timeout:90000});await page.locator('#search').fill(query);const matches=page.locator('.search-result:not([disabled])');const exact=matches.filter({has:page.locator('strong').filter({hasText:new RegExp('^'+query+'$','i')})});await (await exact.count()?exact.first():matches.first()).click();await page.waitForSelector('.territory-dossier');await page.waitForTimeout(250);return page.locator('#dossier-content').innerText();}
try{
await page.goto(url,{waitUntil:'domcontentloaded'});await loaded();await page.waitForResponse(r=>r.url().includes('comprehensive-dossiers.json')&&r.ok(),{timeout:10000}).catch(()=>{});
let body=await select('France',1880);check('France rich institutions, flag and figures',body.includes('Government & Politics')&&body.includes('Important Figures')&&await page.locator('.dossier-flags img').count()>0);
await page.screenshot({path:path.join(root,'development','territory-v2-'+(live?'live':'local')+'.png')});
body=await select('Germany',1930);check('Weimar research and dated leadership',body.includes('Reichstag')&&body.includes('Brüning'));
body=await select('Germany',1938);check('Snapshot change replaces Weimar leadership',!body.includes('Heinrich Brüning')&&body.includes('Hitler'));
body=await select('Japan',1938);check('Nearby census date and geography',body.includes('1935')&&body.includes('excludes imperial colonies')&&body.includes('Earlier measurement'));
body=await select('Japan',1960);check('Postwar snapshot framework',body.includes('1960')&&body.includes('constitutional'));
body=await select('British Raj',1938);check('Curated dependent relationship',body.includes('Historical Relationships')&&body.includes('Imperial administration')&&!body.includes('SUBJECTO'));
body=await select('France',1940);check('Transition notice and competing political frameworks',body.includes('transition')&&body.includes('Dates below'));
body=await select('France',1939);check('Requested year remains separate from boundary snapshot',body.includes('Boundary map: 1938')&&body.includes('1939'));
await page.locator('.fact-source').first().click();check('Citation opens linked source details',await page.locator('.dossier-methodology').last().getAttribute('open')!==null&&await page.locator('.dossier-sources a').count()>0);
body=await select('Antigua',1938);check('Sparse dossier hides absent sections',!body.includes('Population & Territory')&&body.length>30);
body=await select('United States',1945);check('Leadership turnover retains both office holders',body.includes('Franklin D. Roosevelt')&&body.includes('Harry S. Truman'));
check('Dated chronological events and compact figure cards',await page.locator('.dossier-events time').count()>0&&await page.locator('.dossier-figure-card').count()>0);
await page.setViewportSize({width:390,height:844});check('Mobile panel fits and scrolls',await page.locator('#inspector').evaluate(e=>e.getBoundingClientRect().width<=390&&getComputedStyle(e).overflowY==='auto'));await page.screenshot({path:path.join(root,'development','territory-v2-'+(live?'live':'local')+'-mobile.png')});
check('Version remains v0.6.1',(await page.locator('.source-credit').innerText()).includes('v0.6.1'));check('No browser runtime errors',errors.length===0);
if(!live){
await page.setViewportSize({width:1440,height:900});await page.route('**/data/comprehensive-dossiers.json*',r=>r.fulfill({status:503,body:'Unavailable'}));await page.reload({waitUntil:'domcontentloaded'});await loaded();body=await select('Japan',1938);check('Rich-data failure preserves sourced legacy dossier',body.includes('Additional dossier records are temporarily unavailable')&&body.includes('Population & Territory'));
await page.route('**/data/historical-entities.json*',r=>r.fulfill({status:503,body:'Unavailable'}));await page.reload({waitUntil:'domcontentloaded'});await loaded();body=await select('France',1938);check('Metadata failure preserves map selection and explicit notice',body.includes('Historical identity records are temporarily unavailable')&&body.includes('France'));
}
const report={url,mode:live?'actual-live-site':'local-real-app',passed:checks.length,checks,errors,recordedAt:new Date().toISOString()};fs.writeFileSync(path.join(root,'development','territory-v2-'+(live?'live':'local')+'-checks.json'),JSON.stringify(report,null,2)+'\n','utf8');
}catch(error){console.error(JSON.stringify({errors,status:await page.locator('#status').innerText(),body:(await page.locator('body').innerText()).slice(0,500)}));throw error;}finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
