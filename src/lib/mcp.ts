import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

import { fetchAndRenderSupportGuide, fetchTableOfContents, searchToc } from "./support"

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

  // Register search tool (use this FIRST to find the right page)
  server.registerTool(
    "searchAppleSupportGuide",
    {
      title: "Search Apple Support Guides",
      description:
        "Search for topics in Apple Platform Security or Deployment guides. Use this FIRST to find the correct page slug before fetching content. Remember to cite the source URLs when using information from these guides in your responses.",
      inputSchema: {
        guide: z
          .enum(["security", "deployment"])
          .describe('Guide name: "security" or "deployment"'),
        query: z
          .string()
          .describe(
            "Search query (e.g., 'declarative device management', 'secure enclave', 'enrollment')",
          ),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ guide, query }) => {
      try {
        const toc = await fetchTableOfContents(guide)
        const results = searchToc(toc, query)

        if (results.length === 0) {
          return {
            content: [
              {
                type: "text" as const,
                text: `No results found for "${query}" in the ${guide} guide.`,
              },
            ],
          }
        }

        // Format results as markdown
        let markdown = `# Search Results: "${query}" in ${guide} guide\n\n`
        markdown += `Found ${results.length} result${results.length === 1 ? "" : "s"}:\n\n`

        for (const result of results.slice(0, 10)) {
          // Limit to top 10
          markdown += `## ${result.title}\n`
          markdown += `- **Slug**: \`${result.slug}\`\n`
          markdown += `- **URL**: ${result.url}\n\n`
        }

        if (results.length > 10) {
          markdown += `\n*Showing top 10 of ${results.length} results*\n`
        }

        markdown += `\n---\n\n**Next step**: Use the \`fetchAppleSupportGuide\` tool with the slug from the most relevant result above.\n`
        markdown += `For example: \`fetchAppleSupportGuide({ guide: "${guide}", path: "${results[0].slug}" })\`\n`

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
              text: `Error searching ${guide} guide for "${query}": ${errorMessage}`,
            },
          ],
        }
      }
    },
  )

  // Register fetch support guide tool (use AFTER searching)
  server.registerTool(
    "fetchAppleSupportGuide",
    {
      title: "Fetch Apple Support Guide Page",
      description:
        "Fetch specific Apple Platform Security or Deployment guide page by slug and return as markdown. Use searchAppleSupportGuide first to find the correct slug. IMPORTANT: When answering user questions, always cite the source URLs from the articles you use. Include links to the referenced articles in your response.",
      inputSchema: {
        guide: z
          .enum(["security", "deployment"])
          .describe('Guide name: "security" or "deployment"'),
        path: z
          .string()
          .describe(
            "Page slug from search results (e.g., 'depb1bab77f8', 'sec59b0b31ff'). Get this from searchAppleSupportGuide first.",
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
        const sourceUrl = `https://support.apple.com/guide/${guide}/${path}/web`
        const markdown = await fetchAndRenderSupportGuide(guide, path, sourceUrl)

        if (!markdown || markdown.trim().length < 100) {
          throw new Error("Insufficient content in support guide page")
        }

        // Add a reminder about citing sources at the end
        const markdownWithCitation = `${markdown}\n\n---\n\n**⚠️ IMPORTANT**: When using this information to answer questions, cite this source URL in your response: ${sourceUrl}`

        return {
          content: [
            {
              type: "text" as const,
              text: markdownWithCitation,
            },
          ],
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"

        return {
          content: [
            {
              type: "text" as const,
              text: `Error fetching content for "${guide}/${path}": ${errorMessage}\n\nTip: Use searchAppleSupportGuide first to find the correct page slug.`,
            },
          ],
        }
      }
    },
  )

  return server
}
