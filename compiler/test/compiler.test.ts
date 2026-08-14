import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { artifactManifestSchema } from "../../schemas/artifact-manifest.ts";
import { lawPatchManifestSchema } from "../../schemas/lawpatch-manifest.ts";
import {
  DirectoryFetchTransport,
  assembleLawPatchManifest,
  canonicalize,
  computeArtifactContentDigest,
  fetchRegulationSources,
  isoFromSourceDateEpoch,
  resolveSourceDateEpoch,
  runClaims,
  sealRegulation,
  sha256Bytes,
  verifyCorpus,
  verifyLawPatchManifestSignature,
  type LawPatchAssemblyInput,
  type SealedCorpus,
} from "../src/index.ts";
import { loadEuAiActAdapter } from "../src/adapters/eu-ai-act.ts";

const REPOSITORY_ROOT = fileURLToPath(new URL("../..", import.meta.url));
const LAW_DIRECTORY = join(REPOSITORY_ROOT, "law");
const CONTRACT_COMMIT = "1ba8b1821eb1f264e8458533a62cb9046f968050";
const SOURCE_DATE_EPOCH = 1786622400;

const adapter = loadEuAiActAdapter(LAW_DIRECTORY);

async function withTemporaryDirectory<T>(
  prefix: string,
  operation: (directory: string) => Promise<T>,
): Promise<T> {
  const directory = await mkdtemp(join(tmpdir(), prefix));
  try {
    return await operation(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

async function sealInto(
  directory: string,
  regulationAdapter = adapter,
): Promise<SealedCorpus> {
  return sealRegulation({
    adapter: regulationAdapter,
    source_directory: LAW_DIRECTORY,
    output_directory: directory,
    source_commit: CONTRACT_COMMIT,
    source_date_epoch: SOURCE_DATE_EPOCH,
  });
}

test("RFC 8785 canonicalization is stable and rejects non-I-JSON values", () => {
  assert.equal(
    canonicalize({ z: 1, a: [true, null, "text"], n: -0 }),
    '{"a":[true,null,"text"],"n":0,"z":1}',
  );
  assert.throws(() => canonicalize({ invalid: Number.NaN }), /non-finite/);
  assert.throws(() => canonicalize({ invalid: "\ud800" }), /unpaired high surrogate/);
  assert.equal(
    resolveSourceDateEpoch(undefined, { SOURCE_DATE_EPOCH: String(SOURCE_DATE_EPOCH) }),
    SOURCE_DATE_EPOCH,
  );
  assert.equal(
    isoFromSourceDateEpoch(SOURCE_DATE_EPOCH),
    "2026-08-13T12:00:00.000Z",
  );
  assert.throws(() => resolveSourceDateEpoch(undefined, {}), /SOURCE_DATE_EPOCH/);
  assert.throws(
    () => resolveSourceDateEpoch(undefined, { SOURCE_DATE_EPOCH: "" }),
    /SOURCE_DATE_EPOCH/,
  );
});

test("AI Act adapter verifies the current pipeline without changing it", async () => {
  const report = await verifyCorpus(adapter, LAW_DIRECTORY);
  assert.equal(report.ok, true, JSON.stringify(report.issues, null, 2));
  assert.equal(report.documents_checked, 4);
});

test("fetch API stages and promotes validated adapter sources", async () => {
  await withTemporaryDirectory("regulation-compiler-fetch-", async (directory) => {
    const written = await fetchRegulationSources({
      adapter,
      target_directory: directory,
      transport: new DirectoryFetchTransport(LAW_DIRECTORY),
    });
    assert.equal(written.length, 4);
    for (const document of adapter.documents) {
      assert.deepEqual(
        await readFile(join(directory, document.source_path)),
        await readFile(join(LAW_DIRECTORY, document.source_path)),
      );
    }
  });
});

test("deterministic seal is byte-identical to all current AI Act artifacts", async () => {
  await withTemporaryDirectory("regulation-compiler-seal-", async (directory) => {
    const firstDirectory = join(directory, "first");
    const secondDirectory = join(directory, "second");
    const sealed = await sealInto(firstDirectory);
    const repeated = await sealInto(secondDirectory, {
      ...adapter,
      documents: [...adapter.documents].reverse(),
    });
    artifactManifestSchema.parse(sealed.manifest);
    assert.equal(sealed.manifest.source_date_epoch, SOURCE_DATE_EPOCH);
    assert.equal(sealed.manifest.volatile?.sealed_at, "2026-08-13T12:00:00.000Z");
    assert.equal(
      sealed.manifest.content_digest.value,
      computeArtifactContentDigest(sealed.manifest),
    );
    assert.deepEqual(
      await readFile(sealed.manifest_path),
      await readFile(repeated.manifest_path),
      "repeated seals must produce byte-identical manifests",
    );

    for (const document of adapter.documents) {
      for (const relativePath of [document.source_path, document.normalized_path]) {
        const legacy = await readFile(join(LAW_DIRECTORY, relativePath));
        const compiled = await readFile(join(firstDirectory, relativePath));
        const repeatedBytes = await readFile(join(secondDirectory, relativePath));
        assert.equal(compiled.equals(legacy), true, `${relativePath} differs`);
        assert.equal(repeatedBytes.equals(compiled), true, `${relativePath} is not repeatable`);
        assert.equal(sha256Bytes(compiled), sha256Bytes(legacy));
      }
    }

    const alteredVolatile = structuredClone(sealed.manifest);
    alteredVolatile.volatile = {
      ...alteredVolatile.volatile,
      sealed_at: "2030-01-01T00:00:00.000Z",
      build_id: "different-build",
      duration_ms: 999999,
    };
    assert.equal(
      computeArtifactContentDigest(alteredVolatile),
      sealed.manifest.content_digest.value,
    );

    const invalidAdapter = {
      ...adapter,
      documents: adapter.documents.map((document, index) =>
        index === 0
          ? { ...document, expected_source_sha256: "0".repeat(64) }
          : document,
      ),
    };
    await assert.rejects(
      sealInto(join(directory, "invalid"), invalidAdapter),
      /pinned adapter manifest/,
    );
  });
});

test("claim runner preserves corpus and served-side separation", async () => {
  const run = await runClaims(
    { corpus: "Article 50", served: "Art. 50" },
    [
      {
        id: "article-50",
        side: "served",
        evaluate: ({ served }) => served.includes("Art. 50"),
      },
      {
        id: "article-50",
        side: "corpus",
        evaluate: ({ corpus }) => corpus.includes("Article 50"),
      },
    ],
  );
  assert.equal(run.passed, 2);
  assert.equal(run.failed, 0);
  assert.deepEqual(
    run.results.map((result) => result.side),
    ["corpus", "served"],
  );
});

test("LawPatch assembler emits a schema-valid Ed25519-signed manifest", async () => {
  await withTemporaryDirectory("regulation-compiler-lawpatch-", async (directory) => {
    const sealed = await sealInto(join(directory, "sealed"));
    const fixture = JSON.parse(
      await readFile(
        join(REPOSITORY_ROOT, "tests/fixtures/decision-contract/lawpatch-manifest.json"),
        "utf8",
      ),
    );
    const consolidated = sealed.manifest.content_files.find(
      (file) => file.path === "celex-02024R1689-20260727-consolidated.txt",
    );
    assert.ok(consolidated);

    const { privateKey, publicKey } = generateKeyPairSync("ed25519");
    const privateKeyPath = join(directory, "lawpatch-private.pem");
    const publicKeyPath = join(directory, "lawpatch-public.pem");
    await writeFile(
      privateKeyPath,
      privateKey.export({ type: "pkcs8", format: "pem" }),
    );
    await writeFile(
      publicKeyPath,
      publicKey.export({ type: "spki", format: "pem" }),
    );
    const environment = {
      ...process.env,
      LAWPATCH_ED25519_PRIVATE_KEY_PATH: privateKeyPath,
      LAWPATCH_ED25519_PUBLIC_KEY_PATH: publicKeyPath,
    };

    const input: LawPatchAssemblyInput = {
      artifact_id: fixture.artifact.artifact_id,
      package: fixture.package,
      jurisdiction: fixture.jurisdiction,
      effective_date: fixture.effective_date,
      transitions: fixture.transitions,
      sources: [
        {
          ...fixture.sources[0],
          snapshot_path: consolidated.path,
          content_sha256: consolidated.sha256,
        },
      ],
      citations: fixture.citations,
      obligation_deltas: fixture.obligation_deltas,
      rules: fixture.rules,
      tests: fixture.tests,
      affected_selectors: fixture.affected_selectors,
      migration: fixture.migration,
      human_review: fixture.human_review,
      oscal_component_definition_mapping: fixture.oscal_component_definition_mapping,
      packaging_files: [
        {
          path: fixture.rules[0].rule_path,
          role: "rule",
          media_type: "application/json",
          bytes: Buffer.from('{"rule":"article-50"}\n'),
        },
        {
          path: fixture.tests[0].fixture_path,
          role: "test",
          media_type: "application/json",
          bytes: Buffer.from('{"legacy":true}\n'),
        },
        {
          path: fixture.tests[0].expected_result_path,
          role: "expected_result",
          media_type: "application/json",
          bytes: Buffer.from('{"status":"determined"}\n'),
        },
        {
          path: "oscal/component-definition.json",
          role: "oscal_export",
          media_type: "application/oscal.component-definition+json",
          bytes: Buffer.from('{"component-definition":{}}\n'),
        },
      ],
      public_key_id: "did:key:z6mktest",
    };

    const manifest = assembleLawPatchManifest(sealed, input, environment);
    lawPatchManifestSchema.parse(manifest);
    assert.equal(manifest.signature.signed_digest, manifest.content_digest.value);
    assert.equal(verifyLawPatchManifestSignature(manifest, environment), true);

    const tampered = structuredClone(manifest);
    tampered.package.title = "Tampered title";
    assert.equal(verifyLawPatchManifestSignature(tampered, environment), false);

    const wrongTimestamp = structuredClone(manifest);
    wrongTimestamp.signature.signed_at = "2026-08-13T12:00:01.000Z";
    assert.equal(verifyLawPatchManifestSignature(wrongTimestamp, environment), false);

    const wrongContract = structuredClone(manifest);
    wrongContract.digest_contract.volatile_fields = [
      ...wrongContract.digest_contract.volatile_fields,
    ].reverse() as typeof wrongContract.digest_contract.volatile_fields;
    assert.equal(verifyLawPatchManifestSignature(wrongContract, environment), false);

    const wrongOrder = structuredClone(manifest);
    wrongOrder.content_files = [...wrongOrder.content_files].reverse();
    assert.equal(verifyLawPatchManifestSignature(wrongOrder, environment), false);
  });
});
