"""Reproducible literal workbook extraction, not atlas interpolation."""
import hashlib,json,pathlib,openpyxl
base=pathlib.Path(__file__).parent
source=base/'cache/gapminder-pop-v7-download'
years={1800,1815,1878,1880,1900,1914,1920,1930,1938,1945,1960}
with source.open('rb') as stream:
    workbook=openpyxl.load_workbook(stream,read_only=True,data_only=True)
    sheet=iter(workbook['data-for-countries-etc-by-year'].values)
    header=next(sheet)
    if header!=('geo','name','time','Population'):raise ValueError('Workbook schema changed')
    rows=[{'geo':r[0],'name':r[1],'year':int(r[2]),'value':r[3]} for r in sheet if r[2] is not None and int(r[2]) in years]
result={'sourceSHA256':hashlib.sha256(source.read_bytes()).hexdigest(),'sheet':'data-for-countries-etc-by-year','version':'v7 (2022-10-19)','observations':rows,'method':'Literal numeric cached workbook cells; no interpolation, rounding or date changes.'}
(base/'cache/gapminder-v7-snapshot-observations.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'observations':len(rows),'sourceSHA256':result['sourceSHA256']}))
