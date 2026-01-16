/**
 * Binary file extensions to exclude - matches Python encode_repositories.py exactly
 */
const BINARY_EXTENSIONS = new Set([
  // Images
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg', '.ico', '.webp',
  // Documents
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  // Archives
  '.zip', '.tar', '.gz', '.7z', '.rar', '.bz2', '.xz',
  // Media
  '.mp3', '.mp4', '.avi', '.mov', '.wav', '.flac', '.ogg', '.webm', '.mkv',
  // Java/JVM
  '.class', '.jar', '.war', '.ear', '.jmod',
  // .NET/C#
  '.exe', '.dll', '.pdb', '.nupkg', '.msi', '.vsix',
  // C/C++
  '.o', '.obj', '.so', '.a', '.lib', '.dylib', '.exp', '.out',
  // Python
  '.pyc', '.pyo', '.pyd', '.whl', '.egg',
  // Apple/iOS/macOS
  '.framework', '.app', '.ipa', '.dsym', '.xcarchive',
  // Go
  '.test',
  // Rust
  '.rlib', '.rmeta',
  // Node.js/Web
  '.node', '.wasm',
  // Package managers
  '.deb', '.rpm', '.apk', '.aab', '.dmg', '.pkg', '.iso',
  // Databases
  '.db', '.sqlite', '.sqlite3',
  // Fonts
  '.ttf', '.otf', '.woff', '.woff2', '.eot',
  // Other binaries
  '.bin', '.dat', '.pak',
])

/**
 * Directory patterns to exclude - matches Python encode_repositories.py exactly
 */
const EXCLUDED_DIR_PATTERNS = new Set([
  'node_modules', '__pycache__', '.git', 'venv', '.venv', 'env',
  'dist', 'build', '.idea', '.vscode', 'target', '.pytest_cache',
  '.mypy_cache', '.tox', 'htmlcov', '.coverage', 'coverage_html_report',
  '.svn', '.hg', '.eggs', '.hypothesis', '.ruff_cache'
])

/**
 * Exact filenames to exclude (OS metadata and junk files) - matches Python exactly
 */
const EXCLUDED_FILES = new Set([
  '.DS_Store',     // macOS Finder metadata
  'Thumbs.db',     // Windows thumbnail cache
  'desktop.ini',   // Windows folder settings
  '.localized'     // macOS localization marker
])

/**
 * List of file extensions considered as code files (kept for language detection)
 */
const CODE_FILE_EXTENSIONS = new Set([
  // Go
  '.go',
  // Rust
  '.rs',
  // Kotlin
  '.kt', '.kts',
  // Lua
  '.lua',
  // MATLAB
  '.m', '.mat', '.mlx',
  // Objective-C
  '.mm',
  // Dart
  '.dart',
  // Assembly
  '.asm', '.s', '.S',
  // Ruby
  '.rb', '.rake', '.gemspec',
  // Swift
  '.swift',
  // R
  '.r', '.R', '.rmd', '.Rmd',
  // C++
  '.cpp', '.cc', '.cxx', '.c++', '.hpp', '.hh', '.hxx', '.h++',
  // C
  '.c', '.h',
  // TypeScript
  '.ts', '.tsx', '.mts', '.cts',
  // JavaScript
  '.js', '.jsx', '.mjs', '.cjs',
  // Python
  '.py', '.pyw', '.pyi',
  // Java
  '.java',
  // C#
  '.cs',
  // PHP
  '.php',
  // Scala
  '.scala', '.sc',
  // Shell
  '.sh', '.bash', '.zsh', '.fish',
  // SQL
  '.sql',
  // Perl
  '.pl', '.pm',
  // Haskell
  '.hs', '.lhs',
  // Elixir
  '.ex', '.exs',
  // Erlang
  '.erl', '.hrl',
  // Clojure
  '.clj', '.cljs', '.cljc', '.edn',
  // F#
  '.fs', '.fsx', '.fsi',
  // OCaml
  '.ml', '.mli',
  // Groovy
  '.groovy', '.gvy', '.gy', '.gsh',
  // Zig
  '.zig',
  // Nim
  '.nim', '.nims',
  // V
  '.v',
  // Julia
  '.jl',
  // Fortran
  '.f', '.for', '.f90', '.f95', '.f03', '.f08',
  // COBOL
  '.cob', '.cbl',
  // Ada
  '.adb', '.ads',
  // Pascal
  '.pas', '.pp',
  // Prolog
  '.pro', '.pl',
  // Lisp
  '.lisp', '.lsp', '.cl',
  // Scheme
  '.scm', '.ss',
  // Racket
  '.rkt',
  // D
  '.d',
  // Crystal
  '.cr',
])

/**
 * Checks if a file is a code file based on its extension (for language detection)
 * @param filename - The filename to check
 * @returns True if the file is considered a code file
 */
export function isCodeFile(filename: string): boolean {
  const ext = getFileExtension(filename)
  return CODE_FILE_EXTENSIONS.has(ext)
}

/**
 * Checks if a directory should be excluded - matches Python logic exactly
 * @param dirName - The directory name to check
 * @returns True if the directory should be excluded
 */
function shouldExcludeDir(dirName: string): boolean {
  return EXCLUDED_DIR_PATTERNS.has(dirName)
}

/**
 * Checks if a file path contains any excluded directory - matches Python logic
 * @param path - The file path to check
 * @returns True if the path contains an excluded directory
 */
export function shouldExcludePath(path: string): boolean {
  const pathParts = path.split('/')
  // Check all directory parts (all except the last one which is the filename)
  for (let i = 0; i < pathParts.length - 1; i++) {
    if (shouldExcludeDir(pathParts[i])) {
      return true
    }
  }
  return false
}

/**
 * Checks if a file should be excluded based on name and extension - matches Python logic
 * @param filepath - The file path to check
 * @returns True if the file should be excluded
 */
export function shouldExcludeFile(filepath: string): boolean {
  const filename = filepath.split('/').pop() || filepath

  // Check exact filename matches (OS metadata)
  if (EXCLUDED_FILES.has(filename)) {
    return true
  }

  // Check pattern matches (e.g., ._* for macOS resource forks)
  if (filename.startsWith('._')) {
    return true
  }

  // Check extension matches (binary files)
  const ext = getFileExtension(filename)
  return BINARY_EXTENSIONS.has(ext)
}

/**
 * Gets the file extension from a filename (lowercase)
 * @param filename - The filename to get extension from
 * @returns The lowercase file extension including the dot
 */
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  if (lastDot === -1) return ''
  return filename.slice(lastDot).toLowerCase()
}

/**
 * Filters an array of files using blocklist approach matching Python
 * @param files - Array of file objects with path property
 * @returns Filtered array containing only includable files
 */
export function filterCodeFiles<T extends { path: string }>(files: T[]): T[] {
  return files.filter(file => {
    // Exclude by directory patterns first
    if (shouldExcludePath(file.path)) {
      return false
    }
    // Then check if the file itself should be excluded
    return !shouldExcludeFile(file.path)
  })
}

