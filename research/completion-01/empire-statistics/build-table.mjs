import fs from 'node:fs';
import crypto from 'node:crypto';
import {readContext,digest,dateRange} from '../../../scripts/research-common.mjs';
import {completionMatrix} from '../../../scripts/research-completion.mjs';
const base='research/completion-01/empire-statistics';
const data=`100|England & Wales|58340|36070492
100|Scotland|30405|4760904
100|Ireland|32586|4390219
100|Islands|302|148915
100|Total United Kingdom|121633|45370530
100|India British|1092994|244221377
100|India Native States|709118|70864995
100|Total India|1802112|315086372
100|Aden including Perim|80|46165
100|Socotra|1382|12000|1
100|Straits Settlements|1572|715529
100|Labuan|28|6456
100|Ceylon|25481|4106350|2
100|Mauritius|720|368791
100|Dependencies of Mauritius|89|6690
100|Seychelles|156|22691
100|Hong Kong||366145|3,4
100|New Territories||90594|4
100|Wei-Hai-Wei|285|147133|4
100|New South Wales|309460|1646734
100|Federal Capital Territory|912|1714
100|Victoria|87884|1315551
100|South Australia|380070|408558
100|Northern Territory|523620|3310
100|Western Australia|975920|282114
100|Tasmania|26215|191211
100|Queensland|670500|605813
100|Total Commonwealth of Australia|2974581|4455005|5
100|Territory of Papua|90540|380000|1
100|Dominion of New Zealand|104751|1008468
100|Fiji|7435|139541
100|Falkland Islands|7500|3275
101|Natal|35371|1194043
101|Cape of Good Hope|276995|2564965
101|Orange Free State|50392|528174
101|Transvaal|110426|1686212
101|Total Union of South Africa|473184|5973394
101|Swaziland|6536|99959
101|Basutoland|11716|404507
101|Bechuanaland Protectorate|275000|125350
101|Rhodesia Southern|148575|771077
101|Rhodesia Northern|291000|822482|7
101|Nyasaland Protectorate|39315|970430
101|Uganda Protectorate|121437|2843325|6
101|East Africa Protectorate|247600|2402863
101|Somaliland Protectorate|68000|344323
101|St Helena|47|3477|2
101|Ascension|34|400
101|Nigeria Northern Protectorate|256200|9269000
101|Nigeria Southern and Colony|79880|7857983|8
101|Gold Coast|80235|1501793
101|Sierra Leone|24908|1403132|8,9
101|Gambia|3619|146101|8
101|Total West Africa|444842|20178009
101|Dominion of Canada|3729665|7206643
101|Newfoundland|42734|238670
101|Labrador|120000|3949
101|Total North America|3892399|7449262
102|Bahamas|4404|55944
102|Turks and Caicos Islands|166|5615
102|Jamaica|4207|831383
102|Cayman Islands|89|5564
102|St Lucia|233|48637
102|St Vincent|140|41877
102|Barbados|166|171983
102|Grenada|133|66750
102|Virgin Islands|58|5557
102|St Christopher|65|26283
102|Nevis|50|12945
102|Anguilla|35|4075
102|Antigua including Barbuda|170|32265
102|Montserrat including Redonda|32|12316
102|Dominica|305|33863
102|Trinidad|1860|312803
102|Tobago|114|20749
102|Total West Indies|12227|1688609
102|Bermuda|19|18994|3
102|British Honduras|8598|40458
102|British Guiana|90500|296041|3
102|Gibraltar|1 5/6|19120|2
102|Malta|117|211564|3
102|Cyprus|3354|273964|3
102|Grand Total|11273250|417269433`;
const notes={1:'Estimated population 1910.',2:'Excludes military and persons on ships in harbours.',3:'Population excludes military.',4:'New Territories and Wei-Hai-Wei leased in 1898; New Kowloon 13 sq miles and 13693 persons included in Hong Kong since 1904. Table combines Hong Kong/New Territories area 404 square miles but separates populations.',5:'Australia population excludes full-blooded aborigines, estimated by this source at 100000 in 1911; historical discriminatory category retained only as source scope qualification.',6:'Uganda area includes lakes and River Nile within protectorate territorial limits.',7:'Partly estimated; census of natives unavailable.',8:'Includes Protectorate districts.',9:'Includes 567561 children whose sex is not stated.'};
const map={
'Total United Kingdom':['united-kingdom','Table total includes Islands; precise geographical scope requires review.'],
'India British':['british-raj','Direct British India row excludes Native States; Raj framework broader, hold.'],
'Total India':['british-raj','British India plus Native States; explicitly composite statistical geography, review.'],
'Ceylon':['ceylon-legislative-council-framework'],
'Hong Kong':['hong-kong-historical-administration','Split New Territories statistics; hold rather than silently combine.'],
'Total Commonwealth of Australia':['australia-prewestminster-federal-core'],
'Dominion of New Zealand':['new-zealand-preadoption-dominion-core'],
'Total Union of South Africa':['b19-south-africa-early-union'],
'Basutoland':['b19-basutoland-council'],
'Bechuanaland Protectorate':['b19-bechuanaland-early'],
'Rhodesia Northern':['b19-northern-rhodesia-company'],
'Nyasaland Protectorate':['b19-nyasaland-governor'],
'Uganda Protectorate':['uganda-colonial-pre1952-core'],
'Somaliland Protectorate':['british-somaliland-prewar-core'],
'Swaziland':['b20-swaziland-british'],
'Dominion of Canada':['canada-1867-federal-framework'],
'Newfoundland':['newfoundland-responsible-dominion-framework','Labrador reported separately; whole Dominion scope hold.'],
'St Lucia':['b11-saint-lucia-nominated'],
'Bahamas':['b11-bahamas-1909-councils'],
'Jamaica':['b11-jamaica-part-elected-crown'],
'Sierra Leone':['sierra-leone-colony-protectorate-core'],
'Gambia':['gambia-colony-protectorate-core'],
'Barbados':['b10-barbados-colonial-parliament'],
'Grenada':['b10-grenada-crown-colony'],
'Anguilla':['b10-anguilla-st-kitts-framework','Island only versus multi-island administration; hold.'],
'Antigua including Barbuda':['b10-antigua-presidency','Presidency/island scope must be independently checked.'],
'Montserrat including Redonda':['b10-montserrat-presidency','Includes Redonda; retain named source geography, independent review required.'],
'Dominica':['b10-dominica-presidency'],
'British Honduras':['b10-british-honduras-appointed-council'],
'British Guiana':['british-guiana-court-policy-framework'],
'Malta':['malta-british-administration']};
const ctx=readContext(), matrix=completionMatrix(ctx);
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const sourceBodies=[100,101,102].map(p=>({page:p,path:`${base}/cache/table32-page${p}.pdf`,sha256:sha(`${base}/cache/table32-page${p}.pdf`),url:`https://www66.statcan.gc.ca/eng/1915/191501${p+32}_p.%20${p}.pdf`}));
// Correct literal publisher routes: their page-counter is distinct from printed page.
sourceBodies.forEach((s,i)=>s.url=`https://www66.statcan.gc.ca/eng/1915/191501${32+i}0${100+i}_p.%20${100+i}.pdf`);
const rows=data.split('\n').map((line,i)=>{const [page,rawLabel,areaRaw,populationRaw,ns='']=line.split('|'), footnotes=ns.split(',').filter(Boolean).map(Number), mapping=map[rawLabel], entity=ctx.db.entities.find(e=>e.id===mapping?.[0]); const year=footnotes.includes(1)?1910:1911; let holds=[]; if(!mapping)holds.push('No reviewed whole-framework mapping proposed.'); if(mapping?.[1])holds.push(mapping[1]); if(mapping&&!entity)holds.push('Proposed entity does not exist.'); const from=entity?.existence?.validFrom, until=entity?.existence?.validUntil; if(entity&&(!from||dateRange(from)[0]>dateRange(String(year))[0]||(until&&dateRange(until)[0]<dateRange(String(year))[1])))holds.push('Existing entity curated existence does not encompass complete observation year; no extension inferred.'); if(rawLabel==='Fiji')holds.push('Explicitly excluded by assignment; raw table row preserved only.');
return {rowId:`cyb1915-t32-${String(i+1).padStart(3,'0')}`,page:Number(page),rawLabel,areaRaw,populationRaw,population:Number(populationRaw),areaSquareMiles:/^\d+$/.test(areaRaw)?Number(areaRaw):null,areaExpression:areaRaw,reportingYear:'1911',populationObservationDate:String(year),datePrecision:'year',populationMethod:footnotes.includes(1)?'estimate':footnotes.includes(7)?'partly estimated':'table-reported population; exact enumeration date and census method unspecified here',areaMeasurementDate:null,areaQualification:'Source explicitly reports area in table titled 1911; underlying measurement/survey date unspecified. No map-polygon equivalence.',footnotes,scopeNotes:footnotes.map(n=>notes[n]),suggestedEntityId:entity?.id??null,entityName:entity?.names?.[0]?.value??null,entityExistence:entity?.existence??null,holds,sourceBody:sourceBodies.find(s=>s.page===Number(page)),locator:`Table32 printed page${page}, row ${rawLabel}, Area and Total columns`,extraction:'Visual transcription checked against original facsimile; PDF text layers repeat merged cells and are not authoritative row alignment.'};});
const candidates=rows.flatMap(r=>['population-statistics','area-statistics'].map(category=>({candidateId:`${r.rowId}-${category}`,category,rowId:r.rowId,entityId:r.suggestedEntityId,value:category==='population-statistics'?r.population:r.areaSquareMiles,rawValue:category==='population-statistics'?r.populationRaw:r.areaRaw,unit:category==='population-statistics'?'persons':'square miles',observationDate:category==='population-statistics'?r.populationObservationDate:'1911',observationQualification:category==='population-statistics'?r.populationMethod:r.areaQualification,geographicScope:r.rawLabel,scopeClass:r.holds.length?'uncertain':'historically-matching-proposed',status:r.holds.length||category==='area-statistics'&&r.areaSquareMiles===null?'held':'independent-review',holds:[...r.holds,...(category==='area-statistics'&&r.areaSquareMiles===null?['Combined or fractional raw area preserved without normalization.']:[])],footnotes:r.scopeNotes,missingSnapshotSlots:matrix.rows.filter(m=>m.entityId===r.suggestedEntityId&&m.snapshotYear===1914&&m.categories?.[category]?.status==='missing').map(m=>({entityId:m.entityId,snapshotYear:m.snapshotYear,category,mapIds:m.mapIds})),locator:r.locator,sourceBody:r.sourceBody})));
const out={schemaVersion:'source-table-candidates-v1',source:{title:'Canada Year Book 1915, Table32: Area and Population of United Kingdom and British Possessions,1911',institution:'Dominion Bureau of Statistics / official Statistics Canada historical facsimile',publicationYear:1915,tableReportingYear:1911,reproducedFrom:'British Statistical Abstract—Self-Governing Dominions, Colonies, Possessions and Protectorates,1913',bodies:sourceBodies,footnoteDefinitions:notes},productionChanged:false,retrieval:{fullBookAttempt:'Catalogue URL redirected to HTML archived-page interstitial; retained as failed retrieval, not PDF evidence.',pdfPageRequests:3,headerRequest:1,sourceSearches:'Official publisher TOC only after initial source discovery; no country searches.'},rows,candidates,metrics:{rows:rows.length,candidates:candidates.length,potentialIndependentReview:candidates.filter(c=>c.status==='independent-review').length,held:candidates.filter(c=>c.status==='held').length,potentialMissing1914Slots:candidates.filter(c=>c.status==='independent-review').reduce((n,c)=>n+c.missingSnapshotSlots.length,0)}};
fs.writeFileSync(`${base}/candidate-tranche.json`,JSON.stringify({...out,digest:digest(out)},null,2)+'\n');
console.log(JSON.stringify({digest:digest(out),metrics:out.metrics}));
