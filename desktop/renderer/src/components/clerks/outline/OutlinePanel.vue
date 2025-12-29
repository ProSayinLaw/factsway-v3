<template>
  <div class="outline-panel">
    <div class="outline-tree">
      <OutlineItem 
        v-for="(rootSectionId, index) in store.structure.rootSectionIds"
        :key="rootSectionId"
        :sectionId="rootSectionId"
        :index="index"
        :depth="0"
        @node-contextmenu="openContextMenu"
      />
    </div>

    <ContextMenu 
      :visible="menuVisible"
      :x="menuX"
      :y="menuY"
      :items="menuItems"
      @close="closeContextMenu"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDraftStore } from '@/stores/draft.store';
import OutlineItem from './OutlineItem.vue';
import ContextMenu, { type MenuItem } from '@/components/common/ContextMenu.vue';

const store = useDraftStore();

const menuVisible = ref(false);
const menuX = ref(0);
const menuY = ref(0);
const targetSectionId = ref<string | null>(null);

const menuItems = computed<MenuItem[]>(() => [
  { 
    label: 'Add Subsection', 
    icon: 'plus', 
    action: () => {
      if (targetSectionId.value) store.addSection(targetSectionId.value, 0);
    } 
  },
  { 
    label: 'Add Sibling Below', 
    icon: 'arrow-down-to-line', 
    action: () => addSibling(targetSectionId.value)
  },
  { separator: true },
  { 
    label: 'Promote (Move Left)', 
    icon: 'arrow-left', 
    action: () => {
      if (targetSectionId.value) store.promoteSection(targetSectionId.value);
    } 
  },
  { 
    label: 'Demote (Move Right)', 
    icon: 'arrow-right', 
    action: () => {
      if (targetSectionId.value) store.demoteSection(targetSectionId.value);
    } 
  },
  { separator: true },
  { 
    label: 'Delete Section', 
    icon: 'trash-2', 
    danger: true,
    action: () => {
      if (targetSectionId.value) store.deleteSection(targetSectionId.value);
    } 
  }
]);

function openContextMenu(payload: { event: MouseEvent, sectionId: string }) {
  menuX.value = payload.event.clientX;
  menuY.value = payload.event.clientY;
  targetSectionId.value = payload.sectionId;
  menuVisible.value = true;
}

function closeContextMenu() {
  menuVisible.value = false;
  targetSectionId.value = null;
}

function addSibling(id: string | null) {
  if (!id) return;
  const sec = store.structure.sections[id];
  if (!sec) return;

  const parentId = sec.parentId || null;
  let index = 0;
  
  if (parentId) {
    const parent = store.structure.sections[parentId];
    index = parent.childSectionIds.indexOf(id) + 1;
  } else {
    index = store.structure.rootSectionIds.indexOf(id) + 1;
  }
  
  store.addSection(parentId, index);
}
</script>

<style scoped>
.outline-panel {
  height: 100%;
  overflow-y: auto;
  padding: 8px 0;
}

.outline-tree {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
</style>
