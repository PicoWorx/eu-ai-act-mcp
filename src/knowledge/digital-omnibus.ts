/**
 * Digital Omnibus on AI: structured, source-state-aware knowledge pack.
 *
 * This replaces the earlier free-text `[UNVERIFIED]` Digital Omnibus block.
 * Every fact here was cross-read in-house on 2026-06-15:
 *   - the proposal text COM(2025) 836 final (CELEX 52025PC0836, 19 Nov 2025);
 *   - the political-agreement dates and high-risk timeline on the official
 *     Commission pages (verified reachable, not WAF-blocked).
 *
 * NOTHING here is enacted law. Current law remains Regulation (EU) 2024/1689
 * as published in the OJ. These items are surfaced only on opt-in and always
 * carry their `SourceStatus`. Re-verify the consolidated OJ text on adoption
 * before flipping any item to `enacted_oj`.
 */

import type { SourceStatus } from "./sources.js";

export interface OmnibusDelta {
  /** AI Act article the change touches. */
  article: string;
  /** What would change. */
  change: string;
  /** Where this is established: proposal text vs political agreement. */
  sourceStatus: Extract<SourceStatus, "commission_proposal" | "political_agreement">;
  /** Registry id of the source. */
  sourceId: string;
  /** Specific effective date in the proposal, if any (ISO). */
  effectiveDate?: string;
  /** Cautions, divergences, or items not yet verified. */
  note?: string;
}

export interface HighRiskTimelineShift {
  mechanism: string;
  /** The 6/12-month-after-decision mechanism is from the proposal text. */
  mechanismSourceStatus: SourceStatus;
  /** Backstop dates that apply absent (or before) the Commission decision. */
  backstop: {
    annex_iii_art_6_2: string;
    annex_i_art_6_1: string;
  };
  /** Backstop dates appear in both the proposal and the political agreement. */
  backstopSourceStatus: SourceStatus;
  /** Current OJ-law dates these would replace. */
  currentLaw: {
    annex_iii_art_6_2: string;
    annex_i_art_6_1: string;
  };
  note: string;
}

export interface DigitalOmnibusPack {
  name: string;
  enacted: false;
  proposal: {
    com: string;
    celex: string;
    date: string;
    procedure: string;
    sourceId: string;
  };
  politicalAgreement: {
    date: string;
    sourceId: string;
  };
  highRiskTimeline: HighRiskTimelineShift;
  deltas: OmnibusDelta[];
  /** The delta list is curated, not a complete enumeration of the proposal. */
  coverageNote: string;
  warning: string;
}

export const digitalOmnibusPack: DigitalOmnibusPack = {
  name: "Digital Omnibus on AI",
  enacted: false,
  proposal: {
    com: "COM(2025) 836 final",
    celex: "52025PC0836",
    date: "2025-11-19",
    procedure: "2025/0359(COD)",
    sourceId: "com_2025_836",
  },
  politicalAgreement: {
    date: "2026-05-07",
    sourceId: "omnibus_agreement_2026_05_07",
  },
  highRiskTimeline: {
    mechanism:
      "Proposal amends Art. 113: Chapter III high-risk obligations (Sections 1-3) apply after a Commission decision confirming adequate support measures (harmonised standards, common specifications, guidelines) are available: 6 months after that decision for Art. 6(2)/Annex III systems, 12 months after for Art. 6(1)/Annex I systems.",
    mechanismSourceStatus: "commission_proposal",
    backstop: {
      annex_iii_art_6_2: "2027-12-02",
      annex_i_art_6_1: "2028-08-02",
    },
    backstopSourceStatus: "political_agreement",
    currentLaw: {
      annex_iii_art_6_2: "2026-08-02",
      annex_i_art_6_1: "2027-08-02",
    },
    note: "The post-decision 6/12-month mechanism is from the proposal text (COM(2025) 836 Art. 113 amendment). The backstop dates 2027-12-02 and 2028-08-02 appear in BOTH the proposal backstop and the political agreement, so they are tagged political_agreement (the stronger status). Backstop dates apply absent the Commission decision, or where earlier than the post-decision dates.",
  },
  deltas: [
    {
      article: "Art. 4 (AI literacy)",
      change:
        "Provider/deployer AI-literacy obligation recast into a duty on the Commission and Member States to foster AI literacy.",
      sourceStatus: "commission_proposal",
      sourceId: "com_2025_836",
    },
    {
      article: "Art. 4a (new) / Art. 10(5)",
      change:
        "New Art. 4a inserted, replacing Art. 10(5): legal basis to exceptionally process special categories of personal data for bias detection and correction under safeguards.",
      sourceStatus: "commission_proposal",
      sourceId: "com_2025_836",
    },
    {
      article: "Art. 49 / Art. 6(3)",
      change:
        "Deletes the EU-database registration duty for Annex III systems self-assessed as not high-risk under Art. 6(3).",
      sourceStatus: "commission_proposal",
      sourceId: "com_2025_836",
      note: "DIVERGENCE: earlier reporting suggested the political agreement may retain this registration duty. Proposal deletes it; agreement treatment not independently verified. Resolve against the consolidated OJ text on adoption.",
    },
    {
      article: "Art. 50(2)",
      change:
        "Transition for synthetic-content systems already on the market before 2 Aug 2026: comply with Art. 50(2) marking by 2 Feb 2027.",
      sourceStatus: "commission_proposal",
      sourceId: "com_2025_836",
      effectiveDate: "2027-02-02",
    },
    {
      article: "Art. 75",
      change:
        "Centralises AI Office supervision for AI systems built on a GPAI model where model and system share a provider, and for systems embedded in designated VLOPs/VLOSEs; Annex I product systems excluded.",
      sourceStatus: "commission_proposal",
      sourceId: "com_2025_836",
    },
    {
      article: "Art. 99",
      change:
        "Extends the SME penalty privileges (lower caps) to small mid-cap companies (SMCs).",
      sourceStatus: "commission_proposal",
      sourceId: "com_2025_836",
    },
    {
      article: "Art. 72",
      change:
        "Replaces the mandated post-market monitoring-plan template empowerment with Commission guidelines.",
      sourceStatus: "commission_proposal",
      sourceId: "com_2025_836",
    },
    {
      article: "Art. 11 / Art. 17",
      change:
        "Technical-documentation and quality-management-system simplifications extended from SMEs to small mid-caps (SMCs); the Art. 17 QMS derogation is extended to SMEs.",
      sourceStatus: "commission_proposal",
      sourceId: "com_2025_836",
    },
    {
      article: "Art. 28 / 29 / 30 (new Annex XIV)",
      change:
        "Single application and assessment for conformity bodies designated under both the AI Act and Annex I legislation; notified-body applications use new Annex XIV NANDO codes.",
      sourceStatus: "commission_proposal",
      sourceId: "com_2025_836",
    },
    {
      article: "Art. 43",
      change:
        "Clarifies the conformity-assessment procedure where a high-risk system falls under both Annex I Section A and Annex III.",
      sourceStatus: "commission_proposal",
      sourceId: "com_2025_836",
    },
    {
      article: "Art. 57 / 60",
      change:
        "AI regulatory sandboxes: legal basis for an EU-level sandbox run by the AI Office; real-world testing extended to Annex I high-risk systems.",
      sourceStatus: "commission_proposal",
      sourceId: "com_2025_836",
    },
    {
      article: "Art. 95 / 96",
      change:
        "Voluntary support tools and national guidance extended to take small mid-caps (SMCs) into account, not only SMEs.",
      sourceStatus: "commission_proposal",
      sourceId: "com_2025_836",
    },
    {
      article: "Art. 5 (prohibited practices)",
      change:
        "Prohibition of AI systems generating non-consensual sexually explicit/intimate content or CSAM (e.g. nudification apps).",
      sourceStatus: "political_agreement",
      sourceId: "omnibus_agreement_2026_05_07",
      note: "NOT present in proposal COM(2025) 836; added at the political-agreement stage. Compliance date not independently verified. Do not emit as current Art. 5 law.",
    },
  ],
  coverageNote:
    "Curated, NON-EXHAUSTIVE selection of the most decision-relevant amendments. COM(2025) 836 amends Regulation 2024/1689 at roughly 33 points; consult the proposal text (CELEX 52025PC0836) for the complete list. Each delta listed here was cross-read against the proposal on 2026-06-15.",
  warning:
    "Not enacted law. Current law is Regulation (EU) 2024/1689 as published in the OJ (CELEX 32024R1689). The Digital Omnibus on AI (COM(2025) 836, 19 Nov 2025) reached a political agreement on 7 May 2026 but is not yet adopted or published. Plan against current law; treat these as politically foreseeable but not binding. Re-verify the consolidated OJ text before treating any item as enacted.",
};

// ---------------------------------------------------------------------------
// Backward-compatible summary (legacy `digital_omnibus` tool field + tests).
// Derived from the structured pack so the two never drift.
//
// WARNING: omnibusSummary is the FULL pending representation. Its `keyChanges`
// and `impactOnAIAct` contain non-enacted shift dates and the nudification
// prohibition. It must only be emitted on an explicit opt-in path
// (include_pending_omnibus / euaiact://omnibus). Never return it from a default
// tool response or an unparameterised resource. The deadlines tool gates it; if
// you import it directly elsewhere, gate it yourself.
// ---------------------------------------------------------------------------

export interface LegislativeProposal {
  name: string;
  status: string;
  proposalDate: string;
  description: string;
  keyChanges: string[];
  impactOnAIAct: string;
}

export const omnibusSummary: LegislativeProposal = {
  name: digitalOmnibusPack.name,
  status: "political_agreement",
  proposalDate: digitalOmnibusPack.proposal.date,
  description:
    "Digital Omnibus on AI. Commission proposal COM(2025) 836 final (CELEX 52025PC0836, 19 Nov 2025, procedure 2025/0359(COD)) amending Regulation (EU) 2024/1689. The AI Act portion reached a political agreement between the European Parliament and Council on 7 May 2026. Not yet adopted law: pending formal adoption, legal-linguistic revision, and Official Journal publication.",
  keyChanges: [
    "High-risk Annex III (Art. 6(2)) obligations: current law 2 Aug 2026 -> backstop 2 Dec 2027 (or 6 months after a Commission support-measures decision).",
    "High-risk Annex I (Art. 6(1)) obligations: current law 2 Aug 2027 -> backstop 2 Aug 2028 (or 12 months after that decision).",
    "Art. 50(2) synthetic-content marking: systems placed before 2 Aug 2026 get until 2 Feb 2027 (proposal).",
    "Art. 4 AI literacy recast to a Commission/Member-State duty (proposal).",
    "New Art. 4a replacing Art. 10(5): special-category data for bias detection/correction (proposal).",
    "Art. 49/Art. 6(3): registration duty for self-assessed not-high-risk systems deleted in the proposal; agreement treatment unverified.",
    "Art. 75: AI Office centralisation for GPAI-based and VLOP/VLOSE-embedded systems (proposal).",
    "Art. 99: SME penalty privileges extended to small mid-caps (proposal).",
    "Art. 5: nudification/CSAM prohibition added at the political-agreement stage (NOT in the proposal).",
  ],
  impactOnAIAct:
    "The Digital Omnibus is not yet adopted law. Current OJ-law dates remain authoritative for compliance until formal adoption and Official Journal publication. The headline high-risk dates (2 Dec 2027, 2 Aug 2028) are stable across the proposal backstop and the political agreement; precise article wording and some dates can still change in legal-linguistic finalisation. Plan against current law.",
};
