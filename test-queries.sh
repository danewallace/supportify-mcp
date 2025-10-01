#!/bin/bash

# Test script for common queries about Apple Support documentation

echo "==========================================="
echo "Test Query Examples"
echo "==========================================="
echo ""

echo "1. What is the Secure Enclave?"
echo "URL: /guide/security/secure-enclave-sec59b0b31ff"
echo "---"
curl -s "http://localhost:51345/guide/security/secure-enclave-sec59b0b31ff" | head -30
echo ""
echo "... (truncated - full response is 21KB+)"
echo ""
echo ""

echo "2. What is Face ID / Touch ID?"  
echo "URL: /guide/security/optic-face-touch-passcodes-passwords-sec9479035f1"
echo "---"
curl -s "http://localhost:51345/guide/security/optic-face-touch-passcodes-passwords-sec9479035f1" | head -40
echo ""
echo ""

echo "3. What is FileVault?"
echo "URL: /guide/security/volume-encryption-with-filevault-sec4c6dc1b6e"
echo "---"
curl -s "http://localhost:51345/guide/security/volume-encryption-with-filevault-sec4c6dc1b6e" | head -30
echo ""
echo ""

echo "4. How does the boot process work?"
echo "URL: /guide/security/boot-process-for-iphone-and-ipad-devices-secb3000f149"
echo "---"
curl -s "http://localhost:51345/guide/security/boot-process-for-iphone-and-ipad-devices-secb3000f149" | head -30
echo ""

