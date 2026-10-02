"""Full-source screening only. Undated nationality/attachment never becomes production truth."""
import csv,gzip,json,hashlib,re,unicodedata,pathlib,collections
base=pathlib.Path('research/completion-03/figures')
def norm(s):
    return re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFKD',str(s)).encode('ascii','ignore').decode().lower())
def number(s):
    try:return float(s)
    except (ValueError,TypeError):return None
context=json.loads((base/'scanner-context.json').read_text())
pantheon=list(csv.DictReader((base/'cache/pantheon.tsv').open(encoding='utf-8-sig'),delimiter='\t'))
people={r['en_curid']:r for r in pantheon}
slots=collections.defaultdict(list)
for s in context['matrix']:slots[s['entityId']].append(s)
aliases=collections.defaultdict(set)
for e in context['entities']:
    for n in e['names']:
        aliases[norm(n.split(' — ')[0])].add(e['id'])
counts=collections.Counter(); strong=[]; by_domain=collections.Counter(); slot_candidates=collections.defaultdict(list)
with gzip.open(base/'cache/cross-verified.csv.gz','rt',encoding='utf-8',errors='replace',newline='') as f:
    reader=csv.DictReader(f); headers=reader.fieldnames
    for r in reader:
        counts['totalSourceRecords']+=1
        if any('\ufffd' in str(v) for v in r.values()):
            counts['encodingReviewRecords']+=1
            continue # Preserve original compressed bytes; never repair a person's identity silently.
        b,d=number(r['birth']),number(r['death'])
        if b is None or b>1960 or (d is not None and d<1800):continue
        counts['lifespanWindowCandidates']+=1
        if (number(r['number_wiki_editions']) or 0)<2:continue
        counts['atLeastTwoWikipediaEditions']+=1
        p=people.get(str(r['curid']).split('.')[0])
        if not p or norm(p['name'])!=norm(r['name'].replace('_',' ')):continue
        counts['independentlyMatchedPantheonPeople']+=1
        # General political officeholding is deliberately excluded from this cheap tranche.
        if p['occupation'] in ('POLITICIAN','RELIGIOUS FIGURE','ATHLETE','COACH') or p['domain']=='SPORTS':continue
        counts['nonOfficeholdingSignificanceCandidates']+=1
        by_domain[p['occupation']]+=1
        candidate={k:r[k] for k in ['wikidata_code','name','birth','death','level1_main_occ','level3_main_occ','number_wiki_editions','ranking_visib_5criteria','area1_of_rattachment','area2_of_rattachment']}
        candidate.update(pantheonId=p['en_curid'],pantheonOccupation=p['occupation'],pantheonHPI=p['HPI'])
        strong.append(candidate)
        ids=set().union(*(aliases.get(norm(r[k]),set()) for k in ['area1_of_rattachment','area2_of_rattachment']))
        for id in ids:
            for s in slots[id]:
                y=s['year']
                if b+18<=y and d is not None and y<d:
                    counts['candidatePersonSnapshotAssociations']+=1
                    slot_candidates[(id,y,s['status'])].append(candidate)
counts['candidateAtlasSlots']=len(slot_candidates)
counts['alreadySupportedCandidateSlots']=sum(k[2]=='supported' for k in slot_candidates)
counts['unresolvedCandidateSlots']=sum(k[2]!='supported' for k in slot_candidates)
report={
 'counts':dict(counts),'pantheonRecords':len(pantheon),'sourceColumns':headers,
 'occupationDistribution':dict(by_domain),'safeAutomaticNewSlots':0,'exactHighConfidenceHistoricalAssociations':0,
 'ambiguousPersonSnapshotAssociations':counts['candidatePersonSnapshotAssociations'],
 'reason':'Neither lifespan nor undated geographic attachment/citizenship establishes dated activity, contribution or historical polity association. No automatic accepted record is justified by these fields alone.',
 'candidatePolicy':'At least two Wikipedia editions; exact Pantheon page ID AND normalized name; non-officeholding/non-sport occupation; alive adult at snapshot is only a candidate heuristic. Geographic attachment name join is explicitly ambiguous, never nationality or production mapping.',
 'sources':[{'path':str(base/'cache'/n),'sha256':hashlib.file_digest((base/'cache'/n).open('rb'),'sha256').hexdigest()} for n in ['cross-verified.csv.gz','pantheon.tsv']],
 'productionModified':False,'browserChecks':0}
(base/'yield.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
# Preserve bounded strong candidates, not a replacement distribution of the full dataset.
pool=[{'entityId':id,'year':y,'existingStatus':status,'state':'held','reason':report['reason'],'candidates':sorted(v,key=lambda r:-(number(r['pantheonHPI']) or 0))[:3]} for (id,y,status),v in sorted(slot_candidates.items())]
(base/'held-candidates.json').write_text(json.dumps(pool,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report['counts']));print('Safe new slots: 0; full-source association limitation held, not repaired.')
