"""Literal full-workbook extraction; no interpolation or territorial inference."""
import json, hashlib, math, unicodedata
from pathlib import Path
from openpyxl import load_workbook
from pypdf import PdfReader

BASE=Path('research/completion-03/population')
FILES={'africa':BASE/'cache/africa.xlsx','america':BASE/'cache/america.xlsx','europe':BASE/'cache/europe.xlsx',
       'asia':next((BASE/'cache/asia-bundle').glob('*.xlsx')),'oceania':next((BASE/'cache/oceania-bundle').glob('*.xlsx'))}
QFILE=next((BASE/'cache/quality-bundle').glob('*.xlsx'))
def norm(x):
    return ''.join(c for c in unicodedata.normalize('NFKD',str(x or '')).lower() if c.isalnum() and not unicodedata.combining(c))
def year(v):
    return isinstance(v,(int,float)) and v==int(v) and 1800<=v<=1938
qrows=list(load_workbook(QFILE,data_only=True)['Quality Assessment'].values)
quality={}
for col,name in enumerate(qrows[1]):
    if col==0 or not name: continue
    for row in qrows:
        if year(row[0]) and col<len(row):quality[(norm(name),int(row[0]))]=row[col]
aliases={'Hawaii':'Hawai','New Zealand':'New Zeland','Arabian Penissula (Ottoman Empire)':'Saudi Arabia','Khiva and Bukhara (Russian Empire)':'Buhhara and Khiva',
 'British East Africa':'British East Africa (Kenia & Uganda)','Cape Verde (Portuguese Africa)':'Cabo Verde (Portuguese Africa)',
 'Comoros and Mayote (French)':'Comoros and Mayote','German East Africa':'Tanganyka (German East Africa)', 'German West Africa':'Togo (German West Africa)',
 'Italian Somaliland':'Italia Somalia','Morocco':'Marocco','Southern Rhodesia':'Zimbabwe (Southern Rhodesia)','Zanzibar Island':'Zanzibar Isl.',
 'Sao Tome and Principe (Portuguese Africa)':'S.Tome e Principe (Portuguess Africa)'}
observations=[];series=[]
for continent,p in FILES.items():
    w=load_workbook(p,data_only=True);s=w.worksheets[0];rows=list(s.values)
    names=rows[1] if continent in ('africa','america') else rows[0]
    for col,name in enumerate(names):
        if col==0 or not name or norm(name) in ('total','africa','america','asia','europe','oceania'):continue
        name=str(name).strip(); key=norm(aliases.get(name,name)); count=0
        for n,row in enumerate(rows,1):
            if not year(row[0]) or col>=len(row):continue
            value=row[col]
            if value is None:continue
            if not isinstance(value,(float,int)) or not math.isfinite(value) or value<0:raise ValueError((p,n,name,value))
            y=int(row[0]); count+=1
            observations.append({'continent':continent,'polity':name,'year':y,'valueThousands':value,'quality':quality.get((key,y)),
                'qualityVersion':'2025-v01','file':p.as_posix(),'sheet':s.title,'row':n,'column':col+1,
                'fileSHA256':hashlib.sha256(p.read_bytes()).hexdigest()})
        series.append({'continent':continent,'polity':name,'records':count})
for p in (BASE/'cache').rglob('*.pdf'):
    p.with_suffix('.txt').write_text('\n'.join(page.extract_text() for page in PdfReader(p).pages),encoding='utf-8')
out={'schemaVersion':1,'method':'Literal Excel cached values; source units thousands, historical-border files only; no 1991-border series. No new interpolation.',
 'qualitySHA256':hashlib.sha256(QFILE.read_bytes()).hexdigest(),'series':series,'observations':observations}
(BASE/'observations.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'series':len(series),'records':len(observations),'snapshots':sum(r['year'] in [1800,1815,1878,1880,1900,1914,1920,1930,1938] for r in observations)}))
