/**
 * Table of Contents parser for Apple Support guides
 * Extracts all topics and their URLs for easy discovery
 */

export interface TocItem {
  title: string
  slug: string
  url: string
  id: string
}

export interface TocSection {
  title: string
  items: TocItem[]
  subsections?: TocSection[]
}

/**
 * Fetch and parse the Table of Contents for a guide
 */
export async function fetchTableOfContents(guide: "security" | "deployment"): Promise<TocItem[]> {
  const tocUrl = `https://support.apple.com/guide/${guide}/toc`

  const response = await fetch(tocUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ToC: ${response.status}`)
  }

  const html = await response.text()
  return parseTocHtml(html)
}

/**
 * Parse ToC HTML and extract all topic items
 */
function parseTocHtml(html: string): TocItem[] {
  const items: TocItem[] = []

  // Match toc-item links with their data
  const tocItemRegex =
    /<a[^>]*class='toc-item'[^>]*href='([^']*)'[^>]*data-tocid='([^']*)'[^>]*>[\s\S]*?<span class='name'>([^<]+)<\/span>/g

  let match
  while ((match = tocItemRegex.exec(html)) !== null) {
    const url = match[1]
    const id = match[2]
    const title = match[3].trim()

    // Extract slug from URL: https://support.apple.com/guide/deployment/TITLE-SLUG/1/web/1.0
    const slugMatch = url.match(/\/guide\/[^/]+\/[^/]+-([a-z0-9]+)\//)
    if (slugMatch) {
      const slug = slugMatch[1]
      items.push({
        title,
        slug,
        url: url.replace(/\/1\/web\/1\.0$/, "/web"), // Normalize URL
        id,
      })
    }
  }

  return items
}

/**
 * Search ToC items by keyword
 */
export function searchToc(items: TocItem[], query: string): TocItem[] {
  const lowerQuery = query.toLowerCase()
  const words = lowerQuery.split(/\s+/).filter((w) => w.length > 2)

  return items
    .filter((item) => {
      const lowerTitle = item.title.toLowerCase()
      // Match if any search word appears in title
      return words.some((word) => lowerTitle.includes(word))
    })
    .slice(0, 20) // Limit to 20 results
}

/**
 * Find exact or best match for a topic
 */
export function findTopic(items: TocItem[], query: string): TocItem | null {
  const lowerQuery = query.toLowerCase().trim()

  // Try exact match first
  const exact = items.find((item) => item.title.toLowerCase() === lowerQuery)
  if (exact) return exact

  // Try contains match
  const contains = items.find((item) => item.title.toLowerCase().includes(lowerQuery))
  if (contains) return contains

  // Try word match
  const words = lowerQuery.split(/\s+/).filter((w) => w.length > 2)
  const wordMatch = items.find((item) => {
    const title = item.title.toLowerCase()
    return words.every((word) => title.includes(word))
  })

  return wordMatch || null
}
