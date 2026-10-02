from html.parser import HTMLParser
from pathlib import Path
import re,json,hashlib
BASE=Path(__file__).parent
class Text(HTMLParser):
 def __init__(self):super().__init__();self.out=[];self.ignore=0
 def handle_starttag(self,t,a):
  if t in ('script','style'):self.ignore+=1
  if not self.ignore and t in ('br','p','tr','td','div'):self.out.append('\n')
 def handle_endtag(self,t):
  if t in ('script','style'):self.ignore-=1
  if not self.ignore and t in ('p','td','tr','div'):self.out.append('\n')
 def handle_data(self,d):
  if not self.ignore:self.out.append(d)
raw=(BASE/'cache/tagore-bengali-bibliography.html').read_bytes()
p=Text();p.feed(raw.decode('utf-8'));body=''.join(p.out)
body=body[body.index('Kavi-Kahini'):];body=body[:body.index('VB-Videos')]
lines=[re.sub(r'\s+',' ',x).strip() for x in body.splitlines() if x.strip()]
rows=[];held=[]
for n,line in enumerate(lines):
 m=re.match(r'^([^()]+?)[,.]\s*(\d{4})[.,]\s*(.*)$',line)
 if m:
  title,year,genre=m.groups();status='dated-bibliographic-candidate'
  if re.match(r'Variorum|Enlarged|Second Edition',title,re.I):status='held-reprint-or-edition'
  if int(year)>1941:status='held-posthumous-not-living-activity'
  rows.append({'id':f'tagore-bibliography-line-{n+1}','lineNumber':n+1,'raw':line,'title':title.strip(),'year':int(year),'genre':genre,'status':status})
 elif re.search(r'\d{4}|[Il]\d{3}',line):held.append({'lineNumber':n+1,'raw':line,'status':'held-unparsed-or-qualified-date'})
result={'schemaVersion':1,'sourceURL':'https://www.visvabharati.ac.in/Bengali.html','sourceSha256':hashlib.sha256(raw).hexdigest(),'method':'Full original institutional bibliography; literal standalone title/year rows. Qualified dates, reprints, posthumous and multi-part dates are held, never silently corrected.','rows':rows,'heldLines':held,'originalLines':lines,'productionEdited':False}
(BASE/'cache/tagore-bibliography.txt').write_text('\n'.join(lines)+'\n',encoding='utf-8')
(BASE/'evidence').mkdir(exist_ok=True)
(BASE/'evidence/tagore-bibliography-extracted.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'rows':len(rows),'heldLines':len(held),'sourceSha256':result['sourceSha256']}))
