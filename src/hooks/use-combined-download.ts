import { useState, useCallback } from 'react'
import type { FileEntry, RepositoryStats } from '../types/file-types'
import type { DownloadSummary } from '../lib/combined-download-utils'
import {
  createCombinedResultsZip,
  createSamplesZip,
  prepareDownloadSummary
} from '../lib/combined-download-utils'
import { encodeFilesWithStats } from '../lib/encoding-utils'
import { filterCodeFiles } from '../lib/file-filter-utils'
import { sampleCodeFiles } from '../lib/sampling-utils'
import { PRIORITY_LANGUAGES } from '../lib/language-utils'
import { downloadZip } from '../lib/download-utils'
import { generateDownloadFilename } from '../lib/download-utils'

/**
 * State for combined download operation
 */
export interface CombinedDownloadState {
  isDownloading: boolean
  progress: number
  error: string | null
  downloadSummary: DownloadSummary | null
}

/**
 * Return type for useCombinedDownload hook
 */
export interface UseCombinedDownloadReturn extends CombinedDownloadState {
  downloadAll: (files: FileEntry[], repoName: string, modifiedFiles?: Map<string, string>, stats?: RepositoryStats) => Promise<void>
  reset: () => void
}

/**
 * React hook for managing combined download workflow.
 * Handles sampling, encoding, and bundling files and JSONL into a single ZIP.
 */
export function useCombinedDownload(): UseCombinedDownloadReturn {
  const [state, setState] = useState<CombinedDownloadState>({
    isDownloading: false,
    progress: 0,
    error: null,
    downloadSummary: null
  })

  const downloadAll = useCallback(async (
    files: FileEntry[],
    repoName: string,
    modifiedFiles?: Map<string, string>,
    stats?: RepositoryStats
  ): Promise<void> => {
    setState({
      isDownloading: true,
      progress: 0,
      error: null,
      downloadSummary: null
    })

    try {
      // Step 1: Merge modified files with original files
      let filesToProcess = files
      if (modifiedFiles && modifiedFiles.size > 0) {
        filesToProcess = files.map(file => {
          if (modifiedFiles.has(file.path)) {
            return {
              ...file,
              content: modifiedFiles.get(file.path) || file.content
            }
          }
          return file
        })
      }

      // Step 2: Filter to code files
      setState(prev => ({ ...prev, progress: 15 }))
      const codeFiles = filterCodeFiles(filesToProcess.filter(f => !f.isDirectory))

      if (codeFiles.length === 0) {
        throw new Error('No code files found in the uploaded archive')
      }

      // Step 2: Sample files
      setState(prev => ({ ...prev, progress: 30 }))
      const { samples } = sampleCodeFiles(codeFiles, {
        maxFiles: 5000,
        priorityLanguages: [...PRIORITY_LANGUAGES],
        prioritizeDiversity: true
      })

      // Step 3: Encode to JSONL
      setState(prev => ({ ...prev, progress: 50 }))
      const encodingResult = encodeFilesWithStats(
        samples,
        filesToProcess.filter(f => !f.isDirectory),
        { repoName }
      )

      // Step 4: Create samples ZIP
      setState(prev => ({ ...prev, progress: 65 }))
      const samplesZipBlob = await createSamplesZip(samples)

      // Step 5: Create combined ZIP
      setState(prev => ({ ...prev, progress: 80 }))
      const combinedZipBlob = await createCombinedResultsZip(
        samples,
        encodingResult.jsonlContent,
        repoName,
        stats
      )

      // Step 6: Prepare summary
      setState(prev => ({ ...prev, progress: 90 }))
      const summary = prepareDownloadSummary(
        samples,
        encodingResult.jsonlContent,
        samplesZipBlob,
        combinedZipBlob
      )

      // Step 7: Trigger download
      setState(prev => ({ ...prev, progress: 95 }))
      const filename = generateDownloadFilename(repoName, 'results', true)
      downloadZip(combinedZipBlob, filename)

      // Complete
      setState({
        isDownloading: false,
        progress: 100,
        error: null,
        downloadSummary: summary
      })
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to prepare download'

      setState({
        isDownloading: false,
        progress: 0,
        error: errorMessage,
        downloadSummary: null
      })
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      isDownloading: false,
      progress: 0,
      error: null,
      downloadSummary: null
    })
  }, [])

  return {
    ...state,
    downloadAll,
    reset
  }
}
