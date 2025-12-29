#!/bin/bash
set -e

echo "========================================="
echo "Generating Types from JSON Schema"
echo "========================================="

./scripts/generate-typescript.sh
echo ""
./scripts/generate-python.sh

echo ""
echo "========================================="
echo "✓ All types generated successfully"
echo "========================================="
