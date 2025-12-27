## Purpose
UNSPECIFIED
TODO: Provide details (10_RUNBOOK_10_DESKTOP_PACKAGING.md:L1-L1374)

## Produces (Artifacts)
mkdir -p "$BUILD_DIR"
mkdir -p "$OUTPUT_DIR"

## Consumes (Prereqs)
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

## Interfaces Touched
- REST endpoints
  - UNSPECIFIED
  - TODO: Document REST endpoints (10_RUNBOOK_10_DESKTOP_PACKAGING.md:L1-L1374)
- IPC channels/events (if any)
  - **Purpose:** Handle automatic updates (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L771-L771) "**Purpose:** Handle automatic updates"
  - **Port conflicts during testing** (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L1158-L1158) "**Port conflicts during testing**"
  - - [ ] Each executable accepts PORT environment variable (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L1273-L1273) "- [ ] Each executable accepts PORT environment variable"
  - - [ ] Service starts on correct port (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L1274-L1274) "- [ ] Service starts on correct port"
- Filesystem paths/formats
  - requirements.txt (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L233-L233) "if [ -f "requirements.txt" ]; then"
  - requirements.txt (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L234-L234) "pip install -r requirements.txt --quiet"
  - requirements.txt (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L321-L321) "if exist requirements.txt ("
  - requirements.txt (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L322-L322) "pip install -r requirements.txt --quiet"
  - package.json (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L409-L409) "cp package.json "$OUTPUT_DIR/""
  - electron-builder.json (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L445-L445) "**File:** `desktop/electron-builder.json`"
  - package.json (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L465-L465) ""package.json""
  - package.json (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L726-L726) "### 4.2 Update Desktop package.json"
  - package.json (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L728-L728) "**File:** `desktop/package.json` (UPDATE)"
  - BUILD_MACOS.md (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L973-L973) "**File:** `docs/BUILD_MACOS.md`"
  - BUILD_WINDOWS.md (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L1061-L1061) "**File:** `docs/BUILD_WINDOWS.md`"
  - BUILD_LINUX.md (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L1169-L1169) "**File:** `docs/BUILD_LINUX.md`"
- Process lifecycle (if any)
  - UNSPECIFIED
  - TODO: Document process lifecycle (10_RUNBOOK_10_DESKTOP_PACKAGING.md:L1-L1374)

## Contracts Defined or Used
- IPC **Purpose:** Handle automatic updates (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L771-L771) "**Purpose:** Handle automatic updates"
- IPC **Port conflicts during testing** (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L1158-L1158) "**Port conflicts during testing**"
- IPC - [ ] Each executable accepts PORT environment variable (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L1273-L1273) "- [ ] Each executable accepts PORT environment variable"
- IPC - [ ] Service starts on correct port (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L1274-L1274) "- [ ] Service starts on correct port"
- File requirements.txt (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L233-L233) "if [ -f "requirements.txt" ]; then"
- File requirements.txt (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L234-L234) "pip install -r requirements.txt --quiet"
- File requirements.txt (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L321-L321) "if exist requirements.txt ("
- File requirements.txt (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L322-L322) "pip install -r requirements.txt --quiet"
- File package.json (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L409-L409) "cp package.json "$OUTPUT_DIR/""
- File electron-builder.json (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L445-L445) "**File:** `desktop/electron-builder.json`"
- File package.json (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L465-L465) ""package.json""
- File package.json (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L726-L726) "### 4.2 Update Desktop package.json"
- File package.json (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L728-L728) "**File:** `desktop/package.json` (UPDATE)"
- File BUILD_MACOS.md (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L973-L973) "**File:** `docs/BUILD_MACOS.md`"
- File BUILD_WINDOWS.md (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L1061-L1061) "**File:** `docs/BUILD_WINDOWS.md`"
- File BUILD_LINUX.md (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L1169-L1169) "**File:** `docs/BUILD_LINUX.md`"

## Invariants Relied On
UNSPECIFIED
TODO: Add invariants (10_RUNBOOK_10_DESKTOP_PACKAGING.md:L1-L1374)

## Verification Gate (Commands + Expected Outputs)
- 'pytest', (Source: 10_RUNBOOK_10_DESKTOP_PACKAGING.md:L135-L135) "'pytest',"

## Risks / Unknowns (TODOs)
UNSPECIFIED
TODO: Document risks (10_RUNBOOK_10_DESKTOP_PACKAGING.md:L1-L1374)
