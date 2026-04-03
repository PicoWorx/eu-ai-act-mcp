import { z } from "zod";

export const deadlinesInputSchema = z.object({
  area: z.string().optional().describe("Optional filter by compliance area (e.g. 'GPAI', 'high-risk', 'prohibited')"),
});

export const deadlinesOutputSchema = z.object({
  milestones: z.array(z.object({
    date: z.string(),
    name: z.string(),
    description: z.string(),
    status: z.enum(["in_effect", "upcoming", "proposal_only"]),
    articles: z.array(z.string()),
    key_obligations: z.array(z.string()),
    days_remaining: z.number(),
    is_past: z.boolean(),
  })),
  digital_omnibus: z.object({
    name: z.string(),
    status: z.string(),
    proposal_date: z.string(),
    description: z.string(),
    key_changes: z.array(z.string()),
    impact_on_ai_act: z.string(),
  }),
  source: z.string(),
  last_updated: z.string(),
});

export type DeadlinesInput = z.infer<typeof deadlinesInputSchema>;
export type DeadlinesOutput = z.infer<typeof deadlinesOutputSchema>;
