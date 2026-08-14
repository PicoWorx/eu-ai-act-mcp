import { createHash } from "node:crypto";
import { canonicalize } from "./canonical-json.js";
import type { JsonValue } from "./types.js";

export function sha256Bytes(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

export function sha256Canonical(value: JsonValue): string {
  return sha256Bytes(Buffer.from(canonicalize(value), "utf8"));
}

export function resolveSourceDateEpoch(
  explicit?: number,
  environment: NodeJS.ProcessEnv = process.env,
): number {
  const raw = explicit ?? environment.SOURCE_DATE_EPOCH;
  if (raw === undefined || raw === "") {
    throw new Error(
      "SOURCE_DATE_EPOCH is required for a release seal and must be a non-negative safe integer",
    );
  }
  const candidate = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isSafeInteger(candidate) || candidate < 0) {
    throw new Error(
      "SOURCE_DATE_EPOCH is required for a release seal and must be a non-negative safe integer",
    );
  }
  return candidate;
}

export function isoFromSourceDateEpoch(sourceDateEpoch: number): string {
  return new Date(sourceDateEpoch * 1000).toISOString();
}
