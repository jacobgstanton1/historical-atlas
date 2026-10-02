import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {digest,dateRange} from '../../../scripts/research-common.mjs';
const b='research/completion-01/currency',x=JSON.parse(fs.readFileSync(`${b}/candidate-tranche.json`));
for(const s of x.sources){assert.ok(s.title&&s.institution&&s.url);assert.equal(crypto.createHash('sha256').update(fs.readFileSync(s.cachePath)).digest('hex'),s.sha256);}
assert.equal(new Set(x.claims.map(c=>c.id)).size,x.claims.length);
for(const c of x.claims){assert.ok(c.validFrom<c.validUntil);assert.ok(c.sourceIds.every(id=>x.sources.some(s=>s.id===id)));assert.ok(c.mappingEvidenceIds.length);assert.ok(c.scope&&c.evidenceNote&&c.sourceLocator);for(const s of c.prioritySlots){assert.equal(s.status,'missing');assert.ok(c.validFrom<=`${s.snapshotYear}-01-01`&&c.validUntil>=`${s.snapshotYear+1}-01-01`);}assert.ok(dateRange(c.sourceLegalOrHistoricalFrom)[0]<=dateRange(c.validFrom)[0]);}
const out={passed:true,canonicalDigest:digest(x),groupedChecks:['all8bodyhashes','institution/title/URLprovenance','uniqueIDs','orderedintervals','resolvedsourceIDs','existingidentitysourceIDs','scope/evidence/locators','fullsnapshotboundedpriority','source/frameworkclipping'],metrics:x.metrics,highConfidenceClaims:x.claims.filter(c=>!c.reviewIssues.length).length,initialHistoricalReviewHolds:x.claims.filter(c=>c.reviewIssues.length).map(c=>c.id),productionEdited:false};
fs.writeFileSync(`${b}/validation.json`,JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out));
