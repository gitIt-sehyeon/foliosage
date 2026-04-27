'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { isLoggedIn } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import FileUploadZone from '@/components/FileUploadZone'
import FileGallery from '@/components/FileGallery'
import OrganizeStatus from '@/components/OrganizeStatus'
import api from '@/lib/api'

export default function PortfolioPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [portfolio, setPortfolio] = useState<any>(null)
  const [organizeStatus, setOrganizeStatus] = useState({ status: 'idle', message: 'Not started' })
  const [isOrganizing, setIsOrganizing] = useState(false)
  const [organizeTree, setOrganizeTree] = useState<any>(null)
  const [publishError, setPublishError] = useState('')

  const loadPortfolio = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/portfolios/${id}`)
      setPortfolio(data)
    } catch { router.push('/dashboard') }
  }, [id, router])

  const pollOrganizeStatus = useCallback(async () => {
    const { data } = await api.get(`/api/portfolios/${id}/organize/status`)
    setOrganizeStatus(data)
    if (['generating','applying','materializing'].includes(data.status)) {
      setTimeout(pollOrganizeStatus, 3000)
    } else {
      setIsOrganizing(false)
      if (data.status === 'done') {
        try {
          const { data: tree } = await api.get(`/api/portfolios/${id}/organize/tree`)
          setOrganizeTree(tree)
        } catch { /* tree fetch failure is non-critical */ }
      }
    }
  }, [id])

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return }
    loadPortfolio()
    pollOrganizeStatus().catch(() => {})
  }, [loadPortfolio, pollOrganizeStatus, router])

  const startOrganize = async () => {
    if (isOrganizing) return
    setIsOrganizing(true)
    try {
      await api.post(`/api/portfolios/${id}/organize`)
      pollOrganizeStatus()
    } catch (e) { setIsOrganizing(false) }
  }

  const publish = async () => {
    try {
      await api.post(`/api/portfolios/${id}/publish`)
      loadPortfolio()
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? 'Unknown error'
      setPublishError(`Publish failed: ${msg}`)
    }
  }

  if (!portfolio) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex justify-between items-center px-8 py-4 bg-white border-b">
        <Link href="/dashboard" className="text-xl font-bold text-purple-600">FolioSage</Link>
        <div className="flex gap-2">
          {portfolio.shareCode && (
            <Link href={`/p/${portfolio.shareCode}`} target="_blank">
              <Button variant="outline" size="sm">View Public →</Button>
            </Link>
          )}
          <Link href="/dashboard"><Button variant="ghost" size="sm">← Dashboard</Button></Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{portfolio.title}</h1>
            {portfolio.description && <p className="text-slate-500 mt-1">{portfolio.description}</p>}
          </div>
          <Badge variant={portfolio.published ? 'default' : 'secondary'}>
            {portfolio.published ? 'Published' : 'Draft'}
          </Badge>
        </div>

        <section>
          <h2 className="font-semibold text-lg mb-3">Upload Files</h2>
          <FileUploadZone portfolioId={id} onUploaded={() => loadPortfolio()} />
        </section>

        {portfolio.files?.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-lg">AI Organization</h2>
              {(organizeStatus.status === 'idle' || organizeStatus.status === 'failed') && (
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={startOrganize} disabled={isOrganizing}>
                  {isOrganizing ? '⏳ Organizing...' : '🤖 Start AI Organize'}
                </Button>
              )}
            </div>
            <OrganizeStatus
              status={organizeStatus.status}
              message={organizeStatus.message}
              onRetry={startOrganize}
            />
          </section>
        )}

        {organizeTree?.nodes?.length > 0 && (
          <section className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold text-lg mb-4">📂 AI-Organized Categories</h2>
            <div className="space-y-2">
              {organizeTree.nodes.map((node: any) => (
                <div key={node.id}>
                  <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-purple-50">
                    <span className="text-purple-600">📁</span>
                    <span className="font-medium text-slate-800">{node.name}</span>
                    <span className="ml-auto text-xs text-slate-400">{node.fileCount} file{node.fileCount !== 1 ? 's' : ''}</span>
                  </div>
                  {node.children?.length > 0 && (
                    <div className="ml-6 mt-1 space-y-1">
                      {node.children.map((child: any) => (
                        <div key={child.id} className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-slate-50">
                          <span className="text-slate-400">📄</span>
                          <span className="text-sm text-slate-700">{child.name}</span>
                          <span className="ml-auto text-xs text-slate-400">{child.fileCount} file{child.fileCount !== 1 ? 's' : ''}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {portfolio.files?.length > 0 && (
          <section>
            <h2 className="font-semibold text-lg mb-3">
              Files ({portfolio.files.length})
            </h2>
            <FileGallery
              files={portfolio.files}
              apiUrl={process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'}
            />
          </section>
        )}

        {portfolio.files?.length > 0 && (
          <section className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold text-lg mb-2">Share Your Portfolio</h2>
            {publishError && <p className="text-red-500 text-sm mb-4">{publishError}</p>}
            {portfolio.shareCode ? (
              <div>
                <p className="text-sm text-slate-500 mb-2">Public link:</p>
                <div className="flex gap-2 items-center">
                  <code className="bg-slate-100 px-3 py-2 rounded text-sm flex-1">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/p/{portfolio.shareCode}
                  </code>
                  <Button size="sm" variant="outline"
                          onClick={() => navigator.clipboard.writeText(
                            `${window.location.origin}/p/${portfolio.shareCode}`)}>
                    Copy
                  </Button>
                </div>
              </div>
            ) : (
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={publish}>
                🔗 Publish Portfolio
              </Button>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
