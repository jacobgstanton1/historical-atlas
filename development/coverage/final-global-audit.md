# Phase 2 global structural and temporal audit

Run time: 2026-10-01T17:13:51.853Z. State: structural-checks-passed-review-candidates-reported. Input hashes are in the JSON report.

Annual checks: 141680 raw/year pairs; 63057 interval-filtered facts; 128461 unmapped no-fallback checks. Boundary checks: 1189 positive and 1167 negative.

Structural errors: 0. This helper does not validate historical source truth, fetch source pages, alter production or make corrections.

## Qualified counts
{
  "denominator": 401,
  "expectedDenominator": 401,
  "rawTotal": 880,
  "totals": {
    "political-polity": 223,
    "dependent-administration": 178,
    "community-people": 398,
    "geographic-or-composite": 2,
    "name-variant-or-duplicate": 7,
    "unresolved": 72
  },
  "singleEntityAvailability": 362,
  "availabilityIncludingTransitions": 364,
  "manifestPoliticalCoverage": {
    "candidates": 401,
    "covered": 362,
    "uncovered": 39,
    "percentage": 90.27
  },
  "qualified": "Availability in at least one source-present snapshot; neither coverage across all years nor complete dossiers."
}

## Batch completion
- political-batch-01: reviewed; 24/24 assigned raws reviewed; researched-with-partial-coverage.
- political-batch-02: reviewed; 17/17 assigned raws reviewed; researched-with-partial-coverage.
- political-batch-03: reviewed; 17/17 assigned raws reviewed; researched-with-partial-coverage.
- political-batch-04: reviewed; 21/21 assigned raws reviewed; researched-with-partial-coverage.
- political-batch-05: reviewed; 15/15 assigned raws reviewed; researched-with-partial-coverage.
- political-batch-06: reviewed; 18/18 assigned raws reviewed; researched-with-partial-coverage.
- political-batch-07: reviewed; 26/26 assigned raws reviewed; researched-with-partial-coverage.
- political-batch-08: reviewed; 10/10 assigned raws reviewed; researched-with-partial-coverage.
- political-batch-09: reviewed; 20/20 assigned raws reviewed; researched-with-partial-coverage.
- political-batch-10: reviewed; 18/18 assigned raws reviewed; researched-with-partial-coverage.
- political-batch-11: reviewed; 15/15 assigned raws reviewed; researched-with-partial-coverage.
- political-batch-12: reviewed; 27/27 assigned raws reviewed; researched-with-partial-coverage.
- political-batch-13: reviewed; 17/17 assigned raws reviewed; researched-with-partial-coverage.
- political-batch-14: reviewed; 18/18 assigned raws reviewed; researched-with-partial-coverage.
- political-batch-15: reviewed; 25/25 assigned raws reviewed; researched-with-partial-coverage.
- political-batch-16: reviewed; 15/15 assigned raws reviewed; researched-with-partial-coverage.
- political-batch-17: reviewed; 30/30 assigned raws reviewed; researched-with-partial-coverage.
- political-batch-18: reviewed; 19/19 assigned raws reviewed; researched-with-partial-coverage.
- political-batch-19: reviewed; 16/16 assigned raws reviewed; researched-with-partial-coverage.
- political-batch-20: reviewed; 15/15 assigned raws reviewed; researched-with-partial-coverage.
- political-batch-21: reviewed; 24/24 assigned raws reviewed; researched-with-partial-coverage.

## Review candidates
- sources-not-referenced-by-production-facts: 27.
- overlappingMappings: 10.
- frameworkOverlapCandidates: 49.
- sharedNameEntityCandidates: 131.

- Resolver audit covers all880 raw identities for every calendar year1800–1960, independent of snapshot presence.
- Annual identityPeriods may contain multiple historically successive frameworks; intra-year transition is not a same-day incompatible overlap.
- Population/economy are observationsForYear carry-forward values, not interval-filtered political facts. Events/predecessors/successors are historical timeline context. Their source dates remain checked without requiring event date to equal selected year.
- Overlapping different political identities/framework facts and shared-name profiles are review candidates, not automatic errors or merge instructions. Simultaneous offices can coexist.
- URL variants are provenance review candidates; redirects/content equivalence are not verified by this offline helper.
- Existence envelopes may contain researched gaps; facts and mappings are checked independently. No geometry determines sovereignty or succession.

Full references, URL variants, orphan sources, overlap records and shared-name candidates are in final-global-audit.json. Final totals must be rerun after Batch21 and any separately justified audit corrections.
