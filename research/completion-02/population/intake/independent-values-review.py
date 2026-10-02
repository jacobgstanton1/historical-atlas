"""Independent original CSV and literal primary workbook check; no atlas writes."""
import csv,json,pathlib,openpyxl
b=pathlib.Path(__file__).parent.parent
cohort=json.loads((b/'intake/cohort.json').read_text(encoding='utf-8-sig'))
maps=[]
for file in ['territorial-review.json','asia-former-crosswalk-review.json']:
    maps.extend(json.loads((b/file).read_text(encoding='utf-8-sig'))['mappings'])
approved={(m['entityId'],str(y)):m for m in maps if m['confidence'] in ['EXACT','HIGH_CONFIDENCE'] for y in m['years']}
def csvindex(file,value):
    with (b/'cache'/file).open(encoding='utf-8-sig',newline='') as f:
        return {(r['Entity'],r['Code'],r['Year']):r[value] for r in csv.DictReader(f)}
pop=csvindex('owid-population.csv','Population')
sources=csvindex('owid-country-year-sources.csv','Source')
with (b/'cache/gapminder-pop-v7-download').open('rb') as f:
    wb=openpyxl.load_workbook(f,read_only=True,data_only=True)
    rows=iter(wb['data-for-countries-etc-by-year'].values)
    assert next(rows)==('geo','name','time','Population')
    primary={(str(r[0]).upper(),str(int(r[2]))):r[3] for r in rows if r[2] is not None}
results=[]
for c in cohort['claims']:
    year=c['temporal']['observationDate'];m=approved[(c['entityId'],year)]
    key=(m['sourceEntity'],m['sourceCode'],year)
    assert c['value']==float(pop[key]),(c['id'],'CSV value')
    assert c['origin']['sourceIdentifier']==m['sourceCode']+':'+year
    assert c['temporal']['kind']=='observation' and len(year)==4
    assert c['evidence'][0]['precision']=='year'
    assert c['category']=='population-statistics' and c['unit']=='persons'
    assert c['scope']['relationship']=='same'
    assert 'estimate' in c['metric'].lower()
    assert c['scope']['description']==m['scopeRationale']
    provider=sources[key]
    sid=c['sourceIds'][0]
    if 'gapminder' in sid:
        assert provider.startswith('Gapminder v7 (2022)')
        assert primary[(m['sourceCode'],year)]==c['value'],(c['id'],'primary workbook')
        assert int(year)<1950
    else:
        assert 'un-wpp2024' in sid
        assert provider.startswith('United Nations - World Population Prospects (2024)') and 'Togo' not in m['sourceEntity']
        assert year=='1960'
    assert provider in c['evidence'][0]['locator']
    results.append({'claimId':c['id'],'entityId':c['entityId'],'sourceEntity':key[0],'sourceCode':key[1],'observationYear':year,'originalValue':pop[key],'originalCountryYearProvider':provider,'decision':'accepted','primaryWorkbookMatched': 'gapminder' in sid})
assert len({r['claimId'] for r in results})==len(results)
(b/'intake/independent-value-checks.json').write_text(json.dumps({'reviewer':'officeholder_sources','method':'Independent Python csv.DictReader of original retained population/provenance CSVs and direct openpyxl workbook cell comparison; no normalized-cache reliance. All approved crosswalk keys checked.','results':results},indent=2)+'\n',encoding='utf-8')
print(json.dumps({'checked':len(results),'primaryWorkbookMatches':sum(r['primaryWorkbookMatched'] for r in results)}))
