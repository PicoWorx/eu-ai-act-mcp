import { z } from "zod";

export const INTERNAL_REGULATION_ID = "eu-ai-act" as const;
export const DECISION_CONTRACT_VERSION = "1.1" as const;
export const PROFILE_VERSION = "1.0" as const;

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected an ISO 8601 calendar date in YYYY-MM-DD form");

export const isoDateTimeSchema = z
  .string()
  .datetime({ offset: true });

export const sha256Schema = z
  .string()
  .regex(/^[a-f0-9]{64}$/, "Expected a lowercase SHA-256 digest");

export const semverSchema = z
  .string()
  .regex(
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/,
    "Expected a semantic version",
  );

export const stableIdSchema = z
  .string()
  .min(3)
  .max(160)
  .regex(/^[a-z][a-z0-9._:-]*$/, "Expected a stable lowercase identifier");

export const jsonPointerSchema = z
  .string()
  .regex(/^(?:\/(?:[^~/]|~[01])*)*$/, "Expected an RFC 6901 JSON Pointer");

export const sourceStatusSchema = z.enum([
  "enacted_oj",
  "official_consolidated_snapshot_non_authentic",
  "commission_proposal",
  "political_agreement",
  "adopted_pending_publication",
  "commission_guideline_draft",
  "commission_guideline_final",
  "commission_study",
  "code_under_assessment",
  "code_adequate_voluntary_tool",
]);

export const verificationLevelSchema = z.enum([
  "complete_official_text",
  "consolidated_snapshot_integrity_verified",
  "official_metadata_only",
  "curated_summary_only",
  "unverified",
]);

export const operativeDateSchema = z.union([
  isoDateSchema,
  z.literal("not_date_bound"),
]);

export const decisionStatusSchema = z.enum([
  "determined",
  "undetermined",
  "not_applicable",
]);

export const actorRoleSchema = z.enum([
  "provider",
  "deployer",
  "importer",
  "distributor",
  "authorised_representative",
  "product_manufacturer",
  "gpai_provider",
  "unknown",
]);

export const resultBlockNameSchema = z.enum([
  "legal_classification",
  "impact",
  "implementation_readiness",
]);

export const scalarFactValueSchema = z.union([
  z.string(),
  z.number().finite(),
  z.boolean(),
]);

export const factValueSchema = z.union([
  scalarFactValueSchema,
  z.array(scalarFactValueSchema),
]);
