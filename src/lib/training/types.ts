/**
 * Types for Apple Device Support Training tutorials
 * Based on Apple's DocC format at it-training.apple.com
 */

export interface TrainingTutorial {
  identifier: string // e.g., "doc://com.apple.support/tutorials/support/sup005"
  url: string // e.g., "/tutorials/support/sup005"
  title: string
  abstract: Array<{ type: string; text: string }>
  estimatedTime?: string // e.g., "1hr 0min"
  kind: "article" | "project" | "overview"
  role: "article" | "project" | "overview"
  type: "topic"
}

export interface TrainingChapter {
  name: string
  image?: string
  content: Array<{ type: string; inlineContent: Array<{ type: string; text: string }> }>
  tutorials: string[] // Tutorial identifiers
}

export interface TrainingVolume {
  name: string
  kind: "volume"
  image?: string
  content: Array<{ type: string; inlineContent: Array<{ type: string; text: string }> }>
  chapters: TrainingChapter[]
}

export interface TrainingCatalog {
  identifier: {
    interfaceLanguage: string
    url: string
  }
  metadata: {
    title: string
    role: string
    category: string
    categoryPathComponent: string
    estimatedTime?: string
  }
  sections: Array<{
    kind: "hero" | "volume"
    title?: string
    name?: string
    content?: any[]
    chapters?: TrainingChapter[]
    image?: string
    backgroundImage?: string
  }>
  references: Record<string, TrainingTutorial | { type: "image"; variants: any[] }>
  schemaVersion: {
    major: number
    minor: number
    patch: number
  }
}

export interface TrainingSearchResult {
  tutorialId: string
  title: string
  abstract: string
  estimatedTime?: string
  url: string
  kind: string
  volume?: string
  chapter?: string
}
