// Full-source point-observation intake. Territorial approvals are explicit and bounded.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {readJSON,readContext,saveJSON,digest,isCLI} from './research-common.mjs';
import {temporalBounds} from './research-comprehensive.mjs';
export const base='research/completion-03/population';
export const years=[1800,1815,1878,1880,1900,1914,1920,1930,1938];
export const qualityLabels={A:'excellent: trustworthy census/register-based estimate',B:'good: modern-census interpolation or incompletely reliable census',C:'fair: scholarly reconstruction or imperfect-census interpolation with supporting evidence'};
const doi={africa:'8EWODF',america:'NAEF8A',asia:'SSMGAY',europe:'WZUV5E',oceania:'JBGFP6'};
const versions={africa:'2026-v01, repository 2.1',america:'2025-v01, repository 3.0',asia:'2025-v01, repository 2.0',europe:'2025-v01, repository 2.0',oceania:'2023-v01, repository 1.0'};
export function screenFederico({observations,mappings,matrix,entities}){
 const accepted=[],held=[],skipped=[],seen=new Set();
 for(const m of mappings){
  const signature=m.entityId+'|'+m.year;if(seen.has(signature))throw Error('Overlapping territorial approvals: '+signature);seen.add(signature);
  const slot=matrix.rows.find(r=>r.entityId===m.entityId&&r.snapshotYear===m.year);
  if(!slot||!years.includes(m.year)){held.push({...m,reason:'No configured represented snapshot'});continue;}
  if(slot.categories['population-statistics'].status==='supported'){skipped.push({...m,reason:'Existing supported evidence takes precedence'});continue;}
  if(!['EXACT','HIGH_CONFIDENCE'].includes(m.confidence)||!m.scopeRationale||!m.review?.reviewer||slot.mappingPartial){held.push({...m,reason:'Unapproved or partial identity/territorial mapping'});continue;}
  const hits=observations.filter(r=>r.polity===m.polity&&r.year===m.year);
  if(hits.length!==1){held.push({...m,reason:'No unique exact-year source observation'});continue;}
  const row=hits[0];
  if(!qualityLabels[row.quality]||!Number.isFinite(row.valueThousands)||row.valueThousands<=0){held.push({...m,reason:'Source quality D/E/NE, missing grade, or zero/invalid value',quality:row.quality});continue;}
  if(row.continent==='africa'&&!['Algeria','Egypt','Tunisia'].includes(row.polity)){held.push({...m,reason:'2026 revised series cannot inherit the 2025 quality assessment'});continue;}
  const e=entities.find(e=>e.id===m.entityId);if(!e)throw Error('Unknown historical entity');
  const point=temporalBounds({kind:'observation',observationDate:String(m.year)}),exist=temporalBounds({kind:'interval',from:e.existence.validFrom,until:e.existence.validUntil||'1961-01-01'});
  if(point.lo<exist.lo||point.hi>exist.hi){held.push({...m,reason:'Year precision straddles existing historical-framework validity; transition held'});continue;}
  accepted.push({mapping:m,row});
 }
 return {accepted,held,skipped};
}
export function populationClaim({mapping:m,row:r}){
 const temporal={kind:'observation',observationDate:String(r.year),certainty:'exact'},sourceId='ftwphd-'+r.continent;
 return {id:'ftwphd-population-'+digest([m.entityId,r.polity,r.year,r.valueThousands,r.fileSHA256]).slice(0,24),entityId:m.entityId,category:'population-statistics',value:Math.round(r.valueThousands*1000),unit:'persons',metric:'Population (Federico–Tena historical-border estimate)',temporal,
  scope:{id:m.entityId+'-ftwphd-historical-statistical-territory',description:m.scopeRationale,relationship:'same'},sourceIds:[sourceId,'ftwphd-methodology-2025','ftwphd-quality-2025'],
  evidence:[{sourceId,locator:`${r.file}, ${r.sheet}, row ${r.row}, column ${r.column}; polity=${r.polity}; year=${r.year}; original population (000)=${r.valueThousands}`,note:'Literal original annual historical-border reconstruction. Multiply original thousands by 1000 and round for persons-unit display; original value retained. Source-derived estimate, not proof of a census in this year. No atlas interpolation or observation-to-interval conversion.',precision:'year',temporal,interpretation:'direct'},
   {sourceId:'ftwphd-methodology-2025',locator:m.sourceLocator,note:m.scopeRationale+' Source unit matched to this registry framework; no modern ISO or geometry-derived sovereignty.',precision:'year',temporal,interpretation:'direct'},
   {sourceId:'ftwphd-quality-2025',locator:`Quality Assessment worksheet; source polity=${r.polity}; year=${r.year}; grade=${r.quality}; original workbook SHA256 bound in intake certificate`,note:qualityLabels[r.quality]+'. Quality grades describe the source reconstruction, not historical certainty of an exact headcount.',precision:'year',temporal,interpretation:'direct'}],
  status:'supported',risks:[],qualifications:[`Source-produced historical estimate; observation year ${r.year}. No claim that a census occurred in the selected snapshot.`,`Source quality ${r.quality} — ${qualityLabels[r.quality]}.`,'Source historical-border series, not the separate 1991-border reconstruction.',m.scopeRationale],
  origin:{kind:'bulk-candidate',reference:`Federico and Tena-Junguito; DOI 10.21950/${doi[r.continent]}; ${versions[r.continent]}; original polity ${r.polity}; original thousands ${r.valueThousands}; year ${r.year}; extraction 2026-10-02; mapping ${m.confidence}; workbook SHA256 ${r.fileSHA256}`,sourceIdentifier:`${r.sheet}:${r.column}:${r.year}`}};
}
export function buildFederico(){
 const extracted=readJSON(base+'/observations.json'),crosswalk=readJSON(base+'/historical-crosswalk.json'),matrix=readJSON('research/completion-01/reports/completion.json'),context=readContext(),store=readJSON('data/comprehensive-dossiers.json');
 const result=screenFederico({observations:extracted.observations,mappings:crosswalk.mappings,matrix,entities:context.db.entities});
 const claims=result.accepted.map(populationClaim),continents=[...new Set(result.accepted.map(x=>x.row.continent))];
 const sources=[...continents.map(continent=>({id:'ftwphd-'+continent,title:`Federico–Tena World Population Historical Database: ${continent[0].toUpperCase()+continent.slice(1)} (${versions[continent]})`,institution:'Giovanni Federico and Antonio Tena-Junguito; Universidad Carlos III de Madrid / e-cienciaDatos',url:'https://doi.org/10.21950/'+doi[continent],accessed:'2026-10-02',kind:'academic-historical-population-dataset',license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',attribution:'Federico, Giovanni; Tena Junguito, Antonio. Federico–Tena World Population Historical Database. e-cienciaDatos; cited continental DOI/version.',usage:'Annual reconstructed historical-border population, in thousands; original polity/year cells and rounding method retained. Includes native populations where reconstructed. Not the separately published 1991-border series. Only reviewed source-unit/entity/year crosswalks and quality A/B/C accepted.'})),
 {id:'ftwphd-methodology-2025',title:'Federico and Tena-Junguito (2025), World Population 1800–1938, IFCS Working Paper 2025-1',institution:'Instituto Figuerola, Universidad Carlos III de Madrid',url:'https://hdl.handle.net/10016/45843',accessed:'2026-10-02',kind:'academic-historical-demography-methodology',usage:'Appendix I describes historical-border polity reconstruction; section 4.1 explicitly lists aggregates, precolonial backward projections and ignored Napoleonic entities. Appendix II 1991-border reconstruction is excluded. Original bibliography and qualifications remain in cached open-access paper.'},
 {id:'ftwphd-quality-2025',title:'Federico–Tena World Population Historical Database: Quality Assessment Population (2025), version 2.0',institution:'Giovanni Federico and Antonio Tena-Junguito; Universidad Carlos III de Madrid / e-cienciaDatos',url:'https://doi.org/10.21950/U6AANV',accessed:'2026-10-02',kind:'academic-population-quality-assessment',license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',attribution:'Federico, Giovanni; Tena Junguito, Antonio (2025). Quality Assessment Population. e-cienciaDatos, V2.',usage:'Literal polity/year grades A excellent, B good, C fair, D poor, E conjectural; D/E/NE/unknown held. 2025 grades are not transferred to revised African 2026 estimates; only explicitly unchanged series permitted.'}];
 const cohort={id:'completion03-ftwphd-historical-population',worker:'ftwphd-literal-excel-normalizer',sources,claims};
 saveJSON(base+'/intake/cohort.json',cohort);saveJSON(base+'/intake/screening.json',{...result,accepted:result.accepted.map(x=>({entityId:x.mapping.entityId,year:x.row.year,polity:x.row.polity,quality:x.row.quality})),recordsExamined:extracted.observations.length,politySeries:extracted.series.length});
 saveJSON(base+'/baseline.json',matrix);saveJSON(base+'/preserved-package-hashes.json',store.packages.map(p=>({id:p.id,hash:digest(p)})));
 const paths=[base+'/observations.json',base+'/historical-crosswalk.json',base+'/extract.py',base+'/build-crosswalk.py','scripts/research-federico-tena.mjs',...new Set(extracted.observations.map(r=>r.file)),...fs.readdirSync(base+'/cache/quality-bundle').filter(f=>f.endsWith('.xlsx')||f.endsWith('.pdf')).map(f=>base+'/cache/quality-bundle/'+f),base+'/cache/methodology-2025.pdf'];
 saveJSON(base+'/intake/certificate.json',{cohortHash:digest(cohort),reviewer:'/root original-source historical-border and quality review',bodyReviewed:true,acceptedClaimIds:claims.map(c=>c.id),inputBindings:paths.map(path=>({path,sha256:crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')})),rationale:'Full five-continent original historical-border workbooks and original quality workbook acquired under user-approved CC BY 4.0 terms. Coordinator reviewed official methodology section 4.1 and Appendix I before approving explicit source-statistical-unit/entity/year crosswalks. Aggregate island groups, modern-border reconstructions, precolonial backward mappings, Napoleonic aggregates, source-quality D/E/NE, transition-year precision, incomplete mapping and unresolved territorial exceptions remain held. All observations retain exact source year, raw thousands, reconstruction grade and literal cell. Original accepted evidence takes precedence; no overwrites, no new interpolation, no point-to-interval propagation, no density inference.'});
 return {claims:claims.length,entities:new Set(claims.map(c=>c.entityId)).size,held:result.held.length,skipped:result.skipped.length,byContinent:Object.fromEntries(continents.map(x=>[x,result.accepted.filter(r=>r.row.continent===x).length]))};
}
if(isCLI(import.meta.url))console.log(JSON.stringify(buildFederico()));
