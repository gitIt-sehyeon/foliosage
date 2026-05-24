'use client'
import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { isLoggedIn } from '@/lib/auth'
import SmartOrganizerView from '@/components/organize/SmartOrganizerView'

export default function OrganizePage() {
  const params = useParams()
  const router = useRouter()
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id
  const id = rawId ?? ''

  useEffect(() => {
    if (!isLoggedIn()) router.push('/login')
  }, [router])

  return <SmartOrganizerView portfolioId={id} />
}
