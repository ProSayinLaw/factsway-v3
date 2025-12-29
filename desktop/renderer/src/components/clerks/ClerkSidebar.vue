<template>
  <aside class="clerk-sidebar">
    <!-- Sidebar Header with Hide Button -->
    <div class="sidebar-header">
      <span class="sidebar-title">CLERKS</span>
      <button 
        class="hide-btn" 
        @click="panelStore.hideLeftPanel()"
        title="Hide Panel"
      >
        <i data-lucide="panel-left-close"></i>
      </button>
    </div>
    
    <div class="fixed-clerks">
      <!-- PANEL 1: Outline (Now Real!) -->
      <ClerkPanel 
        :config="{ name: 'Outline', icon: 'list' }"
        :isExpanded="expandedPanels.includes('outline')"
        @toggle="togglePanel('outline')"
      >
        <OutlinePanel />
      </ClerkPanel>

      <!-- PANEL 2: Notes -->
      <ClerkPanel 
        :config="{ name: 'Notes', icon: 'sticky-note' }"
        :isExpanded="expandedPanels.includes('notes')"
        @toggle="togglePanel('notes')"
      >
        <div class="placeholder-content">
          <p>Document annotations</p>
        </div>
      </ClerkPanel>
    </div>

    <div class="scrollable-clerks">
      <ClerkPanel 
        v-for="clerk in bottomClerks" 
        :key="clerk.id"
        :config="clerk"
        :isExpanded="store.activeClerkId === clerk.id"
        @toggle="store.toggleClerk(clerk.id)"
      >
        <div class="placeholder-content">
          {{ clerk.name }} Content Area
        </div>
      </ClerkPanel>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUpdated } from 'vue';
import { useClerkStore } from '@/stores/clerk.store';
import { usePanelStore } from '@/stores/panels.store';
import ClerkPanel from './ClerkPanel.vue';
import OutlinePanel from './outline/OutlinePanel.vue';

const store = useClerkStore();
const panelStore = usePanelStore();

// Local accordion state for fixed panels
const expandedPanels = ref<string[]>(['outline']);

function togglePanel(panelId: string) {
  const idx = expandedPanels.value.indexOf(panelId);
  if (idx === -1) {
    expandedPanels.value.push(panelId);
  } else {
    expandedPanels.value.splice(idx, 1);
  }
}

declare const lucide: any;
onMounted(() => { if(typeof lucide !== 'undefined') lucide.createIcons(); });
onUpdated(() => { if(typeof lucide !== 'undefined') lucide.createIcons(); });

// Split clerks into groups based on logic (optional, for now just splitting list)
const topClerks = computed(() => store.clerks.slice(0, 2)); // ToDo, Notes
const bottomClerks = computed(() => store.clerks.slice(2)); 
</script>

<style scoped>
.clerk-sidebar {
  width: var(--sidebar-width-expanded);
  background: var(--bg-paper);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-subtle);
  background: #fafaf9;
}

.sidebar-title {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--text-muted);
}

.hide-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  border-radius: 4px;
  transition: all 0.2s;
}

.hide-btn:hover {
  background: #e7e5e4;
  color: var(--text-ink);
}

.hide-btn i {
  width: 16px;
  height: 16px;
}

.scrollable-clerks {
  flex: 1;
  overflow-y: auto;
}

.placeholder-content {
  padding: 20px;
  color: var(--text-muted);
  font-style: italic;
  text-align: center;
}
</style>

