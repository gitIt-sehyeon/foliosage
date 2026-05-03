import type { Metadata } from 'next'
import ShareLinkClient from './ShareLinkClient'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shareCode: string }>
}): Promise<Metadata> {
  const { shareCode } = await params
  try {
    const res = await fetch(`${API_URL}/api/public/${shareCode}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return {}
    const data = await res.json()
    const firstFile = data.files?.[0]
    const imageUrl = firstFile
      ? `${API_URL}/api/public/${shareCode}/preview/${firstFile.vaultsageFileId}`
      : undefined
    const title = `${data.title} — FolioSage`
    const description = data.description ?? `${data.ownerName ?? '포트폴리오'} on FolioSage`
    return {
      title,
      description,
      openGraph: {
        title: data.title,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
      twitter: { card: 'summary_large_image' },
    }
  } catch {
    return {}
  }
}

export default async function ShareLinkPage({
  params,
}: {
  params: Promise<{ shareCode: string }>
}) {
  const { shareCode } = await params
  return <ShareLinkClient shareCode={shareCode} />
}
