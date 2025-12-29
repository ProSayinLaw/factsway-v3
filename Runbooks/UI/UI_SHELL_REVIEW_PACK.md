# FACTSWAY UI Shell Review Pack

**Date:** December 28, 2024
**Purpose:** Complete briefing for UI refinement assistance

---

## 1. Project Context

**FACTSWAY** is a legal document drafting engine. The UI shell is a Vue 3 + Pinia application that will run inside Electron for desktop deployment.

### Philosophy
- **"One-shot" development** - Build it right the first time, no iterative drift
- **Complete specification before code** - All decisions documented upfront
- **Zero interpretation** - Runbooks are so detailed they can be executed mechanically

---

## 2. Architecture Decisions (FINAL)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Navigation** | Browser-style case tabs | Multiple cases open simultaneously, like browser tabs |
| **Case Isolation** | **CRITICAL** - Separate stores per case | NO cross-case data contamination possible |
| **Chatbox** | Hybrid (global + dockable) | Floats bottom-right, docks to clerks when context-specific |
| **Float Windows** | Desktop + Web (web uses fixed overlay) | Same behavior cross-platform |
| **Split View** | Right-side only, configurable | Single split for v1; multi-split in v2 |
| **Scope** | Full production (12 clerks) | Not MVP - complete feature set |

---

## 3. Visual Design System ("Legal Redweld")

### Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-desk` | #f0f0eb | Wooden desk background |
| `--bg-paper` | #ffffff | Document/card surfaces |
| `--bg-header` | #292524 | Dark header bar |
| `--accent-orange` | #c2410c | Active states, primary actions |
| `--accent-gold` | #b45309 | AI insights |
| `--text-ink` | #1f2937 | Primary text |
| `--text-muted` | #6b7280 | Secondary text |
| `--note-ai-bg` | #fffbeb | AI note background |
| `--note-ai-border` | #f59e0b | AI note border |
| `--note-user-bg` | #eff6ff | User note background |
| `--note-user-border` | #3b82f6 | User note border |

### Typography
- **Headings:** Source Serif Pro (700)
- **UI Text:** Inter (400-600)
- **Legal Documents:** Times New Roman (400)
- **Monospace:** JetBrains Mono (400-500)

---

## 4. Current Implementation

### File Structure
```
desktop/renderer/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
└── src/
    ├── main.ts              # Vue app entry
    ├── App.vue              # Root component
    ├── vite-env.d.ts        # TypeScript declarations
    ├── assets/
    │   └── base.css         # Design tokens
    ├── stores/
    │   ├── case-tabs.store.ts   # Case isolation
    │   ├── clerk.store.ts       # Clerk panel states
    │   └── chatbox.store.ts     # Hybrid chatbox
    ├── components/
    │   ├── clerks/
    │   │   ├── ClerkPanel.vue      # Expandable folder panel
    │   │   └── ClerkSidebar.vue    # Sidebar container
    │   └── common/
    │       └── GlobalChatbox.vue   # Floating chat
    └── layouts/
        └── ShellLayout.vue         # Main app shell
```

### Running the Dev Server
```bash
cd desktop/renderer
npm install    # First time only
npm run dev    # Opens http://localhost:5173/
```

---

## 5. Component Specifications

### ShellLayout.vue
- Dark header with brand logo
- Browser-style tabs (Home + case tabs)
- 3-panel layout: Sidebar | Editor | Assets (planned)
- Global chatbox overlay

### ClerkSidebar.vue
- Contains all ClerkPanel components
- Accordion behavior (one expanded at a time)
- Currently has 6 clerks: To-Do, Notes, Facts, Exhibits, Discovery, Caseblock
- **Needs:** 6 more clerks (total 12)

### ClerkPanel.vue
- Header with icon + name (clickable to toggle)
- Chevron rotation on collapse/expand
- Slot for content
- **States planned:** collapsed, expanded, split, float

### GlobalChatbox.vue
- Fixed position bottom-right
- Collapsible header
- Gold accent (AI theme)
- **Needs:** Docking behavior, actual chat integration

---

## 6. What Needs Refinement

### Missing Components
1. **6 additional clerks:** Records, Signature, Caselaw, Pleading, Attachments, Communication, Import, Export, Analysis
2. **Assets Panel** (right side) - Evidence sidebar
3. **Margin Cards** - Document annotations (AI + User notes)
4. **LLM Suggestion Banner** - Gold gradient, top of workspace
5. **Split View** - Clerk opens in secondary pane
6. **Float Window** - Clerk pops out

### Visual Refinements Needed
- Clerk panel content (currently placeholder text)
- Document editor integration (Tiptap)
- Paper sheet styling (margins, headers/footers)
- Tab close button hover states
- Scrollbar styling in panels

### Behavior Refinements
- Chatbox docking to specific clerks
- Clerk panel drag reordering
- Case tab unsaved indicator (isDirty)
- Keyboard shortcuts

---

## 7. Reference Materials

### Specification Documents
| File | Purpose |
|------|---------|
| `Runbooks/UI/00_UI_DESIGN_PRINCIPLES.md` | Visual language |
| `Runbooks/UI/UI_SHELL_ARCHITECTURE_SPEC.md` | Architecture spec |
| `JOURNAL.md` (Session 19) | Design decisions |

### HTML Mockups (Visual Reference)
| File | Shows |
|------|-------|
| `Runbooks/UI/05-integrated-clerk-system.html` | Full integrated shell |
| `Runbooks/UI/Factsway Caseblock Generator.html` | Control + preview pattern |
| `Runbooks/UI/Factsway Drafting Clerk.html` | 3-panel with AI assistant |
| `Runbooks/UI/Factsway UI Discovery Generator.html` | Strategy briefs, margin cards |

---

## 8. Technical Stack

- **Vue 3** - Composition API with `<script setup>`
- **Pinia** - State management
- **Vite** - Build tool
- **Lucide** - Icons (via CDN)
- **TypeScript** - Type safety

---

## 9. Critical Constraints

### Case Isolation (MANDATORY)
```typescript
// Every IPC call MUST include caseId
'drafts:list': (caseId: string) => Promise<Draft[]>;

// Per-case stores, NOT global
function createCaseTabStores(caseId: string) {
  return {
    drafts: defineStore(`drafts-${caseId}`, ...),
    evidence: defineStore(`evidence-${caseId}`, ...),
  };
}
```

### UI Blocks
- NO drag-drop between case tabs
- NO copy-paste of evidence references between cases
- Case name always visible in tab

---

## 10. Screenshot (Current State)

![Current UI Shell](/Users/alexcruz/.gemini/antigravity/brain/89fb1913-977f-4fa3-8dc3-d596b4044681/ui_shell_screenshot.png)

---

## 11. How to Help

When asked to refine this UI, please:

1. **Check specs first** - Reference the documents in Section 7
2. **Maintain isolation** - Never let cases share data
3. **Follow design tokens** - Use CSS variables from base.css
4. **Use composition API** - `<script setup lang="ts">`
5. **Keep files focused** - One component per file
6. **Test visually** - Run `npm run dev` to preview

---

**Questions to ask the user:**
- Which clerk should I implement first?
- Should I focus on visual polish or functionality?
- Are there specific mockups I should match more closely?
