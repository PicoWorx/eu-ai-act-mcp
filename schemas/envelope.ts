import { z } from "zod";
import { findingSchema } from "./finding.js";
import {
  impactBlockSchema,
  implementationReadinessBlockSchema,
  legalClassificationBlockSchema,
} from "./result-blocks.js";
import {
  DECISION_CONTRACT_VERSION,
  INTERNAL_REGULATION_ID,
  decisionStatusSchema,
  factValueSchema,
  isoDateSchema,
  isoDateTimeSchema,
  resultBlockNameSchema,
  semverSchema,
  sha256Schema,
  stableIdSchema,
} from "./shared.js";

export const corpusIdentitySchema = z
  .object({
    id: stableIdSchema,
    regulation_id: z.literal(INTERNAL_REGULATION_ID),
    sha256: sha256Schema,
    verified_at: isoDateSchema,
    current_instrument: z.string().min(1),
    source_snapshot_ids: z.array(stableIdSchema).min(1),
  })
  .strict();

export const factUsedSchema = z
  .object({
    fact_id: stableIdSchema,
    profile_path: z.string().min(1),
    value: factValueSchema,
    origin: z.enum([
      "explicit_structured_input",
      "cited_evidence",
      "caller_free_text",
      "derived_unverified",
    ]),
    verification: z.enum([
      "caller_asserted",
      "evidence_linked",
      "verified_against_evidence",
      "unverified_extraction",
    ]),
    evidence_reference_ids: z.array(stableIdSchema),
  })
  .strict();

const assumptionSchema = z
  .object({
    assumption_id: stableIdSchema,
    statement: z.string().min(1),
    affected_blocks: z.array(resultBlockNameSchema).min(1),
    source_fact_ids: z.array(stableIdSchema),
    state: z.enum(["disclosed_unverified", "caller_confirmed"]),
  })
  .strict();

const missingFactSchema = z
  .object({
    missing_fact_id: stableIdSchema,
    profile_path: z.string().min(1),
    question: z.string().min(1),
    reason: z.string().min(1),
    decisive: z.boolean(),
    affected_blocks: z.array(resultBlockNameSchema).min(1),
  })
  .strict();

const warningSchema = z
  .object({
    warning_id: stableIdSchema,
    code: z.enum([
      "SUMMARY_ONLY",
      "UNVERIFIED_FREE_TEXT",
      "CONFLICTING_FACTS",
      "UNSUPPORTED_ACTOR",
      "LEGAL_REVIEW_REQUIRED",
      "NON_BINDING_SOURCE",
      "OUTPUT_NOT_LEGAL_ADVICE",
    ]),
    message: z.string().min(1),
    finding_ids: z.array(stableIdSchema),
  })
  .strict();

export const existingAtomicToolNameSchema = z.enum([
  "euaiact_annex_iv_checklist",
  "euaiact_answer_question",
  "euaiact_assess_art6_3_exception",
  "euaiact_calculate_penalty",
  "euaiact_check_deadlines",
  "euaiact_check_gpai_systemic_risk",
  "euaiact_classify_system",
  "euaiact_get_article",
  "euaiact_get_obligations",
]);

const recommendedNextCallSchema = z
  .object({
    tool_name: existingAtomicToolNameSchema,
    reason: z.string().min(1),
    input_fact_ids: z.array(stableIdSchema),
  })
  .strict();

export const runtimeMetadataSchema = z
  .object({
    generated_at: isoDateTimeSchema.optional(),
    correlation_id: stableIdSchema.optional(),
    duration_ms: z.number().int().nonnegative().optional(),
  })
  .strict();

export const decisionEnvelopeSchema = z
  .object({
    contract_version: z.literal(DECISION_CONTRACT_VERSION),
    server_version: semverSchema,
    corpus: corpusIdentitySchema,
    status: decisionStatusSchema,
    facts_used: z.array(factUsedSchema),
    assumptions: z.array(assumptionSchema),
    missing_facts: z.array(missingFactSchema),
    findings: z.array(findingSchema),
    warnings: z.array(warningSchema),
    recommended_next_calls: z.array(recommendedNextCallSchema),
    runtime_metadata: runtimeMetadataSchema.optional(),
  })
  .strict();

export const assessSystemResponseSchema = decisionEnvelopeSchema.extend({
  legal_classification: legalClassificationBlockSchema,
  impact: impactBlockSchema,
  implementation_readiness: implementationReadinessBlockSchema,
});

export type DecisionEnvelope = z.infer<typeof decisionEnvelopeSchema>;
export type AssessSystemResponse = z.infer<typeof assessSystemResponseSchema>;
