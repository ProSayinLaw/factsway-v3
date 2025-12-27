# CLERKGUARD CONTRACT - Microservices Integration Guide

**Version:** 1.0
**Date:** December 27, 2024
**Status:** Production Architecture
**Applies To:** All FACTSWAY microservices (Records, Ingestion, Export, CaseBlock, Signature, Facts, Exhibits, CaseLaw)

---

## Executive Summary

**ClerkGuard** is FACTSWAY's production-ready security validation layer that enforces architectural contracts at every API boundary. All microservices MUST integrate with ClerkGuard to maintain system security, data integrity, and service isolation.

**This is NOT optional.** ClerkGuard is existing production infrastructure (206 lines, fully implemented) that new microservices must respect.

---

## Table of Contents

1. [What is ClerkGuard?](#what-is-clerkguard)
2. [The 5 Core Validations](#the-5-core-validations)
3. [Deployment Models](#deployment-models)
4. [Integration Requirements](#integration-requirements)
5. [Channel Naming & Allowlists](#channel-naming--allowlists)
6. [ULID Requirements](#ulid-requirements)
7. [Path Hierarchy Rules](#path-hierarchy-rules)
8. [ClerkGuard Configuration](#clerkguard-configuration)
9. [Code Examples](#code-examples)
10. [Common Mistakes](#common-mistakes)
11. [Testing & Validation](#testing--validation)
12. [Compliance Checklist](#compliance-checklist)

---

## What is ClerkGuard?

### Purpose

ClerkGuard is a **security validation layer** that sits between the API gateway and service handlers. It enforces architectural contracts before ANY handler executes.

**Location in Request Flow:**
```
HTTP/IPC Request
    ↓
API Gateway / IPC Bridge
    ↓
Zod Schema Validation (payload shape)
    ↓
🔒 CLERKGUARD.ENFORCE() 🔒  ← SECURITY LAYER
    ↓
    ├─ ✅ PASS → Handler executes
    └─ ❌ FAIL → Audit log + Error thrown
```

### The Problem ClerkGuard Solves

**Without ClerkGuard:**
- Services could call each other directly (bypass orchestrator)
- Malicious UI could invoke arbitrary backend functions
- Resource IDs could be spoofed or manipulated
- Path traversal attacks possible
- No audit trail of validation failures

**With ClerkGuard:**
- ✅ Only registered channels callable (attack surface reduction)
- ✅ Service isolation enforced (orchestrator mediation required)
- ✅ Resource IDs validated (ULID format required)
- ✅ Path traversal prevented (case/ prefix enforced)
- ✅ Audit trail of all violations (security monitoring)

### Key Characteristics

- **Production-Ready:** Fully implemented, actively used in current backend
- **Language-Agnostic:** Shared library (TypeScript/JavaScript), works across services
- **Deployment-Adaptive:** Strict or passthrough mode per environment
- **Zero-Trust:** Validates every request, no exceptions
- **Fail-Safe:** Violations logged and blocked, no silent failures

---

## The 5 Core Validations

ClerkGuard performs these validations **in sequence** before allowing any handler to execute:

### 1. Channel Allowlist Check

**Rule:** Only explicitly registered channels can be invoked.

**Validation:**
```typescript
if (!isChannelAllowlisted(channel)) {
  throw ClerkGuardError('CHANNEL_NOT_ALLOWLISTED');
}
```

**Example:**
```typescript
// ✅ PASS - Channel registered
invokeChannel('facts:create', payload);

// ❌ FAIL - Channel not in allowlist
invokeChannel('facts:secret-admin-backdoor', payload);
// Error: Channel "facts:secret-admin-backdoor" is not in the IPC allowlist
```

**Why It Matters:** Prevents UI from invoking arbitrary backend functions. Only 237 channels currently registered - attacker cannot add new ones at runtime.

---

### 2. Case Scope Enforcement

**Rule:** Operations marked `caseScope: 'required'` MUST have a `caseId`.

**Validation:**
```typescript
if (policy.caseScope === 'required') {
  const caseId = extractCaseId(payload);
  if (!caseId) {
    throw ClerkGuardError('CASE_SCOPE_REQUIRED');
  }
}
```

**Example:**
```typescript
// ✅ PASS - caseId provided
invokeChannel('facts:create', {
  caseId: '01ARZ3NDEK...',
  factText: 'Defendant breached contract'
});

// ❌ FAIL - caseId missing
invokeChannel('facts:create', {
  factText: 'Defendant breached contract'
});
// Error: FactsClerk requires case_id for channel "facts:create"
```

**Why It Matters:** Enforces case isolation (multi-tenancy). Prevents cross-case data access.

---

### 3. Canonical ID Validation (ULID Format)

**Rule:** All resource identifiers MUST be ULIDs.

**Validation:**
```typescript
if (policy.composite.canonicalId) {
  if (!canonicalId) {
    throw ClerkGuardError('CANONICAL_ID_REQUIRED');
  }
  if (!isULID(canonicalId)) {
    throw ClerkGuardError('CANONICAL_ID_INVALID');
  }
}
```

**Example:**
```typescript
// ✅ PASS - Valid ULID
invokeChannel('facts:get', {
  factId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',  // 26 characters, Crockford's Base32
  pathId: 'case/.../facts/...'
});

// ❌ FAIL - UUID not allowed
invokeChannel('facts:get', {
  factId: '550e8400-e29b-41d4-a716-446655440000',  // UUID format
  pathId: 'case/.../facts/...'
});
// Error: canonical_id must be ULID for FactsClerk channel "facts:get"

// ❌ FAIL - Arbitrary string not allowed
invokeChannel('facts:get', {
  factId: 'my-fact-123',
  pathId: 'case/.../facts/...'
});
// Error: canonical_id must be ULID for FactsClerk channel "facts:get"
```

**Why It Matters:** Prevents ID spoofing. ULIDs are sortable by creation time and have built-in uniqueness guarantees.

---

### 4. Path Hierarchy Enforcement

**Rule:** All resource paths MUST start with `case/`.

**Validation:**
```typescript
if (!pathId.startsWith('case/')) {
  throw ClerkGuardError('PATH_ID_INVALID');
}
```

**Example:**
```typescript
// ✅ PASS - Path starts with "case/"
invokeChannel('facts:create', {
  caseId: '01ARZ3NDEK...',
  pathId: 'case/01ARZ3NDEK/facts'
});

// ❌ FAIL - Path doesn't start with "case/"
invokeChannel('facts:create', {
  caseId: '01ARZ3NDEK...',
  pathId: 'facts/01ARZ3NDEK'
});
// Error: path_id must start with case/ for FactsClerk channel "facts:create"

// ❌ FAIL - Path traversal attempt
invokeChannel('facts:create', {
  caseId: '01ARZ3NDEK...',
  pathId: '../../../etc/passwd'
});
// Error: path_id must start with case/ for FactsClerk channel "facts:create"
```

**Why It Matters:** Prevents path traversal attacks. Enforces hierarchical resource structure.

---

### 5. Display ID Lookup Prevention

**Rule:** Cannot lookup resources using only `displayId` (human-readable name).

**Validation:**
```typescript
if (!canonicalId && displayId) {
  throw ClerkGuardError('DISPLAY_ID_LOOKUP_FORBIDDEN');
}
```

**Example:**
```typescript
// ✅ PASS - Canonical ID provided, display ID optional
invokeChannel('facts:get', {
  factId: '01ARZ3NDEK...',
  pathId: 'case/.../facts/...',
  displayId: 'Fact #42'  // For display only
});

// ❌ FAIL - Lookup by display ID alone
invokeChannel('facts:get', {
  displayId: 'Fact #42'  // No canonical ID
});
// Error: FactsClerk cannot use display_id for lookups on channel "facts:get"
```

**Why It Matters:** Prevents enumeration attacks. Attacker cannot brute-force human-readable names to discover resources.

---

## Deployment Models

ClerkGuard adapts to deployment environment for optimal security/performance balance.

### Desktop Deployment

**Environment:** All services on localhost, same machine, same user
**Threat Model:** Local attacker trying to bypass UI restrictions
**Security Need:** Moderate (single validation sufficient)

**Configuration:**
```
Renderer → IPC Bridge → 🔒 ClerkGuard (strict)
                            ↓
                      Orchestrator
                            ↓
                      Services (passthrough mode)
```

**ClerkGuard Mode:**
- IPC Bridge: `strict` - Full validation
- Services: `passthrough` - Trust orchestrator

**Rationale:** Services in same process space, orchestrator already validated request

**Performance:** ~0.3ms overhead (single validation)

---

### Cloud Deployment

**Environment:** Services on network, external attackers, untrusted network
**Threat Model:** Network attacker compromising gateway OR service-to-service traffic
**Security Need:** High (defense in depth required)

**Configuration:**
```
Client → API Gateway → 🔒 ClerkGuard (strict)
              ↓
         Network (untrusted)
              ↓
         Services → 🔒 ClerkGuard (strict)
```

**ClerkGuard Mode:**
- API Gateway: `strict` - First wall
- Services: `strict` - Second wall (defense in depth)

**Rationale:** Network is untrusted, compromised gateway could send malicious requests

**Performance:** ~1-2ms overhead (vs 10-50ms network latency = negligible)

---

### Enterprise Deployment

**Environment:** On-premises Kubernetes, customer-controlled network
**Threat Model:** Varies (customer decides trust level)
**Security Need:** Configurable

**Configuration:** Customer chooses based on network trust:
- Trusted network (VPN, isolated): `passthrough` in services
- Untrusted network (multi-tenant): `strict` in services

---

## Integration Requirements

Every microservice MUST implement these components:

### 1. Service Allowlist

**File:** `src/allowlist.ts`

**Purpose:** Define channels this service exposes

**Example:**
```typescript
// services/facts-service/src/allowlist.ts

export const FACTS_SERVICE_ALLOWLIST = [
  'facts:create',
  'facts:get',
  'facts:list',
  'facts:update',
  'facts:delete',
  'facts:link-evidence',
] as const;

export type FactsChannel = typeof FACTS_SERVICE_ALLOWLIST[number];
```

**Rules:**
- Channel names: `{service}:{operation}` format
- Operation verbs: create, get, list, update, delete, link, etc.
- Alphabetical order (maintainability)
- Export as const (type safety)

---

### 2. ClerkGuard Configuration

**File:** `src/clerkguard-config.ts`

**Purpose:** Define validation rules per channel

**Example:**
```typescript
// services/facts-service/src/clerkguard-config.ts

import { ClerkGuardChannelConfig } from '@factsway/clerkguard';

const FACTS_CLERK: ClerkGuardChannelConfig = {
  clerk: 'FactsClerk',
  caseScope: 'required',  // All facts operations require case context
  operation: 'read',       // Default operation type
};

export const CLERKGUARD_CONFIGS: Record<FactsChannel, ClerkGuardChannelConfig> = {
  'facts:create': {
    ...FACTS_CLERK,
    operation: 'write',
    composite: {
      pathId: ['pathId'],  // Required
    }
  },

  'facts:get': {
    ...FACTS_CLERK,
    operation: 'read',
    composite: {
      canonicalId: ['factId'],  // Must be ULID
      pathId: ['pathId'],        // Must start with "case/"
      displayId: ['displayId'],  // Optional
    }
  },

  'facts:list': {
    ...FACTS_CLERK,
    operation: 'read',
    composite: {
      pathId: ['pathId'],
    }
  },

  // ... other channels
};
```

**Configuration Options:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `clerk` | ClerkIdentifier | ✅ | Service identifier (e.g., 'FactsClerk') |
| `caseScope` | 'required' \| 'optional' | ✅ | Does operation require caseId? |
| `operation` | 'read' \| 'write' \| 'export' \| 'noop' | ✅ | Operation type (for audit logs) |
| `composite` | CompositeConfig | ⚠️ | Resource ID validation (if operation uses resources) |

**Composite Configuration:**

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `canonicalId` | string[] | Canonical ID field names (ULID validated) | `['factId', 'templateId']` |
| `pathId` | string[] | Path ID field names (must start with "case/") | `['pathId']` |
| `displayId` | string[] | Display ID field names (optional, cannot lookup alone) | `['displayId', 'factNumber']` |

---

### 3. Middleware Integration

**File:** `src/server.ts` (Express) or `src/main.ts` (Fastify)

**Purpose:** Apply ClerkGuard validation to all routes

**Example (Express):**
```typescript
// services/facts-service/src/server.ts

import express from 'express';
import { ClerkGuard } from '@factsway/clerkguard';
import { FACTS_SERVICE_ALLOWLIST } from './allowlist';
import { CLERKGUARD_CONFIGS } from './clerkguard-config';

const app = express();

// Configure ClerkGuard based on deployment
ClerkGuard.configure({
  mode: process.env.CLERKGUARD_MODE || 'strict',
  allowlist: FACTS_SERVICE_ALLOWLIST,
});

// ClerkGuard middleware
app.use((req, res, next) => {
  try {
    // Convert route to channel name
    const channel = routeToChannel(req.path, req.method);

    // Get config for this channel
    const config = CLERKGUARD_CONFIGS[channel];

    // Enforce validation
    ClerkGuard.enforce(channel, req.body, config);

    // Validation passed
    next();
  } catch (error) {
    if (error instanceof ClerkGuardError) {
      res.status(403).json({
        error: 'Forbidden',
        reason: error.reason,
        code: error.code,
      });
    } else {
      next(error);
    }
  }
});

// Route handlers
app.post('/api/facts', createFactHandler);
app.get('/api/facts/:factId', getFactHandler);
// ...

function routeToChannel(path: string, method: string): FactsChannel {
  // /api/facts + POST → facts:create
  // /api/facts/:factId + GET → facts:get
  // Implementation specific to your routing
}
```

---

### 4. Audit Logging

**Purpose:** Log ClerkGuard violations for security monitoring

**Example:**
```typescript
// services/facts-service/src/audit.ts

import { ClerkGuard, ClerkGuardAuditEntry } from '@factsway/clerkguard';

function logClerkGuardViolation(entry: ClerkGuardAuditEntry): void {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    service: 'facts-service',
    level: 'SECURITY_VIOLATION',
    channel: entry.channel,
    clerk: entry.clerk,
    operation: entry.operation,
    reason: entry.reason,
    payloadSample: entry.payloadSample,  // First 5 keys only
  }));
}

// Set audit logger
ClerkGuard.setAuditLogger(logClerkGuardViolation);
```

**In Production:**
- Desktop: Logs to local file
- Cloud: Logs to stdout → Kubernetes aggregates → Elasticsearch/CloudWatch

---

## Channel Naming & Allowlists

### Naming Convention

**Format:** `{service}:{operation}`

**Examples:**
- `facts:create`
- `facts:get`
- `facts:list`
- `facts:update`
- `facts:delete`
- `exhibits:link`
- `caseblock:upload`

**Rules:**
- Lowercase only
- Kebab-case for multi-word operations: `case-law:validate-citation`
- Verb-noun preferred: `facts:create` (not `create-fact`)
- Consistent verbs across services: create, get, list, update, delete

### Common Operations

| Operation | CRUD | Description |
|-----------|------|-------------|
| `create` | C | Create new resource |
| `get` | R | Retrieve single resource by ID |
| `list` | R | Retrieve multiple resources (filtered) |
| `update` | U | Modify existing resource |
| `delete` | D | Remove resource |
| `upload` | C | Upload file/document |
| `download` | R | Retrieve file/document |
| `link` | U | Create relationship between resources |
| `unlink` | U | Remove relationship |
| `validate` | R | Validate data without persisting |
| `export` | R | Generate file/report |

### Distributed Allowlists

**Each service owns its channels:**

```typescript
// facts-service/src/allowlist.ts
export const FACTS_ALLOWLIST = ['facts:create', 'facts:get', ...];

// exhibits-service/src/allowlist.ts
export const EXHIBITS_ALLOWLIST = ['exhibits:create', 'exhibits:link', ...];
```

**API Gateway aggregates at startup:**

```typescript
// api-gateway/src/allowlist-aggregator.ts

async function aggregateAllowlists(): Promise<string[]> {
  const services = ['facts-service', 'exhibits-service', ...];

  const allowlists = await Promise.all(
    services.map(svc => fetchAllowlist(svc))
  );

  return [...new Set(allowlists.flat())].sort();
}

// Called at gateway startup
const GLOBAL_ALLOWLIST = await aggregateAllowlists();
```

---

## ULID Requirements

### What is ULID?

**ULID:** Universally Unique Lexicographically Sortable Identifier

**Format:** 26 characters, Crockford's Base32
**Example:** `01ARZ3NDEKTSV4RRFFQ69G5FAV`

**Properties:**
- **Unique:** 128-bit random (collision-resistant)
- **Sortable:** Timestamp prefix (sortable by creation time)
- **Case-insensitive:** Crockford's Base32 (0-9, A-Z, excluding I, L, O, U)
- **URL-safe:** No special characters

### Why ULID (Not UUID)?

| Property | ULID | UUID v4 |
|----------|------|---------|
| Sortable by time | ✅ Yes | ❌ No |
| Length | 26 chars | 36 chars (with hyphens) |
| Case | Case-insensitive | Case-sensitive |
| URL-safe | ✅ Yes | ⚠️ Hyphens |
| Database index | More efficient | Less efficient |

### Generating ULIDs

**TypeScript/JavaScript:**
```typescript
import { ulid } from 'ulid';

const factId = ulid();
// "01ARZ3NDEKTSV4RRFFQ69G5FAV"
```

**Python:**
```python
from ulid import ULID

fact_id = str(ULID())
# "01ARZ3NDEKTSV4RRFFQ69G5FAV"
```

### Validating ULIDs

**TypeScript:**
```typescript
import { isULID } from '@factsway/shared/ids';

if (!isULID(factId)) {
  throw new Error('Invalid ULID format');
}
```

**Regex Pattern:**
```regex
^[0-9A-HJKMNP-TV-Z]{26}$
```

### When to Use ULID

✅ **Always use ULID for:**
- Resource IDs (factId, exhibitId, templateId, etc.)
- Case IDs
- Document IDs
- User IDs
- Any canonical identifier

❌ **Never use:**
- UUID v4 (not sortable)
- Auto-increment integers (reveals record count)
- Arbitrary strings (no format validation)
- Timestamps alone (collision risk)

---

## Path Hierarchy Rules

### Structure

**Format:** `case/{caseId}/{resource-type}/{resourceId?}`

**Examples:**
```
case/01ARZ3NDEK/facts
case/01ARZ3NDEK/facts/01BRZ4OEFK
case/01ARZ3NDEK/templates/01CRZ5PGML
case/01ARZ3NDEK/docs/pleading.pdf
case/01ARZ3NDEK/exhibits
```

### Helper Function

**All services MUST use `buildPathId()` helper:**

```typescript
import { buildPathId } from '@factsway/shared/ids';

// Create path for facts collection
const pathId = buildPathId(caseId, 'facts');
// Result: "case/01ARZ3NDEK/facts"

// Create path for specific fact
const pathId = buildPathId(caseId, 'facts', factId);
// Result: "case/01ARZ3NDEK/facts/01BRZ4OEFK"

// Create path for template
const pathId = buildPathId(caseId, 'templates', templateId);
// Result: "case/01ARZ3NDEK/templates/01CRZ5PGML"
```

### Validation

**Services SHOULD validate path matches expected structure:**

```typescript
function ensurePathMatch(actualPath: string, expectedPath: string): void {
  if (actualPath !== expectedPath) {
    throw new Error(
      `Path mismatch. Expected: ${expectedPath}, Received: ${actualPath}`
    );
  }
}

// Usage
const expectedPath = buildPathId(caseId, 'facts', factId);
ensurePathMatch(payload.pathId, expectedPath);
```

### Resource Types

**Standard resource types:**

| Type | Description | Example Path |
|------|-------------|--------------|
| `facts` | Claims/facts | `case/{caseId}/facts` |
| `exhibits` | Exhibit objects | `case/{caseId}/exhibits` |
| `templates` | Templates (caseblock, signature) | `case/{caseId}/templates/{templateId}` |
| `docs` | Vault documents | `case/{caseId}/docs/{filename}` |
| `documents` | Alternative vault path | `case/{caseId}/documents/{docId}` |
| `citations` | Case law citations | `case/{caseId}/citations` |
| `drafts` | Motion drafts | `case/{caseId}/drafts/{draftId}` |

---

## ClerkGuard Configuration

### Configuration Modes

**Two modes:**

| Mode | When | Validates |
|------|------|-----------|
| `strict` | Production, untrusted network | All 5 validations |
| `passthrough` | Trusted environment, already validated | None (trust caller) |

### Environment Variable

```bash
# .env
CLERKGUARD_MODE=strict  # or passthrough
```

### Code Configuration

```typescript
import { ClerkGuard } from '@factsway/clerkguard';

ClerkGuard.configure({
  mode: process.env.CLERKGUARD_MODE || 'strict',
  allowlist: SERVICE_ALLOWLIST,  // Service-specific
});
```

### Deployment-Specific Configuration

**Desktop (orchestrator spawns services):**
```typescript
// Orchestrator configures itself as strict
ClerkGuard.configure({ mode: 'strict' });

// Spawns services with passthrough
spawnService('facts-service', {
  env: {
    CLERKGUARD_MODE: 'passthrough',
    SERVICE_URL: 'http://localhost:3006',
  }
});
```

**Cloud (Kubernetes):**
```yaml
# ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: clerkguard-config
data:
  CLERKGUARD_MODE: "strict"

# Gateway deployment
env:
- name: CLERKGUARD_MODE
  valueFrom:
    configMapKeyRef:
      name: clerkguard-config
      key: CLERKGUARD_MODE

# Service deployments (same config)
env:
- name: CLERKGUARD_MODE
  valueFrom:
    configMapKeyRef:
      name: clerkguard-config
      key: CLERKGUARD_MODE
```

---

## Code Examples

### Complete Service Integration

```typescript
// services/facts-service/src/index.ts

import express from 'express';
import { ClerkGuard, ClerkGuardError } from '@factsway/clerkguard';
import { ulid, isULID, buildPathId } from '@factsway/shared/ids';
import { FACTS_SERVICE_ALLOWLIST } from './allowlist';
import { CLERKGUARD_CONFIGS } from './clerkguard-config';

const app = express();
app.use(express.json());

// Configure ClerkGuard
ClerkGuard.configure({
  mode: process.env.CLERKGUARD_MODE || 'strict',
  allowlist: FACTS_SERVICE_ALLOWLIST,
});

ClerkGuard.setAuditLogger((entry) => {
  console.error('ClerkGuard violation:', entry);
});

// Middleware
app.use((req, res, next) => {
  try {
    const channel = routeToChannel(req);
    const config = CLERKGUARD_CONFIGS[channel];

    ClerkGuard.enforce(channel, req.body, config);
    next();
  } catch (error) {
    if (error instanceof ClerkGuardError) {
      res.status(403).json({ error: error.message, code: error.code });
    } else {
      next(error);
    }
  }
});

// Routes
app.post('/api/facts', async (req, res) => {
  const { caseId, factText } = req.body;

  // Generate ULID
  const factId = ulid();

  // Build path
  const pathId = buildPathId(caseId, 'facts', factId);

  // Store fact
  await db.facts.insert({ factId, caseId, pathId, factText });

  res.json({ factId, pathId });
});

app.get('/api/facts/:factId', async (req, res) => {
  const { factId } = req.params;
  const { caseId, pathId } = req.query;

  // Validate path
  const expectedPath = buildPathId(caseId, 'facts', factId);
  if (pathId !== expectedPath) {
    return res.status(400).json({ error: 'Path mismatch' });
  }

  // Retrieve fact
  const fact = await db.facts.findOne({ factId, caseId });

  if (!fact) {
    return res.status(404).json({ error: 'Fact not found' });
  }

  res.json(fact);
});

app.listen(3006, () => {
  console.log('Facts service listening on port 3006');
  console.log(`ClerkGuard mode: ${process.env.CLERKGUARD_MODE || 'strict'}`);
});
```

---

## Common Mistakes

### ❌ Mistake 1: Using UUID Instead of ULID

```typescript
// ❌ WRONG
import { v4 as uuid } from 'uuid';
const factId = uuid();  // UUID not allowed

// ✅ CORRECT
import { ulid } from 'ulid';
const factId = ulid();  // ULID required
```

### ❌ Mistake 2: Building Paths Manually

```typescript
// ❌ WRONG
const pathId = `case/${caseId}/facts/${factId}`;  // Manual construction

// ✅ CORRECT
import { buildPathId } from '@factsway/shared/ids';
const pathId = buildPathId(caseId, 'facts', factId);  // Helper function
```

### ❌ Mistake 3: Lookup by Display ID Alone

```typescript
// ❌ WRONG
invokeChannel('facts:get', {
  displayId: 'Fact #42'  // No canonical ID
});

// ✅ CORRECT
invokeChannel('facts:get', {
  factId: '01ARZ3NDEK...',  // Canonical ULID
  pathId: 'case/.../facts/...',
  displayId: 'Fact #42'  // Optional, for display
});
```

### ❌ Mistake 4: Direct Service-to-Service Calls

```typescript
// ❌ WRONG - Service calling another service directly
async function createFact(factData) {
  // Don't call Exhibits Service directly
  const exhibits = await fetch('http://exhibits-service:3007/api/exhibits');
}

// ✅ CORRECT - Call through Orchestrator
async function createFact(factData) {
  // Orchestrator will call Exhibits Service
  return factData;  // Let orchestrator coordinate
}
```

### ❌ Mistake 5: Forgetting caseScope

```typescript
// ❌ WRONG - Global operation should have caseScope: 'optional'
'facts:create': {
  clerk: 'FactsClerk',
  caseScope: 'required',  // But no caseId in payload!
  operation: 'write',
}

// ✅ CORRECT
'facts:create': {
  clerk: 'FactsClerk',
  caseScope: 'required',  // Requires caseId in payload
  operation: 'write',
  composite: {
    pathId: ['pathId'],  // Path must include caseId
  }
}
```

---

## Testing & Validation

### Unit Tests

**Test ClerkGuard validation:**

```typescript
// facts-service/tests/clerkguard.test.ts

import { ClerkGuard } from '@factsway/clerkguard';
import { CLERKGUARD_CONFIGS } from '../src/clerkguard-config';

describe('ClerkGuard Validation', () => {
  beforeAll(() => {
    ClerkGuard.configure({ mode: 'strict' });
  });

  test('rejects invalid ULID', () => {
    const payload = {
      factId: '550e8400-e29b-41d4-a716-446655440000',  // UUID
      caseId: '01ARZ3NDEK...',
      pathId: 'case/01ARZ3NDEK/facts/...',
    };

    expect(() => {
      ClerkGuard.enforce('facts:get', payload, CLERKGUARD_CONFIGS['facts:get']);
    }).toThrow('CANONICAL_ID_INVALID');
  });

  test('rejects path without case/ prefix', () => {
    const payload = {
      factId: '01ARZ3NDEK...',
      caseId: '01ARZ3NDEK...',
      pathId: 'facts/01ARZ3NDEK',  // Missing "case/" prefix
    };

    expect(() => {
      ClerkGuard.enforce('facts:get', payload, CLERKGUARD_CONFIGS['facts:get']);
    }).toThrow('PATH_ID_INVALID');
  });

  test('rejects display ID lookup', () => {
    const payload = {
      displayId: 'Fact #42',  // No canonical ID
      caseId: '01ARZ3NDEK...',
      pathId: 'case/01ARZ3NDEK/facts',
    };

    expect(() => {
      ClerkGuard.enforce('facts:get', payload, CLERKGUARD_CONFIGS['facts:get']);
    }).toThrow('DISPLAY_ID_LOOKUP_FORBIDDEN');
  });

  test('allows valid request', () => {
    const payload = {
      factId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      caseId: '01BRZ4OEFKUTSW5SSGGR7H6GBW',
      pathId: 'case/01BRZ4OEFKUTSW5SSGGR7H6GBW/facts/01ARZ3NDEKTSV4RRFFQ69G5FAV',
      displayId: 'Fact #42',
    };

    expect(() => {
      ClerkGuard.enforce('facts:get', payload, CLERKGUARD_CONFIGS['facts:get']);
    }).not.toThrow();
  });
});
```

### Integration Tests

**Test end-to-end with ClerkGuard:**

```typescript
// facts-service/tests/integration.test.ts

import request from 'supertest';
import { app } from '../src/server';

describe('Facts Service Integration', () => {
  test('POST /api/facts - valid request', async () => {
    const response = await request(app)
      .post('/api/facts')
      .send({
        caseId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        pathId: 'case/01ARZ3NDEKTSV4RRFFQ69G5FAV/facts',
        factText: 'Defendant breached contract',
      });

    expect(response.status).toBe(200);
    expect(response.body.factId).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
  });

  test('POST /api/facts - missing caseId', async () => {
    const response = await request(app)
      .post('/api/facts')
      .send({
        pathId: 'case/01ARZ3NDEKTSV4RRFFQ69G5FAV/facts',
        factText: 'Defendant breached contract',
      });

    expect(response.status).toBe(403);
    expect(response.body.code).toBe('CASE_SCOPE_REQUIRED');
  });
});
```

---

## Compliance Checklist

Before deploying a microservice, verify ClerkGuard compliance:

### Pre-Deployment Checklist

- [ ] **Allowlist created** - Service-specific allowlist defined
- [ ] **Channels follow naming convention** - `{service}:{operation}` format
- [ ] **ClerkGuard configs defined** - One config per channel
- [ ] **ULID generation** - All resource IDs use `ulid()` library
- [ ] **ULID validation** - Validate ULIDs before database operations
- [ ] **Path builder used** - Use `buildPathId()` for all paths
- [ ] **Path validation** - Verify paths match expected structure
- [ ] **Case scope marked** - All configs have `caseScope: 'required' | 'optional'`
- [ ] **Operation types set** - All configs have operation: `read` | `write` | `export` | `noop`
- [ ] **Middleware integrated** - ClerkGuard middleware applied to all routes
- [ ] **Audit logging configured** - Violations logged for monitoring
- [ ] **Deployment mode configured** - `CLERKGUARD_MODE` environment variable set
- [ ] **Unit tests written** - ClerkGuard validation tested
- [ ] **Integration tests pass** - End-to-end with ClerkGuard
- [ ] **No direct service calls** - All coordination through Orchestrator

### Post-Deployment Validation

- [ ] **Allowlist aggregated** - Gateway recognizes service channels
- [ ] **Violations logged** - Audit log receives ClerkGuard violations
- [ ] **Performance acceptable** - ClerkGuard overhead <2ms
- [ ] **No false positives** - Valid requests not blocked
- [ ] **Security working** - Invalid requests blocked

---

## Summary

**ClerkGuard is production infrastructure that:**
- ✅ Enforces architectural contracts at every API boundary
- ✅ Validates channel allowlist, case scope, ULIDs, paths, display IDs
- ✅ Adapts to deployment (strict vs passthrough)
- ✅ Logs security violations for monitoring
- ✅ Prevents path traversal, ID spoofing, enumeration attacks

**All microservices MUST:**
- Define service-specific allowlist
- Configure ClerkGuard per channel
- Use ULID for all canonical IDs
- Use `buildPathId()` for all resource paths
- Integrate ClerkGuard middleware
- Never call other services directly (orchestrator mediates)

**This is NOT optional.** ClerkGuard is the security foundation that enables:
- Safe multi-tenancy (case isolation)
- Defense in depth (cloud deployment)
- Audit compliance (violation logging)
- Service isolation (orchestrator mediation)

**Questions?** Refer to ClerkGuard implementation at `src/main/security/clerkGuard.ts` or Session 19 investigation report.

---

**Version History:**
- v1.0 (2024-12-27): Initial production architecture contract
