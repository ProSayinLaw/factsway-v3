# FACTSWAY Backend - Target Architecture (Post-Runbook 0)

**Source:** Runbook 0, Section 16 (File Structure)
**Status:** SPECIFICATION - Not yet implemented

---

## 1. Target Directory Structure

**Based on Section 16.1: Monorepo Structure**

```
factsway-platform/                    # NEW MONOREPO ROOT
├── services/                         # 🔵 NEW - Microservices
│   ├── records-service/              # 🔵 NEW - Template, Case, Draft CRUD
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── templates.ts
│   │   │   │   ├── cases.ts
│   │   │   │   └── drafts.ts
│   │   │   ├── repositories/
│   │   │   │   ├── sqlite/          # Desktop implementation
│   │   │   │   └── postgres/        # Cloud implementation
│   │   │   ├── models/
│   │   │   └── server.ts
│   │   ├── tests/
│   │   ├── Dockerfile               # For cloud deployment
│   │   ├── package.json
│   │   └── build.js                 # pkg bundling for desktop
│   │
│   ├── ingestion-service/            # 🔵 NEW - DOCX → LegalDocument
│   │   ├── app/
│   │   │   ├── routes/
│   │   │   │   └── ingest.py
│   │   │   ├── parsers/
│   │   │   │   ├── nupunkt_parser.py
│   │   │   │   ├── section_detector.py
│   │   │   │   └── format_extractor.py
│   │   │   ├── models/
│   │   │   │   └── legal_document.py
│   │   │   └── main.py
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   └── build.spec              # PyInstaller for desktop
│   │
│   ├── export-service/               # 🔵 NEW - LegalDocument → DOCX
│   │   ├── app/
│   │   │   ├── routes/
│   │   │   │   └── export.py
│   │   │   ├── renderers/
│   │   │   │   ├── docx_renderer.py
│   │   │   │   └── pdf_renderer.py
│   │   │   └── main.py
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   │
│   ├── caseblock-service/            # 🔵 NEW - Caption extraction
│   │   └── [standard Python service structure]
│   │
│   ├── signature-service/            # 🔵 NEW - Signature extraction
│   │   └── [standard Python service structure]
│   │
│   ├── facts-service/                # 🔵 NEW - Sentence registry
│   │   └── [standard Python service structure]
│   │
│   ├── exhibits-service/             # 🔵 NEW - Exhibit management
│   │   └── [standard Python service structure]
│   │
│   └── caselaw-service/              # 🔵 NEW - Citation detection
│       └── [standard Python service structure]
│
├── apps/                             # Desktop & Web apps
│   ├── desktop/                      # 🟡 REFACTOR - Current Electron app
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── index.ts         # 🟢 KEEP - Electron main
│   │   │   │   ├── preload.ts       # 🟢 KEEP - IPC bridge
│   │   │   │   ├── orchestrator.ts  # 🔵 NEW - Service orchestrator
│   │   │   │   └── handlers/        # 🟢 KEEP - IPC handlers
│   │   │   ├── api/                 # 🟢 KEEP - Express API
│   │   │   │   └── routes/
│   │   │   └── services/            # 🟢 KEEP - Storage, etc.
│   │   ├── migrations/              # 🟢 KEEP - Database schema
│   │   ├── vault/                   # 🟢 KEEP - Document storage
│   │   └── package.json
│   │
│   └── web-trial/                    # 🔵 NEW - Web freemium app
│       ├── src/
│       │   └── app/
│       └── package.json
│
├── packages/                         # Shared code
│   ├── shared-types/                 # 🔵 NEW - TypeScript types
│   │   └── src/
│   │       └── legal-document.types.ts
│   │
│   └── shared-utils/                 # 🔵 NEW - Common utilities
│       └── src/
│
├── infrastructure/                   # 🔵 NEW - Deployment configs
│   ├── kubernetes/
│   │   ├── services/
│   │   └── ingress.yaml
│   │
│   └── docker-compose.yml           # For local multi-service testing
│
├── scripts/                          # 🟢 KEEP - Build scripts
│   └── setup-dev.sh
│
├── docs/                             # 🟢 KEEP - Documentation
│   └── runbooks/
│
├── package.json                      # 🟡 REFACTOR - Workspace config
├── lerna.json                        # 🔵 NEW - Monorepo management
└── tsconfig.base.json                # 🔵 NEW - Shared TS config
```

---

## 2. New Services Specification

**From Runbook 0, Section 15.2 (Core Services)**

| Service | Port | Language | Purpose | API Endpoints |
|---------|------|----------|---------|---------------|
| records-service | 3001 | TypeScript/Node | Template, Case, Draft CRUD | GET/POST/PUT/DELETE /api/{templates,cases,drafts} |
| ingestion-service | 3002 | Python/FastAPI | DOCX → LegalDocument | POST /api/ingest |
| export-service | 3003 | Python/FastAPI | LegalDocument → DOCX | POST /api/export |
| caseblock-service | 3004 | Python/FastAPI | Caption extraction | POST /api/caseblock/extract |
| signature-service | 3005 | Python/FastAPI | Signature extraction | POST /api/signature/extract |
| facts-service | 3006 | Python/FastAPI | Sentence registry | GET/POST /api/facts |
| exhibits-service | 3007 | Python/FastAPI | Exhibit management | GET/POST /api/exhibits |
| caselaw-service | 3008 | Python/FastAPI | Citation detection | POST /api/citations/detect |

---

## 3. Desktop Orchestrator

**From Runbook 0, Section 15.4 (Desktop App)**

### New Component: \`apps/desktop/src/main/orchestrator.ts\`

**Purpose:** Spawn and manage service child processes on desktop

**Key Features:**
- Spawns all 8 services as child processes (NOT Docker)
- PID tracking to prevent zombie processes
- Health check monitoring
- Auto-restart on crash
- Graceful shutdown
- Service discovery via localhost ports

**Class Structure:**
\`\`\`typescript
class DesktopOrchestrator {
  private servicePids: Map<string, number>;
  private serviceUrls: Map<string, string>;

  async startAllServices(): Promise<void>
  async stopAllServices(): Promise<void>
  async restartService(name: string): Promise<void>
  async healthCheck(name: string): Promise<boolean>
  cleanupZombies(): void
}
\`\`\`

**Environment Variables Set:**
\`\`\`bash
RECORDS_SERVICE_URL=http://localhost:3001
INGESTION_SERVICE_URL=http://localhost:3002
EXPORT_SERVICE_URL=http://localhost:3003
# ... etc for all 8 services
\`\`\`

---

## 4. Deployment Models

**From Runbook 0, Section 21**

| Model | Deployment | Services | Database | User |
|-------|------------|----------|----------|------|
| Desktop (Primary) | Child processes | All 8 as executables | SQLite local | Solo lawyers |
| Web Trial (Freemium) | Docker/K8s | ingestion, caseblock, signature only | PostgreSQL cloud | Lead generation |
| Mobile (Pro Se) | Docker/K8s | Subset for intake | PostgreSQL cloud | Self-represented |
| Enterprise (On-Premise) | Docker/K8s | All 8 in firm's cloud | PostgreSQL on-prem | Law firms |

