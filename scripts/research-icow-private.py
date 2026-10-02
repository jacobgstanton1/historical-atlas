"""ICOW research-only source-wide parser. All source rows stay outside Git."""
import json,re,os,hashlib,urllib.request
from pathlib import Path
from html.parser import HTMLParser
PRIVATE=Path(os.environ['TEMP'])/'historical-atlas-icow-20261002'
PRIVATE.mkdir(exist_ok=True)
URL='https://www.paulhensel.org/icownames.html'
class Table(HTMLParser):
 def __init__(self):super().__init__();self.rows=[];self.row=None;self.cell=None
 def handle_starttag(self,t,a):
  if t=='tr':self.row=[]
  if t in ['td','th']:self.cell=[]
  if t=='br' and self.cell is not None:self.cell.append('; ')
 def handle_data(self,s):
  if self.cell is not None:self.cell.append(s)
 def handle_endtag(self,t):
  if t in ['td','th'] and self.cell is not None:
   if self.row is not None:self.row.append(re.sub(r'\s+',' ',''.join(self.cell)).strip())
   self.cell=None
  if t=='tr' and self.row is not None:self.rows.append(self.row);self.row=None
def norm(s):return re.sub(r'[^a-z0-9]','',s.lower())
def parse():
 p=PRIVATE/'icownames.html'
 if not p.exists():
  with urllib.request.urlopen(urllib.request.Request(URL,headers={'User-Agent':'HistoricalAtlas research-only source parser'}),timeout=60) as r:p.write_bytes(r.read())
 h=Table();h.feed(p.read_text(encoding='utf8',errors='strict'))
 rows=[dict(code=int(r[0]),name=r[1],aliases=r[2],colonialRuler=r[3],capitals=r[4]) for r in h.rows if len(r)>=6 and r[0].isdigit()]
 if len(rows)<150:raise ValueError('Incomplete ICOW source table')
 db=json.loads(Path('data/historical-entities.json').read_text(encoding='utf8')); matrix=json.loads(Path('research/completion-01/reports/completion.json').read_text(encoding='utf8'))
 matches=[]
 for e in db['entities']:
  names=[n['value'].split(' — ')[0] for n in e['names']]+[a if isinstance(a,str) else a.get('value','') for a in e.get('aliases',[])]
  hits=[]
  for r in rows:
   primary=norm(r['name']); alias=[norm(s) for s in re.split(r'[;/]',r['aliases']) if '(' not in s and ')' not in s]
   if any(norm(n)==primary for n in names):hits.append((r,'EXACT-NAME-CANDIDATE'))
   elif any(norm(n) in alias for n in names):hits.append((r,'ALIAS-REVIEW'))
  for r,confidence in hits:
   slots=[s for s in matrix['rows'] if s['entityId']==e['id']]
   dates=[{'text':m.group(0),'years':re.findall(r'\b(?:1[789]|20)\d{2}\b',m.group(0))} for m in re.finditer(r'\([^)]*\)',r['capitals']) if re.search(r'\b(?:1[789]|20)\d{2}\b',m.group(0))]
   matches.append({'entityId':e['id'],'confidence':confidence if len(hits)==1 else 'AMBIGUOUS','source':r,'datedClauses':dates,'slots':[{'year':s['snapshotYear'],'status':s['categories']['capital']['status']} for s in slots]})
 private={'sourceURL':URL,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'version':'1.31','rows':rows,'matches':matches,'policy':'ICOW candidate/reconciliation use only. No public dataset redistribution. Undated current capital is not a historical interval. Related names and colonial rulers are not identity/succession evidence.'}
 (PRIVATE/'parsed.json').write_bytes((json.dumps(private,ensure_ascii=False,indent=2)+'\n').encode('utf8'))
 summary={'version':'1.31','sourceURL':URL,'sourceSHA256':private['sha256'],'privateCache':str(PRIVATE),'sourceRows':len(rows),'capitalStatements':sum(bool(r['capitals']) for r in rows),'rowsWithDatedCapitalClauses':sum(bool(re.search(r'\b(?:1[789]|20)\d{2}\b',r['capitals'])) for r in rows),'exactNameCandidateEntities':len(set(m['entityId'] for m in matches if m['confidence']=='EXACT-NAME-CANDIDATE')),'aliasReviewEntities':len(set(m['entityId'] for m in matches if m['confidence']!='EXACT-NAME-CANDIDATE')),'matchedRepresentedSlots':sum(len(m['slots']) for m in matches),'matchedMissingSlots':sum(s['status']!='supported' for m in matches for s in m['slots']),'matchedSupportedSlots':sum(s['status']=='supported' for m in matches for s in m['slots']),'datedClauseCandidateSlots':sum(s['status']!='supported' for m in matches if m['datedClauses'] for s in m['slots']),'safeProductionSlotsBeforeCorroboration':0,'rights':'Source and complete parsed table remain outside the public repository. Public output is aggregate yields only; accepted facts must come from open corroboration.'}
 out=Path('research/completion-03/capitals');out.mkdir(exist_ok=True)
 (out/'icow-yield.json').write_bytes((json.dumps(summary,ensure_ascii=False,indent=2)+'\n').encode('utf8'))
 print(json.dumps(summary))
if __name__=='__main__':parse()
