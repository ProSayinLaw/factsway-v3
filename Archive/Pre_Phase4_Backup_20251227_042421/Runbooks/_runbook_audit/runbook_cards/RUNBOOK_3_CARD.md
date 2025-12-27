## Purpose
Create the Records Service microservice (port 3001) providing REST API for Template, Case, and Draft CRUD operations, establishing patterns for all subsequent microservices.

## Produces (Artifacts)
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

## Consumes (Prereqs)
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

## Interfaces Touched
- REST endpoints
  - GET /api/templates (Source: Metadata/RUNBOOK_3_METADATA.md:L40-L40) "- Templates: GET /api/templates, GET /api/templates/:id, POST /api/templates, PUT /api/templates/:id, DELETE /api/templates/:id"
  - GET /api/cases (Source: Metadata/RUNBOOK_3_METADATA.md:L41-L41) "- Cases: GET /api/cases, GET /api/cases/:id, POST /api/cases, PUT /api/cases/:id, DELETE /api/cases/:id"
  - GET /api/drafts (Source: Metadata/RUNBOOK_3_METADATA.md:L42-L42) "- Drafts: GET /api/drafts, GET /api/drafts/:id, GET /api/drafts/case/:caseId, POST /api/drafts, PUT /api/drafts/:id, DELETE /api/drafts/:id, GET /api/drafts/:id/versions, POST /api/drafts/:id/restore/:version"
  - GET /health (Source: Metadata/RUNBOOK_3_METADATA.md:L43-L43) "- Health: GET /health"
  - GET /health (Source: Metadata/RUNBOOK_3_METADATA.md:L83-L83) "- From: ANY → To: Records Service → **GET /health**"
  - GET /api/templates (Source: Metadata/RUNBOOK_3_METADATA.md:L91-L91) "- From: Renderer/Desktop Orchestrator → To: Records Service → **GET /api/templates**"
  - GET /api/templates/:id (Source: Metadata/RUNBOOK_3_METADATA.md:L97-L97) "- From: Renderer → To: Records Service → **GET /api/templates/:id**"
  - POST /api/templates (Source: Metadata/RUNBOOK_3_METADATA.md:L103-L103) "- From: Renderer → To: Records Service → **POST /api/templates**"
  - PUT /api/templates/:id (Source: Metadata/RUNBOOK_3_METADATA.md:L109-L109) "- From: Renderer → To: Records Service → **PUT /api/templates/:id**"
  - DELETE /api/templates/:id (Source: Metadata/RUNBOOK_3_METADATA.md:L115-L115) "- From: Renderer → To: Records Service → **DELETE /api/templates/:id**"
  - GET /api/cases (Source: Metadata/RUNBOOK_3_METADATA.md:L123-L123) "- From: Renderer → To: Records Service → **GET /api/cases**"
  - GET /api/cases/:id (Source: Metadata/RUNBOOK_3_METADATA.md:L129-L129) "- From: Renderer → To: Records Service → **GET /api/cases/:id**"
  - POST /api/cases (Source: Metadata/RUNBOOK_3_METADATA.md:L135-L135) "- From: Renderer → To: Records Service → **POST /api/cases**"
  - PUT /api/cases/:id (Source: Metadata/RUNBOOK_3_METADATA.md:L141-L141) "- From: Renderer → To: Records Service → **PUT /api/cases/:id**"
  - DELETE /api/cases/:id (Source: Metadata/RUNBOOK_3_METADATA.md:L147-L147) "- From: Renderer → To: Records Service → **DELETE /api/cases/:id**"
  - GET /api/drafts (Source: Metadata/RUNBOOK_3_METADATA.md:L155-L155) "- From: Renderer → To: Records Service → **GET /api/drafts**"
  - GET /api/drafts/:id (Source: Metadata/RUNBOOK_3_METADATA.md:L161-L161) "- From: Renderer → To: Records Service → **GET /api/drafts/:id**"
  - GET /api/drafts/case/:caseId (Source: Metadata/RUNBOOK_3_METADATA.md:L167-L167) "- From: Renderer → To: Records Service → **GET /api/drafts/case/:caseId**"
  - POST /api/drafts (Source: Metadata/RUNBOOK_3_METADATA.md:L173-L173) "- From: Renderer → To: Records Service → **POST /api/drafts**"
  - PUT /api/drafts/:id (Source: Metadata/RUNBOOK_3_METADATA.md:L179-L179) "- From: Renderer → To: Records Service → **PUT /api/drafts/:id**"
  - DELETE /api/drafts/:id (Source: Metadata/RUNBOOK_3_METADATA.md:L185-L185) "- From: Renderer → To: Records Service → **DELETE /api/drafts/:id**"
  - GET /api/drafts/:id/versions (Source: Metadata/RUNBOOK_3_METADATA.md:L191-L191) "- From: Renderer → To: Records Service → **GET /api/drafts/:id/versions**"
  - POST /api/drafts/:id/restore/:version (Source: Metadata/RUNBOOK_3_METADATA.md:L197-L197) "- From: Renderer → To: Records Service → **POST /api/drafts/:id/restore/:version**"
  - POST /api/cases (Source: Metadata/RUNBOOK_3_METADATA.md:L316-L316) "- Rule: `POST /api/cases` with invalid `template_id` returns 404"
  - POST /api/drafts (Source: Metadata/RUNBOOK_3_METADATA.md:L323-L323) "- Rule: `POST /api/drafts` with invalid `case_id` returns 404"
  - PUT /api/drafts/:id (Source: Metadata/RUNBOOK_3_METADATA.md:L330-L330) "- Rule: Each `PUT /api/drafts/:id` increments version by 1"
  - GET /api/templates (Source: Metadata/RUNBOOK_3_METADATA.md:L340-L340) "- Pattern: GET /api/templates → `Template[]`, GET /api/templates/:id → `Template`"
  - POST /api/templates (Source: Metadata/RUNBOOK_3_METADATA.md:L347-L347) "- Pattern: POST /api/templates → 201 Created + `Template` with generated ID"
  - DELETE /api/templates/:id (Source: Metadata/RUNBOOK_3_METADATA.md:L354-L354) "- Pattern: DELETE /api/templates/:id → 204 No Content + empty body"
  - POST /api/templates (Source: Metadata/RUNBOOK_3_METADATA.md:L427-L427) "✓ POST /api/templates creates template"
  - GET /api/templates (Source: Metadata/RUNBOOK_3_METADATA.md:L428-L428) "✓ GET /api/templates lists templates"
  - GET /api/templates/:id (Source: Metadata/RUNBOOK_3_METADATA.md:L429-L429) "✓ GET /api/templates/:id gets single template"
  - PUT /api/templates/:id (Source: Metadata/RUNBOOK_3_METADATA.md:L430-L430) "✓ PUT /api/templates/:id updates template"
  - DELETE /api/templates/:id (Source: Metadata/RUNBOOK_3_METADATA.md:L431-L431) "✓ DELETE /api/templates/:id deletes template"
  - POST /api/cases (Source: Metadata/RUNBOOK_3_METADATA.md:L433-L433) "✓ POST /api/cases creates case"
  - GET /api/cases (Source: Metadata/RUNBOOK_3_METADATA.md:L434-L434) "✓ GET /api/cases lists cases"
  - PUT /api/drafts/:id (Source: Metadata/RUNBOOK_3_METADATA.md:L502-L502) "- `PUT /api/drafts/:id` checks version, returns 409 if mismatch"
  - DELETE /api/templates (Source: Metadata/RUNBOOK_3_METADATA.md:L522-L522) "- Removing endpoint (`DELETE /api/templates`)"
  - GET /api/drafts/:id (Source: Metadata/RUNBOOK_3_METADATA.md:L541-L541) "- **Impact:** Slow `GET /api/drafts/:id`, poor UX"
  - GET /api/cases (Source: Metadata/RUNBOOK_3_METADATA.md:L550-L550) "- **Scenario:** `GET /api/cases` fetches each case's template separately"
- IPC channels/events (if any)
  - Create the Records Service microservice (port 3001) providing REST API for Template, Case, and Draft CRUD operations, establishing patterns for all subsequent microservices. (Source: Metadata/RUNBOOK_3_METADATA.md:L6-L6) "Create the Records Service microservice (port 3001) providing REST API for Template, Case, and Draft CRUD operations, establishing patterns for all subsequent microservices."
  - - Service: `records-service` (port 3001) (Source: Metadata/RUNBOOK_3_METADATA.md:L11-L11) "- Service: `records-service` (port 3001)"
  - - `PORT`: Service port (default 3001) (Source: Metadata/RUNBOOK_3_METADATA.md:L59-L59) "- `PORT`: Service port (default 3001)"
  - #### IPC Channels (Client - Records Service Emits) (Source: Metadata/RUNBOOK_3_METADATA.md:L208-L208) "#### IPC Channels (Client - Records Service Emits)"
  - - Payload: `{ service: "records", port: 3001, timestamp: string }` (Source: Metadata/RUNBOOK_3_METADATA.md:L211-L211) "- Payload: `{ service: "records", port: 3001, timestamp: string }`"
  - - Express HTTP server (listens on port 3001) (Source: Metadata/RUNBOOK_3_METADATA.md:L247-L247) "- Express HTTP server (listens on port 3001)"
  - - Log: "✓ Records Service running on port 3001" (Source: Metadata/RUNBOOK_3_METADATA.md:L256-L256) "- Log: "✓ Records Service running on port 3001""
  - - Handle HTTP requests (Source: Metadata/RUNBOOK_3_METADATA.md:L259-L259) "- Handle HTTP requests"
  - - INVARIANT: Service runs on exactly one port (Source: Metadata/RUNBOOK_3_METADATA.md:L275-L275) "- INVARIANT: Service runs on exactly one port"
  - - Property: `PORT` environment variable or default 3001 (Source: Metadata/RUNBOOK_3_METADATA.md:L276-L276) "- Property: `PORT` environment variable or default 3001"
  - - Enforced by: Express server binds to single port (Source: Metadata/RUNBOOK_3_METADATA.md:L277-L277) "- Enforced by: Express server binds to single port"
  - - Purpose: No port conflicts, predictable service discovery (Source: Metadata/RUNBOOK_3_METADATA.md:L278-L278) "- Purpose: No port conflicts, predictable service discovery"
  - - Violation: Port already in use error (EADDRINUSE) (Source: Metadata/RUNBOOK_3_METADATA.md:L279-L279) "- Violation: Port already in use error (EADDRINUSE)"
  - - Recovery: Orchestrator retries with different port or fails startup (Source: Metadata/RUNBOOK_3_METADATA.md:L280-L280) "- Recovery: Orchestrator retries with different port or fails startup"
  - ✓ Express server listening on port 3001 (Source: Metadata/RUNBOOK_3_METADATA.md:L367-L367) "✓ Express server listening on port 3001"
  - - **Risk:** Port 3001 conflict with other services (Source: Metadata/RUNBOOK_3_METADATA.md:L460-L460) "- **Risk:** Port 3001 conflict with other services"
  - - **Likelihood:** LOW (port assignment managed by orchestrator) (Source: Metadata/RUNBOOK_3_METADATA.md:L462-L462) "- **Likelihood:** LOW (port assignment managed by orchestrator)"
  - - Orchestrator checks port availability before spawn (Source: Metadata/RUNBOOK_3_METADATA.md:L465-L465) "- Orchestrator checks port availability before spawn"
  - - Use `PORT` environment variable (configurable) (Source: Metadata/RUNBOOK_3_METADATA.md:L466-L466) "- Use `PORT` environment variable (configurable)"
  - - Log clear error message with port number (Source: Metadata/RUNBOOK_3_METADATA.md:L467-L467) "- Log clear error message with port number"
  - - **Recovery:** Orchestrator assigns different port, retries (Source: Metadata/RUNBOOK_3_METADATA.md:L469-L469) "- **Recovery:** Orchestrator assigns different port, retries"
  - - Set up Express server on port 3001 (Source: Metadata/RUNBOOK_3_METADATA.md:L597-L597) "- Set up Express server on port 3001"
  - 3. **Don't forget IPC events:** Emit service:ready on startup (Orchestrator needs this) (Source: Metadata/RUNBOOK_3_METADATA.md:L627-L627) "3. **Don't forget IPC events:** Emit service:ready on startup (Orchestrator needs this)"
  - 4. **Don't hardcode port:** Use PORT environment variable (Orchestrator assigns ports) (Source: Metadata/RUNBOOK_3_METADATA.md:L628-L628) "4. **Don't hardcode port:** Use PORT environment variable (Orchestrator assigns ports)"
  - - [ ] Service starts on port 3001 (Source: Metadata/RUNBOOK_3_METADATA.md:L638-L638) "- [ ] Service starts on port 3001"
  - - [ ] IPC events emitted (service:ready on startup) (Source: Metadata/RUNBOOK_3_METADATA.md:L643-L643) "- [ ] IPC events emitted (service:ready on startup)"
- Filesystem paths/formats
  - package.json (Source: Metadata/RUNBOOK_3_METADATA.md:L32-L32) "- File: `services/records-service/package.json` (dependencies)"
  - tsconfig.json (Source: Metadata/RUNBOOK_3_METADATA.md:L33-L33) "- File: `services/records-service/tsconfig.json` (TypeScript config)"
  - res.json (Source: Metadata/RUNBOOK_3_METADATA.md:L294-L294) "- Enforced by: Express `res.json()` method"
- Process lifecycle (if any)
  - **Spawned By:** - Desktop Orchestrator (Runbook 7) spawns this as child process   - Command: `node dist/index.js`   - Working Directory: `services/records-service/`   - Environment: Variables injected by orchestrator  **Manages:** - Express HTTP server (listens on port 3001) - Database connection pool (better-sqlite3 or pg.Pool)  **Lifecycle:** 1. **Startup:**    - Load environment variables    - Initialize database connection    - Start Express server    - Emit `service:ready` event    - Log: "✓ Records Service running on port 3001"  2. **Runtime:**    - Handle HTTP requests    - Execute database queries via repositories    - Log errors to stdout/stderr    - Health check responds to /health  3. **Shutdown:**    - Receive SIGTERM/SIGINT signal    - Emit `service:shutdown` event    - Close database connections    - Stop HTTP server (graceful shutdown)    - Exit with code 0

## Contracts Defined or Used
- REST GET /api/templates (Source: Metadata/RUNBOOK_3_METADATA.md:L40-L40) "- Templates: GET /api/templates, GET /api/templates/:id, POST /api/templates, PUT /api/templates/:id, DELETE /api/templates/:id"
- REST GET /api/cases (Source: Metadata/RUNBOOK_3_METADATA.md:L41-L41) "- Cases: GET /api/cases, GET /api/cases/:id, POST /api/cases, PUT /api/cases/:id, DELETE /api/cases/:id"
- REST GET /api/drafts (Source: Metadata/RUNBOOK_3_METADATA.md:L42-L42) "- Drafts: GET /api/drafts, GET /api/drafts/:id, GET /api/drafts/case/:caseId, POST /api/drafts, PUT /api/drafts/:id, DELETE /api/drafts/:id, GET /api/drafts/:id/versions, POST /api/drafts/:id/restore/:version"
- REST GET /health (Source: Metadata/RUNBOOK_3_METADATA.md:L43-L43) "- Health: GET /health"
- REST GET /health (Source: Metadata/RUNBOOK_3_METADATA.md:L83-L83) "- From: ANY → To: Records Service → **GET /health**"
- REST GET /api/templates (Source: Metadata/RUNBOOK_3_METADATA.md:L91-L91) "- From: Renderer/Desktop Orchestrator → To: Records Service → **GET /api/templates**"
- REST GET /api/templates/:id (Source: Metadata/RUNBOOK_3_METADATA.md:L97-L97) "- From: Renderer → To: Records Service → **GET /api/templates/:id**"
- REST POST /api/templates (Source: Metadata/RUNBOOK_3_METADATA.md:L103-L103) "- From: Renderer → To: Records Service → **POST /api/templates**"
- REST PUT /api/templates/:id (Source: Metadata/RUNBOOK_3_METADATA.md:L109-L109) "- From: Renderer → To: Records Service → **PUT /api/templates/:id**"
- REST DELETE /api/templates/:id (Source: Metadata/RUNBOOK_3_METADATA.md:L115-L115) "- From: Renderer → To: Records Service → **DELETE /api/templates/:id**"
- REST GET /api/cases (Source: Metadata/RUNBOOK_3_METADATA.md:L123-L123) "- From: Renderer → To: Records Service → **GET /api/cases**"
- REST GET /api/cases/:id (Source: Metadata/RUNBOOK_3_METADATA.md:L129-L129) "- From: Renderer → To: Records Service → **GET /api/cases/:id**"
- REST POST /api/cases (Source: Metadata/RUNBOOK_3_METADATA.md:L135-L135) "- From: Renderer → To: Records Service → **POST /api/cases**"
- REST PUT /api/cases/:id (Source: Metadata/RUNBOOK_3_METADATA.md:L141-L141) "- From: Renderer → To: Records Service → **PUT /api/cases/:id**"
- REST DELETE /api/cases/:id (Source: Metadata/RUNBOOK_3_METADATA.md:L147-L147) "- From: Renderer → To: Records Service → **DELETE /api/cases/:id**"
- REST GET /api/drafts (Source: Metadata/RUNBOOK_3_METADATA.md:L155-L155) "- From: Renderer → To: Records Service → **GET /api/drafts**"
- REST GET /api/drafts/:id (Source: Metadata/RUNBOOK_3_METADATA.md:L161-L161) "- From: Renderer → To: Records Service → **GET /api/drafts/:id**"
- REST GET /api/drafts/case/:caseId (Source: Metadata/RUNBOOK_3_METADATA.md:L167-L167) "- From: Renderer → To: Records Service → **GET /api/drafts/case/:caseId**"
- REST POST /api/drafts (Source: Metadata/RUNBOOK_3_METADATA.md:L173-L173) "- From: Renderer → To: Records Service → **POST /api/drafts**"
- REST PUT /api/drafts/:id (Source: Metadata/RUNBOOK_3_METADATA.md:L179-L179) "- From: Renderer → To: Records Service → **PUT /api/drafts/:id**"
- REST DELETE /api/drafts/:id (Source: Metadata/RUNBOOK_3_METADATA.md:L185-L185) "- From: Renderer → To: Records Service → **DELETE /api/drafts/:id**"
- REST GET /api/drafts/:id/versions (Source: Metadata/RUNBOOK_3_METADATA.md:L191-L191) "- From: Renderer → To: Records Service → **GET /api/drafts/:id/versions**"
- REST POST /api/drafts/:id/restore/:version (Source: Metadata/RUNBOOK_3_METADATA.md:L197-L197) "- From: Renderer → To: Records Service → **POST /api/drafts/:id/restore/:version**"
- REST POST /api/cases (Source: Metadata/RUNBOOK_3_METADATA.md:L316-L316) "- Rule: `POST /api/cases` with invalid `template_id` returns 404"
- REST POST /api/drafts (Source: Metadata/RUNBOOK_3_METADATA.md:L323-L323) "- Rule: `POST /api/drafts` with invalid `case_id` returns 404"
- REST PUT /api/drafts/:id (Source: Metadata/RUNBOOK_3_METADATA.md:L330-L330) "- Rule: Each `PUT /api/drafts/:id` increments version by 1"
- REST GET /api/templates (Source: Metadata/RUNBOOK_3_METADATA.md:L340-L340) "- Pattern: GET /api/templates → `Template[]`, GET /api/templates/:id → `Template`"
- REST POST /api/templates (Source: Metadata/RUNBOOK_3_METADATA.md:L347-L347) "- Pattern: POST /api/templates → 201 Created + `Template` with generated ID"
- REST DELETE /api/templates/:id (Source: Metadata/RUNBOOK_3_METADATA.md:L354-L354) "- Pattern: DELETE /api/templates/:id → 204 No Content + empty body"
- REST POST /api/templates (Source: Metadata/RUNBOOK_3_METADATA.md:L427-L427) "✓ POST /api/templates creates template"
- REST GET /api/templates (Source: Metadata/RUNBOOK_3_METADATA.md:L428-L428) "✓ GET /api/templates lists templates"
- REST GET /api/templates/:id (Source: Metadata/RUNBOOK_3_METADATA.md:L429-L429) "✓ GET /api/templates/:id gets single template"
- REST PUT /api/templates/:id (Source: Metadata/RUNBOOK_3_METADATA.md:L430-L430) "✓ PUT /api/templates/:id updates template"
- REST DELETE /api/templates/:id (Source: Metadata/RUNBOOK_3_METADATA.md:L431-L431) "✓ DELETE /api/templates/:id deletes template"
- REST POST /api/cases (Source: Metadata/RUNBOOK_3_METADATA.md:L433-L433) "✓ POST /api/cases creates case"
- REST GET /api/cases (Source: Metadata/RUNBOOK_3_METADATA.md:L434-L434) "✓ GET /api/cases lists cases"
- REST PUT /api/drafts/:id (Source: Metadata/RUNBOOK_3_METADATA.md:L502-L502) "- `PUT /api/drafts/:id` checks version, returns 409 if mismatch"
- REST DELETE /api/templates (Source: Metadata/RUNBOOK_3_METADATA.md:L522-L522) "- Removing endpoint (`DELETE /api/templates`)"
- REST GET /api/drafts/:id (Source: Metadata/RUNBOOK_3_METADATA.md:L541-L541) "- **Impact:** Slow `GET /api/drafts/:id`, poor UX"
- REST GET /api/cases (Source: Metadata/RUNBOOK_3_METADATA.md:L550-L550) "- **Scenario:** `GET /api/cases` fetches each case's template separately"
- IPC Create the Records Service microservice (port 3001) providing REST API for Template, Case, and Draft CRUD operations, establishing patterns for all subsequent microservices. (Source: Metadata/RUNBOOK_3_METADATA.md:L6-L6) "Create the Records Service microservice (port 3001) providing REST API for Template, Case, and Draft CRUD operations, establishing patterns for all subsequent microservices."
- IPC - Service: `records-service` (port 3001) (Source: Metadata/RUNBOOK_3_METADATA.md:L11-L11) "- Service: `records-service` (port 3001)"
- IPC - `PORT`: Service port (default 3001) (Source: Metadata/RUNBOOK_3_METADATA.md:L59-L59) "- `PORT`: Service port (default 3001)"
- IPC #### IPC Channels (Client - Records Service Emits) (Source: Metadata/RUNBOOK_3_METADATA.md:L208-L208) "#### IPC Channels (Client - Records Service Emits)"
- IPC - Payload: `{ service: "records", port: 3001, timestamp: string }` (Source: Metadata/RUNBOOK_3_METADATA.md:L211-L211) "- Payload: `{ service: "records", port: 3001, timestamp: string }`"
- IPC - Express HTTP server (listens on port 3001) (Source: Metadata/RUNBOOK_3_METADATA.md:L247-L247) "- Express HTTP server (listens on port 3001)"
- IPC - Log: "✓ Records Service running on port 3001" (Source: Metadata/RUNBOOK_3_METADATA.md:L256-L256) "- Log: "✓ Records Service running on port 3001""
- IPC - Handle HTTP requests (Source: Metadata/RUNBOOK_3_METADATA.md:L259-L259) "- Handle HTTP requests"
- IPC - INVARIANT: Service runs on exactly one port (Source: Metadata/RUNBOOK_3_METADATA.md:L275-L275) "- INVARIANT: Service runs on exactly one port"
- IPC - Property: `PORT` environment variable or default 3001 (Source: Metadata/RUNBOOK_3_METADATA.md:L276-L276) "- Property: `PORT` environment variable or default 3001"
- IPC - Enforced by: Express server binds to single port (Source: Metadata/RUNBOOK_3_METADATA.md:L277-L277) "- Enforced by: Express server binds to single port"
- IPC - Purpose: No port conflicts, predictable service discovery (Source: Metadata/RUNBOOK_3_METADATA.md:L278-L278) "- Purpose: No port conflicts, predictable service discovery"
- IPC - Violation: Port already in use error (EADDRINUSE) (Source: Metadata/RUNBOOK_3_METADATA.md:L279-L279) "- Violation: Port already in use error (EADDRINUSE)"
- IPC - Recovery: Orchestrator retries with different port or fails startup (Source: Metadata/RUNBOOK_3_METADATA.md:L280-L280) "- Recovery: Orchestrator retries with different port or fails startup"
- IPC ✓ Express server listening on port 3001 (Source: Metadata/RUNBOOK_3_METADATA.md:L367-L367) "✓ Express server listening on port 3001"
- IPC - **Risk:** Port 3001 conflict with other services (Source: Metadata/RUNBOOK_3_METADATA.md:L460-L460) "- **Risk:** Port 3001 conflict with other services"
- IPC - **Likelihood:** LOW (port assignment managed by orchestrator) (Source: Metadata/RUNBOOK_3_METADATA.md:L462-L462) "- **Likelihood:** LOW (port assignment managed by orchestrator)"
- IPC - Orchestrator checks port availability before spawn (Source: Metadata/RUNBOOK_3_METADATA.md:L465-L465) "- Orchestrator checks port availability before spawn"
- IPC - Use `PORT` environment variable (configurable) (Source: Metadata/RUNBOOK_3_METADATA.md:L466-L466) "- Use `PORT` environment variable (configurable)"
- IPC - Log clear error message with port number (Source: Metadata/RUNBOOK_3_METADATA.md:L467-L467) "- Log clear error message with port number"
- IPC - **Recovery:** Orchestrator assigns different port, retries (Source: Metadata/RUNBOOK_3_METADATA.md:L469-L469) "- **Recovery:** Orchestrator assigns different port, retries"
- IPC - Set up Express server on port 3001 (Source: Metadata/RUNBOOK_3_METADATA.md:L597-L597) "- Set up Express server on port 3001"
- IPC 3. **Don't forget IPC events:** Emit service:ready on startup (Orchestrator needs this) (Source: Metadata/RUNBOOK_3_METADATA.md:L627-L627) "3. **Don't forget IPC events:** Emit service:ready on startup (Orchestrator needs this)"
- IPC 4. **Don't hardcode port:** Use PORT environment variable (Orchestrator assigns ports) (Source: Metadata/RUNBOOK_3_METADATA.md:L628-L628) "4. **Don't hardcode port:** Use PORT environment variable (Orchestrator assigns ports)"
- IPC - [ ] Service starts on port 3001 (Source: Metadata/RUNBOOK_3_METADATA.md:L638-L638) "- [ ] Service starts on port 3001"
- IPC - [ ] IPC events emitted (service:ready on startup) (Source: Metadata/RUNBOOK_3_METADATA.md:L643-L643) "- [ ] IPC events emitted (service:ready on startup)"
- Schema Zod (Source: Metadata/RUNBOOK_3_METADATA.md:L31-L31) "- Purpose: Request body validation using Zod"
- Schema LegalDocument (Source: Metadata/RUNBOOK_3_METADATA.md:L49-L49) "- Imports: `LegalDocument`, `Template`, `Case`, `Draft`, `UUID`"
- Schema zod (Source: Metadata/RUNBOOK_3_METADATA.md:L74-L74) "- `zod@^3.22.0` (runtime validation)"
- Schema Zod (Source: Metadata/RUNBOOK_3_METADATA.md:L300-L300) "- Rule: Request body must conform to Zod schema"
- Schema schema (Source: Metadata/RUNBOOK_3_METADATA.md:L531-L531) "- Test API contract in CI (schema validation)"
- Schema schema (Source: Metadata/RUNBOOK_3_METADATA.md:L632-L632) "- [ ] Request schema matches specification"
- Schema schema (Source: Metadata/RUNBOOK_3_METADATA.md:L633-L633) "- [ ] Response schema matches specification"
- File package.json (Source: Metadata/RUNBOOK_3_METADATA.md:L32-L32) "- File: `services/records-service/package.json` (dependencies)"
- File tsconfig.json (Source: Metadata/RUNBOOK_3_METADATA.md:L33-L33) "- File: `services/records-service/tsconfig.json` (TypeScript config)"
- File res.json (Source: Metadata/RUNBOOK_3_METADATA.md:L294-L294) "- Enforced by: Express `res.json()` method"

## Invariants Relied On
- - INVARIANT: Service runs on exactly one port (Source: Metadata/RUNBOOK_3_METADATA.md:L275-L275) "- INVARIANT: Service runs on exactly one port"
- - INVARIANT: Service has exactly one database connection pool (Source: Metadata/RUNBOOK_3_METADATA.md:L282-L282) "- INVARIANT: Service has exactly one database connection pool"
- - INVARIANT: All responses include proper Content-Type header (Source: Metadata/RUNBOOK_3_METADATA.md:L292-L292) "- INVARIANT: All responses include proper Content-Type header"
- - INVARIANT: All POST/PUT endpoints validate request body (Source: Metadata/RUNBOOK_3_METADATA.md:L299-L299) "- INVARIANT: All POST/PUT endpoints validate request body"
- - INVARIANT: All endpoints return consistent error format (Source: Metadata/RUNBOOK_3_METADATA.md:L306-L306) "- INVARIANT: All endpoints return consistent error format"
- - INVARIANT: Template IDs referenced in Cases must exist (Source: Metadata/RUNBOOK_3_METADATA.md:L315-L315) "- INVARIANT: Template IDs referenced in Cases must exist"
- - INVARIANT: Case IDs referenced in Drafts must exist (Source: Metadata/RUNBOOK_3_METADATA.md:L322-L322) "- INVARIANT: Case IDs referenced in Drafts must exist"
- - INVARIANT: Draft versions increment monotonically (Source: Metadata/RUNBOOK_3_METADATA.md:L329-L329) "- INVARIANT: Draft versions increment monotonically"
- - INVARIANT: GET endpoints return arrays or single objects (Source: Metadata/RUNBOOK_3_METADATA.md:L339-L339) "- INVARIANT: GET endpoints return arrays or single objects"
- - INVARIANT: POST endpoints return created object with 201 status (Source: Metadata/RUNBOOK_3_METADATA.md:L346-L346) "- INVARIANT: POST endpoints return created object with 201 status"
- - INVARIANT: DELETE endpoints return 204 No Content (no body) (Source: Metadata/RUNBOOK_3_METADATA.md:L353-L353) "- INVARIANT: DELETE endpoints return 204 No Content (no body)"

## Verification Gate (Commands + Expected Outputs)
- - Purpose: Verify service starts without errors (Source: Metadata/RUNBOOK_3_METADATA.md:L371-L371) "- Purpose: Verify service starts without errors"
- - Purpose: Verify health endpoint responds (Source: Metadata/RUNBOOK_3_METADATA.md:L383-L383) "- Purpose: Verify health endpoint responds"
- - Purpose: Verify all Template endpoints work (Source: Metadata/RUNBOOK_3_METADATA.md:L408-L408) "- Purpose: Verify all Template endpoints work"
- - Purpose: Verify Case endpoints work (Source: Metadata/RUNBOOK_3_METADATA.md:L413-L413) "- Purpose: Verify Case endpoints work"
- - Purpose: Verify Draft endpoints including complex operations (Source: Metadata/RUNBOOK_3_METADATA.md:L418-L418) "- Purpose: Verify Draft endpoints including complex operations"
- - Command: `cd services/records-service && npm test` (Source: Metadata/RUNBOOK_3_METADATA.md:L421-L421) "- Command: `cd services/records-service && npm test`"
- - Purpose: Verify all endpoints work correctly (Source: Metadata/RUNBOOK_3_METADATA.md:L439-L439) "- Purpose: Verify all endpoints work correctly"
- - Purpose: Verify error handling middleware works (Source: Metadata/RUNBOOK_3_METADATA.md:L454-L454) "- Purpose: Verify error handling middleware works"
- 1. Verify Runbook 1 types and Runbook 2 database are complete (Source: Metadata/RUNBOOK_3_METADATA.md:L589-L589) "1. Verify Runbook 1 types and Runbook 2 database are complete"
- - Verify status codes match specification (200, 201, 404, 400) (Source: Metadata/RUNBOOK_3_METADATA.md:L604-L604) "- Verify status codes match specification (200, 201, 404, 400)"
- - Verify foreign key to template_id works (try invalid template_id) (Source: Metadata/RUNBOOK_3_METADATA.md:L608-L608) "- Verify foreign key to template_id works (try invalid template_id)"
- - Verify cascade deletes work (delete template, check cases/drafts deleted) (Source: Metadata/RUNBOOK_3_METADATA.md:L616-L616) "- Verify cascade deletes work (delete template, check cases/drafts deleted)"

## Risks / Unknowns (TODOs)
- - **Risk:** Port 3001 conflict with other services (Source: Metadata/RUNBOOK_3_METADATA.md:L460-L460) "- **Risk:** Port 3001 conflict with other services"
- - **Risk:** Database connection pool exhaustion (Source: Metadata/RUNBOOK_3_METADATA.md:L471-L471) "- **Risk:** Database connection pool exhaustion"
- - **Risk:** Express server memory leak (Source: Metadata/RUNBOOK_3_METADATA.md:L482-L482) "- **Risk:** Express server memory leak"
- - **Risk:** Concurrent draft updates cause data loss (Source: Metadata/RUNBOOK_3_METADATA.md:L495-L495) "- **Risk:** Concurrent draft updates cause data loss"
- - **Risk:** Deleting template cascades to all cases/drafts (Source: Metadata/RUNBOOK_3_METADATA.md:L507-L507) "- **Risk:** Deleting template cascades to all cases/drafts"
- - **Risk:** Breaking API changes after Renderer is implemented (Source: Metadata/RUNBOOK_3_METADATA.md:L520-L520) "- **Risk:** Breaking API changes after Renderer is implemented"
- - **Risk:** Large draft document_json slows down API responses (Source: Metadata/RUNBOOK_3_METADATA.md:L537-L537) "- **Risk:** Large draft document_json slows down API responses"
- - **Risk:** N+1 query problem in case/draft lists (Source: Metadata/RUNBOOK_3_METADATA.md:L549-L549) "- **Risk:** N+1 query problem in case/draft lists"
- - **Risk:** Service crashes on uncaught exception (Source: Metadata/RUNBOOK_3_METADATA.md:L562-L562) "- **Risk:** Service crashes on uncaught exception"
- - **Risk:** CORS errors block Renderer requests (cloud deployment) (Source: Metadata/RUNBOOK_3_METADATA.md:L573-L573) "- **Risk:** CORS errors block Renderer requests (cloud deployment)"
