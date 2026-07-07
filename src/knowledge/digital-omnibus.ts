/**
 * Digital Omnibus on AI: structured, source-state-aware knowledge pack.
 *
 * This replaces the earlier free-text `[UNVERIFIED]` Digital Omnibus block.
 * Every proposal/agreement fact here was cross-read in-house on 2026-06-15:
 *   - the proposal text COM(2025) 836 final (CELEX 52025PC0836, 19 Nov 2025);
 *   - the political-agreement dates and high-risk timeline on the official
 *     Commission pages (verified reachable, not WAF-blocked).
 * Adoption facts (EP endorsement 2026-06-16, Council final adoption
 * 2026-06-29) were verified on 2026-07-07 against the Council press release
 * of 2026-06-29 plus convergent major-firm trackers.
 *
 * STATUS: formally ADOPTED by both co-legislators, but NOT yet published in
 * the Official Journal and therefore NOT yet in force. Current law remains
 * Regulation (EU) 2024/1689 as published in the OJ.
 *
 * SINGLE-SOURCE ENACTMENT FLIP (audit item M3): the `omnibusEnactment`
 * record below is the ONE flip point. On OJ publication, fill its three
 * null fields (celex, ojPublicationDate, entryIntoForce), set its status to
 * "enacted_oj", rebuild, and every derived surface (operative deadline
 * dates, milestone timeline, enacted flags, status labels, server
 * instructions, resources) flips with it. Nothing else needs editing;
 * reconcile-on-OJ items are listed in the flip checklist.
 */

import { isEnacted, sourceRegistry, type SourceRef, type SourceStatus } from "./sources.js";

// ---------------------------------------------------------------------------
// Enactment record: the single flip point (audit item M3)
// ---------------------------------------------------------------------------

export interface OmnibusEnactment {
  /**
   * Legislative status of the Digital Omnibus on AI. Committed default is
   * "adopted_pending_publication"; set to "enacted_oj" on OJ publication.
   */
  status: Extract<SourceStatus, "adopted_pending_publication" | "enacted_oj">;
  /** European Parliament endorsement (formal adoption step 1). */
  epEndorsement: string;
  /** Council final adoption (formal adoption step 2, "final green light"). */
  councilAdoption: string;
  /** CELEX number of the adopted amending act. Does not exist until OJ publication. */
  celex: string | null;
  /** ISO date of publication in the Official Journal. Unknown until it happens. */
  ojPublicationDate: string | null;
  /** ISO date of entry into force: the third day after OJ publication. */
  entryIntoForce: string | null;
}

/**
 * THE flip record. On OJ publication, fill celex + ojPublicationDate +
 * entryIntoForce and set status to "enacted_oj". Until then all three are
 * null: those values do not exist yet and must never be guessed.
 */
export const omnibusEnactment: OmnibusEnactment = {
  status: "adopted_pending_publication",
  epEndorsement: "2026-06-16",
  councilAdoption: "2026-06-29",
  celex: null,
  ojPublicationDate: null,
  entryIntoForce: null,
};

/**
 * Fail-closed enactment test: true ONLY when the status says enacted AND all
 * three OJ-day identifiers are filled. A half-flipped record (status set but
 * identifiers missing, or vice versa) never reads as enacted.
 */
export function isOmnibusEnacted(e: OmnibusEnactment = omnibusEnactment): boolean {
  return (
    e.status === "enacted_oj" &&
    e.celex !== null &&
    e.ojPublicationDate !== null &&
    e.entryIntoForce !== null
  );
}

/**
 * Resolved legislative status of the Omnibus, fail-closed: a record that
 * claims "enacted_oj" without the OJ identifiers resolves back to
 * "adopted_pending_publication".
 */
export function resolveOmnibusStatus(e: OmnibusEnactment = omnibusEnactment): SourceStatus {
  return isOmnibusEnacted(e) ? "enacted_oj" : "adopted_pending_publication";
}

/**
 * One-line, always-current status sentence for server instructions,
 * resource notes, and default tool responses. Correct in both states.
 */
export function omnibusStatusLine(e: OmnibusEnactment = omnibusEnactment): string {
  if (isOmnibusEnacted(e)) {
    return (
      `The Digital Omnibus on AI (CELEX ${e.celex}) was published in the Official Journal on ` +
      `${e.ojPublicationDate} and entered into force on ${e.entryIntoForce}. Its amended dates are ` +
      `operative law and are reflected in the milestone timeline.`
    );
  }
  return (
    "The Digital Omnibus on AI (COM(2025) 836) has been formally adopted by the European Parliament " +
    "(16 June 2026) and the Council (29 June 2026) but is NOT yet published in the Official Journal " +
    "and NOT yet in force. Current OJ law (Regulation (EU) 2024/1689) still governs; the current-law " +
    "dates remain authoritative for compliance advice until publication."
  );
}

/**
 * Source registry as served: identical to the static registry until the
 * Omnibus is enacted, at which point a derived `omnibus_oj` record for the
 * published amending act is added from the enactment record.
 */
export function getEffectiveSourceRegistry(
  e: OmnibusEnactment = omnibusEnactment,
): Record<string, SourceRef> {
  if (!isOmnibusEnacted(e)) return sourceRegistry;
  return {
    ...sourceRegistry,
    omnibus_oj: {
      id: "omnibus_oj",
      title: "Digital Omnibus (AI) amending Regulation (EU) 2024/1689, Official Journal",
      status: "enacted_oj",
      date: e.ojPublicationDate as string,
      url: `https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:${e.celex}`,
      celex: e.celex as string,
      note: `Entered into force on ${e.entryIntoForce} (third day after OJ publication). Derived from the omnibusEnactment record.`,
    },
  };
}

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
  /** Derived from `omnibusEnactment`; false until OJ publication. */
  enacted: boolean;
  /** Resolved legislative status, derived from `omnibusEnactment` (fail-closed). */
  status: SourceStatus;
  /** The single flip record; see the module header. */
  enactment: OmnibusEnactment;
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
  enacted: isOmnibusEnacted(omnibusEnactment),
  status: resolveOmnibusStatus(omnibusEnactment),
  enactment: omnibusEnactment,
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
      note: "RECONCILE ON OJ (known discrepancy): this entry records the PROPOSAL's transition date (2 Feb 2027, cross-read against COM(2025) 836 on 2026-06-15). External trackers report the adopted act moves the Art. 50(2) marking obligation to 2 Dec 2026 with a transition for systems already on the market. Neither has been verified against the OJ text; do not emit either as law. Verify against the published OJ text on flip day and correct this delta then.",
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
  warning: isOmnibusEnacted(omnibusEnactment)
    ? `Enacted: published in the Official Journal on ${omnibusEnactment.ojPublicationDate} (CELEX ${omnibusEnactment.celex}), in force since ${omnibusEnactment.entryIntoForce}. The amended dates are operative law and are reflected in the milestone timeline. Deltas below keep their original stage labels (proposal / political agreement) for provenance; verify exact wording against the OJ text before quoting it as law.`
    : "Not yet in force. Current law is Regulation (EU) 2024/1689 as published in the OJ (CELEX 32024R1689). The Digital Omnibus on AI (COM(2025) 836, 19 Nov 2025) reached a political agreement on 7 May 2026 and has since been FORMALLY ADOPTED by both co-legislators (European Parliament 16 June 2026, Council 29 June 2026). It takes legal effect only on publication in the Official Journal (entry into force the third day after publication). Until then, plan against current law; re-verify every item against the consolidated OJ text on publication before treating it as enacted.",
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

export function buildOmnibusSummary(e: OmnibusEnactment = omnibusEnactment): LegislativeProposal {
  const enacted = isOmnibusEnacted(e);
  return {
    name: digitalOmnibusPack.name,
    status: resolveOmnibusStatus(e),
    proposalDate: digitalOmnibusPack.proposal.date,
    description: enacted
      ? `Digital Omnibus on AI. Commission proposal COM(2025) 836 final (CELEX 52025PC0836, 19 Nov 2025, procedure 2025/0359(COD)) amending Regulation (EU) 2024/1689. Politically agreed 7 May 2026, adopted by the European Parliament (${e.epEndorsement}) and the Council (${e.councilAdoption}), published in the Official Journal on ${e.ojPublicationDate} (CELEX ${e.celex}) and in force since ${e.entryIntoForce}.`
      : `Digital Omnibus on AI. Commission proposal COM(2025) 836 final (CELEX 52025PC0836, 19 Nov 2025, procedure 2025/0359(COD)) amending Regulation (EU) 2024/1689. Politically agreed on 7 May 2026 and since FORMALLY ADOPTED by both co-legislators: European Parliament endorsement ${e.epEndorsement}, Council final adoption ${e.councilAdoption}. Not yet in force: it takes legal effect on publication in the Official Journal (entry into force the third day after publication). Until then current OJ law governs.`,
    keyChanges: [
      "High-risk Annex III (Art. 6(2)) obligations: current law 2 Aug 2026 -> backstop 2 Dec 2027 (or 6 months after a Commission support-measures decision).",
      "High-risk Annex I (Art. 6(1)) obligations: current law 2 Aug 2027 -> backstop 2 Aug 2028 (or 12 months after that decision).",
      "NOT deferred: Art. 50 transparency and the Commission's GPAI enforcement powers and fines stay on 2 Aug 2026; the legacy GPAI compliance date stays 2 Aug 2027.",
      "Art. 50(2) synthetic-content marking: systems placed before 2 Aug 2026 get until 2 Feb 2027 (proposal date; trackers report 2 Dec 2026 for the adopted act; reconcile against the OJ text).",
      "Art. 4 AI literacy recast to a Commission/Member-State duty (proposal).",
      "New Art. 4a replacing Art. 10(5): special-category data for bias detection/correction (proposal).",
      "Art. 49/Art. 6(3): registration duty for self-assessed not-high-risk systems deleted in the proposal; agreement treatment unverified.",
      "Art. 75: AI Office centralisation for GPAI-based and VLOP/VLOSE-embedded systems (proposal).",
      "Art. 99: SME penalty privileges extended to small mid-caps (proposal).",
      "Art. 5: nudification/CSAM prohibition added at the political-agreement stage (NOT in the proposal).",
    ],
    impactOnAIAct: enacted
      ? `Enacted: in force since ${e.entryIntoForce}. The amended high-risk dates (Annex III 2 Dec 2027, Annex I 2 Aug 2028) are operative law and are reflected in the milestone timeline. Art. 50 transparency and GPAI enforcement/fines were NOT deferred and apply since 2 Aug 2026. Verify article-level wording against the OJ text (CELEX ${e.celex}).`
      : "Adopted but not yet in force: current OJ-law dates remain authoritative for compliance until publication in the Official Journal. On publication, the Annex III high-risk date moves to 2 Dec 2027 and the Annex I date to 2 Aug 2028; Art. 50 transparency and GPAI enforcement/fines are NOT deferred and stay on 2 Aug 2026. Plan against current law until the OJ text is published.",
  };
}

export const omnibusSummary: LegislativeProposal = buildOmnibusSummary(omnibusEnactment);
