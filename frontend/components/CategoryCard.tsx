import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Category } from '@/lib/tools-data'

export default function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/category/${category.slug}`} className="block group">
      <div className="glow-border rounded-xl p-5 bg-[#0F0A1E] hover:bg-purple-950/20 transition-all duration-300 group-hover:-translate-y-1">
        <div className="flex items-start justify-between mb-3">
          <span className="text-3xl">{category.emoji}</span>
          <span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-1 rounded-full">
            {category.count}+ tools
          </span>
        </div>
        <h3 className="font-bold text-white text-sm mb-1 group-hover:text-purple-300 transition-colors">
          {category.name}
        </h3>
        <p className="text-slate-500 text-xs leading-relaxed">
          {category.description}
        </p>
        <div className="flex items-center gap-1 mt-3 text-purple-500 text-xs font-medium group-hover:text-purple-300 transition-colors">
          Browse <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  )
}
