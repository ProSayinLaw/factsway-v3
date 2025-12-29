# 9-HOUR PREP PLAN - EXECUTION GUIDE

**Status:** Ready to execute  
**Total Time:** 9 hours  
**Goal:** Prepare all infrastructure before Phase 4 implementation

---

## OVERVIEW

This prep plan sets up the foundation for Phase 4. You'll create:
1. ✅ Decision documentation (done - see ARCHITECTURAL_DECISIONS_SUMMARY.md)
2. JSON Schema infrastructure (generates TypeScript + Python types)
3. Feature Registry infrastructure (documents all 8 clerks)
4. NUPunkt verification (or NLTK fallback)
5. Pandoc verification (confirm 3.6+)
6. Updated Runbooks (with all decisions and new estimates)

---

## EXECUTION SEQUENCE

### **HOUR 0-1: Decision Documentation** ✅ COMPLETE

Already done! See: `ARCHITECTURAL_DECISIONS_SUMMARY.md`

---

### **HOURS 1-6: JSON Schema + Feature Registry**

**What:** Create the foundation for type safety and feature documentation

**Tool:** Claude Code

**Prompt to use:** `CLAUDE_CODE_PROMPT_1_JSON_SCHEMA_REGISTRY.md`

#### **Step 1: Open Claude Code**

```bash
# In terminal
cd "/Users/alexcruz/Documents/4.0 UI and Backend 360"
claude-code
```

#### **Step 2: Give Claude Code the prompt**

Copy the ENTIRE contents of `CLAUDE_CODE_PROMPT_1_JSON_SCHEMA_REGISTRY.md` and paste into Claude Code.

Or use this shortened version:

```
I need you to create the JSON Schema and Feature Registry infrastructure for FACTSWAY.

Read the full instructions from: CLAUDE_CODE_PROMPT_1_JSON_SCHEMA_REGISTRY.md

Key tasks:
1. Create directory structure (packages/shared-types/schemas, registry, etc.)
2. Create legal-document.schema.json (comprehensive LegalDocument schema)
3. Create generation scripts (TypeScript + Python from JSON Schema)
4. Create ClerkDefinition interface
5. Create Facts Clerk definition (template for others)
6. Create registry exports with helper functions
7. Test everything compiles

Time: 5-6 hours
Repository: /Users/alexcruz/Documents/4.0 UI and Backend 360

Please execute all tasks in the prompt file.
```

#### **Step 3: What Claude Code will create**

```
packages/shared-types/
├── schemas/
│   └── legal-document.schema.json          [JSON Schema - single source]
├── src/
│   ├── legal-document.types.ts             [Generated TypeScript]
│   └── registry/
│       ├── clerk-definition.interface.ts   [Feature Registry types]
│       ├── clerks/
│       │   └── facts-clerk.definition.ts   [Facts Clerk template]
│       └── index.ts                        [Registry exports]
├── python/
│   └── legal_document.py                   [Generated Python models]
├── scripts/
│   ├── generate-typescript.sh
│   ├── generate-python.sh
│   └── generate-all.sh
├── package.json
├── tsconfig.json
└── README.md
```

#### **Step 4: Verify results**

After Claude Code finishes:

```bash
cd packages/shared-types

# Verify generation works
./scripts/generate-all.sh

# Should see:
# ✓ TypeScript types generated
# ✓ Python models generated
# ✓ TypeScript compiles
# ✓ Python imports successfully

# Verify TypeScript compiles
npm install
npm run build

# Verify Python imports
python3 -c "from python.legal_document import LegalDocument; print('✓ Success')"
```

**Expected output:**
- ✓ All files created
- ✓ Scripts run successfully
- ✓ Types compile
- ✓ No errors

**If errors:** Claude Code can debug and fix them

**Time:** 5-6 hours

---

### **HOURS 6-8: NUPunkt & Pandoc Verification**

**What:** Verify sentence tokenizer and document converter are working

**Tool:** Claude Code

**Prompt to use:** `CLAUDE_CODE_PROMPT_2_NUPUNKT_PANDOC.md`

#### **Step 1: Give Claude Code the prompt**

Copy contents of `CLAUDE_CODE_PROMPT_2_NUPUNKT_PANDOC.md` or use shortened version:

```
I need you to verify NUPunkt and Pandoc for FACTSWAY.

Read full instructions from: CLAUDE_CODE_PROMPT_2_NUPUNKT_PANDOC.md

Key tasks:
1. Create scripts/test-nupunkt.py (test sentence tokenizer)
2. Create scripts/test-pandoc.sh (test document converter)
3. Run both tests
4. Create docs/NUPUNKT_VERIFICATION_REPORT.md with results
5. Create docs/PANDOC_BUNDLING_STRATEGY.md with bundling plan

Time: 2 hours
Repository: /Users/alexcruz/Documents/4.0 UI and Backend 360

Please execute all tasks.
```

#### **Step 2: What Claude Code will create**

```
scripts/
├── test-nupunkt.py          [NUPunkt verification test]
└── test-pandoc.sh           [Pandoc verification test]

docs/
├── NUPUNKT_VERIFICATION_REPORT.md    [Test results + recommendation]
└── PANDOC_BUNDLING_STRATEGY.md       [Bundling implementation plan]
```

#### **Step 3: Claude Code will run tests**

**NUPunkt test:**
- Try installing NUPunkt
- Test with Texas legal text
- Check citation handling
- Report: Use NUPunkt or fallback to NLTK

**Pandoc test:**
- Check version (need 3.6+)
- Test footnote handling
- Verify round-trip conversion
- Document bundling strategy

#### **Step 4: Review reports**

After tests complete, read:

1. **`docs/NUPUNKT_VERIFICATION_REPORT.md`**
   - ✓ Production ready? → Use NUPunkt (91% accuracy)
   - ⚠ Issues? → Use NLTK fallback (85% accuracy)

2. **`docs/PANDOC_BUNDLING_STRATEGY.md`**
   - ✓ Version 3.6+? → Ready to bundle
   - ⚠ Older version? → Upgrade needed

**Expected outcomes:**
- NUPunkt works OR NLTK fallback documented
- Pandoc 3.6+ verified OR upgrade plan documented
- Bundling strategy clear

**Time:** 2 hours

---

### **HOUR 8-9: Update Runbooks**

**What:** Apply all decisions and new estimates to Runbooks 0, 1, 8, and 10

**Tool:** Manual editing (or Claude Code can help)

**Instructions:** `RUNBOOK_UPDATES_INSTRUCTIONS.md`

#### **Files to edit:**

1. **`Runbooks/RUNBOOK_0_CORE_SYSTEM_DESIGN.md`**
   - Section 1.2: Change "React" → "Vue 3"
   - Section 2.9.3: Add Sentence ID algorithm
   - Remove LibreOffice → Electron printToPDF

2. **`Runbooks/RUNBOOK_1_SHARED_TYPES_PACKAGE.md`**
   - Update estimate: 2-3h → 8-9h
   - Add Task 0: pnpm workspaces setup
   - Add Task 1.5: JSON Schema section
   - Add Task 1.6: Feature Registry section

3. **`Runbooks/RUNBOOK_8_FRONTEND_RENDERER.md`**
   - Update estimate: 12-16h → 27-33h
   - Add Task 5.4: Custom footnote extension
   - Add Task 9: Document clerks in Feature Registry

4. **`Runbooks/RUNBOOK_10_DESKTOP_PACKAGING.md`**
   - Update estimate: 10-14h → 16-22h
   - Add Task 3: PyInstaller strategy (detailed)
   - Add Task 5: Pandoc bundling section

#### **Option A: Manual editing**

Open each file and make changes per `RUNBOOK_UPDATES_INSTRUCTIONS.md`

**Time:** 1 hour

#### **Option B: Use Claude Code**

```
I need you to update Runbooks 0, 1, 8, and 10 with our finalized decisions.

Read full instructions from: RUNBOOK_UPDATES_INSTRUCTIONS.md

For each runbook, make the specified changes:
- Update time estimates
- Add new sections
- Update framework choices
- Document bundling strategies

Repository: /Users/alexcruz/Documents/4.0 UI and Backend 360

Please apply all updates carefully, preserving existing content.
```

**Time:** 30 min (Claude Code) or 1 hour (manual)

#### **Verification**

After updates, check:

- [ ] Runbook 0 mentions Vue 3 (not React)
- [ ] Runbook 0 has Sentence ID algorithm section
- [ ] Runbook 1 estimate is 8-9h
- [ ] Runbook 1 has JSON Schema + Registry sections
- [ ] Runbook 8 estimate is 27-33h
- [ ] Runbook 8 has custom footnote + registry tasks
- [ ] Runbook 10 estimate is 16-22h
- [ ] Runbook 10 has PyInstaller + Pandoc sections

---

## COMPLETION CHECKLIST

After all 9 hours:

### **Infrastructure Created:**
- [ ] JSON Schema in `packages/shared-types/schemas/`
- [ ] Generation scripts working (TypeScript + Python)
- [ ] Feature Registry infrastructure in `packages/shared-types/src/registry/`
- [ ] Facts Clerk definition complete (template for others)
- [ ] pnpm workspace configured

### **Verification Complete:**
- [ ] NUPunkt tested (or NLTK fallback documented)
- [ ] Pandoc 3.6+ verified (or upgrade plan documented)
- [ ] Test reports created in `docs/`

### **Runbooks Updated:**
- [ ] Runbook 0: Vue 3, Sentence ID, no LibreOffice
- [ ] Runbook 1: JSON Schema, Registry, pnpm, 8-9h estimate
- [ ] Runbook 8: Custom footnote, clerk definitions, 27-33h estimate
- [ ] Runbook 10: PyInstaller, Pandoc bundling, 16-22h estimate

### **Documentation:**
- [ ] ARCHITECTURAL_DECISIONS_SUMMARY.md ✅ (already created)
- [ ] NUPUNKT_VERIFICATION_REPORT.md
- [ ] PANDOC_BUNDLING_STRATEGY.md

---

## DELIVERABLES

After 9 hours, you'll have:

**Foundation Code:**
```
packages/shared-types/
  ├── schemas/legal-document.schema.json
  ├── src/legal-document.types.ts (generated)
  ├── src/registry/ (complete Feature Registry)
  ├── python/legal_document.py (generated)
  └── scripts/ (generation scripts)
```

**Verification:**
```
scripts/
  ├── test-nupunkt.py
  └── test-pandoc.sh

docs/
  ├── NUPUNKT_VERIFICATION_REPORT.md
  └── PANDOC_BUNDLING_STRATEGY.md
```

**Updated Runbooks:**
- Runbook 0, 1, 8, 10 with all decisions and realistic estimates

**Documentation:**
- All 5 decisions documented
- Test results documented
- Bundling strategies documented

---

## WHAT HAPPENS NEXT

After prep complete:

✅ **Ready to begin Phase 4**

**Start with:** Runbook 1 (8-9 hours)
- Setup monorepo with pnpm workspaces
- Implement JSON Schema generation (already set up, just verify)
- Setup Feature Registry (already set up, just verify)
- You're building on the foundation created in prep

**Then:** Runbooks 2-15 sequentially (118-161 hours)

**Total:** 127-170 hours (16-21 work days)

---

## TROUBLESHOOTING

### **If JSON Schema generation fails:**

```bash
# Reinstall tools
npm install -g quicktype
pip install datamodel-code-generator --break-system-packages

# Try again
cd packages/shared-types
./scripts/generate-all.sh
```

### **If NUPunkt fails:**

Don't worry! NLTK fallback is documented. Use this in Runbook 4:

```python
try:
    from nupunkt import NUPunktSentenceTokenizer
    tokenizer = NUPunktSentenceTokenizer()
except ImportError:
    from nltk.tokenize import sent_tokenize
    tokenizer = None

def split_sentences(text):
    if tokenizer:
        return tokenizer.tokenize(text)
    else:
        return sent_tokenize(text)
```

### **If Pandoc version is old:**

Upgrade:
```bash
# macOS
brew upgrade pandoc

# Linux
sudo apt update && sudo apt install pandoc

# Windows
# Download from https://pandoc.org/installing.html
```

---

## TIME BREAKDOWN

| Task | Time | Tool |
|------|------|------|
| Hour 0-1: Decisions | ✅ Done | Claude Chat |
| Hour 1-6: JSON Schema + Registry | 5-6h | Claude Code |
| Hour 6-8: NUPunkt + Pandoc | 2h | Claude Code |
| Hour 8-9: Update Runbooks | 1h | Manual or Claude Code |
| **Total** | **9h** | |

---

## CONFIDENCE LEVEL

**VERY HIGH** ✅

**Why:**
- All decisions finalized with clear rationale
- Claude Code prompts are detailed and complete
- Verification steps ensure everything works
- Fallback plans documented (NLTK, Pandoc upgrade)
- Runbook updates are specific and clear

**Ready to execute!** 🎯

---

**Next step:** Give Claude Code the first prompt (`CLAUDE_CODE_PROMPT_1_JSON_SCHEMA_REGISTRY.md`)
