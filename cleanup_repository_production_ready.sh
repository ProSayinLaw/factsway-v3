#!/bin/bash

# FACTSWAY Repository Cleanup - Production Ready Structure
# Date: December 27, 2024
# Purpose: Organize repository for Phase 4 execution

set -e

echo "======================================"
echo "FACTSWAY Repository Cleanup"
echo "======================================"
echo ""

REPO_ROOT="/Users/alexcruz/Documents/4.0 UI and Backend 360"
cd "$REPO_ROOT"

# Create backup
BACKUP_DIR="Archive/Pre_Phase4_Backup_$(date +%Y%m%d_%H%M%S)"
echo "Creating backup: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"
cp -R Runbooks "$BACKUP_DIR/"
cp -R Documentation "$BACKUP_DIR/"
cp *.md "$BACKUP_DIR/" 2>/dev/null || true
echo "✓ Backup created"
echo ""

# 1. Organize Runbooks folder
echo "1. Organizing Runbooks folder..."

# Move tools to Metadata/tools/
mkdir -p Runbooks/Metadata/tools
mv Runbooks/CLAUDE_CODE_INVESTIGATOR_PROMPT.md Runbooks/Metadata/tools/ 2>/dev/null || true
mv Runbooks/INVESTIGATOR_USAGE_GUIDE.md Runbooks/Metadata/tools/ 2>/dev/null || true
mv Runbooks/Metadata/CLAUDE_CODE_PROMPT_PHASES_2_3.md Runbooks/Metadata/tools/ 2>/dev/null || true
mv Runbooks/Metadata/PHASE_2_3_COMPLETION_REPORT.md Runbooks/Metadata/tools/ 2>/dev/null || true

# Move old metadata to archive
mkdir -p Runbooks/Metadata/archive
mv Runbooks/Metadata/RUNBOOK_6_METADATA_OLD.md Runbooks/Metadata/archive/ 2>/dev/null || true
mv Runbooks/Metadata/TEMPLATE_NOTES_CONTENT.md Runbooks/Metadata/archive/ 2>/dev/null || true
mv Runbooks/Metadata/mnt Runbooks/Metadata/archive/ 2>/dev/null || true

echo "✓ Runbooks folder organized"
echo ""

# 2. Move runbook audit to Documentation
echo "2. Moving runbook audit to Documentation..."
mkdir -p Documentation/Runbook_Analysis
mv Runbooks/_runbook_audit/* Documentation/Runbook_Analysis/ 2>/dev/null || true
rmdir Runbooks/_runbook_audit 2>/dev/null || true
echo "✓ Audit moved to Documentation"
echo ""

# 3. Organize root folder Session 19 outputs
echo "3. Organizing Session 19 outputs..."

# Move to Architecture
mkdir -p Documentation/Architecture
mv CLERKGUARD_CONTRACT.md Documentation/Architecture/ 2>/dev/null || true

# Move to Session Reports
mkdir -p Documentation/Session_Reports
mv FACTSWAY_INVESTIGATIVE_REPORT_2025-12-26.md Documentation/Session_Reports/ 2>/dev/null || true
mv FACTSWAY_INVESTIGATIVE_REPORT_V2_SESSION_19.md Documentation/Session_Reports/ 2>/dev/null || true
mv INVESTIGATOR_V2_NEW_QUESTIONS_RESOLVED.md Documentation/Session_Reports/ 2>/dev/null || true
mv OPTIONS_BC_VERIFICATION_REPORT.md Documentation/Session_Reports/ 2>/dev/null || true
mv OPTION_C_DATA_MODEL_FIX_REPORT.md Documentation/Session_Reports/ 2>/dev/null || true

echo "✓ Session 19 outputs organized"
echo ""

# 4. Create new README files
echo "4. Creating README files..."

# Runbooks/README.md will be created via separate command
# Documentation/README.md will be created via separate command
# Documentation/Session_Reports/Session_19_Overview.md will be created via separate command

echo "✓ README files ready to create"
echo ""

echo "======================================"
echo "Cleanup Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Create Runbooks/README.md"
echo "2. Create Documentation/README.md"
echo "3. Create Documentation/Session_Reports/Session_19_Overview.md"
echo "4. Verify structure"
echo "5. Commit changes"
echo ""
echo "Backup location: $BACKUP_DIR"
