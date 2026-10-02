import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {digest} from '../../../scripts/research-common.mjs';
const b='research/bulk-02/events',read=p=>JSON.parse(fs.readFileSync(p));
const p=read(`${b}/cow-events-review-tranche.json`),raw=read(`${b}/cow-events-extracted.json`),sha=path=>crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex');
for(const s of raw.sources)assert.equal(sha(s.cachePath),s.sha256);
assert.equal(p.rawExtractionHash,digest(raw));
assert.equal(raw.originalRows.length,337);
assert.equal(new Set(raw.events.map(e=>e.id)).size,raw.events.length);
for(const e of raw.events){
 assert.deepEqual(e.originalRow,raw.originalRows[e.originalRowNumber-2]);
 const ep=e.episode,stem=e.endpoint;
 for(const part of ['Year','Month','Day'])assert.equal(e.rawDateFields[part],e.originalRow[`${stem}${part}${ep}`]);
 assert.ok(!('validFrom'in e)&&!('validUntil'in e));
 assert.ok(!e.eventDate||e.eventDate<'1961');
 if(e.originalRow.TransFrom!=='-8'||e.originalRow.TransTo!=='-8')assert.equal(e.status,'historical-review');
 if(e.episode===2)assert.equal(e.status,'historical-review');
}
for(const e of p.events){
 assert.equal(e.eventPrecision,'day');assert.equal(e.status,'historical-review');assert.equal(e.sourceIdentityApproval,false);
 assert.equal(e.identitySuggestions.length,1);assert.equal(e.reviewIssues.length,1);
 assert.ok(e.prioritySlots.length);
 for(const s of e.prioritySlots){assert.equal(s.categoryStatus,'missing');assert.ok(s.contextAgeYears>=0&&s.contextAgeYears<=5);assert.equal(s.actualEventDate,e.eventDate);}
 assert.match(e.qualification,/No war-wide cessation or declaration inferred/);
}
const unique=new Set(p.events.flatMap(e=>e.prioritySlots.map(s=>s.snapshotYear+':'+s.entityId)));
assert.equal(unique.size,p.metrics.missingEntitySnapshotSlots);
const franceWWII=raw.events.filter(e=>e.warName==='World War II'&&e.rawParticipant==='France');
assert.ok(franceWWII.length&&franceWWII.every(e=>e.status==='historical-review'));
const invalid=raw.events.filter(e=>e.eventPrecision!=='day');assert.ok(invalid.every(e=>e.status==='historical-review'));
const result={passed:['Original CSV/codebook bytes','337 original participant rows retained','Unique row/war/code/side/episode/endpoint IDs','Every date component exactly matches original CSV field','Event endpoints have no invented validity intervals','No post1960 event leakage','Transformations held','Second episodes held rather than bridged','Review-only single-framework priority events','Actual dates preserved in ≤5year prior context','Only missing category slots prioritized','Legal declarations/peace/sovereignty not inferred','Distinct unique-slot metric','France WWII repeated-side records held','Unknown/coarse dates held'],trancheHash:digest(p),extractionHash:digest(raw),metrics:p.metrics,sourceHashes:Object.fromEntries(raw.sources.map(s=>[s.cachePath,s.sha256])),parserHashes:Object.fromEntries([`${b}/extract-cow.py`,`${b}/prioritize-events.mjs`].map(path=>[path,sha(path)])),productionEdited:false};
fs.writeFileSync(`${b}/validation.json`,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({passed:result.passed.length,hash:result.trancheHash,metrics:result.metrics}));
