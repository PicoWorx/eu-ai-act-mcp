# MIGRATION-001: Source-status honesty and G8 legal-review corrections

- Status: approved
- Approved by: Werner
- Approval date: 14 August 2026
- Implementation branch: `sprint/mig-001-legal-fixes`
- Base branch: `sprint/l6-public-evals`

## Decision

The decision contract advances from version 1.0 to 1.1.

Regulation (EU) 2024/1689, as amended by Regulation (EU) 2026/1744, has `instrument_status: enacted`. The pinned consolidated EUR-Lex snapshot is official documentation text without legal effect and has `source_status: official_consolidated_snapshot_non_authentic`. The authentic OJ acts identified by `source.oj.2024.1689.original` and `source.oj.2026.1744` are the authority sources for legal propositions.

`verification_level: consolidated_snapshot_integrity_verified` means only that the identity and integrity of the pinned snapshot were checked. It does not mean that the snapshot has legal effect, is current or complete for a matter, or that an interpretation, compliance state, certification, approval, or conformity assessment was verified.

Every legal provenance entry therefore carries:

- `instrument_status: enacted`
- `source_status: official_consolidated_snapshot_non_authentic`
- `verification_level: consolidated_snapshot_integrity_verified`
- `authority_source_ids` naming the authentic original and amending OJ acts

The authentic-source statuses `enacted_oj` and `complete_official_text` remain available for records that actually refer to authentic OJ acts and complete authentic text.

Every assessment includes this warning exactly:

> Corpus verification confirms only the identity and integrity of the pinned files. It does not establish that the consolidated snapshot has legal effect, that the corpus is current or complete for the facts, that an interpretation is correct, or that a system is compliant, certified, approved, or has passed a conformity assessment.

## Finding basis and provenance

Contract 1.1 adds `finding_basis`:

| Value | Meaning | Provenance rule |
|---|---|---|
| `legal_proposition` | A conclusion derived from a legal provision | At least one exact legal provenance entry is required |
| `caller_supplied_impact` | A qualitative impact statement assembled only from caller facts | Legal provenance must be empty |
| `tool_state_abstention` | A statement that the tool lacks facts or cannot resolve a route | Legal provenance must be empty |

This removes the false Article 1(1) citation from caller-supplied impact descriptions and the false composite legal citations from tool-state abstentions.

## G8 corrections included in this migration

1. The Annex IV wording is pinned to the required Article 11(1) wording, including SMEs, start-ups, SMCs, and mandatory use of the Commission form when the simplified route is chosen.
2. The Article 73 summary separates the provider's Article 73(6) investigation and cooperation duties from the deployer's Article 26(12) cooperation duty. It no longer invents Commission participation in every investigation.
3. Article 50 readiness duties are selected only when their paragraph-specific legal trigger was established for the relevant actor.
4. A GPAI-model finding uses Article 3(63) at 2 February 2025. Compute above 10^25 FLOPs produces a separate Article 51(2) presumption finding with the Article 52(2) rebuttal route before Article 55 duties are selected.
5. Social scoring requires an explicit Article 5(1)(c)(i) or (ii) treatment limb. A social-scoring label without either limb causes abstention.
6. The bounded minimal result uses the exact negative wording required by G8 and separate anchors for only the tested predicates.
7. Article 3(1) uses 2 February 2025. Current Article 4 wording uses 27 July 2026. Annex I findings also identify Article 6(1a) to (1c). High-risk date outputs carry the Article 111 limitation.
8. Every determined legal result carries the Article 2 territorial-scope limitation required by G8.
9. Readiness carries the exact completeness and compliance limitation required by G8.
10. Prohibited-practice readiness cites the exact Article 5 paragraph instead of generic Article 5.
11. N7 required no content correction because no pseudonymisation claim appears in the reviewed assessment surfaces. The review's stated future guard remains unchanged.
12. The reported gap of 20 wording objects was resolved in SPRINT-LOG M7 and M8 as a unit mismatch: 26 claim-matrix checks covered six changed wording objects. No wording object remains unavailable.

## Captain-authorized public-eval correction

SPRINT-LOG M6b authorizes one non-migration expectation correction. In `15-missing-intended-purpose/case.json`, expected impact status changes from `determined` to `undetermined` because the same case already declares intended purpose decisive for the impact block. The case file records this authorization in `authorization_comment`. No other evaluation expectation changes are made except those required by this contract migration and its source-status, exact-anchor, operative-date, warning, and statutory-predicate changes.

## Compatibility

This is a breaking schema migration for decision-envelope consumers:

- `contract_version` changes from `1.0` to `1.1`.
- `finding_basis` is required.
- `provenance` may be empty only for caller-supplied impact findings and tool-state abstentions.
- Legal provenance requires `instrument_status` and `authority_source_ids`.
- Two source and verification enum values are added.
- The system profile adds `social_scoring_unrelated_context` and `social_scoring_unjustified_or_disproportionate`.

Atomic tool shapes remain unchanged except that the classifier accepts the two new optional social-scoring signals. Intentional atomic content changes are the two frozen wording corrections and the current Article 4 date correction.

## Dependent surfaces

The migration covers all known dependent surfaces:

- Contract sources: `schemas/shared.ts`, `schemas/profile.ts`, `schemas/finding.ts`, `schemas/envelope.ts`, and their runtime mirrors under `src/decision-contract/`.
- Generated schemas: every file under `schemas/json/` is regenerated from its TypeScript source.
- Runtime assessment: provenance construction, legal classification, impact, readiness, warnings, versioning, and corpus authority references.
- Atomic classification: social-scoring input schema, routing keys, follow-up questions, and Article 5(1)(c) rule.
- Knowledge and served wording: Annex IV, Article 11, Article 73, Article 4 obligations, the Annex IV tool, and the Annex IV resource.
- Compiler: LawPatch source-status and verification-level unions, schema mirror, and fixture.
- Fixtures: decision-contract examples, assessment inputs, compatibility hashes, and all twelve golden responses and canonical hashes.
- Tests: behavior suite, claim matrix, schema suite, compiler suite, exact Article 50 isolation checks, and finding-reference checks.
- Public evaluation: manifest, grader, methodology, all case expectations, four profiles affected by the new social-scoring facts, and the Day 2 baseline.
- Generated distribution: compiled JavaScript, declarations, and source maps under `dist/` and `compiler/dist/`.

## Public-eval change ledger

| File | Change | Reason |
|---|---|---|
| `evals/public/manifest.json` | Corpus 1.1 and explicit provenance expectation | Source-status migration |
| `evals/grader.mjs` | Contract 1.1, basis-aware provenance rules, new source warning, Article 4 date, and run label | Validate the migrated contract honestly and emit Day 2 |
| `evals/METHODOLOGY.md` | Contract, provenance, date, and historical-baseline documentation | Document the migrated benchmark |
| Cases 01 to 11 `case.json` | Case 1.1 and required `NON_BINDING_SOURCE` warning | Contract-wide source-status migration |
| Case 12 `case.json` | Case 1.1, source warning, Article 3(63), Article 51(2), and Article 52(2) anchors | Separate GPAI model and systemic-risk propositions |
| Case 13 `case.json` | Case 1.1, source warning, and Article 3(63) at 2 February 2025 | Replace composite and undated anchor |
| Case 14 `case.json` | Case 1.1, source warning, and separate tested-route anchors | Replace unsupported composite minimal anchor |
| Case 15 `case.json` | Case 1.1, source warning, empty abstention provenance, and impact `undetermined` | Source migration plus the SPRINT-LOG M6b correction |
| Case 16 `case.json` | Case 1.1, source warning, and empty abstention provenance | Tool-state abstention migration |
| Case 17 `case.json` | Case 1.1, source warning, and Article 3(1) at 2 February 2025 | Correct Chapter I application date |
| Case 18 `case.json` | Case 1.1, source warning, and empty abstention provenance | Tool-state abstention migration |
| Case 19 `case.json` | Case 1.1, source warning, and empty abstention provenance | Tool-state abstention migration |
| Case 20 `case.json` | Case 1.1, source warning, and separate tested-route anchors | Replace unsupported composite minimal anchor |
| Case 06 `profile.json` | Add Article 5(1)(c)(i) true fact | Supply the decisive social-scoring treatment limb |
| Cases 14, 18, and 20 `profile.json` | Add both Article 5(1)(c) treatment-limb facts as false | Keep complete tested-predicate profiles explicit under the new schema |
| `evals/results/day-2-baseline.json` | Add a new migrated baseline | Preserve Day 0 and Day 1 while recording the approved result |

## Verification and promotion

The required promotion gates are:

1. Build and behavior suite.
2. Claim matrix, including the two new wording checks.
3. Post-serialization schema suite.
4. Corpus seal verification.
5. Regulation compiler suite.
6. Public grader with ten runs per case and every safety metric green.
7. Baseline byte-for-byte reproduction.

This branch does not publish, deploy, tag, merge, or replace either historical baseline.
