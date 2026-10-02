from pathlib import Path
import csv,io,json,hashlib,logging,re
logging.getLogger('pypdf').setLevel(logging.ERROR)
from pypdf import PdfReader
b=Path('research/completion-01/territorial-events'); intake=json.loads((b/'candidate-tranche.json').read_text());raw=(b/'cache/extracted/tc2018.csv').read_bytes(); rows=list(csv.DictReader(io.StringIO(raw.decode('ascii'),newline='')));lines=raw.splitlines(keepends=True)
extracted=json.loads((b/'raw-extraction.json').read_text());assert rows==extracted['rows'] and len(rows)==842
checks=[]
for e in intake['events']:
 r=rows[e['sourceRowIndex']]; assert r==e['rawRow'] and r['number']==e['sourceChangeNumber'] and r[e['side']]==e['sourceParticipantCode']
 month=r['month'];date=r['year']+('-'+month.zfill(2) if month.isdigit() and 1<=int(month)<=12 else '')
 assert date==e['eventDate'] and ('month' if len(date)>4 else 'year')==e['eventPrecision']
 assert e['sourceCSVLine']==e['sourceRowIndex']+2
 checks.append(dict(eventId=e['id'],sourceRowIndex=e['sourceRowIndex'],fullOriginalRowVerified=True,originalRowBytesSha256=hashlib.sha256(lines[e['sourceRowIndex']+1]).hexdigest(),datePrecisionVerified=True,sideCodeVerified=True))
catalogue=PdfReader(b/'cache/extracted/Entities.pdf');cap=[]
for i,page in enumerate(catalogue.pages):
 text=page.extract_text()
 if re.search(r'\b540\b',text) or ('Saar' in text) or ('Tokelau' in text):cap.append(dict(pdfPageIndex=i,text=text))
manual=PdfReader(b/'cache/extracted/tcmanual.pdf');defs=[dict(pdfPageIndex=i,text=manual.pages[i].extract_text()) for i in [0,1,2,3,5,6,7]]
wp=Path('research/bulk-02/events/cache/Inter-StateWarData_v4.0.csv'); wars=list(csv.DictReader(io.StringIO(wp.read_bytes().decode('latin1'),newline='')));codes={e['sourceParticipantCode'] for e in intake['events']}; bridges={c:sorted({r['StateName'] for r in wars if r['ccode']==c}) for c in sorted(codes)}
out=dict(inputFileSha256=hashlib.sha256((b/'candidate-tranche.json').read_bytes()).hexdigest(),csvSha256=hashlib.sha256(raw).hexdigest(),checks=checks,manualOriginalPdfExtracts=defs,catalogueOriginalPdfExtracts=cap,priorIndependentlyReviewedCOWNamespaceSourcePath=str(wp),priorCowNamespaceOnlyLabels=bridges)
(b/'independent-source-check.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf8');print('All842 original rows and27 selected literal dates/participant sides verified.')
