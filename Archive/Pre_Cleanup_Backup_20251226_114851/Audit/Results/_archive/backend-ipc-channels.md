# IPC Channel Complete Inventory

**Purpose:** Map all IPC channels to prevent breaking UI integration

---

## Registered Channels (ipcMain.handle)

| Channel Name | Handler File | Line | Status |
|--------------|--------------|------|--------|
| `style:pick-and-extract` | `src/main/handlers/style/index.ts` | 27 | 🟢 ACTIVE |

## Invoked Channels (invokeChannel)

| Channel Name | Caller File | Line | Target |
|--------------|-------------|------|--------|
| `caseblock:update` | `src/api/routes/caseblock.ts` | 187 | ❌ NO HANDLER |
| `caseblock:set-default` | `src/api/routes/caseblock.ts` | 214 | ❌ NO HANDLER |
| `caseblock:update-style` | `src/api/routes/caseblock.ts` | 922 | ❌ NO HANDLER |
| `caseblock:update-content-policy` | `src/api/routes/caseblock.ts` | 967 | ❌ NO HANDLER |
| `admin:update-parties` | `src/api/routes/caseblock.ts` | 1162 | ❌ NO HANDLER |
| `admin:update-court` | `src/api/routes/caseblock.ts` | 1170 | ❌ NO HANDLER |
| `admin:update-jurisdiction` | `src/api/routes/caseblock.ts` | 1179 | ❌ NO HANDLER |
| `drafting:delete-draft` | `src/api/routes/drafting.ts` | 202 | ❌ NO HANDLER |
| `drafting:import-docx-buffer` | `src/api/routes/drafting.ts` | 226 | ❌ NO HANDLER |
| `signature:update` | `src/api/routes/signature.ts` | 208 | ❌ NO HANDLER |
| `signature:set-default` | `src/api/routes/signature.ts` | 511 | ❌ NO HANDLER |
| `exhibits:delete` | `src/api/routes/exhibits.ts` | 184 | ❌ NO HANDLER |
| `admin:set-metadata` | `src/api/routes/admin.ts` | 59 | ❌ NO HANDLER |
| `admin:update-parties` | `src/api/routes/admin.ts` | 91 | ❌ NO HANDLER |
| `admin:update-court` | `src/api/routes/admin.ts` | 119 | ❌ NO HANDLER |
| `admin:update-jurisdiction` | `src/api/routes/admin.ts` | 147 | ❌ NO HANDLER |
| `admin:update-signers` | `src/api/routes/admin.ts` | 175 | ❌ NO HANDLER |
| `admin:update-meta` | `src/api/routes/admin.ts` | 203 | ❌ NO HANDLER |
| `formatting:update` | `src/api/routes/formatting.ts` | 99 | ❌ NO HANDLER |
| `formatting:set-default` | `src/api/routes/formatting.ts` | 126 | ❌ NO HANDLER |
| `formatting:extract-styles` | `src/api/routes/formatting.ts` | 179 | ❌ NO HANDLER |
| `exhibitLinks:delete` | `src/api/routes/exhibitLinks.ts` | 138 | ❌ NO HANDLER |

