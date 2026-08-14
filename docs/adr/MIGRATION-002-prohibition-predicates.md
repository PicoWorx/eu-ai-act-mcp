# MIGRATION-002: Prohibition predicates and adjudicated holdout fixes

- Status: approved
- Approval date: 14 August 2026
- Implementation branch: `sprint/mig-002-holdout-fixes`
- Base branch: `sprint/l5-verify`
- Decision contract: 1.1 to 1.2
- Profile version: 1.0, with optional additive predicate groups

## Decision

The decision contract advances from version 1.1 to 1.2. The migration separates decisive positive facts, decisive negative facts, missing facts, and caller assertions that require human review. It implements the product half of the G11 adjudication for holdouts .03, .04, .05, .08, and .10.

The profile stays at version 1.0 because all new inputs are optional. A consumer that validates the response envelope must update for contract 1.2 and the new `human_review_required` decision status.

## Article 5 predicate structure

The optional `article_5_prohibitions` group contains dedicated statutory predicates rather than relying on purpose-text keywords:

| Predicate | Contract meaning |
|---|---|
| `operation` | `generation` or `manipulation` |
| `ba_realistic_intimate_or_sexually_explicit_material_of_identifiable_person` | Article 5(1)(ba) covered material |
| `ba_required_consent_present` | The freely given, specific, informed, unambiguous, and explicit consent required by point (ba) |
| `ba_manipulation_increases_intimate_exposure` | First Article 5(1b) exclusion boundary |
| `ba_manipulation_alters_sexually_explicit_activity` | Second Article 5(1b) exclusion boundary |
| `bb_directive_2011_93_category` | One exact Article 2(c) or (e) category from Directive 2011/93/EU, or `none` or `unknown` |
| `bb_without_right_defence_applies_under_national_law` | Supplied status of the point (bb) national-law defence |
| `provider_generation_or_manipulation_is_intended_purpose` | Article 5(1a)(a)(i) provider gate |
| `provider_foreseeable_and_reproducible_outcome_without_significant_modification` | Article 5(1a)(a)(ii) foreseeable-outcome gate |
| `provider_reasonable_and_adequate_safeguards_present` | Safeguard limb used with the foreseeable-outcome gate |
| `deployer_uses_for_generation_or_manipulation_purpose` | Article 5(1a)(b) deployer gate |

Provider and deployer findings are separate and actor-scoped. The provider branch is reached by an intended purpose, or by the foreseeable and reproducible outcome combined with absent reasonable and adequate safeguards. The deployer branch is reached only by the deployer's supplied generation or manipulation purpose.

Article 5(1b) applies only to point (ba). It never qualifies point (bb). For point (ba), generation records that Article 5(1b) does not exclude the conduct. A manipulation that increases intimate exposure or alters the nature of sexually explicit activity also records that the exclusion does not apply. A manipulation that does neither records Article 5(1)(ba) as `does_not_apply` because the Article 5(1b) exclusion applies.

Positive point (ba) and point (bb) findings state that their conditions are met and that the prohibition applies prospectively from 2 December 2026. The output must not describe those provisions as already applicable before that date.

## National-law defence policy P1

A caller assertion about the Article 5(1)(bb) `without right` defence never removes the prohibition route. The assertion remains in `facts_used` with `verification: caller_asserted`, the legal block and overall envelope use `human_review_required`, and a `LEGAL_REVIEW_REQUIRED` warning explains that the applicable national law must be reviewed.

This is fail-closed behavior. It prevents a supplied defence status from being promoted into a verified national-law conclusion. Evidence references are retained for human review, but this corpus does not resolve the defence or remove the prohibition route.

## Adjudicated product fixes

### Holdout .03

- Emit prospective Article 5(1)(ba) provider and deployer branches with their exact Article 5(1a) anchors.
- Evaluate Article 5(1b) and record why it does not exclude the conduct.
- Keep Article 50(2) only for the provider and Article 50(4) only for the deployer.
- Do not select Article 50(1) or Article 50(3) without their predicates.
- Retain the unresolved Article 111(4) transition for the provider's Article 50(2) compliance deadline.

### Holdout .04

- Emit the Article 5(1)(bb) provider and deployer branches from the dedicated Directive 2011/93/EU category and purpose gates.
- Apply policy P1 to the caller-asserted national-law defence fact.
- Never emit Article 5(1b) for the point (bb) branch.
- Keep Article 50(2) provider marking only when its independent predicate is true.

### Holdout .05

- A complete Article 5(1b) manipulation exclusion produces a determined negative boundary.
- `Article 5(1)(ba)` is `does_not_apply` because `Article 5(1b)` applies as the exclusion.
- The new Article 50 inputs `standard_editing_assistive_function` and `substantially_alters_input_or_semantics` produce an Article 50(2) `does_not_apply` finding when the standard-editing exclusion is established.
- When no higher route remains, these findings support a determined `minimal` route without inventing a missing intended-use fact.

### Holdout .08

- The adjudicated product boundary treats training compute at or above `10^25` FLOPs as triggering the Article 51(2) presumption.
- The legal finding is anchored to Article 51(1)(a), Article 51(2), Article 52(1), and Article 52(2).
- Readiness includes the Article 52(1) notification duty and retains the Article 53 and Article 55 duties.
- A false Commission-designation fact does not negate the independent compute route.
- Article 54 is not selected without a supplied third-country-establishment fact.
- GPAI readiness labels use canonical `Article` spelling. The grader normalizes legacy `Art.` spelling so orthography does not change a legal score.

The pinned statutory text says `greater than 10^25`. The at-or-above product boundary is the explicit approved adjudication for this migration and is pinned separately in the claim matrix so the divergence cannot be silent.

### Holdout .10

Missing geography and express negative geography are distinct states. When `placed_on_eu_market`, `used_in_eu`, and `output_used_in_eu` are all expressly false, actor roles and a non-Union jurisdiction are supplied, and no positive Union nexus exists, legal classification and implementation readiness are `not_applicable`. The legal finding is anchored to Article 2(1) with operative date 2 August 2026. The qualitative non-regulatory impact block may remain determined.

Supplying only some negative nexus facts is not enough. The existing public non-EU case therefore continues to abstain rather than assuming that every Article 2(1) route is false.

## Article 50 actor scoping

Article 50 findings are actor-specific:

- Article 50(1) and Article 50(2): provider;
- Article 50(3) and Article 50(4): deployer.

A trigger can establish the statutory actor for the legal route even when the profile omits the actor fact. In that situation, legal routing remains actor-specific but implementation readiness stays `undetermined` until a supported actor fact is supplied.

## Compatibility

This migration is breaking for decision-envelope consumers:

- `contract_version` changes from `1.1` to `1.2`;
- `decisionStatusSchema` adds `human_review_required`;
- the strict system-profile schema accepts the new optional Article 5 and Article 50 predicate fields;
- GPAI readiness uses canonical `Article` provision labels and adds Article 52(1) when systemic risk is established;
- legal findings may include the new Article 2, Article 5(1a), Article 5(1b), Article 51(1)(a), and Article 52(1) anchors.

No numeric legal confidence is added. Prohibitions remain fail closed. The existing nine atomic tool names and top-level output shapes remain unchanged. The GPAI threshold behavior is the sole intentional atomic result change.

## Dependent-surface sweep

The migration covers these dependent surfaces:

- Contract sources and runtime mirrors: shared status/version, profile predicates, response envelope, result blocks, and finding validation.
- Runtime assessment: Article 2 scope, Article 5 provider/deployer gates and exclusions, Article 50 actor scoping and editing exclusion, Article 51 and 52 classification, impact separation, readiness duties, warnings, dates, and canonical labels.
- GPAI atomic tool and schema: at-or-above boundary wording and behavior.
- Behavior suite: one regression for each adjudicated product fix, actor-specific Article 50 checks, caller-assertion retention, and exact anchor checks.
- Claim matrix: pinned law-side and served-side checks for Article 2(1), Article 5(1a), Article 5(1b), Article 50(2), Article 51(1)(a) and (2), and Article 52(1) and (2).
- Goldens: all twelve response goldens and canonical hashes regenerated only for legitimate contract, actor-scope, limitation, and GPAI changes.
- Public evaluation: grader 1.2, canonical provision matching, corpus 1.2, contract-version-only case sweep, methodology, and new Day 3 baseline. Day 0 through Day 2 remain unchanged.
- Verification: canonical verifier now reproduces Day 3, while package, schema, compiler, corpus, determinism, and clean-install gates remain in force.
- Generated distribution: compiled JavaScript, declarations, and source maps under `dist/`.

## Golden change ledger

Every response golden was regenerated because `contract_version` is part of the canonical response. The only content changes beyond that version field are identified explicitly below.

| Golden | Legitimate reason for change |
|---|---|
| `tests/golden/annex-i-high-risk.json` | Contract version 1.1 to 1.2 only |
| `tests/golden/contract-high-risk.json` | Contract version 1.1 to 1.2 only |
| `tests/golden/contract-not-applicable.json` | Contract version 1.1 to 1.2 only |
| `tests/golden/contract-sparse.json` | Contract version 1.1 to 1.2 only |
| `tests/golden/free-text-only.json` | Contract version 1.1 to 1.2 only |
| `tests/golden/gpai-systemic.json` | Contract version, express Article 51(1)(a) and Article 52 provenance, Article 52(1) readiness, canonical `Article` labels, and the adjudicated at-or-above threshold summary |
| `tests/golden/high-risk-low-impact-controlled.json` | Contract version 1.1 to 1.2 only |
| `tests/golden/high-risk-plus-transparency.json` | Contract version 1.1 to 1.2 only |
| `tests/golden/minimal-complete.json` | Contract version 1.1 to 1.2 only |
| `tests/golden/prohibited-social-scoring.json` | Contract version 1.1 to 1.2 only |
| `tests/golden/transparency-chatbot.json` | Contract version 1.1 to 1.2 only |
| `tests/golden/transparency-deepfake.json` | Contract version, provider-only Article 50(2) scope, deployer-only Article 50(4) scope, and the unresolved Article 111(4) transition limitation |
| `tests/golden/hashes.json` | Canonical hashes and byte counts regenerated for the twelve response changes listed above |

## Public-eval change ledger

| Surface | Change | Reason |
|---|---|---|
| `evals/public/*/case.json` | `case_version` 1.1 to 1.2 only | Contract-version sweep |
| `evals/public/manifest.json` | Corpus 1.2.0 | New contract corpus identity |
| `evals/grader.mjs` | Grader 1.2, contract 1.2, canonical provision matching | Validate Day 3 without spelling-sensitive anchor failures |
| `evals/METHODOLOGY.md` | Contract 1.2 and Day 3 history | Document the migration |
| `evals/results/day-3-baseline.json` | New baseline | Preserve all prior baselines |

Public profiles and expected legal properties are unchanged.

## Promotion constraints

This branch may be built, tested, and committed. It must not publish, deploy, tag, merge, or rewrite any historical baseline. Promotion requires `npm run verify` from a clean install with every gate green.
