# Supportify MCP

Making Apple Support guides and training tutorials AI-readable.

This MCP server provides access to Apple Platform Security and Deployment guides in an AI-readable Markdown format by parsing the HTML content from Apple Support pages. It also provides access to the official Apple Device Support Training course with 40+ tutorials.

**✨ New**: Access Apple's official Device Support Training course (14hr 15min) with tutorials covering iPhone, iPad, and Mac troubleshooting, setup, networking, security, and diagnostics!

## Supported Content

### Apple Platform Guides
- **[Apple Platform Security Guide](https://support.apple.com/guide/security/welcome/web)** - Comprehensive guide on Apple platform security
- **[Apple Platform Deployment Guide](https://support.apple.com/guide/deployment/welcome/web)** - Guide for deploying Apple devices in enterprise environments

### Apple Device Support Training
- **[Apple Device Support Training](https://it-training.apple.com/tutorials/apt-support/)** - Official training course for Mac, iPhone, and iPad support (40+ tutorials, 14hr 15min total)
  - Getting Started (12 tutorials)
  - iPhone and iPad Support (14 tutorials)
  - Mac Support (14 tutorials)

## Features

- 🔍 **Search & Discovery** - Search 257+ topics across guides and 40+ training tutorials by keyword
- 📚 **Table of Contents** - Browse complete topic lists and training course structure
- 📄 **Full Content Extraction** - Get comprehensive markdown with intro paragraphs, sections, links, and published dates
- 🎓 **Training Tutorials** - Access Apple's official Device Support training course
- ⚡ **Fast & Efficient** - Regex-based HTML parsing with no duplication
- 🤖 **MCP Integration** - Works with AI assistants via Model Context Protocol
- 📊 **JSON & Markdown** - Flexible output formats for different use cases

## Usage

### HTTP API

The service provides a powerful HTTP interface for accessing Apple Support guide content and training tutorials:

#### Apple Platform Guides

##### 1. Discovery - Browse All Topics

Get the complete table of contents:

```bash
# List all 257 deployment topics
curl http://localhost:51345/guide/deployment/toc | jq

# List all security topics
curl http://localhost:51345/guide/security/toc | jq
```

Returns:
```json
{
  "guide": "deployment",
  "totalTopics": 257,
  "topics": [
    {
      "title": "Intro to declarative device management",
      "slug": "depb1bab77f8",
      "url": "https://support.apple.com/guide/deployment/intro-to-declarative-device-management-depb1bab77f8/web",
      "id": "DEPB1BAB77F8"
    }
  ]
}
```

##### 2. Search - Find Topics by Keyword

Search for specific topics across the guides:

```bash
# Search deployment guide
curl "http://localhost:51345/guide/deployment/search?q=declarative+device+management" | jq

# Search security guide
curl "http://localhost:51345/guide/security/search?q=filevault" | jq

# Search for enrollment options
curl "http://localhost:51345/guide/deployment/search?q=enrollment" | jq
```

Returns matching topics:
```json
{
  "guide": "deployment",
  "query": "declarative device management",
  "totalResults": 20,
  "results": [
    {
      "title": "Intro to declarative device management",
      "slug": "depb1bab77f8",
      "url": "/guide/deployment/depb1bab77f8",
      "appleUrl": "https://support.apple.com/guide/deployment/intro-to-declarative-device-management-depb1bab77f8/web"
    }
  ]
}
```

##### 3. Get Full Content - Access Complete Documentation

Once you find a topic (via search or ToC), get its full markdown content:

```bash
# Deployment guide examples
curl http://localhost:51345/guide/deployment/intro-to-declarative-device-management-depb1bab77f8
curl http://localhost:51345/guide/deployment/enrollment-methods-for-apple-devices-dep08f54fcf6

# Security guide examples
curl http://localhost:51345/guide/security/secure-enclave-sec59b0b31ff
curl http://localhost:51345/guide/security/volume-encryption-with-filevault-sec4c6dc1b6e
```

Returns clean Markdown:
```markdown
# Intro to declarative device management and Apple devices

Declarative device management is an update to the existing protocol for device management...

## Declarations

There are four types of declarations...

---
*Published: October 25, 2023*
---
*Source: [https://support.apple.com/guide/deployment/...](https://support.apple.com/guide/deployment/...)*
```

##### Complete Workflow Example

**User asks: "What are the device enrollment options?"**

```bash
# Step 1: Search for relevant topics
curl "http://localhost:51345/guide/deployment/search?q=enrollment" | jq
# Returns 9 results about enrollment methods

# Step 2: Select the most relevant topic
# "Enrollment methods for Apple devices" (slug: dep08f54fcf6)

# Step 3: Fetch full content
curl http://localhost:51345/guide/deployment/enrollment-methods-for-apple-devices-dep08f54fcf6
# Returns comprehensive 3KB markdown documentation with all details
```

##### JSON Response Format

Request with `Accept: application/json` header for structured output:

```bash
curl -H "Accept: application/json" http://localhost:51345/guide/security/secure-enclave-sec59b0b31ff | jq
```

Returns:
```json
{
  "url": "https://support.apple.com/guide/security/secure-enclave-sec59b0b31ff/web",
  "content": "# Secure Enclave\n\n## Overview\n\nThe Secure Enclave is a dedicated secure subsystem..."
}
```

#### Apple Device Support Training

##### 1. Search Training Tutorials

Search for official Apple training content by topic:

```bash
# Search for backup tutorials
curl "http://localhost:51345/training/search?q=backup" | jq

# Search with platform filter
curl "http://localhost:51345/training/search?q=network&platform=mac" | jq

# Search for troubleshooting tutorials
curl "http://localhost:51345/training/search?q=troubleshooting" | jq
```

Returns matching tutorials:
```json
{
  "query": "backup",
  "platform": "all",
  "totalResults": 4,
  "results": [
    {
      "tutorialId": "sup005",
      "title": "Backing Up iPhone or iPad",
      "abstract": "If you don't have a backup process in place...",
      "estimatedTime": "1hr 0min",
      "url": "https://it-training.apple.com/tutorials/support/sup005",
      "kind": "project",
      "volume": "iPhone and iPad",
      "chapter": "Setting Up and Restoring iPhone or iPad"
    }
  ]
}
```

##### 2. Get Tutorial Details

Fetch details for a specific tutorial by ID:

```bash
# Get backup tutorial details
curl "http://localhost:51345/training/sup005" | jq

# Get WiFi troubleshooting tutorial
curl "http://localhost:51345/training/sup110" | jq
```

Returns:
```json
{
  "tutorialId": "sup005",
  "title": "Backing Up iPhone or iPad",
  "abstract": "If you don't have a backup process in place...",
  "estimatedTime": "1hr 0min",
  "kind": "project",
  "url": "https://it-training.apple.com/tutorials/support/sup005"
}
```

##### 3. Browse Training Catalog

Get the complete course structure:

```bash
curl "http://localhost:51345/training/catalog" | jq
```

Returns:
```json
{
  "title": "Learn How to Support Apple Devices",
  "estimatedTime": "14hr 15min",
  "totalVolumes": 3,
  "volumes": [
    {
      "name": "Getting Started",
      "chapters": [
        {
          "name": "Preparing for the Course",
          "tutorials": [
            {
              "id": "sup001",
              "title": "What You'll Need",
              "estimatedTime": "10min"
            }
          ]
        }
      ]
    }
  ]
}
```

### MCP Integration

This service supports the Model Context Protocol (MCP) and can be integrated with AI assistants and other MCP clients.

#### Configuration

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "supportify": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:8787/mcp"]
    }
  }
}
```

Or if deploying to a server:

```json
{
  "mcpServers": {
    "supportify": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://your-domain.com/mcp"]
    }
  }
}
```

#### Available Resources

- `support://{guide}/{path}` - Apple Support guide pages in Markdown format
  - Example: `support://security/secure-enclave-sec59b0b31ff`
  - Example: `support://deployment/intro-to-declarative-device-management-depb1bab77f8`

#### Available Tools

**Support Guide Tools:**

- `searchAppleSupportGuide` - Search for topics in Apple Platform Security or Deployment guides
  - Parameters:
    - `guide` (enum): "security" or "deployment"
    - `query` (string): Search query
  - Returns: List of matching topics with slugs and URLs

- `fetchAppleSupportGuide` - Fetches Apple Support guide pages by guide name and path
  - Parameters:
    - `guide` (enum): "security" or "deployment"
    - `path` (string): Page path/slug (e.g., "welcome", "intro-to-declarative-device-management-depb1bab77f8")
  - Returns: Content as Markdown

**Training Tutorial Tools:**

- `searchAppleTraining` - Search for training tutorials in Apple Device Support course
  - Parameters:
    - `query` (string): Search query (e.g., "backup", "wifi troubleshooting")
    - `platform` (enum, optional): "iphone", "ipad", "mac", or "all"
  - Returns: List of matching tutorials with IDs, titles, durations, and URLs

- `fetchAppleTraining` - Fetch a specific training tutorial by ID
  - Parameters:
    - `tutorialId` (string): Tutorial ID from search results (e.g., "sup005", "sup110")
  - Returns: Tutorial details including title, abstract, duration, and URL

- `listAppleTrainingCatalog` - Get the complete training course structure
  - Parameters: None
  - Returns: Full course structure with all volumes, chapters, and tutorials

## Testing

Run the comprehensive test suite:

```bash
# Full test suite (31 tests: discovery, content, search, performance)
./test-guides.sh

# Discovery features demo
./test-discovery.sh

# Content quality tests
./test-queries.sh

# Individual page test
./test-page.sh security secure-enclave-sec59b0b31ff
```

Test coverage includes:
- ✅ Table of Contents endpoints (257+ topics)
- ✅ Search functionality across both guides
- ✅ Full content extraction with intro paragraphs
- ✅ Security & Deployment guide pages
- ✅ JSON & Markdown output formats
- ✅ Error handling & edge cases
- ✅ Performance benchmarks

## Self-Hosting

### Local Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Server runs on http://localhost:51345
```

### Deployment

Deploy to Cloudflare Workers:

```bash
# Deploy to production
npx wrangler deploy

# Your service will be available at:
# https://supportify-mcp.your-subdomain.workers.dev
```

## Architecture

### Technology Stack

- **Runtime**: Cloudflare Workers (serverless, edge computing)
- **Framework**: Hono (lightweight web framework)
- **Parser**: Custom regex-based HTML parser (no duplication, high performance)
- **MCP**: Model Context Protocol via HTTP transport

### How It Works

1. **Fetch**: Downloads HTML from Apple Support guide URLs
2. **Parse**: Extracts content using regex patterns targeting specific HTML structures
3. **Clean**: Removes navigation, ads, and duplicate elements
4. **Convert**: Transforms HTML to clean Markdown with proper formatting
5. **Serve**: Returns via HTTP API or MCP protocol

### Key Features

- **Intro Paragraph Extraction**: Captures opening content before sections
- **Section Parsing**: Extracts Subhead divs with headings and paragraphs
- **Link Preservation**: Converts relative URLs to absolute Apple Support links
- **Published Dates**: Includes document publication dates
- **Table Support**: Parses table content (e.g., declaration types in DDM)

## Content Quality

### Deployment Guide
- **257 topics** covering device management, enrollment, configuration, security
- **Example topics**: Declarative Device Management, Automated Enrollment, MDM, Setup Assistant
- **Content sizes**: 500 bytes (landing pages) to 6KB (detailed guides)

### Security Guide  
- **Comprehensive coverage** of Apple platform security architecture
- **Example topics**: Secure Enclave (21KB), FileVault (4KB), Face ID (4KB)
- **Detailed technical content** with architecture diagrams descriptions and specifications

## API Endpoints

### Support Guides

| Endpoint | Method | Description | Example |
|----------|--------|-------------|---------|
| `/guide/{guide}/toc` | GET | List all topics in a guide | `/guide/deployment/toc` |
| `/guide/{guide}/search` | GET | Search topics by keyword | `/guide/deployment/search?q=enrollment` |
| `/guide/{guide}/{slug}` | GET | Get full content for a topic | `/guide/security/secure-enclave-sec59b0b31ff` |

### Training Tutorials

| Endpoint | Method | Description | Example |
|----------|--------|-------------|---------|
| `/training/catalog` | GET | Get complete course structure | `/training/catalog` |
| `/training/search` | GET | Search tutorials by keyword | `/training/search?q=backup&platform=iphone` |
| `/training/{tutorialId}` | GET | Get tutorial details by ID | `/training/sup005` |

### MCP Protocol

| Endpoint | Method | Description | Example |
|----------|--------|-------------|---------|
| `/mcp` | POST | MCP protocol endpoint | MCP clients only |

## Contributing

Issues and pull requests welcome! This project aims to make Apple documentation more accessible to AI assistants and developers.

## Acknowledgments

- Content sourced from [Apple Support](https://support.apple.com/)
- Built for the [Model Context Protocol](https://modelcontextprotocol.io/)
- Deployed on [Cloudflare Workers](https://workers.cloudflare.com/)
