import type { FileEntry } from '../types/file-types'
import type { TreeNode } from '../types/tree-types'

/**
 * Builds a hierarchical tree structure from a flat array of file entries
 * @param files - Array of FileEntry objects from ZIP extraction
 * @returns Array of TreeNode objects representing the directory structure
 */
export function buildFileTree(files: FileEntry[]): TreeNode[] {
  const nodes: Map<string, TreeNode> = new Map()

  // Create all nodes first
  for (const file of files) {
    const node: TreeNode = {
      ...file,
      children: [],
      expanded: file.isDirectory,
      depth: 0
    }
    nodes.set(file.path, node)
  }

  // Build hierarchy by connecting nodes
  const rootNodes: TreeNode[] = []
  const processedRootPaths = new Set<string>()

  for (const [path, node] of nodes) {
    const parts = path.split('/').filter(Boolean)

    if (parts.length === 1) {
      // Root level
      node.depth = 0
      // Only add if not already added
      if (!processedRootPaths.has(path)) {
        rootNodes.push(node)
        processedRootPaths.add(path)
      }
    } else {
      // Find parent path
      const parentPath = parts.slice(0, -1).join('/')
      const parentNode = nodes.get(parentPath)

      if (parentNode) {
        // Add to parent
        node.depth = parentPath.split('/').filter(Boolean).length
        if (!parentNode.children.some(c => c.path === node.path)) {
          parentNode.children.push(node)
        }
      } else {
        // Parent doesn't exist - create intermediate directories
        let currentPath = ''
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i]
          currentPath = currentPath ? `${currentPath}/${part}` : part

          if (!nodes.has(currentPath)) {
            const dirNode: TreeNode = {
              path: currentPath,
              name: part,
              content: '',
              isDirectory: true,
              children: [],
              expanded: true,
              depth: i
            }
            nodes.set(currentPath, dirNode)

            if (i === 0) {
              // Root directory
              if (!processedRootPaths.has(currentPath)) {
                rootNodes.push(dirNode)
                processedRootPaths.add(currentPath)
              }
            } else {
              // Add to parent directory
              const parentDir = parts.slice(0, i).join('/')
              const parentDirNode = nodes.get(parentDir)
              if (parentDirNode && !parentDirNode.children.some(c => c.path === dirNode.path)) {
                parentDirNode.children.push(dirNode)
              }
            }
          }
        }

        // Add current node to its parent
        const parentPath = parts.slice(0, -1).join('/')
        const parentNode = nodes.get(parentPath)
        if (parentNode && !parentNode.children.some(c => c.path === node.path)) {
          node.depth = parentPath.split('/').filter(Boolean).length
          parentNode.children.push(node)
        }
      }
    }
  }

  // Sort children and return roots
  const sortNode = (node: TreeNode) => {
    node.children.sort((a, b) => {
      // Directories first
      if (a.isDirectory !== b.isDirectory) {
        return a.isDirectory ? -1 : 1
      }
      // Then alphabetically
      return a.name.localeCompare(b.name)
    })
    node.children.forEach(sortNode)
  }

  rootNodes.forEach(sortNode)
  return rootNodes
}

