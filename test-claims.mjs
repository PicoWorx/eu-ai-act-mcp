/**
 * CLAIM MATRIX - every load-bearing legal fact the server serves, checked on
 * BOTH sides:
 *
 *   law side:     the pinned corpus (law/) must contain the supporting text.
 *                 If the law moves and the corpus is re-pinned, these fail
 *                 loudly instead of the product drifting silently.
 *   served side:  the built knowledge/tools must state the same fact.
 *                 If code drifts from the corpus, these fail.
 *
 * Run: node test-claims.mjs   (CI runs it after test.mjs)
 */
import { readFileSync } from "node:fs";

let pass = 0;
let fail = 0;
function check(id, side, ok) {
  if (ok) {
    pass++;
  } else {
    fail++;
    console.error(`  ❌ ${id} [${side}]`);
  }
}

// Normalised corpus: whitespace collapsed so needles match across line breaks.
const norm = (s) => s.replace(/\s+/g, " ");
const CONSOLIDATED = norm(readFileSync("law/celex-02024R1689-20260727-consolidated.txt", "utf8"));
const OMNIBUS = norm(readFileSync("law/celex-32026R1744-omnibus.txt", "utf8"));
const inLaw = (needle, corpus = CONSOLIDATED) => corpus.includes(norm(needle));
// Article-bounded slice: needles must hold WITHIN the article they claim, not
// anywhere in the corpus (cross-model round 3: global includes() let unrelated
// passages satisfy a claim while the claimed passage changed meaning).
const sliceBetween = (start, end, corpus = CONSOLIDATED) => {
  const i = corpus.indexOf(start);
  if (i < 0) return "";
  const j = corpus.indexOf(end, i + start.length);
  return j < 0 ? corpus.slice(i) : corpus.slice(i, j);
};
// Two needles within `span` chars of each other inside a slice.
const nearAnchor = (hay, anchor, needle, span = 400) => {
  let i = hay.indexOf(anchor);
  while (i >= 0) {
    if (hay.slice(Math.max(0, i - span), i + anchor.length + span).includes(needle)) return true;
    i = hay.indexOf(anchor, i + 1);
  }
  return false;
};
const ART99 = sliceBetween("Article 99 Penalties", "Article 100 Administrative fines");
const ART100 = sliceBetween("Article 100 Administrative fines", "Article 101 Fines");
const ART101 = sliceBetween("Article 101 Fines for providers", "Article 102");
const ART73 = sliceBetween("Article 73 Reporting of serious incidents", "Article 74");
const ART111 = sliceBetween("Article 111 AI systems already placed", "Article 112 Evaluation");
const ART10 = sliceBetween("Article 10 Data and data governance", "Article 11");
const ART51 = sliceBetween("Article 51 Classification of general-purpose AI models", "Article 52");

// Served-side sources
const { getMilestonesWithDaysRemaining, getOperativeHighRiskDates } = await import("./dist/knowledge/deadlines.js");
const { omnibusEnactment } = await import("./dist/knowledge/digital-omnibus.js");
const { getPenaltyTier, calculateMaxFine } = await import("./dist/knowledge/penalties.js");
const { articles } = await import("./dist/knowledge/articles.js");
const { annexIIICategories } = await import("./dist/knowledge/annex-iii.js");

const milestones = getMilestonesWithDaysRemaining();
const dates = getOperativeHighRiskDates();
const art = (n) => articles.find((a) => a.number === n);
const milestone = (d) => milestones.find((m) => m.date === d);

function toolHandler(registerFn) {
  let h;
  registerFn({ registerTool: (n, m, f) => { h = f; } });
  return h;
}

console.log("CLAIM MATRIX: law side = pinned corpus, served side = built dist\n");

// ── Application dates ────────────────────────────────────────────────────────

check("D1 general application 2 Aug 2026 (Art. 113, 2nd para)", "law",
  inLaw("It shall apply from 2 August 2026"));
check("D1", "served", milestone("2026-08-02") !== undefined);

check("D2 prohibitions + literacy from 2 Feb 2025 (Art. 113(3)(a))", "law",
  inLaw("Chapters I and II shall apply from 2 February 2025"));
check("D2", "served", milestone("2025-02-02")?.articles.includes("Art. 5"));

check("D3 new prohibitions (ba)/(bb) + 5(1a)/(1b) from 2 Dec 2026", "law",
  inLaw("points (ba) and (bb), and Article 5(1a) and (1b) which shall apply from 2 December 2026"));
check("D3", "served", milestone("2026-12-02")?.articles.includes("Art. 5(1)(ba)"));

check("D4 GPAI/governance/Ch. XII except 101 from 2 Aug 2025 (Art. 113(3)(b))", "law",
  inLaw("Chapter III Section 4, Chapter V, Chapter VII and Chapter XII and Article 78 shall apply from 2 August 2025, with the exception of Article 101"));
check("D4", "served", milestone("2025-08-02")?.articles.includes("Art. 99") && milestone("2025-08-02")?.articles.includes("Art. 100"));

check("D5 Arts. 99-100 NOT dated 2026 on the served timeline", "served",
  !milestone("2026-08-02")?.articles.includes("Art. 99") && !milestone("2026-08-02")?.articles.includes("Art. 100"));

check("D6 Annex III high-risk from 2 Dec 2027 (Art. 113(3)(c)(i))", "law",
  inLaw("2 December 2027 as regards AI systems classified as high-risk pursuant to Article 6(2)"));
check("D6", "served", dates.annexIiiHighRisk === "2027-12-02" && milestone("2027-12-02") !== undefined);

check("D7 Annex I high-risk from 2 Aug 2028 (Art. 113(3)(c)(ii))", "law",
  inLaw("2 August 2028 as regards AI systems classified as high-risk pursuant to Article 6(1)"));
check("D7", "served", dates.annexIHighRisk === "2028-08-02" && milestone("2028-08-02") !== undefined);

check("D8 the deferral covers Chapter III Sections 1-3 except Art. 6(5)", "law",
  inLaw("Chapter III, Sections 1, 2, and 3, with the exception of Article 6(5), shall apply from"));
check("D8 2027 milestone articles stay within Sections 1-3", "served",
  ["Art. 43", "Art. 47", "Art. 49", "Art. 72", "Art. 73"].every((a) => !milestone("2027-12-02")?.articles.includes(a)));

check("D9 Arts. 102-110 from 27 July 2026 (Art. 113(3)(d))", "law",
  inLaw("Articles 102 to 110 shall apply from 27 July 2026"));

check("D10 legacy GPAI until 2 Aug 2027 (Art. 111(3))", "law",
  nearAnchor(ART111, "general-purpose AI models", "2 August 2027", 500));
check("D10", "served", dates.legacyGpaiCompliance === "2027-08-02" && milestone("2027-08-02") !== undefined);

check("D11 legacy synthetic-content Art. 50(2) by 2 Dec 2026 (Art. 111(4))", "law",
  inLaw("comply with Article 50(2) by 2 December 2026"));
check("D11", "served", milestone("2026-12-02")?.articles.includes("Art. 111(4)"));

check("D12 Omnibus entry into force: third day after publication (Art. 4)", "law",
  inLaw("shall enter into force on the third day following that of its publication in the Official Journal", OMNIBUS));
check("D12 served enactment record", "served",
  omnibusEnactment.celex === "32026R1744" && omnibusEnactment.ojPublicationDate === "2026-07-24" && omnibusEnactment.entryIntoForce === "2026-07-27");

// ── Thresholds and amounts ───────────────────────────────────────────────────

check("T1 GPAI systemic-risk presumption: strictly greater than 10^25 FLOPs", "law",
  ART51.includes("measured in floating point operations is greater than 10") && nearAnchor(ART51, "greater than 10", "25", 12));
{
  const h = toolHandler((await import("./dist/tools/gpai-systemic.js")).registerGpaiSystemicTool);
  const at = (await h({ training_flops: 1e25 })).structuredContent;
  const over = (await h({ training_flops: 1.0000001e25 })).structuredContent;
  check("T1", "served", at.crosses_flops_threshold === false && over.crosses_flops_threshold === true);
}

check("P1 Art. 99(3): EUR 35 000 000 / 7 %, whichever higher", "law",
  nearAnchor(ART99, "35 000 000", "7 %", 400) && nearAnchor(ART99, "35 000 000", "whichever is higher", 400));
check("P1", "served", (() => { const t = getPenaltyTier("prohibited"); return t.maxFineEUR === 35000000 && t.globalTurnoverPercentage === 7; })());

check("P2 Art. 99(4): EUR 15 000 000 / 3 %, incl. new point (da)", "law",
  nearAnchor(ART99, "15 000 000", "3 %", 400) && nearAnchor(ART99, "(da)", "Article 25(2) and (4)", 200));
check("P2", "served", (() => { const t = getPenaltyTier("high_risk"); return t.maxFineEUR === 15000000 && t.globalTurnoverPercentage === 3; })());

check("P3 Art. 99(5): EUR 7 500 000 / 1 %", "law",
  nearAnchor(ART99, "7 500 000", "1 %", 400) && nearAnchor(ART99, "7 500 000", "incorrect, incomplete or misleading information", 400));
check("P3", "served", (() => { const t = getPenaltyTier("false_info"); return t.maxFineEUR === 7500000 && t.globalTurnoverPercentage === 1; })());

check("P4 Art. 99(6) SME lower-of covers paragraphs 3, 4 and 5", "law",
  inLaw("in the case of SMEs, including start-ups, each fine referred to in paragraphs 3, 4 and 5") || inLaw("In the case of SMEs, including start-ups, each fine referred to in this Article"));
check("P4", "served", calculateMaxFine("prohibited", 1e9, true).applicableFine === 35000000);

check("P5 Art. 99(6a) SMC lower-of covers paragraphs 4 and 5 ONLY", "law",
  inLaw("In the case of SMCs, each fine referred to in paragraphs 4 and 5"));
{
  const h = toolHandler((await import("./dist/tools/penalties.js")).registerPenaltiesTool);
  const smcHigh = (await h({ violation_type: "high_risk", annual_turnover_eur: 1e9, is_sme: false, is_smc: true })).structuredContent;
  const smcPro = (await h({ violation_type: "prohibited", annual_turnover_eur: 1e9, is_sme: false, is_smc: true })).structuredContent;
  check("P5", "served", smcHigh.max_fine.applicable_fine_eur === 15000000 && smcPro.max_fine.applicable_fine_eur === 70000000);
}

check("P6 Art. 101: 3 % or EUR 15 000 000, whichever higher, no SME rule", "law",
  ART101.includes("15 000 000") && ART101.includes("3 %") && ART101.includes("whichever is higher") && !ART101.includes("SMC") && !ART101.includes("SMEs"));
check("P6", "served", (() => { const t = getPenaltyTier("gpai"); return t.maxFineEUR === 15000000 && t.smeLowerApplies === false; })());

check("P7 Art. 100 EDPS: EUR 1 500 000 (Art. 5) / EUR 750 000", "law",
  ART100.includes("1 500 000") && ART100.includes("750 000"));
check("P7", "served", /1,500,000|1\.5 million|EUR 1,500,000/.test(art("100")?.summary ?? "") || /1 500 000/.test(art("100")?.summary ?? ""));

check("N1 Art. 52(1): notify without delay, within two weeks", "law",
  inLaw("in any event within two weeks"));
check("N1", "served", /two weeks/.test(JSON.stringify((await (toolHandler((await import("./dist/tools/gpai-systemic.js")).registerGpaiSystemicTool))({ training_flops: 2e25 })).structuredContent.notification_duty)));

// ── Exceptions, carve-outs and structural rules ──────────────────────────────

check("E1 Annex III(1)(a) verification exclusion", "law",
  inLaw("verification the sole purpose of which is to confirm that a specific natural person is the person he or she claims to be"));
check("E1", "served", (() => {
  const d = annexIIICategories.find((c) => c.number === 1)?.description ?? "";
  // Semantic, not lexical: the exclusion must be STATED as an exclusion.
  return /verification/i.test(d) && /exclu/i.test(d) && !/verification[^.]{0,80}(is|are)[^.]{0,40}high-risk/i.test(d);
})());

check("E2 Annex III(5)(b) financial-fraud carve-out", "law",
  inLaw("with the exception of AI systems used for the purpose of detecting financial fraud"));
check("E2", "served", /detecting financial fraud/.test(annexIIICategories.find((c) => c.number === 5)?.description ?? ""));

check("E3 Annex III(7)(d) travel-document verification scope", "law",
  inLaw("with the exception of the verification of travel documents"));
check("E3", "served", /travel[- ]document/i.test(annexIIICategories.find((c) => c.number === 7)?.description ?? "") || /travel documents/i.test(JSON.stringify(annexIIICategories.find((c) => c.number === 7) ?? {})));

check("E4 Art. 6(3) profiling override sits in the THIRD subparagraph", "law",
  // Art. 6(6) empowers amending "paragraph 3, second subparagraph" = the conditions list,
  // so the profiling sentence is the third. Both facts must be in the corpus.
  inLaw("Notwithstanding the first subparagraph, an AI system referred to in Annex III shall always be considered to be high-risk where the AI system performs profiling") && inLaw("paragraph 3, second subparagraph"));
{
  const h = toolHandler((await import("./dist/tools/art6-exception.js")).registerArt6ExceptionTool);
  const r = (await h({ performs_profiling: true, narrow_procedural_task: true, no_significant_risk_to_health_safety_fundamental_rights: true })).structuredContent;
  check("E4", "served", /third subparagraph/.test(JSON.stringify(r)) && !/second subparagraph/.test(JSON.stringify(r)));
}

check("E5 Art. 6(1a) non-safety assistance not a safety component", "law",
  inLaw("solely used for non-safety related aspects of user assistance"));
check("E5", "served", /6\(1a\)/.test(art("6")?.summary ?? ""));

check("E6 Art. 6(1c) radio-spectrum conformity does not fulfil 6(1)(b)", "law",
  inLaw("risks relating to the distribution of radio spectrum"));
check("E6", "served", /radio spectrum/.test(art("6")?.summary ?? ""));

check("E7 Art. 10(5) deleted; special-category processing moved to Art. 4a", "law",
  inLaw("Processing of special categories of personal data for bias detection and correction") && ART10.includes("—————"));
check("E7", "served", /deleted/.test(art("10")?.summary ?? "") && art("4a") !== undefined);

check("E8 Art. 4a safeguards + paragraph 2 + no-obligation sentence", "law",
  inLaw("including synthetic or anonymised data") && inLaw("deleted once the bias has been corrected") && inLaw("Providers and deployers of other AI systems and models") && inLaw("does not create any obligation to conduct such bias detection"));
check("E8", "served", /synthetic or anonymised/.test(art("4a")?.summary ?? "") && /delet/i.test(art("4a")?.summary ?? "") && /other AI systems and models/i.test(art("4a")?.summary ?? "") && /does not create any obligation/.test(art("4a")?.summary ?? ""));

check("E9 Art. 5(1)(ba) consent standard", "law",
  inLaw("freely-given, specific, informed, unambiguous and explicit consent"));
check("E9", "served", /freely[- ]given, specific, informed, unambiguous and explicit consent/.test(art("5")?.summary ?? ""));

check("E10 Art. 5(1)(bb) CSAM full clause incl. the without-right defence", "law",
  inLaw("within the meaning of Article 2, points (c) and (e), of Directive 2011/93/EU, except where a \u2018without right\u2019 defence applies under national law"));
check("E10", "served", /2011\/93/.test(art("5")?.summary ?? "") && /without right.{0,15}defence applies under national law/.test(art("5")?.summary ?? ""));
check("E10b Art. 5(1b) qualifies point (ba) only", "law",
  inLaw("For the purposes of paragraph 1, first subparagraph, point (ba), an AI system that manipulates material in a way that does not increase the exposure"));
check("E10b", "served", /\(1b\) qualifies point \(ba\) ONLY/i.test(art("5")?.summary ?? ""));

check("E11 Art. 49(1) registration: Annex III except point 2", "law",
  inLaw("with the exception of high-risk AI systems referred to in point 2 of Annex III"));

check("E12 Art. 73 windows: 15 days / 2 days / 10 days", "law",
  ART73.includes("not later than 15 days") && ART73.includes("not later than two days") && ART73.includes("not later than 10 days"));
check("E12", "served", /15 days/.test(art("73")?.summary ?? "") && /10 days/.test(art("73")?.summary ?? "") && /(2|two) days/.test(art("73")?.summary ?? ""));

check("E13 verification exclusion served as SCOPED, never minimal/high-risk", "served", await (async () => {
  const h = toolHandler((await import("./dist/tools/classify.js")).registerClassifyTool);
  const r = (await h({ signals: { uses_biometrics: true, biometric_sole_purpose_verification: true } })).structuredContent;
  return /Not high-risk under Annex III\(1\)\(a\)/.test(r.obligations_summary) && r.risk_classification !== "minimal" && r.risk_classification !== "high-risk";
})());

// ── Summary ──────────────────────────────────────────────────────────────────
console.log(`\nCLAIM MATRIX RESULTS: ${pass} passed, ${fail} failed out of ${pass + fail} checks`);
if (fail > 0) process.exit(1);
