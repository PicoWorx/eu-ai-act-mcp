import { z } from "zod";
export declare const faqInputSchema: z.ZodObject<{
    question: z.ZodString;
}, "strip", z.ZodTypeAny, {
    question: string;
}, {
    question: string;
}>;
export declare const faqOutputSchema: z.ZodObject<{
    question: z.ZodString;
    answer: z.ZodString;
    confidence: z.ZodEnum<["high", "medium", "low"]>;
    article_references: z.ZodArray<z.ZodString, "many">;
    lexbeam_url: z.ZodString;
    source: z.ZodString;
    disclaimer: z.ZodString;
}, "strip", z.ZodTypeAny, {
    confidence: "high" | "medium" | "low";
    lexbeam_url: string;
    source: string;
    disclaimer: string;
    question: string;
    answer: string;
    article_references: string[];
}, {
    confidence: "high" | "medium" | "low";
    lexbeam_url: string;
    source: string;
    disclaimer: string;
    question: string;
    answer: string;
    article_references: string[];
}>;
export type FaqInput = z.infer<typeof faqInputSchema>;
export type FaqOutput = z.infer<typeof faqOutputSchema>;
//# sourceMappingURL=faq.d.ts.map