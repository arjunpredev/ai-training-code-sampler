import { saveAs } from 'file-saver'

/**
 * Generates a descriptive download filename with optional timestamp
 * @param repoName - The repository name
 * @param type - The type of file (e.g., 'sample', 'jsonl', 'results')
 * @param includeTimestamp - Whether to include timestamp in filename
 * @returns A descriptive filename
 */
export function generateDownloadFilename(
  repoName: string,
  type: string,
  includeTimestamp = true
): string {
  const timestamp = includeTimestamp
    ? new Date().toISOString().split('T')[0]
    : ''

  const cleanedRepo = repoName
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()

  const base = `${cleanedRepo}-${type}`.replace(/-+/g, '-')
  return timestamp ? `${base}-${timestamp}` : base
}

/**
 * Calculates the size of a Blob and returns a formatted string
 * @param blob - The Blob to calculate size for
 * @returns A formatted file size string (e.g., '2.3 MB')
 */
export function calculateBlobSize(blob: Blob): string {
  const bytes = blob.size
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

/**
 * Downloads a Blob as a file with the specified filename and MIME type
 * @param blob - The Blob data to download
 * @param filename - The name for the downloaded file
 * @param mimeType - The MIME type of the file
 */
function downloadBlob(
  blob: Blob,
  filename: string,
  mimeType: string
): void {
  // Create a new blob with the correct MIME type if needed
  const typedBlob = blob.type === mimeType
    ? blob
    : new Blob([blob], { type: mimeType })

  saveAs(typedBlob, filename)
}

/**
 * Downloads a ZIP file
 * @param content - The ZIP file as a Blob
 * @param filename - The filename for the download (should end with .zip)
 */
export function downloadZip(content: Blob, filename: string): void {
  // Ensure filename has .zip extension
  const finalFilename = filename.endsWith('.zip') ? filename : `${filename}.zip`
  downloadBlob(content, finalFilename, 'application/zip')
}

