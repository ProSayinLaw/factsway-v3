---

## Metadata Summary

### Purpose
Create the Records Service microservice (port 3001) providing REST API for Template, Case, and Draft CRUD operations, establishing patterns for all subsequent microservices.

### Produces (Artifacts)

**Service:**
- Service: `records-service` (port 3001)
  - Language: TypeScript
  - Framework: Express.js 4.18+
  - Runtime: Node.js 18+
  - Deployment: Runs as child process in Desktop, pod in Kubernetes

**Files:**
- File: `services/records-service/src/index.ts` (~250 lines)
  - Purpose: Main service entry point, Express setup, route registration
- File: `services/records-service/src/routes/templates.routes.ts` (~150 lines)
  - Purpose: Template CRUD endpoints (5 endpoints)
- File: `services/records-service/src/routes/cases.routes.ts` (~150 lines)
  - Purpose: Case CRUD endpoints (5 endpoints)
- File: `services/records-service/src/routes/drafts.routes.ts` (~200 lines)
  - Purpose: Draft CRUD endpoints (8 endpoints including versioning)
- File: `services/records-service/src/middleware/error-handler.ts` (~80 lines)
  - Purpose: Centralized error handling middleware
- File: `services/records-service/src/middleware/request-logger.ts` (~50 lines)
  - Purpose: HTTP request logging
- File: `services/records-service/src/middleware/validation.ts` (~100 lines)
  - Purpose: Request body validation using Zod
- File: `services/records-service/package.json` (dependencies)
- File: `services/records-service/tsconfig.json` (TypeScript config)
- File: `services/records-service/tests/integration/api.test.ts` (~400 lines)
  - Purpose: API integration tests for all endpoints

**Total:** ~1,380 lines

**REST API Endpoints Created:** 18 endpoints total
- Templates: GET /api/templates, GET /api/templates/:id, POST /api/templates, PUT /api/templates/:id, DELETE /api/templates/:id
- Cases: GET /api/cases, GET /api/cases/:id, POST /api/cases, PUT /api/cases/:id, DELETE /api/cases/:id
- Drafts: GET /api/drafts, GET /api/drafts/:id, GET /api/drafts/case/:caseId, POST /api/drafts, PUT /api/drafts/:id, DELETE /api/drafts/:id, GET /api/drafts/:id/versions, POST /api/drafts/:id/restore/:version
- Health: GET /health

### Consumes (Prerequisites)

**Required Runbooks:**
- Runbook 1: `@factsway/shared-types` package
  - Imports: `LegalDocument`, `Template`, `Case`, `Draft`, `UUID`
- Runbook 2: `@factsway/database` package
  - Imports: `TemplateRepository`, `CaseRepository`, `DraftRepository`
  - Uses: Database connection configuration

**Required Files:**
- None (creates service from scratch)

**Required Environment Variables:**
- `DEPLOYMENT_ENV`: "desktop" | "cloud" | "enterprise"
- `PORT`: Service port (default 3001)
- `SERVICE_NAME`: "records" (for logging)
- `DATABASE_URL`: SQLite/PostgreSQL connection string
- `LOG_LEVEL`: "debug" | "info" | "warn" | "error"
- Service URLs (from Runbook 9):
  - `RECORDS_SERVICE_URL` (self-reference)
  - `INGESTION_SERVICE_URL`
  - `EXPORT_SERVICE_URL`
  - (and 5 others, though Records Service doesn't call them)

**Required Dependencies:**
- `express@^4.18.0` (web framework)
- `cors@^2.8.5` (CORS handling)
- `helmet@^7.1.0` (security headers)
- `morgan@^1.10.0` (HTTP logging)
- `zod@^3.22.0` (runtime validation)
- `@factsway/shared-types@^1.0.0` (Runbook 1)
- `@factsway/database@^1.0.0` (Runbook 2)

### Interfaces Touched

#### REST Endpoints (Server - Records Service Exposes These)

**Health Check:**
- From: ANY → To: Records Service → **GET /health**
  - Request: None
  - Response: `{ status: "healthy", service: "records", timestamp: string }`
  - Purpose: Service health monitoring
  - Status Codes: 200 (healthy)

**Template Endpoints:**

- From: Renderer/Desktop Orchestrator → To: Records Service → **GET /api/templates**
  - Request: Query params (optional): `?jurisdiction=Texas&category=motion`
  - Response: `Template[]` (array of templates)
  - Purpose: List all templates, optionally filtered
  - Status Codes: 200 (success)

- From: Renderer → To: Records Service → **GET /api/templates/:id**
  - Request: Path param: `id` (UUID)
  - Response: `Template` (single template)
  - Purpose: Get template by ID for viewing/editing
  - Status Codes: 200 (found), 404 (not found)

- From: Renderer → To: Records Service → **POST /api/templates**
  - Request Body: `{ name, category, jurisdiction, court_level, description, document_json, variables }`
  - Response: `Template` (created template with generated ID)
  - Purpose: Create new template
  - Status Codes: 201 (created), 400 (validation error)

- From: Renderer → To: Records Service → **PUT /api/templates/:id**
  - Request: Path param: `id`, Body: Partial<Template>
  - Response: `Template` (updated template)
  - Purpose: Update existing template
  - Status Codes: 200 (updated), 404 (not found), 400 (validation error)

- From: Renderer → To: Records Service → **DELETE /api/templates/:id**
  - Request: Path param: `id`
  - Response: `{ success: true }`
  - Purpose: Delete template (cascade deletes cases/drafts)
  - Status Codes: 204 (deleted), 404 (not found)

**Case Endpoints:**

- From: Renderer → To: Records Service → **GET /api/cases**
  - Request: Query params (optional): `?template_id=xxx&status=active`
  - Response: `Case[]` (array of cases)
  - Purpose: List all cases, optionally filtered
  - Status Codes: 200 (success)

- From: Renderer → To: Records Service → **GET /api/cases/:id**
  - Request: Path param: `id`
  - Response: `Case` (single case with populated template)
  - Purpose: Get case by ID for detail view
  - Status Codes: 200 (found), 404 (not found)

- From: Renderer → To: Records Service → **POST /api/cases**
  - Request Body: `{ template_id, case_name, cause_number, court_name, filing_date, variable_values }`
  - Response: `Case` (created case with generated ID)
  - Purpose: Create new case from template
  - Status Codes: 201 (created), 400 (validation error), 404 (template not found)

- From: Renderer → To: Records Service → **PUT /api/cases/:id**
  - Request: Path param: `id`, Body: Partial<Case>
  - Response: `Case` (updated case)
  - Purpose: Update case metadata or status
  - Status Codes: 200 (updated), 404 (not found), 400 (validation error)

- From: Renderer → To: Records Service → **DELETE /api/cases/:id**
  - Request: Path param: `id`
  - Response: `{ success: true }`
  - Purpose: Delete case (cascade deletes drafts)
  - Status Codes: 204 (deleted), 404 (not found)

**Draft Endpoints:**

- From: Renderer → To: Records Service → **GET /api/drafts**
  - Request: Query params (optional): `?case_id=xxx`
  - Response: `Draft[]` (array of drafts)
  - Purpose: List all drafts, optionally filtered by case
  - Status Codes: 200 (success)

- From: Renderer → To: Records Service → **GET /api/drafts/:id**
  - Request: Path param: `id`
  - Response: `Draft` (single draft with document_json)
  - Purpose: Load draft for editing
  - Status Codes: 200 (found), 404 (not found)

- From: Renderer → To: Records Service → **GET /api/drafts/case/:caseId**
  - Request: Path param: `caseId`
  - Response: `Draft[]` (all drafts for this case)
  - Purpose: List case's drafts in sidebar
  - Status Codes: 200 (success)

- From: Renderer → To: Records Service → **POST /api/drafts**
  - Request Body: `{ case_id, title, document_json, content_json? }`
  - Response: `Draft` (created draft with generated ID, version=1)
  - Purpose: Create new draft from template or blank
  - Status Codes: 201 (created), 400 (validation error), 404 (case not found)

- From: Renderer → To: Records Service → **PUT /api/drafts/:id**
  - Request: Path param: `id`, Body: `{ document_json, content_json? }`
  - Response: `Draft` (updated draft, version incremented)
  - Purpose: Save draft changes (auto-save or manual save)
  - Status Codes: 200 (updated), 404 (not found), 409 (version conflict)

- From: Renderer → To: Records Service → **DELETE /api/drafts/:id**
  - Request: Path param: `id`
  - Response: `{ success: true }`
  - Purpose: Delete draft permanently
  - Status Codes: 204 (deleted), 404 (not found)

- From: Renderer → To: Records Service → **GET /api/drafts/:id/versions**
  - Request: Path param: `id`
  - Response: `DraftVersion[]` (version history)
  - Purpose: Show version history for rollback
  - Status Codes: 200 (success), 404 (draft not found)

- From: Renderer → To: Records Service → **POST /api/drafts/:id/restore/:version**
  - Request: Path params: `id`, `version` (number)
  - Response: `Draft` (restored draft, new version created)
  - Purpose: Restore previous version
  - Status Codes: 200 (restored), 404 (not found), 400 (invalid version)

#### REST Endpoints (Client - Records Service Calls These)

- **N/A** - Records Service does not call external services
  - Note: Future versions may call Ingestion/Export services, but not in initial implementation

#### IPC Channels (Client - Records Service Emits)

- From: Records Service → To: Desktop Orchestrator (Main Process) → **Event: service:ready**
  - Payload: `{ service: "records", port: 3001, timestamp: string }`
  - Purpose: Signal that service is ready to accept requests
  - Timing: Emitted after Express server starts listening

- From: Records Service → To: Desktop Orchestrator → **Event: service:error**
  - Payload: `{ service: "records", error: string, timestamp: string }`
  - Purpose: Signal critical error (e.g., database connection failure)
  - Timing: Emitted on uncaught exceptions or startup failures

- From: Records Service → To: Desktop Orchestrator → **Event: service:shutdown**
  - Payload: `{ service: "records", reason: string, timestamp: string }`
  - Purpose: Graceful shutdown notification
  - Timing: Emitted on SIGTERM/SIGINT before process exits

#### Filesystem

**Creates:**
- Path: `services/records-service/` (new service directory)
- Path: `services/records-service/logs/` (optional, if file logging enabled)

**Reads:**
- Database: SQLite file at `$DATABASE_URL` or PostgreSQL connection
- Environment: Reads all environment variables listed in "Consumes"

**Modifies:**
- Database: Performs CRUD operations on templates, cases, drafts tables

#### Process Lifecycle

**Spawned By:**
- Desktop Orchestrator (Runbook 7) spawns this as child process
  - Command: `node dist/index.js`
  - Working Directory: `services/records-service/`
  - Environment: Variables injected by orchestrator

**Manages:**
- Express HTTP server (listens on port 3001)
- Database connection pool (better-sqlite3 or pg.Pool)

**Lifecycle:**
1. **Startup:**
   - Load environment variables
   - Initialize database connection
   - Start Express server
   - Emit `service:ready` event
   - Log: "✓ Records Service running on port 3001"

2. **Runtime:**
   - Handle HTTP requests
   - Execute database queries via repositories
   - Log errors to stdout/stderr
   - Health check responds to /health

3. **Shutdown:**
   - Receive SIGTERM/SIGINT signal
   - Emit `service:shutdown` event
   - Close database connections
   - Stop HTTP server (graceful shutdown)
   - Exit with code 0

### Invariants

**Service Lifecycle Invariants:**

- INVARIANT: Service runs on exactly one port
  - Property: `PORT` environment variable or default 3001
  - Enforced by: Express server binds to single port
  - Purpose: No port conflicts, predictable service discovery
  - Violation: Port already in use error (EADDRINUSE)
  - Recovery: Orchestrator retries with different port or fails startup

- INVARIANT: Service has exactly one database connection pool
  - Property: Single connection pool instance shared across all requests
  - Enforced by: Singleton pattern in database configuration
  - Purpose: Resource management, connection reuse
  - Violation: Connection pool exhaustion, memory leak
  - Detection: High memory usage, slow queries
  - Recovery: Restart service to reset pool

**API Contract Invariants:**

- INVARIANT: All responses include proper Content-Type header
  - Property: `Content-Type: application/json` for all API endpoints
  - Enforced by: Express `res.json()` method
  - Purpose: Client can parse responses correctly
  - Violation: Client parse errors
  - Recovery: None (framework handles automatically)

- INVARIANT: All POST/PUT endpoints validate request body
  - Rule: Request body must conform to Zod schema
  - Enforced by: Validation middleware (pre-route)
  - Purpose: Type safety, prevent invalid data in database
  - Violation: 400 Bad Request with validation errors
  - Recovery: Client fixes request, resubmits

- INVARIANT: All endpoints return consistent error format
  - Structure: `{ error: string, details?: any, timestamp: string }`
  - Enforced by: Error handler middleware
  - Purpose: Consistent client-side error handling
  - Violation: None (middleware catches all errors)
  - Recovery: N/A

**Data Integrity Invariants:**

- INVARIANT: Template IDs referenced in Cases must exist
  - Rule: `POST /api/cases` with invalid `template_id` returns 404
  - Enforced by: Foreign key check in repository + API validation
  - Purpose: No orphaned cases
  - Violation: 404 Not Found error
  - Recovery: Client must provide valid template_id

- INVARIANT: Case IDs referenced in Drafts must exist
  - Rule: `POST /api/drafts` with invalid `case_id` returns 404
  - Enforced by: Foreign key check in repository + API validation
  - Purpose: No orphaned drafts
  - Violation: 404 Not Found error
  - Recovery: Client must provide valid case_id

- INVARIANT: Draft versions increment monotonically
  - Rule: Each `PUT /api/drafts/:id` increments version by 1
  - Enforced by: Repository update logic
  - Purpose: Version history tracking, rollback capability
  - Violation: Version conflicts on concurrent updates
  - Detection: 409 Conflict error
  - Recovery: Client reloads latest version, applies changes, resubmits

**Response Format Invariants:**

- INVARIANT: GET endpoints return arrays or single objects
  - Pattern: GET /api/templates → `Template[]`, GET /api/templates/:id → `Template`
  - Enforced by: TypeScript types, API design
  - Purpose: Predictable client-side parsing
  - Violation: Type errors in client
  - Recovery: None (compile-time enforcement)

- INVARIANT: POST endpoints return created object with 201 status
  - Pattern: POST /api/templates → 201 Created + `Template` with generated ID
  - Enforced by: Route handlers (`res.status(201).json(template)`)
  - Purpose: Client receives created object immediately
  - Violation: Client doesn't get ID, must re-fetch
  - Recovery: None (framework handles automatically)

- INVARIANT: DELETE endpoints return 204 No Content (no body)
  - Pattern: DELETE /api/templates/:id → 204 No Content + empty body
  - Enforced by: Route handlers (`res.status(204).send()`)
  - Purpose: Efficient response, standard HTTP pattern
  - Violation: None
  - Recovery: N/A

### Verification Gates

**Service Startup Verification:**
- Command: `cd services/records-service && npm run dev`
- Expected:
  ```
  ✓ Database connection established
  ✓ Express server listening on port 3001
  ✓ Health check: http://localhost:3001/health
  ✓ Records Service ready
  ```
- Purpose: Verify service starts without errors

**Health Check Verification:**
- Command: `curl http://localhost:3001/health`
- Expected:
  ```json
  {
    "status": "healthy",
    "service": "records",
    "timestamp": "2024-12-26T..."
  }
  ```
- Purpose: Verify health endpoint responds

**Template CRUD Verification:**
- Command: Integration test or manual curl
  ```bash
  # Create
  curl -X POST http://localhost:3001/api/templates \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","category":"motion", ...}'
  # Expected: 201 Created + Template object with ID
  
  # Read
  curl http://localhost:3001/api/templates
  # Expected: 200 OK + Template[] array
  
  # Update
  curl -X PUT http://localhost:3001/api/templates/{id} \
    -H "Content-Type: application/json" \
    -d '{"name":"Updated Name"}'
  # Expected: 200 OK + Updated Template
  
  # Delete
  curl -X DELETE http://localhost:3001/api/templates/{id}
  # Expected: 204 No Content
  ```
- Purpose: Verify all Template endpoints work

**Case CRUD Verification:**
- Command: Same pattern as Template, test all 5 Case endpoints
- Expected: CRUD operations succeed with correct status codes
- Purpose: Verify Case endpoints work

**Draft CRUD Verification:**
- Command: Test all 8 Draft endpoints (including versioning)
- Expected: CRUD + version history/restore work
- Purpose: Verify Draft endpoints including complex operations

**Integration Test Verification:**
- Command: `cd services/records-service && npm test`
- Expected:
  ```
  PASS tests/integration/api.test.ts
    Records Service API
      Templates
        ✓ POST /api/templates creates template
        ✓ GET /api/templates lists templates
        ✓ GET /api/templates/:id gets single template
        ✓ PUT /api/templates/:id updates template
        ✓ DELETE /api/templates/:id deletes template
      Cases
        ✓ POST /api/cases creates case
        ✓ GET /api/cases lists cases
        (... 11 more tests ...)
  
  Tests: 18 passed, 18 total
  ```
- Purpose: Verify all endpoints work correctly

**Error Handling Verification:**
- Command: Test error scenarios
  ```bash
  # 404 Not Found
  curl http://localhost:3001/api/templates/non-existent-id
  # Expected: 404 + {"error": "Template not found"}
  
  # 400 Bad Request (validation)
  curl -X POST http://localhost:3001/api/templates \
    -H "Content-Type: application/json" \
    -d '{"invalid": "data"}'
  # Expected: 400 + {"error": "Validation failed", "details": [...]}
  ```
- Purpose: Verify error handling middleware works

### Risks

**Technical Risks:**

- **Risk:** Port 3001 conflict with other services
  - **Severity:** HIGH
  - **Likelihood:** LOW (port assignment managed by orchestrator)
  - **Impact:** Service fails to start, no Records API available
  - **Mitigation:**
    - Orchestrator checks port availability before spawn
    - Use `PORT` environment variable (configurable)
    - Log clear error message with port number
  - **Detection:** EADDRINUSE error on startup
  - **Recovery:** Orchestrator assigns different port, retries

- **Risk:** Database connection pool exhaustion
  - **Severity:** HIGH
  - **Likelihood:** MEDIUM (under heavy load)
  - **Impact:** API requests hang, timeout errors
  - **Mitigation:**
    - Set reasonable pool size (20 connections for SQLite, 50 for PostgreSQL)
    - Implement request timeouts (5s default)
    - Monitor active connections (log warning at 80% capacity)
  - **Detection:** Slow query logs, timeout errors
  - **Recovery:** Restart service to reset pool, increase pool size

- **Risk:** Express server memory leak
  - **Severity:** MEDIUM
  - **Likelihood:** LOW (modern Express is stable)
  - **Impact:** Service crashes after hours of uptime
  - **Mitigation:**
    - Use latest Express version (security patches)
    - Monitor memory usage (alert if >500MB)
    - Implement periodic health checks (restart if unhealthy)
  - **Detection:** Memory usage grows over time
  - **Recovery:** Orchestrator detects crash, respawns service

**Data Risks:**

- **Risk:** Concurrent draft updates cause data loss
  - **Scenario:** Two users edit same draft simultaneously
  - **Severity:** HIGH
  - **Likelihood:** LOW (single-user desktop app)
  - **Impact:** One user's changes overwrite the other's
  - **Mitigation:**
    - Implement optimistic locking (version field)
    - `PUT /api/drafts/:id` checks version, returns 409 if mismatch
    - Client reloads, merges changes, resubmits
  - **Detection:** 409 Conflict error
  - **Recovery:** Client UI prompts user to resolve conflict

- **Risk:** Deleting template cascades to all cases/drafts
  - **Severity:** CRITICAL
  - **Likelihood:** LOW (requires user action)
  - **Impact:** Permanent data loss for multiple documents
  - **Mitigation:**
    - Require confirmation in UI ("This will delete X cases and Y drafts")
    - Implement soft delete (deleted_at column) instead of hard DELETE
    - Create backup before destructive operation
  - **Detection:** User reports missing data
  - **Recovery:** Restore from backup (no automatic recovery)

**API Contract Risks:**

- **Risk:** Breaking API changes after Renderer is implemented
  - **Examples:**
    - Removing endpoint (`DELETE /api/templates`)
    - Changing response structure (Template → TemplateV2)
    - Changing status codes (200 → 201)
  - **Severity:** HIGH
  - **Likelihood:** MEDIUM (during development)
  - **Impact:** Renderer breaks, API calls fail
  - **Mitigation:**
    - Version API endpoints (/api/v1/templates, /api/v2/templates)
    - Deprecate old endpoints before removing (6 month notice)
    - Test API contract in CI (schema validation)
  - **Detection:** Integration tests fail, Renderer errors
  - **Recovery:** Fix API to restore contract or update Renderer

**Performance Risks:**

- **Risk:** Large draft document_json slows down API responses
  - **Scenario:** 200-page document = 5MB JSON
  - **Severity:** MEDIUM
  - **Likelihood:** MEDIUM
  - **Impact:** Slow `GET /api/drafts/:id`, poor UX
  - **Mitigation:**
    - Implement pagination for large documents (return sections in chunks)
    - Use streaming responses for large payloads
    - Add `?fields=id,title` query param to exclude document_json from lists
  - **Detection:** Slow response times (>1s), user complaints
  - **Recovery:** Optimize queries, implement pagination

- **Risk:** N+1 query problem in case/draft lists
  - **Scenario:** `GET /api/cases` fetches each case's template separately
  - **Severity:** MEDIUM
  - **Likelihood:** HIGH (if not careful)
  - **Impact:** Slow list loads (100 cases = 100 queries)
  - **Mitigation:**
    - Use JOIN queries in repository (fetch related data in one query)
    - Implement query result caching (10s TTL for lists)
  - **Detection:** Database query logs show repeated queries
  - **Recovery:** Optimize repository queries, add indexes

**Operational Risks:**

- **Risk:** Service crashes on uncaught exception
  - **Severity:** HIGH
  - **Likelihood:** LOW (error middleware catches most)
  - **Impact:** Service unavailable until restart
  - **Mitigation:**
    - Implement global error handlers (uncaughtException, unhandledRejection)
    - Log errors to file + stdout for debugging
    - Orchestrator detects crash via health check, respawns
  - **Detection:** Process exit (code 1), error logs
  - **Recovery:** Orchestrator respawns service automatically

- **Risk:** CORS errors block Renderer requests (cloud deployment)
  - **Severity:** MEDIUM
  - **Likelihood:** MEDIUM (if CORS not configured)
  - **Impact:** Renderer can't call API from different origin
  - **Mitigation:**
    - Configure CORS middleware with allowed origins
    - Desktop: Allow localhost (file:// protocol)
    - Cloud: Allow specific frontend domain
  - **Detection:** Browser console shows CORS errors
  - **Recovery:** Update CORS configuration, restart service

---

**End of Metadata for Runbook 3**
