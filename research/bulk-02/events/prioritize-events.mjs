import fs from 'node:fs';
import {digest} from '../../../scripts/research-common.mjs';
const b='research/bulk-02/events',read=p=>JSON.parse(fs.readFileSync(p));
const raw=read(`${b}/cow-events-extracted.json`),arch=read('research/bulk-01/archigos-review/mapping-contracts.json'),matrix=read('research/bulk-02/reports/snapshot-coverage.json'),db=read('data/historical-entities.json');
const names={'United States of America':'USA','Canada':'CAN','United Kingdom':'UKG','Netherlands':'NTH','Belgium':'BEL','France':'FRN','Portugal':'POR','Spain':'SPN','Norway':'NOR','Denmark':'DEN','Finland':'FIN','Germany':'GMY','Italy':'ITA','Mexico':'MEX','Brazil':'BRA','Argentina':'ARG','Chile':'CHL','Colombia':'COL','Ecuador':'ECU','Peru':'PER','Bolivia':'BOL','Paraguay':'PAR','Guatemala':'GUA','Honduras':'HON','El Salvador':'SAL','Nicaragua':'NIC','Australia':'AUL','New Zealand':'NEW','India':'IND','Turkey':'TUR','Thailand':'THI'};
const contracts=arch.contracts.map(c=>({entityId:c.entityId,from:c.from,until:c.until,rawParticipant:Object.keys(names).find(n=>names[n]===c.sourceCountryCode),origin:'existing-reviewed-Archigos-identity-only',originalContractId:c.id,existingIdentity:c.existingIdentity,identityEvidenceIds:c.existingIdentity.sourceIds})).filter(c=>c.rawParticipant);
// Extra family identity proposals have actual registry-backed boundaries. They are NOT approvals.
for(const [participant,id,from,until] of [['USSR','soviet-union','1922-12-30','1961-01-01'],['Japan','japan-meiji-framework','1890-11-29','1945-01-01'],['Japan','japan-postwar-framework','1947-05-03','1961-01-01'],['Germany','germany-nazi-period','1933-01-30','1945-04-30'],['Russia','russian-imperial-fundamental-laws-framework','1907-01-01','1915-01-01'],['Greece','greek-1864-crowned-framework','1878-01-01','1909-01-01'],['Austria-Hungary','austria-hungary-dual-framework','1868-01-01','1918-01-01'],['Turkey','ottoman-second-constitutional-core','1909-08-21','1915-01-01']]){
 const e=db.entities.find(e=>e.id===id);
 contracts.push({rawParticipant:participant,entityId:id,from,until,origin:'existing-registry-sourced-family-proposal',existingNames:e.names,identityEvidenceIds:[...new Set([...(e.existence?.sourceIds||[]),...e.names.flatMap(n=>n.sourceIds||[])])],reviewRequired:true,qualification:participant==='Turkey'?'COW literal Turkey country label during Ottoman period is NOT modern Turkish Republic; proposed existing Ottoman1909 framework requires independent namespace certification.':participant==='Austria-Hungary'?'Registry start1867 has year precision; proposal begins in conservative interior1868, not an invented founding day.':'No extension beyond existing sourced framework boundaries.'});
}
const enriched=raw.events.map(e=>{
 const matches=e.eventPrecision==='day'?contracts.filter(c=>c.rawParticipant===e.rawParticipant&&e.eventDate>=c.from&&e.eventDate<c.until):[];
 const identitySuggestions=[...new Set(matches.map(c=>c.entityId))];
 const slots=[];
 for(const entityId of identitySuggestions)for(const r of matrix.rows.filter(r=>r.entityId===entityId)){
  const y=Number(e.eventDate.slice(0,4));
  if(y>r.snapshotYear||r.snapshotYear-y>5)continue;
  const contractsForSnapshot=matches.filter(c=>c.entityId===entityId&&c.from<`${r.snapshotYear+1}-01-01`&&c.until>`${r.snapshotYear}-01-01`);
  if(!contractsForSnapshot.length)continue;
  slots.push({entityId,snapshotYear:r.snapshotYear,categoryStatus:r.categories['events-context'].status,context:y===r.snapshotYear?'event-in-selected-year':'explicitly dated prior-context',actualEventDate:e.eventDate,contextAgeYears:r.snapshotYear-y,mappingPartial:r.mappingPartial});
 }
 return{...e,identitySuggestions,mappingContractSuggestions:matches,sourceIdentityApproval:false,snapshotSlots:slots,prioritySlots:slots.filter(s=>s.categoryStatus==='missing'),reviewIssues:[...e.reviewIssues,...(identitySuggestions.length!==1?['No unique exact-date reviewed historical framework suggestion.']:[]),'COW participant-to-atlas identity bridge needs independent review; Archigos participation/leadership coding is not reused as event evidence.'],status:'historical-review'};
});
// Priority is unique missing entity/snapshot slots, not raw row count. Keep endpoint alternatives together.
const useful=enriched.filter(e=>e.prioritySlots.length&&e.identitySuggestions.length===1&&e.eventPrecision==='day'&&e.reviewIssues.length===1);
const missingSlots=[...new Set(useful.flatMap(e=>e.prioritySlots.map(s=>`${s.snapshotYear}:${s.entityId}`)))].sort();
const selected=useful.sort((a,b)=>a.prioritySlots[0].snapshotYear-b.prioritySlots[0].snapshotYear||a.identitySuggestions[0].localeCompare(b.identitySuggestions[0])||a.eventDate.localeCompare(b.eventDate)||a.id.localeCompare(b.id));
const out={schemaVersion:1,sources:raw.sources,rawExtractionHash:digest(raw),sourceCodebookBinding:raw.sources[1].sha256,reusedIdentityContractsHash:digest(arch),coverageBaselineHash:digest(matrix),coverageBaselineFingerprint:matrix.productionFingerprint,definition:'Literal coded participant combat endpoints. No declarations, sovereignty, peace treaties or succession inferred. Events retain actual dates; explicit prior-context maximum5years, never retimed to snapshot.',events:selected,allCandidateEvents:enriched,identityBridge:names,metrics:{candidateEvents:enriched.length,selectedEvents:selected.length,missingEntitySnapshotSlots:missingSlots.length,missingSlots,sourceHeld:raw.metrics.held,noSnapshotContextEvents:enriched.filter(e=>!e.snapshotSlots.length).length},productionEdited:false};
fs.writeFileSync(`${b}/cow-events-review-tranche.json`,JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({hash:digest(out),metrics:out.metrics}));
