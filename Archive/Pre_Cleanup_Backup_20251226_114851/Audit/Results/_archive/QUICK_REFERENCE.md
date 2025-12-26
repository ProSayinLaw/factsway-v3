# Backend Architecture Audit - Quick Reference

**Generated:** December 26, 2025

---

## 📘 Main Document

**[COMPLETE_BACKEND_ARCHITECTURE_MAP.md](./COMPLETE_BACKEND_ARCHITECTURE_MAP.md)**
- 1,119 lines of complete architecture documentation
- Part 1: Current state (what exists now)
- Part 2: Target state (what will exist)
- Part 3: Comparison & tracking

**Usage:** Keep this open during ALL implementation work

---

## 🔍 Drift Detector

**[drift-detector.sh](./drift-detector.sh)**

Run weekly during implementation:
```bash
cd "/Users/alexcruz/Documents/4.0 UI and Backend 360/Audit/Results"
./drift-detector.sh
```

**Checks:**
- ✅ No duplicate ingestion code
- ✅ Services use environment variables
- ✅ API routes call services (not direct DB)
- ✅ Orchestrator exists when needed
- ✅ IPC channels intact
- ✅ Monorepo structure correct

---

## 📊 Key Numbers

| Metric | Count |
|--------|-------|
| **Current TypeScript Files** | 264 |
| **Current Python Files** | 37 |
| **API Routes** | ~12 |
| **IPC Handlers** | Multiple |
| **Services to Create** | 8 |
| **Deployment Models** | 4 |

---

## 🎯 Critical Components

### Keep (Don't Touch)
- ✅ `src/main/` - Electron main process
- ✅ `src/main/handlers/` - IPC handlers
- ✅ `src/api/routes/` - API routes (update calls only)
- ✅ `migrations/` - Database schema
- ✅ `vault/` - Document storage

### Remove
- ❌ `factsway-ingestion/app.py` - Old FastAPI server
- ❌ Monolithic Python pipeline (refactor into services)

### Create
- 🔵 8 microservices (records, ingestion, export, caseblock, signature, facts, exhibits, caselaw)
- 🔵 Desktop orchestrator
- 🔵 Monorepo structure
- 🔵 Shared packages

---

## 📋 Implementation Checklist

**Before Each Runbook:**
- [ ] Read relevant sections in architecture map
- [ ] Check component classification
- [ ] Verify no IPC/API breaking changes

**During Implementation:**
- [ ] Follow Runbook 0 exactly
- [ ] Reference architecture map constantly
- [ ] Document deviations in journal

**After Each Runbook:**
- [ ] Run drift detector
- [ ] Update progress tracker
- [ ] Verify tests pass
- [ ] Commit changes

---

## 🚨 High-Risk Components

Priority items that need extra care:

1. **Desktop Orchestrator** - Entirely new, critical for desktop
2. **Records Service** - First TypeScript service
3. **Ingestion Service** - Complex refactor from old pipeline
4. **Export Service** - Critical for output
5. **Facts Service** - Complex data model

---

## 📂 File Locations

**Backend:** `/Users/alexcruz/Documents/factsway-backend`

**Audit Results:** `/Users/alexcruz/Documents/4.0 UI and Backend 360/Audit/Results/`

**Scripts:** `~/factsway-audit-temp/`

---

## 🛠️ Quick Commands

**Re-run full audit:**
```bash
cd ~/factsway-audit-temp
bash part-1a-scan.sh
bash part-1b-classification.sh
bash part-1c-ipc-channels.sh
bash part-1d-api-routes.sh
bash part-1e-dependencies.sh
bash part-2a-target-structure.sh
bash part-2b-service-interfaces.sh
bash part-2c-migration-plan.sh
bash part-3a-comparison.sh
bash part-3b-diagrams.sh
bash part-3c-tracker.sh
```

**Check drift:**
```bash
"/Users/alexcruz/Documents/4.0 UI and Backend 360/Audit/Results/drift-detector.sh"
```

---

## 📖 Document Guide

| File | Purpose | Size |
|------|---------|------|
| COMPLETE_BACKEND_ARCHITECTURE_MAP.md | Master document - everything | 38KB |
| backend-current-architecture.md | Current directory structure | 2.2KB |
| backend-component-classification.md | KEEP/REMOVE/REFACTOR/NEW tags | 5.0KB |
| backend-ipc-channels.md | IPC channel inventory | 2.2KB |
| backend-api-routes.md | API route inventory | 1.0KB |
| backend-dependencies.md | Dependency graph | 1.3KB |
| backend-target-architecture.md | Target structure & services | 7.5KB |
| backend-service-interfaces.md | Service API specs | 2.2KB |
| backend-migration-plan.md | Migration matrix | 3.6KB |
| backend-architecture-comparison.md | Side-by-side comparison | 4.9KB |
| backend-architecture-diagrams.md | Mermaid visual diagrams | 3.6KB |
| backend-implementation-tracker.md | Progress tracking | 4.5KB |
| drift-detector.sh | Automated drift checks | 3.9KB |
| AUDIT_SUMMARY_REPORT.md | This summary | Large |

---

## ⚡ Fast Answers

**Q: Which files can I modify?**
A: Check component classification - look for 🟢 KEEP or 🟡 REFACTOR

**Q: Should I create a new service or modify existing code?**
A: Check target architecture - look for 🔵 NEW markers

**Q: Will this break IPC channels?**
A: Check IPC inventory - all channels must remain functional

**Q: Can I delete factsway-ingestion/?**
A: Eventually yes (marked 🔴 REMOVE), but extract logic to services first

**Q: Do I need Docker on desktop?**
A: No - orchestrator spawns services as child processes

**Q: How do services discover each other?**
A: Environment variables injected by orchestrator (desktop) or Kubernetes (cloud)

---

## 🎯 Next Actions

1. **Review** `COMPLETE_BACKEND_ARCHITECTURE_MAP.md`
2. **Validate** against Runbook 0
3. **Plan** implementation order
4. **Test** drift detector
5. **Begin** Runbook 1 (Reference Document)

---

## 💡 Pro Tips

- Keep architecture map open in split screen during coding
- Run drift detector before committing
- Update progress tracker after completing each runbook
- Reference service interfaces when creating services
- Follow critical path in tracker
- Document all deviations in journal

---

## ⚠️ Common Mistakes to Avoid

1. ❌ Modifying files marked 🔴 REMOVE without migrating logic
2. ❌ Creating services without following interface specs
3. ❌ Hardcoding service URLs instead of using env vars
4. ❌ Implementing without checking current state first
5. ❌ Skipping drift detector runs
6. ❌ Not updating progress tracker

---

**Status:** ✅ Audit Complete - Ready for Implementation

**Remember:** This audit prevents the drift that killed previous builds!
