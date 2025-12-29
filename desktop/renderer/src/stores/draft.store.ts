import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { DocumentStructure, SentenceData, ParagraphData, SectionData, EntityType, DraftState } from '@/types/drafting';
import { createMockDraft } from './mock-draft';

export const useDraftStore = defineStore('draft', () => {
    // State
    const draftId = ref<string | null>(null);
    const title = ref<string>('Untitled Draft');
    const structure = ref<DocumentStructure>({
        rootSectionIds: [],
        sections: {},
        paragraphs: {},
        sentences: {}
    });
    const isDirty = ref(false);

    // History Stack
    const history = ref<string[]>([]);
    const future = ref<string[]>([]);

    // Getters
    const isEmpty = computed(() => structure.value.rootSectionIds.length === 0);

    // Actions
    function loadMockDraft() {
        const mock = createMockDraft();
        structure.value = mock;
        draftId.value = 'mock-1';
        title.value = 'Mock Draft';
        saveSnapshot(); // Initial state
    }

    function updateSentence(id: string, text: string) {
        if (!structure.value.sentences[id]) return;

        // Check if meaningful change
        if (structure.value.sentences[id].text === text) return;

        saveSnapshot();
        structure.value.sentences[id].text = text;
        isDirty.value = true;
    }

    /**
     * Batch update for Paragraph Edit Mode
     * Replaces all sentences in a paragraph with a new set.
     * Handles creation/deletion/update atomically.
     */
    function updateParagraphSentences(paragraphId: string, newSentences: { id: string; text: string }[]) {
        const para = structure.value.paragraphs[paragraphId];
        if (!para) return;

        saveSnapshot();

        // 1. Identify IDs to remove (present in old but not in new)
        const newIds = new Set(newSentences.map(s => s.id));
        para.sentenceIds.forEach(oldId => {
            if (!newIds.has(oldId)) {
                delete structure.value.sentences[oldId];
            }
        });

        // 2. Update/Create new sentences
        newSentences.forEach(s => {
            if (structure.value.sentences[s.id]) {
                // Update
                structure.value.sentences[s.id].text = s.text;
                // Ensure parentage is correct (sanity check)
                structure.value.sentences[s.id].paragraphId = paragraphId;
            } else {
                // Create
                structure.value.sentences[s.id] = {
                    id: s.id,
                    text: s.text,
                    paragraphId: paragraphId,
                    sectionId: para.sectionId
                };
            }
        });

        // 3. Update paragraph sequence
        para.sentenceIds = newSentences.map(s => s.id);

        isDirty.value = true;
    }

    function splitSentence(id: string, cursorIndex: number) {
        const sent = structure.value.sentences[id];
        if (!sent) return;

        saveSnapshot();

        const originalText = sent.text;
        const firstPart = originalText.slice(0, cursorIndex);
        const secondPart = originalText.slice(cursorIndex);

        // Update first
        sent.text = firstPart;

        // Create second
        const newId = 's-' + crypto.randomUUID();
        structure.value.sentences[newId] = {
            id: newId,
            text: secondPart,
            paragraphId: sent.paragraphId,
            sectionId: sent.sectionId
        };

        // Insert into paragraph sequence
        const para = structure.value.paragraphs[sent.paragraphId];
        const idx = para.sentenceIds.indexOf(id);
        if (idx !== -1) {
            para.sentenceIds.splice(idx + 1, 0, newId);
        }

        isDirty.value = true;
        return newId; // Return new ID for focus
    }

    function mergeSentences(currentId: string, previousId: string) {
        const curr = structure.value.sentences[currentId];
        const prev = structure.value.sentences[previousId];

        if (!curr || !prev) return;
        if (curr.paragraphId !== prev.paragraphId) return; // Only merge in same paragraph for now

        saveSnapshot();

        // Append text to previous
        const oldLength = prev.text.length;
        prev.text += curr.text; // Add space? Usually user does this manually or we handle smart spacing

        // Remove current
        const para = structure.value.paragraphs[curr.paragraphId];
        para.sentenceIds = para.sentenceIds.filter(id => id !== currentId);
        delete structure.value.sentences[currentId];

        isDirty.value = true;
        return { mergedId: previousId, cursorPosition: oldLength };
    }

    /**
     * Delete a sentence from its parent paragraph.
     * Per Drafting Clerk Contract: Explicit structural mutation via context menu.
     */
    function deleteSentence(sentenceId: string) {
        const sent = structure.value.sentences[sentenceId];
        if (!sent) return;

        saveSnapshot();

        // Remove from paragraph
        const para = structure.value.paragraphs[sent.paragraphId];
        if (para) {
            para.sentenceIds = para.sentenceIds.filter(id => id !== sentenceId);
        }

        // Delete sentence
        delete structure.value.sentences[sentenceId];

        isDirty.value = true;
    }

    /**
     * Delete a paragraph and all its sentences from its parent section.
     * Per Drafting Clerk Contract: Explicit structural mutation via context menu.
     */
    function deleteParagraph(paragraphId: string) {
        const para = structure.value.paragraphs[paragraphId];
        if (!para) return;

        saveSnapshot();

        // Delete all sentences in paragraph
        para.sentenceIds.forEach(sentId => {
            delete structure.value.sentences[sentId];
        });

        // Remove from section
        const section = structure.value.sections[para.sectionId];
        if (section) {
            section.paragraphIds = section.paragraphIds.filter(id => id !== paragraphId);
        }

        // Delete paragraph
        delete structure.value.paragraphs[paragraphId];

        isDirty.value = true;
    }

    /**
     * Delete a selection that spans across multiple sentences.
     * Handles: partial first sentence, fully selected middle sentences, partial last sentence.
     * 
     * @param selectionData - Object containing selection range info
     * @returns Object with resulting sentence ID and cursor position
     */
    function deleteSelectionRange(selectionData: {
        startSentenceId: string;
        startOffset: number;
        endSentenceId: string;
        endOffset: number;
        fullySelectedSentenceIds: string[];
    }): { sentenceId: string; cursorOffset: number } | undefined {
        const { startSentenceId, startOffset, endSentenceId, endOffset, fullySelectedSentenceIds } = selectionData;

        const startSent = structure.value.sentences[startSentenceId];
        const endSent = structure.value.sentences[endSentenceId];

        if (!startSent || !endSent) return undefined;

        saveSnapshot();

        // Same sentence case - simple substring removal
        if (startSentenceId === endSentenceId) {
            const originalText = startSent.text;
            startSent.text = originalText.slice(0, startOffset) + originalText.slice(endOffset);
            isDirty.value = true;
            return { sentenceId: startSentenceId, cursorOffset: startOffset };
        }

        // Cross-sentence case
        // 1. Trim start sentence (keep text before selection)
        const startKeep = startSent.text.slice(0, startOffset);

        // 2. Trim end sentence (keep text after selection)
        const endKeep = endSent.text.slice(endOffset);

        // 3. Merge: start sentence gets combined text
        startSent.text = startKeep + endKeep;

        // 4. Delete all fully selected sentences
        for (const sentId of fullySelectedSentenceIds) {
            const sent = structure.value.sentences[sentId];
            if (sent) {
                const para = structure.value.paragraphs[sent.paragraphId];
                if (para) {
                    para.sentenceIds = para.sentenceIds.filter(id => id !== sentId);
                }
                delete structure.value.sentences[sentId];
            }
        }

        // 5. Delete end sentence (its content was merged into start)
        if (endSentenceId !== startSentenceId) {
            const para = structure.value.paragraphs[endSent.paragraphId];
            if (para) {
                para.sentenceIds = para.sentenceIds.filter(id => id !== endSentenceId);
            }
            delete structure.value.sentences[endSentenceId];
        }

        // 6. If start sentence is now empty, consider cleanup
        // (For now, keep empty sentence - user can delete via backspace)

        isDirty.value = true;
        return { sentenceId: startSentenceId, cursorOffset: startOffset };
    }

    function addSection(parentId: string | null, index: number) {
        saveSnapshot();
        const newId = 's-' + crypto.randomUUID();
        const newSection = {
            id: newId,
            title: 'New Section',
            level: parentId ? (structure.value.sections[parentId].level + 1) : 1,
            childSectionIds: [],
            paragraphIds: [],
            parentId: parentId || undefined
        };

        structure.value.sections[newId] = newSection;

        if (parentId) {
            structure.value.sections[parentId].childSectionIds.splice(index, 0, newId);
        } else {
            structure.value.rootSectionIds.splice(index, 0, newId);
        }
        isDirty.value = true;
    }

    function deleteSection(id: string) {
        const sec = structure.value.sections[id];
        if (!sec) return;
        saveSnapshot();

        // Recursive delete cleanup (omitted for brevity, assume GC handles or full sweep later)
        // Just unlink from parent
        if (sec.parentId) {
            const parent = structure.value.sections[sec.parentId];
            parent.childSectionIds = parent.childSectionIds.filter(cid => cid !== id);
        } else {
            structure.value.rootSectionIds = structure.value.rootSectionIds.filter(rid => rid !== id);
        }
        delete structure.value.sections[id];
        isDirty.value = true;
    }

    function promoteSection(id: string) {
        const sec = structure.value.sections[id];
        if (!sec || !sec.parentId) return; // Already root
        saveSnapshot();

        const oldParent = structure.value.sections[sec.parentId];
        const grandParentId = oldParent.parentId;

        // Remove from old parent
        oldParent.childSectionIds = oldParent.childSectionIds.filter(cid => cid !== id);

        // Add to grandparent (or root)
        if (grandParentId) {
            const grandParent = structure.value.sections[grandParentId];
            const idx = grandParent.childSectionIds.indexOf(sec.parentId) + 1;
            grandParent.childSectionIds.splice(idx, 0, id);
            sec.parentId = grandParentId;
            sec.level = grandParent.level + 1;
        } else {
            const idx = structure.value.rootSectionIds.indexOf(sec.parentId) + 1;
            structure.value.rootSectionIds.splice(idx, 0, id);
            sec.parentId = undefined;
            sec.level = 1;
        }
        isDirty.value = true;
    }

    function demoteSection(id: string) {
        const sec = structure.value.sections[id];
        if (!sec) return;

        saveSnapshot();

        // Find siblings
        const parentId = sec.parentId;
        let siblings: string[] = [];
        if (parentId) {
            siblings = structure.value.sections[parentId].childSectionIds;
        } else {
            siblings = structure.value.rootSectionIds;
        }

        const idx = siblings.indexOf(id);
        if (idx <= 0) return; // No previous sibling to nest under

        const prevSiblingId = siblings[idx - 1];
        const prevSibling = structure.value.sections[prevSiblingId];

        // Remove from current parent
        if (parentId) {
            const parent = structure.value.sections[parentId];
            parent.childSectionIds = parent.childSectionIds.filter(cid => cid !== id);
        } else {
            structure.value.rootSectionIds = structure.value.rootSectionIds.filter(rid => rid !== id);
        }

        // Add to new parent (prev sibling)
        prevSibling.childSectionIds.push(id);
        sec.parentId = prevSiblingId;
        sec.level = prevSibling.level + 1;

        isDirty.value = true;
    }

    /**
     * @future-phase - List/Object Features
     * Convert a paragraph into a child section.
     * Currently unused - preserved for future list creation workflow.
     * DO NOT wire to keyboard events per Drafting Clerk Contract.
     */
    function convertParagraphToSection(paragraphId: string) {
        // 1. Find the paragraph's parent section
        const para = structure.value.paragraphs[paragraphId];
        if (!para) return;

        const parentId = para.sectionId;
        const parentSection = structure.value.sections[parentId];
        if (!parentSection) return;

        const pIndex = parentSection.paragraphIds.indexOf(paragraphId);
        if (pIndex === -1) return;

        saveSnapshot();

        // 2. Extract Title from Paragraph Content
        const firstSentence = structure.value.sentences[para.sentenceIds[0]];
        const titleText = firstSentence?.text || 'New Section';

        // 3. Create New Section (Sibling or Child?)
        // User request: "Turn paragraph... into Subsection".
        // If I am in Section A (Level 1), and I tab/convert, I usually want a Subsection (Level 2).
        // This effectively splits Section A? No, Subsections are children of Section A.
        // BUT, Section A already has paragraphs.
        // If we add a Child Section, it usually renders AFTER paragraphs.
        // To put it "in between", we might need to split Section A into:
        // Section A (Para 1) -> Section B (Child, from Para 2) -> Section A' (Para 3)? 
        // OR, our model supports "Section -> [Para 1, ChildSection 1, Para 2]"?
        // NO. `SectionData` has `paragraphIds` AND `childSectionIds`.
        // The Renderer typically iterates `paragraphs` then `childSections` (or vice versa).
        // Mixing them requires a unified child list or specific renderer support.

        // Let's assume for now we just make it a CHILD section at the end of the current parent (or beginning?).
        // If the user wants precise placement, we need to move the *subsequent* paragraphs of Section A INTO the new Subsection?
        // YES. That matches "Heading... content".

        // LOGIC: Paragraph -> New Child Section. 
        // All *following* paragraphs in the current section move INTO the new child section.

        const newSecId = 's-' + crypto.randomUUID();
        const newSection: SectionData = {
            id: newSecId,
            title: titleText,
            level: parentSection.level + 1,
            childSectionIds: [],
            paragraphIds: [],
            parentId: parentId
        };

        // Move subsequent paragraphs (from pIndex + 1 onwards) to the new section
        const movingParagraphs = parentSection.paragraphIds.splice(pIndex + 1);
        // Also remove the converted paragraph itself (it becomes the title)
        parentSection.paragraphIds.splice(pIndex, 1);

        // Add moving paragraphs to new section
        newSection.paragraphIds = movingParagraphs; // Correctly adopted
        // Update their sectionId pointer
        movingParagraphs.forEach(pid => {
            const p = structure.value.paragraphs[pid];
            if (p) p.sectionId = newSecId;
        });

        // Register new section
        structure.value.sections[newSecId] = newSection;
        parentSection.childSectionIds.push(newSecId);

        isDirty.value = true;
    }

    /**
     * Create an empty paragraph in a section (Enter from section header)
     * Per Drafting Clerk Contract: Section Header + Enter = Empty Paragraph
     */
    function createParagraphInSection(sectionId: string) {
        const section = structure.value.sections[sectionId];
        if (!section) return;

        saveSnapshot();

        // Create new paragraph
        const newParaId = 'p-' + crypto.randomUUID();
        const newPara: ParagraphData = {
            id: newParaId,
            sectionId: sectionId,
            sentenceIds: []
        };

        // Create empty sentence in the paragraph
        const newSentId = 'sn-' + crypto.randomUUID();
        const newSent: SentenceData = {
            id: newSentId,
            text: '',
            paragraphId: newParaId,
            sectionId: sectionId
        };

        // Register
        structure.value.paragraphs[newParaId] = newPara;
        structure.value.sentences[newSentId] = newSent;
        newPara.sentenceIds.push(newSentId);

        // Add to beginning of section's paragraphs
        section.paragraphIds.unshift(newParaId);

        isDirty.value = true;
        return { paragraphId: newParaId, sentenceId: newSentId };
    }

    /**
     * Create a new sentence after the given sentence (Enter at end of sentence)
     * Per Drafting Clerk Contract: End of Sentence + Enter = New Sentence
     */
    function createSentenceAfter(sentenceId: string) {
        const sent = structure.value.sentences[sentenceId];
        if (!sent) return;

        saveSnapshot();

        const newId = 'sn-' + crypto.randomUUID();
        const newSent: SentenceData = {
            id: newId,
            text: '',
            paragraphId: sent.paragraphId,
            sectionId: sent.sectionId
        };

        structure.value.sentences[newId] = newSent;

        // Insert after current sentence
        const para = structure.value.paragraphs[sent.paragraphId];
        const idx = para.sentenceIds.indexOf(sentenceId);
        if (idx !== -1) {
            para.sentenceIds.splice(idx + 1, 0, newId);
        }

        isDirty.value = true;
        return newId;
    }

    /**
     * Create a new paragraph after the given paragraph (Enter at end of paragraph)
     * Per Drafting Clerk Contract: End of Paragraph + Enter = New Paragraph
     */
    function createParagraphAfter(paragraphId: string) {
        const para = structure.value.paragraphs[paragraphId];
        if (!para) return;

        saveSnapshot();

        // Create new paragraph
        const newParaId = 'p-' + crypto.randomUUID();
        const newPara: ParagraphData = {
            id: newParaId,
            sectionId: para.sectionId,
            sentenceIds: []
        };

        // Create empty sentence
        const newSentId = 'sn-' + crypto.randomUUID();
        const newSent: SentenceData = {
            id: newSentId,
            text: '',
            paragraphId: newParaId,
            sectionId: para.sectionId
        };

        // Register
        structure.value.paragraphs[newParaId] = newPara;
        structure.value.sentences[newSentId] = newSent;
        newPara.sentenceIds.push(newSentId);

        // Insert after current paragraph in section
        const section = structure.value.sections[para.sectionId];
        const idx = section.paragraphIds.indexOf(paragraphId);
        if (idx !== -1) {
            section.paragraphIds.splice(idx + 1, 0, newParaId);
        }

        isDirty.value = true;
        return { paragraphId: newParaId, sentenceId: newSentId };
    }

    /**
     * Split a section at the given paragraph.
     * Tab on empty paragraph → Creates sibling section with trailing paragraphs.
     * 
     * @param paragraphId - The paragraph at which to split
     * @returns New section ID, or undefined if failed
     */
    function splitSectionAtParagraph(paragraphId: string): string | undefined {
        const para = structure.value.paragraphs[paragraphId];
        if (!para) return undefined;

        const section = structure.value.sections[para.sectionId];
        if (!section) return undefined;

        saveSnapshot();

        // Find index of trigger paragraph
        const paraIndex = section.paragraphIds.indexOf(paragraphId);
        if (paraIndex === -1) return undefined;

        // Get paragraphs AFTER the trigger (these move to new section)
        const trailingParagraphIds = section.paragraphIds.slice(paraIndex + 1);

        // Create new sibling section
        const newSectionId = 's-' + crypto.randomUUID();
        const parentId = section.parentId || null;
        const newSection = {
            id: newSectionId,
            title: 'New Section',
            level: section.level,
            childSectionIds: [],
            paragraphIds: [] as string[],
            parentId: section.parentId
        };

        structure.value.sections[newSectionId] = newSection;

        // Insert new section after current section in parent's list
        if (parentId) {
            const parent = structure.value.sections[parentId];
            const sectionIdx = parent.childSectionIds.indexOf(section.id);
            parent.childSectionIds.splice(sectionIdx + 1, 0, newSectionId);
        } else {
            const sectionIdx = structure.value.rootSectionIds.indexOf(section.id);
            structure.value.rootSectionIds.splice(sectionIdx + 1, 0, newSectionId);
        }

        // Move trailing paragraphs to new section
        for (const pid of trailingParagraphIds) {
            structure.value.paragraphs[pid].sectionId = newSectionId;
            // Also update all sentences in this paragraph
            const p = structure.value.paragraphs[pid];
            for (const sid of p.sentenceIds) {
                structure.value.sentences[sid].sectionId = newSectionId;
            }
        }
        newSection.paragraphIds = trailingParagraphIds;

        // Remove trailing paragraphs from original section
        section.paragraphIds = section.paragraphIds.slice(0, paraIndex);

        // Delete the trigger paragraph (it was empty, just a split point)
        // Also delete any sentences it might have
        const triggerPara = structure.value.paragraphs[paragraphId];
        for (const sid of triggerPara.sentenceIds) {
            delete structure.value.sentences[sid];
        }
        delete structure.value.paragraphs[paragraphId];

        isDirty.value = true;
        return newSectionId;
    }

    /**
     * Merge a section into its previous sibling.
     * Shift+Tab on section header → Merges content into previous section.
     * 
     * @param sectionId - The section to merge into previous
     * @returns true if successful
     */
    function mergeSectionIntoPrevious(sectionId: string): boolean {
        const section = structure.value.sections[sectionId];
        if (!section) return false;

        // Find previous sibling
        let siblingList: string[];
        if (section.parentId) {
            siblingList = structure.value.sections[section.parentId].childSectionIds;
        } else {
            siblingList = structure.value.rootSectionIds;
        }

        const myIndex = siblingList.indexOf(sectionId);
        if (myIndex <= 0) return false; // No previous sibling

        const prevSectionId = siblingList[myIndex - 1];
        const prevSection = structure.value.sections[prevSectionId];
        if (!prevSection) return false;

        saveSnapshot();

        // Move all paragraphs from this section to previous
        for (const pid of section.paragraphIds) {
            structure.value.paragraphs[pid].sectionId = prevSectionId;
            // Also update sentences
            const para = structure.value.paragraphs[pid];
            for (const sid of para.sentenceIds) {
                structure.value.sentences[sid].sectionId = prevSectionId;
            }
            prevSection.paragraphIds.push(pid);
        }

        // Move all child sections to previous section
        for (const childId of section.childSectionIds) {
            structure.value.sections[childId].parentId = prevSectionId;
            prevSection.childSectionIds.push(childId);
        }

        // Remove this section from parent's list
        siblingList.splice(myIndex, 1);

        // Delete this section
        delete structure.value.sections[sectionId];

        isDirty.value = true;
        return true;
    }

    /**
     * @future-phase - List/Block Styling
     * Set paragraph style (BODY, LIST_ITEM, BLOCK_QUOTE).
     * Currently unused - preserved for future list rendering.
     */
    function setParagraphStyle(paragraphId: string, style: 'BODY' | 'LIST_ITEM' | 'BLOCK_QUOTE') {
        const para = structure.value.paragraphs[paragraphId];
        if (para && para.style !== style) {
            saveSnapshot();
            para.style = style;
            isDirty.value = true;
        }
    }

    function saveSnapshot() {
        // Deep clone state for history
        // In prod use a lighter diff approach, this is heavy
        history.value.push(JSON.stringify(structure.value));
        if (history.value.length > 50) history.value.shift();
        future.value = []; // Clear redo stack
    }

    function undo() {
        const prev = history.value.pop();
        if (prev) {
            future.value.push(JSON.stringify(structure.value));
            structure.value = JSON.parse(prev);
        }
    }

    function redo() {
        const next = future.value.pop();
        if (next) {
            history.value.push(JSON.stringify(structure.value));
            structure.value = JSON.parse(next);
        }
    }

    return {
        draftId,
        title,
        structure,
        isDirty,
        isEmpty,
        loadMockDraft,
        updateSentence,
        updateParagraphSentences,
        splitSentence,
        mergeSentences,
        deleteSentence,
        deleteParagraph,
        deleteSelectionRange,
        addSection,
        deleteSection,
        promoteSection,
        demoteSection,
        convertParagraphToSection,
        setParagraphStyle,
        createParagraphInSection,
        createSentenceAfter,
        createParagraphAfter,
        splitSectionAtParagraph,
        mergeSectionIntoPrevious,
        undo,
        redo
    };
});
