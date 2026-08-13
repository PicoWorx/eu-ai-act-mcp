import { compareUnicodeCodePoints } from "../utils/canonical-json.js";
import { systemProfileSchema, type SystemProfile } from "./profile.js";
import type { AssessSystemResponse } from "./envelope.js";

type FactUsed = AssessSystemResponse["facts_used"][number];

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function sortIds(values: string[]): string[] {
  return [...values].sort(compareUnicodeCodePoints);
}

function normalizeNode(value: unknown, key = ""): unknown {
  if (Array.isArray(value)) {
    const normalized = value.map((item) => normalizeNode(item, key));
    if (key === "evidence_reference_ids" || key === "supports_fact_ids") {
      return sortIds(normalized as string[]);
    }
    const identityKey = ["fact_id", "evidence_id", "control_id"].find((candidate) =>
      normalized.every(
        (item) => isRecord(item) && typeof item[candidate] === "string",
      ),
    );
    if (identityKey) {
      return [...normalized].sort((left, right) =>
        compareUnicodeCodePoints(
          (left as Record<string, string>)[identityKey]!,
          (right as Record<string, string>)[identityKey]!,
        ),
      );
    }
    return normalized;
  }
  if (!isRecord(value)) return value;
  const normalized: Record<string, unknown> = {};
  for (const [childKey, child] of Object.entries(value)) {
    normalized[childKey] = normalizeNode(child, childKey);
  }
  return normalized;
}

export interface NormalizedProfile {
  profile: SystemProfile;
  facts: FactUsed[];
  facts_by_path: Map<string, FactUsed>;
  facts_by_id: Map<string, FactUsed>;
}

export function normalizeSystemProfile(input: unknown): NormalizedProfile {
  const parsed = systemProfileSchema.parse(input);
  const profile = normalizeNode(parsed) as SystemProfile;
  const facts: FactUsed[] = [];
  const factsById = new Map<string, FactUsed>();
  const factsByPath = new Map<string, FactUsed>();
  const evidenceIds = new Set<string>();
  const controlIds = new Set<string>();
  const referencedEvidenceIds = new Set<string>();
  const supportedFactIds = new Set<string>();

  const visit = (value: unknown, path: string): void => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, `${path}/${index}`));
      return;
    }
    if (!isRecord(value)) return;

    if (Array.isArray(value.evidence_reference_ids)) {
      for (const evidenceId of value.evidence_reference_ids) {
        if (typeof evidenceId === "string") referencedEvidenceIds.add(evidenceId);
      }
    }
    if (Array.isArray(value.supports_fact_ids)) {
      for (const factId of value.supports_fact_ids) {
        if (typeof factId === "string") supportedFactIds.add(factId);
      }
    }

    if (typeof value.evidence_id === "string") {
      if (evidenceIds.has(value.evidence_id)) {
        throw new Error(`Duplicate evidence_id: ${value.evidence_id}`);
      }
      evidenceIds.add(value.evidence_id);
    }
    if (typeof value.control_id === "string") {
      if (controlIds.has(value.control_id)) {
        throw new Error(`Duplicate control_id: ${value.control_id}`);
      }
      controlIds.add(value.control_id);
    }

    if (
      typeof value.fact_id === "string" &&
      "value" in value &&
      typeof value.origin === "string" &&
      typeof value.verification === "string"
    ) {
      if (factsById.has(value.fact_id)) {
        throw new Error(`Duplicate fact_id: ${value.fact_id}`);
      }
      const fact: FactUsed = {
        fact_id: value.fact_id,
        profile_path: path,
        value: value.value as FactUsed["value"],
        origin: value.origin as FactUsed["origin"],
        verification: value.verification as FactUsed["verification"],
        evidence_reference_ids: sortIds(
          Array.isArray(value.evidence_reference_ids)
            ? (value.evidence_reference_ids as string[])
            : [],
        ),
      };
      facts.push(fact);
      factsById.set(fact.fact_id, fact);
      factsByPath.set(path, fact);
      return;
    }

    for (const [childKey, child] of Object.entries(value)) {
      visit(child, `${path}/${childKey}`);
    }
  };

  visit(profile, "");
  facts.sort((left, right) =>
    compareUnicodeCodePoints(left.fact_id, right.fact_id),
  );

  for (const referenced of referencedEvidenceIds) {
    if (!evidenceIds.has(referenced)) {
      throw new Error(`Fact references unknown evidence_id: ${referenced}`);
    }
  }
  for (const supported of supportedFactIds) {
    if (!factsById.has(supported)) {
      throw new Error(`Evidence references unknown fact_id: ${supported}`);
    }
  }

  return {
    profile,
    facts,
    facts_by_path: factsByPath,
    facts_by_id: factsById,
  };
}
