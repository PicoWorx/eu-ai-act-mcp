# MCP Server Quality Audit - 2026-04-03

## 1. REGULATORY ACCURACY (verified against content/EU-AI-ACT-TIMELINE.md)

### Deadlines (deadlines.ts)
- [x] Entry into force: 2024-08-01 ✅
- [x] Prohibited practices + AI literacy: 2025-02-02 ✅
- [x] GPAI obligations: 2025-08-02 ✅
- [x] High-risk Annex III: 2026-08-02 ✅
- [x] Annex I regulated products: 2027-08-02 ✅
- [x] Digital Omnibus correctly flagged as PROPOSAL ONLY ✅
- [x] Status field correctly marks first 3 as "in_effect", last 2 as "upcoming" ✅

### Penalties (penalties.ts)
- [x] Prohibited: EUR 35M / 7% ✅ (Art. 99(3))
- [x] High-risk: EUR 15M / 3% ✅ (Art. 99(4))  
- [x] False info: EUR 7.5M / 1% ✅ (Art. 99(5))
- [x] SME rule: whichever is LOWER ✅ (Art. 99(6))
- [x] Large entity rule: whichever is HIGHER ✅

### Obligations penalties reference (obligations.ts)
- [!] ISSUE: High-risk penalty basis says "Art. 99(3)" but should be "Art. 99(4)"
  - Art. 99(3) = prohibited practices (7%)
  - Art. 99(4) = high-risk obligations (3%)
  - The fine amount text is correct, just the article reference is wrong

### Annex III categories (annex-iii.ts)
- [x] 8 categories ✅ (correct count per Annex III)
- [x] Category names match regulation ✅
- [x] Prohibited practices cover all Art. 5(1)(a)-(h) ✅

## 2. CODE QUALITY ISSUES

### Critical
- [!] obligations.ts penalty basis: "Art. 99(3)" should be "Art. 99(4)" for high-risk
- [!] classify.ts: Art. 6(3) exception branch is dead code (isException = false always)
  - Should either implement it or remove the dead branch
- [!] classify.ts: When role="deployer", obligations_summary still says provider text when matched
  - Line: `input.role === "provider"` check works, but role="unknown" defaults to "both" summary which only mentions deployer obligations - inconsistent

### Medium  
- [!] obligations.ts: GPAI obligations imported in knowledge but never exposed via the tool
  - `providerGPAIObligations` and `universalObligations` exist in knowledge but tool only serves provider/deployer high-risk and limited
  - Missing: GPAI provider obligations, universal AI literacy obligation
- [!] findBestMatch() in matching.ts: bag-of-words matching is brittle
  - "What penalties exist?" won't match FAQ about penalties well because it shares few content words
  - Not a blocker but worth noting in docs/caveats
- [!] Schema inconsistency: classify uses snake_case (lexbeam_url, last_updated), obligations uses camelCase (lexbeamUrl)
  - Should be consistent across all tools

### Minor
- [!] No engines field in package.json (should specify node >=18)
- [!] README has no badges (npm version, license)
- [!] No CHANGELOG.md
- [!] smithery.yaml format may not match current Smithery spec

## 3. MISSING COVERAGE
- No tool for GPAI-specific obligations (Art. 51-56)
- No tool for Art. 6(3) exception assessment
- universalObligations (Art. 4 AI literacy) not exposed
- No "what's new" / changelog awareness for regulatory updates

## 4. RECOMMENDATIONS (ship-blocking)
1. Fix Art. 99 reference in obligations.ts
2. Remove dead Art. 6(3) exception branch or implement properly
3. Fix schema case inconsistency (pick one: snake_case or camelCase)
4. Add GPAI + universal obligations to the obligations tool
5. Add engines field to package.json
6. Clean rebuild + test
