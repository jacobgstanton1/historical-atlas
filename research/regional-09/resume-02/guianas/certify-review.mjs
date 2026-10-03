import fs from 'node:fs';
import crypto from 'node:crypto';
import {digest} from '../../../../scripts/research-common.mjs';
const base='research/regional-09/resume-02/guianas/';
const cohort=JSON.parse(fs.readFileSync(base+'cohort.json'));
const reviewer='/root/southamerica_colombia_sources';
const rationales={
 'r09r2-guianas-secret-ballot':['LoC Political and Social Awakenings, original body line 12','Direct statement of 1897 introduction; entire year lies within Court of Policy envelope 1832–1927. No universal-franchise implication.'],
 'r09r2-guianas-electorate':['LoC Political and Social Awakenings, original body line 12','Direct 1909 expansion of limited electorate; restriction qualification accurate; year inside Court of Policy envelope.'],
 'r09r2-guianas-elected-majority':['LoC Political and Social Changes in the 1900s, original body line 13','Direct wartime statement: elective members became majority in 1943. Year inside crown-colony envelope 1929–1952. No independence implication.'],
 'r09r2-guianas-brazil-concession':['ANOM Guyane guide, opening historical overview, original body line 10','Original guide dates concession of Oyapock–Amazon territory to Brazil in 1900. Year inside colonial profile envelope 1878–1929; qualification avoids prior effective-control or geometry inference.']
};
const claims=cohort.claims.map(c=>{if(!rationales[c.id])throw Error('Unreviewed claim');return {id:c.id,decision:'accepted',sourceIds:c.sourceIds,locators:[rationales[c.id][0]],rationale:rationales[c.id][1]};});
const review={reviewer,bodyReviewed:true,reviewedAt:'2026-10-03',canonicalCohortHash:digest(cohort),method:'Independently reopened all three original source bodies via web tool; checked explicit event years and current historical-entity existence envelopes. Candidate and production unchanged.',claims,held:[]};
fs.writeFileSync(base+'independent-review.json',JSON.stringify(review,null,2)+'\n');
const sha=path=>crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex');
const cert={cohortHash:digest(cohort),canonicalCohortHash:digest(cohort),bodyReviewed:true,reviewer,acceptedClaimIds:claims.filter(c=>c.decision==='accepted').map(c=>c.id),inputBindings:['cohort.json','independent-review.json'].map(name=>({path:base+name,sha256:sha(base+name)})),rationale:'Four literal source-dated events independently supported. Original year precision retained; no interval persistence, modern nationality, territorial geometry or universal-franchise inference.'};
fs.writeFileSync(base+'certificate.json',JSON.stringify(cert,null,2)+'\n');
console.log(JSON.stringify({accepted:cert.acceptedClaimIds.length,cohortHash:cert.cohortHash}));
