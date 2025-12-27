# Template Notes Content for All Metadata Files

**Purpose:** These Template Notes sections will be added to each metadata file to guide LLM-assisted implementation.

**Format:** Copy the appropriate Template Notes section and insert it at the END of each metadata file (before "End of Metadata").

---

## Template Notes for RUNBOOK_1_METADATA.md

```markdown
## Template Notes

**Implementation Priority:** CRITICAL - All other runbooks depend on this type system

**Before Starting Implementation:**
1. Read Runbook 0 Section 4 (LegalDocument Schema) in parallel with this metadata
2. Verify every type definition matches the canonical schema exactly
3. Set up TypeScript strict mode from the start (no shortcuts)
4. This is the contract layer - get it wrong and everything breaks

**LLM-Assisted Implementation Strategy:**

**Step 1: Type Hierarchy (Bottom-Up)**
- Start with leaf types: `UUID`, `Offset`, `CitationReference`
- Then build up: `Sentence` → `Paragraph` → `Section` → `LegalDocument`
- Verify each type compiles before moving to next level
- Use the line count estimates (Produces section) to gauge completeness

**Step 2: Invariant Validation**
- Each invariant in this metadata should become a TypeScript type constraint where possible
- Example: "Section.id must be UUID" → Use `id: UUID` type (branded string)
- Where TypeScript can't enforce (e.g., offset ranges), document in JSDoc

**Step 3: Verification Gates**
- Run EACH verification gate after completing its corresponding section
- Don't accumulate "I'll test it all at the end" technical debt
- The 6 verification gates are your progress checkpoints

**Critical Invariants to Enforce:**
- **Type safety (HARD):** Every field has explicit type, no `any`, no implicit `undefined`
- **Structural completeness (HARD):** All fields from Runbook 0 Section 4 present
- **UUID format (HARD):** Use branded string types for UUID validation
- **Offset integrity (HARD):** Sentence offsets must be numbers (validation happens at ingestion)

**Common LLM Pitfalls to Avoid:**
1. **Don't over-engineer:** LegalDocument is a data transfer object, not a class with methods
2. **Don't add fields:** Only include fields from Runbook 0 Section 4 (resist "improvements")
3. **Don't skip optionality:** `content_json?` vs `content_json` matters - get it right
4. **Don't forget exports:** Package must export all types (check package.json exports field)

**Validation Checklist (Before Proceeding to Runbook 2):**
- [ ] All 10 TypeScript files created (check file count in Produces section)
- [ ] ~1,010 lines total (within 10% is acceptable)
- [ ] `npm run build` succeeds with zero errors
- [ ] `npm run test` passes (type validation tests)
- [ ] `tsc --noEmit --strict` passes (strictest TypeScript check)
- [ ] Package published locally (verify with `npm link`)
- [ ] All 6 verification gates executed and passed

**Handoff to Next Runbook:**
- Runbook 2 (Database Schema) will import these types
- Any type errors in Runbook 2 mean you need to fix Runbook 1 first
- Database schema columns must match LegalDocument type fields exactly
```

---

## Template Notes for RUNBOOK_2_METADATA.md

```markdown
## Template Notes

**Implementation Priority:** CRITICAL - All services need database access

**Before Starting Implementation:**
1. Verify Runbook 1 (`@factsway/shared-types`) is complete and importable
2. Set up both SQLite and PostgreSQL locally for testing
3. Understand dual storage pattern (document_json + content_json) from Runbook 0 Section 2.5
4. This creates the data layer - schema mistakes are expensive to fix later

**LLM-Assisted Implementation Strategy:**

**Step 1: Schema Design (SQLite First)**
- Start with SQLite migrations (simpler, faster iteration)
- Create all 6 tables as specified in Produces section
- Use the database table definitions from Runbook 0 Section 2
- Verify column types match LegalDocument types from Runbook 1

**Step 2: PostgreSQL Parity**
- Copy SQLite schema to PostgreSQL
- Add PostgreSQL-specific features (JSONB, GIN indexes)
- Keep schemas synchronized (automated check recommended)

**Step 3: Repository Pattern**
- Implement base repository first (CRUD operations)
- Then specialize for each entity (Template, Case, Draft, Evidence)
- Use TypeScript types from Runbook 1 for type safety
- Verify return types match expected types

**Step 4: Migration Testing**
- Test up migrations (create tables)
- Test down migrations (drop tables)
- Verify idempotency (running twice should work)

**Critical Invariants to Enforce:**
- **Foreign keys (HARD):** All FK constraints must be defined (ON DELETE CASCADE where specified)
- **JSON columns (HARD):** document_json must store valid JSON (test serialization/deserialization)
- **Dual storage (HARD):** document_json is canonical, content_json is optional/nullable
- **Migration order (HARD):** Migrations run sequentially, no skipping

**Common LLM Pitfalls to Avoid:**
1. **Don't diverge schemas:** SQLite and PostgreSQL must have identical structure
2. **Don't skip indexes:** Performance suffers without proper indexes
3. **Don't forget constraints:** NOT NULL, UNIQUE, FK constraints are documented - implement them
4. **Don't ignore migration rollback:** Down migrations must actually work

**Validation Checklist (Before Proceeding to Runbook 3):**
- [ ] SQLite migrations run successfully (up and down)
- [ ] PostgreSQL migrations run successfully (up and down)
- [ ] All 6 tables created with correct columns
- [ ] Foreign key constraints enforced (test by violating them)
- [ ] Repository CRUD tests pass for all 4 entities
- [ ] Dual storage verified (document_json + content_json both work)
- [ ] All 6 verification gates executed and passed

**Handoff to Next Runbook:**
- Runbook 3 (Records Service) will use these repositories
- Any database errors in Runbook 3 mean schema mismatch - fix Runbook 2
- Schema changes after Runbook 3 is implemented are BREAKING CHANGES
```

---

## Template Notes for RUNBOOK_3_METADATA.md

```markdown
## Template Notes

**Implementation Priority:** CRITICAL - First microservice, establishes patterns for all others

**Before Starting Implementation:**
1. Verify Runbook 1 types and Runbook 2 database are complete
2. Study the 18 REST endpoints in Interfaces section - these are your API contract
3. This is the first service - patterns established here propagate to Runbooks 4-6
4. Service must be stateless (database is state, not service memory)

**LLM-Assisted Implementation Strategy:**

**Step 1: Service Bootstrap**
- Set up Express server on port 3001
- Configure middleware (CORS, error handling, logging)
- Implement health check endpoint FIRST (validates server works)

**Step 2: Template CRUD (5 endpoints)**
- Implement all 5 Template endpoints before moving to Cases
- Test each endpoint with curl/Postman as you go
- Verify status codes match specification (200, 201, 404, 400)

**Step 3: Case CRUD (5 endpoints)**
- Same pattern as Templates
- Verify foreign key to template_id works (try invalid template_id)

**Step 4: Draft CRUD (8 endpoints)**
- Most complex: includes versioning and history
- Version increment logic is critical (test concurrent updates)

**Step 5: Integration Testing**
- Test complete workflow: Create Template → Create Case → Create Draft → Update Draft
- Verify cascade deletes work (delete template, check cases/drafts deleted)

**Critical Invariants to Enforce:**
- **API contract (HARD):** Every endpoint must return exact status codes from Interfaces section
- **Foreign keys (HARD):** Invalid template_id/case_id must return 404, not 500
- **Version monotonicity (HARD):** Draft version must increment on every update
- **Response format (HARD):** GET returns arrays, POST returns 201 + object, DELETE returns 204

**Common LLM Pitfalls to Avoid:**
1. **Don't skip validation:** Request body validation prevents garbage in database
2. **Don't return 500 for user errors:** 400 for validation, 404 for not found, 500 only for bugs
3. **Don't forget IPC events:** Emit service:ready on startup (Orchestrator needs this)
4. **Don't hardcode port:** Use PORT environment variable (Orchestrator assigns ports)

**Interface Validation (18 Endpoints):**
For EACH endpoint in Interfaces section:
- [ ] Request schema matches specification
- [ ] Response schema matches specification
- [ ] Status codes match specification
- [ ] Error cases handled (404, 400, 409)

**Validation Checklist (Before Proceeding to Runbook 4):**
- [ ] Service starts on port 3001
- [ ] Health check responds
- [ ] All 18 REST endpoints functional
- [ ] Integration tests pass (40+ test cases)
- [ ] Error handling works (try invalid inputs)
- [ ] IPC events emitted (service:ready on startup)
- [ ] All 7 verification gates executed and passed

**Handoff to Next Runbook:**
- Runbooks 4-6 (other services) will follow this exact pattern
- Any deviations from this structure must be documented
- This is the microservice template - get it right
```

---

## Template Notes for RUNBOOK_4_5_METADATA.md

```markdown
## Template Notes

**Implementation Priority:** HIGH - Critical for document processing pipeline

**Before Starting Implementation:**
1. Understand the 3-stage parsing pipeline (Runbook 4): Deterministic → LLM → Validation
2. Understand DOCX generation requirements (Runbook 5): Legal formatting standards
3. Both services are Python - different pattern from TypeScript services
4. Text integrity invariants are HARD requirements, parsing accuracy is BEST EFFORT

**LLM-Assisted Implementation Strategy:**

**Runbook 4 (Ingestion Service):**

**Step 1: Deterministic Parsing (Stage 1)**
- Implement python-docx parsing first (no LLM)
- Extract sections, paragraphs, sentences using nupunkt
- Aim for 85% accuracy baseline (known failure modes documented)
- Test with real legal documents (motions, briefs)

**Step 2: LLM-Assisted Refinement (Stage 2)**
- Only call LLM for ambiguous cases (confidence <0.9 from Stage 1)
- Implement retry logic for API failures
- Track costs (log every LLM call)
- Validate LLM output (ensure substring invariant)

**Step 3: Validation (Stage 3)**
- CRITICAL: Enforce text extraction invariants (substring check, coverage)
- Hard failure if invariants violated (don't proceed with corrupted data)
- Output valid LegalDocument or error (no partial success)

**Runbook 5 (Export Service):**

**Step 1: Basic DOCX Generation**
- Start with simple: LegalDocument → DOCX with plain text
- Verify all section text appears in output (no text loss)

**Step 2: Legal Formatting**
- Apply styles: Times New Roman 12pt, 1-inch margins, double spacing
- Implement section numbering (1.1.1 hierarchical)
- Add page numbers, headers/footers

**Step 3: Advanced Features**
- Handle complex formatting (lists, indentation)
- Preserve evidence citations (amber highlighting)

**Critical Invariants to Enforce:**

**Runbook 4 (Ingestion):**
- **Sentence = substring (HARD):** `sentence.text === paragraph.text[start:end]` MUST hold
- **Full coverage (HARD):** All paragraph characters assigned to sentences
- **Parsing accuracy (METRIC):** Target >95%, measure with LLM confidence scores

**Runbook 5 (Export):**
- **Text preservation (HARD):** All section text in LegalDocument appears in DOCX
- **Section numbering (HARD):** DOCX numbering matches LegalDocument structure
- **DOCX validity (HARD):** Generated file must open in Word/Google Docs

**Common LLM Pitfalls to Avoid:**
1. **Don't skip substring validation:** This is the sentinel invariant - enforce it
2. **Don't over-rely on LLM:** 85% deterministic is the goal, LLM is fallback
3. **Don't ignore costs:** Log every Anthropic API call (costs add up)
4. **Don't generate invalid DOCX:** Test with Word, not just "it's a .docx file"

**Validation Checklist (Both Services):**

**Runbook 4:**
- [ ] Deterministic parsing achieves ~85% accuracy
- [ ] LLM calls trigger only for ambiguous cases (<15%)
- [ ] Substring invariant enforced (hard failure if violated)
- [ ] Full text coverage verified
- [ ] Real document test suite passes

**Runbook 5:**
- [ ] All sections exported (no text loss)
- [ ] Legal formatting applied (Times New Roman, margins, spacing)
- [ ] Generated DOCX opens in Word
- [ ] Section numbering matches LegalDocument
- [ ] Large documents (200 pages) export successfully

**Handoff to Next Runbook:**
- Runbook 6 (Specialized Services) depends on these working correctly
- Renderer (Runbook 8) calls Export Service for downloads
- Any parsing errors cascade through entire system
```

---

## Template Notes for RUNBOOK_6_METADATA.md

```markdown
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
```

---

## Template Notes for RUNBOOK_7_METADATA.md

```markdown
## Template Notes

**Implementation Priority:** CRITICAL - Nothing works without the Orchestrator

**Before Starting Implementation:**
1. All 8 backend services (Runbooks 3-6) must be complete and runnable
2. Study the 10 IPC channels - these are your Renderer communication contract
3. Service startup order matters - follow the lifecycle specification exactly
4. This is the "conductor" - it doesn't do work, it coordinates workers

**LLM-Assisted Implementation Strategy:**

**Step 1: Basic Electron Setup**
- Create Electron Main process
- Implement window creation (empty window is fine)
- Verify Electron app launches

**Step 2: Database Initialization**
- Implement migration runner (SQLite for desktop)
- Run migrations on first launch
- Emit database:initialized event to renderer

**Step 3: Service Manager (Core Logic)**
- Implement service spawning (Node.js child_process)
- Start services sequentially (wait for service:ready from each)
- Track service PIDs and status

**Step 4: Health Monitor**
- Poll /health endpoint every 10s for all 8 services
- Detect failures, trigger auto-restart (max 3 retries)
- Emit service:status-changed to renderer

**Step 5: IPC Handlers**
- Implement all 10 IPC channels (services:get-all, start, stop, etc.)
- Test each channel from renderer (use DevTools)

**Step 6: Graceful Shutdown**
- Send SIGTERM to all services
- Wait 5s, then SIGKILL if needed
- Close database connections
- Exit cleanly

**Critical Invariants to Enforce:**
- **Startup order (HARD):** Database BEFORE services, all services BEFORE window
- **Single instance (HARD):** Only one orchestrator can run (use Electron lock)
- **Service isolation (HARD):** Each service has exactly one child process (no duplicates)
- **Graceful shutdown (HARD):** All services stopped before orchestrator exits

**IPC Channel Validation:**
For EACH of the 10 IPC channels in Interfaces section:
- [ ] Channel handler implemented
- [ ] Request schema validated
- [ ] Response schema matches specification
- [ ] Error cases handled
- [ ] Renderer can call successfully

**Common LLM Pitfalls to Avoid:**
1. **Don't start services in parallel:** Sequential startup prevents race conditions
2. **Don't ignore service crashes:** Implement auto-restart (max 3 retries)
3. **Don't skip health checks:** Services can fail at any time, monitor continuously
4. **Don't forget environment variables:** Services need PORT, DATABASE_URL, etc.

**Service Spawning Checklist (8 Services):**
For EACH service (Records, Ingestion, Export, Citation, Evidence, Template, Analysis, Reserved):
- [ ] Service executable exists
- [ ] Port assignment correct (3001-3008)
- [ ] Environment variables injected
- [ ] Working directory set correctly
- [ ] stdout/stderr captured for logs
- [ ] service:ready event received
- [ ] Health check responds

**Validation Checklist (Before Proceeding to Runbook 8):**
- [ ] All 8 services start automatically
- [ ] Database initialized on first run
- [ ] Health monitor detects unhealthy services
- [ ] Auto-restart works (kill a service, verify restart)
- [ ] IPC channels functional (test all 10)
- [ ] Graceful shutdown works (no orphaned processes)
- [ ] Logs aggregated from all services
- [ ] All 5 verification gates executed and passed

**Handoff to Next Runbook:**
- Runbook 8 (Renderer) will communicate via IPC channels
- Any IPC contract violations break the UI
- Service coordination issues discovered here, not in Renderer
```

---

## Template Notes for RUNBOOK_8_9_10_METADATA.md

```markdown
## Template Notes

**Implementation Priority:** HIGH - User-facing application, packaging, deployment

**Before Starting Implementation:**
1. Verify Runbook 7 (Orchestrator) works - all 8 services start successfully
2. Understand Tiptap ↔ LegalDocument transformation (Runbook 8) - core complexity
3. Service Discovery (Runbook 9) enables multi-environment deployment
4. Packaging (Runbook 10) creates distributable installers

**LLM-Assisted Implementation Strategy:**

**Runbook 8 (Electron Renderer):**

**Step 1: Basic Vue Setup**
- Create Vue 3 app with Composition API
- Set up Pinia stores (document, services)
- Implement basic layout (sidebar, editor area, evidence panel)

**Step 2: Tiptap Integration**
- Integrate Tiptap editor
- Implement basic editing (bold, italic, headings)
- Test editor renders and saves

**Step 3: Tiptap ↔ LegalDocument Transformation**
- CRITICAL: This is the hardest part - implement carefully
- Tiptap state → LegalDocument: Extract sections, paragraphs, sentences
- LegalDocument → Tiptap state: Reconstruct editor content
- Test round-trip: Tiptap → LegalDocument → Tiptap (must match)

**Step 4: Service Integration**
- Implement REST API client for all 8 services
- Connect UI actions to service calls (create case, save draft, export)
- Handle errors gracefully (service unavailable, network errors)

**Step 5: Auto-Save**
- Implement dirty flag tracking
- Auto-save every 5s when dirty
- Handle version conflicts (409 responses)

**Step 6: Evidence Linking**
- Implement text highlighting (amber for linked evidence)
- Create citation when user links evidence to sentence
- Preserve sentence IDs in citations

**Runbook 9 (Service Discovery):**

**Step 1: Configuration Module**
- Create `getServiceUrl(serviceName)` function
- Support 3 environments: desktop, cloud, enterprise
- Load URLs from .env files

**Step 2: Environment Detection**
- Detect DEPLOYMENT_ENV from environment
- Return correct URLs based on environment
- Test all 3 environments (desktop=localhost, cloud=api.factsway.com)

**Runbook 10 (Desktop Packaging):**

**Step 1: electron-builder Configuration**
- Configure build for Windows, macOS, Linux
- Set app metadata (name, version, description)
- Configure code signing (certificates required)

**Step 2: Service Bundling**
- Copy all 8 service executables to resources/services/
- Copy database migrations to resources/database/
- Verify all dependencies bundled

**Step 3: Installer Generation**
- Build Windows installer (.exe)
- Build macOS installer (.dmg, notarized)
- Build Linux installer (.AppImage)
- Test on clean machine (no dev tools installed)

**Critical Invariants to Enforce:**

**Runbook 8:**
- **Tiptap sync (HARD):** Editor state must match LegalDocument state
- **Auto-save condition (HARD):** Only save when document dirty (changed)
- **Evidence linking (HARD):** Sentence IDs preserved in citations

**Runbook 9:**
- **URL completeness (HARD):** All 8 services have URLs for all 3 environments
- **Environment validation (HARD):** Invalid DEPLOYMENT_ENV throws error

**Runbook 10:**
- **Service bundling (HARD):** All 8 services included in installer
- **Migration bundling (HARD):** All database migrations included

**Common LLM Pitfalls to Avoid:**
1. **Don't skip transformation tests:** Tiptap ↔ LegalDocument round-trip MUST work
2. **Don't hardcode service URLs:** Use Service Discovery (Runbook 9)
3. **Don't forget code signing:** Unsigned installers trigger security warnings
4. **Don't skip clean machine test:** Installer must work without dev tools

**Validation Checklist (All 3 Runbooks):**

**Runbook 8:**
- [ ] Vue app renders in Electron
- [ ] Tiptap editor functional
- [ ] Tiptap ↔ LegalDocument transformation works (round-trip test)
- [ ] Auto-save triggers when dirty
- [ ] Evidence linking preserves sentence IDs
- [ ] All service calls work (Template, Case, Draft, Export)
- [ ] Error handling graceful (service down, network error)

**Runbook 9:**
- [ ] getServiceUrl() works for all 8 services
- [ ] All 3 environments configured (desktop, cloud, enterprise)
- [ ] Environment detection works

**Runbook 10:**
- [ ] Installers build for all 3 platforms
- [ ] All 8 services bundled
- [ ] Database migrations bundled
- [ ] Installer works on clean machine (no dev tools)
- [ ] Code signing works (no security warnings)

**Handoff to Next Runbook:**
- Runbook 11 (E2E Testing) will test the packaged application
- Any packaging issues discovered here, not in production
```

---

## Template Notes for RUNBOOK_11_METADATA.md

```markdown
## Template Notes

**Implementation Priority:** HIGH - Quality gate before production

**Before Starting Implementation:**
1. Packaged application from Runbook 10 must be available
2. Understand Playwright's Electron support (custom launcher required)
3. Tests must be deterministic (no flakiness) for CI/CD reliability
4. Visual regression baselines must be version-controlled

**LLM-Assisted Implementation Strategy:**

**Step 1: Playwright Setup**
- Install Playwright for Electron
- Create custom electronApp fixture (launches packaged app)
- Verify app launches and window loads

**Step 2: Template Creation Workflow Test**
- Test: Open app → Click "New Template" → Fill form → Save → Verify in list
- This validates: UI rendering, service calls, database persistence
- Establish test data patterns (use mock data generators)

**Step 3: Complete User Workflows**
- Implement all 8 workflow tests from Produces section
- Each test simulates real user actions end-to-end
- Tests must clean up after themselves (no pollution)

**Step 4: Visual Regression**
- Take baseline screenshots of key UI states
- Commit baselines to git
- Compare screenshots on subsequent runs
- Use fuzzy matching threshold (handle anti-aliasing differences)

**Step 5: CI Integration**
- Configure GitHub Actions to run tests
- Handle headless environment (xvfb on Linux)
- Generate HTML reports
- Fail build on test failures

**Critical Invariants to Enforce:**
- **Determinism (HARD):** Tests pass/fail consistently (no randomness)
- **Cleanup (HARD):** Each test creates/deletes its own data (no shared state)
- **Baseline control (HARD):** Visual regression baselines version-controlled
- **Template workflow (HARD):** Template created in test must be retrievable

**Common LLM Pitfalls to Avoid:**
1. **Don't skip explicit waits:** Wait for elements, don't assume instant rendering
2. **Don't share test data:** Each test creates its own templates/cases/drafts
3. **Don't ignore flakiness:** If a test fails once, it's broken (fix it)
4. **Don't skip CI testing:** Tests must work in headless environment

**Test Coverage Validation:**
For EACH of the 8 critical workflows:
- [ ] Test implemented
- [ ] Test passes consistently (run 10 times, all pass)
- [ ] Test cleans up (data deleted after test)
- [ ] Test uses mock data generators (no hardcoded data)

**Visual Regression Checklist:**
- [ ] Baseline screenshots captured
- [ ] Baselines committed to git
- [ ] Screenshot comparison works
- [ ] Fuzzy matching threshold set (handle platform differences)

**CI Pipeline Checklist:**
- [ ] Tests run on push to main
- [ ] Tests run on pull requests
- [ ] Headless mode works (xvfb on Linux)
- [ ] HTML report generated
- [ ] Build fails on test failures

**Validation Checklist (Before Proceeding to Runbook 12):**
- [ ] All 8 workflow tests implemented
- [ ] All tests pass consistently
- [ ] Visual regression tests pass
- [ ] CI pipeline functional
- [ ] HTML report generated
- [ ] All verification gates executed and passed

**Handoff to Next Runbook:**
- Runbook 12 (Integration Testing) focuses on API contracts, not UI
- E2E tests validate user workflows, integration tests validate service contracts
```

---

## Template Notes for RUNBOOK_12_METADATA.md

```markdown
## Template Notes

**Implementation Priority:** HIGH - Validates API contracts without UI

**Before Starting Implementation:**
1. All 8 backend services (Runbooks 3-6) must be complete
2. Tests run against actual services (not mocks) on test ports
3. Focus on API contracts: status codes, response schemas, performance
4. Coverage target is 80% minimum (comprehensive testing)

**LLM-Assisted Implementation Strategy:**

**Step 1: Test Infrastructure**
- Implement global-setup: Start all 8 services on test ports (4001-4008)
- Implement global-teardown: Stop all services after tests
- Verify services start and respond to health checks

**Step 2: API Contract Tests**
- Test EACH endpoint for EACH service
- Validate status codes match specification (200, 201, 404, 400)
- Validate response schemas match TypeScript types
- Test error cases (invalid input, not found)

**Step 3: Cross-Service Workflows**
- Test complete workflows: Template → Case → Draft
- Test export workflow: Draft → DOCX
- Verify service integration (one service calls another correctly)

**Step 4: Performance Benchmarks**
- Measure response times for all endpoints
- Verify within thresholds (GET <100ms, POST <150ms, Export <2000ms)
- Flag performance regressions

**Step 5: Database Migration Tests**
- Test up migrations (create tables)
- Test down migrations (drop tables)
- Verify migrations are idempotent (can run multiple times)

**Critical Invariants to Enforce:**
- **Status codes (HARD):** Every endpoint returns documented status codes
- **Response schemas (HARD):** Responses deserialize to expected TypeScript types
- **Performance thresholds (HARD):** Response times within acceptable limits
- **Migration idempotency (HARD):** Migrations can run multiple times safely

**Common LLM Pitfalls to Avoid:**
1. **Don't use mocks:** Integration tests run against real services
2. **Don't skip error cases:** Test 404, 400, 409 responses (not just happy path)
3. **Don't ignore performance:** Slow APIs hurt UX (measure and enforce thresholds)
4. **Don't forget cleanup:** Services must stop cleanly after tests

**API Contract Validation:**
For EACH endpoint in EACH service:
- [ ] Request schema validated
- [ ] Response schema validated
- [ ] Status codes tested (success + error cases)
- [ ] Performance within threshold

**Workflow Testing:**
- [ ] Template → Case → Draft workflow works
- [ ] Draft → Export workflow works
- [ ] Evidence upload → Download workflow works
- [ ] Citation parsing → Validation workflow works

**Validation Checklist (Before Proceeding to Runbook 13):**
- [ ] All 8 services start in global-setup
- [ ] API contract tests pass for all services
- [ ] Workflow tests pass
- [ ] Performance benchmarks pass
- [ ] Migration tests pass
- [ ] Coverage >80%
- [ ] All verification gates executed and passed

**Handoff to Next Runbook:**
- Runbook 13 (Documentation) describes how to use features tested here
- Integration tests prove features work, documentation explains how to use them
```

---

## Template Notes for RUNBOOK_13_METADATA.md

```markdown
## Template Notes

**Implementation Priority:** MEDIUM - Critical for user adoption, but not blocking development

**Before Starting Implementation:**
1. All features (Runbooks 1-12) must be complete and tested
2. Documentation describes features that actually exist (not planned features)
3. Screenshots must match current UI (update as UI changes)
4. Structure follows user mental model (not implementation architecture)

**LLM-Assisted Implementation Strategy:**

**Step 1: User Guide Outline**
- Create table of contents (40+ chapters listed in Produces section)
- Organize by user workflow, not implementation detail
- Each chapter: Introduction → Steps → Screenshots → Troubleshooting

**Step 2: Quick Start Guide**
- 15-minute tutorial: Template → Case → Draft → Export
- Assumes zero prior knowledge
- Heavy use of screenshots (show, don't tell)

**Step 3: Feature Documentation**
- Document each feature comprehensively (Templates, Cases, Drafts, Evidence, Export)
- Include common workflows ("How do I link evidence?")
- Explain what happens behind the scenes (when helpful)

**Step 4: Administrator Manual**
- Installation guide (Windows, macOS, Linux)
- Configuration (database path, evidence storage)
- Backup/restore procedures
- Troubleshooting (common issues)

**Step 5: Troubleshooting Guide**
- 25+ common issues documented in Produces section
- Problem → Cause → Solution format
- Link to related documentation

**Step 6: FAQ**
- 25+ questions documented in Produces section
- Short, direct answers
- Link to comprehensive documentation for details

**Critical Invariants to Enforce:**
- **Feature completeness (HARD):** All features have documentation
- **Screenshot accuracy (HARD):** Screenshots match current UI
- **No broken links (HARD):** All internal links resolve
- **Build success (HARD):** Documentation site builds without errors

**Common LLM Pitfalls to Avoid:**
1. **Don't document planned features:** Only document what exists now
2. **Don't use technical jargon:** Write for non-technical users
3. **Don't skip screenshots:** Visual guides are essential
4. **Don't forget platform differences:** Windows/macOS/Linux may differ

**Documentation Completeness Checklist:**
- [ ] User Guide: All 40+ chapters complete
- [ ] Quick Start: 15-minute tutorial complete
- [ ] Admin Manual: All 5 sections complete
- [ ] Troubleshooting: 25+ issues documented
- [ ] FAQ: 25+ questions answered
- [ ] Screenshots: All placeholders replaced
- [ ] Build: Documentation site builds successfully
- [ ] Search: Full-text search works

**Validation Checklist (Before Proceeding to Runbook 14):**
- [ ] All documentation sections complete (no TODO markers)
- [ ] Screenshots match current UI
- [ ] No broken links (internal or external)
- [ ] Documentation site builds
- [ ] Search works
- [ ] All verification gates executed and passed

**Handoff to Next Runbook:**
- Runbook 14 (CI/CD) will deploy this documentation automatically
- Documentation must be version-controlled (changes tracked)
```

---

## Template Notes for RUNBOOK_14_METADATA.md

```markdown
## Template Notes

**Implementation Priority:** HIGH - Automates quality gates and deployment

**Before Starting Implementation:**
1. All code (Runbooks 1-10) and tests (Runbooks 11-12) must be complete
2. GitHub repository set up with branch protection rules
3. Code signing certificates obtained (Windows, macOS)
4. AWS account set up for auto-update server

**LLM-Assisted Implementation Strategy:**

**Step 1: CI Pipeline**
- Create .github/workflows/ci.yml
- Run on every push and pull request
- Stages: Lint → Unit Tests → Integration Tests → E2E Tests
- Fail fast (stop on first failure)

**Step 2: Test Coverage**
- Upload coverage reports to Codecov
- Enforce 80% minimum coverage
- Block PRs below threshold

**Step 3: Release Pipeline**
- Create .github/workflows/release.yml
- Trigger on version tags (v1.0.0, v1.0.1, etc.)
- Build installers for all 3 platforms (Windows, macOS, Linux)
- Code sign installers (Windows Authenticode, macOS notarization)

**Step 4: GitHub Release**
- Create GitHub Release with version notes
- Upload installers as release assets
- Generate update manifests (latest.yml)

**Step 5: Auto-Update Server**
- Deploy update manifests to S3
- Configure CloudFront for fast downloads
- Test update mechanism (app checks for updates)

**Step 6: Dependabot**
- Configure automated dependency updates
- Review and merge dependency PRs

**Critical Invariants to Enforce:**
- **Tests pass before merge (HARD):** CI checks required for PR approval
- **Tagged releases only (HARD):** Release workflow only on v* tags
- **Version consistency (HARD):** All services have matching version tags
- **Code signing (HARD):** All installers signed (no "unverified" warnings)

**Common LLM Pitfalls to Avoid:**
1. **Don't skip code signing:** Unsigned installers scare users
2. **Don't forget secrets:** Store certificates/keys in GitHub Secrets
3. **Don't ignore macOS notarization:** Can take 30+ minutes, plan accordingly
4. **Don't deploy broken builds:** CI must pass before release workflow runs

**CI Pipeline Checklist:**
- [ ] Lint passes (ESLint, TypeScript compiler)
- [ ] Unit tests pass (Jest)
- [ ] Integration tests pass (API contracts)
- [ ] E2E tests pass (Playwright)
- [ ] Coverage uploaded to Codecov
- [ ] PR blocked if checks fail

**Release Pipeline Checklist:**
- [ ] Windows installer built (.exe)
- [ ] macOS installer built (.dmg, notarized)
- [ ] Linux installer built (.AppImage)
- [ ] Code signing works (no warnings)
- [ ] GitHub Release created
- [ ] Installers uploaded as assets
- [ ] Update manifests generated

**Auto-Update Server Checklist:**
- [ ] S3 bucket created
- [ ] CloudFront distribution configured
- [ ] Update manifests deployed
- [ ] App checks for updates successfully
- [ ] Update download works

**Validation Checklist (Before Proceeding to Runbook 15):**
- [ ] CI pipeline runs on every push
- [ ] All tests pass in CI
- [ ] Release pipeline triggers on tags
- [ ] Installers built for all platforms
- [ ] Code signing works
- [ ] Auto-update server operational
- [ ] All verification gates executed and passed

**Handoff to Next Runbook:**
- Runbook 15 (Production Deployment) extends this for cloud/enterprise
- CI/CD patterns established here apply to cloud deployment
```

---

## Template Notes for RUNBOOK_15_METADATA.md

```markdown
## Template Notes

**Implementation Priority:** MEDIUM - Cloud/enterprise deployment (not blocking desktop)

**Before Starting Implementation:**
1. Desktop deployment (Runbook 10) must work perfectly
2. All services (Runbooks 3-6) must be containerizable
3. Kubernetes cluster available (cloud or on-premise)
4. Monitoring infrastructure (Prometheus, Grafana) set up

**LLM-Assisted Implementation Strategy:**

**Step 1: Auto-Update Server**
- Set up S3 bucket for installers and manifests
- Configure CloudFront for fast global downloads
- Test update mechanism (app downloads new version)

**Step 2: Kubernetes Configuration**
- Create namespace for production environment
- Deploy PostgreSQL StatefulSet (replaces SQLite)
- Deploy all 8 services as Deployments (3 replicas each)
- Configure Ingress (TLS, routing)

**Step 3: Database Migration Job**
- Create Kubernetes Job to run migrations
- Job must complete before services start
- Handle migration failures gracefully

**Step 4: Monitoring**
- Configure Prometheus to scrape /metrics from all services
- Create Grafana dashboards (service health, request rate, errors)
- Set up alert rules (service down, high error rate, slow response)

**Step 5: Error Tracking**
- Integrate Sentry in all services
- Test error reporting (trigger error, verify appears in Sentry)

**Step 6: Incident Response**
- Write incident response procedures (on-call runbook)
- Document rollback procedures
- Test recovery scenarios

**Critical Invariants to Enforce:**
- **Version consistency (HARD):** All 8 services deployed with same version tag
- **Migrations before services (HARD):** Migration Job completes before pods start
- **Metrics exposed (HARD):** All services have /metrics endpoint
- **Alert coverage (HARD):** All critical services have alerts (service down, high error rate)

**Common LLM Pitfalls to Avoid:**
1. **Don't skip migration job:** Services crash if tables don't exist
2. **Don't ignore monitoring:** Production issues invisible without metrics
3. **Don't forget TLS:** Cloud deployment requires HTTPS (Ingress configuration)
4. **Don't skip incident procedures:** On-call engineer needs runbook

**Auto-Update Server Checklist:**
- [ ] S3 bucket operational
- [ ] CloudFront distribution configured
- [ ] Update manifests deployed
- [ ] Desktop app updates successfully

**Kubernetes Deployment Checklist:**
- [ ] Namespace created
- [ ] PostgreSQL deployed (StatefulSet)
- [ ] All 8 services deployed (Deployments, 3 replicas each)
- [ ] Migration Job completes successfully
- [ ] Ingress configured (TLS, routing)
- [ ] All pods in "Running" state

**Monitoring Checklist:**
- [ ] Prometheus scraping all services
- [ ] Grafana dashboards created
- [ ] Alert rules configured
- [ ] Test alert fires successfully (stop service, verify PagerDuty/Slack)

**Error Tracking Checklist:**
- [ ] Sentry integrated in all services
- [ ] Test error reported successfully
- [ ] Error includes stack trace and context

**Incident Response Checklist:**
- [ ] On-call runbook written
- [ ] Rollback procedures documented
- [ ] Test recovery (rollback deployment, verify services recover)

**Validation Checklist (Production Readiness):**
- [ ] Auto-update server operational
- [ ] Kubernetes deployment successful
- [ ] All services healthy
- [ ] Monitoring operational
- [ ] Alerts firing correctly
- [ ] Error tracking working
- [ ] Incident procedures documented
- [ ] All verification gates executed and passed

**Production Readiness:**
- This runbook validates production readiness
- All previous runbooks (1-14) must be complete and tested
- Production deployment is the final validation gate
```

---

## Template Notes for RUNBOOK_0_METADATA.md

```markdown
## Template Notes

**Implementation Priority:** FOUNDATIONAL - This is the specification, not implementation

**Before Starting Implementation:**
- Runbook 0 is NOT implemented - it's the contract that Runbooks 1-15 implement
- Use Runbook 0 as the source of truth when implementing other runbooks
- Any conflicts between Runbook 0 and Runbooks 1-15 mean Runbooks 1-15 are wrong

**How to Use Runbook 0:**

**During Planning:**
- Read relevant Runbook 0 sections BEFORE starting each runbook implementation
- Verify runbook specification matches Runbook 0 contract
- Identify any gaps or ambiguities early

**During Implementation:**
- Cross-reference Runbook 0 when making design decisions
- Use Runbook 0 definitions for types, schemas, APIs
- Runbook 0 is the tiebreaker when specifications conflict

**During Validation:**
- Verify implementation matches Runbook 0 specification
- Check for specification drift (implemented features not in Runbook 0)
- Update Runbook 0 if requirements change (version-controlled changes only)

**Critical Invariants:**
- **Section completeness (HARD):** All 23 sections complete (no placeholders)
- **Cross-reference accuracy (HARD):** All references to other sections are correct
- **No implementation details (HARD):** Runbook 0 specifies WHAT, not HOW

**Metadata Notes:**
- Runbook 0 metadata is simplified (specification document, not implementation)
- Verification is manual review, not automated testing
- Risks focus on specification quality (completeness, clarity, consistency)

**Validation Checklist:**
- [ ] All 23 sections complete
- [ ] No "TODO" or "TBD" markers
- [ ] Cross-references valid (sections exist)
- [ ] LegalDocument schema complete (Section 4)
- [ ] All data models defined (Section 2)
- [ ] All service specifications complete (Sections 11-14)
```

---

**End of Template Notes Content**

---

## Usage Instructions

**For Each Metadata File:**

1. Open the metadata file (e.g., `RUNBOOK_1_METADATA.md`)
2. Scroll to the end (before "End of Metadata for Runbook X")
3. Insert the appropriate Template Notes section from above
4. Save the file

**Ordering:** Template Notes should appear AFTER "Risks" section and BEFORE "End of Metadata"

**Format:** Copy the entire markdown block including the heading `## Template Notes`
