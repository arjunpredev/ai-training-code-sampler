import JSZip from 'jszip'
import type { FileEntry, RepositoryStats } from '../types/file-types'
import { calculateBlobSize } from './download-utils'

/**
 * Summary of download contents with file sizes
 */
export interface DownloadSummary {
  sampleFiles: number
  jsonlSize: string
  samplesZipSize: string
  combinedZipSize: string
  totalSize: string
}

/**
 * Generates README content with language breakdown statistics
 */
function generateReadmeContent(stats?: RepositoryStats): string {
  if (!stats) {
    return `# Code Repository Sample

This archive contains a trimmed sample of your codebase, selected to represent approximately 5,000 lines of representative code.

## Contents
- \`samples/\` - Sampled source files
- \`.jsonl\` - Encoded repository content in JSONL format for processing by AI models

## Instructions
1. Extract the ZIP file
2. Review the sampled files in the \`samples/\` directory
3. Use the JSONL file for encoding/processing with AI models
`
  }

  const readme = `# Code Repository Sample

This archive contains a trimmed sample of your codebase, selected to represent the most important parts of your repository.

## Repository Statistics (at upload)
- **Total Lines**: ${stats.totalLines.toLocaleString()}
- **Total Characters**: ${(stats.totalChars / 1_000_000).toFixed(2)}M
- **Total Files**: ${stats.totalFiles}

## Language Breakdown
\`\`\`
Language          Lines      Characters    Files     % of Total
${stats.languages.map(lang =>
  `${lang.language.padEnd(17)} ${lang.lineCount.toString().padStart(10)} ${(lang.charCount / 1_000_000).toFixed(2).padStart(12)}M ${lang.fileCount.toString().padStart(5)} ${lang.percentage.toString().padStart(10)}%`
).join('\n')}
\`\`\`

## Contents
- \`samples/\` - Sampled source files
- \`.jsonl\` - Encoded repository content in JSONL format for processing by AI models

## Instructions
1. Extract the ZIP file
2. Review the sampled files in the \`samples/\` directory
3. Use the JSONL file for encoding/processing with AI models
`

  return readme
}

/**
 * Creates a combined results ZIP containing samples folder and JSONL file
 * @param sampledFiles - The sampled file entries
 * @param jsonlContent - The JSONL encoded content as a string
 * @param repoName - The repository name (used for folder naming)
 * @param stats - Optional repository statistics for README generation
 * @returns A Blob containing the combined ZIP file
 */
export async function createCombinedResultsZip(
  sampledFiles: FileEntry[],
  jsonlContent: string,
  repoName: string,
  stats?: RepositoryStats
): Promise<Blob> {
  const zip = new JSZip()

  // Create a folder for sampled files
  const samplesFolder = zip.folder('samples')
  if (!samplesFolder) {
    throw new Error('Failed to create samples folder in ZIP')
  }

  // Add all sampled files to the samples folder, preserving relative paths
  const nonDirFiles = sampledFiles.filter(f => !f.isDirectory)
  for (const file of nonDirFiles) {
    samplesFolder.file(file.path, file.content)
  }

  // Add JSONL file at root of ZIP
  const jsonlFilename = `${repoName.replace(/[^a-zA-Z0-9-_]/g, '-')}-encoded.jsonl`
  zip.file(jsonlFilename, jsonlContent)

  // Add README with language breakdown
  const readmeContent = generateReadmeContent(stats)
  zip.file('README.txt', readmeContent)

  // Generate the ZIP blob
  const blob = await zip.generateAsync({ type: 'blob' })
  return blob
}

/**
 * Prepares a download summary with file sizes and content breakdown
 * @param sampledFiles - The sampled file entries
 * @param jsonlContent - The JSONL encoded content
 * @param samplesZipBlob - The blob of the samples ZIP (before combining)
 * @param combinedZipBlob - The blob of the combined ZIP
 * @returns A DownloadSummary object
 */
export function prepareDownloadSummary(
  sampledFiles: FileEntry[],
  jsonlContent: string,
  samplesZipBlob: Blob,
  combinedZipBlob: Blob
): DownloadSummary {
  const jsonlBlob = new Blob([jsonlContent], { type: 'application/json' })

  return {
    sampleFiles: sampledFiles.filter(f => !f.isDirectory).length,
    jsonlSize: calculateBlobSize(jsonlBlob),
    samplesZipSize: calculateBlobSize(samplesZipBlob),
    combinedZipSize: calculateBlobSize(combinedZipBlob),
    totalSize: calculateBlobSize(combinedZipBlob)
  }
}

/**
 * Creates a samples-only ZIP file
 * @param sampledFiles - The sampled file entries
 * @returns A Blob containing the samples ZIP file
 */
export async function createSamplesZip(
  sampledFiles: FileEntry[]
): Promise<Blob> {
  const zip = new JSZip()

  const nonDirFiles = sampledFiles.filter(f => !f.isDirectory)
  for (const file of nonDirFiles) {
    zip.file(file.path, file.content)
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  return blob
}
