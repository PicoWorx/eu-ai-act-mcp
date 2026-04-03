import { z } from "zod";
export declare const deadlinesInputSchema: z.ZodObject<{
    area: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    area?: string | undefined;
}, {
    area?: string | undefined;
}>;
export declare const deadlinesOutputSchema: z.ZodObject<{
    milestones: z.ZodArray<z.ZodObject<{
        date: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        status: z.ZodEnum<["in_effect", "upcoming", "proposal_only"]>;
        articles: z.ZodArray<z.ZodString, "many">;
        key_obligations: z.ZodArray<z.ZodString, "many">;
        days_remaining: z.ZodNumber;
        is_past: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        description: string;
        status: "in_effect" | "upcoming" | "proposal_only";
        date: string;
        name: string;
        articles: string[];
        key_obligations: string[];
        days_remaining: number;
        is_past: boolean;
    }, {
        description: string;
        status: "in_effect" | "upcoming" | "proposal_only";
        date: string;
        name: string;
        articles: string[];
        key_obligations: string[];
        days_remaining: number;
        is_past: boolean;
    }>, "many">;
    digital_omnibus: z.ZodObject<{
        name: z.ZodString;
        status: z.ZodString;
        proposal_date: z.ZodString;
        description: z.ZodString;
        key_changes: z.ZodArray<z.ZodString, "many">;
        impact_on_ai_act: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        description: string;
        status: string;
        name: string;
        proposal_date: string;
        key_changes: string[];
        impact_on_ai_act: string;
    }, {
        description: string;
        status: string;
        name: string;
        proposal_date: string;
        key_changes: string[];
        impact_on_ai_act: string;
    }>;
    source: z.ZodString;
    last_updated: z.ZodString;
}, "strip", z.ZodTypeAny, {
    source: string;
    last_updated: string;
    milestones: {
        description: string;
        status: "in_effect" | "upcoming" | "proposal_only";
        date: string;
        name: string;
        articles: string[];
        key_obligations: string[];
        days_remaining: number;
        is_past: boolean;
    }[];
    digital_omnibus: {
        description: string;
        status: string;
        name: string;
        proposal_date: string;
        key_changes: string[];
        impact_on_ai_act: string;
    };
}, {
    source: string;
    last_updated: string;
    milestones: {
        description: string;
        status: "in_effect" | "upcoming" | "proposal_only";
        date: string;
        name: string;
        articles: string[];
        key_obligations: string[];
        days_remaining: number;
        is_past: boolean;
    }[];
    digital_omnibus: {
        description: string;
        status: string;
        name: string;
        proposal_date: string;
        key_changes: string[];
        impact_on_ai_act: string;
    };
}>;
export type DeadlinesInput = z.infer<typeof deadlinesInputSchema>;
export type DeadlinesOutput = z.infer<typeof deadlinesOutputSchema>;
//# sourceMappingURL=deadlines.d.ts.map