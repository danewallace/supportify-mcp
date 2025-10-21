/**
 * Render Apple Support guide content as Markdown
 */

import type { ParsedContent } from "./types"

/**
 * Render parsed support guide content as Markdown
 *
 * @param content - Parsed content from HTML
 * @param sourceUrl - Original URL of the page
 * @returns Markdown string
 */
export function renderSupportGuideMarkdown(content: ParsedContent, sourceUrl: string): string {
  const parts: string[] = []

  // Title
  if (content.title) {
    parts.push(`# ${content.title}`)
    parts.push("")
  }

  // Source URL prominently at the top
  parts.push(`**📎 Source:** ${sourceUrl}`)
  parts.push("")
  parts.push("---")
  parts.push("")

  // Body content (already in markdown format from parser)
  if (content.body) {
    parts.push(content.body.trim())
    parts.push("")
  }

  // Published date
  if (content.publishedDate) {
    parts.push("")
    parts.push(`---`)
    parts.push(`*Published: ${content.publishedDate}*`)
  }

  // Related links
  if (content.relatedLinks && content.relatedLinks.length > 0) {
    parts.push("")
    parts.push("## Related Links")
    parts.push("")
    for (const link of content.relatedLinks) {
      parts.push(`- ${link}`)
    }
  }

  // Footer with source URL reminder
  parts.push("")
  parts.push("---")
  parts.push(`*Source: ${sourceUrl}*`)

  return parts.join("\n")
}
