# Snapshot identity and excluded-polity recovery — completed bounded pass

## Completion unit and baseline
One selectable stable map identity × configured snapshot is one assessment row. Multiple disconnected polygons for one stable identity form one occurrence. No facts, no resolver and an unresolved mapping never remove an eligible occurrence. A canonical entity with multiple raw identities retains each selectable occurrence; duplicated evidence is not counted as new claims.
Legacy Phase2 any-year resolver availability: {"candidates":401,"covered":362,"uncovered":39,"percentage":90.27}. Earlier completion baseline:1056 resolved dossiers,15840 slots,7257 supported (45.81%). This filtered/any-year model hid empty or globally deferred snapshots. These figures are retained for comparison, not completion.
All selectable occurrences:2352; confirmed political/dependent/qualified composite:1588; provisional eligibility candidates:179; protected exclusions:585.
Confirmed-only evidence/resolution:32.17% (7662/23820); four-core coverage:47.81%. Confirmed empty:491; identity-only:1; core distribution:{"0":494,"1":7,"2":502,"3":314,"4":271}.
Conservative assessment denominator including pending candidates:1767 dossiers/26505 slots. Evidence/resolution:29.27%;7759 supported;18746 unresolved. Completely empty:657; identity-only:1; one/two/three/four core:7/508/321/271; core coverage:43.44%.
Core means identity, government, leadership and capital. The stronger flagship trigger also requires currency, relationship/status and overview. Supported is a minimum evidence threshold, not exhaustive completeness. The empty test excludes a title and derived mapped geometry alone. Partial is not counted complete. No missing slot was turned into N/A or historical uncertainty.

## What changed
36 new accepted rich claims;623 registry entities;3952 accepted rich claims. All pre-checkpoint entity/source/mapping/package objects preserved. Six new curated identity/context entities and ten dated mappings.
Same corrected methodology before/after historical recovery:7704→7759 supported slots (+55),29.07%→29.27%,12 dossiers improved. Core slots:3037→3070 (+33).
Accounting-only restoration:398 existing supported slots. The global mapping-review gate had masked explicitly accepted date intervals (Canada, later USSR,India1960 and others). It now requires the selected full year, one known entity, real mapping and resolving sources; unresolved intervals remain held. This is not new historical evidence.

## Exclusion audit
{"previouslyUnresolved":72,"mappingReview":62,"tierNone":861,"previouslyOutsidePoliticalClass":479,"totalAuditedIdentities":880,"reviewedExcludedOrDeferred":863,"outcomes":{"political-polity":209,"dependent-administration":176,"composite-political-region":2,"non-political":400,"duplicate":1,"still-unresolved":71,"variant-review":6}}
These old categories overlap and are not additive. Outcome counts are computational screening dispositions rolled up to identities, not wholesale newly certified reclassifications. All880raw identities have evidence/review reasons in exclusion-audit.json. Protected398community identities have no production polity mappings. Geographic features and the community duplicate remain outside the political template. This audit does not certify every provisional classification historically. Six variant identities and71still-unresolved identities require later historical review; neither is declared a sovereign state.
Independent dated recovery ledger:{"political-polity":10,"dependent-administration":0,"composite-political-region":4} occurrences. WhiteRussia has a political1930 outcome and unresolved1920 outcome, so identity-level outcome counts overlap. Chinese composite regions are qualified contexts, not single sovereign governments.

## Russian sequence
| Year | Display identity | Core | Currency | Status | Overview |
| --- | --- | ---: | --- | --- | --- |
| 1800 | Russian Empire | 4/4 | supported | supported | supported |
| 1815 | Russian Empire | 4/4 | supported | supported | supported |
| 1878 | Russian Empire | 4/4 | missing | supported | supported |
| 1880 | Russian Empire | 4/4 | supported | supported | supported |
| 1900 | Russian Empire | 4/4 | supported | supported | supported |
| 1914 | Russian Empire | 4/4 | supported | supported | supported |
| 1920 | Soviet Russia — RSFSR (schematic region) | 4/4 | missing | supported | supported |
| 1930 | Soviet Union | 4/4 | missing | supported | supported |
| 1938 | Soviet Union | 3/4 | partial | held | supported |
| 1945 | Soviet Union | 3/4 | supported | held | partial |
| 1960 | Soviet Union | 3/4 | supported | held | supported |
Russian Empire1800/1815/1878/1880/1900/1914 now independently have identity,government,leadership,capital and snapshot-specific overview. Reigns are sourced; imperial generic ruble claims do not assert continuous metallic convertibility.1878ruble remains held.1914capital retains both SaintPetersburg and Petrograd with31AugustGregorian rename; no relocation is invented.1906FundamentalLaws are not back-projected to1800.
1920giant rawNAME=USSR is already an upstream anachronistic name normalized by the pipeline, not a separate explicit atlas SovietUnion title override. Its canonical context is SovietRussia/RSFSR, qualified schematic region.1920smallWhiteRussia remains held: it covers a Belarus-region polygon, not the giant1930feature.1930rawWhiteRussia covers the main Soviet region and now has dated USSR identity and1924constitutional framework; no1936constitution is projected backwards. Source-author motive for WhiteRussia is unknown. No Empire→USSR instant succession is inferred.

## China
ChineseWarlords1920/1930/1938 uses essentially the same rounded outline.1920context distinguishes Peking andregionalmilitaryauthority;1930context identifies NanjingNationalistclaims alongside regionalauthority.1938has source-map qualification only;1930facts do not leak. None receives an invented leader,capital,currency or uniform territorialcontrol.
ManchuEmpire1914 is a further confirmed anachronism afterFebruary1912abdication. Qualified RepublicofChina schematic context uses existing StateDepartment historical sources and1913recognition; no earlyNanjing seat or leaderdate is projected into1914.

## Identity signals and remaining high-visibility work
All11snapshots audited:1462 occurrences carry review signals, not that many confirmed errors. Types:{"map-dossier-title-divergence":859,"canonical-identity-unresolved":603,"outside-curated-mapping-interval":263}. Formal/short-name divergence is often harmless. A curated interval beginning later is a coverage-gap signal, not proof of polity creation. Flagship candidates:279; below seven-part minimum:199.
Confirmed corrected title occurrences:Russia1920,WhiteRussia1930,ChineseWarlords1920/1930/1938 andManchuEmpire1914. Union1938/1945/1960 titles are stabilized. Remaining high-priority signals include Ottoman1878,India1945,Canada1815,NewGranada1800/1815 and transition-year Brazil/Argentina. Some are unresolved/partial-year identities, not nonexistent polities. They remain in the workload; this bounded recovery did not start a new regional campaign.

## Operation and recovery
Run node scripts/research-completion.mjs to regenerate both legacy comparison and authoritative occurrence reports. Run node scripts/research-snapshot-qa.mjs final for source-map/visibility QA. Tests in tests/snapshot-occurrence-qa.test.mjs protect empty rows, per-year coverage, temporal review gates, composite qualifications and immutable accepted inputs.
Certified construction inputs and earlier failed/replaced intake artifacts are archival. Do not rerun candidate constructors over certified files. integrate.mjs checks original patch fingerprints and is idempotent for the initial registry patch; separate1914andidentity intakes have independent bound certificates. The original1914duplicate-source hold was recovered using the exact accepted cp-prlib-petrograd source, never bypassing validation. Sources-first registry journal records prepared/completed state; any interrupted partial registry transaction must be checked against its stored hashes before recovery.
No Batch10,normal acquisition,frontend redesign,geometry replacement,timeline expansion or enrichment was performed. Minimal runtime title plumbing uses reviewed dated names for labels/search/dossier selection while preserving geometry,rawsourceproperties,stableIDs,colours and requested-year/boundary-year distinction.

## Stop / next action
STOP after commit/push and live verification. Review the corrected denominator and pending-eligibility queue before authorizing further acquisition. Prioritize high-visibility identity/core recovery from occurrence-priority-queue.json, not the old any-year entity availability. Do not automatically begin Batch10.

## Validation

63 focused automated tests passed (12 new QA tests); final integration passed56755 deterministic integrity checks. Syntax and diff checks passed. Six bounded local browser scenarios passed for Russia1800/1914/1920/1930,China1930 and qualifiedChina1914. All11canonical sections and citation access remained present. Live deployment and production-byte verification follow push; final results are reported to the user.
