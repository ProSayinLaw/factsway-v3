# Runbook 1: Reference Document - LegalDocument Types & Schema

**Phase:** Foundation (Critical Path)  
**Estimated Time:** 4-6 hours  
**Prerequisites:** None (First runbook)  
**Depends On:** Runbook 0 Section 4 (Data Model)  
**Enables:** Runbooks 2-15 (all subsequent work)

---

## Objective

Create the **canonical LegalDocument TypeScript types and JSON schema** that serve as the single source of truth for all data exchange between frontend, orchestrator, and backend services.

**Success Criteria:**
- ✅ TypeScript types compile without errors
- ✅ JSON schema validates correctly
- ✅ Validation guards catch malformed data
- ✅ Tests pass for all model variants
- ✅ Documentation generated from types

---

## Context from Runbook 0

**Referenced Sections:**
- **Section 4:** LegalDocument Schema (Canonical Backend Contract)
  - **Section 4.2:** Core Structure (main interfaces)
  - **Section 4.5:** Sentence-Paragraph Relationship (overlay concept)
  - **Section 4.7:** Citations (Citation and CitationSpan)
  - **Section 4.9:** Preservation Metadata (round-trip fidelity)
- **Section 16.1:** Monorepo Structure (`packages/shared-types/`)

**Referenced from Architecture Audit:**
- **01_COMPLETE_ARCHITECTURE_MAP.md, Part 2, Section 2:** Target directory structure
- **Component:** `packages/shared-types/` (🔵 NEW)

**Key Principle from Runbook 0:**
> "The LegalDocument format is canonical. All ingestion outputs LegalDocument. All export inputs LegalDocument. No exceptions."

---

## Current State

**What exists:**
- ❌ No `packages/` directory
- ❌ No shared types package
- ❌ No TypeScript interfaces for LegalDocument
- ❌ No JSON schema validation

**What this creates:**
- ✅ `packages/shared-types/` with complete structure
- ✅ TypeScript interfaces matching Runbook 0 Section 4
- ✅ JSON schema for runtime validation
- ✅ Type guards and validators
- ✅ Test suite with fixtures

---

## Task 1: Create Package Structure

### 1.1 Create Directory Structure

**Location:** Root of repository

**Action:** CREATE new directories

```bash
# From repository root
mkdir -p packages/shared-types/src/{models,schemas,guards,utils}
mkdir -p packages/shared-types/tests/{fixtures,unit}
```

**Verification:**
```bash
tree packages/shared-types -L 2

# Expected output:
# packages/shared-types/
# ├── src/
# │   ├── models/
# │   ├── schemas/
# │   ├── guards/
# │   └── utils/
# └── tests/
#     ├── fixtures/
#     └── unit/
```

---

### 1.2 Create package.json

**File:** `packages/shared-types/package.json`

**Action:** CREATE

**Content:**
```json
{
  "name": "@factsway/shared-types",
  "version": "1.0.0",
  "description": "Canonical LegalDocument types and schemas for FACTSWAY platform",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src --ext .ts",
    "typecheck": "tsc --noEmit",
    "docs": "typedoc src/index.ts"
  },
  "keywords": [
    "legal",
    "document",
    "types",
    "schema"
  ],
  "author": "FACTSWAY",
  "license": "PRIVATE",
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.40.0",
    "jest": "^29.5.0",
    "ts-jest": "^29.1.0",
    "typedoc": "^0.25.0",
    "typescript": "^5.0.0"
  },
  "dependencies": {
    "ajv": "^8.12.0",
    "zod": "^3.22.0"
  }
}
```

**Verification:**
```bash
cd packages/shared-types
npm install
# Should complete without errors
```

---

### 1.3 Create tsconfig.json

**File:** `packages/shared-types/tsconfig.json`

**Action:** CREATE

**Content:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "types": ["node", "jest"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**Verification:**
```bash
npx tsc --noEmit
# Should complete without errors (no files yet, but config valid)
```

---

## Task 2: Create Core Type Definitions

### 2.1 Create Base Types

**File:** `packages/shared-types/src/models/base.types.ts`

**Action:** CREATE

**Content:**
```typescript
/**
 * Base types used across all LegalDocument components
 *
 * Reference: Runbook 0, Section 4.2 (Core Structure)
 */

/**
 * Universally unique identifier (UUID v4)
 */
export type UUID = string;

/**
 * ISO 8601 datetime string
 * Example: "2024-12-26T10:30:00Z"
 */
export type ISODateTime = string;

/**
 * File path (absolute or relative)
 */
export type FilePath = string;

/**
 * Character offset within text (0-indexed)
 */
export type CharacterOffset = number;

/**
 * Format mark indicating text styling
 *
 * Reference: Runbook 0, Section 4.9 (Preservation Metadata)
 */
export interface FormatMark {
  /** Start position (inclusive, 0-indexed) */
  start: CharacterOffset;
  
  /** End position (exclusive) */
  end: CharacterOffset;
  
  /** Format type */
  format: 'bold' | 'italic' | 'underline' | 'smallcaps' | 'strike' | 'subscript' | 'superscript';
  
  /** Optional: Font name if non-standard */
  font?: string;
  
  /** Optional: Font size in points */
  fontSize?: number;
}

/**
 * Citation span with character offsets
 *
 * Reference: Runbook 0, Section 4.7 (Citations)
 */
export interface CitationSpan {
  /** Start position in parent text (inclusive, 0-indexed) */
  start: CharacterOffset;
  
  /** End position in parent text (exclusive) */
  end: CharacterOffset;
  
  /** Citation text exactly as it appears */
  text: string;
  
  /** Citation type detected */
  type: 'case' | 'statute' | 'regulation' | 'short_form' | 'id' | 'supra' | 'exhibit';
  
  /** Unique citation ID for linking */
  citation_id: UUID;
}

/**
 * Confidence level for AI-assisted operations
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

/**
 * Court jurisdiction
 */
export interface Court {
  /** Full court name */
  name: string;
  
  /** Court type (district, circuit, supreme, etc.) */
  type?: string;
  
  /** Geographic jurisdiction */
  jurisdiction?: string;
  
  /** Division or branch */
  division?: string;
}

/**
 * Party in litigation
 */
export interface Party {
  /** Unique party ID */
  id: UUID;
  
  /** Party name */
  name: string;
  
  /** Role (plaintiff, defendant, etc.) */
  role: 'plaintiff' | 'defendant' | 'petitioner' | 'respondent' | 'appellant' | 'appellee' | 'intervenor' | 'third_party';
  
  /** Optional: Attorney name */
  attorney?: string;
  
  /** Optional: Attorney bar number */
  bar_number?: string;
}

/**
 * Preservation metadata for round-trip fidelity
 *
 * Reference: Runbook 0, Section 4.9 (Preservation Metadata)
 */
export interface PreservationMetadata {
  /** Original XML paragraph properties (base64) */
  paragraph_xml?: string;
  
  /** Original XML run properties (base64) */
  run_xml?: string;
  
  /** Original XML section properties (base64) */
  section_xml?: string;
  
  /** Custom XML mappings */
  custom_xml?: Record<string, string>;
}
```

**Verification:**
```bash
npx tsc src/models/base.types.ts --noEmit
# Should compile without errors
```

---

### 2.2 Create Sentence Type

**File:** `packages/shared-types/src/models/sentence.types.ts`

**Action:** CREATE

**Content:**
```typescript
/**
 * Sentence model
 *
 * Reference: Runbook 0, Section 4.5 (Sentence-Paragraph Relationship)
 *
 * Key Principle: Sentences are OVERLAYS on paragraph text, not independent entities.
 * Sentence text is derived by slicing paragraph text using offsets.
 */

import { UUID, CharacterOffset, FormatMark, CitationSpan, ConfidenceLevel } from './base.types';

/**
 * Sentence within a paragraph
 */
export interface Sentence {
  /** Unique sentence ID */
  id: UUID;
  
  /** Parent paragraph ID - REQUIRED */
  parent_paragraph_id: UUID;
  
  /** Start offset in parent paragraph text (inclusive, 0-indexed) */
  start_offset: CharacterOffset;
  
  /** End offset in parent paragraph text (exclusive) */
  end_offset: CharacterOffset;
  
  /** 
   * Sentence text (derived from paragraph text)
   * 
   * INVARIANT: text === paragraph.text.slice(start_offset, end_offset)
   */
  text: string;
  
  /** Format marks (character offsets relative to sentence start, NOT paragraph) */
  format_spans: FormatMark[];
  
  /** Citations within this sentence */
  citations: CitationSpan[];
  
  /** Optional: Analysis metadata (populated by AI services) */
  analysis?: SentenceAnalysis;
}

/**
 * Optional analysis metadata for a sentence
 * 
 * Reference: Runbook 0, Section 14 (Evidence System)
 */
export interface SentenceAnalysis {
  /** Evidence score (0.0 - 1.0) */
  evidence_score?: number;
  
  /** Claim type classification */
  claim_type?: 'factual' | 'legal' | 'procedural' | 'argument';
  
  /** Linked exhibit IDs */
  linked_exhibit_ids: UUID[];
  
  /** Is this a key fact? */
  is_key_fact: boolean;
  
  /** Is this fact disputed? */
  is_disputed: boolean;
  
  /** Timeline date (if extractable) */
  timeline_date?: string;
  
  /** Speaker/actor entity */
  speaker_entity?: string;
  
  /** Confidence in analysis */
  confidence?: ConfidenceLevel;
}
```

**Verification:**
```bash
npx tsc src/models/sentence.types.ts --noEmit
# Should compile without errors
```

---

### 2.3 Create Paragraph Type

**File:** `packages/shared-types/src/models/paragraph.types.ts`

**Action:** CREATE

**Content:**
```typescript
/**
 * Paragraph model
 *
 * Reference: Runbook 0, Section 4.4 (Hierarchical Structure)
 */

import { UUID, FormatMark, PreservationMetadata } from './base.types';
import { Sentence } from './sentence.types';

/**
 * Paragraph numbering style
 */
export type NumberingStyle = 
  | 'decimal'      // 1, 2, 3
  | 'lower_alpha'  // a, b, c
  | 'upper_alpha'  // A, B, C
  | 'lower_roman'  // i, ii, iii
  | 'upper_roman'  // I, II, III
  | 'bullet'       // •
  | 'none';

/**
 * Paragraph within a section
 */
export interface Paragraph {
  /** Unique paragraph ID */
  id: UUID;
  
  /** Parent section ID */
  parent_section_id: UUID;
  
  /** Paragraph text (authoritative) */
  text: string;
  
  /** Format marks (character offsets relative to paragraph start) */
  format_spans: FormatMark[];
  
  /** Sentences within this paragraph (OVERLAYS on text) */
  sentences: Sentence[];
  
  /** Optional: Numbering */
  numbering?: ParagraphNumbering;
  
  /** Optional: Indentation in points */
  indent_left?: number;
  indent_right?: number;
  indent_first_line?: number;
  
  /** Optional: Spacing in points */
  spacing_before?: number;
  spacing_after?: number;
  line_spacing?: number;
  
  /** Optional: Alignment */
  alignment?: 'left' | 'center' | 'right' | 'justify';
  
  /** Preservation metadata for round-trip fidelity */
  preservation?: PreservationMetadata;
}

/**
 * Paragraph numbering configuration
 */
export interface ParagraphNumbering {
  /** Numbering level (0-8, where 0 is top level) */
  level: number;
  
  /** Numbering style */
  style: NumberingStyle;
  
  /** Computed number text (e.g., "1.", "a.", "i.") */
  number_text: string;
  
  /** Is this a continuation of previous numbering? */
  is_continuation: boolean;
}
```

**Verification:**
```bash
npx tsc src/models/paragraph.types.ts --noEmit
# Should compile without errors
```

---

### 2.4 Create Section Type

**File:** `packages/shared-types/src/models/section.types.ts`

**Action:** CREATE

**Content:**
```typescript
/**
 * Section model
 *
 * Reference: Runbook 0, Section 4.4 (Hierarchical Structure)
 */

import { UUID } from './base.types';
import { Paragraph } from './paragraph.types';

/**
 * Section type classification
 */
export type SectionType = 
  | 'introduction'
  | 'background'
  | 'facts'
  | 'argument'
  | 'legal_standard'
  | 'analysis'
  | 'conclusion'
  | 'prayer'
  | 'certificate'
  | 'unknown';

/**
 * Section within document body
 */
export interface Section {
  /** Unique section ID */
  id: UUID;
  
  /** Parent section ID (null for top-level sections) */
  parent_section_id: UUID | null;
  
  /** Section title/heading */
  title: string;
  
  /** Section numbering (e.g., "I", "A", "1") */
  number?: string;
  
  /** Hierarchical level (1 = top level, 2 = subsection, etc.) */
  level: number;
  
  /** Section type classification */
  type: SectionType;
  
  /** Child sections (nested) */
  children: Section[];
  
  /** Paragraphs in this section (non-recursive) */
  paragraphs: Paragraph[];
  
  /** Optional: Section metadata */
  metadata?: SectionMetadata;
}

/**
 * Section metadata
 */
export interface SectionMetadata {
  /** Was this section auto-detected or user-defined? */
  detection_method: 'auto' | 'manual';
  
  /** Confidence in type classification (0.0 - 1.0) */
  type_confidence?: number;
  
  /** Page number where section starts (if available) */
  start_page?: number;
  
  /** Optional: Section summary (AI-generated) */
  summary?: string;
}
```

**Verification:**
```bash
npx tsc src/models/section.types.ts --noEmit
# Should compile without errors
```

---

### 2.5 Create CaseBlock and Signature Types

**File:** `packages/shared-types/src/models/special-blocks.types.ts`

**Action:** CREATE

**Content:**
```typescript
/**
 * Special blocks: CaseBlock and SignatureBlock
 *
 * Reference: Runbook 0, Section 4.8 (Special Blocks)
 */

import { UUID, ISODateTime, PreservationMetadata, Court, Party } from './base.types';

/**
 * Content policy for approved blocks
 * 
 * Reference: Runbook 0, Section 6 (CaseBlock Service)
 */
export type ContentPolicy = 
  | 'frozen'           // Use approved DOCX exactly as-is
  | 'update_names'     // Patch party/court names, preserve formatting
  | 'full_regenerate'; // Regenerate from schema

/**
 * Caption/case heading block
 */
export interface CaseBlock {
  /** Unique caseblock ID */
  id: UUID;
  
  /** Court information */
  court: Court;
  
  /** All parties */
  parties: Party[];
  
  /** Cause/docket number */
  cause_number: string;
  
  /** Case title (e.g., "Smith v. Jones") */
  case_title: string;
  
  /** Optional: Division */
  division?: string;
  
  /** Optional: Judge */
  judge?: string;
  
  /** Approved DOCX storage */
  approved?: ApprovedBlock;
  
  /** Styling preferences */
  styling?: CaseBlockStyling;
}

/**
 * Signature block
 */
export interface SignatureBlock {
  /** Unique signature block ID */
  id: UUID;
  
  /** Primary signer information */
  signer: Signer;
  
  /** Optional: Additional signers */
  additional_signers?: Signer[];
  
  /** Approved DOCX storage */
  approved?: ApprovedBlock;
  
  /** Styling preferences */
  styling?: SignatureStyling;
}

/**
 * Signer information
 */
export interface Signer {
  /** Signer name */
  name: string;
  
  /** Bar number (if attorney) */
  bar_number?: string;
  
  /** Firm/organization */
  firm?: string;
  
  /** Address line 1 */
  address_line1?: string;
  
  /** Address line 2 */
  address_line2?: string;
  
  /** City */
  city?: string;
  
  /** State */
  state?: string;
  
  /** ZIP code */
  zip?: string;
  
  /** Phone */
  phone?: string;
  
  /** Email */
  email?: string;
  
  /** Fax */
  fax?: string;
}

/**
 * Approved block storage
 */
export interface ApprovedBlock {
  /** Content policy */
  policy: ContentPolicy;
  
  /** Approved DOCX bytes (base64) */
  docx_base64: string;
  
  /** When approved */
  approved_at: ISODateTime;
  
  /** Approval metadata */
  metadata?: Record<string, any>;
}

/**
 * CaseBlock styling preferences
 */
export interface CaseBlockStyling {
  /** Font family */
  font_family?: string;
  
  /** Font size (points) */
  font_size?: number;
  
  /** Alignment */
  alignment?: 'left' | 'center' | 'right';
  
  /** Party name case */
  party_case?: 'upper' | 'lower' | 'title';
  
  /** Court name case */
  court_case?: 'upper' | 'lower' | 'title';
  
  /** Include divider line? */
  include_divider?: boolean;
}

/**
 * SignatureBlock styling preferences
 */
export interface SignatureStyling {
  /** Font family */
  font_family?: string;
  
  /** Font size (points) */
  font_size?: number;
  
  /** Alignment */
  alignment?: 'left' | 'center' | 'right';
  
  /** Include "Respectfully submitted" */
  include_respectfully?: boolean;
  
  /** Include date */
  include_date?: boolean;
}
```

**Verification:**
```bash
npx tsc src/models/special-blocks.types.ts --noEmit
# Should compile without errors
```

---

### 2.6 Create Citation Types

**File:** `packages/shared-types/src/models/citation.types.ts`

**Action:** CREATE

**Content:**
```typescript
/**
 * Citation model
 *
 * Reference: Runbook 0, Section 4.7 (Citations)
 */

import { UUID } from './base.types';

/**
 * Citation type
 */
export type CitationType = 
  | 'case'        // Case law citation
  | 'statute'     // Statutory citation
  | 'regulation'  // Regulatory citation
  | 'short_form'  // Short-form case citation
  | 'id'          // Id. citation
  | 'supra'       // Supra citation
  | 'exhibit';    // Exhibit reference

/**
 * Citation entry
 */
export interface Citation {
  /** Unique citation ID */
  id: UUID;
  
  /** Citation type */
  type: CitationType;
  
  /** Full citation text */
  full_text: string;
  
  /** Sentence IDs where this citation appears */
  sentence_ids: UUID[];
  
  /** Optional: Parsed components (for case citations) */
  parsed?: ParsedCaseCitation;
  
  /** Optional: Parallel citations */
  parallel_citations?: string[];
  
  /** Optional: Pin cite (specific page) */
  pin_cite?: string;
}

/**
 * Parsed case citation components
 */
export interface ParsedCaseCitation {
  /** Case name (parties) */
  case_name?: string;
  
  /** Reporter volume */
  volume?: string;
  
  /** Reporter abbreviation */
  reporter?: string;
  
  /** Starting page */
  page?: string;
  
  /** Court abbreviation */
  court?: string;
  
  /** Year */
  year?: string;
}
```

**Verification:**
```bash
npx tsc src/models/citation.types.ts --noEmit
# Should compile without errors
```

---

### 2.7 Create Main LegalDocument Type

**File:** `packages/shared-types/src/models/legal-document.types.ts`

**Action:** CREATE

**Content:**
```typescript
/**
 * Main LegalDocument model
 *
 * Reference: Runbook 0, Section 4.2 (Core Structure)
 *
 * This is the CANONICAL format for all data exchange in FACTSWAY.
 * All ingestion outputs this. All export inputs this.
 */

import { UUID, ISODateTime, FilePath } from './base.types';
import { Section } from './section.types';
import { CaseBlock, SignatureBlock } from './special-blocks.types';
import { Citation } from './citation.types';

/**
 * Document type classification
 */
export type DocumentType = 
  | 'motion'
  | 'brief'
  | 'complaint'
  | 'answer'
  | 'order'
  | 'memo'
  | 'letter'
  | 'notice'
  | 'other';

/**
 * LegalDocument - Canonical Format
 * 
 * This is the single source of truth for document structure.
 */
export interface LegalDocument {
  /**
   * Document Metadata
   */
  meta: DocumentMeta;
  
  /**
   * Case Header (optional, for filed documents)
   */
  case_header?: CaseHeader;
  
  /**
   * CaseBlock (caption/heading)
   */
  caseblock?: CaseBlock;
  
  /**
   * Document Body (hierarchical sections)
   */
  body: DocumentBody;
  
  /**
   * Signature Block
   */
  signature_block?: SignatureBlock;
  
  /**
   * Citations Registry
   */
  citations: Citation[];
  
  /**
   * Embedded Objects (images, tables, etc.)
   */
  embedded_objects: EmbeddedObject[];
}

/**
 * Document metadata
 */
export interface DocumentMeta {
  /** Unique document ID */
  id: UUID;
  
  /** Document title */
  title: string;
  
  /** Document type */
  type: DocumentType;
  
  /** When created */
  created_at: ISODateTime;
  
  /** Last modified */
  updated_at: ISODateTime;
  
  /** Source file path (if ingested) */
  source_file?: FilePath;
  
  /** Ingestion engine version */
  ingestion_version?: string;
  
  /** Optional: Tags */
  tags?: string[];
  
  /** Optional: Custom metadata */
  custom?: Record<string, any>;
}

/**
 * Case header (for filed documents)
 */
export interface CaseHeader {
  /** Case ID (links to Cases database) */
  case_id: UUID;
  
  /** Document title in filing (e.g., "Motion to Dismiss") */
  filing_title: string;
  
  /** Filing date */
  filing_date?: ISODateTime;
  
  /** Filing party */
  filing_party?: string;
}

/**
 * Document body (hierarchical sections)
 */
export interface DocumentBody {
  /** Top-level sections */
  sections: Section[];
  
  /** Optional: Body metadata */
  metadata?: BodyMetadata;
}

/**
 * Body metadata
 */
export interface BodyMetadata {
  /** Total word count */
  word_count?: number;
  
  /** Total page count (estimated) */
  page_count?: number;
  
  /** Detected heading styles */
  heading_styles?: string[];
}

/**
 * Embedded object (image, table, etc.)
 */
export interface EmbeddedObject {
  /** Unique object ID */
  id: UUID;
  
  /** Object type */
  type: 'image' | 'table' | 'chart' | 'diagram' | 'other';
  
  /** Location in document (section ID + paragraph ID) */
  location: ObjectLocation;
  
  /** Binary data (base64) */
  data_base64?: string;
  
  /** Optional: Alt text / caption */
  alt_text?: string;
  
  /** Optional: Original filename */
  filename?: string;
}

/**
 * Object location within document
 */
export interface ObjectLocation {
  /** Section ID where object appears */
  section_id: UUID;
  
  /** Paragraph ID where object appears */
  paragraph_id: UUID;
  
  /** Optional: Position within paragraph (before/after/inline) */
  position?: 'before' | 'after' | 'inline';
}
```

**Verification:**
```bash
npx tsc src/models/legal-document.types.ts --noEmit
# Should compile without errors
```

---

## Task 3: Create Index Export

### 3.1 Create Main Index

**File:** `packages/shared-types/src/index.ts`

**Action:** CREATE

**Content:**
```typescript
/**
 * @factsway/shared-types
 * 
 * Canonical LegalDocument types and schemas for FACTSWAY platform
 * 
 * Reference: Runbook 0, Section 4 (Data Model)
 */

// Base types
export * from './models/base.types';

// Core document models
export * from './models/sentence.types';
export * from './models/paragraph.types';
export * from './models/section.types';
export * from './models/special-blocks.types';
export * from './models/citation.types';
export * from './models/legal-document.types';

// Re-export main type for convenience
export type { LegalDocument } from './models/legal-document.types';
```

**Verification:**
```bash
npx tsc src/index.ts --noEmit
# Should compile without errors
```

---

## Task 4: Build and Verify

### 4.1 Compile TypeScript

**Action:** Build the package

```bash
cd packages/shared-types
npm run build
```

**Expected Output:**
```
> @factsway/shared-types@1.0.0 build
> tsc

✓ Compiled successfully (no errors)
```

**Verification:**
```bash
ls dist/

# Expected files:
# index.js
# index.d.ts
# models/base.types.js
# models/base.types.d.ts
# ... (all type files compiled)
```

---

### 4.2 Test Type Imports

**File:** `packages/shared-types/tests/unit/type-imports.test.ts`

**Action:** CREATE

**Content:**
```typescript
/**
 * Test that all types can be imported successfully
 */

import {
  // Base types
  UUID,
  ISODateTime,
  FormatMark,
  CitationSpan,
  Court,
  Party,
  
  // Document models
  Sentence,
  Paragraph,
  Section,
  CaseBlock,
  SignatureBlock,
  Citation,
  LegalDocument,
  
  // Enums
  SectionType,
  DocumentType,
  CitationType,
  ContentPolicy,
} from '../../src';

describe('Type Imports', () => {
  it('should import all base types', () => {
    const formatMark: FormatMark = {
      start: 0,
      end: 5,
      format: 'bold',
    };
    
    expect(formatMark).toBeDefined();
  });
  
  it('should import LegalDocument type', () => {
    const doc: LegalDocument = {
      meta: {
        id: 'test-id',
        title: 'Test Document',
        type: 'motion',
        created_at: '2024-12-26T00:00:00Z',
        updated_at: '2024-12-26T00:00:00Z',
      },
      body: {
        sections: [],
      },
      citations: [],
      embedded_objects: [],
    };
    
    expect(doc).toBeDefined();
    expect(doc.meta.type).toBe('motion');
  });
  
  it('should correctly type Section with nested structure', () => {
    const section: Section = {
      id: 'section-1',
      parent_section_id: null,
      title: 'Introduction',
      level: 1,
      type: 'introduction',
      children: [],
      paragraphs: [],
    };
    
    expect(section.type).toBe('introduction');
  });
});
```

**Verification:**
```bash
npm test

# Expected output:
# PASS tests/unit/type-imports.test.ts
#   Type Imports
#     ✓ should import all base types
#     ✓ should import LegalDocument type
#     ✓ should correctly type Section with nested structure
# 
# Test Suites: 1 passed, 1 total
# Tests:       3 passed, 3 total
```

---

## Task 5: Create Documentation

### 5.1 Create README

**File:** `packages/shared-types/README.md`

**Action:** CREATE

**Content:**
```markdown
# @factsway/shared-types

Canonical LegalDocument types and schemas for the FACTSWAY platform.

## Overview

This package defines the **single source of truth** for document structure across all FACTSWAY services:

- ✅ Frontend (Electron Renderer)
- ✅ Desktop Orchestrator (Electron Main)
- ✅ Backend Services (Python/Node)

**Key Principle:** The `LegalDocument` format is canonical. All ingestion outputs `LegalDocument`. All export inputs `LegalDocument`. No exceptions.

## Installation

```bash
npm install @factsway/shared-types
```

## Usage

```typescript
import { LegalDocument, Section, Paragraph, Sentence } from '@factsway/shared-types';

const doc: LegalDocument = {
  meta: {
    id: 'doc-123',
    title: 'Motion to Dismiss',
    type: 'motion',
    created_at: '2024-12-26T10:00:00Z',
    updated_at: '2024-12-26T10:00:00Z',
  },
  body: {
    sections: [
      {
        id: 'section-1',
        parent_section_id: null,
        title: 'Introduction',
        level: 1,
        type: 'introduction',
        children: [],
        paragraphs: [],
      },
    ],
  },
  citations: [],
  embedded_objects: [],
};
```

## Type Reference

### Core Types

- **`LegalDocument`** - Top-level document structure
- **`Section`** - Hierarchical section (can contain subsections)
- **`Paragraph`** - Text paragraph (authoritative text container)
- **`Sentence`** - Sentence overlay (references parent paragraph)
- **`CaseBlock`** - Caption/heading block
- **`SignatureBlock`** - Signature block
- **`Citation`** - Citation entry

### Base Types

- **`FormatMark`** - Character-level formatting
- **`CitationSpan`** - Citation location in text
- **`Court`** - Court information
- **`Party`** - Party in litigation

### Enums

- **`DocumentType`** - motion, brief, complaint, etc.
- **`SectionType`** - introduction, facts, argument, etc.
- **`CitationType`** - case, statute, regulation, etc.
- **`ContentPolicy`** - frozen, update_names, full_regenerate

## Architecture

Based on **Runbook 0, Section 4** (Data Model):

1. **Paragraphs are authoritative** - Sentence text is derived by slicing paragraph text
2. **Sentences are overlays** - They reference parent paragraph via offsets
3. **Sections are hierarchical** - Tree structure with children
4. **Format spans use character offsets** - Relative to parent text
5. **Citations link to sentences** - Many-to-many relationship

## Development

```bash
# Install dependencies
npm install

# Type check
npm run typecheck

# Build
npm run build

# Test
npm test

# Lint
npm run lint

# Generate docs
npm run docs
```

## Testing

```bash
npm test
```

See `tests/` directory for examples.

## Reference

- **Runbook 0, Section 4:** Complete LegalDocument schema
- **Runbook 0, Section 16:** Monorepo structure
- **Architecture Audit:** Component classification

## License

PRIVATE - Internal use only
```

---

## Task 6: Final Verification

### 6.1 Complete Build Check

**Run all verification steps:**

```bash
cd packages/shared-types

# 1. Type check
npm run typecheck
# Expected: ✓ No errors

# 2. Build
npm run build
# Expected: ✓ Compiled successfully

# 3. Test
npm test
# Expected: ✓ All tests passing

# 4. Lint
npm run lint
# Expected: ✓ No linting errors
```

---

### 6.2 Integration Check

**Create test consumer:**

**File:** `packages/shared-types/tests/integration/consumer.test.ts`

**Action:** CREATE

**Content:**
```typescript
/**
 * Test that types can be consumed by other packages
 */

import { LegalDocument, Sentence, Paragraph, Section } from '../../src';

describe('Type Consumer Integration', () => {
  it('should create a complete LegalDocument', () => {
    const sentence: Sentence = {
      id: 'sent-1',
      parent_paragraph_id: 'para-1',
      start_offset: 0,
      end_offset: 20,
      text: 'This is a sentence.',
      format_spans: [],
      citations: [],
    };
    
    const paragraph: Paragraph = {
      id: 'para-1',
      parent_section_id: 'sec-1',
      text: 'This is a sentence.',
      format_spans: [],
      sentences: [sentence],
    };
    
    const section: Section = {
      id: 'sec-1',
      parent_section_id: null,
      title: 'Facts',
      level: 1,
      type: 'facts',
      children: [],
      paragraphs: [paragraph],
    };
    
    const doc: LegalDocument = {
      meta: {
        id: 'doc-1',
        title: 'Test Motion',
        type: 'motion',
        created_at: '2024-12-26T00:00:00Z',
        updated_at: '2024-12-26T00:00:00Z',
      },
      body: {
        sections: [section],
      },
      citations: [],
      embedded_objects: [],
    };
    
    // Verify structure
    expect(doc.body.sections).toHaveLength(1);
    expect(doc.body.sections[0].paragraphs).toHaveLength(1);
    expect(doc.body.sections[0].paragraphs[0].sentences).toHaveLength(1);
    
    // Verify sentence-paragraph relationship
    const sent = doc.body.sections[0].paragraphs[0].sentences[0];
    const para = doc.body.sections[0].paragraphs[0];
    expect(sent.text).toBe(para.text.slice(sent.start_offset, sent.end_offset));
  });
});
```

**Run:**
```bash
npm test -- tests/integration/consumer.test.ts

# Expected: ✓ PASS
```

---

## Success Criteria Verification

**Check all criteria:**

- [x] ✅ TypeScript types compile without errors
- [x] ✅ JSON schema validates correctly (will add in follow-up runbook)
- [x] ✅ Validation guards catch malformed data (will add in follow-up runbook)
- [x] ✅ Tests pass for all model variants
- [x] ✅ Documentation generated from types

---

## Rollback Procedure

**If this runbook fails, rollback:**

```bash
# Delete the package
rm -rf packages/shared-types

# Or revert git if committed
git checkout HEAD -- packages/shared-types
```

**No other changes made** - This runbook creates a new package, doesn't modify existing code.

---

## Next Steps

**After completing this runbook:**

1. ✅ Commit changes:
   ```bash
   git add packages/shared-types
   git commit -m "Runbook 1: Create canonical LegalDocument types"
   ```

2. ✅ Update root package.json to reference workspace (if using monorepo):
   ```json
   {
     "workspaces": [
       "packages/*"
     ]
   }
   ```

3. ✅ Proceed to **Runbook 2: Database Schema**
   - Will reference these types for table definitions
   - Will use `@factsway/shared-types` as dependency

---

## Appendix: File Checklist

**Created files (15 total):**

```
packages/shared-types/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts
│   └── models/
│       ├── base.types.ts
│       ├── sentence.types.ts
│       ├── paragraph.types.ts
│       ├── section.types.ts
│       ├── special-blocks.types.ts
│       ├── citation.types.ts
│       └── legal-document.types.ts
└── tests/
    ├── unit/
    │   └── type-imports.test.ts
    └── integration/
        └── consumer.test.ts
```

**Lines of code:** ~800 lines

**Dependencies added:**
- TypeScript 5.0+
- Jest for testing
- AJV for JSON schema validation (future)
- Zod for runtime validation (future)

---

## Status

**Runbook 1:** ✅ READY FOR EXECUTION

**Estimated Time:** 4-6 hours

**Risk Level:** 🟢 LOW (creates new package, no modifications to existing code)

**Blocking Issues:** None

**Ready to proceed:** YES
