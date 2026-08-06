/**
 * EU AI Act - Key Milestones and Deadlines
 *
 * Source: Regulation (EU) 2024/1689
 *
 * Single-source enactment flip (audit item M3): the operative milestone set
 * is derived from the `omnibusEnactment` record in digital-omnibus.ts via
 * `getOperativeMilestones()`. While that record is pending (the committed
 * default), the current-law milestones below are served unchanged. When the
 * record is filled on OJ publication, the deferred Digital Omnibus dates
 * (Annex III 2 Dec 2027, Annex I 2 Aug 2028) become operative automatically;
 * Art. 50 transparency, GPAI enforcement/fines (2 Aug 2026), and the legacy
 * GPAI compliance date (2 Aug 2027) are NOT deferred.
 */

import {
  digitalOmnibusPack,
  isOmnibusEnacted,
  omnibusEnactment,
  resolveOmnibusStatus,
  type OmnibusEnactment,
} from "./digital-omnibus.js";
import type { SourceStatus } from "./sources.js";

export interface Milestone {
  date: string; // ISO date
  name: string;
  description: string;
  status: "in_effect" | "upcoming" | "proposal_only";
  articles: string[];
  keyObligations: string[];
}

export interface MilestoneWithDaysRemaining extends Milestone {
  daysRemaining: number;
  isPast: boolean;
}

// ---------------------------------------------------------------------------
// Milestone Timeline
// ---------------------------------------------------------------------------

export const milestones: Milestone[] = [
  {
    date: "2024-08-01",
    name: "Entry into force",
    description:
      "The EU AI Act (Regulation 2024/1689) entered into force on 1 August 2024, 20 days after publication in the Official Journal of the EU on 12 July 2024.",
    status: "in_effect",
    articles: ["Art. 113"],
    keyObligations: [
      "Regulation published and legally binding",
      "Phased application timeline begins",
    ],
  },
  {
    date: "2025-02-02",
    name: "Prohibited practices and AI literacy",
    description:
      "The prohibition of unacceptable-risk AI practices under Art. 5 and the AI literacy obligation under Art. 4 apply from 2 February 2025 (6 months after entry into force).",
    status: "in_effect",
    articles: ["Art. 5", "Art. 4", "Art. 113(a)"],
    keyObligations: [
      "All prohibited AI practices (Art. 5) must cease",
      "Providers and deployers must take measures to support the development of AI literacy of staff (Art. 4, as replaced with effect from 27 July 2026; no specific level of literacy must be guaranteed)",
      "Subliminal manipulation, exploitation of vulnerabilities, social scoring, untargeted facial scraping, emotion recognition in workplaces/schools - all banned",
    ],
  },
  {
    date: "2025-08-02",
    name: "GPAI model obligations and governance",
    description:
      "Obligations for providers of general-purpose AI models (Art. 51-56) apply from 2 August 2025 for new models, subject to the Art. 111(3) transition for GPAI models placed on the market before that date. Governance structures including the AI Office, AI Board, and advisory forum become operational. Chapter XII penalties also apply from this date, except Art. 101.",
    status: "in_effect",
    articles: [
      "Art. 51", "Art. 52", "Art. 53", "Art. 54", "Art. 55", "Art. 56",
      "Art. 64", "Art. 65", "Art. 66", "Art. 67",
      "Art. 99", "Art. 100", "Art. 113(b)",
    ],
    keyObligations: [
      "GPAI providers must publish training data summaries",
      "GPAI models placed on the market before 2 August 2025 have an Art. 111(3) transition until 2 August 2027",
      "Technical documentation for GPAI models required",
      "Copyright compliance policies must be in place",
      "Systemic risk GPAI models: additional evaluation, testing, incident reporting, and cybersecurity obligations",
      "AI Office and AI Board operational",
      "Codes of practice for GPAI expected to be finalised",
      "Chapter XII penalty framework applies, except Art. 101",
    ],
  },
  {
    date: "2026-08-02",
    name: "High-risk Annex III obligations",
    description:
      "The full set of obligations for high-risk AI systems listed in Annex III applies from 2 August 2026 (24 months after entry into force). This is the major compliance deadline for most organisations.",
    status: "upcoming",
    articles: [
      "Art. 6", "Art. 9", "Art. 10", "Art. 11", "Art. 12", "Art. 13",
      "Art. 14", "Art. 15", "Art. 16", "Art. 17", "Art. 26", "Art. 27",
      "Art. 43", "Art. 47", "Art. 49", "Art. 50", "Art. 72", "Art. 73",
      "Art. 101",
    ],
    keyObligations: [
      "Risk management systems for high-risk AI",
      "Data governance and management practices",
      "Technical documentation (Annex IV)",
      "Automatic logging and record-keeping",
      "Transparency and instructions for deployers",
      "Human oversight measures",
      "Accuracy, robustness, and cybersecurity requirements",
      "Quality management systems",
      "Conformity assessments",
      "EU database registration",
      "Deployer obligations including FRIA",
      "Limited risk transparency obligations (Art. 50)",
      "Post-market monitoring and incident reporting",
      "Art. 101 GPAI fines follow the general application date",
    ],
  },
  {
    date: "2027-08-02",
    name: "Annex I regulated product obligations",
    description:
      "Obligations for high-risk AI systems that are safety components of products covered by existing EU harmonisation legislation listed in Annex I (e.g. medical devices, machinery, toys, lifts, radio equipment) apply from 2 August 2027 (36 months after entry into force).",
    status: "upcoming",
    articles: ["Art. 6(1)", "Art. 113(b)", "Annex I"],
    keyObligations: [
      "AI safety components in regulated products must comply",
      "Integration with existing CE marking and conformity assessment procedures",
      "Covers: medical devices, machinery, toys, lifts, pressure equipment, radio equipment, civil aviation, motor vehicles, and more",
      "Third-party conformity assessment aligned with sectoral legislation",
    ],
  },
];

// ---------------------------------------------------------------------------
// Digital Omnibus (source-state-aware)
// ---------------------------------------------------------------------------
//
// The structured, verified pack lives in `digital-omnibus.ts`. The legacy
// `digitalOmnibus` summary is derived from it (`omnibusSummary`) so the two
// never drift, and the richer pack is re-exported for the pending-mode output.

export type { LegislativeProposal, DigitalOmnibusPack, OmnibusDelta, OmnibusEnactment } from "./digital-omnibus.js";
export {
  digitalOmnibusPack,
  omnibusSummary as digitalOmnibus,
  omnibusEnactment,
  isOmnibusEnacted,
  resolveOmnibusStatus,
  buildOmnibusSummary,
  omnibusStatusLine,
  getEffectiveSourceRegistry,
} from "./digital-omnibus.js";

// ---------------------------------------------------------------------------
// Derived enactment-flip mechanism (audit item M3) - DORMANT until the
// omnibusEnactment record is filled on OJ publication.
// ---------------------------------------------------------------------------

export interface OperativeHighRiskDates {
  omnibusEnacted: boolean;
  omnibusStatus: SourceStatus;
  /** Operative current-law date for Annex III (Art. 6(2)) high-risk obligations. */
  annexIiiHighRisk: string;
  /** Operative current-law date for Annex I (Art. 6(1)) high-risk obligations. */
  annexIHighRisk: string;
  /** Art. 50 transparency: NOT deferred by the Omnibus, stays 2 Aug 2026. */
  art50Transparency: string;
  /** Commission GPAI supervision (Arts. 88-94) and Art. 101 fines: NOT deferred, stays 2 Aug 2026. Arts. 99-100 apply since 2 Aug 2025 (Art. 113(3)(b)). */
  gpaiEnforcementFines: string;
  /** Legacy GPAI (models placed before 2 Aug 2025, Art. 111(3)): NOT deferred, stays 2 Aug 2027. */
  legacyGpaiCompliance: string;
}

/**
 * The operative deadline dates, derived from the enactment record. With the
 * committed pending record this returns the current-law dates (2 Aug 2026 /
 * 2 Aug 2027). With a filled, enacted record it returns the deferred Omnibus
 * dates (2 Dec 2027 / 2 Aug 2028) from the pack's applicationDates, while the
 * never-deferred dates stay fixed.
 */
export function getOperativeHighRiskDates(
  enactment: OmnibusEnactment = omnibusEnactment,
): OperativeHighRiskDates {
  const enacted = isOmnibusEnacted(enactment);
  const timeline = digitalOmnibusPack.highRiskTimeline;
  return {
    omnibusEnacted: enacted,
    omnibusStatus: resolveOmnibusStatus(enactment),
    annexIiiHighRisk: enacted ? timeline.applicationDates.annex_iii_art_6_2 : timeline.currentLaw.annex_iii_art_6_2,
    annexIHighRisk: enacted ? timeline.applicationDates.annex_i_art_6_1 : timeline.currentLaw.annex_i_art_6_1,
    art50Transparency: "2026-08-02",
    gpaiEnforcementFines: "2026-08-02",
    legacyGpaiCompliance: "2027-08-02",
  };
}

/**
 * Milestone set for the enacted state. Built from the enactment record so the
 * descriptions cite the real CELEX and OJ date once they exist. The 2 Aug 2026
 * milestone is NOT dropped: it is re-scoped to what the Omnibus did NOT defer
 * (Art. 50 transparency, GPAI enforcement and fines), and the legacy GPAI
 * compliance date keeps its own 2 Aug 2027 anchor.
 */
function buildEnactedMilestones(enactment: OmnibusEnactment): Milestone[] {
  const dates = getOperativeHighRiskDates(enactment);
  return [
    milestones[0],
    milestones[1],
    milestones[2],
    {
      date: dates.art50Transparency,
      name: "Art. 50 transparency and GPAI enforcement (not deferred)",
      description:
        "Art. 50 transparency obligations, the Commission's supervisory and enforcement powers over general-purpose AI models (Arts. 88-94), and the Art. 101 GPAI fines apply from 2 August 2026. Arts. 99 and 100, the general penalties framework and EDPS fines, have applied since 2 August 2025 under Art. 113, third paragraph, point (b), which excepts only Art. 101 from that earlier date. The Digital Omnibus did NOT defer any of these; only the Annex III and Annex I high-risk application dates moved.",
      status: "upcoming",
      articles: ["Art. 50", "Art. 88-94", "Art. 101", "Art. 113"],
      keyObligations: [
        "Limited-risk transparency obligations (Art. 50), including informing persons they interact with AI",
        "Commission supervisory and enforcement powers over GPAI providers begin (Arts. 88-94)",
        "Art. 101 GPAI fines apply from this date",
      ],
    },
    {
      date: "2026-12-02",
      name: "New Art. 5 prohibitions and the Art. 50(2) legacy transition",
      description:
        "Two obligations introduced by the Digital Omnibus on AI apply from 2 December 2026. First, the new prohibited practices in Art. 5(1)(ba) and (bb), covering non-consensual intimate material and child sexual abuse material, subject to the qualifications in Art. 5(1a) and (1b). Second, under the new Art. 111(4), providers of AI systems generating synthetic audio, image, video or text content that were placed on the market before 2 August 2026 must have taken the necessary steps to comply with Art. 50(2) by this date. Art. 50(2) itself already applies from 2 August 2026 to systems placed on the market from that date.",
      status: "upcoming",
      articles: ["Art. 5(1)(ba)", "Art. 5(1)(bb)", "Art. 5(1a)", "Art. 5(1b)", "Art. 50(2)", "Art. 111(4)"],
      keyObligations: [
        "New Art. 5 prohibitions on non-consensual intimate material and CSAM become enforceable",
        "Synthetic-content systems already on the market complete Art. 50(2) marking compliance",
      ],
    },
    {
      date: dates.legacyGpaiCompliance,
      name: "Legacy GPAI compliance deadline (unchanged)",
      description:
        "GPAI models placed on the market before 2 August 2025 must comply by 2 August 2027 (Art. 111(3)). The Digital Omnibus did not change this date.",
      status: "upcoming",
      articles: ["Art. 111(3)"],
      keyObligations: [
        "Providers of GPAI models placed on the market before 2 August 2025 complete compliance (Art. 111(3))",
      ],
    },
    {
      date: dates.annexIiiHighRisk,
      name: "High-risk Annex III obligations (deferred by the Digital Omnibus)",
      description:
        `The full set of obligations for high-risk AI systems listed in Annex III applies from 2 December 2027, as deferred by the Digital Omnibus on AI (CELEX ${enactment.celex}, published in the Official Journal on ${enactment.ojPublicationDate}, in force since ${enactment.entryIntoForce}). This is a fixed date, not a backstop: Art. 113(3)(c)(i) as amended sets it unconditionally, and the Commission proposal's trigger that would have brought the obligations forward six months after a decision on the availability of support measures was deleted before adoption. Art. 50 transparency and the Commission's GPAI enforcement powers were NOT deferred and apply since 2 August 2026. Conformity assessment (Art. 43), the EU declaration of conformity (Art. 47), registration (Art. 49), post-market monitoring (Art. 72) and serious-incident reporting (Art. 73) formally apply since 2 August 2026 under Art. 113, second paragraph; for Annex III systems they are practically triggered by the Art. 6(2) classification, which applies from this date.`,
      status: "upcoming",
      articles: [
        "Art. 6", "Art. 9", "Art. 10", "Art. 11", "Art. 12", "Art. 13",
        "Art. 14", "Art. 15", "Art. 16", "Art. 17", "Art. 26", "Art. 27",
      ],
      keyObligations: [
        "Risk management systems for high-risk AI",
        "Data governance and management practices",
        "Technical documentation (Annex IV)",
        "Automatic logging and record-keeping",
        "Transparency and instructions for deployers",
        "Human oversight measures",
        "Accuracy, robustness, and cybersecurity requirements",
        "Quality management systems",
        "Conformity assessments",
        "EU database registration",
        "Deployer obligations including FRIA",
        "Post-market monitoring and incident reporting",
      ],
    },
    {
      date: dates.annexIHighRisk,
      name: "Annex I regulated product obligations (deferred by the Digital Omnibus)",
      description:
        `Obligations for high-risk AI systems that are safety components of products covered by existing EU harmonisation legislation listed in Annex I (e.g. medical devices, machinery, toys, lifts, radio equipment) apply from 2 August 2028, as deferred by the Digital Omnibus on AI (CELEX ${enactment.celex}).`,
      status: "upcoming",
      articles: ["Art. 6(1)", "Annex I"],
      keyObligations: [
        "AI safety components in regulated products must comply",
        "Integration with existing CE marking and conformity assessment procedures",
        "Covers: medical devices, machinery, toys, lifts, pressure equipment, radio equipment, civil aviation, motor vehicles, and more",
        "Third-party conformity assessment aligned with sectoral legislation",
      ],
    },
  ];
}

/**
 * The operative milestone timeline. Pending record (committed default):
 * the current-law milestones, byte-identical to the pre-flip behaviour.
 * Enacted record: the deferred-dates set from `buildEnactedMilestones`.
 */
export function getOperativeMilestones(enactment: OmnibusEnactment = omnibusEnactment): Milestone[] {
  return isOmnibusEnacted(enactment) ? buildEnactedMilestones(enactment) : milestones;
}

// ---------------------------------------------------------------------------
// Helper Function
// ---------------------------------------------------------------------------

export function getMilestonesWithDaysRemaining(
  enactment: OmnibusEnactment = omnibusEnactment,
): MilestoneWithDaysRemaining[] {
  const now = new Date();
  // UTC getters throughout: the boundary day must not depend on the host timezone.
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  return getOperativeMilestones(enactment).map((milestone) => {
    const milestoneDate = new Date(milestone.date + "T00:00:00Z");
    const diffMs = milestoneDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const isPast = daysRemaining <= 0;

    return {
      ...milestone,
      // status is DERIVED from the clock, never served from the stored literal,
      // so a milestone can no longer be reported "upcoming" after its date.
      status: milestone.status === "proposal_only" ? milestone.status : isPast ? "in_effect" : "upcoming",
      daysRemaining,
      isPast,
    };
  });
}
