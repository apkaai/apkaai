/**
 * payment.js — Razorpay payment gateway
 *
 * POST /api/payment/create-order   — create Razorpay order
 * POST /api/payment/verify         — verify signature after payment
 * POST /api/payment/webhook        — Razorpay webhook (auto-confirm)
 * GET  /api/payment/my-orders      — user's payment history (auth required)
 * GET  /api/payment/plans          — available subscription plans
 */
const express  = require('express')
const router   = express.Router()
const crypto   = require('crypto')
const { query } = require('../lib/db')

// ── Plan definitions ──────────────────────────────────────────────────────────
const PLANS = {
  basic: {
    id:          'basic',
    name:        'Basic',
    price:       299,          // INR per month
    priceYearly: 2490,         // INR per year (~30% off)
    currency:    'INR',
    features: [
      '50 AI tool comparisons/month',
      'Search across all 43+ tools',
      'Save favourite tools',
      'Basic analytics dashboard',
      'Email support',
    ],
    badge: null,
  },
  pro: {
    id:          'pro',
    name:        'Pro',
    price:       799,
    priceYearly: 6990,
    currency:    'INR',
    features: [
      'Unlimited AI tool comparisons',
      'AI-powered recommendations',
      'Advanced analytics & insights',
      'Priority email support',
      'Early access to new tools',
      'Export comparison reports (PDF)',
    ],
    badge: 'Most Popular',
  },
  enterprise: {
    id:          'enterprise',
    name:        'Enterprise',
    price:       2999,
    priceYearly: 29990,
    currency:    'INR',
    features: [
      'Everything in Pro',
      'Team access (up to 10 seats)',
      'API access for integrations',
      'Custom tool curation',
      'Dedicated account manager',
      'SLA-backed support (24h response)',
      'White-label comparison pages',
    ],
    badge: 'Best Value',
  },
}

// ── Auth middleware ────────────────────────────────────────────────────────────
function authRequired(req, res, next) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' })
  const token = auth.split(' ')[1]
  try {
    const decoded = JSON.parse(Buffer.from(token.split('.')[0], 'base64url').toString())
    req.user = decoded
    return next()
  } catch { return res.status(401).json({ error: 'Invalid token' }) }
}

// ── Ensure payments table exists ──────────────────────────────────────────────
async function ensurePaymentsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS payments (
      id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id             UUID        REFERENCES users(user_id) ON DELETE SET NULL,
      user_email          VARCHAR(200),
      user_name           VARCHAR(200),
      razorpay_order_id   VARCHAR(100) UNIQUE NOT NULL,
      razorpay_payment_id VARCHAR(100),
      razorpay_signature  VARCHAR(500),
      plan_id             VARCHAR(50) NOT NULL,
      plan_name           VARCHAR(100),
      amount              INTEGER     NOT NULL,       -- in paise
      amount_inr          NUMERIC(10,2) GENERATED ALWAYS AS (amount / 100.0) STORED,
      currency            VARCHAR(10) DEFAULT 'INR',
      billing_cycle       VARCHAR(20) DEFAULT 'monthly',
      status              VARCHAR(30) DEFAULT 'created',  -- created|paid|failed|refunded
      notes               JSONB       DEFAULT '{}',
      verified_at         TIMESTAMPTZ,
      created_at          TIMESTAMPTZ DEFAULT NOW(),
      updated_at          TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  await query(`CREATE INDEX IF NOT EXISTS idx_payments_user       ON payments(user_id)`)
  await query(`CREATE INDEX IF NOT EXISTS idx_payments_order      ON payments(razorpay_order_id)`)
  await query(`CREATE INDEX IF NOT EXISTS idx_payments_status     ON payments(status)`)
  await query(`CREATE INDEX IF NOT EXISTS idx_payments_created    ON payments(created_at DESC)`)
}

// ── GET /api/payment/plans ─────────────────────────────────────────────────────
router.get('/plans', (req, res) => {
  res.json({ plans: Object.values(PLANS) })
})

// ── POST /api/payment/create-order ───────────────────────────────────────────
router.post('/create-order', authRequired, async (req, res, next) => {
  try {
    await ensurePaymentsTable()

    const { planId, billingCycle = 'monthly' } = req.body
    const plan = PLANS[planId]
    if (!plan) return res.status(400).json({ error: `Invalid plan: ${planId}. Valid: ${Object.keys(PLANS).join(', ')}` })

    const amount = billingCycle === 'yearly' ? plan.priceYearly * 100 : plan.price * 100  // paise

    // Init Razorpay
    const Razorpay = require('razorpay')
    const rzp = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    const order = await rzp.orders.create({
      amount,
      currency: 'INR',
      receipt:  `apkaai_${planId}_${Date.now()}`,
      notes: {
        plan_id:       planId,
        plan_name:     plan.name,
        billing_cycle: billingCycle,
        user_id:       req.user.userId || '',
        user_email:    req.user.email  || '',
      },
    })

    // Save to DB
    const user = await query(
      'SELECT user_id, name, email FROM users WHERE user_id = $1',
      [req.user.userId]
    ).catch(() => ({ rows: [] }))
    const u = user.rows[0]

    await query(`
      INSERT INTO payments (user_id, user_email, user_name, razorpay_order_id, plan_id, plan_name, amount, currency, billing_cycle, status, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'created', $10)
    `, [
      u?.user_id || null,
      u?.email || req.user.email || '',
      u?.name  || '',
      order.id,
      planId,
      plan.name,
      amount,
      'INR',
      billingCycle,
      JSON.stringify(order.notes || {}),
    ])

    res.json({
      orderId:      order.id,
      amount:       order.amount,
      currency:     order.currency,
      planId,
      planName:     plan.name,
      billingCycle,
      keyId:        process.env.RAZORPAY_KEY_ID,
    })
  } catch (err) { next(err) }
})

// ── POST /api/payment/verify ──────────────────────────────────────────────────
router.post('/verify', authRequired, async (req, res, next) => {
  try {
    await ensurePaymentsTable()

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'razorpay_order_id, razorpay_payment_id and razorpay_signature are required' })
    }

    // Verify HMAC signature
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expected !== razorpay_signature) {
      await query(
        `UPDATE payments SET status='failed', updated_at=NOW() WHERE razorpay_order_id=$1`,
        [razorpay_order_id]
      )
      return res.status(400).json({ success: false, error: 'Payment verification failed — invalid signature' })
    }

    // Mark as paid
    const result = await query(`
      UPDATE payments
      SET razorpay_payment_id = $1,
          razorpay_signature  = $2,
          status              = 'paid',
          verified_at         = NOW(),
          updated_at          = NOW()
      WHERE razorpay_order_id = $3
      RETURNING *
    `, [razorpay_payment_id, razorpay_signature, razorpay_order_id])

    const payment = result.rows[0]
    if (!payment) return res.status(404).json({ error: 'Order not found' })

    // Optionally update user plan in users table
    if (payment.user_id) {
      await query(
        `UPDATE users SET updated_at=NOW() WHERE user_id=$1`,
        [payment.user_id]
      ).catch(() => {})
    }

    res.json({
      success:    true,
      message:    'Payment verified successfully! 🎉',
      paymentId:  razorpay_payment_id,
      orderId:    razorpay_order_id,
      planId:     payment.plan_id,
      planName:   payment.plan_name,
      amount:     payment.amount_inr,
      currency:   payment.currency,
    })
  } catch (err) { next(err) }
})

// ── POST /api/payment/webhook ─────────────────────────────────────────────────
// Set this URL in Razorpay Dashboard → Webhooks: https://apkaai.com/api/payment/webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    await ensurePaymentsTable()

    const webhookSecret   = process.env.RAZORPAY_WEBHOOK_SECRET
    const receivedSig     = req.headers['x-razorpay-signature']
    const body            = req.body.toString('utf8')

    if (webhookSecret && receivedSig) {
      const expectedSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex')
      if (expectedSig !== receivedSig) {
        console.warn('[Webhook] Invalid signature')
        return res.status(400).json({ error: 'Invalid webhook signature' })
      }
    }

    const event = JSON.parse(body)
    console.log('[Webhook] Event:', event.event)

    if (event.event === 'payment.captured') {
      const p = event.payload.payment.entity
      await query(`
        UPDATE payments
        SET razorpay_payment_id = $1,
            status              = 'paid',
            verified_at         = NOW(),
            updated_at          = NOW()
        WHERE razorpay_order_id = $2 AND status != 'paid'
      `, [p.id, p.order_id]).catch(e => console.error('[Webhook DB]', e.message))
    }

    if (event.event === 'payment.failed') {
      const p = event.payload.payment.entity
      await query(`
        UPDATE payments SET status='failed', updated_at=NOW()
        WHERE razorpay_order_id = $1
      `, [p.order_id]).catch(e => console.error('[Webhook DB]', e.message))
    }

    res.status(200).json({ received: true })
  } catch (err) {
    console.error('[Webhook Error]', err.message)
    res.status(500).json({ error: 'Webhook processing error' })
  }
})

// ── GET /api/payment/my-orders ────────────────────────────────────────────────
router.get('/my-orders', authRequired, async (req, res, next) => {
  try {
    await ensurePaymentsTable()
    const result = await query(`
      SELECT id, razorpay_order_id, razorpay_payment_id,
             plan_id, plan_name, amount_inr, currency, billing_cycle,
             status, verified_at, created_at
      FROM payments
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 50
    `, [req.user.userId])
    res.json({ orders: result.rows })
  } catch (err) { next(err) }
})

// ── GET /api/payment/all (admin only) ─────────────────────────────────────────
router.get('/all', async (req, res, next) => {
  try {
    const auth = req.headers.authorization
    if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Not authenticated' })
    const token   = auth.split(' ')[1]
    if (!token.startsWith('admin-token-')) {
      const decoded = JSON.parse(Buffer.from(token.split('.')[0], 'base64url').toString())
      if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
    }
    await ensurePaymentsTable()
    const result = await query(`
      SELECT id, user_email, user_name, razorpay_order_id, razorpay_payment_id,
             plan_id, plan_name, amount_inr, currency, billing_cycle,
             status, verified_at, created_at
      FROM payments
      ORDER BY created_at DESC
      LIMIT 200
    `)
    const stats = await query(`
      SELECT
        COUNT(*)                                           AS total_orders,
        COUNT(*) FILTER (WHERE status='paid')             AS paid_orders,
        SUM(amount_inr) FILTER (WHERE status='paid')      AS total_revenue_inr,
        COUNT(DISTINCT user_id) FILTER (WHERE status='paid') AS paying_users
      FROM payments
    `)
    res.json({ orders: result.rows, stats: stats.rows[0] })
  } catch (err) { next(err) }
})

module.exports = router
