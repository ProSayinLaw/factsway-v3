---

## Metadata Summary

### Purpose
Create 4 specialized microservices (CaseBlock, Signature, Facts, Exhibits) providing domain-specific functionality for legal document processing, with ClerkGuard security integration. These services implement the core "clerk" functionality from the domain model.

### Produces (Artifacts)

**Services (4 total):**

1. **CaseBlock Service** (port 3004)
   - Language: Python/FastAPI
   - Purpose: Case caption extraction and formatting
   - Clerk Identity: `CaseBlockClerk`

2. **Signature Service** (port 3005)
   - Language: Python/FastAPI
   - Purpose: Signature block extraction and formatting
   - Clerk Identity: `SignatureBlockClerk`

3. **Facts Service** (port 3006)
   - Language: Python/FastAPI
   - Purpose: Claims management (AlphaFacts model), NOT vault-dependent
   - Clerk Identity: `FactsClerk`

4. **Exhibits Service** (port 3007)
   - Language: Python/FastAPI
   - Purpose: Claim-to-document linking, exhibit appendix management
   - Clerk Identity: `ExhibitsClerk`

**Total Lines:** ~3,500 lines across 4 services

---

## 1. CASEBLOCK SERVICE (Port 3004)

### Purpose
Extract and format case captions (plaintiff/defendant, court, cause number) from pleadings with template-based generation.

### Produces (Artifacts)

**Service:**
- Service: `caseblock-service` (port 3004)
  - Language: Python 3.11+
  - Framework: FastAPI
  - Key Libraries: python-docx, lxml

**Files:**
- File: `services/caseblock-service/main.py` (~150 lines)
- File: `services/caseblock-service/extractors/caption_extractor.py` (~200 lines)
- File: `services/caseblock-service/formatters/caption_formatter.py` (~200 lines)
- File: `services/caseblock-service/templates/caption_templates.py` (~150 lines)
- File: `services/caseblock-service/tests/test_caseblock.py` (~150 lines)

**Total:** ~850 lines

### Consumes (Prerequisites)

**Required Runbooks:**
- Runbook 1: LegalDocument types

**Required Environment:**
- `PORT`: 3004
- `SERVICE_NAME`: "caseblock"
- `CLERKGUARD_MODE`: "strict" | "passthrough"

**Required Dependencies:**
- `fastapi==0.108.0`
- `python-docx==1.1.0`
- `lxml==4.9.3`
- `ulid-py==1.1.0`

### Interfaces Touched

#### REST Endpoints (Server)

- **POST /templates** - Create caption template
- **GET /templates/:id** - Get template by ID
- **GET /templates** - List all templates
- **PUT /templates/:id** - Update template
- **DELETE /templates/:id** - Delete template
- **POST /templates/:id/approve** - Approve template for use
- **POST /extract** - Extract caption from document
- **POST /format** - Format caption for export
- **POST /detect-parties** - Detect parties in pleading
- **GET /health** - Health check

### ClerkGuard Integration

**Updated:** December 27, 2024
**Reference:** CLERKGUARD_CONTRACT.md
**Status:** ✅ Production architecture defined

#### Overview

CaseBlock Service integrates with ClerkGuard security validation layer to enforce architectural contracts at all API boundaries.

**Clerk Identity:** `CaseBlockClerk`

#### Channel Allowlist

```python
CASEBLOCK_SERVICE_ALLOWLIST = [
    # Template operations
    "caseblock:create-template",
    "caseblock:get-template",
    "caseblock:list-templates",
    "caseblock:update-template",
    "caseblock:delete-template",
    "caseblock:approve-template",

    # Extraction
    "caseblock:extract-from-document",
    "caseblock:detect-parties",

    # Formatting
    "caseblock:format-caption",
    "caseblock:generate-salutation",
]
```

#### ClerkGuard Configurations

```python
CASEBLOCK_CLERK = {
    "clerk": "CaseBlockClerk",
    "caseScope": "required",
    "operation": "read",
}

CLERKGUARD_CONFIGS = {
    "caseblock:create-template": {
        **CASEBLOCK_CLERK,
        "operation": "write",
        "composite": {
            "pathId": ["pathId"],  # case/{caseId}/templates
        }
    },

    "caseblock:get-template": {
        **CASEBLOCK_CLERK,
        "operation": "read",
        "composite": {
            "canonicalId": ["templateId"],
            "pathId": ["pathId"],
            "displayId": ["templateName"],
        }
    },

    "caseblock:extract-from-document": {
        **CASEBLOCK_CLERK,
        "operation": "read",
        "composite": {
            "canonicalId": ["documentId"],
            "pathId": ["pathId"],
        }
    },

    # ... (additional configs for all 10 channels)
}
```

#### ULID Requirements

| Resource | ID Field | Format |
|----------|----------|--------|
| Template | `templateId` | ULID |
| Caption | `captionId` | ULID |

#### Path Structure

```python
# Templates
build_path_id(case_id, "templates", template_id)  # case/{caseId}/templates/{templateId}

# Captions
build_path_id(case_id, "captions", caption_id)  # case/{caseId}/captions/{captionId}
```

### Invariants

- INVARIANT: Template approval required before production use
- INVARIANT: Caption extraction preserves original text (substring check)
- INVARIANT: Party detection extracts at least plaintiff and defendant

### Verification Gates

**Template CRUD Verification:**
- Command: `curl -X POST http://localhost:3004/templates -d @caption_template.json`
- Expected: 201 Created + Template with ULID

**Extraction Verification:**
- Test: Upload pleading with "John Doe v. Jane Smith"
- Expected: Extracts plaintiff="John Doe", defendant="Jane Smith"

### Risks

**Technical Risks:**
- Caption extraction may fail for non-standard formats
- Party detection accuracy varies by document type

---

## 2. SIGNATURE SERVICE (Port 3005)

### Purpose
Extract and format signature blocks (attorney name, bar number, firm) from pleadings with template-based generation.

### Produces (Artifacts)

**Service:**
- Service: `signature-service` (port 3005)
  - Language: Python 3.11+
  - Framework: FastAPI

**Files:**
- File: `services/signature-service/main.py` (~150 lines)
- File: `services/signature-service/extractors/signature_extractor.py` (~200 lines)
- File: `services/signature-service/formatters/signature_formatter.py` (~200 lines)
- File: `services/signature-service/templates/signature_templates.py` (~150 lines)
- File: `services/signature-service/tests/test_signature.py` (~150 lines)

**Total:** ~850 lines

### Consumes (Prerequisites)

**Required Runbooks:**
- Runbook 1: LegalDocument types

**Required Environment:**
- `PORT`: 3005
- `SERVICE_NAME`: "signature"
- `CLERKGUARD_MODE`: "strict" | "passthrough"

### ClerkGuard Integration

**Clerk Identity:** `SignatureBlockClerk`

#### Channel Allowlist

```python
SIGNATURE_SERVICE_ALLOWLIST = [
    # Template operations
    "signature:create-template",
    "signature:get-template",
    "signature:list-templates",
    "signature:update-template",
    "signature:delete-template",
    "signature:approve-template",

    # Extraction
    "signature:extract-from-document",
    "signature:detect-attorneys",

    # Formatting
    "signature:format-signature-block",
]
```

#### ClerkGuard Configurations

```python
SIGNATURE_CLERK = {
    "clerk": "SignatureBlockClerk",
    "caseScope": "required",
    "operation": "read",
}

CLERKGUARD_CONFIGS = {
    "signature:create-template": {
        **SIGNATURE_CLERK,
        "operation": "write",
        "composite": {
            "pathId": ["pathId"],
        }
    },

    "signature:get-template": {
        **SIGNATURE_CLERK,
        "operation": "read",
        "composite": {
            "canonicalId": ["templateId"],
            "pathId": ["pathId"],
            "displayId": ["attorneyName"],
        }
    },

    # ... (additional configs for all 9 channels)
}
```

#### ULID Requirements

| Resource | ID Field | Format |
|----------|----------|--------|
| Template | `templateId` | ULID |
| Attorney | `attorneyId` | ULID |

#### Path Structure

```python
# Templates
build_path_id(case_id, "signature-templates", template_id)
```

### Invariants

- INVARIANT: Template approval required before production use
- INVARIANT: Attorney detection extracts name and bar number
- INVARIANT: Signature block formatting matches Texas/Federal standards

---

## 3. FACTS SERVICE (Port 3006)

### Purpose
Manage claims (sentences in motion being drafted) using AlphaFacts model. NOT vault-dependent - operates on draft content only. Coordinates with Exhibits Service for evidence linking.

### Produces (Artifacts)

**Service:**
- Service: `facts-service` (port 3006)
  - Language: Python 3.11+
  - Framework: FastAPI
  - Key Libraries: anthropic (for claim analysis)

**Files:**
- File: `services/facts-service/main.py` (~200 lines)
- File: `services/facts-service/extractors/claim_extractor.py` (~300 lines)
- File: `services/facts-service/analyzers/claim_analyzer.py` (~250 lines)
- File: `services/facts-service/models/alphafacts.py` (~200 lines)
- File: `services/facts-service/tests/test_facts.py` (~200 lines)

**Total:** ~1,150 lines

### Consumes (Prerequisites)

**Required Runbooks:**
- Runbook 1: LegalDocument types

**Required Environment:**
- `PORT`: 3006
- `SERVICE_NAME`: "facts"
- `ANTHROPIC_API_KEY`: For claim analysis
- `CLERKGUARD_MODE`: "strict" | "passthrough"

### ClerkGuard Integration

**Clerk Identity:** `FactsClerk`

#### Channel Allowlist

```python
FACTS_SERVICE_ALLOWLIST = [
    # Claim/fact operations
    "facts:create",
    "facts:get",
    "facts:list",
    "facts:update",
    "facts:delete",

    # Evidence linking (coordinates with Exhibits Service)
    "facts:link-evidence",
    "facts:unlink-evidence",

    # Analysis
    "facts:analyze-claim",
    "facts:validate-support",

    # Extraction
    "facts:extract-from-draft",
    "facts:detect-sentences",
]
```

#### ClerkGuard Configurations

```python
FACTS_CLERK = {
    "clerk": "FactsClerk",
    "caseScope": "required",
    "operation": "read",
}

CLERKGUARD_CONFIGS = {
    "facts:create": {
        **FACTS_CLERK,
        "operation": "write",
        "composite": {
            "pathId": ["pathId"],  # case/{caseId}/facts
        }
    },

    "facts:get": {
        **FACTS_CLERK,
        "operation": "read",
        "composite": {
            "canonicalId": ["factId"],
            "pathId": ["pathId"],  # case/{caseId}/facts/{factId}
            "displayId": ["factNumber"],  # e.g., "Fact #42"
        }
    },

    "facts:link-evidence": {
        **FACTS_CLERK,
        "operation": "write",
        "composite": {
            "canonicalId": ["factId"],
            "pathId": ["pathId"],
        }
    },

    # ... (additional configs for all 10 channels)
}
```

#### ULID Requirements

| Resource | ID Field | Format |
|----------|----------|--------|
| Fact/Claim | `factId` | ULID |
| Sentence | `sentenceId` | ULID |
| Analysis | `analysisId` | ULID |

#### Path Structure

```python
# Facts
build_path_id(case_id, "facts")  # case/{caseId}/facts
build_path_id(case_id, "facts", fact_id)  # case/{caseId}/facts/{factId}

# Sentences (within fact)
build_path_id(case_id, "facts", fact_id, "sentences")  # case/{caseId}/facts/{factId}/sentences
```

### AlphaFacts Model

**Claim Structure:**
```python
{
    "fact_id": "01ARZ3NDEK...",  # ULID
    "sentence_ids": ["01BRZ4OEFK...", ...],  # Sentences in motion
    "claim_text": "Defendant breached the contract",
    "claim_type": "factual" | "legal" | "mixed",
    "analysis": {
        "analysis_id": "01CRZ5PGML...",
        "has_support": true | false,
        "linked_evidence_ids": [],  # From Exhibits Service
        "confidence_score": 0.85
    }
}
```

### Critical Architectural Rules

**NOT Vault-Dependent:**
- Facts Service operates on draft content (motion text) only
- Does NOT directly access vault documents
- Coordinates with Exhibits Service via Orchestrator for evidence linking

**Service Coordination:**
```
Facts Service: Manages claims (sentence_ids)
  ↓ (via Orchestrator)
Exhibits Service: Links claims to document_ids
  ↓ (via Orchestrator)
Records Service: Provides vault document bytes
```

### Invariants

- INVARIANT: Claims extracted from draft MUST have sentence_ids
- INVARIANT: Evidence linking goes through Orchestrator (no direct Exhibits calls)
- INVARIANT: Claim analysis preserves original sentence text (substring check)

---

## 4. EXHIBITS SERVICE (Port 3007)

### Purpose
Manage claim-to-document linking via ExhibitObject. Authoritative for associations between claims (sentence_ids from Facts Service) and documents (document_ids from vault). Generates exhibit appendix with dynamic labeling (A, B, C).

### Produces (Artifacts)

**Service:**
- Service: `exhibits-service` (port 3007)
  - Language: Python/FastAPI

**Files:**
- File: `services/exhibits-service/main.py` (~200 lines)
- File: `services/exhibits-service/models/exhibit_object.py` (~200 lines)
- File: `services/exhibits-service/appendix/appendix_generator.py` (~250 lines)
- File: `services/exhibits-service/appendix/label_manager.py` (~150 lines)
- File: `services/exhibits-service/tests/test_exhibits.py` (~200 lines)

**Total:** ~1,000 lines

### Consumes (Prerequisites)

**Required Runbooks:**
- Runbook 1: LegalDocument types
- Runbook 3: Records Service (for vault document_ids)
- Facts Service (for sentence_ids)

**Required Environment:**
- `PORT`: 3007
- `SERVICE_NAME`: "exhibits"
- `CLERKGUARD_MODE`: "strict" | "passthrough"

### ClerkGuard Integration

**Clerk Identity:** `ExhibitsClerk`

#### Channel Allowlist

```python
EXHIBITS_SERVICE_ALLOWLIST = [
    # Exhibit object operations
    "exhibits:create",
    "exhibits:get",
    "exhibits:list",
    "exhibits:update",
    "exhibits:delete",

    # Linking
    "exhibits:link-claim",
    "exhibits:unlink-claim",
    "exhibits:link-document",
    "exhibits:unlink-document",

    # Appendix generation
    "exhibits:get-appendix",
    "exhibits:organize-appendix",
    "exhibits:assign-labels",
]
```

#### ClerkGuard Configurations

```python
EXHIBITS_CLERK = {
    "clerk": "ExhibitsClerk",
    "caseScope": "required",
    "operation": "read",
}

CLERKGUARD_CONFIGS = {
    "exhibits:create": {
        **EXHIBITS_CLERK,
        "operation": "write",
        "composite": {
            "canonicalId": ["draftId"],
            "pathId": ["pathId"],
        }
    },

    "exhibits:get": {
        **EXHIBITS_CLERK,
        "operation": "read",
        "composite": {
            "canonicalId": ["exhibitId"],
            "pathId": ["pathId"],
        }
    },

    "exhibits:get-appendix": {
        **EXHIBITS_CLERK,
        "operation": "export",
        "composite": {
            "canonicalId": ["draftId"],
            "pathId": ["pathId"],
        }
    },

    # ... (additional configs for all 11 channels)
}
```

#### ULID Requirements

| Resource | ID Field | Format |
|----------|----------|--------|
| Exhibit Object | `exhibitId` | ULID |
| Draft | `draftId` | ULID |

#### Path Structure

```python
# Exhibits
build_path_id(case_id, "exhibits")  # case/{caseId}/exhibits
build_path_id(case_id, "exhibits", exhibit_id)  # case/{caseId}/exhibits/{exhibitId}
```

### ExhibitObject Model

**Structure:**
```python
{
    "id": "01ARZ3NDEK...",  # ULID
    "draft_id": "01BRZ4OEFK...",  # Which motion draft
    "sentence_ids": ["01CRZ5PGML...", ...],  # Claims in motion (optional)
    "document_ids": ["01DRZ6QHNM...", ...],  # Vault document IDs (optional)
    "created_at": "2024-12-27T...",
    "updated_at": "2024-12-27T..."
}
```

**Three Possible States:**

| State | sentence_ids | document_ids | Display | Export |
|-------|--------------|--------------|---------|--------|
| **Standalone** | [] | [] | No label yet | Nothing in appendix |
| **Claim-linked** | [s1, s2] | [] | "See Exhibit [?]" | Placeholder warning |
| **Document-linked** | [] | [d1] | Orphaned | Doc in appendix (no inline ref) |
| **Fully-linked** | [s1, s2] | [d1, d2] | "See Exhibit A" | Docs in appendix + inline citations |

### Service Coordination Flow

**Upload Workflow:**
```
User: "Attach Exhibit"
  ↓
Renderer → Orchestrator: "Upload exhibit for draft_id"
  ↓
Orchestrator → Records Service: "Store PDF in vault"
  ↓
Records Service: Store bytes, index pages, return document_id
  ↓
Records Service → Orchestrator: document_id="doc_456"
  ↓
Orchestrator → Exhibits Service: "Create exhibit with document_id=doc_456"
  ↓
Exhibits Service: Store reference (document_id only, NOT bytes)
  ↓
Exhibits Service → Orchestrator: exhibit_id="ex_789"
  ↓
Orchestrator → Renderer: "Success"
```

**Export Workflow:**
```
User: "Export motion with exhibits"
  ↓
Renderer → Orchestrator: "Export draft_id with exhibits"
  ↓
Orchestrator → Exhibits Service: "What's in appendix?"
  ↓
Exhibits Service: Query objects, organize, determine labels (A, B, C)
  ↓
Exhibits Service → Orchestrator:
  [
    {label: "A", document_ids: ["doc_456"]},
    {label: "B", document_ids: ["doc_789", "doc_012"]}
  ]
  ↓
Orchestrator → Records Service: "Get vault docs for IDs: [doc_456, ...]"
  ↓
Records Service: Retrieve bytes from vault (ONLY extraction point)
  ↓
Records Service → Orchestrator: Document bytes
  ↓
Orchestrator → Export Service: "Assemble DOCX with exhibit docs"
  ↓
Export Service: Assemble final DOCX
  ↓
Export Service → Orchestrator: Final DOCX bytes
  ↓
Orchestrator → Renderer: Download
```

### Critical Architectural Rules

1. **Exhibit labels (A, B, C) are DYNAMIC** - Determined by position during export, NOT stored
2. **Exhibits Service stores REFERENCES only** - document_ids, never bytes
3. **Records Service is authoritative for document IDs** - Only Records manages vault
4. **Exhibits Service CANNOT pull from vault** - Can only reference by ID
5. **ONLY Orchestrator can request vault bytes** - Single extraction path (security)
6. **Services NEVER call each other** - ALL coordination through Orchestrator

### Invariants

- INVARIANT: ExhibitObject stores REFERENCES only (document_ids), never bytes
- INVARIANT: Exhibit labels assigned at export time (dynamic, not stored)
- INVARIANT: All vault access goes through Orchestrator (no direct Records calls)
- INVARIANT: sentence_ids from Facts Service, document_ids from Records Service

---

## DEPLOYMENT CONFIGURATION (All 4 Services)

### Desktop (Child Processes)

```python
# Orchestrator validates, services in passthrough mode
ClerkGuard.configure(mode='strict')  # Orchestrator

services = [
    {'name': 'caseblock-service', 'port': 3004},
    {'name': 'signature-service', 'port': 3005},
    {'name': 'facts-service', 'port': 3006},
    {'name': 'exhibits-service', 'port': 3007},
]

for svc in services:
    spawn(svc['name'], env={
        'CLERKGUARD_MODE': 'passthrough',  # Trust orchestrator
        'PORT': str(svc['port']),
    })
```

### Cloud (Kubernetes)

```yaml
# All services validate (defense in depth)
env:
- name: CLERKGUARD_MODE
  value: "strict"
- name: PORT
  value: "300X"  # Service-specific port
```

---

## COMPLIANCE VERIFICATION (All 4 Services)

Before deployment, EACH service must verify:

**✅ Allowlist:**
- [ ] Service allowlist defined in `clerkguard_config.py`
- [ ] Channels follow `{service}:{operation}` naming
- [ ] Alphabetically sorted

**✅ ClerkGuard Configs:**
- [ ] One config per channel
- [ ] `caseScope: 'required'` for all operations
- [ ] `operation` type set
- [ ] `composite` IDs defined where applicable

**✅ ULID Usage:**
- [ ] All canonical IDs generated with `ulid()`
- [ ] ULID validation before database ops
- [ ] No UUIDs or arbitrary strings

**✅ Path Hierarchy:**
- [ ] All paths use `build_path_id()` helper
- [ ] All paths start with `case/`
- [ ] Path validation in handlers

**✅ Middleware:**
- [ ] ClerkGuard middleware applied before route handlers
- [ ] Audit logger configured
- [ ] Deployment mode configurable

**✅ Testing:**
- [ ] Unit tests for ClerkGuard validation
- [ ] Integration tests pass
- [ ] No false positives/negatives

---

## TOTAL CHANNEL COUNT

| Service | Channels | ClerkIdentifier |
|---------|----------|-----------------|
| CaseBlock | 10 | `CaseBlockClerk` |
| Signature | 9 | `SignatureBlockClerk` |
| Facts | 10 | `FactsClerk` |
| Exhibits | 11 | `ExhibitsClerk` |
| **TOTAL** | **40** | **4 clerks** |

---

## Template Notes

**Implementation Priority:** HIGH - Core business logic services

**Before Starting Implementation:**
1. Understand clerk → microservices evolution (domain model mapped to implementation)
2. All services use Python/FastAPI (consistent with Ingestion/Export)
3. All services integrate ClerkGuard from day one (not retrofitted)
4. Facts and Exhibits services coordinate via Orchestrator (never direct calls)

**Critical Invariants to Enforce:**

**CaseBlock & Signature:**
- Template approval required before production use
- Extraction preserves original text (substring check)

**Facts Service:**
- NOT vault-dependent (operates on draft content only)
- Evidence linking via Orchestrator (never direct Exhibits calls)

**Exhibits Service:**
- Stores REFERENCES only (document_ids), never bytes
- Exhibit labels assigned at export time (dynamic)
- Vault access ONLY through Orchestrator

**Common LLM Pitfalls to Avoid:**
1. **Don't skip ClerkGuard integration** - Required from day one
2. **Don't make direct service calls** - ALL coordination through Orchestrator
3. **Don't store vault bytes in Exhibits** - References only
4. **Don't hardcode exhibit labels** - Assigned dynamically at export

**Validation Checklist (All 4 Services):**
- [ ] Service starts on assigned port (3004-3007)
- [ ] Health check responds
- [ ] All channels functional
- [ ] ClerkGuard middleware active
- [ ] Integration tests pass (40 channels total)
- [ ] ULID generation/validation works
- [ ] Path hierarchy enforced

**Handoff to Next Runbook:**
- Runbook 7 (Orchestrator) spawns all 4 services as child processes
- Runbook 8 (Renderer) calls these services via Orchestrator
- Any service communication MUST go through Orchestrator

---

**End of Metadata for Runbook 6 (Updated Architecture)**
