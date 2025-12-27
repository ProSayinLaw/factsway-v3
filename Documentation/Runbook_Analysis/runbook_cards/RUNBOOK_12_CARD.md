## Purpose
Create integration testing suite using Jest that validates API contracts, service interactions, and database operations without UI, ensuring backend services work correctly together.

## Produces (Artifacts)
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

## Consumes (Prereqs)
**Required Runbooks:**
- Runbooks 2-6: All services must be runnable
- Runbook 2: Database migrations

**Required Tools:**
- `jest@^29.7.0`
- `supertest@^6.3.0` (HTTP API testing)
- `@types/jest@^29.5.0`

## Interfaces Touched
- REST endpoints
  - GET /api/templates (Source: Metadata/RUNBOOK_12_METADATA.md:L95-L95) "- Rule: GET /api/templates <100ms, POST /api/cases <150ms, POST /export <2000ms"
- IPC channels/events (if any)
  - ✓ Starting Records Service... OK (port 4001) (Source: Metadata/RUNBOOK_12_METADATA.md:L108-L108) "✓ Starting Records Service... OK (port 4001)"
  - ✓ Starting Ingestion Service... OK (port 4002) (Source: Metadata/RUNBOOK_12_METADATA.md:L109-L109) "✓ Starting Ingestion Service... OK (port 4002)"
  - - **Risk:** Services don't stop cleanly (port conflicts on re-run) (Source: Metadata/RUNBOOK_12_METADATA.md:L134-L134) "- **Risk:** Services don't stop cleanly (port conflicts on re-run)"
  - - Mitigation: Use SIGKILL after timeout, check port availability (Source: Metadata/RUNBOOK_12_METADATA.md:L138-L138) "- Mitigation: Use SIGKILL after timeout, check port availability"
  - - Detection: Port in use errors (Source: Metadata/RUNBOOK_12_METADATA.md:L139-L139) "- Detection: Port in use errors"
- Filesystem paths/formats
  - UNSPECIFIED
  - TODO: Document filesystem paths/formats (Metadata/RUNBOOK_12_METADATA.md:L1-L223)
- Process lifecycle (if any)
  - UNSPECIFIED
  - TODO: Document process lifecycle (Metadata/RUNBOOK_12_METADATA.md:L1-L223)

## Contracts Defined or Used
- REST GET /api/templates (Source: Metadata/RUNBOOK_12_METADATA.md:L95-L95) "- Rule: GET /api/templates <100ms, POST /api/cases <150ms, POST /export <2000ms"
- IPC ✓ Starting Records Service... OK (port 4001) (Source: Metadata/RUNBOOK_12_METADATA.md:L108-L108) "✓ Starting Records Service... OK (port 4001)"
- IPC ✓ Starting Ingestion Service... OK (port 4002) (Source: Metadata/RUNBOOK_12_METADATA.md:L109-L109) "✓ Starting Ingestion Service... OK (port 4002)"
- IPC - **Risk:** Services don't stop cleanly (port conflicts on re-run) (Source: Metadata/RUNBOOK_12_METADATA.md:L134-L134) "- **Risk:** Services don't stop cleanly (port conflicts on re-run)"
- IPC - Mitigation: Use SIGKILL after timeout, check port availability (Source: Metadata/RUNBOOK_12_METADATA.md:L138-L138) "- Mitigation: Use SIGKILL after timeout, check port availability"
- IPC - Detection: Port in use errors (Source: Metadata/RUNBOOK_12_METADATA.md:L139-L139) "- Detection: Port in use errors"
- Schema schema (Source: Metadata/RUNBOOK_12_METADATA.md:L194-L194) "- [ ] Request schema validated"
- Schema schema (Source: Metadata/RUNBOOK_12_METADATA.md:L195-L195) "- [ ] Response schema validated"

## Invariants Relied On
- - INVARIANT: All API endpoints return documented status codes (Source: Metadata/RUNBOOK_12_METADATA.md:L76-L76) "- INVARIANT: All API endpoints return documented status codes"
- - INVARIANT: All API responses match TypeScript types (Source: Metadata/RUNBOOK_12_METADATA.md:L84-L84) "- INVARIANT: All API responses match TypeScript types"
- - INVARIANT: API response times within acceptable thresholds (Source: Metadata/RUNBOOK_12_METADATA.md:L94-L94) "- INVARIANT: API response times within acceptable thresholds"

## Verification Gate (Commands + Expected Outputs)
- - Purpose: Verify services start for testing (Source: Metadata/RUNBOOK_12_METADATA.md:L113-L113) "- Purpose: Verify services start for testing"
- - Command: `npm test -- contracts/` (Source: Metadata/RUNBOOK_12_METADATA.md:L116-L116) "- Command: `npm test -- contracts/`"
- - Purpose: Verify API contracts maintained (Source: Metadata/RUNBOOK_12_METADATA.md:L118-L118) "- Purpose: Verify API contracts maintained"
- - Command: `npm test -- workflows/` (Source: Metadata/RUNBOOK_12_METADATA.md:L121-L121) "- Command: `npm test -- workflows/`"
- - Purpose: Verify service integration (Source: Metadata/RUNBOOK_12_METADATA.md:L123-L123) "- Purpose: Verify service integration"
- - Command: `npm test -- --coverage` (Source: Metadata/RUNBOOK_12_METADATA.md:L126-L126) "- Command: `npm test -- --coverage`"
- - Purpose: Verify test completeness (Source: Metadata/RUNBOOK_12_METADATA.md:L128-L128) "- Purpose: Verify test completeness"
- - Verify services start and respond to health checks (Source: Metadata/RUNBOOK_12_METADATA.md:L157-L157) "- Verify services start and respond to health checks"
- - Verify service integration (one service calls another correctly) (Source: Metadata/RUNBOOK_12_METADATA.md:L168-L168) "- Verify service integration (one service calls another correctly)"
- - Verify within thresholds (GET <100ms, POST <150ms, Export <2000ms) (Source: Metadata/RUNBOOK_12_METADATA.md:L172-L172) "- Verify within thresholds (GET <100ms, POST <150ms, Export <2000ms)"
- - Verify migrations are idempotent (can run multiple times) (Source: Metadata/RUNBOOK_12_METADATA.md:L178-L178) "- Verify migrations are idempotent (can run multiple times)"

## Risks / Unknowns (TODOs)
- - **Risk:** Services don't stop cleanly (port conflicts on re-run) (Source: Metadata/RUNBOOK_12_METADATA.md:L134-L134) "- **Risk:** Services don't stop cleanly (port conflicts on re-run)"
