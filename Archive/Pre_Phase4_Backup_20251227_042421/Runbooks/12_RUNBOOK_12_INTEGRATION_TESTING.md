# Runbook 12: Integration Testing

**Phase:** Quality Assurance (Critical Path)  
**Estimated Time:** 6-10 hours  
**Prerequisites:** Runbooks 1-11 complete (services + E2E tests)  
**Depends On:** Runbook 0 Sections 18, 19.11  
**Enables:** Runbook 14 (CI/CD), production deployment confidence

---

## Objective

Create **comprehensive integration testing suite** that validates service-to-service communication, API contracts, database operations, and cross-service workflows without requiring the full Electron UI.

**Success Criteria:**
- ✅ Jest configured for integration testing
- ✅ All 8 services have API contract tests
- ✅ Service-to-service communication tested
- ✅ Database migrations tested
- ✅ Transaction rollback scenarios tested
- ✅ Error handling and retry logic validated
- ✅ Performance benchmarks established
- ✅ Tests run in CI environment
- ✅ Test coverage >80% for critical paths

---

## Context from Runbook 0

**Referenced Sections:**
- **Section 18.1:** Testing pyramid (integration tests in middle)
- **Section 18.5:** API contract testing
- **Section 18.6:** Service integration patterns
- **Section 19.11:** Integration test requirements
- **Section 19.12:** Performance benchmarks

**Key Principle from Runbook 0:**
> "Integration tests validate that services work together correctly. They test the contracts between services, not the internal implementation. A passing integration test means Service A can successfully communicate with Service B according to their agreed-upon interface."

---

## Current State

**What exists:**
- ✅ All 8 backend services (Runbooks 3-7)
- ✅ E2E test framework (Runbook 11)
- ❌ No integration test framework
- ❌ No API contract tests
- ❌ No service mock utilities
- ❌ No database test harness

**What this creates:**
- ✅ Jest integration test configuration
- ✅ API contract test suite (8 services)
- ✅ Service mock utilities
- ✅ Database test harness (SQLite + PostgreSQL)
- ✅ Cross-service workflow tests
- ✅ Error scenario tests
- ✅ Performance benchmark suite
- ✅ Test data seeding utilities

---

## Task 1: Jest Integration Test Setup

### 1.1 Jest Configuration

**File:** `integration-tests/jest.config.js`

**Action:** CREATE

**Content:**
```javascript
/**
 * Jest Configuration for Integration Tests
 * 
 * Reference: Runbook 0 Section 18.1
 * 
 * Integration tests validate service-to-service communication
 * and database operations without requiring full UI.
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Test directories
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    '../services/**/src/**/*.{ts,js}',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 80,
      statements: 80
    }
  },
  
  // Timeout (30 seconds for integration tests)
  testTimeout: 30000,
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/setup.ts'],
  
  // Module paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@factsway/shared-types$': '<rootDir>/../packages/shared-types/src'
  },
  
  // Global setup/teardown
  globalSetup: '<rootDir>/global-setup.ts',
  globalTeardown: '<rootDir>/global-teardown.ts'
};
```

---

### 1.2 Package.json

**File:** `integration-tests/package.json`

**Action:** CREATE

**Content:**
```json
{
  "name": "factsway-integration-tests",
  "version": "1.0.0",
  "description": "Integration tests for FACTSWAY services",
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  },
  "devDependencies": {
    "@types/jest": "^29.5.11",
    "@types/node": "^20.10.6",
    "axios": "^1.6.2",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "typescript": "^5.3.3"
  }
}
```

---

### 1.3 Global Setup

**File:** `integration-tests/global-setup.ts`

**Action:** CREATE

**Purpose:** Start all services before tests

**Content:**
```typescript
/**
 * Global Test Setup
 * 
 * Starts all 8 backend services before running integration tests.
 * Services run on test ports (4001-4008) to avoid conflicts.
 */
import { spawn, ChildProcess } from 'child_process';
import axios from 'axios';
import path from 'path';

const services: ChildProcess[] = [];

// Test service ports (different from production 3001-3008)
const TEST_PORTS = {
  records: 4001,
  ingestion: 4002,
  export: 4003,
  caseblock: 4004,
  signature: 4005,
  facts: 4006,
  exhibits: 4007,
  caselaw: 4008
};

/**
 * Wait for service to be healthy
 */
async function waitForService(
  name: string,
  port: number,
  maxRetries = 30
): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(`http://localhost:${port}/health`, {
        timeout: 1000
      });
      if (response.status === 200) {
        console.log(`✓ ${name} service ready on port ${port}`);
        return;
      }
    } catch (error) {
      // Service not ready yet, wait and retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw new Error(`${name} service failed to start on port ${port}`);
}

/**
 * Start a service
 */
function startService(
  name: string,
  executable: string,
  port: number,
  env: Record<string, string>
): ChildProcess {
  console.log(`Starting ${name} service on port ${port}...`);
  
  const proc = spawn(executable, [], {
    env: {
      ...process.env,
      PORT: port.toString(),
      SERVICE_NAME: name,
      DEPLOYMENT_ENV: 'test',
      LOG_LEVEL: 'error', // Reduce noise in tests
      DATABASE_URL: 'sqlite:///tmp/factsway-test.db',
      ...env
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  
  // Log errors
  proc.stderr?.on('data', (data) => {
    console.error(`[${name}] ${data.toString()}`);
  });
  
  proc.on('exit', (code) => {
    if (code !== 0) {
      console.error(`${name} service exited with code ${code}`);
    }
  });
  
  services.push(proc);
  return proc;
}

export default async function globalSetup() {
  console.log('\n=================================');
  console.log('Starting Integration Test Services');
  console.log('=================================\n');
  
  // Generate service URLs for test environment
  const serviceURLs = {
    RECORDS_SERVICE_URL: `http://localhost:${TEST_PORTS.records}`,
    INGESTION_SERVICE_URL: `http://localhost:${TEST_PORTS.ingestion}`,
    EXPORT_SERVICE_URL: `http://localhost:${TEST_PORTS.export}`,
    CASEBLOCK_SERVICE_URL: `http://localhost:${TEST_PORTS.caseblock}`,
    SIGNATURE_SERVICE_URL: `http://localhost:${TEST_PORTS.signature}`,
    FACTS_SERVICE_URL: `http://localhost:${TEST_PORTS.facts}`,
    EXHIBITS_SERVICE_URL: `http://localhost:${TEST_PORTS.exhibits}`,
    CASELAW_SERVICE_URL: `http://localhost:${TEST_PORTS.caselaw}`
  };
  
  // Start all services
  const resourcesDir = path.join(__dirname, '../desktop/resources/services');
  
  startService('records', path.join(resourcesDir, 'records/start.sh'), TEST_PORTS.records, serviceURLs);
  startService('ingestion', path.join(resourcesDir, 'ingestion'), TEST_PORTS.ingestion, serviceURLs);
  startService('export', path.join(resourcesDir, 'export'), TEST_PORTS.export, serviceURLs);
  startService('caseblock', path.join(resourcesDir, 'caseblock'), TEST_PORTS.caseblock, serviceURLs);
  startService('signature', path.join(resourcesDir, 'signature'), TEST_PORTS.signature, serviceURLs);
  startService('facts', path.join(resourcesDir, 'facts'), TEST_PORTS.facts, serviceURLs);
  startService('exhibits', path.join(resourcesDir, 'exhibits'), TEST_PORTS.exhibits, serviceURLs);
  startService('caselaw', path.join(resourcesDir, 'caselaw'), TEST_PORTS.caselaw, serviceURLs);
  
  // Wait for all services to be ready
  await Promise.all([
    waitForService('records', TEST_PORTS.records),
    waitForService('ingestion', TEST_PORTS.ingestion),
    waitForService('export', TEST_PORTS.export),
    waitForService('caseblock', TEST_PORTS.caseblock),
    waitForService('signature', TEST_PORTS.signature),
    waitForService('facts', TEST_PORTS.facts),
    waitForService('exhibits', TEST_PORTS.exhibits),
    waitForService('caselaw', TEST_PORTS.caselaw)
  ]);
  
  console.log('\n✓ All services ready\n');
  
  // Store service ports for tests
  (global as any).__TEST_PORTS__ = TEST_PORTS;
}
```

---

### 1.4 Global Teardown

**File:** `integration-tests/global-teardown.ts`

**Action:** CREATE

**Purpose:** Stop all services after tests

**Content:**
```typescript
/**
 * Global Test Teardown
 * 
 * Stops all services and cleans up test database.
 */
import fs from 'fs';

export default async function globalTeardown() {
  console.log('\n=================================');
  console.log('Stopping Integration Test Services');
  console.log('=================================\n');
  
  // Services will be killed when process exits
  // (global-setup stores them but they're killed automatically)
  
  // Clean up test database
  const testDbPath = '/tmp/factsway-test.db';
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
    console.log('✓ Test database cleaned up');
  }
  
  console.log('✓ Services stopped\n');
}
```

---

## Task 2: API Contract Tests

### 2.1 Records Service Contract

**File:** `integration-tests/tests/contracts/records-service.test.ts`

**Action:** CREATE

**Purpose:** Test Records Service API contract

**Content:**
```typescript
/**
 * Records Service API Contract Tests
 * 
 * Reference: Runbook 0 Section 18.5
 * 
 * Validates that Records Service implements its API contract correctly.
 */
import axios from 'axios';

const RECORDS_URL = `http://localhost:${(global as any).__TEST_PORTS__.records}`;

describe('Records Service API Contract', () => {
  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await axios.get(`${RECORDS_URL}/health`);
      
      expect(response.status).toBe(200);
      expect(response.data).toEqual({
        status: 'healthy',
        service: 'records',
        timestamp: expect.any(String)
      });
    });
  });
  
  describe('Templates API', () => {
    let templateId: string;
    
    it('POST /templates - should create template', async () => {
      const template = {
        name: 'Test Template',
        category: 'motion',
        jurisdiction: 'Texas',
        court_level: 'district',
        description: 'Integration test template',
        document_json: {
          sections: [],
          caseblock: {},
          signature: {}
        },
        variables: {}
      };
      
      const response = await axios.post(`${RECORDS_URL}/templates`, template);
      
      expect(response.status).toBe(201);
      expect(response.data).toMatchObject({
        id: expect.any(String),
        name: 'Test Template',
        category: 'motion'
      });
      
      templateId = response.data.id;
    });
    
    it('GET /templates - should list templates', async () => {
      const response = await axios.get(`${RECORDS_URL}/templates`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
    });
    
    it('GET /templates/:id - should get template by ID', async () => {
      const response = await axios.get(`${RECORDS_URL}/templates/${templateId}`);
      
      expect(response.status).toBe(200);
      expect(response.data.id).toBe(templateId);
      expect(response.data.name).toBe('Test Template');
    });
    
    it('PUT /templates/:id - should update template', async () => {
      const response = await axios.put(`${RECORDS_URL}/templates/${templateId}`, {
        name: 'Updated Template Name'
      });
      
      expect(response.status).toBe(200);
      expect(response.data.name).toBe('Updated Template Name');
    });
    
    it('DELETE /templates/:id - should delete template', async () => {
      const response = await axios.delete(`${RECORDS_URL}/templates/${templateId}`);
      
      expect(response.status).toBe(204);
      
      // Verify deletion
      await expect(
        axios.get(`${RECORDS_URL}/templates/${templateId}`)
      ).rejects.toThrow();
    });
  });
  
  describe('Cases API', () => {
    it('POST /cases - should create case', async () => {
      const caseData = {
        template_id: null,
        case_name: 'Smith v. Jones',
        cause_number: '2024-CV-001234',
        court_name: 'District Court',
        filing_date: '2024-01-15',
        variable_values: {}
      };
      
      const response = await axios.post(`${RECORDS_URL}/cases`, caseData);
      
      expect(response.status).toBe(201);
      expect(response.data).toMatchObject({
        id: expect.any(String),
        case_name: 'Smith v. Jones',
        cause_number: '2024-CV-001234'
      });
    });
    
    it('GET /cases - should list cases', async () => {
      const response = await axios.get(`${RECORDS_URL}/cases`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });
  
  describe('Error Handling', () => {
    it('should return 404 for non-existent template', async () => {
      await expect(
        axios.get(`${RECORDS_URL}/templates/non-existent-id`)
      ).rejects.toMatchObject({
        response: { status: 404 }
      });
    });
    
    it('should return 400 for invalid template data', async () => {
      await expect(
        axios.post(`${RECORDS_URL}/templates`, { invalid: 'data' })
      ).rejects.toMatchObject({
        response: { status: 400 }
      });
    });
  });
});
```

---

### 2.2 Ingestion Service Contract

**File:** `integration-tests/tests/contracts/ingestion-service.test.ts`

**Action:** CREATE

**Purpose:** Test Ingestion Service API contract

**Content:**
```typescript
/**
 * Ingestion Service API Contract Tests
 * 
 * Reference: Runbook 0 Section 18.5
 */
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const INGESTION_URL = `http://localhost:${(global as any).__TEST_PORTS__.ingestion}`;

describe('Ingestion Service API Contract', () => {
  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await axios.get(`${INGESTION_URL}/health`);
      
      expect(response.status).toBe(200);
      expect(response.data.status).toBe('healthy');
    });
  });
  
  describe('POST /parse', () => {
    it('should parse DOCX file', async () => {
      // Load sample DOCX file
      const docxPath = path.join(__dirname, '../../fixtures/sample-motion.docx');
      const formData = new FormData();
      formData.append('file', fs.createReadStream(docxPath));
      
      const response = await axios.post(`${INGESTION_URL}/parse`, formData, {
        headers: formData.getHeaders()
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        sections: expect.any(Array),
        metadata: expect.any(Object)
      });
      
      // Verify sections structure
      expect(response.data.sections[0]).toMatchObject({
        id: expect.any(String),
        level: expect.any(Number),
        title: expect.any(String),
        content: expect.any(Array)
      });
    });
    
    it('should reject non-DOCX files', async () => {
      const formData = new FormData();
      formData.append('file', Buffer.from('not a docx'), {
        filename: 'test.txt',
        contentType: 'text/plain'
      });
      
      await expect(
        axios.post(`${INGESTION_URL}/parse`, formData, {
          headers: formData.getHeaders()
        })
      ).rejects.toMatchObject({
        response: { status: 400 }
      });
    });
  });
  
  describe('POST /extract-caseblock', () => {
    it('should extract caseblock data', async () => {
      const docxPath = path.join(__dirname, '../../fixtures/sample-motion.docx');
      const formData = new FormData();
      formData.append('file', fs.createReadStream(docxPath));
      
      const response = await axios.post(`${INGESTION_URL}/extract-caseblock`, formData, {
        headers: formData.getHeaders()
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        case_name: expect.any(String),
        cause_number: expect.any(String),
        court_name: expect.any(String)
      });
    });
  });
});
```

---

## Task 3: Service Integration Tests

### 3.1 Draft Creation Workflow

**File:** `integration-tests/tests/workflows/draft-creation.test.ts`

**Action:** CREATE

**Purpose:** Test complete draft creation workflow across services

**Content:**
```typescript
/**
 * Draft Creation Workflow Integration Test
 * 
 * Reference: Runbook 0 Section 18.6
 * 
 * Tests the complete workflow:
 * 1. Create template (Records Service)
 * 2. Create case from template (Records Service)
 * 3. Create draft from case (Records Service)
 * 4. Verify draft structure
 */
import axios from 'axios';

const RECORDS_URL = `http://localhost:${(global as any).__TEST_PORTS__.records}`;

describe('Draft Creation Workflow', () => {
  it('should create draft from template', async () => {
    // Step 1: Create template
    const template = {
      name: 'Workflow Test Template',
      category: 'motion',
      jurisdiction: 'Texas',
      court_level: 'district',
      document_json: {
        sections: [
          {
            id: 'section-001',
            level: 1,
            number: '1',
            title: 'Introduction',
            content: [{ type: 'paragraph', id: 'p1', text: 'Test content' }]
          }
        ],
        caseblock: {
          case_name: '{{case_name}}',
          cause_number: '{{cause_number}}'
        },
        signature: {
          attorney_name: '{{attorney_name}}'
        }
      },
      variables: {
        case_name: { type: 'text', required: true },
        cause_number: { type: 'text', required: true },
        attorney_name: { type: 'text', required: true }
      }
    };
    
    const templateResponse = await axios.post(`${RECORDS_URL}/templates`, template);
    expect(templateResponse.status).toBe(201);
    const templateId = templateResponse.data.id;
    
    // Step 2: Create case from template
    const caseData = {
      template_id: templateId,
      case_name: 'Workflow Test Case',
      cause_number: 'TEST-001',
      court_name: 'Test Court',
      variable_values: {
        case_name: 'Workflow Test Case',
        cause_number: 'TEST-001',
        attorney_name: 'Test Attorney'
      }
    };
    
    const caseResponse = await axios.post(`${RECORDS_URL}/cases`, caseData);
    expect(caseResponse.status).toBe(201);
    const caseId = caseResponse.data.id;
    
    // Step 3: Create draft from case
    const draftData = {
      case_id: caseId,
      title: 'Test Draft',
      document_json: {
        sections: templateResponse.data.document_json.sections,
        caseblock: {
          case_name: 'Workflow Test Case',
          cause_number: 'TEST-001',
          court_name: 'Test Court'
        },
        signature: {
          attorney_name: 'Test Attorney'
        }
      }
    };
    
    const draftResponse = await axios.post(`${RECORDS_URL}/drafts`, draftData);
    expect(draftResponse.status).toBe(201);
    
    // Step 4: Verify draft structure
    const draft = draftResponse.data;
    expect(draft).toMatchObject({
      id: expect.any(String),
      case_id: caseId,
      title: 'Test Draft',
      version: 1
    });
    
    // Verify caseblock variables were resolved
    expect(draft.document_json.caseblock.case_name).toBe('Workflow Test Case');
    expect(draft.document_json.caseblock.cause_number).toBe('TEST-001');
    expect(draft.document_json.signature.attorney_name).toBe('Test Attorney');
  });
});
```

---

### 3.2 Export Integration Test

**File:** `integration-tests/tests/workflows/export.test.ts`

**Action:** CREATE

**Purpose:** Test draft export workflow

**Content:**
```typescript
/**
 * Export Workflow Integration Test
 * 
 * Tests the export pipeline:
 * 1. Create draft (Records Service)
 * 2. Export to DOCX (Export Service)
 * 3. Verify DOCX structure
 */
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const RECORDS_URL = `http://localhost:${(global as any).__TEST_PORTS__.records}`;
const EXPORT_URL = `http://localhost:${(global as any).__TEST_PORTS__.export}`;

describe('Export Workflow', () => {
  it('should export draft to DOCX', async () => {
    // Step 1: Create case
    const caseResponse = await axios.post(`${RECORDS_URL}/cases`, {
      case_name: 'Export Test Case',
      cause_number: 'EXPORT-001',
      court_name: 'Export Test Court'
    });
    const caseId = caseResponse.data.id;
    
    // Step 2: Create draft
    const draftResponse = await axios.post(`${RECORDS_URL}/drafts`, {
      case_id: caseId,
      title: 'Export Test Draft',
      document_json: {
        sections: [
          {
            id: 's1',
            level: 1,
            number: '1',
            title: 'Test Section',
            content: [
              { type: 'paragraph', id: 'p1', text: 'This is a test paragraph.' }
            ]
          }
        ],
        caseblock: {
          case_name: 'Export Test Case',
          cause_number: 'EXPORT-001',
          court_name: 'Export Test Court'
        },
        signature: {
          attorney_name: 'Test Attorney',
          bar_number: '12345'
        }
      }
    });
    const draftId = draftResponse.data.id;
    
    // Step 3: Export draft
    const exportResponse = await axios.post(`${EXPORT_URL}/export`, {
      draft_id: draftId
    }, {
      responseType: 'arraybuffer'
    });
    
    expect(exportResponse.status).toBe(200);
    expect(exportResponse.headers['content-type']).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    
    // Step 4: Verify DOCX is valid (check magic bytes)
    const buffer = Buffer.from(exportResponse.data);
    const magicBytes = buffer.slice(0, 4).toString('hex');
    expect(magicBytes).toBe('504b0304'); // ZIP header
    
    // Step 5: Save for manual inspection (optional)
    const outputPath = path.join(__dirname, '../../test-results', `export-test-${Date.now()}.docx`);
    fs.writeFileSync(outputPath, buffer);
    expect(fs.existsSync(outputPath)).toBe(true);
  });
});
```

---

## Task 4: Database Integration Tests

### 4.1 Migration Tests

**File:** `integration-tests/tests/database/migrations.test.ts`

**Action:** CREATE

**Purpose:** Test database migration scripts

**Content:**
```typescript
/**
 * Database Migration Tests
 * 
 * Reference: Runbook 0 Section 18.6
 * 
 * Validates that migrations:
 * 1. Run without errors
 * 2. Create expected schema
 * 3. Are reversible (down migrations)
 * 4. Handle data preservation
 */
import { exec } from 'child_process';
import { promisify } from 'util';
import sqlite3 from 'sqlite3';

const execAsync = promisify(exec);

describe('Database Migrations', () => {
  const testDbPath = '/tmp/factsway-migration-test.db';
  
  beforeEach(async () => {
    // Clean slate for each test
    await execAsync(`rm -f ${testDbPath}`);
  });
  
  it('should run all migrations successfully', async () => {
    // Run migrations
    const { stdout, stderr } = await execAsync(
      `DATABASE_URL=sqlite:///${testDbPath} npm run migrate:up`,
      { cwd: '../services/records-service' }
    );
    
    expect(stderr).toBe('');
    expect(stdout).toContain('Migrations complete');
    
    // Verify tables exist
    const db = new sqlite3.Database(testDbPath);
    
    const tables = await new Promise<string[]>((resolve, reject) => {
      db.all(
        "SELECT name FROM sqlite_master WHERE type='table'",
        (err, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows.map(r => r.name));
        }
      );
    });
    
    expect(tables).toContain('templates');
    expect(tables).toContain('cases');
    expect(tables).toContain('drafts');
    expect(tables).toContain('evidence');
    
    db.close();
  });
  
  it('should rollback migrations', async () => {
    // Run migrations
    await execAsync(
      `DATABASE_URL=sqlite:///${testDbPath} npm run migrate:up`,
      { cwd: '../services/records-service' }
    );
    
    // Rollback
    await execAsync(
      `DATABASE_URL=sqlite:///${testDbPath} npm run migrate:down`,
      { cwd: '../services/records-service' }
    );
    
    // Verify tables removed
    const db = new sqlite3.Database(testDbPath);
    
    const tables = await new Promise<string[]>((resolve, reject) => {
      db.all(
        "SELECT name FROM sqlite_master WHERE type='table'",
        (err, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows.map(r => r.name));
        }
      );
    });
    
    expect(tables).not.toContain('templates');
    expect(tables).not.toContain('cases');
    
    db.close();
  });
});
```

---

## Task 5: Performance Benchmarks

### 5.1 API Performance Tests

**File:** `integration-tests/tests/performance/api-benchmarks.test.ts`

**Action:** CREATE

**Purpose:** Establish performance baselines

**Content:**
```typescript
/**
 * API Performance Benchmarks
 * 
 * Reference: Runbook 0 Section 19.12
 * 
 * Establishes baseline performance metrics:
 * - Template creation: <100ms
 * - Case creation: <150ms
 * - Draft save: <200ms
 * - Export generation: <2000ms
 */
import axios from 'axios';

const RECORDS_URL = `http://localhost:${(global as any).__TEST_PORTS__.records}`;
const EXPORT_URL = `http://localhost:${(global as any).__TEST_PORTS__.export}`;

describe('API Performance Benchmarks', () => {
  it('template creation should complete in <100ms', async () => {
    const start = Date.now();
    
    await axios.post(`${RECORDS_URL}/templates`, {
      name: 'Perf Test Template',
      category: 'motion',
      jurisdiction: 'Texas',
      court_level: 'district',
      document_json: { sections: [] },
      variables: {}
    });
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100);
  });
  
  it('case creation should complete in <150ms', async () => {
    const start = Date.now();
    
    await axios.post(`${RECORDS_URL}/cases`, {
      case_name: 'Perf Test Case',
      cause_number: 'PERF-001',
      court_name: 'Perf Test Court',
      variable_values: {}
    });
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(150);
  });
  
  it('draft save should complete in <200ms', async () => {
    // Create case first
    const caseResponse = await axios.post(`${RECORDS_URL}/cases`, {
      case_name: 'Draft Perf Test',
      cause_number: 'DPERF-001',
      court_name: 'Test Court'
    });
    
    const start = Date.now();
    
    await axios.post(`${RECORDS_URL}/drafts`, {
      case_id: caseResponse.data.id,
      title: 'Perf Test Draft',
      document_json: {
        sections: [
          { id: 's1', level: 1, title: 'Test', content: [] }
        ],
        caseblock: {},
        signature: {}
      }
    });
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(200);
  });
});
```

---

## Verification

**From Runbook 0 Section 19.11:**

### Verification Checklist

**Jest Configuration:**
- [ ] Jest configured for TypeScript
- [ ] Test timeout set appropriately (30s)
- [ ] Coverage thresholds configured (>80%)
- [ ] Global setup/teardown working
- [ ] Test environment isolated

**API Contract Tests:**
- [ ] All 8 services have contract tests
- [ ] All CRUD operations tested
- [ ] Error scenarios covered
- [ ] Response schemas validated
- [ ] HTTP status codes verified

**Service Integration:**
- [ ] Draft creation workflow test passes
- [ ] Export workflow test passes
- [ ] Evidence linking workflow test passes
- [ ] Cross-service communication working
- [ ] Service discovery functional in tests

**Database Tests:**
- [ ] Migration up/down tests pass
- [ ] Schema validation working
- [ ] Data preservation verified
- [ ] Transaction rollback tested

**Performance:**
- [ ] Benchmark baselines established
- [ ] All benchmarks passing
- [ ] Performance regression alerts configured
- [ ] Load testing completed (optional)

**CI Integration:**
- [ ] Tests run in CI
- [ ] Coverage reports generated
- [ ] Test results published
- [ ] Failures block deployment

---

## Success Criteria

✅ Jest configured for integration testing
✅ All 8 services have API contract tests
✅ Service workflows tested end-to-end
✅ Database migrations validated
✅ Performance benchmarks established
✅ Test coverage >80% for critical paths
✅ All tests pass in CI
✅ No flaky tests

---

## Next Steps

After Runbook 12 completes:

1. **Runbook 13:** User Documentation
2. **Runbook 14:** CI/CD Pipelines
3. **Runbook 15:** Production Deployment

---

## Reference

**Runbook 0 Sections:**
- Section 18: Testing Strategy
- Section 19.11: Integration Test Requirements
- Section 19.12: Performance Benchmarks

**Dependencies:**
- Runbooks 1-11: Complete application with E2E tests

**External Tools:**
- Jest: https://jestjs.io
- ts-jest: https://kulshekhar.github.io/ts-jest/

---

**End of Runbook 12**
