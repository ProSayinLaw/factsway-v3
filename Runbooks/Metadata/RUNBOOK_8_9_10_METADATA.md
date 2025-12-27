---

## Metadata Summary

### Purpose
Create the Electron Renderer (Vue 3 + Tiptap editor) providing the desktop UI for drafting legal documents with real-time editing, evidence linking, and document management.

### Produces (Artifacts)

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

### Consumes (Prerequisites)

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

### Interfaces Touched

#### IPC Channels (Client - Renderer Calls Orchestrator)

**Service Management:**
- From: Renderer → To: Orchestrator → `electronAPI.getServices()`
  - Purpose: Get all service statuses for debug panel
- From: Renderer → To: Orchestrator → `electronAPI.restartService(serviceName)`
  - Purpose: Manual service restart

**Logs:**
- From: Renderer → To: Orchestrator → `electronAPI.getLogs({ serviceName, lines })`
  - Purpose: View logs in debug panel

#### IPC Channels (Server - Renderer Listens to Orchestrator)

**Service Events:**
- From: Orchestrator → To: Renderer → `service:status-changed`
  - Payload: ServiceStatus
  - Handler: Update services Pinia store, show notification if service crashed

**Database Events:**
- From: Orchestrator → To: Renderer → `database:initialized`
  - Payload: { success, migrationsRun }
  - Handler: Hide loading screen, enable UI

#### REST API Calls (Client - Renderer Calls Services)

**Records Service (3001):**
- GET /api/templates → Load template list
- POST /api/cases → Create case from template
- GET /api/drafts/:id → Load draft for editing
- PUT /api/drafts/:id → Save draft changes (auto-save every 5s)

**Ingestion Service (3002):**
- POST /ingest → Upload DOCX, parse to LegalDocument

**Export Service (3003):**
- POST /export → Export LegalDocument to DOCX for download

**Evidence Service (3005):**
- POST /api/evidence → Upload evidence file
- GET /api/evidence/case/:caseId → List case evidence for panel

**Citation Service (3004):**
- POST /api/citations/parse → Parse citations for highlighting

**Analysis Service (3007):**
- POST /analyze → Get document metrics for status bar

### Invariants

**Editor State Invariants:**

- INVARIANT: Tiptap state syncs with LegalDocument state
  - Rule: Changes in Tiptap editor trigger transformation to LegalDocument, saved to Pinia store
  - Enforced by: Tiptap update handler
  - Purpose: UI and backend use same data format
  - Violation: Desynchronization (editor shows different content than backend)
  - Detection: Export doesn't match what user sees
  - Recovery: Reload draft from backend

- INVARIANT: Auto-save only when document dirty
  - Rule: PUT /api/drafts/:id only called when user makes changes
  - Enforced by: Dirty flag in Pinia store
  - Purpose: No unnecessary API calls
  - Violation: Excessive API calls (every 5s regardless of changes)
  - Detection: Network tab shows constant PUT requests
  - Recovery: Fix dirty flag logic

**Data Flow Invariants:**

- INVARIANT: Evidence linking preserves sentence IDs
  - Rule: When user links evidence to text, sentence ID from LegalDocument used
  - Enforced by: Citation creation logic
  - Purpose: Citations reference correct sentences
  - Violation: Citations point to wrong sentences
  - Detection: Evidence highlighting misaligned
  - Recovery: Re-link evidence to correct sentence

### Verification Gates

**Editor Functionality:**
- Test: Type text in editor, verify Tiptap state updates
- Expected: Text appears, formatting works (bold, italic, headings)

**Auto-Save:**
- Test: Edit draft, wait 5s, check network tab
- Expected: PUT /api/drafts/:id called with updated document_json

**Evidence Linking:**
- Test: Upload evidence, highlight text, link evidence
- Expected: Citation created, text highlighted in amber

**Export:**
- Test: Click Export, wait for download
- Expected: DOCX file downloads, opens in Word with correct formatting

### Risks

**Technical Risks:**

- **Risk:** Tiptap ↔ LegalDocument transformation loses data
  - Severity: CRITICAL
  - Mitigation: Comprehensive transformation tests, round-trip validation
  - Detection: Content missing after save/reload

- **Risk:** Auto-save conflicts with manual save
  - Severity: MEDIUM
  - Mitigation: Debounce auto-save, disable during manual operations
  - Detection: Version conflicts (409 errors)

**User Experience Risks:**

- **Risk:** Editor lag on large documents (200+ pages)
  - Severity: HIGH
  - Mitigation: Virtual scrolling, lazy render sections
  - Detection: Typing feels slow, UI freezes

---

## Metadata Summary

### Purpose
Create the service discovery system that provides environment-aware configuration for all services, enabling seamless transition between desktop, cloud, and enterprise deployments.

### Produces (Artifacts)

**Configuration System:**
- Component: Service Discovery
  - Pattern: Environment-based configuration
  - Storage: .env files, environment variables

**Files:**
- File: `services/shared-config/service-urls.ts` (~150 lines)
  - Purpose: Service URL resolution by environment
- File: `services/shared-config/deployment-config.ts` (~200 lines)
  - Purpose: Deployment-specific settings
- File: `.env.desktop` (~20 lines)
  - Purpose: Desktop deployment URLs (localhost:3001-3007)
- File: `.env.cloud` (~20 lines)
  - Purpose: Cloud deployment URLs (api.factsway.com)
- File: `.env.enterprise` (~20 lines)
  - Purpose: Enterprise deployment URLs (internal network)

**Total:** ~410 lines

### Consumes (Prerequisites)

**Required Runbooks:**
- Runbooks 3-6: Service definitions (ports, names)

**Required Environment:**
- `DEPLOYMENT_ENV`: "desktop"|"cloud"|"enterprise"

### Interfaces Touched

**Configuration Exports:**
- From: shared-config → To: All Services
  - Export: `getServiceUrl(serviceName: string): string`
  - Purpose: Resolve service URLs based on environment
  - Example: 
    - Desktop: `getServiceUrl("records")` → `http://localhost:3001`
    - Cloud: `getServiceUrl("records")` → `https://api.factsway.com/records`

### Invariants

**Configuration Invariants:**

- INVARIANT: Every service has URL defined for every environment
  - Rule: All 8 services have entries in desktop, cloud, enterprise configs
  - Enforced by: TypeScript type system (required properties)
  - Purpose: No missing URLs cause runtime errors
  - Violation: Service URL resolves to undefined
  - Detection: Connection refused errors
  - Recovery: Add missing URL to config

### Verification Gates

**Configuration Resolution:**
- Command: 
  ```typescript
  DEPLOYMENT_ENV=desktop node -e "console.log(getServiceUrl('records'))"
  ```
- Expected: `http://localhost:3001`
- Purpose: Verify URL resolution works

---

## Metadata Summary

### Purpose
Create multi-platform desktop installers (Windows, macOS, Linux) using electron-builder with auto-update support.

### Produces (Artifacts)

**Installers:**
- File: `dist/FACTSWAY-Setup-1.0.0.exe` (Windows installer)
- File: `dist/FACTSWAY-1.0.0.dmg` (macOS installer)
- File: `dist/FACTSWAY-1.0.0.AppImage` (Linux installer)

**Configuration:**
- File: `electron-builder.yml` (~100 lines)
  - Purpose: Build configuration for 3 platforms
- File: `package.json` (scripts section)
  - Scripts: build:win, build:mac, build:linux

**Total:** ~100 lines configuration

### Consumes (Prerequisites)

**Required Runbooks:**
- Runbook 7: Desktop Orchestrator (main process)
- Runbook 8: Electron Renderer (renderer process)
- Runbooks 3-6: Compiled services (bundled in installer)

**Required Tools:**
- electron-builder@^24.0.0
- Code signing certificates (macOS, Windows)

### Interfaces Touched

**Build Outputs:**
- From: electron-builder → To: Filesystem
  - Creates: Platform-specific installers in dist/
  - Bundles: All services, database migrations, assets

### Invariants

**Packaging Invariants:**

- INVARIANT: All 8 services bundled in installer
  - Rule: dist/resources/services/ contains all service executables
  - Enforced by: Build script copies services
  - Purpose: Self-contained installer (no external dependencies)
  - Violation: Service missing, app can't start
  - Detection: Service fails to start after install
  - Recovery: Fix build script, rebuild

- INVARIANT: Database migrations bundled
  - Rule: dist/resources/database/migrations/ contains all migration files
  - Enforced by: Build script copies migrations
  - Purpose: Database initialization works after install
  - Violation: Migrations missing, database initialization fails
  - Detection: App crashes on first run
  - Recovery: Fix build script, rebuild

### Verification Gates

**Build Verification:**
- Command: `npm run build:win` (or mac/linux)
- Expected: Installer created in dist/, no errors

**Installation Test:**
- Test: Install on fresh machine, launch app
- Expected: App starts, all services launch, database initializes

**Auto-Update Test:**
- Test: Increment version, rebuild, check for update
- Expected: App detects new version, downloads, installs

### Risks

**Technical Risks:**

- **Risk:** Code signing fails (macOS notarization, Windows authenticode)
  - Severity: HIGH
  - Mitigation: Valid certificates, automated signing in CI
  - Detection: Installer shows "unverified" warnings

- **Risk:** Missing dependencies in bundled services
  - Severity: CRITICAL
  - Mitigation: Test on clean machine, include all node_modules
  - Detection: Services fail to start after install

**Distribution Risks:**

- **Risk:** Installer size too large (>500MB)
  - Severity: MEDIUM
  - Mitigation: Exclude dev dependencies, compress assets
  - Detection: Slow downloads, user complaints

---

**End of Metadata for Runbooks 8, 9, 10**
