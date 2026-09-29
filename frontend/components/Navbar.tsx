'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Menu, X, Search, BarChart3, User, LogOut, Settings, ChevronDown, Cloud, ShoppingCart, ShoppingBag, Heart, Star, LayoutDashboard, Gift } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import HoverPreview from '@/components/HoverPreview'
import { useCart } from '@/lib/cart-context'
import { tools } from '@/lib/tools-data'

const navLinks = [
  { label: 'All Tools',  href: '/tools' },
  { label: 'Categories', href: '/tools#categories' },
  { label: 'Compare',    href: '/compare' },
  { label: 'Pricing',    href: '/pricing' },
  { label: 'Plans',      href: '/plans' },
  { label: 'Blog',       href: '/blog' },
  { label: 'Contact',    href: '/contact' },
  { label: 'Cloud',      href: '/cloud' },
]

// ── Search suggestions ─────────────────────────────────────────────────────────
interface Suggestion {
  slug: string
  name: string
  logo: string
  category: string
  rating: number
  pricing: string
}

function getSearchSuggestions(q: string): Suggestion[] {
  if (!q || q.trim().length < 1) return []
  const lower = q.toLowerCase().trim()
  return tools
    .filter(t =>
      t.name.toLowerCase().includes(lower) ||
      t.tagline.toLowerCase().includes(lower) ||
      t.tags.some(tag => tag.toLowerCase().includes(lower)) ||
      t.category.toLowerCase().includes(lower)
    )
    .slice(0, 6)
    .map(t => ({
      slug:     t.slug,
      name:     t.name,
      logo:     t.logo,
      category: t.category,
      rating:   t.rating,
      pricing:  t.pricing,
    }))
}

// ── Auth helpers ───────────────────────────────────────────────────────────────
function getUser() {
  if (typeof window === 'undefined') return null
  try {
    const u = localStorage.getItem('apkaai_user') || sessionStorage.getItem('apkaai_user')
    return u ? JSON.parse(u) : null
  } catch { return null }
}

function signOut() {
  localStorage.removeItem('apkaai_token')
  localStorage.removeItem('apkaai_user')
  sessionStorage.removeItem('apkaai_token')
  sessionStorage.removeItem('apkaai_user')
  window.location.href = '/'
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function Navbar() {
  const router                      = useRouter()
  const [open, setOpen]             = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery]           = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [suggestionIdx, setSuggestionIdx] = useState(-1)
  const [user, setUser]             = useState<{ name: string; email: string; role?: string } | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const searchInputRef              = useRef<HTMLInputElement>(null)
  const profileRef                  = useRef<HTMLDivElement>(null)
  const suggestionsRef              = useRef<HTMLDivElement>(null)
  const debounceRef                 = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { itemCount, toggleDrawer } = useCart()

  // Load user from storage on mount
  useEffect(() => {
    setUser(getUser())
    const handler = () => setUser(getUser())
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
          searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
        setSuggestions([])
        setSuggestionIdx(-1)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus()
  }, [searchOpen])

  // Debounced suggestions
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value)
    setSuggestionIdx(-1)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSuggestions(getSearchSuggestions(value))
    }, 150)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setSuggestions([])
    setSearchOpen(false)
    setQuery('')
    router.push(`/tools?search=${encodeURIComponent(q)}`)
  }

  const handleSuggestionClick = (slug: string) => {
    setSuggestions([])
    setSearchOpen(false)
    setQuery('')
    router.push(`/tools/${slug}`)
  }

  // Keyboard navigation for suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSuggestionIdx(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSuggestionIdx(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && suggestionIdx >= 0) {
      e.preventDefault()
      handleSuggestionClick(suggestions[suggestionIdx].slug)
    } else if (e.key === 'Escape') {
      setSuggestions([])
      setSuggestionIdx(-1)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-purple-900/30 backdrop-blur-xl bg-[#08051A]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="group-hover:scale-105 transition-transform duration-200">
            <Image src="/apkaai-logo.png" alt="ApkaAI Logo" width={34} height={34} priority className="rounded-lg" />
          </div>
          <span className="text-xl font-extrabold text-white tracking-tight">
            apka<span className="text-purple-400">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(link => (
            <HoverPreview
              key={link.href}
              label={
                link.label === 'All Tools'  ? 'View all 43 AI tools' :
                link.label === 'Categories' ? 'Browse tools by category' :
                link.label === 'Compare'    ? 'Compare AI tools side by side' :
                link.label === 'Pricing'    ? 'See pricing plans in INR' :
                link.label === 'Blog'       ? 'Read AI tips and guides' :
                link.label === 'Contact'    ? 'Get in touch with us' :
                link.label === 'Cloud'      ? 'Compare cloud costs & calculate bills' :
                link.label
              }
            >
              <Link key={link.href} href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  link.label === 'Compare' ? 'text-purple-300 hover:text-white hover:bg-purple-900/30' :
                  link.label === 'Cloud'   ? 'text-sky-300 hover:text-white hover:bg-sky-900/20' :
                  'text-slate-400 hover:text-white hover:bg-purple-900/20'
                }`}>
                {link.label === 'Compare' && <BarChart3 className="w-3.5 h-3.5" />}
                {link.label === 'Cloud'   && <Cloud className="w-3.5 h-3.5" />}
                {link.label}
              </Link>
            </HoverPreview>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <HoverPreview label="Search across all 43 AI tools" icon={<Search className="w-3.5 h-3.5" />}>
            <button onClick={() => setSearchOpen(p => !p)} aria-label="Search"
              className={`p-2 rounded-lg transition-all ${searchOpen ? 'text-white bg-purple-700/40' : 'text-slate-400 hover:text-white hover:bg-purple-900/30'}`}>
              {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>
          </HoverPreview>

          {/* Cart */}
          <HoverPreview label="View your cart">
            <button
              onClick={toggleDrawer}
              aria-label={`Cart — ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
              className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-purple-900/30 transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-purple-600 text-white text-[10px] font-bold rounded-full px-1 leading-none shadow-glow-sm">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>
          </HoverPreview>

          {/* ── Signed IN — show user avatar + dropdown ── */}
          {user ? (
            <div className="relative hidden sm:block" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(p => !p)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-purple-700/40 hover:border-purple-500 bg-purple-950/20 hover:bg-purple-900/30 transition-all"
              >
                {/* Avatar circle with initials */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{getInitials(user.name)}</span>
                </div>
                <span className="text-white text-sm font-medium max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0F0A1E] border border-purple-800/40 rounded-2xl shadow-glow-md overflow-hidden z-50">
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-purple-900/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">{getInitials(user.name)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{user.name}</p>
                        <p className="text-slate-400 text-xs truncate">{user.email}</p>
                        {user.role === 'admin' && (
                          <span className="inline-block mt-0.5 text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded-full">Admin</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <Link href="/profile" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-purple-900/30 text-sm transition-colors">
                      <User className="w-4 h-4" /> My Profile
                    </Link>
                    <Link href="/dashboard" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-purple-900/30 text-sm transition-colors">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link href="/orders" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-purple-900/30 text-sm transition-colors">
                      <ShoppingBag className="w-4 h-4" /> Order History
                    </Link>
                    <Link href="/wishlist" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-purple-900/30 text-sm transition-colors">
                      <Heart className="w-4 h-4" /> My Wishlist
                    </Link>
                    <Link href="/referral" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-purple-900/30 text-sm transition-colors">
                      <Gift className="w-4 h-4" /> Refer & Earn
                    </Link>
                    {user.role === 'admin' && (
                      <Link href="/admin" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-purple-300 hover:text-white hover:bg-purple-900/30 text-sm transition-colors">
                        <Settings className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <button onClick={() => { setProfileOpen(false); signOut() }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 text-sm transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── NOT signed in — show Sign In / Sign Up ── */
            <>
              <HoverPreview label="Login to your ApkaAI account" icon={<User className="w-3.5 h-3.5" />}>
                <Link href="/signin"
                  className="hidden sm:inline-flex items-center gap-1.5 text-slate-300 hover:text-white text-sm font-medium px-3 py-2 rounded-lg border border-purple-700/40 hover:border-purple-500 hover:bg-purple-900/20 transition-all">
                  <User className="w-3.5 h-3.5" />
                  Login as User
                </Link>
              </HoverPreview>
              <HoverPreview label="Login to the Admin Panel" icon={<Settings className="w-3.5 h-3.5" />}>
                <Link href="/admin/login"
                  className="hidden sm:inline-flex items-center gap-1.5 btn-primary text-white text-sm font-semibold px-4 py-2 rounded-lg">
                  <Settings className="w-3.5 h-3.5" />
                  Login as Admin
                </Link>
              </HoverPreview>
            </>
          )}

          <button className="lg:hidden p-2 text-slate-400 hover:text-white" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <ThemeToggle />
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="border-t border-purple-900/30 bg-[#0D0826] px-4 py-3 shadow-lg">
          <div className="max-w-2xl mx-auto relative">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={query}
                  onChange={e => handleQueryChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search AI tools (e.g. ChatGPT, Midjourney, Cursor...)"
                  autoComplete="off"
                  className="w-full bg-purple-950/50 border border-purple-700/50 rounded-xl pl-11 pr-24 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary text-white text-xs font-bold px-4 py-1.5 rounded-lg">
                  Search
                </button>
              </div>
            </form>

            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-1 bg-[#0F0A1E] border border-purple-800/50 rounded-xl shadow-2xl overflow-hidden z-50"
              >
                {suggestions.map((s, i) => (
                  <button
                    key={s.slug}
                    onClick={() => handleSuggestionClick(s.slug)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-purple-900/20 last:border-0 ${
                      i === suggestionIdx ? 'bg-purple-900/40' : 'hover:bg-purple-900/20'
                    }`}
                  >
                    <span className="text-xl flex-shrink-0">{s.logo}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{s.name}</p>
                      <p className="text-slate-500 text-xs truncate">{s.category}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs text-slate-400">{s.rating}</span>
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${
                        s.pricing === 'Free' ? 'bg-emerald-900/40 text-emerald-400' :
                        s.pricing === 'Paid' ? 'bg-amber-900/40 text-amber-400' :
                        'bg-blue-900/40 text-blue-400'
                      }`}>
                        {s.pricing === 'Freemium' ? 'Premium' : s.pricing}
                      </span>
                    </div>
                  </button>
                ))}
                {/* "See all results" footer */}
                <button
                  onClick={() => { router.push(`/tools?search=${encodeURIComponent(query.trim())}`); setSuggestions([]); setSearchOpen(false); setQuery('') }}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-purple-400 hover:text-purple-300 text-xs font-semibold transition-colors bg-purple-950/30 hover:bg-purple-950/50"
                >
                  <Search className="w-3.5 h-3.5" />
                  See all results for &ldquo;{query}&rdquo;
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-purple-900/30 bg-[#0F0A1E] px-4 py-4 space-y-1">
          {user && (
            <div className="flex items-center gap-3 px-3 py-3 mb-2 border-b border-purple-900/30">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">{getInitials(user.name)}</span>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{user.name}</p>
                <p className="text-slate-500 text-xs">{user.email}</p>
              </div>
            </div>
          )}
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-purple-900/30 rounded-lg text-sm font-medium">
              {link.label === 'Compare' && <BarChart3 className="w-4 h-4 text-purple-400" />}
              {link.label === 'Cloud'   && <Cloud className="w-4 h-4 text-sky-400" />}
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-purple-900/30 grid grid-cols-2 gap-2">
            {/* Cart link in mobile menu */}
            <Link href="/cart" onClick={() => setOpen(false)}
              className="col-span-2 flex items-center justify-center gap-2 border border-purple-700/40 text-slate-300 hover:text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:border-purple-500 transition-all">
              <ShoppingCart className="w-4 h-4" />
              Cart{itemCount > 0 && <span className="ml-1 bg-purple-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{itemCount}</span>}
            </Link>
            {user ? (
              <>
                <Link href="/profile" onClick={() => setOpen(false)}
                  className="text-center border border-purple-700/40 text-slate-300 text-sm font-semibold px-4 py-2.5 rounded-lg hover:border-purple-500 transition-all">
                  My Profile
                </Link>
                <Link href="/orders" onClick={() => setOpen(false)}
                  className="text-center border border-purple-700/40 text-slate-300 text-sm font-semibold px-4 py-2.5 rounded-lg hover:border-purple-500 transition-all flex items-center justify-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5" /> Orders
                </Link>
                <button onClick={() => { setOpen(false); signOut() }}
                  className="text-center bg-red-900/30 border border-red-700/40 text-red-300 text-sm font-semibold px-4 py-2.5 rounded-lg col-span-2">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/signin" onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-1.5 border border-purple-700/40 text-slate-300 text-sm font-semibold px-4 py-2.5 rounded-lg hover:border-purple-500 transition-all">
                  <User className="w-3.5 h-3.5" />
                  Login as User
                </Link>
                <Link href="/admin/login" onClick={() => setOpen(false)}
                  className="btn-primary flex items-center justify-center gap-1.5 text-white text-sm font-semibold px-4 py-2.5 rounded-lg">
                  <Settings className="w-3.5 h-3.5" />
                  Login as Admin
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
