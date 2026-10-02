import fs from 'node:fs';import {execFileSync} from 'node:child_process';import {createHash} from 'node:crypto';
const revision=process.argv[2]||'HEAD';const refs=new Map();
for(const name of fs.readdirSync('research/bulk-01').filter(n=>n.endsWith('-contract.json'))){const c=JSON.parse(fs.readFileSync('research/bulk-01/'+name));for(const b of [{path:c.parserPath,sha256:c.parserSha256},...(c.parserBindings||[])])if(b.path){if(refs.has(b.path)&&refs.get(b.path)!==b.sha256)throw Error('Conflicting source-specific parser certificates '+b.path);refs.set(b.path,b.sha256);}}
for(const [p,sha256] of refs){const bytes=execFileSync('git',['show',revision==='index'?':'+p:revision+':'+p],{maxBuffer:150000000});if(createHash('sha256').update(bytes).digest('hex')!==sha256)throw Error('Committed certified parser differs from source review: '+p);}
console.log(JSON.stringify({valid:true,revision,uniqueCertifiedParsers:refs.size,browserChecks:0}));
