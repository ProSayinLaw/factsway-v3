# Drafting Clerk — Vue UI Implementation Contract

> [!IMPORTANT]
> This is the authoritative specification for the FaxWay Drafting Clerk UI.
> All implementation decisions must align with this contract.

---

## Role & Objective

You are implementing the FaxWay Drafting Clerk UI in Vue 3 (Composition API).

This is a **production-grade legal drafting editor**, not a generic text editor.

Your goal is to build a fully capable editor (sections, paragraphs, lists, figures, tables, AI suggestions) while enforcing strict structural correctness, determinism, and export fidelity.

**If behavior is ambiguous, choose structural correctness over convenience.**

---

## Core Principle (Non-Negotiable)

> **Users do not edit text. They edit positions inside a hierarchical document structure.**

The browser DOM is **never authoritative** for structure.

All editing actions must resolve to **explicit structural mutations** against the document model.

---

## Document Model (Assumed and Required)

The editor operates on this hierarchy:

```
Section
  ├── Header
  ├── Paragraph
  │     ├── Sentence
  │     ├── Sentence
  ├── Paragraph
```

### Rules:
- Sections own paragraphs
- Paragraphs own sentences
- Paragraphs may exist without subsections or numbering
- Everything under a section belongs to that section until a new section is explicitly created
- Objects (figures, tables, images) are anchored explicitly to structure nodes

---

## The Editor Is Fully Capable

This editor must support:
- Creating new sections
- Writing text within sections
- Creating paragraphs freely
- Creating and exiting lists
- Inserting figures, tables, and object blocks
- Editing text continuously
- Using LLM assistance

**Capability is not restricted — authority is.**

At all times, it must be clear:
- What is being created
- What its parent is
- Where it lives in the hierarchy

---

## Structural Editing Doctrine

### Absolute Rule

> Nothing is ever "inserted into text." Everything is created as a child of something.

No ambiguous insertion is allowed.

---

## CursorContext (Mandatory)

At all times, the editor must resolve a **structural cursor**, not a DOM caret.

### CursorContext Shape

```typescript
interface CursorContext {
  sectionId: string
  paragraphId: string | null
  sentenceId: string | null
  offsetInSentence: number | null
  positionType: 'sectionHeader' | 'sentence' | 'paragraph'
}
```

This context is derived from:
- Selection state
- Focused structural component
- Editor state

**Never infer structure from DOM nodes.**

---

## Enter Key = Structural Intent Resolver

### Hard Rule
- **Always** `preventDefault()` on Enter
- The browser must **never** insert `<br>`, `<div>`, or `<p>`
- Enter dispatches structural mutations only

---

## Canonical Enter Behavior

Resolve behavior **only from CursorContext**.

### 1. Cursor at End of Section Header
**Action:**
- Create a new Paragraph
- Parent = current section
- Paragraph is empty

### 2. Cursor Inside Sentence (mid-text)
**Action:**
- Split sentence into two sentences
- Same paragraph

### 3. Cursor at End of Sentence
**Action:**
- Create new sentence in same paragraph

### 4. Cursor at End of Last Sentence in Paragraph
**Action:**
- Create new paragraph under same section

### 5. Cursor in Empty Paragraph
**Action:**
- Create new empty paragraph under same section

### Forbidden
- Enter must **never** create a subsection
- Enter must **never** change hierarchy level

---

## Paragraphs Are First-Class

A paragraph:
- Is not a section
- Is not a subsection
- Is not a list by default
- Is simply a container for sentences

**Do not auto-promote paragraphs into sections or lists.**

---

## Creating New Sections (Explicit Only)

Sections may be created only via:
- Toolbar action
- Context menu (outline or section header)
- Explicit smart pattern rules (only if intentionally implemented)

**Never via Enter.**

When creating a section:
- Parent section is explicit
- Section level is explicit
- Child paragraphs start empty

---

## Lists (Structured, Not Formatting)

Lists are structured containers:
- List owns list items
- List items are paragraph-like nodes
- Parent section is explicit

Enter in a list:
- Creates a new list item
- Exiting a list is explicit (empty item + Backspace or toolbar)

---

## Object Insertion (Figures, Tables, Images)

All object insertions must resolve explicitly:

```typescript
interface ObjectInsertion {
  objectType: 'Figure' | 'Table' | 'TextBox'
  anchorType: 'Sentence' | 'Paragraph' | 'Section'
  anchorId: string
  position: 'before' | 'after' | 'inline'
}
```

There is no "drop anywhere" without resolution.

Objects must always know:
- What they are attached to
- How they move if structure changes

---

## Rendering Model (Critical)

### WYSIWYG Is Mandatory

The drafting surface must match export exactly.
- Fixed page size
- Fixed margins
- Explicit page breaks
- Explicit headers / footers
- No responsive reflow

### Scaling Rules
- Page scales uniformly (zoom)
- Text never reflows due to viewport size
- Line breaks and pagination are invariant

**Rendering provides information only — never editing authority.**

---

## LLM Integration (Strict)

### Core Rule

> LLMs may never directly edit the document.

LLMs produce **Change Proposals**, not edits.

### Change Proposal Requirements

Each proposal must include:
- Target sentence / paragraph / section ID
- Original text (immutable)
- Proposed text
- Change type (insert / replace / delete)
- Optional rationale

### Application Rules
- User must explicitly accept or reject
- Accepted proposals commit structurally
- Rejected proposals leave zero residue
- No proposal survives export

LLM output must route through the same review system as any other staged change.

---

## Undo / Redo (Structural)

Undo/redo must revert structural mutations atomically:
- "Create paragraph"
- "Split sentence"
- "Insert object"

**Never raw DOM diffs.**

---

## Keyboard Handling (Shell-Level)

- Keyboard events are captured **at the Drafting Clerk shell**
- Routed based on active structural edit target
- DOM focus is advisory only

There must be **exactly one active edit target** at any time.

---

## Failure Conditions (Hard Fail)

The implementation is incorrect if:
- Enter inserts DOM nodes
- Hierarchy changes implicitly
- Text reflows when resizing window
- A paragraph becomes a section without explicit action
- Objects float without a known parent
- AI edits bypass review
- Export output differs from editor layout

**These are correctness bugs, not polish issues.**

---

## Acceptance Tests (Required)

A correct implementation must demonstrate:

1. Section header → Enter creates paragraph under same section
2. Sentence mid-text → Enter splits sentence
3. Sentence end → Enter creates new sentence or paragraph deterministically
4. Paragraph → Enter creates sibling paragraph
5. Objects always have explicit anchors
6. Zoom does not affect pagination
7. Export output matches editor exactly

---

## Final Contract Statement

```typescript
/**
 * The FaxWay Drafting Clerk is a structural editor.
 * All user actions resolve into explicit hierarchical mutations.
 * The browser is never allowed to infer document structure.
 */
```
