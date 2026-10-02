# HCD full-source feasibility and bounded event selection

Both complete official Stockholm University H-DATA tables were acquired: 19,023 country-year rows and 793 country-war rows covering 480 named wars and 130 war-participant countries. The provider describes HCD v1.0; the original annual download filename is HCD_country_year_level_v1_1.csv. Original URLs, bytes and hashes preserve that distinction. Scope is 1816–1945: atlas 1800, 1815 and 1960 are outside coverage. The eight remaining configured years have 734 source country-year rows.

Reuse was checked against current official DEMSCORE Security and Violence codebook (March 2026), section 3.1, printed page 27: **HCD Country-Year is explicitly CC BY-SA 4.0 International**. Source citation: Noonan, Joseph & Jan Teorell (2023), Historical Conflict Dataset (HCD), Stockholm University H-DATA. Licence documentation URL: https://www.demscore.se/documents/749/security_codebook.pdf. This is the HCD licence, not permission to redistribute raw COW datasets. Original merged tables and full copyrighted documentation stay locally cached and ignored. Public candidate reports exclude underlying COW casualty fields. Re-run research-hcd-public-report.mjs before publishing regenerated yield output.

Lossless Latin-1 byte decoding was used for CSV acquisition after strict UTF-8 rejected original non-UTF-8 bytes. Original bytes remain unchanged. Non-ASCII event names fail the cheap automatic gate; no names are silently repaired. Event dates retain year precision.

Full-source historical identity/relevance test:

- 61 candidate slots through atlas names/aliases; these remain historical-identity candidates, not automatic equivalences;
- 37 slots through previously independently reviewed country/entity namespace contracts;
- 18 of those already supported and 19 unresolved;
- only one unresolved single-year candidate through reviewed namespaces;
- all broader conflict-duration/participant-entry and unreviewed identity cases remain held.

**Critical temporal limitation:** HCD min_year/max_year describe when the conflict began/ended, not necessarily when each listed country entered/exited. Its United States World War I row uses 1914–1918, and the annual table sets inter_war=1 for USA/1914. These fields cannot be bulk-converted into exact selected-year national participation. The source is therefore a candidate generator, not a safe source of hundreds of automatically dated dossier events. No per-country historical research was launched to repair it.

Bounded original-row review selected one meaningful named intrastate conflict: **Ararat Revolt of 1930**, Turkey's existing 1928 framework, ISD640/TUR/1930. Both original conflict years equal 1930; the annual row names that conflict; external-participant flag is zero; the reviewed historical framework covers the year. A war-scale named revolt directly involving the selected political entity is relevant political context. Only this case was selected; dataset membership does not automatically make every conflict a Major Event. No exact day, casualty estimate, sovereignty change, beginning of the broader revolt, or polygon-wide fighting was asserted.

Actual integration: one event claim, one newly supported Turkey/1930 Events slot. Major Events 55 → 56 / 1,056. The other candidates are held. Selected HCD evidence/derived factual record and candidate excerpts retain **CC BY-SA 4.0** attribution to Noonan and Teorell: https://creativecommons.org/licenses/by-sa/4.0/. Transformations are country/framework matching, single-year filtering and bounded relevance selection; original annual dating is retained.

## Combined checkpoint

COLDAT + HCD add two unique production claims: 3,725 → 3,727; two dossiers gain useful evidence, but only **one** full supported/resolved slot is gained. Supported slots 7,058 → 7,059/15,840. Evidence Coverage and Research Resolution 44.55808% → 44.56439% (both round to44.56%). Unresolved 8,782 → 8,781. Sources 918 → 920; registry entities remain617. No critically sparse dossier eliminated. Original accepted packages and Important Figures outputs are preserved.

Final integrator audit: 53,185 checks, valid, no errors. Seven new focused source/date tests plus five preserved-candidate/package tests passed. Zero browser checks and no frontend changes. A former frozen-baseline equality test now verifies prior-package preservation so future authorised append-only integrations are not falsely treated as mutations. The earlier Important Figures no-production-change result remains valid for its own checkpoint.

This source pair does **not** produce the hoped-for hundreds-slot gain. Stop exceptions rather than fabricating continuity or participant dates. The next event acquisition system needs country-specific dated participation or independently dated major events; do not rerun these completed source scans or use HCD annual flags blindly. Original source cache recovery requires the recorded URLs and exact hash verification. Preserve deferred Important Figures, Capitals, Leadership, Population, Density and Flags.
