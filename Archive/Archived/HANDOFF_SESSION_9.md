# Session 9 → Session 10 Handoff Document

**Date:** December 24, 2024  
**Created by:** Claude (Session 8-9 context holder)  
**Purpose:** Complete context transfer for fresh chat to continue FACTSWAY development

---

## CRITICAL: Read This First

You are picking up a project that has had **multiple failed attempts** due to architectural drift. The current approach—**Runbook 0 one-shot philosophy**—is specifically designed to prevent that. Your #1 job is to NOT introduce drift.

### The One-Shot Philosophy

Alex is a non-developer building a complex legal document platform. Previous attempts failed because:
- Small iterations compounded into inconsistencies
- "Keep working code" decisions inherited hidden complexity
- Inability to spot when things were going wrong

The solution: **Complete specification before building, then execute without improvisation.**

This means:
- **Runbook 0 is the complete spec** (~10,000+ lines, 20 sections + appendices)
- **Old code (`factsway-backend`) is reference only**—learn from it, don't inherit it
- **15 runbooks are fresh implementation guides**—not wiring instructions for old code
- **When uncertain, STOP and ask Alex**—never make judgment calls

### The Decision Hierarchy

```
Alex (approval authority)
    ↓
This Chat (decision-maker with full context)
    ↓
Claude Code (mechanical executor, zero discretion)
```

You ARE "This Chat" now. When passing edits to Claude Code, use the standard preamble (see JOURNAL.md "Note to My Future Self" section). Never let Claude Code make architectural decisions.

---

## Current State Summary

### What Was Just Completed (Sessions 8-9)

1. **Path C Decision Finalized**
   - Old codebase = reference material only
   - Fresh build per Runbook 0
   - Cherry-picking from old code is intentional, not automatic

2. **8-Clerk Architecture Completed**
   - All 8 clerks fully defined with responsibilities, boundaries, data ownership
   - Saved to: `CLERK_ARCHITECTURE_SUMMARY.md` (standalone reference document)

3. **Motion Analysis Validated Architecture**
   - 309-page real motions PDF analyzed
   - All patterns fit the 8-clerk model
   - 10 enhancement decisions made and incorporated

4. **Section 20 (Execution Tracing) Added to Runbook 0**
   - PipelineEvent schema, invariant tracking, trace storage
   - Edit 36 applied successfully

### The 8 Clerks

| Clerk | Owns | Key Concept |
|-------|------|-------------|
| RecordsClerk | Vault (immutable docs), page-level indexing | Documents never change; only annotations added |
| CaseBlockClerk | Case caption, parties, salutation | Templates reusable across cases |
| SignatureClerk | Signature block templates | Multiple attorneys supported |
| ExhibitsClerk | Exhibits for drafting, appendix assembly | Dynamic markers, vault window for page selection |
| CaseLawClerk | Case Law Library, Table of Authorities | LLM-assisted citation formatting |
| FactsClerk | Claims + ClaimAnalysis | Stable claims, fluid analysis layer |
| PleadingClerk | Motion body, document formatting | Hierarchy invariant, DocumentFormatTemplate |
| AttachmentsClerk | Certificates, notices, affidavits | Clerk reference placeholders |

### The 10 Motion Analysis Decisions

All incorporated into CLERK_ARCHITECTURE_SUMMARY.md:

| # | Decision | Implementation |
|---|----------|---------------|
| 1 | TOC generation | PleadingClerk owns setting, Orchestrator generates at export |
| 2 | Paragraph numbering | Three modes: continuous, per_section, none |
| 3 | Transcript citations | page:line format with multiple ranges |
| 4 | Salutation ownership | CaseBlockClerk owns (boundary clarified) |
| 5 | Line numbering | Full support in DocumentFormatTemplate |
| 6 | Bates numbering | RecordsClerk stores, ExhibitsClerk references |
| 7 | Multiple attorneys | SignatureClerk supports array |
| 8 | Service method | Per-party selection in certificates |
| 9 | Motion title | Draft-level metadata with DOCX extraction |
| 10 | Court type | Templates only, no formal field |

### Export Order ("The Sandwich")

```
┌─────────────────────────┐
│  CaseBlockClerk         │  ← Case caption + salutation
├─────────────────────────┤
│  TOC (if enabled)       │  ← Auto-generated from hierarchy
├─────────────────────────┤
│  PleadingClerk (Body)   │  ← The motion content
├─────────────────────────┤
│  SignatureClerk         │  ← Signature block
├─────────────────────────┤
│  AttachmentsClerk       │  ← Certificates, notices
│  • Certificate of Service│
│  • Exhibits Appendix    │
└─────────────────────────┘
```

---

## Next Steps (Your Task List)

### Immediate: Edits 37-39

Before Runbook 0 is complete, three features from the old codebase need to be specified:

| Edit | Feature | Source Section |
|------|---------|----------------|
| 37 | Citation-aware sentence splitting | Section 2.9 / 5 |
| 38 | XML metadata section detection | Section 9 |
| 39 | Format preservation | Section 9 |

These are valuable patterns discovered in `factsway-backend/pipeline_v2` during forensics. The old code won't be reused—but the techniques will be specified in Runbook 0 and implemented fresh.

**What citation-aware splitting solves:**
- Prevents splitting inside "123 F.3d 456" citations
- Merges citation-only sentences ("See Smith v. Jones.") with previous sentence
- Uses pattern recognition, not spaCy alone

**What XML metadata detection solves:**
- Detects section headers using DOCX XML (numFormat, ilvl, pStyle)
- More reliable than regex on formatted text
- Uses author's actual formatting intent

**What format preservation solves:**
- Tracks original formatting through transformations
- Enables round-trip (ingest → edit → export) fidelity
- FormatMark + PreservationMetadata patterns

### After Edits 37-39

1. Final Runbook 0 review (ensure all sections consistent)
2. Begin Runbook 1 (manual reference.docx creation in Word)
3. Continue through Runbooks 2-15

---

## Key Files and Their Roles

| File | Purpose | Location |
|------|---------|----------|
| `runbook_0_contract_definition.md` | Master spec (~10,000+ lines) | `/Users/alexcruz/Documents/4.0 UI and Backend 360/` |
| `CLERK_ARCHITECTURE_SUMMARY.md` | Standalone clerk reference | Same directory |
| `JOURNAL.md` | Full session history, decisions | Same directory |
| `MOTION_ANALYSIS_REPORT.md` | 6-pass motion pattern analysis | Same directory |
| `factsway-backend/` | OLD code, reference only | Separate repo |

### Reading Order for Context Recovery

1. This handoff document (start here)
2. `CLERK_ARCHITECTURE_SUMMARY.md` (full clerk specs)
3. `JOURNAL.md` (session history, decisions log at bottom)
4. `runbook_0_contract_definition.md` (master spec, read as needed)

---

## Things That Might Trip You Up

### 1. "The old ingestion pipeline works—let's keep it"

**NO.** This exact thinking has killed previous attempts. The old code may work in isolation, but:
- It uses spaCy (64% accuracy), not NUPunkt (91%)
- It lacks execution tracing (Section 20)
- It has UUID-based sentence IDs, not stable addressing
- It carries decisions made for different reasons

**What to do:** Treat old code as a library of solved problems. When building a component, you can look at how it was solved before—but every line is written fresh per Runbook 0.

### 2. "This is too much—let's defer X to Phase 2"

**Alex will push back.** The one-shot philosophy means complete specification upfront. If the architecture needs feature X, it should be in Runbook 0 now. Deferral is iterative thinking—which has failed before.

**Exception:** UI polish, performance optimization, and non-architectural features CAN be deferred. But structural decisions cannot.

### 3. "This edit is too large for Claude Code to handle"

**Claude Code must never chunk or improvise.** If an edit is "too large":
- Claude Code stops and reports back
- This chat (you) decides how to break it down
- The decision hierarchy is maintained

Always use the standard preamble when passing edits to Claude Code.

### 4. "I need to add a new clerk for X"

**Probably not.** The 8-clerk model was stress-tested against 309 pages of real motions. All patterns fit. Before adding a clerk, ask:
- Which existing clerk should own this?
- Is this a clerk domain or a pipeline concern?
- Does this introduce a new data type that doesn't fit anywhere?

FormattingClerk was proposed and eliminated—formatting is a pipeline transformation, not a domain.

---

## How to Verify Alignment

After reading this document and the referenced files, summarize your understanding to Alex. Include:

1. What is Runbook 0's role?
2. What is the relationship to `factsway-backend`?
3. What are the 8 clerks?
4. What are the next 3 edits needed?
5. What is the one-shot philosophy?

If Alex sees misalignment, he'll route your answers back to a context-holding chat for correction—the same handoff verification pattern that saved Session 8.

---

## Summary: What Makes This Different

FACTSWAY has failed before because of drift. This time:

| Before | Now |
|--------|-----|
| Build first, spec later | Spec completely, then build |
| Keep working code | Fresh build, old code is reference |
| Iterate to improve | One-shot execution |
| Claude Code decides | Claude Code executes; this chat decides |
| Assumptions | Everything explicit in Runbook 0 |

The clerk architecture walkthrough (Sessions 8-9) represents some of the most important work done on this project. The 8 clerks, their boundaries, cross-clerk coordination patterns, and motion analysis validation—this is the foundation that will make this build succeed where others failed.

**Don't let drift sneak in.**

---

## Quick Reference: Where We Left Off

- **Runbook 0:** 20 sections + 3 appendices, Edits 1-36 applied
- **CLERK_ARCHITECTURE_SUMMARY.md:** Complete, all 10 decisions incorporated
- **JOURNAL.md:** Updated through Session 9
- **Next action:** Draft Edit 37 (citation-aware sentence splitting)

---

*End of handoff document. Good luck, and remember: specify first, build second, improvise never.*
