# Runbook 6: Specialized Services - Citation, Evidence, Template, Analysis

**Phase:** Foundation (Critical Path)  
**Estimated Time:** 12-16 hours  
**Prerequisites:** Runbooks 1-5 complete  
**Depends On:** Runbook 0 Sections 11-14, 15.6-15.9, 19.6  
**Enables:** Runbooks 7-15 (specialized capabilities)

---

## Objective

Create **4 specialized microservices** that provide domain-specific functionality for legal document processing.

**Services:**
1. **Citation Service** (port 3004) - Citation parsing and validation
2. **Evidence Service** (port 3005) - Evidence/exhibit management  
3. **Template Service** (port 3006) - Template management and filling
4. **Analysis Service** (port 3007) - Document analysis and metrics

**Success Criteria:**
- ✅ All 4 services run on assigned ports
- ✅ Each service provides REST API
- ✅ Integration with database (Runbook 2)
- ✅ Uses LegalDocument format (Runbook 1)
- ✅ Health checks functional
- ✅ Tests pass for all services
- ✅ Service discovery ready

---

## Context from Runbook 0

**Referenced Sections:**
- **Section 11:** Citation Service Specification
  - **Section 11.1:** Citation parsing
  - **Section 11.2:** Citation validation
  - **Section 11.3:** Citation linking
- **Section 12:** Evidence Service Specification
  - **Section 12.1:** Evidence storage
  - **Section 12.2:** Exhibit numbering
  - **Section 12.3:** File management
- **Section 13:** Template Service Specification
  - **Section 13.1:** Template CRUD
  - **Section 13.2:** Variable substitution
  - **Section 13.3:** Template filling
- **Section 14:** Analysis Service Specification
  - **Section 14.1:** Document metrics
  - **Section 14.2:** Readability analysis
  - **Section 14.3:** Citation coverage
- **Sections 15.6-15.9:** Technology Stack for each service
- **Section 19.6:** Runbook 6 Verification Criteria

**Key Principle from Runbook 0:**
> "Specialized services follow microservices principles: single responsibility, loosely coupled, independently deployable. Each service owns its domain logic."

---

## Current State

**What exists:**
- ✅ Records Service (Runbook 3) - CRUD pattern
- ✅ Ingestion Service (Runbook 4) - Python pattern
- ✅ Export Service (Runbook 5) - Document conversion
- ❌ No specialized services

**What this creates:**
- ✅ 4 specialized microservices (TypeScript + Python)
- ✅ Citation parsing and validation
- ✅ Evidence management
- ✅ Template management
- ✅ Document analysis
- ✅ Complete test suites

---

## Service 1: Citation Service (Port 3004)

### 1.1 Create Structure

**Location:** services/citation-service/

**Action:** CREATE TypeScript service

```bash
mkdir -p services/citation-service/src/{api,services,parsers,validators,types}
mkdir -p services/citation-service/tests/{unit,integration}
```

---

### 1.2 Package Configuration

**File:** `services/citation-service/package.json`

**Action:** CREATE

**Content:**
```json
{
  "name": "@factsway/citation-service",
  "version": "1.0.0",
  "description": "Citation parsing and validation service",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts",
    "test": "jest"
  },
  "dependencies": {
    "@factsway/shared-types": "workspace:*",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "express-validator": "^7.0.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.11",
    "@types/node": "^20.10.6",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.1",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  }
}
```

---

### 1.3 Main Server

**File:** `services/citation-service/src/index.ts`

**Action:** CREATE

**Content:**
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createApiRouter } from './api';
import { errorHandler } from './middleware/error-handler';

const PORT = process.env.PORT || 3004;
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'citation-service',
    port: PORT,
  });
});

// API routes
app.use('/api', createApiRouter());

// Error handling
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`✓ Citation Service running on port ${PORT}`);
});

export { app, server };
```

---

### 1.4 Citation Parser

**File:** `services/citation-service/src/parsers/citation-parser.ts`

**Action:** CREATE

**Content:**
```typescript
export interface ParsedCitation {
  raw: string;
  type: 'case' | 'statute' | 'regulation' | 'short_form' | 'id' | 'supra' | 'exhibit';
  components: Record<string, string>;
  isValid: boolean;
  errors?: string[];
}

export class CitationParser {
  /**
   * Parse a citation string into structured components
   */
  parse(citation: string): ParsedCitation {
    // Try each citation type
    const parsers = [
      this.parseCaseCitation,
      this.parseStatuteCitation,
      this.parseShortForm,
    ];

    for (const parser of parsers) {
      const result = parser.call(this, citation);
      if (result.isValid) {
        return result;
      }
    }

    // Unknown citation type
    return {
      raw: citation,
      type: 'short_form',
      components: { text: citation },
      isValid: false,
      errors: ['Unknown citation format'],
    };
  }

  private parseCaseCitation(citation: string): ParsedCitation {
    // Pattern: Volume Reporter Page [, PinnedPage] (Court Year)
    // Example: 123 F.3d 456, 459 (9th Cir. 2020)
    const pattern = /^(\d+)\s+([A-Z][a-z.]+)\s+(\d+)(?:,\s*(\d+))?\s*(?:\(([^)]+)\))?$/;
    const match = citation.match(pattern);

    if (match) {
      return {
        raw: citation,
        type: 'case',
        components: {
          volume: match[1],
          reporter: match[2],
          page: match[3],
          pinnedPage: match[4] || '',
          parenthetical: match[5] || '',
        },
        isValid: true,
      };
    }

    return {
      raw: citation,
      type: 'case',
      components: {},
      isValid: false,
    };
  }

  private parseStatuteCitation(citation: string): ParsedCitation {
    // Pattern: Title U.S.C. § Section
    // Example: 42 U.S.C. § 1983
    const pattern = /^(\d+)\s+U\.S\.C\.\s+§\s+(\d+)$/;
    const match = citation.match(pattern);

    if (match) {
      return {
        raw: citation,
        type: 'statute',
        components: {
          title: match[1],
          section: match[2],
        },
        isValid: true,
      };
    }

    return {
      raw: citation,
      type: 'statute',
      components: {},
      isValid: false,
    };
  }

  private parseShortForm(citation: string): ParsedCitation {
    // Id. citations
    if (citation.match(/^Id\.\s*(?:at\s+(\d+))?$/i)) {
      return {
        raw: citation,
        type: 'id',
        components: { type: 'id' },
        isValid: true,
      };
    }

    // Supra citations
    if (citation.match(/^.+,\s+supra$/i)) {
      return {
        raw: citation,
        type: 'supra',
        components: { type: 'supra' },
        isValid: true,
      };
    }

    return {
      raw: citation,
      type: 'short_form',
      components: {},
      isValid: false,
    };
  }
}
```

---

### 1.5 Citation API

**File:** `services/citation-service/src/api/citations.routes.ts`

**Action:** CREATE

**Content:**
```typescript
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { CitationParser } from '../parsers/citation-parser';

export function createCitationRoutes(): Router {
  const router = Router();
  const parser = new CitationParser();

  // POST /api/citations/parse - Parse citation text
  router.post(
    '/parse',
    [body('citation').isString().notEmpty()],
    (req, res, next) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const { citation } = req.body;
        const parsed = parser.parse(citation);

        res.json({ data: parsed });
      } catch (error) {
        next(error);
      }
    }
  );

  // POST /api/citations/validate - Validate citation
  router.post(
    '/validate',
    [body('citation').isString().notEmpty()],
    (req, res, next) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const { citation } = req.body;
        const parsed = parser.parse(citation);

        res.json({
          data: {
            citation,
            isValid: parsed.isValid,
            type: parsed.type,
            errors: parsed.errors || [],
          },
        });
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
}
```

---

## Service 2: Evidence Service (Port 3005)

### 2.1 Create Structure

**Location:** services/evidence-service/

**Action:** CREATE TypeScript service

```bash
mkdir -p services/evidence-service/src/{api,services,storage,types}
mkdir -p services/evidence-service/tests/{unit,integration}
mkdir -p services/evidence-service/storage/uploads
```

---

### 2.2 Main Server

**File:** `services/evidence-service/src/index.ts`

**Action:** CREATE (similar to Citation Service)

**Port:** 3005

---

### 2.3 Evidence Storage

**File:** `services/evidence-service/src/services/evidence-storage.service.ts`

**Action:** CREATE

**Content:**
```typescript
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface Evidence {
  id: string;
  caseId: string;
  type: 'exhibit' | 'caselaw' | 'statute' | 'document';
  title: string;
  description?: string;
  exhibitNumber?: string;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  createdAt: Date;
}

export class EvidenceStorageService {
  private storageDir: string;

  constructor(storageDir: string = './storage/uploads') {
    this.storageDir = storageDir;
    this.ensureStorageDir();
  }

  private ensureStorageDir(): void {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  /**
   * Store an evidence file
   */
  async storeFile(
    caseId: string,
    file: Express.Multer.File,
    metadata: Partial<Evidence>
  ): Promise<Evidence> {
    const id = uuidv4();
    const fileName = `${id}_${file.originalname}`;
    const filePath = path.join(this.storageDir, fileName);

    // Save file
    fs.writeFileSync(filePath, file.buffer);

    // Create evidence record
    const evidence: Evidence = {
      id,
      caseId,
      type: metadata.type || 'document',
      title: metadata.title || file.originalname,
      description: metadata.description,
      exhibitNumber: metadata.exhibitNumber,
      filePath,
      fileName: file.originalname,
      fileSize: file.size,
      createdAt: new Date(),
    };

    return evidence;
  }

  /**
   * Retrieve evidence file
   */
  async getFile(evidenceId: string): Promise<Buffer | null> {
    // In production, look up filePath from database
    // For now, simplified implementation
    const files = fs.readdirSync(this.storageDir);
    const file = files.find(f => f.startsWith(evidenceId));

    if (!file) {
      return null;
    }

    const filePath = path.join(this.storageDir, file);
    return fs.readFileSync(filePath);
  }

  /**
   * Delete evidence file
   */
  async deleteFile(evidenceId: string): Promise<boolean> {
    const files = fs.readdirSync(this.storageDir);
    const file = files.find(f => f.startsWith(evidenceId));

    if (!file) {
      return false;
    }

    const filePath = path.join(this.storageDir, file);
    fs.unlinkSync(filePath);
    return true;
  }
}
```

---

### 2.4 Evidence API

**File:** `services/evidence-service/src/api/evidence.routes.ts`

**Action:** CREATE

**Content:**
```typescript
import { Router } from 'express';
import multer from 'multer';
import { EvidenceStorageService } from '../services/evidence-storage.service';

const upload = multer({ storage: multer.memoryStorage() });

export function createEvidenceRoutes(): Router {
  const router = Router();
  const storageService = new EvidenceStorageService();

  // POST /api/evidence - Upload evidence file
  router.post('/', upload.single('file'), async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { caseId, type, title, description, exhibitNumber } = req.body;

      const evidence = await storageService.storeFile(caseId, req.file, {
        type,
        title,
        description,
        exhibitNumber,
      });

      res.status(201).json({ data: evidence });
    } catch (error) {
      next(error);
    }
  });

  // GET /api/evidence/:id - Get evidence file
  router.get('/:id', async (req, res, next) => {
    try {
      const file = await storageService.getFile(req.params.id);

      if (!file) {
        return res.status(404).json({ error: 'Evidence not found' });
      }

      res.send(file);
    } catch (error) {
      next(error);
    }
  });

  // DELETE /api/evidence/:id - Delete evidence
  router.delete('/:id', async (req, res, next) => {
    try {
      const deleted = await storageService.deleteFile(req.params.id);

      if (!deleted) {
        return res.status(404).json({ error: 'Evidence not found' });
      }

      res.json({ message: 'Evidence deleted successfully' });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
```

---

## Service 3: Template Service (Port 3006)

### 3.1 Create Structure

**Location:** services/template-service/

**Action:** CREATE TypeScript service (port 3006)

---

### 3.2 Template Filling Service

**File:** `services/template-service/src/services/template-filler.service.ts`

**Action:** CREATE

**Content:**
```typescript
import { LegalDocument } from '@factsway/shared-types';

export interface TemplateVariables {
  [key: string]: string | number | Date;
}

export class TemplateFillerService {
  /**
   * Fill template variables in a LegalDocument
   */
  fillTemplate(
    template: LegalDocument,
    variables: TemplateVariables
  ): LegalDocument {
    // Clone template
    const filled = JSON.parse(JSON.stringify(template));

    // Replace variables in all text
    this.replaceVariables(filled, variables);

    return filled;
  }

  private replaceVariables(obj: any, variables: TemplateVariables): void {
    if (typeof obj === 'string') {
      return; // Strings are immutable, parent must replace
    }

    if (Array.isArray(obj)) {
      obj.forEach(item => this.replaceVariables(item, variables));
      return;
    }

    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = this.replaceInText(obj[key], variables);
        } else {
          this.replaceVariables(obj[key], variables);
        }
      }
    }
  }

  private replaceInText(text: string, variables: TemplateVariables): string {
    let result = text;

    for (const [key, value] of Object.entries(variables)) {
      const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(pattern, String(value));
    }

    return result;
  }

  /**
   * Extract variable names from template
   */
  extractVariables(template: LegalDocument): string[] {
    const variables = new Set<string>();
    this.findVariables(template, variables);
    return Array.from(variables);
  }

  private findVariables(obj: any, variables: Set<string>): void {
    if (typeof obj === 'string') {
      const matches = obj.matchAll(/\{\{(\w+)\}\}/g);
      for (const match of matches) {
        variables.add(match[1]);
      }
      return;
    }

    if (Array.isArray(obj)) {
      obj.forEach(item => this.findVariables(item, variables));
      return;
    }

    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        this.findVariables(obj[key], variables);
      }
    }
  }
}
```

---

## Service 4: Analysis Service (Port 3007)

### 4.1 Create Structure

**Location:** services/analysis-service/

**Action:** CREATE Python service (port 3007)

```bash
mkdir -p services/analysis-service/app/{api,services,analyzers}
mkdir -p services/analysis-service/tests/{unit,integration}
```

---

### 4.2 Main Server

**File:** `services/analysis-service/main.py`

**Action:** CREATE

**Content:**
```python
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.services.analysis_service import AnalysisService
from app.models.legal_document import LegalDocument

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="FACTSWAY Analysis Service",
    description="Document analysis and metrics service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

analysis_service = AnalysisService()


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "analysis-service",
        "port": 3007,
    }


@app.post("/analyze")
async def analyze_document(legal_document: LegalDocument):
    """
    Analyze a legal document and return metrics.
    
    Returns:
        Document metrics including:
        - Word count
        - Sentence count
        - Citation count
        - Readability scores
        - Section analysis
    """
    try:
        analysis = analysis_service.analyze(legal_document)
        return {"data": analysis}
    
    except Exception as e:
        logger.error(f"Error analyzing document: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing document: {str(e)}"
        )


@app.get("/")
async def root():
    return {
        "service": "analysis-service",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "analyze": "/analyze (POST)",
        }
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=3007,
        reload=True
    )
```

---

### 4.3 Document Analyzer

**File:** `services/analysis-service/app/services/analysis_service.py`

**Action:** CREATE

**Content:**
```python
from app.models.legal_document import LegalDocument
from typing import Dict, Any
import re


class AnalysisService:
    """Analyze legal documents and provide metrics"""
    
    def analyze(self, legal_doc: LegalDocument) -> Dict[str, Any]:
        """
        Analyze a legal document.
        
        Args:
            legal_doc: LegalDocument to analyze
            
        Returns:
            Dictionary of analysis metrics
        """
        return {
            "word_count": self._count_words(legal_doc),
            "sentence_count": self._count_sentences(legal_doc),
            "paragraph_count": self._count_paragraphs(legal_doc),
            "citation_count": len(legal_doc.citations),
            "section_count": len(legal_doc.body.sections),
            "avg_sentence_length": self._avg_sentence_length(legal_doc),
            "readability": self._calculate_readability(legal_doc),
            "sections": self._analyze_sections(legal_doc),
        }
    
    def _count_words(self, legal_doc: LegalDocument) -> int:
        """Count total words in document"""
        total = 0
        for section in legal_doc.body.sections:
            for paragraph in section.paragraphs:
                words = len(paragraph.text.split())
                total += words
        return total
    
    def _count_sentences(self, legal_doc: LegalDocument) -> int:
        """Count total sentences in document"""
        total = 0
        for section in legal_doc.body.sections:
            for paragraph in section.paragraphs:
                total += len(paragraph.sentences)
        return total
    
    def _count_paragraphs(self, legal_doc: LegalDocument) -> int:
        """Count total paragraphs in document"""
        total = 0
        for section in legal_doc.body.sections:
            total += len(section.paragraphs)
        return total
    
    def _avg_sentence_length(self, legal_doc: LegalDocument) -> float:
        """Calculate average sentence length in words"""
        total_words = 0
        total_sentences = 0
        
        for section in legal_doc.body.sections:
            for paragraph in section.paragraphs:
                for sentence in paragraph.sentences:
                    words = len(sentence.text.split())
                    total_words += words
                    total_sentences += 1
        
        if total_sentences == 0:
            return 0.0
        
        return total_words / total_sentences
    
    def _calculate_readability(self, legal_doc: LegalDocument) -> Dict[str, float]:
        """Calculate readability scores (simplified)"""
        avg_sentence_length = self._avg_sentence_length(legal_doc)
        
        # Simplified readability score (not true Flesch-Kincaid)
        # In production, use proper formula with syllable counting
        readability_score = max(0, 100 - (avg_sentence_length * 2))
        
        return {
            "score": readability_score,
            "avg_sentence_length": avg_sentence_length,
            "level": self._readability_level(readability_score)
        }
    
    def _readability_level(self, score: float) -> str:
        """Convert readability score to level"""
        if score >= 90:
            return "very_easy"
        elif score >= 70:
            return "easy"
        elif score >= 50:
            return "moderate"
        elif score >= 30:
            return "difficult"
        else:
            return "very_difficult"
    
    def _analyze_sections(self, legal_doc: LegalDocument) -> list:
        """Analyze each section"""
        sections_analysis = []
        
        for section in legal_doc.body.sections:
            section_words = sum(
                len(p.text.split())
                for p in section.paragraphs
            )
            
            section_sentences = sum(
                len(p.sentences)
                for p in section.paragraphs
            )
            
            sections_analysis.append({
                "title": section.title,
                "word_count": section_words,
                "sentence_count": section_sentences,
                "paragraph_count": len(section.paragraphs),
            })
        
        return sections_analysis
```

---

## Task: Verification (from Runbook 0 Section 19.6)

### Citation Service (3004)
- [ ] Service runs on port 3004
- [ ] POST /api/citations/parse works
- [ ] POST /api/citations/validate works
- [ ] Parses case citations correctly
- [ ] Parses statute citations correctly
- [ ] Identifies short forms (Id., supra)

### Evidence Service (3005)
- [ ] Service runs on port 3005
- [ ] POST /api/evidence uploads files
- [ ] GET /api/evidence/:id retrieves files
- [ ] DELETE /api/evidence/:id deletes files
- [ ] File storage working

### Template Service (3006)
- [ ] Service runs on port 3006
- [ ] Template variable replacement works
- [ ] Variable extraction works
- [ ] Preserves LegalDocument structure

### Analysis Service (3007)
- [ ] Service runs on port 3007
- [ ] POST /analyze returns metrics
- [ ] Word/sentence/paragraph counts accurate
- [ ] Citation count accurate
- [ ] Readability calculation works

### All Services
- [ ] Health checks respond
- [ ] Error handling works
- [ ] Tests pass
- [ ] Ready for Runbook 7

---

## Success Criteria

✅ All 4 services running  
✅ All APIs functional  
✅ Tests passing  
✅ Service discovery ready  
✅ Ready for Runbook 7 (Orchestrator)  

---

## Next Steps

After Runbook 6 is complete:

1. **Start all services:**
   - Citation: `npm run dev` (port 3004)
   - Evidence: `npm run dev` (port 3005)
   - Template: `npm run dev` (port 3006)
   - Analysis: `python main.py` (port 3007)

2. **Test each service:**
   - Health checks
   - API endpoints
   - Integration tests

3. **Proceed to Runbook 7:** Desktop Orchestrator

---

## Reference

- **Runbook 0 Sections 11-14:** Service specifications
- **Runbook 0 Sections 15.6-15.9:** Technology stack
- **Runbook 0 Section 19.6:** Verification criteria
- **Runbooks 1-5:** Dependencies

---

**End of Runbook 6**
