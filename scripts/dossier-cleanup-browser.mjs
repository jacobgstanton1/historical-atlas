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

let body=await select('France',1960);check('France 1960 historical content',body.includes('New franc')&&body.includes('Fifth Republic')&&body.includes('Charles de Gaulle'));
check('Historical flag and actual event date',await page.locator('.dossier-flags img').count()>0&&await page.locator('.dossier-events time').count()>0);
const publicText=()=>page.locator('.territory-dossier').evaluate(e=>[...e.children].filter(n=>!n.matches('details')).map(n=>n.textContent).join(' '));
check('France methodology relocated',!(await publicText()).includes('Curated facts stop at the atlas limit')&&(await page.locator('.dossier-coverage-notes').textContent()).includes('Curated facts stop at the atlas limit'));
body=await select('Italy',1960);check('Italy state title',await page.locator('#territory-name').evaluate(e=>e.childNodes[0].textContent)==='Italian Republic');
check('Italy preserved substantive facts',body.includes('Rome')&&body.includes('Giovanni Gronchi')&&body.includes('Constitutional republic')&&await page.locator('.dossier-flags img').count()>0);
const card=page.locator('.dossier-figure-card').filter({hasText:'Daniel Bovet'});check('Bovet card dated historical content',await card.count()===1&&(await card.innerText()).includes('1957')&&!(await card.innerText()).includes('status recorded'));
check('Coverage dates do not manufacture an end',!(await publicText()).includes('1 January 1961')&&(await publicText()).includes('From 11 May 1955'));
await page.screenshot({path:path.join(root,'development','dossier-cleanup-'+(live?'live':'local')+'.png')});
await page.locator('.fact-source').first().click();check('Citations connect to human-readable source list',await page.locator('.dossier-methodology').last().getAttribute('open')!==null&&await page.locator('.dossier-sources a').count()>0);
body=await select('United Kingdom of Great Britain and Ireland',1914);check('UK 1914 identity and historical records',body.includes('United Kingdom of Great Britain and Ireland')&&body.includes('Westminster')&&/sterling/i.test(body)&&await page.locator('.dossier-flags img').count()>0);
body=await select('Russian Empire',1800);check('Sparse mapped territory remains honest',body.includes('detailed sourced dossier is not yet available')&&!body.includes('Government & Politics')&&body.includes('Map & boundary context')&&body.includes('Sources & Methodology'));
body=await select('Germany',1930);check('Earlier snapshot retains dated leadership',body.includes('Brüning'));body=await select('Germany',1938);check('Later snapshot excludes earlier leadership',!body.includes('Brüning')&&body.includes('Hitler'));
body=await select('Japan',1938);check('Observation date remains separate',body.includes('1935 census')&&body.includes('excludes imperial colonies'));
await page.setViewportSize({width:390,height:844});check('Mobile width and scrolling preserved',await page.locator('#inspector').evaluate(e=>e.getBoundingClientRect().width<=390&&getComputedStyle(e).overflowY==='auto'));
check('No runtime errors',errors.length===0);
const report={url,mode:live?'actual-live-site':'local-real-app',passed:checks.length,checks,errors,recordedAt:new Date().toISOString()};fs.writeFileSync(path.join(root,'development','dossier-cleanup-'+(live?'live':'local')+'-checks.json'),JSON.stringify(report,null,2)+'\n','utf8');
}catch(error){console.error(JSON.stringify({errors,status:await page.locator('#status').innerText(),body:(await page.locator('body').innerText()).slice(0,500)}));throw error;}finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
