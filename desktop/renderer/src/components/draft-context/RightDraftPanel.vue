<template>
  <aside class="right-draft-panel">
    <!-- Panel Header with Hide Button -->
    <div class="panel-header">
      <span class="panel-title">CONTEXT</span>
      <button 
        class="hide-btn" 
        @click="panelStore.hideRightPanel()"
        title="Hide Panel"
      >
        <i data-lucide="panel-right-close"></i>
      </button>
    </div>
    
    <!-- Views Selector Tabs -->
    <div class="views-selector">
      <button 
        v-for="view in views" 
        :key="view.id"
        class="view-tab"
        :class="{ active: activeView === view.id }"
        @click="activeView = view.id"
      >
        <i :data-lucide="view.icon"></i>
        <span>{{ view.label }}</span>
      </button>
    </div>

    <!-- Draft Composition Info -->
    <div class="composition-panel">
      <div class="comp-section">
        <div class="comp-header">EXHIBITS</div>
        <div class="comp-content placeholder">No exhibits linked</div>
      </div>
      <div class="comp-section">
        <div class="comp-header">ATTACHMENTS</div>
        <div class="comp-content placeholder">No attachments</div>
      </div>
    </div>

    <!-- Active View Panel -->
    <div class="active-view-panel">
      <div v-if="activeView === 'editor'" class="view-content">
        <div class="view-title">Editor Tools</div>
        <p class="placeholder">Formatting and editing controls</p>
      </div>
      
      <div v-else-if="activeView === 'notes'" class="view-content">
        <div class="view-title">Notes</div>
        <p class="placeholder">Annotations excluded from export</p>
      </div>
      
      <div v-else-if="activeView === 'assistant'" class="view-content">
        <div class="view-title">Drafting Assistant</div>
        <p class="placeholder">LLM-suggested edits</p>
      </div>
      
      <div v-else-if="activeView === 'chat'" class="view-content">
        <div class="view-title">Chat</div>
        <p class="placeholder">Case-specific conversation</p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted, onUpdated } from 'vue';
import { usePanelStore } from '@/stores/panels.store';

const panelStore = usePanelStore();
declare const lucide: any;

interface ViewOption {
  id: 'editor' | 'notes' | 'assistant' | 'chat';
  label: string;
  icon: string;
}

const views: ViewOption[] = [
  { id: 'editor', label: 'Editor', icon: 'edit-3' },
  { id: 'notes', label: 'Notes', icon: 'sticky-note' },
  { id: 'assistant', label: 'Assistant', icon: 'sparkles' },
  { id: 'chat', label: 'Chat', icon: 'message-circle' },
];

const activeView = ref<ViewOption['id']>('editor');

onMounted(() => { if(typeof lucide !== 'undefined') lucide.createIcons(); });
onUpdated(() => { if(typeof lucide !== 'undefined') lucide.createIcons(); });
</script>

<style scoped>
.right-draft-panel {
  width: var(--right-panel-width, 320px);
  background: var(--bg-paper);
  border-left: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Panel Header */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-subtle);
  background: #fafaf9;
}

.panel-title {
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

/* Views Selector */
.views-selector {
  display: flex;
  border-bottom: 1px solid var(--border-subtle);
  background: #fafaf9;
}

.view-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.7rem;
  color: var(--text-muted);
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.view-tab:hover {
  background: #f5f5f4;
}

.view-tab.active {
  color: var(--accent-orange);
  border-bottom-color: var(--accent-orange);
}

.view-tab i {
  width: 18px;
  height: 18px;
}

/* Composition Panel */
.composition-panel {
  border-bottom: 1px solid var(--border-subtle);
  padding: 12px;
}

.comp-section {
  margin-bottom: 12px;
}

.comp-section:last-child {
  margin-bottom: 0;
}

.comp-header {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.comp-content.placeholder {
  font-size: 0.85rem;
  color: #a8a29e;
  font-style: italic;
}

/* Active View Panel */
.active-view-panel {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.view-title {
  font-family: var(--font-head);
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 12px;
  color: var(--text-ink);
}

.view-content .placeholder {
  color: var(--text-muted);
  font-style: italic;
  font-size: 0.9rem;
}
</style>
