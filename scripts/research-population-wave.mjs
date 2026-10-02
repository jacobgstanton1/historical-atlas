// Population observations only: reviewed historical crosswalks, never modern-name fallback.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {readJSON,saveJSON,readContext,digest,isCLI} from './research-common.mjs';
import {temporalBounds} from './research-comprehensive.mjs';
export const base='research/completion-02/population/';
export function parseCSV(text){
 const rows=[];let row=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else if(quoted||cell==='')quoted=!quoted;else throw Error('Malformed CSV quote');}
 else if(!quoted&&(c===','||c==='\n')){row.push(cell.replace(/\r$/,''));cell='';if(c==='\n'){if(row.some(Boolean))rows.push(row);row=[];}}else cell+=c;}
 if(quoted)throw Error('Unclosed CSV quote');if(cell||row.length){row.push(cell.replace(/\r$/,''));rows.push(row);}const header=rows.shift();if(!header||new Set(header).size!==header.length)throw Error('Invalid CSV header');
 return rows.map(r=>{if(r.length!==header.length)throw Error('CSV column mismatch');return Object.fromEntries(header.map((h,i)=>[h,r[i]]));});
}
export const fileHash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
export function eligibleMapping(mapping,entity,year){
 if(!['EXACT','HIGH_CONFIDENCE'].includes(mapping.confidence))return false;
 if(!mapping.years?.includes(year)||!mapping.scopeRationale?.trim()||!mapping.sourceIds?.length)return false;
 if(!entity||mapping.entityId!==entity.id)return false;
 const point=temporalBounds({kind:'observation',observationDate:String(year)});
 const existence=temporalBounds({kind:'interval',from:entity.existence.validFrom,until:entity.existence.validUntil||'1961-01-01'});
 return point.lo>=existence.lo&&point.hi<=existence.hi;
}
export function providerFor(label){
 if(/Gapminder.*Systema|Systema Globalis/i.test(label))return 'systema';
 if(/Gapminder.*v7/i.test(label))return 'gapminder';
 if(/United Nations.*2024|World Population Prospects.*2024/i.test(label)&&!/interim|update/i.test(label))return 'un-wpp';
 return null; // Unknown or changed upstream source needs its own reviewed version.
}
export function buildWave({reviewFiles,matrixPath=base+'baseline.json',output=base+'intake'}={}){
 const context=readContext(),matrix=readJSON(matrixPath),store=readJSON('data/comprehensive-dossiers.json');
 const populationPath=base+'cache/owid-population.csv',attributionPath=base+'cache/owid-country-year-sources.csv';
 const rows=parseCSV(fs.readFileSync(populationPath,'utf8')),attribution=parseCSV(fs.readFileSync(attributionPath,'utf8'));
 const key=r=>r.Entity+'|'+r.Year,points=new Map(),sourcesByPoint=new Map();
 for(const r of rows){if(points.has(key(r)))throw Error('Duplicate provider observation');points.set(key(r),r);}
 for(const r of attribution){if(sourcesByPoint.has(key(r)))throw Error('Duplicate country-year source');sourcesByPoint.set(key(r),r);}
 const reviews=reviewFiles.map(readJSON),mappings=reviews.flatMap(r=>r.mappings||[]),knownSources=new Set([...context.registry.sources,...store.packages.flatMap(p=>p.sources||[])].map(s=>s.id));
 const primary=readJSON(base+'cache/gapminder-v7-snapshot-observations.json');
 if(primary.sourceSHA256!==fileHash(base+'cache/gapminder-pop-v7-download'))throw Error('Primary workbook extraction changed');
 const primaryPoints=new Map(primary.observations.map(r=>[r.geo.toUpperCase()+'|'+r.year,r]));
 const sourceDefinitions={gapminder:{id:'wave01-gapminder-v7-owid-953903',title:'Gapminder Population v7 (2022), via OWID long-run population dataset 2024-07-15',institution:'Gapminder; Our World in Data',url:'https://gapm.io/dpop',usage:'CC BY 4.0. Free data from www.gapminder.org. Source-produced historical estimates, generally reconstructed to current geographical borders. Only independently reviewed compatible historical territories are imported; no atlas interpolation. Original year and OWID country-year source retained.'},'un-wpp':{id:'wave01-un-wpp2024-owid-953903',title:'UN World Population Prospects 2024 population estimates, via OWID long-run population dataset 2024-07-15',institution:'United Nations DESA Population Division; Our World in Data',url:'https://www.un.org/development/desa/pd/content/World-Population-Prospects-2024',usage:'UN WPP 2024, Online Edition; CC BY 3.0 IGO. Estimates for countries AND areas, not contemporary census enumeration. Only historically compatible territories; exact source observation year retained. Dataset country-year attribution checked, interim/unknown versions held.'},systema:{id:'wave01-systema-globalis2023-owid-953903',title:'Gapminder Systema Globalis (2023), former-country population observations via OWID',institution:'Gapminder; Our World in Data',url:'https://github.com/open-numbers/ddf--gapminder--systema_globalis',usage:'CC BY 4.0; attribution Gapminder Systema Globalis. Former-country source observations retain documented territorial and date restrictions; no extrapolation or interpolation.'}};
 const populationHash=fileHash(populationPath),attributionHash=fileHash(attributionPath);
 const claims=[],held=[],skipped=[],seen=new Set();
 for(const m of mappings){const entity=context.db.entities.find(e=>e.id===m.entityId);if(m.sourceIds?.some(s=>!knownSources.has(s)))throw Error('Crosswalk has unknown supporting source '+m.entityId);
  for(const year of m.years||[]){const slot=matrix.rows.find(r=>r.entityId===m.entityId&&r.snapshotYear===year);if(!slot){held.push({entityId:m.entityId,year,reason:'No represented dossier'});continue;}
   if(slot.categories['population-statistics'].status==='supported'){skipped.push({entityId:m.entityId,year,reason:'Existing supported evidence takes precedence'});continue;}
   if(!eligibleMapping(m,entity,year)){held.push({entityId:m.entityId,year,reason:'Unaccepted scope or observation outside entity coverage',mapping:m});continue;}
   const r=points.get(m.sourceEntity+'|'+year),s=sourcesByPoint.get(m.sourceEntity+'|'+year),provider=s&&providerFor(s.Source);
   if(!r||!s||!provider||r.Code!==m.sourceCode||s.Code!==r.Code||r.Code==='TGO'){held.push({entityId:m.entityId,year,reason:r?.Code==='TGO'?'Togo interim update requires explicit version attribution':'No exact dated source observation/version/identifier',sourceEntity:m.sourceEntity});continue;}
   const value=Number(r.Population);if(!Number.isSafeInteger(value)||value<0)throw Error('Invalid population value');
   if(provider==='gapminder'&&primaryPoints.get(r.Code+'|'+year)?.value!==value){held.push({entityId:m.entityId,year,reason:'OWID observation differs from primary Gapminder v7 workbook; review rather than silently reconcile'});continue;}
   const signature=m.entityId+'|'+year;if(seen.has(signature))throw Error('Overlapping accepted crosswalk');seen.add(signature);
   const source=sourceDefinitions[provider],temporal={kind:'observation',observationDate:String(year),certainty:'exact'};
   const original={entity:r.Entity,code:r.Code,year:r.Year,value:r.Population,source:s.Source};
   claims.push({id:'wave01-population-'+digest({entity:m.entityId,original}).slice(0,24),entityId:m.entityId,category:'population-statistics',value,metric:'Population (source-produced historical estimate)',unit:'persons',temporal,scope:{id:m.entityId+'-population-reviewed-territory',description:m.scopeRationale,relationship:'same'},sourceIds:[source.id],evidence:[{sourceId:source.id,locator:`OWID indicator 953903 CSV: Entity=${r.Entity}; Code=${r.Code}; Year=${r.Year}; Population=${r.Population}. Country-year source: ${s.Source}`,note:`Original observation ${JSON.stringify(original)}. Population CSV SHA256 ${populationHash}; country-year attribution SHA256 ${attributionHash}. Historical scope reviewed separately using ${m.sourceIds.join(', ')}. Estimate, not census; no atlas interpolation.`,precision:'year',temporal:{...temporal},interpretation:'direct'}],status:'supported',risks:[],qualifications:['Source-produced estimate; observation year is explicit and is not a claim of census enumeration or exact headcount.','Source geography is compatible only for the listed independently reviewed entity/snapshot; no modern-country fallback.',m.scopeRationale],origin:{kind:'bulk-candidate',reference:'OWID indicator 953903; '+source.id+'; exact CSV value and independent historical territorial crosswalk',sourceIdentifier:r.Code+':'+year}});
  }
 }
 const used=new Set(claims.flatMap(c=>c.sourceIds)),cohort={id:'completion02-wave01-population',worker:'wave01-population-deterministic-adapter',sources:Object.values(sourceDefinitions).filter(s=>used.has(s.id)).map(s=>({...s,accessed:'2026-10-02',kind:'licensed-statistical-dataset'})),claims};
 const bindings=[populationPath,attributionPath,base+'cache/owid-full-metadata.json',base+'cache/owid-metadata.json',base+'cache/owid-methodology.html',base+'cache/gapminder-pop-v7-download',base+'cache/gapminder-v7-snapshot-observations.json',base+'extract-gapminder-v7.py',...reviewFiles,'scripts/research-population-wave.mjs',matrixPath].map(path=>({path,sha256:fileHash(path)}));
 const report={rowsExamined:rows.length,sourceRowsExamined:attribution.length,claimsProposed:claims.length,entities:new Set(claims.map(c=>c.entityId)).size,byProvider:Object.fromEntries(Object.values(sourceDefinitions).map(s=>[s.id,claims.filter(c=>c.sourceIds.includes(s.id)).length])),held,skipped,reviewHashes:reviews.map(digest),inputBindings:bindings,cohortHash:digest(cohort),browserChecks:0};
 saveJSON(output+'/cohort.json',cohort);saveJSON(output+'/normalization.json',report);return {cohort,report};
}
if(isCLI(import.meta.url)){const r=buildWave({reviewFiles:process.argv.slice(2)});console.log(JSON.stringify({claims:r.report.claimsProposed,entities:r.report.entities,held:r.report.held.length,skipped:r.report.skipped.length,byProvider:r.report.byProvider}));}
