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
 * STATUS: ENACTED. Published in the Official Journal on 24 July 2026 as
 * Regulation (EU) 2026/1744 (CELEX 32026R1744), in force from 27 July 2026.
 * The enactment record below carries those identifiers and was verified
 * against the enacted OJ text on 2026-07-26.
 *
 * SINGLE-SOURCE ENACTMENT RECORD (audit item M3): the `omnibusEnactment`
 * record below drives every derived surface (operative deadline dates,
 * milestone timeline, enacted flags, status labels, server instructions,
 * resources). It resolves fail-closed: a record whose status says enacted
 * without all three OJ identifiers reads as pending.
 *
 * SECOND CONTENT PASS 2026-07-27: the delta list was reconciled article by
 * article against the enacted OJ text. Two entries had been carrying the
 * Commission proposal's version and were wrong as law: Art. 4 (the provider and
 * deployer duty survives, softened; it was NOT recast into a Commission-only
 * duty) and Art. 49 (the Art. 6(3) registration duty SURVIVES; only Annex VIII
 * Section B points 7 and 9 were deleted). Both are corrected and every delta now
 * carries its amending item number from Article 1 of Regulation (EU) 2026/1744.
 *
 * THIRD CONTENT PASS 2026-07-29: the high-risk timeline still carried the
 * proposal's conditional trigger, describing 2 Dec 2027 as a backstop that
 * obligations could beat by six months after a Commission decision on the
 * availability of support measures. That trigger was DELETED before adoption.
 * Art. 113, third paragraph, point (c) as enacted (item 40) is two plain
 * calendar dates with no condition attached. The timeline fields were renamed
 * from `mechanism`/`backstop` to `supersededProposalMechanism`/`applicationDates`
 * so the names cannot re-teach the wrong model, and a guard test now asserts the
 * enacted surfaces never call either date a backstop.
 *
 * NOTE, corrected on flip day 2026-07-26: the earlier claim that "nothing
 * else needs editing" was wrong. Flipping the record alone left the
 * obligations data, the summary key-changes list, the source-registry note,
 * several FAQ answers and the prohibited-practices data stating superseded
 * law. Those were corrected in the same change and a cross-tool consistency
 * test now guards the worst of them. Treat a future amendment as a content
 * pass, not a one-line edit.
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
  /**
   * Date on the face of the adopted act ("Done at Strasbourg, 8 July 2026").
   * This is the date to quote in client-facing text: it is verifiable from the
   * OJ text itself, whereas the two chamber dates above come from the Council
   * press release and trackers. Null until the act exists.
   */
  actDate: string | null;
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
  status: "enacted_oj",
  epEndorsement: "2026-06-16",
  councilAdoption: "2026-06-29",
  actDate: "2026-07-08",
  celex: "32026R1744",
  ojPublicationDate: "2026-07-24",
  entryIntoForce: "2026-07-27",
};

/**
 * Fail-closed enactment test: true ONLY when the status says enacted AND all
 * three OJ-day identifiers are filled. A half-flipped record (status set but
 * identifiers missing, or vice versa) never reads as enacted.
 */
export function isOmnibusEnacted(e: OmnibusEnactment = omnibusEnactment): boolean {
  return (
    e.status === "enacted_oj" &&
    typeof e.celex === "string" && e.celex.trim() !== "" &&
    typeof e.ojPublicationDate === "string" && e.ojPublicationDate.trim() !== "" &&
    typeof e.entryIntoForce === "string" && e.entryIntoForce.trim() !== ""
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
  /**
   * Where this is established: proposal text, political agreement, or, once an
   * item has been reconciled against the published OJ text, the enacted act.
   */
  sourceStatus: Extract<SourceStatus, "commission_proposal" | "political_agreement" | "enacted_oj">;
  /** Registry id of the source. */
  sourceId: string;
  /** Specific effective date in the proposal, if any (ISO). */
  effectiveDate?: string;
  /** Cautions, divergences, or items not yet verified. */
  note?: string;
}

export interface HighRiskTimelineShift {
  /**
   * The Commission proposal's conditional trigger, which was DELETED from the
   * enacted act. Retained so that analyses written from the proposal can be
   * recognised as superseded; it is not law and never was.
   */
  supersededProposalMechanism: string;
  /** Always "commission_proposal": the trigger existed only in the proposal. */
  supersededProposalMechanismSourceStatus: SourceStatus;
  /** The application dates in Art. 113(3)(c) as amended. Unconditional. */
  applicationDates: {
    annex_iii_art_6_2: string;
    annex_i_art_6_1: string;
  };
  /** Derived from the enactment record; "enacted_oj" once the act is in the OJ. */
  applicationDatesSourceStatus: SourceStatus;
  /** Pre-Omnibus OJ-law dates these replaced. */
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
    supersededProposalMechanism:
      "SUPERSEDED, NOT LAW. The Commission proposal COM(2025) 836 would have amended Art. 113 so that Chapter III high-risk obligations (Sections 1-3) applied only after a Commission decision confirming that adequate support measures (harmonised standards, common specifications, guidelines) were available: 6 months after that decision for Art. 6(2)/Annex III systems, 12 months after for Art. 6(1)/Annex I systems, with backstop dates if no decision came. Regulation (EU) 2026/1744 did NOT carry that trigger into law; item 40 of its Article 1 replaces Art. 113, third paragraph, point (c) with two plain calendar dates and no condition.",
    supersededProposalMechanismSourceStatus: "commission_proposal",
    applicationDates: {
      annex_iii_art_6_2: "2027-12-02",
      annex_i_art_6_1: "2028-08-02",
    },
    applicationDatesSourceStatus: resolveOmnibusStatus(omnibusEnactment),
    currentLaw: {
      annex_iii_art_6_2: "2026-08-02",
      annex_i_art_6_1: "2027-08-02",
    },
    note: "The enacted dates are UNCONDITIONAL calendar dates, not backstops. Art. 113, third paragraph, point (c) as amended reads: 'Chapter III, Sections 1, 2, and 3, with the exception of Article 6(5), shall apply from: (i) 2 December 2027 as regards AI systems classified as high-risk pursuant to Article 6(2) and Annex III; and (ii) 2 August 2028 as regards AI systems classified as high-risk pursuant to Article 6(1) and Annex I'. Nothing can pull either date forward. Recital 40 keeps the delayed availability of standards as the REASON for the deferral and states that the Commission should ensure support measures are in place in due time, but that is an undertaking addressed to the Commission, not an operative trigger. Any analysis still describing 2027-12-02 as a backstop reachable earlier by a Commission decision is reading the proposal, not the act.",
  },
  deltas: [
    // Reconciled against the ENACTED text of Regulation (EU) 2026/1744 (CELEX
    // 32026R1744) on 2026-07-27. Article 1 of that act amends Regulation (EU)
    // 2024/1689 at 43 numbered points; the item number is given for each delta
    // so a reader can find it in the OJ text. Every entry below was read in the
    // published act, not in the proposal or a tracker.
    {
      article: "Art. 4 (AI literacy)",
      change:
        "Art. 4 REPLACED (item 5). Paragraph 1 keeps the provider/deployer duty but recasts it as taking measures to SUPPORT THE DEVELOPMENT of AI literacy, and states expressly that the obligation does not require providers or deployers to guarantee any specific level of AI literacy of any individual. New paragraph 2 obliges the Commission and the Member States to support and facilitate that effort, in particular for SMEs, with practical compliance examples to be published on the single information platform.",
      sourceStatus: "enacted_oj",
      sourceId: "omnibus_oj",
      effectiveDate: "2026-07-27",
      note: "CORRECTED 2026-07-27. This entry previously carried the Commission proposal's version, which recast Art. 4 into a duty on the Commission and Member States alone. That is NOT what was enacted: the provider and deployer duty survives in softened form and the Commission/Member State duty was ADDED as paragraph 2. Treat the duty as one of demonstrable effort, not of measured competence.",
    },
    {
      article: "Art. 4a (new) / Art. 10(5) deleted",
      change:
        "New Art. 4a inserted (item 6) and Art. 10(5) deleted (item 9(b)): legal basis to exceptionally process special categories of personal data for bias detection and correction under six cumulative safeguards. Art. 4a(1) covers providers of high-risk systems; Art. 4a(2) extends the same route to DEPLOYERS of high-risk systems and to providers and deployers of other AI systems and models, while stating that it creates no obligation to conduct bias detection.",
      sourceStatus: "enacted_oj",
      sourceId: "omnibus_oj",
      effectiveDate: "2026-07-27",
    },
    {
      article: "Art. 5 (prohibited practices)",
      change:
        "Art. 5 amended (item 7): new points (ba) and (bb) in paragraph 1 prohibit AI systems that generate or manipulate realistic non-consensual intimate or sexually explicit material depicting an identifiable person, and child sexual abuse material within the meaning of Directive 2011/93/EU, plus new paragraphs 1a and 1b setting the provider/deployer scope and a manipulation carve-out that attaches to point (ba) only.",
      sourceStatus: "enacted_oj",
      sourceId: "omnibus_oj",
      effectiveDate: "2026-12-02",
      note: "The two new prohibitions apply from 2 December 2026 per the amended Art. 113, third paragraph, point (a). The original eight prohibitions have applied since 2 February 2025. This entry was previously tagged political_agreement and carried a caution against treating it as current Art. 5 law. That caution is obsolete: these are enacted prohibitions.",
    },
    {
      article: "Art. 3(14) / Art. 6(1a) to (1c)",
      change:
        "Safety-component gateway narrowed (items 4(a) and 8). Art. 3(14) now ties safety component to intended purpose. Art. 6(1a) excludes systems used solely for non-safety related user assistance, performance optimisation, service efficiency, automation, convenience or quality control; Art. 6(1b) pulls back in any system whose failure or malfunctioning would endanger health and safety; Art. 6(1c) means a product assessed by a third party SOLELY for risks other than health and safety, for example radio spectrum or electromagnetic interference, does not satisfy Art. 6(1)(b).",
      sourceStatus: "enacted_oj",
      sourceId: "omnibus_oj",
      effectiveDate: "2026-07-27",
    },
    {
      article: "Art. 2(2) / Annex I",
      change:
        "Annex I restructured (item 41): Section A point 1 (Machinery Directive 2006/42/EC) deleted and the Machinery Regulation (EU) 2023/1230 added as Section B point 21. Art. 2(2) rewritten (item 2(a)): for Section B products only Art. 6(1), the new Art. 60a and Arts. 102 to 112 apply, with Arts. 57 to 59 applying only in so far as the high-risk requirements have been integrated into that sectoral legislation.",
      sourceStatus: "enacted_oj",
      sourceId: "omnibus_oj",
      effectiveDate: "2026-07-27",
      note: "Practical effect: AI-enabled machinery leaves the full Chapter III regime for the sectoral route. Aviation, motor vehicles, rail and marine equipment were already Section B.",
    },
    {
      article: "Art. 2(13) (new)",
      change:
        "New Art. 2(13) (item 3): the requirements in Arts. 9 to 15 and 17 to 25 may be limited for Art. 6(1) systems where Annex I Section A legislation already provides equivalent or higher protection and the limitation does not reduce the overall level of protection. The Commission must adopt delegated acts specifying the systems, obligations and conditions by 2 August 2027.",
      sourceStatus: "enacted_oj",
      sourceId: "omnibus_oj",
      effectiveDate: "2026-07-27",
    },
    {
      article: "Art. 11(1) / Art. 17(2) / Art. 63(1)",
      change:
        "Documentation and quality-management simplification (items 10, 11, 26): simplified technical documentation for SMEs and SMCs, which notified bodies must accept as compliant, and proportionate quality-management obligations.",
      sourceStatus: "enacted_oj",
      sourceId: "omnibus_oj",
      effectiveDate: "2026-07-27",
    },
    {
      article: "Art. 25(2) and (4)",
      change:
        "Provider-switch cooperation (item 12): the initial provider ceases to be the provider of that system and must cooperate closely with the new provider, making available technical documentation, information, reasonably expected technical access and other assistance needed for conformity assessment. Third parties making tools or components available under a free and open-source licence are excluded, other than GPAI models. Art. 99(4) gains a new point (da) making breach of Art. 25(2) and (4) fineable.",
      sourceStatus: "enacted_oj",
      sourceId: "omnibus_oj",
      effectiveDate: "2026-07-27",
    },
    {
      article: "Art. 27(4) and (5)",
      change:
        "FRIA simplification (item 13): where an Art. 27 obligation is already met through a DPIA under Art. 35 GDPR or Art. 27 of Directive (EU) 2016/680, the deployer may include cross-references to, or relevant parts of, that DPIA in the FRIA. The AI Office is to develop a template questionnaire, including through an automated tool, allowing the same cross-references.",
      sourceStatus: "enacted_oj",
      sourceId: "omnibus_oj",
      effectiveDate: "2026-07-27",
      note: "Art. 27(3) was NOT amended: notification of the market surveillance authority is still owed on the results of every completed FRIA, with the Art. 46(1) case as the only exemption. It is not conditional on identifying a specific risk.",
    },
    {
      article: "Art. 28 / 29 / 30 (new Annex XIV)",
      change:
        "Single application and unified assessment for conformity assessment bodies seeking designation under both this Regulation and Annex I Section A legislation (items 14 to 16 and 43); notified-body applications use the new Annex XIV codes.",
      sourceStatus: "enacted_oj",
      sourceId: "omnibus_oj",
      effectiveDate: "2026-07-27",
    },
    {
      article: "Art. 43(3)",
      change:
        "Conformity-assessment routing for Annex I Section A systems (item 19). Notified bodies already notified under Section A legislation may assess AI Act conformity but must apply for designation under Section 4 of Chapter III by 28 January 2028. Classification as a high-risk AI system does not by itself force a third-party route where the sectoral act allows self-assessment against harmonised standards.",
      sourceStatus: "enacted_oj",
      sourceId: "omnibus_oj",
      effectiveDate: "2026-07-27",
    },
    {
      article: "Art. 49 / Art. 6(3) (registration duty)",
      change:
        "The Art. 49(2) registration duty for Annex III systems self-assessed as not high-risk under Art. 6(3) SURVIVES. The enacted act does not amend Art. 49 at all. It deletes only Annex VIII Section B points 7 and 9 (item 42), which simplifies the CONTENT of that registration.",
      sourceStatus: "enacted_oj",
      sourceId: "omnibus_oj",
      effectiveDate: "2026-07-27",
      note: "CORRECTED 2026-07-27. This entry previously stated, from the Commission proposal, that the registration duty was deleted, and carried it as the one item unresolved against the OJ text. The enacted text settles it the other way: the duty stands. Advising a provider that registration is no longer required would have been wrong.",
    },
    {
      article: "Art. 50(7) / Art. 56(6)",
      change:
        "Codes of practice (items 20 and 21). The empowerments to approve codes and give them general validity by implementing act are removed. The new Art. 56(6) is a monitoring, evaluation and published-adequacy-assessment duty on the Commission and the Board. Recital 41 states that these codes have limited legal effect and in particular do NOT grant a presumption of conformity; providers may rely on adequate codes to demonstrate compliance, and the presumption attaches to harmonised standards instead.",
      sourceStatus: "enacted_oj",
      sourceId: "omnibus_oj",
      effectiveDate: "2026-07-27",
      note: "Citation caution: recital 41 names Article 53(4) and Article 54(2) as the reliance routes, but Art. 54(2) governs the mandate of an authorised representative. The operative pair is Art. 53(4) for all GPAI providers and Art. 55(2) for systemic-risk models; both carry the may-rely-on-codes-of-practice wording.",
    },
    {
      article: "Art. 57 / 60 / 60a (new)",
      change:
        "Sandboxes and real-world testing (items 22, 24 and 25): national sandboxes must be operational by 2 August 2027, the EDPS may establish a sandbox for Union institutions, and a new Art. 60a is inserted, which is also one of the few provisions that applies to Annex I Section B products under the rewritten Art. 2(2).",
      sourceStatus: "enacted_oj",
      sourceId: "omnibus_oj",
      effectiveDate: "2026-07-27",
    },
    {
      article: "Art. 72(3)",
      change:
        "Post-market monitoring (item 30): the empowerment to adopt a binding monitoring-plan template is replaced. The plan remains part of the Annex IV technical documentation, and the Commission is to adopt guidance including a template by 2 September 2027.",
      sourceStatus: "enacted_oj",
      sourceId: "omnibus_oj",
      effectiveDate: "2026-07-27",
    },
    {
      article: "Art. 75 and new Arts. 75a to 75d",
      change:
        "AI Office supervision centralised (items 31 and 32) for AI systems built on a GPAI model where model and system share a provider, and for systems embedded in designated VLOPs and VLOSEs, with new investigation and fining powers. New Art. 75(1a) routes serious-incident reporting for those systems to the AI Office by derogation from Art. 73.",
      sourceStatus: "enacted_oj",
      sourceId: "omnibus_oj",
      effectiveDate: "2026-07-27",
    },
    {
      article: "Art. 95(4) / Art. 96(1) / Art. 99",
      change:
        "SME and SMC treatment (items 35, 36 and 38): voluntary support tools and Commission guidance take small mid-caps into account alongside SMEs, and new Art. 99(6a) caps fines for SMCs at the lower of the percentage or the fixed amount for the Art. 99(4) and 99(5) tiers only. It is narrower than the Art. 99(6) SME rule, which also covers the Art. 99(3) prohibited-practice tier; an SMC gets no lower cap on an Art. 5 fine.",
      sourceStatus: "enacted_oj",
      sourceId: "omnibus_oj",
      effectiveDate: "2026-07-27",
    },
    {
      article: "Art. 111(2)",
      change:
        "Legacy high-risk grandfathering replaced (item 39(a)): the cut-off is now the date of application of Chapter III under Art. 113 rather than a fixed 2 August 2026, and the trigger is a significant change in design as from that date. Providers and deployers of high-risk systems intended for use by public authorities must still comply by 2 August 2030.",
      sourceStatus: "enacted_oj",
      sourceId: "omnibus_oj",
      effectiveDate: "2026-07-27",
    },
    {
      article: "Art. 111(4) (new) / Art. 50(2)",
      change:
        "Transition for synthetic-content systems already on the market (item 39(b)): providers of AI systems, including general-purpose AI systems, generating synthetic audio, image, video or text content that were placed on the market before 2 Aug 2026 shall take the necessary steps in order to comply with Art. 50(2) by 2 Dec 2026. Art. 50(2) itself is unamended and still applies from 2 Aug 2026 to systems placed on the market from that date.",
      sourceStatus: "enacted_oj",
      sourceId: "omnibus_oj",
      effectiveDate: "2026-12-02",
      note: "RECONCILED ON OJ (2026-07-26): the transition date is 2 Dec 2026, confirming the external trackers; the proposal's 2 Feb 2027 was not carried into the adopted act and that string does not appear in the published regulation.",
    },
    {
      article: "Art. 113, third paragraph",
      change:
        "Application dates re-cut (item 40): point (c) is replaced so that Chapter III, Sections 1, 2 and 3, except Art. 6(5), apply from 2 December 2027 for Annex III / Art. 6(2) high-risk systems and from 2 August 2028 for Annex I / Art. 6(1) high-risk systems. Both are unconditional calendar dates. Point (a) is replaced to carve the new Art. 5(1)(ba), (bb) and Art. 5(1a), (1b) prohibitions out to 2 December 2026, and a new point (d) applies Arts. 102 to 110 from 27 July 2026.",
      sourceStatus: "enacted_oj",
      sourceId: "omnibus_oj",
      effectiveDate: "2026-07-27",
      note: "The proposal's conditional trigger (application 6 or 12 months after a Commission decision on the availability of support measures) was DELETED and does NOT appear in the enacted act; 2027-12-02 and 2028-08-02 are fixed dates, not backstops. Verified against the OJ text on 2026-07-29. NOT deferred: Art. 50 transparency and the Commission's GPAI enforcement powers and fines stay on 2 August 2026, and the legacy GPAI compliance date in Art. 111(3) stays 2 August 2027.",
    },
  ],
  coverageNote:
    "Curated, NON-EXHAUSTIVE selection of the most decision-relevant amendments, reconciled against the ENACTED text on 2026-07-27. Article 1 of Regulation (EU) 2026/1744 amends Regulation (EU) 2024/1689 at 43 numbered points; the entries here cover the decision-relevant ones and cite the item number. Consult the OJ text (CELEX 32026R1744) for the complete list, in particular the amendments to Arts. 29, 30, 40, 42, 58, 64, 69, 70, 76, 77 and 97 which are not itemised here.",
  warning: isOmnibusEnacted(omnibusEnactment)
    ? `Enacted: published in the Official Journal on ${omnibusEnactment.ojPublicationDate} (CELEX ${omnibusEnactment.celex}), in force since ${omnibusEnactment.entryIntoForce}. The amended dates are operative law and are reflected in the milestone timeline. Every delta below was reconciled against the enacted OJ text on 2026-07-27 and carries its amending item number; quote the OJ text itself for exact wording.`
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
      ? `Digital Omnibus on AI. Commission proposal COM(2025) 836 final (CELEX 52025PC0836, 19 Nov 2025, procedure 2025/0359(COD)) amending Regulation (EU) 2024/1689. Politically agreed 7 May 2026; adopted act dated ${e.actDate} (Done at Strasbourg), published in the Official Journal on ${e.ojPublicationDate} (CELEX ${e.celex}) and in force since ${e.entryIntoForce}. Co-legislator steps for provenance: European Parliament ${e.epEndorsement}, Council ${e.councilAdoption}, both sourced from the Council press release rather than from the act itself.`
      : `Digital Omnibus on AI. Commission proposal COM(2025) 836 final (CELEX 52025PC0836, 19 Nov 2025, procedure 2025/0359(COD)) amending Regulation (EU) 2024/1689. Politically agreed on 7 May 2026 and since FORMALLY ADOPTED by both co-legislators: European Parliament endorsement ${e.epEndorsement}, Council final adoption ${e.councilAdoption}. Not yet in force: it takes legal effect on publication in the Official Journal (entry into force the third day after publication). Until then current OJ law governs.`,
    keyChanges: enacted
      ? [
          "High-risk Annex III (Art. 6(2)) obligations: deferred from 2 Aug 2026 to 2 Dec 2027 by Art. 113(3)(c)(i) as amended. An unconditional date: the proposal's trigger tying application to a Commission decision on support measures was deleted and is not in the act.",
          "High-risk Annex I (Art. 6(1)) obligations: deferred from 2 Aug 2027 to 2 Aug 2028 by Art. 113(3)(c)(ii) as amended, likewise unconditional.",
          "NOT deferred: Art. 50 transparency and the Commission's GPAI enforcement powers and fines stay on 2 Aug 2026; the legacy GPAI compliance date in Art. 111(3) stays 2 Aug 2027.",
          "New Art. 111(4): systems generating synthetic content placed on the market before 2 Aug 2026 must comply with Art. 50(2) by 2 Dec 2026. Art. 50(2) itself still applies from 2 Aug 2026 to later systems.",
          "New Art. 5(1) points (ba) and (bb) plus Art. 5(1a) and (1b): non-consensual intimate material and CSAM prohibitions, applying from 2 Dec 2026.",
          "Art. 6 gains paragraphs 1a to 1c narrowing the safety-component gateway; Art. 3(14) gains an intended-purpose test.",
          "Art. 111(2) replaced: the high-risk grandfathering cutoff now moves with the new application dates instead of being fixed at 2 Aug 2026.",
          "Art. 75 replaced plus new Arts. 75a to 75d: AI Office exclusive competence for GPAI-based and VLOP/VLOSE-embedded systems, with new investigation and fining powers. New Art. 75(1a) routes serious-incident reporting for those systems to the AI Office by derogation from Art. 73.",
          "Art. 56(6) replaced: the power to give a GPAI code of practice general validity by implementing act is deleted; codes grant no presumption of conformity.",
          "Art. 27(4) and (5) replaced: DPIA cross-referencing allowed inside the FRIA, and an AI Office template questionnaire including an automated tool.",
          "Annex I: Section A point 1 deleted and the Machinery Regulation (EU) 2023/1230 added as Section B point 21, so the AI Act applies to those machines only as set out in Art. 2(2), itself rewritten by this act.",
          "Art. 4 replaced: the provider and deployer duty survives but becomes one of taking measures to SUPPORT THE DEVELOPMENT of AI literacy, and the text states expressly that no specific level of literacy in any individual must be guaranteed. New Art. 4(2) adds a Commission and Member State support duty. New Art. 4a replaces the deleted Art. 10(5) on special-category data for bias detection, and extends that route to deployers of high-risk systems.",
          "Art. 99: SME penalty privileges extended to small mid-caps.",
          "Art. 113(3)(d) added: Articles 102 to 110 apply from 27 July 2026, pulled forward rather than deferred.",
          "Art. 49 is NOT amended: the Art. 49(2) registration duty for Annex III systems self-assessed as not high-risk under Art. 6(3) survives. Only Annex VIII Section B points 7 and 9 are deleted, simplifying what that registration must contain. The proposal would have deleted the duty; the enacted act did not.",
          "Also amended and not itemised above: Arts. 2(13), 11(1), 17(2), 25(2) and (4), 28 to 30, 40, 42, 43(3), 50(7), 57, 58, 60, new 60a, 63(1), 64, 69, 70, 72(3), 76, 77, 95(4), 96(1), 97 and new Annex XIV.",
        ]
      : [
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
