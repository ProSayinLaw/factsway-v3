# INVESTIGATOR V2 - NEW QUESTIONS RESOLVED

**Date:** December 27, 2024
**Session:** 19
**Status:** ✅ ALL 3 NEW QUESTIONS RESOLVED
**Purpose:** Formal documentation of resolutions for NEW-Q1, NEW-Q2, NEW-Q3

---

## Overview

Investigator V2 identified 3 new questions from corrected architecture understanding. All 3 were resolved through user clarification during Session 19.

---

## NEW-Q1: Evidence Linking Flow Across Services ✅ RESOLVED

### The Question (CRITICAL)

**Original:** How do Facts Service (sentence registry) and Exhibits Service (vault storage) coordinate evidence linking? Which service is authoritative for claim-to-document associations?

**Why It Mattered:** Facts Service manages claims (NOT vault-dependent) but evidence linking requires coordination with Exhibits Service (vault references). Unclear which service stores the links.

### The Resolution

**User Clarification (Session 19):**

> "The Exhibits clerk manages basically the object that is within a document being drafted. That object can connect on one side to sentences or a sentence within a motion being drafted, which is effectively a claim. And on the other side, specific document ID numbers that are associated with a document that's uploaded into the vault."

**Architecture:**

**Exhibits Service is authoritative for claim-to-document links.**

### Exhibit Object Structure

```typescript
interface ExhibitObject {
  id: string;                // ULID
  draft_id: string;          // Which motion draft
  sentence_ids: string[];    // Claims in motion (optional)
  document_ids: string[];    // Vault document IDs (optional)
  created_at: string;
  updated_at: string;
}
```

### Three Possible States

| State | sentence_ids | document_ids | Display | Export |
|-------|--------------|--------------|---------|--------|
| **Standalone** | [] | [] | No label yet | Nothing in appendix |
| **Claim-linked** | [s1, s2] | [] | "See Exhibit [?]" | Placeholder warning |
| **Document-linked** | [] | [d1] | Orphaned | Doc in appendix (no inline ref) |
| **Fully-linked** | [s1, s2] | [d1, d2] | "See Exhibit A" | Docs in appendix + inline citations |

### Service Coordination Flow

**Upload Workflow:**
```
User: "Attach Exhibit"
  ↓
Renderer → Orchestrator: "Upload exhibit for draft_id"
  ↓
Orchestrator → Records Service: "Store PDF in vault"
  ↓
Records Service: Store bytes, index pages, return document_id
  ↓
Records Service → Orchestrator: document_id="doc_456"
  ↓
Orchestrator → Exhibits Service: "Create exhibit with document_id=doc_456"
  ↓
Exhibits Service: Store reference (document_id only, NOT bytes)
  ↓
Exhibits Service → Orchestrator: exhibit_id="ex_789"
  ↓
Orchestrator → Renderer: "Success"
```

**Export Workflow:**
```
User: "Export motion with exhibits"
  ↓
Renderer → Orchestrator: "Export draft_id with exhibits"
  ↓
Orchestrator → Exhibits Service: "What's in appendix?"
  ↓
Exhibits Service: Query objects, organize, determine labels (A, B, C)
  ↓
Exhibits Service → Orchestrator:
  [
    {label: "A", document_ids: ["doc_456"]},
    {label: "B", document_ids: ["doc_789", "doc_012"]}
  ]
  ↓
Orchestrator → Records Service: "Get vault docs for IDs: [doc_456, ...]"
  ↓
Records Service: Retrieve bytes from vault (ONLY extraction point)
  ↓
Records Service → Orchestrator: Document bytes
  ↓
Orchestrator → Export Service: "Assemble DOCX with exhibit docs"
  ↓
Export Service: Assemble final DOCX
  ↓
Export Service → Orchestrator: Final DOCX bytes
  ↓
Orchestrator → Renderer: Download
```

### Critical Architectural Rules

1. **Exhibit labels (A, B, C) are DYNAMIC** - Determined by position during export, NOT stored
2. **Exhibits Service stores REFERENCES only** - document_ids, never bytes
3. **Records Service is authoritative for document IDs** - Only Records manages vault
4. **Exhibits Service CANNOT pull from vault** - Can only reference by ID
5. **ONLY Orchestrator can request vault bytes** - Single extraction path (security)
6. **Services NEVER call each other** - ALL coordination through Orchestrator

### Facts Service Role

**Facts Service manages claims (sentences in motion being drafted):**
- Extracts claims from DOCX uploads
- Stores claim metadata (AlphaFacts model: Claim + ClaimAnalysis)
- **NOT vault-dependent** - operates on draft content only
- Provides sentence_ids that Exhibits Service references

**Data Flow:**
```
Facts Service → sentence_ids → Exhibits Service stores link
```

### Edge Cases Handled

**Vault document deleted:**
- Exhibit object keeps document_id
- Export fails with "Document not found" error
- User prompted to remove exhibit or upload replacement

**Sentence deleted:**
- Exhibit object keeps sentence_id
- Inline citation removed from export
- Exhibit still appears in appendix (orphaned)

**Standalone exhibit (neither linked):**
- Exists in database
- Doesn't affect export (no appendix entry)
- User can link later

### Implementation Requirements

**Exhibits Service must:**
- Store exhibit objects with sentence_ids + document_ids
- Communicate with Orchestrator ONLY (never Records directly)
- Return document_ids to Orchestrator during export
- Determine exhibit labels (A, B, C) based on draft order

**Orchestrator must:**
- Mediate exhibit upload (Records → Exhibits)
- Mediate exhibit export (Exhibits → Records → Export)
- Be ONLY service that requests vault bytes
- Enforce service isolation

**Records Service must:**
- Store vault documents (bytes + metadata)
- Index pages (page-level addressability)
- Provide document_ids to Orchestrator
- ONLY give bytes to Orchestrator (not to other services)

### Resolution Status

✅ **RESOLVED** - Exhibits Service is authoritative for links
✅ **DOCUMENTED** - Service coordination flows defined
✅ **ARCHITECTED** - Orchestrator mediation pattern clear
✅ **SECURED** - Vault access restricted to Orchestrator

---

## NEW-Q2: PDF Ingestion Scope Clarification ✅ RESOLVED

### The Question (HIGH)

**Original:** Session 19 added "PDF ingestion IS in scope for vault storage." What are the complete requirements? OCR support? Page extraction? Bates numbering? Full-text search?

**Why It Mattered:** "PDF ingestion" could mean anything from basic upload to full text extraction. Unclear scope could lead to over/under-engineering.

### The Resolution

**User Clarification (Session 19):**

> "Right now, users need to be able to upload documents as PDF into the vault. That's a fundamental component... The records clerk needs to deconstruct it at least at first here, possibly just by indexing. Index every single page in a document to where each page has a unique ID... down to as granular as the page within a document. Not yet the paragraph or sentence."

**Current Scope (Runbooks 1-15):**

### ✅ IN SCOPE

**1. PDF Upload to Vault**
- User uploads PDF file
- Records Service stores in vault
- Immutable storage (cannot edit after upload)

**2. Page-Level Indexing**
- Each page gets unique page_id (ULID)
- Page numbering (1, 2, 3, ...)
- Page count stored

**3. Document Categorization**
- Type: pleading | exhibit | deposition | affidavit | other
- User provides description ("Opposing party's MSJ with exhibits")
- Upload date and user metadata

**4. Bates Numbering (Optional)**
- User can apply Bates numbers to pages
- Format: "DEF-000001", "000001", custom prefix
- Stored as page metadata

**5. Document Metadata**
- Document name
- Upload date
- User description
- Document type/category
- Page count

**6. Page-Level Addressability**
- Can reference specific pages: "Page 15 of Plaintiff's Original Petition"
- Page IDs enable granular citations
- Bates numbers enable legal citations

### ❌ OUT OF SCOPE (Future Work)

**1. Sentence/Paragraph Deconstruction**
- Deconstructing pleadings into sentences: FUTURE
- Granular fact extraction from uploaded pleadings: FUTURE
- Cross-referencing claims across pleadings: FUTURE

**2. OCR (Optical Character Recognition)**
- Scanned document text extraction: FUTURE
- Image-to-text conversion: FUTURE
- Searchable PDFs from images: FUTURE

**3. Full-Text Search**
- Search across vault documents: FUTURE
- Text indexing: FUTURE
- Keyword search: FUTURE

**4. Automated Bates Numbering**
- Auto-applying Bates to all documents: FUTURE
- Sequential Bates across case: FUTURE
- Current: User manually applies if needed

### PDF Ingestion Architecture

**Data Model:**
```typescript
interface VaultDocument {
  document_id: string;        // ULID
  name: string;               // "Plaintiff's Original Petition.pdf"
  type: DocumentType;         // 'pleading' | 'exhibit' | 'deposition' | etc.
  uploaded_at: string;        // ISO timestamp
  user_description: string;   // Free-form description
  pages: Page[];              // Page array
}

interface Page {
  page_id: string;            // ULID
  document_id: string;        // Parent document
  page_number: number;        // 1, 2, 3, ...
  bates_number?: string;      // Optional: "DEF-000001"
}
```

**Upload Flow:**
```
User uploads "Plaintiff_Original_Petition.pdf" (50 pages)
  ↓
Records Service:
  1. Generate document_id (ULID)
  2. Store PDF bytes in vault
  3. Extract page count (50 pages)
  4. Generate 50 page_ids (ULIDs)
  5. Create page metadata (page_number: 1-50)
  6. Optional: User applies Bates numbers
  7. Store document metadata
  ↓
Result:
  - document_id: "01ARZ3NDEK..."
  - 50 pages, each with page_id
  - User can reference: "Page 15 of Plaintiff's Original Petition"
```

### Use Case Examples

**Exhibit Upload:**
```
User: "Upload deposition transcript"
Records Service:
  - Store 200-page PDF
  - Index pages 1-200
  - Each page: unique page_id
  - User adds Bates: "DEP-000001" through "DEP-000200"

Exhibits Service can reference:
  - "Page 47 (Bates: DEP-000047) of Smith Deposition"
```

**Pleading with Exhibits:**
```
User: "Upload Plaintiff's MSJ with exhibits"
Records Service:
  - Store 75-page PDF
  - Pages 1-12: Actual pleading
  - Pages 13-75: Exhibits A-D
  - All 75 pages indexed separately

Future enhancement (out of current scope):
  - Pleading body (pages 1-12) deconstructed into sentences
  - Exhibits (pages 13-75) remain page-level indexed
```

### Vault Security Architecture

**Immutability:**
- Documents NEVER edited after upload
- Can annotate (notes), but cannot modify bytes
- Can delete (logged), but cannot change

**Access Control:**
- ONLY Orchestrator can extract bytes
- Single extraction path (security compliance)
- All vault access logged (audit trail)

**Isolation:**
- Multiple insulation layers from LLM
- Services store document_ids (references), never bytes
- Exhibits Service: references only
- Export Service: receives bytes FROM Orchestrator

### Implementation Requirements

**Records Service must:**
- Accept PDF upload
- Extract page count (using PDF library)
- Generate page_id for each page (ULID)
- Store PDF bytes in vault
- Return document_id to caller (via Orchestrator)
- Support Bates number metadata (optional)

**Ingestion Service must:**
- Handle both DOCX and PDF
- DOCX: Full parsing → LegalDocument
- PDF: Page-level indexing only (current scope)

**Future Pipeline (out of scope):**
- PDF pleading → sentence deconstruction
- OCR for scanned documents
- Full-text search indexing

### Resolution Status

✅ **RESOLVED** - Scope is page-level indexing only
✅ **DOCUMENTED** - Clear IN SCOPE vs OUT OF SCOPE
✅ **ARCHITECTED** - Vault security model defined
✅ **FUTURE-PROOFED** - Enhancement path documented

---

## NEW-Q3: AttachmentsClerk Functionality in Export Service ✅ RESOLVED

### The Question (MEDIUM)

**Original:** AttachmentsClerk functionality folded into Export Service. What specific features? Certificate of Service? Notice of Hearing? Affidavit generation? How are these integrated into export pipeline?

**Why It Mattered:** "Folded into Export Service" was vague. Needed clarity on what features moved and how they work.

### The Resolution

**User Clarification (Session 19):**

> "The attachments clerk was meant to be 4 things... certificate of service, notice of hearing, affidavits. And it's supposed to be integrated as something that the user can select or create new templates for things that they can attach to a pleading, and they get the option of whether or not they wanna attach that to a pleading or not based on the templates they create."

**Export Service absorbs ALL AttachmentsClerk functionality.**

### The 4 Attachment Types

**1. Certificate of Service**
- Per-party service method selection
- Service date
- Party names and roles
- Service methods: electronic, certified mail, regular mail, fax, hand delivery
- Contact info (email, address, fax)

**2. Notice of Hearing**
- Hearing date and time
- Court location
- Case number
- Motion title reference

**3. Affidavit**
- Sworn statement templates
- Affiant name and title
- Statement content (template-based)
- Notary section (if required)

**4. Custom Attachments**
- User-defined templates
- Placeholder support
- Flexible formatting

### Template Management

**Ships with Default Templates:**
- Texas Certificate of Service
- Federal Certificate of Service
- Texas Certificate of Conference
- Verification Affidavit
- Notice of Hearing

**User Can Create:**
- Unlimited custom templates
- Based on defaults or from scratch
- Reusable across cases

### Template Structure

```typescript
interface AttachmentTemplate {
  template_id: string;        // ULID
  name: string;               // "Texas Certificate of Service"
  type: 'certificate' | 'notice' | 'affidavit' | 'custom';

  content: {
    body: string;             // Template text with placeholders
    placeholders: Placeholder[];
  };

  export_behavior: {
    position: 'attached' | 'separate';
    attachment_order?: number;
  };
}

interface Placeholder {
  name: string;               // "service_date", "party_name"
  type: 'text' | 'date' | 'party' | 'attorney' | 'clerk_reference';
  clerk_reference?: {
    clerk: 'signature' | 'exhibits' | 'caselaw';
    object: 'signature_block' | 'appendix' | 'table_of_authorities';
  };
  required: boolean;
}
```

### Certificate of Service Example

**Template:**
```
CERTIFICATE OF SERVICE

I certify that a true and correct copy of the foregoing
{{motion_title}} was served on all counsel of record on
{{service_date}}:

{{served_parties}}

{{signature_block}}
```

**Data at Draft Time:**
```typescript
interface CertificateOfServiceData {
  template_id: string;
  service_date: string;      // "July 3, 2024"
  served_parties: {
    name: string;            // "John Smith"
    role: string;            // "Attorney for Defendant"
    service_method: string;  // "electronic"
    contact_info: string;    // "john@smithlaw.com"
  }[];
}
```

**Output:**
```
CERTIFICATE OF SERVICE

I certify that a true and correct copy of the foregoing
Defendant's Motion for Summary Judgment was served on
all counsel of record on July 3, 2024:

John Smith, Attorney for Defendant
Via Electronic Service
john@smithlaw.com

Jane Doe, Attorney for Intervenor
Via Certified Mail, Return Receipt Requested
123 Main Street, Dallas, TX 75201

/s/ T Nguyen
```

### Export Pipeline Integration

**The Sandwich (Default Export Order):**
```
1. CaseBlock (CaseBlock Service)
   ↓
2. Motion Body (from draft)
   ↓
3. Signature Block (Signature Service)
   ↓
4. ATTACHMENTS (Export Service) ← AttachmentsClerk features HERE
   - Certificate of Service
   - Notice of Hearing
   - Affidavits
   - Custom attachments
   (User-selectable, drag-and-drop order)
   ↓
5. Exhibit Appendix (Exhibits Service)
```

**User Workflow:**
```
User: "Export motion"
  ↓
Export Service: "Which attachments?"
  ↓
User selects:
  - [x] Certificate of Service
  - [x] Notice of Hearing
  - [ ] Affidavit (unchecked)
  ↓
User sets order (drag-and-drop):
  1. Certificate of Service
  2. Notice of Hearing
  ↓
Export Service assembles:
  1. Case Block
  2. Motion Body
  3. Signature Block
  4. Certificate of Service ← From template
  5. Notice of Hearing ← From template
  6. Exhibit Appendix
  ↓
Final DOCX → Download
```

### Clerk Reference Placeholders

**AttachmentsClerk references other clerks:**

```typescript
// Certificate of Service references signature block
{
  placeholder: "{{signature_block}}",
  clerk_reference: {
    clerk: 'signature',
    object: 'signature_block'
  }
}

// Custom attachment references exhibit appendix
{
  placeholder: "{{exhibits_appendix}}",
  clerk_reference: {
    clerk: 'exhibits',
    object: 'appendix'
  }
}
```

**Orchestrator resolves references:**
```
Export Service: "Need {{signature_block}}"
  ↓
Orchestrator → Signature Service: "Get signature block for draft_id"
  ↓
Signature Service → Orchestrator: Signature block content
  ↓
Orchestrator → Export Service: "Here's the signature block"
  ↓
Export Service: Insert into Certificate of Service
```

### Implementation Requirements

**Export Service must:**
- Store attachment templates (default + user-created)
- Manage template CRUD operations
- Resolve placeholders (including clerk references via Orchestrator)
- Allow user selection of attachments per export
- Support drag-and-drop ordering
- Assemble attachments into final DOCX

**User Interface must:**
- Template editor for creating/modifying attachments
- Checkbox selection during export
- Drag-and-drop ordering interface
- Preview of rendered attachments

**Orchestrator must:**
- Resolve clerk reference placeholders
- Coordinate between Export Service and referenced services (Signature, Exhibits, etc.)

### Data Ownership

| Component | Owner |
|-----------|-------|
| Attachment templates | Export Service |
| Template content | Export Service |
| Placeholder definitions | Export Service |
| Filled attachment data | Draft (per export) |
| Signature block content | Signature Service |
| Exhibit appendix | Exhibits Service |

### Resolution Status

✅ **RESOLVED** - Export Service owns ALL attachment functionality
✅ **DOCUMENTED** - 4 attachment types defined
✅ **ARCHITECTED** - Template system + clerk references
✅ **USER WORKFLOW** - Selection, ordering, export integration

---

## Summary: All 3 NEW Questions Resolved

| Question | Status | Resolution Source | Documentation |
|----------|--------|-------------------|---------------|
| NEW-Q1 | ✅ RESOLVED | User clarification | Exhibits Service is authoritative for links |
| NEW-Q2 | ✅ RESOLVED | User clarification | Page-level indexing only (current scope) |
| NEW-Q3 | ✅ RESOLVED | User clarification | Export Service owns all 4 attachment types |

---

## Impact on Specification Readiness

**Before Resolution:**
- Scope Definition: 80%
- Cross-Service Contracts: 70%

**After Resolution:**
- Scope Definition: **95%** ✅
- Cross-Service Contracts: **90%** ✅

**Remaining to 100%:**
- Apply RUNBOOK_0_SECTION_2_5_CORRECTED.md (data model fix)
- Create ClerkGuard Contract document
- Update microservices metadata

---

## Next Steps

**Phase 2:** Create ClerkGuard Contract document
**Phase 3:** Update microservices metadata with ClerkGuard integration

**Target:** 100% specification readiness before implementation begins

---

*These resolutions came from real user clarifications during Session 19. They represent actual architectural decisions, not theoretical scenarios.*
