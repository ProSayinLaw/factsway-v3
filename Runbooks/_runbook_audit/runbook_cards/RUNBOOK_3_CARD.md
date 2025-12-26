## Purpose
UNSPECIFIED
TODO: Provide details (03_RUNBOOK_03_RECORDS_SERVICE.md:L1-L1050)

## Produces (Artifacts)
UNSPECIFIED
TODO: Provide details (03_RUNBOOK_03_RECORDS_SERVICE.md:L1-L1050)

## Consumes (Prereqs)
UNSPECIFIED
TODO: Provide details (03_RUNBOOK_03_RECORDS_SERVICE.md:L1-L1050)

## Interfaces Touched
- REST endpoints
  - GET /api/templates (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L469-L469) "// GET /api/templates - List all templates"
  - GET /api/templates/:id (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L509-L509) "// GET /api/templates/:id - Get template by ID"
  - POST /api/templates (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L535-L535) "// POST /api/templates - Create new template"
  - PUT /api/templates/:id (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L570-L570) "// PUT /api/templates/:id - Update template"
  - DELETE /api/templates/:id (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L602-L602) "// DELETE /api/templates/:id - Delete template"
  - POST /api/drafts (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L657-L657) "// POST /api/drafts - Create draft"
  - POST /api/templates (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L762-L762) "describe('POST /api/templates', () => {"
  - GET /api/templates (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L794-L794) "describe('GET /api/templates', () => {"
  - GET /api/templates/:id (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L824-L824) "describe('GET /api/templates/:id', () => {"
  - PUT /api/templates/:id (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L854-L854) "describe('PUT /api/templates/:id', () => {"
  - DELETE /api/templates/:id (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L880-L880) "describe('DELETE /api/templates/:id', () => {"
  - POST /templates (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L970-L970) "- [ ] POST /templates - Create template"
  - GET /templates (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L971-L971) "- [ ] GET /templates - List templates"
  - GET /templates/:id (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L972-L972) "- [ ] GET /templates/:id - Get template"
  - PUT /templates/:id (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L973-L973) "- [ ] PUT /templates/:id - Update template"
  - DELETE /templates/:id (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L974-L974) "- [ ] DELETE /templates/:id - Delete template"
  - POST /cases (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L975-L975) "- [ ] POST /cases - Create case"
  - GET /cases (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L976-L976) "- [ ] GET /cases - List cases"
  - GET /cases/:id (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L977-L977) "- [ ] GET /cases/:id - Get case"
  - PUT /cases/:id (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L978-L978) "- [ ] PUT /cases/:id - Update case"
  - DELETE /cases/:id (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L979-L979) "- [ ] DELETE /cases/:id - Delete case"
  - POST /drafts (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L980-L980) "- [ ] POST /drafts - Create draft"
  - GET /drafts (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L981-L981) "- [ ] GET /drafts - List drafts"
  - GET /drafts/:id (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L982-L982) "- [ ] GET /drafts/:id - Get draft"
  - PUT /drafts/:id (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L983-L983) "- [ ] PUT /drafts/:id - Update draft"
  - DELETE /drafts/:id (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L984-L984) "- [ ] DELETE /drafts/:id - Delete draft"
- IPC channels/events (if any)
  - - ✅ Service runs on port 3001 (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L16-L16) "- ✅ Service runs on port 3001"
  - - Records service: TypeScript/Node, port 3001 (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L30-L30) "- Records service: TypeScript/Node, port 3001"
  - - ✅ Express.js REST API on port 3001 (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L54-L54) "- ✅ Express.js REST API on port 3001"
  - const PORT = process.env.PORT || 3001; (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L217-L217) "const PORT = process.env.PORT || 3001;"
  - port: PORT, (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L235-L235) "port: PORT,"
  - const server = app.listen(PORT, () => { (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L248-L248) "const server = app.listen(PORT, () => {"
  - console.log(`✓ Records Service running on port ${PORT}`); (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L249-L249) "console.log(`✓ Records Service running on port ${PORT}`);"
  - console.log(`✓ Health check: http://localhost:${PORT}/health`); (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L251-L251) "console.log(`✓ Health check: http://localhost:${PORT}/health`);"
  - PORT=3001 (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L920-L920) "PORT=3001"
  - - [ ] Service starts on port 3001 (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L999-L999) "- [ ] Service starts on port 3001"
- Filesystem paths/formats
  - package.json (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L102-L102) "### 1.2 Create package.json"
  - package.json (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L104-L104) "**File:** `services/records-service/package.json`"
  - tsconfig.json (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L159-L159) "### 1.3 Create tsconfig.json"
  - tsconfig.json (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L161-L161) "**File:** `services/records-service/tsconfig.json`"
  - express.json (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L223-L223) "app.use(express.json({ limit: '10mb' }));"
  - res.json (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L232-L232) "res.json({"
  - res.json (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L430-L430) "res.json({"
  - res.json (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L499-L499) "res.json({"
  - res.json (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L528-L528) "res.json({ data: template });"
  - res.json (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L592-L592) "res.json({"
  - res.json (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L621-L621) "res.json({"
  - Package.json (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L965-L965) "- [ ] Package.json with correct dependencies"
- Process lifecycle (if any)
  - - [ ] Service starts on port 3001 - [ ] Health check endpoint (/health) - [ ] Graceful shutdown implemented - [ ] Logs startup and shutdown events

## Contracts Defined or Used
- REST GET /api/templates (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L469-L469) "// GET /api/templates - List all templates"
- REST GET /api/templates/:id (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L509-L509) "// GET /api/templates/:id - Get template by ID"
- REST POST /api/templates (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L535-L535) "// POST /api/templates - Create new template"
- REST PUT /api/templates/:id (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L570-L570) "// PUT /api/templates/:id - Update template"
- REST DELETE /api/templates/:id (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L602-L602) "// DELETE /api/templates/:id - Delete template"
- REST POST /api/drafts (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L657-L657) "// POST /api/drafts - Create draft"
- REST POST /api/templates (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L762-L762) "describe('POST /api/templates', () => {"
- REST GET /api/templates (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L794-L794) "describe('GET /api/templates', () => {"
- REST GET /api/templates/:id (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L824-L824) "describe('GET /api/templates/:id', () => {"
- REST PUT /api/templates/:id (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L854-L854) "describe('PUT /api/templates/:id', () => {"
- REST DELETE /api/templates/:id (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L880-L880) "describe('DELETE /api/templates/:id', () => {"
- REST POST /templates (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L970-L970) "- [ ] POST /templates - Create template"
- REST GET /templates (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L971-L971) "- [ ] GET /templates - List templates"
- REST GET /templates/:id (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L972-L972) "- [ ] GET /templates/:id - Get template"
- REST PUT /templates/:id (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L973-L973) "- [ ] PUT /templates/:id - Update template"
- REST DELETE /templates/:id (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L974-L974) "- [ ] DELETE /templates/:id - Delete template"
- REST POST /cases (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L975-L975) "- [ ] POST /cases - Create case"
- REST GET /cases (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L976-L976) "- [ ] GET /cases - List cases"
- REST GET /cases/:id (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L977-L977) "- [ ] GET /cases/:id - Get case"
- REST PUT /cases/:id (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L978-L978) "- [ ] PUT /cases/:id - Update case"
- REST DELETE /cases/:id (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L979-L979) "- [ ] DELETE /cases/:id - Delete case"
- REST POST /drafts (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L980-L980) "- [ ] POST /drafts - Create draft"
- REST GET /drafts (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L981-L981) "- [ ] GET /drafts - List drafts"
- REST GET /drafts/:id (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L982-L982) "- [ ] GET /drafts/:id - Get draft"
- REST PUT /drafts/:id (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L983-L983) "- [ ] PUT /drafts/:id - Update draft"
- REST DELETE /drafts/:id (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L984-L984) "- [ ] DELETE /drafts/:id - Delete draft"
- IPC - ✅ Service runs on port 3001 (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L16-L16) "- ✅ Service runs on port 3001"
- IPC - Records service: TypeScript/Node, port 3001 (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L30-L30) "- Records service: TypeScript/Node, port 3001"
- IPC - ✅ Express.js REST API on port 3001 (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L54-L54) "- ✅ Express.js REST API on port 3001"
- IPC const PORT = process.env.PORT || 3001; (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L217-L217) "const PORT = process.env.PORT || 3001;"
- IPC port: PORT, (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L235-L235) "port: PORT,"
- IPC const server = app.listen(PORT, () => { (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L248-L248) "const server = app.listen(PORT, () => {"
- IPC console.log(`✓ Records Service running on port ${PORT}`); (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L249-L249) "console.log(`✓ Records Service running on port ${PORT}`);"
- IPC console.log(`✓ Health check: http://localhost:${PORT}/health`); (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L251-L251) "console.log(`✓ Health check: http://localhost:${PORT}/health`);"
- IPC PORT=3001 (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L920-L920) "PORT=3001"
- IPC - [ ] Service starts on port 3001 (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L999-L999) "- [ ] Service starts on port 3001"
- Schema LegalDocument (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L19-L19) "- ✅ Returns LegalDocument format"
- Schema LegalDocument (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L46-L46) "- ✅ `@factsway/shared-types` with LegalDocument types (Runbook 1)"
- Schema interface ApiError (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L329-L329) "export interface ApiError extends Error {"
- Schema LegalDocument (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L736-L736) "import { LegalDocument } from '@factsway/shared-types';"
- Schema LegalDocument (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L747-L747) "const sampleDocument: LegalDocument = {"
- Schema LegalDocument (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L988-L988) "- [ ] Draft endpoints use LegalDocument format"
- Schema LegalDocument (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L1012-L1012) "- [ ] Uses Section 4 LegalDocument format"
- File package.json (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L102-L102) "### 1.2 Create package.json"
- File package.json (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L104-L104) "**File:** `services/records-service/package.json`"
- File tsconfig.json (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L159-L159) "### 1.3 Create tsconfig.json"
- File tsconfig.json (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L161-L161) "**File:** `services/records-service/tsconfig.json`"
- File express.json (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L223-L223) "app.use(express.json({ limit: '10mb' }));"
- File res.json (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L232-L232) "res.json({"
- File res.json (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L430-L430) "res.json({"
- File res.json (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L499-L499) "res.json({"
- File res.json (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L528-L528) "res.json({ data: template });"
- File res.json (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L592-L592) "res.json({"
- File res.json (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L621-L621) "res.json({"
- File Package.json (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L965-L965) "- [ ] Package.json with correct dependencies"

## Invariants Relied On
UNSPECIFIED
TODO: Add invariants (03_RUNBOOK_03_RECORDS_SERVICE.md:L1-L1050)

## Verification Gate (Commands + Expected Outputs)
- // Verify it's gone (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L898-L898) "// Verify it's gone"
- 3. **Run tests:** `npm test` (Source: 03_RUNBOOK_03_RECORDS_SERVICE.md:L1035-L1035) "3. **Run tests:** `npm test`"

## Risks / Unknowns (TODOs)
UNSPECIFIED
TODO: Document risks (03_RUNBOOK_03_RECORDS_SERVICE.md:L1-L1050)
