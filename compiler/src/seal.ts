import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { compareUnicodeCodePoints } from "./canonical-json.js";
import {
  COMPILER_NAME,
  COMPILER_VERSION,
  computeArtifactContentDigest,
  computeDomainPayloadDigest,
  contentFileRecord,
  frozenDigestContract,
  sortContentFiles,
} from "./contract.js";
import {
  isoFromSourceDateEpoch,
  resolveSourceDateEpoch,
  sha256Bytes,
  sha256Canonical,
} from "./hash.js";
import { resolveWithin } from "./paths.js";
import type {
  ArtifactManifest,
  JsonValue,
  RegulationAdapter,
  SealedCorpus,
} from "./types.js";

export interface SealOptions {
  adapter: RegulationAdapter;
  source_directory: string;
  output_directory: string;
  source_commit: string;
  source_date_epoch?: number;
}

function requireFrozenRegulationId(regulationId: string): asserts regulationId is "eu-ai-act" {
  if (regulationId !== "eu-ai-act") {
    throw new Error(
      `Frozen artifact manifest v0.1 permits regulation_id=eu-ai-act only, received ${regulationId}`,
    );
  }
}

export async function sealRegulation(options: SealOptions): Promise<SealedCorpus> {
  const { adapter } = options;
  if (resolve(options.source_directory) === resolve(options.output_directory)) {
    throw new Error("Seal output_directory must differ from source_directory");
  }
  requireFrozenRegulationId(adapter.regulation_id);
  if (!/^[a-f0-9]{40}$/.test(options.source_commit)) {
    throw new Error("source_commit must be a full 40-character lowercase Git SHA");
  }
  const sourceDateEpoch = resolveSourceDateEpoch(options.source_date_epoch);
  const contentFiles = [];
  const corpusDocuments: JsonValue[] = [];

  const documents = [...adapter.documents].sort((left, right) =>
    compareUnicodeCodePoints(left.source_path, right.source_path),
  );
  const declaredPaths = new Set<string>();
  for (const document of documents) {
    for (const path of [document.source_path, document.normalized_path]) {
      resolveWithin(options.output_directory, path);
      if (declaredPaths.has(path)) {
        throw new Error(`Duplicate adapter output path: ${path}`);
      }
      declaredPaths.add(path);
    }
  }
  for (const document of documents) {
    const source = await readFile(resolveWithin(options.source_directory, document.source_path));
    const sourceIssues = adapter.verifySource(document, source);
    if (sourceIssues.length > 0) {
      throw new Error(sourceIssues.join("\n"));
    }
    const normalized = adapter.normalize(document, source);
    if (
      source.length !== document.expected_source_bytes ||
      sha256Bytes(source) !== document.expected_source_sha256
    ) {
      throw new Error(`${document.id}: source bytes do not match the pinned adapter manifest`);
    }
    if (
      normalized.length !== document.expected_normalized_bytes ||
      sha256Bytes(normalized) !== document.expected_normalized_sha256
    ) {
      throw new Error(`${document.id}: normalized bytes do not match the pinned adapter manifest`);
    }

    const sourceOutput = resolveWithin(options.output_directory, document.source_path);
    const normalizedOutput = resolveWithin(options.output_directory, document.normalized_path);
    await mkdir(dirname(sourceOutput), { recursive: true });
    await mkdir(dirname(normalizedOutput), { recursive: true });
    await writeFile(sourceOutput, source);
    await writeFile(normalizedOutput, normalized);

    const sourceRecord = contentFileRecord(
      document.source_path,
      "source_snapshot",
      document.source_media_type,
      source,
    );
    const normalizedRecord = contentFileRecord(
      document.normalized_path,
      "normalized_source",
      document.normalized_media_type,
      normalized,
    );
    contentFiles.push(sourceRecord, normalizedRecord);
    corpusDocuments.push({
      document_id: document.id,
      source_path: sourceRecord.path,
      source_sha256: sourceRecord.sha256,
      source_bytes: sourceRecord.bytes,
      normalized_path: normalizedRecord.path,
      normalized_sha256: normalizedRecord.sha256,
      normalized_bytes: normalizedRecord.bytes,
    });
  }

  const domain = adapter.domainPayload();
  const sortedContentFiles = sortContentFiles(contentFiles);
  const digestContract = frozenDigestContract();
  const draft: Omit<ArtifactManifest, "content_digest"> = {
    manifest_version: "0.1",
    artifact: {
      artifact_id: adapter.artifact_id,
      artifact_version: adapter.artifact_version,
      artifact_kind: "normalized_regulation",
      regulation_id: adapter.regulation_id,
    },
    compiler: {
      name: COMPILER_NAME,
      version: COMPILER_VERSION,
      source_commit: options.source_commit,
    },
    source_date_epoch: sourceDateEpoch,
    corpus: {
      corpus_id: adapter.corpus_id,
      corpus_sha256: sha256Canonical({ documents: corpusDocuments }),
      verified_at: adapter.verified_at,
      current_instrument: adapter.current_instrument,
      source_snapshot_ids: documents
        .map((document) => document.source_snapshot_id)
        .sort(compareUnicodeCodePoints),
    },
    domain_payload: {
      schema_id: domain.schema_id,
      schema_version: domain.schema_version,
      fields: [...domain.fields],
      sha256: computeDomainPayloadDigest(domain.value, domain.fields),
    },
    content_files: sortedContentFiles,
    digest_contract: digestContract,
    volatile: {
      sealed_at: isoFromSourceDateEpoch(sourceDateEpoch),
    },
  };
  const manifest: ArtifactManifest = {
    ...draft,
    content_digest: {
      algorithm: "sha256",
      value: computeArtifactContentDigest(draft),
    },
  };

  await mkdir(options.output_directory, { recursive: true });
  const manifestPath = join(options.output_directory, "artifact-manifest.json");
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return {
    output_directory: options.output_directory,
    manifest_path: manifestPath,
    manifest,
  };
}
