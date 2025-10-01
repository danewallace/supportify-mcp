#!/bin/bash

# Interactive page tester for Supportify MCP
# Usage: ./test-page.sh [guide] [page-slug]

BASE_URL="http://localhost:51345"
GUIDE=${1:-security}
PAGE=${2:-welcome}

echo "Testing: /guide/$GUIDE/$PAGE"
echo "=========================================="
echo ""

# Fetch and display
curl -s "$BASE_URL/guide/$GUIDE/$PAGE"

echo ""
echo ""
echo "=========================================="
echo "Statistics:"
echo "  Character count: $(curl -s "$BASE_URL/guide/$GUIDE/$PAGE" | wc -c)"
echo "  Line count: $(curl -s "$BASE_URL/guide/$GUIDE/$PAGE" | wc -l)"
echo "  Word count: $(curl -s "$BASE_URL/guide/$GUIDE/$PAGE" | wc -w)"

