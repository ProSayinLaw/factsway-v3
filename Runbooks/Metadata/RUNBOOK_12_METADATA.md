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

---


---

**End of Metadata for Runbook 12**
