/**
 * Source-state registry for the EU AI Act MCP.
 *
 * The product's core promise is that binding law is never confused with
 * proposals, political agreements, draft guidance, or voluntary codes.
 * Every non-OJ statement the server makes must carry an explicit
 * `SourceStatus`. Current OJ law (`enacted_oj`) is the default answer;
 * everything else is surfaced only when a caller opts in, and always
 * with its status attached.
 *
 * Only sources that have been cross-read in-house against their primary
 * text or the official Commission page are listed here. Guidance,
 * standards, and code-of-practice sources from the 2026-06-15 research
 * memo are intentionally NOT yet included; they are a verified follow-on.
 */

export type SourceStatus =
  | "enacted_oj"
  | "commission_proposal"
  | "political_agreement"
  | "commission_guideline_draft"
  | "commission_guideline_final"
  | "commission_study"
  | "code_under_assessment"
  | "code_adequate_voluntary_tool";

export const SOURCE_STATUS_LABELS: Record<SourceStatus, string> = {
  enacted_oj: "Enacted law (published in the Official Journal)",
  commission_proposal: "Commission proposal (not adopted)",
  political_agreement: "Political agreement (not yet adopted or published)",
  commission_guideline_draft: "Draft Commission guidelines (non-binding, under consultation)",
  commission_guideline_final: "Final Commission guidelines (non-binding interpretation)",
  commission_study: "Commission study (background input, not law)",
  code_under_assessment: "Code of practice under adequacy assessment",
  code_adequate_voluntary_tool: "Code of practice confirmed as an adequate voluntary tool",
};

/** True only for binding, published-in-the-OJ law. */
export function isEnacted(status: SourceStatus): boolean {
  return status === "enacted_oj";
}

export interface SourceRef {
  id: string;
  title: string;
  status: SourceStatus;
  /** ISO date: OJ publication, proposal date, or agreement date. */
  date: string;
  url: string;
  celex?: string;
  note?: string;
}

export const sourceRegistry: Record<string, SourceRef> = {
  oj_2024_1689: {
    id: "oj_2024_1689",
    title: "Regulation (EU) 2024/1689 (AI Act), Official Journal",
    status: "enacted_oj",
    date: "2024-07-12",
    url: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj",
    celex: "32024R1689",
    note: "Current binding law. Default basis for every tool answer.",
  },
  com_2025_836: {
    id: "com_2025_836",
    title: "COM(2025) 836 final, Digital Omnibus on AI (proposal amending Reg. 2024/1689 and 2018/1139)",
    status: "commission_proposal",
    date: "2025-11-19",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52025PC0836",
    celex: "52025PC0836",
    note: "Procedure 2025/0359(COD). Proposal text, not law. Cross-read in-house against the COM PDF on 2026-06-15.",
  },
  omnibus_agreement_2026_05_07: {
    id: "omnibus_agreement_2026_05_07",
    title: "Political agreement on the Digital Omnibus (AI), European Parliament and Council",
    status: "political_agreement",
    date: "2026-05-07",
    url: "https://digital-strategy.ec.europa.eu/en/news/eu-agrees-simplify-ai-rules-boost-innovation-and-ban-nudification-apps-protect-citizens",
    note: "Substance agreed by co-legislators; not yet adopted or published in the OJ. Dates verified on 2026-06-15 against the official Commission overview page (https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai, last update 2026-05-11), which is a policy page rather than an OJ legal instrument and is therefore not listed here as a separate enacted source.",
  },
};
