import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateUTF8,checkAuthoredText} from '../scripts/pages-safety.mjs';
test('UTF8 validation rejects the exact Windows-1252 failure without replacement decoding',()=>{assert.equal(validateUTF8(Buffer.from([65,0x96,66])),false);assert.equal(validateUTF8(Buffer.from('1800–1960 · Brésil','utf8')),true);});
test('Authored tracked files are valid and raw publisher evidence is preserved',()=>{const r=checkAuthoredText();assert.deepEqual(r.invalidUTF8,[]);assert.ok(r.filesChecked>500);});
test('Pages excludes internal material without excluding application data or assets',()=>{
 const config=fs.readFileSync(new URL('../_config.yml',import.meta.url),'utf8');
 for(const p of ['research','development','scripts','tests'])assert.match(config,new RegExp('^  - '+p+'$','m'));
 for(const p of ['data','assets','index.html','app.js','dossier.js'])assert.doesNotMatch(config,new RegExp('^  - '+p.replace('.','\\.')+'$','m'));
});
