import { EXTENSION_TO_LANGUAGE } from './language-utils'

/**
 * Mapping of language names to Monaco Editor language IDs
 * Monaco uses different IDs than our internal language names
 */
const LANGUAGE_TO_MONACO_ID: Record<string, string> = {
  'Go': 'go',
  'Rust': 'rust',
  'Kotlin': 'kotlin',
  'Lua': 'lua',
  'MATLAB': 'matlab',
  'Objective-C': 'objective-c',
  'Dart': 'dart',
  'Assembly': 'asm',
  'Ruby': 'ruby',
  'Swift': 'swift',
  'R': 'r',
  'C++': 'cpp',
  'C': 'c',
  'TypeScript': 'typescript',
  'JavaScript': 'javascript',
  'Python': 'python',
  'Java': 'java',
  'C#': 'csharp',
  'PHP': 'php',
  'Scala': 'scala',
  'Shell': 'shell',
  'SQL': 'sql',
  'HTML': 'html',
  'CSS': 'css',
  'SCSS': 'scss',
  'Less': 'less',
  'JSON': 'json',
  'YAML': 'yaml',
  'XML': 'xml',
  'TOML': 'toml',
  'Markdown': 'markdown',
  'Perl': 'perl',
  'Haskell': 'haskell',
  'Elixir': 'elixir',
  'Erlang': 'erlang',
  'Clojure': 'clojure',
  'F#': 'fsharp',
  'OCaml': 'ocaml',
  'Groovy': 'groovy',
  'Zig': 'zig',
  'Nim': 'nim',
  'V': 'v',
  'Julia': 'julia',
  'Fortran': 'fortran',
  'COBOL': 'cobol',
  'Ada': 'ada',
  'Pascal': 'pascal',
  'Prolog': 'prolog',
  'Lisp': 'lisp',
  'Scheme': 'scheme',
  'Racket': 'racket',
  'D': 'd',
  'Crystal': 'crystal',
  'Unknown': 'plaintext'
}

/**
 * Get the Monaco editor language ID for a file based on its extension
 * @param filename - The filename to detect language for
 * @returns The Monaco language ID (e.g., 'typescript', 'python')
 */
export function getMonacoLanguageId(filename: string): string {
  const extension = filename.substring(filename.lastIndexOf('.')).toLowerCase()
  const languageName = EXTENSION_TO_LANGUAGE[extension] || 'Unknown'
  return LANGUAGE_TO_MONACO_ID[languageName] || 'plaintext'
}
