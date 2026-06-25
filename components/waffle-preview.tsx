"use client"

import { WaffleItem } from "@/types"
import { ExternalLink, Package, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

const ICON_COLORS = [
  "bg-amber-600", "bg-cyan-600", "bg-purple-600",
  "bg-emerald-600", "bg-rose-500", "bg-blue-600",
  "bg-orange-500", "bg-pink-600"
]

function getColor(name: string) {
  let idx = 0
  for (let i = 0; i < name.length; i++) idx += name.charCodeAt(i)
  return ICON_COLORS[idx % ICON_COLORS.length]
}

function ItemIcon({ item, size = "md" }: { item: WaffleItem; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "w-8 h-8" : "w-12 h-12"
  const radius = size === "sm" ? "rounded-lg" : "rounded-xl"
  const text = size === "sm" ? "text-sm" : "text-xl"
  const color = getColor(item.name)

  return (
    <div className={cn(dim, radius, "overflow-hidden flex-shrink-0")}>
      {item.iconUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.iconUrl} alt={item.name} className="w-full h-full object-cover" />
      ) : (
        <div className={cn("w-full h-full flex items-center justify-center font-bold text-white", text, color)}>
          {item.name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  )
}

interface WafflePreviewProps {
  apps: WaffleItem[]
  websites: WaffleItem[]
  className?: string
}

export function WafflePreview({ apps, websites, className }: WafflePreviewProps) {
  const isEmpty = apps.length === 0 && websites.length === 0

  return (
    <div className={cn(
      "bg-[#0d1117] border border-[#30363d] rounded-2xl overflow-hidden shadow-2xl w-full",
      className
    )}>
      {apps.length > 0 && (
        <>
          <div className="px-4 py-2.5 bg-[#161b22]">
            <span className="text-[10px] font-bold tracking-widest text-[#8b949e] uppercase">ApeXhit Apps</span>
          </div>
          <div className="p-2">
            <div
              className="grid gap-[3px] rounded-xl overflow-hidden p-[3px]"
              style={{ gridTemplateColumns: "repeat(3, 1fr)", background: "linear-gradient(135deg, #92400e 0%, #d97706 50%, #92400e 100%)" }}
            >
              {apps.map((app) => (
                <a key={app.id} href={app.link} target="_blank" rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-3 bg-[#0d1117] hover:bg-[#1c2230] transition-all cursor-pointer group rounded-lg"
                >
                  <ItemIcon item={app} size="md" />
                  <span className="text-[10px] text-[#c9d1d9] text-center leading-tight font-medium group-hover:text-white transition-colors line-clamp-2">{app.name}</span>
                </a>
              ))}
            </div>
          </div>
        </>
      )}

      {apps.length > 0 && websites.length > 0 && <div className="mx-4 border-t border-[#21262d]" />}

      {websites.length > 0 && (
        <>
          <div className="px-4 py-2.5 bg-[#161b22]">
            <span className="text-[10px] font-bold tracking-widest text-[#8b949e] uppercase">Featured Websites</span>
          </div>
          <div className="px-2 py-1 space-y-0.5 pb-2">
            {websites.map((site) => (
              <a key={site.id} href={site.link} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#161b22] transition-colors group"
              >
                <ItemIcon item={site} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#c9d1d9] truncate group-hover:text-white transition-colors">{site.name}</div>
                  <div className="text-[11px] text-[#6e7681] truncate">{site.link.replace(/^https?:\/\//, '')}</div>
                </div>
                <ExternalLink className="w-3 h-3 text-[#6e7681] group-hover:text-[#8b949e] flex-shrink-0 transition-colors" />
              </a>
            ))}
          </div>
        </>
      )}

      {isEmpty && (
        <div className="p-10 text-center space-y-2">
          <div className="text-5xl">🧇</div>
          <p className="text-sm font-medium text-[#8b949e]">Your waffle is empty</p>
          <p className="text-xs text-[#6e7681]">Add apps & websites to get started</p>
        </div>
      )}

      {(apps.length > 0 || websites.length > 0) && (
        <div className="flex border-t border-[#21262d]">
          {apps.length > 0 && (
            <button className="flex-1 py-2 text-[10px] font-medium text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#161b22] transition-colors flex items-center justify-center gap-1">
              <Package className="w-3 h-3" />All Apps →
            </button>
          )}
          {apps.length > 0 && websites.length > 0 && <div className="w-px bg-[#21262d]" />}
          {websites.length > 0 && (
            <button className="flex-1 py-2 text-[10px] font-medium text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#161b22] transition-colors flex items-center justify-center gap-1">
              <Globe className="w-3 h-3" />All Sites →
            </button>
          )}
        </div>
      )}
    </div>
  )
}
