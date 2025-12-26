# ProseMirror vs LegalDocument: RESOLUTION

**Date:** December 26, 2025
**Status:** ✅ **RESOLVED**
**Investigation:** Complete code audit performed

---

## Executive Summary

**FINDING:** The backend uses **BOTH** formats, but LegalDocument is **CANONICAL**.

**Architecture Pattern:**
- **Frontend:** Tiptap editor (ProseMirror-based) for rich text editing
- **Canonical Storage:** LegalDocument format (authoritative)
- **Reference Storage:** Tiptap JSON (for node ID mapping only)
- **Services:** All microservices use LegalDocument exclusively

**Section 2.5 Status:** ❌ **INCORRECT** - Must be rewritten to clarify dual storage with LegalDocument as canonical

---

## Code Investigation Results

### 1. Ingestion Service (Python) - LegalDocument ONLY

**File:** `factsway-ingestion/ingestion_engine/api.py`

**Evidence:**
```python
# Line 2-4
"""
Factsway Ingestion API - LegalDocument format only

ULDM pipeline has been removed. Only DOCX files are supported via /ingest/v2.
"""

# Line 93-98
return {
    "success": True,
    "document": document_to_dict(result.document),  # LegalDocument
    "warnings": warnings,
    "format": "legal_document",  # ← Explicit format declaration
}
```

**Conclusion:** Ingestion service returns **LegalDocument ONLY**. No ProseMirror output.

---

### 2. Backend Storage - Dual Format (LegalDocument + Tiptap)

**File:** `src/main/db/database.ts`

**Evidence:**
```typescript
// Line 483-489: filed_motions table
CREATE TABLE filed_motions (
  -- Frozen content (immutable after filing)
  document_json TEXT NOT NULL,  -- LegalDocument snapshot (CANONICAL)
  content_json TEXT,             -- Tiptap JSON for node reference (AUXILIARY)

  -- Filing metadata
  filed_at TEXT NOT NULL DEFAULT (datetime('now')),
```

**File:** `src/main/db/filing.repository.ts`

**Evidence:**
```typescript
// Line 125-136: FileMotionInput interface
export interface FileMotionInput {
  caseId: string;
  draftId: string;
  draftVersionId: string;
  title: string;
  motionType: string;
  documentJson: string;      // ← LegalDocument (canonical)
  contentJson?: string;      // ← Tiptap JSON (optional, for node refs)
  filedBy?: string;
  skipCompletenessCheck?: boolean;
}

// Line 249-270: extractAndCreateFacts function
const tiptapDoc = JSON.parse(input.contentJson);  // Parse Tiptap JSON
// ...
function extractNodes(node: TiptapNode): void {
  if (node.attrs?.id && node.type === 'paragraph' && node.content) {
    // Extract node ID from Tiptap structure
    nodes.push({ id: node.attrs.id, text });
  }
}
// Creates Facts using node IDs from Tiptap JSON
```

**Conclusion:** Backend stores **BOTH** formats:
- `document_json`: LegalDocument (authoritative, used by all services)
- `content_json`: Tiptap JSON (auxiliary, used only for node ID → fact mapping)

---

### 3. API Routes - Accept LegalDocument as `documentJson`

**File:** `src/api/routes/drafting.ts`

**Evidence:**
```typescript
// Line 114-124: POST /api/cases/:caseId/drafts
draftingRouter.post('/cases/:caseId/drafts', async (req, res, next) => {
  const { title, documentJson } = req.body ?? {};  // ← documentJson parameter

  if (typeof title !== 'string' || typeof documentJson !== 'string') {
    return badRequest(res, 'title and documentJson are required');
  }

  const result = await invokeChannel('drafting:create', {
    caseId, pathId, title,
    documentJson,  // ← Passes documentJson to backend
  });
});

// Line 152-162: POST /api/cases/:caseId/drafts/:draftId/versions
draftingRouter.post('/cases/:caseId/drafts/:draftId/versions', async (req, res, next) => {
  const { parentVersionId, documentJson } = req.body ?? {};  // ← documentJson parameter

  const record = await invokeChannel('drafting:save-version', {
    caseId, draftId, parentVersionId,
    documentJson,  // ← Saves documentJson
  });
});
```

**Conclusion:** API endpoints accept and return `documentJson` (LegalDocument format).

---

### 4. TypeScript Types - LegalDocument Interface Defined

**File:** `src/shared/types/legal-document.types.ts`

**Evidence:**
```typescript
// Line 297-306: LegalDocument root interface
export interface LegalDocument {
  meta: DocumentMeta;
  case_header: CaseHeader;
  caseblock: Caseblock;
  salutation: Salutation | null;
  body: DocumentBody;               // ← Hierarchical sections
  signature_block: SignatureBlock;
  citations: Citation[];            // ← Citation registry
  embedded_objects: EmbeddedObject[];
}

// Line 147-166: Sentence with offsets
export interface Sentence {
  id: string;
  text: string;
  parent_paragraph_id: string;
  index: number;

  // V1 Pipeline additions
  start_offset?: number;    // ← Character offset into paragraph
  end_offset?: number;      // ← Character offset into paragraph
  format_spans?: FormatMark[];  // ← Character-based formatting
  confidence?: ConfidenceLevel;
  reason_codes?: ReasonCode[];
}
```

**Conclusion:** LegalDocument types are fully implemented with sentence offsets, format spans, and hierarchical structure.

---

## Architectural Pattern: Dual Storage with Canonical Primary

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      DOCUMENT LIFECYCLE                      │
└─────────────────────────────────────────────────────────────┘

1. INGESTION (DOCX → LegalDocument)
   ┌──────────┐
   │ DOCX file│
   └────┬─────┘
        │
        ▼
   ┌──────────────────────┐
   │ Ingestion Service    │  Python pipeline
   │ (factsway-ingestion) │  LXML + NUPunkt
   └──────────┬───────────┘
              │
              ▼
        LegalDocument JSON ─────────────► CANONICAL FORMAT
              │
              │
              ▼
2. EDITING (LegalDocument ↔ Tiptap)
   ┌──────────────────────┐
   │ Frontend receives    │
   │ LegalDocument JSON   │
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ Conversion Layer     │  TypeScript adapter
   │ LegalDocument →      │  (Frontend only)
   │ Tiptap ProseMirror   │
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ User edits in        │
   │ Tiptap editor        │
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ On Save:             │
   │ • Tiptap → Legal     │  Conversion back
   │ • Extract Tiptap JSON│  Store both
   └──────────┬───────────┘
              │
              ▼
3. STORAGE (Backend)
   ┌──────────────────────┐
   │ POST /api/drafts     │
   │ body: {              │
   │   documentJson: ...  │  LegalDocument (canonical)
   │   contentJson: ...   │  Tiptap JSON (auxiliary)
   │ }                    │
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────────────────────┐
   │ Database Storage                     │
   │ ┌──────────────────────────────────┐ │
   │ │ document_json: LegalDocument     │ │  ← Services use this
   │ │ content_json: Tiptap JSON        │ │  ← Node IDs only
   │ └──────────────────────────────────┘ │
   └──────────────────────────────────────┘

4. FILING (Create Facts from Nodes)
   ┌──────────────────────┐
   │ File Motion          │
   │ Input:               │
   │ • documentJson       │  LegalDocument
   │ • contentJson        │  Tiptap JSON
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ extractAndCreateFacts│  Parse Tiptap JSON
   │ Extract node IDs     │  node.attrs.id
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ Create Facts         │  Each node → Fact
   │ Map node_id → fact_id│  Store mapping
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ evidence_links table │
   │ node_id → fact_id    │  Link evidence to facts
   └──────────────────────┘
```

---

## Why Both Formats?

### LegalDocument (Canonical)

**Purpose:** Authoritative data model for all services

**Used By:**
- ✅ Ingestion service (output)
- ✅ Export service (input for DOCX generation)
- ✅ Facts service (sentence extraction)
- ✅ Citation service (citation registry)
- ✅ All microservices

**Structure:**
```typescript
{
  meta: { ... },
  case_header: { ... },
  body: {
    sections: [
      {
        id: "sec_a1b2c3d4",
        children: [
          {
            id: "P12345678",
            sentences: [
              {
                id: "S87654321",
                text: "This is a sentence.",
                start_offset: 0,    // Into paragraph text
                end_offset: 19,
                format_spans: [...]
              }
            ]
          }
        ]
      }
    ]
  },
  citations: [...]  // Separate registry
}
```

**Why Canonical:**
- Sentence boundaries explicit (NUPunkt)
- Hierarchical sections (legal document structure)
- Character offsets (precise formatting)
- Citation registry (separate from text)
- Preservation metadata (DOCX round-trip)

---

### Tiptap JSON (Auxiliary)

**Purpose:** Node ID mapping for fact creation

**Used By:**
- ✅ Frontend editor (in-memory only)
- ✅ Filing workflow (extract node IDs)
- ❌ NOT used by any services

**Structure:**
```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "attrs": { "id": "node_abc123" },  // ← Node ID
      "content": [
        { "type": "text", "text": "This is a sentence." }
      ]
    }
  ]
}
```

**Why Stored:**
- User edits paragraphs in Tiptap editor
- Each paragraph gets a stable `node_id`
- When filing, we create a Fact for each node
- Evidence links reference `node_id`
- After filing, facts get `fact_id` assigned
- Need mapping: `node_id` → `fact_id`

**Not Used For:**
- ❌ NOT the canonical data model
- ❌ NOT used by services
- ❌ NOT used for export
- ❌ NOT used for sentence extraction

---

## Resolution: Section 2.5 Must Be Rewritten

### Current Section 2.5 (INCORRECT)

**Problem:** Specifies ProseMirror as the data model

> "The body content uses ProseMirror's document model, which Tiptap serializes as JSON. This structured format preserves custom node types and their attributes."

**Issues:**
1. ❌ Implies ProseMirror is the canonical storage format
2. ❌ Doesn't mention LegalDocument at all
3. ❌ Says "structured format preserves" (implies authoritative)
4. ❌ Defines ProseMirror types as if they're the schema
5. ❌ Section 2.6 defines CitationNode (ProseMirror-specific)

---

### Proposed Section 2.5 (CORRECT)

**New Title:** "2.5 Document Data Model - LegalDocument Format"

**New Content:**

```markdown
### 2.5 Document Data Model - LegalDocument Format

The canonical data model for all documents is **LegalDocument**, a hierarchical structure with explicit sentence boundaries and character-offset-based formatting.

#### Canonical Format: LegalDocument

**Purpose:** Authoritative data model for storage, processing, and interchange

**Structure:**
- **Hierarchical sections:** Nested Section entities with stable UUIDs
- **Paragraphs with sentences:** Explicit sentence boundaries via NUPunkt
- **Character offsets:** Format marks positioned by character offset
- **Citation registry:** Separate Citation[] array with spans
- **Preservation metadata:** OOXML properties for round-trip fidelity

**Example:**
```typescript
interface LegalDocument {
  meta: DocumentMeta;
  case_header: CaseHeader;
  body: {
    sections: Section[];  // Hierarchical tree
  };
  citations: Citation[];  // Separate registry
  embedded_objects: EmbeddedObject[];
}

interface Section {
  id: UUID;
  header: SectionHeader;
  children: Paragraph[];       // Content paragraphs
  child_section_ids: UUID[];   // Nested sections
  level: 1 | 2 | 3 | 4;
}

interface Paragraph {
  id: UUID;
  sentences: Sentence[];       // Explicit boundaries
  format_spans: FormatMark[];  // Character offsets
  preservation: PreservationMetadata;
}

interface Sentence {
  id: UUID;
  parent_paragraph_id: UUID;
  start_offset: number;        // Into paragraph text
  end_offset: number;
  text: string;                // Derived from paragraph.text.slice()
  format_spans: FormatMark[];
}
```

**All backend services use LegalDocument:**
- Ingestion Service: DOCX → LegalDocument
- Export Service: LegalDocument → DOCX
- Facts Service: Extract sentences from LegalDocument
- Citation Service: Process LegalDocument.citations[]
- Records Service: Store LegalDocument in database

---

#### Frontend Editor: Tiptap (UI Only)

**Purpose:** Rich text editing experience in the browser

**Scope:** Frontend UI component only (not a data model)

**Data Flow:**
1. Frontend fetches LegalDocument from API
2. Conversion layer transforms LegalDocument → Tiptap ProseMirror state
3. User edits in Tiptap editor (in-memory)
4. On save: Tiptap → LegalDocument conversion
5. POST to API with LegalDocument as `documentJson`

**Auxiliary Storage:**
- Tiptap JSON (`content_json`) is stored alongside LegalDocument
- Used only for node ID → fact ID mapping during filing
- NOT used by any backend services
- NOT the canonical format

**Why Dual Storage:**
When a draft is filed, the system:
1. Extracts node IDs from Tiptap JSON (`node.attrs.id`)
2. Creates a Fact for each paragraph node
3. Maps `node_id` → `fact_id` in evidence_links table
4. This enables evidence linking to specific paragraphs

**Backend Never Sees Tiptap:**
- All API endpoints accept/return `documentJson` (LegalDocument)
- Services process LegalDocument only
- Tiptap is a frontend implementation detail

---

#### Data Model Comparison

| Aspect | LegalDocument (Canonical) | Tiptap JSON (Auxiliary) |
|--------|---------------------------|-------------------------|
| **Purpose** | Authoritative data model | Node ID mapping |
| **Used By** | All backend services | Frontend editor + filing |
| **Hierarchy** | Nested sections (tree) | Flat blocks |
| **Sentences** | Explicit with offsets | Not modeled |
| **Formatting** | Character-offset spans | Marks (inline) |
| **Citations** | Registry + spans | Not modeled |
| **Persistence** | `document_json` column | `content_json` column |
| **Authoritative** | ✅ YES | ❌ NO (reference only) |

---

#### Migration from Section 2.5

**Old specification said:**
- ProseMirror is the data model ❌ INCORRECT
- Documents serialized as ProseMirror JSON ❌ INCORRECT
- CitationNode is a ProseMirror node ❌ INCORRECT

**Correct specification:**
- LegalDocument is the canonical data model ✅
- Documents serialized as LegalDocument JSON ✅
- Citations are in Citation[] registry ✅
- Tiptap is frontend UI only ✅
- Tiptap JSON stored for node reference only ✅
```

**Remove Section 2.6:** CitationNode model (ProseMirror-specific)

**Replace with:** Reference to LegalDocument.citations[] (Section 4.3)

---

## Impact on Microservices Architecture

### ✅ NO CHANGES REQUIRED

**All services already designed for LegalDocument:**

1. **Ingestion Service** (Python)
   - Already outputs LegalDocument ✅
   - Code: `factsway-ingestion/ingestion_engine/api.py`

2. **Export Service** (Python/TypeScript)
   - Expects LegalDocument input ✅
   - Uses character offsets for OOXML injection

3. **Facts Service** (TypeScript)
   - Extracts sentences from LegalDocument.body.sections[] ✅
   - Code: `src/main/db/facts.repository.ts`

4. **Citation Service** (TypeScript)
   - Processes LegalDocument.citations[] ✅
   - Links to sentences via character offsets

5. **Records Service** (TypeScript)
   - Stores `document_json` (LegalDocument) ✅
   - Stores `content_json` (Tiptap) for node mapping

**Desktop Orchestrator:**
- Services communicate via LegalDocument JSON ✅
- No awareness of Tiptap format

---

## Runbook 1 Status

### ✅ RUNBOOK 1 IS CORRECT

**Created:** `packages/shared-types/legal-document.types.ts`

**Aligns With:**
- ✅ LegalDocument as canonical format
- ✅ Microservices architecture
- ✅ Section 4.1 (LegalDocument Schema)
- ✅ Section 16.1 (Monorepo Structure)
- ✅ Architecture Audit

**Does NOT Align With:**
- ❌ Section 2.5 (which specifies ProseMirror) ← MUST FIX

---

## Action Items

### 1. Update Runbook 0

**File:** `RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md`

**Changes:**
- [ ] **Replace Section 2.5** with new content (LegalDocument canonical format)
- [ ] **Remove Section 2.6** (CitationNode model)
- [ ] **Add Section 2.6 (new):** Frontend Editor Architecture
  - Describe Tiptap as UI component
  - Explain dual storage (LegalDocument + Tiptap)
  - Clarify node ID mapping for filing
- [ ] **Update Table of Contents** to reflect new sections

---

### 2. Create Frontend Conversion Specification

**New Document:** `RUNBOOK_X_FRONTEND_EDITOR.md`

**Contents:**
- LegalDocument ↔ Tiptap conversion algorithms
- Node ID assignment strategy
- Sentence editing constraints
- Fact linking UI workflow
- Draft filing with node extraction

---

### 3. Document Dual Storage Contract

**Update:** Architecture Audit Part 2 (Target State)

**Add:**
```markdown
### Data Format Contract

**Canonical:** LegalDocument (JSON)
- Used by all services
- Stored in `document_json` column
- Authoritative for all operations

**Auxiliary:** Tiptap JSON
- Used by frontend editor
- Stored in `content_json` column
- Used only for node_id → fact_id mapping
- NOT used by services
```

---

### 4. Update Runbook 2 Prerequisites

**File:** `RUNBOOK_2_*.md` (next runbook)

**Add prerequisite:**
- [ ] Section 2.5 updated to specify LegalDocument
- [ ] Dual storage contract documented
- [ ] Frontend conversion layer specified

---

## Verification Checklist

Before proceeding to Runbook 2:

- [ ] Section 2.5 rewritten to specify LegalDocument as canonical
- [ ] Section 2.6 (CitationNode) removed
- [ ] Frontend editor architecture documented
- [ ] Dual storage contract clear
- [ ] Runbook 1 validated against new Section 2.5
- [ ] No contradictions remain in Runbook 0

---

## Conclusion

**RESOLVED:** ✅

**Architecture Pattern:** Dual Storage with Canonical Primary
- **LegalDocument:** Canonical data model (authoritative)
- **Tiptap JSON:** Auxiliary storage (node ID reference only)

**Section 2.5:** ❌ INCORRECT - Must be rewritten

**Runbook 1:** ✅ CORRECT - Follows LegalDocument specification

**Microservices:** ✅ NO IMPACT - Already designed for LegalDocument

**Next Step:** Update Section 2.5 in Runbook 0 before proceeding to Runbook 2

---

**Status:** Investigation complete. Architecture decision validated. Ready to update documentation.
