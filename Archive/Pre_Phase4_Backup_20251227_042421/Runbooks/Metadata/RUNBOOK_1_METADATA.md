---

## Metadata Summary

### Purpose
Create the canonical LegalDocument TypeScript type system that serves as the single source of truth for all data exchange between frontend, orchestrator, and backend services.

### Produces (Artifacts)

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

### Consumes (Prerequisites)

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

### Interfaces Touched

#### Type System Exports (TypeScript)
This runbook DEFINES the type system but does not expose REST/IPC interfaces directly.

**Exported Types (consumed by all other runbooks):**
- From: `@factsway/shared-types` → To: All Services/Frontend
  - Type: `LegalDocument` (main document structure)
  - Type: `Section` (hierarchical sections)
  - Type: `Paragraph` (paragraphs with formatting)
  - Type: `Sentence` (sentences with analysis)
  - Type: `CaseBlock` (case caption block)
  - Type: `SignatureBlock` (signature block)
  - Type: `Citation` (citation references)
  - Type: `UUID`, `ISODateTime`, `FilePath` (base types)

**Type Consumers (other runbooks that import these):**
- Runbook 2: Database Schema (imports for table definitions)
- Runbook 3: Records Service (imports for API types)
- Runbook 4: Ingestion Service (imports for parsing output)
- Runbook 5: Export Service (imports for DOCX generation input)
- Runbook 6: Specialized Services (imports for processing)
- Runbook 7: Desktop Orchestrator (imports for IPC types)
- Runbook 8: Electron Renderer (imports for UI state)

#### Filesystem
**Creates:**
- Path: `packages/shared-types/` (new package directory)
- Path: `packages/shared-types/dist/` (compiled TypeScript output)
- Path: `packages/shared-types/node_modules/` (dependencies)

**Reads:**
- None (creates from scratch)

**Modifies:**
- Path: `package.json` (root workspace, if monorepo)
  - Adds `packages/shared-types` to workspaces array

#### Process Lifecycle
- N/A (no processes spawned, library only)

### Invariants

**Type Invariants:**

- INVARIANT: All entity IDs are UUIDs (string format)
  - Examples: `LegalDocument.id`, `Section.id`, `Paragraph.id`, `Sentence.id`
  - Enforced by: TypeScript type system (`type UUID = string`)
  - Purpose: Globally unique identifiers across all documents
  - Detection: Type errors at compile time

- INVARIANT: All timestamps are ISO 8601 format strings
  - Examples: `LegalDocument.created_at`, `updated_at`
  - Enforced by: TypeScript type system (`type ISODateTime = string`)
  - Purpose: Consistent datetime representation
  - Detection: Runtime validation in services (future)

- INVARIANT: Sentence text matches paragraph substring
  - Formula: `Sentence.text === Paragraph.text.slice(start_offset, end_offset)`
  - Enforced by: Parser validation in Ingestion Service (Runbook 4)
  - Purpose: Ensures sentences are accurate substrings, not synthetic
  - Detection: Validation error during parsing
  - Reference: Line 375 in `sentence.types.ts` comment

**Structural Invariants:**

- INVARIANT: Section hierarchy forms a tree (no cycles)
  - Property: `Section.parent_section_id` references another section or null
  - Enforced by: Tree construction logic in services
  - Purpose: Hierarchical document structure
  - Detection: Cycle detection during section creation

- INVARIANT: Section numbering is consistent with hierarchy
  - Examples: "1", "1.1", "1.1.1" (nested) or "I", "II", "III" (roman)
  - Enforced by: Numbering generation logic in services
  - Purpose: Visual document structure matches logical structure
  - Detection: Numbering validation during export

- INVARIANT: Paragraph content is never empty
  - Property: `Paragraph.content.length > 0`
  - Enforced by: Parser validation
  - Purpose: Every paragraph must have at least one sentence
  - Detection: Validation error during document creation

**Citation Invariants:**

- INVARIANT: Citation spans reference valid sentence IDs
  - Property: `CitationSpan.sentence_id` exists in `Paragraph.content[]`
  - Enforced by: Citation linking validation
  - Purpose: Citations point to actual sentences
  - Detection: Foreign key-style validation in services

- INVARIANT: Citation character offsets are within sentence bounds
  - Property: `0 <= start_offset < end_offset <= sentence.text.length`
  - Enforced by: Citation parser
  - Purpose: Citation highlights don't exceed sentence text
  - Detection: Bounds checking during parsing

**Block Invariants:**

- INVARIANT: CaseBlock contains required fields for jurisdiction
  - Required: `case_name`, `cause_number`, `court_name`
  - Enforced by: TypeScript required properties
  - Purpose: Minimum data for case caption
  - Detection: TypeScript compiler

- INVARIANT: SignatureBlock signers array is non-empty if block exists
  - Property: `SignatureBlock.signers.length > 0`
  - Enforced by: Block validation logic
  - Purpose: Signature block must have at least one signer
  - Detection: Validation during document creation

### Verification Gates

**Type Compilation Verification:**
- Command: `cd packages/shared-types && npm run build`
- Expected: 
  ```
  ✓ Compiled successfully
  ✓ No type errors
  ✓ Generated .d.ts files in dist/
  ```
- Purpose: Verify types compile without errors

**Unit Test Verification:**
- Command: `cd packages/shared-types && npm test`
- Expected:
  ```
  PASS tests/unit/type-imports.test.ts
    ✓ should import LegalDocument type
    ✓ should correctly type Section with nested structure
  
  Test Suites: 1 passed, 1 total
  Tests: 2 passed, 2 total
  ```
- Purpose: Verify types can be imported and used

**Integration Test Verification:**
- Command: `cd packages/shared-types && npm test -- tests/integration/consumer.test.ts`
- Expected:
  ```
  PASS tests/integration/consumer.test.ts
    ✓ should create a complete LegalDocument
  
  Test Suites: 1 passed, 1 total
  Tests: 1 passed, 1 total
  ```
- Purpose: Verify types work in realistic usage scenario

**TypeScript Strict Mode Verification:**
- Command: `cd packages/shared-types && npx tsc --noEmit`
- Expected: `No errors`
- Purpose: Verify types are strict-mode compliant (no `any`, proper null handling)

**Package Installation Verification:**
- Command: `cd packages/shared-types && npm pack`
- Expected: Creates `factsway-shared-types-1.0.0.tgz` file
- Purpose: Verify package can be installed by other projects

**Consumer Import Verification:**
- Command: Create test file and import types
  ```typescript
  import { LegalDocument, Section } from '@factsway/shared-types';
  const doc: LegalDocument = { /* ... */ };
  ```
- Expected: No import errors, full IntelliSense support
- Purpose: Verify package exports are correct

### Risks

**Technical Risks:**

- **Risk:** Type definitions become inconsistent with Runbook 0 schema
  - **Severity:** HIGH
  - **Likelihood:** MEDIUM
  - **Impact:** Services implement wrong schema, data corruption, integration failures
  - **Mitigation:** 
    - Cross-reference every type with Runbook 0 Section 4 during implementation
    - Add JSON schema validation (future) to catch mismatches at runtime
  - **Detection:** Integration tests fail, services can't communicate

- **Risk:** Breaking changes to types after other services depend on them
  - **Severity:** HIGH
  - **Likelihood:** LOW
  - **Impact:** All consuming services break, massive refactoring required
  - **Mitigation:** 
    - Version the package properly (semver)
    - Never remove fields, only add (backwards compatible)
    - Use deprecation warnings before removing
  - **Detection:** Type errors in consuming services, CI/CD catches

- **Risk:** TypeScript compilation fails in consuming services
  - **Severity:** MEDIUM
  - **Likelihood:** LOW
  - **Impact:** Services can't build, development blocked
  - **Mitigation:**
    - Use TypeScript 5.0+ in all projects (consistent version)
    - Test compilation in multiple consuming contexts
  - **Detection:** Build failures in CI/CD

**Data Risks:**

- **Risk:** Sentence offset invariant violated during parsing
  - **Severity:** MEDIUM
  - **Likelihood:** MEDIUM (complex parsing logic)
  - **Impact:** Sentences don't match paragraph text, citations break
  - **Mitigation:**
    - Strict validation in Ingestion Service (Runbook 4)
    - Unit tests for edge cases (empty paragraphs, special characters)
  - **Detection:** Assertion failures during parsing, export mismatch

- **Risk:** UUID generation collisions (extremely unlikely)
  - **Severity:** CRITICAL (if occurs)
  - **Likelihood:** VERY LOW (<1 in 2^122)
  - **Impact:** Documents with same ID, data corruption
  - **Mitigation:**
    - Use crypto.randomUUID() or uuid package (v4)
    - Never generate UUIDs client-side without entropy
  - **Detection:** Unique constraint violations in database

**Operational Risks:**

- **Risk:** Package not published to npm, services can't install
  - **Severity:** LOW (development only)
  - **Likelihood:** LOW
  - **Impact:** Manual linking required, slower development
  - **Mitigation:**
    - Use npm workspaces for monorepo setup
    - Local linking with `npm link` works as fallback
  - **Detection:** `npm install @factsway/shared-types` fails

**Performance Risks:**

- **Risk:** Large type files slow down TypeScript compilation
  - **Severity:** LOW
  - **Likelihood:** LOW (only ~1,000 lines)
  - **Impact:** Slower builds in consuming services (seconds, not minutes)
  - **Mitigation:**
    - Keep type files modular (already done)
    - Use incremental compilation (tsconfig.json already configured)
  - **Detection:** Slow `tsc` times in consuming services

**Integration Risks:**

- **Risk:** Type mismatches between frontend (Tiptap) and backend (LegalDocument)
  - **Severity:** HIGH
  - **Likelihood:** MEDIUM
  - **Impact:** Frontend can't render backend data, manual transformation needed
  - **Mitigation:**
    - Runbook 8 (Renderer) must transform Tiptap ↔ LegalDocument explicitly
    - Test round-trip conversions (Tiptap → LegalDocument → Tiptap)
  - **Detection:** UI rendering errors, data loss on export

## Template Notes

**Implementation Priority:** CRITICAL - All other runbooks depend on this type system

**Before Starting Implementation:**
1. Read Runbook 0 Section 4 (LegalDocument Schema) in parallel with this metadata
2. Verify every type definition matches the canonical schema exactly
3. Set up TypeScript strict mode from the start (no shortcuts)
4. This is the contract layer - get it wrong and everything breaks

**LLM-Assisted Implementation Strategy:**

**Step 1: Type Hierarchy (Bottom-Up)**
- Start with leaf types: `UUID`, `Offset`, `CitationReference`
- Then build up: `Sentence` → `Paragraph` → `Section` → `LegalDocument`
- Verify each type compiles before moving to next level
- Use the line count estimates (Produces section) to gauge completeness

**Step 2: Invariant Validation**
- Each invariant in this metadata should become a TypeScript type constraint where possible
- Example: "Section.id must be UUID" → Use `id: UUID` type (branded string)
- Where TypeScript can't enforce (e.g., offset ranges), document in JSDoc

**Step 3: Verification Gates**
- Run EACH verification gate after completing its corresponding section
- Don't accumulate "I'll test it all at the end" technical debt
- The 6 verification gates are your progress checkpoints

**Critical Invariants to Enforce:**
- **Type safety (HARD):** Every field has explicit type, no `any`, no implicit `undefined`
- **Structural completeness (HARD):** All fields from Runbook 0 Section 4 present
- **UUID format (HARD):** Use branded string types for UUID validation
- **Offset integrity (HARD):** Sentence offsets must be numbers (validation happens at ingestion)

**Common LLM Pitfalls to Avoid:**
1. **Don't over-engineer:** LegalDocument is a data transfer object, not a class with methods
2. **Don't add fields:** Only include fields from Runbook 0 Section 4 (resist "improvements")
3. **Don't skip optionality:** `content_json?` vs `content_json` matters - get it right
4. **Don't forget exports:** Package must export all types (check package.json exports field)

**Validation Checklist (Before Proceeding to Runbook 2):**
- [ ] All 10 TypeScript files created (check file count in Produces section)
- [ ] ~1,010 lines total (within 10% is acceptable)
- [ ] `npm run build` succeeds with zero errors
- [ ] `npm run test` passes (type validation tests)
- [ ] `tsc --noEmit --strict` passes (strictest TypeScript check)
- [ ] Package published locally (verify with `npm link`)
- [ ] All 6 verification gates executed and passed

**Handoff to Next Runbook:**
- Runbook 2 (Database Schema) will import these types
- Any type errors in Runbook 2 mean you need to fix Runbook 1 first
- Database schema columns must match LegalDocument type fields exactly

---

**End of Metadata for Runbook 1**
