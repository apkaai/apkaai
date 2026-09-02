'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Search, Zap, BarChart3 } from 'lucide-react'

const navLinks = [
  { label: 'All Tools', href: '/tools' },
  { label: 'Categories', href: '/tools#categories' },
  { label: 'Compare', href: '/compare' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      window.location.href = `/tools?search=${encodeURIComponent(query.trim())}`
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-purple-900/30 backdrop-blur-xl bg-[#08051A]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-all">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="text-xl font-bold text-white">
            apka<span className="text-purple-400">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-purple-900/20 rounded-lg transition-all font-medium"
            >
              {link.label === 'Compare' && <BarChart3 className="w-3.5 h-3.5" />}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-purple-900/30"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>
          <Link
            href="/compare"
            className="hidden sm:inline-flex items-center gap-1.5 border border-purple-700/40 hover:border-purple-500 text-purple-300 hover:text-white text-sm font-semibold px-3 py-2 rounded-lg transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            Compare
          </Link>
          <Link
            href="/tools"
            className="hidden sm:inline-flex btn-primary text-white text-sm font-semibold px-4 py-2 rounded-lg"
          >
            Explore Tools
          </Link>
          <button
            className="lg:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {searchOpen && (
        <div className="border-t border-purple-900/30 bg-[#0F0A1E] px-4 py-3">
          <form onSubmit={handleSearch}>
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search AI tools (e.g. ChatGPT, Midjourney, Cursor...)"
              className="w-full bg-purple-950/40 border border-purple-800/40 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              autoFocus
            />
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden border-t border-purple-900/30 bg-[#0F0A1E] px-4 py-4 space-y-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-purple-900/30 rounded-lg transition-colors text-sm font-medium"
            >
              {link.label === 'Compare' && <BarChart3 className="w-4 h-4 text-purple-400" />}
              {link.label}
            </Link>
          ))}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-purple-900/30">
            <Link href="/compare" onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 border border-purple-700/40 text-purple-300 text-sm font-semibold px-4 py-2.5 rounded-lg">
              <BarChart3 className="w-4 h-4" /> Compare
            </Link>
            <Link href="/tools" onClick={() => setOpen(false)}
              className="btn-primary text-center text-white text-sm font-semibold px-4 py-2.5 rounded-lg">
              Explore Tools
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
