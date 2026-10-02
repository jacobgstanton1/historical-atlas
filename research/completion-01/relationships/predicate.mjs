// Semantic classification of already accepted literal status facts; no relationship targets generated.
export function relationshipStatusPredicate(value){
 if(typeof value!=='string'||!value.trim())return{eligible:false,reason:'Empty/nontext accepted value'};
 if(/^United kingdom under a shared Crown and Parliament$/i.test(value))return{eligible:false,reason:'Internal shared institutions do not name an external relationship counterpart'};
 if(/^Occupied former Italian colonial territory$/i.test(value))return{eligible:false,reason:'Former affiliation names no current occupying counterpart'};
 if(/^Federal republic after termination of the Occupation Statute/i.test(value))return{eligible:false,reason:'Post-occupation reserved-rights framework requires dedicated category review'};
 if(/^independent\b/i.test(value)&&/\b(former|formerly|before|from)\b/i.test(value))return{eligible:false,reason:'Former/future affiliation cannot automatically establish current relationship coverage'};
 if(/\bbefore\s+(?:(?:a|the|personal|dynastic)\s+)*union\b/i.test(value))return{eligible:false,reason:'Only prior-to/future union description'};
 if(/\bbefore\s+(?:the\s+)?(?:British|French|German|Italian|Dutch|Portuguese|Spanish)\s+(?:protectorate|occupation|colonial|annexation)/i.test(value))return{eligible:false,reason:'Only prior-to/future relationship description'};
 const structure=/\b(?:colon(?:y|ial)|protectorate|protect(?:ion|ed)|depend(?:ency|ent)|occupation|occupied|possession|administration|administered|annex(?:ed|ation)|mandate|mandated|trust territory|personal union|union with|suzerainty|tribut(?:ary|e)|condominium|federation|Crown|Confederation|military presence)\b/i;
 const actor=/\b(?:British|Britain|Great Britain|United Kingdom|French|France|Portuguese|Portugal|Spanish|Spain|German|Germany|Dutch|Netherlands|Belgian|Belgium|Italian|Italy|Danish|Denmark|Swedish|Sweden|Norwegian|Norway|Russian|Russia|Soviet|Japanese|Japan|Chinese|China|Ottoman|Omani|Oman|Egyptian|Egypt|Austrian|Austria|Austro-Hungarian|Austria-Hungary|Habsburg|Allied|United States|US|American|Australian|Australia|New Zealand|East India Company|Pyrmont|Cape Colony|Union of South Africa|League of Nations|UN|French Equatorial Africa|German Confederation|Federation of Rhodesia and Nyasaland)\b/i;
 const relation=structure.exec(value),party=actor.exec(value);
 if(!relation)return{eligible:false,reason:'No explicit external affiliation structure in literal value'};
 if(!party)return{eligible:false,reason:'Unnamed counterpart; no entity-name/metropole inference allowed'};
 return{eligible:true,relationMarker:relation[0],literalPartyMarker:party[0],reason:'Already sourced literal value explicitly contains relationship structure and named party/group. Copy exactly; no target identity or new historical assertion inferred.'};
}
