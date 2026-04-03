import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { penaltiesInputSchema, penaltiesOutputSchema, type PenaltiesInput, type PenaltiesOutput } from "../schemas/penalties.js";
import { BRANDING } from "../constants.js";
import { calculateMaxFine, getPenaltyTier } from "../knowledge/penalties.js";

export function registerPenaltiesTool(server: McpServer): void {
  server.registerTool("euaiact_calculate_penalty", {
    title: "Calculate EU AI Act Penalties",
    description: "Calculates the maximum possible fine for an EU AI Act violation based on violation type, global annual turnover, and SME status. Implements the Art. 99 penalty framework including the SME/startup protection rule (Art. 99(6)).",
    annotations: {
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: penaltiesInputSchema,
    outputSchema: penaltiesOutputSchema,
  }, async (input: PenaltiesInput): Promise<{ content: any[], structuredContent: PenaltiesOutput }> => {
    const tier = getPenaltyTier(input.violation_type);
    const calculation = calculateMaxFine(input.violation_type, input.annual_turnover_eur, input.is_sme);

    const rule = input.is_sme ? "LOWER (SME/startup protection under Art. 99(6))" : "HIGHER";
    const explanation = `For ${tier.name} violations (${tier.article}): up to EUR ${tier.maxFineEUR.toLocaleString()} or ${tier.globalTurnoverPercentage}% of global annual turnover, whichever is ${rule}.`;

    const output: PenaltiesOutput = {
      violation_type: input.violation_type,
      is_sme: input.is_sme,
      annual_turnover_eur: input.annual_turnover_eur,
      max_fine: {
        fixed_cap_eur: calculation.fixedCap,
        turnover_based_eur: calculation.turnoverBased,
        applicable_fine_eur: calculation.applicableFine,
        explanation,
      },
      tier_details: {
        name: tier.name,
        article: tier.article,
        description: tier.description,
      },
      lexbeam_url: `${BRANDING.baseUrl}/wissen/strafen-bussgeld-eu-ai-act`,
      source: BRANDING.source,
      disclaimer: BRANDING.disclaimer,
    };

    return {
      content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
      structuredContent: output,
    };
  });
}
