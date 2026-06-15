import { z } from "zod";
export declare const annexIvInputSchema: z.ZodObject<{
    format: z.ZodDefault<z.ZodOptional<z.ZodEnum<["json", "checklist"]>>>;
    sme_simplified: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    format: "json" | "checklist";
    sme_simplified?: boolean | undefined;
}, {
    format?: "json" | "checklist" | undefined;
    sme_simplified?: boolean | undefined;
}>;
export declare const annexIvItemSchema: z.ZodObject<{
    number: z.ZodNumber;
    title: z.ZodString;
    description: z.ZodString;
    sub_items: z.ZodArray<z.ZodString, "many">;
    related_articles: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    number: number;
    description: string;
    title: string;
    sub_items: string[];
    related_articles: string[];
}, {
    number: number;
    description: string;
    title: string;
    sub_items: string[];
    related_articles: string[];
}>;
export declare const annexIvOutputSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        number: z.ZodNumber;
        title: z.ZodString;
        description: z.ZodString;
        sub_items: z.ZodArray<z.ZodString, "many">;
        related_articles: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        number: number;
        description: string;
        title: string;
        sub_items: string[];
        related_articles: string[];
    }, {
        number: number;
        description: string;
        title: string;
        sub_items: string[];
        related_articles: string[];
    }>, "many">;
    checklist_markdown: z.ZodOptional<z.ZodString>;
    sme_note: z.ZodOptional<z.ZodString>;
    total_items: z.ZodNumber;
    relevant_articles: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    relevant_articles: string[];
    items: {
        number: number;
        description: string;
        title: string;
        sub_items: string[];
        related_articles: string[];
    }[];
    total_items: number;
    checklist_markdown?: string | undefined;
    sme_note?: string | undefined;
}, {
    relevant_articles: string[];
    items: {
        number: number;
        description: string;
        title: string;
        sub_items: string[];
        related_articles: string[];
    }[];
    total_items: number;
    checklist_markdown?: string | undefined;
    sme_note?: string | undefined;
}>;
export type AnnexIvInput = z.infer<typeof annexIvInputSchema>;
export type AnnexIvOutput = z.infer<typeof annexIvOutputSchema>;
//# sourceMappingURL=annex-iv.d.ts.map