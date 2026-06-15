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

1. **Coverage:** das Audit fixte die von Codex GEFUNDENEN Stellen, kein 100-Prozent-Zeilenaudit jeder Provision. Nächster Schritt: ein frischer adversarialer Codex-Sweep, der gezielt nach WEITEREN Fehlern jenseits der 10 sucht.
2. **Disclaimer ist load-bearing** und vorhanden; er muss es bleiben (er trägt die Nicht-Beratungs-Positionierung).
3. Weder Codex noch Claude sind auf EU-Recht unfehlbar; Korrektur-Offenheit ist der Standard, kein einmaliger Freibrief.
4. Der Klassifizierer bleibt signal-/keyword-basiert, keine vollsemantische Subsumtion (bewusste Werkzeuggrenze, vom Disclaimer abgedeckt).

## Fazit

Für ein deklariert nicht-beratendes Informationswerkzeug ist der Maßstab (Faktentreue zum Primärtext plus Disclaimer) erfüllt und in-house verifiziert. Ein Merge nach main ist gegenüber dem bisherigen main (kaputtes dist plus falsches Recht) eine strikte Verbesserung. Über Merge, Push und Release entscheidet Werner.
