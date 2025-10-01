# Supportify MCP - Quick Start Guide

## 🚀 Quick Commands

### Start the Server
```bash
npm install
npm run dev
# Server runs on http://localhost:51345
```

### Test Everything Works
```bash
./test-guides.sh      # Run all 31 tests
./test-discovery.sh   # See discovery features in action
```

---

## 📚 Using the API

### 1. Discover Topics

**Browse all topics:**
```bash
# Deployment guide (257 topics)
curl http://localhost:51345/guide/deployment/toc | jq

# Security guide  
curl http://localhost:51345/guide/security/toc | jq
```

### 2. Search for Content

**Find what you need:**
```bash
# Search deployment guide
curl "http://localhost:51345/guide/deployment/search?q=enrollment" | jq

# Search security guide
curl "http://localhost:51345/guide/security/search?q=secure+enclave" | jq
```

### 3. Get Full Content

**Access complete documentation:**
```bash
# Using slug from search results
curl http://localhost:51345/guide/deployment/depb1bab77f8

# Known topics
curl http://localhost:51345/guide/security/secure-enclave-sec59b0b31ff
```

---

## 💡 Common Queries

### Declarative Device Management
```bash
# Find DDM topics
curl "http://localhost:51345/guide/deployment/search?q=declarative" | jq '.results[] | .title'

# Get DDM intro
curl http://localhost:51345/guide/deployment/intro-to-declarative-device-management-depb1bab77f8
```

### Device Enrollment
```bash
# Find enrollment methods
curl "http://localhost:51345/guide/deployment/search?q=enrollment" | jq

# Get enrollment methods page
curl http://localhost:51345/guide/deployment/enrollment-methods-for-apple-devices-dep08f54fcf6
```

### Security Topics
```bash
# Secure Enclave (21KB detailed content)
curl http://localhost:51345/guide/security/secure-enclave-sec59b0b31ff

# FileVault  
curl http://localhost:51345/guide/security/volume-encryption-with-filevault-sec4c6dc1b6e

# Face ID & Touch ID
curl http://localhost:51345/guide/security/optic-face-touch-passcodes-passwords-sec9479035f1
```

---

## 🎯 Workflow Examples

### Example 1: Find and Read About MDM

```bash
# Step 1: Search for MDM topics
curl "http://localhost:51345/guide/deployment/search?q=mobile+device+management" | jq '.results[0]'

# Step 2: Get the topic slug from results (e.g., "apd7bf4c5602")

# Step 3: Fetch full content
curl http://localhost:51345/guide/deployment/mobile-device-management-overview-apd7bf4c5602
```

### Example 2: Learn About Security Features

```bash
# Browse all security topics
curl http://localhost:51345/guide/security/toc | jq '.topics[] | select(.title | contains("Secure"))'

# Get Secure Enclave details
curl http://localhost:51345/guide/security/secure-enclave-sec59b0b31ff
```

### Example 3: JSON Output for Integration

```bash
# Get structured JSON output
curl -H "Accept: application/json" \
  http://localhost:51345/guide/deployment/intro-to-declarative-device-management-depb1bab77f8 \
  | jq '.content' -r
```

---

## 🔧 Available Endpoints

| Endpoint | Description | Example |
|----------|-------------|---------|
| `GET /guide/{guide}/toc` | List all topics | `/guide/deployment/toc` |
| `GET /guide/{guide}/search?q={query}` | Search topics | `/guide/deployment/search?q=ddm` |
| `GET /guide/{guide}/{slug}` | Get full content | `/guide/security/sec59b0b31ff` |

**Supported guides:** `security`, `deployment`

---

## 📊 Content Stats

### Deployment Guide
- **257 topics** total
- Topics include: DDM, Enrollment, MDM, Configuration, Software Updates
- Sizes: 200 bytes (landing) to 6KB (detailed)

### Security Guide
- **Comprehensive** security documentation
- Topics include: Secure Enclave, FileVault, Face ID, Boot Process
- Sizes: Up to 21KB for detailed technical topics

---

## ⚡ Tips

1. **Use `jq`** for better JSON output: `curl ... | jq`
2. **Search is fuzzy** - don't need exact matches
3. **All content includes** intro paragraphs, sections, links, and dates
4. **URLs in markdown** are converted to absolute Apple Support links
5. **Test scripts** available for validation and examples

---

## 🐛 Troubleshooting

**Server not starting?**
```bash
cd /path/to/supportify-mcp
npm install
npm run dev
```

**404 errors?**
- Make sure you're using the correct slug from ToC or search results
- Use search to find the right slug: `curl ".../search?q=your+topic"`

**Empty content?**
- Some Apple pages are landing pages with minimal content
- Use search to find more detailed related pages

---

## 📖 Full Documentation

See [README.md](README.md) for complete API documentation, MCP integration, and deployment instructions.

