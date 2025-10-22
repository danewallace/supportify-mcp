import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

import { fetchAndRenderSupportGuide, fetchTableOfContents, searchToc } from "./support"
import {
  fetchTrainingTutorialContent,
  getTrainingStructure,
  searchTrainingTutorials,
  type TrainingCatalogType,
  type TrainingSearchResult,
} from "./training"

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

  // ============================================================================
  // APPLE TRAINING TUTORIALS
  // ============================================================================

  // Register search training tool
  server.registerTool(
    "searchAppleTraining",
    {
      title: "Search Apple Device Support Training",
      description:
        "Search for training tutorials in Apple Device Support and Deployment courses (it-training.apple.com). Covers iPhone, iPad, and Mac troubleshooting, setup, networking, security, diagnostics, MDM, and deployment. Use this to find official Apple training content for help desk staff and IT administrators.",
      inputSchema: {
        query: z
          .string()
          .describe(
            "Search query (e.g., 'backup iphone', 'wifi troubleshooting mac', 'mdm enrollment', 'filevault')",
          ),
        catalog: z
          .enum(["apt-support", "apt-deployment", "both"])
          .optional()
          .default("both")
          .describe(
            'Training catalog: "apt-support" (device support/troubleshooting), "apt-deployment" (MDM/deployment), or "both" (default)',
          ),
        platform: z
          .enum(["iphone", "ipad", "mac", "all"])
          .optional()
          .describe("Filter by platform (optional)"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ query, catalog = "both", platform }) => {
      try {
        // Search in one or both catalogs
        const catalogsToSearch: TrainingCatalogType[] =
          catalog === "both" ? ["apt-support", "apt-deployment"] : [catalog as TrainingCatalogType]

        const allResults: Array<{
          catalogType: TrainingCatalogType
          results: TrainingSearchResult[]
        }> = []

        for (const catalogType of catalogsToSearch) {
          const results = await searchTrainingTutorials(query, {
            platform: platform || "all",
            catalog: catalogType,
          })
          if (results.length > 0) {
            allResults.push({ catalogType, results })
          }
        }

        const totalResults = allResults.reduce((sum, item) => sum + item.results.length, 0)

        if (totalResults === 0) {
          return {
            content: [
              {
                type: "text" as const,
                text: `No training tutorials found for "${query}"${platform && platform !== "all" ? ` on ${platform}` : ""}.`,
              },
            ],
          }
        }

        // Format results as markdown
        let markdown = `# Apple Training Results: "${query}"\n\n`
        markdown += `Found ${totalResults} tutorial${totalResults === 1 ? "" : "s"}:\n\n`

        for (const { catalogType, results } of allResults) {
          const catalogTitle =
            catalogType === "apt-support"
              ? "Apple Device Support Training"
              : "Apple Deployment & Management Training"
          markdown += `## ${catalogTitle}\n\n`

          for (const result of results.slice(0, 10)) {
            markdown += `### ${result.title}\n`
            markdown += `- **ID**: \`${result.tutorialId}\`\n`
            markdown += `- **Catalog**: \`${catalogType}\`\n`
            markdown += `- **Type**: ${result.kind}\n`
            if (result.estimatedTime) {
              markdown += `- **Duration**: ${result.estimatedTime}\n`
            }
            if (result.volume) {
              markdown += `- **Volume**: ${result.volume}\n`
            }
            if (result.chapter) {
              markdown += `- **Chapter**: ${result.chapter}\n`
            }
            markdown += `- **URL**: ${result.url}\n`
            markdown += `\n${result.abstract}\n\n`
          }

          if (results.length > 10) {
            markdown += `\n*Showing top 10 of ${results.length} results from ${catalogTitle}*\n\n`
          }
        }

        // Get the first result from the first catalog
        const firstResult = allResults[0].results[0]
        const firstCatalog = allResults[0].catalogType

        markdown += `\n---\n\n**Next step**: Use the \`fetchAppleTraining\` tool with the tutorial ID and catalog from the most relevant result above.\n`
        markdown += `For example: \`fetchAppleTraining({ tutorialId: "${firstResult.tutorialId}", catalog: "${firstCatalog}" })\`\n`

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
              text: `Error searching Apple training for "${query}": ${errorMessage}`,
            },
          ],
        }
      }
    },
  )

  // Register fetch training tutorial tool
  server.registerTool(
    "fetchAppleTraining",
    {
      title: "Fetch Apple Training Tutorial",
      description:
        "Fetch a specific Apple Device Support or Deployment training tutorial by ID. Returns full tutorial content as markdown including overview, sections, tasks, and assessments. Use searchAppleTraining first to find the correct tutorial ID and catalog. IMPORTANT: When using this information, cite the source URL.",
      inputSchema: {
        tutorialId: z
          .string()
          .describe(
            "Tutorial ID from search results (e.g., 'sup005', 'sup110', 'dep100'). Get this from searchAppleTraining first.",
          ),
        catalog: z
          .enum(["apt-support", "apt-deployment"])
          .optional()
          .default("apt-support")
          .describe('Training catalog: "apt-support" or "apt-deployment"'),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ tutorialId, catalog = "apt-support" }) => {
      try {
        // Fetch full tutorial content as markdown
        const markdown = await fetchTrainingTutorialContent(tutorialId, catalog)

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
              text: `Error fetching training tutorial "${tutorialId}": ${errorMessage}\n\nTip: Use searchAppleTraining first to find the correct tutorial ID.`,
            },
          ],
        }
      }
    },
  )

  // Register list training catalog tool
  server.registerTool(
    "listAppleTrainingCatalog",
    {
      title: "List Apple Training Course Structure",
      description:
        "Get the complete structure of Apple Device Support or Deployment training courses, including all volumes, chapters, and tutorials. Useful for understanding the full curriculum and finding tutorials by topic area.",
      inputSchema: {
        catalog: z
          .enum(["apt-support", "apt-deployment"])
          .optional()
          .default("apt-support")
          .describe(
            'Training catalog: "apt-support" (device support/troubleshooting) or "apt-deployment" (MDM/deployment)',
          ),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ catalog = "apt-support" }) => {
      try {
        const structure = await getTrainingStructure(catalog)

        // Format catalog as markdown
        let markdown = `# ${structure.title}\n\n`

        if (structure.estimatedTime) {
          markdown += `**Total Duration**: ${structure.estimatedTime}\n\n`
        }

        markdown += `## Course Structure\n\n`

        for (const volume of structure.volumes) {
          markdown += `### ${volume.name}\n\n`

          for (const chapter of volume.chapters) {
            markdown += `#### ${chapter.name}\n\n`

            if (chapter.tutorials.length > 0) {
              for (const tutorial of chapter.tutorials) {
                markdown += `- **${tutorial.title}** (\`${tutorial.id}\`)`
                if (tutorial.estimatedTime) {
                  markdown += ` - ${tutorial.estimatedTime}`
                }
                markdown += `\n`
              }
              markdown += `\n`
            }
          }
        }

        markdown += `---\n\n`
        markdown += `**Next steps**:\n`
        markdown += `- Use \`searchAppleTraining\` to find tutorials by topic\n`
        markdown += `- Use \`fetchAppleTraining\` with a tutorial ID to get details\n`

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
              text: `Error fetching training catalog: ${errorMessage}`,
            },
          ],
        }
      }
    },
  )

  return server
}
