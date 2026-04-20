'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isLoggedIn, removeToken } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

export default function DashboardPage() {
  const router = useRouter()
  const [portfolios, setPortfolios] = useState<any[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return }
    api.get('/api/portfolios')
      .then(r => setPortfolios(r.data))
      .catch(() => setError('Failed to load portfolios.'))
  }, [router])

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex justify-between items-center px-8 py-4 bg-white border-b">
        <span className="text-xl font-bold text-purple-600">FolioSage</span>
        <div className="flex gap-3">
          <Link href="/portfolios/new">
            <Button className="bg-purple-600 hover:bg-purple-700">+ New Portfolio</Button>
          </Link>
          <Button variant="ghost" onClick={() => { removeToken(); router.push('/login') }}>Logout</Button>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">My Portfolios</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {portfolios.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🎨</p>
            <p className="text-slate-500 mb-4">No portfolios yet.</p>
            <Link href="/portfolios/new">
              <Button className="bg-purple-600 hover:bg-purple-700">Create your first portfolio</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolios.map((p: any) => (
              <Link key={p.id} href={`/portfolios/${p.id}`}>
                <div className="bg-white rounded-xl border p-5 hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-800">{p.title}</h3>
                    <Badge variant={p.published ? 'default' : 'secondary'}>
                      {p.published ? 'Live' : 'Draft'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400">{p.fileCount} files</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
