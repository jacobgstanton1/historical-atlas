"""Bounded original-table coordinate extraction; no guessed decimal repair."""
from pathlib import Path
import pdfplumber,json,hashlib,re
B=Path('research/bulk-01/worker-currency');P=B/'frb_121938.pdf';H=hashlib.sha256(P.read_bytes()).hexdigest();assert H=='5da2a2a19bb0398ae5766e1a126372cc1303d7691a28020836da7e29e5b3f839'
p=pdfplumber.open(P).pages[66];assert (p.width,p.height)==(522,756);w=p.extract_words();cc=p.chars
source={'id':'bulk-frb-dec1938-exchange-table','title':'Federal Reserve Bulletin December1938, Foreign Exchange Rates','institution':'BoardofGovernors FederalReserveSystem / FRASER FederalReserveBankofStLouis','url':'https://fraser.stlouisfed.org/files/docs/publications/FRB/1930s/frb_121938.pdf','publicationDate':'1938-12','cachePath':str(P),'sha256':H,'pdfPageIndex':66,'printedPage':1098,'renderedPagePath':str(B/'frb-1938-p1098.png'),'kind':'contemporary-official-statistical-table'}
bands=[
 {'bounds':[103,132,161,190,219,248,277,306,335,364,393,422,451,484],'top':135,'bottom':251,'columns':[('Argentina','peso',''),('Australia','pound',''),('Austria','schilling',''),('Belgium','belga',''),('Brazil','milreis','Official'),('Brazil','milreis','Free market'),('British India','rupee',''),('Bulgaria','lev',''),('Canada','dollar',''),('Chile','peso','Official'),('Chile','peso','Export'),('China','yuan',''),('Colombia','peso','')]},
 {'bounds':[103,131,159,185,211,240,269,295,321,347,373,399,425,451,484],'top':300,'bottom':416,'columns':[('Cuba','peso',''),('Czechoslovakia','koruna',''),('Denmark','krone',''),('Egypt','pound',''),('Finland','markka',''),('France','franc',''),('Germany','reichsmark',''),('Greece','drachma',''),('Hong Kong','dollar',''),('Hungary','pengo',''),('Italy','lira',''),('Japan','yen',''),('Mexico','peso',''),('Netherlands','guilder','')]},
 {'bounds':[103,131,160,189,218,247,273,299,325,351,377,403,429,455,484],'top':465,'bottom':582,'columns':[('New Zealand','pound',''),('Norway','krone',''),('Poland','zloty',''),('Portugal','escudo',''),('Rumania','leu',''),('South Africa','pound',''),('Spain','peseta',''),('Straits Settlements','dollar',''),('Sweden','krona',''),('Switzerland','franc',''),('Turkey','pound',''),('United Kingdom','pound',''),('Uruguay','peso',''),('Yugoslavia','dinar','')]}
]
months={'February':'02','March':'03','April':'04','May':'05','IVlay':'05','June':'06','July':'07','August':'08','September':'09','October':'10'}
rows=[];fx=[]
for bi,b in enumerate(bands):
 anchors=[]
 for x in w:
  if not(40<x['x0']<102 and b['top']-1<x['top']<b['bottom']):continue
  text=x['text'];year=re.match(r'^(1929|193[0-7])\b',text)
  if year:date=year[1];precision='year'
  else:
   match=next((m for m in months if m in text),None)
   if not match:continue
   date='1938-'+months[match];precision='month'
  anchors.append((date,precision,(x['top']+x['bottom'])/2))
 assert len(anchors)==18,(bi,len(anchors))
 for ci,(country,unit,market) in enumerate(b['columns']):
  rowid='frb1938-b'+str(bi+1)+'-c'+str(ci+1)
  rows.append({'rowId':rowid,'rawCountry':country,'rawUnit':unit,'market':market,'headerSpans':[b['bounds'][ci],b['bounds'][ci+1]],'sourceId':source['id'],'sourceBodyHash':H,'locator':'Printed1098/band'+str(bi+1)+'/column'+str(ci+1)})
  for date,precision,y in anchors:
   lo,hi=b['bounds'][ci:ci+2]
   glyphs=sorted([c for c in cc if lo<=(c['x0']+c['x1'])/2<hi and abs((c['top']+c['bottom'])/2-y)<2.65],key=lambda c:c['x0']);raw=''.join(x['text'] for x in glyphs);number=raw.replace(' ','');issues=[];corrected=False
   if number.startswith(('c','C')):corrected=True;number=number[1:]
   value=float(number) if re.fullmatch(r'\d*\.\d{2,4}',number) else None
   if value is None:issues.append('Missing/ambiguous numeric glyphs or absent quotation; no decimal/character invention.')
   if precision=='year':issues.append('Annualhistoricalseries held pending referencedMarch1938p244 nominalstatus/method notes and priorframework mapping review; not an accepted continuousseries.')
   if country in ['China','Straits Settlements','Spain']:issues.append('Identity/scope/contestedframework requires independent review; no automatic sovereignty or nationalcurrency inference.')
   if country=='Austria' and date.startswith('1938'):issues.append('Source noquotations from14March1938; annexation/transition mapping not automatically resolved.')
   if country in ['Australia','New Zealand','South Africa'] and date in ['1938-02','1938-03']:issues.append('Source says quotations ceased being nominal26March; wholemonth is not entirely observed market data.')
   if country=='Mexico' and date.startswith('1938') and date>='1938-03':issues.append('Source noquotes19–21March, nominalthereafter; held ratherthan continuousmarketquote.')
   if country=='Czechoslovakia' and date in ['1938-09','1938-10']:issues.append('Source quotesnominal22September–4October; transition and statisticalwindow overlap unresolved.')
   if country=='Portugal' and date in ['1938-09','1938-10']:issues.append('Source nominalquotation28September/4October includedinmonthlyaverage; qualifiedhold.')
   if country=='Yugoslavia' and date in ['1938-02','1938-03','1938-04','1938-05','1938-06','1938-07','1938-08','1938-09']:issues.append('Source says quotesceasedbeingnominal17September; wholemonth comparability held.')
   if country=='Chile' and market=='Export':issues.append('Original facsimile exportcolumn has4.0000 values whiletextlayer encodes1/L; entirecolumnheld for visual correction contract.')
   fx.append({'id':rowid+'-'+date,'category':'economy','metric':'NewYork foreignexchange average quotation','rawCountry':country,'rawMonetaryUnit':unit,'market':market,'observationDate':date,'observationPrecision':precision,'value':value,'rawValue':raw,'unit':'US cents per foreign monetaryunit','scope':'Country-labelled NewYork quoted financialinstrument; no exclusivelegalcurrency/polygoncontrol claim.','methodology':'Averageofnoon buyingratesfor cabletransfers inNewYork; annualaverage or selectedmonthlyaverage as rowprecision specifies.','sourceId':source['id'],'sourceBodyHash':H,'locator':'Printed1098/band'+str(bi+1)+'/column'+str(ci+1)+'/'+date,'correctedInOriginalSource':corrected,'glyphs':[{'text':g['text'],'x':round(g['x0'],3),'top':round(g['top'],3),'height':round(g['height'],3)} for g in glyphs],'reviewIssues':issues,'status':'historical-review' if issues else 'source-extracted'})
units=[];seen=set()
for r in rows:
 key=(r['rawCountry'],r['rawUnit'])
 if key in seen:continue
 seen.add(key);last=next(o for o in fx if o['id']==r['rowId']+'-1938-10')
 issues=[s for s in last['reviewIssues'] if not s.startswith('Missing/ambiguous')]
 if last['value'] is None:issues.append('No clearOctoberquotation; no unsupportedOctoberunitobservation.')
 units.append({'id':r['rowId']+'-unit','category':'currency','rawCountry':r['rawCountry'],'value':r['rawUnit'],'observationDate':'1938-10','observationPrecision':'month','scope':last['scope'],'sourceId':source['id'],'sourceBodyHash':H,'locator':r['locator']+'/literalheaderunit andOctoberquotation','qualifications':['Quoted monetaryunit in datedcontemporarytable; not solelegaltender/full-yearpersistence.'],'reviewIssues':issues,'status':'historical-review' if issues else 'source-extracted'})
assert len(rows)==41 and len(fx)==738 and len(units)==39
assert next(o for o in fx if o['rawCountry']=='United Kingdom' and o['observationDate']=='1938-10')['value']==476.85
assert all(o['status']=='historical-review' for o in fx if o['rawCountry']=='Chile' and o['market']=='Export')
assert all(o['status']=='historical-review' for o in fx if o['rawCountry']=='Mexico' and o['observationDate']>='1938-03')
assert all(o['status']=='historical-review' for o in fx if o['observationPrecision']=='year')
out={'schemaVersion':1,'source':source,'parser':'Fixed originalpagegeometry; threevisuallyreviewed headerbands, rowdateanchors and cellglyphcoordinates. No OCRsequence rowalignment or decimalrepair.','headerRows':rows,'currencyObservations':units,'exchangeObservations':fx,'sourceNotes':['Correctedmarker c retained separately','March1938 Bulletin printed244 contains earlier nominal-status/method notes; annualcomparability requires those before acceptance','NoquotationAustriafrom14March','China nominalfrom14March','Australia/NewZealand/SouthAfrica no longernominal26March','Czechoslovakia nominal22September–4October','Mexico unavailable19–21March andnominalthereafter','Portugal nominal28September/4October','Yugoslavia ceasednominal17September'],'metrics':{'headerColumns':41,'currencyObservations':39,'exchangeObservations':738,'numericParsed':sum(x['value'] is not None for x in fx),'sourceExtractedNumeric':sum(x['status']=='source-extracted' for x in fx),'heldNumeric':sum(x['status']=='historical-review' for x in fx)},'productionEdited':False}
(B/'frb1938-extracted.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
(B/'validation1938.json').write_text(json.dumps({'passed':['ExactoriginalPDFhash','Printed1098 renderedandvisuallyread','Three41columnheaders','18dateanchorsperband','738statisticalobservations','39deduplicatedunitobservations','OctoberUK476.85alignsrender','Chileexportcorruptedtextlayerheld','Nominal/occupation/transitiondatesheld'],'metrics':out['metrics']},indent=2)+'\n')
print(json.dumps(out['metrics']))
