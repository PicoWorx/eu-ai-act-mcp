# Changelog

All notable changes to `@lexbeam-software/eu-ai-act-mcp` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.4.1] - 2026-07-27

### Fixed

- **Art. 5(1)(ba) prohibition missed the plainest phrasing.** A description such as "generates a realistic nude image of a real person" returned `insufficient_information` instead of prohibited, because the keyword list covered "nudification" and "undress" but not "nude image" or "naked photo". Found by querying the deployed server rather than by reading the data.
- Added phrase keywords (`nudify`, `nude image`, `nude photo`, `nude picture`, `naked image`, `naked photo`) rather than the bare words. Single-word keywords match loosely by stem, which is how `deepfake` previously reclassified an ordinary Art. 50 text generator as prohibited, and a bare `nude` would catch a colour-palette tool.

### Added

- Keyword-sensitivity tests for the Art. 5(1)(ba) and (bb) prohibitions: six phrasings that must match and three that must not, including the two known false-positive shapes.


## [1.4.0] - 2026-07-26

### Changed

- **Digital Omnibus on AI enacted.** The `omnibusEnactment` record now carries CELEX `32026R1744`, OJ publication `2026-07-24` and entry into force `2026-07-27`, verified against the enacted OJ text on 2026-07-26. All derived surfaces (operative dates, milestone timeline, status labels, server instructions, resources) resolve to the enacted state.
- **Annex III high-risk obligations deferred to 2 December 2027** and **Annex I to 2 August 2028** (Art. 113(3)(c) as amended). Both are backstop dates; a Commission decision on support measures can bring them forward.
- **Obligation deadlines are derived rather than hardcoded.** `euaiact_get_obligations` now takes its high-risk application dates from the same source as `euaiact_check_deadlines`, split by Annex III and Annex I, so the two tools cannot state different law for the same system. Previously every high-risk obligation carried a fixed `2026-08-02`.
- **Art. 50(2) transition reconciled and reattributed.** The entry now cites the new Art. 111(4) where the rule sits, carries the enacted date 2 December 2026 and is tagged to the enacted OJ text. The proposal's 2 February 2027 does not appear in the adopted act. `OmnibusDelta.sourceStatus` accepts `enacted_oj` so reconciled items can be labelled honestly.
- Summary key-changes, the source registry note, the Art. 113 article summary and three FAQ answers rewritten for the enacted state.

### Added

- **Art. 5(1)(ba) and (bb) prohibited practices** (non-consensual intimate material and child sexual abuse material), with the Art. 5(1a) and (1b) qualifications, applying from 2 December 2026. These are now reachable through classification and prohibited-practice lookups.
- **Milestone for 2 December 2026** covering the new Art. 5 prohibitions and the Art. 111(4) synthetic-content transition.
- **Cross-tool consistency tests** asserting that obligation deadlines match the operative deadline dates, and that limited-risk Art. 50 duties stay on 2 August 2026.
- Reverse-simulation tests proving a pending record still resolves to pre-OJ behaviour after the flip.

### Fixed

- The Annex III milestone description now states that the deferred date is a backstop and that obligations can apply earlier after a Commission decision.

### Known limitations

- The treatment of the Art. 49 registration duty for self-assessed not-high-risk systems is still unresolved against the enacted text and remains labelled as a divergence in the data.


## [1.3.0] - 2026-06-15

Source-state awareness. The server now separates current OJ law from the Digital Omnibus on AI (Commission proposal plus political agreement). Current law stays the default in every answer; pending changes are opt-in and labelled with their source status. Cross-read in-house against COM(2025) 836 (CELEX 52025PC0836) and the official Commission pages on 2026-06-15. See `docs/audit-2026-06-15-verification.md`.

### Added

- **Source-status registry** (`src/knowledge/sources.ts`): a `SourceStatus` type (`enacted_oj`, `commission_proposal`, `political_agreement`, guidance/code variants) and a registry of cross-read sources (OJ 2024/1689, COM(2025) 836, the 2026-05-07 political agreement, the Commission overview page).
- **Structured Digital Omnibus pack** (`src/knowledge/digital-omnibus.ts`): proposal COM(2025) 836 (19 Nov 2025), political agreement (7 May 2026), the high-risk timeline (6/12-month support-measure mechanism, backstop 2 Dec 2027 / 2 Aug 2028), and per-article deltas (Art. 4 literacy, new Art. 4a / Art. 10(5), Art. 49 / Art. 6(3) registration, Art. 50(2) to 2 Feb 2027, Art. 75, Art. 99, Art. 72). Each delta carries its source status.
- **`euaiact_check_deadlines` gains `include_pending_omnibus`** (default false). The milestone timeline always reflects current OJ law; the pending pack is returned only on opt-in, in a separate `pending_omnibus` field, never as enacted law.
- **New resource `euaiact://omnibus`**: the full source-state view plus the source registry, with a not-enacted disclaimer.
- 34 new tests (191 to 225), including full-payload guardrails: the entire default response (not just the milestone list) is free of pending shift dates, the Art. 50(2) transition date, and the nudification/CSAM prohibition when pending is off; opt-in does expose them; the high-risk timeline tags the mechanism (`commission_proposal`) and the backstop dates (`political_agreement`) separately.

### Fixed

- The earlier free-text Digital Omnibus block carried errors, now corrected against the proposal text: proposal date was 2025-12-04 (actual 19 November 2025); the Art. 50(2) transition date was 2 Dec 2026 (actual 2 February 2027); and it asserted the registration duty for Art. 6(3)-exempted systems "REMAINS MANDATED", which contradicts the proposal (which deletes it). The proposal-versus-agreement divergence on registration is now explicitly flagged for OJ-consolidation review.

### Notes

- Nothing in the Omnibus pack is enacted. Re-verify the consolidated OJ text on adoption before flipping any item to `enacted_oj`.
- The high-risk guidance, standards, Article 50 code, and GPAI code sources from the 2026-06-15 research memo are a verified follow-on and are intentionally not yet included.
- Cross-model grade (Codex, producer Claude): an initial build leaked pending shift dates and the nudification prohibition into the default `digital_omnibus` summary and the `euaiact://timeline` resource, the guardrail tests checked only the milestone list (false green), the Commission overview page was mis-tagged `enacted_oj`, the timeline source tag was coarse, and the delta list was non-exhaustive without saying so. All six findings reproduced and fixed before release. See `docs/audit-2026-06-15-verification.md`.

## [1.2.0] - 2026-06-15

Legal-accuracy and release-hygiene release following a cross-model audit (Codex) and an independent primary-source cross-read against OJ CELEX 32024R1689. See `docs/audit-2026-06-15-*.md`.

### Fixed

- **Art. 5(1)(c) social scoring** no longer scoped to public authorities. The final AI Act covers public and private actors (Recital 31). Corrected in `articles.ts`, `annex-iii.ts`, `penalties.ts`, and the classifier output in `classify.ts`.
- **Art. 5(1)(h) real-time RBI** now requires a `biometric_publicly_accessible_space` signal before a prohibited classification; matches "in publicly accessible spaces for the purposes of law enforcement".
- **Citation:** Art. 5(1)(h)(iii) references **Annex II** (was Annex IIa).
- **Art. 50 roles and paragraphs:** provider duties 50(1)/(2), deployer duties 50(3)/(4); machine-readable marking is **50(2)** (FAQ previously cited 50(5), which governs timing/clarity).
- **Penalty tier:** Art. 50 transparency violations map to **Art. 99(4)** (15M/3%, named in 99(4)(g)), not 99(5).
- **Art. 6(3) exception** no longer returns a false green: requires an explicit `no_significant_risk_to_health_safety_fundamental_rights` assessment in addition to one of the four conditions; profiling still blocks the exception.
- **Annex III(5):** creditworthiness carve-out for financial-fraud detection; insurance narrowed to **life and health** (5(c)). Annex III(1) article references corrected to the biometric provisions.
- **GPAI obligations** no longer mis-assigned when `role=deployer`, `risk_level=gpai`.
- **Timeline resource** no longer hardcodes dates; uses the central deadline source, with the Digital Omnibus kept separate as a provisional (political-agreement) track.
- **Release hygiene:** regenerated complete `dist` (previously missing `penalties` artefacts broke `node dist/index.js`); `dist` is now reproducible from source and checked in tests.

### Added

- New signals: `performs_social_scoring`, `biometric_publicly_accessible_space`; Art. 6(3) `no_significant_risk_to_health_safety_fundamental_rights` gate. Legacy signals retained as aliases (backward compatible).
- Adversarial legal tests plus a source-to-`dist` consistency check (110 to 166 tests).

### Changed

- Moved repository to the `lexbeam-software` GitHub organization. Updated `repository` and `bugs` fields in `package.json`. Old `PicoWorx/eu-ai-act-mcp` URLs continue to redirect.
- Added `SECURITY.md`, `CONTRIBUTING.md`, issue templates, pull request template, and a CI workflow that runs the full test suite on every push and pull request.

## [1.1.5] - 2026-05-09

### Fixed

- **Annex III(5) FRIA citation labels.** Corrected sub-point labels for the universal FRIA triggers under Article 27(1): creditworthiness and credit scoring of natural persons is **Annex III(5)(b)**, life and health insurance risk assessment and pricing is **Annex III(5)(c)**. Previous labels in `articles.ts`, `faq-database.ts` (faq-11-fria, faq-22-fria-credit-scoring) and `obligations.ts` had these as 5(a)/5(b) or 5(b)/5(a). Cross-checked against EUR-Lex Regulation (EU) 2024/1689.
- **Article 27 carve-out clarified.** Annex III point 2 (critical infrastructure) is the only Annex III category exempt from the FRIA obligation; this is now stated explicitly in the article summary, the FAQ entry, and the obligations text.
- **Article 43 conformity assessment text.** `obligations.ts` previously suggested "certain critical infrastructure" required notified-body involvement. Corrected: Annex III points 2-8 follow internal-control under Annex VI (Art. 43(2)). Notified-body involvement applies to Annex III point 1 biometrics under Art. 43(1) and to Annex I sectoral legislation under Art. 43(3).
- **Version skew.** `src/server.ts` and `src/http.ts` `/health` previously hardcoded `"1.1.4"` while `package.json` was bumped. Now consistent at `1.1.5` across all surfaces.

## [1.1.4] - 2026-05-08

### Changed

- **Digital Omnibus block** in `euaiact_check_deadlines` updated to reflect the 2026-05-07 Council/Parliament provisional political agreement on the AI Act portion of the Digital Omnibus Simplification Package. The agreement is NOT yet adopted law (procedure 2025/0359(COD) still awaiting Parliament's position in 1st reading per EP Legislative Observatory). Current-law dates remain authoritative for compliance advice until formal adoption plus Official Journal publication.
  - `status` flips from `"proposal_only"` to `"provisional_agreement"`.
  - `description` and `keyChanges` rewritten to enumerate the specific provisional shifts (Annex III to 2 Dec 2027, Annex I to 2 Aug 2028, Article 50 watermarking to 2 Dec 2026, prohibited-practices expansion with CSAM and non-consensual intimate content, registration mandate preserved, sensitive-data bias detection broadened) and explicitly mark what is UNCHANGED (GPAI obligations, Commission GPAI enforcement on 2 Aug 2026, legacy GPAI on 2 Aug 2027).
  - `impactOnAIAct` retains the "plan against current law" guidance with refreshed status framing and source citations.
- **FAQ entry `faq-18-digital-omnibus`** rewritten to mirror the same content. References both the December 2025 Commission proposal and the 2026-05-07 provisional agreement.

### Notes

- Schema unchanged. The `digital_omnibus` block keeps the same shape (`name`, `status`, `proposal_date`, `description`, `key_changes`, `impact_on_ai_act`); only string content is updated. Existing clients of `euaiact_check_deadlines` see updated text without breaking changes.
- Sources: Council press release 2026-05-07, European Parliament press release 2026-05-07, EP Legislative Observatory procedure 2025/0359(COD), AI Act Service Desk timeline.
- A future v1.2.0 release will add a structured two-track API (`current_law` and `provisional_omnibus_agreement_2026_05_07` separately, with `legal_status` flag and source URLs per response) and a new `euaiact_omnibus_impact_assessment` tool. The 1.1.4 patch covers hygiene; 1.2.0 ships the product-feature differentiator.

## [1.1.1] - 2026-04-13

### Changed

- Strengthened README disclaimer to reference § 2 RDG explicitly.

## [1.1.0] - 2026-04

### Added

- **Structured classifier signals.** `euaiact_classify_system` now accepts optional `signals` (`domain`, `uses_biometrics`, `biometric_realtime`, `is_safety_component_of_regulated_product`, `generates_synthetic_content`, `interacts_with_natural_persons`, and others). Signals take precedence over text matching and give deterministic, high-confidence answers on canonical Art. 5 / Annex III / Art. 50 cases.
- **Matched signals and follow-up questions.** Every classification now returns `matched_signals`, `missing_signals`, and `next_questions` so the calling agent can explain why and ask the user what is still needed.
- **`euaiact_get_article`** to retrieve operational summaries of the most-cited articles plus stable EUR-Lex URLs for grounded citations.
- **`euaiact_check_gpai_systemic_risk`** to determine whether a GPAI model crosses the Art. 51(2) 10²⁵ FLOPs threshold and return Art. 53 baseline plus Art. 55 systemic-risk obligations with the Art. 52 notification duty.
- **`euaiact_assess_art6_3_exception`** to walk through the Art. 6(3) "no significant risk" exception with explicit handling of the profiling block (Art. 6(3) second subparagraph) and the Art. 6(4) documentation reminder plus Art. 49(2) registration duty.
- **`euaiact_annex_iv_checklist`** to return all nine Annex IV technical-documentation items, optionally as a markdown checklist, with an SME-simplified note.
- **Resources** `euaiact://annex/iii` (full Annex III categories) and `euaiact://annex/iv` (full Annex IV checklist).
- **Prompt** `ground-citation` to guide the agent to call `euaiact_get_article` and quote with an EUR-Lex URL.
- 5 new FAQ entries covering the FLOPs threshold for systemic-risk GPAI, FRIA for credit scoring, chatbot disclosure under Art. 50(1), minimal-risk spellchecker and recommender examples, and an expanded Art. 6(3) exception entry with the profiling caveat.
- `comparative` block in `euaiact_calculate_penalty` showing the SME reduction alongside the non-SME amount.
- `only_upcoming` filter and a `next_milestone` shortcut in `euaiact_check_deadlines`.
- 27 article summaries with EUR-Lex URLs.
- Annex IV (9 documentation items) as a structured resource.

### Fixed

- **Classifier correctness.** Rewrote `src/utils/matching.ts` to eliminate a multi-word-keyword false-positive bug (where a single-character token like `"e"` in `"e-commerce"` could match keywords starting with `"e"`) and a fractional-denominator false-negative (where realistic recruitment descriptions scored below threshold on Annex III(4)). See `AUDIT.md` for root-cause detail.
- **Penalty description.** When `is_sme: true` the `tier_details.description` now correctly says "whichever is lower (Art. 99(6) SME/startup protection)" instead of contradicting the `max_fine.explanation`.
- **FAQ search.** `findBestMatch` uses symmetric overlap (`matched / min(query_words, item_words)`), so specific multi-word queries like "FRIA for credit scoring" no longer drop to generic answers.

### Changed

- **Slim per-response branding.** `disclaimer`, `source`, and `last_updated` were moved into the MCP `serverInfo.instructions` shown once on initialize. Agents no longer pay a per-call context tax for attribution. `lexbeam_url` is kept only where it adds deep-dive value (FAQ, obligations, classifier).
- **Test suite** expanded from 54 to 108 tests, including regression tests for every bug fixed in this release.
