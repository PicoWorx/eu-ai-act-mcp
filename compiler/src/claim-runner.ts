import { compareUnicodeCodePoints } from "./canonical-json.js";

export type ClaimSide = "corpus" | "served";

export interface ClaimEvaluation {
  passed: boolean;
  detail?: string;
}

export interface ClaimDefinition<Context> {
  id: string;
  side: ClaimSide;
  evaluate(context: Context): boolean | ClaimEvaluation | Promise<boolean | ClaimEvaluation>;
}

export interface ClaimResult {
  id: string;
  side: ClaimSide;
  passed: boolean;
  detail?: string;
}

export interface ClaimRun {
  passed: number;
  failed: number;
  results: ClaimResult[];
}

const sideOrder: Record<ClaimSide, number> = { corpus: 0, served: 1 };

export async function runClaims<Context>(
  context: Context,
  definitions: readonly ClaimDefinition<Context>[],
): Promise<ClaimRun> {
  const ordered = [...definitions].sort(
    (left, right) =>
      compareUnicodeCodePoints(left.id, right.id) ||
      sideOrder[left.side] - sideOrder[right.side],
  );
  const results: ClaimResult[] = [];
  for (const definition of ordered) {
    const raw = await definition.evaluate(context);
    const evaluation = typeof raw === "boolean" ? { passed: raw } : raw;
    results.push({
      id: definition.id,
      side: definition.side,
      passed: evaluation.passed,
      ...(evaluation.detail ? { detail: evaluation.detail } : {}),
    });
  }
  const passed = results.filter((result) => result.passed).length;
  return {
    passed,
    failed: results.length - passed,
    results,
  };
}

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ");
}

export function sliceBetween(value: string, start: string, end: string): string {
  const startIndex = value.indexOf(start);
  if (startIndex < 0) return "";
  const endIndex = value.indexOf(end, startIndex + start.length);
  return endIndex < 0 ? value.slice(startIndex) : value.slice(startIndex, endIndex);
}

export function nearAnchor(
  value: string,
  anchor: string,
  needle: string,
  span = 400,
): boolean {
  let index = value.indexOf(anchor);
  while (index >= 0) {
    const window = value.slice(
      Math.max(0, index - span),
      index + anchor.length + span,
    );
    if (window.includes(needle)) return true;
    index = value.indexOf(anchor, index + 1);
  }
  return false;
}
