# Runbook 2: Database Schema - SQLite & PostgreSQL Migrations

**Phase:** Foundation (Critical Path)  
**Estimated Time:** 6-8 hours  
**Prerequisites:** Runbook 1 complete (`@factsway/shared-types` package)  
**Depends On:** Runbook 0 Sections 2, 4, 16.2  
**Enables:** Runbooks 3-15 (all services need database)

---

## Objective

Create **complete database schema** with migrations for both SQLite (desktop) and PostgreSQL (cloud), implementing the repository pattern for data access.

**Success Criteria:**
- ✅ SQLite and PostgreSQL migrations run successfully
- ✅ All tables created with proper constraints
- ✅ Repository pattern implemented for all entities
- ✅ CRUD operations work for all models
- ✅ Tests pass for all repositories
- ✅ Dual storage (document_json + content_json) verified

---

## Context from Runbook 0

**Referenced Sections:**
- **Section 2:** Data Models (Templates, Cases, Drafts, Evidence)
  - **Section 2.2:** Template Model
  - **Section 2.3:** Case Model
  - **Section 2.4:** Draft Model
  - **Section 2.8:** Evidence Model
- **Section 4:** LegalDocument Schema (Canonical Backend Contract)
  - **Section 4.2:** Core Structure (what gets stored in document_json)
- **Section 2.5:** Document Storage & Editor Architecture
  - Dual storage pattern: document_json (canonical) + content_json (auxiliary)
- **Section 16.2:** Database Directory Structure

**Key Principle from Runbook 0:**
> "LegalDocument is canonical. All backend services use this format exclusively. The database stores document_json (LegalDocument) as the single source of truth."

---

## Current State

**What exists:**
- ✅ `@factsway/shared-types` package with LegalDocument types (Runbook 1)
- ❌ No database directory
- ❌ No migrations
- ❌ No repository implementations
- ❌ No database configuration

**What this creates:**
- ✅ `database/` directory with complete structure
- ✅ SQLite migrations for desktop deployment
- ✅ PostgreSQL migrations for cloud deployment
- ✅ Repository pattern implementation
- ✅ Database configuration utilities
- ✅ Test suite with fixtures

---

## Task 1: Create Database Directory Structure

### 1.1 Create Directory Structure

**Location:** Root of repository

**Action:** CREATE new directories

```bash
# From repository root
mkdir -p database/{migrations/{sqlite,postgresql},repositories,config,tests/{fixtures,unit}}
mkdir -p database/migrations/sqlite/versions
mkdir -p database/migrations/postgresql/versions
```

**Verification:**
```bash
tree database -L 3

# Expected output:
# database/
# ├── migrations/
# │   ├── sqlite/
# │   │   └── versions/
# │   └── postgresql/
# │       └── versions/
# ├── repositories/
# ├── config/
# └── tests/
#     ├── fixtures/
#     └── unit/
```

---

### 1.2 Create package.json

**File:** `database/package.json`

**Action:** CREATE

**Content:**
```json
{
  "name": "@factsway/database",
  "version": "1.0.0",
  "description": "Database migrations and repositories for FACTSWAY",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "migrate:sqlite:up": "node dist/migrations/sqlite/runner.js up",
    "migrate:sqlite:down": "node dist/migrations/sqlite/runner.js down",
    "migrate:postgresql:up": "node dist/migrations/postgresql/runner.js up",
    "migrate:postgresql:down": "node dist/migrations/postgresql/runner.js down",
    "seed:sqlite": "node dist/migrations/sqlite/seed.js",
    "seed:postgresql": "node dist/migrations/postgresql/seed.js"
  },
  "dependencies": {
    "@factsway/shared-types": "workspace:*",
    "better-sqlite3": "^9.2.2",
    "pg": "^8.11.3",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.8",
    "@types/jest": "^29.5.11",
    "@types/node": "^20.10.6",
    "@types/pg": "^8.10.9",
    "@types/uuid": "^9.0.7",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "typescript": "^5.3.3"
  },
  "keywords": [
    "factsway",
    "database",
    "migrations",
    "sqlite",
    "postgresql"
  ]
}
```

---

### 1.3 Create tsconfig.json

**File:** `database/tsconfig.json`

**Action:** CREATE

**Content:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": [
    "migrations/**/*",
    "repositories/**/*",
    "config/**/*",
    "tests/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

---

## Task 2: Define Database Schema

### 2.1 Templates Table

**File:** `database/migrations/sqlite/versions/001_create_templates.sql`

**Action:** CREATE

**Content:**
```sql
-- Migration: 001_create_templates
-- Description: Create templates table for document templates
-- Author: Runbook 2
-- Date: 2024-12-26

-- UP Migration
CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK(category IN ('motion', 'brief', 'complaint', 'answer', 'notice', 'order', 'memo', 'letter', 'other')),
  
  -- Document content (LegalDocument format - CANONICAL)
  document_json TEXT NOT NULL,  -- JSON-serialized LegalDocument
  
  -- Metadata
  tags TEXT,  -- JSON array of strings
  is_public BOOLEAN NOT NULL DEFAULT 0,
  author TEXT,
  
  -- Timestamps
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  -- Constraints
  CHECK(json_valid(document_json)),
  CHECK(tags IS NULL OR json_valid(tags))
);

-- Indexes
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_created_at ON templates(created_at);
CREATE INDEX idx_templates_is_public ON templates(is_public);

-- DOWN Migration (for rollback)
-- DROP TABLE IF EXISTS templates;
```

**Note:** document_json stores the complete LegalDocument (Section 4.2 structure)

---

### 2.2 Cases Table

**File:** `database/migrations/sqlite/versions/002_create_cases.sql`

**Action:** CREATE

**Content:**
```sql
-- Migration: 002_create_cases
-- Description: Create cases table for case management
-- Author: Runbook 2
-- Date: 2024-12-26

-- UP Migration
CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  
  -- Case identification
  case_number TEXT NOT NULL UNIQUE,
  case_title TEXT NOT NULL,
  court TEXT NOT NULL,
  division TEXT,
  judge TEXT,
  
  -- Parties (JSON array of Party objects)
  parties TEXT NOT NULL,  -- [{role: string, name: string, represented_by?: string}]
  
  -- Case status
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'closed', 'archived')),
  
  -- Case metadata
  tags TEXT,  -- JSON array of strings
  notes TEXT,
  
  -- Timestamps
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  filed_date TEXT,
  
  -- Constraints
  CHECK(json_valid(parties)),
  CHECK(tags IS NULL OR json_valid(tags))
);

-- Indexes
CREATE INDEX idx_cases_case_number ON cases(case_number);
CREATE INDEX idx_cases_court ON cases(court);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_filed_date ON cases(filed_date);

-- DOWN Migration (for rollback)
-- DROP TABLE IF EXISTS cases;
```

---

### 2.3 Drafts Table

**File:** `database/migrations/sqlite/versions/003_create_drafts.sql`

**Action:** CREATE

**Content:**
```sql
-- Migration: 003_create_drafts
-- Description: Create drafts table for document drafts
-- Author: Runbook 2
-- Date: 2024-12-26

-- UP Migration
CREATE TABLE IF NOT EXISTS drafts (
  id TEXT PRIMARY KEY,
  
  -- Relationships
  case_id TEXT NOT NULL,
  template_id TEXT,
  
  -- Draft metadata
  title TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK(document_type IN ('motion', 'brief', 'complaint', 'answer', 'order', 'memo', 'letter', 'notice', 'other')),
  
  -- Document content - DUAL STORAGE (Section 2.5)
  document_json TEXT NOT NULL,  -- LegalDocument (CANONICAL)
  content_json TEXT,             -- Tiptap JSON (AUXILIARY, nullable)
  
  -- Draft status
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'review', 'final', 'filed', 'archived')),
  version INTEGER NOT NULL DEFAULT 1,
  
  -- Filing information
  filed_date TEXT,
  filed_by TEXT,
  
  -- Metadata
  tags TEXT,  -- JSON array of strings
  notes TEXT,
  
  -- Timestamps
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  -- Foreign keys
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL,
  
  -- Constraints
  CHECK(json_valid(document_json)),
  CHECK(content_json IS NULL OR json_valid(content_json)),
  CHECK(tags IS NULL OR json_valid(tags))
);

-- Indexes
CREATE INDEX idx_drafts_case_id ON drafts(case_id);
CREATE INDEX idx_drafts_template_id ON drafts(template_id);
CREATE INDEX idx_drafts_status ON drafts(status);
CREATE INDEX idx_drafts_document_type ON drafts(document_type);
CREATE INDEX idx_drafts_created_at ON drafts(created_at);

-- DOWN Migration (for rollback)
-- DROP TABLE IF EXISTS drafts;
```

**Critical:** Dual storage pattern implemented:
- `document_json` = LegalDocument (CANONICAL, NOT NULL)
- `content_json` = Tiptap JSON (AUXILIARY, nullable)

---

### 2.4 Evidence Table

**File:** `database/migrations/sqlite/versions/004_create_evidence.sql`

**Action:** CREATE

**Content:**
```sql
-- Migration: 004_create_evidence
-- Description: Create evidence table for exhibits and case law
-- Author: Runbook 2
-- Date: 2024-12-26

-- UP Migration
CREATE TABLE IF NOT EXISTS evidence (
  id TEXT PRIMARY KEY,
  
  -- Relationships
  case_id TEXT NOT NULL,
  
  -- Evidence identification
  evidence_type TEXT NOT NULL CHECK(evidence_type IN ('exhibit', 'caselaw', 'statute', 'regulation', 'document', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  
  -- Citation information (for caselaw/statute/regulation)
  citation TEXT,
  citation_type TEXT CHECK(citation_type IN ('case', 'statute', 'regulation', 'short_form', 'id', 'supra', 'exhibit', NULL)),
  
  -- Exhibit information
  exhibit_number TEXT,
  exhibit_marker TEXT,  -- e.g., "A", "B-1", "Plaintiff's 1"
  
  -- File information (if attached)
  file_path TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,
  
  -- Evidence content (for extracted text)
  content_text TEXT,
  
  -- Metadata
  source TEXT,
  date_acquired TEXT,
  tags TEXT,  -- JSON array of strings
  notes TEXT,
  
  -- Timestamps
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  -- Foreign keys
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  
  -- Constraints
  CHECK(tags IS NULL OR json_valid(tags))
);

-- Indexes
CREATE INDEX idx_evidence_case_id ON evidence(case_id);
CREATE INDEX idx_evidence_type ON evidence(evidence_type);
CREATE INDEX idx_evidence_citation_type ON evidence(citation_type);
CREATE INDEX idx_evidence_exhibit_number ON evidence(exhibit_number);

-- DOWN Migration (for rollback)
-- DROP TABLE IF EXISTS evidence;
```

---

### 2.5 Sentences Table (Fact Registry)

**File:** `database/migrations/sqlite/versions/005_create_sentences.sql`

**Action:** CREATE

**Content:**
```sql
-- Migration: 005_create_sentences
-- Description: Create sentences table for sentence-level fact tracking
-- Author: Runbook 2
-- Date: 2024-12-26

-- UP Migration
CREATE TABLE IF NOT EXISTS sentences (
  id TEXT PRIMARY KEY,
  
  -- Relationships
  draft_id TEXT NOT NULL,
  paragraph_id TEXT NOT NULL,
  
  -- Sentence location (within paragraph)
  start_offset INTEGER NOT NULL,
  end_offset INTEGER NOT NULL,
  
  -- Sentence text (derived from paragraph, but cached for querying)
  text TEXT NOT NULL,
  
  -- Sentence metadata
  sentence_index INTEGER NOT NULL,  -- Position within paragraph
  
  -- Timestamps
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  -- Foreign keys
  FOREIGN KEY (draft_id) REFERENCES drafts(id) ON DELETE CASCADE,
  
  -- Constraints
  CHECK(start_offset >= 0),
  CHECK(end_offset > start_offset)
);

-- Indexes
CREATE INDEX idx_sentences_draft_id ON sentences(draft_id);
CREATE INDEX idx_sentences_paragraph_id ON sentences(paragraph_id);
CREATE INDEX idx_sentences_text_fts ON sentences(text);  -- Full-text search

-- DOWN Migration (for rollback)
-- DROP TABLE IF EXISTS sentences;
```

---

### 2.6 Citations Table

**File:** `database/migrations/sqlite/versions/006_create_citations.sql`

**Action:** CREATE

**Content:**
```sql
-- Migration: 006_create_citations
-- Description: Create citations table for linking evidence to sentences
-- Author: Runbook 2
-- Date: 2024-12-26

-- UP Migration
CREATE TABLE IF NOT EXISTS citations (
  id TEXT PRIMARY KEY,
  
  -- Relationships
  sentence_id TEXT NOT NULL,
  evidence_id TEXT,
  
  -- Citation details
  citation_text TEXT NOT NULL,
  citation_type TEXT NOT NULL CHECK(citation_type IN ('case', 'statute', 'regulation', 'short_form', 'id', 'supra', 'exhibit')),
  
  -- Position within sentence
  start_offset INTEGER NOT NULL,
  end_offset INTEGER NOT NULL,
  
  -- Parsed citation details (optional)
  parsed_data TEXT,  -- JSON object with parsed citation components
  
  -- Timestamps
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  -- Foreign keys
  FOREIGN KEY (sentence_id) REFERENCES sentences(id) ON DELETE CASCADE,
  FOREIGN KEY (evidence_id) REFERENCES evidence(id) ON DELETE SET NULL,
  
  -- Constraints
  CHECK(start_offset >= 0),
  CHECK(end_offset > start_offset),
  CHECK(parsed_data IS NULL OR json_valid(parsed_data))
);

-- Indexes
CREATE INDEX idx_citations_sentence_id ON citations(sentence_id);
CREATE INDEX idx_citations_evidence_id ON citations(evidence_id);
CREATE INDEX idx_citations_type ON citations(citation_type);

-- DOWN Migration (for rollback)
-- DROP TABLE IF EXISTS citations;
```

---

## Task 3: PostgreSQL Migrations

### 3.1 Convert SQLite to PostgreSQL

For each SQLite migration above, create a PostgreSQL equivalent with these changes:

**File:** `database/migrations/postgresql/versions/001_create_templates.sql`

**Key differences:**
```sql
-- PostgreSQL-specific changes:

-- 1. Use JSONB instead of TEXT for JSON columns
document_json JSONB NOT NULL,
tags JSONB,

-- 2. Use BOOLEAN directly (no conversion needed)
is_public BOOLEAN NOT NULL DEFAULT false,

-- 3. Use TIMESTAMP instead of TEXT for dates
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

-- 4. Remove json_valid() checks (PostgreSQL validates JSONB automatically)
-- CHECK(json_valid(document_json))  -- Remove this

-- 5. Use GIN index for JSONB columns
CREATE INDEX idx_templates_document_json ON templates USING GIN (document_json);
CREATE INDEX idx_templates_tags ON templates USING GIN (tags);

-- 6. Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Action:** CREATE all 6 PostgreSQL migrations (001-006) with these adaptations

---

## Task 4: Migration Runners

### 4.1 SQLite Migration Runner

**File:** `database/migrations/sqlite/runner.ts`

**Action:** CREATE

**Content:**
```typescript
import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

interface MigrationRecord {
  id: number;
  name: string;
  applied_at: string;
}

export class SQLiteMigrationRunner {
  private db: Database.Database;
  private migrationsDir: string;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.migrationsDir = path.join(__dirname, 'versions');
    
    // Create migrations tracking table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        applied_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
  }

  async up(): Promise<void> {
    const migrationFiles = fs.readdirSync(this.migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    const appliedMigrations = this.getAppliedMigrations();
    const appliedNames = new Set(appliedMigrations.map(m => m.name));

    for (const file of migrationFiles) {
      if (appliedNames.has(file)) {
        console.log(`✓ ${file} (already applied)`);
        continue;
      }

      console.log(`→ Applying ${file}...`);
      const sql = fs.readFileSync(
        path.join(this.migrationsDir, file),
        'utf-8'
      );

      // Extract UP migration (before DOWN comment)
      const upSQL = sql.split('-- DOWN Migration')[0];

      try {
        this.db.exec(upSQL);
        this.recordMigration(file);
        console.log(`✓ ${file} applied successfully`);
      } catch (error) {
        console.error(`✗ Failed to apply ${file}:`, error);
        throw error;
      }
    }

    console.log('\n✅ All migrations applied successfully');
  }

  async down(): Promise<void> {
    const appliedMigrations = this.getAppliedMigrations();
    
    if (appliedMigrations.length === 0) {
      console.log('No migrations to roll back');
      return;
    }

    // Get last applied migration
    const lastMigration = appliedMigrations[appliedMigrations.length - 1];
    const file = lastMigration.name;

    console.log(`→ Rolling back ${file}...`);
    const sql = fs.readFileSync(
      path.join(this.migrationsDir, file),
      'utf-8'
    );

    // Extract DOWN migration
    const downMatch = sql.match(/-- DOWN Migration.*?\n([\s\S]*)/);
    if (!downMatch) {
      throw new Error(`No DOWN migration found in ${file}`);
    }

    const downSQL = downMatch[1]
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    try {
      this.db.exec(downSQL);
      this.removeMigration(file);
      console.log(`✓ ${file} rolled back successfully`);
    } catch (error) {
      console.error(`✗ Failed to roll back ${file}:`, error);
      throw error;
    }
  }

  private getAppliedMigrations(): MigrationRecord[] {
    return this.db
      .prepare('SELECT * FROM migrations ORDER BY id ASC')
      .all() as MigrationRecord[];
  }

  private recordMigration(name: string): void {
    this.db
      .prepare('INSERT INTO migrations (name) VALUES (?)')
      .run(name);
  }

  private removeMigration(name: string): void {
    this.db
      .prepare('DELETE FROM migrations WHERE name = ?')
      .run(name);
  }

  close(): void {
    this.db.close();
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const dbPath = process.env.DB_PATH || './factsway.db';

  const runner = new SQLiteMigrationRunner(dbPath);

  (async () => {
    try {
      if (command === 'up') {
        await runner.up();
      } else if (command === 'down') {
        await runner.down();
      } else {
        console.error('Usage: node runner.js [up|down]');
        process.exit(1);
      }
    } finally {
      runner.close();
    }
  })();
}
```

---

### 4.2 PostgreSQL Migration Runner

**File:** `database/migrations/postgresql/runner.ts`

**Action:** CREATE

**Content:**
```typescript
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

interface MigrationRecord {
  id: number;
  name: string;
  applied_at: Date;
}

export class PostgreSQLMigrationRunner {
  private pool: Pool;
  private migrationsDir: string;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
    this.migrationsDir = path.join(__dirname, 'versions');
  }

  async init(): Promise<void> {
    // Create migrations tracking table
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  async up(): Promise<void> {
    await this.init();

    const migrationFiles = fs.readdirSync(this.migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    const appliedMigrations = await this.getAppliedMigrations();
    const appliedNames = new Set(appliedMigrations.map(m => m.name));

    for (const file of migrationFiles) {
      if (appliedNames.has(file)) {
        console.log(`✓ ${file} (already applied)`);
        continue;
      }

      console.log(`→ Applying ${file}...`);
      const sql = fs.readFileSync(
        path.join(this.migrationsDir, file),
        'utf-8'
      );

      // Extract UP migration
      const upSQL = sql.split('-- DOWN Migration')[0];

      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(upSQL);
        await this.recordMigration(client, file);
        await client.query('COMMIT');
        console.log(`✓ ${file} applied successfully`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`✗ Failed to apply ${file}:`, error);
        throw error;
      } finally {
        client.release();
      }
    }

    console.log('\n✅ All migrations applied successfully');
  }

  async down(): Promise<void> {
    await this.init();

    const appliedMigrations = await this.getAppliedMigrations();
    
    if (appliedMigrations.length === 0) {
      console.log('No migrations to roll back');
      return;
    }

    // Get last applied migration
    const lastMigration = appliedMigrations[appliedMigrations.length - 1];
    const file = lastMigration.name;

    console.log(`→ Rolling back ${file}...`);
    const sql = fs.readFileSync(
      path.join(this.migrationsDir, file),
      'utf-8'
    );

    // Extract DOWN migration
    const downMatch = sql.match(/-- DOWN Migration.*?\n([\s\S]*)/);
    if (!downMatch) {
      throw new Error(`No DOWN migration found in ${file}`);
    }

    const downSQL = downMatch[1]
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(downSQL);
      await this.removeMigration(client, file);
      await client.query('COMMIT');
      console.log(`✓ ${file} rolled back successfully`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`✗ Failed to roll back ${file}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  private async getAppliedMigrations(): Promise<MigrationRecord[]> {
    const result = await this.pool.query(
      'SELECT * FROM migrations ORDER BY id ASC'
    );
    return result.rows;
  }

  private async recordMigration(client: any, name: string): Promise<void> {
    await client.query('INSERT INTO migrations (name) VALUES ($1)', [name]);
  }

  private async removeMigration(client: any, name: string): Promise<void> {
    await client.query('DELETE FROM migrations WHERE name = $1', [name]);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const connectionString = process.env.DATABASE_URL || 'postgresql://localhost/factsway';

  const runner = new PostgreSQLMigrationRunner(connectionString);

  (async () => {
    try {
      if (command === 'up') {
        await runner.up();
      } else if (command === 'down') {
        await runner.down();
      } else {
        console.error('Usage: node runner.js [up|down]');
        process.exit(1);
      }
    } finally {
      await runner.close();
    }
  })();
}
```

---

## Task 5: Repository Pattern Implementation

### 5.1 Base Repository Interface

**File:** `database/repositories/base.repository.ts`

**Action:** CREATE

**Content:**
```typescript
export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(options?: FindOptions): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
}

export interface FindOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
  where?: Record<string, any>;
}
```

---

### 5.2 Template Repository

**File:** `database/repositories/template.repository.ts`

**Action:** CREATE

**Content:**
```typescript
import { v4 as uuidv4 } from 'uuid';
import { LegalDocument } from '@factsway/shared-types';
import { IRepository, FindOptions } from './base.repository';

export interface Template {
  id: string;
  name: string;
  description?: string;
  category: 'motion' | 'brief' | 'complaint' | 'answer' | 'notice' | 'order' | 'memo' | 'letter' | 'other';
  document_json: LegalDocument;  // CANONICAL
  tags?: string[];
  is_public: boolean;
  author?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTemplateData {
  name: string;
  description?: string;
  category: Template['category'];
  document_json: LegalDocument;
  tags?: string[];
  is_public?: boolean;
  author?: string;
}

export class TemplateRepository implements IRepository<Template> {
  constructor(private db: any) {}  // any = Database (SQLite) or Pool (PostgreSQL)

  async findById(id: string): Promise<Template | null> {
    // Implementation depends on database type
    const row = this.db.prepare
      ? this.db.prepare('SELECT * FROM templates WHERE id = ?').get(id)  // SQLite
      : (await this.db.query('SELECT * FROM templates WHERE id = $1', [id])).rows[0];  // PostgreSQL

    if (!row) return null;

    return this.mapRow(row);
  }

  async findAll(options?: FindOptions): Promise<Template[]> {
    let query = 'SELECT * FROM templates';
    const params: any[] = [];

    if (options?.where) {
      const conditions = Object.entries(options.where)
        .map(([key, _], index) => {
          params.push(options.where![key]);
          return this.db.prepare ? `${key} = ?` : `${key} = $${index + 1}`;
        });
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    if (options?.orderBy) {
      query += ` ORDER BY ${options.orderBy} ${options.order || 'ASC'}`;
    }

    if (options?.limit) {
      query += this.db.prepare ? ` LIMIT ${options.limit}` : ` LIMIT $${params.length + 1}`;
      if (!this.db.prepare) params.push(options.limit);
    }

    if (options?.offset) {
      query += this.db.prepare ? ` OFFSET ${options.offset}` : ` OFFSET $${params.length + 1}`;
      if (!this.db.prepare) params.push(options.offset);
    }

    const rows = this.db.prepare
      ? this.db.prepare(query).all(...params)  // SQLite
      : (await this.db.query(query, params)).rows;  // PostgreSQL

    return rows.map(row => this.mapRow(row));
  }

  async create(data: CreateTemplateData): Promise<Template> {
    const id = uuidv4();
    const now = new Date();

    const template: Template = {
      id,
      name: data.name,
      description: data.description,
      category: data.category,
      document_json: data.document_json,
      tags: data.tags,
      is_public: data.is_public ?? false,
      author: data.author,
      created_at: now,
      updated_at: now,
    };

    const query = `
      INSERT INTO templates (
        id, name, description, category, document_json, tags, is_public, author, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      template.id,
      template.name,
      template.description || null,
      template.category,
      JSON.stringify(template.document_json),
      template.tags ? JSON.stringify(template.tags) : null,
      template.is_public ? 1 : 0,
      template.author || null,
      template.created_at.toISOString(),
      template.updated_at.toISOString(),
    ];

    if (this.db.prepare) {
      // SQLite
      this.db.prepare(query).run(...params);
    } else {
      // PostgreSQL (convert ? to $1, $2, etc.)
      const pgQuery = query.replace(/\?/g, (_, i) => `$${params.indexOf(_) + 1}`);
      await this.db.query(pgQuery, params);
    }

    return template;
  }

  async update(id: string, data: Partial<CreateTemplateData>): Promise<Template> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Template ${id} not found`);
    }

    const updated: Template = {
      ...existing,
      ...data,
      updated_at: new Date(),
    };

    const query = `
      UPDATE templates
      SET name = ?, description = ?, category = ?, document_json = ?, tags = ?, is_public = ?, author = ?, updated_at = ?
      WHERE id = ?
    `;

    const params = [
      updated.name,
      updated.description || null,
      updated.category,
      JSON.stringify(updated.document_json),
      updated.tags ? JSON.stringify(updated.tags) : null,
      updated.is_public ? 1 : 0,
      updated.author || null,
      updated.updated_at.toISOString(),
      id,
    ];

    if (this.db.prepare) {
      this.db.prepare(query).run(...params);
    } else {
      const pgQuery = query.replace(/\?/g, (_, i) => `$${params.indexOf(_) + 1}`);
      await this.db.query(pgQuery, params);
    }

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM templates WHERE id = ?';

    if (this.db.prepare) {
      const result = this.db.prepare(query).run(id);
      return result.changes > 0;
    } else {
      const pgQuery = 'DELETE FROM templates WHERE id = $1';
      const result = await this.db.query(pgQuery, [id]);
      return result.rowCount > 0;
    }
  }

  private mapRow(row: any): Template {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      document_json: typeof row.document_json === 'string'
        ? JSON.parse(row.document_json)
        : row.document_json,
      tags: row.tags
        ? typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags
        : undefined,
      is_public: !!row.is_public,
      author: row.author,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}
```

---

### 5.3 Case Repository

**File:** `database/repositories/case.repository.ts`

**Action:** CREATE similar to TemplateRepository with Case-specific fields

**Key differences:**
- Includes parties (JSON array)
- Includes case_number, court, judge fields
- Status field with validation

---

### 5.4 Draft Repository

**File:** `database/repositories/draft.repository.ts`

**Action:** CREATE similar to TemplateRepository

**CRITICAL - Dual Storage Implementation:**

```typescript
export interface Draft {
  id: string;
  case_id: string;
  template_id?: string;
  title: string;
  document_type: string;
  
  // DUAL STORAGE (Section 2.5)
  document_json: LegalDocument;  // CANONICAL (required)
  content_json?: any;             // Tiptap JSON (optional)
  
  status: 'draft' | 'review' | 'final' | 'filed' | 'archived';
  version: number;
  filed_date?: Date;
  filed_by?: string;
  tags?: string[];
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

// In create/update methods:
const params = [
  ...,
  JSON.stringify(draft.document_json),     // ALWAYS required
  draft.content_json ? JSON.stringify(draft.content_json) : null,  // Optional
  ...,
];
```

**Note:** content_json is nullable and can be regenerated from document_json if lost

---

## Task 6: Database Configuration

### 6.1 Database Factory

**File:** `database/config/database.factory.ts`

**Action:** CREATE

**Content:**
```typescript
import Database from 'better-sqlite3';
import { Pool } from 'pg';

export type DatabaseType = 'sqlite' | 'postgresql';

export interface DatabaseConfig {
  type: DatabaseType;
  sqlite?: {
    path: string;
  };
  postgresql?: {
    connectionString: string;
  };
}

export class DatabaseFactory {
  static create(config: DatabaseConfig): Database.Database | Pool {
    if (config.type === 'sqlite') {
      if (!config.sqlite?.path) {
        throw new Error('SQLite path required');
      }
      return new Database(config.sqlite.path);
    } else {
      if (!config.postgresql?.connectionString) {
        throw new Error('PostgreSQL connection string required');
      }
      return new Pool({
        connectionString: config.postgresql.connectionString,
      });
    }
  }
}
```

---

### 6.2 Environment Configuration

**File:** `database/config/env.ts`

**Action:** CREATE

**Content:**
```typescript
import { DatabaseConfig } from './database.factory';

export function getDatabaseConfig(): DatabaseConfig {
  const env = process.env.NODE_ENV || 'development';
  const dbType = (process.env.DB_TYPE || 'sqlite') as 'sqlite' | 'postgresql';

  if (dbType === 'sqlite') {
    return {
      type: 'sqlite',
      sqlite: {
        path: process.env.SQLITE_PATH || `./factsway-${env}.db`,
      },
    };
  } else {
    return {
      type: 'postgresql',
      postgresql: {
        connectionString: process.env.DATABASE_URL || 'postgresql://localhost/factsway',
      },
    };
  }
}
```

---

## Task 7: Tests

### 7.1 Test Setup

**File:** `database/tests/setup.ts`

**Action:** CREATE

**Content:**
```typescript
import { DatabaseFactory } from '../config/database.factory';
import { SQLiteMigrationRunner } from '../migrations/sqlite/runner';

export async function setupTestDatabase(): Promise<any> {
  const db = DatabaseFactory.create({
    type: 'sqlite',
    sqlite: { path: ':memory:' },  // In-memory for tests
  });

  // Run migrations
  const runner = new SQLiteMigrationRunner(':memory:');
  await runner.up();
  runner.close();

  return db;
}

export function teardownTestDatabase(db: any): void {
  db.close();
}
```

---

### 7.2 Template Repository Tests

**File:** `database/tests/unit/template.repository.test.ts`

**Action:** CREATE

**Content:**
```typescript
import { TemplateRepository } from '../../repositories/template.repository';
import { setupTestDatabase, teardownTestDatabase } from '../setup';
import { LegalDocument } from '@factsway/shared-types';

describe('TemplateRepository', () => {
  let db: any;
  let repo: TemplateRepository;

  beforeAll(async () => {
    db = await setupTestDatabase();
    repo = new TemplateRepository(db);
  });

  afterAll(() => {
    teardownTestDatabase(db);
  });

  describe('create', () => {
    it('should create a template with LegalDocument', async () => {
      const doc: LegalDocument = {
        meta: {
          id: 'doc-1',
          title: 'Test Template',
          type: 'motion',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        body: {
          sections: [],
        },
        citations: [],
        embedded_objects: [],
      };

      const template = await repo.create({
        name: 'Test Template',
        category: 'motion',
        document_json: doc,
        is_public: true,
      });

      expect(template.id).toBeDefined();
      expect(template.name).toBe('Test Template');
      expect(template.category).toBe('motion');
      expect(template.document_json).toEqual(doc);
      expect(template.is_public).toBe(true);
    });
  });

  describe('findById', () => {
    it('should retrieve a template by ID', async () => {
      const doc: LegalDocument = {
        meta: {
          id: 'doc-2',
          title: 'Find Test',
          type: 'brief',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        body: { sections: [] },
        citations: [],
        embedded_objects: [],
      };

      const created = await repo.create({
        name: 'Find Test',
        category: 'brief',
        document_json: doc,
      });

      const found = await repo.findById(created.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
      expect(found!.name).toBe('Find Test');
      expect(found!.document_json).toEqual(doc);
    });

    it('should return null for non-existent ID', async () => {
      const found = await repo.findById('non-existent');
      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should retrieve all templates', async () => {
      const templates = await repo.findAll();
      expect(templates.length).toBeGreaterThan(0);
    });

    it('should filter by category', async () => {
      const templates = await repo.findAll({
        where: { category: 'motion' },
      });

      expect(templates.every(t => t.category === 'motion')).toBe(true);
    });

    it('should limit results', async () => {
      const templates = await repo.findAll({ limit: 1 });
      expect(templates.length).toBe(1);
    });
  });

  describe('update', () => {
    it('should update a template', async () => {
      const doc: LegalDocument = {
        meta: {
          id: 'doc-3',
          title: 'Update Test',
          type: 'order',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        body: { sections: [] },
        citations: [],
        embedded_objects: [],
      };

      const created = await repo.create({
        name: 'Original Name',
        category: 'order',
        document_json: doc,
      });

      const updated = await repo.update(created.id, {
        name: 'Updated Name',
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.id).toBe(created.id);
    });
  });

  describe('delete', () => {
    it('should delete a template', async () => {
      const doc: LegalDocument = {
        meta: {
          id: 'doc-4',
          title: 'Delete Test',
          type: 'memo',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        body: { sections: [] },
        citations: [],
        embedded_objects: [],
      };

      const created = await repo.create({
        name: 'Delete Test',
        category: 'memo',
        document_json: doc,
      });

      const deleted = await repo.delete(created.id);
      expect(deleted).toBe(true);

      const found = await repo.findById(created.id);
      expect(found).toBeNull();
    });
  });
});
```

---

## Task 8: Verification (from Runbook 0 Section 19.2)

### 8.1 Schema Files
- [ ] SQLite migration files in `migrations/sqlite/`
- [ ] PostgreSQL migration files in `migrations/postgresql/`
- [ ] Schema matches Section 2 data models (Template, Case, Draft, Evidence)
- [ ] LegalDocument stored as JSON in `document_json` column (canonical)
- [ ] Tiptap JSON stored as JSON in `content_json` column (auxiliary, nullable)

### 8.2 Tables Created
- [ ] `templates` table with all fields from Section 2.2
- [ ] `cases` table with all fields from Section 2.3
- [ ] `drafts` table with document storage
- [ ] `evidence` table for exhibits/case law
- [ ] `citations` table linking evidence to sentences
- [ ] `sentences` table (fact registry)

### 8.3 Indexes
- [ ] Primary keys on all tables
- [ ] Foreign key constraints properly defined
- [ ] Indexes on frequently queried fields (case_id, template_id, etc.)
- [ ] GIN index on `document_json` for JSON queries (PostgreSQL)

### 8.4 Migrations
- [ ] Up migrations create tables
- [ ] Down migrations drop tables
- [ ] Migrations are idempotent
- [ ] Migration order specified in manifest

### 8.5 Repository Layer
- [ ] Repository interfaces defined for each entity
- [ ] SQLite implementation
- [ ] PostgreSQL implementation
- [ ] Repositories use TypeScript types from Runbook 1

### 8.6 Tests
- [ ] Migration tests run successfully (up then down)
- [ ] Repository CRUD tests pass for all entities
- [ ] Foreign key constraints validated
- [ ] JSON storage/retrieval tested

### 8.7 Cross-Reference
- [ ] Schema matches Section 2 data models
- [ ] Uses LegalDocument format from Section 4
- [ ] Dual storage pattern from Section 2.5

---

## Success Criteria

✅ Database can be created from migrations  
✅ All repositories pass CRUD tests  
✅ SQLite and PostgreSQL schemas are equivalent  
✅ Dual storage (document_json + content_json) works  
✅ Foreign key relationships enforced  
✅ JSON storage validated  
✅ Ready for Runbook 3 (Records Service)  

---

## Next Steps

After Runbook 2 is complete:

1. **Verify migrations run:** `npm run migrate:sqlite:up`
2. **Run tests:** `npm test`
3. **Proceed to Runbook 3:** Records Service will use these repositories

---

## Reference

- **Runbook 0 Section 2:** Data Models
- **Runbook 0 Section 4:** LegalDocument Schema (what goes in document_json)
- **Runbook 0 Section 2.5:** Dual Storage Pattern
- **Runbook 0 Section 19.2:** Verification Criteria

---

**End of Runbook 2**
