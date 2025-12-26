# Runbook 0 Critical Issues - Summary & Resolution

**Date:** December 26, 2025
**Status:** 🟡 **ACTION REQUIRED**
**Priority:** BLOCKING - Cannot proceed to Runbook 2

---

## Issues Identified

Three critical analysis documents have been created:

1. **[RUNBOOK_ASSESSMENT.md](./RUNBOOK_ASSESSMENT.md)** - Runbook 1 vs Runbook 0 plan
2. **[PROSEMIRROR_VS_LEGALDOCUMENT_ANALYSIS.md](./PROSEMIRROR_VS_LEGALDOCUMENT_ANALYSIS.md)** - Data model contradiction
3. **[PROSEMIRROR_RESOLUTION_FINAL.md](./PROSEMIRROR_RESOLUTION_FINAL.md)** - Investigation results & resolution

---

## Issue #1: Contradictory Architectures in Runbook 0

**Location:** `RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md`

**Problem:** Runbook 0 contains TWO contradictory architecture specifications:

### Specification A: Browser-Based (Lines 1-400)
- Single FastAPI backend
- localStorage persistence
- Runbook 1 should create `reference.docx`

### Specification B: Microservices (Lines 200-10240)
- 8 microservices architecture
- Desktop orchestrator
- Monorepo structure
- Runbook 1 should create TypeScript types

**Actual Runbook 1:** Follows Specification B (100% alignment)

**Impact:**
- ❌ Violates stated runbook plan (Section 1.4)
- ❌ Runbook 2 prerequisites undefined
- ✅ Aligns with Architecture Audit
- ✅ Follows modern architecture

**Resolution:** ✅ COMMIT TO MICROSERVICES (Spec B)

---

## Issue #2: ProseMirror vs LegalDocument Data Model

**Location:** `RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md` Section 2.5

**Problem:** Section 2.5 specifies ProseMirror as the data model, contradicting LegalDocument used throughout the rest of the spec.

**Evidence:**
- Section 2.5 (Lines 811-870): "ProseMirror document model, which Tiptap serializes as JSON"
- Section 4.1+: LegalDocument with hierarchical sections
- Runbook 1: Creates LegalDocument TypeScript types
- All microservices: Expect LegalDocument format

**Code Investigation Results:**
```
✅ Ingestion Service: Returns LegalDocument ONLY
✅ Backend Storage: document_json = LegalDocument (canonical)
✅ Backend Storage: content_json = Tiptap JSON (auxiliary for node IDs)
✅ API Routes: Accept/return documentJson (LegalDocument)
✅ TypeScript Types: LegalDocument fully defined
✅ Python Types: LegalDocument fully defined
```

**Resolution:** ✅ DUAL STORAGE WITH LEGALDOCUMENT CANONICAL
- LegalDocument is the authoritative data model
- Tiptap JSON stored alongside for node ID mapping only
- Section 2.5 must be rewritten

---

## Resolution Summary

### ✅ DECISIONS MADE (Based on Code Evidence)

1. **Architecture:** Microservices (Specification B)
   - 8 services as specified in Section 16
   - Desktop orchestrator
   - Monorepo structure
   - Keep Runbook 1 as-is (it's correct)

2. **Data Model:** LegalDocument (Canonical)
   - All services process LegalDocument
   - Tiptap is frontend UI only
   - Tiptap JSON stored for node reference
   - Section 2.5 must be rewritten

3. **Runbook Plan:** Update to microservices sequence
   - Replace browser-based runbook plan
   - Follow Architecture Audit structure
   - Align with Section 16 deployment models

---

## Required Actions

### 🔴 CRITICAL: Update Runbook 0

**File:** `RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md`

#### Change 1: Replace Section 1.4 (Runbook Execution Plan)

**OLD Plan (Browser-Based):**
```
1. Reference Document (reference.docx)     ← Contradicts Runbook 1
2. OOXML Generators (Python)
3. Pandoc Integration
...
```

**NEW Plan (Microservices):**
```
1. Reference Document (TypeScript types)    ← Matches Runbook 1 ✅
2. Database Schema (SQLite + PostgreSQL)
3. Records Service (first microservice)
4. Ingestion Service (DOCX → LegalDocument)
5. Export Service (LegalDocument → DOCX)
6. Specialized Services (caseblock, signature, facts, exhibits, caselaw)
7. Desktop Orchestrator (child process management)
8. Frontend UI (Electron + Vue)
9. Service Discovery & Configuration
10. Desktop Packaging (pkg + PyInstaller)
11. Web Trial (freemium deployment)
12. Mobile Integration
13. Enterprise Deployment (Kubernetes)
14. Evidence System Integration
15. End-to-End Testing & Documentation
```

---

#### Change 2: Replace Section 2.5 (Document Content Model)

**OLD Section 2.5 (Lines 811-870):**
```markdown
### 2.5 Document Content Model

The body content uses ProseMirror's document model, which Tiptap
serializes as JSON. This structured format preserves custom node
types and their attributes.

[... defines ProseMirror types ...]
```

**NEW Section 2.5:**
```markdown
### 2.5 Document Data Model - LegalDocument Format

The canonical data model for all documents is **LegalDocument**, a
hierarchical structure with explicit sentence boundaries and
character-offset-based formatting.

#### Canonical Format: LegalDocument

**Purpose:** Authoritative data model for storage, processing, and interchange

**Structure:**
- Hierarchical sections with stable UUIDs
- Paragraphs with explicit sentence boundaries (NUPunkt)
- Character-offset-based format marks
- Citation registry (separate from text)
- Preservation metadata for DOCX round-trip

**All backend services use LegalDocument:**
- Ingestion Service: DOCX → LegalDocument
- Export Service: LegalDocument → DOCX
- Facts Service: Extract sentences from LegalDocument
- Citation Service: Process LegalDocument.citations[]

#### Frontend Editor: Tiptap (UI Only)

**Purpose:** Rich text editing experience (frontend only)

**Data Flow:**
1. Frontend fetches LegalDocument from API
2. Conversion layer: LegalDocument → Tiptap state
3. User edits in Tiptap editor (in-memory)
4. On save: Tiptap → LegalDocument
5. POST to API with LegalDocument

**Auxiliary Storage:**
- Tiptap JSON stored in content_json column
- Used only for node_id → fact_id mapping during filing
- NOT used by backend services
- NOT the canonical format

See PROSEMIRROR_RESOLUTION_FINAL.md for complete details.
```

---

#### Change 3: Remove Section 2.6 (Citation Node Model)

**DELETE:** Lines 871-960 (CitationNode as ProseMirror node)

**REASON:** Citations are in LegalDocument.citations[] registry, not ProseMirror nodes

**REPLACE WITH:** Reference to Section 4.3 (Citation Linking)

---

#### Change 4: Update Section 18.1 (Runbook 1 Verification)

**OLD Verification:**
```
Runbook 1: Reference Document
- [ ] reference.docx opens in Microsoft Word without errors
- [ ] "Normal" style: Times New Roman, 12pt, double-spaced
- [ ] "Heading 1" style: Centered, bold, caps
```

**NEW Verification:**
```
Runbook 1: Reference Document - LegalDocument Types & Schema
- [ ] packages/shared-types/ directory created
- [ ] legal-document.types.ts defines LegalDocument interface
- [ ] TypeScript types match Python types in ingestion service
- [ ] Sentence interface has start_offset, end_offset
- [ ] Paragraph interface has format_spans
- [ ] Citation interface includes character_offset
- [ ] Section interface supports hierarchical children
- [ ] npm test passes in packages/shared-types/
```

---

### 🟡 RECOMMENDED: Create New Documents

#### 1. Frontend Conversion Specification

**File:** `docs/FRONTEND_EDITOR_CONVERSION.md`

**Contents:**
- LegalDocument ↔ Tiptap conversion algorithms
- Node ID assignment strategy
- Sentence boundary preservation during editing
- Fact linking UI workflow
- Draft filing with node extraction

---

#### 2. Dual Storage Contract

**File:** `docs/DUAL_STORAGE_CONTRACT.md`

**Contents:**
```markdown
## Data Storage Contract

### Primary: document_json (LegalDocument)
- Canonical format
- Used by all backend services
- Authoritative for all operations
- Required field in database

### Auxiliary: content_json (Tiptap JSON)
- Frontend editor state
- Optional field in database
- Used only for node_id → fact_id mapping
- NOT processed by services
- Can be null (won't break services)

## Service Contract
All services MUST:
- Accept LegalDocument format
- Return LegalDocument format
- Ignore content_json field
- Never depend on Tiptap structure

Frontend MUST:
- Convert LegalDocument ↔ Tiptap
- Preserve sentence boundaries during editing
- Maintain stable node IDs for fact linking
- Send LegalDocument to API (not Tiptap)
```

---

### 🟢 OPTIONAL: Archive Old Specifications

**Create:** `Archived/BROWSER_BASED_SPEC.md`

**Move:**
- Old Section 1.4 (browser-based runbook plan)
- References to localStorage
- Single FastAPI backend specs
- Pandoc-centric architecture

**Purpose:** Preserve historical context without cluttering active spec

---

## Verification Before Proceeding to Runbook 2

**Checklist:**

- [ ] **Section 1.4:** Updated to microservices runbook plan
- [ ] **Section 2.5:** Rewritten to specify LegalDocument as canonical
- [ ] **Section 2.6:** Removed (CitationNode model)
- [ ] **Section 18.1:** Updated verification criteria for Runbook 1
- [ ] **Runbook 1:** Validated against new specifications (no changes needed)
- [ ] **No contradictions:** Single architecture throughout document
- [ ] **Data model clear:** LegalDocument canonical, Tiptap auxiliary
- [ ] **Frontend contract:** Conversion layer responsibility defined

---

## Impact Assessment

### ✅ NO CODE CHANGES REQUIRED

**Current implementation is correct:**
- Ingestion service returns LegalDocument ✅
- Backend stores both formats correctly ✅
- API routes use documentJson ✅
- Types defined for LegalDocument ✅
- Filing extracts node IDs correctly ✅

**Only documentation needs updating:**
- Runbook 0 specifications
- Architecture diagrams
- Service interface contracts

---

### ✅ Runbook 1 is VALID

**Created:** `packages/shared-types/legal-document.types.ts`

**Status:** COMPLETE ✅

**Alignment:**
- Follows LegalDocument specification (Section 4.1) ✅
- Matches microservices architecture (Section 16) ✅
- Aligns with Architecture Audit ✅
- TypeScript types match Python implementation ✅

**No changes needed to Runbook 1.**

---

### ⚠️ Runbook 2 is BLOCKED

**Cannot proceed until:**
- Runbook 0 contradictions resolved
- Data model clearly specified
- Runbook plan aligned with architecture

**Once resolved:**
- Runbook 2 can proceed with clear contracts
- No ambiguity about data formats
- Clear service boundaries

---

## Files Created

**Analysis Documents:**
1. ✅ `RUNBOOK_ASSESSMENT.md` (445 lines)
   - Compares Runbook 1 vs Runbook 0 plan
   - Identifies architectural contradictions
   - Provides resolution options

2. ✅ `PROSEMIRROR_VS_LEGALDOCUMENT_ANALYSIS.md` (503 lines)
   - Detailed comparison of data models
   - Incompatibility analysis
   - Investigation commands provided

3. ✅ `PROSEMIRROR_RESOLUTION_FINAL.md` (this document)
   - Code investigation results
   - Architectural pattern explanation
   - Concrete action items

4. ✅ `RUNBOOK_0_ISSUES_SUMMARY.md` (this file)
   - Executive summary
   - Consolidated action items
   - Verification checklist

---

## Next Steps

### Immediate (Required)

1. **Read all analysis documents** (estimated 30 minutes)
   - RUNBOOK_ASSESSMENT.md
   - PROSEMIRROR_VS_LEGALDOCUMENT_ANALYSIS.md
   - PROSEMIRROR_RESOLUTION_FINAL.md

2. **Update Runbook 0** (estimated 2-3 hours)
   - Replace Section 1.4 (runbook plan)
   - Replace Section 2.5 (data model)
   - Remove Section 2.6 (CitationNode)
   - Update Section 18.1 (verification)

3. **Validate changes** (estimated 30 minutes)
   - Check no contradictions remain
   - Verify Runbook 1 aligns
   - Confirm microservices architecture consistent

### Short-term (Recommended)

4. **Create frontend conversion spec** (estimated 4 hours)
   - Document LegalDocument ↔ Tiptap algorithms
   - Define node ID assignment
   - Specify sentence editing constraints

5. **Document dual storage contract** (estimated 1 hour)
   - Clarify canonical vs auxiliary
   - Service interface contracts
   - Frontend responsibilities

### Long-term (Optional)

6. **Archive old specifications** (estimated 1 hour)
   - Move browser-based specs to Archived/
   - Preserve historical context
   - Clean up active documentation

---

## Success Criteria

**Documentation Fixed:**
- ✅ Single architecture throughout Runbook 0
- ✅ Data model clearly specified (LegalDocument canonical)
- ✅ Runbook plan aligns with microservices
- ✅ No contradictions between sections

**Implementation Validated:**
- ✅ Code already follows correct architecture
- ✅ No code changes needed
- ✅ Runbook 1 complete and correct

**Ready to Proceed:**
- ✅ Runbook 2 prerequisites clear
- ✅ Service contracts defined
- ✅ No blocking issues remain

---

## Conclusion

**Current Status:**
- ✅ Code implementation is CORRECT
- ❌ Documentation has contradictions
- 🟡 Update Runbook 0 before proceeding

**Resolution:**
- Commit to microservices architecture
- Specify LegalDocument as canonical
- Update runbook plan accordingly
- Document dual storage pattern

**Impact:**
- Zero code changes required
- Documentation update only
- Clear path forward

**Timeline:**
- Updates: 3-4 hours
- Validation: 30 minutes
- Ready to proceed to Runbook 2

---

**All analysis documents available in:**
`/Users/alexcruz/Documents/4.0 UI and Backend 360/Runbooks/`

**Status:** ✅ Investigation complete, resolution defined, action items clear
