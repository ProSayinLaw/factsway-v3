# ProseMirror vs LegalDocument: Critical Architecture Analysis

**Date:** December 26, 2025
**Issue:** Conflicting data models in Runbook 0
**Status:** 🔴 **REQUIRES IMMEDIATE RESOLUTION**

---

## Executive Summary

**Finding:** Runbook 0 Section 2.5 specifies ProseMirror as the **DATA MODEL** for document storage and interchange. This **CONTRADICTS** the LegalDocument format specified in Runbook 1 and referenced throughout the microservices architecture.

**Severity:** CRITICAL - This is not just an editor vs. data model confusion. Section 2.5 explicitly states documents are **stored and serialized** as ProseMirror JSON.

---

## What Section 2.5 Actually Says

**From Runbook 0, Lines 811-870:**

> "The body content uses ProseMirror's document model, which **Tiptap serializes as JSON**. This **structured format preserves** custom node types and their attributes."

**Key Evidence It's a Data Model:**

1. **"serializes as JSON"** - Implies persistence format
2. **"structured format preserves"** - Implies storage
3. **Defines data structures:**
   - `ProseMirrorDocument` interface
   - `BlockNode` types
   - `InlineNode` types
   - `CitationNode` with attributes
   - `VariableNode` references

4. **No conversion mentioned** - Doesn't say "editor converts to LegalDocument"
5. **Section 2.6** continues defining `CitationNode` as a ProseMirror node type

**Interpretation:** Section 2.5 is specifying ProseMirror JSON as the canonical storage and interchange format.

---

## What Microservices Architecture Says

**From Runbook 0, Section 16 (Deployment Architecture):**

Services use **LegalDocument** format:

```
Core Services:
├── Ingestion Service (port 3002)
│   └── DOCX → LegalDocument parsing
├── Export Service (port 3003)
│   └── LegalDocument → DOCX generation
```

**From Runbook 1:**
- Creates TypeScript types for `LegalDocument`
- Hierarchical sections with UUIDs
- Paragraphs with sentence overlays
- Character offset-based formatting
- **No mention of ProseMirror**

---

## The Contradiction

### ProseMirror Model (Section 2.5)

**Data Structure:**
```typescript
interface ProseMirrorDocument {
  type: "doc";
  content: BlockNode[];  // Flat or nested blocks
}

type BlockNode =
  | ParagraphNode        // { type: "paragraph", content: InlineNode[] }
  | HeadingNode         // { type: "heading", level: 1-6 }
  | BulletListNode      // { type: "bulletList", content: ListItemNode[] }
```

**Citations:**
```typescript
interface CitationNode {
  type: 'citation';
  attrs: {
    id: string;
    evidenceType: 'exhibit' | 'caselaw' | 'statute';
    evidenceId: string | null;
    supportsSentenceIds: string[];  // References sentences
    displayMode: 'inline' | 'parenthetical' | 'textual';
  };
}
```

**Characteristics:**
- Editor-centric structure
- Flat content arrays
- Marks for formatting (bold, italic)
- Node-based citations
- No explicit paragraph-sentence relationship

---

### LegalDocument Model (Runbook 1)

**Data Structure:**
```typescript
interface LegalDocument {
  meta: DocumentMeta;
  case_header?: CaseHeader;
  caseblock?: CaseBlock;
  body: DocumentBody;           // Hierarchical sections
  signature_block?: SignatureBlock;
  citations: Citation[];
  embedded_objects: EmbeddedObject[];
}

interface Section {
  id: UUID;                      // Stable UUIDs
  parent_section_id: UUID | null;
  title: string;
  level: number;
  type: SectionType;
  children: Section[];           // Recursive hierarchy
  paragraphs: Paragraph[];
}

interface Paragraph {
  id: UUID;
  parent_section_id: UUID;
  text: string;                  // Authoritative text
  format_spans: FormatMark[];    // Character offsets
  sentences: Sentence[];         // Overlays on paragraph text
}

interface Sentence {
  id: UUID;
  parent_paragraph_id: UUID;
  start_offset: number;          // Into paragraph text
  end_offset: number;
  text: string;                  // Derived: paragraph.text.slice(start, end)
  format_spans: FormatMark[];
  citations: CitationSpan[];
}
```

**Characteristics:**
- Domain-centric structure
- Hierarchical sections (tree)
- Paragraph-sentence relationship with offsets
- Format spans with character positions
- Citation registry (separate from text)
- Preservation metadata for round-trip

---

## Critical Incompatibilities

### 1. **Document Structure**

| Aspect | ProseMirror | LegalDocument |
|--------|-------------|---------------|
| **Hierarchy** | Flat blocks | Nested sections |
| **Sections** | HeadingNode | Section with children |
| **Paragraphs** | ParagraphNode | Paragraph with metadata |
| **Sentences** | Not modeled | Explicit with offsets |

**Incompatible:** Cannot directly convert between these structures.

---

### 2. **Citation Modeling**

| Aspect | ProseMirror | LegalDocument |
|--------|-------------|---------------|
| **Location** | Inline CitationNode | Citation registry + spans |
| **Reference** | Node wraps text | CharacterOffset in paragraph |
| **Linking** | attrs.evidenceId | citation_id + lookup |
| **Display** | Computed in node | Resolved at render time |

**Incompatible:** Fundamentally different citation architectures.

---

### 3. **Format Preservation**

| Aspect | ProseMirror | LegalDocument |
|--------|-------------|---------------|
| **Formatting** | Marks (bold, italic) | FormatMark with character offsets |
| **Position** | Node-relative | Paragraph-relative character offsets |
| **Preservation** | Not specified | PreservationMetadata with OOXML |

**Incompatible:** Different formatting models.

---

### 4. **Sentence Boundaries**

| Aspect | ProseMirror | LegalDocument |
|--------|-------------|---------------|
| **Modeling** | Not represented | Explicit Sentence entities |
| **IDs** | N/A | Stable UUIDs |
| **Offsets** | N/A | start_offset, end_offset |
| **Relationship** | N/A | parent_paragraph_id |

**Incompatible:** ProseMirror has no sentence concept.

---

## Services Impact Analysis

### If ProseMirror is the Data Model

**Ingestion Service:**
```
DOCX → Parse → ??? → ProseMirror JSON
```
**Problem:** How do you extract sentences? NUPunkt expects paragraph text, not ProseMirror nodes.

**Export Service:**
```
ProseMirror JSON → ??? → DOCX
```
**Problem:** How do you inject OOXML formatting? Need character offsets, not node structure.

**Facts Service:**
```
Store sentence registry → ??? → Link to ProseMirror nodes?
```
**Problem:** Sentences don't exist in ProseMirror model.

**Citation Service:**
```
Detect citations → ??? → Create CitationNodes?
```
**Problem:** CitationNode model is editor-specific, not service-friendly.

---

### If LegalDocument is the Data Model

**Ingestion Service:**
```
DOCX → Parse with LXML → Extract structure → LegalDocument
```
**Works:** Well-defined transformation.

**Export Service:**
```
LegalDocument → Pandoc + OOXML injection → DOCX
```
**Works:** Character offsets enable precise OOXML manipulation.

**Facts Service:**
```
LegalDocument.body.sections[].paragraphs[].sentences[] → Sentence registry
```
**Works:** Sentences are first-class entities.

**Citation Service:**
```
LegalDocument.citations[] + CitationSpan[] → Citation detection/linking
```
**Works:** Citations are separate registry.

---

## The Real Question

**What does the motion body pipeline ACTUALLY do?**

### Scenario A: Current Implementation Uses ProseMirror

**If this is true:**
- Section 2.5 is accurate
- Runbook 1 is wrong
- Microservices architecture won't work
- Need major rework

**Evidence Needed:**
- Check `src/` directory for ProseMirror usage
- Look for Tiptap editor integration
- Find where documents are saved
- Check API endpoints for data format

---

### Scenario B: Current Implementation Planned for LegalDocument

**If this is true:**
- Section 2.5 is wrong (early draft artifact)
- Runbook 1 is correct
- Microservices architecture will work
- Just need to remove Section 2.5

**Evidence Needed:**
- No ProseMirror in backend code
- No Tiptap editor implemented yet
- No serialization to ProseMirror JSON
- Services expect LegalDocument

---

### Scenario C: Frontend Uses ProseMirror, Backend Uses LegalDocument

**If this is true:**
- Section 2.5 describes UI only (poorly)
- Runbook 1 is correct for services
- Need conversion layer
- Need to clarify Section 2.5

**Evidence Needed:**
- Tiptap in frontend code
- Conversion code: ProseMirror ↔ LegalDocument
- Backend APIs accept/return LegalDocument
- Frontend adapter handles conversion

---

## Code Investigation Needed

**To resolve this, we need to check:**

1. **Backend Source Code** (`/Users/alexcruz/Documents/factsway-backend`)
   ```bash
   # Check for ProseMirror usage
   grep -r "ProseMirror\|Tiptap" src/ factsway-ingestion/

   # Check for LegalDocument usage
   grep -r "LegalDocument" src/ factsway-ingestion/

   # Check API endpoint data formats
   find src/api -name "*.ts" -exec grep -l "interface.*Document" {} \;
   ```

2. **Frontend Source Code** (if exists)
   ```bash
   # Check for Tiptap editor
   find . -name "*.vue" -o -name "*.ts" | xargs grep -l "Tiptap\|useEditor"

   # Check for document serialization
   grep -r "JSON.stringify.*doc\|editor.getJSON" src/
   ```

3. **Storage/API Layer**
   ```bash
   # What format is saved?
   grep -r "localStorage.setItem\|POST.*draft" src/

   # What do APIs return?
   grep -r "GET.*draft\|return.*document" src/
   ```

---

## Recommended Resolution Path

### Step 1: Investigate Current Code

Run the code investigation commands above to determine:
- Is ProseMirror actually used?
- Where is it used (UI only? Backend too?)?
- What format is persisted?
- Do services use ProseMirror or LegalDocument?

---

### Step 2A: If ProseMirror is Not Used (Most Likely)

**Action:** Remove Section 2.5 entirely

**Justification:**
- No code implements it
- Contradicts microservices architecture
- Runbook 1 supersedes it
- Architecture Audit expects LegalDocument

**Edit:**
1. Delete Section 2.5 (Document Content Model)
2. Delete Section 2.6 (Citation Node Model)
3. Update Table of Contents
4. Add note: "Frontend UI TBD - will use Tiptap with LegalDocument conversion"

---

### Step 2B: If ProseMirror is Used in Frontend Only

**Action:** Rewrite Section 2.5 to clarify it's UI-only

**New Section 2.5:**
```markdown
### 2.5 Frontend Editor (UI Only)

The frontend uses Tiptap (ProseMirror-based) for rich text editing.

**Editor Layer:** ProseMirror document model (in-memory only)
**Storage Layer:** LegalDocument format (canonical)
**Conversion:** Editor adapter converts ProseMirror ↔ LegalDocument on save/load

**UI Editor Model:**
- Users edit in Tiptap editor
- Editor maintains ProseMirror state
- On save: Convert to LegalDocument
- On load: Convert from LegalDocument
- Backend never sees ProseMirror JSON

**Backend API:**
- All endpoints use LegalDocument format
- POST /api/drafts accepts LegalDocument
- GET /api/drafts/:id returns LegalDocument
- Services process LegalDocument only
```

**Edit:**
1. Replace Section 2.5 content with above
2. Remove CitationNode (ProseMirror) from Section 2.6
3. Add reference to LegalDocument.citations[] instead
4. Clarify conversion layer responsibility

---

### Step 2C: If ProseMirror is Used Throughout (Unlikely)

**Action:** Major architectural rework required

**Options:**
1. Migrate to LegalDocument (follow Runbook 1)
2. Abandon microservices (stay browser-based)
3. Build complex conversion layer

**Not Recommended:** This would contradict Architecture Audit and waste previous work.

---

## My Hypothesis

Based on the evidence:

**Most Likely:** Scenario B (Section 2.5 is outdated)

**Reasoning:**
1. Architecture Audit found no ProseMirror in backend
2. Runbook 1 creates LegalDocument types (recent, deliberate)
3. Section 2.5 looks like early draft (browser-based design)
4. Microservices architecture is well-specified (later sections)
5. No conversion layer mentioned anywhere

**Prediction:** You'll find:
- ❌ No Tiptap in current code
- ❌ No ProseMirror JSON storage
- ❌ No CitationNode implementation
- ✅ Placeholder or minimal frontend
- ✅ Services expect LegalDocument (if implemented)

---

## What I Need From You

**Please check:**

1. **Does this code exist?**
   ```bash
   cd /Users/alexcruz/Documents/factsway-backend
   find src -name "*editor*" -o -name "*tiptap*" -o -name "*prosemirror*"
   ```

2. **What's in the API routes?**
   ```bash
   ls src/api/routes/
   cat src/api/routes/drafts.ts  # (if exists)
   ```

3. **What's in factsway-ingestion?**
   ```bash
   ls factsway-ingestion/
   find factsway-ingestion -name "*.py" | head -10
   ```

4. **Your intent:**
   - Did you want ProseMirror as the data model?
   - Or just as the UI editor?
   - Or is Section 2.5 from an old draft?

---

## Immediate Action Required

**BEFORE proceeding with Runbook 2:**

✅ **Determine:** Is ProseMirror used, and if so, where?

✅ **Decide:** Which data model is canonical (ProseMirror vs LegalDocument)?

✅ **Update:** Runbook 0 to remove contradiction

✅ **Clarify:** UI vs. backend data format boundary

---

**This is blocking.** We cannot proceed with implementation until we know which data model to use. The microservices architecture depends on LegalDocument, but Section 2.5 specifies ProseMirror.

**Next Step:** Run the code investigation or tell me your intent, and I'll help you resolve this definitively.
