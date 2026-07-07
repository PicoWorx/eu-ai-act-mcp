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
import { type OmnibusEnactment } from "./digital-omnibus.js";
import type { SourceStatus } from "./sources.js";
export interface Milestone {
    date: string;
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
export declare const milestones: Milestone[];
export type { LegislativeProposal, DigitalOmnibusPack, OmnibusDelta, OmnibusEnactment } from "./digital-omnibus.js";
export { digitalOmnibusPack, omnibusSummary as digitalOmnibus, omnibusEnactment, isOmnibusEnacted, resolveOmnibusStatus, buildOmnibusSummary, omnibusStatusLine, getEffectiveSourceRegistry, } from "./digital-omnibus.js";
export interface OperativeHighRiskDates {
    omnibusEnacted: boolean;
    omnibusStatus: SourceStatus;
    /** Operative current-law date for Annex III (Art. 6(2)) high-risk obligations. */
    annexIiiHighRisk: string;
    /** Operative current-law date for Annex I (Art. 6(1)) high-risk obligations. */
    annexIHighRisk: string;
    /** Art. 50 transparency: NOT deferred by the Omnibus, stays 2 Aug 2026. */
    art50Transparency: string;
    /** Commission enforcement powers and fines for GPAI: NOT deferred, stays 2 Aug 2026. */
    gpaiEnforcementFines: string;
    /** Legacy GPAI (models placed before 2 Aug 2025, Art. 111(3)): NOT deferred, stays 2 Aug 2027. */
    legacyGpaiCompliance: string;
}
/**
 * The operative deadline dates, derived from the enactment record. With the
 * committed pending record this returns the current-law dates (2 Aug 2026 /
 * 2 Aug 2027). With a filled, enacted record it returns the deferred Omnibus
 * dates (2 Dec 2027 / 2 Aug 2028) from the pack's backstop, while the
 * never-deferred dates stay fixed.
 */
export declare function getOperativeHighRiskDates(enactment?: OmnibusEnactment): OperativeHighRiskDates;
/**
 * The operative milestone timeline. Pending record (committed default):
 * the current-law milestones, byte-identical to the pre-flip behaviour.
 * Enacted record: the deferred-dates set from `buildEnactedMilestones`.
 */
export declare function getOperativeMilestones(enactment?: OmnibusEnactment): Milestone[];
export declare function getMilestonesWithDaysRemaining(enactment?: OmnibusEnactment): MilestoneWithDaysRemaining[];
//# sourceMappingURL=deadlines.d.ts.map