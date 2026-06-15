# EU-AI-Act-MCP Fix Report, 2026-06-15

## Gesamtverdikt

Status: GO-WITH-CONDITIONS für Werner/Counsel Review.

Selbst-Score: 93/100.

Vorher: 56/100 wie ausgeliefert von `origin/main` `71ec687`.

Nachher: 93/100 auf `fix/codex-audit-2026-06-15`.

Dieser Score ist eine Producer-Selbstbewertung. Eine unabhängige Re-Validierung bleibt erforderlich.

## Dimensions-Score

* Runtime und Release-Hygiene: 95/100. `dist` ist vollständig regeneriert, `node dist/index.js` startet ohne Importfehler, 120 Dist-Dateien vorhanden.
* Rechtskorrektheit der behobenen Befunde: 93/100. Alle P1/P2-Befunde aus der Fixliste wurden adressiert und quellengeführt dokumentiert.
* Deterministische Klassifizierung: 92/100. Private Social Scoring, RBI ohne öffentlich zugänglichen Raum und Annex III(5)-Versicherungskanten sind jetzt getestet.
* Testabdeckung: 94/100. Suite von 110 auf 166 Tests erweitert, inklusive dist-gegen-Source-Check für alle 30 `src/**/*.ts`.
* Quellen und Evidence: 91/100. Alle Rechtsänderungen sind in `docs/audit-2026-06-15-fix-evidence.md` mit offiziellen Quellen und Abrufdatum dokumentiert.
* Restrisiko: 88/100. Kein Ersatz für Counsel Review, insbesondere bei Grenzfällen, die semantische Subsumtion statt Keyword-Matching brauchen.

## Fixes mit Primärquelle

1. Stale `dist` behoben.
   * Änderung: `npm run build` regeneriert vollständiges `dist`; fehlende `penalties`, `article`, `gpai-systemic`, `art6`, `annex-iv` Artefakte sind vorhanden und committed.
   * Nachweis: `node dist/index.js` exit 0; `node test.mjs` prüft source zu dist.
   * Rechtsquelle: keine, technischer Fix.

2. Social Scoring nicht mehr auf öffentliche Stellen verengt.
   * Änderung: neues Signal `performs_social_scoring`; Legacy-Signal bleibt Alias. Knowledge Base, Artikelzusammenfassung und Penalty-Beispiel korrigiert.
   * Dateien: `src/schemas/classify.ts`, `src/tools/classify.ts`, `src/knowledge/articles.ts`, `src/knowledge/annex-iii.ts`, `src/knowledge/penalties.ts`, `test.mjs`.
   * Quelle: AI Act Service Desk Art. 5, Linien 263 bis 266; EUR-Lex CELEX 32024R1689.

3. Real-time RBI mit öffentlich zugänglichem Raum gegatet.
   * Änderung: neues Signal `biometric_publicly_accessible_space`; ohne dieses Signal kein Art. 5(1)(h)-Prohibited.
   * Dateien: `src/schemas/classify.ts`, `src/tools/classify.ts`, `test.mjs`.
   * Quelle: AI Act Service Desk Art. 5, Linien 271 bis 275.

4. Annex IIa zu Annex II korrigiert.
   * Änderung: Art. 5(1)(h)-Beschreibung nennt Annex II.
   * Datei: `src/knowledge/annex-iii.ts`.
   * Quelle: AI Act Service Desk Art. 5, Linie 275.

5. Annex III(1) und Annex III(5) geschärft.
   * Änderung: falscher Art.-5(1)(d)-Verweis aus Biometrics entfernt; Annex III(5) von generischem Insurance/Essential-Services-Matching auf spezifische Subfälle verengt.
   * Dateien: `src/knowledge/annex-iii.ts`, `src/tools/classify.ts`, `test.mjs`.
   * Quelle: AI Act Service Desk Annex III, Linien 255 bis 260 und 276 bis 282.

6. Art. 50 Rollen und Absatznummern korrigiert.
   * Änderung: Provider-Pflichten Art. 50(1)/(2), Deployer-Pflichten Art. 50(3)/(4); FAQ verweist machine-readable marking auf Art. 50(2), nicht Art. 50(5).
   * Dateien: `src/knowledge/annex-iii.ts`, `src/knowledge/obligations.ts`, `src/tools/obligations.ts`, `src/knowledge/faq-database.ts`, `test.mjs`.
   * Quelle: AI Act Service Desk Art. 50, Linien 259 bis 269.

7. Limited-Risk-Bußgeld auf Art. 99(4) korrigiert.
   * Änderung: `euaiact_get_obligations` gibt für Limited Risk Art. 99(4) aus; Minimal Risk bekommt keinen falschen Art.-99(5)-Default.
   * Datei: `src/tools/obligations.ts`.
   * Quelle: AI Act Service Desk Art. 99, Linien 263 bis 277.

8. GPAI-Rollen-Mismatch behoben.
   * Änderung: `role=deployer`, `risk_level=gpai` liefert keine Provider-GPAI-Pflichten mehr.
   * Datei: `src/tools/obligations.ts`.
   * Quelle: AI Act Service Desk Art. 53, Linien 261 bis 270; Art. 101, Linien 260 bis 267.

9. Art. 6(3) False-Green behoben.
   * Änderung: neues Gate `no_significant_risk_to_health_safety_fundamental_rights`; ohne dieses Gate bleibt `exception_available` false.
   * Dateien: `src/schemas/art6.ts`, `src/tools/art6-exception.ts`, `test.mjs`.
   * Quelle: AI Act Service Desk Art. 6, Linien 267 bis 278.

10. Timeline-Resource zentralisiert.
    * Änderung: `euaiact://timeline` verwendet `getMilestonesWithDaysRemaining()` und `digitalOmnibus` statt eigener hardcodierter Events.
    * Datei: `src/server.ts`.
    * Quelle: AI Act Service Desk Art. 113, Linien 255 bis 264; Kommissionsseite zur Omnibus-Einigung, Linien 151 bis 161.

## Test-Zählung

Vorher auf Remote-Checkout:

* `node test.mjs` scheiterte wegen fehlendem `dist/schemas/penalties.js`.
* Nach temporärem Rebuild der alten Source: 110/110 Tests grün.

Nachher:

* `npm run build`: grün.
* `node dist/index.js`: exit 0.
* `node test.mjs`: 166/166 Tests grün.

Neue Testgruppen:

* vollständiger source-zu-dist-Check für 30 TypeScript-Source-Dateien.
* privates Social Scoring.
* nicht-öffentliche RBI.
* Limited-Risk-Deployer-Pflichten.
* GPAI-Rollen-Mismatch.
* Art-6(3)-no-significant-risk-Gating.
* Art. 50(2) vs Art. 50(5).
* Art. 99(4) vs Art. 99(5).
* Annex III(5) Leben/Krankenversicherung vs sonstige Versicherung.

## [UNVERIFIED-WEB]

Keine fachliche Rechtsänderung ist als [UNVERIFIED-WEB] offen.

Hinweis: direkter EUR-Lex-Abruf wurde durch eine AWS-WAF/JavaScript-Challenge blockiert. Die verifizierende Arbeit stützt sich deshalb auf offizielle AI-Act-Service-Desk-Seiten der Kommission plus die CELEX-URL. Counsel sollte vor Merge zusätzlich direkt gegen EUR-Lex CELEX 32024R1689 gegenlesen.

## Dist-Status

`dist` ist vollständig neu gebaut und mit `git add -f dist` in den lokalen Commit aufgenommen.

Zahlen:

* Source TypeScript: 30 Dateien.
* Dist-Dateien: 120 Dateien.
* Test-Gate: Jede `src/**/*.ts` hat ein entsprechendes `dist/**/*.js`.

## Branch und Commit-Stand

Branch: `fix/codex-audit-2026-06-15`.

Base: `origin/main` `71ec687f1ce19cf053080cfdef99595a178077f1`.

Fix-Commit: `482877aee7e571e4b873e0cb6489537ad2d64ab3`.

Push: nicht erfolgt.

PR: nicht erstellt.

NPM Publish/Release: nicht erfolgt.

## Restrisiken

1. Keyword-Matching bleibt keine vollsemantische Subsumtion. Die neuen Tests decken die Audit-Lücken ab, aber nicht jede denkbare Annex-III-Grenzfallformulierung.

2. Digital Omnibus bleibt als politische Einigung getrennt vom geltenden Recht. Das ist korrekt, aber Counsel sollte die formale Adoption und Amtsblattveröffentlichung weiter beobachten.

3. Direkter EUR-Lex-Abruf war maschinell blockiert. Die offizielle Kommissionsquelle ist stark, aber Review sollte EUR-Lex im Browser gegenlesen.

4. Art. 6(3) bleibt bewusst vorsichtig. Das Tool kann eine Ausnahme nur als `exception_available` ausgeben, wenn der Nutzer das No-Significant-Risk-Gate affirmativ setzt; die echte Rechtsprüfung bleibt beim Provider und Counsel.
