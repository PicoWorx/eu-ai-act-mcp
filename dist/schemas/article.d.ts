import { z } from "zod";
export declare const articleInputSchema: z.ZodObject<{
    article: z.ZodString;
}, "strip", z.ZodTypeAny, {
    article: string;
}, {
    article: string;
}>;
export declare const articleOutputSchema: z.ZodObject<{
    available: z.ZodBoolean;
    article: z.ZodNullable<z.ZodObject<{
        number: z.ZodString;
        title: z.ZodString;
        summary: z.ZodString;
        related_annexes: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        number: string;
        title: string;
        summary: string;
        related_annexes: string[];
    }, {
        number: string;
        title: string;
        summary: string;
        related_annexes: string[];
    }>>;
    eurlex_url: z.ZodString;
    note: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    article: {
        number: string;
        title: string;
        summary: string;
        related_annexes: string[];
    } | null;
    available: boolean;
    eurlex_url: string;
    note?: string | undefined;
}, {
    article: {
        number: string;
        title: string;
        summary: string;
        related_annexes: string[];
    } | null;
    available: boolean;
    eurlex_url: string;
    note?: string | undefined;
}>;
export type ArticleInput = z.infer<typeof articleInputSchema>;
export type ArticleOutput = z.infer<typeof articleOutputSchema>;
//# sourceMappingURL=article.d.ts.map