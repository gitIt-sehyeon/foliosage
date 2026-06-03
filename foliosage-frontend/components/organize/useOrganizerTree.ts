import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'

export interface TreeFile {
  fileId: string
  name: string
  size: number | null
  category: string | null
}

export interface TreeNode {
  id: string
  name: string
  fileCount: number
  childCount: number
  children: TreeNode[]
  files: TreeFile[]
}

export interface OrganizerTree {
  nodes: TreeNode[]
}

// `isPublic` switches to the share-code based public endpoint (no auth required),
// so the same graph can render on a published portfolio's live page.
export function useOrganizerTree(idOrShareCode: string, enabled: boolean, isPublic = false) {
  const [tree, setTree] = useState<OrganizerTree | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTree = useCallback(async () => {
    setLoading(true)
    try {
      const url = isPublic
        ? `/api/public/${encodeURIComponent(idOrShareCode)}/organize/tree`
        : `/api/portfolios/${idOrShareCode}/organize/tree`
      const res = await api.get<OrganizerTree>(url)
      setTree(res.data)
      setError(null)
    } catch {
      setError('Could not load the folder structure.')
    } finally {
      setLoading(false)
    }
  }, [idOrShareCode, isPublic])

  useEffect(() => {
    if (enabled) fetchTree()
  }, [enabled, fetchTree])

  return { tree, loading, error, refetch: fetchTree }
}
