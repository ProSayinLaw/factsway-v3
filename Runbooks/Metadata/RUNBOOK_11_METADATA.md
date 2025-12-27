---

## Metadata Summary

### Purpose
Create comprehensive End-to-End testing suite using Playwright that validates complete user workflows in the packaged FACTSWAY desktop application, ensuring production readiness through automated testing of critical paths.

### Produces (Artifacts)

**Test Framework:**
- Framework: Playwright for Electron
  - Test Runner: Playwright Test
  - Browsers: Electron (packaged app)
  - Reports: HTML, JSON, JUnit

**Files:**
- File: `e2e-tests/playwright.config.ts` (~150 lines)
  - Purpose: Playwright configuration, reporters, timeouts
- File: `e2e-tests/utils/electron.ts` (~200 lines)
  - Purpose: Electron app launcher, custom fixtures
- File: `e2e-tests/fixtures/test-data.ts` (~300 lines)
  - Purpose: Mock data generators (templates, cases, drafts)
- File: `e2e-tests/tests/01-template-creation.spec.ts` (~200 lines)
  - Purpose: Template creation workflow test
- File: `e2e-tests/tests/02-case-creation.spec.ts` (~200 lines)
  - Purpose: Case from template workflow
- File: `e2e-tests/tests/03-draft-editing.spec.ts` (~300 lines)
  - Purpose: Draft editing + evidence linking workflow
- File: `e2e-tests/tests/04-export-workflow.spec.ts` (~200 lines)
  - Purpose: Export to DOCX validation
- File: `e2e-tests/tests/05-template-management.spec.ts` (~150 lines)
  - Purpose: Template CRUD operations
- File: `e2e-tests/tests/06-service-health.spec.ts` (~100 lines)
  - Purpose: Service status verification
- File: `e2e-tests/tests/visual/01-ui-screenshots.spec.ts` (~150 lines)
  - Purpose: Visual regression (screenshot comparison)
- File: `.github/workflows/e2e-tests.yml` (~100 lines)
  - Purpose: CI pipeline for E2E tests

**Total:** ~2,050 lines

**Test Coverage:**
- 8 critical user workflows
- 40+ test cases
- Visual regression baseline (20+ screenshots)

### Consumes (Prerequisites)

**Required Runbooks:**
- Runbook 10: Packaged desktop app (installers)
- Runbooks 1-9: All services must be operational

**Required Tools:**
- `@playwright/test@^1.40.0`
- `playwright@^1.40.0`

**Required Environment:**
- Packaged app available for testing (from Runbook 10)
- All 8 services bundled in app
- Database migrations included

### Interfaces Touched

**Test Fixtures (Playwright Custom Fixtures):**

- From: Test Suite → To: Playwright → **Fixture: electronApp**
  - Purpose: Launch packaged Electron app
  - Setup: Spawns app process, waits for window
  - Teardown: Closes app, cleans up processes
  - Example:
    ```typescript
    test('should create template', async ({ electronApp, mainWindow }) => {
      // electronApp is running, mainWindow is ready
    });
    ```

- From: Test Suite → To: Playwright → **Fixture: mainWindow**
  - Purpose: Get main Electron window for interaction
  - Setup: Waits for window.load event
  - Teardown: None (handled by electronApp fixture)

**Mock Data Generators:**

- Function: `createMockTemplate(overrides?)`
  - Returns: Complete Template object with LegalDocument
  - Purpose: Generate test templates consistently

- Function: `createMockCase(templateId, overrides?)`
  - Returns: Complete Case object
  - Purpose: Generate test cases with variable values

- Function: `createMockDraft(caseId, overrides?)`
  - Returns: Complete Draft object with document_json
  - Purpose: Generate test drafts for editing

### Invariants

**Test Reliability Invariants:**

- INVARIANT: Tests must be deterministic (no flakiness)
  - Rule: Same input always produces same result
  - Enforced by: Fixed test data, no random values
  - Purpose: Reliable CI/CD pipeline
  - Violation: Tests pass/fail randomly
  - Detection: Flaky test reports (sometimes pass, sometimes fail)
  - Recovery: Add explicit waits, fix race conditions

- INVARIANT: Tests clean up after themselves
  - Rule: Each test creates new data, deletes it after test
  - Enforced by: Playwright beforeEach/afterEach hooks
  - Purpose: No test pollution (test A doesn't affect test B)
  - Violation: Tests fail when run together, pass in isolation
  - Detection: Test order dependency
  - Recovery: Fix cleanup logic

- INVARIANT: Visual regression baselines are version-controlled
  - Rule: Screenshot baselines committed to git
  - Enforced by: Git workflow
  - Purpose: Track intentional UI changes
  - Violation: Baselines missing, visual tests always fail
  - Detection: CI can't find baseline images
  - Recovery: Generate baselines, commit to git

**Workflow Testing Invariants:**

- INVARIANT: Template creation test creates usable template
  - Rule: Template created in test can be used to create case
  - Enforced by: Test verification (query database for created template)
  - Purpose: Workflow integration validation
  - Violation: Template created but not retrievable
  - Detection: Follow-up query returns null
  - Recovery: Fix template creation logic

- INVARIANT: Draft export test produces valid DOCX
  - Rule: Exported file has .docx magic bytes (504B0304)
  - Enforced by: File validation in test
  - Purpose: Export actually works, not just returns 200
  - Violation: File is corrupt or empty
  - Detection: Magic byte check fails
  - Recovery: Fix export service

### Verification Gates

**Playwright Installation:**
- Command: `cd e2e-tests && npm install`
- Expected: Playwright installed, browsers downloaded
- Purpose: Verify test framework setup

**Single Test Run:**
- Command: `npm test -- tests/01-template-creation.spec.ts`
- Expected:
  ```
  Running 5 tests using 1 worker
  
  ✓ 01-template-creation.spec.ts:10:5 › should open template creation dialog (2s)
  ✓ 01-template-creation.spec.ts:20:5 › should fill template metadata (1s)
  ✓ 01-template-creation.spec.ts:35:5 › should save template successfully (3s)
  ✓ 01-template-creation.spec.ts:50:5 › should appear in template list (1s)
  ✓ 01-template-creation.spec.ts:65:5 › should reload template from database (2s)
  
  5 passed (9s)
  ```
- Purpose: Verify single test suite works

**All Tests Run:**
- Command: `npm test`
- Expected: All 40+ tests pass
- Purpose: Verify complete test suite

**Visual Regression:**
- Command: `npm test -- tests/visual/`
- Expected: Screenshots match baselines (or update if intentional change)
- Purpose: Verify UI hasn't regressed

**CI Pipeline:**
- Command: GitHub Actions runs tests on push
- Expected: All tests pass on Linux, macOS, Windows
- Purpose: Verify tests work in CI environment

### Risks

**Technical Risks:**

- **Risk:** Electron app doesn't launch in CI
  - Severity: HIGH
  - Likelihood: MEDIUM (headless environment challenges)
  - Impact: E2E tests can't run in CI
  - Mitigation: Use xvfb (virtual display) on Linux, configure headless mode
  - Detection: CI fails to launch app
  - Recovery: Add virtual display to CI configuration

- **Risk:** Tests are flaky (race conditions)
  - Severity: HIGH
  - Likelihood: HIGH (async operations, service startup)
  - Impact: CI unreliable, false failures
  - Mitigation: Explicit waits, retry logic, service ready checks
  - Detection: Tests sometimes pass, sometimes fail
  - Recovery: Add waitFor() conditions, increase timeouts

- **Risk:** Visual regression false positives (anti-aliasing, font rendering)
  - Severity: MEDIUM
  - Likelihood: MEDIUM (platform differences)
  - Impact: Visual tests always fail on certain platforms
  - Mitigation: Fuzzy matching threshold, platform-specific baselines
  - Detection: Identical UI shows pixel differences
  - Recovery: Adjust threshold or separate baselines per platform

**Performance Risks:**

- **Risk:** E2E tests take too long (>30 minutes)
  - Severity: MEDIUM
  - Likelihood: MEDIUM (comprehensive test suite)
  - Impact: Slow CI feedback, developers avoid running tests
  - Mitigation: Parallel test execution, optimize test data creation
  - Detection: CI takes >30 minutes
  - Recovery: Run tests in parallel, reduce test scope

**Operational Risks:**

- **Risk:** Screenshots consume too much storage (>1GB)
  - Severity: LOW
  - Likelihood: HIGH (many screenshots)
  - Impact: Large repository, slow clones
  - Mitigation: Compress screenshots, use git-lfs
  - Detection: Repository size grows rapidly
  - Recovery: Move screenshots to git-lfs, compress images

---


---

**End of Metadata for Runbook 11**
