/**
 * Fetch functions for Apple Device Support Training tutorials
 */

import type { TrainingCatalog, TrainingSearchResult, TrainingTutorial } from "./types"

const TRAINING_BASE_URL = "https://it-training.apple.com"

export type TrainingCatalogType = "apt-support" | "apt-deployment"

/**
 * Get catalog URL for a specific training catalog
 */
function getCatalogUrl(catalog: TrainingCatalogType): string {
  return `${TRAINING_BASE_URL}/data/tutorials/${catalog}.json`
}

/**
 * Get tutorial subdirectory for a catalog type
 */
function getTutorialSubdir(catalog: TrainingCatalogType): string {
  return catalog === "apt-support" ? "support" : "deployment"
}

/**
 * Fetch the complete training catalog
 */
export async function fetchTrainingCatalog(
  catalog: TrainingCatalogType = "apt-support",
): Promise<TrainingCatalog> {
  const catalogUrl = getCatalogUrl(catalog)
  const response = await fetch(catalogUrl)

  if (!response.ok) {
    throw new Error(`Failed to fetch training catalog: ${response.status} ${response.statusText}`)
  }

  return await response.json()
}

/**
 * Search training tutorials by query
 */
export async function searchTrainingTutorials(
  query: string,
  options?: {
    platform?: "iphone" | "ipad" | "mac" | "all"
    catalog?: TrainingCatalogType
  },
): Promise<TrainingSearchResult[]> {
  const catalog = await fetchTrainingCatalog(options?.catalog || "apt-support")
  const results: TrainingSearchResult[] = []
  const queryLower = query.toLowerCase()

  // Search through references for tutorials
  for (const [key, ref] of Object.entries(catalog.references)) {
    // Skip non-tutorial references (images, etc.)
    if (!("kind" in ref) || ref.type !== "topic") {
      continue
    }

    const tutorial = ref as TrainingTutorial

    // Extract tutorial ID from identifier or URL
    const tutorialId = tutorial.url.split("/").pop() || ""

    // Build searchable text
    const titleText = tutorial.title.toLowerCase()
    const abstractText = tutorial.abstract
      .map((item) => item.text)
      .join(" ")
      .toLowerCase()
    const searchText = `${titleText} ${abstractText}`

    // Check if query matches
    if (!searchText.includes(queryLower)) {
      continue
    }

    // Platform filtering
    if (options?.platform && options.platform !== "all") {
      const platformKeywords = {
        iphone: ["iphone", "ios"],
        ipad: ["ipad", "ipados"],
        mac: ["mac", "macos"],
      }

      const keywords = platformKeywords[options.platform]
      const matchesPlatform = keywords.some((keyword) => searchText.includes(keyword))

      if (!matchesPlatform) {
        continue
      }
    }

    // Find which volume and chapter this tutorial belongs to
    let volumeName: string | undefined
    let chapterName: string | undefined

    for (const section of catalog.sections) {
      if (section.kind === "volume" && section.chapters) {
        for (const chapter of section.chapters) {
          if (chapter.tutorials.includes(tutorial.identifier)) {
            volumeName = section.name
            chapterName = chapter.name
            break
          }
        }
      }
    }

    results.push({
      tutorialId,
      title: tutorial.title,
      abstract: tutorial.abstract.map((item) => item.text).join(" "),
      estimatedTime: tutorial.estimatedTime,
      url: `${TRAINING_BASE_URL}${tutorial.url}`,
      kind: tutorial.kind,
      volume: volumeName,
      chapter: chapterName,
    })
  }

  // Sort by relevance (exact title match first, then by estimated time)
  results.sort((a, b) => {
    const aExactMatch = a.title.toLowerCase() === queryLower
    const bExactMatch = b.title.toLowerCase() === queryLower

    if (aExactMatch && !bExactMatch) return -1
    if (!aExactMatch && bExactMatch) return 1

    return 0
  })

  return results
}

/**
 * Fetch a specific training tutorial by ID (metadata only)
 */
export async function fetchTrainingTutorial(
  tutorialId: string,
  catalog: TrainingCatalogType = "apt-support",
): Promise<TrainingTutorial | null> {
  const catalogData = await fetchTrainingCatalog(catalog)

  // Search through references for the tutorial
  for (const [key, ref] of Object.entries(catalogData.references)) {
    if (!("kind" in ref) || ref.type !== "topic") {
      continue
    }

    const tutorial = ref as TrainingTutorial
    const refTutorialId = tutorial.url.split("/").pop()

    if (refTutorialId === tutorialId || tutorial.identifier.includes(tutorialId)) {
      return tutorial
    }
  }

  return null
}

/**
 * Fetch full tutorial content with sections and tasks
 */
export async function fetchTrainingTutorialContent(
  tutorialId: string,
  catalog: TrainingCatalogType = "apt-support",
): Promise<string> {
  // Fetch the full tutorial JSON
  const subdir = getTutorialSubdir(catalog)
  const contentUrl = `${TRAINING_BASE_URL}/data/tutorials/${subdir}/${tutorialId}.json`
  const response = await fetch(contentUrl)

  if (!response.ok) {
    throw new Error(`Failed to fetch tutorial content: ${response.status} ${response.statusText}`)
  }

  const tutorialData = await response.json()

  // Convert to markdown
  let markdown = `# ${tutorialData.metadata.title}\n\n`

  // Add metadata
  if (tutorialData.sections?.[0]?.estimatedTimeInMinutes) {
    const hours = Math.floor(tutorialData.sections[0].estimatedTimeInMinutes / 60)
    const mins = tutorialData.sections[0].estimatedTimeInMinutes % 60
    const timeStr = hours > 0 ? `${hours}hr ${mins}min` : `${mins}min`
    markdown += `**Estimated Time**: ${timeStr}\n\n`
  }

  if (tutorialData.sections?.[0]?.chapter) {
    markdown += `**Chapter**: ${tutorialData.sections[0].chapter}\n\n`
  }

  // Add overview/abstract from hero section
  const heroSection = tutorialData.sections?.find((s: any) => s.kind === "hero")
  if (heroSection?.content) {
    markdown += `## Overview\n\n`
    for (const para of heroSection.content) {
      if (para.type === "paragraph" && para.inlineContent) {
        const text = para.inlineContent.map((item: any) => item.text || "").join("")
        markdown += `${text}\n\n`
      }
    }
  }

  // Add tutorial sections
  if (tutorialData.hierarchy?.modules) {
    for (const module of tutorialData.hierarchy.modules) {
      if (module.projects) {
        for (const project of module.projects) {
          if (project.sections) {
            for (const section of project.sections) {
              // Extract section title from reference
              const sectionId = section.reference.split("#").pop() || ""
              const sectionTitle = sectionId
                .split("-")
                .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")

              if (section.kind === "task") {
                markdown += `### ${sectionTitle}\n\n`
                markdown += `*Task*\n\n`
              } else if (section.kind === "assessment") {
                markdown += `### ${sectionTitle}\n\n`
                markdown += `*Assessment*\n\n`
              } else if (section.kind === "heading") {
                markdown += `### ${sectionTitle}\n\n`
              }
            }
          }
        }
      }
    }
  }

  // Add footer with source
  const tutorialUrl = `${TRAINING_BASE_URL}/tutorials/${subdir}/${tutorialId}`
  markdown += `---\n\n`
  markdown += `**Interactive Tutorial**: ${tutorialUrl}\n\n`
  markdown += `*Note: This tutorial includes hands-on exercises and assessments. `
  markdown += `Visit the interactive version for the complete learning experience.*\n`

  return markdown
}

/**
 * Get the full training catalog structure
 */
export async function getTrainingStructure(catalog: TrainingCatalogType = "apt-support"): Promise<{
  title: string
  estimatedTime?: string
  volumes: Array<{
    name: string
    chapters: Array<{
      name: string
      tutorials: Array<{
        id: string
        title: string
        estimatedTime?: string
      }>
    }>
  }>
}> {
  const catalogData = await fetchTrainingCatalog(catalog)

  const volumes = catalogData.sections
    .filter((section) => section.kind === "volume")
    .map((section) => ({
      name: section.name || "Unnamed Volume",
      chapters: (section.chapters || []).map((chapter) => ({
        name: chapter.name,
        tutorials: chapter.tutorials
          .map((tutorialIdentifier) => {
            const tutorial = catalogData.references[tutorialIdentifier] as
              | TrainingTutorial
              | undefined
            if (!tutorial || !("kind" in tutorial)) return null

            return {
              id: tutorial.url.split("/").pop() || "",
              title: tutorial.title,
              estimatedTime: tutorial.estimatedTime,
            }
          })
          .filter((t): t is { id: string; title: string; estimatedTime?: string } => t !== null),
      })),
    }))

  return {
    title: catalogData.metadata.title,
    estimatedTime: catalogData.metadata.estimatedTime,
    volumes,
  }
}
