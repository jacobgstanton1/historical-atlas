import test from 'node:test';
import assert from 'node:assert/strict';
import {fullYear} from '../scripts/research-snapshot-scan.mjs';
const interval=(from,until)=>({kind:'interval',from,until,certainty:'exact'});
const subset=()=>({temporal:interval('1800','1815'),origin:{temporalBasis:'bounded-research-subset'},evidence:[{temporal:interval('1796','1820'),precision:'year'}]});
test('reviewed year-shaped research subsets retain source precision and cover interior source years',()=>{
 const c=subset();assert.equal(fullYear(c,1800),true);assert.equal(fullYear(c,1815),true);assert.equal(c.evidence[0].precision,'year');
});
test('unmarked historical endpoint uncertainty remains partial',()=>{const c=subset();delete c.origin;assert.equal(fullYear(c,1800),false);assert.equal(fullYear(c,1815),false);});
test('source transition boundary cannot become a supported full year',()=>{const c=subset();c.evidence[0].temporal=interval('1800','1815');assert.equal(fullYear(c,1800),false);assert.equal(fullYear(c,1815),false);});
test('research subset cannot leak outside its own requested years',()=>{assert.equal(fullYear(subset(),1799),false);assert.equal(fullYear(subset(),1816),false);});
test('every supporting interval must cover the selected year',()=>{const c=subset();c.evidence.push({temporal:interval('1800-06-01','1815'),precision:'day'});assert.equal(fullYear(c,1800),false);});
test('point observations cannot be promoted into interval evidence',()=>{const c=subset();c.evidence[0].temporal={kind:'observation',observationDate:'1796',certainty:'exact'};assert.equal(fullYear(c,1800),false);});
