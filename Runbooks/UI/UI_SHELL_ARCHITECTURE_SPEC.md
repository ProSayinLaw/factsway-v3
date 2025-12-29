# UI Shell Architecture Specification

**Purpose:** Supplement to Runbook 8 - Defines the clerk panel system, navigation, and chatbox architecture based on approved mockups.

**Status:** Approved (2024-12-28), Updated with case isolation requirements

---

## 1. Top-Level Navigation Tabs (Case Isolation by Design)

### ⚠️ CRITICAL SECURITY REQUIREMENT

> **Cases must be isolated by design.** There can be NO ability to cross information from one case to another. Crossing case data/vault paths must be **IMPOSSIBLE by design**, not just discouraged.

### Tab Architecture (Browser-Style)

```
┌─────────┬─────────────┬─────────────┬─────────────┬───┐
│  Home   │ Cruz v. JS7 │ Smith Case  │ Jones Case  │ + │
└─────────┴─────────────┴─────────────┴─────────────┴───┘
    │           │             │             │
    │           │             │             └── Separate isolated context
    │           │             └── Separate isolated context  
    │           └── Separate isolated context
    └── Account view (NOT a case context)
```

### Tab Types

| Tab | Route | Isolation Level | What Shows |
|-----|-------|-----------------|------------|
| **Home** | `/` | N/A (no case context) | Account view, all cases list, to-dos, alerts |
| **Case Tab** | `/case/:caseId/*` | **FULLY ISOLATED** | Only that case's data |

### Case Tab Behavior
- **Multiple cases can be open** simultaneously (like browser tabs)
- **Each case tab is persistent** - maintains state until explicitly closed
- **Close button (×)** on each case tab
- **New case opens new tab** - never replaces existing tab
- **Tab shows case short name** - e.g., "Cruz v. JS7"

### ISOLATION ENFORCEMENT (Architectural)

```typescript
// Every case tab operates in a COMPLETELY SEPARATE context
interface CaseTabContext {
  caseId: string;
  
  // Each case tab has its OWN stores (not shared)
  caseDrafts: Draft[];      // Only THIS case's drafts
  caseEvidence: Evidence[]; // Only THIS case's evidence  
  caseVault: Document[];    // Only THIS case's vault
  caseFacts: Fact[];        // Only THIS case's facts
  
  // NO references to other cases possible
}
```

### Store Isolation Pattern

```typescript
// WRONG: Single global store (allows cross-contamination)
const globalDraftsStore = defineStore('drafts', ...);

// CORRECT: Per-case-tab isolated stores
function createCaseTabStores(caseId: string) {
  return {
    drafts: defineStore(`drafts-${caseId}`, ...),
    evidence: defineStore(`evidence-${caseId}`, ...),
    vault: defineStore(`vault-${caseId}`, ...),
    facts: defineStore(`facts-${caseId}`, ...),
  };
}
```

### IPC Isolation

```typescript
// Every IPC call MUST include caseId - never implicit
'drafts:list': (caseId: string) => Promise<Draft[]>;
'evidence:list': (caseId: string) => Promise<Evidence[]>;
'vault:list': (caseId: string) => Promise<Document[]>;

// Backend NEVER returns data for a different case
// Backend validates caseId on EVERY request
```

### UI Enforcement
- **No drag-drop between case tabs** - prevent accidental evidence transfer
- **No copy-paste of evidence references** between cases
- **Case name always visible** in tab to prevent confusion
- **Different accent color per case tab** (optional visual distinction)

---

## 2. Clerk Panel State Machine

### States
```typescript
type ClerkPanelState = 'collapsed' | 'expanded' | 'split' | 'float';
```

### Transitions
```
         ┌──────────────┐
         │  collapsed   │◄──── click chevron
         └──────┬───────┘
                │ click tab
                ▼
         ┌──────────────┐
         │   expanded   │◄──── default for active clerks
         └──────┬───────┘
         ┌──────┴──────┐
   click │             │ click
   split │             │ float
         ▼             ▼
┌──────────────┐  ┌──────────────┐
│    split     │  │    float     │ (Desktop + Web)
└──────────────┘  └──────────────┘
```

### Float Implementation
- **Desktop:** Uses Electron `BrowserWindow` for true multi-window
- **Web:** Uses CSS `position: fixed` overlay (looks like float, same behavior)
- **Behavior identical** across platforms

### Split View Configuration
- **Start simple:** Right-side only (configurable in future)
- **Multiple splits:** Planned for v2 to avoid initial complexity/bugs
- **User can configure split position** via drag handle

### Pinia Store
**File:** `stores/clerk.store.ts`

```typescript
interface ClerkStore {
  // Active clerks in sidebar
  activeClerkIds: string[];
  
  // State per clerk
  clerkStates: Record<string, ClerkPanelState>;
  
  // Visual ordering
  clerkOrder: string[];
  
  // Split view (right side, one at a time for v1)
  splitClerkId: string | null;
  splitPosition: number; // Percentage width, default 50%
  
  // Float windows (desktop + web)
  floatClerkIds: string[];
}
```

### Actions
```typescript
toggleClerk(id: string): void        // Collapse ↔ Expanded
setClerkState(id: string, state: ClerkPanelState): void
reorderClerks(newOrder: string[]): void
openSplit(id: string): void          // Close any existing split
closeSplit(): void
floatClerk(id: string): void         // Desktop only
unfloatClerk(id: string): void
```

---

## 3. Hybrid Chatbox

### State
```typescript
interface ChatboxState {
  mode: 'global' | 'docked';
  dockedToClerkId?: string;
  isExpanded: boolean;
}
```

### Behavior
1. **Default:** Global at bottom-right (position: fixed)
2. **Dock trigger:** User asks clerk-specific question → chatbox animates to clerk panel
3. **Undock:** User clicks undock button or asks general question
4. **Animation:** 300ms slide transition

### Component
**File:** `components/common/GlobalChatbox.vue`

```vue
<template>
  <div :class="['chatbox', mode, { expanded: isExpanded }]">
    <ChatHeader @toggle="toggle" @undock="undock" />
    <ChatMessages :messages="messages" />
    <ChatInput @send="send" />
  </div>
</template>
```

---

## 4. Clerk Sidebar Component

**File:** `components/clerks/ClerkSidebar.vue`

### Structure
```vue
<template>
  <aside class="clerk-sidebar">
    <div class="sidebar-header">ACTIVE CLERKS</div>
    
    <!-- Expanded Panels -->
    <template v-for="clerkId in expandedClerks" :key="clerkId">
      <ClerkPanel 
        :clerk-id="clerkId" 
        :state="clerkStates[clerkId]"
        @state-change="handleStateChange"
      />
    </template>
    
    <!-- Collapsed Tabs -->
    <template v-for="clerkId in collapsedClerks" :key="clerkId">
      <ClerkTab 
        :clerk-id="clerkId"
        :badge-count="badgeCounts[clerkId]"
        @click="expandClerk(clerkId)"
      />
    </template>
  </aside>
</template>
```

### ClerkPanel Props
```typescript
interface ClerkPanelProps {
  clerkId: string;
  state: ClerkPanelState;
}
```

### Dynamic Component Loading
```vue
<component 
  :is="getClerkComponent(clerkId)" 
  v-bind="clerkProps[clerkId]"
/>
```

---

## 5. Margin Cards (Document Annotations)

### Types
```typescript
interface MarginCard {
  id: string;
  type: 'ai' | 'user';
  paragraphId: string;
  content: string;
  createdAt: Date;
  position: number; // Computed from paragraph position
}
```

### Component
**File:** `components/drafting/MarginCard.vue`

### Styling
- AI cards: Gold border (#f59e0b), cream background (#fffbeb)
- User cards: Blue border (#3b82f6), light blue background (#eff6ff)
- Connector: Dashed line to linked text

---

## 6. LLM Suggestion Banner

### Component
**File:** `components/common/LLMSuggestionBanner.vue`

### Props
```typescript
interface LLMSuggestionBannerProps {
  message: string;
  suggestedClerks: string[];
  onApply: () => void;
  onDismiss: () => void;
}
```

### Styling
- Gold gradient background
- Top of workspace (below nav tabs)
- Dismissable with X button
- "Apply" button configures clerks

---

## 7. Full Clerk List (Production Build)

> **NOT MVP** - This is a full production-grade, full feature set build. ALL clerks must be implemented.

### All 12 Clerks
| Clerk | Service | Tab Feature Registry | Mockup |
|-------|---------|---------------------|--------|
| RecordsClerk | Records 3001 | Required | - |
| CaseBlockClerk | CaseBlock 3004 | Required | ✅ |
| SignatureClerk | Signature 3005 | Required | - |
| ExhibitsClerk | Exhibits 3007 | Required | ✅ |
| CaseLawClerk | Caselaw 3008 | Required | - |
| FactsClerk | Facts 3006 | Required | ✅ |
| PleadingClerk | Records 3001 | Required | - |
| AttachmentsClerk | Records 3001 | Required | - |
| DiscoveryClerk | Template 3006 | Required | ✅ |
| CommunicationClerk | Template 3006 | Required | - |
| ImportClerk | Ingestion 3002 | Required | - |
| ExportClerk | Export 3003 | Required | - |

### Shell Files to Create
| File | Purpose |
|------|----------|
| `stores/clerk.store.ts` | Clerk state management |
| `stores/chatbox.store.ts` | Chatbox state |
| `stores/case-tabs.store.ts` | Case tab isolation |
| `components/clerks/ClerkSidebar.vue` | Sidebar container |
| `components/clerks/ClerkPanel.vue` | Expandable panel |
| `components/clerks/ClerkTab.vue` | Collapsed tab |
| `components/common/GlobalChatbox.vue` | Hybrid chatbox |
| `components/common/LLMSuggestionBanner.vue` | LLM suggestions |
| `components/drafting/MarginCard.vue` | Document annotations |

---

## 8. Integration with Runbook 8

This specification supplements Runbook 8 Task 6 (Component Library) and Task 8 (Views).

### Add to Task 6:
- ClerkSidebar.vue
- ClerkPanel.vue  
- ClerkTab.vue
- GlobalChatbox.vue

### Add to Task 3 (Pinia Stores):
- clerk.store.ts (after cases.store.ts)
- chatbox.store.ts

### Add to DraftingView.vue:
- Import ClerkSidebar
- Use 3-panel layout from mockups
- Include margin cards in editor pane

---

## 9. Verification Checklist

Before Runbook 8 is complete, verify:

- [ ] Clerk sidebar renders with expandable panels
- [ ] Clicking collapsed tab expands clerk
- [ ] Clicking chevron collapses clerk
- [ ] Split view opens secondary pane
- [ ] Chatbox docks when asking clerk-specific question
- [ ] LLM suggestion banner shows on document open
- [ ] Margin cards appear next to linked sentences
- [ ] Clerk states persist across navigation
