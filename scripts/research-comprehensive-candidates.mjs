// Bounded bulk prototype: reuse preserved local structured evidence, never resume Campaign2.
import fs from 'node:fs';
import {readJSON,saveJSON,readContext,digest,isCLI} from './research-common.mjs';
import {ingestCandidates} from './research-comprehensive.mjs';
export function preservedCandidateBundle(queue,allPackages){
 const integrated=new Set(queue.jobs.filter(j=>j.status==='integrated').map(j=>j.entityId));
 const packages=allPackages.filter(p=>!integrated.has(p.entityId));
 return {provider:{id:'atlas-preserved-research',url:'https://github.com/jacobgstanton1/historical-atlas/tree/51aedbecbee29a8ff8a25d69f66c94f98c046863/research/campaign-02',license:'Internal reuse of atlas-authored claim metadata only; third-party source contents retain their own rights',retrievedAt:'2026-10-01'},
 qualification:'Previously researched candidates, not new research or accepted production truth. No third-party full text is redistributed.',
 packages:packages.map(p=>({id:p.id,hash:digest(p),entityId:p.entityId})),
 records:packages.flatMap(p=>p.claims.map(c=>({sourceIdentifier:p.id+'/'+c.id,entityId:c.entityId,category:c.category,value:c.value,temporal:{...c.temporal,certainty:'exact'},scope:{id:c.entityId+'-preserved-candidate',description:c.geographicScope.description,relationship:c.geographicScope.relationship},sourceIds:c.sourceIds,qualifications:[...(c.cautions||[]),'Candidate dates and claimed scope reproduced from preserved package; require fresh independent source review.']})))};
}
if(isCLI(import.meta.url)){
 const allPackages=fs.readdirSync('research/campaign-02/packages').filter(f=>f.endsWith('.json')).map(f=>readJSON('research/campaign-02/packages/'+f));
 const bundle=preservedCandidateBundle(readJSON('research/campaign-02/queue.json'),allPackages);
 if(bundle.packages.length!==24)throw Error('Preserved checkpoint differs: inspect before regenerating');
 const candidates=ingestCandidates(bundle.records,bundle.provider,readContext());
 saveJSON('research/comprehensive/pilot/candidate-bundle.json',bundle);
 saveJSON('research/comprehensive/pilot/candidates.json',candidates);
 saveJSON('research/comprehensive/pilot/candidate-report.json',{packagesReused:bundle.packages.length,records:candidates.length,accepted:0,rejected:0,reviewNeeded:candidates.length,acceptedPercent:0,rejectedPercent:0,reviewNeededPercent:100,modelCallsForIngestion:0,externalRequests:0,qualification:bundle.qualification});
}
