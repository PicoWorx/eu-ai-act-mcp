# Changelog

All notable changes to `@lexbeam-software/eu-ai-act-mcp` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.4.3] - 2026-07-29

### Fixed

- **The Annex III high-risk date was described as a backstop that could bite earlier. It cannot.** `euaiact_check_deadlines` told callers that 2 December 2027 was "the backstop date" and that "the obligations can bite earlier, six months after a Commission decision that the supporting standards and support measures are available". That mechanism is Commission proposal COM(2025) 836 text. It was **deleted before adoption** and does not appear in the enacted act. Art. 113, third paragraph, point (c), as replaced by item 40 of Article 1 of Regulation (EU) 2026/1744, reads in full:

  > Chapter III, Sections 1, 2, and 3, with the exception of Article 6(5), shall apply from: (i) 2 December 2027 as regards AI systems classified as high-risk pursuant to Article 6(2) and Annex III; and (ii) 2 August 2028 as regards AI systems classified as high-risk pursuant to Article 6(1) and Annex I;

  No condition, no decision, no earlier trigger. Recital 40 keeps the delayed availability of standards as the *reason* for the deferral and asks the Commission to have support measures in place in due time, but that is an undertaking addressed to the Commission and cannot move either date. The wrong description shipped in 1.4.0, 1.4.1 and 1.4.2. Corrected in the Annex III milestone description, the Art. 113 delta, the enacted `key_changes` list, the structured high-risk timeline and the README.

  Practical effect for anyone who planned against it: the error made the deadline look **less** certain and potentially earlier than it is. It would have driven over-preparation, not a missed deadline.

### Changed

- **`high_risk_timeline` fields renamed** in the opt-in `pending_omnibus` payload, so the field names cannot re-teach the deleted mechanism:
  - `mechanism` → `superseded_proposal_mechanism` (and `mechanism_source_status` → `superseded_proposal_mechanism_source_status`)
  - `backstop` → `application_dates` (and `backstop_source_status` → `application_dates_source_status`)

  The superseded proposal text is kept, prefixed `SUPERSEDED, NOT LAW`, so an analysis written from the proposal can be identified as out of date rather than silently contradicted. `application_dates_source_status` is now derived from the enactment record instead of the hardcoded `political_agreement`, so it reads `enacted_oj`.
- `smithery.yaml` had drifted to 1.4.1 while `package.json` was at 1.4.2. Both are now 1.4.3. `RELEASING.md` step 1 covers this; it was missed in the 1.4.2 release.

### Added

- **Nine tests**, 303 to 312. Four assert the corrected timeline content (the mechanism is labelled superseded, the note calls the dates unconditional and quotes the enacted point (c), the Art. 113 delta records the deletion). Three are payload-level guards on the **default** response: no milestone calls a high-risk date a backstop, no text offers an earlier support-measures trigger, and the Annex III milestone states the date is fixed. Two guard the enacted `key_changes` list against a live "or 6/12 months after" alternative. Prose was what was wrong here, and prose is what `RELEASING.md` warns the suite cannot catch, so these assert on the served strings.

### Source

Verified against the plain text of CELEX 32026R1744 held at `projects/lawvable/_omnibus-flip-review-2026-07-26/sources/32026R1744.txt`, item 40 of Article 1 and recital 40. Two independent published analyses of the final text reached the same conclusion (Modulos, "EU AI Act Omnibus now law"; Freshfields, "EU AI Act unpacked #34").

## [1.4.2] - 2026-07-27

### Fixed

- **Two deltas in the Digital Omnibus pack still carried the Commission proposal's version and were wrong as enacted law.** Both shipped in 1.4.1.
  - **Art. 4 (AI literacy)** was described as "recast into a duty on the Commission and Member States to foster AI literacy". That is the proposal. The enacted Art. 4(1) keeps the provider and deployer duty, recast as taking measures to **support the development** of AI literacy, and states expressly that it "does not require providers or deployers to guarantee any specific level of AI literacy of any individual". The Commission and Member State duty was **added** as a new Art. 4(2), it did not replace anything.
  - **Art. 49 / Art. 6(3)** was described as deleting the EU-database registration duty for Annex III systems self-assessed as not high-risk, and was carried as the one item unresolved against the OJ text. The enacted act does **not amend Art. 49 at all**. It deletes only Annex VIII Section B points 7 and 9, which simplifies what that registration must contain. The duty stands. Telling a provider registration was no longer required would have been a live compliance error.
- **The superseded Art. 4 wording was live in six places**: `articles.ts`, `obligations.ts`, `deadlines.ts`, `classify.ts` (the low-confidence caveat), `server.ts` (the risk-levels resource) and two FAQ answers all still said providers and deployers "must ensure ... a sufficient level of AI literacy".
- **The Art. 5 delta still warned against emitting the nudification and CSAM prohibitions as current law.** They have been enacted since 27 July 2026 and apply from 2 December 2026. The caution was tagged `political_agreement` and survived the 1.4.0 flip.
- **README served the pre-Omnibus dates as "verified"**, listing high-risk Annex III at 2 Aug 2026 and Annex I at 2 Aug 2027 two paragraphs below the note saying those dates were deferred. Replaced with the full operative timeline, including the 2 Dec 2026 and 2 Aug 2028 dates. The stale 108-test count was also corrected.

### Changed

- **Every delta reconciled article by article against the enacted OJ text**, not against the proposal or a tracker. The list is rewritten and expanded from 13 to 20 entries, each citing its item number in Article 1 of Regulation (EU) 2026/1744 so a reader can find it in the OJ. No delta is tagged `commission_proposal` or `political_agreement` any more.
- New deltas covering Art. 2(13), Art. 11(1)/17(2)/63(1), Art. 25(2) and (4), Art. 28 to 30, Art. 43(3), Art. 50(7)/56(6), Art. 57/60/60a, Art. 72(3), Art. 95(4)/96(1)/99, Art. 111(2) and Art. 113 third paragraph.
- The Art. 27 delta records that **Art. 27(3) was not amended**: FRIA notification is owed on the results of every completed assessment, not only where a specific risk is found.
- The Art. 56(6) delta records that recital 41 cites "Art. 53(4) and Art. 54(2)" for code reliance, while Art. 54(2) governs the authorised representative's mandate. The operative pair is Art. 53(4) and Art. 55(2).
- `OmnibusEnactment` gains `actDate` ("2026-07-08", from the face of the act). The enacted description now quotes that date, and keeps the EP and Council dates as provenance with their source named, since those come from the Council press release rather than the OJ text.

### Added

- 14 regression tests: the Art. 4, Art. 49 and Art. 5 corrections each guarded by name, plus two structural guards that fail if any delta is still sourced to the proposal or is missing its amending item number once the pack reads as enacted, plus three guards on the Art. 4 wording in `articles.ts` and `obligations.ts`. 289 -> 303 tests.

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
