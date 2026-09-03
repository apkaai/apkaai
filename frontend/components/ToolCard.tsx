import Link from 'next/link'
import { Star, ArrowRight } from 'lucide-react'
import type { AITool } from '@/lib/tools-data'

interface ToolCardProps {
  tool: AITool
  compact?: boolean
}

// Keep original label — Freemium stays as Freemium
function pricingLabel(p: string) {
  return p
}

function pricingClass(p: string) {
  switch (p) {
    case 'Free':       return 'bg-emerald-900/40 text-emerald-400'
    case 'Free Trial': return 'bg-teal-900/40 text-teal-400'
    case 'Paid':       return 'bg-amber-900/40 text-amber-400'
    default:           return 'bg-blue-900/40 text-blue-400'  // Freemium/Premium
  }
}

export default function ToolCard({ tool, compact = false }: ToolCardProps) {
  return (
    <Link href={`/tools/${tool.slug}`} className="block group">
      <div className="ai-card glow-border rounded-xl p-5 h-full relative overflow-hidden">
        {/* Badge */}
        {tool.badge && (
          <span className="badge-new absolute top-4 right-4 text-white z-10">{tool.badge}</span>
        )}
        {tool.new && !tool.badge && (
          <span className="badge-new absolute top-4 right-4 text-white bg-gradient-to-r from-emerald-600 to-teal-600 z-10">New</span>
        )}

        <div className="absolute inset-0 bg-glow-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-purple-900/40 border border-purple-700/30 flex items-center justify-center text-2xl flex-shrink-0 group-hover:border-purple-500/50 transition-colors">
              {tool.logo}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors truncate">
                {tool.name}
              </h3>
              <p className="text-slate-400 text-xs truncate mt-0.5">{tool.tagline}</p>
            </div>
          </div>

          {/* Description */}
          {!compact && (
            <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">
              {tool.description}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tool.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-md bg-purple-900/40 border border-purple-800/40 text-xs text-purple-300">
                {tag}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-purple-900/30">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-sm font-semibold text-white">{tool.rating}</span>
              <span className="text-xs text-slate-500">({tool.reviews.toLocaleString()})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2 py-1 rounded-md ${pricingClass(tool.pricing)}`}>
                {pricingLabel(tool.pricing)}
              </span>
              <ArrowRight className="w-4 h-4 text-purple-500 group-hover:text-purple-300 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
