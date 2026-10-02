import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {acquire,destination,digest} from './acquire.mjs';
test('destinations cannot escape isolated cache and staging',()=>{
  for(const p of ['../../data/sources.json','cache/../../data/x','assets/flags/x.svg','cache/dir/x'])assert.throws(()=>destination(p));
});
test('only explicitly approved HTTPS source hosts are fetched',async()=>{
  let calls=0;const transport=async()=>{calls++;};
  for(const url of ['http://example.test/a','https://evil.test/a'])await assert.rejects(acquire({allowedHosts:['example.test'],resources:[{id:'bad',url,path:'cache/test-disallowed.txt'}]},transport));
  assert.equal(calls,0);
});
test('cached exact hash is reused without network and failure stays isolated',async()=>{
  const file=destination('cache/test-reuse.txt'),bytes=Buffer.from('source body');fs.writeFileSync(file,bytes);
  try{const m={allowedHosts:['example.test'],resources:[{id:'reuse',url:'https://example.test/a',path:'cache/test-reuse.txt',sha256:digest(bytes)}]};
  const r=await acquire(m,()=>{throw Error('network must not run');});assert.equal(r.resources[0].reused,true);assert.equal(r.resources[0].status,'acquired');
  m.resources[0].sha256='0'.repeat(64);const bad=await acquire(m);assert.equal(bad.resources[0].status,'acquisition-failed');assert.equal(fs.readFileSync(file).toString(),'source body');
  }finally{fs.unlinkSync(file);}
});
test('one failed source does not prevent another recoverable acquisition',async()=>{
  const file=destination('cache/test-new.txt');let calls=0;
  try{const r=await acquire({allowedHosts:['example.test'],resources:[{id:'failed',url:'https://example.test/no',path:'cache/test-no.txt'},{id:'good',url:'https://example.test/yes',path:'cache/test-new.txt'}]},async()=>{calls++;return calls===1?{ok:false,status:503}:{ok:true,arrayBuffer:async()=>Buffer.from('evidence')};});
  assert.equal(r.resources[0].status,'acquisition-failed');assert.equal(r.resources[1].status,'acquired');assert.equal(r.resources[1].reused,false);
  }finally{if(fs.existsSync(file))fs.unlinkSync(file);}
});
test('hash mismatch never creates an accepted staged asset',async()=>{
  const file=destination('staged-assets/test-rejected.svg');assert.equal(fs.existsSync(file),false);
  const r=await acquire({allowedHosts:['example.test'],resources:[{id:'bad-svg',url:'https://example.test/svg',path:'staged-assets/test-rejected.svg',sha256:'0'.repeat(64)}]},async()=>({ok:true,arrayBuffer:async()=>Buffer.from('<svg/>')}));
  assert.equal(r.resources[0].status,'acquisition-failed');assert.equal(fs.existsSync(file),false);
});
