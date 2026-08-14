import { z } from "zod";
import {
  PROFILE_VERSION,
  actorRoleSchema,
  isoDateSchema,
  sha256Schema,
  stableIdSchema,
} from "./shared.js";

export const profileFactOriginSchema = z.enum([
  "explicit_structured_input",
  "cited_evidence",
]);

export const profileFactVerificationSchema = z.enum([
  "caller_asserted",
  "evidence_linked",
]);

const profileFact = <T extends z.ZodTypeAny>(valueSchema: T) =>
  z
    .object({
      fact_id: stableIdSchema,
      value: valueSchema,
      origin: profileFactOriginSchema,
      verification: profileFactVerificationSchema,
      evidence_reference_ids: z.array(stableIdSchema),
    })
    .strict();

export const stringFactSchema = profileFact(z.string().min(1));
export const booleanFactSchema = profileFact(z.boolean());
export const numberFactSchema = profileFact(z.number().finite().nonnegative());
export const integerFactSchema = profileFact(z.number().int().nonnegative());
export const roleFactSchema = profileFact(actorRoleSchema);

export const lifecycleStageSchema = z.enum([
  "concept",
  "development",
  "testing",
  "pilot",
  "production",
  "retired",
  "unknown",
]);

export const lifecycleStageFactSchema = profileFact(lifecycleStageSchema);

export const annexIIIDomainSchema = z.enum([
  "biometrics",
  "critical_infrastructure",
  "education",
  "employment",
  "essential_services",
  "law_enforcement",
  "migration_asylum_border_control",
  "justice_and_democratic_processes",
  "other",
  "unknown",
]);

export const annexIIIDomainFactSchema = profileFact(annexIIIDomainSchema);

export const evidenceReferenceSchema = z
  .object({
    evidence_id: stableIdSchema,
    title: z.string().min(1),
    uri: z.string().url().optional(),
    sha256: sha256Schema.optional(),
    observed_at: isoDateSchema.optional(),
    supports_fact_ids: z.array(stableIdSchema),
  })
  .strict();

export const existingControlSchema = z
  .object({
    control_id: stableIdSchema,
    description: stringFactSchema,
    implementation_state: profileFact(
      z.enum(["planned", "implemented", "tested", "unknown"]),
    ),
    evidence_reference_ids: z.array(stableIdSchema),
  })
  .strict();

const identityGroupSchema = z
  .object({
    system_name: stringFactSchema.optional(),
    system_version: stringFactSchema.optional(),
    owner: stringFactSchema.optional(),
    lifecycle_stage: lifecycleStageFactSchema.optional(),
    machine_based_system: booleanFactSchema.optional(),
    infers_from_inputs_how_to_generate_outputs: booleanFactSchema.optional(),
    operates_with_varying_levels_of_autonomy: booleanFactSchema.optional(),
    may_exhibit_adaptiveness_after_deployment: booleanFactSchema.optional(),
  })
  .strict();

const intendedUseGroupSchema = z
  .object({
    intended_purpose: stringFactSchema.optional(),
    reasonably_foreseeable_uses: z.array(stringFactSchema),
  })
  .strict();

const roleFactsGroupSchema = z
  .object({
    roles: z.array(roleFactSchema),
    places_on_market_under_own_name: booleanFactSchema.optional(),
    develops_or_has_developed_system: booleanFactSchema.optional(),
    uses_under_own_authority: booleanFactSchema.optional(),
  })
  .strict();

const geographyGroupSchema = z
  .object({
    jurisdictions: z.array(stringFactSchema),
    placed_on_eu_market: booleanFactSchema.optional(),
    used_in_eu: booleanFactSchema.optional(),
    output_used_in_eu: booleanFactSchema.optional(),
    affected_person_groups: z.array(stringFactSchema),
  })
  .strict();

const decisionContextGroupSchema = z
  .object({
    decision_subject: stringFactSchema.optional(),
    decision_consequence: stringFactSchema.optional(),
    materially_influences_decision: booleanFactSchema.optional(),
    human_review_before_effect: booleanFactSchema.optional(),
  })
  .strict();

const annexIGroupSchema = z
  .object({
    product_or_safety_component: booleanFactSchema.optional(),
    annex_i_legislation: z.array(stringFactSchema),
    third_party_conformity_assessment_required: booleanFactSchema.optional(),
    solely_non_safety_user_assistance: booleanFactSchema.optional(),
  })
  .strict();

const annexIIIGroupSchema = z
  .object({
    domain: annexIIIDomainFactSchema.optional(),
    purpose: stringFactSchema.optional(),
    annex_iii_point: profileFact(z.number().int().min(1).max(8)).optional(),
    performs_profiling: booleanFactSchema.optional(),
    narrow_procedural_task: booleanFactSchema.optional(),
    improves_prior_human_activity: booleanFactSchema.optional(),
    detects_patterns_without_replacing_human_review: booleanFactSchema.optional(),
    preparatory_task: booleanFactSchema.optional(),
  })
  .strict();

const biometricAndPracticeGroupSchema = z
  .object({
    uses_biometrics: booleanFactSchema.optional(),
    sole_purpose_identity_verification: booleanFactSchema.optional(),
    remote_biometric_identification: booleanFactSchema.optional(),
    realtime_operation: booleanFactSchema.optional(),
    publicly_accessible_space: booleanFactSchema.optional(),
    law_enforcement_use: booleanFactSchema.optional(),
    biometric_categorisation: booleanFactSchema.optional(),
    emotion_recognition: booleanFactSchema.optional(),
    emotion_recognition_workplace_or_education: booleanFactSchema.optional(),
    social_scoring: booleanFactSchema.optional(),
    social_scoring_unrelated_context: booleanFactSchema.optional(),
    social_scoring_unjustified_or_disproportionate: booleanFactSchema.optional(),
    exploits_vulnerability: booleanFactSchema.optional(),
    subliminal_or_manipulative_technique: booleanFactSchema.optional(),
  })
  .strict();

const transparencyGroupSchema = z
  .object({
    interacts_with_natural_persons: booleanFactSchema.optional(),
    generates_or_manipulates_synthetic_content: booleanFactSchema.optional(),
    deep_fake_content: booleanFactSchema.optional(),
    public_interest_text: booleanFactSchema.optional(),
    output_machine_readable_marked: booleanFactSchema.optional(),
  })
  .strict();

const gpaiGroupSchema = z
  .object({
    is_gpai_model: booleanFactSchema.optional(),
    model_name: stringFactSchema.optional(),
    training_flops: numberFactSchema.optional(),
    commission_designated_systemic_risk: booleanFactSchema.optional(),
    integrates_third_party_gpai_model: booleanFactSchema.optional(),
    model_placed_on_market_date: profileFact(isoDateSchema).optional(),
  })
  .strict();

const publicAuthorityAndFriaGroupSchema = z
  .object({
    public_authority_or_public_law_body: booleanFactSchema.optional(),
    provides_public_service: booleanFactSchema.optional(),
    private_entity_providing_public_service: booleanFactSchema.optional(),
    fria_relevant_use: booleanFactSchema.optional(),
    fria_completed: booleanFactSchema.optional(),
  })
  .strict();

const controlsAndEvidenceGroupSchema = z
  .object({
    controls: z.array(existingControlSchema),
    evidence_references: z.array(evidenceReferenceSchema),
  })
  .strict();

const freeTextSchema = z
  .object({
    fact_id: stableIdSchema,
    value: z.string().min(1),
    origin: z.literal("caller_free_text"),
    verification: z.literal("unverified_extraction"),
  })
  .strict();

export const systemProfileSchema = z
  .object({
    profile_version: z.literal(PROFILE_VERSION),
    identity: identityGroupSchema.optional(),
    intended_use: intendedUseGroupSchema.optional(),
    role_facts: roleFactsGroupSchema.optional(),
    geography: geographyGroupSchema.optional(),
    decision_context: decisionContextGroupSchema.optional(),
    annex_i: annexIGroupSchema.optional(),
    annex_iii: annexIIIGroupSchema.optional(),
    biometric_and_practices: biometricAndPracticeGroupSchema.optional(),
    transparency: transparencyGroupSchema.optional(),
    gpai: gpaiGroupSchema.optional(),
    public_authority_and_fria: publicAuthorityAndFriaGroupSchema.optional(),
    controls_and_evidence: controlsAndEvidenceGroupSchema.optional(),
    free_text: freeTextSchema.optional(),
  })
  .strict();

export type SystemProfile = z.infer<typeof systemProfileSchema>;
