import test from 'node:test';
import assert from 'node:assert/strict';
import {completeYears,qualifiedStatement,filenamePeriodConflict} from '../scripts/research-dated-flags.mjs';
const qual=(time,precision)=>({datavalue:{value:{time,precision,before:0,after:0,calendarmodel:'http://www.wikidata.org/entity/Q1985727'}}});
test('Undated current flag never back-projected',()=>assert.equal(completeYears(['Q1','Current.svg','',''],{validFrom:'1800-01-01'}),null));
test('Adoption and retirement years excluded conservatively',()=>assert.deepEqual(completeYears(['Q1','Historic.svg','1899-01-01','1918-01-01'],{validFrom:'1800-01-01'}),{from:'1900',until:'1917'}));
test('Open entity interval stops at configured 1960 limit',()=>assert.deepEqual(completeYears(['Q1','Historic.svg','1958-10-04',''],{validFrom:'1949-01-01'}),{from:'1959',until:'1960'}));
test('Historical entity envelope clips flag applicability',()=>assert.deepEqual(completeYears(['Q1','Historic.svg','1850-01-01','1940-01-01'],{validFrom:'1901-06-01',validUntil:'1910-01-01'}),{from:'1902',until:'1909'}));
test('Original year precision matches normalized table but stays year precision',()=>{
 const e={claims:{P41:[{mainsnak:{datavalue:{value:'Flag.svg'}},rank:'normal',qualifiers:{P580:[qual('+1850-00-00T00:00:00Z',9)]}}]}};
 assert(qualifiedStatement(e,['Q1','Flag.svg','1850-01-01','']));assert.equal(e.claims.P41[0].qualifiers.P580[0].datavalue.value.precision,9);
 assert(!qualifiedStatement(e,['Q1','Flag.svg','1851-01-01','']));
});
test('Deprecated and century-only assertions never accepted as dated facts',()=>{
 for(const [rank,precision] of [['deprecated',11],['normal',7]]){
  const e={claims:{P41:[{mainsnak:{datavalue:{value:'Flag.svg'}},rank,qualifiers:{P580:[qual('+1850-01-01T00:00:00Z',precision)]}}]}};
  assert(!qualifiedStatement(e,['Q1','Flag.svg','1850-01-01','']));
 }
});
test('Contradictory graphic periods held, multiple documented periods preserved',()=>{
 assert(filenamePeriodConflict('Flag of Venezuela (1811).svg',{from:'1871',until:'1887'}));
 assert(filenamePeriodConflict('Flag of Paraguay (1826-1842).svg',{from:'1871',until:'1878'}));
 assert(!filenamePeriodConflict('Flag of Spain (1785–1873, 1875–1931).svg',{from:'1875',until:'1930'}));
});
