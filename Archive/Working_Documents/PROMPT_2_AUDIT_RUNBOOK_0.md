# PROMPT 2: Comprehensive Audit of Runbook 0 for Hidden Issues

## Context

You are performing a comprehensive audit of RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md to identify any additional contradictions, gaps, or inconsistencies that were not caught in the initial review.

**What We Already Know:**
- Runbook 0 had contradictory architectures (browser-based vs microservices) - BEING FIXED
- Section 2.5 specified ProseMirror as data model when LegalDocument is canonical - BEING FIXED
- Runbook plan (Section 1.4) didn't match actual architecture - BEING FIXED

**Your Mission:**
Find OTHER issues we might have missed. Look for patterns, contradictions, gaps, and potential problems that could cause implementation failures.

---

## Audit Areas

### 1. Cross-Reference Integrity

**Task:** Verify all internal section references are valid and point to correct content

**Check for:**
- References to "Section X.Y" - do they exist?
- References to sections by name - are names correct?
- References to interfaces/types - are they defined?
- Circular references or dependency loops

**Example issues to find:**
- "See Section 4.1" but Section 4.1 doesn't exist or talks about something else
- "See TemplateSchema" but TemplateSchema is never defined
- "Depends on Section 10" but Section 10 depends on Section 8 which depends on Section 10

**Output format:**
```
CROSS-REFERENCE ISSUES:

1. Line X: References "Section Y.Z" but that section doesn't exist
2. Line A: References "FooInterface" which is never defined
3. Section B depends on Section C which depends on Section B (circular)
```

---

### 2. Data Model Consistency

**Task:** Verify all data structures are consistently defined across sections

**Check for:**
- Same interface defined differently in different sections
- Fields described in prose that don't appear in TypeScript interfaces
- TypeScript interfaces that conflict with descriptions
- Missing required fields in examples
- Type mismatches (string vs number, etc.)

**Example issues to find:**
- Section 2 says Template has `outline_schema` field
- Section 5 says Template has `outlineSchema` field (camelCase vs snake_case)
- Section 2 defines `Template.id` as `string`
- Section 8 defines `Template.id` as `number`

**Output format:**
```
DATA MODEL INCONSISTENCIES:

1. Template.id is defined as 'string' (Line X) and 'number' (Line Y)
2. Case interface in Section 2 has 'court_type' field not in Section 5 definition
3. Paragraph.text is described as optional (Line A) but marked required (Line B)
```

---

### 3. Technology Stack Conflicts

**Task:** Check for conflicting or incompatible technology choices

**Check for:**
- Same component specified with different technologies
- Incompatible versions mentioned
- Deprecated technologies still referenced
- Technology choices that contradict architecture

**Example issues to find:**
- "Use FastAPI for backend" in Section 2
- "Use Flask for backend" in Section 10
- "Python 3.8" in one section, "Python 3.11" in another
- "Browser-based with localStorage" contradicts "Desktop Electron app"

**Output format:**
```
TECHNOLOGY CONFLICTS:

1. Backend specified as FastAPI (Section X) and Flask (Section Y)
2. Python version inconsistent: 3.8 (Line A), 3.11 (Line B)
3. Storage contradicts: localStorage (Section 2) vs SQLite (Section 15)
```

---

### 4. Deployment Model Inconsistencies

**Task:** Verify deployment specifications are internally consistent

**Check for:**
- Contradictory deployment models
- Missing deployment model coverage
- Conflicting port assignments
- Database choices that don't match deployment

**Example issues to find:**
- Service A on port 3001 in Section 10, port 4001 in Section 15
- Desktop deployment uses PostgreSQL but should use SQLite
- Web deployment but no Docker/K8s specifications
- Mobile mentioned but no mobile backend specs

**Output format:**
```
DEPLOYMENT INCONSISTENCIES:

1. records-service port is 3001 (Section X) and 4001 (Section Y)
2. Desktop deployment specifies PostgreSQL but should use SQLite
3. Mobile deployment mentioned (Section A) but no specs in Section B
```

---

### 5. Missing Specifications

**Task:** Identify critical components that are mentioned but never fully specified

**Check for:**
- Services mentioned in architecture but not defined in later sections
- Interfaces referenced but never defined
- Runbooks mentioned but never specified
- Features described but implementation missing

**Example issues to find:**
- "facts-service handles sentence linking" but no Section defining facts-service
- "Template variables support computed values" but no spec for computation
- "Runbook 8 implements Frontend UI" but Section 18.8 doesn't exist
- "Citation detection uses regex patterns" but patterns never provided

**Output format:**
```
MISSING SPECIFICATIONS:

1. facts-service mentioned (Line X) but never fully specified in any section
2. Template variable computation referenced (Line Y) but algorithm not defined
3. Runbook 8 verification criteria missing from Section 18
4. Citation regex patterns mentioned (Line Z) but never provided
```

---

### 6. Terminology Inconsistencies

**Task:** Find cases where same concept is called different names

**Check for:**
- Different names for same entity
- Inconsistent capitalization
- Singular vs plural inconsistencies
- Abbreviations used inconsistently

**Example issues to find:**
- "Template" in Section 2, "DocumentTemplate" in Section 5
- "case block" and "CaseBlock" and "case_block" used interchangeably
- "Evidence" sometimes "Exhibit" sometimes "Attachment"
- "DB" vs "database" vs "Database"

**Output format:**
```
TERMINOLOGY INCONSISTENCIES:

1. Entity called "Template" (Section 2) and "DocumentTemplate" (Section 5)
2. "case block" (lowercase) vs "CaseBlock" (PascalCase) used inconsistently
3. "Evidence" and "Exhibit" used interchangeably (ambiguous)
4. Database abbreviation inconsistent: DB (Line X), database (Line Y)
```

---

### 7. Runbook Dependency Conflicts

**Task:** Verify runbook dependency chain is valid and complete

**Check for:**
- Circular dependencies
- Missing dependencies
- Runbooks that can't be executed in specified order
- Dependencies on non-existent runbooks

**Example issues to find:**
- Runbook 5 depends on Runbook 7, but 7 depends on 6 which depends on 5
- Runbook 10 depends on "database schema" but no runbook creates it
- Runbook 3 uses types from Runbook 8 but 3 comes before 8
- Section 18.5 verifies Runbook 5 but Runbook 5 isn't in execution plan

**Output format:**
```
RUNBOOK DEPENDENCY ISSUES:

1. Circular dependency: Runbook 5 → 7 → 6 → 5
2. Runbook 10 depends on database schema but no prior runbook creates it
3. Runbook 3 uses types from Runbook 8 (order violation)
4. Verification exists for Runbook 5 but runbook not in execution plan
```

---

### 8. API Contract Mismatches

**Task:** Check if API specifications match data models

**Check for:**
- Endpoints that return types not defined
- Required fields in request that aren't in interface
- Response shapes that don't match documented interfaces
- HTTP methods that contradict RESTful conventions

**Example issues to find:**
- POST /templates endpoint returns TemplateResponse but TemplateResponse not defined
- Endpoint requires `template_id` but Template interface has `id` field
- GET /cases/{id} returns Case but documentation says returns CaseWithParties
- PUT used for creating resources instead of POST

**Output format:**
```
API CONTRACT ISSUES:

1. POST /templates returns TemplateResponse (undefined type)
2. Endpoint requires 'template_id' but Template has 'id' field (name mismatch)
3. GET /cases/{id} returns Case but docs say CaseWithParties
4. PUT /templates/{id} creates resource (should be POST)
```

---

### 9. Security & Access Control Gaps

**Task:** Identify security-sensitive operations without specified controls

**Check for:**
- Authentication/authorization not mentioned for sensitive operations
- File access without path validation
- SQL operations without injection protection
- API endpoints without rate limiting

**Example issues to find:**
- "Delete all templates" endpoint but no auth mentioned
- "Read file from path" without path sanitization
- "Execute SQL query" without parameterization
- No rate limiting on expensive operations

**Output format:**
```
SECURITY GAPS:

1. DELETE /templates endpoint (Line X) has no authentication requirement
2. File read operation (Section Y) lacks path validation/sanitization
3. SQL query execution (Line Z) doesn't specify parameterization
4. Export service (Section A) has no rate limiting for expensive operations
```

---

### 10. Verification Criteria Completeness

**Task:** Ensure each runbook has complete, testable verification criteria

**Check for:**
- Runbooks without verification sections
- Vague verification criteria ("it works")
- Missing test coverage requirements
- Success criteria that can't be objectively verified

**Example issues to find:**
- Runbook 5 has no verification section in Section 18
- Verification says "parser works correctly" (not testable)
- No mention of test coverage percentage required
- Success criteria: "user is happy with output" (subjective)

**Output format:**
```
VERIFICATION GAPS:

1. Runbook 5 has no verification criteria in Section 18.5
2. Section 18.3 uses vague criteria: "parser works correctly" (untestable)
3. No test coverage requirements specified for any runbook
4. Runbook 7 success criteria subjective: "orchestrator feels responsive"
```

---

## Output Format

Create a comprehensive report with these sections:

```markdown
# Runbook 0 Comprehensive Audit Report

**Date:** [Current Date]
**Status:** [CLEAN / ISSUES FOUND]
**Total Issues:** [Number]

---

## Executive Summary

[Brief summary of findings, severity, and recommendations]

---

## Critical Issues (Implementation Blockers)

[Issues that would prevent successful implementation]

1. [Issue description]
   - Location: Section X, Lines Y-Z
   - Impact: [What would break]
   - Recommendation: [How to fix]

---

## High Priority Issues (Likely to Cause Problems)

[Issues that would cause significant problems during implementation]

---

## Medium Priority Issues (Should Be Fixed)

[Issues that could cause confusion or minor problems]

---

## Low Priority Issues (Nice to Fix)

[Cosmetic issues, minor inconsistencies]

---

## Detailed Findings

### Cross-Reference Integrity
[All cross-reference issues found]

### Data Model Consistency
[All data model issues found]

### Technology Stack Conflicts
[All technology conflicts found]

### Deployment Model Inconsistencies
[All deployment issues found]

### Missing Specifications
[All missing specs found]

### Terminology Inconsistencies
[All terminology issues found]

### Runbook Dependency Conflicts
[All dependency issues found]

### API Contract Mismatches
[All API issues found]

### Security & Access Control Gaps
[All security issues found]

### Verification Criteria Completeness
[All verification gaps found]

---

## Statistics

- Total issues found: X
- Critical: Y
- High: Z
- Medium: A
- Low: B

---

## Recommendations

1. [First priority fix]
2. [Second priority fix]
...

---

## Files to Update

- Section X.Y needs revision (Issue #1, #3)
- Section A.B needs addition (Issue #5)
- Section C.D needs deletion (Issue #7)
```

---

## Execution Instructions

1. **Read entire document** - Don't skip sections

2. **Track issues systematically** - Use the 10 audit areas above

3. **Be thorough but practical** - Focus on implementation-blocking issues

4. **Don't overthink** - If something seems wrong, flag it

5. **Provide specific locations** - Line numbers or section references

6. **Suggest fixes** - Don't just identify problems

7. **Prioritize ruthlessly** - Some issues matter more than others

---

## What NOT to Flag

**Don't report:**
- Style preferences (unless they create ambiguity)
- Minor typos that don't affect meaning
- Alternative approaches (if current approach is valid)
- Personal opinions on architecture
- Issues already being fixed by PROMPT_1

**DO report:**
- Contradictions
- Missing critical information
- Impossible implementations
- Broken references
- Inconsistent data models

---

## Success Criteria

This audit is successful if it:

✅ Identifies all critical issues that would block implementation  
✅ Provides specific, actionable fixes for each issue  
✅ Prioritizes issues by severity and impact  
✅ Covers all 10 audit areas comprehensively  
✅ Gives confidence in Runbook 0's completeness  

---

## Special Focus Areas

Given what we already found, pay extra attention to:

1. **Any other data model specs** - Are there more contradictory models hiding?
2. **Service definitions** - Are all 8 services fully specified?
3. **Database schemas** - Is there a complete database spec?
4. **IPC channel definitions** - Are all Electron IPC channels documented?
5. **Export/Import specs** - Is DOCX ↔ LegalDocument conversion fully specified?

---

## Questions or Issues?

If you find an issue but aren't sure if it's significant:
1. Flag it anyway
2. Mark it as "Low Priority" or "Needs Review"
3. Explain why you're uncertain
4. Suggest how to verify if it's a real issue

---

Begin the audit now. Be thorough. Find the issues before implementation does.
