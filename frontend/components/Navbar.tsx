'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, Search, BarChart3 } from 'lucide-react'

const navLinks = [
  { label: 'All Tools',  href: '/tools' },
  { label: 'Categories', href: '/tools#categories' },
  { label: 'Compare',    href: '/compare' },
  { label: 'Pricing',    href: '/pricing' },
  { label: 'Blog',       href: '/blog' },
  { label: 'Contact',    href: '/contact' },
]

/*
 * Logo — pixel-faithful reproduction of the provided image:
 *
 *  • Vivid purple square, heavily rounded corners
 *  • Large sans-serif white A (no serifs, open bottom, crossbar mid-height)
 *  • White lightning bolt INSIDE the triangle of the A,
 *    centered in the open space, does not exit the letter shape
 *  • Bolt: top-right → bottom-left direction, narrow head, wide body
 */
function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="ApkaAI logo"
    >
      {/* Vivid purple background with large radius matching the image */}
      <rect width="100" height="100" rx="24" fill="#7B2FBE" />
      <rect width="100" height="100" rx="24" fill="url(#logoGrad)" />

      {/*
        ── Letter A ─────────────────────────────────────────────────────
        Clean sans-serif: left leg, right leg, crossbar, open at bottom.
        Coordinates tuned so the inner triangle is visible and spacious
        so the bolt has room.
      */}
      <path
        d="
          M18 84
          L42 16
          H58
          L82 84
          H68
          L63 70
          H37
          L32 84
          Z

          M41 58
          H59
          L50 30
          Z
        "
        fill="white"
        fillRule="evenodd"
      />

      {/*
        ── Lightning bolt ────────────────────────────────────────────────
        Lives INSIDE the A triangle (between apex y=30 and crossbar y=58).
        Tilted top-right → bottom-left, compact, clearly readable.
        Upper point: (58, 32)  Lower point: (42, 56)
      */}
      <path
        d="
          M57 32
          L47 46
          H53
          L43 60
          L61 44
          H55
          Z
        "
        fill="white"
      />

      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#8B35D6" />
          <stop offset="100%" stopColor="#6B21A8" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function Navbar() {
  const router                      = useRouter()
  const [open, setOpen]             = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery]           = useState('')
  const searchInputRef              = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setSearchOpen(false)
    setQuery('')
    router.push(`/tools?search=${encodeURIComponent(q)}`)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-purple-900/30 backdrop-blur-xl bg-[#08051A]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="group-hover:scale-105 transition-transform duration-200">
            <LogoMark size={34} />
          </div>
          <span className="text-xl font-extrabold text-white tracking-tight">
            apka<span className="text-purple-400">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                link.label === 'Compare'
                  ? 'text-purple-300 hover:text-white hover:bg-purple-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-purple-900/20'
              }`}>
              {link.label === 'Compare' && <BarChart3 className="w-3.5 h-3.5" />}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(prev => !prev)}
            aria-label="Search AI tools"
            className={`p-2 rounded-lg transition-all ${
              searchOpen ? 'text-white bg-purple-700/40' : 'text-slate-400 hover:text-white hover:bg-purple-900/30'
            }`}
          >
            {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>

          <Link href="/tools" className="hidden sm:inline-flex btn-primary text-white text-sm font-semibold px-4 py-2 rounded-lg">
            Explore Tools
          </Link>

          <button className="lg:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setOpen(!open)} aria-label="Open menu">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {searchOpen && (
        <div className="border-t border-purple-900/30 bg-[#0D0826] px-4 py-3 shadow-lg">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search AI tools (e.g. ChatGPT, Midjourney, Cursor...)"
                className="w-full bg-purple-950/50 border border-purple-700/50 rounded-xl pl-11 pr-24 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
              />
              <button type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary text-white text-xs font-bold px-4 py-1.5 rounded-lg">
                Search
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden border-t border-purple-900/30 bg-[#0F0A1E] px-4 py-4 space-y-1">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-purple-900/30 rounded-lg transition-colors text-sm font-medium">
              {link.label === 'Compare' && <BarChart3 className="w-4 h-4 text-purple-400" />}
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-purple-900/30">
            <Link href="/tools" onClick={() => setOpen(false)}
              className="btn-primary block text-center text-white text-sm font-semibold px-4 py-2.5 rounded-lg">
              Explore Tools
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
