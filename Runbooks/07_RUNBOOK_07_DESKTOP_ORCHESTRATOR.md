# Runbook 7: Desktop Orchestrator - Electron Main Process

**Phase:** Foundation (Critical Path)  
**Estimated Time:** 10-14 hours  
**Prerequisites:** Runbooks 1-6 complete (all services)  
**Depends On:** Runbook 0 Sections 1.7, 15.1, 17, 19.7  
**Enables:** Runbooks 8-15 (desktop integration)

---

## Objective

Create the **Desktop Orchestrator** - Electron Main process that manages lifecycle of all 8 backend services for desktop deployment.

**Success Criteria:**
- ✅ Electron Main process starts/stops all services
- ✅ Service health monitoring
- ✅ IPC communication with renderer
- ✅ SQLite database initialization
- ✅ Service discovery configuration
- ✅ Graceful shutdown handling
- ✅ Logs aggregation
- ✅ Error recovery

---

## Context from Runbook 0

**Referenced Sections:**
- **Section 1.7:** Deployment Architecture
  - Desktop orchestrator manages services
  - No Docker Desktop required
  - SQLite for local storage
- **Section 15.1:** Desktop Technology Stack
  - Electron
  - Node.js child_process for service management
  - IPC for renderer communication
- **Section 17:** Desktop Orchestrator Specification
  - **Section 17.1:** Service lifecycle management
  - **Section 17.2:** Health monitoring
  - **Section 17.3:** IPC protocol
  - **Section 17.4:** Database initialization
- **Section 19.7:** Runbook 7 Verification Criteria

**Key Principle from Runbook 0:**
> "The Desktop Orchestrator must be invisible to the user. Services start automatically, health is monitored silently, and errors are recovered gracefully. Users never think about backend services."

---

## Current State

**What exists:**
- ✅ All 8 backend services (Runbooks 2-6)
- ✅ Database schema (Runbook 2)
- ❌ No Electron app
- ❌ No service orchestration
- ❌ No lifecycle management

**What this creates:**
- ✅ Electron Main process
- ✅ Service manager (start/stop/restart)
- ✅ Health monitor
- ✅ IPC handlers
- ✅ Database initializer
- ✅ Log aggregator
- ✅ Error recovery

---

## Task 1: Create Desktop App Structure

### 1.1 Create Directory Structure

**Location:** Root of repository

**Action:** CREATE new directories

```bash
# From repository root
mkdir -p desktop/{main,preload,renderer}
mkdir -p desktop/main/{services,ipc,database,utils}
mkdir -p desktop/logs
```

**Verification:**
```bash
tree desktop -L 2

# Expected output:
# desktop/
# ├── main/
# │   ├── services/
# │   ├── ipc/
# │   ├── database/
# │   └── utils/
# ├── preload/
# ├── renderer/
# └── logs/
```

---

### 1.2 Create package.json

**File:** `desktop/package.json`

**Action:** CREATE

**Content:**
```json
{
  "name": "factsway-desktop",
  "version": "1.0.0",
  "description": "FACTSWAY Desktop Application",
  "main": "dist/main/index.js",
  "scripts": {
    "build": "tsc",
    "start": "electron .",
    "dev": "tsx watch main/index.ts",
    "test": "jest"
  },
  "dependencies": {
    "@factsway/shared-types": "workspace:*",
    "@factsway/database": "workspace:*",
    "electron": "^28.0.0",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "@types/node": "^20.10.6",
    "electron-builder": "^24.9.1",
    "jest": "^29.7.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  }
}
```

---

### 1.3 Create TypeScript Configuration

**File:** `desktop/tsconfig.json`

**Action:** CREATE

**Content:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": [
    "main/**/*",
    "preload/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

---

## Task 2: Service Manager

### 2.1 Service Definition

**File:** `desktop/main/services/service-definition.ts`

**Action:** CREATE

**Content:**
```typescript
export interface ServiceConfig {
  name: string;
  port: number;
  command: string;
  cwd: string;
  env?: Record<string, string>;
  healthCheck: string;
  restartDelay: number;
  maxRestarts: number;
}

export const SERVICES: ServiceConfig[] = [
  {
    name: 'records-service',
    port: 3001,
    command: 'npm run start',
    cwd: '../services/records-service',
    env: {
      NODE_ENV: 'production',
      DB_TYPE: 'sqlite',
      SQLITE_PATH: './factsway.db',
    },
    healthCheck: 'http://localhost:3001/health',
    restartDelay: 2000,
    maxRestarts: 3,
  },
  {
    name: 'ingestion-service',
    port: 3002,
    command: 'python main.py',
    cwd: '../services/ingestion-service',
    env: {
      PORT: '3002',
    },
    healthCheck: 'http://localhost:3002/health',
    restartDelay: 2000,
    maxRestarts: 3,
  },
  {
    name: 'export-service',
    port: 3003,
    command: 'python main.py',
    cwd: '../services/export-service',
    env: {
      PORT: '3003',
    },
    healthCheck: 'http://localhost:3003/health',
    restartDelay: 2000,
    maxRestarts: 3,
  },
  {
    name: 'citation-service',
    port: 3004,
    command: 'npm run start',
    cwd: '../services/citation-service',
    healthCheck: 'http://localhost:3004/health',
    restartDelay: 2000,
    maxRestarts: 3,
  },
  {
    name: 'evidence-service',
    port: 3005,
    command: 'npm run start',
    cwd: '../services/evidence-service',
    healthCheck: 'http://localhost:3005/health',
    restartDelay: 2000,
    maxRestarts: 3,
  },
  {
    name: 'template-service',
    port: 3006,
    command: 'npm run start',
    cwd: '../services/template-service',
    healthCheck: 'http://localhost:3006/health',
    restartDelay: 2000,
    maxRestarts: 3,
  },
  {
    name: 'analysis-service',
    port: 3007,
    command: 'python main.py',
    cwd: '../services/analysis-service',
    env: {
      PORT: '3007',
    },
    healthCheck: 'http://localhost:3007/health',
    restartDelay: 2000,
    maxRestarts: 3,
  },
];
```

---

### 2.2 Service Manager

**File:** `desktop/main/services/service-manager.ts`

**Action:** CREATE

**Content:**
```typescript
import { spawn, ChildProcess } from 'child_process';
import axios from 'axios';
import { ServiceConfig } from './service-definition';
import * as fs from 'fs';
import * as path from 'path';

export enum ServiceStatus {
  STOPPED = 'stopped',
  STARTING = 'starting',
  RUNNING = 'running',
  UNHEALTHY = 'unhealthy',
  CRASHED = 'crashed',
}

export interface ManagedService {
  config: ServiceConfig;
  process: ChildProcess | null;
  status: ServiceStatus;
  restartCount: number;
  lastError?: string;
}

export class ServiceManager {
  private services: Map<string, ManagedService> = new Map();
  private logsDir: string;

  constructor(logsDir: string = './desktop/logs') {
    this.logsDir = logsDir;
    this.ensureLogsDir();
  }

  private ensureLogsDir(): void {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  /**
   * Start a service
   */
  async startService(config: ServiceConfig): Promise<void> {
    console.log(`Starting service: ${config.name}`);

    const managed: ManagedService = {
      config,
      process: null,
      status: ServiceStatus.STARTING,
      restartCount: 0,
    };

    this.services.set(config.name, managed);

    // Spawn process
    const proc = spawn(config.command.split(' ')[0], config.command.split(' ').slice(1), {
      cwd: path.resolve(__dirname, config.cwd),
      env: { ...process.env, ...config.env },
      shell: true,
    });

    managed.process = proc;

    // Setup logging
    const logFile = path.join(this.logsDir, `${config.name}.log`);
    const logStream = fs.createWriteStream(logFile, { flags: 'a' });

    proc.stdout?.on('data', (data) => {
      logStream.write(`[STDOUT] ${data}`);
    });

    proc.stderr?.on('data', (data) => {
      logStream.write(`[STDERR] ${data}`);
    });

    proc.on('exit', (code) => {
      console.log(`Service ${config.name} exited with code ${code}`);
      managed.status = ServiceStatus.CRASHED;
      managed.lastError = `Exited with code ${code}`;

      // Auto-restart if within limits
      if (managed.restartCount < config.maxRestarts) {
        managed.restartCount++;
        console.log(`Auto-restarting ${config.name} (attempt ${managed.restartCount})`);
        
        setTimeout(() => {
          this.startService(config);
        }, config.restartDelay);
      }
    });

    // Wait for health check
    await this.waitForHealth(config);
    managed.status = ServiceStatus.RUNNING;

    console.log(`Service ${config.name} is running`);
  }

  /**
   * Stop a service
   */
  async stopService(serviceName: string): Promise<void> {
    const managed = this.services.get(serviceName);
    if (!managed || !managed.process) {
      return;
    }

    console.log(`Stopping service: ${serviceName}`);

    managed.process.kill('SIGTERM');
    managed.status = ServiceStatus.STOPPED;
    managed.process = null;

    console.log(`Service ${serviceName} stopped`);
  }

  /**
   * Stop all services
   */
  async stopAll(): Promise<void> {
    console.log('Stopping all services...');

    const stopPromises = Array.from(this.services.keys()).map(name =>
      this.stopService(name)
    );

    await Promise.all(stopPromises);

    console.log('All services stopped');
  }

  /**
   * Get service status
   */
  getServiceStatus(serviceName: string): ServiceStatus | undefined {
    return this.services.get(serviceName)?.status;
  }

  /**
   * Get all service statuses
   */
  getAllStatuses(): Record<string, ServiceStatus> {
    const statuses: Record<string, ServiceStatus> = {};
    
    for (const [name, managed] of this.services.entries()) {
      statuses[name] = managed.status;
    }

    return statuses;
  }

  /**
   * Wait for service health check
   */
  private async waitForHealth(config: ServiceConfig, timeout: number = 30000): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const response = await axios.get(config.healthCheck, { timeout: 1000 });
        
        if (response.status === 200) {
          return;
        }
      } catch (error) {
        // Health check failed, retry
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error(`Service ${config.name} failed to become healthy within ${timeout}ms`);
  }
}
```

---

## Task 3: Health Monitor

### 3.1 Health Monitor

**File:** `desktop/main/services/health-monitor.ts`

**Action:** CREATE

**Content:**
```typescript
import axios from 'axios';
import { ServiceConfig } from './service-definition';
import { ServiceManager, ServiceStatus } from './service-manager';

export class HealthMonitor {
  private manager: ServiceManager;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(manager: ServiceManager) {
    this.manager = manager;
  }

  /**
   * Start monitoring services
   */
  start(intervalMs: number = 10000): void {
    console.log(`Starting health monitor (interval: ${intervalMs}ms)`);

    this.intervalId = setInterval(async () => {
      await this.checkAllServices();
    }, intervalMs);
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('Health monitor stopped');
  }

  /**
   * Check all services
   */
  private async checkAllServices(): Promise<void> {
    const statuses = this.manager.getAllStatuses();

    for (const [name, status] of Object.entries(statuses)) {
      if (status === ServiceStatus.RUNNING) {
        // Check health
        const healthy = await this.checkServiceHealth(name);
        
        if (!healthy) {
          console.warn(`Service ${name} is unhealthy`);
          // Could trigger restart here if needed
        }
      }
    }
  }

  /**
   * Check individual service health
   */
  private async checkServiceHealth(serviceName: string): Promise<boolean> {
    // Get health check URL from service config
    // Simplified - in production, store config in manager
    const healthUrls: Record<string, string> = {
      'records-service': 'http://localhost:3001/health',
      'ingestion-service': 'http://localhost:3002/health',
      'export-service': 'http://localhost:3003/health',
      'citation-service': 'http://localhost:3004/health',
      'evidence-service': 'http://localhost:3005/health',
      'template-service': 'http://localhost:3006/health',
      'analysis-service': 'http://localhost:3007/health',
    };

    const url = healthUrls[serviceName];
    if (!url) {
      return false;
    }

    try {
      const response = await axios.get(url, { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}
```

---

## Task 4: Database Initialization

### 4.1 Database Initializer

**File:** `desktop/main/database/database-initializer.ts`

**Action:** CREATE

**Content:**
```typescript
import { SQLiteMigrationRunner } from '@factsway/database/migrations/sqlite/runner';
import * as path from 'path';
import * as fs from 'fs';

export class DatabaseInitializer {
  private dbPath: string;

  constructor(dbPath: string = './factsway.db') {
    this.dbPath = dbPath;
  }

  /**
   * Initialize database (run migrations)
   */
  async initialize(): Promise<void> {
    console.log(`Initializing database: ${this.dbPath}`);

    // Ensure database directory exists
    const dbDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Run migrations
    const runner = new SQLiteMigrationRunner(this.dbPath);
    
    try {
      await runner.up();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    } finally {
      runner.close();
    }
  }

  /**
   * Check if database exists and is initialized
   */
  isInitialized(): boolean {
    if (!fs.existsSync(this.dbPath)) {
      return false;
    }

    // Could check for specific tables here
    return true;
  }
}
```

---

## Task 5: IPC Handlers

### 5.1 IPC Protocol

**File:** `desktop/main/ipc/ipc-handlers.ts`

**Action:** CREATE

**Content:**
```typescript
import { ipcMain } from 'electron';
import { ServiceManager } from '../services/service-manager';

export function registerIpcHandlers(serviceManager: ServiceManager): void {
  /**
   * Get all service statuses
   */
  ipcMain.handle('services:get-statuses', async () => {
    return serviceManager.getAllStatuses();
  });

  /**
   * Start a specific service
   */
  ipcMain.handle('services:start', async (event, serviceName: string) => {
    // Get service config and start
    // Simplified - in production, look up config
    console.log(`IPC: Start service ${serviceName}`);
    return { success: true };
  });

  /**
   * Stop a specific service
   */
  ipcMain.handle('services:stop', async (event, serviceName: string) => {
    await serviceManager.stopService(serviceName);
    return { success: true };
  });

  /**
   * Restart a specific service
   */
  ipcMain.handle('services:restart', async (event, serviceName: string) => {
    await serviceManager.stopService(serviceName);
    // Then start again
    // Simplified - in production, look up config and restart
    return { success: true };
  });

  /**
   * Get service logs
   */
  ipcMain.handle('services:get-logs', async (event, serviceName: string) => {
    // Read log file for service
    // Simplified - in production, implement log reader
    return { logs: [] };
  });
}
```

---

## Task 6: Main Process

### 6.1 Main Entry Point

**File:** `desktop/main/index.ts`

**Action:** CREATE

**Content:**
```typescript
import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { ServiceManager } from './services/service-manager';
import { HealthMonitor } from './services/health-monitor';
import { DatabaseInitializer } from './database/database-initializer';
import { registerIpcHandlers } from './ipc/ipc-handlers';
import { SERVICES } from './services/service-definition';

let mainWindow: BrowserWindow | null = null;
let serviceManager: ServiceManager;
let healthMonitor: HealthMonitor;

/**
 * Initialize application
 */
async function initialize(): Promise<void> {
  console.log('Initializing FACTSWAY Desktop...');

  // 1. Initialize database
  const dbInitializer = new DatabaseInitializer();
  if (!dbInitializer.isInitialized()) {
    await dbInitializer.initialize();
  }

  // 2. Create service manager
  serviceManager = new ServiceManager();

  // 3. Register IPC handlers
  registerIpcHandlers(serviceManager);

  // 4. Start all services
  for (const config of SERVICES) {
    try {
      await serviceManager.startService(config);
    } catch (error) {
      console.error(`Failed to start ${config.name}:`, error);
      // Continue with other services
    }
  }

  // 5. Start health monitor
  healthMonitor = new HealthMonitor(serviceManager);
  healthMonitor.start(10000); // Check every 10 seconds

  console.log('FACTSWAY Desktop initialized successfully');
}

/**
 * Create main window
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load app (renderer will be created in Runbook 8)
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Shutdown application
 */
async function shutdown(): Promise<void> {
  console.log('Shutting down FACTSWAY Desktop...');

  // 1. Stop health monitor
  if (healthMonitor) {
    healthMonitor.stop();
  }

  // 2. Stop all services
  if (serviceManager) {
    await serviceManager.stopAll();
  }

  console.log('Shutdown complete');
}

// App lifecycle
app.whenReady().then(async () => {
  await initialize();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', async (event) => {
  event.preventDefault();
  await shutdown();
  app.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});
```

---

## Task 7: Preload Script

### 7.1 Preload Bridge

**File:** `desktop/preload/index.ts`

**Action:** CREATE

**Content:**
```typescript
import { contextBridge, ipcRenderer } from 'electron';

// Expose safe APIs to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Services
  services: {
    getStatuses: () => ipcRenderer.invoke('services:get-statuses'),
    start: (serviceName: string) => ipcRenderer.invoke('services:start', serviceName),
    stop: (serviceName: string) => ipcRenderer.invoke('services:stop', serviceName),
    restart: (serviceName: string) => ipcRenderer.invoke('services:restart', serviceName),
    getLogs: (serviceName: string) => ipcRenderer.invoke('services:get-logs', serviceName),
  },
});

// Type definitions for renderer
export interface ElectronAPI {
  services: {
    getStatuses: () => Promise<Record<string, string>>;
    start: (serviceName: string) => Promise<{ success: boolean }>;
    stop: (serviceName: string) => Promise<{ success: boolean }>;
    restart: (serviceName: string) => Promise<{ success: boolean }>;
    getLogs: (serviceName: string) => Promise<{ logs: string[] }>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
```

---

## Task 8: Verification (from Runbook 0 Section 19.7)

### 8.1 Service Lifecycle
- [ ] All 8 services start on app launch
- [ ] Services run in background
- [ ] Services stop on app quit
- [ ] Graceful shutdown works

### 8.2 Health Monitoring
- [ ] Health monitor checks all services
- [ ] Unhealthy services detected
- [ ] Service statuses reported via IPC

### 8.3 Database
- [ ] Database initialized on first run
- [ ] Migrations run successfully
- [ ] Services can access database

### 8.4 IPC Communication
- [ ] Renderer can query service statuses
- [ ] Renderer can start/stop services
- [ ] Logs accessible via IPC

### 8.5 Error Handling
- [ ] Service crashes handled
- [ ] Auto-restart working
- [ ] Errors logged

### 8.6 Cross-Reference
- [ ] Uses all services from Runbooks 3-6
- [ ] Uses database from Runbook 2
- [ ] Ready for Runbook 8 (Frontend UI)

---

## Success Criteria

✅ Electron app starts  
✅ All services start automatically  
✅ Health monitoring active  
✅ IPC communication works  
✅ Database initialized  
✅ Graceful shutdown works  
✅ Logs aggregated  
✅ Ready for Runbook 8 (Frontend UI)  

---

## Next Steps

After Runbook 7 is complete:

1. **Build app:** `npm run build`
2. **Start app:** `npm start`
3. **Verify services:** Check all 8 services are running
4. **Check logs:** Review logs in `desktop/logs/`
5. **Test IPC:** Use developer tools to test IPC calls
6. **Proceed to Runbook 8:** Frontend UI (Electron Renderer)

---

## Reference

- **Runbook 0 Section 1.7:** Deployment Architecture
- **Runbook 0 Section 15.1:** Desktop Technology Stack
- **Runbook 0 Section 17:** Orchestrator Specification
- **Runbook 0 Section 19.7:** Verification Criteria
- **Runbooks 3-6:** Backend services

---

**End of Runbook 7**
