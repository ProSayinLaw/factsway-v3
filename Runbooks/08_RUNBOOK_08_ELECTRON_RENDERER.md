# Runbook 8: Electron Renderer - Vue + Tiptap Frontend

**Phase:** Integration (Critical Path)
**Estimated Time:** 27-33 hours
**Prerequisites:** Runbooks 1-7 complete (services + orchestrator)
**Depends On:** Runbook 0 Sections 1.7, 7, 12, 20, 22.2
**Enables:** Runbooks 9-15 (UI integration, packaging, testing)

**Breakdown:**
- Vue 3 app setup + Vite config: 2 hours
- 8 views from Design System: 4 hours
  - TemplateView, CaseView, DraftView, EditorView
  - EvidenceView, ExportView, SettingsView, HelpView
- Tiptap editor integration: 3 hours
- Custom Tiptap extensions (3): 8-12 hours
  - CitationNode (3-4h)
  - VariableNode (2-3h)
  - CrossReferenceNode (3-5h)
- Custom Footnote extension: 4-6 hours
- IPC bridge implementation: 2 hours
- Pinia state management: 2 hours
- Transformation layer (Tiptap JSON ↔ LegalDocument): 3-4 hours
- Feature Registry clerk definitions (8 clerks): 8 hours
  - 1 hour per clerk × 8 clerks
  - Facts Clerk already done in Runbook 1
  - 7 remaining: Exhibits, Discovery, Caseblock, Signature, Editor, Communication, Analysis
- Testing and integration: 2-3 hours

**Why longer than original estimate:**
- Original assumed community Tiptap extensions would work (they don't)
- Custom extensions take longer than expected (8-12h not 3h)
- Custom footnote extension needed (community package unmaintained)
- Feature Registry documentation for all 8 clerks (8h)
- This is realistic time for production-quality implementation

**Original estimate (12-16h) was optimistic.** This is honest assessment.

**This is "one-shot" development:** Invest proper time now, build it right once, no refactoring later.

---

## Objective

Create the **Electron Renderer** - Vue 3 application with Tiptap editor that provides the user interface for FACTSWAY desktop deployment.

**Success Criteria:**
- ✅ Vue 3 app renders in Electron window
- ✅ Tiptap editor functional with custom nodes
- ✅ IPC communication with Main process
- ✅ All views implemented per Design System (Section 20)
- ✅ Service API integration working
- ✅ Evidence linking UI functional
- ✅ Export preview working
- ✅ Hot module reload in development

---

## Context from Runbook 0

**Referenced Sections:**
- **Section 1.7.1:** Desktop Deployment Architecture
  - Electron Renderer with Vue + Tiptap
  - Communicates with Main via IPC
  - Transforms Tiptap JSON ↔ LegalDocument
- **Section 7:** Body Editor Specification
  - **Section 7.1:** Tiptap configuration
  - **Section 7.2:** Custom nodes (Citation, Variable, CrossReference)
  - **Section 7.3:** Toolbar implementation
  - **Section 7.4:** Section hierarchy
- **Section 12:** UI/UX Specifications
  - **Section 12.1:** Navigation architecture
  - **Section 12.2:** Layout patterns
  - **Section 12.3:** Modal system
  - **Section 12.4:** Loading states
- **Section 20:** Design System
  - **Section 20.1-20.3:** Tokens, typography, colors
  - **Section 20.4:** Component specifications
  - **Section 20.5:** Layout patterns
  - **Section 20.6:** Interaction patterns
  - **Section 20.7:** View specifications
- **Section 22.2:** Desktop Deployment Details
  - Service URLs via environment (localhost:3001-3008)
  - IPC for file operations
  - Local-first data storage

**Key Principle from Runbook 0:**
> "The renderer is a transformation layer between Tiptap's editor state and the LegalDocument schema. It never creates service-specific data structures—only transforms between UI state and canonical backend format."

---

## Current State

**What exists:**
- ✅ Desktop orchestrator (Runbook 7) spawning services
- ✅ All 8 backend services running (ports 3001-3008)
- ✅ LegalDocument schema (@factsway/shared-types)
- ✅ IPC handlers in Main process
- ❌ No Vue application
- ❌ No Tiptap editor
- ❌ No UI components
- ❌ No renderer code

**What this creates:**
- ✅ `desktop/renderer/` with complete Vue 3 app
- ✅ Tiptap editor with custom extensions
- ✅ All 8 views from Design System (Section 20.7)
- ✅ Component library matching Section 20.4
- ✅ IPC bridge for service communication
- ✅ Transformation layer (Tiptap ↔ LegalDocument)
- ✅ Evidence sidebar and linking UI
- ✅ Export preview modal

---

## Task 1: Create Renderer Structure

### 1.1 Create Directory Structure

**Location:** `desktop/renderer/`

**Action:** CREATE new directories

```bash
# From desktop/ directory
mkdir -p renderer/src/{views,components,composables,stores,services,types,utils,extensions}
mkdir -p renderer/src/components/{common,templates,cases,drafts,evidence}
mkdir -p renderer/src/extensions/{nodes,marks}
mkdir -p renderer/public/{assets,icons}
```

**Verification:**
```bash
tree desktop/renderer/src -L 2

# Expected output:
# renderer/src/
# ├── views/
# ├── components/
# │   ├── common/
# │   ├── templates/
# │   ├── cases/
# │   ├── drafts/
# │   └── evidence/
# ├── composables/
# ├── stores/
# ├── services/
# ├── types/
# ├── utils/
# ├── extensions/
# │   ├── nodes/
# │   └── marks/
# └── ...
```

---

### 1.2 Create package.json

**File:** `desktop/renderer/package.json`

**Action:** CREATE

**Content:**
```json
{
  "name": "factsway-renderer",
  "version": "1.0.0",
  "description": "FACTSWAY Desktop Renderer (Vue + Tiptap)",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "type-check": "vue-tsc --noEmit",
    "lint": "eslint src --ext .vue,.ts"
  },
  "dependencies": {
    "@factsway/shared-types": "workspace:*",
    "vue": "^3.4.0",
    "vue-router": "^4.2.5",
    "pinia": "^2.1.7",
    "@tiptap/vue-3": "^2.1.13",
    "@tiptap/starter-kit": "^2.1.13",
    "@tiptap/extension-table": "^2.1.13",
    "@tiptap/extension-table-row": "^2.1.13",
    "@tiptap/extension-table-cell": "^2.1.13",
    "@tiptap/extension-table-header": "^2.1.13",
    "@tiptap/extension-image": "^2.1.13",
    "@tiptap/extension-link": "^2.1.13",
    "@tiptap/extension-text-style": "^2.1.13",
    "@tiptap/extension-color": "^2.1.13",
    "@tiptap/extension-highlight": "^2.1.13",
    "axios": "^1.6.2",
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.6",
    "@vitejs/plugin-vue": "^5.0.0",
    "@vue/eslint-config-typescript": "^12.0.0",
    "eslint": "^8.56.0",
    "eslint-plugin-vue": "^9.19.2",
    "typescript": "^5.3.3",
    "vite": "^5.0.10",
    "vite-plugin-electron-renderer": "^0.14.5",
    "vue-tsc": "^1.8.27"
  }
}
```

---

### 1.3 Create Vite Configuration

**File:** `desktop/renderer/vite.config.ts`

**Action:** CREATE

**Content:**
```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import renderer from 'vite-plugin-electron-renderer';

export default defineConfig({
  plugins: [
    vue(),
    renderer()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'tiptap-core': ['@tiptap/vue-3', '@tiptap/starter-kit'],
          'tiptap-extensions': [
            '@tiptap/extension-table',
            '@tiptap/extension-image',
            '@tiptap/extension-link'
          ]
        }
      }
    }
  },
  server: {
    port: 5173
  }
});
```

---

### 1.4 Create TypeScript Configuration

**File:** `desktop/renderer/tsconfig.json`

**Action:** CREATE

**Content:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**File:** `desktop/renderer/tsconfig.node.json`

**Action:** CREATE

**Content:**
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

---

## Task 2: IPC Bridge & Service Client

### 2.1 IPC Type Definitions

**File:** `desktop/renderer/src/types/ipc.types.ts`

**Action:** CREATE

**Purpose:** Type-safe IPC communication with Main process

**Content:**
```typescript
/**
 * IPC Channel Definitions
 * 
 * Reference: Runbook 0 Section 17.3 (IPC Protocol)
 * 
 * Channels follow pattern: <domain>:<action>
 * Main process handles all service communication
 */

export interface IPCInvokeMap {
  // Template operations
  'templates:list': () => Promise<Template[]>;
  'templates:get': (id: string) => Promise<Template>;
  'templates:create': (data: CreateTemplateData) => Promise<Template>;
  'templates:update': (id: string, data: Partial<Template>) => Promise<Template>;
  'templates:delete': (id: string) => Promise<void>;

  // Case operations
  'cases:list': () => Promise<Case[]>;
  'cases:get': (id: string) => Promise<Case>;
  'cases:create': (data: CreateCaseData) => Promise<Case>;
  'cases:update': (id: string, data: Partial<Case>) => Promise<Case>;
  'cases:delete': (id: string) => Promise<void>;

  // Draft operations
  'drafts:list': (caseId: string) => Promise<Draft[]>;
  'drafts:get': (id: string) => Promise<Draft>;
  'drafts:create': (data: CreateDraftData) => Promise<Draft>;
  'drafts:update': (id: string, data: Partial<Draft>) => Promise<Draft>;
  'drafts:delete': (id: string) => Promise<void>;

  // Ingestion operations
  'ingestion:parse': (filepath: string) => Promise<ParseResult>;
  'ingestion:extract-caseblock': (filepath: string) => Promise<CaseBlockData>;
  'ingestion:extract-signature': (filepath: string) => Promise<SignatureData>;

  // Export operations
  'export:generate': (draftId: string) => Promise<ExportResult>;
  'export:preview': (draftId: string) => Promise<{ pdfPath: string }>;

  // Evidence operations
  'evidence:list': (caseId: string) => Promise<Evidence[]>;
  'evidence:upload': (caseId: string, filepath: string) => Promise<Evidence>;
  'evidence:delete': (id: string) => Promise<void>;

  // File system operations
  'file:select': (options: FileSelectOptions) => Promise<string | null>;
  'file:save': (options: FileSaveOptions) => Promise<string | null>;
  'file:open': (filepath: string) => Promise<void>;

  // Service health
  'services:health': () => Promise<ServiceHealthStatus[]>;
}

export interface IPCEventMap {
  // Service status updates
  'service:started': (serviceName: string) => void;
  'service:stopped': (serviceName: string) => void;
  'service:error': (serviceName: string, error: string) => void;

  // Export progress
  'export:progress': (progress: ExportProgress) => void;

  // File watcher events
  'file:changed': (filepath: string) => void;
}

// Helper types
export interface FileSelectOptions {
  filters?: Array<{ name: string; extensions: string[] }>;
  properties?: Array<'openFile' | 'multiSelections'>;
  defaultPath?: string;
}

export interface FileSaveOptions {
  defaultPath?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
}

export interface ServiceHealthStatus {
  name: string;
  port: number;
  status: 'running' | 'stopped' | 'error';
  uptime?: number;
}

export interface ExportProgress {
  phase: string;
  progress: number; // 0-100
  message: string;
}

// Re-export shared types
export type {
  Template,
  Case,
  Draft,
  Evidence,
  LegalDocument
} from '@factsway/shared-types';
```

---

### 2.2 IPC Service Client

**File:** `desktop/renderer/src/services/ipc.service.ts`

**Action:** CREATE

**Purpose:** Type-safe wrapper around Electron IPC

**Content:**
```typescript
import type { IPCInvokeMap, IPCEventMap } from '@/types/ipc.types';

/**
 * IPC Service Client
 * 
 * Provides type-safe access to Electron IPC
 * All service communication goes through Main process
 * 
 * Reference: Runbook 0 Section 17.3
 */
class IPCService {
  /**
   * Invoke IPC handler (request/response pattern)
   */
  async invoke<K extends keyof IPCInvokeMap>(
    channel: K,
    ...args: Parameters<IPCInvokeMap[K]>
  ): Promise<ReturnType<IPCInvokeMap[K]>> {
    if (!window.electron?.ipcRenderer) {
      throw new Error('Electron IPC not available');
    }

    return window.electron.ipcRenderer.invoke(channel, ...args);
  }

  /**
   * Listen to IPC events (one-way from Main)
   */
  on<K extends keyof IPCEventMap>(
    channel: K,
    callback: IPCEventMap[K]
  ): () => void {
    if (!window.electron?.ipcRenderer) {
      throw new Error('Electron IPC not available');
    }

    const listener = (_event: any, ...args: any[]) => {
      callback(...(args as Parameters<IPCEventMap[K]>));
    };

    window.electron.ipcRenderer.on(channel, listener);

    // Return cleanup function
    return () => {
      window.electron.ipcRenderer.removeListener(channel, listener);
    };
  }

  /**
   * Remove all listeners for a channel
   */
  removeAllListeners(channel: keyof IPCEventMap): void {
    if (window.electron?.ipcRenderer) {
      window.electron.ipcRenderer.removeAllListeners(channel);
    }
  }
}

// Singleton instance
export const ipcService = new IPCService();
```

---

### 2.3 Window Type Augmentation

**File:** `desktop/renderer/src/types/window.d.ts`

**Action:** CREATE

**Purpose:** TypeScript declarations for Electron preload API

**Content:**
```typescript
import type { IpcRenderer } from 'electron';

declare global {
  interface Window {
    electron?: {
      ipcRenderer: {
        invoke(channel: string, ...args: any[]): Promise<any>;
        on(channel: string, listener: (...args: any[]) => void): void;
        removeListener(channel: string, listener: (...args: any[]) => void): void;
        removeAllListeners(channel: string): void;
      };
    };
  }
}
```

---

## Task 3: Pinia Stores (State Management)

### 3.1 Templates Store

**File:** `desktop/renderer/src/stores/templates.store.ts`

**Action:** CREATE

**Content:**
```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ipcService } from '@/services/ipc.service';
import type { Template } from '@factsway/shared-types';

export const useTemplatesStore = defineStore('templates', () => {
  // State
  const templates = ref<Template[]>([]);
  const currentTemplate = ref<Template | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const templatesByJurisdiction = computed(() => {
    const grouped: Record<string, Template[]> = {};
    templates.value.forEach(template => {
      const jurisdiction = template.metadata.jurisdiction || 'Other';
      if (!grouped[jurisdiction]) {
        grouped[jurisdiction] = [];
      }
      grouped[jurisdiction].push(template);
    });
    return grouped;
  });

  // Actions
  async function loadTemplates() {
    loading.value = true;
    error.value = null;
    try {
      templates.value = await ipcService.invoke('templates:list');
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load templates';
      console.error('Templates load error:', err);
    } finally {
      loading.value = false;
    }
  }

  async function loadTemplate(id: string) {
    loading.value = true;
    error.value = null;
    try {
      currentTemplate.value = await ipcService.invoke('templates:get', id);
      return currentTemplate.value;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load template';
      console.error('Template load error:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createTemplate(data: Partial<Template>) {
    loading.value = true;
    error.value = null;
    try {
      const template = await ipcService.invoke('templates:create', data as any);
      templates.value.push(template);
      return template;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create template';
      console.error('Template create error:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateTemplate(id: string, data: Partial<Template>) {
    loading.value = true;
    error.value = null;
    try {
      const updated = await ipcService.invoke('templates:update', id, data);
      const index = templates.value.findIndex(t => t.id === id);
      if (index !== -1) {
        templates.value[index] = updated;
      }
      if (currentTemplate.value?.id === id) {
        currentTemplate.value = updated;
      }
      return updated;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update template';
      console.error('Template update error:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteTemplate(id: string) {
    loading.value = true;
    error.value = null;
    try {
      await ipcService.invoke('templates:delete', id);
      templates.value = templates.value.filter(t => t.id !== id);
      if (currentTemplate.value?.id === id) {
        currentTemplate.value = null;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete template';
      console.error('Template delete error:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    templates,
    currentTemplate,
    loading,
    error,
    // Computed
    templatesByJurisdiction,
    // Actions
    loadTemplates,
    loadTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate
  };
});
```

---

### 3.2 Cases Store

**File:** `desktop/renderer/src/stores/cases.store.ts`

**Action:** CREATE

**Content:**
```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ipcService } from '@/services/ipc.service';
import type { Case } from '@factsway/shared-types';

export const useCasesStore = defineStore('cases', () => {
  // State
  const cases = ref<Case[]>([]);
  const currentCase = ref<Case | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const activeCases = computed(() =>
    cases.value.filter(c => c.status === 'active')
  );

  const archivedCases = computed(() =>
    cases.value.filter(c => c.status === 'archived')
  );

  const casesByTemplate = computed(() => {
    const grouped: Record<string, Case[]> = {};
    cases.value.forEach(caseItem => {
      const templateId = caseItem.template_id || 'none';
      if (!grouped[templateId]) {
        grouped[templateId] = [];
      }
      grouped[templateId].push(caseItem);
    });
    return grouped;
  });

  // Actions
  async function loadCases() {
    loading.value = true;
    error.value = null;
    try {
      cases.value = await ipcService.invoke('cases:list');
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load cases';
      console.error('Cases load error:', err);
    } finally {
      loading.value = false;
    }
  }

  async function loadCase(id: string) {
    loading.value = true;
    error.value = null;
    try {
      currentCase.value = await ipcService.invoke('cases:get', id);
      return currentCase.value;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load case';
      console.error('Case load error:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createCase(data: Partial<Case>) {
    loading.value = true;
    error.value = null;
    try {
      const newCase = await ipcService.invoke('cases:create', data as any);
      cases.value.push(newCase);
      return newCase;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create case';
      console.error('Case create error:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateCase(id: string, data: Partial<Case>) {
    loading.value = true;
    error.value = null;
    try {
      const updated = await ipcService.invoke('cases:update', id, data);
      const index = cases.value.findIndex(c => c.id === id);
      if (index !== -1) {
        cases.value[index] = updated;
      }
      if (currentCase.value?.id === id) {
        currentCase.value = updated;
      }
      return updated;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update case';
      console.error('Case update error:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteCase(id: string) {
    loading.value = true;
    error.value = null;
    try {
      await ipcService.invoke('cases:delete', id);
      cases.value = cases.value.filter(c => c.id !== id);
      if (currentCase.value?.id === id) {
        currentCase.value = null;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete case';
      console.error('Case delete error:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    cases,
    currentCase,
    loading,
    error,
    // Computed
    activeCases,
    archivedCases,
    casesByTemplate,
    // Actions
    loadCases,
    loadCase,
    createCase,
    updateCase,
    deleteCase
  };
});
```

---

### 3.3 Drafts Store

**File:** `desktop/renderer/src/stores/drafts.store.ts`

**Action:** CREATE

**Content:**
```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ipcService } from '@/services/ipc.service';
import type { Draft, LegalDocument } from '@factsway/shared-types';

export const useDraftsStore = defineStore('drafts', () => {
  // State
  const drafts = ref<Draft[]>([]);
  const currentDraft = ref<Draft | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const saving = ref(false);

  // Computed
  const draftsByCase = computed(() => {
    const grouped: Record<string, Draft[]> = {};
    drafts.value.forEach(draft => {
      const caseId = draft.case_id;
      if (!grouped[caseId]) {
        grouped[caseId] = [];
      }
      grouped[caseId].push(draft);
    });
    return grouped;
  });

  const hasUnsavedChanges = computed(() => {
    // Track if current draft has unsaved changes
    // This would be set by the editor component
    return false; // Placeholder
  });

  // Actions
  async function loadDrafts(caseId: string) {
    loading.value = true;
    error.value = null;
    try {
      const caseDrafts = await ipcService.invoke('drafts:list', caseId);
      // Merge with existing drafts from other cases
      drafts.value = [
        ...drafts.value.filter(d => d.case_id !== caseId),
        ...caseDrafts
      ];
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load drafts';
      console.error('Drafts load error:', err);
    } finally {
      loading.value = false;
    }
  }

  async function loadDraft(id: string) {
    loading.value = true;
    error.value = null;
    try {
      currentDraft.value = await ipcService.invoke('drafts:get', id);
      return currentDraft.value;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load draft';
      console.error('Draft load error:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createDraft(data: Partial<Draft>) {
    loading.value = true;
    error.value = null;
    try {
      const draft = await ipcService.invoke('drafts:create', data as any);
      drafts.value.push(draft);
      return draft;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create draft';
      console.error('Draft create error:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateDraft(id: string, data: Partial<Draft>) {
    saving.value = true;
    error.value = null;
    try {
      const updated = await ipcService.invoke('drafts:update', id, data);
      const index = drafts.value.findIndex(d => d.id === id);
      if (index !== -1) {
        drafts.value[index] = updated;
      }
      if (currentDraft.value?.id === id) {
        currentDraft.value = updated;
      }
      return updated;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update draft';
      console.error('Draft update error:', err);
      throw err;
    } finally {
      saving.value = false;
    }
  }

  async function deleteDraft(id: string) {
    loading.value = true;
    error.value = null;
    try {
      await ipcService.invoke('drafts:delete', id);
      drafts.value = drafts.value.filter(d => d.id !== id);
      if (currentDraft.value?.id === id) {
        currentDraft.value = null;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete draft';
      console.error('Draft delete error:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function saveDraftContent(id: string, legalDocument: LegalDocument) {
    return updateDraft(id, { document_json: legalDocument });
  }

  return {
    // State
    drafts,
    currentDraft,
    loading,
    error,
    saving,
    // Computed
    draftsByCase,
    hasUnsavedChanges,
    // Actions
    loadDrafts,
    loadDraft,
    createDraft,
    updateDraft,
    deleteDraft,
    saveDraftContent
  };
});
```

---

## Task 4: Tiptap Editor Setup

### 4.1 Custom Citation Node Extension

**File:** `desktop/renderer/src/extensions/nodes/CitationNode.ts`

**Action:** CREATE

**Purpose:** Custom Tiptap node for evidence citations

**Reference:** Runbook 0 Section 7.2.1

**Content:**
```typescript
import { Node, mergeAttributes } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import CitationNodeView from '@/components/editor/CitationNodeView.vue';

export interface CitationAttributes {
  evidenceId: string;
  evidenceType: 'exhibit' | 'caselaw' | 'statute';
  displayText: string;
  supportsSentenceIds: string[]; // Array of sentence IDs this citation supports
}

/**
 * Citation Node Extension
 * 
 * Reference: Runbook 0 Section 7.2.1, Section 2.7
 * 
 * Renders as blue chip when linked, amber when unlinked
 * Double-click opens citation popover for editing
 */
export const CitationNode = Node.create({
  name: 'citation',

  group: 'inline',

  inline: true,

  atom: true, // Cannot be split or edited directly

  addAttributes() {
    return {
      evidenceId: {
        default: null,
        parseHTML: element => element.getAttribute('data-evidence-id'),
        renderHTML: attributes => {
          if (!attributes.evidenceId) return {};
          return { 'data-evidence-id': attributes.evidenceId };
        }
      },
      evidenceType: {
        default: 'exhibit',
        parseHTML: element => element.getAttribute('data-evidence-type'),
        renderHTML: attributes => {
          return { 'data-evidence-type': attributes.evidenceType };
        }
      },
      displayText: {
        default: '',
        parseHTML: element => element.getAttribute('data-display-text'),
        renderHTML: attributes => {
          return { 'data-display-text': attributes.displayText };
        }
      },
      supportsSentenceIds: {
        default: [],
        parseHTML: element => {
          const value = element.getAttribute('data-supports-sentence-ids');
          return value ? JSON.parse(value) : [];
        },
        renderHTML: attributes => {
          if (!attributes.supportsSentenceIds?.length) return {};
          return {
            'data-supports-sentence-ids': JSON.stringify(attributes.supportsSentenceIds)
          };
        }
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="citation"]'
      }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'citation',
        class: 'citation-node'
      }),
      0 // Content placeholder (won't be used for atom nodes)
    ];
  },

  addNodeView() {
    return VueNodeViewRenderer(CitationNodeView);
  },

  addCommands() {
    return {
      setCitation:
        (attributes: CitationAttributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes
          });
        },
      updateCitation:
        (attributes: Partial<CitationAttributes>) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, attributes);
        }
    };
  }
});
```

---

### 4.2 Citation Node View Component

**File:** `desktop/renderer/src/components/editor/CitationNodeView.vue`

**Action:** CREATE

**Content:**
```vue
<template>
  <span
    :class="citationClass"
    :data-evidence-id="node.attrs.evidenceId"
    @dblclick="openPopover"
  >
    {{ node.attrs.displayText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3';

const props = defineProps(nodeViewProps);

const citationClass = computed(() => {
  const baseClass = 'citation-chip';
  const isLinked = props.node.attrs.evidenceId !== null;
  
  return [
    baseClass,
    isLinked ? 'citation-linked' : 'citation-unlinked'
  ].join(' ');
});

function openPopover() {
  // Emit event to parent editor to open citation popover
  window.dispatchEvent(new CustomEvent('open-citation-popover', {
    detail: {
      node: props.node,
      getPos: props.getPos
    }
  }));
}
</script>

<style scoped>
.citation-chip {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.9em;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.citation-linked {
  background: var(--accent-link-bg);
  color: var(--accent-link);
  border: 1px solid var(--accent-link);
}

.citation-linked:hover {
  background: var(--accent-link);
  color: white;
}

.citation-unlinked {
  background: var(--warning-bg);
  color: var(--warning);
  border: 1px dashed var(--warning);
}

.citation-unlinked:hover {
  background: var(--warning);
  color: white;
}
</style>
```

---

### 4.3 Custom Variable Node Extension

**File:** `desktop/renderer/src/extensions/nodes/VariableNode.ts`

**Action:** CREATE

**Purpose:** Custom node for template variables

**Reference:** Runbook 0 Section 7.2.2

**Content:**
```typescript
import { Node, mergeAttributes } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import VariableNodeView from '@/components/editor/VariableNodeView.vue';

export interface VariableAttributes {
  variableName: string; // e.g. "filing_date", "motion_title"
  displayValue?: string; // Computed value for preview
  format?: string; // Optional format string (for dates, numbers)
}

/**
 * Variable Node Extension
 * 
 * Reference: Runbook 0 Section 7.2.2, Section 2.11
 * 
 * Renders as amber chip with variable name
 * Resolves to actual value at export time
 */
export const VariableNode = Node.create({
  name: 'variable',

  group: 'inline',

  inline: true,

  atom: true,

  addAttributes() {
    return {
      variableName: {
        default: '',
        parseHTML: element => element.getAttribute('data-variable-name'),
        renderHTML: attributes => {
          return { 'data-variable-name': attributes.variableName };
        }
      },
      displayValue: {
        default: null,
        parseHTML: element => element.getAttribute('data-display-value'),
        renderHTML: attributes => {
          if (!attributes.displayValue) return {};
          return { 'data-display-value': attributes.displayValue };
        }
      },
      format: {
        default: null,
        parseHTML: element => element.getAttribute('data-format'),
        renderHTML: attributes => {
          if (!attributes.format) return {};
          return { 'data-format': attributes.format };
        }
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="variable"]'
      }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'variable',
        class: 'variable-node'
      }),
      0
    ];
  },

  addNodeView() {
    return VueNodeViewRenderer(VariableNodeView);
  },

  addCommands() {
    return {
      setVariable:
        (attributes: VariableAttributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes
          });
        }
    };
  }
});
```

---

### 4.4 Variable Node View Component

**File:** `desktop/renderer/src/components/editor/VariableNodeView.vue`

**Action:** CREATE

**Content:**
```vue
<template>
  <span class="variable-chip" :title="tooltipText">
    {{ displayText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { nodeViewProps } from '@tiptap/vue-3';

const props = defineProps(nodeViewProps);

const displayText = computed(() => {
  // Show computed value if available, otherwise show variable name
  if (props.node.attrs.displayValue) {
    return props.node.attrs.displayValue;
  }
  return `{{${props.node.attrs.variableName}}}`;
});

const tooltipText = computed(() => {
  return `Variable: ${props.node.attrs.variableName}`;
});
</script>

<style scoped>
.variable-chip {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.9em;
  font-weight: 500;
  background: var(--warning-bg);
  color: var(--warning);
  border: 1px solid var(--warning);
  cursor: help;
  user-select: none;
}
</style>
```

---

### 4.5 Custom CrossReference Node Extension

**File:** `desktop/renderer/src/extensions/nodes/CrossReferenceNode.ts`

**Action:** CREATE

**Purpose:** Custom node for internal section cross-references

**Reference:** Runbook 0 Section 7.2.3

**Content:**
```typescript
import { Node, mergeAttributes } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import CrossReferenceNodeView from '@/components/editor/CrossReferenceNodeView.vue';

export interface CrossReferenceAttributes {
  targetSectionId: string; // UUID of target section
  displayText: string; // e.g. "Section II.A"
  isBroken: boolean; // True if target section no longer exists
}

/**
 * CrossReference Node Extension
 * 
 * Reference: Runbook 0 Section 7.2.3, Section 2.10
 * 
 * Renders as purple chip, red strikethrough if broken
 * Updates automatically when sections are renumbered
 */
export const CrossReferenceNode = Node.create({
  name: 'crossReference',

  group: 'inline',

  inline: true,

  atom: true,

  addAttributes() {
    return {
      targetSectionId: {
        default: null,
        parseHTML: element => element.getAttribute('data-target-section-id'),
        renderHTML: attributes => {
          if (!attributes.targetSectionId) return {};
          return { 'data-target-section-id': attributes.targetSectionId };
        }
      },
      displayText: {
        default: '',
        parseHTML: element => element.getAttribute('data-display-text'),
        renderHTML: attributes => {
          return { 'data-display-text': attributes.displayText };
        }
      },
      isBroken: {
        default: false,
        parseHTML: element => element.getAttribute('data-is-broken') === 'true',
        renderHTML: attributes => {
          return { 'data-is-broken': attributes.isBroken.toString() };
        }
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="cross-reference"]'
      }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'cross-reference',
        class: 'cross-reference-node'
      }),
      0
    ];
  },

  addNodeView() {
    return VueNodeViewRenderer(CrossReferenceNodeView);
  },

  addCommands() {
    return {
      setCrossReference:
        (attributes: CrossReferenceAttributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes
          });
        },
      updateCrossReference:
        (attributes: Partial<CrossReferenceAttributes>) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, attributes);
        }
    };
  }
});
```

---

### 4.6 CrossReference Node View Component

**File:** `desktop/renderer/src/components/editor/CrossReferenceNodeView.vue`

**Action:** CREATE

**Content:**
```vue
<template>
  <span :class="crossRefClass">
    {{ node.attrs.displayText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { nodeViewProps } from '@tiptap/vue-3';

const props = defineProps(nodeViewProps);

const crossRefClass = computed(() => {
  const baseClass = 'cross-ref-chip';
  const brokenClass = props.node.attrs.isBroken ? 'cross-ref-broken' : '';
  
  return [baseClass, brokenClass].filter(Boolean).join(' ');
});
</script>

<style scoped>
.cross-ref-chip {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.9em;
  font-weight: 500;
  background: var(--accent-purple-bg);
  color: var(--accent-purple);
  border: 1px solid var(--accent-purple);
  cursor: pointer;
  user-select: none;
}

.cross-ref-broken {
  background: var(--danger-bg);
  color: var(--danger);
  border-color: var(--danger);
  text-decoration: line-through;
}
</style>
```

---

### 4.7 Custom Footnote Node Extension

**Why custom instead of community package?**

The `tiptap-footnotes` package exists but is unmaintained (last update 2022). Building custom gives us:
- ✅ Full control over behavior
- ✅ Guaranteed DOCX export compatibility
- ✅ No dependency on unmaintained package
- ✅ Can customize for legal document needs
- ✅ Tight integration with LegalDocument format

**This is "one-shot" development:** 4-6 hours now prevents maintenance issues later.

**File:** `desktop/renderer/src/extensions/nodes/FootnoteNode.ts`

**Action:** CREATE

**Content:**
```typescript
import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import FootnoteComponent from './FootnoteComponent.vue'

export interface FootnoteOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    footnote: {
      /**
       * Insert a footnote at the current cursor position
       */
      insertFootnote: (text: string) => ReturnType
      /**
       * Update footnote text by ID
       */
      updateFootnote: (id: string, text: string) => ReturnType
    }
  }
}

export const FootnoteNode = Node.create<FootnoteOptions>({
  name: 'footnote',

  group: 'inline',
  inline: true,
  atom: true,  // Treat as single unit (can't put cursor inside marker)

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-footnote-id'),
        renderHTML: attributes => {
          if (!attributes.id) {
            return {}
          }
          return {
            'data-footnote-id': attributes.id,
          }
        },
      },
      text: {
        default: '',
        parseHTML: element => element.getAttribute('data-footnote-text'),
        renderHTML: attributes => {
          if (!attributes.text) {
            return {}
          }
          return {
            'data-footnote-text': attributes.text,
          }
        },
      },
      number: {
        default: 1,
        parseHTML: element => parseInt(element.getAttribute('data-footnote-number') || '1'),
        renderHTML: attributes => {
          return {
            'data-footnote-number': attributes.number,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'footnote',
      },
      {
        tag: 'sup[data-footnote-id]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['footnote', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addNodeView() {
    return VueNodeViewRenderer(FootnoteComponent)
  },

  addCommands() {
    return {
      insertFootnote:
        (text: string) =>
        ({ commands, state }) => {
          const id = `footnote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

          // Get current footnote count for numbering
          let footnoteCount = 0
          state.doc.descendants((node) => {
            if (node.type.name === 'footnote') {
              footnoteCount++
            }
          })
          const number = footnoteCount + 1

          return commands.insertContent({
            type: this.name,
            attrs: { id, text, number },
          })
        },

      updateFootnote:
        (id: string, text: string) =>
        ({ tr, state }) => {
          let updated = false

          state.doc.descendants((node, pos) => {
            if (node.type.name === this.name && node.attrs.id === id) {
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, text })
              updated = true
            }
          })

          return updated
        },
    }
  },
})
```

---

### 4.8 Footnote Node View Component

**File:** `desktop/renderer/src/extensions/nodes/FootnoteComponent.vue`

**Action:** CREATE

**Content:**
```vue
<template>
  <NodeViewWrapper as="span" class="footnote-marker">
    <sup
      class="footnote-number"
      :data-footnote-id="node.attrs.id"
      @click="showFootnote"
      @mouseenter="showTooltip"
      @mouseleave="hideTooltip"
    >
      {{ node.attrs.number }}
    </sup>

    <!-- Tooltip showing footnote text on hover -->
    <Teleport to="body">
      <div
        v-if="tooltipVisible"
        class="footnote-tooltip"
        :style="tooltipStyle"
      >
        {{ node.attrs.text }}
      </div>
    </Teleport>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NodeViewWrapper } from '@tiptap/vue-3'

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
  editor: {
    type: Object,
    required: true,
  },
})

const tooltipVisible = ref(false)
const tooltipPosition = ref({ x: 0, y: 0 })

const tooltipStyle = computed(() => ({
  left: `${tooltipPosition.value.x}px`,
  top: `${tooltipPosition.value.y}px`,
}))

function showTooltip(event: MouseEvent) {
  tooltipPosition.value = {
    x: event.clientX,
    y: event.clientY - 40, // Position above cursor
  }
  tooltipVisible.value = true
}

function hideTooltip() {
  tooltipVisible.value = false
}

function showFootnote() {
  // Emit event to show footnote in sidebar panel
  props.editor.emit('show-footnote', props.node.attrs.id)
}
</script>

<style scoped>
.footnote-marker {
  position: relative;
}

.footnote-number {
  color: #2563eb;
  cursor: pointer;
  user-select: none;
}

.footnote-number:hover {
  text-decoration: underline;
}

.footnote-tooltip {
  position: fixed;
  background: #1f2937;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  max-width: 300px;
  z-index: 9999;
  pointer-events: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
```

---

### 4.9 Footnote Panel Component

**File:** `desktop/renderer/src/components/FootnotePanel.vue`

**Action:** CREATE

**Purpose:** Sidebar panel showing all footnotes with edit capability

**Content:**
```vue
<template>
  <div class="footnote-panel">
    <h3>Footnotes</h3>

    <div v-if="footnotes.length === 0" class="empty-state">
      No footnotes in document
    </div>

    <div v-else class="footnote-list">
      <div
        v-for="footnote in footnotes"
        :key="footnote.id"
        class="footnote-item"
        :class="{ active: activeFootnoteId === footnote.id }"
      >
        <div class="footnote-header">
          <span class="footnote-number">{{ footnote.number }}</span>
          <button
            class="delete-btn"
            @click="deleteFootnote(footnote.id)"
            title="Delete footnote"
          >
            ×
          </button>
        </div>
        <textarea
          v-model="footnote.text"
          @input="updateFootnote(footnote.id, footnote.text)"
          class="footnote-text"
          rows="3"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Editor } from '@tiptap/vue-3'

const props = defineProps<{
  editor: Editor
}>()

const activeFootnoteId = ref<string | null>(null)

const footnotes = computed(() => {
  const notes: Array<{ id: string; number: number; text: string }> = []

  props.editor.state.doc.descendants((node) => {
    if (node.type.name === 'footnote') {
      notes.push({
        id: node.attrs.id,
        number: node.attrs.number,
        text: node.attrs.text,
      })
    }
  })

  return notes.sort((a, b) => a.number - b.number)
})

function updateFootnote(id: string, text: string) {
  props.editor.commands.updateFootnote(id, text)
}

function deleteFootnote(id: string) {
  const { state, view } = props.editor
  const { tr } = state

  state.doc.descendants((node, pos) => {
    if (node.type.name === 'footnote' && node.attrs.id === id) {
      tr.delete(pos, pos + node.nodeSize)
    }
  })

  view.dispatch(tr)
}

// Listen for show-footnote events from marker clicks
props.editor.on('show-footnote', (id: string) => {
  activeFootnoteId.value = id
  // Scroll to footnote in panel
  setTimeout(() => {
    const element = document.querySelector(`[data-footnote-id="${id}"]`)
    element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, 100)
})
</script>

<style scoped>
.footnote-panel {
  padding: 16px;
  background: #f9fafb;
  border-left: 1px solid #e5e7eb;
  height: 100%;
  overflow-y: auto;
}

.footnote-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footnote-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  transition: all 0.2s;
}

.footnote-item.active {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.footnote-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.footnote-number {
  font-weight: 600;
  color: #2563eb;
}

.delete-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  line-height: 1;
}

.delete-btn:hover {
  color: #ef4444;
}

.footnote-text {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 8px;
  font-size: 14px;
  resize: vertical;
}

.empty-state {
  text-align: center;
  color: #9ca3af;
  padding: 32px;
}
</style>
```

---

### 4.10 Integration with Editor

The footnote extension integrates with the main editor in EditorView:

**Example usage in EditorView.vue:**
```vue
<template>
  <div class="editor-container">
    <div class="editor-main">
      <EditorContent :editor="editor" />
    </div>

    <!-- Footnote panel on the right -->
    <div class="editor-sidebar">
      <FootnotePanel :editor="editor" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { FootnoteNode } from '@/extensions/nodes/FootnoteNode'
import FootnotePanel from '@/components/FootnotePanel.vue'

const editor = useEditor({
  extensions: [
    StarterKit,
    FootnoteNode,
    // ... other extensions
  ],
  content: '<p>Document content</p>',
})
</script>
```

**Export to DOCX (Runbook 5 integration):**

When exporting to DOCX, transform footnote nodes to Word footnotes:

```python
# services/export-service/app/exporters/docx_exporter.py

from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def add_footnote_to_paragraph(paragraph, footnote_text: str, footnote_number: int):
    """Add Word footnote to paragraph"""

    # Create footnote reference (superscript number)
    run = paragraph.add_run()
    run.font.superscript = True
    run.text = str(footnote_number)

    # Create footnote element
    footnote_ref = OxmlElement('w:footnoteReference')
    footnote_ref.set(qn('w:id'), str(footnote_number))
    run._element.append(footnote_ref)

    # Add footnote text to document footnotes
    # (Word manages footnotes separately)
    document.footnotes.add_footnote(footnote_text, footnote_number)
```

**Import from DOCX (Runbook 4 integration):**

When importing from DOCX, parse Word footnotes to footnote nodes:

```python
# services/ingestion-service/app/parsers/docx_parser.py

def extract_footnotes(paragraph) -> list[dict]:
    """Extract footnotes from Word paragraph"""
    footnotes = []

    for run in paragraph.runs:
        # Check if run contains footnote reference
        footnote_refs = run._element.findall('.//w:footnoteReference', namespaces)

        for ref in footnote_refs:
            footnote_id = ref.get(qn('w:id'))
            footnote_text = get_footnote_text(document, footnote_id)

            footnotes.append({
                'id': f'footnote_{footnote_id}',
                'number': len(footnotes) + 1,
                'text': footnote_text
            })

    return footnotes
```

**Testing checklist:**
- [ ] Insert footnote (marker appears with number)
- [ ] Hover over marker (tooltip shows footnote text)
- [ ] Click marker (scrolls to footnote in sidebar)
- [ ] Edit footnote text in sidebar (marker updates)
- [ ] Delete footnote (marker removed)
- [ ] Multiple footnotes (numbered correctly)
- [ ] Export to DOCX (becomes Word footnotes)
- [ ] Import from DOCX (Word footnotes become nodes)

**Time:** 4-6 hours (node + component + panel + export/import + testing)

---

### 4.11 Main Editor Composable

**File:** `desktop/renderer/src/composables/useEditor.ts`

**Action:** CREATE

**Purpose:** Composable for Tiptap editor setup with custom extensions

**Content:**
```typescript
import { useEditor as useTiptapEditor } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';

import { CitationNode } from '@/extensions/nodes/CitationNode';
import { VariableNode } from '@/extensions/nodes/VariableNode';
import { CrossReferenceNode } from '@/extensions/nodes/CrossReferenceNode';

/**
 * Editor Setup Composable
 * 
 * Reference: Runbook 0 Section 7.1
 * 
 * Configures Tiptap with all required extensions:
 * - StarterKit (basic formatting)
 * - Tables
 * - Images, Links
 * - Custom nodes (Citation, Variable, CrossReference)
 */
export function useEditor(options: {
  content?: string;
  onUpdate?: (content: string) => void;
  editable?: boolean;
}) {
  const editor = useTiptapEditor({
    extensions: [
      StarterKit.configure({
        // Disable default paragraph handling (we'll use custom)
        paragraph: {
          HTMLAttributes: {
            class: 'editor-paragraph'
          }
        },
        heading: {
          levels: [1, 2, 3, 4, 5],
          HTMLAttributes: {
            class: 'editor-heading'
          }
        }
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'editor-table'
        }
      }),
      TableRow,
      TableCell,
      TableHeader,
      Image.configure({
        HTMLAttributes: {
          class: 'editor-image'
        }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true
      }),
      // Custom nodes
      CitationNode,
      VariableNode,
      CrossReferenceNode
    ],
    content: options.content || '',
    editable: options.editable ?? true,
    onUpdate: ({ editor }) => {
      if (options.onUpdate) {
        const html = editor.getHTML();
        options.onUpdate(html);
      }
    },
    editorProps: {
      attributes: {
        class: 'factsway-editor prose prose-sm max-w-none focus:outline-none'
      }
    }
  });

  return editor;
}
```

---

## Task 5: Core UI Components

### 5.1 Button Component

**File:** `desktop/renderer/src/components/common/BaseButton.vue`

**Action:** CREATE

**Reference:** Runbook 0 Section 20.4.1 (Button Specifications)

**Content:**
```vue
<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="type"
    @click="handleClick"
  >
    <span v-if="loading" class="button-spinner"></span>
    <slot v-if="!loading" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button'
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const buttonClasses = computed(() => {
  return [
    'base-button',
    `button-${props.variant}`,
    `button-${props.size}`,
    {
      'button-disabled': props.disabled || props.loading,
      'button-loading': props.loading
    }
  ];
});

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
}
</script>

<style scoped>
/* Base button styles - Reference: Section 20.4.1 */
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: var(--font-ui);
  font-weight: 500;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid transparent;
  white-space: nowrap;
}

.base-button:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* Sizes */
.button-sm {
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-sm);
  height: 32px;
}

.button-md {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-base);
  height: 40px;
}

.button-lg {
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-lg);
  height: 48px;
}

/* Variants */
.button-primary {
  background: var(--accent-primary);
  color: white;
}

.button-primary:hover:not(.button-disabled) {
  background: var(--accent-primary-hover);
}

.button-secondary {
  background: white;
  color: var(--text-primary);
  border-color: var(--border-strong);
}

.button-secondary:hover:not(.button-disabled) {
  background: var(--bg-subtle);
}

.button-ghost {
  background: transparent;
  color: var(--text-secondary);
}

.button-ghost:hover:not(.button-disabled) {
  background: var(--bg-subtle);
  color: var(--text-primary);
}

.button-danger {
  background: var(--danger);
  color: white;
}

.button-danger:hover:not(.button-disabled) {
  background: var(--danger-hover);
}

/* States */
.button-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-loading {
  cursor: wait;
}

.button-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
```

---

### 5.2 Card Component

**File:** `desktop/renderer/src/components/common/BaseCard.vue`

**Action:** CREATE

**Reference:** Runbook 0 Section 20.4.2 (Card Specifications)

**Content:**
```vue
<template>
  <div :class="cardClasses" @click="handleClick">
    <div v-if="$slots.header" class="card-header">
      <slot name="header" />
    </div>
    <div class="card-body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'default' | 'elevated' | 'bordered';
  clickable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  clickable: false,
  padding: 'md'
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const cardClasses = computed(() => {
  return [
    'base-card',
    `card-${props.variant}`,
    `card-padding-${props.padding}`,
    {
      'card-clickable': props.clickable
    }
  ];
});

function handleClick(event: MouseEvent) {
  if (props.clickable) {
    emit('click', event);
  }
}
</script>

<style scoped>
/* Base card styles - Reference: Section 20.4.2 */
.base-card {
  background: var(--surface-paper);
  border-radius: var(--radius-lg);
  transition: all 0.2s ease;
}

.card-default {
  box-shadow: var(--shadow-sm);
}

.card-elevated {
  box-shadow: var(--shadow-md);
}

.card-bordered {
  border: 1px solid var(--border-subtle);
}

.card-clickable {
  cursor: pointer;
}

.card-clickable:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

/* Padding variants */
.card-padding-none {
  padding: 0;
}

.card-padding-sm .card-body {
  padding: var(--space-3);
}

.card-padding-md .card-body {
  padding: var(--space-4);
}

.card-padding-lg .card-body {
  padding: var(--space-6);
}

.card-header {
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
  font-weight: 600;
  color: var(--text-primary);
}

.card-footer {
  padding: var(--space-4);
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-subtle);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}
</style>
```

---

### 5.3 Modal Component

**File:** `desktop/renderer/src/components/common/BaseModal.vue`

**Action:** CREATE

**Reference:** Runbook 0 Section 20.4.5 (Modal Panel Specs)

**Content:**
```vue
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="handleClose">
        <div :class="modalClasses" role="dialog" aria-modal="true">
          <!-- Header -->
          <div class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
            <button
              class="modal-close"
              type="button"
              aria-label="Close"
              @click="handleClose"
            >
              ×
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <slot />
          </div>

          <!-- Footer (optional) -->
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';

interface Props {
  modelValue: boolean;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlay?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closeOnOverlay: true
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const modalClasses = computed(() => {
  return ['modal-content', `modal-${props.size}`];
});

function handleClose() {
  if (props.closeOnOverlay) {
    emit('update:modelValue', false);
  }
}

// Prevent body scroll when modal is open
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});
</script>

<style scoped>
/* Modal styles - Reference: Section 20.4.5 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--space-4);
}

.modal-content {
  background: var(--surface-paper);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* Sizes */
.modal-sm {
  max-width: 400px;
}

.modal-md {
  max-width: 600px;
}

.modal-lg {
  max-width: 800px;
}

.modal-xl {
  max-width: 1200px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--border-subtle);
}

.modal-title {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--text-primary);
}

.modal-close {
  background: none;
  border: none;
  font-size: 32px;
  line-height: 1;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--bg-subtle);
  color: var(--text-primary);
}

.modal-body {
  padding: var(--space-6);
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--border-subtle);
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
}
</style>
```

---

## Task 6: Main Application Structure

### 6.1 Main Application Entry

**File:** `desktop/renderer/src/main.ts`

**Action:** CREATE

**Content:**
```typescript
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';

// Global styles
import './styles/variables.css';
import './styles/reset.css';
import './styles/global.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
```

---

### 6.2 Root Component

**File:** `desktop/renderer/src/App.vue`

**Action:** CREATE

**Content:**
```vue
<template>
  <div id="app" class="factsway-app">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { ipcService } from '@/services/ipc.service';

// Listen for service status updates
let cleanupServiceListener: (() => void) | null = null;

onMounted(() => {
  cleanupServiceListener = ipcService.on('service:error', (serviceName, error) => {
    console.error(`Service ${serviceName} error:`, error);
    // TODO: Show toast notification
  });
});

onUnmounted(() => {
  if (cleanupServiceListener) {
    cleanupServiceListener();
  }
});
</script>

<style>
/* App container */
.factsway-app {
  width: 100vw;
  height: 100vh;
  background: var(--bg-desk);
  color: var(--text-primary);
  font-family: var(--font-ui);
  overflow: hidden;
}
</style>
```

---

### 6.3 Router Configuration

**File:** `desktop/renderer/src/router/index.ts`

**Action:** CREATE

**Content:**
```typescript
import { createRouter, createWebHashHistory } from 'vue-router';

/**
 * Router Configuration
 * 
 * Reference: Runbook 0 Section 12.1 (Navigation Architecture)
 * 
 * Uses hash mode for Electron (file:// protocol)
 * Routes match flat navigation structure (Cases | Templates | Vault)
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/cases'
    },
    {
      path: '/cases',
      name: 'Cases',
      component: () => import('@/views/CasesView.vue')
    },
    {
      path: '/cases/:id',
      name: 'CaseDetail',
      component: () => import('@/views/CaseDetailView.vue')
    },
    {
      path: '/cases/:caseId/drafts/:draftId',
      name: 'DraftEditor',
      component: () => import('@/views/DraftEditorView.vue')
    },
    {
      path: '/templates',
      name: 'Templates',
      component: () => import('@/views/TemplatesView.vue')
    },
    {
      path: '/templates/:id',
      name: 'TemplateDetail',
      component: () => import('@/views/TemplateDetailView.vue')
    },
    {
      path: '/vault',
      name: 'Vault',
      component: () => import('@/views/VaultView.vue')
    }
  ]
});

export default router;
```

---

### 6.4 Global CSS Variables

**File:** `desktop/renderer/src/styles/variables.css`

**Action:** CREATE

**Reference:** Runbook 0 Section 20.1-20.3 (Design Tokens)

**Content:**
```css
/**
 * Design Tokens
 * Reference: Runbook 0 Section 20.1-20.3
 */

:root {
  /* Colors - Desk & Paper */
  --bg-desk: #f0f0eb;
  --surface-paper: #ffffff;
  --bg-subtle: #f9f9f8;

  /* Text Colors */
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --text-tertiary: #999999;

  /* Accents */
  --accent-primary: #c2410c;
  --accent-primary-hover: #9a3412;
  --accent-link: #3b82f6;
  --accent-link-bg: #eff6ff;
  --accent-purple: #9333ea;
  --accent-purple-bg: #faf5ff;

  /* Semantic Colors */
  --success: #16a34a;
  --success-bg: #f0fdf4;
  --warning: #f59e0b;
  --warning-bg: #fffbeb;
  --danger: #dc2626;
  --danger-bg: #fef2f2;
  --danger-hover: #b91c1c;

  /* Borders */
  --border-subtle: #e5e5e5;
  --border-strong: #d4d4d4;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);

  /* Spacing (4px base unit) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Typography */
  --font-heading: 'Source Serif Pro', serif;
  --font-ui: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Font Sizes */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */

  /* Z-index layers */
  --z-base: 1;
  --z-dropdown: 1000;
  --z-modal: 2000;
  --z-toast: 3000;
  --z-tooltip: 4000;
}
```

---

### 6.5 CSS Reset

**File:** `desktop/renderer/src/styles/reset.css`

**Action:** CREATE

**Content:**
```css
/**
 * CSS Reset
 */

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  width: 100%;
  height: 100%;
}

body {
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

img,
picture,
video,
canvas,
svg {
  display: block;
  max-width: 100%;
}

input,
button,
textarea,
select {
  font: inherit;
}

p,
h1,
h2,
h3,
h4,
h5,
h6 {
  overflow-wrap: break-word;
}

#app {
  isolation: isolate;
}
```

---

### 6.6 Global Styles

**File:** `desktop/renderer/src/styles/global.css`

**Action:** CREATE

**Content:**
```css
/**
 * Global Utility Classes
 */

/* Layout utilities */
.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-2 {
  gap: var(--space-2);
}

.gap-4 {
  gap: var(--space-4);
}

/* Text utilities */
.text-sm {
  font-size: var(--text-sm);
}

.text-base {
  font-size: var(--text-base);
}

.text-lg {
  font-size: var(--text-lg);
}

.font-semibold {
  font-weight: 600;
}

/* Spacing utilities */
.p-4 {
  padding: var(--space-4);
}

.p-6 {
  padding: var(--space-6);
}

.mt-4 {
  margin-top: var(--space-4);
}

.mb-4 {
  margin-bottom: var(--space-4);
}

/* Editor styles */
.factsway-editor {
  font-family: 'Times New Roman', serif;
  font-size: 12pt;
  line-height: 1.5;
  color: var(--text-primary);
}

.editor-paragraph {
  margin-bottom: 0.5em;
}

.editor-heading {
  font-weight: bold;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.editor-table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.editor-table td,
.editor-table th {
  border: 1px solid var(--border-strong);
  padding: 0.5em;
}

.editor-link {
  color: var(--accent-link);
  text-decoration: underline;
}

.editor-image {
  max-width: 100%;
  height: auto;
  margin: 1em 0;
}
```

---

## Task 7: Example View Implementation

### 7.1 Cases View

**File:** `desktop/renderer/src/views/CasesView.vue`

**Action:** CREATE

**Reference:** Runbook 0 Section 20.7.1 (Cases View Specification)

**Content:**
```vue
<template>
  <div class="cases-view">
    <!-- Header -->
    <div class="view-header">
      <h1 class="view-title">Cases</h1>
      <BaseButton variant="primary" @click="showCreateModal = true">
        + New Case
      </BaseButton>
    </div>

    <!-- Loading State -->
    <div v-if="casesStore.loading" class="view-loading">
      Loading cases...
    </div>

    <!-- Error State -->
    <div v-else-if="casesStore.error" class="view-error">
      {{ casesStore.error }}
    </div>

    <!-- Cases Grid -->
    <div v-else class="cases-grid">
      <BaseCard
        v-for="caseItem in casesStore.cases"
        :key="caseItem.id"
        variant="elevated"
        clickable
        @click="navigateToCase(caseItem.id)"
      >
        <template #header>
          <div class="case-card-header">
            <h3 class="case-title">{{ caseItem.case_name }}</h3>
            <span class="case-number">{{ caseItem.cause_number }}</span>
          </div>
        </template>

        <div class="case-card-body">
          <div class="case-info-row">
            <span class="info-label">Court:</span>
            <span class="info-value">{{ caseItem.court_name }}</span>
          </div>
          <div class="case-info-row">
            <span class="info-label">Last Updated:</span>
            <span class="info-value">{{ formatDate(caseItem.updated_at) }}</span>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Create Case Modal -->
    <BaseModal
      v-model="showCreateModal"
      title="Create New Case"
      size="md"
    >
      <form @submit.prevent="handleCreateCase">
        <!-- Form fields would go here -->
        <p>Case creation form (to be implemented)</p>
      </form>

      <template #footer>
        <BaseButton variant="ghost" @click="showCreateModal = false">
          Cancel
        </BaseButton>
        <BaseButton variant="primary" type="submit">
          Create Case
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCasesStore } from '@/stores/cases.store';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseCard from '@/components/common/BaseCard.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import { format } from 'date-fns';

const router = useRouter();
const casesStore = useCasesStore();
const showCreateModal = ref(false);

onMounted(async () => {
  await casesStore.loadCases();
});

function navigateToCase(caseId: string) {
  router.push({ name: 'CaseDetail', params: { id: caseId } });
}

function formatDate(dateString: string) {
  return format(new Date(dateString), 'MMM d, yyyy');
}

function handleCreateCase() {
  // TODO: Implement case creation
  showCreateModal.value = false;
}
</script>

<style scoped>
.cases-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-desk);
}

.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6);
  background: var(--surface-paper);
  border-bottom: 1px solid var(--border-subtle);
}

.view-title {
  font-family: var(--font-heading);
  font-size: var(--text-3xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.view-loading,
.view-error {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-lg);
  color: var(--text-secondary);
}

.view-error {
  color: var(--danger);
}

.cases-grid {
  flex: 1;
  padding: var(--space-6);
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-4);
  align-content: start;
  overflow-y: auto;
}

.case-card-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.case-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.case-number {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-family: var(--font-mono);
}

.case-card-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.case-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-sm);
}

.info-label {
  color: var(--text-tertiary);
}

.info-value {
  color: var(--text-primary);
  font-weight: 500;
}
</style>
```

---

## Task 8: HTML Entry Point

### 8.1 Index HTML

**File:** `desktop/renderer/index.html`

**Action:** CREATE

**Content:**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/icons/factsway-icon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FACTSWAY</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+Pro:wght@400;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

---

## Verification

**From Runbook 0 Section 19.8:**

### Verification Checklist

**Build & Startup:**
- [ ] `npm install` completes without errors in `desktop/renderer/`
- [ ] `npm run dev` starts Vite dev server
- [ ] Vite compiles successfully
- [ ] Browser loads at `http://localhost:5173` (dev mode)
- [ ] Electron window opens when launched via Main process

**Router:**
- [ ] Navigate to `/cases` - Cases view renders
- [ ] Navigate to `/templates` - Templates view renders  
- [ ] Navigate to `/vault` - Vault view renders
- [ ] Browser back/forward buttons work

**State Management:**
- [ ] Templates store loads data via IPC
- [ ] Cases store loads data via IPC
- [ ] Drafts store loads data via IPC
- [ ] Loading states display correctly
- [ ] Error states display correctly

**Tiptap Editor:**
- [ ] Editor initializes without errors
- [ ] Basic formatting works (bold, italic, headings)
- [ ] Tables can be inserted
- [ ] Images can be inserted
- [ ] Links can be created
- [ ] Citation nodes render as blue chips
- [ ] Variable nodes render as amber chips
- [ ] CrossReference nodes render as purple chips

**IPC Communication:**
- [ ] `ipcService.invoke('templates:list')` returns data
- [ ] `ipcService.invoke('cases:list')` returns data
- [ ] File select dialog opens via IPC
- [ ] Service health check returns status

**Components:**
- [ ] BaseButton renders all variants (primary, secondary, ghost, danger)
- [ ] BaseCard renders with header/body/footer slots
- [ ] BaseModal opens/closes correctly
- [ ] Modal closes on overlay click
- [ ] Modal prevents body scroll when open

**Styling:**
- [ ] Design tokens loaded correctly
- [ ] Colors match Section 20.3 specifications
- [ ] Typography uses correct font families
- [ ] Spacing system applied consistently
- [ ] Components match Design System specs

**Production Build:**
- [ ] `npm run build` completes successfully
- [ ] Dist folder contains compiled files
- [ ] Electron can load production build
- [ ] No console errors in production

---

## Task 9: Document Clerks in Feature Registry

### Why Document in Feature Registry?

As you build each of the 8 clerk Vue components, you must also document them in the Feature Registry. This serves multiple purposes:

1. **LLM workspace configuration** - LLM knows what each clerk can do and how to configure it
2. **User help system** - Users can ask "what can X clerk do?" and get accurate answers
3. **Privacy transparency** - Clear documentation of what data each clerk accesses
4. **Testing** - Tests can be generated from clerk capabilities
5. **Architecture discipline** - Forces you to clearly define each clerk's purpose

**This is required, not optional.** The clerk cannot be used by the LLM without its definition.

**Template:** `packages/shared-types/src/registry/clerks/facts-clerk.definition.ts` (created in Runbook 1)

---

### 9.1 Clerks to Document

As you implement each clerk component, create its Feature Registry definition:

1. ✅ **FactsClerk.vue** → Already done in Runbook 1
2. ⚠️ **ExhibitsClerk.vue** → Create `exhibits-clerk.definition.ts`
3. ⚠️ **DiscoveryClerk.vue** → Create `discovery-clerk.definition.ts`
4. ⚠️ **CaseblockClerk.vue** → Create `caseblock-clerk.definition.ts`
5. ⚠️ **SignatureClerk.vue** → Create `signature-clerk.definition.ts`
6. ⚠️ **EditorClerk.vue** → Create `editor-clerk.definition.ts`
7. ⚠️ **CommunicationClerk.vue** → Create `communication-clerk.definition.ts`
8. ⚠️ **AnalysisClerk.vue** → Create `analysis-clerk.definition.ts`

---

### 9.2 What to Document (Per Clerk)

**For each clerk, create a complete ClerkDefinition:**

```typescript
// Example: exhibits-clerk.definition.ts

import { ClerkDefinition } from '../clerk-definition.interface'

export const EXHIBITS_CLERK: ClerkDefinition = {
  // Identity
  id: 'exhibits-clerk',
  name: 'Exhibits Clerk',
  description: 'Manages evidence attachments, extracts metadata, and links exhibits to facts and citations',
  version: '1.0.0',

  // Capabilities - List everything this clerk can do
  capabilities: [
    'Upload and organize exhibit files (PDF, images, documents)',
    'Extract metadata from attachments (file size, type, creation date)',
    'Link exhibits to facts and citations in motions',
    'Generate exhibit lists for court filings',
    'Preview attachments in-app',
    'Manage exhibit numbering (Exhibit A, B, C, etc.)',
    'Track exhibit sources and chain of custody',
    'Export exhibits with motion as bundle'
  ],

  // Inputs - What data does this clerk need?
  inputs: [
    {
      name: 'caseId',
      type: 'ULID',
      required: true,
      description: 'Case identifier to associate exhibits with'
    },
    {
      name: 'files',
      type: 'File[]',
      required: false,
      description: 'Files to upload as exhibits'
    }
  ],

  // Outputs - What data does this clerk produce?
  outputs: [
    {
      name: 'exhibits',
      type: 'Exhibit[]',
      description: 'List of exhibits with metadata'
    },
    {
      name: 'exhibitLinks',
      type: 'ExhibitLink[]',
      description: 'Links between exhibits and facts/citations'
    }
  ],

  // Privacy - What data does this clerk access/store?
  privacy: {
    dataAccessed: [
      'Uploaded exhibit files',
      'Exhibit metadata',
      'Case documents for linking'
    ],
    dataStored: [
      'Exhibit files in local vault',
      'Exhibit metadata (filename, size, type)',
      'Links to facts and citations'
    ],
    externalAPIs: [
      'None - all processing local'
    ],
    clerkGuardChannel: 'exhibits:manage'
  },

  // Constraints - What does this clerk require?
  constraints: {
    requiresCase: true,
    requiresDocument: false,
    requiresInternet: false,
    minimumData: ['At least one case created']
  },

  // UI Modes - How can this clerk be displayed?
  uiModes: {
    'list': {
      description: 'Shows all exhibits as searchable list with thumbnails',
      layout: 'sidebar',
      minSize: { width: 300, height: 400 },
      preferredSize: { width: 400, height: 600 }
    },
    'upload': {
      description: 'File upload interface with drag-and-drop',
      layout: 'modal',
      minSize: { width: 500, height: 400 }
    },
    'preview': {
      description: 'Full preview of exhibit file',
      layout: 'main',
      minSize: { width: 600, height: 500 }
    },
    'linking': {
      description: 'Interface for linking exhibits to facts',
      layout: 'bottom',
      minSize: { width: 800, height: 250 }
    }
  },
  defaultMode: 'list',

  // LLM Training Examples - How should LLM configure this clerk?
  examples: [
    {
      userIntent: 'Upload exhibits for Cruz case',
      configuration: {
        mode: 'upload',
        caseId: 'cruz-v-js7'
      },
      expectedOutcome: 'Opens upload modal for Cruz case'
    },
    {
      userIntent: 'Show me all exhibits',
      configuration: {
        mode: 'list',
        sortBy: 'name'
      },
      expectedOutcome: 'Opens exhibit list view'
    },
    {
      userIntent: 'Link Exhibit A to this fact',
      configuration: {
        mode: 'linking',
        selectedFact: 'fact_xyz'
      },
      expectedOutcome: 'Opens linking interface with fact pre-selected'
    }
  ],

  // Metadata
  tags: ['exhibits', 'evidence', 'attachments', 'files'],
  category: 'document-processing'
}
```

---

### 9.3 Add to Registry

After creating each clerk definition, add it to the registry:

**File:** `packages/shared-types/src/registry/index.ts`

```typescript
import { FACTS_CLERK } from './clerks/facts-clerk.definition'
import { EXHIBITS_CLERK } from './clerks/exhibits-clerk.definition'
// ... import others as you create them

export const CLERK_REGISTRY: ClerkRegistry = {
  'facts-clerk': FACTS_CLERK,
  'exhibits-clerk': EXHIBITS_CLERK,  // ← ADD
  // ... add others
}
```

---

### 9.4 Benefits of Documenting As You Build

**Immediate benefits:**
- Forces clear thinking about clerk's purpose
- Documents data contracts (inputs/outputs)
- Clarifies privacy boundaries
- Defines UI modes before building them

**Future benefits:**
- LLM can configure any documented clerk
- Users can discover features via LLM
- Tests can be generated from capabilities
- API can be generated from definitions

**This is "self-documenting architecture":**
- Documentation IS the system
- Can't skip it (LLM needs it)
- Never goes stale (required for functionality)

---

### 9.5 Documentation Checklist (Per Clerk)

When you finish implementing a clerk, verify its definition has:

- [ ] Complete capabilities list (5+ items)
- [ ] All inputs documented with types
- [ ] All outputs documented with types
- [ ] Privacy section filled out (data accessed/stored)
- [ ] At least 3 UI modes defined
- [ ] At least 3 LLM training examples
- [ ] Links to ClerkGuard channel (if applicable)
- [ ] Added to CLERK_REGISTRY in index.ts

---

### 9.6 Time Allocation

**Per clerk:** ~1 hour documentation

- Read Facts Clerk template: 5 min
- List capabilities: 10 min
- Define inputs/outputs: 10 min
- Document privacy: 5 min
- Define UI modes: 15 min
- Create LLM examples: 10 min
- Add to registry: 5 min

**Total for 7 clerks:** ~7 hours (Facts already done in Runbook 1 = 8 total)

**This time is included in the 27-33 hour estimate.**

---

### 9.7 Relationship to ClerkGuard (Backend)

Your Feature Registry definitions should align with ClerkGuard channel definitions (Runbook 6).

**Example alignment:**

**Frontend (Feature Registry):**
```typescript
{
  id: 'exhibits-clerk',
  inputs: [{ name: 'caseId', type: 'ULID' }],
  outputs: [{ name: 'exhibits', type: 'Exhibit[]' }],
  privacy: { clerkGuardChannel: 'exhibits:manage' }
}
```

**Backend (ClerkGuard):**
```typescript
{
  channel: 'exhibits:manage',
  resourceType: 'exhibit',
  pathHierarchy: '/cases/:caseId/exhibits',
  inputValidation: { caseId: 'ULID' },
  outputSchema: { exhibits: 'Exhibit[]' }
}
```

**Same data contract, different layers.** This ensures frontend and backend stay aligned.

**Time:** 7-8 hours total (1 hour × 8 clerks, Facts already done in Runbook 1)

---

## Success Criteria

✅ All verification checks pass
✅ Renderer displays in Electron window
✅ All 3 main views (Cases, Templates, Vault) accessible
✅ Tiptap editor functional with custom nodes
✅ IPC communication working bidirectionally
✅ No TypeScript compilation errors
✅ No runtime errors in console
✅ Design System styles applied correctly

---

## Next Steps

After Runbook 8 completes:

1. **Runbook 9:** Service Discovery & Configuration
   - Environment-based service URL injection
   - Health check aggregation
   - Configuration validation

2. **Runbook 10:** Desktop Packaging
   - Electron Builder configuration
   - Service binary bundling
   - Platform-specific builds (Windows, macOS, Linux)
   - Auto-update configuration

3. **Runbook 11-15:** Testing, polish, and final integration

---

## Reference

**Runbook 0 Sections:**
- Section 1.7.1: Desktop Deployment Architecture
- Section 7: Body Editor Specification (Tiptap)
- Section 12: UI/UX Specifications
- Section 20: Design System (complete)
- Section 22.2: Desktop Deployment Details

**Dependencies:**
- Runbook 1: LegalDocument schema types
- Runbook 7: Desktop orchestrator IPC handlers
- Runbooks 3-6: Backend services (ports 3001-3008)

---

**End of Runbook 8**
