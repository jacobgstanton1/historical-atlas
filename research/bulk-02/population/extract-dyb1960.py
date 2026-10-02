"""Source-first1960 column, with original typography and scope held for review."""
from pathlib import Path
import pdfplumber,json,hashlib,re
B=Path('research/bulk-02/population'); C=B/'cache'; P=C/'un-dyb1960.pdf'
sha=hashlib.sha256(P.read_bytes()).hexdigest(); assert sha=='8187292a0f6d67b45dc4a7430f3717722e4834f6abe825ba768bc323a98d0fbe'
pdf=pdfplumber.open(P)
source={'id':'un-demographic-yearbook1960-table4','url':'https://unstats.un.org/unsd/demographic-social/products/dyb/dybsets/1960%20DYB.pdf','title':'Demographic Yearbook1960, Table4: Estimates of midyear population1920–1960','institution':'Statistical Office of the United Nations, Department of Economic and Social Affairs','kind':'official-statistical-yearbook','editionYear':1960,'copyrightPublicationYear':1961,'sha256':sha,'cachePath':str(P),'table':'4','definitionLocator':'Printed30/PDF47; table opening printed124/PDF141','scopeDefinition':'Unless otherwise indicated, modified present-in-area population within present geographic boundaries. Current in this contemporary1960 edition, not modern2026 borders. Retrospective columns not acquired.'}
records=[];pageproof=[]
for pi in [144,148,152,156,160,164,168]:
 p=pdf.pages[pi];words=p.extract_words(); chars=p.chars
 year=next(w for w in words if w['text']=='1960' and 100<w['top']<200)
 prev=next(w for w in words if w['text']=='1959' and abs(w['top']-year['top'])<3)
 lo=(prev['x1']+year['x0'])/2; hi=year['x1']+10
 # First English explanatory footnote below the table: left of the first numeric column.
 notes=[w['top'] for w in words if w['x0']<100 and w['top']>350 and re.search('[A-Za-z]',w['text'])]
 bottom=min(notes) if notes else 730
 # French literal country labels are anchors; no modern alias or political mapping is inferred.
 labels=[w for w in words if w['x0']>hi and year['top']+20<w['top']<bottom-4]
 groups=[]
 for w in sorted(labels,key=lambda w:(w['top'],w['x0'])):
  mid=(w['top']+w['bottom'])/2
  g=next((g for g in groups if abs(g['y']-mid)<3),None)
  if g is None:g={'y':mid,'words':[]};groups.append(g)
  g['words'].append(w)
 pageproof.append({'pdfPageIndex':pi,'printedPage':pi-17,'yearHeader':{k:year[k] for k in ['text','x0','x1','top']},'previousYearHeader':{k:prev[k] for k in ['text','x0','x1','top']},'columnBounds':[lo,hi],'tableBottom':bottom,'renderPath':str(C/f'table4-page-{pi}.png')})
 for n,g in enumerate(sorted(groups,key=lambda g:g['y'])):
  label=' '.join(w['text'] for w in sorted(g['words'],key=lambda w:w['x0']))
  # Section headings have no1960 data; retain actual statistical rows only.
  gs=sorted([c for c in chars if lo<=(c['x0']+c['x1'])/2<hi and abs((c['top']+c['bottom'])/2-g['y'])<3],key=lambda c:c['x0'])
  if not gs:continue
  raw=''.join(c['text'] for c in gs); fonts=sorted(set(c['fontname'] for c in gs)); issues=[]
  bold=any('Bold' in f for f in fonts); italic=any('Italic' in f for f in fonts)
  provisional='*' in raw; number=raw.replace(' ','').replace('*','')
  # Only well-formed literal digits, including thousands grouping, are numeric candidates.
  digitgs=[c for c in gs if c['text'].isdigit()]
  raised=bool(digitgs) and (max(c['top'] for c in digitgs)-min(c['top'] for c in digitgs)>.65 or max(c['height'] for c in digitgs)-min(c['height'] for c in digitgs)>.65)
  value=int(number)*1000 if re.fullmatch(r'\d+',number) and not raised else None
  if raised:issues.append('Raised/size-different numerical annotation may be a footnote, not population digits; literal raw value held without prefix invention.')
  if value is None:issues.append('Missing or ambiguous1960 numeric glyphs; no character/decimal repair.')
  if bold:issues.append('Bold census replacement: exact enumeration date must be resolved from Table6 before production; not automatically1July.')
  if italic:issues.append('Original italic type identifies estimate of questionable reliability; historical review required.')
  if any(f not in ['Times-Roman','Times-Italic','Times-Bold','Helvetica','Helvetica-Bold'] for f in fonts):issues.append('Original text-layer typography/glyph encoding requires facsimile verification.')
  issues.append('OCR font encoding does not reliably preserve printed bold census type; facsimile must decide estimate versus census and exact observation date.')
  issues.append('Country/territory and all numbered scope/date footnotes require independent historical mapping review.')
  records.append({'id':f'un-dyb1960-t4-p{pi}-r{n+1}','category':'population','rawTerritoryLabel':label,'value':value,'rawValue':raw,'printedUnit':'thousands of persons','normalizedUnit':'persons','normalization':'Literal printed integer ×1000; published rounded precision retained, not an exact headcount.','observationDate':'1960','observationPrecision':'year','observationType':'census-replacement' if bold else 'estimate','dateQualification':'1960 column. Source default midyear1July or arithmetic mean of consecutive endyear estimates; exceptions and census dates must be reviewed before increasing precision.','scopeClassification':'UNCERTAIN_SCOPE','territorialScope':'Literal statistical territory '+label+'; source general rule contemporary present-in-area geography, subject to row footnotes. No map-polygon equivalence inferred.','provisional':provisional,'questionableReliability':italic,'censusTypography':bold,'sourceId':source['id'],'sourceBodyHash':sha,'locator':f'Table4/printed{pi-17}/PDF{pi}/1960column/'+label,'pdfPageIndex':pi,'anchorY':g['y'],'glyphs':[{'text':c['text'],'font':c['fontname'],'x0':round(c['x0'],3),'top':round(c['top'],3),'height':round(c['height'],3)} for c in gs],'reviewIssues':issues,'status':'historical-review'})
for r in records:
 r['censusFontDetected']=r.pop('censusTypography')
 r['censusTypography']=True if r['censusFontDetected'] else None
 r['observationType']='census-replacement' if r['censusFontDetected'] else 'estimate-or-census-replacement-pending-facsimile'
 r['candidateValue']=r.pop('value')
 r['value']=None
 r['reviewIssues'].append('Raw OCR numeric candidate is diagnostic only; value withheld pending original-cell transcription verification.')
out={'schemaVersion':1,'source':source,'acquisitionMethod':'Fixed contemporary1960-column bounds from literal1959/1960 headers; original French row labels and glyph coordinates; no historical entity matching yet.','pageProof':pageproof,'records':records,'metrics':{'records':len(records),'numericDiagnosticCandidates':sum(r['candidateValue'] is not None for r in records),'censusFontDetected':sum(r['censusFontDetected'] for r in records),'questionableReliability':sum(r['questionableReliability'] for r in records),'provisional':sum(r['provisional'] for r in records)},'scopeClasses':['HISTORICALLY_MATCHING_SCOPE','APPROXIMATELY_COMPARABLE_SCOPE','MODERN_BORDER_ESTIMATE','INCOMPATIBLE_SCOPE','UNCERTAIN_SCOPE'],'productionEdited':False}
assert all(r['observationDate']=='1960' and r['scopeClassification']=='UNCERTAIN_SCOPE' for r in records)
assert len({r['id'] for r in records})==len(records)
fr=next(r for r in records if r['rawTerritoryLabel'].startswith('France'))
assert fr['candidateValue']==45540000 and fr['provisional'] and fr['value'] is None
(B/'dyb1960-population-extracted.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
(B/'extraction-validation.json').write_text(json.dumps({'passed':['Exact original PDF hash','Seven1960 column header spans','Only1960 observations','Unique stable IDs','Published thousands retained and mechanically normalized','France45540thousand provisional aligns original','Scope held before mapping','Census/italic/provisional typography retained','No production edits'],'metrics':out['metrics']},indent=2)+'\n',encoding='utf8')
print(json.dumps(out['metrics']))
