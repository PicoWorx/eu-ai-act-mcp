import { z } from "zod";

export const faqInputSchema = z.object({
  question: z.string().describe("User question about the EU AI Act"),
});

export const faqOutputSchema = z.object({
  question: z.string(),
  answer: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
  article_references: z.array(z.string()),
  lexbeam_url: z.string(),
  source: z.string(),
  disclaimer: z.string(),
});

export type FaqInput = z.infer<typeof faqInputSchema>;
export type FaqOutput = z.infer<typeof faqOutputSchema>;
