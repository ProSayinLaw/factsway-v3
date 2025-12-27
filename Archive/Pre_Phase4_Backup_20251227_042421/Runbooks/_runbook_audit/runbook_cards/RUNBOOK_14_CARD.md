## Purpose
Create automated CI/CD pipelines using GitHub Actions that build, test, and release FACTSWAY across all platforms, ensuring quality and automating distribution.

## Produces (Artifacts)
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

## Consumes (Prereqs)
**Required Runbooks:**
- Runbook 10: Desktop packaging configuration
- Runbooks 11-12: Test suites

**Required Secrets (GitHub):**
- `WINDOWS_CERT_PASSWORD` (code signing)
- `APPLE_ID`, `APPLE_ID_PASSWORD` (macOS notarization)
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (update server)
- `CODECOV_TOKEN` (coverage reporting)

## Interfaces Touched
- REST endpoints
  - UNSPECIFIED
  - TODO: Document REST endpoints (Metadata/RUNBOOK_14_METADATA.md:L1-L217)
- IPC channels/events (if any)
  - UNSPECIFIED
  - TODO: Document IPC channels/events (Metadata/RUNBOOK_14_METADATA.md:L1-L217)
- Filesystem paths/formats
  - ci.yml (Source: Metadata/RUNBOOK_14_METADATA.md:L9-L9) "- File: `.github/workflows/ci.yml` (~150 lines)"
  - release.yml (Source: Metadata/RUNBOOK_14_METADATA.md:L11-L11) "- File: `.github/workflows/release.yml` (~200 lines)"
  - deploy-update-server.yml (Source: Metadata/RUNBOOK_14_METADATA.md:L13-L13) "- File: `.github/workflows/deploy-update-server.yml` (~100 lines)"
  - dependabot.yml (Source: Metadata/RUNBOOK_14_METADATA.md:L15-L15) "- File: `.github/dependabot.yml` (~50 lines)"
  - latest.yml (Source: Metadata/RUNBOOK_14_METADATA.md:L36-L36) "7. Generate update manifests (latest.yml)"
  - latest.yml (Source: Metadata/RUNBOOK_14_METADATA.md:L63-L63) "- Uploads: Update manifests (latest.yml)"
  - ci.yml (Source: Metadata/RUNBOOK_14_METADATA.md:L133-L133) "- Create .github/workflows/ci.yml"
  - release.yml (Source: Metadata/RUNBOOK_14_METADATA.md:L144-L144) "- Create .github/workflows/release.yml"
  - latest.yml (Source: Metadata/RUNBOOK_14_METADATA.md:L152-L152) "- Generate update manifests (latest.yml)"
- Process lifecycle (if any)
  - UNSPECIFIED
  - TODO: Document process lifecycle (Metadata/RUNBOOK_14_METADATA.md:L1-L217)

## Contracts Defined or Used
- File ci.yml (Source: Metadata/RUNBOOK_14_METADATA.md:L9-L9) "- File: `.github/workflows/ci.yml` (~150 lines)"
- File release.yml (Source: Metadata/RUNBOOK_14_METADATA.md:L11-L11) "- File: `.github/workflows/release.yml` (~200 lines)"
- File deploy-update-server.yml (Source: Metadata/RUNBOOK_14_METADATA.md:L13-L13) "- File: `.github/workflows/deploy-update-server.yml` (~100 lines)"
- File dependabot.yml (Source: Metadata/RUNBOOK_14_METADATA.md:L15-L15) "- File: `.github/dependabot.yml` (~50 lines)"
- File latest.yml (Source: Metadata/RUNBOOK_14_METADATA.md:L36-L36) "7. Generate update manifests (latest.yml)"
- File latest.yml (Source: Metadata/RUNBOOK_14_METADATA.md:L63-L63) "- Uploads: Update manifests (latest.yml)"
- File ci.yml (Source: Metadata/RUNBOOK_14_METADATA.md:L133-L133) "- Create .github/workflows/ci.yml"
- File release.yml (Source: Metadata/RUNBOOK_14_METADATA.md:L144-L144) "- Create .github/workflows/release.yml"
- File latest.yml (Source: Metadata/RUNBOOK_14_METADATA.md:L152-L152) "- Generate update manifests (latest.yml)"

## Invariants Relied On
- - INVARIANT: All tests must pass before merge (Source: Metadata/RUNBOOK_14_METADATA.md:L69-L69) "- INVARIANT: All tests must pass before merge"
- - INVARIANT: Releases only created from tagged commits (Source: Metadata/RUNBOOK_14_METADATA.md:L77-L77) "- INVARIANT: Releases only created from tagged commits"

## Verification Gate (Commands + Expected Outputs)
- - Purpose: Verify CI works (Source: Metadata/RUNBOOK_14_METADATA.md:L90-L90) "- Purpose: Verify CI works"
- - Purpose: Verify release automation (Source: Metadata/RUNBOOK_14_METADATA.md:L98-L98) "- Purpose: Verify release automation"

## Risks / Unknowns (TODOs)
- - **Risk:** Code signing certificates expire (Source: Metadata/RUNBOOK_14_METADATA.md:L104-L104) "- **Risk:** Code signing certificates expire"
- - **Risk:** macOS notarization fails (Apple API issues) (Source: Metadata/RUNBOOK_14_METADATA.md:L112-L112) "- **Risk:** macOS notarization fails (Apple API issues)"
