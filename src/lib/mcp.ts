import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

import { fetchAndRenderSupportGuide, fetchTableOfContents, searchToc } from "./support"
import {
  fetchTrainingTutorialContent,
  getTrainingStructure,
  searchTrainingTutorials,
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
  // APPLE SUPPORT TRAINING (apt-support)
  // ============================================================================

  // Register search support training tool
  server.registerTool(
    "searchAppleSupportTraining",
    {
      title: "Search Apple Device Support Training",
      description:
        "Search for training tutorials in Apple Device Support course (it-training.apple.com/tutorials/apt-support). Covers iPhone, iPad, and Mac troubleshooting, setup, networking, security, and diagnostics. 40+ tutorials, 14hr 15min total. Use this to find official Apple training content for help desk staff.",
      inputSchema: {
        query: z
          .string()
          .describe(
            "Search query (e.g., 'backup iphone', 'wifi troubleshooting mac', 'filevault')",
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
    async ({ query, platform }) => {
      try {
        const results = await searchTrainingTutorials(query, {
          platform: platform || "all",
          catalog: "apt-support",
        })

        if (results.length === 0) {
          return {
            content: [
              {
                type: "text" as const,
                text: `No support training tutorials found for "${query}"${platform && platform !== "all" ? ` on ${platform}` : ""}.`,
              },
            ],
          }
        }

        // Format results as markdown
        let markdown = `# Apple Device Support Training Results: "${query}"\n\n`
        markdown += `Found ${results.length} tutorial${results.length === 1 ? "" : "s"}:\n\n`

        for (const result of results.slice(0, 10)) {
          markdown += `## ${result.title}\n`
          markdown += `- **ID**: \`${result.tutorialId}\`\n`
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
          markdown += `\n*Showing top 10 of ${results.length} results*\n`
        }

        markdown += `\n---\n\n**Next step**: Use \`fetchAppleSupportTraining\` with the tutorial ID from the most relevant result above.\n`
        markdown += `For example: \`fetchAppleSupportTraining({ tutorialId: "${results[0].tutorialId}" })\`\n`

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
              text: `Error searching Apple support training for "${query}": ${errorMessage}`,
            },
          ],
        }
      }
    },
  )

  // Register fetch support training tutorial tool
  server.registerTool(
    "fetchAppleSupportTraining",
    {
      title: "Fetch Apple Device Support Training Tutorial",
      description:
        "Fetch a specific Apple Device Support training tutorial by ID. Returns full tutorial content as markdown including overview, sections, tasks, and assessments. Use searchAppleSupportTraining first to find the correct tutorial ID. IMPORTANT: When using this information, cite the source URL.",
      inputSchema: {
        tutorialId: z
          .string()
          .describe(
            "Tutorial ID from search results (e.g., 'sup005', 'sup110', 'sup530'). Get this from searchAppleSupportTraining first.",
          ),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ tutorialId }) => {
      try {
        // Fetch full tutorial content as markdown
        const markdown = await fetchTrainingTutorialContent(tutorialId, "apt-support")

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
              text: `Error fetching support training tutorial "${tutorialId}": ${errorMessage}\n\nTip: Use searchAppleSupportTraining first to find the correct tutorial ID.`,
            },
          ],
        }
      }
    },
  )

  // Register list support training catalog tool
  server.registerTool(
    "listAppleSupportTrainingCatalog",
    {
      title: "List Apple Device Support Training Course Structure",
      description:
        "Get the complete structure of the Apple Device Support training course, including all volumes, chapters, and tutorials. 40+ tutorials, 14hr 15min total. Useful for understanding the full curriculum and finding tutorials by topic area.",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async () => {
      try {
        const structure = await getTrainingStructure("apt-support")

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
        markdown += `- Use \`searchAppleSupportTraining\` to find tutorials by topic\n`
        markdown += `- Use \`fetchAppleSupportTraining\` with a tutorial ID to get details\n`

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

  // ============================================================================
  // APPLE DEPLOYMENT TRAINING (apt-deployment)
  // ============================================================================

  // Register search deployment training tool
  server.registerTool(
    "searchAppleDeploymentTraining",
    {
      title: "Search Apple Deployment Training",
      description:
        "Search for training tutorials in Apple Deployment & Management course (it-training.apple.com/tutorials/apt-deployment). Covers MDM, device enrollment, management, deployment, and security. 50+ tutorials, 11hr 45min total. Use this to find official Apple training content for IT administrators.",
      inputSchema: {
        query: z
          .string()
          .describe("Search query (e.g., 'mdm enrollment', 'configuration profiles', 'filevault')"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ query }) => {
      try {
        const results = await searchTrainingTutorials(query, {
          catalog: "apt-deployment",
        })

        if (results.length === 0) {
          return {
            content: [
              {
                type: "text" as const,
                text: `No deployment training tutorials found for "${query}".`,
              },
            ],
          }
        }

        // Format results as markdown
        let markdown = `# Apple Deployment Training Results: "${query}"\n\n`
        markdown += `Found ${results.length} tutorial${results.length === 1 ? "" : "s"}:\n\n`

        for (const result of results.slice(0, 10)) {
          markdown += `## ${result.title}\n`
          markdown += `- **ID**: \`${result.tutorialId}\`\n`
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
          markdown += `\n*Showing top 10 of ${results.length} results*\n`
        }

        markdown += `\n---\n\n**Next step**: Use \`fetchAppleDeploymentTraining\` with the tutorial ID from the most relevant result above.\n`
        markdown += `For example: \`fetchAppleDeploymentTraining({ tutorialId: "${results[0].tutorialId}" })\`\n`

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
              text: `Error searching Apple deployment training for "${query}": ${errorMessage}`,
            },
          ],
        }
      }
    },
  )

  // Register fetch deployment training tutorial tool
  server.registerTool(
    "fetchAppleDeploymentTraining",
    {
      title: "Fetch Apple Deployment Training Tutorial",
      description:
        "Fetch a specific Apple Deployment & Management training tutorial by ID. Returns full tutorial content as markdown including overview, sections, tasks, and assessments. Use searchAppleDeploymentTraining first to find the correct tutorial ID. IMPORTANT: When using this information, cite the source URL.",
      inputSchema: {
        tutorialId: z
          .string()
          .describe(
            "Tutorial ID from search results (e.g., 'dm005', 'dm110', 'dm530'). Get this from searchAppleDeploymentTraining first.",
          ),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ tutorialId }) => {
      try {
        // Fetch full tutorial content as markdown
        const markdown = await fetchTrainingTutorialContent(tutorialId, "apt-deployment")

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
              text: `Error fetching deployment training tutorial "${tutorialId}": ${errorMessage}\n\nTip: Use searchAppleDeploymentTraining first to find the correct tutorial ID.`,
            },
          ],
        }
      }
    },
  )

  // Register list deployment training catalog tool
  server.registerTool(
    "listAppleDeploymentTrainingCatalog",
    {
      title: "List Apple Deployment Training Course Structure",
      description:
        "Get the complete structure of the Apple Deployment & Management training course, including all volumes, chapters, and tutorials. 50+ tutorials, 11hr 45min total. Useful for understanding the full curriculum and finding tutorials by topic area.",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async () => {
      try {
        const structure = await getTrainingStructure("apt-deployment")

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
        markdown += `- Use \`searchAppleDeploymentTraining\` to find tutorials by topic\n`
        markdown += `- Use \`fetchAppleDeploymentTraining\` with a tutorial ID to get details\n`

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
              text: `Error fetching deployment training catalog: ${errorMessage}`,
            },
          ],
        }
      }
    },
  )

  return server
}
