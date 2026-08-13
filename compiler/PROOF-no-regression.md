# Regulation Compiler v0.1 No-Regression Proof

## Proven revision

- Branch: `sprint/b3-compiler`
- Frozen contract base: `sprint/l2-decision-contract` at `1ba8b1821eb1f264e8458533a62cb9046f968050`
- Compiler implementation: `b98ab56c57a9bcc3a7887630885779e85bd3ef92`
- Unchanged `main`: `ab322f04e3ecdde51f8a46b5c5c85bc56986b925`
- Reproducibility input: `SOURCE_DATE_EPOCH=1786622400`
- Derived seal time: `2026-08-13T12:00:00.000Z`

The implementation commit was exported with `git archive` to a fresh directory. `npm ci` installed 102 packages from the root lockfile. All build, compiler, application, claim, schema, resource, and corpus gates below ran in that clean export.

## Scope and contract audit

- The diff from the frozen base contains only the new private `compiler/` package.
- Existing `law/` scripts, legal snapshots, normalized texts, application source, root tests, and root package files are unchanged.
- `@lexbeam/regulation-compiler` is marked `private: true` and declares zero runtime dependencies.
- Build output, generated artifacts, PEM files, and key directories are ignored.
- LawPatch signing reads Ed25519 PEM key paths only from `LAWPATCH_ED25519_PRIVATE_KEY_PATH` and `LAWPATCH_ED25519_PUBLIC_KEY_PATH`.
- Release sealing fails without a non-negative integer `SOURCE_DATE_EPOCH` and derives emitted seal and signature timestamps from it.
- Manifest digests use RFC 8785 canonical JSON. Content file records contain raw-byte SHA-256 and byte count and are sorted by Unicode code point path.
- The exact frozen digested and volatile field lists are emitted and verified. A LawPatch verifier also rejects domain, content, signature, timestamp, contract, ordering, and payload tampering.

## Compiler surfaces exercised

- Regulation-neutral fetch transport with stage, validate, then promote behavior.
- Corpus verification against adapter-pinned hashes, sizes, legal markers, and normalized derivation.
- Deterministic seal with source snapshots, normalized outputs, corpus digest, domain digest, content digest, and manifest.
- Corpus-side and served-side claim runner separation.
- AI Act adapter that re-expresses the current `law/fetch.mjs` normalization and verification rules without modifying that pipeline.
- LawPatch assembly for rule, test, expected-result, migration, and OSCAL packaging inputs.
- Ed25519 signing over the ASCII message `lexbeam-lawpatch-v0.1\n<content_digest>` and fail-closed verification.

## Digest proof

The clean compiler seal produced artifact content digest `93eba0bfe7e07c342f03f90501a418a27c4c427585431086036b00a2d8474aab` and corpus digest `bd86e216a0c5958809275c972fc5ad9f8d9e358975d6dbec28556c1310d701d5`.

| Artifact path | Legacy bytes | Compiler bytes | Legacy SHA-256 | Compiler SHA-256 | Byte equal |
|---|---:|---:|---|---|---|
| `celex-02024R1689-20260727-consolidated.html` | 853357 | 853357 | `7ba274853b4f32d8cf85ac59e1edee2c308821196d59af48f571f318cdedd60a` | `7ba274853b4f32d8cf85ac59e1edee2c308821196d59af48f571f318cdedd60a` | yes |
| `celex-02024R1689-20260727-consolidated.txt` | 398934 | 398934 | `3ff8efe64754d394d6ec7a2cc937bca5948229833872bbc68c11c879af1f6e5e` | `3ff8efe64754d394d6ec7a2cc937bca5948229833872bbc68c11c879af1f6e5e` | yes |
| `celex-32024R1689-original.html` | 1263937 | 1263937 | `7b1622f36bf2bac85bbedf4f95cf8a3ee79e116da7d431c20fabe1d4c9a327c1` | `7b1622f36bf2bac85bbedf4f95cf8a3ee79e116da7d431c20fabe1d4c9a327c1` | yes |
| `celex-32024R1689-original.txt` | 588801 | 588801 | `7901a7159899217f9e701ca9e5ee6746f790b5a8a9dab78493170d3d217366a7` | `7901a7159899217f9e701ca9e5ee6746f790b5a8a9dab78493170d3d217366a7` | yes |
| `celex-32026R1744-omnibus.html` | 352971 | 352971 | `e88469a1b9e4adf575a90b0adfd7a6738e9c5127cae5e8e42194dfb71139bbb6` | `e88469a1b9e4adf575a90b0adfd7a6738e9c5127cae5e8e42194dfb71139bbb6` | yes |
| `celex-32026R1744-omnibus.txt` | 149519 | 149519 | `6c8c9554c40239064d43121982a055323068f8d7a0ac57c6aae30217b927e9c6` | `6c8c9554c40239064d43121982a055323068f8d7a0ac57c6aae30217b927e9c6` | yes |
| `celex-52025PC0836-proposal-SUPERSEDED.html` | 382964 | 382964 | `2e8adcf4fb229758640447b062faafc001fc523a2f07d486a98db618b48ae802` | `2e8adcf4fb229758640447b062faafc001fc523a2f07d486a98db618b48ae802` | yes |
| `celex-52025PC0836-proposal-SUPERSEDED.txt` | 143533 | 143533 | `cb685c1b7bf857b34ada05bb6c4ff326649ade68b0fc13e8cfe1d1e0157feef6` | `cb685c1b7bf857b34ada05bb6c4ff326649ade68b0fc13e8cfe1d1e0157feef6` | yes |

The manifests intentionally use different schemas and are not expected to match each other:

| Manifest | Bytes | SHA-256 |
|---|---:|---|
| Existing `law/manifest.json` | 2366 | `dadeca3a516d9508bb0ea7553d9ddf5ef9ca586902bb3b9f441efa6c6910c399` |
| New `artifact-manifest.json` | 4029 | `f09a7b36ccb616c389d1a11da4b7727a46097044b9927c3993ef0a69b3ef3186` |

## Gate results

| Gate | Clean command | Result |
|---|---|---|
| Dependency install | `npm ci` | pass, 102 packages from lockfile |
| Compiler build and tests | `npm --prefix compiler test` | pass, 6 of 6 |
| Existing TypeScript build | `npm run build` | pass |
| Existing behavior suite | `node test.mjs` | pass, 383 of 383 |
| Corpus and served claim matrix | `node test-claims.mjs` | pass, 66 of 66 |
| Schema and resource validation | `node test-schemas.mjs` | pass, 48 of 48 |
| Existing legal pipeline verification | `node law/fetch.mjs verify` | pass, 4 documents |
| Scope guard | diff from frozen base | pass, only `compiler/` added |
| Runtime dependency guard | `compiler/package.json` | pass, zero dependencies |
| Secret and prose guard | tracked compiler files | pass, no key material and no em dash characters |

## ADR ambiguities and interpretations

1. The frozen artifact and LawPatch schemas fix `regulation_id` to `eu-ai-act`. The compiler exposes a regulation-neutral adapter interface, but v0.1 sealing rejects other regulation IDs until a schema migration explicitly broadens the contract.
2. ADR-001 freezes JSON Pointer field lists but does not define the in-memory projection representation. The implementation selects those top-level keys into an object and RFC 8785 canonicalizes that object, matching the frozen L2 fixture and digest proof.
3. "Normalized AI Act artifacts" is interpreted as the four existing raw HTML snapshots and four derived TXT files. The legacy `law/manifest.json` remains separate because it has a different schema and contains its own wall-clock `sealed_at` value.
4. ADR-001 does not separately define the corpus hash algorithm. The implementation hashes an RFC 8785 canonical object containing the source-path-sorted document IDs, paths, raw hashes, normalized hashes, and byte counts.
