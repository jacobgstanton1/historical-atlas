# Transition-year resolver consistency review

Scope: Batch 01 only. Batch 02 has not started. Baseline: 5f6aaed70333f34c6750e274c6770c08db0f6600.

## Root cause and fix

Entity-ID ambiguity already omitted an arbitrary identity. Single-entity status/government records were filtered by whole-year intersection, but the header treated a partial-year framework as the selected year without a warning. The resolver now reports dated framework changes and incomplete calendar-year coverage. The dossier preserves dated rows and displays a clear warning; ambiguous identity records are shown separately with sources, without choosing one identity. Routine leadership changes retain dated rows and do not trigger major framework warnings. Multiple primary names are dated instead of silently choosing the first.

Exact dates remain half-open; month/year precision is not turned into invented dates. 1 January exact transitions apply cleanly to the new year. Simultaneous full-year institutions remain ordinary. Source-backed frameworkContinuity annotations can identify equivalent editorial descriptions; two UK annotations avoid a false 1936 constitutional transition across the reference-data boundary.

## Data preservation

No historical facts, mappings, core acceptance statuses or any of the 183 source records were changed. Only the two UK framework equivalence annotations were added. No new sources, flag/population/GDP/area data or historical chronology. Coverage remains 29/401 political candidates (7.23%), with all snapshot counts unchanged. The seven references and every Batch 01 entity are protected by baseline hash checks. Visible version stays v0.6.1; cache increment loads the resolver and presentation changes.

## Research gaps

- entity-france 1815: Only the second-restoration interval beginning 1815-08-17 is curated. First restoration and Hundred Days framework and leadership dates require research; no chronology fabricated.
- entity-france 1958: Fourth Republic end retained at year precision; detailed Fifth Republic transition not curated.
- entity-norway 1814: The constitutional entity starts in May, but curated political status/government describe the November union. Earlier leadership/framework chronology remains partial.
- entity-ireland 1922: Irish Free State mapping starts 1922-12-06; earlier-year institutions and individual leadership remain uncurated.

## Systematic Batch 01 scan

All 24 raw identities were scanned across 1800–1960. The following are mechanically detected review cases, not assertions that every date is a proven incompatible political transition. Partial coverage includes limited research intervals and imprecise endpoints.

- entity-denmark: 1814 (partial-framework); 1849 (framework-transition)
- entity-denmark-norway: 1814 (partial-framework)
- entity-norway: 1814 (partial-framework); 1905 (framework-transition)
- entity-sweden: 1809 (framework-transition); 1866 (framework-transition); 1917 (framework-transition)
- entity-sweden-norway: 1814 (partial-framework); 1905 (partial-framework)
- entity-ireland: 1922 (partial-framework); 1937 (framework-transition); 1949 (framework-transition)
- entity-kingdom-of-ireland: No framework-boundary warning from existing metadata.
- entity-united-kingdom: No framework-boundary warning from existing metadata.
- entity-united-kingdom-of-great-britain-and-ireland: No framework-boundary warning from existing metadata.
- entity-france: 1804 (partial-framework); 1815 (partial-framework); 1830 (partial-framework); 1875 (partial-framework); 1940 (framework-transition); 1944 (framework-transition); 1946 (framework-transition); 1947 (partial-framework); 1958 (partial-framework); 1959 (partial-framework)
- entity-portugal: 1808 (partial-framework); 1821 (partial-framework); 1842 (partial-framework); 1910 (framework-transition); 1911 (partial-framework); 1926 (framework-transition); 1933 (framework-transition); 1935 (partial-framework)
- entity-spain: 1808 (partial-framework); 1814 (partial-framework); 1820 (partial-framework); 1876 (partial-framework); 1923 (framework-transition); 1930 (partial-framework); 1931 (partial-framework); 1936 (framework-transition); 1939 (framework-transition); 1943 (partial-framework)
- entity-switzerland: 1815 (partial-framework); 1848 (identity-transition)
- entity-netherlands: 1815 (partial-framework); 1940 (framework-transition); 1945 (framework-transition); 1946 (framework-transition)
- entity-luxembourg: 1815 (partial-framework); 1841 (partial-framework); 1848 (partial-framework); 1890 (framework-transition)
- entity-belgium: 1830 (partial-framework); 1831 (partial-framework)
- entity-iceland: 1845 (partial-framework); 1874 (framework-transition); 1904 (framework-transition); 1918 (identity-transition); 1944 (framework-transition)
- entity-finland: 1809 (partial-framework); 1819 (partial-framework); 1917 (identity-transition); 1919 (framework-transition)
- entity-malta: 1800 (partial-framework); 1814 (framework-transition); 1835 (partial-framework); 1887 (framework-transition); 1903 (framework-transition); 1921 (framework-transition)
- entity-andorra: 1806 (partial-framework)
- entity-austrian-netherlands: No framework-boundary warning from existing metadata.
- entity-batavian-republic: 1801 (framework-transition); 1805 (framework-transition); 1806 (partial-framework)
- entity-helvetic-republic: 1800 (framework-transition); 1801 (partial-framework); 1803 (partial-framework)
- entity-san-marino: No framework-boundary warning from existing metadata.

## Limits

Automatic boundary detection is a conservative coverage review, not proof of incompatible history or a complete chronology. Missing undated transitions cannot be inferred; reviewed equivalents prevent editorial coverage boundaries from becoming false political transitions. The atlas remains year-based; the interface does not promise month/day selection. Missing prior France 1815 regimes are explicitly uncurated, rather than named or dated without research. Requested-year facts remain independent of snapshot geometry.

## Validation

45 automated tests and 161 headless Edge browser checks passed with zero runtime errors. Browser checks cover all required transitions, ordinary examples, all Batch 01 entities, dated records, separate ambiguous identities, citations, search, responsive layout, timeline/map controls and metadata/snapshot failures. Syntax and provenance/date/mapping validation passed. Coverage generation/check and a baseline comparison confirm unchanged totals, snapshot counts, mappings, ambiguity accounting and accepted tiers. git diff --check passed.
