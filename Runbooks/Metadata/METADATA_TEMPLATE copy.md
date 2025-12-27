# Runbook Metadata Template

This template should be added to the END of each runbook (before the final "End of Runbook X" marker).

---

## Metadata Summary

### Purpose
[One-sentence statement of what this runbook creates/achieves]

### Produces (Artifacts)
**Services:**
- Service: [name] (port [XXXX])
  - Language: [TypeScript/Python]
  - Framework: [Express/FastAPI/etc]

**Files:**
- File: [path/to/file1.ts] ([size] lines, [purpose])
- File: [path/to/file2.json] (configuration)
- File: [path/to/file3.md] (documentation)

**Packages/Modules:**
- Package: [@scope/name] (npm/pip package)

**Database Objects:**
- Table: [table_name] (columns: [list])
- Migration: [YYYYMMDDHHMMSS_description.sql]

### Consumes (Prerequisites)

**Required Runbooks:**
- Runbook [X]: [What it provides]
- Runbook [Y]: [What it provides]

**Required Files:**
- File: [path/to/file] ([why needed])

**Required Environment:**
- Variable: [NAME] ([purpose])
- Port: [XXXX] ([must be available])

**Required Dependencies:**
- Package: [name@version] ([npm/pip/system])

### Interfaces Touched

#### REST Endpoints (Server)
[If this runbook creates a REST API server]
- From: [Client] → To: [This Service] → Method: [GET/POST/PUT/DELETE] Path: [/path]
  - Request: [schema or "none"]
  - Response: [schema]
  - Purpose: [what it does]

#### REST Endpoints (Client)
[If this runbook's code calls external REST APIs]
- From: [This Service] → To: [External Service] → Method: [GET/POST] Path: [/path]
  - Purpose: [why calling]

#### IPC Channels (Server)
[If this runbook handles IPC events from Electron]
- From: [Renderer/Main] → To: [This Component] → Channel: [channel-name]
  - Payload: [schema]
  - Response: [schema]
  - Purpose: [what it does]

#### IPC Channels (Client)
[If this runbook sends IPC events]
- From: [This Component] → To: [Renderer/Main] → Channel: [channel-name]
  - Payload: [schema]
  - Purpose: [why sending]

#### Filesystem
**Creates:**
- Path: [path] ([purpose])

**Reads:**
- Path: [path] ([purpose])

**Modifies:**
- Path: [path] ([purpose])

#### Process Lifecycle
[If applicable]
- Spawns: [process name] ([command])
- Manages: [process name] (lifecycle: start/stop/restart)
- Monitors: [process name] (health checks)

### Invariants

[List all invariants that MUST hold true]

**Data Invariants:**
- INVARIANT: [Description of data constraint]
  - Example: `Sentence.text === paragraph.text.slice(start_offset, end_offset)`
  - Enforced by: [Code location or validation]

**Type Invariants:**
- INVARIANT: [TypeScript type constraint]
  - Example: All IDs are UUIDs (string format)
  - Enforced by: TypeScript compiler + runtime validation

**Schema Invariants:**
- INVARIANT: [Database/JSON schema constraint]
  - Example: Foreign key template_id references templates.id
  - Enforced by: Database foreign key constraints

**Service Invariants:**
- INVARIANT: [Service-level constraint]
  - Example: Service runs on exactly one port (PORT env var or default)
  - Enforced by: Environment validation at startup

**Operational Invariants:**
- INVARIANT: [Runtime behavior constraint]
  - Example: All timestamps are ISO 8601 format with timezone
  - Enforced by: Date serialization utilities

### Verification Gates

**Build Verification:**
- Command: `[build command]`
- Expected: [output/result]
- Purpose: Verify code compiles/builds

**Test Verification:**
- Command: `[test command]`
- Expected: [X tests pass, 0 failures]
- Purpose: Verify functionality

**Runtime Verification:**
- Command: `[run command or curl/request]`
- Expected: [specific output]
- Purpose: Verify service operational

**Integration Verification:**
- Command: `[integration test command]`
- Expected: [result]
- Purpose: Verify interfaces working

**Linting/Type Verification:**
- Command: `[lint command]`
- Expected: [0 errors]
- Purpose: Verify code quality

### Risks

**[Risk Category] Risks:**

- **Risk:** [Description of risk]
  - **Severity:** [CRITICAL/HIGH/MEDIUM/LOW]
  - **Likelihood:** [HIGH/MEDIUM/LOW]
  - **Impact:** [What happens if this occurs]
  - **Mitigation:** [How to prevent/handle]
  - **Detection:** [How to detect if it occurs]

**Categories:**
- **Technical Risks:** Code/architecture issues
- **Operational Risks:** Runtime/deployment issues
- **Security Risks:** Vulnerabilities
- **Performance Risks:** Scalability/speed issues
- **Data Risks:** Data loss/corruption issues
- **Integration Risks:** Inter-service communication issues

---

## Template Notes

**When to mark "N/A":**
- If a section doesn't apply to this runbook, write "N/A" with brief explanation
- Example: "REST Endpoints (Client): N/A - This service does not call external APIs"

**When to mark "See Code":**
- Never. Always extract and document explicitly.
- The metadata is the SOURCE OF TRUTH for interfaces, not the code.

**Interface Mapping Rules:**
- "From" and "To" must be specific component names, not generic
- Good: "From: Renderer → To: Records Service"
- Bad: "From: Frontend → To: Backend"

**Invariant Rules:**
- Prefix with "INVARIANT:" for audit tool detection
- Include WHERE it's enforced (code file, database, runtime)
- Explain WHY it matters (what breaks if violated)

**Risk Severity Definitions:**
- **CRITICAL:** System unusable, data loss, security breach
- **HIGH:** Major functionality broken, significant user impact
- **MEDIUM:** Feature degraded, some users affected, workaround exists
- **LOW:** Minor issue, cosmetic, edge case
