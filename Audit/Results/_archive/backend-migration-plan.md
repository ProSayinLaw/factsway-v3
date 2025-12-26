# Migration Plan: Current → Target

**Purpose:** Map what changes, what stays, what moves

---

## Component Migration Matrix

| Current Location | Current Status | Target Location | Migration Action | Risk |
|------------------|----------------|-----------------|------------------|------|
| `src/main/index.ts` | Electron main | `apps/desktop/src/main/index.ts` | 🟡 MOVE to monorepo | LOW |
| `src/main/preload.ts` | IPC bridge | `apps/desktop/src/main/preload.ts` | 🟡 MOVE to monorepo | LOW |
| `src/main/handlers/` | IPC handlers | `apps/desktop/src/main/handlers/` | 🟢 KEEP as-is | LOW |
| `src/api/routes/` | Express routes | `apps/desktop/src/api/routes/` | 🟢 KEEP, update service calls | MEDIUM |
| `migrations/` | Database schema | `apps/desktop/migrations/` | 🟢 KEEP as-is | LOW |
| `vault/` | Document storage | `apps/desktop/vault/` | 🟢 KEEP as-is | LOW |
| `factsway-ingestion/` | Python pipeline | `services/ingestion-service/` | 🔴 REFACTOR heavily | HIGH |
| `factsway-ingestion/app.py` | FastAPI server | DELETE | 🔴 REMOVE - replaced by service | LOW |
| N/A | Not exists | `apps/desktop/src/main/orchestrator.ts` | 🔵 CREATE NEW | HIGH |
| N/A | Not exists | `services/records-service/` | 🔵 CREATE NEW | HIGH |
| N/A | Not exists | `services/export-service/` | 🔵 CREATE NEW | HIGH |
| N/A | Not exists | `services/caseblock-service/` | 🔵 CREATE NEW | MEDIUM |
| N/A | Not exists | `services/signature-service/` | 🔵 CREATE NEW | MEDIUM |
| N/A | Not exists | `services/facts-service/` | 🔵 CREATE NEW | HIGH |
| N/A | Not exists | `services/exhibits-service/` | 🔵 CREATE NEW | MEDIUM |
| N/A | Not exists | `services/caselaw-service/` | 🔵 CREATE NEW | MEDIUM |
| N/A | Not exists | `infrastructure/` | 🔵 CREATE NEW | LOW |
| N/A | Not exists | `packages/shared-types/` | 🔵 CREATE NEW | LOW |

---

## Python Pipeline Components - Detailed Migration

**Current:** `factsway-ingestion/ingestion_engine/`

| Component | Current Path | Target Service | Migration Notes |
|-----------|--------------|----------------|-----------------|
| DOCX parsing (lxml) | `docx/pipeline_v2/pipeline.py` | `ingestion-service` | REFACTOR - Core logic reusable |
| NUPunkt sentence splitting | `docx/pipeline_v2/sentence_parser.py` | `ingestion-service` | MOVE directly |
| Format extraction | `extraction/format_extraction.py` | `ingestion-service` | MOVE directly |
| Preservation metadata | `extraction/preservation.py` | `ingestion-service` | MOVE directly |
| Citation service (eyecite) | `services/citation_service.py` | `caselaw-service` | EXTRACT to separate service |
| Sentence service (spaCy) | `services/sentence_service.py` | `ingestion-service` | KEEP in ingestion |
| Section detection | `docx/pipeline_v2/section_detector.py` | `ingestion-service` | MOVE directly |
| Zone detection | `docx/pipeline_v2/zone_detector.py` | `ingestion-service` | MOVE directly |
| FastAPI app | `app.py` | DELETE | REMOVE - Each service has own FastAPI app |

---

## Risk Assessment Summary

| Risk Level | Count | Components |
|------------|-------|------------|
| 🔴 HIGH | 5 | Orchestrator, Records service, Export service, Facts service, Ingestion refactor |
| 🟡 MEDIUM | 6 | API routes update, 4 new services (caseblock, signature, exhibits, caselaw) |
| 🟢 LOW | 7 | Electron main, handlers, database, vault, infrastructure, shared types |

**Highest Risk:** DesktopOrchestrator (entirely new, critical for desktop deployment)

**Medium Risk:** Service extraction from monolith (API routes need to call services instead of direct DB)

**Low Risk:** File moves and new directories (no logic changes)

