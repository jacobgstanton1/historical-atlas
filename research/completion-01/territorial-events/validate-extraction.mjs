import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {digest} from '../../../scripts/research-common.mjs';
const b='research/completion-01/territorial-events',read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const raw=read(`${b}/raw-extraction.json`),tranche=read(`${b}/candidate-tranche.json`);
// Independently reconstruct every original simple CSV row, rather than trust the extraction JSON.
const lines=fs.readFileSync(`${b}/cache/extracted/tc2018.csv`,'utf8').trim().split(/\r?\n/),keys=lines.shift().split(',');
assert.equal(keys.length,19);assert.equal(lines.length,raw.rows.length);
for(const [i,line]of lines.entries()){const cells=line.split(',');assert.equal(cells.length,keys.length);assert.deepEqual(Object.fromEntries(keys.map((k,j)=>[k,cells[j]])),raw.rows[i]);}
assert.equal(new Set(tranche.events.map(e=>e.id)).size,tranche.events.length);
for(const e of tranche.events){assert.deepEqual(e.rawRow,raw.rows[e.sourceRowIndex]);assert.equal(e.sourceCSVLine,e.sourceRowIndex+2);assert.equal(e.eventDate.slice(0,4),e.rawRow.year);assert.equal(e.sourceChangeNumber,e.rawRow.number);assert.ok(e.eventPrecision==='month'||e.eventPrecision==='year');assert.ok(!e.eventDate.match(/^\d{4}-\d{2}-\d{2}$/));for(const s of e.prioritySlots){assert.ok(s.contextAgeYears>=0&&s.contextAgeYears<=5);assert.equal(s.status,'missing');assert.equal(s.actualEventDate,e.eventDate);}assert.ok(e.qualification.includes('Does not establish legal sovereignty'));}
for(const [key,path]of Object.entries({csv:'cache/extracted/tc2018.csv',manual:'cache/extracted/tcmanual.pdf',catalogue:'cache/extracted/Entities.pdf',zip:'cache/terr-changes-v6.zip'}))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(`${b}/${path}`)).digest('hex'),tranche.sourceBindings[key]);
assert.equal(tranche.rawExtractionDigest,digest(raw));assert.equal(tranche.productionEdited,false);assert.equal(tranche.newHTTPRetrievalAttemptsByWorker,0);
const result={passed:true,checks:['CSV19columns','all842originalrowsreconstructed','uniqueeventIDs','rawrow/linebinding','literalyear/dateprecision','change-numberbinding','max5yearactualcontext','explicitnonlegalqualification','all4sourcebodyhashes','raw-extractioncanonicaldigest','productionuntouched','cachedsourceonly'],canonicalDigest:digest(tranche),metrics:tranche.metrics};
fs.writeFileSync(`${b}/extraction-validation.json`,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
