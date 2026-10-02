// Source-wide assessment. Matching suggestions never authorize production facts.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {readJSON,readContext,saveJSON,digest,isCLI} from './research-common.mjs';
import {temporalBounds} from './research-comprehensive.mjs';
export const base='research/completion-03/un-followup';
export const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
export const approvals1945=[
 ['Denmark', 'denmark-post-kiel',1945,'1945-06-15',4045232,27,'De jure population; excludes the Faeroes, which have a separate row (footnotes 21,72).'],
 ['Turkey','turkey-1937-constitutional-framework',1945,'1945-10-21',18790174,25,'Whole Turkey including European Turkey and Hatay; Hatay included from 1939 (footnote 55).'],
 ['New Zealand','new-zealand-preadoption-dominion-core',1945,'1945-09-25',1747679,29,'New Zealand census including 45,381 armed forces overseas (footnote 99); dependencies tabulated separately. Not polygon-equivalent population.'],
 ['Portugal','portugal-political-frameworks',1940,'1940-12-12',7722152,28,'Portugal national statistical territory; overseas colonies are separate source rows, not part of this count.'],
 ['Spain','spain-political-frameworks',1940,'1940-12-31',25877971,28,'Spain national statistical territory; protectorate and overseas possessions are separately tabulated.'],
 ['Chile','chile-restored-presidential-framework',1940,'1940-11-28',5023539,24,'Chile country census row; not an empire aggregate or modern-border reconstruction.'],
 ['Puerto Rico','b11-puerto-rico-jones',1940,'1940-04-01',1869255,23,'De jure population including US armed forces stationed in the area (footnote 27).'],
 ['Turques et Caicos','b11-turks-caicos-jamaica',1943,'1943-01-04',6138,23,'Turks and Caicos separate dependency census row; de jure population (footnote 21).'],
 ['Virgin Islands [U.S.]','b11-virgin-islands-organic',1940,'1940-04-01',24889,23,'St Thomas, St John and St Croix (footnote 28); de jure population including US armed forces stationed in the area (footnote 27).']
];
export function eligibleDate(date,entity,snapshot=1945){
 const year=Number(date.slice(0,4));if(year>snapshot||snapshot-year>5)return false;
 const t=temporalBounds({kind:'observation',observationDate:date}),e=temporalBounds({kind:'interval',from:entity.existence.validFrom,until:entity.existence.validUntil||'1961-01-01'});
 return t.lo>=e.lo&&t.hi<=e.hi;
}
export function assess1945(){
 const matrix=readJSON('research/completion-01/reports/completion.json'),db=readContext().db,rows=readJSON('research/completion-03/un1945/census-candidates.json');
 const disposition=rows.map(r=>({...r,decision:r.year>1945?'future-observation-not-applicable':r.year<1940?'outside-past-observation-window':'held-source-or-territorial-mapping-unapproved'}));
 const safe=[],skipped=[],held=[];
 for(const [name,entityId,year,date,value,page,scope]of approvals1945){
  const row=rows.find(r=>r.pdfPage===page&&r.year===year&&r.countryRowOCR.includes(name));
  if(!row)throw Error('Reviewed source row absent: '+name);
  const slot=matrix.rows.find(r=>r.snapshotYear===1945&&r.entityId===entityId),entity=db.entities.find(e=>e.id===entityId);
  const item={name,entityId,year,date,value,page,scope,originalRow:row};
  if(!slot||slot.mappingPartial||!eligibleDate(date,entity)){held.push({...item,reason:'Framework/transition/date incompatibility'});continue;}
  if(slot.categories['population-statistics'].status==='supported'){skipped.push(item);disposition[rows.indexOf(row)].decision='already-supported';continue;}
  safe.push(item);disposition[rows.indexOf(row)].decision='safe-reviewed-source-and-scope-match';
 }
 const snapshotRows=matrix.rows.filter(r=>r.snapshotYear===1945);
 const report={source:'United Nations Statistical Yearbook 1948, Table 1',rowsExamined:rows.length,exact1945Candidates:rows.filter(r=>r.year===1945).length,earlier1940To1944Candidates:rows.filter(r=>r.year>=1940&&r.year<1945).length,sourceColumns:['latest census with actual date','1937 estimate','1946 estimate','1947 estimate'],exact1945EstimateColumn:false,representedDossiers:snapshotRows.length,alreadySupportedSlots:snapshotRows.filter(r=>r.categories['population-statistics'].status==='supported').length,safeNewSlots:safe.length,safeExact1945:safe.filter(r=>r.year===1945).length,safeEarlierDated:safe.filter(r=>r.year<1945).length,safe,skipped,held,disposition,policy:'No future observation, no observation retiming, no automatic alias acceptance; territorial exceptions, aggregate/subdivision rows and OCR footnote digits remain held. Complete source extraction is a candidate universe, not an assertion of complete atlas territorial crosswalk coverage.'};
 saveJSON(base+'/1945-yield.json',report);return report;
}
export function build1945(){
 const r=assess1945(),source={id:'un-statistical-yearbook1948-population-table1',title:'United Nations Statistical Yearbook 1948, Table 1: Population, area and density',institution:'Statistical Office of the United Nations',url:'https://unstats.un.org/UNSDWebsite/Publications/StatisticalYearbook/SYB1.pdf',accessed:'2026-10-02',kind:'official-statistical-yearbook',usage:'Literal latest-census observations, with actual enumeration dates, original footnotes and contemporary country/area scope. Persons, not the separate estimates in thousands. No redistribution of a derived bulk dataset; independently sourced historical facts retain citation.'};
 const claims=r.safe.map(x=>{let temporal={kind:'observation',observationDate:x.date,certainty:'exact'};return {id:'un1948-census-'+digest([x.entityId,x.date,x.value]).slice(0,24),entityId:x.entityId,category:'population-statistics',value:x.value,unit:'persons',metric:'Population (UN-reported census)',temporal,scope:{id:x.entityId+'-un1948-census-territory',description:x.scope,relationship:'same'},sourceIds:[source.id],evidence:[{sourceId:source.id,locator:`Table 1, printed page ${x.page-1}, PDF page ${x.page}, latest census column, ${x.name}; ${x.date}; ${x.value} persons`,note:x.scope+' Original literal source row and source PDF SHA256 retained in the certified intake. Superscript footnotes excluded from numerical values after original-source review.',precision:'day',temporal,interpretation:'direct'}],status:'supported',risks:[],qualifications:[x.scope,`Actual census observation ${x.date}; displayed in the 1945 dossier under the existing past-observation window. Not a 1945 population observation unless dated 1945.`,'Statistical scope is not certified equal to mapped polygon scope; no automatic density derivation.'],origin:{kind:'bulk-candidate',reference:'United Nations Statistical Yearbook 1948 Table 1; literal country/territory census row; historical-framework scope checked',sourceIdentifier:`table1:pdf${x.page}:${x.name}:${x.date}`}};});
 const cohort={id:'completion03-un1945-past-censuses',worker:'un1948-literal-table-adapter',sources:[source],claims};
 const paths=['scripts/research-un-population-followup.mjs','research/completion-03/un1945/census-candidates.json','research/completion-03/un1945/cache/SYB1.pdf',...new Set(r.safe.map(x=>`research/completion-03/un1945/cache/table1-pdfpage${x.page}.txt`))];
 saveJSON(base+'/1945-intake/cohort.json',cohort);saveJSON(base+'/1945-intake/certificate.json',{cohortHash:digest(cohort),reviewer:'/root original UN census source and historical-scope review',bodyReviewed:true,acceptedClaimIds:claims.map(x=>x.id),inputBindings:paths.map(path=>({path,sha256:hash(path)})),rationale:'Source-wide yield screening first. Only literal country/territory rows with independently checked census dates, values, footnotes and already-established historical entity scopes accepted. Exact dates retained; nearby past censuses never relabelled 1945. Future censuses, Finland territorial adjustment, colonial subdivisions/aggregates, non-indigenous-only counts and all unapproved mappings held. Original accepted evidence preserved. Density forbidden without a separate polygon-scope certificate.'});
 saveJSON(base+'/baseline.json',readJSON('research/completion-01/reports/completion.json'));saveJSON(base+'/preserved-package-hashes.json',readJSON('data/comprehensive-dossiers.json').packages.map(p=>({id:p.id,hash:digest(p)})));
 return {safe:r.safe.length,exact:r.safeExact1945,earlier:r.safeEarlierDated,rows:r.rowsExamined};
}
if(isCLI(import.meta.url))console.log(JSON.stringify(process.argv.includes('--build')?build1945():assess1945()).slice(0,1800));
