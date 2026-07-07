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
import { digitalOmnibusPack, isOmnibusEnacted, omnibusEnactment, resolveOmnibusStatus, } from "./digital-omnibus.js";
// ---------------------------------------------------------------------------
// Milestone Timeline
// ---------------------------------------------------------------------------
export const milestones = [
    {
        date: "2024-08-01",
        name: "Entry into force",
        description: "The EU AI Act (Regulation 2024/1689) entered into force on 1 August 2024, 20 days after publication in the Official Journal of the EU on 12 July 2024.",
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
        description: "The prohibition of unacceptable-risk AI practices under Art. 5 and the AI literacy obligation under Art. 4 apply from 2 February 2025 (6 months after entry into force).",
        status: "in_effect",
        articles: ["Art. 5", "Art. 4", "Art. 113(a)"],
        keyObligations: [
            "All prohibited AI practices (Art. 5) must cease",
            "Providers and deployers must ensure AI literacy of staff (Art. 4)",
            "Subliminal manipulation, exploitation of vulnerabilities, social scoring, untargeted facial scraping, emotion recognition in workplaces/schools - all banned",
        ],
    },
    {
        date: "2025-08-02",
        name: "GPAI model obligations and governance",
        description: "Obligations for providers of general-purpose AI models (Art. 51-56) apply from 2 August 2025 for new models, subject to the Art. 111(3) transition for GPAI models placed on the market before that date. Governance structures including the AI Office, AI Board, and advisory forum become operational. Chapter XII penalties also apply from this date, except Art. 101.",
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
        description: "The full set of obligations for high-risk AI systems listed in Annex III applies from 2 August 2026 (24 months after entry into force). This is the major compliance deadline for most organisations.",
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
        description: "Obligations for high-risk AI systems that are safety components of products covered by existing EU harmonisation legislation listed in Annex I (e.g. medical devices, machinery, toys, lifts, radio equipment) apply from 2 August 2027 (36 months after entry into force).",
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
export { digitalOmnibusPack, omnibusSummary as digitalOmnibus, omnibusEnactment, isOmnibusEnacted, resolveOmnibusStatus, buildOmnibusSummary, omnibusStatusLine, getEffectiveSourceRegistry, } from "./digital-omnibus.js";
/**
 * The operative deadline dates, derived from the enactment record. With the
 * committed pending record this returns the current-law dates (2 Aug 2026 /
 * 2 Aug 2027). With a filled, enacted record it returns the deferred Omnibus
 * dates (2 Dec 2027 / 2 Aug 2028) from the pack's backstop, while the
 * never-deferred dates stay fixed.
 */
export function getOperativeHighRiskDates(enactment = omnibusEnactment) {
    const enacted = isOmnibusEnacted(enactment);
    const timeline = digitalOmnibusPack.highRiskTimeline;
    return {
        omnibusEnacted: enacted,
        omnibusStatus: resolveOmnibusStatus(enactment),
        annexIiiHighRisk: enacted ? timeline.backstop.annex_iii_art_6_2 : timeline.currentLaw.annex_iii_art_6_2,
        annexIHighRisk: enacted ? timeline.backstop.annex_i_art_6_1 : timeline.currentLaw.annex_i_art_6_1,
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
function buildEnactedMilestones(enactment) {
    const dates = getOperativeHighRiskDates(enactment);
    return [
        milestones[0],
        milestones[1],
        milestones[2],
        {
            date: dates.art50Transparency,
            name: "Art. 50 transparency and GPAI enforcement (not deferred)",
            description: "Art. 50 transparency obligations and the Commission's enforcement powers and fines for GPAI providers (Arts. 99-101) apply from 2 August 2026. The Digital Omnibus did NOT defer these; only the Annex III and Annex I high-risk application dates moved.",
            status: "upcoming",
            articles: ["Art. 50", "Art. 99", "Art. 100", "Art. 101", "Art. 113"],
            keyObligations: [
                "Limited-risk transparency obligations (Art. 50), including informing persons they interact with AI",
                "Commission enforcement powers and fines for GPAI providers begin (Arts. 99-101)",
                "Art. 101 GPAI fines apply from this date",
            ],
        },
        {
            date: dates.legacyGpaiCompliance,
            name: "Legacy GPAI compliance deadline (unchanged)",
            description: "GPAI models placed on the market before 2 August 2025 must comply by 2 August 2027 (Art. 111(3)). The Digital Omnibus did not change this date.",
            status: "upcoming",
            articles: ["Art. 111(3)"],
            keyObligations: [
                "Providers of GPAI models placed on the market before 2 August 2025 complete compliance (Art. 111(3))",
            ],
        },
        {
            date: dates.annexIiiHighRisk,
            name: "High-risk Annex III obligations (deferred by the Digital Omnibus)",
            description: `The full set of obligations for high-risk AI systems listed in Annex III applies from 2 December 2027, as deferred by the Digital Omnibus on AI (CELEX ${enactment.celex}, published in the Official Journal on ${enactment.ojPublicationDate}, in force since ${enactment.entryIntoForce}). Art. 50 transparency and the Commission's GPAI enforcement powers were NOT deferred and apply since 2 August 2026.`,
            status: "upcoming",
            articles: [
                "Art. 6", "Art. 9", "Art. 10", "Art. 11", "Art. 12", "Art. 13",
                "Art. 14", "Art. 15", "Art. 16", "Art. 17", "Art. 26", "Art. 27",
                "Art. 43", "Art. 47", "Art. 49", "Art. 72", "Art. 73",
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
            description: `Obligations for high-risk AI systems that are safety components of products covered by existing EU harmonisation legislation listed in Annex I (e.g. medical devices, machinery, toys, lifts, radio equipment) apply from 2 August 2028, as deferred by the Digital Omnibus on AI (CELEX ${enactment.celex}).`,
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
export function getOperativeMilestones(enactment = omnibusEnactment) {
    return isOmnibusEnacted(enactment) ? buildEnactedMilestones(enactment) : milestones;
}
// ---------------------------------------------------------------------------
// Helper Function
// ---------------------------------------------------------------------------
export function getMilestonesWithDaysRemaining(enactment = omnibusEnactment) {
    const now = new Date();
    // Normalise to start of day in UTC for consistent calculation
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    return getOperativeMilestones(enactment).map((milestone) => {
        const milestoneDate = new Date(milestone.date + "T00:00:00Z");
        const diffMs = milestoneDate.getTime() - today.getTime();
        const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return {
            ...milestone,
            daysRemaining,
            isPast: daysRemaining <= 0,
        };
    });
}
//# sourceMappingURL=deadlines.js.map