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
const page=await browser.newPage({viewport:{width:390,height:844},ignoreHTTPSErrors:true}),checks=[],errors=[];
page.on('pageerror',e=>{errors.push(e.message);console.log('PAGEERROR '+e.message);});page.on('requestfailed',r=>console.log('REQUESTFAILED '+r.url()+' '+r.failure()?.errorText));
if(!live)await page.route('**/world_*.geojson',async route=>{const filename=new URL(route.request().url()).pathname.split('/').pop();const file=path.join(root,'research/completion-02/area/cache',filename);if(fs.existsSync(file))await route.fulfill({path:file,contentType:'application/json'});else await route.continue();});
const check=(name,result)=>{assert.ok(result,name);checks.push(name);console.log('PASS '+name);};
const loaded=()=>page.waitForFunction(()=>document.querySelector('#loading-indicator').hidden&&document.querySelector('#status').textContent.includes('1938'),null,{timeout:90000});
async function select(query,year){await page.locator('#year-jump').fill(String(year));await page.locator('#year-form button').click();await page.waitForFunction(y=>document.querySelector('#year-label').textContent.startsWith(String(y))&&document.querySelector('#loading-indicator').hidden,year,{timeout:90000});await page.locator('#search').fill(query);const matches=page.locator('.search-result:not([disabled])');const exact=matches.filter({has:page.locator('strong').filter({hasText:new RegExp('^'+query+'$','i')})});await (await exact.count()?exact.first():matches.first()).click();await page.waitForSelector('.territory-dossier');await page.waitForTimeout(250);return page.locator('#dossier-content').innerText();}

try {
 await page.goto(url,{waitUntil:'domcontentloaded'});await loaded();await page.waitForTimeout(800);
 for(const [query,year,title,needle] of [['Russian Empire',1800,'Russian Empire','Paul'],['Russian Empire',1914,'Russian Empire','Nicholas'],['Soviet Russia',1920,'RSFSR','Lenin'],['Soviet Union',1930,'Union of Soviet Socialist Republics','Stalin'],['Nationalist government',1930,'Nationalist government','Nanjing'],['Republic of China',1914,'Republic of China','1912']]) {
  const text=await select(query,year);
  assert.ok(text.includes(title),query+' dated title');assert.ok(text.includes(needle),query+' core/context');
  assert.equal(await page.locator('.territory-dossier > [data-section]').count(),11);
  assert.ok(await page.locator('[data-section="Sources & Methodology"] a').count()>0);
  check(query+' '+year+': dated identity, supported context, citations and canonical sections',true);
 }
 assert.equal(errors.length,0);fs.writeFileSync((live?path.join(os.tmpdir(),'historical-atlas-qa-live.json'):path.join(root,'research/snapshot-qa-01/browser-local.json')),JSON.stringify({url,passed:checks.length,checks,errors},null,2)+'\n');
} finally {await browser.close();if(server)await new Promise(r=>server.close(r));}
