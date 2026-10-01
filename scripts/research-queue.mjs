import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {digest} from './research-common.mjs';

const clone = value => structuredClone(value);
export const packageDigest = digest;
function requireCondition(condition, message) { if (!condition) throw new Error(message); }
export function withLock(file, operation) {
  requireCondition(operation?.constructor?.name!=='AsyncFunction','Lock operations must be synchronous');
  const lock = file + '.lock';
  fs.mkdirSync(path.dirname(file), {recursive:true});
  let handle;
  try { handle = fs.openSync(lock, 'wx'); } catch (error) { if (error.code === 'EEXIST') throw new Error('Exclusive lock is held: ' + lock); throw error; }
  let pending=false;
  const release=()=>{fs.closeSync(handle);if(fs.existsSync(lock))fs.unlinkSync(lock);};
  try {
    fs.writeFileSync(handle, JSON.stringify({pid:process.pid,createdAt:new Date().toISOString()}));
    fs.fsyncSync(handle);
    const result=operation();
    if(result&&typeof result.then==='function'){pending=true;Promise.resolve(result).then(release,release);throw new Error('Lock operations must be synchronous; lock retained until promise settles');}
    return result;
  } finally { if(!pending)release(); }
}
export function inspectLock(file) { const lock=file+'.lock';return fs.existsSync(lock)?JSON.parse(fs.readFileSync(lock,'utf8')):null; }
export function recoverLock(file,{actor,reason,expectedOwner}={}) {
  requireCondition(actor?.role==='coordinator'&&actor.id&&reason?.trim(),'Explicit coordinator lock-recovery rationale required');
  const owner=inspectLock(file);requireCondition(owner&&Number.isInteger(owner.pid)&&owner.pid>0,'Invalid lock owner');
  requireCondition(expectedOwner && digest(owner)===digest(expectedOwner),'Lock owner changed or was not inspected');
  let dead=false;try{process.kill(owner.pid,0);}catch(error){if(error.code==='ESRCH')dead=true;else throw new Error('Cannot prove lock owner exited; recovery refused');}
  requireCondition(dead,'Lock owner remains alive; no automatic stealing');
  requireCondition(digest(inspectLock(file))===digest(owner),'Lock owner changed during recovery');fs.unlinkSync(file+'.lock');return {recovered:true,owner,actor,reason};
}
export function atomicWrite(file, value) {
  const temporary = file + '.' + crypto.randomUUID() + '.tmp';
  let handle;
  try {
    handle = fs.openSync(temporary, 'wx');
    fs.writeFileSync(handle, JSON.stringify(value,null,2)+'\n'); fs.fsyncSync(handle); fs.closeSync(handle); handle = undefined;
    fs.renameSync(temporary,file);
  } finally { if (handle !== undefined) fs.closeSync(handle); if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
}
export function createQueue(jobs, {concurrency = 3} = {}) {
  requireCondition(Number.isInteger(concurrency) && concurrency > 0, 'Invalid concurrency');
  requireCondition(new Set(jobs.map(j=>j.id)).size === jobs.length, 'Duplicate job ID');
  requireCondition(jobs.every(j=>j.id && j.productionFingerprint && j.mapIds?.length && (j.entityId || (j.entityId===null&&['resolver','identity-review','mapping-review'].includes(j.category)))), 'Incomplete jobs');
  return {schemaVersion:1,revision:0,concurrency,jobs:jobs.map(j=>({...clone(j),status:'queued',attempt:0,history:[]}))};
}
export function readQueue(file) { return JSON.parse(fs.readFileSync(file,'utf8')); }
export function transitionQueue(input, action, args = {}, options = {}) {
  const state=clone(input), job=state.jobs.find(j=>j.id===args.jobId), now=options.now || new Date().toISOString();
  requireCondition(job, 'Unknown job');
  const coordinator = () => requireCondition(args.actor?.role === 'coordinator' && args.actor.id, 'Coordinator identity required');
  const owner = () => requireCondition(job.owner && args.workerId === job.owner, 'Worker does not own this job');
  if (action === 'claim') {
    requireCondition(job.status==='queued','Job is not queued'); requireCondition(args.workerId,'Worker identity required');
    requireCondition(!state.jobs.some(j=>j.status==='researching'&&j.owner===args.workerId),'Worker already owns active research');
    requireCondition(state.jobs.filter(j=>j.status==='researching').length<state.concurrency,'Research concurrency exhausted');
    job.status='researching';job.owner=args.workerId;job.claimedAt=now;job.attempt++;
  } else if (action === 'submit') {
    owner(); requireCondition(job.status==='researching','Job is not researching');
    requireCondition(args.package?.jobId===job.id && args.package.worker?.id===job.owner,'Package owner/job mismatch');
    requireCondition(args.package.productionFingerprint===job.productionFingerprint,'Stale production fingerprint');
    job.package=clone(args.package);job.packageHash=packageDigest(job.package);job.status='submitted';job.submittedAt=now;
  } else if (action === 'validate') {
    coordinator();requireCondition(job.status==='submitted','Job is not submitted');
    requireCondition(typeof options.validatePackage==='function'&&options.context,'Validator and context required');
    job.validation=options.validatePackage(clone(job.package),clone(job),options.context);
    requireCondition(['validation-failed','historical-review','accepted'].includes(job.validation.status),'Invalid validator status');
    requireCondition(!job.validation.packageHash || job.validation.packageHash===job.packageHash,'Validator package hash mismatch');
    job.status=job.validation.status==='accepted'?'validated':job.validation.status;
  } else if (action === 'accept') {
    coordinator();requireCondition(['validated','historical-review'].includes(job.status),'Job is not eligible for acceptance');
    requireCondition(args.productionFingerprint===job.productionFingerprint,'Stale acceptance fingerprint');
    requireCondition(job.packageHash===packageDigest(job.package),'Package changed after submission');
    requireCondition(job.validation?.valid===true,'Invalid package cannot be accepted');
    const unresolved=job.package.claims?.some(c=>c.reviewStatus!=='clear'||c.geographicScope?.relationship!=='same');
    requireCondition(!unresolved,'Required/unresolved claims or uncertain geography require an amended package and revalidation');
    requireCondition(typeof args.rationale==='string'&&args.rationale.trim(),'Explicit coordinator rationale required');
    if(job.status==='historical-review')requireCondition(args.reviewResolved===true,'Historical review must be explicitly resolved');
    requireCondition(Array.isArray(args.reviewedIssues)&&digest([...args.reviewedIssues].sort())===digest([...(job.validation.review||[])].sort()),'Receipt must explicitly bind every validation review issue');
    job.receipt={schemaVersion:1,status:'accepted',jobId:job.id,packageHash:job.packageHash,productionFingerprint:job.productionFingerprint,coordinator:clone(args.actor),rationale:args.rationale,reviewResolved:args.reviewResolved===true,reviewedIssues:clone(args.reviewedIssues),acceptedAt:now};job.status='accepted';
  } else if(action==='integrated') {
    coordinator();requireCondition(job.status==='accepted','Only accepted jobs can be integrated');
    const receipt=args.integrationReceipt;
    requireCondition(receipt?.applied===true&&receipt.jobId===job.id&&receipt.packageHash===job.receipt.packageHash&&receipt.beforeFingerprint===job.productionFingerprint,'Integration receipt mismatch');
    requireCondition(receipt.afterFingerprint&&receipt.afterFingerprint===options.productionFingerprint,'Integration requires verified current production fingerprint');
    requireCondition(typeof options.verifyIntegration==='function'&&options.verifyIntegration(receipt,job)===true,'Coordinator must verify durable completed integration');
    job.integrationReceipt=clone(receipt);job.status='integrated';
  } else if (action === 'reject') {
    coordinator();requireCondition(!['accepted','integrated'].includes(job.status),'Accepted job cannot be rejected');
    requireCondition(args.reason?.trim(),'Rejection reason required');job.status='rejected';job.rejection=args.reason;
  } else if (action === 'retry') {
    coordinator();requireCondition(['rejected','validation-failed','historical-review'].includes(job.status),'Job cannot be retried');
    requireCondition(args.reason?.trim(),'Retry reason required');job.status='queued';delete job.owner;delete job.package;delete job.packageHash;delete job.validation;delete job.receipt;
  } else if (action === 'recover') {
    coordinator();requireCondition(job.status==='researching','Only interrupted research can be recovered');
    requireCondition(args.interrupted===true && args.reason?.trim(),'Explicit interruption evidence required');
    job.status='queued';delete job.owner;
  } else throw new Error('Unknown queue action: '+action);
  job.history.push({action,at:now,actor:args.actor?.id||args.workerId||null,reason:args.reason||args.rationale||null});state.revision++;return state;
}
export function updateQueue(file, action, args, options = {}) {
  return withLock(file,()=>{const state=transitionQueue(readQueue(file),action,args,options);atomicWrite(file,state);return state;});
}
export function initializeQueue(file,jobs,options={}) { return withLock(file,()=>{requireCondition(!fs.existsSync(file),'Queue already exists');const state=createQueue(jobs,options);atomicWrite(file,state);return state;}); }
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const [command,file,argumentFile]=process.argv.slice(2);
  try {
    if(command==='status') console.log(JSON.stringify(readQueue(file),null,2));
    else if(command==='inspect-lock')console.log(JSON.stringify(inspectLock(file),null,2));
    else if(command==='recover-lock')console.log(JSON.stringify(recoverLock(file,JSON.parse(fs.readFileSync(argumentFile,'utf8'))),null,2));
    else if(command==='init'){const input=JSON.parse(fs.readFileSync(argumentFile,'utf8'));console.log(JSON.stringify(initializeQueue(file,Array.isArray(input)?input:input.jobs),null,2));}
    else throw new Error('CLI supports status/init; coordinator transitions require the API with explicit actor and validator context.');
  } catch(error) { console.error(error.message);process.exitCode=1; }
}
