// Recalculate observed production gains against the immutable starting matrix.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const root='research/regional-09',read=p=>JSON.parse(fs.readFileSync(p));
const before=read(root+'/baseline.json'),after=read('research/completion-01/reports/completion.json');
const old=new Map(before.rows.map(r=>[r.entityId+'|'+r.snapshotYear,r]));
const byCategory={},bySnapshot={},improved=new Set(),facts=new Set(),gains=[];
for(const row of after.rows){const previous=old.get(row.entityId+'|'+row.snapshotYear);if(!previous)continue;
 for(const [category,cell] of Object.entries(row.categories)){
  const last=previous.categories[category];
  if(cell.records.some(id=>!(last.records||[]).includes(id)))facts.add(row.entityId+'|'+row.snapshotYear);
  if(last.status!=='supported'&&cell.status==='supported'){
   gains.push({entityId:row.entityId,snapshot:row.snapshotYear,category,before:last.status,after:cell.status});
   improved.add(row.entityId+'|'+row.snapshotYear);byCategory[category]=(byCategory[category]||0)+1;bySnapshot[row.snapshotYear]=(bySnapshot[row.snapshotYear]||0)+1;
  }
 }
}
const store=read('data/comprehensive-dossiers.json'),previous=JSON.parse(execFileSync('git',['show',before.checkpoint+':data/comprehensive-dossiers.json'],{maxBuffer:100*1024*1024}));
const count=s=>s.packages.reduce((n,p)=>n+p.claims.length,0),workload=read(root+'/workload.json'),batch=workload.batches.find(b=>b.batch==='09');
const batchKeys=new Set(before.batch.needs.map(r=>r.entityId+'|'+r.snapshot));
const delta={baselineCommit:before.checkpoint,before:before.metrics,after:after.metrics,startingClaims:count(previous),endingClaims:count(store),newClaims:count(store)-count(previous),newSupportedSlots:gains.length,dossiersFullySupportedImproved:improved.size,dossiersWithNewApplicableFacts:facts.size,byCategory,bySnapshot,batch09Before:before.batch,batch09After:batch,batch09NewSupportedSlots:gains.filter(r=>batchKeys.has(r.entityId+'|'+r.snapshot)).length,gains,browserChecks:0};
fs.writeFileSync(root+'/checkpoint-delta.json',JSON.stringify(delta,null,2)+'\n');
console.log(JSON.stringify({...delta,batch09Before:undefined,batch09After:{dossiers:batch.dossiers,unresolved:batch.unresolved,states:batch.states},gains:undefined}));
