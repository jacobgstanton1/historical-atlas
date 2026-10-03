# Capital-A external return: held, not production truth

102 supplied proposal rows contain 103 proposed claims. All remain held; zero
claims entered production. The baseline/current production fingerprint matches
the supplied return. The 43 identity-blocked and 15 deliberately blank edge
cases remain untouched.

Only `proposals_json` was copied into the authoritative Capital-A CSV. Every
other field was compared exactly against `baseline-before.csv`. Source files
are preserved without editing. The batch index reflects the changed CSV bytes.

`validation.json` contains the converted candidate packages, existing-validator
schema results, and additional mechanical provenance/date/mapping/conflict
checks. `completion-report.json` records the unchanged coverage counts.

The supplied `year-precision`/`day-precision` labels are not the existing
certainty enum (`exact`/`approximate`/`disputed`). They were preserved, not
silently changed to `exact`. The 97 year-precision claims have day-precision
interval endpoints; the existing no-invented-precision rule cannot certify
these as submitted. Day `until` is exclusive in the repository, whereas the
return uses prose such as “through” a date without a machine-readable endpoint
convention. No dates were extended or reinterpreted. No independent reviewed
source-body/package certificate was supplied, and no historical research or
source retrieval was performed to create one. Additional mapping/control
qualifications and existing overlaps remain explicit holds.

Before integration, the external return needs a precision/certainty and endpoint
contract compatible with the existing schema and source-bound evidence/review.
Conflicts and date-limited mappings must be reviewed without changing production
identities or accepted evidence merely to make proposals pass. No acceptance
receipt or review certificate has been fabricated. No integration function was
called because no proposal passed the acceptance gates.
