import { readFile } from "node:fs/promises";
import { sha256Bytes } from "./hash.js";
import { resolveWithin } from "./paths.js";
import type {
  RegulationAdapter,
  VerificationIssue,
  VerificationReport,
} from "./types.js";

async function readOptional(path: string): Promise<Buffer | null> {
  try {
    return await readFile(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function verifyCorpus(
  adapter: RegulationAdapter,
  corpusDirectory: string,
): Promise<VerificationReport> {
  const issues: VerificationIssue[] = [];

  for (const document of adapter.documents) {
    const sourcePath = resolveWithin(corpusDirectory, document.source_path);
    const normalizedPath = resolveWithin(corpusDirectory, document.normalized_path);
    const source = await readOptional(sourcePath);
    const normalized = await readOptional(normalizedPath);

    if (!source) {
      issues.push({
        document_id: document.id,
        code: "SOURCE_MISSING",
        message: `${document.source_path} is missing`,
      });
      continue;
    }
    if (!normalized) {
      issues.push({
        document_id: document.id,
        code: "NORMALIZED_MISSING",
        message: `${document.normalized_path} is missing`,
      });
      continue;
    }

    for (const message of adapter.verifySource(document, source)) {
      issues.push({
        document_id: document.id,
        code: "SOURCE_VALIDATION_FAILED",
        message,
      });
    }
    if (source.length !== document.expected_source_bytes) {
      issues.push({
        document_id: document.id,
        code: "SOURCE_SIZE_MISMATCH",
        message: `${document.source_path} is ${source.length} bytes, expected ${document.expected_source_bytes}`,
      });
    }
    if (normalized.length !== document.expected_normalized_bytes) {
      issues.push({
        document_id: document.id,
        code: "NORMALIZED_SIZE_MISMATCH",
        message: `${document.normalized_path} is ${normalized.length} bytes, expected ${document.expected_normalized_bytes}`,
      });
    }
    if (sha256Bytes(source) !== document.expected_source_sha256) {
      issues.push({
        document_id: document.id,
        code: "SOURCE_HASH_MISMATCH",
        message: `${document.source_path} does not match its pinned SHA-256`,
      });
    }
    if (sha256Bytes(normalized) !== document.expected_normalized_sha256) {
      issues.push({
        document_id: document.id,
        code: "NORMALIZED_HASH_MISMATCH",
        message: `${document.normalized_path} does not match its pinned SHA-256`,
      });
    }
    if (!adapter.normalize(document, source).equals(normalized)) {
      issues.push({
        document_id: document.id,
        code: "NORMALIZATION_MISMATCH",
        message: `${document.normalized_path} is not the adapter derivation of ${document.source_path}`,
      });
    }
  }

  return {
    ok: issues.length === 0,
    documents_checked: adapter.documents.length,
    issues,
  };
}

export function assertVerified(report: VerificationReport): void {
  if (!report.ok) {
    throw new Error(report.issues.map((issue) => `${issue.code}: ${issue.message}`).join("\n"));
  }
}
