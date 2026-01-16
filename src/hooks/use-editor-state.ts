import { useState, useCallback, useMemo } from 'react'
import type { FileEntry } from '../types/file-types'

/**
 * Hook for managing editor state
 * Provides file selection, content updates, deletion, and sidebar toggle functionality
 */
export function useEditorState(initialFiles: FileEntry[]) {
  // Start with no file selected - show welcome screen first
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null)
  const [modifiedFiles, setModifiedFiles] = useState<Map<string, string>>(new Map())
  const [deletedFiles, setDeletedFiles] = useState<Set<string>>(new Set())
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Create a map for quick file lookup
  const filesMap = useMemo(() => {
    return new Map(initialFiles.map(f => [f.path, f]))
  }, [initialFiles])

  // Get the currently selected file with current content (modified or original)
  const selectedFile = useMemo(() => {
    if (!selectedFilePath) return null
    const file = filesMap.get(selectedFilePath)
    if (!file) return null

    // If file was modified, return file with modified content but keep originalContent
    if (modifiedFiles.has(selectedFilePath)) {
      return {
        ...file,
        content: modifiedFiles.get(selectedFilePath) || file.content
      }
    }
    return file
  }, [selectedFilePath, filesMap, modifiedFiles])

  /**
   * Select a file to display in the editor
   */
  const selectFile = useCallback((file: FileEntry) => {
    setSelectedFilePath(file.path)
  }, [])

  /**
   * Update the content of a file in the editor
   * Tracks changes in the modifiedFiles map
   */
  const updateFileContent = useCallback((filePath: string, content: string) => {
    setModifiedFiles(prev => {
      const updated = new Map(prev)
      updated.set(filePath, content)
      return updated
    })
  }, [])

  /**
   * Toggle sidebar visibility
   */
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev)
  }, [])

  /**
   * Delete a file or all files under a directory path
   */
  const deleteFile = useCallback((filePath: string) => {
    setDeletedFiles(prev => {
      const updated = new Set(prev)
      updated.add(filePath)
      return updated
    })

    // Clear selected file if it was deleted
    if (selectedFilePath && (selectedFilePath === filePath || selectedFilePath.startsWith(filePath + '/'))) {
      setSelectedFilePath(null)
    }
  }, [selectedFilePath])

  return {
    selectedFile,
    modifiedFiles,
    deletedFiles,
    sidebarCollapsed,
    selectFile,
    updateFileContent,
    deleteFile,
    toggleSidebar
  }
}
