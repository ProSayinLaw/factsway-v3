import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { CursorContext, PositionType } from '@/types/drafting';

/**
 * Cursor Store - Tracks the structural cursor position (per Drafting Clerk Contract)
 * 
 * The browser DOM caret is advisory only.
 * This store is the single source of truth for "where the user is" in the document.
 */
export const useCursorStore = defineStore('cursor', () => {
    // The active structural cursor context
    const context = ref<CursorContext | null>(null);

    // Computed: is the user currently in an edit target?
    const hasActiveTarget = computed(() => context.value !== null);

    // Computed: current position type
    const positionType = computed(() => context.value?.positionType ?? null);

    /**
     * Set the cursor to a specific structural position
     */
    function setCursor(ctx: CursorContext) {
        context.value = ctx;
    }

    /**
     * Set cursor to a section header
     */
    function setCursorToSectionHeader(sectionId: string) {
        context.value = {
            sectionId,
            paragraphId: null,
            sentenceId: null,
            offsetInSentence: null,
            positionType: 'sectionHeader'
        };
    }

    /**
     * Set cursor to a sentence
     */
    function setCursorToSentence(
        sectionId: string,
        paragraphId: string,
        sentenceId: string,
        offset: number = 0
    ) {
        context.value = {
            sectionId,
            paragraphId,
            sentenceId,
            offsetInSentence: offset,
            positionType: 'sentence'
        };
    }

    /**
     * Set cursor to an empty paragraph
     */
    function setCursorToParagraph(sectionId: string, paragraphId: string) {
        context.value = {
            sectionId,
            paragraphId,
            sentenceId: null,
            offsetInSentence: null,
            positionType: 'paragraph'
        };
    }

    /**
     * Update the offset within the current sentence (for caret tracking)
     */
    function updateOffset(offset: number) {
        if (context.value && context.value.positionType === 'sentence') {
            context.value.offsetInSentence = offset;
        }
    }

    /**
     * Clear the cursor (no active edit target)
     */
    function clearCursor() {
        context.value = null;
    }

    return {
        context,
        hasActiveTarget,
        positionType,
        setCursor,
        setCursorToSectionHeader,
        setCursorToSentence,
        setCursorToParagraph,
        updateOffset,
        clearCursor
    };
});
