import { z } from "zod";
import {
  actorRoleSchema,
  decisionStatusSchema,
  operativeDateSchema,
  stableIdSchema,
} from "./shared.js";

export const legalClassificationRouteSchema = z.enum([
  "prohibited",
  "high_risk",
  "transparency_duty",
  "gpai",
  "minimal",
]);

const legalRouteSchema = z
  .object({
    route: legalClassificationRouteSchema,
    finding_ids: z.array(stableIdSchema).min(1),
    actor_roles: z.array(actorRoleSchema),
  })
  .strict();

export const legalClassificationBlockSchema = z
  .object({
    schema_version: z.literal("1.0"),
    status: decisionStatusSchema,
    routes: z.array(legalRouteSchema),
    annex_iii_categories: z.array(z.number().int().min(1).max(8)),
    actor_roles: z.array(actorRoleSchema),
    finding_ids: z.array(stableIdSchema),
    limitations: z.array(z.string().min(1)),
  })
  .strict();

export const impactCategorySchema = z.enum([
  "health",
  "safety",
  "privacy_and_data_protection",
  "non_discrimination",
  "employment_and_work",
  "education",
  "access_to_essential_services",
  "freedom_of_expression_and_information",
  "due_process_and_effective_remedy",
  "other_fundamental_rights",
]);

const impactStatementSchema = z
  .object({
    description: z.string().min(1),
    categories: z.array(impactCategorySchema),
    affected_group_ids: z.array(stableIdSchema),
    fact_ids: z.array(stableIdSchema),
  })
  .strict();

const affectedGroupSchema = z
  .object({
    group_id: stableIdSchema,
    label: z.string().min(1),
    fact_ids: z.array(stableIdSchema),
  })
  .strict();

const impactControlSchema = z
  .object({
    control_id: stableIdSchema,
    description: z.string().min(1),
    implementation_state: z.enum(["planned", "implemented", "tested", "unknown"]),
    evidence_reference_ids: z.array(stableIdSchema),
    fact_ids: z.array(stableIdSchema),
  })
  .strict();

export const impactBlockSchema = z
  .object({
    schema_version: z.literal("1.0"),
    status: decisionStatusSchema,
    inherent_impact: impactStatementSchema.nullable(),
    relevant_affected_groups: z.array(affectedGroupSchema),
    current_controls: z.array(impactControlSchema),
    residual_impact: impactStatementSchema.nullable(),
    finding_ids: z.array(stableIdSchema),
    limitations: z.array(z.string().min(1)),
    does_not_alter_legal_classification: z.literal(true),
  })
  .strict();

const readinessDutySchema = z
  .object({
    duty_id: stableIdSchema,
    title: z.string().min(1),
    actor_roles: z.array(actorRoleSchema).min(1),
    exact_provision: z.string().min(1),
    operative_date: operativeDateSchema,
    evidence_state: z.enum([
      "not_assessed",
      "missing",
      "partial",
      "documented",
      "verified",
    ]),
    owner_ids: z.array(stableIdSchema),
    finding_ids: z.array(stableIdSchema).min(1),
  })
  .strict();

const evidenceStatusSchema = z
  .object({
    evidence_id: stableIdSchema,
    duty_ids: z.array(stableIdSchema),
    state: z.enum(["missing", "provided", "verified", "stale", "not_applicable"]),
    note: z.string().min(1),
  })
  .strict();

const controlGapSchema = z
  .object({
    gap_id: stableIdSchema,
    duty_ids: z.array(stableIdSchema),
    description: z.string().min(1),
    owner_ids: z.array(stableIdSchema),
    target_date: operativeDateSchema,
  })
  .strict();

const ownerSchema = z
  .object({
    owner_id: stableIdSchema,
    label: z.string().min(1),
    responsibility: z.string().min(1),
  })
  .strict();

export const implementationReadinessBlockSchema = z
  .object({
    schema_version: z.literal("1.0"),
    status: decisionStatusSchema,
    readiness_state: z.enum([
      "evidence_complete",
      "evidence_partial",
      "evidence_missing",
      "undetermined",
      "not_applicable",
    ]),
    applicable_duties: z.array(readinessDutySchema),
    evidence_status: z.array(evidenceStatusSchema),
    control_gaps: z.array(controlGapSchema),
    owners: z.array(ownerSchema),
    finding_ids: z.array(stableIdSchema),
    limitations: z.array(z.string().min(1)),
    is_regulatory_approval: z.literal(false),
  })
  .strict();

export type LegalClassificationBlock = z.infer<typeof legalClassificationBlockSchema>;
export type ImpactBlock = z.infer<typeof impactBlockSchema>;
export type ImplementationReadinessBlock = z.infer<typeof implementationReadinessBlockSchema>;
