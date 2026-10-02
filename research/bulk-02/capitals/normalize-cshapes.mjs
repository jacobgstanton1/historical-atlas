import fs from 'node:fs';import crypto from 'node:crypto';
const base='research/bulk-02/capitals',sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const data=JSON.parse(fs.readFileSync(`${base}/cshapes-attributes.json`)),db=JSON.parse(fs.readFileSync('data/historical-entities.json'));
const archigos=JSON.parse(fs.readFileSync('research/bulk-01/archigos-review/mapping-contracts.json'));
// Reviewed framework contracts are candidate identity anchors, not capital approval.
const nationalAliases={USA:'United States of America',CAN:'Canada',UKG:'United Kingdom',IRE:'Ireland',NTH:'Netherlands',BEL:'Belgium',FRN:'France',POR:'Portugal',SPN:'Spain',SWD:'Sweden',NOR:'Norway',DEN:'Denmark',FIN:'Finland',ICE:'Iceland',GMY:'Germany (Prussia)',GFR:'German Federal Republic',GDR:'German Democratic Republic',ITA:'Italy/Sardinia',MEX:'Mexico',BRA:'Brazil',ARG:'Argentina',CHL:'Chile',COL:'Colombia',VEN:'Venezuela',ECU:'Ecuador',PER:'Peru',BOL:'Bolivia',PAR:'Paraguay',URU:'Uruguay',HAI:'Haiti',DOM:'Dominican Republic',GUA:'Guatemala',HON:'Honduras',SAL:'El Salvador',NIC:'Nicaragua',COS:'Costa Rica',LBR:'Liberia',AUL:'Australia',NEW:'New Zealand',IND:'India',SRI:'Sri Lanka (Ceylon)',TUR:'Turkey (Ottoman Empire)',THI:'Thailand'};
const mappings=archigos.contracts.filter(c=>nationalAliases[c.sourceCountryCode]).map(c=>({sourceCountryLabel:nationalAliases[c.sourceCountryCode],entityId:c.entityId,from:c.from,until:c.until,existingIdentity:c.existingIdentity,rationale:'Explicit source country-name alias reviewed against already-reviewed framework identity contract; no CShapes status/owner/geometry used.',anchor:c.id,disposition:'mapping-suggestion'}));
const colonialAliases={
'Puerto Rico':['b11-puerto-rico-foraker','b11-puerto-rico-jones','b11-puerto-rico-commonwealth'],
'Bahamas':['b11-bahamas-1909-councils'],
'Jamaica':['b11-jamaica-part-elected-crown','b11-jamaica-adult-suffrage','b11-jamaica-ministerial'],
'Trinidad and Tobago':['b11-trinidad-tobago-nominated','b11-trinidad-tobago-part-elected'],
'Barbados':['b10-barbados-colonial-parliament'],
'Guadeloupe':['b10-guadeloupe-colonial'],
'Martinique':['b11-martinique-colony','b11-martinique-department'],
'Belize':['b10-british-honduras-appointed-council'],
'Guyana':['british-guiana-court-policy-framework','british-guiana-postwar-constitution-framework'],
'Surinam':['suriname-koloniale-staten-framework'],
'French Guyana':['french-guiana-colonial-framework'],
'Malta':['malta-british-administration'],
'Iceland':['iceland-danish-administration'],
'Guinea-Bissau':['portuguese-guinea-separate-colonial-core','portuguese-guinea-1960-overseas-core'],
"Cote D'Ivoire":['ivory-coast-1900-colonial-core','ivory-coast-1945-colonial-core','ivory-coast-1960-independent-core'],
'Sierra Leone':['sierra-leone-colony-protectorate-core'],
'Madagascar (Malagasy)':['b20-madagascar-french-colony'],
'Mozambique':['b20-portuguese-mozambique'],
'Algeria':['algeria-french-colonial-framework','algeria-french-colonial-1945-framework'],
'Tunisia':['tunisia-french-protectorate-framework','tunisia-postwar-protectorate-framework','tunisia-republic-1960-framework'],
'Fiji':['fiji-british-colonial-core'],
'New South Wales':['nsw-responsible-colonial-core'],
'Queensland':['queensland-selfgoverning-colonial-core'],
'Victoria':['victoria-bicameral-colonial-core'],
'South Australia':['south-australia-responsible-colonial-core'],
'Western Australia':['wa-responsible-1900-core'],
'Japan':['japan-restoration-framework','japan-meiji-framework','japan-initial-allied-occupation','japan-postwar-framework'],
'Sri Lanka (Ceylon)':['ceylon-legislative-council-framework'],
'India':['british-raj'],
'Iran (Persia)':['qajar-preconstitutional-framework'],
'Nepal':['nepal-rana-framework'],
'Switzerland':['swiss-federal-state'],
'Luxembourg':['luxembourg-grand-duchy'],
'Austria-Hungary':['austria-hungary-dual-framework'],
'French West Africa':[],
};
for(const[label,ids]of Object.entries(colonialAliases))for(const entityId of ids){
 const e=db.entities.find(e=>e.id===entityId);if(!e)continue;
 const n=e.names.find(n=>n.kind==='primary')||e.names[0],x=e.existence||e;
 // Keep source precision. Coarse dates are mapping boundaries only and reviewed later.
 const from=x.validFrom||n?.validFrom,until=x.validUntil||n?.validUntil;
 if(!from)continue;
 mappings.push({sourceCountryLabel:label,entityId,from,until:until||null,existingIdentity:{name:n.value,validFrom:from,validUntil:until||null,sourceIds:[...new Set([...(n.sourceIds||[]),...(x.sourceIds||[])])]},rationale:'Explicit institutional/historical name match for candidate category scope; existing curated coverage bounds retained in original precision; no status/owner/geometry inference.',disposition:'mapping-suggestion'});
}
const snapshots=['1900-01-01','1914-01-01','1920-01-01','1930-01-01','1938-01-01','1945-01-01','1960-01-01'];
const coverage=JSON.parse(fs.readFileSync('research/bulk-02/reports/snapshot-coverage.json'));
const coverageBySlot=new Map(coverage.rows.map(r=>[r.entityId+'|'+r.snapshotYear,r.categories.capital.status]));
// The codebook explicitly admits first-January and first-month defaults. No row
// carries a precision flag. Retain coded endpoints, but narrow possible defaults.
// An inclusive month/year last-day can precede a defaulted next-period boundary.
const addDay=d=>new Date(Date.parse(d+'T00:00:00Z')+86400000).toISOString().slice(0,10);
function interior(r){
 const [sy,sm,sd]=r.start.split('-').map(Number),[ey,em,ed]=r.end.split('-').map(Number);
 const startPrecision=sm===1&&sd===1?'year-uncertain':sd===1?'month-uncertain':'coded-day';
 const afterEnd=addDay(r.end),[,am,ad]=afterEnd.split('-').map(Number);
 const endPrecision=(em===1&&ed===1)||(am===1&&ad===1)?'year-uncertain':ed===1||ad===1?'month-uncertain':'coded-day';
 const from=startPrecision==='year-uncertain'?`${sy+1}-01-01`:startPrecision==='month-uncertain'?`${sm===12?sy+1:sy}-${String(sm===12?1:sm+1).padStart(2,'0')}-01`:r.start;
 const until=endPrecision==='year-uncertain'?`${ey}-01-01`:endPrecision==='month-uncertain'?`${ey}-${String(em).padStart(2,'0')}-01`:r.end;
 return {from,until,endSemantics:'exclusive conservative interior',startPrecision,endPrecision,policy:'Possible Jan1/default-year endpoint loses uncertain endpoint year; possible month1 or preceding last-day endpoint loses uncertain endpoint month. Other coded final day omitted. These are derived conservative bounds, not exact historical capital-change dates.'};
}
const risks={
'Gambia':'Banjul is a modern renamed place label applied retrospectively; historical naming and capital status not reviewed.',
'Senegal':'Dakar throughout 1886 conflicts with retained contemporary1900 table St.Louis; historical administrative scope requires reconciliation.',
'Mauritania':'Nouakchott applied to1920s country-period is an apparent modern capital default; hold.',
'Mozambique':'Maputo is a retrospective modern label in colonial rows and the source lacks the earlier Mozambique Island capital interval; hold historical name/status.',
'Austria-Hungary':'Single Vienna cell does not represent dual Vienna/Budapest constitutional seats; hold administrative scope.',
'Dominican Republic':'Static Santo Domingo source label spans the Ciudad Trujillo renaming period; only proposed existing framework1931–1952 overlaps renaming. No source-dated name change supplied; hold whole row.',
'Equatorial Guinea':'Malabo historic name default; hold naming/administrative scope.',
'Norway':'Oslo applied before1925 renaming; historical name date not encoded. Hold early name cells.',
'Netherlands':'Single coded Amsterdam does not capture historical administrative/legislative seat TheHague; require explicit official-capital qualification and source consistency review.',
'Bolivia':'Single LaPaz cell is an administrative seat, not evidence of sole or constitutional capital; require qualification and constitutional-seat reconciliation.',
'South Africa':'Multiple capital-seat arrangement; single source capital is insufficient without office-specific scope.',
'China':'Competing/occupied frameworks, source name is broad; no automatic mapping.',
'Russia (Soviet Union)':'Mixed imperial/revolutionary/Soviet source country namespace; no automatic identity mapping.',
'Spain':'Source Madrid interval suppresses civilwar competing government seats; contracts exclude transition1936–39.',
};
const rows=data.filter(r=>r.start<'1961-01-01'&&r.end>='1886-01-01').map(r=>{
 const supportedInterior=interior(r);
 const contracts=mappings.filter(c=>c.sourceCountryLabel===r.country_name&&(!c.until||r.start<c.until)&&r.end>=c.from);
 const targets=contracts.flatMap(c=>snapshots.filter(d=>d>=supportedInterior.from&&d<supportedInterior.until&&d>=c.from&&(!c.until||d<c.until)).map(date=>({entityId:c.entityId,date,existingCapitalStatus:coverageBySlot.get(c.entityId+'|'+date.slice(0,4))||'not-resolved-at-snapshot'})));
 const exact={fid:r.fid,gwcode:r.gwcode,country_name:r.country_name,start:r.start,end:r.end,capname:r.capname};
 const row={sourceId:'bulk02-cshapes-2-capital-periods',sourceRowLocator:`Released CShapes2 GW properties fid=${r.fid}; country_name/start/end/capname`,originalAttributes:exact,originalAttributesSha256:crypto.createHash('sha256').update(JSON.stringify(exact)).digest('hex'),value:r.capname,from:r.start,until:r.end,endSemantics:'inclusive coded country-period endpoint; official cshp.R uses end>=date',datePrecision:'day-coded; source documentation admits some default Jan1/month1 change dates',scope:'Capital (CShapes2 academic coding), not exclusive capital, legal sovereign seat or uniform territorial control.',entityMappingsSuggested:contracts,targetSnapshotsSuggested:targets,disposition:!contracts.length?'held-unmapped':risks[r.country_name]?'held-source-scope':'source-bound-candidate',evidenceCautions:[...(risks[r.country_name]?[risks[r.country_name]]:[]),'Source codebook records unchanged capital attributes across country periods. Dataset precise coded dates may include defaults and do not independently prove exact historical accession/change date.','No geometry, borders, areas, owner or status used to derive claims or entity identity.']};
 row.supportedInterior=supportedInterior;
 if(r.country_name==='India'&&r.capname==='Calcutta'&&r.end>'1911-01-01'){
  row.disposition='held-source-scope';row.evidenceCautions.push('Calcutta coding persists through1931; Delhi transfer and later NewDelhi completion may have been conflated. Hold entire source rows overlapping transition; no invented split date.');
 }
 row.datePrecision='original publisher coded dates; possible defaults narrowed in supportedInterior, no exact historical date assertion';
 row.reviewReason=!contracts.length?'No reviewed bounded existing-entity alias proposed.':risks[r.country_name]?risks[r.country_name]:'Codebook explicitly defines unchanged attributes, including named capital, within dated country periods. Bounded identity suggestion requires coordinator review; conservative interior excludes uncertain endpoint portions.';
 if(r.country_name==='India'&&r.capname==='Calcutta'&&r.end>'1911-01-01')row.reviewReason=row.evidenceCautions.at(-1);
 if(supportedInterior.from>=supportedInterior.until){row.disposition='held-empty-conservative-interior';row.reviewReason='No nonempty conservative temporal interior remains after possible default endpoints are narrowed.';}
 return row;
});
const sourceFiles=['cache/cshapes-provider.html','cache/CShapes-2.0_Codebook.pdf','cache/CShapes-2.0_Codebook.txt','cache/cshp.R','cache/cshapes-DESCRIPTION.txt','cache/cshapes_2_gw.topojson.xz','cshapes-attributes.json','extract-cshapes.py','normalize-cshapes.mjs'];
const manifest={schemaVersion:1,sources:[{id:'bulk02-cshapes-2-capital-periods',title:'CShapes2.0: dated capital attributes of GW country periods',institution:'ETH Zurich International Conflict Research / CShapes authors',url:'https://icr.ethz.ch/data/cshapes/',originalDataUrl:'https://raw.githubusercontent.com/cran/cshapes/master/inst/extdata/cshapes_2_gw.topojson.xz',documentationUrl:'https://icr.ethz.ch/data/cshapes/CShapes-2.0_Codebook.pdf',sourceTier:'B academic dataset; coding-qualified capital attribute evidence',cachePath:`${base}/cache/cshapes_2_gw.topojson.xz`,sha256:sha(`${base}/cache/cshapes_2_gw.topojson.xz`),parser:'extract-cshapes-properties-v1',files:sourceFiles.map(f=>({path:`${base}/${f}`,sha256:sha(`${base}/${f}`)})),datePolicy:'Original coded start/end preserved; end inclusive according to publisher package extraction function. Mapping windows remain separately bounded; no endpoint rewritten to imply sourceprecision.'}],mappings,rows,summary:{originalAttributeRows:data.length,historicalRows:rows.length,mappedRows:rows.filter(r=>r.entityMappingsSuggested.length).length,candidateRows:rows.filter(r=>r.disposition==='source-bound-candidate').length,heldRows:rows.filter(r=>r.disposition.startsWith('held')).length,targetEntitySnapshotSlots:new Set(rows.flatMap(r=>r.targetSnapshotsSuggested.map(t=>t.entityId+'|'+t.date))).size,accepted:0}};
const candidates=rows.filter(r=>r.disposition==='source-bound-candidate');
const slotGroups=new Map();
for(const r of candidates)for(const c of r.entityMappingsSuggested)for(const date of snapshots){
 const year=Number(date.slice(0,4)),yearEnd=`${year+1}-01-01`;
 const from=[r.supportedInterior.from,c.from,date].sort().at(-1),until=[r.supportedInterior.until,c.until||'9999',yearEnd].sort()[0];
 if(from>=until||!coverageBySlot.has(c.entityId+'|'+year))continue;
 const key=c.entityId+'|'+year;if(!slotGroups.has(key))slotGroups.set(key,{entityId:c.entityId,snapshotYear:year,existingCapitalStatus:coverageBySlot.get(key),intervals:[]});
 slotGroups.get(key).intervals.push({from,until,value:r.value,sourceFid:r.originalAttributes.fid});
}
const slots=[...slotGroups.values()].map(s=>{
 let cursor=`${s.snapshotYear}-01-01`;for(const i of s.intervals.toSorted((a,b)=>a.from.localeCompare(b.from))){if(i.from>cursor)break;if(i.until>cursor)cursor=i.until;}
 return {...s,potentialCoverage:cursor>=`${s.snapshotYear+1}-01-01`?'full-calendar-year':'partial-calendar-year',requiresCoordinatorMappingAndConflictReview:true};
});
const assessment={productionFingerprint:coverage.productionFingerprint,policy:'Candidate opportunities only; existing frozen coverage report reused. Full-calendar-year union across same candidate entity intervals. Naming/scope risk holds excluded; mapping suggestions remain unapproved.',summary:{candidateResolvedSnapshotSlots:slots.length,missingFullYear:slots.filter(s=>s.existingCapitalStatus==='missing'&&s.potentialCoverage==='full-calendar-year').length,missingPartialYear:slots.filter(s=>s.existingCapitalStatus==='missing'&&s.potentialCoverage==='partial-calendar-year').length,alreadyNonmissing:slots.filter(s=>s.existingCapitalStatus!=='missing').length},slots};
manifest.summary.conservativeCandidateSnapshotSlots=assessment.summary;
manifest.sourceReview={capitalTemporalSupport:'Codebook pp1–2 explicitly states capital changes are recorded and attributes remain unchanged within each country-period; p5 also explains that capital changes can create periods.',dateUncertainty:'Codebook p3 explicitly admits first-January/first-month defaults. Row attributes lack individual precision flags. Narrowed temporal interiors are derived conservative policy, not source-exact historical dates.',codingQualification:'Capital (CShapes2 academic coding). Source alone does not prove sole/constitutional/administrative seat, historical naming, control, sovereignty or legal capital-change day.',endpointSupport:'Official cshp.R lines44–45 selects start <= date and end >= date; raw end is inclusive, supportedInterior end is exclusive.',knownIncompatibleDefaults:['Gambia/Banjul historic naming','Mauritania/Nouakchott early twentieth-century default'],productionApproval:false};
fs.writeFileSync(`${base}/cshapes-capitals-manifest.json`,JSON.stringify(manifest,null,2)+'\n');
fs.writeFileSync(`${base}/cshapes-missing-capital-assessment.json`,JSON.stringify(assessment,null,2)+'\n');
console.log(manifest.summary);

