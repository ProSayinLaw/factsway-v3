## Purpose
UNSPECIFIED
TODO: Provide details (01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1-L1607)

## Produces (Artifacts)
UNSPECIFIED
TODO: Provide details (01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1-L1607)

## Consumes (Prereqs)
UNSPECIFIED
TODO: Provide details (01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1-L1607)

## Interfaces Touched
- REST endpoints
  - UNSPECIFIED
  - TODO: Document REST endpoints (01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1-L1607)
- IPC channels/events (if any)
  - UNSPECIFIED
  - TODO: Document IPC channels/events (01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1-L1607)
- Filesystem paths/formats
  - 01_COMPLETE_ARCHITECTURE_MAP.md (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L35-L35) "- **01_COMPLETE_ARCHITECTURE_MAP.md, Part 2, Section 2:** Target directory structure"
  - package.json (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L92-L92) "### 1.2 Create package.json"
  - package.json (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L94-L94) "**File:** `packages/shared-types/package.json`"
  - tsconfig.json (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L148-L148) "### 1.3 Create tsconfig.json"
  - tsconfig.json (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L150-L150) "**File:** `packages/shared-types/tsconfig.json`"
  - README.md (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1261-L1261) "**File:** `packages/shared-types/README.md`"
  - package.json (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1546-L1546) "2. ✅ Update root package.json to reference workspace (if using monorepo):"
  - package.json (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1567-L1567) "├── package.json"
  - tsconfig.json (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1568-L1568) "├── tsconfig.json"
  - README.md (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1569-L1569) "├── README.md"
- Process lifecycle (if any)
  - UNSPECIFIED
  - TODO: Document process lifecycle (01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1-L1607)

## Contracts Defined or Used
- Schema LegalDocument (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1-L1) "# Runbook 1: Reference Document - LegalDocument Types & Schema"
- Schema LegalDocument (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L13-L13) "Create the **canonical LegalDocument TypeScript types and JSON schema** that serve as the single source of truth for all data exchange between frontend, orchestrator, and..."
- Schema JSON schema (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L17-L17) "- ✅ JSON schema validates correctly"
- Schema LegalDocument (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L27-L27) "- **Section 4:** LegalDocument Schema (Canonical Backend Contract)"
- Schema LegalDocument (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L39-L39) "> "The LegalDocument format is canonical. All ingestion outputs LegalDocument. All export inputs LegalDocument. No exceptions.""
- Schema LegalDocument (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L48-L48) "- ❌ No TypeScript interfaces for LegalDocument"
- Schema JSON schema (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L49-L49) "- ❌ No JSON schema validation"
- Schema JSON schema (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L54-L54) "- ✅ JSON schema for runtime validation"
- Schema LegalDocument (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L103-L103) ""description": "Canonical LegalDocument types and schemas for FACTSWAY platform","
- Schema schema (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L117-L117) ""schema""
- Schema zod (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L134-L134) ""zod": "^3.22.0""
- Schema LegalDocument (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L197-L197) "* Base types used across all LegalDocument components"
- Schema type UUID (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L205-L205) "export type UUID = string;"
- Schema type ISODateTime (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L211-L211) "export type ISODateTime = string;"
- Schema type FilePath (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L216-L216) "export type FilePath = string;"
- Schema type CharacterOffset (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L221-L221) "export type CharacterOffset = number;"
- Schema interface FormatMark (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L228-L228) "export interface FormatMark {"
- Schema interface CitationSpan (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L250-L250) "export interface CitationSpan {"
- Schema type detected (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L260-L260) "/** Citation type detected */"
- Schema type ConfidenceLevel (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L270-L270) "export type ConfidenceLevel = 'high' | 'medium' | 'low';"
- Schema interface Court (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L275-L275) "export interface Court {"
- Schema interface Party (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L292-L292) "export interface Party {"
- Schema interface PreservationMetadata (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L314-L314) "export interface PreservationMetadata {"
- Schema interface Sentence (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L359-L359) "export interface Sentence {"
- Schema interface SentenceAnalysis (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L394-L394) "export interface SentenceAnalysis {"
- Schema type classification (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L398-L398) "/** Claim type classification */"
- Schema type NumberingStyle (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L449-L449) "export type NumberingStyle ="
- Schema interface Paragraph (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L461-L461) "export interface Paragraph {"
- Schema interface ParagraphNumbering (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L500-L500) "export interface ParagraphNumbering {"
- Schema type classification (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L541-L541) "* Section type classification"
- Schema type SectionType (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L543-L543) "export type SectionType ="
- Schema interface Section (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L558-L558) "export interface Section {"
- Schema type classification (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L574-L574) "/** Section type classification */"
- Schema interface SectionMetadata (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L590-L590) "export interface SectionMetadata {"
- Schema type classification (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L594-L594) "/** Confidence in type classification (0.0 - 1.0) */"
- Schema type ContentPolicy (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L634-L634) "export type ContentPolicy ="
- Schema schema (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L637-L637) "| 'full_regenerate'; // Regenerate from schema"
- Schema interface CaseBlock (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L642-L642) "export interface CaseBlock {"
- Schema interface SignatureBlock (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L674-L674) "export interface SignatureBlock {"
- Schema interface Signer (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L694-L694) "export interface Signer {"
- Schema interface ApprovedBlock (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L732-L732) "export interface ApprovedBlock {"
- Schema interface CaseBlockStyling (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L749-L749) "export interface CaseBlockStyling {"
- Schema interface SignatureStyling (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L772-L772) "export interface SignatureStyling {"
- Schema type CitationType (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L817-L817) "export type CitationType ="
- Schema interface Citation (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L829-L829) "export interface Citation {"
- Schema interface ParsedCaseCitation (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L855-L855) "export interface ParsedCaseCitation {"
- Schema LegalDocument (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L884-L884) "### 2.7 Create Main LegalDocument Type"
- Schema LegalDocument (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L893-L893) "* Main LegalDocument model"
- Schema type classification (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L907-L907) "* Document type classification"
- Schema type DocumentType (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L909-L909) "export type DocumentType ="
- Schema LegalDocument (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L921-L921) "* LegalDocument - Canonical Format"
- Schema LegalDocument (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L925-L925) "export interface LegalDocument {"
- Schema interface LegalDocument (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L925-L925) "export interface LegalDocument {"
- Schema interface DocumentMeta (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L965-L965) "export interface DocumentMeta {"
- Schema interface CaseHeader (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L997-L997) "export interface CaseHeader {"
- Schema interface DocumentBody (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1014-L1014) "export interface DocumentBody {"
- Schema interface BodyMetadata (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1025-L1025) "export interface BodyMetadata {"
- Schema interface EmbeddedObject (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1039-L1039) "export interface EmbeddedObject {"
- Schema interface ObjectLocation (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1062-L1062) "export interface ObjectLocation {"
- Schema LegalDocument (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1095-L1095) "* Canonical LegalDocument types and schemas for FACTSWAY platform"
- Schema type for (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1111-L1111) "// Re-export main type for convenience"
- Schema LegalDocument (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1112-L1112) "export type { LegalDocument } from './models/legal-document.types';"
- Schema type files (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1151-L1151) "# ... (all type files compiled)"
- Schema LegalDocument (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1184-L1184) "LegalDocument,"
- Schema LegalDocument (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1204-L1204) "it('should import LegalDocument type', () => {"
- Schema LegalDocument (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1205-L1205) "const doc: LegalDocument = {"
- Schema type Section (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1224-L1224) "it('should correctly type Section with nested structure', () => {"
- Schema LegalDocument (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1248-L1248) "# ✓ should import LegalDocument type"
- Schema type Section (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1249-L1249) "# ✓ should correctly type Section with nested structure"
- Schema LegalDocument (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1269-L1269) "Canonical LegalDocument types and schemas for the FACTSWAY platform."
- Schema LegalDocument (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1279-L1279) "**Key Principle:** The `LegalDocument` format is canonical. All ingestion outputs `LegalDocument`. All export inputs `LegalDocument`. No exceptions."
- Schema LegalDocument (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1290-L1290) "import { LegalDocument, Section, Paragraph, Sentence } from '@factsway/shared-types';"
- Schema LegalDocument (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1292-L1292) "const doc: LegalDocument = {"
- Schema LegalDocument (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1322-L1322) "- **`LegalDocument`** - Top-level document structure"
- Schema LegalDocument (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1386-L1386) "- **Runbook 0, Section 4:** Complete LegalDocument schema"
- Schema LegalDocument (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1439-L1439) "import { LegalDocument, Sentence, Paragraph, Section } from '../../src';"
- Schema LegalDocument (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1442-L1442) "it('should create a complete LegalDocument', () => {"
- Schema LegalDocument (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1471-L1471) "const doc: LegalDocument = {"
- Schema JSON schema (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1513-L1513) "- [x] ✅ JSON schema validates correctly (will add in follow-up runbook)"
- Schema LegalDocument (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1543-L1543) "git commit -m "Runbook 1: Create canonical LegalDocument types""
- Schema Schema (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1555-L1555) "3. ✅ Proceed to **Runbook 2: Database Schema**"
- Schema JSON schema (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1592-L1592) "- AJV for JSON schema validation (future)"
- Schema Zod (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1593-L1593) "- Zod for runtime validation (future)"
- File 01_COMPLETE_ARCHITECTURE_MAP.md (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L35-L35) "- **01_COMPLETE_ARCHITECTURE_MAP.md, Part 2, Section 2:** Target directory structure"
- File package.json (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L92-L92) "### 1.2 Create package.json"
- File package.json (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L94-L94) "**File:** `packages/shared-types/package.json`"
- File tsconfig.json (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L148-L148) "### 1.3 Create tsconfig.json"
- File tsconfig.json (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L150-L150) "**File:** `packages/shared-types/tsconfig.json`"
- File README.md (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1261-L1261) "**File:** `packages/shared-types/README.md`"
- File package.json (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1546-L1546) "2. ✅ Update root package.json to reference workspace (if using monorepo):"
- File package.json (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1567-L1567) "├── package.json"
- File tsconfig.json (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1568-L1568) "├── tsconfig.json"
- File README.md (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1569-L1569) "├── README.md"

## Invariants Relied On
- * INVARIANT: text === paragraph.text.slice(start_offset, end_offset) (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L375-L375) "* INVARIANT: text === paragraph.text.slice(start_offset, end_offset)"

## Verification Gate (Commands + Expected Outputs)
- ## Task 4: Build and Verify (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1123-L1123) "## Task 4: Build and Verify"
- npm test (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1242-L1242) "npm test"
- npm test (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1367-L1367) "npm test"
- npm test (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1379-L1379) "npm test"
- npm test (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1415-L1415) "npm test"
- // Verify structure (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1486-L1486) "// Verify structure"
- // Verify sentence-paragraph relationship (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1491-L1491) "// Verify sentence-paragraph relationship"
- npm test -- tests/integration/consumer.test.ts (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1501-L1501) "npm test -- tests/integration/consumer.test.ts"

## Risks / Unknowns (TODOs)
- **Risk Level:** 🟢 LOW (creates new package, no modifications to existing code) (Source: 01_RUNBOOK_01_REFERENCE_DOCUMENT.md:L1603-L1603) "**Risk Level:** 🟢 LOW (creates new package, no modifications to existing code)"
