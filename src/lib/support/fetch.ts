/**
 * Apple Support guide fetching functionality
 */

import { getRandomUserAgent, NotFoundError } from "../fetch"
import type { ParsedContent } from "./types"

// Cache for fetched pages (guide/path -> {html, timestamp})
const PAGE_CACHE: Map<string, { html: string; timestamp: number }> = new Map()
const CACHE_DURATION = 1000 * 60 * 60 * 24 // 24 hours
const MAX_CACHE_SIZE = 100 // Limit cache size to prevent memory issues

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
  
  // Check cache first
  const cacheKey = `${guide}/${normalizedPath}`
  const cached = PAGE_CACHE.get(cacheKey)
  const now = Date.now()
  
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    console.log(`✓ Cache hit for ${cacheKey}`)
    return cached.html
  }
  
  // Construct the full URL
  const url = `https://support.apple.com/guide/${guide}/${normalizedPath}/web`
  
  console.log(`⟳ Fetching ${cacheKey}...`)
  const userAgent = getRandomUserAgent()
  
  const response = await fetch(url, {
    headers: {
      "User-Agent": userAgent,
      Accept: "text/html",
    },
    // Add timeout to prevent hanging
    signal: AbortSignal.timeout(15000), // 15 second timeout
  })
  
  if (!response.ok) {
    console.error(`Failed to fetch support guide page: ${response.status} ${response.statusText}`)
    if (response.status === 404) {
      throw new NotFoundError(`Apple Support guide page not found at ${url}`)
    }
    throw new Error(`Failed to fetch support guide page: ${response.status} ${response.statusText}`)
  }
  
  const html = await response.text()
  
  // Add to cache (with LRU eviction if needed)
  if (PAGE_CACHE.size >= MAX_CACHE_SIZE) {
    // Remove oldest entry
    const firstKey = PAGE_CACHE.keys().next().value
    PAGE_CACHE.delete(firstKey)
  }
  PAGE_CACHE.set(cacheKey, { html, timestamp: now })
  console.log(`✓ Cached ${cacheKey}`)
  
  return html
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
  private seenTextInContext = new Set<string>()
  private isInContentSection = false
  
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
    const id = element.getAttribute("id") || ""
    
    // Skip navigation, footers, and hidden content
    if (
      className.includes("globalnav") ||
      className.includes("localnav") ||
      className.includes("ac-gn") ||
      (className.includes("footer") && element.tagName === "div") ||
      id.includes("toc-hidden") ||
      id === "modal-toc-container"
    ) {
      this.skipContent = true
      return
    }
    
    // Reset skip content when entering main content
    if (element.tagName === "body" || id === "content-section") {
      this.skipContent = false
    }
    
    // Extract title from h1
    if (element.tagName === "h1" && !this.title) {
      this.isInTitle = true
    }
    
    // Main content body - only process content inside the apd-topic body
    if (element.tagName === "body" && (className.includes("apd-topic") || className.includes("AppleTopic"))) {
      this.isInMainContent = true
      this.skipContent = false
    }
    
    if (!this.isInMainContent || this.skipContent) return
    
    // Track when we enter a content section (Subhead divs, Feature divs, etc.)
    if ((className.includes("Subhead") || className.includes("Feature") || className.includes("Outro")) && element.tagName === "div") {
      this.isInContentSection = true
    }
    
    // Only process headings if we're in a content section
    // Headings (h1 for page title, h2-h4 for sections)
    if ((element.tagName === "h1" || element.tagName === "h2" || element.tagName === "h3" || element.tagName === "h4") && (this.isInContentSection || element.tagName === "h1")) {
      if (!this.isInHeading) {  // Prevent nested heading duplication
        this.isInHeading = true
        const level = element.tagName === "h1" ? "#" : element.tagName === "h2" ? "##" : element.tagName === "h3" ? "###" : "####"
        this.body.push(`\n\n${level} `)
      }
    }
    
    // Paragraphs (but skip if in footer or related links, and skip toc items)
    // Only process if we're in a content section
    if (element.tagName === "p" && !this.isInFooter && !this.isInRelatedLinks && !className.includes("toc") && this.isInContentSection) {
      if (!this.isInParagraph) {  // Prevent nested paragraph duplication
        this.isInParagraph = true
        this.body.push("\n\n")
      }
    }
    
    // Lists
    if (element.tagName === "ul" && !className.includes("globalnav")) {
      this.body.push("\n")
    }
    
    if (element.tagName === "li" && !className.includes("globalnav")) {
      if (!this.isInListItem) {  // Prevent nested list item duplication
        this.isInListItem = true
        this.body.push("\n- ")
      }
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
    
    // Create a unique key for this text in its context to prevent duplicates
    const contextKey = `${this.isInHeading ? 'h' : ''}${this.isInParagraph ? 'p' : ''}${this.isInListItem ? 'l' : ''}-${content.trim()}`
    
    // Skip if we've already seen this exact text in this context
    if (this.seenTextInContext.has(contextKey) && !this.isInLink && !this.isInCode && !this.isInStrong && !this.isInEmphasis) {
      return
    }
    
    // Add content if we're in any content state
    if (this.isInHeading || this.isInParagraph || this.isInListItem || this.isInLink || this.isInCode || this.isInStrong || this.isInEmphasis) {
      this.body.push(content)
      if (!this.isInLink && !this.isInCode && !this.isInStrong && !this.isInEmphasis) {
        this.seenTextInContext.add(contextKey)
      }
    }
    
    // Close inline formatting only on lastInText
    if (text.lastInText) {
      if (this.isInCode) {
        this.body.push("`")
        this.isInCode = false
      }
      if (this.isInStrong) {
        this.body.push("**")
        this.isInStrong = false
      }
      if (this.isInEmphasis) {
        this.body.push("*")
        this.isInEmphasis = false
      }
      if (this.isInLink) {
        this.body.push(`](${this.currentLinkHref})`)
        this.isInLink = false
        this.currentLinkHref = ""
      }
      if (this.isInHeading) {
        this.isInHeading = false
      }
      if (this.isInParagraph) {
        this.isInParagraph = false
      }
      if (this.isInListItem) {
        this.isInListItem = false
      }
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
  // Use the simple regex-based parser instead of HTMLRewriter
  // This avoids duplicate content from nested HTML elements
  const { parseAppleSupportHTML } = await import("./simple-parser")
  return parseAppleSupportHTML(html)
}

