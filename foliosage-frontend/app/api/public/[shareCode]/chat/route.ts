import { NextRequest } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shareCode: string }> },
) {
  const { shareCode } = await params
  const upstreamUrl = new URL(`/api/public/${encodeURIComponent(shareCode)}/chat`, API_URL)
  const upstream = await fetch(upstreamUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: await request.text(),
    cache: 'no-store',
  })

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: {
      'content-type': upstream.headers.get('content-type') ?? 'application/json',
    },
  })
}
