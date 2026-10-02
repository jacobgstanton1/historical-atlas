"""Literal Table 4 column extraction, all source rows. No production approval."""
from pathlib import Path
import json,hashlib
import pdfplumber
B=Path('research/completion-03/un-followup'); P=Path('research/bulk-02/population/cache/un-dyb1960.pdf')
ex=json.loads(Path('research/bulk-02/population/dyb1960-population-extracted.json').read_text(encoding='utf8')); out=[]
source_hash=hashlib.sha256(P.read_bytes()).hexdigest()
with pdfplumber.open(P) as pdf:
 for pi in sorted(set(r['pdfPageIndex'] for r in ex['records'])):
  page=pdf.pages[pi]; words=page.extract_words(); chars_page=page.chars; headers={int(w['text']):w for w in words if w['text'] in [str(y) for y in range(1951,1961)] and 100<w['top']<200}
  if set(headers)!=set(range(1951,1961)):raise ValueError('Column headings incomplete')
  for r in [r for r in ex['records'] if r['pdfPageIndex']==pi]:
   row_chars=[c for c in chars_page if abs((c['top']+c['bottom'])/2-r['anchorY'])<3]
   for year in range(1955,1961):
    h=headers[year]; lo=(headers[year-1]['x1']+h['x0'])/2; hi=(h['x1']+headers[year+1]['x0'])/2 if year<1960 else h['x1']+10
    chars=sorted([c for c in row_chars if lo<=(c['x0']+c['x1'])/2<hi],key=lambda c:c['x0'])
    out.append({'originalExtractionId':r['id'],'label':r['rawTerritoryLabel'],'pdfPageIndex':pi,'anchorY':r['anchorY'],'year':year,'rawValue':''.join(c['text'] for c in chars),'glyphs':[{'text':c['text'],'font':c['fontname'],'top':round(c['top'],3),'height':round(c['height'],3)} for c in chars],'decision':'unreviewed-candidate','sourcePDFSHA256':source_hash})
(B/'nearby1960-source-rows.json').write_bytes((json.dumps(out,ensure_ascii=False,indent=2)+'\n').encode('utf8'))
print(json.dumps({'sourceRows':len(ex['records']),'datedCells':len(out)}))
for r in out:
 if r['label'] in ['Albanie','Autriche92','BelgiqueI','Danemark97','Uruguay'] and r['year']>=1958:print(r['label'],r['year'],r['rawValue'],sorted(set(g['font'] for g in r['glyphs'])))
