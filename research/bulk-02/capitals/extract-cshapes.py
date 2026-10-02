"""Extract only published source properties, never geometry or spatial relations."""
import hashlib,json,lzma,pathlib
base=pathlib.Path('research/bulk-02/capitals')
raw=base/'cache/cshapes_2_gw.topojson.xz'
obj=json.loads(lzma.decompress(raw.read_bytes()))
props=[g['properties'] for g in obj['objects']['cshapes_2_gw']['geometries']]
assert len(props)==710
assert set(('country_name','start','end','capname','fid')).issubset(props[0])
(base/'cshapes-attributes.json').write_text(json.dumps(props,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'attributes':len(props),'originalSha256':hashlib.sha256(raw.read_bytes()).hexdigest(),'extractedSha256':hashlib.sha256((base/'cshapes-attributes.json').read_bytes()).hexdigest()}))
