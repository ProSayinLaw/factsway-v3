# Backend Architecture Diagrams

**Purpose:** Visual representations of current vs target architecture

---

## Current Architecture (Before)

```mermaid
graph TB
    subgraph "Electron App"
        UI[UI - React/Vue]
        IPC[IPC Bridge]
        Main[Main Process]
        API[Express API]
        DB[(SQLite Database)]
    end

    subgraph "Python Pipeline"
        PyAPI[FastAPI Server]
        Pipeline[Ingestion Pipeline]
        LXML[LXML Parser]
        NLP[NLP Services]
    end

    UI -->|invokeChannel| IPC
    IPC --> Main
    Main --> API
    API --> DB
    Main -->|HTTP| PyAPI
    PyAPI --> Pipeline
    Pipeline --> LXML
    Pipeline --> NLP

    style PyAPI fill:#f9f,stroke:#333,stroke-width:2px
    style Pipeline fill:#f9f,stroke:#333,stroke-width:2px
```

**Problems:**
- ❌ Python as separate HTTP service (overhead)
- ❌ Monolithic pipeline (can't scale parts independently)
- ❌ No service isolation
- ❌ Single deployment model only

---

## Target Architecture (After - Desktop)

```mermaid
graph TB
    subgraph "Electron Shell"
        UI[UI - React/Vue]
        IPC[IPC Bridge]
        Orch[Desktop Orchestrator]
        API[Express API Routes]
        DB[(SQLite)]
    end

    subgraph "Child Process Services"
        Records[records-service<br/>:3001]
        Ingest[ingestion-service<br/>:3002]
        Export[export-service<br/>:3003]
        CaseB[caseblock-service<br/>:3004]
        Sig[signature-service<br/>:3005]
        Facts[facts-service<br/>:3006]
        Exhibits[exhibits-service<br/>:3007]
        Caselaw[caselaw-service<br/>:3008]
    end

    UI -->|IPC| IPC
    IPC --> API
    Orch -->|spawn| Records
    Orch -->|spawn| Ingest
    Orch -->|spawn| Export
    Orch -->|spawn| CaseB
    Orch -->|spawn| Sig
    Orch -->|spawn| Facts
    Orch -->|spawn| Exhibits
    Orch -->|spawn| Caselaw

    API -->|http://localhost:3001| Records
    API -->|http://localhost:3002| Ingest
    API -->|http://localhost:3003| Export

    Records --> DB

    Orch -.PID tracking.-> Records
    Orch -.health checks.-> Ingest
    Orch -.auto-restart.-> Export

    style Orch fill:#90EE90,stroke:#333,stroke-width:3px
    style Records fill:#87CEEB,stroke:#333,stroke-width:2px
    style Ingest fill:#87CEEB,stroke:#333,stroke-width:2px
    style Export fill:#87CEEB,stroke:#333,stroke-width:2px
```

**Benefits:**
- ✅ Services as child processes (no Docker on desktop)
- ✅ Independent scaling in cloud
- ✅ PID management prevents zombies
- ✅ Health checks + auto-restart
- ✅ Service discovery via environment variables

---

## Service Communication Flow

```mermaid
sequenceDiagram
    participant UI as UI (Frontend)
    participant API as API Routes
    participant Records as Records Service
    participant Ingest as Ingestion Service
    participant Export as Export Service
    participant DB as Database

    UI->>API: POST /api/cases/123/import (DOCX file)
    API->>Ingest: POST http://localhost:3002/api/ingest
    Ingest->>Ingest: Parse DOCX → LegalDocument
    Ingest-->>API: {parsed: LegalDocument}
    API->>Records: POST http://localhost:3001/api/drafts
    Records->>DB: INSERT INTO drafts
    DB-->>Records: draft_id
    Records-->>API: {id: draft_id}
    API-->>UI: {draftId: draft_id}

    Note over UI,DB: Later: Export

    UI->>API: POST /api/cases/123/filing/export
    API->>Records: GET http://localhost:3001/api/drafts/456
    Records->>DB: SELECT FROM drafts WHERE id=456
    DB-->>Records: LegalDocument JSON
    Records-->>API: {legalDocument}
    API->>Export: POST http://localhost:3003/api/export
    Export->>Export: LegalDocument → DOCX
    Export-->>API: {buffer: base64}
    API-->>UI: Download DOCX
```

