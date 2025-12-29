<template>
  <div class="section-block" :class="'level-' + section.level" :id="'sec-' + section.id">
    <!-- Section Header -->
    <!-- Click sets cursor context, right-click opens context menu per Drafting Clerk Contract -->
    <div 
      class="section-header" 
      tabindex="0"
      @click="handleHeaderClick"
      @focus="handleHeaderClick"
      @dblclick="handleHeaderEdit"
      @contextmenu.prevent.stop="handleHeaderContextMenu"
    >
      <span class="section-number">{{ label }}</span> {{ section.title }}
    </div>

    <!-- Paragraphs -->
    <ParagraphBlock
      v-for="pid in section.paragraphIds"
      :key="pid"
      :paragraph="store.structure.paragraphs[pid]"
      @node-contextmenu="bubbleContextMenu"
    />

    <!-- Child Sections (Recursive) -->
    <SectionBlock
      v-for="(sid, idx) in section.childSectionIds"
      :key="sid"
      :section="store.structure.sections[sid]"
      :index="idx"
      @node-contextmenu="bubbleContextMenu"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SectionData } from '@/types/drafting';
import { useDraftStore } from '@/stores/draft.store';
import { useCursorStore } from '@/stores/cursor.store';
import ParagraphBlock from './ParagraphBlock.vue';
import { getSectionLabel } from '@/utils/numbering';

const props = defineProps<{
  section: SectionData;
  index: number;
}>();

const emit = defineEmits<{
  (e: 'node-contextmenu', payload: { event: MouseEvent; target: any }): void;
}>();

const store = useDraftStore();
const cursorStore = useCursorStore();

// Compute label based on depth (level - 1) and index
const label = computed(() => getSectionLabel(props.section.level - 1, props.index));

/**
 * Set cursor context to section header
 * Per Drafting Clerk Contract: CursorContext must be set for all focusable nodes
 */
function handleHeaderClick() {
  cursorStore.setCursorToSectionHeader(props.section.id);
}

function handleHeaderEdit() {
  console.log('TODO: Header edit');
}

/**
 * Handle right-click on section header
 */
function handleHeaderContextMenu(e: MouseEvent) {
  emit('node-contextmenu', {
    event: e,
    target: {
      type: 'sectionHeader',
      sectionId: props.section.id
    }
  });
}

/**
 * Bubble context menu events from children up to DraftEditor
 */
function bubbleContextMenu(payload: { event: MouseEvent; target: any }) {
  emit('node-contextmenu', payload);
}
</script>

<style scoped>
.section-block {
  margin-bottom: 1.5em;
}

.section-header {
  font-weight: bold;
  text-align: center;
  margin-bottom: 1em;
  text-transform: uppercase;
}

.level-2 .section-header {
  text-align: left;
  text-transform: none;
  font-weight: bold;
}

.level-3 .section-header {
  text-align: left;
  font-weight: normal;
  text-decoration: none;
  padding-left: 2em; /* Indent for list look */
}
</style>
