# Runbook 4: Ingestion Service - DOCX → LegalDocument Parser

**Phase:** Foundation (Critical Path)  
**Estimated Time:** 10-12 hours  
**Prerequisites:** Runbooks 1-2 complete (shared-types + database)  
**Depends On:** Runbook 0 Sections 4, 9, 15.4, 19.4  
**Enables:** Runbooks 5-6 (Python service pattern + document processing)

---

## Objective

Create the **Ingestion Service** - Python/FastAPI microservice that parses DOCX files and outputs LegalDocument format.

**Success Criteria:**
- ✅ Service runs on port 3002
- ✅ Accepts DOCX upload via POST /ingest
- ✅ Parses sections, paragraphs, sentences
- ✅ Detects and extracts citations
- ✅ Preserves formatting (bold, italic, underline)
- ✅ Returns valid LegalDocument (Section 4 format)
- ✅ Round-trip fidelity (can export back to DOCX)
- ✅ Tests pass with real DOCX samples

---

## Context from Runbook 0

**Referenced Sections:**
- **Section 4:** LegalDocument Schema (output format)
  - **Section 4.2:** Core Structure
  - **Section 4.4:** Hierarchical Structure (sections)
  - **Section 4.5:** Sentence-Paragraph Relationship
  - **Section 4.6:** Formatting (FormatMark)
  - **Section 4.7:** Citations
  - **Section 4.9:** Preservation Metadata (round-trip XML)
- **Section 9:** Ingestion Pipeline
  - **Section 9.1:** DOCX Parsing
  - **Section 9.2:** Section Detection
  - **Section 9.3:** Sentence Splitting
  - **Section 9.4:** Citation Detection
- **Section 15.4:** Technology Stack - Ingestion Service
  - Python 3.11+
  - FastAPI
  - python-docx for DOCX parsing
  - lxml for XML preservation
- **Section 19.4:** Runbook 4 Verification Criteria

**Key Principle from Runbook 0:**
> "The Ingestion Service outputs LegalDocument format exclusively. All parsing logic is deterministic and preserves enough metadata for perfect round-trip export."

---

## Current State

**What exists:**
- ✅ `@factsway/shared-types` with LegalDocument types (Runbook 1)
- ✅ `@factsway/database` with repositories (Runbook 2)
- ❌ No Python services
- ❌ No DOCX parsing
- ❌ No ingestion pipeline

**What this creates:**
- ✅ `services/ingestion-service/` with complete Python structure
- ✅ FastAPI service on port 3002
- ✅ DOCX upload endpoint
- ✅ Section detection algorithm
- ✅ Sentence splitting with citation awareness
- ✅ Citation detection and extraction
- ✅ Format preservation (XML round-trip)
- ✅ LegalDocument output conformance
- ✅ Test suite with DOCX samples

---

## Task 1: Create Service Structure

### 1.1 Create Directory Structure

**Location:** services/

**Action:** CREATE new directories

```bash
# From repository root
mkdir -p services/ingestion-service/app/{api,services,parsers,utils,models}
mkdir -p services/ingestion-service/tests/{unit,integration,fixtures}
mkdir -p services/ingestion-service/tests/fixtures/docx
```

**Verification:**
```bash
tree services/ingestion-service -L 3

# Expected output:
# services/ingestion-service/
# ├── app/
# │   ├── api/
# │   ├── services/
# │   ├── parsers/
# │   ├── utils/
# │   └── models/
# ├── tests/
# │   ├── unit/
# │   ├── integration/
# │   └── fixtures/
# │       └── docx/
# ├── requirements.txt
# ├── pyproject.toml
# └── main.py
```

---

### 1.2 Create requirements.txt

**File:** `services/ingestion-service/requirements.txt`

**Action:** CREATE

**Content:**
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-docx==1.1.0
lxml==5.0.0
python-multipart==0.0.6
pydantic==2.5.2
pydantic-settings==2.1.0
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.25.2
```

---

### 1.3 Create pyproject.toml

**File:** `services/ingestion-service/pyproject.toml`

**Action:** CREATE

**Content:**
```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
asyncio_mode = "auto"

[tool.black]
line-length = 100
target-version = ['py311']

[tool.isort]
profile = "black"
line_length = 100
```

---

### 1.4 Create main.py

**File:** `services/ingestion-service/main.py`

**Action:** CREATE

**Content:**
```python
import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from pathlib import Path
import tempfile
import os

from app.services.ingestion_service import IngestionService
from app.models.legal_document import LegalDocument

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="FACTSWAY Ingestion Service",
    description="DOCX parsing service that outputs LegalDocument format",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ingestion service
ingestion_service = IngestionService()


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ingestion-service",
        "port": 3002,
    }


@app.post("/ingest", response_model=LegalDocument)
async def ingest_docx(file: UploadFile = File(...)):
    """
    Ingest a DOCX file and return LegalDocument format.
    
    Args:
        file: Uploaded DOCX file
        
    Returns:
        LegalDocument: Parsed document in canonical format
        
    Raises:
        HTTPException: If file is not DOCX or parsing fails
    """
    # Validate file type
    if not file.filename.endswith('.docx'):
        raise HTTPException(
            status_code=400,
            detail="File must be a .docx document"
        )
    
    # Save uploaded file temporarily
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.docx') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name
        
        logger.info(f"Processing file: {file.filename}")
        
        # Parse DOCX to LegalDocument
        legal_document = ingestion_service.process_docx(temp_path)
        
        logger.info(f"Successfully parsed: {file.filename}")
        
        return legal_document
        
    except Exception as e:
        logger.error(f"Error processing file: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error processing document: {str(e)}"
        )
    
    finally:
        # Clean up temporary file
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)


@app.get("/")
async def root():
    """Root endpoint with service info"""
    return {
        "service": "ingestion-service",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "ingest": "/ingest (POST)",
        }
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=3002,
        reload=True,
        log_level="info"
    )
```

---

## Task 2: Data Models (Python Types)

### 2.1 LegalDocument Model

**File:** `services/ingestion-service/app/models/legal_document.py`

**Action:** CREATE

**Content:**
```python
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class DocumentMeta(BaseModel):
    """Document metadata"""
    id: str
    title: str
    type: str  # 'motion', 'brief', 'complaint', etc.
    created_at: str
    updated_at: str
    source_file: Optional[str] = None
    ingestion_version: Optional[str] = "1.0.0"
    tags: Optional[List[str]] = None
    custom: Optional[Dict[str, Any]] = None


class FormatMark(BaseModel):
    """Character-level formatting"""
    start: int  # Inclusive, 0-indexed
    end: int    # Exclusive
    format: str  # 'bold', 'italic', 'underline', etc.
    font: Optional[str] = None
    fontSize: Optional[int] = None


class CitationSpan(BaseModel):
    """Citation within a sentence"""
    start: int
    end: int
    text: str
    type: str  # 'case', 'statute', 'regulation', 'exhibit', etc.
    citation_id: str


class Sentence(BaseModel):
    """Sentence overlay on paragraph text"""
    id: str
    parent_paragraph_id: str
    start_offset: int  # Position within paragraph
    end_offset: int
    text: str  # Derived from paragraph.text[start:end]
    format_spans: List[FormatMark] = Field(default_factory=list)
    citations: List[CitationSpan] = Field(default_factory=list)
    analysis: Optional[Dict[str, Any]] = None


class Paragraph(BaseModel):
    """Paragraph within a section"""
    id: str
    parent_section_id: str
    text: str  # AUTHORITATIVE
    format_spans: List[FormatMark] = Field(default_factory=list)
    sentences: List[Sentence] = Field(default_factory=list)
    numbering: Optional[str] = None
    indent_left: Optional[int] = None
    indent_right: Optional[int] = None
    indent_first_line: Optional[int] = None
    spacing_before: Optional[int] = None
    spacing_after: Optional[int] = None
    line_spacing: Optional[float] = None
    alignment: Optional[str] = None  # 'left', 'center', 'right', 'justify'
    preservation: Optional[Dict[str, str]] = None  # XML for round-trip


class Section(BaseModel):
    """Hierarchical section"""
    id: str
    parent_section_id: Optional[str] = None
    title: str
    number: Optional[str] = None  # "I", "A", "1", etc.
    level: int  # 1 = top-level, 2 = subsection, etc.
    type: str  # 'introduction', 'background', 'argument', etc.
    children: List['Section'] = Field(default_factory=list)
    paragraphs: List[Paragraph] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = None


class DocumentBody(BaseModel):
    """Document body with hierarchical sections"""
    sections: List[Section] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = None


class Citation(BaseModel):
    """Citation registry entry"""
    id: str
    type: str  # 'case', 'statute', etc.
    full_text: str
    sentence_ids: List[str] = Field(default_factory=list)
    parsed: Optional[Dict[str, Any]] = None


class EmbeddedObject(BaseModel):
    """Embedded image, table, etc."""
    id: str
    type: str  # 'image', 'table', etc.
    data: Dict[str, Any]


class LegalDocument(BaseModel):
    """Complete LegalDocument (Section 4.2 from Runbook 0)"""
    meta: DocumentMeta
    body: DocumentBody
    citations: List[Citation] = Field(default_factory=list)
    embedded_objects: List[EmbeddedObject] = Field(default_factory=list)
    
    # Optional blocks
    case_header: Optional[Dict[str, Any]] = None
    caseblock: Optional[Dict[str, Any]] = None
    signature_block: Optional[Dict[str, Any]] = None


# Enable forward references
Section.model_rebuild()
```

---

## Task 3: DOCX Parsing

### 3.1 Document Parser

**File:** `services/ingestion-service/app/parsers/docx_parser.py`

**Action:** CREATE

**Content:**
```python
from docx import Document
from docx.document import Document as DocxDocument
from docx.text.paragraph import Paragraph as DocxParagraph
from docx.oxml.text.paragraph import CT_P
from lxml import etree
import uuid
from typing import List, Tuple, Optional
from datetime import datetime

from app.models.legal_document import (
    LegalDocument, DocumentMeta, DocumentBody, Section, Paragraph,
    Sentence, FormatMark, Citation, CitationSpan
)
from app.parsers.section_detector import SectionDetector
from app.parsers.sentence_splitter import SentenceSplitter
from app.parsers.citation_detector import CitationDetector
from app.utils.formatting import extract_format_marks


class DocxParser:
    """Parse DOCX files into LegalDocument format"""
    
    def __init__(self):
        self.section_detector = SectionDetector()
        self.sentence_splitter = SentenceSplitter()
        self.citation_detector = CitationDetector()
    
    def parse(self, docx_path: str) -> LegalDocument:
        """
        Parse a DOCX file into LegalDocument format.
        
        Args:
            docx_path: Path to DOCX file
            
        Returns:
            LegalDocument: Parsed document
        """
        doc = Document(docx_path)
        
        # Extract document title (from first paragraph or filename)
        title = self._extract_title(doc)
        
        # Create metadata
        meta = DocumentMeta(
            id=str(uuid.uuid4()),
            title=title,
            type='other',  # Will be inferred later
            created_at=datetime.utcnow().isoformat(),
            updated_at=datetime.utcnow().isoformat(),
            source_file=docx_path.split('/')[-1],
            ingestion_version="1.0.0"
        )
        
        # Parse sections and paragraphs
        sections = self._parse_sections(doc)
        
        # Extract citations
        citations = self._extract_citations(sections)
        
        # Build LegalDocument
        legal_doc = LegalDocument(
            meta=meta,
            body=DocumentBody(sections=sections),
            citations=citations,
            embedded_objects=[]  # TODO: Extract images/tables
        )
        
        return legal_doc
    
    def _extract_title(self, doc: DocxDocument) -> str:
        """Extract document title from first paragraph or properties"""
        if doc.paragraphs and doc.paragraphs[0].text.strip():
            return doc.paragraphs[0].text.strip()
        return "Untitled Document"
    
    def _parse_sections(self, doc: DocxDocument) -> List[Section]:
        """Parse document into hierarchical sections"""
        sections: List[Section] = []
        current_section: Optional[Section] = None
        
        for para in doc.paragraphs:
            para_text = para.text.strip()
            
            if not para_text:
                continue
            
            # Detect if this paragraph is a section heading
            is_heading, level, number = self.section_detector.detect(para)
            
            if is_heading:
                # Create new section
                section = Section(
                    id=str(uuid.uuid4()),
                    parent_section_id=None,  # TODO: Handle nesting
                    title=para_text,
                    number=number,
                    level=level,
                    type='unknown',  # TODO: Infer section type
                    children=[],
                    paragraphs=[]
                )
                
                if level == 1:
                    sections.append(section)
                    current_section = section
                else:
                    # Nested section (simplified - just add to last top-level)
                    if current_section:
                        section.parent_section_id = current_section.id
                        current_section.children.append(section)
            
            else:
                # Regular paragraph
                if current_section is None:
                    # Create default section for paragraphs before first heading
                    current_section = Section(
                        id=str(uuid.uuid4()),
                        parent_section_id=None,
                        title="Document",
                        level=1,
                        type='unknown',
                        children=[],
                        paragraphs=[]
                    )
                    sections.append(current_section)
                
                # Parse paragraph
                paragraph = self._parse_paragraph(para, current_section.id)
                current_section.paragraphs.append(paragraph)
        
        return sections
    
    def _parse_paragraph(self, docx_para: DocxParagraph, parent_section_id: str) -> Paragraph:
        """Parse a DOCX paragraph into Paragraph model"""
        para_id = str(uuid.uuid4())
        text = docx_para.text
        
        # Extract formatting
        format_marks = extract_format_marks(docx_para)
        
        # Preserve XML for round-trip
        preservation = self._preserve_paragraph_xml(docx_para)
        
        # Split into sentences
        sentences = self._split_sentences(text, para_id)
        
        paragraph = Paragraph(
            id=para_id,
            parent_section_id=parent_section_id,
            text=text,
            format_spans=format_marks,
            sentences=sentences,
            preservation=preservation
        )
        
        return paragraph
    
    def _split_sentences(self, text: str, para_id: str) -> List[Sentence]:
        """Split paragraph text into sentences"""
        sentence_spans = self.sentence_splitter.split(text)
        
        sentences = []
        for i, (start, end) in enumerate(sentence_spans):
            sentence_text = text[start:end]
            
            # Detect citations in sentence
            citation_spans = self.citation_detector.detect(sentence_text)
            
            # Adjust citation offsets to be relative to sentence start
            adjusted_citations = [
                CitationSpan(
                    start=cs.start,
                    end=cs.end,
                    text=cs.text,
                    type=cs.type,
                    citation_id=str(uuid.uuid4())
                )
                for cs in citation_spans
            ]
            
            sentence = Sentence(
                id=str(uuid.uuid4()),
                parent_paragraph_id=para_id,
                start_offset=start,
                end_offset=end,
                text=sentence_text,
                format_spans=[],  # TODO: Extract sentence-level formatting
                citations=adjusted_citations
            )
            sentences.append(sentence)
        
        return sentences
    
    def _preserve_paragraph_xml(self, para: DocxParagraph) -> Dict[str, str]:
        """Preserve paragraph XML for round-trip fidelity"""
        xml_element = para._element
        xml_str = etree.tostring(xml_element, encoding='unicode')
        
        return {
            'paragraph_xml': xml_str
        }
    
    def _extract_citations(self, sections: List[Section]) -> List[Citation]:
        """Extract all citations from sections into registry"""
        citations_map: Dict[str, Citation] = {}
        
        for section in sections:
            for paragraph in section.paragraphs:
                for sentence in paragraph.sentences:
                    for cit_span in sentence.citations:
                        cit_id = cit_span.citation_id
                        
                        if cit_id not in citations_map:
                            # Create new citation registry entry
                            citation = Citation(
                                id=cit_id,
                                type=cit_span.type,
                                full_text=cit_span.text,
                                sentence_ids=[sentence.id]
                            )
                            citations_map[cit_id] = citation
                        else:
                            # Add sentence to existing citation
                            citations_map[cit_id].sentence_ids.append(sentence.id)
        
        return list(citations_map.values())
```

---

### 3.2 Section Detector

**File:** `services/ingestion-service/app/parsers/section_detector.py`

**Action:** CREATE

**Content:**
```python
import re
from docx.text.paragraph import Paragraph
from typing import Tuple, Optional


class SectionDetector:
    """Detect section headings and hierarchy levels"""
    
    # Common heading patterns
    PATTERNS = [
        # Roman numerals: I., II., III.
        (r'^\s*([IVX]+)\.\s+', 1),
        # Capital letters: A., B., C.
        (r'^\s*([A-Z])\.\s+', 2),
        # Numbers: 1., 2., 3.
        (r'^\s*(\d+)\.\s+', 3),
        # Lowercase letters: a., b., c.
        (r'^\s*([a-z])\.\s+', 4),
        # Lowercase roman: i., ii., iii.
        (r'^\s*([ivx]+)\.\s+', 5),
    ]
    
    def detect(self, para: Paragraph) -> Tuple[bool, int, Optional[str]]:
        """
        Detect if paragraph is a section heading.
        
        Args:
            para: DOCX paragraph
            
        Returns:
            Tuple of (is_heading, level, number)
        """
        text = para.text.strip()
        
        # Check for heading styles
        if para.style.name.startswith('Heading'):
            level = int(para.style.name.replace('Heading ', ''))
            number = self._extract_number(text)
            return (True, level, number)
        
        # Check for numbered patterns
        for pattern, level in self.PATTERNS:
            match = re.match(pattern, text)
            if match:
                number = match.group(1)
                return (True, level, number)
        
        # Check for bold all-caps (common for headings)
        if self._is_bold(para) and text.isupper() and len(text) < 100:
            return (True, 1, None)
        
        return (False, 0, None)
    
    def _extract_number(self, text: str) -> Optional[str]:
        """Extract section number from text"""
        for pattern, _ in self.PATTERNS:
            match = re.match(pattern, text)
            if match:
                return match.group(1)
        return None
    
    def _is_bold(self, para: Paragraph) -> bool:
        """Check if paragraph is bold"""
        if not para.runs:
            return False
        return all(run.bold for run in para.runs if run.text.strip())
```

---

### 3.3 Sentence Splitter

**File:** `services/ingestion-service/app/parsers/sentence_splitter.py`

**Action:** CREATE

**Content:**
```python
import re
from typing import List, Tuple


class SentenceSplitter:
    """Split paragraph text into sentences (citation-aware)"""
    
    # Legal citation patterns (simplified)
    CITATION_PATTERNS = [
        r'\d+\s+[A-Z][a-z\.]+\s+\d+',  # 123 F.3d 456
        r'\d+\s+U\.S\.\s+\d+',          # 123 U.S. 456
        r'Id\.\s+at\s+\d+',             # Id. at 123
    ]
    
    def split(self, text: str) -> List[Tuple[int, int]]:
        """
        Split text into sentence boundaries.
        
        Args:
            text: Paragraph text
            
        Returns:
            List of (start, end) tuples (character offsets)
        """
        # Protect citations from being split
        protected_text = self._protect_citations(text)
        
        # Split on sentence boundaries
        sentences = []
        current_start = 0
        
        # Use regex to find sentence-ending punctuation
        pattern = r'([.!?])\s+'
        
        for match in re.finditer(pattern, protected_text):
            end_pos = match.end()
            
            # Don't split on abbreviations or citations
            if not self._is_abbreviation(protected_text, match.start()):
                sentence_text = text[current_start:end_pos].strip()
                if sentence_text:
                    sentences.append((current_start, end_pos))
                current_start = end_pos
        
        # Add final sentence (if any text remains)
        if current_start < len(text):
            final_text = text[current_start:].strip()
            if final_text:
                sentences.append((current_start, len(text)))
        
        # If no sentences found, return whole text as one sentence
        if not sentences:
            sentences.append((0, len(text)))
        
        return sentences
    
    def _protect_citations(self, text: str) -> str:
        """Replace citation periods with placeholders"""
        protected = text
        for pattern in self.CITATION_PATTERNS:
            protected = re.sub(pattern, lambda m: m.group(0).replace('.', '●'), protected)
        return protected
    
    def _is_abbreviation(self, text: str, pos: int) -> bool:
        """Check if period is part of an abbreviation"""
        # Common abbreviations
        abbrevs = ['Mr.', 'Mrs.', 'Dr.', 'U.S.', 'Inc.', 'Corp.', 'Ltd.', 'etc.', 'e.g.', 'i.e.']
        
        # Check if any abbreviation ends at this position
        for abbrev in abbrevs:
            start = pos - len(abbrev) + 1
            if start >= 0 and text[start:pos+1] == abbrev:
                return True
        
        return False
```

---

### 3.4 Citation Detector

**File:** `services/ingestion-service/app/parsers/citation_detector.py`

**Action:** CREATE

**Content:**
```python
import re
from typing import List
from app.models.legal_document import CitationSpan


class CitationDetector:
    """Detect citations in sentence text"""
    
    # Citation patterns with types
    PATTERNS = [
        # Case citations: 123 F.3d 456
        (r'\d+\s+[A-Z][a-z\.]+\s+\d+,?\s+\d+', 'case'),
        # U.S. Supreme Court: 123 U.S. 456
        (r'\d+\s+U\.S\.\s+\d+', 'case'),
        # Statute: 42 U.S.C. § 1983
        (r'\d+\s+U\.S\.C\.\s+§\s+\d+', 'statute'),
        # Short form: Id.
        (r'Id\.(\s+at\s+\d+)?', 'id'),
        # Supra: Smith, supra
        (r'[A-Z][a-z]+,\s+supra', 'supra'),
        # Exhibit: Exhibit A
        (r'Exhibit\s+[A-Z\d]', 'exhibit'),
    ]
    
    def detect(self, text: str) -> List[CitationSpan]:
        """
        Detect citations in sentence text.
        
        Args:
            text: Sentence text
            
        Returns:
            List of CitationSpan objects
        """
        citations = []
        
        for pattern, cit_type in self.PATTERNS:
            for match in re.finditer(pattern, text):
                citation = CitationSpan(
                    start=match.start(),
                    end=match.end(),
                    text=match.group(0),
                    type=cit_type,
                    citation_id=""  # Will be set by parser
                )
                citations.append(citation)
        
        # Sort by position
        citations.sort(key=lambda c: c.start)
        
        # Remove overlapping citations (keep longest)
        filtered = []
        for cit in citations:
            if not filtered or cit.start >= filtered[-1].end:
                filtered.append(cit)
        
        return filtered
```

---

### 3.5 Formatting Utilities

**File:** `services/ingestion-service/app/utils/formatting.py`

**Action:** CREATE

**Content:**
```python
from docx.text.paragraph import Paragraph
from typing import List
from app.models.legal_document import FormatMark


def extract_format_marks(para: Paragraph) -> List[FormatMark]:
    """
    Extract formatting marks from DOCX paragraph.
    
    Args:
        para: DOCX paragraph
        
    Returns:
        List of FormatMark objects with character offsets
    """
    format_marks = []
    char_offset = 0
    
    for run in para.runs:
        run_text = run.text
        run_length = len(run_text)
        
        if run_length == 0:
            continue
        
        # Check for formatting
        if run.bold:
            format_marks.append(FormatMark(
                start=char_offset,
                end=char_offset + run_length,
                format='bold'
            ))
        
        if run.italic:
            format_marks.append(FormatMark(
                start=char_offset,
                end=char_offset + run_length,
                format='italic'
            ))
        
        if run.underline:
            format_marks.append(FormatMark(
                start=char_offset,
                end=char_offset + run_length,
                format='underline'
            ))
        
        # Track font if specified
        if run.font.name:
            format_marks.append(FormatMark(
                start=char_offset,
                end=char_offset + run_length,
                format='font',
                font=run.font.name
            ))
        
        char_offset += run_length
    
    return format_marks
```

---

## Task 4: Ingestion Service

**File:** `services/ingestion-service/app/services/ingestion_service.py`

**Action:** CREATE

**Content:**
```python
from app.parsers.docx_parser import DocxParser
from app.models.legal_document import LegalDocument
import logging

logger = logging.getLogger(__name__)


class IngestionService:
    """High-level ingestion service"""
    
    def __init__(self):
        self.parser = DocxParser()
    
    def process_docx(self, docx_path: str) -> LegalDocument:
        """
        Process a DOCX file into LegalDocument format.
        
        Args:
            docx_path: Path to DOCX file
            
        Returns:
            LegalDocument: Parsed document
            
        Raises:
            Exception: If parsing fails
        """
        logger.info(f"Processing DOCX: {docx_path}")
        
        try:
            legal_doc = self.parser.parse(docx_path)
            logger.info(f"Successfully parsed document: {legal_doc.meta.title}")
            return legal_doc
        
        except Exception as e:
            logger.error(f"Failed to parse DOCX: {str(e)}", exc_info=True)
            raise
```

---

## Task 5: Tests

### 5.1 Test Fixtures

**File:** `services/ingestion-service/tests/fixtures/sample_motion.docx`

**Action:** CREATE a sample DOCX file

**Content:** Create a simple DOCX with:
- Title: "Motion to Dismiss"
- Section I: "Introduction"
- A few paragraphs with citations
- Section II: "Argument"
- More paragraphs

---

### 5.2 Integration Tests

**File:** `services/ingestion-service/tests/integration/test_ingest_endpoint.py`

**Action:** CREATE

**Content:**
```python
import pytest
from httpx import AsyncClient
from pathlib import Path

from main import app


@pytest.mark.asyncio
async def test_ingest_valid_docx():
    """Test ingesting a valid DOCX file"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Load test DOCX
        docx_path = Path(__file__).parent.parent / "fixtures" / "sample_motion.docx"
        
        with open(docx_path, "rb") as f:
            files = {"file": ("sample_motion.docx", f, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
            response = await client.post("/ingest", files=files)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify LegalDocument structure
        assert "meta" in data
        assert "body" in data
        assert "citations" in data
        
        # Verify metadata
        assert data["meta"]["title"]
        assert data["meta"]["type"]
        
        # Verify body has sections
        assert len(data["body"]["sections"]) > 0
        
        # Verify sections have paragraphs
        section = data["body"]["sections"][0]
        assert len(section["paragraphs"]) > 0
        
        # Verify paragraphs have sentences
        paragraph = section["paragraphs"][0]
        assert len(paragraph["sentences"]) > 0


@pytest.mark.asyncio
async def test_ingest_invalid_file_type():
    """Test rejecting non-DOCX files"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        files = {"file": ("test.txt", b"not a docx", "text/plain")}
        response = await client.post("/ingest", files=files)
        
        assert response.status_code == 400
        assert "must be a .docx" in response.json()["detail"]


@pytest.mark.asyncio
async def test_health_check():
    """Test health check endpoint"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "ingestion-service"
```

---

## Task 6: Verification (from Runbook 0 Section 19.4)

### 6.1 Service Structure
- [ ] Python/FastAPI service on port 3002
- [ ] DOCX parsing with python-docx
- [ ] Section/paragraph/sentence extraction
- [ ] Citation detection
- [ ] Format preservation (XML round-trip)

### 6.2 LegalDocument Output
- [ ] Conforms to Section 4 schema
- [ ] Valid DocumentMeta
- [ ] Hierarchical sections (Section 4.4)
- [ ] Sentence overlays (Section 4.5)
- [ ] Format marks (Section 4.6)
- [ ] Citations (Section 4.7)
- [ ] Preservation metadata (Section 4.9)

### 6.3 Service API
- [ ] POST /ingest accepts DOCX upload
- [ ] Returns LegalDocument JSON
- [ ] Validates file type
- [ ] Error handling for invalid files

### 6.4 Tests
- [ ] Integration tests with real DOCX samples
- [ ] All tests pass
- [ ] Edge cases handled (empty sections, no citations, etc.)

### 6.5 Cross-Reference
- [ ] Output matches Runbook 0 Section 4 exactly
- [ ] Parsing follows Section 9 specifications
- [ ] Ready for Runbook 5 (Export Service)

---

## Success Criteria

✅ Service runs on port 3002  
✅ Accepts DOCX uploads  
✅ Returns valid LegalDocument  
✅ Sections detected correctly  
✅ Sentences split properly  
✅ Citations detected  
✅ Formatting preserved  
✅ All tests pass  
✅ Ready for Runbook 5 (Export Service)  

---

## Next Steps

After Runbook 4 is complete:

1. **Start service:** `python main.py`
2. **Test health check:** `curl http://localhost:3002/health`
3. **Test ingestion:** Upload a DOCX file
4. **Run tests:** `pytest`
5. **Proceed to Runbook 5:** Export Service (LegalDocument → DOCX)

---

## Reference

- **Runbook 0 Section 4:** LegalDocument Schema (output format)
- **Runbook 0 Section 9:** Ingestion Pipeline
- **Runbook 0 Section 15.4:** Ingestion Service Technology
- **Runbook 0 Section 19.4:** Verification Criteria
- **Runbook 1:** TypeScript types (compare with Python models)

---

**End of Runbook 4**
