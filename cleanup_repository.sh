#!/bin/bash

#################################################################################
# FACTSWAY BACKEND - REPOSITORY CLEANUP SCRIPT
#################################################################################
#
# Purpose: Reorganize repository structure for clarity
#          - Move working documents to Archive/
#          - Move reference docs to Documentation/
#          - Keep only canonical files in Runbooks/
#
# Created: December 26, 2024
# Author: Claude (Session 17 Extended)
#
# SAFE TO RUN: Creates backup before making changes
#
#################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DRY_RUN=false
BACKUP_DIR="Archive/Pre_Cleanup_Backup_$(date +%Y%m%d_%H%M%S)"

#################################################################################
# FUNCTIONS
#################################################################################

print_header() {
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
}

print_step() {
    echo -e "${GREEN}➜${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC}  $1"
}

print_error() {
    echo -e "${RED}✘${NC} $1"
}

print_success() {
    echo -e "${GREEN}✔${NC} $1"
}

# Move file with logging
move_file() {
    local src="$1"
    local dest="$2"

    if [ ! -f "$src" ]; then
        print_warning "File not found (skipping): $src"
        return
    fi

    if [ "$DRY_RUN" = true ]; then
        echo "  [DRY RUN] Would move: $src → $dest"
    else
        mkdir -p "$(dirname "$dest")"
        mv "$src" "$dest"
        echo "  Moved: $src → $dest"
    fi
}

# Create directory with logging
create_dir() {
    local dir="$1"

    if [ "$DRY_RUN" = true ]; then
        echo "  [DRY RUN] Would create: $dir"
    else
        mkdir -p "$dir"
        echo "  Created: $dir"
    fi
}

# Create backup of current state
create_backup() {
    print_step "Creating backup of current state..."

    if [ "$DRY_RUN" = true ]; then
        echo "  [DRY RUN] Would create backup in: $BACKUP_DIR"
        return
    fi

    mkdir -p "$BACKUP_DIR"

    # Backup all files we're about to move
    if [ -d "Audit" ]; then
        cp -r "Audit" "$BACKUP_DIR/"
    fi

    if [ -d "Runbooks" ]; then
        cp -r "Runbooks" "$BACKUP_DIR/"
    fi

    # Backup root-level documents
    for file in PROSEMIRROR_*.md RUNBOOK_*.md REPOSITORY_*.md; do
        if [ -f "$file" ]; then
            cp "$file" "$BACKUP_DIR/"
        fi
    done

    print_success "Backup created: $BACKUP_DIR"
}

# Restore from backup (if something goes wrong)
restore_backup() {
    print_warning "Restoring from backup: $BACKUP_DIR"

    if [ ! -d "$BACKUP_DIR" ]; then
        print_error "Backup directory not found: $BACKUP_DIR"
        return 1
    fi

    # This is a manual process - just tell user what to do
    echo ""
    echo "To restore from backup, run:"
    echo "  rm -rf Audit Runbooks Documentation Archive"
    echo "  cp -r $BACKUP_DIR/* ."
    echo ""
}

#################################################################################
# MAIN SCRIPT
#################################################################################

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help)
            echo "Usage: $0 [--dry-run] [--help]"
            echo ""
            echo "Options:"
            echo "  --dry-run    Show what would be done without making changes"
            echo "  --help       Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Show mode
if [ "$DRY_RUN" = true ]; then
    print_header "REPOSITORY CLEANUP - DRY RUN MODE"
    print_warning "No files will be moved. Review output, then run without --dry-run"
else
    print_header "REPOSITORY CLEANUP - EXECUTION MODE"
    print_warning "This will reorganize your repository structure."
    echo ""
    read -p "Continue? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "Aborted."
        exit 0
    fi
fi

echo ""

# Step 1: Create backup
print_header "Step 1: Create Backup"
create_backup
echo ""

# Step 2: Create new directory structure
print_header "Step 2: Create Directory Structure"
print_step "Creating new directories..."

create_dir "Documentation/Architecture"
create_dir "Documentation/Runbook_Development"
create_dir "Documentation/Templates"
create_dir "Archive/Backups"
create_dir "Archive/Working_Documents"
create_dir "Archive/Superseded"
create_dir "Runbooks"

echo ""

# Step 3: Move Audit documents to Documentation/Architecture
print_header "Step 3: Move Audit Documents → Documentation/Architecture"
print_step "Moving architecture audit files..."

move_file "Audit/BACKEND_AUDIT_PART_1_CURRENT_STATE.md" "Documentation/Architecture/BACKEND_AUDIT_PART_1_CURRENT_STATE.md"
move_file "Audit/BACKEND_AUDIT_PART_2_TARGET_STATE.md" "Documentation/Architecture/BACKEND_AUDIT_PART_2_TARGET_STATE.md"
move_file "Audit/BACKEND_AUDIT_PART_3_COMPARISON.md" "Documentation/Architecture/BACKEND_AUDIT_PART_3_COMPARISON.md"
move_file "Audit/BACKEND_AUDIT_PACKAGE_SUMMARY.md" "Documentation/Architecture/BACKEND_AUDIT_PACKAGE_SUMMARY.md"
move_file "Audit/BACKEND_AUDIT_MASTER_EXECUTION_GUIDE.md" "Documentation/Architecture/BACKEND_AUDIT_MASTER_EXECUTION_GUIDE.md"

# Move other architecture docs
move_file "PROSEMIRROR_VS_LEGALDOCUMENT_ANALYSIS.md" "Documentation/Architecture/PROSEMIRROR_VS_LEGALDOCUMENT_ANALYSIS.md"

echo ""

# Step 4: Move Runbook development documents
print_header "Step 4: Move Runbook Development Docs → Documentation/Runbook_Development"
print_step "Moving runbook development history..."

move_file "Runbooks/Final Runbooks/RUNBOOK_0_AUDIT_REPORT.md" "Documentation/Runbook_Development/RUNBOOK_0_AUDIT_REPORT.md"
move_file "Runbooks/Final Runbooks/RUNBOOK_0_UPDATE_SUMMARY.md" "Documentation/Runbook_Development/RUNBOOK_0_UPDATE_SUMMARY.md"
move_file "Runbooks/Final Runbooks/RUNBOOK_0_VERIFICATION_REPORT.md" "Documentation/Runbook_Development/RUNBOOK_0_VERIFICATION_REPORT.md"
move_file "Runbooks/RUNBOOK_0_ISSUES_SUMMARY.md" "Documentation/Runbook_Development/RUNBOOK_0_ISSUES_SUMMARY.md"

echo ""

# Step 5: Move backups to Archive
print_header "Step 5: Move Backups → Archive/Backups"
print_step "Moving backup files..."

# Find and move all backup files
if [ "$DRY_RUN" = false ]; then
    find "Runbooks" -name "*BACKUP*.md" -type f 2>/dev/null | while read -r file; do
        basename=$(basename "$file")
        move_file "$file" "Archive/Backups/$basename"
    done
else
    echo "  [DRY RUN] Would search for and move backup files"
fi

echo ""

# Step 6: Move working documents to Archive
print_header "Step 6: Move Working Documents → Archive/Working_Documents"
print_step "Moving prompts, assessments, and working files..."

move_file "Runbooks/Final Runbooks/PROMPT_2_AUDIT_RUNBOOK_0.md" "Archive/Working_Documents/PROMPT_2_AUDIT_RUNBOOK_0.md"
move_file "RUNBOOK_ASSESSMENT.md" "Archive/Working_Documents/RUNBOOK_ASSESSMENT.md"
move_file "REPOSITORY_ORGANIZATION_PLAN.md" "Archive/Working_Documents/REPOSITORY_ORGANIZATION_PLAN.md"

# Move superseded documents
move_file "PROSEMIRROR_RESOLUTION_FINAL.md" "Archive/Superseded/PROSEMIRROR_RESOLUTION_FINAL.md"

echo ""

# Step 7: Move templates
print_header "Step 7: Move Templates → Documentation/Templates"
print_step "Moving template files..."

move_file "RUNBOOK_TEMPLATE.md" "Documentation/Templates/RUNBOOK_TEMPLATE.md"
move_file "Runbooks/RUNBOOK_TEMPLATE.md" "Documentation/Templates/RUNBOOK_TEMPLATE.md"

echo ""

# Step 8: Organize canonical runbooks
print_header "Step 8: Organize Canonical Runbooks"
print_step "Moving final runbooks to top level with numbered prefixes..."

move_file "Runbooks/Final Runbooks/RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md" "Runbooks/00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md"
move_file "Runbooks/Final Runbooks/RUNBOOK_01_REFERENCE_DOCUMENT.md" "Runbooks/01_RUNBOOK_01_REFERENCE_DOCUMENT.md"

# Move other useful reference files
move_file "Runbooks/Final Runbooks/FACTSWAY_RUNBOOK_PACKAGE_MANIFEST.md" "Documentation/FACTSWAY_RUNBOOK_PACKAGE_MANIFEST.md"

echo ""

# Step 9: Clean up empty directories
print_header "Step 9: Clean Up Empty Directories"
print_step "Removing empty directories..."

if [ "$DRY_RUN" = true ]; then
    echo "  [DRY RUN] Would remove empty directories"
else
    # Remove Final Runbooks folder if empty
    if [ -d "Runbooks/Final Runbooks" ]; then
        rmdir "Runbooks/Final Runbooks" 2>/dev/null || print_warning "Final Runbooks directory not empty, keeping it"
    fi

    # Remove Audit folder if empty
    if [ -d "Audit" ]; then
        rmdir "Audit/Results" 2>/dev/null || true
        rmdir "Audit" 2>/dev/null || print_warning "Audit directory not empty, keeping it"
    fi
fi

echo ""

# Step 10: Create/Update README
print_header "Step 10: Create/Update README.md"
print_step "Documenting new repository structure..."

if [ "$DRY_RUN" = true ]; then
    echo "  [DRY RUN] Would create/update README.md"
else
    cat > "README.md" << 'EOF'
# FACTSWAY Backend

Legal document drafting platform backend - microservices architecture for pro se litigants and solo practitioners.

## Repository Structure

### 📋 Runbooks/ - Implementation Specifications
Sequential implementation runbooks - the **single source of truth** for building FACTSWAY.

- `00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md` - **Master Contract** - Complete system specification
- `01_RUNBOOK_01_REFERENCE_DOCUMENT.md` - **TypeScript Types** - Canonical LegalDocument schema
- `02-15_*.md` - *To be created* - Service implementation runbooks

**Status:** Runbooks 0-1 complete and aligned. Runbooks 2-15 generation in progress.

### 📚 Documentation/ - Reference Documentation

#### Architecture/
Architecture audits and analysis documents:
- `BACKEND_AUDIT_PART_1_CURRENT_STATE.md` - Current codebase analysis
- `BACKEND_AUDIT_PART_2_TARGET_STATE.md` - Target architecture (microservices)
- `BACKEND_AUDIT_PART_3_COMPARISON.md` - Gap analysis
- `PROSEMIRROR_VS_LEGALDOCUMENT_ANALYSIS.md` - Data model decision rationale

#### Runbook_Development/
Historical record of how Runbook 0 was created and verified:
- `RUNBOOK_0_AUDIT_REPORT.md` - Comprehensive audit (18 issues found)
- `RUNBOOK_0_UPDATE_SUMMARY.md` - Complete changelog (26 fixes)
- `RUNBOOK_0_VERIFICATION_REPORT.md` - Verification results (10/10 passed)

#### Templates/
Templates for creating new runbooks and documents:
- `RUNBOOK_TEMPLATE.md` - Template for Runbooks 2-15

### 📦 Archive/ - Historical Versions

#### Backups/
Timestamped backups of runbooks before major changes:
- `RUNBOOK_0_BACKUP_YYYYMMDD_HHMMSS.md`
- `RUNBOOK_01_BACKUP_YYYYMMDD_HHMMSS.md`

#### Working_Documents/
Prompts, assessments, and interim documents:
- Audit prompts for Claude Code
- Repository organization plans
- Development assessments

#### Superseded/
Old approaches that were replaced:
- Alternative architectures considered but rejected

### 📝 Root Files

- `JOURNAL.md` - **Project memory** - Context for future Claude sessions
- `README.md` - This file - Repository guide
- `.gitignore` - Git configuration

## Getting Started

### For Implementation
1. Read `Runbooks/00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md` - Understand the system
2. Follow `Runbooks/01_RUNBOOK_01_REFERENCE_DOCUMENT.md` - Create TypeScript types
3. Continue with Runbooks 02-15 sequentially

### For Understanding Architecture
1. Read `Documentation/Architecture/BACKEND_AUDIT_PART_2_TARGET_STATE.md` - Target architecture
2. Read `Runbooks/00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md` Section 1 - Architecture overview

### For Context (Future Claude Sessions)
1. Read `JOURNAL.md` - Project history and key decisions
2. Read `Documentation/Runbook_Development/` - How we got here

## Development Status

**Current Phase:** Foundation (Runbooks 0-1 complete)

**Completed:**
- ✅ Runbook 0: Master Contract (15,528 lines, comprehensive)
- ✅ Runbook 1: TypeScript Types (1,607 lines, aligned)
- ✅ Architecture audit (26 issues resolved)
- ✅ Cross-reference verification (100% passing)

**Next Steps:**
- ⏳ Generate Runbooks 2-15 (Database → Services → Integration → Testing)
- ⏳ Begin implementation with Runbook 2 (Database Schema)

**Timeline:** 11-16 weeks for complete implementation (15 runbooks)

## Key Decisions

### Architecture: Microservices
- 8 backend services (TypeScript + Python)
- Desktop orchestrator (Electron)
- 4 deployment models (Desktop, Web, Mobile, Enterprise)
- **Decision Record:** See Runbook 0 Section 1.5

### Data Model: LegalDocument
- Canonical format for all data exchange
- Hierarchical structure (Document → Section → Paragraph → Sentence)
- Character offset-based formatting and citations
- **Full Specification:** See Runbook 0 Section 4

### Development Approach: Sequential Runbooks
- No interpretation - follow runbook exactly
- One runbook at a time
- Fresh Claude Code context for each
- Quality gates after each runbook

## Questions?

See `JOURNAL.md` for detailed context and decision rationale.

## Repository Organization

**Last Updated:** December 26, 2024
**Organized By:** Claude (Session 17 Extended)
**Reason:** Separate canonical specs from working documents for clarity

EOF
    print_success "README.md created"
fi

echo ""

# Step 11: Update JOURNAL.md references
print_header "Step 11: Update JOURNAL.md Cross-References"
print_step "Updating file paths in journal..."

if [ "$DRY_RUN" = true ]; then
    echo "  [DRY RUN] Would update JOURNAL.md with new file paths"
else
    if [ -f "JOURNAL.md" ]; then
        # Create backup
        cp "JOURNAL.md" "JOURNAL.md.backup"

        # Update common paths
        sed -i.bak 's|Runbooks/Final Runbooks/RUNBOOK_0|Runbooks/00_RUNBOOK_0|g' "JOURNAL.md"
        sed -i.bak 's|Runbooks/Final Runbooks/RUNBOOK_01|Runbooks/01_RUNBOOK_01|g' "JOURNAL.md"
        sed -i.bak 's|RUNBOOK_0_AUDIT_REPORT|Documentation/Runbook_Development/RUNBOOK_0_AUDIT_REPORT|g' "JOURNAL.md"

        # Remove backup files
        rm "JOURNAL.md.bak" "JOURNAL.md.backup"

        print_success "JOURNAL.md updated with new paths"
    else
        print_warning "JOURNAL.md not found, skipping updates"
    fi
fi

echo ""

#################################################################################
# SUMMARY
#################################################################################

print_header "CLEANUP COMPLETE"

if [ "$DRY_RUN" = true ]; then
    echo ""
    echo "This was a DRY RUN. No files were moved."
    echo ""
    echo "Review the output above. If everything looks good, run:"
    echo "  $0"
    echo ""
    echo "To execute the cleanup."
else
    echo ""
    print_success "Repository reorganization complete!"
    echo ""
    echo "Summary:"
    echo "  ✅ Canonical runbooks in: Runbooks/"
    echo "  ✅ Reference docs in: Documentation/"
    echo "  ✅ Archives in: Archive/"
    echo "  ✅ Backup created: $BACKUP_DIR"
    echo "  ✅ README.md created"
    echo ""
    echo "Next Steps:"
    echo "  1. Review new structure: ls -R Runbooks/ Documentation/ Archive/"
    echo "  2. Verify canonical files: cat Runbooks/00_RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md | head"
    echo "  3. Commit changes: git add . && git commit -m 'refactor: reorganize repository structure'"
    echo "  4. Proceed with Runbooks 2-15 generation"
    echo ""
    echo "If something went wrong, restore from backup:"
    echo "  See: $BACKUP_DIR"
    echo ""
fi

print_header "END"
