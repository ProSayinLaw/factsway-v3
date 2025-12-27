## Purpose
Create comprehensive End-to-End testing suite using Playwright that validates complete user workflows in the packaged FACTSWAY desktop application, ensuring production readiness through automated testing of critical paths.

## Produces (Artifacts)
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

## Consumes (Prereqs)
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

## Interfaces Touched
- REST endpoints
  - UNSPECIFIED
  - TODO: Document REST endpoints (Metadata/RUNBOOK_11_METADATA.md:L1-L316)
- IPC channels/events (if any)
  - - Use fuzzy matching threshold (handle anti-aliasing differences) (Source: Metadata/RUNBOOK_11_METADATA.md:L259-L259) "- Use fuzzy matching threshold (handle anti-aliasing differences)"
  - - Handle headless environment (xvfb on Linux) (Source: Metadata/RUNBOOK_11_METADATA.md:L263-L263) "- Handle headless environment (xvfb on Linux)"
  - - [ ] Fuzzy matching threshold set (handle platform differences) (Source: Metadata/RUNBOOK_11_METADATA.md:L290-L290) "- [ ] Fuzzy matching threshold set (handle platform differences)"
- Filesystem paths/formats
  - e2e-tests.yml (Source: Metadata/RUNBOOK_11_METADATA.md:L37-L37) "- File: `.github/workflows/e2e-tests.yml` (~100 lines)"
- Process lifecycle (if any)
  - UNSPECIFIED
  - TODO: Document process lifecycle (Metadata/RUNBOOK_11_METADATA.md:L1-L316)

## Contracts Defined or Used
- IPC - Use fuzzy matching threshold (handle anti-aliasing differences) (Source: Metadata/RUNBOOK_11_METADATA.md:L259-L259) "- Use fuzzy matching threshold (handle anti-aliasing differences)"
- IPC - Handle headless environment (xvfb on Linux) (Source: Metadata/RUNBOOK_11_METADATA.md:L263-L263) "- Handle headless environment (xvfb on Linux)"
- IPC - [ ] Fuzzy matching threshold set (handle platform differences) (Source: Metadata/RUNBOOK_11_METADATA.md:L290-L290) "- [ ] Fuzzy matching threshold set (handle platform differences)"
- Schema LegalDocument (Source: Metadata/RUNBOOK_11_METADATA.md:L85-L85) "- Returns: Complete Template object with LegalDocument"
- File e2e-tests.yml (Source: Metadata/RUNBOOK_11_METADATA.md:L37-L37) "- File: `.github/workflows/e2e-tests.yml` (~100 lines)"

## Invariants Relied On
- - INVARIANT: Tests must be deterministic (no flakiness) (Source: Metadata/RUNBOOK_11_METADATA.md:L100-L100) "- INVARIANT: Tests must be deterministic (no flakiness)"
- - INVARIANT: Tests clean up after themselves (Source: Metadata/RUNBOOK_11_METADATA.md:L108-L108) "- INVARIANT: Tests clean up after themselves"
- - INVARIANT: Visual regression baselines are version-controlled (Source: Metadata/RUNBOOK_11_METADATA.md:L116-L116) "- INVARIANT: Visual regression baselines are version-controlled"
- - INVARIANT: Template creation test creates usable template (Source: Metadata/RUNBOOK_11_METADATA.md:L126-L126) "- INVARIANT: Template creation test creates usable template"
- - INVARIANT: Draft export test produces valid DOCX (Source: Metadata/RUNBOOK_11_METADATA.md:L134-L134) "- INVARIANT: Draft export test produces valid DOCX"

## Verification Gate (Commands + Expected Outputs)
- - Purpose: Verify test framework setup (Source: Metadata/RUNBOOK_11_METADATA.md:L147-L147) "- Purpose: Verify test framework setup"
- - Command: `npm test -- tests/01-template-creation.spec.ts` (Source: Metadata/RUNBOOK_11_METADATA.md:L150-L150) "- Command: `npm test -- tests/01-template-creation.spec.ts`"
- - Purpose: Verify single test suite works (Source: Metadata/RUNBOOK_11_METADATA.md:L163-L163) "- Purpose: Verify single test suite works"
- - Command: `npm test` (Source: Metadata/RUNBOOK_11_METADATA.md:L166-L166) "- Command: `npm test`"
- - Purpose: Verify complete test suite (Source: Metadata/RUNBOOK_11_METADATA.md:L168-L168) "- Purpose: Verify complete test suite"
- - Command: `npm test -- tests/visual/` (Source: Metadata/RUNBOOK_11_METADATA.md:L171-L171) "- Command: `npm test -- tests/visual/`"
- - Purpose: Verify UI hasn't regressed (Source: Metadata/RUNBOOK_11_METADATA.md:L173-L173) "- Purpose: Verify UI hasn't regressed"
- - Purpose: Verify tests work in CI environment (Source: Metadata/RUNBOOK_11_METADATA.md:L178-L178) "- Purpose: Verify tests work in CI environment"
- - Verify app launches and window loads (Source: Metadata/RUNBOOK_11_METADATA.md:L243-L243) "- Verify app launches and window loads"
- - Test: Open app → Click "New Template" → Fill form → Save → Verify in list (Source: Metadata/RUNBOOK_11_METADATA.md:L246-L246) "- Test: Open app → Click "New Template" → Fill form → Save → Verify in list"

## Risks / Unknowns (TODOs)
- - **Risk:** Electron app doesn't launch in CI (Source: Metadata/RUNBOOK_11_METADATA.md:L184-L184) "- **Risk:** Electron app doesn't launch in CI"
- - **Risk:** Tests are flaky (race conditions) (Source: Metadata/RUNBOOK_11_METADATA.md:L192-L192) "- **Risk:** Tests are flaky (race conditions)"
- - **Risk:** Visual regression false positives (anti-aliasing, font rendering) (Source: Metadata/RUNBOOK_11_METADATA.md:L200-L200) "- **Risk:** Visual regression false positives (anti-aliasing, font rendering)"
- - **Risk:** E2E tests take too long (>30 minutes) (Source: Metadata/RUNBOOK_11_METADATA.md:L210-L210) "- **Risk:** E2E tests take too long (>30 minutes)"
- - **Risk:** Screenshots consume too much storage (>1GB) (Source: Metadata/RUNBOOK_11_METADATA.md:L220-L220) "- **Risk:** Screenshots consume too much storage (>1GB)"
