## Purpose
UNSPECIFIED
TODO: Provide details (06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L1-L1020)

## Produces (Artifacts)
UNSPECIFIED
TODO: Provide details (06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L1-L1020)

## Consumes (Prereqs)
UNSPECIFIED
TODO: Provide details (06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L1-L1020)

## Interfaces Touched
- REST endpoints
  - POST /api/citations/parse (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L332-L332) "// POST /api/citations/parse - Parse citation text"
  - POST /api/citations/validate (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L353-L353) "// POST /api/citations/validate - Validate citation"
  - POST /api/evidence (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L539-L539) "// POST /api/evidence - Upload evidence file"
  - GET /api/evidence/:id (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L561-L561) "// GET /api/evidence/:id - Get evidence file"
  - DELETE /api/evidence/:id (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L576-L576) "// DELETE /api/evidence/:id - Delete evidence"
  - POST /api/citations/parse (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L948-L948) "- [ ] POST /api/citations/parse works"
  - POST /api/citations/validate (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L949-L949) "- [ ] POST /api/citations/validate works"
  - POST /api/evidence (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L956-L956) "- [ ] POST /api/evidence uploads files"
  - GET /api/evidence/:id (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L957-L957) "- [ ] GET /api/evidence/:id retrieves files"
  - DELETE /api/evidence/:id (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L958-L958) "- [ ] DELETE /api/evidence/:id deletes files"
  - POST /analyze (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L969-L969) "- [ ] POST /analyze returns metrics"
- IPC channels/events (if any)
  - 1. **Citation Service** (port 3004) - Citation parsing and validation (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L16-L16) "1. **Citation Service** (port 3004) - Citation parsing and validation"
  - 2. **Evidence Service** (port 3005) - Evidence/exhibit management (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L17-L17) "2. **Evidence Service** (port 3005) - Evidence/exhibit management"
  - 3. **Template Service** (port 3006) - Template management and filling (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L18-L18) "3. **Template Service** (port 3006) - Template management and filling"
  - 4. **Analysis Service** (port 3007) - Document analysis and metrics (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L19-L19) "4. **Analysis Service** (port 3007) - Document analysis and metrics"
  - ## Service 1: Citation Service (Port 3004) (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L77-L77) "## Service 1: Citation Service (Port 3004)"
  - const PORT = process.env.PORT || 3004; (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L149-L149) "const PORT = process.env.PORT || 3004;"
  - port: PORT, (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L163-L163) "port: PORT,"
  - const server = app.listen(PORT, () => { (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L174-L174) "const server = app.listen(PORT, () => {"
  - console.log(`✓ Citation Service running on port ${PORT}`); (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L175-L175) "console.log(`✓ Citation Service running on port ${PORT}`);"
  - ## Service 2: Evidence Service (Port 3005) (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L387-L387) "## Service 2: Evidence Service (Port 3005)"
  - **Port:** 3005 (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L409-L409) "**Port:** 3005"
  - ## Service 3: Template Service (Port 3006) (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L597-L597) "## Service 3: Template Service (Port 3006)"
  - **Action:** CREATE TypeScript service (port 3006) (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L603-L603) "**Action:** CREATE TypeScript service (port 3006)"
  - ## Service 4: Analysis Service (Port 3007) (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L704-L704) "## Service 4: Analysis Service (Port 3007)"
  - **Action:** CREATE Python service (port 3007) (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L710-L710) "**Action:** CREATE Python service (port 3007)"
  - "port": 3007, (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L760-L760) ""port": 3007,"
  - port=3007, (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L805-L805) "port=3007,"
  - - [ ] Service runs on port 3004 (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L947-L947) "- [ ] Service runs on port 3004"
  - - [ ] Service runs on port 3005 (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L955-L955) "- [ ] Service runs on port 3005"
  - - [ ] Service runs on port 3006 (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L962-L962) "- [ ] Service runs on port 3006"
  - - [ ] Service runs on port 3007 (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L968-L968) "- [ ] Service runs on port 3007"
  - - Citation: `npm run dev` (port 3004) (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L997-L997) "- Citation: `npm run dev` (port 3004)"
  - - Evidence: `npm run dev` (port 3005) (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L998-L998) "- Evidence: `npm run dev` (port 3005)"
  - - Template: `npm run dev` (port 3006) (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L999-L999) "- Template: `npm run dev` (port 3006)"
  - - Analysis: `python main.py` (port 3007) (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L1000-L1000) "- Analysis: `python main.py` (port 3007)"
- Filesystem paths/formats
  - package.json (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L94-L94) "**File:** `services/citation-service/package.json`"
  - express.json (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L155-L155) "app.use(express.json());"
  - res.json (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L160-L160) "res.json({"
  - res.json (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L346-L346) "res.json({ data: parsed });"
  - res.json (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L367-L367) "res.json({"
  - res.json (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L585-L585) "res.json({ message: 'Evidence deleted successfully' });"
- Process lifecycle (if any)
  - UNSPECIFIED
  - TODO: Document process lifecycle (06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L1-L1020)

## Contracts Defined or Used
- REST POST /api/citations/parse (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L332-L332) "// POST /api/citations/parse - Parse citation text"
- REST POST /api/citations/validate (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L353-L353) "// POST /api/citations/validate - Validate citation"
- REST POST /api/evidence (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L539-L539) "// POST /api/evidence - Upload evidence file"
- REST GET /api/evidence/:id (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L561-L561) "// GET /api/evidence/:id - Get evidence file"
- REST DELETE /api/evidence/:id (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L576-L576) "// DELETE /api/evidence/:id - Delete evidence"
- REST POST /api/citations/parse (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L948-L948) "- [ ] POST /api/citations/parse works"
- REST POST /api/citations/validate (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L949-L949) "- [ ] POST /api/citations/validate works"
- REST POST /api/evidence (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L956-L956) "- [ ] POST /api/evidence uploads files"
- REST GET /api/evidence/:id (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L957-L957) "- [ ] GET /api/evidence/:id retrieves files"
- REST DELETE /api/evidence/:id (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L958-L958) "- [ ] DELETE /api/evidence/:id deletes files"
- REST POST /analyze (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L969-L969) "- [ ] POST /analyze returns metrics"
- IPC 1. **Citation Service** (port 3004) - Citation parsing and validation (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L16-L16) "1. **Citation Service** (port 3004) - Citation parsing and validation"
- IPC 2. **Evidence Service** (port 3005) - Evidence/exhibit management (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L17-L17) "2. **Evidence Service** (port 3005) - Evidence/exhibit management"
- IPC 3. **Template Service** (port 3006) - Template management and filling (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L18-L18) "3. **Template Service** (port 3006) - Template management and filling"
- IPC 4. **Analysis Service** (port 3007) - Document analysis and metrics (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L19-L19) "4. **Analysis Service** (port 3007) - Document analysis and metrics"
- IPC ## Service 1: Citation Service (Port 3004) (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L77-L77) "## Service 1: Citation Service (Port 3004)"
- IPC const PORT = process.env.PORT || 3004; (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L149-L149) "const PORT = process.env.PORT || 3004;"
- IPC port: PORT, (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L163-L163) "port: PORT,"
- IPC const server = app.listen(PORT, () => { (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L174-L174) "const server = app.listen(PORT, () => {"
- IPC console.log(`✓ Citation Service running on port ${PORT}`); (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L175-L175) "console.log(`✓ Citation Service running on port ${PORT}`);"
- IPC ## Service 2: Evidence Service (Port 3005) (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L387-L387) "## Service 2: Evidence Service (Port 3005)"
- IPC **Port:** 3005 (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L409-L409) "**Port:** 3005"
- IPC ## Service 3: Template Service (Port 3006) (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L597-L597) "## Service 3: Template Service (Port 3006)"
- IPC **Action:** CREATE TypeScript service (port 3006) (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L603-L603) "**Action:** CREATE TypeScript service (port 3006)"
- IPC ## Service 4: Analysis Service (Port 3007) (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L704-L704) "## Service 4: Analysis Service (Port 3007)"
- IPC **Action:** CREATE Python service (port 3007) (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L710-L710) "**Action:** CREATE Python service (port 3007)"
- IPC "port": 3007, (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L760-L760) ""port": 3007,"
- IPC port=3007, (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L805-L805) "port=3007,"
- IPC - [ ] Service runs on port 3004 (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L947-L947) "- [ ] Service runs on port 3004"
- IPC - [ ] Service runs on port 3005 (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L955-L955) "- [ ] Service runs on port 3005"
- IPC - [ ] Service runs on port 3006 (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L962-L962) "- [ ] Service runs on port 3006"
- IPC - [ ] Service runs on port 3007 (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L968-L968) "- [ ] Service runs on port 3007"
- IPC - Citation: `npm run dev` (port 3004) (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L997-L997) "- Citation: `npm run dev` (port 3004)"
- IPC - Evidence: `npm run dev` (port 3005) (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L998-L998) "- Evidence: `npm run dev` (port 3005)"
- IPC - Template: `npm run dev` (port 3006) (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L999-L999) "- Template: `npm run dev` (port 3006)"
- IPC - Analysis: `python main.py` (port 3007) (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L1000-L1000) "- Analysis: `python main.py` (port 3007)"
- Schema LegalDocument (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L25-L25) "- ✅ Uses LegalDocument format (Runbook 1)"
- Schema interface ParsedCitation (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L191-L191) "export interface ParsedCitation {"
- Schema interface Evidence (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L425-L425) "export interface Evidence {"
- Schema LegalDocument (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L615-L615) "import { LegalDocument } from '@factsway/shared-types';"
- Schema interface TemplateVariables (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L617-L617) "export interface TemplateVariables {"
- Schema LegalDocument (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L623-L623) "* Fill template variables in a LegalDocument"
- Schema LegalDocument (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L626-L626) "template: LegalDocument,"
- Schema LegalDocument (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L628-L628) "): LegalDocument {"
- Schema LegalDocument (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L673-L673) "extractVariables(template: LegalDocument): string[] {"
- Schema LegalDocument (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L733-L733) "from app.models.legal_document import LegalDocument"
- Schema LegalDocument (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L765-L765) "async def analyze_document(legal_document: LegalDocument):"
- Schema LegalDocument (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L820-L820) "from app.models.legal_document import LegalDocument"
- Schema LegalDocument (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L828-L828) "def analyze(self, legal_doc: LegalDocument) -> Dict[str, Any]:"
- Schema LegalDocument (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L833-L833) "legal_doc: LegalDocument to analyze"
- Schema LegalDocument (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L849-L849) "def _count_words(self, legal_doc: LegalDocument) -> int:"
- Schema LegalDocument (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L858-L858) "def _count_sentences(self, legal_doc: LegalDocument) -> int:"
- Schema LegalDocument (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L866-L866) "def _count_paragraphs(self, legal_doc: LegalDocument) -> int:"
- Schema LegalDocument (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L873-L873) "def _avg_sentence_length(self, legal_doc: LegalDocument) -> float:"
- Schema LegalDocument (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L890-L890) "def _calculate_readability(self, legal_doc: LegalDocument) -> Dict[str, float]:"
- Schema LegalDocument (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L917-L917) "def _analyze_sections(self, legal_doc: LegalDocument) -> list:"
- Schema LegalDocument (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L965-L965) "- [ ] Preserves LegalDocument structure"
- File package.json (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L94-L94) "**File:** `services/citation-service/package.json`"
- File express.json (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L155-L155) "app.use(express.json());"
- File res.json (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L160-L160) "res.json({"
- File res.json (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L346-L346) "res.json({ data: parsed });"
- File res.json (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L367-L367) "res.json({"
- File res.json (Source: 06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L585-L585) "res.json({ message: 'Evidence deleted successfully' });"

## Invariants Relied On
UNSPECIFIED
TODO: Add invariants (06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L1-L1020)

## Verification Gate (Commands + Expected Outputs)
UNSPECIFIED
TODO: Define verification gate (06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L1-L1020)

## Risks / Unknowns (TODOs)
UNSPECIFIED
TODO: Document risks (06_RUNBOOK_06_SPECIALIZED_SERVICES.md:L1-L1020)
