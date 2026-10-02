import fs from 'node:fs';
import crypto from 'node:crypto';
import {digest} from '../../../scripts/research-common.mjs';
const base='research/completion-01/population', old='research/bulk-02/population';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const original=read(`${old}/dyb1960-population-extracted.json`), prior=read(`${old}/independent-review.json`), registry=read('data/historical-entities.json');
const excluded=prior.rows.filter(r=>r.decision==='source-and-mapping-approved').map(r=>r.observationId);
const rows=[
 ['Tchecoslovaquie95','Czechoslovakia','czechoslovakia-communist-constitutional-framework',13649,164,false,false,'Footnote95: post1947 series includes Bratislava bridgehead; do not project earlier territorial series.'],
 ['Pays.Basl','Netherlands','netherlands-kingdom',11480,164,true,false,'De-jure population, footnote1. Metropolitan Netherlands row, not overseas Kingdom territories.'],
 ['Portugal','Portugal','portugal-political-frameworks',9125,164,false,true,'Portugal country row, distinct from separately listed Portuguese dependencies.'],
 ['Espagne','Spain','spain-political-frameworks',30128,164,false,true,'Spain country row; separate Spanish North African territories are not silently added.'],
 ['MalteetGozollS','Malta and Gozo','malta-british-administration',328,164,true,false,'Malta and Gozo; footnote118 excludes military forces stationed outside country in1956–1959, not1960.'],
 ['Iran71','Iran','iran-post-1957-amendment-framework',20633,156,false,true,'Footnote71 nomad exclusion applies prior1950, not1960; includes contemporary Iranian statistical territory.'],
 ['Rhodesie du Nord','Northern Rhodesia','b19-northern-rhodesia-federal',2430,148,false,true,'Territorial total within federation, not separate European population or federation aggregate.'],
 ['Nyassaland','Nyasaland','b19-nyasaland-federal',2830,148,false,true,'Territorial total within federation, not European subgroup or federation aggregate.'],
 ['Rhodesie duSud','Southern Rhodesia','b19-southern-rhodesia-federal',3070,148,false,true,'Territorial total within federation, not European subgroup or federation aggregate.'],
 ['Region equotorioleespagnole26','Spanish Equatorial region','b17-equatorial-guinea-1960',218,148,false,false,'Spanish Equatorial regional total; same source separates Spanish North African possessions.'],
 ['Guinee','Guinea','b16-guinea-republic',3000,144,false,true,'Republic of Guinea contemporary country total; not Portuguese Guinea.'],
 ['Chili','Chile','chile-restored-presidential-framework',7627,152,true,false,'Contemporary Chile country total.'],
 ['Colombie53','Colombia','colombia-national-front-framework',14132,152,false,true,'Footnote53 excludes district Amerindians only prior1940, not1960.'],
 ['Guyane britannique52','British Guiana','british-guiana-1957-council-framework',559,152,true,false,'Total territory; footnote52 adds Amerindian population excluded prior1940. Separate Amerindian row is a subgroup, not another polity.'],
 ['Paraguay','Paraguay','paraguay-stroessner-early-framework',1703,152,false,false,'Contemporary country total. Facsimile reads1703; raw computational1768 is retained diagnostically and never accepted.'],
 ['Bolivie50','Bolivia','bolivia-post-revolution-framework',3460,152,false,true,'Footnote50: estimate for5September. Facsimile reads3460; OCR3462 is retained diagnostically, never accepted.'],
 ['Haiti44','Haiti','b10-haiti-duvalier',3506,152,false,true,'Footnote44: estimate for7August. Facsimile reads3506; OCR3505 is retained diagnostically, never accepted.'],
 ['Niue','Niue','niue-nz-administration-core',5,168,false,false,'Niue territorial total, not New Zealand total or Cook Islands aggregate.'],
 ['BresU51','Brazil','brazil-1946-federal-framework',65743,152,false,true,'Footnote51 excludes jungle Indian population; approximate scope held for explicit historical review.'],
 ['Equateur54','Ecuador','ecuador-postwar-civilian-framework',4298,152,false,true,'De-jure population excluding jungle Indian population, footnote54; approximate scope held.']
];
const observations=rows.map(([label,country,id,number,page,provisional,questionable,scope])=>{
 const anchor=original.records.find(r=>r.pdfPageIndex===page&&r.rawTerritoryLabel===label);
 if(!anchor)throw Error('Missing anchor '+label);
 const date=country==='Bolivia'?'1960-09-05':country==='Haiti'?'1960-08-07':'1960';
 return {id:`completion-dyb1960-t4-${id}`,category:'population',countryLabel:country,rawTerritoryLabel:label,entityIdSuggested:id,observationDate:date,observationPrecision:date.length===4?'year':'day',observationType:'estimate',value:number*1000,printedValue:number,printedUnit:'thousands of persons',unit:'persons',precisionQualification:'Published rounded to thousands; not exact headcount.',dateQualification:date.length===4?'Table4 contemporary1960 estimate. Default1July or mean of consecutive31December estimates; retain conservative year precision, not census or whole-year validity.':'Explicit country-row footnote supplies observation day; not defaultmidyear.',scopeClassification:['Brazil','Ecuador'].includes(country)?'APPROXIMATELY_COMPARABLE_SCOPE':'HISTORICALLY_MATCHING_SCOPE',scope,provisional,questionableReliability:questionable,qualityQualification:questionable?'Printed italic: estimate of questionable reliability.':'No italic questionable-reliability marker transcribed.',sourceId:original.source.id,sourceBodyHash:original.source.sha256,table:4,pdfPageIndex:page,printedPage:page-17,locator:anchor.locator,originalExtractionRecordId:anchor.id,rawDiagnosticCandidateValue:anchor.candidateValue,transcriptionMethod:'Original facsimile visual transcription; frozen OCR diagnostic preserved unchanged.',renderPath:`${old}/cache/table4-page-${page}.png`,status:'historical-review',reviewIssues:['Independent source/printed-type/footnote and mapping verification required.']};
});
const polish=read(`${old}/verified-source-subset.json`).observations.find(o=>o.id==='dyb1960-t6-poland');
observations.unshift({...polish,id:'completion-dyb1960-t6-poland',entityIdSuggested:'polish-peoples-republic-1952-framework',scope:'Contemporary postwar Polish census. Footnote148 first series1923–1937 territory must not be applied to1960 second-series census.',recoveryProvenance:{originalObservationId:polish.id,reason:'Previous absence-of-framework mapping hold disproved by existing1953–1961 entity; factual date/value retained unchanged.'}});
observations.push({id:'completion-dyb1960-t6-brunei',category:'population',countryLabel:'Brunei',entityIdSuggested:'b13-brunei-self-government',observationDate:'1960-08-10',observationPrecision:'day',observationType:'census',value:83877,unit:'persons',printedUnit:'persons',components:{male:43676,female:40201},derivation:'Sum of printed male and female counts for the same10August1960 census; no interpolation.',scopeClassification:'HISTORICALLY_MATCHING_SCOPE',scope:'Contemporary Brunei total in Table6; not Burma row adjacent in opposite column.',provisional:true,sourceId:original.source.id,sourceBodyHash:original.source.sha256,table:6,pdfPageIndex:290,printedPage:273,locator:'Table6/printed273/Brunei/10VIII1960',renderPath:`${base}/table6-page-290.png`,status:'historical-review',reviewIssues:['Independent original row/sex-component sum/date and mapping verification required.']});
for(const o of observations){if(!registry.entities.some(e=>e.id===o.entityIdSuggested))throw Error('Unknown entity '+o.entityIdSuggested);if(excluded.includes(o.id)||excluded.includes(o.recoveryProvenance?.originalObservationId))throw Error('Already integrated');}
const sourceBindings=[...new Set(observations.map(o=>o.renderPath))].map(path=>({path,sha256:crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')}));
const result={schemaVersion:1,source:original.source,sourceBindings,excludedPreviouslyIntegratedObservationIds:excluded,observations,provenance:{originalExtractionDigest:digest(original),priorReviewDigest:digest(prior),newHTTPRetrievalAttempts:0,cachedSourceReuse:true,productionEdited:false,priorFrozenFilesModified:false},metrics:{observations:observations.length,censuses:2,estimates:rows.length,explicitApproximateScopeHolds:2}};
fs.writeFileSync(`${base}/source-verifiable-cohort.json`,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({digest:digest(result),metrics:result.metrics,excluded:excluded.length}));
