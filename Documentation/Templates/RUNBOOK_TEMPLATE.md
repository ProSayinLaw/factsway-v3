# Runbook [N]: [Title]

**Purpose:** [One-sentence description of what this runbook accomplishes]  
**Input Required:** [List of files, documents, or previous runbook outputs needed]  
**Output Deliverables:** [List of files, services, or artifacts this runbook produces]  
**Estimated Time:** [X-Y hours]  
**Dependencies:** [Runbook N-1, Runbook N-2, etc.]

---

## Table of Contents

1. [Context](#context)
2. [Specifications](#specifications)
3. [Implementation Requirements](#implementation-requirements)
4. [Step-by-Step Instructions](#step-by-step-instructions)
5. [Verification Criteria](#verification-criteria)
6. [Common Pitfalls](#common-pitfalls)
7. [Handoff to Next Runbook](#handoff-to-next-runbook)
8. [Appendix](#appendix)

---

## Context

### Where This Fits

[Explain where this runbook fits in the overall FACTSWAY build process]

### What You're Building

[Brief overview of what will be built in this runbook]

### Why It Matters

[Explain the importance of this component to the overall system]

---

## Specifications

### [Subsection 1: Primary Component]

[Complete specifications extracted from Runbook 0]

[Include all relevant technical requirements, data structures, API contracts, etc.]

### [Subsection 2: Secondary Component]

[Continue with all necessary specifications]

### [Subsection N: Additional Components]

[All specifications needed to complete this runbook]

---

## Implementation Requirements

### File Structure

```
[directory-name]/
├── [subdirectory]/
│   ├── [file1]
│   ├── [file2]
│   └── [file3]
├── [another-subdirectory]/
│   └── [file4]
├── package.json (or requirements.txt)
└── README.md
```

### Key Files to Create

1. **[File 1]**
   - Purpose: [What this file does]
   - Location: [Path]
   - Dependencies: [What it depends on]

2. **[File 2]**
   - Purpose: [What this file does]
   - Location: [Path]
   - Dependencies: [What it depends on]

[Continue for all key files]

### Dependencies & Libraries

**For TypeScript/Node.js:**
```json
{
  "dependencies": {
    "package-name": "^version",
    "another-package": "^version"
  },
  "devDependencies": {
    "dev-package": "^version"
  }
}
```

**For Python:**
```txt
package-name==version
another-package==version
```

### Environment Setup

```bash
# Commands to set up development environment
npm install
# or
pip install -r requirements.txt

# Any other setup steps
```

---

## Step-by-Step Instructions

### Step 1: [Task Name]

**What to do:**
[Detailed, specific instructions for this step]

**Why:**
[Explanation of why this step is necessary]

**Commands:**
```bash
# Specific commands to run
command1
command2
```

**Expected output:**
```
[What you should see if this step worked]
```

**Verification:**
```bash
# How to verify this step completed successfully
verification-command
```

---

### Step 2: [Next Task]

**What to do:**
[Detailed instructions]

**Why:**
[Explanation]

**Commands:**
```bash
# Commands
```

**Expected output:**
```
[Expected results]
```

**Verification:**
```bash
# Verification
```

---

[Continue for all steps needed to complete the runbook]

---

## Verification Criteria

### Automated Tests

```bash
# Run test suite
npm test
# or
pytest

# Expected output
All tests passing
Coverage > 80%
```

### Manual Checks

- [ ] Check 1: [Specific thing to verify manually]
- [ ] Check 2: [Another thing to verify]
- [ ] Check 3: [Another verification]

### Quality Gates

**Must pass before proceeding:**

1. ✅ All automated tests passing
2. ✅ Code coverage >80%
3. ✅ No TypeScript/Python errors
4. ✅ Health endpoint responds correctly
5. ✅ [Runbook-specific quality gate]

### Integration Tests

```bash
# Test integration with previous components
integration-test-command

# Expected result
[What should happen]
```

---

## Common Pitfalls

### Pitfall 1: [Common Mistake]

**Problem:** [Description of what goes wrong]

**Symptoms:**
- Error message: `[error text]`
- Behavior: [what you'll see]

**Solution:**
[Step-by-step fix]

**Prevention:**
[How to avoid this issue]

---

### Pitfall 2: [Another Issue]

**Problem:** [Description]

**Symptoms:**
- [Symptom 1]
- [Symptom 2]

**Solution:**
[Fix]

**Prevention:**
[Avoidance]

---

[Continue for all known pitfalls]

---

## Handoff to Next Runbook

### What to Provide

**Files:**
- `[path/to/file1]` - [Description]
- `[path/to/file2]` - [Description]

**Documentation:**
- [Any decisions made during this runbook]
- [Any deviations from spec and why]
- [Any discovered issues or gotchas]

### What Next Runbook Needs

**From this runbook:**
- [Specific deliverable 1]
- [Specific deliverable 2]

**To proceed:**
- [What needs to be in place]
- [What needs to be verified]

### Handoff Checklist

- [ ] All deliverables created and tested
- [ ] All verification criteria passed
- [ ] Documentation updated
- [ ] Handoff files in correct locations
- [ ] Next runbook dependencies satisfied

---

## Appendix

### A. Complete Code Examples

#### Example 1: [Component Name]

```typescript
// or javascript, python, etc.
// Complete, runnable code example
```

**Explanation:**
[What this code does and why]

---

#### Example 2: [Another Component]

```typescript
// Another complete example
```

**Explanation:**
[Explanation]

---

### B. Configuration Examples

#### config.json

```json
{
  "setting1": "value1",
  "setting2": "value2"
}
```

**Usage:**
[How to use this configuration]

---

### C. Troubleshooting

#### Issue: [Specific Problem]

**Diagnosis:**
```bash
# Commands to diagnose
diagnostic-command
```

**Fix:**
```bash
# Commands to fix
fix-command
```

---

#### Issue: [Another Problem]

**Diagnosis:**
[How to identify this]

**Fix:**
[How to resolve this]

---

### D. Additional Resources

- [Link to external documentation]
- [Link to related Runbook 0 sections]
- [Link to relevant examples]

---

## Notes for Executor

### Context Management

- This runbook is designed to be executed in a fresh Claude Code session
- You do not need to reference Runbook 0 during execution
- All necessary specifications are included in this document

### Verification is Critical

- Do not proceed to next runbook until all verification criteria pass
- Quality gates are not suggestions - they are requirements
- If something doesn't work, debug it before continuing

### Ask for Help If Needed

- If instructions are unclear, ask for clarification
- If unexpected errors occur, document them
- If you need to deviate from spec, document why

---

**Status:** Ready for execution  
**Version:** 1.0  
**Last Updated:** [Date]
