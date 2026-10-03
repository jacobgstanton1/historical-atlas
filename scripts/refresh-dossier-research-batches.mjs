// Refresh lean partitions from the regenerated export; no acquisition or integration.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {parseCSV,csv} from './integrate-external-capital-a-v2.mjs';
const directory='exports/dossier-workload/research-batches',index=JSON.parse(fs.readFileSync(directory+'/index.json'));
const workload=JSON.parse(fs.readFileSync('exports/dossier-workload/workload.json'));
const cells=new Map(workload.cells.map(c=>[c.cell_id,c])),groups=new Map(),oldIds=new Set();
for(const entry of index.files){const table=parseCSV(fs.readFileSync(directory+'/'+entry.file,'utf8'));for(const row of table.rows){assert.ok(!oldIds.has(row.cell_id));oldIds.add(row.cell_id);const cell=cells.get(row.cell_id);assert.ok(cell,'Missing immutable occurrence cell');if(!['MISSING','PARTIAL'].includes(cell.current_status))continue;
 const next={...row};for(const key of index.columns)if(key in cell&&key!=='notes')next[key]=typeof cell[key]==='object'?JSON.stringify(cell[key]):String(cell[key]);
 next.notes=JSON.stringify([...cell.notes,'Existing applicability intervals: '+JSON.stringify(cell.applicability_intervals)]);next.proposals_json='';
 const name=cell.dossier_category+'-'+cell.research_priority+'.csv';if(!groups.has(name))groups.set(name,[]);groups.get(name).push(next);
}}
assert.equal([...groups.values()].flat().length,workload.cells.filter(c=>['MISSING','PARTIAL'].includes(c.current_status)).length,'Unexpected newly unresolved cells require explicit export review');
const files=[];for(const [name,rows]of [...groups].sort((a,b)=>a[0].localeCompare(b[0]))){const bytes=Buffer.from(csv({header:index.columns,rows}));assert.ok(bytes.length<=index.max_csv_size_bytes,'Partition exceeds size bound');fs.writeFileSync(directory+'/'+name,bytes);files.push({file:name,category:rows[0].dossier_category,priority:rows[0].research_priority,row_count:rows.length,file_size_bytes:bytes.length,statuses_included:[...new Set(rows.map(r=>r.current_status))].sort(),sha256:crypto.createHash('sha256').update(bytes).digest('hex')});}
for(const entry of index.files)assert.ok(groups.has(entry.file),'Empty partition requires explicit file removal');
index.source_commit=workload.metadata.sourceCommit;index.production_fingerprint=workload.metadata.productionFingerprint;index.source_workload_sha256=crypto.createHash('sha256').update(fs.readFileSync('exports/dossier-workload/workload.json')).digest('hex');index.total_rows=files.reduce((n,f)=>n+f.row_count,0);index.total_files=files.length;index.files=files;fs.writeFileSync(directory+'/index.json',JSON.stringify(index,null,2)+'\n');
console.log(JSON.stringify({files:files.length,rows:index.total_rows,productionFingerprint:index.production_fingerprint}));
