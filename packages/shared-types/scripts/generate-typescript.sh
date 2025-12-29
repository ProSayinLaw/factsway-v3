#!/bin/bash
set -e

echo "Generating TypeScript types from JSON Schema..."

cd "$(dirname "$0")/.."

# Install quicktype if not present
if ! command -v quicktype &> /dev/null; then
    echo "Installing quicktype..."
    npm install -g quicktype
fi

# Generate TypeScript types
quicktype schemas/legal-document.schema.json \
    --lang typescript \
    --src-lang schema \
    --out src/legal-document.types.ts \
    --just-types \
    --nice-property-names \
    --explicit-unions

echo "✓ TypeScript types generated: src/legal-document.types.ts"

# Verify it compiles
if command -v tsc &> /dev/null; then
    tsc --noEmit src/legal-document.types.ts && echo "✓ TypeScript types compile successfully"
fi
