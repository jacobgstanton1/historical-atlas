"""Offline, bounded coordinate extraction of the original printed450 table."""
from pathlib import Path
import json,hashlib,re
import pdfplumber
BASE=Path('research/bulk-01/worker-currency');BASE.mkdir(parents=True,exist_ok=True)
PDF=Path('research/bulk-01/next-sources/frb_071930.pdf')
HASH=hashlib.sha256(PDF.read_bytes()).hexdigest()
assert HASH=='d1069ccedd71d113e28a5efff3372f5caffa17228bbc17e2d90bf6b2d4ae733d'
source_rows=json.loads(Path('research/bulk-01/next-sources/currency-table-source-transcription.json').read_text())['rows']
page=pdfplumber.open(PDF).pages[59]
words=page.extract_words();chars=page.chars
assert page.width==522 and page.height==756
source={'id':'bulk-frb-july1930-exchange-table','url':'https://fraser.stlouisfed.org/files/docs/publications/FRB/1930s/frb_071930.pdf','title':'Federal Reserve Bulletin July1930, Foreign Exchange Rates','institution':'Federal Reserve Board / FRASER Federal Reserve Bank of St.Louis','publicationDate':'1930-07','cachePath':str(PDF),'sha256':HASH,'pdfPageIndex':59,'printedPage':450,'renderedPagePath':'research/bulk-01/next-sources/frb-1930-p450.png','kind':'contemporary-official-statistical-table'}
def token_norm(s):return re.sub(r'[^a-z]','',s.lower())
used=set();rows=[];observations=[];held=[]
closing_notes={'Bolivia','Ecuador','Venezuela','Japan','Java','Russia','Peru'}
for item in source_rows:
 right=item['region'] in ['SouthAmerica','Asia','Africa']
 xcountry=(264,321) if right else (40,96)
 anchor=next((w for w in words if xcountry[0]<=w['x0']<xcountry[1] and 149<w['top']<342 and token_norm(w['text'])==token_norm(item['rawCountry'].split()[0]) and (round(w['x0'],2),round(w['top'],2)) not in used),None)
 assert anchor is not None,(item['rawCountry'],item['region'])
 used.add((round(anchor['x0'],2),round(anchor['top'],2)))
 center=(anchor['top']+anchor['bottom'])/2
 spans=[(321,374),(374,398),(398,426),(426,455),(455,483)] if right else [(96,150),(150,173),(173,202),(202,231),(231,259)]
 cells=[]
 for lo,hi in spans:
  cc=sorted([c for c in chars if lo<=(c['x0']+c['x1'])/2<hi and abs((c['top']+c['bottom'])/2-center)<2.65],key=lambda c:c['x0'])
  cells.append({'rawChars':''.join(c['text'] for c in cc),'glyphs':[{'text':c['text'],'x':round(c['x0'],3),'top':round(c['top'],3),'height':round(c['height'],3)} for c in cc]})
 issues=[]
 if item['rawCountry'] in ['China','Java','Russia','Peru']:issues.append('Explicit hold: multi-unit/territorial/nominal/reform case; requires separate historical review.')
 if item['rawUnit']=='do':issues.append('Literal ditto requires explicit preceding-unit visual binding; retained rather than silently renamed.')
 row={'rowId':'frb1930-'+str(len(rows)+1),'rawCountry':item['rawCountry'],'rawUnit':item['rawUnit'],'region':item['region'],'countryAnchor':{'x':anchor['x0'],'top':anchor['top']},'cellSpans':spans,'cells':cells,'countryFootnoteIds':[2] if item['rawCountry'] in closing_notes else [4] if item['rawCountry'] in ['China','Hong Kong'] else [],'sourceId':source['id'],'sourceBodyHash':HASH,'scope':'Country-labelled NewYork foreign-exchange quotation; not exclusive legal tender or polygon control.','issues':issues,'status':'historical-review' if issues else 'source-extracted'}
 rows.append(row)
 for j,month in enumerate(['1930-04','1930-05','1930-06']):
  cell=cells[j+2];raw=cell['rawChars'];numeric=raw
  note=[];actual=month;ois=list(issues)
  if item['rawCountry']=='Turkey':
   note=[7+j];actual=['1930-02','1930-03','1930-04'][j]
  elif item['rawCountry']=='Egypt':
   note=[6,7,9][j:j+1]
   if j==0:ois.append('Original superscript6 points to Peruvianpound note, inconsistent with Egyptianpound; no silent repair.');actual=None
   else:actual={1:'1930-02',2:'1930-04'}[j]
  elif item['rawCountry']=='Russia':note=[3]
  elif item['rawCountry']=='Peru' and j<2:note=[6]
  if note:
   # The PDF text layer can place superscripts either before/after value or merge
   # them into a glyph run; preserve original and hold uncertain separation.
   n=str(note[0])
   if numeric.startswith(n):numeric=numeric[1:]
   elif numeric.endswith(n) and len(numeric.split('.')[-1])==5:numeric=numeric[:-1]
   else:ois.append('Superscript separation requires review; original raw glyphs retained.')
  numeric=numeric.replace(' ','')
  value=None
  if re.fullmatch(r'\d*\.\d{4}',numeric):value=float(numeric)
  else:ois.append('PDF text layer does not preserve an unambiguous four-decimal value; no numeric interpolation.')
  observations.append({'id':row['rowId']+'-'+month,'category':'economy','metric':'NewYork foreignexchange monthlyaverage quotation','rawCountry':item['rawCountry'],'rawMonetaryUnit':item['rawUnit'],'columnMonth':month,'observationDate':actual,'observationPrecision':'month','rawValue':raw,'value':value,'unit':'US cents per foreign monetary unit','footnoteIds':note,'countryFootnoteIds':row['countryFootnoteIds'],'methodology':'Monthly average of daily closing exchange quotations published by NewYork JournalofCommerce (countryfootnote2).' if item['rawCountry'] in closing_notes else 'Monthly average of daily noon cabletransfer buying rates in NewYork (headerfootnote1).','scope':row['scope'],'sourceId':source['id'],'sourceBodyHash':HASH,'locator':'Printed450/'+item['region']+'/'+item['rawCountry']+'/'+month,'reviewIssues':ois,'status':'historical-review' if ois else 'source-extracted'})
  if ois:held.append(observations[-1]['id'])
currency_observations=[]
for r in rows:
 # Final column's actual month is row-specific; publication is never substituted.
 last=next(o for o in observations if o['id']==r['rowId']+'-1930-06')
 currency_observations.append({'id':r['rowId']+'-unit','category':'currency','rawCountry':r['rawCountry'],'value':r['rawUnit'],'observationDate':last['observationDate'],'observationPrecision':'month','scope':r['scope'],'sourceId':source['id'],'sourceBodyHash':HASH,'locator':'Printed450/'+r['region']+'/'+r['rawCountry']+'/Monetaryunit and finalquotation column','qualifications':['Contemporary quoted monetaryunit only; does not establish exclusive legal tender or continuous full-year persistence.'],'reviewIssues':r['issues'],'status':r['status']})
assert len(rows)==44 and len(observations)==132 and len(currency_observations)==44
assert next(x for x in observations if x['rawCountry']=='Austria' and x['columnMonth']=='1930-06')['value']==14.0898
assert next(x for x in observations if x['rawCountry']=='Germany' and x['columnMonth']=='1930-06')['value']==23.8498
assert next(x for x in observations if x['rawCountry']=='Turkey' and x['columnMonth']=='1930-06')['observationDate']=='1930-04'
assert next(x for x in observations if x['rawCountry']=='Egypt' and x['columnMonth']=='1930-04')['status']=='historical-review'
assert all(x['status']=='historical-review' for x in observations if x['rawCountry'] in ['China','Russia','Java','Peru'])
assert all(x['value'] is None for x in observations if x['rawCountry']=='Denmark')
result={'schemaVersion':1,'source':source,'parser':'extract-frb1930.py: coordinate glyph extraction; country anchors from independently visually reviewed source transcription; no OCR sequence alignment','rows':rows,'currencyObservations':currency_observations,'exchangeObservations':observations,'footnotes':{1:'Noon cabletransfer buyingrates NewYork',2:'Daily closingquotations NewYork JournalofCommerce',3:'Chervonetz nominal',4:'Silvercurrency parity basedJune1930silverprice',5:'Peruvianmonetarylaw10February1930',6:'RateforPeruvianpound',7:'February1930',8:'March1930',9:'April1930'},'metrics':{'rawRows':44,'currencyObservations':44,'exchangeObservations':132,'numericValuesParsed':sum(x['value'] is not None for x in observations),'numericHeld':len(held),'sourceReadyNumeric':sum(x['status']=='source-extracted' for x in observations)},'productionEdited':False}
(BASE/'frb1930-extracted.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
(BASE/'validation.json').write_text(json.dumps({'checksPassed':['Original PDFhash bound','Exact pagegeometry522x756 and tableprinted450','44sourcecountry/unitrows','132monthlyFXobservations','44datedcurrencyobservations','Countryanchors preventtwo-columnOCRalignmenterrors','AustriaJune14.0898 and GermanyJune23.8498 alignfacsimile','TurkeyactualFebruary/March/April months','Egyptsup6contradictionheld','Russia/China/Java/Peru withheld','Missingdecimalfailsclosed'],'metrics':result['metrics'],'productionEdited':False},indent=2)+'\n')
print(json.dumps(result['metrics']))
