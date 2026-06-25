import { NextResponse } from 'next/server'
import { getWaffleData, saveWaffleData } from '@/lib/waffle-store'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function GET() {
  const data = await getWaffleData()
  return NextResponse.json(data, { headers: CORS })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = { ...body, updatedAt: new Date().toISOString() }
    await saveWaffleData(data)
    return NextResponse.json({ success: true }, { headers: CORS })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers: CORS })
  }
}
