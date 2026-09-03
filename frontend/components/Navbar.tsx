'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Search, BarChart3 } from 'lucide-react'

const navLinks = [
  { label: 'All Tools',   href: '/tools' },
  { label: 'Categories',  href: '/tools#categories' },
  { label: 'Compare',     href: '/compare' },
  { label: 'Pricing',     href: '/pricing' },
  { label: 'Blog',        href: '/blog' },
  { label: 'Contact',     href: '/contact' },
]

// Inline A+bolt SVG logo
function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="url(#ng)"/>
      <path d="M7 30 L13 10 H19 L25 30 H21 L19.5 25.5 H12.5 L11 30 H7Z M13.5 22.5 H18.5 L16 15 L13.5 22.5Z" fill="white" fillOpacity="0.95"/>
      <path d="M23 8 L17 20 H21 L16 32 L27 17.5 H22.5 L27 8 Z" fill="white"/>
      <defs>
        <linearGradient id="ng" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C3AED"/>
          <stop offset="100%" stopColor="#5B21B6"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function Navbar() {
  const [open, setOpen]             = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery]           = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) window.location.href = `/tools?search=${encodeURIComponent(query.trim())}`
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-purple-900/30 backdrop-blur-xl bg-[#08051A]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="group-hover:scale-105 transition-transform duration-200">
            <LogoMark size={32} />
          </div>
          <span className="text-xl font-extrabold text-white tracking-tight">
            apka<span className="text-purple-400">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                link.label === 'Compare'
                  ? 'text-purple-300 hover:text-white hover:bg-purple-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-purple-900/20'
              }`}
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
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search AI tools (e.g. ChatGPT, Midjourney, Cursor...)"
                className="w-full bg-purple-950/40 border border-purple-800/40 rounded-lg pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                autoFocus
              />
            </div>
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
          <div className="pt-3 border-t border-purple-900/30">
            <Link
              href="/tools"
              onClick={() => setOpen(false)}
              className="btn-primary text-center block text-white text-sm font-semibold px-4 py-2.5 rounded-lg"
            >
              Explore Tools
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
