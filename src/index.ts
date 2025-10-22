import { StreamableHTTPTransport } from "@hono/mcp"
import { Hono } from "hono"
import { cache } from "hono/cache"
import { cors } from "hono/cors"
import { HTTPException } from "hono/http-exception"
import { trimTrailingSlash } from "hono/trailing-slash"

import { NotFoundError } from "./lib/fetch"
import { createMcpServer } from "./lib/mcp"
import { fetchAndRenderSupportGuide, fetchTableOfContents, searchToc } from "./lib/support"
import {
  fetchTrainingTutorial,
  fetchTrainingTutorialContent,
  getTrainingStructure,
  searchTrainingTutorials,
  type TrainingCatalogType,
} from "./lib/training"

interface Env {
  ASSETS: Fetcher
  NODE_ENV: string
}

const app = new Hono<{ Bindings: Env }>()

app.use("*", async (c, next) => {
  await next()

  // Security headers
  c.header("X-Content-Type-Options", "nosniff")
  c.header("X-Frame-Options", "DENY")
  c.header("X-XSS-Protection", "1; mode=block")
  c.header("Referrer-Policy", "strict-origin-when-cross-origin")
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  // Performance headers
  c.header("Vary", "Accept")

  // Development-specific headers
  if (c.env.NODE_ENV === "development") {
    c.header("Cache-Control", "no-store")
  }
})

app.use("*", cors())

app.use(trimTrailingSlash())

app.use("*", async (c, next) => {
  if (c.env.NODE_ENV !== "development") {
    cache({
      cacheName: "supportify-cache",
      cacheControl: "max-age=86400", // 24 hours
    })
  }
  await next()
})

const mcpServer = createMcpServer()
app.all("/mcp", async (c) => {
  const transport = new StreamableHTTPTransport()
  await mcpServer.connect(transport)
  return transport.handleRequest(c)
})

// Table of Contents route: /guide/{guide-name}/toc
app.get("/guide/:guide/toc", async (c) => {
  const guide = c.req.param("guide")

  if (guide !== "security" && guide !== "deployment") {
    return c.json({ error: "Invalid guide name" }, 400)
  }

  try {
    const toc = await fetchTableOfContents(guide as "security" | "deployment")
    return c.json({
      guide,
      totalTopics: toc.length,
      topics: toc,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return c.json({ error: `Failed to fetch ToC: ${errorMessage}` }, 500)
  }
})

// Search route: /guide/{guide-name}/search?q={query}
app.get("/guide/:guide/search", async (c) => {
  const guide = c.req.param("guide")
  const query = c.req.query("q")

  if (guide !== "security" && guide !== "deployment") {
    return c.json({ error: "Invalid guide name" }, 400)
  }

  if (!query || query.trim().length === 0) {
    return c.json({ error: "Query parameter 'q' is required" }, 400)
  }

  try {
    const toc = await fetchTableOfContents(guide as "security" | "deployment")
    const results = searchToc(toc, query)

    return c.json({
      guide,
      query,
      totalResults: results.length,
      results: results.map((item) => ({
        title: item.title,
        slug: item.slug,
        url: `/guide/${guide}/${item.slug}`,
        appleUrl: item.url,
      })),
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return c.json({ error: `Search failed: ${errorMessage}` }, 500)
  }
})

// Main route for support guides: /guide/{guide-name}/{path}
app.get("/guide/:guide/:path{.+}", async (c) => {
  const guide = c.req.param("guide")
  const path = c.req.param("path")

  // Validate guide name
  if (guide !== "security" && guide !== "deployment") {
    const errorResponse = new Response(
      `# Invalid Guide Name

The guide \`${guide}\` is not supported.

## Supported Guides

This service works with Apple Platform guides:

- \`security\` - Apple Platform Security Guide
- \`deployment\` - Apple Platform Deployment Guide

## Examples

- [Security Guide - Welcome](https://supportify.local/guide/security/welcome)
- [Security Guide - Intro](https://supportify.local/guide/security/intro-to-apple-platform-security-seccd5016d31)
- [Deployment Guide - Welcome](https://supportify.local/guide/deployment/welcome)

---
*Making Apple Support guides AI-readable*`,
      {
        status: 400,
        headers: { "Content-Type": "text/markdown; charset=utf-8" },
      },
    )
    throw new HTTPException(400, { res: errorResponse })
  }

  try {
    const sourceUrl = `https://support.apple.com/guide/${guide}/${path}/web`
    const markdown = await fetchAndRenderSupportGuide(guide, path, sourceUrl)

    // Validate that we got meaningful content
    if (!markdown || markdown.trim().length < 100) {
      throw new HTTPException(502, {
        message:
          "The Apple Support guide page loaded but contained insufficient content. This may be a temporary issue with the page.",
      })
    }

    const headers = {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Location": sourceUrl,
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      ETag: `"${Buffer.from(markdown).toString("base64").slice(0, 16)}"`,
      "Last-Modified": new Date().toUTCString(),
    }

    if (c.req.header("Accept")?.includes("application/json")) {
      return c.json(
        {
          url: sourceUrl,
          content: markdown,
        },
        200,
        { ...headers, "Content-Type": "application/json; charset=utf-8" },
      )
    }

    return c.text(markdown, 200, headers)
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error
    }
    if (error instanceof NotFoundError) {
      throw new HTTPException(404, {
        message: `The requested Apple Support guide page does not exist: ${guide}/${path}`,
      })
    }
    throw error
  }
})

// ============================================================================
// APPLE TRAINING ROUTES
// ============================================================================

// Training catalog route: /training/catalog?type={catalog}
app.get("/training/catalog", async (c) => {
  const catalogType = (c.req.query("type") as TrainingCatalogType) || "apt-support"

  // Validate catalog type
  if (catalogType !== "apt-support" && catalogType !== "apt-deployment") {
    return c.json(
      {
        error: `Invalid catalog type: ${catalogType}. Must be "apt-support" or "apt-deployment"`,
      },
      400,
    )
  }

  try {
    const structure = await getTrainingStructure(catalogType)
    return c.json({
      catalog: catalogType,
      title: structure.title,
      estimatedTime: structure.estimatedTime,
      totalVolumes: structure.volumes.length,
      volumes: structure.volumes,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return c.json({ error: `Failed to fetch training catalog: ${errorMessage}` }, 500)
  }
})

// Training search route: /training/search?q={query}&platform={platform}&catalog={catalog}
app.get("/training/search", async (c) => {
  const query = c.req.query("q")
  const platform = c.req.query("platform") as "iphone" | "ipad" | "mac" | "all" | undefined
  const catalogType = (c.req.query("catalog") as TrainingCatalogType) || "apt-support"

  if (!query || query.trim().length === 0) {
    return c.json({ error: "Query parameter 'q' is required" }, 400)
  }

  // Validate catalog type
  if (catalogType !== "apt-support" && catalogType !== "apt-deployment") {
    return c.json(
      {
        error: `Invalid catalog type: ${catalogType}. Must be "apt-support" or "apt-deployment"`,
      },
      400,
    )
  }

  try {
    const results = await searchTrainingTutorials(query, {
      platform: platform || "all",
      catalog: catalogType,
    })

    return c.json({
      query,
      catalog: catalogType,
      platform: platform || "all",
      totalResults: results.length,
      results: results.map((item) => ({
        tutorialId: item.tutorialId,
        title: item.title,
        abstract: item.abstract,
        estimatedTime: item.estimatedTime,
        url: item.url,
        kind: item.kind,
        volume: item.volume,
        chapter: item.chapter,
      })),
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return c.json({ error: `Search failed: ${errorMessage}` }, 500)
  }
})

// Training tutorial route: /training/{tutorialId}?catalog={catalog}
app.get("/training/:tutorialId", async (c) => {
  const tutorialId = c.req.param("tutorialId")
  const acceptHeader = c.req.header("accept") || ""
  const catalogType = (c.req.query("catalog") as TrainingCatalogType) || "apt-support"

  // Validate catalog type
  if (catalogType !== "apt-support" && catalogType !== "apt-deployment") {
    return c.json(
      {
        error: `Invalid catalog type: ${catalogType}. Must be "apt-support" or "apt-deployment"`,
      },
      400,
    )
  }

  try {
    // Check if markdown content is requested
    if (acceptHeader.includes("text/markdown") || acceptHeader.includes("text/plain")) {
      const markdown = await fetchTrainingTutorialContent(tutorialId, catalogType)
      return c.text(markdown, 200, { "Content-Type": "text/markdown; charset=utf-8" })
    }

    // Default: return JSON metadata
    const tutorial = await fetchTrainingTutorial(tutorialId, catalogType)

    if (!tutorial) {
      return c.json({ error: `Tutorial "${tutorialId}" not found in ${catalogType}` }, 404)
    }

    const abstractText = tutorial.abstract.map((item) => item.text).join(" ")
    const tutorialUrl = `https://it-training.apple.com${tutorial.url}`

    return c.json({
      tutorialId,
      catalog: catalogType,
      title: tutorial.title,
      abstract: abstractText,
      estimatedTime: tutorial.estimatedTime,
      kind: tutorial.kind,
      url: tutorialUrl,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return c.json({ error: `Failed to fetch tutorial: ${errorMessage}` }, 500)
  }
})

// Root route with information
app.get("/", (c) => {
  return c.text(
    `# Supportify

Making Apple Support guides and training tutorials AI-readable.

## Supported Content

### Apple Platform Guides
- **Security** - Apple Platform Security Guide
- **Deployment** - Apple Platform Deployment Guide

### Apple Device Support & Deployment Training
- **Device Support Training (apt-support)** - Complete training curriculum for Mac, iPhone, and iPad support
- **Deployment Training (apt-deployment)** - MDM, deployment, and device management

## Usage

### HTTP API

**Support Guides:**
\`\`\`
/guide/{guide-name}/{page-path}
/guide/{guide-name}/toc
/guide/{guide-name}/search?q={query}
\`\`\`

**Training Tutorials:**
\`\`\`
/training/catalog?type={apt-support|apt-deployment}
/training/search?q={query}&platform={iphone|ipad|mac|all}&catalog={apt-support|apt-deployment}
/training/{tutorialId}?catalog={apt-support|apt-deployment}
\`\`\`

### Examples

**Support Guides:**
- [Security Guide - Welcome](/guide/security/welcome)
- [Search Security Guide](/guide/security/search?q=encryption)

**Training:**
- [Device Support Catalog](/training/catalog?type=apt-support)
- [Deployment Catalog](/training/catalog?type=apt-deployment)
- [Search Support Training](/training/search?q=backup&catalog=apt-support)
- [Search Deployment Training](/training/search?q=mdm&catalog=apt-deployment)
- [Specific Tutorial](/training/sup005?catalog=apt-support)

### MCP Integration

Connect to \`/mcp\` endpoint for Model Context Protocol support.

**Available MCP Tools:**
- \`searchAppleSupportGuide\` - Search security/deployment guides
- \`fetchAppleSupportGuide\` - Fetch guide content as markdown
- \`searchAppleTraining\` - Search training tutorials
- \`fetchAppleTraining\` - Fetch training tutorial details
- \`listAppleTrainingCatalog\` - Get complete course structure

---
*Making Apple Support guides and training tutorials AI-readable*`,
    200,
    { "Content-Type": "text/markdown; charset=utf-8" },
  )
})

// Catch-all route for any other requests - returns 404
app.all("*", (c) => {
  return c.text(
    `# Not Found

The requested resource was not found on this server.

This service works with Apple Platform guides:

- \`/guide/security/{path}\` - Apple Platform Security Guide
- \`/guide/deployment/{path}\` - Apple Platform Deployment Guide

## Examples

- [Security Guide - Welcome](/guide/security/welcome)
- [Security Guide - Intro](/guide/security/intro-to-apple-platform-security-seccd5016d31)
- [Deployment Guide - Welcome](/guide/deployment/welcome)

---
*Making Apple Support guides AI-readable*`,
    404,
    { "Content-Type": "text/markdown; charset=utf-8" },
  )
})

app.onError((err, c) => {
  console.error("Error occurred:", err)

  if (err instanceof HTTPException) {
    // Get the custom response
    if (err.res && err.res.status === 200) {
      // If HTTPException contains a successful response (status 200), return it directly.
      // This is a workaround for cases where the transport incorrectly throws 406
      // despite a successful underlying operation.
      return err.res
    }
    // Otherwise, get the custom response from the HTTPException
    return err.getResponse()
  }

  if (err instanceof NotFoundError) {
    const accept = c.req.header("Accept")
    if (accept?.includes("application/json")) {
      return c.json(
        {
          error: "Support guide not found",
          message: "The requested Apple Support guide page does not exist.",
        },
        404,
      )
    }

    return c.text(
      `# Not Found

The requested Apple Support guide page does not exist.

## What you can try:

1. **Check the URL** - Make sure the path is correct
2. **Check the guide name** - Use "security" or "deployment"
3. **Browse from the welcome page** - Try starting from the guide's welcome page

## Examples of valid URLs:

- [Security Guide - Welcome](/guide/security/welcome)
- [Security Guide - Intro](/guide/security/intro-to-apple-platform-security-seccd5016d31)
- [Deployment Guide - Welcome](/guide/deployment/welcome)

---
*Making Apple Support guides AI-readable*`,
      404,
      { "Content-Type": "text/markdown; charset=utf-8" },
    )
  }

  // Handle unexpected errors
  const accept = c.req.header("Accept")
  if (accept?.includes("application/json")) {
    return c.json(
      {
        error: "Service temporarily unavailable",
        message:
          "We encountered an unexpected issue while processing your request. Please try again in a few moments.",
      },
      500,
    )
  }

  return c.text(
    `# Service Temporarily Unavailable

We encountered an unexpected issue while processing your request.

## What you can try:

1. **Wait a moment and try again** - This is often a temporary issue
2. **Check the URL** - Make sure you're using a valid Apple Support guide URL
3. **Try a different page** - Some pages may have temporary issues

## Examples of valid URLs:

- [Security Guide - Welcome](/guide/security/welcome)
- [Security Guide - Intro](/guide/security/intro-to-apple-platform-security-seccd5016d31)
- [Deployment Guide - Welcome](/guide/deployment/welcome)

If this issue persists, please report it.

---
*Making Apple Support guides AI-readable*`,
    500,
    { "Content-Type": "text/markdown; charset=utf-8" },
  )
})

export default app
