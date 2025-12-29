<template>
  <div 
    class="paragraph-block" 
    :class="[paragraph.style?.toLowerCase(), { 'is-edit-mode': modeStore.isEditMode }]"
    tabindex="0"
    @click="handleParagraphClick"
    @focus="handleParagraphFocus"
    @contextmenu.prevent.stop="handleParagraphContextMenu"
  >
    <!-- EDIT MODE: Buffered Paragraph Editor -->
    <div 
      v-if="modeStore.isEditMode"
      ref="bufferRef"
      class="paragraph-buffer"
      contenteditable="true"
      @blur="commitBuffer"
      @keydown.enter="handleBufferEnter"
    ></div>

    <!-- PREVIEW/ANALYSIS MODE: Structured Sentence Rendering -->
    <template v-else>
      <!-- If paragraph has no sentences, show focusable placeholder -->
      <span 
        v-if="paragraph.sentenceIds.length === 0" 
        class="empty-paragraph-placeholder"
      >
        &nbsp;
      </span>
      
      <template v-else v-for="sentId in paragraph.sentenceIds" :key="sentId">
        <SentenceBlock 
          v-if="store.structure.sentences[sentId]"
          :sentence="store.structure.sentences[sentId]"
          @node-contextmenu="bubbleContextMenu"
        />
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount } from 'vue';
import type { ParagraphData } from '@/types/drafting';
import { useDraftStore } from '@/stores/draft.store';
import { useCursorStore } from '@/stores/cursor.store';
import { useEditorModeStore } from '@/stores/editor-mode.store';
import { reconcileParagraph } from '@/utils/draft-reconciler';
import SentenceBlock from './SentenceBlock.vue';

const props = defineProps<{
  paragraph: ParagraphData;
}>();

const emit = defineEmits<{
  (e: 'node-contextmenu', payload: { event: MouseEvent; target: any }): void;
}>();

const store = useDraftStore();
const cursorStore = useCursorStore();
const modeStore = useEditorModeStore();

const bufferRef = ref<HTMLDivElement | null>(null);
const currentBufferValue = ref('');

// --- Buffered Editing Logic ---

/**
 * Initialize buffer when entering Edit Mode
 */
watch(() => modeStore.isEditMode, async (isEdit) => {
  if (isEdit) {
    initBuffer();
  } else {
    // If exiting edit mode (e.g. via Esc or button), ensure we commit
    // Note: If we just blurred, commit might have run already, but duplicate commits are safe if check dirty
    commitBuffer();
  }
}, { immediate: true });

function initBuffer() {
  // Join sentences to form paragraph text
  const text = props.paragraph.sentenceIds
    .map(id => store.structure.sentences[id]?.text || '')
    .join(''); // Spacing is tricky. Assume sentences include spacing or we join with '' if they do?
               // Usually sentences in store include trailing space. If not, we might need ' '.
               // Based on previous code, they seemed to be just text.
               // Let's assume standard "Sentence. Sentence." structure where space is part of sentence or rendered.
               // In SentenceBlock, we rendered <span spacer>&nbsp;</span>. 
               // This means store text DOES NOT have trailing space.
               // So we must join with ' '.
    
  // Wait, if we join with ' ', we must modify tokenizer to handle that?
  // Reconciler uses regex. 
  // Let's check SentenceBlock again. 
  // <span class="sentence-text">{{ sentence.text }}</span><span class="sentence-spacer">&nbsp;</span>
  // Yes, space is external. So we must JOIN WITH SPACE.
  
  // NOTE: If we join with space, we must be careful not to double space on partial edits?
  // Reconciler will trim tokens.
  
  const joinedText = props.paragraph.sentenceIds
    .map(id => store.structure.sentences[id]?.text || '')
    .join(' ');
    
  currentBufferValue.value = joinedText;
  
  nextTick(() => {
    if (bufferRef.value) {
      bufferRef.value.innerText = joinedText;
    }
  });
}

/**
 * Commits the buffered text to the structural store
 */
function commitBuffer() {
  if (!bufferRef.value) return;
  const rawText = bufferRef.value.innerText;
  
  // Optimization: If no change, do nothing
  if (rawText === currentBufferValue.value) return;
  
  console.log('Committing Paragraph:', props.paragraph.id);
  
  // 1. Reconcile (Tokenize & Align)
  const newSentences = reconcileParagraph(rawText, props.paragraph.sentenceIds);
  
  // 2. Update Store
  store.updateParagraphSentences(props.paragraph.id, newSentences);
  
  // 3. Update local tracking
  currentBufferValue.value = rawText;
}

function handleBufferEnter(e: KeyboardEvent) {
  // If we want standard word processor behavior, Shift+Enter = line break, Enter = New Paragraph?
  // For now, let's keep it simple: Enter creates new paragraph in the UI via the Shell?
  // Or if contenteditable, Enter creates <div>.
  // The prompt says "Enter behaves like a word processor".
  // If we are strictly "Buffered Paragraph", detecting a "New Paragraph" intent from inside the buffer is complex.
  // But if the user presses Enter, they likely want to split this paragraph.
  // We can let the Default behavior happen (insert break), and then verify logic?
  // NO. The Drafting Clerk Contract says "Sections are created only via explicit actions ... Enter behavior is structural".
  // Shell handles Enter. 
  // But if we are in contenteditable, Shell might not get it if we stop propagation.
  // If we DON'T stop propagation, Shell handles it.
  // Does Shell handle Enter in Edit Mode? 
  // Prompt: "Enter behaves like a word processor".
  // This usually means "Inserts newline or new paragraph".
  // If the Shell handles it, it splits the paragraph. That's good.
  // So we should probably Sync/Commit immediately before handling Enter?
  
  // Implementation: Commit first, then let event bubble to Shell?
  // Or Shell catches it first? Capture phase?
  // DraftEditor uses @keydown (bubble).
  // So buffer @keydown.enter runs first.
  commitBuffer();
  // Let it bubble to Shell to run handleEnter() which does the structural split.
}


// --- Existing Interaction Logic (Preserved for Non-Edit Modes) ---

function handleParagraphClick(e: MouseEvent) {
  if (modeStore.isEditMode) return; // In edit mode, click focuses buffer naturally
  
  if ((e.target as HTMLElement).classList.contains('paragraph-block') ||
      (e.target as HTMLElement).classList.contains('empty-paragraph-placeholder')) {
    cursorStore.setCursorToParagraph(props.paragraph.sectionId, props.paragraph.id);
  }
}

function handleParagraphFocus() {
  if (props.paragraph.sentenceIds.length === 0) {
    cursorStore.setCursorToParagraph(props.paragraph.sectionId, props.paragraph.id);
  }
}

function handleParagraphContextMenu(e: MouseEvent) {
  if (modeStore.isEditMode) return; 
  
  if ((e.target as HTMLElement).classList.contains('paragraph-block') ||
      (e.target as HTMLElement).classList.contains('empty-paragraph-placeholder')) {
    emit('node-contextmenu', {
      event: e,
      target: {
        type: 'paragraph',
        sectionId: props.paragraph.sectionId,
        paragraphId: props.paragraph.id
      }
    });
  }
}

function bubbleContextMenu(payload: { event: MouseEvent; target: any }) {
  emit('node-contextmenu', payload);
}
</script>

<style scoped>
.paragraph-block {
  margin-bottom: 1em;
  text-align: justify;
  min-height: 1.5em; /* Ensure clickable */
}

/* Edit Mode Styling */
.paragraph-block.is-edit-mode {
  cursor: text;
}

.paragraph-buffer {
  outline: none; /* Let the global editing frame provide context */
  white-space: pre-wrap;
  min-height: 1.5em;
  padding: 2px;
}

.paragraph-buffer:focus {
  /* Optional: Subtle local focus indicator if desired, distinct from mode frame */
  background: rgba(0, 0, 0, 0.02);
}

.paragraph-block.list_item {
  margin-left: 2em;
  text-indent: -1em;
}

.paragraph-block.block_quote {
  margin-left: 2em;
  margin-right: 2em;
}
</style>
