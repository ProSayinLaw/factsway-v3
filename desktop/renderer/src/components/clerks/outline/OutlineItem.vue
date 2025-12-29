<template>
  <div class="outline-item" :class="'depth-' + depth">
    <!-- Item Row -->
    <div 
      class="item-row" 
      :class="{ active: isActive }"
      @click="handleNavigation"
      @contextmenu.prevent="handleContextMenu"
    >
      <span class="item-number">{{ number }}</span>
      <span class="item-title">{{ section.title }}</span>
    </div>

    <!-- Recursive Children -->
    <div v-if="hasChildren" class="item-children">
      <OutlineItem 
        v-for="(childId, idx) in section.childSectionIds" 
        :key="childId"
        :sectionId="childId"
        :index="idx"
        :depth="depth + 1"
        @node-contextmenu="$emit('node-contextmenu', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDraftStore } from '@/stores/draft.store';
import { getSectionLabel } from '@/utils/numbering';

const props = defineProps<{
  sectionId: string;
  index: number;
  depth: number;
}>();

const emit = defineEmits<{
  (e: 'node-contextmenu', payload: { event: MouseEvent, sectionId: string }): void
}>();

const store = useDraftStore();

const section = computed(() => store.structure.sections[props.sectionId]);
const hasChildren = computed(() => section.value?.childSectionIds.length > 0);
const isActive = computed(() => false); // TODO: Intersection observer hook

const number = computed(() => getSectionLabel(props.depth, props.index));

function handleNavigation() {
  console.log('Navigate to', props.sectionId);
  const el = document.getElementById('sec-' + props.sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function handleContextMenu(e: MouseEvent) {
  emit('node-contextmenu', { event: e, sectionId: props.sectionId });
}
</script>

<style scoped>
.item-row {
  display: flex;
  gap: 8px;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 0.85rem;
  color: var(--text-muted);
  transition: all 0.1s;
}

.item-row:hover {
  background: var(--bg-hover-subtle);
  color: var(--text-ink);
}

.item-row.active {
  background: var(--bg-hover-subtle);
  color: var(--accent-blue);
  font-weight: 500;
}

.item-number {
  min-width: 20px;
  text-align: right;
  font-feature-settings: "tnum";
}

.item-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-children {
  display: flex;
  flex-direction: column;
}

/* Indentation per depth */
.depth-0 .item-row { padding-left: 8px; font-weight: 600; color: var(--text-ink); }
.depth-1 .item-row { padding-left: 24px; font-weight: normal; }
.depth-2 .item-row { padding-left: 40px; }
.depth-3 .item-row { padding-left: 56px; }
</style>
