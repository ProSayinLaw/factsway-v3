## Purpose
UNSPECIFIED
TODO: Provide details (04_RUNBOOK_04_INGESTION_SERVICE.md:L1-L1183)

## Produces (Artifacts)
UNSPECIFIED
TODO: Provide details (04_RUNBOOK_04_INGESTION_SERVICE.md:L1-L1183)

## Consumes (Prereqs)
UNSPECIFIED
TODO: Provide details (04_RUNBOOK_04_INGESTION_SERVICE.md:L1-L1183)

## Interfaces Touched
- REST endpoints
  - POST /ingest (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L17-L17) "- ✅ Accepts DOCX upload via POST /ingest"
  - POST /ingest (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1130-L1130) "- [ ] POST /ingest accepts DOCX upload"
- IPC channels/events (if any)
  - - ✅ Service runs on port 3002 (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L16-L16) "- ✅ Service runs on port 3002"
  - - ✅ FastAPI service on port 3002 (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L65-L65) "- ✅ FastAPI service on port 3002"
  - "port": 3002, (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L216-L216) ""port": 3002,"
  - port=3002, (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L288-L288) "port=3002,"
  - parent_section_id=None,  # TODO: Handle nesting (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L529-L529) "parent_section_id=None, # TODO: Handle nesting"
  - - [ ] Python/FastAPI service on port 3002 (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1114-L1114) "- [ ] Python/FastAPI service on port 3002"
  - ✅ Service runs on port 3002 (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1149-L1149) "✅ Service runs on port 3002"
- Filesystem paths/formats
  - requirements.txt (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L108-L108) "# ├── requirements.txt"
  - requirements.txt (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L115-L115) "### 1.2 Create requirements.txt"
  - requirements.txt (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L117-L117) "**File:** `services/ingestion-service/requirements.txt`"
  - sample_motion.docx (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1023-L1023) "**File:** `services/ingestion-service/tests/fixtures/sample_motion.docx`"
  - sample_motion.docx (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1056-L1056) "docx_path = Path(__file__).parent.parent / "fixtures" / "sample_motion.docx""
  - sample_motion.docx (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1059-L1059) "files = {"file": ("sample_motion.docx", f, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}"
  - response.json (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1063-L1063) "data = response.json()"
  - test.txt (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1090-L1090) "files = {"file": ("test.txt", b"not a docx", "text/plain")}"
  - response.json (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1094-L1094) "assert "must be a .docx" in response.json()["detail"]"
  - response.json (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1104-L1104) "data = response.json()"
- Process lifecycle (if any)
  - UNSPECIFIED
  - TODO: Document process lifecycle (04_RUNBOOK_04_INGESTION_SERVICE.md:L1-L1183)

## Contracts Defined or Used
- REST POST /ingest (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L17-L17) "- ✅ Accepts DOCX upload via POST /ingest"
- REST POST /ingest (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1130-L1130) "- [ ] POST /ingest accepts DOCX upload"
- IPC - ✅ Service runs on port 3002 (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L16-L16) "- ✅ Service runs on port 3002"
- IPC - ✅ FastAPI service on port 3002 (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L65-L65) "- ✅ FastAPI service on port 3002"
- IPC "port": 3002, (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L216-L216) ""port": 3002,"
- IPC port=3002, (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L288-L288) "port=3002,"
- IPC parent_section_id=None,  # TODO: Handle nesting (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L529-L529) "parent_section_id=None, # TODO: Handle nesting"
- IPC - [ ] Python/FastAPI service on port 3002 (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1114-L1114) "- [ ] Python/FastAPI service on port 3002"
- IPC ✅ Service runs on port 3002 (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1149-L1149) "✅ Service runs on port 3002"
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1-L1) "# Runbook 4: Ingestion Service - DOCX → LegalDocument Parser"
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L13-L13) "Create the **Ingestion Service** - Python/FastAPI microservice that parses DOCX files and outputs LegalDocument format."
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L21-L21) "- ✅ Returns valid LegalDocument (Section 4 format)"
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L30-L30) "- **Section 4:** LegalDocument Schema (output format)"
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L50-L50) "> "The Ingestion Service outputs LegalDocument format exclusively. All parsing logic is deterministic and preserves enough metadata for perfect round-trip export.""
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L57-L57) "- ✅ `@factsway/shared-types` with LegalDocument types (Runbook 1)"
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L71-L71) "- ✅ LegalDocument output conformance"
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L181-L181) "from app.models.legal_document import LegalDocument"
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L193-L193) "description="DOCX parsing service that outputs LegalDocument format","
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L220-L220) "@app.post("/ingest", response_model=LegalDocument)"
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L223-L223) "Ingest a DOCX file and return LegalDocument format."
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L229-L229) "LegalDocument: Parsed document in canonical format"
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L251-L251) "# Parse DOCX to LegalDocument"
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L298-L298) "### 2.1 LegalDocument Model"
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L407-L407) "class LegalDocument(BaseModel):"
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L408-L408) """"Complete LegalDocument (Section 4.2 from Runbook 0)""""
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L446-L446) "LegalDocument, DocumentMeta, DocumentBody, Section, Paragraph,"
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L456-L456) """"Parse DOCX files into LegalDocument format""""
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L463-L463) "def parse(self, docx_path: str) -> LegalDocument:"
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L465-L465) "Parse a DOCX file into LegalDocument format."
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L471-L471) "LegalDocument: Parsed document"
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L495-L495) "# Build LegalDocument"
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L496-L496) "legal_doc = LegalDocument("
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L980-L980) "from app.models.legal_document import LegalDocument"
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L992-L992) "def process_docx(self, docx_path: str) -> LegalDocument:"
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L994-L994) "Process a DOCX file into LegalDocument format."
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1000-L1000) "LegalDocument: Parsed document"
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1065-L1065) "# Verify LegalDocument structure"
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1120-L1120) "### 6.2 LegalDocument Output"
- Schema schema (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1121-L1121) "- [ ] Conforms to Section 4 schema"
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1131-L1131) "- [ ] Returns LegalDocument JSON"
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1151-L1151) "✅ Returns valid LegalDocument"
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1169-L1169) "5. **Proceed to Runbook 5:** Export Service (LegalDocument → DOCX)"
- Schema LegalDocument (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1175-L1175) "- **Runbook 0 Section 4:** LegalDocument Schema (output format)"
- File requirements.txt (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L108-L108) "# ├── requirements.txt"
- File requirements.txt (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L115-L115) "### 1.2 Create requirements.txt"
- File requirements.txt (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L117-L117) "**File:** `services/ingestion-service/requirements.txt`"
- File sample_motion.docx (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1023-L1023) "**File:** `services/ingestion-service/tests/fixtures/sample_motion.docx`"
- File sample_motion.docx (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1056-L1056) "docx_path = Path(__file__).parent.parent / "fixtures" / "sample_motion.docx""
- File sample_motion.docx (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1059-L1059) "files = {"file": ("sample_motion.docx", f, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}"
- File response.json (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1063-L1063) "data = response.json()"
- File test.txt (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1090-L1090) "files = {"file": ("test.txt", b"not a docx", "text/plain")}"
- File response.json (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1094-L1094) "assert "must be a .docx" in response.json()["detail"]"
- File response.json (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1104-L1104) "data = response.json()"

## Invariants Relied On
UNSPECIFIED
TODO: Add invariants (04_RUNBOOK_04_INGESTION_SERVICE.md:L1-L1183)

## Verification Gate (Commands + Expected Outputs)
- pytest==7.4.3 (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L130-L130) "pytest==7.4.3"
- pytest-asyncio==0.21.1 (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L131-L131) "pytest-asyncio==0.21.1"
- [tool.pytest.ini_options] (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L145-L145) "[tool.pytest.ini_options]"
- import pytest (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1044-L1044) "import pytest"
- @pytest.mark.asyncio (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1051-L1051) "@pytest.mark.asyncio"
- # Verify LegalDocument structure (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1065-L1065) "# Verify LegalDocument structure"
- # Verify metadata (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1070-L1070) "# Verify metadata"
- # Verify body has sections (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1074-L1074) "# Verify body has sections"
- # Verify sections have paragraphs (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1077-L1077) "# Verify sections have paragraphs"
- # Verify paragraphs have sentences (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1081-L1081) "# Verify paragraphs have sentences"
- @pytest.mark.asyncio (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1086-L1086) "@pytest.mark.asyncio"
- @pytest.mark.asyncio (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1097-L1097) "@pytest.mark.asyncio"
- 4. **Run tests:** `pytest` (Source: 04_RUNBOOK_04_INGESTION_SERVICE.md:L1168-L1168) "4. **Run tests:** `pytest`"

## Risks / Unknowns (TODOs)
UNSPECIFIED
TODO: Document risks (04_RUNBOOK_04_INGESTION_SERVICE.md:L1-L1183)
