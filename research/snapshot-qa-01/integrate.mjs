// Append-only, independently certified registry repair followed by the existing
// fingerprint/receipt-checked serial rich-data integrator. Safe to resume.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {readJSON,saveJSON,digest} from '../../scripts/research-common.mjs';
import {withLock,atomicWrite} from '../../scripts/research-queue.mjs';
import {integrateCertified} from '../../scripts/research-completion-integrate.mjs';
import {createMetadataIndex,intervalBounds} from '../../historical-metadata.js';
const base='research/snapshot-qa-01',patch=readJSON(base+'/registry-candidate.json'),cohort=readJSON(base+'/cohort.json'),reviews=['russia','china'].map(k=>readJSON(base+'/'+k+'-final-review.json'));
for(const r of reviews){if(r.patchHash!==digest(patch)||r.cohortHash!==digest(cohort)||r.reviewer===cohort.worker||r.rejectedClaimIds.length)throw Error('Independent review mismatch/rejection');}
const accepted=new Set(reviews.flatMap(r=>r.acceptedClaimIds));if(cohort.claims.some(c=>!accepted.has(c.id)))throw Error('Unreviewed claim');
const dbPath='data/historical-entities.json',sourcePath='data/historical-sources.json';
withLock(base+'/registry-transaction',()=>{
 const db=readJSON(dbPath),registry=readJSON(sourcePath);
 const complete=patch.addEntities.every(e=>db.entities.some(old=>digest(old)===digest(e)))&&patch.addMappings.every(m=>db.mappings.some(old=>digest(old)===digest(m)))&&patch.sources.every(s=>registry.sources.some(old=>digest(old)===digest(s)));
 if(complete)return;
 if(digest(db)!==patch.before.db||digest(registry)!==patch.before.sources)throw Error('Stale registry fingerprint; regenerate a reviewed patch, never bypass');
 const next={...db,entities:[...db.entities,...patch.addEntities],mappings:[...db.mappings,...patch.addMappings]},sources={...registry,sources:[...registry.sources,...patch.sources]};
 if(new Set(next.entities.map(e=>e.id)).size!==next.entities.length||new Set(sources.sources.map(s=>s.id)).size!==sources.sources.length)throw Error('Duplicate identity/source');
 const ids=new Set(sources.sources.map(s=>s.id));for(const r of [...patch.addMappings,...patch.addEntities.flatMap(e=>[e.existence,...e.names])]){if(!r.sourceIds.length||r.sourceIds.some(id=>!ids.has(id)))throw Error('Unresolved source');const [lo,hi]=intervalBounds(r);if(!(lo<hi))throw Error('Reversed interval');}
 const metadata=createMetadataIndex(next,sources);for(const m of patch.addMappings)for(let y=1800;y<=1960;y++){const [lo,hi]=intervalBounds(m);if(Date.UTC(y,0,1)>=lo&&Date.UTC(y+1,0,1)<=hi&&metadata.resolve(m.mapId,y).ambiguous)throw Error('New conflicting map identity');}
 saveJSON(base+'/registry-transaction.json',{status:'prepared',before:patch.before,next:{db:digest(next),sources:digest(sources)},reviewHashes:reviews.map(digest)});
 // Sources first: a crash cannot leave a new production entity with absent citations.
 // The journal holds full patch inputs for recovery; partial writes require review.
 atomicWrite(sourcePath,sources);atomicWrite(dbPath,next);
 saveJSON(base+'/registry-transaction.json',{status:'integrated',before:patch.before,next:{db:digest(next),sources:digest(sources)},reviewHashes:reviews.map(digest)});
});
const bindings=['registry-candidate.json','cohort.json','russia-review.json','china-review.json','russia-final-review.json','china-final-review.json'].map(name=>{const path=base+'/'+name;return{path,sha256:crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')};});
const certificate={cohortHash:digest(cohort),bodyReviewed:true,reviewer:'qa01-independent-russia-and-china-review',acceptedClaimIds:[...accepted],inputBindings:bindings,rationale:'Independent institutional/primary-source reviews, source-map qualifications and dated core facts; no geometry-based sovereignty/succession. Original accepted data remains unchanged.'};
saveJSON(base+'/certificate.json',certificate);
const result=integrateCertified(cohort,certificate,{apply:true,output:base+'/intake'});console.log(JSON.stringify({claims:result.integrations.reduce((n,p)=>n+p.claims,0),held:result.held,after:result.after}));
