/**
 * Text matching utilities for EU AI Act classification.
 *
 * Uses keyword overlap scoring with stemming-aware substring matching.
 * Not a replacement for legal analysis - provides a first-pass signal.
 */
export function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}
/**
 * Calculates how many keywords from a list appear in the input text.
 * Uses substring matching with basic stemming tolerance:
 * - Strips trailing 's', 'es', 'ing', 'ed', 'tion' for broader matching
 * - Checks both exact substring and stem-matched substring
 *
 * Returns a score from 0 to 1 (fraction of keywords matched).
 */
export function calculateKeywordOverlap(text, keywords) {
    if (keywords.length === 0)
        return 0;
    const normalized = normalizeText(text);
    const matches = keywords.filter(kw => {
        const kwLower = kw.toLowerCase();
        // Exact substring match
        if (normalized.includes(kwLower))
            return true;
        // Stem-tolerant match: strip common suffixes from both sides
        const stems = [kwLower, ...getStemVariants(kwLower)];
        const textWords = normalized.split(" ");
        // Check if all words of a multi-word keyword appear in the text
        const kwWords = kwLower.split(" ");
        if (kwWords.length > 1) {
            const allWordsPresent = kwWords.every(word => {
                const wordStems = [word, ...getStemVariants(word)];
                return wordStems.some(stem => textWords.some(tw => tw.startsWith(stem) || stem.startsWith(tw)));
            });
            if (allWordsPresent)
                return true;
        }
        // Single-word keyword: check stem overlap
        return stems.some(stem => textWords.some(tw => tw.startsWith(stem) || stem.startsWith(tw)));
    });
    return matches.length / keywords.length;
}
function getStemVariants(word) {
    const variants = [];
    if (word.endsWith("ing"))
        variants.push(word.slice(0, -3));
    if (word.endsWith("tion"))
        variants.push(word.slice(0, -4));
    if (word.endsWith("ed"))
        variants.push(word.slice(0, -2));
    if (word.endsWith("es"))
        variants.push(word.slice(0, -2));
    if (word.endsWith("s") && !word.endsWith("ss"))
        variants.push(word.slice(0, -1));
    // Also add the word with 's' appended for singular->plural
    if (!word.endsWith("s"))
        variants.push(word + "s");
    return variants.filter(v => v.length > 2);
}
/**
 * Finds the best-matching item from a list using word overlap scoring.
 * Compares the input text against a specified text field on each item.
 */
export function findBestMatch(text, items, keywordField) {
    let bestScore = 0;
    let bestItem = null;
    const normalized = normalizeText(text);
    const words = normalized.split(" ").filter(w => w.length > 2); // skip tiny words
    for (const item of items) {
        const itemText = String(item[keywordField]);
        const itemNormalized = normalizeText(itemText);
        const itemWords = itemNormalized.split(" ").filter(w => w.length > 2);
        // Count words from the query that appear in the item (with stem tolerance)
        let matchCount = 0;
        for (const word of words) {
            const wordStems = [word, ...getStemVariants(word)];
            const matched = wordStems.some(stem => itemWords.some(iw => iw.startsWith(stem) || stem.startsWith(iw)));
            if (matched)
                matchCount++;
        }
        const score = words.length > 0 ? matchCount / words.length : 0;
        if (score > bestScore) {
            bestScore = score;
            bestItem = item;
        }
    }
    const confidence = bestScore > 0.5 ? "high" : bestScore > 0.25 ? "medium" : "low";
    return { item: bestItem, confidence };
}
//# sourceMappingURL=matching.js.map