// Direct function tests for the EU AI Act MCP server.
// Run `npm run build` first so dist/ is up to date.
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { classifyInputSchema } from "./dist/schemas/classify.js";
import { obligationsInputSchema } from "./dist/schemas/obligations.js";
import { penaltiesInputSchema } from "./dist/schemas/penalties.js";
import { faqInputSchema } from "./dist/schemas/faq.js";
import { deadlinesInputSchema } from "./dist/schemas/deadlines.js";
import { articleInputSchema } from "./dist/schemas/article.js";
import { gpaiSystemicInputSchema } from "./dist/schemas/gpai-systemic.js";
import { art6ExceptionInputSchema } from "./dist/schemas/art6.js";
import { annexIvInputSchema } from "./dist/schemas/annex-iv.js";
import { scoreKeywordMatch, calculateKeywordOverlap, findBestMatch } from "./dist/utils/matching.js";
import { prohibitedPractices, annexIIICategories, transparencyTriggers } from "./dist/knowledge/annex-iii.js";
import {
  getMilestonesWithDaysRemaining,
  digitalOmnibus,
  digitalOmnibusPack,
  omnibusEnactment,
  isOmnibusEnacted,
  resolveOmnibusStatus,
  buildOmnibusSummary,
  getOperativeHighRiskDates,
  getOperativeMilestones,
  getEffectiveSourceRegistry,
} from "./dist/knowledge/deadlines.js";
import { sourceRegistry, SOURCE_STATUS_LABELS, isEnacted } from "./dist/knowledge/sources.js";
import {
  providerHighRiskObligations,
  deployerHighRiskObligations,
  limitedRiskTransparencyObligations,
  providerLimitedRiskTransparencyObligations,
  deployerLimitedRiskTransparencyObligations,
  providerGPAIObligations,
  universalObligations,
} from "./dist/knowledge/obligations.js";
import { calculateMaxFine, getPenaltyTier, penaltyFramework } from "./dist/knowledge/penalties.js";
import { faqDatabase } from "./dist/knowledge/faq-database.js";
import { articles, findArticle } from "./dist/knowledge/articles.js";
import { annexIVItems } from "./dist/knowledge/annex-iv.js";
import { BRANDING, SERVER_INSTRUCTIONS } from "./dist/constants.js";
import { createServer } from "./dist/server.js";

let pass = 0;
let fail = 0;

function test(name, condition) {
  if (condition) {
    console.log(`  ✅ ${name}`);
    pass++;
  } else {
    console.log(`  ❌ ${name}`);
    fail++;
  }
}

// ─── Helper: directly exercise the classifier via the same code path as the
// MCP tool would, by calling the registered handler. This is more rigorous
// than re-implementing the dispatch in the test. The McpServer SDK exposes
// handlers through its internal _toolHandlers map; we extract what we need
// via a lightweight capture during registration. ───────────────────────────

// We can't easily introspect the SDK's internal handler map across versions,
// so we re-import the classify logic by calling the tool's internal
// functions through a thin shim: build a fake server that captures
// registered tools.
function captureRegisteredTools() {
  const registered = {};
  const fakeServer = {
    registerTool: (name, _config, handler) => {
      registered[name] = handler;
    },
    resource: () => {},
    prompt: () => {},
  };
  return { fakeServer, registered };
}

async function callTool(toolName, input) {
  const { fakeServer, registered } = captureRegisteredTools();
  // Dynamically import the register functions directly to avoid the real SDK.
  const { registerClassifyTool } = await import("./dist/tools/classify.js");
  const { registerDeadlinesTool } = await import("./dist/tools/deadlines.js");
  const { registerObligationsTool } = await import("./dist/tools/obligations.js");
  const { registerFaqTool } = await import("./dist/tools/faq.js");
  const { registerPenaltiesTool } = await import("./dist/tools/penalties.js");
  const { registerArticleTool } = await import("./dist/tools/article.js");
  const { registerGpaiSystemicTool } = await import("./dist/tools/gpai-systemic.js");
  const { registerArt6ExceptionTool } = await import("./dist/tools/art6-exception.js");
  const { registerAnnexIvTool } = await import("./dist/tools/annex-iv.js");

  registerClassifyTool(fakeServer);
  registerDeadlinesTool(fakeServer);
  registerObligationsTool(fakeServer);
  registerFaqTool(fakeServer);
  registerPenaltiesTool(fakeServer);
  registerArticleTool(fakeServer);
  registerGpaiSystemicTool(fakeServer);
  registerArt6ExceptionTool(fakeServer);
  registerAnnexIvTool(fakeServer);

  const handler = registered[toolName];
  if (!handler) throw new Error(`Tool not registered: ${toolName}`);
  return handler(input);
}

// ─── SCHEMAS ────────────────────────────────────────────────────────────────
console.log("\n📋 SCHEMA VALIDATION");
test("classify: empty input (signals-only ok)", classifyInputSchema.safeParse({}).success);
test("classify: description+use_case", classifyInputSchema.safeParse({ description: "x", use_case: "y" }).success);
test("classify: signals only", classifyInputSchema.safeParse({ signals: { domain: "employment" } }).success);
test("classify: Annex I signal includes third-party conformity condition", classifyInputSchema.safeParse({ signals: { is_safety_component_of_regulated_product: true, requires_third_party_conformity_assessment: true } }).success);
test("classify: biometric verification exclusion signal parses", classifyInputSchema.safeParse({ signals: { uses_biometrics: true, biometric_sole_purpose_verification: true } }).success);
test("obligations input parses", obligationsInputSchema.safeParse({ role: "provider", risk_level: "high-risk" }).success);
test("obligations input parses high-risk source", obligationsInputSchema.safeParse({ role: "provider", risk_level: "high-risk", high_risk_source: "annex_i" }).success);
test("obligations input parses GPAI legacy flag", obligationsInputSchema.safeParse({ role: "provider", risk_level: "gpai", gpai_model_placed_on_market_before_2025_08_02: true }).success);
test("obligations gpai", obligationsInputSchema.safeParse({ role: "provider", risk_level: "gpai" }).success);
test("penalties input parses", penaltiesInputSchema.safeParse({ violation_type: "prohibited", annual_turnover_eur: 1000000 }).success);
test("penalties gpai input parses", penaltiesInputSchema.safeParse({ violation_type: "gpai", annual_turnover_eur: 1000000 }).success);
test("faq input parses", faqInputSchema.safeParse({ question: "test" }).success);
test("deadlines empty parses", deadlinesInputSchema.safeParse({}).success);
test("deadlines with area parses", deadlinesInputSchema.safeParse({ area: "GPAI" }).success);
test("deadlines only_upcoming parses", deadlinesInputSchema.safeParse({ only_upcoming: true }).success);
test("article input parses", articleInputSchema.safeParse({ article: "5" }).success);
test("gpai input: empty ok", gpaiSystemicInputSchema.safeParse({}).success);
test("gpai input: with flops", gpaiSystemicInputSchema.safeParse({ training_flops: 2e25 }).success);
test("art6 input: profiling flag required", art6ExceptionInputSchema.safeParse({ performs_profiling: true }).success);
test("art6 input: missing profiling rejected", !art6ExceptionInputSchema.safeParse({}).success);
test("annex iv: empty ok", annexIvInputSchema.safeParse({}).success);
test("annex iv: checklist format", annexIvInputSchema.safeParse({ format: "checklist" }).success);

// ─── DIST / SOURCE CONSISTENCY ─────────────────────────────────────────────
console.log("\n📦 DIST / SOURCE CONSISTENCY");
function listTsFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? listTsFiles(full) : [full];
  }).filter((path) => path.endsWith(".ts"));
}

for (const sourcePath of listTsFiles("src")) {
  const generatedPath = sourcePath.replace(/^src\//, "dist/").replace(/\.ts$/, ".js");
  test(`source has generated JS: ${generatedPath}`, existsSync(generatedPath));
}

for (const path of [
  "dist/tools/annex-iv.js",
  "dist/tools/art6-exception.js",
  "dist/tools/article.js",
  "dist/tools/gpai-systemic.js",
  "dist/tools/penalties.js",
  "dist/schemas/annex-iv.js",
  "dist/schemas/art6.js",
  "dist/schemas/article.js",
  "dist/schemas/gpai-systemic.js",
  "dist/schemas/penalties.js",
]) {
  test(`generated file present: ${path}`, existsSync(path));
}

// ─── MATCHING REGRESSIONS (v1.1.0) ─────────────────────────────────────────
console.log("\n🛠️ MATCHING BUG REGRESSIONS");

// BUG 1: the old implementation let single-character tokens match multi-word
// keywords via the fallback prefix check. "e" in "e-commerce" caused
// "emotion recognition workplace" to match. The fix disables that path.
{
  const chatbotText = "ai chatbot for customer support that handles returns e commerce service";
  const emotionPractice = prohibitedPractices.find((p) => p.article === "Art. 5(1)(f)");
  const hit = scoreKeywordMatch(chatbotText, emotionPractice.keywords);
  test("chatbot text does NOT match Art. 5(1)(f) emotion keywords", hit.strongCount === 0);
  test("chatbot text does NOT match ANY prohibited practice strongly", prohibitedPractices.every((p) => scoreKeywordMatch(chatbotText, p.keywords).strongCount === 0));
}

// BUG 2: the old scoring divided matches by total keyword count, so realistic
// descriptions with only a few overlapping keywords scored below the 0.3
// threshold. The new classifier uses strongCount >= 1, so a recruitment
// description hits Annex III(4) even with only 2-3 overlapping keywords.
{
  const recruitment = "ai system screens cvs and ranks candidates for hiring decisions recruitment";
  const ann4 = annexIIICategories.find((c) => c.number === 4);
  const hit = scoreKeywordMatch(recruitment, ann4.keywords);
  test("recruitment text strongly hits Annex III(4)", hit.strongCount >= 1);
}

// calculateKeywordOverlap is preserved as a numeric alias
{
  const score = calculateKeywordOverlap("social scoring citizen trustworthiness", ["social scoring", "citizen score", "trustworthiness score"]);
  test("calculateKeywordOverlap numeric alias still works", score > 0);
}

// symmetric findBestMatch for FAQ
{
  const fria = findBestMatch("FRIA for credit scoring", faqDatabase, "question");
  test("FAQ search: FRIA credit scoring hits faq-22", fria.item?.id === "faq-22-fria-credit-scoring");
  const flops = findBestMatch("FLOPs threshold for GPAI systemic risk", faqDatabase, "question");
  test("FAQ search: FLOPs threshold hits faq-21", flops.item?.id === "faq-21-gpai-flops-threshold");
  const chatbot = findBestMatch("Do chatbots need disclosure under Art. 50", faqDatabase, "question");
  test("FAQ search: chatbot disclosure hits faq-23", chatbot.item?.id === "faq-23-chatbot-disclosure");
}

// ─── CLASSIFIER BEHAVIOUR ───────────────────────────────────────────────────
console.log("\n🎯 CLASSIFIER (text + signals)");

// Text regression tests from the Smithery probe session
const classifyResults = {};
for (const [key, input] of Object.entries({
  chatbot: { description: "AI chatbot for customer support that handles returns", use_case: "E-commerce" },
  recruitment: { description: "AI system that screens CVs and ranks candidates for hiring decisions", use_case: "Recruitment" },
  rtFacial: { description: "real-time facial recognition in public spaces for law enforcement", use_case: "Police identifying suspects" },
  socialScoring: { description: "government system assigning citizen trustworthiness scores for access to public services", use_case: "Public authority" },
  creditScoring: { description: "credit scoring model determining loan eligibility", use_case: "Bank creditworthiness" },
  deepfake: { description: "AI that generates deepfake videos from a photo", use_case: "Entertainment" },
  spellchecker: { description: "Spell checker that suggests corrections as you type", use_case: "Word processor" },
  signalsRbi: { signals: { uses_biometrics: true, biometric_realtime: true, biometric_law_enforcement: true, biometric_publicly_accessible_space: true } },
  signalsNonPublicRbi: { signals: { uses_biometrics: true, biometric_realtime: true, biometric_law_enforcement: true, biometric_publicly_accessible_space: false } },
  signalsEmployment: { signals: { domain: "employment" } },
  signalsSocialScoring: { signals: { performs_social_scoring_by_public_authority: true } },
  signalsPrivateSocialScoring: { signals: { performs_social_scoring: true } },
  signalsChatbot: { signals: { interacts_with_natural_persons: true } },
  signalsSynthetic: { signals: { generates_synthetic_content: true } },
  signalsAnnexI: { signals: { is_safety_component_of_regulated_product: true, requires_third_party_conformity_assessment: true } },
  signalsAnnexIIncomplete: { signals: { is_safety_component_of_regulated_product: true } },
  signalsAnnexINoThirdParty: { description: "AI component in a regulated product that is not subject to third-party conformity assessment", signals: { is_safety_component_of_regulated_product: true, requires_third_party_conformity_assessment: false } },
  signalsBiometricVerification: { description: "Fingerprint biometric verification only to confirm an employee is the person they claim to be for workstation login.", signals: { uses_biometrics: true, biometric_sole_purpose_verification: true } },
  signalsBiometricsOnly: { signals: { domain: "biometrics" } },
  signalsEmotionWorkplace: { signals: { performs_emotion_recognition_workplace_or_school: true } },
  lifeHealthInsurance: { description: "AI model used for risk assessment and pricing for life and health insurance", use_case: "Insurance underwriting" },
  carInsurance: { description: "AI model used to calculate car insurance premiums for vehicle insurance", use_case: "Motor insurance pricing" },
  travelDocumentVerification: { description: "AI-powered document authenticity verification for travel documents at an automated border e-gate.", role: "provider" },
  crimeAnalyticsNoIndividual: { description: "Police dashboard uses AI crime analytics to identify offence patterns and hotspots from aggregated historical reports. It does not assess individual risk or make decisions about natural persons.", role: "deployer" },
  withoutProfiling: { description: "Police dashboard uses AI crime analytics to identify offence patterns and hotspots from aggregated historical reports, without profiling natural persons or assessing individual risk.", role: "deployer" },
})) {
  classifyResults[key] = await callTool("euaiact_classify_system", input);
}

function structured(r) {
  return r.structuredContent;
}

test(
  "chatbot text → limited risk (not prohibited)",
  structured(classifyResults.chatbot).risk_classification === "limited",
);
test(
  "chatbot text cites Art. 50(1)",
  structured(classifyResults.chatbot).relevant_articles.some((a) => a.includes("50(1)")),
);
test(
  "recruitment text → high-risk",
  structured(classifyResults.recruitment).risk_classification === "high-risk",
);
test(
  "recruitment text → Annex III(4)",
  structured(classifyResults.recruitment).annex_iii_category?.number === 4,
);
test(
  "real-time RBI text → prohibited",
  structured(classifyResults.rtFacial).risk_classification === "prohibited",
);
test(
  "real-time RBI cites Art. 5(1)(h) NOT 5(1)(e)",
  structured(classifyResults.rtFacial).relevant_articles.some((a) => a.includes("5(1)(h)")) &&
    !structured(classifyResults.rtFacial).relevant_articles.some((a) => a === "Art. 5(1)(e)"),
);
test(
  "social scoring text → prohibited Art. 5(1)(c)",
  structured(classifyResults.socialScoring).risk_classification === "prohibited" &&
    structured(classifyResults.socialScoring).relevant_articles.some((a) => a.includes("5(1)(c)")),
);
test(
  "credit scoring text → high-risk Annex III(5)",
  structured(classifyResults.creditScoring).risk_classification === "high-risk" &&
    structured(classifyResults.creditScoring).annex_iii_category?.number === 5,
);
test(
  "deepfake text → limited risk Art. 50",
  structured(classifyResults.deepfake).risk_classification === "limited",
);
test(
  "spellchecker text → insufficient_information (no positive match)",
  structured(classifyResults.spellchecker).risk_classification === "insufficient_information",
);

// Signals path
test(
  "signals RBI → prohibited Art. 5(1)(h) high confidence",
  structured(classifyResults.signalsRbi).risk_classification === "prohibited" &&
    structured(classifyResults.signalsRbi).confidence === "high" &&
    structured(classifyResults.signalsRbi).basis === "signals",
);
test(
  "signals non-public RBI → not prohibited without publicly accessible space",
  structured(classifyResults.signalsNonPublicRbi).risk_classification === "high-risk" &&
    structured(classifyResults.signalsNonPublicRbi).annex_iii_category?.number === 1 &&
    structured(classifyResults.signalsNonPublicRbi).basis === "signals",
);
test(
  "signals employment → high-risk Annex III(4)",
  structured(classifyResults.signalsEmployment).risk_classification === "high-risk" &&
    structured(classifyResults.signalsEmployment).annex_iii_category?.number === 4,
);
test(
  "signals social scoring → prohibited Art. 5(1)(c)",
  structured(classifyResults.signalsSocialScoring).risk_classification === "prohibited" &&
    structured(classifyResults.signalsSocialScoring).relevant_articles.some((a) => a.includes("5(1)(c)")),
);
test(
  "signals private social scoring → prohibited Art. 5(1)(c)",
  structured(classifyResults.signalsPrivateSocialScoring).risk_classification === "prohibited" &&
    /public authorities/i.test(structured(classifyResults.signalsPrivateSocialScoring).obligations_summary) === false,
);
test(
  "signals interacts_with_natural_persons → limited Art. 50(1)",
  structured(classifyResults.signalsChatbot).risk_classification === "limited",
);
test(
  "signals generates_synthetic_content → limited Art. 50",
  structured(classifyResults.signalsSynthetic).risk_classification === "limited",
);
test(
  "signals annex I safety component → high-risk Art. 6(1)",
  structured(classifyResults.signalsAnnexI).risk_classification === "high-risk" &&
    structured(classifyResults.signalsAnnexI).relevant_articles.includes("Art. 6(1)"),
);
test(
  "signals Annex I without third-party conformity fact → insufficient information",
  structured(classifyResults.signalsAnnexIIncomplete).risk_classification === "insufficient_information" &&
    /third-party conformity/i.test(structured(classifyResults.signalsAnnexIIncomplete).caveat),
);
test(
  "signals Annex I with no third-party conformity → not high-risk from Art. 6(1)",
  structured(classifyResults.signalsAnnexINoThirdParty).risk_classification === "insufficient_information",
);
test(
  "sole-purpose biometric verification signal does not auto-classify Annex III(1)",
  structured(classifyResults.signalsBiometricVerification).risk_classification === "insufficient_information" &&
    structured(classifyResults.signalsBiometricVerification).relevant_articles.includes("Annex III(1)(a)"),
);
test(
  "domain=biometrics alone does not auto-classify Annex III(1)",
  structured(classifyResults.signalsBiometricsOnly).risk_classification === "insufficient_information",
);
test(
  "signals emotion recognition workplace → prohibited Art. 5(1)(f)",
  structured(classifyResults.signalsEmotionWorkplace).risk_classification === "prohibited",
);
test(
  "life/health insurance pricing → high-risk Annex III(5)",
  structured(classifyResults.lifeHealthInsurance).risk_classification === "high-risk" &&
    structured(classifyResults.lifeHealthInsurance).annex_iii_category?.number === 5,
);
test(
  "ordinary car insurance pricing does not hit Annex III(5) from generic insurance",
  structured(classifyResults.carInsurance).annex_iii_category?.number !== 5,
);
test(
  "travel document verification does not hit Annex III(7)",
  structured(classifyResults.travelDocumentVerification).annex_iii_category?.number !== 7,
);
test(
  "aggregated crime analytics without individual risk does not hit Annex III(6)",
  structured(classifyResults.crimeAnalyticsNoIndividual).annex_iii_category?.number !== 6,
);
test(
  "without profiling text does not trigger prohibited Art. 5(1)(d)",
  structured(classifyResults.withoutProfiling).risk_classification !== "prohibited",
);

// matched_signals + next_questions populated
test(
  "chatbot result includes matched_signals array",
  Array.isArray(structured(classifyResults.chatbot).matched_signals),
);
{
  const emptyResult = (await callTool("euaiact_classify_system", {})).structuredContent;
  test(
    "empty-input classify returns insufficient_information",
    emptyResult.risk_classification === "insufficient_information",
  );
  test(
    "empty-input classify returns follow-up questions",
    emptyResult.next_questions.length > 0,
  );
}
test(
  "classify output has no `disclaimer` field (branding slim)",
  !("disclaimer" in structured(classifyResults.chatbot)),
);
test(
  "classify output has no `source` field (branding slim)",
  !("source" in structured(classifyResults.chatbot)),
);

// ─── DEADLINES ──────────────────────────────────────────────────────────────
console.log("\n📅 DEADLINES");
const milestones = getMilestonesWithDaysRemaining();
test("8 milestones total (enacted state)", milestones.length === 8);
test("Entry into force is past", milestones[0].isPast === true);
test("Aug 2026 application date has passed", milestones[3].isPast === true);
test("Aug 2027 is upcoming", milestones[4].isPast === false);
test("Digital Omnibus summary status is enacted_oj", digitalOmnibus.status === "enacted_oj");
test("Digital Omnibus impact states it is enacted and in force", digitalOmnibus.impactOnAIAct.includes("in force since 2026-07-27"));
test("Chapter XII penalty framework date is 2025-08-02", penaltyFramework.enforcementDate === "2025-08-02");
test("2025 milestone includes Chapter XII penalties except Art. 101", milestones[2].keyObligations.some((o) => /Chapter XII penalty framework applies, except Art\. 101/.test(o)));

// Tool-level: only_upcoming filter
{
  const r = await callTool("euaiact_check_deadlines", { only_upcoming: true });
  test("deadlines only_upcoming filter drops past entries", structured(r).milestones.every((m) => !m.is_past));
  test("deadlines next_milestone shortcut populated", structured(r).next_milestone !== null);
}

// ─── SOURCE-STATE: DIGITAL OMNIBUS (v1.3.0) ─────────────────────────────────
console.log("\n🧭 SOURCE-STATE / DIGITAL OMNIBUS");

// Verified proposal facts (cross-read against COM(2025) 836 on 2026-06-15)
test("Omnibus proposal date is 2025-11-19", digitalOmnibusPack.proposal.date === "2025-11-19");
test("Omnibus proposal CELEX is 52025PC0836", digitalOmnibusPack.proposal.celex === "52025PC0836");
test("Omnibus pack is enacted", digitalOmnibusPack.enacted === true);
test("Omnibus political agreement date is 2026-05-07", digitalOmnibusPack.politicalAgreement.date === "2026-05-07");
test("Omnibus high-risk application date Annex III is 2027-12-02", digitalOmnibusPack.highRiskTimeline.applicationDates.annex_iii_art_6_2 === "2027-12-02");
test("Omnibus high-risk application date Annex I is 2028-08-02", digitalOmnibusPack.highRiskTimeline.applicationDates.annex_i_art_6_1 === "2028-08-02");
test("Omnibus Art 50(2) transition date is the enacted 2026-12-02", digitalOmnibusPack.deltas.some((d) => d.article.includes("50(2)") && d.effectiveDate === "2026-12-02"));
test("Omnibus Art 50(2) delta is attributed to the enacted OJ text", digitalOmnibusPack.deltas.some((d) => d.article.includes("50(2)") && d.sourceStatus === "enacted_oj" && d.sourceId === "omnibus_oj"));
test("Retired proposal date 2027-02-02 appears in no delta", digitalOmnibusPack.deltas.every((d) => d.effectiveDate !== "2027-02-02"));

// Art. 5 prohibitions are enacted law now, not an unverified agreement item.
// Guards the 2026-07-27 correction: the old "do not emit as current Art. 5 law"
// caution survived the flip and was actively wrong.
{
  const nud = digitalOmnibusPack.deltas.find((d) => /Art\. 5 \(prohibited/.test(d.article));
  test("Art. 5 delta is tagged enacted_oj", !!nud && nud.sourceStatus === "enacted_oj");
  test("Art. 5 delta carries the enacted 2026-12-02 date", !!nud && nud.effectiveDate === "2026-12-02");
  test("Art. 5 delta no longer warns against emitting it as current law", !!nud && !/do not emit as current/i.test(nud.note || ""));
}

// Art. 4 was REPLACED, not recast into a Commission-only duty. The proposal's
// version shipped in 1.4.1 and was wrong as law; this guards the correction.
{
  const a4 = digitalOmnibusPack.deltas.find((d) => /^Art\. 4 \(AI literacy\)/.test(d.article));
  test("Art. 4 delta exists and is tagged enacted_oj", !!a4 && a4.sourceStatus === "enacted_oj");
  test("Art. 4 delta does not claim a Commission/Member-State-only recast", !!a4 && !/recast into a duty on the Commission and Member States/i.test(a4.change));
  test("Art. 4 delta states the support-the-development duty", !!a4 && /SUPPORT THE DEVELOPMENT/i.test(a4.change));
  test("Art. 4 delta records that no specific literacy level must be guaranteed", !!a4 && /does not require .*guarantee any specific level/i.test(a4.change));
}

// Art. 49 registration duty SURVIVES the enacted act. The proposal deleted it;
// stating that as law would tell a provider to skip a live registration duty.
{
  const a49 = digitalOmnibusPack.deltas.find((d) => /Art\. 49/.test(d.article));
  test("Art. 49 delta exists and is tagged enacted_oj", !!a49 && a49.sourceStatus === "enacted_oj");
  test("Art. 49 delta states the registration duty survives", !!a49 && /SURVIVES/.test(a49.change));
  test("Art. 49 delta does not claim the duty was deleted", !!a49 && !/^Deletes the EU-database registration duty/i.test(a49.change));
  test("Art. 49 delta records the Annex VIII Section B points 7 and 9 deletion", !!a49 && /Annex VIII Section B points 7 and 9/.test(a49.change));
}

// Once the pack reads as enacted, no delta may still be sourced to the proposal
// or the political agreement: each one must have been reconciled against the OJ.
{
  const stale = digitalOmnibusPack.deltas.filter((d) => d.sourceStatus !== "enacted_oj");
  test(
    `Enacted pack: every delta reconciled against the OJ text (${stale.length} stale)`,
    !digitalOmnibusPack.enacted || stale.length === 0,
  );
  test("Enacted pack: every delta cites its amending item number", !digitalOmnibusPack.enacted || digitalOmnibusPack.deltas.every((d) => /item(s)? \d/.test(d.change)));
}

// The superseded Art. 4 wording must not survive anywhere in the knowledge base.
{
  const a4art = articles.find((a) => a.number === "4");
  test("Art. 4 article summary drops the superseded 'ensure ... sufficient level' wording", !!a4art && !/must take measures to ensure, to their best extent, a sufficient level/i.test(a4art.summary));
  test("Art. 4 article summary records the 27 July 2026 replacement", !!a4art && /27 July 2026/.test(a4art.summary));
  test("Universal obligation reflects the support-the-development duty", /support the development/i.test(universalObligations[0].obligation));
}

// Source registry carries correct statuses
test("Source registry: OJ is enacted_oj", sourceRegistry.oj_2024_1689.status === "enacted_oj");
test("Source registry: COM(2025) 836 is commission_proposal", sourceRegistry.com_2025_836.status === "commission_proposal");
test("Source registry: omnibus record is adopted_pending_publication", sourceRegistry.omnibus_agreement_2026_05_07.status === "adopted_pending_publication");
test("Source registry: omnibus note records EP 2026-06-16 and Council 2026-06-29", /2026-06-16/.test(sourceRegistry.omnibus_agreement_2026_05_07.note) && /2026-06-29/.test(sourceRegistry.omnibus_agreement_2026_05_07.note));
test("Source registry: exactly one enacted_oj source (the OJ instrument, no policy page)", Object.values(sourceRegistry).filter((x) => x.status === "enacted_oj").length === 1);
test("Omnibus delta pack is expanded but curated (>=13 deltas)", digitalOmnibusPack.deltas.length >= 13);
test("Omnibus pack carries a non-exhaustive coverage note", /NON-EXHAUSTIVE/i.test(digitalOmnibusPack.coverageNote));
test("Omnibus deltas include Art 43 conformity assessment", digitalOmnibusPack.deltas.some((d) => /Art\. 43/.test(d.article)));
test("Omnibus superseded proposal mechanism tagged commission_proposal", digitalOmnibusPack.highRiskTimeline.supersededProposalMechanismSourceStatus === "commission_proposal");
test("Omnibus application dates tagged enacted_oj", digitalOmnibusPack.highRiskTimeline.applicationDatesSourceStatus === "enacted_oj");

// Art. 113(3)(c) as enacted is TWO PLAIN DATES. The Commission proposal's trigger
// (application 6/12 months after a decision on the availability of support
// measures) was deleted before adoption. The server described 2027-12-02 as a
// beatable backstop until 1.4.3; these guard that it never says so again.
test("Omnibus mechanism field states it is superseded and not law", /SUPERSEDED, NOT LAW/.test(digitalOmnibusPack.highRiskTimeline.supersededProposalMechanism));
test("Omnibus timeline note calls the dates unconditional", /UNCONDITIONAL/.test(digitalOmnibusPack.highRiskTimeline.note));
test("Omnibus timeline note quotes the enacted Art. 113(3)(c)", /with the exception of Article 6\(5\), shall apply from/.test(digitalOmnibusPack.highRiskTimeline.note));
test("Omnibus Art. 113 delta records the trigger as deleted", digitalOmnibusPack.deltas.some((d) => /Art\. 113/.test(d.article) && /DELETED/.test(d.note ?? "")));

// Tool guardrail: default keeps current OJ law; pending specifics withheld from the WHOLE payload (not just milestones)
{
  const r = await callTool("euaiact_check_deadlines", {});
  const s = structured(r);
  const full = JSON.stringify(s);
  test("deadlines default: pending_omnibus is null", s.pending_omnibus === null);
  test("deadlines default: operative Annex III date 2027-12-02 present", s.milestones.some((m) => m.date === "2027-12-02"));
  test("deadlines default: operative Annex I date 2028-08-02 present", s.milestones.some((m) => m.date === "2028-08-02"));
  test("deadlines default: the 2026-08-02 milestone is scoped to what was NOT deferred", s.milestones.some((m) => m.date === "2026-08-02" && /not deferred/i.test(m.name)) && !s.milestones.some((m) => m.date === "2026-08-02" && /Annex III/i.test(m.name)));
  test("deadlines default: retired 2 Feb 2027 date never appears", !/2027-02-02|2 Feb 2027/.test(full));
  test("deadlines default: the enacted Art. 5 prohibitions ARE surfaced (they are operative law)", /CSAM|intimate/i.test(full) && s.milestones.some((m) => m.date === "2026-12-02"));
  // Regression guard for the 1.4.2 defect: the Annex III milestone told callers
  // 2027-12-02 was a backstop that obligations could beat by six months after a
  // Commission support-measures decision. That trigger is not in the enacted act.
  test("deadlines default: no milestone calls a high-risk date a backstop", !s.milestones.some((m) => /backstop/i.test(m.description) && !/not a backstop/i.test(m.description)));
  test("deadlines default: no milestone offers an earlier support-measures trigger", !/(bite|apply|start).{0,60}earlier.{0,120}(Commission|support measure)/is.test(full));
  test("deadlines default: Annex III milestone states the date is fixed", s.milestones.some((m) => m.date === "2027-12-02" && /fixed date, not a backstop/i.test(m.description)));
}

// Tool guardrail: pending mode surfaces the flagged pack; current-law milestones unchanged
{
  const r = await callTool("euaiact_check_deadlines", { include_pending_omnibus: true });
  const s = structured(r);
  const full = JSON.stringify(s);
  test("deadlines pending: pending_omnibus populated", s.pending_omnibus !== null);
  test("deadlines pending: pack marked enacted", s.pending_omnibus.enacted === true);
  test("deadlines pending: application date Annex III is 2027-12-02", s.pending_omnibus.high_risk_timeline.application_dates.annex_iii_art_6_2 === "2027-12-02");
  test("deadlines pending: superseded mechanism tagged commission_proposal", s.pending_omnibus.high_risk_timeline.superseded_proposal_mechanism_source_status === "commission_proposal");
  test("deadlines pending: application dates tagged enacted_oj", s.pending_omnibus.high_risk_timeline.application_dates_source_status === "enacted_oj");
  test("deadlines pending: coverage_note marks deltas non-exhaustive", /NON-EXHAUSTIVE/i.test(s.pending_omnibus.coverage_note));
  test("deadlines pending: opt-in DOES expose the deferred dates", /2027-12-02/.test(full) && /2028-08-02/.test(full));
  test("deadlines pending: current-law milestone 2026-08-02 still present", s.milestones.some((m) => m.date === "2026-08-02"));
  test("deadlines pending: pack status is enacted_oj", s.pending_omnibus.status === "enacted_oj");
  test("deadlines pending: enactment record served with the real CELEX/OJ/EIF", s.pending_omnibus.enactment.celex === "32026R1744" && s.pending_omnibus.enactment.oj_publication_date === "2026-07-24" && s.pending_omnibus.enactment.entry_into_force === "2026-07-27");
  test("deadlines pending: enactment record carries EP and Council adoption dates", s.pending_omnibus.enactment.ep_endorsement === "2026-06-16" && s.pending_omnibus.enactment.council_adoption === "2026-06-29");
  // The deleted trigger may appear in the opt-in pack, but only as superseded
  // proposal text: never in the enacted key-changes list as a live alternative.
  test("deadlines pending: enacted key_changes carry no live support-measures trigger", !s.digital_omnibus.key_changes.some((k) => /(or|whichever).{0,40}(6|12|six|twelve) months after/i.test(k)));
  test("deadlines pending: enacted key_changes call the Annex III date unconditional", s.digital_omnibus.key_changes.some((k) => /Annex III/.test(k) && /unconditional/i.test(k)));
}

// ─── OMNIBUS ENACTMENT FLIP (M2/M3, prep 2026-07-07) ───────────────────────
console.log("\n🔀 OMNIBUS ENACTMENT FLIP (M2/M3)");

// New source-status tier between political_agreement and enacted_oj
test(
  "adopted_pending_publication tier has the agreed label",
  SOURCE_STATUS_LABELS.adopted_pending_publication === "Adopted by the co-legislators, pending Official Journal publication",
);
test("isEnacted(adopted_pending_publication) is false", isEnacted("adopted_pending_publication") === false);
test("isEnacted(enacted_oj) is true", isEnacted("enacted_oj") === true);

// (a) ENACTED: the committed default carries the real OJ identifiers
test(
  "enacted: committed enactment record holds the real OJ values",
  omnibusEnactment.status === "enacted_oj" &&
    omnibusEnactment.celex === "32026R1744" &&
    omnibusEnactment.ojPublicationDate === "2026-07-24" &&
    omnibusEnactment.entryIntoForce === "2026-07-27",
);
test(
  "enacted: record carries EP 2026-06-16 and Council 2026-06-29",
  omnibusEnactment.epEndorsement === "2026-06-16" && omnibusEnactment.councilAdoption === "2026-06-29",
);
test("enacted: isOmnibusEnacted() is true by default", isOmnibusEnacted() === true);
test("enacted: resolveOmnibusStatus() is enacted_oj", resolveOmnibusStatus() === "enacted_oj");
test("enacted: pack.enacted is true", digitalOmnibusPack.enacted === true);
test("enacted: pack.status is enacted_oj", digitalOmnibusPack.status === "enacted_oj");
test("enacted: operative Annex III date is the deferred 2027-12-02", getOperativeHighRiskDates().annexIiiHighRisk === "2027-12-02");
test("enacted: operative Annex I date is the deferred 2028-08-02", getOperativeHighRiskDates().annexIHighRisk === "2028-08-02");
test(
  "enacted: operative milestones carry the deferred Annex III and Annex I dates",
  getOperativeMilestones().some((m) => m.date === "2027-12-02") &&
    getOperativeMilestones().some((m) => m.date === "2028-08-02"),
);
{
  const r = await callTool("euaiact_check_deadlines", {});
  const s = structured(r);
  test(
    "enacted: default tool output no longer presents Annex III high-risk at 2026-08-02",
    !s.milestones.some((m) => m.date === "2026-08-02" && /Annex III/.test(m.name)),
  );
  test("enacted: default tool output carries the deferred dates", /2027-12-02/.test(JSON.stringify(s)) && /2028-08-02/.test(JSON.stringify(s)));
  test("enacted: default digital_omnibus status resolves enacted_oj", s.digital_omnibus.status === "enacted_oj");
  test("enacted: default digital_omnibus impact states it is enacted", /^Enacted/i.test(s.digital_omnibus.impact_on_ai_act));
}

// Fail-closed guard: a half-flipped record must NOT read as enacted
{
  const halfFlipped = { ...omnibusEnactment, status: "enacted_oj", celex: null, ojPublicationDate: null, entryIntoForce: null };
  test("fail-closed: status=enacted_oj without CELEX/OJ/EIF is NOT enacted", isOmnibusEnacted(halfFlipped) === false);
  test("fail-closed: half-flipped record resolves back to adopted_pending_publication", resolveOmnibusStatus(halfFlipped) === "adopted_pending_publication");
  test("fail-closed: half-flipped record keeps current-law Annex III date", getOperativeHighRiskDates(halfFlipped).annexIiiHighRisk === "2026-08-02");

  // Blank-string / whitespace OJ values must also fail closed (not just null)
  const blankFilled = { ...omnibusEnactment, status: "enacted_oj", celex: "", ojPublicationDate: "", entryIntoForce: "" };
  test("fail-closed: status=enacted_oj with BLANK-string OJ values is NOT enacted", isOmnibusEnacted(blankFilled) === false);
  test("fail-closed: blank-string record keeps current-law Annex III date", getOperativeHighRiskDates(blankFilled).annexIiiHighRisk === "2026-08-02");
  const whitespaceFilled = { ...omnibusEnactment, status: "enacted_oj", celex: "  ", ojPublicationDate: " ", entryIntoForce: "\t" };
  test("fail-closed: whitespace-only OJ values are NOT enacted", isOmnibusEnacted(whitespaceFilled) === false);
}

// (b) FLIP: a filled copy of the record proves the one-edit flip.
// All three values are FAKE test fixtures; the real ones exist only on OJ day.
{
  const fakeEnacted = {
    ...omnibusEnactment,
    status: "enacted_oj",
    celex: "32026R9999",            // FAKE CELEX, test-only
    ojPublicationDate: "2026-07-20", // FAKE OJ date, test-only
    entryIntoForce: "2026-07-23",    // FAKE entry into force (3rd day after), test-only
  };
  test("flip: isOmnibusEnacted(filled record) is true", isOmnibusEnacted(fakeEnacted) === true);
  test("flip: status resolves enacted_oj", resolveOmnibusStatus(fakeEnacted) === "enacted_oj");

  const dates = getOperativeHighRiskDates(fakeEnacted);
  test("flip: operative Annex III date becomes 2027-12-02", dates.annexIiiHighRisk === "2027-12-02");
  test("flip: operative Annex I date becomes 2028-08-02", dates.annexIHighRisk === "2028-08-02");
  test("flip: Art. 50 transparency stays 2026-08-02 (NOT deferred)", dates.art50Transparency === "2026-08-02");
  test("flip: GPAI enforcement/fines stay 2026-08-02 (NOT deferred)", dates.gpaiEnforcementFines === "2026-08-02");
  test("flip: legacy GPAI compliance stays 2027-08-02 (NOT deferred)", dates.legacyGpaiCompliance === "2027-08-02");

  const ms = getMilestonesWithDaysRemaining(fakeEnacted);
  test("flip: milestones list Annex III high-risk at 2027-12-02", ms.some((m) => m.date === "2027-12-02" && /Annex III/.test(m.name)));
  test("flip: milestones list Annex I at 2028-08-02", ms.some((m) => m.date === "2028-08-02" && /Annex I/.test(m.name)));
  test(
    "flip: 2026-08-02 milestone survives, re-scoped to Art. 50 + GPAI enforcement",
    ms.some((m) => m.date === "2026-08-02" && /Art\. 50/.test(m.name) && /GPAI/.test(m.name)),
  );
  test("flip: no milestone still presents Annex III high-risk at 2026-08-02", !ms.some((m) => m.date === "2026-08-02" && /Annex III/.test(m.name)));
  test("flip: legacy GPAI keeps its own 2027-08-02 milestone", ms.some((m) => m.date === "2027-08-02" && /Legacy GPAI/i.test(m.name)));
  test("flip: milestones stay date-sorted", ms.every((m, i, a) => i === 0 || a[i - 1].date <= m.date));
  test("flip: milestone descriptions cite the (fake) CELEX and OJ date", ms.some((m) => m.description.includes("32026R9999") && m.description.includes("2026-07-20")));

  const summary = buildOmnibusSummary(fakeEnacted);
  test("flip: derived summary status is enacted_oj", summary.status === "enacted_oj");
  test("flip: derived summary impact reads as enacted/in force", /in force since 2026-07-23/.test(summary.impactOnAIAct));

  const reg = getEffectiveSourceRegistry(fakeEnacted);
  test("flip: effective source registry gains an enacted_oj omnibus record with the (fake) CELEX", reg.omnibus_oj?.status === "enacted_oj" && reg.omnibus_oj?.celex === "32026R9999");
  test("flip: static source registry itself is untouched by the derived view", !("omnibus_oj" in sourceRegistry));
}

// The flip simulation must not have mutated the committed default
test(
  "post-flip-sim: committed record is unchanged by simulation (pure functions, no mutation)",
  omnibusEnactment.celex === "32026R1744" && omnibusEnactment.status === "enacted_oj" && isOmnibusEnacted() === true,
);

// Reverse simulation: a pending copy must still resolve to pre-OJ behaviour, so the
// machinery keeps working in both directions after the flip.
{
  const pendingCopy = {
    ...omnibusEnactment,
    status: "adopted_pending_publication",
    celex: null,
    ojPublicationDate: null,
    entryIntoForce: null,
  };
  test("reverse-sim: a pending copy is not enacted", isOmnibusEnacted(pendingCopy) === false);
  test("reverse-sim: a pending copy keeps the current-law Annex III date", getOperativeHighRiskDates(pendingCopy).annexIiiHighRisk === "2026-08-02");
  test("reverse-sim: a pending copy keeps the current-law Annex I date", getOperativeHighRiskDates(pendingCopy).annexIHighRisk === "2027-08-02");
}

// ─── ART. 5 PROHIBITION KEYWORD SENSITIVITY ────────────────────────────────
// The new Art. 5(1)(ba)/(bb) prohibitions must fire on how people actually
// describe these systems, without catching ordinary Art. 50 generative tools.
// Bare single words match loosely by stem: "deepfake" once reclassified a
// marketing text generator as prohibited, and a bare "nude" would catch a
// colour-palette tool. Hence phrases.
console.log("\n🚫 ART. 5 PROHIBITION KEYWORDS");
{
  const ba = prohibitedPractices.find((p) => p.id === "art5-1ba");
  const bb = prohibitedPractices.find((p) => p.id === "art5-1bb");
  const shouldMatch = [
    ["nudification app", ba],
    ["an app that undresses people in photos", ba],
    ["generates a realistic nude image of a real person", ba],
    ["creates naked photos of someone without their consent", ba],
    ["creates sexually explicit images of identifiable people", ba],
    ["generates child sexual abuse material", bb],
  ];
  for (const [text, practice] of shouldMatch) {
    test(
      `Art. 5 keywords match: "${text.slice(0, 44)}"`,
      scoreKeywordMatch(text, practice.keywords).strongCount > 0,
    );
  }
  const mustNotMatch = [
    "deepfake text generator for marketing copy",
    "nude colour palette generator for interior design",
    "chatbot that answers customer questions",
  ];
  for (const text of mustNotMatch) {
    test(
      `Art. 5 keywords do NOT match: "${text.slice(0, 44)}"`,
      scoreKeywordMatch(text, ba.keywords).strongCount === 0 &&
        scoreKeywordMatch(text, bb.keywords).strongCount === 0,
    );
  }
}

// ─── CROSS-TOOL CONSISTENCY ─────────────────────────────────────────────────
// Regression guard: the obligations tool and the deadlines tool must never state
// different application dates for the same system. Before this guard existed the
// obligations data carried a hardcoded 2026-08-02 that survived the Omnibus flip.
console.log("\n🔗 CROSS-TOOL CONSISTENCY");
{
  const operative = getOperativeHighRiskDates();
  for (const [label, source, expected] of [
    ["annex_iii", "annex_iii", operative.annexIiiHighRisk],
    ["annex_i", "annex_i", operative.annexIHighRisk],
  ]) {
    const r = await callTool("euaiact_get_obligations", {
      role: "provider",
      risk_level: "high-risk",
      high_risk_source: source,
    });
    const obls = structured(r).obligations;
    const chapterIii = obls.filter((o) => o.article !== "Art. 4");
    test(
      `cross-tool: provider ${label} obligations all carry the operative date ${expected}`,
      chapterIii.length > 0 && chapterIii.every((o) => o.deadline === expected),
    );
    test(
      `cross-tool: provider ${label} obligations never carry the superseded 2026-08-02`,
      !chapterIii.some((o) => o.deadline === "2026-08-02"),
    );
  }
  const lim = await callTool("euaiact_get_obligations", { role: "provider", risk_level: "limited" });
  test(
    "cross-tool: limited-risk Art. 50 obligations stay on 2026-08-02 (not deferred)",
    structured(lim).obligations.filter((o) => o.article !== "Art. 4").every((o) => o.deadline === "2026-08-02"),
  );
}

// ─── OBLIGATIONS ────────────────────────────────────────────────────────────
console.log("\n📜 OBLIGATIONS");
test("Provider high-risk: 13 obligations", providerHighRiskObligations.length === 13);
test("Deployer high-risk: 9 obligations", deployerHighRiskObligations.length === 9);
test("Limited risk transparency: 4 obligations", limitedRiskTransparencyObligations.length === 4);
test("Provider limited-risk transparency: 2 obligations", providerLimitedRiskTransparencyObligations.length === 2);
test("Deployer limited-risk transparency: 2 obligations", deployerLimitedRiskTransparencyObligations.length === 2);
test("GPAI obligations: 8 obligations", providerGPAIObligations.length === 8);
test("Universal obligations: 1 (AI literacy)", universalObligations.length === 1);
{
  const r = await callTool("euaiact_get_obligations", { role: "provider", risk_level: "high-risk" });
  test("obligations tool has no `disclaimer` field", !("disclaimer" in structured(r)));
  test("obligations tool has no `source` field", !("source" in structured(r)));
  test("obligations tool includes lexbeam_url", typeof structured(r).lexbeam_url === "string");
  test("provider high-risk Art. 49 obligation is conditional", /Annex III/.test(structured(r).obligations.find((o) => o.article === "Art. 49")?.details ?? ""));
}
{
  const r = await callTool("euaiact_get_obligations", { role: "provider", risk_level: "high-risk", high_risk_source: "annex_i" });
  test("provider Annex I high-risk obligations omit Art. 49 EU database registration", !structured(r).obligations.some((o) => o.article === "Art. 49"));
}
{
  const r = await callTool("euaiact_get_obligations", { role: "provider", risk_level: "high-risk", high_risk_source: "annex_iii", annex_iii_point: 2 });
  test("provider Annex III point 2 obligations omit Art. 49 EU database registration", !structured(r).obligations.some((o) => o.article === "Art. 49"));
}
{
  const r = await callTool("euaiact_get_obligations", { role: "deployer", risk_level: "limited", filter_keyword: "emotion" });
  const p = structured(r);
  test("limited-risk deployer emotion obligation uses deployer actor", p.obligations.length === 1 && /Deployers/.test(p.obligations[0].details));
  test("limited-risk penalties use Art. 99(4)", p.penalties.basis === "Art. 99(4)");
}
{
  const r = await callTool("euaiact_get_obligations", { role: "provider", risk_level: "limited", filter_keyword: "machine-readable" });
  const p = structured(r);
  test("limited-risk provider marking obligation is Art. 50(2)", p.obligations.length === 1 && p.obligations[0].article === "Art. 50(2)");
}
{
  const r = await callTool("euaiact_get_obligations", { role: "deployer", risk_level: "gpai" });
  const p = structured(r);
  test("GPAI deployer query does not return provider obligations", p.obligations.length === 0);
  test("GPAI deployer penalty basis explains provider-only Art. 101", /providers/i.test(p.penalties.basis));
}
{
  const r = await callTool("euaiact_get_obligations", { role: "provider", risk_level: "gpai", gpai_model_placed_on_market_before_2025_08_02: true });
  const p = structured(r);
  test("GPAI legacy model obligations use Art. 111(3) 2027 deadline", p.obligations.length > 0 && p.obligations.every((o) => o.deadline === "2027-08-02"));
}

// ─── PENALTIES ──────────────────────────────────────────────────────────────
console.log("\n💰 PENALTIES");
const p1 = calculateMaxFine("prohibited", 1_000_000_000, false);
test("EUR 1B prohibited: 7% = EUR 70M (higher of two)", p1.applicableFine === 70_000_000);
const p2 = calculateMaxFine("high_risk", 100_000_000, false);
test("EUR 100M high-risk: cap 15M", p2.applicableFine === 15_000_000);
const p3 = calculateMaxFine("prohibited", 10_000_000, true);
test("EUR 10M SME prohibited: 7% = 700K (lower of two)", p3.applicableFine === 700_000);
const p5 = calculateMaxFine("false_info", 2_000_000_000, false);
test("EUR 2B false_info: 1% = 20M (higher)", p5.applicableFine === 20_000_000);
test("Prohibited tier = Art. 99(3)", getPenaltyTier("prohibited").article === "Art. 99(3)");
test("GPAI penalty tier = Art. 101", getPenaltyTier("gpai").article === "Art. 101");
{
  const p = calculateMaxFine("gpai", 1_000_000_000, true);
  test("GPAI penalties do not apply Art. 99(6) SME lower cap", p.applicableFine === 30_000_000);
}

// Tool-level: SME description contradiction fix
{
  const r = await callTool("euaiact_calculate_penalty", {
    violation_type: "prohibited",
    annual_turnover_eur: 50_000_000,
    is_sme: true,
  });
  const payload = structured(r);
  test(
    "SME response: tier_details.description says 'lower'",
    /lower/i.test(payload.tier_details.description),
  );
  test(
    "SME response: tier_details.description does NOT still say 'whichever is higher'",
    !/whichever is higher/i.test(payload.tier_details.description),
  );
  test(
    "SME response: comparative block present",
    typeof payload.comparative?.sme_applicable_fine_eur === "number",
  );
  test(
    "SME response: reduction_eur correctly computed",
    payload.comparative.reduction_eur ===
      payload.comparative.non_sme_applicable_fine_eur - payload.comparative.sme_applicable_fine_eur,
  );
  test(
    "SME response has no `disclaimer` field (branding slim)",
    !("disclaimer" in payload),
  );
}
{
  const r = await callTool("euaiact_calculate_penalty", {
    violation_type: "gpai",
    annual_turnover_eur: 1_000_000_000,
    is_sme: true,
  });
  const payload = structured(r);
  test("GPAI penalty tool uses Art. 101", payload.tier_details.article === "Art. 101");
  test("GPAI SME response still uses higher amount", payload.max_fine.applicable_fine_eur === 30_000_000);
  test("GPAI SME response explains no Art. 99(6) lower cap", /no Art\. 99\(6\)/i.test(payload.max_fine.explanation));
}

// ─── FAQ ────────────────────────────────────────────────────────────────────
console.log("\n❓ FAQ");
test("24 FAQ entries after v1.1.0 additions", faqDatabase.length === 24);
test(
  "faq-21-gpai-flops-threshold present",
  faqDatabase.some((f) => f.id === "faq-21-gpai-flops-threshold"),
);
test(
  "faq-22-fria-credit-scoring present",
  faqDatabase.some((f) => f.id === "faq-22-fria-credit-scoring"),
);
test(
  "faq-23-chatbot-disclosure present",
  faqDatabase.some((f) => f.id === "faq-23-chatbot-disclosure"),
);
test(
  "faq-24-minimal-risk-examples present",
  faqDatabase.some((f) => f.id === "faq-24-minimal-risk-examples"),
);
{
  const r = await callTool("euaiact_answer_question", { question: "what is the FLOPs threshold for GPAI systemic risk" });
  test("answer_question: FLOPs question → faq-21", /10\^25|1e25|10\*\*25|1\.e\+25/i.test(structured(r).answer));
  test("answer_question response has no `source` field", !("source" in structured(r)));
}
{
  const r = await callTool("euaiact_answer_question", { question: "What are transparency obligations for chatbots and generated content under Article 50?" });
  test("FAQ transparency answer maps machine-readable marking to Art. 50(2)", /Art\. 50\(2\).*machine-readable|machine-readable.*Art\. 50\(2\)/s.test(structured(r).answer));
  test("FAQ transparency answer does not cite Art. 50(5) for marking", !/50\(5\).*machine-readable|machine-readable.*50\(5\)/s.test(structured(r).answer));
}
{
  const ids = transparencyTriggers.map((t) => t.id);
  test("Art. 50 transparency trigger ids are unique", new Set(ids).size === ids.length);
}

// ─── NEW TOOLS (v1.1.0) ────────────────────────────────────────────────────
console.log("\n🆕 NEW TOOLS");

// get_article
test("articles corpus has Art. 5", articles.some((a) => a.number === "5"));
test("findArticle('5') returns Art. 5", findArticle("5")?.number === "5");
test("findArticle('Art. 99') returns Art. 99", findArticle("Art. 99")?.number === "99");
test("findArticle('12') separates technical logging from retention duties", /Retention of automatically generated logs is dealt with separately/.test(findArticle("12")?.summary ?? ""));
test("findArticle('99') does not place GPAI fines under Art. 99(4)", !/GPAI obligations/.test(findArticle("99")?.summary ?? "") && /Art\. 101/.test(findArticle("99")?.summary ?? ""));
{
  const r = await callTool("euaiact_get_article", { article: "5" });
  const p = structured(r);
  test("get_article(5): available=true", p.available === true);
  test("get_article(5): has EUR-Lex URL", p.eurlex_url.includes("CELEX:32024R1689"));
  test("get_article(5): title mentions prohibited", /prohibit/i.test(p.article.title));
}
{
  const r = await callTool("euaiact_get_article", { article: "201" });
  test("get_article(201): unavailable with eurlex fallback", structured(r).available === false && structured(r).eurlex_url.length > 0);
}

// gpai_systemic
{
  const r = await callTool("euaiact_check_gpai_systemic_risk", { training_flops: 2e25 });
  const p = structured(r);
  test("gpai 2e25: crosses threshold", p.crosses_flops_threshold === true);
  test("gpai 2e25: systemic designation", p.systemic_risk_designation === "threshold_met");
  test("gpai 2e25: is systemic true", p.is_gpai_with_systemic_risk === true);
  test("gpai 2e25: Art. 55 obligations returned", p.systemic_risk_obligations_art_55.length > 0);
  test("gpai 2e25: Art. 53 baseline present", p.baseline_obligations_art_53.length > 0);
  test("gpai 2e25: notification duty mentions 2 weeks", /two weeks/i.test(p.notification_duty));
}
{
  const r = await callTool("euaiact_check_gpai_systemic_risk", { training_flops: 1e23 });
  const p = structured(r);
  test("gpai 1e23: below threshold", p.crosses_flops_threshold === false);
  test("gpai 1e23: no Art. 55 obligations", p.systemic_risk_obligations_art_55.length === 0);
}
{
  const r = await callTool("euaiact_check_gpai_systemic_risk", { commission_designated: true });
  test("gpai commission_designated: systemic true", structured(r).is_gpai_with_systemic_risk === true);
}

// art6_exception
{
  const r = await callTool("euaiact_assess_art6_3_exception", {
    annex_iii_number: 4,
    performs_profiling: true,
    narrow_procedural_task: true,
  });
  const p = structured(r);
  test("art6: profiling blocks exception", p.exception_available === false && p.profiling_blocks_exception === true);
  test("art6: reason mentions profiling", /profiling/i.test(p.reasoning));
}
{
  const r = await callTool("euaiact_assess_art6_3_exception", {
    performs_profiling: false,
    no_significant_risk_to_health_safety_fundamental_rights: true,
    narrow_procedural_task: true,
    documented_assessment: true,
  });
  const p = structured(r);
  test("art6: narrow procedural + no profiling + documented → available", p.exception_available === true);
  test("art6: Art. 49(2) registration duty mentioned", /49\(2\)/.test(p.registration_duty));
}
{
  const r = await callTool("euaiact_assess_art6_3_exception", {
    performs_profiling: false,
    narrow_procedural_task: true,
    documented_assessment: true,
  });
  const p = structured(r);
  test("art6: narrow task without no-significant-risk gate → unavailable", p.exception_available === false);
  test("art6: no-significant-risk gate absence is explained", /significant risk/i.test(p.reasoning));
}
{
  const r = await callTool("euaiact_assess_art6_3_exception", {
    performs_profiling: false,
  });
  test("art6: no conditions asserted → unavailable", structured(r).exception_available === false);
}

// annex_iv checklist
test("annexIVItems has 9 items", annexIVItems.length === 9);
{
  const r = await callTool("euaiact_annex_iv_checklist", {});
  const p = structured(r);
  test("annex_iv default: 9 items", p.total_items === 9);
  test("annex_iv default: no markdown field", p.checklist_markdown === undefined);
}
{
  const r = await callTool("euaiact_annex_iv_checklist", { format: "checklist", sme_simplified: true });
  const p = structured(r);
  test("annex_iv checklist format: markdown present", typeof p.checklist_markdown === "string" && p.checklist_markdown.includes("# Annex IV"));
  test("annex_iv checklist format: SME note present", typeof p.sme_note === "string" && p.sme_note.includes("simplified"));
}

// ─── BRANDING / INSTRUCTIONS ───────────────────────────────────────────────
console.log("\n🏷️ BRANDING + INSTRUCTIONS");
test("BRANDING.source still mentions Lexbeam", BRANDING.source.includes("Lexbeam"));
test("SERVER_INSTRUCTIONS contains disclaimer", /not legal advice/i.test(SERVER_INSTRUCTIONS));
test("SERVER_INSTRUCTIONS mentions Lexbeam attribution", /Lexbeam/.test(SERVER_INSTRUCTIONS));
test("SERVER_INSTRUCTIONS references get_article tool", /get_article/.test(SERVER_INSTRUCTIONS));

// ─── SERVER WIRING ─────────────────────────────────────────────────────────
console.log("\n🔌 SERVER WIRING");
{
  const srv = createServer();
  test("createServer returns an McpServer instance", typeof srv === "object");
}

// ─── SUMMARY ────────────────────────────────────────────────────────────────
console.log(`\n${"=".repeat(50)}`);
console.log(`RESULTS: ${pass} passed, ${fail} failed out of ${pass + fail} tests`);
if (fail === 0) {
  console.log("🎉 ALL TESTS PASS");
} else {
  console.log("⚠️ FAILURES DETECTED - FIX BEFORE SHIP");
}
process.exit(fail > 0 ? 1 : 0);
