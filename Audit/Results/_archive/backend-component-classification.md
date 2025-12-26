# Component Classification Matrix

**Legend:**
- 🟢 KEEP - Core backend, do not modify
- 🔴 REMOVE - Old ingestion pipeline, delete during cleanup
- 🟡 REFACTOR - Needs updates for new architecture
- 🔵 NEW - To be created per Runbook 0

---

## TypeScript Core Components

| Path | Component | Purpose | Fate |
|------|-----------|---------|------|
| `src/main/errors.ts` | Main Process |  | 🟢 KEEP |
| `src/main/types.ts` | Main Process |  | 🟢 KEEP |

## IPC Handlers

| Path | Handler | Channel | Fate |
|------|---------|---------|------|
| `src/main/handlers/drafting/index.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/drafting/importDocx.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/renderer/index.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/records/index.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/llm/index.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/app/index.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/gemini/index.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/security/index.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/auth/index.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/admin/index.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/cases/index.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/pdf/index.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/style/index.ts` | IPC Handler | style:pick-and-extract | 🟢 KEEP |
| `src/main/handlers/motion/index.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/exports/index.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/dialog/index.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/exhibits/index.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/authoring/index.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/audit/index.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/formatting/index.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/diagnostics/index.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/citations/index.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/exhibitLinks/index.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/index.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/pleadings/index.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/filing/exportHandler.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/filing/index.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/monitoring/index.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/facts/index.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/signatureblock/index.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/signatureblock/clerkHandlers.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/metadata/index.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/orchestrator/index.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/proposals/index.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/caseblock/index.ts` | IPC Handler | Unknown channels | 🟢 KEEP |
| `src/main/handlers/caseblock/clerkHandlers.ts` | IPC Handler | Unknown channels | 🟢 KEEP |

## API Routes

| Path | Route | Method | Fate |
|------|-------|--------|------|
| `src/api/routes/llm-debug.ts` | API Route | /llm-debug/* | 🟢 KEEP |

## Python Ingestion Pipeline

| Path | Component | Purpose | Fate |
|------|-----------|---------|------|
| `factsway-ingestion/ingestion_engine/docx/pipeline_v2/pipeline.py` | Python Pipeline | DOCX ingestion (OLD) | 🔴 REMOVE |
| `factsway-ingestion/ingestion_engine/docx/pipeline_v2/extended_pipeline.py` | Python Pipeline | Extended pipeline (OLD) | 🔴 REMOVE |
| `factsway-ingestion/ingestion_engine/services/citation_service.py` | Python Service | NLP/Citation service | 🟡 REFACTOR - Extract for new microservices |
| `factsway-ingestion/ingestion_engine/services/sentence_service.py` | Python Service | NLP/Citation service | 🟡 REFACTOR - Extract for new microservices |
| `factsway-ingestion/ingestion_engine/services/__init__.py` | Python Service | NLP/Citation service | 🟡 REFACTOR - Extract for new microservices |

## Database & Storage

| Path | Component | Purpose | Fate |
|------|-----------|---------|------|
| `migrations/` | Database Schema | 1 migration files | 🟢 KEEP |
| `src/main/services/signatureblock/storageService.ts` | Storage Service | Data persistence | 🟢 KEEP |
| `src/main/services/caseblock/storageService.ts` | Storage Service | Data persistence | 🟢 KEEP |

