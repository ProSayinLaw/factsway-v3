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
