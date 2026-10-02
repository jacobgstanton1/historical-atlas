"""WGS84 geodesic area of actual atlas polygons; no sovereignty inference."""
import hashlib,json,math,pathlib,sys,unicodedata,re
from shapely.geometry import Polygon,MultiPolygon
from shapely.ops import unary_union
from shapely.validation import explain_validity
from pyproj import Geod
BASE=pathlib.Path(__file__).parent
GEOD=Geod(ellps='WGS84')
def digest(v):return hashlib.sha256(json.dumps(v,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()).hexdigest()
def unwrap(ring,anchor=0):
    if len(ring)<4 or ring[0][:2]!=ring[-1][:2]:raise ValueError('Unclosed/short ring')
    result=[]
    for point in ring:
        x,y=point[:2]
        if not math.isfinite(x+y) or not -90<=y<=90 or not -180<=x<=180:raise ValueError('Invalid coordinate')
        if result:
            while x-result[-1][0]>180:x-=360
            while x-result[-1][0]<-180:x+=360
        result.append((x,y))
    center=sum(x for x,y in result[:-1])/(len(result)-1)
    shift=round((anchor-center)/360)*360
    return [(x+shift,y) for x,y in result]
def polygon(coords,anchor=0):
    outer=unwrap(coords[0],anchor)
    center=sum(x for x,y in outer[:-1])/(len(outer)-1)
    p=Polygon(outer,[unwrap(r,center) for r in coords[1:]])
    if not p.is_valid:raise ValueError('Invalid source polygon: '+explain_validity(p))
    return p
def parts(g):
    if g['type']=='Polygon':return [g['coordinates']]
    if g['type']=='MultiPolygon':return g['coordinates']
    raise ValueError('Non-polygon geometry')
def ring_area(ring):
    xy=list(ring.coords)
    return abs(GEOD.polygon_area_perimeter([p[0] for p in xy],[p[1] for p in xy])[0])/1e6
def mapped_area(geometries):
    polygons=[]
    for g in geometries:
        for coords in parts(g):polygons.append(polygon(coords))
    if not polygons:raise ValueError('No polygons')
    # Use one longitude frame for union, without changing geographic positions.
    anchor=polygons[0].centroid.x
    from shapely.affinity import translate
    polygons=[translate(p,xoff=round((anchor-p.centroid.x)/360)*360) for p in polygons]
    merged=unary_union(polygons)
    if not merged.is_valid:raise ValueError('Invalid polygon union')
    if not isinstance(merged,(Polygon,MultiPolygon)):raise ValueError('Non-area union')
    pieces=[merged] if isinstance(merged,Polygon) else list(merged.geoms)
    area=sum(ring_area(p.exterior)-sum(ring_area(h) for h in p.interiors) for p in pieces)
    if not math.isfinite(area) or not 0<area<255_000_000:raise ValueError('Nonpositive/hemisphere-scale area')
    return area
def run():
    root=BASE.parents[2]
    matrix=json.loads((BASE/'baseline.json').read_text(encoding='utf-8-sig'))
    manifest=json.loads((root/'development/coverage/manifest.json').read_text(encoding='utf-8-sig'))
    entities={e['id']:e for e in json.loads((root/'data/historical-entities.json').read_text(encoding='utf-8-sig'))['entities']}
    observations=[];held=[];inputs=[];cache={};features_processed=0
    for year in sorted(set(r['snapshotYear'] for r in matrix['rows'])):
        path=BASE/f'cache/world_{year}.geojson'
        # Fail closed if the deployed app has a preferred local snapshot we did not use.
        if (root/f'data/world_{year}.geojson').exists():raise ValueError('Preferred local snapshot requires explicit intake')
        raw=path.read_bytes();inputs.append({'path':str(path.relative_to(root)).replace('\\','/'),'sha256':hashlib.sha256(raw).hexdigest()})
        collection=json.loads(raw)
        if collection.get('type')!='FeatureCollection':raise ValueError('Invalid snapshot collection')
        names={};counts={}
        for identity in manifest['identities']:
            occurrence=next((o for o in identity.get('occurrences',[]) if o['year']==year),None)
            if occurrence:
                counts[identity['stableMapId']]=occurrence['featureCount']
                for name in occurrence['names']:
                    if name in names and names[name]!=identity['stableMapId']:raise ValueError('Ambiguous manifest name')
                    names[name]=identity['stableMapId']
        groups={}
        for f in collection['features']:
            if not f.get('geometry'):continue
            p=f.get('properties') or {}
            name=str(p.get('display_name',p.get('NAME',p.get('name',p.get('SUBJECTO',''))))).strip()
            mapid=p.get('stable_id') or names.get(name)
            if mapid:groups.setdefault(mapid,[]).append(f['geometry'])
        for row in [r for r in matrix['rows'] if r['snapshotYear']==year and r['categories']['area-statistics']['status']!='supported']:
            try:
                if row.get('mappingPartial'):raise ValueError('Partial year/entity mapping')
                e=entities[row['entityId']]['existence']
                start=e['validFrom'];end=e.get('validUntil','1961-01-01')
                if start>f'{year}-01-01' or end<f'{year+1}-01-01':raise ValueError('Annual snapshot precision exceeds entity validity envelope')
                geometries=[]
                for mapid in row['mapIds']:
                    selected=groups.get(mapid,[])
                    if len(selected)!=counts.get(mapid):raise ValueError('Source/manifest feature-count mismatch: '+mapid)
                    if not selected:raise ValueError('Missing exact snapshot geometry')
                    geometries.extend(selected)
                features_processed+=len(geometries)
                geometry_hash=digest(sorted(geometries,key=digest))
                if geometry_hash not in cache:cache[geometry_hash]=mapped_area(geometries)
                area=cache[geometry_hash]
                observations.append({'entityId':row['entityId'],'year':year,'mapIds':row['mapIds'],'geometryHash':geometry_hash,'rawAreaKm2':area,'areaKm2':float(f'{area:.3g}'),'featureCount':len(geometries),'boundarySource':inputs[-1]})
            except (ValueError,KeyError,TypeError) as error:held.append({'entityId':row['entityId'],'year':year,'reason':str(error)})
    output={'method':'WGS84 ellipsoidal geodesic polygon area, holes subtracted, exact duplicate/overlap union, antimeridian longitude unwrapping, three significant digits. No geometry repair, historical ownership or official statistical assertion.','libraries':{'pyproj':'3.7.2','shapely':'2.1.2'},'recordsProcessed':sum(r['categories']['area-statistics']['status']!='supported' for r in matrix['rows']),'sourceFeaturesProcessed':features_processed,'uniqueGeometryCalculations':len(cache),'observations':observations,'held':held,'inputBindings':inputs}
    (BASE/'derived-observations.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print(json.dumps({k:output[k] for k in ['recordsProcessed','sourceFeaturesProcessed','uniqueGeometryCalculations']}|{'acceptedCandidates':len(observations),'held':len(held)}))
if __name__=='__main__':run()
