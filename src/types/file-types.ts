/**
 * Language statistics for a single language
 */
export interface LanguageFileStats {
  language: string
  lineCount: number
  charCount: number
  fileCount: number
  percentage: number
}

/**
 * Repository statistics calculated at upload time
 */
export interface RepositoryStats {
  totalLines: number
  totalChars: number
  totalFiles: number
  languages: LanguageFileStats[]
  uploadedAt: string
}

/**
 * Represents a single file entry in a ZIP archive
 */
export interface FileEntry {
  /** Full path of the file (e.g., "src/components/Button.tsx") */
  path: string
  /** File name only (e.g., "Button.tsx") */
  name: string
  /** File content as string */
  content: string
  /** Original file content for diff comparison */
  originalContent?: string
  /** Whether this entry is a directory */
  isDirectory: boolean
  /** Number of lines in the file */
  lineCount?: number
}

/**
 * Result of extracting a ZIP file
 */
export interface ZipExtractionResult {
  /** Successfully extracted files */
  files: FileEntry[]
  /** Error message if extraction failed */
  error?: string
  /** Whether extraction was successful */
  success: boolean
  /** Repository statistics calculated from the extracted files */
  stats?: RepositoryStats
}

/**
 * State for ZIP handler operations
 */
export interface ZipHandlerState {
  /** Whether a ZIP operation is in progress */
  isLoading: boolean
  /** Error message if operation failed */
  error: string | null
  /** Progress percentage (0-100) for extraction */
  progress: number
  /** Extracted files from the ZIP */
  files: FileEntry[]
  /** Repository statistics calculated at upload time */
  stats?: RepositoryStats
}

