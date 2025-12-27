## Purpose
Create the Electron Renderer (Vue 3 + Tiptap editor) providing the desktop UI for drafting legal documents with real-time editing, evidence linking, and document management.

## Produces (Artifacts)
**Application:**
- Component: Electron Renderer (Vue 3 SPA)
  - Framework: Vue 3 + Composition API
  - Editor: Tiptap (ProseMirror)
  - State: Pinia stores
  - Styling: Tailwind CSS

**Files:**
- File: `desktop/renderer/src/main.ts` (~100 lines)
- File: `desktop/renderer/src/App.vue` (~200 lines)
- File: `desktop/renderer/src/components/Editor.vue` (~500 lines)
  - Purpose: Tiptap editor integration
- File: `desktop/renderer/src/components/Sidebar.vue` (~300 lines)
  - Purpose: Case/draft navigation
- File: `desktop/renderer/src/components/EvidencePanel.vue` (~250 lines)
  - Purpose: Evidence linking UI
- File: `desktop/renderer/src/stores/document.ts` (~300 lines)
  - Purpose: Pinia store for LegalDocument state
- File: `desktop/renderer/src/stores/services.ts` (~150 lines)
  - Purpose: Service status tracking
- File: `desktop/renderer/src/api/client.ts` (~200 lines)
  - Purpose: HTTP client for service calls
- File: `desktop/renderer/src/transformers/tiptap-legaldoc.ts` (~400 lines)
  - Purpose: Transform Tiptap ↔ LegalDocument

**Total:** ~2,400 lines

## Consumes (Prereqs)
**Required Runbooks:**
- Runbook 1: LegalDocument types (for state management)
- Runbook 3-6: Service APIs (REST endpoints)
- Runbook 7: Orchestrator IPC channels

**Required Environment:**
- Electron renderer context (runs in browser-like environment)

**Required Dependencies:**
- `vue@^3.3.0`
- `@tiptap/vue-3@^2.1.0` (Tiptap Vue integration)
- `@tiptap/starter-kit@^2.1.0` (basic editor extensions)
- `pinia@^2.1.0` (state management)
- `axios@^1.6.0` (HTTP client)
- `tailwindcss@^3.3.0` (styling)

## Interfaces Touched
- REST endpoints
  - GET /api/templates (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L84-L84) "- GET /api/templates → Load template list"
  - POST /api/cases (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L85-L85) "- POST /api/cases → Create case from template"
  - GET /api/drafts/:id (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L86-L86) "- GET /api/drafts/:id → Load draft for editing"
  - PUT /api/drafts/:id (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L87-L87) "- PUT /api/drafts/:id → Save draft changes (auto-save every 5s)"
  - POST /ingest (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L90-L90) "- POST /ingest → Upload DOCX, parse to LegalDocument"
  - POST /export (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L93-L93) "- POST /export → Export LegalDocument to DOCX for download"
  - POST /api/evidence (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L96-L96) "- POST /api/evidence → Upload evidence file"
  - GET /api/evidence/case/:caseId (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L97-L97) "- GET /api/evidence/case/:caseId → List case evidence for panel"
  - POST /api/citations/parse (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L100-L100) "- POST /api/citations/parse → Parse citations for highlighting"
  - POST /analyze (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L103-L103) "- POST /analyze → Get document metrics for status bar"
  - PUT /api/drafts/:id (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L118-L118) "- Rule: PUT /api/drafts/:id only called when user makes changes"
  - PUT /api/drafts/:id (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L143-L143) "- Expected: PUT /api/drafts/:id called with updated document_json"
- IPC channels/events (if any)
  - - Runbook 7: Orchestrator IPC channels (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L42-L42) "- Runbook 7: Orchestrator IPC channels"
  - #### IPC Channels (Client - Renderer Calls Orchestrator) (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L57-L57) "#### IPC Channels (Client - Renderer Calls Orchestrator)"
  - #### IPC Channels (Server - Renderer Listens to Orchestrator) (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L69-L69) "#### IPC Channels (Server - Renderer Listens to Orchestrator)"
  - - Handle errors gracefully (service unavailable, network errors) (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L370-L370) "- Handle errors gracefully (service unavailable, network errors)"
  - - Handle version conflicts (409 responses) (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L375-L375) "- Handle version conflicts (409 responses)"
- Filesystem paths/formats
  - electron-builder.yml (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L257-L257) "- File: `electron-builder.yml` (~100 lines)"
  - package.json (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L259-L259) "- File: `package.json` (scripts section)"
- Process lifecycle (if any)
  - UNSPECIFIED
  - TODO: Document process lifecycle (Metadata/RUNBOOK_8_9_10_METADATA.md:L1-L462)

## Contracts Defined or Used
- REST GET /api/templates (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L84-L84) "- GET /api/templates → Load template list"
- REST POST /api/cases (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L85-L85) "- POST /api/cases → Create case from template"
- REST GET /api/drafts/:id (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L86-L86) "- GET /api/drafts/:id → Load draft for editing"
- REST PUT /api/drafts/:id (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L87-L87) "- PUT /api/drafts/:id → Save draft changes (auto-save every 5s)"
- REST POST /ingest (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L90-L90) "- POST /ingest → Upload DOCX, parse to LegalDocument"
- REST POST /export (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L93-L93) "- POST /export → Export LegalDocument to DOCX for download"
- REST POST /api/evidence (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L96-L96) "- POST /api/evidence → Upload evidence file"
- REST GET /api/evidence/case/:caseId (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L97-L97) "- GET /api/evidence/case/:caseId → List case evidence for panel"
- REST POST /api/citations/parse (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L100-L100) "- POST /api/citations/parse → Parse citations for highlighting"
- REST POST /analyze (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L103-L103) "- POST /analyze → Get document metrics for status bar"
- REST PUT /api/drafts/:id (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L118-L118) "- Rule: PUT /api/drafts/:id only called when user makes changes"
- REST PUT /api/drafts/:id (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L143-L143) "- Expected: PUT /api/drafts/:id called with updated document_json"
- IPC - Runbook 7: Orchestrator IPC channels (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L42-L42) "- Runbook 7: Orchestrator IPC channels"
- IPC #### IPC Channels (Client - Renderer Calls Orchestrator) (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L57-L57) "#### IPC Channels (Client - Renderer Calls Orchestrator)"
- IPC #### IPC Channels (Server - Renderer Listens to Orchestrator) (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L69-L69) "#### IPC Channels (Server - Renderer Listens to Orchestrator)"
- IPC - Handle errors gracefully (service unavailable, network errors) (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L370-L370) "- Handle errors gracefully (service unavailable, network errors)"
- IPC - Handle version conflicts (409 responses) (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L375-L375) "- Handle version conflicts (409 responses)"
- Schema LegalDocument (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L27-L27) "- Purpose: Pinia store for LegalDocument state"
- Schema LegalDocument (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L33-L33) "- Purpose: Transform Tiptap ↔ LegalDocument"
- Schema LegalDocument (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L40-L40) "- Runbook 1: LegalDocument types (for state management)"
- Schema LegalDocument (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L90-L90) "- POST /ingest → Upload DOCX, parse to LegalDocument"
- Schema LegalDocument (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L93-L93) "- POST /export → Export LegalDocument to DOCX for download"
- Schema LegalDocument (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L109-L109) "- INVARIANT: Tiptap state syncs with LegalDocument state"
- Schema LegalDocument (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L110-L110) "- Rule: Changes in Tiptap editor trigger transformation to LegalDocument, saved to Pinia store"
- Schema LegalDocument (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L128-L128) "- Rule: When user links evidence to text, sentence ID from LegalDocument used"
- Schema LegalDocument (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L157-L157) "- **Risk:** Tiptap ↔ LegalDocument transformation loses data"
- Schema type system (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L226-L226) "- Enforced by: TypeScript type system (required properties)"
- Schema LegalDocument (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L343-L343) "2. Understand Tiptap ↔ LegalDocument transformation (Runbook 8) - core complexity"
- Schema LegalDocument (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L361-L361) "**Step 3: Tiptap ↔ LegalDocument Transformation**"
- Schema LegalDocument (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L363-L363) "- Tiptap state → LegalDocument: Extract sections, paragraphs, sentences"
- Schema LegalDocument (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L364-L364) "- LegalDocument → Tiptap state: Reconstruct editor content"
- Schema LegalDocument (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L365-L365) "- Test round-trip: Tiptap → LegalDocument → Tiptap (must match)"
- Schema LegalDocument (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L415-L415) "- **Tiptap sync (HARD):** Editor state must match LegalDocument state"
- Schema LegalDocument (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L428-L428) "1. **Don't skip transformation tests:** Tiptap ↔ LegalDocument round-trip MUST work"
- Schema LegalDocument (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L438-L438) "- [ ] Tiptap ↔ LegalDocument transformation works (round-trip test)"
- File electron-builder.yml (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L257-L257) "- File: `electron-builder.yml` (~100 lines)"
- File package.json (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L259-L259) "- File: `package.json` (scripts section)"

## Invariants Relied On
- - INVARIANT: Tiptap state syncs with LegalDocument state (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L109-L109) "- INVARIANT: Tiptap state syncs with LegalDocument state"
- - INVARIANT: Auto-save only when document dirty (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L117-L117) "- INVARIANT: Auto-save only when document dirty"
- - INVARIANT: Evidence linking preserves sentence IDs (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L127-L127) "- INVARIANT: Evidence linking preserves sentence IDs"
- - INVARIANT: Every service has URL defined for every environment (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L224-L224) "- INVARIANT: Every service has URL defined for every environment"
- - INVARIANT: All 8 services bundled in installer (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L286-L286) "- INVARIANT: All 8 services bundled in installer"
- - INVARIANT: Database migrations bundled (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L294-L294) "- INVARIANT: Database migrations bundled"

## Verification Gate (Commands + Expected Outputs)
- - Test: Type text in editor, verify Tiptap state updates (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L138-L138) "- Test: Type text in editor, verify Tiptap state updates"
- - Purpose: Verify URL resolution works (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L240-L240) "- Purpose: Verify URL resolution works"
- 1. Verify Runbook 7 (Orchestrator) works - all 8 services start successfully (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L342-L342) "1. Verify Runbook 7 (Orchestrator) works - all 8 services start successfully"
- - Verify all dependencies bundled (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L404-L404) "- Verify all dependencies bundled"

## Risks / Unknowns (TODOs)
- - **Risk:** Tiptap ↔ LegalDocument transformation loses data (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L157-L157) "- **Risk:** Tiptap ↔ LegalDocument transformation loses data"
- - **Risk:** Auto-save conflicts with manual save (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L162-L162) "- **Risk:** Auto-save conflicts with manual save"
- - **Risk:** Editor lag on large documents (200+ pages) (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L169-L169) "- **Risk:** Editor lag on large documents (200+ pages)"
- - **Risk:** Code signing fails (macOS notarization, Windows authenticode) (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L320-L320) "- **Risk:** Code signing fails (macOS notarization, Windows authenticode)"
- - **Risk:** Missing dependencies in bundled services (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L325-L325) "- **Risk:** Missing dependencies in bundled services"
- - **Risk:** Installer size too large (>500MB) (Source: Metadata/RUNBOOK_8_9_10_METADATA.md:L332-L332) "- **Risk:** Installer size too large (>500MB)"
