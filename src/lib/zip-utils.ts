import JSZip from 'jszip'
import type { FileEntry, ZipExtractionResult, RepositoryStats, LanguageFileStats } from '../types/file-types'
import { wrapError, logErrorToConsole } from './error-utils'
import { ProcessingErrorCode } from '../types/error-types'
import { detectLanguage } from './language-utils'

/**
 * Calculates repository statistics from file entries
 */
function calculateRepositoryStats(files: FileEntry[]): RepositoryStats {
  const languageStats = new Map<string, LanguageFileStats>()
  let totalLines = 0
  let totalChars = 0
  let totalFiles = 0

  for (const file of files) {
    if (file.isDirectory) continue

    const language = detectLanguage(file.path)
    const lineCount = file.lineCount || 0
    const charCount = file.content.length

    totalLines += lineCount
    totalChars += charCount
    totalFiles++

    const existing = languageStats.get(language)
    if (existing) {
      existing.lineCount += lineCount
      existing.charCount += charCount
      existing.fileCount++
    } else {
      languageStats.set(language, {
        language,
        lineCount,
        charCount,
        fileCount: 1,
        percentage: 0
      })
    }
  }

  // Calculate percentages
  const languages = Array.from(languageStats.values())
  languages.forEach(lang => {
    lang.percentage = totalLines > 0 ? Math.round((lang.lineCount / totalLines) * 100) : 0
  })

  // Sort by line count descending
  languages.sort((a, b) => b.lineCount - a.lineCount)

  return {
    totalLines,
    totalChars,
    totalFiles,
    languages,
    uploadedAt: new Date().toISOString()
  }
}

/**
 * Validates if the provided file is a valid ZIP file
 * @param file - The file to validate
 * @returns Promise resolving to { valid: boolean, error?: string }
 */
export async function validateZipFile(
  file: File
): Promise<{ valid: boolean; error?: string }> {
  // Check MIME type
  const validMimeTypes = [
    'application/zip',
    'application/x-zip-compressed',
    'application/x-zip',
    'multipart/x-zip'
  ]

  // Some browsers don't set MIME type correctly, so also check extension
  const hasValidExtension = file.name.toLowerCase().endsWith('.zip')
  const hasValidMimeType = validMimeTypes.includes(file.type) || file.type === ''

  if (!hasValidExtension && !hasValidMimeType) {
    return { valid: false, error: 'File does not appear to be a ZIP file' }
  }

  // Try to load the ZIP to verify it's valid
  try {
    const zip = new JSZip()
    await zip.loadAsync(file)
    return { valid: true }
  } catch (error) {
    const processingError = wrapError(
      error,
      ProcessingErrorCode.ZIP_CORRUPTED,
      'File is corrupted or not a valid ZIP archive',
      {
        context: { fileName: file.name, fileSize: file.size }
      }
    )
    logErrorToConsole(processingError, 'validateZipFile')
    return { valid: false, error: processingError.message }
  }
}

/**
 * Extracts all files from a ZIP archive
 * @param file - The ZIP file to extract
 * @param onProgress - Optional callback for progress updates (0-100)
 * @returns Promise resolving to ZipExtractionResult
 */
export async function extractZipFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<ZipExtractionResult> {
  try {
    // Validate the ZIP file first
    const validation = await validateZipFile(file)
    if (!validation.valid) {
      return {
        files: [],
        success: false,
        error: validation.error
      }
    }

    const zip = new JSZip()
    const loadedZip = await zip.loadAsync(file)

    const files: FileEntry[] = []
    const entries = Object.entries(loadedZip.files)
    let processed = 0

    for (const [path, zipEntry] of entries) {
      // Skip directories - we'll infer them from file paths in the tree builder
      if (zipEntry.dir) {
        continue
      }

      try {
        // Read file content as string
        const content = await zipEntry.async('string')
        const name = path.split('/').pop() || path
        const lineCount = content.split('\n').length

        files.push({
          path,
          name,
          content,
          originalContent: content,
          isDirectory: false,
          lineCount
        })
      } catch (error) {
        // Log file-specific errors but continue processing
        const fileError = wrapError(
          error,
          ProcessingErrorCode.ENCODING_FAILED,
          `Failed to extract file: ${path}`,
          { context: { path, fileName: file.name } }
        )
        logErrorToConsole(fileError, 'extractZipFile')
      }

      processed++
      if (onProgress) {
        onProgress(Math.round((processed / entries.length) * 100))
      }
    }

    const stats = calculateRepositoryStats(files)

    return {
      files,
      success: true,
      stats
    }
  } catch (error) {
    // Detect memory errors specifically
    const errorStr = error instanceof Error ? error.message : String(error)
    const isMemoryError = errorStr.includes('memory') || errorStr.includes('size')

    const processingError = wrapError(
      error,
      isMemoryError ? ProcessingErrorCode.MEMORY_ERROR : ProcessingErrorCode.ZIP_CORRUPTED,
      isMemoryError
        ? 'Not enough memory to process this ZIP file'
        : 'Failed to extract ZIP file',
      {
        context: { fileName: file.name, fileSize: file.size }
      }
    )

    logErrorToConsole(processingError, 'extractZipFile')

    return {
      files: [],
      success: false,
      error: processingError.message,
      stats: {
        totalLines: 0,
        totalChars: 0,
        totalFiles: 0,
        languages: [],
        uploadedAt: new Date().toISOString()
      }
    }
  }
}

/**
 * Creates a new ZIP file from an array of file entries
 * @param files - Array of FileEntry objects to include in the ZIP
 * @returns Promise resolving to the ZIP file as a Blob
 */
export async function createZipFile(files: FileEntry[]): Promise<Blob> {
  const zip = new JSZip()

  for (const file of files) {
    if (!file.isDirectory) {
      // JSZip handles directory creation automatically based on path
      zip.file(file.path, file.content)
    }
  }

  return await zip.generateAsync({ type: 'blob' })
}

