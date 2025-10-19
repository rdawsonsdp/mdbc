#!/bin/bash
# Convert documentation to PDF
# Requires: pandoc (install with: brew install pandoc)

echo "📄 Converting Documentation to PDF"
echo "===================================="
echo ""

# Check if pandoc is installed
if ! command -v pandoc &> /dev/null; then
    echo "❌ pandoc not found!"
    echo ""
    echo "Install with:"
    echo "  brew install pandoc   (Mac)"
    echo "  apt install pandoc    (Linux)"
    echo "  choco install pandoc  (Windows)"
    echo ""
    exit 1
fi

# Create output directory
mkdir -p docs-pdf

# Convert main documents
echo "Converting QUICK_START_GUIDE.md..."
pandoc QUICK_START_GUIDE.md -o docs-pdf/QUICK_START_GUIDE.pdf \
    --pdf-engine=wkhtmltopdf \
    -V geometry:margin=1in \
    2>/dev/null || pandoc QUICK_START_GUIDE.md -o docs-pdf/QUICK_START_GUIDE.pdf

echo "Converting MULTI_APP_VECTOR_ARCHITECTURE.md..."
pandoc MULTI_APP_VECTOR_ARCHITECTURE.md -o docs-pdf/MULTI_APP_VECTOR_ARCHITECTURE.pdf \
    --pdf-engine=wkhtmltopdf \
    -V geometry:margin=1in \
    2>/dev/null || pandoc MULTI_APP_VECTOR_ARCHITECTURE.md -o docs-pdf/MULTI_APP_VECTOR_ARCHITECTURE.pdf

echo "Converting DECISION_SUMMARY.md..."
pandoc DECISION_SUMMARY.md -o docs-pdf/DECISION_SUMMARY.pdf \
    --pdf-engine=wkhtmltopdf \
    -V geometry:margin=1in \
    2>/dev/null || pandoc DECISION_SUMMARY.md -o docs-pdf/DECISION_SUMMARY.pdf

echo "Converting VECTOR_DATABASE_INTEGRATION_PLAN_UPDATED.md..."
pandoc VECTOR_DATABASE_INTEGRATION_PLAN_UPDATED.md -o docs-pdf/VECTOR_DATABASE_INTEGRATION_PLAN.pdf \
    --pdf-engine=wkhtmltopdf \
    -V geometry:margin=1in \
    2>/dev/null || pandoc VECTOR_DATABASE_INTEGRATION_PLAN_UPDATED.md -o docs-pdf/VECTOR_DATABASE_INTEGRATION_PLAN.pdf

echo ""
echo "✅ Done! PDFs saved to ./docs-pdf/"
echo ""
echo "Files created:"
ls -lh docs-pdf/*.pdf

