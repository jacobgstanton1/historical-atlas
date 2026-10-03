// Serial application of the already independently reviewed V2 packages.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {readContext,readJSON,saveJSON,digest} from './research-common.mjs';
import {fingerprint,validateDossier,acceptDossier,integrateDossier} from './research-comprehensive.mjs';
const out='research/external-capital-a-v2-2026-10-03',report=readJSON(out+'/validation.json');
assert.equal(report.dispositions.length,103,'Preflight not complete');assert.equal(report.applied,false);
assert.equal(readContext(process.cwd()).productionFingerprint,report.baselineFingerprint,'Unexpected production drift');
fs.copyFileSync(out+'/validation.json',out+'/preflight-validation.json');
// The PDF extraction review was recorded after the initial cached HTTP metadata
// reported no text. Its original body was actually read; amend only that review.
const amendedCell='entity-newfoundland@1930/capital';
for(const d of report.dispositions.filter(d=>d.sourceUrls.some(u=>u.includes('quarterly'))||d.cell_id===amendedCell))console.log('PDF review cell '+d.cell_id);
const pdf=readJSON(out+'/source-review.json').find(r=>r.sourceIndex===14);
for(const d of report.dispositions.filter(d=>pdf.supportedCellIds.includes(d.cell_id))){assert.ok(pdf.bodyReviewed);d.reasons=d.reasons.filter(r=>!r.startsWith('Source-body support insufficient: '+pdf.url));if(!d.reasons.length)d.status='accepted';}
const before=readJSON('data/comprehensive-dossiers.json');
for(const result of report.results){
 const items=report.dispositions.filter(d=>result.package.claims.some(c=>c.id===d.claimId));if(!items.some(d=>d.status==='accepted'))continue;
 const context=readContext(process.cwd()),fp=fingerprint(process.cwd()),pkg=result.package,job=result.job;
 pkg.productionFingerprint=fp;job.productionFingerprint=fp;
 if(items.some(d=>pdf.supportedCellIds.includes(d.cell_id)))pkg.provenance.preservedPackageHashes.push(digest(pdf));
 const validation=validateDossier(pkg,job,context);assert.ok(validation.valid,validation.errors.join('; '));
 const review={...result.review,packageHash:digest(pkg),reviewedIssues:validation.review,decisions:Object.fromEntries(items.map(d=>[d.claimId,d.status])),rationale:result.review.rationale+' Receipt refreshed against current production immediately before serial integration. Original initial source review is preserved in source-review-initial.json; PDF review amendment, where applicable, is preserved in source-review.json. '+items.flatMap(d=>d.resolvedIssues||[]).join(' ')};
 for(const d of items.filter(d=>d.status==='accepted'))if(validation.review.some(issue=>issue.startsWith('Conflicting')&&issue.includes(d.claimId))){d.status='held';d.reasons.push(...validation.review.filter(issue=>issue.startsWith('Conflicting')&&issue.includes(d.claimId)));review.decisions[d.claimId]='held';}
 let receipt=acceptDossier(pkg,job,context,review),integrated=null;
 if(receipt.acceptedClaimIds.length){try{integrateDossier(pkg,job,context,receipt,{apply:false});}catch(e){for(const d of items.filter(d=>d.status==='accepted')){d.status='held';d.reasons.push('Integrator: '+e.message);review.decisions[d.claimId]='held';}receipt=acceptDossier(pkg,job,context,review);}}
 if(receipt.acceptedClaimIds.length){integrated=integrateDossier(pkg,job,context,receipt,{apply:true});console.log(JSON.stringify({cell:items[0].cell_id,accepted:integrated.acceptedClaims}));}
 result.validation=validation;result.review=review;result.receipt=receipt;result.integration=integrated;
 saveJSON(out+'/integration-progress.json',report);
}
report.applied=true;
const after=readJSON('data/comprehensive-dossiers.json');for(const p of before.packages)assert.deepEqual(after.packages.find(x=>x.id===p.id),p);
assert.equal(after.packages.flatMap(p=>p.claims).length-before.packages.flatMap(p=>p.claims).length,report.dispositions.filter(d=>d.status==='accepted').length);
report.totals=Object.fromEntries(['accepted','held','rejected'].map(k=>[k,report.dispositions.filter(d=>d.status===k).length]));
saveJSON(out+'/validation.json',report);console.log(JSON.stringify(report.totals));
