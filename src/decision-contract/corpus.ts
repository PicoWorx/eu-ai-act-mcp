import type { AssessSystemResponse } from "./envelope.js";

/**
 * Identity emitted by the B3 seal over the pinned law/ corpus. The integration
 * suite re-seals the corpus and proves this digest and source list have not
 * drifted from the compiler output.
 */
export const SEALED_CORPUS: AssessSystemResponse["corpus"] = {
  id: "eu-ai-act-2026-07-27",
  regulation_id: "eu-ai-act",
  sha256: "bd86e216a0c5958809275c972fc5ad9f8d9e358975d6dbec28556c1310d701d5",
  verified_at: "2026-08-06",
  current_instrument:
    "Regulation (EU) 2024/1689 as amended by Regulation (EU) 2026/1744",
  source_snapshot_ids: [
    "source.com.2025.836.superseded",
    "source.oj.2024.1689.consolidated.20260727",
    "source.oj.2024.1689.original",
    "source.oj.2026.1744",
  ],
};

export const CONSOLIDATED_SOURCE_ID =
  "source.oj.2024.1689.consolidated.20260727" as const;
export const CONSOLIDATED_URL =
  "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02024R1689-20260727" as const;
