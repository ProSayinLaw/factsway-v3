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

---

**End of Metadata for Runbooks 4 & 5**
