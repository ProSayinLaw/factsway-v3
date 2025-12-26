# Runbook 3: Records Service - Template, Case, Draft CRUD API

**Phase:** Foundation (Critical Path)  
**Estimated Time:** 8-10 hours  
**Prerequisites:** Runbooks 1-2 complete (shared-types + database)  
**Depends On:** Runbook 0 Sections 1.7, 15.3, 19.3  
**Enables:** Runbooks 4-15 (first microservice pattern)

---

## Objective

Create the **Records Service** - the first microservice providing REST API for Templates, Cases, and Drafts CRUD operations.

**Success Criteria:**
- ✅ Service runs on port 3001
- ✅ All CRUD endpoints functional
- ✅ Uses repositories from Runbook 2
- ✅ Returns LegalDocument format
- ✅ Health check responds
- ✅ Tests pass for all endpoints
- ✅ Service lifecycle (startup/shutdown) works

---

## Context from Runbook 0

**Referenced Sections:**
- **Section 1.7:** Deployment Architecture
  - Records service: TypeScript/Node, port 3001
  - Template, Case, Draft CRUD operations
- **Section 15.3:** Technology Stack - Records Service
  - TypeScript + Node.js
  - Express.js for REST API
  - Repository pattern from Runbook 2
- **Section 19.3:** Runbook 3 Verification Criteria

**Key Principle from Runbook 0:**
> "The Records Service is the first microservice. It establishes patterns for service structure, API design, error handling, and testing that all subsequent services will follow."

---

## Current State

**What exists:**
- ✅ `@factsway/shared-types` with LegalDocument types (Runbook 1)
- ✅ `@factsway/database` with repositories (Runbook 2)
- ❌ No services directory
- ❌ No REST API
- ❌ No service infrastructure

**What this creates:**
- ✅ `services/records-service/` with complete structure
- ✅ Express.js REST API on port 3001
- ✅ Template CRUD endpoints
- ✅ Case CRUD endpoints  
- ✅ Draft CRUD endpoints
- ✅ Service lifecycle management
- ✅ Health check and status endpoints
- ✅ Error handling middleware
- ✅ Request validation
- ✅ Test suite

---

## Task 1: Create Service Structure

### 1.1 Create Directory Structure

**Location:** Root of repository

**Action:** CREATE new directories

```bash
# From repository root
mkdir -p services/records-service/src/{api,services,middleware,types,utils}
mkdir -p services/records-service/tests/{unit,integration,fixtures}
mkdir -p services/records-service/config
```

**Verification:**
```bash
tree services/records-service -L 2

# Expected output:
# services/records-service/
# ├── src/
# │   ├── api/
# │   ├── services/
# │   ├── middleware/
# │   ├── types/
# │   └── utils/
# ├── tests/
# │   ├── unit/
# │   ├── integration/
# │   └── fixtures/
# └── config/
```

---

### 1.2 Create package.json

**File:** `services/records-service/package.json`

**Action:** CREATE

**Content:**
```json
{
  "name": "@factsway/records-service",
  "version": "1.0.0",
  "description": "Records service for Templates, Cases, and Drafts",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "dependencies": {
    "@factsway/shared-types": "workspace:*",
    "@factsway/database": "workspace:*",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "express-validator": "^7.0.1",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.11",
    "@types/morgan": "^1.9.9",
    "@types/node": "^20.10.6",
    "@types/uuid": "^9.0.7",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "@types/supertest": "^6.0.2",
    "ts-jest": "^29.1.1",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  },
  "keywords": [
    "factsway",
    "records",
    "microservice",
    "rest-api"
  ]
}
```

---

### 1.3 Create tsconfig.json

**File:** `services/records-service/tsconfig.json`

**Action:** CREATE

**Content:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node"
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "tests"
  ]
}
```

---

## Task 2: Service Infrastructure

### 2.1 Main Server

**File:** `services/records-service/src/index.ts`

**Action:** CREATE

**Content:**
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { getDatabaseConfig } from './config/database.config';
import { DatabaseFactory } from '@factsway/database/config/database.factory';
import { createApiRouter } from './api';
import { errorHandler } from './middleware/error-handler';
import { notFoundHandler } from './middleware/not-found-handler';

const PORT = process.env.PORT || 3001;
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Database connection
const dbConfig = getDatabaseConfig();
const db = DatabaseFactory.create(dbConfig);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'records-service',
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api', createApiRouter(db));

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`✓ Records Service running on port ${PORT}`);
  console.log(`✓ Database: ${dbConfig.type}`);
  console.log(`✓ Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    if (db && typeof db.close === 'function') {
      db.close();
    } else if (db && typeof db.end === 'function') {
      db.end();
    }
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    if (db && typeof db.close === 'function') {
      db.close();
    } else if (db && typeof db.end === 'function') {
      db.end();
    }
    process.exit(0);
  });
});

export { app, server };
```

---

### 2.2 Database Configuration

**File:** `services/records-service/src/config/database.config.ts`

**Action:** CREATE

**Content:**
```typescript
import { DatabaseConfig } from '@factsway/database/config/database.factory';

export function getDatabaseConfig(): DatabaseConfig {
  const dbType = (process.env.DB_TYPE || 'sqlite') as 'sqlite' | 'postgresql';

  if (dbType === 'sqlite') {
    return {
      type: 'sqlite',
      sqlite: {
        path: process.env.SQLITE_PATH || './factsway.db',
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

### 2.3 Error Handler Middleware

**File:** `services/records-service/src/middleware/error-handler.ts`

**Action:** CREATE

**Content:**
```typescript
import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  errors?: any[];
}

export function errorHandler(
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error('Error:', {
    statusCode,
    message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      errors: err.errors,
      path: req.path,
      timestamp: new Date().toISOString(),
    },
  });
}

export class ValidationError extends Error implements ApiError {
  statusCode = 400;
  errors: any[];

  constructor(message: string, errors: any[] = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class NotFoundError extends Error implements ApiError {
  statusCode = 404;

  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}
```

---

### 2.4 Not Found Handler

**File:** `services/records-service/src/middleware/not-found-handler.ts`

**Action:** CREATE

**Content:**
```typescript
import { Request, Response } from 'express';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      message: 'Endpoint not found',
      statusCode: 404,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
    },
  });
}
```

---

## Task 3: API Routes

### 3.1 Main API Router

**File:** `services/records-service/src/api/index.ts`

**Action:** CREATE

**Content:**
```typescript
import { Router } from 'express';
import { createTemplateRoutes } from './templates.routes';
import { createCaseRoutes } from './cases.routes';
import { createDraftRoutes } from './drafts.routes';

export function createApiRouter(db: any): Router {
  const router = Router();

  // API info
  router.get('/', (req, res) => {
    res.json({
      service: 'records-service',
      version: '1.0.0',
      endpoints: {
        templates: '/api/templates',
        cases: '/api/cases',
        drafts: '/api/drafts',
      },
    });
  });

  // Resource routes
  router.use('/templates', createTemplateRoutes(db));
  router.use('/cases', createCaseRoutes(db));
  router.use('/drafts', createDraftRoutes(db));

  return router;
}
```

---

### 3.2 Template Routes

**File:** `services/records-service/src/api/templates.routes.ts`

**Action:** CREATE

**Content:**
```typescript
import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { TemplateRepository } from '@factsway/database/repositories/template.repository';
import { ValidationError, NotFoundError } from '../middleware/error-handler';

export function createTemplateRoutes(db: any): Router {
  const router = Router();
  const repo = new TemplateRepository(db);

  // GET /api/templates - List all templates
  router.get(
    '/',
    [
      query('category').optional().isIn(['motion', 'brief', 'complaint', 'answer', 'notice', 'order', 'memo', 'letter', 'other']),
      query('is_public').optional().isBoolean(),
      query('limit').optional().isInt({ min: 1, max: 100 }),
      query('offset').optional().isInt({ min: 0 }),
    ],
    async (req, res, next) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          throw new ValidationError('Validation failed', errors.array());
        }

        const { category, is_public, limit, offset } = req.query;

        const options: any = {};
        if (limit) options.limit = parseInt(limit as string);
        if (offset) options.offset = parseInt(offset as string);

        if (category || is_public !== undefined) {
          options.where = {};
          if (category) options.where.category = category;
          if (is_public !== undefined) options.where.is_public = is_public === 'true';
        }

        const templates = await repo.findAll(options);
        
        res.json({
          data: templates,
          count: templates.length,
        });
      } catch (error) {
        next(error);
      }
    }
  );

  // GET /api/templates/:id - Get template by ID
  router.get(
    '/:id',
    [
      param('id').isUUID(),
    ],
    async (req, res, next) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          throw new ValidationError('Validation failed', errors.array());
        }

        const template = await repo.findById(req.params.id);
        
        if (!template) {
          throw new NotFoundError('Template', req.params.id);
        }

        res.json({ data: template });
      } catch (error) {
        next(error);
      }
    }
  );

  // POST /api/templates - Create new template
  router.post(
    '/',
    [
      body('name').isString().notEmpty(),
      body('description').optional().isString(),
      body('category').isIn(['motion', 'brief', 'complaint', 'answer', 'notice', 'order', 'memo', 'letter', 'other']),
      body('document_json').isObject(),
      body('document_json.meta').isObject(),
      body('document_json.body').isObject(),
      body('document_json.citations').isArray(),
      body('document_json.embedded_objects').isArray(),
      body('tags').optional().isArray(),
      body('is_public').optional().isBoolean(),
      body('author').optional().isString(),
    ],
    async (req, res, next) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          throw new ValidationError('Validation failed', errors.array());
        }

        const template = await repo.create(req.body);

        res.status(201).json({
          data: template,
          message: 'Template created successfully',
        });
      } catch (error) {
        next(error);
      }
    }
  );

  // PUT /api/templates/:id - Update template
  router.put(
    '/:id',
    [
      param('id').isUUID(),
      body('name').optional().isString().notEmpty(),
      body('description').optional().isString(),
      body('category').optional().isIn(['motion', 'brief', 'complaint', 'answer', 'notice', 'order', 'memo', 'letter', 'other']),
      body('document_json').optional().isObject(),
      body('tags').optional().isArray(),
      body('is_public').optional().isBoolean(),
      body('author').optional().isString(),
    ],
    async (req, res, next) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          throw new ValidationError('Validation failed', errors.array());
        }

        const template = await repo.update(req.params.id, req.body);

        res.json({
          data: template,
          message: 'Template updated successfully',
        });
      } catch (error) {
        next(error);
      }
    }
  );

  // DELETE /api/templates/:id - Delete template
  router.delete(
    '/:id',
    [
      param('id').isUUID(),
    ],
    async (req, res, next) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          throw new ValidationError('Validation failed', errors.array());
        }

        const deleted = await repo.delete(req.params.id);

        if (!deleted) {
          throw new NotFoundError('Template', req.params.id);
        }

        res.json({
          message: 'Template deleted successfully',
        });
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
}
```

---

### 3.3 Case Routes

**File:** `services/records-service/src/api/cases.routes.ts`

**Action:** CREATE similar to templates.routes.ts

**Key differences:**
- Uses CaseRepository
- Validates case-specific fields (case_number, court, parties)
- Includes status filtering

---

### 3.4 Draft Routes

**File:** `services/records-service/src/api/drafts.routes.ts`

**Action:** CREATE similar to templates.routes.ts

**CRITICAL - Dual Storage:**
```typescript
// POST /api/drafts - Create draft
router.post(
  '/',
  [
    body('case_id').isUUID(),
    body('template_id').optional().isUUID(),
    body('title').isString().notEmpty(),
    body('document_type').isIn(['motion', 'brief', 'complaint', 'answer', 'order', 'memo', 'letter', 'notice', 'other']),
    body('document_json').isObject(),  // CANONICAL (required)
    body('content_json').optional().isObject(),  // AUXILIARY (optional)
    body('status').optional().isIn(['draft', 'review', 'final', 'filed', 'archived']),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ValidationError('Validation failed', errors.array());
      }

      const draft = await repo.create(req.body);

      res.status(201).json({
        data: draft,
        message: 'Draft created successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);
```

**Note:** content_json is optional and auxiliary (Section 2.5)

---

## Task 4: Tests

### 4.1 Test Setup

**File:** `services/records-service/tests/setup.ts`

**Action:** CREATE

**Content:**
```typescript
import { setupTestDatabase, teardownTestDatabase } from '@factsway/database/tests/setup';

let testDb: any;

export async function setupTests(): Promise<any> {
  testDb = await setupTestDatabase();
  return testDb;
}

export function teardownTests(): void {
  if (testDb) {
    teardownTestDatabase(testDb);
  }
}

export function getTestDb(): any {
  return testDb;
}
```

---

### 4.2 Template Routes Tests

**File:** `services/records-service/tests/integration/templates.test.ts`

**Action:** CREATE

**Content:**
```typescript
import request from 'supertest';
import { app } from '../../src/index';
import { setupTests, teardownTests } from '../setup';
import { LegalDocument } from '@factsway/shared-types';

describe('Template Routes', () => {
  beforeAll(async () => {
    await setupTests();
  });

  afterAll(() => {
    teardownTests();
  });

  const sampleDocument: LegalDocument = {
    meta: {
      id: 'test-doc-1',
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

  describe('POST /api/templates', () => {
    it('should create a new template', async () => {
      const response = await request(app)
        .post('/api/templates')
        .send({
          name: 'Test Template',
          category: 'motion',
          document_json: sampleDocument,
          is_public: true,
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Test Template');
      expect(response.body.data.category).toBe('motion');
      expect(response.body.data.is_public).toBe(true);
      expect(response.body.data.document_json).toEqual(sampleDocument);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/templates')
        .send({
          category: 'motion',
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.statusCode).toBe(400);
    });
  });

  describe('GET /api/templates', () => {
    it('should list all templates', async () => {
      const response = await request(app)
        .get('/api/templates')
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.count).toBeGreaterThan(0);
    });

    it('should filter by category', async () => {
      const response = await request(app)
        .get('/api/templates?category=motion')
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((template: any) => {
        expect(template.category).toBe('motion');
      });
    });

    it('should limit results', async () => {
      const response = await request(app)
        .get('/api/templates?limit=1')
        .expect(200);

      expect(response.body.data.length).toBe(1);
    });
  });

  describe('GET /api/templates/:id', () => {
    it('should get template by ID', async () => {
      // First create a template
      const createResponse = await request(app)
        .post('/api/templates')
        .send({
          name: 'Find Test',
          category: 'brief',
          document_json: sampleDocument,
        });

      const id = createResponse.body.data.id;

      // Then retrieve it
      const response = await request(app)
        .get(`/api/templates/${id}`)
        .expect(200);

      expect(response.body.data.id).toBe(id);
      expect(response.body.data.name).toBe('Find Test');
    });

    it('should return 404 for non-existent ID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app)
        .get(`/api/templates/${fakeId}`)
        .expect(404);
    });
  });

  describe('PUT /api/templates/:id', () => {
    it('should update template', async () => {
      // Create template
      const createResponse = await request(app)
        .post('/api/templates')
        .send({
          name: 'Update Test',
          category: 'order',
          document_json: sampleDocument,
        });

      const id = createResponse.body.data.id;

      // Update it
      const response = await request(app)
        .put(`/api/templates/${id}`)
        .send({
          name: 'Updated Name',
        })
        .expect(200);

      expect(response.body.data.name).toBe('Updated Name');
      expect(response.body.data.id).toBe(id);
    });
  });

  describe('DELETE /api/templates/:id', () => {
    it('should delete template', async () => {
      // Create template
      const createResponse = await request(app)
        .post('/api/templates')
        .send({
          name: 'Delete Test',
          category: 'memo',
          document_json: sampleDocument,
        });

      const id = createResponse.body.data.id;

      // Delete it
      await request(app)
        .delete(`/api/templates/${id}`)
        .expect(200);

      // Verify it's gone
      await request(app)
        .get(`/api/templates/${id}`)
        .expect(404);
    });
  });
});
```

---

## Task 5: Service Configuration

### 5.1 Environment Variables

**File:** `services/records-service/.env.example`

**Action:** CREATE

**Content:**
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_TYPE=sqlite
SQLITE_PATH=./factsway.db

# OR for PostgreSQL
# DB_TYPE=postgresql
# DATABASE_URL=postgresql://localhost/factsway

# Logging
LOG_LEVEL=info
```

---

### 5.2 Jest Configuration

**File:** `services/records-service/jest.config.js`

**Action:** CREATE

**Content:**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};
```

---

## Task 6: Verification (from Runbook 0 Section 19.3)

### 6.1 Service Structure
- [ ] Service located in `services/records-service/`
- [ ] Package.json with correct dependencies
- [ ] TypeScript configured
- [ ] Imports `@factsway/shared-types` from Runbook 1

### 6.2 API Endpoints
- [ ] POST /templates - Create template
- [ ] GET /templates - List templates
- [ ] GET /templates/:id - Get template
- [ ] PUT /templates/:id - Update template
- [ ] DELETE /templates/:id - Delete template
- [ ] POST /cases - Create case
- [ ] GET /cases - List cases
- [ ] GET /cases/:id - Get case
- [ ] PUT /cases/:id - Update case
- [ ] DELETE /cases/:id - Delete case
- [ ] POST /drafts - Create draft
- [ ] GET /drafts - List drafts
- [ ] GET /drafts/:id - Get draft
- [ ] PUT /drafts/:id - Update draft
- [ ] DELETE /drafts/:id - Delete draft

### 6.3 Request/Response Format
- [ ] All endpoints accept/return JSON
- [ ] Draft endpoints use LegalDocument format
- [ ] Error responses follow standard format
- [ ] Validation errors return 400 with details

### 6.4 Database Integration
- [ ] Uses repository pattern from Runbook 2
- [ ] All CRUD operations persist to database
- [ ] Foreign key relationships maintained
- [ ] Transactions used where appropriate

### 6.5 Service Lifecycle
- [ ] Service starts on port 3001
- [ ] Health check endpoint (/health)
- [ ] Graceful shutdown implemented
- [ ] Logs startup and shutdown events

### 6.6 Tests
- [ ] Unit tests for all endpoints
- [ ] Integration tests with test database
- [ ] All tests pass
- [ ] Test coverage > 80%

### 6.7 Cross-Reference
- [ ] Implements Section 1.7 service architecture
- [ ] Uses Section 4 LegalDocument format
- [ ] Uses Section 2 data models

---

## Success Criteria

✅ Service runs and responds to HTTP requests  
✅ All CRUD operations work  
✅ Integration with database successful  
✅ Health check returns 200  
✅ Graceful shutdown works  
✅ All tests pass  
✅ Ready for Runbook 4 (Ingestion Service)  

---

## Next Steps

After Runbook 3 is complete:

1. **Start service:** `npm run dev`
2. **Test health check:** `curl http://localhost:3001/health`
3. **Run tests:** `npm test`
4. **Proceed to Runbook 4:** Ingestion Service (Python/FastAPI)

---

## Reference

- **Runbook 0 Section 1.7:** Service Architecture
- **Runbook 0 Section 15.3:** Records Service Technology
- **Runbook 0 Section 19.3:** Verification Criteria
- **Runbook 1:** TypeScript types
- **Runbook 2:** Database repositories

---

**End of Runbook 3**
