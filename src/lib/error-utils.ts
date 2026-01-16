import type { ProcessingError } from '../types/error-types'
import { ProcessingErrorCode, isProcessingError } from '../types/error-types'

/**
 * Creates a typed ProcessingError
 */
function createProcessingError(
  code: ProcessingErrorCode,
  message: string,
  options?: {
    recoveryHint?: string
    context?: Record<string, unknown>
    originalError?: Error
  }
): ProcessingError {
  return {
    code,
    message,
    recoveryHint: options?.recoveryHint,
    context: options?.context,
    originalError: options?.originalError
  }
}

/**
 * Gets recovery suggestions based on error code
 */
function getRecoverySuggestion(error: ProcessingError): string {
  if (error.recoveryHint) {
    return error.recoveryHint
  }

  switch (error.code) {
    case ProcessingErrorCode.ZIP_CORRUPTED:
      return 'Try downloading your codebase again or recreating the ZIP file.'
    case ProcessingErrorCode.ZIP_INVALID:
      return 'Ensure you are uploading a valid ZIP file. Use your OS file compression tool to create it.'
    case ProcessingErrorCode.UNSUPPORTED_FILE_TYPE:
      return 'Remove binary files (images, videos, etc.) from your ZIP before uploading.'
    case ProcessingErrorCode.ENCODING_FAILED:
      return 'Try removing large binary files or files with unusual encodings from your codebase.'
    case ProcessingErrorCode.MEMORY_ERROR:
      return 'Your codebase is too large. Try uploading a smaller section or remove node_modules and build artifacts.'
    case ProcessingErrorCode.NO_CODE_FILES:
      return 'Ensure your ZIP contains code files with recognized programming language extensions.'
    default:
      return 'Try uploading a different ZIP file or check your internet connection.'
  }
}

/**
 * Formats an error for user display
 */
export function formatErrorForDisplay(error: ProcessingError): {
  title: string
  message: string
  suggestion: string
} {
  const title = getErrorTitle(error.code)
  const suggestion = getRecoverySuggestion(error)

  return {
    title,
    message: error.message,
    suggestion
  }
}

/**
 * Gets a user-friendly title for an error code
 */
function getErrorTitle(code: ProcessingErrorCode): string {
  switch (code) {
    case ProcessingErrorCode.ZIP_CORRUPTED:
      return 'ZIP File Corrupted'
    case ProcessingErrorCode.ZIP_INVALID:
      return 'Invalid ZIP File'
    case ProcessingErrorCode.UNSUPPORTED_FILE_TYPE:
      return 'Unsupported File Type'
    case ProcessingErrorCode.ENCODING_FAILED:
      return 'Encoding Failed'
    case ProcessingErrorCode.MEMORY_ERROR:
      return 'File Too Large'
    case ProcessingErrorCode.NO_CODE_FILES:
      return 'No Code Files Found'
    default:
      return 'Processing Failed'
  }
}

/**
 * Logs an error to console with full context and stack trace
 */
export function logErrorToConsole(
  error: ProcessingError,
  context?: string
): void {
  const prefix = context ? `[${context}]` : '[ProcessingError]'

  console.error(`${prefix} ${error.code}: ${error.message}`)

  if (error.context) {
    console.error(`${prefix} Context:`, error.context)
  }

  if (error.originalError) {
    console.error(`${prefix} Stack trace:`)
    console.error(error.originalError)
  }

  // Log recovery hint if available
  if (error.recoveryHint) {
    console.info(`${prefix} Recovery hint: ${error.recoveryHint}`)
  }
}

/**
 * Wraps any error into a ProcessingError with proper context
 */
export function wrapError(
  error: unknown,
  code: ProcessingErrorCode,
  message: string,
  options?: {
    recoveryHint?: string
    context?: Record<string, unknown>
  }
): ProcessingError {
  // If already a ProcessingError, return as-is
  if (isProcessingError(error)) {
    return error
  }

  // Extract original error
  const originalError = error instanceof Error ? error : undefined

  return createProcessingError(code, message, {
    ...options,
    originalError
  })
}
