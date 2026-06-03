import { NextRequest } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareCode: string; vaultsageFileId: string }> },
) {
  const { shareCode, vaultsageFileId } = await params
  const render = request.nextUrl.searchParams.get('render')
  const upstreamUrl = new URL(
    `/api/public/${encodeURIComponent(shareCode)}/preview/${encodeURIComponent(vaultsageFileId)}`,
    API_URL,
  )
  if (render === 'png') upstreamUrl.searchParams.set('render', 'true')

  const upstream = await fetch(upstreamUrl, { cache: 'no-store' })
  const headers = new Headers()
  const contentType = upstream.headers.get('content-type')
  const contentLength = upstream.headers.get('content-length')

  if (contentType) headers.set('content-type', contentType)
  if (contentLength) headers.set('content-length', contentLength)
  headers.set('x-content-type-options', 'nosniff')

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  })
}
