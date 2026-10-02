"""Whole population Table 1 extraction, preserving OCR and footnotes for review.
No OCR-derived row is production-accepted by this extractor.
"""
import json,re
from pathlib import Path
import pdfplumber
B=Path('research/completion-03/un1945'); rows=[]
with pdfplumber.open(B/'cache/SYB1.pdf') as pdf:
 for n in range(19,29):
  p=pdf.pages[n]; ws=p.extract_words(); headers=[w for w in ws if w['text']=='Population' and w['top']<180 and w['x0']>250]
  if len(headers)!=1:continue
  popx=headers[0]['x0']; yearheaders=[w for w in ws if w['text']=='1937' and w['top']<180 and w['x0']>popx]
  if len(yearheaders)!=1:continue
  end=yearheaders[0]['x0']-10; dates=[w for w in ws if re.fullmatch('19[0-4][0-9]',w['text']) and 200<w['x0']<popx and w['top']>180]
  for d in dates:
   line=[w for w in ws if abs(w['top']-d['top'])<4];left=' '.join(w['text'] for w in line if w['x0']<220)
   date=' '.join(w['text'] for w in line if 220<=w['x0']<popx);pop=' '.join(w['text'] for w in line if popx<=w['x0']<end)
   rows.append({'pdfPage':n+1,'printedPage':n,'countryRowOCR':left,'dateOCR':date,'populationOCR':pop,'year':int(d['text']),'locatorY':d['top'],
    'disposition':'candidate-requires-source-and-scope-review','originalLineOCR':' '.join(w['text'] for w in line)})
(B/'census-candidates.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'censusRowsExtracted':len(rows),'prior1940to1945':sum(1940<=r['year']<=1945 for r in rows),'candidatesOnly':True}))
for r in rows:
 if 1940<=r['year']<=1945:print(r['pdfPage'],r['countryRowOCR'],r['dateOCR'],r['populationOCR'])
