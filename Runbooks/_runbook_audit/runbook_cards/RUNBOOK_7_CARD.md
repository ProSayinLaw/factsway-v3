## Purpose
UNSPECIFIED
TODO: Provide details (07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L1-L933)

## Produces (Artifacts)
UNSPECIFIED
TODO: Provide details (07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L1-L933)

## Consumes (Prereqs)
UNSPECIFIED
TODO: Provide details (07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L1-L933)

## Interfaces Touched
- REST endpoints
  - UNSPECIFIED
  - TODO: Document REST endpoints (07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L1-L933)
- IPC channels/events (if any)
  - - ✅ IPC communication with renderer (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L18-L18) "- ✅ IPC communication with renderer"
  - - IPC for renderer communication (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L37-L37) "- IPC for renderer communication"
  - - **Section 17.3:** IPC protocol (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L41-L41) "- **Section 17.3:** IPC protocol"
  - - ✅ IPC handlers (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L63-L63) "- ✅ IPC handlers"
  - mkdir -p desktop/main/{services,ipc,database,utils} (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L81-L81) "mkdir -p desktop/main/{services,ipc,database,utils}"
  - # │   ├── ipc/ (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L93-L93) "# │ ├── ipc/"
  - port: number; (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L185-L185) "port: number;"
  - port: 3001, (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L197-L197) "port: 3001,"
  - port: 3002, (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L211-L211) "port: 3002,"
  - PORT: '3002', (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L215-L215) "PORT: '3002',"
  - port: 3003, (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L223-L223) "port: 3003,"
  - PORT: '3003', (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L227-L227) "PORT: '3003',"
  - port: 3004, (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L235-L235) "port: 3004,"
  - port: 3005, (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L244-L244) "port: 3005,"
  - port: 3006, (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L253-L253) "port: 3006,"
  - port: 3007, (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L262-L262) "port: 3007,"
  - PORT: '3007', (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L266-L266) "PORT: '3007',"
  - ## Task 5: IPC Handlers (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L622-L622) "## Task 5: IPC Handlers"
  - ### 5.1 IPC Protocol (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L624-L624) "### 5.1 IPC Protocol"
  - **File:** `desktop/main/ipc/ipc-handlers.ts` (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L626-L626) "**File:** `desktop/main/ipc/ipc-handlers.ts`"
  - ipcMain.handle('services:get-statuses', async () => { (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L639-L639) "ipcMain.handle('services:get-statuses', async () => {"
  - ipcMain.handle('services:start', async (event, serviceName: string) => { (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L646-L646) "ipcMain.handle('services:start', async (event, serviceName: string) => {"
  - console.log(`IPC: Start service ${serviceName}`); (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L649-L649) "console.log(`IPC: Start service ${serviceName}`);"
  - ipcMain.handle('services:stop', async (event, serviceName: string) => { (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L656-L656) "ipcMain.handle('services:stop', async (event, serviceName: string) => {"
  - ipcMain.handle('services:restart', async (event, serviceName: string) => { (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L664-L664) "ipcMain.handle('services:restart', async (event, serviceName: string) => {"
  - ipcMain.handle('services:get-logs', async (event, serviceName: string) => { (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L674-L674) "ipcMain.handle('services:get-logs', async (event, serviceName: string) => {"
  - import { registerIpcHandlers } from './ipc/ipc-handlers'; (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L699-L699) "import { registerIpcHandlers } from './ipc/ipc-handlers';"
  - // 3. Register IPC handlers (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L721-L721) "// 3. Register IPC handlers"
  - // Handle uncaught errors (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L806-L806) "// Handle uncaught errors"
  - getStatuses: () => ipcRenderer.invoke('services:get-statuses'), (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L834-L834) "getStatuses: () => ipcRenderer.invoke('services:get-statuses'),"
  - start: (serviceName: string) => ipcRenderer.invoke('services:start', serviceName), (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L835-L835) "start: (serviceName: string) => ipcRenderer.invoke('services:start', serviceName),"
  - stop: (serviceName: string) => ipcRenderer.invoke('services:stop', serviceName), (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L836-L836) "stop: (serviceName: string) => ipcRenderer.invoke('services:stop', serviceName),"
  - restart: (serviceName: string) => ipcRenderer.invoke('services:restart', serviceName), (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L837-L837) "restart: (serviceName: string) => ipcRenderer.invoke('services:restart', serviceName),"
  - getLogs: (serviceName: string) => ipcRenderer.invoke('services:get-logs', serviceName), (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L838-L838) "getLogs: (serviceName: string) => ipcRenderer.invoke('services:get-logs', serviceName),"
  - - [ ] Service statuses reported via IPC (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L873-L873) "- [ ] Service statuses reported via IPC"
  - ### 8.4 IPC Communication (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L880-L880) "### 8.4 IPC Communication"
  - - [ ] Logs accessible via IPC (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L883-L883) "- [ ] Logs accessible via IPC"
  - ✅ IPC communication works (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L902-L902) "✅ IPC communication works"
  - 5. **Test IPC:** Use developer tools to test IPC calls (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L918-L918) "5. **Test IPC:** Use developer tools to test IPC calls"
- Filesystem paths/formats
  - package.json (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L103-L103) "### 1.2 Create package.json"
  - package.json (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L105-L105) "**File:** `desktop/package.json`"
  - tsconfig.json (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L142-L142) "**File:** `desktop/tsconfig.json`"
- Process lifecycle (if any)
  - **Phase:** Foundation (Critical Path)   **Estimated Time:** 10-14 hours   **Prerequisites:** Runbooks 1-6 complete (all services)   **Depends On:** Runbook 0 Sections 1.7, 15.1, 17, 19.7   **Enables:** Runbooks 8-15 (desktop integration)  ---

## Contracts Defined or Used
- IPC - ✅ IPC communication with renderer (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L18-L18) "- ✅ IPC communication with renderer"
- IPC - IPC for renderer communication (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L37-L37) "- IPC for renderer communication"
- IPC - **Section 17.3:** IPC protocol (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L41-L41) "- **Section 17.3:** IPC protocol"
- IPC - ✅ IPC handlers (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L63-L63) "- ✅ IPC handlers"
- IPC mkdir -p desktop/main/{services,ipc,database,utils} (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L81-L81) "mkdir -p desktop/main/{services,ipc,database,utils}"
- IPC # │   ├── ipc/ (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L93-L93) "# │ ├── ipc/"
- IPC port: number; (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L185-L185) "port: number;"
- IPC port: 3001, (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L197-L197) "port: 3001,"
- IPC port: 3002, (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L211-L211) "port: 3002,"
- IPC PORT: '3002', (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L215-L215) "PORT: '3002',"
- IPC port: 3003, (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L223-L223) "port: 3003,"
- IPC PORT: '3003', (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L227-L227) "PORT: '3003',"
- IPC port: 3004, (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L235-L235) "port: 3004,"
- IPC port: 3005, (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L244-L244) "port: 3005,"
- IPC port: 3006, (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L253-L253) "port: 3006,"
- IPC port: 3007, (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L262-L262) "port: 3007,"
- IPC PORT: '3007', (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L266-L266) "PORT: '3007',"
- IPC ## Task 5: IPC Handlers (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L622-L622) "## Task 5: IPC Handlers"
- IPC ### 5.1 IPC Protocol (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L624-L624) "### 5.1 IPC Protocol"
- IPC **File:** `desktop/main/ipc/ipc-handlers.ts` (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L626-L626) "**File:** `desktop/main/ipc/ipc-handlers.ts`"
- IPC ipcMain.handle('services:get-statuses', async () => { (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L639-L639) "ipcMain.handle('services:get-statuses', async () => {"
- IPC ipcMain.handle('services:start', async (event, serviceName: string) => { (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L646-L646) "ipcMain.handle('services:start', async (event, serviceName: string) => {"
- IPC console.log(`IPC: Start service ${serviceName}`); (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L649-L649) "console.log(`IPC: Start service ${serviceName}`);"
- IPC ipcMain.handle('services:stop', async (event, serviceName: string) => { (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L656-L656) "ipcMain.handle('services:stop', async (event, serviceName: string) => {"
- IPC ipcMain.handle('services:restart', async (event, serviceName: string) => { (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L664-L664) "ipcMain.handle('services:restart', async (event, serviceName: string) => {"
- IPC ipcMain.handle('services:get-logs', async (event, serviceName: string) => { (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L674-L674) "ipcMain.handle('services:get-logs', async (event, serviceName: string) => {"
- IPC import { registerIpcHandlers } from './ipc/ipc-handlers'; (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L699-L699) "import { registerIpcHandlers } from './ipc/ipc-handlers';"
- IPC // 3. Register IPC handlers (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L721-L721) "// 3. Register IPC handlers"
- IPC // Handle uncaught errors (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L806-L806) "// Handle uncaught errors"
- IPC getStatuses: () => ipcRenderer.invoke('services:get-statuses'), (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L834-L834) "getStatuses: () => ipcRenderer.invoke('services:get-statuses'),"
- IPC start: (serviceName: string) => ipcRenderer.invoke('services:start', serviceName), (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L835-L835) "start: (serviceName: string) => ipcRenderer.invoke('services:start', serviceName),"
- IPC stop: (serviceName: string) => ipcRenderer.invoke('services:stop', serviceName), (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L836-L836) "stop: (serviceName: string) => ipcRenderer.invoke('services:stop', serviceName),"
- IPC restart: (serviceName: string) => ipcRenderer.invoke('services:restart', serviceName), (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L837-L837) "restart: (serviceName: string) => ipcRenderer.invoke('services:restart', serviceName),"
- IPC getLogs: (serviceName: string) => ipcRenderer.invoke('services:get-logs', serviceName), (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L838-L838) "getLogs: (serviceName: string) => ipcRenderer.invoke('services:get-logs', serviceName),"
- IPC - [ ] Service statuses reported via IPC (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L873-L873) "- [ ] Service statuses reported via IPC"
- IPC ### 8.4 IPC Communication (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L880-L880) "### 8.4 IPC Communication"
- IPC - [ ] Logs accessible via IPC (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L883-L883) "- [ ] Logs accessible via IPC"
- IPC ✅ IPC communication works (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L902-L902) "✅ IPC communication works"
- IPC 5. **Test IPC:** Use developer tools to test IPC calls (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L918-L918) "5. **Test IPC:** Use developer tools to test IPC calls"
- Schema schema (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L54-L54) "- ✅ Database schema (Runbook 2)"
- Schema interface ServiceConfig (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L183-L183) "export interface ServiceConfig {"
- Schema interface ManagedService (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L299-L299) "export interface ManagedService {"
- Schema interface ElectronAPI (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L843-L843) "export interface ElectronAPI {"
- Schema interface Window (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L854-L854) "interface Window {"
- File package.json (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L103-L103) "### 1.2 Create package.json"
- File package.json (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L105-L105) "**File:** `desktop/package.json`"
- File tsconfig.json (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L142-L142) "**File:** `desktop/tsconfig.json`"

## Invariants Relied On
UNSPECIFIED
TODO: Add invariants (07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L1-L933)

## Verification Gate (Commands + Expected Outputs)
- 3. **Verify services:** Check all 8 services are running (Source: 07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L916-L916) "3. **Verify services:** Check all 8 services are running"

## Risks / Unknowns (TODOs)
UNSPECIFIED
TODO: Document risks (07_RUNBOOK_07_DESKTOP_ORCHESTRATOR.md:L1-L933)
