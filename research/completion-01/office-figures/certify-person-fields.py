import json,hashlib,warnings
from pathlib import Path
import pandas as pd
from pypdf import PdfReader
base=Path('research/completion-01/office-figures')
read=lambda p:json.loads(Path(p).read_text(encoding='utf-8'))
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
tranche=read(base/'candidate-tranche.json')
original='research/bulk-01/cache/Archigos_4.1_stata14.dta'
core=read('research/bulk-01/archigos-review/parser-certification.json')
assert sha(original)==core['originalDtaSha256']
with warnings.catch_warnings(record=True) as caught:
 warnings.simplefilter('always')
 direct=pd.read_stata(original,convert_categoricals=False,convert_dates=False)
fields=['obsid','leadid','yrborn','yrdied','borndate','deathdate']
comparisons=0
mismatches=[]
bound_rows=[]
for row in tranche['candidates']+tranche['held']:
 if 'originalSourceRow' not in row:continue
 r=row['originalSourceRow']
 matches=direct[(direct.obsid==r['obsid'])&(direct.leadid==r['leadid'])]
 assert len(matches)==1
 independent=matches.iloc[0]
 values={}
 for field in fields:
  v=independent[field]
  if hasattr(v,'item'):v=v.item()
  values[field]=v
  comparisons+=1
  if v!=r[field]:mismatches.append({'obsid':r['obsid'],'field':field,'original':v,'extracted':r[field]})
 bound_rows.append(values)
pdf='research/bulk-01/cache/Archigos_4.1.pdf'
reader=PdfReader(pdf)
body=[{'pdfPage':i+1,'text':reader.pages[i].extract_text()} for i in range(12) if any(s in reader.pages[i].extract_text().lower() for s in ['yrborn','yrdied','borndate','deathdate','year of birth','date of birth'])]
(base/'source-metadata-body.json').write_text(json.dumps({'sourcePath':pdf,'sha256':sha(pdf),'pages':body},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
out={'originalDtaSha256':sha(original),'candidateTrancheSha256':sha(base/'candidate-tranche.json'),'newFocusedParserSha256':sha(__file__),'originalSixFieldCertificateReused':True,'priorCoreComparisonsNotRerun':20454,'checkedFields':fields,'rows':len(bound_rows),'focusedFieldComparisons':comparisons,'mismatches':mismatches,'literalDirectRows':bound_rows,'warnings':[str(w.message) for w in caught],'scope':'Focused direct original-DTA comparison of selected person/lifespan metadata only. Technical certification, not independent historical acceptance. Source spelling preserved; dates are source metadata, not nationality, accomplishments or place associations.','historicalAcceptance':False,'productionEdited':False}
(base/'person-field-certification.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'rows':len(bound_rows),'fieldComparisons':comparisons,'mismatches':len(mismatches)}))
assert not mismatches
