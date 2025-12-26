# FACTSWAY Repository Organization Plan

**Date:** December 24, 2024  
**Purpose:** Clean organization of all Runbook-related documents  
**Status:** Ready to implement

---

## Current Problem

The repository contains ~30 documents related to Runbook 0 development and editing:
- Architecture debates
- Edit proposals
- Status reports
- Session summaries
- Journal entries
- Generation plans
- Etc.

**Need:** Clean, organized structure for ongoing work

---

## Proposed Directory Structure

```
factsway-fresh/
├── docs/
│   ├── runbooks/
│   │   ├── RUNBOOK_0_CONTRACT_DEFINITION.md          ← FINAL (after edits)
│   │   ├── RUNBOOK_01_REFERENCE_DOCUMENT.md          ← To be generated
│   │   ├── RUNBOOK_02_DATABASE_SCHEMA.md             ← To be generated
│   │   ├── ... (RUNBOOK_03 through RUNBOOK_15)       ← To be generated
│   │   │
│   │   └── runbook-0-development/                    ← ARCHIVE
│   │       ├── README.md                              ← Index of archived docs
│   │       ├── edits/
│   │       │   ├── EDIT_53_NAMING_CONSISTENCY.md
│   │       │   ├── EDIT_54A_SECTION_1_7.md
│   │       │   ├── EDIT_54B_SECTION_10.md
│   │       │   ├── EDIT_54C_SECTION_15.md
│   │       │   ├── EDIT_54D_SECTION_16.md
│   │       │   └── RUNBOOK_0_OPTION_3_FINAL_ARCHITECTURE_UPDATE.md
│   │       ├── decisions/
│   │       │   ├── OPTION_1_VS_OPTION_3_DEBATE.md
│   │       │   ├── ARCHITECTURAL_REVIEW_RUNBOOK_0.md
│   │       │   └── EXECUTIVE_SUMMARY_FINAL_ARCHITECTURE.md
│   │       ├── sessions/
│   │       │   ├── SESSION_15_FINAL_SUMMARY.md
│   │       │   └── JOURNAL_ENTRY_SESSION_15.md
│   │       └── planning/
│   │           ├── RUNBOOK_GENERATION_PLAN.md
│   │           ├── RUNBOOK_GENERATION_QUICK_REFERENCE.md
│   │           ├── FACTSWAY_BUILD_EXECUTION_PLAN.md
│   │           └── RUNBOOK_0_STATUS_REPORT.md
│   │
│   ├── runbook-templates/                             ← For Runbook generation
│   │   ├── RUNBOOK_TEMPLATE.md                        ← Standard template
│   │   └── SECTION_EXTRACTION_GUIDE.md                ← How to extract from R0
│   │
│   └── specifications/                                 ← Reference docs
│       ├── SYSTEM_ARCHITECTURE.md                      ← High-level architecture
│       ├── API_SPECIFICATIONS.md                       ← API contracts
│       └── DEPLOYMENT_MODELS.md                        ← Deployment strategies
│
├── .claude/
│   └── JOURNAL.md                                      ← Active journal
│
└── README.md                                           ← Project overview
```

---

## File Categories & Destinations

### Category 1: ACTIVE FILES (Keep in Main Locations)

**docs/runbooks/**
- `RUNBOOK_0_CONTRACT_DEFINITION.md` (FINAL version after edits)
- Future: `RUNBOOK_01` through `RUNBOOK_15` (to be generated)

**docs/runbook-templates/**
- `RUNBOOK_TEMPLATE.md` (for generating Runbooks 1-15)
- `SECTION_EXTRACTION_GUIDE.md` (how to extract from Runbook 0)

**.claude/**
- `JOURNAL.md` (active journal for ongoing work)

---

### Category 2: ESSENTIAL REFERENCE (New Organization)

**docs/specifications/**

These are extracted, cleaned summaries for quick reference:

1. **SYSTEM_ARCHITECTURE.md**
   - High-level architecture overview
   - Microservices breakdown
   - Deployment models summary
   - Service discovery overview
   - Extracted from: Runbook 0 Sections 1.7, 15, 21, 22

2. **API_SPECIFICATIONS.md**
   - Quick reference for all API endpoints
   - Service contracts
   - Extracted from: Runbook 0 Section 10

3. **DEPLOYMENT_MODELS.md**
   - Desktop, Web, Mobile, Enterprise deployment details
   - Configuration examples
   - Extracted from: Runbook 0 Section 21

---

### Category 3: ARCHIVE (Historical Record)

**docs/runbooks/runbook-0-development/**

All documents related to developing/editing Runbook 0:

**edits/** (Edit specifications)
- `EDIT_53_NAMING_CONSISTENCY.md`
- `RUNBOOK_0_OPTION_3_FINAL_ARCHITECTURE_UPDATE.md`
- `RUNBOOK_0_FINAL_COMPLETION_CHECKLIST.md`
- `RUNBOOK_0_EDIT_APPLICATION_SCRIPT.md`

**decisions/** (Architectural decisions)
- `OPTION_1_VS_OPTION_3_DEBATE.md`
- `ARCHITECTURAL_REVIEW_RUNBOOK_0.md`
- `EXECUTIVE_SUMMARY_FINAL_ARCHITECTURE.md`
- `GEMINI_FEEDBACK_*.md`

**sessions/** (Session records)
- `SESSION_15_FINAL_SUMMARY.md`
- `JOURNAL_ENTRY_SESSION_15_CRITICAL_DRIFT_PREVENTION.md`
- Other session summaries

**planning/** (Planning documents)
- `RUNBOOK_GENERATION_PLAN.md`
- `RUNBOOK_GENERATION_QUICK_REFERENCE.md`
- `FACTSWAY_BUILD_EXECUTION_PLAN.md`
- `RUNBOOK_0_STATUS_REPORT.md`
- `FINAL_STATUS_AND_NEXT_ACTIONS.md`

---

## Files to Create

### 1. RUNBOOK_TEMPLATE.md

Standard template for generating Runbooks 1-15:

```markdown
# Runbook [N]: [Title]

**Purpose:** [One sentence]
**Input Required:** [Dependencies]
**Output Deliverables:** [What this produces]
**Estimated Time:** [Hours]
**Dependencies:** [Previous runbooks]

---

## Context
[Where this fits]

## Specifications
[Complete specs from Runbook 0]

## Implementation Requirements
[File structure, dependencies, key files]

## Step-by-Step Instructions
[Detailed steps]

## Verification Criteria
[How to verify success]

## Common Pitfalls
[Known issues + solutions]

## Handoff to Next Runbook
[What next runbook needs]

## Appendix
[Code examples, configs, troubleshooting]
```

### 2. SECTION_EXTRACTION_GUIDE.md

Guide for extracting sections from Runbook 0:

```markdown
# Section Extraction Guide

## How to Extract Sections from Runbook 0

### Method 1: By Section Number
grep -A 100 "^## N\." RUNBOOK_0_CONTRACT_DEFINITION.md

### Method 2: By Section Title
sed -n '/^## N\. Title/,/^## /p' RUNBOOK_0_CONTRACT_DEFINITION.md

### Method 3: By Line Numbers
sed -n 'START,ENDp' RUNBOOK_0_CONTRACT_DEFINITION.md

## Section Line Number Index
[Complete index of all sections with line numbers]
```

### 3. README.md (in runbook-0-development/)

Index of all archived documents:

```markdown
# Runbook 0 Development Archive

This directory contains all documents created during the development and editing of Runbook 0.

## Purpose
Historical record of:
- Architectural decisions
- Edit specifications
- Session summaries
- Planning documents

## Organization
- `edits/` - Edit specifications and update documents
- `decisions/` - Architectural debates and decisions
- `sessions/` - Session summaries and journals
- `planning/` - Generation plans and execution plans

## Key Documents
[List with descriptions]

## Timeline
[Chronological overview of development]
```

---

## Implementation Steps

### Step 1: Create Directory Structure
```bash
cd factsway-fresh

# Create new directories
mkdir -p docs/runbooks/runbook-0-development/{edits,decisions,sessions,planning}
mkdir -p docs/runbook-templates
mkdir -p docs/specifications
```

### Step 2: Move Files to Archive
```bash
# Move edit-related docs
mv docs/RUNBOOK_0_OPTION_3*.md docs/runbooks/runbook-0-development/edits/
mv docs/RUNBOOK_0_FINAL_COMPLETION_CHECKLIST.md docs/runbooks/runbook-0-development/edits/

# Move decision docs
mv docs/*ARCHITECTURAL*.md docs/runbooks/runbook-0-development/decisions/
mv docs/*EXECUTIVE_SUMMARY*.md docs/runbooks/runbook-0-development/decisions/
mv docs/*OPTION*.md docs/runbooks/runbook-0-development/decisions/

# Move session docs
mv docs/SESSION_*.md docs/runbooks/runbook-0-development/sessions/
mv docs/JOURNAL_ENTRY_*.md docs/runbooks/runbook-0-development/sessions/

# Move planning docs
mv docs/RUNBOOK_GENERATION*.md docs/runbooks/runbook-0-development/planning/
mv docs/FACTSWAY_BUILD*.md docs/runbooks/runbook-0-development/planning/
mv docs/RUNBOOK_0_STATUS*.md docs/runbooks/runbook-0-development/planning/
mv docs/FINAL_STATUS*.md docs/runbooks/runbook-0-development/planning/
```

### Step 3: Create New Files
```bash
# Create templates
touch docs/runbook-templates/RUNBOOK_TEMPLATE.md
touch docs/runbook-templates/SECTION_EXTRACTION_GUIDE.md

# Create specifications
touch docs/specifications/SYSTEM_ARCHITECTURE.md
touch docs/specifications/API_SPECIFICATIONS.md
touch docs/specifications/DEPLOYMENT_MODELS.md

# Create archive index
touch docs/runbooks/runbook-0-development/README.md
```

### Step 4: Place Final Runbook 0
```bash
# After all edits applied
cp runbook_0_FINAL.md docs/runbooks/RUNBOOK_0_CONTRACT_DEFINITION.md
```

---

## After Organization

### Clean Repository Structure

**Active Work:**
```
docs/
├── runbooks/
│   └── RUNBOOK_0_CONTRACT_DEFINITION.md        ← FINAL, locked
├── runbook-templates/
│   ├── RUNBOOK_TEMPLATE.md                      ← For generation
│   └── SECTION_EXTRACTION_GUIDE.md              ← For extraction
└── specifications/
    ├── SYSTEM_ARCHITECTURE.md                   ← Quick reference
    ├── API_SPECIFICATIONS.md                    ← Quick reference
    └── DEPLOYMENT_MODELS.md                     ← Quick reference
```

**Archived:**
```
docs/runbooks/runbook-0-development/
├── README.md                                     ← Archive index
├── edits/                                        ← Edit specs (7 files)
├── decisions/                                    ← Decisions (5 files)
├── sessions/                                     ← Sessions (3 files)
└── planning/                                     ← Planning (6 files)
```

**Total:** ~21 files archived, 7 files active

---

## Benefits

### For Current Work
- ✅ Clean, focused directory structure
- ✅ Easy to find active documents
- ✅ Quick reference specifications available

### For Future Work
- ✅ Clear template for Runbook generation
- ✅ Extraction guide for pulling from Runbook 0
- ✅ Historical record preserved but out of the way

### For Collaboration
- ✅ New developers can find current state easily
- ✅ Historical decisions documented
- ✅ Clear progression from planning → execution

---

## Next Steps

### Immediate (Today)
1. Create directory structure
2. Move files to archive
3. Create new template files
4. Create archive index

### Tomorrow (After Final Edits)
1. Place final Runbook 0 in docs/runbooks/
2. Extract specification summaries
3. Begin generating Runbook 1

### Ongoing
1. Generate Runbooks 1-15 into docs/runbooks/
2. Update journal in .claude/JOURNAL.md
3. Keep archive for historical reference

---

## Summary

**Current:** 30+ documents scattered  
**After:** 7 active files + 21 archived files, organized  
**Benefit:** Clean, professional repository structure

**Status:** Ready to implement ✅
