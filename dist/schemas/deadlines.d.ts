import { z } from "zod";
export declare const deadlinesInputSchema: z.ZodObject<{
    area: z.ZodOptional<z.ZodString>;
    only_upcoming: z.ZodOptional<z.ZodBoolean>;
    include_pending_omnibus: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    area?: string | undefined;
    only_upcoming?: boolean | undefined;
    include_pending_omnibus?: boolean | undefined;
}, {
    area?: string | undefined;
    only_upcoming?: boolean | undefined;
    include_pending_omnibus?: boolean | undefined;
}>;
export declare const deadlinesOutputSchema: z.ZodObject<{
    milestones: z.ZodArray<z.ZodObject<{
        date: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        status: z.ZodEnum<["in_effect", "upcoming", "proposal_only"]>;
        articles: z.ZodArray<z.ZodString, "many">;
        key_obligations: z.ZodArray<z.ZodString, "many">;
        days_remaining: z.ZodNumber;
        is_past: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        status: "in_effect" | "upcoming" | "proposal_only";
        description: string;
        name: string;
        date: string;
        articles: string[];
        key_obligations: string[];
        days_remaining: number;
        is_past: boolean;
    }, {
        status: "in_effect" | "upcoming" | "proposal_only";
        description: string;
        name: string;
        date: string;
        articles: string[];
        key_obligations: string[];
        days_remaining: number;
        is_past: boolean;
    }>, "many">;
    next_milestone: z.ZodNullable<z.ZodObject<{
        date: z.ZodString;
        name: z.ZodString;
        days_remaining: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        date: string;
        days_remaining: number;
    }, {
        name: string;
        date: string;
        days_remaining: number;
    }>>;
    digital_omnibus: z.ZodObject<{
        name: z.ZodString;
        status: z.ZodString;
        proposal_date: z.ZodString;
        description: z.ZodString;
        key_changes: z.ZodArray<z.ZodString, "many">;
        impact_on_ai_act: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: string;
        description: string;
        name: string;
        proposal_date: string;
        key_changes: string[];
        impact_on_ai_act: string;
    }, {
        status: string;
        description: string;
        name: string;
        proposal_date: string;
        key_changes: string[];
        impact_on_ai_act: string;
    }>;
    pending_omnibus: z.ZodNullable<z.ZodObject<{
        name: z.ZodString;
        enacted: z.ZodLiteral<false>;
        proposal: z.ZodObject<{
            com: z.ZodString;
            celex: z.ZodString;
            date: z.ZodString;
            procedure: z.ZodString;
            source_id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            date: string;
            source_id: string;
            com: string;
            celex: string;
            procedure: string;
        }, {
            date: string;
            source_id: string;
            com: string;
            celex: string;
            procedure: string;
        }>;
        political_agreement: z.ZodObject<{
            date: z.ZodString;
            source_id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            date: string;
            source_id: string;
        }, {
            date: string;
            source_id: string;
        }>;
        high_risk_timeline: z.ZodObject<{
            mechanism: z.ZodString;
            mechanism_source_status: z.ZodEnum<["enacted_oj", "commission_proposal", "political_agreement", "commission_guideline_draft", "commission_guideline_final", "commission_study", "code_under_assessment", "code_adequate_voluntary_tool"]>;
            backstop: z.ZodObject<{
                annex_iii_art_6_2: z.ZodString;
                annex_i_art_6_1: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                annex_iii_art_6_2: string;
                annex_i_art_6_1: string;
            }, {
                annex_iii_art_6_2: string;
                annex_i_art_6_1: string;
            }>;
            backstop_source_status: z.ZodEnum<["enacted_oj", "commission_proposal", "political_agreement", "commission_guideline_draft", "commission_guideline_final", "commission_study", "code_under_assessment", "code_adequate_voluntary_tool"]>;
            current_law: z.ZodObject<{
                annex_iii_art_6_2: z.ZodString;
                annex_i_art_6_1: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                annex_iii_art_6_2: string;
                annex_i_art_6_1: string;
            }, {
                annex_iii_art_6_2: string;
                annex_i_art_6_1: string;
            }>;
            note: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            note: string;
            mechanism: string;
            mechanism_source_status: "enacted_oj" | "commission_proposal" | "political_agreement" | "commission_guideline_draft" | "commission_guideline_final" | "commission_study" | "code_under_assessment" | "code_adequate_voluntary_tool";
            backstop: {
                annex_iii_art_6_2: string;
                annex_i_art_6_1: string;
            };
            backstop_source_status: "enacted_oj" | "commission_proposal" | "political_agreement" | "commission_guideline_draft" | "commission_guideline_final" | "commission_study" | "code_under_assessment" | "code_adequate_voluntary_tool";
            current_law: {
                annex_iii_art_6_2: string;
                annex_i_art_6_1: string;
            };
        }, {
            note: string;
            mechanism: string;
            mechanism_source_status: "enacted_oj" | "commission_proposal" | "political_agreement" | "commission_guideline_draft" | "commission_guideline_final" | "commission_study" | "code_under_assessment" | "code_adequate_voluntary_tool";
            backstop: {
                annex_iii_art_6_2: string;
                annex_i_art_6_1: string;
            };
            backstop_source_status: "enacted_oj" | "commission_proposal" | "political_agreement" | "commission_guideline_draft" | "commission_guideline_final" | "commission_study" | "code_under_assessment" | "code_adequate_voluntary_tool";
            current_law: {
                annex_iii_art_6_2: string;
                annex_i_art_6_1: string;
            };
        }>;
        deltas: z.ZodArray<z.ZodObject<{
            article: z.ZodString;
            change: z.ZodString;
            source_status: z.ZodEnum<["enacted_oj", "commission_proposal", "political_agreement", "commission_guideline_draft", "commission_guideline_final", "commission_study", "code_under_assessment", "code_adequate_voluntary_tool"]>;
            source_id: z.ZodString;
            effective_date: z.ZodOptional<z.ZodString>;
            note: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            article: string;
            change: string;
            source_status: "enacted_oj" | "commission_proposal" | "political_agreement" | "commission_guideline_draft" | "commission_guideline_final" | "commission_study" | "code_under_assessment" | "code_adequate_voluntary_tool";
            source_id: string;
            effective_date?: string | undefined;
            note?: string | undefined;
        }, {
            article: string;
            change: string;
            source_status: "enacted_oj" | "commission_proposal" | "political_agreement" | "commission_guideline_draft" | "commission_guideline_final" | "commission_study" | "code_under_assessment" | "code_adequate_voluntary_tool";
            source_id: string;
            effective_date?: string | undefined;
            note?: string | undefined;
        }>, "many">;
        coverage_note: z.ZodString;
        warning: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        political_agreement: {
            date: string;
            source_id: string;
        };
        enacted: false;
        proposal: {
            date: string;
            source_id: string;
            com: string;
            celex: string;
            procedure: string;
        };
        high_risk_timeline: {
            note: string;
            mechanism: string;
            mechanism_source_status: "enacted_oj" | "commission_proposal" | "political_agreement" | "commission_guideline_draft" | "commission_guideline_final" | "commission_study" | "code_under_assessment" | "code_adequate_voluntary_tool";
            backstop: {
                annex_iii_art_6_2: string;
                annex_i_art_6_1: string;
            };
            backstop_source_status: "enacted_oj" | "commission_proposal" | "political_agreement" | "commission_guideline_draft" | "commission_guideline_final" | "commission_study" | "code_under_assessment" | "code_adequate_voluntary_tool";
            current_law: {
                annex_iii_art_6_2: string;
                annex_i_art_6_1: string;
            };
        };
        deltas: {
            article: string;
            change: string;
            source_status: "enacted_oj" | "commission_proposal" | "political_agreement" | "commission_guideline_draft" | "commission_guideline_final" | "commission_study" | "code_under_assessment" | "code_adequate_voluntary_tool";
            source_id: string;
            effective_date?: string | undefined;
            note?: string | undefined;
        }[];
        coverage_note: string;
        warning: string;
    }, {
        name: string;
        political_agreement: {
            date: string;
            source_id: string;
        };
        enacted: false;
        proposal: {
            date: string;
            source_id: string;
            com: string;
            celex: string;
            procedure: string;
        };
        high_risk_timeline: {
            note: string;
            mechanism: string;
            mechanism_source_status: "enacted_oj" | "commission_proposal" | "political_agreement" | "commission_guideline_draft" | "commission_guideline_final" | "commission_study" | "code_under_assessment" | "code_adequate_voluntary_tool";
            backstop: {
                annex_iii_art_6_2: string;
                annex_i_art_6_1: string;
            };
            backstop_source_status: "enacted_oj" | "commission_proposal" | "political_agreement" | "commission_guideline_draft" | "commission_guideline_final" | "commission_study" | "code_under_assessment" | "code_adequate_voluntary_tool";
            current_law: {
                annex_iii_art_6_2: string;
                annex_i_art_6_1: string;
            };
        };
        deltas: {
            article: string;
            change: string;
            source_status: "enacted_oj" | "commission_proposal" | "political_agreement" | "commission_guideline_draft" | "commission_guideline_final" | "commission_study" | "code_under_assessment" | "code_adequate_voluntary_tool";
            source_id: string;
            effective_date?: string | undefined;
            note?: string | undefined;
        }[];
        coverage_note: string;
        warning: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    milestones: {
        status: "in_effect" | "upcoming" | "proposal_only";
        description: string;
        name: string;
        date: string;
        articles: string[];
        key_obligations: string[];
        days_remaining: number;
        is_past: boolean;
    }[];
    next_milestone: {
        name: string;
        date: string;
        days_remaining: number;
    } | null;
    digital_omnibus: {
        status: string;
        description: string;
        name: string;
        proposal_date: string;
        key_changes: string[];
        impact_on_ai_act: string;
    };
    pending_omnibus: {
        name: string;
        political_agreement: {
            date: string;
            source_id: string;
        };
        enacted: false;
        proposal: {
            date: string;
            source_id: string;
            com: string;
            celex: string;
            procedure: string;
        };
        high_risk_timeline: {
            note: string;
            mechanism: string;
            mechanism_source_status: "enacted_oj" | "commission_proposal" | "political_agreement" | "commission_guideline_draft" | "commission_guideline_final" | "commission_study" | "code_under_assessment" | "code_adequate_voluntary_tool";
            backstop: {
                annex_iii_art_6_2: string;
                annex_i_art_6_1: string;
            };
            backstop_source_status: "enacted_oj" | "commission_proposal" | "political_agreement" | "commission_guideline_draft" | "commission_guideline_final" | "commission_study" | "code_under_assessment" | "code_adequate_voluntary_tool";
            current_law: {
                annex_iii_art_6_2: string;
                annex_i_art_6_1: string;
            };
        };
        deltas: {
            article: string;
            change: string;
            source_status: "enacted_oj" | "commission_proposal" | "political_agreement" | "commission_guideline_draft" | "commission_guideline_final" | "commission_study" | "code_under_assessment" | "code_adequate_voluntary_tool";
            source_id: string;
            effective_date?: string | undefined;
            note?: string | undefined;
        }[];
        coverage_note: string;
        warning: string;
    } | null;
}, {
    milestones: {
        status: "in_effect" | "upcoming" | "proposal_only";
        description: string;
        name: string;
        date: string;
        articles: string[];
        key_obligations: string[];
        days_remaining: number;
        is_past: boolean;
    }[];
    next_milestone: {
        name: string;
        date: string;
        days_remaining: number;
    } | null;
    digital_omnibus: {
        status: string;
        description: string;
        name: string;
        proposal_date: string;
        key_changes: string[];
        impact_on_ai_act: string;
    };
    pending_omnibus: {
        name: string;
        political_agreement: {
            date: string;
            source_id: string;
        };
        enacted: false;
        proposal: {
            date: string;
            source_id: string;
            com: string;
            celex: string;
            procedure: string;
        };
        high_risk_timeline: {
            note: string;
            mechanism: string;
            mechanism_source_status: "enacted_oj" | "commission_proposal" | "political_agreement" | "commission_guideline_draft" | "commission_guideline_final" | "commission_study" | "code_under_assessment" | "code_adequate_voluntary_tool";
            backstop: {
                annex_iii_art_6_2: string;
                annex_i_art_6_1: string;
            };
            backstop_source_status: "enacted_oj" | "commission_proposal" | "political_agreement" | "commission_guideline_draft" | "commission_guideline_final" | "commission_study" | "code_under_assessment" | "code_adequate_voluntary_tool";
            current_law: {
                annex_iii_art_6_2: string;
                annex_i_art_6_1: string;
            };
        };
        deltas: {
            article: string;
            change: string;
            source_status: "enacted_oj" | "commission_proposal" | "political_agreement" | "commission_guideline_draft" | "commission_guideline_final" | "commission_study" | "code_under_assessment" | "code_adequate_voluntary_tool";
            source_id: string;
            effective_date?: string | undefined;
            note?: string | undefined;
        }[];
        coverage_note: string;
        warning: string;
    } | null;
}>;
export type DeadlinesInput = z.infer<typeof deadlinesInputSchema>;
export type DeadlinesOutput = z.infer<typeof deadlinesOutputSchema>;
//# sourceMappingURL=deadlines.d.ts.map