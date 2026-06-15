# EU-AI-Act-MCP Fix Evidence, 2026-06-15

Audit basis: `origin/main` `71ec687f1ce19cf053080cfdef99595a178077f1`.

Work branch: `fix/codex-audit-2026-06-15`.

Abrufdatum aller Webquellen: 2026-06-15.

## Primärquellen

1. AI Act Service Desk, Article 5, Prohibited AI practices: https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-5
   Quelle ist eine offizielle Kommissionsseite. Die Seite verweist auf den offiziellen EUR-Lex-Text der Artificial Intelligence Act Regulation (EU) 2024/1689.
   Relevante Zeilen: Art. 5(1)(c) auf Linien 263 bis 266, Art. 5(1)(f) auf Linie 269, Art. 5(1)(h) auf Linien 271 bis 275.

2. AI Act Service Desk, Article 6, Classification rules for high-risk AI systems: https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-6
   Relevante Zeilen: Art. 6(1) auf Linien 261 bis 264, Art. 6(2) auf Linie 266, Art. 6(3) auf Linien 267 bis 277, Art. 6(4) auf Linie 278.

3. AI Act Service Desk, Article 50, Transparency obligations: https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-50
   Relevante Zeilen: Art. 50(1) auf Linien 259 bis 260, Art. 50(2) auf Linien 261 bis 263, Art. 50(3) auf Linien 264 bis 265, Art. 50(4) auf Linien 266 bis 269.

4. AI Act Service Desk, Article 99, Penalties: https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-99
   Relevante Zeilen: Art. 99(3) auf Linie 262, Art. 99(4) auf Linien 263 bis 276, Art. 99(5) auf Linie 277, Art. 99(6) auf Linie 278.

5. AI Act Service Desk, Annex III: https://ai-act-service-desk.ec.europa.eu/en/ai-act/annex-3
   Relevante Zeilen: Annex III(1) auf Linien 255 bis 260, Annex III(5) auf Linien 276 bis 282.

6. AI Act Service Desk, Article 53, Obligations for providers of general-purpose AI models: https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-53
   Relevante Zeilen: Art. 53(1) auf Linien 261 bis 270.

7. AI Act Service Desk, Article 101, Fines for providers of general-purpose AI models: https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-101
   Relevante Zeilen: Art. 101(1) auf Linien 260 bis 267.

8. AI Act Service Desk, Article 113, Entry into force and application: https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-113
   Relevante Zeilen: Anwendung ab 2 August 2026 auf Linien 255 bis 258, Ausnahmen auf Linien 261 bis 264.

9. European Commission, AI Act policy page: https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai
   Relevante Zeilen: Timeline auf Linien 151 bis 154, politische Einigung zum AI Omnibus auf Linien 157 bis 161.

10. EUR-Lex CELEX URL für den offiziellen Rechtstext: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689
    Hinweis: direkter Abruf per Browser-Tool und `curl` wurde durch AWS-WAF/JavaScript-Challenge blockiert. Die oben genutzten AI-Act-Service-Desk-Seiten sind offizielle Kommissionsseiten und geben an, den offiziellen EUR-Lex-Text der Verordnung (EU) 2024/1689 zu verwenden.

## Änderungsnachweise

### 1. Social Scoring nicht auf öffentliche Stellen verengen

Dateien und Zeilen:

* `src/schemas/classify.ts`, Linien 59 bis 66
* `src/tools/classify.ts`, Linien 21 bis 50 und 118 bis 132
* `src/knowledge/articles.ts`, Art. 5 Summary
* `src/knowledge/annex-iii.ts`, Linien 231 bis 241
* `src/knowledge/penalties.ts`, Beispieltext
* `test.mjs`, private Social-Scoring-Regression

Alt: Signal und Knowledge Base sagten oder implizierten "by public authorities".

Neu: allgemeines Signal `performs_social_scoring` plus rückwärtskompatibler Legacy-Alias, ohne Public-Authority-Beschränkung.

Provision: Art. 5(1)(c) erfasst Social Scoring für natürliche Personen oder Gruppen, wenn der Score zu nachteiliger Behandlung in unrelated contexts oder zu unjustified/disproportionate treatment führt. Die Vorschrift nennt keine Beschränkung auf öffentliche Stellen.

Quelle: AI Act Service Desk Art. 5, Linien 263 bis 266.

### 2. Real-time RBI braucht öffentlich zugängliche Räume

Dateien und Zeilen:

* `src/schemas/classify.ts`, Linien 31 bis 34
* `src/tools/classify.ts`, Linien 21 bis 42 und 141 bis 150
* `src/knowledge/annex-iii.ts`, Linien 296 bis 317
* `test.mjs`, `signalsNonPublicRbi`

Alt: `uses_biometrics + biometric_realtime + biometric_law_enforcement` genügte für prohibited.

Neu: `biometric_publicly_accessible_space` ist eigenes Gate für Art. 5(1)(h). Ohne dieses Signal wird ein biometrischer Fall nicht als verboten klassifiziert, sondern vorsichtig als Annex III(1) High Risk mit Caveat.

Provision: Art. 5(1)(h) spricht von real-time remote biometric identification systems in publicly accessible spaces for law enforcement.

Quelle: AI Act Service Desk Art. 5, Linien 271 bis 275.

### 3. Annex IIa korrigiert zu Annex II

Dateien und Zeilen:

* `src/knowledge/annex-iii.ts`, Linie 299

Alt: "serious crimes listed in Annex IIa".

Neu: "serious crimes listed in Annex II".

Provision: Art. 5(1)(h)(iii) verweist auf offences referred to in Annex II.

Quelle: AI Act Service Desk Art. 5, Linie 275.

### 4. Annex III(1) Artikelreferenzen korrigiert

Dateien und Zeilen:

* `src/knowledge/annex-iii.ts`, Linie 63

Alt: Annex III(1) referenzierte Art. 5(1)(d), obwohl Art. 5(1)(d) individuelle kriminalrechtliche Risikobewertung betrifft.

Neu: Annex III(1), Art. 6(2), Art. 5(1)(f), Art. 5(1)(g), Art. 5(1)(h), Art. 26(10).

Provision: Annex III(1) betrifft remote biometric identification, biometric categorisation und emotion recognition.

Quelle: AI Act Service Desk Annex III, Linien 255 bis 260.

### 5. Annex III(5) für Versicherung und Essential Services verengt

Dateien und Zeilen:

* `src/tools/classify.ts`, Linien 53 bis 61
* `src/knowledge/annex-iii.ts`, Linien 123 bis 139
* `test.mjs`, life/health insurance und car insurance Regressionen

Alt: generisches `essential_services` Signal wurde direkt Annex III(5), Keywords enthielten generisches "insurance" und "risk assessment".

Neu: kein blindes Domain-Mapping für `essential_services`; Keywords und Beschreibung begrenzen Versicherung auf life and health insurance und die übrigen Annex III(5)-Subfälle.

Provision: Annex III(5)(b) nennt creditworthiness/credit score; Annex III(5)(c) nennt life and health insurance; Annex III(5)(a) und (d) sind ebenfalls spezifisch.

Quelle: AI Act Service Desk Annex III, Linien 276 bis 282.

### 6. Art. 50 Rollen und Absatznummern korrigiert

Dateien und Zeilen:

* `src/knowledge/annex-iii.ts`, Linien 390 bis 418
* `src/knowledge/obligations.ts`, Linien 272 bis 313
* `src/tools/obligations.ts`, Linien 32 bis 35
* `src/knowledge/faq-database.ts`, FAQ 12
* `test.mjs`, Limited-Risk-Deployer, Provider-Marking und Art.-50(5)-Regressionen

Alt: Art. 50(3)/(4) wurden in Teilen Provider-seitig formuliert; FAQ 12 sagte, Art. 50(5) verlange machine-readable marking.

Neu: Provider-Pflichten: Art. 50(1), Art. 50(2). Deployer-Pflichten: Art. 50(3), Art. 50(4). Deepfake Trigger-ID ist `art50-4`.

Provision: Art. 50(2) weist machine-readable marking den Providers zu; Art. 50(3) und Art. 50(4) weisen Informations- und Disclosure-Pflichten Deployers zu.

Quelle: AI Act Service Desk Art. 50, Linien 259 bis 269.

### 7. Bußgeld-Stufe für Art. 50 korrigiert

Dateien und Zeilen:

* `src/tools/obligations.ts`, Linien 52 bis 58
* `test.mjs`, Limited-Risk-Penalty-Regression

Alt: Limited Risk fiel auf Art. 99(5), die false-information-Stufe.

Neu: Limited Risk nutzt Art. 99(4), weil Art. 99(4)(g) Transparenzpflichten nach Art. 50 nennt. Minimal Risk erhält keinen falschen Art.-99(5)-Default mehr.

Provision: Art. 99(4)(g) erfasst transparency obligations pursuant to Article 50; Art. 99(5) erfasst falsche oder irreführende Auskünfte an Behörden.

Quelle: AI Act Service Desk Art. 99, Linien 263 bis 277.

### 8. GPAI-Rollen-Mismatch behoben

Dateien und Zeilen:

* `src/tools/obligations.ts`, Linien 26 bis 28 und 54 bis 58
* `test.mjs`, GPAI-Deployer-Regression

Alt: `role=deployer` plus `risk_level=gpai` lieferte Provider-GPAI-Pflichten.

Neu: Provider-GPAI-Pflichten werden nur bei `role=provider` ausgegeben. Deployer erhalten keinen Providerpflichten-Block und werden auf Downstream-Klassifizierung verwiesen.

Provision: Art. 53 und Art. 101 adressieren providers of general-purpose AI models.

Quelle: AI Act Service Desk Art. 53, Linien 261 bis 270; Art. 101, Linien 260 bis 267.

### 9. Art. 6(3) Boolean gegen False-Green gegatet

Dateien und Zeilen:

* `src/schemas/art6.ts`, Linien 11 bis 14
* `src/tools/art6-exception.ts`, Linien 13 bis 15 und 48 bis 72
* `test.mjs`, Art-6-no-significant-risk-Gating

Alt: Eine der vier Bedingungen plus kein Profiling genügte für `exception_available: true`; das no-significant-risk-Erfordernis stand nur in Prosa.

Neu: `no_significant_risk_to_health_safety_fundamental_rights` ist eigenes Eingabefeld. Ohne dieses Gate bleibt `exception_available` false.

Provision: Art. 6(3) verlangt zuerst kein erhebliches Risiko für health, safety or fundamental rights; danach muss eine der vier Bedingungen greifen. Profiling blockiert die Ausnahme.

Quelle: AI Act Service Desk Art. 6, Linien 267 bis 278.

### 10. Timeline-Resource aus zentraler Deadline-Quelle

Dateien und Zeilen:

* `src/server.ts`, Linien 26 und 61 bis 75

Alt: `euaiact://timeline` enthielt eigene hardcodierte Events und spiegelte den Digital-Omnibus-Caveat nicht.

Neu: Resource verwendet `getMilestonesWithDaysRemaining()` und `digitalOmnibus` aus der zentralen Knowledge-Datei.

Provision: Current-law Art. 113 sagt Anwendung ab 2 August 2026 mit Ausnahmen; die Kommission beschreibt zusätzlich die politische Omnibus-Einigung und deren Timeline als politisch vereinbart.

Quelle: AI Act Service Desk Art. 113, Linien 255 bis 264; Kommissionsseite, Linien 151 bis 161.

### 11. dist und adversariale Tests

Dateien und Zeilen:

* `test.mjs`, Linien 115 bis 128 für dist/source check
* `test.mjs`, weitere neue Regressionen für private Social Scoring, nicht-öffentliche RBI, Art. 50, Art. 99(4), GPAI-Rollen und Annex III(5)

Alt: `dist/tools/penalties.js` und `dist/schemas/penalties.js` fehlten im ausgelieferten Remote-Zustand; Tests deckten das nicht ab.

Neu: `npm run build` regeneriert dist vollständig; `node test.mjs` prüft die vormals fehlenden generierten Entry-Dateien.

Quelle: technischer Build-Nachweis, keine Rechtsquelle.

## [UNVERIFIED-WEB]

Keine fachliche Rechtsänderung ist unverified-web. Direkter EUR-Lex-Abruf war technisch blockiert, aber die genutzten AI-Act-Service-Desk-Seiten sind offizielle Kommissionsseiten und verweisen auf den offiziellen EUR-Lex-Text. Counsel sollte bei Review dennoch gegen EUR-Lex CELEX 32024R1689 gegenlesen.
