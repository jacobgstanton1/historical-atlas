"""Independent original CSV parse and codebook text access; no intake parser reuse."""
import csv,json,pathlib
from pypdf import PdfReader
base=pathlib.Path('research/bulk-02/events')
rows=list(csv.DictReader((base/'cache/Inter-StateWarData_v4.0.csv').open(encoding='utf-8-sig',newline='')))
assert len(rows)==337
(base/'independent-original-csv-rows.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(base/'cache/independent-codebook-text.txt').write_text('\n'.join(p.extract_text() for p in PdfReader(base/'cache/Inter-StateWars_Codebook.pdf').pages),encoding='utf-8')
