# Architecture Comparison: Current vs Target

**Purpose:** Visual comparison to prevent drift during implementation

---

## Directory Structure Comparison

### Current Structure (Before)

```
factsway-backend/
├── src/                              # 🟢 Electron app (stays)
│   ├── main/                         # 🟢 Main process
│   ├── api/                          # 🟡 API routes (update calls)
│   └── services/                     # 🟢 Storage services
├── factsway-ingestion/               # 🔴 OLD pipeline (refactor)
│   ├── ingestion_engine/
│   └── app.py                        # 🔴 DELETE
├── migrations/                       # 🟢 Database (keep)
├── vault/                            # 🟢 Documents (keep)
└── package.json
```

### Target Structure (After)

```
factsway-platform/                    # 🔵 NEW monorepo
├── services/                         # 🔵 NEW microservices
│   ├── records-service/              # 🔵 NEW
│   ├── ingestion-service/            # 🔵 NEW (from old pipeline)
│   ├── export-service/               # 🔵 NEW
│   ├── caseblock-service/            # 🔵 NEW
│   ├── signature-service/            # 🔵 NEW
│   ├── facts-service/                # 🔵 NEW
│   ├── exhibits-service/             # 🔵 NEW
│   └── caselaw-service/              # 🔵 NEW
├── apps/
│   └── desktop/                      # 🟡 MOVED from src/
│       ├── src/main/                 # 🟢 Electron (keep)
│       ├── src/api/                  # 🟡 Routes (update)
│       ├── migrations/               # 🟢 Database (keep)
│       └── vault/                    # 🟢 Documents (keep)
├── packages/                         # 🔵 NEW shared code
│   ├── shared-types/
│   └── shared-utils/
└── infrastructure/                   # 🔵 NEW deployment configs
```

---

## Component Count Comparison

| Category | Current | Target | Change |
|----------|---------|--------|--------|
| TypeScript Services | 0 | 1 (records) | +1 NEW |
| Python Services | 1 (monolith) | 7 (microservices) | +6 NEW |
| Electron Components | 3 (main, preload, handlers) | 4 (+ orchestrator) | +1 NEW |
| API Route Files | ~8 | ~8 | SAME (updated calls) |
| Database Schemas | 1 (SQLite) | 1 (SQLite) | SAME |
| Deployment Targets | 1 (Desktop only) | 4 (Desktop, Web, Mobile, Enterprise) | +3 NEW |

---

## Critical Changes Summary

### 🟢 STAYS UNCHANGED (Core Backend)

**Electron App:**
- ✅ `src/main/index.ts` - Main process entry (moves to apps/desktop)
- ✅ `src/main/preload.ts` - IPC bridge (moves to apps/desktop)
- ✅ `src/main/handlers/` - All IPC handlers (moves to apps/desktop)
- ✅ Database schema in `migrations/`
- ✅ Document storage in `vault/`
- ✅ Storage services (`src/main/services/`)

**Database:**
- ✅ SQLite for desktop deployment
- ✅ All existing migrations
- ✅ Schema remains compatible

**UI Integration:**
- ✅ All IPC channels stay the same
- ✅ No breaking changes to frontend adapter

---

### 🔴 REMOVED (Old Ingestion)

**Python Monolith:**
- ❌ `factsway-ingestion/app.py` - FastAPI server (DELETE)
- ❌ Direct Python API calls from Electron (REPLACE with service calls)
- ❌ Monolithic pipeline (REFACTOR into ingestion-service)

**Reason:** Old pipeline becomes `ingestion-service`, but ingestion logic is preserved and improved.

---

### 🔵 ADDED (New Components)

**Microservices (8 total):**
1. ✨ `services/records-service/` - TypeScript/Node, port 3001
2. ✨ `services/ingestion-service/` - Python/FastAPI, port 3002
3. ✨ `services/export-service/` - Python/FastAPI, port 3003
4. ✨ `services/caseblock-service/` - Python/FastAPI, port 3004
5. ✨ `services/signature-service/` - Python/FastAPI, port 3005
6. ✨ `services/facts-service/` - Python/FastAPI, port 3006
7. ✨ `services/exhibits-service/` - Python/FastAPI, port 3007
8. ✨ `services/caselaw-service/` - Python/FastAPI, port 3008

**Desktop Orchestrator:**
- ✨ `apps/desktop/src/main/orchestrator.ts` - Spawns/manages services as child processes
- ✨ PID tracking, health checks, auto-restart
- ✨ Service discovery via environment variables

**Shared Packages:**
- ✨ `packages/shared-types/` - Common TypeScript types
- ✨ `packages/shared-utils/` - Shared utilities

**Infrastructure:**
- ✨ `infrastructure/kubernetes/` - Cloud deployment configs
- ✨ `infrastructure/docker-compose.yml` - Local testing

---

### 🟡 MODIFIED (Updated)

**API Routes:**
- 🔧 Update to call microservices instead of direct DB/Python
- 🔧 Example: `POST /api/cases/:id/filing/export` now calls `export-service:3003`
- 🔧 Service URLs injected via environment variables

**Package.json:**
- 🔧 Becomes workspace root (lerna/npm workspaces)
- 🔧 Scripts updated for monorepo
- 🔧 Dependencies moved to service-specific package.json files

