// Offline research infrastructure; never imported by the production atlas.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
export const root = fileURLToPath(new URL('../', import.meta.url));
export const categories = ['resolver','political-institutional','leadership','capital','population-statistics','area-statistics','currency','historical-flag','economy','events-context','relationships','important-figures','identity-review','mapping-review'];
export const productionFiles = ['data/historical-entities.json','data/historical-sources.json','app.js','data-pipeline.js','historical-metadata.js','dossier.js','index.html','styles.css'];
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])]));
  return value;
}
export const digest = value => crypto.createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
export function readJSON(file) {return JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));}
export function saveJSON(file, value) {fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n');}
export function productionFingerprint(directory=root) {
  const hashes=Object.fromEntries(productionFiles.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.join(directory,file))).digest('hex')]));
  const db=readJSON(path.join(directory,'data/historical-entities.json'));
  for(const e of db.entities||[])for(const f of e.flags||[])if(f.researchProvenance){
    if(!/^\.\/assets\/flags\/[a-zA-Z0-9_-]+\.svg$/.test(f.asset||''))throw Error('Unsafe production flag asset');
    hashes[f.asset]=crypto.createHash('sha256').update(fs.readFileSync(path.join(directory,f.asset))).digest('hex');
  }
  return digest(hashes);
}
export function readContext(directory=root) {
  return {directory,db:readJSON(path.join(directory,'data/historical-entities.json')),registry:readJSON(path.join(directory,'data/historical-sources.json')),manifest:readJSON(path.join(directory,'development/coverage/manifest.json')),plan:readJSON(path.join(directory,'development/coverage/research-plan.json')),productionFingerprint:productionFingerprint(directory)};
}
export function dateRange(value) {
  if (typeof value!=='string'||!/^\d{4}(-\d{2})?(-\d{2})?$/.test(value)) throw Error('Invalid date '+value);
  const parts=value.split('-').map(Number),[y,m=1,d=1]=parts;
  const start=Date.UTC(y,m-1,d), dt=new Date(start);
  if(y<100||m<1||m>12||d<1||dt.getUTCFullYear()!==y||dt.getUTCMonth()!==m-1||dt.getUTCDate()!==d)throw Error('Invalid calendar date '+value);
  return [start,parts.length===1?Date.UTC(y+1,0,1):parts.length===2?Date.UTC(y,m,1):start+86400000];
}
// Exact-day endpoints are exclusive; imprecise endpoints retain the resolver's uncertainty.
export function periodBounds(period) {
  const from=period.from??period.validFrom,until=period.until??period.validUntil;
  return [from?dateRange(from)[0]:-Infinity,until?(until.length===10?dateRange(until)[0]:dateRange(until)[1]):Infinity];
}
export const overlap=(a,b)=>Math.max(a[0],b[0])<Math.min(a[1],b[1]);
export const isCLI=url=>process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(url);
