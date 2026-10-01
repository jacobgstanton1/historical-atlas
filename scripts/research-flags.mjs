import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {root,dateRange,periodBounds} from './research-common.mjs';
export const flagTypes=['national flag','state flag','civil flag','state ensign','civil ensign','colonial ensign','royal standard','imperial standard','administrative flag','office standard','state symbol'];
export const assetHash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
export function inspectFlagAsset(asset,directory=root,expectedHash){
  const errors=[];
  if(typeof asset!=='string'||!/^\.\/assets\/flags\/[a-zA-Z0-9_-]+\.svg$/.test(asset))return ['Flag asset must be a local assets/flags SVG without traversal'];
  try{
    const file=path.resolve(directory,asset),real=fs.realpathSync(file),base=fs.realpathSync(path.join(directory,'assets/flags'));
    if(!real.startsWith(base+path.sep))return ['Flag asset escapes asset directory'];
    const bytes=fs.readFileSync(real),text=bytes.toString('utf8');
    if(!bytes.length||bytes.length>1024*1024)errors.push('Flag SVG empty or larger than 1 MiB');
    if(!/<svg(?:\s|>)/i.test(text)||!/<\/svg>\s*$/.test(text))errors.push('Flag asset is not a complete SVG');
    if(/<!DOCTYPE|<!ENTITY|<\s*(?:script|foreignObject|iframe|image)\b|\bon\w+\s*=|src\s*=|@import|javascript:/i.test(text))errors.push('Flag SVG contains executable, embedded or external-resource content');
    const ids=new Set([...text.matchAll(/\bid\s*=\s*["']([a-zA-Z0-9_-]+)["']/g)].map(m=>m[1]));
    for(const ref of text.matchAll(/url\s*\(\s*["']?([^\s)"']+)["']?\s*\)/gi))if(!/^#[a-zA-Z0-9_-]+$/.test(ref[1])||!ids.has(ref[1].slice(1)))errors.push('Flag SVG contains nonlocal or unresolved resource reference');
    for(const ref of text.matchAll(/(?:href)\s*=\s*["'](#[a-zA-Z0-9_-]+)["']/gi))if(!ids.has(ref[1].slice(1)))errors.push('Flag SVG contains unresolved fragment reference');
    if(/(?:href)\s*=\s*["'](?!#[a-zA-Z0-9_-]+["'])/i.test(text))errors.push('Flag SVG contains nonlocal references');
    if(expectedHash&&assetHash(bytes)!==expectedHash)errors.push('Flag asset SHA-256 mismatch');
  }catch{errors.push('Flag asset missing or unreadable');}
  return errors;
}
const licensed=x=>typeof x==='string'&&/^(?:Public domain(?: \([^\r\n]+\))?|CC0(?: 1\.0)?|CC BY(?:-SA)? (?:3\.0|4\.0))$/.test(x);
export function validateFlagClaim(claim,sourceMap,directory=root){
  const errors=[],f=claim.flag;
  if(!f)return ['Historical flag requires explicit asset/type/license/provenance'];
  if(claim.temporal?.kind!=='interval')errors.push('Historical flag requires dated validity interval');
  if(!flagTypes.includes(f.type))errors.push('Unsupported historical flag/symbol type');
  if(!licensed(f.license))errors.push('Flag asset license is missing or unsupported');
  if(!f.alt?.trim()||!f.attribution?.trim())errors.push('Flag asset alt/attribution required');
  if(!/^[a-f0-9]{64}$/.test(f.sha256||''))errors.push('Flag asset SHA-256 required');
  if(f.license?.startsWith('CC')&&!/^https:\/\/creativecommons\.org\/(?:licenses\/(?:by|by-sa)\/(?:3\.0|4\.0)|publicdomain\/zero\/1\.0)\/$/.test(f.licenseUrl||''))errors.push('Creative Commons flag requires canonical license URL');
  if(!f.assetSourceIds?.length)errors.push('Flag asset provenance source required');
  for(const id of f.assetSourceIds||[]){
    const s=sourceMap.get(id);
    if(!claim.sourceIds?.includes(id)||!s)errors.push('Flag asset source must resolve and be linked to claim: '+id);
    else if(s.license!==f.license||s.attribution!==f.attribution||!/^https:\/\//.test(s.assetUrl||''))errors.push('Flag asset source license/attribution/download provenance mismatch: '+id);
  }
  errors.push(...inspectFlagAsset(f.asset,directory,f.sha256));return errors;
}
export function auditResearchFlags(context){
  const errors=[],sources=new Map(context.registry.sources.map(s=>[s.id,s]));let checked=0;
  for(const e of context.db.entities)for(const f of e.flags||[])if(f.researchProvenance){
    checked++;const c={sourceIds:f.sourceIds,temporal:{kind:'interval',from:f.validFrom,until:f.validUntil},flag:{asset:f.asset,type:f.flagType,alt:f.alt,license:f.license,licenseUrl:f.licenseUrl,attribution:f.attribution,assetSourceIds:f.assetSourceIds,sha256:f.assetSha256}};
    const found=validateFlagClaim(c,sources,context.directory);
    try{if(!f.validFrom||!f.validUntil||periodBounds(f)[0]>=periodBounds(f)[1])found.push('Invalid historical flag interval');}catch{found.push('Invalid historical flag date');}
    for(const error of found)errors.push(e.id+': '+error);
  }
  return {checked,errors,valid:errors.length===0};
}
