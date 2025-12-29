# Factsway UI - Drafting Features Developer Review Pack

## Overview
This document catalogs all drafting-related UI functionality in the Factsway frontend codebase, suitable for developer handoff or system integration.

**Created**: 2025-12-28
**Purpose**: Document existing UI features for integration into new builds

---

## Table of Contents

1. [Outline Functionality](#1-outline-functionality)
2. [Editor Panels & Editing](#2-editor-panels--editing-capabilities)
3. [Drag-and-Drop Features](#3-drag-and-drop-features)
4. [Formatting Controls](#4-formatting-controls)
5. [Footer Panel & Footnotes](#5-footer-panel--footnotes)
6. [Navigation Patterns](#6-navigation-patterns)
7. [State Management](#7-state-management)
8. [Sentence & Paragraph Mutations](#8-sentence--paragraph-mutations)
9. [Assistant Panels](#9-assistant-panels)
10. [Keyboard Shortcuts](#10-keyboard-shortcuts)
11. [Object Blocks](#11-object-blocks-images-figures-tables)
12. [Link Change Review System](#12-link-change-review-system)
13. [Helpful UI Patterns](#13-helpful-ui-patterns)
14. [File Upload & Import](#14-file-upload--import)
15. [Document Structure Review](#15-document-structure-review)
16. [Integration Notes](#16-integration-notes-for-developers)

---

## 1. OUTLINE FUNCTIONALITY

### Location
[OutlinePanel.tsx](src/components/drafting/OutlinePanel.tsx)

### Features

#### 1.1 Hierarchical Section Display
- **Display**: Hierarchical tree view of document sections
- **Automatic Numbering**:
  - Level 1: Roman numerals (I, II, III)
  - Level 2: Uppercase letters (A, B, C)
  - Level 3: Arabic numerals (1, 2, 3)
  - Level 4: Lowercase letters (a, b, c)
- **Motion Title Badge**: Special treatment for motion title sections (excluded from numbering)
- **Visual Hierarchy**: Indentation and borders for nested sections

#### 1.2 Right-Click Context Menu
**Implementation**: Lines 82-727 in [OutlinePanel.tsx](src/components/drafting/OutlinePanel.tsx)

Comprehensive context menu for section manipulation:

**Motion Title Management:**
- "Set as Motion Title" - Designate a section as the motion title (excludes from numbering)
- Visual indicator when a section is the motion title

**Section Level Control:**
- Change section level: Level 1 (Section), Level 2 (Subsection), Level 3 (Paragraph)
- Shows current level with checkmark
- Preview of numbering style for each level

**Section Reordering:**
- **Move Up** ↑: Reorder within same level
- **Move Down** ↓: Reorder within same level
- **Promote (Outdent)** ←: Move up in hierarchy (child → sibling)
- **Demote (Indent)** →: Move down in hierarchy (sibling → child of previous)

**Implementation Details:**
- Context menu positioned at cursor location
- Shows section title in menu header (truncated to 30 chars)
- Backdrop click to close
- Operations update both hierarchy and child_section_ids arrays

#### 1.3 Inline Editing
- **Double-click** section heading to edit
- **Enter** to save, **Escape** to cancel
- Updates section.header.title

#### 1.4 Draft & Version Management
**Draft Selector:**
- Dropdown to switch between drafts
- "+" button to create new draft
- Shows current draft title

**Version Dropdown:**
- Shows current version number (v1, v2, etc.)
- Displays version count
- Click to expand version history
- Each version shows:
  - Version number
  - Creation date/time
  - Optional note
  - Highlight for current version
- "Save" button to create new version from working state

---

## 2. EDITOR PANELS & EDITING CAPABILITIES

### 2.1 Main Editor Panel
**Location**: [EditorPanel.tsx](src/components/drafting/EditorPanel.tsx)

**Features** (lines 1-500+):
- Two edit modes: Sentence mode & Deep Edit mode
- Undo/Redo support (Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z)
- Drag selection for multi-sentence operations
- Token-based text selection within sentences
- Object block management (images, figures)
- Link change review integration

### 2.2 Draft View
**Location**: [DraftView.tsx](src/components/drafting/DraftView.tsx)

**Key Features:**

**Edit Mode Toggle:**
- **Sentence Mode**: Click individual sentences to edit
- **Deep Edit Mode**: Edit entire paragraphs with boundary detection

**Motion Title Header:**
- Collapsible header showing motion title
- Separate from document body rendering
- Excludes motion title section from numbered outline

**Structure Review:**
- "Structure Review" button opens AI analysis panel
- Reviews document structure and suggests corrections
- Can apply corrections automatically

**AI Edit Panel:**
- Keyboard shortcut: **Cmd/Ctrl+I**
- Context-aware AI editing
- Supports rewrite-in-place or regenerate modes
- Blocks regeneration for linked sentences

**Sentence Rendering:**
- Inline sentence display (paragraphs flow like traditional documents)
- Visual indicators:
  - `.anchored` - Linked sentences (exhibition links)
  - `.pending-review` - Sentences with pending link changes
- Click to edit (sentence mode)
- Textarea with Enter/Escape keyboard handling

### 2.3 Deep Edit Paragraph
**Location**: [DeepEditParagraph.tsx](src/components/drafting/DeepEditParagraph.tsx)

**Features:**
- **ContentEditable** rich text editing
- Preserves linked sentence boundaries with visual highlighting
- Shows which sentences have exhibit links
- Prevents boundary changes affecting linked sentences
- Keyboard shortcuts:
  - **Cmd/Ctrl+Enter**: Save
  - **Escape**: Cancel
- Detects sentence boundary changes using tokenizer

### 2.4 Sentence Block Component
**Location**: [SentenceBlock.tsx](src/components/drafting/SentenceBlock.tsx)

**Features:**
- Draggable gutter with drag handle (⋮)
- Anchor indicator (📎) for linked sentences
- Visual states: selected, editing, anchored, pending-review
- Click to select (supports Shift/Cmd for multi-select)
- Double-click to edit
- Inline textarea editing with keyboard support

---

## 3. DRAG-AND-DROP FEATURES

### 3.1 Sentence Drag Selection
**Location**: [EditorPanel.tsx](src/components/drafting/EditorPanel.tsx) (Lines 296-468)

**Features:**
- **Mouse drag** to select range of sentences
- Visual highlight for selected sentences
- Works across paragraphs and sections
- Uses flattened sentence list for efficient range computation

**States:**
- `isDragging`: Currently performing drag selection
- `startInfo`: Starting sentence location
- `selectedSentences`: Array of selected sentence locations

**Operations:**
- **Merge**: Combine selected sentences (only if in same paragraph)
- **Clear**: Escape key or click outside
- Global mouseup listener to end drag

### 3.2 Object Block Drag
**Location**: [EditorPanel.tsx](src/components/drafting/EditorPanel.tsx), [ObjectBlockCard.tsx](src/components/drafting/ObjectBlockCard.tsx)

**Features:**
- Drag object blocks (images, figures, tables) to reorder
- Position anchored to sentences (`afterSentenceId`)
- Fallback positions: `DOCUMENT_START`, `DOCUMENT_END`
- Move up/down buttons as alternative to dragging

### 3.3 Gutter Drag-and-Drop
**Location**: [SentenceBlock.tsx](src/components/drafting/SentenceBlock.tsx) (Lines 77-99)

**Features:**
- Draggable handle in left gutter
- `onDragStart`, `onDragOver`, `onDrop` handlers
- Data transfer using sentence ID
- Visual drag handle (⋮) indicator

---

## 4. FORMATTING CONTROLS

### 4.1 Paragraph Style Controls
**Location**: [src/store/index.ts](src/store/index.ts) (changeParagraphStyle action, lines 1491-1554)

**Supported Styles:**
- `BODY_TEXT`: Normal paragraph (no indent, no numbering)
- `LIST_ITEM`: Bulleted list (level 0)
- `LIST_ITEM_L2`: Bulleted list (level 1)
- `LIST_ITEM_L3`: Bulleted list (level 2)
- `NUMBERED_ITEM`: Numbered list (level 0)
- `NUMBERED_ITEM_L2`: Numbered list (level 1)
- `NUMBERED_ITEM_L3`: Numbered list (level 2)
- `BLOCK_QUOTE`: Indented quote (ilvl 2, no numbering)

**Implementation:**
- Updates `num_format` (bullet, decimal, null)
- Updates `ilvl` (indentation level 0-2)
- Style intent derived from combination of zone, num_format, ilvl

### 4.2 Formatting Templates
**Location**: [FormattingContext.tsx](src/context/FormattingContext.tsx)

**Features:**
- Template library management (list, select, create, update, delete)
- Default template: Texas Motion (Standard)
- Style extraction from uploaded documents
- Element-specific formatting rules:
  - Section headings (L1, L2, L3)
  - Body paragraphs (first vs. subsequent)
  - Block quotes
  - List items (bullet/numbered)
  - Prayer, signature attestation, certificate text

**Template Structure:**
- Document settings: page size, margins, line numbering, default font, footer
- Element styles: font, paragraph, pagination rules
- Numbering schemes: hierarchical outline formats
- Conditional rules

---

## 5. FOOTER PANEL & FOOTNOTES

### Location
[FooterPanel.tsx](src/components/drafting/FooterPanel.tsx)

### Features

#### 5.1 Collapsible Panel
- Collapse/expand toggle button
- Shows footnote count badge when collapsed
- Smooth height transition

#### 5.2 Footer Configuration
- **Page Numbers**:
  - Toggle on/off
  - Format options: Bottom Center, Bottom Right, Page X of Y
- **Custom Text**:
  - Left text (e.g., "CONFIDENTIAL")
  - Right text (e.g., "Case No.")

#### 5.3 Footnote Management
- **Active Footnote Editing**:
  - Auto-switches when selecting sentence with footnote
  - Shows ordinal number [1], [2], etc.
  - Full-text editing in textarea
  - Delete button
- **Footnote List**:
  - Shows all footnotes when no active selection
  - Preview with truncation (80 chars)
  - Ordinal indicators
- **Empty State**:
  - Instructional message: "Select a sentence with a footnote to edit, or right-click to add one."

#### 5.4 Footnote Positioning
- Footnotes linked to sentences via `anchorSentenceId`
- Ordinals auto-calculated and maintained
- Re-ordinalization on delete

---

## 6. NAVIGATION PATTERNS

### 6.1 View Switching
**Location**: [ViewSidebar.tsx](src/components/drafting/ViewSidebar.tsx)

**Available Views:**
- **Draft View** (📝): Main editing interface
- **Linking View** (📎): Exhibit linking interface
- **Parse View** (✂️): Parse correction interface

**Navigation:**
- Sidebar toggle button (☰ Views)
- Keyboard shortcuts:
  - **Cmd/Ctrl+1**: Switch to Draft
  - **Cmd/Ctrl+2**: Switch to Linking
  - **Cmd/Ctrl+3**: Switch to Parse
- Pending link changes indicator in sidebar footer

**State Preservation:**
- Each view maintains its own scroll position
- Scroll position restored on view switch

### 6.2 Tab Navigation
**Location**: [DraftingTab.tsx](src/components/drafting/DraftingTab.tsx)

**Layout Structure:**
1. **Left Panel**: Outline (hierarchy + version control)
2. **Center Panel**: Editor with view container
3. **Right Panel**: Tabbed assistant panels
   - AI Assistant (🤖)
   - Versions (📜)
   - Exhibits (📎)
   - Notes (📝)
   - Review (⚠️) - Shows pending link count

**Right Panel Tabs:**
- Tab selector at top
- Active tab highlighted with border
- Badge indicators (e.g., "Review (3)" for pending changes)

### 6.3 Modal Workflows
- **LLM Edit Panel**: Modal overlay for AI editing
- **Structure Review**: Fixed-position slide-in panel (right side)
- **Link Change Review**: Embedded in Review tab

---

## 7. STATE MANAGEMENT

### 7.1 Zustand Stores
**Location**: [src/store/index.ts](src/store/index.ts)

**Primary Stores:**

#### Motion Store (lines 286-1939)
Manages document editing state:
- **Documents**: `committedDoc`, `workingDoc`
- **Dirty State**: `isDirty` flag
- **History**: Undo/redo stack (50-operation limit)
- **Staged Changes**: Changeset for review before commit
- **Annotations**: User notes on sentences/paragraphs
- **Exhibit Links**: Links to external documents
- **Pending Link Changes**: Queue for link-related edits requiring review
- **Object Blocks**: Embedded images, figures, tables
- **Footer Config**: Page settings and footnotes

**Key Actions:**
- Document CRUD: load, update, commit, discard
- Sentence editing: update, merge, split, delete, move
- Text transfer: transferTextToPrevious, transferTextToNext
- Section hierarchy: promote, demote, moveSectionUp, moveSectionDown
- Paragraph transformation: changeParagraphStyle, splitToParagraph, extractToSection
- Undo/redo: undo(), redo(), pushToHistory()

#### Selection Store (lines 1943-1987)
Manages user selection:
- **Mode**: 'none' | 'sentence' | 'paragraph' | 'section'
- **Selected IDs**: Array of selected element IDs
- **Anchor ID**: Starting point for range selections
- **Actions**: select, extendSelection, addToSelection, clearSelection

#### UI Store (lines 1991-2082)
Manages UI state:
- **Active Tab**: drafting, caseblock, signature, etc.
- **Panel States**: sidebar, assistant, staged changes, annotations
- **Editor View**: draft, linking, parse
- **Edit Mode**: sentence, deep
- **Linking State**: exhibit selection, bulk link mode, highlights
- **Parse Correction State**: selection boundaries, preview actions

#### CaseBlock Store (lines 2086-2215)
Manages case caption:
- Party entities (plaintiffs/defendants)
- Cause number
- Court information
- Motion title and motion title section ID

#### Other Stores:
- **Signature Store**: Signer profiles
- **Formatting Store**: Templates and style rules
- **Admin Store**: Task queue for admin approvals

### 7.2 React Context Providers
**Location**: [src/context/](src/context/)

**Key Contexts:**

#### DraftContext
**File**: [DraftContext.tsx](src/context/DraftContext.tsx)
- **Drafts**: List of all drafts in case
- **Versions**: Version history for current draft
- **Current State**: Current draft and version
- **Actions**: selectDraft, createDraft, saveNewVersion, importDocx, deleteDraft
- **Loading States**: loading, saving, error
- **Cancellation**: AbortController for async operations

#### FormattingContext
**File**: [FormattingContext.tsx](src/context/FormattingContext.tsx)
- **Templates**: Available formatting templates
- **Selected Template**: Active template with full details
- **Style Instructions**: Applied formatting rules
- **Extraction**: Extract styles from uploaded documents
- **Actions**: selectTemplate, createTemplate, updateTemplate, deleteTemplate, setDefault
- **Default Fallback**: Texas Motion (Standard) template hardcoded

#### ExhibitLinksContext
- Links between draft sentences and vault documents
- CRUD operations: create, read, update, delete links
- Affirmation workflow for link verification
- Snapshot preservation of linked text

---

## 8. SENTENCE & PARAGRAPH MUTATIONS

### 8.1 Mutation System
**Location**: [sentenceMutation.ts](src/utils/sentenceMutation.ts)

**Supported Mutations:**

#### UPDATE_TEXT
- Updates sentence text
- Auto-classifies edit significance (trivial, minor, substantive)
- For anchored sentences:
  - Trivial edits: Auto-approve, create link revision
  - Significant edits: Add to pending review queue

#### SPLIT
- Splits sentence at character position
- Blocked if sentence is anchored
- Creates new sentence ID
- Re-indexes paragraph sentences

#### SPLIT_WITH_LINK_ASSIGNMENT
- Splits sentence with link reassignment strategy
- **Options**:
  - `first`: Links stay on first sentence (default)
  - `second`: Links move to second sentence
  - `both`: Duplicate links to both sentences
  - `none`: Orphan all links

#### MERGE
- Combines multiple sentences into one
- Blocked if any sentence is anchored
- Preserves formatting flags (bold, italic, underline)
- Re-indexes remaining sentences

#### DELETE
- Removes sentence from paragraph
- If anchored: Orphans all links (sets status to 'orphaned')
- Re-indexes remaining sentences

#### MOVE
- Relocates sentence to different paragraph/section
- Updates parent_paragraph_id reference
- Re-indexes source and target paragraphs

#### TRANSFER_PREV / TRANSFER_NEXT
- Transfers text selection to adjacent sentence
- Blocked if source or target is anchored
- Deletes source sentence if empty after transfer

### 8.2 Link-Aware Editing
**Location**: [anchorHelpers.ts](src/utils/anchorHelpers.ts)

**Features:**
- `hasActiveAnchor(sentenceId)`: Check if sentence has active links
- `getActiveLinksForSentence(sentenceId)`: Get all active links
- Edit classification for significance detection
- Automatic pending review queue for significant edits

### 8.3 Edit Classification
**Location**: [editClassification.ts](src/utils/editClassification.ts)

**Classification Levels:**
- **Trivial**: Punctuation, whitespace, capitalization (auto-approve)
- **Minor**: Minor word changes (prompt for review)
- **Substantive**: Meaning-altering changes (require review)

**Criteria:**
- Levenshtein distance
- Word count delta
- Semantic token comparison

---

## 9. ASSISTANT PANELS

### 9.1 AI Assistant Panel
**Location**: [AssistantPanel.tsx](src/components/drafting/AssistantPanel.tsx)

**Features:**
- Chat-style interface
- Context-aware prompts based on selection
- Simulated responses (placeholder for real AI backend)
- **Supported Operations**:
  - Text revision (stronger, concise, persuasive)
  - Citation suggestions
  - Document summarization
  - Structure analysis

### 9.2 Staged Changes Panel
**Location**: [StagedChangesPanel.tsx](src/components/drafting/StagedChangesPanel.tsx)

**Features:**
- Diff view for all changes
- Change types: insert, modify, delete
- Individual accept/reject buttons
- Bulk "Accept All" / "Reject All"
- Commit button (requires at least one accepted change)
- Warning indicators for orphaned annotations/links
- Shows change path (section > paragraph > sentence)

### 9.3 Version History Panel
**Location**: [VersionHistoryPanel.tsx](src/components/drafting/VersionHistoryPanel.tsx)

**Features:**
- Lists all versions in reverse chronological order
- Each version shows:
  - Version number
  - Creation date/time
  - Optional note
  - Current indicator
- Click to load specific version
- Loading state during version switch

### 9.4 Exhibit Linking Panel
**Location**: [ExhibitLinkingPanel.tsx](src/components/drafting/ExhibitLinkingPanel.tsx)

**Features:**
- List of all exhibit links in current version
- Each link shows:
  - Exhibit title and letter
  - Page references
  - Linked claim text preview (truncated)
  - Affirmation status (verified, needs verification, auto-linked)
  - Version created
- Delete link button
- Empty state with instructions

### 9.5 Annotations Panel
**Location**: [AnnotationsPanel.tsx](src/components/drafting/AnnotationsPanel.tsx)

**Features:**
- User notes on sentences/paragraphs
- Create, edit, delete annotations
- Anchor points: sentence ID, paragraph ID, section ID
- Timestamp tracking

---

## 10. KEYBOARD SHORTCUTS

### Global Shortcuts
**Location**: [useKeyboardShortcuts.ts](src/hooks/useKeyboardShortcuts.ts)

- **Cmd/Ctrl+1**: Switch to Draft View
- **Cmd/Ctrl+2**: Switch to Linking View
- **Cmd/Ctrl+3**: Switch to Parse View

### Editor Shortcuts
**Location**: [EditorPanel.tsx](src/components/drafting/EditorPanel.tsx), [DraftView.tsx](src/components/drafting/DraftView.tsx)

- **Cmd/Ctrl+Z**: Undo
- **Cmd/Ctrl+Shift+Z**: Redo
- **Cmd/Ctrl+Y**: Redo (Windows alternative)
- **Cmd/Ctrl+I**: Open AI Edit Panel
- **Escape**: Clear selection, cancel edit, close panels
- **Enter**: Commit sentence edit (in editing mode)
- **Cmd/Ctrl+Enter**: Save deep edit paragraph

---

## 11. OBJECT BLOCKS (IMAGES, FIGURES, TABLES)

### Location
[ObjectBlockCard.tsx](src/components/drafting/ObjectBlockCard.tsx)

### Features

#### 11.1 Object Types
- `FIGURE`: Images (PNG, JPEG, WebP)
- `TABLE`: Embedded tables
- `TEXTBOX`: Text boxes

#### 11.2 Positioning
- Anchored to sentences via `afterSentenceId`
- Fallback positions:
  - `DOCUMENT_START`: Before first content
  - `DOCUMENT_END`: After last content
  - `SECTION_START`: Before specific section

#### 11.3 Operations
- **Move Up/Down**: Reposition relative to sentences
- **Replace**: Upload new image/content
- **Link to Exhibit**: Associate with vault document
- **Unlink from Exhibit**: Remove association
- **Update Caption**: Edit display caption
- **Delete**: Remove from document
- **Select**: Highlight for editing

#### 11.4 Display
- Preview image with aspect ratio preservation
- Caption overlay
- Exhibit link indicator
- Selection highlight
- Action buttons on hover

---

## 12. LINK CHANGE REVIEW SYSTEM

### Location
[LinkChangeReviewPanel.tsx](src/components/drafting/LinkChangeReviewPanel.tsx)

### Features

#### 12.1 Pending Changes Queue
Each pending change includes:
- Sentence ID
- Original text
- New text
- Linked exhibit ID and title
- Edit classification (significance level)
- Status: 'pending_review' | 'resolved'

#### 12.2 Review Actions
**Per Change:**
- **Keep Link**: Approve change, create link revision
- **Break Link**: Orphan the link, allow edit
- **Revert**: Undo text change, preserve link

**Resolution Flow:**
1. User edits linked sentence
2. System classifies edit
3. If substantive: Add to review queue
4. User reviews in Review tab
5. Choose resolution
6. System updates link status and text

#### 12.3 Commit Gating
- Commit button disabled while pending changes exist
- Warning indicator shows count: "⚠️ 3 pending link changes"
- Must resolve all changes before committing to version

---

## 13. HELPFUL UI PATTERNS

### 13.1 Error Boundaries
**Location**: [EditorErrorBoundary.tsx](src/components/shared/EditorErrorBoundary.tsx)

- Wraps editor components
- Catches React errors
- Displays user-friendly error message
- Prevents full app crash

### 13.2 Status Announcer
**Location**: [StatusAnnouncer.tsx](src/components/shared/StatusAnnouncer.tsx)

- Toast-style notifications
- Success/error/info messages
- Auto-dismiss timers
- Accessibility announcements

### 13.3 Loading States
**Patterns throughout:**
- Skeleton screens for loading content
- Spinner indicators
- Disabled button states
- "Loading..." text with context

### 13.4 Empty States
**Patterns:**
- Instructional icons (📝, 📎, 📜)
- Clear messaging about what to do
- Primary action buttons
- Helpful tooltips

### 13.5 Responsive Indicators
- Visual feedback for:
  - Hover states
  - Selection states
  - Drag states
  - Edit states
  - Link states (anchored, pending)
  - Dirty state (unsaved changes)

---

## 14. FILE UPLOAD & IMPORT

### 14.1 DOCX Import
**Location**: [DraftingTab.tsx](src/components/drafting/DraftingTab.tsx) (empty state), [DraftContext.tsx](src/context/DraftContext.tsx)

**Features:**
- Drag-and-drop dropzone
- File type validation (.docx only)
- Base64 conversion for transmission
- Backend processing for structure extraction
- Auto-load imported draft after processing
- Error handling with user feedback

### 14.2 Template Upload
**Location**: [FormattingContext.tsx](src/context/FormattingContext.tsx)

**Features:**
- Extract styles from uploaded DOCX
- Confidence scoring
- Warning detection (missing styles, inconsistencies)
- Preview extracted template before applying
- Manual adjustments after extraction

---

## 15. DOCUMENT STRUCTURE REVIEW

### Location
[DocumentStructureReview.tsx](src/components/drafting/DocumentStructureReview.tsx)

### Features
- AI-powered structure analysis
- Detects:
  - Incorrect section levels
  - Missing hierarchical relationships
  - Misplaced sections
  - Numbering inconsistencies
- Correction suggestions with preview
- One-click apply corrections
- Summary of changes made
- Integrates with working document state

---

## 16. INTEGRATION NOTES FOR DEVELOPERS

### 16.1 Backend API Endpoints Expected

Based on adapter usage in context files:

```
POST /api/drafting/drafts/list (caseId)
POST /api/drafting/drafts/create (caseId, title, documentJson)
POST /api/drafting/drafts/{draftId}/versions/list (caseId, draftId)
GET  /api/drafting/drafts/{draftId}/versions/{versionId} (caseId, draftId, versionId)
POST /api/drafting/drafts/{draftId}/versions/save (caseId, draftId, parentVersionId, documentJson)
POST /api/drafting/import-docx (caseId, fileBuffer, fileName, title)
DELETE /api/drafting/drafts/{draftId} (caseId, draftId)

POST /api/formatting/templates/list (caseId)
GET  /api/formatting/templates/{templateId} (caseId, templateId)
POST /api/formatting/templates/create (caseId, template)
PUT  /api/formatting/templates/{templateId} (caseId, templateId, template)
DELETE /api/formatting/templates/{templateId} (caseId, templateId)
POST /api/formatting/templates/{templateId}/set-default (caseId, templateId)
POST /api/formatting/extract-styles (caseId, file)

POST /api/exhibit-links/list (versionId)
POST /api/exhibit-links/create (link)
DELETE /api/exhibit-links/{linkId}
```

### 16.2 Type Contracts

All TypeScript types are defined in:
- [src/types/](src/types/) (frontend types)
- Shared types should match backend types in `factsway-backend/src/shared/types/`

Key type files:
- [src/types/index.ts](src/types/index.ts) - Main type definitions
- [src/adapters/types.ts](src/adapters/types.ts) - Adapter-specific types

### 16.3 State Synchronization

- Frontend uses **optimistic updates** for fast UI response
- Backend is source of truth
- Refresh on version load to ensure consistency
- AbortController pattern for canceling stale requests

### 16.4 Component Architecture

**Component Hierarchy:**
```
DraftingTab
├── OutlinePanel
│   ├── Draft selector
│   ├── Version dropdown
│   └── Section tree with context menus
├── EditorContainer
│   ├── ViewSidebar (Draft/Linking/Parse)
│   ├── DraftView
│   │   ├── Motion title header
│   │   ├── Section rendering
│   │   ├── Paragraph rendering
│   │   ├── SentenceBlock components
│   │   └── ObjectBlockCard components
│   ├── LinkingView
│   └── ParseView
├── AssistantPanel (tabbed)
│   ├── AI Assistant
│   ├── Version History
│   ├── Exhibit Links
│   ├── Annotations
│   └── Link Change Review
└── FooterPanel
    ├── Footer config
    └── Footnote editing
```

### 16.5 Critical Data Flows

**Document Loading:**
```
User selects draft/version
  → DraftContext.selectDraft()
  → API: GET /api/drafting/drafts/{draftId}/versions/{versionId}
  → Parse response JSON
  → motionStore.loadDocument(committedDoc)
  → workingDoc = deep clone of committedDoc
  → Render components
```

**Sentence Editing:**
```
User clicks sentence
  → selectionStore.select(sentenceId, 'sentence')
  → User edits in textarea
  → User presses Enter
  → motionStore.updateSentence(sentenceId, newText)
  → If anchored: classify edit significance
  → If substantive: add to pendingLinkChanges queue
  → Update workingDoc
  → Push to undo history
  → Re-render
```

**Version Save:**
```
User clicks "Save" in OutlinePanel
  → Collect workingDoc JSON
  → API: POST /api/drafting/drafts/{draftId}/versions/save
  → Returns new versionId
  → Reload version list
  → Set committedDoc = workingDoc
  → Clear isDirty flag
```

---

## SUMMARY

The Factsway drafting UI is a comprehensive legal document editor with:

1. **Hierarchical Outline**: Drag-free hierarchy management via right-click context menus
2. **Dual Edit Modes**: Sentence-level precision or paragraph-level deep editing
3. **Link-Aware Editing**: Automatic detection and review queue for edits affecting exhibit links
4. **Rich Mutations**: Split, merge, delete, move, transfer operations with undo/redo
5. **Footer/Footnotes**: Integrated page settings and footnote management
6. **Version Control**: Full version history with snapshots
7. **AI Integration**: LLM edit panel and structure review
8. **Object Blocks**: Embedded images/figures with positioning
9. **Formatting Templates**: Extensible template system with style extraction
10. **Keyboard Shortcuts**: Efficient navigation and editing
11. **State Management**: Zustand stores + React Context for separation of concerns
12. **Responsive UI**: Loading states, empty states, error boundaries, status announcements

All components are designed for legal document workflows with attention to citation integrity, version tracking, and collaborative editing patterns.

---

## APPENDIX A: Key Component File Locations

### Core Drafting Components
- [DraftingTab.tsx](src/components/drafting/DraftingTab.tsx) - Main container
- [OutlinePanel.tsx](src/components/drafting/OutlinePanel.tsx) - Left sidebar
- [EditorPanel.tsx](src/components/drafting/EditorPanel.tsx) - Center editor
- [DraftView.tsx](src/components/drafting/DraftView.tsx) - Draft rendering
- [SentenceBlock.tsx](src/components/drafting/SentenceBlock.tsx) - Sentence UI
- [DeepEditParagraph.tsx](src/components/drafting/DeepEditParagraph.tsx) - Paragraph editing
- [FooterPanel.tsx](src/components/drafting/FooterPanel.tsx) - Footer/footnotes
- [ObjectBlockCard.tsx](src/components/drafting/ObjectBlockCard.tsx) - Images/figures

### Assistant Panels
- [AssistantPanel.tsx](src/components/drafting/AssistantPanel.tsx) - AI chat
- [VersionHistoryPanel.tsx](src/components/drafting/VersionHistoryPanel.tsx) - Versions
- [ExhibitLinkingPanel.tsx](src/components/drafting/ExhibitLinkingPanel.tsx) - Links
- [AnnotationsPanel.tsx](src/components/drafting/AnnotationsPanel.tsx) - Notes
- [LinkChangeReviewPanel.tsx](src/components/drafting/LinkChangeReviewPanel.tsx) - Review

### State & Context
- [src/store/index.ts](src/store/index.ts) - Zustand stores
- [src/context/DraftContext.tsx](src/context/DraftContext.tsx) - Draft management
- [src/context/FormattingContext.tsx](src/context/FormattingContext.tsx) - Templates

### Utilities
- [src/utils/sentenceMutation.ts](src/utils/sentenceMutation.ts) - Mutation logic
- [src/utils/anchorHelpers.ts](src/utils/anchorHelpers.ts) - Link helpers
- [src/utils/editClassification.ts](src/utils/editClassification.ts) - Edit scoring

### API Adapters
- [src/adapters/http/client.ts](src/adapters/http/client.ts) - HTTP client
- [src/adapters/http/endpoints.ts](src/adapters/http/endpoints.ts) - URL definitions
- [src/adapters/http/index.ts](src/adapters/http/index.ts) - Adapter methods

---

## APPENDIX B: Visual Feature Map

```
┌─────────────────────────────────────────────────────────────────┐
│ DRAFTING TAB                                                     │
├──────────────┬──────────────────────────────┬───────────────────┤
│ OUTLINE      │ EDITOR                       │ ASSISTANT         │
│              │                              │                   │
│ • Draft ▼    │ ☰ Views  [Draft|Link|Parse] │ [🤖|📜|📎|📝|⚠️] │
│ • Version ▼  │                              │                   │
│              │ Motion Title (collapsible)   │ Tab Content:      │
│ Sections:    │ ──────────────────────────   │ • AI chat         │
│ I. Intro     │                              │ • Version list    │
│   A. Sub 1   │ I. Introduction              │ • Exhibit links   │
│   B. Sub 2   │                              │ • Annotations     │
│     1. Para  │ [Sentence sentence sentence  │ • Link reviews    │
│              │  sentence.]                  │                   │
│ [Right-click │                              │                   │
│  context     │ [Another sentence here.]     │                   │
│  menu]:      │                              │                   │
│ • Set Title  │ ┌──────────────────────┐    │                   │
│ • Level 1-3  │ │ Object Block: img.png│    │                   │
│ • Move ↑↓    │ │ [Image preview]      │    │                   │
│ • Indent ←→  │ │ Caption: Figure 1    │    │                   │
│              │ └──────────────────────┘    │                   │
│              │                              │                   │
│              │ A. First Subsection          │                   │
│              │                              │                   │
│              │ [Paragraph text here.]       │                   │
│              │                              │                   │
├──────────────┴──────────────────────────────┴───────────────────┤
│ FOOTER PANEL                                          [▲ Collapse]│
│ ────────────────────────────────────────────────────────────────│
│ Page Numbers: ☑ [Bottom Center ▼]                              │
│ Left Text: [CONFIDENTIAL]  Right Text: [Case No.]              │
│                                                                  │
│ Footnote [1]: Currently editing footnote for selected sentence  │
│ [Full text of footnote here...]                      [Delete]   │
└──────────────────────────────────────────────────────────────────┘
```

---

## APPENDIX C: CURRENT IMPLEMENTATION STATUS (2025-12-28)

> [!IMPORTANT]
> This section documents the **current state** of the Vue 3 / Pinia implementation in `/desktop/renderer/`, which is a rebuild of the original React codebase documented above.

### C.1 Technology Stack (Current Build)

| Layer | Technology |
|-------|------------|
| Framework | **Vue 3** (Composition API, `<script setup>`) |
| State Management | **Pinia** (Setup Stores) |
| Styling | Vanilla CSS + CSS Variables |
| Build Tool | Vite |
| Types | TypeScript |

### C.2 Completed Features

#### Shell & Layout
- **3-Panel Layout**: Left (Clerks/Outline), Center (Editor), Right (Context)
- **Panel Toggle System**: Header buttons, in-panel hide buttons, edge strips for re-opening
- **Tab System**: `case-tabs.store.ts` manages open drafts as tabs
- **Home View/Dashboard**: `DraftList.vue` - create, open, delete drafts

#### Core Editing (Priority 1 ✅)
- **Data Model**: `DocumentStructure`, `SectionData`, `ParagraphData`, `SentenceData` in `types/drafting.ts`
- **Draft Store**: `draft.store.ts` - holds active document structure, mutations, undo/redo
- **SentenceBlock.vue**: Click-to-edit, contenteditable, Enter to split, Backspace to merge
- **ParagraphBlock.vue**: Renders sentences, handles paragraph-level styling
- **SectionBlock.vue**: Recursive rendering, displays section header with label

#### Document Structure (Priority 2 ✅)
- **Outline Panel**: `OutlinePanel.vue` - displays section hierarchy with dynamic numbering
- **Numbering Utility**: `numbering.ts` - `getSectionLabel(depth, index)` returns I., A., 1., a. pattern
- **Context Menu**: Right-click for Promote/Demote/Add/Delete section
- **Navigation**: Click outline item to scroll to section in editor

#### Drafts & Persistence (Priority 3 - Partial ✅)
- **Draft Collection Store**: `draft-collection.store.ts` - manages multiple drafts in localStorage
- **Autosave**: 30-second interval + save-on-unmount in `DraftEditor.vue`
- **Dashboard Integration**: Home view lists all local drafts

### C.3 What Was Attempted (Smart Editing)

The user requested the following workflow:

> 1. Click inside a paragraph, press **Enter** → Create new paragraph
> 2. Press **Tab** → Convert that paragraph into a **Subsection** (e.g., "A." or "1.")
> 3. Press **Enter** again → Create a paragraph under the new subsection
> 4. Press **Tab** again → Convert that paragraph into a **Numbered List Item** (e.g., "1.")

#### Implementation Approach

1. **Store Action Added**: `convertParagraphToSection(paragraphId)` in `draft.store.ts`
   - Finds the paragraph's parent section
   - Extracts the paragraph's first sentence text as the new section title
   - Creates a new child section at `parentSection.level + 1`
   - Moves subsequent paragraphs from the parent into the new section

2. **Tab Keybinding Added**: In `SentenceBlock.vue` `handleKeydown`:
   ```typescript
   case 'Tab':
     e.preventDefault();
     store.convertParagraphToSection(props.sentence.paragraphId);
     break;
   ```

3. **Styling Adjusted**: Level 3 sections (which render as "1.") were given list-item styling (no underline, indented)

#### Why It Failed

| Issue | Description |
|-------|-------------|
| **Tab Key Not Triggering** | The browser's `Tab` key typically moves focus between elements. Even with `e.preventDefault()`, the event may not reach the component if focus is on a non-standard element (the custom Vue editor, not a native input). |
| **Focus Model Mismatch** | `SentenceBlock.vue` uses a contenteditable `<span>` that dynamically toggles `contenteditable="true"` on click. When the user is "in" a sentence, the component captures `keydown`. But navigation keys (Tab, Arrow) may not fire consistently. |
| **Event Propagation** | The `handleKeydown` is bound to the span element itself or via `@keydown` on the block. If the focus is elsewhere (e.g., on the viewport or parent container), the event listener never fires. |
| **Browser Subagent Limitation** | Automated browser tests could not reliably type into the custom contenteditable editor because it doesn't behave like a standard `<input>` or `<textarea>`. The subagent had to fall back to JavaScript store manipulation to verify the underlying logic. |

### C.4 Recommended Next Steps

1. **Centralize Keyboard Handling**: Move keyboard listeners to a higher-level component (e.g., `DraftEditor.vue` or `ShellLayout.vue`) that captures all keystrokes when the editor panel has focus, then dispatches to the appropriate store action based on current selection context.

2. **Improve Focus Model**: 
   - Use a single "active block" concept in the store
   - Ensure the top-level editor container is always focusable and captures Tab/Enter/Arrow keys
   - Route events to the active block's handlers

3. **Input Detection for Lists**: Implement "smart formatting" like Notion:
   - User types `1. ` at the start of a line → auto-convert to LIST_ITEM style
   - User types `- ` → auto-convert to bullet list
   - This sidesteps the Tab key issue entirely

4. **Use Native Inputs for Editing**: Consider using a hidden `<textarea>` that mirrors the visible contenteditable text. This ensures consistent keyboard handling across browsers.

### C.5 Key Files to Review

| File | Purpose |
|------|---------|
| `src/stores/draft.store.ts` | Core state, mutations, undo/redo |
| `src/components/drafting/SentenceBlock.vue` | Sentence editing, keydown handling |
| `src/components/drafting/SectionBlock.vue` | Section rendering with numbering |
| `src/components/drafting/DraftEditor.vue` | Top-level editor container |
| `src/utils/numbering.ts` | Label generation (I., A., 1., a.) |
| `src/types/drafting.ts` | TypeScript interfaces |

### C.6 Store Structure Reference

```typescript
// draft.store.ts exports
{
  structure,        // Ref<DocumentStructure>
  currentSectionId, // Ref<string | null>
  isDirty,          // Ref<boolean>
  
  // Actions
  loadMockDraft,
  updateSentence,
  splitSentence,
  mergeSentences,
  deleteSentence,
  addSection,
  deleteSection,
  promoteSection,
  demoteSection,
  convertParagraphToSection,  // NEW - attempted Tab indent
  setParagraphStyle,          // NEW - for LIST_ITEM styling
  undo,
  redo
}
```

### C.7 Data Model Overview

```
DocumentStructure
├── rootSectionIds: string[]
├── sections: Record<string, SectionData>
│   ├── id, title, level, parentId?
│   ├── childSectionIds: string[]
│   └── paragraphIds: string[]
├── paragraphs: Record<string, ParagraphData>
│   ├── id, sectionId, style?
│   └── sentenceIds: string[]
└── sentences: Record<string, SentenceData>
    └── id, text, paragraphId, sectionId
```

---

**End of Developer Review Pack**