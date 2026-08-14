import { z } from "zod";
import {
  INTERNAL_REGULATION_ID,
  isoDateSchema,
  isoDateTimeSchema,
  jsonPointerSchema,
  semverSchema,
  sha256Schema,
  stableIdSchema,
} from "./shared.js";

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

const artifactIdentitySchema = z
  .object({
    artifact_id: stableIdSchema,
    artifact_version: semverSchema,
    artifact_kind: z.enum([
      "normalized_regulation",
      "decision_contract",
      "lawpatch",
      "generated_surface_bundle",
    ]),
    regulation_id: z.literal(INTERNAL_REGULATION_ID),
  })
  .strict();

const compilerIdentitySchema = z
  .object({
    name: z.literal("lexbeam-regulation-compiler"),
    version: semverSchema,
    source_commit: z.string().regex(/^[a-f0-9]{40}$/),
  })
  .strict();

const artifactCorpusSchema = z
  .object({
    corpus_id: stableIdSchema,
    corpus_sha256: sha256Schema,
    verified_at: isoDateSchema,
    current_instrument: z.string().min(1),
    source_snapshot_ids: z.array(stableIdSchema).min(1),
  })
  .strict();

const domainPayloadSchema = z
  .object({
    schema_id: stableIdSchema,
    schema_version: semverSchema,
    fields: z.array(jsonPointerSchema).min(1),
    sha256: sha256Schema,
  })
  .strict();

export const artifactContentFileSchema = z
  .object({
    path: z.string().min(1),
    role: z.enum([
      "source_snapshot",
      "normalized_source",
      "citation_registry",
      "rule",
      "test",
      "expected_result",
      "schema",
      "claim_matrix",
      "generated_surface",
      "oscal_export",
      "migration_note",
    ]),
    media_type: z.string().min(1),
    sha256: sha256Schema,
    bytes: z.number().int().nonnegative(),
  })
  .strict();

const digestContractSchema = z
  .object({
    algorithm: z.literal("sha256"),
    canonicalization: z.literal("RFC8785"),
    manifest_fields: z.tuple([
      z.literal(B3_DIGESTED_MANIFEST_FIELDS[0]),
      z.literal(B3_DIGESTED_MANIFEST_FIELDS[1]),
      z.literal(B3_DIGESTED_MANIFEST_FIELDS[2]),
      z.literal(B3_DIGESTED_MANIFEST_FIELDS[3]),
      z.literal(B3_DIGESTED_MANIFEST_FIELDS[4]),
      z.literal(B3_DIGESTED_MANIFEST_FIELDS[5]),
      z.literal(B3_DIGESTED_MANIFEST_FIELDS[6]),
      z.literal(B3_DIGESTED_MANIFEST_FIELDS[7]),
    ]),
    volatile_fields: z.tuple([
      z.literal(B3_VOLATILE_FIELDS[0]),
      z.literal(B3_VOLATILE_FIELDS[1]),
      z.literal(B3_VOLATILE_FIELDS[2]),
      z.literal(B3_VOLATILE_FIELDS[3]),
      z.literal(B3_VOLATILE_FIELDS[4]),
      z.literal(B3_VOLATILE_FIELDS[5]),
      z.literal(B3_VOLATILE_FIELDS[6]),
      z.literal(B3_VOLATILE_FIELDS[7]),
      z.literal(B3_VOLATILE_FIELDS[8]),
    ]),
    file_order: z.literal("path_ascending_unicode_code_point"),
    file_bytes: z.literal("sha256_raw_bytes_then_include_file_record"),
  })
  .strict();

const volatileBuildMetadataSchema = z
  .object({
    generated_at: isoDateTimeSchema.optional(),
    sealed_at: isoDateTimeSchema.optional(),
    build_id: z.string().min(1).optional(),
    build_host: z.string().min(1).optional(),
    build_path: z.string().min(1).optional(),
    ci_job_url: z.string().url().optional(),
    correlation_id: stableIdSchema.optional(),
    duration_ms: z.number().int().nonnegative().optional(),
  })
  .strict();

export const artifactManifestSchema = z
  .object({
    manifest_version: z.literal("0.1"),
    artifact: artifactIdentitySchema,
    compiler: compilerIdentitySchema,
    source_date_epoch: z.number().int().nonnegative(),
    corpus: artifactCorpusSchema,
    domain_payload: domainPayloadSchema,
    content_files: z.array(artifactContentFileSchema).min(1),
    digest_contract: digestContractSchema,
    content_digest: z
      .object({
        algorithm: z.literal("sha256"),
        value: sha256Schema,
      })
      .strict(),
    volatile: volatileBuildMetadataSchema.optional(),
  })
  .strict();

export type ArtifactManifest = z.infer<typeof artifactManifestSchema>;
