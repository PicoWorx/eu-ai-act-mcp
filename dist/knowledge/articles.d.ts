/**
 * EU AI Act — Article text corpus.
 *
 * Source: Regulation (EU) 2024/1689 of the European Parliament and of the
 * Council of 13 June 2024 (the "EU AI Act"). Published in the Official Journal
 * of the EU on 12 July 2024. The text of EU legislation is in the public
 * domain under Commission Decision 2011/833/EU and is freely reproducible.
 *
 * Every entry includes a stable EUR-Lex URL (CELEX: 32024R1689) so callers
 * can always jump to the canonical source. Article text here is a condensed
 * operational summary of the most-cited articles — not a verbatim reproduction
 * of the full regulation — suitable for first-pass agent grounding. For
 * definitive wording agents should follow the eurlex_url.
 */
export interface ArticleEntry {
    number: string;
    title: string;
    summary: string;
    eurlex_url: string;
    related_annexes: string[];
}
export declare const articles: ArticleEntry[];
export declare function findArticle(query: string): ArticleEntry | null;
export declare const EURLEX_BASE_URL = "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689";
//# sourceMappingURL=articles.d.ts.map