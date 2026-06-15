import { deadlinesInputSchema, deadlinesOutputSchema } from "../schemas/deadlines.js";
import { getMilestonesWithDaysRemaining, digitalOmnibus, digitalOmnibusPack } from "../knowledge/deadlines.js";
export function registerDeadlinesTool(server) {
    server.registerTool("euaiact_check_deadlines", {
        title: "Check EU AI Act Implementation Deadlines",
        description: "Returns key implementation milestones and deadlines for the EU AI Act with days remaining, a `next_milestone` shortcut, and a summary of the Digital Omnibus. The milestone timeline always reflects current OJ law. Set `include_pending_omnibus: true` to also receive the structured Digital Omnibus pack (proposal + political agreement, NOT enacted law, each item source-status labelled). Use `only_upcoming: true` to drop past milestones.",
        annotations: {
            readOnlyHint: true,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: deadlinesInputSchema,
        outputSchema: deadlinesOutputSchema,
    }, async (input) => {
        let currentMilestones = getMilestonesWithDaysRemaining();
        if (input.area) {
            const areaLower = input.area.toLowerCase();
            currentMilestones = currentMilestones.filter(m => m.description.toLowerCase().includes(areaLower) ||
                m.name.toLowerCase().includes(areaLower));
        }
        if (input.only_upcoming) {
            currentMilestones = currentMilestones.filter(m => !m.isPast);
        }
        const nextUpcoming = currentMilestones.find(m => !m.isPast) ?? null;
        const pendingOmnibus = input.include_pending_omnibus
            ? {
                name: digitalOmnibusPack.name,
                enacted: false,
                proposal: {
                    com: digitalOmnibusPack.proposal.com,
                    celex: digitalOmnibusPack.proposal.celex,
                    date: digitalOmnibusPack.proposal.date,
                    procedure: digitalOmnibusPack.proposal.procedure,
                    source_id: digitalOmnibusPack.proposal.sourceId,
                },
                political_agreement: {
                    date: digitalOmnibusPack.politicalAgreement.date,
                    source_id: digitalOmnibusPack.politicalAgreement.sourceId,
                },
                high_risk_timeline: {
                    mechanism: digitalOmnibusPack.highRiskTimeline.mechanism,
                    mechanism_source_status: digitalOmnibusPack.highRiskTimeline.mechanismSourceStatus,
                    backstop: digitalOmnibusPack.highRiskTimeline.backstop,
                    backstop_source_status: digitalOmnibusPack.highRiskTimeline.backstopSourceStatus,
                    current_law: digitalOmnibusPack.highRiskTimeline.currentLaw,
                    note: digitalOmnibusPack.highRiskTimeline.note,
                },
                deltas: digitalOmnibusPack.deltas.map(d => ({
                    article: d.article,
                    change: d.change,
                    source_status: d.sourceStatus,
                    source_id: d.sourceId,
                    ...(d.effectiveDate ? { effective_date: d.effectiveDate } : {}),
                    ...(d.note ? { note: d.note } : {}),
                })),
                coverage_note: digitalOmnibusPack.coverageNote,
                warning: digitalOmnibusPack.warning,
            }
            : null;
        const output = {
            milestones: currentMilestones.map(m => ({
                date: m.date,
                name: m.name,
                description: m.description,
                status: m.status,
                articles: m.articles,
                key_obligations: m.keyObligations,
                days_remaining: m.daysRemaining,
                is_past: m.isPast,
            })),
            next_milestone: nextUpcoming
                ? {
                    date: nextUpcoming.date,
                    name: nextUpcoming.name,
                    days_remaining: nextUpcoming.daysRemaining,
                }
                : null,
            // Source-state guard: by default the summary is a minimal, clearly-flagged
            // pointer with NO pending shift dates or pending prohibitions. The dated
            // changes are surfaced only when the caller opts in, so current OJ law is
            // never presented alongside non-enacted specifics.
            digital_omnibus: input.include_pending_omnibus
                ? {
                    name: digitalOmnibus.name,
                    status: digitalOmnibus.status,
                    proposal_date: digitalOmnibus.proposalDate,
                    description: digitalOmnibus.description,
                    key_changes: digitalOmnibus.keyChanges,
                    impact_on_ai_act: digitalOmnibus.impactOnAIAct,
                }
                : {
                    name: digitalOmnibus.name,
                    status: digitalOmnibus.status,
                    proposal_date: digitalOmnibus.proposalDate,
                    description: "A Digital Omnibus on AI (Commission proposal COM(2025) 836; political agreement 7 May 2026) is in progress but NOT enacted. Current OJ law governs. Pass include_pending_omnibus: true, or read euaiact://omnibus, for the specific pending changes and dates.",
                    key_changes: [
                        "Withheld by default so non-enacted changes are not shown alongside current law. Opt in via include_pending_omnibus or the euaiact://omnibus resource.",
                    ],
                    impact_on_ai_act: "Not enacted. Plan against current OJ law.",
                },
            pending_omnibus: pendingOmnibus,
        };
        return {
            content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
            structuredContent: output,
        };
    });
}
//# sourceMappingURL=deadlines.js.map