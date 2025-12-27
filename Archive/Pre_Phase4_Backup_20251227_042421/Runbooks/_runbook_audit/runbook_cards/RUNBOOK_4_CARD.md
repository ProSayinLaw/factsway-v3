## Purpose
Create the Ingestion Service (port 3002) that parses DOCX files into LegalDocument format using deterministic parsing + LLM-assisted sentence splitting fallback.

## Produces (Artifacts)
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

## Consumes (Prereqs)
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

## Interfaces Touched
- REST endpoints
  - POST /ingest (Source: Metadata/RUNBOOK_4_5_METADATA.md:L49-L49) "- From: Records Service/Renderer → To: Ingestion Service → **POST /ingest**"
  - GET /health (Source: Metadata/RUNBOOK_4_5_METADATA.md:L56-L56) "- From: ANY → To: Ingestion Service → **GET /health**"
  - POST /export (Source: Metadata/RUNBOOK_4_5_METADATA.md:L206-L206) "- From: Records Service/Renderer → To: Export Service → **POST /export**"
  - GET /health (Source: Metadata/RUNBOOK_4_5_METADATA.md:L213-L213) "- From: ANY → To: Export Service → **GET /health**"
- IPC channels/events (if any)
  - Create the Ingestion Service (port 3002) that parses DOCX files into LegalDocument format using deterministic parsing + LLM-assisted sentence splitting fallback. (Source: Metadata/RUNBOOK_4_5_METADATA.md:L6-L6) "Create the Ingestion Service (port 3002) that parses DOCX files into LegalDocument format using deterministic parsing + LLM-assisted sentence splitting fallback."
  - - Service: `ingestion-service` (port 3002) (Source: Metadata/RUNBOOK_4_5_METADATA.md:L11-L11) "- Service: `ingestion-service` (port 3002)"
  - - `PORT`: 3002 (Source: Metadata/RUNBOOK_4_5_METADATA.md:L33-L33) "- `PORT`: 3002"
  - Create the Export Service (port 3003) that generates DOCX files from LegalDocument format with proper legal formatting (Times New Roman 12pt, section numbering, page numbers). (Source: Metadata/RUNBOOK_4_5_METADATA.md:L168-L168) "Create the Export Service (port 3003) that generates DOCX files from LegalDocument format with proper legal formatting (Times New Roman 12pt, section numbering, page numbers)."
  - - Service: `export-service` (port 3003) (Source: Metadata/RUNBOOK_4_5_METADATA.md:L173-L173) "- Service: `export-service` (port 3003)"
  - - `PORT`: 3003 (Source: Metadata/RUNBOOK_4_5_METADATA.md:L194-L194) "- `PORT`: 3003"
  - - Handle complex formatting (lists, indentation) (Source: Metadata/RUNBOOK_4_5_METADATA.md:L341-L341) "- Handle complex formatting (lists, indentation)"
- Filesystem paths/formats
  - requirements.txt (Source: Metadata/RUNBOOK_4_5_METADATA.md:L22-L22) "- File: `services/ingestion-service/requirements.txt` (dependencies)"
  - sample.docx (Source: Metadata/RUNBOOK_4_5_METADATA.md:L128-L128) "- Command: `curl -X POST http://localhost:3002/ingest -F "file=@sample.docx"`"
  - requirements.txt (Source: Metadata/RUNBOOK_4_5_METADATA.md:L183-L183) "- File: `services/export-service/requirements.txt` (dependencies)"
  - legaldoc.json (Source: Metadata/RUNBOOK_4_5_METADATA.md:L263-L263) "- Command: `curl -X POST http://localhost:3003/export -d @legaldoc.json`"
- Process lifecycle (if any)
  - **Parsing Pipeline (3 Stages):**  1. **Stage 1: Deterministic Parsing (No LLM)**    - Input: DOCX file bytes    - Process: python-docx + lxml parsing, nupunkt sentence detection    - Output: Candidate LegalDocument with ~85% accurate sentence boundaries    - Accuracy: High for simple cases, lower for legal citations/abbreviations    - Cost: $0 (no API calls)  2. **Stage 2: LLM-Assisted Refinement (Anthropic API)**    - Input: Ambiguous sentence boundaries (confidence <0.9 from Stage 1)    - Process: Send paragraph + candidates to Claude, ask for corrections    - Output: Refined sentence boundaries with LLM confidence scores    - Accuracy: ~95% (improves ambiguous cases)    - Cost: ~$0.01 per complex paragraph    - Fallback: If LLM confidence <0.7, keep Stage 1 result  3. **Stage 3: Validation & Output**    - Input: Parsed LegalDocument from Stage 1/2    - Process: Validate invariants (substring check, no overlaps, all text covered)    - Output: Valid LegalDocument or error    - Hard Failures: Invariant violations (text corruption, missing coverage)

## Contracts Defined or Used
- REST POST /ingest (Source: Metadata/RUNBOOK_4_5_METADATA.md:L49-L49) "- From: Records Service/Renderer → To: Ingestion Service → **POST /ingest**"
- REST GET /health (Source: Metadata/RUNBOOK_4_5_METADATA.md:L56-L56) "- From: ANY → To: Ingestion Service → **GET /health**"
- REST POST /export (Source: Metadata/RUNBOOK_4_5_METADATA.md:L206-L206) "- From: Records Service/Renderer → To: Export Service → **POST /export**"
- REST GET /health (Source: Metadata/RUNBOOK_4_5_METADATA.md:L213-L213) "- From: ANY → To: Export Service → **GET /health**"
- IPC Create the Ingestion Service (port 3002) that parses DOCX files into LegalDocument format using deterministic parsing + LLM-assisted sentence splitting fallback. (Source: Metadata/RUNBOOK_4_5_METADATA.md:L6-L6) "Create the Ingestion Service (port 3002) that parses DOCX files into LegalDocument format using deterministic parsing + LLM-assisted sentence splitting fallback."
- IPC - Service: `ingestion-service` (port 3002) (Source: Metadata/RUNBOOK_4_5_METADATA.md:L11-L11) "- Service: `ingestion-service` (port 3002)"
- IPC - `PORT`: 3002 (Source: Metadata/RUNBOOK_4_5_METADATA.md:L33-L33) "- `PORT`: 3002"
- IPC Create the Export Service (port 3003) that generates DOCX files from LegalDocument format with proper legal formatting (Times New Roman 12pt, section numbering, page numbers). (Source: Metadata/RUNBOOK_4_5_METADATA.md:L168-L168) "Create the Export Service (port 3003) that generates DOCX files from LegalDocument format with proper legal formatting (Times New Roman 12pt, section numbering, page numbers)."
- IPC - Service: `export-service` (port 3003) (Source: Metadata/RUNBOOK_4_5_METADATA.md:L173-L173) "- Service: `export-service` (port 3003)"
- IPC - `PORT`: 3003 (Source: Metadata/RUNBOOK_4_5_METADATA.md:L194-L194) "- `PORT`: 3003"
- IPC - Handle complex formatting (lists, indentation) (Source: Metadata/RUNBOOK_4_5_METADATA.md:L341-L341) "- Handle complex formatting (lists, indentation)"
- Schema LegalDocument (Source: Metadata/RUNBOOK_4_5_METADATA.md:L6-L6) "Create the Ingestion Service (port 3002) that parses DOCX files into LegalDocument format using deterministic parsing + LLM-assisted sentence splitting fallback."
- Schema LegalDocument (Source: Metadata/RUNBOOK_4_5_METADATA.md:L30-L30) "- Runbook 1: LegalDocument types (for output validation)"
- Schema LegalDocument (Source: Metadata/RUNBOOK_4_5_METADATA.md:L51-L51) "- Response: `LegalDocument` (parsed document)"
- Schema LegalDocument (Source: Metadata/RUNBOOK_4_5_METADATA.md:L75-L75) "- Output: Candidate LegalDocument with ~85% accurate sentence boundaries"
- Schema LegalDocument (Source: Metadata/RUNBOOK_4_5_METADATA.md:L88-L88) "- Input: Parsed LegalDocument from Stage 1/2"
- Schema LegalDocument (Source: Metadata/RUNBOOK_4_5_METADATA.md:L90-L90) "- Output: Valid LegalDocument or error"
- Schema LegalDocument (Source: Metadata/RUNBOOK_4_5_METADATA.md:L129-L129) "- Expected: 200 OK + LegalDocument JSON with sections, paragraphs, sentences"
- Schema LegalDocument (Source: Metadata/RUNBOOK_4_5_METADATA.md:L168-L168) "Create the Export Service (port 3003) that generates DOCX files from LegalDocument format with proper legal formatting (Times New Roman 12pt, section numbering, page numbers)."
- Schema LegalDocument (Source: Metadata/RUNBOOK_4_5_METADATA.md:L191-L191) "- Runbook 1: LegalDocument types (for input validation)"
- Schema LegalDocument (Source: Metadata/RUNBOOK_4_5_METADATA.md:L207-L207) "- Request: `LegalDocument` JSON"
- Schema LegalDocument (Source: Metadata/RUNBOOK_4_5_METADATA.md:L209-L209) "- Purpose: Generate formatted DOCX from LegalDocument"
- Schema LegalDocument (Source: Metadata/RUNBOOK_4_5_METADATA.md:L230-L230) "- Rule: Every paragraph.text in LegalDocument appears in DOCX"
- Schema LegalDocument (Source: Metadata/RUNBOOK_4_5_METADATA.md:L237-L237) "- INVARIANT: Section numbering matches LegalDocument structure"
- Schema LegalDocument (Source: Metadata/RUNBOOK_4_5_METADATA.md:L238-L238) "- Rule: Section.number in LegalDocument matches numbering in DOCX"
- Schema LegalDocument (Source: Metadata/RUNBOOK_4_5_METADATA.md:L327-L327) "- Output valid LegalDocument or error (no partial success)"
- Schema LegalDocument (Source: Metadata/RUNBOOK_4_5_METADATA.md:L332-L332) "- Start with simple: LegalDocument → DOCX with plain text"
- Schema LegalDocument (Source: Metadata/RUNBOOK_4_5_METADATA.md:L352-L352) "- **Text preservation (HARD):** All section text in LegalDocument appears in DOCX"
- Schema LegalDocument (Source: Metadata/RUNBOOK_4_5_METADATA.md:L353-L353) "- **Section numbering (HARD):** DOCX numbering matches LegalDocument structure"
- Schema LegalDocument (Source: Metadata/RUNBOOK_4_5_METADATA.md:L375-L375) "- [ ] Section numbering matches LegalDocument"
- File requirements.txt (Source: Metadata/RUNBOOK_4_5_METADATA.md:L22-L22) "- File: `services/ingestion-service/requirements.txt` (dependencies)"
- File sample.docx (Source: Metadata/RUNBOOK_4_5_METADATA.md:L128-L128) "- Command: `curl -X POST http://localhost:3002/ingest -F "file=@sample.docx"`"
- File requirements.txt (Source: Metadata/RUNBOOK_4_5_METADATA.md:L183-L183) "- File: `services/export-service/requirements.txt` (dependencies)"
- File legaldoc.json (Source: Metadata/RUNBOOK_4_5_METADATA.md:L263-L263) "- Command: `curl -X POST http://localhost:3003/export -d @legaldoc.json`"

## Invariants Relied On
- - Hard Failures: Invariant violations (text corruption, missing coverage) (Source: Metadata/RUNBOOK_4_5_METADATA.md:L91-L91) "- Hard Failures: Invariant violations (text corruption, missing coverage)"
- - INVARIANT: Sentence text is exact substring of paragraph (Source: Metadata/RUNBOOK_4_5_METADATA.md:L97-L97) "- INVARIANT: Sentence text is exact substring of paragraph"
- - INVARIANT: All paragraph characters assigned to sentences (Source: Metadata/RUNBOOK_4_5_METADATA.md:L104-L104) "- INVARIANT: All paragraph characters assigned to sentences"
- - INVARIANT: All section text appears in output DOCX (Source: Metadata/RUNBOOK_4_5_METADATA.md:L229-L229) "- INVARIANT: All section text appears in output DOCX"
- - INVARIANT: Section numbering matches LegalDocument structure (Source: Metadata/RUNBOOK_4_5_METADATA.md:L237-L237) "- INVARIANT: Section numbering matches LegalDocument structure"
- - INVARIANT: Generated DOCX is valid format (Source: Metadata/RUNBOOK_4_5_METADATA.md:L245-L245) "- INVARIANT: Generated DOCX is valid format"
- - Validate LLM output (ensure substring invariant) (Source: Metadata/RUNBOOK_4_5_METADATA.md:L322-L322) "- Validate LLM output (ensure substring invariant)"
- 1. **Don't skip substring validation:** This is the sentinel invariant - enforce it (Source: Metadata/RUNBOOK_4_5_METADATA.md:L357-L357) "1. **Don't skip substring validation:** This is the sentinel invariant - enforce it"
- - [ ] Substring invariant enforced (hard failure if violated) (Source: Metadata/RUNBOOK_4_5_METADATA.md:L367-L367) "- [ ] Substring invariant enforced (hard failure if violated)"

## Verification Gate (Commands + Expected Outputs)
- - Purpose: Verify file upload and parsing works (Source: Metadata/RUNBOOK_4_5_METADATA.md:L130-L130) "- Purpose: Verify file upload and parsing works"
- - Purpose: Verify deterministic parser handles common abbreviations (Source: Metadata/RUNBOOK_4_5_METADATA.md:L135-L135) "- Purpose: Verify deterministic parser handles common abbreviations"
- - Purpose: Verify LLM integration works (Source: Metadata/RUNBOOK_4_5_METADATA.md:L140-L140) "- Purpose: Verify LLM integration works"
- - Purpose: Verify export pipeline works (Source: Metadata/RUNBOOK_4_5_METADATA.md:L265-L265) "- Purpose: Verify export pipeline works"
- - Purpose: Verify format compliance (Source: Metadata/RUNBOOK_4_5_METADATA.md:L270-L270) "- Purpose: Verify format compliance"
- - Purpose: Verify style application (Source: Metadata/RUNBOOK_4_5_METADATA.md:L275-L275) "- Purpose: Verify style application"
- - Verify all section text appears in output (no text loss) (Source: Metadata/RUNBOOK_4_5_METADATA.md:L333-L333) "- Verify all section text appears in output (no text loss)"

## Risks / Unknowns (TODOs)
- - **Risk:** LLM API rate limits during bulk processing (Source: Metadata/RUNBOOK_4_5_METADATA.md:L146-L146) "- **Risk:** LLM API rate limits during bulk processing"
- - **Risk:** DOCX parsing fails for complex formatting (Source: Metadata/RUNBOOK_4_5_METADATA.md:L151-L151) "- **Risk:** DOCX parsing fails for complex formatting"
- - **Risk:** High LLM API costs for document-heavy users (Source: Metadata/RUNBOOK_4_5_METADATA.md:L158-L158) "- **Risk:** High LLM API costs for document-heavy users"
- - **Risk:** Large documents (200+ pages) timeout (Source: Metadata/RUNBOOK_4_5_METADATA.md:L281-L281) "- **Risk:** Large documents (200+ pages) timeout"
- - **Risk:** Complex formatting breaks DOCX structure (Source: Metadata/RUNBOOK_4_5_METADATA.md:L286-L286) "- **Risk:** Complex formatting breaks DOCX structure"
- - **Risk:** Text loss during generation (Source: Metadata/RUNBOOK_4_5_METADATA.md:L293-L293) "- **Risk:** Text loss during generation"
