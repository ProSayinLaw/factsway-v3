## Metadata Summary

### Purpose
Create integration testing suite using Jest that validates API contracts, service interactions, and database operations without UI, ensuring backend services work correctly together.

### Produces (Artifacts)

**Test Framework:**
- Framework: Jest
  - Test Runner: Jest
  - Coverage: >80% for all services

**Files:**
- File: `integration-tests/jest.config.js` (~50 lines)
  - Purpose: Jest configuration, coverage thresholds
- File: `integration-tests/global-setup.ts` (~100 lines)
  - Purpose: Start all 8 services before tests
- File: `integration-tests/global-teardown.ts` (~50 lines)
  - Purpose: Stop all services after tests
- File: `integration-tests/tests/contracts/records-service.test.ts` (~300 lines)
  - Purpose: API contract tests for Records Service
- File: `integration-tests/tests/contracts/ingestion-service.test.ts` (~200 lines)
  - Purpose: Ingestion pipeline tests
- File: `integration-tests/tests/contracts/export-service.test.ts` (~200 lines)
  - Purpose: Export validation tests
- File: `integration-tests/tests/workflows/draft-creation.test.ts` (~250 lines)
  - Purpose: Complete draft creation workflow (Template → Case → Draft)
- File: `integration-tests/tests/workflows/export.test.ts` (~200 lines)
  - Purpose: Draft → DOCX export pipeline
- File: `integration-tests/tests/database/migrations.test.ts` (~150 lines)
  - Purpose: Database migration up/down tests
- File: `integration-tests/tests/performance/api-benchmarks.test.ts` (~200 lines)
  - Purpose: Performance baselines (response times)

**Total:** ~1,700 lines

**Test Coverage:**
- API contract tests for all 8 services
- Database migration validation
- Cross-service workflows
- Performance benchmarks

### Consumes (Prerequisites)

**Required Runbooks:**
- Runbooks 2-6: All services must be runnable
- Runbook 2: Database migrations

**Required Tools:**
- `jest@^29.7.0`
- `supertest@^6.3.0` (HTTP API testing)
- `@types/jest@^29.5.0`

### Interfaces Touched

**Test Utilities:**

- Function: `startAllServices()`
  - Purpose: Spawn all 8 services on test ports (4001-4008)
  - Returns: Map of service names → child processes
  - Called: In global-setup.ts before tests run

- Function: `waitForServiceHealth(serviceName, timeout)`
  - Purpose: Poll /health endpoint until service ready
  - Returns: Promise<void> (resolves when healthy)
  - Called: After starting each service

- Function: `stopAllServices(processes)`
  - Purpose: Gracefully stop all services
  - Called: In global-teardown.ts after tests complete

### Invariants

**API Contract Invariants:**

- INVARIANT: All API endpoints return documented status codes
  - Rule: 200 for success, 201 for created, 400 for validation, 404 for not found
  - Enforced by: Contract tests
  - Purpose: API contract compliance
  - Violation: Unexpected status codes
  - Detection: Contract test fails
  - Recovery: Fix API implementation

- INVARIANT: All API responses match TypeScript types
  - Rule: Response JSON deserializes to expected types
  - Enforced by: Type validation in tests
  - Purpose: Type safety
  - Violation: Type mismatch errors
  - Detection: TypeScript compilation errors in tests
  - Recovery: Fix API response structure

**Performance Invariants:**

- INVARIANT: API response times within acceptable thresholds
  - Rule: GET /api/templates <100ms, POST /api/cases <150ms, POST /export <2000ms
  - Enforced by: Performance benchmark tests
  - Purpose: Acceptable UX (no slow operations)
  - Violation: Response times exceed thresholds
  - Detection: Performance tests fail
  - Recovery: Optimize queries, add indexes

### Verification Gates

**Service Startup:**
- Command: `npm run test:integration`
- Expected: 
  ```
  ✓ Starting Records Service... OK (port 4001)
  ✓ Starting Ingestion Service... OK (port 4002)
  (... all 8 services start ...)
  ✓ All services healthy
  ```
- Purpose: Verify services start for testing

**Contract Tests:**
- Command: `npm test -- contracts/`
- Expected: All API contract tests pass
- Purpose: Verify API contracts maintained

**Workflow Tests:**
- Command: `npm test -- workflows/`
- Expected: Complete workflows pass (Template → Case → Draft → Export)
- Purpose: Verify service integration

**Coverage Report:**
- Command: `npm test -- --coverage`
- Expected: Coverage >80% for all services
- Purpose: Verify test completeness

### Risks

**Technical Risks:**

- **Risk:** Services don't stop cleanly (port conflicts on re-run)
  - Severity: MEDIUM
  - Likelihood: MEDIUM
  - Impact: Tests fail on second run
  - Mitigation: Use SIGKILL after timeout, check port availability
  - Detection: Port in use errors
  - Recovery: Kill orphaned processes, restart

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

---


---

**End of Metadata for Runbook 12**
