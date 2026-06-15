/**
 * EU AI Act - Penalty Framework
 *
 * Source: Regulation (EU) 2024/1689, Art. 99-101
 */
export interface PenaltyTier {
    id: string;
    name: string;
    maxFineEUR: number;
    globalTurnoverPercentage: number;
    article: string;
    description: string;
    applicableTo: string[];
    examples: string[];
    smeLowerApplies?: boolean;
}
export interface SMEReduction {
    entityType: string;
    description: string;
    article: string;
    details: string;
}
export interface PenaltyFramework {
    tiers: PenaltyTier[];
    smeReductions: SMEReduction[];
    enforcementDate: string;
    enforcementAuthority: string;
    notes: string[];
}
export type PenaltyViolationType = "prohibited" | "high_risk" | "gpai" | "false_info";
export declare const penaltyFramework: PenaltyFramework;
export declare function getPenaltyTier(violationType: PenaltyViolationType): PenaltyTier;
export declare function calculateMaxFine(violationType: PenaltyViolationType, annualTurnoverEUR: number, isSME?: boolean): {
    fixedCap: number;
    turnoverBased: number;
    applicableFine: number;
};
//# sourceMappingURL=penalties.d.ts.map