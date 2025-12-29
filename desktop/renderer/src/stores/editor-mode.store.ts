import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export type DraftingMode = 'PREVIEW' | 'EDIT' | 'EXHIBITS' | 'ANALYSIS';

export const useEditorModeStore = defineStore('editor-mode', () => {
    // State
    const currentMode = ref<DraftingMode>('PREVIEW');
    const isCommitting = ref(false);

    // Getters
    const isEditMode = computed(() => currentMode.value === 'EDIT');
    const isPreviewMode = computed(() => currentMode.value === 'PREVIEW');
    const isExhibitsMode = computed(() => currentMode.value === 'EXHIBITS');
    const isAnalysisMode = computed(() => currentMode.value === 'ANALYSIS');

    // Actions
    function setMode(mode: DraftingMode) {
        if (currentMode.value === 'EDIT' && mode !== 'EDIT') {
            // Trigger commit pipeline before switching
            // This is handled by the component layer via event/callback for now,
            // or we can emit a signal.
            // But structurally, the component (ParagraphBlock) handles its own commit on unmount/mode-change.
        }
        currentMode.value = mode;
    }

    function handleEscape() {
        if (currentMode.value === 'EDIT') {
            // Commit logic will be triggered by the mode switch (watchers in components)
            setMode('PREVIEW');
        } else {
            setMode('PREVIEW');
        }
    }

    return {
        currentMode,
        isCommitting,
        isEditMode,
        isPreviewMode,
        isExhibitsMode,
        isAnalysisMode,
        setMode,
        handleEscape
    };
});
