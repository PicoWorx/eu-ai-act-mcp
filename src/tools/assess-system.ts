import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  assessSystemResponseSchema,
  systemProfileSchema,
  type AssessSystemResponse,
  type SystemProfile,
} from "../decision-contract/index.js";
import { assessSystem } from "../decision-contract/assess-system.js";

export function registerAssessSystemTool(server: McpServer): void {
  server.registerTool(
    "euaiact_assess_system",
    {
      title: "Assess an AI System Under the EU AI Act",
      description:
        "Assess one normalized EU AI Act system profile against the pinned sealed corpus. Returns separate legal-classification, impact, and implementation-readiness blocks with field-level facts, decisive missing facts, complete finding provenance, warnings, and recommended atomic follow-up calls. Sparse inputs fail closed. Impact never changes legal classification, and classification never implies implementation readiness.",
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
      inputSchema: systemProfileSchema,
      outputSchema: assessSystemResponseSchema,
    },
    async (
      input: SystemProfile,
    ): Promise<{ content: any[]; structuredContent: AssessSystemResponse }> => {
      const output = await assessSystem(input);
      return {
        content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
        structuredContent: output,
      };
    },
  );
}
