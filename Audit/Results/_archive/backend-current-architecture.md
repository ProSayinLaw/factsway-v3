# FACTSWAY Backend - Current Architecture Map
**Generated:**
Fri Dec 26 02:42:14 CST 2025
**Purpose:** Complete inventory for drift prevention

---

## 1. Directory Structure (Summary)

  .
  ARCH_SNAPSHOT
  factsway-ingestion
  factsway-ingestion/ingestion_engine
  factsway-ingestion/ingestion_engine/docx
  factsway-ingestion/ingestion_engine/extraction
  factsway-ingestion/ingestion_engine/models
  factsway-ingestion/ingestion_engine/passes
  factsway-ingestion/ingestion_engine/pdf
  factsway-ingestion/ingestion_engine/services
  factsway-ingestion/ingestion_test
  factsway-ingestion/scripts
  migrations
  scripts
  scripts/db
  src
  src/api
  src/api/middleware
  src/api/routes
  src/api/utils
  src/clerks
  src/clerks/caseblock
  src/clerks/drafting
  src/clerks/exhibits
  src/clerks/facts
  src/clerks/filing
  src/clerks/formatting
  src/clerks/records
  src/clerks/signature
  src/ipc
  src/ipc/schema
  src/lib
  src/logging
  src/main
  src/main/audit
  src/main/auth
  src/main/db
  src/main/domain
  src/main/drafting
  src/main/export
  src/main/handlers
  src/main/ingestion
  src/main/intake
  src/main/ipc
  src/main/orchestrator
  src/main/records
  src/main/security
  src/main/services
  src/main/telemetry
  src/main/validation
  src/main/workers
  src/monitoring
  src/security
  src/shared
  src/shared/caseblock
  src/shared/config
  src/shared/drafting
  src/shared/formatting
  src/shared/ipc
  src/shared/motion
  src/shared/parser
  src/shared/render
  src/shared/render-logic
  src/shared/schema
  src/shared/signatureblock
  src/shared/style
  src/shared/types
  src/shared/utils
  src/tagging
  src/types
  src/utils
  src/workers
  vault
  vault/01KD44EPP80GFJP30Y752ZPET6
  vault/01KD44EPP80GFJP30Y752ZPET6/documents

---

## 2. File Count by Type


### TypeScript/JavaScript Files
264

### Python Files
37

### Configuration Files
5

### Key Files Present

- Main: src/main/
  - errors.ts
  - types.ts

- API Routes: src/api/routes/
  - admin.ts
  - caseblock.ts
  - cases.ts
  - debug.ts
  - drafting.ts
  - exhibitLinks.ts
  - exhibits.ts
  - filing.ts
  - formatting.ts
  - gemini.ts
  - index.ts
  - llm-debug.ts
  - llm.ts
  - records.ts
  - signature.ts
  - wizard.ts

- Handlers: src/main/handlers/
  - index.ts

