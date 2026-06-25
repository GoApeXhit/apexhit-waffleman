"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X } from "lucide-react"
import type { WaffleItem } from "@/types"
import { cn } from "@/lib/utils"

const ICON_COLORS = ["bg-amber-600", "bg-cyan-600", "bg-purple-600", "bg-emerald-600", "bg-rose-500", "bg-blue-600"]

function getColor(name: string) {
  let idx = 0
  for (let i = 0; i < name.length; i++) idx += name.charCodeAt(i)
  return ICON_COLORS[idx % ICON_COLORS.length]
}

interface AddItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (item: Omit<WaffleItem, 'id' | 'createdAt' | 'order'>) => void
  editItem?: WaffleItem | null
  defaultType?: 'app' | 'website'
}

export function AddItemDialog({ open, onOpenChange, onSave, editItem, defaultType = 'app' }: AddItemDialogProps) {
  const [name, setName] = useState('')
  const [link, setLink] = useState('')
  const [iconUrl, setIconUrl] = useState('')
  const [iconPreview, setIconPreview] = useState('')
  const [iconUrlInput, setIconUrlInput] = useState('')
  const [type, setType] = useState<'app' | 'website'>(defaultType)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      if (editItem) {
        setName(editItem.name); setLink(editItem.link); setIconUrl(editItem.iconUrl)
        setIconPreview(editItem.iconUrl); setIconUrlInput(editItem.iconUrl.startsWith('data:') ? '' : editItem.iconUrl)
        setType(editItem.type)
      } else {
        setName(''); setLink(''); setIconUrl(''); setIconPreview(''); setIconUrlInput(''); setType(defaultType)
      }
    }
  }, [open, editItem, defaultType])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      setIconUrl(result); setIconPreview(result); setIconUrlInput('')
    }
    reader.readAsDataURL(file)
  }

  const handleUrlChange = (val: string) => { setIconUrlInput(val); setIconUrl(val); setIconPreview(val) }
  const clearIcon = () => { setIconUrl(''); setIconPreview(''); setIconUrlInput(''); if (fileRef.current) fileRef.current.value = '' }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !link.trim()) return
    onSave({ name: name.trim(), link: link.trim(), iconUrl, type })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#161b22] border-[#30363d] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <span className="text-xl">{editItem ? '✏️' : '➕'}</span>
            {editItem ? 'Edit Item' : 'Add New Item'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[#8b949e] text-xs uppercase tracking-wider">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as 'app' | 'website')}>
              <SelectTrigger className="bg-[#0d1117] border-[#30363d] text-white focus:ring-amber-600"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#161b22] border-[#30363d] text-white">
                <SelectItem value="app">📦 App (Grid view)</SelectItem>
                <SelectItem value="website">🌐 Featured Website (List view)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[#8b949e] text-xs uppercase tracking-wider">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="ApeXhit FHT" className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#6e7681] focus-visible:ring-amber-600" required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[#8b949e] text-xs uppercase tracking-wider">URL / Link</Label>
            <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://example.com" type="url" className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#6e7681] focus-visible:ring-amber-600" required />
          </div>
          <div className="space-y-2">
            <Label className="text-[#8b949e] text-xs uppercase tracking-wider">Icon</Label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-[#30363d]">
                {iconPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={iconPreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className={cn("w-full h-full flex items-center justify-center font-bold text-white text-xl", name ? getColor(name) : "bg-[#0d1117]")}>  
                    {name ? name.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="border-[#30363d] bg-[#0d1117] text-[#c9d1d9] hover:bg-[#161b22] flex-1">
                    <Upload className="w-3.5 h-3.5 mr-1.5" />Upload Image
                  </Button>
                  {iconPreview && <Button type="button" variant="ghost" size="sm" onClick={clearIcon} className="text-red-400 hover:text-red-300 hover:bg-red-950/30 px-2"><X className="w-3.5 h-3.5" /></Button>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] text-[#6e7681]">Or paste an image URL:</p>
              <Input value={iconUrlInput} onChange={(e) => handleUrlChange(e.target.value)} placeholder="https://example.com/icon.png" className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#6e7681] focus-visible:ring-amber-600 text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#30363d]">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-[#8b949e] hover:text-white">Cancel</Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white">{editItem ? 'Save Changes' : 'Add to Waffle'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
