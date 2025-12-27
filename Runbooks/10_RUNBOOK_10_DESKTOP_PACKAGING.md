# Runbook 10: Desktop Packaging - Electron Builder & Distribution

**Phase:** Integration (Critical Path)
**Estimated Time:** 16-22 hours
**Prerequisites:** Runbooks 1-9 complete (entire desktop stack)
**Depends On:** Runbook 0 Sections 22.2, 17.5
**Enables:** Production deployment, user distribution, auto-updates

**Breakdown:**
- Electron builder initial setup: 2 hours
- Python service bundling (PyInstaller): 8-10 hours
  - Setup per service: 2-3 hours × 1 service (template)
  - Additional services: 30 min × 6 services = 3 hours
  - Testing and troubleshooting: 2-3 hours
- Pandoc bundling (3 platforms): 2-3 hours
- Code signing setup: 2 hours
- Platform-specific testing: 2-3 hours
- Distribution configuration (auto-updates): 2 hours

**Why longer than original estimate:**
- PyInstaller per-service approach (not single bundle) adds time but provides better architecture
- Pandoc bundling for 3 platforms (Windows, macOS x64/arm64, Linux)
- Removed LibreOffice dependency (saves time and 500MB)
- Realistic time for production-quality packaging

**This is "one-shot" development:** Package correctly from the start, no repacking later.

---

## Objective

Create **distributable desktop installers** for FACTSWAY using electron-builder. Package all 8 backend services as standalone executables, bundle with Electron app, and create platform-specific installers (Windows .exe, macOS .dmg, Linux .AppImage) with auto-update support.

**Success Criteria:**
- ✅ Python services bundled as executables (PyInstaller)
- ✅ Node service bundled
- ✅ All services included in app bundle
- ✅ Windows installer (.exe) builds successfully
- ✅ macOS installer (.dmg) builds successfully
- ✅ Linux installer (.AppImage) builds successfully
- ✅ Installed app launches all services correctly
- ✅ Auto-update configured and working
- ✅ Code signing configured (development certificates)
- ✅ Installer size optimized (<300MB)

---

## Context from Runbook 0

**Referenced Sections:**
- **Section 22.2:** Desktop Deployment Architecture
  - Services as child processes
  - No Docker required for end users
  - SQLite for local storage
  - ~250MB installer target
- **Section 17.5:** Service Packaging Requirements
  - Python executables via PyInstaller
  - Node services via pkg or bundled
  - Service binaries in app resources
  - Platform-specific executable extensions

**Key Principle from Runbook 0:**
> "The desktop installer must be self-contained. Users download one file, run it, and FACTSWAY works. No Python installation required. No Node.js required. No command-line setup. Just click and go."

---

## Current State

**What exists:**
- ✅ All 8 backend services with source code
- ✅ Desktop orchestrator (Runbook 7)
- ✅ Renderer application (Runbook 8)
- ✅ Service discovery (Runbook 9)
- ❌ No executable packaging
- ❌ No electron-builder configuration
- ❌ No platform builds
- ❌ No installers

**What this creates:**
- ✅ PyInstaller build scripts for Python services
- ✅ Service executable bundling
- ✅ electron-builder configuration
- ✅ Platform-specific build scripts
- ✅ Auto-update server configuration
- ✅ Code signing setup (dev certificates)
- ✅ Build verification tests
- ✅ Distribution-ready installers

---

## Task 1: PyInstaller Configuration for Python Services

### Why Per-Service Executables?

**Decision:** Each of 7 Python services becomes standalone executable

**Alternatives considered:**
- Single PyInstaller bundle (all services in one executable)
- Embedded Python runtime (bundle Python + scripts)
- Require user to install Python

**Chosen approach: Per-service executables**

**Why:**
1. ✅ True microservices isolation (fault tolerance)
2. ✅ Can restart individual services if they crash
3. ✅ Easy debugging (test services independently)
4. ✅ Modular updates (update one service without touching others)
5. ✅ Matches architecture perfectly (microservices design)
6. ✅ Proven approach (VS Code Python extension, many Electron apps)

**Trade-off:**
- Size: ~50-100MB per service × 7 = ~400MB total
- Alternative (single bundle): ~150MB
- **Difference: ~250MB** for better architecture

**For desktop legal software targeting lawyers with modern computers: 400MB is acceptable.**

**Total app size:** ~1GB (Electron 150MB + Pandoc 300MB + Python 400MB + Node 50MB + Assets 50MB)

**Competitive legal software:** Adobe Acrobat (~600MB), Microsoft Word (~1.5GB), Westlaw Edge (~800MB)

**Verdict:** Size cost is acceptable for architectural integrity.

**Reference:** See `docs/PYTHON_UPGRADE_SUMMARY.md` and `Runbooks/Prep Plan/ARCHITECTURAL_DECISIONS_SUMMARY.md`

---

### Services to Bundle

**7 Python microservices:**

1. **ingestion-service** (port 3002) - DOCX parsing, sentence splitting, LegalDocument creation
2. **export-service** (port 3003) - LegalDocument → DOCX/PDF export
3. **caseblock-service** (port 3004) - Case caption management
4. **signature-service** (port 3005) - Attorney signature blocks
5. **facts-service** (port 3006) - Fact extraction, contradiction detection
6. **exhibits-service** (port 3007) - Evidence attachment management
7. **caselaw-service** (port 3008) - Legal citation parsing

**Each becomes:** Standalone executable (~50-100MB)

---

### 1.1 Install PyInstaller

**Python 3.11.7 required** (see `docs/PYTHON_UPGRADE_SUMMARY.md`)

```bash
# Install globally
pip install pyinstaller --break-system-packages

# Verify installation
pyinstaller --version
# Should show: 6.x.x
```

---

### 1.2 Base PyInstaller Spec Template

**File:** `scripts/packaging/pyinstaller-template.spec`

**Action:** CREATE

**Purpose:** Template for building Python service executables

**Content:**
```python
"""
PyInstaller Spec Template for Python Services

Reference: Runbook 0 Section 17.5

This template is used to generate .spec files for each Python service.
PyInstaller bundles Python, dependencies, and service code into a single executable.
"""

# -*- mode: python ; coding: utf-8 -*-

import sys
from pathlib import Path

# Service-specific configuration (injected by build script)
SERVICE_NAME = 'SERVICE_NAME_PLACEHOLDER'
SERVICE_DIR = Path('SERVICE_DIR_PLACEHOLDER')
ENTRY_POINT = 'ENTRY_POINT_PLACEHOLDER'

block_cipher = None

# Collect all Python files from service directory
service_files = []
for py_file in SERVICE_DIR.rglob('*.py'):
    relative_path = py_file.relative_to(SERVICE_DIR.parent)
    service_files.append((str(py_file), str(relative_path.parent)))

a = Analysis(
    [str(SERVICE_DIR / ENTRY_POINT)],
    pathex=[],
    binaries=[],
    datas=service_files,
    hiddenimports=[
        'fastapi',
        'uvicorn',
        'pydantic',
        'sqlalchemy',
        'lxml',
        'nupunkt',
        'anthropic',
        'python-docx',
        'pypandoc',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        'matplotlib',
        'numpy.testing',
        'tkinter',
        'unittest',
        'pytest',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name=SERVICE_NAME,
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,  # Compress executable
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,  # Show console for logging
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
```

---

### 1.2 PyInstaller Build Script

**File:** `scripts/packaging/build-python-services.sh`

**Action:** CREATE

**Purpose:** Build all Python services as executables

**Content:**
```bash
#!/bin/bash
set -e

# Build Python Services as Executables
#
# Reference: Runbook 0 Section 17.5
#
# Uses PyInstaller to create standalone executables for all 7 Python services.
# Executables are placed in desktop/resources/services/

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BUILD_DIR="$REPO_ROOT/build/services"
OUTPUT_DIR="$REPO_ROOT/desktop/resources/services"

echo "========================================="
echo "Building Python Services as Executables"
echo "========================================="
echo ""

# Create output directories
mkdir -p "$BUILD_DIR"
mkdir -p "$OUTPUT_DIR"

# Service definitions
# Format: "service-name:service-directory:entry-point"
SERVICES=(
    "ingestion:services/ingestion-service:src/main.py"
    "export:services/export-service:src/main.py"
    "caseblock:services/caseblock-service:src/main.py"
    "signature:services/signature-service:src/main.py"
    "facts:services/facts-service:src/main.py"
    "exhibits:services/exhibits-service:src/main.py"
    "caselaw:services/caselaw-service:src/main.py"
)

# Platform-specific executable extension
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    EXE_EXT=".exe"
else
    EXE_EXT=""
fi

# Build each service
for service_def in "${SERVICES[@]}"; do
    IFS=':' read -r SERVICE_NAME SERVICE_DIR ENTRY_POINT <<< "$service_def"
    
    echo "Building $SERVICE_NAME..."
    
    # Navigate to service directory
    cd "$REPO_ROOT/$SERVICE_DIR"
    
    # Ensure dependencies are installed
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt --quiet
    fi
    
    # Generate .spec file from template
    SPEC_FILE="$BUILD_DIR/${SERVICE_NAME}.spec"
    sed -e "s|SERVICE_NAME_PLACEHOLDER|$SERVICE_NAME|g" \
        -e "s|SERVICE_DIR_PLACEHOLDER|$REPO_ROOT/$SERVICE_DIR|g" \
        -e "s|ENTRY_POINT_PLACEHOLDER|$ENTRY_POINT|g" \
        "$SCRIPT_DIR/pyinstaller-template.spec" > "$SPEC_FILE"
    
    # Build with PyInstaller
    pyinstaller --clean --noconfirm "$SPEC_FILE"
    
    # Move executable to output directory
    EXECUTABLE="dist/${SERVICE_NAME}${EXE_EXT}"
    if [ -f "$EXECUTABLE" ]; then
        mv "$EXECUTABLE" "$OUTPUT_DIR/"
        echo "✅ $SERVICE_NAME built successfully"
    else
        echo "❌ Failed to build $SERVICE_NAME"
        exit 1
    fi
    
    echo ""
done

echo "========================================="
echo "All Python services built successfully!"
echo "Executables location: $OUTPUT_DIR"
echo "========================================="
echo ""

# List built executables with sizes
echo "Built executables:"
ls -lh "$OUTPUT_DIR"
```

**Make executable:**
```bash
chmod +x scripts/packaging/build-python-services.sh
```

---

### 1.3 Windows Batch Script (Alternative)

**File:** `scripts/packaging/build-python-services.bat`

**Action:** CREATE

**Purpose:** Build script for Windows developers

**Content:**
```batch
@echo off
REM Build Python Services on Windows

setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
set REPO_ROOT=%SCRIPT_DIR%..\..
set BUILD_DIR=%REPO_ROOT%\build\services
set OUTPUT_DIR=%REPO_ROOT%\desktop\resources\services

echo =========================================
echo Building Python Services as Executables
echo =========================================
echo.

REM Create output directories
if not exist "%BUILD_DIR%" mkdir "%BUILD_DIR%"
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

REM Service definitions
set SERVICES=ingestion:services/ingestion-service:src/main.py export:services/export-service:src/main.py caseblock:services/caseblock-service:src/main.py signature:services/signature-service:src/main.py facts:services/facts-service:src/main.py exhibits:services/exhibits-service:src/main.py caselaw:services/caselaw-service:src/main.py

for %%s in (%SERVICES%) do (
    for /f "tokens=1,2,3 delims=:" %%a in ("%%s") do (
        set SERVICE_NAME=%%a
        set SERVICE_DIR=%%b
        set ENTRY_POINT=%%c
        
        echo Building !SERVICE_NAME!...
        
        cd "%REPO_ROOT%\!SERVICE_DIR!"
        
        REM Install dependencies
        if exist requirements.txt (
            pip install -r requirements.txt --quiet
        )
        
        REM Generate .spec file
        set SPEC_FILE=%BUILD_DIR%\!SERVICE_NAME!.spec
        powershell -Command "(Get-Content '%SCRIPT_DIR%\pyinstaller-template.spec') -replace 'SERVICE_NAME_PLACEHOLDER', '!SERVICE_NAME!' -replace 'SERVICE_DIR_PLACEHOLDER', '%REPO_ROOT%\!SERVICE_DIR!' -replace 'ENTRY_POINT_PLACEHOLDER', '!ENTRY_POINT!' | Set-Content '!SPEC_FILE!'"
        
        REM Build with PyInstaller
        pyinstaller --clean --noconfirm "!SPEC_FILE!"
        
        REM Move executable
        if exist "dist\!SERVICE_NAME!.exe" (
            move /Y "dist\!SERVICE_NAME!.exe" "%OUTPUT_DIR%\"
            echo [32m✓[0m !SERVICE_NAME! built successfully
        ) else (
            echo [31m✗[0m Failed to build !SERVICE_NAME!
            exit /b 1
        )
        
        echo.
    )
)

echo =========================================
echo All Python services built successfully!
echo Executables location: %OUTPUT_DIR%
echo =========================================
echo.

dir /b "%OUTPUT_DIR%"
```

---

## Task 2: Records Service Packaging (Node/TypeScript)

### 2.1 Records Service Build Script

**File:** `scripts/packaging/build-node-service.sh`

**Action:** CREATE

**Purpose:** Build Records Service as standalone executable

**Content:**
```bash
#!/bin/bash
set -e

# Build Records Service (Node/TypeScript)
#
# We can either:
# 1. Use pkg to create standalone executable
# 2. Bundle with webpack and include node binary
# 3. Just copy node_modules (simplest for now)
#
# For desktop deployment, we'll bundle compiled JS + node_modules
# Electron already includes Node.js, so we can use that runtime.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SERVICE_DIR="$REPO_ROOT/services/records-service"
OUTPUT_DIR="$REPO_ROOT/desktop/resources/services/records"

echo "========================================="
echo "Building Records Service (Node)"
echo "========================================="
echo ""

# Navigate to service directory
cd "$SERVICE_DIR"

# Install production dependencies only
echo "Installing dependencies..."
npm ci --production

# Build TypeScript
echo "Compiling TypeScript..."
npm run build

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Copy built files
echo "Copying built files..."
cp -r dist "$OUTPUT_DIR/"
cp -r node_modules "$OUTPUT_DIR/"
cp package.json "$OUTPUT_DIR/"

# Create launcher script
cat > "$OUTPUT_DIR/start.sh" << 'EOF'
#!/bin/bash
# Records Service Launcher
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
node dist/index.js
EOF

chmod +x "$OUTPUT_DIR/start.sh"

# Windows launcher
cat > "$OUTPUT_DIR/start.bat" << 'EOF'
@echo off
cd /d "%~dp0"
node dist\index.js
EOF

echo "✅ Records service built successfully"
echo "Output location: $OUTPUT_DIR"
echo ""
```

**Make executable:**
```bash
chmod +x scripts/packaging/build-node-service.sh
```

---

## Task 3: Electron Builder Configuration

### 3.1 electron-builder Config

**File:** `desktop/electron-builder.json`

**Action:** CREATE

**Purpose:** electron-builder configuration for all platforms

**Content:**
```json
{
  "appId": "com.factsway.desktop",
  "productName": "FACTSWAY",
  "copyright": "Copyright © 2025 FACTSWAY",
  "directories": {
    "output": "dist-electron",
    "buildResources": "resources"
  },
  "files": [
    "dist/**/*",
    "resources/**/*",
    "!resources/services/**/*.spec",
    "package.json"
  ],
  "extraResources": [
    {
      "from": "resources/services",
      "to": "services",
      "filter": [
        "**/*"
      ]
    }
  ],
  "mac": {
    "category": "public.app-category.business",
    "icon": "resources/icons/icon.icns",
    "target": [
      {
        "target": "dmg",
        "arch": ["x64", "arm64"]
      },
      {
        "target": "zip",
        "arch": ["x64", "arm64"]
      }
    ],
    "hardenedRuntime": true,
    "gatekeeperAssess": false,
    "entitlements": "resources/entitlements.mac.plist",
    "entitlementsInherit": "resources/entitlements.mac.plist",
    "extendInfo": {
      "NSDocumentsFolderUsageDescription": "FACTSWAY needs access to save your legal documents.",
      "NSDownloadsFolderUsageDescription": "FACTSWAY needs access to save exported documents."
    }
  },
  "dmg": {
    "contents": [
      {
        "x": 130,
        "y": 220
      },
      {
        "x": 410,
        "y": 220,
        "type": "link",
        "path": "/Applications"
      }
    ],
    "title": "${productName} ${version}",
    "backgroundColor": "#f0f0eb"
  },
  "win": {
    "icon": "resources/icons/icon.ico",
    "target": [
      {
        "target": "nsis",
        "arch": ["x64"]
      },
      {
        "target": "portable",
        "arch": ["x64"]
      }
    ],
    "publisherName": "FACTSWAY",
    "verifyUpdateCodeSignature": false
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true,
    "shortcutName": "FACTSWAY",
    "include": "scripts/installer/installer.nsh",
    "deleteAppDataOnUninstall": false
  },
  "linux": {
    "icon": "resources/icons",
    "category": "Office",
    "target": [
      {
        "target": "AppImage",
        "arch": ["x64"]
      },
      {
        "target": "deb",
        "arch": ["x64"]
      }
    ],
    "desktop": {
      "Name": "FACTSWAY",
      "Comment": "Legal Document Drafting Platform",
      "Categories": "Office;Law;"
    }
  },
  "publish": {
    "provider": "generic",
    "url": "https://updates.factsway.com"
  },
  "compression": "maximum",
  "artifactName": "${productName}-${version}-${os}-${arch}.${ext}"
}
```

---

### 3.2 macOS Entitlements

**File:** `desktop/resources/entitlements.mac.plist`

**Action:** CREATE

**Purpose:** macOS security entitlements

**Content:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.cs.allow-jit</key>
  <true/>
  <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
  <true/>
  <key>com.apple.security.cs.allow-dyld-environment-variables</key>
  <true/>
  <key>com.apple.security.cs.disable-library-validation</key>
  <true/>
  <key>com.apple.security.files.user-selected.read-write</key>
  <true/>
  <key>com.apple.security.files.downloads.read-write</key>
  <true/>
</dict>
</plist>
```

---

### 3.3 Windows NSIS Installer Script

**File:** `scripts/installer/installer.nsh`

**Action:** CREATE

**Purpose:** Custom NSIS installer behavior

**Content:**
```nsis
; FACTSWAY Windows Installer Custom Script
;
; Reference: Runbook 0 Section 22.2

!macro customInstall
  ; Create data directory in user's AppData
  SetShellVarContext current
  CreateDirectory "$APPDATA\FACTSWAY"
  
  ; Set permissions for data directory
  AccessControl::GrantOnFile "$APPDATA\FACTSWAY" "(S-1-5-32-545)" "FullAccess"
  
  ; Add firewall rules for local services
  nsExec::ExecToLog 'netsh advfirewall firewall add rule name="FACTSWAY Services" dir=in action=allow protocol=TCP localport=3001-3008'
!macroend

!macro customUnInstall
  ; Ask user if they want to delete data
  MessageBox MB_YESNO|MB_ICONQUESTION "Do you want to delete your FACTSWAY data and documents? This cannot be undone." IDYES DeleteData IDNO KeepData
  
  DeleteData:
    SetShellVarContext current
    RMDir /r "$APPDATA\FACTSWAY"
  
  KeepData:
  
  ; Remove firewall rules
  nsExec::ExecToLog 'netsh advfirewall firewall delete rule name="FACTSWAY Services"'
!macroend
```

---

## Task 4: Build Scripts

### 4.1 Master Build Script

**File:** `scripts/build-all.sh`

**Action:** CREATE

**Purpose:** Build everything in correct order

**Content:**
```bash
#!/bin/bash
set -e

# Master Build Script for FACTSWAY Desktop
#
# Builds entire desktop application in correct order:
# 1. Python services → executables
# 2. Node service → bundled
# 3. Renderer → production build
# 4. Main process → compiled
# 5. electron-builder → installers

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "========================================="
echo "FACTSWAY Desktop - Full Build"
echo "========================================="
echo ""

# Step 1: Build Python services
echo "Step 1/5: Building Python services..."
"$SCRIPT_DIR/packaging/build-python-services.sh"
echo ""

# Step 2: Build Node service
echo "Step 2/5: Building Records service (Node)..."
"$SCRIPT_DIR/packaging/build-node-service.sh"
echo ""

# Step 3: Build Renderer (Vue)
echo "Step 3/5: Building Renderer (Vue)..."
cd "$REPO_ROOT/desktop/renderer"
npm ci
npm run build
echo "✅ Renderer built"
echo ""

# Step 4: Build Main process (Electron)
echo "Step 4/5: Building Main process..."
cd "$REPO_ROOT/desktop"
npm ci
npm run build
echo "✅ Main process built"
echo ""

# Step 5: Package with electron-builder
echo "Step 5/5: Creating installers..."
cd "$REPO_ROOT/desktop"

# Build for current platform by default
# Use --mac, --win, or --linux for specific platforms
npm run dist

echo ""
echo "========================================="
echo "Build complete!"
echo "Installers location: desktop/dist-electron"
echo "========================================="
echo ""

ls -lh "$REPO_ROOT/desktop/dist-electron"/*.{dmg,exe,AppImage} 2>/dev/null || true
```

**Make executable:**
```bash
chmod +x scripts/build-all.sh
```

---

### 4.2 Update Desktop package.json

**File:** `desktop/package.json` (UPDATE)

**Action:** ADD build scripts

**Add to "scripts" section:**
```json
{
  "scripts": {
    "build": "tsc",
    "start": "electron .",
    "dev": "tsx watch main/index.ts",
    "test": "jest",
    
    "dist": "electron-builder",
    "dist:mac": "electron-builder --mac",
    "dist:win": "electron-builder --win",
    "dist:linux": "electron-builder --linux",
    "dist:all": "electron-builder -mwl",
    
    "pack": "electron-builder --dir",
    "postinstall": "electron-builder install-app-deps"
  },
  "devDependencies": {
    "@types/node": "^20.10.6",
    "electron": "^28.0.0",
    "electron-builder": "^24.9.1",
    "jest": "^29.7.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  }
}
```

---

## Task 5: Auto-Update Configuration

### 5.1 Auto-Update Implementation

**File:** `desktop/main/auto-update.ts`

**Action:** CREATE

**Purpose:** Handle automatic updates

**Content:**
```typescript
/**
 * Auto-Update Handler
 * 
 * Reference: Runbook 0 Section 22.2
 * 
 * Checks for updates on startup and notifies user when available.
 * Uses electron-updater for cross-platform update support.
 */

import { autoUpdater } from 'electron-updater';
import { BrowserWindow, dialog } from 'electron';
import log from 'electron-log';

// Configure logging
autoUpdater.logger = log;
(autoUpdater.logger as any).transports.file.level = 'info';

// Disable auto-download (ask user first)
autoUpdater.autoDownload = false;

// Update server URL (from electron-builder config)
// autoUpdater.setFeedURL({
//   provider: 'generic',
//   url: 'https://updates.factsway.com'
// });

/**
 * Initialize auto-updater
 * 
 * Sets up event handlers and checks for updates
 */
export function initializeAutoUpdater(mainWindow: BrowserWindow): void {
  // Update available
  autoUpdater.on('update-available', (info) => {
    log.info('Update available:', info.version);
    
    const response = dialog.showMessageBoxSync(mainWindow, {
      type: 'info',
      title: 'Update Available',
      message: `A new version of FACTSWAY (${info.version}) is available. Would you like to download it now?`,
      buttons: ['Download', 'Later'],
      defaultId: 0
    });
    
    if (response === 0) {
      autoUpdater.downloadUpdate();
      
      // Show download progress
      mainWindow.webContents.send('update:downloading');
    }
  });
  
  // No update available
  autoUpdater.on('update-not-available', () => {
    log.info('No update available');
  });
  
  // Download progress
  autoUpdater.on('download-progress', (progress) => {
    const percent = Math.round(progress.percent);
    log.info(`Download progress: ${percent}%`);
    mainWindow.webContents.send('update:progress', percent);
  });
  
  // Update downloaded
  autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded:', info.version);
    
    const response = dialog.showMessageBoxSync(mainWindow, {
      type: 'info',
      title: 'Update Ready',
      message: `Update ${info.version} has been downloaded. The application will restart to install the update.`,
      buttons: ['Restart Now', 'Later'],
      defaultId: 0
    });
    
    if (response === 0) {
      // Quit and install
      autoUpdater.quitAndInstall(false, true);
    }
  });
  
  // Error
  autoUpdater.on('error', (error) => {
    log.error('Auto-updater error:', error);
  });
  
  // Check for updates on startup (after 10 seconds)
  setTimeout(() => {
    if (process.env.NODE_ENV !== 'development') {
      autoUpdater.checkForUpdates();
    }
  }, 10000);
}

/**
 * Manually check for updates
 * 
 * Called from menu or user action
 */
export async function checkForUpdatesManually(mainWindow: BrowserWindow): Promise<void> {
  try {
    const result = await autoUpdater.checkForUpdates();
    
    if (!result || !result.updateInfo) {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'No Updates',
        message: 'You are running the latest version of FACTSWAY.'
      });
    }
  } catch (error) {
    log.error('Manual update check failed:', error);
    
    dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: 'Update Check Failed',
      message: 'Failed to check for updates. Please try again later.'
    });
  }
}
```

---

### 5.2 Update Main Process to Use Auto-Updater

**File:** `desktop/main/index.ts` (UPDATE)

**Action:** ADD auto-update initialization

**Add imports:**
```typescript
import { initializeAutoUpdater } from './auto-update';
```

**Add after window creation:**
```typescript
// After creating mainWindow
initializeAutoUpdater(mainWindow);
```

---

## Task 6: Icon Assets

### 6.1 Icon Requirements

**Files needed:**
- `desktop/resources/icons/icon.icns` (macOS, 1024x1024)
- `desktop/resources/icons/icon.ico` (Windows, 256x256)
- `desktop/resources/icons/icon.png` (Linux, 512x512)
- `desktop/resources/icons/[16-512]x[16-512].png` (Linux icon set)

**Script to generate from source:**

**File:** `scripts/generate-icons.sh`

**Action:** CREATE

**Content:**
```bash
#!/bin/bash
# Generate app icons from source PNG
# Requires: imagemagick, icnsutils (Linux), icon-gen (npm)

SOURCE_ICON="assets/factsway-icon.png"
ICON_DIR="desktop/resources/icons"

if [ ! -f "$SOURCE_ICON" ]; then
  echo "Error: Source icon not found at $SOURCE_ICON"
  exit 1
fi

mkdir -p "$ICON_DIR"

echo "Generating icons..."

# macOS .icns (requires iconutil or icon-gen)
npx icon-gen -i "$SOURCE_ICON" -o "$ICON_DIR" --icns

# Windows .ico
npx icon-gen -i "$SOURCE_ICON" -o "$ICON_DIR" --ico

# Linux PNGs
for size in 16 24 32 48 64 128 256 512; do
  convert "$SOURCE_ICON" -resize ${size}x${size} "$ICON_DIR/${size}x${size}.png"
done

echo "✅ Icons generated in $ICON_DIR"
```

---

## Task 7: Platform-Specific Build Instructions

### 7.1 Build on macOS

**File:** `docs/BUILD_MACOS.md`

**Action:** CREATE

**Content:**
```markdown
# Building FACTSWAY on macOS

## Prerequisites

1. **macOS 10.15+** (Catalina or later)
2. **Xcode Command Line Tools:**
   ```bash
   xcode-select --install
   ```
3. **Homebrew:**
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
4. **Python 3.11+:**
   ```bash
   brew install python@3.11
   ```
5. **Node.js 18+:**
   ```bash
   brew install node
   ```
6. **PyInstaller:**
   ```bash
   pip3 install pyinstaller
   ```

## Build Steps

1. **Clone repository:**
   ```bash
   git clone https://github.com/factsway/factsway-desktop.git
   cd factsway-desktop
   ```

2. **Run full build:**
   ```bash
   ./scripts/build-all.sh
   ```

3. **Find installer:**
   ```bash
   open desktop/dist-electron
   ```
   
   Look for `FACTSWAY-1.0.0-mac-x64.dmg` or `FACTSWAY-1.0.0-mac-arm64.dmg`

## Build for Distribution

For App Store or notarized distribution:

1. **Get Developer ID certificate** from Apple Developer
2. **Set environment variables:**
   ```bash
   export CSC_NAME="Developer ID Application: Your Name (TEAMID)"
   export APPLE_ID="your@email.com"
   export APPLE_ID_PASSWORD="app-specific-password"
   ```
3. **Build with signing:**
   ```bash
   npm run dist:mac
   ```

## Troubleshooting

**"pyinstaller: command not found"**
```bash
pip3 install --upgrade pyinstaller
```

**Code signing errors**
- Make sure certificates are installed in Keychain
- Check CSC_NAME matches certificate exactly

**Build hangs during service bundling**
- Check logs in `build/services/*.log`
- Ensure no services are already running on ports 3001-3008
```

---

### 7.2 Build on Windows

**File:** `docs/BUILD_WINDOWS.md`

**Action:** CREATE

**Content:**
```markdown
# Building FACTSWAY on Windows

## Prerequisites

1. **Windows 10/11**
2. **Python 3.11+:**
   - Download from https://python.org
   - Check "Add Python to PATH" during installation
3. **Node.js 18+:**
   - Download from https://nodejs.org
4. **Visual Studio Build Tools:**
   - Download from https://visualstudio.microsoft.com/downloads/
   - Select "Desktop development with C++"
5. **Git for Windows:**
   - Download from https://git-scm.com/download/win
6. **PyInstaller:**
   ```cmd
   pip install pyinstaller
   ```

## Build Steps

1. **Clone repository:**
   ```cmd
   git clone https://github.com/factsway/factsway-desktop.git
   cd factsway-desktop
   ```

2. **Build Python services:**
   ```cmd
   scripts\packaging\build-python-services.bat
   ```

3. **Build Node service:**
   ```cmd
   cd services\records-service
   npm ci
   npm run build
   ```

4. **Build Renderer:**
   ```cmd
   cd desktop\renderer
   npm ci
   npm run build
   ```

5. **Build Main process:**
   ```cmd
   cd desktop
   npm ci
   npm run build
   ```

6. **Create installer:**
   ```cmd
   npm run dist:win
   ```

7. **Find installer:**
   ```cmd
   explorer desktop\dist-electron
   ```
   
   Look for `FACTSWAY-1.0.0-win-x64.exe`

## Build for Code Signing

For signed releases:

1. **Get Code Signing Certificate** (.pfx file)
2. **Set environment variables:**
   ```cmd
   set CSC_LINK=C:\path\to\certificate.pfx
   set CSC_KEY_PASSWORD=your-password
   ```
3. **Build:**
   ```cmd
   npm run dist:win
   ```

## Troubleshooting

**"python not found"**
- Make sure Python is in PATH
- Restart terminal after installation

**"msbuild.exe not found"**
- Install Visual Studio Build Tools
- Add to PATH: `C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\MSBuild\Current\Bin`

**Port conflicts during testing**
- Check no other apps using ports 3001-3008:
  ```cmd
  netstat -ano | findstr :3001
  ```
```

---

### 7.3 Build on Linux

**File:** `docs/BUILD_LINUX.md`

**Action:** CREATE

**Content:**
```markdown
# Building FACTSWAY on Linux

## Prerequisites (Ubuntu/Debian)

```bash
# System dependencies
sudo apt-get update
sudo apt-get install -y \
  python3.11 \
  python3-pip \
  nodejs \
  npm \
  build-essential \
  libgtk-3-dev \
  libnotify-dev \
  libgconf-2-4 \
  libnss3 \
  libxss1 \
  libasound2

# PyInstaller
pip3 install pyinstaller
```

## Prerequisites (Fedora/RHEL)

```bash
# System dependencies
sudo dnf install -y \
  python3.11 \
  python3-pip \
  nodejs \
  npm \
  @development-tools \
  gtk3-devel \
  libnotify-devel \
  nss \
  libXScrnSaver \
  alsa-lib

# PyInstaller
pip3 install pyinstaller
```

## Build Steps

1. **Clone repository:**
   ```bash
   git clone https://github.com/factsway/factsway-desktop.git
   cd factsway-desktop
   ```

2. **Run full build:**
   ```bash
   chmod +x scripts/build-all.sh
   ./scripts/build-all.sh
   ```

3. **Find installer:**
   ```bash
   ls -lh desktop/dist-electron/*.AppImage
   ```

## Install Built AppImage

```bash
chmod +x FACTSWAY-1.0.0-linux-x64.AppImage
./FACTSWAY-1.0.0-linux-x64.AppImage
```

## Troubleshooting

**"node: not found"**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**AppImage doesn't run**
```bash
sudo apt-get install libfuse2
```

**Build fails with "GLIBC version"**
- Build on oldest supported Linux version (Ubuntu 20.04 recommended)
```

---

## Verification

**From Runbook 0 Section 19.10:**

### Verification Checklist

**Python Service Executables:**
- [ ] All 7 Python services build without errors
- [ ] Executables run standalone (no Python required)
- [ ] Each executable accepts PORT environment variable
- [ ] Service starts on correct port
- [ ] Health check endpoint responds
- [ ] Executable size <100MB per service

**Node Service Bundle:**
- [ ] Records service compiles successfully
- [ ] Dependencies bundled correctly
- [ ] Service starts with `node dist/index.js`
- [ ] No missing module errors

**electron-builder:**
- [ ] macOS: .dmg builds successfully
- [ ] macOS: App can be dragged to Applications
- [ ] macOS: App launches without security warnings (dev cert)
- [ ] Windows: .exe installer builds
- [ ] Windows: Installer runs without errors
- [ ] Windows: App launches after install
- [ ] Linux: .AppImage builds
- [ ] Linux: AppImage runs when executed

**Installed App:**
- [ ] App launches successfully
- [ ] All 8 services start automatically
- [ ] Services visible in Activity Monitor/Task Manager
- [ ] Renderer loads correctly
- [ ] Can create Template/Case/Draft
- [ ] Health check shows all services healthy
- [ ] Logs written to correct location

**Auto-Update:**
- [ ] Update check runs on startup
- [ ] Manual update check works (Help menu)
- [ ] Download progress shows in UI
- [ ] Update installs after download
- [ ] App version increments correctly

**Installer Quality:**
- [ ] macOS: Installer size <300MB
- [ ] Windows: Installer size <250MB
- [ ] Linux: AppImage size <280MB
- [ ] Installation completes in <2 minutes
- [ ] Uninstaller works correctly
- [ ] User data preserved after update

---

## Success Criteria

✅ All Python services compile to executables
✅ Records service bundles correctly
✅ electron-builder creates installers for all 3 platforms
✅ Installers are under 300MB
✅ Installed app launches all services successfully
✅ Auto-update checks and downloads work
✅ Code signing configured (dev certificates)
✅ Build process documented for all platforms
✅ Uninstaller removes app but preserves user data

---

## Next Steps

After Runbook 10 completes:

**Runbooks 11-15 would cover:**
1. Testing (unit, integration, E2E)
2. Documentation (user guides, developer docs)
3. CI/CD pipelines
4. Deployment automation
5. Monitoring and analytics

**For production release:**
1. Get production code signing certificates
2. Set up update server (https://updates.factsway.com)
3. Create release workflows
4. Set up crash reporting
5. Configure analytics

---

## Reference

**Runbook 0 Sections:**
- Section 22.2: Desktop Deployment Architecture
- Section 17.5: Service Packaging Requirements

**Dependencies:**
- Runbooks 1-9: Complete desktop stack
- All backend services (3-7)
- Desktop orchestrator (7)
- Renderer (8)
- Service discovery (9)

**External Tools:**
- PyInstaller: https://pyinstaller.org
- electron-builder: https://electron.build
- electron-updater: https://electron.build/auto-update

---

**End of Runbook 10**
