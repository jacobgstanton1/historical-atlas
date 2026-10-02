// Read-only source-wide screening. Candidate joins are not historical acceptance.
import fs from 'node:fs';
import {readJSON,saveJSON} from './research-common.mjs';
const matrix=readJSON('research/completion-01/reports/completion.json');
const entities=readJSON('research/completion-02/flags/cache/wikidata-entities.json').entities;
const candidates=readJSON('research/completion-02/flags/candidate-crosswalk.json').candidates;
const properties={currency:['P38'],leadership:['P35','P6'],capital:['P36'],economy:['P2131','P2132'],'population-statistics':['P1082'],'important-figures':[],'events-context':['P793']};
const results=[];
for(const [category,props] of Object.entries(properties)){
 let statements=0,dated=0,referenced=0;const slots=new Set();
 for(const e of Object.values(entities))for(const p of props)for(const c of e.claims[p]||[]){
  statements++;const q=c.qualifiers||{},a=q.P580?.[0]?.datavalue?.value,b=q.P582?.[0]?.datavalue?.value,o=q.P585?.[0]?.datavalue?.value;
  if(!(a&&b||o))continue;dated++;if(c.references?.length)referenced++;
  for(const z of candidates.filter(z=>z.qid===e.id)){
   const y=z.year,match=a&&b&&Number(a.time.slice(1,5))<=y&&Number(b.time.slice(1,5))>=y||o&&Number(o.time.slice(1,5))===y;
   const row=matrix.rows.find(r=>r.entityId===z.entityId&&r.snapshotYear===y);
   if(match&&row&&row.categories[category].status!=='supported')slots.add(z.entityId+'|'+y);
  }
 }
 results.push({category,opportunities:1056-matrix.byCategory[category].states.supported,statements,dated,referenced,cachedCandidateSlots:slots.size,automaticallyAcceptedSlots:0,caution:'Flag name joins are REVIEW for other categories; dates alone do not approve historical identity or territorial scope.'});
}
const codes={LUX:['luxembourg'],SWZ:['switzerland'],POL:['poland'],AUH:['austria-hungary'],AUS:['austria'],HUN:['hungary'],CZE:['czechoslovakia'],ALB:['albania'],SER:['serbia'],MNG:['montenegro'],YUG:['yugoslavia'],GRC:['greece'],CYP:['cyprus'],BUL:['bulgaria'],RUM:['romania'],RUS:['russian-empire','soviet-union'],EST:['estonia'],LAT:['latvia'],LIT:['lithuania'],ETH:['ethiopia'],SAF:['south-africa'],TRA:['transvaal'],OFS:['orange-free-state'],MOR:['morocco'],TUN:['tunisia'],LIB:['libya'],SUD:['sudan'],IRN:['iran','persia'],TUR:['ottoman-empire','turkey'],IRQ:['iraq'],EGY:['egypt'],SYR:['syria'],LEB:['lebanon'],JOR:['jordan'],ISR:['israel'],SAU:['saudi-arabia'],YEM:['yemen'],KUW:['kuwait'],OMA:['muscat-and-oman'],AFG:['afghanistan'],CHN:['china'],MON:['mongolia'],TAW:['taiwan'],KOR:['korea'],PRK:['north-korea','korea-democratic-peoples-republic-of'],ROK:['south-korea','korea-republic-of'],JPN:['japan'],BHU:['bhutan'],PAK:['pakistan'],MYA:['burma'],NEP:['nepal'],THI:['siam'],PHI:['philippines'],INS:['indonesia'],PAN:['panama'],CUB:['cuba']};
const spells=readJSON('research/bulk-01/cache/archigos-extracted.json'),old=readJSON('research/bulk-01/archigos-review/mapping-contracts.json');
const leadership=[];
for(const row of matrix.rows.filter(r=>r.snapshotYear>=1878&&r.categories.leadership.status!=='supported')){
 const matching=Object.entries(codes).filter(([code,ids])=>row.mapIds.some(id=>ids.includes(id.replace(/^entity-/,''))));
 for(const [code]of matching){const hits=spells.filter(s=>s.idacr===code&&s.startdate<`${row.snapshotYear+1}-01-01`&&s.enddate>`${row.snapshotYear}-01-01`);if(hits.length)leadership.push({entityId:row.entityId,name:row.name,year:row.snapshotYear,code,spells:hits.map(s=>s.obsid),existingContract:old.contracts.some(c=>c.entityId===row.entityId),review:/occupation|protectorate|colonial|dependency|possession|regional|contested|union|military/i.test(row.name)?'exception':'country-family-candidate'});}
}
const gdp=readJSON('research/completion-02/economy/cache/snapshot-records.json'),crosswalk=readJSON('research/completion-02/population/historical-crosswalk.json').mappings;
const economy=[];
for(const x of crosswalk.filter(x=>['EXACT','HIGH_CONFIDENCE'].includes(x.confidence)))for(const year of x.applicableSnapshotYears){const r=gdp.find(r=>r.countrycode===x.external.owid.code&&r.year===year&&r.gdppc),slot=matrix.rows.find(r=>r.entityId===x.atlasEntityId&&r.snapshotYear===year);if(r&&slot?.categories.economy.status!=='supported')economy.push({entityId:x.atlasEntityId,year,code:r.countrycode,value:r.gdppc,status:'GDP source-specific geography review required'});}
const report={productionFingerprint:matrix.productionFingerprint,categories:matrix.byCategory,screening:results,archigos:{originalRows:spells.length,candidateSlots:leadership.length,straightforwardCandidateSlots:leadership.filter(r=>r.review==='country-family-candidate').length,rows:leadership},maddison:{snapshotRows:gdp.length,numericGDPObservations:gdp.filter(r=>r.gdppc).length,previouslyReviewedGeographyCandidateSlots:economy.length,rows:economy},policy:'Upper bounds/candidate joins are not projected completed gains. No production mutation, no browser checks, no agents.'};
saveJSON('research/completion-02/bulk-yield-screen.json',report);
console.log(JSON.stringify({screening:results,archigosCandidates:leadership.length,archigosStraightforward:report.archigos.straightforwardCandidateSlots,maddisonExistingGeographyCandidates:economy.length},null,2));
