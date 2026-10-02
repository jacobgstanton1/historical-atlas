import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {digest,dateRange} from '../../../scripts/research-common.mjs';
const base='research/completion-01/empire-statistics',d=JSON.parse(fs.readFileSync(`${base}/candidate-tranche.json`)), {digest:given,...original}=d;
const checks=[]; function check(label,fn){fn();checks.push({label,passed:true});}
check('Canonical artifact digest',()=>assert.equal(given,digest(original)));
check('All three original PDF bodies match digest and PDF signature',()=>{for(const s of d.source.bodies){const b=fs.readFileSync(s.path);assert.equal(b.subarray(0,5).toString(),'%PDF-');assert.equal(crypto.createHash('sha256').update(b).digest('hex'),s.sha256);assert.match(s.url,/1915013[234]010[012]_p/);}});
check('83 literal rows produce166 distinct category candidates',()=>{assert.equal(d.rows.length,83);assert.equal(d.candidates.length,166);assert.equal(new Set(d.candidates.map(c=>c.candidateId)).size,166);});
check('Actual observation precision stays source year; estimate exception1910',()=>{for(const r of d.rows){assert.equal(r.populationObservationDate,r.footnotes.includes(1)?'1910':'1911');assert.equal(r.datePrecision,'year');assert.equal(r.areaMeasurementDate,null);assert.equal(r.reportingYear,'1911');}});
check('Evidence with unresolved historical or territorial issue stays held',()=>{for(const c of d.candidates)if(c.holds.length)assert.equal(c.status,'held');});
check('Every proposed safe mapping encompasses actual observation year',()=>{for(const c of d.candidates.filter(c=>c.status==='independent-review')){const r=d.rows.find(r=>r.rowId===c.rowId);assert.ok(r.entityExistence);assert.ok(dateRange(r.entityExistence.validFrom)[0]<=dateRange(c.observationDate)[0]);if(r.entityExistence.validUntil)assert.ok(dateRange(r.entityExistence.validUntil)[0]>=dateRange(c.observationDate)[1]);}});
check('Mandatory exclusions, partial estimates and split HongKong area preserved',()=>{assert.ok(d.rows.find(r=>r.rawLabel==='Ceylon').scopeNotes[0].includes('Excludes military'));assert.ok(d.rows.find(r=>r.rawLabel==='Total Commonwealth of Australia').scopeNotes[0].includes('100000'));assert.ok(d.rows.find(r=>r.rawLabel==='Rhodesia Northern').scopeNotes[0].includes('Partly estimated'));assert.equal(d.rows.find(r=>r.rawLabel==='Hong Kong').areaSquareMiles,null);assert.ok(d.rows.find(r=>r.rawLabel==='Hong Kong').scopeNotes.some(n=>n.includes('404')));});
check('Whole-source exclusions explicit and no invented density or survey date',()=>{assert.ok(d.rows.find(r=>r.rawLabel==='Fiji').holds.length);assert.ok(d.candidates.every(c=>['population-statistics','area-statistics'].includes(c.category)));assert.equal(d.productionChanged,false);});
const out={artifactDigest:given,groupedChecks:checks.length,checks,metrics:d.metrics,certificationScope:'Structural/extraction contract checks only; independent facsimile and historical mapping review remains mandatory.'};
fs.writeFileSync(`${base}/validation.json`,JSON.stringify(out,null,2)+'\n'); console.log(JSON.stringify(out));
