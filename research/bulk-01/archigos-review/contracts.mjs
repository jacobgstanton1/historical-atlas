import fs from 'node:fs';import crypto from 'node:crypto';
import {readContext,digest} from '../../../scripts/research-common.mjs';
const context=readContext(),rows=JSON.parse(fs.readFileSync('research/bulk-01/cache/archigos-extracted.json'));
const declarations=[
['USA',6,['united-states'],[['1875-01-01','1961-01-01']]],
['CAN',8,['canada-1867-federal-framework','canada-westminster-federal-framework']],
['UKG',341,['united-kingdom'],[['1875-01-01','1961-01-01']]],
['IRE',343,['ireland-independent'],[['1923-01-01','1961-01-01']]],
['NTH',346,['netherlands-kingdom'],[['1875-01-01','1940-01-01'],['1946-01-01','1961-01-01']]],
['BEL',348,['belgium-kingdom'],[['1875-01-01','1914-01-01'],['1919-01-01','1940-01-01'],['1946-01-01','1961-01-01']]],
['FRN',354,['france-political-frameworks'],[['1876-01-01','1940-01-01'],['1947-01-01','1958-01-01'],['1959-01-01','1961-01-01']]],
['POR',372,['portugal-political-frameworks'],[['1875-01-01','1961-01-01']]],
['SPN',366,['spain-political-frameworks'],[['1877-01-01','1923-01-01'],['1924-01-01','1930-01-01'],['1932-01-01','1936-01-01'],['1940-01-01','1961-01-01']]],
['SWD',490,['sweden-kingdom'],[['1875-01-01','1961-01-01']]],
['NOR',494,['norway-constitutional-kingdom'],[['1906-01-01','1940-01-01'],['1946-01-01','1961-01-01']]],
['DEN',497,['denmark-post-kiel'],[['1875-01-01','1940-01-01'],['1946-01-01','1961-01-01']]],
['FIN',488,['finland-independent'],[['1920-01-01','1961-01-01']]],
['ICE',501,['iceland-sovereign'],[['1919-01-01','1940-01-01'],['1945-01-01','1961-01-01']]],
['GMY',377,['germany-imperial-framework','germany-weimar-framework']],
['GFR',379,['germany-federal-1949-framework']],
['GDR',380,['germany-democratic-1949-framework'],[['1950-07-25','1961-01-01']]],
['ITA',405,['italy-liberal-monarchy-framework','italy-fascist-monarchical-framework','italy-republican-1948-framework']],
['MEX',88,['mexico-porfirian-framework','mexico-1917-constitutional-framework']],
['BRA',270,['brazil-pedro-ii-imperial-framework','brazil-early-federal-republic-framework','brazil-estado-novo-framework','brazil-1946-federal-framework']],
['ARG',319,['argentina-pre-1930-federal-framework','argentina-1949-constitutional-framework']],
['CHL',308,['chile-late-1833-framework','chile-parliamentary-practice-framework','chile-restored-presidential-framework']],
['COL',222,['colombia-united-states-framework','colombia-national-front-framework']],
['VEN',229,['venezuela-guzman-framework','venezuela-castro-framework','venezuela-gomez-framework','venezuela-lopez-framework','venezuela-medina-framework','venezuela-betancourt-1959-framework']],
['ECU',240,['ecuador-1906-liberal-framework','ecuador-postwar-civilian-framework']],
['PER',256,['peru-restored-1860-prewar-framework','peru-later-1860-framework']],
['BOL',275,['bolivia-late-1880-constitutional-framework','bolivia-1944-social-framework','bolivia-post-revolution-framework']],
['PAR',296,['paraguay-1870-constitutional-framework','paraguay-1940-executive-framework','paraguay-stroessner-early-framework']],
['URU',329,['uruguay-late-1830-framework','uruguay-dual-executive-framework','uruguay-postwar-presidential-framework']],
['HAI',16,['b10-haiti-duvalier']],
['DOM',41,['b10-dominican-trujillo']],
['GUA',94,['b10-guatemala-ubico']],
['HON',112,['b10-honduras-carias']],
['SAL',136,['b10-salvador-martinez']],
['NIC',160,['b10-nicaragua-somoza-control']],
['COS',190,['b10-costa-rica-post-1949']],
['LBR',549,['liberia-presidential-constitutional-core']],
['AUL',847,['australia-prewestminster-federal-core','australia-postadoption-federal-core']],
['NEW',853,['new-zealand-preadoption-dominion-core','new-zealand-1960-parliamentary-core']],
['IND',765,['india-republic-1950-framework']],
['SRI',794,['ceylon-independent-parliamentary-framework']],
['TUR',670,['turkey-1928-constitutional-framework','turkey-1937-constitutional-framework','turkey-1960-national-unity-framework']],
['THI',808,['b13-siam-absolute','b13-siam-constitutional','b13-thailand-sarit']],
];
const dateStart=v=>v?.length===4?v+'-01-01':v?.length===7?v+'-01':v;
// A coarse ending year/month is held at its start rather than expanded into invented exact validity.
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const excludedRows=[{obsid:'CAN-1911',reason:'Codebook p.8 table ENDDATE 10 June 1920 conflicts with narrative 10 July 1920; hold exact date.'},{obsid:'GMY-1858',reason:'Codebook p.377 explicitly notes an acting Crown Prince interval in 1878; no fabricated boundary or sole-ruler assertion.'},{obsid:'GDR-1946',reason:'Country coding begins before GDR state formation; hold whole inherited row rather than reinterpret pre-state party leadership as state office.'}];
const contracts=[];
for(const [idacr,printedPage,ids,windows] of declarations){
 for(const id of ids){const e=context.db.entities.find(e=>e.id===id);if(!e)throw Error('Missing entity '+id);const existence=e.existence||e,n=e.names.find(n=>n.kind==='primary')||e.names[0];
 const from=dateStart(existence.validFrom||n.validFrom)||'1875-01-01',until=dateStart(existence.validUntil||n.validUntil)||'1961-01-01';
 for(const w of windows||[[from,until]]){let a=[from,w[0],'1875-01-01'].sort().at(-1),b=[until,w[1],'1961-01-01'].sort()[0];if(a>=b)continue;
 const frameworkSources=[...new Set([...(existence.sourceIds||[]),...(n.sourceIds||[]),...(e.politicalStatus||[]).filter(f=>(!f.validUntil||dateStart(f.validUntil)>a)&&(!f.validFrom||dateStart(f.validFrom)<b)).flatMap(f=>f.sourceIds||[])])];
 contracts.push({id:'archigos-'+idacr+'-'+id+'-'+a,sourceCountryCode:idacr,entityId:id,from:a,until:b,sourceCountryLocator:'Archigos v4.1 case descriptions, printed p.'+printedPage+' (PDF page '+(printedPage+6)+')',existingIdentity:{name:n.value,validFrom:existence.validFrom||n.validFrom||null,validUntil:existence.validUntil||n.validUntil||null,sourceIds:frameworkSources},rationale:'Explicit Archigos country-case namespace corresponds to this already-sourced historical atlas state/framework during this bounded interval. Framework boundary comes from the existing reviewed entity; it is not inferred from geometry or succession.',qualifications:['Effective political leader according to Archigos academic coding; not automatically a formal head of state or an office title.','Country coding is not evidence of sovereignty of every map polygon.','Bounded display interval may truncate a longer leader spell at an existing framework boundary; preserve original source start/end in provenance.','Source ENDDATE remains unchanged: conservative exclusive display cutoff omits the final coded day instead of assuming inclusive semantics.'],role:'Effective political leader (Archigos coding)',status:'approved-mapping-contract',reviewer:'scale-flags-independent-archigos'});
 }
 }
}
const candidates=rows.filter(r=>r.startdate<'1961-01-01'&&r.enddate>'1875-01-01');
const encodingHeld=candidates.filter(r=>/[^\x00-\x7f]/.test(r.leader)).map(r=>({obsid:r.obsid,leader:r.leader,reason:'Stata parser emitted Latin1 fallback warning. Preserve exact bytes/spelling; accented row held until separately verified, never silently repair.'}));
const eligible=candidates.filter(r=>!excludedRows.some(h=>h.obsid===r.obsid)&&!encodingHeld.some(h=>h.obsid===r.obsid)&&contracts.some(c=>c.sourceCountryCode===r.idacr&&r.startdate<c.until&&r.enddate>c.from));
const out={schemaVersion:1,reviewer:'scale-flags-independent-archigos',sourceTier:'B — academic historical dataset',source:{title:'Archigos: A Data Set on Leaders, 1875–2015, version 4.1 (29 February 2016)',authors:['H. E. Goemans','Kristian Skrede Gleditsch','Giacomo Chiozza'],codebookUrl:'https://www.rochester.edu/college/faculty/hgoemans/Archigos_4.1.pdf',bodyReviewed:true,bodyReviewScope:'Codebook definition/coding conventions printed pp.1–5; country-case namespace and context sections where relevant. This does not certify every 882-page historical narrative or each proposed claim before normalization.',hashes:{dta:sha('research/bulk-01/cache/Archigos_4.1_stata14.dta'),pdf:sha('research/bulk-01/cache/Archigos_4.1.pdf'),extracted:sha('research/bulk-01/cache/archigos-extracted.json')},parser:{rows:rows.length,encoding:'pandas UTF8 decoding with documented Latin1 fallback',policy:'No spelling expansion or encoding repair. Non-ASCII candidates are held pending individual verification.'}},datePolicy:{codebookDefinition:'STARTDATE and ENDDATE identify beginning and end of each leader spell.',observedMixedBoundaries:'US successive spells share transfer day; Swiss annual rotating chair ends31December and next begins1January.',integrationRule:'No universal inclusive semantics asserted; use original ENDDATE as conservative exclusive cutoff, record omission of final coded day. Do not invent next-day endpoint. Empty or same-day intervals held.'},contracts,held:{rows:excludedRows,encoding:encodingHeld,countries:[{idacr:'SWZ',reason:'Rotating annual executive council chair; generic primary-ruler representation risks implying sole executive power.'},{idacr:'RUS',reason:'Imperial/revolutionary/Soviet country coding requires more detailed cross-framework contracts; held in this first tranche.'},{idacr:'CHN',reason:'Contested and competing national/state frameworks; no whole-country automatic mapping.'}],general:['Unlisted country/framework is held, not silently mapped to a modern successor.','Occupied intervals excluded for Netherlands, Belgium, Norway, Denmark, France, Iceland; no occupation-to-sovereign fallback.','No pre-1875 extrapolation despite source rows starting earlier.','Uruguay collegiate1953–1960 framework held rather than implying a council chair is the sole ruler.']},summary:{countryCodes:declarations.length,contracts:contracts.length,eligibleOriginalRows:eligible.length,mappedEntityCount:new Set(contracts.map(c=>c.entityId)).size,excludedExplicitRows:excludedRows.length,encodingHeldRows:encodingHeld.length}};
fs.mkdirSync('research/bulk-01/archigos-review',{recursive:true});fs.writeFileSync('research/bulk-01/archigos-review/mapping-contracts.json',JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({...out.summary,hash:digest(out)}));
