import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
export async function checkProduct({page,url,ready,year,check}){
 const state=async(year,territory)=>page.waitForFunction(({year,territory})=>{const u=new URL(location.href);return Number(u.searchParams.get('year'))===year&&u.searchParams.get('territory')===territory&&document.querySelector('#year-label').textContent.startsWith(String(year))&&document.querySelector('#loading-indicator').hidden&&document.querySelector('#inspector').getAttribute('aria-hidden')===(territory?'false':'true');},{year,territory},{timeout:90000});
 async function open(query,year,territory){await page.goto(url+query,{waitUntil:'domcontentloaded'});await ready();await state(year,territory);}
 await open('?year=1939&campaign=smoke',1939,null);check('direct requested-year link preserves unrelated query',new URL(page.url()).searchParams.get('campaign')==='smoke'&&(await page.locator('#snapshot-note').innerText()).includes('1938'));
 await open('?year=1960&territory=entity-france',1960,'entity-france');check('direct year and stable territory opens its dossier',(await page.locator('.dossier-header h1').innerText()).includes('France'));
 await year(1938);await state(1938,'entity-france');check('year changes retain dossier and update deep link',true);
 await page.locator('#close-inspector').click();await state(1938,null);check('deselection removes territory parameter',true);
 await page.goBack();await state(1938,'entity-france');check('Back restores selected territory',true);
 await page.goBack();await state(1960,'entity-france');check('Back restores selected year',true);
 await page.goForward();await state(1938,'entity-france');check('Forward restores year and dossier',true);
 const before=await page.evaluate(()=>history.length);
 await page.locator('#timeline').evaluate(e=>{for(const year of [1939,1940,1941]){e.value=year;e.dispatchEvent(new Event('input',{bubbles:true}));}e.dispatchEvent(new Event('change',{bubbles:true}));});await state(1941,'entity-france');
 check('slider drag creates at most one history entry',await page.evaluate(()=>history.length)<=before+1);await page.goBack();await state(1938,'entity-france');check('Back returns to pre-drag year',true);
 await page.context().grantPermissions(['clipboard-read','clipboard-write']);
 await page.evaluate(()=>Object.defineProperty(navigator,'share',{configurable:true,value:undefined}));
 await page.locator('#share-territory').click();await page.waitForFunction(()=>document.querySelector('#share-status').textContent==='Link copied');const copied=new URL(await page.evaluate(()=>navigator.clipboard.readText()));check('Share clipboard contains exact year and territory',copied.searchParams.get('year')==='1938'&&copied.searchParams.get('territory')==='entity-france');
 await page.evaluate(()=>Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{window.testShare=data;}}));await page.locator('#share-territory').click();await page.waitForFunction(()=>document.querySelector('#share-status').textContent==='Link shared');check('native sharing receives canonical URL',await page.evaluate(()=>new URL(window.testShare.url).searchParams.get('territory')==='entity-france'));
 await page.evaluate(()=>{Object.defineProperty(navigator,'share',{configurable:true,value:undefined});Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('Denied in test');}}});});await page.locator('#share-territory').click();await page.waitForSelector('#share-fallback:not([hidden])');check('clipboard denial offers a selectable link without popup',(await page.locator('#share-url').inputValue()).includes('territory=entity-france'));
 await page.locator('#about-toggle').click();check('About opens accessible native dialog',await page.locator('#about-dialog').evaluate(e=>e.open)&&await page.locator('#about-dialog').getAttribute('aria-labelledby')==='about-title');
 const oldYear=await page.locator('#year-label').innerText();await page.keyboard.press('ArrowRight');check('About keyboard interaction does not move timeline',await page.locator('#year-label').innerText()===oldYear);await page.keyboard.press('Tab');check('About traps keyboard focus',await page.locator('#about-dialog').evaluate(e=>e.contains(document.activeElement)));await page.keyboard.press('Escape');check('Escape closes About and restores focus',await page.locator('#about-dialog').evaluate(e=>!e.open)&&await page.locator('#about-toggle').evaluate(e=>document.activeElement===e));
 await open('?year=banana&territory=%3Cscript%3E',1938,null);check('malformed parameters fail gracefully',true);
 await open('?year=1800&territory=entity-east-germany',1800,null);check('absent historical territory never becomes modern fallback',true);
 await open('?year=1960&territory=entity-not-a-real-territory',1960,null);check('unknown stable identifier is removed safely',true);
 await page.setViewportSize({width:390,height:844});await open('?year=1960&territory=entity-france',1960,'entity-france');await page.locator('#about-toggle').click();check('mobile deep link and About fit viewport',await page.locator('#about-dialog').boundingBox().then(b=>b.x>=0&&b.x+b.width<=390)&&await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('#about-close').click();
 check('accurate page metadata and canonical URL',await page.locator('meta[property="og:title"]').getAttribute('content')==='Historical Atlas'&&await page.locator('link[rel="canonical"]').getAttribute('href')==='https://jacobgstanton1.github.io/historical-atlas/');
 await page.screenshot({path:path.join(os.tmpdir(),'atlas-product-mobile.png')});
}
