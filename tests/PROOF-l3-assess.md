# L3 Assessment No-Regression Proof

## Proven branch and inputs

- Branch: `sprint/l3-assess`
- Compiler base: `sprint/b3-compiler` at `64c2aa0`
- Frozen decision contract: `sprint/l2-decision-contract` at `1ba8b18`
- Truth corrections cherry-picked before implementation: upstream `0ee01ed`, local `1e3d3c6`
- Server version: `1.5.0`
- Assessment contract version: `1.0`
- Sealed corpus digest: `bd86e216a0c5958809275c972fc5ad9f8d9e358975d6dbec28556c1310d701d5`

The implementation registers `euaiact_assess_system` after the nine existing atomic
tools. It normalizes one frozen sparse profile, delegates legal classification,
Article 6(3), GPAI systemic-risk, and duty selection to the real registered atomic
handlers, and emits three separate result blocks.

## Contract properties pinned by the permanent suite

- Decisive missing facts fail only their affected blocks closed. A legal decisive
  fact also makes the envelope undetermined.
- Legal classification, qualitative impact, and evidence readiness remain separate.
  `does_not_alter_legal_classification` is always true and
  `is_regulatory_approval` is always false.
- Unverified free text cannot satisfy a decisive legal predicate.
- Every finding has complete official-text provenance and references only fact,
  assumption, and missing-fact IDs that resolve in the envelope.
- Curated labels carry `SUMMARY_ONLY`; no summary is represented as statutory text.
- No numeric or high-level confidence field is emitted.
- All normative arrays use the ADR ordering rules. Reordered input ID arrays produce
  the same canonical hash.
- Response hashes use RFC 8785 and SHA-256 after removing only the three frozen
  runtime-metadata paths.
- Every golden response is at most 64 KiB. Ten identical runs produce one hash.
- The nine existing tools are invoked through their actual registered handlers and
  retain byte-identical serialized outputs for the compatibility fixtures.

## Gate results

| Gate | Command | Result |
|---|---|---|
| Root TypeScript build | `npm run build` | pass |
| Behavior and assessment suite | `node test.mjs` | pass, 461 of 461 |
| Corpus and served claim matrix | `node test-claims.mjs` | pass, 92 of 92 |
| Schema and resource validation | `node test-schemas.mjs` | pass, 48 of 48 |
| Existing legal pipeline | `node law/fetch.mjs verify` | pass, 4 of 4 documents |
| Deterministic compiler | `npm --prefix compiler test` | pass, 6 of 6 |
| Golden determinism | built into `test.mjs` | pass, one hash across 10 runs |
| Existing atomic compatibility | built into `test.mjs` | pass, 9 of 9 exact byte hashes |

These commands are rerun after export from the implementation commit into a fresh
directory with `npm ci` before handoff.

## Golden matrix

All byte counts are canonical RFC 8785 UTF-8 bytes after the frozen volatile paths
are removed.

| Case | SHA-256 | Bytes |
|---|---|---:|
| `contract-high-risk` | `7a7ec46ff52ddba4073544967992f7828c70f24c40269ca73b1f5a4afe8c007c` | 34866 |
| `contract-not-applicable` | `ea2a1ec24b155c04605e7842f96557ce99073972b3a0be275e627aecd16587a1` | 3060 |
| `contract-sparse` | `c43d7ffa1cec9039b447db4fff2981b54e66beeb058be878924da4541b2230fe` | 4454 |
| `prohibited-social-scoring` | `bf71ea96e690f1f3bb98e94ef2cf62165ca3799ce298e451ce4aa41ef3bb6c59` | 9088 |
| `minimal-complete` | `f00946cefde96340970438099db6431558a7c4e1064f1892d3838bb86286ab59` | 11366 |
| `transparency-chatbot` | `9eb7bf6c82077f8fba9ba5e673ee5133d80bd60796054dc4e4c96bb313176309` | 12707 |
| `transparency-deepfake` | `8a6a8c055cb0dba1852cfc5ddb365de2903d1c79186bf8a8a59c9ef03298b04e` | 20262 |
| `annex-i-high-risk` | `f35cefde34217c02ae16b0ab908463fec4c07623df92e242e949ab7d40a29fcb` | 33059 |
| `gpai-systemic` | `dbea8041285115db85808c263cd99e274b1c245acd924bbd289401babff14156` | 23653 |
| `high-risk-plus-transparency` | `e5fdb15e07e02090aa139818f398945e2c1f2690066542362b6863e6dbb7f6fe` | 41361 |
| `high-risk-low-impact-controlled` | `5f4c52600b25065005a4fc4aa1ed1381dc83c4904636f9ec2e9ec09f3a88d4ee` | 35220 |
| `free-text-only` | `498761a1f0907accfc1fd4eb8b1213ad185c00e9d5b02a841c6b5068b02476d2` | 4918 |

## Awkward contract points and chosen interpretations

1. The frozen twelve-fixture index mixes profiles, responses, and manifests, so it
   is not a set of twelve runnable assessment inputs. The implementation preserves
   those files and adds twelve runnable profiles plus twelve complete outputs.
2. The frozen profile has no `no_significant_risk_to_health_safety_fundamental_rights`
   or documented-assessment predicate. An Annex III result therefore retains its
   high-risk route and discloses the limitation while recommending the atomic
   Article 6(3) tool. It does not invent the absent predicate.
3. The legacy law manifest hash and the B3 corpus digest use different contracts.
   The assessment binds to the B3 sealed corpus digest because the objective requires
   the compiler ground truth, while the legacy verification gate remains unchanged.
4. The root build compiles only `src/`, so it cannot import the frozen top-level
   TypeScript schemas without widening the shipped package. Runtime schema files are
   byte-identical mirrors, and the permanent suite compares every byte to prevent
   drift.
5. ADR-001 describes additive envelopes on atomic outputs, while the implementation
   objective explicitly requires the existing nine tools to remain byte-identical.
   The explicit compatibility requirement wins: the new envelope is emitted only by
   tool 10, and all nine atomic outputs remain unchanged.
6. Server registration retains the historical nine-tool order and appends the new
   tool at position 10. Recommended follow-up calls use the separate normative atomic
   ordering frozen in ADR-001.
7. Omitted jurisdiction is `unspecified`, never silently defaulted to EU. It becomes
   a decisive missing territorial-scope fact except when an earlier supplied
   definition fact already makes the assessment not applicable.
8. A prohibited route does not erase simultaneous high-risk or transparency routes.
   It also cannot hide a missing actor that makes implementation readiness
   undetermined.
