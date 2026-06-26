'use client'

import { useState, useCallback } from 'react'
import { Eye, EyeOff, Lock, Key } from 'lucide-react'
import { getStoredKeys, setSessionKey } from '@/lib/access-keys'

interface LockScreenProps {
  onUnlock: () => void
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [input,   setInput]   = useState('')
  const [showKey, setShowKey] = useState(false)
  const [error,   setError]   = useState('')

  const handleUnlock = useCallback(() => {
    const keys  = getStoredKeys()
    const match = keys.find(k => k.key === input.trim().toUpperCase())

    if (!match) {
      setError('Invalid access key. Please check and try again.')
      return
    }
    if (match.revoked) {
      setError('This key has been revoked and can no longer be used.')
      return
    }

    setSessionKey(match.key)
    onUnlock()
  }, [input, onUnlock])

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0f0a00]">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg,#f59e0b 0,#f59e0b 1px,transparent 1px,transparent 48px),' +
            'repeating-linear-gradient(90deg,#f59e0b 0,#f59e0b 1px,transparent 1px,transparent 48px)',
        }}
      />

      <div className="relative w-full max-w-sm mx-4">
        {/* Card */}
        <div className="bg-amber-950/80 border border-amber-800/60 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">

          {/* Branding */}
          <div className="flex flex-col items-center mb-7">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg mb-4 ring-2 ring-amber-700/50 bg-amber-900/60 flex items-center justify-center">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                <rect x="4"  y="4"  width="16" height="16" rx="3" fill="#f59e0b"/>
                <rect x="28" y="4"  width="16" height="16" rx="3" fill="#f59e0b"/>
                <rect x="4"  y="28" width="16" height="16" rx="3" fill="#f59e0b"/>
                <rect x="28" y="28" width="16" height="16" rx="3" fill="#f59e0b"/>
              </svg>
            </div>
            <h1 className="text-xl font-black text-amber-100 tracking-tight">WaffleMan</h1>
            <p className="text-sm text-amber-400/60 font-medium">App Manager</p>
          </div>

          {/* Lock label */}
          <div className="flex items-center justify-center gap-1.5 mb-5">
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs text-amber-400 font-medium uppercase tracking-wide">
              Enter access key to continue
            </span>
          </div>

          {/* Key input */}
          <div className="relative mb-3">
            <input
              type={showKey ? 'text' : 'password'}
              value={input}
              onChange={e => { setInput(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleUnlock()}
              placeholder="WFLM-XXXX-XXXX-XXXX"
              className={`w-full bg-amber-900/50 border rounded-xl px-4 py-3 pr-12 text-amber-100 placeholder:text-amber-700/70 focus:outline-none focus:ring-2 text-sm font-mono tracking-wider transition-colors ${
                error
                  ? 'border-red-500/60 focus:ring-red-500/40'
                  : 'border-amber-700/50 focus:ring-amber-500/40'
              }`}
              autoFocus
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowKey(v => !v)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600 hover:text-amber-300 transition-colors"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-xs mb-3 text-center">{error}</p>
          )}

          <button
            onClick={handleUnlock}
            className="w-full bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 mt-1"
          >
            <Key className="w-4 h-4" />
            Unlock
          </button>
        </div>

        <p className="text-center text-amber-800/50 text-[11px] mt-3">
          ApeXhit · WaffleMan
        </p>
      </div>
    </div>
  )
}
