/**
 * Types for Apple Support guide documentation
 */

export interface SupportGuideMetadata {
  title: string
  url: string
  guide: "security" | "deployment"
}

export interface ParsedContent {
  title: string
  body: string
  publishedDate?: string
  relatedLinks?: string[]
}
