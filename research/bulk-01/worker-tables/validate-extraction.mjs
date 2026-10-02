import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {readContext} from '../../../scripts/research-common.mjs';
const report=JSON.parse(fs.readFileSync('research/bulk-01/worker-tables/officeholders.json','utf8'));
const context=readContext(),ids=new Set();
for(const s of report.sources){assert.equal(crypto.createHash('sha256').update(fs.readFileSync(s.cachePath)).digest('hex'),s.sha256);assert.equal(s.bodyReviewed,true);}
for(const r of report.rows){assert(!ids.has(r.id));ids.add(r.id);assert(report.sources.some(s=>s.id===r.sourceId));assert(r.entityIdsSuggested.every(id=>context.db.entities.some(e=>e.id===id)));assert(r.from<=r.until);assert.equal(r.from.length,r.precision==='day'?10:4);assert.equal(r.until.length,r.precision==='day'?10:4);assert(r.locator&&r.originalTerm&&r.endpointInterpretation);}
const us=report.rows.filter(r=>r.sourceId==='bulk01-us-presidents-congress');
assert.equal(us.length,81);assert.equal(report.rows.filter(r=>r.sourceId==='bulk01-france-presidents').length,18);assert.equal(report.rows.filter(r=>r.sourceId==='bulk01-portugal-presidents').length,13);assert.equal(report.rows.filter(r=>r.sourceId==='bulk01-netherlands-monarchs').length,5);
assert(us.some(r=>r.name==='George Clinton'&&r.officeTitle.startsWith('Vice')&&r.until==='1812-04-20'));
assert(us.some(r=>r.name==='John C. Calhoun'&&r.until==='1832-12-28'));
assert(us.some(r=>r.name==='Garret A. Hobart'&&r.until==='1899-11-21'));
assert(us.filter(r=>r.name==='John Tyler').every(r=>r.disposition==='historical-review'));
assert(report.rows.some(r=>r.name==='Louis-Napoléon Bonaparte'&&r.until==='1851'&&r.disposition==='historical-review'));
assert.equal(report.productionEdited,false);
console.log('Bulk extraction checks passed:117 rows,4 source hashes, actual IDs, original precision, footnote death/resignation truncation, explicit disputed dates.');
