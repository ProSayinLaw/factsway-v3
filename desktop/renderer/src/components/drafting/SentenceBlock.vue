<template>
  <span 
    class="sentence-block"
    :class="{ 
      hover: isHovered
    }"
    :data-sentence-id="sentence.id"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @click="handleClick"
    @contextmenu.prevent.stop="handleSentenceContextMenu"
  >
    <!-- STRICT READ-ONLY MODE -->
    <span class="sentence-text">{{ sentence.text }}</span>
    <span class="sentence-spacer">&nbsp;</span>
  </span>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { SentenceData } from '@/types/drafting';
import { useCursorStore } from '@/stores/cursor.store';

const props = defineProps<{
  sentence: SentenceData;
  // isEditing prop is removed/ignored as editing is handled by ParagraphBlock buffer
}>();

const emit = defineEmits<{
  (e: 'node-contextmenu', payload: { event: MouseEvent; target: any }): void;
}>();

const cursorStore = useCursorStore();

const isHovered = ref(false);

/**
 * Handle Selection/Context Click
 * Does NOT trigger editing.
 * Merely sets the structural cursor position for Analysis/Exhibits purposes.
 */
function handleClick() {
  // Set structural cursor context (per contract)
  cursorStore.setCursorToSentence(
    props.sentence.sectionId,
    props.sentence.paragraphId,
    props.sentence.id,
    0
  );
}

/**
 * Handle right-click on sentence
 */
function handleSentenceContextMenu(e: MouseEvent) {
  emit('node-contextmenu', {
    event: e,
    target: {
      type: 'sentence',
      sectionId: props.sentence.sectionId,
      paragraphId: props.sentence.paragraphId,
      sentenceId: props.sentence.id
    }
  });
}
</script>

<style scoped>
.sentence-block {
  display: inline;
  cursor: text;
  border-radius: 2px;
  position: relative;
  line-height: 2; /* Match paper line-height */
  transition: background 0.1s;
}

.sentence-block.hover {
  background-color: var(--hover-color, rgba(0, 0, 0, 0.03));
}

.sentence-text {
  outline: none;
  white-space: pre-wrap;
}

.sentence-spacer {
  /* Space between sentences */
}
</style>
