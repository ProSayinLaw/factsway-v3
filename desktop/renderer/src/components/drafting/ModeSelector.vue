<template>
  <div class="mode-selector-bar">
    <div 
      class="mode-btn" 
      :class="{ active: modeStore.isPreviewMode }"
      @click="modeStore.setMode('PREVIEW')"
    >
      <span class="mode-icon">👁️</span> Preview
    </div>
    
    <div 
      class="mode-btn" 
      :class="{ active: modeStore.isEditMode }"
      @click="modeStore.setMode('EDIT')"
    >
      <span class="mode-icon">✏️</span> Edit
    </div>
    
    <div 
      class="mode-btn" 
      :class="{ active: modeStore.isExhibitsMode }"
      @click="modeStore.setMode('EXHIBITS')"
    >
      <span class="mode-icon">📎</span> Exhibits
    </div>
    
    <div 
      class="mode-btn" 
      :class="{ active: modeStore.isAnalysisMode }"
      @click="modeStore.setMode('ANALYSIS')"
    >
      <span class="mode-icon">🧠</span> Analysis
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditorModeStore } from '@/stores/editor-mode.store';

const modeStore = useEditorModeStore();
</script>

<style scoped>
.mode-selector-bar {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--surface-b);
  border-bottom: 1px solid var(--border-color);
  user-select: none;
}

.mode-btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mode-btn:hover {
  background: var(--surface-c);
  color: var(--text-primary);
}

.mode-btn.active {
  background: var(--accent-color, #007AFF);
  color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.mode-icon {
  font-size: 1.1em;
}
</style>
