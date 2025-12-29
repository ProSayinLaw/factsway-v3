import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePanelStore = defineStore('panels', () => {
    // Panel visibility state
    const leftPanelVisible = ref(true);
    const rightPanelVisible = ref(true);

    // Toggle functions
    function toggleLeftPanel() {
        leftPanelVisible.value = !leftPanelVisible.value;
    }

    function toggleRightPanel() {
        rightPanelVisible.value = !rightPanelVisible.value;
    }

    function showLeftPanel() {
        leftPanelVisible.value = true;
    }

    function hideLeftPanel() {
        leftPanelVisible.value = false;
    }

    function showRightPanel() {
        rightPanelVisible.value = true;
    }

    function hideRightPanel() {
        rightPanelVisible.value = false;
    }

    return {
        leftPanelVisible,
        rightPanelVisible,
        toggleLeftPanel,
        toggleRightPanel,
        showLeftPanel,
        hideLeftPanel,
        showRightPanel,
        hideRightPanel
    };
});
