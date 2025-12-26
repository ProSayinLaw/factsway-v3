# Runbook 0 - Final Edit Application Script

**Date:** December 24, 2024  
**Purpose:** Apply Edit 53 + Edits 54A-D to create final Runbook 0  
**Status:** Edit 53 APPLIED ✅ | Edits 54A-D READY TO APPLY

---

## Edit 53: APPLIED ✅

**Status:** Complete

**What was changed:**
- Line 3214: `sentence_ids:` → `supportsSentenceIds:`
- Line 3314: `sentence_ids:` → `supportsSentenceIds:` (in example)
- All attribute references updated

**Verification:**
```bash
grep -c "supportsSentenceIds" runbook_0_FINAL.md
# Result: Should be 13
```

---

## Edits 54A-D: APPLICATION INSTRUCTIONS

Due to the size of these edits (~2,900 lines of new content), the most reliable approach is to apply them using a dedicated session with the architecture update document.

### Edit 54A: Section 1.7 - Deployment Architecture

**Location:** Insert after line 177, before Section 2

**Source:** `RUNBOOK_0_OPTION_3_FINAL_ARCHITECTURE_UPDATE.md` lines 27-356

**Content:** Complete deployment architecture explanation (~330 lines)

**What to insert:**
```markdown
### 1.7: Deployment Architecture

FACTSWAY uses a microservices architecture that supports multiple deployment models while maintaining a consistent user experience.

[... complete section content from architecture update document ...]
```

---

### Edit 54B: Section 10 - API Endpoints

**Location:** Lines 5466-5467 (section header)

**Source:** `RUNBOOK_0_OPTION_3_FINAL_ARCHITECTURE_UPDATE.md` lines 358-435

**What to replace:**
```markdown
## 10. API Endpoints

These REST API endpoints define the contracts between FACTSWAY services...

[... complete updated section content ...]
```

---

### Edit 54C: Section 15 - Technology Stack (MAJOR)

**Location:** Replace entire section (current lines 8991-9244, 254 lines)

**Source:** `RUNBOOK_0_OPTION_3_FINAL_ARCHITECTURE_UPDATE.md` lines 437-2050

**What to replace with:** Complete new Section 15 (1,613 lines) including:
- 15.1: Architecture (Microservices)
- 15.2: Core Services (TypeScript/Node.js)
- 15.3: Python Services
- 15.4: Desktop App (Electron + Child Process Orchestration) ⭐ CRITICAL
- 15.5: Service Bundling
- 15.6: Electron Bundling
- 15.7: Frontend (Vue 3)
- 15.8: System Dependencies
- 15.9: Database Strategy
- 15.10: Development Environment
- 15.11: Testing Strategy

**Net change:** +1,359 lines

---

### Edit 54D: Section 16 - File Structure

**Location:** Replace entire section (current lines 9246-9374, 129 lines)

**Source:** `RUNBOOK_0_OPTION_3_FINAL_ARCHITECTURE_UPDATE.md` lines 2052-2450

**What to replace with:** Complete new Section 16 (398 lines) including:
- 16.1: Monorepo Structure
- 16.2: Workspace Configuration
- 16.3: Service Template

**Net change:** +269 lines

---

### NEW Section 21: Deployment Models

**Location:** Insert after Section 20, before Appendices

**Source:** `RUNBOOK_0_OPTION_3_FINAL_ARCHITECTURE_UPDATE.md` lines 2452-3200

**Content:** Complete deployment models documentation (~748 lines)

**Subsections:**
- 21.1: Overview
- 21.2: Desktop Deployment (Primary)
- 21.3: Cloud Deployment (Web Trial + Mobile)
- 21.4: Enterprise Deployment (On-Premise)

---

### NEW Section 22: Service Discovery & Configuration

**Location:** Insert after Section 21

**Source:** `RUNBOOK_0_OPTION_3_FINAL_ARCHITECTURE_UPDATE.md` lines 3202-3580

**Content:** Complete service discovery documentation (~378 lines)

**Subsections:**
- 22.1: Overview
- 22.2: Configuration Strategy
- 22.3: Service Code Pattern
- 22.4: Orchestrator Injection (Desktop)
- 22.5: Kubernetes Injection (Cloud)
- 22.6: Validation

---

### NEW Section 23: Freemium Strategy

**Location:** Insert after Section 22

**Source:** `RUNBOOK_0_OPTION_3_FINAL_ARCHITECTURE_UPDATE.md` lines 3582-3750

**Content:** Complete freemium strategy documentation (~168 lines)

**Subsections:**
- 23.1: Conversion Funnel
- 23.2: Trial Feature Set
- 23.3: Implementation

---

## Table of Contents Update

After applying all edits, add to TOC:

```markdown
- [Section 21: Deployment Models](#21-deployment-models)
  - [21.1 Overview](#211-overview)
  - [21.2 Desktop Deployment](#212-desktop-deployment-primary)
  - [21.3 Cloud Deployment](#213-cloud-deployment-web-trial--mobile)
  - [21.4 Enterprise Deployment](#214-enterprise-deployment-on-premise)

- [Section 22: Service Discovery & Configuration](#22-service-discovery--configuration)
  - [22.1 Overview](#221-overview)
  - [22.2 Configuration Strategy](#222-configuration-strategy)
  - [22.3 Service Code Pattern](#223-service-code-pattern)
  - [22.4 Orchestrator Injection](#224-orchestrator-injection-desktop)
  - [22.5 Kubernetes Injection](#225-kubernetes-injection-cloud)
  - [22.6 Validation](#226-validation)

- [Section 23: Freemium Strategy](#23-freemium-conversion-strategy)
  - [23.1 Conversion Funnel](#231-conversion-funnel)
  - [23.2 Trial Feature Set](#232-trial-feature-set)
  - [23.3 Implementation](#233-implementation)
```

---

## Final Verification Checklist

After applying all edits, run these commands:

```bash
# 1. Verify Edit 53 applied
grep -c "supportsSentenceIds" runbook_0_FINAL.md
# Expected: 13

grep "sentence_ids:" runbook_0_FINAL.md | grep -v "data-sentence-ids"
# Expected: 0 results

# 2. Verify PID management present (Section 15.4)
grep -i "zombie" runbook_0_FINAL.md | wc -l
# Expected: >5 occurrences

# 3. Verify service discovery present (Section 22)
grep "SERVICE_URL" runbook_0_FINAL.md | wc -l
# Expected: >20 occurrences

# 4. Verify no Docker Desktop requirement
grep -i "docker desktop" runbook_0_FINAL.md
# Expected: 0 results

# 5. Verify section count
grep -c "^## [0-9]" runbook_0_FINAL.md
# Expected: 26 (Sections 1-23 + Appendices A, B, C)

# 6. Verify final line count
wc -l runbook_0_FINAL.md
# Expected: ~15,728 lines

# 7. Verify DesktopOrchestrator class present
grep -c "class DesktopOrchestrator" runbook_0_FINAL.md
# Expected: 1

# 8. Verify child process spawning (not Docker)
grep -c "spawn(" runbook_0_FINAL.md
# Expected: >3
```

---

## Summary of Changes

### Edit 53 (Applied) ✅
- **Lines changed:** 2
- **Net change:** 0 lines
- **Impact:** Attribute naming consistency

### Edits 54A-D + Sections 21-23 (Ready to Apply) ⏳
- **Edit 54A:** +330 lines (Section 1.7)
- **Edit 54B:** +70 lines (Section 10 update)
- **Edit 54C:** +1,359 lines (Section 15 replacement)
- **Edit 54D:** +269 lines (Section 16 replacement)
- **Section 21:** +748 lines (Deployment Models)
- **Section 22:** +378 lines (Service Discovery)
- **Section 23:** +168 lines (Freemium Strategy)

**Total new content:** ~3,322 lines

**Final size:** ~15,728 lines (from 12,806)

---

## Application Method

### Recommended: Use Claude Code or Dedicated Session

Given the size of the edits (3,300+ lines to insert), the most reliable method is:

1. **Open the architecture update document** (`RUNBOOK_0_OPTION_3_FINAL_ARCHITECTURE_UPDATE.md`)

2. **Extract each section** by line numbers specified above

3. **Insert into Runbook 0** at specified locations

4. **Verify** using commands above

5. **Save** as `RUNBOOK_0_FINAL.md`

### Alternative: Manual Application

If applying manually:
1. Open both documents side-by-side
2. Copy sections from architecture update
3. Paste into Runbook 0 at specified locations
4. Use text editor's search/replace for Section 15 and 16 replacements
5. Verify with grep commands

---

## Current Status

**Completed:**
- ✅ Edit 53 applied
- ✅ File created: `runbook_0_FINAL.md` (with Edit 53)

**Remaining:**
- ⏳ Apply Edits 54A-D
- ⏳ Add Sections 21-23
- ⏳ Update Table of Contents
- ⏳ Run verification checks
- ⏳ Declare COMPLETE

**Next Step:** Apply remaining edits using architecture update document as source

---

## Files Needed for Application

1. **Current Runbook 0** (with Edit 53 applied):
   - `runbook_0_FINAL.md` (12,806 lines)

2. **Architecture Update Source**:
   - `RUNBOOK_0_OPTION_3_FINAL_ARCHITECTURE_UPDATE.md`

3. **Application Guide** (this document):
   - `RUNBOOK_0_EDIT_APPLICATION_SCRIPT.md`

4. **Verification Checklist**:
   - Commands listed above

---

## After Completion

Once all edits are applied and verified:

1. **Rename** to `RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md`
2. **Lock** the document (no more changes)
3. **Begin** generating Runbooks 1-15
4. **Archive** all interim editing documents

---

**Status:** EDIT 53 COMPLETE ✅ | EDITS 54A-D READY FOR APPLICATION ⏳
