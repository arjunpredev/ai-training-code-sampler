import { ChevronDown, ChevronRight, File, Folder, Search, X, Trash2, PanelLeftClose } from 'lucide-react'
import type { FileEntry } from '../types/file-types'
import type { TreeNode } from '../types/tree-types'
import { buildFileTree } from '../lib/tree-utils'
import { useState, useMemo } from 'react'

interface EditorSidebarProps {
  files: FileEntry[]
  selectedFilePath: string | null
  onFileSelect: (file: FileEntry) => void
  onFileDelete?: (filePath: string) => void
  deletedFiles?: Set<string>
  modifiedFiles?: Map<string, string>
  globalLineDiff?: number
  onCloseMobile?: () => void
}

/**
 * Count files in a node's subtree
 */
function countFilesInNode(node: TreeNode): number {
  if (!node.isDirectory) return 1
  return node.children.reduce((sum, child) => sum + countFilesInNode(child), 0)
}

/**
 * Check if node or any children match filter (case-insensitive)
 */
function nodeMatches(node: TreeNode, filter: string): boolean {
  if (node.name.toLowerCase().includes(filter.toLowerCase())) return true
  if (node.isDirectory) {
    return node.children.some(child => nodeMatches(child, filter))
  }
  return false
}

/**
 * Calculate line diff for a file
 */
function getLineDiff(file: FileEntry, modifiedFiles?: Map<string, string>): number {
  const currentContent = modifiedFiles?.get(file.path) || file.content
  const currentLines = currentContent ? currentContent.split('\n').length : 0
  const originalLines = file.originalContent ? file.originalContent.split('\n').length : currentLines
  return currentLines - originalLines
}

/**
 * TreeNode renderer for the file tree
 */
function TreeNodeComponent({
  node,
  selectedFilePath,
  onFileSelect,
  onFileDelete,
  deletedFiles,
  modifiedFiles,
  files,
  filterText,
  forceExpand,
  defaultExpanded = false
}: {
  node: TreeNode
  selectedFilePath: string | null
  onFileSelect: (file: FileEntry) => void
  onFileDelete?: (filePath: string) => void
  deletedFiles?: Set<string>
  modifiedFiles?: Map<string, string>
  files: Map<string, FileEntry>
  filterText: string
  forceExpand: boolean
  defaultExpanded?: boolean
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  const isSelected = !node.isDirectory && node.path === selectedFilePath
  const isDeleted = deletedFiles?.has(node.path)
  const matches = filterText === '' || nodeMatches(node, filterText)
  const shouldExpand = forceExpand || (filterText !== '' && nodeMatches(node, filterText) && node.isDirectory)

  // Get line diff for this file
  const file = files.get(node.path)
  const lineDiff = file && !node.isDirectory ? getLineDiff(file, modifiedFiles) : 0
  const isModified = file?.originalContent !== undefined && file?.originalContent !== file?.content

  if (!matches || isDeleted) return null

  const handleSelect = () => {
    if (!node.isDirectory) {
      const file = files.get(node.path)
      if (file) onFileSelect(file)
    } else {
      setExpanded(!expanded)
    }
  }

  const handleDelete = () => {
    onFileDelete?.(node.path)
    setShowDeleteConfirm(false)
    setContextMenu(null)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const fileCount = node.isDirectory ? countFilesInNode(node) : 0

  return (
    <div>
      <div
        onClick={handleSelect}
        onContextMenu={handleContextMenu}
        className={`
          flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-zinc-800
          rounded text-sm transition-colors group relative
          ${isSelected ? 'bg-blue-900/50 text-blue-100 border-l-2 border-blue-500' : 'text-zinc-300 hover:text-zinc-100'}
        `}
        style={{ paddingLeft: `${12 + node.depth * 16}px` }}
      >
        {node.isDirectory ? (
          <>
            {shouldExpand || expanded ? (
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            )}
            <Folder className="w-4 h-4 flex-shrink-0 text-amber-500" />
          </>
        ) : (
          <>
            <div className="w-4" />
            <File className="w-4 h-4 flex-shrink-0 text-blue-400" />
          </>
        )}
        <span className="truncate flex-1">{node.name}</span>

        {/* Line diff indicator for files */}
        {!node.isDirectory && lineDiff !== 0 && (
          <span className={`text-xs flex-shrink-0 ${lineDiff > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {lineDiff > 0 ? `+${lineDiff}` : lineDiff}
          </span>
        )}

        {/* Modified dot */}
        {!node.isDirectory && isModified && lineDiff === 0 && (
          <span className="text-amber-400 text-xs">●</span>
        )}

        {/* File count for directories */}
        {node.isDirectory && fileCount > 0 && (
          <span className="text-xs text-zinc-500 flex-shrink-0 group-hover:text-zinc-400">
            ({fileCount})
          </span>
        )}

        {/* Delete button on hover */}
        {onFileDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowDeleteConfirm(true)
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-900/50 rounded transition-all flex-shrink-0"
            title="Delete file"
          >
            <Trash2 className="w-3 h-3 text-red-400" />
          </button>
        )}
      </div>

      {/* Context menu */}
      {contextMenu && onFileDelete && (
        <div
          className="fixed bg-zinc-800 border border-zinc-700 rounded shadow-lg z-50 text-sm"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          onMouseLeave={() => setContextMenu(null)}
        >
          <button
            onClick={() => handleDelete()}
            className="w-full px-3 py-2 text-left text-red-400 hover:bg-zinc-700 flex items-center gap-2"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        </div>
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && onFileDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 max-w-sm">
            <h3 className="text-sm font-semibold text-zinc-100 mb-2">
              Delete {node.isDirectory ? 'folder' : 'file'}?
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              {node.isDirectory
                ? `This will delete "${node.name}" and all files inside it.`
                : `This will delete "${node.name}".`}
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 text-xs rounded border border-zinc-600 hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete()}
                className="px-3 py-1.5 text-xs rounded bg-red-900 hover:bg-red-800 text-red-100 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {node.isDirectory && (shouldExpand || expanded) && node.children.length > 0 && (
        <div>
          {node.children.map(child => (
            <TreeNodeComponent
              key={child.path}
              node={child}
              selectedFilePath={selectedFilePath}
              onFileSelect={onFileSelect}
              onFileDelete={onFileDelete}
              deletedFiles={deletedFiles}
              modifiedFiles={modifiedFiles}
              files={files}
              filterText={filterText}
              forceExpand={shouldExpand}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * EditorSidebar component - displays file tree with search and file selection
 */
export function EditorSidebar({
  files,
  selectedFilePath,
  onFileSelect,
  onFileDelete,
  deletedFiles,
  modifiedFiles,
  globalLineDiff,
  onCloseMobile
}: EditorSidebarProps) {
  const [filterText, setFilterText] = useState('')
  const treeNodes = buildFileTree(files)
  const filesMap = new Map(files.map(f => [f.path, f]))

  // Count total files for display
  const totalFileCount = useMemo(() => {
    return files.filter(f => !f.isDirectory).length
  }, [files])

  return (
    <div className="flex flex-col h-full bg-zinc-900 border-r border-zinc-800 w-64 flex-shrink-0">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Explorer</span>
          {globalLineDiff !== undefined && globalLineDiff !== 0 && (
            <span className={`text-xs font-medium ${globalLineDiff > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {globalLineDiff > 0 ? `+${globalLineDiff.toLocaleString()}` : globalLineDiff.toLocaleString()}
            </span>
          )}
        </div>
        {/* Mobile close button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 hover:bg-zinc-800 rounded transition-colors"
            title="Close sidebar"
          >
            <PanelLeftClose className="w-4 h-4 text-zinc-400" />
          </button>
        )}
      </div>

      {/* Search Box */}
      <div className="px-2 py-2 border-b border-zinc-800 flex-shrink-0">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-zinc-500 absolute left-2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search files..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full pl-8 pr-6 py-1.5 bg-zinc-800 text-zinc-100 text-xs rounded border border-zinc-700 focus:border-blue-500 focus:outline-none"
          />
          {filterText && (
            <button
              onClick={() => setFilterText('')}
              className="absolute right-2 p-0.5 hover:bg-zinc-700 rounded transition-colors"
            >
              <X className="w-3 h-3 text-zinc-400" />
            </button>
          )}
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {treeNodes.length === 0 ? (
          <div className="p-4 text-xs text-zinc-500">
            No files to display
          </div>
        ) : (
          <div className="py-1">
            {treeNodes.map(node => (
              <TreeNodeComponent
                key={node.path}
                node={node}
                selectedFilePath={selectedFilePath}
                onFileSelect={onFileSelect}
                onFileDelete={onFileDelete}
                deletedFiles={deletedFiles}
                modifiedFiles={modifiedFiles}
                files={filesMap}
                filterText={filterText}
                forceExpand={false}
                defaultExpanded={node.isDirectory && node.depth === 0}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="border-t border-zinc-800 px-3 py-2 flex-shrink-0 text-xs text-zinc-500">
        <div>{totalFileCount} file{totalFileCount !== 1 ? 's' : ''}</div>
      </div>
    </div>
  )
}
