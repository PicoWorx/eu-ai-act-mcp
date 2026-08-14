import { compareUnicodeCodePoints } from "./canonical-json.js";
import { sha256Bytes, sha256Canonical } from "./hash.js";
import type {
  ArtifactContentFile,
  ArtifactContentFileRole,
  ArtifactManifest,
  JsonValue,
} from "./types.js";

export const COMPILER_NAME = "lexbeam-regulation-compiler" as const;
export const COMPILER_VERSION = "0.1.0" as const;

export const B3_DIGESTED_MANIFEST_FIELDS = [
  "/manifest_version",
  "/artifact",
  "/compiler",
  "/source_date_epoch",
  "/corpus",
  "/domain_payload",
  "/content_files",
  "/digest_contract",
] as const;

export const B3_VOLATILE_FIELDS = [
  "/volatile/generated_at",
  "/volatile/sealed_at",
  "/volatile/build_id",
  "/volatile/build_host",
  "/volatile/build_path",
  "/volatile/ci_job_url",
  "/volatile/correlation_id",
  "/volatile/duration_ms",
  "/signature",
] as const;

export const LAWPATCH_DIGESTED_DOMAIN_FIELDS = [
  "/lawpatch_manifest_version",
  "/package",
  "/jurisdiction",
  "/effective_date",
  "/transitions",
  "/sources",
  "/citations",
  "/obligation_deltas",
  "/rules",
  "/tests",
  "/affected_selectors",
  "/migration",
  "/human_review",
  "/oscal_component_definition_mapping",
] as const;

export function contentFileRecord(
  path: string,
  role: ArtifactContentFileRole,
  mediaType: string,
  bytes: Buffer,
): ArtifactContentFile {
  return {
    path,
    role,
    media_type: mediaType,
    sha256: sha256Bytes(bytes),
    bytes: bytes.length,
  };
}

export function sortContentFiles(
  files: readonly ArtifactContentFile[],
): ArtifactContentFile[] {
  const sorted = [...files].sort((left, right) =>
    compareUnicodeCodePoints(left.path, right.path),
  );
  for (let index = 1; index < sorted.length; index += 1) {
    if (sorted[index - 1]!.path === sorted[index]!.path) {
      throw new Error(`Duplicate content file path: ${sorted[index]!.path}`);
    }
  }
  return sorted;
}

function topLevelKey(pointer: string): string {
  if (!/^\/[A-Za-z0-9_]+$/.test(pointer)) {
    throw new Error(`Frozen v0.1 projection supports top-level JSON pointers only: ${pointer}`);
  }
  return pointer.slice(1);
}

export function projectTopLevelFields(
  value: Record<string, JsonValue>,
  fields: readonly string[],
): Record<string, JsonValue> {
  const projected: Record<string, JsonValue> = {};
  for (const pointer of fields) {
    const key = topLevelKey(pointer);
    if (!(key in value)) {
      throw new Error(`Digest projection field is missing: ${pointer}`);
    }
    projected[key] = value[key]!;
  }
  return projected;
}

export function computeDomainPayloadDigest(
  value: Record<string, JsonValue>,
  fields: readonly string[],
): string {
  return sha256Canonical(projectTopLevelFields(value, fields));
}

export function artifactDigestProjection(
  manifest: Omit<ArtifactManifest, "content_digest"> | ArtifactManifest,
): Record<string, JsonValue> {
  return projectTopLevelFields(
    manifest as unknown as Record<string, JsonValue>,
    B3_DIGESTED_MANIFEST_FIELDS,
  );
}

export function computeArtifactContentDigest(
  manifest: Omit<ArtifactManifest, "content_digest"> | ArtifactManifest,
): string {
  return sha256Canonical(artifactDigestProjection(manifest));
}

export function frozenDigestContract(): ArtifactManifest["digest_contract"] {
  return {
    algorithm: "sha256",
    canonicalization: "RFC8785",
    manifest_fields: [...B3_DIGESTED_MANIFEST_FIELDS],
    volatile_fields: [...B3_VOLATILE_FIELDS],
    file_order: "path_ascending_unicode_code_point",
    file_bytes: "sha256_raw_bytes_then_include_file_record",
  };
}
