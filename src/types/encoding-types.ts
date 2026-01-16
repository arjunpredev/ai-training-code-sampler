/**
 * Represents a single record in the JSONL output
 * Matches Python encode_repositories.py format exactly
 */
export interface JsonlRecord {
  /** Repository identifier */
  repo: string
  /** Full filename/path within the repository */
  filename: string
  /** File content as text */
  text: string
}

/**
 * Represents a single exclusion decision
 */
export interface ExclusionLogEntry {
  /** Path of the excluded file */
  path: string
  /** Reason for exclusion */
  reason: string
}

/**
 * Options for the encoding process
 */
export interface EncodingOptions {
  /** Whether to include metadata in output */
  includeMetadata?: boolean
  /** Glob patterns for files to exclude */
  excludePatterns?: string[]
  /** Repository name to use in JSONL records */
  repoName?: string
}

/**
 * Result of the encoding process
 */
export interface EncodingResult {
  /** The JSONL content as a string */
  jsonlContent: string
  /** Statistics about the encoding */
  stats: EncodingStats
  /** List of files that were excluded */
  excludedFiles: string[]
  /** Detailed log of exclusion decisions */
  exclusionLog: ExclusionLogEntry[]
}

/**
 * Statistics about the encoded files
 */
export interface EncodingStats {
  /** Total number of files processed */
  totalFiles: number
  /** Total number of files included in output */
  includedFiles: number
  /** Total number of files excluded */
  excludedFiles: number
  /** Total characters in the output */
  totalCharacters: number
  /** Breakdown by language */
  languageBreakdown: Record<string, number>
}
