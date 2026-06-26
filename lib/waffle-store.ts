import type { WaffleData } from '@/types'
import { put, list, del } from '@vercel/blob'

/* ─────────────────────────────────────────────────────────────────────────────
 * Persistence strategy (in priority order):
 * 1. Vercel Blob (always fresh — no URL caching, latest blob by uploadedAt)
 * 2. In-memory global (fast, works while the lambda instance stays warm)
 * 3. DEFAULT_DATA (hardcoded seed, only when both above miss)
 * ───────────────────────────────────────────────────────────────────────────── */

const BLOB_PATHNAME = 'waffle-data.json'

/* eslint-disable no-var */
declare global {
  var _waffleData: WaffleData | undefined
}

const DEFAULT_DATA: WaffleData = {
  items: [
    { id: '1', name: 'ApeXhit FHT', iconUrl: '', link: 'https://apexhit-fht.vercel.app', type: 'app', order: 1, createdAt: new Date().toISOString() },
    { id: '2', name: 'ApeXhit LinkIT', iconUrl: '', link: 'https://apexhit-linkit.vercel.app', type: 'app', order: 2, createdAt: new Date().toISOString() },
    { id: '3', name: 'ApeXhit DBC', iconUrl: '', link: 'https://apexhit-dbc.vercel.app', type: 'app', order: 3, createdAt: new Date().toISOString() },
    { id: '4', name: 'ApeXhit', iconUrl: '', link: 'https://apexhit.org', type: 'website', order: 1, createdAt: new Date().toISOString() },
    { id: '5', name: 'Buzzrock Enterprise', iconUrl: '', link: 'https://apexhit-buzzrock.vercel.app', type: 'website', order: 2, createdAt: new Date().toISOString() },
    { id: '6', name: 'LinkIT', iconUrl: '', link: 'https://apexhit-linkit.vercel.app', type: 'website', order: 3, createdAt: new Date().toISOString() },
    { id: '7', name: 'ApeXhit FHT', iconUrl: '', link: 'https://apexhit-fht.vercel.app', type: 'website', order: 4, createdAt: new Date().toISOString() },
    { id: '8', name: 'ApeXhit DBC', iconUrl: '', link: 'https://apexhit-dbc.vercel.app', type: 'website', order: 5, createdAt: new Date().toISOString() },
  ],
  updatedAt: new Date().toISOString(),
}

/** Whether Vercel Blob is available in this environment */
function blobEnabled(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN
}

/** Pick the most recently uploaded blob from a list */
function latestBlob(blobs: Awaited<ReturnType<typeof list>>['blobs']) {
  return blobs.reduce((a, b) =>
    (a.uploadedAt instanceof Date ? a.uploadedAt.getTime() : new Date(a.uploadedAt).getTime()) >=
    (b.uploadedAt instanceof Date ? b.uploadedAt.getTime() : new Date(b.uploadedAt).getTime())
      ? a
      : b
  )
}

export async function getWaffleData(): Promise<WaffleData> {
  // ── 1. Try Vercel Blob — always re-list to get the freshest URL ───────────
  if (blobEnabled()) {
    try {
      const { blobs } = await list({ prefix: BLOB_PATHNAME })
      if (blobs.length > 0) {
        const blob = latestBlob(blobs)
        const res = await fetch(blob.url, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store' },
        })
        if (res.ok) {
          const data = (await res.json()) as WaffleData
          global._waffleData = data
          return data
        }
      }
    } catch {
      // Blob unreachable — fall through to in-memory below
    }
  }

  // ── 2. In-memory global (warm instance) ──────────────────────────────────
  if (global._waffleData) return global._waffleData

  // ── 3. Hardcoded seed ────────────────────────────────────────────────────
  return DEFAULT_DATA
}

export async function saveWaffleData(data: WaffleData): Promise<void> {
  // Always update in-memory immediately for subsequent calls in this instance
  global._waffleData = data

  // Persist to Vercel Blob so all instances and connected apps pick up the change
  if (blobEnabled()) {
    try {
      // 1. Write the new blob first (so reads never see a gap)
      const newBlob = await put(BLOB_PATHNAME, JSON.stringify(data), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
      })

      // 2. Clean up any older blobs at the same path (prevents stale URL accumulation)
      try {
        const { blobs: existing } = await list({ prefix: BLOB_PATHNAME })
        const stale = existing.filter((b) => b.url !== newBlob.url)
        if (stale.length > 0) {
          await del(stale.map((b) => b.url))
        }
      } catch {
        // Cleanup failure is non-fatal — reads will still pick the latest by uploadedAt
      }
    } catch (err) {
      console.error('[waffle-store] Blob write failed, data only in memory:', err)
    }
  }
}
