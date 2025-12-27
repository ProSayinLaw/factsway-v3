## Purpose
Create comprehensive user documentation (100+ pages) covering all FACTSWAY features for end users and administrators, enabling self-service onboarding and troubleshooting.

## Produces (Artifacts)
**Documentation Suite:**
- Format: Markdown
  - Deployment: Static site (GitHub Pages or in-app help)
  - Search: Full-text search enabled

**Files:**

**User Guide (~50 pages, 40+ chapters):**
- File: `docs/user-guide/00-outline.md` (table of contents)
- File: `docs/user-guide/01-getting-started.md` (~5 pages)
- File: `docs/user-guide/02-interface-overview.md` (~3 pages)
- File: `docs/user-guide/03-templates.md` (~8 pages)
- File: `docs/user-guide/04-cases.md` (~6 pages)
- File: `docs/user-guide/05-drafting.md` (~12 pages)
- File: `docs/user-guide/06-evidence.md` (~8 pages)
- File: `docs/user-guide/07-export.md` (~5 pages)
- File: `docs/user-guide/08-advanced-features.md` (~8 pages)

**Quick Start Guide:**
- File: `docs/quick-start.md` (~3 pages)
  - Purpose: 15-minute tutorial (create template → draft → export)

**Administrator Manual (~20 pages):**
- File: `docs/admin-manual/00-outline.md`
- File: `docs/admin-manual/01-installation.md` (~5 pages)
- File: `docs/admin-manual/02-configuration.md` (~5 pages)
- File: `docs/admin-manual/03-user-management.md` (~3 pages, Enterprise only)
- File: `docs/admin-manual/04-backup-restore.md` (~4 pages)
- File: `docs/admin-manual/05-troubleshooting.md` (~5 pages)

**Troubleshooting Guide:**
- File: `docs/troubleshooting.md` (~10 pages, 25+ common issues)

**FAQ:**
- File: `docs/faq.md` (~5 pages, 25+ questions)

**Total:** ~100 pages

## Consumes (Prereqs)
**Required Runbooks:**
- Runbooks 1-10: Complete application (all features documented)

## Interfaces Touched
- REST endpoints
  - UNSPECIFIED
  - TODO: Document REST endpoints (Metadata/RUNBOOK_13_METADATA.md:L1-L189)
- IPC channels/events (if any)
  - UNSPECIFIED
  - TODO: Document IPC channels/events (Metadata/RUNBOOK_13_METADATA.md:L1-L189)
- Filesystem paths/formats
  - 00-outline.md (Source: Metadata/RUNBOOK_13_METADATA.md:L16-L16) "- File: `docs/user-guide/00-outline.md` (table of contents)"
  - 01-getting-started.md (Source: Metadata/RUNBOOK_13_METADATA.md:L17-L17) "- File: `docs/user-guide/01-getting-started.md` (~5 pages)"
  - 02-interface-overview.md (Source: Metadata/RUNBOOK_13_METADATA.md:L18-L18) "- File: `docs/user-guide/02-interface-overview.md` (~3 pages)"
  - 03-templates.md (Source: Metadata/RUNBOOK_13_METADATA.md:L19-L19) "- File: `docs/user-guide/03-templates.md` (~8 pages)"
  - 04-cases.md (Source: Metadata/RUNBOOK_13_METADATA.md:L20-L20) "- File: `docs/user-guide/04-cases.md` (~6 pages)"
  - 05-drafting.md (Source: Metadata/RUNBOOK_13_METADATA.md:L21-L21) "- File: `docs/user-guide/05-drafting.md` (~12 pages)"
  - 06-evidence.md (Source: Metadata/RUNBOOK_13_METADATA.md:L22-L22) "- File: `docs/user-guide/06-evidence.md` (~8 pages)"
  - 07-export.md (Source: Metadata/RUNBOOK_13_METADATA.md:L23-L23) "- File: `docs/user-guide/07-export.md` (~5 pages)"
  - 08-advanced-features.md (Source: Metadata/RUNBOOK_13_METADATA.md:L24-L24) "- File: `docs/user-guide/08-advanced-features.md` (~8 pages)"
  - quick-start.md (Source: Metadata/RUNBOOK_13_METADATA.md:L27-L27) "- File: `docs/quick-start.md` (~3 pages)"
  - 00-outline.md (Source: Metadata/RUNBOOK_13_METADATA.md:L31-L31) "- File: `docs/admin-manual/00-outline.md`"
  - 01-installation.md (Source: Metadata/RUNBOOK_13_METADATA.md:L32-L32) "- File: `docs/admin-manual/01-installation.md` (~5 pages)"
  - 02-configuration.md (Source: Metadata/RUNBOOK_13_METADATA.md:L33-L33) "- File: `docs/admin-manual/02-configuration.md` (~5 pages)"
  - 03-user-management.md (Source: Metadata/RUNBOOK_13_METADATA.md:L34-L34) "- File: `docs/admin-manual/03-user-management.md` (~3 pages, Enterprise only)"
  - 04-backup-restore.md (Source: Metadata/RUNBOOK_13_METADATA.md:L35-L35) "- File: `docs/admin-manual/04-backup-restore.md` (~4 pages)"
  - 05-troubleshooting.md (Source: Metadata/RUNBOOK_13_METADATA.md:L36-L36) "- File: `docs/admin-manual/05-troubleshooting.md` (~5 pages)"
  - troubleshooting.md (Source: Metadata/RUNBOOK_13_METADATA.md:L39-L39) "- File: `docs/troubleshooting.md` (~10 pages, 25+ common issues)"
  - faq.md (Source: Metadata/RUNBOOK_13_METADATA.md:L42-L42) "- File: `docs/faq.md` (~5 pages, 25+ questions)"
- Process lifecycle (if any)
  - UNSPECIFIED
  - TODO: Document process lifecycle (Metadata/RUNBOOK_13_METADATA.md:L1-L189)

## Contracts Defined or Used
- File 00-outline.md (Source: Metadata/RUNBOOK_13_METADATA.md:L16-L16) "- File: `docs/user-guide/00-outline.md` (table of contents)"
- File 01-getting-started.md (Source: Metadata/RUNBOOK_13_METADATA.md:L17-L17) "- File: `docs/user-guide/01-getting-started.md` (~5 pages)"
- File 02-interface-overview.md (Source: Metadata/RUNBOOK_13_METADATA.md:L18-L18) "- File: `docs/user-guide/02-interface-overview.md` (~3 pages)"
- File 03-templates.md (Source: Metadata/RUNBOOK_13_METADATA.md:L19-L19) "- File: `docs/user-guide/03-templates.md` (~8 pages)"
- File 04-cases.md (Source: Metadata/RUNBOOK_13_METADATA.md:L20-L20) "- File: `docs/user-guide/04-cases.md` (~6 pages)"
- File 05-drafting.md (Source: Metadata/RUNBOOK_13_METADATA.md:L21-L21) "- File: `docs/user-guide/05-drafting.md` (~12 pages)"
- File 06-evidence.md (Source: Metadata/RUNBOOK_13_METADATA.md:L22-L22) "- File: `docs/user-guide/06-evidence.md` (~8 pages)"
- File 07-export.md (Source: Metadata/RUNBOOK_13_METADATA.md:L23-L23) "- File: `docs/user-guide/07-export.md` (~5 pages)"
- File 08-advanced-features.md (Source: Metadata/RUNBOOK_13_METADATA.md:L24-L24) "- File: `docs/user-guide/08-advanced-features.md` (~8 pages)"
- File quick-start.md (Source: Metadata/RUNBOOK_13_METADATA.md:L27-L27) "- File: `docs/quick-start.md` (~3 pages)"
- File 00-outline.md (Source: Metadata/RUNBOOK_13_METADATA.md:L31-L31) "- File: `docs/admin-manual/00-outline.md`"
- File 01-installation.md (Source: Metadata/RUNBOOK_13_METADATA.md:L32-L32) "- File: `docs/admin-manual/01-installation.md` (~5 pages)"
- File 02-configuration.md (Source: Metadata/RUNBOOK_13_METADATA.md:L33-L33) "- File: `docs/admin-manual/02-configuration.md` (~5 pages)"
- File 03-user-management.md (Source: Metadata/RUNBOOK_13_METADATA.md:L34-L34) "- File: `docs/admin-manual/03-user-management.md` (~3 pages, Enterprise only)"
- File 04-backup-restore.md (Source: Metadata/RUNBOOK_13_METADATA.md:L35-L35) "- File: `docs/admin-manual/04-backup-restore.md` (~4 pages)"
- File 05-troubleshooting.md (Source: Metadata/RUNBOOK_13_METADATA.md:L36-L36) "- File: `docs/admin-manual/05-troubleshooting.md` (~5 pages)"
- File troubleshooting.md (Source: Metadata/RUNBOOK_13_METADATA.md:L39-L39) "- File: `docs/troubleshooting.md` (~10 pages, 25+ common issues)"
- File faq.md (Source: Metadata/RUNBOOK_13_METADATA.md:L42-L42) "- File: `docs/faq.md` (~5 pages, 25+ questions)"

## Invariants Relied On
- - INVARIANT: All features have documentation (Source: Metadata/RUNBOOK_13_METADATA.md:L62-L62) "- INVARIANT: All features have documentation"
- - INVARIANT: Screenshots match current UI (Source: Metadata/RUNBOOK_13_METADATA.md:L70-L70) "- INVARIANT: Screenshots match current UI"

## Verification Gate (Commands + Expected Outputs)
- - Purpose: Verify documentation complete (Source: Metadata/RUNBOOK_13_METADATA.md:L83-L83) "- Purpose: Verify documentation complete"
- - Purpose: Verify documentation builds (Source: Metadata/RUNBOOK_13_METADATA.md:L88-L88) "- Purpose: Verify documentation builds"
- - Purpose: Verify search works (Source: Metadata/RUNBOOK_13_METADATA.md:L93-L93) "- Purpose: Verify search works"

## Risks / Unknowns (TODOs)
- - **Risk:** Documentation becomes outdated (UI changes) (Source: Metadata/RUNBOOK_13_METADATA.md:L99-L99) "- **Risk:** Documentation becomes outdated (UI changes)"
