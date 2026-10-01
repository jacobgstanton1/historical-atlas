import test from 'node:test';
import assert from 'node:assert/strict';
import {atomicRename} from '../scripts/research-queue.mjs';
test('temporary file-sharing locks retry the same atomic rename without deleting either path',()=>{
 let calls=0,delays=[];const paths=[];atomicRename('prepared','target',{rename:(from,to)=>{paths.push([from,to]);if(calls++<2)throw Object.assign(new Error('Temporary sharing lock'),{code:'EPERM'});},pause:ms=>delays.push(ms)});
 assert.equal(calls,3);assert.deepEqual(delays,[25,50]);assert.ok(paths.every(p=>p[0]==='prepared'&&p[1]==='target'));
});
test('permanent access failures remain bounded and unrelated filesystem errors fail immediately',()=>{
 let calls=0;assert.throws(()=>atomicRename('prepared','target',{rename:()=>{calls++;throw Object.assign(new Error('Denied'),{code:'EACCES'});},pause:()=>{}}),/Denied/);assert.equal(calls,7);
 calls=0;assert.throws(()=>atomicRename('prepared','target',{rename:()=>{calls++;throw Object.assign(new Error('Disk full'),{code:'ENOSPC'});},pause:()=>assert.fail('No retry')}),/Disk full/);assert.equal(calls,1);
});
