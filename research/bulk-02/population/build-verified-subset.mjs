import fs from 'node:fs';
import {digest} from '../../../scripts/research-common.mjs';
const base='research/bulk-02/population';
const extraction=JSON.parse(fs.readFileSync(`${base}/dyb1960-population-extracted.json`));
const registry=JSON.parse(fs.readFileSync('data/historical-entities.json'));
const estimates=[
 ['Kenya14','Kenya','kenya-1960-colonial-core',6551,144,'HISTORICALLY_MATCHING_SCOPE','Colonial Kenya total; footnote14 excludes non-African armed forces only for1940–1949, not1960.'],
 ['Ouganda14','Uganda','uganda-1960-reformed-colonial-core',6682,148,'HISTORICALLY_MATCHING_SCOPE','Uganda total; footnote14 historical1940–1949 military exclusions do not alter1960.'],
 ['Canada1.37','Canada','canada-westminster-federal-framework',17814,152,'HISTORICALLY_MATCHING_SCOPE','De-jure population (footnote1), including Newfoundland since1949 (footnote37).'],
 ['Costa Rica','Costa Rica','b10-costa-rica-post-1949',1171,152,'HISTORICALLY_MATCHING_SCOPE','Country total under the source general present-in-area definition.'],
 ['Hong-Kong6S','Hong Kong','hong-kong-historical-administration',2981,156,'HISTORICALLY_MATCHING_SCOPE','Excludes armed forces, includes refugees and immigrants; older quantified refugee observations in footnote65 are not1960 measurements.'],
 ['Israel','Israel','israel-1958-knesset-core',2114,156,'UNCERTAIN_SCOPE','Total Israel, not the separate Jewish-population row. Historical borders and contested territorial scope need explicit mapping review.'],
 ['Qatar','Qatar','qatar-post-1935-treaty-core',45,160,'HISTORICALLY_MATCHING_SCOPE','Country total under source general present-in-area definition.'],
 ['Finlande98','Finland','finland-independent',4456,164,'HISTORICALLY_MATCHING_SCOPE','Present-in-area since1950, including Finnish nationals temporarily outside the country since1951 (footnote98).'],
 ['France99','France','france-political-frameworks',45540,164,'APPROXIMATELY_COMPARABLE_SCOPE','Metropolitan-country statistical total; footnote99 excludes foreign armed forces/diplomats and some career forces abroad, includes merchant seamen, conscripts and civilian residents temporarily abroad. Provisional.'],
 ["Republiquefederale d'AllemagneI",'Federal Republic of Germany','germany-federal-1949-framework',53373,164,'UNCERTAIN_SCOPE','De-jure federal-republic row, distinct from1937-territory Germany, East Germany and separately shown Berlin. Saar/Berlin/polygon compatibility must be independently reviewed.'],
 ['Irlande','Ireland','ireland-independent',2834,164,'HISTORICALLY_MATCHING_SCOPE','Independent Ireland country total, distinct from Northern Ireland separately shown in the next block.'],
 ['Itallell2','Italy','italy-republican-1948-framework',49368,164,'HISTORICALLY_MATCHING_SCOPE','Country total; footnote112 inclusion of forces and civilians stationed outside applies1936–1950, not1960.'],
 ['Norege1','Norway','norway-constitutional-kingdom',3587,164,'HISTORICALLY_MATCHING_SCOPE','De-jure population (footnote1); provisional.'],
 ['Suede1','Sweden','sweden-kingdom',7480,164,'HISTORICALLY_MATCHING_SCOPE','De-jure population (footnote1).'],
 ['Yougoslavie117','Yugoslavia','yugoslav-federal-peoples-republic-framework',18655,168,'HISTORICALLY_MATCHING_SCOPE','Contemporary federal total includes postwar territorial additions; footnote117 warns earlier series boundaries differ and cannot be projected onto1960.'],
 ['Australie119','Australia','australia-postadoption-federal-core',10281,168,'APPROXIMATELY_COMPARABLE_SCOPE','Source footnote119 explicitly excludes full-blooded Aboriginal people. This is not a complete count of all inhabitants; historical exclusion must remain visible.'],
 ['Nouvelle-Zelande128','New Zealand','new-zealand-1960-parliamentary-core',2372,168,'HISTORICALLY_MATCHING_SCOPE','Total including Maori and European populations, not either subgroup. Footnote128 excludes enemy POWs, foreign forces and, from1940, national armed forces abroad.'],
 ['URSS','USSR','soviet-union',214400,168,'HISTORICALLY_MATCHING_SCOPE','Contemporary USSR total; earlier1951 figure has1April exception, not this1960 column.'],
 ['Swaziland','Swaziland','b20-swaziland-british',259,148,'HISTORICALLY_MATCHING_SCOPE','Total territory, not separate European-population row.']
];
const observations=[];
for(const [label,country,entityId,thousands,page,scopeClassification,scope] of estimates){
 const original=extraction.records.find(r=>r.pdfPageIndex===page && r.rawTerritoryLabel===label);
 if(!original) throw Error('Missing exact literal anchor '+label);
 // The hand transcription is explicit facsimile review, not an OCR repair or silent value mutation.
 if(original.candidateValue!==thousands*1000)throw Error('Facsimile/clear OCR cross-check differs '+label);
 observations.push({id:`dyb1960-t4-${entityId}`,category:'population',countryLabel:country,rawTerritoryLabel:label,entityIdSuggested:entityId,observationDate:'1960',observationPrecision:'year',observationType:'estimate',value:thousands*1000,printedValue:thousands,printedUnit:'thousands of persons',unit:'persons',precisionQualification:'Published rounded to thousands; not an exact headcount.',dateQualification:'Contemporary1960 midyear estimate; default1July or mean of consecutive endyear estimates. Retain1960 year precision conservatively; no actual census date inferred from OCR.',scopeClassification,scope,provisional:original.provisional,sourceId:extraction.source.id,sourceBodyHash:extraction.source.sha256,table:4,pdfPageIndex:page,printedPage:page-17,locator:original.locator,originalExtractionRecordId:original.id,renderPath:`${base}/cache/table4-page-${page}.png`,reviewIssues:['Independent printed-type/date/footnote verification required before acceptance.','Suggested existing entity must pass mapping and scope review.'],status:'historical-review'});
}
const censuses=[
 ['Ghana','ghana-1960-monarchical-core','1960-03-20',6690730,280,true,'HISTORICALLY_MATCHING_SCOPE','Ghana total; census predates1July republican transition. No claim carried into republican framework automatically.'],
 ['Morocco','morocco-independent-kingdom-1960-framework','1960-06',11598070,281,true,'HISTORICALLY_MATCHING_SCOPE','June1960 census; source supplies month only, no invented day.'],
 ['Union of South Africa','b19-south-africa-apartheid-union','1960-09-06',15841128,284,true,'APPROXIMATELY_COMPARABLE_SCOPE','Footnote39 includes Walvis Bay administered as part of South West Africa; footnote40 includes armed forces but excludes enemy prisoners of war.'],
 ['United States','united-states','1960-04-01',179323175,287,false,'APPROXIMATELY_COMPARABLE_SCOPE','De-jure total includes armed forces overseas, estimated680000 in1960 (footnote61). Not simply population physically inside map polygon; Alaska/Hawaii included in this census.'],
 ['Japan','japan-postwar-framework','1960-10-01',93418501,292,true,'APPROXIMATELY_COMPARABLE_SCOPE','Footnote110 excludes Allied military/civilian personnel and dependants. Footnote111: actually enumerated, excluding0.39percent adjustment for underenumeration. Earlier adjusted-territory series footnote104 must not be misread as a modern-border estimate of1960.'],
 ['Philippines','b13-philippines-garcia','1960-02-15',27455799,293,false,'HISTORICALLY_MATCHING_SCOPE','Both-sex total explicitly printed across male/female columns.'],
 ['Thailand','b13-thailand-sarit','1960-04-25',25519965,294,true,'HISTORICALLY_MATCHING_SCOPE','Male12729018 plus female12790947. Components are same census/date/scope; arithmetic sum only, no interpolation.'],
 ['Turkey','turkey-1960-national-unity-framework','1960-10-23',27829198,294,false,'HISTORICALLY_MATCHING_SCOPE','Census23October, not20October estimate date from separate Table4 series note. Date follows27May framework transition.'],
 ['Hungary','hungary-post1956-framework','1960-01-01',9976530,296,true,'HISTORICALLY_MATCHING_SCOPE','Male4815838 plus female5160692. January census differs from later midyear estimate10002thousand; observations must remain separately dated.'],
 ['Poland',null,'1960-12-06',29731200,298,true,'HISTORICALLY_MATCHING_SCOPE','Footnote148 second series uses post-WWII territory. First-series1923–1937 borders not projected into this census. Existing valid1960 mapping must be resolved before acceptance.'],
 ['Switzerland',null,'1960-12-01',5411000,298,true,'HISTORICALLY_MATCHING_SCOPE','Second series de-jure population (footnote2); first series de-facto observations not mixed. Existing valid1960 mapping must be resolved before acceptance.'],
 ['Sarawak',null,'1960-06-14',744529,294,true,'HISTORICALLY_MATCHING_SCOPE','Male375846 plus female368683, same-date census of colonial Sarawak; no modernMalaysia fallback. Existing valid1960 mapping must be resolved before acceptance.']
];
for(const [country,entityId,date,value,page,provisional,scopeClassification,scope] of censuses) observations.push({id:`dyb1960-t6-${country.toLowerCase().replaceAll(' ','-')}`,category:'population',countryLabel:country,entityIdSuggested:entityId,observationDate:date,observationPrecision:date.length===7?'month':'day',observationType:'census',value,printedUnit:'persons',unit:'persons',scopeClassification,scope,provisional,sourceId:extraction.source.id,sourceBodyHash:extraction.source.sha256,table:6,pdfPageIndex:page,printedPage:page-17,locator:`Table6/printed${page-17}/${country}/${date}`,renderPath:`${base}/cache/table6-page-${page}.png`,reviewIssues:['Independent exact row/source/footnote verification and historical mapping required.'],status:'historical-review'});
for(const o of observations){if(o.entityIdSuggested&&!registry.entities.some(e=>e.id===o.entityIdSuggested))throw Error('Unknown entity '+o.entityIdSuggested); if(o.observationDate<'1960'||o.observationDate>'1960-12-31')throw Error('Period leakage');}
const out={schemaVersion:1,source:extraction.source,originalExtractionHash:digest(extraction),sourceSelection:'One contemporary official yearbook;1960 population gaps first. Computational full-column acquisition followed by a bounded original-facsimile review subset; no modern-border WPP fallback or bespoke country biography research.',observations,metrics:{candidateObservations:observations.length,estimates:estimates.length,censuses:censuses.length,existingEntitySuggestions:observations.filter(o=>o.entityIdSuggested).length,modernBorderAutomatic:0},productionEdited:false};
fs.writeFileSync(`${base}/verified-source-subset.json`,JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({hash:digest(out),metrics:out.metrics}));
