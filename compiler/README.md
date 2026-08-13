# Regulation Compiler v0.1

Private package: `@lexbeam/regulation-compiler`.

The compiler separates regulation-specific adapters from deterministic fetch, verify, seal, claim-runner, artifact-manifest, and LawPatch packaging APIs. Version 0.1 ships only the EU AI Act adapter because the frozen manifest contract fixes `regulation_id` to `eu-ai-act`.

## Commands

From the repository root:

```bash
npm --prefix compiler run build
npm --prefix compiler test
```

## API

- `fetchRegulationSources`: fetches every adapter source into a staging directory, validates all source bodies, then promotes the files.
- `verifyCorpus`: checks pinned source and normalized hashes, sizes, adapter markers, and byte-exact derivation.
- `sealRegulation`: writes source snapshots and normalized files, computes the corpus and RFC 8785 artifact digests, and writes `artifact-manifest.json`.
- `runClaims`: regulation-neutral corpus and served-side claim-runner interface.
- `assembleLawPatchManifest`: combines a sealed corpus with rule, test, expected-result, migration, and OSCAL inputs under the frozen LawPatch v0.1 schema.
- `signLawPatchDigest` and `verifyLawPatchManifestSignature`: Ed25519 helpers using Node crypto.

Release seals require `SOURCE_DATE_EPOCH`. The API accepts the same value explicitly for tests. Volatile fields are excluded only through the exact paths frozen in ADR-001.

LawPatch signing reads PEM key paths from environment variables:

```text
LAWPATCH_ED25519_PRIVATE_KEY_PATH
LAWPATCH_ED25519_PUBLIC_KEY_PATH
```

Keys and key material never belong in this repository. The compiler folder ignores `*.pem` and `keys/` as an additional guard.
