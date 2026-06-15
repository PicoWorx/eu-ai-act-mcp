# EU-AI-Act-MCP: Codex-Audit 2026-06-15, Fix-Liste

Quelle: Codex-Deep-Dive auf remote-truth (origin/main `71ec687`), plus Reproduktion durch Claude (Stand 2026-06-15). Verdikt: **FIX-FIRST, 56/100 wie ausgeliefert** (Source ~70/100, wenn dist neu gebaut wird). Reproduziert wurden P1.1, P1.2 und das Art-6(3)-Boolean; die übrigen Legal-Befunde decken sich mit dem Verordnungstext (2024/1689). Strategisch wichtig: die MCP ist das deterministische Differenzierungs-Primitiv. Ein deterministisch FALSCHES Primitiv ist schlimmer als keins, weil ihm vertraut wird. Diese Korrekturen haben Vorrang vor jeder Erweiterung.

## P1 (vor jedem Push / vor produktivem Einsatz)

1. **Stale dist committet (Release-Hygiene, dist-version-drift erneut).** `dist/tools/penalties.js` und `dist/schemas/penalties.js` fehlen, obwohl die Quellen existieren; `package.json` main/bin zeigen auf `dist/`. `node dist/index.js` startet nicht. Fix: `npm run build`, vollständiges dist committen; Pre-Publish-/CI-Check ergänzen, der dist gegen Source verifiziert (Prävention laut wiki `lessons/dist-version-drift`).
2. **Social Scoring zu eng auf "public authorities".** Finaler AI Act (Art. 5(1)(c), Erwägungsgrund 31) erfasst öffentliche UND private Akteure. Korrigieren in `src/knowledge/articles.ts:52`, `src/knowledge/annex-iii.ts:232/234`, und besonders `src/tools/classify.ts:124` (Klassifizierer-Output, kann ein privates Social-Scoring-System fälschlich durchwinken). Höchste Legal-Priorität, weil im Klassifizierungspfad.
3. **Falsche Zitate / Akteurszuordnung.** Annex IIa für Art. 5(1)(h) (`annex-iii.ts:299`); FAQ nennt Art. 50(5) für maschinenlesbare Kennzeichnung, korrekt ist Art. 50(2) (`faq-database.ts:135`); Limited-Risk-Pflichten weisen Art. 50(3)/(4) dem Provider zu, wo die Deployer-Abgrenzung zählt (`obligations.ts:283/291`).
4. **Falsche Bußgeld-Stufe.** `euaiact_get_obligations` fällt für Limited-Risk-Transparenzverstöße auf Art. 99(5) durch (`obligations.ts:43`); Art-50-Verstöße gehören in die Art-99(4)-Stufe.
5. **Art-6(3)-Boolean ist ein False-Green.** `art6-exception.ts:63` setzt `exception_available: true`, sobald eine Bedingung gilt (kein Profiling); die Schwelle "kein erhebliches Risiko" steht nur in der Prosa, nicht im Boolean. Fix: "no significant risk" als expliziten Input gaten ODER das Feld umbenennen (z.B. `exception_may_apply`) und den Default vorsichtig halten.

## P2

6. **RBI ohne `publicly_accessible_space`-Feld.** `classify.ts:134` stuft schon aus biometrics + realtime + law_enforcement als verboten ein; Art. 5(1)(h) verlangt den öffentlich-zugänglichen-Raum-Bezug.
7. **GPAI-Rollen-Mismatch.** `get_obligations` akzeptiert role=deployer + risk=gpai und liefert Provider-GPAI-Pflichten, behält aber role:deployer (`obligations.ts:19`).
8. **Deadline split-brain.** README caveatet den Digital Omnibus, aber die Resource hardcodet 2026/2027 (`server.ts:64`). Gegen `no-hardcoded-countdowns` und die kanonische Deadline-Synthese ausrichten; provisorische Timeline nur mit "falls angenommen"-Rahmung.
9. **Annex III(5) zu breit** für Versicherung und essential services (`annex-iii.ts:126`); Nr. 5 c ist Risikoabschätzung/Preisbildung bei Lebens- und Krankenversicherung, nicht jede Versicherung.

## Meta-Lücke (der eigentliche Grund, warum das durchrutschte)

`npm run build` + `node test.mjs` = 110 passed, 0 failed. Die Tests prüfen Struktur und Verhalten, NICHT die rechtliche Korrektheit, und nicht das ausgelieferte dist. Daher fingen sie weder die Legal-Fehler noch die dist-Staleness. Fix: adversariale Legal-Testfälle ergänzen (privates Social Scoring, nicht-öffentliche RBI, Limited-Risk-Deployer-Pflichten, GPAI-Rollen-Mismatch, Art-6(3)-no-significant-risk-Gating) plus ein dist-Konsistenz-Check.

## Reihenfolge

dist regenerieren + committen (schnell) -> Legal-Knowledge korrigieren (social scoring, Art-50-Rollen, Art-99-Stufen, Art-6(3)-Boolean, Annex IIa, Annex III(5)) mit Werner-/Counsel-Sicht -> adversariale Tests ergänzen -> dann erst Erweiterungen. Alles Lexbeam-eigenes Repo, kein Client-Repo; Werner entscheidet Commit/Release.
