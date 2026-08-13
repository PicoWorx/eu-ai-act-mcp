import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  annexIvInputSchema,
  annexIvOutputSchema,
  type AnnexIvInput,
  type AnnexIvOutput,
} from "../schemas/annex-iv.js";
import { annexIVItems } from "../knowledge/annex-iv.js";

const GUIDANCE_NOTE = "The item titles and descriptions summarise Annex IV. The sub_items are non-binding implementation prompts, not verbatim Annex IV text or additional legal requirements. Verify definitive wording in the linked official source.";

function toChecklistMarkdown(): string {
  const lines: string[] = ["# Annex IV - Technical Documentation Checklist", "", `> ${GUIDANCE_NOTE}`, ""];
  for (const item of annexIVItems) {
    lines.push(`## ${item.number}. ${item.title}`);
    lines.push("");
    lines.push(item.description);
    lines.push("");
    for (const sub of item.sub_items) {
      lines.push(`- [ ] ${sub}`);
    }
    lines.push("");
    lines.push(`_Related: ${item.related_articles.join(", ")}_`);
    lines.push("");
  }
  return lines.join("\n");
}

export function registerAnnexIvTool(server: McpServer): void {
  server.registerTool(
    "euaiact_annex_iv_checklist",
    {
      title: "Annex IV Technical Documentation Checklist",
      description:
        "Return the nine Annex IV statutory headings and summaries for technical documentation under Art. 11. The sub_items are separately labelled non-binding implementation prompts and do not create additional legal requirements. Use `format: \"checklist\"` to also receive a markdown checklist suitable for audit preparation. SMEs may provide the statutory information in a simplified manner.",
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
      inputSchema: annexIvInputSchema,
      outputSchema: annexIvOutputSchema,
    },
    async (input: AnnexIvInput): Promise<{ content: any[]; structuredContent: AnnexIvOutput }> => {
      const items = annexIVItems.map((i) => ({
        number: i.number,
        title: i.title,
        description: i.description,
        sub_items: i.sub_items,
        related_articles: i.related_articles,
      }));

      const output: AnnexIvOutput = {
        items,
        guidance_note: GUIDANCE_NOTE,
        total_items: items.length,
        relevant_articles: ["Art. 11", "Annex IV"],
        ...(input.format === "checklist" ? { checklist_markdown: toChecklistMarkdown() } : {}),
        ...(input.sme_simplified
          ? {
              sme_note:
                "Art. 11(1) second subparagraph: SMEs, including start-ups, may provide the elements of the technical documentation specified in Annex IV in a simplified manner. The Commission will establish a simplified technical documentation form targeted at the needs of small and micro enterprises, which SMEs may choose to use.",
            }
          : {}),
      };

      return {
        content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
        structuredContent: output,
      };
    },
  );
}
