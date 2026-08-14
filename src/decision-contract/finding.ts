import { z } from "zod";
import {
  actorRoleSchema,
  operativeDateSchema,
  resultBlockNameSchema,
  sourceStatusSchema,
  stableIdSchema,
  verificationLevelSchema,
} from "./shared.js";

export const legalProvenanceSchema = z
  .object({
    instrument_id: z.literal("regulation-eu-2024-1689"),
    exact_provision: z.string().min(1),
    instrument_status: z.literal("enacted"),
    source_id: stableIdSchema,
    authority_source_ids: z.array(stableIdSchema).min(1),
    official_url: z.string().url(),
    operative_date: operativeDateSchema,
    source_status: sourceStatusSchema,
    verification_level: verificationLevelSchema,
  })
  .strict();

const findingScopeSchema = z
  .object({
    actors: z.array(actorRoleSchema),
    jurisdictions: z.array(z.string().min(1)),
    system_scope: z.string().min(1),
  })
  .strict();

const findingBaseSchema = z
  .object({
    finding_id: stableIdSchema,
    finding_basis: z.enum([
      "legal_proposition",
      "caller_supplied_impact",
      "tool_state_abstention",
    ]),
    block: resultBlockNameSchema,
    summary: z.string().min(1),
    scope: findingScopeSchema,
    fact_ids: z.array(stableIdSchema),
    assumption_ids: z.array(stableIdSchema),
    missing_fact_ids: z.array(stableIdSchema),
    provenance: z.array(legalProvenanceSchema),
  })
  .strict();

const resolvedFindingSchema = findingBaseSchema.extend({
  determination: z.enum(["applies", "does_not_apply", "not_applicable"]),
});

const abstainedFindingSchema = findingBaseSchema.extend({
  determination: z.literal("undetermined"),
  reason_for_abstention: z.string().min(1),
});

export const findingSchema = z.union([
  resolvedFindingSchema,
  abstainedFindingSchema,
]).superRefine((finding, context) => {
  if (finding.finding_basis === "legal_proposition" && finding.provenance.length === 0) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["provenance"],
      message: "Legal propositions require at least one exact legal provenance anchor",
    });
  }
  if (finding.finding_basis === "caller_supplied_impact") {
    if (finding.block !== "impact" || finding.provenance.length !== 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["provenance"],
        message: "Caller-supplied impact findings must be in the impact block and have no legal provenance",
      });
    }
  }
  if (finding.finding_basis === "tool_state_abstention") {
    if (finding.determination !== "undetermined" || finding.provenance.length !== 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["provenance"],
        message: "Tool-state abstentions must be undetermined and have no legal provenance",
      });
    }
  }
});

export type Finding = z.infer<typeof findingSchema>;
