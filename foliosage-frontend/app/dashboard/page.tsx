'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isLoggedIn, removeToken } from '@/lib/auth'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return }
    setChecked(true)
  }, [router])

  if (!checked) return null

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
        <p className="text-slate-500">No portfolios yet. Create your first one!</p>
      </div>
    </div>
  )
}
