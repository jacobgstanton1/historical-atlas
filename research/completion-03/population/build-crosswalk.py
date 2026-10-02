"""Bounded coordinator crosswalk, not a fuzzy-name production matcher.
Appendix I historical-border units; appendix II/1991 series never used.
Rules below designate the source statistical unit, not retrospective nationality.
"""
import json
from pathlib import Path
B=Path('research/completion-03/population')
def read(p):return json.loads(Path(p).read_text(encoding='utf-8'))
matrix=read('research/completion-01/reports/completion.json'); entities=read(B/'entities.json'); obs=read(B/'observations.json')
# Source polity, permitted registry IDs/prefixes, approved period, geographic qualification.
rules=[
 ('Belgium',['belgium-kingdom'],1839,1938,'Belgian national territory after the 1839 settlement; excludes colonial Congo.'),
 ('France',['france-political-frameworks'],1871,1938,'Metropolitan France at the source-year borders; overseas colonies excluded. Appendix I explicitly adjusts Alsace-Lorraine and includes occupied metropolitan departments in 1914–1918.'),
 ('Germany',['germany-imperial-framework'],1871,1917,'Imperial German statistical territory, including Alsace-Lorraine; excludes overseas colonies. Pre-unification aggregate and Weimar Saar discrepancy excluded.'),
 ('Austria-Hungary',['austria-hungary-dual-framework'],1867,1917,'Whole dual-monarchy statistical unit. Bosnia treatment remains explicitly qualified in Appendix I; source includes separate Bosnia component in the aggregate.'),
 ('Austria',['austria-first-republic-framework'],1921,1937,'Austrian Republic statistical territory after the postwar settlement; excludes 1920 boundary transition and 1938 annexation.'),
 ('Hungary',['hungary-horthy-framework'],1921,1937,'Post-Trianon Hungary; excludes unsettled 1920 and 1938 territorial changes.'),
 ('Czechoslowakia',['czechoslovakia-first-republic-framework'],1921,1937,'First Czechoslovak Republic; excludes 1920 boundary settlements and 1938 territorial dismemberment.'),
 ('Denmark',['denmark-post-kiel'],1816,1938,'Denmark proper, excluding Norway, Greenland, Iceland and ducal territories; 1920 northern-Schleswig transfer held.'),
 ('Finland',['finland-grand-duchy','finland-independent'],1809,1938,'Finnish statistical territory, separately enumerated from Russia. Exact annual estimate retains its own historical scope.'),
 ('Iceland',['iceland-danish-administration','iceland-sovereign'],1800,1938,'Icelandic island statistical territory; no Danish metropolitan total assigned.'),
 ('Ireland',['ireland-independent'],1923,1938,'Irish Free State/Eire 26-county statistical unit; source explicitly excludes Northern Ireland and provides a separate post-1922 series.'),
 ('Italy',['italy-liberal-monarchy-framework','italy-fascist-monarchical-framework'],1862,1938,'Italian metropolitan national territory; source Appendix I accounts for national boundary changes. Colonial African possessions excluded.'),
 ('Latvia',['latvian-constituent-framework','latvian-saeima-framework','latvian-cabinet-legislative-framework'],1921,1938,'Latvian Republic national statistical territory; unsettled 1920 held.'),
 ('Estonia',['estonian-constituent-framework','estonian-fourth-parliament-framework','estonian-1938-presidential-framework'],1921,1938,'Estonian Republic national statistical territory; unsettled 1920 held.'),
 ('Lithuania',['lithuanian-constituent-seimas-framework','lithuanian-no-seimas-framework'],1924,1938,'Lithuanian Republic source territory with Klaipeda, excluding Polish-controlled Vilnius; early boundary transitions held.'),
 ('Netherlands',['netherlands-kingdom'],1840,1938,'European Netherlands after Belgian separation; excludes East Indies and Caribbean territories.'),
 ('Norway',['norway-constitutional-kingdom'],1906,1938,'Independent Norwegian statistical territory; separate Norwegian values not assigned to the Sweden–Norway composite.'),
 ('Poland',['polish-small-constitution-framework','polish-amended-march-framework','polish-april-presidential-framework'],1922,1938,'Interwar Polish Republic historical-border series; excludes unsettled 1920 and any retrospective modern-border reconstruction.'),
 ('Portugal',['portugal-political-frameworks'],1816,1938,'Portuguese European statistical territory, with Atlantic islands as specified by Appendix I; excludes Brazil and overseas African/Asian administrations.'),
 ('Romania',['romanian-independent-principality-framework','romanian-1923-monarchical-framework'],1879,1938,'Romanian source-year national territory; 1878 settlement year and 1920 enlarged-border transition held.'),
 ('Spain',['spain-political-frameworks'],1800,1935,'Spanish metropolitan statistical territory; overseas empire excluded. Civil-war 1938 source grade D held.'),
 ('Sweden',['sweden-kingdom'],1809,1938,'Swedish statistical territory, not the Denmark/Norway or Sweden/Norway union. 1800 includes a Finnish-scope caution and is held.'),
 ('Switzerland',['swiss-federal-state','swiss-confederation-1815'],1816,1938,'Swiss national statistical territory, separated from the early Helvetic framework.'),
 ('United Kingdom',['united-kingdom'],1802,1938,'United Kingdom domestic statistical territory: whole Ireland to 1921, Northern Ireland thereafter; no imperial dependencies. Source Appendix I explicitly sums the appropriate constituent regions.'),
 ('Albania',['albanian-royal-statute-framework'],1929,1938,'Albanian national territory in the interwar kingdom; earlier grade-D figures held.'),
 ('Andorra',['andorra-historic-coprincipality'],1920,1938,'Andorran territorial unit, source grade C retained.'),
 ('Malta',['malta-british-administration'],1816,1938,'Maltese island-group statistical territory under British administration.'),
 ('Gibraltar',['gibraltar-'],1816,1938,'Gibraltar territorial statistical unit, no Iberian total.'),
 ('Serbia/Yugoslavia',['serbian-independent-principality-framework','serbian-1903-royal-parliamentary-framework'],1831,1913,'Serbian national territory before the wartime and successor-state boundary transitions; no automatic Serbia-to-Yugoslavia succession.'),
 ('Serbia/Yugoslavia',['yugoslav-royal-authoritarian-framework'],1929,1938,'Kingdom of Yugoslavia statistical territory after the successor-state settlement, not a modern Serbian series.'),
 ('Argentina',['argentina-pre-1930-federal-framework'],1881,1929,'Argentine national statistical territory, not the earlier Rio de la Plata viceroyalty or provisional federation.'),
 ('Bolivia',['bolivia-late-1880-constitutional-framework'],1885,1934,'Bolivian national statistical territory following the Pacific territorial settlement; Chaco-war boundary period held.'),
 ('Brasil',['brazil-pedro-ii-imperial-framework','brazil-early-federal-republic-framework','brazil-estado-novo-framework'],1870,1938,'Brazilian national statistical territory under its existing historical framework; excludes Portuguese metropole.'),
 ('Chile',['chile-late-1833-framework','chile-parliamentary-practice-framework','chile-restored-presidential-framework'],1885,1938,'Chilean national statistical territory after the Pacific-war annexation; 1878/1880 transition and later disputed Tacna scope held pending reconciliation.'),
 ('Colombia',['colombia-united-states-framework','colombia-thousand-days-framework'],1864,1902,'Colombian national territory before separation of Panama; source-year whole polity rather than modern-border Colombia.'),
 ('British Guiana',['british-guiana-court-policy-framework','british-guiana-crown-colony-framework'],1832,1938,'British Guiana colonial statistical unit; Dutch Suriname and French Guiana separately reported.'),
 ('British Honduras (Belize)',['b10-british-honduras-appointed-council'],1863,1938,'British Honduras colonial statistical territory, not independent Honduras.'),
 ('Danish Virgin Island',['b11-virgin-islands-danish','b11-virgin-islands-us-early','b11-virgin-islands-organic'],1800,1938,'The same Danish/US Virgin island group with dated administration retained; British Virgin Islands excluded.'),
 ('Dominican Republic',['b10-dominican-us-military','b10-dominican-trujillo'],1917,1938,'Dominican territorial statistical unit; Haitian part of Hispaniola excluded.'),
 ('Ecuador',['ecuador-1906-liberal-framework'],1907,1938,'Ecuadorian source-year national statistical territory; later 1941 boundary settlement not projected backward.'),
 ('El Salvador',['b10-salvador-martinez'],1932,1938,'Salvadoran national statistical unit, source grade C retained.'),
 ('Honduras',['b10-honduras-carias'],1934,1938,'Independent Honduran national unit, distinct from British Honduras.'),
 ('French Guiana (French Colonies)',['french-guiana-colonial-framework'],1816,1938,'French Guiana colonial statistical territory; no neighbouring Guiana units combined.'),
 ('Guadalupe (French Colonies)',['b10-guadeloupe-colonial'],1816,1938,'Guadeloupe colonial statistical group; source territorial component definitions retained.'),
 ('Granada (Winward Island)',['b10-grenada-crown-colony'],1816,1938,'Grenada statistical unit; not the whole Windward federation.'),
 ('Martinique (French Colonies)',['b11-martinique-colony'],1816,1938,'Martinique colonial island statistical territory.'),
 ('Mexico',['mexico-porfirian-framework','mexico-1917-constitutional-framework'],1868,1938,'Mexican national historical statistical territory; not New Spain viceroyalty.'),
 ('New Foundland',['newfoundland-responsible-dominion-framework','newfoundland-commission-framework'],1910,1938,'Newfoundland and Labrador statistical territory separate from Canada; historical Labrador delimitation retained by source.'),
 ('Panama',['b10-panama-1904-core'],1905,1938,'Panamanian statistical territory; Canal Zone exclusion/coverage needs independent confirmation, so retained as review only.'),
 ('Paraguay',['paraguay-1870-constitutional-framework'],1871,1932,'Paraguayan national statistical territory; Chaco settlement years held.'),
 ('Peru',['peru-restored-1860-prewar-framework','peru-later-1860-framework'],1861,1938,'Peruvian source-year national unit; Pacific-war territorial and disputed Tacna/Arica coverage requires review.'),
 ('Puerto Rico',['b11-puerto-rico-foraker','b11-puerto-rico-jones'],1901,1938,'Puerto Rican statistical island territory under its dated administration.'),
 ('St.Lucia (Winward Island)',['b11-saint-lucia-'],1816,1938,'Saint Lucia island statistical territory, not the full Windward group.'),
 ('St. Vicente (Winward Island)',['b11-saint-vincent-1936'],1937,1938,'Saint Vincent statistical island-group territory.'),
 ('Surinam (Duch Guayana)',['suriname-koloniale-staten-framework'],1867,1938,'Dutch Suriname colonial statistical territory; distinct from both other Guiana units.'),
 ('Trinidad & Tobago (Winward Island)',['b11-trinidad-tobago-'],1889,1938,'Combined Trinidad and Tobago statistical territory after their administrative union; Trinidad-only framework excluded.'),
 ('Turk&Caicos Island',['b11-turks-caicos-jamaica'],1900,1938,'Turks and Caicos island statistical unit, not Jamaica population.'),
 ('United states',['united-states'],1800,1938,'United States national source-year territory including source-native population correction. Source Appendix I retained; Alaska/Hawaii and overseas territorial coverage require review before automatic import.'),
 ('Uruguay',['uruguay-late-1830-framework','uruguay-dual-executive-framework'],1831,1938,'Uruguayan national statistical territory, not the wider Rio de la Plata unit.'),
 ('Venezuela',['venezuela-guzman-framework','venezuela-castro-framework','venezuela-gomez-framework','venezuela-lopez-framework'],1831,1938,'Venezuelan national statistical territory, separated from Gran Colombia.'),
 ('Bahamas',['b11-bahamas-1909-councils'],1910,1938,'Bahamas colonial archipelago statistical unit.'),
 ('Barbados',['b10-barbados-colonial-parliament'],1816,1938,'Barbados island statistical territory.'),
 ('Ceylon',['ceylon-legislative-council-framework','ceylon-state-council-framework'],1816,1938,'Whole Ceylon colonial island territory after conquest of Kandy, not the earlier coastal-only administration.'),
 ('Dutch East Indies (Indonesia)',['b13-indies-1854-regulation','b13-indies-early-volksraad','b13-indies-staatsregeling'],1855,1938,'Dutch East Indies historical colonial statistical aggregate, not a modern Indonesia reconstruction.'),
 ('Hong-Kong',['hong-kong-historical-administration'],1843,1938,'Hong Kong source-year colony, with New Territories included after acquisition; Macau and mainland China excluded.'),
 ('Japan',['japan-restoration-framework'],1869,1894,'Japanese home-island statistical territory before Taiwan annexation. Later imperial possessions are not assumed included in home-island series.'),
 ('Nepal',['nepal-rana-framework'],1817,1938,'Nepal national territory after the Sugauli settlement.'),
 ('Palestine (Otoman Empire)',['palestine-british-mandate-core'],1923,1938,'Mandate Palestine source unit; Transjordan coverage requires explicit reconciliation and is held.'),
 ('Philippines',['b13-philippines-organic','b13-philippines-jones','b13-philippines-commonwealth'],1903,1938,'Philippine archipelago colonial/Commonwealth statistical territory, distinct from metropole.'),
 ('Ottoman empire(Asia)/Turkey',['turkey-1928-constitutional-framework','turkey-1937-constitutional-framework'],1924,1938,'Republic of Turkey historical national territory; earlier Ottoman Asian-only aggregate not a whole-empire population.'),
 ('Australia',['australia-prewestminster-federal-core'],1902,1938,'Australian Commonwealth statistical territory including reconstructed indigenous population; constituent pre-federation colonies not given national total.'),
 ('New Zealand',['new-zealand-preadoption-dominion-core'],1908,1938,'New Zealand national island statistical territory including Maori reconstruction; Pacific dependencies excluded.'),
 ('Algeria',['algeria-french-colonial-framework'],1872,1938,'Algerian colonial statistical territory; unchanged 2023-series exception explicitly listed in the 2026 workbook SOURCES sheet.'),
 ('Egypt',['egypt-late-khedival-framework','egypt-british-occupied-khedivate-framework','egypt-british-protectorate-framework','egypt-kingdom-treaty-framework'],1867,1938,'Egyptian statistical territory, Sudan separate; unchanged original series documented in the 2026 SOURCES sheet.'),
 ('Tunisia',['tunisia-french-protectorate-framework'],1882,1938,'Tunisian protectorate statistical territory; unchanged original series documented in the 2026 SOURCES sheet.'),
]
review_only={'Panama','Peru','United states','Palestine (Otoman Empire)','Austria-Hungary','Chile'}
crosswalk=[]
for polity,ids,lo,hi,scope in rules:
 for row in matrix['rows']:
  if not lo<=row['snapshotYear']<=hi or not any(row['entityId']==i or (i.endswith('-') and row['entityId'].startswith(i)) for i in ids):continue
  reason='Source historical-border polity unit and existing registry administration correspond; period-specific exclusions applied.'
  confidence='REVIEW' if polity in review_only or (polity=='Denmark' and row['snapshotYear']==1920) else 'HIGH_CONFIDENCE'
  crosswalk.append({'polity':polity,'entityId':row['entityId'],'year':row['snapshotYear'],'confidence':confidence,'scopeRationale':scope,
   'sourceLocator':'Federico–Tena (2025), Appendix I: '+polity+'; construction section 4.1; historical-border continental workbook.',
   'review':{'reviewer':'/root source-wide historical-border and period crosswalk review','rationale':reason}})
out={'policy':'Explicit source-unit / registry-period whitelist. Names alone never approve scope. Source grades D/E/NE and missing quality held. 2026 revised African estimates cannot inherit 2025 quality grades.', 'mappings':crosswalk}
(B/'historical-crosswalk.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Bounded mappings',len(crosswalk),'approved',sum(x['confidence']=='HIGH_CONFIDENCE' for x in crosswalk))
