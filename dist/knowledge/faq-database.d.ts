/**
 * EU AI Act - FAQ Database
 *
 * 24 frequently asked questions based on top ICP queries.
 * Each answer references specific articles from Regulation (EU) 2024/1689.
 *
 * URLs point to lexbeam.com/de/wissen/[slug] for German-language knowledge base.
 *
 * faq-18 (Digital Omnibus) derives its answer from the `omnibusEnactment`
 * record in digital-omnibus.ts so it flips together with the rest of the
 * server on OJ publication (audit items M2/M3).
 */
export interface FAQEntry {
    id: string;
    question: string;
    answer: string;
    articleReferences: string[];
    keywords: string[];
    lexbeamUrl: string;
    category: string;
}
export declare const faqDatabase: FAQEntry[];
//# sourceMappingURL=faq-database.d.ts.map