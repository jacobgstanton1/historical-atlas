"""Source-first COW episode endpoints; preserve coding rather than invent declarations."""
from pathlib import Path
from collections import Counter
import csv,json,hashlib,datetime
B=Path('research/bulk-02/events');C=B/'cache';csvpath=C/'Inter-StateWarData_v4.0.csv';book=C/'Inter-StateWars_Codebook.pdf'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
rows=list(csv.DictReader(csvpath.open(encoding='utf-8-sig',newline='')))
assert len(rows)==337
dups=Counter((r['WarNum'],r['ccode']) for r in rows)
sources=[{'id':'cow-interstate-war-v4','title':'COW Inter-State War participant data, version4.0','institution':'Correlates of War Project; Meredith Reid Sarkees and Frank Wayman','url':'https://correlatesofwar.org/wp-content/uploads/Inter-StateWarData_v4.0.csv','cachePath':str(csvpath),'sha256':sha(csvpath),'kind':'academic-historical-war-participation-dataset','citation':'Sarkees, Meredith Reid and Frank Wayman (2010). Resort to War:1816–2007. Washington DC:CQ Press.'},{'id':'cow-interstate-war-v4-codebook','title':'Inter-state Wars (Version4.0): Definitions and Variables','institution':'Correlates of War Project; Meredith Reid Sarkees','url':'https://correlatesofwar.org/wp-content/uploads/Inter-StateWars_Codebook.pdf','cachePath':str(book),'sha256':sha(book),'kind':'academic-dataset-codebook'}]
events=[]
for ri,r in enumerate(rows,2):
 for ep in [1,2]:
  for side in ['Start','End']:
   y,m,d=(int(r[f'{side}{part}{ep}']) for part in ['Year','Month','Day'])
   if y==-8:continue
   if y>1960:continue
   issues=[]; date=None; precision=None
   if y<1800:issues.append('Year unknown/ongoing sentinel or outside1800–1960; no date inferred.')
   elif m<0:date=str(y);precision='year';issues.append('Month unknown sentinel; coarse endpoint requires review.')
   elif d<0:date=f'{y:04}-{m:02}';precision='month';issues.append('Day unknown sentinel; no invented first/last day.')
   else:
    try:date=datetime.date(y,m,d).isoformat();precision='day'
    except ValueError:issues.append('Invalid source calendar date; no silent repair.')
   if r['TransFrom']!='-8' or r['TransTo']!='-8':issues.append('War transformation coding; endpoint meaning/identity requires review before acceptance.')
   if int(r['Outcome'])==8 or dups[r['WarNum'],r['ccode']]>1:issues.append('Repeated participant/side-change coding; distinguish episodes/alignments, do not merge silently.')
   if ep==2:issues.append('Second episode after break in fighting; preserve resumption separately, no continuous interval.')
   phrase=('began' if ep==1 else 'resumed') if side=='Start' else 'ended'
   description=f"COW codes {r['StateName']}'s sustained-combat episode in {r['WarName']} as {phrase} on {date or 'an unresolved date'}."
   events.append({'id':f"cow-v4-row{ri}-w{r['WarNum']}-c{r['ccode']}-s{r['Side']}-ep{ep}-{side.lower()}",'category':'events','eventDate':date,'eventPrecision':precision,'eventKind':f'coded-combat-{phrase}','value':description,'sourceWarId':r['WarNum'],'warName':r['WarName'],'rawParticipant':r['StateName'],'sourceCountryCode':r['ccode'],'sideCode':r['Side'],'episode':ep,'endpoint':side,'rawDateFields':{part:r[f'{side}{part}{ep}'] for part in ['Year','Month','Day']},'originalRowNumber':ri,'originalRow':r,'sourceId':sources[0]['id'],'sourceBodyHash':sources[0]['sha256'],'codebookHash':sources[1]['sha256'],'locator':f"Original CSV row{ri}; WarNum={r['WarNum']}; ccode={r['ccode']}; Side={r['Side']}; {side}Year/Month/Day{ep}",'scope':'Academic coded state participant and combat episode; not independent proof of legal declaration, peace treaty, sovereignty, geometry or succession.','qualification':'Source endpoint coding concerns sustained combat or threshold-related last engagement; end day may be the day after last major engagement. No war-wide cessation or declaration inferred.','reviewIssues':issues,'status':'historical-review' if issues else 'source-extracted'})
assert len({e['id'] for e in events})==len(events)
assert all(not e['eventDate'] or e['eventDate']<'1961' for e in events)
out={'schemaVersion':1,'sources':sources,'originalRows':rows,'events':events,'definitionLocators':['Codebook PDF p.3 variables','Codebook PDF p.2 participation thresholds/transformations','Codebook PDF p.4 transformation/outcome/sentinel meanings'],'datePolicy':'Literal precision only. Episode endpoints become dated events; NEVER interval facts. Original enddate untouched.','retrievalCosts':{'successfulBodyDownloads':2,'shellDownloadAttempts':2,'downloadRetries':0,'csvBytes':csvpath.stat().st_size,'codebookBytes':book.stat().st_size,'webCsvViewerAttempt':1,'webCsvViewerResult':'unsupported text/csv; no cached CSV body from viewer'},'metrics':{'originalRows':len(rows),'eventCandidates1800to1960':len(events),'sourceExtracted':sum(e['status']=='source-extracted' for e in events),'held':sum(e['status']=='historical-review' for e in events)},'productionEdited':False}
(B/'cow-events-extracted.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps(out['metrics']))
