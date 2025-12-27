---

## Metadata Summary

### Purpose
Create CaseLaw Service (port 3008) providing citation formatting, authority linking, and table of authorities generation. NO external API calls - user-uploaded authority library only.

### Produces (Artifacts)

**Service:**
- Service: `caselaw-service` (port 3008)
  - Language: Python 3.11+
  - Framework: FastAPI
  - Purpose: Citation formatting and authority management
  - Clerk Identity: `CaseLawClerk`

**Files:**
- File: `services/caselaw-service/main.py` (~200 lines)
- File: `services/caselaw-service/parsers/citation_parser.py` (~300 lines)
- File: `services/caselaw-service/formatters/bluebook_formatter.py` (~250 lines)
- File: `services/caselaw-service/authority/authority_manager.py` (~200 lines)
- File: `services/caselaw-service/toa/table_generator.py` (~200 lines)
- File: `services/caselaw-service/tests/test_caselaw.py` (~200 lines)

**Total:** ~1,350 lines

### Consumes (Prerequisites)

**Required Runbooks:**
- Runbook 1: LegalDocument types

**Required Environment:**
- `PORT`: 3008
- `SERVICE_NAME`: "caselaw"
- `CLERKGUARD_MODE`: "strict" | "passthrough"

**Required Dependencies:**
- `fastapi==0.108.0`
- `python-docx==1.1.0` (for authority uploads)
- `lxml==4.9.3`
- `ulid-py==1.1.0`

### Interfaces Touched

#### REST Endpoints (Server)

**Citation Operations:**
- **POST /citations/detect** - Detect citations in text
- **POST /citations/format** - Format citation to Bluebook style
- **POST /citations/validate** - Validate Bluebook compliance
- **POST /citations/link** - Link citation to claim

**Authority Library:**
- **POST /authorities** - Upload authority (case law, statute)
- **GET /authorities/:id** - Get authority by ID
- **GET /authorities** - List all authorities for case
- **DELETE /authorities/:id** - Delete authority

**Table of Authorities:**
- **POST /toa/generate** - Generate table of authorities for draft
- **GET /toa/:draftId** - Get TOA for specific draft

**Health:**
- **GET /health** - Health check

### ClerkGuard Integration

**Updated:** December 27, 2024
**Reference:** CLERKGUARD_CONTRACT.md
**Status:** ✅ Production architecture defined

#### Overview

CaseLaw Service integrates with ClerkGuard security validation layer to enforce architectural contracts at all API boundaries. CaseLaw Service does NOT call external APIs (Courtlistener, Casetext, etc.) - it is a user-uploaded authority library only.

**Clerk Identity:** `CaseLawClerk`

#### Channel Allowlist

CaseLaw Service exposes 10 channels covering citation formatting and authority management:

```python
CASELAW_SERVICE_ALLOWLIST = [
    # Citation operations
    "caselaw:detect-citations",
    "caselaw:format-citation",
    "caselaw:validate-bluebook",

    # Authority library
    "caselaw:upload-authority",
    "caselaw:get-authority",
    "caselaw:list-authorities",
    "caselaw:delete-authority",

    # Linking
    "caselaw:link-to-claim",
    "caselaw:unlink-from-claim",

    # Table of authorities
    "caselaw:generate-toa",
]
```

#### ClerkGuard Configurations

Each channel has a ClerkGuard configuration defining validation rules:

```python
CASELAW_CLERK = {
    "clerk": "CaseLawClerk",
    "caseScope": "required",
    "operation": "read",
}

CLERKGUARD_CONFIGS = {
    "caselaw:upload-authority": {
        **CASELAW_CLERK,
        "operation": "write",
        "composite": {
            "pathId": ["pathId"],  # case/{caseId}/authorities
        }
    },

    "caselaw:get-authority": {
        **CASELAW_CLERK,
        "operation": "read",
        "composite": {
            "canonicalId": ["authorityId"],
            "pathId": ["pathId"],
            "displayId": ["citationText"],  # e.g., "Brown v. Board of Education"
        }
    },

    "caselaw:format-citation": {
        **CASELAW_CLERK,
        "operation": "read",
        "composite": {
            "canonicalId": ["citationId"],
            "pathId": ["pathId"],
        }
    },

    "caselaw:generate-toa": {
        **CASELAW_CLERK,
        "operation": "export",
        "composite": {
            "canonicalId": ["draftId"],
            "pathId": ["pathId"],
        }
    },

    # ... (additional configs for all 10 channels)
}
```

#### ULID Requirements

All resource IDs in CaseLaw Service MUST use ULID format:

| Resource | ID Field | Format | Example |
|----------|----------|--------|---------|
| Authority | `authorityId` | ULID | `01ARZ3NDEKTSV4RRFFQ69G5FAV` |
| Citation | `citationId` | ULID | `01BRZ4OEFKUTSW5SSGGR7H6GBW` |
| Draft | `draftId` | ULID | `01CRZ5PGMLUTSV6TTHHS8I7HCX` |

**ID Generation:**
```python
from ulid import ulid

# Generate ULID for new resource
authority_id = ulid()  # "01ARZ3NDEKTSV4RRFFQ69G5FAV"
citation_id = ulid()  # "01BRZ4OEFKUTSW5SSGGR7H6GBW"
```

**ID Validation:**
```python
from factsway.clerkguard import is_valid_ulid

# Validate before database operations
if not is_valid_ulid(authority_id):
    raise ClerkGuardError('INVALID_CANONICAL_ID')
```

#### Path Structure

All paths MUST start with `case/` prefix and use the `build_path_id()` helper:

```python
from factsway.shared.ids import build_path_id

# Authorities (user-uploaded case law)
build_path_id(case_id, "authorities")  # case/{caseId}/authorities
build_path_id(case_id, "authorities", authority_id)  # case/{caseId}/authorities/{authorityId}

# Citations (detected in drafts)
build_path_id(case_id, "citations")  # case/{caseId}/citations
build_path_id(case_id, "citations", citation_id)  # case/{caseId}/citations/{citationId}

# Table of Authorities
build_path_id(case_id, "toa", draft_id)  # case/{caseId}/toa/{draftId}
```

#### Middleware Integration

ClerkGuard middleware must be applied BEFORE route handlers:

```python
# services/caselaw-service/main.py

from fastapi import FastAPI, Request, Response
from factsway.clerkguard import ClerkGuard, ClerkGuardError
from .clerkguard_config import CLERKGUARD_CONFIGS

app = FastAPI()

@app.middleware("http")
async def clerkguard_middleware(request: Request, call_next):
    try:
        # Map HTTP route + method to channel
        channel = route_to_channel(request.url.path, request.method)

        # ClerkGuard enforces 5 core validations
        config = CLERKGUARD_CONFIGS[channel]
        body = await request.json() if request.method in ["POST", "PUT"] else {}
        ClerkGuard.enforce(channel, body, config)

        response = await call_next(request)
        return response

    except ClerkGuardError as error:
        # Audit log violation
        logger.warning(f"ClerkGuard violation: {error.reason}", extra={
            "channel": channel,
            "code": error.code,
            "payload": body,
        })

        return Response(
            content=json.dumps({
                "error": "Forbidden",
                "reason": error.reason,
                "code": error.code,
            }),
            status_code=403,
            media_type="application/json"
        )

# Route handlers (only execute if ClerkGuard passes)
@app.post("/authorities")
async def upload_authority(...):
    # Handler code
    pass
```

### Authority Model

**Structure:**
```python
{
    "authority_id": "01ARZ3NDEK...",  # ULID
    "case_id": "01BRZ4OEFK...",  # Parent case
    "citation_text": "Brown v. Board of Education, 347 U.S. 483 (1954)",
    "authority_type": "case_law" | "statute" | "regulation" | "constitution",
    "jurisdiction": "Federal" | "Texas" | "California" | ...,
    "court": "Supreme Court" | "5th Circuit" | ...,
    "decision_date": "1954-05-17",
    "document": {
        "document_id": "01CRZ5PGML...",  # Vault reference (optional)
        "filename": "brown-v-board.pdf"
    },
    "created_at": "2024-12-27T...",
    "updated_at": "2024-12-27T..."
}
```

### Citation Detection

**Detection Process:**
1. Parse text for citation patterns (regex + NLP)
2. Extract components (parties, reporter, year)
3. Validate format against Bluebook rules
4. Return citation objects with confidence scores

**Supported Citation Formats:**
- Case law: "Brown v. Board of Education, 347 U.S. 483 (1954)"
- Statutes: "42 U.S.C. § 1983"
- Regulations: "29 C.F.R. § 1630.2(g)"
- Texas statutes: "Tex. Civ. Prac. & Rem. Code § 16.051"

### Table of Authorities Generation

**TOA Process:**
1. Detect all citations in draft (via `caselaw:detect-citations`)
2. Match citations to authority library
3. Organize by type (cases, statutes, regulations)
4. Sort alphabetically within each type
5. Generate formatted TOA for export

**TOA Output:**
```python
{
    "draft_id": "01ARZ3NDEK...",
    "generated_at": "2024-12-27T...",
    "sections": [
        {
            "type": "case_law",
            "title": "CASES",
            "entries": [
                {
                    "citation": "Brown v. Board of Education, 347 U.S. 483 (1954)",
                    "pages": [5, 12, 18]  # Pages in draft where cited
                }
            ]
        },
        {
            "type": "statutes",
            "title": "STATUTES",
            "entries": [...]
        }
    ]
}
```

### Critical Architectural Rules

**NO External API Calls:**
- CaseLaw Service does NOT call Courtlistener, Casetext, Lexis, Westlaw, etc.
- User MUST upload authority documents to vault
- Citation FORMATTING only (not legal research)

**User-Uploaded Library:**
- Users upload PDFs of cases/statutes to vault (via Records Service)
- CaseLaw Service stores metadata and references
- Vault document_ids linked to authority objects

**Service Coordination:**
```
User: "Upload case law"
  ↓
Renderer → Orchestrator → Records Service: Store PDF in vault
  ↓
Records → Orchestrator: document_id
  ↓
Orchestrator → CaseLaw Service: Create authority with document_id
  ↓
CaseLaw Service: Store metadata + reference (NOT bytes)
```

### Deployment Configuration

**Desktop (Child Process):**
```python
# Orchestrator validates, services in passthrough mode
ClerkGuard.configure(mode='passthrough')  # Trust orchestrator validation
```

**Cloud (Kubernetes):**
```python
# All services validate (defense in depth)
ClerkGuard.configure(mode='strict')
```

### Compliance Checklist

Before deployment, verify:

**✅ Allowlist:**
- [ ] `CASELAW_SERVICE_ALLOWLIST` defined in `clerkguard_config.py`
- [ ] All 10 channels follow `caselaw:{operation}` naming
- [ ] Alphabetically sorted within categories

**✅ ClerkGuard Configs:**
- [ ] One config per channel (10 total)
- [ ] `caseScope: 'required'` for all operations
- [ ] `operation` type set (read/write/export)
- [ ] `composite` IDs defined where applicable

**✅ ULID Usage:**
- [ ] All canonical IDs generated with `ulid()`
- [ ] ULID validation before database operations
- [ ] No UUIDs or arbitrary strings in ID fields

**✅ Path Hierarchy:**
- [ ] All paths use `build_path_id()` helper
- [ ] All paths start with `case/`
- [ ] Path validation in route handlers

**✅ Middleware:**
- [ ] ClerkGuard middleware applied before route handlers
- [ ] Audit logger configured for violations
- [ ] Deployment mode configurable (`CLERKGUARD_MODE` env var)

**✅ Testing:**
- [ ] Unit tests for ClerkGuard validation (10 channels)
- [ ] Integration tests verify violations are blocked
- [ ] No false positives/negatives

**✅ NO External APIs:**
- [ ] Verified NO calls to Courtlistener, Casetext, etc.
- [ ] Authority library is user-uploaded only
- [ ] Citation formatting only (not legal research)

### Invariants

**Citation Format Invariants:**
- INVARIANT: All citations validated against Bluebook rules
- INVARIANT: Citation detection preserves original text (substring check)
- INVARIANT: Citation components (parties, reporter, year) extracted correctly

**Authority Library Invariants:**
- INVARIANT: Authority documents stored in vault (NOT in CaseLaw Service)
- INVARIANT: CaseLaw Service stores metadata + document_id reference only
- INVARIANT: NO external API calls (user-uploaded library only)

**TOA Generation Invariants:**
- INVARIANT: TOA includes all citations detected in draft
- INVARIANT: Citations sorted alphabetically within type sections
- INVARIANT: Page numbers accurate (where citation appears in draft)

### Verification Gates

**Citation Detection Verification:**
- Command: `curl -X POST http://localhost:3008/citations/detect -d '{"text":"See Brown v. Board, 347 U.S. 483 (1954)"}'`
- Expected: 200 OK + Citation object with parsed components

**Authority Upload Verification:**
- Test: Upload PDF via Records Service, create authority via CaseLaw
- Expected: Authority created with document_id reference

**TOA Generation Verification:**
- Test: Generate TOA for draft with 5 citations
- Expected: TOA with all 5 citations, sorted alphabetically

### Risks

**Technical Risks:**

- **Risk:** Citation detection fails for non-standard formats
  - Severity: MEDIUM
  - Mitigation: Support common patterns first, expand iteratively
  - Detection: Manual review of detection accuracy

- **Risk:** Bluebook formatting rules complex and jurisdiction-specific
  - Severity: MEDIUM
  - Mitigation: Implement core Bluebook rules, allow manual override
  - Detection: User reports formatting errors

**Scope Risks:**

- **Risk:** Users expect external API integration (Courtlistener, etc.)
  - Severity: LOW
  - Mitigation: Clear documentation that CaseLaw is user-uploaded library only
  - Detection: User feedback

## Template Notes

**Implementation Priority:** MEDIUM - Citation formatting useful but not critical path

**Before Starting Implementation:**
1. Understand NO external API calls - user-uploaded library only
2. CaseLaw Service stores metadata + references, NOT vault bytes
3. Citation FORMATTING (Bluebook rules), NOT legal research
4. Table of Authorities generation is export-time operation

**Critical Invariants to Enforce:**
- **NO external APIs (HARD):** No calls to Courtlistener, Casetext, Lexis, Westlaw
- **Vault references only (HARD):** Store document_ids, NOT bytes
- **Bluebook compliance (METRIC):** Target >90% accurate formatting

**Common LLM Pitfalls to Avoid:**
1. **Don't call external APIs** - User-uploaded library only
2. **Don't store vault bytes** - References (document_ids) only
3. **Don't hardcode jurisdictions** - Support multiple jurisdictions
4. **Don't skip ClerkGuard integration** - Required from day one

**Validation Checklist:**
- [ ] Service starts on port 3008
- [ ] Health check responds
- [ ] All 10 channels functional
- [ ] ClerkGuard middleware active
- [ ] Integration tests pass
- [ ] ULID generation/validation works
- [ ] Path hierarchy enforced
- [ ] NO external API calls verified

**Handoff to Next Runbook:**
- Runbook 7 (Orchestrator) spawns CaseLaw Service as child process
- Runbook 8 (Renderer) calls CaseLaw via Orchestrator
- Export Service uses TOA generation for final DOCX

---

**End of Metadata for CaseLaw Service (Port 3008)**
