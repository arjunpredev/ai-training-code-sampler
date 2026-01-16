import { useCallback, useState } from 'react'
import Editor, { DiffEditor } from '@monaco-editor/react'
import { Scissors, BarChart3, Package, ChevronRight, PanelLeft } from 'lucide-react'
import type { FileEntry } from '../types/file-types'

interface CodeEditorProps {
  file: FileEntry | null
  language: string
  onChange: (content: string) => void
  onToggleSidebar?: () => void
}

/**
 * CodeEditor component - Monaco Editor wrapper
 * Displays and allows editing of code files with Code/Diff view toggle
 */
export function CodeEditor({ file, language, onChange, onToggleSidebar }: CodeEditorProps) {
  const [viewMode, setViewMode] = useState<'code' | 'diff'>('code')

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      onChange(value)
    }
  }, [onChange])

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 relative">
        {/* Mobile: Open sidebar button */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden absolute top-3 left-3 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition-colors flex items-center gap-2"
          >
            <PanelLeft className="w-4 h-4 text-zinc-300" />
            <span className="text-xs text-zinc-300">Files</span>
          </button>
        )}

        <div className="max-w-lg text-center px-8">
          {/* Welcome header */}
          <h2 className="text-xl sm:text-2xl font-light text-zinc-100 mb-3">
            Curate your code sample
          </h2>
          <p className="text-sm sm:text-base text-zinc-500 mb-8 sm:mb-10">
            Select files from the sidebar to review and include in your submission.
            You need at least 5,000 lines of code.
          </p>

          {/* How it works */}
          <div className="space-y-3 sm:space-y-4 text-left">
            {/* Step 1 */}
            <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
              <div className="p-2 sm:p-2.5 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 flex-shrink-0">
                <Scissors className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200 mb-1">1. Select files to include</p>
                <p className="text-xs text-zinc-500">Browse and pick the code you want to submit. Remove files you don't want included.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
              <div className="p-2 sm:p-2.5 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 flex-shrink-0">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200 mb-1">2. Review language breakdown</p>
                <p className="text-xs text-zinc-500">See stats on lines, characters, and files per language.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
              <div className="p-2 sm:p-2.5 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 flex-shrink-0">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200 mb-1">3. Download your package</p>
                <p className="text-xs text-zinc-500">Get JSONL-encoded files ready for submission.</p>
              </div>
            </div>
          </div>

          {/* Hint - desktop only */}
          <div className="mt-6 sm:mt-8 hidden sm:flex items-center justify-center gap-2 text-zinc-600 text-sm">
            <ChevronRight className="w-4 h-4" />
            <span>Start by selecting a file from the sidebar</span>
          </div>

          {/* Mobile hint - tap to open sidebar */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="mt-6 sm:hidden flex items-center justify-center gap-2 text-blue-400 text-sm mx-auto"
            >
              <PanelLeft className="w-4 h-4" />
              <span>Tap to browse files</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  // Check if file has been modified from its original content
  const isModified = file.originalContent !== undefined && file.originalContent !== file.content

  // Calculate line diff for this file
  const currentLines = file.content ? file.content.split('\n').length : 0
  const originalLines = file.originalContent ? file.originalContent.split('\n').length : currentLines
  const lineDiff = currentLines - originalLines

  return (
    <div className="h-full w-full bg-zinc-950 flex flex-col">
      {/* Editor Header with file path and Mode Toggle */}
      <div className="h-10 bg-zinc-900 border-b border-zinc-800 px-2 sm:px-4 flex items-center justify-between flex-shrink-0 gap-2">
        {/* Left: Sidebar toggle (mobile) + File path and modified indicator */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
          {/* Mobile sidebar toggle */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-1.5 hover:bg-zinc-800 rounded transition-colors flex-shrink-0"
              title="Show files"
            >
              <PanelLeft className="w-4 h-4 text-zinc-400" />
            </button>
          )}
          <span className="text-xs sm:text-sm text-zinc-300 truncate font-mono">
            {file.name}
            <span className="hidden sm:inline text-zinc-500"> - {file.path}</span>
          </span>
          {isModified && (
            <span className="text-amber-400 text-xs font-medium flex-shrink-0 hidden sm:inline">● Modified</span>
          )}
          {isModified && (
            <span className="text-amber-400 text-xs flex-shrink-0 sm:hidden">●</span>
          )}
          {lineDiff !== 0 && (
            <span className={`text-xs flex-shrink-0 ${lineDiff > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {lineDiff > 0 ? `+${lineDiff}` : lineDiff}
            </span>
          )}
        </div>

        {/* Right: Code/Diff toggle */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-zinc-800 p-0.5 rounded flex-shrink-0">
          <button
            onClick={() => setViewMode('code')}
            className={`px-2 sm:px-3 py-1 text-xs font-medium rounded transition-colors ${
              viewMode === 'code'
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Code
          </button>
          <button
            onClick={() => setViewMode('diff')}
            disabled={!isModified}
            className={`px-2 sm:px-3 py-1 text-xs font-medium rounded transition-colors ${
              viewMode === 'diff'
                ? 'bg-zinc-700 text-white'
                : isModified
                ? 'text-zinc-400 hover:text-zinc-200'
                : 'text-zinc-600 cursor-not-allowed'
            }`}
            title={isModified ? 'View changes' : 'No changes to compare'}
          >
            Diff
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'code' ? (
          <Editor
            height="100%"
            width="100%"
            language={language}
            value={file.content}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: true },
              fontSize: 13,
              fontFamily: 'Menlo, Monaco, "Courier New", monospace',
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              padding: { top: 12 }
            }}
          />
        ) : isModified ? (
          <DiffEditor
            height="100%"
            width="100%"
            language={language}
            original={file.originalContent}
            modified={file.content}
            theme="vs-dark"
            options={{
              fontSize: 13,
              fontFamily: 'Menlo, Monaco, "Courier New", monospace',
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              renderSideBySide: true,
              readOnly: false,
              originalEditable: false,
              padding: { top: 12 }
            }}
            onMount={(editor) => {
              // Listen for changes in the modified editor
              const modifiedEditor = editor.getModifiedEditor()
              modifiedEditor.onDidChangeModelContent(() => {
                const value = modifiedEditor.getValue()
                onChange(value)
              })
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-zinc-950">
            <div className="text-center">
              <p className="text-zinc-500 text-sm">No changes to compare</p>
              <p className="text-zinc-600 text-xs mt-1">Edit the file to see a diff</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
