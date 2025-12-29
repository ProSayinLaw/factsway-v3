<template>
  <div class="draft-list">
    <div class="list-header">
      <h2>Your Drafts</h2>
      <button class="new-btn" @click="handleCreate">
        <i data-lucide="plus"></i> New Draft
      </button>
    </div>

    <div v-if="store.drafts.length === 0" class="empty-state">
      <p>No drafts yet. Create one to get started.</p>
    </div>

    <div v-else class="list-grid">
      <div 
        v-for="draft in store.drafts" 
        :key="draft.id"
        class="draft-card"
        @click="handleOpen(draft.id)"
      >
        <div class="card-icon">
          <i data-lucide="file-text"></i>
        </div>
        <div class="card-info">
          <h3>{{ draft.title }}</h3>
          <span class="meta">Modified: {{ new Date(draft.lastModified).toLocaleDateString() }}</span>
        </div>
        <button class="delete-btn" @click.stop="handleDelete(draft.id)">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUpdated } from 'vue';
import { useDraftCollectionStore } from '@/stores/draft-collection.store';
import { useCaseTabsStore } from '@/stores/case-tabs.store';

const store = useDraftCollectionStore();
const tabsStore = useCaseTabsStore();

function handleCreate() {
  const id = store.createDraft();
  store.openDraft(id);
  tabsStore.openCase('draft-' + id, 'Untitled Draft');
}

function handleOpen(id: string) {
  store.openDraft(id);
  // Find draft title for tab name
  const draft = store.drafts.find(d => d.id === id);
  const title = draft ? draft.title : 'Untitled Draft';
  tabsStore.openCase('draft-' + id, title);
}

function handleDelete(id: string) {
  if (confirm('Are you sure you want to delete this draft?')) {
    store.deleteDraft(id);
  }
}

onMounted(() => {
  store.init();
});

declare const lucide: any;
onUpdated(() => { if(typeof lucide !== 'undefined') lucide.createIcons(); });
</script>

<style scoped>
.draft-list {
  padding: 40px;
  max-width: 900px;
  margin: 0 auto;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.new-btn {
  background: var(--accent-orange);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.draft-card {
  background: var(--bg-paper);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  transition: all 0.2s;
}

.draft-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.card-icon {
  width: 32px;
  height: 32px;
  background: #fdf2f8; /* Soft pink/orange bg */
  color: var(--accent-orange);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-info h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--text-ink);
}

.meta {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.delete-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.draft-card:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: var(--accent-red);
}

.empty-state {
  text-align: center;
  color: var(--text-muted);
  padding: 40px;
  background: var(--bg-highlight);
  border-radius: 8px;
  border: 1px dashed var(--border-subtle);
}
</style>
