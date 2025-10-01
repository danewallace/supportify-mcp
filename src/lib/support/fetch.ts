/**
 * Apple Support guide fetching functionality
 */

import { getRandomUserAgent, NotFoundError } from "../fetch"
import type { ParsedContent } from "./types"

/**
 * Fetch Apple Support guide page HTML
 * 
 * @param guide - The guide name ("security" or "deployment")
 * @param path - The page path/slug
 * @returns HTML content
 */
export async function fetchSupportGuidePage(
  guide: string,
  path: string,
): Promise<string> {
  // Normalize the path - remove leading/trailing slashes
  const normalizedPath = path.replace(/^\/+|\/+$/g, "")
  
  // Construct the full URL
  const url = `https://support.apple.com/guide/${guide}/${normalizedPath}/web`
  
  const userAgent = getRandomUserAgent()
  
  const response = await fetch(url, {
    headers: {
      "User-Agent": userAgent,
      Accept: "text/html",
      "Cache-Control": "no-cache",
    },
  })
  
  if (!response.ok) {
    console.error(`Failed to fetch support guide page: ${response.status} ${response.statusText}`)
    if (response.status === 404) {
      throw new NotFoundError(`Apple Support guide page not found at ${url}`)
    }
    throw new Error(`Failed to fetch support guide page: ${response.status} ${response.statusText}`)
  }
  
  return await response.text()
}

/**
 * Parse Apple Support guide HTML content
 * Uses HTMLRewriter to extract content from the server-rendered HTML
 */
class SupportGuideParser {
  private title = ""
  private body: string[] = []
  private publishedDate?: string
  private relatedLinks: string[] = []
  
  private isInTitle = false
  private isInMainContent = false
  private isInHeading = false
  private isInParagraph = false
  private isInListItem = false
  private isInCode = false
  private isInStrong = false
  private isInEmphasis = false
  private isInLink = false
  private currentLinkHref = ""
  private isInFooter = false
  private isInRelatedLinks = false
  private skipContent = false
  
  getResult(): ParsedContent {
    return {
      title: this.title,
      body: this.body.join(""),
      publishedDate: this.publishedDate,
      relatedLinks: this.relatedLinks.length > 0 ? this.relatedLinks : undefined,
    }
  }
  
  element(element: Element) {
    // Skip navigation and other non-content areas
    const className = element.getAttribute("class") || ""
    if (
      className.includes("globalnav") ||
      className.includes("localnav") ||
      className.includes("ac-gn") ||
      className.includes("footer")
    ) {
      this.skipContent = true
      return
    }
    
    // Extract title from h1
    if (element.tagName === "h1" && !this.title) {
      this.isInTitle = true
    }
    
    // Main content body - only process content inside the AppleTopic body
    if (element.tagName === "body" && className.includes("AppleTopic")) {
      this.isInMainContent = true
      this.skipContent = false
    }
    
    if (!this.isInMainContent || this.skipContent) return
    
    // Headings
    if (element.tagName === "h2" || element.tagName === "h3" || element.tagName === "h4") {
      this.isInHeading = true
      const level = element.tagName === "h2" ? "##" : element.tagName === "h3" ? "###" : "####"
      this.body.push(`\n\n${level} `)
    }
    
    // Paragraphs
    if (element.tagName === "p" && !this.isInFooter && !this.isInRelatedLinks) {
      this.isInParagraph = true
      this.body.push("\n\n")
    }
    
    // Lists
    if (element.tagName === "ul" && !className.includes("globalnav")) {
      this.body.push("\n")
    }
    
    if (element.tagName === "li" && !className.includes("globalnav")) {
      this.isInListItem = true
      this.body.push("\n- ")
    }
    
    // Code/inline code
    if (element.tagName === "code" || className.includes("code")) {
      this.isInCode = true
      this.body.push("`")
    }
    
    // Strong/bold
    if (element.tagName === "strong" || element.tagName === "b") {
      this.isInStrong = true
      this.body.push("**")
    }
    
    // Emphasis/italic
    if (element.tagName === "em" || element.tagName === "i") {
      this.isInEmphasis = true
      this.body.push("*")
    }
    
    // Links
    if (element.tagName === "a" && !className.includes("globalnav")) {
      const href = element.getAttribute("href")
      if (href && !href.includes("javascript:") && !href.startsWith("#")) {
        this.isInLink = true
        this.currentLinkHref = href
        // Handle relative URLs
        if (href.startsWith("/")) {
          this.currentLinkHref = `https://support.apple.com${href}`
        }
        this.body.push("[")
      }
    }
    
    // Footer (for published date)
    if (element.tagName.toLowerCase() === "footer") {
      this.isInFooter = true
    }
    
    // Related links section
    if (className.includes("LinkUniversal")) {
      this.isInRelatedLinks = true
    }
  }
  
  text(text: Text) {
    if (this.skipContent && !this.isInMainContent) return
    
    const content = text.text
    if (!content || !content.trim()) return
    
    if (this.isInTitle && !this.title) {
      this.title = content.trim()
      this.isInTitle = false
      return
    }
    
    if (this.isInFooter && content.includes("Published Date:")) {
      this.publishedDate = content.replace("Published Date:", "").trim()
      return
    }
    
    if (this.isInRelatedLinks && this.isInLink && this.currentLinkHref) {
      this.relatedLinks.push(`${content.trim()} (${this.currentLinkHref})`)
      return
    }
    
    if (!this.isInMainContent || this.skipContent) return
    
    // Add content to body (only for main content area)
    if (this.isInHeading || this.isInParagraph || this.isInListItem || this.isInLink || this.isInCode || this.isInStrong || this.isInEmphasis) {
      this.body.push(content)
    }
    
    // Close inline formatting
    if (this.isInCode && text.lastInText) {
      this.body.push("`")
      this.isInCode = false
    }
    if (this.isInStrong && text.lastInText) {
      this.body.push("**")
      this.isInStrong = false
    }
    if (this.isInEmphasis && text.lastInText) {
      this.body.push("*")
      this.isInEmphasis = false
    }
    if (this.isInLink && text.lastInText) {
      this.body.push(`](${this.currentLinkHref})`)
      this.isInLink = false
      this.currentLinkHref = ""
    }
    if (this.isInHeading && text.lastInText) {
      this.isInHeading = false
    }
    if (this.isInParagraph && text.lastInText) {
      this.isInParagraph = false
    }
    if (this.isInListItem && text.lastInText) {
      this.isInListItem = false
    }
  }
}

/**
 * Parse HTML content into structured data
 * 
 * @param html - Raw HTML content
 * @returns Parsed content
 */
export async function parseSupportGuideHTML(html: string): Promise<ParsedContent> {
  const parser = new SupportGuideParser()
  
  const rewriter = new HTMLRewriter()
    .on("h1", parser)
    .on("h2", parser)
    .on("h3", parser)
    .on("h4", parser)
    .on("p", parser)
    .on("ul", parser)
    .on("li", parser)
    .on("code", parser)
    .on("strong", parser)
    .on("b", parser)
    .on("em", parser)
    .on("i", parser)
    .on("a", parser)
    .on("footer", parser)
    .on("body", parser)
    .on("div", parser)
  
  // Create a Response from the HTML string
  const response = new Response(html, {
    headers: { "Content-Type": "text/html" },
  })
  
  const transformedResponse = rewriter.transform(response)
  
  // Consume the response to trigger parsing
  await transformedResponse.text()
  
  return parser.getResult()
}

