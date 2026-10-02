import test from 'node:test';
import assert from 'node:assert/strict';
import {createRichDossierIndex} from '../rich-dossier.js';
const resolve=claim=>{
 const source={id:'s',title:'Sourced evidence',institution:'Test institution',url:'https://example.org/evidence'};
 const store={schemaVersion:2,packages:[{entityId:'e',sources:[source],claims:[claim],acceptance:{status:'accepted',acceptedClaimIds:['c'],review:{bodyReviewed:true,decisions:{c:'accepted'}}}}]};
 return createRichDossierIndex(store).resolve;
};
const claim=(category,metric)=>({id:'c',entityId:'e',category,metric,value:123,sourceIds:['s'],status:'supported',risks:[],scope:{relationship:'same'},temporal:{kind:'observation',observationDate:'1878',certainty:'exact'}});
test('Mapped area is available in its actual boundary year',()=>{
 const c=claim('area-statistics','Area (derived mapped geometry)');
 assert.equal(resolve(c)('e',1878).length,1);
});
test('Mapped area never falls back to earlier boundary geometry',()=>{
 const c=claim('area-statistics','Area (derived mapped geometry)');
 assert.equal(resolve(c)('e',1880).length,0);
 assert.equal(resolve(c)('e',1877).length,0);
});
test('Dated compatible census observations retain existing nearby context',()=>{
 const result=resolve(claim('population-statistics','Population'))('e',1880);
 assert.equal(result.length,1);assert.equal(result[0].actualTemporal.observationDate,'1878');
});
test('Dated official area observations retain existing statistical context',()=>{
 const result=resolve(claim('area-statistics','Official tabulated area'))('e',1880);
 assert.equal(result.length,1);assert.equal(result[0].actualTemporal.observationDate,'1878');
});
