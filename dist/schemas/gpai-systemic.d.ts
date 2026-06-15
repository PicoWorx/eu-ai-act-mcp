import { z } from "zod";
export declare const gpaiSystemicInputSchema: z.ZodObject<{
    training_flops: z.ZodOptional<z.ZodNumber>;
    commission_designated: z.ZodOptional<z.ZodBoolean>;
    model_name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    training_flops?: number | undefined;
    commission_designated?: boolean | undefined;
    model_name?: string | undefined;
}, {
    training_flops?: number | undefined;
    commission_designated?: boolean | undefined;
    model_name?: string | undefined;
}>;
export declare const obligationRefSchema: z.ZodObject<{
    obligation: z.ZodString;
    article: z.ZodString;
    deadline: z.ZodString;
    details: z.ZodString;
    category: z.ZodString;
}, "strip", z.ZodTypeAny, {
    obligation: string;
    article: string;
    deadline: string;
    details: string;
    category: string;
}, {
    obligation: string;
    article: string;
    deadline: string;
    details: string;
    category: string;
}>;
export declare const gpaiSystemicOutputSchema: z.ZodObject<{
    model_name: z.ZodNullable<z.ZodString>;
    crosses_flops_threshold: z.ZodBoolean;
    flops_threshold: z.ZodNumber;
    systemic_risk_designation: z.ZodEnum<["threshold_met", "commission_designated", "none"]>;
    is_gpai_with_systemic_risk: z.ZodBoolean;
    baseline_obligations_art_53: z.ZodArray<z.ZodObject<{
        obligation: z.ZodString;
        article: z.ZodString;
        deadline: z.ZodString;
        details: z.ZodString;
        category: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        obligation: string;
        article: string;
        deadline: string;
        details: string;
        category: string;
    }, {
        obligation: string;
        article: string;
        deadline: string;
        details: string;
        category: string;
    }>, "many">;
    systemic_risk_obligations_art_55: z.ZodArray<z.ZodObject<{
        obligation: z.ZodString;
        article: z.ZodString;
        deadline: z.ZodString;
        details: z.ZodString;
        category: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        obligation: string;
        article: string;
        deadline: string;
        details: string;
        category: string;
    }, {
        obligation: string;
        article: string;
        deadline: string;
        details: string;
        category: string;
    }>, "many">;
    notification_duty: z.ZodString;
    relevant_articles: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    relevant_articles: string[];
    model_name: string | null;
    crosses_flops_threshold: boolean;
    flops_threshold: number;
    systemic_risk_designation: "commission_designated" | "threshold_met" | "none";
    is_gpai_with_systemic_risk: boolean;
    baseline_obligations_art_53: {
        obligation: string;
        article: string;
        deadline: string;
        details: string;
        category: string;
    }[];
    systemic_risk_obligations_art_55: {
        obligation: string;
        article: string;
        deadline: string;
        details: string;
        category: string;
    }[];
    notification_duty: string;
}, {
    relevant_articles: string[];
    model_name: string | null;
    crosses_flops_threshold: boolean;
    flops_threshold: number;
    systemic_risk_designation: "commission_designated" | "threshold_met" | "none";
    is_gpai_with_systemic_risk: boolean;
    baseline_obligations_art_53: {
        obligation: string;
        article: string;
        deadline: string;
        details: string;
        category: string;
    }[];
    systemic_risk_obligations_art_55: {
        obligation: string;
        article: string;
        deadline: string;
        details: string;
        category: string;
    }[];
    notification_duty: string;
}>;
export type GpaiSystemicInput = z.infer<typeof gpaiSystemicInputSchema>;
export type GpaiSystemicOutput = z.infer<typeof gpaiSystemicOutputSchema>;
//# sourceMappingURL=gpai-systemic.d.ts.map