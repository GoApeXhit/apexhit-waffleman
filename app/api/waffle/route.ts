import { NextResponse } from 'next/server'
import { getWaffleData, saveWaffleData } from '@/lib/waffle-store'

export const dynamic = 'force-dynamic'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store',
}

// ── Deploy hooks — triggered after every publish so connected apps rebuild ────
// Add these as env vars in WaffleMan → Vercel project → Settings → Environment Variables:
//   DEPLOY_HOOK_FHB      = https://api.vercel.com/v1/integrations/deploy/...
//   DEPLOY_HOOK_DBC      = https://api.vercel.com/v1/integrations/deploy/...
//   DEPLOY_HOOK_MTPD     = https://api.vercel.com/v1/integrations/deploy/...
//   DEPLOY_HOOK_BUZZROCK = https://api.vercel.com/v1/integrations/deploy/...
//   DEPLOY_HOOK_LINKIT   = https://api.vercel.com/v1/integrations/deploy/...
const DEPLOY_HOOKS = [
  process.env.DEPLOY_HOOK_FHB,
  process.env.DEPLOY_HOOK_DBC,
  process.env.DEPLOY_HOOK_MTPD,
  process.env.DEPLOY_HOOK_BUZZROCK,
  process.env.DEPLOY_HOOK_LINKIT,
].filter(Boolean) as string[]

async function triggerDeployHooks() {
  if (DEPLOY_HOOKS.length === 0) return
  await Promise.allSettled(
    DEPLOY_HOOKS.map(url =>
      fetch(url, { method: 'POST' })
        .then(r => { if (!r.ok) console.error('[waffle] deploy hook returned', r.status, url) })
        .catch(err => console.error('[waffle] deploy hook failed:', url, err))
    )
  )
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
    // Fire-and-forget: trigger rebuilds of all connected apps so fresh data is baked in at build time
    triggerDeployHooks().catch(err => console.error('[waffle] triggerDeployHooks error:', err))
    return NextResponse.json({ success: true }, { headers: CORS })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers: CORS })
  }
}
