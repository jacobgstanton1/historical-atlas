from pathlib import Path
from html.parser import HTMLParser
from hashlib import sha256
import json

BASE=Path('research/completion-01/colonial-governors-discovery')
class Links(HTMLParser):
    def __init__(self): super().__init__(); self.links=[]
    def handle_starttag(self,tag,attrs):
        if tag=='a':
            for k,v in attrs:
                if k=='href': self.links.append(v)
def cached(name,url):
    p=BASE/'cache'/name
    return {'path':p.as_posix(),'url':url,'bytes':p.stat().st_size,'sha256':sha256(p.read_bytes()).hexdigest()}
fr='https://www.cambridge.org/core/journals/social-science-history/article/attaining-autonomy-in-the-empire-french-governors-between-1860-and-1960/2F86494CD12A1594309AEEEC7960F73A'
p=Links();p.feed((BASE/'cache/french-publisher.html').read_text(encoding='utf-8'))
supp=sorted(set(u for u in p.links if any(w in u.lower() for w in ['supp','s0145553222000207','zip','csv','dta','xlsx'])))
out={'schemaVersion':'bounded-dataset-discovery-v1','productionChanges':False,'acquiredStructuredTenureRows':0,
 'french':{'title':'Attaining Autonomy in the Empire: French Governors between1860and1960','doi':'10.1017/ssh.2022.20','authors':['Scott Viallet-Thévenin','Cédric Chambru'],
 'publisherURL':fr,'authorResearchURL':'https://cedricchambru.github.io/research/','authorDataURL':'https://cedricchambru.github.io/dataset/',
 'status':'held-discovery-limited','structuredDataURL':None,'schemaVerified':False,
 'reportedPotentialUniverse':{'individuals':637,'years':[1830,1960],'federations':5,'colonies':18,'protectorates':5,'usableCareerSequences':592},
 'documentedSchemaConcept':['start year','end year','geographical location','organization','occupation'],
 'qualification':'Paper describes each professional career stage PRECEDING appointment as governor. This does not establish a complete downloadable named territory-tenure table. Missing career stages are coded missing; annual sequence statuses are not exact appointment days.',
 'availabilityFinding':'Author research entry links paper only. Author Data page lists unrelated conflict/GIS datasets. Publisher supplement labelled Online AppendixPDF; no structured tenure file found in bounded search.',
 'publisherSupplementRelatedLinks':supp,'candidateAtlasSlotGain':None},
 'british':{'title':'The Costs of Patronage: Evidence from the British Empire','author':'Guo Xu','articleDOI':'10.1257/aer.20171339','replicationDOI':'10.3886/E113197V1',
 'authorURL':'https://www.guoxu.org/home','publisherURL':'https://www.aeaweb.org/articles?id=10.1257/aer.20171339','repositoryURL':'https://www.openicpsr.org/openicpsr/project/113197/version/V1/view',
 'status':'held-download-login-required','schemaVerified':False,'reportedTimeCoverage':[1854,1966],
 'reportedPrimarySources':['Colonial Office Lists','Colonial Blue Books','National ArchivesUK'],
 'listedFiles':[{'name':'analysis.dta','format':'Stata','reportedSize':'1.2MB'},{'name':'Readme.pdf','reportedSize':'241.1KB'},{'name':'LICENSE.txt','reportedSize':'14.6KB'},{'name':'figures.do'},{'name':'tables.do'}],
 'fileListingURL':'https://www.openicpsr.org/openicpsr/project/113197/version/V1/view?path=/pcms/projects/1/1/3/1/113197/V1.0.1/analysis.dta&type=file',
 'downloadAttemptURL':'https://www.openicpsr.org/openicpsr/project/113197/version/V1/download/terms?path=%2Fpcms%2Fprojects%2F1%2F1%2F3%2F1%2F113197%2FV1.0.1%2Fanalysis.dta&type=file',
 'availabilityFinding':'Web repository listing accessible; dataset and project download both redirect to ICPSR identity-provider login. Direct curl repository listing returns403. No attempt to bypass login or infer fields from analysis-file name.',
 'qualification':'Verify whether analysis.dta retains named individuals, territory strings, literal appointment/ending dates and office-title distinctions before any adapter. Fiscal regression panel alone cannot support tenure claims. Source years after1960 must be excluded.',
 'candidateAtlasSlotGain':None,
 'misleadingSearchResult':'Search indexed a test.openicpsr project113080 with the same title; current production project113080 is an unrelated LegalOrigins/FemaleHIV study. Author/AER links establish correct113197.'},
 'cachedBodies':[cached('chambru-research.html','https://cedricchambru.github.io/research/'),cached('chambru-data.html','https://cedricchambru.github.io/dataset/'),cached('xu-author.html','https://www.guoxu.org/home'),cached('french-publisher.html',fr)],
 'retrievalCosts':{'searchQueries':5,'curlRequests':5,'curlSuccessfulBodies':4,'curlHTTP403':1,'webFileDownloadRoutesLoginRedirected':2},
 'nextAction':'Stop discovery. British dataset may warrant a normal authenticated ICPSR download in an independently authorized acquisition step, then inspect original Readme and analysis.dta schema. French source remains held until authors publicly expose a structured tenure dataset; no bespoke governor reconstruction.'}
s=json.dumps(out,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()
out['discoveryDigest']=sha256(s).hexdigest()
(BASE/'discovery.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
print(json.dumps({'digest':out['discoveryDigest'],'cachedBodies':len(out['cachedBodies']),'frenchSupplementLinks':supp,'structuredRows':0},ensure_ascii=False))
