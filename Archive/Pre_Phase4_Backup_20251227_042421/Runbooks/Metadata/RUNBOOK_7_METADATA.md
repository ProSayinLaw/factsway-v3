---

## Metadata Summary

### Purpose
Create the Electron Main process that orchestrates all 8 backend services for desktop deployment, managing their lifecycle, health monitoring, IPC communication, and providing invisible service management to users.

### Produces (Artifacts)

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

### Consumes (Prerequisites)

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

### Interfaces Touched

#### IPC Channels (Server - Orchestrator Handles These)

**Service Management:**

- From: Renderer → To: Orchestrator → **Channel: services:get-all**
  - Request: None
  - Response: `ServiceStatus[]`
    ```typescript
    {
      name: "records",
      port: 3001,
      status: "running"|"stopped"|"starting"|"unhealthy",
      pid: number | null,
      uptime: number, // seconds
      lastHealthCheck: string // ISO timestamp
    }[]
    ```
  - Purpose: Get status of all services for UI display
  - When: On renderer mount, periodic polling

- From: Renderer → To: Orchestrator → **Channel: services:start**
  - Request: `{ serviceName: string }` (e.g., "records")
  - Response: `{ success: boolean, error?: string }`
  - Purpose: Start a specific service manually
  - When: User clicks "Start Service" in debug panel

- From: Renderer → To: Orchestrator → **Channel: services:stop**
  - Request: `{ serviceName: string }`
  - Response: `{ success: boolean, error?: string }`
  - Purpose: Stop a specific service manually
  - When: User clicks "Stop Service" in debug panel

- From: Renderer → To: Orchestrator → **Channel: services:restart**
  - Request: `{ serviceName: string }`
  - Response: `{ success: boolean, error?: string }`
  - Purpose: Restart a specific service
  - When: Service unhealthy, user initiates manual restart

**Database Management:**

- From: Renderer → To: Orchestrator → **Channel: database:init**
  - Request: None
  - Response: `{ success: boolean, migrationsRun: number, error?: string }`
  - Purpose: Initialize database on first run
  - When: App first launch, no database file exists

- From: Renderer → To: Orchestrator → **Channel: database:status**
  - Request: None
  - Response: `{ initialized: boolean, version: string, path: string }`
  - Purpose: Check database status
  - When: Settings page, diagnostics

**Logs:**

- From: Renderer → To: Orchestrator → **Channel: logs:get**
  - Request: `{ serviceName?: string, lines?: number }` (defaults: all services, 100 lines)
  - Response: `{ logs: LogEntry[] }`
    ```typescript
    {
      timestamp: string,
      service: string,
      level: "info"|"warn"|"error"|"debug",
      message: string
    }[]
    ```
  - Purpose: Retrieve aggregated logs for debugging
  - When: User opens debug panel, developer tools

- From: Renderer → To: Orchestrator → **Channel: logs:clear**
  - Request: None
  - Response: `{ success: boolean }`
  - Purpose: Clear log files
  - When: User clears logs, logs grow too large

**Application Lifecycle:**

- From: Renderer → To: Orchestrator → **Channel: app:get-path**
  - Request: `{ pathName: "userData"|"logs"|"temp" }`
  - Response: `{ path: string }`
  - Purpose: Get application directories
  - When: Renderer needs to display paths (Settings page)

- From: Renderer → To: Orchestrator → **Channel: app:quit**
  - Request: None
  - Response: None (app quits)
  - Purpose: Gracefully quit app (stops all services first)
  - When: User quits app (Cmd+Q, File → Quit)

#### IPC Channels (Client - Orchestrator Emits)

**Service Events:**

- From: Orchestrator → To: Renderer → **Channel: service:status-changed**
  - Payload: `{ serviceName: string, status: ServiceStatus }`
  - Purpose: Notify renderer when service status changes
  - When: Service starts, stops, crashes, becomes unhealthy
  - Renderer Action: Update UI indicator (green/yellow/red dot)

- From: Orchestrator → To: Renderer → **Channel: service:error**
  - Payload: `{ serviceName: string, error: string, timestamp: string }`
  - Purpose: Notify renderer of service errors
  - When: Service crashes, startup failure
  - Renderer Action: Show error notification, prompt user to check logs

**Database Events:**

- From: Orchestrator → To: Renderer → **Channel: database:initialized**
  - Payload: `{ success: boolean, migrationsRun: number }`
  - Purpose: Notify renderer that database is ready
  - When: First run initialization completes
  - Renderer Action: Enable UI, hide loading screen

#### Process Lifecycle

**Orchestrator Lifecycle:**

1. **Startup Sequence:**
   - Electron app starts
   - Check if first run (database doesn't exist)
   - If first run: Create database, run migrations
   - Load service registry (8 services, ports, commands)
   - Start all services sequentially (wait for service:ready from each)
   - Start health monitor (polls every 10s)
   - Create Electron window
   - Load renderer (Runbook 8)
   - Emit database:initialized to renderer

2. **Runtime:**
   - Listen for IPC messages from renderer
   - Monitor service health (HTTP GET /health every 10s)
   - Restart crashed services automatically (max 3 retries)
   - Aggregate logs from all service stdout/stderr
   - Handle service lifecycle requests from renderer
   - Emit status changes to renderer

3. **Shutdown Sequence:**
   - Receive quit signal (app.quit(), Cmd+Q, or app close)
   - Send SIGTERM to all services (graceful shutdown)
   - Wait up to 5s for services to stop
   - Send SIGKILL to any remaining services (force kill)
   - Close database connections
   - Flush logs
   - Exit with code 0

**Service Spawning (per service):**
- Command: `node dist/index.js` (TypeScript services) or `python main.py` (Python services)
- Working Directory: `services/{service-name}/`
- Environment: Inject PORT, DATABASE_URL, SERVICE_NAME, DEPLOYMENT_ENV
- Stdio: Pipe stdout/stderr to orchestrator (for log aggregation)
- Detached: false (services die when orchestrator dies)

### Invariants

**Service Management Invariants:**

- INVARIANT: All services started before renderer window shown
  - Rule: Orchestrator waits for all service:ready events before createWindow()
  - Enforced by: Startup sequence logic
  - Purpose: UI never tries to call unavailable services
  - Violation: Renderer loads before services ready
  - Detection: Connection refused errors from renderer
  - Recovery: Show loading screen until all services ready

- INVARIANT: Each service has exactly one child process
  - Rule: No duplicate service processes (same service can't run twice)
  - Enforced by: Service manager tracks PIDs, prevents duplicate starts
  - Purpose: No port conflicts, resource leaks
  - Violation: Multiple processes for same service
  - Detection: Port already in use (EADDRINUSE)
  - Recovery: Kill duplicate process, restart

- INVARIANT: Service ports are unique and fixed
  - Rule: Records=3001, Ingestion=3002, ..., Analysis=3007
  - Enforced by: Service registry (hardcoded port assignments)
  - Purpose: Predictable service discovery
  - Violation: Port conflicts (if user has other apps on these ports)
  - Detection: EADDRINUSE on service start
  - Recovery: Log error, prompt user to close conflicting apps

**Health Monitoring Invariants:**

- INVARIANT: Health checks never block UI
  - Rule: Health monitor runs in background (async), doesn't block IPC
  - Enforced by: Async/await pattern, separate event loop
  - Purpose: Responsive UI even if services unhealthy
  - Violation: UI freezes during health checks
  - Detection: UI becomes unresponsive
  - Recovery: None (design ensures this can't happen)

- INVARIANT: Unhealthy services trigger auto-restart
  - Rule: If service health check fails 3 times (30s), restart service
  - Enforced by: Health monitor logic with retry counter
  - Purpose: Automatic recovery from transient failures
  - Violation: Service stays unhealthy indefinitely
  - Detection: Service status stays "unhealthy" for >5 minutes
  - Recovery: Manual restart via UI

**Database Invariants:**

- INVARIANT: Database initialized before any service starts
  - Rule: Migrations run before service spawning begins
  - Enforced by: Startup sequence order
  - Purpose: Services never query non-existent tables
  - Violation: Service crashes on first query (table not found)
  - Detection: Service startup errors, database errors
  - Recovery: Stop all services, re-run migrations, restart

- INVARIANT: Only one orchestrator instance runs at a time
  - Rule: Electron ensures single instance (app.requestSingleInstanceLock())
  - Enforced by: Electron framework
  - Purpose: No database lock conflicts, no duplicate services
  - Violation: Two orchestrator instances try to run
  - Detection: Second instance fails to start (lock already held)
  - Recovery: Second instance quits immediately, focuses first instance

**Shutdown Invariants:**

- INVARIANT: All services stop before orchestrator exits
  - Rule: Orchestrator sends SIGTERM to all services, waits for exit
  - Enforced by: Shutdown sequence logic
  - Purpose: Clean shutdown, no orphaned processes
  - Violation: Orchestrator exits while services still running
  - Detection: Orphaned service processes (ps aux shows stale processes)
  - Recovery: Manual kill (kill -9 {pid})

- INVARIANT: Database connections closed before exit
  - Rule: All database handles closed in shutdown sequence
  - Enforced by: Shutdown logic calls db.close()
  - Purpose: No database lock held after quit
  - Violation: Database remains locked after quit
  - Detection: Next launch fails (database locked)
  - Recovery: Delete lock file, restart

### Verification Gates

**Service Startup Verification:**
- Command: `npm start` (launches Electron app)
- Expected:
  ```
  ✓ Database initialized
  ✓ Starting Records Service... OK (port 3001)
  ✓ Starting Ingestion Service... OK (port 3002)
  ✓ Starting Export Service... OK (port 3003)
  ✓ Starting Citation Service... OK (port 3004)
  ✓ Starting Evidence Service... OK (port 3005)
  ✓ Starting Template Service... OK (port 3006)
  ✓ Starting Analysis Service... OK (port 3007)
  ✓ All services ready
  ✓ Creating window
  ```
- Purpose: Verify orchestrator starts all services

**Health Monitoring Verification:**
- Command: Open Electron DevTools, call `electronAPI.getServices()`
- Expected: Array of 8 ServiceStatus objects, all with status="running"
- Purpose: Verify health monitoring works

**Service Restart Verification:**
- Command: Kill a service manually (`kill -9 {pid}`), wait 10s
- Expected: Orchestrator detects crash, restarts service automatically
- Purpose: Verify auto-restart logic

**IPC Verification:**
- Command: In renderer DevTools:
  ```javascript
  await electronAPI.getServices() // Should return 8 services
  await electronAPI.getLogs({ serviceName: "records" }) // Should return logs
  ```
- Expected: IPC calls succeed, return expected data
- Purpose: Verify IPC communication

**Graceful Shutdown Verification:**
- Command: Quit app (Cmd+Q), check process list
- Expected:
  ```
  ✓ Shutting down services...
  ✓ Records Service stopped
  ✓ Ingestion Service stopped
  (... all 8 services stopped ...)
  ✓ Database connections closed
  ✓ Logs flushed
  ✓ Exiting
  ```
- Expected: No orphaned processes (ps aux | grep node shows nothing)
- Purpose: Verify clean shutdown

### Risks

**Technical Risks:**

- **Risk:** Service startup race conditions
  - Severity: HIGH
  - Likelihood: MEDIUM
  - Impact: Services start out of order, dependencies missing
  - Mitigation: Start services sequentially, wait for service:ready before starting next
  - Detection: Services fail to start, connection refused errors
  - Recovery: Restart orchestrator

- **Risk:** Electron single-instance lock fails
  - Severity: MEDIUM
  - Likelihood: LOW
  - Impact: Two orchestrator instances run, database corruption
  - Mitigation: Add manual lock file check as backup
  - Detection: Database locked errors, port conflicts
  - Recovery: Kill duplicate processes manually

- **Risk:** Child process zombies (services don't stop on shutdown)
  - Severity: HIGH
  - Likelihood: MEDIUM (if SIGTERM ignored)
  - Impact: Orphaned processes consume resources, port conflicts on restart
  - Mitigation: Use SIGKILL after 5s timeout if SIGTERM fails
  - Detection: ps aux shows stale node/python processes
  - Recovery: Manual kill (kill -9)

**Data Risks:**

- **Risk:** Database initialization fails on first run
  - Severity: CRITICAL
  - Likelihood: LOW
  - Impact: App unusable, no tables exist
  - Mitigation: Catch migration errors, show error UI, prompt manual fix
  - Detection: Migration errors in logs, services can't query tables
  - Recovery: Delete database file, restart app (re-run migrations)

- **Risk:** Database locked during operation (SQLite limitation)
  - Severity: HIGH
  - Likelihood: MEDIUM (SQLite is single-writer)
  - Impact: Write operations fail, data loss
  - Mitigation: Use WAL mode (Write-Ahead Logging), set busy_timeout=5000ms
  - Detection: SQLITE_BUSY errors
  - Recovery: Retry write operation

**Operational Risks:**

- **Risk:** Service auto-restart loop (service crashes immediately on start)
  - Severity: HIGH
  - Likelihood: MEDIUM
  - Impact: Infinite crash-restart loop, high CPU, log spam
  - Mitigation: Max 3 restarts, then give up (mark service as "failed")
  - Detection: Service restarts repeatedly in logs
  - Recovery: User manually restarts after fixing issue

- **Risk:** Health monitor overwhelms services with requests
  - Severity: MEDIUM
  - Likelihood: LOW (10s interval is reasonable)
  - Impact: Services slow down, health checks time out
  - Mitigation: Use 10s interval (not too frequent), timeout after 2s
  - Detection: Health checks always timing out
  - Recovery: Increase interval, reduce timeout

- **Risk:** Log files grow unbounded
  - Severity: MEDIUM
  - Likelihood: HIGH (if app runs for months)
  - Impact: Disk space exhausted, app crashes
  - Mitigation: Log rotation (max 10 files × 10MB each), compress old logs
  - Detection: Disk space warnings
  - Recovery: Delete old log files

**User Experience Risks:**

- **Risk:** Long startup time (8 services take 10-20s to start)
  - Severity: MEDIUM
  - Likelihood: HIGH
  - Impact: Poor UX, users think app hung
  - Mitigation: Show loading screen with progress (X/8 services started)
  - Detection: User complaints about slow startup
  - Recovery: Optimize service startup (parallel start for independent services)

- **Risk:** Services crash silently (user doesn't notice)
  - Severity: HIGH
  - Likelihood: MEDIUM
  - Impact: Features broken, user confused why operations fail
  - Mitigation: Show notification when service crashes, prompt restart
  - Detection: Service status indicators in UI (green/red dots)
  - Recovery: User clicks "Restart Service" button

## Template Notes

**Implementation Priority:** CRITICAL - Nothing works without the Orchestrator

**Before Starting Implementation:**
1. All 8 backend services (Runbooks 3-6) must be complete and runnable
2. Study the 10 IPC channels - these are your Renderer communication contract
3. Service startup order matters - follow the lifecycle specification exactly
4. This is the "conductor" - it doesn't do work, it coordinates workers

**LLM-Assisted Implementation Strategy:**

**Step 1: Basic Electron Setup**
- Create Electron Main process
- Implement window creation (empty window is fine)
- Verify Electron app launches

**Step 2: Database Initialization**
- Implement migration runner (SQLite for desktop)
- Run migrations on first launch
- Emit database:initialized event to renderer

**Step 3: Service Manager (Core Logic)**
- Implement service spawning (Node.js child_process)
- Start services sequentially (wait for service:ready from each)
- Track service PIDs and status

**Step 4: Health Monitor**
- Poll /health endpoint every 10s for all 8 services
- Detect failures, trigger auto-restart (max 3 retries)
- Emit service:status-changed to renderer

**Step 5: IPC Handlers**
- Implement all 10 IPC channels (services:get-all, start, stop, etc.)
- Test each channel from renderer (use DevTools)

**Step 6: Graceful Shutdown**
- Send SIGTERM to all services
- Wait 5s, then SIGKILL if needed
- Close database connections
- Exit cleanly

**Critical Invariants to Enforce:**
- **Startup order (HARD):** Database BEFORE services, all services BEFORE window
- **Single instance (HARD):** Only one orchestrator can run (use Electron lock)
- **Service isolation (HARD):** Each service has exactly one child process (no duplicates)
- **Graceful shutdown (HARD):** All services stopped before orchestrator exits

**IPC Channel Validation:**
For EACH of the 10 IPC channels in Interfaces section:
- [ ] Channel handler implemented
- [ ] Request schema validated
- [ ] Response schema matches specification
- [ ] Error cases handled
- [ ] Renderer can call successfully

**Common LLM Pitfalls to Avoid:**
1. **Don't start services in parallel:** Sequential startup prevents race conditions
2. **Don't ignore service crashes:** Implement auto-restart (max 3 retries)
3. **Don't skip health checks:** Services can fail at any time, monitor continuously
4. **Don't forget environment variables:** Services need PORT, DATABASE_URL, etc.

**Service Spawning Checklist (8 Services):**
For EACH service (Records, Ingestion, Export, Citation, Evidence, Template, Analysis, Reserved):
- [ ] Service executable exists
- [ ] Port assignment correct (3001-3008)
- [ ] Environment variables injected
- [ ] Working directory set correctly
- [ ] stdout/stderr captured for logs
- [ ] service:ready event received
- [ ] Health check responds

**Validation Checklist (Before Proceeding to Runbook 8):**
- [ ] All 8 services start automatically
- [ ] Database initialized on first run
- [ ] Health monitor detects unhealthy services
- [ ] Auto-restart works (kill a service, verify restart)
- [ ] IPC channels functional (test all 10)
- [ ] Graceful shutdown works (no orphaned processes)
- [ ] Logs aggregated from all services
- [ ] All 5 verification gates executed and passed

**Handoff to Next Runbook:**
- Runbook 8 (Renderer) will communicate via IPC channels
- Any IPC contract violations break the UI
- Service coordination issues discovered here, not in Renderer

---

**End of Metadata for Runbook 7**
