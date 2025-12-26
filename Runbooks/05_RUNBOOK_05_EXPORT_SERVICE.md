# Runbook 5: Export Service - LegalDocument → DOCX Converter

**Phase:** Foundation (Critical Path)  
**Estimated Time:** 8-10 hours  
**Prerequisites:** Runbooks 1-4 complete  
**Depends On:** Runbook 0 Sections 4, 10, 15.5, 19.5  
**Enables:** Runbooks 6-15 (document export capability)

---

## Objective

Create the **Export Service** - Python/FastAPI microservice that converts LegalDocument format to DOCX with perfect round-trip fidelity.

**Success Criteria:**
- ✅ Service runs on port 3003
- ✅ Accepts LegalDocument JSON via POST /export
- ✅ Generates valid DOCX files
- ✅ Preserves formatting (bold, italic, underline)
- ✅ Preserves structure (sections, paragraphs, sentences)
- ✅ Round-trip fidelity (ingestion → export → ingestion yields identical structure)
- ✅ Uses preservation metadata from Section 4.9
- ✅ Tests pass with round-trip validation

---

## Context from Runbook 0

**Referenced Sections:**
- **Section 4:** LegalDocument Schema (input format)
  - **Section 4.2:** Core Structure
  - **Section 4.4:** Hierarchical Structure
  - **Section 4.6:** Formatting (FormatMark)
  - **Section 4.9:** Preservation Metadata (XML round-trip)
- **Section 10:** Export Pipeline
  - **Section 10.1:** LegalDocument → DOCX conversion
  - **Section 10.2:** Format reconstruction
  - **Section 10.3:** Round-trip validation
- **Section 15.5:** Technology Stack - Export Service
  - Python 3.11+
  - FastAPI
  - python-docx for DOCX generation
  - lxml for XML reconstruction
- **Section 19.5:** Runbook 5 Verification Criteria

**Key Principle from Runbook 0:**
> "Export must achieve perfect round-trip fidelity. If a document is ingested, then exported, then ingested again, the second LegalDocument must be structurally identical to the first."

---

## Current State

**What exists:**
- ✅ Ingestion Service (Runbook 4) produces LegalDocument
- ✅ LegalDocument schema defined (Runbook 0 Section 4)
- ✅ Preservation metadata pattern (Section 4.9)
- ❌ No export capability
- ❌ No DOCX generation

**What this creates:**
- ✅ `services/export-service/` with Python structure
- ✅ FastAPI service on port 3003
- ✅ LegalDocument → DOCX converter
- ✅ Format reconstruction from FormatMark
- ✅ Section/paragraph structure reconstruction
- ✅ XML preservation utilization (round-trip)
- ✅ Test suite with round-trip validation

---

## Task 1: Create Service Structure

### 1.1 Create Directory Structure

**Location:** services/

**Action:** CREATE new directories

```bash
# From repository root
mkdir -p services/export-service/app/{api,services,exporters,utils,models}
mkdir -p services/export-service/tests/{unit,integration,fixtures}
mkdir -p services/export-service/tests/fixtures/{legal_documents,output}
```

**Verification:**
```bash
tree services/export-service -L 3

# Expected output:
# services/export-service/
# ├── app/
# │   ├── api/
# │   ├── services/
# │   ├── exporters/
# │   ├── utils/
# │   └── models/
# ├── tests/
# │   ├── unit/
# │   ├── integration/
# │   └── fixtures/
# │       ├── legal_documents/
# │       └── output/
# ├── requirements.txt
# ├── pyproject.toml
# └── main.py
```

---

### 1.2 Create requirements.txt

**File:** `services/export-service/requirements.txt`

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

### 1.3 Create main.py

**File:** `services/export-service/main.py`

**Action:** CREATE

**Content:**
```python
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import logging
import tempfile
import os
from pathlib import Path

from app.services.export_service import ExportService
from app.models.legal_document import LegalDocument

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="FACTSWAY Export Service",
    description="LegalDocument to DOCX export service with round-trip fidelity",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize export service
export_service = ExportService()


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "export-service",
        "port": 3003,
    }


@app.post("/export")
async def export_to_docx(legal_document: LegalDocument):
    """
    Export LegalDocument to DOCX file.
    
    Args:
        legal_document: LegalDocument JSON
        
    Returns:
        FileResponse: DOCX file download
        
    Raises:
        HTTPException: If export fails
    """
    try:
        logger.info(f"Exporting document: {legal_document.meta.title}")
        
        # Create temporary file for output
        temp_path = tempfile.mktemp(suffix='.docx')
        
        # Export to DOCX
        export_service.export_to_docx(legal_document, temp_path)
        
        logger.info(f"Successfully exported: {legal_document.meta.title}")
        
        # Return DOCX file
        filename = f"{legal_document.meta.title.replace(' ', '_')}.docx"
        
        return FileResponse(
            path=temp_path,
            filename=filename,
            media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            background=None  # Keep file until sent
        )
        
    except Exception as e:
        logger.error(f"Error exporting document: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error exporting document: {str(e)}"
        )


@app.get("/")
async def root():
    """Root endpoint with service info"""
    return {
        "service": "export-service",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "export": "/export (POST)",
        }
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=3003,
        reload=True,
        log_level="info"
    )
```

---

## Task 2: Data Models (Reuse from Ingestion)

### 2.1 LegalDocument Model

**File:** `services/export-service/app/models/legal_document.py`

**Action:** CREATE (copy from Runbook 4)

**Content:** Same as Runbook 4's legal_document.py

**Note:** In production, this would be a shared package, but for runbook clarity, we duplicate the model definitions.

---

## Task 3: DOCX Export

### 3.1 DOCX Exporter

**File:** `services/export-service/app/exporters/docx_exporter.py`

**Action:** CREATE

**Content:**
```python
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import parse_xml
from lxml import etree
import logging
from typing import Optional

from app.models.legal_document import (
    LegalDocument, Section, Paragraph, FormatMark
)

logger = logging.getLogger(__name__)


class DocxExporter:
    """Export LegalDocument to DOCX format"""
    
    def export(self, legal_doc: LegalDocument, output_path: str) -> None:
        """
        Export LegalDocument to DOCX file.
        
        Args:
            legal_doc: LegalDocument to export
            output_path: Path to save DOCX file
        """
        doc = Document()
        
        # Set document title
        self._add_title(doc, legal_doc.meta.title)
        
        # Export sections
        for section in legal_doc.body.sections:
            self._export_section(doc, section, level=1)
        
        # Save document
        doc.save(output_path)
        logger.info(f"Exported document to: {output_path}")
    
    def _add_title(self, doc: Document, title: str) -> None:
        """Add document title as heading"""
        heading = doc.add_heading(title, level=0)
        heading.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    def _export_section(self, doc: Document, section: Section, level: int) -> None:
        """
        Export a section with its paragraphs and subsections.
        
        Args:
            doc: DOCX document
            section: Section to export
            level: Heading level (1-9)
        """
        # Add section heading
        if section.title:
            heading_text = section.title
            if section.number:
                heading_text = f"{section.number}. {heading_text}"
            
            doc.add_heading(heading_text, level=min(level, 9))
        
        # Add paragraphs
        for paragraph in section.paragraphs:
            self._export_paragraph(doc, paragraph)
        
        # Export child sections (recursively)
        for child_section in section.children:
            self._export_section(doc, child_section, level + 1)
    
    def _export_paragraph(self, doc: Document, para: Paragraph) -> None:
        """
        Export a paragraph with formatting.
        
        Args:
            doc: DOCX document
            para: Paragraph to export
        """
        # Try to use preserved XML if available
        if para.preservation and 'paragraph_xml' in para.preservation:
            try:
                self._restore_from_xml(doc, para)
                return
            except Exception as e:
                logger.warning(f"Failed to restore from XML, using fallback: {e}")
        
        # Fallback: reconstruct from text and format marks
        docx_para = doc.add_paragraph()
        
        # Apply paragraph formatting
        if para.alignment:
            alignment_map = {
                'left': WD_ALIGN_PARAGRAPH.LEFT,
                'center': WD_ALIGN_PARAGRAPH.CENTER,
                'right': WD_ALIGN_PARAGRAPH.RIGHT,
                'justify': WD_ALIGN_PARAGRAPH.JUSTIFY,
            }
            docx_para.alignment = alignment_map.get(para.alignment, WD_ALIGN_PARAGRAPH.LEFT)
        
        if para.indent_left:
            docx_para.paragraph_format.left_indent = Inches(para.indent_left / 1440)
        
        if para.indent_right:
            docx_para.paragraph_format.right_indent = Inches(para.indent_right / 1440)
        
        # Add text with formatting
        self._add_formatted_text(docx_para, para.text, para.format_spans)
    
    def _add_formatted_text(self, docx_para, text: str, format_marks: list[FormatMark]) -> None:
        """
        Add text to paragraph with formatting marks applied.
        
        Args:
            docx_para: DOCX paragraph
            text: Paragraph text
            format_marks: List of FormatMark objects
        """
        if not format_marks:
            # No formatting - add plain text
            docx_para.add_run(text)
            return
        
        # Sort format marks by start position
        sorted_marks = sorted(format_marks, key=lambda m: m.start)
        
        # Build runs with formatting
        current_pos = 0
        active_formats = {}
        
        # Create events for format start/end
        events = []
        for mark in sorted_marks:
            events.append(('start', mark.start, mark))
            events.append(('end', mark.end, mark))
        events.sort(key=lambda e: e[1])
        
        # Process text character by character with format changes
        i = 0
        while i < len(events):
            event_type, pos, mark = events[i]
            
            # Add text before this event
            if pos > current_pos:
                run = docx_para.add_run(text[current_pos:pos])
                self._apply_formats(run, active_formats)
            
            # Update active formats
            if event_type == 'start':
                active_formats[mark.format] = mark
            else:
                active_formats.pop(mark.format, None)
            
            current_pos = pos
            i += 1
        
        # Add remaining text
        if current_pos < len(text):
            run = docx_para.add_run(text[current_pos:])
            self._apply_formats(run, active_formats)
    
    def _apply_formats(self, run, formats: dict) -> None:
        """Apply formatting to a run"""
        for format_type, mark in formats.items():
            if format_type == 'bold':
                run.bold = True
            elif format_type == 'italic':
                run.italic = True
            elif format_type == 'underline':
                run.underline = True
            elif format_type == 'font' and mark.font:
                run.font.name = mark.font
            elif format_type == 'fontSize' and mark.fontSize:
                run.font.size = Pt(mark.fontSize)
    
    def _restore_from_xml(self, doc: Document, para: Paragraph) -> None:
        """
        Restore paragraph from preserved XML (perfect round-trip).
        
        Args:
            doc: DOCX document
            para: Paragraph with preservation metadata
        """
        xml_str = para.preservation['paragraph_xml']
        
        # Parse XML
        xml_element = parse_xml(xml_str)
        
        # Add to document
        doc._element.body.append(xml_element)
        
        logger.debug("Restored paragraph from preserved XML")
```

---

### 3.2 Format Utilities

**File:** `services/export-service/app/utils/format_utils.py`

**Action:** CREATE

**Content:**
```python
from app.models.legal_document import FormatMark
from typing import List, Tuple


def merge_overlapping_formats(format_marks: List[FormatMark]) -> List[FormatMark]:
    """
    Merge overlapping format marks of the same type.
    
    Args:
        format_marks: List of FormatMark objects
        
    Returns:
        List of merged FormatMark objects
    """
    if not format_marks:
        return []
    
    # Group by format type
    by_type = {}
    for mark in format_marks:
        key = mark.format
        if key not in by_type:
            by_type[key] = []
        by_type[key].append(mark)
    
    # Merge each type separately
    merged = []
    for format_type, marks in by_type.items():
        # Sort by start position
        sorted_marks = sorted(marks, key=lambda m: m.start)
        
        # Merge overlapping
        current = sorted_marks[0]
        for next_mark in sorted_marks[1:]:
            if next_mark.start <= current.end:
                # Overlapping - extend current
                current.end = max(current.end, next_mark.end)
            else:
                # Gap - save current and start new
                merged.append(current)
                current = next_mark
        
        # Add last mark
        merged.append(current)
    
    return merged


def split_format_at_boundaries(
    text: str,
    format_marks: List[FormatMark]
) -> List[Tuple[str, List[str]]]:
    """
    Split text into segments with their active formats.
    
    Args:
        text: Paragraph text
        format_marks: List of FormatMark objects
        
    Returns:
        List of (text_segment, active_formats) tuples
    """
    if not format_marks:
        return [(text, [])]
    
    # Create boundary events
    events = []
    for mark in format_marks:
        events.append((mark.start, 'start', mark.format))
        events.append((mark.end, 'end', mark.format))
    
    # Sort by position
    events.sort()
    
    # Build segments
    segments = []
    active_formats = set()
    prev_pos = 0
    
    for pos, event_type, format_type in events:
        # Add segment before this boundary
        if pos > prev_pos:
            segment_text = text[prev_pos:pos]
            segments.append((segment_text, list(active_formats)))
        
        # Update active formats
        if event_type == 'start':
            active_formats.add(format_type)
        else:
            active_formats.discard(format_type)
        
        prev_pos = pos
    
    # Add final segment
    if prev_pos < len(text):
        segments.append((text[prev_pos:], list(active_formats)))
    
    return segments
```

---

## Task 4: Export Service

**File:** `services/export-service/app/services/export_service.py`

**Action:** CREATE

**Content:**
```python
from app.exporters.docx_exporter import DocxExporter
from app.models.legal_document import LegalDocument
import logging

logger = logging.getLogger(__name__)


class ExportService:
    """High-level export service"""
    
    def __init__(self):
        self.exporter = DocxExporter()
    
    def export_to_docx(self, legal_doc: LegalDocument, output_path: str) -> None:
        """
        Export LegalDocument to DOCX file.
        
        Args:
            legal_doc: LegalDocument to export
            output_path: Path to save DOCX file
            
        Raises:
            Exception: If export fails
        """
        logger.info(f"Exporting document: {legal_doc.meta.title}")
        
        try:
            self.exporter.export(legal_doc, output_path)
            logger.info(f"Successfully exported to: {output_path}")
        
        except Exception as e:
            logger.error(f"Failed to export: {str(e)}", exc_info=True)
            raise
```

---

## Task 5: Tests

### 5.1 Round-Trip Test

**File:** `services/export-service/tests/integration/test_round_trip.py`

**Action:** CREATE

**Content:**
```python
import pytest
import tempfile
import os
from pathlib import Path

from app.services.export_service import ExportService
from app.models.legal_document import (
    LegalDocument, DocumentMeta, DocumentBody, Section, Paragraph,
    Sentence, FormatMark
)

# Import ingestion service for round-trip validation
import sys
sys.path.append(str(Path(__file__).parent.parent.parent.parent / "ingestion-service"))
from app.services.ingestion_service import IngestionService


@pytest.fixture
def export_service():
    return ExportService()


@pytest.fixture
def ingestion_service():
    return IngestionService()


@pytest.fixture
def sample_legal_document():
    """Create a sample LegalDocument for testing"""
    return LegalDocument(
        meta=DocumentMeta(
            id="test-doc-1",
            title="Test Motion",
            type="motion",
            created_at="2024-12-26T00:00:00Z",
            updated_at="2024-12-26T00:00:00Z"
        ),
        body=DocumentBody(
            sections=[
                Section(
                    id="section-1",
                    parent_section_id=None,
                    title="Introduction",
                    number="I",
                    level=1,
                    type="introduction",
                    children=[],
                    paragraphs=[
                        Paragraph(
                            id="para-1",
                            parent_section_id="section-1",
                            text="This is a test paragraph with bold text.",
                            format_spans=[
                                FormatMark(start=30, end=34, format="bold")
                            ],
                            sentences=[
                                Sentence(
                                    id="sent-1",
                                    parent_paragraph_id="para-1",
                                    start_offset=0,
                                    end_offset=44,
                                    text="This is a test paragraph with bold text.",
                                    format_spans=[],
                                    citations=[]
                                )
                            ]
                        )
                    ]
                ),
                Section(
                    id="section-2",
                    parent_section_id=None,
                    title="Argument",
                    number="II",
                    level=1,
                    type="argument",
                    children=[],
                    paragraphs=[
                        Paragraph(
                            id="para-2",
                            parent_section_id="section-2",
                            text="Another paragraph with italic and underline text.",
                            format_spans=[
                                FormatMark(start=22, end=28, format="italic"),
                                FormatMark(start=33, end=42, format="underline")
                            ],
                            sentences=[
                                Sentence(
                                    id="sent-2",
                                    parent_paragraph_id="para-2",
                                    start_offset=0,
                                    end_offset=51,
                                    text="Another paragraph with italic and underline text.",
                                    format_spans=[],
                                    citations=[]
                                )
                            ]
                        )
                    ]
                )
            ]
        ),
        citations=[],
        embedded_objects=[]
    )


def test_export_creates_docx(export_service, sample_legal_document):
    """Test that export creates a valid DOCX file"""
    with tempfile.NamedTemporaryFile(suffix='.docx', delete=False) as tmp:
        output_path = tmp.name
    
    try:
        export_service.export_to_docx(sample_legal_document, output_path)
        
        # Verify file was created
        assert os.path.exists(output_path)
        assert os.path.getsize(output_path) > 0
        
    finally:
        if os.path.exists(output_path):
            os.unlink(output_path)


def test_round_trip_preserves_structure(export_service, ingestion_service, sample_legal_document):
    """
    Test that exporting then re-ingesting preserves document structure.
    
    This is the CRITICAL test for round-trip fidelity.
    """
    with tempfile.NamedTemporaryFile(suffix='.docx', delete=False) as tmp:
        output_path = tmp.name
    
    try:
        # Export to DOCX
        export_service.export_to_docx(sample_legal_document, output_path)
        
        # Re-ingest
        re_ingested = ingestion_service.process_docx(output_path)
        
        # Verify structure is preserved
        assert len(re_ingested.body.sections) == len(sample_legal_document.body.sections)
        
        for i, (original_section, new_section) in enumerate(
            zip(sample_legal_document.body.sections, re_ingested.body.sections)
        ):
            assert new_section.title == original_section.title
            assert new_section.number == original_section.number
            assert len(new_section.paragraphs) == len(original_section.paragraphs)
            
            for j, (original_para, new_para) in enumerate(
                zip(original_section.paragraphs, new_section.paragraphs)
            ):
                # Text should be identical
                assert new_para.text == original_para.text
                
                # Sentences should match
                assert len(new_para.sentences) == len(original_para.sentences)
        
    finally:
        if os.path.exists(output_path):
            os.unlink(output_path)


def test_export_preserves_formatting(export_service, ingestion_service, sample_legal_document):
    """Test that formatting marks are preserved through round-trip"""
    with tempfile.NamedTemporaryFile(suffix='.docx', delete=False) as tmp:
        output_path = tmp.name
    
    try:
        # Export
        export_service.export_to_docx(sample_legal_document, output_path)
        
        # Re-ingest
        re_ingested = ingestion_service.process_docx(output_path)
        
        # Check first paragraph has bold formatting
        first_para = re_ingested.body.sections[0].paragraphs[0]
        bold_marks = [m for m in first_para.format_spans if m.format == 'bold']
        assert len(bold_marks) > 0
        
        # Check second paragraph has italic formatting
        second_para = re_ingested.body.sections[1].paragraphs[0]
        italic_marks = [m for m in second_para.format_spans if m.format == 'italic']
        assert len(italic_marks) > 0
        
    finally:
        if os.path.exists(output_path):
            os.unlink(output_path)
```

---

### 5.2 Export Endpoint Tests

**File:** `services/export-service/tests/integration/test_export_endpoint.py`

**Action:** CREATE

**Content:**
```python
import pytest
from httpx import AsyncClient

from main import app
from app.models.legal_document import (
    LegalDocument, DocumentMeta, DocumentBody, Section, Paragraph, Sentence
)


@pytest.mark.asyncio
async def test_export_endpoint():
    """Test the export endpoint"""
    legal_doc = LegalDocument(
        meta=DocumentMeta(
            id="test-1",
            title="Test Document",
            type="motion",
            created_at="2024-12-26T00:00:00Z",
            updated_at="2024-12-26T00:00:00Z"
        ),
        body=DocumentBody(
            sections=[
                Section(
                    id="section-1",
                    title="Test Section",
                    level=1,
                    type="unknown",
                    paragraphs=[
                        Paragraph(
                            id="para-1",
                            parent_section_id="section-1",
                            text="Test paragraph text.",
                            sentences=[
                                Sentence(
                                    id="sent-1",
                                    parent_paragraph_id="para-1",
                                    start_offset=0,
                                    end_offset=20,
                                    text="Test paragraph text."
                                )
                            ]
                        )
                    ]
                )
            ]
        ),
        citations=[],
        embedded_objects=[]
    )
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/export",
            json=legal_doc.model_dump()
        )
        
        assert response.status_code == 200
        assert response.headers['content-type'] == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        assert len(response.content) > 0


@pytest.mark.asyncio
async def test_health_check():
    """Test health check endpoint"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "export-service"
```

---

## Task 6: Verification (from Runbook 0 Section 19.5)

### 6.1 Service Structure
- [ ] Python/FastAPI service on port 3003
- [ ] DOCX generation with python-docx
- [ ] Format reconstruction from FormatMark
- [ ] XML preservation utilization

### 6.2 Export Capability
- [ ] POST /export accepts LegalDocument JSON
- [ ] Returns valid DOCX file
- [ ] Preserves sections/paragraphs/sentences
- [ ] Preserves formatting (bold, italic, underline)
- [ ] Preserves paragraph properties (alignment, indents)

### 6.3 Round-Trip Fidelity
- [ ] Export → Re-ingest yields identical structure
- [ ] Text content preserved exactly
- [ ] Formatting marks preserved
- [ ] Section hierarchy preserved
- [ ] Sentence boundaries preserved

### 6.4 Service API
- [ ] Health check endpoint works
- [ ] Export endpoint returns file
- [ ] Error handling for invalid input

### 6.5 Tests
- [ ] Round-trip tests pass
- [ ] Formatting preservation verified
- [ ] All tests pass

### 6.6 Cross-Reference
- [ ] Uses Section 4 LegalDocument format as input
- [ ] Implements Section 10 export pipeline
- [ ] Complements Runbook 4 (Ingestion)

---

## Success Criteria

✅ Service runs on port 3003  
✅ Accepts LegalDocument JSON  
✅ Generates valid DOCX  
✅ Round-trip fidelity achieved  
✅ Formatting preserved  
✅ Structure preserved  
✅ All tests pass  
✅ Ready for Runbook 6 (Specialized Services)  

---

## Next Steps

After Runbook 5 is complete:

1. **Start service:** `python main.py`
2. **Test health check:** `curl http://localhost:3003/health`
3. **Test export:** POST LegalDocument JSON to /export
4. **Run tests:** `pytest`
5. **Validate round-trip:** Ingest → Export → Ingest
6. **Proceed to Runbook 6:** Specialized Services

---

## Reference

- **Runbook 0 Section 4:** LegalDocument Schema (input)
- **Runbook 0 Section 10:** Export Pipeline
- **Runbook 0 Section 15.5:** Export Service Technology
- **Runbook 0 Section 19.5:** Verification Criteria
- **Runbook 4:** Ingestion Service (counterpart)

---

**End of Runbook 5**
