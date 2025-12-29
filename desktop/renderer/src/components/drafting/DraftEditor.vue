<template>
  <div class="draft-root">
    <!-- Mode Selector (Mandatory explicit UI) -->
    <ModeSelector />

    <!-- Shell-level keyboard capture -->
    <div 
      class="draft-editor"
      :class="{ 
        'mode-edit': modeStore.isEditMode,
        'mode-preview': modeStore.isPreviewMode,
        'mode-analysis': modeStore.isAnalysisMode,
        'mode-exhibits': modeStore.isExhibitsMode
      }"
      tabindex="0"
      @keydown="handleKeydown"
      @contextmenu.prevent="handleContextMenu"
      ref="editorRef"
    >
      <div v-if="modeStore.isEditMode" class="mode-label">EDIT MODE</div>

      <div v-if="store.isEmpty" class="empty-state">
        No content loaded.
      </div>
      
      <template v-else>
        <SectionBlock 
          v-for="(sid, index) in store.structure.rootSectionIds"
          :key="sid"
          :section="store.structure.sections[sid]"
          :index="index"
          @node-contextmenu="openNodeContextMenu"
        />
      </template>
  
      <EditorContextMenu
        :visible="contextMenuVisible"
        :x="contextMenuX"
        :y="contextMenuY"
        :target="contextMenuTarget"
        @close="closeContextMenu"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * DraftEditor.vue - Shell-Level Keyboard & Context Menu Handler
 * 
 * ARCHITECTURE CHANGE: Explicit Mode System
 * - Modes: Preview (default), Edit, Exhibits, Analysis
 * - No implicit edit triggers
 * - Esc always exits to Preview
 */
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { useDraftStore } from '@/stores/draft.store';
import { useDraftCollectionStore } from '@/stores/draft-collection.store';
import { useCursorStore } from '@/stores/cursor.store';
import { useEditorModeStore } from '@/stores/editor-mode.store';
import SectionBlock from './SectionBlock.vue';
import ModeSelector from './ModeSelector.vue';
import EditorContextMenu, { type EditorContextTarget } from './EditorContextMenu.vue';

const store = useDraftStore();
const collectionStore = useDraftCollectionStore();
const cursorStore = useCursorStore();
const modeStore = useEditorModeStore();
const editorRef = ref<HTMLDivElement | null>(null);

// Context menu state
const contextMenuVisible = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);
const contextMenuTarget = ref<EditorContextTarget | null>(null);

// Auto-save timer
let saveInterval: number | null = null;

onMounted(() => {
  // Load mock data if empty
  if (store.structure.rootSectionIds.length === 0) {
    store.loadMockDraft();
  }
  
  // Autosave every 30 seconds if dirty
  saveInterval = window.setInterval(() => {
    if (store.isDirty) {
      console.log('Autosaving draft...');
      collectionStore.saveCurrentDraft();
    }
  }, 30000);

  // Add global keyboard listener for Enter key capture
  // The textarea in SentenceBlock captures focus, so we need to listen at window level
  window.addEventListener('keydown', handleGlobalKeydown);
});

onBeforeUnmount(() => {
  // Save on exit
  collectionStore.saveCurrentDraft();
  if (saveInterval) clearInterval(saveInterval);
  window.removeEventListener('keydown', handleGlobalKeydown);
});

/**
 * Global keyboard handler - captures Enter key even when focus is in textarea
 * Per Drafting Clerk Contract: Shell-level capture of structural keys
 */
function handleGlobalKeydown(e: KeyboardEvent) {
  // Only handle if we're inside the draft editor (check if target is within editorRef)
  if (!editorRef.value?.contains(e.target as Node)) return;

  // Delegate to the main handler
  handleKeydown(e);
}

/**
 * Shell-level keyboard handler
 * All structural editing keys route through here
 */
function handleKeydown(e: KeyboardEvent) {
  // ESCAPE: Global exit hatch (Highest Priority)
  if (e.key === 'Escape') {
    e.preventDefault();
    e.stopPropagation();
    modeStore.handleEscape();
    return;
  }

  // EDIT MODE: Delegate specific keys to the buffer (Word Processor Behavior)
  // We skip shell-level structural logic for typing, deletion, enter, etc.
  if (isEditModeKey(e)) {
    // Return early to allow event to bubble to contenteditable
    // Do NOT preventDefault()
    return;
  }

  // Global shortcuts (Undo/Redo) -> Only active if NOT in Edit Mode (or if Edit Mode logic falls through)
  // Actually, native Undo in Edit Mode is desired for text. Shell Undo is for structure.
  // So we block Shell Undo in Edit Mode implicitly if we want native text undo?
  // Let's rely on isEditModeKey logic or explicit check.
  if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
    // If in Edit Mode, let browser handle text-undo
    if (modeStore.isEditMode) return;
    
    e.preventDefault();
    if (e.shiftKey) {
      store.redo();
    } else {
      store.undo();
    }
    return;
  }

  // Enter Key = Structural Intent Resolver
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault(); // CRITICAL: Browser must never insert DOM nodes
    handleEnter();
    return;
  }

  // Tab Key = Section Promotion/Demotion
  if (e.key === 'Tab') {
    handleTab(e);
    return;
  }

  // Delete/Backspace = Cross-sentence selection deletion
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (modeStore.isEditMode) return; // Should be caught by isEditModeKey, but safety check

    const handled = handleDeleteSelection(e);
    if (handled) return;
  }
}

/**
 * Handle keys in Edit Mode
 * Returns true if the key event should be exclusively handled by the buffer (preventing Shell defaults/structural logic)
 */
function isEditModeKey(e: KeyboardEvent): boolean {
  if (!modeStore.isEditMode) return false;
  
  // Allow Esc to bubble to Shell (handled in handleEscape or separate watcher)
  if (e.key === 'Escape') return false; 
  
  // In Edit Mode, these keys are handled by the buffer/contenteditable natively
  if (['Enter', 'Tab', 'Backspace', 'Delete'].includes(e.key)) {
     return true;
  }
  
  return false;
}

/**
 * Handle Delete/Backspace for cross-sentence selections
 * Returns true if handled (cross-sentence), false to let browser handle
 */
function handleDeleteSelection(e: KeyboardEvent): boolean {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed) return false; // No selection, let browser handle

  // Find the sentence elements containing the selection
  const anchorSentenceEl = findSentenceElement(sel.anchorNode);
  const focusSentenceEl = findSentenceElement(sel.focusNode);

  if (!anchorSentenceEl || !focusSentenceEl) return false;

  const anchorId = anchorSentenceEl.dataset.sentenceId;
  const focusId = focusSentenceEl.dataset.sentenceId;

  if (!anchorId || !focusId) return false;

  // Same sentence - let browser handle natively
  if (anchorId === focusId) return false;

  // Cross-sentence selection - we handle this
  e.preventDefault();

  // Determine which is start vs end (selection can be backwards)
  const range = sel.getRangeAt(0);
  const startContainer = range.startContainer;
  const endContainer = range.endContainer;

  const startSentenceEl = findSentenceElement(startContainer);
  const endSentenceEl = findSentenceElement(endContainer);

  if (!startSentenceEl || !endSentenceEl) return false;

  const startSentenceId = startSentenceEl.dataset.sentenceId!;
  const endSentenceId = endSentenceEl.dataset.sentenceId!;
  const startOffset = range.startOffset;
  const endOffset = range.endOffset;

  // Find fully selected sentences (between start and end)
  const fullySelectedSentenceIds = findFullySelectedSentences(
    startSentenceId,
    endSentenceId,
    editorRef.value
  );

  // Call store to delete the range
  const result = store.deleteSelectionRange({
    startSentenceId,
    startOffset,
    endSentenceId,
    endOffset,
    fullySelectedSentenceIds
  });

  if (result) {
    // Set cursor to the merge point
    cursorStore.setCursorToSentence(
      store.structure.sentences[result.sentenceId]?.sectionId || '',
      store.structure.sentences[result.sentenceId]?.paragraphId || '',
      result.sentenceId,
      result.cursorOffset
    );

    // Focus the sentence
    nextTick(() => {
      const sentenceEl = document.querySelector(`[data-sentence-id="${result.sentenceId}"]`) as HTMLElement;
      if (sentenceEl) {
        sentenceEl.click();
      }
    });
  }

  return true;
}

/**
 * Find the sentence-block element that contains a node
 */
function findSentenceElement(node: Node | null): HTMLElement | null {
  if (!node) return null;
  let el: Node | null = node;
  while (el && el !== document) {
    if (el instanceof HTMLElement && el.dataset.sentenceId) {
      return el;
    }
    el = el.parentNode;
  }
  return null;
}

/**
 * Find sentence IDs that are fully selected between start and end
 */
function findFullySelectedSentences(
  startId: string,
  endId: string,
  container: HTMLElement | null
): string[] {
  if (!container) return [];

  const allSentences = Array.from(
    container.querySelectorAll('[data-sentence-id]')
  ) as HTMLElement[];

  const startIdx = allSentences.findIndex(el => el.dataset.sentenceId === startId);
  const endIdx = allSentences.findIndex(el => el.dataset.sentenceId === endId);

  if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx - 1) return [];

  // Sentences between start and end (not including start and end)
  return allSentences
    .slice(startIdx + 1, endIdx)
    .map(el => el.dataset.sentenceId!)
    .filter(Boolean);
}

/**
 * Tab Key Router - Section Promotion/Demotion
 * 
 * Tab on empty paragraph → Split section, create sibling with trailing content
 * Shift+Tab on section header → Merge section into previous sibling
 */
function handleTab(e: KeyboardEvent) {
  // In Edit Mode, Tab should just indent text or be handled by contenteditable
  // Structural promotion/demotion is disabled in Edit Mode per architectural rules
  if (modeStore.isEditMode) return;

  const ctx = cursorStore.context;
  if (!ctx) return;

  if (e.shiftKey) {
    // Shift+Tab: Demote section (merge into previous)
    if (ctx.positionType === 'sectionHeader') {
      e.preventDefault();
      const success = store.mergeSectionIntoPrevious(ctx.sectionId);
      if (success) {
        console.log('Section merged into previous');
      }
    }
  } else {
    // Tab: Promote empty paragraph to section
    if (ctx.positionType === 'paragraph' || ctx.positionType === 'sentence') {
      const paragraphId = ctx.paragraphId;
      if (paragraphId && isEmptyParagraph(paragraphId)) {
        e.preventDefault();
        const newSectionId = store.splitSectionAtParagraph(paragraphId);
        if (newSectionId) {
          // Move cursor to new section header
          cursorStore.setCursorToSectionHeader(newSectionId);
          console.log('Created new section from empty paragraph:', newSectionId);
        }
      }
    }
  }
}

/**
 * Helper: Check if a paragraph is empty (no sentences or only empty sentences)
 */
function isEmptyParagraph(paragraphId: string): boolean {
  const para = store.structure.paragraphs[paragraphId];
  if (!para) return false;
  if (para.sentenceIds.length === 0) return true;
  
  // Check if all sentences are empty
  return para.sentenceIds.every(sid => {
    const sent = store.structure.sentences[sid];
    return !sent || sent.text.trim() === '';
  });
}

/**
 * Enter Key Router - Per Drafting Clerk Contract
 * 
 * Resolves behavior ONLY from CursorContext:
 * 1. Section Header → Create empty paragraph under section
 * 2. Mid-sentence → Split sentence
 * 3. End of sentence → Create new sentence
 * 4. End of paragraph → Create new paragraph
 * 5. Empty paragraph → Create sibling paragraph
 * 
 * IMPORTANT: After creation, cursor context moves to the new element.
 */
function handleEnter() {
  // In Edit Mode, Enter is handled by the buffer (creating new lines)
  // Structural changes happen via Reconciler
  if (modeStore.isEditMode) return;
  
  const ctx = cursorStore.context;
  if (!ctx) {
    console.warn('Enter pressed but no cursor context');
    return;
  }

  switch (ctx.positionType) {
    case 'sectionHeader': {
      // Create empty paragraph under this section
      const result = store.createParagraphInSection(ctx.sectionId);
      if (result) {
        // Move cursor to the new sentence in the new paragraph
        cursorStore.setCursorToSentence(ctx.sectionId, result.paragraphId, result.sentenceId, 0);
        focusNewSentence(result.sentenceId);
      }
      break;
    }

    case 'sentence': {
      if (ctx.sentenceId && ctx.offsetInSentence !== null) {
        const sentence = store.structure.sentences[ctx.sentenceId];
        if (!sentence) return; 
        
        // ... (rest of logic handles structural splits) ...
        const isAtEnd = ctx.offsetInSentence >= sentence.text.length;
        const isLastInParagraph = isLastSentenceInParagraph(ctx.sentenceId, ctx.paragraphId!);

        if (!isAtEnd) {
          // Mid-text: split sentence at offset
          const newId = store.splitSentence(ctx.sentenceId, ctx.offsetInSentence);
          if (newId) {
            cursorStore.setCursorToSentence(ctx.sectionId, ctx.paragraphId!, newId, 0);
            focusNewSentence(newId);
          }
        } else if (!isLastInParagraph) {
          // End of sentence, more sentences follow: create new sentence
          const newId = store.createSentenceAfter(ctx.sentenceId);
          if (newId) {
            cursorStore.setCursorToSentence(ctx.sectionId, ctx.paragraphId!, newId, 0);
            focusNewSentence(newId);
          }
        } else {
          // End of last sentence in paragraph: create new paragraph
          const result = store.createParagraphAfter(ctx.paragraphId!);
          if (result) {
            cursorStore.setCursorToSentence(ctx.sectionId, result.paragraphId, result.sentenceId, 0);
            focusNewSentence(result.sentenceId);
          }
        }
      }
      break;
    }

    case 'paragraph': {
      // Empty paragraph or cursor on paragraph: create sibling paragraph
      if (ctx.paragraphId) {
        const result = store.createParagraphAfter(ctx.paragraphId);
        if (result) {
          cursorStore.setCursorToSentence(ctx.sectionId, result.paragraphId, result.sentenceId, 0);
          focusNewSentence(result.sentenceId);
        }
      }
      break;
    }
  }
}

/**
 * Focus the new sentence element after it's rendered
 */
function focusNewSentence(sentenceId: string) {
  // Use nextTick to wait for Vue to render the new element
  nextTick(() => {
    // Find and click the new sentence to start editing
    const sentenceEl = document.querySelector(`[data-sentence-id="${sentenceId}"]`) as HTMLElement;
    if (sentenceEl) {
      sentenceEl.click();
    }
  });
}

/**
 * Helper: Check if sentence is the last in its paragraph
 */
function isLastSentenceInParagraph(sentenceId: string, paragraphId: string): boolean {
  const paragraph = store.structure.paragraphs[paragraphId];
  if (!paragraph) return false;
  const ids = paragraph.sentenceIds;
  return ids[ids.length - 1] === sentenceId;
}

// --- Context Menu Handlers ---

/**
 * Handle right-click on editor background (fallback)
 */
function handleContextMenu(e: MouseEvent) {
  // This is a fallback - specific nodes emit their own context menu events
  // If we reach here, no specific node was right-clicked
}

/**
 * Handle context menu event from child nodes (SectionBlock, ParagraphBlock, SentenceBlock)
 */
function openNodeContextMenu(payload: { event: MouseEvent; target: EditorContextTarget }) {
  contextMenuX.value = payload.event.clientX;
  contextMenuY.value = payload.event.clientY;
  contextMenuTarget.value = payload.target;
  contextMenuVisible.value = true;
}

/**
 * Close the context menu
 */
function closeContextMenu() {
  contextMenuVisible.value = false;
  contextMenuTarget.value = null;
}
</script>

<style scoped>
.draft-root {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.draft-editor {
  flex: 1;
  width: 100%;
  outline: none; /* Remove focus outline, handled visually by content */
  overflow-y: auto;
  padding: 1rem;
  transition: all 0.3s ease;
  border: 2px solid transparent; /* Prepare for border transition */
}

/* --- VISUAL FEEDBACK PER MODE --- */

/* Preview Mode (default): Neutral, Read Only */
.draft-editor.mode-preview {
  background-color: var(--surface-a, #ffffff);
}

/* Edit Mode: Word Processor Feel */
.draft-editor.mode-edit {
  border-color: var(--accent-edit, #007AFF); /* Visible frame */
  background-color: var(--surface-a, #ffffff);
  /* Optionally remove padding shift if border is internal, or box-sizing handles it */
}

.mode-label {
  position: sticky;
  top: 0;
  background: var(--accent-edit, #007AFF);
  color: white;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 0.25rem;
  margin-bottom: 1rem;
  z-index: 100;
  border-radius: 4px;
}

/* Exhibits Mode */
.draft-editor.mode-exhibits {
  border-left: 6px solid var(--accent-exhibit, #FF9500);
}

/* Analysis Mode */
.draft-editor.mode-analysis {
  border-right: 6px solid var(--accent-analysis, #5856D6);
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: var(--text-muted, #888);
}
</style>

