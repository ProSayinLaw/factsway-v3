/**
 * Draft Reconciler Service
 * 
 * Handles the "Edit Commit Pipeline" required by the Drafting Clerk Contract.
 * Responsibility:
 * 1. Tokenize raw paragraph text into sentences
 * 2. Align new structure with old interactions (IDs)
 * 3. Deterministically resolve splits/merges
 */

/**
 * Basic sentence tokenizer.
 * TODO: Replace with smarter NLP tokenizer in future.
 * Currently uses simple regex for English sentence termination.
 */
function tokenizeSentences(text: string): string[] {
    if (!text || !text.trim()) return [];
    // Split by .!? followed by whitespace or end of string
    // This is a naive implementation but sufficient for architecture proof
    return text.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g)?.map(s => s.trim()) || [text];
}

interface ReconciledSentence {
    id: string; // Old ID if reused, new ID if created
    text: string;
}

/**
 * Reconciles a raw paragraph text edit against a list of existing sentence IDs.
 * 
 * Strategy:
 * - Tokenize new text into N sentences
 * - We have M existing sentence IDs
 * - Reuse first M IDs for first M new sentences (Stable Identity)
 * - If N > M: Create new IDs for extras
 * - If N < M: Existing IDs are dropped (implicitly deleted)
 * 
 * This strategy preserves links/comments on the *position* of the sentence.
 * e.g. The first sentence is still "The first sentence", even if rewritten.
 */
export function reconcileParagraph(
    rawText: string,
    existingSentenceIds: string[]
): ReconciledSentence[] {
    const newSentences = tokenizeSentences(rawText);
    const result: ReconciledSentence[] = [];

    for (let i = 0; i < newSentences.length; i++) {
        const text = newSentences[i];
        if (!text) continue;

        if (i < existingSentenceIds.length) {
            // Reuse existing ID
            result.push({
                id: existingSentenceIds[i],
                text: text
            });
        } else {
            // Create new ID
            result.push({
                id: `s-${crypto.randomUUID()}`,
                text: text
            });
        }
    }

    return result;
}
