## Metadata Summary

### Purpose
Create comprehensive user documentation (100+ pages) covering all FACTSWAY features for end users and administrators, enabling self-service onboarding and troubleshooting.

### Produces (Artifacts)

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

### Consumes (Prerequisites)

**Required Runbooks:**
- Runbooks 1-10: Complete application (all features documented)

### Interfaces Touched

**Documentation Build:**
- From: Markdown files → To: Static site generator (MkDocs/Docusaurus)
  - Output: HTML site with search
  - Deployment: GitHub Pages or bundled in app

### Invariants

**Documentation Quality Invariants:**

- INVARIANT: All features have documentation
  - Rule: Every UI screen, button, workflow has documentation
  - Enforced by: Documentation checklist (manual)
  - Purpose: Complete coverage
  - Violation: Users ask "how do I...?" for undocumented features
  - Detection: User questions, support tickets
  - Recovery: Add missing documentation

- INVARIANT: Screenshots match current UI
  - Rule: Screenshot placeholders replaced with actual screenshots
  - Enforced by: Visual review (manual)
  - Purpose: Accurate user guidance
  - Violation: Screenshots show old UI, confuse users
  - Detection: User confusion, screenshots look wrong
  - Recovery: Update screenshots

### Verification Gates

**Documentation Completeness:**
- Check: All sections in outline have content (no "TODO" markers)
- Expected: 40+ chapters complete, no placeholders
- Purpose: Verify documentation complete

**Build Verification:**
- Command: `mkdocs build` (or equivalent)
- Expected: HTML site generated, no broken links
- Purpose: Verify documentation builds

**Search Verification:**
- Test: Search for "template" in documentation
- Expected: Relevant chapters returned
- Purpose: Verify search works

### Risks

**Content Risks:**

- **Risk:** Documentation becomes outdated (UI changes)
  - Severity: MEDIUM
  - Likelihood: HIGH (as app evolves)
  - Impact: User confusion, outdated screenshots
  - Mitigation: Version documentation with releases, quarterly review
  - Detection: Users report mismatches
  - Recovery: Update documentation, new screenshots

---


---

**End of Metadata for Runbook 13**
