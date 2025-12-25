# FACTSWAY Clerk Architecture Summary

**Created:** December 23, 2024  
**Status:** Complete (8 of 8 clerks defined)  
**Purpose:** Canonical reference for clerk responsibilities, boundaries, and data ownership

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Draft-Level Metadata](#draft-level-metadata) ✅ NEW
3. [RecordsClerk](#1-recordsclerk) ✅
4. [CaseBlockClerk](#2-caseblockcerk) ✅
5. [SignatureClerk](#3-signatureclerk) ✅
6. [ExhibitsClerk](#4-exhibitsclerk) ✅
7. [CaseLawClerk](#5-caselawclerk) ✅
8. [FactsClerk](#6-factsclerk) ✅
9. [PleadingClerk](#7-pleadingclerk) ✅
10. [AttachmentsClerk](#8-attachmentsclerk) ✅
11. [Export Order](#export-order)
12. [Cross-Clerk Coordination](#cross-clerk-coordination)
13. [LLM Touchpoints](#llm-touchpoints)

---

## Architecture Overview

### Core Principles

1. **Clerks own domains, not workflows.** Each clerk owns specific data and operations. Cross-clerk workflows are coordinated by the orchestrator.

2. **Clerks never call each other directly.** All inter-clerk communication goes through the orchestrator.

3. **Templates are clerk-owned.** Each clerk owns templates for the components they manage. Users can create unlimited templates per clerk.

4. **The Vault is immutable.** Documents in RecordsClerk's vault never change. Only annotations and selections are added.

5. **Export is assembly.** Each clerk provides its component; the orchestrator assembles the final document.

### The Sandwich (Default Export Order)

```
┌─────────────────────────┐
│  CaseBlockClerk         │  ← Case caption + salutation
├─────────────────────────┤
│  TOC (if enabled)       │  ← Auto-generated from hierarchy
├─────────────────────────┤
│  PleadingClerk (Body)   │  ← The motion content
├─────────────────────────┤
│  SignatureClerk         │  ← Always last of core (removable by user)
├─────────────────────────┤
│  AttachmentsClerk       │  ← User-defined order, drag-and-drop
│  • Certificate of Service│
│  • Notice of Hearing    │
│  • Affidavits           │
│  • Exhibits Appendix    │
└─────────────────────────┘
```

---

## Draft-Level Metadata

### Purpose
**Metadata about the draft itself, available to all clerks.** Entered/confirmed by user at draft creation. Can be pre-populated from DOCX upload.

### Data Structure

```typescript
interface DraftMetadata {
  draft_id: string;
  case_id: string;
  
  // Required - must be confirmed before draft proceeds
  motion_title: string;           // "Defendant's Motion for Summary Judgment"
  motion_type?: string;           // Optional categorization
  
  // System-generated
  created_at: string;
  updated_at: string;
  status: 'pending_setup' | 'active' | 'complete';
}
```

### Draft Creation Flow

```
┌─────────────────────────────────────────────────────────────┐
│  "New Draft" clicked                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    OR    ┌─────────────────────────┐  │
│  │ Start from      │          │ Upload existing DOCX    │  │
│  │ scratch         │          │ to continue drafting    │  │
│  └────────┬────────┘          └────────────┬────────────┘  │
│           │                                │               │
│           ▼                                ▼               │
│  ┌─────────────────┐          ┌─────────────────────────┐  │
│  │ Enter motion    │          │ Extract motion title    │  │
│  │ title manually  │          │ from DOCX (LLM-assisted)│  │
│  └────────┬────────┘          └────────────┬────────────┘  │
│           │                                │               │
│           └──────────┬─────────────────────┘               │
│                      ▼                                     │
│           ┌─────────────────────────┐                      │
│           │ Confirm Draft Details   │                      │
│           │                         │                      │
│           │ Motion Title: [_______] │ ← Pre-filled or      │
│           │                         │   extracted          │
│           │ [Confirm & Start Draft] │                      │
│           └─────────────────────────┘                      │
│                      │                                     │
│                      ▼                                     │
│           Draft status: 'active'                           │
│           All clerks can reference motion_title            │
└─────────────────────────────────────────────────────────────┘
```

### How Clerks Use Draft Metadata

| Clerk | Uses motion_title For |
|-------|----------------------|
| CaseBlockClerk | Display in case block area |
| PleadingClerk | `{{motion_title}}` in footer |
| AttachmentsClerk | "foregoing [motion_title]" in certificates |

---

## 1. RecordsClerk

### Purpose
**Gatekeeper of the immutable vault.** Single point of access for all documents. Owns document identity, page-level addressability, categorization, and annotations. Nothing in the vault changes once ingested—only annotations are added.

### Data Ownership

| Level | Owns |
|-------|------|
| **Document** | File storage, unique ID, name, type/category, upload date, user's free-form description ("what is this and why is it important") |
| **Page** | Unique page IDs within documents, page order/position, page-level addressability, optional Bates number |
| **Annotations** | Notes attached at page-level, document-level, or category-level (separate from document content) |
| **Categorization schema** | What document types exist, required metadata per type, ingestion rules |

### Page Object (with Bates Support)

```typescript
interface Page {
  page_id: string;
  document_id: string;
  page_number: number;          // Internal page number (1, 2, 3...)
  bates_number?: string;        // Bates stamp (000001, DEF-000001, etc.)
}
```

Bates numbers are optional and can be added during or after ingestion. They provide case-wide unique identifiers for pages across all documents.

### Boundaries

| Does | Does Not |
|------|----------|
| Store and retrieve documents | Edit document content (immutable) |
| Index pages as addressable units | Own relationships between documents |
| Manage categorization during ingestion | Know about claims, causes of action, elements |
| Allow annotations at any level | Allow modification of original files |
| Provide page-specific access | Manage exhibit labels or evidence assertions |

### Key Operations

| Operation | Description |
|-----------|-------------|
| **Ingest** | User uploads → prompt for type/name/description → decompose into page IDs → store |
| **Retrieve** | Request by document ID or specific page IDs → return only what's requested |
| **Annotate** | Add notes to page, document, or category level → linked by ID, never modifies original |
| **Reorganize** | Rename, recategorize, move between categories → metadata only, file unchanged |

### Invariants

- Every document has a unique ID
- Every page has a unique ID tied to parent document + position
- Original files are never modified after ingestion
- All operations are logged/tracked
- Page order is always reconstructible

### Export Role

RecordsClerk doesn't directly contribute to export—it *provides* documents that other clerks (ExhibitsClerk, FactsClerk) reference when they contribute to export.

### LLM Touchpoints

| Touchpoint | Output |
|------------|--------|
| Document boundary detection ("where does body begin?") | Consistent line number |
| Document categorization | Consistent type classification |

---

## 2. CaseBlockClerk

### Purpose
**Manages case block templates and case-specific header data.** Everything from the top of a pleading until the motion body begins—court info, parties, cause number, motion title, and salutation. **CaseBlockClerk owns the salutation** ("TO THE HONORABLE JUDGE OF SAID COURT:").

### Data Ownership

| Level | Owns |
|-------|------|
| **Template** | Formatting settings (borders, capitalization, alignment, spacing), salutation pattern with placeholders, layout structure |
| **Case** | Party names/roles, court info, cause number, judicial district, default template selection |
| **Draft** | Motion title (inserted into template placeholders) |

### Template Behavior

- User creates template by: uploading example document OR manually configuring settings
- Template = all the formatting/styling choices (what the current FACTSWAY UI CaseBlock tab captures)
- Templates are reusable across cases—same formatting, different case data
- Each case has a default template
- User can have multiple templates per case and switch defaults
- When parties change (added/removed), case-level data updates; template stays the same

### Template Library

- Ships with defaults designed for common court types (starting points, not jurisdiction-specific guarantees)
- Users can create unlimited custom templates
- Templates exist outside of any specific case (reusable library)
- **No formal court_type field**—templates are just templates that users fully control

| Default Template | Based On |
|------------------|----------|
| Texas State Court - Standard | Common Texas district court format |
| Texas State Court - Section Symbols | Format with § column |
| Federal District Court - Standard | Common federal format |
| Federal District Court - ECF Style | With case/document header area |
| Generic Civil | Minimal, adaptable |

### Style Extraction Feature

- User uploads DOCX with preferred case block style
- Platform extracts formatting into a new template
- Template can then be used for any case going forward

### Dynamic Components

| Component | Where It Lives | When It's Filled |
|-----------|----------------|------------------|
| Court/jurisdiction | Case-level | When case is created |
| Parties | Case-level | When case is created, can be edited |
| Cause number | Case-level | When case is created |
| Motion title | Draft-level | When motion is created |
| Salutation | Template (with placeholder) | Motion title inserted at draft time |

### Boundaries

| Does | Does Not |
|------|----------|
| Manage case block formatting templates | Handle certificate of service (→ AttachmentsClerk) |
| Store case-level party/court data | Manage motion body content |
| Insert motion title into salutation | Handle signature block |
| Extract templates from uploaded DOCX | |

**Boundary:** CaseBlockClerk ends where body begins. CaseBlockClerk owns everything up to and including the salutation ("TO THE HONORABLE JUDGE..."). The first substantive paragraph of argument is PleadingClerk territory.

### LLM Touchpoints

| Touchpoint | Output |
|------------|--------|
| Case block parsing from uploaded document | Consistent field extraction (court, parties, cause number) |

---

## 3. SignatureClerk

### Purpose
**Owns signature block templates.** User creates or imports, sets a default, and that exact block gets used everywhere. Supports multiple attorneys in a single signature block.

### Data Ownership

| Level | Owns |
|-------|------|
| **User** | Library of signature block templates, default selection |
| **Template** | Exact OOXML formatting, all text content (firm, attorneys, bar numbers, "Attorney for X") |

### Signature Block Template (with Multiple Attorneys)

```typescript
interface SignatureBlockTemplate {
  template_id: string;
  
  // Firm info (optional, appears once)
  firm_name?: string;
  
  // Multiple attorneys supported
  attorneys: {
    name: string;
    bar_number: string;
    email?: string;
    is_signing_attorney: boolean;   // Gets the "/s/" 
  }[];
  
  // Shared contact info (appears once at end)
  address: string[];
  phone: string;
  fax?: string;
  
  // Representation line
  representing: string;             // "ATTORNEYS FOR PLAINTIFFS"
}
```

### Key Points

- Multiple templates allowed, one set as default
- "/s/ Name" is static text (no dynamic date/verification)
- "Attorney for [Party]" is part of the template—user updates manually when starting a new case
- No dynamic injection from CaseBlockClerk—signature block is self-contained

### Operations

| Operation | Description |
|-----------|-------------|
| **Import** | Upload DOCX → extract signature block exactly |
| **Create** | Manual editor for crafting signature block |
| **Set default** | One template is the default for all exports |
| **Update** | User edits template when representation changes |

### What It Captures

- Firm name, attorney name, bar number
- Address, phone, fax, email
- "Attorney for [Party]" line
- All formatting quirks (spacing, alignment, fonts, underlines)

### Invariants

- Default signature block must exist before export
- Formatting must be preserved exactly from source

### Boundaries

| Does | Does Not |
|------|----------|
| Store signature block template | Manage certificate of service (→ AttachmentsClerk) |
| Extract formatting from DOCX | Handle electronic signature verification |
| Provide consistent signature across all exports | Change frequently |

---

## 4. ExhibitsClerk

### Purpose
**Manages exhibit objects, title pages, and appendix assembly during drafting.** Creates linkages between claims (sentences), vault documents (including page-level selection), and exhibit markers. Owns the complete appendix packet sent to orchestrator.

### The Exhibit Object

```typescript
interface ExhibitObject {
  exhibit_id: string;              // Unique ID
  
  // Connections (all optional)
  sentence_ids: string[];          // Claims this exhibit supports
  document_selections: {
    document_id: string;           // Vault document (via RecordsClerk)
    page_ids: string[];            // Specific pages selected (or all)
    order: number;                 // Order within exhibit
  }[];
  
  // Auto-attachment rule:
  // If placed mid-sentence → attaches to that sentence
  // If placed between sentences → attaches to prior sentence
  
  // Title page
  title_page: {
    marker_display: string;        // "Exhibit A", "EXHIBIT A", etc.
    title_line: string;            // Claim text, custom title, or document info
  };
  
  // Marker (dynamic)
  marker_position: number;         // Order of appearance in draft (computed)
  marker_value: string;            // "A", "B", "1", "2" etc. (computed)
  
  // Pinpoint citation (expanded for transcripts and Bates)
  pinpoint?: {
    type: 'page' | 'page_range' | 'transcript';
    
    // For regular documents
    page_ids?: string[];
    page_numbers?: string;         // "31-33"
    
    // For transcripts (page:line format)
    transcript_citations?: {
      start_page: number;
      start_line: number;
      end_page: number;
      end_line: number;
    }[];                           // Array allows "176:15-177:4 and 177:18-21"
    
    // Bates reference (optional)
    bates_reference?: {
      start: string;               // "000018"
      end?: string;                // "000025" for ranges
      prefix?: string;             // "DEF-" for "DEF-000018"
    };
    include_bates_in_citation: boolean;  // Show "(000018)" in citation text
  };
}
```

### Dynamic Marker System

| Behavior | How It Works |
|----------|--------------|
| **Ordering** | Based on chronological appearance in draft |
| **Reordering** | If user moves exhibit, all markers recalculate |
| **User chooses style** | Alphabetic (A, B, C), numeric (1, 2, 3), etc. |

### Citation Template Options

| Option | Example |
|--------|---------|
| Inline | See Exhibit A |
| Parenthetical | (See Exhibit A) |
| Italicized | *See Exhibit A* |
| Footnote | Superscript in text, citation at page bottom |

### Title Page Template

| Element | Options |
|---------|---------|
| **Marker format** | "Exhibit A", "EXHIBIT A", "Ex. A", etc. |
| **Font size** | Default 34pt, user configurable |
| **Layout** | Centered, single page |
| **Title line** | Auto-populated from claim text, custom text, document name, or combination |

### Vault Window Component

ExhibitsClerk includes a vault browser for editing document selections:

| Can Do | Cannot Do |
|--------|-----------|
| View documents attached to exhibit | Modify document content |
| Remove pages from selection | Delete documents from vault |
| Add pages back to selection | Rename or recategorize documents |
| Add pages from other vault documents | Annotate documents |
| Reorder documents within exhibit | |

**Initial attachment:** Full document (all pages) attached by default  
**Later editing:** User can pare down or add pages via vault window

### Appendix Assembly

ExhibitsClerk builds the full appendix packet:

```
┌─────────────────────────┐
│  EXHIBIT A (title page) │
├─────────────────────────┤
│  Document 1, pages 3-5  │
│  Document 2, all pages  │
├─────────────────────────┤
│  EXHIBIT B (title page) │
├─────────────────────────┤
│  Document 3, page 12    │
└─────────────────────────┘
```

### Data Ownership

| Level | Owns |
|-------|------|
| **Template** | Citation format, marker style, title page template |
| **Draft** | Exhibit objects, document selections (editable page lists), title pages |
| **Appendix** | Complete packet (title pages + selected pages, in order) |
| **UI Component** | Vault window for editing page selections |

### Boundaries

| Does | Does Not |
|------|----------|
| Create/manage exhibit objects | Store documents (→ RecordsClerk) |
| Edit page selections (include/exclude/reorder) | Modify document content |
| Display vault documents (read-only view) | Manage vault organization |
| Build title pages and appendix packet | Analyze opponent's exhibits (→ FactsClerk) |
| Format citations and compute markers | Handle post-filing tracking |

### Cross-Clerk Workflow: Upload During Drafting

When user adds exhibit and uploads new document mid-drafting:

```
┌─────────────────────────────────────────────────────────────────┐
│                         ORCHESTRATOR                            │
│                                                                 │
│  Step 1: ExhibitsClerk.createExhibitObject()                   │
│          → Returns exhibit_id (no documents yet)                │
│                                                                 │
│  Step 2: RecordsClerk.ingestDocument(file, mode="exhibit")     │
│          → Lightweight ingest, minimal metadata                 │
│          → Returns document_id, page_ids                        │
│                                                                 │
│  Step 3: ExhibitsClerk.attachDocuments(exhibit_id, doc_ids)    │
│          → Links document to exhibit object                     │
└─────────────────────────────────────────────────────────────────┘
```

### LLM Touchpoints

| Touchpoint | Output |
|------------|--------|
| Citation-to-exhibit matching | Suggest which exhibit to link based on sentence context |

---

## 5. CaseLawClerk

### Purpose
**Manages case law and legal authority objects during drafting.** Maintains a Case Law Library (parallel to vault but for public authorities). Provides LLM-assisted citation formatting with type-specific logic. Links authorities to sentences with pinpoint citations.

### Case Law Library

Parallel structure to RecordsClerk's Vault:

| Vault (RecordsClerk) | Case Law Library (CaseLawClerk) |
|----------------------|--------------------------------|
| Private documents (discovery, exhibits) | Public authorities (cases, statutes, rules) |
| Immutable, tracked | Organized, searchable |
| Evidence for claims | Legal support for arguments |

**Library features:**
- All uploaded authorities visible (attached and reference-only)
- Organized by type (cases, statutes, rules, summaries)
- Page-level indexing for quick navigation
- Search/filter capabilities

### Key Difference from ExhibitsClerk

| Aspect | ExhibitsClerk | CaseLawClerk |
|--------|---------------|---------------|
| Document source | Vault (RecordsClerk) | Case Law Library (own storage) |
| Document types | Evidence, discovery, exhibits | Cases, statutes, rules, user summaries |
| Must be attached to sentence? | Yes (auto-attaches) | No (can exist as reference only) |
| Appendix output | Exhibits appendix with title pages | Table of Authorities (optional) |

### The CaseLaw Object

```typescript
interface CaseLawObject {
  caselaw_id: string;              // Unique ID
  
  // The authority document
  document: {
    document_id: string;
    type: 'case' | 'statute' | 'rule' | 'summary' | 'other';
    title: string;                 // e.g., "Smith v. Jones"
    page_ids: string[];            // All pages, indexed
  };
  
  // Connections (optional)
  sentence_ids: string[];          // Sentences this citation supports
  
  // Pinpoint citation
  pinpoint?: {
    page_id: string;               // Specific page referenced
    page_number: string;           // Display number ("460")
  };
  
  // Citation display
  citation: {
    full_citation: string;         // "Smith v. Jones, 123 S.W.3d 456 (Tex. 2020)"
    pinpoint_citation?: string;    // "Smith v. Jones, 123 S.W.3d at 460"
    short_citation?: string;       // "Smith, 123 S.W.3d at 460"
    format_template: string;       // Which format style (Bluebook, Texas, etc.)
  };
  
  // Status
  attached_to_draft: boolean;      // false = reference only
  include_full_document: boolean;  // Include in case law appendix?
}
```

### Citation Type Detection (LLM-Assisted)

| Type | Example | Extraction Logic |
|------|---------|------------------|
| Case | *Smith v. Jones*, 123 S.W.3d 456 (Tex. 2020) | Parties, reporter, volume, page, court, year |
| Statute | TEX. CIV. PRAC. & REM. CODE § 16.001 | Code name, section number, subsections |
| Rule | TEX. R. CIV. P. 106(b) | Rule set, rule number, subdivision |
| Regulation | 17 C.F.R. § 240.10b-5 | Title, code, section |

LLM determines type, extracts components, platform formats deterministically per style guide.

### Citation Formatting System

**LLM-assisted with deterministic validation:**

| Step | Who Does It |
|------|-------------|
| User uploads case/statute | User |
| Platform detects citation type | LLM |
| Platform extracts citation components | LLM |
| Platform builds formatted citation per style guide | Deterministic |
| User reviews/approves or edits | User |
| Validation checks format rules | Deterministic |

**User controls:**
- Choose format style (Bluebook, Texas, Federal, custom)
- Override any component
- Set short-form citation preference

### Pinpoint Citation Behavior

When user cites "at 460":
1. CaseLawClerk creates page-level link to page 460 of the document
2. User can click to view that specific page
3. User can choose to:
   - Just cite it (page link for their reference)
   - Attach full document to case law appendix
   - Attach just the cited page(s)

### Multiple Objects Rule

| Scenario | Result |
|----------|--------|
| Same case, different sentences | Different CaseLaw objects |
| Same case, same sentence | Same CaseLaw object |
| Same case, different pinpoints | Different CaseLaw objects (different page links) |

### Table of Authorities

**Default:** Standard legal format
- Alphabetical by case name (cases)
- Organized by code (statutes)
- Page references where each authority is cited

**User can customize:**
- Grouping (by type, by issue, custom)
- Format style
- Include/exclude specific authorities

### Data Ownership

| Level | Owns |
|-------|------|
| **CaseLawClerk** | Case Law Library (authority documents with page-level indexing) |
| **Template** | Citation format styles (Bluebook, Texas, Federal), Table of Authorities template |
| **Draft** | CaseLaw objects, sentence connections, pinpoints |
| **Optional Output** | Table of Authorities, Case Law Appendix |

### Boundaries

| Does | Does Not |
|------|----------|
| Maintain Case Law Library | Use vault (separate storage) |
| Page-level indexing | Handle private evidence (→ ExhibitsClerk) |
| LLM-assisted citation formatting (type-aware) | Analyze opponent's legal arguments (→ FactsClerk) |
| Generate Table of Authorities | Require attachment to sentence |
| Pinpoint page linking | Store discovery/exhibits |

### LLM Touchpoints

| Touchpoint | Output |
|------------|--------|
| Citation type detection | 'case' / 'statute' / 'rule' / 'regulation' / 'other' |
| Citation component extraction | Structured parts (varies by type) |
| Citation format validation | Pass/fail with specific errors |

---

## 6. FactsClerk

### Purpose
**Manages claim objects and their analyses.** Receives claims from various sources (ingestion pipelines, manual input, drafts). Stores stable claim data and fluid analysis/interpretation layer. Analysis operations are gated with access requirements.

### Key Distinction

| ExhibitsClerk / CaseLawClerk | FactsClerk |
|------------------------------|------------|
| Drafting phase | Analysis phase |
| YOUR exhibits, YOUR citations | ALL claims in the case |
| Links to sentences you're writing | Links to claims from any source |
| Produces appendix for export | Produces claim map for case understanding |

### Two Object Types

#### 1. Claim (Stable)
```typescript
interface Claim {
  claim_id: string;
  text: string;
  sentence_ids?: string[];
  
  source: {
    type: 'document' | 'manual' | 'draft';
    document_id?: string;
    location?: { page_id: string; paragraph?: number; line?: number; };
    attribution?: string;
    draft_id?: string;
    sentence_id?: string;
  };
  
  evidence: {
    exhibit_ids: string[];
    document_ids: string[];
    caselaw_ids: string[];
  };
  
  claimed_by: 'party' | 'opposing_party' | 'witness' | 'other';
  date_recorded: string;
  has_evidence: boolean;
}
```

#### 2. ClaimAnalysis (Fluid)
```typescript
interface ClaimAnalysis {
  analysis_id: string;
  claim_id: string;
  
  classification: {
    tier: 'alpha' | 'beta' | 'gamma' | 'unclassified' | string;
    reason: string;
    date_classified: string;
  };
  
  relationships: {
    contradicts: string[];
    supports: string[];
    restates: string[];
  };
  
  legal_context?: {
    cause_of_action?: string;
    element?: string;
    affirmative_defense?: string;
  };
  
  methodology: 'alphafacts' | 'custom' | string;
  created_by: string;
  notes: string;
}
```

### Key Design Principles

| Principle | Implementation |
|-----------|----------------|
| Claims are stable | Claim objects rarely change after creation |
| Analysis is fluid | ClaimAnalysis can be updated, promoted/demoted |
| Multiple analyses per claim | Different users/methodologies can coexist |
| Analysis is gated | Access requirements must be met |
| FactsClerk defines contract | Pipelines feed claims in required format |

### Analysis Gate

Before any module can create/modify ClaimAnalysis:
- Module has permission to analyze
- Claim exists and is accessible
- Methodology is recognized
- Required fields are present

Future automation can plug into this gate—the gate stays, the triggers change.

### Claim Sources

| Source | How Claims Arrive |
|--------|-------------------|
| Pleading Ingestion Pipeline (future) | Extracts from uploaded motions/pleadings |
| Manual Input | User creates in FactsClerk tab |
| PleadingClerk | Claims from your drafted motions |
| Transcript Pipeline (future) | Extracts from deposition transcripts |
| Discovery Pipeline (future) | Extracts from discovery responses |

### AlphaFacts Model

Lives in the ClaimAnalysis layer:

| Tier | Definition |
|------|------------|
| **Alpha** | Proven/established fact (sworn testimony, documentary evidence) |
| **Beta** | Supported claim (evidence exists but not conclusive) |
| **Gamma** | Asserted claim (no evidence yet, or disputed) |
| **Unclassified** | Not yet analyzed |

Promotion/demotion = updating `classification.tier` + `classification.reason`

### Contradiction Handling

When Claim A contradicts Claim B:
- Claims A and B: No change (stable)
- ClaimAnalysis for A: `relationships.contradicts` adds Claim B's ID
- ClaimAnalysis for B: `relationships.contradicts` adds Claim A's ID

Claims don't "know" they contradict—the analysis layer tracks relationships.

### Data Ownership

| Object Type | Mutability | Who Creates |
|-------------|------------|-------------|
| **Claim** | Stable | Pipelines, manual input, PleadingClerk |
| **ClaimAnalysis** | Fluid | User or system (gated) |

### Boundaries

| Does | Does Not |
|------|----------|
| Define Claim contract/schema | Extract claims (pipelines do that) |
| Define ClaimAnalysis contract/schema | Automatically detect contradictions |
| Store claims and analyses | Own source documents |
| Maintain evidence links | Run extraction pipelines |
| Gate analysis operations | Force single classification system |
| Allow multiple methodologies | Auto-create analysis on claim creation |

### LLM Touchpoints

| Touchpoint | Output |
|------------|--------|
| Claim extraction from documents | Claim objects in required format |
| Evidence citation detection | Evidence links for claims |
| Contradiction detection (future) | Relationship suggestions |
| Classification suggestion (future) | Tier recommendation with reasoning |

---

## 7. PleadingClerk

### Purpose
**Manages motion body content, structure, and document formatting.** Owns the hierarchical structure (sections, subsections, paragraphs), the document format template (margins, fonts, footers), and content-level inline formatting.

### Three Concerns

| Concern | What It Is | Example |
|---------|------------|----------|
| **Content** | The actual text | "Defendant failed to respond..." |
| **Structure** | The hierarchy (invariant) | Section I > Subsection A > Paragraph |
| **Formatting** | How it appears | Template defaults + inline overrides |

### The Hierarchy Invariant

**Everything belongs to something.** No orphan content.

```typescript
interface MotionBody {
  sections: Section[];
}

interface Section {
  section_id: string;
  type: 'pre-section' | 'numbered' | 'prayer' | 'custom';
  title?: string;
  level: number;
  numbering?: string;
  content: ContentBlock[];
  subsections: Section[];
}

interface ContentBlock {
  block_id: string;
  type: 'paragraph' | 'list' | 'block_quote';
  content?: InlineContent[];
  items?: ListItem[];
}

interface InlineContent {
  text: string;
  formatting: { bold: boolean; italic: boolean; underline: boolean; };
  exhibit_citation?: string;    // ExhibitsClerk reference
  caselaw_citation?: string;    // CaseLawClerk reference
}
```

### Two Levels of Formatting

#### 1. Template Level (Defaults)
DocumentFormatTemplate sets baseline for entire document:
- Page setup (margins, paper size, orientation)
- Body typography (font, size, spacing, indent, justification)
- Heading styles (per level: font, bold, caps, alignment)
- Section numbering (roman/numeric, format, continuous option)
- Lists (bullet/number style, indent)
- Block quotes (indents, spacing)
- Footnotes (numbering, placement, size)
- Footer/Header (content, format, `{{motion_title}}` placeholder)
- **Table of Contents** (auto-generated from hierarchy)
- **Paragraph numbering mode** (continuous, per_section, none)
- **Line numbering** (for courts that require numbered lines)

#### 2. Content Level (Inline Overrides)
Within text, users can apply formatting to specific words/phrases that override template defaults.

### Table of Contents (TOC)

PleadingClerk owns the TOC setting; Orchestrator generates at export:

```typescript
// In DocumentFormatTemplate
toc: {
  include: boolean;              // Generate TOC?
  position: 'after_title' | 'after_salutation';
  depth: number;                 // How many levels (1 = sections only, 2 = + subsections)
  dotted_leaders: boolean;       // Include ............ before page numbers
  page_numbers: boolean;         // Include page references
}
```

### Paragraph Numbering Modes

```typescript
// In DocumentFormatTemplate
paragraph_numbering: {
  mode: 'continuous' | 'per_section' | 'none';
  format: string;                // "1." or "(1)" or "¶1"
  indent: number;                // Indent for numbered paragraphs
}
```

| Mode | Behavior |
|------|----------|
| `continuous` | 1, 2, 3... through entire document |
| `per_section` | Restart at 1 for each Roman numeral section |
| `none` | No paragraph numbers |

### Line Numbering (Court Requirement)

Some courts require numbered lines in the left margin:

```typescript
// In DocumentFormatTemplate
line_numbering: {
  enabled: boolean;
  lines_per_page: number;        // Usually 28
  show_vertical_rule: boolean;   // Line separating numbers from content
  number_position: 'left';       // Always left margin
}
```

### Continuous Paragraph Numbering (Legacy)

Optional lever in DocumentFormatTemplate:
```typescript
continuous_numbering: {
  enabled: boolean;
  apply_to_level: number;    // Which level gets continuous numbers
  format: string;            // "1." or "(1)" or "¶1"
}
```

When enabled, chosen level numbers sequentially across all sections (¶1, ¶2... ¶47).

### Citation Integration

PleadingClerk stores references to other clerks' objects but doesn't format them:
- `exhibit_citation` → ExhibitsClerk controls display
- `caselaw_citation` → CaseLawClerk controls display

### Style Extraction

When user uploads DOCX:
1. Extract structure → Validate hierarchy
2. Extract formatting → Create DocumentFormatTemplate

### Data Ownership

| Level | Owns |
|-------|------|
| **User** | Library of DocumentFormatTemplates |
| **Template** | All formatting levers |
| **Draft** | Content, structure, inline formatting overrides |

### Boundaries

| Does | Does Not |
|------|----------|
| Own motion body content | Control case block (→ CaseBlockClerk) |
| Enforce hierarchy invariant | Control signature (→ SignatureClerk) |
| Own document format template | Format exhibit citations (→ ExhibitsClerk) |
| Allow inline formatting | Format case law citations (→ CaseLawClerk) |
| Store citation references | Own citation objects |

### LLM Touchpoints

| Touchpoint | Output |
|------------|--------|
| Structure detection | Hierarchy classification |
| Format validation | Flag poorly structured drafts |
| Style extraction | DocumentFormatTemplate from DOCX |

---

## 8. AttachmentsClerk

### Purpose
**Manages attachment templates (certificates, notices, affidavits, custom).** Templates can include placeholders that reference other clerks' outputs. At export, passes references to orchestrator for assembly.

### Placeholder References

AttachmentsClerk templates can reference other clerks' outputs:

| Placeholder | Orchestrator Requests From |
|-------------|---------------------------|
| `{{signature_block}}` | SignatureClerk |
| `{{exhibits_appendix}}` | ExhibitsClerk (→ RecordsClerk for vault docs) |
| `{{table_of_authorities}}` | CaseLawClerk |

AttachmentsClerk doesn't own these—it references them. Orchestrator coordinates actual assembly.

### The Attachment Template

```typescript
interface AttachmentTemplate {
  template_id: string;
  name: string;
  type: 'certificate' | 'notice' | 'affidavit' | 'custom';
  
  content: {
    body: string;
    placeholders: {
      name: string;
      type: 'text' | 'date' | 'party' | 'attorney' | 'clerk_reference';
      clerk_reference?: {
        clerk: 'signature' | 'exhibits' | 'caselaw';
        object: 'signature_block' | 'appendix' | 'table_of_authorities';
      };
      required: boolean;
    }[];
  };
  
  export_behavior: {
    position: 'attached' | 'separate';
    attachment_order?: number;
  };
}
```

### Default Templates (Ships With)

| Template | Type |
|----------|------|
| Texas Certificate of Service | certificate |
| Texas Certificate of Conference | certificate |
| Federal Certificate of Service | certificate |
| Verification Affidavit | affidavit |
| Notice of Hearing | notice |

Users can create unlimited custom templates based on these or from scratch.

### Certificate of Service (Per-Party Service Method)

Certificates of Service use per-party service method selection (not checkboxes):

```typescript
interface CertificateOfServiceTemplate {
  template_id: string;
  
  // Intro paragraph with date placeholder
  intro_text: string;           // "I certify that a true and correct copy..."
  date_placeholder: string;     // {{service_date}}
  
  // Service method options (user picks one per party)
  service_methods: {
    value: string;              // "electronic" | "certified_mail" | "regular_mail" | "fax" | "hand_delivery"
    display_text: string;       // "Via Electronic Service"
  }[];
  default_method: string;       // "electronic"
  
  // Signature placeholder
  signature_placeholder: string;  // {{signature_block}}
}

// At draft time, user specifies served parties
interface CertificateOfServiceData {
  template_id: string;
  service_date: string;
  served_parties: {
    name: string;               // "John Smith"
    role: string;               // "Attorney for Defendant"
    service_method: string;     // "electronic" (defaults to template default)
    contact_info: string;       // Email, address, or fax depending on method
  }[];
}
```

**Output format (shows only selected method per party):**
```
CERTIFICATE OF SERVICE

I certify that a true and correct copy of the foregoing was served on 
all counsel of record on July 3, 2024:

John Smith, Attorney for Defendant
Via Electronic Service
john@smithlaw.com

Jane Doe, Attorney for Intervenor  
Via Certified Mail, Return Receipt Requested
123 Main Street, Dallas, TX 75201

/s/ T Nguyen
```

### Data Ownership

| Level | Owns |
|-------|------|
| **User** | Library of attachment templates |
| **Template** | Content, placeholders (including clerk references), formatting |
| **Draft** | Which attachments selected, order, filled values |

### Boundaries

| Does | Does Not |
|------|----------|
| Own certificate/notice/affidavit templates | Own signature block (references it) |
| Include placeholders referencing other clerks | Build other clerks' outputs |
| Pass references to orchestrator | Directly request from other clerks |
| Ship with default templates | Override core sandwich structure |

### LLM Touchpoints

None—templates are user-defined with deterministic placeholder resolution.

---

## Export Order

### Default Order (The Sandwich)

1. **CaseBlockClerk** - Case caption, parties, salutation
2. **PleadingClerk** - Motion body
3. **SignatureClerk** - Signature block
4. **AttachmentsClerk** - User-ordered attachments:
   - Certificate of Service
   - Notice of Hearing
   - Affidavits
   - etc.
5. **ExhibitsClerk** - Appendix (title pages + exhibits)

### User Control

- User can remove CaseBlock or Signature if exporting partial document
- User can reorder attachments via drag-and-drop
- Appendix always comes last

---

## Cross-Clerk Coordination

### Principle

Clerks never call each other directly. The **orchestrator** coordinates all cross-clerk workflows.

### Known Cross-Clerk Workflows

| Workflow | Clerks Involved | Orchestrator Role |
|----------|-----------------|-------------------|
| Add exhibit + upload document | ExhibitsClerk, RecordsClerk | Coordinate ingest → attach |
| Export motion | All clerks | Collect components, assemble |
| Parse uploaded motion | RecordsClerk, FactsClerk | Ingest → extract claims |

---

## LLM Touchpoints

### Summary Table

| Clerk | Touchpoint | Skill Output |
|-------|------------|--------------|
| Draft Startup | Motion title extraction from DOCX | Suggested title for user confirmation |
| RecordsClerk | Document boundary detection | Line number |
| RecordsClerk | Document categorization | Type classification |
| CaseBlockClerk | Case block parsing | Field extraction |
| ExhibitsClerk | Citation-to-exhibit matching | Exhibit suggestion |
| FactsClerk | Claim extraction | Claim objects with sentence IDs |
| FactsClerk | Evidence citation detection | Citation objects |

### Skill Strategy

Each LLM touchpoint will have a corresponding Claude Skill that:
1. Defines exact JSON output format
2. Specifies extraction/classification rules
3. Ensures consistency across invocations

Skills are Phase 2 (Runbook execution), not Phase 1 (clerk design).

---

## Document History

| Date | Change |
|------|--------|
| 2024-12-23 | Initial creation with RecordsClerk, CaseBlockClerk, SignatureClerk, ExhibitsClerk |
| 2024-12-23 | Added CaseLawClerk (Case Law Library, LLM-assisted citations) |
| 2024-12-23 | Added FactsClerk (Claims + ClaimAnalysis, AlphaFacts model) |
| 2024-12-23 | Added PleadingClerk (Hierarchy invariant, DocumentFormatTemplate) |
| 2024-12-23 | Added AttachmentsClerk (Certificates, notices, clerk reference placeholders) |
| 2024-12-23 | **All 8 clerks complete** |
| 2024-12-24 | Motion Analysis: Validated architecture against 309-page real-world motion PDF |
| 2024-12-24 | Added Draft-Level Metadata (motion_title, DOCX extraction with confirmation) |
| 2024-12-24 | Decision 1: TOC generation (PleadingClerk owns setting, Orchestrator generates) |
| 2024-12-24 | Decision 2: Paragraph numbering modes (continuous, per_section, none) |
| 2024-12-24 | Decision 3: Deposition transcript citations (page:line format) |
| 2024-12-24 | Decision 4: Salutation ownership (CaseBlockClerk) |
| 2024-12-24 | Decision 5: Line numbering support in DocumentFormatTemplate |
| 2024-12-24 | Decision 6: Bates numbering (RecordsClerk stores, ExhibitsClerk references) |
| 2024-12-24 | Decision 7: Multiple attorneys in SignatureClerk |
| 2024-12-24 | Decision 8: Per-party service method in Certificate of Service |
| 2024-12-24 | Decision 9: Footer motion_title from draft-level metadata |
| 2024-12-24 | Decision 10: No formal court_type field (templates only, user controls) |

---

*Last updated: December 24, 2024 - Motion Analysis complete, 10 decisions incorporated*

*This document is part of the FACTSWAY specification. See also: `runbook_0_contract_definition.md`, `JOURNAL.md`*
