/**
 * useSubscription — checks if the current user has an active paid plan
 *
 * Rules:
 *  - If NOT logged in   → redirect to /signin?redirect=...
 *  - If logged in but NO paid plan → redirect to /plans
 *  - If logged in WITH paid plan  → allow action
 *
 * Usage:
 *   const { requirePlan } = useSubscription()
 *   <button onClick={() => requirePlan(() => doSomething())}>Buy</button>
 */
'use client'
import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface SubscriptionUser {
  userId: string
  email:  string
  role:   string
  plan?:  string    // 'basic' | 'pro' | 'enterprise' — set after payment
}

function getUser(): SubscriptionUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('apkaai_user') || sessionStorage.getItem('apkaai_user')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('apkaai_token') || sessionStorage.getItem('apkaai_token') || null
}

/**
 * Check if the user has an active subscription.
 * We check 3 signals (in order):
 *  1. In-memory: apkaai_user.plan is set to a known plan
 *  2. localStorage flag: apkaai_subscribed = 'true' (set after successful payment)
 *  3. Admin users always get access
 */
export function isSubscribed(): boolean {
  const user  = getUser()
  const token = getToken()
  if (!token || !user) return false

  // Admins always have access
  if (user.role === 'admin') return true

  // Check plan field on user object
  const PAID_PLANS = ['basic', 'pro', 'enterprise']
  if (user.plan && PAID_PLANS.includes(user.plan)) return true

  // Check localStorage subscription flag (set by payment success page)
  const flag = localStorage.getItem('apkaai_subscribed')
  if (flag === 'true') return true

  return false
}

export function useSubscription() {
  const router = useRouter()

  /**
   * requirePlan(action, redirectBackTo?)
   * - If not logged in  → go to /signin with redirect
   * - If no active plan → go to /plans with a message
   * - If subscribed     → run action()
   */
  const requirePlan = useCallback((
    action: () => void,
    redirectBackTo?: string,
  ) => {
    const token = getToken()
    const user  = getUser()

    if (!token || !user) {
      const back = redirectBackTo || (typeof window !== 'undefined' ? window.location.pathname : '/plans')
      router.push(`/signin?redirect=${encodeURIComponent(back)}&reason=purchase`)
      return
    }

    if (!isSubscribed()) {
      router.push('/plans?reason=access')
      return
    }

    action()
  }, [router])

  return { requirePlan, isSubscribed }
}
