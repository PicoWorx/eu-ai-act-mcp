import {
  createPrivateKey,
  createPublicKey,
  sign as cryptoSign,
  verify as cryptoVerify,
} from "node:crypto";
import { readFileSync } from "node:fs";
import {
  COMPILER_NAME,
  COMPILER_VERSION,
  LAWPATCH_DIGESTED_DOMAIN_FIELDS,
  computeArtifactContentDigest,
  computeDomainPayloadDigest,
  contentFileRecord,
  frozenDigestContract,
  sortContentFiles,
} from "./contract.js";
import { isoFromSourceDateEpoch } from "./hash.js";
import type {
  ArtifactManifest,
  JsonValue,
  PackagingFileInput,
  SealedCorpus,
} from "./types.js";

export const LAWPATCH_PRIVATE_KEY_PATH_ENV = "LAWPATCH_ED25519_PRIVATE_KEY_PATH";
export const LAWPATCH_PUBLIC_KEY_PATH_ENV = "LAWPATCH_ED25519_PUBLIC_KEY_PATH";
const SIGNATURE_PREFIX = "lexbeam-lawpatch-v0.1\n";

type ActorRole =
  | "provider"
  | "deployer"
  | "importer"
  | "distributor"
  | "authorised_representative"
  | "product_manufacturer"
  | "gpai_provider"
  | "unknown";

type OperativeDate = string;

export interface LawPatchPackage {
  name: string;
  version: string;
  title: string;
  regulation_family: "EU AI Act";
  component: string;
  dependencies: Array<{
    package_name: string;
    version_range: string;
    content_digest: string;
  }>;
}

export interface LawPatchTransition {
  transition_id: string;
  from_state: string;
  to_state: string;
  operative_date: OperativeDate;
  conditions: string[];
  citation_ids: string[];
}

export interface LawPatchSource {
  source_id: string;
  title: string;
  celex?: string;
  official_url: string;
  source_status:
    | "enacted_oj"
    | "official_consolidated_snapshot_non_authentic"
    | "commission_proposal"
    | "political_agreement"
    | "adopted_pending_publication"
    | "commission_guideline_draft"
    | "commission_guideline_final"
    | "commission_study"
    | "code_under_assessment"
    | "code_adequate_voluntary_tool";
  publication_date: string;
  snapshot_path: string;
  content_sha256: string;
}

export interface LawPatchCitation {
  citation_id: string;
  source_id: string;
  exact_provision: string;
  official_url: string;
  verification_level:
    | "complete_official_text"
    | "consolidated_snapshot_integrity_verified"
    | "official_metadata_only"
    | "curated_summary_only"
    | "unverified";
}

export interface LawPatchObligationDelta {
  delta_id: string;
  operation: "add" | "modify" | "remove";
  obligation_id: string;
  actor_roles: ActorRole[];
  summary: string;
  before: string | null;
  after: string | null;
  effective_date: OperativeDate;
  citation_ids: string[];
  human_review_required: boolean;
}

export interface LawPatchRule {
  rule_id: string;
  rule_version: string;
  rule_kind: "decision_table";
  rule_path: string;
  input_selectors: string[];
  outcome_codes: string[];
  citation_ids: string[];
}

export interface LawPatchTest {
  test_id: string;
  fixture_path: string;
  expected_result_path: string;
  expected_result: {
    status: "determined" | "undetermined" | "not_applicable";
    outcome_code: string;
    finding_ids: string[];
    required_warning_codes: string[];
  };
  covered_rule_ids: string[];
  critical: boolean;
}

export interface LawPatchSelector {
  selector_id: string;
  selector_kind: "capability" | "workflow" | "policy" | "control" | "tool" | "output_surface";
  selector: string;
  effect: "add" | "change" | "remove" | "retest";
  obligation_delta_ids: string[];
}

export interface LawPatchMigration {
  migration_notes: string[];
  rollback_target: string;
  rollback_notes: string[];
  breaking_change: boolean;
}

export interface LawPatchHumanReview {
  required: boolean;
  flags: Array<
    | "novel_interpretation"
    | "negative_legal_conclusion"
    | "non_binding_source"
    | "transition_complexity"
    | "critical_rule_change"
    | "manual_exception"
  >;
  reviewer_role: string;
  promotion_gate: "approve" | "approve_with_conditions" | "reject";
}

export interface OscalComponentDefinitionMapping {
  oscal_version: "1.1.2";
  export_model: "component-definition";
  component_uuid_strategy: "uuid_v5_from_content_digest";
  field_mappings: Array<{
    lawpatch_pointer: string;
    oscal_pointer: string;
    transform:
      | "copy"
      | "join_text"
      | "to_responsible_role"
      | "to_source_link"
      | "to_implemented_requirement";
  }>;
  control_mappings: Array<{
    obligation_delta_id: string;
    oscal_control_id: string;
    implementation_status: "planned" | "implemented" | "partial" | "not_applicable";
  }>;
}

export interface LawPatchAssemblyInput {
  artifact_id: string;
  package: LawPatchPackage;
  jurisdiction: {
    codes: ["EU", ..."EU"[]];
    territorial_scope: string;
  };
  effective_date: OperativeDate;
  transitions: LawPatchTransition[];
  sources: LawPatchSource[];
  citations: LawPatchCitation[];
  obligation_deltas: LawPatchObligationDelta[];
  rules: LawPatchRule[];
  tests: LawPatchTest[];
  affected_selectors: LawPatchSelector[];
  migration: LawPatchMigration;
  human_review: LawPatchHumanReview;
  oscal_component_definition_mapping: OscalComponentDefinitionMapping;
  packaging_files: PackagingFileInput[];
  public_key_id: string;
}

export interface LawPatchManifest extends ArtifactManifest {
  artifact: ArtifactManifest["artifact"] & { artifact_kind: "lawpatch" };
  domain_payload: {
    schema_id: "schema.lawpatch.manifest";
    schema_version: "0.1.0";
    fields: string[];
    sha256: string;
  };
  lawpatch_manifest_version: "0.1";
  package: LawPatchPackage;
  jurisdiction: LawPatchAssemblyInput["jurisdiction"];
  effective_date: OperativeDate;
  transitions: LawPatchTransition[];
  sources: LawPatchSource[];
  citations: LawPatchCitation[];
  obligation_deltas: LawPatchObligationDelta[];
  rules: LawPatchRule[];
  tests: LawPatchTest[];
  affected_selectors: LawPatchSelector[];
  migration: LawPatchMigration;
  human_review: LawPatchHumanReview;
  oscal_component_definition_mapping: OscalComponentDefinitionMapping;
  signature: {
    algorithm: "Ed25519";
    public_key_id: string;
    signed_digest: string;
    signature_base64: string;
    signed_at: string;
  };
}

function signatureMessage(digest: string): Buffer {
  if (!/^[a-f0-9]{64}$/.test(digest)) {
    throw new Error("LawPatch digest must be a lowercase SHA-256 value");
  }
  return Buffer.from(`${SIGNATURE_PREFIX}${digest}`, "ascii");
}

function requiredKeyPath(
  environment: NodeJS.ProcessEnv,
  variable: string,
): string {
  const value = environment[variable];
  if (!value) throw new Error(`${variable} must point to an Ed25519 PEM key`);
  return value;
}

export function signLawPatchDigest(
  digest: string,
  environment: NodeJS.ProcessEnv = process.env,
): string {
  const path = requiredKeyPath(environment, LAWPATCH_PRIVATE_KEY_PATH_ENV);
  const key = createPrivateKey(readFileSync(path));
  if (key.asymmetricKeyType !== "ed25519") {
    throw new Error(`${LAWPATCH_PRIVATE_KEY_PATH_ENV} does not contain an Ed25519 key`);
  }
  return cryptoSign(null, signatureMessage(digest), key).toString("base64");
}

export function verifyLawPatchDigestSignature(
  digest: string,
  signatureBase64: string,
  environment: NodeJS.ProcessEnv = process.env,
): boolean {
  const path = requiredKeyPath(environment, LAWPATCH_PUBLIC_KEY_PATH_ENV);
  const key = createPublicKey(readFileSync(path));
  if (key.asymmetricKeyType !== "ed25519") return false;
  return cryptoVerify(
    null,
    signatureMessage(digest),
    key,
    Buffer.from(signatureBase64, "base64"),
  );
}

function asJsonObject(value: object): Record<string, JsonValue> {
  return value as unknown as Record<string, JsonValue>;
}

export function assembleLawPatchManifest(
  sealedCorpus: SealedCorpus,
  input: LawPatchAssemblyInput,
  environment: NodeJS.ProcessEnv = process.env,
): LawPatchManifest {
  if (sealedCorpus.manifest.artifact.regulation_id !== "eu-ai-act") {
    throw new Error("Frozen LawPatch manifest v0.1 supports the EU AI Act only");
  }
  const packagedRecords = input.packaging_files.map((file) =>
    contentFileRecord(file.path, file.role, file.media_type, file.bytes),
  );
  const contentFiles = sortContentFiles([
    ...sealedCorpus.manifest.content_files,
    ...packagedRecords,
  ]);

  const domain = {
    lawpatch_manifest_version: "0.1" as const,
    package: input.package,
    jurisdiction: input.jurisdiction,
    effective_date: input.effective_date,
    transitions: input.transitions,
    sources: input.sources,
    citations: input.citations,
    obligation_deltas: input.obligation_deltas,
    rules: input.rules,
    tests: input.tests,
    affected_selectors: input.affected_selectors,
    migration: input.migration,
    human_review: input.human_review,
    oscal_component_definition_mapping: input.oscal_component_definition_mapping,
  };
  const domainPayload = {
    schema_id: "schema.lawpatch.manifest" as const,
    schema_version: "0.1.0" as const,
    fields: [...LAWPATCH_DIGESTED_DOMAIN_FIELDS],
    sha256: computeDomainPayloadDigest(
      asJsonObject(domain),
      LAWPATCH_DIGESTED_DOMAIN_FIELDS,
    ),
  };
  const draft = {
    manifest_version: "0.1" as const,
    artifact: {
      artifact_id: input.artifact_id,
      artifact_version: input.package.version,
      artifact_kind: "lawpatch" as const,
      regulation_id: "eu-ai-act" as const,
    },
    compiler: sealedCorpus.manifest.compiler,
    source_date_epoch: sealedCorpus.manifest.source_date_epoch,
    corpus: sealedCorpus.manifest.corpus,
    domain_payload: domainPayload,
    content_files: contentFiles,
    digest_contract: frozenDigestContract(),
    volatile: {
      sealed_at: isoFromSourceDateEpoch(sealedCorpus.manifest.source_date_epoch),
    },
    ...domain,
  };
  const digest = computeArtifactContentDigest(
    draft as unknown as Omit<ArtifactManifest, "content_digest">,
  );
  const signatureBase64 = signLawPatchDigest(digest, environment);
  return {
    ...draft,
    content_digest: {
      algorithm: "sha256",
      value: digest,
    },
    signature: {
      algorithm: "Ed25519",
      public_key_id: input.public_key_id,
      signed_digest: digest,
      signature_base64: signatureBase64,
      signed_at: isoFromSourceDateEpoch(sealedCorpus.manifest.source_date_epoch),
    },
  };
}

export function verifyLawPatchManifestSignature(
  manifest: LawPatchManifest,
  environment: NodeJS.ProcessEnv = process.env,
): boolean {
  const expectedTimestamp = isoFromSourceDateEpoch(manifest.source_date_epoch);
  if (
    manifest.manifest_version !== "0.1" ||
    manifest.artifact.artifact_kind !== "lawpatch" ||
    manifest.artifact.regulation_id !== "eu-ai-act" ||
    manifest.compiler.name !== COMPILER_NAME ||
    manifest.compiler.version !== COMPILER_VERSION ||
    manifest.domain_payload.schema_id !== "schema.lawpatch.manifest" ||
    manifest.domain_payload.schema_version !== "0.1.0" ||
    manifest.content_digest.algorithm !== "sha256" ||
    manifest.signature.algorithm !== "Ed25519" ||
    manifest.signature.signed_at !== expectedTimestamp
  ) {
    return false;
  }
  if (
    (manifest.volatile?.generated_at !== undefined &&
      manifest.volatile.generated_at !== expectedTimestamp) ||
    (manifest.volatile?.sealed_at !== undefined &&
      manifest.volatile.sealed_at !== expectedTimestamp)
  ) {
    return false;
  }
  if (JSON.stringify(manifest.digest_contract) !== JSON.stringify(frozenDigestContract())) {
    return false;
  }
  try {
    const sortedFiles = sortContentFiles(manifest.content_files);
    if (JSON.stringify(sortedFiles) !== JSON.stringify(manifest.content_files)) return false;
  } catch {
    return false;
  }
  if (manifest.signature.signed_digest !== manifest.content_digest.value) return false;
  if (
    JSON.stringify(manifest.domain_payload.fields) !==
    JSON.stringify(LAWPATCH_DIGESTED_DOMAIN_FIELDS)
  ) {
    return false;
  }
  if (
    computeDomainPayloadDigest(
      asJsonObject(manifest),
      LAWPATCH_DIGESTED_DOMAIN_FIELDS,
    ) !== manifest.domain_payload.sha256
  ) {
    return false;
  }
  if (computeArtifactContentDigest(manifest) !== manifest.content_digest.value) return false;
  if (!/^[A-Za-z0-9+/]{86}==$/.test(manifest.signature.signature_base64)) return false;
  return verifyLawPatchDigestSignature(
    manifest.content_digest.value,
    manifest.signature.signature_base64,
    environment,
  );
}
