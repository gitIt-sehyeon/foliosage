'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isLoggedIn } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api'

export default function NewPortfolioPage() {
  const router = useRouter()
  const [form, setForm] = useState({ title: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { if (!isLoggedIn()) router.push('/login') }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/api/portfolios', form)
      router.push(`/portfolios/${data.id}`)
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to create portfolio.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex justify-between items-center px-8 py-4 bg-white border-b">
        <Link href="/dashboard" className="text-xl font-bold text-purple-600">FolioSage</Link>
        <Link href="/dashboard"><Button variant="ghost">← Dashboard</Button></Link>
      </nav>
      <div className="max-w-xl mx-auto px-4 py-10">
        <Card>
          <CardHeader><CardTitle>Create New Portfolio</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Portfolio Title</Label>
                <Input value={form.title}
                       onChange={e => setForm({...form, title: e.target.value})}
                       placeholder="e.g. UI/UX Design Work 2026"
                       required />
              </div>
              <div>
                <Label>Description (optional)</Label>
                <Input value={form.description}
                       onChange={e => setForm({...form, description: e.target.value})}
                       placeholder="Brief description of this portfolio" />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
                {loading ? 'Creating...' : 'Create Portfolio'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
