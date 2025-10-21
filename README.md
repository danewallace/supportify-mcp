# Supportify MCP

Making Apple Support guides AI-readable.

This MCP server provides access to Apple Platform Security and Deployment guides in an AI-readable Markdown format by parsing the HTML content from Apple Support pages.

**✨ New**: Browse 257+ deployment topics, search by keyword, and discover any guide content with our powerful discovery features!

## Supported Guides

- **[Apple Platform Security Guide](https://support.apple.com/guide/security/welcome/web)** - Comprehensive guide on Apple platform security
- **[Apple Platform Deployment Guide](https://support.apple.com/guide/deployment/welcome/web)** - Guide for deploying Apple devices in enterprise environments

## Features

- 🔍 **Search & Discovery** - Search 257+ topics across both guides by keyword
- 📚 **Table of Contents** - Browse complete topic lists with titles and URLs
- 📄 **Full Content Extraction** - Get comprehensive markdown with intro paragraphs, sections, links, and published dates
- ⚡ **Fast & Efficient** - Regex-based HTML parsing with no duplication
- 🤖 **MCP Integration** - Works with AI assistants via Model Context Protocol
- 📊 **JSON & Markdown** - Flexible output formats for different use cases

## Usage

### HTTP API

The service provides a powerful HTTP interface for accessing Apple Support guide content:

#### 1. Discovery - Browse All Topics

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

#### 2. Search - Find Topics by Keyword

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

#### 3. Get Full Content - Access Complete Documentation

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

#### Complete Workflow Example

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

#### JSON Response Format

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

- `fetchAppleSupportGuide` - Fetches Apple Support guide pages by guide name and path
  - Parameters:
    - `guide` (enum): "security" or "deployment"
    - `path` (string): Page path/slug (e.g., "welcome", "intro-to-declarative-device-management-depb1bab77f8")
  - Returns: Content as Markdown

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

| Endpoint | Method | Description | Example |
|----------|--------|-------------|---------|
| `/guide/{guide}/toc` | GET | List all topics in a guide | `/guide/deployment/toc` |
| `/guide/{guide}/search` | GET | Search topics by keyword | `/guide/deployment/search?q=enrollment` |
| `/guide/{guide}/{slug}` | GET | Get full content for a topic | `/guide/security/secure-enclave-sec59b0b31ff` |
| `/mcp` | POST | MCP protocol endpoint | MCP clients only |

## Contributing

Issues and pull requests welcome! This project aims to make Apple documentation more accessible to AI assistants and developers.

## Acknowledgments

- Content sourced from [Apple Support](https://support.apple.com/)
- Built for the [Model Context Protocol](https://modelcontextprotocol.io/)
- Deployed on [Cloudflare Workers](https://workers.cloudflare.com/)
