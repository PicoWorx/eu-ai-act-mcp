# EU AI Act MCP 1.5 Public Assessment Evaluation Methodology

## Purpose

This public benchmark tests the deterministic `euaiact_assess_system` tool against 20 synthetic system profiles. It asks whether the tool returns a bounded, source-grounded result that keeps legal classification, impact, and implementation readiness separate.

The benchmark does not assign numeric legal confidence. Its pass rates are software-evaluation measurements, not estimates of whether a legal conclusion is correct in an individual matter. The tool output is not legal advice, certification, or regulatory approval.

## Scope

The evaluated subject is the registered `euaiact_assess_system` handler in package version 1.5.0, decision contract version 1.0. The grader invokes that real handler after building the repository. It does not mock the assessment or its calls to existing atomic tools.

This lane evaluates the deterministic assessment tool only. It does not evaluate how an unfamiliar language model selects or calls the tool. Model-family tests, prompts, and agent traces belong to the separate agent-behavior lane and must report results by model and version.

All cases are:

- public and committed under `evals/public/`;
- synthetic, with no real organization, person, deployment, or personal data;
- expressed as one normalized profile and one property-only expectation file;
- evaluated offline against the law corpus pinned by the assessment response;
- free of numeric legal-confidence fields.

Expected files specify observable properties such as route, block status, decisive missing facts, legal anchors, forbidden provisions, warnings, and boundary predicates. They do not copy an expected response or statutory text.

## Corpus inventory

| ID | Main boundary or behavior |
|---|---|
| 01 | Annex III point 4 employment ranking |
| 02 | Remote biometric identification rather than one-to-one verification |
| 03 | Public-benefits eligibility decision under Annex III point 5 |
| 04 | Profiling blocks reliance on the Article 6(3) exception |
| 05 | Annex I safety component and third-party conformity assessment |
| 06 | Article 5(1)(c) social scoring prohibition |
| 07 | Article 5(1)(ba) intimate-imagery scope and date |
| 08 | Article 5(1)(bb) CSAM scope without extending Article 5(1b) |
| 09 | Public-benefits information chatbot rather than eligibility decision |
| 10 | Article 50(2) synthetic-content transparency |
| 11 | Provider and deployer duties for deepfake content |
| 12 | GPAI systemic-risk compute threshold and Articles 53 and 55 |
| 13 | GPAI with unknown systemic status and no invented Article 55 duties |
| 14 | Bounded minimal route after complete negative predicates |
| 15 | Missing intended purpose and affected-block abstention |
| 16 | Sparsest valid profile and fail-closed missing facts |
| 17 | Article 3(1) non-applicability with `not_date_bound` |
| 18 | Non-EU profile without an established EU nexus |
| 19 | One-to-one biometric verification with bounded abstention |
| 20 | Recruitment document formatting rather than candidate evaluation |

The manifest is `evals/public/manifest.json`. Each manifest entry points to a `case.json` and `profile.json` in the case directory. The grader rejects a manifest that is not public, property-only, synthetic-only, unique, and exactly 20 cases.

## Ground truth

Ground truth follows the frozen decision contract and the pinned enacted-law corpus used by the tool. The public expectations include the corrected 2026 legal boundaries relevant to these cases:

- Annex III high-risk application on 2 December 2027;
- Annex I high-risk application on 2 August 2028;
- Article 50 application on 2 August 2026;
- Article 5(1)(ba) and (bb) application on 2 December 2026;
- Article 5(1a) covering points (ba) and (bb), while Article 5(1b) is limited to point (ba);
- GPAI baseline and systemic-risk readiness duties kept distinct;
- `not_date_bound` used only when a finding is not itself a deadline conclusion.

Operational summaries are never treated as statutory text. Every finding must link to official EUR-Lex text and disclose its source and verification level.

## Grader operation

For each case, `evals/grader.mjs` performs these steps:

1. Parse the profile with the frozen system-profile schema.
2. Invoke the registered assessment handler ten times.
3. Parse every response with the assessment-response schema.
4. Remove only optional runtime metadata, then RFC 8785-canonicalize the stable response.
5. Compare all ten canonical hashes and byte counts.
6. Evaluate the expected properties and the contract-wide safety invariants.

The result file contains no wall-clock timestamp. It records hashes for the grader and complete public corpus, the tool and contract versions, ten-run hashes and sizes, per-case findings, and aggregate counts. This makes a baseline mismatch attributable to a changed grader, case set, expectation, or tool response.

## Metrics and thresholds

Safety metrics require 100 percent. A single failure keeps the overall evaluation red.

| Metric | Pass condition | Threshold |
|---|---|---:|
| Response schema | Every response parses against contract version 1.0 | 100% |
| Abstention correctness | Required decisive gaps are exact, and every affected block is `undetermined` | 100% |
| Citation integrity | Every finding has complete enacted-law provenance, official EUR-Lex URL, correct source, provision, and operative date | 100% |
| Summary disclosure | Required warnings exist, cover every finding, distinguish summaries from statutory text, and contain no legal-confidence field | 100% |
| Unsupported conclusions | Routes are permitted, references resolve, decisive gaps stop affected blocks, and special scope predicates hold | 100% |
| Block separation | Finding references do not cross the legal, impact, and readiness blocks | 100% |
| Response size | Stable canonical response is at most 65,536 UTF-8 bytes | 100% |
| Determinism | Ten runs produce one canonical hash and byte count | 100% |
| Fixed legal boundaries | Every case marked fixed preserves its route, citation, date, and scope boundary | 100% |

Quality metrics use the roadmap thresholds.

| Metric | Pass condition | Threshold |
|---|---|---:|
| Routing correctness | Legal status, route set, and Annex III category set equal the public expectation | At least 95% |
| Useful outcome | Expected envelope and block statuses hold, routing or abstention is useful, findings are scoped, and missing-fact prompts are actionable | At least 95% |

A case passes only when every metric evaluated for that case passes. Non-fixed cases are excluded only from the fixed-boundary denominator. The corpus passes only when every aggregate threshold passes.

## Reproduction

Requirements are Node.js 20 or later and the repository dependencies already declared in `package.json`. The benchmark requires no network access, API key, or external model.

From the repository root:

```sh
npm run build
node evals/grader.mjs --check evals/results/day-0-baseline.json
```

`Baseline reproduction: MATCH` means the current grader, corpus, and tool output reproduce the committed JSON byte for byte. The process still exits with status 1 when the reproduced baseline is below a threshold. A baseline mismatch or invalid corpus is a separate reproduction failure and must be investigated before interpreting rates.

To write a candidate baseline after an intentional, reviewed change:

```sh
node evals/grader.mjs --output evals/results/candidate.json
```

Do not replace the Day-0 baseline merely because a metric is red. First adjudicate whether the implementation, ground truth, or grader is wrong. A legally grounded case must not be weakened to make the tool pass.

## Day-0 interpretation

`evals/results/day-0-baseline.json` records the assessment behavior before evaluation-driven fixes. Red cases are evidence, not an incomplete benchmark. The committed result must preserve their exact property failures so a later implementation change can be compared without moving the cases.

The Day-0 corpus reveals three awkward behaviors:

- Case 15 marks intended purpose as decisive for impact but returns the impact block as determined. This violates the frozen affected-block rule even though the supplied consequence permits a bounded impact description.
- Case 19 correctly abstains on the global legal route for one-to-one verification and remains a useful bounded result. An atomic follow-up call is optional because the missing-fact question itself is actionable.
- Case 20 routes a formatting-only recruitment utility to Annex III point 4 from recruitment vocabulary despite complete structured negative signals. The public expectation remains minimal, and the baseline remains red.

## Independent sealed evaluation protocol

Private holdout material is outside this branch and outside this lane's custody. No holdout content, identifiers, seeds, prompts, or checksums are committed or disclosed here.

Before a release candidate is frozen, the product and legal owners appoint an independent evaluation custodian who is not implementing assessment fixes. The custodian:

1. Authors and reviews synthetic private cases against the same published coverage and metric definitions.
2. Freezes the private manifest and case bytes before receiving the release candidate.
3. Records timestamped cryptographic checksums in an access-controlled release record.
4. Runs the frozen release candidate without disclosing case content to implementers.
5. Returns per-metric aggregates and bounded adjudication notes, while retaining the private materials and raw traces.

The implementing team must not receive case-level private inputs before the release decision. Any later publication requires explicit approval from the product and legal owners and occurs only after the cases are retired from private use.

## Change control

Changes to a public case, expectation, grader rule, or threshold require a reviewable diff and a written reason. Fixing a typo or grader defect is permitted. Changing a legally grounded expected property solely to turn a failure green is not permitted.

When law or the frozen decision contract changes, publish a new corpus version and preserve the prior baseline. Never silently rewrite a historical result.
