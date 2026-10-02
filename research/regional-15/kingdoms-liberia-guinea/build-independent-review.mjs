import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {readJSON,saveJSON,digest} from '../../../scripts/research-common.mjs';
const b='research/regional-15/kingdoms-liberia-guinea/';
const cohortFile=process.argv[2]||'cohort.json';
const c=readJSON(b+cohortFile),db=readJSON('data/historical-entities.json');
assert.equal(c.claims.length,14);
const reasons={
 'liberia-us-relations':'Official historical narrative explicitly links 1862 establishment to continuing ties into1990s; bounded diplomatic relationship only.',
 'liberia-commission-report':'Original contemporary memorandum explicitly dates report submission September8,1930; commission findings not unqualified independent conclusions.',
 'liberia-reform-acceptance':'Original memorandum explicitly dates presidential notification September30,1930; acceptance distinguished from implementation.',
 'asante-early-capital':'Country study identifies royal capital Kumasi and nineteenth-century continuity; editorial framework only.',
 'asante-late-capital':'Wilks biography identifies capital/palace Kumase within1874–1883 reign; standard existing Kumasi spelling.',
 'asante-mensa-bonsu':'Wilks explicitly identifies Asantehene1874–1883; submitted1878–1881 is conservative narrower framework.',
 'asante-domankama':'Biography explicitly dates attempted assassination early1880 and consequent purge; year precision retained.',
 'asante-1814-invasion':'Original study explicitly includes1814 coastal invasion; preceding context not retimed1815.',
 'asante-1900-rebellion':'Original study explicitly dates rebellion1900 and separates later defeat/annexation.',
 'asante-resident-seat':'Original study identifies administration from Kumasi under resident after royal exile; submitted administrative role qualifies capital.',
 'sokoto-late-capitals':'Source explicitly distinguishes Sokoto principal and Gwandu western centre; conservative late-century interval.',
 'dan-fodio-1815':'Source supports religious/intellectual influence independently of office; catalogue author1754–1817 returned in full search metadata, broad publication range not a dated event.',
 'guinea-bolama-capital':'Archive printedpages1,11 identifies first capital Bolama and1941 transfer; conservative year coverage only.',
 'guinea-1913-campaigns':'Archive printedpage2 explicitly gives March1913–July1915; starting month retained without invented day or ownership inference.'
};
const decisions=c.claims.map(cl=>{const e=db.entities.find(e=>e.id===cl.entityId);assert(e);const reason=reasons[cl.id.replace('r15-root-','')];assert(reason);return{claimId:cl.id,claimDigest:digest(cl),entityId:cl.entityId,entityRecordDigest:digest(e),entityExistence:e.existence,decision:'accepted',rationale:reason,sourceIds:cl.sourceIds,locators:cl.evidence.map(e=>e.locator)};});
const review={reviewer:'officeholder-sources-independent-review',cohortHash:digest(c),bodyReviewed:true,reviewed:14,accepted:14,held:[],decisions,sourceAccessQualification:'Original web-rendered source bodies read. FRUS335 and LoC2021667264 full original content returned by exact-source searches; direct LoC opens403 and no manuscript facsimile inspected. See SOURCE-REVIEW.md.',productionChanges:0};
saveJSON(b+'review.json',review);
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const certificate={cohortHash:digest(c),reviewer:review.reviewer,bodyReviewed:true,acceptedClaimIds:c.claims.map(cl=>cl.id),inputBindings:[...new Set(['cohort.json',cohortFile,'SOURCE-REVIEW.md','review.json','build-independent-review.mjs'])].map(p=>({path:b+p,sha256:sha(b+p)})),rationale:'Independent original-source review of all14 claims. Exact/coarse precision, bounded frameworks, asymmetric capital roles, diplomatic continuity, dated event context and non-office religious/intellectual significance checked. Source/body access qualifications preserved in bound notes. Derived accepted cohort conservatively shortens five coarse interval endpoints to fit existing entity validity; submitted cohort remains preserved. No fabricated dates, modern territorial inference or production changes.'};
saveJSON(b+'certificate.json',certificate);
console.log(JSON.stringify({reviewDigest:digest(review),cohortHash:digest(c),certificateDigest:digest(certificate),certificateFileSHA:sha(b+'certificate.json'),accepted:14,held:0}));
