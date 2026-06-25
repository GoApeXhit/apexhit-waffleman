"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check, Globe, Code, Zap } from "lucide-react"

const BASE = "https://apexhit-waffleman.vercel.app"

const SNIPPETS = {
  html: `<!-- WaffleMan Widget — ApeXhit -->
<div data-waffleman></div>
<script src="${BASE}/widget.js" async></script>`,
  react: `// WaffleMan Widget — React / Next.js
import { useEffect } from 'react'

export function WaffleWidget() {
  useEffect(() => {
    const s = document.createElement('script')
    s.src = '${BASE}/widget.js'
    s.async = true
    document.body.appendChild(s)
    return () => { document.body.removeChild(s) }
  }, [])
  return <div data-waffleman />
}`,
  api: `// Fetch WaffleMan data (works anywhere)
const res = await fetch('${BASE}/api/waffle')
const { items } = await res.json()

const apps = items.filter(i => i.type === 'app')
const websites = items.filter(i => i.type === 'website')

// apps[0] -> { name, iconUrl, link, type, order }`,
  react_api: `// React hook — fetch and use WaffleMan data
import { useState, useEffect } from 'react'

export function useWaffleMan() {
  const [data, setData] = useState({ apps: [], websites: [] })
  useEffect(() => {
    fetch('${BASE}/api/waffle')
      .then(r => r.json())
      .then(d => setData({
        apps: d.items.filter(i => i.type === 'app'),
        websites: d.items.filter(i => i.type === 'website')
      }))
  }, [])
  return data
}`,
}

interface EmbedCodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmbedCodeDialog({ open, onOpenChange }: EmbedCodeDialogProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = (code: string, key: string) => {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const CodeBlock = ({ code, id }: { code: string; id: string }) => (
    <div className="relative group">
      <pre className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 text-sm text-[#c9d1d9] overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap break-all">
        <code>{code}</code>
      </pre>
      <Button size="sm" variant="ghost" className="absolute top-2.5 right-2.5 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[#161b22] hover:bg-[#21262d]" onClick={() => copy(code, id)}>
        {copied === id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#8b949e]" />}
      </Button>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#161b22] border-[#30363d] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2 text-lg">
            <span className="text-2xl">🧇</span>Embed WaffleMan Widget
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-[#8b949e] leading-relaxed">Drop one of these snippets into any app or website. Once embedded, your waffle automatically updates across all platforms every time you <strong className="text-amber-400">Publish</strong> in WaffleMan.</p>
        <Tabs defaultValue="html">
          <TabsList className="bg-[#0d1117] border border-[#30363d] w-full grid grid-cols-4">
            <TabsTrigger value="html" className="data-[state=active]:bg-[#21262d] data-[state=active]:text-white text-xs"><Globe className="w-3.5 h-3.5 mr-1" />HTML</TabsTrigger>
            <TabsTrigger value="react" className="data-[state=active]:bg-[#21262d] data-[state=active]:text-white text-xs"><Code className="w-3.5 h-3.5 mr-1" />React</TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-[#21262d] data-[state=active]:text-white text-xs"><Zap className="w-3.5 h-3.5 mr-1" />API</TabsTrigger>
            <TabsTrigger value="hook" className="data-[state=active]:bg-[#21262d] data-[state=active]:text-white text-xs"><Code className="w-3.5 h-3.5 mr-1" />Hook</TabsTrigger>
          </TabsList>
          <TabsContent value="html" className="space-y-2 mt-3">
            <p className="text-xs text-[#6e7681]">Paste anywhere in your HTML. Works with any site, CMS, or framework.</p>
            <CodeBlock code={SNIPPETS.html} id="html" />
            <Button className="w-full bg-amber-600 hover:bg-amber-500 text-white" onClick={() => copy(SNIPPETS.html, 'html-btn')}>
              {copied === 'html-btn' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}Copy HTML Snippet
            </Button>
          </TabsContent>
          <TabsContent value="react" className="space-y-2 mt-3">
            <p className="text-xs text-[#6e7681]">Drop this component into any React or Next.js page.</p>
            <CodeBlock code={SNIPPETS.react} id="react" />
            <Button className="w-full bg-amber-600 hover:bg-amber-500 text-white" onClick={() => copy(SNIPPETS.react, 'react-btn')}>
              {copied === 'react-btn' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}Copy React Component
            </Button>
          </TabsContent>
          <TabsContent value="api" className="space-y-2 mt-3">
            <p className="text-xs text-[#6e7681]">Fetch raw JSON and render the waffle your own way.</p>
            <CodeBlock code={SNIPPETS.api} id="api" />
            <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-xs text-[#8b949e] font-mono">GET {BASE}/api/waffle</div>
          </TabsContent>
          <TabsContent value="hook" className="space-y-2 mt-3">
            <p className="text-xs text-[#6e7681]">Reusable React hook — use the data however you like.</p>
            <CodeBlock code={SNIPPETS.react_api} id="hook" />
          </TabsContent>
        </Tabs>
        <div className="bg-amber-950/30 border border-amber-800/30 rounded-xl p-4 space-y-1.5">
          <div className="text-sm font-semibold text-amber-400 flex items-center gap-2"><Zap className="w-4 h-4" />How auto-sync works</div>
          <ul className="text-xs text-amber-200/60 space-y-1 list-disc list-inside">
            <li>Manage your apps & websites here in WaffleMan</li>
            <li>Click <strong className="text-amber-300">Publish</strong> to push changes to the live API</li>
            <li>All embedded widgets fetch from the API on every page load</li>
            <li>Zero manual updates to your apps — they all sync automatically</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
