#!/bin/bash

# Test script for Supportify MCP - Apple Support Guides
# Tests both Security and Deployment guides with various page types

BASE_URL="http://localhost:51345"
PASSED=0
FAILED=0

echo "============================================"
echo "Testing Supportify MCP - Apple Support Guides"
echo "============================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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
    
    # Check for duplicates (simple heuristic - same word repeated 4+ times in a row)
    if echo "$response" | grep -qE '([A-Z][a-z]+)\1\1\1'; then
        echo -e "${YELLOW}WARN${NC} (possible duplicates detected)"
        echo "  URL: $url"
    fi
    
    echo -e "${GREEN}PASS${NC} ($length chars)"
    PASSED=$((PASSED + 1))
    return 0
}

echo "--- Security Guide Tests ---"
echo ""

# Security Guide - Welcome/Overview pages
test_url "Security: Welcome" "$BASE_URL/guide/security/welcome" 300
test_url "Security: Introduction" "$BASE_URL/guide/security/intro-to-apple-platform-security-seccd5016d31" 1000

# Security Guide - Hardware Security
test_url "Security: Hardware Overview" "$BASE_URL/guide/security/hardware-security-overview-secf020d1074" 500
test_url "Security: Apple SoC" "$BASE_URL/guide/security/apple-soc-security-sec87716a080" 500
test_url "Security: Secure Enclave" "$BASE_URL/guide/security/secure-enclave-sec59b0b31ff" 500
test_url "Security: Face ID & Touch ID" "$BASE_URL/guide/security/optic-face-touch-passcodes-passwords-sec9479035f1" 500

# Security Guide - System Security
test_url "Security: System Overview" "$BASE_URL/guide/security/system-security-overview-sec114e4db04" 500
test_url "Security: Boot Process (iOS)" "$BASE_URL/guide/security/boot-process-for-iphone-and-ipad-devices-secb3000f149" 500
test_url "Security: Secure Boot" "$BASE_URL/guide/security/boot-process-secac71d5623" 500

# Security Guide - Encryption & Data Protection
test_url "Security: Encryption Overview" "$BASE_URL/guide/security/encryption-and-data-protection-overview-sece3bee0835" 500
test_url "Security: Data Protection" "$BASE_URL/guide/security/data-protection-sece8608431d" 500
test_url "Security: FileVault" "$BASE_URL/guide/security/volume-encryption-with-filevault-sec4c6dc1b6e" 500

# Security Guide - App Security
test_url "Security: App Overview" "$BASE_URL/guide/security/app-security-overview-sec35dd877d0" 500
test_url "Security: App Store" "$BASE_URL/guide/security/about-app-store-security-secb8f887a15" 500

# Security Guide - Services
test_url "Security: Services Overview" "$BASE_URL/guide/security/services-security-overview-sec025128f1b" 500
test_url "Security: iCloud" "$BASE_URL/guide/security/icloud-security-overview-secb558a6c8" 500
test_url "Security: Apple Pay" "$BASE_URL/guide/security/apple-pay-security-overview-sec82e7bc3f8" 500

echo ""
echo "--- Deployment Guide Tests ---"
echo ""

# Deployment Guide - Overview pages
test_url "Deployment: Welcome" "$BASE_URL/guide/deployment/welcome" 200
test_url "Deployment: Introduction" "$BASE_URL/guide/deployment/intro-to-deployment-apd5bc4b593b" 500

# Deployment Guide - Planning
test_url "Deployment: Planning Overview" "$BASE_URL/guide/deployment/planning-overview-apde79c2b71c" 500
test_url "Deployment: Choose Deployment" "$BASE_URL/guide/deployment/choose-a-deployment-method-apd6065fb3da" 500

# Deployment Guide - Setup
test_url "Deployment: Setup Overview" "$BASE_URL/guide/deployment/deployment-setup-overview-apd1e43d8e39" 500
test_url "Deployment: Apple Business Manager" "$BASE_URL/guide/deployment/intro-to-apple-business-manager-apdb0ee391e2" 500

# Deployment Guide - MDM
test_url "Deployment: MDM Overview" "$BASE_URL/guide/deployment/mobile-device-management-overview-apd7bf4c5602" 500
test_url "Deployment: Device Enrollment" "$BASE_URL/guide/deployment/enroll-devices-in-mdm-apd710c13c4e" 500

echo ""
echo "--- Edge Cases & Error Handling ---"
echo ""

# Test invalid guide name
echo -n "Testing: Invalid guide name... "
response=$(curl -s -w "%{http_code}" "$BASE_URL/guide/invalid/welcome" -o /dev/null)
if [[ $response == "400" ]]; then
    echo -e "${GREEN}PASS${NC} (returns 400)"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}FAIL${NC} (expected 400, got $response)"
    FAILED=$((FAILED + 1))
fi

# Test non-existent page
echo -n "Testing: Non-existent page... "
response=$(curl -s -w "%{http_code}" "$BASE_URL/guide/security/this-page-does-not-exist-xyz" -o /dev/null)
if [[ $response == "404" || $response == "502" ]]; then
    echo -e "${GREEN}PASS${NC} (returns $response)"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}FAIL${NC} (expected 404/502, got $response)"
    FAILED=$((FAILED + 1))
fi

# Test root endpoint
test_url "Root endpoint" "$BASE_URL/" 100

# Test JSON response
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
echo "============================================"
echo "Test Results"
echo "============================================"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [[ $FAILED -eq 0 ]]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi

