'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ShoppingCart, ArrowRight, Trash2, RotateCcw, ArrowLeft,
  Tag, Shield, Zap, Check, Info, PackageCheck, Share2,
  Minus, Plus, ChevronRight, Clock
} from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import PlanModal from '@/components/cart/PlanModal'
import PaymentModal from '@/components/payment/PaymentModal'
import type { CartItem } from '@/lib/cart-context'
import { tools } from '@/lib/tools-data'

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('apkaai_token') || sessionStorage.getItem('apkaai_token')
}

// ── Toast ─────────────────────────────────────────────────────────────────────
interface Toast { id: number; message: string; type: 'success' | 'info' }
let tid = 0
function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const show = (message: string, type: Toast['type'] = 'success') => {
    const id = ++tid
    setToasts(p => [...p, { id, message, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000)
  }
  return { toasts, show }
}

// ── Quantity Stepper (- qty +) ────────────────────────────────────────────────
function QtyButton({
  item,
  onIncrement,
  onDecrement,
}: {
  item: CartItem
  onIncrement: () => void
  onDecrement: () => void
}) {
  return (
    <div className="flex items-center gap-0 rounded-xl overflow-hidden border border-purple-600/60 bg-purple-600/20 flex-shrink-0">
      <button
        onClick={onDecrement}
        className="w-8 h-8 flex items-center justify-center text-purple-300 hover:bg-purple-600/40 transition-colors"
        aria-label="Decrease quantity"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="w-8 text-center text-white font-bold text-sm">{item.quantity}</span>
      <button
        onClick={onIncrement}
        className="w-8 h-8 flex items-center justify-center text-purple-300 hover:bg-purple-600/40 transition-colors"
        aria-label="Increase quantity"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ── Single cart item row ──────────────────────────────────────────────────────
function CartItemRow({
  item,
  onRemove,
  onChangePlan,
  onIncrement,
  onDecrement,
}: {
  item: CartItem
  onRemove: (key: string, label: string) => void
  onChangePlan: (item: CartItem) => void
  onIncrement: (key: string) => void
  onDecrement: (key: string) => void
}) {
  const hasPlan = (tools.find(t => t.id === item.toolId)?.pricingPlans?.length ?? 0) > 1
  const lineTotal = item.planMonthly * item.quantity

  return (
    <div className="flex items-center gap-4 py-4 border-b border-purple-900/20 last:border-0">
      {/* Logo */}
      <div className="w-16 h-16 rounded-xl bg-purple-900/30 border border-purple-800/30 flex items-center justify-center text-3xl flex-shrink-0">
        {item.toolLogo}
      </div>

      {/* Middle */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/tools/${item.toolSlug}`}
          className="text-white font-semibold text-sm hover:text-purple-300 transition-colors line-clamp-1"
        >
          {item.toolName}
        </Link>
        <p className="text-slate-400 text-xs mt-0.5 capitalize">
          {item.planName} Plan · {item.billingCycle}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-purple-300 font-bold text-sm">
            ₹{lineTotal.toLocaleString('en-IN')}
          </span>
          {item.quantity > 1 && (
            <span className="text-slate-500 text-xs">
              (₹{item.planMonthly.toLocaleString('en-IN')} × {item.quantity})
            </span>
          )}
          {hasPlan && (
            <button
              onClick={() => onChangePlan(item)}
              className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Change
            </button>
          )}
        </div>
      </div>

      {/* Qty stepper */}
      <QtyButton
        item={item}
        onIncrement={() => onIncrement(item.key)}
        onDecrement={() => onDecrement(item.key)}
      />
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CartPageClient() {
  const router = useRouter()
  const {
    items, itemCount, subtotal,
    removeItem, clearCart,
    incrementItem, decrementItem,
  } = useCart()
  const { toasts, show: showToast } = useToast()
  const [changingItem, setChangingItem]     = useState<CartItem | null>(null)
  const [coupon, setCoupon]                 = useState('')
  const [couponApplied, setCouponApplied]   = useState(false)
  const [paymentOpen, setPaymentOpen]       = useState(false)
  const [orderPlaced, setOrderPlaced]       = useState<string | null>(null)

  // Bill calculations
  const discount     = couponApplied ? Math.round(subtotal * 0.1) : 0
  const tax          = Math.round((subtotal - discount) * 0.18)
  const handlingFee  = items.length > 0 ? 2 : 0
  const total        = subtotal - discount + tax + handlingFee
  const totalSavings = discount

  function handleRemove(key: string, label: string) {
    removeItem(key)
    showToast(`${label} removed from cart`)
  }

  function applyCoupon() {
    if (coupon.trim().toUpperCase() === 'APKAAI10') {
      setCouponApplied(true)
      showToast('Coupon applied — 10% off!', 'success')
    } else {
      showToast('Invalid coupon code', 'info')
    }
  }

  function handleCheckout() {
    const token = getToken()
    if (!token) {
      showToast('Please sign in to checkout', 'info')
      router.push('/signin')
      return
    }
    setPaymentOpen(true)
  }

  function handlePaymentSuccess(orderId: string) {
    setPaymentOpen(false)
    clearCart()
    setOrderPlaced(orderId)
  }

  async function handleShare() {
    const text = items
      .map(i => `${i.toolLogo} ${i.toolName} — ${i.planName} Plan (${i.planPrice})`)
      .join('\n')
    const shareText = `Check out my ApkaAI cart:\n\n${text}\n\nTotal: ₹${total.toLocaleString('en-IN')}\n\nhttps://apkaai.com/tools`

    if (navigator.share) {
      navigator.share({ title: 'My ApkaAI Cart', text: shareText }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(shareText)
      showToast('Cart copied to clipboard!', 'success')
    }
  }

  // ── Order success screen ───────────────────────────────────────────────────
  if (orderPlaced) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-4">
        <div className="max-w-md mx-auto text-center py-24">
          <div className="w-24 h-24 rounded-3xl bg-emerald-900/20 border border-emerald-700/30 flex items-center justify-center mx-auto mb-6">
            <PackageCheck className="w-12 h-12 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-3">Order Placed!</h2>
          <p className="text-slate-400 mb-2">Your order has been confirmed successfully.</p>
          <p className="text-purple-300 font-mono text-sm mb-8">
            Order ID: #{orderPlaced.slice(0, 8).toUpperCase()}
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/orders" className="inline-flex items-center gap-2 btn-primary text-white font-bold px-8 py-3.5 rounded-xl">
              View Order History <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/tools" className="inline-flex items-center gap-2 border border-purple-700/40 text-slate-300 hover:text-white font-semibold px-8 py-3.5 rounded-xl transition-all hover:border-purple-500">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-4">
        <div className="max-w-md mx-auto text-center py-24">
          <div className="w-24 h-24 rounded-3xl bg-purple-900/20 border border-purple-800/30 flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-10 h-10 text-purple-400/50" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Your cart is empty</h2>
          <p className="text-slate-400 max-w-md mx-auto mb-8">
            Explore our 100+ AI tools and add the ones you want to your cart.
          </p>
          <Link href="/tools" className="inline-flex items-center gap-2 btn-primary text-white font-bold px-8 py-3.5 rounded-xl shadow-glow-sm">
            <Zap className="w-4 h-4" /> Explore AI Tools
          </Link>
        </div>
      </div>
    )
  }

  // ── Filled cart ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#08051A] pt-16 pb-28">
      <div className="max-w-lg mx-auto px-4">

        {/* ── Header ── */}
        <div className="flex items-center justify-between py-4 sticky top-16 bg-[#08051A] z-10 border-b border-purple-900/20">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-1.5 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-white font-bold text-lg">My Cart</h1>
              <p className="text-slate-400 text-xs">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
            </div>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 text-sm font-semibold transition-colors border border-purple-700/40 hover:border-purple-500 px-3 py-1.5 rounded-lg"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        {/* ── Delivery estimate ── */}
        <div className="flex items-center gap-3 py-3 border-b border-purple-900/20">
          <div className="w-10 h-10 rounded-full bg-purple-900/30 border border-purple-700/30 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Instant Access</p>
            <p className="text-slate-400 text-xs">Subscription of {itemCount} {itemCount === 1 ? 'tool' : 'tools'}</p>
          </div>
        </div>

        {/* ── Items list ── */}
        <div className="py-2">
          {items.map(item => (
            <CartItemRow
              key={item.key}
              item={item}
              onRemove={handleRemove}
              onChangePlan={setChangingItem}
              onIncrement={incrementItem}
              onDecrement={decrementItem}
            />
          ))}
        </div>

        {/* ── Coupon ── */}
        <div className="py-4 border-t border-purple-900/20">
          {!couponApplied ? (
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Apply coupon code"
                value={coupon}
                onChange={e => setCoupon(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                onClick={applyCoupon}
                className="text-purple-400 hover:text-purple-300 text-sm font-bold transition-colors flex items-center gap-1"
              >
                Apply <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <Check className="w-4 h-4" />
              <span>Coupon <span className="font-mono font-bold">APKAAI10</span> applied — 10% off!</span>
              <button onClick={() => setCouponApplied(false)} className="ml-auto text-slate-500 hover:text-red-400 text-xs transition-colors">Remove</button>
            </div>
          )}
        </div>

        {/* ── Bill Details ── */}
        <div className="bg-[#0F0A1E] border border-purple-900/30 rounded-2xl p-5 my-4">
          <h2 className="text-white font-bold text-base mb-4">Bill details</h2>
          <div className="space-y-3 text-sm">
            {/* Items total */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span>Items total</span>
                {totalSavings > 0 && (
                  <span className="text-emerald-400 text-xs font-semibold">Saved ₹{totalSavings.toLocaleString('en-IN')}</span>
                )}
              </span>
              <div className="flex items-center gap-2">
                {totalSavings > 0 && (
                  <span className="text-slate-500 line-through text-xs">₹{subtotal.toLocaleString('en-IN')}</span>
                )}
                <span className="text-white font-semibold">₹{(subtotal - discount).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Handling charge */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                Handling charge
                <Info className="w-3 h-3 opacity-50" title="Platform processing fee" />
              </span>
              <span className="text-white">₹{handlingFee}</span>
            </div>

            {/* GST */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                GST (18%)
                <Info className="w-3 h-3 opacity-50" title="Tax on subscription services" />
              </span>
              <span className="text-white">₹{tax.toLocaleString('en-IN')}</span>
            </div>

            {/* Divider */}
            <div className="border-t border-purple-900/20 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-white font-bold flex items-center gap-1">
                  Grand total
                  <Info className="w-3 h-3 opacity-40" />
                </span>
                <span className="text-white font-extrabold text-base">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Savings banner */}
          {totalSavings > 0 && (
            <div className="mt-4 py-2.5 px-3 rounded-xl bg-emerald-900/20 border border-emerald-700/30 text-emerald-400 text-sm font-semibold text-center">
              Your total savings ₹{totalSavings.toLocaleString('en-IN')}
            </div>
          )}
        </div>

        {/* ── Cancellation Policy ── */}
        <div className="bg-[#0F0A1E] border border-purple-900/30 rounded-2xl p-5 mb-6">
          <h3 className="text-white font-bold text-sm mb-2">Cancellation Policy</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Orders can be cancelled within 24 hours of placement. After that, the subscription is activated and
            a refund may not be applicable. In case of unexpected delays, a full refund will be provided.
          </p>
        </div>

        {/* ── Trust badges ── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: <Shield className="w-4 h-4" />, label: 'Secure Checkout' },
            { icon: <Zap className="w-4 h-4" />,   label: 'Instant Access' },
            { icon: <Check className="w-4 h-4" />, label: 'Cancel Anytime' },
          ].map(b => (
            <div key={b.label} className="flex items-center gap-2 p-3 rounded-xl bg-purple-950/20 border border-purple-900/30 text-xs text-slate-400">
              <span className="text-purple-400">{b.icon}</span>
              {b.label}
            </div>
          ))}
        </div>

      </div>

      {/* ── Sticky bottom checkout bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0F0A1E] border-t border-purple-900/30 px-4 py-3 shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-white font-extrabold text-lg">₹{total.toLocaleString('en-IN')}</p>
            <p className="text-slate-500 text-xs">TOTAL</p>
          </div>
          <button
            onClick={handleCheckout}
            className="flex-1 max-w-xs btn-primary flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-xl text-sm shadow-glow-sm"
          >
            Proceed to Checkout
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-slate-600 text-xs mt-2">
          Powered by Razorpay · UPI, Cards, Net Banking accepted
        </p>
      </div>

      {/* Toast notifications */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`px-5 py-3 rounded-xl text-sm font-medium text-center shadow-glow-sm border ${
              t.type === 'info'
                ? 'bg-[#1A1035] border-blue-700/60 text-blue-300'
                : 'bg-[#1A1035] border-emerald-700/60 text-emerald-300'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* Plan change modal */}
      {changingItem && (() => {
        const toolData = tools.find(t => t.id === changingItem.toolId)
        if (!toolData) return null
        return (
          <PlanModal
            tool={toolData}
            existingKey={changingItem.key}
            onClose={() => {
              setChangingItem(null)
              showToast('Plan updated!')
            }}
          />
        )
      })()}

      {/* Payment modal */}
      {paymentOpen && (
        <PaymentModal
          items={items}
          subtotal={subtotal}
          discount={discount}
          tax={tax}
          total={total}
          couponCode={couponApplied ? 'APKAAI10' : null}
          onSuccess={handlePaymentSuccess}
          onClose={() => setPaymentOpen(false)}
        />
      )}
    </div>
  )
}
