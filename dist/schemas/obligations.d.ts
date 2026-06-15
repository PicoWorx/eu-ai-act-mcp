import { z } from "zod";
export declare const obligationsInputSchema: z.ZodObject<{
    role: z.ZodEnum<["provider", "deployer"]>;
    risk_level: z.ZodEnum<["high-risk", "limited", "minimal", "gpai"]>;
    high_risk_source: z.ZodDefault<z.ZodOptional<z.ZodEnum<["annex_iii", "annex_i", "unknown"]>>>;
    annex_iii_point: z.ZodOptional<z.ZodNumber>;
    gpai_model_placed_on_market_before_2025_08_02: z.ZodOptional<z.ZodBoolean>;
    filter_keyword: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    role: "provider" | "deployer";
    risk_level: "gpai" | "high-risk" | "limited" | "minimal";
    high_risk_source: "unknown" | "annex_iii" | "annex_i";
    annex_iii_point?: number | undefined;
    gpai_model_placed_on_market_before_2025_08_02?: boolean | undefined;
    filter_keyword?: string | undefined;
}, {
    role: "provider" | "deployer";
    risk_level: "gpai" | "high-risk" | "limited" | "minimal";
    high_risk_source?: "unknown" | "annex_iii" | "annex_i" | undefined;
    annex_iii_point?: number | undefined;
    gpai_model_placed_on_market_before_2025_08_02?: boolean | undefined;
    filter_keyword?: string | undefined;
}>;
export declare const obligationsOutputSchema: z.ZodObject<{
    role: z.ZodString;
    risk_level: z.ZodString;
    obligations: z.ZodArray<z.ZodObject<{
        obligation: z.ZodString;
        article: z.ZodString;
        deadline: z.ZodString;
        details: z.ZodString;
        category: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        article: string;
        obligation: string;
        deadline: string;
        details: string;
        category: string;
    }, {
        article: string;
        obligation: string;
        deadline: string;
        details: string;
        category: string;
    }>, "many">;
    penalties: z.ZodObject<{
        max_fine: z.ZodString;
        basis: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        basis: string;
        max_fine: string;
    }, {
        basis: string;
        max_fine: string;
    }>;
    /** Optional deep-dive link on lexbeam.com for this role + risk combination. */
    lexbeam_url: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    role: string;
    risk_level: string;
    obligations: {
        article: string;
        obligation: string;
        deadline: string;
        details: string;
        category: string;
    }[];
    penalties: {
        basis: string;
        max_fine: string;
    };
    lexbeam_url?: string | undefined;
}, {
    role: string;
    risk_level: string;
    obligations: {
        article: string;
        obligation: string;
        deadline: string;
        details: string;
        category: string;
    }[];
    penalties: {
        basis: string;
        max_fine: string;
    };
    lexbeam_url?: string | undefined;
}>;
export type ObligationsInput = z.infer<typeof obligationsInputSchema>;
export type ObligationsOutput = z.infer<typeof obligationsOutputSchema>;
//# sourceMappingURL=obligations.d.ts.map