from pathlib import Path
import zipfile,csv,io,json,hashlib,decimal,logging
logging.getLogger('pypdf').setLevel(logging.ERROR)
from pypdf import PdfReader
b=Path('research/completion-01/nmc'); intake=json.loads((b/'population-candidate-tranche.json').read_text())
archive=b/'cache/extracted/NMCv7/NMC-v7-supplemental.zip'; raw=zipfile.ZipFile(archive).read('NMC-70-wsupplementary.csv'); lines=raw.splitlines(keepends=True)
reader=csv.DictReader(io.StringIO(raw.decode('latin1'),newline='')); prior=1; lookup={}
for ordinal,row in enumerate(reader,2):
 end=reader.line_num; body=b''.join(lines[prior:end]);prior=end
 lookup[(row['ccode'],row['year'])]=(ordinal,row,hashlib.sha256(body).hexdigest())
checks=[]
for p in intake['proposed']:
 ordinal,row,rowsha=lookup[(p['rawStateCode'],p['observationDate'])]
 assert row==p['originalRow'] and rowsha==p['originalRecordBytesSha256']
 assert decimal.Decimal(row['tpop'])*1000==decimal.Decimal(p['value'])
 assert row['tpopsource']==p['sourceBibliographyLiteral'] and row['tpopnote']==p['sourceScopeMethodNoteLiteral']
 assert row['tpopqualitycode']==p['qualityCode'] and row['tpopanomalycode']==p['anomalyCode']
 checks.append(dict(id=p['id'],logicalRow=ordinal,originalRecordBytesSha256=rowsha,fullOriginalSupplementalRowVerified=True,valueUnitDateSourceNoteQualityVerified=True))
pdf=PdfReader(b/'cache/extracted/NMCv7/NMC_Documentation_v7.pdf')
defs=[dict(pdfPageIndex=i,printedPage=i-3,text=pdf.pages[i].extract_text()) for i in [7,34,35,36,37,38]]
out=dict(reviewer='officeholder_sources',inputFileSha256=hashlib.sha256((b/'population-candidate-tranche.json').read_bytes()).hexdigest(),supplementaryMemberSha256=hashlib.sha256(raw).hexdigest(),checks=checks,codebookOriginalPdfExtracts=defs)
(b/'independent-source-check.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('Independent original supplemental row checks:',len(checks))
