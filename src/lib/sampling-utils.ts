import type { FileEntry } from '../types/file-types'
import { detectLanguage } from './language-utils'
import { isCodeFile } from './file-filter-utils'

/**
 * Options for sampling code files
 */
export interface SamplingOptions {
  /** Maximum total files to include */
  maxFiles?: number
  /** Maximum files per language */
  maxPerLanguage?: number
  /** Prioritize diversity across languages */
  prioritizeDiversity?: boolean
  /** Priority languages to ensure representation */
  priorityLanguages?: string[]
}

/**
 * Result of the sampling process
 */
export interface SamplingResult {
  /** Selected sample files */
  samples: FileEntry[]
  /** Files that were not selected */
  remaining: FileEntry[]
  /** Statistics about the sampling */
  stats: {
    totalFiles: number
    sampledFiles: number
    languageDistribution: Record<string, number>
  }
}

/**
 * Groups files by their detected language
 * @param files - Array of file entries to group
 * @returns Map of language name to file entries
 */
function groupFilesByLanguage(files: FileEntry[]): Map<string, FileEntry[]> {
  const groups = new Map<string, FileEntry[]>()

  for (const file of files) {
    if (file.isDirectory || !isCodeFile(file.path)) continue

    const language = detectLanguage(file.path)
    const existing = groups.get(language) || []
    existing.push(file)
    groups.set(language, existing)
  }

  return groups
}

/**
 * Samples code files with proportional representation across languages
 * @param files - Array of file entries to sample from
 * @param options - Sampling options
 * @returns Sampling result with selected files and stats
 */
export function sampleCodeFiles(
  files: FileEntry[],
  options: SamplingOptions = {}
): SamplingResult {
  const {
    maxFiles = 1000,
    maxPerLanguage = 100,
    prioritizeDiversity = true,
    priorityLanguages = []
  } = options

  // Filter to only code files (non-directories)
  const codeFiles = files.filter(f => !f.isDirectory && isCodeFile(f.path))

  // If total files is within limit, return all
  if (codeFiles.length <= maxFiles) {
    return {
      samples: codeFiles,
      remaining: [],
      stats: {
        totalFiles: codeFiles.length,
        sampledFiles: codeFiles.length,
        languageDistribution: calculateLanguageDistribution(codeFiles)
      }
    }
  }

  // Group by language
  const languageGroups = groupFilesByLanguage(codeFiles)
  const samples: FileEntry[] = []
  const sampledPaths = new Set<string>()

  if (prioritizeDiversity) {
    // First pass: ensure representation from priority languages
    for (const lang of priorityLanguages) {
      const langFiles = languageGroups.get(lang) || []
      const toSample = Math.min(langFiles.length, maxPerLanguage, Math.ceil(maxFiles / languageGroups.size))

      for (let i = 0; i < toSample && samples.length < maxFiles; i++) {
        if (!sampledPaths.has(langFiles[i].path)) {
          samples.push(langFiles[i])
          sampledPaths.add(langFiles[i].path)
        }
      }
    }

    // Second pass: proportionally sample from remaining languages
    const remainingSlots = maxFiles - samples.length
    const remainingLanguages = Array.from(languageGroups.keys()).filter(
      lang => !priorityLanguages.includes(lang)
    )

    if (remainingLanguages.length > 0 && remainingSlots > 0) {
      const slotsPerLanguage = Math.ceil(remainingSlots / remainingLanguages.length)

      for (const lang of remainingLanguages) {
        const langFiles = languageGroups.get(lang) || []
        const toSample = Math.min(langFiles.length, maxPerLanguage, slotsPerLanguage)

        for (let i = 0; i < toSample && samples.length < maxFiles; i++) {
          if (!sampledPaths.has(langFiles[i].path)) {
            samples.push(langFiles[i])
            sampledPaths.add(langFiles[i].path)
          }
        }
      }
    }
  } else {
    // Simple truncation: take first N files
    for (const file of codeFiles) {
      if (samples.length >= maxFiles) break
      samples.push(file)
      sampledPaths.add(file.path)
    }
  }

  // Calculate remaining files
  const remaining = codeFiles.filter(f => !sampledPaths.has(f.path))

  return {
    samples,
    remaining,
    stats: {
      totalFiles: codeFiles.length,
      sampledFiles: samples.length,
      languageDistribution: calculateLanguageDistribution(samples)
    }
  }
}

/**
 * Calculates the language distribution of a set of files
 * @param files - Array of file entries
 * @returns Record of language name to file count
 */
function calculateLanguageDistribution(files: FileEntry[]): Record<string, number> {
  const distribution: Record<string, number> = {}

  for (const file of files) {
    if (file.isDirectory) continue
    const language = detectLanguage(file.path)
    distribution[language] = (distribution[language] || 0) + 1
  }

  return distribution
}

