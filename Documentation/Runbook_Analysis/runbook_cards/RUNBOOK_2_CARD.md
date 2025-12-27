## Purpose
Create complete database schema with SQLite (desktop) and PostgreSQL (cloud) migrations, implementing repository pattern for type-safe data access to Templates, Cases, Drafts, and Evidence.

## Produces (Artifacts)
**Database Migrations:**
- File: `database/migrations/sqlite/versions/001_initial_schema.sql` (~300 lines)
  - Purpose: Creates tables (templates, cases, drafts, evidence, citations, sentences)
- File: `database/migrations/sqlite/versions/001_initial_schema_down.sql` (~50 lines)
  - Purpose: Rollback migration (drops all tables)
- File: `database/migrations/postgresql/versions/001_initial_schema.sql` (~350 lines)
  - Purpose: PostgreSQL equivalent with GIN indexes for JSON
- File: `database/migrations/postgresql/versions/001_initial_schema_down.sql` (~50 lines)
  - Purpose: PostgreSQL rollback

**Repository Implementations:**
- File: `database/repositories/base.repository.ts` (~150 lines)
  - Purpose: Base repository interface with CRUD operations
- File: `database/repositories/template.repository.ts` (~200 lines)
  - Purpose: Template-specific queries and operations
- File: `database/repositories/case.repository.ts` (~200 lines)
  - Purpose: Case-specific queries and operations
- File: `database/repositories/draft.repository.ts` (~250 lines)
  - Purpose: Draft operations with document_json/content_json handling
- File: `database/repositories/evidence.repository.ts` (~150 lines)
  - Purpose: Evidence CRUD operations

**Configuration & Utilities:**
- File: `database/config/database.config.ts` (~100 lines)
  - Purpose: Database connection configuration (SQLite/PostgreSQL)
- File: `database/config/migration-runner.ts` (~200 lines)
  - Purpose: Migration execution utilities
- File: `database/package.json` (configuration)
- File: `database/tsconfig.json` (TypeScript config)

**Tests:**
- File: `database/tests/unit/template.repository.test.ts` (~150 lines)
- File: `database/tests/unit/case.repository.test.ts` (~150 lines)
- File: `database/tests/unit/draft.repository.test.ts` (~200 lines)
- File: `database/tests/fixtures/sample-documents.ts` (~100 lines)

**Total:** ~2,500 lines

**Database Objects Created:**
- Table: `templates` (9 columns: id, name, category, jurisdiction, court_level, description, document_json, variables, created_at, updated_at)
- Table: `cases` (10 columns: id, template_id, case_name, cause_number, court_name, filing_date, status, variable_values, created_at, updated_at)
- Table: `drafts` (8 columns: id, case_id, title, document_json, content_json, version, created_at, updated_at)
- Table: `evidence` (9 columns: id, case_id, type, title, file_path, description, metadata, created_at, updated_at)
- Table: `citations` (6 columns: id, draft_id, sentence_id, evidence_id, citation_text, created_at)
- Table: `sentences` (7 columns: id, draft_id, paragraph_id, text, start_offset, end_offset, metadata)

## Consumes (Prereqs)
**Required Runbooks:**
- Runbook 1: `@factsway/shared-types` package
  - Imports: `LegalDocument`, `Template`, `Case`, `Draft`, `Evidence` types
  - Used in: Repository interfaces and implementations

**Required Files:**
- None (creates from scratch)

**Required Environment:**
- SQLite 3.x (for desktop)
- PostgreSQL 13+ (for cloud/enterprise)
- Node.js 18+ (for TypeScript compilation)
- npm or pnpm (package manager)

**Required Dependencies:**
- `better-sqlite3@^9.2.0` (SQLite driver for Node.js)
- `pg@^8.11.0` (PostgreSQL driver for Node.js)
- `@types/better-sqlite3@^7.6.0` (TypeScript types)
- `@types/pg@^8.10.0` (TypeScript types)
- `@factsway/shared-types@^1.0.0` (from Runbook 1)

## Interfaces Touched
- REST endpoints
  - UNSPECIFIED
  - TODO: Document REST endpoints (Metadata/RUNBOOK_2_METADATA.md:L1-L545)
- IPC channels/events (if any)
  - UNSPECIFIED
  - TODO: Document IPC channels/events (Metadata/RUNBOOK_2_METADATA.md:L1-L545)
- Filesystem paths/formats
  - package.json (Source: Metadata/RUNBOOK_2_METADATA.md:L37-L37) "- File: `database/package.json` (configuration)"
  - tsconfig.json (Source: Metadata/RUNBOOK_2_METADATA.md:L38-L38) "- File: `database/tsconfig.json` (TypeScript config)"
- Process lifecycle (if any)
  - - N/A (library only, no processes spawned)

## Contracts Defined or Used
- Schema schema (Source: Metadata/RUNBOOK_2_METADATA.md:L6-L6) "Create complete database schema with SQLite (desktop) and PostgreSQL (cloud) migrations, implementing repository pattern for type-safe data access to Templates, Cases, Drafts, and Evidence."
- Schema interface with (Source: Metadata/RUNBOOK_2_METADATA.md:L22-L22) "- Purpose: Base repository interface with CRUD operations"
- Schema LegalDocument (Source: Metadata/RUNBOOK_2_METADATA.md:L60-L60) "- Imports: `LegalDocument`, `Template`, `Case`, `Draft`, `Evidence` types"
- Schema Schema (Source: Metadata/RUNBOOK_2_METADATA.md:L81-L81) "#### Database Schema (Created by this runbook)"
- Schema Schema (Source: Metadata/RUNBOOK_2_METADATA.md:L83-L83) "**SQLite Schema:**"
- Schema Schema (Source: Metadata/RUNBOOK_2_METADATA.md:L92-L92) "**PostgreSQL Schema:**"
- Schema Schema (Source: Metadata/RUNBOOK_2_METADATA.md:L143-L143) "**Schema Invariants (HARD REQUIREMENTS):**"
- Schema LegalDocument (Source: Metadata/RUNBOOK_2_METADATA.md:L164-L164) "- Purpose: Ensures parseable LegalDocument structure"
- Schema LegalDocument (Source: Metadata/RUNBOOK_2_METADATA.md:L168-L168) "- INVARIANT: `document_json` conforms to LegalDocument schema"
- Schema LegalDocument (Source: Metadata/RUNBOOK_2_METADATA.md:L169-L169) "- Rule: JSON structure matches Runbook 1 LegalDocument type"
- Schema LegalDocument (Source: Metadata/RUNBOOK_2_METADATA.md:L171-L171) "- Purpose: Type safety for LegalDocument operations"
- Schema Schema (Source: Metadata/RUNBOOK_2_METADATA.md:L177-L177) "- Enforced by: Schema definition (NOT NULL omitted)"
- Schema LegalDocument (Source: Metadata/RUNBOOK_2_METADATA.md:L192-L192) "- Purpose: Editor state (Tiptap) matches canonical state (LegalDocument)"
- Schema Schema (Source: Metadata/RUNBOOK_2_METADATA.md:L229-L229) "- Detection: Schema mismatch after down migration"
- Schema type system (Source: Metadata/RUNBOOK_2_METADATA.md:L236-L236) "- Enforced by: TypeScript type system"
- Schema interface works (Source: Metadata/RUNBOOK_2_METADATA.md:L242-L242) "- Rule: Same repository interface works with both databases"
- Schema schema (Source: Metadata/RUNBOOK_2_METADATA.md:L264-L264) "- Purpose: Verify SQLite schema creation"
- Schema schema (Source: Metadata/RUNBOOK_2_METADATA.md:L268-L268) "- Purpose: Verify PostgreSQL schema creation"
- Schema Schema (Source: Metadata/RUNBOOK_2_METADATA.md:L270-L270) "**Schema Verification:**"
- Schema schema (Source: Metadata/RUNBOOK_2_METADATA.md:L271-L271) "- Command: `sqlite3 /tmp/test.db ".schema templates"`"
- Schema LegalDocument (Source: Metadata/RUNBOOK_2_METADATA.md:L319-L319) "const doc: LegalDocument = { /* valid structure */ };"
- Schema schema (Source: Metadata/RUNBOOK_2_METADATA.md:L346-L346) "- **Risk:** SQLite and PostgreSQL schema divergence"
- Schema schema (Source: Metadata/RUNBOOK_2_METADATA.md:L357-L357) "- **Risk:** Breaking schema changes after services are deployed"
- Schema schema (Source: Metadata/RUNBOOK_2_METADATA.md:L369-L369) "- For incompatible changes: Create migration script, version schema"
- Schema Schema (Source: Metadata/RUNBOOK_2_METADATA.md:L376-L376) "- **Impact:** Schema inconsistencies, foreign key errors"
- Schema JSON schema (Source: Metadata/RUNBOOK_2_METADATA.md:L386-L386) "- **Risk:** JSON schema mismatch (document_json doesn't match LegalDocument)"
- Schema LegalDocument (Source: Metadata/RUNBOOK_2_METADATA.md:L391-L391) "- Validate JSON against LegalDocument schema before INSERT"
- Schema Zod (Source: Metadata/RUNBOOK_2_METADATA.md:L392-L392) "- Use Zod or AJV runtime validation"
- Schema LegalDocument (Source: Metadata/RUNBOOK_2_METADATA.md:L393-L393) "- Version the LegalDocument schema (future: migration scripts)"
- Schema type errors (Source: Metadata/RUNBOOK_2_METADATA.md:L394-L394) "- **Detection:** Parse errors, type errors, export failures"
- Schema schema (Source: Metadata/RUNBOOK_2_METADATA.md:L457-L457) "- **Recovery:** Add indexes, denormalize schema"
- Schema schema (Source: Metadata/RUNBOOK_2_METADATA.md:L491-L491) "4. This creates the data layer - schema mistakes are expensive to fix later"
- Schema Schema (Source: Metadata/RUNBOOK_2_METADATA.md:L495-L495) "**Step 1: Schema Design (SQLite First)**"
- Schema LegalDocument (Source: Metadata/RUNBOOK_2_METADATA.md:L499-L499) "- Verify column types match LegalDocument types from Runbook 1"
- Schema schema (Source: Metadata/RUNBOOK_2_METADATA.md:L502-L502) "- Copy SQLite schema to PostgreSQL"
- Schema type safety (Source: Metadata/RUNBOOK_2_METADATA.md:L509-L509) "- Use TypeScript types from Runbook 1 for type safety"
- Schema schema (Source: Metadata/RUNBOOK_2_METADATA.md:L540-L540) "- Any database errors in Runbook 3 mean schema mismatch - fix Runbook 2"
- Schema Schema (Source: Metadata/RUNBOOK_2_METADATA.md:L541-L541) "- Schema changes after Runbook 3 is implemented are BREAKING CHANGES"
- File package.json (Source: Metadata/RUNBOOK_2_METADATA.md:L37-L37) "- File: `database/package.json` (configuration)"
- File tsconfig.json (Source: Metadata/RUNBOOK_2_METADATA.md:L38-L38) "- File: `database/tsconfig.json` (TypeScript config)"

## Invariants Relied On
- - INVARIANT: All tables have `id` as PRIMARY KEY (UUID) (Source: Metadata/RUNBOOK_2_METADATA.md:L145-L145) "- INVARIANT: All tables have `id` as PRIMARY KEY (UUID)"
- - INVARIANT: Foreign keys reference valid parent records (Source: Metadata/RUNBOOK_2_METADATA.md:L151-L151) "- INVARIANT: Foreign keys reference valid parent records"
- - INVARIANT: `document_json` column contains valid JSON (Source: Metadata/RUNBOOK_2_METADATA.md:L161-L161) "- INVARIANT: `document_json` column contains valid JSON"
- - INVARIANT: `document_json` conforms to LegalDocument schema (Source: Metadata/RUNBOOK_2_METADATA.md:L168-L168) "- INVARIANT: `document_json` conforms to LegalDocument schema"
- - INVARIANT: `content_json` is nullable (optional auxiliary storage) (Source: Metadata/RUNBOOK_2_METADATA.md:L175-L175) "- INVARIANT: `content_json` is nullable (optional auxiliary storage)"
- - INVARIANT: Timestamps are NOT NULL and have defaults (Source: Metadata/RUNBOOK_2_METADATA.md:L182-L182) "- INVARIANT: Timestamps are NOT NULL and have defaults"
- - INVARIANT: Dual storage pattern maintains consistency (Source: Metadata/RUNBOOK_2_METADATA.md:L189-L189) "- INVARIANT: Dual storage pattern maintains consistency"
- - INVARIANT: Case variable_values match template variables (Source: Metadata/RUNBOOK_2_METADATA.md:L199-L199) "- INVARIANT: Case variable_values match template variables"
- - INVARIANT: Draft version increments monotonically (Source: Metadata/RUNBOOK_2_METADATA.md:L207-L207) "- INVARIANT: Draft version increments monotonically"
- - INVARIANT: Migrations are idempotent (Source: Metadata/RUNBOOK_2_METADATA.md:L217-L217) "- INVARIANT: Migrations are idempotent"
- - INVARIANT: Down migrations reverse up migrations (Source: Metadata/RUNBOOK_2_METADATA.md:L224-L224) "- INVARIANT: Down migrations reverse up migrations"
- - INVARIANT: Repository methods return typed objects (Source: Metadata/RUNBOOK_2_METADATA.md:L234-L234) "- INVARIANT: Repository methods return typed objects"
- - INVARIANT: Repository handles both SQLite and PostgreSQL (Source: Metadata/RUNBOOK_2_METADATA.md:L241-L241) "- INVARIANT: Repository handles both SQLite and PostgreSQL"

## Verification Gate (Commands + Expected Outputs)
- - Purpose: Verify SQLite schema creation (Source: Metadata/RUNBOOK_2_METADATA.md:L264-L264) "- Purpose: Verify SQLite schema creation"
- - Purpose: Verify PostgreSQL schema creation (Source: Metadata/RUNBOOK_2_METADATA.md:L268-L268) "- Purpose: Verify PostgreSQL schema creation"
- - Purpose: Verify table structure matches specification (Source: Metadata/RUNBOOK_2_METADATA.md:L282-L282) "- Purpose: Verify table structure matches specification"
- - Command: `cd database && npm test` (Source: Metadata/RUNBOOK_2_METADATA.md:L285-L285) "- Command: `cd database && npm test`"
- - Purpose: Verify all CRUD operations work (Source: Metadata/RUNBOOK_2_METADATA.md:L302-L302) "- Purpose: Verify all CRUD operations work"
- - Purpose: Verify referential integrity enforced (Source: Metadata/RUNBOOK_2_METADATA.md:L314-L314) "- Purpose: Verify referential integrity enforced"
- - Purpose: Verify JSON serialization/deserialization works (Source: Metadata/RUNBOOK_2_METADATA.md:L325-L325) "- Purpose: Verify JSON serialization/deserialization works"
- - Purpose: Verify down migrations work (clean rollback) (Source: Metadata/RUNBOOK_2_METADATA.md:L340-L340) "- Purpose: Verify down migrations work (clean rollback)"
- 1. Verify Runbook 1 (`@factsway/shared-types`) is complete and importable (Source: Metadata/RUNBOOK_2_METADATA.md:L488-L488) "1. Verify Runbook 1 (`@factsway/shared-types`) is complete and importable"
- - Verify column types match LegalDocument types from Runbook 1 (Source: Metadata/RUNBOOK_2_METADATA.md:L499-L499) "- Verify column types match LegalDocument types from Runbook 1"
- - Verify return types match expected types (Source: Metadata/RUNBOOK_2_METADATA.md:L510-L510) "- Verify return types match expected types"
- - Verify idempotency (running twice should work) (Source: Metadata/RUNBOOK_2_METADATA.md:L515-L515) "- Verify idempotency (running twice should work)"

## Risks / Unknowns (TODOs)
- - **Risk:** SQLite and PostgreSQL schema divergence (Source: Metadata/RUNBOOK_2_METADATA.md:L346-L346) "- **Risk:** SQLite and PostgreSQL schema divergence"
- - **Risk:** Breaking schema changes after services are deployed (Source: Metadata/RUNBOOK_2_METADATA.md:L357-L357) "- **Risk:** Breaking schema changes after services are deployed"
- - **Risk:** Migration order confusion (migrations run out of order) (Source: Metadata/RUNBOOK_2_METADATA.md:L373-L373) "- **Risk:** Migration order confusion (migrations run out of order)"
- - **Risk:** JSON schema mismatch (document_json doesn't match LegalDocument) (Source: Metadata/RUNBOOK_2_METADATA.md:L386-L386) "- **Risk:** JSON schema mismatch (document_json doesn't match LegalDocument)"
- - **Risk:** content_json desynchronization from document_json (Source: Metadata/RUNBOOK_2_METADATA.md:L397-L397) "- **Risk:** content_json desynchronization from document_json"
- - **Risk:** Foreign key cascade deletes unintended data (Source: Metadata/RUNBOOK_2_METADATA.md:L408-L408) "- **Risk:** Foreign key cascade deletes unintended data"
- - **Risk:** SQLite database corruption (desktop) (Source: Metadata/RUNBOOK_2_METADATA.md:L423-L423) "- **Risk:** SQLite database corruption (desktop)"
- - **Risk:** PostgreSQL connection pool exhaustion (cloud) (Source: Metadata/RUNBOOK_2_METADATA.md:L434-L434) "- **Risk:** PostgreSQL connection pool exhaustion (cloud)"
- - **Risk:** JSON column queries are slow (no indexes) (Source: Metadata/RUNBOOK_2_METADATA.md:L448-L448) "- **Risk:** JSON column queries are slow (no indexes)"
- - **Risk:** Large document_json blobs slow down queries (Source: Metadata/RUNBOOK_2_METADATA.md:L459-L459) "- **Risk:** Large document_json blobs slow down queries"
- - **Risk:** Repository pattern breaks with future ORM (Prisma, TypeORM) (Source: Metadata/RUNBOOK_2_METADATA.md:L472-L472) "- **Risk:** Repository pattern breaks with future ORM (Prisma, TypeORM)"
