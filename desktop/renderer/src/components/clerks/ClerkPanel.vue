<template>
  <div class="clerk-panel" :class="{ expanded: isExpanded }">
    <div class="clerk-header" @click="$emit('toggle')">
      <div class="header-content">
        <i :data-lucide="config.icon" class="icon"></i>
        <span class="title">{{ config.name }}</span>
      </div>
      <div class="actions">
        <i data-lucide="chevron-down" class="chevron" :class="{ rotated: !isExpanded }"></i>
      </div>
    </div>

    <div v-show="isExpanded" class="clerk-body">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onUpdated } from 'vue';
// assuming lucide integration is global or injected
declare const lucide: any; 

const props = defineProps<{
  config: { name: string; icon: string };
  isExpanded: boolean;
}>();

const emit = defineEmits(['toggle']);

// Refresh icons when state changes
onUpdated(() => {
  if (typeof lucide !== 'undefined') lucide.createIcons();
});
</script>

<style scoped>
.clerk-panel {
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-paper);
  transition: all 0.2s ease-in-out;
}

.clerk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  background: var(--bg-paper);
  user-select: none;
}

.clerk-header:hover {
  background-color: #f9fafb;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-head);
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-ink);
}

.icon {
  width: 18px;
  height: 18px;
  color: var(--text-muted);
}

.expanded .icon {
  color: var(--accent-orange); /* Highlight icon when active */
}

.clerk-body {
  height: 100%; /* Fill available space in flex container */
  overflow-y: auto;
  padding: 16px;
  background-color: #ffffff;
  border-top: 1px solid var(--border-subtle);
}

.chevron {
  width: 16px;
  height: 16px;
  color: var(--text-muted);
  transition: transform 0.2s;
}

.chevron.rotated {
  transform: rotate(-90deg);
}
</style>
