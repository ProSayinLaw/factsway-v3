# Using the Investigator: Guide for Alex

## What This Investigator Does

**Think of it as a paranoid QA engineer with unlimited time** who reads every word of your specification and asks "but what if...?" for every scenario.

**It's designed to find:**
1. **The subtle gaps** (not "forgot to define endpoint" but "endpoint defined but what if request is 10GB?")
2. **The implicit assumptions** (never stated but system depends on them)
3. **The conflicts** (Runbook A says X, Runbook B assumes Y)
4. **The decisions deferred** ("we'll figure it out later" that actually blocks implementation)

---

## Why Questions, Not Conclusions?

**Questions force YOU to think, not just accept an answer.**

**Example - Conclusion (bad):**
> "The system should add retry logic for database failures."

**Why bad:** You might think "oh, Code already decided, I'll just implement that" without thinking about:
- How many retries?
- Exponential backoff?
- What errors to retry vs fail immediately?
- Does this block the user or happen in background?

**Example - Question (good):**
> "What happens when POST /api/cases fails due to database connection timeout?"

**Why good:** This makes YOU think:
- Should we retry? If so, how many times?
- Should we show error to user immediately or queue for later?
- Should we cache the request?
- Should we check connection before attempting?
- What's the user experience during this failure?

**You discover better solutions by thinking through the question than by accepting a premature conclusion.**

---

## The 12 Investigation Patterns Explained

### 1. Architectural Inconsistencies
**What it catches:** Service A thinks it calls Service B, but Service B doesn't know about it.

**Example from your system:**
> Runbook 7 (Orchestrator) says it sends SIGTERM to services on shutdown. But do Runbooks 3-6 document handling SIGTERM gracefully? Or do they just crash?

**Why it matters:** If Services don't handle SIGTERM, they might corrupt data on shutdown.

---

### 2. Implicit Assumptions (The Silent Killers)
**What it catches:** Things you assume but never wrote down.

**Example from your system:**
> Does FACTSWAY assume the user has write access to the directory where the database file is stored? What if they don't? Does the app crash, show error, or gracefully degrade?

**Why it matters:** These assumptions work on YOUR machine but fail for users in different environments.

---

### 3. Missing Error Handling
**What it catches:** The happy path is documented, but "what if it fails?" isn't.

**Example from your system:**
> Runbook 4 (Ingestion) calls Anthropic API for parsing. What happens when:
> - API returns 429 (rate limit)?
> - API returns 500 (server error)?
> - Network timeout?
> - API response is malformed JSON?

**Why it matters:** Your parser fails on a real document and there's no recovery path = user loses work.

---

### 4. Edge Cases Not Considered
**What it catches:** Works for normal inputs, breaks on extremes.

**Example from your system:**
> What if a user creates a template with:
> - Zero sections? (empty template)
> - 1000 sections? (massive template)
> - Section titles with emojis? (🔥 URGENT MOTION 🔥)
> - Section titles with null bytes? (malicious input)

**Why it matters:** Edge cases are where crashes happen in production.

---

### 5. Security Gaps
**What it catches:** Feature works but is exploitable.

**Example from your system:**
> Evidence Service (Runbook 6) allows file uploads. What prevents:
> - User uploading a 10GB file (disk exhaustion)?
> - User uploading malware.exe?
> - User uploading PHP script that executes on server?
> - Path traversal (../../etc/passwd)?

**Why it matters:** One malicious user can destroy the system for everyone.

---

### 6. Performance/Scale Gaps
**What it catches:** Works for 1 user, breaks at 100 users.

**Example from your system:**
> Records Service (Runbook 3) has `GET /api/templates` endpoint. Does it:
> - Return ALL templates (what if user has 10,000)?
> - Paginate?
> - Have a limit?
> - Support filtering/search?

**Why it matters:** App becomes unusable as user's data grows.

---

### 7. Data Integrity Risks
**What it catches:** Operations that can corrupt data.

**Example from your system:**
> Runbook 6 (Evidence Service) says:
> 1. Upload file to disk
> 2. Insert record into database
>
> What if:
> - File upload succeeds but database insert fails? (orphaned file)
> - Database insert succeeds but file upload fails? (orphaned record)
> - Process crashes between steps 1 and 2?

**Why it matters:** Data corruption is unrecoverable without backups.

---

### 8. Operational Gaps
**What it catches:** System runs but you can't maintain it.

**Example from your system:**
> Runbook 15 (Production Deployment) defines monitoring. But:
> - Who gets alerted when service is down?
> - What's the escalation path (first alert → second alert → page CEO)?
> - How do we know alerts are working (test alerting)?
> - What if monitoring system itself is down?

**Why it matters:** Production breaks at 2am and nobody knows.

---

### 9. User Experience Gaps
**What it catches:** Technically correct but frustrating to use.

**Example from your system:**
> Runbook 4 (Ingestion) sends document to Anthropic API for parsing. This takes 5-10 seconds. Does the UI:
> - Show progress indicator?
> - Allow cancellation?
> - Show error if it fails?
> - Block other actions while processing?

**Why it matters:** User thinks app is frozen and force-quits, losing work.

---

### 10. Dependency Gaps
**What it catches:** System depends on X but X might not be there.

**Example from your system:**
> All 8 services depend on SQLite. What if:
> - SQLite library not installed?
> - SQLite version is too old (missing features)?
> - SQLite file is corrupted?
> - Disk is full (can't write to SQLite)?

**Why it matters:** App works on dev machine but fails on user's machine.

---

### 11. Missing Decisions
**What it catches:** Spec says "we'll decide later" but implementation can't proceed.

**Example from your system:**
> Runbook 0 Section 7 (Authentication) is marked as "future enhancement". But:
> - Can Evidence Service store files without access control?
> - Can any user delete any template?
> - Can templates be shared between users (no user concept)?

**Why it matters:** You build desktop-only features that are impossible to make multi-user later.

---

### 12. Conflicts Between Sources
**What it catches:** Runbook says X, metadata says Y.

**Example from your system:**
> Runbook 3 metadata lists 18 REST endpoints. But when you count endpoints in the runbook itself, there are 17. Which is correct? Is one missing from implementation or metadata?

**Why it matters:** Implementation follows runbook, validation follows metadata = tests fail even though code is "correct".

---

## How to Use the Investigator

### Step 1: Run It
```bash
# Copy the investigator prompt to Claude Code
# It will take 30-60 minutes to run (comprehensive analysis)
# Output: INVESTIGATIVE_REPORT_[DATE].md
```

### Step 2: Review the Report
**Don't try to answer all questions at once.**

**Prioritize like this:**

1. **Critical (answer NOW before implementation):**
   - Questions that block Runbook 1 implementation
   - Questions about foundational assumptions (if wrong, everything breaks)
   - Questions about data integrity (corruption is unrecoverable)

2. **High (answer in next session):**
   - Questions affecting multiple runbooks
   - Questions about security (exploitable gaps)
   - Questions about error handling (crashes in production)

3. **Medium (answer during implementation):**
   - Questions about edge cases (can be tested during development)
   - Questions about UX (can be refined based on usage)

4. **Low (answer later):**
   - Questions about future features
   - Questions about optimization (works correctly, just slowly)

### Step 3: Answer Questions Systematically
**For each high-priority question:**

1. **Understand what's being asked**
   - Read the evidence
   - Look at the related areas
   - Think about the impact

2. **Research if needed**
   - Check Runbook 0 (system architecture)
   - Check related runbooks
   - Check if similar question answered elsewhere

3. **Make a decision**
   - Document it in the appropriate runbook
   - Update metadata if it's an invariant
   - Update audit report if it's a risk

4. **Propagate the decision**
   - If decision affects multiple runbooks, update all
   - Add verification gate to test the decision
   - Add to Template Notes if it guides implementation

### Step 4: Re-Run Investigator
**After answering 20-30 questions, re-run the investigator.**

**Why:** Your answers might create new questions. Example:
- Q: "What happens when API rate limited?"
- A: "We retry with exponential backoff."
- New Q: "What's the maximum retry time before we give up?"

**Iterate until the investigator generates <10 new questions.**

---

## What Makes This Different from a Code Review?

**Code Review (after implementation):**
- "This function doesn't handle null inputs."
- **Cost:** Refactor code, update tests, re-deploy
- **Risk:** Might break other code

**Investigative Review (before implementation):**
- "What happens when input is null?"
- **Cost:** Update specification (30 seconds)
- **Risk:** None (no code exists yet)

**It's 100x cheaper to fix gaps in spec than in code.**

---

## Expected Output Size

**Realistic expectations:**

For a 35,000-line specification (15 runbooks + metadata):
- **First run:** 200-400 questions
- **After answering critical questions:** 100-200 questions
- **After answering high-priority questions:** 50-100 questions
- **After multiple iterations:** <10 questions

**Don't be overwhelmed by the number.**

Most questions will cluster around a few themes:
- "Error handling missing" (20 questions, one solution: add error handling section to template)
- "Edge cases not considered" (30 questions, systematic approach: test with fuzzing)
- "Dependencies not validated" (15 questions, one fix: add dependency checks to verification gates)

**You'll find patterns, not just individual questions.**

---

## Red Flags to Watch For

**If the investigator finds:**

1. **>50 questions about same runbook:** That runbook is underspecified
2. **>20 questions about same pattern:** Systematic gap (e.g., no error handling anywhere)
3. **>10 conflict questions:** Sources are out of sync (metadata vs runbook vs audit)
4. **Questions you can't answer:** Fundamental architectural decision missing

**These are GOOD to find now, not during implementation.**

---

## Success Criteria

**You know the investigation is complete when:**

✅ All high-priority questions answered and documented
✅ Patterns identified and systematic fixes applied
✅ Conflicts resolved (metadata matches runbooks)
✅ Decisions made (no more "TBD")
✅ Re-running investigator generates <10 new questions

**Then you're ready to hand Runbook 1 to Claude Code.**

---

## Why This Is Worth the Time

**Time Investment:**
- Running investigator: 1 hour (automated)
- Reviewing questions: 2-3 hours (reading, prioritizing)
- Answering critical questions: 4-6 hours (thinking, documenting)
- Re-running and iterating: 2-3 hours
- **Total: ~10-15 hours**

**Time Saved During Implementation:**
- Not refactoring due to missed edge cases: 20+ hours
- Not debugging data corruption: 30+ hours
- Not rewriting due to architectural conflicts: 50+ hours
- Not dealing with production incidents: 100+ hours

**ROI: 10-20x**

**Plus:** Confidence that the specification is actually complete.

---

## When NOT to Use This

**Don't run the investigator if:**
- ❌ You haven't finished the runbooks yet (it needs complete specs)
- ❌ You're prototyping (investigator is for production specs)
- ❌ You're not ready to answer hard questions (investigator will find them)

**DO run the investigator if:**
- ✅ Runbooks are "done" (all code written, no placeholders)
- ✅ Metadata is complete (all contracts defined)
- ✅ You're about to start implementation
- ✅ You want to catch issues before they become code

---

## Final Thought

**The investigator is paranoid by design.**

It will ask questions that seem obvious.
It will ask questions about unlikely scenarios.
It will ask questions you think you already answered.

**That's the point.**

The gaps that kill systems are the ones you thought were obvious.
The edge cases that crash production are the ones you thought were unlikely.
The assumptions that cause data loss are the ones you thought you documented.

**Better to be annoyed by questions now than debugging production failures later.**

---

**Ready to find what you've missed?** 🔍
