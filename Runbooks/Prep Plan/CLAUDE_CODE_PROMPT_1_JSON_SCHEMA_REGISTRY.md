# CLAUDE CODE PROMPT: JSON Schema + Feature Registry Setup

**Task:** Create JSON Schema infrastructure and Feature Registry foundation for FACTSWAY platform

**Time Estimate:** 5-6 hours  
**Repository:** /Users/alexcruz/Documents/4.0 UI and Backend 360  

---

## CONTEXT

You're setting up two critical "single source of truth" systems:

1. **JSON Schema:** Generates TypeScript + Python types for LegalDocument
2. **Feature Registry:** Documents all 8 clerk components for LLM integration

Both enforce architectural discipline: you can't use features without documenting them.

---

## TASK 1: Create Directory Structure

Create these directories:

```bash
cd "/Users/alexcruz/Documents/4.0 UI and Backend 360"

mkdir -p packages/shared-types/schemas
mkdir -p packages/shared-types/src/registry/clerks
mkdir -p packages/shared-types/python
mkdir -p packages/shared-types/scripts
```

---

## TASK 2: Create JSON Schema

**File:** `packages/shared-types/schemas/legal-document.schema.json`

Create a comprehensive JSON Schema for LegalDocument. This is the SINGLE SOURCE that will generate both TypeScript and Python types.

**Schema should include:**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "LegalDocument",
  "description": "Canonical legal document format for FACTSWAY platform",
  "type": "object",
  "required": ["meta", "body"],
  "properties": {
    "meta": {
      "$ref": "#/definitions/DocumentMeta"
    },
    "body": {
      "$ref": "#/definitions/DocumentBody"
    }
  },
  "definitions": {
    "DocumentMeta": {
      "type": "object",
      "required": ["documentId", "caseId", "type", "createdAt", "updatedAt"],
      "properties": {
        "documentId": {
          "type": "string",
          "pattern": "^[0-9A-HJKMNP-TV-Z]{26}$",
          "description": "ULID for document"
        },
        "caseId": {
          "type": "string",
          "pattern": "^[0-9A-HJKMNP-TV-Z]{26}$",
          "description": "ULID for parent case"
        },
        "type": {
          "type": "string",
          "enum": ["motion", "response", "reply", "order", "pleading", "discovery"],
          "description": "Document type"
        },
        "title": {
          "type": "string",
          "description": "Document title"
        },
        "createdAt": {
          "type": "string",
          "format": "date-time"
        },
        "updatedAt": {
          "type": "string",
          "format": "date-time"
        }
      }
    },
    "DocumentBody": {
      "type": "object",
      "required": ["sections"],
      "properties": {
        "sections": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Section"
          }
        }
      }
    },
    "Section": {
      "type": "object",
      "required": ["sectionId", "type", "level"],
      "properties": {
        "sectionId": {
          "type": "string",
          "pattern": "^[0-9A-HJKMNP-TV-Z]{26}$"
        },
        "type": {
          "type": "string",
          "enum": ["heading", "paragraph", "list", "signature", "caseblock"]
        },
        "level": {
          "type": "integer",
          "minimum": 1,
          "maximum": 6
        },
        "content": {
          "oneOf": [
            { "$ref": "#/definitions/HeadingContent" },
            { "$ref": "#/definitions/ParagraphContent" },
            { "$ref": "#/definitions/ListContent" }
          ]
        },
        "children": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Section"
          }
        }
      }
    },
    "HeadingContent": {
      "type": "object",
      "required": ["text"],
      "properties": {
        "text": {
          "type": "string"
        },
        "numbering": {
          "type": "string",
          "description": "Section numbering like 'I.', 'A.', '1.'"
        }
      }
    },
    "ParagraphContent": {
      "type": "object",
      "required": ["text"],
      "properties": {
        "text": {
          "type": "string",
          "description": "Plain text content (authoritative)"
        },
        "sentences": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Sentence"
          }
        }
      }
    },
    "Sentence": {
      "type": "object",
      "required": ["sentenceId", "text", "start", "end"],
      "properties": {
        "sentenceId": {
          "type": "string",
          "pattern": "^sent_[a-f0-9]{16}$",
          "description": "Content-based hash for stability"
        },
        "text": {
          "type": "string"
        },
        "start": {
          "type": "integer",
          "description": "Character offset in paragraph"
        },
        "end": {
          "type": "integer",
          "description": "Character offset in paragraph"
        }
      }
    },
    "ListContent": {
      "type": "object",
      "required": ["items"],
      "properties": {
        "listType": {
          "type": "string",
          "enum": ["bullet", "numbered", "lettered"]
        },
        "items": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["text"],
            "properties": {
              "text": { "type": "string" },
              "marker": { "type": "string" }
            }
          }
        }
      }
    }
  }
}
```

**Verify:** The schema is valid JSON and follows JSON Schema Draft 7 spec.

---

## TASK 3: Create Generation Scripts

### **Script 1: Generate TypeScript Types**

**File:** `packages/shared-types/scripts/generate-typescript.sh`

```bash
#!/bin/bash
set -e

echo "Generating TypeScript types from JSON Schema..."

cd "$(dirname "$0")/.."

# Install quicktype if not present
if ! command -v quicktype &> /dev/null; then
    echo "Installing quicktype..."
    npm install -g quicktype
fi

# Generate TypeScript types
quicktype schemas/legal-document.schema.json \
    --lang typescript \
    --src-lang schema \
    --out src/legal-document.types.ts \
    --just-types \
    --nice-property-names \
    --explicit-unions

echo "✓ TypeScript types generated: src/legal-document.types.ts"

# Verify it compiles
if command -v tsc &> /dev/null; then
    tsc --noEmit src/legal-document.types.ts && echo "✓ TypeScript types compile successfully"
fi
```

Make executable: `chmod +x packages/shared-types/scripts/generate-typescript.sh`

---

### **Script 2: Generate Python Models**

**File:** `packages/shared-types/scripts/generate-python.sh`

```bash
#!/bin/bash
set -e

echo "Generating Python Pydantic models from JSON Schema..."

cd "$(dirname "$0")/.."

# Install datamodel-code-generator if not present
if ! pip show datamodel-code-generator &> /dev/null; then
    echo "Installing datamodel-code-generator..."
    pip install datamodel-code-generator --break-system-packages
fi

# Generate Python models
datamodel-codegen \
    --input schemas/legal-document.schema.json \
    --output python/legal_document.py \
    --target-python-version 3.11 \
    --use-standard-collections \
    --use-schema-description

echo "✓ Python models generated: python/legal_document.py"

# Verify it's valid Python
python3 -m py_compile python/legal_document.py && echo "✓ Python models compile successfully"
```

Make executable: `chmod +x packages/shared-types/scripts/generate-python.sh`

---

### **Script 3: Generate Both**

**File:** `packages/shared-types/scripts/generate-all.sh`

```bash
#!/bin/bash
set -e

echo "========================================="
echo "Generating Types from JSON Schema"
echo "========================================="

./scripts/generate-typescript.sh
echo ""
./scripts/generate-python.sh

echo ""
echo "========================================="
echo "✓ All types generated successfully"
echo "========================================="
```

Make executable: `chmod +x packages/shared-types/scripts/generate-all.sh`

---

## TASK 4: Create Feature Registry Infrastructure

### **File 1: ClerkDefinition Interface**

**File:** `packages/shared-types/src/registry/clerk-definition.interface.ts`

```typescript
/**
 * Clerk Definition - Documents a clerk component's capabilities, inputs, outputs, and privacy
 * 
 * This interface serves multiple purposes:
 * 1. LLM knowledge base for workspace configuration
 * 2. User documentation (what features exist)
 * 3. Privacy transparency (what data is accessed)
 * 4. Testing framework (capabilities → tests)
 * 5. API specification (future)
 */

export interface ClerkInput {
  name: string
  type: string
  required: boolean
  description: string
  validation?: {
    pattern?: string
    min?: number
    max?: number
    enum?: string[]
  }
}

export interface ClerkOutput {
  name: string
  type: string
  description: string
}

export interface UIMode {
  description: string
  layout: 'sidebar' | 'main' | 'modal' | 'bottom' | 'floating'
  minSize: {
    width: number
    height: number
  }
  preferredSize?: {
    width: number
    height: number
  }
}

export interface ClerkDefinition {
  // Identity
  id: string
  name: string
  description: string
  version: string
  
  // Capabilities (what this clerk can do)
  capabilities: string[]
  
  // Data contract
  inputs: ClerkInput[]
  outputs: ClerkOutput[]
  
  // Privacy & Security
  privacy: {
    dataAccessed: string[]
    dataStored: string[]
    externalAPIs: string[]
    clerkGuardChannel?: string  // Links to backend ClerkGuard channel
  }
  
  // Requirements
  constraints: {
    requiresCase: boolean
    requiresDocument: boolean
    requiresInternet: boolean
    minimumData: string[]
  }
  
  // UI Configuration
  uiModes: {
    [modeName: string]: UIMode
  }
  defaultMode: string
  
  // LLM Training Examples
  examples: Array<{
    userIntent: string
    configuration: Record<string, any>
    expectedOutcome?: string
  }>
  
  // Metadata
  tags: string[]
  category: 'document-processing' | 'analysis' | 'workflow' | 'communication'
}

export interface ClerkRegistry {
  [clerkId: string]: ClerkDefinition
}
```

---

### **File 2: Facts Clerk Definition (Template)**

**File:** `packages/shared-types/src/registry/clerks/facts-clerk.definition.ts`

```typescript
import { ClerkDefinition } from '../clerk-definition.interface'

/**
 * Facts Clerk - Manages factual claims, contradictions, and evidence linking
 * 
 * This is the TEMPLATE definition. All other clerk definitions should follow this pattern.
 */
export const FACTS_CLERK: ClerkDefinition = {
  // Identity
  id: 'facts-clerk',
  name: 'Facts Clerk',
  description: 'Manages factual claims, contradictions, and evidence linking across all case documents. Extracts facts from uploaded documents, detects contradictions between claims, and links facts to supporting evidence.',
  version: '1.0.0',
  
  // Capabilities
  capabilities: [
    'Extract factual claims from uploaded documents',
    'Detect contradictions between claims across documents',
    'Link facts to supporting evidence and exhibits',
    'Track claim sources (document, page, paragraph)',
    'Highlight claims that lack supporting evidence',
    'Generate chronological fact timeline visualization',
    'Export fact table for court filings',
    'Alpha Facts engine for claim strength analysis',
    'Annotate facts with user notes and categorization'
  ],
  
  // Data Contract
  inputs: [
    {
      name: 'caseId',
      type: 'ULID',
      required: true,
      description: 'Case identifier to associate facts with'
    },
    {
      name: 'documentId',
      type: 'ULID',
      required: false,
      description: 'Specific document to extract facts from (optional - can show all case facts)'
    },
    {
      name: 'filterBy',
      type: 'string',
      required: false,
      description: 'Filter facts by type or source',
      validation: {
        enum: ['all', 'contradictions', 'unsupported', 'by-document', 'by-strength']
      }
    }
  ],
  
  outputs: [
    {
      name: 'facts',
      type: 'Fact[]',
      description: 'Extracted factual claims with metadata'
    },
    {
      name: 'contradictions',
      type: 'Contradiction[]',
      description: 'Detected contradictions between facts'
    },
    {
      name: 'evidenceLinks',
      type: 'EvidenceLink[]',
      description: 'Links between facts and supporting evidence'
    },
    {
      name: 'strengthScores',
      type: 'AlphaFactsScore[]',
      description: 'Claim strength analysis from Alpha Facts engine'
    }
  ],
  
  // Privacy & Security
  privacy: {
    dataAccessed: [
      'All documents in the current case',
      'Previously extracted facts from case',
      'Evidence attachments linked to case',
      'User annotations on facts'
    ],
    dataStored: [
      'Extracted facts as plain text',
      'Sentence IDs and character positions',
      'Contradiction relationships',
      'User annotations and categorizations',
      'Evidence links'
    ],
    externalAPIs: [
      'None - all fact extraction and analysis happens locally'
    ],
    clerkGuardChannel: 'facts:extract'
  },
  
  // Requirements
  constraints: {
    requiresCase: true,
    requiresDocument: false,  // Can show existing facts without new document
    requiresInternet: false,
    minimumData: [
      'At least one document uploaded to case for fact extraction'
    ]
  },
  
  // UI Modes
  uiModes: {
    'list': {
      description: 'Shows all facts as searchable, sortable list',
      layout: 'sidebar',
      minSize: { width: 300, height: 400 },
      preferredSize: { width: 400, height: 600 }
    },
    'contradictions': {
      description: 'Highlights contradictory claims with side-by-side comparison',
      layout: 'sidebar',
      minSize: { width: 350, height: 500 },
      preferredSize: { width: 450, height: 700 }
    },
    'timeline': {
      description: 'Chronological visualization of factual events',
      layout: 'main',
      minSize: { width: 600, height: 400 },
      preferredSize: { width: 900, height: 600 }
    },
    'evidence-linking': {
      description: 'Interface for linking facts to supporting evidence',
      layout: 'bottom',
      minSize: { width: 800, height: 250 },
      preferredSize: { width: 1000, height: 350 }
    },
    'strength-analysis': {
      description: 'Alpha Facts engine claim strength scoring',
      layout: 'sidebar',
      minSize: { width: 350, height: 400 },
      preferredSize: { width: 400, height: 600 }
    }
  },
  defaultMode: 'list',
  
  // LLM Training Examples
  examples: [
    {
      userIntent: 'Check for contradictions in the motion',
      configuration: {
        mode: 'contradictions',
        filterBy: 'contradictions',
        highlightNew: true
      },
      expectedOutcome: 'Opens Facts Clerk in contradictions mode, highlighting newly detected contradictions'
    },
    {
      userIntent: 'Show me all facts from Cruz case',
      configuration: {
        mode: 'list',
        filterBy: 'all',
        sortBy: 'document'
      },
      expectedOutcome: 'Opens Facts Clerk showing complete fact list for case'
    },
    {
      userIntent: 'Which facts are strongest?',
      configuration: {
        mode: 'strength-analysis',
        sortBy: 'strength',
        filterBy: 'by-strength'
      },
      expectedOutcome: 'Opens Alpha Facts analysis showing claim strengths'
    },
    {
      userIntent: 'Show me timeline of events',
      configuration: {
        mode: 'timeline',
        sortBy: 'chronological'
      },
      expectedOutcome: 'Opens timeline visualization of factual events'
    },
    {
      userIntent: 'Link facts to evidence',
      configuration: {
        mode: 'evidence-linking'
      },
      expectedOutcome: 'Opens evidence linking interface'
    }
  ],
  
  // Metadata
  tags: ['facts', 'evidence', 'contradictions', 'analysis', 'claims'],
  category: 'analysis'
}
```

---

### **File 3: Registry Exports**

**File:** `packages/shared-types/src/registry/index.ts`

```typescript
import { ClerkDefinition, ClerkRegistry } from './clerk-definition.interface'
import { FACTS_CLERK } from './clerks/facts-clerk.definition'

// Export types
export * from './clerk-definition.interface'

// Clerk Registry
export const CLERK_REGISTRY: ClerkRegistry = {
  'facts-clerk': FACTS_CLERK,
  // Others will be added during Runbook 8:
  // 'exhibits-clerk': EXHIBITS_CLERK,
  // 'discovery-clerk': DISCOVERY_CLERK,
  // 'caseblock-clerk': CASEBLOCK_CLERK,
  // 'signature-clerk': SIGNATURE_CLERK,
  // 'editor-clerk': EDITOR_CLERK,
  // 'communication-clerk': COMMUNICATION_CLERK,
  // 'analysis-clerk': ANALYSIS_CLERK,
}

/**
 * Get all clerk capabilities as readable string
 * Used for LLM system prompt generation
 */
export function getClerkCapabilities(): string {
  const capabilities = Object.values(CLERK_REGISTRY).map(clerk => {
    return `## ${clerk.name} (${clerk.id})
${clerk.description}

**Capabilities:**
${clerk.capabilities.map(c => `- ${c}`).join('\n')}

**UI Modes:**
${Object.entries(clerk.uiModes).map(([mode, config]) => 
  `- ${mode}: ${config.description}`
).join('\n')}
`
  })
  
  return capabilities.join('\n\n')
}

/**
 * Get clerk by matching user intent to examples
 */
export function findClerkByIntent(intent: string): ClerkDefinition | null {
  const normalizedIntent = intent.toLowerCase()
  
  for (const clerk of Object.values(CLERK_REGISTRY)) {
    for (const example of clerk.examples) {
      const normalizedExample = example.userIntent.toLowerCase()
      
      // Simple similarity check - can be enhanced with fuzzy matching
      if (normalizedIntent.includes(normalizedExample) || 
          normalizedExample.includes(normalizedIntent)) {
        return clerk
      }
    }
  }
  
  return null
}

/**
 * Get comprehensive privacy report
 * Used when user asks "what data are you accessing?"
 */
export interface PrivacyReport {
  localProcessing: Array<{
    clerk: string
    description: string
    dataAccessed: string[]
    dataStored: string[]
  }>
  externalAPIs: Array<{
    clerk: string
    apis: string[]
    purpose: string
  }>
}

export function getPrivacyReport(): PrivacyReport {
  const report: PrivacyReport = {
    localProcessing: [],
    externalAPIs: []
  }
  
  for (const clerk of Object.values(CLERK_REGISTRY)) {
    if (clerk.privacy.externalAPIs.length === 0 || 
        (clerk.privacy.externalAPIs.length === 1 && 
         clerk.privacy.externalAPIs[0].toLowerCase().includes('none'))) {
      // Local processing only
      report.localProcessing.push({
        clerk: clerk.name,
        description: clerk.description,
        dataAccessed: clerk.privacy.dataAccessed,
        dataStored: clerk.privacy.dataStored
      })
    } else {
      // Uses external APIs
      report.externalAPIs.push({
        clerk: clerk.name,
        apis: clerk.privacy.externalAPIs,
        purpose: clerk.description
      })
    }
  }
  
  return report
}

/**
 * Get clerk by ID
 */
export function getClerkById(id: string): ClerkDefinition | null {
  return CLERK_REGISTRY[id] || null
}

/**
 * Get all clerk IDs
 */
export function getAllClerkIds(): string[] {
  return Object.keys(CLERK_REGISTRY)
}
```

---

## TASK 5: Create package.json

**File:** `packages/shared-types/package.json`

```json
{
  "name": "@factsway/shared-types",
  "version": "1.0.0",
  "description": "Shared TypeScript types and Feature Registry for FACTSWAY platform",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
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
  },
  "files": [
    "dist",
    "schemas",
    "python"
  ]
}
```

---

## TASK 6: Create TypeScript Config

**File:** `packages/shared-types/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "python"
  ]
}
```

---

## TASK 7: Test Generation

After creating all files, run:

```bash
cd packages/shared-types

# Make scripts executable
chmod +x scripts/*.sh

# Generate types
./scripts/generate-all.sh

# Verify TypeScript compiles
npm install
npm run build

# Verify Python is valid
python3 -c "from python.legal_document import LegalDocument; print('✓ Python import successful')"
```

---

## TASK 8: Create README

**File:** `packages/shared-types/README.md`

```markdown
# @factsway/shared-types

Shared TypeScript types, Python models, and Feature Registry for FACTSWAY platform.

## Single Source of Truth

All types are generated from JSON Schema:

- **Source:** `schemas/legal-document.schema.json`
- **TypeScript:** Generated via quicktype
- **Python:** Generated via datamodel-code-generator

This ensures TypeScript and Python types CANNOT drift.

## Feature Registry

Documents all 8 clerk components:
- Capabilities (what they can do)
- Inputs/Outputs (data contract)
- Privacy (what data is accessed)
- UI Modes (how to display)
- Examples (for LLM training)

Used for:
1. LLM workspace configuration
2. User documentation
3. Privacy transparency
4. Testing framework
5. Future API specification

## Usage

### Generate Types

```bash
# Generate both TypeScript and Python
npm run generate:all

# Or individually
npm run generate:types    # TypeScript only
npm run generate:python   # Python only
```

### Import in TypeScript

```typescript
import { LegalDocument, DocumentMeta } from '@factsway/shared-types'
import { CLERK_REGISTRY, getClerkCapabilities } from '@factsway/shared-types/registry'
```

### Import in Python

```python
from legal_document import LegalDocument, DocumentMeta
```

## Updating Schema

1. Edit `schemas/legal-document.schema.json`
2. Run `npm run generate:all`
3. Both TypeScript and Python types update automatically

## Adding New Clerk

See `src/registry/clerks/facts-clerk.definition.ts` as template.

1. Create new file: `src/registry/clerks/YOUR-CLERK.definition.ts`
2. Follow FactsClerk pattern
3. Add to registry in `src/registry/index.ts`
4. Document during Runbook 8 as you build the clerk component
```

---

## SUCCESS CRITERIA

After completing all tasks, verify:

- [ ] Directory structure created correctly
- [ ] JSON Schema is valid and comprehensive
- [ ] Generation scripts work (TypeScript + Python)
- [ ] ClerkDefinition interface created
- [ ] Facts Clerk definition complete (serves as template)
- [ ] Registry exports work correctly
- [ ] package.json and tsconfig.json created
- [ ] TypeScript compiles without errors
- [ ] Python imports without errors
- [ ] README documents the system

---

## DELIVERABLES

You should have created:

1. Complete JSON Schema system
2. Feature Registry infrastructure
3. Facts Clerk definition (template for 7 others)
4. Helper functions (getClerkCapabilities, getPrivacyReport, etc.)
5. Documentation (README)

**Time:** 5-6 hours

**Next:** NUPunkt and Pandoc verification (separate prompt)
