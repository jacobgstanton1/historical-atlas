# Bounded contemporary currency and exchange observations

Two original Federal Reserve Bulletin tables are extracted offline with coordinate-aware Python parsers using pdfplumber. Country/header anchors and actual glyph positions replace the scrambled OCR reading order. Each result binds original PDF bytes, printed/PDF page, raw source cells, source precision, quoted unit, quotation method and review limitations. The retained renderings support independent visual review.

## July1930, printed450

Run `extract-frb1930.py`:44dated monetary-unit observations and132monthly exchange observations. Actual footnote dates override the displayed column month for Turkey and Egypt. The inconsistent original Egyptian superscript6 remains held; nothing changes it to a plausible date. Missing decimal glyphs, nominal Russia, multiple China units, Java scope and Peru's reform are held. Literal ditto units remain held for an explicit review decision. Nominal/statistical rates do not establish sole legal tender or continuous currency validity.

The independent review of the frozen1930 result is retained separately by the reviewer under `research/bulk-01/frb-review`; no reviewer acceptance is performed by this worker.

## December1938, printed1098

Run `extract-frb1938.py`:41header columns,39distinct unit observations, and738literal annual/monthly exchange observations. Only explicitly dated1938monthly candidates are ready for independent review. All annual1929–1937observations are held until the referenced March1938method/nominal-status notes and prior framework mappings are reviewed. This is a raw source acquisition, not a continuous economic series.

The source explicitly distinguishes official/free-market Brazil and official/export Chile quotations. The Chile export column is held because the original facsimile shows4.0000 while the text layer corrupts the leading glyph. Nominal quotation windows, missing Austrian quotations after14March, contested frameworks, and unclear numeric glyphs are retained as review cases. No OCR value is rewritten to the expected number.

`validation.json` and `validation1938.json` record bounded source-integrity, shape, date and fail-closed checks. Coordinate output is not production truth: an independent reviewer must verify values, source scope, actual months and historical mappings before the coordinator serially integrates accepted observations.

No production metadata, common engine, handoff or Git files were edited.
