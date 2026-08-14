export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type ArtifactContentFileRole =
  | "source_snapshot"
  | "normalized_source"
  | "citation_registry"
  | "rule"
  | "test"
  | "expected_result"
  | "schema"
  | "claim_matrix"
  | "generated_surface"
  | "oscal_export"
  | "migration_note";

export interface ArtifactContentFile {
  path: string;
  role: ArtifactContentFileRole;
  media_type: string;
  sha256: string;
  bytes: number;
}

export interface ArtifactManifest {
  manifest_version: "0.1";
  artifact: {
    artifact_id: string;
    artifact_version: string;
    artifact_kind:
      | "normalized_regulation"
      | "decision_contract"
      | "lawpatch"
      | "generated_surface_bundle";
    regulation_id: "eu-ai-act";
  };
  compiler: {
    name: "lexbeam-regulation-compiler";
    version: string;
    source_commit: string;
  };
  source_date_epoch: number;
  corpus: {
    corpus_id: string;
    corpus_sha256: string;
    verified_at: string;
    current_instrument: string;
    source_snapshot_ids: string[];
  };
  domain_payload: {
    schema_id: string;
    schema_version: string;
    fields: string[];
    sha256: string;
  };
  content_files: ArtifactContentFile[];
  digest_contract: {
    algorithm: "sha256";
    canonicalization: "RFC8785";
    manifest_fields: string[];
    volatile_fields: string[];
    file_order: "path_ascending_unicode_code_point";
    file_bytes: "sha256_raw_bytes_then_include_file_record";
  };
  content_digest: {
    algorithm: "sha256";
    value: string;
  };
  volatile?: {
    generated_at?: string;
    sealed_at?: string;
    build_id?: string;
    build_host?: string;
    build_path?: string;
    ci_job_url?: string;
    correlation_id?: string;
    duration_ms?: number;
  };
}

export interface SourceDocumentDescriptor {
  id: string;
  source_snapshot_id: string;
  celex?: string;
  source_url: string;
  source_path: string;
  normalized_path: string;
  role: string;
  source_media_type: string;
  normalized_media_type: string;
  expected_source_sha256: string;
  expected_normalized_sha256: string;
  expected_source_bytes: number;
  expected_normalized_bytes: number;
}

export interface AdapterDomainPayload {
  schema_id: string;
  schema_version: string;
  fields: readonly string[];
  value: Record<string, JsonValue>;
}

export interface RegulationAdapter {
  readonly regulation_id: string;
  readonly artifact_id: string;
  readonly artifact_version: string;
  readonly corpus_id: string;
  readonly verified_at: string;
  readonly current_instrument: string;
  readonly documents: readonly SourceDocumentDescriptor[];
  normalize(document: SourceDocumentDescriptor, source: Buffer): Buffer;
  verifySource(document: SourceDocumentDescriptor, source: Buffer): readonly string[];
  domainPayload(): AdapterDomainPayload;
}

export interface VerificationIssue {
  document_id: string;
  code:
    | "SOURCE_MISSING"
    | "NORMALIZED_MISSING"
    | "SOURCE_HASH_MISMATCH"
    | "NORMALIZED_HASH_MISMATCH"
    | "SOURCE_SIZE_MISMATCH"
    | "NORMALIZED_SIZE_MISMATCH"
    | "NORMALIZATION_MISMATCH"
    | "SOURCE_VALIDATION_FAILED";
  message: string;
}

export interface VerificationReport {
  ok: boolean;
  documents_checked: number;
  issues: VerificationIssue[];
}

export interface SealedCorpus {
  output_directory: string;
  manifest_path: string;
  manifest: ArtifactManifest;
}

export interface PackagingFileInput {
  path: string;
  role: ArtifactContentFileRole;
  media_type: string;
  bytes: Buffer;
}
