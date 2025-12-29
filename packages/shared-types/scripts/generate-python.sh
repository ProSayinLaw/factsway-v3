#!/bin/bash
set -e

echo "Generating Python Pydantic models from JSON Schema..."

cd "$(dirname "$0")/.."

# Install datamodel-code-generator if not present
if ! pip show datamodel-code-generator &> /dev/null; then
    echo "Installing datamodel-code-generator..."
    pip install datamodel-code-generator --break-system-packages
fi

# Generate Python models (Pydantic v2 compatible)
datamodel-codegen \
    --input schemas/legal-document.schema.json \
    --output python/legal_document.py \
    --target-python-version 3.11 \
    --use-standard-collections \
    --use-schema-description \
    --output-model-type pydantic_v2.BaseModel

echo "✓ Python models generated: python/legal_document.py"

# Verify it's valid Python
python3 -m py_compile python/legal_document.py && echo "✓ Python models compile successfully"
