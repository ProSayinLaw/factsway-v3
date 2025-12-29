# Feature Carryover Inventory

**Source:** `DRAFTING_UI_DEVELOPER_REVIEW_PACK.md`
**Purpose:** Prioritized list of features to implement in the new Vue 3 shell

---

## Priority 1: Core Editing (Must Have)

| Feature | Description | Notes |
|---------|-------------|-------|
| **Sentence Editing** | Click sentence → edit in place | Enter saves, Escape cancels |
| **Deep Edit Mode** | Edit entire paragraph with boundary detection | Toggle between sentence/paragraph mode |
| **Undo/Redo** | Cmd+Z / Cmd+Shift+Z | 50-operation history stack |
| **Sentence Mutations** | Split, merge, delete, move sentences | Block mutations on linked sentences |
| **Paragraph Styles** | Body, list, numbered, block quote | Updates num_format + ilvl |

## Priority 2: Document Structure

| Feature | Description | Notes |
|---------|-------------|-------|
| **Outline Panel** | Hierarchical tree with auto-numbering | I, A, 1, a levels |
| **Right-click Context Menu** | Set level, move up/down, promote/demote | On outline items |
| **Motion Title Badge** | Exclude from numbering | Special section treatment |
| **Section Reordering** | Move sections in hierarchy | Updates child_section_ids |
| **Inline Heading Edit** | Double-click to edit section title | Enter/Escape handling |

## Priority 3: Drafts & Versions

| Feature | Description | Notes |
|---------|-------------|-------|
| **Draft Selector** | Dropdown to switch drafts | + button to create new |
| **Version Dropdown** | v1, v2, etc. with timestamps | Click to load version |
| **Save Version** | Create snapshot of working doc | With optional note |
| **Dirty State Indicator** | Show unsaved changes | Tab name or badge |

## Priority 4: Evidence Linking

| Feature | Description | Notes |
|---------|-------------|-------|
| **Exhibit Links** | Link sentences to vault documents | Anchored indicator (📎) |
| **Link Change Review** | Review queue for edited linked sentences | Keep/Break/Revert options |
| **Edit Classification** | Trivial/Minor/Substantive scoring | Auto-approve trivial edits |
| **Commit Gating** | Block commit with pending changes | Must resolve all first |

## Priority 5: Footer & Footnotes

| Feature | Description | Notes |
|---------|-------------|-------|
| **Footer Panel** | Collapsible config panel | At bottom of editor |
| **Page Numbers** | Toggle + format options | Bottom Center, Page X of Y |
| **Custom Footer Text** | Left/right text fields | Case number, confidential |
| **Footnote Editing** | Select sentence to edit its footnote | Re-ordinalization on delete |

## Priority 6: Object Blocks

| Feature | Description | Notes |
|---------|-------------|-------|
| **Image/Figure Blocks** | Embedded media with captions | Positioned after sentences |
| **Table Blocks** | Embedded tables | Same positioning model |
| **Move Up/Down** | Reposition relative to sentences | Alternative to drag |
| **Link to Exhibit** | Associate block with vault doc | Shows exhibit indicator |

## Priority 7: Assistant Panels

| Feature | Description | Notes |
|---------|-------------|-------|
| **AI Edit Panel** | Cmd+I to open | Rewrite/regenerate modes |
| **Structure Review** | AI analysis of document structure | Apply corrections |
| **Staged Changes** | Diff view with accept/reject | Before commit |
| **Annotations** | User notes on sentences | Excluded from export |
| **Version History** | List all versions with timestamps | Click to load |

## Priority 8: Views & Navigation

| Feature | Description | Notes |
|---------|-------------|-------|
| **View Switcher** | Draft / Linking / Parse views | Cmd+1,2,3 shortcuts |
| **Scroll Position Restore** | Each view maintains position | On view switch |
| **Right Panel Tabs** | AI / Versions / Exhibits / Notes / Review | Badge for pending count |

## Priority 9: File Operations

| Feature | Description | Notes |
|---------|-------------|-------|
| **DOCX Import** | Drag-drop or file picker | Backend processes structure |
| **Template Extraction** | Extract styles from DOCX | With confidence scoring |

## Priority 10: UI Patterns

| Feature | Description | Notes |
|---------|-------------|-------|
| **Error Boundaries** | Prevent full crash | User-friendly message |
| **Status Toasts** | Success/error/info messages | Auto-dismiss |
| **Loading Skeletons** | For async content | |
| **Empty States** | Instructional with action | Icons + messaging |

---

## Keyboard Shortcuts (All Priorities)

| Shortcut | Action |
|----------|--------|
| Cmd+Z | Undo |
| Cmd+Shift+Z | Redo |
| Cmd+I | AI Edit Panel |
| Cmd+1 | Draft View |
| Cmd+2 | Linking View |
| Cmd+3 | Parse View |
| Cmd+Enter | Save deep edit |
| Enter | Save sentence edit |
| Escape | Cancel / Clear selection |

---

## Already Implemented in New Shell ✅

- [x] 3-panel layout (Left/Center/Right)
- [x] Panel hide/show toggles
- [x] Case tabs with isolation
- [x] Clerk sidebar (accordion)
- [x] Global chatbox
- [x] Views selector (Editor/Notes/Assistant/Chat)
- [x] Fixed page geometry (8.5x11)
- [x] Design tokens (colors, fonts)
