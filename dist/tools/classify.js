import { classifyInputSchema, classifyOutputSchema } from "../schemas/classify.js";
import { BRANDING } from "../constants.js";
import { calculateKeywordOverlap } from "../utils/matching.js";
import { prohibitedPractices, annexIIICategories, transparencyTriggers } from "../knowledge/annex-iii.js";
function buildResult(fields) {
    return {
        annex_iii_category: null,
        role_determination: "uncertain",
        caveat: null,
        lexbeam_url: `${BRANDING.baseUrl}/tools/mcp`,
        source: BRANDING.source,
        disclaimer: BRANDING.disclaimer,
        last_updated: BRANDING.lastUpdated,
        ...fields,
    };
}
function formatReturn(result) {
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }], structuredContent: result };
}
export function registerClassifyTool(server) {
    server.registerTool("euaiact_classify_system", {
        title: "Classify AI System Under EU AI Act",
        description: "Classify an AI system's risk level under the EU AI Act (Regulation 2024/1689). Returns risk classification, applicable Annex III category, provider/deployer determination, and key obligations. Note: Art. 6(3) exceptions require documented justification and cannot be auto-applied; this tool flags when they may be relevant.",
        annotations: {
            readOnlyHint: true,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: classifyInputSchema,
        outputSchema: classifyOutputSchema,
    }, async (input) => {
        const combined = `${input.description} ${input.use_case}`.toLowerCase();
        // Step 1: Check for prohibited practices (Art. 5)
        for (const practice of prohibitedPractices) {
            const score = calculateKeywordOverlap(combined, practice.keywords);
            if (score >= 0.5) {
                return formatReturn(buildResult({
                    risk_classification: "prohibited",
                    confidence: score > 0.7 ? "high" : "medium",
                    relevant_articles: ["Art. 5", practice.article],
                    role_determination: "uncertain",
                    obligations_summary: `This system appears to fall under prohibited AI practices (${practice.name}). Deployment is not permitted under the EU AI Act.`,
                    caveat: "This is an automated pre-assessment. Consult legal counsel for definitive classification.",
                }));
            }
        }
        // Step 2: Check Annex III high-risk categories
        let bestCategory = null;
        let bestScore = 0;
        for (const category of annexIIICategories) {
            const score = calculateKeywordOverlap(combined, category.keywords);
            if (score > bestScore && score >= 0.3) {
                bestScore = score;
                bestCategory = category;
            }
        }
        if (bestCategory) {
            const roleDetermination = input.role === "unknown" ? "uncertain" : input.role;
            let obligationsSummary;
            if (input.role === "provider") {
                obligationsSummary = "Provider obligations: conformity assessment (Art. 43), technical documentation (Art. 11), risk management system (Art. 9), logging (Art. 12), transparency (Art. 13), human oversight (Art. 14), accuracy/robustness/cybersecurity (Art. 15), quality management (Art. 17), EU database registration (Art. 49), post-market monitoring (Art. 72).";
            }
            else if (input.role === "deployer") {
                obligationsSummary = "Deployer obligations: use per instructions (Art. 26(1)), human oversight by competent persons (Art. 26(2)), input data relevance (Art. 26(4)), monitor and report incidents (Art. 26(5)), DPIA where required (Art. 26(9)), inform affected persons (Art. 26(7)(11)), FRIA for public-sector deployers (Art. 27).";
            }
            else {
                obligationsSummary = "Provider obligations include conformity assessment, technical documentation, risk management, logging, transparency, human oversight, and EU database registration. Deployer obligations include use per instructions, human oversight by competent persons, monitoring, incident reporting, and informing affected persons. Role determination needed to specify applicable obligations.";
            }
            return formatReturn(buildResult({
                risk_classification: "high-risk",
                confidence: bestScore > 0.6 ? "high" : bestScore > 0.45 ? "medium" : "low",
                annex_iii_category: {
                    number: bestCategory.number,
                    name: bestCategory.name,
                },
                relevant_articles: [...bestCategory.relevantArticles, "Art. 6(2)"],
                role_determination: roleDetermination,
                obligations_summary: obligationsSummary,
                caveat: "Art. 6(3) exception may apply if the system performs only a narrow procedural task with no material influence on decision-making. This requires documented justification by the provider.",
            }));
        }
        // Step 3: Check Art. 50 limited risk (transparency obligations)
        for (const trigger of transparencyTriggers) {
            const score = calculateKeywordOverlap(combined, trigger.keywords);
            if (score >= 0.6) {
                return formatReturn(buildResult({
                    risk_classification: "limited",
                    confidence: score > 0.75 ? "high" : "medium",
                    relevant_articles: ["Art. 50", trigger.article],
                    role_determination: input.role === "unknown" ? "uncertain" : input.role,
                    obligations_summary: `System must comply with transparency obligations (${trigger.article}): ${trigger.description}`,
                }));
            }
        }
        // Step 4: Default to minimal risk
        return formatReturn(buildResult({
            risk_classification: "minimal",
            confidence: "low",
            relevant_articles: ["Art. 6(1)"],
            role_determination: input.role === "unknown" ? "uncertain" : input.role,
            obligations_summary: "System appears to be minimal risk. No specific AI Act obligations beyond voluntary codes of conduct (Art. 95) and the universal AI literacy requirement (Art. 4). General product safety and consumer protection laws still apply.",
            caveat: "This classification is based on limited information. A detailed assessment may reveal higher risk classification. All providers and deployers must ensure AI literacy (Art. 4), which has been enforceable since 2 February 2025.",
        }));
    });
}
//# sourceMappingURL=classify.js.map