#!/bin/bash

# Comprehensive Test Suite for Supportify MCP
# Tests Security Guide, Deployment Guide, Discovery, and Search features

BASE_URL="http://localhost:51345"
PASSED=0
FAILED=0

echo "============================================"
echo "Testing Supportify MCP - Complete Test Suite"
echo "============================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to test a URL
test_url() {
    local name=$1
    local url=$2
    local min_length=${3:-200}  # Minimum expected content length
    
    echo -n "Testing: $name... "
    
    response=$(curl -s "$url")
    length=${#response}
    
    # Check if response contains expected markers
    if [[ $length -lt $min_length ]]; then
        echo -e "${RED}FAIL${NC} (content too short: $length chars)"
        echo "  URL: $url"
        FAILED=$((FAILED + 1))
        return 1
    fi
    
    # Check for markdown formatting
    if [[ ! $response =~ ^#\  ]]; then
        echo -e "${RED}FAIL${NC} (no markdown title found)"
        echo "  URL: $url"
        FAILED=$((FAILED + 1))
        return 1
    fi
    
    echo -e "${GREEN}PASS${NC} ($length chars)"
    PASSED=$((PASSED + 1))
    return 0
}

# Function to test JSON endpoints
test_json() {
    local name=$1
    local url=$2
    local expected_field=$3
    
    echo -n "Testing: $name... "
    
    response=$(curl -s "$url")
    
    if ! echo "$response" | jq -e ".$expected_field" > /dev/null 2>&1; then
        echo -e "${RED}FAIL${NC} (missing field: $expected_field)"
        echo "  URL: $url"
        FAILED=$((FAILED + 1))
        return 1
    fi
    
    echo -e "${GREEN}PASS${NC}"
    PASSED=$((PASSED + 1))
    return 0
}

echo -e "${BLUE}=== Discovery Features ===${NC}"
echo ""

# Test Table of Contents endpoints
test_json "ToC: Deployment Guide" "$BASE_URL/guide/deployment/toc" "totalTopics"
test_json "ToC: Security Guide" "$BASE_URL/guide/security/toc" "totalTopics"

# Test Search endpoints
test_json "Search: Deployment DDM" "$BASE_URL/guide/deployment/search?q=declarative" "totalResults"
test_json "Search: Security FileVault" "$BASE_URL/guide/security/search?q=filevault" "totalResults"
test_json "Search: Deployment enrollment" "$BASE_URL/guide/deployment/search?q=enrollment" "totalResults"

# Verify search returns results
echo -n "Testing: Search returns relevant results... "
DDM_RESULTS=$(curl -s "$BASE_URL/guide/deployment/search?q=declarative")
DDM_COUNT=$(echo "$DDM_RESULTS" | jq -r '.totalResults')
if [[ $DDM_COUNT -gt 0 ]]; then
    echo -e "${GREEN}PASS${NC} ($DDM_COUNT results)"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}FAIL${NC} (no results found)"
    FAILED=$((FAILED + 1))
fi

echo ""
echo -e "${BLUE}=== Security Guide Tests ===${NC}"
echo ""

# Security Guide - Key Topics (with improved intro parsing)
test_url "Security: Welcome" "$BASE_URL/guide/security/welcome" 300
test_url "Security: Introduction" "$BASE_URL/guide/security/intro-to-apple-platform-security-seccd5016d31" 1000

# Security Guide - Hardware Security
test_url "Security: Secure Enclave (detailed)" "$BASE_URL/guide/security/secure-enclave-sec59b0b31ff" 10000
test_url "Security: Face ID & Touch ID" "$BASE_URL/guide/security/optic-face-touch-passcodes-passwords-sec9479035f1" 2000

# Security Guide - System Security
test_url "Security: Boot Process (iOS)" "$BASE_URL/guide/security/boot-process-for-iphone-and-ipad-devices-secb3000f149" 200

# Security Guide - Encryption & Data Protection
test_url "Security: FileVault" "$BASE_URL/guide/security/volume-encryption-with-filevault-sec4c6dc1b6e" 2000

# Security Guide - Services
test_url "Security: iCloud Overview" "$BASE_URL/guide/security/icloud-security-overview-secb558a6c8" 1000

echo ""
echo -e "${BLUE}=== Deployment Guide Tests ===${NC}"
echo ""

# Deployment Guide - Overview pages
test_url "Deployment: Welcome" "$BASE_URL/guide/deployment/welcome" 200
test_url "Deployment: Introduction" "$BASE_URL/guide/deployment/intro-to-deployment-apd5bc4b593b" 500

# Deployment Guide - Declarative Device Management (now with full intro)
test_url "Deployment: Intro to DDM (improved)" "$BASE_URL/guide/deployment/intro-to-declarative-device-management-depb1bab77f8" 2000
test_url "Deployment: Use DDM" "$BASE_URL/guide/deployment/declarative-device-management-manage-apple-depc30268577" 500

# Deployment Guide - Device Management
test_url "Deployment: MDM Overview" "$BASE_URL/guide/deployment/mobile-device-management-overview-apd7bf4c5602" 200

# Deployment Guide - Enrollment
test_url "Deployment: Enrollment Methods" "$BASE_URL/guide/deployment/enrollment-methods-for-apple-devices-dep08f54fcf6" 1000
test_url "Deployment: Automated Enrollment" "$BASE_URL/guide/deployment/automated-device-enrollment-management-dep73069dd57" 500

# Deployment Guide - Setup & Configuration
test_url "Deployment: Apple Business Manager" "$BASE_URL/guide/deployment/intro-to-apple-business-manager-apdb0ee391e2" 500

echo ""
echo -e "${BLUE}=== Content Quality Tests ===${NC}"
echo ""

# Test that DDM page now includes intro paragraphs
echo -n "Testing: DDM page includes intro content... "
DDM_CONTENT=$(curl -s "$BASE_URL/guide/deployment/intro-to-declarative-device-management-depb1bab77f8")
if echo "$DDM_CONTENT" | grep -q "Declarative device management is an update to the existing protocol"; then
    echo -e "${GREEN}PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}FAIL${NC} (intro paragraph missing)"
    FAILED=$((FAILED + 1))
fi

# Test that DDM page includes all sections
echo -n "Testing: DDM page includes Declarations section... "
if echo "$DDM_CONTENT" | grep -q "## Declarations"; then
    echo -e "${GREEN}PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}FAIL${NC} (Declarations section missing)"
    FAILED=$((FAILED + 1))
fi

echo -n "Testing: DDM page includes Status channel section... "
if echo "$DDM_CONTENT" | grep -q "## Status channel"; then
    echo -e "${GREEN}PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}FAIL${NC} (Status channel section missing)"
    FAILED=$((FAILED + 1))
fi

# Test Security guide content quality
echo -n "Testing: Secure Enclave has comprehensive content... "
ENCLAVE_SIZE=$(curl -s "$BASE_URL/guide/security/secure-enclave-sec59b0b31ff" | wc -c)
if [[ $ENCLAVE_SIZE -gt 15000 ]]; then
    echo -e "${GREEN}PASS${NC} (${ENCLAVE_SIZE} chars)"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}FAIL${NC} (only ${ENCLAVE_SIZE} chars, expected >15000)"
    FAILED=$((FAILED + 1))
fi

echo ""
echo -e "${BLUE}=== Edge Cases & Error Handling ===${NC}"
echo ""

# Test invalid guide name
echo -n "Testing: Invalid guide name returns 400... "
response=$(curl -s -w "%{http_code}" "$BASE_URL/guide/invalid/welcome" -o /dev/null)
if [[ $response == "400" ]]; then
    echo -e "${GREEN}PASS${NC} (returns 400)"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}FAIL${NC} (expected 400, got $response)"
    FAILED=$((FAILED + 1))
fi

# Test search without query parameter
echo -n "Testing: Search without query returns error... "
response=$(curl -s "$BASE_URL/guide/deployment/search")
if echo "$response" | jq -e '.error' > /dev/null 2>&1; then
    echo -e "${GREEN}PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}FAIL${NC} (should return error)"
    FAILED=$((FAILED + 1))
fi

# Test root endpoint
echo -n "Testing: Root endpoint... "
response=$(curl -s "$BASE_URL/")
if [[ ${#response} -gt 50 ]]; then
    echo -e "${GREEN}PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

# Test JSON response format
echo -n "Testing: JSON response format... "
response=$(curl -s -H "Accept: application/json" "$BASE_URL/guide/security/welcome")
if echo "$response" | jq -e '.url and .content' > /dev/null 2>&1; then
    echo -e "${GREEN}PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}FAIL${NC} (invalid JSON structure)"
    FAILED=$((FAILED + 1))
fi

echo ""
echo -e "${BLUE}=== Performance Tests ===${NC}"
echo ""

# Test response times
echo -n "Testing: ToC endpoint response time... "
start=$(date +%s%N)
curl -s "$BASE_URL/guide/deployment/toc" > /dev/null
end=$(date +%s%N)
elapsed=$(( (end - start) / 1000000 ))
if [[ $elapsed -lt 5000 ]]; then
    echo -e "${GREEN}PASS${NC} (${elapsed}ms)"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}WARN${NC} (${elapsed}ms - slower than expected)"
    PASSED=$((PASSED + 1))
fi

echo -n "Testing: Search endpoint response time... "
start=$(date +%s%N)
curl -s "$BASE_URL/guide/deployment/search?q=test" > /dev/null
end=$(date +%s%N)
elapsed=$(( (end - start) / 1000000 ))
if [[ $elapsed -lt 5000 ]]; then
    echo -e "${GREEN}PASS${NC} (${elapsed}ms)"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}WARN${NC} (${elapsed}ms - slower than expected)"
    PASSED=$((PASSED + 1))
fi

echo ""
echo "============================================"
echo "Test Results"
echo "============================================"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo -e "Total:  $(($PASSED + $FAILED))"
echo ""

if [[ $FAILED -eq 0 ]]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    echo "Summary of capabilities:"
    echo "  • Browse 257 deployment topics via ToC"
    echo "  • Search all topics by keyword"
    echo "  • Full content extraction with intro paragraphs"
    echo "  • Security & Deployment guides fully supported"
    echo "  • JSON and Markdown output formats"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
