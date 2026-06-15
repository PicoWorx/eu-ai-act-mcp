/**
 * EU AI Act — Annex IV: Technical Documentation requirements.
 *
 * Source: Regulation (EU) 2024/1689, Annex IV. Public-domain EU text under
 * Commission Decision 2011/833/EU.
 *
 * Nine items define the minimum technical documentation a provider of a
 * high-risk AI system must prepare before placing the system on the market
 * (Art. 11). SMEs may provide the same information in a simplified form.
 */
export interface AnnexIVItem {
    number: number;
    title: string;
    description: string;
    sub_items: string[];
    related_articles: string[];
}
export declare const annexIVItems: AnnexIVItem[];
//# sourceMappingURL=annex-iv.d.ts.map