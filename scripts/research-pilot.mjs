import path from 'node:path';
import {readContext,saveJSON,root,isCLI} from './research-common.mjs';
import {scan} from './research-scan.mjs';
import {generateJobs} from './research-generate.mjs';
import {initializeQueue} from './research-queue.mjs';
export const pilotSelection=[
  ['france-political-frameworks',1848,'political-institutional'],
  ['france-political-frameworks',1957,'important-figures'],
  ['germany-weimar-framework',1920,'leadership'],
  ['germany-weimar-framework',1925,'population-statistics'],
  ['japan-initial-allied-occupation',1946,'events-context'],
  ['iran-reza-packed-majles-framework',1935,'events-context'],
  ['taiwan-japanese-administration',1935,'leadership']
];
export function pilotJobs(context) {
  return pilotSelection.map(([entityId,year,category])=>{
    const result=generateJobs(scan(context,{from:year,until:year,entityIds:[entityId]}),context,{limit:1,categories:[category],entityIds:[entityId]});
    if(result.jobs.length!==1)throw Error('Pilot selection no longer represents a gap: '+entityId+' '+year+' '+category);
    return result.jobs[0];
  });
}
if(isCLI(import.meta.url)) {
  const jobs=pilotJobs(readContext());
  initializeQueue(path.join(root,'research/pilot/queue.json'),jobs,{concurrency:3});
  saveJSON(path.join(root,'research/pilot/jobs.json'),{schemaVersion:1,concurrency:3,jobs});
  console.log(JSON.stringify(jobs.map(j=>({id:j.id,entityId:j.entityId,period:j.period,category:j.category})),null,2));
}
