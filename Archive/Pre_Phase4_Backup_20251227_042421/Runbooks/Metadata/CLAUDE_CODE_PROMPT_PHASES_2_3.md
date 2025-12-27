# Claude Code Prompt: Metadata Mechanical Fixes (Phases 2-3)

**Objective:** Execute systematic mechanical fixes to all metadata files to achieve strict validation compliance.

**Working Directory:** `/Users/alexcruz/Documents/4.0 UI and Backend 360/Runbooks/Metadata/`

---

## Phase 2: INVARIANT Prefix Fix (45 min)

**Task:** Replace all bold markdown INVARIANT prefixes with plain text format.

**Pattern to Find:** `- **INVARIANT:**`  
**Replacement:** `- INVARIANT:`

**Files to Modify:**
1. `RUNBOOK_1_METADATA.md`
2. `RUNBOOK_2_METADATA.md`
3. `RUNBOOK_3_METADATA.md`
4. `RUNBOOK_4_5_METADATA.md`
5. `RUNBOOK_6_METADATA.md`
6. `RUNBOOK_7_METADATA.md`
7. `RUNBOOK_8_9_10_METADATA.md`
8. `BATCH_3_METADATA.md` (will be split in Phase 3)

**Systematic Approach:**

For EACH file:
1. Read the file
2. Find ALL occurrences of `- **INVARIANT:**`
3. Replace with `- INVARIANT:` (remove bold markdown)
4. Save the file
5. Log: "Fixed X INVARIANT prefixes in [filename]"

**Validation After Phase 2:**
```bash
grep -n "\*\*INVARIANT:\*\*" Metadata/*.md
```
**Expected Output:** No results (all bold invariants fixed)

---

## Phase 3: Split BATCH_3_METADATA.md (30 min)

**Task:** Split `BATCH_3_METADATA.md` into 5 separate metadata files.

**Source File:** `Metadata/BATCH_3_METADATA.md`

**Target Files to Create:**
1. `Metadata/RUNBOOK_11_METADATA.md` - E2E Testing
2. `Metadata/RUNBOOK_12_METADATA.md` - Integration Testing
3. `Metadata/RUNBOOK_13_METADATA.md` - User Documentation
4. `Metadata/RUNBOOK_14_METADATA.md` - CI/CD Pipelines
5. `Metadata/RUNBOOK_15_METADATA.md` - Production Deployment

**Section Boundaries in BATCH_3_METADATA.md:**

**Runbook 11 Start:** Line 1 → Heading `## Metadata Summary for Runbook 11: E2E Testing Suite`  
**Runbook 11 End:** Before `## Metadata Summary for Runbook 12`

**Runbook 12 Start:** Heading `## Metadata Summary for Runbook 12: Integration Testing`  
**Runbook 12 End:** Before `## Metadata Summary for Runbook 13`

**Runbook 13 Start:** Heading `## Metadata Summary for Runbook 13: User Documentation`  
**Runbook 13 End:** Before `## Metadata Summary for Runbook 14`

**Runbook 14 Start:** Heading `## Metadata Summary for Runbook 14: CI/CD Pipelines`  
**Runbook 14 End:** Before `## Metadata Summary for Runbook 15`

**Runbook 15 Start:** Heading `## Metadata Summary for Runbook 15: Production Deployment & Monitoring`  
**Runbook 15 End:** Line that says `**End of Metadata for Batch 3 (Runbooks 11-15)**`

**Heading Fix Required:**
- Change all `## Metadata Summary for Runbook X: [Title]` → `## Metadata Summary`
- Reason: Validation expects exact heading match "Metadata Summary" (no "for Runbook X")

**Systematic Approach:**

1. **Read BATCH_3_METADATA.md completely**
2. **Identify section boundaries** (search for "## Metadata Summary for Runbook")
3. **Extract Runbook 11:**
   - Start: Line 1
   - End: Line before "## Metadata Summary for Runbook 12"
   - Change heading: `## Metadata Summary for Runbook 11: E2E Testing Suite` → `## Metadata Summary`
   - Save as: `Metadata/RUNBOOK_11_METADATA.md`
   - Add footer: `**End of Metadata for Runbook 11**`

4. **Extract Runbook 12:**
   - Start: "## Metadata Summary for Runbook 12"
   - End: Line before "## Metadata Summary for Runbook 13"
   - Change heading: `## Metadata Summary for Runbook 12: Integration Testing` → `## Metadata Summary`
   - Save as: `Metadata/RUNBOOK_12_METADATA.md`
   - Add footer: `**End of Metadata for Runbook 12**`

5. **Extract Runbook 13:**
   - Start: "## Metadata Summary for Runbook 13"
   - End: Line before "## Metadata Summary for Runbook 14"
   - Change heading: `## Metadata Summary for Runbook 13: User Documentation` → `## Metadata Summary`
   - Save as: `Metadata/RUNBOOK_13_METADATA.md`
   - Add footer: `**End of Metadata for Runbook 13**`

6. **Extract Runbook 14:**
   - Start: "## Metadata Summary for Runbook 14"
   - End: Line before "## Metadata Summary for Runbook 15"
   - Change heading: `## Metadata Summary for Runbook 14: CI/CD Pipelines` → `## Metadata Summary`
   - Save as: `Metadata/RUNBOOK_14_METADATA.md`
   - Add footer: `**End of Metadata for Runbook 14**`

7. **Extract Runbook 15:**
   - Start: "## Metadata Summary for Runbook 15"
   - End: "**End of Metadata for Batch 3**"
   - Change heading: `## Metadata Summary for Runbook 15: Production Deployment & Monitoring` → `## Metadata Summary`
   - Save as: `Metadata/RUNBOOK_15_METADATA.md`
   - Add footer: `**End of Metadata for Runbook 15**`

8. **Delete BATCH_3_METADATA.md** (no longer needed)

**Validation After Phase 3:**
```bash
ls -la Metadata/RUNBOOK_*.md | wc -l
```
**Expected Output:** 13 files (RUNBOOK_0, RUNBOOK_1, ..., RUNBOOK_15, plus combined files 4_5, 8_9_10)

**File Count Check:**
```bash
ls Metadata/RUNBOOK_11_METADATA.md  # Should exist
ls Metadata/RUNBOOK_12_METADATA.md  # Should exist
ls Metadata/RUNBOOK_13_METADATA.md  # Should exist
ls Metadata/RUNBOOK_14_METADATA.md  # Should exist
ls Metadata/RUNBOOK_15_METADATA.md  # Should exist
ls Metadata/BATCH_3_METADATA.md     # Should NOT exist (deleted)
```

---

## Phase 2 & 3 Execution Summary

**After completing both phases, you should have:**

✅ **8 files with INVARIANT prefix fixed:**
- RUNBOOK_1_METADATA.md
- RUNBOOK_2_METADATA.md
- RUNBOOK_3_METADATA.md
- RUNBOOK_4_5_METADATA.md
- RUNBOOK_6_METADATA.md
- RUNBOOK_7_METADATA.md
- RUNBOOK_8_9_10_METADATA.md
- (BATCH_3 split into 5 files with fixes applied)

✅ **5 new metadata files created from BATCH_3 split:**
- RUNBOOK_11_METADATA.md
- RUNBOOK_12_METADATA.md
- RUNBOOK_13_METADATA.md
- RUNBOOK_14_METADATA.md
- RUNBOOK_15_METADATA.md

✅ **1 file deleted:**
- BATCH_3_METADATA.md (no longer needed)

✅ **All heading fixes applied:**
- All `## Metadata Summary for Runbook X: [Title]` → `## Metadata Summary`

**Total Metadata Files in `/Metadata/` After Phases 2-3:**
1. RUNBOOK_0_METADATA.md (user will add manually from outputs)
2. RUNBOOK_1_METADATA.md
3. RUNBOOK_2_METADATA.md
4. RUNBOOK_3_METADATA.md
5. RUNBOOK_4_5_METADATA.md (covers both Runbooks 4 and 5)
6. RUNBOOK_6_METADATA.md
7. RUNBOOK_7_METADATA.md
8. RUNBOOK_8_9_10_METADATA.md (covers Runbooks 8, 9, 10)
9. RUNBOOK_11_METADATA.md
10. RUNBOOK_12_METADATA.md
11. RUNBOOK_13_METADATA.md
12. RUNBOOK_14_METADATA.md
13. RUNBOOK_15_METADATA.md

**Expected Count:** 13 metadata files

---

## Validation Commands

**After Phase 2 (INVARIANT fix):**
```bash
# Check for remaining bold invariants (should return nothing)
grep -n "\*\*INVARIANT:\*\*" Metadata/*.md

# Count plain INVARIANT prefixes (should be 100+)
grep -c "^- INVARIANT:" Metadata/*.md
```

**After Phase 3 (File split):**
```bash
# Count metadata files (should be 13)
ls Metadata/RUNBOOK_*.md | wc -l

# Verify BATCH_3 deleted
ls Metadata/BATCH_3_METADATA.md 2>&1 | grep "No such file"

# Verify all 5 new files exist
for i in 11 12 13 14 15; do
  if [ -f "Metadata/RUNBOOK_${i}_METADATA.md" ]; then
    echo "✓ RUNBOOK_${i}_METADATA.md exists"
  else
    echo "✗ RUNBOOK_${i}_METADATA.md MISSING"
  fi
done

# Verify heading format (should all be "## Metadata Summary")
grep -n "## Metadata Summary for Runbook" Metadata/*.md
# Expected: No results (all headings fixed to plain "## Metadata Summary")
```

---

## Error Handling

**If Phase 2 fails (INVARIANT replacement):**
- Log: Which file failed
- Continue to next file (don't abort entire operation)
- Report failed files at end

**If Phase 3 fails (file split):**
- Do NOT delete BATCH_3_METADATA.md until all 5 new files created successfully
- Verify each extracted file is non-empty before proceeding
- If extraction fails, keep BATCH_3_METADATA.md and report error

---

## Completion Report

**After both phases complete, generate report:**

```
===== METADATA MECHANICAL FIXES COMPLETE =====

Phase 2: INVARIANT Prefix Fix
- Files processed: 8
- Total replacements: [count]
- Validation: [PASS/FAIL]

Phase 3: BATCH_3 File Split
- Files created: 5
  ✓ RUNBOOK_11_METADATA.md
  ✓ RUNBOOK_12_METADATA.md
  ✓ RUNBOOK_13_METADATA.md
  ✓ RUNBOOK_14_METADATA.md
  ✓ RUNBOOK_15_METADATA.md
- BATCH_3_METADATA.md deleted: [YES/NO]
- Heading fixes applied: 5
- Validation: [PASS/FAIL]

Total metadata files: [count]
Expected: 13

Next Steps:
1. User adds Template Notes to all 13 files
2. User adds RUNBOOK_0_METADATA.md to Metadata/
3. Run validation script to verify GREEN status
```

---

## Critical Notes

**DO NOT:**
- Modify any other files besides those listed
- Change anything other than INVARIANT prefixes and heading formats
- Delete BATCH_3_METADATA.md before all 5 new files created successfully
- Modify content within invariant descriptions (only prefix format)

**DO:**
- Verify file counts before/after each phase
- Test validation commands after completion
- Generate completion report
- Log all operations for review

---

**End of Claude Code Prompt**
