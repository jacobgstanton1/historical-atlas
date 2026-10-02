import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
const base='research/bulk-01/worker-officeholders';
const sources=[],rows=[];
const plain=s=>s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]*>/g,' ').replace(/&#160;|&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/\s+/g,' ').trim();
function source(file,id,url,title,institution,parser){const body=fs.readFileSync(path.join(base,'cache',file)); const s={id,url,title,institution,cachePath:`${base}/cache/${file}`,sha256:crypto.createHash('sha256').update(body).digest('hex'),parser,encoding:'utf-8',retrievedAt:'2026-10-02',reviewNotes:'Researcher inspected original downloaded body and table structure; mapping suggestions require coordinator adjudication.'};sources.push(s);return body.toString('utf8');}
function iso(s){const d=new Date(s+' UTC'); if(Number.isNaN(+d))throw Error('Invalid date '+s);return d.toISOString().slice(0,10);}
function dmy(s){const [d,m,y]=s.split('-');return `${y}-${m}-${d}`;}
function add(r){r.precision='day';r.evidenceCautions??=[]; rows.push(r);}
const j=source('japan-en.html','japan-cabinets','https://japan.kantei.go.jp/past_cabinet/index.html','Previous Prime Ministers',"Prime Minister’s Office of Japan",'kantei-his-block-v1');
for(const m of j.matchAll(/<li class="his-block(?: has-totalday)?">([\s\S]*?)<\/li>/g)){
 const block=m[1],no=plain(block.match(/<h3 class="his-generation">([\s\S]*?)<\/h3>/)?.[1]||'');
 const name=plain(block.match(/<p class="his-name">([\s\S]*?)<\/p>/)?.[1]||'');
 const originalTerm=plain(block.match(/<p class="his-period">([\s\S]*?)<\/p>/)?.[1]||'');
 const dates=originalTerm.split(' - ');if(dates.length!==2||/present/i.test(dates[1]))continue;
 const from=iso(dates[0]),until=iso(dates[1]);if(from>'1960-12-31'||until<'1800-01-01')continue;
 const entityIdsSuggested=[];
 for(const [id,start,end] of [['japan-restoration-framework','1868-01-03','1890-11-29'],['japan-meiji-framework','1890-11-29','1945-09-02'],['japan-initial-allied-occupation','1945-09-02','1947-05-03'],['japan-postwar-framework','1947-05-03','9999-12-31']])if(from<end&&until>start)entityIdsSuggested.push(id);
 add({name,officeTitle:'Prime minister',from,until,sourceId:'japan-cabinets',locator:`li.his-block: ${no}; p.his-name; p.his-period`,originalTerm,originalRow:plain(block),entityIdsSuggested,evidenceCautions:entityIdsSuggested.length>1?['Tenure crosses a curated polity/framework transition. Keep full source tenure; coordinator must adjudicate claim applicability without inventing clipped dates.']:[],sourceOrdinal:no});
}
const c=source('canada-4.html','c01-canada-ministry-tenures','https://www.ourcommons.ca/procedure/procedure-and-practice-4/app06-e.html','Appendix 6: Government Ministries and Prime Ministers of Canada Since 1867','House of Commons of Canada','commons-pccp4-table-v1');
let ordinal=0;for(const m of c.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)){
 const cells=[...m[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map(x=>x[1]);if(cells.length!==6||!cells[1].includes('PCCP4-Bold'))continue;ordinal++;
 const name=[...cells[1].matchAll(/<strong[^>]*>([\s\S]*?)<\/strong>/g)].map(x=>plain(x[1])).join(' ');
 const dates=[...cells[2].matchAll(/\b\d{2}-\d{2}-\d{4}\b/g)].map(x=>x[0]);if(dates.length!==2)continue;
 const from=dmy(dates[0]),until=dmy(dates[1]);if(from>'1960-12-31'||until<'1800-01-01')continue;
 const entityIdsSuggested=[];for(const [id,start,end]of[['canada-1867-federal-framework','1867-07-01','1931-12-11'],['canada-westminster-federal-framework','1931-12-11','1961-01-01']])if(from<end&&until>start)entityIdsSuggested.push(id);
 add({name,officeTitle:'Prime minister',from,until,sourceId:'c01-canada-ministry-tenures',locator:`Appendix 6 ministry row ${ordinal}; Prime Minister column; Term of Office column`,originalTerm:plain(cells[2]),originalRow:cells.map(plain).join(' | '),entityIdsSuggested,evidenceCautions:entityIdsSuggested.length>1?['Tenure crosses 1931 framework boundary; full official dates retained for coordinator applicability adjudication.']:[],sourceOrdinal:ordinal});
}
const v=source('victoria.html','bulk01-victoria-premiers','https://www.parliament.vic.gov.au/about/history-and-heritage/people-who-shaped-parliament/former-members','Former members — Former Premiers','Parliament of Victoria','victoria-former-premiers-table-v1');
const vt=v.slice(v.indexOf('Former Premiers'));
let vn=0;for(const m of vt.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)){
 const cells=[...m[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map(x=>plain(x[1]));if(cells.length!==6)continue;
 if(!/\d{4}/.test(cells[3])||!/\d{4}/.test(cells[4]))continue;vn++;
 const from=iso(cells[3]),until=iso(cells[4]);if(from>'1960-12-31'||until<'1800-01-01')continue;
 const eligible=from<'1901-01-01'&&until>'1878-01-01';
 add({name:cells[1].replace(/\s*\([IVX]+\)$/,''),officeTitle:'Premier',from,until,sourceId:'bulk01-victoria-premiers',locator:`Former Premiers table row: ${cells[1]}; Assumed office / Left office columns`,originalTerm:`${cells[3]} – ${cells[4]}`,originalRow:cells.join(' | '),entityIdsSuggested:eligible?['victoria-bicameral-colonial-core']:[],evidenceCautions:eligible?['Source tenure spans retained unchanged; entity curated coverage is only 1878–1901. Post-1901 office continuation requires explicit colonial scope; no federated state mapping is inferred.']:['Outside existing curated colony coverage: hold.'],sourceOrdinal:vn});
}
const q=source('queensland.html','bulk01-queensland-premiers','https://www.qld.gov.au/government/premier-ministers-departments/the-premier','The Premier of Queensland — Former Premiers of Queensland','Queensland Government','queensland-former-premiers-li-v1');
for(const m of q.matchAll(/<li>([^<]*,\s*\d{1,2}\/\d{2}\/\d{4}&ndash;\d{1,2}\/\d{2}\/\d{4})<\/li>/g)){
 const originalRow=plain(m[1]).replace(/&ndash;/g,'–'); const x=m[1].match(/^(.*?),\s*(\d{1,2}\/\d{2}\/\d{4})&ndash;(\d{1,2}\/\d{2}\/\d{4})$/);if(!x)continue;
 const from=dmy(x[2].replaceAll('/','-')),until=dmy(x[3].replaceAll('/','-'));if(from>'1960-12-31')continue;
 const eligible=from<'1901-01-01'&&until>'1878-01-01';
 add({name:x[1],officeTitle:'Premier',from,until,sourceId:'bulk01-queensland-premiers',locator:`Former Premiers of Queensland list item: ${originalRow}`,originalTerm:`${x[2]}–${x[3]}`,originalRow,entityIdsSuggested:eligible?['queensland-selfgoverning-colonial-core']:[],evidenceCautions:eligible?['Full tenure retained; curated colonial entity coverage only 1878–1901. Do not project post-federation state role as continued independent colony.']:['Outside represented colonial scope: hold.']});
}
const n=source('nsw.html','bulk01-nsw-premiers','https://www.nsw.gov.au/about-nsw/premiers-of-nsw','Premiers of NSW','NSW Government','nsw-premier-cards-v1');
for(const m of n.matchAll(/<p><strong>((?:(?!<\/strong>)[^])*?)<\/strong><\/p>((?:(?!<p><strong>)[^])*?)<p><strong>SERVED AS PREMIER<\/strong>([^]*?)<\/p>/g)){
 const name=plain(m[1]);if(name.length>180||name.includes('SERVED AS PREMIER'))continue;
 const termText=plain(m[3]);for(const dm of termText.matchAll(/(\d{1,2} [A-Za-z]+ \d{4})\s*—\s*(\d{1,2} [A-Za-z]+ \d{4})/g)){
 const from=iso(dm[1]),until=iso(dm[2]);if(from>'1960-12-31')continue;
 const eligible=from<'1901-01-01'&&until>'1878-01-01';
 add({name,officeTitle:'Premier',from,until,sourceId:'bulk01-nsw-premiers',locator:`Former Premiers card ${name}; SERVED AS PREMIER: ${dm[0]}`,originalTerm:dm[0],originalRow:`${name} | ${dm[0]}`,entityIdsSuggested:eligible?['nsw-responsible-colonial-core']:[],evidenceCautions:['Source states SERVED AS PREMIER endpoints; consecutive cards sometimes end day before successor. End semantics must be adjudicated; retain source end date as supplied.',...(eligible?['Curated colony coverage only 1878–1901.']:['Outside represented colonial scope: hold.'])]});
 }
}
fs.writeFileSync(path.join(base,'officeholder-manifest.json'),JSON.stringify({schemaVersion:1,sources,rows},null,2)+'\n');
console.log(JSON.stringify({sources:sources.length,rows:rows.length,bySource:Object.fromEntries(sources.map(s=>[s.id,rows.filter(r=>r.sourceId===s.id).length]))},null,2));
