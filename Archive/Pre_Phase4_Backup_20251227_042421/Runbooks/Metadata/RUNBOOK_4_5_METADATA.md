---

## Metadata Summary

### Purpose
Create the Ingestion Service (port 3002) that parses DOCX files into LegalDocument format using deterministic parsing + LLM-assisted sentence splitting fallback.

### Produces (Artifacts)

**Service:**
- Service: `ingestion-service` (port 3002)
  - Language: Python 3.11+
  - Framework: FastAPI
  - Key Libraries: python-docx, lxml, nupunkt, anthropic

**Files:**
- File: `services/ingestion-service/main.py` (~200 lines)
- File: `services/ingestion-service/parsers/docx_parser.py` (~300 lines)
- File: `services/ingestion-service/parsers/sentence_splitter.py` (~250 lines)
- File: `services/ingestion-service/parsers/section_detector.py` (~200 lines)
- File: `services/ingestion-service/llm/sentence_refinement.py` (~150 lines)
- File: `services/ingestion-service/requirements.txt` (dependencies)
- File: `services/ingestion-service/tests/test_ingestion.py` (~300 lines)

**Total:** ~1,400 lines

### Consumes (Prerequisites)

**Required Runbooks:**
- Runbook 1: LegalDocument types (for output validation)

**Required Environment:**
- `PORT`: 3002
- `ANTHROPIC_API_KEY`: For LLM-assisted sentence splitting
- `SERVICE_NAME`: "ingestion"
- `DEPLOYMENT_ENV`: "desktop"|"cloud"|"enterprise"

**Required Dependencies:**
- `fastapi==0.108.0`
- `python-docx==1.1.0` (DOCX parsing)
- `lxml==4.9.3` (XML parsing)
- `nupunkt==0.1.0` (sentence boundary detection)
- `anthropic==0.8.0` (Claude API for fallback)

### Interfaces Touched

#### REST Endpoints (Server)

- From: Records Service/Renderer → To: Ingestion Service → **POST /ingest**
  - Request: `multipart/form-data` with file field (DOCX file)
  - Response: `LegalDocument` (parsed document)
  - Purpose: Parse uploaded DOCX into canonical format
  - Status Codes: 200 (success), 400 (invalid file), 413 (file too large)
  - Max File Size: 50MB

- From: ANY → To: Ingestion Service → **GET /health**
  - Response: `{ status: "healthy", service: "ingestion" }`

#### Filesystem

**Reads:**
- Uploaded DOCX files (temporary, in-memory processing)
- No persistent file storage

**Creates:**
- Temporary files during parsing (cleaned up after response)

#### Process Lifecycle

**Parsing Pipeline (3 Stages):**

1. **Stage 1: Deterministic Parsing (No LLM)**
   - Input: DOCX file bytes
   - Process: python-docx + lxml parsing, nupunkt sentence detection
   - Output: Candidate LegalDocument with ~85% accurate sentence boundaries
   - Accuracy: High for simple cases, lower for legal citations/abbreviations
   - Cost: $0 (no API calls)

2. **Stage 2: LLM-Assisted Refinement (Anthropic API)**
   - Input: Ambiguous sentence boundaries (confidence <0.9 from Stage 1)
   - Process: Send paragraph + candidates to Claude, ask for corrections
   - Output: Refined sentence boundaries with LLM confidence scores
   - Accuracy: ~95% (improves ambiguous cases)
   - Cost: ~$0.01 per complex paragraph
   - Fallback: If LLM confidence <0.7, keep Stage 1 result

3. **Stage 3: Validation & Output**
   - Input: Parsed LegalDocument from Stage 1/2
   - Process: Validate invariants (substring check, no overlaps, all text covered)
   - Output: Valid LegalDocument or error
   - Hard Failures: Invariant violations (text corruption, missing coverage)

### ClerkGuard Integration

**Updated:** December 27, 2024
**Reference:** CLERKGUARD_CONTRACT.md
**Status:** ✅ Production architecture defined

#### Overview

Ingestion Service integrates with ClerkGuard security validation layer to enforce architectural contracts at all API boundaries. ClerkGuard validates channel allowlists, case scope, ULID format, path hierarchy, and prevents display ID lookup.

**Clerk Identity:** `IngestionClerk`

#### Channel Allowlist

Ingestion Service exposes 9 channels covering DOCX/PDF parsing and Facts extraction:

```python
INGESTION_SERVICE_ALLOWLIST = [
    # DOCX ingestion
    "ingestion:parse-docx",
    "ingestion:validate-format",

    # PDF ingestion (page-level only)
    "ingestion:parse-pdf",
    "ingestion:extract-pages",

    # Facts extraction
    "ingestion:extract-facts",
    "ingestion:detect-sentences",

    # Section detection
    "ingestion:detect-sections",
    "ingestion:extract-headers",

    # Citation detection
    "ingestion:detect-citations",
]
```

#### ClerkGuard Configurations

Each channel has a ClerkGuard configuration defining validation rules:

```python
INGESTION_CLERK = {
    "clerk": "IngestionClerk",
    "caseScope": "required",
    "operation": "read",
}

CLERKGUARD_CONFIGS = {
    "ingestion:parse-docx": {
        **INGESTION_CLERK,
        "operation": "write",
        "composite": {
            "pathId": ["pathId"],  # case/{caseId}/docs/{filename}
        }
    },

    "ingestion:parse-pdf": {
        **INGESTION_CLERK,
        "operation": "write",
        "composite": {
            "canonicalId": ["documentId"],
            "pathId": ["pathId"],
        }
    },

    "ingestion:extract-facts": {
        **INGESTION_CLERK,
        "operation": "read",
        "composite": {
            "canonicalId": ["draftId"],
            "pathId": ["pathId"],
        }
    },

    # ... (additional configs for all 9 channels)
}
```

#### ULID Requirements

All resource IDs in Ingestion Service MUST use ULID format:

| Resource | ID Field | Format |
|----------|----------|--------|
| Document | `documentId` | ULID |
| Sentence | `sentenceId` | ULID |
| Section | `sectionId` | ULID |
| Draft | `draftId` | ULID |

**ID Generation:**
```python
from ulid import ulid

# Generate ULID for new resource
document_id = ulid()  # "01ARZ3NDEKTSV4RRFFQ69G5FAV"
sentence_id = ulid()  # "01BRZ4OEFKUTSW5SSGGR7H6GBW"
```

#### Path Structure

All paths MUST start with `case/` prefix and use the `build_path_id()` helper:

```python
from factsway.shared.ids import build_path_id

# Documents
build_path_id(case_id, "docs", filename)  # case/{caseId}/docs/{filename}

# Sections (within document)
build_path_id(case_id, "docs", document_id, "sections")  # case/{caseId}/docs/{documentId}/sections
```

#### Middleware Integration

ClerkGuard middleware must be applied BEFORE route handlers:

```python
# services/ingestion-service/main.py

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
@app.post("/ingest")
async def parse_docx(...):
    # Handler code
    pass
```

#### Deployment Configuration

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

#### Compliance Checklist

Before deployment, verify:

**✅ Allowlist:**
- [ ] `INGESTION_SERVICE_ALLOWLIST` defined in `clerkguard_config.py`
- [ ] All 9 channels follow `ingestion:{operation}` naming
- [ ] Alphabetically sorted within categories

**✅ ClerkGuard Configs:**
- [ ] One config per channel (9 total)
- [ ] `caseScope: 'required'` for all operations
- [ ] `operation` type set (read/write)
- [ ] `composite` IDs defined where applicable

**✅ ULID Usage:**
- [ ] All canonical IDs generated with `ulid()`
- [ ] ULID validation before database operations
- [ ] No UUIDs or arbitrary strings in ID fields

**✅ Path Hierarchy:**
- [ ] All paths use `build_path_id()` helper
- [ ] All paths start with `case/`
- [ ] Path validation in handlers

**✅ Middleware:**
- [ ] ClerkGuard middleware applied before route handlers
- [ ] Audit logger configured for violations
- [ ] Deployment mode configurable

**✅ Testing:**
- [ ] Unit tests for ClerkGuard validation (9 channels)
- [ ] Integration tests verify violations are blocked
- [ ] No false positives/negatives

### Invariants

**Text Extraction Invariants (HARD REQUIREMENTS):**

- INVARIANT: Sentence text is exact substring of paragraph
  - Formula: `Sentence.text === Paragraph.text[start_offset:end_offset]`
  - Enforced by: Assertion check after EVERY parsing stage
  - Purpose: Guarantees no text corruption
  - Violation: Hard failure, parsing stops
  - Recovery: None (indicates logic error)

- INVARIANT: All paragraph characters assigned to sentences
  - Rule: Union of all sentence character ranges covers entire paragraph
  - Enforced by: Coverage validation in Stage 3
  - Purpose: No "lost" text between sentences
  - Violation: Hard failure
  - Recovery: Force split at gaps (create sentence from uncovered ranges)

**Quality Metrics (BEST EFFORT, NOT ENFORCED):**

- **METRIC:** Sentence boundary detection accuracy
  - Target: >95% correct boundaries
  - Measurement: LLM confidence scores, manual review sampling
  - Pipeline: Deterministic (85%) → LLM-assisted (95%)
  - Known failure modes: Abbreviations, legal citations, ellipses
  - Fallback: Keep as single sentence if confidence <0.7

- **METRIC:** Deterministic vs LLM output ratio
  - Target: <15% of sentences require LLM assistance
  - Measurement: Count Stage 1 vs Stage 2 outputs
  - Purpose: Cost control (LLM calls are expensive)

### Verification Gates

**DOCX Parsing Verification:**
- Command: `curl -X POST http://localhost:3002/ingest -F "file=@sample.docx"`
- Expected: 200 OK + LegalDocument JSON with sections, paragraphs, sentences
- Purpose: Verify file upload and parsing works

**Sentence Splitting Verification:**
- Test Case: Upload DOCX with "Dr. Smith works at 123 Main St. He lives nearby."
- Expected: 2 sentences, not 4 (abbreviation handling works)
- Purpose: Verify deterministic parser handles common abbreviations

**LLM Fallback Verification:**
- Test Case: Upload DOCX with ambiguous case ("He said... then left.")
- Expected: LLM called for refinement, confidence score returned
- Purpose: Verify LLM integration works

### Risks

**Technical Risks:**

- **Risk:** LLM API rate limits during bulk processing
  - Severity: HIGH
  - Mitigation: Implement retry with exponential backoff, queue ambiguous cases
  - Detection: 429 Too Many Requests errors

- **Risk:** DOCX parsing fails for complex formatting
  - Severity: MEDIUM
  - Mitigation: Graceful degradation (extract plain text), log warnings
  - Detection: Parse errors, missing sections

**Cost Risks:**

- **Risk:** High LLM API costs for document-heavy users
  - Severity: MEDIUM
  - Mitigation: Cache results, limit LLM calls to <15% of sentences
  - Detection: API usage monitoring

---

## Metadata Summary

### Purpose
Create the Export Service (port 3003) that generates DOCX files from LegalDocument format with proper legal formatting (Times New Roman 12pt, section numbering, page numbers).

### Produces (Artifacts)

**Service:**
- Service: `export-service` (port 3003)
  - Language: Python 3.11+
  - Framework: FastAPI
  - Key Libraries: python-docx, lxml

**Files:**
- File: `services/export-service/main.py` (~150 lines)
- File: `services/export-service/generators/docx_generator.py` (~400 lines)
- File: `services/export-service/generators/style_manager.py` (~200 lines)
- File: `services/export-service/generators/numbering_manager.py` (~150 lines)
- File: `services/export-service/requirements.txt` (dependencies)
- File: `services/export-service/tests/test_export.py` (~200 lines)

**Total:** ~1,100 lines

### Consumes (Prerequisites)

**Required Runbooks:**
- Runbook 1: LegalDocument types (for input validation)

**Required Environment:**
- `PORT`: 3003
- `SERVICE_NAME`: "export"

**Required Dependencies:**
- `fastapi==0.108.0`
- `python-docx==1.1.0` (DOCX generation)
- `lxml==4.9.3` (XML manipulation)

### Interfaces Touched

#### REST Endpoints (Server)

- From: Records Service/Renderer → To: Export Service → **POST /export**
  - Request: `LegalDocument` JSON
  - Response: DOCX file (binary, application/vnd.openxmlformats...)
  - Purpose: Generate formatted DOCX from LegalDocument
  - Status Codes: 200 (success), 400 (invalid document), 500 (generation error)
  - Max Document Size: 200 pages (performance limit)

- From: ANY → To: Export Service → **GET /health**
  - Response: `{ status: "healthy", service: "export" }`

#### Filesystem

**Creates:**
- Temporary DOCX files during generation (cleaned up after response)
- Streaming response (no persistent file storage)

**Reads:**
- Template DOCX files (optional, for custom styling)

### ClerkGuard Integration

**Updated:** December 27, 2024
**Reference:** CLERKGUARD_CONTRACT.md
**Status:** ✅ Production architecture defined

#### Overview

Export Service integrates with ClerkGuard security validation layer to enforce architectural contracts at all API boundaries. Export Service includes ALL AttachmentsClerk functionality (certificates, notices, affidavits, custom templates).

**Clerk Identity:** `ExportsClerk`

#### Channel Allowlist

Export Service exposes 11 channels covering DOCX/PDF export and Attachments functionality:

```python
EXPORT_SERVICE_ALLOWLIST = [
    # DOCX export
    "export:generate-docx",
    "export:apply-formatting",

    # PDF export
    "export:generate-pdf",

    # Attachments (AttachmentsClerk features)
    "export:create-certificate",
    "export:create-notice",
    "export:create-affidavit",
    "export:list-templates",
    "export:get-template",
    "export:create-template",
    "export:update-template",
    "export:delete-template",

    # Assembly
    "export:assemble-motion",
    "export:preview",
]
```

#### ClerkGuard Configurations

Each channel has a ClerkGuard configuration defining validation rules:

```python
EXPORTS_CLERK = {
    "clerk": "ExportsClerk",
    "caseScope": "required",
    "operation": "export",
}

CLERKGUARD_CONFIGS = {
    "export:generate-docx": {
        **EXPORTS_CLERK,
        "operation": "export",
        "composite": {
            "canonicalId": ["draftId"],
            "pathId": ["pathId"],
        }
    },

    "export:generate-pdf": {
        **EXPORTS_CLERK,
        "operation": "export",
        "composite": {
            "canonicalId": ["draftId"],
            "pathId": ["pathId"],
        }
    },

    "export:create-template": {
        **EXPORTS_CLERK,
        "operation": "write",
        "composite": {
            "pathId": ["pathId"],  # case/{caseId}/export-templates
        }
    },

    "export:get-template": {
        **EXPORTS_CLERK,
        "operation": "read",
        "composite": {
            "canonicalId": ["templateId"],
            "pathId": ["pathId"],
            "displayId": ["templateName"],
        }
    },

    # ... (additional configs for all 11 channels)
}
```

#### ULID Requirements

All resource IDs in Export Service MUST use ULID format:

| Resource | ID Field | Format |
|----------|----------|--------|
| Draft | `draftId` | ULID |
| Template | `templateId` | ULID |
| Attachment | `attachmentId` | ULID |

**ID Generation:**
```python
from ulid import ulid

# Generate ULID for new resource
draft_id = ulid()  # "01ARZ3NDEKTSV4RRFFQ69G5FAV"
template_id = ulid()  # "01BRZ4OEFKUTSW5SSGGR7H6GBW"
```

#### Path Structure

All paths MUST start with `case/` prefix and use the `build_path_id()` helper:

```python
from factsway.shared.ids import build_path_id

# Drafts
build_path_id(case_id, "drafts", draft_id)  # case/{caseId}/drafts/{draftId}

# Export templates (certificates, notices, affidavits)
build_path_id(case_id, "export-templates")  # case/{caseId}/export-templates
build_path_id(case_id, "export-templates", template_id)  # case/{caseId}/export-templates/{templateId}
```

#### Middleware Integration

ClerkGuard middleware must be applied BEFORE route handlers:

```python
# services/export-service/main.py

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
@app.post("/export")
async def generate_docx(...):
    # Handler code
    pass
```

#### AttachmentsClerk Integration

**CRITICAL:** Export Service owns ALL 4 attachment types (folded from AttachmentsClerk):

1. **Certificate of Service** - `export:create-certificate`
2. **Notice of Hearing** - `export:create-notice`
3. **Affidavit** - `export:create-affidavit`
4. **Custom Templates** - `export:create-template`

**AttachmentTemplate Structure:**
```python
{
    "template_id": "01ARZ3NDEK...",  # ULID
    "name": "Texas Certificate of Service",
    "type": "certificate" | "notice" | "affidavit" | "custom",
    "content": {
        "body": "I hereby certify...",
        "placeholders": [...]
    },
    "export_behavior": {
        "position": "attached" | "separate",
        "attachment_order": 1
    }
}
```

#### Deployment Configuration

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

#### Compliance Checklist

Before deployment, verify:

**✅ Allowlist:**
- [ ] `EXPORT_SERVICE_ALLOWLIST` defined in `clerkguard_config.py`
- [ ] All 11 channels follow `export:{operation}` naming
- [ ] Alphabetically sorted within categories

**✅ ClerkGuard Configs:**
- [ ] One config per channel (11 total)
- [ ] `caseScope: 'required'` for all operations
- [ ] `operation` type set (export/write/read)
- [ ] `composite` IDs defined where applicable

**✅ ULID Usage:**
- [ ] All canonical IDs generated with `ulid()`
- [ ] ULID validation before operations
- [ ] No UUIDs or arbitrary strings in ID fields

**✅ Path Hierarchy:**
- [ ] All paths use `build_path_id()` helper
- [ ] All paths start with `case/`
- [ ] Path validation in handlers

**✅ Middleware:**
- [ ] ClerkGuard middleware applied before route handlers
- [ ] Audit logger configured for violations
- [ ] Deployment mode configurable

**✅ Testing:**
- [ ] Unit tests for ClerkGuard validation (11 channels)
- [ ] Integration tests verify violations are blocked
- [ ] No false positives/negatives

**✅ AttachmentsClerk Integration:**
- [ ] All 4 attachment types supported
- [ ] Template CRUD operations functional
- [ ] Export behavior (attached/separate) implemented

### Invariants

**DOCX Generation Invariants:**

- INVARIANT: All section text appears in output DOCX
  - Rule: Every paragraph.text in LegalDocument appears in DOCX
  - Enforced by: Generation logic traverses all sections
  - Purpose: No text loss during export
  - Violation: Missing content in DOCX
  - Detection: User reports missing text
  - Recovery: Regenerate DOCX, check generation logic

- INVARIANT: Section numbering matches LegalDocument structure
  - Rule: Section.number in LegalDocument matches numbering in DOCX
  - Enforced by: Numbering manager uses same algorithm as frontend
  - Purpose: Consistent numbering across views
  - Violation: Mismatched numbering
  - Detection: Visual review, automated tests
  - Recovery: Fix numbering algorithm

- INVARIANT: Generated DOCX is valid format
  - Rule: DOCX passes Office validation (magic bytes 504b0304)
  - Enforced by: python-docx library
  - Purpose: File opens in Word/Google Docs
  - Violation: Corrupt file errors
  - Detection: File won't open
  - Recovery: Regenerate with error logging

**Quality Metrics (NOT ENFORCED):**

- **METRIC:** Export generation time <2s for typical documents
  - Target: <2s for documents <50 pages
  - Measurement: Response time logging
  - Acceptable: Up to 10s for 200-page documents

### Verification Gates

**DOCX Generation Verification:**
- Command: `curl -X POST http://localhost:3003/export -d @legaldoc.json`
- Expected: 200 OK + valid DOCX file (binary)
- Purpose: Verify export pipeline works

**DOCX Validity Verification:**
- Test: Open generated DOCX in Microsoft Word
- Expected: File opens without errors, content renders correctly
- Purpose: Verify format compliance

**Formatting Verification:**
- Test: Check font (Times New Roman 12pt), margins (1 inch), line spacing (double)
- Expected: Legal formatting standards met
- Purpose: Verify style application

### Risks

**Technical Risks:**

- **Risk:** Large documents (200+ pages) timeout
  - Severity: MEDIUM
  - Mitigation: Streaming response, pagination for huge docs
  - Detection: Timeout errors (>30s)

- **Risk:** Complex formatting breaks DOCX structure
  - Severity: HIGH
  - Mitigation: Limit supported formatting (no tables in v1)
  - Detection: Corrupt DOCX files

**Data Risks:**

- **Risk:** Text loss during generation
  - Severity: CRITICAL
  - Mitigation: Validation check (count paragraphs in/out)
  - Detection: Automated tests, user reports

## Template Notes

**Implementation Priority:** HIGH - Critical for document processing pipeline

**Before Starting Implementation:**
1. Understand the 3-stage parsing pipeline (Runbook 4): Deterministic → LLM → Validation
2. Understand DOCX generation requirements (Runbook 5): Legal formatting standards
3. Both services are Python - different pattern from TypeScript services
4. Text integrity invariants are HARD requirements, parsing accuracy is BEST EFFORT

**LLM-Assisted Implementation Strategy:**

**Runbook 4 (Ingestion Service):**

**Step 1: Deterministic Parsing (Stage 1)**
- Implement python-docx parsing first (no LLM)
- Extract sections, paragraphs, sentences using nupunkt
- Aim for 85% accuracy baseline (known failure modes documented)
- Test with real legal documents (motions, briefs)

**Step 2: LLM-Assisted Refinement (Stage 2)**
- Only call LLM for ambiguous cases (confidence <0.9 from Stage 1)
- Implement retry logic for API failures
- Track costs (log every LLM call)
- Validate LLM output (ensure substring invariant)

**Step 3: Validation (Stage 3)**
- CRITICAL: Enforce text extraction invariants (substring check, coverage)
- Hard failure if invariants violated (don't proceed with corrupted data)
- Output valid LegalDocument or error (no partial success)

**Runbook 5 (Export Service):**

**Step 1: Basic DOCX Generation**
- Start with simple: LegalDocument → DOCX with plain text
- Verify all section text appears in output (no text loss)

**Step 2: Legal Formatting**
- Apply styles: Times New Roman 12pt, 1-inch margins, double spacing
- Implement section numbering (1.1.1 hierarchical)
- Add page numbers, headers/footers

**Step 3: Advanced Features**
- Handle complex formatting (lists, indentation)
- Preserve evidence citations (amber highlighting)

**Critical Invariants to Enforce:**

**Runbook 4 (Ingestion):**
- **Sentence = substring (HARD):** `sentence.text === paragraph.text[start:end]` MUST hold
- **Full coverage (HARD):** All paragraph characters assigned to sentences
- **Parsing accuracy (METRIC):** Target >95%, measure with LLM confidence scores

**Runbook 5 (Export):**
- **Text preservation (HARD):** All section text in LegalDocument appears in DOCX
- **Section numbering (HARD):** DOCX numbering matches LegalDocument structure
- **DOCX validity (HARD):** Generated file must open in Word/Google Docs

**Common LLM Pitfalls to Avoid:**
1. **Don't skip substring validation:** This is the sentinel invariant - enforce it
2. **Don't over-rely on LLM:** 85% deterministic is the goal, LLM is fallback
3. **Don't ignore costs:** Log every Anthropic API call (costs add up)
4. **Don't generate invalid DOCX:** Test with Word, not just "it's a .docx file"

**Validation Checklist (Both Services):**

**Runbook 4:**
- [ ] Deterministic parsing achieves ~85% accuracy
- [ ] LLM calls trigger only for ambiguous cases (<15%)
- [ ] Substring invariant enforced (hard failure if violated)
- [ ] Full text coverage verified
- [ ] Real document test suite passes

**Runbook 5:**
- [ ] All sections exported (no text loss)
- [ ] Legal formatting applied (Times New Roman, margins, spacing)
- [ ] Generated DOCX opens in Word
- [ ] Section numbering matches LegalDocument
- [ ] Large documents (200 pages) export successfully

**Handoff to Next Runbook:**
- Runbook 6 (Specialized Services) depends on these working correctly
- Renderer (Runbook 8) calls Export Service for downloads
- Any parsing errors cascade through entire system

---

**End of Metadata for Runbooks 4 & 5**
