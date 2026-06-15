# EU-AI-Act-MCP: Verifikation der Audit-Fixes (2026-06-15)

**Verifikationsstandard.** Die MCP ist ein Informationswerkzeug, ausdrücklich keine Rechtsberatung (Disclaimer in `src/constants.ts`, ausgegeben in jedem Tool-Ergebnis). Der Prüfmaßstab ist daher die faktentreue Wiedergabe der Verordnung (EU) 2024/1689, nicht eine anwaltliche Einzelfallprüfung. Dieser Maßstab ist in-house verifizierbar, und genau das wurde gemacht. Kein externer Counsel-Gate.

## Verifikationskette

1. Codex (unabhängiges Zweitmodell) auditierte die ausgelieferte Version: FIX-FIRST, 56/100.
2. Codex behob alle Befunde, web-gegroundet an offiziellen Kommissionsquellen.
3. Claude las alle 10 Korrekturen unabhängig gegen den OJ-Primärtext (CELEX 32024R1689, vollständiges PDF) gegen: alle bestätigt.
4. Objektive Gates unabhängig gefahren: clean rebuild grün, 166/166 Tests, Server startet ohne Importfehler, dist reproduzierbar (`rm -rf dist && npm run build` ergibt null Diff zum committeten dist).

## Primärtext-bestätigte Korrekturen

- Art. 5(1)(c) Social Scoring: keine Behörden-Beschränkung (öffentliche UND private Akteure).
- Art. 5(1)(h) RBI: "in publicly accessible spaces ... for the purposes of law enforcement" ist erforderlich.
- Art. 5(1)(h)(iii): Verweis auf Annex II (nicht IIa).
- Art. 6(3): "does not pose a significant risk ... AND ... any of the following conditions"; Profiling immer hochriskant.
- Art. 50: Provider 50(1)/(2), Deployer 50(3)/(4); maschinenlesbare Kennzeichnung = 50(2); 50(5) = Zeitpunkt/Klarheit.
- Art. 99(4)(g): Art-50-Transparenzverstöße in der 99(4)-Stufe (15M/3%); 99(5) = Falschauskunft an Behörden.
- Annex III(5)(b) Kreditwürdigkeit mit Fraud-Carve-out; (5)(c) nur Lebens- und Krankenversicherung.
- Art. 113: Anwendung ab 2.8.2026, Verbote ab 2.2.2025, Art. 6(1) ab 2.8.2027.
- GPAI: Pflichten provider-seitig (Art. 53/55), systemisches Risiko ab 10^25 FLOPs (Art. 51).
- Release: vollständiges, reproduzierbares dist.

## Ehrliche Restpunkte (in-house, kein Anwalt nötig)

1. **Coverage:** das Audit fixte die von Codex GEFUNDENEN Stellen, kein 100-Prozent-Zeilenaudit jeder Provision. Ein frischer adversarialer Codex-Coverage-Sweep wurde danach gefahren und fand WEITERE Fehler jenseits der ersten 10; diese sind in der zweiten Runde unten behoben und verifiziert. Vollständige formale Abdeckung jeder Provision bleibt asymptotisch, nicht bewiesen.
2. **Disclaimer ist load-bearing** und vorhanden; er muss es bleiben (er trägt die Nicht-Beratungs-Positionierung).
3. Weder Codex noch Claude sind auf EU-Recht unfehlbar; Korrektur-Offenheit ist der Standard, kein einmaliger Freibrief.
4. Der Klassifizierer bleibt signal-/keyword-basiert, keine vollsemantische Subsumtion (bewusste Werkzeuggrenze, vom Disclaimer abgedeckt).

## Zweite Runde: Coverage-Sweep-Fixes (2026-06-15, Codex-Producer, Claude-Grader)

Codex fuhr den Coverage-Sweep und behob die Funde direkt (Producer). Claude las jeden Fix unabhängig gegen den OJ-Primärtext (CELEX 32024R1689, lokales PDF) gegen (Grader). Objektive Gates erneut selbst gefahren: clean rebuild grün, **191/191 Tests**, dist byte-reproduzierbar (`rm -rf dist && npm run build` ergibt null Diff). OJ-Zeilenanker beziehen sich auf `/tmp/oj1689.txt`.

P1 (klassifikations-, pflicht- oder bußgeldrelevant), alle am Primärtext bestätigt:

- **Art. 6(1) kumulativ** (OJ 3628-3637): Hochrisiko nur bei Sicherheitsbauteil/Produkt unter Anhang I UND Drittkonformitätsbewertung. Neues Pflichtsignal `requires_third_party_conformity_assessment`; sonst konservativ `insufficient_information`.
- **Biometrie nicht pauschal Annex III** (OJ 8470-8473): reine Verifikation (eine-zu-eins) ist von Annex III(1)(a) ausgenommen. Pauschales `biometrics`-Mapping entfernt; neue Signale `biometric_sole_purpose_verification`, `biometric_remote_identification`.
- **Travel-Document-Verification** (OJ 8579): Annex III(7)(d) nimmt die Verifikation von Reisedokumenten ausdrücklich aus.
- **GPAI-Bußgelder = Art. 101** (OJ 7947-7951): Geldbußen gegen GPAI-Modell-Anbieter verhängt die Kommission nach Art. 101, getrennt vom Member-State-Regime des Art. 99. Neuer Penalty-Typ `gpai`, Tier `tier-gpai`.
- **Kein KMU-Lower-Cap auf Art. 101** (OJ 7842-7843): Art. 99(6) ist auf "this Article" = Art. 99 beschränkt. `smeLowerApplies=false` für Art. 101.
- **Chapter-XII-Datum** (OJ 8309-8312): Kap. XII ab 2.8.2025, mit Ausnahme von Art. 101 (ab allgemeinem Datum 2.8.2026). Framework-Datum auf 2025-08-02 korrigiert.
- **Art. 49 Registrierung bedingt** (OJ 5541-5575): Anknüpfung an Annex III, Ausnahme Nr. 2; Anhang-I-Hochrisiko (Art. 6(1)) ist nicht erfasst. Art. 49 wird bei `annex_i` und Annex III Nr. 2 herausgefiltert.
- **Art. 26(5) Deployer-Monitoring** (OJ 4602-4609): überwachen, unterrichten und Nutzung aussetzen bei Risiko nach Art. 79(1).
- **Art. 111(3) GPAI-Altmodelle** (OJ 8214-8215): vor 2.8.2025 in Verkehr gebrachte GPAI-Modelle Erfüllung bis 2.8.2027.
- **Annex III Nr. 6 Suppressoren** (OJ 8528-8555): Nr. 6 ist individuumsbezogen; generische aggregierte Kriminalitätsanalyse und profilierungsfreie Szenarien lösen nicht automatisch Hochrisiko aus.

P2, am Primärtext bestätigt:

- **Art. 12 vs. Art. 19 / Art. 26(6)** (OJ 3994, 4335-4339, 4618-4621): Art. 12 = technische Logging-Fähigkeit; Aufbewahrung (min. sechs Monate) bei Art. 19 (Anbieter) und Art. 26(6) (Deployer).
- **Art. 26(7) / 26(11) / Art. 86** (OJ 4629-4632, 4687-4690, 7456-7463): (7) Arbeitnehmerinformation; (11) Information betroffener natürlicher Personen; Art. 86 Recht auf Erklärung.
- **Annex III Nr. 8 Kampagnenlogistik** (OJ 8591-8594): admin/logistische Kampagnentools, deren Output Personen nicht unmittelbar ausgesetzt sind, sind ausgenommen.
- **Art. 51 vs. Art. 52** (OJ 5651-5681): Art. 51 = Klassifikationskriterien systemisches Risiko (inkl. 10^25 FLOPs in 51(2)); Benachrichtigung = Art. 52(1).

P3:

- FAQ-Header 20 auf 24 korrigiert; Digital-Omnibus als `[UNVERIFIED against local OJ text]` markiert (korrekte Haltung, liegt außerhalb CELEX 32024R1689).
- **Grader-Fund (Claude):** `penalties.ts` Note sagte "AI Office can fine ... under Art. 101". Art. 101(1) verhängt die KOMMISSION die Geldbuße (AI Office beaufsichtigt, Art. 88). Auf "The Commission (supervised via the AI Office) ..." korrigiert. Rebuild + 191/191 grün nach dem Fix.

Codex-Selbstscore: 90/100. Claude-Grader: alle 16 Funde am Primärtext bestätigt, Code-Stichproben (Penalty-Tier, KMU-Gating, Art.-6(1)-Gate, Biometrie-Gate) deckungsgleich, ein zusätzlicher P3-Fund selbst behoben.

## Fazit

Für ein deklariert nicht-beratendes Informationswerkzeug ist der Maßstab (Faktentreue zum Primärtext plus Disclaimer) erfüllt und in-house verifiziert, jetzt über zwei Audit-Runden und einen unabhängigen Grader-Durchgang. Ein Merge nach main ist gegenüber dem bisherigen main (kaputtes dist plus falsches Recht) eine strikte Verbesserung. Vollständige Provisions-Coverage bleibt asymptotisch und ist kein Freibrief. Über Merge, Push und Release entscheidet Werner.

## v1.3.0: Source-State-Awareness und Digital-Omnibus-Cross-Read (2026-06-15)

Werner stellte den EUR-Lex-Proposaltext COM(2025) 836 final lokal bereit (WAF-blockiert per WebFetch). Claude las ihn gegen die von Codex behaupteten Deltas (pdftotext-Extrakt). Die offiziellen Omnibus-Eckdaten wurden zusätzlich direkt auf den Kommissionsseiten (digital-strategy.ec.europa.eu, nicht WAF-blockiert) bestätigt.

Am Proposaltext bestätigt (Status `commission_proposal`):

- **Art. 113-Mechanismus** (Proposal §31, com836 Z. 1496-1513, wörtlich): Kapitel III Sektionen 1-3 gelten nach einem Kommissionsbeschluss, 6 Monate danach für Art. 6(2)/Annex III, 12 Monate für Art. 6(1)/Annex I; Backstop 2.12.2027 bzw. 2.8.2028.
- **Art. 50(2)-Übergang** (§30, neuer Art. 111(4), com836 Z. 1491-1495): Synthetik-Content-Systeme, die vor 2.8.2026 in Verkehr gebracht wurden, erfüllen Art. 50(2) bis **2.2.2027**.
- Art. 4 Literacy-Recast (§4), neuer Art. 4a ersetzt Art. 10(5) (§5), Art. 75 AI-Office-Zentralisierung (§25), Art. 99 SMC-Bußgeldprivilegien (§29), Art. 72 PMM-Guidelines (§24).

Auf den Kommissionsseiten bestätigt (Status `political_agreement`): Einigung **7.5.2026**; Hochrisiko-Timeline **2.12.2027 / 2.8.2028** (regulatory-framework-ai, Stand 11.5.2026; Pressemitteilung 7.5.2026).

Korrekt NICHT im Proposal: das Nudification/CSAM-Verbot (Art. 5). Es stammt aus der politischen Einigung, nicht aus COM(2025) 836. Codex hatte das korrekt zugeordnet.

Drei Fehler im alten Freitext-Block korrigiert: Proposaldatum 2025-12-04 (richtig 19.11.2025); Art.-50(2)-Datum 2.12.2026 (richtig 2.2.2027); Registrierungspflicht für Art.-6(3)-ausgenommene Systeme als "REMAINS MANDATED" behauptet, obwohl das Proposal sie streicht. Die Divergenz Proposal vs. Einigung ist jetzt ausdrücklich als OJ-Konsolidierungspunkt markiert.

Build: Source-State-Registry plus Omnibus-Pack, `euaiact_check_deadlines` mit `include_pending_omnibus` (default aus), Resource `euaiact://omnibus`. Gates selbst gefahren: **215/215 Tests**, dist byte-reproduzierbar, `createServer` ohne Fehler. Die Default-Antwort bleibt aktuelles OJ-Recht; der Omnibus erscheint nur opt-in und quellzustands-etikettiert.

Restpunkt: Guidance-, Standards-, Art.-50-Code- und GPAI-Code-Quellen aus dem Research-Memo sind ein verifizierter Follow-on, bewusst noch nicht enthalten. Nichts im Omnibus-Pack ist geltendes Recht; vor einem Flip auf `enacted_oj` ist der konsolidierte OJ-Text zu prüfen.

### Grader-Runde: Codex graderte v1.3.0 (Producer Claude), FIX-FIRST 78, alle Funde behoben

Codex prüfte den von Claude gebauten v1.3.0-Code unabhängig (Producer != Grader) und vergab FIX-FIRST 78/100. Claude reproduzierte jeden Fund am Code und am Primärtext und behob alle. Empirisch bestätigt durch direkten Tool-Aufruf: der Default-Output enthält keine Pending-Daten mehr, der Opt-in-Output schon. Gates: 225/225 Tests, dist byte-reproduzierbar, `createServer` ohne Fehler.

- **P1, Default-Leak** (`tools/deadlines.ts`, `server.ts`): Das immer mitgelieferte `digital_omnibus`-Summary und die `euaiact://timeline`-Resource gaben die Verschiebungsdaten (2.12.2027, 2.8.2028) und das Nudification-Verbot auch ohne Opt-in aus. Behoben: Default liefert nur noch einen etikettierten Pointer ohne konkrete Pending-Daten; die vollen Daten nur bei `include_pending_omnibus` bzw. in `euaiact://omnibus`.
- **P1, Source-Tag-Fehler** (`sources.ts`): Die Kommissions-Overview-Seite war als `enacted_oj` getaggt. Behoben: aus der Registry entfernt, ihre Provenienz in die Agreement-Note gefaltet. Jetzt genau eine `enacted_oj`-Quelle (das OJ-Instrument).
- **P1, grober Timeline-Tag** (`digital-omnibus.ts`): Behoben durch Trennung `mechanismSourceStatus` (commission_proposal) und `backstopSourceStatus` (political_agreement).
- **P2, Delta-Pack unvollständig**: fünf weitere verifizierte Deltas ergänzt (Art. 11/17, Art. 28/29/30 plus Annex XIV, Art. 43, Art. 57/60, Art. 95/96) plus ein ausdrücklicher `coverageNote`, dass die Liste kuratiert und nicht erschöpfend ist.
- **P2, False-Green-Tests**: Die Guardrails prüften nur die Milestone-Liste, nicht die ganze Default-Antwort. Behoben: die Tests prüfen jetzt die gesamte serialisierte Default-Antwort auf Pending-Daten und den Opt-in-Pfad auf deren Vorhandensein.

Lehre: Claude hatte zuvor gesagt, die Default-Timeline könne nicht mit Pending-Daten verunreinigt werden. Das galt für die Milestone-Liste, nicht für die volle Antwort. Der Grader-Pass fing genau diese Lücke. Producer != Grader hat sich erneut ausgezahlt.

Re-Grade nach den Fixes: Codex GO-WITH-CONDITIONS, 92/100, alle sechs Funde am kompilierten Tool-Handler als geschlossen bestätigt (gleicher Befund wie Claudes eigener empirischer Check). Zwei nicht-blockierende Hardening-Hinweise umgesetzt: die `source_status`-Felder der Timeline sind jetzt ein Enum statt String, und der Legacy-Export `omnibusSummary` trägt einen Warnkommentar, dass er die vollen Pending-Daten enthält und nur auf Opt-in-Pfaden ausgegeben werden darf. 225/225 Tests, dist reproduzierbar. Damit ist die Schleife (Audit 56, Coverage-Fixes, v1.3.0-Build, Grader 78, Re-Grade 92) konvergiert; offene P1/P2 gibt es keine.
