# Supportify MCP

Making Apple Support guides AI-readable.

This MCP server provides access to Apple Platform Security and Deployment guides in an AI-readable Markdown format by parsing the HTML content from Apple Support pages.

## Supported Guides

- **[Apple Platform Security Guide](https://support.apple.com/guide/security/welcome/web)** - Comprehensive guide on Apple platform security
- **[Apple Platform Deployment Guide](https://support.apple.com/guide/deployment/welcome/web)** - Guide for deploying Apple devices in enterprise environments

## Usage

### HTTP API

Access support guide pages using the following URL pattern:

```
/guide/{guide-name}/{page-path}
```

**Examples:**
```
/guide/security/welcome
/guide/security/intro-to-apple-platform-security-seccd5016d31
/guide/deployment/welcome
```

The service returns the content as Markdown by default, or JSON if you include `Accept: application/json` in your request headers.

### MCP Integration

This service supports the Model Context Protocol (MCP) and can be integrated with AI assistants and other MCP clients.

#### Configuration

Add to your MCP client configuration:

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
  - Example: `support://security/welcome` returns the Security Guide welcome page
  - Example: `support://deployment/welcome` returns the Deployment Guide welcome page

#### Available Tools

- `fetchAppleSupportGuide` - Fetches Apple Support guide pages by guide name and path
  - Parameters:
    - `guide` (enum): "security" or "deployment"
    - `path` (string): Page path/slug (e.g., "welcome", "intro-to-apple-platform-security-seccd5016d31")
  - Returns: Content as Markdown

## Self-Hosting

This project is designed to be easily run on your own machine or deployed to a hosting provider.

### Prerequisites

- Node.js 18+
- npm

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/supportify-mcp.git
   cd supportify-mcp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

Once the application is up and running, press the <kbd>b</kbd> key to open the URL in your browser.

To configure MCP clients to use your development server, 
replace the server address with your local address (`http://localhost:8787` by default).

> [!NOTE]  
> The application is built with Hono, making it compatible with various runtimes.
>
> See the [Hono docs](https://hono.dev/docs/getting-started/basic) for more information about deploying to different platforms.

### Cloudflare Workers

This project is optimized for deployment on Cloudflare Workers:

```bash
npm run deploy
```

Whenever you update your `wrangler.toml` or change your Worker bindings, be sure to re-run:

```bash
npm run cf-typegen
```

## Development

### Testing

This project uses [vitest](https://vitest.dev) for unit and integration testing.

```bash
npm run test          # Run tests
npm run test:ui       # Run tests with UI
npm run test:run      # Run tests once
```

### Code Quality

This project uses [Biome](https://biomejs.dev/) for code formatting, linting, and import organization.

- `npm run format` - Format all code files
- `npm run lint` - Lint and fix code issues
- `npm run check` - Format, lint, and organize imports (recommended)
- `npm run check:ci` - Check code without making changes (for CI)

### Editor Integration

For the best development experience, install the Biome extension for your editor:

- [VSCode](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)
- [Vim/Neovim](https://github.com/biomejs/biome/tree/main/editors/vim)
- [Emacs](https://github.com/biomejs/biome/tree/main/editors/emacs)

## License

This project is available under the MIT license. See the LICENSE file for more info.

## Legal

This is an unofficial, independent project and is not affiliated with or endorsed by Apple Inc.
"Apple" and related marks are trademarks of Apple Inc.

This service is an accessibility-first, on‑demand renderer.
It converts Apple Support guide pages to Markdown only when requested by a user.
It does not crawl, spider, or bulk download;
it does not attempt to bypass authentication or security;
and it implements rate limiting to avoid imposing unreasonable load.

Content is fetched transiently and may be cached briefly to improve performance.
No permanent archives are maintained.
All copyrights and other rights in the underlying content remain with Apple Inc.
Each page links back to the original source.

Your use of this service must comply with Apple's Terms of Use and applicable law.
You are solely responsible for how you access and use Apple's content through this tool.
Do not use this service to circumvent technical measures or for redistribution.
