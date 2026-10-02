import {execFileSync} from 'node:child_process';
import {digest,saveJSON} from './research-common.mjs';
const sha=process.argv[2];if(!/^[a-f0-9]{40}$/.test(sha||''))throw Error('Exact checkpoint SHA required');
const site='https://jacobgstanton1.github.io/historical-atlas/';
const runs=await fetch('https://api.github.com/repos/jacobgstanton1/historical-atlas/actions/runs?per_page=30',{headers:{'User-Agent':'HistoricalAtlasDeploymentCheck'}}).then(r=>{if(!r.ok)throw Error('Workflow HTTP '+r.status);return r.json();});
const deployment=runs.workflow_runs.find(r=>r.head_sha===sha&&r.name==='pages build and deployment');
if(deployment?.conclusion!=='success')throw Error('Exact Pages checkpoint not successful yet: '+JSON.stringify(deployment&&{status:deployment.status,conclusion:deployment.conclusion,id:deployment.id}));
const files=['data/comprehensive-dossiers.json','app.js','data-pipeline.js','rich-dossier.js','dossier-presentation.js'];
const checks=[];
for(const file of files){const expected=execFileSync('git',['show',sha+':'+file],{encoding:'utf8',maxBuffer:50_000_000});const response=await fetch(site+file+'?checkpoint='+sha);if(!response.ok)throw Error('Live HTTP '+response.status+' '+file);const actual=await response.text();const json=file.endsWith('.json');const expectedHash=digest(json?JSON.parse(expected):expected),liveHash=digest(json?JSON.parse(actual):actual);if(expectedHash!==liveHash)throw Error('Live mismatch '+file);checks.push({file,expectedHash,liveHash,match:true});}
const proof={checkpoint:sha,deployment:{id:deployment.id,url:deployment.html_url,conclusion:deployment.conclusion},checkedAt:new Date().toISOString(),checks,browserChecks:0};
if(process.argv.includes('--save'))saveJSON('research/bulk-01/reports/deployment-proof.json',proof);
console.log(JSON.stringify(proof,null,2));
