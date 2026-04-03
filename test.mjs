// Direct tool function testing - bypasses MCP server registration
import { classifyInputSchema } from "./dist/schemas/classify.js";
import { obligationsInputSchema } from "./dist/schemas/obligations.js";
import { penaltiesInputSchema } from "./dist/schemas/penalties.js";
import { faqInputSchema } from "./dist/schemas/faq.js";
import { deadlinesInputSchema } from "./dist/schemas/deadlines.js";
import { calculateKeywordOverlap } from "./dist/utils/matching.js";
import { findBestMatch } from "./dist/utils/matching.js";
import { prohibitedPractices, annexIIICategories, transparencyTriggers } from "./dist/knowledge/annex-iii.js";
import { getMilestonesWithDaysRemaining, digitalOmnibus } from "./dist/knowledge/deadlines.js";
import { providerHighRiskObligations, deployerHighRiskObligations, limitedRiskTransparencyObligations, providerGPAIObligations, universalObligations } from "./dist/knowledge/obligations.js";
import { calculateMaxFine, getPenaltyTier } from "./dist/knowledge/penalties.js";
import { faqDatabase } from "./dist/knowledge/faq-database.js";
import { BRANDING } from "./dist/constants.js";

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

// === SCHEMA VALIDATION ===
console.log("\n📋 SCHEMA VALIDATION");
test("classify input parses", classifyInputSchema.safeParse({ description: "test", use_case: "test" }).success);
test("classify input with role", classifyInputSchema.safeParse({ description: "test", use_case: "test", role: "provider" }).success);
test("obligations input parses", obligationsInputSchema.safeParse({ role: "provider", risk_level: "high-risk" }).success);
test("obligations input - gpai level", obligationsInputSchema.safeParse({ role: "provider", risk_level: "gpai" }).success);
test("penalties input parses", penaltiesInputSchema.safeParse({ violation_type: "prohibited", annual_turnover_eur: 1000000 }).success);
test("faq input parses", faqInputSchema.safeParse({ question: "test" }).success);
test("deadlines input parses (empty)", deadlinesInputSchema.safeParse({}).success);
test("deadlines input parses (with area)", deadlinesInputSchema.safeParse({ area: "GPAI" }).success);

// === CLASSIFICATION LOGIC ===
console.log("\n🎯 CLASSIFICATION LOGIC");

// Prohibited - social scoring
const socialScore = "government system assigns citizen trustworthiness scores social scoring public authority";
const prohibitedMatch = prohibitedPractices.some(p => calculateKeywordOverlap(socialScore, p.keywords) >= 0.5);
test("Social scoring detected as prohibited", prohibitedMatch);

// Prohibited - facial scraping
const facialScrape = "untargeted scraping facial recognition database building face images internet";
const facialMatch = prohibitedPractices.some(p => calculateKeywordOverlap(facialScrape, p.keywords) >= 0.5);
test("Facial scraping detected as prohibited", facialMatch);

// High-risk - HR/recruitment
const hrSystem = "ai system cv screening resume screening candidate evaluation recruitment hiring talent acquisition";
const hrMatch = annexIIICategories.find(c => calculateKeywordOverlap(hrSystem, c.keywords) >= 0.3);
test("HR screening = high-risk Annex III(4)", hrMatch?.number === 4);

// High-risk - credit scoring
const creditSystem = "ai credit scoring creditworthiness loan approval risk assessment";
const creditMatch = annexIIICategories.find(c => calculateKeywordOverlap(creditSystem, c.keywords) >= 0.3);
test("Credit scoring = high-risk Annex III(5)", creditMatch?.number === 5);

// High-risk - biometrics
const bioSystem = "biometric facial recognition emotion recognition biometric identification";
const bioMatch = annexIIICategories.find(c => calculateKeywordOverlap(bioSystem, c.keywords) >= 0.3);
test("Biometrics = high-risk Annex III(1)", bioMatch?.number === 1);

// Limited risk - chatbot
const chatbot = "customer service chatbot conversational ai virtual assistant";
const chatbotMatch = transparencyTriggers.some(t => calculateKeywordOverlap(chatbot, t.keywords) >= 0.6);
test("Chatbot detected as limited risk", chatbotMatch);

// Limited risk - deepfake
const deepfake = "ai generated synthetic content deepfake video voice cloning";
const deepfakeMatch = transparencyTriggers.some(t => calculateKeywordOverlap(deepfake, t.keywords) >= 0.6);
test("Deepfake detected as limited risk", deepfakeMatch);

// Minimal risk - basic tool
const minimal = "ai powered spell checker grammar tool";
const minProhibited = prohibitedPractices.some(p => calculateKeywordOverlap(minimal, p.keywords) > 0.6);
const minHighRisk = annexIIICategories.some(c => calculateKeywordOverlap(minimal, c.keywords) > 0.5);
const minLimited = transparencyTriggers.some(t => calculateKeywordOverlap(minimal, t.keywords) > 0.6);
test("Spell checker = minimal risk (no matches)", !minProhibited && !minHighRisk && !minLimited);

// === DEADLINES ===
console.log("\n📅 DEADLINES");
const milestones = getMilestonesWithDaysRemaining();
test("5 milestones total", milestones.length === 5);
test("Entry into force is past", milestones[0].isPast === true);
test("Prohibited practices is past", milestones[1].isPast === true);
test("GPAI obligations is past", milestones[2].isPast === true);
test("Aug 2026 is upcoming", milestones[3].isPast === false);
test("Aug 2027 is upcoming", milestones[4].isPast === false);
test("Digital Omnibus is proposal_only", digitalOmnibus.status === "proposal_only");
test("Milestone dates correct", milestones[0].date === "2024-08-01" && milestones[3].date === "2026-08-02");

// === OBLIGATIONS ===
console.log("\n📜 OBLIGATIONS");
test("Provider high-risk: 13 obligations", providerHighRiskObligations.length === 13);
test("Deployer high-risk: 8 obligations", deployerHighRiskObligations.length === 8);
test("Limited risk transparency: 4 obligations", limitedRiskTransparencyObligations.length === 4);
test("GPAI obligations: 8 obligations", providerGPAIObligations.length === 8);
test("Universal obligations: 1 (AI literacy)", universalObligations.length === 1);
test("AI literacy cites Art. 4", universalObligations[0].article === "Art. 4");
test("AI literacy deadline Feb 2025", universalObligations[0].deadline === "2025-02-02");

// All obligations have required fields
const allObs = [...providerHighRiskObligations, ...deployerHighRiskObligations, ...limitedRiskTransparencyObligations, ...providerGPAIObligations, ...universalObligations];
test("All obligations have obligation field", allObs.every(o => o.obligation));
test("All obligations have article field", allObs.every(o => o.article));
test("All obligations have deadline field", allObs.every(o => o.deadline));
test("All obligations have details field", allObs.every(o => o.details));
test("All obligations have category field", allObs.every(o => o.category));

// === PENALTIES ===
console.log("\n💰 PENALTIES");
// Large company, prohibited
const p1 = calculateMaxFine("prohibited", 1_000_000_000, false);
test("EUR 1B company prohibited: 7% = EUR 70M (higher than 35M cap)", p1.applicableFine === 70_000_000);

// Large company, high-risk
const p2 = calculateMaxFine("high_risk", 100_000_000, false);
test("EUR 100M company high-risk: 3% = EUR 3M, cap = 15M, higher = 15M", p2.applicableFine === 15_000_000);

// SME, prohibited
const p3 = calculateMaxFine("prohibited", 10_000_000, true);
test("EUR 10M SME prohibited: 7% = 700K, cap = 35M, lower = 700K", p3.applicableFine === 700_000);

// SME, high-risk
const p4 = calculateMaxFine("high_risk", 5_000_000, true);
test("EUR 5M SME high-risk: 3% = 150K, cap = 15M, lower = 150K", p4.applicableFine === 150_000);

// False info
const p5 = calculateMaxFine("false_info", 2_000_000_000, false);
test("EUR 2B company false info: 1% = 20M, cap = 7.5M, higher = 20M", p5.applicableFine === 20_000_000);

// Tier references
test("Prohibited tier = Art. 99(3)", getPenaltyTier("prohibited").article === "Art. 99(3)");
test("High-risk tier = Art. 99(4)", getPenaltyTier("high_risk").article === "Art. 99(4)");
test("False info tier = Art. 99(5)", getPenaltyTier("false_info").article === "Art. 99(5)");

// === FAQ ===
console.log("\n❓ FAQ");
test("20 FAQ entries", faqDatabase.length === 20);

const penaltyFaq = findBestMatch("What are the penalties for non-compliance", faqDatabase, "question");
test("Penalty FAQ found", penaltyFaq.item?.id === "faq-16-penalties");

const classifyFaq = findBestMatch("How do I classify my AI system", faqDatabase, "question");
test("Classification FAQ found", classifyFaq.item?.id === "faq-01-classification");

const hrFaq = findBestMatch("Is my HR AI tool high risk", faqDatabase, "question");
test("HR FAQ found", hrFaq.item?.id === "faq-10-hr-ai-high-risk");

const deployerFaq = findBestMatch("When does a deployer become a provider", faqDatabase, "question");
test("Deployer->provider FAQ found", deployerFaq.item?.id === "faq-17-deployer-becomes-provider");

// All FAQs have required fields
test("All FAQs have article refs", faqDatabase.every(f => Array.isArray(f.articleReferences)));
test("All FAQs have lexbeam URLs", faqDatabase.every(f => f.lexbeamUrl.startsWith("https://lexbeam.com")));

// === BRANDING ===
console.log("\n🏷️ BRANDING");
test("Source mentions Lexbeam", BRANDING.source.includes("Lexbeam"));
test("Disclaimer mentions not legal advice", BRANDING.disclaimer.includes("not legal advice"));
test("Base URL is https", BRANDING.baseUrl.startsWith("https://"));

// === SUMMARY ===
console.log(`\n${"=".repeat(50)}`);
console.log(`RESULTS: ${pass} passed, ${fail} failed out of ${pass + fail} tests`);
if (fail === 0) {
  console.log("🎉 ALL TESTS PASS");
} else {
  console.log("⚠️ FAILURES DETECTED - FIX BEFORE SHIP");
}
process.exit(fail > 0 ? 1 : 0);
