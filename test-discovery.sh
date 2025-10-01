#!/bin/bash

# Discovery and Search Test Script for Supportify MCP
# Demonstrates how to discover and search for any topic in Apple Support guides

BASE_URL="http://localhost:51345"

echo "=============================================="
echo "Supportify MCP - Discovery & Search Demo"
echo "=============================================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Browse All Available Topics${NC}"
echo "----------------------------------------------"
echo "Get the full table of contents:"
echo "  curl ${BASE_URL}/guide/deployment/toc | jq '.totalTopics'"
echo ""
curl -s "${BASE_URL}/guide/deployment/toc" | jq -r '"Total topics in Deployment guide: \(.totalTopics)"'
echo ""

echo -e "${BLUE}2. Search for Topics${NC}"
echo "----------------------------------------------"
echo ""

echo -e "${YELLOW}Query: 'declarative device management'${NC}"
echo "  curl '${BASE_URL}/guide/deployment/search?q=declarative+device+management'"
echo ""
curl -s "${BASE_URL}/guide/deployment/search?q=declarative+device+management" | jq -r '
  "Found \(.totalResults) results:",
  "",
  (.results[0:3][] | "  • \(.title)\n    URL: \(.url)")
'
echo ""

echo -e "${YELLOW}Query: 'enrollment'${NC}"
echo "  curl '${BASE_URL}/guide/deployment/search?q=enrollment'"
echo ""
curl -s "${BASE_URL}/guide/deployment/search?q=enrollment" | jq -r '
  "Found \(.totalResults) results:",
  "",
  (.results[0:3][] | "  • \(.title)\n    URL: \(.url)")
'
echo ""

echo -e "${YELLOW}Query: 'filevault' (security guide)${NC}"
echo "  curl '${BASE_URL}/guide/security/search?q=filevault'"
echo ""
curl -s "${BASE_URL}/guide/security/search?q=filevault" | jq -r '
  "Found \(.totalResults) results:",
  "",
  (.results[] | "  • \(.title)\n    URL: \(.url)")
'
echo ""

echo -e "${BLUE}3. Get Full Content for a Topic${NC}"
echo "----------------------------------------------"
echo ""
echo "Once you find a topic, get its full content:"
echo ""

# Get the first DDM result
DDM_SLUG=$(curl -s "${BASE_URL}/guide/deployment/search?q=declarative" | jq -r '.results[0].slug')
echo -e "${YELLOW}Example: Declarative Device Management${NC}"
echo "  curl ${BASE_URL}/guide/deployment/${DDM_SLUG}"
echo ""
curl -s "${BASE_URL}/guide/deployment/${DDM_SLUG}" | head -20
echo "  ... (truncated)"
echo ""

echo -e "${BLUE}4. Complete Workflow Example${NC}"
echo "----------------------------------------------"
echo ""
echo "User asks: 'What are the device enrollment options?'"
echo ""
echo "Step 1: Search for 'enrollment'"
ENROLLMENT_RESULTS=$(curl -s "${BASE_URL}/guide/deployment/search?q=enrollment")
echo "$ENROLLMENT_RESULTS" | jq -r '"  Found \(.totalResults) topics about enrollment"'
echo ""

echo "Step 2: Get the most relevant topic"
TOP_RESULT=$(echo "$ENROLLMENT_RESULTS" | jq -r '.results[0]')
TITLE=$(echo "$TOP_RESULT" | jq -r '.title')
SLUG=$(echo "$TOP_RESULT" | jq -r '.slug')
echo "  Most relevant: \"${TITLE}\""
echo ""

echo "Step 3: Fetch full content"
echo "  curl ${BASE_URL}/guide/deployment/${SLUG}"
echo ""
curl -s "${BASE_URL}/guide/deployment/${SLUG}" | head -15
echo "  ... (full content available)"
echo ""

echo "=============================================="
echo -e "${GREEN}✓ Discovery features working!${NC}"
echo "=============================================="
echo ""
echo "Available endpoints:"
echo "  GET /guide/{guide}/toc              - List all topics"
echo "  GET /guide/{guide}/search?q={query} - Search topics"
echo "  GET /guide/{guide}/{slug}           - Get full content"
echo ""
echo "Supported guides: security, deployment"

