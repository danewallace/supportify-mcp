/**
 * Apple Support guide module
 * Fetches and renders Apple Platform Security and Deployment guides
 */

export { fetchSupportGuidePage, parseSupportGuideHTML } from "./fetch"
export { renderSupportGuideMarkdown } from "./render"
export type { SupportGuideMetadata, ParsedContent } from "./types"

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
  const { fetchSupportGuidePage, parseSupportGuideHTML } = await import("./fetch")
  const { renderSupportGuideMarkdown } = await import("./render")
  
  const html = await fetchSupportGuidePage(guide, path)
  const parsed = await parseSupportGuideHTML(html)
  
  const url = sourceUrl || `https://support.apple.com/guide/${guide}/${path}/web`
  return renderSupportGuideMarkdown(parsed, url)
}

