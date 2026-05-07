import { NextRequest } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareCode: string; vaultsageFileId: string }> },
) {
  const { shareCode, vaultsageFileId } = await params
  const download = request.nextUrl.searchParams.get('download')
  const upstreamUrl = new URL(
    `/api/public/${encodeURIComponent(shareCode)}/files/${encodeURIComponent(vaultsageFileId)}/raw`,
    API_URL,
  )
  if (download === 'true') upstreamUrl.searchParams.set('download', 'true')

  const upstream = await fetch(upstreamUrl, { cache: 'no-store' })
  const headers = new Headers()
  const contentType = upstream.headers.get('content-type')
  const disposition = upstream.headers.get('content-disposition')
  const contentLength = upstream.headers.get('content-length')

  if (contentType) headers.set('content-type', contentType)
  if (disposition) headers.set('content-disposition', disposition)
  if (contentLength) headers.set('content-length', contentLength)
  headers.set('x-content-type-options', 'nosniff')

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  })
}
