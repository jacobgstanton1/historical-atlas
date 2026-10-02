// Publish candidate identity/date fields only, not underlying COW casualty estimates.
import {readJSON,saveJSON} from './research-common.mjs';
const p='research/completion-03/hcd/yield.json',r=readJSON(p);
for(const group of [r.held,r.singleYearCandidates])for(const x of group){const w=x.war;x.war=Object.fromEntries(['isd_code','isd_country','cow_character','war_name','war_type','min_year','max_year','external_participant_intra_state'].map(k=>[k,w[k]]));}
saveJSON(p,r);
