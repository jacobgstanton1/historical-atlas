# Historical Atlas Phase 3 — Stage 2, Campaign 1 completion report

Campaign 1 is complete: 30 bounded entity/period assignments were independently reviewed, accepted and integrated serially in five production checkpoints. Campaign 2 has not begun.

The usage-limit recovery found clean main synchronized with origin/main at 1c4909f02e54924b9ae2f47b8669ecef86b4a807. No production changes followed the successful validation. Finalization saves this report and existing evidence only; research, integration, tests and browser validation were not repeated.

## Results

80 facts appended: 14 capital/seat, 54 leadership and 12 currency facts. No political/institutional facts were added; unsupported gaps remain explicit. All 30 packages are integrated; none remains held or rejected at completion. Existing facts and source definitions were preserved.

50 new sources were registered and six distinct existing source IDs reused. Final registries contain 617 historical entities and 739 sources. Resolver availability remains 362/401 (90.27%), with 72 unresolved classifications and 62 mapping-review identities. Identity mappings were unchanged.

Visible production version remains v0.6.1. The frontend, map, resolver and timeline were unchanged. No statistics interpolation, Important Figures expansion, portrait collection or global Deep Dossier research was undertaken.

## Bounded completeness

The denominator is 868 selected entity/year pairs, not all entity lifetimes or global atlas completeness. Partial evidence is reported separately.

| Field | Fully supported before | Fully supported after | Partial before | Partial after |
| --- | ---: | ---: | ---: | ---: |
| capital | 230 | 539 | 0 | 28 |
| leadership | 76 | 470 | 1 | 61 |
| political-institutional | 744 | 744 | 107 | 107 |
| currency | 66 | 264 | 2 | 20 |

This adds 901 fully supported field/year units. Target category/year opportunities remaining decreased from 2,356 to 1,455. Thirty entity-centric assignments replaced 2,356 possible category/year dispatch units (98.7% fewer assignments, approximately 79:1); this is not a measured token-cost or speed benchmark. Global scanner gaps decreased from 103,157 to 102,256.

Global source-present framework transition gaps remain 91 before and after; none was forcibly resolved. The restricted selection scan's zero transition gaps is a different denominator and is not compared with the global count.

## Completed validation, retained without reruns

| Validation | Passed |
| --- | ---: |
| Automated tests (100 atlas + 111 pipeline) | 211 |
| Targeted browser checks across five checkpoints | 407 |
| Complete browser regression | 754 |
| Live deployment browser checks | 31 |
| Integrity checks | 853 |
| Claim/map/year checks | 14,812 |

All recorded checks passed with no errors. Coverage regeneration reproducibility passed. Deployment checks before the interruption confirmed that deployed registries matched committed data (617 entities, 739 sources), and the visible version remained v0.6.1. No deployment checks were repeated during recovery.

Evidence: [completion validation](reports/completion-validation.json), [full browser report](reports/full-browser.json), [live browser report](reports/live-browser.json), [integrity and temporal audit](reports/final-audit.json), checkpoint browser reports and [filesystem recovery](reports/filesystem-recovery.json).

Final production fingerprint: 2ccdb643e3c5b386e248043a33ccb5570bf2620cebf6aafe81acfec1231c6fa7.

## Research and review

Three independent research workers completed six research cohorts covering 30 entity assignments. Workers produced isolated evidence packages; independent reviewers checked source bodies and temporal scope. Production integration remained coordinator-controlled and serial. Original packages, review receipts and context revisions remain preserved.

Review corrected an insufficient British Raj capital source by adding municipal historical evidence for the relevant interval. New Zealand's capital evidence was replaced with an accessible full historical source body. Austrian presidential dates were accepted only after source-body confirmation; an ambiguous 1925 schilling transition was avoided by using a supported 1926 interior interval.

Dated transitions include German emperors in 1888, Canadian ministries, India's 1957 currency decimalization and Austrian presidencies. Explicit gaps remain for Qing 1875, Austrian imperial transitions in 1835/1848, Fiji 1882, Australia 1927, PRC currency 1955, Chilean interim/transition years and an ambiguous Mexican 1932 source header. No unsupported identity, sovereignty or succession was inferred.

Windows atomic-rename interruption was recovered through the integration journal: rollback restored the preceding fingerprint before reapplication. Bounded retries for transient sharing locks preserve the journal, lock and fingerprint safeguards; two additional tests passed. A Taiwan browser test was corrected to select an independently present boundary snapshot before navigating to the requested historical year. This changed the test harness only.

## Entity/period completion

| # | Historical entity | Entity ID | Requested interval | Checkpoint | Status |
| ---: | --- | --- | --- | ---: | --- |
| 1 | Qing Empire | qing-imperial-framework | 1862–1908 | 1 | Integrated |
| 2 | Siam — Chakkri monarchy | b13-siam-absolute | 1870–1910 | 1 | Integrated |
| 3 | Empire of Brazil — late constitutional monarchy | brazil-pedro-ii-imperial-framework | 1841–1888 | 1 | Integrated |
| 4 | Iran — early Pahlavi constitutional framework | iran-early-pahlavi-framework | 1926–1932 | 1 | Integrated |
| 5 | Ethiopia — Zawditu and Tafari regency | ethiopia-zawditu-regency-core | 1917–1929 | 1 | Integrated |
| 6 | Ottoman Empire — adjourned parliamentary order | ottoman-abdulhamid-adjourned-framework | 1879–1907 | 1 | Integrated |
| 7 | German Empire | germany-imperial-framework | 1872–1913 | 2 | Integrated |
| 8 | Republic of India | india-republic-1950-framework | 1951–1960 | 2 | Integrated |
| 9 | Canada — Dominion under the 1867 Act | canada-1867-federal-framework | 1868–1930 | 2 | Integrated |
| 10 | Commonwealth of Australia — pre-adoption federal framework | australia-prewestminster-federal-core | 1914–1938 | 2 | Integrated |
| 11 | Austrian Empire | austria-imperial-framework | 1805–1866 | 2 | Integrated |
| 12 | France | france-political-frameworks | 1830–1847 | 2 | Integrated |
| 13 | Japan under the early Meiji government | japan-restoration-framework | 1869–1889 | 3 | Integrated |
| 14 | Mexico — 1917 constitutional framework | mexico-1917-constitutional-framework | 1918–1934 | 3 | Integrated |
| 15 | Chile — restored presidential constitutional government | chile-restored-presidential-framework | 1933–1952 | 3 | Integrated |
| 16 | Argentina — federal constitutional framework | argentina-pre-1930-federal-framework | 1899–1916 | 3 | Integrated |
| 17 | Union of South Africa — early dominion | b19-south-africa-early-union | 1911–1930 | 3 | Integrated |
| 18 | Egypt — British-occupied Khedivate | egypt-british-occupied-khedivate-framework | 1883–1913 | 3 | Integrated |
| 19 | Fiji — British colonial framework | fiji-british-colonial-core | 1878–1900 | 4 | Integrated |
| 20 | New Zealand — Dominion parliamentary framework | new-zealand-preadoption-dominion-core | 1914–1946 | 4 | Integrated |
| 21 | Taiwan under Japanese colonial administration | taiwan-japanese-administration | 1900–1930 | 4 | Integrated |
| 22 | British Raj | british-raj | 1859–1910 | 4 | Integrated |
| 23 | Grand Duchy of Finland | finland-grand-duchy | 1820–1890 | 4 | Integrated |
| 24 | Austria — First Republic | austria-first-republic-framework | 1919–1932 | 4 | Integrated |
| 25 | Federal Republic of Germany | germany-federal-1949-framework | 1950–1960 | 5 | Integrated |
| 26 | People’s Republic of China | china-prc-framework | 1950–1959 | 5 | Integrated |
| 27 | Hong Kong — historical administrations | hong-kong-historical-administration | 1900–1940 | 5 | Integrated |
| 28 | Nigeria — Clifford constitutional framework | nigeria-clifford-framework-core | 1923–1945 | 5 | Integrated |
| 29 | Republic of Indonesia — parliamentary constitutional framework | b13-indonesia-parliamentary | 1951–1956 | 5 | Integrated |
| 30 | San Marino | san-marino-republic | 1830–1850 | 5 | Integrated |

## Pushed checkpoints

The following production/tooling checkpoints were already pushed before report finalization:

- 6b7af5f9e09ed4cf8d29b9594b074cffa0f37752 Prepare bounded entity-centric Campaign 1 research
- ab9b9c685ee71e0a6d583c08ac4ed6ca5beecffd Review fresh research contexts and smoke-test campaign facts
- e75f65cf70972f3ab1d3e7b4db0349d71e7b0a4a Deepen Campaign 1 Qing Siam Brazil Iran Ethiopia and Ottoman dossiers
- 1bfc51fc382c42158f041339e86867f05410de97 Deepen Campaign 1 German Indian Canadian Australian Austrian and French dossiers
- d98a8212a9a2fc6e2986daeb6d7d357440f86882 Deepen Campaign 1 Japanese Mexican Chilean Argentine South African and Egyptian dossiers
- e4b24532894bd2625755bfee8d7525a8b8f0066b Retry transient atomic file-sharing locks without weakening recovery
- 70b3756a2d80814867e47563bbdf8e41183fdfe9 Deepen Campaign 1 Pacific Raj Finnish and Austrian republican dossiers
- 1c4909f02e54924b9ae2f47b8669ecef86b4a807 Deepen Campaign 1 German Chinese Hong Kong Nigerian Indonesian and San Marino dossiers

The final completion-report commit follows these checkpoints and does not change production data. Its SHA is reported in the final handoff and Git history.

## Remaining limitations and next action

Political/institutional support did not improve in this campaign. Population, area, economic estimates and Important Figures remain outside this scope. Partial date precision and transition-year gaps remain visible rather than being interpolated. Resolver availability is distinct from field/year completeness.

The next action is user review of this report, preserved evidence and coverage metrics before authorizing Campaign 2 scope. No further campaign starts automatically.
