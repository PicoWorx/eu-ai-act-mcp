# ADR-001: EU AI Act 1.5 decision contract

- Status: Accepted and frozen for Sync Point 1
- Date: 2026-08-13
- Contract version: 1.0
- Profile version: 1.0
- Public regulation scope: EU AI Act only
- Branch scope: contract, schemas, generated JSON Schemas, and fixtures only

## Context

Version 1.4.5 exposes nine useful atomic tools, but they do not share one decision envelope, field-level provenance model, or high-level system profile. Version 1.5 adds `euaiact_assess_system` as a bounded entry point while preserving every existing atomic tool.

The contract must support deterministic results, decisive-missing-fact abstention, complete source disclosure, and three separate questions:

1. What is the legal classification?
2. What is the impact on people and protected interests?
3. What is the state of implementation evidence and controls?

These questions are related but not interchangeable. A control cannot change legal classification. A legal classification cannot prove implementation readiness. An impact description is not a compliance score.

The 13 August PRD addendum treats LawPatch as an active commercial frame and asks SP0 to declare an Article 50 shadow release as a ride-along. No `ride-along = NO` decision is recorded. This ADR therefore includes the LawPatch manifest v0.1 contract as an internal B3 artifact. It adds no public caller-selectable regulation capability.

## Decision

### 1. Public scope and internal regulation seam

The public 1.5 input is AI-Act-specific. It has no `regulation_id` field.

The internal adapter seam is the compile-time constant:

```ts
export const INTERNAL_REGULATION_ID = "eu-ai-act" as const;
```

The fixed value may appear in output corpus and artifact identity records. It is never caller-selectable. A caller-selectable regulation parameter requires a later ADR after B3 and B4 prove a second corpus and the cross-regulation tests pass.

### 2. Normalized system profile

`schemas/profile.ts` defines the input of `euaiact_assess_system`. The profile is strict and accepts sparse input. Only `profile_version: "1.0"` is required.

The optional groups are:

- identity and AI-system definition characteristics;
- intended use and reasonably foreseeable uses;
- actor-role facts;
- geography and affected-person context;
- decision subject and consequence;
- Annex I product and third-party conformity facts;
- Annex III domain, purpose, profiling, and Art. 6(3) facts;
- biometric, emotion-recognition, profiling, and public-space facts;
- synthetic-content and human-interaction facts;
- GPAI model and integration facts;
- public-authority, public-service, and FRIA facts;
- existing controls and evidence references;
- optional free text.

Each structured value is a fact object with a stable `fact_id`, value, origin, verification state, and evidence-reference IDs. This makes the field-level dependency explicit without relying on object position. IDs must be unique across one profile.

Structured facts have origin `explicit_structured_input` or `cited_evidence`. Free text has origin `caller_free_text` and verification `unverified_extraction`. Free text may generate candidate facts, but a candidate stays `derived_unverified` until the caller supplies or verifies it. An unverified candidate cannot satisfy a decisive legal predicate.

The input accepts references and hashes, not raw confidential documents. Persistent identity, tenant, user, authentication, and storage fields are outside this contract.

### 3. Common response envelope

`schemas/envelope.ts` defines these required common fields:

```json
{
  "contract_version": "1.0",
  "server_version": "1.5.0",
  "corpus": {
    "id": "eu-ai-act-2026-07-27",
    "regulation_id": "eu-ai-act",
    "sha256": "<64 lowercase hex characters>",
    "verified_at": "2026-08-06",
    "current_instrument": "Regulation (EU) 2024/1689 as amended",
    "source_snapshot_ids": ["source.oj.2024.1689.consolidated.20260727"]
  },
  "status": "determined",
  "facts_used": [],
  "assumptions": [],
  "missing_facts": [],
  "findings": [],
  "warnings": [],
  "recommended_next_calls": []
}
```

The corpus identity and hash are mandatory. The response cannot rely on a floating legal corpus.

`status` is one of `determined`, `undetermined`, or `not_applicable`. If a missing fact is marked `decisive`, every affected block must be `undetermined`. If legal classification is affected, the top-level status must also be `undetermined`. Other blocks may remain determined only when their result does not depend on that fact.

`facts_used` contains the normalized fact value and its origin. Every fact ID referenced by a finding must resolve to exactly one `facts_used` item. Every `assumption_id` and `missing_fact_id` referenced by a finding must resolve in the matching envelope array.

Assumptions are disclosed and never silently promoted into supplied facts. `caller_confirmed` records that the caller explicitly accepted an assumption for this run. It does not make the source independently verified.

Warnings use stable codes. A result based only on a curated summary must carry `SUMMARY_ONLY`. A non-binding source must carry `NON_BINDING_SOURCE`. The response always warns that it is not legal advice through `OUTPUT_NOT_LEGAL_ADVICE`.

Recommended next calls are limited to the existing nine atomic tools. The high-level tool must not recommend itself recursively.

### 4. Finding and provenance contract

`schemas/finding.ts` requires every material finding to contain:

- stable `finding_id`;
- owning result block;
- determination and summary;
- actor, jurisdiction, and system scope;
- supplied `fact_ids`;
- `assumption_ids` and `missing_fact_ids`;
- one or more exact legal provenance records.

Every provenance record requires:

- fixed instrument ID `regulation-eu-2024-1689`;
- exact provision, such as `Article 6(2) and Annex III, point 4(a)`;
- source ID;
- official URL;
- operative date in `YYYY-MM-DD` form or the literal `not_date_bound`;
- source status;
- verification level.

`not_date_bound` means that the finding itself is not an operative-date or deadline conclusion, for example an actor definition. It must not stand in for an unknown date. An unknown decisive date produces a missing fact and abstention.

Verification levels are `complete_official_text`, `official_metadata_only`, `curated_summary_only`, and `unverified`. A decisive positive or negative legal conclusion requires `complete_official_text`. Weaker levels may support routing or a bounded summary only, with the matching warning.

An `undetermined` finding must include `reason_for_abstention`. A resolved finding cannot include that field. There is no numerical confidence field in this contract.

### 5. Three separate result blocks

`euaiact_assess_system` returns the common envelope plus three required top-level blocks. Each block has its own schema and `status`.

#### Legal classification

`schemas/result-blocks.ts#legalClassificationBlockSchema` contains legal routes, Annex III categories, actor roles, finding IDs, and limitations. Routes are `prohibited`, `high_risk`, `transparency_duty`, `gpai`, or `minimal`.

More than one route may apply. For example, a high-risk system may also have an Article 50 transparency duty. `minimal` is permitted only after the decisive exclusion and applicability facts are present. It is not a default for sparse input.

#### Impact

`schemas/result-blocks.ts#impactBlockSchema` contains inherent impact, affected groups, current controls, residual impact, finding IDs, and limitations. It has no aggregate or numeric impact score. The required literal `does_not_alter_legal_classification: true` makes the boundary machine-readable.

#### Implementation readiness

`schemas/result-blocks.ts#implementationReadinessBlockSchema` contains applicable duties, evidence states, control gaps, owners, operative dates, finding IDs, and limitations. Readiness states describe evidence completeness, not legal compliance. The required literal `is_regulatory_approval: false` prevents the block from being represented as approval, certification, or legal advice.

### 6. Deterministic ordering and canonical JSON

Schemas constrain shapes but cannot fully enforce array order. The following order is normative:

| Array | Order |
|---|---|
| profile facts within repeated fields | `fact_id` ascending |
| evidence references | `evidence_id` ascending |
| controls | `control_id` ascending |
| corpus source snapshots | source ID ascending |
| `facts_used` | `fact_id` ascending |
| assumptions | `assumption_id` ascending |
| missing facts | `profile_path`, then `missing_fact_id` ascending |
| findings | block order: legal classification, impact, implementation readiness; then `finding_id` ascending |
| provenance within a finding | `source_id`, then `exact_provision`, then `operative_date` ascending |
| warnings | `code`, then `warning_id` ascending |
| recommended calls | existing tool order below |
| legal routes | `prohibited`, `high_risk`, `transparency_duty`, `gpai`, `minimal` |
| all arrays containing only IDs | Unicode code point ascending |

The existing atomic tool order is:

1. `euaiact_annex_iv_checklist`
2. `euaiact_answer_question`
3. `euaiact_assess_art6_3_exception`
4. `euaiact_calculate_penalty`
5. `euaiact_check_deadlines`
6. `euaiact_check_gpai_systemic_risk`
7. `euaiact_classify_system`
8. `euaiact_get_article`
9. `euaiact_get_obligations`

Canonical hashes use RFC 8785 JSON Canonicalization Scheme and SHA-256 over UTF-8 bytes. Inputs to canonicalization must contain valid JSON only: no `undefined`, non-finite numbers, duplicate keys, or implementation-specific objects.

Response `runtime_metadata` is optional and volatile. Its complete allowed field set is:

- `/runtime_metadata/generated_at`;
- `/runtime_metadata/correlation_id`;
- `/runtime_metadata/duration_ms`.

These three paths are removed before deterministic response hashing. No other response field is volatile. Omitting `runtime_metadata` is preferred for local deterministic tests.

### 7. Compatibility with the existing nine tools

Version 1.5 is additive.

1. Existing tool names and input schemas do not change.
2. Existing top-level output field names, types, meanings, and values do not change for the same input and corpus.
3. Atomic outputs add the common envelope fields at the top level. They do not move the legacy result under `data` or another wrapper.
4. Each implementation schema merges the existing output schema with `decisionEnvelopeSchema`. The frozen files in this branch do not modify the existing nine schemas.
5. `euaiact_assess_system` is new and returns `assessSystemResponseSchema` exactly.
6. Legacy clients that select documented fields continue to work. Strict clients that reject additive properties must stay on 1.4.5 or update their schema, as documented in the 1.5 migration note.
7. The existing string-enum `confidence` fields in `euaiact_classify_system` and `euaiact_answer_question` remain only to avoid a 1.5 breaking change. They are not copied into the new envelope or high-level result. No numeric confidence field is permitted anywhere.

Any later contract change needs a written migration ADR and a full dependent-lane rerun, as required by Sync Point 1.

### 8. B3 artifact-manifest reproducibility contract

`schemas/artifact-manifest.ts` defines artifact manifest v0.1. The content digest is computed in five steps:

1. Hash the raw bytes of every file named in `content_files` with SHA-256.
2. Verify each file record, then sort records by `path` using Unicode code point order.
3. Build a JSON object containing exactly the following manifest paths:
   - `/manifest_version`
   - `/artifact`
   - `/compiler`
   - `/source_date_epoch`
   - `/corpus`
   - `/domain_payload`
   - `/content_files`
   - `/digest_contract`
4. Canonicalize that object under RFC 8785.
5. Hash the canonical UTF-8 bytes with SHA-256 and store the result in `content_digest.value`.

`content_files` is the complete allowlist. The following file roles enter the digest when present:

- source snapshots and normalized source;
- citation registries;
- rules;
- tests and expected results;
- schemas;
- claim matrices;
- generated surfaces;
- OSCAL exports;
- migration notes.

Unlisted files do not enter the digest and cannot be represented as part of the artifact. File paths, roles, media types, byte lengths, and file digests all enter through the canonical `content_files` records.

`domain_payload.fields` records the exact artifact-specific field projection and enters the B3 digest itself. `domain_payload.sha256` binds the projected payload. For a LawPatch, the schema fixes the projection to exactly these domain fields:

- `/lawpatch_manifest_version`
- `/package`
- `/jurisdiction`
- `/effective_date`
- `/transitions`
- `/sources`
- `/citations`
- `/obligation_deltas`
- `/rules`
- `/tests`
- `/affected_selectors`
- `/migration`
- `/human_review`
- `/oscal_component_definition_mapping`

The only B3 volatile paths are:

- `/volatile/generated_at`
- `/volatile/sealed_at`
- `/volatile/build_id`
- `/volatile/build_host`
- `/volatile/build_path`
- `/volatile/ci_job_url`
- `/volatile/correlation_id`
- `/volatile/duration_ms`
- `/signature`

These paths do not enter `content_digest`. `content_digest` itself is also outside its own input to avoid recursion.

`SOURCE_DATE_EPOCH` is mandatory for a release artifact and is stored as `source_date_epoch`, an integer number of seconds since 1970-01-01T00:00:00Z. If `generated_at`, `sealed_at`, or `signature.signed_at` is emitted, it must be the ISO 8601 rendering of that epoch. Generated file bytes must not contain wall-clock time, build host, absolute build path, random ID, or unsorted map output. A build without `SOURCE_DATE_EPOCH` may be used for local diagnosis but cannot produce a release manifest.

Two clean builds with identical source files, compiler identity, domain payload, and `SOURCE_DATE_EPOCH` must produce byte-identical content files, identical file records, and the same content digest.

### 9. LawPatch manifest v0.1 ride-along

`schemas/lawpatch-manifest.ts` extends the B3 artifact manifest. It describes a signed semantic-versioned legal dependency package and requires:

- package identity, version, component, and dependencies;
- EU jurisdiction and territorial scope;
- effective date and transition rules;
- authoritative source snapshots and citations;
- obligation deltas;
- deterministic rule and test references with expected results;
- affected capability, workflow, policy, control, tool, or surface selectors;
- migration and rollback notes;
- human-review flags and promotion decision;
- OSCAL 1.1.2 component-definition export mappings;
- an Ed25519 signature block.

The signature is calculated over the ASCII message:

```text
lexbeam-lawpatch-v0.1\n<content_digest.value>
```

The signature proves artifact integrity and signer identity. It does not prove legal correctness, regulatory approval, or certification. `signed_digest` must equal `content_digest.value`. The signature block is excluded from the content digest and can therefore be replaced without changing the signed content identity.

The OSCAL mapping is an export mapping, not a claim that OSCAL defines legal meaning. Obligation deltas remain the source of legal semantics. The mapping specifies how package fields and obligation deltas become a component-definition and implemented requirements.

LawPatch remains an internal ride-along artifact. It does not add another public MCP tool, caller-selected regulation, registry, dashboard, or runtime behavior in this branch.

## Consequences

- Sparse inputs fail closed instead of becoming minimal-risk conclusions.
- Every material conclusion can be reconstructed from facts and legal sources.
- Classification, impact, and readiness can evolve independently without collapsing into a score.
- Existing clients retain their nine tool contracts.
- Deterministic response and artifact comparisons have explicit canonical projections.
- A second regulation requires evidence and a new decision, not a hidden parameter.
- Runtime implementation, legal rule authoring, and public release remain separate work.

## Schema and fixture map

| Contract | Zod | Generated JSON Schema |
|---|---|---|
| normalized profile | `schemas/profile.ts` | `schemas/json/system-profile.schema.json` |
| finding | `schemas/finding.ts` | `schemas/json/finding.schema.json` |
| common envelope | `schemas/envelope.ts` | `schemas/json/decision-envelope.schema.json` |
| complete high-level response | `schemas/envelope.ts` | `schemas/json/assess-system-response.schema.json` |
| legal classification block | `schemas/result-blocks.ts` | `schemas/json/legal-classification.schema.json` |
| impact block | `schemas/result-blocks.ts` | `schemas/json/impact.schema.json` |
| implementation readiness block | `schemas/result-blocks.ts` | `schemas/json/implementation-readiness.schema.json` |
| B3 artifact manifest | `schemas/artifact-manifest.ts` | `schemas/json/artifact-manifest.schema.json` |
| LawPatch v0.1 | `schemas/lawpatch-manifest.ts` | `schemas/json/lawpatch-manifest.schema.json` |

Compatibility and safety fixtures live under `tests/fixtures/decision-contract/`.

## PRD A1 to A6 self-check

| Criterion | How this contract enables the metric | Remaining proof outside this branch |
|---|---|---|
| A1 Deterministic | Fixes stable IDs, array order, one RFC 8785 projection, exact volatile response fields, exact B3 digest fields, file ordering, and `SOURCE_DATE_EPOCH`. | Run 100 profiles x 100 runs on Node 20 and 22 from the packed artifact and compare canonical hashes. |
| A2 Grounded | Makes finding ID, fact IDs, exact provision, official URL, operative date or `not_date_bound`, source status, and verification level required for every finding. | Run schema and claim-coverage gates and prove zero missing provenance fields. |
| A3 Honest limits | Uses determination and verification enums, requires an abstention reason, makes decisive missing facts fail affected blocks closed, requires summary and non-binding-source warnings, and introduces no numeric confidence. | Run decisive-missing-fact, negative-conclusion, summary-disclosure, mutation, and serialized-field scans. |
| A4 One call, bounded | Defines one sparse normalized profile and one response with three independently typed blocks. The impact block carries a literal boundary against changing classification. | Prove one call per golden profile, response at or below 64 KiB, local p95 at or below 250 ms, and the control-field metamorphic test. |
| A5 Fast, free, minimal | Excludes authentication, tenant state, payload persistence, raw document ingestion, and long-running workflow fields. Inputs use bounded facts and evidence references. | Prove hosted latency and concurrency, no auth, zero payload persistence, and documented log retention. |
| A6 Coverage staged | Keeps `regulation_id` fixed to `eu-ai-act`, requires corpus identity and hash, and prevents caller-selected regulation expansion. Artifact identity can support later adapters without changing the 1.5 public input. | Prove the one manifest-listed AI Act corpus now. Add a second regulation only with the Data Act gates and cross-regulation suite. |
