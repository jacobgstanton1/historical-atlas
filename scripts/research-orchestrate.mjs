// Model-independent coordinator adapter. Actor labels are protocol identities, not authentication.
import {readContext,readJSON,isCLI} from './research-common.mjs';
import {initializeQueue,updateQueue,readQueue} from './research-queue.mjs';
import {validatePackage} from './research-validator.mjs';
export function runAction(command,queueFile,jobId,argument,options={}) {
  const context=options.context||readContext(), actor=options.actor||{id:'atlas-coordinator',role:'coordinator'};
  if(command==='status')return readQueue(queueFile);
  if(command==='init'){const input=readJSON(argument||jobId);return initializeQueue(queueFile,input.jobs,{concurrency:input.concurrency||3});}
  const args={jobId,actor};
  if(command==='claim')args.workerId=argument;
  else if(command==='submit'){args.package=readJSON(argument);args.workerId=args.package.worker.id;}
  else if(['accept','reject','retry','recover','integrated'].includes(command))Object.assign(args,readJSON(argument),{jobId,actor,productionFingerprint:context.productionFingerprint});
  else if(command!=='validate')throw Error('Unknown action '+command);
  return updateQueue(queueFile,command,args,{...options,context,validatePackage});
}
if(isCLI(import.meta.url)) {
  try {const [command,queue,job,argument]=process.argv.slice(2);const result=runAction(command,queue,job,argument);console.log(JSON.stringify(result,null,2));}
  catch(error){console.error(error.message);process.exitCode=1;}
}
