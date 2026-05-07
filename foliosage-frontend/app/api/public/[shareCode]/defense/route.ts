import { NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shareCode: string }> },
) {
  const { shareCode } = await params
  const upstream = await fetch(`${API_URL}/api/public/${encodeURIComponent(shareCode)}/defense`, {
    cache: 'no-store',
  })
  const body = await upstream.text()
  return new NextResponse(body, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') ?? 'application/json',
    },
  })
}
