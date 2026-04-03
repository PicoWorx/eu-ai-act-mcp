/**
 * Text matching utilities for EU AI Act classification.
 *
 * Uses keyword overlap scoring with stemming-aware substring matching.
 * Not a replacement for legal analysis - provides a first-pass signal.
 */
export declare function normalizeText(text: string): string;
/**
 * Calculates how many keywords from a list appear in the input text.
 * Uses substring matching with basic stemming tolerance:
 * - Strips trailing 's', 'es', 'ing', 'ed', 'tion' for broader matching
 * - Checks both exact substring and stem-matched substring
 *
 * Returns a score from 0 to 1 (fraction of keywords matched).
 */
export declare function calculateKeywordOverlap(text: string, keywords: string[]): number;
/**
 * Finds the best-matching item from a list using word overlap scoring.
 * Compares the input text against a specified text field on each item.
 */
export declare function findBestMatch<T extends Record<string, any>>(text: string, items: T[], keywordField: keyof T): {
    item: T | null;
    confidence: "high" | "medium" | "low";
};
//# sourceMappingURL=matching.d.ts.map