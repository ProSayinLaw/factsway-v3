# BACKEND ARCHITECTURE AUDIT - Part 2: Target State from Runbook 0

**Repository:** factsway-backend  
**Purpose:** Map what the backend WILL look like after implementing Runbook 0  
**Input:** Runbook 0 Contract Definition (Sections 15, 16, 21, 22)  
**Output:** Target architecture specification with new components

---

## CRITICAL CONTEXT

**Source Documents:**
- `RUNBOOK_0_CONTRACT_DEFINITION_FINAL.md` - Master specification
- Section 15: Technology Stack (microservices architecture)
- Section 16: File Structure (monorepo layout)
- Section 21: Deployment Models
- Section 22: Service Discovery & Configuration

---

## Part 2A: Target Directory Structure

### Output File: `/tmp/backend-target-architecture.md`

```bash
#!/bin/bash
cd /path/to/factsway-backend

OUTPUT="/tmp/backend-target-architecture.md"

cat > "$OUTPUT" << 'HEADER'
# FACTSWAY Backend - Target Architecture (Post-Runbook 0)

**Source:** Runbook 0, Section 16 (File Structure)  
**Status:** SPECIFICATION - Not yet implemented

---

## 1. Target Directory Structure

**Based on Section 16.1: Monorepo Structure**

HEADER

# Create the target structure visualization
cat >> "$OUTPUT" << 'STRUCTURE'

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
│   │   ├── app/
│   │   │   ├── routes/
│   │   │   │   └── caseblock.py
│   │   │   ├── parsers/
│   │   │   │   └── caption_parser.py
│   │   │   └── main.py
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

STRUCTURE

echo "| Service | Port | Language | Purpose | API Endpoints |" >> "$OUTPUT"
echo "|---------|------|----------|---------|---------------|" >> "$OUTPUT"

cat >> "$OUTPUT" << 'SERVICES'
| records-service | 3001 | TypeScript/Node | Template, Case, Draft CRUD | GET/POST/PUT/DELETE /api/{templates,cases,drafts} |
| ingestion-service | 3002 | Python/FastAPI | DOCX → LegalDocument | POST /api/ingest |
| export-service | 3003 | Python/FastAPI | LegalDocument → DOCX | POST /api/export |
| caseblock-service | 3004 | Python/FastAPI | Caption extraction | POST /api/caseblock/extract |
| signature-service | 3005 | Python/FastAPI | Signature extraction | POST /api/signature/extract |
| facts-service | 3006 | Python/FastAPI | Sentence registry | GET/POST /api/facts |
| exhibits-service | 3007 | Python/FastAPI | Exhibit management | GET/POST /api/exhibits |
| caselaw-service | 3008 | Python/FastAPI | Citation detection | POST /api/citations/detect |
SERVICES

cat >> "$OUTPUT" << 'FOOTER'

---

## 3. Desktop Orchestrator

**From Runbook 0, Section 15.4 (Desktop App)**

### New Component: `apps/desktop/src/main/orchestrator.ts`

**Purpose:** Spawn and manage service child processes on desktop

**Key Features:**
- Spawns all 8 services as child processes (NOT Docker)
- PID tracking to prevent zombie processes
- Health check monitoring
- Auto-restart on crash
- Graceful shutdown
- Service discovery via localhost ports

**Class Structure:**
```typescript
class DesktopOrchestrator {
  private servicePids: Map<string, number>;
  private serviceUrls: Map<string, string>;
  
  async startAllServices(): Promise<void>
  async stopAllServices(): Promise<void>
  async restartService(name: string): Promise<void>
  async healthCheck(name: string): Promise<boolean>
  cleanupZombies(): void
}
```

**Environment Variables Set:**
```bash
RECORDS_SERVICE_URL=http://localhost:3001
INGESTION_SERVICE_URL=http://localhost:3002
EXPORT_SERVICE_URL=http://localhost:3003
# ... etc for all 8 services
```

---

## 4. Service Discovery Configuration

**From Runbook 0, Section 22**

### Desktop Environment (Orchestrator Injection)

Services discover each other via environment variables set by orchestrator:

```bash
# Set by DesktopOrchestrator before spawning services
export RECORDS_SERVICE_URL=http://localhost:3001
export INGESTION_SERVICE_URL=http://localhost:3002
export EXPORT_SERVICE_URL=http://localhost:3003
# ... all 8 services
```

### Cloud Environment (Kubernetes Injection)

Same service code, different URLs from Kubernetes:

```yaml
# Set by Kubernetes ConfigMap
RECORDS_SERVICE_URL=http://records-service:3001
INGESTION_SERVICE_URL=http://ingestion-service:3002
EXPORT_SERVICE_URL=http://export-service:3003
```

### Service Code Pattern

Every service uses this pattern:

```typescript
// Services never hardcode URLs
const RECORDS_URL = process.env.RECORDS_SERVICE_URL || 'http://localhost:3001';

// Call another service
const response = await fetch(`${RECORDS_URL}/api/cases`, { ... });
```

---

## 5. Deployment Models

**From Runbook 0, Section 21**

FOOTER

echo "| Model | Deployment | Services | Database | User |" >> "$OUTPUT"
echo "|-------|------------|----------|----------|------|" >> "$OUTPUT"

cat >> "$OUTPUT" << 'DEPLOY'
| Desktop (Primary) | Child processes | All 8 as executables | SQLite local | Solo lawyers |
| Web Trial (Freemium) | Docker/K8s | ingestion, caseblock, signature only | PostgreSQL cloud | Lead generation |
| Mobile (Pro Se) | Docker/K8s | Subset for intake | PostgreSQL cloud | Self-represented |
| Enterprise (On-Premise) | Docker/K8s | All 8 in firm's cloud | PostgreSQL on-prem | Law firms |
DEPLOY

echo "" >> "$OUTPUT"
echo "Target architecture complete: $OUTPUT"
```

---

## Part 2B: Service Interface Specifications

### Output File: `/tmp/backend-service-interfaces.md`

```bash
#!/bin/bash

OUTPUT="/tmp/backend-service-interfaces.md"

cat > "$OUTPUT" << 'HEADER'
# Service Interface Specifications

**From Runbook 0, Section 10 (API Endpoints)**

---

## Service-to-Service Communication

All services communicate via REST/JSON over HTTP.

HEADER

# Define each service's API contract
cat >> "$OUTPUT" << 'INTERFACES'

### 1. Records Service (Port 3001)

**Base URL:** `http://localhost:3001` (desktop) or `http://records-service:3001` (cloud)

**Endpoints:**
- `GET /api/templates` - List all templates
- `POST /api/templates` - Create template
- `GET /api/templates/:id` - Get template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template
- (Same pattern for /api/cases and /api/drafts)

**Response Format:**
```json
{
  "success": true,
  "data": { /* resource */ }
}
```

---

### 2. Ingestion Service (Port 3002)

**Base URL:** `http://localhost:3002` (desktop) or `http://ingestion-service:3002` (cloud)

**Endpoints:**
- `POST /api/ingest` - Parse DOCX to LegalDocument

**Request:**
```
Content-Type: multipart/form-data
Body: file (binary .docx)
```

**Response:**
```json
{
  "success": true,
  "parsed": {
    "meta": { /* ... */ },
    "case_header": { /* ... */ },
    "caseblock": { /* ... */ },
    "body": { /* sections, paragraphs, sentences */ },
    "signature_block": { /* ... */ },
    "citations": [ /* ... */ ],
    "embedded_objects": [ /* ... */ ]
  }
}
```

---

### 3. Export Service (Port 3003)

**Base URL:** `http://localhost:3003` (desktop) or `http://export-service:3003` (cloud)

**Endpoints:**
- `POST /api/export` - Generate DOCX from LegalDocument
- `POST /api/export/pdf` - Generate PDF from LegalDocument

**Request:**
```json
{
  "legalDocument": { /* LegalDocument structure */ },
  "format": "docx" | "pdf"
}
```

**Response:**
```json
{
  "success": true,
  "buffer": "base64-encoded-bytes",
  "filename": "motion.docx"
}
```

---

### 4. CaseBlock Service (Port 3004)

**Endpoints:**
- `POST /api/caseblock/extract` - Extract caption from text
- `POST /api/caseblock/format` - Format caption with styles

---

### 5. Signature Service (Port 3005)

**Endpoints:**
- `POST /api/signature/extract` - Extract signature block
- `POST /api/signature/format` - Format signature with styles

---

### 6. Facts Service (Port 3006)

**Endpoints:**
- `GET /api/facts` - List all facts
- `POST /api/facts` - Create fact entry
- `GET /api/facts/:id` - Get fact
- `PUT /api/facts/:id` - Update fact
- `POST /api/facts/link` - Link fact to evidence

---

### 7. Exhibits Service (Port 3007)

**Endpoints:**
- `GET /api/exhibits` - List exhibits
- `POST /api/exhibits` - Create exhibit
- `GET /api/exhibits/:id` - Get exhibit
- `POST /api/exhibits/appendix` - Generate appendix

---

### 8. Caselaw Service (Port 3008)

**Endpoints:**
- `POST /api/citations/detect` - Detect citations in text
- `POST /api/citations/validate` - Validate citation format
- `GET /api/citations/parallel` - Get parallel citations

INTERFACES

echo "" >> "$OUTPUT"
echo "Service interfaces complete: $OUTPUT"
```

---

## Part 2C: Migration Plan Matrix

### Output File: `/tmp/backend-migration-plan.md`

```bash
#!/bin/bash

OUTPUT="/tmp/backend-migration-plan.md"

cat > "$OUTPUT" << 'HEADER'
# Migration Plan: Current → Target

**Purpose:** Map what changes, what stays, what moves

---

## Component Migration Matrix

HEADER

echo "| Current Location | Current Status | Target Location | Migration Action | Risk |" >> "$OUTPUT"
echo "|------------------|----------------|-----------------|------------------|------|" >> "$OUTPUT"

cat >> "$OUTPUT" << 'MIGRATION'
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
MIGRATION

cat >> "$OUTPUT" << 'FOOTER'

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

FOOTER

echo "" >> "$OUTPUT"
echo "Migration plan complete: $OUTPUT"
```

---

## Execution Instructions

**Run Part 2 after Part 1:**

```bash
# Part 2A: Target architecture
bash /path/to/part-2a-target-structure.sh

# Part 2B: Service interfaces
bash /path/to/part-2b-service-interfaces.sh

# Part 2C: Migration plan
bash /path/to/part-2c-migration-plan.sh

# Combine outputs
cat /tmp/backend-target-architecture.md \
    /tmp/backend-service-interfaces.md \
    /tmp/backend-migration-plan.md \
    > /tmp/BACKEND_TARGET_STATE_COMPLETE.md

echo "✅ Target state mapping complete!"
echo "📄 Output: /tmp/BACKEND_TARGET_STATE_COMPLETE.md"
```

---

## Expected Outputs

After Part 2, you will have:

1. **Target directory tree** - Complete post-Runbook 0 structure
2. **Service specifications** - All 8 services with API contracts
3. **Migration matrix** - Every component mapped Current → Target
4. **Risk assessment** - High/medium/low risk components identified
5. **Python pipeline breakdown** - Detailed migration plan for ingestion code

**File size estimate:** ~400-600 lines

**Next:** Part 3 will create visual diagrams and comparison views

---

## Notes

- This maps the INTENDED state from Runbook 0
- Nothing is implemented yet - this is the blueprint
- Use this to verify Runbook 0 completeness
- Identify missing specifications before implementation
- Risk levels guide implementation order (low-risk first)
