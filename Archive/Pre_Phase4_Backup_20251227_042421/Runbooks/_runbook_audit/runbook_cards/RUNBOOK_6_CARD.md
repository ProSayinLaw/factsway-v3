## Purpose
Create 4 specialized microservices (Citation, Evidence, Template, Analysis) providing domain-specific functionality for legal document processing, each with single responsibility and REST API.

## Produces (Artifacts)
**Services (4 total):**

1. **Citation Service** (port 3004)
   - Language: TypeScript/Node.js
   - Framework: Express.js
   - Purpose: Parse and validate legal citations
   
2. **Evidence Service** (port 3005)
   - Language: TypeScript/Node.js
   - Framework: Express.js
   - Purpose: Manage evidence files and exhibits
   
3. **Template Service** (port 3006)
   - Language: TypeScript/Node.js
   - Framework: Express.js
   - Purpose: Template variable substitution and filling
   
4. **Analysis Service** (port 3007)
   - Language: Python 3.11+
   - Framework: FastAPI
   - Purpose: Document metrics and readability analysis

**Files (by service):**

**Citation Service (~800 lines):**
- File: `services/citation-service/src/index.ts` (~150 lines)
- File: `services/citation-service/src/parsers/case-parser.ts` (~200 lines)
- File: `services/citation-service/src/parsers/statute-parser.ts` (~150 lines)
- File: `services/citation-service/src/validators/citation-validator.ts` (~150 lines)
- File: `services/citation-service/tests/integration/api.test.ts` (~150 lines)

**Evidence Service (~700 lines):**
- File: `services/evidence-service/src/index.ts` (~150 lines)
- File: `services/evidence-service/src/storage/file-manager.ts` (~200 lines)
- File: `services/evidence-service/src/api/evidence.routes.ts` (~150 lines)
- File: `services/evidence-service/tests/integration/api.test.ts` (~200 lines)

**Template Service (~600 lines):**
- File: `services/template-service/src/index.ts` (~150 lines)
- File: `services/template-service/src/services/template-filler.ts` (~200 lines)
- File: `services/template-service/src/api/template.routes.ts` (~100 lines)
- File: `services/template-service/tests/integration/api.test.ts` (~150 lines)

**Analysis Service (~500 lines):**
- File: `services/analysis-service/main.py` (~150 lines)
- File: `services/analysis-service/analyzers/document_analyzer.py` (~200 lines)
- File: `services/analysis-service/analyzers/readability.py` (~100 lines)
- File: `services/analysis-service/tests/test_analysis.py` (~50 lines)

**Total:** ~2,600 lines across 4 services

## Consumes (Prereqs)
**Required Runbooks:**
- Runbook 1: `@factsway/shared-types` (LegalDocument, Citation types)
- Runbook 2: `@factsway/database` (Evidence repository for file metadata)
- Runbook 3-5: Established microservice patterns

**Required Environment Variables (per service):**

**All Services:**
- `DEPLOYMENT_ENV`: "desktop"|"cloud"|"enterprise"
- `SERVICE_NAME`: "citation"|"evidence"|"template"|"analysis"
- `LOG_LEVEL`: "debug"|"info"|"warn"|"error"

**Citation Service (3004):**
- `PORT`: 3004
- `DATABASE_URL`: For citation cache (optional)

**Evidence Service (3005):**
- `PORT`: 3005
- `EVIDENCE_STORAGE_PATH`: Directory for file uploads (e.g., `/tmp/evidence/`)
- `MAX_FILE_SIZE`: "50MB"
- `DATABASE_URL`: For evidence metadata

**Template Service (3006):**
- `PORT`: 3006

**Analysis Service (3007):**
- `PORT`: 3007

**Required Dependencies:**

**TypeScript Services (Citation, Evidence, Template):**
- `express@^4.18.0`
- `multer@^1.4.5` (file uploads, Evidence Service only)
- `@factsway/shared-types@^1.0.0`

**Python Service (Analysis):**
- `fastapi==0.108.0`
- `textstat==0.7.3` (readability analysis)

## Interfaces Touched
- REST endpoints
  - POST /api/citations/parse (Source: Metadata/RUNBOOK_6_METADATA.md:L108-L108) "- From: Renderer/Ingestion → To: Citation Service → **POST /api/citations/parse**"
  - POST /api/citations/validate (Source: Metadata/RUNBOOK_6_METADATA.md:L129-L129) "- From: Renderer → To: Citation Service → **POST /api/citations/validate**"
  - GET /health (Source: Metadata/RUNBOOK_6_METADATA.md:L135-L135) "- From: ANY → To: Citation Service → **GET /health**"
  - POST /api/evidence (Source: Metadata/RUNBOOK_6_METADATA.md:L140-L140) "- From: Renderer → To: Evidence Service → **POST /api/evidence**"
  - GET /api/evidence/:id (Source: Metadata/RUNBOOK_6_METADATA.md:L150-L150) "- From: Renderer → To: Evidence Service → **GET /api/evidence/:id**"
  - GET /api/evidence/case/:caseId (Source: Metadata/RUNBOOK_6_METADATA.md:L156-L156) "- From: Renderer → To: Evidence Service → **GET /api/evidence/case/:caseId**"
  - DELETE /api/evidence/:id (Source: Metadata/RUNBOOK_6_METADATA.md:L162-L162) "- From: Renderer → To: Evidence Service → **DELETE /api/evidence/:id**"
  - GET /health (Source: Metadata/RUNBOOK_6_METADATA.md:L168-L168) "- From: ANY → To: Evidence Service → **GET /health**"
  - POST /api/templates/fill (Source: Metadata/RUNBOOK_6_METADATA.md:L173-L173) "- From: Records Service/Renderer → To: Template Service → **POST /api/templates/fill**"
  - POST /api/templates/extract-variables (Source: Metadata/RUNBOOK_6_METADATA.md:L185-L185) "- From: Renderer → To: Template Service → **POST /api/templates/extract-variables**"
  - GET /health (Source: Metadata/RUNBOOK_6_METADATA.md:L192-L192) "- From: ANY → To: Template Service → **GET /health**"
  - POST /analyze (Source: Metadata/RUNBOOK_6_METADATA.md:L197-L197) "- From: Renderer → To: Analysis Service → **POST /analyze**"
  - GET /health (Source: Metadata/RUNBOOK_6_METADATA.md:L221-L221) "- From: ANY → To: Analysis Service → **GET /health**"
- IPC channels/events (if any)
  - 1. **Citation Service** (port 3004) (Source: Metadata/RUNBOOK_6_METADATA.md:L12-L12) "1. **Citation Service** (port 3004)"
  - 2. **Evidence Service** (port 3005) (Source: Metadata/RUNBOOK_6_METADATA.md:L17-L17) "2. **Evidence Service** (port 3005)"
  - 3. **Template Service** (port 3006) (Source: Metadata/RUNBOOK_6_METADATA.md:L22-L22) "3. **Template Service** (port 3006)"
  - 4. **Analysis Service** (port 3007) (Source: Metadata/RUNBOOK_6_METADATA.md:L27-L27) "4. **Analysis Service** (port 3007)"
  - - `PORT`: 3004 (Source: Metadata/RUNBOOK_6_METADATA.md:L76-L76) "- `PORT`: 3004"
  - - `PORT`: 3005 (Source: Metadata/RUNBOOK_6_METADATA.md:L80-L80) "- `PORT`: 3005"
  - - `PORT`: 3006 (Source: Metadata/RUNBOOK_6_METADATA.md:L86-L86) "- `PORT`: 3006"
  - - `PORT`: 3007 (Source: Metadata/RUNBOOK_6_METADATA.md:L89-L89) "- `PORT`: 3007"
  - **Citation Service (Port 3004):** (Source: Metadata/RUNBOOK_6_METADATA.md:L106-L106) "**Citation Service (Port 3004):**"
  - **Evidence Service (Port 3005):** (Source: Metadata/RUNBOOK_6_METADATA.md:L138-L138) "**Evidence Service (Port 3005):**"
  - **Template Service (Port 3006):** (Source: Metadata/RUNBOOK_6_METADATA.md:L171-L171) "**Template Service (Port 3006):**"
  - **Analysis Service (Port 3007):** (Source: Metadata/RUNBOOK_6_METADATA.md:L195-L195) "**Analysis Service (Port 3007):**"
  - #### IPC Channels (All Services) (Source: Metadata/RUNBOOK_6_METADATA.md:L224-L224) "#### IPC Channels (All Services)"
  - - Payload: `{ service: string, port: number, timestamp: string }` (Source: Metadata/RUNBOOK_6_METADATA.md:L229-L229) "- Payload: `{ service: string, port: number, timestamp: string }`"
  - - Example: `{ service: "citation", port: 3004, timestamp: "..." }` (Source: Metadata/RUNBOOK_6_METADATA.md:L231-L231) "- Example: `{ service: "citation", port: 3004, timestamp: "..." }`"
  - - Lifecycle: Start → Listen on port → Emit service:ready → Handle requests → Shutdown (Source: Metadata/RUNBOOK_6_METADATA.md:L264-L264) "- Lifecycle: Start → Listen on port → Emit service:ready → Handle requests → Shutdown"
  - - **Risk:** Port conflicts between 4 services (Source: Metadata/RUNBOOK_6_METADATA.md:L393-L393) "- **Risk:** Port conflicts between 4 services"
  - - Mitigation: Orchestrator checks port availability before spawn (Source: Metadata/RUNBOOK_6_METADATA.md:L397-L397) "- Mitigation: Orchestrator checks port availability before spawn"
  - **Template Service (Port 3006):** (Source: Metadata/RUNBOOK_6_METADATA.md:L507-L507) "**Template Service (Port 3006):**"
  - **Analysis Service (Port 3007):** (Source: Metadata/RUNBOOK_6_METADATA.md:L512-L512) "**Analysis Service (Port 3007):**"
  - **Citation Service (Port 3004):** (Source: Metadata/RUNBOOK_6_METADATA.md:L517-L517) "**Citation Service (Port 3004):**"
  - **Evidence Service (Port 3005):** (Source: Metadata/RUNBOOK_6_METADATA.md:L523-L523) "**Evidence Service (Port 3005):**"
  - 2. **Don't skip file cleanup:** Evidence Service must handle orphaned files (Source: Metadata/RUNBOOK_6_METADATA.md:L549-L549) "2. **Don't skip file cleanup:** Evidence Service must handle orphaned files"
  - - [ ] IPC lifecycle events emitted (Source: Metadata/RUNBOOK_6_METADATA.md:L561-L561) "- [ ] IPC lifecycle events emitted"
- Filesystem paths/formats
  - evidence-456.pdf (Source: Metadata/RUNBOOK_6_METADATA.md:L248-L248) "- Example: `/tmp/evidence/case-123/evidence-456.pdf`"
  - test.pdf (Source: Metadata/RUNBOOK_6_METADATA.md:L358-L358) "- Command: `curl -X POST http://localhost:3005/api/evidence -F "file=@test.pdf" -F "case_id=xxx" -F "type=exhibit" -F "title=Test"`"
- Process lifecycle (if any)
  - **Each Service:** - Spawned by: Desktop Orchestrator (Runbook 7) - Runtime: Node.js (Citation/Evidence/Template) or Python (Analysis) - Lifecycle: Start → Listen on port → Emit service:ready → Handle requests → Shutdown

## Contracts Defined or Used
- REST POST /api/citations/parse (Source: Metadata/RUNBOOK_6_METADATA.md:L108-L108) "- From: Renderer/Ingestion → To: Citation Service → **POST /api/citations/parse**"
- REST POST /api/citations/validate (Source: Metadata/RUNBOOK_6_METADATA.md:L129-L129) "- From: Renderer → To: Citation Service → **POST /api/citations/validate**"
- REST GET /health (Source: Metadata/RUNBOOK_6_METADATA.md:L135-L135) "- From: ANY → To: Citation Service → **GET /health**"
- REST POST /api/evidence (Source: Metadata/RUNBOOK_6_METADATA.md:L140-L140) "- From: Renderer → To: Evidence Service → **POST /api/evidence**"
- REST GET /api/evidence/:id (Source: Metadata/RUNBOOK_6_METADATA.md:L150-L150) "- From: Renderer → To: Evidence Service → **GET /api/evidence/:id**"
- REST GET /api/evidence/case/:caseId (Source: Metadata/RUNBOOK_6_METADATA.md:L156-L156) "- From: Renderer → To: Evidence Service → **GET /api/evidence/case/:caseId**"
- REST DELETE /api/evidence/:id (Source: Metadata/RUNBOOK_6_METADATA.md:L162-L162) "- From: Renderer → To: Evidence Service → **DELETE /api/evidence/:id**"
- REST GET /health (Source: Metadata/RUNBOOK_6_METADATA.md:L168-L168) "- From: ANY → To: Evidence Service → **GET /health**"
- REST POST /api/templates/fill (Source: Metadata/RUNBOOK_6_METADATA.md:L173-L173) "- From: Records Service/Renderer → To: Template Service → **POST /api/templates/fill**"
- REST POST /api/templates/extract-variables (Source: Metadata/RUNBOOK_6_METADATA.md:L185-L185) "- From: Renderer → To: Template Service → **POST /api/templates/extract-variables**"
- REST GET /health (Source: Metadata/RUNBOOK_6_METADATA.md:L192-L192) "- From: ANY → To: Template Service → **GET /health**"
- REST POST /analyze (Source: Metadata/RUNBOOK_6_METADATA.md:L197-L197) "- From: Renderer → To: Analysis Service → **POST /analyze**"
- REST GET /health (Source: Metadata/RUNBOOK_6_METADATA.md:L221-L221) "- From: ANY → To: Analysis Service → **GET /health**"
- IPC 1. **Citation Service** (port 3004) (Source: Metadata/RUNBOOK_6_METADATA.md:L12-L12) "1. **Citation Service** (port 3004)"
- IPC 2. **Evidence Service** (port 3005) (Source: Metadata/RUNBOOK_6_METADATA.md:L17-L17) "2. **Evidence Service** (port 3005)"
- IPC 3. **Template Service** (port 3006) (Source: Metadata/RUNBOOK_6_METADATA.md:L22-L22) "3. **Template Service** (port 3006)"
- IPC 4. **Analysis Service** (port 3007) (Source: Metadata/RUNBOOK_6_METADATA.md:L27-L27) "4. **Analysis Service** (port 3007)"
- IPC - `PORT`: 3004 (Source: Metadata/RUNBOOK_6_METADATA.md:L76-L76) "- `PORT`: 3004"
- IPC - `PORT`: 3005 (Source: Metadata/RUNBOOK_6_METADATA.md:L80-L80) "- `PORT`: 3005"
- IPC - `PORT`: 3006 (Source: Metadata/RUNBOOK_6_METADATA.md:L86-L86) "- `PORT`: 3006"
- IPC - `PORT`: 3007 (Source: Metadata/RUNBOOK_6_METADATA.md:L89-L89) "- `PORT`: 3007"
- IPC **Citation Service (Port 3004):** (Source: Metadata/RUNBOOK_6_METADATA.md:L106-L106) "**Citation Service (Port 3004):**"
- IPC **Evidence Service (Port 3005):** (Source: Metadata/RUNBOOK_6_METADATA.md:L138-L138) "**Evidence Service (Port 3005):**"
- IPC **Template Service (Port 3006):** (Source: Metadata/RUNBOOK_6_METADATA.md:L171-L171) "**Template Service (Port 3006):**"
- IPC **Analysis Service (Port 3007):** (Source: Metadata/RUNBOOK_6_METADATA.md:L195-L195) "**Analysis Service (Port 3007):**"
- IPC #### IPC Channels (All Services) (Source: Metadata/RUNBOOK_6_METADATA.md:L224-L224) "#### IPC Channels (All Services)"
- IPC - Payload: `{ service: string, port: number, timestamp: string }` (Source: Metadata/RUNBOOK_6_METADATA.md:L229-L229) "- Payload: `{ service: string, port: number, timestamp: string }`"
- IPC - Example: `{ service: "citation", port: 3004, timestamp: "..." }` (Source: Metadata/RUNBOOK_6_METADATA.md:L231-L231) "- Example: `{ service: "citation", port: 3004, timestamp: "..." }`"
- IPC - Lifecycle: Start → Listen on port → Emit service:ready → Handle requests → Shutdown (Source: Metadata/RUNBOOK_6_METADATA.md:L264-L264) "- Lifecycle: Start → Listen on port → Emit service:ready → Handle requests → Shutdown"
- IPC - **Risk:** Port conflicts between 4 services (Source: Metadata/RUNBOOK_6_METADATA.md:L393-L393) "- **Risk:** Port conflicts between 4 services"
- IPC - Mitigation: Orchestrator checks port availability before spawn (Source: Metadata/RUNBOOK_6_METADATA.md:L397-L397) "- Mitigation: Orchestrator checks port availability before spawn"
- IPC **Template Service (Port 3006):** (Source: Metadata/RUNBOOK_6_METADATA.md:L507-L507) "**Template Service (Port 3006):**"
- IPC **Analysis Service (Port 3007):** (Source: Metadata/RUNBOOK_6_METADATA.md:L512-L512) "**Analysis Service (Port 3007):**"
- IPC **Citation Service (Port 3004):** (Source: Metadata/RUNBOOK_6_METADATA.md:L517-L517) "**Citation Service (Port 3004):**"
- IPC **Evidence Service (Port 3005):** (Source: Metadata/RUNBOOK_6_METADATA.md:L523-L523) "**Evidence Service (Port 3005):**"
- IPC 2. **Don't skip file cleanup:** Evidence Service must handle orphaned files (Source: Metadata/RUNBOOK_6_METADATA.md:L549-L549) "2. **Don't skip file cleanup:** Evidence Service must handle orphaned files"
- IPC - [ ] IPC lifecycle events emitted (Source: Metadata/RUNBOOK_6_METADATA.md:L561-L561) "- [ ] IPC lifecycle events emitted"
- Schema LegalDocument (Source: Metadata/RUNBOOK_6_METADATA.md:L64-L64) "- Runbook 1: `@factsway/shared-types` (LegalDocument, Citation types)"
- Schema LegalDocument (Source: Metadata/RUNBOOK_6_METADATA.md:L177-L177) ""template": LegalDocument,"
- Schema LegalDocument (Source: Metadata/RUNBOOK_6_METADATA.md:L181-L181) "- Response: `LegalDocument` (template with variables replaced)"
- Schema LegalDocument (Source: Metadata/RUNBOOK_6_METADATA.md:L186-L186) "- Request: `{ template: LegalDocument }`"
- Schema LegalDocument (Source: Metadata/RUNBOOK_6_METADATA.md:L198-L198) "- Request: `{ document: LegalDocument }`"
- Schema LegalDocument (Source: Metadata/RUNBOOK_6_METADATA.md:L312-L312) "- INVARIANT: Variable replacement preserves LegalDocument structure"
- Schema LegalDocument (Source: Metadata/RUNBOOK_6_METADATA.md:L372-L372) "- Expected: 200 OK + LegalDocument with {{plaintiff}} replaced by "John""
- Schema LegalDocument (Source: Metadata/RUNBOOK_6_METADATA.md:L510-L510) "- CRITICAL: Preserve LegalDocument structure (only modify text, not hierarchy)"
- Schema type must (Source: Metadata/RUNBOOK_6_METADATA.md:L532-L532) "- **Type validation (HARD):** Citation type must be valid enum value"
- Schema LegalDocument (Source: Metadata/RUNBOOK_6_METADATA.md:L540-L540) "- **Structure preservation (HARD):** LegalDocument hierarchy unchanged after filling"
- File evidence-456.pdf (Source: Metadata/RUNBOOK_6_METADATA.md:L248-L248) "- Example: `/tmp/evidence/case-123/evidence-456.pdf`"
- File test.pdf (Source: Metadata/RUNBOOK_6_METADATA.md:L358-L358) "- Command: `curl -X POST http://localhost:3005/api/evidence -F "file=@test.pdf" -F "case_id=xxx" -F "type=exhibit" -F "title=Test"`"

## Invariants Relied On
- - INVARIANT: Parsed citations match original text (Source: Metadata/RUNBOOK_6_METADATA.md:L270-L270) "- INVARIANT: Parsed citations match original text"
- - INVARIANT: Citation types are valid enum values (Source: Metadata/RUNBOOK_6_METADATA.md:L278-L278) "- INVARIANT: Citation types are valid enum values"
- - INVARIANT: Uploaded files are stored before database record created (Source: Metadata/RUNBOOK_6_METADATA.md:L287-L287) "- INVARIANT: Uploaded files are stored before database record created"
- - INVARIANT: File paths are unique per evidence item (Source: Metadata/RUNBOOK_6_METADATA.md:L295-L295) "- INVARIANT: File paths are unique per evidence item"
- - INVARIANT: Deleted evidence removes both file and database record (Source: Metadata/RUNBOOK_6_METADATA.md:L302-L302) "- INVARIANT: Deleted evidence removes both file and database record"
- - INVARIANT: Variable replacement preserves LegalDocument structure (Source: Metadata/RUNBOOK_6_METADATA.md:L312-L312) "- INVARIANT: Variable replacement preserves LegalDocument structure"
- - INVARIANT: All template variables are replaced or error returned (Source: Metadata/RUNBOOK_6_METADATA.md:L320-L320) "- INVARIANT: All template variables are replaced or error returned"
- - INVARIANT: Word/sentence/paragraph counts match document structure (Source: Metadata/RUNBOOK_6_METADATA.md:L330-L330) "- INVARIANT: Word/sentence/paragraph counts match document structure"
- - INVARIANT: Readability scores are within valid ranges (Source: Metadata/RUNBOOK_6_METADATA.md:L338-L338) "- INVARIANT: Readability scores are within valid ranges"
- 3. File storage (Evidence Service) requires careful invariant enforcement (Source: Metadata/RUNBOOK_6_METADATA.md:L494-L494) "3. File storage (Evidence Service) requires careful invariant enforcement"

## Verification Gate (Commands + Expected Outputs)
- - Purpose: Verify case citation parsing (Source: Metadata/RUNBOOK_6_METADATA.md:L351-L351) "- Purpose: Verify case citation parsing"
- - Purpose: Verify citation validation (Source: Metadata/RUNBOOK_6_METADATA.md:L355-L355) "- Purpose: Verify citation validation"
- - Purpose: Verify file upload (Source: Metadata/RUNBOOK_6_METADATA.md:L360-L360) "- Purpose: Verify file upload"
- - Purpose: Verify file retrieval (Source: Metadata/RUNBOOK_6_METADATA.md:L364-L364) "- Purpose: Verify file retrieval"
- - Purpose: Verify file storage (Source: Metadata/RUNBOOK_6_METADATA.md:L368-L368) "- Purpose: Verify file storage"
- - Purpose: Verify variable substitution (Source: Metadata/RUNBOOK_6_METADATA.md:L373-L373) "- Purpose: Verify variable substitution"
- - Purpose: Verify variable extraction (Source: Metadata/RUNBOOK_6_METADATA.md:L377-L377) "- Purpose: Verify variable extraction"
- - Purpose: Verify document analysis (Source: Metadata/RUNBOOK_6_METADATA.md:L382-L382) "- Purpose: Verify document analysis"
- - Purpose: Verify all services operational (Source: Metadata/RUNBOOK_6_METADATA.md:L387-L387) "- Purpose: Verify all services operational"

## Risks / Unknowns (TODOs)
- - **Risk:** Port conflicts between 4 services (Source: Metadata/RUNBOOK_6_METADATA.md:L393-L393) "- **Risk:** Port conflicts between 4 services"
- - **Risk:** Citation parser fails for complex citations (Source: Metadata/RUNBOOK_6_METADATA.md:L401-L401) "- **Risk:** Citation parser fails for complex citations"
- - **Risk:** Evidence file storage fills disk (Source: Metadata/RUNBOOK_6_METADATA.md:L411-L411) "- **Risk:** Evidence file storage fills disk"
- - **Risk:** Evidence files deleted but DB records remain (orphaned metadata) (Source: Metadata/RUNBOOK_6_METADATA.md:L422-L422) "- **Risk:** Evidence files deleted but DB records remain (orphaned metadata)"
- - **Risk:** Template variable replacement breaks document structure (Source: Metadata/RUNBOOK_6_METADATA.md:L430-L430) "- **Risk:** Template variable replacement breaks document structure"
- - **Risk:** 4 services increase startup time complexity (Source: Metadata/RUNBOOK_6_METADATA.md:L440-L440) "- **Risk:** 4 services increase startup time complexity"
- - **Risk:** One service crashes, others continue (partial system failure) (Source: Metadata/RUNBOOK_6_METADATA.md:L448-L448) "- **Risk:** One service crashes, others continue (partial system failure)"
- - **Risk:** Analysis service slow for large documents (200+ pages) (Source: Metadata/RUNBOOK_6_METADATA.md:L461-L461) "- **Risk:** Analysis service slow for large documents (200+ pages)"
- - **Risk:** Evidence file uploads timeout for large files (Source: Metadata/RUNBOOK_6_METADATA.md:L469-L469) "- **Risk:** Evidence file uploads timeout for large files"
- - **Risk:** Renderer doesn't know which services are available (Source: Metadata/RUNBOOK_6_METADATA.md:L479-L479) "- **Risk:** Renderer doesn't know which services are available"
