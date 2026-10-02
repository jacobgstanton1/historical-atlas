# Bounded1960 original-source extraction

Source: Federal Reserve Bulletin December1960, printed1427 (PDF index108), original official FRASER facsimile. Original file `frb_121960.pdf` SHA256 `e7ff004d8734751e1fea1545cfe54503b16d165bfa105b32f414bfb86d3c40ca`. Full page rendered in `frb-1960-p1427.png`; original table and all six footnotes preserved. Layout text in `frb-1960-p1427-layout.txt` is supporting extraction, not authority over the facsimile.

Reproduce using the bundled Python runtime with pdfplumber: `extract-frb1960.py`. It asserts original bytes/page dimensions and uses visually reviewed header spans, month anchors and per-cell glyph coordinates. It does not invent missing digits or decimals.

Frozen output `frb1960-extracted.json` canonical digest (scripts/research-common.mjs digest): `f67ccd5e9feb9200f44ecd3fd2f88f54e8fc3b2bfbcc7a6cd847bb179409cbbe`.

The actual1960 table has25 columns and11 months January–November:275 monthly exchange observations plus25 deduplicated quoted-unit observations.245 numeric cells parse;234 FX cells are source-extracted candidates,41 are held.23 unit observations are candidates and2 held. These are untrusted extraction states, not historical acceptance or production integration.

Annual1954–1959 and November/December1959 rows are excluded. The header measures averages of certified noon buying rates in New York for cable transfers, in cents per foreign-currency unit. It does not establish exclusive legal tender, territorial polygon correspondence, GDP or year-long currency persistence.

Argentina's former Official/Free subcolumns are physically merged in1960 rows; footnote1 explicitly states a single rate replaced both12January1959. The parser retains historical labels in provenance and extracts one quoted rate rather than inventing a second series.

France's1960 quotations concern the new franc introduced1January1960 at100 old francs (footnote4). The literal header remains 'franc'; every claim carries this qualification.

Philippine Republic quotations cease after April. April is explicitly based on quotations through22April1960 (footnote6), held for reviewed partial-month qualification; no later currency observation is manufactured.

The literal 'Malaysia' header appears in a1960 publication although the later federation dates to1963. Its mapping/scope remains held; it is not silently renamed to Malaya. Blank/ambiguous numeric glyphs are also held. Independent review must bind this frozen artifact and evaluate actual1960 frameworks. No production or Git changes were made by this worker.
