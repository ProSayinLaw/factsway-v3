---

## Metadata Summary

### Purpose
Create 4 specialized microservices (Citation, Evidence, Template, Analysis) providing domain-specific functionality for legal document processing, each with single responsibility and REST API.

### Produces (Artifacts)

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

### Consumes (Prerequisites)

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

### Interfaces Touched

#### REST Endpoints by Service

**Citation Service (Port 3004):**

- From: Renderer/Ingestion → To: Citation Service → **POST /api/citations/parse**
  - Request: `{ text: string }` (paragraph or sentence containing citations)
  - Response: `ParsedCitation[]` (array of detected citations)
  - Example Response:
    ```json
    [
      {
        "type": "case",
        "text": "Smith v. Jones, 123 F.3d 456 (5th Cir. 2020)",
        "case_name": "Smith v. Jones",
        "volume": "123",
        "reporter": "F.3d",
        "page": "456",
        "court": "5th Cir.",
        "year": "2020"
      }
    ]
    ```
  - Purpose: Extract legal citations from text
  - Status Codes: 200 (success), 400 (invalid input)

- From: Renderer → To: Citation Service → **POST /api/citations/validate**
  - Request: `{ citation: ParsedCitation }` (citation to validate)
  - Response: `{ valid: boolean, errors?: string[] }`
  - Purpose: Validate citation format (Bluebook rules)
  - Status Codes: 200 (success)

- From: ANY → To: Citation Service → **GET /health**
  - Response: `{ status: "healthy", service: "citation" }`

**Evidence Service (Port 3005):**

- From: Renderer → To: Evidence Service → **POST /api/evidence**
  - Request: `multipart/form-data` with fields:
    - `file`: File upload (PDF/DOCX/image)
    - `case_id`: UUID (which case this evidence belongs to)
    - `type`: "exhibit"|"case_law"|"document"
    - `title`: string
  - Response: `Evidence` (created evidence object with file_path)
  - Purpose: Upload evidence file and create metadata record
  - Status Codes: 201 (created), 400 (invalid file), 413 (file too large)

- From: Renderer → To: Evidence Service → **GET /api/evidence/:id**
  - Request: Path param: `id` (evidence UUID)
  - Response: Binary file stream + metadata headers
  - Purpose: Download evidence file
  - Status Codes: 200 (success), 404 (not found)

- From: Renderer → To: Evidence Service → **GET /api/evidence/case/:caseId**
  - Request: Path param: `caseId`
  - Response: `Evidence[]` (all evidence for this case)
  - Purpose: List all evidence for a case
  - Status Codes: 200 (success)

- From: Renderer → To: Evidence Service → **DELETE /api/evidence/:id**
  - Request: Path param: `id`
  - Response: `{ success: true }`
  - Purpose: Delete evidence file and metadata
  - Status Codes: 204 (deleted), 404 (not found)

- From: ANY → To: Evidence Service → **GET /health**
  - Response: `{ status: "healthy", service: "evidence" }`

**Template Service (Port 3006):**

- From: Records Service/Renderer → To: Template Service → **POST /api/templates/fill**
  - Request: 
    ```json
    {
      "template": LegalDocument,
      "variables": { "plaintiff": "John Doe", "defendant": "Jane Smith", ... }
    }
    ```
  - Response: `LegalDocument` (template with variables replaced)
  - Purpose: Fill template with case-specific values
  - Status Codes: 200 (success), 400 (missing variables)

- From: Renderer → To: Template Service → **POST /api/templates/extract-variables**
  - Request: `{ template: LegalDocument }`
  - Response: `{ variables: string[] }` (list of variable names found in template)
  - Example: `{ variables: ["{{plaintiff}}", "{{defendant}}", "{{case_number}}"] }`
  - Purpose: Discover which variables exist in a template
  - Status Codes: 200 (success)

- From: ANY → To: Template Service → **GET /health**
  - Response: `{ status: "healthy", service: "template" }`

**Analysis Service (Port 3007):**

- From: Renderer → To: Analysis Service → **POST /analyze**
  - Request: `{ document: LegalDocument }`
  - Response: 
    ```json
    {
      "word_count": 5432,
      "sentence_count": 234,
      "paragraph_count": 67,
      "section_count": 12,
      "citation_count": 45,
      "readability": {
        "flesch_reading_ease": 45.2,
        "flesch_kincaid_grade": 12.5,
        "gunning_fog": 14.3
      },
      "sections": [
        { "title": "Introduction", "word_count": 234, "sentence_count": 12 },
        ...
      ]
    }
    ```
  - Purpose: Analyze document metrics and readability
  - Status Codes: 200 (success), 400 (invalid document)

- From: ANY → To: Analysis Service → **GET /health**
  - Response: `{ status: "healthy", service: "analysis" }`

#### IPC Channels (All Services)

**Service Lifecycle Events (each service emits):**

- From: [Service] → To: Desktop Orchestrator → **Event: service:ready**
  - Payload: `{ service: string, port: number, timestamp: string }`
  - Purpose: Signal service startup complete
  - Example: `{ service: "citation", port: 3004, timestamp: "..." }`

- From: [Service] → To: Desktop Orchestrator → **Event: service:error**
  - Payload: `{ service: string, error: string, timestamp: string }`
  - Purpose: Signal critical error
  - Example: `{ service: "evidence", error: "Storage path not writable", ... }`

- From: [Service] → To: Desktop Orchestrator → **Event: service:shutdown**
  - Payload: `{ service: string, reason: string, timestamp: string }`
  - Purpose: Graceful shutdown notification

#### Filesystem

**Evidence Service File Storage:**

**Creates:**
- Path: `$EVIDENCE_STORAGE_PATH/{case_id}/{evidence_id}.{ext}` (uploaded files)
  - Example: `/tmp/evidence/case-123/evidence-456.pdf`

**Reads:**
- Path: Same directory for file retrieval

**Modifies:**
- Path: Deletes files when evidence deleted

**All Other Services:**
- No persistent file storage (stateless services)

#### Process Lifecycle

**Each Service:**
- Spawned by: Desktop Orchestrator (Runbook 7)
- Runtime: Node.js (Citation/Evidence/Template) or Python (Analysis)
- Lifecycle: Start → Listen on port → Emit service:ready → Handle requests → Shutdown

### Invariants

**Citation Service Invariants:**

- INVARIANT: Parsed citations match original text
  - Rule: `ParsedCitation.text` is substring of input text
  - Enforced by: Parser validation
  - Purpose: No hallucinated citations
  - Violation: Citation text doesn't appear in original
  - Detection: Substring check fails
  - Recovery: Return error, don't create citation

- INVARIANT: Citation types are valid enum values
  - Rule: `type` in ["case", "statute", "regulation", "constitutional"]
  - Enforced by: TypeScript enum
  - Purpose: Consistent citation categorization
  - Violation: TypeScript compiler error
  - Recovery: None (compile-time enforcement)

**Evidence Service Invariants:**

- INVARIANT: Uploaded files are stored before database record created
  - Rule: File written to disk, THEN metadata saved to DB
  - Enforced by: Service logic (file upload → DB insert sequence)
  - Purpose: No orphaned database records without files
  - Violation: Database record exists but file missing
  - Detection: File retrieval fails (404)
  - Recovery: Delete database record (cleanup job)

- INVARIANT: File paths are unique per evidence item
  - Rule: `{case_id}/{evidence_id}.{ext}` format ensures uniqueness
  - Enforced by: File naming convention
  - Purpose: No file overwrites
  - Violation: File collision (should never happen with UUIDs)
  - Recovery: None (UUID collision probability <1 in 2^122)

- INVARIANT: Deleted evidence removes both file and database record
  - Rule: DELETE endpoint removes file from disk AND database row
  - Enforced by: Transaction-like logic (delete file → delete DB, rollback if either fails)
  - Purpose: No orphaned files or metadata
  - Violation: File exists without DB record, or vice versa
  - Detection: Cleanup job finds mismatches
  - Recovery: Delete orphaned file or DB record

**Template Service Invariants:**

- INVARIANT: Variable replacement preserves LegalDocument structure
  - Rule: Template filling replaces {{var}} in paragraph text but doesn't change section hierarchy
  - Enforced by: Filling logic only modifies text content, not structure
  - Purpose: Document structure remains intact
  - Violation: Sections disappear, IDs change
  - Detection: Structure comparison before/after
  - Recovery: Re-run filling with correct logic

- INVARIANT: All template variables are replaced or error returned
  - Rule: If variables provided, all must be used; missing variables return 400
  - Enforced by: Variable extraction + comparison
  - Purpose: Complete document (no {{missing}} placeholders)
  - Violation: Template has unreplaced {{var}}
  - Detection: Regex search for {{ in output
  - Recovery: Return error, prompt user for missing values

**Analysis Service Invariants:**

- INVARIANT: Word/sentence/paragraph counts match document structure
  - Rule: Sum of section counts = total document count
  - Enforced by: Traversal logic counts all elements
  - Purpose: Accurate metrics
  - Violation: Counts don't sum correctly
  - Detection: Math validation (sum of parts = total)
  - Recovery: Re-run analysis, fix counting logic

- INVARIANT: Readability scores are within valid ranges
  - Rule: Flesch Reading Ease: 0-100, Flesch-Kincaid Grade: 0-18
  - Enforced by: textstat library (Python)
  - Purpose: Valid readability metrics
  - Violation: Out-of-range scores
  - Detection: Range check
  - Recovery: Return null for invalid scores, log warning

### Verification Gates

**Citation Service Verification:**
- Command: `curl -X POST http://localhost:3004/api/citations/parse -d '{"text":"Smith v. Jones, 123 F.3d 456 (5th Cir. 2020)"}'`
- Expected: 200 OK + ParsedCitation with case_name="Smith v. Jones"
- Purpose: Verify case citation parsing

- Command: `curl -X POST http://localhost:3004/api/citations/validate -d '{"citation":{...}}'`
- Expected: 200 OK + `{"valid": true}` or `{"valid": false, "errors": [...]}`
- Purpose: Verify citation validation

**Evidence Service Verification:**
- Command: `curl -X POST http://localhost:3005/api/evidence -F "file=@test.pdf" -F "case_id=xxx" -F "type=exhibit" -F "title=Test"`
- Expected: 201 Created + Evidence object with file_path
- Purpose: Verify file upload

- Command: `curl http://localhost:3005/api/evidence/{id}`
- Expected: 200 OK + file download (binary stream)
- Purpose: Verify file retrieval

- Command: `ls $EVIDENCE_STORAGE_PATH/case-xxx/`
- Expected: File exists on disk
- Purpose: Verify file storage

**Template Service Verification:**
- Command: `curl -X POST http://localhost:3006/api/templates/fill -d '{"template":{...}, "variables":{"plaintiff":"John"}}'`
- Expected: 200 OK + LegalDocument with {{plaintiff}} replaced by "John"
- Purpose: Verify variable substitution

- Command: `curl -X POST http://localhost:3006/api/templates/extract-variables -d '{"template":{...}}'`
- Expected: 200 OK + `{"variables": ["{{plaintiff}}", "{{defendant}}"]}`
- Purpose: Verify variable extraction

**Analysis Service Verification:**
- Command: `curl -X POST http://localhost:3007/analyze -d '{"document":{...}}'`
- Expected: 200 OK + metrics object with word_count, readability, etc.
- Purpose: Verify document analysis

**All Services Health Check:**
- Command: `curl http://localhost:3004/health && curl http://localhost:3005/health && curl http://localhost:3006/health && curl http://localhost:3007/health`
- Expected: All return 200 OK + healthy status
- Purpose: Verify all services operational

### Risks

**Technical Risks:**

- **Risk:** Port conflicts between 4 services
  - Severity: HIGH
  - Likelihood: LOW (orchestrator manages ports)
  - Impact: One or more services fail to start
  - Mitigation: Orchestrator checks port availability before spawn
  - Detection: EADDRINUSE errors
  - Recovery: Reassign ports, restart services

- **Risk:** Citation parser fails for complex citations
  - Severity: MEDIUM
  - Likelihood: MEDIUM (legal citations are complex)
  - Impact: Citations not recognized, linking fails
  - Mitigation: Comprehensive test suite with real citations, fallback to simple text extraction
  - Detection: Parser returns empty array or invalid citations
  - Recovery: Log failed citation, manual review

**Data Risks:**

- **Risk:** Evidence file storage fills disk
  - Severity: HIGH
  - Likelihood: MEDIUM (users upload large PDFs)
  - Impact: No more uploads, service crashes
  - Mitigation:
    - Monitor disk usage (alert at 80% capacity)
    - Set MAX_FILE_SIZE=50MB
    - Implement cleanup job (delete old evidence after 1 year)
  - Detection: Disk full errors, upload failures
  - Recovery: Delete old files, expand storage

- **Risk:** Evidence files deleted but DB records remain (orphaned metadata)
  - Severity: MEDIUM
  - Likelihood: MEDIUM (file deletion can fail)
  - Impact: 404 errors when trying to download
  - Mitigation: Cleanup job finds orphaned records (file_path exists in DB but file missing)
  - Detection: File not found errors
  - Recovery: Delete orphaned DB records

- **Risk:** Template variable replacement breaks document structure
  - Severity: HIGH
  - Likelihood: LOW
  - Impact: Sections disappear, document corrupted
  - Mitigation: Validate document structure after filling (section count, hierarchy intact)
  - Detection: Structure validation fails
  - Recovery: Re-run filling, fix logic

**Operational Risks:**

- **Risk:** 4 services increase startup time complexity
  - Severity: MEDIUM
  - Likelihood: HIGH (more services = more startup coordination)
  - Impact: Slow app startup, race conditions
  - Mitigation: Orchestrator waits for all service:ready events before allowing user interaction
  - Detection: App hangs on startup
  - Recovery: Restart orchestrator, check service logs

- **Risk:** One service crashes, others continue (partial system failure)
  - Severity: HIGH
  - Likelihood: MEDIUM
  - Impact: Features unavailable (e.g., evidence upload broken but drafting works)
  - Mitigation:
    - Orchestrator monitors all services via health checks
    - Auto-restart crashed services
    - UI shows which features are unavailable
  - Detection: Health check fails, service:error event
  - Recovery: Restart failed service

**Performance Risks:**

- **Risk:** Analysis service slow for large documents (200+ pages)
  - Severity: MEDIUM
  - Likelihood: MEDIUM
  - Impact: Long wait times for document metrics
  - Mitigation: Implement timeout (30s), cache results, async processing
  - Detection: Slow response times
  - Recovery: Increase timeout, optimize counting algorithms

- **Risk:** Evidence file uploads timeout for large files
  - Severity: MEDIUM
  - Likelihood: MEDIUM (50MB PDFs take time)
  - Impact: Upload failures, poor UX
  - Mitigation: Streaming uploads, progress indicators, chunked transfer
  - Detection: Timeout errors
  - Recovery: Retry upload, reduce MAX_FILE_SIZE

**Integration Risks:**

- **Risk:** Renderer doesn't know which services are available
  - Severity: HIGH
  - Likelihood: LOW (Runbook 9 handles this)
  - Impact: Renderer tries to call unavailable service, errors
  - Mitigation: Service discovery (Runbook 9) provides service registry
  - Detection: Connection refused errors
  - Recovery: Renderer checks service availability before calling

## Template Notes

**Implementation Priority:** MEDIUM - Domain-specific functionality, not blocking critical path

**Before Starting Implementation:**
1. Study all 4 services together - they're independent but follow same pattern
2. Each service has single responsibility (citation, evidence, template, analysis)
3. File storage (Evidence Service) requires careful invariant enforcement
4. Citation parsing is complex - start with simple patterns, add complexity iteratively

**LLM-Assisted Implementation Strategy:**

**Service Priority Order:**
1. **Template Service** (simplest: variable substitution)
2. **Analysis Service** (metrics calculation, no external dependencies)
3. **Citation Service** (complex regex, but deterministic)
4. **Evidence Service** (file storage adds complexity)

**Per-Service Implementation:**

**Template Service (Port 3006):**
- Implement variable extraction: Find all `{{variable}}` patterns
- Implement variable filling: Replace `{{variable}}` with values
- CRITICAL: Preserve LegalDocument structure (only modify text, not hierarchy)

**Analysis Service (Port 3007):**
- Count words/sentences/paragraphs (straightforward traversal)
- Calculate readability scores (use textstat library)
- Test with real documents to validate accuracy

**Citation Service (Port 3004):**
- Start with simple case citations: "X v. Y, 123 F.3d 456 (5th Cir. 2020)"
- Add statute citations: "42 U.S.C. § 1983"
- Test with comprehensive citation test suite
- CRITICAL: Parsed citation text must appear in original (no hallucination)

**Evidence Service (Port 3005):**
- Implement file upload (multipart/form-data)
- Store files with UUID naming scheme
- CRITICAL: File storage invariants (file on disk BEFORE database record)

**Critical Invariants to Enforce:**

**Citation Service:**
- **Text matching (HARD):** Parsed citation.text must be substring of input
- **Type validation (HARD):** Citation type must be valid enum value

**Evidence Service:**
- **Storage order (HARD):** File written to disk BEFORE database INSERT
- **Path uniqueness (HARD):** `{case_id}/{evidence_id}.{ext}` prevents collisions
- **Deletion completeness (HARD):** DELETE removes both file AND database record

**Template Service:**
- **Structure preservation (HARD):** LegalDocument hierarchy unchanged after filling
- **Complete replacement (HARD):** All {{variables}} replaced or error returned

**Analysis Service:**
- **Count accuracy (HARD):** Sum of section counts = total document count
- **Score validity (HARD):** Readability scores within valid ranges

**Common LLM Pitfalls to Avoid:**
1. **Don't share state between services:** Each service is independent (separate ports, processes)
2. **Don't skip file cleanup:** Evidence Service must handle orphaned files
3. **Don't over-complicate citation parsing:** Start simple, add patterns incrementally
4. **Don't assume variable names:** Template Service must discover variables dynamically

**Validation Checklist (All 4 Services):**
- [ ] All 4 services start independently
- [ ] Health checks respond on all 4 ports (3004-3007)
- [ ] Citation parsing handles case/statute/regulation
- [ ] Evidence upload/download works
- [ ] Template filling preserves structure
- [ ] Analysis metrics accurate
- [ ] All 12 REST endpoints functional (3 per service)
- [ ] IPC lifecycle events emitted

**Handoff to Next Runbook:**
- Runbook 7 (Orchestrator) will manage all 8 services (4 from this runbook + 4 previous)
- Renderer (Runbook 8) will call these services from UI
- Any service failures must be gracefully handled by Orchestrator

---

**End of Metadata for Runbook 6**
