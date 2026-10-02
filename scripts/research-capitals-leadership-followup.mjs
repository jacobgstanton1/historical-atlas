// Reuse independently reviewed Archigos contracts; never accept new alias candidates here.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {readJSON,saveJSON,digest} from './research-common.mjs';
const base='research/completion-03/capitals',rawPath='research/bulk-01/cache/archigos-extracted.json',contractPath='research/bulk-01/archigos-review/mapping-contracts.json';
const raw=readJSON(rawPath),review=readJSON(contractPath),matrix=readJSON('research/completion-01/reports/completion.json');
const candidates=[],held=[];
for(const slot of matrix.rows.filter(r=>r.snapshotYear>=1875&&r.categories.leadership.status!=='supported')){
 const lo=slot.snapshotYear+'-01-01',hi=(slot.snapshotYear+1)+'-01-01';
 const contracts=review.contracts.filter(c=>c.entityId===slot.entityId&&c.from<=lo&&c.until>=hi);
 const rows=raw.filter(r=>contracts.some(c=>c.sourceCountryCode===r.idacr)&&r.startdate<=lo&&r.enddate>=hi);
 if(slot.mappingPartial||rows.length!==1||!rows[0].leader||/[^\x20-\x7e]/.test(rows[0].leader)||[...review.held.rows,...review.held.encoding].some(h=>h.obsid===rows[0].obsid)){held.push({entityId:slot.entityId,year:slot.snapshotYear,reason:'No unique previously reviewed full-year contract and safe source row'});continue;}
 candidates.push({slot,row:rows[0],contract:contracts.find(c=>c.sourceCountryCode===rows[0].idacr)});
}
const claims=[...new Map(candidates.map(({slot,row:r,contract:c})=>{
 const temporal={kind:'interval',from:[r.startdate,c.from].sort().at(-1),until:[r.enddate,c.until,'1961-01-01'].sort()[0],certainty:'exact'};
 const id='archigos-reviewed-followup-'+digest([slot.entityId,r.obsid,temporal]).slice(0,24);
 return[id,{id,entityId:slot.entityId,category:'leadership',value:r.leader,role:c.role,temporal,scope:{id:slot.entityId+'-effective-central-leader',description:c.qualifications.join(' '),relationship:'same'},sourceIds:['bulk01-archigos-v41'],evidence:[{sourceId:'bulk01-archigos-v41',locator:'Archigos original DTA '+r.obsid+'; '+c.sourceCountryLocator,note:'Literal core fields '+JSON.stringify({obsid:r.obsid,leadid:r.leadid,idacr:r.idacr,leader:r.leader,startdate:r.startdate,enddate:r.enddate})+'; independently reviewed country/entity contract '+c.id,precision:'day',temporal:{kind:'interval',from:r.startdate,until:r.enddate,certainty:'exact'},interpretation:'direct'}],status:'supported',risks:[],qualifications:c.qualifications,origin:{kind:'bulk-candidate',reference:r.obsid,sourceIdentifier:r.obsid}}];
})).values()];
saveJSON(base+'/leadership-reviewed-yield.json',{sourceRows:raw.length,previouslyReviewedContracts:review.contracts.length,newCandidateSlots:candidates.length,uniqueClaims:claims.length,candidates:candidates.map(x=>({entityId:x.slot.entityId,year:x.slot.snapshotYear,obsid:x.row.obsid})),held});
const cohort={id:'completion03-archigos-reviewed-gap-followup',worker:'literal-archigos-existing-contract-join',claims};
saveJSON(base+'/leadership-intake/cohort.json',cohort);
saveJSON(base+'/leadership-intake/certificate.json',{cohortHash:digest(cohort),reviewer:'/root independent reuse of source-bound reviewed Archigos contracts',bodyReviewed:true,acceptedClaimIds:claims.map(c=>c.id),inputBindings:[rawPath,contractPath,'scripts/research-capitals-leadership-followup.mjs'].map(path=>({path,sha256:crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')})),rationale:'Reuse only previously independently reviewed entity/country contracts and original certified ASCII core fields. Unique full-calendar-year ruler spell; source endpoint retained as conservative exclusive cutoff. No new alias-based identity acceptance, formal-office inference, sovereignty assertion or Important Figures conversion. Existing accepted data is preserved; production validator retains conflict authority.'});
console.log({rows:raw.length,candidateSlots:candidates.length,claims:claims.length});
