# Historical Atlas

Historical political map with date-aware territory dossiers. v0.6.1 expands the seven existing curated profiles; geometry, map identities and fallback dossiers remain separate from historical knowledge.

## Release coverage

All six 1939 showcases resolve metadata against requested year 1939 with the nearest 1938 boundary snapshot. Each has sourced names, historical flags (including the explicitly identified Raj office standard), capital, dated population, political status, government, leadership, currency, overview and events. Sections appear only when facts exist.

| Profile | Expanded categories |
| --- | --- |
| United States | Constitutional status/Congress, dollar, Truman/Eisenhower, diplomatic relationships and events, independence period, successive overviews; existing census/flags retained. |
| United Kingdom | Formal name, Union Flag, London, official historical population estimates, sterling, parliamentary monarchy/legislature, Windsor dynasty, successive monarchs/prime ministers and parties, Raj relationship, events/overviews. |
| Germany under Nazi rule | Historical national flag, Berlin, scoped census totals, Reichsmark, party/Reichstag, constitutional predecessor, wartime events and successive overviews. |
| Soviet Union | Formal name/alias, constitution/legislature, Moscow, historical flag variants, 1926/1959 census totals, historical currency, actual formal offices alongside Stalin’s functional leadership, parties, relationships, formation/dissolution and partial successors. |
| Imperial Japan | Historic Hinomaru, Tokyo, prefectural censuses excluding colonies, yen, sovereign emperor/Diet, successive prime ministers, constitutional successor and wartime events/overviews. |
| Postwar Japan | Historical flag, capital/censuses/currency, symbolic emperor/Diet, successive prime ministers, occupation/peace-treaty status and overviews, constitutional predecessor. |
| British Raj | Delhi/New Delhi, office standard, India census totals excluding Burma, rupee, central legislature, viceroys/Crown monarch/dynasty, Company predecessor and India/Pakistan successors, events/overviews. |

## Overview intervals

Exact end dates are exclusive; a partial end can overlap its final month/year. A selected year can show both sides of a transition. Coverage limits do not claim institutional creation/dissolution.

- **united-states**: 1937-01-20 → 1941-01-20; 1941-01-20 → 1941-12-08; 1941-12-08 → 1945-09; 1945-09 → 1953-01-20; 1953-01-20 → 1961-01-20.
- **united-kingdom**: 1937-05 → 1939-09-03; 1939-09-03 → 1940-05-10; 1940-05-10 → 1945-07; 1945-07 → 1951; 1951 → 1961-01-01.
- **germany-nazi-period**: 1934-08-02 → 1939-09-01; 1939-09-01 → 1941-06-22; 1941-06-22 → 1945-04-30.
- **soviet-union**: 1936 → 1939-08-23; 1939-08-23 → 1941-06-22; 1941-06-22 → 1945; 1945 → 1953-03; 1953-03 → 1961-01-01.
- **japan-meiji-framework**: 1930 → 1937-07; 1937-07 → 1941-12; 1941-12 → 1945-01-01.
- **japan-postwar-framework**: 1947-05-03 → 1952-04-28; 1952-04-28 → 1961-01-01.
- **british-raj**: 1858 → 1939-09; 1939-09 → 1947.

## Provenance and deliberate gaps

The registry has 82 sources, including 62 added in v0.6.1. New evidence includes U.S. National Archives, presidential libraries and Mint; British Parliament, Royal Household, ONS and Bank of England; Bundestag, Berlin historical resources, Destatis and Bundesbank; the 1936 Soviet constitution, State Archive/FRUS, scholarly reference works and archival census tables; Japan’s Cabinet Office, Imperial Household, Statistics Bureau, Bank of Japan and Ministry of Foreign Affairs; India’s Parliament, RBI, New Delhi municipal history, archival viceroy records and museum collections. Full titles, links, access dates, pinpoint notes and reuse details are in [the source registry](data/historical-sources.json).

Population values retain observation dates and are never interpolated. UK figures are official mid-year estimates; German 1939 coverage uses the 1937 territory; Japanese figures retain prefectural geography, publication rounding and Okinawa date exceptions; Indian totals cover a wider census area than one Raj polygon. The contested Soviet 1939 census is omitted: 1939 displays the explicitly dated 1926 total, while 1960 displays 1959.

No new area, density or GDP figures are supplied: researched publications did not establish consistently comparable historical territory/measurement scope for these map polygons. No arbitrary state-origin dates, speculative dynasties, unsupported parties or succession inferred from overlap were added. Constitutional regime changes are distinguished from state succession. Soviet successors are an explicitly partial list, not Russia alone. German occupation zones are not asserted to be successor sovereign states. The Raj standard is an office flag, not a national flag. Other entities retain map-derived fallback dossiers.

## Flag assets and reuse

Downloaded SVGs are unmodified source assets, not procedural reconstructions. Each retains applicability sources, dates, alt text, licence and attribution. Historical sensitive symbolism is presented as documentation.

| New local asset | Attribution | Reuse |
| --- | --- | --- |
| [uk-union.svg](./assets/flags/uk-union.svg) | Yaddah; historical Union Flag design | Public domain; [source](https://commons.wikimedia.org/wiki/File%3AFlag%20of%20the%20United%20Kingdom%20(3-5).svg) |
| [de-1935.svg](./assets/flags/de-1935.svg) | German government | Public domain; [source](https://commons.wikimedia.org/wiki/File%3AFlag%20of%20Germany%20(1935%E2%80%931945).svg) |
| [su-1936.svg](./assets/flags/su-1936.svg) | Rotemliss; subsequent Wikimedia Commons contributors | Public domain; [source](https://commons.wikimedia.org/wiki/File%3AFlag%20of%20the%20Soviet%20Union%20(1936%20%E2%80%93%201955).svg) |
| [su-1955.svg](./assets/flags/su-1955.svg) | Cmapm | CC BY-SA 3.0 ([licence](https://creativecommons.org/licenses/by-sa/3.0/)); [source](https://commons.wikimedia.org/wiki/File%3AFlag%20of%20the%20Soviet%20Union%20(dark%20version).svg) |
| [jp-1870.svg](./assets/flags/jp-1870.svg) | Kahusi | Public domain; [source](https://commons.wikimedia.org/wiki/File%3AFlag%20of%20Japan%20(1870%E2%80%931999).svg) |
| [raj-viceroy.svg](./assets/flags/raj-viceroy.svg) | Greentubing~commonswiki (attribution as recorded by Commons); Union Flag by Zscout | Public domain; [source](https://commons.wikimedia.org/wiki/File%3AFlag%20of%20the%20Governor-General%20of%20India%20(1885%E2%80%931947).svg) |

The Soviet 1955 SVG by Cmapm is distributed unchanged under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). Source attribution and licence are retained here and in the dossier/source registry; this licence applies to that asset. Existing U.S. flag provenance remains in the metadata.

## Validation

Required checks: syntax for app.js, data-pipeline.js, historical-metadata.js, dossier.js and boundary-history.js; node --test tests/dossiers.test.mjs; git diff --check. Tests cover source resolution/SVG safety, six 1939 showcases, dated statistics, flags, intra-year leadership, overview periods, explicit succession, identity separation and boundary-history behaviour. Browser validation checks the 1939/1938 distinction, showcases, navigation, controls, responsive layout and failure paths.
