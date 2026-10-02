from pathlib import Path
import csv,json,hashlib
from collections import defaultdict

BASE=Path('research/completion-02/population')
db=json.loads(Path('data/historical-entities.json').read_text(encoding='utf-8'))
sources=json.loads(Path('data/historical-sources.json').read_text(encoding='utf-8'))['sources']
gaps=json.loads((BASE/'gaps.json').read_text(encoding='utf-8'))
E={e['id']:e for e in db['entities']}; S={s['id']:s for s in sources}
yearBy=defaultdict(list)
for g in gaps:yearBy[g['entityId']].append(g['year'])
owid=defaultdict(set)
with (BASE/'cache/owid-population.csv').open(encoding='utf-8') as f:
    for r in csv.DictReader(f):owid[r['Entity']].add(r['Code'])
def sourceIds(e):
    return sorted(set(e.get('existence',{}).get('sourceIds',[])+[s for n in e.get('names',[]) for s in n.get('sourceIds',[])]))
def ent(f):return [e for e in E.values() if f(e['id'])]
mappings=[]
def add(e,raw,confidence,reason,allow=None):
    ys=sorted(set(yearBy[e['id']]))
    mappings.append({'entityId':e['id'],'historicalName':e['names'][0]['value'],'sourceEntity':raw,'sourceCode':next(iter(owid.get(raw,[])),None),'years':ys if allow else [],'examinedSnapshotYears':ys,'confidence':confidence,'scopeRationale':reason,'sourceIds':sourceIds(e),'entityExistence':e.get('existence'),'datePrecision':'year','observationRule':'Provider annual estimate date remains literal year; no census claim, January1 or July1 invented. Actual provider retained from country-year provenance table.'})
for e in ent(lambda s:s.startswith('ceylon-')):
    if e['id'] in ['ceylon-legislative-council-framework','ceylon-state-council-framework','ceylon-independent-parliamentary-framework']:
        add(e,'Sri Lanka','HIGH_CONFIDENCE','Whole-island Ceylon after1815 coastal/interior unification; NationalArchives1815Convention together with Parliament council chronology supports distinct government frameworks for the same island statistical scope. Modern provider labelSriLanka is citation geography only, never historical state name. No military/harbour exclusions are imported from unrelated1911census; this series is whole-population retrospective/provider annual estimate. Approve only complete requested years within actual existing framework bounds.',True)
    elif e['id']=='ceylon-post-convention-framework':
        add(e,'Sri Lanka','REVIEW','This is the whole-island Crown administration after the March1815KandyanConvention, not the earlier coastal-only administration. The1815annual observation is held because existing validity starts1815-03 and does not encompass the complete requested year. There is no eligible configured whole-year snapshot within this framework; no interval extension is inferred.')
    else:add(e,'Sri Lanka','INCOMPATIBLE','Whole modern island cannot represent the coastal-only pre1815administration. The separate post-Convention whole-island framework is reviewed on its own chronology; no modern island fallback.')
rules=[
 (lambda s:s.startswith('afghan-'),'Afghanistan','REVIEW','Institutional constitution source supports named regime dates, not explicit current-border equivalence afterDurand/Wakhan settlements; no border assumption from modern country or polygon. Hold without chasing new source.'),
 (lambda s:s.startswith('iran-') or 'qajar' in s,'Iran','REVIEW','Existing constitutional chronology establishes framework, not territorial equivalence to currentIran. Post1930whole-polity candidate may be useful but cannot certify settled borders from institutional source alone.'),
 (lambda s:s.startswith('bhutan-'),'Bhutan','REVIEW','1949 treaty supports relationship and monarchy chronology; does not alone establish population-series modern-boundary equivalence, including border-cession history. No projection from1999country report.'),
 (lambda s:s.startswith('nepal-'),'Nepal','REVIEW','Source-backed Rana/1959framework chronology does not certify historical/current boundaries;1960two frameworks additionally fail complete-year validity. No annualpoint mapped into partial-year administration.'),
 (lambda s:s.startswith('mongolia-'),'Mongolia','REVIEW','OuterMongolia explicitly distinct fromInnerMongolia. Republic/autonomy chronology is supported, but no cached dataset territorial definition establishes exact historical versus currentMongolia scope;1911/1921transitions andTannuTuva separation cannot be inferred. Sourceannual/modernborder warning retained.'),
 (lambda s:s.startswith('japan-'),'Japan','INCOMPATIBLE','ModernJapan/home-island statistical scope cannot stand for empire with colonial territories or occupations; Tokugawa/Restoration territorial scope likewise not proven identical. No combining Taiwan/Korea or empire sovereignty inference.'),
 (lambda s:s.startswith('korea-'),'South Korea','INCOMPATIBLE','ModernSouthKorea cannot substitute Joseon/unified peninsula or northern/southern1945occupation zones.1948states versus currentpost1953demarcation requires explicit compatible statistical scope; no provider-defined boundary proof here.'),
 (lambda s:s.startswith('qing') or s.startswith('china') or s.startswith('republic-of-china'),'China','INCOMPATIBLE','ModernmainlandChina cannot represent Qingempire, earlierROCscope orROC1960Taiwan administration. No China label modernfallback.'),
 (lambda s:s.startswith('british-raj') or s.startswith('india-'),'India','INCOMPATIBLE','ModernIndia excludes historical BritishIndia/princely states and other postPartition scope; no summing modernIndia/Pakistan/Bangladesh or retroactive modernborders.'),
 (lambda s:s.startswith('pakistan-'),'Pakistan','INCOMPATIBLE','ModernPakistan excludes EastPakistan;1960historical polity requires incompatible two-wing geography. No modernPakistan substitute.'),
 (lambda s:s.startswith('b13-siam'),'Thailand','REVIEW','Siam institutions/naming source does not prove territorial equality across1907/1909cessions and wartime changes; retain modern-border warning rather than map annualseries to broad monarchy.'),
 (lambda s:s.startswith('b13-burma'),'Myanmar','REVIEW','Konbaung/colonial/subsequent Burmese scope cannot be certified from government chronology alone; no geometric/modern Myanmar fallback.'),
 (lambda s:s.startswith('b13-cambodia'),'Cambodia','REVIEW','Cambodian dated administration source does not independently establish current-country statistical territory throughout Frenchprotectorate period/cessions.'),
 (lambda s:s.startswith('b13-laos'),'Laos','REVIEW','ModernLaos statistical scope is not evidence for all colonial Lao administrations or1893/1904/1907territorial framework changes.'),
 (lambda s:s.startswith('b13-vietnam'),'Vietnam','INCOMPATIBLE','ModernunifiedVietnam population cannot represent separate colonialadministrations or1960northern/southern states.'),
]
already={m['entityId'] for m in mappings}
for fn,raw,confidence,reason in rules:
    for e in ent(fn):
        if e['id'] not in already and yearBy[e['id']]:
            add(e,('North Korea' if e['id']=='korea-dprk-1948' else raw),confidence,reason);already.add(e['id'])
formerRows=defaultdict(list)
with (BASE/'cache/systema-population.csv').open(encoding='utf-8') as f:
    for r in csv.DictReader(f):
        if r['geo'] in ['ussr','yug','cheslo']:formerRows[r['geo']].append((int(r['time']),r['total_population_with_projections']))
former=[]
for geo,raw,prefix in [('ussr','USSR','soviet-union'),('yug','Yugoslavia','yugoslav-'),('cheslo','Czechoslovakia','czechoslovakia-')]:
    a=formerRows[geo]
    former.append({'systemaGeo':geo,'sourceEntity':raw,'sourceCode':next(iter(owid[raw])),'literalMinimumYear':min(y for y,v in a),'literalMaximumYear':max(y for y,v in a),'literalSnapshotRows':[{'year':y,'population':v} for y,v in a if y in [1800,1815,1878,1880,1900,1914,1920,1930,1938,1945,1960]],'scopeQualification':'Former-country label does not define territorial reference year. Values beforeformation andafterdissolution demonstrate retrospective/static geography is possible; no instant historical-border equivalence.'})
    for e in ent(lambda s:s==prefix if geo=='ussr' else s.startswith(prefix)):
        reason={'ussr':'SovietUnion existed only from30December1922;1920notvalid.1930/1938beforeBaltic/EasternPolish/other wartime territorial additions differ fromlaterUSSR territory. Even1960needs explicit Systemageography definition, absent cachedmetadata.',
        'yug':'1920/1930/1938Kingdom scope differs frompostwarYugoslavia territorial acquisitions/cessions.1945transition and1954Trieste settlement require independent statistical definition;1960not approved merely because former-series labelmatches.',
        'cheslo':'FirstRepublic included CarpathianRuthenia ceded1945;1930cannot be equated to later former-state geography.1945partial-year provisional framework failswholeyear.1960potential compatible postwar scope remainsREVIEW until actual datasetformer-geography definition supports it.'}[geo]
        add(e,raw,'REVIEW',reason)
def h(p):return hashlib.sha256(p.read_bytes()).hexdigest()
paths=['owid-metadata.json','owid-full-metadata.json','owid-population.csv','owid-country-year-sources.csv','systema-population.csv','systema-entities.csv']
out={'reviewer':'campaign-selection-independent-territorial','method':'ReadcachedOWIDmodern-border warning, currententitydatedframework/sourceusage, literalSystemaformer-country records. Noexternalretrieval or productionediting. Failclosed where sourceidentifiesgovernmentbutnotstatisticalterritory. Ceylonisland scope is explicit documented exception withcompleteyearrule.','mappings':mappings,'held':[{'entityId':m['entityId'],'confidence':m['confidence'],'reason':m['scopeRationale']} for m in mappings if m['confidence'] in ['REVIEW','INCOMPATIBLE']], 'formerCountrySourceAudit':former,'cachedBodyBindings':[{'path':(BASE/'cache'/p).as_posix(),'sha256':h(BASE/'cache'/p)} for p in paths],'sourceRule':'OWID explicitly current borders; Gapminderhistoricalannual estimates andWPPannualestimates are not contemporarycensuses. Providerprovenance retained peryear; datedframeworkmatchalone does not establish territorialscope.','metrics':{'mappingUnits':len(mappings),'approvedMappingUnits':sum(m['confidence'] in ['EXACT','HIGH_CONFIDENCE'] for m in mappings),'approvedSnapshotSlots':sum(len(m['years']) for m in mappings if m['confidence'] in ['EXACT','HIGH_CONFIDENCE']),'heldMappingUnits':sum(m['confidence'] in ['REVIEW','INCOMPATIBLE'] for m in mappings)},'productionChanges':False,'retrievals':0}
digest=hashlib.sha256(json.dumps(out,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()).hexdigest();out['reviewDigest']=digest
for m in mappings:
    assert m['sourceCode'] is not None,(m['sourceEntity'],'missing dataset code')
    for s in m['sourceIds']:assert s in S
    if m['years']:
        x=m['entityExistence'];fromYear=int(x['validFrom'][:4]);endYear=int(x.get('validUntil','9999')[:4]);assert all(y>=fromYear and y<endYear for y in m['years'])
(BASE/'asia-former-crosswalk-review.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
print(json.dumps({'digest':digest,'metrics':out['metrics']}))
