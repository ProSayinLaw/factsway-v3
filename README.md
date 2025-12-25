# FACTSWAY Legal Drafting Engine

**Status:** 📋 Specification Phase Complete - Ready for Implementation
**Confidence:** 8.5/10 (9/10 after Edit 53)
**Philosophy:** One-Shot Development - Build Once, Correctly

---

## What is FACTSWAY?

FACTSWAY is a browser-based legal document drafting platform designed for solo practitioners and small firms. It combines structured document editing with evidence linking, enabling lawyers to create perfectly formatted court filings while maintaining traceable connections between claims and supporting evidence.

**Core Features:**
- Template-based document generation (reusable formatting and structure)
- Evidence vault with sentence-level citation linking
- 8-clerk architecture for separation of concerns
- Export to perfectly formatted Word documents (.docx)
- Evidence map visualization showing claim support

---

## Repository Purpose

This repository contains the **complete specification** for FACTSWAY, developed through a rigorous "one-shot" methodology. Every aspect of the system is specified before any code is written, preventing the architectural drift that plagued previous iterative attempts.

**What's Here:**
- `runbook_0_contract_definition.md` - Master specification (12,806 lines, 20 sections)
- `JOURNAL.md` - Development history across 15 sessions
- `CLERK_ARCHITECTURE_SUMMARY.md` - 8-clerk system design
- `MOTION_ANALYSIS_REPORT.md` - Real-world motion pattern analysis
- `ARCHITECTURAL_REVIEW_ANALYSIS.md` - Security and architecture audit results

**What's NOT Here:**
- Implementation code (will be in `./src/` after Runbook 1 begins)
- Old codebases from previous attempts (reference material only, not included)

---

## Development Philosophy: One-Shot

FACTSWAY has been attempted multiple times using traditional iterative development. Each time:
1. Initial implementation seemed to work
2. Small changes introduced drift
3. Drift compounded into architectural inconsistencies
4. System broke, requiring complete rebuild

**The New Approach:**
```
Specify Everything → Execute Runbooks Sequentially → Ship Confidently
```

**No improvisation. No interpretation. Mechanical execution.**

---

## Project Status

### Specification Phase ✅ COMPLETE

**Path C (Schema & Implementation Clarity):**
- Edits 1-48: Schema consolidation, helper functions, error handling, dependency pinning
- Result: Specification gaps eliminated

**Path D (Architectural Stability):**
- Edits 49-52: UUID-based sentence IDs, IndexedDB image storage, ID preservation logic
- Result: Core architectural flaws resolved

**Remaining:**
- Edit 53: Naming consistency fix (15 minutes)
- Final Runbook 0 review

### Implementation Phase ⏳ PENDING

**Next Steps:**
1. Apply Edit 53
2. Begin Runbook 1: Create reference.docx (manual Word document)
3. Execute Runbooks 2-15 sequentially

**Timeline:** Implementation begins after Edit 53 + final spec review

---

## Architecture Overview

### Three-Tier Data Model

```
TEMPLATE (formatting + structure)
    ↓
CASE (parties + court info)
    ↓
DRAFT (motion content + evidence links)
```

### 8-Clerk Architecture

Each clerk owns a specific domain:

| Clerk | Responsibility |
|-------|---------------|
| **RecordsClerk** | Immutable document vault, page-level indexing, Bates numbering |
| **CaseBlockClerk** | Case captions, party blocks, templates, salutation |
| **SignatureClerk** | Signature block templates (static + variable regions) |
| **ExhibitsClerk** | Exhibit management, dynamic markers, appendix assembly |
| **CaseLawClerk** | Case law library, Table of Authorities, citation formatting |
| **FactsClerk** | Claims + analysis layer (stable data + fluid interpretation) |
| **PleadingClerk** | Motion body, hierarchy enforcement, formatting templates |
| **AttachmentsClerk** | Certificates, notices, affidavits with clerk references |

**Coordination:** Orchestrator pattern - clerks never call each other directly

### Technology Stack

- **Frontend:** Vue 3, Tiptap (ProseMirror), Tailwind CSS
- **Storage:** localStorage + IndexedDB (browser-based, no backend required)
- **Document Processing:** Pandoc 3.6+, NUPunkt sentence parser
- **Export:** python-docx for OOXML generation
- **Sentence Parsing:** NUPunkt (91% accuracy on legal text) + LLM verification for edge cases

---

## Key Innovations

### UUID-Based Sentence IDs

Sentences are addressed by stable IDs that survive paragraph reordering:
```
s-{paragraph_uuid}-{sentence_index}
```

This enables evidence linking that doesn't break when the document is edited.

### Conservative Sentence Splitting

When the parser is uncertain about a sentence boundary, it **merges** rather than splits:
- Merged sentence → still linkable to evidence
- Broken fragment → unlinkable, breaks claims

### Evidence Map

Visual graph showing:
- **Supported claims** (blue) - linked to evidence
- **Unsupported claims** (amber) - need evidence
- **Unused evidence** (gray) - available but not cited

### Execution Tracing

Every pipeline operation emits structured events:
```typescript
{
  stage: "sentence_parsing",
  input_hash: "abc123",
  output_hash: "def456",
  invariants_checked: ["sentence_count", "no_overlaps"],
  duration_ms: 234
}
```

Enables debugging: "What happened vs. what should have happened?"

---

## Documentation Structure

### For Implementers

**Start Here:**
1. `JOURNAL.md` - Understand the development history and decisions
2. `runbook_0_contract_definition.md` - The complete specification
3. `CLERK_ARCHITECTURE_SUMMARY.md` - Detailed clerk responsibilities

**Then:**
- Section 2 (Data Architecture) - Understand the data model
- Section 6 (Body Editor) - Tiptap custom nodes
- Section 13 (Export Pipeline) - Pandoc + OOXML generation
- Section 19 (Design System) - Complete UI specifications

### For Reviewers

**Start Here:**
1. `ARCHITECTURAL_REVIEW_ANALYSIS.md` - Security audit results
2. `MOTION_ANALYSIS_REPORT.md` - Validation against real legal motions
3. Session 15 in `JOURNAL.md` - Critical near-miss drift incident

**Then:**
- Section 20 (Execution Tracing) - Debugging and correctness verification
- Section 18 (Verification Checklist) - Testing requirements

---

## Critical Context: The Old Codebase

**Repository:** `factsway-backend` (not included in this repo)
**Status:** Reference material ONLY
**Relationship:** Dead code from failed iterative attempts

⚠️ **IMPORTANT:** This specification describes a **NEW system** to be built from scratch. The old `factsway-backend` codebase:
- Can be studied to understand how problems were solved
- Is NOT being kept, extended, wired, or bridged
- Contains patterns that may inspire solutions but nothing is inherited

**Path C Decision:** Build fresh per Runbook 0. Every line written new. No automatic inheritance.

See `JOURNAL.md` Session 15 for the full explanation of why this matters.

---

## How to Use This Repository

### If You're Implementing FACTSWAY

**DO:**
✅ Read the JOURNAL.md to understand context and decisions
✅ Follow Runbook 0 exactly - it's the specification
✅ Execute runbooks sequentially (1, 2, 3... no skipping)
✅ Ask clarifying questions if anything is ambiguous
✅ Use the old factsway-backend code as reference for patterns

**DON'T:**
❌ Skip reading the journal and dive into code
❌ Try to "reconcile" Runbook 0 with old codebases
❌ Wire, bridge, or extend old code
❌ Improvise or interpret - execute mechanically
❌ Start with Runbook 5 because "we already have that piece"

### If You're a Future Claude Instance

**Before doing ANYTHING:**
1. Read Session 15 in JOURNAL.md (Critical near-miss drift incident)
2. Answer the 5 verification questions in that session
3. Verify your understanding with Alex before proceeding
4. If you feel ANY confusion about "what exists vs what we're building", STOP and re-read

---

## Verification Checklist

Before claiming you understand this project, answer these questions:

1. **What is Runbook 0?**
   - ✅ CORRECT: Specification for new system to be built fresh
   - ❌ WRONG: Documentation of existing factsway-backend

2. **What is factsway-backend?**
   - ✅ CORRECT: Old code, reference material only
   - ❌ WRONG: Codebase we're extending/wiring/bridging

3. **What is the Path C decision?**
   - ✅ CORRECT: Build fresh per Runbook 0, cherry-pick patterns intentionally
   - ❌ WRONG: Keep Python pipeline, wire TypeScript clerks, bridge the gap

4. **What exists right now?**
   - ✅ CORRECT: Only Runbook 0 specification (12,806 lines)
   - ❌ WRONG: Partially built system that needs completion

5. **What's the next step?**
   - ✅ CORRECT: Apply Edit 53, then Runbook 1 (manual Word doc)
   - ❌ WRONG: Wire clerks, bridge pipelines, start coding

**If you got ANY question wrong:** Re-read JOURNAL.md until you understand.

---

## Contributing

This is a specification repository for a solo development project. The implementation follows a strict one-shot methodology that doesn't accommodate traditional open-source contribution workflows.

**To follow along:**
- Watch this repository for updates
- Read the JOURNAL.md for development progress
- Review completed runbooks as they're added to `./src/`

**To provide feedback:**
- Open an issue with architectural questions or concerns
- Reference specific sections of Runbook 0 in discussions
- Understand that specification changes require careful consideration

---

## License

**Status:** Not yet determined
**Interim:** All rights reserved pending license selection

---

## Contact

**Project Owner:** Alex Cruz
**Development Journal:** See JOURNAL.md for session-by-session progress
**Current Phase:** Post-Path D specification review, pre-implementation

---

**Last Updated:** December 24, 2024
**Next Milestone:** Edit 53 + Runbook 1 (Reference Document Creation)
**Confidence Level:** 8.5/10 → 9/10 after Edit 53
