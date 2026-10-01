# Historical Atlas v0.7 Phase 2 — final audit and programme report

All Batches 01–21 are researched and independently checkpointed. The visible product remains v0.6.1. Phase 3 has not begun. The audit commit is separate from Batch 21; its SHA is supplied in the completion message because a commit cannot contain its own SHA.

## Recovery and execution

Recovery fetched origin and proved Batch 16 had already been pushed as b129dbc56a3f1ab03083cd02c432b66c650046b2. Batch 17 was still an isolated ready package: its scheduled full regression had not started. Batch 18 was intact; complete preserved 19/20 packages were recovered; 21 had no completed package and resumed from retained evidence. No completed batch was repeated.

The lightweight pipeline uses three research workers plus one coordinator within the four available agent slots. Workers write separate TEMP handoffs; the coordinator alone edits shared production registries and integrates numerically. Isolation is a workflow contract with structured directories and pure integration validation, not an OS permission boundary. Guarded append/existence extensions, exact-URL source aliases, duplicate-ID rejection, scope checks, a recoverable queue and per-batch backups make integration reviewable.

Research for later batches finished while the coordinator validated earlier ones, reducing research waiting during integration. No controlled serial-versus-parallel speed benchmark was performed. Queue, structured handoffs, source reuse, guarded reconciliation and deterministic/browser validation are reusable foundations; permanent Deep Dossier specialisation was not added.

One earlier worker capacity failure was retried with retained work. The account usage interruption stopped all three research workers; their artifacts were recovered on resumption. An earlier Batch 13 map-click timing regression was corrected by waiting for the actual rendered map target, then rerun successfully. A Batch 20 reproducibility check caught coverage generated before source-provenance broadening; regeneration and the repeated check passed before commit. No final failing check was accepted.

## Final coverage

Political dossier availability: **362/401 (90.27%)**. This is single-entity resolver availability at at least one source-present snapshot, not complete historical knowledge or coverage of every year. Transition sections are available separately; the conservative denominator/numerator definition remains unchanged.
Registry: **617 historical entities; 689 registered sources**. Unresolved classifications: **72**. Mapping-review identities: **62**. Mapped raw identities deliberately retained at tier none: **359** (partial research rather than accepted complete/enriched dossiers). All newly introduced Phase 2 cores have bounded partial coverage.
Broken mappings: **0**. Orphan entities: **0**. Exact duplicate source URLs: **0**. Sources unused by production facts: **27**, all retained as cited review evidence; sources unused by both production and review reports: **0**.

## All batch completion states

- 01: complete; 24/24 assigned identities reviewed; Western/Northern Europe.
- 02: complete; 17/17 assigned identities reviewed; East Asia.
- 03: complete; 17/17 assigned identities reviewed; Central Europe and German/Italian source families.
- 04: complete; 21/21 assigned identities reviewed; Central Europe and German/Italian source families.
- 05: complete; 15/15 assigned identities reviewed; Central Europe and German/Italian source families.
- 06: complete; 18/18 assigned identities reviewed; Eastern Europe, Russian/Soviet and Balkan source families.
- 07: complete; 26/26 assigned identities reviewed; South/Central Asia.
- 08: complete; 10/10 assigned identities reviewed; North America.
- 09: complete; 20/20 assigned identities reviewed; South America.
- 10: complete; 18/18 assigned identities reviewed; Caribbean and Central America.
- 11: complete; 15/15 assigned identities reviewed; Caribbean and Central America.
- 12: complete; 27/27 assigned identities reviewed; Middle East and Arabian source families.
- 13: complete; 17/17 assigned identities reviewed; Southeast Asia.
- 14: complete; 18/18 assigned identities reviewed; North Africa and Saharan source families.
- 15: complete; 25/25 assigned identities reviewed; West Africa.
- 16: complete; 15/15 assigned identities reviewed; West Africa.
- 17: complete; 30/30 assigned identities reviewed; Central Africa.
- 18: complete; 19/19 assigned identities reviewed; East Africa and Horn.
- 19: complete; 16/16 assigned identities reviewed; Southern Africa.
- 20: complete; 15/15 assigned identities reviewed; Southern Africa.
- 21: complete; 24/24 assigned identities reviewed; Pacific/Oceania states and administrations.

## Checkpoints

| Batch | Commit | New entities / sources | Automated tests | Batch browser checks | Scheduled full checks |
| --- | --- | --- | --- | --- | --- |
| 08 | 30593955bfbc59ede7a5c202b231aded63b07729 | 12 / 15 | 81 | 69 | — |
| 09 | c338f88ddf2cc166408c76b7134706ba1b3fab4a | 51 / 44 | 83 | 200 | 383 |
| 10 | 8299388bde259cf7c96dd1a4bdd3f8134dbfbd7c | 22 / 19 | 85 | 104 | — |
| 11 | 441120a1c0ac3d5305117b857c86907dddac2190 | 25 / 13 | 86 | 145 | — |
| 12 | 6a8c4ad850f01ffbc88af74aa6f1afe7eff14b2c | 44 / 27 | 87 | 186 | — |
| 13 | 4c397fa1f2c7c4bb120798fdc24856344c35902a | 28 / 29 | 89 | 161 | 503 |
| 14 | 4566813023a8cb9bd0922e7f275e71ba315263f6 | 36 / 37 | 90 | 145 | — |
| 15 | 7038d83b8c42720da481300ed00d04ce1efe0fec | 49 / 24 | 91 | 189 | — |
| 16 | b129dbc56a3f1ab03083cd02c432b66c650046b2 | 17 / 18 | 93 | 99 | — |
| 17 | 65e5a010a0297beaf06af27e715680d79c742426 | 41 / 34 | 94 | 173 | 651 |
| 18 | 5709811167717efdf2a611d5d2dd7fc397de4e57 | 36 / 29 | 96 | 155 | — |
| 19 | ed2b1354ed865211ef8601b0662410354fc31ed2 | 21 / 13 | 98 | 124 | — |
| 20 | cba5d02e0dce017d17cac3619e5a2e7cabecde3b | 15 / 18 | 99 | 109 | — |
| 21 | 2a28aff9fa615b2bce807a3f234e6ca42926c1bb | 31 / 35 | 100 | 122 | 754 |

Batches 01–07 remain protected by their existing checkpoint tests. The justified Ottoman calendar/source corrections affect newly integrated Batch 12 data, with original audit records retained in Batch 13. Subsequent reconciliation preserved source dates and gaps. All 21 batch IDs and exact assigned-identity completion appear in final-global-audit.json.

## Audit evidence and corrections

Final automated suite: **100 passed**. Final complete browser/runtime suite: **754 checks passed, zero runtime errors**, covering representatives from every batch, all distinct newly created profiles, real map-click behaviour, search, citations, timeline/map controls, responsive rendering and metadata/boundary failure paths. Syntax checks, coverage regeneration/reproducibility and git diff --check passed.
Exhaustive resolver audit: **141680 raw/year pairs**, 63057 interval-filtered facts, 128461 unmapped no-fallback checks, 1189 first/last positive and 1167 outside-boundary negative checks. Every fact/identity period follows the existing temporal API; dated statistical observations and historical timeline context retain their dates rather than being mislabeled selected-year measurements.
Structural audit found **0 errors**. 10 mapping overlap candidates retain documented year/month precision or annual transition ambiguity. 49 differing simultaneous framework records include distinct offices, occupation/civil authorities and source-granularity transitions. These are reported for review rather than automatically treated as contradictory sovereign claims. Shared-name candidates are insufficient evidence to merge historically different administrations.
Cross-batch reconciliation independently reviewed Gold Coast/Ghana, Senegal/AOF, Fulani/Sokoto, Wadai label variants, French Somaliland/Djibouti, precolonial Buganda/Bunyoro, Ethiopian constitutional restoration, Northern/Southern Rhodesia modern-name aliases, Nyasaland/Malawi, Cape/Griqualand and Union of South Africa labels. Routine South African leader succession is one framework; the unsupported 1958 interregnum remains a gap. The Ethiopian December 1960 coup interval remains explicit. Shared archive URLs preserve multiple separately body-read territorial sections without duplicate sources.
The separate audit correction sharpens b10-cuba-january-1960 source usage from a researched-month claim to its actual 21 January 1960 attestation. Existing mapping/fact bounds already covered only that day; no historical fact, classification or availability was changed. The generated Batch 21 handoff was corrected to point to the final audit and stop condition instead of a nonexistent Batch 22.
Deployable atlas runtime was verified locally. Live registry equality is checked after the audit push and reported in the completion message using canonical hashes of the deployed entities and sources; visible v0.6.1 is preserved.

## Deliberate unresolved issues and later work

Unresolved political referents remain explicit, including generic Rhodesia, Dutch Guinea 1945, Tuʻi Tonga Empire, Walbis Bay, Delagoa Bay, Congo/Zaire and the pre-1964 United Republic of Tanzania label. Early composite island labels, anachronistic Kingdom of Hawaii 1900/Harer Egypt 1900, uncertain administrative transition months, contested effective control and evidence gaps are not replaced with modern states. Exact reviews are retained per batch and in research-plan.json.

Population/GDP/area/flags/currencies/exhaustive leaders and Important Figures remain intentionally sparse. Wider temporal coverage, stronger local-language and primary evidence, disputed authority, local/community relationships and incomplete constitutional details require later authorised research. Community/people identities remain outside automatic political dossiers; Antarctica, Compare Dates, What Changed and timeline expansion remain excluded.

No unresolved count was reduced merely to improve presentation. No Phase 3 scanner, completeness dashboard, Territory Page redesign or Deep Dossier programme was started.

Mapping-review IDs:
- entity-austrian-netherlands
- entity-tibet
- entity-kingdom-of-the-two-sicilies
- entity-anhalt
- entity-hohenzollern
- entity-soviet-union
- entity-ukraine
- entity-ceylon-dutch
- entity-india
- entity-pakistan
- entity-sikkim-indian-princely-state
- entity-maratha-confederacy
- entity-bahawalpur
- entity-sindh
- entity-canada
- entity-acadian-peninsula-uk
- entity-quebec
- entity-viceroyalty-of-new-granada
- entity-haiti
- entity-netherlands-antilles
- entity-saint-kitts-and-nevis
- entity-british-guiana
- entity-saint-martin
- entity-emirate-of-bin-shal-an
- entity-hail
- entity-hejaz
- entity-israel
- entity-mesopotamia-gb
- entity-oman
- entity-oman-british-raj
- entity-yemen-uk
- entity-awsa
- entity-french-indochina
- entity-malaya
- entity-vietnam
- entity-ai-viet
- entity-benin
- entity-ivory-coast
- entity-oyo
- entity-senegal
- entity-futa-jalon
- entity-futa-toro
- entity-opobo
- entity-tukular-caliphate
- entity-burkina-faso
- entity-dendi-kingdom
- entity-songhai
- entity-sultanate-of-utetera
- entity-nkore
- entity-harer-egypt
- entity-somalia
- entity-rhodesia
- entity-delagoa-bay
- entity-walbis-bay
- entity-american-samoa
- entity-niue
- entity-papua-new-guinea
- entity-samoa
- entity-wallis-and-futuna-islands
- entity-kingdom-of-hawaii
- entity-tu-i-tonga-empire
- entity-dutch-guinea

