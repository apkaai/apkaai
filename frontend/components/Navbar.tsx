'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Search, Zap } from 'lucide-react'

const navLinks = [
  { label: 'All Tools', href: '/tools' },
  { label: 'Categories', href: '/tools#categories' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-purple-900/30 backdrop-blur-xl bg-[#08051A]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-all">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="text-xl font-bold text-white">
            apka<span className="text-purple-400">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-slate-400 hover:text-white transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
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
            className="md:hidden p-2 text-slate-400 hover:text-white"
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
          <input
            type="search"
            placeholder="Search AI tools (e.g. ChatGPT, Midjourney, Cursor...)"
            className="w-full bg-purple-950/40 border border-purple-800/40 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            autoFocus
          />
        </div>
      )}

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-purple-900/30 bg-[#0F0A1E] px-4 py-4 space-y-2">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-slate-300 hover:text-white hover:bg-purple-900/30 rounded-lg transition-colors text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/tools"
            onClick={() => setOpen(false)}
            className="block btn-primary text-center text-white text-sm font-semibold px-4 py-2.5 rounded-lg mt-3"
          >
            Explore Tools
          </Link>
        </div>
      )}
    </header>
  )
}
