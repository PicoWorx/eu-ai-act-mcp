import { z } from "zod";
export declare const penaltiesInputSchema: z.ZodObject<{
    violation_type: z.ZodEnum<["prohibited", "high_risk", "gpai", "false_info"]>;
    annual_turnover_eur: z.ZodNumber;
    is_sme: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    violation_type: "gpai" | "prohibited" | "high_risk" | "false_info";
    annual_turnover_eur: number;
    is_sme: boolean;
}, {
    violation_type: "gpai" | "prohibited" | "high_risk" | "false_info";
    annual_turnover_eur: number;
    is_sme?: boolean | undefined;
}>;
export declare const penaltiesOutputSchema: z.ZodObject<{
    violation_type: z.ZodString;
    is_sme: z.ZodBoolean;
    annual_turnover_eur: z.ZodNumber;
    max_fine: z.ZodObject<{
        fixed_cap_eur: z.ZodNumber;
        turnover_based_eur: z.ZodNumber;
        applicable_fine_eur: z.ZodNumber;
        explanation: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        fixed_cap_eur: number;
        turnover_based_eur: number;
        applicable_fine_eur: number;
        explanation: string;
    }, {
        fixed_cap_eur: number;
        turnover_based_eur: number;
        applicable_fine_eur: number;
        explanation: string;
    }>;
    tier_details: z.ZodObject<{
        name: z.ZodString;
        article: z.ZodString;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        description: string;
        name: string;
        article: string;
    }, {
        description: string;
        name: string;
        article: string;
    }>;
    comparative: z.ZodOptional<z.ZodObject<{
        non_sme_applicable_fine_eur: z.ZodNumber;
        sme_applicable_fine_eur: z.ZodNumber;
        reduction_eur: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        non_sme_applicable_fine_eur: number;
        sme_applicable_fine_eur: number;
        reduction_eur: number;
    }, {
        non_sme_applicable_fine_eur: number;
        sme_applicable_fine_eur: number;
        reduction_eur: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    max_fine: {
        fixed_cap_eur: number;
        turnover_based_eur: number;
        applicable_fine_eur: number;
        explanation: string;
    };
    violation_type: string;
    annual_turnover_eur: number;
    is_sme: boolean;
    tier_details: {
        description: string;
        name: string;
        article: string;
    };
    comparative?: {
        non_sme_applicable_fine_eur: number;
        sme_applicable_fine_eur: number;
        reduction_eur: number;
    } | undefined;
}, {
    max_fine: {
        fixed_cap_eur: number;
        turnover_based_eur: number;
        applicable_fine_eur: number;
        explanation: string;
    };
    violation_type: string;
    annual_turnover_eur: number;
    is_sme: boolean;
    tier_details: {
        description: string;
        name: string;
        article: string;
    };
    comparative?: {
        non_sme_applicable_fine_eur: number;
        sme_applicable_fine_eur: number;
        reduction_eur: number;
    } | undefined;
}>;
export type PenaltiesInput = z.infer<typeof penaltiesInputSchema>;
export type PenaltiesOutput = z.infer<typeof penaltiesOutputSchema>;
//# sourceMappingURL=penalties.d.ts.map