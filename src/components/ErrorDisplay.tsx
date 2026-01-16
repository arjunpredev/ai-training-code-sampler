import { AlertCircle } from 'lucide-react'
import type { ProcessingError } from '../types/error-types'
import { formatErrorForDisplay, logErrorToConsole } from '../lib/error-utils'

interface ErrorDisplayProps {
  /** Error to display */
  error: ProcessingError | string | null
  /** Optional title override */
  title?: string
  /** Optional callback for retry button */
  onRetry?: () => void
  /** Whether to show the error in the console */
  logToConsole?: boolean
  /** Additional CSS classes for the container */
  className?: string
}

/**
 * Reusable error display component with recovery suggestions
 * Shows error message, recovery hint, and optional retry button
 */
export function ErrorDisplay({
  error,
  title,
  onRetry,
  logToConsole: shouldLog = true,
  className = ''
}: ErrorDisplayProps) {
  if (!error) {
    return null
  }

  // Handle string errors
  if (typeof error === 'string') {
    return (
      <div className={`bg-red-950/50 border border-red-800 rounded-lg p-4 flex gap-3 ${className}`}>
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-400">{title || 'Error'}</p>
          <p className="text-sm text-red-300 mt-1">{error}</p>
        </div>
      </div>
    )
  }

  // Handle ProcessingError types
  const formatted = formatErrorForDisplay(error)

  if (shouldLog) {
    logErrorToConsole(error, 'ErrorDisplay')
  }

  return (
    <div className={`bg-red-950/50 border border-red-800 rounded-lg p-4 space-y-3 ${className}`}>
      <div className="flex gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-400">{title || formatted.title}</p>
          <p className="text-sm text-red-300 mt-1">{formatted.message}</p>
        </div>
      </div>

      {/* Recovery Suggestion */}
      <div className="pl-8 border-l border-red-700/50">
        <p className="text-xs text-red-300/80">
          <span className="font-medium">Tip: </span>
          {formatted.suggestion}
        </p>
      </div>

      {/* Retry Button */}
      {onRetry && (
        <div className="pl-8">
          <button
            onClick={onRetry}
            className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}
