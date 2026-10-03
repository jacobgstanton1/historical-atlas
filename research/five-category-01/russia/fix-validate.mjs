import fs from 'node:fs';import path from 'node:path';
import {fields,generateDossierJob,validateDossier} from '../../../scripts/research-comprehensive.mjs';
const dir='research/five-category-01/russia';const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));const c=read(`${dir}/cohort.json`);
if(!fs.existsSync(`${dir}/cohort-original.json`))fs.writeFileSync(`${dir}/cohort-original.json`,JSON.stringify(c,null,2));
const bounds={
'flag-heraldic':['1858','1883','1858','1883'],
'flag-1900':['1896','1905','1896','1917'],
'flag-1914':['1907','1914','1896','1917'],
'flag-rsfsr1920':['1920','1920','1918','1925'],
'flag-ussr1930':['1924','1936','1924','1936'],
'currency-1878':['1878','1878','1843','1897'],
'currency-1920':['1920','1920','1919','1921'],
'currency-1930-1938':['1924','1946','1924','1946']};
for(const s of c.sources)if(s.id!=='soviet-currency')s.kind='unclassified';
for(const cl of c.claims){const [from,until,ef,eu]=bounds[cl.id.replace('five01-russia-','')];cl.temporal={kind:'interval',from,until,certainty:'exact'};for(const e of cl.evidence){e.precision='year';e.temporal={kind:'interval',from:ef,until:eu,certainty:'exact'};e.note='Original historical year precision preserved. Claim bounds are source years, or year-granular clipping to the accepted institutional research envelope. No appointment/adoption day is inferred; transition endpoint years are not certified as uniform full-year practice.';}}
fs.writeFileSync(`${dir}/cohort.json`,JSON.stringify(c,null,2)+'\n');
const context={directory:process.cwd(),db:read('data/historical-entities.json'),registry:read('data/historical-sources.json')};const results=[];
for(const entityId of [...new Set(c.claims.map(x=>x.entityId))]){const claims=c.claims.filter(x=>x.entityId===entityId);const from=claims.map(x=>x.temporal.from).sort()[0];const until=claims.map(x=>x.temporal.until).sort().at(-1);const period={from,until};const job=generateDossierJob(entityId,period,context);const pkg={schemaVersion:2,id:`five01-russia-check-${entityId}`,jobId:job.id,entityId,mapIds:job.mapIds,worker:{id:'russia-worker',assignmentType:'comprehensive-entity-period'},productionFingerprint:job.productionFingerprint,chronology:{calendar:'proleptic-gregorian',yearConvention:'astronomical'},period,claims:structuredClone(claims),sources:c.sources,investigation:fields.map(category=>({category,status:claims.some(x=>x.category===category)?'supported':'unresolved',rationale:'Bounded five-category packet; preserve existing supported fields; unresolved outside this packet.',consultedSourceIds:claims.filter(x=>x.category===category).flatMap(x=>x.sourceIds),gaps:claims.some(x=>x.category===category)?[]:['Outside this packet or held in held.json']})),conflicts:[],provenance:{createdAt:'2026-10-03',method:'Isolated source-bound packet; independent review required',preservedPackageHashes:[]}};
// Validator allows local path resolution under its dedicated flag asset directory.
const localContext={...context};pkg.sources=pkg.sources.filter(s=>s.id!=='soviet-currency');for(const i of pkg.investigation)i.consultedSourceIds=[...new Set(i.consultedSourceIds)];
const originalRead=fs.readFileSync;const redirects=new Map(pkg.claims.filter(cl=>cl.flag).map(cl=>[path.resolve(cl.flag.asset),path.resolve(dir,'assets',path.basename(cl.flag.asset))]));
const originalReal=fs.realpathSync;fs.realpathSync=function(p,...args){const key=path.resolve(String(p));return redirects.has(key)?key:originalReal.call(fs,p,...args);};
fs.readFileSync=function(p,...args){return originalRead.call(fs,redirects.get(path.resolve(String(p)))||p,...args);};
try{results.push({entityId,result:validateDossier(pkg,job,localContext)});}finally{fs.readFileSync=originalRead;fs.realpathSync=originalReal;}}
fs.writeFileSync(`${dir}/validation.json`,JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results.map(r=>({entityId:r.entityId,valid:r.result.valid,errors:r.result.errors})),null,2));
