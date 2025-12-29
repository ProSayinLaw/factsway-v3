import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface CaseTab {
  id: string;       // Case UUID
  name: string;     // e.g. "Cruz v. JS7"
  route: string;    // /case/:id
  isDirty: boolean; // Unsaved changes?
}

export const useCaseTabsStore = defineStore('case-tabs', () => {
  // State
  const tabs = ref<CaseTab[]>([]);
  const activeTabId = ref<string | null>(null);

  // Getters
  const activeTab = computed(() =>
    tabs.value.find(t => t.id === activeTabId.value)
  );

  // Actions
  function openCase(caseId: string, caseName: string) {
    // Check if already open
    const existing = tabs.value.find(t => t.id === caseId);
    if (existing) {
      activeTabId.value = caseId;
      return;
    }

    // Open new isolated context
    tabs.value.push({
      id: caseId,
      name: caseName,
      route: `/case/${caseId}`,
      isDirty: false
    });
    activeTabId.value = caseId;
  }

  function closeTab(caseId: string) {
    const idx = tabs.value.findIndex(t => t.id === caseId);
    if (idx === -1) return;

    tabs.value.splice(idx, 1);

    // If we closed the active tab, switch to another
    if (activeTabId.value === caseId) {
      activeTabId.value = tabs.value.length > 0
        ? tabs.value[Math.max(0, idx - 1)].id
        : null;
    }
  }

  function setActive(caseId: string) {
    if (tabs.value.find(t => t.id === caseId)) {
      activeTabId.value = caseId;
    }
  }

  function closeActiveTab() {
    if (activeTabId.value) {
      closeTab(activeTabId.value);
    }
  }

  return {
    tabs,
    activeTabId,
    activeTab,
    openCase,
    closeTab,
    closeActiveTab,
    setActive
  };
});
