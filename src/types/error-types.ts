/**
 * Error codes for processing operations
 */
export enum ProcessingErrorCode {
  ZIP_CORRUPTED = 'ZIP_CORRUPTED',
  ZIP_INVALID = 'ZIP_INVALID',
  UNSUPPORTED_FILE_TYPE = 'UNSUPPORTED_FILE_TYPE',
  ENCODING_FAILED = 'ENCODING_FAILED',
  MEMORY_ERROR = 'MEMORY_ERROR',
  NO_CODE_FILES = 'NO_CODE_FILES',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Processing error with typed information for display and recovery
 */
export interface ProcessingError {
  /** Error code for categorization */
  code: ProcessingErrorCode
  /** User-friendly error message */
  message: string
  /** Suggestion for how to recover from the error */
  recoveryHint?: string
  /** Additional context for debugging */
  context?: Record<string, unknown>
  /** Original error for logging */
  originalError?: Error
}

/**
 * Type guard to check if an error is a ProcessingError
 */
export function isProcessingError(error: unknown): error is ProcessingError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    Object.values(ProcessingErrorCode).includes((error as ProcessingError).code)
  )
}
