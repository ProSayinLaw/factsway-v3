# CLAUDE CODE PROMPT: NUPunkt & Pandoc Verification

**Task:** Verify NUPunkt sentence tokenizer and Pandoc 3.6+ availability for FACTSWAY platform

**Time Estimate:** 2 hours  
**Repository:** /Users/alexcruz/Documents/4.0 UI and Backend 360

---

## CONTEXT

FACTSWAY uses:
1. **NUPunkt** - Advanced sentence tokenizer (91% accuracy vs NLTK's 85%)
2. **Pandoc 3.6+** - Document conversion with improved footnote handling

We need to verify both are available and working, with fallback plans documented.

---

## TASK 1: NUPunkt Verification

### **Create Test Script**

**File:** `scripts/test-nupunkt.py`

```python
#!/usr/bin/env python3
"""
Test NUPunkt sentence tokenizer with Texas legal text
Determines if NUPunkt is production-ready or if we need NLTK fallback
"""

import sys
from datetime import datetime

# Test sample - Texas legal text with complex citation patterns
SAMPLE_LEGAL_TEXT = """
Plaintiff moves the Court to compel discovery responses. See Tex. R. Civ. P. 215.
Defendant has failed to respond to Interrogatories Nos. 1-10 within the required 30-day 
deadline. Fed. R. Civ. P. 33(b)(2) requires timely responses. The Court in Smith v. Jones, 
123 S.W.3d 456, 459 (Tex. App.—Dallas 2003, no pet.), held that untimely responses may 
be deemed waived. Defendant's conduct violates Tex. R. Civ. P. 193.2(a).
"""

def test_nupunkt():
    """Test NUPunkt installation and accuracy"""
    
    print("=" * 60)
    print("NUPunkt Sentence Tokenizer Verification")
    print("=" * 60)
    print()
    
    # Test 1: Installation
    print("Test 1: Installation Check")
    try:
        from nupunkt import NUPunktSentenceTokenizer
        print("✓ NUPunkt installed successfully")
    except ImportError as e:
        print(f"✗ NUPunkt installation failed: {e}")
        print()
        print("FALLBACK REQUIRED: Use NLTK Punkt instead")
        print("Install with: pip install nltk")
        print("Trade-off: 85% accuracy (NLTK) vs 91% accuracy (NUPunkt)")
        return False
    
    print()
    
    # Test 2: Basic tokenization
    print("Test 2: Basic Tokenization")
    try:
        tokenizer = NUPunktSentenceTokenizer()
        sentences = tokenizer.tokenize(SAMPLE_LEGAL_TEXT)
        
        print(f"✓ Parsed {len(sentences)} sentences")
        print()
        print("Extracted sentences:")
        for i, sent in enumerate(sentences, 1):
            print(f"  {i}. {sent.strip()}")
        print()
        
    except Exception as e:
        print(f"✗ Tokenization failed: {e}")
        return False
    
    # Test 3: Expected results
    print("Test 3: Accuracy Check")
    
    # We expect 5 sentences:
    # 1. "Plaintiff moves the Court to compel discovery responses."
    # 2. "See Tex. R. Civ. P. 215."
    # 3. "Defendant has failed to respond to Interrogatories Nos. 1-10 within the required 30-day deadline."
    # 4. "Fed. R. Civ. P. 33(b)(2) requires timely responses."
    # 5. "The Court in Smith v. Jones, 123 S.W.3d 456, 459 (Tex. App.—Dallas 2003, no pet.), held that untimely responses may be deemed waived."
    # 6. "Defendant's conduct violates Tex. R. Civ. P. 193.2(a)."
    
    expected_count = 6
    
    if len(sentences) == expected_count:
        print(f"✓ Correct sentence count: {len(sentences)} (expected {expected_count})")
    else:
        print(f"⚠ Sentence count mismatch: {len(sentences)} (expected {expected_count})")
        print("  This may indicate issues with citation handling")
    
    print()
    
    # Test 4: Citation handling
    print("Test 4: Citation Pattern Handling")
    
    # Check if citations with abbreviations are handled correctly
    citation_test = "See Tex. R. Civ. P. 215. This is the next sentence."
    citation_sentences = tokenizer.tokenize(citation_test)
    
    if len(citation_sentences) == 2:
        print("✓ Citations with abbreviations handled correctly")
        print(f"  Sentence 1: {citation_sentences[0].strip()}")
        print(f"  Sentence 2: {citation_sentences[1].strip()}")
    else:
        print(f"⚠ Citation handling may have issues (got {len(citation_sentences)} sentences, expected 2)")
    
    print()
    
    # Final verdict
    print("=" * 60)
    print("VERDICT")
    print("=" * 60)
    
    if len(sentences) == expected_count and len(citation_sentences) == 2:
        print("✓ NUPunkt is PRODUCTION READY")
        print("  - Handles Texas legal citations correctly")
        print("  - 91% accuracy for sentence splitting")
        print("  - Recommended for use in ingestion-service")
        return True
    else:
        print("⚠ NUPunkt shows some issues")
        print("  Recommended action:")
        print("  1. Test with more legal text samples")
        print("  2. If issues persist, use NLTK Punkt fallback")
        print("  3. Document accuracy trade-off: 85% (NLTK) vs 91% (NUPunkt)")
        return False


def test_nltk_fallback():
    """Test NLTK Punkt as fallback option"""
    
    print()
    print("=" * 60)
    print("NLTK Punkt Fallback Test")
    print("=" * 60)
    print()
    
    try:
        import nltk
        from nltk.tokenize import sent_tokenize
        
        # Download punkt if not present
        try:
            nltk.data.find('tokenizers/punkt')
            print("✓ NLTK Punkt data already downloaded")
        except LookupError:
            print("Downloading NLTK Punkt data...")
            nltk.download('punkt', quiet=True)
            print("✓ NLTK Punkt data downloaded")
        
        print()
        
        # Test tokenization
        sentences = sent_tokenize(SAMPLE_LEGAL_TEXT)
        print(f"✓ NLTK parsed {len(sentences)} sentences")
        print()
        print("NLTK sentences:")
        for i, sent in enumerate(sentences, 1):
            print(f"  {i}. {sent.strip()}")
        
        print()
        print("NLTK Punkt is available as fallback")
        print("Trade-off: 85% accuracy vs NUPunkt's 91%")
        print("For MVP, this is acceptable")
        
        return True
        
    except ImportError:
        print("✗ NLTK not installed")
        print("Install with: pip install nltk")
        return False


if __name__ == '__main__':
    print(f"Test run: {datetime.now().isoformat()}")
    print()
    
    nupunkt_ok = test_nupunkt()
    
    if not nupunkt_ok:
        print()
        print("Testing fallback option...")
        nltk_ok = test_nltk_fallback()
        
        if not nltk_ok:
            print()
            print("✗ Neither NUPunkt nor NLTK available")
            print("  Action required: Install at least NLTK")
            sys.exit(1)
    
    print()
    print("=" * 60)
    print("✓ Sentence tokenization verified")
    print("=" * 60)
```

Make executable: `chmod +x scripts/test-nupunkt.py`

---

### **Run Test**

```bash
cd "/Users/alexcruz/Documents/4.0 UI and Backend 360"

# Try installing NUPunkt
pip install nupunkt --break-system-packages

# Run test
python3 scripts/test-nupunkt.py
```

---

### **Document Results**

**File:** `docs/NUPUNKT_VERIFICATION_REPORT.md`

```markdown
# NUPunkt Verification Report

**Date:** [AUTO-GENERATED]  
**Test Script:** `scripts/test-nupunkt.py`

## Summary

[FILL IN AFTER RUNNING TEST]

## Installation Status

- [ ] NUPunkt installed successfully
- [ ] NLTK Punkt installed (fallback)

## Test Results

### Legal Text Parsing

**Sample Text:** Texas legal motion with citations

**Results:**
- Sentences detected: [NUMBER]
- Expected: 6
- Accuracy: [PASS/FAIL]

### Citation Handling

**Test:** "See Tex. R. Civ. P. 215. This is the next sentence."

**Results:**
- Sentences detected: [NUMBER]
- Expected: 2
- Accuracy: [PASS/FAIL]

## Verdict

[CHOOSE ONE]

### ✓ PRODUCTION READY (NUPunkt)
NUPunkt handles Texas legal citations correctly with 91% accuracy.

**Recommendation:** Use NUPunkt in ingestion-service

### ⚠ USE FALLBACK (NLTK Punkt)
NUPunkt shows issues with citation patterns or is not available.

**Recommendation:** Use NLTK Punkt with 85% accuracy (acceptable for MVP)

**Implementation:**
```python
# ingestion-service/app/utils/sentence_splitter.py

try:
    from nupunkt import NUPunktSentenceTokenizer
    tokenizer = NUPunktSentenceTokenizer()
    USE_NUPUNKT = True
except ImportError:
    from nltk.tokenize import sent_tokenize
    USE_NUPUNKT = False

def split_sentences(text: str) -> list[str]:
    if USE_NUPUNKT:
        return tokenizer.tokenize(text)
    else:
        return sent_tokenize(text)
```

## Next Steps

- [ ] Document choice in Runbook 4
- [ ] Update ingestion-service dependencies
- [ ] Add fallback logic to sentence splitter
```

---

## TASK 2: Pandoc Verification

### **Create Test Script**

**File:** `scripts/test-pandoc.sh`

```bash
#!/bin/bash
set -e

echo "========================================="
echo "Pandoc 3.6+ Verification"
echo "========================================="
echo ""

# Test 1: Installation check
echo "Test 1: Installation Check"
if command -v pandoc &> /dev/null; then
    echo "✓ Pandoc is installed"
    
    PANDOC_VERSION=$(pandoc --version | head -1 | grep -oE '[0-9]+\.[0-9]+(\.[0-9]+)?')
    echo "  Version: $PANDOC_VERSION"
else
    echo "✗ Pandoc not installed"
    echo ""
    echo "INSTALLATION REQUIRED:"
    echo "  macOS: brew install pandoc"
    echo "  Linux: sudo apt install pandoc"
    echo "  Windows: Download from https://pandoc.org/installing.html"
    echo ""
    echo "For bundling with desktop app, we need version 3.6+"
    exit 1
fi

echo ""

# Test 2: Version check
echo "Test 2: Version Check (Need 3.6+)"

MAJOR=$(echo $PANDOC_VERSION | cut -d. -f1)
MINOR=$(echo $PANDOC_VERSION | cut -d. -f2)

if [ "$MAJOR" -gt 3 ] || ([ "$MAJOR" -eq 3 ] && [ "$MINOR" -ge 6 ]); then
    echo "✓ Pandoc version $PANDOC_VERSION meets requirements (≥3.6)"
else
    echo "⚠ Pandoc version $PANDOC_VERSION is below 3.6"
    echo "  Recommended: Upgrade to 3.6+ for improved footnote handling"
    echo "  macOS: brew upgrade pandoc"
fi

echo ""

# Test 3: Create test DOCX with footnotes
echo "Test 3: Footnote Handling Test"

# Create temporary directory
TEMP_DIR=$(mktemp -d)
echo "  Using temp directory: $TEMP_DIR"

# Create a simple HTML file with footnotes
cat > "$TEMP_DIR/test.html" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Footnote Test</title>
</head>
<body>
    <h1>Test Document</h1>
    
    <p>This is a paragraph with a footnote reference.<a href="#fn1" id="ref1"><sup>1</sup></a></p>
    
    <p>This is another paragraph with a footnote.<a href="#fn2" id="ref2"><sup>2</sup></a></p>
    
    <hr>
    
    <div id="footnotes">
        <p id="fn1"><sup>1</sup> This is the first footnote text. <a href="#ref1">↩</a></p>
        <p id="fn2"><sup>2</sup> This is the second footnote text. <a href="#ref2">↩</a></p>
    </div>
</body>
</html>
EOF

echo "  Created test HTML with footnotes"

# Convert HTML to DOCX
if pandoc "$TEMP_DIR/test.html" -o "$TEMP_DIR/test.docx" --standalone 2>/dev/null; then
    echo "✓ HTML → DOCX conversion successful"
else
    echo "✗ HTML → DOCX conversion failed"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Convert DOCX back to HTML to verify footnotes preserved
if pandoc "$TEMP_DIR/test.docx" -t html -o "$TEMP_DIR/output.html" --standalone 2>/dev/null; then
    echo "✓ DOCX → HTML conversion successful"
else
    echo "✗ DOCX → HTML conversion failed"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Check if footnotes are in output
if grep -q "footnote" "$TEMP_DIR/output.html" || grep -q "sup" "$TEMP_DIR/output.html"; then
    echo "✓ Footnotes preserved in round-trip conversion"
else
    echo "⚠ Footnotes may not be fully preserved"
    echo "  This could affect ingestion-service parsing"
fi

echo ""
echo "  Output HTML preview:"
echo "  ----------------------------------------"
head -20 "$TEMP_DIR/output.html"
echo "  ----------------------------------------"

# Cleanup
rm -rf "$TEMP_DIR"

echo ""

# Test 4: Check supported formats
echo "Test 4: Supported Formats"
echo "  Input formats:"
if pandoc --list-input-formats | grep -q "docx"; then
    echo "    ✓ DOCX"
fi
if pandoc --list-input-formats | grep -q "html"; then
    echo "    ✓ HTML"
fi

echo "  Output formats:"
if pandoc --list-output-formats | grep -q "docx"; then
    echo "    ✓ DOCX"
fi
if pandoc --list-output-formats | grep -q "html"; then
    echo "    ✓ HTML"
fi

echo ""

# Final summary
echo "========================================="
echo "PANDOC VERIFICATION SUMMARY"
echo "========================================="
echo ""
echo "Version: $PANDOC_VERSION"

if [ "$MAJOR" -gt 3 ] || ([ "$MAJOR" -eq 3 ] && [ "$MINOR" -ge 6 ]); then
    echo "Status: ✓ PRODUCTION READY"
    echo ""
    echo "Recommendation: Bundle Pandoc with desktop app"
    echo ""
    echo "Bundling Strategy:"
    echo "  - Windows: pandoc.exe (~100MB)"
    echo "  - macOS: pandoc (~100MB)"
    echo "  - Linux: pandoc (~100MB)"
    echo "  - Total: ~300MB across platforms"
    echo ""
    echo "Implementation in Runbook 10:"
    echo "  1. Download platform-specific binaries"
    echo "  2. Include in resources/ directory"
    echo "  3. Electron builder auto-packages"
else
    echo "Status: ⚠ UPGRADE RECOMMENDED"
    echo ""
    echo "Current: $PANDOC_VERSION"
    echo "Required: 3.6+"
    echo "Action: Upgrade Pandoc before bundling"
fi

echo ""
echo "========================================="
echo "✓ Verification complete"
echo "========================================="
```

Make executable: `chmod +x scripts/test-pandoc.sh`

---

### **Run Test**

```bash
cd "/Users/alexcruz/Documents/4.0 UI and Backend 360"

# Run Pandoc test
./scripts/test-pandoc.sh
```

---

### **Document Results**

**File:** `docs/PANDOC_BUNDLING_STRATEGY.md`

```markdown
# Pandoc Bundling Strategy

**Date:** [AUTO-GENERATED]  
**Test Script:** `scripts/test-pandoc.sh`

## Verification Results

**Installed Version:** [VERSION]  
**Status:** [PRODUCTION READY / NEEDS UPGRADE]

## Bundling for Desktop Distribution

### Why Bundle Pandoc?

Users won't have Pandoc installed. Bundling ensures "it just works" desktop experience.

### Size Analysis

**Per Platform:**
- Windows: pandoc.exe (~100MB)
- macOS (x64 + arm64): pandoc (~100MB each = 200MB)
- Linux: pandoc (~100MB)

**Total:** ~400MB across all platforms

**Is this acceptable?**
- Total FACTSWAY app: ~1GB (Electron + Pandoc + Python + assets)
- Competitive legal software: 600MB - 1.5GB
- **Verdict: YES, acceptable for desktop legal software**

### Implementation (Runbook 10)

#### 1. Download Platform Binaries

```bash
# Create resources directory
mkdir -p resources/pandoc/{win32,darwin-x64,darwin-arm64,linux}

# Windows
curl -L https://github.com/jgm/pandoc/releases/download/3.6/pandoc-3.6-windows-x86_64.zip \
  -o pandoc-win.zip
unzip pandoc-win.zip -d resources/pandoc/win32

# macOS x64
curl -L https://github.com/jgm/pandoc/releases/download/3.6/pandoc-3.6-macOS-x86_64.zip \
  -o pandoc-mac-x64.zip
unzip pandoc-mac-x64.zip -d resources/pandoc/darwin-x64

# macOS ARM64
curl -L https://github.com/jgm/pandoc/releases/download/3.6/pandoc-3.6-macOS-arm64.zip \
  -o pandoc-mac-arm64.zip
unzip pandoc-mac-arm64.zip -d resources/pandoc/darwin-arm64

# Linux
curl -L https://github.com/jgm/pandoc/releases/download/3.6/pandoc-3.6-linux-amd64.tar.gz \
  -o pandoc-linux.tar.gz
tar -xzf pandoc-linux.tar.gz -C resources/pandoc/linux
```

#### 2. Electron Builder Configuration

**File:** `electron-builder.yml`

```yaml
extraResources:
  - from: 'resources/pandoc/${os}'
    to: 'pandoc'
    filter:
      - '**/*'
```

#### 3. Runtime Detection

**File:** `src/main/services/pandoc.ts`

```typescript
import path from 'path'
import { app } from 'electron'

export function getPandocPath(): string {
  const resourcesPath = process.resourcesPath
  const platform = process.platform
  
  let pandocBinary: string
  
  switch (platform) {
    case 'win32':
      pandocBinary = 'pandoc.exe'
      break
    case 'darwin':
      pandocBinary = 'pandoc'
      break
    case 'linux':
      pandocBinary = 'pandoc'
      break
    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }
  
  return path.join(resourcesPath, 'pandoc', pandocBinary)
}

// Usage in ingestion-service
export async function convertDocxToHtml(docxPath: string): Promise<string> {
  const pandoc = getPandocPath()
  
  const result = await spawn(pandoc, [
    '-f', 'docx',
    '-t', 'html',
    '--standalone',
    docxPath
  ])
  
  return result.stdout
}
```

#### 4. Test Bundled Pandoc

After building desktop app, verify:

```bash
# Extract bundled Pandoc from built app
# macOS
/Applications/FACTSWAY.app/Contents/Resources/pandoc/pandoc --version

# Windows
C:\Program Files\FACTSWAY\resources\pandoc\pandoc.exe --version

# Should show: pandoc 3.6+
```

## Alternative: User Installation (NOT RECOMMENDED)

**Why not recommended:**
- User friction ("Install Pandoc before using FACTSWAY")
- Version conflicts with other software
- Support burden ("Pandoc not found" errors)
- Not true desktop app experience

**Verdict:** Bundle Pandoc. 300-400MB is acceptable for "just works" experience.

## LibreOffice Decision

**Runbook 0 mentioned LibreOffice for WYSIWYG PDF.**

**Decision: REMOVE LibreOffice**
- LibreOffice: ~500MB
- Alternative: Electron `printToPDF()` API
- Result: Save 500MB, same WYSIWYG result

**Update:** Remove LibreOffice from Runbook 0, use Electron printToPDF in Runbook 5

## Final Recommendation

✓ **Bundle Pandoc 3.6+ with desktop app**

**Total bundle impact:**
- Pandoc: ~300-400MB (all platforms)
- Worth it for "just works" user experience
- No user installation required
- Consistent version across all users

**Implementation:** Runbook 10 (add ~2-3 hours for bundling setup)
```

---

## SUCCESS CRITERIA

After running both tests, verify:

- [ ] NUPunkt test ran successfully (or NLTK fallback documented)
- [ ] Pandoc version checked (3.6+ or upgrade plan)
- [ ] Footnote handling tested
- [ ] NUPUNKT_VERIFICATION_REPORT.md created
- [ ] PANDOC_BUNDLING_STRATEGY.md created
- [ ] Bundling strategy documented for Runbook 10
- [ ] Decision on LibreOffice removal confirmed

---

## DELIVERABLES

1. `scripts/test-nupunkt.py` - Sentence tokenizer verification
2. `scripts/test-pandoc.sh` - Pandoc verification
3. `docs/NUPUNKT_VERIFICATION_REPORT.md` - Results and recommendation
4. `docs/PANDOC_BUNDLING_STRATEGY.md` - Bundling implementation plan

**Time:** 2 hours (1 hour each)

**Next:** Update Runbooks with results (final prep step)
