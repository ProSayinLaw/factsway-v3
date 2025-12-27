## Purpose
Create the canonical LegalDocument TypeScript type system that serves as the single source of truth for all data exchange between frontend, orchestrator, and backend services.

## Produces (Artifacts)
**Packages:**
- Package: `@factsway/shared-types` (npm package, publishable)
  - Version: 1.0.0
  - TypeScript types only (no runtime code)
  - Consumed by all other runbooks

**Files:**
- File: `packages/shared-types/package.json` (npm configuration)
- File: `packages/shared-types/tsconfig.json` (TypeScript compilation config)
- File: `packages/shared-types/README.md` (documentation)
- File: `packages/shared-types/src/index.ts` (main export file, ~100 lines)
- File: `packages/shared-types/src/models/base.types.ts` (base types, ~80 lines)
  - Purpose: UUID, ISODateTime, FilePath, FormatMark, CitationSpan
- File: `packages/shared-types/src/models/sentence.types.ts` (sentence types, ~120 lines)
  - Purpose: Sentence, SentenceAnalysis, claim types
- File: `packages/shared-types/src/models/paragraph.types.ts` (paragraph types, ~100 lines)
  - Purpose: Paragraph, ParagraphNumbering, numbering styles
- File: `packages/shared-types/src/models/section.types.ts` (section types, ~100 lines)
  - Purpose: Section, SectionType, SectionMetadata
- File: `packages/shared-types/src/models/special-blocks.types.ts` (case/signature blocks, ~150 lines)
  - Purpose: CaseBlock, SignatureBlock, ApprovedBlock, styling
- File: `packages/shared-types/src/models/citation.types.ts` (citation types, ~80 lines)
  - Purpose: Citation, CitationType, ParsedCaseCitation
- File: `packages/shared-types/src/models/legal-document.types.ts` (main document type, ~150 lines)
  - Purpose: LegalDocument, DocumentType, DocumentMeta, DocumentBody
- File: `packages/shared-types/tests/unit/type-imports.test.ts` (unit tests, ~50 lines)
- File: `packages/shared-types/tests/integration/consumer.test.ts` (integration tests, ~80 lines)

**Total Lines:** ~1,010 lines of TypeScript + tests

## Consumes (Prereqs)
**Required Runbooks:**
- None (Runbook 1 is foundational)

**Required Files:**
- None (creates from scratch)

**Required Environment:**
- Node.js 18+ (for TypeScript compilation)
- npm or pnpm (package manager)

**Required Dependencies:**
- typescript@^5.0.0 (TypeScript compiler)
- @types/node@^20.10.0 (Node.js type definitions)
- jest@^29.7.0 (testing framework)
- ts-jest@^29.1.1 (TypeScript Jest transformer)

## Interfaces Touched
- REST endpoints
  - UNSPECIFIED
  - TODO: Document REST endpoints (Metadata/RUNBOOK_1_METADATA.md:L1-L367)
- IPC channels/events (if any)
  - This runbook DEFINES the type system but does not expose REST/IPC interfaces directly. (Source: Metadata/RUNBOOK_1_METADATA.md:L61-L61) "This runbook DEFINES the type system but does not expose REST/IPC interfaces directly."
  - - Runbook 7: Desktop Orchestrator (imports for IPC types) (Source: Metadata/RUNBOOK_1_METADATA.md:L80-L80) "- Runbook 7: Desktop Orchestrator (imports for IPC types)"
- Filesystem paths/formats
  - package.json (Source: Metadata/RUNBOOK_1_METADATA.md:L17-L17) "- File: `packages/shared-types/package.json` (npm configuration)"
  - tsconfig.json (Source: Metadata/RUNBOOK_1_METADATA.md:L18-L18) "- File: `packages/shared-types/tsconfig.json` (TypeScript compilation config)"
  - README.md (Source: Metadata/RUNBOOK_1_METADATA.md:L19-L19) "- File: `packages/shared-types/README.md` (documentation)"
  - package.json (Source: Metadata/RUNBOOK_1_METADATA.md:L93-L93) "- Path: `package.json` (root workspace, if monorepo)"
  - tsconfig.json (Source: Metadata/RUNBOOK_1_METADATA.md:L297-L297) "- Use incremental compilation (tsconfig.json already configured)"
  - package.json (Source: Metadata/RUNBOOK_1_METADATA.md:L349-L349) "4. **Don't forget exports:** Package must export all types (check package.json exports field)"
- Process lifecycle (if any)
  - - N/A (no processes spawned, library only)

## Contracts Defined or Used
- IPC This runbook DEFINES the type system but does not expose REST/IPC interfaces directly. (Source: Metadata/RUNBOOK_1_METADATA.md:L61-L61) "This runbook DEFINES the type system but does not expose REST/IPC interfaces directly."
- IPC - Runbook 7: Desktop Orchestrator (imports for IPC types) (Source: Metadata/RUNBOOK_1_METADATA.md:L80-L80) "- Runbook 7: Desktop Orchestrator (imports for IPC types)"
- Schema LegalDocument (Source: Metadata/RUNBOOK_1_METADATA.md:L6-L6) "Create the canonical LegalDocument TypeScript type system that serves as the single source of truth for all data exchange between frontend, orchestrator, and backend services."
- Schema type system (Source: Metadata/RUNBOOK_1_METADATA.md:L6-L6) "Create the canonical LegalDocument TypeScript type system that serves as the single source of truth for all data exchange between frontend, orchestrator, and backend services."
- Schema LegalDocument (Source: Metadata/RUNBOOK_1_METADATA.md:L34-L34) "- Purpose: LegalDocument, DocumentType, DocumentMeta, DocumentBody"
- Schema type definitions (Source: Metadata/RUNBOOK_1_METADATA.md:L54-L54) "- @types/node@^20.10.0 (Node.js type definitions)"
- Schema type system (Source: Metadata/RUNBOOK_1_METADATA.md:L61-L61) "This runbook DEFINES the type system but does not expose REST/IPC interfaces directly."
- Schema LegalDocument (Source: Metadata/RUNBOOK_1_METADATA.md:L65-L65) "- Type: `LegalDocument` (main document structure)"
- Schema Schema (Source: Metadata/RUNBOOK_1_METADATA.md:L75-L75) "- Runbook 2: Database Schema (imports for table definitions)"
- Schema LegalDocument (Source: Metadata/RUNBOOK_1_METADATA.md:L104-L104) "- Examples: `LegalDocument.id`, `Section.id`, `Paragraph.id`, `Sentence.id`"
- Schema type system (Source: Metadata/RUNBOOK_1_METADATA.md:L105-L105) "- Enforced by: TypeScript type system (`type UUID = string`)"
- Schema LegalDocument (Source: Metadata/RUNBOOK_1_METADATA.md:L110-L110) "- Examples: `LegalDocument.created_at`, `updated_at`"
- Schema type system (Source: Metadata/RUNBOOK_1_METADATA.md:L111-L111) "- Enforced by: TypeScript type system (`type ISODateTime = string`)"
- Schema type errors (Source: Metadata/RUNBOOK_1_METADATA.md:L177-L177) "✓ No type errors"
- Schema LegalDocument (Source: Metadata/RUNBOOK_1_METADATA.md:L187-L187) "✓ should import LegalDocument type"
- Schema type Section (Source: Metadata/RUNBOOK_1_METADATA.md:L188-L188) "✓ should correctly type Section with nested structure"
- Schema LegalDocument (Source: Metadata/RUNBOOK_1_METADATA.md:L200-L200) "✓ should create a complete LegalDocument"
- Schema LegalDocument (Source: Metadata/RUNBOOK_1_METADATA.md:L220-L220) "import { LegalDocument, Section } from '@factsway/shared-types';"
- Schema LegalDocument (Source: Metadata/RUNBOOK_1_METADATA.md:L221-L221) "const doc: LegalDocument = { /* ... */ };"
- Schema schema (Source: Metadata/RUNBOOK_1_METADATA.md:L230-L230) "- **Risk:** Type definitions become inconsistent with Runbook 0 schema"
- Schema schema (Source: Metadata/RUNBOOK_1_METADATA.md:L233-L233) "- **Impact:** Services implement wrong schema, data corruption, integration failures"
- Schema type with (Source: Metadata/RUNBOOK_1_METADATA.md:L235-L235) "- Cross-reference every type with Runbook 0 Section 4 during implementation"
- Schema JSON schema (Source: Metadata/RUNBOOK_1_METADATA.md:L236-L236) "- Add JSON schema validation (future) to catch mismatches at runtime"
- Schema type files (Source: Metadata/RUNBOOK_1_METADATA.md:L291-L291) "- **Risk:** Large type files slow down TypeScript compilation"
- Schema type files (Source: Metadata/RUNBOOK_1_METADATA.md:L296-L296) "- Keep type files modular (already done)"
- Schema LegalDocument (Source: Metadata/RUNBOOK_1_METADATA.md:L302-L302) "- **Risk:** Type mismatches between frontend (Tiptap) and backend (LegalDocument)"
- Schema LegalDocument (Source: Metadata/RUNBOOK_1_METADATA.md:L307-L307) "- Runbook 8 (Renderer) must transform Tiptap ↔ LegalDocument explicitly"
- Schema LegalDocument (Source: Metadata/RUNBOOK_1_METADATA.md:L308-L308) "- Test round-trip conversions (Tiptap → LegalDocument → Tiptap)"
- Schema type system (Source: Metadata/RUNBOOK_1_METADATA.md:L313-L313) "**Implementation Priority:** CRITICAL - All other runbooks depend on this type system"
- Schema LegalDocument (Source: Metadata/RUNBOOK_1_METADATA.md:L316-L316) "1. Read Runbook 0 Section 4 (LegalDocument Schema) in parallel with this metadata"
- Schema schema (Source: Metadata/RUNBOOK_1_METADATA.md:L317-L317) "2. Verify every type definition matches the canonical schema exactly"
- Schema type definition (Source: Metadata/RUNBOOK_1_METADATA.md:L317-L317) "2. Verify every type definition matches the canonical schema exactly"
- Schema LegalDocument (Source: Metadata/RUNBOOK_1_METADATA.md:L325-L325) "- Then build up: `Sentence` → `Paragraph` → `Section` → `LegalDocument`"
- Schema type compiles (Source: Metadata/RUNBOOK_1_METADATA.md:L326-L326) "- Verify each type compiles before moving to next level"
- Schema type constraint (Source: Metadata/RUNBOOK_1_METADATA.md:L330-L330) "- Each invariant in this metadata should become a TypeScript type constraint where possible"
- Schema LegalDocument (Source: Metadata/RUNBOOK_1_METADATA.md:L346-L346) "1. **Don't over-engineer:** LegalDocument is a data transfer object, not a class with methods"
- Schema type validation (Source: Metadata/RUNBOOK_1_METADATA.md:L355-L355) "- [ ] `npm run test` passes (type validation tests)"
- Schema Schema (Source: Metadata/RUNBOOK_1_METADATA.md:L361-L361) "- Runbook 2 (Database Schema) will import these types"
- Schema type errors (Source: Metadata/RUNBOOK_1_METADATA.md:L362-L362) "- Any type errors in Runbook 2 mean you need to fix Runbook 1 first"
- Schema schema (Source: Metadata/RUNBOOK_1_METADATA.md:L363-L363) "- Database schema columns must match LegalDocument type fields exactly"
- Schema type fields (Source: Metadata/RUNBOOK_1_METADATA.md:L363-L363) "- Database schema columns must match LegalDocument type fields exactly"
- File package.json (Source: Metadata/RUNBOOK_1_METADATA.md:L17-L17) "- File: `packages/shared-types/package.json` (npm configuration)"
- File tsconfig.json (Source: Metadata/RUNBOOK_1_METADATA.md:L18-L18) "- File: `packages/shared-types/tsconfig.json` (TypeScript compilation config)"
- File README.md (Source: Metadata/RUNBOOK_1_METADATA.md:L19-L19) "- File: `packages/shared-types/README.md` (documentation)"
- File package.json (Source: Metadata/RUNBOOK_1_METADATA.md:L93-L93) "- Path: `package.json` (root workspace, if monorepo)"
- File tsconfig.json (Source: Metadata/RUNBOOK_1_METADATA.md:L297-L297) "- Use incremental compilation (tsconfig.json already configured)"
- File package.json (Source: Metadata/RUNBOOK_1_METADATA.md:L349-L349) "4. **Don't forget exports:** Package must export all types (check package.json exports field)"

## Invariants Relied On
- - INVARIANT: All entity IDs are UUIDs (string format) (Source: Metadata/RUNBOOK_1_METADATA.md:L103-L103) "- INVARIANT: All entity IDs are UUIDs (string format)"
- - INVARIANT: All timestamps are ISO 8601 format strings (Source: Metadata/RUNBOOK_1_METADATA.md:L109-L109) "- INVARIANT: All timestamps are ISO 8601 format strings"
- - INVARIANT: Sentence text matches paragraph substring (Source: Metadata/RUNBOOK_1_METADATA.md:L115-L115) "- INVARIANT: Sentence text matches paragraph substring"
- - INVARIANT: Section hierarchy forms a tree (no cycles) (Source: Metadata/RUNBOOK_1_METADATA.md:L124-L124) "- INVARIANT: Section hierarchy forms a tree (no cycles)"
- - INVARIANT: Section numbering is consistent with hierarchy (Source: Metadata/RUNBOOK_1_METADATA.md:L130-L130) "- INVARIANT: Section numbering is consistent with hierarchy"
- - INVARIANT: Paragraph content is never empty (Source: Metadata/RUNBOOK_1_METADATA.md:L136-L136) "- INVARIANT: Paragraph content is never empty"
- - INVARIANT: Citation spans reference valid sentence IDs (Source: Metadata/RUNBOOK_1_METADATA.md:L144-L144) "- INVARIANT: Citation spans reference valid sentence IDs"
- - INVARIANT: Citation character offsets are within sentence bounds (Source: Metadata/RUNBOOK_1_METADATA.md:L150-L150) "- INVARIANT: Citation character offsets are within sentence bounds"
- - INVARIANT: CaseBlock contains required fields for jurisdiction (Source: Metadata/RUNBOOK_1_METADATA.md:L158-L158) "- INVARIANT: CaseBlock contains required fields for jurisdiction"
- - INVARIANT: SignatureBlock signers array is non-empty if block exists (Source: Metadata/RUNBOOK_1_METADATA.md:L164-L164) "- INVARIANT: SignatureBlock signers array is non-empty if block exists"
- - **Risk:** Sentence offset invariant violated during parsing (Source: Metadata/RUNBOOK_1_METADATA.md:L260-L260) "- **Risk:** Sentence offset invariant violated during parsing"
- **Step 2: Invariant Validation** (Source: Metadata/RUNBOOK_1_METADATA.md:L329-L329) "**Step 2: Invariant Validation**"
- - Each invariant in this metadata should become a TypeScript type constraint where possible (Source: Metadata/RUNBOOK_1_METADATA.md:L330-L330) "- Each invariant in this metadata should become a TypeScript type constraint where possible"

## Verification Gate (Commands + Expected Outputs)
- - Purpose: Verify types compile without errors (Source: Metadata/RUNBOOK_1_METADATA.md:L180-L180) "- Purpose: Verify types compile without errors"
- - Command: `cd packages/shared-types && npm test` (Source: Metadata/RUNBOOK_1_METADATA.md:L183-L183) "- Command: `cd packages/shared-types && npm test`"
- - Purpose: Verify types can be imported and used (Source: Metadata/RUNBOOK_1_METADATA.md:L193-L193) "- Purpose: Verify types can be imported and used"
- - Command: `cd packages/shared-types && npm test -- tests/integration/consumer.test.ts` (Source: Metadata/RUNBOOK_1_METADATA.md:L196-L196) "- Command: `cd packages/shared-types && npm test -- tests/integration/consumer.test.ts`"
- - Purpose: Verify types work in realistic usage scenario (Source: Metadata/RUNBOOK_1_METADATA.md:L205-L205) "- Purpose: Verify types work in realistic usage scenario"
- - Purpose: Verify types are strict-mode compliant (no `any`, proper null handling) (Source: Metadata/RUNBOOK_1_METADATA.md:L210-L210) "- Purpose: Verify types are strict-mode compliant (no `any`, proper null handling)"
- - Purpose: Verify package can be installed by other projects (Source: Metadata/RUNBOOK_1_METADATA.md:L215-L215) "- Purpose: Verify package can be installed by other projects"
- - Purpose: Verify package exports are correct (Source: Metadata/RUNBOOK_1_METADATA.md:L224-L224) "- Purpose: Verify package exports are correct"
- 2. Verify every type definition matches the canonical schema exactly (Source: Metadata/RUNBOOK_1_METADATA.md:L317-L317) "2. Verify every type definition matches the canonical schema exactly"
- - Verify each type compiles before moving to next level (Source: Metadata/RUNBOOK_1_METADATA.md:L326-L326) "- Verify each type compiles before moving to next level"
- - [ ] Package published locally (verify with `npm link`) (Source: Metadata/RUNBOOK_1_METADATA.md:L357-L357) "- [ ] Package published locally (verify with `npm link`)"

## Risks / Unknowns (TODOs)
- - **Risk:** Type definitions become inconsistent with Runbook 0 schema (Source: Metadata/RUNBOOK_1_METADATA.md:L230-L230) "- **Risk:** Type definitions become inconsistent with Runbook 0 schema"
- - **Risk:** Breaking changes to types after other services depend on them (Source: Metadata/RUNBOOK_1_METADATA.md:L239-L239) "- **Risk:** Breaking changes to types after other services depend on them"
- - **Risk:** TypeScript compilation fails in consuming services (Source: Metadata/RUNBOOK_1_METADATA.md:L249-L249) "- **Risk:** TypeScript compilation fails in consuming services"
- - **Risk:** Sentence offset invariant violated during parsing (Source: Metadata/RUNBOOK_1_METADATA.md:L260-L260) "- **Risk:** Sentence offset invariant violated during parsing"
- - **Risk:** UUID generation collisions (extremely unlikely) (Source: Metadata/RUNBOOK_1_METADATA.md:L269-L269) "- **Risk:** UUID generation collisions (extremely unlikely)"
- - **Risk:** Package not published to npm, services can't install (Source: Metadata/RUNBOOK_1_METADATA.md:L280-L280) "- **Risk:** Package not published to npm, services can't install"
- - **Risk:** Large type files slow down TypeScript compilation (Source: Metadata/RUNBOOK_1_METADATA.md:L291-L291) "- **Risk:** Large type files slow down TypeScript compilation"
- - **Risk:** Type mismatches between frontend (Tiptap) and backend (LegalDocument) (Source: Metadata/RUNBOOK_1_METADATA.md:L302-L302) "- **Risk:** Type mismatches between frontend (Tiptap) and backend (LegalDocument)"
