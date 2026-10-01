# v0.7 Phase 1.5 — political dossier eligibility

Development-only classification overlay. Visible site remains v0.6.1. Phase 2 Batch 01 has been researched; other batches have not begun. See [Batch 01 decisions](BATCH-01.md) for dated acceptance and omissions.

## Two denominators

Raw selectable identities: **880**; raw IDs receiving a curated dossier in at least one present snapshot: **77 (8.75%)**; raw fallback-only IDs: **803**. The original identity/source/presence/mapping inventory remains intact.

Political dossier candidates: **401**; currently covered: **76 (18.95%)**; uncovered political candidates: **325**. Existing curated metadata entities: **98**. Coverage is resolver availability, not completeness throughout 1800–1960. This is a provisional template-eligibility denominator of distinct raw IDs, not a deduplicated count of historical states. It may change after classification/mapping review; no claim of complete political coverage is possible while unresolved cases remain.

| Classification | Raw IDs |
| --- | ---: |
| political-polity | 223 |
| dependent-administration | 178 |
| community-people | 398 |
| geographic-or-composite | 2 |
| name-variant-or-duplicate | 7 |
| unresolved | 72 |

400 community/geographic IDs are outside automatic political templates. Name reviews and unresolved IDs are not silently counted as missing political dossiers. All decisions remain revisable.

## Classification methodology and limits

Explicit per-ID decisions reviewed from locked source names, Phase 1 families and current curated profiles. Cohort membership is stored by stable ID, never inferred from polygon location at regeneration. Unresolved and duplicate candidates are excluded from the political denominator pending evidence. Categories are inventory-level scheduling decisions; historical status may change by requested year.

A classification applies to the inventory identity, not every historical period. A political-polity candidate may have colonial/occupation periods; a dependent-administration candidate may later become a polity. Eligibility means the template can be useful, not that sovereignty, constitutions, capitals or other facts are established. Source authority fields are evidence requiring interpretation, never sovereignty findings. No historical institutions or facts are inferred from geometry. Explicit source-label decisions live in classification-plan.json, with confidence, rationale, evidence references and canonical candidates. Generated manifest fields also include unresolved classification questions and current dated mappings.

The [upstream documentation](https://github.com/aourednik/historical-basemaps) describes both countries and cultural regions and cultural PARTOF groupings. [AIATSIS methodology](https://aiatsis.gov.au/explore/map-indigenous-australia) explains language/social/nation labels, approximate boundaries and spelling variation; this is methodological context, not proof that this dataset derives from its map. Accessed 2026-10-01. The classification methodology remains unchanged; historical research progress is recorded per batch.

## Classification and political coverage by snapshot

| Year | Raw | Polity | Dependent | Community | Geographic/composite | Variant | Unresolved | Political candidates | Covered | Uncovered | Coverage |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1800 | 547 | 90 | 31 | 392 | 2 | 1 | 31 | 121 | 17 | 104 | 14.05% |
| 1815 | 313 | 86 | 38 | 164 | 1 | 0 | 24 | 124 | 31 | 93 | 25% |
| 1878 | 173 | 87 | 55 | 7 | 1 | 3 | 20 | 142 | 22 | 120 | 15.49% |
| 1880 | 170 | 88 | 55 | 5 | 1 | 1 | 20 | 143 | 22 | 121 | 15.38% |
| 1900 | 166 | 86 | 53 | 4 | 1 | 1 | 21 | 139 | 21 | 118 | 15.11% |
| 1914 | 143 | 72 | 64 | 0 | 1 | 1 | 5 | 136 | 23 | 113 | 16.91% |
| 1920 | 164 | 82 | 68 | 0 | 1 | 2 | 11 | 150 | 24 | 126 | 16% |
| 1930 | 164 | 82 | 69 | 0 | 1 | 2 | 10 | 151 | 24 | 127 | 15.89% |
| 1938 | 172 | 85 | 77 | 0 | 1 | 3 | 6 | 162 | 23 | 139 | 14.2% |
| 1945 | 183 | 89 | 80 | 0 | 1 | 1 | 12 | 169 | 31 | 138 | 18.34% |
| 1960 | 157 | 97 | 50 | 0 | 1 | 1 | 8 | 147 | 30 | 117 | 20.41% |

The 1800 denominator is explained by its classification table, not modern-country assumptions. Of the 377 explicitly recorded Australian community cohort IDs, 377 appear in 1800. None is counted as an uncovered political dossier or assigned a political research batch. All remain selectable in production. They are deferred to a separately designed, community-appropriate profile project; this says nothing about political significance or organisation.

## What the Phase 1 questions actually mean

The original **261 records / 818 affected IDs** remain traceable; they do not represent that many independently discovered historical mysteries.

| Review scope | Legacy records |
| --- | ---: |
| family-level-review | 19 |
| identity-attached-source-caution | 229 |
| identity-specific-review | 10 |
| source-wide-caution | 3 |

Identity-attached source cautions are automated gaps/authority-field observations. Source-wide cautions cover repeated names, normalization and the community cohort. Family questions are shared continuity tasks; identity-specific legacy scope flags are also review prompts, not proven classification failures.

There are **72 unresolved classifications**, **7 variant reviews**, **3 occupation-label spelling reviews**, and the existing runtime mapping-date mismatch. After deduplicating raw IDs, **83 identity-specific unresolved review cases** remain. Specific unresolved cases are unresolved/variant classification decisions, explicit occupation-label repairs and the observed runtime existence-date mismatch, deduplicated by raw ID. These are bounded review tasks, not proven historical mysteries. Gap/authority/repeated-name warnings do not independently establish classification uncertainty.

## Canonical-name candidates (no merges)

| Source label | Classification | Candidate | Status/reason |
| --- | --- | --- | --- |
| Austria Hungary | name-variant-or-duplicate | Austro-Hungarian Empire (entity-austro-hungarian-empire) | requires-evidence; Alternative source wording for a candidate composite-monarchy identity; no automatic constitutional equivalence. |
| Cyraneica (UK Lybia) | dependent-administration | Cyrenaica (UK occupation administration) (no canonical raw ID) | requires-evidence; Reviewed candidate administrative/colonial/constituent/occupation territory. Political dossier can describe its actual administration without claiming sovereignty. Label/date accuracy, boundaries of the administration and changes to polity status require evidence. This inventory-level category does not apply uniformly to every year. |
| Fezzan (Frech Lybia) | dependent-administration | Fezzan (French occupation administration) (no canonical raw ID) | requires-evidence; Reviewed candidate administrative/colonial/constituent/occupation territory. Political dossier can describe its actual administration without claiming sovereignty. Label/date accuracy, boundaries of the administration and changes to polity status require evidence. This inventory-level category does not apply uniformly to every year. |
| French Indo-China | name-variant-or-duplicate | French Indochina (entity-french-indochina) | requires-evidence; Hyphenation-only candidate naming duplicate within the existing colonial family. Administrative scope/dates still require evidence. |
| Gambia, The | name-variant-or-duplicate | Gambia (entity-gambia) | requires-evidence; Article/order variant; candidate mapping still requires historical periods and administrative scope. |
| Luisiana | name-variant-or-duplicate | Louisiana (no canonical raw ID) | requires-evidence; Likely spelling variant of Louisiana; no raw Louisiana identity exists. Establish which historical administration is intended. |
| M?ori | name-variant-or-duplicate | Māori (entity-maori) | requires-evidence; Visible replacement character suggests encoding corruption; candidate is a community label, never New Zealand. |
| Sultinate of Zanzibar | name-variant-or-duplicate | Sultanate of Zanzibar (entity-sultanate-of-zanzibar) | requires-evidence; Obvious source spelling error; candidate equivalence still needs date/scope review. |
| Tripolitana (UK Lybia) | dependent-administration | Tripolitania (UK occupation administration) (no canonical raw ID) | requires-evidence; Reviewed candidate administrative/colonial/constituent/occupation territory. Political dossier can describe its actual administration without claiming sovereignty. Label/date accuracy, boundaries of the administration and changes to polity status require evidence. This inventory-level category does not apply uniformly to every year. |
| Walbis Bay | name-variant-or-duplicate | Walvis Bay (no canonical raw ID) | requires-evidence; Likely spelling variant of Walvis Bay; no canonical raw ID exists. Administrative identity/date review required. |

Māori source aliases already normalized by production remain in sourceNames; M?ori remains its own raw ID and a community-name review. It is not equivalent to New Zealand. Occupation labels (Germany France/Soviet/UK/USA; Japan USA; Korea USA/USSR) are dependent-administration candidates. Libyan spelling repairs retain distinct occupation administrations and are not merged into earlier regions or later states. Renamed/regime labels such as Germany, Imperial Japan and Empire of Japan remain separate political candidates with family review, not presumed duplicates.

## Unresolved classification gate

These cases must establish their referent/template fit before political research eligibility is accepted. They are kept in a separate review queue, not silently discarded or populated with modern facts.

- Abyssinia (entity-abyssinia), snapshots 1914: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Accra (entity-accra), snapshots 1900: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Air (entity-air), snapshots 1800: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Algiers (entity-algiers), snapshots 1800, 1815: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Ambur (entity-ambur), snapshots 1800: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Annam (entity-annam), snapshots 1815, 1878, 1880, 1920, 1930, 1945: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Arabia (entity-arabia), snapshots 1878, 1880, 1900: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Arabia (Nejd) (entity-arabia-nejd), snapshots 1914: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Arakan (entity-arakan), snapshots 1800, 1815: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Assam (entity-assam), snapshots 1815: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Ato trading confederacy (entity-ato-trading-confederacy), snapshots 1878, 1880, 1900: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Bangladesh (entity-bangladesh), snapshots 1945: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Barotse (entity-barotse), snapshots 1878, 1880, 1900: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Borgu States (entity-borgu-states), snapshots 1878, 1880, 1900: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- British Protectorate (entity-british-protectorate), snapshots 1914: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Bundelkhand (entity-bundelkhand), snapshots 1800: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Calabar (entity-calabar), snapshots 1878, 1880, 1900: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Carnatic (entity-carnatic), snapshots 1800: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- central Asian khanates (entity-central-asian-khanates), snapshots 1800, 1815, 1878, 1880, 1900: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Chinese Warlords (entity-chinese-warlords), snapshots 1920, 1930, 1938: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Circars (entity-circars), snapshots 1800: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Cochin China (entity-cochin-china), snapshots 1800, 1815, 1920, 1930, 1938, 1945: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Congo (entity-congo), snapshots 1800, 1815, 1878, 1880, 1900, 1945, 1960: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Cotonou (entity-cotonou), snapshots 1878, 1880, 1900: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Cuxhaven (entity-cuxhaven), snapshots 1800, 1815: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Cyprus (entity-cyprus), snapshots 1960: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Cyrenaica (entity-cyrenaica), snapshots 1800, 1815: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Dutch settlements (entity-dutch-settlements), snapshots 1800: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Fante (entity-fante), snapshots 1815: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Far Eastern SSR (entity-far-eastern-ssr), snapshots 1920, 1930: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Finnmark (entity-finnmark), snapshots 1800: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Fivizzano (entity-fivizzano), snapshots 1800, 1815: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Gooty (entity-gooty), snapshots 1800: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Guiana (entity-guiana), snapshots 1815: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Hausa States (entity-hausa-states), snapshots 1800: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Ibadan (entity-ibadan), snapshots 1878, 1880, 1900: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Kanara (entity-kanara), snapshots 1800: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Kong (entity-kong), snapshots 1900: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Kuril Islands (entity-kuril-islands), snapshots 1800, 1815: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Lozi (entity-lozi), snapshots 1800, 1815, 1878, 1880, 1900: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Malabar (entity-malabar), snapshots 1800: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Malaysia (entity-malaysia), snapshots 1920, 1930, 1938, 1945, 1960: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Mali (entity-mali), snapshots 1945, 1960: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Manchuria (entity-manchuria), snapshots 1920, 1930, 1945: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Massa (entity-massa), snapshots 1800, 1815: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Mbailundu (entity-mbailundu), snapshots 1878, 1880, 1900: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Mirambo Unyanyembe Ukimbu (entity-mirambo-unyanyembe-ukimbu), snapshots 1878, 1880, 1900: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Mossi States (entity-mossi-states), snapshots 1800, 1815, 1878, 1880, 1900: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Ndebele (entity-ndebele), snapshots 1878, 1880, 1900: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Nejd (entity-nejd), snapshots 1800, 1815: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Ngwato (entity-ngwato), snapshots 1878, 1880, 1900: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Palatinate (entity-palatinate), snapshots 1815: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Pontremoli (entity-pontremoli), snapshots 1800, 1815: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Rabih az-Zubayr (entity-rabih-az-zubayr), snapshots 1878, 1880: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Rapa Nui (entity-rapa-nui), snapshots 1900, 1914, 1920, 1930, 1938, 1945, 1960: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Rift Valley States (entity-rift-valley-states), snapshots 1800: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Sikhs (entity-sikhs), snapshots 1800: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- South Russia (entity-south-russia), snapshots 1920: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Swabia (entity-swabia), snapshots 1800: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Tanzania, United Republic of (entity-tanzania-united-republic-of), snapshots 1920, 1930, 1938, 1945, 1960: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Teke (entity-teke), snapshots 1878, 1880, 1900: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Thuringia (entity-thuringia), snapshots 1800, 1815: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Tripolitania (entity-tripolitania), snapshots 1800, 1815: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Turan (entity-turan), snapshots 1815: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- United Arab Emirates (entity-united-arab-emirates), snapshots 1945, 1960: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Wetzlar (entity-wetzlar), snapshots 1815: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- White Russia (entity-white-russia), snapshots 1920, 1930: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Xinjiang (entity-xinjiang), snapshots 1914, 1920, 1930, 1938, 1945: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Yaka (entity-yaka), snapshots 1878, 1880, 1900: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Yeke (entity-yeke), snapshots 1878, 1880, 1900: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Zaire (entity-zaire), snapshots 1945, 1960: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.
- Zulu (entity-zulu), snapshots 1800, 1815: Insufficient Phase 1 source-label evidence to distinguish polity, administration, people or composite geography. Establish the historical referent and date/scope before dossier eligibility.

## Phase 2 political research batches (current per-batch review states)

21 batches partition all 401 political candidates plus 6 necessary political naming reviews exactly once. A community encoding review is routed separately. Unresolved family members appear as classification prerequisites; resolve eligibility before collecting dossier facts. The original Phase 1 47-batch raw audit remains in the appendix/manifest.batches for provenance, and is superseded as a political research plan.

Early source-family batches prioritise long snapshot presence, broad period potential and national archival/constitutional collections. Source availability is a planning expectation, not an entity-by-entity research finding. Families remain indivisible; no periods are researched now.

Families and candidate canonical pairs are indivisible. Batch sizes aim for 15–30; small regional groups remain smaller rather than inventing identities. Snapshot persistence contributes to within-region ordering. Institutional source discovery can be shared, but each dated fact requires its own entity-specific evidence. Source availability expectations are not researched findings.

| Order | Group | IDs incl. reviews | Political candidates | Uncovered | Name reviews |
| --- | --- | ---: | ---: | ---: | ---: |
| 1 | Western/Northern Europe | 24 | 24 | 1 | 0 |
| 2 | East Asia | 17 | 17 | 1 | 0 |
| 3 | Central Europe and German/Italian source families | 17 | 16 | 0 | 1 |
| 4 | Central Europe and German/Italian source families | 21 | 21 | 3 | 0 |
| 5 | Central Europe and German/Italian source families | 15 | 15 | 15 | 0 |
| 6 | Eastern Europe, Russian/Soviet and Balkan source families | 18 | 18 | 17 | 0 |
| 7 | South/Central Asia | 26 | 26 | 25 | 0 |
| 8 | North America | 10 | 9 | 8 | 1 |
| 9 | South America | 20 | 20 | 20 | 0 |
| 10 | Caribbean and Central America | 18 | 18 | 18 | 0 |
| 11 | Caribbean and Central America | 15 | 15 | 15 | 0 |
| 12 | Middle East and Arabian source families | 27 | 27 | 27 | 0 |
| 13 | Southeast Asia | 17 | 16 | 16 | 1 |
| 14 | North Africa and Saharan source families | 18 | 18 | 18 | 0 |
| 15 | West Africa | 25 | 24 | 24 | 1 |
| 16 | West Africa | 15 | 15 | 15 | 0 |
| 17 | Central Africa | 30 | 30 | 30 | 0 |
| 18 | East Africa and Horn | 19 | 18 | 18 | 1 |
| 19 | Southern Africa | 16 | 16 | 16 | 0 |
| 20 | Southern Africa | 15 | 14 | 14 | 1 |
| 21 | Pacific/Oceania states and administrations | 24 | 24 | 24 | 0 |

### political-batch-01 — Western/Northern Europe

State: researched-with-partial-coverage. Included: Denmark (entity-denmark); Denmark-Norway (entity-denmark-norway); Norway (entity-norway); Sweden (entity-sweden); Sweden–Norway (entity-sweden-norway); Ireland (entity-ireland); Kingdom of Ireland (entity-kingdom-of-ireland); United Kingdom (entity-united-kingdom); United Kingdom of Great Britain and Ireland (entity-united-kingdom-of-great-britain-and-ireland); France (entity-france); Portugal (entity-portugal); Spain (entity-spain); Switzerland (entity-switzerland); Netherlands (entity-netherlands); Luxembourg (entity-luxembourg); Belgium (entity-belgium); Iceland (entity-iceland); Finland (entity-finland); Malta (entity-malta); Andorra (entity-andorra); Austrian Netherlands (entity-austrian-netherlands); Batavian Republic (entity-batavian-republic); Helvetic Republic (entity-helvetic-republic); San Marino (entity-san-marino).

High-value continuing/source-family candidates: Denmark (entity-denmark); Norway (entity-norway); Sweden (entity-sweden); Sweden–Norway (entity-sweden-norway); United Kingdom (entity-united-kingdom); United Kingdom of Great Britain and Ireland (entity-united-kingdom-of-great-britain-and-ireland); France (entity-france); Portugal (entity-portugal); Spain (entity-spain); Switzerland (entity-switzerland); Netherlands (entity-netherlands); Luxembourg (entity-luxembourg); Belgium (entity-belgium).

Shared source discovery: National archives, parliaments, royal archives and statistical libraries; dates and offices remain entity-specific.

Difficult continuity cases: Review British and Irish name/state/union continuity. Do not extend the current UK profile backward simply because an ID repeats. Review Scandinavian union labels and constituent governments without assuming that a source-name change establishes state succession.


### political-batch-02 — East Asia

State: researched-with-partial-coverage. Included: Empire of Japan (entity-empire-of-japan); Imperial Japan (entity-imperial-japan); Japan (entity-japan); Japan (USA) (entity-japan-usa); Korea (entity-korea); Korea, Democratic People's Republic of (entity-korea-democratic-people-s-republic-of); Korea, Republic of (entity-korea-republic-of); Korea (USA) (entity-korea-usa); Korea (USSR) (entity-korea-ussr); Sakhalin (RU) (entity-sakhalin-ru); China (entity-china); Hong Kong (entity-hong-kong); Manchu Empire (entity-manchu-empire); Qing Empire (entity-qing-empire); Taiwan (entity-taiwan); Tibet (entity-tibet); Mongolia (entity-mongolia).

High-value continuing/source-family candidates: Empire of Japan (entity-empire-of-japan); Imperial Japan (entity-imperial-japan); Japan (entity-japan); Korea (entity-korea); China (entity-china); Hong Kong (entity-hong-kong); Manchu Empire (entity-manchu-empire); Qing Empire (entity-qing-empire).

Shared source discovery: National archives, official cabinet chronologies and occupation records; constitutional continuity cannot be inferred from labels.

Difficult continuity cases: Review three imperial/Japan names, occupation authorities and divided Korea; preserve the separate 1947 constitutional profile. Determine whether each source grouping describes an administration, constituent territory or multiple polities; no modern-country fallback.

Classification prerequisites (excluded from this batch denominator): Chinese Warlords (entity-chinese-warlords); Kuril Islands (entity-kuril-islands); Manchuria (entity-manchuria); Xinjiang (entity-xinjiang).


### political-batch-03 — Central Europe and German/Italian source families

State: researched-with-partial-coverage. Included: Austria (entity-austria); Austria Hungary (entity-austria-hungary); Austrian Empire (entity-austrian-empire); Austro-Hungarian Empire (entity-austro-hungarian-empire); Bosnia-Herzegovina (entity-bosnia-herzegovina); Hungary (entity-hungary); East Germany (entity-east-germany); East Prussia (entity-east-prussia); German Empire (entity-german-empire); Germany (entity-germany); Germany (France) (entity-germany-france); Germany (Soviet) (entity-germany-soviet); Germany (UK) (entity-germany-uk); Germany (USA) (entity-germany-usa); Prussia (entity-prussia); Saar Protectorate (entity-saar-protectorate); West Germany (entity-west-germany).

High-value continuing/source-family candidates: Austria (entity-austria); Austrian Empire (entity-austrian-empire); Austro-Hungarian Empire (entity-austro-hungarian-empire); German Empire (entity-german-empire); Germany (entity-germany); Prussia (entity-prussia).

Shared source discovery: Regional/state archives and constitutional collections; establish small-state and imperial scope before statistics.

Difficult continuity cases: Distinguish state, constitutional regime, constituent area, occupation zone and later republic. The existing Nazi-period mapping must not cover earlier Germany automatically. Review composite monarchy, constituent territory and later state/regime coverage separately.


### political-batch-04 — Central Europe and German/Italian source families

State: researched-with-partial-coverage. Included: Italy (entity-italy); Kingdom of Italy (entity-kingdom-of-italy); Kingdom of Sardinia (entity-kingdom-of-sardinia); Kingdom of the Two Sicilies (entity-kingdom-of-the-two-sicilies); Lombardy (entity-lombardy); Lucca (entity-lucca); Modena (entity-modena); Papal States (entity-papal-states); Parma (entity-parma); Tuscany (entity-tuscany); Venetia (entity-venetia); Czechoslovakia (entity-czechoslovakia); Anhalt (entity-anhalt); Baden (entity-baden); Bavaria (entity-bavaria); Bremen (entity-bremen); Brunswick (entity-brunswick); Hamburg (entity-hamburg); Hanover (entity-hanover); Hohenzollern (entity-hohenzollern); Holstein (entity-holstein).

High-value continuing/source-family candidates: Regional administrations and linked continuity reviews.

Shared source discovery: Regional/state archives and constitutional collections; establish small-state and imperial scope before statistics.

Difficult continuity cases: Separate source naming variation, constituent governments and potential unification/succession; no overlap-derived chain.


### political-batch-05 — Central Europe and German/Italian source families

State: proposed-not-authorised. Included: Lippe-Detmold (entity-lippe-detmold); Lübeck (entity-lubeck); Mecklenburg-Schwerin (entity-mecklenburg-schwerin); Yugoslavia (entity-yugoslavia); Mecklenburg-Strelitz (entity-mecklenburg-strelitz); Oldenburg (entity-oldenburg); Saxony (entity-saxony); Schaumburg-Lippe (entity-schaumburg-lippe); Waldeck (entity-waldeck); Württemberg (entity-wurttemberg); Danzig (entity-danzig); Electoral Hesse (entity-electoral-hesse); Grand Duchy of Hesse (entity-grand-duchy-of-hesse); Nassau (entity-nassau); Schleswig (entity-schleswig).

High-value continuing/source-family candidates: Regional administrations and linked continuity reviews.

Shared source discovery: Regional/state archives and constitutional collections; establish small-state and imperial scope before statistics.


### political-batch-06 — Eastern Europe, Russian/Soviet and Balkan source families

State: proposed-not-authorised. Included: Armenia (entity-armenia); Azerbaijan (entity-azerbaijan); Georgia (entity-georgia); Russian Empire (entity-russian-empire); USSR (entity-soviet-union); Ukraine (entity-ukraine); Bulgaria (entity-bulgaria); Greece (entity-greece); Romania (entity-romania); Albania (entity-albania); Poland (entity-poland); Montenegro (entity-montenegro); Serbia (entity-serbia); Estonia (entity-estonia); Latvia (entity-latvia); Lithuania (entity-lithuania); Dodecanese Islands (entity-dodecanese-islands); Republic of Kraków (entity-republic-of-krakow).

High-value continuing/source-family candidates: Russian Empire (entity-russian-empire); USSR (entity-soviet-union); Bulgaria (entity-bulgaria); Greece (entity-greece); Romania (entity-romania).

Shared source discovery: National archives and constitutional treaties; occupation, federation and regime continuity require separate evidence.

Difficult continuity cases: Source USSR appears in 1920 although the curated Union formation is dated 1922. Review civil-war source labels and republic/union relationships without inventing continuity. Runtime mapping resolves outside the sourced existence interval. Review the source label and mapping before extending facts.

Classification prerequisites (excluded from this batch denominator): Far Eastern SSR (entity-far-eastern-ssr); South Russia (entity-south-russia); White Russia (entity-white-russia).


### political-batch-07 — South/Central Asia

State: proposed-not-authorised. Included: British East India Company (entity-british-east-india-company); British Raj (entity-british-raj); Ceylon (entity-ceylon); Ceylon (Dutch) (entity-ceylon-dutch); India (entity-india); Mysore (entity-mysore); Mysore (Indian princely state) (entity-mysore-indian-princely-state); Pakistan (entity-pakistan); Sikkim (Indian princely state) (entity-sikkim-indian-princely-state); Sri Lanka (entity-sri-lanka); Bokhara Khanate (entity-bokhara-khanate); Iran (entity-iran); Persia (entity-persia); Afghanistan (entity-afghanistan); Bhutan (entity-bhutan); Nepal (entity-nepal); Goa (entity-goa); Maratha Confederacy (entity-maratha-confederacy); Oudh (entity-oudh); Travancore (entity-travancore); Bahawalpur (entity-bahawalpur); Cochin (entity-cochin); Kandy (entity-kandy); Madras (entity-madras); Nizam's Dominions (entity-nizam-s-dominions); Sindh (entity-sindh).

High-value continuing/source-family candidates: British Raj (entity-british-raj); India (entity-india); Iran (entity-iran); Persia (entity-persia); Afghanistan (entity-afghanistan); Bhutan (entity-bhutan); Nepal (entity-nepal).

Shared source discovery: India Office/Parliament, local archives and regional scholarship; princely states, Company rule, Raj and partition need separate identities.

Difficult continuity cases: Source India/Pakistan/Bangladesh dates and administrative scope need review; existing sourced partition dates must remain independent of snapshot names. Review name continuity and whether plural khanate/group labels can represent one dossier.

Classification prerequisites (excluded from this batch denominator): Bangladesh (entity-bangladesh); central Asian khanates (entity-central-asian-khanates); Turan (entity-turan).


### political-batch-08 — North America

State: proposed-not-authorised. Included: United States of America (entity-united-states); Canada (entity-canada); Mexico (entity-mexico); Greenland (entity-greenland); Dominion of Newfoundland (entity-dominion-of-newfoundland); Viceroyalty of New Spain (entity-viceroyalty-of-new-spain); Acadian Peninsula (UK) (entity-acadian-peninsula-uk); Luisiana (entity-luisiana); Quebec (entity-quebec); Rupert's Land (entity-rupert-s-land).

High-value continuing/source-family candidates: United States of America (entity-united-states); Canada (entity-canada); Mexico (entity-mexico).

Shared source discovery: National/provincial archives; colonial charters and Indigenous institutional sources require distinct treatment.


### political-batch-09 — South America

State: proposed-not-authorised. Included: Brazil (entity-brazil); Kingdom of Brazil (entity-kingdom-of-brazil); Viceroyalty of Brazil (entity-viceroyalty-of-brazil); Paraguay (entity-paraguay); Argentina (entity-argentina); Bolivia (entity-bolivia); Chile (entity-chile); Colombia (entity-colombia); Ecuador (entity-ecuador); French Guiana (entity-french-guiana); Peru (entity-peru); Uruguay (entity-uruguay); Venezuela (entity-venezuela); Guyana (entity-guyana); Suriname (entity-suriname); Dutch Guiana (entity-dutch-guiana); Viceroyalty of New Granada (entity-viceroyalty-of-new-granada); Viceroyalty of Peru (entity-viceroyalty-of-peru); United Provinces of the Río de la Plata (entity-united-provinces-of-the-rio-de-la-plata); Viceroyalty of the Río de la Plata (entity-viceroyalty-of-the-rio-de-la-plata).

High-value continuing/source-family candidates: Paraguay (entity-paraguay); Argentina (entity-argentina); Bolivia (entity-bolivia); Chile (entity-chile); Colombia (entity-colombia); Ecuador (entity-ecuador); French Guiana (entity-french-guiana); Peru (entity-peru); Uruguay (entity-uruguay); Venezuela (entity-venezuela).

Shared source discovery: National archives, independence-era documents and historical censuses; do not equate viceroyalties with modern states.

Difficult continuity cases: Establish actual colonial/constitutional periods rather than assuming that the source name is dated correctly.


### political-batch-10 — Caribbean and Central America

State: proposed-not-authorised. Included: Anguilla (entity-anguilla); Dominica (entity-dominica); Haiti (entity-haiti); Netherlands Antilles (entity-netherlands-antilles); Antigua and Barbuda (entity-antigua-and-barbuda); Belize (entity-belize); Costa Rica (entity-costa-rica); Dominican Republic (entity-dominican-republic); El Salvador (entity-el-salvador); Guadeloupe (entity-guadeloupe); Guatemala (entity-guatemala); Honduras (entity-honduras); Montserrat (entity-montserrat); Nicaragua (entity-nicaragua); Barbados (entity-barbados); Cuba (entity-cuba); Grenada (entity-grenada); Panama (entity-panama).

High-value continuing/source-family candidates: Anguilla (entity-anguilla); Dominica (entity-dominica); Haiti (entity-haiti); Netherlands Antilles (entity-netherlands-antilles); Antigua and Barbuda (entity-antigua-and-barbuda); Belize (entity-belize); Costa Rica (entity-costa-rica); Dominican Republic (entity-dominican-republic); El Salvador (entity-el-salvador); Guadeloupe (entity-guadeloupe); Guatemala (entity-guatemala); Honduras (entity-honduras); Montserrat (entity-montserrat); Nicaragua (entity-nicaragua).

Shared source discovery: Colonial archives, local national libraries and institutional statistical sources; distinguish islands, administrations and federations.


### political-batch-11 — Caribbean and Central America

State: proposed-not-authorised. Included: Puerto Rico (entity-puerto-rico); Saint Barthelemy (entity-saint-barthelemy); Saint Kitts and Nevis (entity-saint-kitts-and-nevis); Saint Lucia (entity-saint-lucia); Saint Martin (entity-saint-martin); Saint Vincent and the Grenadines (entity-saint-vincent-and-the-grenadines); United States Virgin Islands (entity-united-states-virgin-islands); Trinidad (entity-trinidad); Martinique (entity-martinique); Bahamas (entity-bahamas); British Guiana (entity-british-guiana); Jamaica (entity-jamaica); Turks and Caicos Islands (entity-turks-and-caicos-islands); Jamaica (UK) (entity-jamaica-uk); Martinique (France) (entity-martinique-france).

High-value continuing/source-family candidates: Saint Barthelemy (entity-saint-barthelemy); Saint Kitts and Nevis (entity-saint-kitts-and-nevis); Saint Martin (entity-saint-martin).

Shared source discovery: Colonial archives, local national libraries and institutional statistical sources; distinguish islands, administrations and federations.


### political-batch-12 — Middle East and Arabian source families

State: proposed-not-authorised. Included: Emirate of Bin Shal'an (entity-emirate-of-bin-shal-an); Hail (entity-hail); Hejaz (entity-hejaz); Iraq (entity-iraq); Israel (entity-israel); Jordan (entity-jordan); Lebanon (entity-lebanon); Mandatory Palestine (GB) (entity-mandatory-palestine-gb); Mesopotamia (GB) (entity-mesopotamia-gb); Muscat and Oman (entity-muscat-and-oman); Oman (entity-oman); Oman (British Raj) (entity-oman-british-raj); Ottoman Empire (entity-ottoman-empire); Ottoman Sultanate (entity-ottoman-sultanate); Republic of Turkey (entity-republic-of-turkey); Saudi Arabia (entity-saudi-arabia); Syria (entity-syria); Syria (France) (entity-syria-france); Trucial Oman (entity-trucial-oman); Turkey (entity-turkey); Yemen (entity-yemen); Yemen (UK) (entity-yemen-uk); Qatar (entity-qatar); Eritrea (entity-eritrea); Kuwait (entity-kuwait); Awsa (entity-awsa); Eritrea (Italy) (entity-eritrea-italy).

High-value continuing/source-family candidates: Ottoman Empire (entity-ottoman-empire); Qatar (entity-qatar).

Shared source discovery: Local/Ottoman archives and mandate records; treaties and administrative authority require specific evidence.

Difficult continuity cases: Review empire/constituent scope, mandates, occupation and source labels that may precede named states. Do not reinterpret authority fields as constitutional status.

Classification prerequisites (excluded from this batch denominator): Arabia (entity-arabia); Arabia (Nejd) (entity-arabia-nejd); British Protectorate (entity-british-protectorate); Nejd (entity-nejd); United Arab Emirates (entity-united-arab-emirates).


### political-batch-13 — Southeast Asia

State: proposed-not-authorised. Included: Burma (entity-burma); Dutch East Indies (entity-dutch-east-indies); Indonesia (entity-indonesia); Malaya (entity-malaya); Netherlands Indies (entity-netherlands-indies); Rattanakosin Kingdom (entity-rattanakosin-kingdom); Siam (entity-siam); Thailand (entity-thailand); Cambodia (entity-cambodia); French Indo-China (entity-french-indo-china); French Indochina (entity-french-indochina); Laos (entity-laos); Tonkin (entity-tonkin); Vietnam (entity-vietnam); Brunei (entity-brunei); Philippines (entity-philippines); Đại Việt (entity-ai-viet).

High-value continuing/source-family candidates: Brunei (entity-brunei); Philippines (entity-philippines).

Shared source discovery: Local national archives and Dutch/French/British collections; colony, constituent region and occupation periods require explicit scope.

Difficult continuity cases: Distinguish colonial federation, constituent regions and later states; determine whether differently spelled federation labels share historical identity. Review colony/state/name continuity and multiple simultaneous source names; do not auto-merge.

Classification prerequisites (excluded from this batch denominator): Annam (entity-annam); Cochin China (entity-cochin-china); Malaysia (entity-malaysia).


### political-batch-14 — North Africa and Saharan source families

State: proposed-not-authorised. Included: Egypt (entity-egypt); Morocco (entity-morocco); Cyraneica (UK Lybia) (entity-cyraneica-uk-lybia); Fezzan (Frech Lybia) (entity-fezzan-frech-lybia); Libya (entity-libya); Libya (IT) (entity-libya-it); Tripolitana (UK Lybia) (entity-tripolitana-uk-lybia); Tunisia (entity-tunisia); Algeria (entity-algeria); Rio De Oro (entity-rio-de-oro); Spanish Sahara (entity-spanish-sahara); Algeria (FR) (entity-algeria-fr); Mauritania (entity-mauritania); Tunis (entity-tunis); Western Sahara (entity-western-sahara); Algeria (France) (entity-algeria-france); Morocco (France) (entity-morocco-france); Spanish Morocco (entity-spanish-morocco).

High-value continuing/source-family candidates: Egypt (entity-egypt); Morocco (entity-morocco).

Shared source discovery: Local archives plus Ottoman/colonial records; distinguish administrative partitions and wider imperial authority.

Difficult continuity cases: Preserve spelling errors as source evidence; review Ottoman/colonial/occupation partitions and later state continuity.

Classification prerequisites (excluded from this batch denominator): Cyrenaica (entity-cyrenaica); Tripolitania (entity-tripolitania).


### political-batch-15 — West Africa

State: proposed-not-authorised. Included: Sierra Leone (entity-sierra-leone); Gambia (entity-gambia); Gambia, The (entity-gambia-the); Liberia (entity-liberia); Nigeria (entity-nigeria); Portuguese Guinea (entity-portuguese-guinea); Asante (entity-asante); Benin (entity-benin); Ivory Coast (entity-ivory-coast); Oyo (entity-oyo); Senegal (entity-senegal); Togo (entity-togo); Dahomey (entity-dahomey); French West Africa (entity-french-west-africa); Guinea-Bissau (entity-guinea-bissau); Futa Jalon (entity-futa-jalon); Futa Toro (entity-futa-toro); Ghana (entity-ghana); Gold Coast (entity-gold-coast); Kong Empire (entity-kong-empire); Lagos (entity-lagos); Opobo (entity-opobo); Sokoto Caliphate (entity-sokoto-caliphate); Tukular Caliphate (entity-tukular-caliphate); Burkina Faso (entity-burkina-faso).

High-value continuing/source-family candidates: Sierra Leone (entity-sierra-leone); Liberia (entity-liberia).

Shared source discovery: Local archives, scholarly regional collections and colonial records; confederacies and community labels require scope review.


### political-batch-16 — West Africa

State: proposed-not-authorised. Included: Dendi Kingdom (entity-dendi-kingdom); Gold Coast (GB) (entity-gold-coast-gb); Guinea (entity-guinea); Kaarta (entity-kaarta); Niger (entity-niger); Senegal (FR) (entity-senegal-fr); Wassoulou Empire (entity-wassoulou-empire); First Samori Empire (entity-first-samori-empire); Fulani Empire (entity-fulani-empire); Guinea-Bissau (Portugal) (entity-guinea-bissau-portugal); Second Samori Empire (entity-second-samori-empire); Segu (entity-segu); Songhai (entity-songhai); Southern Cameroon (entity-southern-cameroon); Togoland (entity-togoland).

High-value continuing/source-family candidates: Regional administrations and linked continuity reviews.

Shared source discovery: Local archives, scholarly regional collections and colonial records; confederacies and community labels require scope review.


### political-batch-17 — Central Africa

State: proposed-not-authorised. Included: Burundi (entity-burundi); Angola (entity-angola); Equatorial Guinea (entity-equatorial-guinea); Rwanda (entity-rwanda); Belgian Congo (entity-belgian-congo); Congo (France) (entity-congo-france); Zaire (Belgium) (entity-zaire-belgium); Gabon (entity-gabon); Kanem-Bornu (entity-kanem-bornu); Lunda (entity-lunda); Sudan (entity-sudan); Angola (Portugal) (entity-angola-portugal); French Equatorial Africa (entity-french-equatorial-africa); Luba (entity-luba); French Cameroons (entity-french-cameroons); Kuba (entity-kuba); Rwanda (Belgium) (entity-rwanda-belgium); Spanish Guinea (entity-spanish-guinea); Sultanate of Utetera (entity-sultanate-of-utetera); Cameroon (entity-cameroon); Central African Republic (entity-central-african-republic); Chad (entity-chad); Sultanate of Damagaram (entity-sultanate-of-damagaram); Wadai Empire (entity-wadai-empire); Anglo-Egyptian Sudan (entity-anglo-egyptian-sudan); Bagirmi (entity-bagirmi); Darfur (entity-darfur); Kamerun (entity-kamerun); Nkore (entity-nkore); Wadai (entity-wadai).

High-value continuing/source-family candidates: Burundi (entity-burundi).

Shared source discovery: Regional archives, local institutional histories and colonial records; Congo/Zaire naming and composite labels require priority review.

Difficult continuity cases: Separate the two Congo source families and review earlier snapshots using Zaire; never derive succession from identical polygons.

Classification prerequisites (excluded from this batch denominator): Congo (entity-congo); Zaire (entity-zaire).


### political-batch-18 — East Africa and Horn

State: proposed-not-authorised. Included: British East Africa (entity-british-east-africa); Djibouti (entity-djibouti); Ethiopia (entity-ethiopia); Ethiopia (Italy) (entity-ethiopia-italy); French Somaliland (entity-french-somaliland); German E. Africa (Tanganyika) (entity-german-e-africa-tanganyika); Kenya (entity-kenya); Sultanate of Zanzibar (entity-sultanate-of-zanzibar); Sultinate of Zanzibar (entity-sultinate-of-zanzibar); Zanzibar (entity-zanzibar); Uganda (entity-uganda); British Somaliland (entity-british-somaliland); Buganda (entity-buganda); Bunyoro (entity-bunyoro); Italian Somaliland (entity-italian-somaliland); Harer (Egypt) (entity-harer-egypt); Somalia (entity-somalia); Funj (entity-funj); Kazembe (entity-kazembe).

High-value continuing/source-family candidates: Ethiopia (entity-ethiopia).

Shared source discovery: Local archives and historical administrative publications; different names and authority fields do not prove succession.

Difficult continuity cases: Review historical-name variants, colonies/occupations and labels such as Tanzania in earlier snapshots; explicit dates need later research.

Classification prerequisites (excluded from this batch denominator): Abyssinia (entity-abyssinia); Tanzania, United Republic of (entity-tanzania-united-republic-of).


### political-batch-19 — Southern Africa

State: proposed-not-authorised. Included: Basutoland (entity-basutoland); German South-West Africa (entity-german-south-west-africa); Lesotho (entity-lesotho); Malawi (entity-malawi); Namibia (entity-namibia); Northern Rhodesia (entity-northern-rhodesia); Nyasaland (entity-nyasaland); Rhodesia (entity-rhodesia); South Africa (entity-south-africa); Southern Rhodesia (entity-southern-rhodesia); Union of South Africa (entity-union-of-south-africa); Zambia (entity-zambia); Zimbabwe (entity-zimbabwe); Botswana (entity-botswana); Cape Colony (entity-cape-colony); Griqualand West (entity-griqualand-west).

High-value continuing/source-family candidates: Regional administrations and linked continuity reviews.

Shared source discovery: Local archives, regional constitutional histories and colonial collections; distinguish unions, colonies and community labels.

Difficult continuity cases: Review colonies, unions and source-name substitution; no modern sovereignty is inferred from the shared geographic label.


### political-batch-20 — Southern Africa

State: proposed-not-authorised. Included: Imerina (entity-imerina); Madagascar (entity-madagascar); Madagascar (France) (entity-madagascar-france); Mozambique (entity-mozambique); Natal (entity-natal); Orange Free State (entity-orange-free-state); Portuguese East Africa (entity-portuguese-east-africa); Swaziland (entity-swaziland); Transvaal (entity-transvaal); Zululand (entity-zululand); Delagoa Bay (entity-delagoa-bay); Merina Kingdom (entity-merina-kingdom); Mozambique (Portugal) (entity-mozambique-portugal); Rozwi (entity-rozwi); Walbis Bay (entity-walbis-bay).

High-value continuing/source-family candidates: Swaziland (entity-swaziland).

Shared source discovery: Local archives, regional constitutional histories and colonial collections; distinguish unions, colonies and community labels.


### political-batch-21 — Pacific/Oceania states and administrations

State: proposed-not-authorised. Included: American Samoa (entity-american-samoa); Fiji (entity-fiji); Niue (entity-niue); Papua New Guinea (entity-papua-new-guinea); Samoa (entity-samoa); Tonga (entity-tonga); Wallis and Futuna Islands (entity-wallis-and-futuna-islands); Australia (entity-australia); New Zealand (entity-new-zealand); Kingdom of Hawaii (entity-kingdom-of-hawaii); New South Wales (UK) (entity-new-south-wales-uk); Northern Territory (UK) (entity-northern-territory-uk); Queensland (UK) (entity-queensland-uk); South Australia (UK) (entity-south-australia-uk); Victoria (UK) (entity-victoria-uk); Western Australia (UK) (entity-western-australia-uk); Tuʻi Tonga Empire (entity-tu-i-tonga-empire); Dutch Guinea (entity-dutch-guinea); Gilbert and Ellice Islands (entity-gilbert-and-ellice-islands); Guam (entity-guam); New Caledonia (entity-new-caledonia); New Hebrides (entity-new-hebrides); New South Wales (entity-new-south-wales); Saipan (entity-saipan).

High-value continuing/source-family candidates: American Samoa (entity-american-samoa); Fiji (entity-fiji); Niue (entity-niue); Papua New Guinea (entity-papua-new-guinea); Samoa (entity-samoa); Tonga (entity-tonga); Wallis and Futuna Islands (entity-wallis-and-futuna-islands).

Shared source discovery: Local archives, Pacific scholarly collections and community-authorised histories; standards and colonial administrations require careful applicability.

Difficult continuity cases: Encoding and accent variants need review; people/land/community labels are not equivalent to the later state.

## Architecture, maintenance and verification

Batch 01 expands the production metadata while preserving the seven reference records, existing flags, UI and requested-year/geometry model. Classification is a development-only overlay; edit classification-plan.json for reviewed eligibility decisions, research-plan.json for existing family/tier review decisions. Neither is fetched by production. Raw inventory generation and input locks remain the same. Core/enriched completion still requires reviewed source-backed intervals, not template eligibility.

Run **node scripts/coverage.mjs** to regenerate the manifest and combined report; **node scripts/coverage.mjs --check** recalculates both classification and raw outputs and rejects drift. Classification inputs and module hashes are recorded. Unknown IDs, missing/invalid decisions, missing evidence and broken canonical references fail rather than falling back to assumed country eligibility. New raw IDs require explicit decisions before regeneration succeeds.

Limitations: provisional source-label classifications do not validate historical identities/status periods, prove duplicates or establish source availability. Sparse snapshots and uncertain/anachronistic names remain. The denominator is not a final deduplicated historical entity count. Future classification decisions may enlarge or reduce it; historical facts have been researched only in batches marked reviewed.

---

# Appendix: preserved Phase 1 raw-map audit

Generated by node scripts/coverage.mjs. Development audit only; visible site remains v0.6.1. Reviewed batches and their states are listed in the current Phase 2 plan.

Covered means the existing production resolver returns a curated entity in at least one snapshot where this map ID is selectable. It does not mean core completeness or coverage throughout 1800–1960. All other IDs still have map-derived fallback panels.

## Totals

| Measure | Count |
| --- | ---: |
| totalIdentities | 880 |
| curatedMetadataEntities | 98 |
| mappedIdentities | 78 |
| coveredIdentities | 77 |
| uncoveredIdentities | 803 |
| percentage | 8.75 |
| multipleSnapshotIdentities | 519 |
| singleSnapshotIdentities | 361 |
| unresolvedQuestions | 261 |
| identitiesWithQuestions | 818 |
| brokenMappings | 0 |
| orphanMetadataEntities | 0 |
| ambiguousMappingYearPairs | 17 |

The denominator includes selectable unlabeled/composite/community identities, not just countries or visible labels. “First/last snapshot” are observations of source presence, never existence dates. Source geometry, metadata and requested-year resolution remain separate.

## Every configured snapshot

| Snapshot | Selectable IDs | Curated dossier | Fallback only | Coverage |
| --- | ---: | ---: | ---: | ---: |
| 1800 | 547 | 17 | 530 | 3.11% |
| 1815 | 313 | 31 | 282 | 9.9% |
| 1878 | 173 | 23 | 150 | 13.29% |
| 1880 | 170 | 23 | 147 | 13.53% |
| 1900 | 166 | 22 | 144 | 13.25% |
| 1914 | 143 | 23 | 120 | 16.08% |
| 1920 | 164 | 24 | 140 | 14.63% |
| 1930 | 164 | 24 | 140 | 14.63% |
| 1938 | 172 | 23 | 149 | 13.37% |
| 1945 | 183 | 31 | 152 | 16.94% |
| 1960 | 157 | 30 | 127 | 19.11% |

## Persistent and briefly represented identities

“Briefly” means one available snapshot, not a short-lived historical entity.

- Most frequent: Afghanistan (11); American Samoa (9); Anguilla (10); Antigua and Barbuda (9); Argentina (9); Belgium (9); Belize (9); Bhutan (11); Bolivia (9); Brunei (11); Bulgaria (9); Burundi (9); Canada (10); Chile (9); Colombia (9); Costa Rica (9); Denmark (10); Dominica (10); Dominican Republic (9); Ecuador (9); Egypt (10); El Salvador (9); Ethiopia (9); Fiji (9); France (11); French Guiana (9); Greece (9); Guadeloupe (9); Guatemala (9); Haiti (10); Honduras (9); Hong Kong (11); Liberia (9); Luxembourg (11); Mexico (9); Montserrat (9); Morocco (10); Nepal (11); Netherlands (9); Netherlands Antilles (10); Nicaragua (9); Niue (9); Papua New Guinea (9); Paraguay (11); Peru (9); Philippines (11); Portugal (11); Qatar (9); Romania (9); Saint Barthelemy (10); Saint Kitts and Nevis (9); Saint Martin (10); Samoa (9); Sierra Leone (10); Spain (11); Swaziland (9); Switzerland (10); Tonga (9); United States of America (11); Unnamed territory (11); Uruguay (9); Venezuela (9); Wallis and Futuna Islands (9).
- 361 singleton IDs and 519 IDs in multiple snapshots. Full names/years are in manifest.json.

<details><summary>All 361 single-snapshot identities</summary>

- Aboriginal Tasmanians — 1800 (entity-aboriginal-tasmanians).
- Abyssinia — 1914 (entity-abyssinia).
- Acadian Peninsula (UK) — 1800 (entity-acadian-peninsula-uk).
- Accra — 1900 (entity-accra).
- Africa — 1800 (entity-africa).
- Agwarmin — 1800 (entity-agwarmin).
- Đại Việt — 1800 (entity-ai-viet).
- Air — 1800 (entity-air).
- Algeria (France) — 1938 (entity-algeria-france).
- Ambur — 1800 (entity-ambur).
- Andegerebenha — 1800 (entity-andegerebenha).
- Andyamathanha — 1800 (entity-andyamathanha).
- Anggamudi — 1800 (entity-anggamudi).
- Anglo-Egyptian Sudan — 1914 (entity-anglo-egyptian-sudan).
- Anguthimri — 1800 (entity-anguthimri).
- Arabana — 1800 (entity-arabana).
- Arabia (Nejd) — 1914 (entity-arabia-nejd).
- Assam — 1815 (entity-assam).
- Austrian Netherlands — 1800 (entity-austrian-netherlands).
- Austro-Hungarian Empire — 1914 (entity-austro-hungarian-empire).
- Awabakal — 1800 (entity-awabakal).
- Awngthim — 1800 (entity-awngthim).
- Awsa — 1800 (entity-awsa).
- Badtjala — 1800 (entity-badtjala).
- Bagirmi — 1800 (entity-bagirmi).
- Bahawalpur — 1800 (entity-bahawalpur).
- Bakanh — 1800 (entity-bakanh).
- Bandjigali — 1800 (entity-bandjigali).
- Banggarla — 1800 (entity-banggarla).
- Bangladesh — 1945 (entity-bangladesh).
- Baraba Baraba — 1800 (entity-baraba-baraba).
- Baradha — 1800 (entity-baradha).
- Barindji — 1800 (entity-barindji).
- Barkindji — 1800 (entity-barkindji).
- Barna — 1800 (entity-barna).
- Barranbinya — 1800 (entity-barranbinya).
- Barundji — 1800 (entity-barundji).
- Barunggam — 1800 (entity-barunggam).
- Batavian Republic — 1800 (entity-batavian-republic).
- Bayali — 1800 (entity-bayali).
- Bidjara — 1800 (entity-bidjara).
- Bidwell — 1800 (entity-bidwell).
- Bigambul — 1800 (entity-bigambul).
- Binbinga — 1800 (entity-binbinga).
- Bindjali — 1800 (entity-bindjali).
- Biri — 1800 (entity-biri).
- Biripi — 1800 (entity-biripi).
- Birria — 1800 (entity-birria).
- Boonwurrung — 1800 (entity-boonwurrung).
- British East Africa — 1914 (entity-british-east-africa).
- British East India Company — 1815 (entity-british-east-india-company).
- British Protectorate — 1914 (entity-british-protectorate).
- Buandig — 1800 (entity-buandig).
- Budjari — 1800 (entity-budjari).
- Bularnu — 1800 (entity-bularnu).
- Bundelkhand — 1800 (entity-bundelkhand).
- Bundjalung — 1800 (entity-bundjalung).
- Burarra — 1800 (entity-burarra).
- Carnatic — 1800 (entity-carnatic).
- Ceylon (Dutch) — 1800 (entity-ceylon-dutch).
- Circars — 1800 (entity-circars).
- Cochin — 1800 (entity-cochin).
- Congo (France) — 1938 (entity-congo-france).
- Cyprus — 1960 (entity-cyprus).
- Cyraneica (UK Lybia) — 1945 (entity-cyraneica-uk-lybia).
- Dadi Dadi — 1800 (entity-dadi-dadi).
- Dainggatti — 1800 (entity-dainggatti).
- Danggali — 1800 (entity-danggali).
- Danzig — 1930 (entity-danzig).
- Darfur — 1800 (entity-darfur).
- Darkinung — 1800 (entity-darkinung).
- Darumbal — 1800 (entity-darumbal).
- Denmark-Norway — 1800 (entity-denmark-norway).
- Dharawala — 1800 (entity-dharawala).
- Dharug — 1800 (entity-dharug).
- Dhirari — 1800 (entity-dhirari).
- Dieri — 1800 (entity-dieri).
- Dja Dja Wurrung — 1800 (entity-dja-dja-wurrung).
- Djabuganjdji — 1800 (entity-djabuganjdji).
- Djabwurung — 1800 (entity-djabwurung).
- Djargurdwurung — 1800 (entity-djargurdwurung).
- Djirbalngan — 1800 (entity-djirbalngan).
- Dodecanese Islands — 1930 (entity-dodecanese-islands).
- Dutch Guinea — 1945 (entity-dutch-guinea).
- Dutch settlements — 1800 (entity-dutch-settlements).
- Dyungungoo (Gubbi Gubbi) — 1800 (entity-dyungungoo-gubbi-gubbi).
- East Germany — 1960 (entity-east-germany).
- Electoral Hesse — 1815 (entity-electoral-hesse).
- Eora — 1800 (entity-eora).
- Eritrea (Italy) — 1938 (entity-eritrea-italy).
- Ethiopia (Italy) — 1938 (entity-ethiopia-italy).
- Eyaq — 1800 (entity-eyaq).
- Fante — 1815 (entity-fante).
- Fezzan (Frech Lybia) — 1945 (entity-fezzan-frech-lybia).
- Finnmark — 1800 (entity-finnmark).
- First Samori Empire — 1900 (entity-first-samori-empire).
- Fulani Empire — 1815 (entity-fulani-empire).
- Funj — 1800 (entity-funj).
- Gabalbara — 1800 (entity-gabalbara).
- Gadubanud — 1800 (entity-gadubanud).
- Gananggalinda — 1800 (entity-gananggalinda).
- Ganggalida — 1800 (entity-ganggalida).
- Gangulu — 1800 (entity-gangulu).
- Garawa — 1800 (entity-garawa).
- Garingbal — 1800 (entity-garingbal).
- Gayiri — 1800 (entity-gayiri).
- Geawegal — 1800 (entity-geawegal).
- German E. Africa (Tanganyika) — 1914 (entity-german-e-africa-tanganyika).
- German Empire — 1914 (entity-german-empire).
- German South-West Africa — 1914 (entity-german-south-west-africa).
- Germany (France) — 1945 (entity-germany-france).
- Germany (Soviet) — 1945 (entity-germany-soviet).
- Germany (UK) — 1945 (entity-germany-uk).
- Germany (USA) — 1945 (entity-germany-usa).
- Gilbert and Ellice Islands — 1938 (entity-gilbert-and-ellice-islands).
- Giraiwurung — 1800 (entity-giraiwurung).
- Giya — 1800 (entity-giya).
- Gooty — 1800 (entity-gooty).
- Grand Duchy of Hesse — 1815 (entity-grand-duchy-of-hesse).
- Guam — 1938 (entity-guam).
- Gugu-Badhun — 1800 (entity-gugu-badhun).
- Guiana — 1815 (entity-guiana).
- Guinea-Bissau (Portugal) — 1945 (entity-guinea-bissau-portugal).
- Gulidjan — 1800 (entity-gulidjan).
- Gumbainggir — 1800 (entity-gumbainggir).
- Gunditjmara — 1800 (entity-gunditjmara).
- Gundungurra — 1800 (entity-gundungurra).
- Gungabula — 1800 (entity-gungabula).
- Gunggari — 1800 (entity-gunggari).
- Gunindiri — 1800 (entity-gunindiri).
- Gunu — 1800 (entity-gunu).
- Gureng Gureng — 1800 (entity-gureng-gureng).
- Guringai — 1800 (entity-guringai).
- Guugu-Yimidhirr — 1800 (entity-guugu-yimidhirr).
- Guwa — 1800 (entity-guwa).
- Guwinmal — 1800 (entity-guwinmal).
- Hausa States — 1800 (entity-hausa-states).
- Helvetic Republic — 1800 (entity-helvetic-republic).
- Imbangala — 1815 (entity-imbangala).
- Iningai — 1800 (entity-iningai).
- Inupiaq — 1800 (entity-inupiaq).
- Jaitmatang — 1800 (entity-jaitmatang).
- Jamaica (UK) — 1945 (entity-jamaica-uk).
- Japan (USA) — 1945 (entity-japan-usa).
- Jardwadjali — 1800 (entity-jardwadjali).
- Kaantju — 1800 (entity-kaantju).
- Kalkadoon — 1800 (entity-kalkadoon).
- Kamerun — 1914 (entity-kamerun).
- Kamilaroi — 1800 (entity-kamilaroi).
- Kanara — 1800 (entity-kanara).
- Kandy — 1800 (entity-kandy).
- Karangura — 1800 (entity-karangura).
- Karenggapa — 1800 (entity-karenggapa).
- Karuwali — 1800 (entity-karuwali).
- Kaurna Pangkarra — 1800 (entity-kaurna-pangkarra).
- Kazembe — 1815 (entity-kazembe).
- Kingdom of Ireland — 1800 (entity-kingdom-of-ireland).
- Kingdom of Italy — 1914 (entity-kingdom-of-italy).
- Koknar — 1800 (entity-koknar).
- Koko-bera — 1800 (entity-koko-bera).
- Kokomini — 1800 (entity-kokomini).
- Kokowarra — 1800 (entity-kokowarra).
- Kong — 1900 (entity-kong).
- Kooma — 1800 (entity-kooma).
- Korea, Democratic People's Republic of — 1960 (entity-korea-democratic-people-s-republic-of).
- Korea, Republic of — 1960 (entity-korea-republic-of).
- Korea (USA) — 1945 (entity-korea-usa).
- Korea (USSR) — 1945 (entity-korea-ussr).
- Kukatj — 1800 (entity-kukatj).
- Kuku-yalanji — 1800 (entity-kuku-yalanji).
- Kullilla — 1800 (entity-kullilla).
- Kunja — 1800 (entity-kunja).
- Kunjen — 1800 (entity-kunjen).
- Kureinji — 1800 (entity-kureinji).
- Kurnai — 1800 (entity-kurnai).
- Kurtjar — 1800 (entity-kurtjar).
- Kuthant — 1800 (entity-kuthant).
- Kuuku-ya’u — 1800 (entity-kuuku-ya-u).
- Kuuku-yani — 1800 (entity-kuuku-yani).
- Kuungkari — 1800 (entity-kuungkari).
- Kuyani — 1800 (entity-kuyani).
- Lamalama — 1800 (entity-lamalama).
- Latje Latje — 1800 (entity-latje-latje).
- Luisiana — 1800 (entity-luisiana).
- Luthigh — 1800 (entity-luthigh).
- M?ori — 1878 (entity-m-ori).
- Madi Madi — 1800 (entity-madi-madi).
- Madras — 1800 (entity-madras).
- Maiawali — 1800 (entity-maiawali).
- Malabar — 1800 (entity-malabar).
- Malyangaba — 1800 (entity-malyangaba).
- Mandandanji — 1800 (entity-mandandanji).
- Mapuche — 1878 (entity-mapuche).
- Mara — 1800 (entity-mara).
- Margany — 1800 (entity-margany).
- Martinique (France) — 1945 (entity-martinique-france).
- Mayi-Kulan — 1800 (entity-mayi-kulan).
- Mayi-Kutuna — 1800 (entity-mayi-kutuna).
- Mayi-Thakurti — 1800 (entity-mayi-thakurti).
- Mayi-Yapi — 1800 (entity-mayi-yapi).
- Mbabaram — 1800 (entity-mbabaram).
- Mbara — 1800 (entity-mbara).
- Mbeiwum — 1800 (entity-mbeiwum).
- Meru — 1800 (entity-meru).
- Mingin — 1800 (entity-mingin).
- Mithaka — 1800 (entity-mithaka).
- Miyan — 1800 (entity-miyan).
- Morocco (France) — 1938 (entity-morocco-france).
- Mpalitjanh — 1800 (entity-mpalitjanh).
- Muruwari — 1800 (entity-muruwari).
- Mutumui — 1800 (entity-mutumui).
- Mysore — 1800 (entity-mysore).
- Mysore (Indian princely state) — 1815 (entity-mysore-indian-princely-state).
- Nakara — 1800 (entity-nakara).
- Narangga — 1800 (entity-narangga).
- Nari Nari — 1800 (entity-nari-nari).
- Nassau — 1815 (entity-nassau).
- Nawu — 1800 (entity-nawu).
- New Caledonia — 1938 (entity-new-caledonia).
- New Hebrides — 1938 (entity-new-hebrides).
- New South Wales — 1815 (entity-new-south-wales).
- Ngadjuri — 1800 (entity-ngadjuri).
- Ngambri — 1800 (entity-ngambri).
- Ngamini — 1800 (entity-ngamini).
- Ngandi — 1800 (entity-ngandi).
- Ngandji — 1800 (entity-ngandji).
- Nganyaywana — 1800 (entity-nganyaywana).
- Ngarabal — 1800 (entity-ngarabal).
- Ngargad — 1800 (entity-ngargad).
- Ngarigo — 1800 (entity-ngarigo).
- Ngarrindjeri — 1800 (entity-ngarrindjeri).
- Ngawun — 1800 (entity-ngawun).
- Nguburinji — 1800 (entity-nguburinji).
- Ngunawal — 1800 (entity-ngunawal).
- Nguri — 1800 (entity-nguri).
- Ngurraiillam — 1800 (entity-ngurraiillam).
- Nizam's Dominions — 1800 (entity-nizam-s-dominions).
- Nkore — 1815 (entity-nkore).
- Nukunu — 1800 (entity-nukunu).
- Nunggubuyu — 1800 (entity-nunggubuyu).
- Nyasaland — 1945 (entity-nyasaland).
- Nyawaygi — 1800 (entity-nyawaygi).
- Oman (British Raj) — 1938 (entity-oman-british-raj).
- Oromo — 1800 (entity-oromo).
- Ottoman Sultanate — 1920 (entity-ottoman-sultanate).
- Palatinate — 1815 (entity-palatinate).
- Papuans — 1815 (entity-papuans).
- Peramangk — 1800 (entity-peramangk).
- Pirlatapa — 1800 (entity-pirlatapa).
- Pitta-Pitta — 1800 (entity-pitta-pitta).
- Qing Empire — 1800 (entity-qing-empire).
- Quebec — 1800 (entity-quebec).
- Rajputs — 1800 (entity-rajputs).
- Republic of Kraków — 1815 (entity-republic-of-krakow).
- Republic of Turkey — 1930 (entity-republic-of-turkey).
- Rift Valley States — 1800 (entity-rift-valley-states).
- Rozwi — 1800 (entity-rozwi).
- Rupert's Land — 1800 (entity-rupert-s-land).
- Saar Protectorate — 1945 (entity-saar-protectorate).
- Saipan — 1938 (entity-saipan).
- Sakhalin (RU) — 1914 (entity-sakhalin-ru).
- San Marino — 1815 (entity-san-marino).
- Schleswig — 1815 (entity-schleswig).
- Second Samori Empire — 1900 (entity-second-samori-empire).
- Segu — 1800 (entity-segu).
- Sikhs — 1800 (entity-sikhs).
- Sikkim (Indian princely state) — 1815 (entity-sikkim-indian-princely-state).
- Sindh — 1800 (entity-sindh).
- Songhai — 1800 (entity-songhai).
- South Russia — 1920 (entity-south-russia).
- Southern Cameroon — 1945 (entity-southern-cameroon).
- Southern Rhodesia — 1938 (entity-southern-rhodesia).
- Spanish Morocco — 1914 (entity-spanish-morocco).
- Sultinate of Zanzibar — 1878 (entity-sultinate-of-zanzibar).
- Suspiaq — 1800 (entity-suspiaq).
- Swabia — 1800 (entity-swabia).
- T'atsaot'ine — 1800 (entity-t-atsaot-ine).
- Takalak — 1800 (entity-takalak).
- Taungurung — 1800 (entity-taungurung).
- Teppathiggi — 1800 (entity-teppathiggi).
- Thaayorre — 1800 (entity-thaayorre).
- Tharawal — 1800 (entity-tharawal).
- Thul Garrie Waja (Bindal) — 1800 (entity-thul-garrie-waja-bindal).
- Tjungundji — 1800 (entity-tjungundji).
- Togoland — 1914 (entity-togoland).
- Tonkin — 1945 (entity-tonkin).
- Tripolitana (UK Lybia) — 1945 (entity-tripolitana-uk-lybia).
- Turan — 1815 (entity-turan).
- Turrbal — 1800 (entity-turrbal).
- Ukraine — 1920 (entity-ukraine).
- Umbindhamu — 1800 (entity-umbindhamu).
- Umpila — 1800 (entity-umpila).
- United Provinces of the Río de la Plata — 1815 (entity-united-provinces-of-the-rio-de-la-plata).
- Uutaalnganu — 1800 (entity-uutaalnganu).
- Viceroyalty of the Río de la Plata — 1800 (entity-viceroyalty-of-the-rio-de-la-plata).
- Vietnam — 1960 (entity-vietnam).
- Waanyi — 1800 (entity-waanyi).
- Wadai — 1800 (entity-wadai).
- Wadi Wadi — 1800 (entity-wadi-wadi).
- Wadigali — 1800 (entity-wadigali).
- Wadjigu — 1800 (entity-wadjigu).
- Wailwan — 1800 (entity-wailwan).
- Waka Waka — 1800 (entity-waka-waka).
- Wakabunga — 1800 (entity-wakabunga).
- Wakaya — 1800 (entity-wakaya).
- Walangama — 1800 (entity-walangama).
- Walbis Bay — 1938 (entity-walbis-bay).
- Wambaya — 1800 (entity-wambaya).
- Wandjiwalgu — 1800 (entity-wandjiwalgu).
- Wangan — 1800 (entity-wangan).
- Wangkamana — 1800 (entity-wangkamana).
- Wangkangurru — 1800 (entity-wangkangurru).
- Wangkumara — 1800 (entity-wangkumara).
- Wargamaygan — 1800 (entity-wargamaygan).
- Warluwarra — 1800 (entity-warluwarra).
- Wathaurong — 1800 (entity-wathaurong).
- Waveroo — 1800 (entity-waveroo).
- Wemba Wemba — 1800 (entity-wemba-wemba).
- Wergaia — 1800 (entity-wergaia).
- West Germany — 1960 (entity-west-germany).
- Wetzlar — 1815 (entity-wetzlar).
- Wik — 1800 (entity-wik).
- Wiljali — 1800 (entity-wiljali).
- Winda Winda — 1800 (entity-winda-winda).
- Wiradjuri — 1800 (entity-wiradjuri).
- Wongaibon — 1800 (entity-wongaibon).
- Wonnarua — 1800 (entity-wonnarua).
- Worimi — 1800 (entity-worimi).
- Wulgurukaba — 1800 (entity-wulgurukaba).
- Wuli-wuli — 1800 (entity-wuli-wuli).
- Wunumara — 1800 (entity-wunumara).
- Wurundjeri — 1800 (entity-wurundjeri).
- Wuthathi — 1800 (entity-wuthathi).
- Yadhaigana — 1800 (entity-yadhaigana).
- Yagalingu — 1800 (entity-yagalingu).
- Yalarrnga — 1800 (entity-yalarrnga).
- Yambina — 1800 (entity-yambina).
- Yanda — 1800 (entity-yanda).
- Yandruwandha — 1800 (entity-yandruwandha).
- Yanga — 1800 (entity-yanga).
- Yangga — 1800 (entity-yangga).
- Yanyuwa — 1800 (entity-yanyuwa).
- Yarluyandi — 1800 (entity-yarluyandi).
- Yawarawarka — 1800 (entity-yawarawarka).
- Yemen (UK) — 1938 (entity-yemen-uk).
- Yidinjdji — 1800 (entity-yidinjdji).
- Yilba — 1800 (entity-yilba).
- Yiman — 1800 (entity-yiman).
- Yinwum — 1800 (entity-yinwum).
- Yir Yoront — 1800 (entity-yir-yoront).
- Yirandali — 1800 (entity-yirandali).
- Yitha Yitha — 1800 (entity-yitha-yitha).
- Yolngu — 1800 (entity-yolngu).
- Yorta Yorta — 1800 (entity-yorta-yorta).
- Yugambeh — 1800 (entity-yugambeh).
- Yuggera — 1800 (entity-yuggera).
- Yuin — 1800 (entity-yuin).
- Yup'ik & Cup'ik — 1800 (entity-yup-ik-and-cup-ik).
- Yupangathi — 1800 (entity-yupangathi).
- Yuru — 1800 (entity-yuru).
- Yuwi — 1800 (entity-yuwi).

</details>

## Unresolved identity and mapping questions

261 explicitly unresolved question records affect 818 identities. Shared methodological questions may cover many IDs; this is a tracked checklist count, not a count of proven historical errors. Automated flags are discovery cues, not historical conclusions.

- **family-britain**: Review British and Irish name/state/union continuity. Do not extend the current UK profile backward simply because an ID repeats. Source IDs: entity-ireland, entity-kingdom-of-ireland, entity-united-kingdom, entity-united-kingdom-of-great-britain-and-ireland. Linked batches: batch-02.
- **family-scandinavian**: Review Scandinavian union labels and constituent governments without assuming that a source-name change establishes state succession. Source IDs: entity-denmark, entity-denmark-norway, entity-norway, entity-sweden, entity-sweden-norway. Linked batches: batch-02.
- **family-german**: Distinguish state, constitutional regime, constituent area, occupation zone and later republic. The existing Nazi-period mapping must not cover earlier Germany automatically. Source IDs: entity-east-germany, entity-east-prussia, entity-german-empire, entity-germany, entity-germany-france, entity-germany-soviet, entity-germany-uk, entity-germany-usa, entity-prussia, entity-saar-protectorate, entity-west-germany. Linked batches: batch-03.
- **family-italian**: Separate source naming variation, constituent governments and potential unification/succession; no overlap-derived chain. Source IDs: entity-italy, entity-kingdom-of-italy, entity-kingdom-of-sardinia, entity-kingdom-of-the-two-sicilies, entity-lombardy, entity-lucca, entity-modena, entity-papal-states, entity-parma, entity-tuscany, entity-venetia. Linked batches: batch-03, batch-04.
- **family-habsburg**: Review composite monarchy, constituent territory and later state/regime coverage separately. Source IDs: entity-austria, entity-austria-hungary, entity-austrian-empire, entity-austro-hungarian-empire, entity-bosnia-herzegovina, entity-hungary. Linked batches: batch-03.
- **family-russian**: Source USSR appears in 1920 although the curated Union formation is dated 1922. Review civil-war source labels and republic/union relationships without inventing continuity. Source IDs: entity-armenia, entity-azerbaijan, entity-far-eastern-ssr, entity-georgia, entity-russian-empire, entity-south-russia, entity-soviet-union, entity-ukraine, entity-white-russia. Linked batches: batch-06.
- **family-japanese-korean**: Review three imperial/Japan names, occupation authorities and divided Korea; preserve the separate 1947 constitutional profile. Source IDs: entity-empire-of-japan, entity-imperial-japan, entity-japan, entity-japan-usa, entity-korea, entity-korea-democratic-people-s-republic-of, entity-korea-republic-of, entity-korea-usa, entity-korea-ussr, entity-kuril-islands, entity-sakhalin-ru. Linked batches: batch-26.
- **family-chinese**: Determine whether each source grouping describes an administration, constituent territory or multiple polities; no modern-country fallback. Source IDs: entity-china, entity-chinese-warlords, entity-hong-kong, entity-manchu-empire, entity-manchuria, entity-qing-empire, entity-taiwan, entity-tibet, entity-xinjiang. Linked batches: batch-26.
- **family-south-asian**: Source India/Pakistan/Bangladesh dates and administrative scope need review; existing sourced partition dates must remain independent of snapshot names. Source IDs: entity-bangladesh, entity-british-east-india-company, entity-british-raj, entity-ceylon, entity-ceylon-dutch, entity-india, entity-mysore, entity-mysore-indian-princely-state, entity-pakistan, entity-sikkim-indian-princely-state, entity-sri-lanka. Linked batches: batch-24.
- **family-iranian**: Review name continuity and whether plural khanate/group labels can represent one dossier. Source IDs: entity-bokhara-khanate, entity-central-asian-khanates, entity-iran, entity-persia, entity-turan. Linked batches: batch-24.
- **family-ottoman-arabian**: Review empire/constituent scope, mandates, occupation and source labels that may precede named states. Do not reinterpret authority fields as constitutional status. Source IDs: entity-arabia, entity-arabia-nejd, entity-british-protectorate, entity-emirate-of-bin-shal-an, entity-hail, entity-hejaz, entity-iraq, entity-israel, entity-jordan, entity-lebanon, entity-mandatory-palestine-gb, entity-mesopotamia-gb, entity-muscat-and-oman, entity-nejd, entity-oman, entity-oman-british-raj, entity-ottoman-empire, entity-ottoman-sultanate, entity-republic-of-turkey, entity-saudi-arabia, entity-syria, entity-syria-france, entity-trucial-oman, entity-turkey, entity-united-arab-emirates, entity-yemen, entity-yemen-uk. Linked batches: batch-22, batch-23.
- **family-libyan**: Preserve spelling errors as source evidence; review Ottoman/colonial/occupation partitions and later state continuity. Source IDs: entity-cyraneica-uk-lybia, entity-cyrenaica, entity-fezzan-frech-lybia, entity-libya, entity-libya-it, entity-tripolitana-uk-lybia, entity-tripolitania. Linked batches: batch-13.
- **family-congo**: Separate the two Congo source families and review earlier snapshots using Zaire; never derive succession from identical polygons. Source IDs: entity-belgian-congo, entity-congo, entity-congo-france, entity-zaire, entity-zaire-belgium. Linked batches: batch-17.
- **family-african-east**: Review historical-name variants, colonies/occupations and labels such as Tanzania in earlier snapshots; explicit dates need later research. Source IDs: entity-abyssinia, entity-british-east-africa, entity-djibouti, entity-ethiopia, entity-ethiopia-italy, entity-french-somaliland, entity-german-e-africa-tanganyika, entity-kenya, entity-sultanate-of-zanzibar, entity-sultinate-of-zanzibar, entity-tanzania-united-republic-of, entity-zanzibar. Linked batches: batch-19.
- **family-african-south**: Review colonies, unions and source-name substitution; no modern sovereignty is inferred from the shared geographic label. Source IDs: entity-basutoland, entity-german-south-west-africa, entity-lesotho, entity-malawi, entity-namibia, entity-northern-rhodesia, entity-nyasaland, entity-rhodesia, entity-south-africa, entity-southern-rhodesia, entity-union-of-south-africa, entity-zambia, entity-zimbabwe. Linked batches: batch-20.
- **family-indochinese**: Distinguish colonial federation, constituent regions and later states; determine whether differently spelled federation labels share historical identity. Source IDs: entity-annam, entity-cambodia, entity-cochin-china, entity-french-indo-china, entity-french-indochina, entity-laos, entity-tonkin, entity-vietnam. Linked batches: batch-27.
- **family-maritime-asian**: Review colony/state/name continuity and multiple simultaneous source names; do not auto-merge. Source IDs: entity-burma, entity-dutch-east-indies, entity-indonesia, entity-malaya, entity-malaysia, entity-netherlands-indies, entity-rattanakosin-kingdom, entity-siam, entity-thailand. Linked batches: batch-27.
- **family-brazilian**: Establish actual colonial/constitutional periods rather than assuming that the source name is dated correctly. Source IDs: entity-brazil, entity-kingdom-of-brazil, entity-viceroyalty-of-brazil. Linked batches: batch-11.
- **family-maori**: Encoding and accent variants need review; people/land/community labels are not equivalent to the later state. Source IDs: entity-m-ori, entity-maori, entity-new-zealand. Linked batches: batch-28.
- **scope-entity-unnamed-territory**: Does this source label represent one political entity, several communities, an administrative area or merely a cartographic grouping? Establish scope before assigning national institutions. Source IDs: entity-unnamed-territory. Linked batches: batch-01.
- **scope-entity-central-asian-khanates**: Does this source label represent one political entity, several communities, an administrative area or merely a cartographic grouping? Establish scope before assigning national institutions. Source IDs: entity-central-asian-khanates. Linked batches: batch-24.
- **scope-entity-pampas-cultures**: Does this source label represent one political entity, several communities, an administrative area or merely a cartographic grouping? Establish scope before assigning national institutions. Source IDs: entity-pampas-cultures. Linked batches: batch-11.
- **scope-entity-patagonian-shellfish-and-marine-mammal-hunters**: Does this source label represent one political entity, several communities, an administrative area or merely a cartographic grouping? Establish scope before assigning national institutions. Source IDs: entity-patagonian-shellfish-and-marine-mammal-hunters. Linked batches: batch-11.
- **scope-entity-australian-aboriginal-hunter-gatherers**: Does this source label represent one political entity, several communities, an administrative area or merely a cartographic grouping? Establish scope before assigning national institutions. Source IDs: entity-australian-aboriginal-hunter-gatherers. Linked batches: batch-36.
- **scope-entity-africa**: Does this source label represent one political entity, several communities, an administrative area or merely a cartographic grouping? Establish scope before assigning national institutions. Source IDs: entity-africa. Linked batches: batch-01.
- **scope-entity-british-protectorate**: Does this source label represent one political entity, several communities, an administrative area or merely a cartographic grouping? Establish scope before assigning national institutions. Source IDs: entity-british-protectorate. Linked batches: batch-22.
- **existence-entity-soviet-union-1920**: Runtime mapping resolves outside the sourced existence interval. Review the source label and mapping before extending facts. Source IDs: entity-soviet-union. Linked batches: batch-06.
- **scope-entity-chinese-warlords**: Does this source label represent one political entity, several communities, an administrative area or merely a cartographic grouping? Establish scope before assigning national institutions. Source IDs: entity-chinese-warlords. Linked batches: batch-26.
- **scope-entity-saar-protectorate**: Does this source label represent one political entity, several communities, an administrative area or merely a cartographic grouping? Establish scope before assigning national institutions. Source IDs: entity-saar-protectorate. Linked batches: batch-03.

Other questions track source-presence gaps, changing authority/grouping, normalization and repeated-name continuity. Legacy heuristic questions retain state=unresolved for audit traceability; sourced identity decisions and omissions are separately attached to reviewed rows. SUBJECTO/PARTOF are preserved as source evidence and never converted into sovereignty. See manifest.json for the complete question list and per-ID evidence.

## Archived Phase 1 raw audit batches — superseded for political research

Batches partition all 880 IDs once. Uncurated counts sum to 803; existing profiles may still require additional periods/identity review. Counts measure map IDs, not a claim that each is one state. A compound label may require several historical records. Geography is a planning hint from the largest prepared feature; manual overrides/candidate families improve it, but it is not historical evidence. Australian community batches are smaller and have a distinct institutional review approach.

### batch-01 — Unidentified/composite source labels · 1/1

2 identities; 2 uncurated; 0 already mapped. 2 require some research/review before acceptance.

Upstream naming conventions and bibliographic provenance first; do not supply national-state templates.

Included: Africa (entity-africa); Unnamed territory (entity-unnamed-territory).

Difficult cases: Does this source label represent one political entity, several communities, an administrative area or merely a cartographic grouping? Establish scope before assigning national institutions.

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 4 tracked questions touch this batch; complete links are in manifest.json.

### batch-02 — Western/Northern Europe · 1/1

24 identities; 1 uncurated; 23 already mapped. 24 require some research/review before acceptance.

National archives, parliaments, royal archives and statistical libraries; dates and offices remain entity-specific.

Included: Ireland (entity-ireland); United Kingdom of Great Britain and Ireland (entity-united-kingdom-of-great-britain-and-ireland); Kingdom of Ireland (entity-kingdom-of-ireland); United Kingdom (entity-united-kingdom); Denmark (entity-denmark); Sweden (entity-sweden); Sweden–Norway (entity-sweden-norway); Norway (entity-norway); Denmark-Norway (entity-denmark-norway); Malta (entity-malta); Portugal (entity-portugal); Spain (entity-spain); Andorra (entity-andorra); San Marino (entity-san-marino); France (entity-france); Helvetic Republic (entity-helvetic-republic); Switzerland (entity-switzerland); Luxembourg (entity-luxembourg); Austrian Netherlands (entity-austrian-netherlands); Belgium (entity-belgium); Netherlands (entity-netherlands); Batavian Republic (entity-batavian-republic); Finland (entity-finland); Iceland (entity-iceland).

Difficult cases: Review British and Irish name/state/union continuity. Do not extend the current UK profile backward simply because an ID repeats. Review Scandinavian union labels and constituent governments without assuming that a source-name change establishes state succession.

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 10 tracked questions touch this batch; complete links are in manifest.json.

### batch-03 — Central Europe and German/Italian source families · 1/3

21 identities; 1 uncurated; 20 already mapped. 21 require some research/review before acceptance.

Regional/state archives and constitutional collections; establish small-state and imperial scope before statistics.

Included: Germany (France) (entity-germany-france); Germany (USA) (entity-germany-usa); Saar Protectorate (entity-saar-protectorate); West Germany (entity-west-germany); Germany (entity-germany); German Empire (entity-german-empire); East Germany (entity-east-germany); Germany (Soviet) (entity-germany-soviet); Germany (UK) (entity-germany-uk); Prussia (entity-prussia); East Prussia (entity-east-prussia); Bosnia-Herzegovina (entity-bosnia-herzegovina); Hungary (entity-hungary); Austro-Hungarian Empire (entity-austro-hungarian-empire); Austria (entity-austria); Austria Hungary (entity-austria-hungary); Austrian Empire (entity-austrian-empire); Kingdom of the Two Sicilies (entity-kingdom-of-the-two-sicilies); Kingdom of Italy (entity-kingdom-of-italy); Papal States (entity-papal-states); Tuscany (entity-tuscany).

Difficult cases: Distinguish state, constitutional regime, constituent area, occupation zone and later republic. The existing Nazi-period mapping must not cover earlier Germany automatically. Does this source label represent one political entity, several communities, an administrative area or merely a cartographic grouping? Establish scope before assigning national institutions. Review composite monarchy, constituent territory and later state/regime coverage separately. Separate source naming variation, constituent governments and potential unification/succession; no overlap-derived chain.

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 13 tracked questions touch this batch; complete links are in manifest.json.

### batch-04 — Central Europe and German/Italian source families · 2/3

20 identities; 10 uncurated; 10 already mapped. 20 require some research/review before acceptance.

Regional/state archives and constitutional collections; establish small-state and imperial scope before statistics.

Included: Italy (entity-italy); Lucca (entity-lucca); Modena (entity-modena); Parma (entity-parma); Kingdom of Sardinia (entity-kingdom-of-sardinia); Lombardy (entity-lombardy); Venetia (entity-venetia); Massa (entity-massa); Yugoslavia (entity-yugoslavia); Fivizzano (entity-fivizzano); Pontremoli (entity-pontremoli); Hohenzollern (entity-hohenzollern); Württemberg (entity-wurttemberg); Baden (entity-baden); Bavaria (entity-bavaria); Czechoslovakia (entity-czechoslovakia); Palatinate (entity-palatinate); Swabia (entity-swabia); Grand Duchy of Hesse (entity-grand-duchy-of-hesse); Nassau (entity-nassau).

Difficult cases: Separate source naming variation, constituent governments and potential unification/succession; no overlap-derived chain.

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 8 tracked questions touch this batch; complete links are in manifest.json.

### batch-05 — Central Europe and German/Italian source families · 3/3

20 identities; 15 uncurated; 5 already mapped. 20 require some research/review before acceptance.

Regional/state archives and constitutional collections; establish small-state and imperial scope before statistics.

Included: Wetzlar (entity-wetzlar); Thuringia (entity-thuringia); Electoral Hesse (entity-electoral-hesse); Saxony (entity-saxony); Waldeck (entity-waldeck); Brunswick (entity-brunswick); Anhalt (entity-anhalt); Lippe-Detmold (entity-lippe-detmold); Schaumburg-Lippe (entity-schaumburg-lippe); Hanover (entity-hanover); Oldenburg (entity-oldenburg); Bremen (entity-bremen); Mecklenburg-Strelitz (entity-mecklenburg-strelitz); Hamburg (entity-hamburg); Mecklenburg-Schwerin (entity-mecklenburg-schwerin); Lübeck (entity-lubeck); Cuxhaven (entity-cuxhaven); Holstein (entity-holstein); Danzig (entity-danzig); Schleswig (entity-schleswig).

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 3 tracked questions touch this batch; complete links are in manifest.json.

### batch-06 — Eastern Europe, Russian/Soviet and Balkan source families · 1/2

12 identities; 11 uncurated; 1 already mapped. 12 require some research/review before acceptance.

National archives and constitutional treaties; occupation, federation and regime continuity require separate evidence.

Included: Armenia (entity-armenia); Azerbaijan (entity-azerbaijan); Georgia (entity-georgia); South Russia (entity-south-russia); Ukraine (entity-ukraine); Far Eastern SSR (entity-far-eastern-ssr); Russian Empire (entity-russian-empire); USSR (entity-soviet-union); White Russia (entity-white-russia); Cyprus (entity-cyprus); Dodecanese Islands (entity-dodecanese-islands); Greece (entity-greece).

Difficult cases: Runtime mapping resolves outside the sourced existence interval. Review the source label and mapping before extending facts. Source USSR appears in 1920 although the curated Union formation is dated 1922. Review civil-war source labels and republic/union relationships without inventing continuity.

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 9 tracked questions touch this batch; complete links are in manifest.json.

### batch-07 — Eastern Europe, Russian/Soviet and Balkan source families · 2/2

11 identities; 11 uncurated; 0 already mapped. 11 require some research/review before acceptance.

National archives and constitutional treaties; occupation, federation and regime continuity require separate evidence.

Included: Albania (entity-albania); Montenegro (entity-montenegro); Bulgaria (entity-bulgaria); Serbia (entity-serbia); Romania (entity-romania); Republic of Kraków (entity-republic-of-krakow); Poland (entity-poland); Lithuania (entity-lithuania); Latvia (entity-latvia); Estonia (entity-estonia); Finnmark (entity-finnmark).

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 2 tracked questions touch this batch; complete links are in manifest.json.

### batch-08 — North America · 1/1

16 identities; 15 uncurated; 1 already mapped. 16 require some research/review before acceptance.

National/provincial archives; colonial charters and Indigenous institutional sources require distinct treatment.

Included: Guatemala (entity-guatemala); Mexico (entity-mexico); Viceroyalty of New Spain (entity-viceroyalty-of-new-spain); Luisiana (entity-luisiana); United States of America (entity-united-states); Acadian Peninsula (UK) (entity-acadian-peninsula-uk); Quebec (entity-quebec); Dominion of Newfoundland (entity-dominion-of-newfoundland); Suspiaq (entity-suspiaq); Eyaq (entity-eyaq); Rupert's Land (entity-rupert-s-land); Canada (entity-canada); Yup'ik & Cup'ik (entity-yup-ik-and-cup-ik); Inupiaq (entity-inupiaq); T'atsaot'ine (entity-t-atsaot-ine); Greenland (entity-greenland).

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 9 tracked questions touch this batch; complete links are in manifest.json.

### batch-09 — Caribbean and Central America · 1/2

17 identities; 17 uncurated; 0 already mapped. 17 require some research/review before acceptance.

Colonial archives, local national libraries and institutional statistical sources; distinguish islands, administrations and federations.

Included: British Guiana (entity-british-guiana); Venezuela (entity-venezuela); Panama (entity-panama); Costa Rica (entity-costa-rica); Trinidad (entity-trinidad); Grenada (entity-grenada); Netherlands Antilles (entity-netherlands-antilles); Nicaragua (entity-nicaragua); Barbados (entity-barbados); Saint Vincent and the Grenadines (entity-saint-vincent-and-the-grenadines); El Salvador (entity-el-salvador); Saint Lucia (entity-saint-lucia); Martinique (entity-martinique); Martinique (France) (entity-martinique-france); Honduras (entity-honduras); Dominica (entity-dominica); Guadeloupe (entity-guadeloupe).

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 11 tracked questions touch this batch; complete links are in manifest.json.

### batch-10 — Caribbean and Central America · 2/2

16 identities; 16 uncurated; 0 already mapped. 16 require some research/review before acceptance.

Colonial archives, local national libraries and institutional statistical sources; distinguish islands, administrations and federations.

Included: Montserrat (entity-montserrat); Belize (entity-belize); Saint Kitts and Nevis (entity-saint-kitts-and-nevis); Antigua and Barbuda (entity-antigua-and-barbuda); United States Virgin Islands (entity-united-states-virgin-islands); Saint Barthelemy (entity-saint-barthelemy); Saint Martin (entity-saint-martin); Jamaica (entity-jamaica); Jamaica (UK) (entity-jamaica-uk); Anguilla (entity-anguilla); Puerto Rico (entity-puerto-rico); Dominican Republic (entity-dominican-republic); Haiti (entity-haiti); Cuba (entity-cuba); Turks and Caicos Islands (entity-turks-and-caicos-islands); Bahamas (entity-bahamas).

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 6 tracked questions touch this batch; complete links are in manifest.json.

### batch-11 — South America · 1/2

15 identities; 15 uncurated; 0 already mapped. 15 require some research/review before acceptance.

National archives, independence-era documents and historical censuses; do not equate viceroyalties with modern states.

Included: Kingdom of Brazil (entity-kingdom-of-brazil); Viceroyalty of Brazil (entity-viceroyalty-of-brazil); Brazil (entity-brazil); Patagonian shellfish and marine mammal hunters (entity-patagonian-shellfish-and-marine-mammal-hunters); Pampas cultures (entity-pampas-cultures); Mapuche (entity-mapuche); Chile (entity-chile); Argentina (entity-argentina); Uruguay (entity-uruguay); United Provinces of the Río de la Plata (entity-united-provinces-of-the-rio-de-la-plata); Viceroyalty of the Río de la Plata (entity-viceroyalty-of-the-rio-de-la-plata); Rapa Nui (entity-rapa-nui); Paraguay (entity-paraguay); Tonga (entity-tonga); Niue (entity-niue).

Difficult cases: Does this source label represent one political entity, several communities, an administrative area or merely a cartographic grouping? Establish scope before assigning national institutions. Establish actual colonial/constitutional periods rather than assuming that the source name is dated correctly.

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 9 tracked questions touch this batch; complete links are in manifest.json.

### batch-12 — South America · 2/2

15 identities; 15 uncurated; 0 already mapped. 15 require some research/review before acceptance.

National archives, independence-era documents and historical censuses; do not equate viceroyalties with modern states.

Included: Bolivia (entity-bolivia); Viceroyalty of Peru (entity-viceroyalty-of-peru); American Samoa (entity-american-samoa); Wallis and Futuna Islands (entity-wallis-and-futuna-islands); Samoa (entity-samoa); Peru (entity-peru); Shuar (entity-shuar); Ecuador (entity-ecuador); Viceroyalty of New Granada (entity-viceroyalty-of-new-granada); French Guiana (entity-french-guiana); Colombia (entity-colombia); Dutch Guiana (entity-dutch-guiana); Suriname (entity-suriname); Guiana (entity-guiana); Guyana (entity-guyana).

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 5 tracked questions touch this batch; complete links are in manifest.json.

### batch-13 — North Africa and Saharan source families · 1/1

23 identities; 23 uncurated; 0 already mapped. 23 require some research/review before acceptance.

Local archives plus Ottoman/colonial records; distinguish administrative partitions and wider imperial authority.

Included: Cyraneica (UK Lybia) (entity-cyraneica-uk-lybia); Fezzan (Frech Lybia) (entity-fezzan-frech-lybia); Libya (entity-libya); Libya (IT) (entity-libya-it); Tripolitana (UK Lybia) (entity-tripolitana-uk-lybia); Tripolitania (entity-tripolitania); Cyrenaica (entity-cyrenaica); Mauritania (entity-mauritania); Air (entity-air); Rio De Oro (entity-rio-de-oro); Western Sahara (entity-western-sahara); Egypt (entity-egypt); Spanish Sahara (entity-spanish-sahara); Algeria (entity-algeria); Algeria (France) (entity-algeria-france); Guanches (entity-guanches); Morocco (entity-morocco); Morocco (France) (entity-morocco-france); Tunisia (entity-tunisia); Algiers (entity-algiers); Algeria (FR) (entity-algeria-fr); Spanish Morocco (entity-spanish-morocco); Tunis (entity-tunis).

Difficult cases: Preserve spelling errors as source evidence; review Ottoman/colonial/occupation partitions and later state continuity.

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 24 tracked questions touch this batch; complete links are in manifest.json.

### batch-14 — West Africa · 1/3

17 identities; 17 uncurated; 0 already mapped. 17 require some research/review before acceptance.

Local archives, scholarly regional collections and colonial records; confederacies and community labels require scope review.

Included: Opobo (entity-opobo); Calabar (entity-calabar); Accra (entity-accra); Gold Coast (GB) (entity-gold-coast-gb); Southern Cameroon (entity-southern-cameroon); Fante (entity-fante); Ato trading confederacy (entity-ato-trading-confederacy); Liberia (entity-liberia); Asante (entity-asante); Cotonou (entity-cotonou); Lagos (entity-lagos); Dahomey (entity-dahomey); Ivory Coast (entity-ivory-coast); Ibadan (entity-ibadan); Ghana (entity-ghana); Gold Coast (entity-gold-coast); Togoland (entity-togoland).

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 9 tracked questions touch this batch; complete links are in manifest.json.

### batch-15 — West Africa · 2/3

17 identities; 17 uncurated; 0 already mapped. 17 require some research/review before acceptance.

Local archives, scholarly regional collections and colonial records; confederacies and community labels require scope review.

Included: Sierra Leone (entity-sierra-leone); Togo (entity-togo); Second Samori Empire (entity-second-samori-empire); Oyo (entity-oyo); Nigeria (entity-nigeria); Benin (entity-benin); Kong Empire (entity-kong-empire); First Samori Empire (entity-first-samori-empire); Guinea (entity-guinea); Borgu States (entity-borgu-states); Wassoulou Empire (entity-wassoulou-empire); Mossi States (entity-mossi-states); Fulani Empire (entity-fulani-empire); Futa Jalon (entity-futa-jalon); Guinea-Bissau (entity-guinea-bissau); Guinea-Bissau (Portugal) (entity-guinea-bissau-portugal); Portuguese Guinea (entity-portuguese-guinea).

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 8 tracked questions touch this batch; complete links are in manifest.json.

### batch-16 — West Africa · 3/3

17 identities; 17 uncurated; 0 already mapped. 17 require some research/review before acceptance.

Local archives, scholarly regional collections and colonial records; confederacies and community labels require scope review.

Included: Burkina Faso (entity-burkina-faso); Sokoto Caliphate (entity-sokoto-caliphate); Hausa States (entity-hausa-states); Kong (entity-kong); Gambia, The (entity-gambia-the); Gambia (entity-gambia); Kaarta (entity-kaarta); Songhai (entity-songhai); Tukular Caliphate (entity-tukular-caliphate); Futa Toro (entity-futa-toro); Senegal (entity-senegal); Segu (entity-segu); Senegal (FR) (entity-senegal-fr); French West Africa (entity-french-west-africa); Mali (entity-mali); Dendi Kingdom (entity-dendi-kingdom); Niger (entity-niger).

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 8 tracked questions touch this batch; complete links are in manifest.json.

### batch-17 — Central Africa · 1/2

20 identities; 20 uncurated; 0 already mapped. 20 require some research/review before acceptance.

Regional archives, local institutional histories and colonial records; Congo/Zaire naming and composite labels require priority review.

Included: Belgian Congo (entity-belgian-congo); Zaire (entity-zaire); Zaire (Belgium) (entity-zaire-belgium); Congo (entity-congo); Congo (France) (entity-congo-france); Angola (entity-angola); Angola (Portugal) (entity-angola-portugal); Barotse (entity-barotse); Ovimbundu (entity-ovimbundu); Yeke (entity-yeke); Imbangala (entity-imbangala); Mbailundu (entity-mbailundu); Lunda (entity-lunda); Yaka (entity-yaka); Luba (entity-luba); Kuba (entity-kuba); Teke (entity-teke); Burundi (entity-burundi); Sultanate of Utetera (entity-sultanate-of-utetera); Rwanda (entity-rwanda).

Difficult cases: Separate the two Congo source families and review earlier snapshots using Zaire; never derive succession from identical polygons.

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 15 tracked questions touch this batch; complete links are in manifest.json.

### batch-18 — Central Africa · 2/2

20 identities; 20 uncurated; 0 already mapped. 20 require some research/review before acceptance.

Regional archives, local institutional histories and colonial records; Congo/Zaire naming and composite labels require priority review.

Included: Rwanda (Belgium) (entity-rwanda-belgium); Nkore (entity-nkore); Gabon (entity-gabon); Equatorial Guinea (entity-equatorial-guinea); Spanish Guinea (entity-spanish-guinea); Kamerun (entity-kamerun); Cameroon (entity-cameroon); French Cameroons (entity-french-cameroons); Central African Republic (entity-central-african-republic); Bagirmi (entity-bagirmi); Rabih az-Zubayr (entity-rabih-az-zubayr); French Equatorial Africa (entity-french-equatorial-africa); Sudan (entity-sudan); Anglo-Egyptian Sudan (entity-anglo-egyptian-sudan); Wadai (entity-wadai); Kanem-Bornu (entity-kanem-bornu); Chad (entity-chad); Darfur (entity-darfur); Wadai Empire (entity-wadai-empire); Sultanate of Damagaram (entity-sultanate-of-damagaram).

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 9 tracked questions touch this batch; complete links are in manifest.json.

### batch-19 — East Africa and Horn · 1/1

25 identities; 25 uncurated; 0 already mapped. 25 require some research/review before acceptance.

Local archives and historical administrative publications; different names and authority fields do not prove succession.

Included: Tanzania, United Republic of (entity-tanzania-united-republic-of); German E. Africa (Tanganyika) (entity-german-e-africa-tanganyika); Sultinate of Zanzibar (entity-sultinate-of-zanzibar); Sultanate of Zanzibar (entity-sultanate-of-zanzibar); Zanzibar (entity-zanzibar); British East Africa (entity-british-east-africa); Kenya (entity-kenya); Abyssinia (entity-abyssinia); Ethiopia (entity-ethiopia); Ethiopia (Italy) (entity-ethiopia-italy); Djibouti (entity-djibouti); French Somaliland (entity-french-somaliland); Shona (entity-shona); Kazembe (entity-kazembe); Mirambo Unyanyembe Ukimbu (entity-mirambo-unyanyembe-ukimbu); Rift Valley States (entity-rift-valley-states); Buganda (entity-buganda); Uganda (entity-uganda); Bunyoro (entity-bunyoro); Italian Somaliland (entity-italian-somaliland); Oromo (entity-oromo); Somalia (entity-somalia); British Somaliland (entity-british-somaliland); Harer (Egypt) (entity-harer-egypt); Funj (entity-funj).

Difficult cases: Review historical-name variants, colonies/occupations and labels such as Tanzania in earlier snapshots; explicit dates need later research.

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 16 tracked questions touch this batch; complete links are in manifest.json.

### batch-20 — Southern Africa · 1/2

20 identities; 20 uncurated; 0 already mapped. 20 require some research/review before acceptance.

Local archives, regional constitutional histories and colonial collections; distinguish unions, colonies and community labels.

Included: Lesotho (entity-lesotho); Basutoland (entity-basutoland); South Africa (entity-south-africa); Union of South Africa (entity-union-of-south-africa); German South-West Africa (entity-german-south-west-africa); Namibia (entity-namibia); Rhodesia (entity-rhodesia); Southern Rhodesia (entity-southern-rhodesia); Zimbabwe (entity-zimbabwe); Malawi (entity-malawi); Nyasaland (entity-nyasaland); Northern Rhodesia (entity-northern-rhodesia); Zambia (entity-zambia); Xhosa (entity-xhosa); Dutch settlements (entity-dutch-settlements); Cape Colony (entity-cape-colony); Natal (entity-natal); Zulu (entity-zulu); Griqualand West (entity-griqualand-west); Orange Free State (entity-orange-free-state).

Difficult cases: Review colonies, unions and source-name substitution; no modern sovereignty is inferred from the shared geographic label.

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 15 tracked questions touch this batch; complete links are in manifest.json.

### batch-21 — Southern Africa · 2/2

19 identities; 19 uncurated; 0 already mapped. 19 require some research/review before acceptance.

Local archives, regional constitutional histories and colonial collections; distinguish unions, colonies and community labels.

Included: Zululand (entity-zululand); Swaziland (entity-swaziland); Delagoa Bay (entity-delagoa-bay); Transvaal (entity-transvaal); Walbis Bay (entity-walbis-bay); Ngwato (entity-ngwato); Botswana (entity-botswana); Rozwi (entity-rozwi); Merina Kingdom (entity-merina-kingdom); Madagascar (entity-madagascar); Madagascar (France) (entity-madagascar-france); Ndebele (entity-ndebele); Imerina (entity-imerina); Portuguese East Africa (entity-portuguese-east-africa); Mozambique (entity-mozambique); Mozambique (Portugal) (entity-mozambique-portugal); Lozi (entity-lozi); Nguni (entity-nguni); Sotho (entity-sotho).

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 11 tracked questions touch this batch; complete links are in manifest.json.

### batch-22 — Middle East and Arabian source families · 1/2

16 identities; 16 uncurated; 0 already mapped. 16 require some research/review before acceptance.

Local/Ottoman archives and mandate records; treaties and administrative authority require specific evidence.

Included: Yemen (entity-yemen); Yemen (UK) (entity-yemen-uk); British Protectorate (entity-british-protectorate); Oman (British Raj) (entity-oman-british-raj); Muscat and Oman (entity-muscat-and-oman); Oman (entity-oman); Hejaz (entity-hejaz); Nejd (entity-nejd); Emirate of Bin Shal'an (entity-emirate-of-bin-shal-an); Arabia (entity-arabia); Trucial Oman (entity-trucial-oman); United Arab Emirates (entity-united-arab-emirates); Saudi Arabia (entity-saudi-arabia); Arabia (Nejd) (entity-arabia-nejd); Hail (entity-hail); Jordan (entity-jordan).

Difficult cases: Does this source label represent one political entity, several communities, an administrative area or merely a cartographic grouping? Establish scope before assigning national institutions. Review empire/constituent scope, mandates, occupation and source labels that may precede named states. Do not reinterpret authority fields as constitutional status.

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 11 tracked questions touch this batch; complete links are in manifest.json.

### batch-23 — Middle East and Arabian source families · 2/2

16 identities; 16 uncurated; 0 already mapped. 16 require some research/review before acceptance.

Local/Ottoman archives and mandate records; treaties and administrative authority require specific evidence.

Included: Israel (entity-israel); Mandatory Palestine (GB) (entity-mandatory-palestine-gb); Mesopotamia (GB) (entity-mesopotamia-gb); Iraq (entity-iraq); Ottoman Empire (entity-ottoman-empire); Lebanon (entity-lebanon); Syria (entity-syria); Syria (France) (entity-syria-france); Turkey (entity-turkey); Republic of Turkey (entity-republic-of-turkey); Ottoman Sultanate (entity-ottoman-sultanate); Awsa (entity-awsa); Eritrea (entity-eritrea); Eritrea (Italy) (entity-eritrea-italy); Qatar (entity-qatar); Kuwait (entity-kuwait).

Difficult cases: Review empire/constituent scope, mandates, occupation and source labels that may precede named states. Do not reinterpret authority fields as constitutional status.

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 10 tracked questions touch this batch; complete links are in manifest.json.

### batch-24 — South/Central Asia · 1/2

20 identities; 19 uncurated; 1 already mapped. 20 require some research/review before acceptance.

India Office/Parliament, local archives and regional scholarship; princely states, Company rule, Raj and partition need separate identities.

Included: Iran (entity-iran); Persia (entity-persia); Bokhara Khanate (entity-bokhara-khanate); central Asian khanates (entity-central-asian-khanates); Turan (entity-turan); Ceylon (Dutch) (entity-ceylon-dutch); Ceylon (entity-ceylon); Sri Lanka (entity-sri-lanka); Mysore (entity-mysore); Mysore (Indian princely state) (entity-mysore-indian-princely-state); British East India Company (entity-british-east-india-company); India (entity-india); Bangladesh (entity-bangladesh); British Raj (entity-british-raj); Sikkim (Indian princely state) (entity-sikkim-indian-princely-state); Pakistan (entity-pakistan); Kandy (entity-kandy); Travancore (entity-travancore); Cochin (entity-cochin); Malabar (entity-malabar).

Difficult cases: Does this source label represent one political entity, several communities, an administrative area or merely a cartographic grouping? Establish scope before assigning national institutions. Review name continuity and whether plural khanate/group labels can represent one dossier. Source India/Pakistan/Bangladesh dates and administrative scope need review; existing sourced partition dates must remain independent of snapshot names.

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 10 tracked questions touch this batch; complete links are in manifest.json.

### batch-25 — South/Central Asia · 2/2

20 identities; 20 uncurated; 0 already mapped. 20 require some research/review before acceptance.

India Office/Parliament, local archives and regional scholarship; princely states, Company rule, Raj and partition need separate identities.

Included: Carnatic (entity-carnatic); Madras (entity-madras); Kanara (entity-kanara); Ambur (entity-ambur); Goa (entity-goa); Gooty (entity-gooty); Nizam's Dominions (entity-nizam-s-dominions); Circars (entity-circars); Arakan (entity-arakan); Maratha Confederacy (entity-maratha-confederacy); Bundelkhand (entity-bundelkhand); Sindh (entity-sindh); Rajputs (entity-rajputs); Assam (entity-assam); Oudh (entity-oudh); Bhutan (entity-bhutan); Nepal (entity-nepal); Bahawalpur (entity-bahawalpur); Sikhs (entity-sikhs); Afghanistan (entity-afghanistan).

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 1 tracked questions touch this batch; complete links are in manifest.json.

### batch-26 — East Asia · 1/1

21 identities; 5 uncurated; 16 already mapped. 21 require some research/review before acceptance.

National archives, official cabinet chronologies and occupation records; constitutional continuity cannot be inferred from labels.

Included: Hong Kong (entity-hong-kong); Taiwan (entity-taiwan); Tibet (entity-tibet); Chinese Warlords (entity-chinese-warlords); Manchu Empire (entity-manchu-empire); China (entity-china); Qing Empire (entity-qing-empire); Xinjiang (entity-xinjiang); Manchuria (entity-manchuria); Korea (USA) (entity-korea-usa); Korea, Republic of (entity-korea-republic-of); Japan (entity-japan); Japan (USA) (entity-japan-usa); Imperial Japan (entity-imperial-japan); Korea (entity-korea); Korea (USSR) (entity-korea-ussr); Korea, Democratic People's Republic of (entity-korea-democratic-people-s-republic-of); Empire of Japan (entity-empire-of-japan); Kuril Islands (entity-kuril-islands); Sakhalin (RU) (entity-sakhalin-ru); Mongolia (entity-mongolia).

Difficult cases: Determine whether each source grouping describes an administration, constituent territory or multiple polities; no modern-country fallback. Does this source label represent one political entity, several communities, an administrative area or merely a cartographic grouping? Establish scope before assigning national institutions. Review three imperial/Japan names, occupation authorities and divided Korea; preserve the separate 1947 constitutional profile.

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 14 tracked questions touch this batch; complete links are in manifest.json.

### batch-27 — Southeast Asia · 1/1

20 identities; 20 uncurated; 0 already mapped. 20 require some research/review before acceptance.

Local national archives and Dutch/French/British collections; colony, constituent region and occupation periods require explicit scope.

Included: Cochin China (entity-cochin-china); Cambodia (entity-cambodia); Annam (entity-annam); French Indochina (entity-french-indochina); Vietnam (entity-vietnam); French Indo-China (entity-french-indo-china); Laos (entity-laos); Tonkin (entity-tonkin); Dutch East Indies (entity-dutch-east-indies); Indonesia (entity-indonesia); Netherlands Indies (entity-netherlands-indies); Malaya (entity-malaya); Malaysia (entity-malaysia); Rattanakosin Kingdom (entity-rattanakosin-kingdom); Siam (entity-siam); Thailand (entity-thailand); Burma (entity-burma); Brunei (entity-brunei); Philippines (entity-philippines); Đại Việt (entity-ai-viet).

Difficult cases: Distinguish colonial federation, constituent regions and later states; determine whether differently spelled federation labels share historical identity. Review colony/state/name continuity and multiple simultaneous source names; do not auto-merge.

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 21 tracked questions touch this batch; complete links are in manifest.json.

### batch-28 — Pacific/Oceania states and administrations · 1/1

23 identities; 23 uncurated; 0 already mapped. 23 require some research/review before acceptance.

Local archives, Pacific scholarly collections and community-authorised histories; standards and colonial administrations require careful applicability.

Included: M?ori (entity-m-ori); Māori (entity-maori); New Zealand (entity-new-zealand); Victoria (UK) (entity-victoria-uk); New South Wales (UK) (entity-new-south-wales-uk); South Australia (UK) (entity-south-australia-uk); Polynesians (entity-polynesians); New South Wales (entity-new-south-wales); Australia (entity-australia); Western Australia (UK) (entity-western-australia-uk); Queensland (UK) (entity-queensland-uk); New Caledonia (entity-new-caledonia); Northern Territory (UK) (entity-northern-territory-uk); Fiji (entity-fiji); Tuʻi Tonga Empire (entity-tu-i-tonga-empire); New Hebrides (entity-new-hebrides); Papua New Guinea (entity-papua-new-guinea); Papuans (entity-papuans); Dutch Guinea (entity-dutch-guinea); Gilbert and Ellice Islands (entity-gilbert-and-ellice-islands); Guam (entity-guam); Saipan (entity-saipan); Kingdom of Hawaii (entity-kingdom-of-hawaii).

Difficult cases: Encoding and accent variants need review; people/land/community labels are not equivalent to the later state.

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 19 tracked questions touch this batch; complete links are in manifest.json.

### batch-29 — Australian source-defined communities · 1/19

20 identities; 20 uncurated; 0 already mapped. 20 require some research/review before acceptance.

Upstream bibliography and relevant community-authorised institutions first. Establish whether labels describe language, people, land or governance; sovereignty/state-office templates are inappropriate.

Included: Aboriginal Tasmanians (entity-aboriginal-tasmanians); Gadubanud (entity-gadubanud); Boonwurrung (entity-boonwurrung); Gulidjan (entity-gulidjan); Giraiwurung (entity-giraiwurung); Djargurdwurung (entity-djargurdwurung); Gunditjmara (entity-gunditjmara); Kurnai (entity-kurnai); Wathaurong (entity-wathaurong); Wurundjeri (entity-wurundjeri); Buandig (entity-buandig); Djabwurung (entity-djabwurung); Bidwell (entity-bidwell); Jardwadjali (entity-jardwadjali); Taungurung (entity-taungurung); Dja Dja Wurrung (entity-dja-dja-wurrung); Jaitmatang (entity-jaitmatang); Bindjali (entity-bindjali); Waveroo (entity-waveroo); Ngurraiillam (entity-ngurraiillam).

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 1 tracked questions touch this batch; complete links are in manifest.json.

### batch-30 — Australian source-defined communities · 2/19

20 identities; 20 uncurated; 0 already mapped. 20 require some research/review before acceptance.

Upstream bibliography and relevant community-authorised institutions first. Establish whether labels describe language, people, land or governance; sovereignty/state-office templates are inappropriate.

Included: Ngarigo (entity-ngarigo); Ngarrindjeri (entity-ngarrindjeri); Yuin (entity-yuin); Yorta Yorta (entity-yorta-yorta); Baraba Baraba (entity-baraba-baraba); Wergaia (entity-wergaia); Ngambri (entity-ngambri); Ngargad (entity-ngargad); Wemba Wemba (entity-wemba-wemba); Wadi Wadi (entity-wadi-wadi); Ngunawal (entity-ngunawal); Peramangk (entity-peramangk); Minang (entity-minang); Dadi Dadi (entity-dadi-dadi); Gundungurra (entity-gundungurra); Narangga (entity-narangga); Tharawal (entity-tharawal); Latje Latje (entity-latje-latje); Nari Nari (entity-nari-nari); Bibbulman (entity-bibbulman).

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 2 tracked questions touch this batch; complete links are in manifest.json.

### batch-31 — Australian source-defined communities · 3/19

20 identities; 20 uncurated; 0 already mapped. 20 require some research/review before acceptance.

Upstream bibliography and relevant community-authorised institutions first. Establish whether labels describe language, people, land or governance; sovereignty/state-office templates are inappropriate.

Included: Kureinji (entity-kureinji); Kaurna Pangkarra (entity-kaurna-pangkarra); Madi Madi (entity-madi-madi); Meru (entity-meru); Wardandi (entity-wardandi); Eora (entity-eora); Goreng (entity-goreng); Dharug (entity-dharug); Wiradjuri (entity-wiradjuri); Kaniyang (entity-kaniyang); Nawu (entity-nawu); Yitha Yitha (entity-yitha-yitha); Wudjari (entity-wudjari); Guringai (entity-guringai); Darkinung (entity-darkinung); Ngadjuri (entity-ngadjuri); Awabakal (entity-awabakal); Wiilman (entity-wiilman); Barkindji (entity-barkindji); Nukunu (entity-nukunu).

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 2 tracked questions touch this batch; complete links are in manifest.json.

### batch-32 — Australian source-defined communities · 4/19

20 identities; 20 uncurated; 0 already mapped. 20 require some research/review before acceptance.

Upstream bibliography and relevant community-authorised institutions first. Establish whether labels describe language, people, land or governance; sovereignty/state-office templates are inappropriate.

Included: Barindji (entity-barindji); Pinjarup (entity-pinjarup); Danggali (entity-danggali); Wonnarua (entity-wonnarua); Banggarla (entity-banggarla); Worimi (entity-worimi); Ngatjumay (entity-ngatjumay); Nyaki-nyaki (entity-nyaki-nyaki); Kalaako/Malpa (entity-kalaako-malpa); Geawegal (entity-geawegal); Wiljali (entity-wiljali); Wajuk (entity-wajuk); Biripi (entity-biripi); Wongaibon (entity-wongaibon); Mirning (entity-mirning); Wirangu (entity-wirangu); Ballardong (entity-ballardong); Wandjiwalgu (entity-wandjiwalgu); Andyamathanha (entity-andyamathanha); Wailwan (entity-wailwan).

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 2 tracked questions touch this batch; complete links are in manifest.json.

### batch-33 — Australian source-defined communities · 5/19

20 identities; 20 uncurated; 0 already mapped. 20 require some research/review before acceptance.

Upstream bibliography and relevant community-authorised institutions first. Establish whether labels describe language, people, land or governance; sovereignty/state-office templates are inappropriate.

Included: Dainggatti (entity-dainggatti); Yuat (entity-yuat); Malyangaba (entity-malyangaba); Bandjigali (entity-bandjigali); Nganyaywana (entity-nganyaywana); Kuyani (entity-kuyani); Kamilaroi (entity-kamilaroi); Barundji (entity-barundji); Kalaamaya (entity-kalaamaya); Gumbainggir (entity-gumbainggir); Wangkathaa (entity-wangkathaa); Barranbinya (entity-barranbinya); Gunu (entity-gunu); Amangu (entity-amangu); Nyanganyatjara (entity-nyanganyatjara); Pirlatapa (entity-pirlatapa); Wadigali (entity-wadigali); Kokatha (entity-kokatha); Karenggapa (entity-karenggapa); Ngalea (entity-ngalea).

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 2 tracked questions touch this batch; complete links are in manifest.json.

### batch-34 — Australian source-defined communities · 6/19

20 identities; 20 uncurated; 0 already mapped. 20 require some research/review before acceptance.

Upstream bibliography and relevant community-authorised institutions first. Establish whether labels describe language, people, land or governance; sovereignty/state-office templates are inappropriate.

Included: Muruwari (entity-muruwari); Ngarabal (entity-ngarabal); Bundjalung (entity-bundjalung); Dhirari (entity-dhirari); Arabana (entity-arabana); Budjari (entity-budjari); Kullilla (entity-kullilla); Dieri (entity-dieri); Kunja (entity-kunja); Yandruwandha (entity-yandruwandha); Badimaya (entity-badimaya); Kuwarra (entity-kuwarra); Bigambul (entity-bigambul); Yugambeh (entity-yugambeh); Kooma (entity-kooma); Tjalkanti (entity-tjalkanti); Nhanta (entity-nhanta); Yuggera (entity-yuggera); Turrbal (entity-turrbal); Antakarinja (entity-antakarinja).

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 2 tracked questions touch this batch; complete links are in manifest.json.

### batch-35 — Australian source-defined communities · 7/19

20 identities; 20 uncurated; 0 already mapped. 20 require some research/review before acceptance.

Upstream bibliography and relevant community-authorised institutions first. Establish whether labels describe language, people, land or governance; sovereignty/state-office templates are inappropriate.

Included: Mandjindja (entity-mandjindja); Nakako (entity-nakako); Margany (entity-margany); Wangkumara (entity-wangkumara); Yankuntjatjara (entity-yankuntjatjara); Mandandanji (entity-mandandanji); Yawarawarka (entity-yawarawarka); Tjupany (entity-tjupany); Ngamini (entity-ngamini); Nana (entity-nana); Barunggam (entity-barunggam); Gunggari (entity-gunggari); Wangkangurru (entity-wangkangurru); Malkana (entity-malkana); Karangura (entity-karangura); Waka Waka (entity-waka-waka); Watjarri (entity-watjarri); Dyungungoo (Gubbi Gubbi) (entity-dyungungoo-gubbi-gubbi); Pitjantjatjara (entity-pitjantjatjara); Yarluyandi (entity-yarluyandi).

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 2 tracked questions touch this batch; complete links are in manifest.json.

### batch-36 — Australian source-defined communities · 8/19

20 identities; 20 uncurated; 0 already mapped. 20 require some research/review before acceptance.

Upstream bibliography and relevant community-authorised institutions first. Establish whether labels describe language, people, land or governance; sovereignty/state-office templates are inappropriate.

Included: Badtjala (entity-badtjala); Ngaanyatjarra (entity-ngaanyatjarra); Nguri (entity-nguri); Gungabula (entity-gungabula); Yiman (entity-yiman); Dharawala (entity-dharawala); Birria (entity-birria); Bidjara (entity-bidjara); Wuli-wuli (entity-wuli-wuli); Yinggarda (entity-yinggarda); Ngatatjara (entity-ngatatjara); Wawula (entity-wawula); Mithaka (entity-mithaka); Australian aboriginal hunter-gatherers (entity-australian-aboriginal-hunter-gatherers); Karuwali (entity-karuwali); Garingbal (entity-garingbal); Luritja (entity-luritja); Gureng Gureng (entity-gureng-gureng); Wadjigu (entity-wadjigu); Warriyangga (entity-warriyangga).

Difficult cases: Does this source label represent one political entity, several communities, an administrative area or merely a cartographic grouping? Establish scope before assigning national institutions.

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 3 tracked questions touch this batch; complete links are in manifest.json.

### batch-37 — Australian source-defined communities · 9/19

20 identities; 20 uncurated; 0 already mapped. 20 require some research/review before acceptance.

Upstream bibliography and relevant community-authorised institutions first. Establish whether labels describe language, people, land or governance; sovereignty/state-office templates are inappropriate.

Included: Maya (entity-maya); Kuungkari (entity-kuungkari); Arrernte (entity-arrernte); Ngalawangka (entity-ngalawangka); Tharrgari (entity-tharrgari); Gangulu (entity-gangulu); Wangkamana (entity-wangkamana); Bayali (entity-bayali); Gayiri (entity-gayiri); Thiin (entity-thiin); Yinhawangka (entity-yinhawangka); Maiawali (entity-maiawali); Payungu (entity-payungu); Mardu (entity-mardu); Jiwarli (entity-jiwarli); Pitta-Pitta (entity-pitta-pitta); Iningai (entity-iningai); Purduna (entity-purduna); Yagalingu (entity-yagalingu); Jurruru (entity-jurruru).

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 2 tracked questions touch this batch; complete links are in manifest.json.

### batch-38 — Australian source-defined communities · 10/19

20 identities; 20 uncurated; 0 already mapped. 20 require some research/review before acceptance.

Upstream bibliography and relevant community-authorised institutions first. Establish whether labels describe language, people, land or governance; sovereignty/state-office templates are inappropriate.

Included: Darumbal (entity-darumbal); Gabalbara (entity-gabalbara); Wangan (entity-wangan); Banjima (entity-banjima); Alyawarre (entity-alyawarre); Pinikura (entity-pinikura); Pintupi (entity-pintupi); Palyku (entity-palyku); Andegerebenha (entity-andegerebenha); Thalanyji (entity-thalanyji); Anmatyerre (entity-anmatyerre); Guwinmal (entity-guwinmal); Guwa (entity-guwa); Yambina (entity-yambina); Kurrama (entity-kurrama); Yanda (entity-yanda); Barna (entity-barna); Baradha (entity-baradha); Miyan (entity-miyan); Yalarrnga (entity-yalarrnga).

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 2 tracked questions touch this batch; complete links are in manifest.json.

### batch-39 — Australian source-defined communities · 11/19

20 identities; 20 uncurated; 0 already mapped. 20 require some research/review before acceptance.

Upstream bibliography and relevant community-authorised institutions first. Establish whether labels describe language, people, land or governance; sovereignty/state-office templates are inappropriate.

Included: Nhuwala (entity-nhuwala); Yindjibarndi (entity-yindjibarndi); Warluwarra (entity-warluwarra); Kaytej (entity-kaytej); Yirandali (entity-yirandali); Yangga (entity-yangga); Nyamal (entity-nyamal); Yuwi (entity-yuwi); Yulparitja (entity-yulparitja); Wunumara (entity-wunumara); Bularnu (entity-bularnu); Martuthunira (entity-martuthunira); Yilba (entity-yilba); Kalkadoon (entity-kalkadoon); Ngarluma (entity-ngarluma); Kariyarra (entity-kariyarra); Biri (entity-biri); Jaburrara (entity-jaburrara); Nyangumarda (entity-nyangumarda); Kukatja (entity-kukatja).

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 2 tracked questions touch this batch; complete links are in manifest.json.

### batch-40 — Australian source-defined communities · 12/19

20 identities; 20 uncurated; 0 already mapped. 20 require some research/review before acceptance.

Upstream bibliography and relevant community-authorised institutions first. Establish whether labels describe language, people, land or governance; sovereignty/state-office templates are inappropriate.

Included: Giya (entity-giya); Warlpiri (entity-warlpiri); Ngarti (entity-ngarti); Ngarla (entity-ngarla); Mbara (entity-mbara); Mayi-Thakurti (entity-mayi-thakurti); Ngawun (entity-ngawun); Yuru (entity-yuru); Wakaya (entity-wakaya); Thul Garrie Waja (Bindal) (entity-thul-garrie-waja-bindal); Warumungu (entity-warumungu); Wulgurukaba (entity-wulgurukaba); Wakabunga (entity-wakabunga); Walmatjarri (entity-walmatjarri); Mangala (entity-mangala); Gugu-Badhun (entity-gugu-badhun); Yanga (entity-yanga); Mayi-Yapi (entity-mayi-yapi); Nyawaygi (entity-nyawaygi); Mayi-Kutuna (entity-mayi-kutuna).

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 2 tracked questions touch this batch; complete links are in manifest.json.

### batch-41 — Australian source-defined communities · 13/19

20 identities; 20 uncurated; 0 already mapped. 20 require some research/review before acceptance.

Upstream bibliography and relevant community-authorised institutions first. Establish whether labels describe language, people, land or governance; sovereignty/state-office templates are inappropriate.

Included: Mayi-Kulan (entity-mayi-kulan); Karajarri (entity-karajarri); Jaru (entity-jaru); Warlmanpa (entity-warlmanpa); Nguburinji (entity-nguburinji); Gooniyandi (entity-gooniyandi); Wargamaygan (entity-wargamaygan); Walangama (entity-walangama); Wambaya (entity-wambaya); Yawuru (entity-yawuru); Kukatj (entity-kukatj); Takalak (entity-takalak); Nyikina (entity-nyikina); Agwarmin (entity-agwarmin); Waanyi (entity-waanyi); Jukun (entity-jukun); Mingin (entity-mingin); Punuba (entity-punuba); Djirbalngan (entity-djirbalngan); Gurindji (entity-gurindji).

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 2 tracked questions touch this batch; complete links are in manifest.json.

### batch-42 — Australian source-defined communities · 14/19

20 identities; 20 uncurated; 0 already mapped. 20 require some research/review before acceptance.

Upstream bibliography and relevant community-authorised institutions first. Establish whether labels describe language, people, land or governance; sovereignty/state-office templates are inappropriate.

Included: Kuthant (entity-kuthant); Ngumbarl (entity-ngumbarl); Nimanburu (entity-nimanburu); Ganggalida (entity-ganggalida); Mbabaram (entity-mbabaram); Gunindiri (entity-gunindiri); Kurtjar (entity-kurtjar); Jingili (entity-jingili); Yidinjdji (entity-yidinjdji); Jabirrjabirr (entity-jabirrjabirr); Mudburra (entity-mudburra); Kija (entity-kija); Warwa (entity-warwa); Ngandji (entity-ngandji); Unggumi (entity-unggumi); Gananggalinda (entity-gananggalinda); Djabuganjdji (entity-djabuganjdji); Worla (entity-worla); Bilinara (entity-bilinara); Nyul Nyul (entity-nyul-nyul).

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 2 tracked questions touch this batch; complete links are in manifest.json.

### batch-43 — Australian source-defined communities · 15/19

20 identities; 20 uncurated; 0 already mapped. 20 require some research/review before acceptance.

Upstream bibliography and relevant community-authorised institutions first. Establish whether labels describe language, people, land or governance; sovereignty/state-office templates are inappropriate.

Included: Garawa (entity-garawa); Bardi (entity-bardi); Unggarangi (entity-unggarangi); Umida (entity-umida); Kuku-yalanji (entity-kuku-yalanji); Koknar (entity-koknar); Ngarinman (entity-ngarinman); Kokomini (entity-kokomini); Binbinga (entity-binbinga); Karangpurru (entity-karangpurru); Yanyuwa (entity-yanyuwa); Kunjen (entity-kunjen); Alawa (entity-alawa); Ngaliwuru (entity-ngaliwuru); Worora (entity-worora); Ngarinyin (entity-ngarinyin); Yangman (entity-yangman); Doolboong/Miriwoong (entity-doolboong-miriwoong); Koko-bera (entity-koko-bera); Nungali (entity-nungali).

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 2 tracked questions touch this batch; complete links are in manifest.json.

### batch-44 — Australian source-defined communities · 16/19

20 identities; 20 uncurated; 0 already mapped. 20 require some research/review before acceptance.

Upstream bibliography and relevant community-authorised institutions first. Establish whether labels describe language, people, land or governance; sovereignty/state-office templates are inappropriate.

Included: Guugu-Yimidhirr (entity-guugu-yimidhirr); Kokowarra (entity-kokowarra); Yir Yoront (entity-yir-yoront); Yiiji (entity-yiiji); Wardaman (entity-wardaman); Kadjerong (entity-kadjerong); Wunambul (entity-wunambul); Jaminjung (entity-jaminjung); Mara (entity-mara); Thaayorre (entity-thaayorre); Mutumui (entity-mutumui); Kwini (entity-kwini); Mangarayi (entity-mangarayi); Lamalama (entity-lamalama); Bakanh (entity-bakanh); Murrinh-patha (entity-murrinh-patha); Ngalakan (entity-ngalakan); Gamberre (entity-gamberre); Wagiman (entity-wagiman); Marringarr (entity-marringarr).

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 2 tracked questions touch this batch; complete links are in manifest.json.

### batch-45 — Australian source-defined communities · 17/19

19 identities; 19 uncurated; 0 already mapped. 19 require some research/review before acceptance.

Upstream bibliography and relevant community-authorised institutions first. Establish whether labels describe language, people, land or governance; sovereignty/state-office templates are inappropriate.

Included: Ngan’gikurunggurr (entity-ngan-gikurunggurr); Miwa (entity-miwa); Umbindhamu (entity-umbindhamu); Ngan’giwumirri (entity-ngan-giwumirri); Ngandi (entity-ngandi); Marramaninjsji (entity-marramaninjsji); Jawoyn (entity-jawoyn); Nunggubuyu (entity-nunggubuyu); Kuuku-yani (entity-kuuku-yani); Marrithiyel (entity-marrithiyel); Wik (entity-wik); Maranunggu (entity-maranunggu); Malak malak (entity-malak-malak); Kaantju (entity-kaantju); Umpila (entity-umpila); Ngalkbun (entity-ngalkbun); Kuwema (entity-kuwema); Warray (entity-warray); Tjerratj (entity-tjerratj).

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 2 tracked questions touch this batch; complete links are in manifest.json.

### batch-46 — Australian source-defined communities · 18/19

19 identities; 19 uncurated; 0 already mapped. 19 require some research/review before acceptance.

Upstream bibliography and relevant community-authorised institutions first. Establish whether labels describe language, people, land or governance; sovereignty/state-office templates are inappropriate.

Included: Kungarakany (entity-kungarakany); Winda Winda (entity-winda-winda); Uutaalnganu (entity-uutaalnganu); Wuningangk (entity-wuningangk); Mbeiwum (entity-mbeiwum); Mbukarla (entity-mbukarla); Rembarnga (entity-rembarnga); Ngombur (entity-ngombur); Yolngu (entity-yolngu); Yinwum (entity-yinwum); Bukurnidja (entity-bukurnidja); Awngthim (entity-awngthim); Larrakia (entity-larrakia); Limilngan (entity-limilngan); Kuuku-ya’u (entity-kuuku-ya-u); Woolna (entity-woolna); Luthigh (entity-luthigh); Dangbon (entity-dangbon); Konbudj (entity-konbudj).

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 2 tracked questions touch this batch; complete links are in manifest.json.

### batch-47 — Australian source-defined communities · 19/19

19 identities; 19 uncurated; 0 already mapped. 19 require some research/review before acceptance.

Upstream bibliography and relevant community-authorised institutions first. Establish whether labels describe language, people, land or governance; sovereignty/state-office templates are inappropriate.

Included: Gagudju (entity-gagudju); Kundjey’mi (entity-kundjey-mi); Anguthimri (entity-anguthimri); Gunwinggu (entity-gunwinggu); Mpalitjanh (entity-mpalitjanh); Gungurugoni (entity-gungurugoni); Gunibidji (entity-gunibidji); Yupangathi (entity-yupangathi); Gunbalang (entity-gunbalang); Nakara (entity-nakara); Burarra (entity-burarra); Wuthathi (entity-wuthathi); Teppathiggi (entity-teppathiggi); Tjungundji (entity-tjungundji); Amarak (entity-amarak); Maung (entity-maung); Anggamudi (entity-anggamudi); Iwaidja (entity-iwaidja); Yadhaigana (entity-yadhaigana).

Continuity: Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required. 2 tracked questions touch this batch; complete links are in manifest.json.

## Coverage architecture and acceptance

Keep the existing schema-1 knowledge files and cached production index. The reviewed dataset retains the two-file static architecture; Batch 01 data and audit are documented in BATCH-01.md. Add records in reviewed batches; keep source IDs globally unique, explicit dated mappings and separate map geometry. If file size/merge conflicts become measurable problems later, author regional files and compile the same two static production JSON files; do not fetch hundreds of files on clicks or introduce a backend.

Core acceptance requires documented historical identity/name, existence/status, capital, government, appropriate leadership, currency, dated overview and provenance where evidence exists. Enrichment can add dated/scoped population, licensed flags/standards, legislature, party/dynasty, explicit transitions, further overviews and events. Evidence-based omissions are acceptable. A nonempty name is not completion. research-plan.json defines statuses, review decisions and acceptance categories; explicit reviewer notes and dated source-backed intervals are required to accept a tier. The seven existing-enriched references remain temporally partial, not globally complete.

Preserve observation dates/scopes, no interpolation/future statistics, actual offices, source date precision, no modern substitutions, unsupported GDP/area or geometric sovereignty/succession, and historical asset licensing. An office standard is not a national flag.

Requested year selects historical facts; exact/nearest snapshot selects geometry. The 1939/1938 case remains unchanged. Snapshot coverage above uses each snapshot’s own year; it does not imply continuous requested-year coverage between snapshots.

## Inputs and reproducibility

Upstream revision: da7a4b735ecef70aebdc9c73e409d8a2500d50f3. Every locked GeoJSON has an origin, pinned URL and SHA-256; current production CDN responses were compared when pinning. Original geometry is cached outside the repository, not copied into the public knowledge layer. Recalculation uses actual prepareCollection/stableEntityId logic from data-pipeline.js and actual createMetadataIndex/validInYear from historical-metadata.js. Production dependencies are imported from their pinned versions into the Node audit.

Run **node scripts/coverage.mjs** to regenerate lock-backed manifest.json and this report. Run **node scripts/coverage.mjs --check** to recalculate and fail on stale generated output. **--refresh-inputs** explicitly repins mutable upstream inputs; review the resulting diff. Network is needed only on a cache miss/refresh. Failed or hash-mismatched inputs abort without partial report writes.

The development manifest is generated: edit research-plan.json for planning/review decisions, not generated totals. Future reviewed batches update the curated metadata, then regenerate. No production code imports the audit files.

Limitations: snapshot dates are sparse, source names may be anachronistic or corrupt, largest-piece geography can mislead for empires/disconnected pieces, and automatic flags cannot establish historical truth. Historical research applies only to reviewed batches and their documented intervals. Reviewed decisions apply only to their documented intervals; remaining candidates are unresearched.
