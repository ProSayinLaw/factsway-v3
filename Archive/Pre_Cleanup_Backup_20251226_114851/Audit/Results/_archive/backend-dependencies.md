# Backend Dependency Graph

**Purpose:** Map import relationships to prevent breaking changes

---

## TypeScript Dependencies

### Most Imported Files (Hub Files)

| File | Import Count | Risk Level |
|------|--------------|------------|
| `src/shared/types/legal-document.types.ts` | 10 | 🟢 LOW |
| `src/shared/ids.ts` | 37 | 🔴 HIGH - Critical Hub |
| `src/shared/render/models.ts` | 12 | 🟡 MEDIUM - Important |
| `src/shared/logger.ts` | 39 | 🔴 HIGH - Critical Hub |
| `src/shared/formatting/extendedSchema.ts` | 6 | 🟢 LOW |
| `src/shared/signatureblock/schema.ts` | 8 | 🟢 LOW |
| `src/shared/caseblock/schema.ts` | 16 | 🟡 MEDIUM - Important |
| `src/logging/structured.ts` | 10 | 🟢 LOW |

### External Dependencies (package.json)

```json
{
  "@google/generative-ai": "^0.11.3",
  "@xmldom/xmldom": "^0.8.11",
  "canvas": "^3.2.0",
  "date-fns": "^4.1.0",
  "dotenv": "^17.2.3",
  "electron-squirrel-startup": "^1.0.1",
  "lodash-es": "^4.17.21",
  "lodash.debounce": "^4.0.8",
  "mammoth": "^1.11.0",
  "node-html-parser": "^7.0.1",
  "pdf-parse": "^1.1.1",
  "pdfjs-dist": "^4.10.38",
  "puppeteer-core": "^23.0.0",
  "tesseract.js": "6.0.1",
  "ulid": "^3.0.1",
  "uuid": "^11.1.0",
  "zod": "^3.25.76"
}
```

### Python Dependencies (requirements.txt)


