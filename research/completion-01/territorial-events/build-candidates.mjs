import fs from 'node:fs';
import crypto from 'node:crypto';
import {digest,readContext,dateRange} from '../../../scripts/research-common.mjs';
import {completionMatrix} from '../../../scripts/research-completion.mjs';
const b='research/completion-01/territorial-events',read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const raw=read(`${b}/raw-extraction.json`),ctx=readContext(),matrix=completionMatrix(ctx),arch=read('research/bulk-01/archigos-review/mapping-contracts.json');
// Explicit country-code namespace proposals; COW codes are not inferred from geometry or modern nationality.
const codes={USA:2,CAN:20,UKG:200,NTH:210,BEL:211,FRN:220,POR:235,SPN:230,NOR:385,DEN:390,FIN:375,GMY:255,ITA:325,MEX:70,BRA:140,ARG:160,CHL:155,COL:100,ECU:130,PER:135,BOL:145,PAR:150,GUA:90,HON:91,SAL:92,NIC:93,AUL:900,NEW:920,IND:750,TUR:640,THI:800};
const contracts=arch.contracts.filter(c=>codes[c.sourceCountryCode]).map(c=>({...c,cowCode:String(codes[c.sourceCountryCode]),origin:'Existing reviewed framework identity; NEW COW namespace bridge requires review'}));
const explicit=[
 [200,'united-kingdom','1816','1875'],[220,'france-political-frameworks','1816','1875'],[235,'portugal-political-frameworks','1816','1875'],[230,'spain-political-frameworks','1816','1875'],[2,'united-states','1816','1875'],[210,'netherlands-kingdom','1816','1875'],
 [740,'japan-meiji-framework','1891','1945'],[740,'japan-postwar-framework','1948','1961'],[365,'soviet-union','1923','1961'],
 [471,'b17-cameroon-independence','1960','1961'],[438,'b16-guinea-republic','1959','1961'],
 [950,'fiji-british-colonial-core','1875','1961'],[955,'tonga-british-protected-core','1901','1961']
];
for(const [cowCode,entityId,from,until]of explicit){const e=ctx.db.entities.find(e=>e.id===entityId);if(!e)throw Error(entityId);if(!e.existence)continue;contracts.push({cowCode:String(cowCode),entityId,from,until,existingIdentity:e.existence,identityEvidenceIds:e.existence.sourceIds,origin:'Existing registry sourced framework / explicit COW namespace proposal',reviewRequired:true});}
const procedure={1:'conquest',2:'annexation',3:'cession',4:'secession',5:'unification',6:'mandated territory'};
const catalogue=fs.readFileSync(`${b}/Entities-extracted.txt`,'utf8');
const lookup=code=>{const lines=catalogue.split('\n').filter(l=>l.trim().startsWith(code+' '));return lines.slice(0,12);};
const candidates=[];
for(const [index,row]of raw.rows.entries()){
 const year=Number(row.year);if(year<1816||year>1960)continue;
 const month=Number(row.month),known=Number.isInteger(month)&&month>=1&&month<=12,date=known?`${year}-${String(month).padStart(2,'0')}`:String(year),range=dateRange(date);
 for(const side of ['gainer','loser']){
  const matches=contracts.filter(c=>c.cowCode===row[side]&&dateRange(c.from)[1]<=range[0]&&dateRange(c.until)[0]>=range[1]);
  const ids=[...new Set(matches.map(c=>c.entityId))];if(ids.length!==1)continue;
  const entityId=ids[0],e=ctx.db.entities.find(e=>e.id===entityId);if(!e.existence)continue;const start=dateRange(e.existence.validFrom)[1],end=e.existence.validUntil?dateRange(e.existence.validUntil)[0]:Infinity;if(start>range[0]||end<range[1])continue;
  const slots=matrix.rows.filter(r=>r.entityId===entityId&&r.snapshotYear>=year&&r.snapshotYear-year<=5&&r.categories['events-context'].status==='missing').map(r=>({entityId,snapshotYear:r.snapshotYear,status:'missing',actualEventDate:date,context:year===r.snapshotYear?'source-coded selected-year event':'explicitly dated prior context',contextAgeYears:r.snapshotYear-year}));
  if(!slots.length)continue;
  const holds=[];if(!known)holds.push('Unknown month: year precision only; coding date may aggregate campaigns.');if(row.indep==='1')holds.push('Source independence coding must not be interpreted as an automatic sovereignty/status claim.');if(!procedure[row.procedur])holds.push('Procedure unspecified or system-entry coding rather than independently identified transfer.');if(row.portion==='-9')holds.push('Portion unknown.');if(['-9','.','0','1'].includes(row.entity))holds.push('Exchanged territory namespace unresolved/organizational.');
  candidates.push({id:`cow-tc-${row.number}-${side}-${entityId}`,category:'events-context',eventDate:date,eventPrecision:known?'month':'year',entityIdSuggested:entityId,side,sourceChangeNumber:row.number,sourceCSVLine:index+2,sourceRowIndex:index,rawRow:row,sourceBodyHash:raw.csvSHA256,sourceLocator:`tc2018.csv/headerline1/datarow${index+1}/change${row.number}`,sourceProcedure:procedure[row.procedur]||null,sourceParticipantCode:row[side],rawCatalogueLines:{participant:lookup(row[side]),exchanged:lookup(row.entity),other:lookup(row[side==='gainer'?'loser':'gainer'])},mappingProposals:matches,prioritySlots:slots,reviewIssues:holds,qualification:'Academic source-coded territorial-change record. Month/year retains original precision and coding conventions (treaty/proclamation/final campaign year). Does not establish legal sovereignty, predecessor/successor relationship or exactday. Exchanged area/population/geometry fields are provenance only and not proposed facts.',status:'historical-review'});
 }
}
// One highest precision record per currently missing entity/snapshot slot; keep alternatives separately, no row-count quota.
const selected=[],seen=new Set();
for(const c of candidates.sort((a,b)=>a.reviewIssues.length-b.reviewIssues.length||a.prioritySlots[0].snapshotYear-b.prioritySlots[0].snapshotYear||a.id.localeCompare(b.id))){const keys=c.prioritySlots.map(s=>s.entityId+':'+s.snapshotYear);if(keys.some(k=>!seen.has(k))){selected.push(c);for(const k of keys)seen.add(k);}}
const out={schemaVersion:1,source:{id:'cow-territorial-change-v6',title:'Correlates of War Territorial Change data, distributionv6/tc2018.csv',institution:'Correlates of War Project',url:'https://correlatesofwar.org/wp-content/uploads/terr-changes-v6.zip',landingURL:'https://correlatesofwar.org/data-sets/territorial-change/',urlProvenance:'Coordinator verified original official landing-page link and successful ZIP retrieval.',kind:'academic-coded-historical-dataset',cachePath:`${b}/cache/extracted/tc2018.csv`,sha256:raw.csvSHA256,versionQualification:'Archive advertisedv6; literal CSV version column is5; accompanying manual describes1816–2008 and v4.01. Preserve this documentation mismatch.'},sourceBindings:{zip:crypto.createHash('sha256').update(fs.readFileSync(`${b}/cache/terr-changes-v6.zip`)).digest('hex'),csv:raw.csvSHA256,manual:raw.manualSHA256,catalogue:raw.catalogueSHA256},manualLocators:['pp1–2 universe/statecoding/datepolicy','p3 colonialaggregation/proceduredefinitions','p4 area/population/systementry/sourceprovenance','pp6–8 namespace corrections'],coverageBaselineDigest:digest(matrix),rawExtractionDigest:digest(raw),events:selected,alternatives:candidates,metrics:{originalRows:raw.rows.length,candidateEvents:candidates.length,selectedEvents:selected.length,missingEntitySnapshotSlots:seen.size,rowsWithoutInitialCodingHolds:selected.filter(e=>!e.reviewIssues.length).length},productionEdited:false,newHTTPRetrievalAttemptsByWorker:0,requireIndependentExtractionAndMappingReview:true};
fs.writeFileSync(`${b}/candidate-tranche.json`,JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({digest:digest(out),metrics:out.metrics}));
