<template>
  <div class="shell-layout">
    <!-- Header -->
    <header class="app-header">
      <div class="header-left">
        <div class="logo">FACTSWAY</div>
        <button class="icon-btn home-btn" @click="goHome">
          <i data-lucide="home"></i>
        </button>
        
        <!-- Current Case Tab -->
        <div v-if="tabsStore.activeTab" class="case-tab active">
          {{ tabsStore.activeTab.name }}
          <button class="close-tab" @click="closeTab">
            <i data-lucide="x"></i>
          </button>
        </div>

        <button class="icon-btn new-tab-btn" @click="createNewCase">
          <i data-lucide="plus"></i>
        </button>
      </div>

      <div class="header-center">
        <!-- Center Panel Toggle (if we had one, or just status) -->
        <div v-if="tabsStore.activeTabId" class="zoom-pill">
          <!-- Placeholder for zoom or status -->
          <span>• 100%</span>
          <i data-lucide="plus" style="width: 12px"></i>
          <span>Fit</span>
        </div>
      </div>

      <div class="header-right">
        <!-- Panel Toggles -->
        <button 
          v-if="tabsStore.activeTabId"
          class="icon-btn toggle-edge" 
          :class="{ active: !panelStore.leftPanelVisible }"
          @click="panelStore.toggleLeftPanel()"
          title="Toggle Left Panel"
        >
          <i data-lucide="panel-left"></i>
        </button>

        <button 
          v-if="tabsStore.activeTabId"
          class="icon-btn toggle-edge"
          :class="{ active: !panelStore.rightPanelVisible }"
          @click="panelStore.toggleRightPanel()"
          title="Toggle Right Panel"
        >
          <i data-lucide="panel-right"></i>
        </button>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="main-viewport">
      <!-- HOME VIEW (no case selected) -->
      <div v-if="!tabsStore.activeTabId" class="home-view">
        <DraftList />
      </div>
      
      <!-- 3-PANEL LAYOUT (case selected) -->
      <template v-else>
        <!-- LEFT: Clerk Sidebar -->
        <div 
            class="panel-left-wrapper" 
            :class="{ collapsed: !panelStore.leftPanelVisible }"
        >
            <ClerkSidebar v-show="panelStore.leftPanelVisible" />
            <div 
                v-if="!panelStore.leftPanelVisible" 
                class="collapsed-strip left"
                @click="panelStore.showLeftPanel()"
                title="Show Panels"
            >
                <i data-lucide="chevron-right"></i>
            </div>
        </div>
        
        <!-- CENTER: Draft Viewport -->
        <DraftViewport :case-name="tabsStore.activeTab?.name" />
        
        <!-- RIGHT: Draft Context Panel -->
        <div 
            class="panel-right-wrapper"
            :class="{ collapsed: !panelStore.rightPanelVisible }"
        >
            <RightDraftPanel v-show="panelStore.rightPanelVisible" />
            <div 
                v-if="!panelStore.rightPanelVisible" 
                class="collapsed-strip right"
                @click="panelStore.showRightPanel()"
                title="Show Context"
            >
                <i data-lucide="chevron-left"></i>
            </div>
        </div>
      </template>
    </main>

    <!-- Global Chatbox via Clerk (Overlay) -->
    <!-- <GlobalChatOverlay /> -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUpdated } from 'vue';
import { useCaseTabsStore } from '@/stores/case-tabs.store';
import { usePanelStore } from '@/stores/panels.store';
import ClerkSidebar from '@/components/clerks/ClerkSidebar.vue';
import DraftViewport from '@/components/drafting/DraftViewport.vue';
import RightDraftPanel from '@/components/draft-context/RightDraftPanel.vue';
import DraftList from '@/components/dashboard/DraftList.vue';

const tabsStore = useCaseTabsStore();
const panelStore = usePanelStore();

function createNewCase() {
  const id = `case-${Date.now()}`;
  tabsStore.openCase(id, 'New Case');
}

function closeTab() {
  tabsStore.closeActiveTab();
}

function goHome() {
  tabsStore.activeTabId = null;
}

declare const lucide: any;

onMounted(() => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});

onUpdated(() => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});
</script>

<style scoped>
.app-shell {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header & Tabs */
.app-header {
  height: var(--header-height);
  background: var(--bg-header);
  display: flex;
  align-items: flex-end; /* Align tabs to bottom */
  padding-left: 16px;
  gap: 24px;
}

.brand {
  color: white;
  font-weight: 700;
  font-family: var(--font-head);
  padding-bottom: 12px;
  font-size: 1.1rem;
}

.tabs-container {
  display: flex;
  gap: 4px;
  height: 36px;
}

.tab {
  background: #44403c;
  color: #a8a29e;
  border-radius: 8px 8px 0 0;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s;
}

.tab:hover {
  background: #57534e;
}

.tab.active {
  background: var(--bg-desk); /* Matches body background */
  color: var(--text-ink);
  font-weight: 600;
}

.home-tab {
  padding: 0 12px;
}

.close-tab {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
}

.new-tab {
  background: none;
  border: none;
  color: #a8a29e;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 12px;
}

/* Main Layout */
.main-viewport {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  padding: 40px;
}

.paper-sheet {
  width: 8.5in;
  min-height: 11in;
  background: var(--bg-paper);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 1in;
  font-family: var(--font-legal);
  font-size: 12pt;
  line-height: 2;
  color: #000;
}

.home-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  color: var(--text-muted);
}

/* Panel Toggle Buttons */
.panel-toggles {
  margin-left: auto;
  padding-right: 16px;
  padding-bottom: 8px;
  display: flex;
  gap: 4px;
}

.toggle-btn {
  width: 32px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #44403c;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #78716c;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: #57534e;
  color: #a8a29e;
}

.toggle-btn.active {
  color: var(--accent-orange);
}

.toggle-btn i {
  width: 16px;
  height: 16px;
}

/* Collapsed Panel Edge Strip */
.panel-collapsed {
  width: 24px;
  background: var(--bg-paper);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.panel-collapsed:hover {
  background: #f5f5f4;
}

.panel-collapsed.left {
  border-right: 1px solid var(--border-subtle);
}

.panel-collapsed.right {
  border-left: 1px solid var(--border-subtle);
}

.panel-collapsed i {
  width: 16px;
  height: 16px;
  color: var(--text-muted);
}
</style>
