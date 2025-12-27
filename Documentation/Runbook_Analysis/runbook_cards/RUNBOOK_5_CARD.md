## Purpose
UNSPECIFIED
TODO: Provide details (05_RUNBOOK_05_EXPORT_SERVICE.md:L1-L993)

## Produces (Artifacts)
UNSPECIFIED
TODO: Provide details (05_RUNBOOK_05_EXPORT_SERVICE.md:L1-L993)

## Consumes (Prereqs)
UNSPECIFIED
TODO: Provide details (05_RUNBOOK_05_EXPORT_SERVICE.md:L1-L993)

## Interfaces Touched
- REST endpoints
  - POST /export (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L17-L17) "- ✅ Accepts LegalDocument JSON via POST /export"
  - POST /export (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L927-L927) "- [ ] POST /export accepts LegalDocument JSON"
- IPC channels/events (if any)
  - - ✅ Service runs on port 3003 (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L16-L16) "- ✅ Service runs on port 3003"
  - - ✅ FastAPI service on port 3003 (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L62-L62) "- ✅ FastAPI service on port 3003"
  - "port": 3003, (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L186-L186) ""port": 3003,"
  - port=3003, (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L250-L250) "port=3003,"
  - - [ ] Python/FastAPI service on port 3003 (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L921-L921) "- [ ] Python/FastAPI service on port 3003"
  - ✅ Service runs on port 3003 (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L959-L959) "✅ Service runs on port 3003"
- Filesystem paths/formats
  - requirements.txt (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L104-L104) "# ├── requirements.txt"
  - requirements.txt (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L111-L111) "### 1.2 Create requirements.txt"
  - requirements.txt (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L113-L113) "**File:** `services/export-service/requirements.txt`"
  - response.json (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L911-L911) "data = response.json()"
- Process lifecycle (if any)
  - UNSPECIFIED
  - TODO: Document process lifecycle (05_RUNBOOK_05_EXPORT_SERVICE.md:L1-L993)

## Contracts Defined or Used
- REST POST /export (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L17-L17) "- ✅ Accepts LegalDocument JSON via POST /export"
- REST POST /export (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L927-L927) "- [ ] POST /export accepts LegalDocument JSON"
- IPC - ✅ Service runs on port 3003 (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L16-L16) "- ✅ Service runs on port 3003"
- IPC - ✅ FastAPI service on port 3003 (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L62-L62) "- ✅ FastAPI service on port 3003"
- IPC "port": 3003, (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L186-L186) ""port": 3003,"
- IPC port=3003, (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L250-L250) "port=3003,"
- IPC - [ ] Python/FastAPI service on port 3003 (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L921-L921) "- [ ] Python/FastAPI service on port 3003"
- IPC ✅ Service runs on port 3003 (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L959-L959) "✅ Service runs on port 3003"
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L1-L1) "# Runbook 5: Export Service - LegalDocument → DOCX Converter"
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L13-L13) "Create the **Export Service** - Python/FastAPI microservice that converts LegalDocument format to DOCX with perfect round-trip fidelity."
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L17-L17) "- ✅ Accepts LegalDocument JSON via POST /export"
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L30-L30) "- **Section 4:** LegalDocument Schema (input format)"
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L36-L36) "- **Section 10.1:** LegalDocument → DOCX conversion"
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L47-L47) "> "Export must achieve perfect round-trip fidelity. If a document is ingested, then exported, then ingested again, the second LegalDocument must be structurally identical to..."
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L54-L54) "- ✅ Ingestion Service (Runbook 4) produces LegalDocument"
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L55-L55) "- ✅ LegalDocument schema defined (Runbook 0 Section 4)"
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L63-L63) "- ✅ LegalDocument → DOCX converter"
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L151-L151) "from app.models.legal_document import LegalDocument"
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L163-L163) "description="LegalDocument to DOCX export service with round-trip fidelity","
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L191-L191) "async def export_to_docx(legal_document: LegalDocument):"
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L193-L193) "Export LegalDocument to DOCX file."
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L196-L196) "legal_document: LegalDocument JSON"
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L260-L260) "### 2.1 LegalDocument Model"
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L291-L291) "LegalDocument, Section, Paragraph, FormatMark"
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L298-L298) """"Export LegalDocument to DOCX format""""
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L300-L300) "def export(self, legal_doc: LegalDocument, output_path: str) -> None:"
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L302-L302) "Export LegalDocument to DOCX file."
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L305-L305) "legal_doc: LegalDocument to export"
- Schema type separately (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L509-L509) "# Merge each type separately"
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L595-L595) "from app.models.legal_document import LegalDocument"
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L607-L607) "def export_to_docx(self, legal_doc: LegalDocument, output_path: str) -> None:"
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L609-L609) "Export LegalDocument to DOCX file."
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L612-L612) "legal_doc: LegalDocument to export"
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L648-L648) "LegalDocument, DocumentMeta, DocumentBody, Section, Paragraph,"
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L670-L670) """"Create a sample LegalDocument for testing""""
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L671-L671) "return LegalDocument("
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L848-L848) "LegalDocument, DocumentMeta, DocumentBody, Section, Paragraph, Sentence"
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L855-L855) "legal_doc = LegalDocument("
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L927-L927) "- [ ] POST /export accepts LegalDocument JSON"
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L951-L951) "- [ ] Uses Section 4 LegalDocument format as input"
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L960-L960) "✅ Accepts LegalDocument JSON"
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L976-L976) "3. **Test export:** POST LegalDocument JSON to /export"
- Schema LegalDocument (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L985-L985) "- **Runbook 0 Section 4:** LegalDocument Schema (input)"
- File requirements.txt (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L104-L104) "# ├── requirements.txt"
- File requirements.txt (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L111-L111) "### 1.2 Create requirements.txt"
- File requirements.txt (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L113-L113) "**File:** `services/export-service/requirements.txt`"
- File response.json (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L911-L911) "data = response.json()"

## Invariants Relied On
UNSPECIFIED
TODO: Add invariants (05_RUNBOOK_05_EXPORT_SERVICE.md:L1-L993)

## Verification Gate (Commands + Expected Outputs)
- pytest==7.4.3 (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L126-L126) "pytest==7.4.3"
- pytest-asyncio==0.21.1 (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L127-L127) "pytest-asyncio==0.21.1"
- import pytest (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L641-L641) "import pytest"
- @pytest.fixture (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L658-L658) "@pytest.fixture"
- @pytest.fixture (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L663-L663) "@pytest.fixture"
- @pytest.fixture (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L668-L668) "@pytest.fixture"
- # Verify file was created (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L757-L757) "# Verify file was created"
- # Verify structure is preserved (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L782-L782) "# Verify structure is preserved"
- import pytest (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L843-L843) "import pytest"
- @pytest.mark.asyncio (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L852-L852) "@pytest.mark.asyncio"
- @pytest.mark.asyncio (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L904-L904) "@pytest.mark.asyncio"
- 4. **Run tests:** `pytest` (Source: 05_RUNBOOK_05_EXPORT_SERVICE.md:L977-L977) "4. **Run tests:** `pytest`"

## Risks / Unknowns (TODOs)
UNSPECIFIED
TODO: Document risks (05_RUNBOOK_05_EXPORT_SERVICE.md:L1-L993)
