/**
 * Apple Support guide module
 * Fetches and renders Apple Platform Security and Deployment guides
 */

export { fetchSupportGuidePage, parseSupportGuideHTML } from "./fetch"
export { renderSupportGuideMarkdown } from "./render"
export type { SupportGuideMetadata, ParsedContent } from "./types"
export { fetchTableOfContents, searchToc, findTopic } from "./toc"
export type { TocItem, TocSection } from "./toc"

// Cache for rendered markdown (guide/path -> {markdown, timestamp})
const MARKDOWN_CACHE: Map<string, { markdown: string; timestamp: number }> = new Map()
const MARKDOWN_CACHE_DURATION = 1000 * 60 * 60 * 24 // 24 hours
const MAX_MARKDOWN_CACHE_SIZE = 100

/**
 * Main function to fetch and render a support guide page
 * 
 * @param guide - The guide name ("security" or "deployment")
 * @param path - The page path/slug
 * @param sourceUrl - Optional source URL (will be generated if not provided)
 * @returns Markdown content
 */
export async function fetchAndRenderSupportGuide(
  guide: string,
  path: string,
  sourceUrl?: string,
): Promise<string> {
  // Normalize path for consistent caching
  const normalizedPath = path.replace(/^\/+|\/+$/g, "")
  const cacheKey = `${guide}/${normalizedPath}`
  
  // Check markdown cache first (fastest path)
  const cached = MARKDOWN_CACHE.get(cacheKey)
  const now = Date.now()
  
  if (cached && now - cached.timestamp < MARKDOWN_CACHE_DURATION) {
    console.log(`✓ Markdown cache hit for ${cacheKey}`)
    return cached.markdown
  }
  
  // Fetch and render
  const { fetchSupportGuidePage, parseSupportGuideHTML } = await import("./fetch")
  const { renderSupportGuideMarkdown } = await import("./render")
  
  const html = await fetchSupportGuidePage(guide, normalizedPath)
  const parsed = await parseSupportGuideHTML(html)
  
  const url = sourceUrl || `https://support.apple.com/guide/${guide}/${normalizedPath}/web`
  const markdown = renderSupportGuideMarkdown(parsed, url)
  
  // Cache the rendered markdown
  if (MARKDOWN_CACHE.size >= MAX_MARKDOWN_CACHE_SIZE) {
    const firstKey = MARKDOWN_CACHE.keys().next().value
    MARKDOWN_CACHE.delete(firstKey)
  }
  MARKDOWN_CACHE.set(cacheKey, { markdown, timestamp: now })
  console.log(`✓ Cached markdown for ${cacheKey}`)
  
  return markdown
}

