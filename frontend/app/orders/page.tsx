'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ShoppingBag, Package, ChevronDown, ChevronUp, ExternalLink,
  ArrowLeft, RefreshCw, Clock, CheckCircle, XCircle, AlertCircle,
  Zap, RotateCcw, Receipt
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface OrderItem {
  id: string
  tool_id: string
  tool_name: string
  tool_slug: string
  tool_logo: string
  tool_category: string
  plan_name: string
  plan_price: string
  plan_monthly: number
  billing_cycle: string
  quantity: number
}

interface Order {
  order_id: string
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled' | 'refunded'
  subtotal: number
  discount: number
  tax: number
  total: number
  coupon_code: string | null
  payment_method: string
  created_at: string
  items: OrderItem[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('apkaai_token') || sessionStorage.getItem('apkaai_token')
}

function getUser() {
  if (typeof window === 'undefined') return null
  try {
    const u = localStorage.getItem('apkaai_user') || sessionStorage.getItem('apkaai_user')
    return u ? JSON.parse(u) : null
  } catch { return null }
}

function fmt(n: number) {
  return `₹${Number(n).toLocaleString('en-IN')}`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<Order['status'], { label: string; color: string; icon: React.ReactNode }> = {
  pending:    { label: 'Pending',    color: 'bg-yellow-900/30 text-yellow-400 border-yellow-700/40',  icon: <Clock className="w-3 h-3" /> },
  confirmed:  { label: 'Confirmed',  color: 'bg-blue-900/30 text-blue-400 border-blue-700/40',        icon: <CheckCircle className="w-3 h-3" /> },
  processing: { label: 'Processing', color: 'bg-purple-900/30 text-purple-400 border-purple-700/40',  icon: <RefreshCw className="w-3 h-3" /> },
  completed:  { label: 'Completed',  color: 'bg-emerald-900/30 text-emerald-400 border-emerald-700/40', icon: <CheckCircle className="w-3 h-3" /> },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-900/30 text-red-400 border-red-700/40',           icon: <XCircle className="w-3 h-3" /> },
  refunded:   { label: 'Refunded',   color: 'bg-slate-700/30 text-slate-400 border-slate-600/40',     icon: <RotateCcw className="w-3 h-3" /> },
}

function StatusBadge({ status }: { status: Order['status'] }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

// ─── Single order card ────────────────────────────────────────────────────────
function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending

  return (
    <div className="rounded-2xl bg-[#0F0A1E] border border-purple-900/40 hover:border-purple-700/50 transition-all overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
      >
        <div className="flex items-center gap-4 min-w-0">
          {/* Icon */}
          <div className="w-11 h-11 rounded-xl bg-purple-900/40 border border-purple-700/30 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-purple-400" />
          </div>

          <div className="min-w-0">
            {/* Order ID */}
            <p className="text-white font-bold text-sm">
              Order <span className="text-purple-300 font-mono">#{order.order_id.slice(0, 8).toUpperCase()}</span>
            </p>
            <p className="text-slate-500 text-xs mt-0.5">{fmtDate(order.created_at)}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-purple-300 font-extrabold">{fmt(order.total)}</p>
            <p className="text-slate-500 text-xs">{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</p>
          </div>
          <StatusBadge status={order.status} />
          {expanded
            ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
            : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-purple-900/30 px-5 pb-5">
          {/* Items list */}
          <div className="space-y-3 mt-4">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-purple-950/20 border border-purple-900/20">
                <span className="text-2xl flex-shrink-0">{item.tool_logo}</span>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/tools/${item.tool_slug}`}
                    className="text-white font-semibold text-sm hover:text-purple-300 transition-colors flex items-center gap-1"
                  >
                    {item.tool_name}
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </Link>
                  <p className="text-slate-400 text-xs mt-0.5 capitalize">
                    {item.plan_name} Plan · {item.billing_cycle} billing
                  </p>
                </div>
                <p className="text-purple-300 font-bold text-sm flex-shrink-0">{item.plan_price}</p>
              </div>
            ))}
          </div>

          {/* Price breakdown */}
          <div className="mt-4 pt-4 border-t border-purple-900/20 space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="text-white">{fmt(order.subtotal)}</span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount {order.coupon_code && <span className="text-xs font-mono bg-emerald-900/30 px-1.5 py-0.5 rounded ml-1">{order.coupon_code}</span>}</span>
                <span>−{fmt(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>GST (18%)</span>
              <span className="text-white">{fmt(order.tax)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-white border-t border-purple-900/30 pt-2 mt-1 text-base">
              <span>Total Paid</span>
              <span className="text-purple-300">{fmt(order.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders]   = useState<Order[]>([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const user = typeof window !== 'undefined' ? getUser() : null
  const LIMIT = 10

  const fetchOrders = useCallback(async (p = 1) => {
    setLoading(true)
    setError('')
    try {
      const token = getToken()
      const res = await fetch(`${API}/orders/my?page=${p}&limit=${LIMIT}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401) { router.replace('/signin'); return }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load orders')
      setOrders(data.orders || [])
      setTotal(data.total || 0)
      setPage(p)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
    setLoading(false)
  }, [router])

  useEffect(() => {
    const u = getUser()
    if (!u) { router.replace('/signin'); return }
    fetchOrders(1)
  }, [router, fetchOrders])

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <Link href="/profile" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Profile
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-purple-400" />
            <div>
              <h1 className="text-3xl font-extrabold text-white">Order History</h1>
              {total > 0 && (
                <p className="text-slate-400 text-sm mt-0.5">{total} {total === 1 ? 'order' : 'orders'} placed</p>
              )}
            </div>
          </div>
          <button
            onClick={() => fetchOrders(page)}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white border border-purple-800/40 hover:border-purple-600 px-3 py-2 rounded-lg transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-900/20 border border-red-700/40 text-red-400 mb-6 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 rounded-2xl bg-purple-900/10 border border-purple-900/30 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-24">
            <div className="w-24 h-24 rounded-3xl bg-purple-900/20 border border-purple-800/30 flex items-center justify-center mx-auto mb-6">
              <Receipt className="w-10 h-10 text-purple-400/50" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No orders yet</h2>
            <p className="text-slate-400 max-w-sm mx-auto mb-8">
              Browse our 70+ AI tools, add them to your cart and place your first order.
            </p>
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 btn-primary text-white font-bold px-8 py-3.5 rounded-xl"
            >
              <Zap className="w-4 h-4" /> Explore AI Tools
            </Link>
          </div>
        )}

        {/* Orders list */}
        {!loading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map(order => (
              <OrderCard key={order.order_id} order={order} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => fetchOrders(page - 1)}
              disabled={page === 1 || loading}
              className="px-4 py-2 rounded-lg border border-purple-800/40 text-slate-400 hover:text-white hover:border-purple-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
            >
              Previous
            </button>
            <span className="text-slate-400 text-sm px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => fetchOrders(page + 1)}
              disabled={page === totalPages || loading}
              className="px-4 py-2 rounded-lg border border-purple-800/40 text-slate-400 hover:text-white hover:border-purple-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
