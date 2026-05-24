import { useState, useEffect, useRef, useCallback } from 'react'
import api from '@/lib/api'

export interface FileClassification {
  fileId: string
  name: string
  size: number | null
  confidence: number
  reasoning: string | null
  locked: boolean
}

export interface CategoryData {
  key: string
  label: string
  subtitle: string
  fileCount: number
  files: FileClassification[]
}

export interface OrganizerResult {
  status: string
  totalFiles: number
  classifiedFiles: number
  progressPercent: number
  reasoning: string | null
  categories: CategoryData[]
}

export function useOrganizerResult(portfolioId: string) {
  const [data, setData] = useState<OrganizerResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchResult = useCallback(async () => {
    try {
      const res = await api.get<OrganizerResult>(`/api/portfolios/${portfolioId}/organize/result`)
      setData(res.data)
      setError(null)
      if (res.data.status === 'done' || res.data.status === 'failed') {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    } catch {
      setError('결과를 불러오지 못했습니다.')
    }
  }, [portfolioId])

  useEffect(() => {
    fetchResult()
    intervalRef.current = setInterval(fetchResult, 1500)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [fetchResult])

  const updateLocalCategory = useCallback((fileId: string, newCategoryKey: string, locked = true) => {
    setData(prev => {
      if (!prev) return prev
      let movedFile: FileClassification | undefined
      const categoriesWithout = prev.categories.map(cat => {
        const idx = cat.files.findIndex(f => f.fileId === fileId)
        if (idx === -1) return cat
        movedFile = { ...cat.files[idx], locked }
        return { ...cat, files: cat.files.filter(f => f.fileId !== fileId), fileCount: cat.fileCount - 1 }
      })
      if (!movedFile) return prev
      return {
        ...prev,
        categories: categoriesWithout.map(cat =>
          cat.key === newCategoryKey
            ? { ...cat, files: [...cat.files, movedFile!], fileCount: cat.fileCount + 1 }
            : cat
        ),
      }
    })
  }, [])

  const startOrganize = useCallback(async () => {
    await api.post(`/api/portfolios/${portfolioId}/organize`)
    if (intervalRef.current) clearInterval(intervalRef.current)
    fetchResult()
    intervalRef.current = setInterval(fetchResult, 1500)
  }, [portfolioId, fetchResult])

  return { data, error, refetch: fetchResult, updateLocalCategory, startOrganize }
}
