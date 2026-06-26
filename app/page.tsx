"use client"

import { useState, useEffect, useCallback, useRef, type ChangeEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Plus, Zap, Globe, Package, Edit, Trash,
  CheckCircle, AlertCircle, Loader2, Code, RefreshCw, Download, Upload
} from "lucide-react"
import { WafflePreview } from "@/components/waffle-preview"
import { AddItemDialog } from "@/components/add-item-dialog"
import { EmbedCodeDialog } from "@/components/embed-code-dialog"
import type { WaffleItem, WaffleData } from "@/types"
import { cn } from "@/lib/utils"
import { LockScreen } from '@/components/lock-screen'
import { isSessionValid } from '@/lib/access-keys'

const SEED: WaffleItem[] = [
  { id: '1', name: 'ApeXhit FHT', iconUrl: '', link: 'https://apexhit-fht.vercel.app', type: 'app', order: 1, createdAt: '' },
  { id: '2', name: 'ApeXhit LinkIT', iconUrl: '', link: 'https://apexhit-linkit.vercel.app', type: 'app', order: 2, createdAt: '' },
  { id: '3', name: 'ApeXhit DBC', iconUrl: '', link: 'https://apexhit-dbc.vercel.app', type: 'app', order: 3, createdAt: '' },
  { id: '4', name: 'ApeXhit', iconUrl: '', link: 'https://apexhit.org', type: 'website', order: 1, createdAt: '' },
  { id: '5', name: 'Buzzrock Enterprise', iconUrl: '', link: 'https://apexhit-buzzrock.vercel.app', type: 'website', order: 2, createdAt: '' },
  { id: '6', name: 'LinkIT', iconUrl: '', link: 'https://apexhit-linkit.vercel.app', type: 'website', order: 3, createdAt: '' },
  { id: '7', name: 'ApeXhit FHT', iconUrl: '', link: 'https://apexhit-fht.vercel.app', type: 'website', order: 4, createdAt: '' },
  { id: '8', name: 'ApeXhit DBC', iconUrl: '', link: 'https://apexhit-dbc.vercel.app', type: 'website', order: 5, createdAt: '' },
]

const COLORS = ["bg-amber-600","bg-cyan-600","bg-purple-600","bg-emerald-600","bg-rose-500","bg-blue-600","bg-orange-500","bg-pink-600"]
function getColor(name: string) {
  let idx = 0
  for (let i = 0; i < name.length; i++) idx += name.charCodeAt(i)
  return COLORS[idx % COLORS.length]
}

function ItemCard({
  item, onEdit, onDelete,
}: {
  item: WaffleItem
  onEdit: (item: WaffleItem) => void
  onDelete: (id: string) => void
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-[#0d1117] border border-[#21262d] hover:border-[#30363d] transition-colors group"
    >
      <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-[#30363d]">
        {item.iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.iconUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className={cn("w-full h-full flex items-center justify-center font-bold text-white text-sm", getColor(item.name))}>
            {item.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">{item.name}</div>
        <div className="text-[11px] text-[#6e7681] truncate">{item.link}</div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-[#8b949e] hover:text-white hover:bg-[#21262d]" onClick={() => onEdit(item)}>
          <Edit className="w-3.5 h-3.5" />
        </Button>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500/70 hover:text-red-400 hover:bg-red-950/30" onClick={() => onDelete(item.id)}>
          <Trash className="w-3.5 h-3.5" />
        </Button>
      </div>
    </motion.div>
  )
}

type PublishState = 'idle' | 'publishing' | 'published' | 'error'

function WaffleManApp() {
  const [items, setItems] = useState<WaffleItem[]>(SEED)
  const [publishState, setPublishState] = useState<PublishState>('idle')
  const [addOpen, setAddOpen] = useState(false)
  const [addDefaultType, setAddDefaultType] = useState<'app' | 'website'>('app')
  const [editItem, setEditItem] = useState<WaffleItem | null>(null)
  const [embedOpen, setEmbedOpen] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('waffleman-v1')
      if (saved) setItems(JSON.parse(saved))
    } catch { /* fresh start */ }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('waffleman-v1', JSON.stringify(items))
      setPublishState(s => s === 'published' ? 'idle' : s)
    } catch { /* ignore */ }
  }, [items])

  const apps = items.filter(i => i.type === 'app').sort((a, b) => a.order - b.order)
  const websites = items.filter(i => i.type === 'website').sort((a, b) => a.order - b.order)

  const handleAdd = useCallback((newItem: Omit<WaffleItem, 'id' | 'createdAt' | 'order'>) => {
    const typeCount = items.filter(i => i.type === newItem.type).length
    setItems(prev => [...prev, { ...newItem, id: crypto.randomUUID(), order: typeCount + 1, createdAt: new Date().toISOString() }])
  }, [items])

  const handleEdit = useCallback((updated: Omit<WaffleItem, 'id' | 'createdAt' | 'order'>) => {
    if (!editItem) return
    setItems(prev => prev.map(i => i.id === editItem.id ? { ...i, ...updated } : i))
    setEditItem(null)
  }, [editItem])

  const handleDelete = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const openEdit = useCallback((item: WaffleItem) => { setEditItem(item); setAddOpen(true) }, [])
  const openAdd = useCallback((type: 'app' | 'website') => { setEditItem(null); setAddDefaultType(type); setAddOpen(true) }, [])

  const importInputRef = useRef<HTMLInputElement>(null)

  const handleExport = useCallback(() => {
    const payload = {
      app: 'WaffleMan',
      version: '1',
      exportedAt: new Date().toISOString(),
      items,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    const ts   = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19)
    a.href     = url
    a.download = `waffleman-backup-${ts}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [items])

  const handleImport = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (!Array.isArray(data.items)) throw new Error('Invalid backup format')
        if (confirm(`Restore ${data.items.length} items from backup (${data.exportedAt?.slice(0,10) ?? 'unknown date'})?\n\nThis will replace your current waffle data.`)) {
          setItems(data.items)
          setPublishState('idle')
        }
      } catch {
        alert('Invalid backup file. Please choose a valid WaffleMan JSON backup.')
      }
      // reset so same file can be imported again
      if (importInputRef.current) importInputRef.current.value = ''
    }
    reader.readAsText(file)
  }, [])

  const handlePublish = async () => {
    setPublishState('publishing')
    try {
      const data: WaffleData = { items, updatedAt: new Date().toISOString() }
      const res = await fetch('/api/waffle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      setPublishState(res.ok ? 'published' : 'error')
      if (res.ok) setTimeout(() => setPublishState('idle'), 4000)
    } catch {
      setPublishState('error')
      setTimeout(() => setPublishState('idle'), 3000)
    }
  }

  const publishLabel = { idle: 'Publish', publishing: 'Publishing…', published: 'Published!', error: 'Failed — Retry' }[publishState]
  const publishIcon = {
    idle: <Zap className="w-3.5 h-3.5 mr-1.5" />,
    publishing: <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />,
    published: <CheckCircle className="w-3.5 h-3.5 mr-1.5" />,
    error: <AlertCircle className="w-3.5 h-3.5 mr-1.5" />,
  }[publishState]
  const publishClass = { idle: 'bg-amber-600 hover:bg-amber-500', publishing: 'bg-amber-700 cursor-not-allowed', published: 'bg-emerald-700 hover:bg-emerald-600', error: 'bg-red-700 hover:bg-red-600' }[publishState]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-[#21262d] bg-[#0d1117]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="WaffleMan" className="w-9 h-9 rounded-lg object-contain" />
            <div>
              <span className="text-base font-bold text-white tracking-tight">WaffleMan</span>
              <span className="ml-2 text-[11px] text-[#6e7681] font-medium">by ApeXhit</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn("text-[10px] font-semibold border hidden sm:flex", {
              'bg-[#0d1117] text-[#8b949e] border-[#30363d]': publishState === 'idle',
              'bg-amber-950/40 text-amber-400 border-amber-800/50': publishState === 'publishing',
              'bg-emerald-950/40 text-emerald-400 border-emerald-800/50': publishState === 'published',
              'bg-red-950/40 text-red-400 border-red-800/50': publishState === 'error',
            })}>
              {publishState === 'idle' && '● Draft'}
              {publishState === 'publishing' && '● Syncing…'}
              {publishState === 'published' && '✓ Live'}
              {publishState === 'error' && '✗ Error'}
            </Badge>
            <Button onClick={handlePublish} disabled={publishState === 'publishing'} size="sm" className={cn("text-white font-semibold transition-all", publishClass)}>
              {publishIcon}{publishLabel}
            </Button>
            <Button onClick={() => setEmbedOpen(true)} size="sm" variant="outline" className="border-cyan-800/60 text-cyan-400 hover:bg-cyan-950/40 hover:border-cyan-700">
              <Code className="w-3.5 h-3.5 mr-1.5" />Embed Code
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">Waffle Manager</h2>
              <p className="text-sm text-[#8b949e]">Add and organize your apps & featured websites. Hit <strong className="text-amber-400">Publish</strong> to sync across all your platforms instantly.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-950/50 border border-amber-800/30 flex items-center justify-center">
                  <Package className="w-4 h-4 text-amber-400" />
                </div>
                <div><div className="text-2xl font-bold text-white leading-none">{apps.length}</div><div className="text-[11px] text-[#6e7681] mt-0.5">Apps</div></div>
              </div>
              <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-950/50 border border-cyan-800/30 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-cyan-400" />
                </div>
                <div><div className="text-2xl font-bold text-white leading-none">{websites.length}</div><div className="text-[11px] text-[#6e7681] mt-0.5">Featured Sites</div></div>
              </div>
            </div>

            <Tabs defaultValue="apps" className="space-y-3">
              <TabsList className="bg-[#0d1117] border border-[#21262d] w-full grid grid-cols-2">
                <TabsTrigger value="apps" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white text-[#8b949e]">
                  <Package className="w-3.5 h-3.5 mr-1.5" />My Apps ({apps.length})
                </TabsTrigger>
                <TabsTrigger value="websites" className="data-[state=active]:bg-cyan-700 data-[state=active]:text-white text-[#8b949e]">
                  <Globe className="w-3.5 h-3.5 mr-1.5" />Featured Sites ({websites.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="apps" className="space-y-2 mt-0">
                <button onClick={() => openAdd('app')} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-[#30363d] text-[#6e7681] hover:border-amber-700/60 hover:text-amber-400 hover:bg-amber-950/10 transition-all text-sm font-medium group">
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />Add New App
                </button>
                {apps.length === 0 ? (
                  <div className="text-center py-12 text-[#6e7681]"><Package className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-sm">No apps yet</p></div>
                ) : (
                  <ScrollArea className="max-h-[480px]"><AnimatePresence><div className="space-y-2 pr-2">{apps.map(item => <ItemCard key={item.id} item={item} onEdit={openEdit} onDelete={handleDelete} />)}</div></AnimatePresence></ScrollArea>
                )}
              </TabsContent>

              <TabsContent value="websites" className="space-y-2 mt-0">
                <button onClick={() => openAdd('website')} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-[#30363d] text-[#6e7681] hover:border-cyan-700/60 hover:text-cyan-400 hover:bg-cyan-950/10 transition-all text-sm font-medium group">
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />Add Featured Website
                </button>
                {websites.length === 0 ? (
                  <div className="text-center py-12 text-[#6e7681]"><Globe className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-sm">No featured websites yet</p></div>
                ) : (
                  <ScrollArea className="max-h-[480px]"><AnimatePresence><div className="space-y-2 pr-2">{websites.map(item => <ItemCard key={item.id} item={item} onEdit={openEdit} onDelete={handleDelete} />)}</div></AnimatePresence></ScrollArea>
                )}
              </TabsContent>
            </Tabs>

            {/* Hidden file input for import */}
            <input
              ref={importInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImport}
            />

            <div className="flex items-center justify-between pt-2 border-t border-[#21262d]">
              <span className="text-xs text-[#6e7681]">Changes are saved locally until you Publish</span>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" title="Export backup" className="text-[#6e7681] hover:text-emerald-400 text-xs h-7 px-2" onClick={handleExport}>
                  <Download className="w-3 h-3 mr-1" />Export
                </Button>
                <Button size="sm" variant="ghost" title="Import backup" className="text-[#6e7681] hover:text-cyan-400 text-xs h-7 px-2" onClick={() => importInputRef.current?.click()}>
                  <Upload className="w-3 h-3 mr-1" />Import
                </Button>
                <div className="w-px h-4 bg-[#30363d] mx-0.5" />
                <Button size="sm" variant="ghost" className="text-[#6e7681] hover:text-white text-xs h-7 px-2" onClick={() => { if (confirm('Reset to default ApeXhit data?')) { setItems(SEED); setPublishState('idle') } }}>
                  <RefreshCw className="w-3 h-3 mr-1" />Reset
                </Button>
              </div>
            </div>
          </div>

          <div className="xl:sticky xl:top-20 space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-[11px] font-bold text-[#8b949e] uppercase tracking-widest">Live Preview</h3>
              <div className="flex-1 h-px bg-[#21262d]" />
              <span className="text-[10px] text-[#6e7681]">Widget appearance</span>
            </div>
            <WafflePreview apps={apps} websites={websites} />
            <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" /><span className="text-sm font-semibold text-white">Ready to go live?</span></div>
              <p className="text-xs text-[#8b949e] leading-relaxed">Publish pushes your waffle to the live API. All embedded widgets across your apps update automatically.</p>
              <Button onClick={handlePublish} disabled={publishState === 'publishing'} className={cn("w-full text-white font-semibold", publishClass)}>{publishIcon}{publishLabel}</Button>
            </div>
          </div>
        </div>
      </main>

      <AddItemDialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) setEditItem(null) }} onSave={editItem ? handleEdit : handleAdd} editItem={editItem} defaultType={addDefaultType} />
      <EmbedCodeDialog open={embedOpen} onOpenChange={setEmbedOpen} />
    </div>
  )
}

export default function WaffleManPage() {
  const [locked,   setLocked]   = useState(true)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    setLocked(!isSessionValid())
    setChecking(false)
  }, [])

  const handleUnlock = useCallback(() => setLocked(false), [])

  if (checking) {
    return (
      <div className="fixed inset-0 bg-[#0d1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return locked ? <LockScreen onUnlock={handleUnlock} /> : <WaffleManApp />
}
