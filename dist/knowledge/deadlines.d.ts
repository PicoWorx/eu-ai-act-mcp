/**
 * EU AI Act - Key Milestones and Deadlines
 *
 * Source: Regulation (EU) 2024/1689
 */
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
export type { LegislativeProposal, DigitalOmnibusPack, OmnibusDelta } from "./digital-omnibus.js";
export { digitalOmnibusPack, omnibusSummary as digitalOmnibus } from "./digital-omnibus.js";
export declare function getMilestonesWithDaysRemaining(): MilestoneWithDaysRemaining[];
//# sourceMappingURL=deadlines.d.ts.map