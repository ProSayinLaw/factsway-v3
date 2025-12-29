# ARCHITECTURAL DECISIONS SUMMARY

**Date:** December 27, 2024  
**Status:** FINALIZED  
**Next Action:** Execute 9-hour prep plan, then begin Phase 4

---

## DECISION 1: FRONTEND FRAMEWORK

### **Choice: Vue 3**

**Alternatives Considered:**
- React
- Vue 3 (chosen)

**Rationale:**

1. **Runbook 8 Complete:** 50+ pages already specified for Vue 3
2. **Time Savings:** 13-22 hours saved vs rewriting for React
3. **Better for Single Developer:** Less boilerplate, simpler mental model
4. **Perfect for LLM-Driven UI:** `<component :is>` built for dynamic component loading
5. **Official Tiptap Support:** `@tiptap/vue-3` package maintained

**Code Comparison (Same Feature):**
- Vue 3: 18 lines
- React: 35 lines
- Same functionality, Vue is more concise

**What We're Getting:**
- Template-based syntax (easier to read)
- Built-in reactivity (no manual dependency tracking)
- Pinia state management (simpler than Redux)
- Built-in transitions (no framer-motion needed)
- Faster development velocity

**What We're Giving Up:**
- Larger React ecosystem
- More developers know React (hiring consideration)
- Slightly more flexibility for extremely complex UIs

**Trade-Off Assessment:** For FACTSWAY's use case (legal document drafting, 8 clerk components, LLM-driven workspace composition), Vue 3's advantages far outweigh React's ecosystem benefits.

**Time Impact:**
- Vue 3: Execute Runbook 8 as planned (27-33 hours)
- React alternative: Rewrite + implement (40-55 hours)
- **Savings: 13-22 hours**

**Action Items:**
- [x] Decision finalized
- [ ] Update Runbook 0 Section 1.2 to say "Vue 3" (not "React")
- [ ] Proceed with Runbook 8 as specified

---

## DECISION 2: PYTHON SERVICE DISTRIBUTION

### **Choice: PyInstaller Per Service**

**Alternatives Considered:**
- PyInstaller per service (chosen)
- Single PyInstaller bundle
- Embedded Python runtime
- Require user Python installation (not viable)

**Rationale:**

1. **Architectural Alignment:** Matches microservices architecture perfectly
2. **True Isolation:** Each service is independent process (fault tolerance)
3. **Easy Debugging:** Can test services standalone
4. **Modular Updates:** Update one service without touching others
5. **Production Reliability:** One crash doesn't kill all services
6. **Proven Approach:** VS Code Python extension, many Electron apps use this

**Size Analysis:**
- Per service: ~50-100MB
- 7 Python services: ~400MB total (with UPX compression: ~350-400MB)
- Total app size: ~1GB (Electron + Pandoc + Python + assets)
- Competitive legal software: 600MB-1.5GB
- **Verdict: Acceptable for desktop legal software**

**What We're Getting:**
- True microservices isolation
- Individual service restart capability
- Independent testing/debugging
- Fault tolerance (one crash doesn't kill all)
- Modular update capability
- Clean architecture

**What We're Giving Up:**
- ~250MB disk space (vs single bundle)
- Some build complexity (7 configs vs 1)

**Trade-Off Assessment:** The 250MB disk space cost is trivial compared to architectural integrity, debugging ease, and production reliability. This is a textbook "one-shot" decision: invest in proper architecture now, prevent debugging nightmares later.

**Implementation Details:**
```bash
# Per service
cd services/ingestion-service
pyinstaller --onefile app/main.py
upx --best dist/main  # Compression
# Output: ~50-100MB standalone executable
```

**Desktop orchestrator spawns:**
```typescript
spawn('./services/ingestion-service/dist/main', {
  env: { PORT: '3002' }
})
```

**Action Items:**
- [x] Decision finalized
- [ ] Add detailed PyInstaller strategy to Runbook 10
- [ ] Document per-service build process
- [ ] Add UPX compression step
- [ ] Estimate: +3 hours to Runbook 10

---

## DECISION 3: SCHEMA SYNCHRONIZATION

### **Choice: JSON Schema as Single Source of Truth**

**Alternatives Considered:**
- Manual sync (unacceptable - will drift)
- TypeScript as source, generate Python
- Python as source, generate TypeScript
- JSON Schema as source, generate both (chosen)

**Rationale:**

1. **Single Source of Truth:** Impossible to drift when both generated from same schema
2. **Language Agnostic:** JSON Schema is neutral, not tied to TypeScript or Python
3. **Automated Generation:** No manual sync required
4. **Industry Standard:** JSON Schema is widely used, well-documented
5. **Future-Proof:** Can generate validators, docs, API specs, any language

**The Problem We're Solving:**

LegalDocument must exist in TWO places:
```typescript
// TypeScript (frontend, records-service)
interface LegalDocument {
  meta: DocumentMeta
  body: DocumentBody
}
```

```python
# Python (ingestion, export, 5 other services)
class LegalDocument(BaseModel):
    meta: DocumentMeta
    body: DocumentBody
```

Without single source: These WILL drift. Every schema change requires manual updates in both languages across all services.

**The Solution:**

```json
// packages/shared-types/schemas/legal-document.schema.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["meta", "body"],
  "properties": {
    "meta": { "$ref": "#/definitions/DocumentMeta" },
    "body": { "$ref": "#/definitions/DocumentBody" }
  }
}
```

**Generate both:**
```bash
# TypeScript
quicktype legal-document.schema.json --lang typescript --out legal-document.types.ts

# Python
datamodel-codegen --input legal-document.schema.json --output legal_document.py
```

**What We're Getting:**
- Guaranteed type consistency
- Automated generation (one command)
- Can generate for any language (future Go/Rust/etc.)
- Can generate validators, docs, API specs
- Schema changes propagate automatically

**What We're Giving Up:**
- ~4 hours initial setup
- Learning JSON Schema syntax
- Manual control over exact generated code

**Trade-Off Assessment:** 4 hours of setup prevents infinite hours of debugging schema drift. This is the definition of "one-shot" investment.

**Action Items:**
- [x] Decision finalized
- [ ] Create legal-document.schema.json in Runbook 1
- [ ] Setup generation scripts (TypeScript + Python)
- [ ] Test round-trip serialization
- [ ] Estimate: +4 hours to Runbook 1

---

## DECISION 4: MONOREPO TOOLING

### **Choice: pnpm Workspaces**

**Alternatives Considered:**
- npm workspaces
- pnpm workspaces (chosen)
- Yarn workspaces
- Lerna
- Turborepo

**Rationale:**

1. **Performance:** Fastest package manager (efficient disk usage)
2. **Workspace Support:** Excellent monorepo features
3. **Industry Adoption:** Growing standard for monorepos
4. **Simple Setup:** Just add pnpm-workspace.yaml

**What We're Getting:**
- Fast installs (shared dependencies)
- Efficient disk usage (content-addressable store)
- Workspace protocol (`workspace:*` dependencies)
- Simple configuration

**What We're Giving Up:**
- Need to install pnpm globally
- Slightly different CLI from npm (minor learning curve)

**Trade-Off Assessment:** Performance and workspace features worth the minor setup. pnpm is becoming industry standard for monorepos.

**Configuration:**
```yaml
# pnpm-workspace.yaml
packages:
  - 'services/*'
  - 'apps/*'
  - 'packages/*'
```

**Action Items:**
- [x] Decision finalized
- [ ] Add pnpm setup to Runbook 1
- [ ] Document workspace configuration
- [ ] Estimate: +1 hour to Runbook 1

---

## DECISION 5: FEATURE REGISTRY (NEW)

### **Choice: Build Feature Registry as Frontend Complement to ClerkGuard**

**Rationale:**

This decision emerged from analyzing the LLM workspace configuration requirements. To enable LLM to configure UI dynamically, we must provide structured feature definitions. This same structure provides massive secondary benefits.

**The Architectural Insight:**

We already have three-layer modularity:
1. **Data Layer:** Need single source → JSON Schema
2. **Backend Layer:** Need security enforcement → ClerkGuard (96 channels)
3. **Frontend Layer:** Need documentation enforcement → Feature Registry

**Feature Registry mirrors ClerkGuard:**

**Frontend (Feature Registry):**
```typescript
const FACTS_CLERK: ClerkDefinition = {
  inputs: [{ name: 'caseId', type: 'ULID' }],
  outputs: [{ name: 'facts', type: 'Fact[]' }],
  privacy: { dataAccessed: ['documents'], externalAPIs: [] }
}
```

**Backend (ClerkGuard):**
```typescript
{
  channel: 'facts:extract',
  resourceType: 'fact',
  inputValidation: { caseId: 'ULID' },
  outputSchema: { facts: 'Fact[]' }
}
```

**Same structure, different enforcement points.**

**What Feature Registry Enables:**

1. **LLM Workspace Configuration:**
```
User: "Check for contradictions"
LLM reads registry → Knows Facts Clerk has 'contradictions' mode
LLM configures UI with correct panels
```

2. **Automatic Documentation:**
```
User: "What can Facts Clerk do?"
LLM reads capabilities from registry
Returns accurate, complete answer
```

3. **Privacy Transparency:**
```
User: "What data does this access?"
LLM reads privacy section
Explains data access clearly
```

4. **Feature Discovery:**
```
User doesn't know timeline view exists
LLM suggests it based on capabilities
User discovers feature organically
```

**What We're Getting:**
- Self-documenting architecture
- LLM with perfect platform knowledge
- Privacy transparency built-in
- Feature discovery automatic
- Documentation can't go stale (required for functionality)
- Testing framework (tests generated from definitions)
- Future API spec (auto-generated)

**What We're Giving Up:**
- ~29 hours total investment:
  - Initial setup: 8 hours
  - 8 clerk definitions: 16 hours
  - LLM integration: 5 hours

**Trade-Off Assessment:** 29 hours of structured documentation replaces 46+ hours of traditional documentation, PLUS provides LLM integration, automatic feature discovery, and privacy transparency. Exceptional ROI.

**The Forcing Function Benefit:**

To add any new feature, developer MUST:
1. Update ClerkDefinition (capabilities, privacy, examples)
2. Only then can LLM know about it
3. Only then can users discover it
4. Documentation literally cannot be skipped

**This is architectural discipline enforced by functionality requirements.**

**Action Items:**
- [x] Decision finalized
- [ ] Create ClerkDefinition interface in Runbook 1
- [ ] Create registry system (exports, helpers)
- [ ] Document Facts Clerk (template for others)
- [ ] Document remaining 7 clerks during Runbook 8
- [ ] Estimate: +3 hours to Runbook 1, +8 hours to Runbook 8

---

## SUMMARY OF ALL DECISIONS

| Decision | Choice | Time Impact | Key Benefit |
|----------|--------|-------------|-------------|
| 1. Framework | Vue 3 | Saves 13-22h | Better for single dev + LLM UI |
| 2. Python Distribution | PyInstaller/service | +3h Runbook 10 | Architectural integrity |
| 3. Schema Sync | JSON Schema | +4h Runbook 1 | Prevents type drift |
| 4. Monorepo | pnpm | +1h Runbook 1 | Fast, efficient |
| 5. Feature Registry | Build it | +11h Runbooks 1+8 | Self-documenting system |

**Net Time Impact:** +19 hours (vs baseline)
**But:** Saves 13-22 hours (Vue 3) = Net -3 to +6 hours
**And:** Prevents 50-100+ hours of debugging/refactoring later

**This is "one-shot" development:** Invest in proper architecture upfront, prevent technical debt forever.

---

## UPDATED TIMELINE

### **Prep Work: 9 hours**
- Hour 0-1: Document decisions ✓
- Hour 1-6: JSON Schema + Feature Registry
- Hour 6-7: NUPunkt verification
- Hour 7-8: Pandoc verification
- Hour 8-9: Update runbooks

### **Phase 4: 118-161 hours**
- Runbook 1: 8-9h (was 2-3h) → +6h for JSON Schema + Registry + pnpm
- Runbook 7: 12-16h (was 10-14h) → +2h for parallel startup
- Runbook 8: 27-33h (was 12-16h) → +15h for realistic extensions + clerk definitions
- Runbook 10: 16-22h (was 10-14h) → +6h for PyInstaller + Pandoc strategies
- Others: Unchanged

**Total: 127-170 hours (16-21 work days at 8 hours/day)**

---

## ARCHITECTURAL ALIGNMENT

All five decisions reinforce the same principles:

**Modularity:**
- Backend: 8 microservices
- Frontend: 8 clerk components
- Data: JSON Schema modules

**Single Source of Truth:**
- Data: JSON Schema
- Backend: ClerkGuard channels
- Frontend: Feature Registry

**Documentation as Requirement:**
- ClerkGuard: Can't call service without channel definition
- Feature Registry: Can't enable LLM without clerk definition
- JSON Schema: Can't use types without schema

**Result:** Self-documenting, secure, maintainable system where documentation IS the architecture.

---

## CONFIDENCE LEVEL

**VERY HIGH** ✅

**Why:**
1. All decisions aligned with architecture
2. Trade-offs carefully considered
3. Time estimates realistic
4. No unresolved blockers
5. Clear execution path

**Ready to proceed with prep work and Phase 4 implementation.**

---

**Status:** All decisions finalized, ready for execution  
**Next:** Execute 9-hour prep plan  
**Confidence:** VERY HIGH ✅
