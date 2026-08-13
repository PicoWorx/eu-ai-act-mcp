import { z } from "zod";
import { artifactManifestSchema } from "./artifact-manifest.js";
import {
  actorRoleSchema,
  isoDateSchema,
  isoDateTimeSchema,
  jsonPointerSchema,
  operativeDateSchema,
  semverSchema,
  sha256Schema,
  sourceStatusSchema,
  stableIdSchema,
  verificationLevelSchema,
} from "./shared.js";

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

const sourceSnapshotSchema = z
  .object({
    source_id: stableIdSchema,
    title: z.string().min(1),
    celex: z.string().min(1).optional(),
    official_url: z.string().url(),
    source_status: sourceStatusSchema,
    publication_date: isoDateSchema,
    snapshot_path: z.string().min(1),
    content_sha256: sha256Schema,
  })
  .strict();

const citationSchema = z
  .object({
    citation_id: stableIdSchema,
    source_id: stableIdSchema,
    exact_provision: z.string().min(1),
    official_url: z.string().url(),
    verification_level: verificationLevelSchema,
  })
  .strict();

const transitionSchema = z
  .object({
    transition_id: stableIdSchema,
    from_state: z.string().min(1),
    to_state: z.string().min(1),
    operative_date: operativeDateSchema,
    conditions: z.array(z.string().min(1)),
    citation_ids: z.array(stableIdSchema).min(1),
  })
  .strict();

const obligationDeltaSchema = z
  .object({
    delta_id: stableIdSchema,
    operation: z.enum(["add", "modify", "remove"]),
    obligation_id: stableIdSchema,
    actor_roles: z.array(actorRoleSchema).min(1),
    summary: z.string().min(1),
    before: z.string().min(1).nullable(),
    after: z.string().min(1).nullable(),
    effective_date: operativeDateSchema,
    citation_ids: z.array(stableIdSchema).min(1),
    human_review_required: z.boolean(),
  })
  .strict();

const ruleSchema = z
  .object({
    rule_id: stableIdSchema,
    rule_version: semverSchema,
    rule_kind: z.literal("decision_table"),
    rule_path: z.string().min(1),
    input_selectors: z.array(z.string().min(1)).min(1),
    outcome_codes: z.array(stableIdSchema).min(1),
    citation_ids: z.array(stableIdSchema).min(1),
  })
  .strict();

const lawPatchTestSchema = z
  .object({
    test_id: stableIdSchema,
    fixture_path: z.string().min(1),
    expected_result_path: z.string().min(1),
    expected_result: z
      .object({
        status: z.enum(["determined", "undetermined", "not_applicable"]),
        outcome_code: stableIdSchema,
        finding_ids: z.array(stableIdSchema),
        required_warning_codes: z.array(z.string().min(1)),
      })
      .strict(),
    covered_rule_ids: z.array(stableIdSchema).min(1),
    critical: z.boolean(),
  })
  .strict();

const affectedSelectorSchema = z
  .object({
    selector_id: stableIdSchema,
    selector_kind: z.enum([
      "capability",
      "workflow",
      "policy",
      "control",
      "tool",
      "output_surface",
    ]),
    selector: z.string().min(1),
    effect: z.enum(["add", "change", "remove", "retest"]),
    obligation_delta_ids: z.array(stableIdSchema),
  })
  .strict();

const migrationSchema = z
  .object({
    migration_notes: z.array(z.string().min(1)),
    rollback_target: semverSchema,
    rollback_notes: z.array(z.string().min(1)),
    breaking_change: z.boolean(),
  })
  .strict();

const humanReviewSchema = z
  .object({
    required: z.boolean(),
    flags: z.array(
      z.enum([
        "novel_interpretation",
        "negative_legal_conclusion",
        "non_binding_source",
        "transition_complexity",
        "critical_rule_change",
        "manual_exception",
      ]),
    ),
    reviewer_role: z.string().min(1),
    promotion_gate: z.enum(["approve", "approve_with_conditions", "reject"]),
  })
  .strict();

const oscalMappingSchema = z
  .object({
    oscal_version: z.literal("1.1.2"),
    export_model: z.literal("component-definition"),
    component_uuid_strategy: z.literal("uuid_v5_from_content_digest"),
    field_mappings: z.array(
      z
        .object({
          lawpatch_pointer: jsonPointerSchema,
          oscal_pointer: jsonPointerSchema,
          transform: z.enum([
            "copy",
            "join_text",
            "to_responsible_role",
            "to_source_link",
            "to_implemented_requirement",
          ]),
        })
        .strict(),
    ).min(1),
    control_mappings: z.array(
      z
        .object({
          obligation_delta_id: stableIdSchema,
          oscal_control_id: z.string().min(1),
          implementation_status: z.enum([
            "planned",
            "implemented",
            "partial",
            "not_applicable",
          ]),
        })
        .strict(),
    ),
  })
  .strict();

const ed25519SignatureSchema = z
  .object({
    algorithm: z.literal("Ed25519"),
    public_key_id: z.string().min(1),
    signed_digest: sha256Schema,
    signature_base64: z.string().regex(/^[A-Za-z0-9+/]{86}==$/),
    signed_at: isoDateTimeSchema,
  })
  .strict();

export const lawPatchManifestSchema = artifactManifestSchema.extend({
  domain_payload: z
    .object({
      schema_id: z.literal("schema.lawpatch.manifest"),
      schema_version: z.literal("0.1.0"),
      fields: z.tuple([
        z.literal(LAWPATCH_DIGESTED_DOMAIN_FIELDS[0]),
        z.literal(LAWPATCH_DIGESTED_DOMAIN_FIELDS[1]),
        z.literal(LAWPATCH_DIGESTED_DOMAIN_FIELDS[2]),
        z.literal(LAWPATCH_DIGESTED_DOMAIN_FIELDS[3]),
        z.literal(LAWPATCH_DIGESTED_DOMAIN_FIELDS[4]),
        z.literal(LAWPATCH_DIGESTED_DOMAIN_FIELDS[5]),
        z.literal(LAWPATCH_DIGESTED_DOMAIN_FIELDS[6]),
        z.literal(LAWPATCH_DIGESTED_DOMAIN_FIELDS[7]),
        z.literal(LAWPATCH_DIGESTED_DOMAIN_FIELDS[8]),
        z.literal(LAWPATCH_DIGESTED_DOMAIN_FIELDS[9]),
        z.literal(LAWPATCH_DIGESTED_DOMAIN_FIELDS[10]),
        z.literal(LAWPATCH_DIGESTED_DOMAIN_FIELDS[11]),
        z.literal(LAWPATCH_DIGESTED_DOMAIN_FIELDS[12]),
        z.literal(LAWPATCH_DIGESTED_DOMAIN_FIELDS[13]),
      ]),
      sha256: sha256Schema,
    })
    .strict(),
  lawpatch_manifest_version: z.literal("0.1"),
  package: z
    .object({
      name: z.string().regex(/^@lexbeam-lawpatch\/[a-z0-9-]+$/),
      version: semverSchema,
      title: z.string().min(1),
      regulation_family: z.literal("EU AI Act"),
      component: z.string().min(1),
      dependencies: z.array(
        z
          .object({
            package_name: z.string().min(1),
            version_range: z.string().min(1),
            content_digest: sha256Schema,
          })
          .strict(),
      ),
    })
    .strict(),
  jurisdiction: z
    .object({
      codes: z.array(z.literal("EU")).min(1),
      territorial_scope: z.string().min(1),
    })
    .strict(),
  effective_date: operativeDateSchema,
  transitions: z.array(transitionSchema),
  sources: z.array(sourceSnapshotSchema).min(1),
  citations: z.array(citationSchema).min(1),
  obligation_deltas: z.array(obligationDeltaSchema).min(1),
  rules: z.array(ruleSchema).min(1),
  tests: z.array(lawPatchTestSchema).min(1),
  affected_selectors: z.array(affectedSelectorSchema).min(1),
  migration: migrationSchema,
  human_review: humanReviewSchema,
  oscal_component_definition_mapping: oscalMappingSchema,
  signature: ed25519SignatureSchema,
});

export type LawPatchManifest = z.infer<typeof lawPatchManifestSchema>;
