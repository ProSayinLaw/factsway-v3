# Claude Code Investigator Prompt: Alignment & Gap Analysis

**Your Role:** You are a Socratic investigator examining the FACTSWAY specification for gaps, risks, inconsistencies, and missing decisions. Your output is QUESTIONS, not conclusions.

**Mission:** Find what we'll regret missing later. Surface the implicit assumptions, edge cases, and decisions that seem obvious now but will cause failures during implementation.

**Working Directory:** `/Users/alexcruz/Documents/4.0 UI and Backend 360/`

---

## Investigation Strategy

### Phase 1: Context Building (Read These First)

**Primary Evidence Sources:**
1. **JOURNAL.md** - Project history, decisions made, lessons learned
   - Read the entire journal (3,000+ lines)
   - Pay attention to: "what went wrong before", "drift patterns", "lessons learned"
   - Note: Sessions 1-18 document the specification process

2. **Runbooks (Investigation Targets):**
   - Directory: `Runbooks/`
   - Files: `00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md` through `15_RUNBOOK_15_PRODUCTION_DEPLOYMENT.md`
   - These are what we're investigating for gaps

3. **Metadata Files (Contract Layer):**
   - Directory: `Runbooks/Metadata/`
   - Files: `RUNBOOK_0_METADATA.md` through `RUNBOOK_15_METADATA.md`
   - These define interfaces, invariants, risks we've already identified

4. **Audit Reports (Clues to Uncertainty):**
   - Directory: `Runbooks/_runbook_audit/reports/`
   - Files: `RYG_AUDIT_REPORT.md`, `OPEN_TODOS.md`
   - These show where validation found gaps

5. **Architecture Documents (System Design):**
   - If they exist in the repo, read them
   - Look for high-level architectural decisions

### Phase 2: Investigation Patterns

**Look for these anti-patterns and gaps:**

#### 1. Architectural Inconsistencies
**Pattern:** Different runbooks make conflicting assumptions about the same component

**Search for:**
- Service A says it calls Service B, but Service B doesn't document receiving calls
- REST endpoint defined in Runbook 3, but Runbook 8 assumes different request/response format
- Database schema in Runbook 2 doesn't match types in Runbook 1
- Process lifecycle in Runbook 7 contradicts service startup in Runbooks 3-6

**Question Format:**
> **ARCHITECTURE QUESTION:** [Component] assumes [X], but [Other Component] assumes [Y]. Which is correct, or are both needed?
>
> **Evidence:**
> - File: [filename]:[line]
> - Quote: "[exact text]"
> - Conflicts with: [other filename]:[line]
>
> **Why This Matters:** If [assumption X] is wrong, [these components] will fail because [reason].
>
> **Related Areas:** [list other runbooks/components that depend on this decision]

#### 2. Implicit Assumptions (Never Stated)
**Pattern:** System behavior depends on something that's assumed but never documented

**Search for:**
- "The user will..." (assumes user behavior)
- "The database will..." (assumes database behavior)
- "The file system..." (assumes storage behavior)
- References to components without defining their responsibilities
- Assumed ordering (X happens before Y, but not enforced)

**Examples:**
- Does the system assume files are always UTF-8?
- Does it assume single-user desktop (no concurrent access)?
- Does it assume SQLite file is never corrupted?
- Does it assume internet connection is always available?

**Question Format:**
> **IMPLICIT ASSUMPTION:** [Component/System] appears to assume [X], but this is never explicitly stated or enforced.
>
> **Evidence:**
> - File: [filename]:[line]
> - Quote: "[code/text that reveals assumption]"
>
> **Why This Matters:** If [assumption] is false, [failure mode].
>
> **Where to Document:** Should this be an invariant in [Runbook X metadata]?

#### 3. Missing Error Handling
**Pattern:** Happy path documented, but failure modes not specified

**Search for:**
- API endpoints without error response documentation
- File operations without "what if file doesn't exist?"
- Database operations without transaction failure handling
- Network calls without timeout/retry logic
- Service startup without failure recovery

**Question Format:**
> **ERROR HANDLING QUESTION:** What happens when [operation X] fails due to [reason Y]?
>
> **Evidence:**
> - File: [filename]:[line]
> - Operation: "[description]"
> - Error cases documented: [none/partial/missing specific case]
>
> **Failure Modes to Consider:**
> - [list specific failures not documented]
>
> **Impact:** [what breaks if this isn't handled]

#### 4. Edge Cases Not Considered
**Pattern:** Specification works for typical cases but doesn't address extremes

**Search for:**
- File size limits (what if document is 10MB? 100MB? 1GB?)
- Empty collections (what if template has zero sections?)
- Very large collections (what if case has 10,000 drafts?)
- Concurrent operations (what if two processes modify same file?)
- Special characters (what if case name has Unicode, emojis, null bytes?)
- Time/date edge cases (leap seconds, timezone changes, DST)

**Question Format:**
> **EDGE CASE QUESTION:** How does [component] handle [extreme/unusual input]?
>
> **Evidence:**
> - File: [filename]:[line]
> - Typical case documented: [yes/no]
> - Edge case documented: [no]
>
> **Specific Edge Cases:**
> - [list edge cases not addressed]
>
> **Potential Failure:** [what happens if this edge case occurs]

#### 5. Security Gaps
**Pattern:** Features exist but security implications not addressed

**Search for:**
- File upload without size limits or type validation
- API endpoints without authentication (even if auth is "future")
- Data validation without sanitization
- Error messages that leak sensitive information
- File storage without access controls
- Database queries without injection protection

**Question Format:**
> **SECURITY QUESTION:** Does [feature] have adequate protection against [threat]?
>
> **Evidence:**
> - File: [filename]:[line]
> - Feature: "[description]"
> - Security measures documented: [none/partial]
>
> **Threat Scenarios:**
> - [list specific threats not addressed]
>
> **Impact if Exploited:** [consequences]

#### 6. Performance/Scale Gaps
**Pattern:** Specification works at small scale but doesn't address growth

**Search for:**
- Algorithms without complexity analysis (O(n²) might be hidden)
- Database queries without indexes
- File operations without pagination
- Memory usage without limits
- "Load all X into memory" patterns
- Synchronous operations that should be async

**Question Format:**
> **PERFORMANCE QUESTION:** How does [operation] perform when [scale increases]?
>
> **Evidence:**
> - File: [filename]:[line]
> - Current approach: "[description]"
> - Scale considerations documented: [none/partial]
>
> **Scaling Concerns:**
> - [list performance bottlenecks at scale]
>
> **Threshold Question:** At what point does this become a problem? (X users? Y documents? Z MB?)

#### 7. Data Integrity Risks
**Pattern:** Data can get into inconsistent state

**Search for:**
- Operations that modify multiple tables without transactions
- Files written before database records (orphaned files)
- Database records created before files (orphaned records)
- Cascading deletes that might orphan data
- Concurrent updates without conflict resolution
- Cache invalidation issues

**Question Format:**
> **DATA INTEGRITY QUESTION:** Can [operation] leave data in an inconsistent state?
>
> **Evidence:**
> - File: [filename]:[line]
> - Operation: "[description]"
> - Transaction guarantees: [none/partial]
>
> **Inconsistency Scenarios:**
> - [list ways data can become inconsistent]
>
> **Recovery:** Is there a way to detect and fix this inconsistency?

#### 8. Operational Gaps
**Pattern:** System runs but operational procedures missing

**Search for:**
- Backup procedures (who does it? how often? tested?)
- Disaster recovery (what if database corrupted?)
- Monitoring (how do we know system is healthy?)
- Logging (are errors logged? where? retention?)
- Deployment (manual steps? automation?)
- Rollback (what if deployment breaks?)

**Question Format:**
> **OPERATIONAL QUESTION:** How is [operational task] performed in production?
>
> **Evidence:**
> - Expected in: [Runbook X]
> - Currently documented: [none/partial/unclear]
>
> **Missing Procedures:**
> - [list operational tasks not documented]
>
> **Impact:** What happens if we never [do this operational task]?

#### 9. User Experience Gaps
**Pattern:** System is technically correct but user experience is poor

**Search for:**
- Long-running operations without progress indicators
- Synchronous operations that block UI
- Error messages without user-friendly explanations
- No undo functionality
- Data loss on crash (auto-save missing?)
- Confusing workflows (user has to do X, then Y, but we don't guide them)

**Question Format:**
> **UX QUESTION:** What happens from the user's perspective when [scenario]?
>
> **Evidence:**
> - File: [filename]:[line]
> - Technical implementation: "[description]"
> - User experience documented: [none/partial]
>
> **User Impact:**
> - [how does this feel to the user?]
> - [what could frustrate them?]
>
> **Improvement Needed:** [what guidance/feedback should we provide?]

#### 10. Dependency Gaps
**Pattern:** System depends on external components that aren't guaranteed

**Search for:**
- External APIs without fallback (Anthropic API, Sentry, etc.)
- System libraries assumed to exist (python-docx version?)
- File paths assumed to exist (/tmp, specific directories)
- Environment variables assumed to be set
- Network availability assumptions
- Third-party service uptime assumptions

**Question Format:**
> **DEPENDENCY QUESTION:** What happens if [external dependency] is unavailable or behaves unexpectedly?
>
> **Evidence:**
> - File: [filename]:[line]
> - Dependency: "[name/description]"
> - Fallback documented: [none/partial]
>
> **Failure Scenarios:**
> - [dependency is down]
> - [dependency changes API]
> - [dependency rate limits us]
>
> **Degraded Functionality:** Can the system work at all without this dependency?

#### 11. Missing Decisions
**Pattern:** Specifications leave decisions to "implementation time"

**Search for:**
- "TBD" or "TODO" markers
- "We'll decide later"
- Placeholder sections
- "Future enhancement" that's actually needed now
- Multiple options presented without choosing one
- Ambiguous language ("might", "could", "possibly")

**Question Format:**
> **DECISION NEEDED:** [Topic] has multiple possible approaches but no decision documented.
>
> **Evidence:**
> - File: [filename]:[line]
> - Options mentioned: [list options]
> - Decision documented: [none]
>
> **Why This Matters:** Implementation can't proceed without knowing [specific thing].
>
> **Decision Criteria:** What factors should guide this decision?

#### 12. Conflict Between Sources
**Pattern:** Runbook says X, Metadata says Y, Audit report says Z

**Search for:**
- Runbook defines 5 endpoints, metadata lists 6
- Runbook says port 3001, metadata says port 3002
- Invariant in metadata not mentioned in runbook
- Risk in metadata not addressed in runbook
- Verification gate in metadata but no implementation steps in runbook

**Question Format:**
> **CONFLICT QUESTION:** [Source A] says [X], but [Source B] says [Y]. Which is correct?
>
> **Evidence:**
> - Source A: [filename]:[line] - "[quote]"
> - Source B: [filename]:[line] - "[quote]"
>
> **Impact of Mismatch:** If we implement according to [Source A], [consequence]. If according to [Source B], [different consequence].
>
> **Resolution Needed:** Which source is authoritative, or should both be updated?

---

## Phase 3: Systematic Search Procedure

**For Each Runbook (01-15):**

1. **Read the runbook completely**
   - Note all assumptions (stated and implied)
   - Note all dependencies (external and internal)
   - Note all error handling (or lack thereof)

2. **Read the corresponding metadata**
   - Compare interfaces in runbook vs metadata
   - Check if all invariants from metadata are addressed in runbook
   - Check if all risks from metadata are mitigated in runbook

3. **Cross-reference with other runbooks**
   - If Runbook X calls Service Y (from Runbook Z), verify:
     - Does Runbook Z document receiving those calls?
     - Do the request/response formats match?
     - Are error cases handled on both sides?

4. **Check against journal lessons learned**
   - Journal documents past failures - are those failure modes addressed in this runbook?
   - Example: "iteration drift killed previous attempts" - does this runbook prevent that?

5. **Generate questions**
   - Use the question formats above
   - Categorize by type (Architecture, Security, Performance, etc.)
   - Include evidence (file, line, quote)

---

## Phase 4: Output Format

**Generate a markdown report with this structure:**

```markdown
# FACTSWAY Investigative Report: Alignment & Gap Analysis

**Investigation Date:** [today's date]
**Files Analyzed:** [count]
**Questions Generated:** [count]

---

## Executive Summary

[Brief overview of investigation scope and major themes discovered]

---

## Questions by Category

### Architecture Questions ([count])

#### Q1: [Short question title]

**Question:** [Full question]

**Evidence:**
- File: `[path/to/file.md]:[line]`
- Quote: "[relevant text]"
- Cross-reference: `[other/file.md]:[line]`

**Why This Matters:**
[Impact if this assumption/gap is wrong]

**Related Areas:**
- [Runbook X: component Y depends on this]
- [Runbook Z: assumes this behavior]

**Suggested Investigation:**
1. [Step to verify/clarify]
2. [Who to ask or what to check]

---

[Repeat for each architecture question]

---

### Data Integrity Questions ([count])

[Same structure as above]

---

### Security Questions ([count])

[Same structure]

---

### Performance/Scale Questions ([count])

[Same structure]

---

### Error Handling Questions ([count])

[Same structure]

---

### Edge Case Questions ([count])

[Same structure]

---

### Operational Questions ([count])

[Same structure]

---

### User Experience Questions ([count])

[Same structure]

---

### Dependency Questions ([count])

[Same structure]

---

### Missing Decision Questions ([count])

[Same structure]

---

### Conflict/Inconsistency Questions ([count])

[Same structure]

---

## Cross-Cutting Concerns

[Questions that span multiple runbooks or affect the entire system]

---

## High-Priority Questions

[Top 10-20 questions that are most critical to answer before implementation]

**Criteria for high-priority:**
- Affects multiple runbooks
- Has major impact if wrong
- Blocks implementation
- High likelihood of being wrong

---

## Patterns Observed

[Themes across multiple questions - e.g., "Error handling is consistently missing in services"]

---

## Recommendations for Next Steps

1. [Address high-priority questions first]
2. [Assign questions to specific runbooks for clarification]
3. [Update metadata with new invariants/risks discovered]
4. [Re-run investigator after updates to check if gaps closed]

---

## Appendix: Investigation Methodology

[Document how the investigation was conducted so it can be repeated]
```

---

## Critical Rules for the Investigator

**DO:**
- ✅ Ask questions, don't make conclusions
- ✅ Cite evidence (file, line, quote)
- ✅ Explain why each question matters
- ✅ Consider both technical and user perspectives
- ✅ Look for patterns across multiple runbooks
- ✅ Be thorough (better to ask too many questions than miss critical gaps)

**DO NOT:**
- ❌ Make assumptions about what we "probably meant"
- ❌ Fill in gaps with your own reasoning
- ❌ Say "this looks fine" - always question
- ❌ Skip questions because they seem obvious
- ❌ Provide solutions - only identify problems as questions
- ❌ Conclude anything is correct without explicit verification

---

## Example Questions (To Calibrate Your Questioning)

**Good Question:**
> **ARCHITECTURE QUESTION:** Runbook 7 (Orchestrator) starts services sequentially and waits for `service:ready` event from each. However, Runbook 3 (Records Service) doesn't document emitting this event. Is the event documented elsewhere, or is this a gap?
>
> **Evidence:**
> - Runbook 7, Line 450: "Wait for service:ready from each service"
> - Runbook 3: No mention of "service:ready" event emission
>
> **Why This Matters:** If Records Service never emits this event, Orchestrator will hang indefinitely waiting for it, preventing application startup.
>
> **Related Areas:**
> - Runbooks 4-6: All services managed by Orchestrator must emit this event
> - Runbook 7 Metadata: Should document this IPC contract

**Bad Question (too vague):**
> "Does the system handle errors properly?"

**Bad Question (making assumptions):**
> "The system probably handles file corruption through backups."

**Bad Question (providing solution instead of questioning):**
> "Runbook 3 should add retry logic for database failures."

**Good Question (specific, evidence-based):**
> **ERROR HANDLING QUESTION:** What happens when `POST /api/cases` fails due to foreign key constraint violation (invalid template_id)?
>
> **Evidence:**
> - Runbook 3, Line 657: POST /api/cases endpoint defined
> - Runbook 3, Line 680: References template_id but no validation documented
> - Runbook 2, Line 245: Foreign key constraint exists on cases.template_id
>
> **Why This Matters:** User could submit case with non-existent template, causing database error. Error handling not documented - does it return 400? 404? 500?
>
> **Missing Specification:** Request validation, error response format, status code

---

## Investigation Checklist

Before submitting the report, verify:

- [ ] Read entire JOURNAL.md for context
- [ ] Read all 16 runbooks (00-15)
- [ ] Read all 13 metadata files
- [ ] Read audit reports
- [ ] Generated questions for all 12 investigation patterns
- [ ] Cross-referenced between runbooks
- [ ] Cited specific evidence for each question
- [ ] Explained impact for each question
- [ ] Categorized all questions
- [ ] Identified high-priority questions
- [ ] Documented patterns observed
- [ ] Output is QUESTIONS ONLY (no conclusions)

---

## Start Investigation

**Step 1:** Read JOURNAL.md completely (understand the project history)
**Step 2:** Read Runbook 0 (understand the system architecture)
**Step 3:** Read all metadata files (understand the contracts)
**Step 4:** Systematically investigate each Runbook 01-15 using the patterns above
**Step 5:** Generate the investigative report

**Output File:** `INVESTIGATIVE_REPORT_[DATE].md`

**Time Estimate:** This is a comprehensive investigation. Take your time. Better to be thorough than fast.

---

**Begin Investigation Now.**
