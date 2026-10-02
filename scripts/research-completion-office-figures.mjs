// Accepted subset only; the frozen worker cohort and held records remain unchanged.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {readJSON,saveJSON,digest} from './research-common.mjs';
const base='research/completion-01/office-figures/',original=readJSON(base+'cohort.json'),review=readJSON(base+'independent-review.json');
if(digest(review)!=='a50cf3410bdf8292ec9b06607c6411646c2560436c22aedca42ba668a2168032'||review.cohortHash!==digest(original)||!review.bodyReviewed)throw Error('Changed independent figure review');
const sha=path=>crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex');
for(const b of review.inputBindings)if(sha(b.path)!==b.sha256)throw Error('Changed person evidence '+b.path);
const current=new Map(readJSON('data/comprehensive-dossiers.json').packages.flatMap(p=>p.claims).map(c=>[c.id,c]));
for(const b of review.originalAcceptedClaimBindings)if(!current.has(b.originalClaimId)||digest(current.get(b.originalClaimId))!==b.originalClaimHash)throw Error('Accepted office record changed');
const cohort={...original,claims:original.claims.filter(c=>review.acceptedClaimIds.includes(c.id))};
if(cohort.claims.length!==review.acceptedClaimIds.length)throw Error('Unknown accepted figure');
saveJSON(base+'accepted-cohort.json',cohort);saveJSON(base+'certificate.json',{...review,cohortHash:digest(cohort),originalCohortHash:digest(original),inputBindings:[...review.inputBindings,{path:base+'independent-review.json',sha256:sha(base+'independent-review.json')},{path:'scripts/research-completion-office-figures.mjs',sha256:sha('scripts/research-completion-office-figures.mjs')}],rationale:review.rationale+' Intake removes only the independently held subset; original frozen cohort and explicit holds are preserved. No accepted office reference, lifespan, name, source or activity interval is rewritten.'});console.log({accepted:cohort.claims.length,held:original.claims.length-cohort.claims.length});
