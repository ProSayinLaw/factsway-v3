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

