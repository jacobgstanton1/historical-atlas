// Archived construction step: certified outputs must never be overwritten.
throw new Error('Certified QA inputs already preserved; create a separately reviewed recovery package instead of replaying this constructor.');
import {readJSON,saveJSON,digest} from '../../scripts/research-common.mjs';
const patch=readJSON('research/snapshot-qa-01/registry-candidate.json');
const rows=patch.addMappings.map(m=>{const k=m.mapId==='entity-chinese-warlords'?'china':'russia',path='research/snapshot-qa-01/'+k+'-final-review.json',review=readJSON(path);return{mapId:m.mapId,snapshotYear:Number(m.validFrom.slice(0,4)),classification:k==='china'?'composite-political-region':'political-polity',canonicalEntityId:m.entityId,sourceIds:m.sourceIds,rationale:m.note,review:{path,hash:digest(review),reviewer:review.reviewer,decision:'accepted'}};});
for(const year of [1815,1878,1880,1900])rows.push({...rows.find(r=>r.mapId==='entity-russian-empire'),snapshotYear:year});
saveJSON('research/completion/occurrence-eligibility.json',{schemaVersion:1,purpose:'Dated independently reviewed recovery decisions supersede provisional global eligibility only for listed occurrences. No modern-state template is forced onto composite regions.',occurrences:rows});
