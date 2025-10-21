/**
 * Simple HTML parser for Apple Support guides
 * Uses regex to extract content sections directly, avoiding nested element duplication
 */

export interface ParsedContent {
  title: string
  body: string
  publishedDate?: string
}

/**
 * Parse Apple Support guide HTML content
 * Extracts content from Subhead sections directly
 */
export function parseAppleSupportHTML(html: string): ParsedContent {
  let title = ""
  const sections: string[] = []
  let publishedDate: string | undefined

  // Extract title from h1 or title tag
  const titleMatch =
    html.match(/<h1[^>]*>([^<]+)<\/h1>/) || html.match(/<title[^>]*>([^<]+)<\/title>/)
  if (titleMatch) {
    title = titleMatch[1]
      .trim()
      .replace(/ - Apple Support$/, "")
      .replace(/Apple Platform /, "")
  }

  // Extract published date
  const pubDateMatch = html.match(/Published Date:\s*([^<]+)/)
  if (pubDateMatch) {
    publishedDate = pubDateMatch[1].trim()
  }

  // Extract intro paragraphs that appear before the first Subhead div
  // These are direct children of the body tag after h1
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<div[^>]*class="[^"]*Subhead[^"]*"/)
  if (bodyMatch) {
    const introSection = bodyMatch[1]
    const introParagraphRegex = /<p[^>]*>([^<](?:(?!<(?:p|div)[>\s])[\s\S])*?)<\/p>/g
    let pMatch

    while ((pMatch = introParagraphRegex.exec(introSection)) !== null) {
      let text = pMatch[1]

      // Clean up HTML tags and entities
      text = text
        .replace(/<span[^>]*class="NoBreak"[^>]*>([^<]+)<\/span>/g, "$1")
        .replace(/<span[^>]*>([^<]+)<\/span>/g, "$1")
        .replace(/<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g, "[$2]($1)")
        .replace(/<strong>([^<]+)<\/strong>/g, "**$1**")
        .replace(/<em>([^<]+)<\/em>/g, "*$1*")
        .replace(/&nbsp;/g, " ")
        .replace(/—/g, "—")
        .trim()

      if (text && text.length > 10) {
        // Skip very short fragments
        sections.push(`\n\n${text}`)
      }
    }
  }

  // Extract Subhead sections (the main content sections)
  const subheadRegex = /<div[^>]*class="[^"]*Subhead[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/g
  let match

  while ((match = subheadRegex.exec(html)) !== null) {
    const sectionHTML = match[1]

    // Extract heading (h2 with class="Name")
    const headingMatch = sectionHTML.match(/<h2[^>]*class="Name"[^>]*>([^<]+)<\/h2>/)
    if (headingMatch) {
      sections.push(`\n\n## ${headingMatch[1].trim()}`)
    }

    // Extract paragraphs (direct p tags)
    const paragraphRegex = /<p>([^<](?:(?!<p>)[\s\S])*?)<\/p>/g
    let pMatch

    while ((pMatch = paragraphRegex.exec(sectionHTML)) !== null) {
      let text = pMatch[1]

      // Clean up HTML entities and tags
      text = text
        .replace(/<span[^>]*class="NoBreak"[^>]*>([^<]+)<\/span>/g, "$1")
        .replace(/<span[^>]*>([^<]+)<\/span>/g, "$1")
        .replace(/<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g, "[$2]($1)")
        .replace(/<strong>([^<]+)<\/strong>/g, "**$1**")
        .replace(/<em>([^<]+)<\/em>/g, "*$1*")
        .replace(/&nbsp;/g, " ")
        .replace(/—/g, "—")
        .trim()

      if (text) {
        sections.push(`\n\n${text}`)
      }
    }
  }

  // Extract Outro section if present
  const outroMatch = html.match(/<div[^>]*class="Outro"[^>]*>([\s\S]*?)<\/div>/)
  if (outroMatch) {
    const outroHTML = outroMatch[1]
    const outroTextMatch = outroHTML.match(/<p>([^<]+(?:<[^>]+>[^<]+<\/[^>]+>)*[^<]*)<\/p>/)
    if (outroTextMatch) {
      const text = outroTextMatch[1]
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim()
      if (text) {
        sections.push(`\n\n${text}`)
      }
    }
  }

  return {
    title,
    body: sections.join(""),
    publishedDate,
  }
}
