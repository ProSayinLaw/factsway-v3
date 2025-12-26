# Service Interface Specifications

**From Runbook 0, Section 10 (API Endpoints)**

---

## Service-to-Service Communication

All services communicate via REST/JSON over HTTP.

### 1. Records Service (Port 3001)

**Base URL:** `http://localhost:3001` (desktop) or `http://records-service:3001` (cloud)

**Endpoints:**
- `GET /api/templates` - List all templates
- `POST /api/templates` - Create template
- `GET /api/templates/:id` - Get template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template
- (Same pattern for /api/cases and /api/drafts)

**Response Format:**
```json
{
  "success": true,
  "data": { /* resource */ }
}
```

---

### 2. Ingestion Service (Port 3002)

**Base URL:** `http://localhost:3002` (desktop) or `http://ingestion-service:3002` (cloud)

**Endpoints:**
- `POST /api/ingest` - Parse DOCX to LegalDocument

**Request:**
```
Content-Type: multipart/form-data
Body: file (binary .docx)
```

**Response:**
```json
{
  "success": true,
  "parsed": {
    "meta": { /* ... */ },
    "case_header": { /* ... */ },
    "caseblock": { /* ... */ },
    "body": { /* sections, paragraphs, sentences */ },
    "signature_block": { /* ... */ },
    "citations": [ /* ... */ ],
    "embedded_objects": [ /* ... */ ]
  }
}
```

---

### 3. Export Service (Port 3003)

**Base URL:** `http://localhost:3003` (desktop) or `http://export-service:3003` (cloud)

**Endpoints:**
- `POST /api/export` - Generate DOCX from LegalDocument
- `POST /api/export/pdf` - Generate PDF from LegalDocument

**Request:**
```json
{
  "legalDocument": { /* LegalDocument structure */ },
  "format": "docx" | "pdf"
}
```

**Response:**
```json
{
  "success": true,
  "buffer": "base64-encoded-bytes",
  "filename": "motion.docx"
}
```

---

### 4-8. Additional Services

- **CaseBlock Service (3004)** - POST /api/caseblock/extract, POST /api/caseblock/format
- **Signature Service (3005)** - POST /api/signature/extract, POST /api/signature/format
- **Facts Service (3006)** - GET/POST/PUT /api/facts, POST /api/facts/link
- **Exhibits Service (3007)** - GET/POST /api/exhibits, POST /api/exhibits/appendix
- **Caselaw Service (3008)** - POST /api/citations/detect, GET /api/citations/parallel

