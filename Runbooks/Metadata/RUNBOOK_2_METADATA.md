---

## Metadata Summary

### Purpose
Create complete database schema with SQLite (desktop) and PostgreSQL (cloud) migrations, implementing repository pattern for type-safe data access to Templates, Cases, Drafts, and Evidence.

### Produces (Artifacts)

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

### Consumes (Prerequisites)

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

### Interfaces Touched

#### Database Schema (Created by this runbook)

**SQLite Schema:**
- From: N/A → To: SQLite Database → Creates: 6 tables
  - Templates table with JSON column (document_json)
  - Cases table with foreign key to templates
  - Drafts table with dual JSON columns (document_json + content_json)
  - Evidence table
  - Citations linking table
  - Sentences fact registry

**PostgreSQL Schema:**
- From: N/A → To: PostgreSQL Database → Creates: 6 tables
  - Identical structure to SQLite
  - Additional: GIN indexes on JSON columns for performance
  - Additional: PostgreSQL-specific data types (JSONB vs TEXT)

#### Repository Pattern (TypeScript Interfaces)

**Template Repository:**
- From: Services → To: Template Repository → Interface: TypeScript class
  - Methods: `create(template)`, `findById(id)`, `findAll()`, `update(id, data)`, `delete(id)`
  - Returns: `Promise<Template>` or `Promise<Template[]>`

**Case Repository:**
- From: Services → To: Case Repository → Interface: TypeScript class
  - Methods: `create(case)`, `findById(id)`, `findByTemplateId(templateId)`, `update(id, data)`, `delete(id)`
  - Returns: `Promise<Case>` or `Promise<Case[]>`

**Draft Repository:**
- From: Services → To: Draft Repository → Interface: TypeScript class
  - Methods: `create(draft)`, `findById(id)`, `findByCaseId(caseId)`, `update(id, data)`, `delete(id)`
  - Special: Handles dual storage (document_json + content_json)
  - Returns: `Promise<Draft>` or `Promise<Draft[]>`

**Evidence Repository:**
- From: Services → To: Evidence Repository → Interface: TypeScript class
  - Methods: `create(evidence)`, `findById(id)`, `findByCaseId(caseId)`, `delete(id)`
  - Returns: `Promise<Evidence>` or `Promise<Evidence[]>`

#### Filesystem

**Creates:**
- Path: `database/` (new directory)
- Path: `database/migrations/sqlite/versions/` (migration files)
- Path: `database/migrations/postgresql/versions/` (migration files)
- Path: `database/repositories/` (TypeScript repository classes)
- Path: `database/config/` (database configuration)
- Path: `database/tests/` (test suite)

**Reads:**
- Path: `@factsway/shared-types` (npm package, types only)

**Modifies:**
- SQLite Database: Creates tables, applies migrations
- PostgreSQL Database: Creates tables, applies migrations

#### Process Lifecycle
- N/A (library only, no processes spawned)

### Invariants

**Schema Invariants (HARD REQUIREMENTS):**

- INVARIANT: All tables have `id` as PRIMARY KEY (UUID)
  - Enforced by: CREATE TABLE statements (PRIMARY KEY constraint)
  - Purpose: Unique identifier for all entities
  - Violation: Database constraint error on INSERT
  - Recovery: None (indicates migration error)

- INVARIANT: Foreign keys reference valid parent records
  - Examples:
    - `cases.template_id` REFERENCES `templates.id`
    - `drafts.case_id` REFERENCES `cases.id`
    - `evidence.case_id` REFERENCES `cases.id`
  - Enforced by: FOREIGN KEY constraints with ON DELETE CASCADE
  - Purpose: Referential integrity (no orphaned records)
  - Violation: Database constraint error on INSERT/UPDATE
  - Recovery: None (must provide valid parent ID)

- INVARIANT: `document_json` column contains valid JSON
  - Property: SQLite TEXT column stores JSON string, PostgreSQL uses JSONB
  - Enforced by: Database JSON validation (PostgreSQL), application validation (SQLite)
  - Purpose: Ensures parseable LegalDocument structure
  - Violation: JSON parse error on retrieval
  - Recovery: Application must validate before INSERT

- INVARIANT: `document_json` conforms to LegalDocument schema
  - Rule: JSON structure matches Runbook 1 LegalDocument type
  - Enforced by: Application-level validation (not database)
  - Purpose: Type safety for LegalDocument operations
  - Violation: Type errors in consuming services
  - Recovery: Validation at repository layer before INSERT

- INVARIANT: `content_json` is nullable (optional auxiliary storage)
  - Property: Column allows NULL values
  - Enforced by: Schema definition (NOT NULL omitted)
  - Purpose: Tiptap JSON is optional, document_json is canonical
  - Violation: None (NULL is valid)
  - Recovery: N/A

- INVARIANT: Timestamps are NOT NULL and have defaults
  - Properties: `created_at`, `updated_at` columns
  - Enforced by: NOT NULL constraint, DEFAULT CURRENT_TIMESTAMP
  - Purpose: Audit trail for all records
  - Violation: Database constraint error on INSERT
  - Recovery: None (database provides default)

- INVARIANT: Dual storage pattern maintains consistency
  - Rule: If `content_json` exists, it represents same logical content as `document_json`
  - Enforced by: Application logic (not database)
  - Purpose: Editor state (Tiptap) matches canonical state (LegalDocument)
  - Violation: Desynchronization between editor and backend
  - Detection: Export mismatch, editor rendering errors
  - Recovery: Regenerate content_json from document_json (transformation)

**Data Integrity Invariants:**

- INVARIANT: Case variable_values match template variables
  - Rule: Keys in `cases.variable_values` JSON match keys in `templates.variables` JSON
  - Enforced by: Application validation (not database)
  - Purpose: Case data completeness
  - Violation: Missing required variables, export fails
  - Detection: Validation error during case creation
  - Recovery: Prompt user for missing variables

- INVARIANT: Draft version increments monotonically
  - Rule: `drafts.version` starts at 1, increments on update
  - Enforced by: Application logic in repository
  - Purpose: Version history tracking
  - Violation: Version conflicts, lost updates
  - Detection: Concurrent update errors
  - Recovery: Optimistic locking (compare version before update)

**Migration Invariants:**

- INVARIANT: Migrations are idempotent
  - Rule: Running same migration twice produces same result
  - Enforced by: CREATE TABLE IF NOT EXISTS, DROP TABLE IF EXISTS
  - Purpose: Safe re-runs, development consistency
  - Violation: Duplicate table errors
  - Recovery: Drop tables manually, re-run migration

- INVARIANT: Down migrations reverse up migrations
  - Rule: UP creates tables, DOWN drops tables (inverse operations)
  - Enforced by: Manual verification (testing)
  - Purpose: Rollback capability
  - Violation: Orphaned tables after rollback
  - Detection: Schema mismatch after down migration
  - Recovery: Manual cleanup (DROP TABLE)

**Repository Pattern Invariants:**

- INVARIANT: Repository methods return typed objects
  - Rule: `findById()` returns `Promise<T | null>`, `findAll()` returns `Promise<T[]>`
  - Enforced by: TypeScript type system
  - Purpose: Type safety in consuming services
  - Violation: TypeScript compiler errors
  - Recovery: None (compile-time enforcement)

- INVARIANT: Repository handles both SQLite and PostgreSQL
  - Rule: Same repository interface works with both databases
  - Enforced by: Abstraction layer (connection adapter)
  - Purpose: Deployment flexibility (desktop uses SQLite, cloud uses PostgreSQL)
  - Violation: Database-specific SQL breaks abstraction
  - Detection: Tests fail on one database but not the other
  - Recovery: Fix SQL to be compatible or use conditional logic

### Verification Gates

**Migration Execution Verification:**
- Command: `cd database && npm run migrate:sqlite:up`
- Expected:
  ```
  ✓ Running migration: 001_initial_schema.sql
  ✓ Created table: templates
  ✓ Created table: cases
  ✓ Created table: drafts
  ✓ Created table: evidence
  ✓ Created table: citations
  ✓ Created table: sentences
  ✓ Migration complete
  ```
- Purpose: Verify SQLite schema creation

- Command: `cd database && npm run migrate:postgresql:up`
- Expected: Same output for PostgreSQL
- Purpose: Verify PostgreSQL schema creation

**Schema Verification:**
- Command: `sqlite3 /tmp/test.db ".schema templates"`
- Expected:
  ```sql
  CREATE TABLE templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    -- ... all columns ...
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  ```
- Purpose: Verify table structure matches specification

**Repository CRUD Verification:**
- Command: `cd database && npm test`
- Expected:
  ```
  PASS tests/unit/template.repository.test.ts
    Template Repository
      ✓ should create a template
      ✓ should find template by ID
      ✓ should find all templates
      ✓ should update a template
      ✓ should delete a template
  
  PASS tests/unit/case.repository.test.ts
  PASS tests/unit/draft.repository.test.ts
  
  Test Suites: 3 passed, 3 total
  Tests: 15 passed, 15 total
  ```
- Purpose: Verify all CRUD operations work

**Foreign Key Constraint Verification:**
- Command: Manual test (create case with invalid template_id)
  ```typescript
  const repo = new CaseRepository(db);
  await repo.create({
    template_id: 'non-existent-id',
    case_name: 'Test Case'
  });
  ```
- Expected: Error thrown (foreign key constraint violation)
- Purpose: Verify referential integrity enforced

**JSON Storage Verification:**
- Command: Insert template with document_json, retrieve and parse
  ```typescript
  const doc: LegalDocument = { /* valid structure */ };
  await repo.create({ name: 'Test', document_json: doc });
  const found = await repo.findById(id);
  expect(found.document_json).toEqual(doc);
  ```
- Expected: Retrieved JSON matches inserted JSON (deep equality)
- Purpose: Verify JSON serialization/deserialization works

**Migration Rollback Verification:**
- Command: `npm run migrate:sqlite:down`
- Expected:
  ```
  ✓ Running rollback: 001_initial_schema_down.sql
  ✓ Dropped table: sentences
  ✓ Dropped table: citations
  ✓ Dropped table: evidence
  ✓ Dropped table: drafts
  ✓ Dropped table: cases
  ✓ Dropped table: templates
  ✓ Rollback complete
  ```
- Purpose: Verify down migrations work (clean rollback)

### Risks

**Technical Risks:**

- **Risk:** SQLite and PostgreSQL schema divergence
  - **Severity:** HIGH
  - **Likelihood:** MEDIUM
  - **Impact:** Code works on desktop (SQLite) but breaks on cloud (PostgreSQL)
  - **Mitigation:**
    - Keep migration files synchronized (automated check in CI)
    - Test both databases in CI pipeline
    - Use database-agnostic SQL where possible (avoid vendor-specific features)
  - **Detection:** Tests fail on PostgreSQL but pass on SQLite
  - **Recovery:** Manually sync migration files, re-run tests

- **Risk:** Breaking schema changes after services are deployed
  - **Examples:**
    - Removing columns that services depend on
    - Changing column types (TEXT → INTEGER)
    - Adding NOT NULL constraints to existing columns
  - **Severity:** CRITICAL
  - **Likelihood:** MEDIUM (during development)
  - **Impact:** All services break, data migration required, potential downtime
  - **Mitigation:**
    - **RULE:** Only add columns (never remove)
    - **RULE:** New columns must be nullable or have defaults
    - **RULE:** Use new migrations (don't edit existing ones)
    - For incompatible changes: Create migration script, version schema
  - **Detection:** Services fail to start, query errors
  - **Recovery:** Rollback migration, fix data, deploy new migration

- **Risk:** Migration order confusion (migrations run out of order)
  - **Severity:** HIGH
  - **Likelihood:** LOW
  - **Impact:** Schema inconsistencies, foreign key errors
  - **Mitigation:**
    - Use numbered migration files (001_, 002_, etc.)
    - Migration runner enforces sequential execution
    - Track applied migrations in database (migrations table)
  - **Detection:** Duplicate table errors, missing dependencies
  - **Recovery:** Drop database, re-run migrations in correct order

**Data Risks:**

- **Risk:** JSON schema mismatch (document_json doesn't match LegalDocument)
  - **Severity:** HIGH
  - **Likelihood:** MEDIUM
  - **Impact:** Type errors in services, export failures, data loss
  - **Mitigation:**
    - Validate JSON against LegalDocument schema before INSERT
    - Use Zod or AJV runtime validation
    - Version the LegalDocument schema (future: migration scripts)
  - **Detection:** Parse errors, type errors, export failures
  - **Recovery:** Fix invalid records with migration script

- **Risk:** content_json desynchronization from document_json
  - **Severity:** MEDIUM
  - **Likelihood:** HIGH (editor updates don't always sync)
  - **Impact:** Editor shows stale content, export doesn't match UI
  - **Mitigation:**
    - Treat document_json as source of truth
    - Regenerate content_json from document_json on load (if missing/stale)
    - Add "last_synced" timestamp to detect staleness
  - **Detection:** User reports editor mismatch, export differs from UI
  - **Recovery:** Delete content_json, regenerate from document_json

- **Risk:** Foreign key cascade deletes unintended data
  - **Example:** Deleting template deletes all associated cases and drafts
  - **Severity:** CRITICAL
  - **Likelihood:** LOW (requires user action)
  - **Impact:** Permanent data loss
  - **Mitigation:**
    - Use ON DELETE CASCADE carefully (only where intended)
    - Add "soft delete" flags (deleted_at column) instead of hard DELETE
    - Require confirmation for destructive operations
    - Implement backup/restore mechanism
  - **Detection:** User reports missing data after deletion
  - **Recovery:** Restore from backup (no automatic recovery)

**Operational Risks:**

- **Risk:** SQLite database corruption (desktop)
  - **Severity:** CRITICAL
  - **Likelihood:** LOW (modern SQLite is robust)
  - **Impact:** User loses all local data
  - **Mitigation:**
    - Enable WAL mode (Write-Ahead Logging) for durability
    - Regular backups (automatic daily backups to user directory)
    - Use PRAGMA foreign_keys=ON to enable constraints
  - **Detection:** Database queries fail, sqlite3 CLI reports corruption
  - **Recovery:** Restore from backup, use `sqlite3 .recover` utility

- **Risk:** PostgreSQL connection pool exhaustion (cloud)
  - **Severity:** HIGH
  - **Likelihood:** MEDIUM (under load)
  - **Impact:** Services can't query database, requests timeout
  - **Mitigation:**
    - Set max_connections appropriately (start with 20)
    - Use connection pooling (pg.Pool)
    - Implement query timeouts (5s default)
    - Monitor connection count (alert at 80% capacity)
  - **Detection:** "too many clients" errors, slow queries
  - **Recovery:** Increase pool size, restart services to release connections

**Performance Risks:**

- **Risk:** JSON column queries are slow (no indexes)
  - **Severity:** MEDIUM
  - **Likelihood:** HIGH (large databases)
  - **Impact:** Slow searches, poor user experience
  - **Mitigation:**
    - PostgreSQL: Use GIN indexes on JSONB columns
    - SQLite: Extract frequently queried fields to separate columns
    - Cache query results in application layer
  - **Detection:** Slow query logs, user reports
  - **Recovery:** Add indexes, denormalize schema

- **Risk:** Large document_json blobs slow down queries
  - **Severity:** MEDIUM
  - **Likelihood:** MEDIUM (200+ page documents)
  - **Impact:** Slow SELECT queries, high memory usage
  - **Mitigation:**
    - Use SELECT id, title (without document_json) for list views
    - Only load document_json when explicitly needed (detail view)
    - Consider splitting very large documents into chunks
  - **Detection:** Slow list loads, high memory usage
  - **Recovery:** Optimize queries to exclude large columns

**Integration Risks:**

- **Risk:** Repository pattern breaks with future ORM (Prisma, TypeORM)
  - **Severity:** MEDIUM
  - **Likelihood:** LOW (not planned)
  - **Impact:** Major refactoring if switching to ORM
  - **Mitigation:**
    - Keep repository interfaces clean (don't leak SQL)
    - Use dependency injection (easy to swap implementations)
    - If switching to ORM: Create ORM-based repository implementations
  - **Detection:** N/A (design decision)
  - **Recovery:** Implement new repositories, keep interfaces

---

**End of Metadata for Runbook 2**
