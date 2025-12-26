# Runbook Generation Plan: Runbooks 1-15

**Date:** December 24, 2024  
**Purpose:** Define process for generating standalone Runbook documents from Runbook 0  
**Status:** Planning phase - ready to execute after Runbook 0 finalized

---

## Overview

Once Runbook 0 is finalized (after Edits 54A-D applied), we will generate 15 standalone Runbook documents. Each Runbook will be a complete, self-contained specification for a specific build phase.

**Key principle:** Each Runbook should be readable and executable by a fresh Claude Code instance with ONLY that Runbook (no need to reference Runbook 0).

---

## Generation Strategy

### Approach: Extraction + Expansion

**For each Runbook:**
1. Extract relevant sections from Runbook 0
2. Expand with implementation details
3. Add verification criteria
4. Add handoff specifications
5. Create as standalone markdown document

**Result:** 15 complete specification documents ready for mechanical execution

---

## Runbook Document Template

Each Runbook follows this structure:

```markdown
# Runbook [N]: [Title]

**Purpose:** [One-sentence description]  
**Input Required:** [List of dependencies]  
**Output Deliverables:** [List of what this produces]  
**Estimated Time:** [Hours]  
**Dependencies:** [Previous Runbooks]

---

## Context

[Brief explanation of where this fits in the overall system]

---

## Specifications

### [Subsection 1]
[Complete specifications extracted from Runbook 0]

### [Subsection 2]
[More specifications]

---

## Implementation Requirements

### File Structure
[Exact directory structure to create]

### Key Files to Create
[List of files with purposes]

### Dependencies/Libraries
[Specific npm/pip packages to install]

---

## Step-by-Step Instructions

### Step 1: [Task Name]
**What to do:** [Detailed instructions]
**Why:** [Rationale]
**Verification:** [How to verify this step worked]

### Step 2: [Next Task]
[Continue...]

---

## Verification Criteria

### Automated Tests
```bash
# Commands to run
npm test
# Expected output
```

### Manual Checks
- [ ] Check 1
- [ ] Check 2

### Quality Gates
- All tests passing
- Code coverage >80%
- No TypeScript errors
- Health endpoint responds

---

## Common Pitfalls

1. **Pitfall:** [Common mistake]
   **Solution:** [How to avoid/fix]

2. **Pitfall:** [Another issue]
   **Solution:** [Fix]

---

## Handoff to Next Runbook

**What to provide:**
- File path to [deliverable 1]
- File path to [deliverable 2]
- Documentation of [any decisions made]

**Next Runbook needs:**
- [Specific information]
- [Specific files]

---

## Appendix

### Code Examples
[Relevant code snippets]

### Configuration Examples
[Sample config files]

### Troubleshooting
[Common errors and fixes]
```

---

## Runbook 1: Reference Document Creation

### Source Material (from Runbook 0)
- Section 17: Pre-built Texas Motion Template
- Section 17.3: Style Definitions (12 styles)
- Section 13.3: Reference Document Integration
- Appendix B: Texas-Specific Requirements

### Content to Extract

**Section 1: Purpose & Context**
- Why we need a reference document
- How it's used by the export pipeline
- Role in style preservation

**Section 2: Style Specifications**
- All 12 style definitions from Section 17.3:
  - Motion Title
  - Section Heading
  - Body Text
  - Numbered List
  - Lettered List
  - Citation
  - Signature Block
  - Attorney Info
  - Table Style
  - Caption Text
  - Certificate
  - Footnote

**Section 3: Step-by-Step Creation**
1. Open Microsoft Word
2. Create new document
3. Define each style (with exact specifications)
4. Add sample content for each style
5. Save as `texas_motion_reference.docx`

**Section 4: Verification**
- Extract styles.xml from DOCX
- Verify all 12 styles present
- Verify style properties match spec
- Test with Pandoc conversion

**Section 5: Handoff**
- Provide path to reference document
- Document any variations from spec
- Note any Word version issues

### Additional Content to Add

**Tool Requirements:**
- Microsoft Word (version requirements)
- Alternative: LibreOffice (with caveats)
- unzip command (for verification)
- xmllint (for XML inspection)

**Sample Content:**
- Example text for each style
- Example motion structure using all styles

**Troubleshooting:**
- Word version differences
- Style inheritance issues
- Font availability

**Estimated Size:** 15-20 pages

---

## Runbook 2: Database Schema Implementation

### Source Material (from Runbook 0)
- Section 2: Data Architecture
- Section 12: Persistence & Storage
- Section 12.1: Schema Definitions (all 6 tables)
- Section 12.3: Indexing Strategy

### Content to Extract

**Section 1: Database Architecture**
- SQLite vs PostgreSQL decision
- Migration system approach
- Schema versioning strategy

**Section 2: Table Specifications**
For each of 6 tables (Templates, Cases, Drafts, Evidence, Exhibits, Caselaw):
- Complete schema from Section 12.1
- Field types and constraints
- Relationships
- Indexes from Section 12.3

**Section 3: Migration System**
- better-sqlite3 setup
- Migration file structure
- Up/down migration pattern
- Migration runner implementation

**Section 4: Seed Data**
- Texas Motion template data
- Sample case data
- Test data requirements

**Section 5: Implementation Steps**
1. Set up migration system
2. Create migration files (one per table)
3. Implement migration runner
4. Create seed script
5. Test migrations (up/down)
6. Verify schema

**Section 6: Verification**
- Schema inspection commands
- Data validation queries
- Index verification
- Seed data checks

### Additional Content to Add

**Dependencies:**
```json
{
  "better-sqlite3": "^9.2.2",
  "zod": "^3.22.4"
}
```

**Migration File Template:**
```sql
-- migrations/001_create_templates.sql
-- UP
CREATE TABLE templates (
  -- schema here
);

-- DOWN
DROP TABLE templates;
```

**Migration Runner Code:**
```typescript
// migrations/index.ts
// Complete implementation
```

**Troubleshooting:**
- SQLite version issues
- Foreign key constraints
- Migration rollback issues

**Estimated Size:** 20-25 pages

---

## Runbook 3: Records Service Implementation

### Source Material (from Runbook 0)
- Section 15.2: Core Services - Records Service
- Section 10: API Endpoints (Templates, Cases, Drafts)
- Section 2: Data Architecture
- Section 22.3: Service Code Pattern

### Content to Extract

**Section 1: Service Architecture**
- Express + TypeScript setup
- Repository pattern
- Service structure

**Section 2: API Specifications**
From Section 10:
- GET /api/templates
- POST /api/templates
- GET /api/templates/:id
- PUT /api/templates/:id
- DELETE /api/templates/:id
- (Same for Cases and Drafts)

**Section 3: Repository Implementation**
- SQLite repository pattern
- PostgreSQL repository pattern (for future)
- Abstract interface

**Section 4: Data Models**
From Section 2:
- Template type definition
- Case type definition
- Draft type definition
- Validation schemas (Zod)

**Section 5: Implementation Steps**
1. Set up Express server
2. Create repository interfaces
3. Implement SQLite repositories
4. Create route handlers
5. Add validation middleware
6. Add health endpoint
7. Write tests
8. Package as executable

**Section 6: Verification**
- Health check test
- CRUD operation tests
- Integration tests
- Executable build test

### Additional Content to Add

**Dependencies:**
```json
{
  "express": "^4.18.2",
  "better-sqlite3": "^9.2.2",
  "zod": "^3.22.4",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1"
}
```

**Service Structure:**
```
services/records-service/
├── src/
│   ├── routes/
│   │   ├── templates.ts
│   │   ├── cases.ts
│   │   └── drafts.ts
│   ├── repositories/
│   │   ├── interfaces/
│   │   │   └── case-repository.ts
│   │   └── sqlite/
│   │       ├── template-repository.ts
│   │       ├── case-repository.ts
│   │       └── draft-repository.ts
│   ├── models/
│   │   ├── template.ts
│   │   ├── case.ts
│   │   └── draft.ts
│   └── server.ts
├── tests/
├── package.json
└── build.js
```

**Complete Code Examples:**
- Server setup
- Repository implementation
- Route handler example
- Test example

**Packaging Instructions:**
- pkg configuration
- Build command
- Platform-specific binaries

**Estimated Size:** 30-35 pages

---

## Runbook 4: Ingestion Service Implementation

### Source Material (from Runbook 0)
- Section 15.3: Python Services - Ingestion
- Section 2.4: ParsedDocument Format
- Section 13.1: Document Parsing
- Section 5.3: NUPunkt Configuration

### Content to Extract

**Section 1: Service Architecture**
- FastAPI + Python setup
- Service structure
- Parser architecture

**Section 2: API Specification**
- POST /api/ingest endpoint
- Request format (multipart/form-data)
- Response format (ParsedDocument)
- Error handling

**Section 3: Document Parsing Pipeline**
From Section 13.1:
1. DOCX → XML extraction (python-docx)
2. Section detection
3. Sentence splitting (NUPunkt)
4. Format extraction (bold, italic, underline)
5. Citation detection (preliminary)
6. LegalDocument assembly

**Section 4: NUPunkt Configuration**
From Section 5.3:
- Citation-aware splitting
- Legal abbreviation handling
- Sentence boundary rules

**Section 5: Data Model**
From Section 2.4:
- ParsedDocument structure
- Sentence format
- Section hierarchy
- Pydantic models

**Section 6: Implementation Steps**
1. Set up FastAPI server
2. Implement DOCX parser
3. Implement section detector
4. Implement NUPunkt integration
5. Implement format extractor
6. Create LegalDocument assembler
7. Add health endpoint
8. Write tests
9. Package as executable

**Section 7: Verification**
- Upload test document
- Verify sentence boundaries
- Verify section hierarchy
- Round-trip test preparation

### Additional Content to Add

**Dependencies:**
```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-multipart==0.0.6
python-docx==1.1.0
lxml==5.1.0
nupunkt==0.1.3
pydantic==2.5.3
```

**Service Structure:**
```
services/ingestion-service/
├── app/
│   ├── routes/
│   │   └── ingest.py
│   ├── parsers/
│   │   ├── docx_parser.py
│   │   ├── section_detector.py
│   │   ├── nupunkt_parser.py
│   │   └── format_extractor.py
│   ├── models/
│   │   └── legal_document.py
│   └── main.py
├── tests/
├── requirements.txt
└── build.spec
```

**Complete Code Examples:**
- DOCX parsing
- Section detection algorithm
- NUPunkt integration
- Format extraction

**Test Documents:**
- Sample motion.docx for testing
- Expected ParsedDocument output

**Estimated Size:** 35-40 pages

---

## Runbook 5: Export Service Implementation

### Source Material (from Runbook 0)
- Section 15.3: Python Services - Export
- Section 13: Export Pipeline
- Section 13.2: Pandoc Integration
- Section 13.4: OOXML Injection
- Section 13.5: Certificate of Service

### Content to Extract

**Section 1: Service Architecture**
- FastAPI setup
- Export pipeline architecture

**Section 2: API Specification**
- POST /api/export endpoint
- Request format (LegalDocument JSON)
- Response format (DOCX binary)
- Error handling

**Section 3: Export Pipeline**
From Section 13:
1. LegalDocument → Markdown conversion
2. Pandoc: Markdown → DOCX (with reference doc)
3. OOXML injection for complex formatting
4. Certificate of service generation

**Section 4: Pandoc Integration**
From Section 13.2:
- Pandoc command construction
- Reference document usage
- Style mapping
- Error handling

**Section 5: OOXML Injection**
From Section 13.4:
- When to use OOXML vs Pandoc
- python-docx usage
- lxml for complex manipulation
- Preserving reference styles

**Section 6: Certificate of Service**
From Section 13.5:
- Template structure
- Date formatting
- Attorney information insertion
- Signature line placement

**Section 7: Implementation Steps**
1. Set up FastAPI server
2. Implement Markdown generator
3. Implement Pandoc integration
4. Implement OOXML injector
5. Implement certificate generator
6. Add health endpoint
7. Write round-trip tests
8. Package as executable

**Section 8: Verification**
- Export test document
- Verify styles preserved
- Verify formatting correct
- Round-trip test (ingest → export → compare)

### Additional Content to Add

**Dependencies:**
```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-docx==1.1.0
lxml==5.1.0
pandoc==2.3
pydantic==2.5.3
```

**Service Structure:**
```
services/export-service/
├── app/
│   ├── routes/
│   │   └── export.py
│   ├── generators/
│   │   ├── markdown_generator.py
│   │   ├── pandoc_converter.py
│   │   ├── ooxml_injector.py
│   │   └── certificate_generator.py
│   └── main.py
├── tests/
│   └── fixtures/
│       ├── legal_document.json
│       └── expected_output.docx
├── requirements.txt
└── build.spec
```

**Complete Code Examples:**
- Markdown generation
- Pandoc command execution
- OOXML manipulation
- Certificate generation

**Round-Trip Testing:**
- Detailed verification process
- Diff strategy for DOCX comparison

**Estimated Size:** 40-45 pages

---

## Runbook 6: Specialized Services (CaseBlock, Signature, Facts, Exhibits, Caselaw)

### Source Material (from Runbook 0)
- Section 15.2: Core Services (all 5 services)
- Section 10: API Endpoints (all service endpoints)
- Section 4: Section-Specific Processing (CaseBlock)
- Section 7: Signature Block Handling
- Section 5: Facts & Evidence Linking
- Section 8: Exhibits Management
- Section 9: Caselaw Integration

### Content to Extract

**For each service, include:**

#### CaseBlock Service
- Section 4.1: Case Block Structure
- Section 4.2: Caption Formatting
- API: POST /api/extract-caseblock
- API: POST /api/format-caseblock

#### Signature Service
- Section 7.1: Signature Block Detection
- Section 7.2: Attorney Certification
- API: POST /api/extract-signature
- API: POST /api/format-signature

#### Facts Service
- Section 5.1: Sentence Registry
- Section 5.2: Evidence Linking
- API: POST /api/register-sentences
- API: POST /api/link-evidence

#### Exhibits Service
- Section 8.1: Exhibit Management
- Section 8.2: Appendix Generation
- API: POST /api/manage-exhibits
- API: POST /api/generate-appendix

#### Caselaw Service
- Section 9.1: Citation Detection
- Section 9.2: Case Linking
- API: POST /api/detect-citations
- API: POST /api/link-caselaw

### Structure for Each Service

**1. Purpose & Context**
- What this service does
- When it's used in the workflow
- Dependencies on other services

**2. API Specification**
- Complete endpoint documentation
- Request/response formats
- Error handling

**3. Core Algorithm**
- Processing logic
- Data structures
- Business rules

**4. Implementation Steps**
1. Set up Express server
2. Implement core logic
3. Create route handlers
4. Add validation
5. Add health endpoint
6. Write tests
7. Package as executable

**5. Verification**
- Unit tests
- Integration tests
- Health check

### Additional Content to Add

**Service Template:**
(Reusable structure for all 5 services)

```
services/[service-name]/
├── src/
│   ├── routes/
│   │   └── [service].ts
│   ├── services/
│   │   └── [service]-service.ts
│   ├── models/
│   │   └── [service]-models.ts
│   └── server.ts
├── tests/
├── package.json
└── build.js
```

**Common Dependencies:**
```json
{
  "express": "^4.18.2",
  "zod": "^3.22.4",
  "dotenv": "^16.3.1"
}
```

**Service-Specific Dependencies:**
- Caselaw: eyecite for citation parsing
- Others: minimal additional deps

**Estimated Size:** 60-70 pages (all 5 services)

---

## Runbook 7: Desktop Orchestrator Implementation

### Source Material (from Runbook 0)
- Section 15.4: Desktop App (Electron + Child Process Orchestration)
- Section 22.4: Orchestrator Injection (Desktop)
- Section 21.2: Desktop Deployment

### Content to Extract

**Section 1: Orchestrator Architecture**
- Child process management (NOT Docker)
- PID management for zombie prevention
- Health check orchestration
- Auto-restart on crash
- Graceful shutdown

**Section 2: Complete DesktopOrchestrator Class**
From Section 15.4:
- cleanupZombies() method
- startServices() method
- waitForHealthChecks() method
- stopServices() method
- PID tracking (service-pids.json)
- Tree-kill for process cleanup

**Section 3: Service Configuration**
From Section 22.4:
- Environment variable injection
- Service URL configuration (localhost:3001-3008)
- Platform-specific executable paths
- Database path configuration

**Section 4: Electron Integration**
- Main process setup
- Orchestrator initialization
- App lifecycle hooks (ready, before-quit)
- Error handling (uncaughtException)

**Section 5: Implementation Steps**
1. Set up Electron project
2. Create DesktopOrchestrator class
3. Implement zombie cleanup
4. Implement service spawning
5. Implement health checking
6. Implement graceful shutdown
7. Bundle service executables in resources
8. Test on all platforms

**Section 6: Verification**
- Services start on app launch
- PID file created correctly
- Zombie cleanup works after crash
- Services stop on app quit
- No orphaned processes

### Additional Content to Add

**Dependencies:**
```json
{
  "electron": "^28.0.0",
  "tree-kill": "^1.2.2"
}
```

**Complete Orchestrator Code:**
(Full implementation from Section 15.4)

**Platform-Specific Considerations:**
- Windows: .exe extension
- macOS: Permissions, signing
- Linux: AppImage considerations

**Testing Scenarios:**
1. Normal startup/shutdown
2. Force quit (kill -9)
3. Service crash
4. Port already in use
5. Missing executable

**Estimated Size:** 35-40 pages

---

## Runbook 8: Frontend UI Implementation

### Source Material (from Runbook 0)
- Section 11: UI/UX Specifications
- Section 11.1: Main Window Layout
- Section 11.2: Tiptap Editor Configuration
- Section 11.3: Evidence Sidebar
- Section 3: Citation Extension

### Content to Extract

**Section 1: Application Architecture**
- Vue 3 + Pinia
- Component structure
- Routing (if applicable)
- State management

**Section 2: Main Window Layout**
From Section 11.1:
- Three-panel layout
- Case list (left)
- Editor (center)
- Evidence sidebar (right)
- Menu bar
- Keyboard shortcuts

**Section 3: Tiptap Editor**
From Section 11.2:
- Editor configuration
- Extensions:
  - Citation (custom)
  - Footnote
  - Table
  - Basic formatting
- Toolbar implementation
- Keyboard shortcuts

**Section 4: Citation Extension**
From Section 3:
- Complete extension implementation
- Citation mark rendering
- Evidence ID tracking
- supportsSentenceIds attribute
- Drag-and-drop integration

**Section 5: Evidence Sidebar**
From Section 11.3:
- Evidence list display
- Upload functionality
- Drag-and-drop to editor
- Evidence preview
- Filtering/search

**Section 6: Views & Components**
- CasesView
- DraftView
- TemplatesView
- Editor component
- Evidence component
- Toolbar component

**Section 7: API Integration**
- Service adapters
- API client setup
- Error handling
- Loading states

**Section 8: Implementation Steps**
1. Set up Vue 3 project
2. Create component structure
3. Implement Tiptap editor
4. Implement Citation extension
5. Implement Evidence sidebar
6. Implement drag-and-drop
7. Connect to services
8. Add keyboard shortcuts
9. Write component tests

**Section 9: Verification**
- Component rendering
- Editor functionality
- Citation creation
- Evidence linking
- API communication
- E2E user workflows

### Additional Content to Add

**Dependencies:**
```json
{
  "vue": "^3.4.15",
  "pinia": "^2.1.7",
  "@tiptap/vue-3": "^2.1.16",
  "@tiptap/starter-kit": "^2.1.16",
  "axios": "^1.6.5"
}
```

**Component Structure:**
```
apps/desktop-frontend/src/
├── components/
│   ├── Editor/
│   │   ├── TiptapEditor.vue
│   │   ├── Toolbar.vue
│   │   └── extensions/
│   │       └── Citation.ts
│   ├── Evidence/
│   │   ├── EvidenceSidebar.vue
│   │   ├── EvidenceList.vue
│   │   ├── EvidenceUpload.vue
│   │   └── EvidencePreview.vue
│   └── Layout/
│       ├── MainLayout.vue
│       ├── CaseList.vue
│       └── MenuBar.vue
├── views/
│   ├── CasesView.vue
│   ├── DraftView.vue
│   └── TemplatesView.vue
├── stores/
│   ├── cases.ts
│   ├── drafts.ts
│   └── evidence.ts
├── adapters/
│   ├── api.ts
│   ├── cases-api.ts
│   └── evidence-api.ts
└── main.ts
```

**Complete Code Examples:**
- Citation extension (full implementation)
- Drag-and-drop handler
- Evidence sidebar logic
- API adapter pattern

**Estimated Size:** 50-55 pages

---

## Runbook 9: Service Discovery & Configuration

### Source Material (from Runbook 0)
- Section 22: Service Discovery & Configuration
- Section 22.2: Configuration Strategy
- Section 22.3: Service Code Pattern
- Section 22.4: Orchestrator Injection (Desktop)
- Section 22.5: Kubernetes Injection (Cloud)

### Content to Extract

**Section 1: Problem & Solution**
- Why service discovery is needed
- localhost vs k8s DNS challenge
- Environment variable solution

**Section 2: Configuration Pattern**
From Section 22.2:
- Environment variables for all service URLs
- Service code reads from process.env
- No hardcoded URLs anywhere

**Section 3: Desktop Implementation**
From Section 22.4:
- Orchestrator injects environment variables
- All services get localhost:300X URLs
- Example configuration

**Section 4: Cloud Implementation**
From Section 22.5:
- Kubernetes ConfigMaps
- DNS-based service names
- Example Kubernetes config

**Section 5: Health Check Validation**
From Section 22.6:
- Health endpoint checks configuration
- Validates dependencies reachable
- Returns configuration status

**Section 6: Implementation Steps**
1. Update all 8 services to use env vars
2. Update orchestrator to inject env vars
3. Create Kubernetes ConfigMaps
4. Update health checks
5. Test desktop mode
6. Test cloud simulation (Docker Compose)
7. Verify cross-service communication

**Section 7: Verification**
- Desktop: Services use localhost URLs
- Cloud: Services use DNS names
- Health checks validate config
- Cross-service calls work

### Additional Content to Add

**Service Code Template:**
```typescript
// config.ts
export const config = {
  port: parseInt(process.env.PORT || '3001'),
  services: {
    records: process.env.RECORDS_SERVICE_URL || 'http://localhost:3001',
    ingestion: process.env.INGESTION_SERVICE_URL || 'http://localhost:3002',
    // ... all 8 services
  }
};
```

**Orchestrator Injection:**
```typescript
// Complete implementation of environment injection
```

**Kubernetes ConfigMap:**
```yaml
# infrastructure/kubernetes/config-maps.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: service-urls
data:
  RECORDS_SERVICE_URL: "http://records-service:3001"
  # ... all 8 services
```

**Docker Compose (for testing):**
```yaml
# infrastructure/docker/docker-compose.yml
version: '3.8'
services:
  records-service:
    environment:
      - RECORDS_SERVICE_URL=http://records-service:3001
      # ... etc
```

**Estimated Size:** 25-30 pages

---

## Runbook 10: Desktop Packaging & Distribution

### Source Material (from Runbook 0)
- Section 15.6: Electron Bundling
- Section 21.2: Desktop Deployment

### Content to Extract

**Section 1: Packaging Strategy**
- electron-builder configuration
- Service executables bundling
- Resource packaging
- Platform-specific builds

**Section 2: Bundled Application Structure**
From Section 15.6:
```
FACTSWAY.app/
├── Contents/
│   ├── MacOS/
│   │   └── FACTSWAY
│   ├── Resources/
│   │   ├── app.asar
│   │   ├── services/ (8 executables)
│   │   └── pandoc/
│   └── Info.plist
```

**Section 3: electron-builder Configuration**
- Build targets (DMG, NSIS, AppImage)
- Extra resources configuration
- Code signing setup
- Auto-updater configuration

**Section 4: Implementation Steps**
1. Configure electron-builder
2. Bundle service executables
3. Configure code signing (macOS, Windows)
4. Configure notarization (macOS)
5. Set up auto-updater
6. Build for all platforms
7. Test installations
8. Create uninstallers

**Section 5: Verification**
- Install on macOS
- Install on Windows
- Install on Linux
- Verify services start
- Verify data persistence
- Test auto-update

### Additional Content to Add

**electron-builder.json:**
```json
{
  "appId": "com.factsway.app",
  "productName": "FACTSWAY",
  "directories": {
    "output": "dist"
  },
  "files": ["dist-electron/**/*", "dist/**/*"],
  "extraResources": [
    { "from": "build/services/", "to": "services/" },
    { "from": "build/pandoc/", "to": "pandoc/" }
  ],
  "mac": {
    "target": "dmg",
    "category": "public.app-category.productivity",
    "hardenedRuntime": true,
    "entitlements": "build/entitlements.plist"
  },
  "win": {
    "target": "nsis",
    "certificateSubjectName": "FACTSWAY Inc"
  }
}
```

**Code Signing Setup:**
- macOS: Developer ID
- Windows: EV Certificate
- Signing commands

**Auto-Updater Configuration:**
- Update server setup
- Version checking
- Delta updates

**Platform Testing Checklist:**
- Installation process
- First launch
- Service startup
- Data persistence
- Uninstallation
- Update process

**Estimated Size:** 30-35 pages

---

## Runbook 11: Web Trial Implementation

### Source Material (from Runbook 0)
- Section 23: Freemium Strategy
- Section 1.7: Web Trial deployment model
- Section 21.3: Cloud Deployment

### Content to Extract

**Section 1: Web Trial Purpose**
From Section 23.1:
- Conversion funnel
- Lead generation strategy
- Trial → Desktop conversion

**Section 2: Feature Set**
From Section 23.2:
- Free tier features (upload, extract, format)
- Limitations (3/day, watermarks, no evidence linking)
- Paid tier comparison

**Section 3: Implementation**
From Section 23.3:
- Rate limiting middleware
- Watermark injection
- Feature flags

**Section 4: Frontend (Vue SPA)**
- Upload form
- Results display
- Conversion CTA
- Download buttons

**Section 5: Backend (Cloud Services)**
From Section 21.3:
- Kubernetes deployment
- Services needed (Ingestion, CaseBlock, Signature, Export)
- Load balancing
- Auto-scaling

**Section 6: Implementation Steps**
1. Create Vue web app
2. Implement upload form
3. Deploy services to Kubernetes
4. Add rate limiting
5. Add watermarking
6. Implement analytics
7. Create landing page
8. Deploy to production

**Section 7: Verification**
- Upload document
- Verify processing
- Verify watermark
- Test rate limiting
- Track conversions

### Additional Content to Add

**Frontend Structure:**
```
apps/web-trial/
├── src/
│   ├── components/
│   │   ├── UploadForm.vue
│   │   ├── ResultsDisplay.vue
│   │   └── ConversionCTA.vue
│   ├── views/
│   │   ├── HomeView.vue
│   │   └── ResultsView.vue
│   └── main.ts
├── public/
└── vite.config.ts
```

**Rate Limiting Middleware:**
```typescript
import rateLimit from 'express-rate-limit';

const trialLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3,
  message: 'Daily limit reached. Download desktop app.'
});
```

**Kubernetes Deployments:**
- Complete YAML files for all 4 services
- Ingress configuration
- SSL/TLS setup

**Analytics Integration:**
- Google Analytics 4
- Conversion tracking
- Funnel analysis

**Estimated Size:** 35-40 pages

---

## Runbook 14: Evidence System Implementation

### Source Material (from Runbook 0)
- Section 6: Evidence Linking
- Section 5: Facts & Evidence Linking (Facts Service)
- Section 8: Exhibits Management
- Section 11.3: Evidence Sidebar

### Content to Extract

**Section 1: Evidence System Architecture**
- Sentence-level addressing
- Evidence → Citation linking
- Appendix auto-generation

**Section 2: Evidence Service**
From Section 6:
- Evidence upload
- Evidence storage
- Evidence metadata
- Link management

**Section 3: Sentence Registry**
From Section 5.1:
- Sentence ID generation
- Registry computation
- Sentence addressing

**Section 4: Evidence Linking**
From Section 5.2:
- Citation → Evidence association
- supportsSentenceIds tracking
- Link validation

**Section 5: Appendix Generation**
From Section 8.2:
- Exhibit ordering (A, B, C...)
- Appendix formatting
- Page numbering
- Table of exhibits

**Section 6: UI Components**
From Section 11.3:
- Evidence sidebar
- Drag-and-drop
- Evidence preview modal
- Link indicators

**Section 7: Implementation Steps**
1. Implement Evidence Service endpoints
2. Build evidence upload system
3. Implement citation linking
4. Build evidence preview
5. Implement drag-and-drop
6. Build appendix generator
7. Add evidence highlighting
8. Write integration tests

**Section 8: Verification**
- Upload evidence
- Link to citation
- Verify link created
- Generate appendix
- Verify exhibit ordering

### Additional Content to Add

**Evidence Service Structure:**
```
services/evidence-service/
├── src/
│   ├── routes/
│   │   ├── evidence.ts
│   │   └── links.ts
│   ├── services/
│   │   ├── evidence-service.ts
│   │   └── appendix-generator.ts
│   └── server.ts
```

**Evidence Upload Implementation:**
- Multipart form handling
- File validation
- Storage strategy (filesystem vs cloud)

**Appendix Generator Algorithm:**
- Collect all citations
- Order exhibits
- Generate exhibit pages
- Create table of exhibits

**UI Component Examples:**
- Complete drag-and-drop code
- Evidence preview modal
- Link indicator rendering

**Estimated Size:** 45-50 pages

---

## Runbook 15: Integration Testing & Launch Preparation

### Source Material (from Runbook 0)
- Section 18: Verification Checklist
- Section 20: Execution Tracing & Debugging
- All previous sections (for integration testing)

### Content to Extract

**Section 1: Integration Testing Strategy**
- End-to-end workflows
- Service communication tests
- Error handling tests
- Performance tests

**Section 2: Test Scenarios**
From Section 18:
- Complete case workflow (create → draft → export)
- Evidence linking workflow
- Multi-case management
- Error recovery scenarios

**Section 3: Performance Testing**
- Document processing speed benchmarks
- Service startup time
- Memory usage monitoring
- Concurrent user handling

**Section 4: Security Audit**
- Input validation
- SQL injection prevention
- XSS prevention
- File upload validation
- Authentication (for web trial)

**Section 5: Accessibility Testing**
- WCAG 2.1 compliance
- Keyboard navigation
- Screen reader support
- Color contrast

**Section 6: Production Deployment**
- Deployment scripts
- Environment configuration
- Monitoring setup
- Logging configuration

**Section 7: Documentation**
- User manual
- Support documentation
- Developer documentation
- API documentation

**Section 8: Launch Checklist**
- All tests passing
- Security audit complete
- Accessibility compliance
- Documentation complete
- Monitoring active
- Support ready

### Additional Content to Add

**Test Suite Structure:**
```
tests/
├── unit/              # Service-specific
├── integration/       # Cross-service
├── e2e/              # Complete workflows
├── performance/       # Benchmarks
└── security/         # Security scans
```

**Complete E2E Test Examples:**
```typescript
// E2E test: Create case, draft motion, export
describe('Complete workflow', () => {
  it('should create case, draft motion, and export', async () => {
    // Test implementation
  });
});
```

**Performance Benchmarks:**
- Target metrics
- Measurement approach
- Regression detection

**Security Checklist:**
- OWASP Top 10 coverage
- Dependency vulnerability scanning
- Code security review

**Launch Preparation:**
- Pre-launch checklist
- Go/no-go criteria
- Rollback plan
- Post-launch monitoring

**Estimated Size:** 40-45 pages

---

## Generation Workflow

### Phase 1: Preparation (Day 1)

**Tasks:**
1. Finalize Runbook 0 (apply Edits 54A-D)
2. Review Runbook 0 completely
3. Identify all source sections for each Runbook

**Output:** Runbook 0 finalized and locked

### Phase 2: Generation (Days 2-3)

**Process for each Runbook:**

1. **Extract** relevant sections from Runbook 0
2. **Organize** into Runbook template structure
3. **Expand** with implementation details:
   - Complete code examples
   - Dependencies
   - File structures
   - Step-by-step instructions
4. **Add** verification criteria
5. **Add** common pitfalls and troubleshooting
6. **Add** handoff specifications
7. **Review** for completeness
8. **Save** as standalone markdown file

**Estimated time per Runbook:** 2-4 hours

**Total time for all 15:** ~30-50 hours (can be done in parallel or sequentially)

### Phase 3: Review (Day 4)

**Tasks:**
1. Review all 15 Runbooks for consistency
2. Verify dependencies are correct
3. Check verification criteria are complete
4. Ensure handoffs are clear
5. Final proofreading

### Phase 4: Validation (Day 5)

**Tasks:**
1. Attempt to execute Runbook 1 (Reference Document)
2. Verify Runbook is sufficient (no need to reference Runbook 0)
3. If issues found, refine generation process
4. Iterate as needed

---

## Runbook Document Naming

```
RUNBOOK_01_REFERENCE_DOCUMENT_CREATION.md
RUNBOOK_02_DATABASE_SCHEMA_IMPLEMENTATION.md
RUNBOOK_03_RECORDS_SERVICE_IMPLEMENTATION.md
RUNBOOK_04_INGESTION_SERVICE_IMPLEMENTATION.md
RUNBOOK_05_EXPORT_SERVICE_IMPLEMENTATION.md
RUNBOOK_06_SPECIALIZED_SERVICES_IMPLEMENTATION.md
RUNBOOK_07_DESKTOP_ORCHESTRATOR_IMPLEMENTATION.md
RUNBOOK_08_FRONTEND_UI_IMPLEMENTATION.md
RUNBOOK_09_SERVICE_DISCOVERY_CONFIGURATION.md
RUNBOOK_10_DESKTOP_PACKAGING_DISTRIBUTION.md
RUNBOOK_11_WEB_TRIAL_IMPLEMENTATION.md
RUNBOOK_12_MOBILE_APP_FOUNDATION.md
RUNBOOK_13_API_DOCUMENTATION_CLIENT_SDKS.md
RUNBOOK_14_EVIDENCE_SYSTEM_IMPLEMENTATION.md
RUNBOOK_15_INTEGRATION_TESTING_LAUNCH_PREP.md
```

---

## Quality Criteria for Generated Runbooks

Each Runbook must meet these criteria:

### Completeness ✅
- [ ] All necessary specifications from Runbook 0 included
- [ ] No references to "see Runbook 0" (standalone)
- [ ] Complete code examples provided
- [ ] All dependencies listed
- [ ] File structure fully defined

### Clarity ✅
- [ ] Step-by-step instructions (no ambiguity)
- [ ] Code examples are complete and runnable
- [ ] Verification criteria are specific and measurable
- [ ] Common pitfalls identified with solutions

### Executability ✅
- [ ] Fresh Claude Code instance could execute this Runbook
- [ ] Input requirements clearly stated
- [ ] Output deliverables clearly defined
- [ ] Verification is automated where possible

### Handoff ✅
- [ ] Clear definition of what next Runbook needs
- [ ] Handoff checklist provided
- [ ] Dependencies explicitly stated

---

## Execution Priority

### Must Generate First (Week 1):
1. Runbook 1 (Reference Document) - needed for all export work
2. Runbook 2 (Database Schema) - foundation for all services
3. Runbook 3 (Records Service) - first service to implement

### Can Generate in Parallel:
- Runbooks 4-6 (Services) - can be generated together
- Runbooks 7-8 (Desktop) - can be generated together
- Runbooks 9-11 (Deployment) - can be generated together

### Generate Last:
- Runbook 14 (Evidence) - depends on many other components
- Runbook 15 (Integration Testing) - needs everything else complete

---

## Automation Considerations

### What Can Be Automated:
- Extracting sections from Runbook 0
- Generating file structure templates
- Creating code scaffolding examples
- Generating verification checklists

### What Requires Manual Work:
- Writing clear step-by-step instructions
- Creating complete code examples
- Identifying common pitfalls
- Defining quality criteria

### Tooling:
- Simple Python script to extract sections by heading
- Markdown template generator
- Code example injector

---

## Next Steps

### Immediate (After Runbook 0 Finalized):

1. **Generate Runbook 1** (Reference Document)
   - Extract from Sections 17, 13.3, Appendix B
   - Add Word/LibreOffice instructions
   - Add verification commands
   - Test execution

2. **Generate Runbook 2** (Database Schema)
   - Extract from Sections 2, 12
   - Add migration examples
   - Add seed data
   - Test execution

3. **Generate Runbook 3** (Records Service)
   - Extract from Sections 15.2, 10, 2
   - Add complete code examples
   - Add packaging instructions
   - Test execution

### Short-term (Week 1):
- Generate Runbooks 4-6 (all services)
- Begin executing Runbooks 1-3

### Medium-term (Weeks 2-3):
- Generate Runbooks 7-11 (Desktop + Web)
- Continue executing previous Runbooks

### Long-term (Weeks 4+):
- Generate Runbooks 14-15 (Evidence + Testing)
- Complete all executions
- Launch v1.0

---

## Success Metrics

### Runbook Quality:
- ✅ Claude Code can execute without asking questions
- ✅ All verifications pass first time
- ✅ Clean handoff to next Runbook
- ✅ No need to reference Runbook 0

### Execution Quality:
- ✅ Each Runbook completes in estimated time
- ✅ No rework needed
- ✅ Tests pass on first execution
- ✅ Deliverables match specifications

### Overall Success:
- ✅ 15 Runbooks generated in 1 week
- ✅ v1.0 launched in 10-12 weeks
- ✅ Zero architectural drift
- ✅ One-shot philosophy maintained

---

## Conclusion

This plan provides a complete strategy for generating all 15 Runbooks from Runbook 0. Each Runbook will be:
- **Complete:** All necessary information included
- **Standalone:** No need to reference Runbook 0
- **Executable:** Claude Code can follow mechanically
- **Verifiable:** Clear pass/fail criteria
- **Professional:** Ready for production use

**The next step:** Apply Edits 54A-D to finalize Runbook 0, then begin generating Runbooks 1-15 using this plan.

**Timeline:** 1 week to generate all Runbooks, 10-12 weeks to execute and launch v1.0.

**Confidence:** 9.5/10 ✅
