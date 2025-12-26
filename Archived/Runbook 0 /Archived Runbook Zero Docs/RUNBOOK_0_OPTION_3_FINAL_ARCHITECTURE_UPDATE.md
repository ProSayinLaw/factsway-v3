# Runbook 0 - Option 3 Architecture Update (FINAL)

**Date:** December 24, 2024  
**Purpose:** Update Runbook 0 to reflect microservices architecture (Option 3) with production-ready deployment  
**Status:** Edit 54 - Final Architectural Revision  
**Impact:** Major (architecture changes), but preserves all existing specifications

**External Review:** Gemini 2.0 Flash Thinking (Independent architectural audit)  
**Approval:** All critical issues addressed, ready for one-shot build

---

## Executive Summary

**What's changing:** The deployment architecture - from monolithic Electron app to microservices with environment-appropriate orchestration.

**What's NOT changing:** 
- All data models (Template, Case, Draft, Evidence, etc.) ✅ Keep as-is
- All UI/UX specifications (Tiptap, Evidence sidebar, etc.) ✅ Keep as-is  
- All document processing logic (NUPunkt, citation detection, etc.) ✅ Keep as-is
- Export pipeline (Pandoc, OOXML generation) ✅ Keep as-is
- Design system (Section 19) ✅ Keep as-is

**Key architectural principle:** Logical microservices with deployment flexibility
- Services communicate via REST APIs (strict contracts)
- Cloud deployment: Docker/Kubernetes
- Desktop deployment: Child processes (NOT Docker - critical correction)
- Same service code, different orchestration

**Critical production safeguards:**
1. ✅ PID management prevents zombie processes on desktop
2. ✅ Environment-based service discovery (localhost vs k8s DNS)
3. ✅ Health check orchestration with graceful degradation
4. ✅ Automatic crash recovery and service restart

---

## Update Strategy

### Sections Requiring Changes

| Section | Type | Description |
|---------|------|-------------|
| **1. System Overview** | EXPAND | Add deployment models explanation |
| **10. API Endpoints** | CLARIFY | These are actual REST APIs between services |
| **15. Technology Stack** | MAJOR REVISION | Service-oriented architecture + orchestration |
| **16. File Structure** | MAJOR REVISION | Services structure instead of monolith |
| **NEW: 21. Deployment Models** | ADD | Desktop (processes), Cloud (containers), Enterprise |
| **NEW: 22. Service Discovery** | ADD | Environment-based configuration |
| **NEW: 23. Freemium Strategy** | ADD | Web trial → Desktop conversion |

### Sections Unchanged

All other sections (2-9, 11-14, 17-20, Appendices) remain as specified. The data architecture, UI components, document processing, and export pipeline are deployment-agnostic.

---

## Edit 54A: Section 1 - System Overview (Expand)

**Current text (lines 60-178):** Keep all existing content, ADD new subsection after line 178:

### NEW SUBSECTION 1.7: Deployment Architecture

FACTSWAY uses a microservices architecture that supports multiple deployment models while maintaining a consistent user experience.

#### Service-Oriented Design

The platform is built as independent services communicating via REST APIs:

```
Core Services:
├── Records Service (port 3001)
│   └── Template, Case, Draft CRUD operations
├── Ingestion Service (port 3002)  
│   └── DOCX → LegalDocument parsing
├── Export Service (port 3003)
│   └── LegalDocument → DOCX generation
├── CaseBlock Service (port 3004)
│   └── Case caption extraction and formatting
├── Signature Service (port 3005)
│   └── Signature block extraction and formatting
├── Facts Service (port 3006)
│   └── Sentence registry and evidence linking
├── Exhibits Service (port 3007)
│   └── Exhibit management and appendix generation
└── Caselaw Service (port 3008)
    └── Citation detection and linking
```

**Key architectural principles:**

1. **Service Independence:** Each service can be developed, tested, and deployed independently
2. **Clean Contracts:** Services communicate via documented REST APIs (Section 10)
3. **Deployment Flexibility:** Same services run as child processes (desktop) OR containers (cloud)
4. **Privacy by Design:** Sensitive document processing happens locally when deployed to desktop

#### Orchestration Models

**Desktop:** Services run as child processes spawned by Electron
- No Docker required
- Standard OS process management
- Lightweight resource usage
- PID tracking prevents zombie processes

**Cloud:** Services run as Docker containers in Kubernetes
- Horizontal scaling
- Load balancing
- Health monitoring
- Auto-restart on failure

#### Deployment Models

The same service code supports four deployment models:

**Model 1: Desktop App (Primary - Solo Lawyers)**

```
User's Computer
├── Electron Shell (UI container)
│   └── Vue/Tiptap frontend (localhost:8080)
├── Service Processes (spawned by Electron)
│   ├── Records Service → localhost:3001
│   ├── Ingestion Service → localhost:3002
│   ├── Export Service → localhost:3003
│   └── ... (all 8 services as executables)
├── SQLite Database
│   └── ~/Library/Application Support/FACTSWAY/
└── User's File System
    └── Documents processed locally, stored anywhere
```

**User experience:**
- Downloads installer once (~250MB)
- Services start automatically when app launches
- All processing happens on user's computer (full privacy)
- Works offline (airplane, courthouse without wifi)
- Documents stay on user's computer (Dropbox, local disk, wherever)

**Privacy:** ✅ Attorney-client privilege maintained (no cloud processing)

---

**Model 2: Web Trial (Freemium - Lead Generation)**

```
User's Browser
    ↓ (HTTPS)
Cloud Services (AWS/GCP - Docker containers)
├── Ingestion Service
├── CaseBlock Service  
├── Signature Service
└── Temporary Storage (7-day TTL)
```

**User experience:**
- No download required
- Upload motion.docx in browser
- Get reformatted case block + Excel export
- 3 uploads per day (rate limited)
- Watermarked exports

**Privacy:** ⚠️ Cloud processing (NOT for confidential work - warning displayed)

**Purpose:** Demonstrate value, convert to desktop app download

---

**Model 3: Mobile App (Pro Se Intake)**

```
User's Phone (iOS/Android)
    ↓ (HTTPS)
Cloud Services (Docker containers)
├── Voice-to-Text Service (Whisper API)
├── Facts Service (LLM structuring)
├── Evidence Upload (S3 storage)
└── Lawyer Matching Service
```

**User experience:**
- Pro se person records story via voice
- App creates structured fact list
- Uploads supporting evidence (photos, docs)
- Generates shareable intake package
- Connects with lawyers

**Privacy:** ⚠️ Pro se person not yet represented (no attorney-client privilege)

**Handoff:** Lawyer imports intake package to desktop app, continues work locally with full privacy

---

**Model 4: Enterprise On-Premise (Law Firms)**

```
Firm's Private Cloud (AWS/Azure)
├── FACTSWAY Services (Kubernetes - Docker containers)
│   ├── Records Service
│   ├── Ingestion Service
│   └── ... (all services)
├── PostgreSQL Database
└── Firm's Document Management Integration

Lawyer's Browser/Thin Client
    ↓ (HTTPS to firm's servers)
Accesses services on firm's infrastructure
```

**User experience:**
- Web-based interface
- All processing on firm's servers
- Centralized case management
- Team collaboration features

**Privacy:** ✅ Firm controls infrastructure and data

---

#### Service Communication

Services communicate via REST APIs with standardized contracts:

```typescript
// Example: Desktop app calls local service
const response = await fetch('http://localhost:3002/api/ingest', {
  method: 'POST',
  headers: { 'Content-Type': 'multipart/form-data' },
  body: formData  // Contains uploaded .docx
});

const result = await response.json();
// Returns: ParsedDocument (Section 2.4)
```

```typescript
// Example: Web trial calls cloud service
const response = await fetch('https://api.factsway.com/trial/ingest', {
  method: 'POST',
  headers: { 
    'Content-Type': 'multipart/form-data',
    'X-Trial-Token': trialToken  // Rate limiting
  },
  body: formData
});

const result = await response.json();
// Returns: Same ParsedDocument structure (same service code)
```

**Key point:** The frontend doesn't know if it's calling localhost:3002 or api.factsway.com - same API contract.

#### Benefits of This Architecture

**For Users:**
- Desktop app: Full privacy, offline capability
- Web trial: Try before download, no installation friction
- Mobile app: Accessibility for pro se litigants
- Flexible deployment based on needs

**For Development:**
- Write services once, deploy anywhere
- Test services independently
- Add new services without touching existing ones
- Scale services independently in cloud deployments

**For Business:**
- Multiple revenue streams (desktop B2C, web freemium, mobile, enterprise B2B, API licensing)
- Future-proof architecture (can add web version, mobile, API without rewrite)
- Clear upgrade path (free trial → paid desktop → enterprise)

---

## Edit 54B: Section 10 - API Endpoints (Clarify)

**Replace line 5466-5467 with:**

## 10. API Endpoints

These REST API endpoints define the contracts between FACTSWAY services. The same endpoints are used whether services run as child processes (desktop app) or in containers (cloud).

**Service Discovery via Environment Variables:**

Services never hardcode URLs. Instead, they read from environment:

```typescript
// Service code (works in all environments)
const RECORDS_URL = process.env.RECORDS_SERVICE_URL || 'http://localhost:3001';
const INGESTION_URL = process.env.INGESTION_SERVICE_URL || 'http://localhost:3002';

// Call another service
const response = await fetch(`${INGESTION_URL}/api/ingest`, { ... });
```

**Environment injection by orchestrator:**

```yaml
# Desktop (injected by Electron orchestrator)
RECORDS_SERVICE_URL=http://localhost:3001
INGESTION_SERVICE_URL=http://localhost:3002
EXPORT_SERVICE_URL=http://localhost:3003

# Cloud (injected by Kubernetes)
RECORDS_SERVICE_URL=http://records-service:3001
INGESTION_SERVICE_URL=http://ingestion-service:3002
EXPORT_SERVICE_URL=http://export-service:3003
```

**Authentication:**
- Desktop (local): None required (localhost only, no network exposure)
- Web trial: `X-Trial-Token` header (rate limited, IP-based)
- Mobile/API: OAuth 2.0 + JWT
- Enterprise: SSO integration (Okta, Azure AD)

**Keep all existing endpoint specifications (lines 5468-5719), but add this note after each endpoint:**

```markdown
**Service Discovery:**
This endpoint may be accessed at different base URLs depending on deployment:
- Desktop: `http://localhost:300X` (where X = service port)
- Web trial: `https://api.factsway.com`
- Enterprise: `https://{firm-domain}/api`

The service code uses environment variables to discover dependencies.
```

---

## Edit 54C: Section 15 - Technology Stack (Major Revision)

**Replace entire Section 15 (lines 8991-9244) with:**

## 15. Technology Stack

### 15.1 Architecture: Microservices

FACTSWAY uses a microservices architecture where independent services communicate via REST APIs.

**Service Implementation:**
- TypeScript services: Node.js 20 LTS + Express
- Python services: Python 3.11 + FastAPI
- Communication: REST/JSON over HTTP
- Packaging: Platform-specific executables (PyInstaller, pkg)

**Frontend Implementation:**
- Desktop: Electron + Vue 3 + Tiptap
- Web trial: Vue 3 SPA (Vite build)
- Mobile: React Native (future)

### 15.2 Core Services (TypeScript/Node.js)

**Records Service (port 3001)**
```json
{
  "name": "@factsway/records-service",
  "dependencies": {
    "express": "^4.18.2",
    "better-sqlite3": "^9.2.2",
    "zod": "^3.22.4",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}
```

**Responsibilities:**
- Template CRUD operations
- Case CRUD operations
- Draft CRUD operations
- Database migrations

**Environment Variables:**
```bash
PORT=3001
DB_PATH=/path/to/factsway.db
LOG_LEVEL=info
```

---

**CaseBlock Service (port 3004)**
```json
{
  "name": "@factsway/caseblock-service",
  "dependencies": {
    "express": "^4.18.2",
    "zod": "^3.22.4",
    "dotenv": "^16.3.1"
  }
}
```

**Responsibilities:**
- Extract case block from motion
- Format case block to court style
- Validate case block completeness

**Environment Variables:**
```bash
PORT=3004
RECORDS_SERVICE_URL=http://localhost:3001  # Desktop
# or http://records-service:3001 # Cloud
LOG_LEVEL=info
```

---

**Signature Service (port 3005)**
```json
{
  "name": "@factsway/signature-service",
  "dependencies": {
    "express": "^4.18.2",
    "zod": "^3.22.4"
  }
}
```

**Responsibilities:**
- Extract signature block from motion
- Format signature block to court style
- Generate attorney certification

---

**Facts Service (port 3006)**
```json
{
  "name": "@factsway/facts-service",
  "dependencies": {
    "express": "^4.18.2",
    "zod": "^3.22.4"
  }
}
```

**Responsibilities:**
- Sentence registry computation
- Evidence linking
- Citation management

---

**Exhibits Service (port 3007)**
```json
{
  "name": "@factsway/exhibits-service",
  "dependencies": {
    "express": "^4.18.2",
    "zod": "^3.22.4"
  }
}
```

**Responsibilities:**
- Exhibit management
- Appendix generation
- Exhibit marker computation (A, B, C...)

---

**Caselaw Service (port 3008)**
```json
{
  "name": "@factsway/caselaw-service",
  "dependencies": {
    "express": "^4.18.2",
    "eyecite": "^2.6.2",
    "zod": "^3.22.4"
  }
}
```

**Responsibilities:**
- Citation detection in text
- Citation validation
- Link citations to uploaded opinions

---

### 15.3 Python Services

**Ingestion Service (port 3002)**
```txt
# requirements.txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-multipart==0.0.6
python-docx==1.1.0
lxml==5.1.0
nupunkt==0.1.3
pydantic==2.5.3
python-dotenv==1.0.0
```

**Responsibilities:**
- Parse DOCX to LegalDocument
- Extract document structure
- NUPunkt sentence boundary detection
- Section hierarchy analysis

**Environment Variables:**
```bash
PORT=3002
RECORDS_SERVICE_URL=http://localhost:3001  # Injected by orchestrator
LOG_LEVEL=info
```

---

**Export Service (port 3003)**
```txt
# requirements.txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-docx==1.1.0
lxml==5.1.0
pandoc==2.3
pydantic==2.5.3
python-dotenv==1.0.0
```

**Responsibilities:**
- Generate DOCX from LegalDocument
- Pandoc markdown → DOCX conversion
- OOXML injection for complex formatting
- Certificate of service generation

**Environment Variables:**
```bash
PORT=3003
RECORDS_SERVICE_URL=http://localhost:3001
PANDOC_PATH=/usr/local/bin/pandoc  # Auto-detected if not set
LOG_LEVEL=info
```

---

### 15.4 Desktop App (Electron + Child Process Orchestration)

**CRITICAL: Desktop does NOT use Docker. Services run as child processes.**

```json
{
  "name": "factsway-desktop",
  "dependencies": {
    "electron": "^28.0.0",
    "tree-kill": "^1.2.2"
  },
  "devDependencies": {
    "electron-builder": "^24.9.1",
    "@vercel/pkg": "^5.11.0"
  }
}
```

**Responsibilities:**
- Start/stop services as child processes on app launch/quit
- Serve Vue frontend
- Native OS integration (file dialogs, menus)
- Auto-updates
- **PID management to prevent zombie processes**

#### Service Orchestration (Child Processes)

```typescript
// main/orchestrator.ts
import { spawn, ChildProcess } from 'child_process';
import { app } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import treeKill from 'tree-kill';

interface ServiceConfig {
  name: string;
  executable: string;
  args: string[];
  port: number;
  env: Record<string, string>;
}

const SERVICES: ServiceConfig[] = [
  {
    name: 'records-service',
    executable: process.platform === 'win32' 
      ? path.join(resourcesPath, 'services', 'records-service.exe')
      : path.join(resourcesPath, 'services', 'records-service'),
    args: [],
    port: 3001,
    env: {
      PORT: '3001',
      DB_PATH: path.join(app.getPath('userData'), 'factsway.db'),
      LOG_LEVEL: 'info'
    }
  },
  {
    name: 'ingestion-service',
    executable: process.platform === 'win32'
      ? path.join(resourcesPath, 'services', 'ingestion-service.exe')
      : path.join(resourcesPath, 'services', 'ingestion-service'),
    args: [],
    port: 3002,
    env: {
      PORT: '3002',
      RECORDS_SERVICE_URL: 'http://localhost:3001',
      LOG_LEVEL: 'info'
    }
  },
  {
    name: 'export-service',
    executable: process.platform === 'win32'
      ? path.join(resourcesPath, 'services', 'export-service.exe')
      : path.join(resourcesPath, 'services', 'export-service'),
    args: [],
    port: 3003,
    env: {
      PORT: '3003',
      RECORDS_SERVICE_URL: 'http://localhost:3001',
      PANDOC_PATH: getPandocPath(),  // Platform-specific
      LOG_LEVEL: 'info'
    }
  },
  // ... other services (caseblock, signature, facts, exhibits, caselaw)
];

class DesktopOrchestrator {
  private processes = new Map<string, ChildProcess>();
  private pidsFile = path.join(app.getPath('userData'), 'service-pids.json');
  
  /**
   * CRITICAL: Clean up any zombie processes from previous crash
   */
  async cleanupZombies() {
    try {
      const pidsData = await fs.readFile(this.pidsFile, 'utf-8');
      const pids: Record<string, number> = JSON.parse(pidsData);
      
      console.log('Found PIDs from previous session:', pids);
      
      // Kill all previous processes
      for (const [serviceName, pid] of Object.entries(pids)) {
        try {
          console.log(`Cleaning up zombie process: ${serviceName} (PID ${pid})`);
          
          // Use tree-kill to kill process and all children
          await new Promise<void>((resolve) => {
            treeKill(pid, 'SIGKILL', (err) => {
              if (err) {
                console.warn(`Could not kill ${serviceName} (PID ${pid}):`, err.message);
              }
              resolve();
            });
          });
        } catch (err) {
          // Process might already be dead - that's fine
          console.log(`Process ${serviceName} (PID ${pid}) already terminated`);
        }
      }
      
      // Clear the PIDs file
      await fs.unlink(this.pidsFile);
      console.log('Zombie cleanup complete');
      
    } catch (err) {
      // File doesn't exist - first launch or clean shutdown
      console.log('No zombie processes to clean up');
    }
  }
  
  /**
   * Save PIDs to file so we can kill them on next launch if needed
   */
  async savePIDs() {
    const pids: Record<string, number> = {};
    
    for (const [name, proc] of this.processes) {
      if (proc.pid) {
        pids[name] = proc.pid;
      }
    }
    
    await fs.writeFile(this.pidsFile, JSON.stringify(pids, null, 2));
  }
  
  /**
   * Start all services as child processes
   */
  async startServices() {
    // CRITICAL: Clean up zombies first
    await this.cleanupZombies();
    
    for (const service of SERVICES) {
      await this.startService(service);
    }
    
    // Save PIDs for crash recovery
    await this.savePIDs();
    
    // Wait for all services to be healthy
    await this.waitForHealthChecks();
    
    console.log('All services started and healthy');
  }
  
  /**
   * Start a single service
   */
  private async startService(service: ServiceConfig) {
    console.log(`Starting ${service.name}...`);
    
    const proc = spawn(service.executable, service.args, {
      env: {
        ...process.env,
        ...service.env
      },
      cwd: app.getPath('userData'),
      stdio: ['ignore', 'pipe', 'pipe']  // stdin ignored, stdout/stderr piped
    });
    
    // Capture logs for debugging
    proc.stdout?.on('data', (data) => {
      console.log(`[${service.name}] ${data.toString().trim()}`);
    });
    
    proc.stderr?.on('data', (data) => {
      console.error(`[${service.name}] ${data.toString().trim()}`);
    });
    
    // Handle crashes
    proc.on('exit', (code, signal) => {
      console.error(`${service.name} exited with code ${code}, signal ${signal}`);
      
      if (code !== 0 && code !== null) {
        // Service crashed - try to restart
        console.log(`Attempting to restart ${service.name}...`);
        setTimeout(() => {
          this.restartService(service.name);
        }, 2000);  // 2 second delay
      }
    });
    
    // Handle spawn errors
    proc.on('error', (err) => {
      console.error(`Failed to start ${service.name}:`, err);
    });
    
    this.processes.set(service.name, proc);
    
    console.log(`${service.name} started with PID ${proc.pid}`);
  }
  
  /**
   * Restart a crashed service
   */
  private async restartService(serviceName: string) {
    const service = SERVICES.find(s => s.name === serviceName);
    if (!service) {
      console.error(`Service ${serviceName} not found in config`);
      return;
    }
    
    // Remove old process
    this.processes.delete(serviceName);
    
    // Start new process
    await this.startService(service);
    
    // Update PIDs file
    await this.savePIDs();
  }
  
  /**
   * Wait for all services to respond to health checks
   */
  async waitForHealthChecks() {
    const healthPromises = SERVICES.map(service => 
      this.waitForServiceHealth(service.name, service.port)
    );
    
    await Promise.all(healthPromises);
  }
  
  /**
   * Wait for a specific service to be healthy
   */
  private async waitForServiceHealth(name: string, port: number): Promise<void> {
    const url = `http://localhost:${port}/health`;
    const maxAttempts = 30;  // 30 seconds timeout
    const delayMs = 1000;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          console.log(`${name} health check passed:`, data);
          return;
        }
      } catch (err) {
        // Service not ready yet
      }
      
      if (attempt === maxAttempts) {
        throw new Error(`${name} failed to become healthy after ${maxAttempts} seconds`);
      }
      
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  /**
   * Stop all services gracefully
   */
  async stopServices() {
    console.log('Stopping all services...');
    
    for (const [name, proc] of this.processes) {
      if (proc.pid) {
        console.log(`Stopping ${name} (PID ${proc.pid})...`);
        
        // Try graceful shutdown first
        proc.kill('SIGTERM');
        
        // Wait 5 seconds, then force kill if needed
        await new Promise<void>((resolve) => {
          const timeout = setTimeout(() => {
            console.log(`Force killing ${name}...`);
            treeKill(proc.pid!, 'SIGKILL', () => resolve());
          }, 5000);
          
          proc.on('exit', () => {
            clearTimeout(timeout);
            resolve();
          });
        });
      }
    }
    
    this.processes.clear();
    
    // Clean up PIDs file (clean shutdown)
    try {
      await fs.unlink(this.pidsFile);
    } catch (err) {
      // File might not exist - that's fine
    }
    
    console.log('All services stopped');
  }
}

// Usage in Electron main process
const orchestrator = new DesktopOrchestrator();

app.on('ready', async () => {
  try {
    await orchestrator.startServices();
    createWindow();  // Now safe to show UI
  } catch (err) {
    console.error('Failed to start services:', err);
    app.quit();
  }
});

app.on('before-quit', async (event) => {
  event.preventDefault();  // Prevent quit until cleanup done
  
  await orchestrator.stopServices();
  
  app.exit(0);  // Now actually quit
});

// Handle hard crashes
process.on('uncaughtException', async (err) => {
  console.error('Uncaught exception:', err);
  await orchestrator.stopServices();
  app.exit(1);
});
```

**Key safeguards:**

1. ✅ **Zombie cleanup:** Kills leftover processes from crashes
2. ✅ **PID tracking:** Records all process IDs for recovery
3. ✅ **Health checks:** Waits for services before showing UI
4. ✅ **Auto-restart:** Crashed services restart automatically
5. ✅ **Graceful shutdown:** SIGTERM first, SIGKILL if needed
6. ✅ **Tree kill:** Kills service and all child processes

---

### 15.5 Service Bundling (Desktop Distribution)

**Python services → Standalone executables (PyInstaller)**

```bash
# Build ingestion service
cd services/ingestion-service

pyinstaller \
  --onefile \
  --name ingestion-service \
  --add-data "models:models" \
  --hidden-import=nupunkt \
  --hidden-import=uvicorn \
  main.py

# Output: dist/ingestion-service (macOS/Linux)
#         dist/ingestion-service.exe (Windows)
```

**Node services → Standalone executables (pkg)**

```bash
# Build records service
cd services/records-service

pkg . \
  --targets node20-macos-x64,node20-win-x64,node20-linux-x64 \
  --output ../../dist/services/records-service

# Output: records-service (macOS)
#         records-service.exe (Windows)
#         records-service (Linux)
```

**Result:** Each service is a single executable with runtime + dependencies bundled.

---

### 15.6 Electron Bundling

**electron-builder configuration:**
```json
{
  "appId": "com.factsway.app",
  "productName": "FACTSWAY",
  "directories": {
    "output": "dist"
  },
  "files": [
    "dist-electron/**/*",
    "dist/**/*"
  ],
  "extraResources": [
    {
      "from": "build/services/",
      "to": "services/",
      "filter": ["**/*"]
    },
    {
      "from": "build/pandoc/",
      "to": "pandoc/",
      "filter": ["**/*"]
    }
  ],
  "mac": {
    "target": "dmg",
    "category": "public.app-category.productivity",
    "icon": "build/icon.icns"
  },
  "win": {
    "target": "nsis",
    "icon": "build/icon.ico"
  }
}
```

**Bundled application structure:**
```
FACTSWAY.app/
├── Contents/
│   ├── MacOS/
│   │   └── FACTSWAY              # Electron binary
│   ├── Resources/
│   │   ├── app.asar              # Frontend + Electron main
│   │   ├── services/             # Service executables
│   │   │   ├── records-service
│   │   │   ├── ingestion-service
│   │   │   ├── export-service
│   │   │   ├── caseblock-service
│   │   │   ├── signature-service
│   │   │   ├── facts-service
│   │   │   ├── exhibits-service
│   │   │   └── caselaw-service
│   │   └── pandoc/               # Pandoc binary
│   │       └── pandoc
│   └── Info.plist
```

**Total installer size:** ~250MB (vs 500MB+ with Docker images)

**Installation:** Standard drag-to-Applications (Mac) or NSIS installer (Windows)

---

### 15.7 Frontend (Vue 3)

**Desktop Frontend:**
```json
{
  "name": "@factsway/desktop-frontend",
  "dependencies": {
    "vue": "^3.4.15",
    "pinia": "^2.1.7",
    "@tiptap/vue-3": "^2.1.16",
    "@tiptap/starter-kit": "^2.1.16",
    "axios": "^1.6.5"
  },
  "devDependencies": {
    "vite": "^5.0.11",
    "typescript": "^5.3.3"
  }
}
```

**Web Trial Frontend:**
```json
{
  "name": "@factsway/web-trial",
  "dependencies": {
    "vue": "^3.4.15",
    "axios": "^1.6.5"
  },
  "devDependencies": {
    "vite": "^5.0.11"
  }
}
```

**Adapter Pattern (Environment-Aware):**
```typescript
// adapters/api.ts
const baseURL = (() => {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // Desktop app (Electron serves on localhost:8080)
    return 'http://localhost:3001';  // Local services
  } else if (process.env.VITE_ENV === 'trial') {
    // Web trial
    return 'https://api.factsway.com';  // Cloud services
  } else {
    // Production web or enterprise
    return process.env.VITE_API_URL || 'https://api.factsway.com';
  }
})();

export const api = axios.create({ 
  baseURL,
  timeout: 30000
});

// Service-specific adapters
export const recordsAPI = {
  listTemplates: () => api.get('/api/templates'),
  getTemplate: (id: string) => api.get(`/api/templates/${id}`),
  createCase: (data: CreateCaseInput) => api.post('/api/cases', data),
  // ... etc
};

export const ingestionAPI = {
  ingest: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/ingest', formData);
  }
};
```

---

### 15.8 System Dependencies

**Required for all deployments:**
```yaml
pandoc: "3.6+"     # MINIMUM 3.6 for HTML footnote parsing
libreoffice: "7.6+" # For PDF preview
```

**Desktop-specific:**
```yaml
node: "20.x"       # For Electron (bundled in app)
python: "3.11"     # For services (bundled in executables)
```

**Cloud deployment:**
```yaml
kubernetes: "1.28+" # For service orchestration
postgresql: "15+"   # For cloud database (desktop uses SQLite)
redis: "7.0+"       # For rate limiting, caching
```

---

### 15.9 Database Strategy

**Desktop Deployment:**
```
SQLite (better-sqlite3)
└── ~/Library/Application Support/FACTSWAY/factsway.db
```

**Cloud/Enterprise Deployment:**
```
PostgreSQL 15+
└── Hosted database (RDS, Cloud SQL, self-hosted)
```

**Service-agnostic data access:**
```typescript
// Services use abstract Repository pattern
interface CaseRepository {
  create(data: CreateCaseInput): Promise<Case>;
  findById(id: string): Promise<Case | null>;
  list(filters: CaseFilters): Promise<Case[]>;
  update(id: string, data: UpdateCaseInput): Promise<Case>;
  delete(id: string): Promise<void>;
}

// Desktop: SQLiteRepository implements CaseRepository
class SQLiteCaseRepository implements CaseRepository {
  constructor(private db: Database) {}
  
  async create(data: CreateCaseInput): Promise<Case> {
    const stmt = this.db.prepare('INSERT INTO cases ...');
    const result = stmt.run(data);
    return this.findById(result.lastInsertRowid);
  }
  // ... etc
}

// Cloud: PostgresRepository implements CaseRepository  
class PostgresCaseRepository implements CaseRepository {
  constructor(private pool: Pool) {}
  
  async create(data: CreateCaseInput): Promise<Case> {
    const result = await this.pool.query('INSERT INTO cases ...');
    return this.findById(result.rows[0].id);
  }
  // ... etc
}

// Service doesn't know which implementation
const repo: CaseRepository = 
  process.env.DATABASE_TYPE === 'postgres'
    ? new PostgresCaseRepository(pool)
    : new SQLiteCaseRepository(db);
```

---

### 15.10 Development Environment

**Prerequisites:**
- Node.js 20 LTS
- Python 3.11
- Git
- Docker Desktop (for cloud service testing only)

**Setup:**
```bash
# Clone monorepo
git clone https://github.com/factsway/factsway-platform.git
cd factsway-platform

# Install all dependencies
npm install

# Build service executables (for testing desktop orchestration)
npm run build:services

# Start services as processes (simulates desktop)
npm run dev:desktop

# OR start services in Docker (simulates cloud)
npm run dev:cloud

# In another terminal, start frontend
cd apps/desktop-frontend
npm run dev

# Electron app connects to services
npm run electron:dev
```

**Development URLs:**
- Frontend: http://localhost:8080
- Records API: http://localhost:3001/api
- Ingestion API: http://localhost:3002/api
- Export API: http://localhost:3003/api

---

### 15.11 Testing Strategy

**Unit Tests (per service):**
```bash
cd services/records-service
npm test  # Jest + Supertest
```

**Integration Tests (cross-service):**
```bash
# Start all services as processes
npm run dev:desktop

# Run integration tests
npm run test:integration
```

**End-to-End Tests (Electron):**
```bash
# Start Electron in test mode
npm run test:e2e  # Playwright
```

---

## Edit 54D: Section 16 - File Structure (Major Revision)

**Replace entire Section 16 (lines 9246-9374) with:**

## 16. File Structure

### 16.1 Monorepo Structure

FACTSWAY uses a monorepo containing all services and frontends:

```
factsway-platform/
├── services/                    # Backend microservices
│   ├── records-service/         # TypeScript/Express
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── templates.ts
│   │   │   │   ├── cases.ts
│   │   │   │   └── drafts.ts
│   │   │   ├── repositories/
│   │   │   │   ├── sqlite/      # Desktop implementation
│   │   │   │   │   └── case-repository.ts
│   │   │   │   └── postgres/    # Cloud implementation
│   │   │   │       └── case-repository.ts
│   │   │   ├── models/
│   │   │   │   └── case.ts
│   │   │   └── server.ts
│   │   ├── tests/
│   │   ├── Dockerfile           # For cloud deployment
│   │   ├── package.json
│   │   ├── build.js             # pkg bundling script
│   │   └── tsconfig.json
│   │
│   ├── ingestion-service/       # Python/FastAPI
│   │   ├── app/
│   │   │   ├── routes/
│   │   │   │   └── ingest.py
│   │   │   ├── parsers/
│   │   │   │   ├── nupunkt_parser.py
│   │   │   │   ├── section_detector.py
│   │   │   │   └── format_extractor.py
│   │   │   ├── models/
│   │   │   │   └── legal_document.py
│   │   │   └── main.py
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   └── build.spec           # PyInstaller spec
│   │
│   ├── export-service/          # Python/FastAPI
│   │   ├── app/
│   │   │   ├── routes/
│   │   │   │   └── export.py
│   │   │   ├── generators/
│   │   │   │   ├── pandoc_converter.py
│   │   │   │   └── ooxml_injector.py
│   │   │   └── main.py
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   └── build.spec
│   │
│   ├── caseblock-service/       # TypeScript/Express
│   ├── signature-service/       # TypeScript/Express
│   ├── facts-service/          # TypeScript/Express
│   ├── exhibits-service/       # TypeScript/Express
│   └── caselaw-service/        # TypeScript/Express
│
├── apps/                        # Frontend applications
│   ├── desktop-frontend/        # Electron + Vue 3
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Editor/
│   │   │   │   │   ├── TiptapEditor.vue
│   │   │   │   │   └── Toolbar.vue
│   │   │   │   ├── Evidence/
│   │   │   │   │   ├── EvidenceSidebar.vue
│   │   │   │   │   └── CitationMarker.vue
│   │   │   │   └── Layout/
│   │   │   ├── views/
│   │   │   │   ├── CasesView.vue
│   │   │   │   ├── DraftView.vue
│   │   │   │   └── TemplatesView.vue
│   │   │   ├── adapters/
│   │   │   │   ├── api.ts           # Axios base config
│   │   │   │   ├── cases.ts
│   │   │   │   ├── templates.ts
│   │   │   │   └── drafts.ts
│   │   │   ├── stores/              # Pinia stores
│   │   │   │   ├── cases.ts
│   │   │   │   ├── drafts.ts
│   │   │   │   └── evidence.ts
│   │   │   └── main.ts
│   │   ├── electron/
│   │   │   ├── main/
│   │   │   │   ├── index.ts         # Electron main process
│   │   │   │   ├── orchestrator.ts  # Service process management
│   │   │   │   └── menu.ts
│   │   │   └── preload/
│   │   │       └── index.ts
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── web-trial/               # Web trial (freemium)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── UploadForm.vue
│   │   │   │   ├── ResultsDisplay.vue
│   │   │   │   └── ConversionCTA.vue
│   │   │   ├── views/
│   │   │   │   ├── HomeView.vue
│   │   │   │   └── ResultsView.vue
│   │   │   ├── adapters/
│   │   │   │   └── trial-api.ts     # Points to cloud
│   │   │   └── main.ts
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── mobile-intake/           # Pro se mobile (future)
│       └── (React Native structure TBD)
│
├── packages/                    # Shared code
│   ├── shared-types/            # TypeScript types
│   │   ├── src/
│   │   │   ├── template.ts
│   │   │   ├── case.ts
│   │   │   ├── draft.ts
│   │   │   ├── evidence.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── shared-validation/       # Zod schemas
│       ├── src/
│       │   ├── template.schema.ts
│       │   ├── case.schema.ts
│       │   └── index.ts
│       └── package.json
│
├── infrastructure/              # Deployment configs
│   ├── docker/
│   │   ├── docker-compose.dev.yml       # Local development
│   │   └── docker-compose.cloud.yml     # Cloud deployment
│   │
│   ├── kubernetes/              # Cloud/enterprise deployment
│   │   ├── services/
│   │   │   ├── records-deployment.yaml
│   │   │   ├── ingestion-deployment.yaml
│   │   │   └── ...
│   │   ├── ingress.yaml
│   │   └── secrets.yaml
│   │
│   └── electron-builder/        # Desktop app packaging
│       ├── build-config.json
│       └── entitlements.plist
│
├── scripts/                     # Build & deployment scripts
│   ├── build-services.sh        # Bundle all services
│   ├── start-dev-processes.sh   # Start services as processes (desktop sim)
│   ├── start-dev-docker.sh      # Start services in Docker (cloud sim)
│   └── package-desktop.sh       # electron-builder packaging
│
├── docs/                        # Documentation
│   ├── runbooks/
│   │   ├── RUNBOOK_0.md         # This specification
│   │   ├── RUNBOOK_1.md
│   │   └── ...
│   └── api/
│       ├── records-api.md
│       ├── ingestion-api.md
│       └── ...
│
├── package.json                 # Root package.json (workspace)
├── tsconfig.json               # Shared TypeScript config
└── README.md
```

### 16.2 Workspace Configuration

**Root package.json:**
```json
{
  "name": "factsway-platform",
  "private": true,
  "workspaces": [
    "services/*",
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "install:all": "npm install && npm install --workspaces",
    
    "build:services": "npm run build:ts-services && npm run build:py-services",
    "build:ts-services": "node scripts/build-ts-services.js",
    "build:py-services": "node scripts/build-py-services.js",
    
    "dev:desktop": "concurrently \"npm run dev:services:processes\" \"npm run dev:frontend\"",
    "dev:cloud": "concurrently \"npm run dev:services:docker\" \"npm run dev:frontend\"",
    
    "dev:services:processes": "./scripts/start-dev-processes.sh",
    "dev:services:docker": "docker-compose -f infrastructure/docker/docker-compose.dev.yml up",
    
    "dev:frontend": "npm run dev --workspace=apps/desktop-frontend",
    
    "test": "npm run test --workspaces",
    "test:integration": "npm run test:integration --workspace=tests",
    
    "package:desktop": "./scripts/package-desktop.sh",
    
    "lint": "npm run lint --workspaces"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

### 16.3 Service Template

Each service follows consistent structure:

```
<service-name>/
├── src/ (or app/ for Python)
│   ├── routes/              # API endpoint handlers
│   ├── services/            # Business logic
│   ├── repositories/        # Data access (SQLite/Postgres abstraction)
│   ├── models/              # Type definitions
│   └── server.ts (main.py)  # Entry point
├── tests/
│   ├── unit/
│   └── integration/
├── Dockerfile               # For cloud deployment
├── build.spec (build.js)    # For desktop bundling
├── .env.example
├── package.json (requirements.txt)
└── README.md
```

---

## NEW SECTION 21: Deployment Models

**Insert after Section 20 (Execution Tracing), before Appendices:**

## 21. Deployment Models

### 21.1 Overview

FACTSWAY supports four deployment models using the same service codebase:

| Model | Target | Orchestration | Frontend | Database | Privacy |
|-------|--------|---------------|----------|----------|---------|
| Desktop | Solo lawyers | Child processes | Electron | SQLite (local) | Full (local processing) |
| Web Trial | Freemium leads | Kubernetes/Docker | Browser SPA | PostgreSQL (cloud) | None (warning displayed) |
| Mobile | Pro se intake | Kubernetes/Docker | React Native | PostgreSQL (cloud) | Limited (pre-representation) |
| Enterprise | Law firms | Kubernetes (on-premise) | Browser/Thin client | PostgreSQL (firm's) | Full (firm controls) |

### 21.2 Desktop Deployment (Primary)

**Target users:** Solo practitioners, small firms  
**Price point:** $50/month subscription

**Architecture:**
```
User downloads installer (FACTSWAY-1.0.0-mac.dmg)
    ↓
Installs to /Applications
    ↓
First launch:
  1. Electron starts
  2. Cleans up zombie processes from previous crashes (PID file)
  3. Spawns service executables as child processes
  4. Services bind to localhost:3001-3008
  5. Waits for health checks
  6. Saves new PIDs to file
  7. Opens main window
    ↓
Services run as normal OS processes
Frontend calls http://localhost:300X
All processing happens on user's computer
```

**Data storage:**
```
~/Library/Application Support/FACTSWAY/
├── factsway.db           # SQLite database
├── exhibits/             # Uploaded evidence files
├── logs/                 # Service logs
└── service-pids.json     # PID tracking for zombie cleanup
```

**Privacy guarantees:**
- ✅ Documents never leave user's computer
- ✅ Attorney-client privilege maintained
- ✅ Works offline (no internet required after installation)
- ✅ User controls all data

**Zombie process prevention:**

The `service-pids.json` file tracks all running service PIDs:

```json
{
  "records-service": 12345,
  "ingestion-service": 12346,
  "export-service": 12347,
  "caseblock-service": 12348,
  "signature-service": 12349,
  "facts-service": 12350,
  "exhibits-service": 12351,
  "caselaw-service": 12352
}
```

On launch, orchestrator:
1. Reads this file
2. Kills all listed PIDs (using tree-kill to get subprocesses)
3. Deletes file
4. Starts fresh services
5. Writes new PIDs

This prevents "Port 3001 already in use" errors after crashes.

**Updates:**
- Electron auto-updater checks for new versions
- Downloads new service executables
- Restarts services with new binaries
- Database migrations run automatically

---

### 21.3 Cloud Deployment (Web Trial + Mobile)

**Target users:** Trial users, pro se litigants  
**Price point:** Free (rate-limited trial), $10/month (mobile premium)

**Architecture:**
```
AWS/GCP Infrastructure
├── Kubernetes Cluster
│   ├── records-service (3 replicas)
│   ├── ingestion-service (5 replicas - scales with load)
│   ├── export-service (3 replicas)
│   ├── caseblock-service (2 replicas)
│   ├── signature-service (2 replicas)
│   ├── facts-service (2 replicas)
│   ├── exhibits-service (2 replicas)
│   └── caselaw-service (2 replicas)
├── PostgreSQL (RDS/Cloud SQL)
├── Redis (ElastiCache/Memorystore)
├── S3/Cloud Storage (evidence uploads)
└── Load Balancer (nginx ingress)
```

**Service deployment:**
```yaml
# ingestion-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ingestion-service
  namespace: factsway
spec:
  replicas: 5
  selector:
    matchLabels:
      app: ingestion-service
  template:
    metadata:
      labels:
        app: ingestion-service
    spec:
      containers:
      - name: ingestion-service
        image: factsway/ingestion-service:1.0.0
        ports:
        - containerPort: 3002
        env:
        - name: PORT
          value: "3002"
        - name: RECORDS_SERVICE_URL
          value: "http://records-service:3001"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: factsway-secrets
              key: database-url
        - name: MODE
          value: "cloud"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3002
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3002
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: ingestion-service
  namespace: factsway
spec:
  selector:
    app: ingestion-service
  ports:
  - protocol: TCP
    port: 3002
    targetPort: 3002
  type: ClusterIP
```

**Service discovery in cloud:**

Services use Kubernetes DNS:
```bash
# Environment injected by Kubernetes
RECORDS_SERVICE_URL=http://records-service:3001
INGESTION_SERVICE_URL=http://ingestion-service:3002
EXPORT_SERVICE_URL=http://export-service:3003
```

Service code:
```python
# Same code as desktop, different env vars
import os

RECORDS_URL = os.getenv('RECORDS_SERVICE_URL', 'http://localhost:3001')

async def get_case(case_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(f'{RECORDS_URL}/api/cases/{case_id}')
        return response.json()
```

**Rate limiting (web trial):**
```typescript
// Trial-specific middleware
import rateLimit from 'express-rate-limit';

if (process.env.MODE === 'trial') {
  app.use('/trial/*', rateLimit({
    windowMs: 24 * 60 * 60 * 1000,  // 24 hours
    max: 3,  // 3 requests per window
    keyGenerator: (req) => req.ip,
    handler: (req, res) => {
      res.status(429).json({
        error: 'trial_limit_exceeded',
        message: 'Free trial limited to 3 uploads per day.',
        downloadUrl: 'https://factsway.com/download'
      });
    }
  }));
}
```

---

### 21.4 Enterprise Deployment (On-Premise)

**Target users:** Law firms (10+ lawyers)  
**Price point:** $5,000-50,000/year + implementation

**Architecture:**
```
Law Firm's Private Cloud (AWS/Azure account)
├── Kubernetes Cluster (firm controls)
│   ├── FACTSWAY Services (all 8)
│   ├── PostgreSQL Database (firm's data)
│   ├── Redis Cache
│   └── Nginx Ingress
├── S3/Blob Storage (exhibits, exports)
└── Firm's SSO (Okta, Azure AD)

Lawyers access via:
├── Web browser: https://factsway.firm.com
└── Optional: Thin Electron client
```

**SSO integration:**
```typescript
// Enterprise mode uses firm's SSO
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const client = jwksClient({
  jwksUri: process.env.SSO_JWKS_URI
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

app.use('/api/*', async (req, res, next) => {
  if (process.env.MODE === 'enterprise') {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    jwt.verify(token, getKey, {
      audience: process.env.SSO_AUDIENCE,
      issuer: process.env.SSO_ISSUER
    }, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid token' });
      }
      
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        firm_id: process.env.FIRM_ID
      };
      
      next();
    });
  } else {
    next();
  }
});
```

**Multi-tenancy:**
```typescript
// All queries scoped to firm
router.get('/api/cases', async (req, res) => {
  const cases = await db.query(`
    SELECT * FROM cases 
    WHERE firm_id = $1 
    AND deleted_at IS NULL
    ORDER BY created_at DESC
  `, [req.user.firm_id]);
  
  res.json(cases);
});
```

---

## NEW SECTION 22: Service Discovery & Configuration

**Insert after Section 21:**

## 22. Service Discovery & Configuration

### 22.1 Overview

Services must communicate with each other regardless of deployment environment. This requires environment-specific service discovery.

**The problem:**
- Desktop: Services at `localhost:300X`
- Cloud: Services at `service-name:300X` (Kubernetes DNS)
- Enterprise: Services at custom DNS names

**The solution:** Environment variable injection

### 22.2 Configuration Strategy

**Every service dependency is an environment variable:**

```bash
# Desktop (injected by Electron orchestrator)
RECORDS_SERVICE_URL=http://localhost:3001
INGESTION_SERVICE_URL=http://localhost:3002
EXPORT_SERVICE_URL=http://localhost:3003
CASEBLOCK_SERVICE_URL=http://localhost:3004
SIGNATURE_SERVICE_URL=http://localhost:3005
FACTS_SERVICE_URL=http://localhost:3006
EXHIBITS_SERVICE_URL=http://localhost:3007
CASELAW_SERVICE_URL=http://localhost:3008

# Cloud (injected by Kubernetes)
RECORDS_SERVICE_URL=http://records-service:3001
INGESTION_SERVICE_URL=http://ingestion-service:3002
EXPORT_SERVICE_URL=http://export-service:3003
CASEBLOCK_SERVICE_URL=http://caseblock-service:3004
SIGNATURE_SERVICE_URL=http://signature-service:3005
FACTS_SERVICE_URL=http://facts-service:3006
EXHIBITS_SERVICE_URL=http://exhibits-service:3007
CASELAW_SERVICE_URL=http://caselaw-service:3008
```

### 22.3 Service Code Pattern

**TypeScript services:**
```typescript
// config.ts
export const config = {
  port: parseInt(process.env.PORT || '3001'),
  
  // Service dependencies
  services: {
    records: process.env.RECORDS_SERVICE_URL || 'http://localhost:3001',
    ingestion: process.env.INGESTION_SERVICE_URL || 'http://localhost:3002',
    export: process.env.EXPORT_SERVICE_URL || 'http://localhost:3003',
    caseblock: process.env.CASEBLOCK_SERVICE_URL || 'http://localhost:3004',
    signature: process.env.SIGNATURE_SERVICE_URL || 'http://localhost:3005',
    facts: process.env.FACTS_SERVICE_URL || 'http://localhost:3006',
    exhibits: process.env.EXHIBITS_SERVICE_URL || 'http://localhost:3007',
    caselaw: process.env.CASELAW_SERVICE_URL || 'http://localhost:3008'
  },
  
  // Database
  database: {
    url: process.env.DATABASE_URL || 
         `sqlite:///${process.env.DB_PATH || './factsway.db'}`
  },
  
  // Mode
  mode: process.env.MODE || 'development'
};

// Usage in service
import axios from 'axios';
import { config } from './config';

export async function getCase(caseId: string) {
  const response = await axios.get(
    `${config.services.records}/api/cases/${caseId}`
  );
  return response.data;
}
```

**Python services:**
```python
# config.py
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    port: int = int(os.getenv('PORT', '3002'))
    
    # Service dependencies
    records_service_url: str = os.getenv(
        'RECORDS_SERVICE_URL', 
        'http://localhost:3001'
    )
    export_service_url: str = os.getenv(
        'EXPORT_SERVICE_URL',
        'http://localhost:3003'
    )
    
    # Database
    database_url: str = os.getenv(
        'DATABASE_URL',
        f"sqlite:///{os.getenv('DB_PATH', './factsway.db')}"
    )
    
    # Mode
    mode: str = os.getenv('MODE', 'development')
    
    class Config:
        env_file = '.env'

settings = Settings()

# Usage in service
import httpx

async def get_case(case_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f'{settings.records_service_url}/api/cases/{case_id}'
        )
        return response.json()
```

### 22.4 Orchestrator Injection (Desktop)

**Electron orchestrator sets all env vars:**

```typescript
// orchestrator.ts
function getServiceEnv(service: ServiceConfig): Record<string, string> {
  // Base environment for all services
  const baseEnv = {
    PORT: service.port.toString(),
    DB_PATH: path.join(app.getPath('userData'), 'factsway.db'),
    LOG_LEVEL: 'info',
    MODE: 'desktop'
  };
  
  // Service discovery URLs (all localhost)
  const serviceUrls = {
    RECORDS_SERVICE_URL: 'http://localhost:3001',
    INGESTION_SERVICE_URL: 'http://localhost:3002',
    EXPORT_SERVICE_URL: 'http://localhost:3003',
    CASEBLOCK_SERVICE_URL: 'http://localhost:3004',
    SIGNATURE_SERVICE_URL: 'http://localhost:3005',
    FACTS_SERVICE_URL: 'http://localhost:3006',
    EXHIBITS_SERVICE_URL: 'http://localhost:3007',
    CASELAW_SERVICE_URL: 'http://localhost:3008'
  };
  
  // Service-specific overrides
  const serviceSpecificEnv = service.env || {};
  
  return {
    ...baseEnv,
    ...serviceUrls,
    ...serviceSpecificEnv
  };
}

// When spawning process
const proc = spawn(service.executable, service.args, {
  env: getServiceEnv(service),
  cwd: app.getPath('userData')
});
```

### 22.5 Kubernetes Injection (Cloud)

**ConfigMap for service URLs:**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: service-urls
  namespace: factsway
data:
  RECORDS_SERVICE_URL: "http://records-service:3001"
  INGESTION_SERVICE_URL: "http://ingestion-service:3002"
  EXPORT_SERVICE_URL: "http://export-service:3003"
  CASEBLOCK_SERVICE_URL: "http://caseblock-service:3004"
  SIGNATURE_SERVICE_URL: "http://signature-service:3005"
  FACTS_SERVICE_URL: "http://facts-service:3006"
  EXHIBITS_SERVICE_URL: "http://exhibits-service:3007"
  CASELAW_SERVICE_URL: "http://caselaw-service:3008"
```

**Deployment references ConfigMap:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ingestion-service
spec:
  template:
    spec:
      containers:
      - name: ingestion-service
        image: factsway/ingestion-service:1.0.0
        envFrom:
        - configMapRef:
            name: service-urls
        env:
        - name: PORT
          value: "3002"
        - name: MODE
          value: "cloud"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: factsway-secrets
              key: database-url
```

### 22.6 Validation

**Health check validates configuration:**

```typescript
// Every service includes config validation in health check
app.get('/health', async (req, res) => {
  const health = {
    service: 'ingestion-service',
    version: '1.0.0',
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    config: {
      port: config.port,
      mode: config.mode,
      dependencies: {}
    }
  };
  
  // Test connections to dependencies
  try {
    const recordsHealth = await axios.get(
      `${config.services.records}/health`,
      { timeout: 2000 }
    );
    health.config.dependencies.records = 'reachable';
  } catch (err) {
    health.config.dependencies.records = 'unreachable';
    health.status = 'degraded';
  }
  
  res.json(health);
});
```

**Example health response:**
```json
{
  "service": "ingestion-service",
  "version": "1.0.0",
  "status": "healthy",
  "uptime": 3600,
  "timestamp": "2024-12-24T12:00:00Z",
  "config": {
    "port": 3002,
    "mode": "desktop",
    "dependencies": {
      "records": "reachable"
    }
  }
}
```

---

## NEW SECTION 23: Freemium Strategy

**Insert after Section 22:**

## 23. Freemium Conversion Strategy

### 23.1 Conversion Funnel

```
Website Visitor (1,000)
    ↓ (25% try upload)
Trial User (250)
    ↓ (60% create account)
Activated User (150)
    ↓ (20% download desktop)
Desktop Trial (30)
    ↓ (40% convert to paid)
Paying Customer (12)
```

**Metrics:**
- Visitor → Trial: 25% (industry benchmark: 15-30%)
- Trial → Account: 60% (benchmark: 50-70%)
- Account → Desktop: 20% (benchmark: 10-25%)
- Desktop → Paid: 40% (benchmark: 30-50%)
- Overall conversion: 1.2% (benchmark: 0.5-2%)

### 23.2 Trial Feature Set

**Free tier (web trial):**
```
Included:
✅ Upload motion.docx (3 per day)
✅ Auto-extract case block
✅ Auto-extract signature block
✅ Reformat to court style (TX, CA, Federal)
✅ Export case block to Excel
✅ Preview appendix structure
✅ Download reformatted motion

Limitations (drive conversion):
⚠️ Cloud processing (privacy warning)
⚠️ 3 uploads per day maximum
⚠️ Watermark on exports
❌ No evidence linking
❌ No drafting from scratch
❌ No template library
❌ No multi-case management
❌ No offline work
```

**Paid tier (desktop app):**
```
Everything in free, plus:
✅ Unlimited uploads
✅ Full privacy (local processing)
✅ Evidence linking (drag-and-drop)
✅ Draft from scratch
✅ Template library (50+ templates)
✅ Multi-case management
✅ Offline capability
✅ No watermarks
✅ Priority support
✅ Future: Collaboration features
```

### 23.3 Implementation

**Web trial service modifications:**

```typescript
// trial-middleware.ts
export function trialMode(req, res, next) {
  if (process.env.MODE !== 'trial') {
    return next();
  }
  
  // Add watermark to exports
  req.addWatermark = true;
  req.watermarkText = 'Created with FACTSWAY Trial - factsway.com';
  
  // Limit features
  req.featuresEnabled = {
    evidenceLinking: false,
    templateLibrary: false,
    draftFromScratch: false
  };
  
  next();
}

// Export service adds watermark
app.post('/api/export', trialMode, async (req, res) => {
  const document = await generateDocument(req.body);
  
  if (req.addWatermark) {
    addFooterWatermark(document, req.watermarkText);
  }
  
  res.send(document);
});
```

---

## Summary of Changes

### Files Modified
1. ✅ Section 1.7: Added deployment architecture explanation
2. ✅ Section 10: Clarified API endpoints + service discovery
3. ✅ Section 15: Complete revision - child process orchestration (NOT Docker)
4. ✅ Section 16: Complete file structure revision (monorepo)
5. ✅ NEW Section 21: Deployment models (processes vs containers)
6. ✅ NEW Section 22: Service discovery via environment variables
7. ✅ NEW Section 23: Freemium strategy

### Critical Production Safeguards Added

1. ✅ **Zombie process prevention** (PID tracking, tree-kill)
2. ✅ **Environment-based service discovery** (localhost vs k8s DNS)
3. ✅ **Health check orchestration** (wait for all services)
4. ✅ **Automatic crash recovery** (service restart on exit)
5. ✅ **Graceful shutdown** (SIGTERM before SIGKILL)

### Files Unchanged

- Sections 2-9: Data architecture (Template, Case, Draft, etc.) ✅
- Section 11: UI/UX specifications ✅
- Section 12: Persistence & Storage ✅
- Section 13: Export pipeline ✅
- Section 14: Preview system ✅
- Section 17: Pre-built Texas template ✅
- Section 18: Verification checklist ✅
- Section 19: Design system ✅
- Section 20: Execution tracing ✅
- Appendices A-C ✅

---

## Next Steps

1. **Apply Edit 53** (naming consistency: `sentence_ids` → `supportsSentenceIds`)
2. **Apply Edits 54A-D** (architecture updates from this document)
3. **Final review** of complete Runbook 0
4. **Begin Runbook 1** (Reference document creation in Word)

---

## Validation Checklist

Before finalizing these changes:

- [ ] Edit 53 applied (naming consistency)
- [ ] Section 1.7 added (deployment architecture)
- [ ] Section 10 updated (service discovery added)
- [ ] Section 15 replaced (child process orchestration, NOT Docker)
- [ ] Section 16 replaced (monorepo structure)
- [ ] Section 21 added (deployment models)
- [ ] Section 22 added (service discovery)
- [ ] Section 23 added (freemium strategy)
- [ ] Table of Contents updated with new sections
- [ ] Cross-references verified (all section references still correct)
- [ ] No Docker dependency for desktop deployment
- [ ] PID management implemented
- [ ] Environment variables for all service URLs
- [ ] One-shot philosophy maintained (complete before build)

---

**End of Final Update Document**

This update transforms Runbook 0 from an Electron monolith specification to a production-ready microservices platform with:

✅ **Logical microservices** (strict REST contracts)  
✅ **Environment-appropriate orchestration** (child processes on desktop, containers in cloud)  
✅ **Production safeguards** (zombie cleanup, service discovery, crash recovery)  
✅ **Multiple deployment targets** (desktop, web trial, mobile, enterprise)  
✅ **Same codebase everywhere** (write once, deploy anywhere)

**No Docker requirement for end users. No zombie processes. No port conflicts.**

This is production-ready.
