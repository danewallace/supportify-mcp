/**
 * Fetch functions for Apple Device Support Training tutorials
 */

import type { TrainingCatalog, TrainingSearchResult, TrainingTutorial } from "./types"

const TRAINING_BASE_URL = "https://it-training.apple.com"
const CATALOG_URL = `${TRAINING_BASE_URL}/data/tutorials/apt-support.json`

/**
 * Fetch the complete training catalog
 */
export async function fetchTrainingCatalog(): Promise<TrainingCatalog> {
  const response = await fetch(CATALOG_URL)

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
  platform?: "iphone" | "ipad" | "mac" | "all",
): Promise<TrainingSearchResult[]> {
  const catalog = await fetchTrainingCatalog()
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
    if (platform && platform !== "all") {
      const platformKeywords = {
        iphone: ["iphone", "ios"],
        ipad: ["ipad", "ipados"],
        mac: ["mac", "macos"],
      }

      const keywords = platformKeywords[platform]
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
 * Fetch a specific training tutorial by ID
 */
export async function fetchTrainingTutorial(tutorialId: string): Promise<TrainingTutorial | null> {
  const catalog = await fetchTrainingCatalog()

  // Search through references for the tutorial
  for (const [key, ref] of Object.entries(catalog.references)) {
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
 * Get the full training catalog structure
 */
export async function getTrainingStructure(): Promise<{
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
  const catalog = await fetchTrainingCatalog()

  const volumes = catalog.sections
    .filter((section) => section.kind === "volume")
    .map((section) => ({
      name: section.name || "Unnamed Volume",
      chapters: (section.chapters || []).map((chapter) => ({
        name: chapter.name,
        tutorials: chapter.tutorials
          .map((tutorialIdentifier) => {
            const tutorial = catalog.references[tutorialIdentifier] as TrainingTutorial | undefined
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
    title: catalog.metadata.title,
    estimatedTime: catalog.metadata.estimatedTime,
    volumes,
  }
}
