import { z } from "zod";
export declare const art6ExceptionInputSchema: z.ZodObject<{
    annex_iii_number: z.ZodOptional<z.ZodNumber>;
    no_significant_risk_to_health_safety_fundamental_rights: z.ZodOptional<z.ZodBoolean>;
    performs_profiling: z.ZodBoolean;
    narrow_procedural_task: z.ZodOptional<z.ZodBoolean>;
    improves_prior_human_activity: z.ZodOptional<z.ZodBoolean>;
    detects_patterns_without_replacing_human_review: z.ZodOptional<z.ZodBoolean>;
    preparatory_task: z.ZodOptional<z.ZodBoolean>;
    documented_assessment: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    performs_profiling: boolean;
    annex_iii_number?: number | undefined;
    no_significant_risk_to_health_safety_fundamental_rights?: boolean | undefined;
    narrow_procedural_task?: boolean | undefined;
    improves_prior_human_activity?: boolean | undefined;
    detects_patterns_without_replacing_human_review?: boolean | undefined;
    preparatory_task?: boolean | undefined;
    documented_assessment?: boolean | undefined;
}, {
    performs_profiling: boolean;
    annex_iii_number?: number | undefined;
    no_significant_risk_to_health_safety_fundamental_rights?: boolean | undefined;
    narrow_procedural_task?: boolean | undefined;
    improves_prior_human_activity?: boolean | undefined;
    detects_patterns_without_replacing_human_review?: boolean | undefined;
    preparatory_task?: boolean | undefined;
    documented_assessment?: boolean | undefined;
}>;
export declare const art6ExceptionConditionSchema: z.ZodObject<{
    condition: z.ZodString;
    article: z.ZodString;
    applies: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    article: string;
    condition: string;
    applies: boolean;
}, {
    article: string;
    condition: string;
    applies: boolean;
}>;
export declare const art6ExceptionOutputSchema: z.ZodObject<{
    exception_available: z.ZodBoolean;
    reasoning: z.ZodString;
    conditions_evaluated: z.ZodArray<z.ZodObject<{
        condition: z.ZodString;
        article: z.ZodString;
        applies: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        article: string;
        condition: string;
        applies: boolean;
    }, {
        article: string;
        condition: string;
        applies: boolean;
    }>, "many">;
    profiling_blocks_exception: z.ZodBoolean;
    documentation_reminder: z.ZodString;
    registration_duty: z.ZodString;
    relevant_articles: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    relevant_articles: string[];
    exception_available: boolean;
    reasoning: string;
    conditions_evaluated: {
        article: string;
        condition: string;
        applies: boolean;
    }[];
    profiling_blocks_exception: boolean;
    documentation_reminder: string;
    registration_duty: string;
}, {
    relevant_articles: string[];
    exception_available: boolean;
    reasoning: string;
    conditions_evaluated: {
        article: string;
        condition: string;
        applies: boolean;
    }[];
    profiling_blocks_exception: boolean;
    documentation_reminder: string;
    registration_duty: string;
}>;
export type Art6ExceptionInput = z.infer<typeof art6ExceptionInputSchema>;
export type Art6ExceptionOutput = z.infer<typeof art6ExceptionOutputSchema>;
//# sourceMappingURL=art6.d.ts.map