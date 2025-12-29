# @factsway/shared-types

Shared TypeScript types, Python models, and Feature Registry for FACTSWAY platform.

## Single Source of Truth

All types are generated from JSON Schema:

- **Source:** [schemas/legal-document.schema.json](schemas/legal-document.schema.json)
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

See [src/registry/clerks/facts-clerk.definition.ts](src/registry/clerks/facts-clerk.definition.ts) as template.

1. Create new file: `src/registry/clerks/YOUR-CLERK.definition.ts`
2. Follow FactsClerk pattern
3. Add to registry in `src/registry/index.ts`
4. Document during Runbook 8 as you build the clerk component
