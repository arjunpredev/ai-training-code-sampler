import type { FileEntry } from '../types/file-types'
import type { JsonlRecord, EncodingOptions, EncodingResult, EncodingStats, ExclusionLogEntry } from '../types/encoding-types'
import { detectLanguage } from './language-utils'
import { shouldExcludePath, shouldExcludeFile } from './file-filter-utils'

/**
 * Creates a JSONL record from a file entry
 * Matches Python encode_repositories.py format exactly: {repo, filename, text}
 * @param file - The file entry to convert
 * @param repoName - The repository name to use
 * @returns A JSONL record object
 */
function createJsonlRecord(file: FileEntry, repoName: string): JsonlRecord {
  return {
    repo: repoName,
    filename: file.path,
    text: file.content
  }
}

/**
 * Encodes files and returns full result with stats
 * Uses blocklist approach matching Python encode_repositories.py
 * @param files - Array of file entries to encode
 * @param allFiles - Original array of all files (for excluded count)
 * @param options - Encoding options
 * @returns Encoding result with content, stats, and excluded files
 */
export function encodeFilesWithStats(
  files: FileEntry[],
  allFiles: FileEntry[],
  options: EncodingOptions = {}
): EncodingResult {
  const repoName = options.repoName || 'repository'

  // Filter out directories
  const includableFiles = files.filter(f => !f.isDirectory)
  const allNonDirFiles = allFiles.filter(f => !f.isDirectory)

  // Build language breakdown
  const languageBreakdown: Record<string, number> = {}
  let totalCharacters = 0

  const lines: string[] = []

  for (const file of includableFiles) {
    const record = createJsonlRecord(file, repoName)
    lines.push(JSON.stringify(record))

    // Track language stats
    const language = detectLanguage(file.path)
    languageBreakdown[language] = (languageBreakdown[language] || 0) + file.content.length
    totalCharacters += file.content.length
  }

  // Build exclusion log with detailed reasons
  const includedPaths = new Set(includableFiles.map(f => f.path))
  const exclusionLog: ExclusionLogEntry[] = []
  const excludedFiles: string[] = []

  for (const file of allNonDirFiles) {
    if (!includedPaths.has(file.path)) {
      excludedFiles.push(file.path)

      // Determine exclusion reason (matching Python logic)
      let reason = 'Unknown'
      if (shouldExcludePath(file.path)) {
        reason = 'Excluded by directory pattern (node_modules, .git, etc.)'
      } else if (shouldExcludeFile(file.path)) {
        reason = 'Binary file (image, archive, executable, etc.)'
      }

      exclusionLog.push({ path: file.path, reason })
    }
  }

  const stats: EncodingStats = {
    totalFiles: allNonDirFiles.length,
    includedFiles: includableFiles.length,
    excludedFiles: excludedFiles.length,
    totalCharacters,
    languageBreakdown
  }

  return {
    jsonlContent: lines.join('\n'),
    stats,
    excludedFiles,
    exclusionLog
  }
}

