# v0.7 Phase 2 — Batch 02: East Asia

Visible version remains v0.6.1. Source facts are independently researched; map labels, geometry and authority fields do not establish institutions or succession. All 17 assigned raw identities were reviewed. Nineteen partial entities were created, the Meiji reference was extended, and the postwar Japanese reference was reused. No new core-complete claim is made.

Baseline: `7121e2a29205c0579b0137b8183274d2e2f22b5a`. Full machine-readable decisions, exact mappings, source IDs and browser cases: [research-batch-02.json](research-batch-02.json).

## Raw identity decisions

| Raw map ID | Accepted dated entities | Outcome / limitation |
| --- | --- | --- |
| `entity-empire-of-japan` | `japan-meiji-framework` (1930 – 1945-01-01); `japan-meiji-framework` (1890-11-29 – 1930-01-01) | Existing reference mapping retained. Append earlier independently sourced constitutional coverage; preserve reference records. |
| `entity-imperial-japan` | `japan-restoration-framework` (1868-01-03 – 1890-11-29); `japan-meiji-framework` (1890-11-29 – 1945-01-01) | Imperial name does not establish the constitution before commencement. Source naming variant during the same constitutional framework. |
| `entity-japan` | `japan-postwar-framework` (1947-05-03 – open reference interval); `japan-tokugawa-framework` (1800-01-01 – 1868-01-03); `japan-restoration-framework` (1868-01-03 – 1890-11-29); `japan-meiji-framework` (1890-11-29 – 1945-01-01); `japan-initial-allied-occupation` (1945-09-02 – 1947-05-03) | Existing reference mapping retained. Early Japan source label; no postwar fallback. Constitutional framework change within Japan. Framework mapping; no territory-derived succession. Occupation is not state succession; uncovered earlier 1945 remains explicit. |
| `entity-japan-usa` | `japan-initial-allied-occupation` (1945-09-02 – 1947-05-03); `japan-postwar-framework` (1947-05-03 – 1952-04-28) | Occupation is not state succession; uncovered earlier 1945 remains explicit. Occupation-era source name; existing postwar constitution profile reused. |
| `entity-korea` | `korea-joseon-framework` (1800-01-01 – 1897-10); `korea-imperial-framework` (1897-10 – 1904-01-01) | Dynastic framework, not a timeless modern Korean state. Later protectorate/colonial periods remain uncurated. |
| `entity-korea-democratic-people-s-republic-of` | `korea-dprk-1948` (1948-09-09 – 1961-01-01) | Republic differs from the earlier Soviet occupation zone. |
| `entity-korea-republic-of` | `korea-republic-1948` (1948-08 – 1961-01-01) | Recognition date is not creation date. |
| `entity-korea-usa` | `korea-us-occupation` (1945-09 – 1948-01-01) | September describes established occupation, not an invented exact first landing date. |
| `entity-korea-ussr` | `korea-soviet-occupation` (1945-09 – 1948-01-01) | September describes established occupation, not an invented exact first landing date. |
| `entity-sakhalin-ru` | `sakhalin-northern-russian-possession` (1906-01-01 – 1915-01-01) | Source suffix reviewed against treaty territorial scope; local offices remain uncurated. |
| `entity-china` | `china-republic-nationalist-framework` (1945-01-01 – 1949-10-01); `china-prc-framework` (1949-10-01 – 1961-01-01) | Curated mainland framework mapping ends at PRC proclamation; not extinction of the ROC. PRC chronology does not silently replace ROC facts before October 1949. |
| `entity-hong-kong` | `hong-kong-historical-administration` (1841-01-26 – 1961-01-01) | Earlier map label remains unmapped: no British colony in 1800 or 1815. |
| `entity-manchu-empire` | `qing-imperial-framework` (1800-01-01 – 1912-02-12) | Qing/Manchu dynastic naming variants only within the supported imperial interval. |
| `entity-qing-empire` | `qing-imperial-framework` (1800-01-01 – 1912-02-12) | Qing/Manchu dynastic naming variants only within the supported imperial interval. |
| `entity-taiwan` | `taiwan-qing-administration` (1800-01-01 – 1895); `taiwan-japanese-administration` (1895 – 1945); `china-republic-nationalist-framework` (1945 – 1961-01-01) | Territorial scope, not a separate sovereign state. Year precision retained at both transfers. Postwar ROC administration; administrative evidence is not a resolution of contested sovereignty. |
| `entity-tibet` | None | Contested historical referent: the 1960 diplomatic exchange documents competing interpretations, not a sufficiently sourced institutional chronology for 1914–1960. No new entity or mapping is asserted. |
| `entity-mongolia` | `mongolia-bogd-autonomous-framework` (1911-12 – 1919-10); `mongolia-chinese-occupation` (1919-10 – 1921-02); `mongolia-peoples-republic-framework` (1924-11 – 1961-01-01) | Contested status attributed to historical agreements rather than a timeless sovereignty assertion. Military occupation is not automatic linear state succession. November precision retained pending reconciliation of founding-day accounts. |

## New dossier content and deliberate omissions

Each row is a partial dated framework, not a complete national history. Bounds may describe accepted coverage rather than the full lifetime of a state. Empty fields stay absent. No new flags, population, GDP, area or geometric succession chains were added.

| Entity | Coverage bounds | Fields supplied | Missing core fields |
| --- | --- | --- | --- |
| `japan-tokugawa-framework` | 1800-01-01 – 1868-01-03 | names, politicalStatus, capitals, governments, descriptions | leaders, currencies |
| `japan-restoration-framework` | 1868-01-03 – 1890-11-29 | names, politicalStatus, capitals, governments, currencies, descriptions | leaders |
| `japan-initial-allied-occupation` | 1945-09-02 – 1947-05-03 | names, politicalStatus, governments, leaders, descriptions | capitals, currencies |
| `korea-joseon-framework` | 1800-01-01 – 1897-10 | names, politicalStatus, governments, descriptions | capitals, leaders, currencies |
| `korea-imperial-framework` | 1897-10 – 1904-01-01 | names, politicalStatus, governments, leaders, descriptions | capitals, currencies |
| `korea-us-occupation` | 1945-09 – 1948-01-01 | names, politicalStatus, governments, descriptions | capitals, leaders, currencies |
| `korea-soviet-occupation` | 1945-09 – 1948-01-01 | names, politicalStatus, governments, descriptions | capitals, leaders, currencies |
| `korea-dprk-1948` | 1948-09-09 – 1961-01-01 | names, politicalStatus, governments, leaders, descriptions | capitals, currencies |
| `korea-republic-1948` | 1948-08 – 1961-01-01 | names, politicalStatus, capitals, governments, leaders, descriptions | currencies |
| `qing-imperial-framework` | 1800-01-01 – 1912-02-12 | names, politicalStatus, capitals, governments, descriptions | leaders, currencies |
| `china-republic-nationalist-framework` | 1945-01-01 – 1961-01-01 | names, politicalStatus, governments, descriptions | capitals, leaders, currencies |
| `china-prc-framework` | 1949-10-01 – 1961-01-01 | names, politicalStatus, governments, descriptions | capitals, leaders, currencies |
| `taiwan-qing-administration` | 1800-01-01 – 1895 | names, politicalStatus, governments, descriptions | capitals, leaders, currencies |
| `taiwan-japanese-administration` | 1895 – 1945 | names, politicalStatus, governments, descriptions | capitals, leaders, currencies |
| `hong-kong-historical-administration` | 1841-01-26 – 1961-01-01 | names, politicalStatus, governments, descriptions | capitals, leaders, currencies |
| `sakhalin-northern-russian-possession` | 1906-01-01 – 1915-01-01 | names, politicalStatus, governments, descriptions | capitals, leaders, currencies |
| `mongolia-bogd-autonomous-framework` | 1911-12 – 1919-10 | names, politicalStatus, capitals, governments, leaders, descriptions | currencies |
| `mongolia-chinese-occupation` | 1919-10 – 1921-02 | names, politicalStatus, governments, descriptions | capitals, leaders, currencies |
| `mongolia-peoples-republic-framework` | 1924-11 – 1961-01-01 | names, politicalStatus, capitals, governments, leaders, descriptions | currencies |

## Continuity, consolidations and transitions

Imperial Japan is split before and after constitutional commencement in November 1890. The later constitutional interval extends the existing Meiji entity. Initial Allied occupation differs from the 1947 framework, which reuses the original postwar reference. Joseon and the Korean Empire remain distinct; occupation zones are not mapped to the later republics. Qing/Manchu names consolidate only before the 1912 abdication; 1914 remains unmapped. The ROC continues on Taiwan, while the mainland China mapping changes in October 1949. Taiwan’s colonial administration is distinct from the entire Japanese or Qing state. Hong Kong keeps one territorial identity with multiple dated administrations. Mongolia distinguishes monarchy, military occupation and republic. No automatic predecessor/successor relationships were added.

Calendar transition tests cover Japan 1868/1890/1947, Korea 1897/1960, China 1949, Taiwan 1895/1945, Hong Kong 1941/1945/1946 and Mongolia 1960. Month/year precision exposes overlap rather than fabricated exact dates. Routine office changes remain separate from framework warnings. Between-snapshot browser coverage includes Korea 1885 on 1880 geometry.

## Unresolved referents and eligibility

Tibet remains a mapping-review case. The February 1960 diplomatic exchange records competing US and ROC descriptions and cannot establish all historical institutions or settle sovereignty. Chinese Warlords, Kuril Islands, Manchuria and Xinjiang retain their existing excluded/unresolved classifications. No denominator or batch-membership changes were made.

- All new dossiers are partial; no core-complete claim.
- Taiwan 1895/1945 and Korea 1897 retain month/year date precision and calendar ambiguity.
- Japan 1945 pre-surrender chronology and Mongolia 1921–1924 remain gaps.
- Tibet lacks a neutral dated institutional dossier; competing US and ROC diplomatic wording is retained only as research evidence.
- Mongolian republic founding-day discrepancy is not resolved by selecting one source; November precision retained.

## Provenance

- `b02-japan-restoration`: Ohio State University, Origins — [Japan’s Meiji Restoration](https://origins.osu.edu/read/japans-meiji-restoration?language_content_entity=en). Dated restoration and replacement of Tokugawa institutions; not commencement of the later constitution.
- `b02-meiji-commencement`: Ministry of Education, Culture, Sports, Science and Technology, Japan — [The Promulgation of the Meiji Constitution and Education](https://www.mext.go.jp/b_menu/hakusho/html/others/detail/1317324.htm). Distinguishes promulgation on 1889-02-11 from commencement on 1890-11-29.
- `b02-japan-surrender`: United States National Archives — [Instrument of Surrender, 2 September 1945](https://www.archives.gov/milestone-documents/surrender-of-japan). The instrument subjects imperial and governmental authority to the Supreme Commander for the Allied Powers.
- `b02-joseon-museum`: National Museum of Korea — [Joseon dynasty in Medieval and Early Modern History](https://www.museum.go.kr/ENG/contents/E0201040400.do). Dynastic period; not detailed office-holder or currency chronology.
- `b02-korean-empire`: National Museum of Korea — [Korean Empire](https://www.museum.go.kr/ENG/contents/E0201040600.do?showHallId=759&showroomCode=DM0041). October 1897 imperial title and name; loss of external affairs after the Russo-Japanese War; annexation in 1910.
- `b02-korea-occupation`: United States Department of State, Office of the Historian — [NSC 8, Position of the United States With Respect to Korea, 2 April 1948](https://history.state.gov/historicaldocuments/frus1948v06/d776). Contemporary US account of occupation zones and interim institutions. Polemical assessments are not adopted as neutral fact.
- `b02-korea-origins`: United States Library of Congress; Country Studies mirror — [North Korea: A Country Study (1993), Origins of the DPRK](https://countrystudies.us/north-korea/14.htm). Occupation, establishment of the two republics and Kim Il Sung’s office as premier, not president before 1972.
- `b02-korea-constitution`: United States Library of Congress; Country Studies mirror — [North Korea: A Country Study (1993), The Constitution](https://countrystudies.us/north-korea/58.htm). The 1948 constitution precedes the presidency established in 1972. Later constitutional provisions are not projected backwards.
- `b02-rok-recognition`: United States Department of State, Office of the Historian — [Republic of Korea: recognition and diplomatic relations](https://history.state.gov/countries/korea-south). Recognition on 1949-01-01 is distinct from establishment in 1948; Seoul described in the recognition statement.
- `b02-rhee-resignation`: United States Department of State, Office of the Historian — [FRUS 1958–1960, Volume XVIII, Document 310](https://history.state.gov/historicaldocuments/frus1958-60v18/d310). Formal resignation on 1960-04-27 and caretaker government; later parliamentary chronology remains a gap.
- `b02-china-recognition`: United States Department of State, Office of the Historian — [China: historical recognition and diplomatic relations](https://history.state.gov/countries/china). Imperial recognition; Beijing capital; abdication on 1912-02-12. Consular posts do not establish capitals.
- `b02-chinese-revolution-1911`: United States Department of State, Office of the Historian — [The Chinese Revolution of 1911](https://history.state.gov/milestones/1899-1913/chinese-rev). Qing imperial framework and transition; warlords are not treated as a single successor state.
- `b02-chinese-revolution-1949`: United States Department of State, Office of the Historian — [The Chinese Revolution of 1949](https://history.state.gov/milestones/1945-1952/chinese-rev). PRC proclamation on 1949-10-01 and continued ROC government on Taiwan; not a simple abolition of the ROC.
- `b02-hong-kong-origin`: Hong Kong Government — [Hong Kong Yearbook 2006: Early History](https://www.yearbook.gov.hk/2006/en/21_03.htm). British occupation in January 1841 and treaty cession in August 1842; not British administration in 1800.
- `b02-hong-kong-war`: Hong Kong Government — [Hong Kong Yearbook 2006: The 1930s and World War II](https://www.yearbook.gov.hk/2006/en/21_06.htm). Surrender in December 1941, post-surrender provisional authority, British military government in August 1945 and civil restoration in May 1946.
- `b02-taiwan-museum`: National Museum of Taiwan History — [Permanent Exhibition: Taiwan, an Island of Encounters](https://the.nmth.gov.tw/nmth/zh-tw/Home/PermanentExhibition). Qing incorporation in 1684, Japanese rule from 1895, postwar ROC administration. Describes administrations without deciding present sovereignty claims.
- `b02-portsmouth-treaty`: United States Department of State, Office of the Historian — [Treaty of Portsmouth, FRUS 1905, Document 915](https://history.state.gov/historicaldocuments/frus1905/d915). Article IX distinguishes northern Russian possession from southern territory ceded to Japan; signature differs from entry into force.
- `b02-mongolia-autonomy`: United States Library of Congress; Country Studies mirror — [Mongolia: A Country Study, Period of Autonomy 1911–1921](https://countrystudies.us/mongolia/26.htm). Bogdo monarchy, contested autonomy, Chinese military occupation and its removal. Month precision avoids false calendar precision.
- `b02-mongolia-republic`: United States Library of Congress; Country Studies mirror — [Mongolia: A Country Study, Revolutionary Transformation 1921–1924](https://countrystudies.us/mongolia/27.htm). 1924 republic and capital renaming. Day-level founding date requires reconciliation; this release retains November precision.
- `b02-tibet-status-review`: United States Department of State, Office of the Historian — [FRUS 1958–1960, China, Document 401](https://history.state.gov/historicaldocuments/frus1958-60v19/d401). Competing diplomatic descriptions in 1960; insufficient to establish a neutral institutional chronology for all Tibet map periods.
- `b02-mongolia-consolidation`: United States Library of Congress; Country Studies mirror — [Mongolian People’s Republic, 1925–1928](https://countrystudies.us/mongolia/28.htm). Historical republic, party and constitutional chronology; later events are excluded from atlas facts.
- `b02-mongolia-wartime`: United States Library of Congress; Country Studies mirror — [Economic Gradualism and National Defense, 1932–1945](https://countrystudies.us/mongolia/30.htm). Historical republic, party and constitutional chronology; later events are excluded from atlas facts.
- `b02-mongolia-postwar`: United States Library of Congress; Country Studies mirror — [Socialist Construction under Tsedenbal, 1952–1984](https://countrystudies.us/mongolia/32.htm). Historical republic, party and constitutional chronology; later events are excluded from atlas facts.

Existing Tokyo, Meiji constitutional, yen, surrender/occupation and 1947/1952 reference sources were reused by ID where they support the added claims. No identical source records were duplicated.

## Coverage and validation

Political coverage increases from 29/401 to 43/401 (10.72%). Resolver availability does not imply historical completeness. Total curated entities: 51; sources: 206; unresolved classifications: 72; explicit mapping-review cases: 3. Broken mappings and orphan metadata: zero.

All 49 Node tests pass, including immutable-prefix preservation of every pre-programme fact and source. All 67 targeted Edge browser checks pass, covering every one of the 19 new entities, transition notices, dated search, citations, map labels, reset, timeline controls, requested-year separation, Antarctica exclusion and absence of Compare Dates. Zero browser runtime errors. JavaScript syntax, metadata/reference/duplicate/date/mapping validation, coverage generation, reproducibility and whitespace checks are required before this checkpoint is committed. The complete browser regression is next scheduled after Batch 05; no shared resolver or presentation logic changed here.

Resume sequentially with **political-batch-03** after this batch’s commit and push.
