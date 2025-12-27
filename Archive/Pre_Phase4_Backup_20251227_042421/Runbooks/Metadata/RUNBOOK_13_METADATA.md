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

---


---

**End of Metadata for Runbook 13**
