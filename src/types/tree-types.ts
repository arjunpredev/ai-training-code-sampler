import type { FileEntry } from './file-types'

/**
 * Represents a node in the file tree hierarchy
 */
export interface TreeNode extends FileEntry {
  /** Child nodes (for directories) */
  children: TreeNode[]
  /** Whether this node is expanded in the UI */
  expanded: boolean
  /** Depth level in the tree (root = 0) */
  depth: number
}

