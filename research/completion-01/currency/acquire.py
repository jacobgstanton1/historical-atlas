import concurrent.futures,hashlib,json,time,urllib.request
from pathlib import Path
base=Path('research/completion-01/currency');(base/'cache').mkdir(parents=True,exist_ok=True)
sources=[
('hkma-history','https://www.hkma.gov.hk/media/eng/publication-and-research/reference-materials/monetary/1-1.pdf','pdf'),
('cbsl-anniversary','https://www.cbsl.gov.lk/sites/default/files/cbslweb_documents/publications/60th_anniversary_commemorative_volume_of_the_central_bank_of_sri_lanka.pdf','pdf'),
('cbk-currency','https://www.centralbank.go.ke/currency-history/','html'),
('cbk-newsletter','https://www.centralbank.go.ke/uploads/798892507_CBK%20Newsletter%20-%20Issue%202.pdf','pdf'),
('portugal-bulletin','https://www.bportugal.pt/sites/default/files/anexos/pdf-boletim/201010_boletim_notas_moedas.pdf','pdf'),
('fiji-history','https://www.rbf.gov.fj/core-functions/currency-management/a-history-of-fijis-currency/','html'),
('ghana-currency','https://www.bog.gov.gh/bank-notes-coins/evolution-of-currency-in-ghana/','html'),
('ghana-bank-history','https://www.bog.gov.gh/news/63-years-of-central-banking-in-ghana-anchoring-monetary-and-financial-stability/','html'),
('paraguay-guarani','https://www.bcp.gov.py/en/web/institucional/guarani-signo-monetario-paraguay','html')]
def fetch(s):
 name,url,ext=s;p=base/'cache'/f'{name}.{ext}';start=time.time();o={'id':name,'url':url,'cachePath':str(p).replace('\\','/'),'requests':0,'retries':0}
 try:
  if not p.exists():
   o['requests']=1
   with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=25)as r:
    data=r.read();o['httpStatus']=r.status;p.write_bytes(data)
  else:data=p.read_bytes();o['cacheReused']=True
  o.update(sha256=hashlib.sha256(data).hexdigest(),bytes=len(data),status='retrieved')
 except Exception as e:o.update(status='retrieval-failed',error=str(e))
 o['elapsedSeconds']=round(time.time()-start,2);return o
with concurrent.futures.ThreadPoolExecutor(max_workers=4)as pool:result=list(pool.map(fetch,sources))
(base/'retrieval-ledger.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8',newline='\n')
print(json.dumps(result,indent=2))
