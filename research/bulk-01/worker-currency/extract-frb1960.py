"""Reproducible bounded facsimile extraction; no decimal or historical repair."""
from pathlib import Path
import pdfplumber,json,hashlib,re
B=Path('research/bulk-01/worker-currency'); P=B/'frb_121960.pdf'
H=hashlib.sha256(P.read_bytes()).hexdigest()
assert H=='e7ff004d8734751e1fea1545cfe54503b16d165bfa105b32f414bfb86d3c40ca'
p=pdfplumber.open(P).pages[108]; assert (p.width,p.height)==(615,792)
w=p.extract_words(); cc=p.chars
source={'id':'bulk-frb-dec1960-exchange-table','title':'Federal Reserve Bulletin December1960, Foreign Exchange Rates','institution':'Board of Governors of the Federal Reserve System / FRASER Federal Reserve Bank of St Louis','url':'https://fraser.stlouisfed.org/files/docs/publications/FRB/1960s/frb_121960.pdf','publicationDate':'1960-12','cachePath':str(P),'sha256':H,'pdfPageIndex':108,'printedPage':1427,'renderedPagePath':str(B/'frb-1960-p1427.png'),'kind':'contemporary-official-statistical-table'}
bands=[
 {'bounds':[244,316,352,388,424,460,496,532],'top':190,'bottom':263,'columns':[('Argentina','peso','single rate; historical header Official/Free merged for these rows'),('Australia','pound',''),('Austria','schilling',''),('Belgium','franc',''),('Canada','dollar',''),('Ceylon','rupee',''),('Finland','markka','')]},
 {'bounds':[209,245,281,317,353,389,425,461,497,532],'top':362,'bottom':435,'columns':[('France','franc',''),('Germany','deutsche mark',''),('India','rupee',''),('Ireland','pound',''),('Italy','lira',''),('Japan','yen',''),('Malaysia','dollar',''),('Mexico','peso',''),('Netherlands','guilder','')]},
 {'bounds':[209,245,281,317,353,389,425,461,497,532],'top':536,'bottom':611,'columns':[('New Zealand','pound',''),('Norway','krone',''),('Philippine Republic','peso',''),('Portugal','escudo',''),('South Africa','pound',''),('Spain','peseta',''),('Sweden','krona',''),('Switzerland','franc',''),('United Kingdom','pound','')]}
]
months={'Jan':'01','Feb':'02','Mar':'03','Apr':'04','May':'05','June':'06','July':'07','Aug':'08','Sept':'09','Oct':'10','Nov':'11'}
rows=[]; fx=[]
for bi,b in enumerate(bands):
 anchors=[]
 for x in w:
  if not(102<x['x0']<125 and b['top']<x['top']<b['bottom']):continue
  m=next((m for m in months if x['text'].startswith(m)),None)
  if m: anchors.append(('1960-'+months[m],(x['top']+x['bottom'])/2))
 assert len(anchors)==11,(bi,anchors)
 for ci,(country,unit,market) in enumerate(b['columns']):
  rid=f'frb1960-b{bi+1}-c{ci+1}'
  rows.append({'rowId':rid,'rawCountry':country,'rawUnit':unit,'market':market,'headerSpans':b['bounds'][ci:ci+2],'sourceId':source['id'],'sourceBodyHash':H,'locator':f'Printed1427/band{bi+1}/column{ci+1}'})
  for date,y in anchors:
   lo,hi=b['bounds'][ci:ci+2]
   gs=sorted([c for c in cc if lo<=(c['x0']+c['x1'])/2<hi and abs((c['top']+c['bottom'])/2-y)<2.65],key=lambda c:c['x0'])
   raw=''.join(c['text'] for c in gs); number=raw.strip(); foot=[]; issues=[]; quals=[]
   if country=='France':
    quals.append('Footnote4: new franc equal to100 old francs introduced1January1960; these1960 quotations concern the new franc, not the old unit.')
    if date=='1960-01' and re.match(r'^4\s+',number): foot.append('4'); number=re.sub(r'^4\s+','',number)
   if country=='Argentina': quals.append('Footnote1: single rate established12January1959 replacing former official/free rates; facsimile row spans former two subcolumns. Historical header retained, no second rate invented.')
   if country=='Philippine Republic' and date=='1960-04':
    foot.append('6'); quals.append('Footnote6: based on quotations through22April1960; partial-month average, not full April or later persistence.')
    if re.match(r'^6\s+',number):number=re.sub(r'^6\s+','',number)
    issues.append('Partial-month coverage through22April requires explicit reviewed qualification.')
   number=number.replace(' ','')
   value=float(number) if re.fullmatch(r'\d*\.\d{2,4}',number) else None
   if value is None:issues.append('Absent quotation or ambiguous numeric glyphs; no digit/decimal invention.')
   if country=='Malaysia':issues.append('Literal Malaysia header in1960 source predates later federation; historical identity/territorial scope requires review, not automatic rename to Malaya.')
   fx.append({'id':rid+'-'+date,'category':'economy','metric':'New York foreign exchange average quotation','rawCountry':country,'rawMonetaryUnit':unit,'market':market,'observationDate':date,'observationPrecision':'month','value':value,'rawValue':raw,'unit':'US cents per foreign monetary unit','scope':'Country-labelled New York quoted financial instrument; no sole legal currency or map-polygon scope inference.','methodology':'Average of certified noon buying rates in New York for cable transfers.','sourceId':source['id'],'sourceBodyHash':H,'locator':f'Printed1427/band{bi+1}/column{ci+1}/{date}','footnotes':foot,'qualifications':quals,'coverageThrough':'1960-04-22' if country=='Philippine Republic' and date=='1960-04' else None,'glyphs':[{'text':g['text'],'x':round(g['x0'],3),'top':round(g['top'],3),'height':round(g['height'],3)} for g in gs],'reviewIssues':issues,'status':'historical-review' if issues else 'source-extracted'})
units=[]
for r in rows:
 candidates=[o for o in fx if o['id'].startswith(r['rowId']+'-') and o['value'] is not None]
 last=candidates[-1] if candidates else next(o for o in fx if o['id']==r['rowId']+'-1960-11')
 issues=last['reviewIssues'].copy()
 if not candidates:issues.append('No unambiguous1960 quotation available for dated unit observation.')
 units.append({'id':r['rowId']+'-unit','category':'currency','rawCountry':r['rawCountry'],'value':r['rawUnit'],'observationDate':last['observationDate'],'observationPrecision':'month','scope':last['scope'],'sourceId':source['id'],'sourceBodyHash':H,'locator':r['locator']+'/literal header plus '+last['observationDate']+' quotation','qualifications':['Dated contemporary quoted unit; no sole legal tender, full-year persistence or modern identity projection.']+last['qualifications'],'coverageThrough':last['coverageThrough'],'reviewIssues':issues,'status':'historical-review' if issues else 'source-extracted'})
assert len(rows)==25 and len(fx)==275 and len(units)==25
assert all(o['observationDate'].startswith('1960-') for o in fx+units)
assert next(o for o in fx if o['rawCountry']=='United Kingdom' and o['observationDate']=='1960-11')['value']==281.36
assert next(o for o in fx if o['rawCountry']=='France' and o['observationDate']=='1960-01')['value']==20.366
assert all(o['status']=='historical-review' for o in fx+units if o['rawCountry']=='Malaysia')
assert next(o for o in units if o['rawCountry']=='Philippine Republic')['observationDate']=='1960-04'
notes=['All six original footnotes retained in facsimile/render and layout text.','1: Argentine single rate established12January1959 replaces prior official/free rates.','2: French1957/1958 exchange devaluations apply older excluded rows.','3:1959 annual Italian quotation begins2March1959, outside extraction.','4: French new franc equal100 old francs introduced1January1960.','5: Spanish peseta par value60 per US dollar set20July1959.','6: Philippine April average based on quotations through22April1960.','Annual1954–1959 and1959November/December deliberately excluded; no annual/statistical interpolation.','No continuous GDP series or currency legal exclusivity inferred.']
metrics={'headerColumns':25,'currencyObservations':25,'exchangeObservations':275,'numericParsed':sum(o['value'] is not None for o in fx),'sourceExtractedNumeric':sum(o['status']=='source-extracted' for o in fx),'heldNumeric':sum(o['status']=='historical-review' for o in fx)}
out={'schemaVersion':1,'source':source,'parser':'Visually verified fixed original geometry, three bands,1960 month anchors and exact glyph coordinates; former Argentina columns merged by original table for1960. No decimal repair.','headerRows':rows,'currencyObservations':units,'exchangeObservations':fx,'sourceNotes':notes,'metrics':metrics,'productionEdited':False}
(B/'frb1960-extracted.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
(B/'validation1960.json').write_text(json.dumps({'passed':['Exact original PDF hash','Printed1427 visually read','25 actual1960 columns including original merged Argentine single rate','11 month anchors per band','275 monthly observations; no annual or1959 rows','25 deduplicated unit observations','UK November281.36 aligned','French footnote4 separated from January20.366','Malaysia historical scope held','Philippine latest actual quotation April and partial-month held','No production edits'],'metrics':metrics},indent=2)+'\n',encoding='utf8')
print(json.dumps(metrics))
