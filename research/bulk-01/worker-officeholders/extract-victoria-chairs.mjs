import fs from 'node:fs';
import crypto from 'node:crypto';
const base='research/bulk-01/worker-officeholders';
const html=fs.readFileSync(`${base}/cache/victoria.html`,'utf8');
const main=JSON.parse(fs.readFileSync(`${base}/officeholder-manifest.json`));
const source={...main.sources.find(s=>s.id==='bulk01-victoria-premiers'),parser:'victoria-chairs-five-columns-v1'};
const plain=s=>s.replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const ym=s=>{const d=new Date(`${s} UTC`);if(Number.isNaN(+d))throw Error(s);return d.toISOString().slice(0,7);};
const rows=[];
for(const [heading,next,officeTitle]of[['Former Presidents','Former Speakers','President of the Legislative Council'],['Former Speakers','Former Premiers','Speaker of the Legislative Assembly']]){
 const section=html.slice(html.indexOf(heading),html.indexOf(next));
 for(const m of section.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)){
  const cells=[...m[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map(x=>plain(x[1]));if(cells.length!==5||!/^\w+ \d{4}$/.test(cells[3])||!/^\w+ \d{4}$/.test(cells[4]))continue;
  const from=ym(cells[3]),until=ym(cells[4]);if(from>'1960-12')continue;
  const suggested=from<'1901-01'&&until>'1878-01';
  rows.push({name:cells[1].replace(/\s*\([IVX]+\)$/,''),officeTitle,from,until,precision:'month',sourceId:source.id,locator:`${heading} table; ${cells[1]}; Assumed office / Left office`,originalTerm:`${cells[3]} – ${cells[4]}`,originalRow:cells.join(' | '),entityIdsSuggested:suggested?['victoria-bicameral-colonial-core']:[],evidenceCautions:['Source supports only month precision. Never manufacture first-of-month dates; preserve YYYY-MM.',...(suggested?['Institutional legislative chair, distinct from Premier or sovereign; full office tenure preserved, source scope only.']:['Outside represented colonial scope: hold.'])]});
 }
}
const result={schemaVersion:1,sources:[source],rows,reviewNotes:'Same original Parliament of Victoria body already inspected and hash-bound in officeholder source review. Intro explicitly distinguishes Council President and Assembly Speaker. Five-column parser; all dates remain month precision.'};
for(const r of rows){if(r.from>=r.until)throw Error(JSON.stringify(r));if(!r.originalRow.includes(r.name))throw Error(r.name);}
fs.writeFileSync(`${base}/victoria-chairs-manifest.json`,JSON.stringify(result,null,2)+'\n');console.log({rows:rows.length,mapped:rows.filter(r=>r.entityIdsSuggested.length).length,parserSha256:crypto.createHash('sha256').update(fs.readFileSync(`${base}/extract-victoria-chairs.mjs`)).digest('hex')});
