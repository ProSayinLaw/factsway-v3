## Metadata Summary

### Purpose
Create automated CI/CD pipelines using GitHub Actions that build, test, and release FACTSWAY across all platforms, ensuring quality and automating distribution.

### Produces (Artifacts)

**GitHub Actions Workflows:**
- File: `.github/workflows/ci.yml` (~150 lines)
  - Purpose: Run tests on every commit (lint, unit, integration, E2E)
- File: `.github/workflows/release.yml` (~200 lines)
  - Purpose: Build installers for all platforms, create GitHub release
- File: `.github/workflows/deploy-update-server.yml` (~100 lines)
  - Purpose: Deploy auto-update manifests to S3
- File: `.github/dependabot.yml` (~50 lines)
  - Purpose: Automated dependency updates

**Total:** ~500 lines

**Pipeline Stages:**

**CI Pipeline (on every push):**
1. Lint (ESLint, TypeScript compiler)
2. Unit tests (Jest)
3. Integration tests (Jest with services)
4. E2E tests (Playwright on 3 platforms)
5. Coverage upload (Codecov)

**Release Pipeline (on version tag):**
1. Build Windows installer (.exe)
2. Build macOS installer (.dmg)
3. Build Linux installer (.AppImage)
4. Code signing (Windows Authenticode, macOS notarization)
5. Create GitHub Release
6. Upload installers as release assets
7. Generate update manifests (latest.yml)
8. Deploy manifests to S3

### Consumes (Prerequisites)

**Required Runbooks:**
- Runbook 10: Desktop packaging configuration
- Runbooks 11-12: Test suites

**Required Secrets (GitHub):**
- `WINDOWS_CERT_PASSWORD` (code signing)
- `APPLE_ID`, `APPLE_ID_PASSWORD` (macOS notarization)
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (update server)
- `CODECOV_TOKEN` (coverage reporting)

### Interfaces Touched

**GitHub Actions:**
- From: GitHub → To: CI Runner
  - Trigger: Push to main branch, pull requests
  - Actions: Run tests, build, deploy

**Artifact Storage:**
- From: Release Pipeline → To: GitHub Releases
  - Uploads: Installers (.exe, .dmg, .AppImage)

- From: Release Pipeline → To: S3 Bucket
  - Uploads: Update manifests (latest.yml)

### Invariants

**CI/CD Quality Invariants:**

- INVARIANT: All tests must pass before merge
  - Rule: CI checks required for PR approval
  - Enforced by: GitHub branch protection rules
  - Purpose: No broken code in main branch
  - Violation: Tests fail, PR can't merge
  - Detection: CI status check fails
  - Recovery: Fix tests, push again

- INVARIANT: Releases only created from tagged commits
  - Rule: Release workflow only runs on `v*` tags
  - Enforced by: GitHub Actions workflow trigger
  - Purpose: Controlled releases (not random commits)
  - Violation: Release created from wrong commit
  - Detection: Version mismatch
  - Recovery: Delete release, re-tag correct commit

### Verification Gates

**CI Pipeline:**
- Command: Push commit to GitHub
- Expected: CI runs, all checks pass (green checkmarks)
- Purpose: Verify CI works

**Release Pipeline:**
- Command: Create tag `git tag v1.0.0 && git push --tags`
- Expected: 
  - 3 installers built (Windows, macOS, Linux)
  - GitHub Release created with installers attached
  - Update manifests uploaded to S3
- Purpose: Verify release automation

### Risks

**Technical Risks:**

- **Risk:** Code signing certificates expire
  - Severity: CRITICAL
  - Likelihood: LOW (annual renewal)
  - Impact: Installers show "unverified" warnings
  - Mitigation: Calendar reminder 30 days before expiry
  - Detection: Signing fails in CI
  - Recovery: Renew certificates, update secrets

- **Risk:** macOS notarization fails (Apple API issues)
  - Severity: HIGH
  - Likelihood: MEDIUM
  - Impact: macOS installer can't be distributed
  - Mitigation: Retry logic, fallback to manual notarization
  - Detection: Notarization step fails in CI
  - Recovery: Manual notarization via Xcode

---


---

**End of Metadata for Runbook 14**
