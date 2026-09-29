'use client'
/**
 * AddToCartButton — universal reusable component
 * PAYWALL: Any cart action checks subscription first → redirects to /plans if not subscribed
 */
import { useState, useCallback } from 'react'
import { ShoppingCart, Check, ChevronDown } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useSubscription } from '@/lib/use-subscription'
import PlanModal from '@/components/cart/PlanModal'
import type { AITool } from '@/lib/tools-data'
import Link from 'next/link'

interface AddToCartButtonProps {
  tool: AITool
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'ghost'
  className?: string
  showViewCart?: boolean
  stopPropagation?: boolean
}

export default function AddToCartButton({
  tool,
  size = 'md',
  variant = 'primary',
  className = '',
  showViewCart = false,
  stopPropagation = true,
}: AddToCartButtonProps) {
  const { addItem, isInCart, getItemByTool, openDrawer } = useCart()
  const { requirePlan } = useSubscription()
  const [showModal, setShowModal] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const inCart    = isInCart(tool.id)
  const cartItem  = getItemByTool(tool.id)
  const plans     = tool.pricingPlans ?? []
  const multiPlan = plans.length > 1
  const firstPlan = plans[0]

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (stopPropagation) e.stopPropagation()
    e.preventDefault()

    if (inCart) {
      openDrawer()
      return
    }

    // ── PAYWALL: must have active plan ─────────────────────────────────────
    requirePlan(() => {
      if (multiPlan) {
        setShowModal(true)
        return
      }
      const plan = firstPlan ?? { name: 'Free', price: '₹0/mo', monthly: 0, features: [] }
      addItem(tool, plan, 'monthly')
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 2200)
    })
  }, [inCart, multiPlan, firstPlan, tool, addItem, openDrawer, stopPropagation, requirePlan])

  const sizeClasses = {
    sm:  'text-xs px-2.5 py-1.5 gap-1',
    md:  'text-xs px-3.5 py-2 gap-1.5',
    lg:  'text-sm px-5 py-3 gap-2',
  }[size]

  const iconSize = { sm: 'w-3 h-3', md: 'w-3.5 h-3.5', lg: 'w-4 h-4' }[size]

  function getButtonClass() {
    if (inCart)     return 'bg-purple-600/20 border border-purple-500/60 text-purple-300 hover:bg-purple-600/30 hover:border-purple-400'
    if (justAdded)  return 'bg-emerald-600/20 border border-emerald-500/60 text-emerald-400'
    if (variant === 'primary')   return 'btn-primary text-white shadow-glow-sm border border-transparent'
    if (variant === 'secondary') return 'bg-purple-950/40 border border-purple-700/50 text-purple-300 hover:border-purple-500 hover:text-white hover:bg-purple-900/30'
    return 'bg-transparent border border-purple-800/40 text-slate-400 hover:border-purple-600 hover:text-white'
  }

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={handleClick}
          aria-label={inCart ? `${tool.name} is in your cart` : `Add ${tool.name} to cart`}
          className={`flex items-center font-semibold rounded-lg transition-all ${sizeClasses} ${getButtonClass()}`}
        >
          {inCart ? (
            <><Check className={iconSize} />In Cart{multiPlan && <ChevronDown className={`${iconSize} opacity-60`} />}</>
          ) : justAdded ? (
            <><Check className={iconSize} />Added!</>
          ) : (
            <><ShoppingCart className={iconSize} />Add to Cart{multiPlan && <ChevronDown className={`${iconSize} opacity-60`} />}</>
          )}
        </button>
        {showViewCart && inCart && (
          <Link href="/cart" onClick={e => stopPropagation && e.stopPropagation()}
            className="text-xs text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors">
            View Cart
          </Link>
        )}
      </div>
      {showModal && <PlanModal tool={tool} onClose={() => setShowModal(false)} />}
    </>
  )
}
