'use client'
import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { setToken } from '@/lib/auth'

function OAuthCallbackInner() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const token = params.get('token')
    if (token) {
      setToken(token)
      router.replace('/dashboard')
    } else {
      router.replace('/login?error=oauth_failed')
    }
  }, [params, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-500">로그인 처리 중...</p>
    </div>
  )
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">로그인 처리 중...</p>
      </div>
    }>
      <OAuthCallbackInner />
    </Suspense>
  )
}
