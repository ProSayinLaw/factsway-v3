<template>
  <div class="viewport-container" :style="{ background: 'var(--bg-canvas)' }">
    <!-- Toolbar (Zoom controls + Section actions) -->
    <div class="viewport-toolbar">
      <!-- Section Actions (Explicit per Contract) -->
      <div class="section-actions">
        <button class="toolbar-btn" @click="addSectionAtCursor" title="Add Section (after current)">
          <i class="lucide lucide-plus"></i> Section
        </button>
      </div>

      <div class="zoom-controls">
        <button @click="zoomOut">-</button>
        <span class="zoom-level">{{ Math.round(scale * 100) }}%</span>
        <button @click="zoomIn">+</button>
        <button @click="scale = 1.0">Fit</button>
      </div>
    </div>

    <!-- Scrollable Canvas -->
    <div class="canvas-scroller">
      <div 
        class="page-surface"
        :style="{ 
          transform: `scale(${scale})`,
          transformOrigin: 'top center'
        }"
      >
        <!-- Page 1 (Fixed Geometry) -->
        <div class="paper-sheet">
          <DraftEditor />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DraftEditor from '@/components/drafting/DraftEditor.vue';
import { useDraftStore } from '@/stores/draft.store';
import { useCursorStore } from '@/stores/cursor.store';

defineProps<{
  caseName?: string;
}>();

const store = useDraftStore();
const cursorStore = useCursorStore();
const scale = ref(1.0);

function zoomIn() {
  scale.value = Math.min(scale.value + 0.1, 2.0);
}

function zoomOut() {
  scale.value = Math.max(scale.value - 0.1, 0.5);
}

/**
 * Add a new section based on cursor context
 * Per Drafting Clerk Contract: Section creation is EXPLICIT ONLY (toolbar or context menu)
 * Never via Enter key.
 */
function addSectionAtCursor() {
  const ctx = cursorStore.context;
  
  if (!ctx) {
    // No cursor context - add section at root level
    const rootCount = store.structure.rootSectionIds.length;
    store.addSection(null, rootCount);
    return;
  }
  
  // Add sibling section after current section
  const sectionId = ctx.sectionId;
  const section = store.structure.sections[sectionId];
  if (!section) return;
  
  const parentId = section.parentId || null;
  let index = 0;
  
  if (parentId) {
    const parent = store.structure.sections[parentId];
    index = parent.childSectionIds.indexOf(sectionId) + 1;
  } else {
    index = store.structure.rootSectionIds.indexOf(sectionId) + 1;
  }
  
  store.addSection(parentId, index);
}
</script>

<style scoped>
.viewport-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.viewport-toolbar {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: var(--bg-header);
  border-bottom: 1px solid var(--border-subtle);
  z-index: 10;
}

.section-actions {
  display: flex;
  gap: 8px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s;
}

.toolbar-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.toolbar-btn i {
  font-size: 14px;
}

.zoom-controls {
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
  color: #fff;
}

.zoom-controls button {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-weight: bold;
  padding: 0 4px;
}

.canvas-scroller {
  flex: 1;
  overflow: auto;
  display: flex;
  justify-content: center;
  padding: 40px;
}

.page-surface {
  transition: transform 0.1s ease-out;
}

.paper-sheet {
  width: 8.5in;
  min-height: 11in;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 1in;
  margin-bottom: 20px;
  /* Typography */
  font-family: 'Times New Roman', serif;
  font-size: 12pt;
  line-height: 2;
  color: #000;
}
</style>
