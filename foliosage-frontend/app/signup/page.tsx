'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { isAxiosError } from 'axios'
import api from '@/lib/api'
import { setToken } from '@/lib/auth'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/api/auth/signup', form)
      setToken(data.token)
      router.push('/dashboard')
    } catch (err) {
      setError(isAxiosError(err) ? (err.response?.data?.error ?? 'Signup failed.') : 'An unexpected error occurred.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle className="text-2xl text-center">Join FolioSage</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={e => setForm(prev => ({...prev, name: e.target.value}))} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={e => setForm(prev => ({...prev, email: e.target.value}))} required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={form.password} onChange={e => setForm(prev => ({...prev, password: e.target.value}))} required minLength={6} />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </Button>
            <p className="text-center text-sm text-slate-500">
              Already have an account? <Link href="/login" className="text-purple-600">Log in</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
