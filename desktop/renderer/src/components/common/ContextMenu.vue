<template>
  <div 
    v-if="visible"
    class="context-menu"
    :style="{ top: y + 'px', left: x + 'px' }"
    @click.stop
  >
    <div 
      v-for="(item, idx) in items" 
      :key="idx"
      class="menu-item" 
      :class="{ danger: item.danger, separator: item.separator }"
      @click="handleAction(item)"
    >
      <template v-if="!item.separator">
        <i v-if="item.icon" :data-lucide="item.icon"></i>
        <span>{{ item.label }}</span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, onUpdated } from 'vue';

export interface MenuItem {
  label?: string;
  icon?: string;
  action?: () => void;
  danger?: boolean;
  separator?: boolean;
}

const props = defineProps<{
  visible: boolean;
  x: number;
  y: number;
  items: MenuItem[];
}>();

const emit = defineEmits(['close']);

function handleAction(item: MenuItem) {
  if (item.action) item.action();
  emit('close');
}

function handleOutsideClick() {
  if (props.visible) emit('close');
}

onMounted(() => {
  window.addEventListener('click', handleOutsideClick);
  window.addEventListener('contextmenu', handleOutsideClick); // Close on right click elsewhere
});

onUnmounted(() => {
  window.removeEventListener('click', handleOutsideClick);
  window.removeEventListener('contextmenu', handleOutsideClick);
});

declare const lucide: any;
onUpdated(() => { if(typeof lucide !== 'undefined') lucide.createIcons(); });
</script>

<style scoped>
.context-menu {
  position: fixed;
  z-index: 9999;
  background: white;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 160px;
  padding: 4px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 0.85rem;
  color: var(--text-ink);
  cursor: pointer;
  transition: background 0.1s;
}

.menu-item:hover {
  background: var(--bg-hover-subtle);
}

.menu-item.danger {
  color: var(--accent-red);
}

.menu-item.danger:hover {
  background: #fee2e2;
}

.menu-item.separator {
  height: 1px;
  background: var(--border-subtle);
  padding: 0;
  margin: 4px 0;
  pointer-events: none;
}

.menu-item i {
  width: 14px;
  height: 14px;
}
</style>
