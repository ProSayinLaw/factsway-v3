# RUNBOOK UPDATES - Final Prep Step (Hour 8-9)

**Task:** Update Runbooks 0, 1, 8, and 10 with all finalized decisions and revised estimates

**Time Estimate:** 1 hour  
**Method:** Manual edits to existing runbook files

---

## RUNBOOK 0 UPDATES

**File:** `Runbooks/RUNBOOK_0_CORE_SYSTEM_DESIGN.md`

### **Change 1: Section 1.2 - Frontend Framework**

**Find:**
```markdown
### 1.2 Frontend Transformation

Frontend transformation: React app transforms Tiptap JSON ↔ LegalDocument
```

**Replace with:**
```markdown
### 1.2 Frontend Transformation

Frontend transformation: Vue 3 app transforms Tiptap JSON ↔ LegalDocument

**Framework Choice:** Vue 3
- Better for single developer (less boilerplate)
- Perfect for LLM-driven dynamic UI (`<component :is>` directive)
- Official Tiptap support (`@tiptap/vue-3`)
- Built-in transitions for workspace reconfiguration
- Pinia state management (simpler than Redux)

See ARCHITECTURAL_DECISIONS_SUMMARY.md for full rationale.
```

---

### **Change 2: Section 2.9 - Add Sentence ID Stability Algorithm**

**Find:** Section 2.9 (end of sentence splitting section)

**Add new subsection:**

```markdown
### 2.9.3 Sentence ID Stability Algorithm

**Requirement:** Sentence IDs must remain stable across:
- Editor interactions (typing, formatting)
- Save/load cycles  
- Export/import pipeline
- Tiptap ↔ LegalDocument transformations

**Algorithm:** Content-based hashing with position

```typescript
function generateSentenceId(text: string, position: number): string {
  const normalized = text.trim().toLowerCase()
  const hash = crypto.createHash('sha256')
    .update(normalized)
    .update(position.toString())
    .digest('hex')
    .substring(0, 16)
  
  return `sent_${hash}`
}
```

**Preservation Rules:**
1. ID regenerated only if sentence text changes >20%
2. Position updates don't change ID
3. Formatting changes don't change ID
4. Split sentence: Original keeps ID, new sentence gets new ID
5. Merge sentences: First keeps ID, second removed

**Implementation:** ingestion-service during LegalDocument creation
```

---

### **Change 3: Remove LibreOffice Dependency**

**Find:**
```markdown
True WYSIWYG via LibreOffice conversion (DOCX → PDF)
```

**Replace with:**
```markdown
WYSIWYG PDF preview via Electron printToPDF API

**Decision:** Removed LibreOffice dependency
- LibreOffice: ~500MB bundle size
- Electron printToPDF: Built-in, no extra size
- Result: Same WYSIWYG, saves 500MB

See Runbook 5 for export-service implementation using Electron API.
```

---

## RUNBOOK 1 UPDATES

**File:** `Runbooks/RUNBOOK_1_SHARED_TYPES_PACKAGE.md`

### **Change 1: Update Time Estimate**

**Find:**
```markdown
**Estimated Time:** 2-3 hours
```

**Replace with:**
```markdown
**Estimated Time:** 8-9 hours

**Breakdown:**
- Monorepo setup (pnpm): 1 hour
- JSON Schema creation: 2 hours
- Type generation setup: 1 hour
- Feature Registry infrastructure: 3 hours
- Facts Clerk definition: 1 hour
- Testing & verification: 1 hour
```

---

### **Change 2: Add JSON Schema Section**

**Find:** Section after "Task 1: Create Package Structure"

**Add new task:**

```markdown
## Task 1.5: Create JSON Schema (Single Source of Truth)

### Why JSON Schema?

LegalDocument must exist in both TypeScript (frontend) and Python (backend services). 
Without a single source, these WILL drift.

**Solution:** JSON Schema generates both TypeScript and Python types automatically.

### Create Schema

**File:** `packages/shared-types/schemas/legal-document.schema.json`

[Copy complete schema from CLAUDE_CODE_PROMPT_1_JSON_SCHEMA_REGISTRY.md]

### Setup Generation Scripts

**File:** `packages/shared-types/scripts/generate-typescript.sh`

[Copy script from CLAUDE_CODE_PROMPT_1_JSON_SCHEMA_REGISTRY.md]

**File:** `packages/shared-types/scripts/generate-python.sh`

[Copy script from CLAUDE_CODE_PROMPT_1_JSON_SCHEMA_REGISTRY.md]

**File:** `packages/shared-types/scripts/generate-all.sh`

[Copy script from CLAUDE_CODE_PROMPT_1_JSON_SCHEMA_REGISTRY.md]

Make all executable:
```bash
chmod +x packages/shared-types/scripts/*.sh
```

### Generate Types

```bash
cd packages/shared-types

# Install tools
npm install -g quicktype
pip install datamodel-code-generator --break-system-packages

# Generate both
./scripts/generate-all.sh

# Verify
npm run build  # TypeScript compiles
python3 -c "from python.legal_document import LegalDocument; print('✓')"
```

**Time:** 3 hours
```

---

### **Change 3: Add Feature Registry Section**

**Add after JSON Schema task:**

```markdown
## Task 1.6: Create Feature Registry Infrastructure

### Why Feature Registry?

Feature Registry documents all 8 clerk components in structured format. This serves:
1. **LLM workspace configuration** - LLM knows what features exist and how to configure them
2. **User documentation** - Automatic feature discovery and help
3. **Privacy transparency** - Clear data access documentation
4. **Testing framework** - Tests generated from capabilities
5. **API specification** - Future API auto-generated from definitions

**Key Insight:** This is the frontend complement to ClerkGuard (backend). Same pattern:
- ClerkGuard enforces backend security via channel definitions
- Feature Registry enforces frontend documentation via clerk definitions

### Create ClerkDefinition Interface

**File:** `packages/shared-types/src/registry/clerk-definition.interface.ts`

[Copy complete interface from CLAUDE_CODE_PROMPT_1_JSON_SCHEMA_REGISTRY.md]

### Create Facts Clerk Definition (Template)

**File:** `packages/shared-types/src/registry/clerks/facts-clerk.definition.ts`

[Copy complete Facts Clerk definition from CLAUDE_CODE_PROMPT_1_JSON_SCHEMA_REGISTRY.md]

**Note:** This serves as the template for documenting the other 7 clerks during Runbook 8.

### Create Registry Exports

**File:** `packages/shared-types/src/registry/index.ts`

[Copy complete registry exports from CLAUDE_CODE_PROMPT_1_JSON_SCHEMA_REGISTRY.md]

### Helper Functions Provided

- `getClerkCapabilities()` - For LLM system prompt
- `findClerkByIntent()` - Match user intent to clerk
- `getPrivacyReport()` - Answer "what data do you access?"
- `getClerkById()` - Lookup by ID
- `getAllClerkIds()` - List all clerks

**Time:** 3 hours
```

---

### **Change 4: Add pnpm Workspaces Section**

**Add before first task:**

```markdown
## Task 0: Setup Monorepo with pnpm

### Install pnpm

```bash
npm install -g pnpm
```

### Create Workspace Config

**File:** `pnpm-workspace.yaml` (repository root)

```yaml
packages:
  - 'services/*'
  - 'apps/*'
  - 'packages/*'
```

### Update Root package.json

**File:** `package.json` (repository root)

```json
{
  "name": "factsway-platform",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "services/*",
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "build:all": "pnpm -r build",
    "clean": "pnpm -r clean"
  }
}
```

### Install Dependencies

```bash
pnpm install
```

**Benefit:** Fast installs, efficient disk usage, workspace protocol (`workspace:*`)

**Time:** 1 hour
```

---

### **Change 5: Update Dependencies in package.json**

**Find:** dependencies section

**Add:**

```json
{
  "scripts": {
    "generate:types": "./scripts/generate-typescript.sh",
    "generate:python": "./scripts/generate-python.sh", 
    "generate:all": "./scripts/generate-all.sh",
    "build": "tsc",
    "test": "echo 'No tests yet' && exit 0"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.10.6"
  }
}
```

---

## RUNBOOK 8 UPDATES

**File:** `Runbooks/RUNBOOK_8_FRONTEND_RENDERER.md`

### **Change 1: Update Time Estimate**

**Find:**
```markdown
**Estimated Time:** 12-16 hours
```

**Replace with:**
```markdown
**Estimated Time:** 27-33 hours

**Breakdown:**
- Vue 3 app setup: 2 hours
- 8 views from Design System: 4 hours
- 3 custom Tiptap extensions: 8-12 hours
- Custom footnote extension: 4-6 hours
- IPC bridge implementation: 2 hours
- Pinia stores: 2 hours
- Transformation layer (Tiptap ↔ LegalDocument): 3-4 hours
- Feature Registry definitions (8 clerks): 8 hours
- Testing & integration: 2-3 hours

**Why longer than original estimate:**
- Realistic time for 3 custom Tiptap extensions (not 3h, actually 8-12h)
- Custom footnote extension instead of community package (4-6h)
- Feature Registry documentation for all 8 clerks (8h)
```

---

### **Change 2: Add Custom Footnote Extension Task**

**Add new task:**

```markdown
## Task 5: Custom Tiptap Extensions

### 5.1-5.3: [Existing Citation, Variable, CrossReference extensions]

### 5.4: Footnote Extension (Custom)

**Why custom?**
- Community package `tiptap-footnotes` may be abandoned
- Need full control for DOCX export compatibility
- Tight integration with LegalDocument format

**File:** `renderer/src/extensions/nodes/FootnoteNode.ts`

```typescript
import { Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import FootnoteComponent from './FootnoteComponent.vue'

export const FootnoteNode = Node.create({
  name: 'footnote',
  
  group: 'inline',
  inline: true,
  
  addAttributes() {
    return {
      id: { default: null },
      text: { default: '' },
      number: { default: 1 }
    }
  },
  
  parseHTML() {
    return [{ tag: 'footnote' }]
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['footnote', HTMLAttributes]
  },
  
  addNodeView() {
    return VueNodeViewRenderer(FootnoteComponent)
  }
})
```

**Component:** 
- Inline marker with superscript number
- Tooltip on hover showing footnote text
- Sidebar panel showing all footnotes
- Bidirectional linking (marker ↔ footnote text)

**Export:**
- Transform to DOCX footnotes (export-service)
- Import from DOCX footnotes (ingestion-service)

**Time:** 4-6 hours
```

---

### **Change 3: Add Feature Registry Documentation Task**

**Add new task:**

```markdown
## Task 9: Document Clerks in Feature Registry

As you build each of the 8 clerk components, create their Feature Registry definitions.

**Template:** Use `packages/shared-types/src/registry/clerks/facts-clerk.definition.ts`

### Clerks to Document:

1. **FactsClerk.vue** → `facts-clerk.definition.ts` (already done in Runbook 1)
2. **ExhibitsClerk.vue** → `exhibits-clerk.definition.ts`
3. **DiscoveryClerk.vue** → `discovery-clerk.definition.ts`
4. **CaseblockClerk.vue** → `caseblock-clerk.definition.ts`
5. **SignatureClerk.vue** → `signature-clerk.definition.ts`
6. **EditorClerk.vue** → `editor-clerk.definition.ts`
7. **CommunicationClerk.vue** → `communication-clerk.definition.ts`
8. **AnalysisClerk.vue** → `analysis-clerk.definition.ts`

### For Each Clerk, Document:

```typescript
{
  id: 'clerk-id',
  name: 'Human-Readable Name',
  description: 'What this clerk does',
  capabilities: [
    'Capability 1',
    'Capability 2',
    // ...
  ],
  inputs: [
    { name: 'input1', type: 'ULID', required: true, description: '...' }
  ],
  outputs: [
    { name: 'output1', type: 'Type[]', description: '...' }
  ],
  privacy: {
    dataAccessed: ['What data it reads'],
    dataStored: ['What data it stores'],
    externalAPIs: ['None' or list APIs]
  },
  uiModes: {
    'mode-name': {
      description: 'What this mode does',
      layout: 'sidebar' | 'main' | 'bottom',
      minSize: { width: 300, height: 400 }
    }
  },
  examples: [
    {
      userIntent: 'User says this',
      configuration: { /* LLM configures this */ }
    }
  ]
}
```

### Add to Registry

After creating each definition, add to `packages/shared-types/src/registry/index.ts`:

```typescript
import { EXHIBITS_CLERK } from './clerks/exhibits-clerk.definition'

export const CLERK_REGISTRY: ClerkRegistry = {
  'facts-clerk': FACTS_CLERK,
  'exhibits-clerk': EXHIBITS_CLERK,  // ← ADD
  // ...
}
```

**Why This Matters:**
- LLM can configure workspace for any documented clerk
- Users can ask "what can X clerk do?" and get accurate answers
- Privacy transparency built-in
- Documentation can't go stale (required for functionality)

**Time:** 1 hour per clerk = 8 hours total (Facts already done in Runbook 1, so 7 hours remaining)
```

---

## RUNBOOK 10 UPDATES

**File:** `Runbooks/RUNBOOK_10_DESKTOP_PACKAGING.md`

### **Change 1: Update Time Estimate**

**Find:**
```markdown
**Estimated Time:** 10-14 hours
```

**Replace with:**
```markdown
**Estimated Time:** 16-22 hours

**Breakdown:**
- Electron builder setup: 2 hours
- PyInstaller bundling (7 services): 8-10 hours
- Pandoc bundling (3 platforms): 2-3 hours
- Code signing: 2 hours
- Testing on all platforms: 2-3 hours
- Distribution setup: 2 hours

**Why longer:**
- PyInstaller per-service approach (+8h vs single bundle)
- Pandoc bundling for 3 platforms (+2-3h)
- More thorough than original estimate
```

---

### **Change 2: Add PyInstaller Strategy Section**

**Add new section:**

```markdown
## Task 3: Python Service Bundling with PyInstaller

### Strategy: Per-Service Executables

**Decision:** Each of 7 Python services becomes standalone executable

**Why:**
- True microservices isolation (fault tolerance)
- Can restart individual services
- Easy debugging (test services independently)
- Modular updates
- Matches architecture perfectly

**Size:** ~50-100MB per service = ~400MB total (acceptable for desktop)

### Setup PyInstaller (Per Service)

**Example: ingestion-service**

```bash
cd services/ingestion-service

# Install PyInstaller
pip install pyinstaller --break-system-packages

# Create spec file
pyi-makespec --onefile app/main.py --name ingestion-service

# Edit ingestion-service.spec to add hidden imports
```

**File:** `services/ingestion-service/ingestion-service.spec`

```python
# -*- mode: python ; coding: utf-8 -*-

a = Analysis(
    ['app/main.py'],
    pathex=[],
    binaries=[],
    datas=[],
    hiddenimports=[
        'lxml',
        'lxml.etree',
        'fastapi',
        'pydantic',
        'uvicorn',
        'python_docx',
        # Add all imports that PyInstaller misses
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=None,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=None)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='ingestion-service',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,  # UPX compression
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
```

### Build Script

**File:** `services/ingestion-service/build.sh`

```bash
#!/bin/bash
set -e

echo "Building ingestion-service..."

# Clean previous build
rm -rf dist build

# Build with PyInstaller
pyinstaller ingestion-service.spec

# Compress with UPX (optional, ~30% size reduction)
if command -v upx &> /dev/null; then
    upx --best dist/ingestion-service
    echo "✓ Compressed with UPX"
fi

# Test executable
echo "Testing executable..."
./dist/ingestion-service --version

echo "✓ Build complete: dist/ingestion-service"
```

### Repeat for All 7 Services

1. ingestion-service (port 3002)
2. export-service (port 3003)
3. caseblock-service (port 3004)
4. signature-service (port 3005)
5. facts-service (port 3006)
6. exhibits-service (port 3007)
7. caselaw-service (port 3008)

**Time:** ~2-3 hours initial setup, ~30 min per additional service = 8-10 hours total

### Electron Builder Integration

**File:** `electron-builder.yml`

```yaml
extraResources:
  - from: 'services/*/dist/*'
    to: 'services'
    filter:
      - '**/*'
```

### Desktop Orchestrator Spawning

**File:** `apps/desktop/src/main/orchestrator.ts`

```typescript
const servicePath = path.join(
  process.resourcesPath,
  'services',
  'ingestion-service',
  'ingestion-service'  // Or .exe on Windows
)

const service = spawn(servicePath, {
  env: { PORT: '3002' }
})
```

See ARCHITECTURAL_DECISIONS_SUMMARY.md for full PyInstaller rationale.
```

---

### **Change 3: Add Pandoc Bundling Section**

**Add new section:**

```markdown
## Task 5: Pandoc Bundling

### Why Bundle Pandoc?

Users won't have Pandoc installed. Bundling ensures "it just works."

**Size:** ~100MB per platform = ~300MB total (acceptable)

### Download Platform Binaries

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

### Electron Builder Config

**File:** `electron-builder.yml`

```yaml
extraResources:
  - from: 'resources/pandoc/${os}'
    to: 'pandoc'
    filter:
      - '**/*'
```

### Runtime Detection

**File:** `src/main/services/pandoc.ts`

```typescript
import path from 'path'

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
```

**Verification:** See docs/PANDOC_BUNDLING_STRATEGY.md

**Time:** 2-3 hours
```

---

## VERIFICATION CHECKLIST

After making all updates, verify:

### Runbook 0
- [ ] Section 1.2 says "Vue 3" (not React)
- [ ] Section 2.9.3 added (Sentence ID algorithm)
- [ ] LibreOffice removed, Electron printToPDF mentioned

### Runbook 1  
- [ ] Time estimate updated to 8-9 hours
- [ ] pnpm workspaces section added
- [ ] JSON Schema section added
- [ ] Feature Registry section added
- [ ] Scripts and dependencies documented

### Runbook 8
- [ ] Time estimate updated to 27-33 hours
- [ ] Custom footnote extension task added
- [ ] Feature Registry documentation task added (8 clerks)
- [ ] Breakdown shows realistic time allocations

### Runbook 10
- [ ] Time estimate updated to 16-22 hours
- [ ] PyInstaller per-service strategy documented
- [ ] Pandoc bundling section added
- [ ] Size analysis included (~1GB total app)

---

## SUMMARY OF CHANGES

**Time Estimate Updates:**
- Runbook 1: 2-3h → 8-9h (+6h for JSON Schema + Registry + pnpm)
- Runbook 8: 12-16h → 27-33h (+15h for realistic extensions + clerk definitions)
- Runbook 10: 10-14h → 16-22h (+6h for PyInstaller + Pandoc)

**New Sections Added:**
- Runbook 0: Sentence ID algorithm, LibreOffice removal
- Runbook 1: JSON Schema, Feature Registry, pnpm workspaces
- Runbook 8: Custom footnote extension, clerk definitions
- Runbook 10: PyInstaller strategy, Pandoc bundling

**Total New Content:** ~3,000 words across 4 runbooks

**Time to Make Updates:** 1 hour (manual editing)

---

## NEXT STEP AFTER UPDATES

Once all runbooks are updated:

✅ **Prep plan complete (9 hours)**
✅ **Ready to begin Phase 4 (Runbook 1)**

**Total Timeline:** 127-170 hours (16-21 work days)

**Confidence:** VERY HIGH - All decisions finalized, architecture aligned, realistic estimates
