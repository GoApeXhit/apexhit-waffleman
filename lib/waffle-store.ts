import type { WaffleData } from '@/types'
import { put, list } from '@vercel/blob'

/* ─────────────────────────────────────────────────────────────────────────────
 * Persistence strategy (in priority order):
 * 1. Vercel Blob (recommended, true cross-instance persistence)
 *    → requires BLOB_READ_WRITE_TOKEN env var (auto-set by Vercel Blob addon)
 * 2. In-memory global (fast, works while the lambda instance stays warm)
 * 3. DEFAULT_DATA (hardcoded seed, only when both above miss)
 * ───────────────────────────────────────────────────────────────────────────── */

const BLOB_PATHNAME = 'waffle-data.json'

/* eslint-disable no-var */
declare global {
  var _waffleData: WaffleData | undefined
  var _waffleBlobUrl: string | undefined
}

const DEFAULT_DATA: WaffleData = {
  items: [
    { id: '1', name: 'ApeXhit FHT',     iconUrl: '', link: 'https://apexhit-fht.vercel.app',     type: 'app',     order: 1, createdAt: new Date().toISOString() },
    { id: '2', name: 'ApeXhit LinkIT',  iconUrl: '', link: 'https://apexhit-linkit.vercel.app',  type: 'app',     order: 2, createdAt: new Date().toISOString() },
    { id: '3', name: 'ApeXhit DBC',     iconUrl: '', link: 'https://apexhit-dbc.vercel.app',     type: 'app',     order: 3, createdAt: new Date().toISOString() },
    { id: '4', name: 'ApeXhit',         iconUrl: '', link: 'https://apexhit.org',                type: 'website', order: 1, createdAt: new Date().toISOString() },
    { id: '5', name: 'Buzzrock Enterprise', iconUrl: '', link: 'https://apexhit-buzzrock.vercel.app', type: 'website', order: 2, createdAt: new Date().toISOString() },
    { id: '6', name: 'LinkIT',          iconUrl: '', link: 'https://apexhit-linkit.vercel.app',  type: 'website', order: 3, createdAt: new Date().toISOString() },
    { id: '7', name: 'ApeXhit FHT',     iconUrl: '', link: 'https://apexhit-fht.vercel.app',     type: 'website', order: 4, createdAt: new Date().toISOString() },
    { id: '8', name: 'ApeXhit DBC',     iconUrl: '', link: 'https://apexhit-dbc.vercel.app',     type: 'website', order: 5, createdAt: new Date().toISOString() },
  ],
  updatedAt: new Date().toISOString(),
}

/** Whether Vercel Blob is available in this environment */
function blobEnabled(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN
}

export async function getWaffleData(): Promise<WaffleData> {
  // ── 1. Try Vercel Blob ────────────────────────────────────────────────────
  if (blobEnabled()) {
    try {
      // Use cached blob URL if we already looked it up in this instance
      let blobUrl = global._waffleBlobUrl
      if (!blobUrl) {
        const { blobs } = await list({ prefix: BLOB_PATHNAME })
        blobUrl = blobs.find((b) => b.pathname === BLOB_PATHNAME)?.url
        if (blobUrl) global._waffleBlobUrl = blobUrl
      }
      if (blobUrl) {
        const res = await fetch(blobUrl, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json() as WaffleData
          global._waffleData = data   // prime the in-memory cache too
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

  // Persist to Vercel Blob if available so other instances pick up the change
  if (blobEnabled()) {
    try {
      const blob = await put(BLOB_PATHNAME, JSON.stringify(data), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
      })
      global._waffleBlobUrl = blob.url  // cache the URL for this instance
    } catch (err) {
      console.error('[waffle-store] Blob write failed, data only in memory:', err)
    }
  }
}
