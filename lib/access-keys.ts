// ─── Access Key Utilities ─────────────────────────────────────────────────────
// Shared between lock-screen.tsx and app/page.tsx

export interface AccessKey {
  id: number;
  key: string;
  revoked: boolean;
  label: string;
}

/** Single master key — only this key unlocks WaffleMan. */
export const DEFAULT_KEYS: AccessKey[] = [
  { id: 1, key: 'WFLM-RSMO-NIJV-UM3A', revoked: false, label: 'Master Key' },
];

// v1 namespace
const KEYS_STORAGE = 'waffleman-master-keys-v1';
const SESSION_KEY  = 'waffleman-session-key';

/** Read keys from localStorage. Seeds defaults on first run. */
export function getStoredKeys(): AccessKey[] {
  try {
    const raw = localStorage.getItem(KEYS_STORAGE);
    if (!raw) {
      saveStoredKeys(DEFAULT_KEYS);
      return DEFAULT_KEYS;
    }
    return JSON.parse(raw) as AccessKey[];
  } catch {
    return DEFAULT_KEYS;
  }
}

/** Persist keys to localStorage. */
export function saveStoredKeys(keys: AccessKey[]): void {
  try { localStorage.setItem(KEYS_STORAGE, JSON.stringify(keys)); } catch {}
}

/** Get the key used by the current browser session. */
export function getSessionKey(): string | null {
  try { return sessionStorage.getItem(SESSION_KEY); } catch { return null; }
}

/** Mark this session as authenticated with a specific key. */
export function setSessionKey(key: string): void {
  try { sessionStorage.setItem(SESSION_KEY, key); } catch {}
}

/** Clear the session (lock the app). */
export function clearSessionKey(): void {
  try { sessionStorage.removeItem(SESSION_KEY); } catch {}
}

/**
 * Returns true if this browser session has a valid, non-revoked session key.
 * Call client-side only (after mount).
 */
export function isSessionValid(): boolean {
  const sessionKey = getSessionKey();
  if (!sessionKey) return false;
  const keys = getStoredKeys();
  return keys.some(k => k.key === sessionKey && !k.revoked);
}
