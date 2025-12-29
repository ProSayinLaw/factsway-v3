# RUNBOOK 0: Contract Definition

## Purpose

This document is the **canonical specification** for the FACTSWAY Legal Drafting Engine. Every subsequent runbook must comply with the contracts defined here. No implementation decisions should be made that contradict this document.

**Audience:** Claude Code (for building), Human (for verification)

**Status:** LOCKED - Do not modify during build phase

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Data Architecture](#2-data-architecture)
3. [Template System](#3-template-system)
4. [LegalDocument Schema](#4-legaldocument-schema-canonical-backend-contract)
5. [Case Block Specification](#5-case-block-specification)
6. [Signature Block Specification](#6-signature-block-specification)
7. [Body Editor Specification](#7-body-editor-specification)
8. [Section Hierarchy System](#8-section-hierarchy-system)
9. [Footer & Page Numbering](#9-footer--page-numbering)
10. [Document Parsing Rules](#10-document-parsing-rules)
11. [API Endpoints](#11-api-endpoints)
12. [UI/UX Specifications](#12-uiux-specifications)
13. [Persistence & Storage](#13-persistence--storage)
14. [Export Pipeline](#14-export-pipeline)
15. [Preview System](#15-preview-system)
16. [Technology Stack](#16-technology-stack)
17. [File Structure](#17-file-structure)
18. [Pre-built Texas Template](#18-pre-built-texas-template)
19. [Verification Checklist](#19-verification-checklist)
20. [Design System](#20-design-system)
    - [20.1 Design Tokens](#201-design-tokens)
    - [20.2 Typography](#202-typography)
    - [20.3 Color Semantics](#203-color-semantics)
    - [20.4 Component Specifications](#204-component-specifications)
    - [20.5 Layout Patterns](#205-layout-patterns)
    - [20.6 Interaction Patterns](#206-interaction-patterns)
    - [20.7 View Specifications](#207-view-specifications)
21. [Execution Tracing](#21-execution-tracing)
    - [21.1 Design Principles](#211-design-principles)
    - [21.2 Pipeline Event Schema](#212-pipeline-event-schema)
    - [21.3 Invariant Result Schema](#213-invariant-result-schema)
    - [21.4 Pipeline Boundaries](#214-pipeline-boundaries)
    - [21.5 Trace Storage](#215-trace-storage)
    - [21.6 Invariant Definitions by Domain](#216-invariant-definitions-by-domain)
    - [21.7 Failure Handling](#217-failure-handling)
    - [21.8 Trace Query Interface](#218-trace-query-interface)
    - [21.9 UI Integration](#219-ui-integration)
    - [21.10 Implementation Notes](#2110-implementation-notes)
22. [Deployment Models](#22-deployment-models)
    - [22.1 Overview](#221-overview)
    - [22.2 Desktop Deployment](#222-desktop-deployment-primary)
    - [22.3 Cloud Deployment](#223-cloud-deployment-web-trial--mobile)
    - [22.4 Enterprise Deployment](#224-enterprise-deployment-on-premise)
23. [Service Discovery & Configuration](#23-service-discovery--configuration)
    - [23.1 Overview](#231-overview)
    - [23.2 Configuration Strategy](#232-configuration-strategy)
    - [23.3 Service Code Pattern](#233-service-code-pattern)
    - [23.4 Orchestrator Injection](#234-orchestrator-injection-desktop)
    - [23.5 Kubernetes Injection](#235-kubernetes-injection-cloud)
    - [23.6 Validation](#236-validation)
24. [Freemium Conversion Strategy](#24-freemium-conversion-strategy)
    - [24.1 Conversion Funnel](#241-conversion-funnel)
    - [24.2 Trial Feature Set](#242-trial-feature-set)
    - [24.3 Implementation](#243-implementation)

**Appendices:**
- [Appendix A: OOXML Injection Code Pattern](#appendix-a-ooxml-injection-code-pattern)
- [Appendix B: LLM Integration Pattern](#appendix-b-llm-integration-pattern)
- [Appendix C: Sample Test Documents](#appendix-c-sample-test-documents)

---

## 1. System Overview

### 1.1 What We're Building

A browser-based legal document drafting platform that:

- Allows users to create reusable **templates** (formatting rules, outline schemas, boilerplate)
- Stores **case information** (parties, court, cause number) separately from templates
- Enables **motion drafting** with a structured editor that enforces hierarchy
- Exports **perfectly formatted Word documents** (.docx) that match user's template exactly
- Provides **true WYSIWYG preview** via PDF generation

### 1.2 Core Architecture

FACTSWAY is built as a microservices architecture with 8 independent backend services and a Vue 3 frontend.

**Framework Choice: Vue 3**
- Better for single developer (less boilerplate)
- Perfect for LLM-driven dynamic UI (`<component :is>` directive)
- Official Tiptap support (`@tiptap/vue-3`)
- Built-in transitions for workspace reconfiguration
- Pinia state management (simpler than Redux)

See [ARCHITECTURAL_DECISIONS_SUMMARY.md](../Runbooks/Prep Plan/ARCHITECTURAL_DECISIONS_SUMMARY.md) for full rationale.

```
┌─────────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Vue 3 + Vite)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │  Template   │  │    Case     │  │   Draft     │  │  Evidence  │ │
│  │   Builder   │  │   Manager   │  │   Editor    │  │   Panel    │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬──────┘ │
│         │                │                │                │        │
│         └────────────────┴────────────────┴────────────────┘        │
│                                   │                                  │
│                          Tiptap JSON (UI State)                      │
│                          ↕ Transform Layer                           │
│                       LegalDocument (Backend)                        │
└───────────────────────────────────┬─────────────────────────────────┘
                                    │ REST API (OpenAPI)
                                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│                    MICROSERVICES (FastAPI)                            │
│                                                                       │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐         │
│  │ Records (3001) │  │ Ingestion      │  │ Export (3003)  │         │
│  │ Template/Case/ │  │ (3002)         │  │ LegalDoc →     │         │
│  │ Draft CRUD     │  │ DOCX → Legal   │  │ DOCX Pipeline  │         │
│  └────────────────┘  │ Document       │  └────────────────┘         │
│                      └────────────────┘                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐         │
│  │ CaseBlock      │  │ Signature      │  │ Facts (3006)   │         │
│  │ (3004)         │  │ (3005)         │  │ Sentence       │         │
│  │ Caption Format │  │ Sig Block      │  │ Registry +     │         │
│  └────────────────┘  │ Extraction     │  │ Evidence Links │         │
│                      └────────────────┘  └────────────────┘         │
│  ┌────────────────┐  ┌────────────────┐                             │
│  │ Exhibits       │  │ Caselaw        │                             │
│  │ (3007)         │  │ (3008)         │                             │
│  │ Exhibit Mgmt + │  │ Citation       │                             │
│  │ Appendix Gen   │  │ Detection      │                             │
│  └────────────────┘  └────────────────┘                             │
│                                                                       │
│  All services share:                                                 │
│  - LegalDocument schema (Section 4)                                  │
│  - REST API contracts (Section 11)                                   │
│  - Health check + metrics endpoints                                  │
└───────────────────────────────────────────────────────────────────────┘
```

**Key Architectural Principles:**

1. **Service Independence:** Each service can be developed, tested, and deployed independently
2. **Schema Contract:** All services communicate via LegalDocument schema (Section 4)
3. **Deployment Flexibility:** Services run as processes (Desktop) OR containers (Cloud)
4. **Frontend Transformation:** Vue 3 app transforms Tiptap JSON ↔ LegalDocument
5. **No Backend State:** Services are stateless (Records Service handles persistence)

### 1.3 Data Flow Summary

**Upload Flow:**
```
User uploads .docx → Parser extracts structure → LLM identifies body start
→ Returns: case_data + body_content + signature_block_ooxml
→ User selects template to apply → Case created → Draft created
```

**Build-from-Scratch Flow:**
```
User selects template → Creates new case (enters data) → Creates new draft
→ Types motion body → Exports
```

**Export Flow:**
```
Draft + Case + Template → Pandoc converts HTML body to DOCX
→ OOXML injector merges case block + body + signature → Final .docx
→ WYSIWYG PDF preview via Electron printToPDF API

**Decision:** Removed LibreOffice dependency
- LibreOffice: ~500MB bundle size
- Electron printToPDF: Built-in, no extra size
- Result: Same WYSIWYG, saves 500MB

See Export Service (Runbook 5) for Electron printToPDF implementation
```

### 1.4 Runbook Execution Plan

This project is built through 15 discrete runbooks organized into 4 phases, aligned with the microservices architecture defined in Section 1.7.

#### Phase 1: Foundation (Runbooks 0-2)
Establish contracts, shared infrastructure, and core document processing utilities.

| Runbook | Name | Produces | Depends On |
|---------|------|----------|------------|
| 0 | Contract Definition | This specification document | — |
| 1 | Shared Infrastructure | LegalDocument schema, shared types, validation utilities | 0 |
| 2 | Document Processing Core | OOXML generators, Pandoc wrapper, reference.docx | 0, 1 |

#### Phase 2: Microservices (Runbooks 3-10)
Build the 8 independent microservices that form the backend architecture.

| Runbook | Service | Port | Produces | Depends On |
|---------|---------|------|----------|------------|
| 3 | Records Service | 3001 | Template/Case/Draft CRUD, persistence layer | 0, 1 |
| 4 | Ingestion Service | 3002 | DOCX parser, LLM-based body detection | 0, 1, 2 |
| 5 | Export Service | 3003 | LegalDocument → DOCX pipeline, OOXML merger | 0, 1, 2 |
| 6 | CaseBlock Service | 3004 | Case caption extraction & formatting | 0, 1, 2 |
| 7 | Signature Service | 3005 | Signature block extraction & formatting | 0, 1, 2 |
| 8 | Facts Service | 3006 | Sentence registry, NUPunkt parser, evidence linking | 0, 1 |
| 9 | Exhibits Service | 3007 | Exhibit management, appendix generation | 0, 1 |
| 10 | Caselaw Service | 3008 | Citation detection, resolution, linking | 0, 1 |

#### Phase 3: Frontend (Runbooks 11-14)
Build the React-based user interface that orchestrates service calls.

| Runbook | Name | Produces | Depends On |
|---------|------|----------|------------|
| 11 | Frontend Core | React app, routing, API client layer, base components | 0, 1 |
| 12 | Template Builder | Template creation UI, variable editor, style configurator | 0, 11 |
| 13 | Draft Editor | Tiptap editor, toolbar, real-time collaboration hooks | 0, 11 |
| 14 | Evidence System | Evidence sidebar, exhibit viewer, citation modals | 0, 11, 13 |

#### Phase 4: Integration (Runbook 15)
Unify all services into deployable artifacts for Desktop, Cloud, and Enterprise models.

| Runbook | Name | Produces | Depends On |
|---------|------|----------|------------|
| 15 | Deployment & Testing | Docker Compose, Electron orchestrator, E2E tests, CI/CD | 0-14 |

**Execution Rules:**

1. **Sequential execution:** Complete Runbook N before starting Runbook N+1
2. **Context reset:** Each runbook should be executable by Claude Code with fresh context (no memory of previous runbooks)
3. **Self-contained:** Each runbook includes all necessary specifications inline (copied from Runbook 0 where needed)
4. **Verification gate:** Each runbook ends with specific tests that must pass before proceeding
5. **No interpretation:** Runbooks contain exact code to write, not descriptions of what to build
6. **Service contracts:** Microservices (Phase 2) communicate ONLY via REST APIs defined in Section 10
7. **Schema compliance:** All services use LegalDocument schema defined in Section 4

**Phase Dependencies:**

- Phase 2 services can be built in parallel after Phase 1 completes
- Phase 3 requires Phase 2 to be complete for API integration testing
- Phase 4 integrates all previous phases

**Why This Structure:**

- **Microservices-first:** Each service is independently testable and deployable
- **Clean contracts:** LegalDocument schema (Section 4) prevents architectural drift
- **Deployment flexibility:** Same services run in Desktop (Electron) or Cloud (Kubernetes)
- **Context isolation:** Each runbook resets Claude's context to prevent accumulated errors
- **Testability:** Each phase has clear verification gates (Section 19)

### 1.5 Architecture Decision Record

This section documents key architectural decisions and their rationale to prevent contradictory implementations.

#### ADR-001: Dual Storage Model (LegalDocument + Tiptap)

**Decision:** Maintain two parallel representations of document content:
1. **LegalDocument schema** (Section 4) - Canonical storage in backend services
2. **Tiptap JSON** - UI-only representation for editor state

**Rationale:**
- LegalDocument provides stable structure for export pipeline and cross-service communication
- Tiptap JSON enables rich editing experience with real-time collaboration
- Clear boundary prevents schema pollution (UI concerns don't leak into storage layer)

**Consequences:**
- Frontend must transform LegalDocument ↔ Tiptap on load/save
- CitationNode, VariableNode exist ONLY in Tiptap (see ADR-002)
- Sentence IDs must be preserved during transformations (Section 2.9.3)

#### ADR-002: Frontend-Only Citation Representation

**Decision:** CitationNode is a Tiptap custom node that exists ONLY in the editor. Backend services never see CitationNode.

**Storage Flow:**
```
Frontend (Tiptap):           Backend (LegalDocument):
CitationNode                 Plain text "Exhibit A"
  ├─ type: "citation"         ↓
  ├─ exhibitId: "ex_123"     sentences: [
  └─ displayText: "A"          {text: "See Exhibit A attached.", id: "s_001"}
                              ]
                              ↓
                             exhibits: [
                               {id: "ex_123", label: "A", ...}
                             ]
```

**Rationale:**
- Separation of concerns: UI interaction vs. data storage
- Export pipeline works with plain text (no CitationNode parsing needed)
- Evidence linking happens via sentence IDs, not node references

**Consequences:**
- Citation detection runs in frontend (analyzes Tiptap state)
- Exhibit labels are computed from LegalDocument.exhibits array
- No "citation resolution" step in export pipeline

#### ADR-003: Microservices Communication via LegalDocument Schema

**Decision:** All backend services accept and return LegalDocument schema (Section 4). No service-specific schemas.

**Rationale:**
- Single source of truth prevents schema drift
- Services can be composed in any order (pipeline flexibility)
- Clear contract for API boundaries (Section 11)

**Consequences:**
- Services must validate incoming LegalDocument
- New fields require schema version bump
- Frontend API client layer transforms Tiptap → LegalDocument before POST

#### ADR-004: Sentence ID Stability

**Decision:** Sentence IDs must remain stable across:
- Editor interactions (typing, deletion, re-ordering)
- Save/load cycles
- Export pipeline transformations

**Algorithm:** See Section 2.9.3 for detailed preservation rules.

**Rationale:**
- Evidence links reference sentence IDs
- Breaking sentence IDs orphans evidence attachments
- Stable IDs enable audit trails and version comparison

**Consequences:**
- Facts Service (port 3006) is authoritative for sentence registry
- Frontend must call `/facts/parse` before allowing evidence attachment
- Sentence re-numbering triggers re-validation of all evidence links

#### ADR-005: Desktop-First Deployment

**Decision:** Desktop (Electron) is the primary deployment model. Cloud and Enterprise are derivative.

**Rationale:**
- Legal documents contain privileged/confidential information
- Attorneys prefer local-first tools (no cloud dependency)
- Desktop deployment enables offline work

**Consequences:**
- Services run as child processes (no Docker required for Desktop)
- Cloud deployment uses same service binaries in containers
- Free tier (web) uses limited cloud deployment for trial conversion (Section 23)

### 1.6 Development Workflow

This section defines the workflow for building and testing the system across all deployment models.

#### Local Development Setup

**Prerequisites:**
- Node.js 18+
- Python 3.11+
- Docker (optional, for cloud simulation)

**Service Development (any microservice):**
```bash
cd services/<service-name>
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py  # Runs on assigned port (e.g., 3001)
```

**Frontend Development:**
```bash
cd frontend
npm install
npm run dev  # Vite dev server with HMR
```

**Full Stack (Docker Compose):**
```bash
docker-compose up  # Runs all 8 services + frontend
```

#### Testing Strategy

**Unit Tests (each service):**
```bash
cd services/<service-name>
pytest tests/unit/
```

**Integration Tests (cross-service):**
```bash
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

**E2E Tests (Playwright):**
```bash
cd frontend
npm run test:e2e
```

**Verification Gates:**
- Phase 1: Schema validation tests pass
- Phase 2: Each service passes health check + unit tests
- Phase 3: Frontend builds without errors + E2E tests pass
- Phase 4: Full deployment smoke test (Desktop + Cloud)

#### API Contract Testing

**Rule:** Frontend cannot call backend until OpenAPI spec is validated.

**Workflow:**
1. Define endpoint in `api-spec.yaml` (Section 11)
2. Generate TypeScript client: `npm run generate-client`
3. Backend implements endpoint + passes schema validation
4. Frontend uses generated client (type-safe)

**Validation:**
```bash
# Backend
python scripts/validate_openapi.py

# Frontend
npm run validate-client
```

#### Branching Strategy

**Main branches:**
- `main` - Production-ready code
- `develop` - Integration branch for runbooks

**Runbook branches:**
- `runbook/01-shared-infrastructure`
- `runbook/02-document-processing`
- etc.

**Merge requirements:**
- All tests pass (unit + integration)
- OpenAPI spec validates
- E2E tests pass (if frontend changes)
- Code review approved

### 1.7 Deployment Architecture

FACTSWAY uses a microservices architecture that supports multiple deployment models while maintaining a consistent user experience.

#### Service-Oriented Design

The platform is built as independent services communicating via REST APIs:

```
Core Services:
├── Records Service (port 3001)
│   └── Template, Case, Draft CRUD operations
├── Ingestion Service (port 3002)  
│   └── DOCX → LegalDocument parsing
├── Export Service (port 3003)
│   └── LegalDocument → DOCX generation
├── CaseBlock Service (port 3004)
│   └── Case caption extraction and formatting
├── Signature Service (port 3005)
│   └── Signature block extraction and formatting
├── Facts Service (port 3006)
│   └── Sentence registry and evidence linking
├── Exhibits Service (port 3007)
│   └── Exhibit management and appendix generation
└── Caselaw Service (port 3008)
    └── Citation detection and linking
```

**Key architectural principles:**

1. **Service Independence:** Each service can be developed, tested, and deployed independently
2. **Clean Contracts:** Services communicate via documented REST APIs (Section 11)
3. **Deployment Flexibility:** Same services run as child processes (desktop) OR containers (cloud)
4. **Privacy by Design:** Sensitive document processing happens locally when deployed to desktop

#### Orchestration Models

**Desktop:** Services run as child processes spawned by Electron
- No Docker required
- Standard OS process management
- Lightweight resource usage
- PID tracking prevents zombie processes

**Cloud:** Services run as Docker containers in Kubernetes
- Horizontal scaling
- Load balancing
- Health monitoring
- Auto-restart on failure

#### Deployment Models

The same service code supports four deployment models:

**Model 1: Desktop App (Primary - Solo Lawyers)**

```
User's Computer
├── Electron Shell (UI container)
│   └── Vue/Tiptap frontend (localhost:8080)
├── Service Processes (spawned by Electron)
│   ├── Records Service → localhost:3001
│   ├── Ingestion Service → localhost:3002
│   ├── Export Service → localhost:3003
│   └── ... (all 8 services as executables)
├── SQLite Database
│   └── ~/Library/Application Support/FACTSWAY/
└── User's File System
    └── Documents processed locally, stored anywhere
```

**User experience:**
- Downloads installer once (~250MB)
- Services start automatically when app launches
- All processing happens on user's computer (full privacy)
- Works offline (airplane, courthouse without wifi)
- Documents stay on user's computer (Dropbox, local disk, wherever)

**Privacy:** ✅ Attorney-client privilege maintained (no cloud processing)

---

**Model 2: Web Trial (Freemium - Lead Generation)**

```
User's Browser
    ↓ (HTTPS)
Cloud Services (AWS/GCP - Docker containers)
├── Ingestion Service
├── CaseBlock Service  
├── Signature Service
└── Temporary Storage (7-day TTL)
```

**User experience:**
- No download required
- Upload motion.docx in browser
- Get reformatted case block + Excel export
- 3 uploads per day (rate limited)
- Watermarked exports

**Privacy:** ⚠️ Cloud processing (NOT for confidential work - warning displayed)

**Purpose:** Demonstrate value, convert to desktop app download

---

**Model 3: Mobile App (Pro Se Intake)**

```
User's Phone (iOS/Android)
    ↓ (HTTPS)
Cloud Services (Docker containers)
├── Voice-to-Text Service (Whisper API)
├── Facts Service (LLM structuring)
├── Evidence Upload (S3 storage)
└── Lawyer Matching Service
```

**User experience:**
- Pro se person records story via voice
- App creates structured fact list
- Uploads supporting evidence (photos, docs)
- Generates shareable intake package
- Connects with lawyers

**Privacy:** ⚠️ Pro se person not yet represented (no attorney-client privilege)

**Handoff:** Lawyer imports intake package to desktop app, continues work locally with full privacy

---

**Model 4: Enterprise On-Premise (Law Firms)**

```
Firm's Private Cloud (AWS/Azure)
├── FACTSWAY Services (Kubernetes - Docker containers)
│   ├── Records Service
│   ├── Ingestion Service
│   └── ... (all services)
├── PostgreSQL Database
└── Firm's Document Management Integration

Lawyer's Browser/Thin Client
    ↓ (HTTPS to firm's servers)
Accesses services on firm's infrastructure
```

**User experience:**
- Web-based interface
- All processing on firm's servers
- Centralized case management
- Team collaboration features

**Privacy:** ✅ Firm controls infrastructure and data

---

#### Service Communication

Services communicate via REST APIs with standardized contracts:

```typescript
// Example: Desktop app calls local service
const response = await fetch('http://localhost:3002/api/ingest', {
  method: 'POST',
  headers: { 'Content-Type': 'multipart/form-data' },
  body: formData  // Contains uploaded .docx
});

const result = await response.json();
// Returns: ParsedDocument (Section 2.4)
```

```typescript
// Example: Web trial calls cloud service
const response = await fetch('https://api.factsway.com/trial/ingest', {
  method: 'POST',
  headers: { 
    'Content-Type': 'multipart/form-data',
    'X-Trial-Token': trialToken  // Rate limiting
  },
  body: formData
});

const result = await response.json();
// Returns: Same ParsedDocument structure (same service code)
```

**Key point:** The frontend doesn't know if it's calling localhost:3002 or api.factsway.com - same API contract.

#### Benefits of This Architecture

**For Users:**
- Desktop app: Full privacy, offline capability
- Web trial: Try before download, no installation friction
- Mobile app: Accessibility for pro se litigants
- Flexible deployment based on needs

**For Development:**
- Write services once, deploy anywhere
- Test services independently
- Add new services without touching existing ones
- Scale services independently in cloud deployments

**For Business:**
- Multiple revenue streams (desktop B2C, web freemium, mobile, enterprise B2B, API licensing)
- Future-proof architecture (can add web version, mobile, API without rewrite)
- Clear upgrade path (free trial → paid desktop → enterprise)

---

---

## 2. Data Architecture

### 2.1 Three-Tier Inheritance Model

```
TEMPLATE (formatting + structure)
    │
    ├──→ CASE (parties + court info)
    │        │
    │        ├──→ DRAFT (motion content)
    │        ├──→ DRAFT
    │        └──→ DRAFT
    │
    └──→ CASE
             │
             └──→ DRAFT
```

Each level can override settings from its parent.

### 2.2 Template Schema

```typescript
interface Template {
  // Metadata
  id: string;                          // UUID
  name: string;                        // "Texas District Court Motion"
  description?: string;
  created_at: string;                  // ISO 8601
  modified_at: string;                 // ISO 8601
  
  // Case Block Configuration
  case_block: {
    court_line_format: string;         // "IN THE {{court_type}} COURT OF {{county}}, TEXAS"
    judicial_district_format: string;  // "{{district_number}} JUDICIAL DISTRICT"
    cause_number_format: string;       // "CAUSE NO. {{cause_number}}"
    party_block: PartyBlockConfig;
    motion_title: {
      format: "centered_bold_caps";
      line_above: boolean;
      line_below: boolean;
      line_style?: "single" | "double";
    };
    salutation: {
      addressee: string;               // "TO THE HONORABLE JUDGE OF SAID COURT:"
      body_template: string;           // "NOW COMES {{filer_name}}, {{filer_role}}..."
    };
  };
  
  // Outline Schema (Section Hierarchy)
  outline_schema: OutlineSchema;
  
  // Signature Block (captured OOXML)
  signature_block: {
    ooxml: string;                     // Raw OOXML content
    variables: VariableMarker[];       // Positions of dynamic content
  };
  
  // Certificate of Service (optional)
  certificate_of_service?: {
    enabled: boolean;
    ooxml: string;
    variables: VariableMarker[];
  };
  
  // Footer Configuration
  footer: FooterConfig;
  
  // Typography
  typography: TypographyConfig;

  // User-defined variables
  variables: TemplateVariable[];
}

interface TemplateVariable {
  id: string;                          // UUID
  name: string;                        // Internal name: "response_deadline" (no spaces, lowercase)
  displayName: string;                 // UI label: "Response Deadline"
  type: 'date' | 'text' | 'number' | 'boolean';
  inputMode: 'manual' | 'today' | 'computed' | 'static';
  defaultValue?: string;               // For 'static' mode or initial value
  computation?: VariableComputation;   // For 'computed' mode
  required: boolean;
  helpText?: string;                   // Shown in UI to guide user
  placeholder?: string;                // Input placeholder text
}

interface VariableComputation {
  type: 'date_offset' | 'conditional' | 'format';

  // For date_offset: adds/subtracts days from another variable
  baseVariable?: string;               // Name of source variable
  offsetDays?: number;                 // Positive = add, negative = subtract

  // For conditional: if/then/else based on boolean variable
  conditionVariable?: string;          // Name of boolean variable
  trueValue?: string;
  falseValue?: string;

  // For format: format another variable
  sourceVariable?: string;
  formatString?: string;               // e.g., "MMMM d, yyyy" for dates
}

interface PartyBlockConfig {
  format: "section_symbol" | "simple";  // § column vs plain
  party_groups: PartyGroupConfig[];
}

interface PartyGroupConfig {
  id: string;
  plaintiff_label: string;              // "Plaintiff" | "Petitioner" | etc.
  defendant_label: string;              // "Defendant" | "Respondent" | etc.
  connector: string;                    // "v." | "vs." | "VS."
}

interface VariableMarker {
  name: string;                         // "service_date"
  placeholder: string;                  // "{{service_date}}"
  xpath_position: string;               // XPath to location in OOXML
  format?: "date" | "text" | "party_list";
}

interface OutlineSchema {
  name: string;
  sequential_paragraph_mode: boolean;   // If true, all paragraphs numbered 1,2,3...
  levels: OutlineLevel[];
}

interface OutlineLevel {
  level: number;                        // 1, 2, 3, 4...
  name: string;                         // "Section", "Subsection", "Point"
  format: "roman_upper" | "roman_lower" | "alpha_upper" | "alpha_lower" | "numeric" | "bullet" | "none";
  style: HeadingStyle;
  restart_on: number | null;            // Restart numbering when this level appears
  indent_inches: number;                // Left indent for this level
}

interface HeadingStyle {
  alignment: "left" | "center";
  bold: boolean;
  caps: boolean;
  underline: boolean;
}

interface FooterConfig {
  left: {
    content: "motion_title" | "case_style" | "custom" | "none";
    custom_text?: string;
    max_width_percent: number;          // Constrain to left portion (default: 33)
  };
  center: {
    content: "none" | "custom";
    custom_text?: string;
  };
  right: {
    content: "page_number" | "none";
    format: "number_only" | "page_x" | "page_x_of_y";
  };
}

interface TypographyConfig {
  body: {
    font_family: string;                // "Times New Roman"
    font_size_pt: number;               // 12
    line_spacing: "single" | "double" | number;
    paragraph_spacing_before_pt: number;
    paragraph_spacing_after_pt: number;
    first_line_indent_inches: number;   // 0.5 for Texas standard
  };
  blockquote: {
    font_size_pt: number;               // 11
    line_spacing: "single" | number;
    margin_left_inches: number;         // 1.0
    margin_right_inches: number;        // 1.0
  };
  footnote: {
    font_size_pt: number;               // 10
    line_spacing: "single";
  };
  page: {
    size: "letter" | "legal";
    margins: {
      top_inches: number;
      bottom_inches: number;
      left_inches: number;
      right_inches: number;
    };
  };
}
```

### 2.3 Case Schema

```typescript
interface Case {
  // Metadata
  id: string;                          // UUID
  name: string;                        // "Doe v. ACME Corp"
  template_id: string;                 // Reference to parent template
  created_at: string;
  modified_at: string;
  
  // Court Information
  court: {
    court_type: string;                // "DISTRICT"
    county: string;                    // "BEXAR"
    state: string;                     // "TEXAS"
    district_number?: string;          // "73RD"
    division?: string;
  };
  
  cause_number: string;                // "2022-CI-08479"
  
  // Parties
  party_groups: PartyGroup[];
  
  // Filer Information (who is filing motions in this case)
  filer: {
    name: string;                      // "Alex Cruz"
    role: string;                      // "Defendant"
    is_pro_se: boolean;
    attorney?: {
      name: string;
      bar_number: string;
      firm?: string;
      address: string;
      phone: string;
      email: string;
    };
  };
  
  // Signature Block Override (if different from template)
  signature_block_override?: {
    ooxml: string;
    variables: VariableMarker[];
  };
  
  // Certificate of Service Override
  certificate_of_service_override?: {
    ooxml: string;
    variables: VariableMarker[];
  };

  // Evidence Registry (exhibits, case law, statutes)
  evidence: Evidence[];
}

interface Evidence {
  id: string;                          // UUID
  type: 'exhibit' | 'caselaw' | 'statute';

  // Display information
  label: string;                       // "Signed Contract" | "Smith v. Jones" | "TEX. R. CIV. P. 196.1"
  shortLabel?: string;                 // "Contract" | "Smith" | "Rule 196.1" (for subsequent references)
  description?: string;                // Optional notes

  // The uploaded source document
  file: {
    name: string;                      // "smith_v_jones_opinion.pdf"
    type: string;                      // "application/pdf"
    size: number;                      // Bytes
    data: string;                      // Base64-encoded content
  };

  // Associated images (stored in IndexedDB - see Section 6.7)
  image_ids?: string[];                // Array of image IDs in IndexedDB
                                       // Multiple images allowed per exhibit

  uploaded_at: string;                 // ISO 8601

  // Marker computation:
  // - Exhibits: A, B, C computed by first occurrence in document
  // - Case law: Uses label as-is (user controls citation format)
  // - Statutes: Uses label as-is (user controls citation format)
}

interface PartyGroup {
  group_id: string;                    // Matches PartyGroupConfig.id from template
  plaintiffs: Party[];
  defendants: Party[];
}

interface Party {
  name: string;
  designation?: string;                // "Individually and as Representative"
}
```

**Image Storage:**

Images are stored in IndexedDB (Section 6.7), not inline with the Evidence object. The `image_ids` field contains UUIDs that reference records in the `images` object store.

**Why separate storage:**
- localStorage has 5-10MB total quota
- A single 5MB image would consume entire storage
- IndexedDB supports 50MB+ storage
- Binary blobs more efficient than base64 encoding

**Retrieving images:**
```typescript
const evidence = await getEvidence(evidence_id);
if (evidence.image_ids) {
  const images = await Promise.all(
    evidence.image_ids.map(id => getImage(id))
  );
  // Display images...
}
```

### 2.4 Draft Schema

```typescript
interface Draft {
  // Metadata
  id: string;                          // UUID
  case_id: string;                     // Reference to parent case
  created_at: string;
  modified_at: string;
  
  // Motion Information
  motion_title: string;                // "MOTION TO COMPEL DISCOVERY"

  // Variable values (overrides template defaults)
  variable_values: Record<string, string>;

  // Body Content (ProseMirror document structure)
  body: {
    // Storage format is ProseMirror JSON, not plain HTML
    // This preserves custom node attributes (citation targets, sentence IDs)
    format: "prosemirror";
    content: ProseMirrorDocument;

    // HTML can be derived from ProseMirror content for display/export
    // but is not the canonical storage format
  };

  // Citation index (computed, cached for performance)
  // Maps exhibit IDs to their markers based on first occurrence
  citation_index?: CitationIndex;

  // Section Structure (for hierarchy tracking)
  sections: SectionNode[];
  
  // Certificate of Service Variables (if applicable)
  certificate_variables?: {
    service_date: string;              // ISO date
    service_method: string;
    served_parties: string[];
  };
  
  // Export History
  exports: ExportRecord[];

  // Sentence Registry (computed on save)
  sentence_registry: SentenceRegistry;
}

interface SentenceRegistry {
  paragraphs: ParagraphSentences[];
  computed_at: string;                 // ISO 8601
  version: number;                     // Increments on recompute for cache invalidation
}

interface ParagraphSentences {
  paragraphId: string;                 // Matches ProseMirror paragraph node ID
  sentences: Sentence[];
}

interface Sentence {
  id: string;              // Format: "s-{paragraph_uuid}-{sentence_index}"
                          // Example: "s-a3f2b1c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c-001"
  paragraph_id: string;    // UUID of the paragraph this sentence belongs to
  text: string;
  startOffset: number;     // Character offset within the paragraph (not document)
  endOffset: number;       // Character offset within the paragraph (not document)
  confidence: number;      // 0.0–1.0 from NUPunkt
  metadata?: {
    mergeReason?: string;
    llmVerified?: boolean;
  };
}

interface SectionNode {
  id: string;                          // Stable ID: "sec-a1b2c3d4" (persists across renumbering)
  level: number;                       // 1 = Section, 2 = Subsection, etc.
  number: string;                      // "I", "A", "1" - computed from outline schema
  title: string;                       // "INTRODUCTION"
  children: SectionNode[];
}

// Note: Section IDs are stable UUIDs assigned at creation.
// Section numbers are computed based on position and outline schema.
// Cross-references link to IDs, not numbers, so they survive reordering.

interface ExportRecord {
  exported_at: string;
  filename: string;
  format: "docx" | "pdf";
}
```

### 2.5 Dual Storage Model (LegalDocument + Tiptap)

**CRITICAL ARCHITECTURE RULE:** FACTSWAY maintains TWO parallel representations of document content:

1. **LegalDocument schema** (Section 4) - Canonical storage, backend services
2. **Tiptap JSON** - UI-only representation for editor state

#### Why Dual Storage?

- **LegalDocument** provides stable, versioned structure for export and service communication
- **Tiptap JSON** enables rich editing (collaboration, undo/redo, custom nodes)
- Clear separation prevents UI concerns from polluting storage schema

#### Storage Boundary

```
┌──────────────────────────────────────────────────────────────────┐
│                         FRONTEND ONLY                            │
│                                                                  │
│  Tiptap JSON (ProseMirror document model):                      │
│  {                                                               │
│    type: "doc",                                                  │
│    content: [                                                    │
│      {                                                           │
│        type: "paragraph",                                        │
│        content: [                                                │
│          { type: "text", text: "See " },                         │
│          {                                                       │
│            type: "citation",  ← ONLY EXISTS IN FRONTEND          │
│            attrs: {                                              │
│              exhibitId: "ex_123",                                │
│              displayText: "Exhibit A"                            │
│            }                                                     │
│          },                                                      │
│          { type: "text", text: " attached." }                    │
│        ]                                                         │
│      }                                                           │
│    ]                                                             │
│  }                                                               │
│                                                                  │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         │ Transform on Save
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                    BACKEND (All Services)                        │
│                                                                  │
│  LegalDocument (Section 4):                                      │
│  {                                                               │
│    sentences: [                                                  │
│      {                                                           │
│        id: "s_001",                                              │
│        text: "See Exhibit A attached.",  ← Plain text only      │
│        evidence_links: ["ev_456"]                                │
│      }                                                           │
│    ],                                                            │
│    exhibits: [                                                   │
│      {                                                           │
│        id: "ex_123",                                             │
│        label: "A",                                               │
│        file_path: "/uploads/contract.pdf"                        │
│      }                                                           │
│    ]                                                             │
│  }                                                               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Transformation Rules

**Frontend → Backend (on save):**
1. Parse Tiptap JSON into plain text sentences
2. Call Facts Service (`POST /facts/parse`) to get sentence IDs
3. Extract exhibit references from CitationNodes
4. Build LegalDocument with sentences + exhibits arrays
5. POST to Records Service (`PUT /drafts/{id}`)

**Backend → Frontend (on load):**
1. GET from Records Service (`GET /drafts/{id}`)
2. Receive LegalDocument with sentences array
3. Reconstruct Tiptap JSON from plain text
4. Insert CitationNodes based on exhibit labels in text
5. Preserve sentence IDs in paragraph attributes (for evidence linking)

#### What Lives Where

| Feature | Tiptap (Frontend) | LegalDocument (Backend) |
|---------|-------------------|-------------------------|
| Plain text | ✓ | ✓ |
| Formatting (bold, italic) | ✓ | ✗ (stored as HTML in sentence.text) |
| CitationNode | ✓ | ✗ (plain text "Exhibit A") |
| VariableNode | ✓ | ✗ (resolved to text before save) |
| Sentence IDs | ✓ (paragraph attrs) | ✓ (sentences[].id) |
| Evidence links | ✗ | ✓ (sentences[].evidence_links) |
| Exhibit metadata | ✗ | ✓ (exhibits[] array) |

#### Tiptap Schema (Frontend Only)

```typescript
interface TiptapDocument {
  type: "doc";
  content: BlockNode[];
}

type BlockNode =
  | ParagraphNode
  | HeadingNode
  | BlockquoteNode
  | BulletListNode
  | OrderedListNode
  | TableNode;

interface ParagraphNode {
  type: "paragraph";
  attrs?: {
    sentenceId?: string;  // Preserved from LegalDocument for evidence linking
  };
  content?: InlineNode[];
}

interface HeadingNode {
  type: "heading";
  attrs: {
    level: 1 | 2 | 3 | 4 | 5 | 6;
  };
  content?: InlineNode[];
}

type InlineNode =
  | TextNode
  | CitationNode          // See Section 2.6 - FRONTEND ONLY
  | VariableNode          // See Section 2.11 - FRONTEND ONLY
  | CrossReferenceNode    // See Section 2.10
  | FootnoteRefNode
  | HardBreakNode;

interface TextNode {
  type: "text";
  text: string;
  marks?: Mark[];
}

interface Mark {
  type: "bold" | "italic" | "underline" | "link";
  attrs?: {
    href?: string;
    title?: string;
  };
}
```

**IMPORTANT:** CitationNode and VariableNode are Tiptap-only constructs. Backend services never parse or process these node types.

### 2.6 Citation Node Model (FRONTEND ONLY)

**CRITICAL:** CitationNode is a Tiptap custom node that exists ONLY in the editor. Backend services never see or process CitationNode. See Section 2.5 for the dual storage architecture.

#### Storage Separation

```
Frontend (Tiptap):                Backend (LegalDocument):
CitationNode                      Plain text + exhibits array
  ├─ type: "citation"              ↓
  ├─ exhibitId: "ex_123"          sentences: [
  └─ displayText: "A"               { text: "See Exhibit A.", id: "s_001" }
                                   ]
                                   exhibits: [
                                     { id: "ex_123", label: "A", ... }
                                   ]
```

**When user saves:** CitationNodes are converted to plain text ("Exhibit A") in LegalDocument.sentences[].text

**When user loads:** Plain text is analyzed, CitationNodes are re-inserted based on LegalDocument.exhibits[] array

#### CitationNode Schema (Tiptap Only)

```typescript
interface CitationNode {
  type: 'citation';
  attrs: {
    id: string;                        // Unique ID for this citation instance
    evidenceType: 'exhibit' | 'caselaw' | 'statute';
    evidenceId: string | null;         // Links to Evidence registry, null if unlinked

    // Sentence support (which claims does this evidence support?)
    supportsSentenceIds: string[];     // Array of Sentence IDs from SentenceRegistry

    // Display mode (affects rendering for exhibits only)
    displayMode: 'inline' | 'parenthetical' | 'textual';
  };
}
```

#### Key Behaviors

| Evidence Type | Marker Display | User Controls |
|---------------|----------------|---------------|
| Exhibit | Computed: A, B, C based on first occurrence | Display mode |
| Case Law | User-typed citation text preserved | Linking only |
| Statute | User-typed citation text preserved | Linking only |

#### Citation Rendering (Frontend Only)

For **exhibits**, the system generates display text:
- `inline`: "(Exhibit A)"
- `parenthetical`: "See Exhibit A"
- `textual`: "Exhibit A"

For **case law and statutes**, the citation node wraps the user's existing text without modifying it. The node provides:
- Linking to the uploaded source document
- Sentence support tracking
- Visual indication of linked/unlinked state

#### Example: Exhibit Citation
```typescript
// In Tiptap document (FRONTEND ONLY)
{
  type: 'citation',
  attrs: {
    id: 'cit-001',
    evidenceType: 'exhibit',
    evidenceId: 'ev-001',
    supportsSentenceIds: ['s-p003-002'],
    displayMode: 'inline'
  }
}
// Renders as: "(Exhibit A)"

// On save, transforms to LegalDocument:
{
  sentences: [
    { id: 's-p003-002', text: "(Exhibit A)", evidence_links: ['ev-001'] }
  ],
  exhibits: [
    { id: 'ev-001', label: 'A', file_path: '/uploads/contract.pdf' }
  ]
}
```

#### Example: Case Law Citation
```typescript
// User types: "See Smith v. Jones, 123 S.W.3d 456, 460 (Tex. App. 2024)."
// System detects pattern, user confirms linking
// Result: Text preserved, wrapped in citation node (FRONTEND ONLY)

{
  type: 'citation',
  attrs: {
    id: 'cit-002',
    evidenceType: 'caselaw',
    evidenceId: 'ev-005',              // Links to uploaded opinion
    supportsSentenceIds: ['s-p003-002', 's-p003-003'],
    displayMode: 'inline'              // Not used for case law
  },
  content: [
    {
      type: 'text',
      text: 'Smith v. Jones, 123 S.W.3d 456, 460 (Tex. App. 2024)',
      marks: [{ type: 'italic' }]      // Case names italicized
    }
  ]
}
// Renders as: User's original text, with link indicator

// On save, transforms to LegalDocument (plain text only):
{
  sentences: [
    {
      id: 's-p003-002',
      text: "See Smith v. Jones, 123 S.W.3d 456, 460 (Tex. App. 2024).",
      evidence_links: ['ev-005']
    }
  ]
}
```

#### Linked vs. Unlinked States

| State | Visual | Meaning |
|-------|--------|---------|
| Linked (has evidenceId) | Blue background | Evidence source uploaded and connected |
| Unlinked (evidenceId is null) | Yellow background + ⚠️ | Citation detected but no source uploaded |
| Unsupported (empty supportsSentenceIds) | No indicator | Evidence not tied to specific claims (acceptable) |

#### Backend Contract

**IMPORTANT:** Backend services (Export, Facts, Exhibits, Caselaw) do NOT parse CitationNode. They work exclusively with:
- `LegalDocument.sentences[]` - Plain text with sentence IDs
- `LegalDocument.exhibits[]` - Exhibit metadata
- `LegalDocument.sentences[].evidence_links[]` - Sentence-to-evidence mappings

Citation detection, resolution, and rendering are frontend responsibilities.

### 2.7 Citation Index (Computed)

The citation index maps targets to their display markers. It's computed by walking the document in order.

```typescript
interface CitationIndex {
  // Maps exhibit ID to marker: { "ex-001": "A", "ex-002": "B" }
  exhibitMarkers: Map<string, string>;

  // Future expansion
  caselawMarkers?: Map<string, number>;    // Footnote-style numbering
  statuteMarkers?: Map<string, string>;

  // Computed timestamp for cache invalidation
  computed_at: string;
}

// Marker computation function
function computeCitationIndex(
  document: ProseMirrorDocument,
  evidence: Evidence[]  // See Section 2.3 for Evidence interface
): CitationIndex {
  // Note: "Exhibit" and "Evidence" refer to the same type.
  // Evidence is the canonical interface (Section 2.3).
  // "Exhibit" is colloquial shorthand for evidence items of type='exhibit'.
  const exhibitMarkers = new Map<string, string>();
  let exhibitCounter = 0;

  // Walk document in order (depth-first)
  function walk(node: any) {
    if (node.type === 'citation' && node.attrs.evidenceType === 'exhibit') {
      const evidenceId = node.attrs.evidenceId;

      if (evidenceId && !exhibitMarkers.has(evidenceId)) {
        // First occurrence of this exhibit
        exhibitMarkers.set(evidenceId, numberToAlpha(exhibitCounter));
        exhibitCounter++;
      }
    }

    // Recurse into children
    if (node.content) {
      for (const child of node.content) {
        walk(child);
      }
    }
  }

  walk(document);

  return {
    exhibitMarkers,
    computed_at: new Date().toISOString()
  };
}

function numberToAlpha(n: number): string {
  // 0 → A, 1 → B, ..., 25 → Z, 26 → AA, 27 → AB, ...
  let result = '';
  let num = n;

  do {
    result = String.fromCharCode(65 + (num % 26)) + result;
    num = Math.floor(num / 26) - 1;
  } while (num >= 0);

  return result;
}
```

### 2.8 Unlinked Citation Tracking

Citations without targets need special handling in the UI.

```typescript
// Evidence types for citations
type EvidenceType = 'exhibit' | 'caselaw' | 'statute';

// Note: This is the same as Evidence.type from Section 2.3
// Defined here for convenience in citation-related interfaces

interface UnlinkedCitation {
  citationId: string;                  // The citation node's ID
  evidenceType: 'exhibit' | 'caselaw' | 'statute';
  detectedText: string;                // The citation text as it appears in document
  location: {
    paragraph: number;                 // 0-indexed paragraph position
    offset: number;                    // Character offset within paragraph
  };
}

function findUnlinkedCitations(document: ProseMirrorDocument): UnlinkedCitation[] {
  const unlinked: UnlinkedCitation[] = [];
  let paragraphIndex = 0;

  function walk(node: any, offset: number = 0) {
    if (node.type === 'paragraph') {
      let charOffset = 0;

      for (const child of (node.content || [])) {
        if (child.type === 'citation' && !child.attrs.evidenceId) {
          unlinked.push({
            citationId: child.attrs.id,
            evidenceType: child.attrs.evidenceType,
            location: { paragraph: paragraphIndex, offset: charOffset }
          });
        }

        if (child.type === 'text') {
          charOffset += child.text.length;
        } else {
          charOffset += 1; // Non-text nodes count as 1 character
        }
      }

      paragraphIndex++;
    }

    if (node.content) {
      for (const child of node.content) {
        walk(child);
      }
    }
  }

  walk(document);
  return unlinked;
}
```

### 2.9 Sentence Registry Computation

Sentences are parsed and assigned stable IDs on document save. This enables citations to link to specific claims.

**Parser Selection:**

NUPunkt is the primary sentence boundary detector, chosen for its superior accuracy on legal text:

| Tool | Precision on Legal Text | Speed |
|------|------------------------|-------|
| spaCy en_core_web_lg | 64.7% | Fast |
| pySBD | 59.3% | Fast |
| **NUPunkt** | **91.1%** | 10M chars/sec |

NUPunkt handles 4,000+ legal abbreviations natively, including case citations (123 S.W.3d 456), rule references (TEX. R. CIV. P. 196.1), and standard abbreviations (v., Inc., Corp.).

**Conservative Splitting Principle:**

When confidence is below threshold, **default to NO SPLIT**.

Rationale: A merged sentence (two sentences treated as one) can still link to evidence correctly. A broken sentence (one sentence incorrectly split into fragments) creates nonsensical text that cannot properly support a claim.

**When to Compute:**
- On explicit save
- Before export
- When user requests evidence linking

**ID Format:**

Sentence IDs follow the pattern `s-{paragraph_uuid}-{sentence_index}`:
- `s-a3f2b1c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c-001` = First sentence in paragraph with UUID a3f2b1c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c
- `s-a3f2b1c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c-002` = Second sentence in same paragraph

**ID Stability Rules:**

IDs are stable across re-parses. When a paragraph is re-parsed:
- Existing sentence IDs are preserved by matching text similarity
- New sentences get new UUIDs
- Modified sentences keep their ID if >80% text overlap
- Deleted sentences are removed from registry
- This ensures citation references remain valid after edits

**Python Implementation:**
```python
# pip install nupunkt
from nupunkt import sent_tokenize
from openai import OpenAI
from datetime import datetime
import json
import re
from typing import Optional

client = OpenAI()

# Confidence threshold - below this, we DON'T split
CONFIDENCE_THRESHOLD = 0.8


def compute_sentence_registry(document: dict) -> dict:
    """
    Parse all paragraphs in document and compute sentence registry.

    Args:
        document: ProseMirror document structure

    Returns:
        SentenceRegistry dict
    """
    paragraphs = []
    paragraph_index = [0]  # Mutable counter for closure

    def walk(node: dict) -> None:
        if node.get('type') == 'paragraph':
            text = extract_paragraph_text(node)
            if text.strip():
                # Extract paragraph UUID from node attributes (see Section 6.8 - Paragraph Extension)
                para_id = node.get('attrs', {}).get('paragraph_id')
                if not para_id:
                    # Generate UUID for paragraphs without one (migration case)
                    from uuid import uuid4
                    para_id = str(uuid4())

                sentences = parse_sentences(text, para_id)
                paragraphs.append({
                    'paragraphId': para_id,
                    'sentences': sentences
                })
            paragraph_index[0] += 1

        for child in node.get('content', []):
            walk(child)

    walk(document)

    return {
        'paragraphs': paragraphs,
        'computed_at': datetime.now().isoformat(),
        'version': 1
    }


def extract_paragraph_text(paragraph_node: dict) -> str:
    """Extract plain text from a ProseMirror paragraph node."""
    text_parts = []

    for child in paragraph_node.get('content', []):
        if child.get('type') == 'text':
            text_parts.append(child.get('text', ''))
        elif child.get('type') == 'citation':
            # Include citation text for sentence parsing
            citation_text = extract_citation_text(child)
            text_parts.append(citation_text)
        elif child.get('type') == 'variable':
            # Include variable label as placeholder
            label = child.get('attrs', {}).get('label', '')
            text_parts.append(f'[{label}]')

    return ''.join(text_parts)


def extract_citation_text(citation_node: dict) -> str:
    """Extract display text from a citation node."""
    content = citation_node.get('content', [])
    if content:
        return ''.join(c.get('text', '') for c in content if c.get('type') == 'text')

    # For exhibit citations without content, generate placeholder
    attrs = citation_node.get('attrs', {})
    if attrs.get('evidenceType') == 'exhibit':
        return '(Exhibit X)'
    return '[Citation]'


def parse_sentences(
    paragraph_text: str,
    paragraph_id: str,
    full_document_text: str,
    citation_spans: List[CitationSpan],
    existing_sentence_registry: Optional[Dict[str, Any]] = None
) -> List[Dict]:
    """
    Parse paragraph into sentences using NUPunkt with LLM verification.

    Uses conservative splitting: when uncertain, DON'T split.
    """
    # Step 1: NUPunkt primary parsing
    try:
        nupunkt_sentences = sent_tokenize(paragraph_text)
    except Exception as e:
        # Fallback: treat entire paragraph as one sentence
        print(f"NUPunkt error: {e}, treating paragraph as single sentence")
        return [{
            'id': f"s-{paragraph_id}-000",
            'text': paragraph_text.strip(),
            'startOffset': 0,
            'endOffset': len(paragraph_text),
            'confidence': 0.5,
            'llmVerified': False
        }]

    # Step 2: Build sentence objects with confidence scores
    sentences = []
    current_offset = 0

    for i, sent_text in enumerate(nupunkt_sentences):
        sent_text = sent_text.strip()
        if not sent_text:
            continue

        # Find position in original text
        start_offset = paragraph_text.find(sent_text, current_offset)
        if start_offset == -1:
            start_offset = current_offset
        end_offset = start_offset + len(sent_text)
        current_offset = end_offset

        # Compute confidence based on boundary characteristics
        confidence = compute_boundary_confidence(
            sent_text,
            paragraph_text,
            start_offset,
            end_offset,
            i == len(nupunkt_sentences) - 1  # is_last
        )

        sentences.append({
            'id': f"s-{paragraph_id}-{i:03d}",
            'text': sent_text,
            'startOffset': start_offset,
            'endOffset': end_offset,
            'confidence': confidence,
            'llmVerified': False
        })

    # Step 3: Surgical LLM verification for each low-confidence boundary
    sentences = verify_low_confidence_boundaries(sentences, paragraph_id)

    return sentences


def compute_boundary_confidence(
    sent_text: str,
    full_text: str,
    start: int,
    end: int,
    is_last: bool
) -> float:
    """
    Estimate confidence in sentence boundary.
    Returns lower confidence for potentially incorrect splits.
    """
    # Last sentence in paragraph is always high confidence (paragraph end = sentence end)
    if is_last:
        return 0.95

    # Check what comes after this sentence
    after_text = full_text[end:end+20] if end < len(full_text) else ""

    # High confidence indicators (clear sentence boundaries)
    high_confidence_patterns = [
        r'^\s+[A-Z]',           # Space followed by capital letter
        r'^\s+\d+\.',           # Space followed by numbered list
        r'^\s+[•\-]',           # Space followed by bullet
    ]

    for pattern in high_confidence_patterns:
        if re.match(pattern, after_text):
            return 0.95

    # Low confidence patterns (potential false splits)
    # These patterns at the END of sent_text suggest we may have split incorrectly
    low_confidence_endings = [
        r'\b(Dr|Mr|Mrs|Ms|Jr|Sr|Inc|Corp|Ltd|Co|No|Nos|v|vs)\.$',
        r'\b(Id|id|Cf|cf|E\.g|e\.g|I\.e|i\.e|et|al)\.$',
        r'\d+\s+(S\.W\.|F\.|U\.S\.|Tex\.|S\.\s*Ct\.)\s*$',
        r'TEX\.\s*R\.\s*(CIV|APP|EVID)\.\s*P\.\s*$',
        r'FED\.\s*R\.\s*(CIV|CRIM|APP|EVID)\.\s*P\.\s*$',
        r'§\s*$',
        r'\d+\s*$',  # Ends with just a number (likely mid-citation)
    ]

    for pattern in low_confidence_endings:
        if re.search(pattern, sent_text, re.IGNORECASE):
            return 0.4  # Low confidence - likely a false split

    # Medium confidence - no strong indicators either way
    return 0.75


def verify_boundary_with_llm(text_before: str, text_after: str) -> bool:
    """
    Ask LLM to verify a single sentence boundary.

    This is a surgical verification: one boundary, one question, one answer.

    Args:
        text_before: Text ending at the potential boundary
        text_after: Text starting after the potential boundary

    Returns:
        True if this IS a valid sentence boundary (keep split)
        False if this is NOT a boundary (merge the texts)
    """
    # Truncate for efficiency (last 150 chars before, first 150 after)
    context_before = text_before[-150:] if len(text_before) > 150 else text_before
    context_after = text_after[:150] if len(text_after) > 150 else text_after

    try:
        response = client.chat.completions.create(
            model="gpt-4o",  # Or claude-sonnet-4-20250514 - either works for this simple task
            messages=[
                {
                    "role": "system",
                    "content": """You determine if a sentence boundary is correct in legal text.

Legal text contains tricky cases where periods do NOT end sentences:
- "v." in case names (Smith v. Jones)
- Citations: "123 S.W.3d 456" or "42 U.S.C. § 1983"
- Rules: "TEX. R. CIV. P. 196.1" or "FED. R. EVID. 702"
- Abbreviations: "Inc.", "Corp.", "Dr.", "Mr.", "No.", "Id."

You will see text ending at a potential boundary and text starting after it.

Respond with ONLY one word:
- TWO if these are two separate sentences (valid boundary)
- ONE if these should be one sentence (invalid boundary, merge them)"""
                },
                {
                    "role": "user",
                    "content": f"""Text before boundary:
"{context_before}"

Text after boundary:
"{context_after}"

ONE sentence or TWO sentences?"""
                }
            ],
            temperature=0,
            max_tokens=5
        )

        result = response.choices[0].message.content.strip().upper()

        # TWO = valid boundary (keep split), ONE = invalid (merge)
        # Default to keeping split if unclear (NUPunkt is 91% accurate)
        return 'TWO' in result

    except Exception as e:
        print(f"LLM boundary check failed: {e}, keeping NUPunkt decision")
        return True  # Trust NUPunkt if LLM fails


def verify_low_confidence_boundaries(sentences: list, paragraph_id: str) -> list:
    """
    Verify each low-confidence boundary with a surgical LLM call.

    For each boundary where confidence < threshold:
    1. Ask LLM: "Is this ONE sentence or TWO?"
    2. ONE → merge the sentences
    3. TWO → keep the split, boost confidence

    This achieves ~100% accuracy through targeted verification.
    Each LLM call uses ~150 input tokens and 1 output token.
    """
    if len(sentences) <= 1:
        return sentences

    result = []
    i = 0

    while i < len(sentences):
        current = sentences[i]

        # Check if boundary after this sentence has low confidence
        if current['confidence'] < CONFIDENCE_THRESHOLD and i + 1 < len(sentences):
            next_sent = sentences[i + 1]

            # Surgical verification: is this boundary valid?
            is_valid_boundary = verify_boundary_with_llm(
                current['text'],
                next_sent['text']
            )

            if is_valid_boundary:
                # Valid boundary - keep as separate sentences
                current['confidence'] = 1.0
                current['llmVerified'] = True
                result.append(current)
                i += 1
            else:
                # Invalid boundary - merge into one sentence
                merged = {
                    'id': current['id'],
                    'text': current['text'] + ' ' + next_sent['text'],
                    'startOffset': current['startOffset'],
                    'endOffset': next_sent['endOffset'],
                    'confidence': 1.0,
                    'llmVerified': True
                }
                result.append(merged)
                i += 2  # Skip both original sentences
        else:
            result.append(current)
            i += 1

    # Preserve existing IDs using comprehensive matching algorithm (see Section 2.9.3)
    result = preserve_sentence_ids(
        result,
        paragraph_id,
        existing_sentence_registry
    )

    return result


def compute_text_similarity(text1: str, text2: str) -> float:
    """
    Compute normalized Levenshtein similarity between two texts.

    Returns value between 0.0 (completely different) and 1.0 (identical).
    Uses difflib.SequenceMatcher for efficiency.
    """
    from difflib import SequenceMatcher

    # Normalize whitespace
    text1 = ' '.join(text1.split())
    text2 = ' '.join(text2.split())

    matcher = SequenceMatcher(None, text1, text2)
    return matcher.ratio()
```

**Surgical LLM Boundary Verification:**

For each boundary where NUPunkt's confidence is below threshold, a targeted LLM call verifies the split:

1. Extract text before and after the potential boundary (~150 chars each)
2. Ask: "Is this ONE sentence or TWO sentences?"
3. LLM responds with single word: `ONE` or `TWO`
4. `TWO` → Keep the split (valid boundary), confidence = 1.0
5. `ONE` → Merge the texts (invalid split), confidence = 1.0

This surgical approach achieves ~100% accuracy because:
- Each decision is binary and atomic (no complex parsing)
- LLM sees only the relevant context (~300 tokens)
- Deterministic outcome from simple yes/no
- Cost: ~$0.0004 per boundary (~$0.004 per document worst case)

Combined with the conservative splitting principle (when uncertain, don't split), this ensures sentence boundaries are reliable for evidence linking.

---

#### 2.9.2 Citation-Aware Splitting

Legal citations must remain intact for evidence linking to work correctly. The sentence parser uses citation-aware splitting as a post-processing layer that operates after NUPunkt's initial boundary detection.

**Architecture:**
NUPunkt generates boundaries
↓
Citation Detector identifies protected regions
↓
Protected Boundary Validator (merges splits inside citations)
↓
Citation-Only Sentence Merger (merges standalone citations)
↓
Surgical LLM Verification (for remaining uncertain boundaries)

**Citation Detection:**

The system detects four types of legal citations that create protected regions:

1. **Case Law Citations**
   - Reporter format: `[Number] [Reporter] [Number]`
   - Examples: "123 F.3d 456", "789 S.W.2d 123", "456 U.S. 789"
   - Reporters recognized: F., F.2d, F.3d, F.4th, S.Ct., U.S., S.W., S.W.2d, S.W.3d, Tex., and others
   - Includes pinpoint citations: "at 789", "at 789-90"
   - Includes case names: "Smith v. Jones", "In re Estate of Doe"

2. **Statute Citations**
   - Section symbol format: `[Code] § [Number]`
   - Examples: "42 U.S.C. § 1983", "Tex. Civ. Prac. & Rem. Code § 41.001"
   - Includes subsections: "§ 123.456(a)(1)(A)"
   - Includes rule citations: "TEX. R. CIV. P. 196.1", "FED. R. EVID. 702"

3. **Exhibit Citations**
   - Pattern: "Exhibit" + marker
   - Examples: "Exhibit A", "Exhibit 12", "Ex. B-3"
   - Includes Bates numbers: "Exhibit B at CRUZ000123"
   - Includes page/line citations: "Exhibit C at 45:12-46:3"
   - Alternate forms: "Appendix A", "Attachment 1"

4. **Legal Abbreviations**
   - Common abbreviations that contain periods but are not sentence boundaries
   - Examples: "i.e.", "e.g.", "et al.", "Inc.", "Corp.", "Ltd.", "Ph.D.", "Esq.", "v.", "vs."
   - Latin terms: "Id.", "Ibid.", "Cf.", "Op. cit."

**Protected Region Rules:**

After NUPunkt identifies potential sentence boundaries, each boundary is validated against citation spans:

**Rule 1: Never split inside a citation**
- If boundary falls between start and end of any citation span → Merge with next sentence
- Example: "See 123 F.3d 456. This case held..."
  - Period after "456" is VALID (outside citation)
  - Split is allowed

**Rule 2: Never split on abbreviation periods**
- If boundary is a period that's part of a legal abbreviation → Merge with next sentence
- Example: "The defendant, Inc., filed a motion."
  - Period after "Inc" is NOT a boundary
  - Sentence continues

**Rule 3: Never split case names**
- If boundary falls inside "v." or "vs." → Merge with next sentence
- Example: "Smith v. Jones held that..."
  - Period after "v" is NOT a boundary
  - Case name stays intact

**Citation-Only Sentence Merging:**

Standalone citation sentences (those containing only citations with no substantive prose) are merged into the previous sentence to preserve context.

**Merge Criteria:**

A sentence is "citation-only" if:
1. Begins with a citation signal: "See", "See also", "See, e.g.,", "Compare", "Cf.", "But see", "E.g.,", "Accord", "Contra"
2. Contains only citation(s) and punctuation (no substantive prose beyond the signal)
3. Has fewer than 15 characters of non-citation text (after removing signals)

**Merge Behavior:**

- Join with previous sentence using space separator: `previous_text + " " + citation_text`
- Preserve sentence ID from the merged sentence (the longer one)
- Mark with confidence=MEDIUM and reason_code=CITATION_ONLY
- Update offsets to reflect merged span

**Examples:**

| Before Merging | After Merging |
|----------------|---------------|
| "The court held liability is clear." + "See Smith v. Jones, 123 F.3d 456." | "The court held liability is clear. See Smith v. Jones, 123 F.3d 456." |
| "Defendant violated the statute." + "See Tex. Civ. Prac. & Rem. Code § 41.001." | "Defendant violated the statute. See Tex. Civ. Prac. & Rem. Code § 41.001." |
| "Plaintiff submitted evidence." + "See Exhibit A." | "Plaintiff submitted evidence. See Exhibit A." |

**Do NOT merge if:**
- Citation appears mid-sentence: "Smith v. Jones supports this conclusion."
- Multiple citation-only sentences in sequence (each stays separate)
- Citation introduces a new argument or topic
- First sentence in paragraph (no previous sentence to merge with)

**Integration with parse_sentences():**

Update the `parse_sentences()` function to include citation-aware steps:
```python
def detect_citations(text: str) -> List[CitationSpan]:
    """
    Detect all citation spans in text using eyecite + pattern matching.

    Args:
        text: Paragraph text to scan

    Returns:
        List of citation spans with start/end offsets
    """
    import eyecite
    import re

    spans = []

    # Step 1: Detect case law citations with eyecite
    citations = eyecite.get_citations(text)
    for cite in citations:
        if cite.span():
            spans.append(CitationSpan(
                start=cite.span()[0],
                end=cite.span()[1],
                text=text[cite.span()[0]:cite.span()[1]],
                type='caselaw'
            ))

    # Step 2: Detect statute citations (pattern matching)
    statute_pattern = r'(?:\d+\s+)?[A-Z][a-z]+\.?\s+.*?\s*§+\s*[\d.]+(?:\([a-z]\)(?:\(\d+\))?)?'
    for match in re.finditer(statute_pattern, text, re.IGNORECASE):
        spans.append(CitationSpan(
            start=match.start(),
            end=match.end(),
            text=match.group(),
            type='statute'
        ))

    # Step 3: Detect exhibit citations (pattern matching)
    exhibit_pattern = r'(?:Exhibit|Ex\.|Appendix|Attachment)\s+[A-Z0-9-]+(?:\s+at\s+[A-Z0-9:,-]+)?'
    for match in re.finditer(exhibit_pattern, text, re.IGNORECASE):
        spans.append(CitationSpan(
            start=match.start(),
            end=match.end(),
            text=match.group(),
            type='exhibit'
        ))

    # Step 4: Sort by start position and merge overlaps
    spans.sort(key=lambda s: s.start)
    merged = []

    for span in spans:
        if merged and span.start < merged[-1].end:
            # Overlapping - extend previous span
            merged[-1].end = max(merged[-1].end, span.end)
            merged[-1].text = text[merged[-1].start:merged[-1].end]
        else:
            merged.append(span)

    return merged


class CitationSpan:
    """Represents a detected citation in text."""
    def __init__(self, start: int, end: int, text: str, type: str):
        self.start = start
        self.end = end
        self.text = text
        self.type = type  # 'caselaw', 'statute', 'exhibit'


def validate_citation_boundaries(
    sentences: List[Dict],
    citation_spans: List[CitationSpan],
    full_text: str
) -> List[Dict]:
    """
    Merge sentences if NUPunkt boundary falls inside a citation span.

    Args:
        sentences: Initial sentence candidates from NUPunkt
        citation_spans: Detected citation regions
        full_text: Original paragraph text

    Returns:
        Validated sentences with citation boundaries protected
    """
    if not citation_spans:
        return sentences

    validated = []
    i = 0

    while i < len(sentences):
        current = sentences[i]
        merged = False

        # Check if sentence boundary falls inside any citation
        for citation in citation_spans:
            # Boundary is at current['endOffset']
            if citation.start < current['endOffset'] < citation.end:
                # Boundary is INSIDE a citation - must merge with next
                if i + 1 < len(sentences):
                    next_sent = sentences[i + 1]

                    merged_sentence = {
                        'id': current['id'],
                        'text': full_text[current['startOffset']:next_sent['endOffset']].strip(),
                        'startOffset': current['startOffset'],
                        'endOffset': next_sent['endOffset'],
                        'confidence': 0.6,  # Medium confidence after merge
                        'llmVerified': False,
                        'mergeReason': 'citation_boundary'
                    }

                    validated.append(merged_sentence)
                    i += 2  # Skip both sentences
                    merged = True
                    break

        if not merged:
            validated.append(current)
            i += 1

    return validated


def merge_citation_only_sentences(
    sentences: List[Dict],
    citation_spans: List[CitationSpan]
) -> List[Dict]:
    """
    Merge standalone citation sentences into previous sentence.

    Args:
        sentences: Validated sentences
        citation_spans: Detected citations

    Returns:
        Sentences with citation-only merging applied
    """
    if not sentences:
        return sentences

    # Citation signal patterns
    signals = [
        'See', 'See also', 'See, e.g.,', 'See e.g.',
        'Compare', 'Cf.', 'But see', 'E.g.', 'Accord', 'Contra'
    ]

    merged = []
    i = 0

    while i < len(sentences):
        current = sentences[i]

        # Check if this is a citation-only sentence
        is_citation_only = False
        text_stripped = current['text'].strip()

        # Remove signal if present
        text_after_signal = text_stripped
        for signal in signals:
            if text_stripped.startswith(signal):
                text_after_signal = text_stripped[len(signal):].strip()
                break

        # Check if remaining text is mostly citation
        # (covered by citation spans with minimal non-citation text)
        citation_coverage = 0
        for citation in citation_spans:
            # Check if citation overlaps with this sentence
            overlap_start = max(citation.start, current['startOffset'])
            overlap_end = min(citation.end, current['endOffset'])

            if overlap_start < overlap_end:
                citation_coverage += (overlap_end - overlap_start)

        sentence_length = len(current['text'])
        if sentence_length > 0:
            coverage_ratio = citation_coverage / sentence_length

            # If >70% of sentence is citations, it's citation-only
            if coverage_ratio > 0.7 and len(text_after_signal) < 30:
                is_citation_only = True

        if is_citation_only and merged:
            # Merge into previous sentence
            prev = merged[-1]
            merged[-1] = {
                'id': prev['id'],
                'text': prev['text'] + ' ' + current['text'],
                'startOffset': prev['startOffset'],
                'endOffset': current['endOffset'],
                'confidence': 0.8,
                'llmVerified': False,
                'mergeReason': 'citation_only'
            }
        else:
            merged.append(current)

        i += 1

    return merged


def parse_sentences(paragraph_text: str, paragraph_id: str) -> list:
    """
    Parse paragraph into sentences with citation-awareness.

    Process:
    1. NUPunkt generates initial boundaries
    2. Detect all citation spans in paragraph
    3. Validate boundaries against citations (merge if inside)
    4. Merge citation-only sentences with previous
    5. Apply surgical LLM verification to remaining uncertain boundaries
    """
    # Step 1: NUPunkt primary parsing
    nupunkt_sentences = sent_tokenize(paragraph_text)

    # Step 2: Detect citation spans
    citation_spans = detect_citations(paragraph_text)

    # Step 3: Validate against protected regions
    sentences = validate_citation_boundaries(
        nupunkt_sentences,
        citation_spans,
        paragraph_text
    )

    # Step 4: Merge citation-only sentences
    sentences = merge_citation_only_sentences(
        sentences,
        citation_spans
    )

    # Step 5: LLM verification for low-confidence boundaries
    sentences = verify_low_confidence_boundaries(
        sentences,
        paragraph_id
    )

    return sentences
```

**Citation Detection Library:**

Use the `eyecite` library for case law citation detection:
- Detects federal and state reporters automatically
- Handles parallel citations
- Extracts pinpoint pages
- Open source, actively maintained, legal-specific

For statutes and exhibits, use pattern matching:
- Statute: `r'(?:\d+\s+)?[A-Z][a-z]+\.?\s+.*?\s*§+\s*[\d.]+'`
- Exhibit: `r'(?:Exhibit|Ex\.|Appendix|Attachment)\s+[A-Z0-9-]+'`

**Performance Characteristics:**

- Citation detection: ~50-100ms per paragraph (pattern matching + eyecite)
- Boundary validation: O(n×m) where n=sentences, m=citations (typically <10ms)
- Merging: O(n) single pass (typically <5ms)
- Total overhead: ~100-150ms per document

**Validation:**

Citation-aware splitting correctness is verified by:

1. **Protected Region Tests**: Known citations should never be split
   - Input: "See 123 F.3d 456." → Output: 1 sentence (not split at "F." or "3d")
   - Input: "Smith v. Jones held..." → Output: Case name intact

2. **Merge Tests**: Citation-only sentences should merge with previous
   - Input: "Claim." + "See Exhibit A." → Output: 1 merged sentence
   - Input: "Claim." + "Smith v. Jones supports..." → Output: 2 separate sentences (not citation-only)

3. **Round-Trip Tests**: Parse → Link citation → Export should preserve citation integrity
   - Citations remain linkable after sentence parsing
   - Export includes complete citation text

---

#### 2.9.3 Re-Parsing and ID Preservation

When a paragraph is edited and re-parsed, sentence IDs must be preserved to prevent breaking citation links.

**Re-Parse Trigger:**

A paragraph is re-parsed when:
1. User types and pauses for 2 seconds (debounced)
2. User explicitly clicks "Re-parse sentences" button
3. Document is imported and existing sentence registry exists

**ID Preservation Algorithm:**

```python
def preserve_sentence_ids(
    new_sentences: List[Dict],
    paragraph_id: str,
    existing_registry: Dict[str, Any]
) -> List[Dict]:
    """
    Match new sentences to existing sentences and preserve IDs when possible.

    Matching criteria (in order of precedence):
    1. Exact text match -> preserve ID
    2. High similarity (>80%) -> preserve ID
    3. No match -> generate new UUID

    Returns new sentences with preserved or new IDs.
    """
    if not existing_registry or 'sentences' not in existing_registry:
        # First parse - all new IDs
        for idx, sentence in enumerate(new_sentences, start=1):
            sentence['id'] = f"s-{paragraph_id}-{idx:03d}"
        return new_sentences

    # Get existing sentences from this paragraph
    existing_sentences = [
        s for s in existing_registry['sentences'].values()
        if s.get('paragraph_id') == paragraph_id
    ]

    # Build used IDs set
    used_ids = set()

    # First pass: exact matches
    for new_sentence in new_sentences:
        for existing_sentence in existing_sentences:
            if new_sentence['text'].strip() == existing_sentence['text'].strip():
                new_sentence['id'] = existing_sentence['id']
                new_sentence['paragraph_id'] = paragraph_id
                used_ids.add(existing_sentence['id'])
                break

    # Second pass: similarity matches for unmatched sentences
    for new_sentence in new_sentences:
        if 'id' in new_sentence:
            continue  # Already matched

        best_match = None
        best_similarity = 0.0

        for existing_sentence in existing_sentences:
            if existing_sentence['id'] in used_ids:
                continue  # Already matched

            similarity = compute_text_similarity(
                new_sentence['text'],
                existing_sentence['text']
            )

            if similarity > best_similarity:
                best_similarity = similarity
                best_match = existing_sentence

        if best_similarity > 0.80 and best_match:
            new_sentence['id'] = best_match['id']
            new_sentence['paragraph_id'] = paragraph_id
            used_ids.add(best_match['id'])

    # Third pass: generate new IDs for remaining sentences
    for idx, new_sentence in enumerate(new_sentences, start=1):
        if 'id' not in new_sentence:
            new_sentence['id'] = f"s-{paragraph_id}-{idx:03d}"
            new_sentence['paragraph_id'] = paragraph_id

    return new_sentences
```

**Example Scenarios:**

**Scenario 1: Minor edit (typo fix)**

Original:
```
"The defendent was present."  -> s-abc123-001
```

After edit:
```
"The defendant was present."  -> s-abc123-001 (preserved, 95% similarity)
```

**Scenario 2: Sentence split**

Original:
```
"He arrived at 3pm and left at 5pm."  -> s-abc123-001
```

After edit:
```
"He arrived at 3pm."          -> s-abc123-001 (preserved, 60% similarity < threshold)
"He left at 5pm."             -> s-abc123-002 (new UUID)
```

Note: First sentence doesn't preserve ID because similarity <80%. This is CORRECT behavior - major structural changes get new IDs to avoid misleading citations.

**Scenario 3: Sentence merge**

Original:
```
"The witness testified."      -> s-abc123-001
"He was credible."            -> s-abc123-002
```

After merge:
```
"The witness testified and was credible."  -> s-abc123-003 (new UUID)
```

Sentences 001 and 002 are removed from registry. New merged sentence gets new ID.

**Scenario 4: Insertion**

Original:
```
"First sentence."             -> s-abc123-001
"Third sentence."             -> s-abc123-002
```

After insertion:
```
"First sentence."             -> s-abc123-001 (preserved)
"Second sentence."            -> s-abc123-003 (new UUID)
"Third sentence."             -> s-abc123-002 (preserved)
```

**Registry Update:**

After re-parsing, update the sentence registry:

```python
def update_sentence_registry(
    paragraph_id: str,
    new_sentences: List[Dict],
    registry: Dict[str, Any]
) -> None:
    """
    Update sentence registry with re-parsed sentences.

    1. Remove old sentences from this paragraph
    2. Add new sentences
    3. Preserve metadata for re-used IDs
    """
    # Remove old sentences from this paragraph
    old_ids = [
        sid for sid, s in registry['sentences'].items()
        if s.get('paragraph_id') == paragraph_id
    ]

    for old_id in old_ids:
        del registry['sentences'][old_id]

    # Add new sentences
    for sentence in new_sentences:
        # Preserve metadata if ID was reused
        if sentence['id'] in registry.get('metadata', {}):
            sentence['metadata'] = registry['metadata'][sentence['id']]

        registry['sentences'][sentence['id']] = sentence
```

**Citation Impact:**

When a sentence ID is preserved:
- ✅ Citations remain valid
- ✅ Sentence boundaries can be highlighted in editor
- ✅ "Show me this sentence" navigation works

When a sentence ID is NOT preserved (new UUID):
- ⚠️ Citations with old ID become "orphaned"
- ⚠️ Frontend should detect orphaned citations and show warning
- ⚠️ User can manually re-link citation to new sentence

**Orphaned Citation Detection:**

```typescript
function detectOrphanedCitations(
  citations: Citation[],
  sentenceRegistry: SentenceRegistry
): Citation[] {
  return citations.filter(citation => {
    return citation.sentence_ids.some(sid => {
      return !(sid in sentenceRegistry.sentences);
    });
  });
}
```

**UI Indication:**

Orphaned citations should be marked in the UI:
- Yellow background: "This citation references a sentence that was modified"
- Action button: "Re-link to new sentence"

---

### 2.10 Cross-Reference Node Model

Cross-references are inline nodes that link to sections within the same document. They update automatically when sections are reordered.

```typescript
interface CrossReferenceNode {
  type: 'crossReference';
  attrs: {
    id: string;                        // Unique ID for this reference
    targetSectionId: string;           // Links to SectionNode.id in draft.sections
    displayMode: 'full' | 'supra' | 'infra' | 'above' | 'below';
    prefix?: string;                   // Optional: "See" | "As discussed in" | etc.
    includeTitle: boolean;             // Include section title in display
  };
}
```

**Display Modes:**

| Mode | Example Output | Use Case |
|------|----------------|----------|
| `full` | "Section II.A" | Standard reference |
| `supra` | "Section II.A, supra" | Referring back to earlier section |
| `infra` | "Section III, infra" | Referring forward to later section |
| `above` | "Section II.A above" | Less formal back-reference |
| `below` | "Section III below" | Less formal forward-reference |

**With Prefix and Title:**
```
prefix: "See"
displayMode: "supra"
includeTitle: true

→ "See Section II.A (Factual Background), supra"
```

**Example Cross-Reference Node:**
```typescript
{
  type: 'crossReference',
  attrs: {
    id: 'xref-001',
    targetSectionId: 'sec-002-A',
    displayMode: 'supra',
    prefix: 'See',
    includeTitle: false
  }
}
// Renders as: "See Section II.A, supra"
```

**Resolution at Render Time:**

Cross-references resolve by looking up the target section in `draft.sections`:
```typescript
function resolveCrossReference(
  xref: CrossReferenceNode,
  sections: SectionNode[]
): string {
  const target = findSectionById(sections, xref.attrs.targetSectionId);

  if (!target) {
    return "[Missing Section]";
  }

  let text = '';

  // Add prefix
  if (xref.attrs.prefix) {
    text += xref.attrs.prefix + ' ';
  }

  // Add section number
  text += `Section ${target.number}`;

  // Add title if requested
  if (xref.attrs.includeTitle && target.title) {
    text += ` (${target.title})`;
  }

  // Add position indicator
  switch (xref.attrs.displayMode) {
    case 'supra':
      text += ', supra';
      break;
    case 'infra':
      text += ', infra';
      break;
    case 'above':
      text += ' above';
      break;
    case 'below':
      text += ' below';
      break;
    // 'full' adds nothing
  }

  return text;
}

function findSectionById(sections: SectionNode[], id: string): SectionNode | null {
  for (const section of sections) {
    if (section.id === id) return section;
    if (section.children) {
      const found = findSectionById(section.children, id);
      if (found) return found;
    }
  }
  return null;
}
```

**Section ID Assignment:**

Section IDs must be stable across edits. Assign on section creation:
```typescript
// When user creates a new heading
function createSectionNode(level: number, title: string): SectionNode {
  return {
    id: `sec-${crypto.randomUUID().slice(0, 8)}`,
    level,
    number: '',  // Computed later
    title,
    children: []
  };
}
```

**Broken Reference Detection:**

If a referenced section is deleted, the cross-reference shows an error state:

| State | Visual | Behavior |
|-------|--------|----------|
| Valid | Blue text, clickable | Click scrolls to section |
| Broken | Red text + ⚠️ | "Section II.A" still shown, but marked as broken |

```typescript
function validateCrossReferences(
  document: ProseMirrorDocument,
  sections: SectionNode[]
): CrossReferenceValidation {
  const errors: string[] = [];
  const sectionIds = collectAllSectionIds(sections);

  walkDocument(document, (node) => {
    if (node.type === 'crossReference') {
      if (!sectionIds.has(node.attrs.targetSectionId)) {
        errors.push(`Cross-reference ${node.attrs.id} targets deleted section`);
      }
    }
  });

  return { valid: errors.length === 0, errors };
}
```

---

### 2.11 Variable Node Model

Variables are inline nodes that display template variable placeholders in the document body. They resolve to concrete values at export time.
```typescript
interface VariableNode {
  type: 'variable';
  attrs: {
    id: string;                        // Matches TemplateVariable.name (e.g., "response_deadline")
    label: string;                     // Display label (e.g., "Response Deadline")
    fallback?: string;                 // Value if variable is undefined
  };
}
```

**Key Behaviors:**

| Aspect | Behavior |
|--------|----------|
| Rendering | Displays as chip: `[Response Deadline]` with distinct styling |
| Editing | Atomic—cannot edit text inside, only delete whole node |
| Resolution | Replaced with concrete value at export time |
| Undefined | Uses fallback if provided, otherwise `[Variable Name]` |

**Example Variable Node:**
```typescript
{
  type: 'variable',
  attrs: {
    id: 'response_deadline',
    label: 'Response Deadline',
    fallback: '[DATE]'
  }
}
// Displays in editor as: [Response Deadline]
// Exports as: "December 6, 2024" (resolved value)
```

**Available Variables:**

Variable nodes can reference:
1. **System variables:** `today`, `filer_name`, `filer_role`, `cause_number`, `motion_title`
2. **Template-defined variables:** Any variable defined in `Template.variables`
3. **Case-level overrides:** Values from `Draft.variable_values`

**Variable Resolution Order:**
1. Check `Draft.variable_values` for explicit override
2. Check computed value (if `inputMode: 'computed'`)
3. Check `Template.variables` default value
4. Use `VariableNode.fallback` if defined
5. Display `[label]` as placeholder

**Styling:**
```css
.variable-node {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  background-color: #E8F4FC;
  border: 1px solid #4A9EDA;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.95em;
  color: #1E5A8A;
  cursor: default;
  user-select: none;
}

.variable-node::before {
  content: '⟨ ';
  opacity: 0.6;
}

.variable-node::after {
  content: ' ⟩';
  opacity: 0.6;
}

.variable-node.selected {
  outline: 2px solid #2563EB;
  outline-offset: 1px;
}

.variable-node.undefined {
  background-color: #FEF3C7;
  border-color: #F59E0B;
  color: #92400E;
}
```

---

## 3. Template System

### 3.1 Template Lifecycle

```
┌──────────────────────────────────────────────────────────────────┐
│  1. CREATE FROM SCRATCH                                          │
│     User opens Template Builder → configures all settings        │
│     → saves as new template                                      │
├──────────────────────────────────────────────────────────────────┤
│  2. CREATE FROM UPLOAD                                           │
│     User uploads existing .docx → system extracts:               │
│     - Signature block (OOXML)                                    │
│     - Case block structure (suggests template)                   │
│     → User reviews/adjusts → saves as template                   │
├──────────────────────────────────────────────────────────────────┤
│  3. DUPLICATE & MODIFY                                           │
│     User selects existing template → "Duplicate"                 │
│     → modifies settings → saves as new template                  │
├──────────────────────────────────────────────────────────────────┤
│  4. EDIT EXISTING                                                │
│     User selects template → modifies → saves                     │
│     (Existing cases/drafts using this template inherit changes)  │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 Template Builder UI Sections

1. **General Settings**
   - Template name
   - Description
   - Typography settings (font, spacing)
   - Page margins

2. **Case Block Builder**
   - Court line format (with variable placeholders)
   - Party block structure (add/remove party groups)
   - Motion title formatting (lines above/below)
   - Salutation editor (with variable placeholders)

3. **Outline Schema Builder**
   - Define levels (Section, Subsection, Point, etc.)
   - Choose numbering format per level
   - Set styling per level
   - Toggle sequential paragraph mode

4. **Signature Block Capture**
   - Upload .docx containing signature block
   - Preview extracted block
   - Mark variable regions (optional)

5. **Certificate of Service**
   - Enable/disable
   - Upload .docx containing certificate
   - Mark variable regions (date, parties, method)

6. **Footer Configuration**
   - Left content (motion title / case style / custom)
   - Center content (usually empty)
   - Right content (page number format)

### 3.3 Template Variables

Variables allow dynamic content in documents. Users define variables in the template; values are provided per-draft.

**Variable Types:**

| Type | Input UI | Example |
|------|----------|---------|
| `date` | Date picker | Filing date, service date |
| `text` | Text input | Attorney name, case caption |
| `number` | Number input | Days to respond, dollar amounts |
| `boolean` | Checkbox/toggle | Is pro se?, Include certificate? |

**Input Modes:**

| Mode | Behavior | Use Case |
|------|----------|----------|
| `manual` | User enters value | Most variables |
| `today` | Defaults to current date | Filing date |
| `computed` | Calculated from other variables | Response deadline |
| `static` | Fixed value from template | Jurisdiction name |

**Variable Placeholders in Content:**

Variables can be used in:
- Case block templates: `{{filer_name}}`, `{{court_type}}`
- Salutation templates: `{{motion_title}}`
- Certificate of service: `{{service_date}}`, `{{service_method}}`

System variables (always available):
- `{{today}}` — Current date
- `{{filer_name}}` — From case.filer.name
- `{{filer_role}}` — From case.filer.role
- `{{cause_number}}` — From case.cause_number
- `{{motion_title}}` — From draft.motion_title

**Computation Examples:**

1. **Response Deadline** (date offset):
```typescript
{
  name: "response_deadline",
  displayName: "Response Deadline",
  type: "date",
  inputMode: "computed",
  computation: {
    type: "date_offset",
    baseVariable: "filing_date",
    offsetDays: 21
  }
}
// If filing_date = "2024-11-15", response_deadline = "2024-12-06"
```

2. **Extended Deadline for Mail Service** (conditional):
```typescript
{
  name: "actual_deadline",
  displayName: "Actual Deadline",
  type: "date",
  inputMode: "computed",
  computation: {
    type: "date_offset",
    baseVariable: "response_deadline",
    offsetDays: 3  // Mailbox rule adds 3 days
  }
}
// Applied conditionally based on service_method
```

3. **Pro Se Language** (conditional text):
```typescript
{
  name: "representation_clause",
  displayName: "Representation Clause",
  type: "text",
  inputMode: "computed",
  computation: {
    type: "conditional",
    conditionVariable: "is_pro_se",
    trueValue: "appearing pro se",
    falseValue: "by and through undersigned counsel"
  }
}
```

**Variable Resolution:**
```python
from datetime import datetime, timedelta

def resolve_variables(
    template: dict,
    case_data: dict,
    draft: dict
) -> dict:
    """
    Resolve all template variables to final values.

    Returns:
        Dict mapping variable names to resolved string values
    """
    # Start with system variables
    resolved = {
        'today': datetime.now().strftime('%B %d, %Y'),
        'filer_name': case_data.get('filer', {}).get('name', ''),
        'filer_role': case_data.get('filer', {}).get('role', ''),
        'cause_number': case_data.get('cause_number', ''),
        'motion_title': draft.get('motion_title', ''),
    }

    # Add draft-specific overrides
    resolved.update(draft.get('variable_values', {}))

    # Process template variables in dependency order
    variables = template.get('variables', [])
    sorted_vars = topological_sort_variables(variables)

    for var in sorted_vars:
        if var['name'] in resolved:
            continue  # Already has value from draft

        if var['inputMode'] == 'static':
            resolved[var['name']] = var.get('defaultValue', '')

        elif var['inputMode'] == 'today':
            resolved[var['name']] = datetime.now().strftime('%B %d, %Y')

        elif var['inputMode'] == 'computed':
            resolved[var['name']] = compute_variable(var, resolved)

        elif var['inputMode'] == 'manual':
            # Use default if no value provided
            resolved[var['name']] = var.get('defaultValue', '')

    return resolved


def compute_variable(var: dict, resolved: dict) -> str:
    """Compute a variable value based on its computation spec."""
    comp = var.get('computation', {})
    comp_type = comp.get('type')

    if comp_type == 'date_offset':
        base_value = resolved.get(comp.get('baseVariable', ''))
        if not base_value:
            return ''

        try:
            base_date = parse_date(base_value)
            offset = comp.get('offsetDays', 0)
            result_date = base_date + timedelta(days=offset)
            return result_date.strftime('%B %d, %Y')
        except:
            return ''

    elif comp_type == 'conditional':
        condition_value = resolved.get(comp.get('conditionVariable', ''))
        is_true = condition_value in ['true', 'True', '1', True]
        return comp.get('trueValue' if is_true else 'falseValue', '')

    elif comp_type == 'format':
        source_value = resolved.get(comp.get('sourceVariable', ''))
        format_string = comp.get('formatString', '')
        # Apply formatting (date formatting, number formatting, etc.)
        return format_value(source_value, format_string)

    return ''


def topological_sort_variables(variables: list) -> list:
    """
    Sort variables so dependencies are resolved first.
    """
    # Build dependency graph
    deps = {}
    for var in variables:
        var_deps = set()
        comp = var.get('computation', {})

        if comp.get('baseVariable'):
            var_deps.add(comp['baseVariable'])
        if comp.get('conditionVariable'):
            var_deps.add(comp['conditionVariable'])
        if comp.get('sourceVariable'):
            var_deps.add(comp['sourceVariable'])

        deps[var['name']] = var_deps

    # Topological sort
    sorted_names = []
    visited = set()

    def visit(name):
        if name in visited:
            return
        visited.add(name)
        for dep in deps.get(name, []):
            visit(dep)
        sorted_names.append(name)

    for var in variables:
        visit(var['name'])

    # Return variables in sorted order
    name_to_var = {v['name']: v for v in variables}
    return [name_to_var[n] for n in sorted_names if n in name_to_var]


def resolve_variable_nodes(document: dict, resolved_values: dict) -> dict:
    """
    Replace VariableNode instances with their resolved text values.

    Args:
        document: ProseMirror document (as dict)
        resolved_values: Dict mapping variable IDs to resolved string values

    Returns:
        Document with VariableNodes replaced by text nodes
    """
    import copy
    doc = copy.deepcopy(document)

    def resolve_node(node: dict) -> dict:
        if node.get('type') == 'variable':
            attrs = node.get('attrs', {})
            var_id = attrs.get('id', '')
            fallback = attrs.get('fallback', '')
            label = attrs.get('label', var_id)

            # Resolution order: resolved_values → fallback → [label]
            value = resolved_values.get(var_id)
            if value is None or value == '':
                value = fallback if fallback else f'[{label}]'

            # Return as text node
            return {
                'type': 'text',
                'text': str(value)
            }

        # Recurse into children
        if 'content' in node:
            node['content'] = [resolve_node(child) for child in node['content']]

        return node

    return resolve_node(doc)
```

**Template Builder UI:**
```
┌─ TEMPLATE VARIABLES ────────────────────────────────────────────────────┐
│                                                                         │
│  [+ Add Variable]                                                       │
│                                                                         │
│  ┌─ filing_date ───────────────────────────────────────────────────────┐│
│  │ Display Name: [Filing Date          ]                               ││
│  │ Type: [Date ▼]   Input Mode: [Today ▼]   Required: [✓]             ││
│  │ Help Text: [Date motion is being filed    ]                         ││
│  │                                                   [Delete Variable] ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  ┌─ response_deadline ─────────────────────────────────────────────────┐│
│  │ Display Name: [Response Deadline     ]                              ││
│  │ Type: [Date ▼]   Input Mode: [Computed ▼]   Required: [✓]          ││
│  │ ┌─ Computation ─────────────────────────────────────────────────┐   ││
│  │ │ Base Variable: [filing_date ▼]                                │   ││
│  │ │ Offset: [21] days [after ▼]                                   │   ││
│  │ └───────────────────────────────────────────────────────────────┘   ││
│  │                                                   [Delete Variable] ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  ┌─ is_pro_se ─────────────────────────────────────────────────────────┐│
│  │ Display Name: [Filing Pro Se?        ]                              ││
│  │ Type: [Boolean ▼]   Input Mode: [Manual ▼]   Required: [✓]         ││
│  │ Help Text: [Check if filer is representing themselves]              ││
│  │                                                   [Delete Variable] ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Draft Editor Variables Panel:**
```
┌─ VARIABLES ─────────────────────────────────┐
│                                             │
│  Filing Date *                              │
│  [📅 November 15, 2024        ]             │
│  ℹ️ Date motion is being filed              │
│                                             │
│  Response Deadline (computed)               │
│  📅 December 6, 2024                        │
│                                             │
│  Filing Pro Se? *                           │
│  [✓] Yes                                    │
│                                             │
│  Service Method *                           │
│  [Electronic Service ▼]                     │
│                                             │
│                         [Reset to Defaults] │
└─────────────────────────────────────────────┘
```

---

## 4. LegalDocument Schema (Canonical Backend Contract)

**CRITICAL:** This is the ONLY data structure that backend services (Runbooks 3-10) accept and return. All microservices MUST validate incoming payloads against this schema.

### 4.1 Purpose

LegalDocument provides a stable, versioned contract for:
- Cross-service communication (all services speak the same language)
- Export pipeline (Export Service converts LegalDocument → DOCX)
- Storage (Records Service persists LegalDocument to database)
- API boundaries (Frontend sends/receives LegalDocument via REST)

### 4.2 Schema Version

```typescript
const LEGAL_DOCUMENT_SCHEMA_VERSION = "1.0.0";
```

**Versioning rules:**
- MAJOR: Breaking changes (remove/rename fields)
- MINOR: Additive changes (new optional fields)
- PATCH: Documentation/clarification only

### 4.3 Complete TypeScript Schema

```typescript
interface LegalDocument {
  // Metadata
  schema_version: string;           // "1.0.0"
  document_type: "motion" | "brief" | "petition" | "order";
  created_at: string;               // ISO 8601
  updated_at: string;               // ISO 8601

  // Document Identity
  id: string;                       // UUID
  case_id: string;                  // Links to Case record
  template_id: string;              // Links to Template record
  title: string;                    // e.g., "Motion for Summary Judgment"

  // Case Block Data (from CaseBlock Service, port 3004)
  case_caption: CaseCaption;

  // Signature Block Data (from Signature Service, port 3005)
  signature_block: SignatureBlock;

  // Body Content (sentences array is canonical storage)
  sentences: Sentence[];

  // Evidence & Linking (from Facts/Exhibits/Caselaw Services)
  exhibits: Exhibit[];
  caselaw_citations: CaselawCitation[];
  statute_citations: StatuteCitation[];

  // Computed Metadata (from Facts Service, port 3006)
  sentence_registry: SentenceRegistry;

  // Export Metadata
  export_config: ExportConfig;
}

// ============================================================
// Case Caption (extracted by CaseBlock Service)
// ============================================================

interface CaseCaption {
  court: string;                    // "District Court of Travis County, Texas"
  court_division?: string;          // "250th Judicial District"

  plaintiffs: Party[];
  defendants: Party[];

  cause_number: string;             // "D-1-GN-24-001234"

  // Additional parties
  intervenors?: Party[];
  third_party_defendants?: Party[];
}

interface Party {
  name: string;                     // "JOHN DOE"
  entity_type?: "individual" | "corporation" | "llc" | "partnership" | "government";
  role_suffix?: string;             // "as Next Friend of JANE DOE, a Minor"
}

// ============================================================
// Signature Block (extracted by Signature Service)
// ============================================================

interface SignatureBlock {
  attorney_name: string;            // "Jane Smith"
  bar_number: string;               // "12345678"
  firm_name?: string;               // "Smith & Associates"

  address_line1: string;            // "123 Main Street"
  address_line2?: string;           // "Suite 456"
  city: string;                     // "Austin"
  state: string;                    // "Texas"
  zip: string;                      // "78701"

  phone: string;                    // "(512) 555-0100"
  fax?: string;                     // "(512) 555-0101"
  email: string;                    // "jane@smithlaw.com"

  // Service designation
  service_method: "electronic" | "hand_delivery" | "certified_mail";
  accepts_electronic_service: boolean;
}

// ============================================================
// Sentences (canonical storage, from Facts Service)
// ============================================================

interface Sentence {
  id: string;                       // "s-{paragraph_uuid}-{index}"
  text: string;                     // Plain text with formatting as HTML
  paragraph_id: string;             // Links to paragraph UUID

  // Evidence linking
  evidence_links: string[];         // Array of exhibit/caselaw/statute IDs

  // Metadata for audit trails
  created_at: string;               // ISO 8601
  last_modified: string;            // ISO 8601

  // Provenance (for imported documents)
  source?: "user_typed" | "imported" | "template_boilerplate";
}

interface SentenceRegistry {
  paragraphs: RegistryParagraph[];
  computed_at: string;              // ISO 8601
  version: number;                  // Registry version for compatibility
}

interface RegistryParagraph {
  paragraph_id: string;             // UUID
  sentences: Sentence[];
}

// ============================================================
// Exhibits (from Exhibits Service, port 3007)
// ============================================================

interface Exhibit {
  id: string;                       // "ex_{uuid}"
  label: string;                    // "A", "B", "C" (computed on first reference)

  // File metadata
  file_name: string;                // "contract.pdf"
  file_path: string;                // "/uploads/{case_id}/exhibits/contract.pdf"
  file_size: number;                // Bytes
  file_type: string;                // "application/pdf"

  // Optional description
  description?: string;             // "Employment Contract dated January 1, 2024"

  // Upload metadata
  uploaded_at: string;              // ISO 8601
  uploaded_by: string;              // User ID

  // Document processing metadata
  page_count?: number;
  ocr_text?: string;                // Extracted text for search
}

// ============================================================
// Caselaw Citations (from Caselaw Service, port 3008)
// ============================================================

interface CaselawCitation {
  id: string;                       // "case_{uuid}"

  // Citation components
  case_name: string;                // "Smith v. Jones"
  reporter: string;                 // "S.W.3d"
  volume: string;                   // "123"
  page: string;                     // "456"
  pinpoint_page?: string;           // "460"
  court: string;                    // "Tex. App."
  year: string;                     // "2024"

  // Full citation text (for display)
  full_citation: string;            // "Smith v. Jones, 123 S.W.3d 456, 460 (Tex. App. 2024)"

  // Optional: linked opinion file
  opinion_file_path?: string;       // "/uploads/{case_id}/opinions/smith_v_jones.pdf"

  // Metadata
  added_at: string;                 // ISO 8601
}

// ============================================================
// Statute Citations (from Caselaw Service, port 3008)
// ============================================================

interface StatuteCitation {
  id: string;                       // "stat_{uuid}"

  // Statute components
  code: string;                     // "TEX. CIV. PRAC. & REM. CODE"
  section: string;                  // "§ 41.001"
  subsection?: string;              // "(a)(1)"

  // Full citation text (for display)
  full_citation: string;            // "TEX. CIV. PRAC. & REM. CODE § 41.001(a)(1)"

  // Optional: linked statute text
  statute_text?: string;
  statute_file_path?: string;       // "/uploads/{case_id}/statutes/cprc_41.pdf"

  // Metadata
  added_at: string;                 // ISO 8601
}

// ============================================================
// Export Configuration (for Export Service, port 3003)
// ============================================================

interface ExportConfig {
  // Template styling (from Template record)
  apply_template_styles: boolean;

  // Page layout
  page_size: "letter" | "legal" | "a4";
  orientation: "portrait" | "landscape";

  margins: {
    top: number;                    // Inches
    bottom: number;
    left: number;
    right: number;
  };

  // Header/Footer
  include_page_numbers: boolean;
  page_number_format: "Page X of Y" | "Page X" | "X";
  page_number_position: "bottom_center" | "bottom_right" | "top_right";

  // Exhibits
  include_exhibit_appendix: boolean;
  exhibit_separator: "page_break" | "section_break" | "none";

  // Output format
  output_format: "docx" | "pdf";
}
```

### 4.4 Validation Rules

**All services MUST validate incoming LegalDocument against these rules:**

```python
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Literal
from datetime import datetime

class LegalDocumentValidator(BaseModel):
    schema_version: str = Field(..., regex=r"^\d+\.\d+\.\d+$")
    document_type: Literal["motion", "brief", "petition", "order"]

    id: str = Field(..., regex=r"^[a-f0-9-]{36}$")  # UUID format
    case_id: str = Field(..., regex=r"^[a-f0-9-]{36}$")
    template_id: str = Field(..., regex=r"^[a-f0-9-]{36}$")

    title: str = Field(..., min_length=1, max_length=500)

    case_caption: dict  # Nested validation
    signature_block: dict
    sentences: List[dict]

    @validator('sentences')
    def validate_sentences(cls, v):
        if not v:
            raise ValueError("sentences array cannot be empty")

        # Check for duplicate sentence IDs
        ids = [s['id'] for s in v]
        if len(ids) != len(set(ids)):
            raise ValueError("Duplicate sentence IDs detected")

        return v

    @validator('schema_version')
    def validate_schema_version(cls, v):
        if v != "1.0.0":
            raise ValueError(f"Unsupported schema version: {v}")
        return v
```

### 4.5 Service Responsibilities

| Service | Reads | Writes | Validates |
|---------|-------|--------|-----------|
| Records (3001) | Full LegalDocument | Full LegalDocument | ✓ All fields |
| Ingestion (3002) | - | sentences[], case_caption, signature_block | ✓ Output only |
| Export (3003) | Full LegalDocument | - | ✓ Input only |
| CaseBlock (3004) | case_caption | case_caption | ✓ case_caption |
| Signature (3005) | signature_block | signature_block | ✓ signature_block |
| Facts (3006) | sentences[] | sentences[], sentence_registry | ✓ sentences[] |
| Exhibits (3007) | exhibits[] | exhibits[] | ✓ exhibits[] |
| Caselaw (3008) | caselaw_citations[], statute_citations[] | caselaw_citations[], statute_citations[] | ✓ citations |

### 4.6 Frontend Transformation Contract

**Rule:** Frontend MUST transform Tiptap JSON → LegalDocument before calling backend APIs.

```typescript
// Frontend transform layer
class LegalDocumentTransformer {
  /**
   * Convert Tiptap JSON to LegalDocument
   * Called on: Save, Export, Evidence Linking
   */
  static tiptapToLegalDocument(
    tiptapDoc: TiptapDocument,
    caseId: string,
    templateId: string
  ): LegalDocument {
    // 1. Extract plain text sentences from Tiptap nodes
    const sentences = this.extractSentences(tiptapDoc);

    // 2. Call Facts Service to get sentence IDs
    const sentenceRegistry = await FactsService.parseSentences(sentences);

    // 3. Extract exhibits from CitationNodes (frontend-only construct)
    const exhibits = this.extractExhibits(tiptapDoc);

    // 4. Build LegalDocument
    return {
      schema_version: "1.0.0",
      document_type: "motion",
      id: uuidv4(),
      case_id: caseId,
      template_id: templateId,
      sentences: sentenceRegistry.sentences,
      exhibits: exhibits,
      // ... other fields
    };
  }

  /**
   * Convert LegalDocument to Tiptap JSON
   * Called on: Load, Import
   */
  static legalDocumentToTiptap(doc: LegalDocument): TiptapDocument {
    // 1. Build Tiptap nodes from sentences
    const nodes = this.sentencesToNodes(doc.sentences);

    // 2. Insert CitationNodes based on exhibit labels in text
    const nodesWithCitations = this.insertCitationNodes(nodes, doc.exhibits);

    // 3. Preserve sentence IDs in paragraph attrs
    return {
      type: "doc",
      content: nodesWithCitations
    };
  }
}
```

### 4.7 Migration Path

**When adding new fields to LegalDocument:**

1. Increment schema_version (MINOR bump for optional fields)
2. Add field with `?` optional marker in TypeScript
3. Update Pydantic validator with default value
4. Update all services to handle missing field gracefully
5. Add migration script to populate field for existing documents

**Example:**
```typescript
// Version 1.1.0 adds optional AI-generated summary
interface LegalDocument {
  schema_version: "1.1.0";
  // ... existing fields ...

  ai_summary?: string;  // NEW in v1.1.0
}
```

Services on v1.0.0 ignore `ai_summary` (unknown fields are dropped).
Services on v1.1.0 read `ai_summary` if present, skip if missing.

---

## 5. Case Block Specification

### 5.1 Structure

The Case Block consists of these components in order:

```
┌─────────────────────────────────────────────────────────────────┐
│  1. COURT DESIGNATION                                           │
│     Template: "IN THE {{court_type}} COURT OF {{county}}, TEXAS"│
│     Example:  "IN THE DISTRICT COURT OF BEXAR COUNTY, TEXAS"    │
├─────────────────────────────────────────────────────────────────┤
│  2. JUDICIAL DISTRICT (optional)                                │
│     Template: "{{district_number}} JUDICIAL DISTRICT"           │
│     Example:  "73RD JUDICIAL DISTRICT"                          │
├─────────────────────────────────────────────────────────────────┤
│  3. CAUSE NUMBER                                                │
│     Template: "CAUSE NO. {{cause_number}}"                      │
│     Example:  "CAUSE NO. 2022-CI-08479"                         │
├─────────────────────────────────────────────────────────────────┤
│  4. PARTY BLOCK                                                 │
│     ┌─────────────────────────────────────────────────────────┐ │
│     │  JOHN DOE,                               §              │ │
│     │       Plaintiff,                         §              │ │
│     │  v.                                      §              │ │
│     │  ACME CORPORATION,                       §              │ │
│     │       Defendant.                         §              │ │
│     └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  5. MOTION TITLE                                                │
│     ═══════════════════════════════════════════ (optional line) │
│     DEFENDANT'S MOTION TO COMPEL DISCOVERY                      │
│     ═══════════════════════════════════════════ (optional line) │
├─────────────────────────────────────────────────────────────────┤
│  6. SALUTATION                                                  │
│     "TO THE HONORABLE JUDGE OF SAID COURT:"                     │
│                                                                 │
│     "NOW COMES {{filer_name}}, {{filer_role}} in the above-    │
│      styled and numbered cause, and files this {{motion_title}},│
│      and in support thereof, would show the Court as follows:" │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Variable Placeholders

These variables are available in case block templates:

| Variable | Source | Example |
|----------|--------|---------|
| `{{court_type}}` | Case.court.court_type | "DISTRICT" |
| `{{county}}` | Case.court.county | "BEXAR" |
| `{{state}}` | Case.court.state | "TEXAS" |
| `{{district_number}}` | Case.court.district_number | "73RD" |
| `{{cause_number}}` | Case.cause_number | "2022-CI-08479" |
| `{{plaintiff_names}}` | Case.party_groups[0].plaintiffs | "JOHN DOE" |
| `{{defendant_names}}` | Case.party_groups[0].defendants | "ACME CORPORATION" |
| `{{filer_name}}` | Case.filer.name | "Alex Cruz" |
| `{{filer_role}}` | Case.filer.role | "Defendant" |
| `{{motion_title}}` | Draft.motion_title | "MOTION TO COMPEL DISCOVERY" |

### 4.3 Party Block OOXML Generation

The party block with § column alignment CANNOT be reliably rendered via Markdown/Quarto. It requires direct OOXML generation using python-docx with borderless tables.

**Why Tables, Not Tab Stops:**
- Tab stops fail when party names are long (text wraps incorrectly)
- Tables maintain alignment regardless of content length
- Tables render consistently across Word, LibreOffice, and Google Docs

**Table Structure:**
```
| Column 1 (3")      | Column 2 (0.5") | Column 3 (3")           |
|--------------------|-----------------|-------------------------|
| JOHN DOE,          | §               | IN THE DISTRICT COURT   |
|      Plaintiff,    | §               |                         |
| v.                 | §               | 73RD JUDICIAL DISTRICT  |
| ACME CORPORATION,  | §               |                         |
|      Defendant.    | §               | BEXAR COUNTY, TEXAS     |
|                    | §               |                         |
|                    | §               | CAUSE NO. 2022-CI-08479 |
```

**Python Implementation:**
```python
from docx import Document
from docx.shared import Inches, Pt
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def remove_table_borders(table):
    """Remove all visible borders from a table."""
    tbl = table._tbl
    tblPr = tbl.tblPr if tbl.tblPr is not None else OxmlElement('w:tblPr')
    if tbl.tblPr is None:
        tbl.insert(0, tblPr)

    tblBorders = OxmlElement('w:tblBorders')
    for border_name in ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']:
        border = OxmlElement(f'w:{border_name}')
        border.set(qn('w:val'), 'nil')
        tblBorders.append(border)

    existing = tblPr.find(qn('w:tblBorders'))
    if existing is not None:
        tblPr.remove(existing)
    tblPr.append(tblBorders)

    # Fixed layout prevents auto-resize
    tblLayout = OxmlElement('w:tblLayout')
    tblLayout.set(qn('w:type'), 'fixed')
    tblPr.append(tblLayout)

def generate_case_block_ooxml(doc: Document, case_data: dict, template: dict) -> None:
    """
    Generate the complete case block as OOXML and add to document.

    Args:
        doc: python-docx Document object
        case_data: Case schema data (court, parties, cause_number, etc.)
        template: Template schema data (case_block configuration)
    """
    # 1. Court designation (centered paragraph)
    court_line = template['case_block']['court_line_format'].replace(
        '{{court_type}}', case_data['court']['court_type']
    ).replace(
        '{{county}}', case_data['court']['county']
    )
    p = doc.add_paragraph(court_line)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # 2. Judicial district if present
    if case_data['court'].get('district_number'):
        district_line = template['case_block']['judicial_district_format'].replace(
            '{{district_number}}', case_data['court']['district_number']
        )
        p = doc.add_paragraph(district_line)
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # 3. Party block table
    party_rows = build_party_rows(case_data, template)
    table = doc.add_table(rows=len(party_rows), cols=3)
    remove_table_borders(table)

    # Set column widths
    for row in table.rows:
        row.cells[0].width = Inches(3.0)
        row.cells[1].width = Inches(0.5)
        row.cells[2].width = Inches(3.0)

    # Populate cells
    for row_idx, (left, center, right) in enumerate(party_rows):
        row = table.rows[row_idx]
        row.cells[0].text = left
        row.cells[0].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP

        center_para = row.cells[1].paragraphs[0]
        center_para.add_run(center)  # Usually "§"
        center_para.alignment = WD_ALIGN_PARAGRAPH.CENTER

        row.cells[2].text = right

    # 4. Motion title
    add_motion_title(doc, case_data['motion_title'], template['case_block']['motion_title'])

    # 5. Salutation
    add_salutation(doc, case_data, template['case_block']['salutation'])

def build_party_rows(case_data: dict, template: dict) -> list:
    """Build the row data for party block table."""
    rows = []
    config = template['case_block']['party_block']

    for group in case_data['party_groups']:
        group_config = next(
            g for g in config['party_groups']
            if g['id'] == group['group_id']
        )

        # Plaintiffs
        for i, plaintiff in enumerate(group['plaintiffs']):
            suffix = ',' if i < len(group['plaintiffs']) - 1 else ','
            rows.append((plaintiff['name'].upper() + suffix, '§', ''))
            designation = group_config['plaintiff_label']
            if plaintiff.get('designation'):
                designation = plaintiff['designation']
            rows.append((f"     {designation},", '§', ''))

        # Connector (v.)
        rows.append((group_config['connector'], '§', ''))

        # Defendants
        for i, defendant in enumerate(group['defendants']):
            suffix = ',' if i < len(group['defendants']) - 1 else '.'
            rows.append((defendant['name'].upper() + suffix, '§', ''))
            designation = group_config['defendant_label']
            if defendant.get('designation'):
                designation = defendant['designation']
            rows.append((f"     {designation}.", '§', ''))

    # Add court info to right column of appropriate rows
    # (Implementation fills right column based on template layout)

    return rows

def add_motion_title(doc: Document, title: str, config: dict) -> None:
    """Add motion title with optional lines above/below."""
    if config.get('line_above'):
        # Add horizontal line
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        add_horizontal_line(p)

    p = doc.add_paragraph(title.upper())
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.runs[0]
    run.bold = True

    if config.get('line_below'):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        add_horizontal_line(p)

def add_salutation(doc: Document, case_data: dict, config: dict) -> None:
    """Add salutation paragraphs."""
    # Addressee
    p = doc.add_paragraph(config['addressee'])
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # Body with variable substitution
    body = config['body_template'].replace(
        '{{filer_name}}', case_data['filer']['name']
    ).replace(
        '{{filer_role}}', case_data['filer']['role']
    ).replace(
        '{{motion_title}}', case_data['motion_title']
    )

    doc.add_paragraph(body)
```

**Integration with Export Pipeline:**

The case block is generated BEFORE Pandoc processes the body. The export pipeline becomes:

1. Create new Document with python-docx
2. Generate case block OOXML (using functions above)
3. Transform body HTML (footnotes to Pandoc format)
4. Convert body HTML to DOCX via Pandoc
5. Merge body paragraphs into main document
6. Inject signature block OOXML
7. Inject certificate OOXML (if enabled)
8. Add footers
9. Save final document

---

## 6. Signature Block Specification

### 6.1 Capture Process

1. User uploads .docx containing signature block
2. System identifies signature block region:
   - Starts after: "Respectfully submitted" or similar closing
   - Ends at: "CERTIFICATE OF SERVICE" or end of document
3. System extracts raw OOXML for that region
4. User previews the extracted block
5. User optionally marks variable regions
6. System stores OOXML + variable markers

### 5.2 Variable Marking

Variables are identified by XPath position within the OOXML:

```typescript
{
  name: "attorney_name",
  placeholder: "{{attorney_name}}",
  xpath_position: "//w:p[3]/w:r[1]/w:t",
  format: "text"
}
```

When rendering:
1. Parse stored OOXML
2. Navigate to each variable's XPath
3. Replace content with current value
4. Serialize back to OOXML

### 5.3 Injection Rules

- Signature block is injected AFTER body content is merged
- It is inserted as raw OOXML, preserving exact formatting
- Page break before signature block: **NO** (flows naturally)
- Signature block cannot split across pages: **ENFORCE** via Word's "Keep with next" property

---

## 7. Body Editor Specification

### 6.1 Supported Formatting

| Feature | Implementation | Keyboard Shortcut |
|---------|---------------|-------------------|
| Bold | `<strong>` | Ctrl+B |
| Italic | `<em>` | Ctrl+I |
| Underline | `<u>` | Ctrl+U |
| Heading (Section) | `<h1>` - `<h6>` | Ctrl+1 through Ctrl+6 |
| Block Quote | `<blockquote>` | Ctrl+Shift+B |
| Bullet List | `<ul><li>` | Toolbar only |
| Numbered List | `<ol><li>` | Toolbar only |
| Table | `<table>` | Toolbar → Insert Table |
| Footnote | Custom extension | Toolbar → Insert Footnote |
| Image | `<img>` | Toolbar → Insert Image |

### 6.2 Footnote Implementation

**Extension:** `tiptap-footnotes` by Buttondown (npm: `tiptap-footnotes`)

This is the only production-ready footnote extension for Tiptap 2.x. There is no official Tiptap Pro footnote extension.

**Installation:**
```typescript
import { Footnotes, FootnoteReference, Footnote } from "tiptap-footnotes";
import Document from "@tiptap/extension-document";

// Must extend Document to allow footnotes at end
Document.extend({ content: "block+ footnotes?" })
```

**Editor Configuration:**
```typescript
extensions: [
  StarterKit.configure({ document: false }),  // Disable default document
  Document.extend({ content: "block+ footnotes?" }),
  Footnotes,
  Footnote,
  FootnoteReference,
  // ... other extensions
]
```

**HTML Output Structure:**
```html
<!-- Inline reference in text -->
<p>Legal argument text<sup data-footnote-reference="fn-1">1</sup> continues here.</p>

<!-- Footnotes section at document end -->
<footer class="footnotes">
  <ol>
    <li data-footnote="fn-1">
      <p>Footnote content with legal citation. See <em>Smith v. Jones</em>, 123 S.W.3d 456.</p>
    </li>
  </ol>
</footer>
```

**Pandoc Conversion (Requires Pandoc 3.6+):**

For Pandoc to recognize footnotes in HTML and convert them to native Word footnotes, the HTML must use dpub-aria roles:
```html
<!-- Reference in text -->
<a href="#fn1" class="footnote-ref" id="fnref1" role="doc-noteref"><sup>1</sup></a>

<!-- Footnotes section -->
<section id="footnotes" class="footnotes" role="doc-endnotes">
  <hr />
  <ol>
    <li id="fn1">
      <p>Footnote content.<a href="#fnref1" class="footnote-back" role="doc-backlink">↩</a></p>
    </li>
  </ol>
</section>
```

**Required Transformation:**

The export pipeline must transform tiptap-footnotes HTML output to Pandoc-compatible format before conversion. This transformation:

1. Converts `<sup data-footnote-reference="fn-X">` to `<a role="doc-noteref">`
2. Converts `<footer class="footnotes">` to `<section role="doc-endnotes">`
3. Adds backlinks with `role="doc-backlink"`

**Limitation:** Footnotes cannot be referenced multiple times (tiptap-footnotes limitation). Each footnote marker creates a unique footnote.

### 6.3 Heading Hierarchy Behavior

Headings map to outline schema levels:
- `<h1>` → Level 1 (Section): I, II, III
- `<h2>` → Level 2 (Subsection): A, B, C
- `<h3>` → Level 3 (Point): 1, 2, 3
- `<h4>` → Level 4 (Subpoint): a, b, c
- etc.

### 6.4 Enter Key Behavior (Smart)

| Context | Enter Behavior |
|---------|---------------|
| End of heading | Create paragraph at same level |
| End of paragraph in list | Create next list item |
| Empty list item | Exit list, return to paragraph |
| End of blockquote | Continue blockquote |
| Double-enter in blockquote | Exit blockquote |

### 6.5 Promote/Demote Behavior

| Action | Keys | Behavior |
|--------|------|----------|
| Promote | Shift+Tab | Move heading AND all children up one level |
| Demote | Tab | Move heading AND all children down one level |

When promoting/demoting:
- Renumber affected sections according to outline schema
- Renumber all subsequent siblings

### 6.6 Paste Handling

All pasted content is sanitized:
- Strip all inline styles
- Preserve only: bold, italic, underline, headings, lists, links
- Convert Word-style formatting to semantic HTML
- Normalize whitespace

### 6.7 Image Handling

#### Image Storage Architecture

**Storage Backend: IndexedDB**

Images are stored as binary blobs in IndexedDB to avoid localStorage quota limits (5-10MB total). This allows storage of multiple high-resolution images without crashing the application.

**IndexedDB Schema:**

```typescript
interface ImageStore {
  id: string;              // UUID generated on upload
  evidence_id: string;     // Links to Evidence.id
  blob: Blob;              // Binary image data
  filename: string;
  mime_type: string;       // image/jpeg, image/png, etc.
  size: number;            // Bytes
  uploaded_at: string;     // ISO timestamp
  thumbnail?: Blob;        // Optional 200x200 thumbnail for UI
}
```

**Database Name:** `factsway_storage`
**Object Store:** `images`
**Key Path:** `id`
**Indexes:**
- `evidence_id` (non-unique) - for querying all images for a piece of evidence

**Storage Limits:**

- Max image size: 5MB per image
- Max total storage: Browser-dependent (typically 50-100MB minimum)
- Quota exceeded: Show error, suggest deleting old images

**Upload Flow:**

```typescript
async function uploadImage(file: File, evidence_id: string): Promise<string> {
  // Validate size
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image must be under 5MB');
  }

  // Generate UUID
  const id = uuidv4();

  // Create thumbnail (200x200 max)
  const thumbnail = await createThumbnail(file);

  // Store in IndexedDB
  const db = await openImageDatabase();
  const transaction = db.transaction(['images'], 'readwrite');
  const store = transaction.objectStore('images');

  const imageRecord: ImageStore = {
    id,
    evidence_id,
    blob: file,
    filename: file.name,
    mime_type: file.type,
    size: file.size,
    uploaded_at: new Date().toISOString(),
    thumbnail,
  };

  await store.add(imageRecord);

  return id;  // Return image ID for citation insertion
}
```

**Retrieval Flow:**

```typescript
async function getImage(id: string): Promise<ImageStore | null> {
  const db = await openImageDatabase();
  const transaction = db.transaction(['images'], 'readonly');
  const store = transaction.objectStore('images');

  return await store.get(id);
}

async function getImagesByEvidence(evidence_id: string): Promise<ImageStore[]> {
  const db = await openImageDatabase();
  const transaction = db.transaction(['images'], 'readonly');
  const store = transaction.objectStore('images');
  const index = store.index('evidence_id');

  return await index.getAll(evidence_id);
}
```

**Display in Editor:**

When displaying images in the Tiptap editor, convert blob to object URL:

```typescript
const imageRecord = await getImage(image_id);
if (imageRecord) {
  const objectURL = URL.createObjectURL(imageRecord.blob);
  // Use objectURL in <img> tag
  // Remember to revoke URL when component unmounts: URL.revokeObjectURL(objectURL)
}
```

**Thumbnail Display:**

For Evidence sidebar and image galleries, use thumbnails for performance:

```typescript
const imageRecord = await getImage(image_id);
if (imageRecord && imageRecord.thumbnail) {
  const thumbnailURL = URL.createObjectURL(imageRecord.thumbnail);
  // Use in gallery view
}
```

**Deletion:**

```typescript
async function deleteImage(id: string): Promise<void> {
  const db = await openImageDatabase();
  const transaction = db.transaction(['images'], 'readwrite');
  const store = transaction.objectStore('images');

  await store.delete(id);
}
```

**Migration from localStorage (if exists):**

If migrating from old base64 localStorage implementation:

```typescript
async function migrateImagesFromLocalStorage(): Promise<void> {
  const oldImages = JSON.parse(localStorage.getItem('images') || '[]');

  for (const oldImage of oldImages) {
    // Convert base64 to Blob
    const blob = base64ToBlob(oldImage.data, oldImage.mime_type);

    // Store in IndexedDB
    const file = new File([blob], oldImage.filename, { type: oldImage.mime_type });
    await uploadImage(file, oldImage.evidence_id);
  }

  // Clear old localStorage
  localStorage.removeItem('images');
}
```

**Validation:**
```typescript
function validateImageUpload(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only PNG and JPEG images are supported' };
  }

  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'Image must be smaller than 5MB' };
  }

  return { valid: true };
}
```

**Export Processing:**

Images are extracted from IndexedDB blobs to temporary files before Pandoc conversion. See Section 13.4.5 for the preprocessing pipeline.

### 6.8 Tiptap Extensions

#### Paragraph Extension (UUID Support)

ProseMirror's default paragraph node extended with UUID for stable sentence addressing.

**Extension Configuration:**
```typescript
import { Paragraph } from '@tiptap/extension-paragraph';
import { v4 as uuidv4 } from 'uuid';

const ParagraphWithUUID = Paragraph.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      paragraph_id: {
        default: null,
        parseHTML: element => element.getAttribute('data-paragraph-id'),
        renderHTML: attributes => {
          if (!attributes.paragraph_id) {
            return {};
          }
          return {
            'data-paragraph-id': attributes.paragraph_id,
          };
        },
      },
    };
  },

  onCreate() {
    // Generate UUID for new paragraphs on document load/creation
    const { editor } = this;

    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'paragraph' && !node.attrs.paragraph_id) {
        const uuid = uuidv4();
        editor.commands.updateAttributes('paragraph', { paragraph_id: uuid });
      }
    });
  },
});

export default ParagraphWithUUID;
```

**UUID Generation:**

- New paragraphs: Generate UUID on creation via `uuidv4()`
- Imported documents: Generate UUIDs during first parse if missing
- Split paragraphs: New paragraph gets new UUID
- Merged paragraphs: Keep UUID of first paragraph

**Persistence:**

The `paragraph_id` is stored in the ProseMirror JSON:
```json
{
  "type": "paragraph",
  "attrs": {
    "paragraph_id": "a3f2b1c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c"
  },
  "content": [
    { "type": "text", "text": "This is a paragraph." }
  ]
}
```

**Integration with Sentence Parser:**

When `sentence_parser.py` is called:
1. Extract `paragraph_id` from each paragraph node
2. Pass to `parse_sentences(paragraph_text, paragraph_id, ...)`
3. Sentence IDs become `s-{paragraph_id}-{index}`

#### Citation System

Citations are first-class interactive objects in the editor, not plain text. They enable linking claims to evidence with automatic marker computation.

**Citation Types:**

| Type | Example Display | Target | Status |
|------|-----------------|--------|--------|
| `exhibit` | (Exhibit A) | Case exhibit file | ✅ Implemented |
| `caselaw` | *Smith v. Jones*, 123 S.W.3d 456 | Case law database | 🔮 Future |
| `statute` | TEX. R. CIV. P. 196.1 | Statute database | 🔮 Future |
| `record` | (R. at 45) | Court record reference | 🔮 Future |

**Display Modes:**

| Mode | Rendered Output | Use Case |
|------|-----------------|----------|
| `inline` | (Exhibit A) | Citation at end of sentence |
| `parenthetical` | See Exhibit A | Introductory reference |
| `textual` | Exhibit A shows that... | Citation as sentence subject |

**Tiptap Extension Configuration:**
```typescript
import { Node, mergeAttributes } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import CitationNodeView from './CitationNodeView.vue';

export const Citation = Node.create({
  name: 'citation',

  group: 'inline',
  inline: true,
  atom: true,  // Treated as single unit, not editable internally

  addAttributes() {
    return {
      id: {
        default: () => `cit-${crypto.randomUUID()}`,
      },
      evidenceType: {
        default: 'exhibit',
      },
      evidenceId: {
        default: null,  // null = unlinked
      },
      displayMode: {
        default: 'inline',
      },
      supportsSentenceIds: {
        default: [],
        parseHTML: element => {
          const attr = element.getAttribute('data-sentence-ids');
          return attr ? JSON.parse(attr) : [];
        },
        renderHTML: attributes => {
          if (!attributes.supportsSentenceIds || attributes.supportsSentenceIds.length === 0) {
            return {};
          }
          return {
            'data-sentence-ids': JSON.stringify(attributes.supportsSentenceIds),
          };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-citation]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-citation': '' }), 0];
  },

  addNodeView() {
    return VueNodeViewRenderer(CitationNodeView);
  },

  addCommands() {
    return {
      insertCitation: (attrs) => ({ commands }) => {
        return commands.insertContent({
          type: 'citation',
          attrs,
        });
      },

      updateCitationTarget: (citationId, evidenceId) => ({ tr, state }) => {
        state.doc.descendants((node, pos) => {
          if (node.type.name === 'citation' && node.attrs.id === citationId) {
            tr.setNodeMarkup(pos, null, { ...node.attrs, evidenceId: evidenceId });
            return false;  // Stop traversal
          }
        });
        return true;
      },
    };
  },
});
```

#### Sentence ID Support in Citations

Citations can reference specific sentences in the document using sentence IDs from the Sentence Registry (Section 2.9).

**Citation with Sentence IDs:**

```json
{
  "type": "citation",
  "attrs": {
    "evidence_id": "EV-001",
    "citation_text": "[1]",
    "sentence_ids": [
      "s-a3f2b1c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c-001",
      "s-a3f2b1c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c-002"
    ]
  }
}
```

**Rendering:**

The citation renders with a `data-sentence-ids` attribute:

```html
<span class="citation"
      data-evidence-id="EV-001"
      data-sentence-ids='["s-a3f2b1c4-...-001","s-a3f2b1c4-...-002"]'>
  [1]
</span>
```

**Use Cases:**

1. **Sentence Highlighting:** When user hovers over citation, highlight the referenced sentences in the editor
2. **Navigation:** Click citation → scroll to and highlight first referenced sentence
3. **Validation:** Detect if referenced sentences have been deleted or modified (orphaned citations)
4. **AI Verification:** Pass specific sentence IDs to LLM for citation verification

**Inserting Citation with Sentence IDs:**

```typescript
editor.commands.insertContent({
  type: 'citation',
  attrs: {
    evidence_id: 'EV-001',
    citation_text: '[1]',
    supportsSentenceIds: ['s-a3f2b1c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c-001'],
  },
});
```

**Automatic Population:**

When user inserts a citation:
1. Determine cursor position in document
2. Look up which sentence(s) cursor is within (via Sentence Registry)
3. Auto-populate `sentence_ids` with the current sentence

```typescript
function getCurrentSentenceId(editor: Editor): string | null {
  const { from } = editor.state.selection;

  // Get paragraph at cursor
  const paragraph = editor.state.doc.nodeAt(from);
  const paragraphId = paragraph?.attrs.paragraph_id;

  if (!paragraphId) return null;

  // Get text offset within paragraph
  const paragraphPos = /* calculate paragraph start position */;
  const offsetInParagraph = from - paragraphPos;

  // Query sentence registry
  const sentenceRegistry = getSentenceRegistry();
  const sentences = sentenceRegistry.sentences_by_paragraph[paragraphId] || [];

  // Find sentence containing this offset
  for (const sentence of sentences) {
    if (offsetInParagraph >= sentence.startOffset &&
        offsetInParagraph <= sentence.endOffset) {
      return sentence.id;
    }
  }

  return null;
}
```

**Orphaned Citation Detection:**

See Section 2.9.3 for handling citations that reference deleted/modified sentences.

### 6.9 Citation Node View Component

The Vue component renders citations with visual state and click interaction.
```vue
<!-- CitationNodeView.vue -->
<template>
  <NodeViewWrapper
    as="span"
    class="citation-node"
    :class="{
      'citation-linked': isLinked,
      'citation-unlinked': !isLinked,
      'citation-selected': selected,
    }"
    @click="handleClick"
  >
    <span class="citation-marker">{{ displayText }}</span>
    <span v-if="!isLinked" class="citation-warning" title="Click to link exhibit">
      ⚠️
    </span>
  </NodeViewWrapper>
</template>

<script setup>
import { computed } from 'vue';
import { NodeViewWrapper } from '@tiptap/vue-3';
import { useCitationIndex } from '../composables/useCitationIndex';
import { useExhibitModal } from '../composables/useExhibitModal';

const props = defineProps({
  node: Object,
  selected: Boolean,
  updateAttributes: Function,
});

const { getMarker } = useCitationIndex();
const { openExhibitModal } = useExhibitModal();

const isLinked = computed(() => props.node.attrs.evidenceId !== null);

const displayText = computed(() => {
  const { evidenceType, evidenceId, displayMode } = props.node.attrs;

  if (evidenceType === 'exhibit') {
    const marker = evidenceId ? getMarker(evidenceId) : '?';

    switch (displayMode) {
      case 'inline':
        return `(Exhibit ${marker})`;
      case 'parenthetical':
        return `See Exhibit ${marker}`;
      case 'textual':
        return `Exhibit ${marker}`;
      default:
        return `(Exhibit ${marker})`;
    }
  }

  // Future: handle other citation types
  return '[Citation]';
});

function handleClick() {
  if (!isLinked.value) {
    // Open modal to link exhibit
    openExhibitModal({
      citationId: props.node.attrs.id,
      onSelect: (exhibitId) => {
        props.updateAttributes({ evidenceId: exhibitId });
      },
    });
  } else {
    // Open popover showing linked exhibit details
    // (Implemented in 6.10)
  }
}
</script>

<style scoped>
.citation-node {
  display: inline;
  cursor: pointer;
  border-radius: 3px;
  padding: 0 2px;
  transition: background-color 0.15s;
}

.citation-linked {
  background-color: #EFF6FF;
  color: #1D4ED8;
}

.citation-linked:hover {
  background-color: #DBEAFE;
}

.citation-unlinked {
  background-color: #FEF3C7;
  color: #92400E;
}

.citation-unlinked:hover {
  background-color: #FDE68A;
}

.citation-selected {
  outline: 2px solid #2563EB;
  outline-offset: 1px;
}

.citation-warning {
  margin-left: 2px;
  font-size: 0.75em;
}

.citation-marker {
  font-style: italic;
}
</style>
```

### 6.10 Citation Popover (Linked Citations)

When clicking a linked citation, show a popover with exhibit details.
```
┌─────────────────────────────────────────────────────────────┐
│  📎 Exhibit A                                          [×]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Signed Contract Agreement                                  │
│  contract.pdf (245 KB)                                      │
│  Uploaded: November 15, 2024                                │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  [PDF Preview Thumbnail]                                ││
│  │                                                         ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  [View Full]  [Replace]  [Unlink]  [Change Display ▼]      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Popover Actions:**

| Action | Behavior |
|--------|----------|
| View Full | Opens exhibit in new tab/modal for full viewing |
| Replace | Opens exhibit selection modal to choose different exhibit |
| Unlink | Sets `evidenceId: null`, citation shows warning state |
| Change Display | Dropdown to switch between inline/parenthetical/textual |

**Implementation:**
```typescript
// useCitationPopover.ts
import { ref, computed } from 'vue';
import { useFloating, offset, flip, shift } from '@floating-ui/vue';

export function useCitationPopover() {
  const isOpen = ref(false);
  const citationId = ref<string | null>(null);
  const referenceEl = ref<HTMLElement | null>(null);

  const { floatingStyles } = useFloating(referenceEl, {
    placement: 'bottom-start',
    middleware: [offset(8), flip(), shift()],
  });

  function openPopover(el: HTMLElement, id: string) {
    referenceEl.value = el;
    citationId.value = id;
    isOpen.value = true;
  }

  function closePopover() {
    isOpen.value = false;
    citationId.value = null;
  }

  return {
    isOpen,
    citationId,
    floatingStyles,
    openPopover,
    closePopover,
  };
}
```

### 6.11 Exhibit Selection Modal

Modal for linking citations to exhibits or uploading new exhibits.
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Link Exhibit                                                      [×]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─ EXISTING EXHIBITS ────────────────────────────────────────────────┐ │
│  │                                                                     │ │
│  │  ○ Exhibit A - Signed Contract (contract.pdf)                      │ │
│  │  ○ Exhibit B - Email Correspondence (emails.pdf)                   │ │
│  │  ○ Exhibit C - Invoice #1234 (invoice.pdf)                         │ │
│  │                                                                     │ │
│  │  [No exhibits yet - upload one below]                              │ │
│  │                                                                     │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ─── OR UPLOAD NEW ─────────────────────────────────────────────────── │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                                                                     ││
│  │     📁 Drag and drop file here, or click to browse                 ││
│  │        PDF, PNG, JPG up to 10MB                                    ││
│  │                                                                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  Label: [_______________________]  (e.g., "Signed Contract")           │
│                                                                         │
│                                         [Cancel]  [Link Selected]       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Modal Behavior:**

1. **On open:** Fetch case exhibits, display as radio list sorted by marker
2. **Select existing:** Radio selection enables "Link Selected" button
3. **Upload new:**
   - File uploaded and converted to base64
   - Added to case exhibits
   - Auto-selected in the list
   - User enters label (required)
4. **On confirm:** Citation's `target` attribute updated to selected exhibit ID
5. **On cancel:** No changes, modal closes

**File Validation:**

| Check | Requirement | Error Message |
|-------|-------------|---------------|
| File type | PDF, PNG, JPG, JPEG, GIF | "Only PDF and image files are supported" |
| File size | ≤ 10MB | "File must be smaller than 10MB" |
| Label | Required, non-empty | "Please enter a label for this exhibit" |

### 6.12 Inserting Citations

**Toolbar Button:**

Add citation button to toolbar with dropdown for citation type:
```
[📎 Citation ▼]
├── Insert Exhibit Citation
├── Insert Case Citation (coming soon)
└── Insert Statute Citation (coming soon)
```

**Keyboard Shortcut:**

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| Insert exhibit citation | Ctrl+Shift+E | Cmd+Shift+E |

**Auto-Detection (Future Enhancement):**

Detect when user types patterns like:
- `(Exhibit ` → Prompt to convert to citation node
- `See Exhibit ` → Prompt to convert to citation node

### 6.13 Citation Validation

Before export, validate all citations:
```typescript
interface CitationValidation {
  valid: boolean;
  warnings: CitationWarning[];
  errors: CitationError[];
}

interface CitationWarning {
  citationId: string;
  type: 'unlinked';
  message: string;
  location: { paragraph: number; offset: number };
}

interface CitationError {
  citationId: string;
  type: 'missing_exhibit' | 'invalid_target';
  message: string;
}

function validateCitations(
  document: ProseMirrorDocument,
  exhibits: Exhibit[]
): CitationValidation {
  const warnings: CitationWarning[] = [];
  const errors: CitationError[] = [];
  const exhibitIds = new Set(exhibits.map(e => e.id));

  let paragraphIndex = 0;

  function walk(node: any) {
    if (node.type === 'citation') {
      const { id, evidenceId, evidenceType } = node.attrs;

      if (!evidenceId) {
        warnings.push({
          citationId: id,
          type: 'unlinked',
          message: 'Citation is not linked to an exhibit',
          location: { paragraph: paragraphIndex, offset: 0 },
        });
      } else if (evidenceType === 'exhibit' && !exhibitIds.has(evidenceId)) {
        errors.push({
          citationId: id,
          type: 'missing_exhibit',
          message: 'Citation references a deleted exhibit',
        });
      }
    }

    if (node.type === 'paragraph') {
      paragraphIndex++;
    }

    if (node.content) {
      for (const child of node.content) {
        walk(child);
      }
    }
  }

  walk(document);

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}
```

**Pre-Export Warning:**

If validation finds unlinked citations, show confirmation:
```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️  Unlinked Citations                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  This document contains 2 citations that are not linked    │
│  to exhibits:                                               │
│                                                             │
│  • Paragraph 3: (Exhibit ?)                                 │
│  • Paragraph 7: See Exhibit ?                               │
│                                                             │
│  Unlinked citations will appear as "(Exhibit ?)" in the    │
│  exported document.                                         │
│                                                             │
│              [Go Back and Fix]  [Export Anyway]             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.14 Citation Detection

The editor detects citation patterns as users type and offers to convert them to linked citations.

**Detection is assistive, not automatic:** User controls all citation text. System only helps with linking.

**Detected Patterns:**

| Evidence Type | Patterns | Examples |
|---------------|----------|----------|
| Case Law | Reporter citations, "v." pattern | `123 S.W.3d 456`, `Smith v. Jones` |
| Statute | Section symbols, rule patterns | `§ 16.001`, `TEX. R. CIV. P. 196.1` |
| Exhibit | Exhibit references | `Exhibit A`, `Exhibit 1` |

**Case Law Patterns:**
```typescript
const CASE_LAW_PATTERNS = [
  // Reporter citations: volume + reporter + page
  /\d+\s+(S\.W\.(2d|3d)?|F\.(2d|3d|4th)?|U\.S\.|S\.\s*Ct\.|L\.\s*Ed\.(2d)?|Tex\.|So\.(2d|3d)?)\s+\d+/gi,

  // Case name with "v." or "vs."
  /[A-Z][a-zA-Z\s&,]+\s+v\.?\s+[A-Z][a-zA-Z\s&,]+/g,

  // Texas-specific reporters
  /\d+\s+(Tex\.\s*(App\.|Crim\.|Civ\.\s*App\.)?)\s+\d+/gi,
];
```

**Statute Patterns:**
```typescript
const STATUTE_PATTERNS = [
  // Texas Rules of Civil Procedure
  /TEX\.\s*R\.\s*CIV\.\s*P\.\s*\d+(\.\d+)?/gi,

  // Texas Rules of Appellate Procedure
  /TEX\.\s*R\.\s*APP\.\s*P\.\s*\d+(\.\d+)?/gi,

  // Texas Rules of Evidence
  /TEX\.\s*R\.\s*EVID\.\s*\d+/gi,

  // Federal Rules
  /FED\.\s*R\.\s*(CIV|CRIM|APP|EVID)\.\s*P\.\s*\d+(\([a-z]\))?/gi,

  // Texas statutes with section symbol
  /TEX\.\s*(CIV\.\s*PRAC\.\s*&\s*REM\.|FAM\.|PROP\.|BUS\.\s*&\s*COM\.)\s*CODE\s*(ANN\.\s*)?§?\s*\d+\.\d+/gi,

  // Generic section references
  /§\s*\d+(\.\d+)?(\([a-z0-9]+\))*/gi,
];
```

**Exhibit Patterns:**
```typescript
const EXHIBIT_PATTERNS = [
  // Exhibit with letter
  /Exhibit\s+[A-Z]+/gi,

  // Exhibit with number
  /Exhibit\s+\d+/gi,

  // Abbreviated
  /Ex\.\s*[A-Z0-9]+/gi,
];
```

**Detection UI Flow:**

1. **On typing:** System scans recent text for patterns
2. **Pattern found:** Subtle underline appears (dotted, light gray)
3. **User hovers:** Tooltip shows "Click to link to uploaded authority"
4. **User clicks:** Opens linking modal with pattern pre-highlighted

```
User types: "See Smith v. Jones, 123 S.W.3d 456 (Tex. App. 2024)."
                 └─────────────────────────────────────────────┘
                   Underlined, shows tooltip on hover

User clicks detected citation
                 ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  Link Citation                                                     [×]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Detected citation:                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ Smith v. Jones, 123 S.W.3d 456 (Tex. App. 2024)                    ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  Link to uploaded case law:                                             │
│                                                                         │
│  ○ Smith v. Jones opinion (smith_v_jones.pdf)                          │
│  ○ Doe v. State opinion (doe_v_state.pdf)                              │
│                                                                         │
│  ─── OR UPLOAD NEW ─────────────────────────────────────────────────── │
│                                                                         │
│  📁 Drag opinion PDF here, or click to browse                          │
│     Label: [Smith v. Jones                    ]                         │
│                                                                         │
│                                         [Skip]  [Link Citation]         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Tiptap Extension for Detection:**
```typescript
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

const citationDetectionKey = new PluginKey('citationDetection');

export const CitationDetection = Extension.create({
  name: 'citationDetection',

  addProseMirrorPlugins() {
    const editor = this.editor;

    return [
      new Plugin({
        key: citationDetectionKey,

        state: {
          init() {
            return DecorationSet.empty;
          },

          apply(tr, oldState) {
            // Recompute decorations on document change
            if (!tr.docChanged) return oldState;

            const decorations: Decoration[] = [];

            tr.doc.descendants((node, pos) => {
              if (node.isText) {
                const text = node.text || '';

                // Check each pattern type
                const matches = findCitationMatches(text);

                for (const match of matches) {
                  // Don't decorate if already a citation node
                  if (!isInsideCitation(tr.doc, pos + match.start)) {
                    decorations.push(
                      Decoration.inline(
                        pos + match.start,
                        pos + match.end,
                        {
                          class: 'detected-citation',
                          'data-citation-type': match.type,
                        }
                      )
                    );
                  }
                }
              }
            });

            return DecorationSet.create(tr.doc, decorations);
          },
        },

        props: {
          decorations(state) {
            return this.getState(state);
          },

          handleClick(view, pos, event) {
            const target = event.target as HTMLElement;

            if (target.classList.contains('detected-citation')) {
              const evidenceType = target.dataset.citationType;
              const text = target.textContent;

              // Open linking modal
              editor.commands.openCitationLinkingModal({
                detectedText: text,
                evidenceType: evidenceType,
                position: pos,
              });

              return true;
            }

            return false;
          },
        },
      }),
    ];
  },
});


function findCitationMatches(text: string): CitationMatch[] {
  const matches: CitationMatch[] = [];

  // Case law patterns
  for (const pattern of CASE_LAW_PATTERNS) {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(text)) !== null) {
      matches.push({
        type: 'caselaw',
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
      });
    }
  }

  // Statute patterns
  for (const pattern of STATUTE_PATTERNS) {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(text)) !== null) {
      matches.push({
        type: 'statute',
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
      });
    }
  }

  // Exhibit patterns
  for (const pattern of EXHIBIT_PATTERNS) {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(text)) !== null) {
      matches.push({
        type: 'exhibit',
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
      });
    }
  }

  // Remove overlapping matches (prefer longer match)
  return deduplicateMatches(matches);
}


function deduplicateMatches(matches: CitationMatch[]): CitationMatch[] {
  // Sort by start position, then by length (longer first)
  matches.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return (b.end - b.start) - (a.end - a.start);
  });

  const result: CitationMatch[] = [];
  let lastEnd = -1;

  for (const match of matches) {
    if (match.start >= lastEnd) {
      result.push(match);
      lastEnd = match.end;
    }
  }

  return result;
}


interface CitationMatch {
  type: 'caselaw' | 'statute' | 'exhibit';
  start: number;
  end: number;
  text: string;
}
```

**Styling for Detected Citations:**
```css
.detected-citation {
  border-bottom: 1px dotted #9CA3AF;
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s;
}

.detected-citation:hover {
  border-bottom-color: #3B82F6;
  background-color: #EFF6FF;
}

/* Tooltip on hover */
.detected-citation::after {
  content: 'Click to link';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #1F2937;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s;
}

.detected-citation:hover::after {
  opacity: 1;
}
```

**Converting Detected Text to Citation Node:**

When user confirms linking:
```typescript
function convertToCitationNode(
  editor: Editor,
  position: number,
  detectedText: string,
  evidenceType: 'exhibit' | 'caselaw' | 'statute',
  evidenceId: string
) {
  const { from, to } = findTextRange(editor.state.doc, position, detectedText);

  // Delete the plain text
  editor.chain()
    .focus()
    .deleteRange({ from, to })
    // Insert citation node
    .insertContentAt(from, {
      type: 'citation',
      attrs: {
        id: `cit-${crypto.randomUUID().slice(0, 8)}`,
        evidenceType,
        evidenceId,
        supportsSentenceIds: [],
        displayMode: 'inline',
      },
      // For case law and statutes, preserve the original text
      content: evidenceType !== 'exhibit' ? [
        {
          type: 'text',
          text: detectedText,
        }
      ] : undefined,
    })
    .run();
}
```

**Skip Behavior:**

If user clicks "Skip" on a detected citation:
- Detection decoration is removed for that text
- Text remains as plain text
- Pattern can be detected again if user edits the text

Skipped patterns are stored in session (not persisted):
```typescript
const skippedPatterns = new Set();

function skipCitation(text: string) {
  skippedPatterns.add(text);
}

// In findCitationMatches, filter out skipped:
matches = matches.filter(m => !skippedPatterns.has(m.text));
```

---

### 6.15 Variable Insertion

Users can insert template variables into the document body via two methods: toolbar dropdown or trigger character.

**Method 1: Toolbar Dropdown**

The "Insert" menu includes a "Variable" submenu:
```
Insert ▼
├── Image
├── Table
├── Footnote
├── Citation ▶
├── Cross-Reference ▶
└── Variable ▶
    ├── ── System ──
    ├── Today's Date
    ├── Filer Name
    ├── Filer Role
    ├── Cause Number
    ├── Motion Title
    ├── ── Template ──
    ├── Filing Date
    ├── Response Deadline
    └── [other template variables...]
```

**Method 2: Trigger Character**

Typing `{{` opens a suggestion popup (similar to mentions):
```
User types: "The response is due on {{"
                                      ↓
┌─────────────────────────────────────┐
│ 📅 Response Deadline                │ ← filtered by typing
│ 📅 Filing Date                      │
│ 📅 Today's Date                     │
│ 👤 Filer Name                       │
│ 📋 Cause Number                     │
└─────────────────────────────────────┘
```

User continues typing to filter: `{{resp` shows only "Response Deadline"

**Tiptap Extension:**
```typescript
import { Node, mergeAttributes } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import Suggestion from '@tiptap/suggestion';

export interface VariableAttributes {
  id: string;
  label: string;
  fallback?: string;
}

export const VariablePluginKey = new PluginKey('variable');

export const Variable = Node.create({
  name: 'variable',
  group: 'inline',
  inline: true,
  atom: true,              // Treat as single unit (non-editable interior)
  selectable: true,
  draggable: false,

  addOptions() {
    return {
      HTMLAttributes: { class: 'variable-node' },
      suggestion: {
        char: '{{',
        pluginKey: VariablePluginKey,
        items: ({ query, editor }) => {
          return getAvailableVariables(editor)
            .filter(v => v.label.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 10);
        },
        command: ({ editor, range, props }) => {
          editor.chain()
            .focus()
            .deleteRange(range)
            .insertContent({
              type: 'variable',
              attrs: {
                id: props.id,
                label: props.label,
                fallback: props.fallback,
              },
            })
            .run();
        },
        render: () => {
          // Return popup renderer (similar to mention extension)
          return {
            onStart: (props) => { /* show popup */ },
            onUpdate: (props) => { /* update popup */ },
            onKeyDown: (props) => { /* handle navigation */ },
            onExit: () => { /* hide popup */ },
          };
        },
      },
    };
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-id'),
        renderHTML: attributes => ({ 'data-id': attributes.id }),
      },
      label: {
        default: null,
        parseHTML: element => element.getAttribute('data-label'),
        renderHTML: attributes => ({ 'data-label': attributes.label }),
      },
      fallback: {
        default: null,
        parseHTML: element => element.getAttribute('data-fallback'),
        renderHTML: attributes => attributes.fallback
          ? { 'data-fallback': attributes.fallback }
          : {},
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-type="variable"]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const isUndefined = !hasVariableValue(node.attrs.id);

    return [
      'span',
      mergeAttributes(
        { 'data-type': 'variable' },
        this.options.HTMLAttributes,
        HTMLAttributes,
        isUndefined ? { class: 'variable-node undefined' } : {}
      ),
      node.attrs.label,
    ];
  },

  renderText({ node }) {
    // For clipboard/plain text export
    return `{{${node.attrs.id}}}`;
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});


function getAvailableVariables(editor: Editor): VariableAttributes[] {
  // System variables (always available)
  const systemVars: VariableAttributes[] = [
    { id: 'today', label: "Today's Date" },
    { id: 'filer_name', label: 'Filer Name' },
    { id: 'filer_role', label: 'Filer Role' },
    { id: 'cause_number', label: 'Cause Number' },
    { id: 'motion_title', label: 'Motion Title' },
  ];

  // Template-defined variables (from editor storage or props)
  const templateVars = editor.storage.template?.variables || [];

  return [
    ...systemVars,
    ...templateVars.map(v => ({
      id: v.name,
      label: v.displayName,
      fallback: v.defaultValue,
    })),
  ];
}
```

**Suggestion Popup Component:**
```vue
<!-- VariableSuggestion.vue -->
<template>
  <div class="variable-suggestion" v-if="items.length">
    <button
      v-for="(item, index) in items"
      :key="item.id"
      :class="{ 'is-selected': index === selectedIndex }"
      @click="selectItem(index)"
    >
      <span class="variable-icon">{{ getIcon(item.id) }}</span>
      <span class="variable-label">{{ item.label }}</span>
    </button>
  </div>
</template>

<script setup>
const props = defineProps(['items', 'command']);
const selectedIndex = ref(0);

function selectItem(index) {
  const item = props.items[index];
  if (item) {
    props.command(item);
  }
}

function getIcon(id) {
  if (['today', 'filing_date', 'response_deadline'].some(d => id.includes(d) || id.includes('date'))) {
    return '📅';
  }
  if (['filer_name', 'filer_role'].includes(id)) {
    return '👤';
  }
  return '📋';
}

// Keyboard navigation
function onKeyDown({ event }) {
  if (event.key === 'ArrowUp') {
    selectedIndex.value = (selectedIndex.value - 1 + props.items.length) % props.items.length;
    return true;
  }
  if (event.key === 'ArrowDown') {
    selectedIndex.value = (selectedIndex.value + 1) % props.items.length;
    return true;
  }
  if (event.key === 'Enter') {
    selectItem(selectedIndex.value);
    return true;
  }
  return false;
}

defineExpose({ onKeyDown });
</script>

<style scoped>
.variable-suggestion {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px;
  min-width: 200px;
}

.variable-suggestion button {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-align: left;
}

.variable-suggestion button:hover,
.variable-suggestion button.is-selected {
  background-color: #F3F4F6;
}

.variable-icon {
  font-size: 14px;
}

.variable-label {
  font-size: 14px;
  color: #374151;
}
</style>
```

---

## 8. Section Hierarchy System

### 7.1 Outline Schema Configuration

```typescript
// Example: Texas Standard
{
  name: "Texas Standard",
  sequential_paragraph_mode: false,
  levels: [
    {
      level: 1,
      name: "Section",
      format: "roman_upper",        // I, II, III
      style: { alignment: "center", bold: true, caps: true, underline: false },
      restart_on: null,
      indent_inches: 0
    },
    {
      level: 2,
      name: "Subsection", 
      format: "alpha_upper",        // A, B, C
      style: { alignment: "left", bold: true, caps: false, underline: false },
      restart_on: 1,
      indent_inches: 0
    },
    {
      level: 3,
      name: "Point",
      format: "numeric",            // 1, 2, 3
      style: { alignment: "left", bold: true, caps: false, underline: false },
      restart_on: 2,
      indent_inches: 0.5
    },
    {
      level: 4,
      name: "Subpoint",
      format: "alpha_lower",        // a, b, c
      style: { alignment: "left", bold: false, caps: false, underline: false },
      restart_on: 3,
      indent_inches: 1.0
    }
  ]
}
```

### 7.2 Numbering Format Options

| Format | Output |
|--------|--------|
| `roman_upper` | I, II, III, IV, V... |
| `roman_lower` | i, ii, iii, iv, v... |
| `alpha_upper` | A, B, C, D, E... |
| `alpha_lower` | a, b, c, d, e... |
| `numeric` | 1, 2, 3, 4, 5... |
| `bullet` | • (no number) |
| `none` | (no number or bullet) |

### 7.3 Sequential Paragraph Mode

When `sequential_paragraph_mode: true`:
- Every paragraph (not just headings) gets a number
- Numbers continue through entire document: 1, 2, 3... 47, 48, 49
- Section headings still appear but don't restart numbering
- Common in some federal court filings

### 7.4 Auto-Renumbering Rules

When a section is added, removed, or moved:
1. Identify the parent level
2. Recalculate numbers for all siblings at that level
3. Recursively renumber children if their `restart_on` matches the changed level

---

## 9. Footer & Page Numbering

### 8.1 Three-Column Layout

```
┌──────────────────┬──────────────────┬──────────────────┐
│       LEFT       │      CENTER      │      RIGHT       │
│    (33% width)   │    (34% width)   │    (33% width)   │
├──────────────────┼──────────────────┼──────────────────┤
│  Motion Title    │    (empty)       │    Page 1        │
│  (wraps if long) │                  │                  │
└──────────────────┴──────────────────┴──────────────────┘
```

### 8.2 Left Column Content Options

| Option | Content |
|--------|---------|
| `motion_title` | Draft.motion_title (default) - wraps to multiple lines if needed |
| `case_style` | "Doe v. ACME Corp" |
| `custom` | User-specified text |
| `none` | Empty |

### 8.3 Page Number Format Options

| Format | Example |
|--------|---------|
| `number_only` | 1, 2, 3 (default) |
| `page_x` | Page 1, Page 2 |
| `page_x_of_y` | Page 1 of 5 |

### 8.4 First Page Handling

- First page IS numbered (no special handling by default)
- Template option `first_page_different: boolean` can enable unnumbered first page
- When enabled, uses Word's "Different First Page" section setting

### 8.5 Footer OOXML Implementation

Footers must be generated via OOXML to ensure table-based layout works correctly.

**Python Implementation:**
```python
from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.text import WD_ALIGN_PARAGRAPH

def add_three_column_footer(document: Document, left_text: str, page_format: str = "number_only"):
    """
    Add footer with wrapping left text and right-aligned page number.

    Args:
        document: python-docx Document
        left_text: Text for left column (e.g., motion title)
        page_format: "number_only" | "page_x" | "page_x_of_y"
    """
    section = document.sections[0]
    footer = section.footer
    footer.is_linked_to_previous = False

    # Clear any existing footer content
    for para in footer.paragraphs:
        p = para._element
        p.getparent().remove(p)

    # Create table
    tbl = create_footer_table(left_text, page_format)
    footer._element.append(tbl)

def create_footer_table(left_text: str, page_format: str) -> OxmlElement:
    """Generate the OOXML for a three-column footer table."""

    # Namespace
    nsmap = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

    # Table element
    tbl = OxmlElement('w:tbl')

    # Table properties
    tblPr = OxmlElement('w:tblPr')

    # Full width (100%)
    tblW = OxmlElement('w:tblW')
    tblW.set(qn('w:w'), '5000')
    tblW.set(qn('w:type'), 'pct')
    tblPr.append(tblW)

    # No borders
    tblBorders = OxmlElement('w:tblBorders')
    for border_name in ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']:
        border = OxmlElement(f'w:{border_name}')
        border.set(qn('w:val'), 'nil')
        tblBorders.append(border)
    tblPr.append(tblBorders)

    # Fixed layout
    tblLayout = OxmlElement('w:tblLayout')
    tblLayout.set(qn('w:type'), 'fixed')
    tblPr.append(tblLayout)

    tbl.append(tblPr)

    # Column grid: 50% | 20% | 30% of 9360 twips (6.5" printable width)
    tblGrid = OxmlElement('w:tblGrid')
    for width in [4680, 1872, 2808]:  # twips
        gridCol = OxmlElement('w:gridCol')
        gridCol.set(qn('w:w'), str(width))
        tblGrid.append(gridCol)
    tbl.append(tblGrid)

    # Single row
    tr = OxmlElement('w:tr')

    # Left cell - motion title (wraps naturally)
    tc_left = create_text_cell(left_text, 4680, 'left')
    tr.append(tc_left)

    # Center cell - empty
    tc_center = create_text_cell('', 1872, 'center')
    tr.append(tc_center)

    # Right cell - page number field
    tc_right = create_page_number_cell(2808, page_format)
    tr.append(tc_right)

    tbl.append(tr)
    return tbl

def create_text_cell(text: str, width: int, align: str) -> OxmlElement:
    """Create a table cell with text."""
    tc = OxmlElement('w:tc')

    # Cell properties
    tcPr = OxmlElement('w:tcPr')
    tcW = OxmlElement('w:tcW')
    tcW.set(qn('w:w'), str(width))
    tcW.set(qn('w:type'), 'dxa')
    tcPr.append(tcW)
    tc.append(tcPr)

    # Paragraph with text
    p = OxmlElement('w:p')

    # Alignment
    if align != 'left':
        pPr = OxmlElement('w:pPr')
        jc = OxmlElement('w:jc')
        jc.set(qn('w:val'), align)
        pPr.append(jc)
        p.append(pPr)

    if text:
        r = OxmlElement('w:r')

        # Smaller font for footer
        rPr = OxmlElement('w:rPr')
        sz = OxmlElement('w:sz')
        sz.set(qn('w:val'), '20')  # 10pt
        rPr.append(sz)
        r.append(rPr)

        t = OxmlElement('w:t')
        t.text = text
        r.append(t)
        p.append(r)

    tc.append(p)
    return tc

def create_page_number_cell(width: int, page_format: str) -> OxmlElement:
    """Create a table cell with page number field."""
    tc = OxmlElement('w:tc')

    # Cell properties
    tcPr = OxmlElement('w:tcPr')
    tcW = OxmlElement('w:tcW')
    tcW.set(qn('w:w'), str(width))
    tcW.set(qn('w:type'), 'dxa')
    tcPr.append(tcW)
    tc.append(tcPr)

    # Paragraph - right aligned
    p = OxmlElement('w:p')
    pPr = OxmlElement('w:pPr')
    jc = OxmlElement('w:jc')
    jc.set(qn('w:val'), 'right')
    pPr.append(jc)
    p.append(pPr)

    # Build page number based on format
    if page_format == 'page_x':
        # "Page " text
        r_text = OxmlElement('w:r')
        rPr = OxmlElement('w:rPr')
        sz = OxmlElement('w:sz')
        sz.set(qn('w:val'), '20')
        rPr.append(sz)
        r_text.append(rPr)
        t = OxmlElement('w:t')
        t.text = 'Page '
        t.set(qn('xml:space'), 'preserve')
        r_text.append(t)
        p.append(r_text)

    # PAGE field
    add_page_field(p)

    if page_format == 'page_x_of_y':
        # " of " text
        r_of = OxmlElement('w:r')
        rPr = OxmlElement('w:rPr')
        sz = OxmlElement('w:sz')
        sz.set(qn('w:val'), '20')
        rPr.append(sz)
        r_of.append(rPr)
        t = OxmlElement('w:t')
        t.text = ' of '
        t.set(qn('xml:space'), 'preserve')
        r_of.append(t)
        p.append(r_of)

        # NUMPAGES field
        add_numpages_field(p)

    tc.append(p)
    return tc

def add_page_field(paragraph: OxmlElement) -> None:
    """Add PAGE field to paragraph."""
    # Field begin
    r_begin = OxmlElement('w:r')
    fldChar_begin = OxmlElement('w:fldChar')
    fldChar_begin.set(qn('w:fldCharType'), 'begin')
    r_begin.append(fldChar_begin)
    paragraph.append(r_begin)

    # Field instruction
    r_instr = OxmlElement('w:r')
    instrText = OxmlElement('w:instrText')
    instrText.text = ' PAGE '
    r_instr.append(instrText)
    paragraph.append(r_instr)

    # Field separator
    r_sep = OxmlElement('w:r')
    fldChar_sep = OxmlElement('w:fldChar')
    fldChar_sep.set(qn('w:fldCharType'), 'separate')
    r_sep.append(fldChar_sep)
    paragraph.append(r_sep)

    # Field result (placeholder)
    r_result = OxmlElement('w:r')
    rPr = OxmlElement('w:rPr')
    sz = OxmlElement('w:sz')
    sz.set(qn('w:val'), '20')
    rPr.append(sz)
    r_result.append(rPr)
    t = OxmlElement('w:t')
    t.text = '1'
    r_result.append(t)
    paragraph.append(r_result)

    # Field end
    r_end = OxmlElement('w:r')
    fldChar_end = OxmlElement('w:fldChar')
    fldChar_end.set(qn('w:fldCharType'), 'end')
    r_end.append(fldChar_end)
    paragraph.append(r_end)

def add_numpages_field(paragraph: OxmlElement) -> None:
    """Add NUMPAGES field to paragraph."""
    # Same structure as PAGE field but with NUMPAGES instruction
    r_begin = OxmlElement('w:r')
    fldChar_begin = OxmlElement('w:fldChar')
    fldChar_begin.set(qn('w:fldCharType'), 'begin')
    r_begin.append(fldChar_begin)
    paragraph.append(r_begin)

    r_instr = OxmlElement('w:r')
    instrText = OxmlElement('w:instrText')
    instrText.text = ' NUMPAGES '
    r_instr.append(instrText)
    paragraph.append(r_instr)

    r_sep = OxmlElement('w:r')
    fldChar_sep = OxmlElement('w:fldChar')
    fldChar_sep.set(qn('w:fldCharType'), 'separate')
    r_sep.append(fldChar_sep)
    paragraph.append(r_sep)

    r_result = OxmlElement('w:r')
    rPr = OxmlElement('w:rPr')
    sz = OxmlElement('w:sz')
    sz.set(qn('w:val'), '20')
    rPr.append(sz)
    r_result.append(rPr)
    t = OxmlElement('w:t')
    t.text = '1'
    r_result.append(t)
    paragraph.append(r_result)

    r_end = OxmlElement('w:r')
    fldChar_end = OxmlElement('w:fldChar')
    fldChar_end.set(qn('w:fldCharType'), 'end')
    r_end.append(fldChar_end)
    paragraph.append(r_end)
```

### 8.6 Footer Integration Notes

**Critical Gotchas:**

1. **Never assign `paragraph.text` directly**—this destroys field codes. Always use runs.

2. **Each section can have different footers.** For documents with multiple sections, iterate through `document.sections` and set each footer.

3. **Unlinking footers:** Set `section.footer.is_linked_to_previous = False` to allow different footer content per section.

4. **First page footer:** To have a different (or no) footer on the first page:
```python
   section.different_first_page_header_footer = True
   first_footer = section.first_page_footer
   # Leave first_footer empty for no footer on page 1
```

---

## 10. Document Parsing Rules

### 9.1 Extraction Strategy

**Phase 1: Deterministic Extraction (Regex/Pattern)**
- Court designation: `/IN THE .* COURT/i`
- Cause number: `/CAUSE NO\.?\s*[\d\-A-Z]+/i` or `/NO\.\s*[\d\-A-Z]+/i`
- Party block: Lines containing "§" OR lines with "v." / "vs."
- Motion title: Centered, caps text after party block, before salutation

**Phase 2: LLM Semantic Detection**
- Identify where salutation ends and body begins
- Prompt: "Identify the line number where this document transitions from procedural introduction to substantive argument"

**Phase 3: Structure Extraction (Body) - XML Metadata Detection**

Section headings are detected using DOCX XML metadata, NOT text pattern matching. This provides author-intent detection that is more reliable than regex patterns.

**XML Metadata Attributes:**

Word documents encode outline structure in numbering.xml and paragraph properties. Each paragraph has:

- **numFormat** - Numbering format: upperRoman, lowerRoman, decimal, upperLetter, lowerLetter, bullet, none
- **ilvl** - Indentation level: 0-8 (0 = top level)
- **pStyle** - Paragraph style: Heading1, Heading2, Normal, etc.

**Detection Rules:**

| Attribute Combination | Section Level | Display Format |
|----------------------|---------------|----------------|
| numFormat=upperRoman, ilvl=0 | Level 1 | I, II, III, IV |
| numFormat=upperLetter, ilvl=1 | Level 2 | A, B, C, D |
| numFormat=decimal, ilvl=1 | Level 2 | 1, 2, 3, 4 |
| numFormat=lowerLetter, ilvl=2 | Level 3 | a, b, c, d |
| pStyle=Heading1 | Level 1 | (inherit numFormat) |
| pStyle=Heading2 | Level 2 | (inherit numFormat) |

**Implementation Strategy:**

```python
from lxml import etree
from docx import Document
from typing import List, Dict

def extract_section_hierarchy(docx_path: str) -> List[Dict]:
    """
    Extract section hierarchy using XML metadata.

    Returns list of sections with detected level and number format.
    """
    doc = Document(docx_path)
    sections = []

    for i, paragraph in enumerate(doc.paragraphs):
        # Access the underlying XML element
        p_element = paragraph._element

        # Extract numbering properties
        pPr = p_element.find('.//{http://schemas.openxmlformats.org/wordprocessingml/2006/main}pPr')

        if pPr is None:
            continue

        numPr = pPr.find('.//{http://schemas.openxmlformats.org/wordprocessingml/2006/main}numPr')

        if numPr is not None:
            # Has numbering - likely a section heading
            ilvl = numPr.find('.//{http://schemas.openxmlformats.org/wordprocessingml/2006/main}ilvl')
            numId = numPr.find('.//{http://schemas.openxmlformats.org/wordprocessingml/2006/main}numId')

            level = int(ilvl.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val')) if ilvl is not None else 0
            num_id = numId.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val') if numId is not None else None

            # Lookup numbering format from numbering.xml
            num_format = get_numbering_format(doc, num_id, level)

            sections.append({
                'paragraph_index': i,
                'text': paragraph.text,
                'level': level + 1,  # Convert to 1-indexed
                'num_format': num_format,
                'style': paragraph.style.name if paragraph.style else 'Normal'
            })

    return sections


def get_numbering_format(doc: Document, num_id: str, ilvl: int) -> str:
    """
    Lookup numbering format from numbering.xml.

    Args:
        doc: python-docx Document object
        num_id: Numbering definition ID
        ilvl: Indentation level

    Returns:
        Format string: 'upperRoman', 'decimal', 'upperLetter', etc.
    """
    if num_id is None:
        return 'none'

    # Access numbering part
    numbering_part = doc.part.numbering_part
    if numbering_part is None:
        return 'none'

    # Parse numbering.xml
    numbering_root = numbering_part.element

    # Find abstractNum for this numId
    num_element = numbering_root.find(
        f'.//{{http://schemas.openxmlformats.org/wordprocessingml/2006/main}}num[@{{http://schemas.openxmlformats.org/wordprocessingml/2006/main}}numId="{num_id}"]'
    )

    if num_element is None:
        return 'none'

    abstractNumId_element = num_element.find(
        './/{http://schemas.openxmlformats.org/wordprocessingml/2006/main}abstractNumId'
    )

    if abstractNumId_element is None:
        return 'none'

    abstractNumId = abstractNumId_element.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val')

    # Find the level definition
    abstractNum = numbering_root.find(
        f'.//{{http://schemas.openxmlformats.org/wordprocessingml/2006/main}}abstractNum[@{{http://schemas.openxmlformats.org/wordprocessingml/2006/main}}abstractNumId="{abstractNumId}"]'
    )

    if abstractNum is None:
        return 'none'

    lvl_element = abstractNum.find(
        f'.//{{http://schemas.openxmlformats.org/wordprocessingml/2006/main}}lvl[@{{http://schemas.openxmlformats.org/wordprocessingml/2006/main}}ilvl="{ilvl}"]'
    )

    if lvl_element is None:
        return 'none'

    numFmt_element = lvl_element.find(
        './/{http://schemas.openxmlformats.org/wordprocessingml/2006/main}numFmt'
    )

    if numFmt_element is None:
        return 'none'

    return numFmt_element.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val')


def build_section_tree(sections: List[Dict]) -> List[Dict]:
    """
    Convert flat section list to hierarchical tree.

    Each section becomes a SectionNode with children.
    """
    tree = []
    stack = []  # Track parent nodes at each level

    for section in sections:
        level = section['level']

        node = {
            'id': f"sec-{section['paragraph_index']:04d}",  # Stable ID
            'level': level,
            'title': section['text'],
            'num_format': section['num_format'],
            'children': []
        }

        # Find parent
        while stack and stack[-1]['level'] >= level:
            stack.pop()

        if stack:
            # Add as child of parent
            stack[-1]['children'].append(node)
        else:
            # Top-level section
            tree.append(node)

        stack.append(node)

    return tree
```

**Why XML Metadata Over Regex:**

| Approach | Reliability | Handles Edge Cases |
|----------|-------------|-------------------|
| Regex pattern matching | ~60% accurate | No - fails on unusual formatting |
| Text formatting (bold/caps) | ~70% accurate | No - inconsistent author formatting |
| XML metadata | 95%+ accurate | Yes - captures author's structural intent |

**Edge Cases Handled:**

- **Non-sequential numbering**: User skips from "I" to "III" → Detected correctly via ilvl
- **Mixed formats**: Document uses both Roman numerals and letters → Each detected via numFormat
- **Restart numbering**: Section "A" appears twice → Detected via numId change
- **Unnumbered headings**: Heading1 style with no number → Detected via pStyle, level inferred

**Integration with Phase 2:**

After LLM detects body start line:

1. Extract all paragraphs from body_start to signature_start
2. Run XML metadata detection on each paragraph
3. Build hierarchical SectionNode tree
4. Return structured body_sections array

**Output Format:**

```typescript
interface ParsedSection {
  paragraph_index: number;       // Position in original document
  level: number;                 // 1, 2, 3, 4...
  title: string;                 // "FACTUAL BACKGROUND"
  num_format: string;            // "upperRoman", "decimal", "upperLetter"
}

// ParsedSection is the intermediate format from document parsing.
// It must be converted to SectionNode (see Section 2.4) for storage in Draft.
// Conversion: Generate stable UUID for id, compute number from position and outline schema.


def parsed_sections_to_section_nodes(
    parsed: List[ParsedSection],
    outline_schema: OutlineSchema
) -> List[SectionNode]:
    """
    Convert parsed sections to SectionNode tree with stable IDs.

    Args:
        parsed: Flat list from XML metadata detection
        outline_schema: From template, defines numbering format per level

    Returns:
        Hierarchical SectionNode tree with UUIDs and computed numbers
    """
    import uuid

    tree = []
    stack = []

    for i, section in enumerate(parsed):
        # Generate stable ID
        node_id = f"sec-{uuid.uuid4().hex[:8]}"

        # Compute number based on position and outline schema
        level_config = next(
            (lvl for lvl in outline_schema['levels'] if lvl['level'] == section['level']),
            None
        )

        if level_config:
            # Count siblings at same level
            sibling_count = sum(
                1 for s in parsed[:i]
                if s['level'] == section['level'] and all(
                    parent['level'] < section['level'] for parent in stack
                )
            )
            number = format_number(sibling_count, level_config['format'])
        else:
            number = str(i + 1)

        node = {
            'id': node_id,
            'level': section['level'],
            'number': number,
            'title': section['title'],
            'children': []
        }

        # Build hierarchy
        while stack and stack[-1]['level'] >= section['level']:
            stack.pop()

        if stack:
            stack[-1]['children'].append(node)
        else:
            tree.append(node)

        stack.append(node)

    return tree


def format_number(index: int, format_type: str) -> str:
    """Convert index to formatted number based on outline schema format."""
    if format_type == 'roman_upper':
        return int_to_roman(index + 1).upper()
    elif format_type == 'roman_lower':
        return int_to_roman(index + 1).lower()
    elif format_type == 'alpha_upper':
        return chr(65 + index)  # A, B, C...
    elif format_type == 'alpha_lower':
        return chr(97 + index)  # a, b, c...
    elif format_type == 'numeric':
        return str(index + 1)
    elif format_type == 'bullet':
        return '•'
    else:
        return str(index + 1)


def int_to_roman(num: int) -> str:
    """Convert integer to Roman numeral string."""
    val = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
    syms = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I']
    roman_num = ''
    i = 0
    while num > 0:
        for _ in range(num // val[i]):
            roman_num += syms[i]
            num -= val[i]
        i += 1
    return roman_num
```

**Module Responsibilities:**

| Module | Responsibility |
|--------|---------------|
| `xml_metadata.py` | Extract numFormat, ilvl, pStyle from paragraph XML |
| `numbering_parser.py` | Parse numbering.xml, lookup format definitions |
| `section_builder.py` | Convert flat section list to hierarchical tree |
| `parse_document()` | Orchestrate: body detection → XML extraction → tree building |

**Phase 4: Signature Block Extraction**
- Starts after: "Respectfully submitted" or "/s/" pattern
- Ends before: "CERTIFICATE OF SERVICE" or EOF
- Extract as OOXML

### 9.2 LLM Prompt for Body Start Detection

```
You are parsing a legal document. The document has been preprocessed to show line numbers.

Your task: Identify the FIRST line number where the document transitions from procedural/introductory content to substantive legal argument.

Procedural content includes:
- Court identification
- Case caption/style
- Document title
- Salutation ("TO THE HONORABLE JUDGE...")
- Filing party identification ("NOW COMES Alex Cruz, Defendant...")
- Any variation of "would show the Court as follows:" or "respectfully shows:"

Substantive content includes:
- Factual background
- Legal argument
- Introduction section (even if titled "INTRODUCTION")
- Any Roman numeral or lettered section heading
- Discussion of the case merits

Return ONLY the line number as an integer. If uncertain, return the line immediately after any phrase like "as follows:" or "respectfully shows:".

Document:
---
{{document_with_line_numbers}}
---
```

### 9.3 Extraction Output

```typescript
interface ParsedDocument {
  // Raw extraction
  raw_text: string;
  
  // Structured components
  case_block: {
    court_line: string;
    judicial_district?: string;
    cause_number: string;
    party_block_raw: string;
    motion_title: string;
    salutation: string;
  };
  
  // Parsed case data
  suggested_case_data: Partial<Case>;
  
  // Body
  body_start_line: number;
  body_end_line: number;
  body_content: string;             // As HTML
  body_sections: SectionNode[];     // Parsed hierarchy
  
  // Signature
  signature_ooxml: string;
  signature_start_line: number;
  
  // Certificate (if present)
  certificate_ooxml?: string;
  certificate_start_line?: number;
}
```

### 9.4 Format Preservation

When parsing uploaded DOCX files, text formatting (bold, italic, underline) must be preserved for round-trip editing. Users should be able to upload a document, edit it, and export with original formatting intact.

**Format Representation:**

Format is stored as **inline marks** on text spans, not as global styles. This matches Tiptap/ProseMirror's data model.
```typescript
interface FormatMark {
  type: 'bold' | 'italic' | 'underline' | 'strikethrough';
  start: number;              // Character offset in paragraph
  end: number;                // Character offset (exclusive)
}

interface FormattedParagraph {
  text: string;               // Plain text content
  marks: FormatMark[];        // Format spans
}
```

**Example:**

Text: "The **defendant** filed a _motion_."

Representation:
```json
{
  "text": "The defendant filed a motion.",
  "marks": [
    { "type": "bold", "start": 4, "end": 13 },
    { "type": "italic", "start": 23, "end": 29 }
  ]
}
```

**Extraction from DOCX:**

Use python-docx to extract runs (formatted text segments) from each paragraph:
```python
from docx import Document
from typing import List, Dict

def extract_formatted_text(paragraph) -> Dict:
    """
    Extract text and format marks from a Word paragraph.

    Args:
        paragraph: python-docx Paragraph object

    Returns:
        Dict with 'text' and 'marks' keys
    """
    full_text = ""
    marks = []
    offset = 0

    for run in paragraph.runs:
        run_text = run.text
        run_start = offset
        run_end = offset + len(run_text)

        # Detect formatting
        if run.bold:
            marks.append({
                'type': 'bold',
                'start': run_start,
                'end': run_end
            })

        if run.italic:
            marks.append({
                'type': 'italic',
                'start': run_start,
                'end': run_end
            })

        if run.underline:
            marks.append({
                'type': 'underline',
                'start': run_start,
                'end': run_end
            })

        if run.font.strike:
            marks.append({
                'type': 'strikethrough',
                'start': run_start,
                'end': run_end
            })

        full_text += run_text
        offset = run_end

    return {
        'text': full_text,
        'marks': marks
    }
```

**Conversion to ProseMirror JSON:**

Format marks must be converted to Tiptap's mark format:
```python
def marks_to_prosemirror(formatted_para: Dict) -> Dict:
    """
    Convert FormatMark spans to ProseMirror content blocks.

    ProseMirror represents formatted text as:
    [
      { "type": "text", "text": "The ", "marks": [] },
      { "type": "text", "text": "defendant", "marks": [{"type": "bold"}] },
      { "type": "text", "text": " filed...", "marks": [] }
    ]
    """
    text = formatted_para['text']
    marks_list = formatted_para['marks']

    # Build a map of offset → active marks
    mark_changes = {}  # offset → set of mark types

    for mark in marks_list:
        # Mark starts at offset
        if mark['start'] not in mark_changes:
            mark_changes[mark['start']] = {'add': set(), 'remove': set()}
        mark_changes[mark['start']]['add'].add(mark['type'])

        # Mark ends at offset
        if mark['end'] not in mark_changes:
            mark_changes[mark['end']] = {'add': set(), 'remove': set()}
        mark_changes[mark['end']]['remove'].add(mark['type'])

    # Walk through text, creating content blocks
    content = []
    active_marks = set()
    last_offset = 0

    for offset in sorted(mark_changes.keys()):
        # Emit text from last_offset to offset
        if offset > last_offset:
            chunk_text = text[last_offset:offset]
            content.append({
                'type': 'text',
                'text': chunk_text,
                'marks': [{'type': m} for m in sorted(active_marks)]
            })

        # Update active marks
        active_marks -= mark_changes[offset]['remove']
        active_marks |= mark_changes[offset]['add']
        last_offset = offset

    # Emit remaining text
    if last_offset < len(text):
        content.append({
            'type': 'text',
            'text': text[last_offset:],
            'marks': [{'type': m} for m in sorted(active_marks)]
        })

    return {
        'type': 'paragraph',
        'content': content
    }
```

**Preservation Metadata:**

To enable perfect round-trip preservation, store additional metadata about the original document:
```typescript
interface PreservationMetadata {
  // Original document properties
  source_filename: string;
  source_created: string;          // ISO 8601
  source_modified: string;

  // Font information (for styles we don't directly edit)
  default_font: string;            // "Times New Roman"
  default_size: number;            // 12pt

  // Paragraph spacing (exact values from original)
  paragraph_spacing: {
    before_pt: number;
    after_pt: number;
    line_spacing: number | string;  // 1.0, 1.5, "double"
  };

  // Any custom styles used
  custom_styles: Array<{
    name: string;
    definition: string;            // OOXML style definition
  }>;
}
```

**Integration with Export Pipeline:**

When exporting back to DOCX:

1. Convert ProseMirror marks back to python-docx runs
2. Apply preservation metadata (fonts, spacing, styles)
3. Ensure formatting matches original document
```python
def prosemirror_to_docx_paragraph(pm_para: Dict, doc_paragraph) -> None:
    """
    Apply ProseMirror content blocks to a python-docx paragraph.

    Args:
        pm_para: ProseMirror paragraph node with content blocks
        doc_paragraph: python-docx Paragraph object to populate
    """
    for block in pm_para.get('content', []):
        if block['type'] != 'text':
            continue

        run = doc_paragraph.add_run(block['text'])

        # Apply marks
        for mark in block.get('marks', []):
            mark_type = mark['type']

            if mark_type == 'bold':
                run.bold = True
            elif mark_type == 'italic':
                run.italic = True
            elif mark_type == 'underline':
                run.underline = True
            elif mark_type == 'strikethrough':
                run.font.strike = True
```

**Round-Trip Validation:**

Format preservation correctness is verified by:

1. **Upload Test:** Parse a document with complex formatting → All marks preserved
2. **Edit Test:** User adds text with formatting → New marks stored correctly
3. **Export Test:** Export document → python-docx applies marks as runs
4. **Re-import Test:** Re-parse exported document → Marks match original

**Example Test Case:**
```python
def test_format_round_trip():
    # 1. Parse original
    doc = Document("original.docx")
    para = doc.paragraphs[0]
    formatted = extract_formatted_text(para)

    # 2. Convert to ProseMirror
    pm_para = marks_to_prosemirror(formatted)

    # 3. Convert back to DOCX
    new_doc = Document()
    new_para = new_doc.add_paragraph()
    prosemirror_to_docx_paragraph(pm_para, new_para)
    new_doc.save("exported.docx")

    # 4. Re-parse
    reloaded = Document("exported.docx")
    reloaded_formatted = extract_formatted_text(reloaded.paragraphs[0])

    # 5. Verify match
    assert formatted['text'] == reloaded_formatted['text']
    assert formatted['marks'] == reloaded_formatted['marks']
```

**Module Responsibilities:**

| Module | Responsibility |
|--------|---------------|
| `format_extraction.py` | Extract FormatMark spans from DOCX runs |
| `format_conversion.py` | Convert FormatMark ↔ ProseMirror marks |
| `preservation_metadata.py` | Store/retrieve document metadata |
| `format_export.py` | Apply ProseMirror marks to python-docx runs |
| `round_trip_test.py` | Validate format preservation accuracy |

**Performance Characteristics:**

- Format extraction: O(n) where n = number of runs in document (~10-50 runs per paragraph)
- Mark conversion: O(m) where m = number of mark boundaries (~5-20 per paragraph)
- Total overhead: ~5-10ms per paragraph, ~100-200ms per typical motion

**Critical Requirement:**

Format preservation is **essential for professional legal documents**. Case names must remain italicized. Statutory citations may have specific formatting. Users must trust that uploading → editing → exporting will not corrupt their document's appearance.

---

## 11. API Endpoints

These REST API endpoints define the contracts between FACTSWAY services. The same endpoints are used whether services run as child processes (desktop app) or in containers (cloud).

**Service Discovery via Environment Variables:**

Services never hardcode URLs. Instead, they read from environment:

```typescript
// Service code (works in all environments)
const RECORDS_URL = process.env.RECORDS_SERVICE_URL || 'http://localhost:3001';
const INGESTION_URL = process.env.INGESTION_SERVICE_URL || 'http://localhost:3002';

// Call another service
const response = await fetch(`${INGESTION_URL}/api/ingest`, { ... });
```

**Environment injection by orchestrator:**

```yaml
# Desktop (injected by Electron orchestrator)
RECORDS_SERVICE_URL=http://localhost:3001
INGESTION_SERVICE_URL=http://localhost:3002
EXPORT_SERVICE_URL=http://localhost:3003

# Cloud (injected by Kubernetes)
RECORDS_SERVICE_URL=http://records-service:3001
INGESTION_SERVICE_URL=http://ingestion-service:3002
EXPORT_SERVICE_URL=http://export-service:3003
```

**Authentication:**
- Desktop (local): None required (localhost only, no network exposure)
- Web trial: `X-Trial-Token` header (rate limited, IP-based)
- Mobile/API: OAuth 2.0 + JWT
- Enterprise: SSO integration (Okta, Azure AD)

### 10.1 POST /ingest

Parse an uploaded document and extract structure.

**Request:**
```
Content-Type: multipart/form-data
Body: file (binary, .docx only)
```

**Response (200):**
```typescript
{
  success: true,
  parsed: ParsedDocument
}
```

**Response (422):**
```typescript
{
  success: false,
  error: "parsing_failed",
  detail: "Could not identify case block structure"
}
```

### 10.2 POST /export

Generate a formatted .docx from draft data.

**Request:**
```typescript
{
  template: Template,              // Full template object
  case_data: Case,                 // Full case object
  draft: Draft,                    // Full draft object
  include_certificate: boolean,
  certificate_variables?: {
    service_date: string,
    service_method: string,
    served_parties: string[]
  }
}
```

**Response (200):**
```
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
Content-Disposition: attachment; filename="{{case_name}}_{{motion_title}}.docx"
Body: (binary .docx)
```

**Response (400 - Bad Request):**
```typescript
{
  success: false,
  error: "validation_failed",
  detail: string,           // Human-readable error message
  validation_errors?: {     // If multiple validation issues
    field: string,
    message: string
  }[]
}
```

**Example validation errors:**
- Missing required field: `template`, `case_data`, or `draft`
- Invalid template ID (doesn't exist)
- Invalid case ID (doesn't exist)
- Malformed ProseMirror document structure

**Response (413 - Payload Too Large):**
```typescript
{
  success: false,
  error: "document_too_large",
  detail: "Document exceeds maximum size of 50 pages or 500KB",
  actual_size: string       // e.g., "75 pages", "850KB"
}
```

**Response (422 - Unprocessable Entity):**
```typescript
{
  success: false,
  error: "export_failed",
  detail: string,
  failure_stage: "pandoc" | "ooxml" | "merge" | "validation",
  technical_details?: string  // For debugging (optional)
}
```

**Example export failures:**
- Pandoc conversion failed (malformed HTML)
- OOXML generation failed (invalid template structure)
- Document merge failed (incompatible parts)
- Final validation failed (missing required sections)

**Response (500 - Internal Server Error):**
```typescript
{
  success: false,
  error: "internal_error",
  detail: "An unexpected error occurred during document generation",
  request_id: string        // For support/debugging
}
```

**Response (503 - Service Unavailable):**
```typescript
{
  success: false,
  error: "service_unavailable",
  detail: "Export service is temporarily unavailable",
  retry_after: number       // Seconds until retry recommended
}
```

### 10.3 POST /preview

Generate a PDF preview of the document.

**Request:**
```typescript
// Same as /export
```

**Response (200):**
```
Content-Type: application/pdf
Body: (binary PDF)
```

**Response (400 - Bad Request):**
```typescript
// Same as /export 400 response
{
  success: false,
  error: "validation_failed",
  detail: string
}
```

**Response (422 - Unprocessable Entity):**
```typescript
{
  success: false,
  error: "preview_failed",
  detail: string,
  failure_stage: "export" | "libreoffice_conversion",
  technical_details?: string
}
```

**Example preview failures:**
- Export to DOCX failed (see /export errors)
- LibreOffice conversion failed (unsupported features)
- PDF generation timeout (document too complex)

**Response (500 - Internal Server Error):**
```typescript
// Same as /export 500 response
{
  success: false,
  error: "internal_error",
  detail: string,
  request_id: string
}
```

**Response (503 - Service Unavailable):**
```typescript
// Same as /export 503 response
{
  success: false,
  error: "service_unavailable",
  detail: "Preview service is temporarily unavailable",
  retry_after: number
}
```

**Response (504 - Gateway Timeout):**
```typescript
{
  success: false,
  error: "preview_timeout",
  detail: "Preview generation exceeded time limit (30 seconds)",
  suggestion: "Try reducing document complexity or number of pages"
}
```

### 10.4 GET /health

Container health check.

**Response (200):**
```typescript
{
  status: "healthy",
  pandoc_version: "3.6.0",
  libreoffice_version: "7.6.4"
}
```

### 10.5 Error Handling Guidelines

**Client Behavior:**

| Status | Client Action |
|--------|---------------|
| 400 | Display validation errors to user, allow correction |
| 413 | Inform user document is too large, suggest reducing content |
| 422 | Show error message, offer to retry or save draft |
| 500 | Show generic error, provide request ID for support |
| 503 | Show "service unavailable", auto-retry after delay |
| 504 | Show timeout message, suggest simplifying document |

**Retry Strategy:**

- **400, 413, 422:** Do NOT retry automatically (user input required)
- **500:** Retry once after 2 seconds with exponential backoff
- **503:** Retry after `retry_after` seconds (max 3 attempts)
- **504:** Do NOT retry automatically (document needs simplification)

**Error Messages (User-Facing):**

```typescript
const ERROR_MESSAGES = {
  validation_failed: "Please check your document for missing required information.",
  document_too_large: "Your document is too large to export. Try reducing the number of pages or removing large images.",
  export_failed: "We couldn't generate your document. Please try again or contact support if the problem persists.",
  preview_failed: "Preview generation failed. You can still export the document as a DOCX file.",
  preview_timeout: "Preview took too long to generate. Try reducing document complexity.",
  internal_error: "An unexpected error occurred. Please try again.",
  service_unavailable: "The export service is temporarily unavailable. Please try again in a few moments."
};
```

**Logging Requirements:**

All API errors must be logged with:
- Request ID (for tracing)
- Timestamp
- User ID (if authenticated)
- Error type and stage
- Technical details (for debugging)
- Document size/complexity metrics

---

## 12. UI/UX Specifications

### 11.1 Application Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  HEADER BAR                                                             │
│  [Logo] FACTSWAY    [Templates ▼] [Cases ▼] [Current Draft ▼]  [Export] │
├─────────────────────────────────────────────────────────────────────────┤
│  TOOLBAR (when editing draft)                                           │
│  [B] [I] [U] | [H1▼] [Quote] [Bullet] [Number] | [Table] [Image] [Note] │
├────────────────────────┬────────────────────────────────────────────────┤
│  SIDEBAR               │  MAIN EDITOR                                   │
│  (collapsible)         │                                                │
│                        │  ┌────────────────────────────────────────────┐│
│  ▼ Document Outline    │  │  CASE BLOCK (locked, click to edit modal) ││
│    I. Introduction     │  │  ─────────────────────────────────────────  ││
│    II. Facts           │  │  IN THE DISTRICT COURT OF BEXAR COUNTY...  ││
│    III. Argument       │  │  ...                                       ││
│      A. First Point    │  └────────────────────────────────────────────┘│
│      B. Second Point   │                                                │
│    IV. Conclusion      │  ┌────────────────────────────────────────────┐│
│                        │  │  BODY EDITOR (Tiptap)                      ││
│  ▼ Case Info           │  │  ─────────────────────────────────────────  ││
│    Court: District     │  │  [Editable content area]                   ││
│    Cause: 2022-CI-...  │  │                                            ││
│    Parties: Doe v...   │  │                                            ││
│                        │  │                                            ││
│                        │  └────────────────────────────────────────────┘│
│                        │                                                │
│                        │  ┌────────────────────────────────────────────┐│
│                        │  │  SIGNATURE BLOCK (locked)                  ││
│                        │  │  ─────────────────────────────────────────  ││
│                        │  │  Respectfully submitted,                   ││
│                        │  │  /s/ Alex Cruz                             ││
│                        │  │  ...                                       ││
│                        │  └────────────────────────────────────────────┘│
└────────────────────────┴────────────────────────────────────────────────┘
```

### 11.2 Template Builder Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  TEMPLATE BUILDER: [Template Name                           ] [Save]    │
├──────────────────────┬──────────────────────────────────────────────────┤
│  SETTINGS TABS       │  CONFIGURATION PANEL                             │
│                      │                                                  │
│  ● General           │  (Content changes based on selected tab)         │
│  ○ Case Block        │                                                  │
│  ○ Outline Schema    │  Example for "Outline Schema" tab:               │
│  ○ Signature Block   │  ┌──────────────────────────────────────────────┐│
│  ○ Certificate       │  │ Level 1: Section                             ││
│  ○ Footer            │  │   Format: [Roman Upper ▼]                    ││
│                      │  │   Style:  [✓ Bold] [✓ Caps] [ ] Underline   ││
│                      │  │   Align:  [Center ▼]                         ││
│                      │  │   [Remove Level]                             ││
│                      │  ├──────────────────────────────────────────────┤│
│                      │  │ Level 2: Subsection                          ││
│                      │  │   Format: [Alpha Upper ▼]                    ││
│                      │  │   ...                                        ││
│                      │  ├──────────────────────────────────────────────┤│
│                      │  │ [+ Add Level]                                ││
│                      │  └──────────────────────────────────────────────┘│
│                      │                                                  │
│                      │  [ ] Enable sequential paragraph numbering       │
└──────────────────────┴──────────────────────────────────────────────────┘
```

### 11.3 Case Info Edit Modal

When user clicks on locked Case Block:

```
┌─────────────────────────────────────────────────────────────────┐
│  EDIT CASE INFORMATION                                    [X]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Court Type:      [District           ▼]                        │
│  County:          [Bexar                ]                       │
│  State:           [Texas               ]                        │
│  Judicial Dist:   [73rd                 ]                       │
│                                                                 │
│  Cause Number:    [2022-CI-08479        ]                       │
│                                                                 │
│  ─── PARTY GROUP 1 ─────────────────────────────────────────── │
│  Plaintiff(s):                                                  │
│    [John Doe                            ] [Remove]              │
│    [+ Add Plaintiff]                                            │
│                                                                 │
│  Defendant(s):                                                  │
│    [ACME Corporation                    ] [Remove]              │
│    [+ Add Defendant]                                            │
│                                                                 │
│  [+ Add Party Group] (for counter-claims, etc.)                 │
│                                                                 │
│  ─── FILER INFORMATION ─────────────────────────────────────── │
│  Filer Name:      [Alex Cruz            ]                       │
│  Filer Role:      [Defendant           ▼]                       │
│  [ ] Pro Se                                                     │
│                                                                 │
│                                    [Cancel]  [Save Changes]     │
└─────────────────────────────────────────────────────────────────┘
```

### 11.4 Page Break Visualization

In the editor, visual guides show approximate page boundaries:

```css
.editor-container {
  /* Dashed line every 11 inches (1056px at 96 DPI) */
  background-image: 
    repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 1055px,
      #E5E7EB 1055px,
      #E5E7EB 1056px
    );
}
```

**Disclaimer text** (shown at bottom of editor):
> "Page break guides are approximate. Final page breaks in exported document may vary slightly."

### 11.5 Error Handling UI

All errors must be communicated clearly to users with actionable guidance.

**Error Display Types:**

| Type | Use Case | UI Element | Duration |
|------|----------|------------|----------|
| Toast | Transient errors, success confirmations | Bottom-right notification | 5 seconds, auto-dismiss |
| Modal | Blocking errors requiring acknowledgment | Centered dialog | Until dismissed |
| Inline | Field validation errors | Red text below field | Until corrected |
| Banner | System-wide warnings | Top of screen, dismissible | Until dismissed |

**Error Matrix:**

| Error | Type | Message | Recovery Action |
|-------|------|---------|-----------------|
| File upload failed | Toast | "Upload failed. Please try again." | Retry button |
| File too large | Modal | "File exceeds 10MB limit. Please use a smaller file." | OK button |
| Invalid file type | Toast | "Only .docx files are supported." | None |
| Parse failed | Modal | "Could not extract document structure. The file may be corrupted or use unsupported formatting." | "Try Again" / "Upload Different File" |
| OpenAI rate limit | Modal | "AI service temporarily unavailable. Please wait a moment and try again." | "Retry" with countdown timer |
| OpenAI timeout | Toast | "AI processing timed out. Retrying..." | Auto-retry (max 3 attempts) |
| Export failed | Modal | "Document generation failed. Please try again or contact support." | "Retry" / "Download Debug Log" |
| Preview failed | Toast | "Preview generation failed. You can still export the document." | None |
| localStorage full | Modal | "Storage limit reached. Please export and delete some drafts to continue." | "Manage Drafts" button |
| localStorage unavailable | Banner | "Browser storage unavailable. Changes will not be saved. Enable cookies/storage to fix." | Persistent until resolved |
| Network error | Toast | "Connection lost. Changes saved locally." | Auto-retry on reconnect |
| Session expired | Modal | "Your session has expired. Please refresh the page." | "Refresh" button |

**Toast Component Specification:**

```typescript
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;        // ms, default 5000
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

**Visual Design:**
- Success: Green left border, checkmark icon
- Error: Red left border, X icon
- Warning: Yellow left border, exclamation icon
- Info: Blue left border, info icon

> **Note:** See Section 19.6.5 Toast Notifications for complete design system specifications including CSS, design tokens, and behavior tables.

### 11.6 Loading States

**Loading Indicators:**

| Operation | Indicator | Location |
|-----------|-----------|----------|
| File upload | Progress bar + "Uploading..." | Modal overlay |
| AI parsing | Spinner + "Analyzing document structure..." | Modal overlay |
| Export generation | Spinner + "Generating document..." | Modal overlay |
| Preview generation | Spinner + "Creating preview..." | Preview panel |
| Auto-save | Small spinner in toolbar | Toolbar right side |
| Template save | Button disabled + spinner | Save button |

**Overlay Specification:**
```css
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-subtle);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-message {
  margin-top: 16px;
  font-size: 16px;
  color: var(--text-ink);
}
```

> **Note:** See Section 19.6.4 Loading States for complete design system specifications including spinner animations and overlay patterns.

### 11.7 Confirmation Dialogs

**Destructive Actions Requiring Confirmation:**

| Action | Dialog Title | Message | Buttons |
|--------|--------------|---------|---------|
| Delete draft | "Delete Draft?" | "This will permanently delete '{draft_name}'. This cannot be undone." | "Cancel" / "Delete" (red) |
| Delete case | "Delete Case?" | "This will delete the case '{case_name}' and all {n} drafts within it. This cannot be undone." | "Cancel" / "Delete" (red) |
| Delete template | "Delete Template?" | "This will delete '{template_name}'. Cases using this template will not be affected but cannot be edited." | "Cancel" / "Delete" (red) |
| Clear all data | "Clear All Data?" | "This will permanently delete all templates, cases, and drafts. Export a backup first if needed." | "Cancel" / "Export Backup" / "Clear All" (red) |
| Overwrite template | "Overwrite Template?" | "A template named '{name}' already exists. Replace it?" | "Cancel" / "Keep Both" / "Replace" |
| Discard changes | "Discard Changes?" | "You have unsaved changes. Discard them?" | "Cancel" / "Discard" |

**Dialog Component Specification:**
```typescript
interface ConfirmDialog {
  title: string;
  message: string;
  type: 'warning' | 'danger' | 'info';
  buttons: {
    label: string;
    variant: 'primary' | 'secondary' | 'danger';
    onClick: () => void;
  }[];
}
```

### 11.8 Keyboard Shortcuts

All keyboard shortcuts follow platform conventions (Ctrl on Windows/Linux, Cmd on macOS). The implementation should detect the platform and display appropriate modifier keys.

**Document Editing Shortcuts:**

| Action | Windows/Linux | macOS | Context |
|--------|---------------|-------|---------|
| Bold | Ctrl+B | Cmd+B | Text selected or cursor in editor |
| Italic | Ctrl+I | Cmd+I | Text selected or cursor in editor |
| Underline | Ctrl+U | Cmd+U | Text selected or cursor in editor |
| Heading 1 (Section) | Ctrl+1 | Cmd+1 | Cursor in editor |
| Heading 2 (Subsection) | Ctrl+2 | Cmd+2 | Cursor in editor |
| Heading 3 (Point) | Ctrl+3 | Cmd+3 | Cursor in editor |
| Heading 4 (Subpoint) | Ctrl+4 | Cmd+4 | Cursor in editor |
| Normal paragraph | Ctrl+0 | Cmd+0 | Cursor in editor |
| Block quote | Ctrl+Shift+B | Cmd+Shift+B | Cursor in editor |
| Bullet list | Ctrl+Shift+8 | Cmd+Shift+8 | Cursor in editor |
| Numbered list | Ctrl+Shift+7 | Cmd+Shift+7 | Cursor in editor |
| Insert footnote | Ctrl+Alt+F | Cmd+Option+F | Cursor in editor |
| Promote (outdent) | Shift+Tab | Shift+Tab | Cursor on heading |
| Demote (indent) | Tab | Tab | Cursor on heading |
| Undo | Ctrl+Z | Cmd+Z | Editor focused |
| Redo | Ctrl+Shift+Z | Cmd+Shift+Z | Editor focused |
| Select all | Ctrl+A | Cmd+A | Editor focused |

**Application Shortcuts:**

| Action | Windows/Linux | macOS | Context |
|--------|---------------|-------|---------|
| Save draft | Ctrl+S | Cmd+S | Any (auto-saves, shows confirmation) |
| Export to Word | Ctrl+E | Cmd+E | Draft open |
| Preview | Ctrl+P | Cmd+P | Draft open |
| New draft | Ctrl+N | Cmd+N | Case selected |
| Open draft | Ctrl+O | Cmd+O | Any |
| Find/Replace | Ctrl+F | Cmd+F | Editor focused |
| Close modal | Escape | Escape | Modal open |
| Toggle sidebar | Ctrl+\\ | Cmd+\\ | Any |

**Conflict Resolution:**

Some shortcuts conflict with browser defaults. Resolution:

| Shortcut | Browser Default | Our Action | Resolution |
|----------|-----------------|------------|------------|
| Ctrl+P | Print | Preview | Prevent default, use our Preview |
| Ctrl+S | Save page | Save draft | Prevent default, show "Saved" toast |
| Ctrl+N | New window | New draft | Do NOT prevent—let browser handle. Use toolbar for new draft. |
| Ctrl+O | Open file | Open draft | Do NOT prevent—let browser handle. Use toolbar for open. |

**Implementation:**
```typescript
// Register shortcuts using a library like hotkeys-js or Tiptap's built-in
const shortcuts: Record<string, () => void> = {
  'mod+b': () => editor.chain().focus().toggleBold().run(),
  'mod+i': () => editor.chain().focus().toggleItalic().run(),
  'mod+u': () => editor.chain().focus().toggleUnderline().run(),
  'mod+1': () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  'mod+2': () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  'mod+3': () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  'mod+4': () => editor.chain().focus().toggleHeading({ level: 4 }).run(),
  'mod+0': () => editor.chain().focus().setParagraph().run(),
  'mod+shift+b': () => editor.chain().focus().toggleBlockquote().run(),
  'mod+alt+f': () => editor.chain().focus().insertFootnote().run(),
  'mod+s': (e) => { e.preventDefault(); saveDraft(); showToast('Saved'); },
  'mod+e': (e) => { e.preventDefault(); exportDocument(); },
  'mod+p': (e) => { e.preventDefault(); showPreview(); },
  'escape': () => closeActiveModal(),
};

// 'mod' automatically maps to Ctrl (Windows/Linux) or Cmd (macOS)
```

**Shortcut Hints in UI:**

Toolbar buttons should display keyboard shortcuts on hover:
```html
<button
  @click="toggleBold"
  title="Bold (Ctrl+B)"
  :class="{ active: editor.isActive('bold') }"
>
  <BoldIcon />
</button>
```

> **Note:** See Section 19.6.2 Keyboard Navigation for comprehensive keyboard shortcut reference including all global shortcuts, editor shortcuts, and focus management patterns.

### 11.9 Undo/Redo Behavior

**Tiptap's Native Undo/Redo:**
- Unlimited undo levels (memory-constrained, typically 100+)
- Session-only (clears on page refresh)
- Groups related changes (e.g., typing a word is one undo step, not per-character)

**What Undo Affects:**
- Text changes (typing, deletion, paste)
- Formatting changes (bold, italic, headings)
- Structure changes (promote/demote, list operations)
- Footnote insertion/deletion

**What Undo Does NOT Affect:**
- Case info changes (separate operation, requires explicit save)
- Template changes (separate operation)
- Draft metadata (title changes)

**Visual Indicator:**

Toolbar should show undo/redo state:
```typescript
<button
  @click="editor.chain().focus().undo().run()"
  :disabled="!editor.can().undo()"
  title="Undo (Ctrl+Z)"
>
  <UndoIcon />
</button>

<button
  @click="editor.chain().focus().redo().run()"
  :disabled="!editor.can().redo()"
  title="Redo (Ctrl+Shift+Z)"
>
  <RedoIcon />
</button>
```

### 11.10 Concurrent Tab Warning

If the same draft is open in multiple browser tabs, edits may conflict and cause data loss.

**Detection Method:**
```typescript
// Use BroadcastChannel API to detect same-origin tabs
const channel = new BroadcastChannel('factsway_editor');

// On draft open, broadcast
channel.postMessage({ type: 'DRAFT_OPENED', draftId: currentDraftId });

// Listen for other tabs opening same draft
channel.onmessage = (event) => {
  if (event.data.type === 'DRAFT_OPENED' && event.data.draftId === currentDraftId) {
    showConcurrentEditWarning();
  }
};
```

**Warning UI:**

When concurrent edit detected, show persistent banner:
```
┌─────────────────────────────────────────────────────────────────────────┐
│ ⚠️  This draft is open in another tab. Edits may conflict.  [Dismiss]  │
└─────────────────────────────────────────────────────────────────────────┘
```

- Banner appears at top of editor
- Yellow/amber background
- Persists until dismissed or other tab closes
- Does NOT block editing (just warns)

**Tab Close Notification:**
```typescript
// Notify other tabs when closing
window.addEventListener('beforeunload', () => {
  channel.postMessage({ type: 'DRAFT_CLOSED', draftId: currentDraftId });
});
```

---

### 11.11 Evidence Sidebar

The Evidence Sidebar provides access to all uploaded evidence and enables drag-drop linking to the document.

**Sidebar Structure:**
```
┌─ EVIDENCE ──────────────────────────────────┐
│                                             │
│  [Search evidence...            🔍]         │
│                                             │
│ ┌─ Exhibits ─────────────────────────── ▼ ┐ │
│ │ 📎 A - Signed Contract          [⋮]     │ │
│ │    contract.pdf • 245 KB                │ │
│ │ 📎 B - Email Correspondence     [⋮]     │ │
│ │    emails.pdf • 1.2 MB                  │ │
│ │ 📎 C - Invoice #1234            [⋮]     │ │
│ │    invoice.pdf • 89 KB                  │ │
│ │                                         │ │
│ │ [+ Upload Exhibit]                      │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─ Case Law ─────────────────────────── ▼ ┐ │
│ │ 📚 Smith v. Jones               [⋮]     │ │
│ │    123 S.W.3d 456 • opinion.pdf         │ │
│ │ 📚 Doe v. State                 [⋮]     │ │
│ │    456 S.W.3d 789 • doe_opinion.pdf     │ │
│ │                                         │ │
│ │ [+ Upload Opinion]                      │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─ Statutes & Rules ─────────────────── ▼ ┐ │
│ │ 📜 TEX. R. CIV. P. 196.1        [⋮]     │ │
│ │    rule_196.pdf                         │ │
│ │ 📜 TEX. R. CIV. P. 193.2        [⋮]     │ │
│ │    rule_193.pdf                         │ │
│ │                                         │ │
│ │ [+ Upload Rule/Statute]                 │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ─────────────────────────────────────────── │
│                                             │
│  📊 Evidence Map                    [Show ▼]│
│                                             │
└─────────────────────────────────────────────┘
```

**Component Specification:**
```typescript
interface EvidenceSidebarProps {
  evidence: Evidence[];
  onUpload: (type: EvidenceType, file: File, label: string) => void;
  onDelete: (evidenceId: string) => void;
  onEdit: (evidenceId: string, updates: Partial<Evidence>) => void;
  onView: (evidenceId: string) => void;
  onDragStart: (evidenceId: string, evidenceType: EvidenceType) => void;
}

type EvidenceType = 'exhibit' | 'caselaw' | 'statute';
```

**Evidence Item Display:**

Each evidence item shows:
- Icon based on type (📎 exhibit, 📚 case law, 📜 statute)
- For exhibits: Computed marker (A, B, C) + label
- For case law/statutes: Label only
- File name and size in secondary text
- Overflow menu [⋮] for actions

**Overflow Menu Actions:**

| Action | Icon | Behavior |
|--------|------|----------|
| View | 👁️ | Opens document viewer modal |
| Edit | ✏️ | Opens edit modal (label, short label, description) |
| Replace File | 📄 | Upload new file, keeping same ID and links |
| Delete | 🗑️ | Confirm dialog, then remove (warns if cited) |

**Upload Flow:**
```
User clicks [+ Upload Exhibit]
         ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  Upload Exhibit                                                    [×]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                                                                     ││
│  │     📁 Drag and drop file here, or click to browse                 ││
│  │        PDF, PNG, JPG, DOCX up to 10MB                              ││
│  │                                                                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  Label *                                                                │
│  [Signed Contract                              ]                        │
│  ℹ️ How this exhibit will be referenced                                 │
│                                                                         │
│  Short Label (optional)                                                 │
│  [Contract                                     ]                        │
│  ℹ️ For subsequent references                                           │
│                                                                         │
│  Description (optional)                                                 │
│  [Agreement between parties dated Jan 15, 2024 ]                        │
│                                                                         │
│                                         [Cancel]  [Upload Exhibit]      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Drag-Drop Implementation:**

Evidence items are draggable. When dropped on the editor, a citation is created.
```typescript
// Evidence item component
function EvidenceItem({ evidence, citationIndex }: Props) {
  const handleDragStart = (e: DragEvent) => {
    e.dataTransfer.setData('application/x-evidence', JSON.stringify({
      id: evidence.id,
      type: evidence.type,
      label: evidence.label,
    }));
    e.dataTransfer.effectAllowed = 'copy';

    // Set drag image
    const dragImage = createDragImage(evidence);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
  };

  const marker = evidence.type === 'exhibit'
    ? citationIndex.exhibitMarkers.get(evidence.id) || '?'
    : null;

  return (
    <div
      className="evidence-item"
      draggable
      onDragStart={handleDragStart}
    >
      {getIcon(evidence.type)}
      <div>
        <div>
          {marker && <span>{marker}</span> - }
          {evidence.label}
        </div>
        <div>
          {evidence.file.name} • {formatFileSize(evidence.file.size)}
        </div>
      </div>
      <button>⋮</button>
    </div>
  );
}

function createDragImage(evidence: Evidence): HTMLElement {
  const el = document.createElement('div');
  el.className = 'evidence-drag-image';
  el.textContent = evidence.type === 'exhibit'
    ? `📎 Exhibit ${evidence.label}`
    : `📚 ${evidence.label}`;
  document.body.appendChild(el);
  return el;
}
```

**Editor Drop Target:**
```typescript
import { Extension } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';

export const EvidenceDropTarget = Extension.create({
  name: 'evidenceDropTarget',

  addProseMirrorPlugins() {
    const editor = this.editor;

    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            dragover(view, event) {
              // Check if it's evidence data
              if (event.dataTransfer?.types.includes('application/x-evidence')) {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'copy';

                // Show drop indicator at cursor position
                const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
                if (pos) {
                  showDropIndicator(view, pos.pos);
                }

                return true;
              }
              return false;
            },

            dragleave(view, event) {
              hideDropIndicator();
              return false;
            },

            drop(view, event) {
              const data = event.dataTransfer?.getData('application/x-evidence');
              if (!data) return false;

              event.preventDefault();
              hideDropIndicator();

              const evidence = JSON.parse(data);
              const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });

              if (pos) {
                // Find the sentence at drop position
                const sentenceId = findSentenceAtPosition(view.state.doc, pos.pos);

                // Insert citation
                editor.chain()
                  .focus()
                  .insertContentAt(pos.pos, {
                    type: 'citation',
                    attrs: {
                      id: `cit-${crypto.randomUUID().slice(0, 8)}`,
                      evidenceType: evidence.type,
                      evidenceId: evidence.id,
                      supportsSentenceIds: sentenceId ? [sentenceId] : [],
                      displayMode: 'inline',
                    },
                    content: evidence.type !== 'exhibit' ? [
                      { type: 'text', text: evidence.label }
                    ] : undefined,
                  })
                  .run();

                // If dropped in a sentence, auto-link to that sentence
                if (sentenceId) {
                  showToast({
                    type: 'success',
                    message: `Citation linked to sentence`,
                  });
                }
              }

              return true;
            },
          },
        },
      }),
    ];
  },
});

function showDropIndicator(view: EditorView, pos: number) {
  // Create a blinking cursor indicator at drop position
  const coords = view.coordsAtPos(pos);

  let indicator = document.getElementById('drop-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'drop-indicator';
    indicator.className = 'drop-indicator';
    document.body.appendChild(indicator);
  }

  indicator.style.left = `${coords.left}px`;
  indicator.style.top = `${coords.top}px`;
  indicator.style.height = `${coords.bottom - coords.top}px`;
  indicator.style.display = 'block';
}

function hideDropIndicator() {
  const indicator = document.getElementById('drop-indicator');
  if (indicator) {
    indicator.style.display = 'none';
  }
}
```

**Drop Indicator Styling:**
```css
.drop-indicator {
  position: fixed;
  width: 2px;
  background-color: #3B82F6;
  pointer-events: none;
  z-index: 1000;
  animation: blink 0.5s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.evidence-drag-image {
  position: fixed;
  top: -1000px;
  left: -1000px;
  padding: 8px 12px;
  background: #1F2937;
  color: white;
  border-radius: 4px;
  font-size: 14px;
  white-space: nowrap;
}

.evidence-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: grab;
  transition: background-color 0.15s;
}

.evidence-item:hover {
  background-color: #F3F4F6;
}

.evidence-item:active {
  cursor: grabbing;
}

.evidence-item.dragging {
  opacity: 0.5;
}
```

**Document Viewer Modal:**

When user clicks "View" on evidence:
```
┌─────────────────────────────────────────────────────────────────────────┐
│  📎 Exhibit A - Signed Contract                                    [×]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                                                                     ││
│  │                                                                     ││
│  │                     [PDF Viewer / Image Display]                    ││
│  │                                                                     ││
│  │                                                                     ││
│  │                                                                     ││
│  │                                                                     ││
│  │                                                                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  contract.pdf • 245 KB • Uploaded Nov 15, 2024                         │
│                                                                         │
│  Cited in:                                                              │
│  • Paragraph 3: "The contract clearly states..."  [Jump]               │
│  • Paragraph 7: "As shown in Exhibit A..."        [Jump]               │
│                                                                         │
│                                    [Download]  [Replace]  [Close]       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**PDF Viewer Implementation:**
```typescript
function DocumentViewer({ evidence, citations }: Props) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    // Convert base64 to blob URL for PDF.js
    if (evidence.file.type === 'application/pdf') {
      const binary = atob(evidence.file.data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      setPdfUrl(URL.createObjectURL(blob));
    }

    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [evidence]);

  // Find citations that reference this evidence
  const citingLocations = citations
    .filter(c => c.evidenceId === evidence.id)
    .map(c => ({
      citationId: c.id,
      sentenceIds: c.supportsSentenceIds,
    }));

  return (
    <div>
      {evidence.file.type === 'application/pdf' ? (
        <PDFViewer url={pdfUrl} />
      ) : evidence.file.type.startsWith('image/') ? (
        <img src={`data:${evidence.file.type};base64,${evidence.file.data}`} />
      ) : (
        <div>
          Preview not available for this file type.
          <button>Download to view</button>
        </div>
      )}

      <div>
        Cited in:
        {citingLocations.length === 0 ? (
          <p>Not yet cited in document</p>
        ) : (
          <ul>
            {citingLocations.map(loc => (
              <li>
                {getSentencePreview(loc.sentenceIds[0])}
                <button onClick={() => jumpToCitation(loc.citationId)}>Jump</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
```

**Search Functionality:**
```typescript
function EvidenceSearch({ evidence, onFilter }: Props) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!query.trim()) {
      onFilter(evidence);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = evidence.filter(e =>
      e.label.toLowerCase().includes(lowerQuery) ||
      e.shortLabel?.toLowerCase().includes(lowerQuery) ||
      e.description?.toLowerCase().includes(lowerQuery) ||
      e.file.name.toLowerCase().includes(lowerQuery)
    );

    onFilter(filtered);
  }, [query, evidence]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search evidence..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <span>🔍</span>
    </div>
  );
}
```

### 11.12 Evidence Map Panel

The Evidence Map visualizes the relationship between claims (sentences) and supporting evidence. It shows gaps and unused evidence.

**Map Structure:**
```
┌─ EVIDENCE MAP ──────────────────────────────┐
│                                             │
│ ▼ Supported Claims (4)                      │
│   ┌─────────────────────────────────────────┤
│   │ "Defendant had a duty to respond        │
│   │  within 21 days."                       │
│   │   └─ 📚 Smith v. Jones         [view]   │
│   ├─────────────────────────────────────────┤
│   │ "Failure to respond constitutes a       │
│   │  waiver of objections."                 │
│   │   ├─ 📚 Smith v. Jones         [view]   │
│   │   └─ 📎 Exhibit A              [view]   │
│   ├─────────────────────────────────────────┤
│   │ "The requests were properly served."    │
│   │   └─ 📎 Exhibit B              [view]   │
│   ├─────────────────────────────────────────┤
│   │ "Texas Rule 196.1 requires complete     │
│   │  responses."                            │
│   │   └─ 📜 TEX. R. CIV. P. 196.1  [view]   │
│   └─────────────────────────────────────────┤
│                                             │
│ ▼ Unsupported Claims (2)              ⚠️    │
│   ┌─────────────────────────────────────────┤
│   │ "Plaintiff's objections lack merit."    │
│   │   [+ Add Support]                       │
│   ├─────────────────────────────────────────┤
│   │ "The discovery requests were not        │
│   │  overbroad."                            │
│   │   [+ Add Support]                       │
│   └─────────────────────────────────────────┤
│                                             │
│ ▼ Unused Evidence (1)                       │
│   ┌─────────────────────────────────────────┤
│   │ 📎 Exhibit C - Invoice                  │
│   │   Not cited in document                 │
│   │   [Insert Citation]                     │
│   └─────────────────────────────────────────┤
│                                             │
│ ▼ Unlinked Citations (1)              ⚠️    │
│   ┌─────────────────────────────────────────┤
│   │ "Doe v. State, 789 S.W.3d..."          │
│   │   Citation found but no file uploaded   │
│   │   [Upload Opinion]  [Skip]              │
│   └─────────────────────────────────────────┤
│                                             │
└─────────────────────────────────────────────┘
```

**Data Computation:**
```typescript
// NOTE: This is the BACKEND data format.
// UI format is defined in Section 19.7.8 and may differ.
// Backend computes this format; UI transforms it for display.

interface EvidenceMapData {
  supportedClaims: SupportedClaim[];
  unsupportedClaims: UnsupportedClaim[];
  unusedEvidence: Evidence[];
  unlinkedCitations: UnlinkedCitation[];
}

interface SupportedClaim {
  sentenceId: string;
  sentenceText: string;
  paragraphIndex: number;
  supportingEvidence: {
    evidenceId: string;
    evidenceType: EvidenceType;
    label: string;
    citationId: string;
  }[];
}

interface UnsupportedClaim {
  sentenceId: string;
  sentenceText: string;
  paragraphIndex: number;
}

interface UnlinkedCitation {
  citationId: string;
  detectedText: string;
  evidenceType: EvidenceType;
  position: { paragraph: number; offset: number };
}

function computeEvidenceMap(
  document: ProseMirrorDocument,
  sentenceRegistry: SentenceRegistry,
  evidence: Evidence[],
  citations: CitationNode[]
): EvidenceMapData {
  // Build map of sentence ID -> supporting evidence
  const sentenceSupport = new Map<string, SupportedClaim['supportingEvidence']>();
  const citedEvidenceIds = new Set<string>();
  const unlinkedCitations: UnlinkedCitation[] = [];

  // Walk through all citations
  for (const citation of citations) {
    if (!citation.evidenceId) {
      // Unlinked citation
      unlinkedCitations.push({
        citationId: citation.id,
        detectedText: extractCitationText(citation),
        evidenceType: citation.evidenceType,
        position: findCitationPosition(document, citation.id),
      });
      continue;
    }

    citedEvidenceIds.add(citation.evidenceId);

    // Record support for each linked sentence
    for (const sentenceId of citation.supportsSentenceIds) {
      if (!sentenceSupport.has(sentenceId)) {
        sentenceSupport.set(sentenceId, []);
      }

      const evidenceItem = evidence.find(e => e.id === citation.evidenceId);
      if (evidenceItem) {
        sentenceSupport.get(sentenceId)!.push({
          evidenceId: citation.evidenceId,
          evidenceType: citation.evidenceType,
          label: evidenceItem.label,
          citationId: citation.id,
        });
      }
    }
  }

  // Build supported claims list
  const supportedClaims: SupportedClaim[] = [];
  const unsupportedClaims: UnsupportedClaim[] = [];

  for (const para of sentenceRegistry.paragraphs) {
    for (const sentence of para.sentences) {
      const support = sentenceSupport.get(sentence.id);

      if (support && support.length > 0) {
        supportedClaims.push({
          sentenceId: sentence.id,
          sentenceText: sentence.text,
          paragraphIndex: parseInt(para.paragraphId.replace('p', '')),
          supportingEvidence: support,
        });
      } else if (looksLikeClaim(sentence.text)) {
        // Only flag sentences that look like claims
        unsupportedClaims.push({
          sentenceId: sentence.id,
          sentenceText: sentence.text,
          paragraphIndex: parseInt(para.paragraphId.replace('p', '')),
        });
      }
    }
  }

  // Find unused evidence
  const unusedEvidence = evidence.filter(e => !citedEvidenceIds.has(e.id));

  return {
    supportedClaims,
    unsupportedClaims,
    unusedEvidence,
    unlinkedCitations,
  };
}


function extractCitationText(citation: CitationNode, evidence: Evidence): string {
  /**
   * Extract display text for a citation.
   *
   * For exhibits: Generate marker-based text "(Exhibit A)"
   * For case law/statutes: Use existing citation node content
   */

  if (citation.attrs.evidenceType === 'exhibit') {
    // For exhibits, generate display text from marker
    const marker = getCitationMarker(citation.attrs.evidenceId, evidenceMap);

    switch (citation.attrs.displayMode) {
      case 'inline':
        return `(Exhibit ${marker})`;
      case 'parenthetical':
        return `See Exhibit ${marker}`;
      case 'textual':
        return `Exhibit ${marker}`;
      default:
        return `(Exhibit ${marker})`;
    }
  } else {
    // For case law and statutes, extract text from citation node content
    if (citation.content && citation.content.length > 0) {
      return citation.content
        .filter(node => node.type === 'text')
        .map(node => node.text)
        .join('');
    }

    // Fallback: use evidence label
    return evidence.label || '[Citation]';
  }
}


function findCitationPosition(
  citation: CitationNode,
  document: ProseMirrorDocument
): { paragraph: number; offset: number } | null {
  /**
   * Find the position of a citation node in the document.
   *
   * Returns paragraph index and character offset within that paragraph.
   */

  let paragraphIndex = 0;

  function walk(node: any, depth: number = 0): { paragraph: number; offset: number } | null {
    if (node.type === 'paragraph') {
      // Search for citation in this paragraph
      let charOffset = 0;

      for (const child of (node.content || [])) {
        if (child.type === 'citation' && child.attrs.id === citation.attrs.id) {
          // Found it
          return { paragraph: paragraphIndex, offset: charOffset };
        }

        // Update offset
        if (child.type === 'text') {
          charOffset += child.text.length;
        } else {
          charOffset += 1;  // Non-text nodes count as 1 character
        }
      }

      paragraphIndex++;
    }

    // Recurse into children
    if (node.content) {
      for (const child of node.content) {
        const result = walk(child, depth + 1);
        if (result) return result;
      }
    }

    return null;
  }

  return walk(document);
}


function getCitationMarker(
  evidenceId: string,
  evidenceMap: Map<string, Evidence>
): string {
  /**
   * Get the computed marker for an evidence item.
   *
   * For exhibits: A, B, C... computed by first occurrence
   * For case law/statutes: Not applicable (return empty string)
   */

  const evidence = evidenceMap.get(evidenceId);
  if (!evidence) return '?';

  if (evidence.type === 'exhibit') {
    // Would be computed from citation index (Section 2.7)
    // For now, placeholder logic
    const exhibitList = Array.from(evidenceMap.values())
      .filter(ev => ev.type === 'exhibit')
      .sort((a, b) => a.uploaded_at.localeCompare(b.uploaded_at));

    const index = exhibitList.findIndex(ev => ev.id === evidenceId);
    if (index >= 0) {
      return numberToAlpha(index);
    }
  }

  return '';
}


function numberToAlpha(n: number): string {
  /**
   * Convert number to alphabetic marker: 0→A, 1→B, 25→Z, 26→AA, etc.
   */
  let result = '';
  let num = n;

  do {
    result = String.fromCharCode(65 + (num % 26)) + result;
    num = Math.floor(num / 26) - 1;
  } while (num >= 0);

  return result;
}


interface CitationPosition {
  paragraph: number;     // 0-indexed paragraph in document
  offset: number;        // Character offset within paragraph
  sentenceId?: string;   // If citation links to specific sentence
}


function looksLikeClaim(text: string): boolean {
  // Heuristics for identifying claim-like sentences
  // (vs. transitional or procedural text)

  const claimIndicators = [
    /\b(must|shall|should|requires?|mandates?|prohibits?)\b/i,
    /\b(failed?|refused?|violated?|breached?)\b/i,
    /\b(is|are|was|were)\s+(not\s+)?(required|necessary|proper|valid)/i,
    /\b(therefore|thus|accordingly|consequently)\b/i,
    /\b(clearly|obviously|plainly)\s+(shows?|demonstrates?|establishes?)/i,
  ];

  const proceduralIndicators = [
    /^(NOW COMES|COMES NOW)/i,
    /^(Respectfully submitted)/i,
    /^(WHEREFORE|PRAYER)/i,
    /\b(files? this|submits? this)\b/i,
  ];

  // Skip procedural sentences
  for (const pattern of proceduralIndicators) {
    if (pattern.test(text)) return false;
  }

  // Check for claim indicators
  for (const pattern of claimIndicators) {
    if (pattern.test(text)) return true;
  }

  // Default: don't flag as unsupported
  return false;
}
```

**Vue Component:**
```vue
<!-- EvidenceMap.vue -->
<template>
  <div class="evidence-map">
    <!-- Supported Claims -->
    <details open>
      <summary>
        <span class="section-icon">✓</span>
        Supported Claims ({{ mapData.supportedClaims.length }})
      </summary>

      <div class="claims-list">
        <div
          v-for="claim in mapData.supportedClaims"
          :key="claim.sentenceId"
          class="claim-item supported"
          @click="jumpToSentence(claim.sentenceId)"
        >
          <p class="claim-text">"{{ truncate(claim.sentenceText, 80) }}"</p>
          <ul class="evidence-list">
            <li
              v-for="ev in claim.supportingEvidence"
              :key="ev.citationId"
            >
              <span class="evidence-icon">{{ getIcon(ev.evidenceType) }}</span>
              <span class="evidence-label">{{ ev.label }}</span>
              <button @click.stop="viewEvidence(ev.evidenceId)">view</button>
            </li>
          </ul>
        </div>
      </div>
    </details>

    <!-- Unsupported Claims -->
    <details v-if="mapData.unsupportedClaims.length > 0" open>
      <summary class="warning">
        <span class="section-icon">⚠️</span>
        Unsupported Claims ({{ mapData.unsupportedClaims.length }})
      </summary>

      <div class="claims-list">
        <div
          v-for="claim in mapData.unsupportedClaims"
          :key="claim.sentenceId"
          class="claim-item unsupported"
          @click="jumpToSentence(claim.sentenceId)"
        >
          <p class="claim-text">"{{ truncate(claim.sentenceText, 80) }}"</p>
          <button
            class="add-support-btn"
            @click.stop="openAddSupportModal(claim.sentenceId)"
          >
            + Add Support
          </button>
        </div>
      </div>
    </details>

    <!-- Unused Evidence -->
    <details v-if="mapData.unusedEvidence.length > 0">
      <summary>
        <span class="section-icon">📋</span>
        Unused Evidence ({{ mapData.unusedEvidence.length }})
      </summary>

      <div class="evidence-items">
        <div
          v-for="ev in mapData.unusedEvidence"
          :key="ev.id"
          class="evidence-item unused"
        >
          <span class="evidence-icon">{{ getIcon(ev.type) }}</span>
          <div class="evidence-info">
            <span class="evidence-label">{{ ev.label }}</span>
            <span class="evidence-status">Not cited in document</span>
          </div>
          <button @click="insertCitation(ev)">Insert Citation</button>
        </div>
      </div>
    </details>

    <!-- Unlinked Citations -->
    <details v-if="mapData.unlinkedCitations.length > 0">
      <summary class="warning">
        <span class="section-icon">⚠️</span>
        Unlinked Citations ({{ mapData.unlinkedCitations.length }})
      </summary>

      <div class="citation-items">
        <div
          v-for="cit in mapData.unlinkedCitations"
          :key="cit.citationId"
          class="citation-item unlinked"
        >
          <p class="citation-text">"{{ truncate(cit.detectedText, 60) }}"</p>
          <span class="citation-status">
            Citation found but no file uploaded
          </span>
          <div class="citation-actions">
            <button @click="uploadForCitation(cit)">
              Upload {{ getTypeLabel(cit.evidenceType) }}
            </button>
            <button @click="skipCitation(cit.citationId)" class="secondary">
              Skip
            </button>
          </div>
        </div>
      </div>
    </details>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useEditor } from '../composables/useEditor';
import { useEvidenceMap } from '../composables/useEvidenceMap';

const props = defineProps({
  document: Object,
  sentenceRegistry: Object,
  evidence: Array,
});

const { scrollToPosition, insertAtCursor } = useEditor();
const { mapData } = useEvidenceMap(
  () => props.document,
  () => props.sentenceRegistry,
  () => props.evidence
);

function jumpToSentence(sentenceId: string) {
  const position = findSentencePosition(sentenceId);
  scrollToPosition(position);
  highlightSentence(sentenceId);
}

function openAddSupportModal(sentenceId: string) {
  // Opens modal to select evidence
  // When confirmed, creates citation and links to sentence
}

function insertCitation(evidence: Evidence) {
  // Insert at current cursor position
  insertAtCursor({
    type: 'citation',
    attrs: {
      id: `cit-${crypto.randomUUID().slice(0, 8)}`,
      evidenceType: evidence.type,
      evidenceId: evidence.id,
      supportsSentenceIds: [],
      displayMode: 'inline',
    },
  });
}

function getIcon(type: string): string {
  switch (type) {
    case 'exhibit': return '📎';
    case 'caselaw': return '📚';
    case 'statute': return '📜';
    default: return '📄';
  }
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 3) + '...';
}
</script>

<style scoped>
.evidence-map {
  padding: 12px;
  font-size: 14px;
}

details {
  margin-bottom: 12px;
}

summary {
  cursor: pointer;
  font-weight: 600;
  padding: 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

summary.warning {
  color: #B45309;
}

.claims-list, .evidence-items, .citation-items {
  margin-left: 20px;
}

.claim-item {
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.15s;
}

.claim-item:hover {
  background-color: #F9FAFB;
}

.claim-item.supported {
  border-left: 3px solid #10B981;
}

.claim-item.unsupported {
  border-left: 3px solid #F59E0B;
  background-color: #FFFBEB;
}

.claim-text {
  margin: 0 0 8px 0;
  font-style: italic;
  color: #374151;
}

.evidence-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.evidence-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 13px;
}

.evidence-list button {
  font-size: 12px;
  padding: 2px 6px;
  background: none;
  border: 1px solid #D1D5DB;
  border-radius: 4px;
  cursor: pointer;
}

.add-support-btn {
  font-size: 13px;
  padding: 4px 12px;
  background: #FEF3C7;
  border: 1px solid #F59E0B;
  border-radius: 4px;
  cursor: pointer;
}

.add-support-btn:hover {
  background: #FDE68A;
}

.evidence-item.unused {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #F9FAFB;
  border-radius: 6px;
  margin-bottom: 8px;
}

.evidence-status {
  font-size: 12px;
  color: #6B7280;
}

.citation-item.unlinked {
  padding: 12px;
  background: #FFFBEB;
  border: 1px solid #F59E0B;
  border-radius: 6px;
  margin-bottom: 8px;
}

.citation-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.citation-actions button {
  font-size: 13px;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.citation-actions button:not(.secondary) {
  background: #3B82F6;
  color: white;
  border: none;
}

.citation-actions button.secondary {
  background: white;
  border: 1px solid #D1D5DB;
}
</style>
```

**"Add Support" Modal:**

When user clicks "+ Add Support" on an unsupported claim:
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Add Supporting Authority                                          [×]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Claim:                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ "Plaintiff's objections lack merit."                               ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  Select supporting evidence:                                            │
│                                                                         │
│  ┌─ Exhibits ──────────────────────────────────────────────────────────┐│
│  │ ○ Exhibit A - Signed Contract                                      ││
│  │ ○ Exhibit B - Email Correspondence                                 ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  ┌─ Case Law ──────────────────────────────────────────────────────────┐│
│  │ ● Smith v. Jones, 123 S.W.3d 456                              ← ✓  ││
│  │ ○ Doe v. State, 456 S.W.3d 789                                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  ┌─ Statutes ──────────────────────────────────────────────────────────┐│
│  │ ○ TEX. R. CIV. P. 196.1                                            ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  Insert citation:                                                       │
│  ○ At end of sentence                                                  │
│  ● At current cursor position                                          │
│  ○ As footnote                                                         │
│                                                                         │
│                                         [Cancel]  [Add Citation]        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Sentence Highlighting on Hover:**

When hovering over a claim in the evidence map, highlight it in the editor:
```typescript
function highlightSentence(sentenceId: string) {
  const position = findSentencePosition(sentenceId);
  if (!position) return;

  // Add temporary decoration
  const decoration = Decoration.inline(position.from, position.to, {
    class: 'highlighted-sentence',
  });

  // Remove after 2 seconds
  setTimeout(() => {
    removeDecoration(decoration);
  }, 2000);
}
```
```css
.highlighted-sentence {
  background-color: #FEF08A;
  transition: background-color 0.3s;
}

.highlighted-sentence.fading {
  background-color: transparent;
}
```

---

## 13. Persistence & Storage

### 12.1 Client-Side Persistence

#### 12.1.1 localStorage Structure

```
localStorage keys:
├── factsway_templates          // JSON array of Template objects
├── factsway_cases              // JSON array of Case objects
├── factsway_drafts             // JSON array of Draft objects
├── factsway_settings           // User preferences
└── factsway_last_opened        // ID of last opened draft
```

#### 12.1.2 IndexedDB (Images)

Binary image data is stored in IndexedDB to avoid localStorage quota limits.

**Database Initialization:**

```typescript
function openImageDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('factsway_storage', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create images object store if it doesn't exist
      if (!db.objectStoreNames.contains('images')) {
        const store = db.createObjectStore('images', { keyPath: 'id' });

        // Create index for querying by evidence_id
        store.createIndex('evidence_id', 'evidence_id', { unique: false });
      }
    };
  });
}
```

**Storage Operations:**

All operations documented in Section 6.7.

**Quota Management:**

```typescript
async function checkStorageQuota(): Promise<{ used: number; available: number }> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      used: estimate.usage || 0,
      available: estimate.quota || 0,
    };
  }

  // Fallback: assume 50MB available
  return { used: 0, available: 50 * 1024 * 1024 };
}
```

**Error Handling:**

| Error | Cause | Solution |
|-------|-------|----------|
| `QuotaExceededError` | Storage limit reached | Delete old images or suggest clearing browser data |
| `VersionError` | Database version mismatch | Close all tabs, refresh page |
| `DataError` | Invalid data | Validate image before storing |

**Backup/Export:**

Images are NOT included in JSON export (too large). Instead:
- Export includes image metadata (filename, size, evidence_id)
- User must manually back up source image files
- Or implement separate image export (ZIP download)

**Import:**

When importing a backup:
- Image metadata is restored
- Image blobs are NOT restored (marked as "missing")
- User must re-upload images or skip them

### 12.2 Auto-Save Behavior

- Draft body content auto-saves every 30 seconds while editing
- Auto-save on blur (user clicks outside editor)
- Auto-save before export
- Visual indicator: "Saved" / "Saving..." / "Unsaved changes"

### 12.3 Export/Import for Backup

**Export All:**
- Generates `factsway_backup_{{timestamp}}.json`
- Contains: all templates, cases, drafts
- User downloads file

**Import:**
- User uploads `.json` backup file
- System validates structure
- User confirms before import

#### 12.3.1 Import Behavior

When importing a JSON backup, the system handles conflicts using **ID-based merging** with explicit rules:

**Merge Strategy:**

```typescript
interface ImportOptions {
  mode: 'merge' | 'replace';
  conflictResolution: 'keep_existing' | 'prefer_import' | 'prompt_user';
}
```

**Mode: 'merge' (default)**

- Compares imported items with existing items by ID
- For matching IDs: Apply conflict resolution strategy
- For new IDs: Add to storage
- For IDs in storage but not in import: Keep existing (no deletion)

**Mode: 'replace'**

- Deletes all existing data in scope (templates/cases/drafts)
- Imports all items from backup
- Equivalent to "restore from backup"
- Requires user confirmation (destructive operation)

**Conflict Resolution Strategies:**

**1. 'keep_existing' (safest)**
```typescript
if (existingItem.id === importedItem.id) {
  // Keep what's already in storage, ignore imported version
  result.skipped.push(importedItem.id);
}
```

**When to use:** User wants to preserve local changes, import only new items

**2. 'prefer_import' (overwrite)**
```typescript
if (existingItem.id === importedItem.id) {
  // Overwrite with imported version
  // Check modified_at timestamp to avoid losing newer changes
  if (importedItem.modified_at > existingItem.modified_at) {
    storage[importedItem.id] = importedItem;
    result.updated.push(importedItem.id);
  } else {
    result.skipped.push(importedItem.id);
    result.warnings.push(`Skipped ${importedItem.id}: import older than existing`);
  }
}
```

**When to use:** User wants imported data to take precedence, but protect against accidental overwrites with old backups

**3. 'prompt_user' (interactive)**
```typescript
if (existingItem.id === importedItem.id) {
  // Show diff to user, let them choose:
  // - Keep existing
  // - Use imported
  // - Merge manually (future feature)

  const userChoice = await showConflictDialog(existingItem, importedItem);

  if (userChoice === 'import') {
    storage[importedItem.id] = importedItem;
    result.updated.push(importedItem.id);
  } else {
    result.skipped.push(importedItem.id);
  }
}
```

**When to use:** User importing backup and uncertain which version to keep

**Import Result:**

```typescript
interface ImportResult {
  success: boolean;
  imported: {
    templates: number;    // Count of templates added
    cases: number;        // Count of cases added
    drafts: number;       // Count of drafts added
  };
  updated: {
    templates: string[];  // IDs of templates updated
    cases: string[];      // IDs of cases updated
    drafts: string[];     // IDs of drafts updated
  };
  skipped: {
    templates: string[];  // IDs skipped due to conflicts
    cases: string[];
    drafts: string[];
  };
  errors: {
    id: string;
    type: 'template' | 'case' | 'draft';
    error: string;
  }[];
  warnings: string[];
}
```

**Error Handling:**

```typescript
// Validation before import
function validateImportData(json: any): ValidationResult {
  if (!json.templates || !Array.isArray(json.templates)) {
    return { valid: false, error: 'Missing templates array' };
  }

  if (!json.cases || !Array.isArray(json.cases)) {
    return { valid: false, error: 'Missing cases array' };
  }

  if (!json.drafts || !Array.isArray(json.drafts)) {
    return { valid: false, error: 'Missing drafts array' };
  }

  // Validate each item has required fields
  for (const template of json.templates) {
    if (!template.id || !template.name) {
      return { valid: false, error: `Invalid template: ${template.id}` };
    }
  }

  // Similar validation for cases and drafts...

  return { valid: true };
}

// Transactional import (all or nothing per type)
async function importData(json: any, options: ImportOptions): Promise<ImportResult> {
  const validation = validateImportData(json);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const result: ImportResult = {
    success: true,
    imported: { templates: 0, cases: 0, drafts: 0 },
    updated: { templates: [], cases: [], drafts: [] },
    skipped: { templates: [], cases: [], drafts: [] },
    errors: [],
    warnings: []
  };

  try {
    // Import templates
    result.imported.templates = await importTemplates(
      json.templates,
      options,
      result
    );

    // Import cases (may reference templates)
    result.imported.cases = await importCases(
      json.cases,
      options,
      result
    );

    // Import drafts (may reference cases)
    result.imported.drafts = await importDrafts(
      json.drafts,
      options,
      result
    );

  } catch (error) {
    result.success = false;
    result.errors.push({
      id: 'import_failed',
      type: 'template',  // or detected type
      error: error.message
    });
  }

  return result;
}
```

**UI Guidelines:**

1. **Import Dialog:** Show options for mode and conflict resolution
2. **Progress Indicator:** Show counts as items are imported
3. **Conflict Prompts:** If mode='prompt_user', show side-by-side comparison
4. **Results Summary:** Show what was imported/updated/skipped with counts
5. **Error Display:** List any items that failed with reasons

**Default Behavior:**

If user doesn't specify options:
```typescript
const defaultOptions: ImportOptions = {
  mode: 'merge',
  conflictResolution: 'keep_existing'
};
```

This is the safest option - import only new items, never overwrite existing data.

**Export Single Template/Case/Draft:**
- Right-click → Export
- Generates single-object JSON file
- Can be imported into another browser/machine

---

## 14. Export Pipeline

### 13.1 Pipeline Steps

```
1. CREATE MAIN DOCUMENT
   └─ Initialize new Document with python-docx
   └─ Apply reference.docx styles

2. GENERATE CASE BLOCK (OOXML)
   └─ Use generate_case_block_ooxml() from Section 4.3
   └─ Adds: Court designation, party table, motion title, salutation
   └─ Output: Main document with case block

3. TRANSFORM BODY HTML
   └─ Input: Draft.body (HTML from Tiptap)
   └─ Transform footnotes from tiptap-footnotes format to Pandoc dpub-aria format
   └─ Apply outline schema numbering to headings
   └─ Output: Pandoc-compatible HTML

4. CONVERT BODY TO DOCX
   └─ Run Pandoc: HTML → DOCX with reference.docx styles
   └─ Pandoc creates native Word footnotes
   └─ Output: Temporary body.docx

5. MERGE BODY INTO MAIN DOCUMENT
   └─ Extract paragraphs from body.docx
   └─ Append to main document after case block
   └─ Copy footnotes.xml part if present
   └─ Output: Main document with case block + body

6. INJECT SIGNATURE BLOCK (OOXML)
   └─ Populate signature variables
   └─ Append signature OOXML to document
   └─ Output: Document with signature

7. INJECT CERTIFICATE OF SERVICE (if enabled)
   └─ Populate certificate variables
   └─ Append certificate OOXML to document
   └─ Output: Document with certificate

8. ADD FOOTER (OOXML)
   └─ Use add_three_column_footer() from Section 8.5
   └─ Includes motion title and page numbers
   └─ Output: Final document with footer

9. SAVE AND RETURN
   └─ Save final.docx
   └─ Stream to browser
```

### 13.2 Footnote Transformation (Step 3 Detail)

Tiptap-footnotes outputs HTML that Pandoc 3.6+ cannot parse without transformation. This step converts the HTML to dpub-aria format.

**Input (tiptap-footnotes output):**
```html
<p>Legal argument<sup data-footnote-reference="fn-1">1</sup> continues.</p>
<footer class="footnotes">
  <ol>
    <li data-footnote="fn-1"><p>Citation text.</p></li>
  </ol>
</footer>
```

**Output (Pandoc-compatible):**
```html
<p>Legal argument<a href="#fn1" id="fnref1" class="footnote-ref" role="doc-noteref"><sup>1</sup></a> continues.</p>
<section id="footnotes" class="footnotes" role="doc-endnotes">
  <hr />
  <ol>
    <li id="fn1"><p>Citation text.<a href="#fnref1" class="footnote-back" role="doc-backlink">↩︎</a></p></li>
  </ol>
</section>
```

**Python Implementation:**
```python
from bs4 import BeautifulSoup
import re

def transform_footnotes_for_pandoc(html: str) -> str:
    """
    Transform tiptap-footnotes HTML to Pandoc dpub-aria format.

    Args:
        html: Raw HTML from Tiptap editor

    Returns:
        Transformed HTML compatible with Pandoc 3.6+
    """
    soup = BeautifulSoup(html, 'html.parser')

    # Find all footnote references
    refs = soup.find_all('sup', attrs={'data-footnote-reference': True})
    for ref in refs:
        fn_id = ref['data-footnote-reference']
        fn_num = ref.get_text()

        # Create Pandoc-style reference
        new_ref = soup.new_tag('a', href=f'#{fn_id}', id=f'{fn_id}ref')
        new_ref['class'] = 'footnote-ref'
        new_ref['role'] = 'doc-noteref'

        sup = soup.new_tag('sup')
        sup.string = fn_num
        new_ref.append(sup)

        ref.replace_with(new_ref)

    # Find footnotes section
    footer = soup.find('footer', class_='footnotes')
    if footer:
        # Convert to section with role
        section = soup.new_tag('section', id='footnotes')
        section['class'] = 'footnotes'
        section['role'] = 'doc-endnotes'

        # Add horizontal rule
        hr = soup.new_tag('hr')
        section.append(hr)

        # Process each footnote
        ol = soup.new_tag('ol')
        for li in footer.find_all('li', attrs={'data-footnote': True}):
            fn_id = li['data-footnote']

            new_li = soup.new_tag('li', id=fn_id)

            # Move content
            for child in list(li.children):
                new_li.append(child.extract() if hasattr(child, 'extract') else child)

            # Add backlink to last paragraph
            last_p = new_li.find_all('p')[-1] if new_li.find_all('p') else None
            if last_p:
                backlink = soup.new_tag('a', href=f'#{fn_id}ref')
                backlink['class'] = 'footnote-back'
                backlink['role'] = 'doc-backlink'
                backlink.string = '↩︎'
                last_p.append(backlink)

            ol.append(new_li)

        section.append(ol)
        footer.replace_with(section)

    return str(soup)
```

### 13.3 Pandoc Conversion Command (Step 4 Detail)

```python
import subprocess
import tempfile
from pathlib import Path

def convert_html_to_docx(html: str, reference_doc: Path) -> Path:
    """
    Convert HTML to DOCX using Pandoc.

    Args:
        html: Pandoc-compatible HTML (after footnote transformation)
        reference_doc: Path to reference.docx for styling

    Returns:
        Path to generated temporary DOCX file
    """
    # Write HTML to temp file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False) as f:
        f.write(html)
        html_path = Path(f.name)

    # Output path
    docx_path = html_path.with_suffix('.docx')

    # Run Pandoc
    result = subprocess.run([
        'pandoc',
        '-f', 'html',
        '-t', 'docx',
        f'--reference-doc={reference_doc}',
        '-o', str(docx_path),
        str(html_path)
    ], capture_output=True, text=True)

    if result.returncode != 0:
        raise RuntimeError(f"Pandoc conversion failed: {result.stderr}")

    # Clean up HTML temp file
    html_path.unlink()

    return docx_path
```

### 13.4 Document Merging (Step 5 Detail)

```python
from docx import Document
from docx.oxml import OxmlElement
from copy import deepcopy

def merge_body_into_document(main_doc: Document, body_docx_path: Path) -> None:
    """
    Extract body content from Pandoc-generated DOCX and append to main document.

    This preserves:
    - Paragraph styles
    - Character formatting (bold, italic, underline)
    - Footnotes (as native Word footnotes)
    - Images
    - Tables

    Args:
        main_doc: The main document (with case block already added)
        body_docx_path: Path to Pandoc-generated body DOCX
    """
    body_doc = Document(body_docx_path)

    # Get the main document body element
    main_body = main_doc.element.body

    # Copy each element from body document
    for element in body_doc.element.body:
        # Deep copy to avoid reference issues
        new_element = deepcopy(element)
        main_body.append(new_element)

    # Also need to copy footnotes part if it exists
    copy_footnotes(body_doc, main_doc)

def copy_footnotes(source_doc: Document, target_doc: Document) -> Dict[int, int]:
    """
    Extract footnotes from source document and merge into target document.

    Footnotes must be:
    1. Extracted from source_doc with their original markers
    2. Renumbered sequentially starting from 1
    3. Added to target_doc's footnotes part
    4. References in body text updated to new numbers

    Args:
        source_doc: Pandoc-generated document with footnotes
        target_doc: Final merged document (case block + body + signature)

    Returns:
        Mapping of old footnote IDs to new IDs for reference updates
    """
    from copy import deepcopy
    from docx.oxml.shared import OxmlElement, qn
    from docx.opc.constants import RELATIONSHIP_TYPE as RT

    # Step 1: Check if source document has footnotes
    try:
        source_footnotes_part = source_doc.part.footnotes_part
    except AttributeError:
        # No footnotes part - nothing to merge
        return {}

    if source_footnotes_part is None:
        return {}

    # Step 2: Ensure target document has footnotes part
    target_part = target_doc.part

    try:
        target_footnotes_part = target_part.footnotes_part
    except AttributeError:
        target_footnotes_part = None

    if target_footnotes_part is None:
        # Create footnotes part in target document
        footnotes_part = target_part._add_part(
            'word/footnotes.xml',
            RT.FOOTNOTES,
            'application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml'
        )

        # Initialize with empty footnotes container
        footnotes_element = OxmlElement('w:footnotes')
        footnotes_element.set(qn('xmlns:w'), 'http://schemas.openxmlformats.org/wordprocessingml/2006/main')
        footnotes_part._element = footnotes_element
        target_part.footnotes_part = footnotes_part
        target_footnotes_part = footnotes_part

    # Step 3: Extract footnotes from source document
    source_footnotes_xml = source_footnotes_part.element
    footnote_elements = source_footnotes_xml.findall(
        './/{http://schemas.openxmlformats.org/wordprocessingml/2006/main}footnote'
    )

    id_mapping = {}  # old_id -> new_id
    next_footnote_id = 1

    for footnote_elem in footnote_elements:
        old_id = footnote_elem.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}id')
        footnote_type = footnote_elem.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}type')

        # Skip separator and continuation separator footnotes (Word internals)
        if footnote_type in ('separator', 'continuationSeparator'):
            continue

        # Clone footnote element
        new_footnote = deepcopy(footnote_elem)

        # Assign new ID
        new_id = str(next_footnote_id)
        new_footnote.set('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}id', new_id)

        # Add to target document
        target_footnotes_part.element.append(new_footnote)

        # Record mapping
        if old_id:
            id_mapping[int(old_id)] = next_footnote_id
        next_footnote_id += 1

    # Step 4: Update footnote references in body text
    # Find all paragraphs in target document that came from source
    for paragraph in target_doc.paragraphs:
        # Search for footnote reference elements
        for run in paragraph.runs:
            run_element = run._element

            # Find footnoteReference elements
            footnote_refs = run_element.findall(
                './/{http://schemas.openxmlformats.org/wordprocessingml/2006/main}footnoteReference'
            )

            for ref in footnote_refs:
                old_id_str = ref.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}id')
                if old_id_str:
                    old_id = int(old_id_str)
                    if old_id in id_mapping:
                        # Update to new ID
                        new_id = id_mapping[old_id]
                        ref.set('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}id', str(new_id))

    return id_mapping
```

**Footnote Merging Algorithm:**

Footnotes are complex because:
1. Each footnote has an ID that's referenced in the body text
2. Multiple documents being merged may have overlapping IDs
3. Word requires separator footnotes (special type) for rendering
4. python-docx doesn't have high-level footnote APIs

**The Process:**

```
Source Document (from Pandoc)        Target Document
├─ Paragraph 1                       ├─ Case Block (OOXML)
│  └─ FootnoteRef[id=1]              ├─ Body paragraphs
├─ Paragraph 2                       │  ├─ Paragraph 1
├─ Footnotes Part                    │  │  └─ FootnoteRef[id=1] → Updated to [id=1]
   ├─ Footnote[id=1, type=normal]    │  ├─ Paragraph 2
   └─ Footnote[id=2, type=normal]    ├─ Signature Block (OOXML)
                                     └─ Footnotes Part (created)
                                        ├─ Footnote[id=1] ← Copied from source
                                        └─ Footnote[id=2] ← Copied from source
```

**Edge Cases:**

1. **No footnotes in source:** Function returns empty dict, no-op
2. **Footnote ID collisions:** Unlikely since we control all inputs, but renumbering handles it
3. **Orphaned footnote references:** If body text references footnote ID that doesn't exist in footnotes part, the reference will remain but point to nothing (Word will show error marker)
4. **Special footnote types:** Separator and continuation separator footnotes are Word internals, not user content - we skip copying these

**Validation:**

Footnote merging correctness is verified by:

1. **Count Test:** Number of footnotes in target doc equals number in source doc (minus separators)
2. **Reference Test:** Every footnoteReference element in body text has corresponding footnote in footnotes part
3. **Content Test:** Footnote text content matches original (no corruption during copy)
4. **Rendering Test:** Export merged DOCX → Open in Word → Footnotes appear correctly numbered

**Example Test Case:**

```python
def test_footnote_merging():
    # Create source doc with 2 footnotes
    source_doc = Document()
    para = source_doc.add_paragraph("Text with footnote")
    # (In real implementation, would use python-docx-footnotes or direct XML)

    # Create target doc
    target_doc = Document()
    target_doc.add_paragraph("Case block content")

    # Copy body paragraphs to target
    for para in source_doc.paragraphs:
        target_doc.add_paragraph(para.text)

    # Merge footnotes
    id_mapping = copy_footnotes(source_doc, target_doc)

    # Verify
    assert len(id_mapping) == 2
    assert id_mapping[1] == 1  # First footnote keeps ID 1
    assert id_mapping[2] == 2  # Second footnote keeps ID 2

    # Verify target doc has footnotes part
    assert hasattr(target_doc.part, 'footnotes_part')

    # Verify footnote count
    footnotes = target_doc.part.footnotes_part.element.findall(
        './/{http://schemas.openxmlformats.org/wordprocessingml/2006/main}footnote'
    )
    normal_footnotes = [
        fn for fn in footnotes
        if fn.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}type') == 'normal'
    ]
    assert len(normal_footnotes) == 2
```

**Implementation Note:**

python-docx doesn't expose footnotes in its high-level API, so we work directly with the OOXML via `lxml`. The footnotes part is a separate XML document within the DOCX package that's linked to the main document via relationships.

### 13.4.5 Image Preprocessing

Before Pandoc conversion, base64 images must be extracted to temporary files for reliable embedding in DOCX output.

**Why Preprocessing:**

While Pandoc 3.6.1+ can handle data URIs natively, preprocessing provides:
- Better error handling for malformed images
- Size validation before conversion
- Consistent cross-version behavior
- Performance optimization for large documents

**Python Implementation:**
```python
import os
import re
import base64
import hashlib
import tempfile
from pathlib import Path
from typing import Tuple
from dataclasses import dataclass

@dataclass
class ImageExtractionResult:
    modified_html: str
    image_count: int
    temp_dir: str
    errors: list[str]

def extract_base64_images(html_content: str, temp_dir: str) -> ImageExtractionResult:
    """
    Extract base64 images from HTML and save to temp files.

    Args:
        html_content: HTML string with embedded base64 images
        temp_dir: Directory to save extracted images

    Returns:
        ImageExtractionResult with modified HTML and metadata
    """
    # Pattern matches: <img src="data:image/png;base64,ABC123...">
    pattern = r'(<img[^>]*src=["\'])data:image/([\w+]+);base64,([A-Za-z0-9+/=]+)(["\'][^>]*>)'

    image_count = 0
    errors = []

    def replace_match(match):
        nonlocal image_count
        prefix, img_type, b64_data, suffix = match.groups()

        # Normalize extension
        ext_map = {
            'png': 'png',
            'jpeg': 'jpg',
            'jpg': 'jpg',
            'svg+xml': 'svg'
        }
        ext = ext_map.get(img_type.lower(), 'png')

        # Generate unique filename based on content hash
        img_hash = hashlib.md5(b64_data.encode()).hexdigest()[:10]
        filename = f"img_{image_count:03d}_{img_hash}.{ext}"
        filepath = os.path.join(temp_dir, filename)

        try:
            # Decode and save image
            image_data = base64.b64decode(b64_data)

            # Validate size (max 5MB)
            if len(image_data) > 5 * 1024 * 1024:
                errors.append(f"Image {image_count} exceeds 5MB limit")
                return match.group(0)  # Keep original, will fail gracefully

            with open(filepath, 'wb') as f:
                f.write(image_data)

            image_count += 1

            # Return img tag with file path instead of base64
            return f'{prefix}{filepath}{suffix}'

        except Exception as e:
            errors.append(f"Failed to extract image {image_count}: {str(e)}")
            return match.group(0)  # Keep original on error

    modified_html = re.sub(pattern, replace_match, html_content, flags=re.IGNORECASE)

    return ImageExtractionResult(
        modified_html=modified_html,
        image_count=image_count,
        temp_dir=temp_dir,
        errors=errors
    )


def preprocess_images_for_pandoc(html_content: str) -> Tuple[str, str, int]:
    """
    Prepare HTML for Pandoc by extracting images to temp directory.

    Returns:
        Tuple of (modified_html, temp_dir_path, image_count)

    Note: Caller is responsible for cleaning up temp_dir after Pandoc conversion.
    """
    temp_dir = tempfile.mkdtemp(prefix='factsway_images_')

    result = extract_base64_images(html_content, temp_dir)

    if result.errors:
        # Log errors but continue - Pandoc will handle gracefully
        for error in result.errors:
            print(f"Image preprocessing warning: {error}")

    return result.modified_html, temp_dir, result.image_count
```

**Integration with Export Pipeline:**

The image preprocessing step occurs after HTML generation but before Pandoc conversion:
```python
# In export_document() function:

# Step 4: Convert resolved ProseMirror to HTML
body_html = prosemirror_to_html(resolved_doc)

# Step 4.5: Extract base64 images to temp files
body_html, image_temp_dir, image_count = preprocess_images_for_pandoc(body_html)

# Step 5: Transform footnotes for Pandoc
body_html = transform_footnotes_for_pandoc(body_html)

# ... continue pipeline ...

# After Pandoc conversion, cleanup:
import shutil
shutil.rmtree(image_temp_dir, ignore_errors=True)
```

**Pandoc Resource Path:**

When invoking Pandoc, include the temp directory in the resource path:
```python
cmd = [
    "pandoc",
    html_path,
    "-f", "html",
    "-t", "docx",
    "-o", output_path,
    "--standalone",
    f"--resource-path={image_temp_dir}:."
]
```

### 13.5 Citation Resolution

Before export, all CitationNode objects in the ProseMirror document must be resolved to their display text with computed markers.

**Resolution Process:**

1. Compute the citation index (exhibit markers based on first occurrence)
2. Walk the document and replace each CitationNode with its resolved text
3. Track which exhibits were actually cited (for appendix generation)

**Python Implementation:**
```python
from typing import Tuple, Set
import json
import copy

def resolve_citations(
    document: dict,
    exhibits: list[dict]
) -> Tuple[dict, dict, Set[str]]:
    """
    Resolve all CitationNodes to display text with computed markers.

    Args:
        document: ProseMirror document (as dict)
        exhibits: List of Exhibit objects from the Case

    Returns:
        Tuple of:
        - resolved_document: Document with CitationNodes replaced by text
        - citation_index: Mapping of exhibit_id -> marker
        - cited_exhibit_ids: Set of exhibit IDs that were actually cited
    """
    # Deep copy to avoid mutating original
    doc = copy.deepcopy(document)

    # Build citation index by walking document in order
    citation_index = {}
    exhibit_counter = 0
    cited_exhibit_ids = set()

    def compute_index(node: dict) -> None:
        nonlocal exhibit_counter

        if node.get('type') == 'citation':
            attrs = node.get('attrs', {})
            if attrs.get('evidenceType') == 'exhibit':
                evidence_id = attrs.get('evidenceId')
                if evidence_id and evidence_id not in citation_index:
                    citation_index[evidence_id] = number_to_alpha(exhibit_counter)
                    exhibit_counter += 1
                if evidence_id:
                    cited_exhibit_ids.add(evidence_id)

        for child in node.get('content', []):
            compute_index(child)

    compute_index(doc)

    # Now resolve citations to text
    def resolve_node(node: dict) -> dict | str:
        if node.get('type') == 'citation':
            attrs = node.get('attrs', {})
            evidence_id = attrs.get('evidenceId')
            display_mode = attrs.get('displayMode', 'inline')

            # Get marker (or ? if unlinked)
            marker = citation_index.get(evidence_id, '?') if evidence_id else '?'

            # Generate display text based on mode
            if attrs.get('evidenceType') == 'exhibit':
                if display_mode == 'inline':
                    text = f"(Exhibit {marker})"
                elif display_mode == 'parenthetical':
                    text = f"See Exhibit {marker}"
                elif display_mode == 'textual':
                    text = f"Exhibit {marker}"
                else:
                    text = f"(Exhibit {marker})"
            else:
                # Future citation types
                text = "[Citation]"

            # Return as text node with italic mark
            return {
                'type': 'text',
                'text': text,
                'marks': [{'type': 'italic'}]
            }

        # Recurse into children
        if 'content' in node:
            new_content = []
            for child in node['content']:
                resolved = resolve_node(child)
                if isinstance(resolved, dict):
                    new_content.append(resolved)
                # If resolved is a string (shouldn't happen), wrap it
            node['content'] = new_content

        return node

    resolved_doc = resolve_node(doc)

    return resolved_doc, citation_index, cited_exhibit_ids


def number_to_alpha(n: int) -> str:
    """Convert 0-indexed number to letter: 0→A, 1→B, ..., 25→Z, 26→AA"""
    result = ''
    num = n

    while True:
        result = chr(65 + (num % 26)) + result
        num = num // 26 - 1
        if num < 0:
            break

    return result
```

**HTML Conversion After Resolution:**

After resolving citations, convert the ProseMirror document to HTML for Pandoc:
```python
def prosemirror_to_html(document: dict) -> str:
    """
    Convert resolved ProseMirror document to HTML.

    This is called AFTER resolve_citations(), so no CitationNodes remain.
    """
    def render_node(node: dict) -> str:
        node_type = node.get('type')

        if node_type == 'doc':
            return ''.join(render_node(child) for child in node.get('content', []))

        elif node_type == 'paragraph':
            inner = ''.join(render_node(child) for child in node.get('content', []))
            return f'<p>{inner}</p>\n'

        elif node_type == 'heading':
            level = node.get('attrs', {}).get('level', 1)
            inner = ''.join(render_node(child) for child in node.get('content', []))
            return f'<h{level}>{inner}</h{level}>\n'

        elif node_type == 'blockquote':
            inner = ''.join(render_node(child) for child in node.get('content', []))
            return f'<blockquote>{inner}</blockquote>\n'

        elif node_type == 'bulletList':
            inner = ''.join(render_node(child) for child in node.get('content', []))
            return f'<ul>{inner}</ul>\n'

        elif node_type == 'orderedList':
            inner = ''.join(render_node(child) for child in node.get('content', []))
            return f'<ol>{inner}</ol>\n'

        elif node_type == 'listItem':
            inner = ''.join(render_node(child) for child in node.get('content', []))
            return f'<li>{inner}</li>\n'

        elif node_type == 'table':
            inner = ''.join(render_node(child) for child in node.get('content', []))
            return f'<table>{inner}</table>\n'

        elif node_type == 'tableRow':
            inner = ''.join(render_node(child) for child in node.get('content', []))
            return f'<tr>{inner}</tr>\n'

        elif node_type == 'tableCell':
            inner = ''.join(render_node(child) for child in node.get('content', []))
            return f'<td>{inner}</td>'

        elif node_type == 'tableHeader':
            inner = ''.join(render_node(child) for child in node.get('content', []))
            return f'<th>{inner}</th>'

        elif node_type == 'image':
            attrs = node.get('attrs', {})
            src = attrs.get('src', '')
            alt = attrs.get('alt', '')
            return f'<img src="{src}" alt="{alt}" />'

        elif node_type == 'hardBreak':
            return '<br />'

        elif node_type == 'horizontalRule':
            return '<hr />\n'

        elif node_type == 'text':
            text = node.get('text', '')
            # Apply marks
            for mark in node.get('marks', []):
                mark_type = mark.get('type')
                if mark_type == 'bold':
                    text = f'<strong>{text}</strong>'
                elif mark_type == 'italic':
                    text = f'<em>{text}</em>'
                elif mark_type == 'underline':
                    text = f'<u>{text}</u>'
                elif mark_type == 'link':
                    href = mark.get('attrs', {}).get('href', '')
                    text = f'<a href="{href}">{text}</a>'
            return text

        # Fallback for unknown types
        return ''.join(render_node(child) for child in node.get('content', []))

    return render_node(document)
```

### 13.6 Exhibit Appendix Generation

If exhibits are cited in the document, generate an exhibit appendix after the signature block (or certificate of service if present).

**Appendix Format:**
```
                              EXHIBIT LIST

Exhibit A ..................................... Signed Contract Agreement
Exhibit B ..................................... Email Correspondence (3 pages)
Exhibit C ..................................... Invoice #1234
```

**Python Implementation:**
```python
from docx import Document
from docx.shared import Inches, Pt, Twips
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT, WD_TAB_LEADER
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def generate_exhibit_appendix(
    doc: Document,
    exhibits: list[dict],
    citation_index: dict,
    cited_exhibit_ids: set,
    include_uncited: bool = False
) -> None:
    """
    Generate exhibit appendix with dot-leader formatting.

    Args:
        doc: python-docx Document to append to
        exhibits: List of all Exhibit objects from Case
        citation_index: Mapping of exhibit_id -> marker (from resolve_citations)
        cited_exhibit_ids: Set of exhibit IDs that were cited
        include_uncited: If True, include exhibits that weren't cited in body
    """
    # Filter to cited exhibits (or all if include_uncited)
    if include_uncited:
        exhibit_list = exhibits
    else:
        exhibit_list = [e for e in exhibits if e['id'] in cited_exhibit_ids]

    if not exhibit_list:
        return  # No exhibits to list

    # Sort by marker
    def sort_key(exhibit):
        marker = citation_index.get(exhibit['id'], 'ZZZ')
        # Convert marker to sortable: A=0, B=1, ..., AA=26, etc.
        value = 0
        for i, char in enumerate(reversed(marker)):
            value += (ord(char) - 64) * (26 ** i)
        return value

    exhibit_list = sorted(exhibit_list, key=sort_key)

    # Add page break before appendix
    doc.add_page_break()

    # Add title
    title = doc.add_paragraph("EXHIBIT LIST")
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_run = title.runs[0]
    title_run.bold = True
    title_run.font.size = Pt(12)

    # Add blank line
    doc.add_paragraph()

    # Calculate tab stop position (6 inches from left margin for dot leader)
    tab_stop_position = Inches(6.0)

    # Add each exhibit with dot leader
    for exhibit in exhibit_list:
        marker = citation_index.get(exhibit['id'], '?')
        label = exhibit.get('label', 'Untitled')

        para = doc.add_paragraph()

        # Add tab stop with dot leader
        tab_stops = para.paragraph_format.tab_stops
        tab_stops.add_tab_stop(tab_stop_position, WD_TAB_ALIGNMENT.RIGHT, WD_TAB_LEADER.DOTS)

        # Add text: "Exhibit A" + tab + label
        run1 = para.add_run(f"Exhibit {marker}")
        run1.bold = True

        para.add_run("\t")  # Tab character triggers dot leader

        run2 = para.add_run(label)


def generate_exhibit_appendix_with_embedding(
    doc: Document,
    exhibits: list[dict],
    citation_index: dict,
    cited_exhibit_ids: set,
    embed_exhibits: bool = False
) -> None:
    """
    Generate exhibit appendix with optional exhibit embedding.

    If embed_exhibits is True, each exhibit file is embedded after its listing.
    This is useful for creating a single self-contained document.

    Note: Embedding is complex and may not preserve all formatting.
    Consider this a future enhancement.
    """
    # First, generate the basic list
    generate_exhibit_appendix(doc, exhibits, citation_index, cited_exhibit_ids)

    if not embed_exhibits:
        return

    # Future: For each exhibit, add a page break and embed the content
    # This requires:
    # - PDF → Image conversion for PDF exhibits
    # - Image insertion for image exhibits
    # - DOCX merging for Word exhibits
    # For now, just add placeholder text

    for exhibit in sorted(exhibits, key=lambda e: citation_index.get(e['id'], 'ZZZ')):
        if exhibit['id'] not in cited_exhibit_ids:
            continue

        marker = citation_index.get(exhibit['id'], '?')
        label = exhibit.get('label', 'Untitled')
        filename = exhibit.get('file', {}).get('name', 'unknown')

        doc.add_page_break()

        header = doc.add_paragraph(f"EXHIBIT {marker}")
        header.alignment = WD_ALIGN_PARAGRAPH.CENTER
        header.runs[0].bold = True

        subheader = doc.add_paragraph(label)
        subheader.alignment = WD_ALIGN_PARAGRAPH.CENTER

        # Placeholder for actual exhibit content
        placeholder = doc.add_paragraph(f"[{filename} would be embedded here]")
        placeholder.alignment = WD_ALIGN_PARAGRAPH.CENTER
        placeholder.runs[0].italic = True
```

### 13.7 Complete Pipeline Orchestration

The full export pipeline with citation resolution:

```python
from pathlib import Path
from docx import Document
import tempfile

def export_document(
    template: dict,
    case_data: dict,
    draft: dict,
    include_certificate: bool = False,
    certificate_variables: dict = None,
    include_exhibit_list: bool = True
) -> Path:
    """
    Complete export pipeline: Template + Case + Draft → Final DOCX

    Returns:
        Path to the generated .docx file
    """
    # Step 1: Create main document with reference styles
    doc = Document('reference.docx')

    # Clear any existing content from reference doc
    for element in doc.element.body:
        doc.element.body.remove(element)

    # Step 2: Generate case block (OOXML)
    generate_case_block_ooxml(doc, case_data, template)

    # Step 2.5: Compute sentence registry (if not already computed)
    if not draft.get('sentence_registry') or needs_recompute(draft):
        draft['sentence_registry'] = compute_sentence_registry(draft['body']['content'])

    # Step 2.7: Resolve variable nodes in body
    resolved_doc = resolve_variable_nodes(
        draft['body']['content'],
        resolve_variables(template, case_data, draft)
    )

    # Step 3: Resolve citations in body
    resolved_doc, citation_index, cited_exhibit_ids = resolve_citations(
        draft['body']['content'],
        case_data.get('exhibits', [])
    )

    # Step 4: Convert resolved ProseMirror to HTML
    body_html = prosemirror_to_html(resolved_doc)

    # Step 5: Transform footnotes for Pandoc
    body_html = transform_footnotes_for_pandoc(body_html)

    # Step 6: Apply outline schema numbering to headings
    body_html = apply_section_numbering(body_html, template['outline_schema'])

    # Step 7: Convert HTML to DOCX via Pandoc
    with tempfile.NamedTemporaryFile(suffix='.docx', delete=False) as f:
        body_docx_path = Path(f.name)

    convert_html_to_docx(body_html, Path('reference.docx'), body_docx_path)

    # Step 8: Merge body into main document
    merge_body_into_document(doc, body_docx_path)

    # Step 9: Inject signature block
    inject_signature_block(doc, template, case_data)

    # Step 10: Inject certificate of service (if enabled)
    if include_certificate and template.get('certificate_of_service', {}).get('enabled'):
        inject_certificate_of_service(doc, template, case_data, certificate_variables)

    # Step 11: Generate exhibit appendix (if exhibits were cited)
    if include_exhibit_list and cited_exhibit_ids:
        generate_exhibit_appendix(
            doc,
            case_data.get('exhibits', []),
            citation_index,
            cited_exhibit_ids
        )

    # Step 12: Add footer
    add_three_column_footer(
        doc,
        draft['motion_title'],
        template['footer']['right']['format']
    )

    # Step 13: Constrain image widths
    constrain_image_widths(doc)

    # Step 14: Save final document
    output_path = Path(tempfile.gettempdir()) / f"{case_data['name']}_{draft['motion_title']}.docx"
    doc.save(output_path)

    # Cleanup temp file
    body_docx_path.unlink()

    return output_path


def apply_section_numbering(html: str, outline_schema: dict) -> str:
    """
    Apply outline schema numbering to headings in the HTML.

    Converts:
        INTRODUCTION
    To:
        I. INTRODUCTION

    Based on the outline_schema levels configuration.
    """
    from bs4 import BeautifulSoup

    soup = BeautifulSoup(html, 'html.parser')

    # Track counters for each level
    counters = {level['level']: 0 for level in outline_schema['levels']}

    # Map heading tags to outline levels
    level_config = {level['level']: level for level in outline_schema['levels']}

    for heading in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
        level = int(heading.name[1])  # h1 → 1, h2 → 2, etc.

        if level not in level_config:
            continue

        config = level_config[level]

        # Check if we need to restart numbering
        restart_on = config.get('restart_on')
        if restart_on:
            # Reset this level's counter (already handled by structure)
            pass

        # Increment counter for this level
        counters[level] += 1

        # Reset all deeper level counters
        for deeper_level in counters:
            if deeper_level > level:
                counters[deeper_level] = 0

        # Format the number
        number = format_outline_number(counters[level], config['format'])

        # Prepend number to heading text
        if config['format'] != 'none' and config['format'] != 'bullet':
            current_text = heading.get_text()
            heading.string = f"{number}. {current_text}"

    return str(soup)


def format_outline_number(n: int, format_type: str) -> str:
    """Convert integer to formatted outline number."""
    if format_type == 'roman_upper':
        return int_to_roman(n).upper()
    elif format_type == 'roman_lower':
        return int_to_roman(n).lower()
    elif format_type == 'alpha_upper':
        return number_to_alpha(n - 1)  # 1 → A, 2 → B
    elif format_type == 'alpha_lower':
        return number_to_alpha(n - 1).lower()
    elif format_type == 'numeric':
        return str(n)
    elif format_type == 'bullet':
        return '•'
    else:
        return str(n)


def int_to_roman(num: int) -> str:
    """Convert integer to Roman numeral."""
    val = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
    syms = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I']
    roman_num = ''
    i = 0
    while num > 0:
        for _ in range(num // val[i]):
            roman_num += syms[i]
            num -= val[i]
        i += 1
    return roman_num
```

**Pipeline Summary (17 Steps):**

| Step | Action | Input | Output |
|------|--------|-------|--------|
| 1 | Create document | reference.docx | Empty styled doc |
| 2 | Generate case block | Template + Case | Doc with case block |
| 2.5 | Compute sentences | Draft body | Sentence registry |
| 2.7 | Resolve body variables | Document + Variables | Document with values |
| 3 | Resolve citations | Draft body + Evidence | Resolved doc + citation index |
| 4 | Convert to HTML | ProseMirror JSON | HTML string |
| 4.5 | Extract images | HTML with base64 | HTML with file paths |
| 5 | Transform footnotes | HTML | Pandoc-compatible HTML |
| 6 | Apply section numbering | HTML + Outline schema | Numbered HTML |
| 7 | Resolve variables | Template + Draft | Variable values |
| 8 | Apply variables | HTML + Variables | Final HTML |
| 9 | Pandoc conversion | HTML | Temp body.docx |
| 10 | Merge body | Main doc + body.docx | Combined document |
| 11 | Inject signature | Template + Case | Doc with signature |
| 12 | Inject certificate | Template + Variables | Doc with certificate |
| 13 | Generate exhibit list | Evidence + Citation index | Doc with appendix |
| 14 | Add footer | Motion title + Format | Doc with footer |
| 15 | Save | Document | Final .docx file |

### 13.8 reference.docx Styles

The reference.docx file defines all typography and formatting for the exported document. Pandoc applies these styles during conversion.

**Required Styles:**

| Style Name | Type | Purpose | Configuration |
|------------|------|---------|---------------|
| Normal | Paragraph | Body text | Times New Roman, 12pt, double-spaced, 0.5" first-line indent |
| Heading 1 | Paragraph | Section titles (I. ARGUMENT) | Times New Roman, 12pt, bold, caps, centered |
| Heading 2 | Paragraph | Subsections (A. First Point) | Times New Roman, 12pt, bold, left-aligned |
| Heading 3 | Paragraph | Points (1. Detail) | Times New Roman, 12pt, bold, left-aligned, 0.5" indent |
| Heading 4 | Paragraph | Subpoints (a. Sub-detail) | Times New Roman, 12pt, normal, left-aligned, 1.0" indent |
| Block Text | Paragraph | Block quotes/citations | Times New Roman, 11pt, single-spaced, 1" left/right margins |
| Footnote Text | Paragraph | Footnote content | Times New Roman, 10pt, single-spaced |
| Footnote Reference | Character | Footnote superscript | Superscript |
| Table | Table | All tables | See detailed spec below |

**Critical: Table Style Configuration**

Pandoc looks for a table style named exactly **"Table"** (case-sensitive). This style does NOT exist in Word by default—you must create it manually.

**Why This Matters:**
- Without a "Table" style, tables render with Word defaults (often ugly)
- Pandoc hard-codes a bottom border on header rows regardless of style (known issue)
- Custom table styles like "Table Grid" are NOT used by Pandoc

**Creating the "Table" Style in Word:**

1. Open reference.docx in **desktop Microsoft Word** (not online version)
2. Insert a sample table (2x2 is fine)
3. Go to **Table Design** tab (appears when table is selected)
4. Click the dropdown arrow on the Styles gallery → **New Table Style**
5. Configure:
   - **Name:** `Table` (exactly this, case-sensitive)
   - **Style type:** Table
   - **Style based on:** Table Normal
6. Click **Format** → **Border** and configure:
   - All borders: ½ pt, single line, black
   - Or no borders if you prefer borderless tables
7. Click **Format** → **Table Properties**:
   - Cell margins: 0.08" all sides
   - Cell alignment: Top-left
8. Click **OK** to save the style
9. Delete the sample table
10. Save reference.docx

**Table Styling Limitations:**

| Feature | Supported | Notes |
|---------|-----------|-------|
| Cell borders | ✅ Yes | Via Table style |
| Cell padding | ✅ Yes | Via Table style |
| Header row shading | ⚠️ Partial | Style works, but header border is overridden |
| Alternating row colors | ❌ No | Pandoc doesn't support |
| Column widths | ⚠️ Partial | Pandoc auto-calculates; may need post-processing |
| Cell alignment | ✅ Yes | Via HTML attributes |

**Header Row Border Issue:**

Pandoc hard-codes a bottom border on the first row of every table, regardless of your Table style. Workarounds:

1. **Accept it:** A header border often looks fine
2. **Post-process:** Use python-docx to remove the border after Pandoc conversion
3. **Avoid header rows:** Don't use `<thead>` in HTML (all rows become body rows)

**Post-processing to Fix Header Borders:**
```python
from docx import Document
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

def remove_table_header_borders(document: Document):
    """Remove Pandoc's hard-coded header row bottom borders."""
    for table in document.tables:
        # Get first row
        if len(table.rows) > 0:
            first_row = table.rows[0]
            for cell in first_row.cells:
                # Access cell's tcPr (table cell properties)
                tcPr = cell._element.get_or_add_tcPr()

                # Find or create tcBorders
                tcBorders = tcPr.find(qn('w:tcBorders'))
                if tcBorders is None:
                    tcBorders = OxmlElement('w:tcBorders')
                    tcPr.append(tcBorders)

                # Set bottom border to nil
                bottom = tcBorders.find(qn('w:bottom'))
                if bottom is not None:
                    tcBorders.remove(bottom)

                bottom = OxmlElement('w:bottom')
                bottom.set(qn('w:val'), 'nil')
                tcBorders.append(bottom)
```

**Complete reference.docx Creation Steps:**

1. Generate base template:
```bash
   pandoc -o reference.docx --print-default-data-file reference.docx
```

2. Open in Microsoft Word (desktop version)

3. Modify **Normal** style:
   - Right-click "Normal" in Styles pane → Modify
   - Font: Times New Roman, 12pt
   - Format → Paragraph:
     - Line spacing: Double
     - Before/After: 0pt
     - Special: First line, 0.5"

4. Modify **Heading 1**:
   - Font: Times New Roman, 12pt, Bold
   - Format → Font: All caps
   - Format → Paragraph: Centered, spacing double

5. Modify **Heading 2**:
   - Font: Times New Roman, 12pt, Bold
   - Format → Paragraph: Left-aligned

6. Modify **Heading 3**:
   - Font: Times New Roman, 12pt, Bold
   - Format → Paragraph: Left-aligned, Left indent 0.5"

7. Modify **Heading 4**:
   - Font: Times New Roman, 12pt, Normal (not bold)
   - Format → Paragraph: Left-aligned, Left indent 1.0"

8. Modify or create **Block Text**:
   - Font: Times New Roman, 11pt
   - Format → Paragraph:
     - Line spacing: Single
     - Left/Right indent: 1"
     - Before/After: 6pt

9. Modify **Footnote Text**:
   - Font: Times New Roman, 10pt
   - Format → Paragraph: Single-spaced

10. Create **Table** style (see steps above)

11. Set page margins:
    - Layout → Margins → Custom Margins
    - All sides: 1"

12. Save and close

---

## 15. Preview System

### 14.1 Preview Pipeline

```
1. Run full export pipeline (steps 1-8)
2. Save temporary .docx
3. Call LibreOffice headless:
   soffice --headless --convert-to pdf --outdir /tmp temp.docx
4. Stream PDF to browser
5. Display in embedded PDF viewer
6. Clean up temp files
```

### 14.2 LibreOffice Command

```bash
soffice --headless --convert-to pdf:writer_pdf_Export \
  --outdir /tmp \
  /tmp/preview_{{uuid}}.docx
```

### 14.3 Preview UI

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PREVIEW                                                          [X]   │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                                                                     ││
│  │                     (Embedded PDF Viewer)                           ││
│  │                                                                     ││
│  │  ┌─────────────────────────────────────────────────────────────┐   ││
│  │  │                                                             │   ││
│  │  │  IN THE DISTRICT COURT OF BEXAR COUNTY, TEXAS               │   ││
│  │  │  ...                                                        │   ││
│  │  │                                                             │   ││
│  │  └─────────────────────────────────────────────────────────────┘   ││
│  │                                                                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────────┤
│  Page [1] of [5]      [Zoom: 100% ▼]      [Download DOCX] [Download PDF]│
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 16. Technology Stack

### 15.1 Architecture: Microservices

FACTSWAY uses a microservices architecture where independent services communicate via REST APIs.

**Service Implementation:**
- TypeScript services: Node.js 20 LTS + Express
- Python services: Python 3.11 + FastAPI
- Communication: REST/JSON over HTTP
- Packaging: Platform-specific executables (PyInstaller, pkg)

**Frontend Implementation:**
- Desktop: Electron + Vue 3 + Tiptap
- Web trial: Vue 3 SPA (Vite build)
- Mobile: React Native (future)

### 15.2 Core Services (TypeScript/Node.js)

**Records Service (port 3001)**
```json
{
  "name": "@factsway/records-service",
  "dependencies": {
    "express": "^4.18.2",
    "better-sqlite3": "^9.2.2",
    "zod": "^3.22.4",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}
```

**Responsibilities:**
- Template CRUD operations
- Case CRUD operations
- Draft CRUD operations
- Database migrations

**Environment Variables:**
```bash
PORT=3001
DB_PATH=/path/to/factsway.db
LOG_LEVEL=info
```

---

**CaseBlock Service (port 3004)**
```json
{
  "name": "@factsway/caseblock-service",
  "dependencies": {
    "express": "^4.18.2",
    "zod": "^3.22.4",
    "dotenv": "^16.3.1"
  }
}
```

**Responsibilities:**
- Extract case block from motion
- Format case block to court style
- Validate case block completeness

**Environment Variables:**
```bash
PORT=3004
RECORDS_SERVICE_URL=http://localhost:3001  # Desktop
# or http://records-service:3001 # Cloud
LOG_LEVEL=info
```

---

**Signature Service (port 3005)**
```json
{
  "name": "@factsway/signature-service",
  "dependencies": {
    "express": "^4.18.2",
    "zod": "^3.22.4"
  }
}
```

**Responsibilities:**
- Extract signature block from motion
- Format signature block to court style
- Generate attorney certification

---

**Facts Service (port 3006)**
```json
{
  "name": "@factsway/facts-service",
  "dependencies": {
    "express": "^4.18.2",
    "zod": "^3.22.4"
  }
}
```

**Responsibilities:**
- Sentence registry computation
- Evidence linking
- Citation management

---

**Exhibits Service (port 3007)**
```json
{
  "name": "@factsway/exhibits-service",
  "dependencies": {
    "express": "^4.18.2",
    "zod": "^3.22.4"
  }
}
```

**Responsibilities:**
- Exhibit management
- Appendix generation
- Exhibit marker computation (A, B, C...)

---

**Caselaw Service (port 3008)**
```json
{
  "name": "@factsway/caselaw-service",
  "dependencies": {
    "express": "^4.18.2",
    "eyecite": "^2.6.2",
    "zod": "^3.22.4"
  }
}
```

**Responsibilities:**
- Citation detection in text
- Citation validation
- Link citations to uploaded opinions

---

### 15.3 Python Services

**Ingestion Service (port 3002)**
```txt
# requirements.txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-multipart==0.0.6
python-docx==1.1.0
lxml==5.1.0
nupunkt==0.1.3
pydantic==2.5.3
python-dotenv==1.0.0
```

**Responsibilities:**
- Parse DOCX to LegalDocument
- Extract document structure
- NUPunkt sentence boundary detection
- Section hierarchy analysis

**Environment Variables:**
```bash
PORT=3002
RECORDS_SERVICE_URL=http://localhost:3001  # Injected by orchestrator
LOG_LEVEL=info
```

---

**Export Service (port 3003)**
```txt
# requirements.txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-docx==1.1.0
lxml==5.1.0
pandoc==2.3
pydantic==2.5.3
python-dotenv==1.0.0
```

**Responsibilities:**
- Generate DOCX from LegalDocument
- Pandoc markdown → DOCX conversion
- OOXML injection for complex formatting
- Certificate of service generation

**Environment Variables:**
```bash
PORT=3003
RECORDS_SERVICE_URL=http://localhost:3001
PANDOC_PATH=/usr/local/bin/pandoc  # Auto-detected if not set
LOG_LEVEL=info
```

---

### 15.4 Desktop App (Electron + Child Process Orchestration)

**CRITICAL: Desktop does NOT use Docker. Services run as child processes.**

```json
{
  "name": "factsway-desktop",
  "dependencies": {
    "electron": "^28.0.0",
    "tree-kill": "^1.2.2"
  },
  "devDependencies": {
    "electron-builder": "^24.9.1",
    "@vercel/pkg": "^5.11.0"
  }
}
```

**Responsibilities:**
- Start/stop services as child processes on app launch/quit
- Serve Vue frontend
- Native OS integration (file dialogs, menus)
- Auto-updates
- **PID management to prevent zombie processes**

#### Service Orchestration (Child Processes)

```typescript
// main/orchestrator.ts
import { spawn, ChildProcess } from 'child_process';
import { app } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import treeKill from 'tree-kill';

interface ServiceConfig {
  name: string;
  executable: string;
  args: string[];
  port: number;
  env: Record<string, string>;
}

const SERVICES: ServiceConfig[] = [
  {
    name: 'records-service',
    executable: process.platform === 'win32' 
      ? path.join(resourcesPath, 'services', 'records-service.exe')
      : path.join(resourcesPath, 'services', 'records-service'),
    args: [],
    port: 3001,
    env: {
      PORT: '3001',
      DB_PATH: path.join(app.getPath('userData'), 'factsway.db'),
      LOG_LEVEL: 'info'
    }
  },
  {
    name: 'ingestion-service',
    executable: process.platform === 'win32'
      ? path.join(resourcesPath, 'services', 'ingestion-service.exe')
      : path.join(resourcesPath, 'services', 'ingestion-service'),
    args: [],
    port: 3002,
    env: {
      PORT: '3002',
      RECORDS_SERVICE_URL: 'http://localhost:3001',
      LOG_LEVEL: 'info'
    }
  },
  {
    name: 'export-service',
    executable: process.platform === 'win32'
      ? path.join(resourcesPath, 'services', 'export-service.exe')
      : path.join(resourcesPath, 'services', 'export-service'),
    args: [],
    port: 3003,
    env: {
      PORT: '3003',
      RECORDS_SERVICE_URL: 'http://localhost:3001',
      PANDOC_PATH: getPandocPath(),  // Platform-specific
      LOG_LEVEL: 'info'
    }
  },
  // ... other services (caseblock, signature, facts, exhibits, caselaw)
];

class DesktopOrchestrator {
  private processes = new Map<string, ChildProcess>();
  private pidsFile = path.join(app.getPath('userData'), 'service-pids.json');
  
  /**
   * CRITICAL: Clean up any zombie processes from previous crash
   */
  async cleanupZombies() {
    try {
      const pidsData = await fs.readFile(this.pidsFile, 'utf-8');
      const pids: Record<string, number> = JSON.parse(pidsData);
      
      console.log('Found PIDs from previous session:', pids);
      
      // Kill all previous processes
      for (const [serviceName, pid] of Object.entries(pids)) {
        try {
          console.log(`Cleaning up zombie process: ${serviceName} (PID ${pid})`);
          
          // Use tree-kill to kill process and all children
          await new Promise<void>((resolve) => {
            treeKill(pid, 'SIGKILL', (err) => {
              if (err) {
                console.warn(`Could not kill ${serviceName} (PID ${pid}):`, err.message);
              }
              resolve();
            });
          });
        } catch (err) {
          // Process might already be dead - that's fine
          console.log(`Process ${serviceName} (PID ${pid}) already terminated`);
        }
      }
      
      // Clear the PIDs file
      await fs.unlink(this.pidsFile);
      console.log('Zombie cleanup complete');
      
    } catch (err) {
      // File doesn't exist - first launch or clean shutdown
      console.log('No zombie processes to clean up');
    }
  }
  
  /**
   * Save PIDs to file so we can kill them on next launch if needed
   */
  async savePIDs() {
    const pids: Record<string, number> = {};
    
    for (const [name, proc] of this.processes) {
      if (proc.pid) {
        pids[name] = proc.pid;
      }
    }
    
    await fs.writeFile(this.pidsFile, JSON.stringify(pids, null, 2));
  }
  
  /**
   * Start all services as child processes
   */
  async startServices() {
    // CRITICAL: Clean up zombies first
    await this.cleanupZombies();
    
    for (const service of SERVICES) {
      await this.startService(service);
    }
    
    // Save PIDs for crash recovery
    await this.savePIDs();
    
    // Wait for all services to be healthy
    await this.waitForHealthChecks();
    
    console.log('All services started and healthy');
  }
  
  /**
   * Start a single service
   */
  private async startService(service: ServiceConfig) {
    console.log(`Starting ${service.name}...`);
    
    const proc = spawn(service.executable, service.args, {
      env: {
        ...process.env,
        ...service.env
      },
      cwd: app.getPath('userData'),
      stdio: ['ignore', 'pipe', 'pipe']  // stdin ignored, stdout/stderr piped
    });
    
    // Capture logs for debugging
    proc.stdout?.on('data', (data) => {
      console.log(`[${service.name}] ${data.toString().trim()}`);
    });
    
    proc.stderr?.on('data', (data) => {
      console.error(`[${service.name}] ${data.toString().trim()}`);
    });
    
    // Handle crashes
    proc.on('exit', (code, signal) => {
      console.error(`${service.name} exited with code ${code}, signal ${signal}`);
      
      if (code !== 0 && code !== null) {
        // Service crashed - try to restart
        console.log(`Attempting to restart ${service.name}...`);
        setTimeout(() => {
          this.restartService(service.name);
        }, 2000);  // 2 second delay
      }
    });
    
    // Handle spawn errors
    proc.on('error', (err) => {
      console.error(`Failed to start ${service.name}:`, err);
    });
    
    this.processes.set(service.name, proc);
    
    console.log(`${service.name} started with PID ${proc.pid}`);
  }
  
  /**
   * Restart a crashed service
   */
  private async restartService(serviceName: string) {
    const service = SERVICES.find(s => s.name === serviceName);
    if (!service) {
      console.error(`Service ${serviceName} not found in config`);
      return;
    }
    
    // Remove old process
    this.processes.delete(serviceName);
    
    // Start new process
    await this.startService(service);
    
    // Update PIDs file
    await this.savePIDs();
  }
  
  /**
   * Wait for all services to respond to health checks
   */
  async waitForHealthChecks() {
    const healthPromises = SERVICES.map(service => 
      this.waitForServiceHealth(service.name, service.port)
    );
    
    await Promise.all(healthPromises);
  }
  
  /**
   * Wait for a specific service to be healthy
   */
  private async waitForServiceHealth(name: string, port: number): Promise<void> {
    const url = `http://localhost:${port}/health`;
    const maxAttempts = 30;  // 30 seconds timeout
    const delayMs = 1000;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          console.log(`${name} health check passed:`, data);
          return;
        }
      } catch (err) {
        // Service not ready yet
      }
      
      if (attempt === maxAttempts) {
        throw new Error(`${name} failed to become healthy after ${maxAttempts} seconds`);
      }
      
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  /**
   * Stop all services gracefully
   */
  async stopServices() {
    console.log('Stopping all services...');
    
    for (const [name, proc] of this.processes) {
      if (proc.pid) {
        console.log(`Stopping ${name} (PID ${proc.pid})...`);
        
        // Try graceful shutdown first
        proc.kill('SIGTERM');
        
        // Wait 5 seconds, then force kill if needed
        await new Promise<void>((resolve) => {
          const timeout = setTimeout(() => {
            console.log(`Force killing ${name}...`);
            treeKill(proc.pid!, 'SIGKILL', () => resolve());
          }, 5000);
          
          proc.on('exit', () => {
            clearTimeout(timeout);
            resolve();
          });
        });
      }
    }
    
    this.processes.clear();
    
    // Clean up PIDs file (clean shutdown)
    try {
      await fs.unlink(this.pidsFile);
    } catch (err) {
      // File might not exist - that's fine
    }
    
    console.log('All services stopped');
  }
}

// Usage in Electron main process
const orchestrator = new DesktopOrchestrator();

app.on('ready', async () => {
  try {
    await orchestrator.startServices();
    createWindow();  // Now safe to show UI
  } catch (err) {
    console.error('Failed to start services:', err);
    app.quit();
  }
});

app.on('before-quit', async (event) => {
  event.preventDefault();  // Prevent quit until cleanup done
  
  await orchestrator.stopServices();
  
  app.exit(0);  // Now actually quit
});

// Handle hard crashes
process.on('uncaughtException', async (err) => {
  console.error('Uncaught exception:', err);
  await orchestrator.stopServices();
  app.exit(1);
});
```

**Key safeguards:**

1. ✅ **Zombie cleanup:** Kills leftover processes from crashes
2. ✅ **PID tracking:** Records all process IDs for recovery
3. ✅ **Health checks:** Waits for services before showing UI
4. ✅ **Auto-restart:** Crashed services restart automatically
5. ✅ **Graceful shutdown:** SIGTERM first, SIGKILL if needed
6. ✅ **Tree kill:** Kills service and all child processes

---

### 15.5 Service Bundling (Desktop Distribution)

**Python services → Standalone executables (PyInstaller)**

```bash
# Build ingestion service
cd services/ingestion-service

pyinstaller \
  --onefile \
  --name ingestion-service \
  --add-data "models:models" \
  --hidden-import=nupunkt \
  --hidden-import=uvicorn \
  main.py

# Output: dist/ingestion-service (macOS/Linux)
#         dist/ingestion-service.exe (Windows)
```

**Node services → Standalone executables (pkg)**

```bash
# Build records service
cd services/records-service

pkg . \
  --targets node20-macos-x64,node20-win-x64,node20-linux-x64 \
  --output ../../dist/services/records-service

# Output: records-service (macOS)
#         records-service.exe (Windows)
#         records-service (Linux)
```

**Result:** Each service is a single executable with runtime + dependencies bundled.

---

### 15.6 Electron Bundling

**electron-builder configuration:**
```json
{
  "appId": "com.factsway.app",
  "productName": "FACTSWAY",
  "directories": {
    "output": "dist"
  },
  "files": [
    "dist-electron/**/*",
    "dist/**/*"
  ],
  "extraResources": [
    {
      "from": "build/services/",
      "to": "services/",
      "filter": ["**/*"]
    },
    {
      "from": "build/pandoc/",
      "to": "pandoc/",
      "filter": ["**/*"]
    }
  ],
  "mac": {
    "target": "dmg",
    "category": "public.app-category.productivity",
    "icon": "build/icon.icns"
  },
  "win": {
    "target": "nsis",
    "icon": "build/icon.ico"
  }
}
```

**Bundled application structure:**
```
FACTSWAY.app/
├── Contents/
│   ├── MacOS/
│   │   └── FACTSWAY              # Electron binary
│   ├── Resources/
│   │   ├── app.asar              # Frontend + Electron main
│   │   ├── services/             # Service executables
│   │   │   ├── records-service
│   │   │   ├── ingestion-service
│   │   │   ├── export-service
│   │   │   ├── caseblock-service
│   │   │   ├── signature-service
│   │   │   ├── facts-service
│   │   │   ├── exhibits-service
│   │   │   └── caselaw-service
│   │   └── pandoc/               # Pandoc binary
│   │       └── pandoc
│   └── Info.plist
```

**Total installer size:** ~250MB (vs 500MB+ with Docker images)

**Installation:** Standard drag-to-Applications (Mac) or NSIS installer (Windows)

---

### 15.7 Frontend (Vue 3)

**Desktop Frontend:**
```json
{
  "name": "@factsway/desktop-frontend",
  "dependencies": {
    "vue": "^3.4.15",
    "pinia": "^2.1.7",
    "@tiptap/vue-3": "^2.1.16",
    "@tiptap/starter-kit": "^2.1.16",
    "axios": "^1.6.5"
  },
  "devDependencies": {
    "vite": "^5.0.11",
    "typescript": "^5.3.3"
  }
}
```

**Web Trial Frontend:**
```json
{
  "name": "@factsway/web-trial",
  "dependencies": {
    "vue": "^3.4.15",
    "axios": "^1.6.5"
  },
  "devDependencies": {
    "vite": "^5.0.11"
  }
}
```

**Adapter Pattern (Environment-Aware):**
```typescript
// adapters/api.ts
const baseURL = (() => {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // Desktop app (Electron serves on localhost:8080)
    return 'http://localhost:3001';  // Local services
  } else if (process.env.VITE_ENV === 'trial') {
    // Web trial
    return 'https://api.factsway.com';  // Cloud services
  } else {
    // Production web or enterprise
    return process.env.VITE_API_URL || 'https://api.factsway.com';
  }
})();

export const api = axios.create({ 
  baseURL,
  timeout: 30000
});

// Service-specific adapters
export const recordsAPI = {
  listTemplates: () => api.get('/api/templates'),
  getTemplate: (id: string) => api.get(`/api/templates/${id}`),
  createCase: (data: CreateCaseInput) => api.post('/api/cases', data),
  // ... etc
};

export const ingestionAPI = {
  ingest: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/ingest', formData);
  }
};
```

---

### 15.8 System Dependencies

**Required for all deployments:**
```yaml
pandoc: "3.6+"     # MINIMUM 3.6 for HTML footnote parsing
libreoffice: "7.6+" # For PDF preview
```

**Desktop-specific:**
```yaml
node: "20.x"       # For Electron (bundled in app)
python: "3.11"     # For services (bundled in executables)
```

**Cloud deployment:**
```yaml
kubernetes: "1.28+" # For service orchestration
postgresql: "15+"   # For cloud database (desktop uses SQLite)
redis: "7.0+"       # For rate limiting, caching
```

---

### 15.9 Database Strategy

**Desktop Deployment:**
```
SQLite (better-sqlite3)
└── ~/Library/Application Support/FACTSWAY/factsway.db
```

**Cloud/Enterprise Deployment:**
```
PostgreSQL 15+
└── Hosted database (RDS, Cloud SQL, self-hosted)
```

**Service-agnostic data access:**
```typescript
// Services use abstract Repository pattern
interface CaseRepository {
  create(data: CreateCaseInput): Promise<Case>;
  findById(id: string): Promise<Case | null>;
  list(filters: CaseFilters): Promise<Case[]>;
  update(id: string, data: UpdateCaseInput): Promise<Case>;
  delete(id: string): Promise<void>;
}

// Desktop: SQLiteRepository implements CaseRepository
class SQLiteCaseRepository implements CaseRepository {
  constructor(private db: Database) {}
  
  async create(data: CreateCaseInput): Promise<Case> {
    const stmt = this.db.prepare('INSERT INTO cases ...');
    const result = stmt.run(data);
    return this.findById(result.lastInsertRowid);
  }
  // ... etc
}

// Cloud: PostgresRepository implements CaseRepository  
class PostgresCaseRepository implements CaseRepository {
  constructor(private pool: Pool) {}
  
  async create(data: CreateCaseInput): Promise<Case> {
    const result = await this.pool.query('INSERT INTO cases ...');
    return this.findById(result.rows[0].id);
  }
  // ... etc
}

// Service doesn't know which implementation
const repo: CaseRepository = 
  process.env.DATABASE_TYPE === 'postgres'
    ? new PostgresCaseRepository(pool)
    : new SQLiteCaseRepository(db);
```

---

### 15.10 Development Environment

**Prerequisites:**
- Node.js 20 LTS
- Python 3.11
- Git
- Docker (optional - only needed for cloud service testing with containers)

**Setup:**
```bash
# Clone monorepo
git clone https://github.com/factsway/factsway-platform.git
cd factsway-platform

# Install all dependencies
npm install

# Build service executables (for testing desktop orchestration)
npm run build:services

# Start services as processes (simulates desktop)
npm run dev:desktop

# OR start services in Docker (simulates cloud)
npm run dev:cloud

# In another terminal, start frontend
cd apps/desktop-frontend
npm run dev

# Electron app connects to services
npm run electron:dev
```

**Development URLs:**
- Frontend: http://localhost:8080
- Records API: http://localhost:3001/api
- Ingestion API: http://localhost:3002/api
- Export API: http://localhost:3003/api

---

### 15.11 Testing Strategy

**Unit Tests (per service):**
```bash
cd services/records-service
npm test  # Jest + Supertest
```

**Integration Tests (cross-service):**
```bash
# Start all services as processes
npm run dev:desktop

# Run integration tests
npm run test:integration
```

**End-to-End Tests (Electron):**
```bash
# Start Electron in test mode
npm run test:e2e  # Playwright
```

---

## 17. File Structure

### 16.1 Monorepo Structure

FACTSWAY uses a monorepo containing all services and frontends:

```
factsway-platform/
├── services/                    # Backend microservices
│   ├── records-service/         # TypeScript/Express
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── templates.ts
│   │   │   │   ├── cases.ts
│   │   │   │   └── drafts.ts
│   │   │   ├── repositories/
│   │   │   │   ├── sqlite/      # Desktop implementation
│   │   │   │   │   └── case-repository.ts
│   │   │   │   └── postgres/    # Cloud implementation
│   │   │   │       └── case-repository.ts
│   │   │   ├── models/
│   │   │   │   └── case.ts
│   │   │   └── server.ts
│   │   ├── tests/
│   │   ├── Dockerfile           # For cloud deployment
│   │   ├── package.json
│   │   ├── build.js             # pkg bundling script
│   │   └── tsconfig.json
│   │
│   ├── ingestion-service/       # Python/FastAPI
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
│   │   └── build.spec           # PyInstaller spec
│   │
│   ├── export-service/          # Python/FastAPI
│   │   ├── app/
│   │   │   ├── routes/
│   │   │   │   └── export.py
│   │   │   ├── generators/
│   │   │   │   ├── pandoc_converter.py
│   │   │   │   └── ooxml_injector.py
│   │   │   └── main.py
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   └── build.spec
│   │
│   ├── caseblock-service/       # TypeScript/Express
│   ├── signature-service/       # TypeScript/Express
│   ├── facts-service/          # TypeScript/Express
│   ├── exhibits-service/       # TypeScript/Express
│   └── caselaw-service/        # TypeScript/Express
│
├── apps/                        # Frontend applications
│   ├── desktop-frontend/        # Electron + Vue 3
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Editor/
│   │   │   │   │   ├── TiptapEditor.vue
│   │   │   │   │   └── Toolbar.vue
│   │   │   │   ├── Evidence/
│   │   │   │   │   ├── EvidenceSidebar.vue
│   │   │   │   │   └── CitationMarker.vue
│   │   │   │   └── Layout/
│   │   │   ├── views/
│   │   │   │   ├── CasesView.vue
│   │   │   │   ├── DraftView.vue
│   │   │   │   └── TemplatesView.vue
│   │   │   ├── adapters/
│   │   │   │   ├── api.ts           # Axios base config
│   │   │   │   ├── cases.ts
│   │   │   │   ├── templates.ts
│   │   │   │   └── drafts.ts
│   │   │   ├── stores/              # Pinia stores
│   │   │   │   ├── cases.ts
│   │   │   │   ├── drafts.ts
│   │   │   │   └── evidence.ts
│   │   │   └── main.ts
│   │   ├── electron/
│   │   │   ├── main/
│   │   │   │   ├── index.ts         # Electron main process
│   │   │   │   ├── orchestrator.ts  # Service process management
│   │   │   │   └── menu.ts
│   │   │   └── preload/
│   │   │       └── index.ts
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── web-trial/               # Web trial (freemium)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── UploadForm.vue
│   │   │   │   ├── ResultsDisplay.vue
│   │   │   │   └── ConversionCTA.vue
│   │   │   ├── views/
│   │   │   │   ├── HomeView.vue
│   │   │   │   └── ResultsView.vue
│   │   │   ├── adapters/
│   │   │   │   └── trial-api.ts     # Points to cloud
│   │   │   └── main.ts
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── mobile-intake/           # Pro se mobile (future)
│       └── (React Native structure TBD)
│
├── packages/                    # Shared code
│   ├── shared-types/            # TypeScript types
│   │   ├── src/
│   │   │   ├── template.ts
│   │   │   ├── case.ts
│   │   │   ├── draft.ts
│   │   │   ├── evidence.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── shared-validation/       # Zod schemas
│       ├── src/
│       │   ├── template.schema.ts
│       │   ├── case.schema.ts
│       │   └── index.ts
│       └── package.json
│
├── infrastructure/              # Deployment configs
│   ├── docker/
│   │   ├── docker-compose.dev.yml       # Local development
│   │   └── docker-compose.cloud.yml     # Cloud deployment
│   │
│   ├── kubernetes/              # Cloud/enterprise deployment
│   │   ├── services/
│   │   │   ├── records-deployment.yaml
│   │   │   ├── ingestion-deployment.yaml
│   │   │   └── ...
│   │   ├── ingress.yaml
│   │   └── secrets.yaml
│   │
│   └── electron-builder/        # Desktop app packaging
│       ├── build-config.json
│       └── entitlements.plist
│
├── scripts/                     # Build & deployment scripts
│   ├── build-services.sh        # Bundle all services
│   ├── start-dev-processes.sh   # Start services as processes (desktop sim)
│   ├── start-dev-docker.sh      # Start services in Docker (cloud sim)
│   └── package-desktop.sh       # electron-builder packaging
│
├── docs/                        # Documentation
│   ├── runbooks/
│   │   ├── RUNBOOK_0.md         # This specification
│   │   ├── RUNBOOK_1.md
│   │   └── ...
│   └── api/
│       ├── records-api.md
│       ├── ingestion-api.md
│       └── ...
│
├── package.json                 # Root package.json (workspace)
├── tsconfig.json               # Shared TypeScript config
└── README.md
```

### 16.2 Workspace Configuration

**Root package.json:**
```json
{
  "name": "factsway-platform",
  "private": true,
  "workspaces": [
    "services/*",
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "install:all": "npm install && npm install --workspaces",
    
    "build:services": "npm run build:ts-services && npm run build:py-services",
    "build:ts-services": "node scripts/build-ts-services.js",
    "build:py-services": "node scripts/build-py-services.js",
    
    "dev:desktop": "concurrently \"npm run dev:services:processes\" \"npm run dev:frontend\"",
    "dev:cloud": "concurrently \"npm run dev:services:docker\" \"npm run dev:frontend\"",
    
    "dev:services:processes": "./scripts/start-dev-processes.sh",
    "dev:services:docker": "docker-compose -f infrastructure/docker/docker-compose.dev.yml up",
    
    "dev:frontend": "npm run dev --workspace=apps/desktop-frontend",
    
    "test": "npm run test --workspaces",
    "test:integration": "npm run test:integration --workspace=tests",
    
    "package:desktop": "./scripts/package-desktop.sh",
    
    "lint": "npm run lint --workspaces"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

### 16.3 Service Template

Each service follows consistent structure:

```
<service-name>/
├── src/ (or app/ for Python)
│   ├── routes/              # API endpoint handlers
│   ├── services/            # Business logic
│   ├── repositories/        # Data access (SQLite/Postgres abstraction)
│   ├── models/              # Type definitions
│   └── server.ts (main.py)  # Entry point
├── tests/
│   ├── unit/
│   └── integration/
├── Dockerfile               # For cloud deployment
├── build.spec (build.js)    # For desktop bundling
├── .env.example
├── package.json (requirements.txt)
└── README.md
```

---

## 18. Pre-built Texas Template

### 17.1 Template Definition

```json
{
  "id": "texas-district-standard-v1",
  "name": "Texas District Court - Standard Motion",
  "description": "Standard formatting for Texas state district court motions",
  "created_at": "2025-01-01T00:00:00Z",
  "modified_at": "2025-01-01T00:00:00Z",
  
  "case_block": {
    "court_line_format": "IN THE {{court_type}} COURT OF {{county}} COUNTY, TEXAS",
    "judicial_district_format": "{{district_number}} JUDICIAL DISTRICT",
    "cause_number_format": "CAUSE NO. {{cause_number}}",
    "party_block": {
      "format": "section_symbol",
      "party_groups": [
        {
          "id": "primary",
          "plaintiff_label": "Plaintiff",
          "defendant_label": "Defendant",
          "connector": "v."
        }
      ]
    },
    "motion_title": {
      "format": "centered_bold_caps",
      "line_above": false,
      "line_below": false
    },
    "salutation": {
      "addressee": "TO THE HONORABLE JUDGE OF SAID COURT:",
      "body_template": "NOW COMES {{filer_name}}, {{filer_role}} in the above-styled and numbered cause, and files this {{motion_title}}, and in support thereof, would show the Court as follows:"
    }
  },
  
  "outline_schema": {
    "name": "Texas Standard",
    "sequential_paragraph_mode": false,
    "levels": [
      {
        "level": 1,
        "name": "Section",
        "format": "roman_upper",
        "style": {
          "alignment": "center",
          "bold": true,
          "caps": true,
          "underline": false
        },
        "restart_on": null,
        "indent_inches": 0
      },
      {
        "level": 2,
        "name": "Subsection",
        "format": "alpha_upper",
        "style": {
          "alignment": "left",
          "bold": true,
          "caps": false,
          "underline": false
        },
        "restart_on": 1,
        "indent_inches": 0
      },
      {
        "level": 3,
        "name": "Point",
        "format": "numeric",
        "style": {
          "alignment": "left",
          "bold": true,
          "caps": false,
          "underline": false
        },
        "restart_on": 2,
        "indent_inches": 0.5
      },
      {
        "level": 4,
        "name": "Subpoint",
        "format": "alpha_lower",
        "style": {
          "alignment": "left",
          "bold": false,
          "caps": false,
          "underline": false
        },
        "restart_on": 3,
        "indent_inches": 1.0
      }
    ]
  },
  
  "signature_block": {
    "ooxml": "<!-- Default placeholder - user should upload their own -->",
    "variables": []
  },
  
  "certificate_of_service": {
    "enabled": false,
    "ooxml": "",
    "variables": []
  },
  
  "footer": {
    "left": {
      "content": "motion_title",
      "max_width_percent": 33
    },
    "center": {
      "content": "none"
    },
    "right": {
      "content": "page_number",
      "format": "number_only"
    }
  },
  
  "typography": {
    "body": {
      "font_family": "Times New Roman",
      "font_size_pt": 12,
      "line_spacing": "double",
      "paragraph_spacing_before_pt": 0,
      "paragraph_spacing_after_pt": 0,
      "first_line_indent_inches": 0.5
    },
    "blockquote": {
      "font_size_pt": 11,
      "line_spacing": "single",
      "margin_left_inches": 1.0,
      "margin_right_inches": 1.0
    },
    "footnote": {
      "font_size_pt": 10,
      "line_spacing": "single"
    },
    "page": {
      "size": "letter",
      "margins": {
        "top_inches": 1.0,
        "bottom_inches": 1.0,
        "left_inches": 1.0,
        "right_inches": 1.0
      }
    }
  }
}
```

### 17.2 Default Signature Block Placeholder

Until user uploads their own, display:

```
                                    Respectfully submitted,
                                    
                                    /s/ _____________________
                                    [Attorney Name]
                                    State Bar No. [Number]
                                    [Address]
                                    [City, State ZIP]
                                    [Phone]
                                    [Email]
                                    ATTORNEY FOR [PARTY ROLE]
```

---

## 19. Verification Checklist

This section provides verification steps for each runbook and deployment model. All checks MUST pass before proceeding to the next phase.

### 19.1 Phase 1 Verification (Runbooks 0-2)

**Runbook 1: Shared Infrastructure**

- [ ] `npm run validate-schema` passes (validates LegalDocument TypeScript schema)
- [ ] `python -m pytest tests/schema/test_legal_document.py` passes (Pydantic validation)
- [ ] All services can import and use shared types from `shared/` directory
- [ ] Schema version is "1.0.0" in all files

**Runbook 2: Document Processing Core**

- [ ] `reference.docx` opens in Microsoft Word without errors
- [ ] "Normal" style: Times New Roman, 12pt, double-spaced, 0.5" first-line indent
- [ ] "Heading 1" style: Centered, bold, caps
- [ ] `python -m pytest tests/ooxml/` passes (OOXML generators)
- [ ] `python -m pytest tests/pandoc/` passes (Pandoc wrapper)
- [ ] Footnote roundtrip preserves citations correctly

### 19.2 Phase 2 Verification (Runbooks 3-10: Microservices)

**For EACH microservice, verify:**

**Health Check:**
- [ ] Service starts without errors
- [ ] `curl localhost:{port}/health` returns 200
- [ ] Health response includes service name, version, schema_version

**Schema Validation:**
- [ ] Service rejects invalid LegalDocument (wrong schema_version)
- [ ] Service rejects malformed JSON
- [ ] Service validates required fields per Section 4.4

**Unit Tests:**
- [ ] `pytest tests/unit/` passes (95%+ coverage)
- [ ] All edge cases documented in runbook are tested

**Integration Tests:**
- [ ] `pytest tests/integration/` passes
- [ ] Service can communicate with dependent services

**Service-Specific Checks:**

**Runbook 3: Records Service (port 3001)**
- [ ] `POST /templates` creates template, returns UUID
- [ ] `GET /templates/{id}` retrieves template
- [ ] `PUT /templates/{id}` updates template
- [ ] `DELETE /templates/{id}` soft-deletes template
- [ ] Same CRUD operations work for `/cases` and `/drafts`
- [ ] Database persistence works (stop service, restart, data intact)

**Runbook 4: Ingestion Service (port 3002)**
- [ ] `POST /ingest` accepts .docx file
- [ ] Returns LegalDocument with sentences[], case_caption, signature_block
- [ ] LLM correctly identifies body start (test with 10 sample docs)
- [ ] Sentence IDs follow format `s-{paragraph_uuid}-{index}`

**Runbook 5: Export Service (port 3003)**
- [ ] `POST /export` accepts LegalDocument
- [ ] Returns .docx file (application/vnd.openxmlformats-officedocument.wordprocessingml.document)
- [ ] Generated .docx opens in Microsoft Word without errors
- [ ] Case caption renders correctly (centered, caps, bold)
- [ ] Signature block renders correctly (left-aligned, proper spacing)
- [ ] Sentence formatting preserved (bold, italic, underline)
- [ ] Page numbering appears in footer

**Runbook 6: CaseBlock Service (port 3004)**
- [ ] `POST /caseblock/extract` accepts raw OOXML
- [ ] Returns CaseCaption with plaintiffs[], defendants[], cause_number
- [ ] `POST /caseblock/format` accepts CaseCaption
- [ ] Returns formatted OOXML ready for injection

**Runbook 7: Signature Service (port 3005)**
- [ ] `POST /signature/extract` accepts raw OOXML
- [ ] Returns SignatureBlock with attorney_name, bar_number, contact info
- [ ] `POST /signature/format` accepts SignatureBlock
- [ ] Returns formatted OOXML ready for injection

**Runbook 8: Facts Service (port 3006)**
- [ ] `POST /facts/parse` accepts paragraph text
- [ ] Returns sentences[] with stable IDs
- [ ] NUPunkt sentence detection achieves >90% accuracy (test with legal corpus)
- [ ] LLM verification triggers only on ambiguous cases
- [ ] Sentence ID preservation works across re-parses (80% similarity threshold)
- [ ] `GET /facts/sentences/{id}` retrieves sentence by ID

**Runbook 9: Exhibits Service (port 3007)**
- [ ] `POST /exhibits` uploads file, returns Exhibit with UUID
- [ ] `GET /exhibits/{id}` retrieves exhibit metadata
- [ ] `POST /exhibits/appendix` generates exhibit appendix OOXML
- [ ] Label assignment works (first reference → "A", second → "B", etc.)
- [ ] File storage works (uploads saved to `/uploads/{case_id}/exhibits/`)

**Runbook 10: Caselaw Service (port 3008)**
- [ ] `POST /caselaw/detect` accepts paragraph text
- [ ] Returns detected citations with components (case_name, reporter, volume, page, year)
- [ ] Citation detection accuracy >95% (test with 50 sample citations)
- [ ] `POST /caselaw/link` accepts citation + opinion file, returns CaselawCitation
- [ ] Statute citation detection works for TEX. codes

### 19.3 Common Pitfalls & Prevention

**Pitfall 1: Schema Drift**
- **Symptom:** Service A sends LegalDocument, Service B rejects it
- **Cause:** Services using different schema versions
- **Prevention:**
  - All services MUST import schema from `shared/schemas/legal_document.py`
  - CI/CD pipeline validates schema consistency across services
  - Breaking changes require MAJOR version bump

**Pitfall 2: Sentence ID Instability**
- **Symptom:** Evidence links break after user edits paragraph
- **Cause:** Sentence re-parsing generates new IDs
- **Prevention:**
  - Always call `/facts/parse` with existing sentence registry
  - Verify ID preservation algorithm with unit tests
  - Monitor ID preservation rate (should be >80% for minor edits)

**Pitfall 3: CitationNode Leaking to Backend**
- **Symptom:** Export Service crashes on CitationNode
- **Cause:** Frontend sent Tiptap JSON instead of LegalDocument
- **Prevention:**
  - Frontend transform layer MUST convert CitationNode → plain text before API call
  - Backend schema validation rejects unknown node types
  - Integration tests verify frontend → backend transformation

**Pitfall 4: Service Port Conflicts**
- **Symptom:** Service fails to start ("Address already in use")
- **Cause:** Port collision between services
- **Prevention:**
  - Use assigned ports (3001-3008, see Section 1.2)
  - Docker Compose maps ports correctly
  - Health check script verifies all ports are free before starting

**Pitfall 5: Missing Schema Validation**
- **Symptom:** Service crashes on malformed input
- **Cause:** Service accepts invalid LegalDocument
- **Prevention:**
  - All services MUST use Pydantic validator (Section 4.4)
  - Return 400 Bad Request with validation errors
  - Integration tests send malformed payloads

### 19.4 Phase 3 Verification (Runbooks 11-14: Frontend)

**Runbook 11: Frontend Core**
- [ ] `npm run build` completes without errors
- [ ] `npm run test` passes (Jest unit tests)
- [ ] API client layer validates OpenAPI spec
- [ ] React app renders without errors
- [ ] Routing works (/, /templates, /cases, /drafts)

**Runbook 12: Template Builder**
- [ ] Template creation form saves to Records Service
- [ ] Variable editor allows adding/removing variables
- [ ] Style configurator updates template styles
- [ ] Template preview shows applied styles

**Runbook 13: Draft Editor**
- [ ] Tiptap editor initializes with toolbar
- [ ] Bold/italic/underline formatting works
- [ ] Heading levels apply correctly (H1-H6)
- [ ] Auto-save triggers every 2 seconds (debounced)
- [ ] Tiptap → LegalDocument transform works (CitationNode → plain text)
- [ ] LegalDocument → Tiptap transform works (plain text → CitationNode)

**Runbook 14: Evidence System**
- [ ] Evidence sidebar shows uploaded exhibits
- [ ] Drag-and-drop exhibit upload works
- [ ] Exhibit viewer displays PDF/image
- [ ] Citation modal allows linking evidence to sentences
- [ ] Evidence map panel shows sentence → evidence relationships

### 19.5 Phase 4 Verification (Runbook 15: Deployment)

**Docker Compose (Cloud simulation):**
- [ ] `docker-compose up --build` starts all 8 services
- [ ] All services report healthy in `docker ps`
- [ ] Frontend can reach all backend services
- [ ] End-to-end workflow works (upload → edit → export)

**Desktop (Electron):**
- [ ] `npm run electron:build` creates executable
- [ ] Electron app launches without errors
- [ ] Child processes spawn for all 8 services
- [ ] Services use localhost:{port} (no Docker)
- [ ] PID tracking prevents zombie processes
- [ ] App gracefully shuts down all services on quit

**E2E Tests (Playwright):**
- [ ] `npm run test:e2e` passes all scenarios
- [ ] Upload workflow E2E test passes
- [ ] Template creation E2E test passes
- [ ] Export workflow E2E test passes
- [ ] Evidence linking E2E test passes

### 19.6 End-to-End Verification

**Complete Workflow Test:**
1. [ ] Start all services (Docker Compose or Electron)
2. [ ] Open frontend in browser
3. [ ] Create new template ("Motion for Summary Judgment")
4. [ ] Create case (upload existing .docx OR manually enter case caption)
5. [ ] Verify Ingestion Service extracted case data correctly
6. [ ] Create draft in case
7. [ ] Type motion body with 3 sections
8. [ ] Upload exhibit (PDF contract)
9. [ ] Insert CitationNode referencing exhibit
10. [ ] Link evidence to sentence (drag exhibit onto sentence)
11. [ ] Save draft (verify auto-save indicator)
12. [ ] Export .docx
13. [ ] Open exported .docx in Microsoft Word
14. [ ] Verify formatting: fonts, spacing, margins, section numbers
15. [ ] Verify case caption: centered, caps, bold
16. [ ] Verify signature block: left-aligned, proper spacing
17. [ ] Verify footer: motion title + page numbers
18. [ ] Verify exhibit appendix: exhibit A attached
19. [ ] Close and re-open draft (verify load from Records Service)
20. [ ] Verify sentence IDs preserved (evidence links still work)

### 19.7 Cross-Reference Validation

After all edits, verify cross-references are correct:

- [ ] Section 1.2 references Section 4 (LegalDocument Schema)
- [ ] Section 1.4 references Section 11 (API Endpoints) and Section 19 (Verification)
- [ ] Section 1.5 ADR-001 references Section 4 (LegalDocument Schema)
- [ ] Section 1.5 ADR-002 references Section 2.6 (CitationNode)
- [ ] Section 1.5 ADR-003 references Section 4 (LegalDocument Schema) and Section 11 (API)
- [ ] Section 1.5 ADR-004 references Section 2.9.3 (Sentence ID Preservation)
- [ ] Section 2.5 references Section 4 (LegalDocument Schema)
- [ ] Section 2.6 references Section 2.5 (Dual Storage Model)
- [ ] All service port numbers match Section 1.2 diagram

### 19.8-19.15 Service-Specific Verification Details

**19.8 Records Service Deep Dive**
- [ ] SQLite database created at correct path
- [ ] Schema migrations run successfully
- [ ] Soft delete works (deleted_at timestamp, not hard delete)
- [ ] Query performance acceptable (<100ms for typical queries)

**19.9 Ingestion Service Deep Dive**
- [ ] LLM prompt engineering achieves >95% accuracy on body detection
- [ ] DOCX parsing handles complex documents (tables, images, footnotes)
- [ ] Error handling: rejects non-DOCX files with clear error message

**19.10 Export Service Deep Dive**
- [ ] Pandoc integration preserves formatting (bold, italic, underline)
- [ ] OOXML merger correctly injects case caption + body + signature
- [ ] Footer generation works across multi-page documents
- [ ] Page breaks render correctly in Word

**19.11 CaseBlock Service Deep Dive**
- [ ] Handles multi-plaintiff cases (joins with "and")
- [ ] Handles "next friend" relationships (role_suffix)
- [ ] Cause number extraction handles various formats (D-1-GN-XX-XXXXX, etc.)

**19.12 Signature Service Deep Dive**
- [ ] Extracts bar number from signature block text
- [ ] Handles multi-line addresses correctly
- [ ] Validates email format, phone format

**19.13 Facts Service Deep Dive**
- [ ] NUPunkt handles legal abbreviations (v., Inc., Corp., TEX. R. CIV. P.)
- [ ] Citation-aware splitting prevents breaking citations mid-text
- [ ] LLM verification budget limits prevent cost overruns

**19.14 Exhibits Service Deep Dive**
- [ ] PDF upload works (file saved, metadata stored)
- [ ] Image upload works (JPEG, PNG)
- [ ] File size limits enforced (e.g., 25MB per file)
- [ ] Label generation handles >26 exhibits (A-Z, AA, AB, ...)

**19.15 Caselaw Service Deep Dive**
- [ ] Citation regex handles Bluebook format variations
- [ ] Pinpoint page extraction works (e.g., "123 S.W.3d 456, 460" → pinpoint = "460")
- [ ] Statute section extraction handles subsections (§ 41.001(a)(1))

---

## 20. Design System

This section defines the visual language for the FACTSWAY platform. All UI implementation must adhere to these specifications to ensure consistency.

### 19.1 Design Tokens

Design tokens are the atomic values that define the visual system. They are implemented as CSS custom properties.

```css
:root {
    /* === BACKGROUNDS === */
    --bg-desk: #f0f0eb;        /* Warm grey - main app background (the "desk") */
    --bg-paper: #ffffff;        /* Pure white - document surfaces, cards, modals */
    --bg-header: #292524;       /* Dark charcoal - top navigation bar */

    /* === ACCENT COLORS === */
    --accent-primary: #c2410c;  /* Rust/orange - primary actions, folder stripes, active states */
    --accent-gold: #b45309;     /* Gold/amber - secondary highlights, pro-se badge */
    --accent-link: #3b82f6;     /* Blue - linked content, evidence connections, cross-refs */
    --accent-link-bg: #eff6ff;  /* Light blue - background for linked content */

    /* === TEXT COLORS === */
    --text-ink: #1f2937;        /* Near-black - primary text */
    --text-muted: #6b7280;      /* Grey - secondary text, labels, metadata */

    /* === BORDERS === */
    --border-subtle: #d6d3d1;   /* Light grey - card borders, dividers */

    /* === STATUS COLORS === */
    --status-proven: #15803d;   /* Green - supported claims, valid states */
    --status-gap: #b91c1c;      /* Red - errors, unsupported claims, broken refs */
    --status-weak: #d97706;     /* Amber - warnings, unlinked citations, needs attention */

    /* === TYPOGRAPHY === */
    --font-serif: 'Source Serif Pro', serif;   /* Headings, legal authority, brand */
    --font-sans: 'Inter', sans-serif;          /* UI controls, labels, body text */
    --font-mono: 'JetBrains Mono', monospace;  /* Data: cause numbers, dates, Bates numbers */
}
```

**Token Usage Rules:**

| Context | Token | Example |
|---------|-------|---------|
| App background | `--bg-desk` | Main workspace behind cards |
| Document surface | `--bg-paper` | Draft editor paper, modal backgrounds |
| Navigation | `--bg-header` | Top bar, binder tabs inactive |
| Primary buttons | `--accent-primary` | "New Template", "Upload", "Export" |
| Linked content | `--accent-link` | Citation chips, cross-refs, evidence connections |
| Linked background | `--accent-link-bg` | Hover state on linked sentences |
| Body text | `--text-ink` | Paragraphs, headings |
| Labels/metadata | `--text-muted` | Form labels, timestamps, counts |
| Success/proven | `--status-proven` | Supported claims indicator |
| Error/missing | `--status-gap` | Broken cross-refs, delete warnings |
| Warning/attention | `--status-weak` | Unlinked citations, unsupported claims |

---

### 19.2 Typography

The platform uses three font families with distinct semantic purposes.

**Font Stack:**

```css
/* Load via Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+Pro:wght@400;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
```

**Font Family Assignments:**

| Font | Purpose | Usage |
|------|---------|-------|
| Source Serif Pro | Authority, Legal | Page titles, section headers, case names, brand mark |
| Inter | Interface | Buttons, labels, form inputs, sidebar text, tooltips |
| JetBrains Mono | Data, Precision | Cause numbers, Bates numbers, dates, bar numbers, file sizes |

**Type Scale:**

| Element | Font | Size | Weight | Additional |
|---------|------|------|--------|------------|
| Page Title | Source Serif Pro | 1.5rem (24px) | 700 | - |
| Section Header | Source Serif Pro | 1.1rem (18px) | 700 | - |
| Card Title | Source Serif Pro | 1.1rem (18px) | 700 | - |
| Body Text (UI) | Inter | 0.9rem (14px) | 400 | - |
| Button Text | Inter | 0.85rem (13px) | 600 | - |
| Label | Inter | 0.75rem (12px) | 600 | uppercase, letter-spacing: 0.05em |
| Badge | Inter | 0.65rem (10px) | 700 | uppercase |
| Monospace Data | JetBrains Mono | 0.85rem (13px) | 400 | - |
| Small Meta | Inter | 0.7rem (11px) | 400 | color: --text-muted |

**Document Content Typography (Inside Draft Paper):**

The draft paper uses different typography to match legal document standards:

| Element | Font | Size | Additional |
|---------|------|------|------------|
| Document Body | Times New Roman | 1.15rem (18px) | line-height: 2.0 (double-spaced) |
| Document Heading | Times New Roman | 1.15rem (18px) | font-weight: bold, text-transform: uppercase |
| Indented Paragraph | Times New Roman | 1.15rem (18px) | text-indent: 40px |

---

### 19.3 Color Semantics

Colors carry meaning in the FACTSWAY interface. This section defines what each color communicates.

**Semantic Color Map:**

| Color | Meaning | Used For |
|-------|---------|----------|
| Blue (`--accent-link`) | "Connected" | Linked citations, cross-references, evidence connections, clickable internal links |
| Rust (`--accent-primary`) | "Action/Identity" | Primary buttons, active tab indicators, folder stripes, brand accents |
| Green (`--status-proven`) | "Verified/Complete" | Supported claims, valid states, success messages |
| Amber (`--status-weak`) | "Needs Attention" | Unlinked citations, unsupported claims, warnings, pro-se badge |
| Red (`--status-gap`) | "Error/Missing" | Broken references, delete confirmations, blocking errors |
| Grey (`--text-muted`) | "Secondary/Inactive" | Labels, metadata, disabled states, unused evidence |

**State Indicator Patterns:**

```
LINKED CONTENT (Blue)
├── Background: #eff6ff (--accent-link-bg)
├── Border: 1px solid #3b82f6 (--accent-link)
├── Text: #1e3a8a (darker blue for contrast)
└── Example: Citation chips, linked sentences

UNLINKED/WARNING (Amber)
├── Background: #fef3c7
├── Border: 1px solid #f59e0b or 1px dashed #b45309
├── Text: #92400e
└── Example: Unlinked citation chips, unsupported claims

ERROR (Red)
├── Background: #fef2f2
├── Border: 1px solid #b91c1c
├── Text: #b91c1c
└── Example: Broken cross-refs, delete warnings

SUCCESS (Green)
├── Background: #dcfce7
├── Border: 1px solid #86efac
├── Text: #15803d
└── Example: Supported claims badge, validation passed
```

**Badge Color Specifications:**

| Badge Type | Background | Border | Text |
|------------|------------|--------|------|
| Pro Se | #fef3c7 | #fcd34d | #b45309 |
| Attorney | #e0e7ff | #c7d2fe | #4338ca |
| Cited (count) | #eff6ff | none | #1e40af |
| Not Cited | #fef3c7 | none | #b45309 |
| Status: Ready | #dcfce7 | #86efac | #15803d |
| Status: Gaps | #fee2e2 | #fca5a5 | #b91c1c |
| Status: Weak | #fef3c7 | #fcd34d | #d97706 |

---

### 19.4 Component Specifications

This section defines the reusable UI components that compose the FACTSWAY interface.

#### 19.4.1 Buttons

**Button Variants:**

| Variant | Background | Text | Border | Use Case |
|---------|------------|------|--------|----------|
| Primary | `--accent-primary` (#c2410c) | white | none | Main actions: "Create Template", "Export", "Upload" |
| Secondary | transparent | `--text-ink` | 1px solid `--border-subtle` | Secondary actions: "Cancel", "Back", "Preview" |
| Danger | #b91c1c | white | none | Destructive actions: "Delete Case", "Remove Evidence" |
| Ghost | transparent | `--accent-primary` | none | Inline actions: "Add Section", "Insert Citation" |

**Button States:**
```css
/* Base button styles */
.btn {
    font-family: var(--font-sans);
    font-size: 0.85rem;
    font-weight: 600;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
}

/* Primary button */
.btn-primary {
    background: var(--accent-primary);
    color: white;
    border: none;
}
.btn-primary:hover {
    background: #9a3412; /* Darker rust */
}
.btn-primary:active {
    background: #7c2d12;
}
.btn-primary:disabled {
    background: #d6d3d1;
    color: #9ca3af;
    cursor: not-allowed;
}

/* Secondary button */
.btn-secondary {
    background: transparent;
    color: var(--text-ink);
    border: 1px solid var(--border-subtle);
}
.btn-secondary:hover {
    background: #f5f5f4;
    border-color: #a8a29e;
}

/* Danger button */
.btn-danger {
    background: #b91c1c;
    color: white;
    border: none;
}
.btn-danger:hover {
    background: #991b1b;
}

/* Ghost button */
.btn-ghost {
    background: transparent;
    color: var(--accent-primary);
    border: none;
    padding: 0.25rem 0.5rem;
}
.btn-ghost:hover {
    background: #fef2f2;
}
```

**Button Sizes:**

| Size | Padding | Font Size | Use Case |
|------|---------|-----------|----------|
| Small | 0.25rem 0.5rem | 0.75rem | Inline actions, toolbar buttons |
| Default | 0.5rem 1rem | 0.85rem | Standard actions |
| Large | 0.75rem 1.5rem | 1rem | Primary page actions, modals |

---

#### 19.4.2 Cards

Cards are the primary container for content items. All cards share base styling with variant-specific additions.

**Base Card Styles:**
```css
.card {
    background: var(--bg-paper);
    border: 1px solid var(--border-subtle);
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}
.card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
    transition: all 0.2s ease;
}
```

**Template Card:**

Used in Templates view to display available templates.
```
┌────────────────────────────────────────┐
│ [Rust Stripe 4px]                      │
├────────────────────────────────────────┤
│                                        │
│  📄 Motion to Compel Discovery         │  ← Source Serif Pro, 700, 1.1rem
│                                        │
│  Texas District Court                  │  ← Inter, 400, 0.85rem, --text-muted
│  Last edited: Dec 15, 2024             │  ← JetBrains Mono, 400, 0.75rem
│                                        │
│  ┌──────────┐ ┌──────────┐             │
│  │ 3 cases  │ │ 12 vars  │             │  ← Count badges
│  └──────────┘ └──────────┘             │
│                                        │
└────────────────────────────────────────┘
```

| Element | Font | Size | Color |
|---------|------|------|-------|
| Top stripe | - | 4px height | `--accent-primary` |
| Title | Source Serif Pro | 1.1rem, 700 | `--text-ink` |
| Court type | Inter | 0.85rem, 400 | `--text-muted` |
| Last edited | JetBrains Mono | 0.75rem, 400 | `--text-muted` |
| Count badge | Inter | 0.7rem, 600 | `--text-muted` on #f5f5f4 |

**Case Card:**

Used in Cases view to display active cases.
```
┌────────────────────────────────────────┐
│ [Status stripe: green/amber/red]       │
├────────────────────────────────────────┤
│                                        │
│  Cruz v. ACME Corp                     │  ← Source Serif Pro, 700, 1.1rem
│  2024-CI-08479                         │  ← JetBrains Mono, 500, 0.9rem
│                                        │
│  Bexar County District Court           │  ← Inter, 400, 0.85rem
│  73rd Judicial District                │
│                                        │
│  ┌─────────────┐ ┌─────────────┐       │
│  │ PRO SE     │ │ 3 drafts    │       │  ← Badge + count
│  └─────────────┘ └─────────────┘       │
│                                        │
│  ────────────────────────────────────  │  ← Divider
│  Next deadline: Dec 28, 2024           │  ← Optional deadline row
│  Response to MSJ                       │
│                                        │
└────────────────────────────────────────┘
```

| Element | Specification |
|---------|---------------|
| Status stripe | 4px, color based on case status (green=ready, amber=gaps, red=overdue) |
| Case name | Source Serif Pro, 1.1rem, 700 |
| Cause number | JetBrains Mono, 0.9rem, 500, `--accent-primary` |
| Court info | Inter, 0.85rem, 400, `--text-muted` |
| Pro Se badge | See Badge Colors in 19.3 |
| Deadline row | Only shown if deadline exists; amber background if within 7 days |

**Evidence Card:**

Used in Vault view and Evidence Sidebar to display uploaded evidence.
```
┌────────────────────────────────────────┐
│                                        │
│  📎 Exhibit A - Purchase Agreement     │  ← Title with type icon
│                                        │
│  purchase_agreement_2024.pdf           │  ← Filename, monospace
│  2.4 MB • Uploaded Dec 10, 2024        │  ← Metadata row
│                                        │
│  ┌───────────┐ ┌───────────┐           │
│  │ EXHIBIT   │ │ Cited: 3  │           │  ← Type badge + citation count
│  └───────────┘ └───────────┘           │
│                                        │
└────────────────────────────────────────┘
```

**Evidence Type Icons:**

| Type | Icon | Badge Color |
|------|------|-------------|
| Exhibit | 📎 (paperclip) | `--accent-primary` on #fef2f2 |
| Case Law | ⚖️ (scales) | #4338ca on #e0e7ff |
| Statute | 📜 (scroll) | #15803d on #dcfce7 |

**Citation Count Badge States:**

| State | Style |
|-------|-------|
| Cited (n > 0) | Blue background (#eff6ff), blue text (#1e40af) |
| Not Cited | Amber background (#fef3c7), amber text (#b45309), dashed border |

---

#### 19.4.3 Chips

Chips are inline interactive elements within document content. They represent semantic objects (citations, variables, cross-references).

**Base Chip Styles:**
```css
.chip {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.125rem 0.5rem;
    border-radius: 4px;
    font-family: var(--font-sans);
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
}
```

**Citation Chip (Linked):**

Represents a citation connected to evidence.
```css
.chip-citation-linked {
    background: #eff6ff;
    color: #1e40af;
    border: 1px solid #3b82f6;
}
.chip-citation-linked:hover {
    background: #dbeafe;
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}
```

Visual: `[A]` or `[Exhibit A]` with blue styling

**Citation Chip (Unlinked):**

Represents a detected citation not yet connected to evidence.
```css
.chip-citation-unlinked {
    background: #fef3c7;
    color: #92400e;
    border: 1px dashed #f59e0b;
}
.chip-citation-unlinked:hover {
    background: #fde68a;
}
```

Visual: `[?]` or `[Exhibit ?]` with amber styling, dashed border

**Variable Chip:**

Represents a template variable placeholder.
```css
.chip-variable {
    background: #fef3c7;
    color: #92400e;
    border: 1px solid #fcd34d;
    font-family: var(--font-mono);
}
.chip-variable:hover {
    background: #fde68a;
}
.chip-variable.resolved {
    background: #f5f5f4;
    color: var(--text-ink);
    border: 1px solid var(--border-subtle);
}
```

Visual: `{{deadline_date}}` or resolved value

**Cross-Reference Chip:**

Represents an internal document link.
```css
.chip-crossref {
    background: #f3e8ff;
    color: #7c3aed;
    border: 1px solid #a78bfa;
}
.chip-crossref:hover {
    background: #ede9fe;
}
.chip-crossref.broken {
    background: #fef2f2;
    color: #b91c1c;
    border: 1px dashed #f87171;
    text-decoration: line-through;
}
```

Visual: `§II.A` with purple styling; broken refs show red with strikethrough

**Chip Interaction States:**

| State | Visual Change |
|-------|---------------|
| Hover | Darker background, subtle shadow |
| Active/Clicked | Opens popover for editing |
| Selected | 2px ring in chip color |
| Disabled | 50% opacity, cursor: not-allowed |

---

#### 19.4.4 Status Badges

Status badges communicate state information for cases, drafts, and evidence.

**Badge Base Styles:**
```css
.badge {
    display: inline-flex;
    align-items: center;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px; /* Pill shape */
    font-family: var(--font-sans);
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}
```

**Badge Variants:**

| Badge | Background | Border | Text | Use |
|-------|------------|--------|------|-----|
| Pro Se | #fef3c7 | #fcd34d | #b45309 | Filer type indicator |
| Attorney | #e0e7ff | #c7d2fe | #4338ca | Filer type indicator |
| Ready | #dcfce7 | #86efac | #15803d | Draft/case status |
| Gaps | #fee2e2 | #fca5a5 | #b91c1c | Draft/case status |
| Needs Review | #fef3c7 | #fcd34d | #d97706 | Draft/case status |
| Exhibit | #fef2f2 | none | `--accent-primary` | Evidence type |
| Case Law | #e0e7ff | none | #4338ca | Evidence type |
| Statute | #dcfce7 | none | #15803d | Evidence type |

---

#### 19.4.5 Panels

Panels are container components for sidebars, modals, and popovers.

**Sidebar Panel:**

The evidence sidebar and outline sidebar share this base structure.
```css
.sidebar {
    width: 280px;
    background: var(--bg-paper);
    border-left: 1px solid var(--border-subtle);
    display: flex;
    flex-direction: column;
    height: 100%;
}

.sidebar-header {
    padding: 1rem;
    border-bottom: 1px solid var(--border-subtle);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.sidebar-title {
    font-family: var(--font-serif);
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-ink);
}

.sidebar-content {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
}

.sidebar-footer {
    padding: 0.75rem 1rem;
    border-top: 1px solid var(--border-subtle);
    background: #fafaf9;
}
```

**Modal Panel:**

Used for Export Preview, Document Viewer, confirmation dialogs.
```css
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal {
    background: var(--bg-paper);
    border-radius: 12px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.modal-sm { width: 400px; }
.modal-md { width: 600px; }
.modal-lg { width: 900px; }
.modal-xl { width: 1200px; } /* Export Preview */

.modal-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--border-subtle);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-title {
    font-family: var(--font-serif);
    font-size: 1.25rem;
    font-weight: 700;
}

.modal-close {
    width: 2rem;
    height: 2rem;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    cursor: pointer;
}
.modal-close:hover {
    background: #f5f5f4;
    color: var(--text-ink);
}

.modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
}

.modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--border-subtle);
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    background: #fafaf9;
}
```

**Popover Panel:**

Used for citation editing, variable configuration, quick actions.
```css
.popover {
    position: absolute;
    background: var(--bg-paper);
    border: 1px solid var(--border-subtle);
    border-radius: 8px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
    z-index: 500;
    min-width: 240px;
    max-width: 360px;
}

.popover-header {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--border-subtle);
    font-family: var(--font-sans);
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-ink);
}

.popover-body {
    padding: 0.75rem 1rem;
}

.popover-footer {
    padding: 0.5rem 1rem;
    border-top: 1px solid var(--border-subtle);
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    background: #fafaf9;
}

/* Arrow pointing to trigger element */
.popover::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid var(--border-subtle);
}
.popover::after {
    content: '';
    position: absolute;
    top: -7px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-bottom: 7px solid var(--bg-paper);
}
```

---

#### 19.4.6 Form Elements

Form elements for inputs, selects, and toggles throughout the application.

**Text Input:**
```css
.input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    font-family: var(--font-sans);
    font-size: 0.9rem;
    color: var(--text-ink);
    background: var(--bg-paper);
    border: 1px solid var(--border-subtle);
    border-radius: 6px;
    transition: all 0.15s ease;
}

.input:focus {
    outline: none;
    border-color: var(--accent-link);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input:disabled {
    background: #f5f5f4;
    color: var(--text-muted);
    cursor: not-allowed;
}

.input.error {
    border-color: #b91c1c;
    box-shadow: 0 0 0 3px rgba(185, 28, 28, 0.1);
}

.input-label {
    display: block;
    margin-bottom: 0.25rem;
    font-family: var(--font-sans);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
}

.input-error-message {
    margin-top: 0.25rem;
    font-size: 0.8rem;
    color: #b91c1c;
}
```

**Monospace Input (for cause numbers, dates, etc.):**
```css
.input-mono {
    font-family: var(--font-mono);
    letter-spacing: 0.025em;
}
```

**Select:**
```css
.select {
    width: 100%;
    padding: 0.5rem 2rem 0.5rem 0.75rem;
    font-family: var(--font-sans);
    font-size: 0.9rem;
    color: var(--text-ink);
    background: var(--bg-paper);
    border: 1px solid var(--border-subtle);
    border-radius: 6px;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
    cursor: pointer;
}

.select:focus {
    outline: none;
    border-color: var(--accent-link);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

**Toggle Switch:**
```css
.toggle {
    position: relative;
    width: 44px;
    height: 24px;
    background: #d6d3d1;
    border-radius: 12px;
    cursor: pointer;
    transition: background 0.2s ease;
}

.toggle.active {
    background: var(--accent-primary);
}

.toggle::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s ease;
}

.toggle.active::after {
    transform: translateX(20px);
}
```

**Checkbox:**
```css
.checkbox {
    width: 18px;
    height: 18px;
    border: 2px solid var(--border-subtle);
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
}

.checkbox:hover {
    border-color: var(--accent-link);
}

.checkbox.checked {
    background: var(--accent-primary);
    border-color: var(--accent-primary);
}

.checkbox.checked::after {
    content: '✓';
    color: white;
    font-size: 12px;
    font-weight: bold;
}
```

**Form Group Layout:**
```css
.form-group {
    margin-bottom: 1rem;
}

.form-row {
    display: flex;
    gap: 1rem;
}

.form-row > * {
    flex: 1;
}
```

---

### 19.5 Layout Patterns

This section defines the structural layouts used across FACTSWAY views.

#### 19.5.1 Spacing System

All spacing uses a 4px base unit for consistency.

**Spacing Scale:**

| Token | Value | Use Case |
|-------|-------|----------|
| `--space-1` | 4px | Tight gaps, icon margins |
| `--space-2` | 8px | Related element gaps, chip padding |
| `--space-3` | 12px | Form element gaps |
| `--space-4` | 16px | Card padding, section gaps |
| `--space-5` | 20px | Panel padding |
| `--space-6` | 24px | Major section separation |
| `--space-8` | 32px | Page section gaps |
| `--space-10` | 40px | Large content separation |
| `--space-12` | 48px | Page margins |
```css
:root {
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-5: 1.25rem;
    --space-6: 1.5rem;
    --space-8: 2rem;
    --space-10: 2.5rem;
    --space-12: 3rem;
}
```

---

#### 19.5.2 Application Shell

The main application layout with fixed header and scrollable content area.
```
┌─────────────────────────────────────────────────────────────────┐
│  [HEADER - 56px fixed]                                          │
│  Logo    Cases | Templates | Vault              User Menu       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                                                                 │
│                     [CONTENT AREA]                              │
│                     (scrollable)                                │
│                                                                 │
│                                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
```css
.app-shell {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--bg-desk);
}

.app-header {
    height: 56px;
    background: var(--bg-header);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--space-6);
    flex-shrink: 0;
}

.app-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-8);
}
```

**Header Components:**

| Element | Position | Specification |
|---------|----------|---------------|
| Logo | Left | "FACTSWAY" in Source Serif Pro, 1.25rem, 700, white |
| Nav Tabs | Center | Binder tab metaphor, Inter 0.9rem 600 |
| Active Tab | - | White text, rust underline (3px) |
| Inactive Tab | - | #a8a29e text, hover → white |
| User Menu | Right | Avatar circle (32px) + dropdown trigger |

---

#### 19.5.3 Dashboard Layout

Used for Cases, Templates, and Vault list views.
```
┌─────────────────────────────────────────────────────────────────┐
│  Page Title                               [+ New Button]        │
│  Subtitle / count                                               │
├─────────────────────────────────────────────────────────────────┤
│  [Filter Bar]  Search...  │ Filter ▼ │ Sort ▼ │                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │  Card   │  │  Card   │  │  Card   │  │  Card   │            │
│  │         │  │         │  │         │  │         │            │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘            │
│                                                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                         │
│  │  Card   │  │  Card   │  │  Card   │                         │
│  │         │  │         │  │         │                         │
│  └─────────┘  └─────────┘  └─────────┘                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
```css
.dashboard-layout {
    max-width: 1400px;
    margin: 0 auto;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-6);
}

.dashboard-title {
    font-family: var(--font-serif);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-ink);
}

.dashboard-subtitle {
    font-family: var(--font-sans);
    font-size: 0.9rem;
    color: var(--text-muted);
    margin-top: var(--space-1);
}

.filter-bar {
    display: flex;
    gap: var(--space-3);
    margin-bottom: var(--space-6);
    padding: var(--space-3);
    background: var(--bg-paper);
    border-radius: 8px;
    border: 1px solid var(--border-subtle);
}

.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-6);
}
```

---

#### 19.5.4 Three-Panel Editor Layout

The primary drafting interface with outline, document, and evidence panels.
```
┌─────────────────────────────────────────────────────────────────┐
│  [HEADER]  ← Back to Case    Draft Title           [Actions]   │
├──────────┬────────────────────────────────────┬─────────────────┤
│          │                                    │                 │
│ OUTLINE  │         DOCUMENT PAPER             │    EVIDENCE     │
│  240px   │           (flexible)               │     280px       │
│          │                                    │                 │
│ § I.     │  ┌────────────────────────────┐   │  ┌───────────┐  │
│   A.     │  │                            │   │  │ Exhibit A │  │
│   B.     │  │      Editable content      │   │  └───────────┘  │
│ § II.    │  │      with sentence         │   │  ┌───────────┐  │
│   A.     │  │      highlighting          │   │  │ Case Law  │  │
│          │  │                            │   │  └───────────┘  │
│          │  │                            │   │                 │
│          │  └────────────────────────────┘   │  [+ Upload]     │
│          │                                    │                 │
├──────────┴────────────────────────────────────┴─────────────────┤
│  [FOOTER TOOLBAR]  Word count: 1,234  │  Status: Ready         │
└─────────────────────────────────────────────────────────────────┘
```
```css
.editor-layout {
    display: grid;
    grid-template-columns: 240px 1fr 280px;
    grid-template-rows: 56px 1fr 40px;
    height: 100vh;
}

.editor-header {
    grid-column: 1 / -1;
    background: var(--bg-header);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--space-4);
}

.outline-panel {
    grid-row: 2;
    background: var(--bg-paper);
    border-right: 1px solid var(--border-subtle);
    overflow-y: auto;
}

.document-panel {
    grid-row: 2;
    background: var(--bg-desk);
    padding: var(--space-8);
    overflow-y: auto;
    display: flex;
    justify-content: center;
}

.document-paper {
    width: 100%;
    max-width: 8.5in;
    min-height: 11in;
    background: var(--bg-paper);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    padding: 1in;
}

.evidence-panel {
    grid-row: 2;
    background: var(--bg-paper);
    border-left: 1px solid var(--border-subtle);
    overflow-y: auto;
}

.editor-footer {
    grid-column: 1 / -1;
    background: var(--bg-paper);
    border-top: 1px solid var(--border-subtle);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--space-4);
    font-size: 0.8rem;
    color: var(--text-muted);
}
```

**Panel Collapse Behavior:**

| Panel | Collapse Trigger | Collapsed State |
|-------|------------------|-----------------|
| Outline | Click chevron or keyboard shortcut | 40px strip with expand icon |
| Evidence | Click chevron or keyboard shortcut | 40px strip with expand icon |
| Both collapsed | - | Document expands to fill |

---

#### 19.5.5 Split Panel Layout

Used for Export Preview modal with document and validation side-by-side.
```
┌─────────────────────────────────────────────────────────────────┐
│  Export Preview                                         [X]     │
├────────────────────────────────────┬────────────────────────────┤
│                                    │                            │
│        PDF PREVIEW                 │      VALIDATION PANEL      │
│         (60%)                      │          (40%)             │
│                                    │                            │
│   ┌──────────────────────────┐    │   ✓ All citations linked   │
│   │                          │    │   ✓ Variables resolved      │
│   │    [PDF Rendering]       │    │   ⚠ 2 unsupported claims   │
│   │                          │    │   ✓ Cross-refs valid        │
│   │                          │    │                            │
│   └──────────────────────────┘    │   ─────────────────────    │
│                                    │   Export Options           │
│   Page 1 of 12                     │   □ Include draft watermark│
│                                    │                            │
├────────────────────────────────────┴────────────────────────────┤
│                              [Cancel]  [Export DOCX]  [Print]   │
└─────────────────────────────────────────────────────────────────┘
```
```css
.split-panel {
    display: grid;
    grid-template-columns: 60% 40%;
    height: 100%;
    min-height: 500px;
}

.split-panel-left {
    background: #1f2937; /* Dark for PDF contrast */
    padding: var(--space-4);
    overflow: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.split-panel-right {
    background: var(--bg-paper);
    padding: var(--space-5);
    overflow-y: auto;
    border-left: 1px solid var(--border-subtle);
}
```

---

#### 19.5.6 Responsive Breakpoints

FACTSWAY is optimized for desktop use but adapts gracefully to smaller screens.

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Desktop XL | ≥1400px | Full three-panel layout, 4-column card grid |
| Desktop | ≥1200px | Full three-panel layout, 3-column card grid |
| Laptop | ≥992px | Collapsible panels, 2-column card grid |
| Tablet | ≥768px | Single panel + drawer navigation, 2-column grid |
| Mobile | <768px | Stack layout, 1-column grid, simplified UI |
```css
/* Tablet: collapse to single panel with drawers */
@media (max-width: 991px) {
    .editor-layout {
        grid-template-columns: 1fr;
    }
    .outline-panel,
    .evidence-panel {
        position: fixed;
        top: 56px;
        bottom: 40px;
        width: 280px;
        z-index: 100;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
    }
    .outline-panel.open { transform: translateX(0); }
    .evidence-panel {
        right: 0;
        left: auto;
        transform: translateX(100%);
    }
    .evidence-panel.open { transform: translateX(0); }
}

/* Mobile: simplified layout */
@media (max-width: 767px) {
    .card-grid {
        grid-template-columns: 1fr;
    }
    .filter-bar {
        flex-direction: column;
    }
    .dashboard-header {
        flex-direction: column;
        gap: var(--space-4);
    }
}
```

---

### 19.6 Interaction Patterns

This section defines how users interact with FACTSWAY components.

#### 19.6.1 Drag and Drop

Drag and drop is used for evidence linking and outline reordering.

**Evidence Linking (Sidebar → Document):**
```
DRAG SOURCE: Evidence card in sidebar
DROP TARGET: Sentence in document

States:
1. IDLE: Evidence card has subtle grab cursor
2. DRAGGING: Card becomes semi-transparent, follows cursor
3. OVER VALID TARGET: Sentence highlights with blue background
4. DROP: Citation chip inserted at cursor position

Visual Feedback:
- Drag ghost: 50% opacity, slight rotation (2deg)
- Valid target: 2px blue border, #eff6ff background
- Invalid target: Red border flash, cursor: not-allowed
```
```css
/* Drag source */
.evidence-card {
    cursor: grab;
}
.evidence-card.dragging {
    opacity: 0.5;
    transform: rotate(2deg);
    cursor: grabbing;
}

/* Drop target */
.sentence.drop-target {
    background: var(--accent-link-bg);
    border: 2px solid var(--accent-link);
    border-radius: 4px;
}
.sentence.drop-invalid {
    animation: shake 0.3s ease;
    border-color: var(--status-gap);
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
}
```

**Outline Reordering:**
```
DRAG SOURCE: Outline item (section or subsection)
DROP TARGET: Between outline items

States:
1. IDLE: Drag handle visible on hover (⠿ icon)
2. DRAGGING: Item lifted with shadow
3. OVER TARGET: Blue insertion line appears
4. DROP: Item moves to new position, siblings renumber

Constraints:
- Cannot drop section inside its own children
- Cannot break level hierarchy (e.g., subsection cannot become root)
```

---

#### 19.6.2 Keyboard Navigation

Full keyboard accessibility for power users. All shortcuts use platform-appropriate modifiers (Ctrl on Windows/Linux, Cmd on macOS). Implementation details and conflict resolution are specified in Section 11.8.

**Global Shortcuts:**

| Shortcut | Action | Context |
|----------|--------|---------|
| `Mod + S` | Save draft | Any (shows "Saved" toast) |
| `Mod + E` | Export preview | Draft open |
| `Mod + P` | Preview | Draft open (prevents browser print) |
| `Mod + /` | Show keyboard shortcuts | Any |
| `Mod + \` | Toggle outline panel | Editor view |
| `Mod + ]` | Toggle evidence panel | Editor view |
| `Mod + F` | Find/Replace | Editor focused |
| `Escape` | Close modal/popover, deselect | Modal/popover open |

**Document Editing Shortcuts:**

| Shortcut | Action | Context |
|----------|--------|---------|
| `Mod + B` | Bold | Text selected or cursor in editor |
| `Mod + I` | Italic | Text selected or cursor in editor |
| `Mod + U` | Underline | Text selected or cursor in editor |
| `Mod + Shift + X` | Strikethrough | Text selected or cursor in editor |
| `Mod + K` | Insert/edit link | Text selected or cursor in editor |
| `Mod + 1` | Heading 1 (Section) | Cursor in editor |
| `Mod + 2` | Heading 2 (Subsection) | Cursor in editor |
| `Mod + 3` | Heading 3 (Point) | Cursor in editor |
| `Mod + 4` | Heading 4 (Subpoint) | Cursor in editor |
| `Mod + 0` | Normal paragraph | Cursor in editor |
| `Mod + Shift + B` | Block quote | Cursor in editor |
| `Mod + Shift + 8` | Bullet list | Cursor in editor |
| `Mod + Shift + 7` | Numbered list | Cursor in editor |
| `Mod + Alt + F` | Insert footnote | Cursor in editor |
| `Tab` | Indent / demote heading / next table cell | Context-dependent |
| `Shift + Tab` | Outdent / promote heading / prev table cell | Context-dependent |
| `Mod + Enter` | Add section break | Cursor in editor |
| `Mod + Z` | Undo | Editor focused |
| `Mod + Shift + Z` | Redo | Editor focused |
| `Mod + A` | Select all | Editor focused |

**Evidence System Shortcuts:**

| Shortcut | Action | Context |
|----------|--------|---------|
| `Mod + Shift + C` | Insert citation | Cursor in editor |
| `Mod + Shift + V` | Insert variable | Cursor in editor |
| `Mod + Shift + R` | Insert cross-reference | Cursor in editor |

**Browser Conflict Resolution:**

Some shortcuts conflict with browser defaults. See Section 11.8 for detailed resolution strategy.

| Shortcut | Browser Default | FACTSWAY Action | Resolution |
|----------|-----------------|-----------------|------------|
| `Mod + P` | Print | Preview | Prevent default, use FACTSWAY Preview |
| `Mod + S` | Save page | Save draft | Prevent default, show "Saved" toast |
| `Mod + N` | New window | — | Do NOT prevent; use toolbar for new draft |
| `Mod + O` | Open file | — | Do NOT prevent; use toolbar for open |

**Focus Management:**
```css
/* Visible focus ring for keyboard navigation */
:focus-visible {
    outline: 2px solid var(--accent-link);
    outline-offset: 2px;
}

/* Remove default focus for mouse users */
:focus:not(:focus-visible) {
    outline: none;
}
```

**Shortcut Hints:**

All toolbar buttons display keyboard shortcuts on hover via the `title` attribute:
```html
<button
  @click="toggleBold"
  title="Bold (Ctrl+B)"
  :class="{ active: editor.isActive('bold') }"
>
  <BoldIcon />
</button>
```

Platform detection should display "Cmd" on macOS and "Ctrl" on Windows/Linux.

---

#### 19.6.3 Hover and Selection States

**Card Hover:**
```css
.card {
    transition: all 0.2s ease;
}
.card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}
.card:active {
    transform: translateY(0);
}
```

**Sentence Selection (for linking):**
```
States:
1. IDLE: Normal text
2. HOVER: Subtle background tint (#fafaf9)
3. SELECTED: Blue left border (3px), light blue background
4. LINKED: Blue chip visible, sentence has [A] marker

Interaction:
- Click to select sentence
- Shift+Click to select range
- Cmd/Ctrl+Click to toggle selection
```
```css
.sentence {
    padding: 0.125rem 0.25rem;
    margin: -0.125rem -0.25rem;
    border-left: 3px solid transparent;
    transition: all 0.15s ease;
}
.sentence:hover {
    background: #fafaf9;
}
.sentence.selected {
    background: var(--accent-link-bg);
    border-left-color: var(--accent-link);
}
.sentence.linked {
    background: transparent;
    border-left-color: transparent;
}
.sentence.linked::before {
    content: attr(data-citation-marker);
    font-size: 0.7rem;
    color: var(--accent-link);
    margin-right: 0.25rem;
}
```

---

#### 19.6.4 Loading States

**Button Loading:**
```css
.btn.loading {
    position: relative;
    color: transparent;
    pointer-events: none;
}
.btn.loading::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    top: 50%;
    left: 50%;
    margin: -8px 0 0 -8px;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
```

**Skeleton Loading (for cards):**
```css
.skeleton {
    background: linear-gradient(
        90deg,
        #f5f5f4 25%,
        #e7e5e4 50%,
        #f5f5f4 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
}

@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

.skeleton-text {
    height: 1rem;
    margin-bottom: 0.5rem;
}
.skeleton-text.short { width: 40%; }
.skeleton-text.medium { width: 70%; }
.skeleton-text.full { width: 100%; }
```

**Full-Page Loading:**
```css
.loading-overlay {
    position: fixed;
    inset: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.loading-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid var(--border-subtle);
    border-top-color: var(--accent-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

.loading-text {
    margin-top: var(--space-4);
    font-family: var(--font-sans);
    color: var(--text-muted);
}
```

---

#### 19.6.5 Toast Notifications

Transient messages for non-blocking feedback.
```
┌────────────────────────────────────┐
│  ✓  Draft saved successfully       │  ← Success toast
└────────────────────────────────────┘

┌────────────────────────────────────┐
│  ⚠  2 citations need attention     │  ← Warning toast
└────────────────────────────────────┘

┌────────────────────────────────────┐
│  ✕  Export failed. Try again.      │  ← Error toast
└────────────────────────────────────┘
```
```css
.toast-container {
    position: fixed;
    bottom: var(--space-6);
    right: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    z-index: 1100;
}

.toast {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: var(--bg-paper);
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    font-family: var(--font-sans);
    font-size: 0.9rem;
    animation: slideIn 0.3s ease;
}

.toast.success { border-left: 4px solid var(--status-proven); }
.toast.info { border-left: 4px solid var(--accent-primary); }
.toast.warning { border-left: 4px solid var(--status-weak); }
.toast.error { border-left: 4px solid var(--status-gap); }

.toast-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
}
.toast.success .toast-icon { color: var(--status-proven); }
.toast.info .toast-icon { color: var(--accent-primary); }
.toast.warning .toast-icon { color: var(--status-weak); }
.toast.error .toast-icon { color: var(--status-gap); }

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
```

**Toast Behavior:**

| Type | Duration | Dismissible | Stacking | Use Case |
|------|----------|-------------|----------|----------|
| Success | 3 seconds | Click to dismiss | Max 3 visible | Case saved, export complete, evidence linked |
| Info | 4 seconds | Click to dismiss | Max 3 visible | Template applied, filter changed, draft auto-saved |
| Warning | 5 seconds | Click to dismiss | Max 3 visible | Missing optional field, unsaved changes, approaching limit |
| Error | Persistent | Must click X | Max 3 visible | Save failed, export error, validation failure |

---

#### 19.6.6 Transitions and Animations

**Standard Timing Functions:**
```css
:root {
    --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
    --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
    --spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

**Animation Durations:**

| Type | Duration | Use Case |
|------|----------|----------|
| Micro | 100ms | Button states, hover effects |
| Fast | 150ms | Chip interactions, selections |
| Normal | 200ms | Card hover, panel content |
| Slow | 300ms | Modal open/close, panel slide |
| Emphasis | 400ms | Page transitions, major state changes |

**Modal Animation:**
```css
.modal-backdrop {
    animation: fadeIn 0.2s ease;
}
.modal {
    animation: scaleIn 0.3s var(--ease-out);
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes scaleIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}
```

**Panel Slide Animation:**
```css
.sidebar {
    transition: transform 0.3s var(--ease-out);
}
.sidebar.collapsed {
    transform: translateX(-100%);
}
.sidebar.collapsed.right {
    transform: translateX(100%);
}
```

**Reduced Motion Support:**
```css
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

---

### 19.7 View Specifications

This section defines each view in the FACTSWAY application, connecting layouts, components, and data requirements.

#### 19.7.1 Cases View

The default landing view showing all active cases.

**Layout:** Dashboard Layout (19.5.3)

**Visual Reference:** `Factsway_Platform.html` (Gemini Round 1)
```
┌─────────────────────────────────────────────────────────────────┐
│  FACTSWAY        Cases | Templates | Vault         [User Menu] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Your Cases                                    [+ New Case]     │
│  3 active cases                                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Search cases...                    │ Status ▼ │ Sort ▼ │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐       │
│  │ [Green]       │  │ [Amber]       │  │ [Red]         │       │
│  │ Cruz v. ACME  │  │ Smith Estate  │  │ Johnson v.    │       │
│  │ 2024-CI-08479 │  │ 2024-PR-1234  │  │ City of SA    │       │
│  │               │  │               │  │               │       │
│  │ Bexar County  │  │ Bexar County  │  │ Bexar County  │       │
│  │ District      │  │ Probate       │  │ District      │       │
│  │               │  │               │  │               │       │
│  │ [PRO SE]      │  │ [ATTORNEY]    │  │ [PRO SE]      │       │
│  │ 3 drafts      │  │ 1 draft       │  │ 2 drafts      │       │
│  │───────────────│  │───────────────│  │               │       │
│  │ Due: Dec 28   │  │ Due: Jan 5    │  │               │       │
│  └───────────────┘  └───────────────┘  └───────────────┘       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Components Used:**

| Component | Specification Reference |
|-----------|------------------------|
| Case Card | 19.4.2 Cards → Case Card |
| Status Badge | 19.4.4 Status Badges |
| Filter Bar | 19.5.3 Dashboard Layout |
| Primary Button | 19.4.1 Buttons → Primary |

**Data Requirements:**
```typescript
interface CasesViewData {
  cases: Array<{
    id: string;
    name: string;           // "Cruz v. ACME Corp"
    causeNumber: string;    // "2024-CI-08479"
    court: {
      type: string;         // "District"
      county: string;       // "Bexar County"
    };
    filerType: 'pro_se' | 'attorney';
    status: 'ready' | 'gaps' | 'overdue';
    draftCount: number;
    nextDeadline?: {
      date: string;         // ISO date
      label: string;        // "Response to MSJ"
    };
    updatedAt: string;
  }>;
  filters: {
    search: string;
    status: 'all' | 'ready' | 'gaps' | 'overdue';
    sort: 'updated' | 'deadline' | 'name';
  };
}
```

**Interactions:**

| Action | Result |
|--------|--------|
| Click case card | Navigate to Case Detail view |
| Click "+ New Case" | Open New Case modal |
| Search input | Filter cards by name/cause number |
| Status filter | Show only matching status |
| Sort dropdown | Reorder cards |

---

#### 19.7.2 Templates View

View for managing reusable document templates.

**Layout:** Dashboard Layout (19.5.3)

**Visual Reference:** `Factsway_Platform.html` (Gemini Round 1)
```
┌─────────────────────────────────────────────────────────────────┐
│  FACTSWAY        Cases | Templates | Vault         [User Menu] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Your Templates                              [+ New Template]   │
│  5 templates                                                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Search templates...                │ Court ▼ │ Sort ▼  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐       │
│  │ [Rust stripe] │  │ [Rust stripe] │  │ [Rust stripe] │       │
│  │               │  │               │  │               │       │
│  │ 📄 Motion to  │  │ 📄 Response   │  │ 📄 Motion     │       │
│  │ Compel        │  │ to MSJ        │  │ for Summary   │       │
│  │               │  │               │  │ Judgment      │       │
│  │ Texas District│  │ Texas District│  │ Texas District│       │
│  │ Dec 15, 2024  │  │ Dec 10, 2024  │  │ Dec 8, 2024   │       │
│  │               │  │               │  │               │       │
│  │ 3 cases       │  │ 1 case        │  │ 5 cases       │       │
│  │ 12 variables  │  │ 8 variables   │  │ 15 variables  │       │
│  └───────────────┘  └───────────────┘  └───────────────┘       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Components Used:**

| Component | Specification Reference |
|-----------|------------------------|
| Template Card | 19.4.2 Cards → Template Card |
| Filter Bar | 19.5.3 Dashboard Layout |
| Primary Button | 19.4.1 Buttons → Primary |

**Data Requirements:**
```typescript
interface TemplatesViewData {
  templates: Array<{
    id: string;
    title: string;          // "Motion to Compel Discovery"
    courtType: string;      // "Texas District Court"
    updatedAt: string;
    caseCount: number;      // Cases using this template
    variableCount: number;  // Variables defined
  }>;
  filters: {
    search: string;
    courtType: 'all' | string;
    sort: 'updated' | 'name' | 'usage';
  };
}
```

**Interactions:**

| Action | Result |
|--------|--------|
| Click template card | Open Template Editor |
| Click "+ New Template" | Open Template Type selector |
| Search input | Filter by title |
| Court filter | Show templates for specific court type |

---

#### 19.7.3 Vault View

Case-specific evidence repository. Accessed via Case Detail or main nav (shows case selector).

**Layout:** Dashboard Layout (19.5.3) with folder tree sidebar

**Visual Reference:** Gemini Round 2 Gap 8 output
```
┌─────────────────────────────────────────────────────────────────┐
│  FACTSWAY        Cases | Templates | Vault         [User Menu] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  Evidence Vault: Cruz v. ACME    [+ Upload]   │
│  │ 📁 All      │  12 items                                      │
│  │ 📁 Exhibits │                                                │
│  │ 📁 Case Law │  ┌─────────────────────────────────────────┐   │
│  │ 📁 Statutes │  │ Search...        │ Type ▼ │ Cited ▼   │   │
│  │             │  └─────────────────────────────────────────┘   │
│  │             │                                                │
│  │             │  ┌────────────┐  ┌────────────┐  ┌──────────┐ │
│  │             │  │ 📎 Exhibit │  │ 📎 Exhibit │  │ ⚖️ Smith │ │
│  │             │  │ A - Purch. │  │ B - Email  │  │ v. Jones │ │
│  │             │  │ Agreement  │  │ Chain      │  │ 2024     │ │
│  │             │  │            │  │            │  │          │ │
│  │             │  │ 2.4 MB     │  │ 1.1 MB     │  │ 340 KB   │ │
│  │             │  │ [EXHIBIT]  │  │ [EXHIBIT]  │  │[CASE LAW]│ │
│  │             │  │ Cited: 3   │  │ Not Cited  │  │ Cited: 1 │ │
│  │             │  └────────────┘  └────────────┘  └──────────┘ │
│  └─────────────┘                                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Components Used:**

| Component | Specification Reference |
|-----------|------------------------|
| Evidence Card | 19.4.2 Cards → Evidence Card |
| Type Badge | 19.4.4 Status Badges |
| Citation Count Badge | 19.4.2 Citation Count Badge States |
| Folder Tree | Custom component (below) |

**Folder Tree Component:**
```css
.folder-tree {
    width: 160px;
    padding: var(--space-3);
    border-right: 1px solid var(--border-subtle);
}

.folder-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-radius: 6px;
    font-family: var(--font-sans);
    font-size: 0.85rem;
    color: var(--text-ink);
    cursor: pointer;
}

.folder-item:hover {
    background: #f5f5f4;
}

.folder-item.active {
    background: var(--accent-link-bg);
    color: var(--accent-link);
    font-weight: 600;
}

.folder-item .folder-icon {
    width: 16px;
    height: 16px;
}

.folder-item .folder-count {
    margin-left: auto;
    font-size: 0.75rem;
    color: var(--text-muted);
}
```

**Data Requirements:**
```typescript
interface VaultViewData {
  caseId: string;
  caseName: string;
  evidence: Array<{
    id: string;
    type: 'exhibit' | 'case_law' | 'statute';
    label: string;          // "Exhibit A" or case citation
    title: string;          // User-provided title
    filename: string;
    fileSize: number;       // bytes
    uploadedAt: string;
    citationCount: number;  // How many times cited in drafts
  }>;
  filters: {
    folder: 'all' | 'exhibit' | 'case_law' | 'statute';
    search: string;
    citedFilter: 'all' | 'cited' | 'uncited';
  };
}
```

**Interactions:**

| Action | Result |
|--------|--------|
| Click evidence card | Open Document Viewer modal |
| Click "+ Upload" | Open file picker (PDF only) |
| Click folder | Filter to that evidence type |
| Drag evidence | Start drag for linking (if in editor context) |
| Right-click card | Context menu: View, Rename, Delete |

---

#### 19.7.4 Drafting Editor View

The three-panel document editing interface.

**Layout:** Three-Panel Editor Layout (19.5.4)

**Visual Reference:** `Factsway_Drafting_Clerk.html` (Gemini Round 1), Gemini Round 2 Gaps 2/3/4
```
┌─────────────────────────────────────────────────────────────────┐
│  ← Cruz v. ACME    Motion to Compel Discovery      [Preview]   │
├──────────┬────────────────────────────────────┬─────────────────┤
│ OUTLINE  │                                    │ EVIDENCE        │
│          │  ┌────────────────────────────┐   │                 │
│ I. INTRO │  │ IN THE DISTRICT COURT...   │   │ [+ Upload]      │
│          │  │                            │   │ ─────────────── │
│ II. FACTS│  │ TO THE HONORABLE JUDGE:    │   │ 📎 Exhibit A    │
│   A. Disc│  │                            │   │ Purchase Agmt   │
│   B. Resp│  │ NOW COMES Defendant...     │   │ [Cited: 3]      │
│          │  │                            │   │                 │
│ III. ARG │  │ I. INTRODUCTION            │   │ 📎 Exhibit B    │
│   A. Rule│  │                            │   │ Email Chain     │
│   B. Obj │  │ This motion addresses      │   │ [Not Cited]     │
│     1.   │  │ Plaintiff's failure[A] to  │   │                 │
│     2.   │  │ respond to discovery.      │   │ ⚖️ Smith v.     │
│          │  │                            │   │ Jones (2024)    │
│ IV. CONCL│  │ {{deadline_date}} is the   │   │ [Cited: 1]      │
│          │  │ deadline for response.     │   │                 │
│ [+Section│  └────────────────────────────┘   │ ─────────────── │
│          │                                    │ [Evidence Map]  │
├──────────┴────────────────────────────────────┴─────────────────┤
│  Words: 1,234  │  Unsupported: 2  │  Unlinked: 1  │  Ready ✓   │
└─────────────────────────────────────────────────────────────────┘
```

**Components Used:**

| Component | Specification Reference |
|-----------|------------------------|
| Outline Panel | 19.4.5 Panels → Sidebar |
| Evidence Panel | 19.4.5 Panels → Sidebar |
| Document Paper | 19.5.4 Three-Panel Editor |
| Citation Chip | 19.4.3 Chips → Citation |
| Variable Chip | 19.4.3 Chips → Variable |
| Evidence Card (compact) | 19.4.2 Cards → Evidence Card |
| Status Footer | Custom (below) |

**Outline Panel Detail:**
```
┌─────────────────────────┐
│ OUTLINE            [−]  │  ← Collapse toggle
├─────────────────────────┤
│                         │
│ ⠿ I. INTRODUCTION       │  ← Drag handle on hover
│ ⠿ II. FACTUAL BACKGROUND│
│    ├─ A. The Discovery  │
│    └─ B. Plaintiff's... │
│ ⠿ III. ARGUMENT         │
│    ├─ A. The Discovery  │
│    └─ B. Plaintiff's... │
│       ├─ 1. "overly..." │
│       └─ 2. "unduly..." │
│ ⠿ IV. CONCLUSION        │
│                         │
│ ─────────────────────── │
│ [+ Add Section]         │
│                         │
└─────────────────────────┘
```
```css
.outline-item {
    display: flex;
    align-items: center;
    padding: var(--space-2) var(--space-3);
    font-family: var(--font-sans);
    font-size: 0.85rem;
    cursor: pointer;
    border-radius: 4px;
}

.outline-item:hover {
    background: #f5f5f4;
}

.outline-item.active {
    background: var(--accent-link-bg);
    color: var(--accent-link);
    font-weight: 600;
}

.outline-item .drag-handle {
    opacity: 0;
    margin-right: var(--space-2);
    cursor: grab;
}

.outline-item:hover .drag-handle {
    opacity: 0.5;
}

.outline-item.level-1 { padding-left: var(--space-3); }
.outline-item.level-2 { padding-left: var(--space-6); }
.outline-item.level-3 { padding-left: var(--space-8); }
```

**Evidence Panel Detail:**
```
┌─────────────────────────┐
│ EVIDENCE           [−]  │
├─────────────────────────┤
│ [+ Upload]              │
│ ─────────────────────── │
│ ┌─────────────────────┐ │
│ │ 📎 Exhibit A        │ │  ← Draggable
│ │ Purchase Agreement  │ │
│ │ [Cited: 3]          │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 📎 Exhibit B        │ │
│ │ Email Chain         │ │
│ │ [Not Cited] ⚠       │ │  ← Amber warning
│ └─────────────────────┘ │
│ ─────────────────────── │
│ [Evidence Map →]        │  ← Opens Evidence Map panel
└─────────────────────────┘
```

**Status Footer Detail:**
```css
.editor-footer {
    display: flex;
    align-items: center;
    gap: var(--space-6);
    padding: 0 var(--space-4);
    height: 40px;
    background: var(--bg-paper);
    border-top: 1px solid var(--border-subtle);
    font-family: var(--font-sans);
    font-size: 0.8rem;
    color: var(--text-muted);
}

.footer-stat {
    display: flex;
    align-items: center;
    gap: var(--space-2);
}

.footer-stat.warning {
    color: var(--status-weak);
}

.footer-stat.error {
    color: var(--status-gap);
}

.footer-status {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: var(--space-2);
}

.footer-status.ready {
    color: var(--status-proven);
}
```

**Data Requirements:**
```typescript
interface DraftingEditorData {
  draft: {
    id: string;
    title: string;
    caseId: string;
    caseName: string;
    templateId: string;
    content: ProseMirrorDocument;  // Full document structure
    variables: Record<string, string | null>;
    updatedAt: string;
  };
  outline: Array<{
    id: string;
    level: number;
    number: string;       // "I", "A", "1"
    title: string;
    hasChildren: boolean;
  }>;
  evidence: Array<{
    id: string;
    type: 'exhibit' | 'case_law' | 'statute';
    label: string;
    title: string;
    citationCount: number;
  }>;
  stats: {
    wordCount: number;
    unsupportedClaims: number;
    unlinkedCitations: number;
    brokenCrossRefs: number;
    unresolvedVariables: number;
  };
}
```

**Interactions:**

| Action | Result |
|--------|--------|
| Click outline item | Scroll document to section |
| Drag outline item | Reorder sections |
| Click "+ Add Section" | Insert new section at end |
| Drag evidence card | Start linking flow (drop on sentence) |
| Click citation chip | Open Citation Popover |
| Click variable chip | Open Variable Popover |
| Click "Evidence Map" | Open Evidence Map panel (19.7.8) |
| Click "Preview" | Open Export Preview modal |
| Cmd/Ctrl+S | Save draft |

---

#### 19.7.5 Case Block Generator View

Template builder for case blocks with live preview.

**Layout:** Split panel (editor left, preview right)

**Visual Reference:** `Factsway_Caseblock_Generator.html` (Gemini Round 1)
```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Template    Case Block Generator        [Save]      │
├────────────────────────────────┬────────────────────────────────┤
│                                │                                │
│  CONFIGURATION                 │  LIVE PREVIEW                  │
│                                │                                │
│  Court Information             │  ┌──────────────────────────┐ │
│  ┌──────────────────────────┐ │  │                          │ │
│  │ Court Type    [District▼]│ │  │ IN THE DISTRICT COURT OF │ │
│  │ State         [Texas   ▼]│ │  │ {{county}} COUNTY, TEXAS │ │
│  │ County        [________] │ │  │                          │ │
│  │ Judicial Dist [________] │ │  │    {{district}} JUDICIAL │ │
│  └──────────────────────────┘ │  │         DISTRICT         │ │
│                                │  │                          │ │
│  Party Configuration           │  │ {{plaintiff}},      §    │ │
│  ┌──────────────────────────┐ │  │      Plaintiff,     §    │ │
│  │ [+] Add Plaintiff        │ │  │                     §    │ │
│  │ [+] Add Defendant        │ │  │ v.            CAUSE NO.  │ │
│  │ [+] Add Party Group      │ │  │               {{cause}}  │ │
│  └──────────────────────────┘ │  │                     §    │ │
│                                │  │ {{defendant}},      §    │ │
│  Motion Title                  │  │      Defendant.     §    │ │
│  ┌──────────────────────────┐ │  │                          │ │
│  │ [________________]       │ │  │ {{motion_title}}         │ │
│  │ □ Line above title       │ │  │                          │ │
│  │ □ Line below title       │ │  │ TO THE HONORABLE JUDGE:  │ │
│  └──────────────────────────┘ │  │                          │ │
│                                │  └──────────────────────────┘ │
│  Salutation                    │                                │
│  ┌──────────────────────────┐ │                                │
│  │ [Default Texas salutation│ │                                │
│  │  template...           ] │ │                                │
│  └──────────────────────────┘ │                                │
│                                │                                │
└────────────────────────────────┴────────────────────────────────┘
```

**Components Used:**

| Component | Specification Reference |
|-----------|------------------------|
| Form Inputs | 19.4.6 Form Elements |
| Select | 19.4.6 Form Elements → Select |
| Checkbox | 19.4.6 Form Elements → Checkbox |
| Variable Chip | 19.4.3 Chips → Variable |
| Split Panel | 19.5.5 Split Panel (50/50 variant) |

**Data Requirements:**
```typescript
interface CaseBlockGeneratorData {
  template: {
    id: string;
    courtType: string;
    state: string;
    countyVariable: boolean;     // If true, county is a variable
    districtVariable: boolean;
    partyConfiguration: Array<{
      groupId: string;
      plaintiffs: Array<{ name: string; isVariable: boolean }>;
      defendants: Array<{ name: string; isVariable: boolean }>;
    }>;
    motionTitle: {
      text: string;
      lineAbove: boolean;
      lineBelow: boolean;
    };
    salutation: string;
  };
  preview: {
    renderedHtml: string;       // Live preview content
  };
}
```

**Interactions:**

| Action | Result |
|--------|--------|
| Change any field | Preview updates immediately |
| Click "[+] Add Plaintiff" | Add party input row |
| Toggle checkbox | Update preview with/without lines |
| Click "Save" | Save template, return to Template Editor |
| Click variable chip in preview | Highlight corresponding input |

---

#### 19.7.6 Export Preview Modal

Pre-export validation with PDF preview.

**Layout:** Modal XL (1200px) with Split Panel (19.5.5)

**Visual Reference:** Gemini Round 2 Gap 5 output
```
┌─────────────────────────────────────────────────────────────────┐
│  Export Preview                                           [X]  │
├────────────────────────────────────┬────────────────────────────┤
│                                    │                            │
│        ┌──────────────────┐       │  VALIDATION                │
│        │                  │       │                            │
│        │  [PDF Preview]   │       │  ✓ All citations linked    │
│        │                  │       │  ✓ All variables resolved  │
│        │  Page rendering  │       │  ⚠ 2 unsupported claims    │
│        │  of final DOCX   │       │     └─ View claims         │
│        │                  │       │  ✓ Cross-references valid  │
│        │                  │       │  ✓ Footnotes formatted     │
│        │                  │       │                            │
│        │                  │       │  ─────────────────────     │
│        │                  │       │                            │
│        │                  │       │  EXPORT OPTIONS            │
│        │                  │       │                            │
│        └──────────────────┘       │  □ Include draft watermark │
│                                    │  □ Include line numbers    │
│  ┌──────────────────────────┐     │  □ Track changes visible   │
│  │ ◀  Page 1 of 12  ▶       │     │                            │
│  └──────────────────────────┘     │                            │
│                                    │                            │
├────────────────────────────────────┴────────────────────────────┤
│                         [Cancel]  [Export DOCX]  [Export PDF]   │
└─────────────────────────────────────────────────────────────────┘
```

**Components Used:**

| Component | Specification Reference |
|-----------|------------------------|
| Modal XL | 19.4.5 Panels → Modal |
| Split Panel | 19.5.5 Split Panel |
| Checkbox | 19.4.6 Form Elements → Checkbox |
| Primary Button | 19.4.1 Buttons → Primary |
| Secondary Button | 19.4.1 Buttons → Secondary |

**Validation Panel States:**

| Item | Icon | Color | Condition |
|------|------|-------|-----------|
| Citations | ✓ | Green | All linked |
| Citations | ⚠ | Amber | Some unlinked |
| Citations | ✕ | Red | Broken references |
| Variables | ✓ | Green | All resolved |
| Variables | ⚠ | Amber | Some unresolved |
| Claims | ✓ | Green | All supported |
| Claims | ⚠ | Amber | Some unsupported |
| Cross-refs | ✓ | Green | All valid |
| Cross-refs | ✕ | Red | Broken references |

**Data Requirements:**
```typescript
interface ExportPreviewData {
  draft: {
    id: string;
    title: string;
  };
  preview: {
    pdfUrl: string;         // Blob URL for PDF preview
    pageCount: number;
    currentPage: number;
  };
  validation: {
    citations: { status: 'ok' | 'warning' | 'error'; count?: number };
    variables: { status: 'ok' | 'warning'; unresolved?: string[] };
    claims: { status: 'ok' | 'warning'; unsupported?: number };
    crossRefs: { status: 'ok' | 'error'; broken?: string[] };
    footnotes: { status: 'ok' | 'error' };
  };
  options: {
    watermark: boolean;
    lineNumbers: boolean;
    trackChanges: boolean;
  };
}
```

**Interactions:**

| Action | Result |
|--------|--------|
| Page navigation | Update PDF preview |
| Click "View claims" | Scroll to unsupported claims list |
| Toggle option | Update preview if applicable |
| Click "Export DOCX" | Download .docx file |
| Click "Export PDF" | Download .pdf file |
| Click "Cancel" | Close modal, return to editor |

---

#### 19.7.7 Document Viewer Modal

View uploaded evidence documents.

**Layout:** Modal LG (900px)

**Visual Reference:** Gemini Round 2 Gap 6 output
```
┌─────────────────────────────────────────────────────────────────┐
│  Exhibit A: Purchase Agreement                            [X]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │                    [PDF Rendering]                        │ │
│  │                                                           │ │
│  │              Uploaded document preview                    │ │
│  │                                                           │ │
│  │                                                           │ │
│  │                                                           │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ◀  Page 3 of 8  ▶                        [Zoom −] [+]   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  purchase_agreement_2024.pdf  •  2.4 MB  •  Dec 10, 2024       │
│  Cited 3 times in this draft                                   │
├─────────────────────────────────────────────────────────────────┤
│                          [Delete Evidence]  [Download]  [Done]  │
└─────────────────────────────────────────────────────────────────┘
```

**Delete Confirmation Overlay:**

When "Delete Evidence" is clicked, show overlay:
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │    ⚠️  DELETE EXHIBIT A?                                  │ │
│  │                                                           │ │
│  │    This evidence is cited 3 times in this draft.          │ │
│  │    Deleting will break those citations.                   │ │
│  │                                                           │ │
│  │              [Cancel]        [Delete Anyway]              │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Components Used:**

| Component | Specification Reference |
|-----------|------------------------|
| Modal LG | 19.4.5 Panels → Modal |
| Danger Button | 19.4.1 Buttons → Danger |
| Secondary Button | 19.4.1 Buttons → Secondary |

**Data Requirements:**
```typescript
interface DocumentViewerData {
  evidence: {
    id: string;
    type: 'exhibit' | 'case_law' | 'statute';
    label: string;
    title: string;
    filename: string;
    fileSize: number;
    uploadedAt: string;
    citationCount: number;
    pdfUrl: string;           // Blob URL
  };
  viewer: {
    currentPage: number;
    pageCount: number;
    zoom: number;             // 50-200%
  };
  deleteWarning?: {
    citationCount: number;
    affectedDrafts: string[];
  };
}
```

---

#### 19.7.8 Evidence Map Panel

Shows the relationship between claims and evidence across the document.

**Layout:** Sidebar Panel (280px) or expandable to modal

**Visual Reference:** Gemini Round 2 Gap 1 output
```
┌─────────────────────────────┐
│ EVIDENCE MAP           [×] │
├─────────────────────────────┤
│                             │
│ SUPPORTED CLAIMS (8)    ▼   │
│ ─────────────────────────── │
│ ┌─────────────────────────┐ │
│ │ ✓ "Plaintiff failed..." │ │
│ │   └─ Exhibit A [A]      │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ ✓ "On September 15..."  │ │
│ │   └─ Exhibit B [B]      │ │
│ └─────────────────────────┘ │
│                             │
│ UNSUPPORTED CLAIMS (2)  ▼   │
│ ─────────────────────────── │
│ ┌─────────────────────────┐ │
│ │ ⚠ "These requests were" │ │
│ │    "directly relevant"  │ │
│ │   [+ Add Evidence]      │ │
│ └─────────────────────────┘ │
│                             │
│ UNUSED EVIDENCE (1)     ▼   │
│ ─────────────────────────── │
│ ┌─────────────────────────┐ │
│ │ 📎 Exhibit C            │ │
│ │    Contract Amendment   │ │
│ │    [Not cited]          │ │
│ └─────────────────────────┘ │
│                             │
└─────────────────────────────┘
```

**Section Colors:**

| Section | Header Color | Item Background |
|---------|--------------|-----------------|
| Supported Claims | `--status-proven` | #dcfce7 |
| Unsupported Claims | `--status-weak` | #fef3c7 |
| Unused Evidence | `--text-muted` | #f5f5f4 |

**Components Used:**

| Component | Specification Reference |
|-----------|------------------------|
| Sidebar Panel | 19.4.5 Panels → Sidebar |
| Collapsible Sections | Custom (accordion) |
| Ghost Button | 19.4.1 Buttons → Ghost |

**Data Requirements:**
```typescript
interface EvidenceMapPanelProps {
  // Backend provides raw EvidenceMapData (Section 11.11)
  // This component transforms it for display
  mapData: EvidenceMapData;  // From backend
}

interface DisplayEvidence {
  // UI display format (transformed from backend)
  id: string;
  title: string;              // Derived from Evidence.label
  marker: string;             // For exhibits: "A", "B"; for case law: "" (not shown)
  type: 'exhibit' | 'case_law' | 'statute';
  supportedClaims: number;    // Count of sentences this evidence supports
  isUsed: boolean;            // true if supportedClaims > 0
}

// Transform function (client-side):
function transformEvidenceForDisplay(
  mapData: EvidenceMapData,
  citationIndex: CitationIndex
): DisplayEvidence[] {
  return mapData.evidence.map(ev => ({
    id: ev.id,
    title: ev.label,
    marker: ev.type === 'exhibit' ? citationIndex.exhibitMarkers.get(ev.id) || '' : '',
    type: ev.type === 'caselaw' ? 'case_law' : ev.type,
    supportedClaims: ev.supportingSentences?.length || 0,
    isUsed: (ev.supportingSentences?.length || 0) > 0
  }));
}
```

**Interactions:**

| Action | Result |
|--------|--------|
| Click claim | Scroll document to that sentence |
| Click evidence in claim | Open Document Viewer |
| Click "[+ Add Evidence]" | Show evidence picker dropdown |
| Drag unused evidence | Start linking flow |
| Click section header | Collapse/expand section |

---

## 21. Execution Tracing

This section specifies how the system records what happened at each pipeline boundary, enabling debugging and correctness verification. Every pipeline phase emits events; every boundary checks invariants.

### 20.1 Design Principles

**Why tracing matters:**
- Most systems encode *behavior* but not *intent*
- When something breaks, debugging becomes archaeology
- Tracing answers: What happened? What should have happened? Where did they diverge?

**Core principle:** Every pipeline boundary is a checkpoint. Data flows in, invariants are checked, data flows out, and the transition is recorded.

### 20.2 Pipeline Event Schema

Every pipeline phase emits a `PipelineEvent` when it completes:
```typescript
interface PipelineEvent {
  // Identity
  event_id: string;           // UUID for this event
  pipeline_id: string;        // UUID for the overall pipeline run

  // What happened
  phase: string;              // e.g., "parse_sentences", "resolve_citations"
  phase_index: number;        // Order in pipeline (0, 1, 2...)

  // Data fingerprints
  input_hash: string;         // SHA-256 of input data
  output_hash: string;        // SHA-256 of output data

  // Correctness
  invariants_checked: InvariantResult[];
  all_passed: boolean;        // Convenience flag: all invariants passed

  // Timing
  started_at: string;         // ISO 8601
  completed_at: string;       // ISO 8601
  duration_ms: number;

  // Context
  metadata: Record<string, unknown>;  // Phase-specific data
}
```

### 20.3 Invariant Result Schema

Each invariant check produces an `InvariantResult`:
```typescript
interface InvariantResult {
  name: string;               // e.g., "all_sentences_have_ids"
  status: 'PASS' | 'FAIL';
  expected: string;           // Human-readable expectation
  actual: string;             // What was found

  // For failures
  details?: {
    location?: string;        // Where in the data the failure occurred
    suggestion?: string;      // Potential fix
  };
}
```

### 20.4 Pipeline Boundaries

Events are emitted at each phase boundary in the export and ingest pipelines.

**Cross-cutting requirement:** All runbooks implementing pipeline phases (Runbooks 2-10) must emit `PipelineEvent` records per this specification. Individual runbook specs will reference Section 20 for event emission requirements.

**Export Pipeline (Runbook 8):**

| Phase | Input | Output | Key Invariants |
|-------|-------|--------|----------------|
| 0: Load Draft | draft_id | Draft + Case + Template | draft exists, case exists, template exists |
| 1: Resolve Variables | Draft.body (ProseMirror) | Body with variables resolved | no unresolved variables, no circular refs |
| 2: Parse Sentences | Body content | SentenceRegistry | all sentences have IDs, no duplicate IDs |
| 3: Resolve Citations | Body with CitationNodes | Body with display text | all citations have evidenceId, markers computed |
| 4: Resolve Cross-References | Body with CrossRefNodes | Body with section numbers | no broken references, all targets exist |
| 5: Transform Footnotes | HTML body | HTML with dpub-aria roles | footnote refs match footnote bodies |
| 6: Convert Body | HTML | DOCX (via Pandoc) | Pandoc exit code 0 |
| 7: Generate Case Block | Case + Template | OOXML fragment | required fields present |
| 8: Inject Signature | Signature OOXML | OOXML fragment | signature block present |
| 9: Generate Footer | Case + Template | OOXML fragment | page numbering configured |
| 10: Merge Document | All fragments | Final DOCX | document opens in Word |

**Ingest Pipeline (Runbook 9):**

| Phase | Input | Output | Key Invariants |
|-------|-------|--------|----------------|
| 0: Extract | DOCX file | Raw XML + text | valid DOCX structure |
| 1: Identify Zones | Raw content | Zones (caseblock, body, signature) | body zone identified |
| 2: Parse Case Block | Caseblock zone | CaseData suggestion | court and parties extracted |
| 3: Parse Sections | Body zone | Section hierarchy | section levels consistent |
| 4: Parse Sentences | Sections | SentenceRegistry | sentence boundaries valid |
| 5: Detect Citations | Body content | Potential citations | patterns matched |
| 6: Extract Signature | Signature zone | Signature OOXML | signature present if zone found |
| 7: Normalize | All parsed data | IngestResult | required fields present |

### 20.5 Trace Storage

**Storage location:** Traces are stored alongside the draft that produced them.
```typescript
interface Draft {
  // ... existing fields ...

  // Traces (append-only)
  traces: {
    export_runs: PipelineRun[];  // Last N export pipeline runs
    ingest_run?: PipelineRun;    // The ingest that created this draft (if any)
  };
}

interface PipelineRun {
  pipeline_id: string;
  pipeline_type: 'export' | 'ingest';
  started_at: string;
  completed_at: string;
  success: boolean;
  events: PipelineEvent[];

  // Summary
  total_phases: number;
  phases_completed: number;
  first_failure?: {
    phase: string;
    invariant: string;
    details: string;
  };
}
```

**Retention:** Keep last 5 export runs per draft. Older traces are pruned on new export.

### 20.6 Invariant Definitions by Domain

**Sentence Invariants:**

| Invariant | Check |
|-----------|-------|
| `all_sentences_have_ids` | Every sentence in registry has non-empty `id` |
| `no_duplicate_sentence_ids` | All sentence IDs are unique |
| `sentence_ids_stable` | Re-parsing same content produces same IDs |
| `sentences_cover_body` | Concatenating all sentences reproduces body text |

**Citation Invariants:**

| Invariant | Check |
|-----------|-------|
| `all_citations_have_evidence_id` | Every CitationNode has `evidenceId` or is marked unlinked |
| `evidence_exists` | Every `evidenceId` references existing Evidence in case |
| `markers_unique_per_type` | No duplicate markers within same evidence type |
| `markers_sequential` | Markers follow document order (A before B before C) |

**Cross-Reference Invariants:**

| Invariant | Check |
|-----------|-------|
| `all_refs_have_targets` | Every CrossRefNode has `targetSectionId` |
| `targets_exist` | Every `targetSectionId` references existing section |
| `no_circular_refs` | No section references itself or creates cycles |

**Variable Invariants:**

| Invariant | Check |
|-----------|-------|
| `all_variables_resolved` | No `{{variable}}` patterns remain in output |
| `no_circular_dependencies` | Variable dependency graph is acyclic |
| `required_variables_present` | All variables used in template have values in case |

**Document Structure Invariants:**

| Invariant | Check |
|-----------|-------|
| `valid_docx_structure` | Output opens without error in python-docx |
| `styles_present` | All referenced styles exist in document |
| `sections_hierarchical` | No level-3 section without level-2 parent |

### 20.7 Failure Handling

When an invariant fails:

1. **Record the failure** in the PipelineEvent
2. **Continue or halt** based on severity:
   - `BLOCKING`: Pipeline stops, returns error to user
   - `WARNING`: Pipeline continues, user sees warning in UI
3. **Include diagnostics** in the failure details

**Severity classification:**

| Invariant Type | Default Severity |
|----------------|------------------|
| Document won't open | BLOCKING |
| Missing required field | BLOCKING |
| Unlinked citation | WARNING |
| Broken cross-reference | WARNING |
| Duplicate sentence ID | BLOCKING |

### 20.8 Trace Query Interface

For debugging, traces support these queries:
```typescript
interface TraceQueries {
  // Get the most recent export run for a draft
  getLatestExportRun(draftId: string): PipelineRun | null;

  // Get all failures across a pipeline run
  getFailures(pipelineId: string): InvariantResult[];

  // Compare two runs (what changed?)
  diffRuns(runA: string, runB: string): {
    phases_changed: string[];
    new_failures: InvariantResult[];
    resolved_failures: InvariantResult[];
  };

  // Get events for a specific phase
  getPhaseEvents(pipelineId: string, phase: string): PipelineEvent[];
}
```

### 20.9 UI Integration

**Export Preview modal** (Section 19.7.6) shows trace summary:
- Green checkmark if all invariants passed
- Amber warning icon with count if warnings present
- Red X with first failure if pipeline failed

**Evidence Map panel** (Section 19.7.8) uses citation invariants:
- "Unlinked Citations" count comes from `all_citations_have_evidence_id` failures
- "Broken References" count comes from `targets_exist` failures

**Toast notifications** (Section 19.6.5):
- WARNING invariant failures trigger `warning` toast
- BLOCKING failures trigger `error` toast with failure details

### 20.10 Implementation Notes

**Hash computation:**
- Use SHA-256 for `input_hash` and `output_hash`
- Hash the JSON-serialized form of the data
- For large data (DOCX files), hash the file bytes directly

**Performance:**
- Trace emission should add <50ms to pipeline execution
- Store traces in same localStorage as drafts (no separate storage)
- Prune old traces synchronously on new export (not async background job)

**Testing:**
- Each invariant should have unit tests with passing and failing cases
- Pipeline tests should verify correct events are emitted
- Runbook 15 includes trace verification in integration tests


## 22. Deployment Models

### 21.1 Overview

FACTSWAY supports four deployment models using the same service codebase:

| Model | Target | Orchestration | Frontend | Database | Privacy |
|-------|--------|---------------|----------|----------|---------|
| Desktop | Solo lawyers | Child processes | Electron | SQLite (local) | Full (local processing) |
| Web Trial | Freemium leads | Kubernetes/Docker | Browser SPA | PostgreSQL (cloud) | None (warning displayed) |
| Mobile | Pro se intake | Kubernetes/Docker | React Native | PostgreSQL (cloud) | Limited (pre-representation) |
| Enterprise | Law firms | Kubernetes (on-premise) | Browser/Thin client | PostgreSQL (firm's) | Full (firm controls) |

### 21.2 Desktop Deployment (Primary)

**Target users:** Solo practitioners, small firms  
**Price point:** $50/month subscription

**Architecture:**
```
User downloads installer (FACTSWAY-1.0.0-mac.dmg)
    ↓
Installs to /Applications
    ↓
First launch:
  1. Electron starts
  2. Cleans up zombie processes from previous crashes (PID file)
  3. Spawns service executables as child processes
  4. Services bind to localhost:3001-3008
  5. Waits for health checks
  6. Saves new PIDs to file
  7. Opens main window
    ↓
Services run as normal OS processes
Frontend calls http://localhost:300X
All processing happens on user's computer
```

**Data storage:**
```
~/Library/Application Support/FACTSWAY/
├── factsway.db           # SQLite database
├── exhibits/             # Uploaded evidence files
├── logs/                 # Service logs
└── service-pids.json     # PID tracking for zombie cleanup
```

**Privacy guarantees:**
- ✅ Documents never leave user's computer
- ✅ Attorney-client privilege maintained
- ✅ Works offline (no internet required after installation)
- ✅ User controls all data

**Zombie process prevention:**

The `service-pids.json` file tracks all running service PIDs:

```json
{
  "records-service": 12345,
  "ingestion-service": 12346,
  "export-service": 12347,
  "caseblock-service": 12348,
  "signature-service": 12349,
  "facts-service": 12350,
  "exhibits-service": 12351,
  "caselaw-service": 12352
}
```

On launch, orchestrator:
1. Reads this file
2. Kills all listed PIDs (using tree-kill to get subprocesses)
3. Deletes file
4. Starts fresh services
5. Writes new PIDs

This prevents "Port 3001 already in use" errors after crashes.

**Updates:**
- Electron auto-updater checks for new versions
- Downloads new service executables
- Restarts services with new binaries
- Database migrations run automatically

---

### 21.3 Cloud Deployment (Web Trial + Mobile)

**Target users:** Trial users, pro se litigants  
**Price point:** Free (rate-limited trial), $10/month (mobile premium)

**Architecture:**
```
AWS/GCP Infrastructure
├── Kubernetes Cluster
│   ├── records-service (3 replicas)
│   ├── ingestion-service (5 replicas - scales with load)
│   ├── export-service (3 replicas)
│   ├── caseblock-service (2 replicas)
│   ├── signature-service (2 replicas)
│   ├── facts-service (2 replicas)
│   ├── exhibits-service (2 replicas)
│   └── caselaw-service (2 replicas)
├── PostgreSQL (RDS/Cloud SQL)
├── Redis (ElastiCache/Memorystore)
├── S3/Cloud Storage (evidence uploads)
└── Load Balancer (nginx ingress)
```

**Service deployment:**
```yaml
# ingestion-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ingestion-service
  namespace: factsway
spec:
  replicas: 5
  selector:
    matchLabels:
      app: ingestion-service
  template:
    metadata:
      labels:
        app: ingestion-service
    spec:
      containers:
      - name: ingestion-service
        image: factsway/ingestion-service:1.0.0
        ports:
        - containerPort: 3002
        env:
        - name: PORT
          value: "3002"
        - name: RECORDS_SERVICE_URL
          value: "http://records-service:3001"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: factsway-secrets
              key: database-url
        - name: MODE
          value: "cloud"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3002
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3002
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: ingestion-service
  namespace: factsway
spec:
  selector:
    app: ingestion-service
  ports:
  - protocol: TCP
    port: 3002
    targetPort: 3002
  type: ClusterIP
```

**Service discovery in cloud:**

Services use Kubernetes DNS:
```bash
# Environment injected by Kubernetes
RECORDS_SERVICE_URL=http://records-service:3001
INGESTION_SERVICE_URL=http://ingestion-service:3002
EXPORT_SERVICE_URL=http://export-service:3003
```

Service code:
```python
# Same code as desktop, different env vars
import os

RECORDS_URL = os.getenv('RECORDS_SERVICE_URL', 'http://localhost:3001')

async def get_case(case_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(f'{RECORDS_URL}/api/cases/{case_id}')
        return response.json()
```

**Rate limiting (web trial):**
```typescript
// Trial-specific middleware
import rateLimit from 'express-rate-limit';

if (process.env.MODE === 'trial') {
  app.use('/trial/*', rateLimit({
    windowMs: 24 * 60 * 60 * 1000,  // 24 hours
    max: 3,  // 3 requests per window
    keyGenerator: (req) => req.ip,
    handler: (req, res) => {
      res.status(429).json({
        error: 'trial_limit_exceeded',
        message: 'Free trial limited to 3 uploads per day.',
        downloadUrl: 'https://factsway.com/download'
      });
    }
  }));
}
```

---

### 21.4 Enterprise Deployment (On-Premise)

**Target users:** Law firms (10+ lawyers)  
**Price point:** $5,000-50,000/year + implementation

**Architecture:**
```
Law Firm's Private Cloud (AWS/Azure account)
├── Kubernetes Cluster (firm controls)
│   ├── FACTSWAY Services (all 8)
│   ├── PostgreSQL Database (firm's data)
│   ├── Redis Cache
│   └── Nginx Ingress
├── S3/Blob Storage (exhibits, exports)
└── Firm's SSO (Okta, Azure AD)

Lawyers access via:
├── Web browser: https://factsway.firm.com
└── Optional: Thin Electron client
```

**SSO integration:**
```typescript
// Enterprise mode uses firm's SSO
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const client = jwksClient({
  jwksUri: process.env.SSO_JWKS_URI
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

app.use('/api/*', async (req, res, next) => {
  if (process.env.MODE === 'enterprise') {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    jwt.verify(token, getKey, {
      audience: process.env.SSO_AUDIENCE,
      issuer: process.env.SSO_ISSUER
    }, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid token' });
      }
      
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        firm_id: process.env.FIRM_ID
      };
      
      next();
    });
  } else {
    next();
  }
});
```

**Multi-tenancy:**
```typescript
// All queries scoped to firm
router.get('/api/cases', async (req, res) => {
  const cases = await db.query(`
    SELECT * FROM cases 
    WHERE firm_id = $1 
    AND deleted_at IS NULL
    ORDER BY created_at DESC
  `, [req.user.firm_id]);
  
  res.json(cases);
});
```

---

## NEW SECTION 22: Service Discovery & Configuration

**Insert after Section 21:**

## 23. Service Discovery & Configuration

### 22.1 Overview

Services must communicate with each other regardless of deployment environment. This requires environment-specific service discovery.

**The problem:**
- Desktop: Services at `localhost:300X`
- Cloud: Services at `service-name:300X` (Kubernetes DNS)
- Enterprise: Services at custom DNS names

**The solution:** Environment variable injection

### 22.2 Configuration Strategy

**Every service dependency is an environment variable:**

```bash
# Desktop (injected by Electron orchestrator)
RECORDS_SERVICE_URL=http://localhost:3001
INGESTION_SERVICE_URL=http://localhost:3002
EXPORT_SERVICE_URL=http://localhost:3003
CASEBLOCK_SERVICE_URL=http://localhost:3004
SIGNATURE_SERVICE_URL=http://localhost:3005
FACTS_SERVICE_URL=http://localhost:3006
EXHIBITS_SERVICE_URL=http://localhost:3007
CASELAW_SERVICE_URL=http://localhost:3008

# Cloud (injected by Kubernetes)
RECORDS_SERVICE_URL=http://records-service:3001
INGESTION_SERVICE_URL=http://ingestion-service:3002
EXPORT_SERVICE_URL=http://export-service:3003
CASEBLOCK_SERVICE_URL=http://caseblock-service:3004
SIGNATURE_SERVICE_URL=http://signature-service:3005
FACTS_SERVICE_URL=http://facts-service:3006
EXHIBITS_SERVICE_URL=http://exhibits-service:3007
CASELAW_SERVICE_URL=http://caselaw-service:3008
```

### 22.3 Service Code Pattern

**TypeScript services:**
```typescript
// config.ts
export const config = {
  port: parseInt(process.env.PORT || '3001'),
  
  // Service dependencies
  services: {
    records: process.env.RECORDS_SERVICE_URL || 'http://localhost:3001',
    ingestion: process.env.INGESTION_SERVICE_URL || 'http://localhost:3002',
    export: process.env.EXPORT_SERVICE_URL || 'http://localhost:3003',
    caseblock: process.env.CASEBLOCK_SERVICE_URL || 'http://localhost:3004',
    signature: process.env.SIGNATURE_SERVICE_URL || 'http://localhost:3005',
    facts: process.env.FACTS_SERVICE_URL || 'http://localhost:3006',
    exhibits: process.env.EXHIBITS_SERVICE_URL || 'http://localhost:3007',
    caselaw: process.env.CASELAW_SERVICE_URL || 'http://localhost:3008'
  },
  
  // Database
  database: {
    url: process.env.DATABASE_URL || 
         `sqlite:///${process.env.DB_PATH || './factsway.db'}`
  },
  
  // Mode
  mode: process.env.MODE || 'development'
};

// Usage in service
import axios from 'axios';
import { config } from './config';

export async function getCase(caseId: string) {
  const response = await axios.get(
    `${config.services.records}/api/cases/${caseId}`
  );
  return response.data;
}
```

**Python services:**
```python
# config.py
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    port: int = int(os.getenv('PORT', '3002'))
    
    # Service dependencies
    records_service_url: str = os.getenv(
        'RECORDS_SERVICE_URL', 
        'http://localhost:3001'
    )
    export_service_url: str = os.getenv(
        'EXPORT_SERVICE_URL',
        'http://localhost:3003'
    )
    
    # Database
    database_url: str = os.getenv(
        'DATABASE_URL',
        f"sqlite:///{os.getenv('DB_PATH', './factsway.db')}"
    )
    
    # Mode
    mode: str = os.getenv('MODE', 'development')
    
    class Config:
        env_file = '.env'

settings = Settings()

# Usage in service
import httpx

async def get_case(case_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f'{settings.records_service_url}/api/cases/{case_id}'
        )
        return response.json()
```

### 22.4 Orchestrator Injection (Desktop)

**Electron orchestrator sets all env vars:**

```typescript
// orchestrator.ts
function getServiceEnv(service: ServiceConfig): Record<string, string> {
  // Base environment for all services
  const baseEnv = {
    PORT: service.port.toString(),
    DB_PATH: path.join(app.getPath('userData'), 'factsway.db'),
    LOG_LEVEL: 'info',
    MODE: 'desktop'
  };
  
  // Service discovery URLs (all localhost)
  const serviceUrls = {
    RECORDS_SERVICE_URL: 'http://localhost:3001',
    INGESTION_SERVICE_URL: 'http://localhost:3002',
    EXPORT_SERVICE_URL: 'http://localhost:3003',
    CASEBLOCK_SERVICE_URL: 'http://localhost:3004',
    SIGNATURE_SERVICE_URL: 'http://localhost:3005',
    FACTS_SERVICE_URL: 'http://localhost:3006',
    EXHIBITS_SERVICE_URL: 'http://localhost:3007',
    CASELAW_SERVICE_URL: 'http://localhost:3008'
  };
  
  // Service-specific overrides
  const serviceSpecificEnv = service.env || {};
  
  return {
    ...baseEnv,
    ...serviceUrls,
    ...serviceSpecificEnv
  };
}

// When spawning process
const proc = spawn(service.executable, service.args, {
  env: getServiceEnv(service),
  cwd: app.getPath('userData')
});
```

### 22.5 Kubernetes Injection (Cloud)

**ConfigMap for service URLs:**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: service-urls
  namespace: factsway
data:
  RECORDS_SERVICE_URL: "http://records-service:3001"
  INGESTION_SERVICE_URL: "http://ingestion-service:3002"
  EXPORT_SERVICE_URL: "http://export-service:3003"
  CASEBLOCK_SERVICE_URL: "http://caseblock-service:3004"
  SIGNATURE_SERVICE_URL: "http://signature-service:3005"
  FACTS_SERVICE_URL: "http://facts-service:3006"
  EXHIBITS_SERVICE_URL: "http://exhibits-service:3007"
  CASELAW_SERVICE_URL: "http://caselaw-service:3008"
```

**Deployment references ConfigMap:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ingestion-service
spec:
  template:
    spec:
      containers:
      - name: ingestion-service
        image: factsway/ingestion-service:1.0.0
        envFrom:
        - configMapRef:
            name: service-urls
        env:
        - name: PORT
          value: "3002"
        - name: MODE
          value: "cloud"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: factsway-secrets
              key: database-url
```

### 22.6 Validation

**Health check validates configuration:**

```typescript
// Every service includes config validation in health check
app.get('/health', async (req, res) => {
  const health = {
    service: 'ingestion-service',
    version: '1.0.0',
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    config: {
      port: config.port,
      mode: config.mode,
      dependencies: {}
    }
  };
  
  // Test connections to dependencies
  try {
    const recordsHealth = await axios.get(
      `${config.services.records}/health`,
      { timeout: 2000 }
    );
    health.config.dependencies.records = 'reachable';
  } catch (err) {
    health.config.dependencies.records = 'unreachable';
    health.status = 'degraded';
  }
  
  res.json(health);
});
```

**Example health response:**
```json
{
  "service": "ingestion-service",
  "version": "1.0.0",
  "status": "healthy",
  "uptime": 3600,
  "timestamp": "2024-12-24T12:00:00Z",
  "config": {
    "port": 3002,
    "mode": "desktop",
    "dependencies": {
      "records": "reachable"
    }
  }
}
```

---

## NEW SECTION 23: Freemium Strategy

**Insert after Section 22:**

## 24. Freemium Conversion Strategy

### 23.1 Conversion Funnel

```
Website Visitor (1,000)
    ↓ (25% try upload)
Trial User (250)
    ↓ (60% create account)
Activated User (150)
    ↓ (20% download desktop)
Desktop Trial (30)
    ↓ (40% convert to paid)
Paying Customer (12)
```

**Metrics:**
- Visitor → Trial: 25% (industry benchmark: 15-30%)
- Trial → Account: 60% (benchmark: 50-70%)
- Account → Desktop: 20% (benchmark: 10-25%)
- Desktop → Paid: 40% (benchmark: 30-50%)
- Overall conversion: 1.2% (benchmark: 0.5-2%)

### 23.2 Trial Feature Set

**Free tier (web trial):**
```
Included:
✅ Upload motion.docx (3 per day)
✅ Auto-extract case block
✅ Auto-extract signature block
✅ Reformat to court style (TX, CA, Federal)
✅ Export case block to Excel
✅ Preview appendix structure
✅ Download reformatted motion

Limitations (drive conversion):
⚠️ Cloud processing (privacy warning)
⚠️ 3 uploads per day maximum
⚠️ Watermark on exports
❌ No evidence linking
❌ No drafting from scratch
❌ No template library
❌ No multi-case management
❌ No offline work
```

**Paid tier (desktop app):**
```
Everything in free, plus:
✅ Unlimited uploads
✅ Full privacy (local processing)
✅ Evidence linking (drag-and-drop)
✅ Draft from scratch
✅ Template library (50+ templates)
✅ Multi-case management
✅ Offline capability
✅ No watermarks
✅ Priority support
✅ Future: Collaboration features
```

### 23.3 Implementation

**Web trial service modifications:**

```typescript
// trial-middleware.ts
export function trialMode(req, res, next) {
  if (process.env.MODE !== 'trial') {
    return next();
  }
  
  // Add watermark to exports
  req.addWatermark = true;
  req.watermarkText = 'Created with FACTSWAY Trial - factsway.com';
  
  // Limit features
  req.featuresEnabled = {
    evidenceLinking: false,
    templateLibrary: false,
    draftFromScratch: false
  };
  
  next();
}

// Export service adds watermark
app.post('/api/export', trialMode, async (req, res) => {
  const document = await generateDocument(req.body);
  
  if (req.addWatermark) {
    addFooterWatermark(document, req.watermarkText);
  }
  
  res.send(document);
});
```

---

## Summary of Changes

### Files Modified
1. ✅ Section 1.7: Added deployment architecture explanation
2. ✅ Section 10: Clarified API endpoints + service discovery
3. ✅ Section 15: Complete revision - child process orchestration (NOT Docker)
4. ✅ Section 16: Complete file structure revision (monorepo)
5. ✅ NEW Section 21: Deployment models (processes vs containers)
6. ✅ NEW Section 22: Service discovery via environment variables
7. ✅ NEW Section 23: Freemium strategy

### Critical Production Safeguards Added

1. ✅ **Zombie process prevention** (PID tracking, tree-kill)
2. ✅ **Environment-based service discovery** (localhost vs k8s DNS)
3. ✅ **Health check orchestration** (wait for all services)
4. ✅ **Automatic crash recovery** (service restart on exit)
5. ✅ **Graceful shutdown** (SIGTERM before SIGKILL)

### Files Unchanged

- Sections 2-9: Data architecture (Template, Case, Draft, etc.) ✅
- Section 11: UI/UX specifications ✅
- Section 12: Persistence & Storage ✅
- Section 13: Export pipeline ✅
- Section 15: Preview system ✅
- Section 18: Pre-built Texas template ✅
- Section 19: Verification checklist ✅
- Section 20: Design system ✅
- Section 21: Execution tracing ✅
- Appendices A-C ✅

---

## Next Steps

1. **Apply Edit 53** (naming consistency: `sentence_ids` → `supportsSentenceIds`)
2. **Apply Edits 54A-D** (architecture updates from this document)
3. **Final review** of complete Runbook 0
4. **Begin Runbook 1** (Reference document creation in Word)

---

## Validation Checklist

Before finalizing these changes:

- [ ] Edit 53 applied (naming consistency)
- [ ] Section 1.7 added (deployment architecture)
- [ ] Section 10 updated (service discovery added)
- [ ] Section 15 replaced (child process orchestration, NOT Docker)
- [ ] Section 16 replaced (monorepo structure)
- [ ] Section 21 added (deployment models)
- [ ] Section 22 added (service discovery)
- [ ] Section 23 added (freemium strategy)
- [ ] Table of Contents updated with new sections
- [ ] Cross-references verified (all section references still correct)
- [ ] No Docker dependency for desktop deployment
- [ ] PID management implemented
- [ ] Environment variables for all service URLs
- [ ] One-shot philosophy maintained (complete before build)

---

**End of Final Update Document**

This update transforms Runbook 0 from an Electron monolith specification to a production-ready microservices platform with:

✅ **Logical microservices** (strict REST contracts)  
✅ **Environment-appropriate orchestration** (child processes on desktop, containers in cloud)  
✅ **Production safeguards** (zombie cleanup, service discovery, crash recovery)  
✅ **Multiple deployment targets** (desktop, web trial, mobile, enterprise)  
✅ **Same codebase everywhere** (write once, deploy anywhere)

**No Docker requirement for end users. No zombie processes. No port conflicts.**

This is production-ready.

---

## Appendix A: OOXML Injection Code Pattern

```python
from lxml import etree
from docx import Document
from docx.oxml.ns import qn

def inject_ooxml_block(docx_path: str, ooxml_string: str, output_path: str):
    """
    Inject raw OOXML content at the end of a document.
    
    Args:
        docx_path: Path to source .docx
        ooxml_string: Raw OOXML (w:p elements) to inject
        output_path: Path for modified .docx
    """
    doc = Document(docx_path)
    body = doc.element.body
    
    # Parse the OOXML string
    ooxml_elements = etree.fromstring(f"<root xmlns:w='http://schemas.openxmlformats.org/wordprocessingml/2006/main'>{ooxml_string}</root>")
    
    # Append each paragraph element
    for elem in ooxml_elements:
        body.append(elem)
    
    doc.save(output_path)
```

---

## Appendix B: LLM Integration Pattern

```python
from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def detect_body_start(document_text: str) -> int:
    """
    Use LLM to detect where the motion body begins.
    
    Returns:
        Line number where substantive content starts
    """
    # Add line numbers
    lines = document_text.split('\n')
    numbered = '\n'.join(f"{i+1}: {line}" for i, line in enumerate(lines))
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": """You are parsing a legal document. Identify the FIRST line number where the document transitions from procedural introduction to substantive legal argument.

Procedural content includes: court identification, case caption, document title, salutation, filing party identification.

Substantive content includes: factual background, legal argument, any section starting with Roman numerals or "INTRODUCTION".

Return ONLY the line number as an integer."""
            },
            {
                "role": "user", 
                "content": numbered[:15000]  # Truncate to avoid token limits
            }
        ],
        temperature=0
    )
    
    return int(response.choices[0].message.content.strip())
```

---

## Appendix C: Sample Test Documents

These sample documents provide exact content for testing the entire pipeline. Use them to verify parsing, editing, and export functionality.

### C.1 Sample Motion Content (sample_motion.docx)

Create a Word document with the following exact content. This tests all parsing and formatting capabilities.
                IN THE DISTRICT COURT OF BEXAR COUNTY, TEXAS

                          73RD JUDICIAL DISTRICT
JOHN DOE,                                    §
Plaintiff,                              §
§
v.                                           §      CAUSE NO. 2022-CI-08479
§
ACME CORPORATION and                         §
JANE SMITH,                                  §
Defendants.                             §
                DEFENDANT'S MOTION TO COMPEL DISCOVERY
TO THE HONORABLE JUDGE OF SAID COURT:
 NOW COMES ACME Corporation ("Defendant"), by and through its undersigned
counsel, and files this Motion to Compel Discovery, and in support thereof, would
show the Court as follows:
                            I. INTRODUCTION

 This motion addresses Plaintiff's failure to respond to properly served
discovery requests. Despite multiple extensions and good-faith efforts to resolve
this dispute, Plaintiff has failed to provide complete responses.
                        II. FACTUAL BACKGROUND

 A.  The Discovery Requests

 On September 15, 2024, Defendant served its First Set of Interrogatories and
First Request for Production of Documents on Plaintiff. These requests sought
information directly relevant to Plaintiff's claims, including:
      1.  Documents supporting Plaintiff's alleged damages;

      2.  Communications between Plaintiff and third parties regarding the

          subject matter of this lawsuit; and

      3.  Financial records demonstrating the claimed losses.

 B.  Plaintiff's Inadequate Responses

 Plaintiff served responses on October 20, 2024. However, these responses were
materially deficient:
           The Texas Supreme Court has held that "discovery responses must be
           complete and responsive to the requests as written." In re Smith,
           123 S.W.3d 456, 460 (Tex. 2024).

 Plaintiff's objections were boilerplate and non-specific, failing to identify
which documents were being withheld or why.
                     III. ARGUMENT AND AUTHORITIES

 A.  The Discovery Rules Require Complete Responses

 Texas Rule of Civil Procedure 196.1 requires that responses to discovery be
complete.¹ A party may not simply object without providing responsive information
where it exists.
 B.  Plaintiff's Objections Lack Merit

      1.  The "overly broad" objection fails because the requests are tailored

          to the specific claims in this case.

      2.  The "unduly burdensome" objection fails because Plaintiff has not

          demonstrated any actual burden.

                           IV. CONCLUSION

 For the foregoing reasons, Defendant respectfully requests that this Court
grant this Motion to Compel and order Plaintiff to provide complete discovery
responses within ten (10) days.
                                         Respectfully submitted,

                                         /s/ Sarah Johnson
                                         Sarah Johnson
                                         State Bar No. 24098765
                                         JOHNSON & ASSOCIATES, PLLC
                                         100 Main Street, Suite 500
                                         San Antonio, Texas 78205
                                         Telephone: (210) 555-1234
                                         Facsimile: (210) 555-1235
                                         Email: sjohnson@johnsonlaw.com

                                         ATTORNEY FOR DEFENDANT
                                         ACME CORPORATION


                        CERTIFICATE OF SERVICE

 I certify that on November 15, 2024, a true and correct copy of the foregoing
document was served on all counsel of record via the Court's electronic filing
system:
 Robert Williams
 WILLIAMS LAW FIRM
 200 Commerce Street
 San Antonio, Texas 78205
 rwilliams@williamslaw.com
 Attorney for Plaintiff

                                         /s/ Sarah Johnson
                                         Sarah Johnson

¹ See also TEX. R. CIV. P. 193.2 (requiring specific objections).

### C.2 Expected Parse Output (expected_parse.json)

When sample_motion.docx is processed through the /ingest endpoint, the response should match this structure:
```json
{
  "success": true,
  "parsed": {
    "case_block": {
      "court_line": "IN THE DISTRICT COURT OF BEXAR COUNTY, TEXAS",
      "judicial_district": "73RD JUDICIAL DISTRICT",
      "cause_number": "2022-CI-08479",
      "party_block_raw": "JOHN DOE,\n     Plaintiff,\n\nv.\n\nACME CORPORATION and\nJANE SMITH,\n     Defendants.",
      "motion_title": "DEFENDANT'S MOTION TO COMPEL DISCOVERY",
      "salutation": "TO THE HONORABLE JUDGE OF SAID COURT:\n\n     NOW COMES ACME Corporation (\"Defendant\"), by and through its undersigned counsel, and files this Motion to Compel Discovery, and in support thereof, would show the Court as follows:"
    },
    "suggested_case_data": {
      "court": {
        "court_type": "DISTRICT",
        "county": "BEXAR",
        "state": "TEXAS",
        "district_number": "73RD"
      },
      "cause_number": "2022-CI-08479",
      "party_groups": [
        {
          "group_id": "primary",
          "plaintiffs": [
            { "name": "JOHN DOE" }
          ],
          "defendants": [
            { "name": "ACME CORPORATION" },
            { "name": "JANE SMITH" }
          ]
        }
      ]
    },
    "body_start_line": 28,
    "body_end_line": 85,
    "body_sections": [
      {
        "level": 1,
        "title": "INTRODUCTION",
        "number": "I"
      },
      {
        "level": 1,
        "title": "FACTUAL BACKGROUND",
        "number": "II",
        "children": [
          {
            "level": 2,
            "title": "The Discovery Requests",
            "number": "A"
          },
          {
            "level": 2,
            "title": "Plaintiff's Inadequate Responses",
            "number": "B"
          }
        ]
      },
      {
        "level": 1,
        "title": "ARGUMENT AND AUTHORITIES",
        "number": "III",
        "children": [
          {
            "level": 2,
            "title": "The Discovery Rules Require Complete Responses",
            "number": "A"
          },
          {
            "level": 2,
            "title": "Plaintiff's Objections Lack Merit",
            "number": "B",
            "children": [
              { "level": 3, "number": "1" },
              { "level": 3, "number": "2" }
            ]
          }
        ]
      },
      {
        "level": 1,
        "title": "CONCLUSION",
        "number": "IV"
      }
    ],
    "signature_start_line": 87,
    "certificate_start_line": 103
  }
}
```

### C.3 Sample Signature Block (sample_signature.docx)

Create a separate document containing only a signature block for testing signature capture:
                                         Respectfully submitted,

                                         CRUZ LAW FIRM, PLLC

                                         /s/ Alex Cruz
                                         Alex Cruz
                                         State Bar No. 12345678
                                         123 Main Street, Suite 100
                                         San Antonio, Texas 78205
                                         Telephone: (210) 555-9876
                                         Facsimile: (210) 555-9877
                                         Email: alex@cruzlawfirm.com

                                         ATTORNEY FOR DEFENDANT

### C.4 Formatting Test Cases

The sample motion above includes these formatting elements that must be preserved through the pipeline:

| Element | Location in Sample | Expected Behavior |
|---------|-------------------|-------------------|
| Section heading (Roman) | "I. INTRODUCTION" | Centered, bold, caps |
| Subsection heading (Alpha) | "A. The Discovery Requests" | Left, bold |
| Numbered points | "1. Documents supporting..." | Left, bold, indented |
| Block quote | "The Texas Supreme Court..." | Indented 1" both sides, single-spaced |
| Footnote | "¹ See also TEX. R. CIV. P..." | Superscript reference, footnote at bottom |
| Multiple defendants | "ACME CORPORATION and JANE SMITH" | Parsed as two separate defendants |
| § column alignment | Party block | Right-aligned § column in output |

### C.5 Verification Checklist for Sample Document

After processing sample_motion.docx through the full pipeline:

**Parsing Verification:**
- [ ] Court identified as "DISTRICT COURT OF BEXAR COUNTY, TEXAS"
- [ ] Judicial district identified as "73RD"
- [ ] Cause number extracted as "2022-CI-08479"
- [ ] Both defendants captured (ACME CORPORATION and JANE SMITH)
- [ ] Motion title extracted correctly
- [ ] Body start detected at "I. INTRODUCTION"
- [ ] All 4 main sections identified with correct Roman numerals
- [ ] Subsections A, B identified under sections II and III
- [ ] Numbered points 1, 2 identified under section III.B
- [ ] Footnote detected
- [ ] Block quote detected
- [ ] Signature block start identified
- [ ] Certificate of service start identified

**Export Verification:**
- [ ] Case block renders with § column alignment
- [ ] Motion title is centered, bold, caps
- [ ] Section headings use correct Roman numerals
- [ ] Subsections use correct letters
- [ ] Body text is double-spaced
- [ ] Block quote is single-spaced and indented
- [ ] Footnote appears at page bottom with correct reference
- [ ] Signature block preserves right-alignment
- [ ] Certificate of service is included
- [ ] Page numbers appear in footer
- [ ] Motion title appears in footer left
- [ ] Font is Times New Roman throughout
- [ ] Margins are 1" on all sides

---

**END OF RUNBOOK 0: CONTRACT DEFINITION**

*This document is the authoritative specification. All implementation must conform to these contracts.*
