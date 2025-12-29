# Pandoc Bundling Strategy

**Date:** December 27, 2024
**Test Script:** `scripts/test-pandoc.sh`

## Verification Results

**Installed Version:** NOT INSTALLED
**Status:** NEEDS BUNDLING FOR DESKTOP APP

## Decision: Bundle Pandoc with Desktop Application

### Why Bundle Pandoc?

Users won't have Pandoc installed. Bundling ensures "it just works" desktop experience.

**Current status:** Pandoc is not installed on development machine
**Impact:** Confirms that end users will also not have Pandoc
**Solution:** Bundle Pandoc 3.6+ binaries with FACTSWAY desktop application

### Size Analysis

**Per Platform:**
- Windows: pandoc.exe (~100MB)
- macOS x64: pandoc (~100MB)
- macOS arm64: pandoc (~100MB)
- Linux: pandoc (~100MB)

**Total:** ~300-400MB across all platforms

**Is this acceptable?**
- Total FACTSWAY app: ~1GB (Electron + Pandoc + Python services + assets)
- Competitive legal software: 600MB - 1.5GB
- **Verdict: YES, acceptable for desktop legal software**

### Alternative Considered: User Installation

**Why NOT recommended:**
- User friction ("Please install Pandoc before using FACTSWAY")
- Version conflicts with other software
- Support burden ("Pandoc not found" errors)
- Not true desktop app experience
- Different versions across users = inconsistent behavior

**Verdict:** Bundle Pandoc. 300-400MB is acceptable for "just works" experience.

## Implementation (Runbook 10)

### 1. Download Platform Binaries

Download Pandoc 3.6+ binaries for all platforms:

```bash
# Create resources directory
mkdir -p resources/pandoc/{win32,darwin-x64,darwin-arm64,linux}

# Windows
curl -L https://github.com/jgm/pandoc/releases/download/3.6/pandoc-3.6-windows-x86_64.zip \
  -o pandoc-win.zip
unzip pandoc-win.zip -d resources/pandoc/win32

# macOS x64
curl -L https://github.com/jgm/pandoc/releases/download/3.6/pandoc-3.6-macOS-x86_64.zip \
  -o pandoc-mac-x64.zip
unzip pandoc-mac-x64.zip -d resources/pandoc/darwin-x64

# macOS ARM64
curl -L https://github.com/jgm/pandoc/releases/download/3.6/pandoc-3.6-macOS-arm64.zip \
  -o pandoc-mac-arm64.zip
unzip pandoc-mac-arm64.zip -d resources/pandoc/darwin-arm64

# Linux
curl -L https://github.com/jgm/pandoc/releases/download/3.6/pandoc-3.6-linux-amd64.tar.gz \
  -o pandoc-linux.tar.gz
tar -xzf pandoc-linux.tar.gz -C resources/pandoc/linux
```

### 2. Electron Builder Configuration

**File:** `electron-builder.yml`

```yaml
extraResources:
  - from: 'resources/pandoc/${os}'
    to: 'pandoc'
    filter:
      - '**/*'
```

This tells Electron Builder to:
- Include platform-specific Pandoc binary in app bundle
- Place it in `resources/pandoc/` directory
- Only include binary for target platform (no cross-platform bloat)

### 3. Runtime Detection

**File:** `apps/desktop/src/main/services/pandoc.ts`

```typescript
import path from 'path'
import { app } from 'electron'

export function getPandocPath(): string {
  const resourcesPath = process.resourcesPath
  const platform = process.platform
  const arch = process.arch

  let platformDir: string
  let binary: string

  if (platform === 'win32') {
    platformDir = 'win32'
    binary = 'pandoc.exe'
  } else if (platform === 'darwin') {
    platformDir = arch === 'arm64' ? 'darwin-arm64' : 'darwin-x64'
    binary = 'pandoc'
  } else {
    platformDir = 'linux'
    binary = 'pandoc'
  }

  return path.join(resourcesPath, 'pandoc', platformDir, binary)
}

// Usage in ingestion-service IPC
export async function convertDocxToHtml(docxPath: string): Promise<string> {
  const pandoc = getPandocPath()

  const { spawn } = require('child_process')

  return new Promise((resolve, reject) => {
    const process = spawn(pandoc, [
      '-f', 'docx',
      '-t', 'html',
      '--standalone',
      docxPath
    ])

    let stdout = ''
    let stderr = ''

    process.stdout.on('data', (data: Buffer) => {
      stdout += data.toString()
    })

    process.stderr.on('data', (data: Buffer) => {
      stderr += data.toString()
    })

    process.on('close', (code: number) => {
      if (code === 0) {
        resolve(stdout)
      } else {
        reject(new Error(`Pandoc failed: ${stderr}`))
      }
    })
  })
}
```

### 4. Test Bundled Pandoc

After building desktop app, verify Pandoc is bundled:

```bash
# macOS
/Applications/FACTSWAY.app/Contents/Resources/pandoc/pandoc --version

# Windows
C:\Program Files\FACTSWAY\resources\pandoc\pandoc.exe --version

# Linux
/opt/FACTSWAY/resources/pandoc/pandoc --version

# Should show: pandoc 3.6+
```

## Why Pandoc 3.6+?

**Improved footnote handling:**
- Better preservation of footnote formatting in DOCX ↔ HTML conversion
- Improved handling of complex legal document structures
- Bug fixes for citation formatting

**Comparison:**
- Pandoc 2.x: Footnotes sometimes lost in round-trip conversion
- Pandoc 3.6+: Footnotes reliably preserved

## LibreOffice Decision

**Original Runbook 0 mentioned LibreOffice for WYSIWYG PDF.**

**DECISION: REMOVE LibreOffice entirely**

**Rationale:**
- LibreOffice bundle: ~500MB
- Alternative: Electron `printToPDF()` API (built-in, 0MB)
- Result: Same WYSIWYG PDF output, save 500MB

**Implementation:**
- Remove LibreOffice from all documentation
- Use Electron `printToPDF()` in Export Service (Runbook 5)
- Update Runbook 0 to reflect this decision

## Final Recommendation

✅ **Bundle Pandoc 3.6+ with desktop app**

**Benefits:**
- "Just works" user experience
- Consistent version across all users
- No installation friction
- Reliable document conversion

**Costs:**
- ~300-400MB bundle size (acceptable)
- Need to download binaries for all platforms
- ~2-3 hours implementation time in Runbook 10

**Total bundle impact:**
- Electron base: ~300MB
- Pandoc: ~300-400MB
- Python services (7x): ~400MB (PyInstaller bundles)
- Assets & code: ~100MB
- **Total: ~1.0-1.2GB (competitive with legal software market)**

## Next Steps

- [ ] Download Pandoc 3.6+ binaries for all platforms
- [ ] Add to `resources/pandoc/` directory structure
- [ ] Configure electron-builder.yml
- [ ] Implement getPandocPath() runtime detection
- [ ] Update Runbook 0 to remove LibreOffice, use Electron printToPDF
- [ ] Update Runbook 5 with Electron printToPDF implementation
- [ ] Update Runbook 10 with Pandoc bundling steps
- [ ] Test bundled Pandoc on all platforms
