import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { DraftState } from '@/types/drafting';
import { useDraftStore } from './draft.store';
import { createMockDraft } from './mock-draft';

export interface DraftMetadata {
    id: string;
    title: string;
    lastModified: number;
}

export const useDraftCollectionStore = defineStore('draft-collection', () => {
    const drafts = ref<DraftMetadata[]>([]);
    const activeDraftId = ref<string | null>(null);

    // Initialize from LocalStorage
    function init() {
        const stored = localStorage.getItem('factsway-drafts');
        if (stored) {
            drafts.value = JSON.parse(stored);
        }
    }

    function createDraft() {
        const mock = createMockDraft();
        const meta: DraftMetadata = {
            // Let's actually generate a clean ID for the *Draft* itself, distinct from sections
            id: 'draft-' + crypto.randomUUID(),
            title: 'Untitled Draft',
            lastModified: Date.now()
        };

        // Save Content
        localStorage.setItem('factsway-draft-' + meta.id, JSON.stringify(mock));

        // Update Registry
        drafts.value.unshift(meta);
        saveRegistry();

        return meta.id;
    }

    function deleteDraft(id: string) {
        drafts.value = drafts.value.filter(d => d.id !== id);
        saveRegistry();
        localStorage.removeItem('factsway-draft-' + id);

        if (activeDraftId.value === id) {
            activeDraftId.value = null;
            // Reset main draft store?
            const draftStore = useDraftStore();
            draftStore.$reset();
        }
    }

    function openDraft(id: string) {
        const contentJson = localStorage.getItem('factsway-draft-' + id);
        if (!contentJson) return;

        activeDraftId.value = id;
        const draftStore = useDraftStore();

        // Setup stores don't have $reset(), so we just overwrite state

        // Load structure
        // Note: Our draftStore.structure needs to match what we save. 
        // Currently mock-draft returns DocumentStructure. 
        // We should ideally wrap it in a DraftState object, but for now we'll load structure directly.
        draftStore.structure = JSON.parse(contentJson);

        // Update title from metadata
        const meta = drafts.value.find(d => d.id === id);
        if (meta) draftStore.title = meta.title;
    }

    function saveRegistry() {
        localStorage.setItem('factsway-drafts', JSON.stringify(drafts.value));
    }

    // Auto-save hook (call this from main App or Shell)
    function saveCurrentDraft() {
        if (!activeDraftId.value) return;
        const draftStore = useDraftStore();
        if (draftStore.isDirty) {
            localStorage.setItem('factsway-draft-' + activeDraftId.value, JSON.stringify(draftStore.structure));

            // Update metadata timestamp
            const meta = drafts.value.find(d => d.id === activeDraftId.value);
            if (meta) {
                meta.lastModified = Date.now();
                saveRegistry();
            }
            draftStore.isDirty = false;
        }
    }

    return {
        drafts,
        activeDraftId,
        init,
        createDraft,
        deleteDraft,
        openDraft,
        saveCurrentDraft
    };
});
