import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  classifyInputSchema,
  classifyOutputSchema,
  type ClassifyInput,
  type ClassifyOutput,
  type ClassifySignals,
} from "../schemas/classify.js";
import { BRANDING } from "../constants.js";
import { scoreKeywordMatch, type KeywordMatchResult } from "../utils/matching.js";

import {
  prohibitedPractices,
  annexIIICategories,
  transparencyTriggers,
  type HighRiskCategory,
  type ProhibitedPractice,
  type TransparencyTrigger,
} from "../knowledge/annex-iii.js";

const ALL_SIGNAL_KEYS: Array<keyof ClassifySignals> = [
  "domain",
  "uses_biometrics",
  "biometric_sole_purpose_verification",
  "biometric_remote_identification",
  "biometric_realtime",
  "biometric_law_enforcement",
  "biometric_publicly_accessible_space",
  "is_safety_component_of_regulated_product",
  "requires_third_party_conformity_assessment",
  "affects_fundamental_rights",
  "targets_children_or_vulnerable",
  "generates_synthetic_content",
  "interacts_with_natural_persons",
  "performs_emotion_recognition_workplace_or_school",
  "performs_social_scoring",
  "performs_social_scoring_by_public_authority",
];

const SIGNAL_QUESTIONS: Record<keyof ClassifySignals, string> = {
  domain: "What is the primary sector this AI system operates in (employment, education, biometrics, critical infrastructure, law enforcement, migration, justice, essential services, health, GPAI, product safety, other)?",
  uses_biometrics: "Does the system process biometric data such as face, fingerprint, iris, voice or gait?",
  biometric_sole_purpose_verification: "Is the biometric use solely one-to-one verification that a specific person is who they claim to be?",
  biometric_remote_identification: "Does the biometric system perform remote biometric identification rather than only biometric verification?",
  biometric_realtime: "If the system uses biometrics, does it process them in real time?",
  biometric_law_enforcement: "Is the biometric system used by or on behalf of law enforcement authorities?",
  biometric_publicly_accessible_space: "If the system uses real-time remote biometric identification for law enforcement, is it deployed in publicly accessible spaces?",
  is_safety_component_of_regulated_product: "Is the system a safety component of a product covered by EU harmonisation legislation (Annex I — medical devices, machinery, toys, etc.)?",
  requires_third_party_conformity_assessment: "Is the product or AI system required to undergo third-party conformity assessment under the applicable Annex I legislation?",
  affects_fundamental_rights: "Could the system materially affect the health, safety, or fundamental rights of natural persons?",
  targets_children_or_vulnerable: "Is the system directed at, or does it materially affect, children or other vulnerable groups?",
  generates_synthetic_content: "Does the system generate or manipulate images, audio, video, or text?",
  interacts_with_natural_persons: "Is the system designed to interact directly with natural persons (e.g., as a chatbot or voice assistant)?",
  performs_emotion_recognition_workplace_or_school: "Does the system infer emotions of natural persons in the workplace or in educational institutions?",
  performs_social_scoring: "Does the system evaluate or classify people over time based on social behaviour or personal/personality traits, leading to detrimental treatment?",
  performs_social_scoring_by_public_authority: "Legacy signal: is the system used by or on behalf of a public authority to score natural persons?",
};

const DOMAIN_TO_ANNEX_III: Partial<Record<string, number>> = {
  critical_infrastructure: 2,
  education: 3,
  employment: 4,
  law_enforcement: 6,
  migration: 7,
  justice: 8,
};

type BaseResult = Omit<ClassifyOutput, "matched_signals" | "missing_signals" | "next_questions" | "basis">;

function obligationsSummaryForHighRisk(role: ClassifyInput["role"]): string {
  if (role === "provider") {
    return "Provider obligations: conformity assessment (Art. 43), technical documentation (Art. 11), risk management system (Art. 9), logging capability (Art. 12) and provider log retention when under provider control (Art. 19), transparency (Art. 13), human oversight (Art. 14), accuracy/robustness/cybersecurity (Art. 15), quality management (Art. 17), EU database registration where Art. 49 applies, and post-market monitoring (Art. 72).";
  }
  if (role === "deployer") {
    return "Deployer obligations: use per instructions (Art. 26(1)), human oversight by competent persons (Art. 26(2)), input data relevance (Art. 26(4)), monitor operation and notify provider/distributor plus market surveillance authority where Art. 26(5) requires, keep logs under deployer control (Art. 26(6)), DPIA where required (Art. 26(9)), workplace and Annex III user notices where applicable (Art. 26(7)/(11)), Art. 86 explanations where its threshold is met, and FRIA where Art. 27 applies.";
  }
  return "Provider obligations include conformity assessment, technical documentation, risk management, logging, transparency, human oversight, conditional EU database registration, and post-market monitoring. Deployer obligations include use per instructions, human oversight by competent persons, monitoring, incident reporting, log retention, notices, explanations where Art. 86 applies, and FRIA where Art. 27 applies. Role determination needed to specify applicable obligations.";
}

function roleOrUncertain(role: ClassifyInput["role"]): "provider" | "deployer" | "uncertain" {
  return role === "provider" || role === "deployer" ? role : "uncertain";
}

function buildBase(partial: Partial<BaseResult> & Pick<BaseResult, "risk_classification" | "confidence" | "relevant_articles" | "obligations_summary" | "role_determination">): BaseResult {
  return {
    annex_iii_category: null,
    caveat: null,
    lexbeam_url: `${BRANDING.baseUrl}/tools/mcp`,
    ...partial,
    // Single choke point for citation hygiene: no duplicate articles in any output.
    relevant_articles: [...new Set(partial.relevant_articles)],
  };
}

function formatReturn(result: ClassifyOutput) {
  return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }], structuredContent: result };
}

function missingFromSignals(signals: ClassifySignals | undefined): Array<keyof ClassifySignals> {
  const provided = new Set<keyof ClassifySignals>();
  if (signals) {
    for (const key of Object.keys(signals) as Array<keyof ClassifySignals>) {
      if (signals[key] !== undefined) provided.add(key);
    }
  }
  return ALL_SIGNAL_KEYS.filter((k) => !provided.has(k));
}

function questionsFor(missing: Array<keyof ClassifySignals>, limit = 3): string[] {
  return missing.slice(0, limit).map((k) => SIGNAL_QUESTIONS[k]);
}

function insufficientFromSignals(params: {
  matched: string[];
  missing: string[];
  role: "provider" | "deployer" | "uncertain";
  relevantArticles: string[];
  obligationsSummary: string;
  caveat: string;
  nextQuestions?: string[];
}): ClassifyOutput {
  return {
    ...buildBase({
      risk_classification: "insufficient_information",
      confidence: "low",
      relevant_articles: params.relevantArticles,
      role_determination: params.role,
      obligations_summary: params.obligationsSummary,
      caveat: params.caveat,
    }),
    matched_signals: params.matched,
    missing_signals: params.missing,
    next_questions: params.nextQuestions ?? [],
    basis: "signals",
  };
}

function includesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

function isSolePurposeBiometricVerification(text: string): boolean {
  const normalized = text.toLowerCase();
  const biometric = includesAny(normalized, [/\bbiometric\b/, /\bfingerprint\b/, /\biris\b/, /\bface\b/, /\bfacial\b/, /\bvoice\b/, /\bgait\b/]);
  const verification = includesAny(normalized, [/\bverification\b/, /\bverify(?:ing)?\b/, /\bauthentication\b/, /\blogin\b/, /\baccess control\b/, /\bconfirm(?:ing)? identity\b/, /\bclaimed identity\b/, /\bperson they claim to be\b/, /\b1:1\b/, /\bone-to-one\b/]);
  const highRiskBiometricUse = includesAny(normalized, [/\bremote biometric identification\b/, /\bbiometric categorisation\b/, /\bbiometric categorization\b/, /\bemotion recognition\b/, /\bwatchlist\b/, /\bidentif(?:y|ying|ication)\b/]);
  return biometric && verification && !highRiskBiometricUse;
}

function isTravelDocumentVerificationOnly(text: string): boolean {
  const normalized = text.toLowerCase();
  const travelDocument = includesAny(normalized, [/\btravel document\b/, /\btravel documents\b/, /\bpassport\b/, /\bpassports\b/]);
  const verification = includesAny(normalized, [/\bverification\b/, /\bverify\b/, /\bauthenticity\b/, /\bauthentication\b/, /\bdocument check\b/]);
  const personRiskOrIdentification = includesAny(normalized, [/\brisk assessment\b/, /\bsecurity risk\b/, /\birregular migration\b/, /\bhealth risk\b/, /\bidentify natural persons\b/, /\bidentifying natural persons\b/]);
  return travelDocument && verification && !personRiskOrIdentification;
}

function isNegatedCriminalProfiling(text: string): boolean {
  const normalized = text.toLowerCase();
  return includesAny(normalized, [
    /\bwithout profiling\b/,
    /\bno profiling\b/,
    /\bdoes not perform profiling\b/,
    /\bnot perform profiling\b/,
    /\bwithout assessing individual risk\b/,
    /\bdoes not assess individual risk\b/,
    /\bnot assess individual risk\b/,
  ]);
}

function isGenericAggregatedCrimeAnalytics(text: string): boolean {
  const normalized = text.toLowerCase();
  const genericAnalytics = includesAny(normalized, [/\bcrime analytics\b/, /\boffence patterns\b/, /\bcrime hotspots\b/, /\baggregated historical reports\b/]);
  const individualUse = includesAny(normalized, [/\bnatural person\b/, /\bindividual risk\b/, /\brecidivism\b/, /\boffending\b/, /\bre-offending\b/, /\bpersonality traits\b/, /\bcriminal profiling\b/, /\bevidence reliability\b/, /\bpolygraph\b/]);
  return genericAnalytics && (!individualUse || isNegatedCriminalProfiling(normalized));
}

// ---------------------------------------------------------------------------
// Step 0 — Structured signals → deterministic classification
// ---------------------------------------------------------------------------

/**
 * Sole-purpose 1:1 biometric verification is expressly excluded from Annex
 * III(1)(a). When that is established (by signal or by the description) and no
 * other risk signal fires, the honest answer is "minimal" with pointers to the
 * checks that remain — not "insufficient_information".
 */
function verificationExclusionMinimal(params: {
  matched: string[];
  missing: string[];
  role: "provider" | "deployer" | "uncertain";
}): ClassifyOutput {
  return {
    ...buildBase({
      risk_classification: "minimal",
      confidence: "medium",
      relevant_articles: ["Annex III(1)(a)", "Art. 6(2)", "Art. 6(1)", "Art. 50"],
      role_determination: params.role,
      obligations_summary:
        "Sole-purpose biometric verification (1:1 confirmation that a person is who they claim to be) is expressly excluded from Annex III(1)(a) and is not high-risk on that ground. Verify separately: the Art. 6(1)/Annex I safety-component path, any other Annex III use, and Art. 50 transparency duties if the system interacts with natural persons or performs biometric categorisation. Art. 4 AI literacy measures apply to all providers and deployers.",
      caveat:
        "Automated pre-assessment. The exclusion covers only verification of a claimed identity; remote biometric identification, biometric categorisation and emotion recognition are separate analyses.",
    }),
    matched_signals: params.matched,
    missing_signals: params.missing,
    next_questions: [
      SIGNAL_QUESTIONS.biometric_remote_identification,
      "Does the system perform biometric categorisation according to sensitive or protected attributes?",
      "Does the system perform emotion recognition?",
    ],
    basis: "signals",
  };
}

function classifyFromSignals(input: ClassifyInput): ClassifyOutput | null {
  const s = input.signals;
  if (!s) return null;

  const role = roleOrUncertain(input.role);
  const matched: string[] = [];
  const missing = missingFromSignals(s).map(String);
  const combined = `${input.description ?? ""} ${input.use_case ?? ""}`.trim();

  // Prohibited practices (Art. 5) — highest priority
  if (s.performs_social_scoring || s.performs_social_scoring_by_public_authority) {
    matched.push(
      s.performs_social_scoring
        ? "performs_social_scoring → Art. 5(1)(c)"
        : "performs_social_scoring_by_public_authority → Art. 5(1)(c)",
    );
    return {
      ...buildBase({
        risk_classification: "prohibited",
        confidence: "high",
        relevant_articles: ["Art. 5", "Art. 5(1)(c)"],
        role_determination: role,
        obligations_summary: "Prohibited: social scoring of natural persons or groups based on social behaviour or personal/personality characteristics leading to detrimental treatment (Art. 5(1)(c)). Deployment is not permitted.",
        caveat: "Automated pre-assessment based on signals. Consult legal counsel for definitive classification.",
      }),
      matched_signals: matched,
      missing_signals: missing,
      next_questions: [],
      basis: "signals",
    };
  }

  if (s.uses_biometrics && s.biometric_realtime && s.biometric_law_enforcement && s.biometric_publicly_accessible_space) {
    matched.push("uses_biometrics + biometric_realtime + biometric_law_enforcement + biometric_publicly_accessible_space → Art. 5(1)(h)");
    return {
      ...buildBase({
        risk_classification: "prohibited",
        confidence: "high",
        relevant_articles: ["Art. 5", "Art. 5(1)(h)"],
        role_determination: role,
        obligations_summary: "Prohibited: real-time remote biometric identification in publicly accessible spaces for law enforcement (Art. 5(1)(h)). Narrow statutory exceptions apply only with prior judicial/administrative authorisation.",
        caveat: "Automated pre-assessment based on signals. Narrow Art. 5(1)(h) exceptions may apply for specific serious crimes — consult legal counsel.",
      }),
      matched_signals: matched,
      missing_signals: missing,
      next_questions: [],
      basis: "signals",
    };
  }

  if (s.performs_emotion_recognition_workplace_or_school) {
    matched.push("performs_emotion_recognition_workplace_or_school → Art. 5(1)(f)");
    return {
      ...buildBase({
        risk_classification: "prohibited",
        confidence: "high",
        relevant_articles: ["Art. 5", "Art. 5(1)(f)"],
        role_determination: role,
        obligations_summary: "Prohibited: emotion recognition in the workplace or educational institutions (Art. 5(1)(f)). Medical or safety-purpose exceptions exist — consult legal counsel.",
        caveat: "Automated pre-assessment based on signals.",
      }),
      matched_signals: matched,
      missing_signals: missing,
      next_questions: [],
      basis: "signals",
    };
  }

  if (s.uses_biometrics) {
    const hasNonBiometricAnnexDomain = !!(s.domain && DOMAIN_TO_ANNEX_III[s.domain] !== undefined);

    if (s.biometric_sole_purpose_verification) {
      matched.push("uses_biometrics + biometric_sole_purpose_verification → Annex III(1)(a) verification exclusion");
      if (!hasNonBiometricAnnexDomain) {
        return verificationExclusionMinimal({ matched, missing, role });
      }
    }

    if (!s.biometric_sole_purpose_verification && !s.biometric_remote_identification && !s.biometric_law_enforcement && !s.biometric_realtime) {
      // The signal was not set, but the description may still establish 1:1
      // verification (the canonical e-gate case: match a face against the
      // holder's own passport). The text path never gets a chance when signals
      // are present, so the exclusion must be applied here.
      if (!hasNonBiometricAnnexDomain && combined && isSolePurposeBiometricVerification(combined)) {
        matched.push("uses_biometrics + description indicates sole-purpose 1:1 verification → Annex III(1)(a) verification exclusion");
        return verificationExclusionMinimal({ matched, missing, role });
      }
      matched.push("uses_biometrics → biometric use needs Annex III(1) purpose check");
      if (!hasNonBiometricAnnexDomain) {
        return insufficientFromSignals({
          matched,
          missing,
          role,
          relevantArticles: ["Annex III(1)", "Art. 6(2)"],
          obligationsSummary: "Biometric data processing alone is not enough for Annex III(1). Determine whether the system performs remote biometric identification, biometric categorisation according to sensitive/protected attributes, or emotion recognition, and whether any Art. 5 prohibition applies.",
          caveat: "Sole-purpose biometric verification is excluded from Annex III(1)(a). Provide the biometric purpose before classifying as high-risk.",
          nextQuestions: [
            SIGNAL_QUESTIONS.biometric_sole_purpose_verification,
            SIGNAL_QUESTIONS.biometric_remote_identification,
            SIGNAL_QUESTIONS.biometric_law_enforcement,
          ],
        });
      }
    }

    if (!s.biometric_sole_purpose_verification && (s.biometric_remote_identification || s.biometric_law_enforcement || s.biometric_realtime)) {
      const category = annexIIICategories.find((c) => c.number === 1)!;
      matched.push("uses_biometrics + biometric purpose signals → Annex III(1) Biometrics");
      return {
        ...buildBase({
          risk_classification: "high-risk",
          confidence: "medium",
          relevant_articles: [...category.relevantArticles, "Art. 6(2)"],
          role_determination: role,
          obligations_summary: obligationsSummaryForHighRisk(input.role),
          annex_iii_category: { number: category.number, name: category.name },
          caveat: "High-risk classification depends on the biometric use being within Annex III(1) and legally permitted. Sole-purpose biometric verification is excluded from Annex III(1)(a); real-time remote biometric identification in publicly accessible spaces for law enforcement may be prohibited under Art. 5(1)(h).",
        }),
        matched_signals: matched,
        missing_signals: missing,
        next_questions: [],
        basis: "signals",
      };
    }
  }

  // Annex I (regulated-product safety component) → high-risk only when both Art. 6(1) conditions are met
  if (s.is_safety_component_of_regulated_product) {
    if (s.requires_third_party_conformity_assessment === true) {
      matched.push("is_safety_component_of_regulated_product + requires_third_party_conformity_assessment → Art. 6(1) (Annex I)");
      return {
        ...buildBase({
          risk_classification: "high-risk",
          confidence: "high",
          relevant_articles: ["Art. 6(1)", "Annex I"],
          role_determination: role,
          obligations_summary: obligationsSummaryForHighRisk(input.role),
          caveat: "High-risk via Art. 6(1) requires both Annex I product coverage and required third-party conformity assessment under the applicable Union harmonisation legislation.",
        }),
        matched_signals: matched,
        missing_signals: missing,
        next_questions: [],
        basis: "signals",
      };
    }

    if (!s.domain || DOMAIN_TO_ANNEX_III[s.domain] === undefined) {
      matched.push("is_safety_component_of_regulated_product → Art. 6(1) third-party conformity condition not met or unknown");
      return insufficientFromSignals({
        matched,
        missing,
        role,
        relevantArticles: ["Art. 6(1)", "Annex I"],
        obligationsSummary:
          s.requires_third_party_conformity_assessment === false
            ? "The provided signals do not establish high-risk status under Art. 6(1), because Art. 6(1) requires required third-party conformity assessment in addition to Annex I product coverage. Check Annex III separately."
            : "Art. 6(1) cannot be confirmed from Annex I product coverage alone. Confirm whether the product or AI system is required to undergo third-party conformity assessment.",
        caveat: "Automated pre-assessment based on signals. Art. 6(1) is cumulative: Annex I product/safety-component coverage plus required third-party conformity assessment.",
        nextQuestions:
          s.requires_third_party_conformity_assessment === undefined
            ? [SIGNAL_QUESTIONS.requires_third_party_conformity_assessment]
            : [SIGNAL_QUESTIONS.domain],
      });
    }
  }

  // Annex III high-risk via domain
  if (s.domain && DOMAIN_TO_ANNEX_III[s.domain] !== undefined) {
    const categoryNumber = DOMAIN_TO_ANNEX_III[s.domain]!;
    const category = annexIIICategories.find((c) => c.number === categoryNumber)!;
    matched.push(`domain=${s.domain} → Annex III(${category.number}) ${category.name}`);

    return {
      ...buildBase({
        risk_classification: "high-risk",
        confidence: "high",
        relevant_articles: [...category.relevantArticles, "Art. 6(2)"],
        role_determination: role,
        obligations_summary: obligationsSummaryForHighRisk(input.role),
        annex_iii_category: { number: category.number, name: category.name },
        caveat: "Art. 6(3) exception may apply if the system performs only a narrow procedural task with no material influence on decision-making AND does not perform profiling of natural persons. Use euaiact_assess_art6_3_exception to evaluate.",
      }),
      matched_signals: matched,
      missing_signals: missing,
      next_questions: [],
      basis: "signals",
    };
  }

  // Art. 50 limited risk via signals
  if (s.generates_synthetic_content) {
    matched.push("generates_synthetic_content → Art. 50(2)/50(4)");
    return {
      ...buildBase({
        risk_classification: "limited",
        confidence: "high",
        relevant_articles: ["Art. 50", "Art. 50(2)", "Art. 50(4)"],
        role_determination: role,
        obligations_summary: "Limited-risk transparency obligations: generated content must be marked in a machine-readable format (Art. 50(2)); deepfakes and AI-generated text on matters of public interest must be disclosed (Art. 50(4)).",
      }),
      matched_signals: matched,
      missing_signals: missing,
      next_questions: [],
      basis: "signals",
    };
  }

  if (s.interacts_with_natural_persons) {
    matched.push("interacts_with_natural_persons → Art. 50(1)");
    return {
      ...buildBase({
        risk_classification: "limited",
        confidence: "high",
        relevant_articles: ["Art. 50", "Art. 50(1)"],
        role_determination: role,
        obligations_summary: "Limited-risk transparency obligation: natural persons must be informed that they are interacting with an AI system (Art. 50(1)), unless obvious from context.",
      }),
      matched_signals: matched,
      missing_signals: missing,
      next_questions: [],
      basis: "signals",
    };
  }

  // Comprehensively negative signal set → minimal. A caller who answered the
  // signal questionnaire and denied every risk indicator has earned a real
  // answer, not "insufficient_information" with a false limited-information
  // caveat (the pre-1.4.4 behaviour, unreachable "minimal" included).
  const providedKeys = ALL_SIGNAL_KEYS.filter((k) => s[k] !== undefined);
  const anyRiskSignalTrue = providedKeys.some((k) => s[k] === true);
  const domainMapsToAnnexIII = s.domain !== undefined && DOMAIN_TO_ANNEX_III[s.domain] !== undefined;
  if (!anyRiskSignalTrue && !domainMapsToAnnexIII && providedKeys.length >= 8) {
    matched.push(`all ${providedKeys.length} provided risk signals negative → no Art. 5 / Annex III / Annex I / Art. 50 trigger`);
    return {
      ...buildBase({
        risk_classification: "minimal",
        confidence: missing.length === 0 ? "high" : "medium",
        relevant_articles: ["Art. 95", "Art. 4"],
        role_determination: role,
        obligations_summary:
          "No Art. 5 prohibition, Annex III or Annex I high-risk category, or Art. 50 transparency trigger applies on the signals provided. Minimal-risk systems carry no mandatory AI Act obligations; voluntary codes of conduct are encouraged (Art. 95) and Art. 4 AI literacy measures apply to all providers and deployers.",
        caveat:
          missing.length === 0
            ? "Automated pre-assessment based on the complete signal set. The classification is only as accurate as the signals supplied."
            : `Automated pre-assessment based on ${providedKeys.length} of ${ALL_SIGNAL_KEYS.length} signals, all negative. Answer the remaining questions to raise confidence.`,
      }),
      matched_signals: matched,
      missing_signals: missing,
      next_questions: missing.length === 0 ? [] : questionsFor(missingFromSignals(s)),
      basis: "signals",
    };
  }

  // Signals given but no rule fired → fall through to text classification
  return null;
}

// ---------------------------------------------------------------------------
// Step 1 — Text classification via rewritten scoring
// ---------------------------------------------------------------------------

interface TextHit<T> {
  item: T;
  result: KeywordMatchResult;
}

function bestStrongHit<T extends { keywords: string[] }>(text: string, items: T[]): TextHit<T> | null {
  let best: TextHit<T> | null = null;
  for (const item of items) {
    const result = scoreKeywordMatch(text, item.keywords);
    if (result.strongCount === 0 && result.weakCount < 2) continue;
    if (!best) {
      best = { item, result };
      continue;
    }
    // Prefer strong count, then raw match count, then score
    const candidateIsBetter =
      result.strongCount > best.result.strongCount ||
      (result.strongCount === best.result.strongCount && result.matches.length > best.result.matches.length) ||
      (result.strongCount === best.result.strongCount && result.matches.length === best.result.matches.length && result.score > best.result.score);
    if (candidateIsBetter) best = { item, result };
  }
  return best;
}

function confidenceFor(result: KeywordMatchResult): ClassifyOutput["confidence"] {
  if (result.strongCount >= 2) return "high";
  if (result.strongCount === 1) return "medium";
  return "low";
}

function classifyFromText(input: ClassifyInput): ClassifyOutput {
  const role = roleOrUncertain(input.role);
  const combined = `${input.description ?? ""} ${input.use_case ?? ""}`.trim();
  const missing = missingFromSignals(input.signals).map(String);
  const questions = questionsFor(missingFromSignals(input.signals));

  if (!combined) {
    return {
      ...buildBase({
        risk_classification: "insufficient_information",
        confidence: "low",
        relevant_articles: ["Art. 6(1)"],
        role_determination: role,
        obligations_summary: "Unable to classify based on provided information. Please provide a system description or structured signals.",
        caveat: input.signals
          ? "No description provided, and the supplied signals were insufficient to classify. Answer the follow-up questions or add a description."
          : "No description or signals provided.",
      }),
      matched_signals: [],
      missing_signals: missing,
      next_questions: questions,
      basis: "default",
    };
  }

  // Step 1a: prohibited practices
  let prohibitedHit = bestStrongHit<ProhibitedPractice>(combined, prohibitedPractices);
  if (prohibitedHit?.item.id === "art5-1d" && isNegatedCriminalProfiling(combined)) {
    prohibitedHit = null;
  }
  if (prohibitedHit) {
    const matched: string[] = prohibitedHit.result.matches.map((m) => `"${m.keyword}" (${m.strength})`);
    return {
      ...buildBase({
        risk_classification: "prohibited",
        confidence: confidenceFor(prohibitedHit.result),
        relevant_articles: ["Art. 5", prohibitedHit.item.article],
        role_determination: role,
        obligations_summary: `This system appears to fall under prohibited AI practices (${prohibitedHit.item.name}). Deployment is not permitted under the EU AI Act.`,
        caveat: "Automated pre-assessment. Consult legal counsel for definitive classification.",
      }),
      matched_signals: matched,
      missing_signals: missing,
      next_questions: questions,
      basis: "text",
    };
  }

  // Step 1b: Annex III high-risk
  let annexHit = bestStrongHit<HighRiskCategory>(combined, annexIIICategories);
  if (
    annexHit &&
    (
      (annexHit.item.number === 1 && isSolePurposeBiometricVerification(combined)) ||
      (annexHit.item.number === 6 && isGenericAggregatedCrimeAnalytics(combined)) ||
      (annexHit.item.number === 7 && isTravelDocumentVerificationOnly(combined))
    )
  ) {
    annexHit = null;
  }
  if (annexHit) {
    const matched: string[] = annexHit.result.matches.map((m) => `"${m.keyword}" (${m.strength})`);
    return {
      ...buildBase({
        risk_classification: "high-risk",
        confidence: confidenceFor(annexHit.result),
        relevant_articles: [...annexHit.item.relevantArticles, "Art. 6(2)"],
        role_determination: role,
        obligations_summary: obligationsSummaryForHighRisk(input.role),
        annex_iii_category: { number: annexHit.item.number, name: annexHit.item.name },
        caveat: "Art. 6(3) exception may apply if the system performs only a narrow procedural task with no material influence on decision-making AND does not perform profiling of natural persons. Use euaiact_assess_art6_3_exception to evaluate.",
      }),
      matched_signals: matched,
      missing_signals: missing,
      next_questions: questions,
      basis: "text",
    };
  }

  // Step 1c: Art. 50 limited risk
  const transparencyHit = bestStrongHit<TransparencyTrigger>(combined, transparencyTriggers);
  if (transparencyHit) {
    const matched: string[] = transparencyHit.result.matches.map((m) => `"${m.keyword}" (${m.strength})`);
    return {
      ...buildBase({
        risk_classification: "limited",
        confidence: confidenceFor(transparencyHit.result),
        relevant_articles: ["Art. 50", transparencyHit.item.article],
        role_determination: role,
        obligations_summary: `System must comply with transparency obligations (${transparencyHit.item.article}): ${transparencyHit.item.description}`,
      }),
      matched_signals: matched,
      missing_signals: missing,
      next_questions: questions,
      basis: "text",
    };
  }

  // Step 1d: default — no match found
  return {
    ...buildBase({
      risk_classification: "insufficient_information",
      confidence: "low",
      relevant_articles: ["Art. 6(1)"],
      role_determination: role,
      obligations_summary: "Unable to determine risk classification from the provided description. The system may be minimal risk, but further analysis is recommended.",
      caveat: "No prohibited-practice, Annex III, Annex I or Art. 50 indicators matched the provided description. A detailed assessment may reveal higher risk; supplying structured signals gives a deterministic answer. All providers and deployers must take measures to support the development of AI literacy (Art. 4, applicable since 2 February 2025 and replaced with effect from 27 July 2026).",
    }),
    matched_signals: [],
    missing_signals: missing,
    next_questions: questions,
    basis: "default",
  };
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export function registerClassifyTool(server: McpServer): void {
  server.registerTool(
    "euaiact_classify_system",
    {
      title: "Classify AI System Under EU AI Act",
      description:
        "Classify an AI system's risk level under the EU AI Act (Regulation 2024/1689). Accepts a free-text description, a use_case, and/or structured signals (domain, biometric flags, synthetic content, etc.). Signals take precedence over text matching for deterministic classification. Returns risk classification, applicable Annex III category, relevant articles, provider/deployer determination, matched signals, and follow-up questions the agent should relay. Note: Art. 6(3) exceptions require documented justification and cannot be auto-applied; use euaiact_assess_art6_3_exception.",
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
      inputSchema: classifyInputSchema,
      outputSchema: classifyOutputSchema,
    },
    async (input: ClassifyInput): Promise<any> => {
      const signalsResult = classifyFromSignals(input);
      if (signalsResult) return formatReturn(signalsResult);
      return formatReturn(classifyFromText(input));
    },
  );
}
