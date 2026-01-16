import { useState, useCallback } from 'react'
import type { FileEntry, ZipHandlerState } from '../types/file-types'
import type { ProcessingError } from '../types/error-types'
import { extractZipFile, createZipFile, validateZipFile } from '../lib/zip-utils'
import { logErrorToConsole } from '../lib/error-utils'

interface ZipUploadResult {
  success: boolean
  files: FileEntry[]
  stats?: import('../types/file-types').RepositoryStats
  error?: string
}

interface UseZipHandlerReturn extends ZipHandlerState {
  /** Extract files from a ZIP archive - returns result for immediate use */
  handleZipUpload: (file: File) => Promise<ZipUploadResult>
  /** Create a ZIP file from file entries */
  createZip: (files: FileEntry[]) => Promise<Blob | null>
  /** Validate a ZIP file without extracting */
  validateZip: (file: File) => Promise<{ valid: boolean; error?: string }>
  /** Clear the current state */
  reset: () => void
  /** Set files directly (for editing purposes) */
  setFiles: (files: FileEntry[]) => void
  /** Full error object with recovery hints (if available) */
  fullError?: ProcessingError
}

/**
 * React hook for handling ZIP file operations with loading states and error handling.
 * Provides async ZIP extraction and creation without blocking the UI thread.
 */
export function useZipHandler(): UseZipHandlerReturn {
  const [state, setState] = useState<ZipHandlerState>({
    isLoading: false,
    error: null,
    progress: 0,
    files: []
  })

  const [fullError, setFullError] = useState<ProcessingError | undefined>()

  const handleZipUpload = useCallback(async (file: File): Promise<ZipUploadResult> => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      progress: 0,
      files: []
    }))
    setFullError(undefined)

    const result = await extractZipFile(file, (progress) => {
      setState(prev => ({ ...prev, progress }))
    })

    if (result.success) {
      setState({
        isLoading: false,
        error: null,
        progress: 100,
        files: result.files,
        stats: result.stats
      })
      setFullError(undefined)
      // Return result for immediate use (avoids extra render cycle)
      return { success: true, files: result.files, stats: result.stats }
    } else {
      const error = result.error || 'Failed to extract ZIP file'
      setState({
        isLoading: false,
        error,
        progress: 0,
        files: [],
        stats: result.stats
      })
      // Log error for debugging
      logErrorToConsole({ code: ProcessingErrorCode.ZIP_INVALID, message: error }, 'useZipHandler')
      return { success: false, files: [], error }
    }
  }, [])

  const createZip = useCallback(async (files: FileEntry[]): Promise<Blob | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const blob = await createZipFile(files)
      setState(prev => ({ ...prev, isLoading: false }))
      return blob
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to create ZIP file'
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }))
      return null
    }
  }, [])

  const validateZip = useCallback(async (file: File) => {
    return await validateZipFile(file)
  }, [])

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      progress: 0,
      files: []
    })
  }, [])

  const setFiles = useCallback((files: FileEntry[]) => {
    setState(prev => ({ ...prev, files }))
  }, [])

  return {
    ...state,
    handleZipUpload,
    createZip,
    validateZip,
    reset,
    setFiles,
    fullError
  }
}
