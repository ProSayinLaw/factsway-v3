# BACKEND ARCHITECTURE AUDIT - Master Execution Guide

**Complete Package:** Three-part comprehensive audit for drift prevention  
**Estimated Time:** 30-45 minutes to run all parts  
**Output Size:** ~2,000-3,000 lines of organized documentation  
**Safe to Run:** Read-only, no code modifications

---

## Package Overview

This audit package maps your entire backend architecture in three parts:

| Part | Purpose | Output | Time |
|------|---------|--------|------|
| **Part 1** | Current state deep scan | What exists NOW | 10-15 min |
| **Part 2** | Target state from Runbook 0 | What WILL exist | 5-10 min |
| **Part 3** | Comparison & visual diagrams | Diff + progress tracking | 15-20 min |

**Total:** ~2,000-3,000 lines of documentation showing exactly what changes

---

## Quick Start

### Step 1: Download All Parts

```bash
# Save these files from Claude's outputs:
# - BACKEND_AUDIT_PART_1_CURRENT_STATE.md
# - BACKEND_AUDIT_PART_2_TARGET_STATE.md
# - BACKEND_AUDIT_PART_3_COMPARISON.md

# Or create a single directory:
mkdir -p ~/factsway-audit
cd ~/factsway-audit

# Save all three files here
```

### Step 2: Extract Shell Scripts

Each part contains bash scripts in code blocks. Extract them:

```bash
# From Part 1, extract 5 scripts:
# - part-1a-scan.sh
# - part-1b-classification.sh
# - part-1c-ipc-channels.sh
# - part-1d-api-routes.sh
# - part-1e-dependencies.sh

# From Part 2, extract 3 scripts:
# - part-2a-target-structure.sh
# - part-2b-service-interfaces.sh
# - part-2c-migration-plan.sh

# From Part 3, extract 4 scripts:
# - part-3a-comparison.sh
# - part-3b-diagrams.sh
# - part-3c-tracker.sh
# - part-3d-drift-detector.sh
```

### Step 3: Update Paths

In each script, replace `/path/to/factsway-backend` with your actual path:

```bash
# Example:
cd ~/factsway-audit

# Update all scripts
find . -name "*.sh" -exec sed -i '' 's|/path/to/factsway-backend|/Users/alex/Documents/factsway-backend|g' {} +

# Make executable
chmod +x *.sh
```

### Step 4: Run Complete Audit

```bash
# Run all parts in sequence
./run-complete-audit.sh
```

---

## Automated Execution Script

Create this master script to run everything:

```bash
#!/bin/bash
# File: run-complete-audit.sh

set -e  # Exit on error

BACKEND_PATH="/Users/alex/Documents/factsway-backend"
OUTPUT_DIR="/tmp/factsway-audit-results"

echo "=================================================="
echo "  FACTSWAY BACKEND ARCHITECTURE AUDIT"
echo "=================================================="
echo ""
echo "Backend Path: $BACKEND_PATH"
echo "Output Directory: $OUTPUT_DIR"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Part 1: Current State
echo "=== PART 1: CURRENT STATE ANALYSIS ==="
echo ""

cd "$BACKEND_PATH"

echo "[1A] File system scan..."
bash ~/factsway-audit/part-1a-scan.sh > "$OUTPUT_DIR/1a-scan.log" 2>&1
echo "✓ Complete"

echo "[1B] Component classification..."
bash ~/factsway-audit/part-1b-classification.sh > "$OUTPUT_DIR/1b-classification.log" 2>&1
echo "✓ Complete"

echo "[1C] IPC channel inventory..."
bash ~/factsway-audit/part-1c-ipc-channels.sh > "$OUTPUT_DIR/1c-ipc.log" 2>&1
echo "✓ Complete"

echo "[1D] API route inventory..."
bash ~/factsway-audit/part-1d-api-routes.sh > "$OUTPUT_DIR/1d-routes.log" 2>&1
echo "✓ Complete"

echo "[1E] Dependency graph..."
bash ~/factsway-audit/part-1e-dependencies.sh > "$OUTPUT_DIR/1e-deps.log" 2>&1
echo "✓ Complete"

# Combine Part 1 outputs
cat /tmp/backend-current-architecture.md \
    /tmp/backend-component-classification.md \
    /tmp/backend-ipc-channels.md \
    /tmp/backend-api-routes.md \
    /tmp/backend-dependencies.md \
    > "$OUTPUT_DIR/PART_1_CURRENT_STATE.md"

echo ""
echo "Part 1 complete: $OUTPUT_DIR/PART_1_CURRENT_STATE.md"
echo ""

# Part 2: Target State
echo "=== PART 2: TARGET STATE FROM RUNBOOK 0 ==="
echo ""

echo "[2A] Target structure..."
bash ~/factsway-audit/part-2a-target-structure.sh > "$OUTPUT_DIR/2a-target.log" 2>&1
echo "✓ Complete"

echo "[2B] Service interfaces..."
bash ~/factsway-audit/part-2b-service-interfaces.sh > "$OUTPUT_DIR/2b-interfaces.log" 2>&1
echo "✓ Complete"

echo "[2C] Migration plan..."
bash ~/factsway-audit/part-2c-migration-plan.sh > "$OUTPUT_DIR/2c-migration.log" 2>&1
echo "✓ Complete"

# Combine Part 2 outputs
cat /tmp/backend-target-architecture.md \
    /tmp/backend-service-interfaces.md \
    /tmp/backend-migration-plan.md \
    > "$OUTPUT_DIR/PART_2_TARGET_STATE.md"

echo ""
echo "Part 2 complete: $OUTPUT_DIR/PART_2_TARGET_STATE.md"
echo ""

# Part 3: Comparison & Tracking
echo "=== PART 3: COMPARISON & TRACKING ==="
echo ""

echo "[3A] Architecture comparison..."
bash ~/factsway-audit/part-3a-comparison.sh > "$OUTPUT_DIR/3a-comparison.log" 2>&1
echo "✓ Complete"

echo "[3B] Mermaid diagrams..."
bash ~/factsway-audit/part-3b-diagrams.sh > "$OUTPUT_DIR/3b-diagrams.log" 2>&1
echo "✓ Complete"

echo "[3C] Progress tracker..."
bash ~/factsway-audit/part-3c-tracker.sh > "$OUTPUT_DIR/3c-tracker.log" 2>&1
echo "✓ Complete"

# Combine Part 3 outputs
cat /tmp/backend-architecture-comparison.md \
    /tmp/backend-architecture-diagrams.md \
    /tmp/backend-implementation-tracker.md \
    > "$OUTPUT_DIR/PART_3_COMPARISON_TRACKING.md"

echo ""
echo "Part 3 complete: $OUTPUT_DIR/PART_3_COMPARISON_TRACKING.md"
echo ""

# Create master document
echo "=== CREATING MASTER DOCUMENT ==="
echo ""

cat > "$OUTPUT_DIR/COMPLETE_BACKEND_ARCHITECTURE_MAP.md" << 'EOF'
# FACTSWAY Backend - Complete Architecture Map

**Generated:** $(date)
**Purpose:** Comprehensive current vs target architecture for drift prevention

---

## Table of Contents

1. [Part 1: Current State](#part-1-current-state)
2. [Part 2: Target State](#part-2-target-state)
3. [Part 3: Comparison & Tracking](#part-3-comparison--tracking)

---

EOF

cat "$OUTPUT_DIR/PART_1_CURRENT_STATE.md" >> "$OUTPUT_DIR/COMPLETE_BACKEND_ARCHITECTURE_MAP.md"
echo "" >> "$OUTPUT_DIR/COMPLETE_BACKEND_ARCHITECTURE_MAP.md"
echo "---" >> "$OUTPUT_DIR/COMPLETE_BACKEND_ARCHITECTURE_MAP.md"
echo "" >> "$OUTPUT_DIR/COMPLETE_BACKEND_ARCHITECTURE_MAP.md"

cat "$OUTPUT_DIR/PART_2_TARGET_STATE.md" >> "$OUTPUT_DIR/COMPLETE_BACKEND_ARCHITECTURE_MAP.md"
echo "" >> "$OUTPUT_DIR/COMPLETE_BACKEND_ARCHITECTURE_MAP.md"
echo "---" >> "$OUTPUT_DIR/COMPLETE_BACKEND_ARCHITECTURE_MAP.md"
echo "" >> "$OUTPUT_DIR/COMPLETE_BACKEND_ARCHITECTURE_MAP.md"

cat "$OUTPUT_DIR/PART_3_COMPARISON_TRACKING.md" >> "$OUTPUT_DIR/COMPLETE_BACKEND_ARCHITECTURE_MAP.md"

# Create drift detector
cp ~/factsway-audit/part-3d-drift-detector.sh "$OUTPUT_DIR/drift-detector.sh"
chmod +x "$OUTPUT_DIR/drift-detector.sh"

# Summary
echo "=================================================="
echo "  AUDIT COMPLETE!"
echo "=================================================="
echo ""
echo "Output Files:"
echo "  📄 COMPLETE_BACKEND_ARCHITECTURE_MAP.md (master document)"
echo "  📄 PART_1_CURRENT_STATE.md"
echo "  📄 PART_2_TARGET_STATE.md"
echo "  📄 PART_3_COMPARISON_TRACKING.md"
echo "  🔍 drift-detector.sh (run periodically)"
echo ""
echo "Location: $OUTPUT_DIR"
echo ""

# Word count
total_lines=$(wc -l < "$OUTPUT_DIR/COMPLETE_BACKEND_ARCHITECTURE_MAP.md")
echo "Total documentation: $total_lines lines"
echo ""

# Quick stats
echo "Quick Stats:"
echo "  • IPC Channels: $(grep -c "ipcMain.handle" /tmp/backend-ipc-channels.md 2>/dev/null || echo "N/A")"
echo "  • API Routes: $(grep -c "^|" /tmp/backend-api-routes.md 2>/dev/null | tail -1 || echo "N/A")"
echo "  • Current Services: $(find "$BACKEND_PATH/factsway-ingestion" -name "*.py" 2>/dev/null | wc -l | tr -d ' ')"
echo "  • Target Services: 8 microservices"
echo ""

echo "Next steps:"
echo "  1. Review: $OUTPUT_DIR/COMPLETE_BACKEND_ARCHITECTURE_MAP.md"
echo "  2. Use during implementation to prevent drift"
echo "  3. Run drift-detector.sh periodically"
echo ""
```

Save as `run-complete-audit.sh` and run:

```bash
chmod +x run-complete-audit.sh
./run-complete-audit.sh
```

---

## Output Structure

After running, you'll have:

```
/tmp/factsway-audit-results/
├── COMPLETE_BACKEND_ARCHITECTURE_MAP.md    # 📘 MASTER DOCUMENT (2000-3000 lines)
│
├── PART_1_CURRENT_STATE.md                 # Current architecture
├── PART_2_TARGET_STATE.md                  # Target architecture
├── PART_3_COMPARISON_TRACKING.md           # Comparison + tracking
│
├── drift-detector.sh                       # Automated drift checks
│
└── logs/
    ├── 1a-scan.log
    ├── 1b-classification.log
    ├── 1c-ipc.log
    ├── 1d-routes.log
    ├── 1e-deps.log
    ├── 2a-target.log
    ├── 2b-interfaces.log
    ├── 2c-migration.log
    ├── 3a-comparison.log
    ├── 3b-diagrams.log
    └── 3c-tracker.log
```

---

## How to Use This Documentation

### During Planning (Now)

1. **Read COMPLETE_BACKEND_ARCHITECTURE_MAP.md**
   - Understand current state
   - Review target architecture
   - Identify risks

2. **Validate against Runbook 0**
   - Compare Part 2 (Target) with Runbook 0 specifications
   - Ensure no gaps in specification
   - Flag missing details

3. **Plan implementation order**
   - Use risk assessment from migration matrix
   - Follow critical path in progress tracker

### During Implementation (Weeks 1-12)

1. **Before each runbook:**
   - Review relevant sections in comparison doc
   - Check what exists vs what will be created
   - Identify files that must not be modified

2. **During implementation:**
   - Keep COMPLETE_BACKEND_ARCHITECTURE_MAP.md open
   - Reference component classification (KEEP/REMOVE/REFACTOR/NEW)
   - Follow service interfaces exactly

3. **After each runbook:**
   - Run `drift-detector.sh`
   - Update progress tracker (Part 3C)
   - Verify no breaking changes to IPC/API

### Drift Prevention

**Run drift detector weekly:**

```bash
/tmp/factsway-audit-results/drift-detector.sh
```

**Checks performed:**
- ✅ No duplicate ingestion code
- ✅ Services use environment variables (not hardcoded URLs)
- ✅ API routes call services (not direct DB)
- ✅ Orchestrator exists if services exist
- ✅ IPC channels not broken
- ✅ Monorepo structure correct

**If drift detected:**
1. Stop implementation
2. Review relevant Runbook 0 section
3. Fix drift before proceeding
4. Update journal with what happened

---

## Troubleshooting

### Scripts fail with "command not found"

**Problem:** Missing tree, jq, or other commands

**Fix:**
```bash
# macOS
brew install tree jq

# Linux
sudo apt-get install tree jq
```

### "No such file or directory" errors

**Problem:** Paths not updated in scripts

**Fix:**
```bash
# Update all scripts with correct path
find ~/factsway-audit -name "*.sh" -exec sed -i '' 's|/path/to/factsway-backend|/actual/path|g' {} +
```

### Empty output files

**Problem:** Script ran but no data collected

**Fix:**
- Check that you're in the backend directory
- Verify directory structure matches expectations
- Run individual scripts manually to see errors

### Grep shows too many results

**Problem:** Output overwhelming

**Fix:**
- Scripts are designed to filter noise
- Review log files in output directory
- Adjust grep patterns if needed

---

## Maintenance

### Re-run After Major Changes

Run the complete audit again:
- After completing multiple runbooks
- Before major milestones
- When architecture questions arise
- Monthly during implementation

### Update for New Components

If you add components not in Runbook 0:
1. Document in journal
2. Add to progress tracker manually
3. Update comparison doc with rationale
4. Re-run drift detector to establish new baseline

---

## Expected Results

### Part 1 (Current State)

**You should see:**
- Complete directory tree
- ~50-100 components classified
- 200+ IPC channels (many orphaned - that's normal)
- ~15-25 API routes
- Dependency graph showing hub files

**Red flags:**
- Unexpected directories (unknown code)
- Missing expected components
- No IPC handlers found (check paths)

### Part 2 (Target State)

**You should see:**
- 8 new service directories (specification)
- DesktopOrchestrator specification
- Service API contracts
- Migration plan for every component

**Red flags:**
- Services missing specifications
- Unclear migration paths
- High-risk components without mitigation

### Part 3 (Comparison)

**You should see:**
- Side-by-side directory structures
- Mermaid diagrams (copy to docs)
- 15 runbooks in progress tracker
- Drift detector ready to run

**Red flags:**
- Comparison shows breaking changes to IPC
- Migration plan has orphaned components
- Progress tracker missing runbooks

---

## Success Criteria

**Audit successful if:**

1. ✅ All three parts complete without errors
2. ✅ Master document is 2,000-3,000 lines
3. ✅ Current state matches actual codebase
4. ✅ Target state matches Runbook 0
5. ✅ Migration plan accounts for every component
6. ✅ Mermaid diagrams render correctly
7. ✅ Drift detector runs without errors

**Ready to implement when:**

1. ✅ You understand current architecture
2. ✅ You've validated target architecture
3. ✅ Migration risks identified
4. ✅ Progress tracker in place
5. ✅ Drift detector validated
6. ✅ Team reviewed documentation

---

## Final Checklist

**Before implementation:**

- [ ] Run complete audit
- [ ] Review master document
- [ ] Validate against Runbook 0
- [ ] Identify high-risk components
- [ ] Set up drift detector
- [ ] Update paths in all scripts
- [ ] Commit audit results to repo (docs/audits/)

**During implementation:**

- [ ] Keep master document open
- [ ] Reference before each runbook
- [ ] Run drift detector weekly
- [ ] Update progress tracker
- [ ] Document deviations in journal

**After implementation:**

- [ ] Run final audit
- [ ] Compare before/after
- [ ] Verify all services created
- [ ] Confirm zero drift
- [ ] Archive audit package

---

## Package Contents Summary

**3 Main Documents:**
1. BACKEND_AUDIT_PART_1_CURRENT_STATE.md (scan scripts)
2. BACKEND_AUDIT_PART_2_TARGET_STATE.md (target specs)
3. BACKEND_AUDIT_PART_3_COMPARISON.md (comparison + tracking)

**12 Shell Scripts:**
- 5 for Part 1 (current state scanning)
- 3 for Part 2 (target state specs)
- 4 for Part 3 (comparison + tracking)

**1 Master Script:**
- run-complete-audit.sh (runs everything)

**Estimated Output:**
- ~2,000-3,000 lines of documentation
- Visual Mermaid diagrams
- Progress tracking matrices
- Automated drift detection

---

## Contact / Support

**If you need help:**
1. Check troubleshooting section above
2. Review individual script logs in output directory
3. Verify paths are correct
4. Run scripts individually to isolate issues

**Report issues:**
- Document what failed in journal
- Include error messages
- Note which part/script failed
- Share output directory contents

---

**Status:** COMPLETE AUDIT PACKAGE READY  
**Next:** Run complete audit, review results, validate against Runbook 0  
**Timeline:** 30-45 minutes to generate complete documentation

---

**This package prevents drift by making architecture visible.**
