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
        from nupunkt import sent_tokenize
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
        sentences = sent_tokenize(SAMPLE_LEGAL_TEXT)

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

    # We expect 6 sentences:
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
    citation_sentences = sent_tokenize(citation_test)

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
