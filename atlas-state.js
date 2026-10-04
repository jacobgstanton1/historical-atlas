import {MIN_YEAR,MAX_YEAR} from './snapshots.js';
// URL state is presentation/navigation only; it never resolves historical identities.
export function readAtlasState(href,{defaultYear=1938,minYear=MIN_YEAR,maxYear=MAX_YEAR}={}) {
  const url=new URL(href),value=url.searchParams.get('year');
  const year=/^-?\d{1,4}$/.test(value||'')&&Number(value)>=minYear&&Number(value)<=maxYear?Number(value):defaultYear;
  const raw=url.searchParams.get('territory');
  return {year,territory:/^entity-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(raw||'')&&raw.length<=180?raw:null};
}
export function atlasUrl(href,{year,territory}) {
  const url=new URL(href);url.searchParams.set('year',String(year));
  if(url.hash.startsWith('#dossier-source-'))url.hash='';
  url.searchParams.delete('territory');if(territory)url.searchParams.set('territory',territory);
  return url.href;
}
export function createAtlasHistory(browser,onRestore) {
  let transient=false,lastState=readAtlasState(browser.location.href);
  browser.addEventListener('popstate',()=>{
    transient=false;const next=readAtlasState(browser.location.href);
    const changed=next.year!==lastState.year||next.territory!==lastState.territory;
    lastState=next;if(changed)onRestore(next);
  });
  return {
    navigate(state,mode='push') {
      if(mode==='none')return;
      const next=atlasUrl(browser.location.href,state);
      lastState={...state};
      if(next===browser.location.href){if(mode!=='transient')transient=false;return;}
      const method=mode==='replace'||mode==='commit'&&transient||mode==='transient'&&transient?'replaceState':'pushState';
      if(mode==='transient')transient=true;else transient=false;
      if(next!==browser.location.href)browser.history[method](browser.history.state,'',next);
    },
  };
}
