'use client'
import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import ToolCard from '@/components/ToolCard'
import CategoryCard from '@/components/CategoryCard'
import { tools, categories } from '@/lib/tools-data'

const PRICING_FILTERS = ['All', 'Free', 'Freemium', 'Paid', 'Free Trial']
const SORT_OPTIONS = [
  { label: 'Most Popular', value: 'popular' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Newest First', value: 'new' },
  { label: 'Name A–Z', value: 'name' },
]

export default function ToolsPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activePricing, setActivePricing] = useState('All')
  const [sortBy, setSortBy] = useState('popular')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    let result = [...tools]

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        t =>
          t.name.toLowerCase().includes(q) ||
          t.tagline.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some(tag => tag.toLowerCase().includes(q))
      )
    }

    // Category
    if (activeCategory !== 'all') {
      result = result.filter(t => t.categorySlug === activeCategory)
    }

    // Pricing
    if (activePricing !== 'All') {
      result = result.filter(t => t.pricing === activePricing)
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'new':
        result.sort((a, b) => (b.new ? 1 : 0) - (a.new ? 1 : 0))
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      default: // popular
        result.sort((a, b) => b.reviews - a.reviews)
    }

    return result
  }, [search, activeCategory, activePricing, sortBy])

  const activeCount = (activeCategory !== 'all' ? 1 : 0) + (activePricing !== 'All' ? 1 : 0)

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            All AI Tools
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Discover 100+ AI tools across 15 categories. Find the perfect AI for your workflow.
          </p>
        </div>

        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tools, categories, features..."
              className="w-full bg-[#0F0A1E] border border-purple-800/40 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="appearance-none bg-[#0F0A1E] border border-purple-800/40 rounded-xl pl-4 pr-10 py-3.5 text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3.5 rounded-xl text-sm font-medium border transition-all ${
              showFilters || activeCount > 0
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-[#0F0A1E] border-purple-800/40 text-slate-300 hover:border-purple-600'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeCount > 0 && (
              <span className="w-5 h-5 bg-white text-purple-700 rounded-full text-xs font-bold flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="bg-[#0F0A1E] border border-purple-800/30 rounded-xl p-5 mb-6 space-y-5">
            {/* Pricing filter */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Pricing</p>
              <div className="flex flex-wrap gap-2">
                {PRICING_FILTERS.map(p => (
                  <button
                    key={p}
                    onClick={() => setActivePricing(p)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                      activePricing === p
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-purple-950/30 border-purple-800/40 text-slate-300 hover:border-purple-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear */}
            {activeCount > 0 && (
              <button
                onClick={() => { setActiveCategory('all'); setActivePricing('All') }}
                className="text-xs text-purple-400 hover:text-purple-300 underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              activeCategory === 'all'
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-[#0F0A1E] border-purple-800/40 text-slate-300 hover:border-purple-600'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                activeCategory === cat.slug
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-[#0F0A1E] border-purple-800/40 text-slate-300 hover:border-purple-600'
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-slate-400 text-sm">
            Showing <span className="text-white font-semibold">{filtered.length}</span> tools
            {search && <span> for &quot;<span className="text-purple-400">{search}</span>&quot;</span>}
          </p>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(tool => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="text-xl font-bold text-white mb-2">No tools found</h3>
            <p className="text-slate-400 mb-6">Try a different search term or clear your filters</p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('all'); setActivePricing('All') }}
              className="btn-primary text-white font-semibold px-6 py-2.5 rounded-lg text-sm"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* All Categories Section */}
        {activeCategory === 'all' && !search && (
          <section className="mt-20">
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-white mb-2">Browse by Category</h2>
              <p className="text-slate-400 text-sm">All 15 AI tool categories</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {categories.map(cat => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
