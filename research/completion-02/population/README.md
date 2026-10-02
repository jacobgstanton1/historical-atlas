# Wave 1: population dataset ingestion

This tranche imports real source observations through the existing independently certified, serial production integrator. It does not change the atlas frontend or its configured snapshots.

## Sources and reproducibility

- OWID indicator 953903, population dataset version 2024-07-15, downloaded 2026-10-02. The original population CSV, country/year source table, metadata and methodology are preserved in `cache/`.
- Gapminder Population v7, updated 2022-10-19. The primary workbook downloaded from `https://gapm.io/dl_popv7` is preserved, with a reproducible literal-cell extractor. All proposed Gapminder values must match the primary workbook exactly.
- UN World Population Prospects 2024 observations are accessed through OWID's documented source mapping. They are estimates, not newly discovered contemporary censuses. Togo's interim update is excluded pending explicit version attribution.
- Systema Globalis's official population and entity CSVs are preserved at revision `ee190605fdec9d1c35c38e18e869a400a5818fe6`. Former-country labels alone do not establish historical territorial compatibility; no former-country rows were approved in this tranche.
- The official `Gapminder-Indicators/pop` repository's workbook is version 5 (2017), not version 7. It is preserved for provenance but is not the production input.

Gapminder and Systema Globalis are CC BY 4.0; UN WPP is CC BY 3.0 IGO. Production source records retain attribution. OWID metadata reports `nonRedistributable: false`. This does not imply permission for unrelated datasets.

## Historical safeguards

The datasets generally reconstruct population within current borders. An entity name or country code therefore cannot authorize a historical import. `historical-crosswalk.json` records independent scope review, confidence, applicable snapshot years and supporting sources. Codes identify external statistical territories, not retrospective ISO assignments to historical governments.

Only reviewed EXACT/HIGH_CONFIDENCE mappings may pass. Observations retain the actual year and estimate label; no atlas interpolation, invented census designation, invented January/July date, point-to-interval conversion or geographical fallback occurs. Year-precision observations must fit entirely inside the existing historical framework's validity envelope. Existing supported population slots are skipped.

The retained historical reviews contain held/incompatible cases. Four additional source-year observations use HYDE rather than an approved adapter and remain held. These holds do not count as resolved slots.

## Intake and recovery

Run `node scripts/research-population-wave.mjs research/completion-02/population/territorial-review.json research/completion-02/population/asia-former-crosswalk-review.json` to regenerate candidates against the frozen baseline. The source-wide independent certificate binds exact inputs, parser bytes and claim digests. It must be reviewed again if those inputs change.

Run `node scripts/research-completion-integrate.mjs research/completion-02/population/intake/cohort.json research/completion-02/population/intake/certificate.json --apply` for serial integration. Existing package IDs and exact claim digests make interrupted integration resumable. Do not overwrite accepted packages or bypass the certificate.

The initial intake correctly failed closed because the adapter omitted the required `risks` array. Its zero-integration result and superseded certificate are preserved. The corrected certificate independently proves that adding `risks: []` was the only claim change; source values, dates and mappings were unchanged.

The previous source-discovery prototypes under `completion-02/external/` and `officeholders/` remain preserved locally but excluded from redistribution pending terms review. They supplied no claims to this tranche. The specified wave manifest supersedes those experiments.

See `wave-report.json` for completed gains, validation and held counts, and `live-deployment.json` for the actual Pages deployment proof. Zero atlas browser checks are required for this data-only tranche. Continue with Wave 2 political-system datasets only after this checkpoint is pushed and live; do not resume internal-reuse optimization or officeholder-to-Important-Figures conversion.
