import type { Metadata } from 'next'
import ProfileClient from './ProfileClient'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params
  try {
    const res = await fetch(`${API_URL}/api/public/users/${username}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return {}
    const data = await res.json()
    const title = `${data.name} (@${data.username}) — FolioSage`
    const description = data.bio ?? `${data.name}의 포트폴리오`
    return {
      title,
      description,
      openGraph: { title, description },
      twitter: { card: 'summary' },
    }
  } catch {
    return {}
  }
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  return <ProfileClient username={username} />
}
