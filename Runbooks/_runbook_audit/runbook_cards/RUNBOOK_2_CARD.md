## Purpose
UNSPECIFIED
TODO: Provide details (02_RUNBOOK_02_DATABASE_SCHEMA.md:L1-L1595)

## Produces (Artifacts)
UNSPECIFIED
TODO: Provide details (02_RUNBOOK_02_DATABASE_SCHEMA.md:L1-L1595)

## Consumes (Prereqs)
UNSPECIFIED
TODO: Provide details (02_RUNBOOK_02_DATABASE_SCHEMA.md:L1-L1595)

## Interfaces Touched
- REST endpoints
  - UNSPECIFIED
  - TODO: Document REST endpoints (02_RUNBOOK_02_DATABASE_SCHEMA.md:L1-L1595)
- IPC channels/events (if any)
  - UNSPECIFIED
  - TODO: Document IPC channels/events (02_RUNBOOK_02_DATABASE_SCHEMA.md:L1-L1595)
- Filesystem paths/formats
  - package.json (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L98-L98) "### 1.2 Create package.json"
  - package.json (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L100-L100) "**File:** `database/package.json`"
  - tsconfig.json (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L150-L150) "### 1.3 Create tsconfig.json"
  - tsconfig.json (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L152-L152) "**File:** `database/tsconfig.json`"
- Process lifecycle (if any)
  - UNSPECIFIED
  - TODO: Document process lifecycle (02_RUNBOOK_02_DATABASE_SCHEMA.md:L1-L1595)

## Contracts Defined or Used
- Schema Schema (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L1-L1) "# Runbook 2: Database Schema - SQLite & PostgreSQL Migrations"
- Schema schema (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L13-L13) "Create **complete database schema** with migrations for both SQLite (desktop) and PostgreSQL (cloud), implementing the repository pattern for data access."
- Schema LegalDocument (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L33-L33) "- **Section 4:** LegalDocument Schema (Canonical Backend Contract)"
- Schema LegalDocument (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L40-L40) "> "LegalDocument is canonical. All backend services use this format exclusively. The database stores document_json (LegalDocument) as the single source of truth.""
- Schema LegalDocument (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L47-L47) "- ✅ `@factsway/shared-types` package with LegalDocument types (Runbook 1)"
- Schema Schema (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L189-L189) "## Task 2: Define Database Schema"
- Schema LegalDocument (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L211-L211) "-- Document content (LegalDocument format - CANONICAL)"
- Schema LegalDocument (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L212-L212) "document_json TEXT NOT NULL, -- JSON-serialized LegalDocument"
- Schema LegalDocument (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L237-L237) "**Note:** document_json stores the complete LegalDocument (Section 4.2 structure)"
- Schema LegalDocument (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L323-L323) "document_json TEXT NOT NULL, -- LegalDocument (CANONICAL)"
- Schema LegalDocument (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L364-L364) "- `document_json` = LegalDocument (CANONICAL, NOT NULL)"
- Schema interface MigrationRecord (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L612-L612) "interface MigrationRecord {"
- Schema interface MigrationRecord (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L772-L772) "interface MigrationRecord {"
- Schema interface IRepository (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L945-L945) "export interface IRepository<T> {"
- Schema interface FindOptions (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L953-L953) "export interface FindOptions {"
- Schema LegalDocument (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L973-L973) "import { LegalDocument } from '@factsway/shared-types';"
- Schema interface Template (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L976-L976) "export interface Template {"
- Schema LegalDocument (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L981-L981) "document_json: LegalDocument; // CANONICAL"
- Schema interface CreateTemplateData (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L989-L989) "export interface CreateTemplateData {"
- Schema LegalDocument (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L993-L993) "document_json: LegalDocument;"
- Schema interface Draft (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L1193-L1193) "export interface Draft {"
- Schema LegalDocument (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L1201-L1201) "document_json: LegalDocument; // CANONICAL (required)"
- Schema type DatabaseType (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L1240-L1240) "export type DatabaseType = 'sqlite' | 'postgresql';"
- Schema interface DatabaseConfig (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L1242-L1242) "export interface DatabaseConfig {"
- Schema LegalDocument (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L1351-L1351) "import { LegalDocument } from '@factsway/shared-types';"
- Schema LegalDocument (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L1367-L1367) "it('should create a template with LegalDocument', async () => {"
- Schema LegalDocument (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L1368-L1368) "const doc: LegalDocument = {"
- Schema LegalDocument (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L1400-L1400) "const doc: LegalDocument = {"
- Schema LegalDocument (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L1455-L1455) "const doc: LegalDocument = {"
- Schema LegalDocument (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L1485-L1485) "const doc: LegalDocument = {"
- Schema Schema (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L1518-L1518) "### 8.1 Schema Files"
- Schema Schema (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L1521-L1521) "- [ ] Schema matches Section 2 data models (Template, Case, Draft, Evidence)"
- Schema LegalDocument (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L1522-L1522) "- [ ] LegalDocument stored as JSON in `document_json` column (canonical)"
- Schema Schema (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L1558-L1558) "- [ ] Schema matches Section 2 data models"
- Schema LegalDocument (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L1559-L1559) "- [ ] Uses LegalDocument format from Section 4"
- Schema LegalDocument (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L1589-L1589) "- **Runbook 0 Section 4:** LegalDocument Schema (what goes in document_json)"
- File package.json (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L98-L98) "### 1.2 Create package.json"
- File package.json (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L100-L100) "**File:** `database/package.json`"
- File tsconfig.json (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L150-L150) "### 1.3 Create tsconfig.json"
- File tsconfig.json (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L152-L152) "**File:** `database/tsconfig.json`"

## Invariants Relied On
UNSPECIFIED
TODO: Add invariants (02_RUNBOOK_02_DATABASE_SCHEMA.md:L1-L1595)

## Verification Gate (Commands + Expected Outputs)
- 1. **Verify migrations run:** `npm run migrate:sqlite:up` (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L1580-L1580) "1. **Verify migrations run:** `npm run migrate:sqlite:up`"
- 2. **Run tests:** `npm test` (Source: 02_RUNBOOK_02_DATABASE_SCHEMA.md:L1581-L1581) "2. **Run tests:** `npm test`"

## Risks / Unknowns (TODOs)
UNSPECIFIED
TODO: Document risks (02_RUNBOOK_02_DATABASE_SCHEMA.md:L1-L1595)
