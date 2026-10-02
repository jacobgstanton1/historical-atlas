import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {isCLI,root} from './research-common.mjs';
export function validateUTF8(bytes){try{new TextDecoder('utf-8',{fatal:true}).decode(bytes);return true;}catch{return false;}}
export function checkAuthoredText(directory=root){
 const tracked=execFileSync('git',['ls-files','-z'],{cwd:directory,encoding:'utf8'}).split('\0').filter(Boolean);
 const authored=tracked.filter(p=>/\.(md|mjs|js|json|css|yml|yaml|svg)$/.test(p)||/\.html$/.test(p)&&!p.startsWith('research/'));
 const invalid=authored.filter(p=>!validateUTF8(fs.readFileSync(directory+'/'+p)));
 return {valid:invalid.length===0,filesChecked:authored.length,invalidUTF8:invalid,rawDownloadedEvidence:'Original research HTML/cache encodings are preserved; research is excluded from Pages.'};
}
if(isCLI(import.meta.url)){const r=checkAuthoredText();console.log(JSON.stringify(r,null,2));if(!r.valid)process.exitCode=1;}
