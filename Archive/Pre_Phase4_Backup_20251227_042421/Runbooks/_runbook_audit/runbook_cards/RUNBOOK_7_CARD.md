## Purpose
Create the Electron Main process that orchestrates all 8 backend services for desktop deployment, managing their lifecycle, health monitoring, IPC communication, and providing invisible service management to users.

## Produces (Artifacts)
**Process:**
- Process: Desktop Orchestrator (Electron Main)
  - Runtime: Electron/Node.js
  - Role: Parent process for all services
  - Lifecycle: Starts on app launch, stops on app quit

**Files:**
- File: `desktop/main/index.ts` (~300 lines)
  - Purpose: Electron Main entry point, app lifecycle
- File: `desktop/main/service-manager.ts` (~400 lines)
  - Purpose: Service lifecycle management (start/stop/restart)
- File: `desktop/main/health-monitor.ts` (~200 lines)
  - Purpose: Health check polling for all services
- File: `desktop/main/ipc-handlers.ts` (~300 lines)
  - Purpose: IPC message handlers for renderer
- File: `desktop/main/database-initializer.ts` (~150 lines)
  - Purpose: Database setup and migration runner
- File: `desktop/main/log-aggregator.ts` (~150 lines)
  - Purpose: Collect logs from all services
- File: `desktop/main/config/service-registry.ts` (~100 lines)
  - Purpose: Service definitions (ports, commands, paths)
- File: `desktop/preload/index.ts` (~100 lines)
  - Purpose: Electron preload script (expose IPC to renderer)
- File: `desktop/package.json` (configuration)
- File: `desktop/tsconfig.json` (TypeScript config)
- File: `desktop/tests/integration/orchestrator.test.ts` (~200 lines)

**Total:** ~1,900 lines

**Manages (8 Child Processes):**
1. Records Service (port 3001)
2. Ingestion Service (port 3002)
3. Export Service (port 3003)
4. Citation Service (port 3004)
5. Evidence Service (port 3005)
6. Template Service (port 3006)
7. Analysis Service (port 3007)
8. (Reserved for future service, port 3008)

## Consumes (Prereqs)
**Required Runbooks:**
- Runbook 2: Database schema and migrations
- Runbook 3: Records Service executable
- Runbook 4: Ingestion Service executable
- Runbook 5: Export Service executable
- Runbook 6: 4 specialized services executables

**Required Files:**
- Service executables (compiled services from Runbooks 3-6)
- Database migration files (from Runbook 2)

**Required Environment Variables:**
- `DEPLOYMENT_ENV`: "desktop" (fixed for Desktop Orchestrator)
- `DATABASE_URL`: SQLite file path (e.g., `~/Library/Application Support/FACTSWAY/factsway.db`)
- `LOG_LEVEL`: "info"|"debug"|"warn"|"error"
- `EVIDENCE_STORAGE_PATH`: Directory for evidence files

**Required Dependencies:**
- `electron@^28.0.0` (Electron framework)
- `better-sqlite3@^9.2.0` (SQLite for migrations)

## Interfaces Touched
- REST endpoints
  - GET /health (Source: Metadata/RUNBOOK_7_METADATA.md:L203-L203) "- Monitor service health (HTTP GET /health every 10s)"
- IPC channels/events (if any)
  - Create the Electron Main process that orchestrates all 8 backend services for desktop deployment, managing their lifecycle, health monitoring, IPC communication, and providing invisible service management to users. (Source: Metadata/RUNBOOK_7_METADATA.md:L6-L6) "Create the Electron Main process that orchestrates all 8 backend services for desktop deployment, managing their lifecycle, health monitoring, IPC communication, and providing invisible service..."
  - - File: `desktop/main/ipc-handlers.ts` (~300 lines) (Source: Metadata/RUNBOOK_7_METADATA.md:L23-L23) "- File: `desktop/main/ipc-handlers.ts` (~300 lines)"
  - - Purpose: IPC message handlers for renderer (Source: Metadata/RUNBOOK_7_METADATA.md:L24-L24) "- Purpose: IPC message handlers for renderer"
  - - Purpose: Electron preload script (expose IPC to renderer) (Source: Metadata/RUNBOOK_7_METADATA.md:L32-L32) "- Purpose: Electron preload script (expose IPC to renderer)"
  - 1. Records Service (port 3001) (Source: Metadata/RUNBOOK_7_METADATA.md:L40-L40) "1. Records Service (port 3001)"
  - 2. Ingestion Service (port 3002) (Source: Metadata/RUNBOOK_7_METADATA.md:L41-L41) "2. Ingestion Service (port 3002)"
  - 3. Export Service (port 3003) (Source: Metadata/RUNBOOK_7_METADATA.md:L42-L42) "3. Export Service (port 3003)"
  - 4. Citation Service (port 3004) (Source: Metadata/RUNBOOK_7_METADATA.md:L43-L43) "4. Citation Service (port 3004)"
  - 5. Evidence Service (port 3005) (Source: Metadata/RUNBOOK_7_METADATA.md:L44-L44) "5. Evidence Service (port 3005)"
  - 6. Template Service (port 3006) (Source: Metadata/RUNBOOK_7_METADATA.md:L45-L45) "6. Template Service (port 3006)"
  - 7. Analysis Service (port 3007) (Source: Metadata/RUNBOOK_7_METADATA.md:L46-L46) "7. Analysis Service (port 3007)"
  - 8. (Reserved for future service, port 3008) (Source: Metadata/RUNBOOK_7_METADATA.md:L47-L47) "8. (Reserved for future service, port 3008)"
  - #### IPC Channels (Server - Orchestrator Handles These) (Source: Metadata/RUNBOOK_7_METADATA.md:L74-L74) "#### IPC Channels (Server - Orchestrator Handles These)"
  - - From: Renderer → To: Orchestrator → **Channel: services:get-all** (Source: Metadata/RUNBOOK_7_METADATA.md:L78-L78) "- From: Renderer → To: Orchestrator → **Channel: services:get-all**"
  - port: 3001, (Source: Metadata/RUNBOOK_7_METADATA.md:L84-L84) "port: 3001,"
  - - From: Renderer → To: Orchestrator → **Channel: services:start** (Source: Metadata/RUNBOOK_7_METADATA.md:L94-L94) "- From: Renderer → To: Orchestrator → **Channel: services:start**"
  - - From: Renderer → To: Orchestrator → **Channel: services:stop** (Source: Metadata/RUNBOOK_7_METADATA.md:L100-L100) "- From: Renderer → To: Orchestrator → **Channel: services:stop**"
  - - From: Renderer → To: Orchestrator → **Channel: services:restart** (Source: Metadata/RUNBOOK_7_METADATA.md:L106-L106) "- From: Renderer → To: Orchestrator → **Channel: services:restart**"
  - - From: Renderer → To: Orchestrator → **Channel: database:init** (Source: Metadata/RUNBOOK_7_METADATA.md:L114-L114) "- From: Renderer → To: Orchestrator → **Channel: database:init**"
  - - From: Renderer → To: Orchestrator → **Channel: database:status** (Source: Metadata/RUNBOOK_7_METADATA.md:L120-L120) "- From: Renderer → To: Orchestrator → **Channel: database:status**"
  - - From: Renderer → To: Orchestrator → **Channel: logs:get** (Source: Metadata/RUNBOOK_7_METADATA.md:L128-L128) "- From: Renderer → To: Orchestrator → **Channel: logs:get**"
  - - From: Renderer → To: Orchestrator → **Channel: logs:clear** (Source: Metadata/RUNBOOK_7_METADATA.md:L142-L142) "- From: Renderer → To: Orchestrator → **Channel: logs:clear**"
  - - From: Renderer → To: Orchestrator → **Channel: app:get-path** (Source: Metadata/RUNBOOK_7_METADATA.md:L150-L150) "- From: Renderer → To: Orchestrator → **Channel: app:get-path**"
  - - From: Renderer → To: Orchestrator → **Channel: app:quit** (Source: Metadata/RUNBOOK_7_METADATA.md:L156-L156) "- From: Renderer → To: Orchestrator → **Channel: app:quit**"
  - #### IPC Channels (Client - Orchestrator Emits) (Source: Metadata/RUNBOOK_7_METADATA.md:L162-L162) "#### IPC Channels (Client - Orchestrator Emits)"
  - - From: Orchestrator → To: Renderer → **Channel: service:status-changed** (Source: Metadata/RUNBOOK_7_METADATA.md:L166-L166) "- From: Orchestrator → To: Renderer → **Channel: service:status-changed**"
  - - From: Orchestrator → To: Renderer → **Channel: service:error** (Source: Metadata/RUNBOOK_7_METADATA.md:L172-L172) "- From: Orchestrator → To: Renderer → **Channel: service:error**"
  - - From: Orchestrator → To: Renderer → **Channel: database:initialized** (Source: Metadata/RUNBOOK_7_METADATA.md:L180-L180) "- From: Orchestrator → To: Renderer → **Channel: database:initialized**"
  - - Listen for IPC messages from renderer (Source: Metadata/RUNBOOK_7_METADATA.md:L202-L202) "- Listen for IPC messages from renderer"
  - - Handle service lifecycle requests from renderer (Source: Metadata/RUNBOOK_7_METADATA.md:L206-L206) "- Handle service lifecycle requests from renderer"
  - - Environment: Inject PORT, DATABASE_URL, SERVICE_NAME, DEPLOYMENT_ENV (Source: Metadata/RUNBOOK_7_METADATA.md:L221-L221) "- Environment: Inject PORT, DATABASE_URL, SERVICE_NAME, DEPLOYMENT_ENV"
  - - Purpose: No port conflicts, resource leaks (Source: Metadata/RUNBOOK_7_METADATA.md:L240-L240) "- Purpose: No port conflicts, resource leaks"
  - - Detection: Port already in use (EADDRINUSE) (Source: Metadata/RUNBOOK_7_METADATA.md:L242-L242) "- Detection: Port already in use (EADDRINUSE)"
  - - Enforced by: Service registry (hardcoded port assignments) (Source: Metadata/RUNBOOK_7_METADATA.md:L247-L247) "- Enforced by: Service registry (hardcoded port assignments)"
  - - Violation: Port conflicts (if user has other apps on these ports) (Source: Metadata/RUNBOOK_7_METADATA.md:L249-L249) "- Violation: Port conflicts (if user has other apps on these ports)"
  - - Rule: Health monitor runs in background (async), doesn't block IPC (Source: Metadata/RUNBOOK_7_METADATA.md:L256-L256) "- Rule: Health monitor runs in background (async), doesn't block IPC"
  - ✓ Starting Records Service... OK (port 3001) (Source: Metadata/RUNBOOK_7_METADATA.md:L314-L314) "✓ Starting Records Service... OK (port 3001)"
  - ✓ Starting Ingestion Service... OK (port 3002) (Source: Metadata/RUNBOOK_7_METADATA.md:L315-L315) "✓ Starting Ingestion Service... OK (port 3002)"
  - ✓ Starting Export Service... OK (port 3003) (Source: Metadata/RUNBOOK_7_METADATA.md:L316-L316) "✓ Starting Export Service... OK (port 3003)"
  - ✓ Starting Citation Service... OK (port 3004) (Source: Metadata/RUNBOOK_7_METADATA.md:L317-L317) "✓ Starting Citation Service... OK (port 3004)"
  - ✓ Starting Evidence Service... OK (port 3005) (Source: Metadata/RUNBOOK_7_METADATA.md:L318-L318) "✓ Starting Evidence Service... OK (port 3005)"
  - ✓ Starting Template Service... OK (port 3006) (Source: Metadata/RUNBOOK_7_METADATA.md:L319-L319) "✓ Starting Template Service... OK (port 3006)"
  - ✓ Starting Analysis Service... OK (port 3007) (Source: Metadata/RUNBOOK_7_METADATA.md:L320-L320) "✓ Starting Analysis Service... OK (port 3007)"
  - **IPC Verification:** (Source: Metadata/RUNBOOK_7_METADATA.md:L336-L336) "**IPC Verification:**"
  - - Expected: IPC calls succeed, return expected data (Source: Metadata/RUNBOOK_7_METADATA.md:L342-L342) "- Expected: IPC calls succeed, return expected data"
  - - Purpose: Verify IPC communication (Source: Metadata/RUNBOOK_7_METADATA.md:L343-L343) "- Purpose: Verify IPC communication"
  - - Detection: Database locked errors, port conflicts (Source: Metadata/RUNBOOK_7_METADATA.md:L377-L377) "- Detection: Database locked errors, port conflicts"
  - - Impact: Orphaned processes consume resources, port conflicts on restart (Source: Metadata/RUNBOOK_7_METADATA.md:L383-L383) "- Impact: Orphaned processes consume resources, port conflicts on restart"
  - 2. Study the 10 IPC channels - these are your Renderer communication contract (Source: Metadata/RUNBOOK_7_METADATA.md:L456-L456) "2. Study the 10 IPC channels - these are your Renderer communication contract"
  - **Step 5: IPC Handlers** (Source: Metadata/RUNBOOK_7_METADATA.md:L482-L482) "**Step 5: IPC Handlers**"
  - - Implement all 10 IPC channels (services:get-all, start, stop, etc.) (Source: Metadata/RUNBOOK_7_METADATA.md:L483-L483) "- Implement all 10 IPC channels (services:get-all, start, stop, etc.)"
  - - Test each channel from renderer (use DevTools) (Source: Metadata/RUNBOOK_7_METADATA.md:L484-L484) "- Test each channel from renderer (use DevTools)"
  - **IPC Channel Validation:** (Source: Metadata/RUNBOOK_7_METADATA.md:L498-L498) "**IPC Channel Validation:**"
  - For EACH of the 10 IPC channels in Interfaces section: (Source: Metadata/RUNBOOK_7_METADATA.md:L499-L499) "For EACH of the 10 IPC channels in Interfaces section:"
  - - [ ] Channel handler implemented (Source: Metadata/RUNBOOK_7_METADATA.md:L500-L500) "- [ ] Channel handler implemented"
  - 4. **Don't forget environment variables:** Services need PORT, DATABASE_URL, etc. (Source: Metadata/RUNBOOK_7_METADATA.md:L510-L510) "4. **Don't forget environment variables:** Services need PORT, DATABASE_URL, etc."
  - - [ ] Port assignment correct (3001-3008) (Source: Metadata/RUNBOOK_7_METADATA.md:L515-L515) "- [ ] Port assignment correct (3001-3008)"
  - - [ ] IPC channels functional (test all 10) (Source: Metadata/RUNBOOK_7_METADATA.md:L527-L527) "- [ ] IPC channels functional (test all 10)"
  - - Runbook 8 (Renderer) will communicate via IPC channels (Source: Metadata/RUNBOOK_7_METADATA.md:L533-L533) "- Runbook 8 (Renderer) will communicate via IPC channels"
  - - Any IPC contract violations break the UI (Source: Metadata/RUNBOOK_7_METADATA.md:L534-L534) "- Any IPC contract violations break the UI"
- Filesystem paths/formats
  - package.json (Source: Metadata/RUNBOOK_7_METADATA.md:L33-L33) "- File: `desktop/package.json` (configuration)"
  - tsconfig.json (Source: Metadata/RUNBOOK_7_METADATA.md:L34-L34) "- File: `desktop/tsconfig.json` (TypeScript config)"
- Process lifecycle (if any)
  - **Orchestrator Lifecycle:**  1. **Startup Sequence:**    - Electron app starts    - Check if first run (database doesn't exist)    - If first run: Create database, run migrations    - Load service registry (8 services, ports, commands)    - Start all services sequentially (wait for service:ready from each)    - Start health monitor (polls every 10s)    - Create Electron window    - Load renderer (Runbook 8)    - Emit database:initialized to renderer  2. **Runtime:**    - Listen for IPC messages from renderer    - Monitor service health (HTTP GET /health every 10s)    - Restart crashed services automatically (max 3 retries)    - Aggregate logs from all service stdout/stderr    - Handle service lifecycle requests from renderer    - Emit status changes to renderer  3. **Shutdown Sequence:**    - Receive quit signal (app.quit(), Cmd+Q, or app close)    - Send SIGTERM to all services (graceful shutdown)    - Wait up to 5s for services to stop    - Send SIGKILL to any remaining services (force kill)    - Close database connections    - Flush logs    - Exit with code 0  **Service Spawning (per service):** - Command: `node dist/index.js` (TypeScript services) or `python main.py` (Python services) - Working Directory: `services/{service-name}/` - Environment: Inject PORT, DATABASE_URL, SERVICE_NAME, DEPLOYMENT_ENV - Stdio: Pipe stdout/stderr to orchestrator (for log aggregation) - Detached: false (services die when orchestrator dies)

## Contracts Defined or Used
- REST GET /health (Source: Metadata/RUNBOOK_7_METADATA.md:L203-L203) "- Monitor service health (HTTP GET /health every 10s)"
- IPC Create the Electron Main process that orchestrates all 8 backend services for desktop deployment, managing their lifecycle, health monitoring, IPC communication, and providing invisible service management to users. (Source: Metadata/RUNBOOK_7_METADATA.md:L6-L6) "Create the Electron Main process that orchestrates all 8 backend services for desktop deployment, managing their lifecycle, health monitoring, IPC communication, and providing invisible service..."
- IPC - File: `desktop/main/ipc-handlers.ts` (~300 lines) (Source: Metadata/RUNBOOK_7_METADATA.md:L23-L23) "- File: `desktop/main/ipc-handlers.ts` (~300 lines)"
- IPC - Purpose: IPC message handlers for renderer (Source: Metadata/RUNBOOK_7_METADATA.md:L24-L24) "- Purpose: IPC message handlers for renderer"
- IPC - Purpose: Electron preload script (expose IPC to renderer) (Source: Metadata/RUNBOOK_7_METADATA.md:L32-L32) "- Purpose: Electron preload script (expose IPC to renderer)"
- IPC 1. Records Service (port 3001) (Source: Metadata/RUNBOOK_7_METADATA.md:L40-L40) "1. Records Service (port 3001)"
- IPC 2. Ingestion Service (port 3002) (Source: Metadata/RUNBOOK_7_METADATA.md:L41-L41) "2. Ingestion Service (port 3002)"
- IPC 3. Export Service (port 3003) (Source: Metadata/RUNBOOK_7_METADATA.md:L42-L42) "3. Export Service (port 3003)"
- IPC 4. Citation Service (port 3004) (Source: Metadata/RUNBOOK_7_METADATA.md:L43-L43) "4. Citation Service (port 3004)"
- IPC 5. Evidence Service (port 3005) (Source: Metadata/RUNBOOK_7_METADATA.md:L44-L44) "5. Evidence Service (port 3005)"
- IPC 6. Template Service (port 3006) (Source: Metadata/RUNBOOK_7_METADATA.md:L45-L45) "6. Template Service (port 3006)"
- IPC 7. Analysis Service (port 3007) (Source: Metadata/RUNBOOK_7_METADATA.md:L46-L46) "7. Analysis Service (port 3007)"
- IPC 8. (Reserved for future service, port 3008) (Source: Metadata/RUNBOOK_7_METADATA.md:L47-L47) "8. (Reserved for future service, port 3008)"
- IPC #### IPC Channels (Server - Orchestrator Handles These) (Source: Metadata/RUNBOOK_7_METADATA.md:L74-L74) "#### IPC Channels (Server - Orchestrator Handles These)"
- IPC - From: Renderer → To: Orchestrator → **Channel: services:get-all** (Source: Metadata/RUNBOOK_7_METADATA.md:L78-L78) "- From: Renderer → To: Orchestrator → **Channel: services:get-all**"
- IPC port: 3001, (Source: Metadata/RUNBOOK_7_METADATA.md:L84-L84) "port: 3001,"
- IPC - From: Renderer → To: Orchestrator → **Channel: services:start** (Source: Metadata/RUNBOOK_7_METADATA.md:L94-L94) "- From: Renderer → To: Orchestrator → **Channel: services:start**"
- IPC - From: Renderer → To: Orchestrator → **Channel: services:stop** (Source: Metadata/RUNBOOK_7_METADATA.md:L100-L100) "- From: Renderer → To: Orchestrator → **Channel: services:stop**"
- IPC - From: Renderer → To: Orchestrator → **Channel: services:restart** (Source: Metadata/RUNBOOK_7_METADATA.md:L106-L106) "- From: Renderer → To: Orchestrator → **Channel: services:restart**"
- IPC - From: Renderer → To: Orchestrator → **Channel: database:init** (Source: Metadata/RUNBOOK_7_METADATA.md:L114-L114) "- From: Renderer → To: Orchestrator → **Channel: database:init**"
- IPC - From: Renderer → To: Orchestrator → **Channel: database:status** (Source: Metadata/RUNBOOK_7_METADATA.md:L120-L120) "- From: Renderer → To: Orchestrator → **Channel: database:status**"
- IPC - From: Renderer → To: Orchestrator → **Channel: logs:get** (Source: Metadata/RUNBOOK_7_METADATA.md:L128-L128) "- From: Renderer → To: Orchestrator → **Channel: logs:get**"
- IPC - From: Renderer → To: Orchestrator → **Channel: logs:clear** (Source: Metadata/RUNBOOK_7_METADATA.md:L142-L142) "- From: Renderer → To: Orchestrator → **Channel: logs:clear**"
- IPC - From: Renderer → To: Orchestrator → **Channel: app:get-path** (Source: Metadata/RUNBOOK_7_METADATA.md:L150-L150) "- From: Renderer → To: Orchestrator → **Channel: app:get-path**"
- IPC - From: Renderer → To: Orchestrator → **Channel: app:quit** (Source: Metadata/RUNBOOK_7_METADATA.md:L156-L156) "- From: Renderer → To: Orchestrator → **Channel: app:quit**"
- IPC #### IPC Channels (Client - Orchestrator Emits) (Source: Metadata/RUNBOOK_7_METADATA.md:L162-L162) "#### IPC Channels (Client - Orchestrator Emits)"
- IPC - From: Orchestrator → To: Renderer → **Channel: service:status-changed** (Source: Metadata/RUNBOOK_7_METADATA.md:L166-L166) "- From: Orchestrator → To: Renderer → **Channel: service:status-changed**"
- IPC - From: Orchestrator → To: Renderer → **Channel: service:error** (Source: Metadata/RUNBOOK_7_METADATA.md:L172-L172) "- From: Orchestrator → To: Renderer → **Channel: service:error**"
- IPC - From: Orchestrator → To: Renderer → **Channel: database:initialized** (Source: Metadata/RUNBOOK_7_METADATA.md:L180-L180) "- From: Orchestrator → To: Renderer → **Channel: database:initialized**"
- IPC - Listen for IPC messages from renderer (Source: Metadata/RUNBOOK_7_METADATA.md:L202-L202) "- Listen for IPC messages from renderer"
- IPC - Handle service lifecycle requests from renderer (Source: Metadata/RUNBOOK_7_METADATA.md:L206-L206) "- Handle service lifecycle requests from renderer"
- IPC - Environment: Inject PORT, DATABASE_URL, SERVICE_NAME, DEPLOYMENT_ENV (Source: Metadata/RUNBOOK_7_METADATA.md:L221-L221) "- Environment: Inject PORT, DATABASE_URL, SERVICE_NAME, DEPLOYMENT_ENV"
- IPC - Purpose: No port conflicts, resource leaks (Source: Metadata/RUNBOOK_7_METADATA.md:L240-L240) "- Purpose: No port conflicts, resource leaks"
- IPC - Detection: Port already in use (EADDRINUSE) (Source: Metadata/RUNBOOK_7_METADATA.md:L242-L242) "- Detection: Port already in use (EADDRINUSE)"
- IPC - Enforced by: Service registry (hardcoded port assignments) (Source: Metadata/RUNBOOK_7_METADATA.md:L247-L247) "- Enforced by: Service registry (hardcoded port assignments)"
- IPC - Violation: Port conflicts (if user has other apps on these ports) (Source: Metadata/RUNBOOK_7_METADATA.md:L249-L249) "- Violation: Port conflicts (if user has other apps on these ports)"
- IPC - Rule: Health monitor runs in background (async), doesn't block IPC (Source: Metadata/RUNBOOK_7_METADATA.md:L256-L256) "- Rule: Health monitor runs in background (async), doesn't block IPC"
- IPC ✓ Starting Records Service... OK (port 3001) (Source: Metadata/RUNBOOK_7_METADATA.md:L314-L314) "✓ Starting Records Service... OK (port 3001)"
- IPC ✓ Starting Ingestion Service... OK (port 3002) (Source: Metadata/RUNBOOK_7_METADATA.md:L315-L315) "✓ Starting Ingestion Service... OK (port 3002)"
- IPC ✓ Starting Export Service... OK (port 3003) (Source: Metadata/RUNBOOK_7_METADATA.md:L316-L316) "✓ Starting Export Service... OK (port 3003)"
- IPC ✓ Starting Citation Service... OK (port 3004) (Source: Metadata/RUNBOOK_7_METADATA.md:L317-L317) "✓ Starting Citation Service... OK (port 3004)"
- IPC ✓ Starting Evidence Service... OK (port 3005) (Source: Metadata/RUNBOOK_7_METADATA.md:L318-L318) "✓ Starting Evidence Service... OK (port 3005)"
- IPC ✓ Starting Template Service... OK (port 3006) (Source: Metadata/RUNBOOK_7_METADATA.md:L319-L319) "✓ Starting Template Service... OK (port 3006)"
- IPC ✓ Starting Analysis Service... OK (port 3007) (Source: Metadata/RUNBOOK_7_METADATA.md:L320-L320) "✓ Starting Analysis Service... OK (port 3007)"
- IPC **IPC Verification:** (Source: Metadata/RUNBOOK_7_METADATA.md:L336-L336) "**IPC Verification:**"
- IPC - Expected: IPC calls succeed, return expected data (Source: Metadata/RUNBOOK_7_METADATA.md:L342-L342) "- Expected: IPC calls succeed, return expected data"
- IPC - Purpose: Verify IPC communication (Source: Metadata/RUNBOOK_7_METADATA.md:L343-L343) "- Purpose: Verify IPC communication"
- IPC - Detection: Database locked errors, port conflicts (Source: Metadata/RUNBOOK_7_METADATA.md:L377-L377) "- Detection: Database locked errors, port conflicts"
- IPC - Impact: Orphaned processes consume resources, port conflicts on restart (Source: Metadata/RUNBOOK_7_METADATA.md:L383-L383) "- Impact: Orphaned processes consume resources, port conflicts on restart"
- IPC 2. Study the 10 IPC channels - these are your Renderer communication contract (Source: Metadata/RUNBOOK_7_METADATA.md:L456-L456) "2. Study the 10 IPC channels - these are your Renderer communication contract"
- IPC **Step 5: IPC Handlers** (Source: Metadata/RUNBOOK_7_METADATA.md:L482-L482) "**Step 5: IPC Handlers**"
- IPC - Implement all 10 IPC channels (services:get-all, start, stop, etc.) (Source: Metadata/RUNBOOK_7_METADATA.md:L483-L483) "- Implement all 10 IPC channels (services:get-all, start, stop, etc.)"
- IPC - Test each channel from renderer (use DevTools) (Source: Metadata/RUNBOOK_7_METADATA.md:L484-L484) "- Test each channel from renderer (use DevTools)"
- IPC **IPC Channel Validation:** (Source: Metadata/RUNBOOK_7_METADATA.md:L498-L498) "**IPC Channel Validation:**"
- IPC For EACH of the 10 IPC channels in Interfaces section: (Source: Metadata/RUNBOOK_7_METADATA.md:L499-L499) "For EACH of the 10 IPC channels in Interfaces section:"
- IPC - [ ] Channel handler implemented (Source: Metadata/RUNBOOK_7_METADATA.md:L500-L500) "- [ ] Channel handler implemented"
- IPC 4. **Don't forget environment variables:** Services need PORT, DATABASE_URL, etc. (Source: Metadata/RUNBOOK_7_METADATA.md:L510-L510) "4. **Don't forget environment variables:** Services need PORT, DATABASE_URL, etc."
- IPC - [ ] Port assignment correct (3001-3008) (Source: Metadata/RUNBOOK_7_METADATA.md:L515-L515) "- [ ] Port assignment correct (3001-3008)"
- IPC - [ ] IPC channels functional (test all 10) (Source: Metadata/RUNBOOK_7_METADATA.md:L527-L527) "- [ ] IPC channels functional (test all 10)"
- IPC - Runbook 8 (Renderer) will communicate via IPC channels (Source: Metadata/RUNBOOK_7_METADATA.md:L533-L533) "- Runbook 8 (Renderer) will communicate via IPC channels"
- IPC - Any IPC contract violations break the UI (Source: Metadata/RUNBOOK_7_METADATA.md:L534-L534) "- Any IPC contract violations break the UI"
- Schema schema (Source: Metadata/RUNBOOK_7_METADATA.md:L52-L52) "- Runbook 2: Database schema and migrations"
- Schema schema (Source: Metadata/RUNBOOK_7_METADATA.md:L501-L501) "- [ ] Request schema validated"
- Schema schema (Source: Metadata/RUNBOOK_7_METADATA.md:L502-L502) "- [ ] Response schema matches specification"
- File package.json (Source: Metadata/RUNBOOK_7_METADATA.md:L33-L33) "- File: `desktop/package.json` (configuration)"
- File tsconfig.json (Source: Metadata/RUNBOOK_7_METADATA.md:L34-L34) "- File: `desktop/tsconfig.json` (TypeScript config)"

## Invariants Relied On
- - INVARIANT: All services started before renderer window shown (Source: Metadata/RUNBOOK_7_METADATA.md:L229-L229) "- INVARIANT: All services started before renderer window shown"
- - INVARIANT: Each service has exactly one child process (Source: Metadata/RUNBOOK_7_METADATA.md:L237-L237) "- INVARIANT: Each service has exactly one child process"
- - INVARIANT: Service ports are unique and fixed (Source: Metadata/RUNBOOK_7_METADATA.md:L245-L245) "- INVARIANT: Service ports are unique and fixed"
- - INVARIANT: Health checks never block UI (Source: Metadata/RUNBOOK_7_METADATA.md:L255-L255) "- INVARIANT: Health checks never block UI"
- - INVARIANT: Unhealthy services trigger auto-restart (Source: Metadata/RUNBOOK_7_METADATA.md:L263-L263) "- INVARIANT: Unhealthy services trigger auto-restart"
- - INVARIANT: Database initialized before any service starts (Source: Metadata/RUNBOOK_7_METADATA.md:L273-L273) "- INVARIANT: Database initialized before any service starts"
- - INVARIANT: Only one orchestrator instance runs at a time (Source: Metadata/RUNBOOK_7_METADATA.md:L281-L281) "- INVARIANT: Only one orchestrator instance runs at a time"
- - INVARIANT: All services stop before orchestrator exits (Source: Metadata/RUNBOOK_7_METADATA.md:L291-L291) "- INVARIANT: All services stop before orchestrator exits"
- - INVARIANT: Database connections closed before exit (Source: Metadata/RUNBOOK_7_METADATA.md:L299-L299) "- INVARIANT: Database connections closed before exit"

## Verification Gate (Commands + Expected Outputs)
- - Purpose: Verify orchestrator starts all services (Source: Metadata/RUNBOOK_7_METADATA.md:L324-L324) "- Purpose: Verify orchestrator starts all services"
- - Purpose: Verify health monitoring works (Source: Metadata/RUNBOOK_7_METADATA.md:L329-L329) "- Purpose: Verify health monitoring works"
- - Purpose: Verify auto-restart logic (Source: Metadata/RUNBOOK_7_METADATA.md:L334-L334) "- Purpose: Verify auto-restart logic"
- - Purpose: Verify IPC communication (Source: Metadata/RUNBOOK_7_METADATA.md:L343-L343) "- Purpose: Verify IPC communication"
- - Purpose: Verify clean shutdown (Source: Metadata/RUNBOOK_7_METADATA.md:L358-L358) "- Purpose: Verify clean shutdown"
- - Verify Electron app launches (Source: Metadata/RUNBOOK_7_METADATA.md:L465-L465) "- Verify Electron app launches"
- - [ ] Auto-restart works (kill a service, verify restart) (Source: Metadata/RUNBOOK_7_METADATA.md:L526-L526) "- [ ] Auto-restart works (kill a service, verify restart)"

## Risks / Unknowns (TODOs)
- - **Risk:** Service startup race conditions (Source: Metadata/RUNBOOK_7_METADATA.md:L364-L364) "- **Risk:** Service startup race conditions"
- - **Risk:** Electron single-instance lock fails (Source: Metadata/RUNBOOK_7_METADATA.md:L372-L372) "- **Risk:** Electron single-instance lock fails"
- - **Risk:** Child process zombies (services don't stop on shutdown) (Source: Metadata/RUNBOOK_7_METADATA.md:L380-L380) "- **Risk:** Child process zombies (services don't stop on shutdown)"
- - **Risk:** Database initialization fails on first run (Source: Metadata/RUNBOOK_7_METADATA.md:L390-L390) "- **Risk:** Database initialization fails on first run"
- - **Risk:** Database locked during operation (SQLite limitation) (Source: Metadata/RUNBOOK_7_METADATA.md:L398-L398) "- **Risk:** Database locked during operation (SQLite limitation)"
- - **Risk:** Service auto-restart loop (service crashes immediately on start) (Source: Metadata/RUNBOOK_7_METADATA.md:L408-L408) "- **Risk:** Service auto-restart loop (service crashes immediately on start)"
- - **Risk:** Health monitor overwhelms services with requests (Source: Metadata/RUNBOOK_7_METADATA.md:L416-L416) "- **Risk:** Health monitor overwhelms services with requests"
- - **Risk:** Log files grow unbounded (Source: Metadata/RUNBOOK_7_METADATA.md:L424-L424) "- **Risk:** Log files grow unbounded"
- - **Risk:** Long startup time (8 services take 10-20s to start) (Source: Metadata/RUNBOOK_7_METADATA.md:L434-L434) "- **Risk:** Long startup time (8 services take 10-20s to start)"
- - **Risk:** Services crash silently (user doesn't notice) (Source: Metadata/RUNBOOK_7_METADATA.md:L442-L442) "- **Risk:** Services crash silently (user doesn't notice)"
