import { obligationsInputSchema, obligationsOutputSchema } from "../schemas/obligations.js";
import { BRANDING } from "../constants.js";
import { providerHighRiskObligations, deployerHighRiskObligations, providerLimitedRiskTransparencyObligations, deployerLimitedRiskTransparencyObligations, providerGPAIObligations, universalObligations, } from "../knowledge/obligations.js";
export function registerObligationsTool(server) {
    server.registerTool("euaiact_get_obligations", {
        title: "Get Obligations by Role and Risk Level",
        description: "Returns specific compliance obligations for providers or deployers based on AI system risk level.",
        annotations: {
            readOnlyHint: true,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: obligationsInputSchema,
        outputSchema: obligationsOutputSchema,
    }, async (input) => {
        let baseObligations = [];
        if (input.risk_level === 'gpai') {
            baseObligations = input.role === 'provider' ? providerGPAIObligations : [];
        }
        else if (input.role === 'provider' && input.risk_level === 'high-risk') {
            baseObligations = providerHighRiskObligations;
        }
        else if (input.role === 'deployer' && input.risk_level === 'high-risk') {
            baseObligations = deployerHighRiskObligations;
        }
        else if (input.risk_level === 'limited') {
            baseObligations = input.role === 'provider'
                ? providerLimitedRiskTransparencyObligations
                : deployerLimitedRiskTransparencyObligations;
        }
        else if (input.risk_level === 'minimal') {
            baseObligations = universalObligations;
        }
        // Always include universal obligations (Art. 4 AI literacy) for non-GPAI queries
        if (input.risk_level !== 'gpai' && input.risk_level !== 'minimal') {
            baseObligations = [...baseObligations, ...universalObligations];
        }
        if (input.role === 'provider' && input.risk_level === 'high-risk') {
            const source = input.high_risk_source ?? 'unknown';
            const annexPoint = input.annex_iii_point;
            if (source === 'annex_i' || annexPoint === 2) {
                baseObligations = baseObligations.filter((obl) => obl.article !== 'Art. 49');
            }
        }
        if (input.role === 'provider' && input.risk_level === 'gpai' && input.gpai_model_placed_on_market_before_2025_08_02) {
            baseObligations = baseObligations.map((obl) => ({
                ...obl,
                deadline: '2027-08-02',
                details: `${obl.details} Art. 111(3) transition applied: this response assumes the GPAI model was placed on the market before 2 August 2025.`,
            }));
        }
        const filtered = input.filter_keyword
            ? baseObligations.filter((obl) => obl.details.toLowerCase().includes(input.filter_keyword.toLowerCase()) ||
                obl.category.toLowerCase().includes(input.filter_keyword.toLowerCase()))
            : baseObligations;
        const penaltyInfo = input.risk_level === 'high-risk' || input.risk_level === 'limited'
            ? { max_fine: "Up to EUR 15 million or 3% of global annual turnover", basis: "Art. 99(4)" }
            : input.risk_level === 'gpai'
                ? input.role === 'provider'
                    ? { max_fine: "Up to EUR 15 million or 3% of global annual turnover for GPAI provider infringements", basis: "Art. 101" }
                    : { max_fine: "No GPAI model-provider fine returned for deployer role; classify the downstream AI system separately if applicable", basis: "Art. 101 applies to providers of general-purpose AI models" }
                : { max_fine: "No specific risk-level penalty tier returned; penalties depend on the infringed obligation and Member State rules under Art. 99", basis: "Art. 99" };
        const output = {
            role: input.role,
            risk_level: input.risk_level,
            obligations: filtered,
            penalties: penaltyInfo,
            lexbeam_url: `${BRANDING.baseUrl}/wissen/provider-deployer-pflichten`,
        };
        return {
            content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
            structuredContent: output,
        };
    });
}
//# sourceMappingURL=obligations.js.map