import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

import { fetchAndRenderSupportGuide } from "./support"

export function createMcpServer() {
  const server = new McpServer({
    name: "supportify",
    version: "1.0.0",
  })

  // Register support://{guide}/{path} resource template
  server.registerResource(
    "appleSupportGuide",
    new ResourceTemplate("support://{guide}/{path}", { list: undefined }),
    {
      title: "Apple Support Guides",
      description: "Apple Platform Security and Deployment guides as Markdown",
    },
    async (uri, { guide, path }) => {
      try {
        // Percent decode the parameters
        const decodedGuide = decodeURIComponent(guide.toString())
        const decodedPath = decodeURIComponent(path.toString())

        // Validate guide name
        if (decodedGuide !== "security" && decodedGuide !== "deployment") {
          throw new Error(`Invalid guide name: ${decodedGuide}. Must be "security" or "deployment"`)
        }

        const markdown = await fetchAndRenderSupportGuide(decodedGuide, decodedPath)

        if (!markdown || markdown.trim().length < 100) {
          throw new Error("Insufficient content in support guide page")
        }

        return {
          contents: [
            {
              uri: uri.href,
              text: markdown,
              mimeType: "text/markdown",
            },
          ],
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error fetching content: ${errorMessage}`,
              mimeType: "text/plain",
            },
          ],
        }
      }
    },
  )

  // Register fetch support guide tool
  server.registerTool(
    "fetchAppleSupportGuide",
    {
      title: "Fetch Apple Support Guide",
      description:
        "Fetch Apple Platform Security or Deployment guide by path and return as markdown",
      inputSchema: {
        guide: z
          .enum(["security", "deployment"])
          .describe('Guide name: "security" or "deployment"'),
        path: z
          .string()
          .describe(
            "Page path/slug (e.g., 'welcome', 'intro-to-apple-platform-security-seccd5016d31')",
          ),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ guide, path }) => {
      try {
        const markdown = await fetchAndRenderSupportGuide(guide, path)

        if (!markdown || markdown.trim().length < 100) {
          throw new Error("Insufficient content in support guide page")
        }

        return {
          content: [
            {
              type: "text" as const,
              text: markdown,
            },
          ],
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"

        return {
          content: [
            {
              type: "text" as const,
              text: `Error fetching content for "${guide}/${path}": ${errorMessage}`,
            },
          ],
        }
      }
    },
  )

  return server
}
