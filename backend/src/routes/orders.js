const express = require('express')
const router  = express.Router()
const crypto  = require('crypto')
const { query } = require('../lib/db')

// ─────────────────────────────────────────────────────────────────────────────
// Auth helpers — reuse same HMAC token scheme as auth.js
// ─────────────────────────────────────────────────────────────────────────────
function verifyToken(token) {
  try {
    const [payload, sig] = token.split('.')
    const secret   = process.env.JWT_SECRET || 'apkaai-jwt-secret-2026'
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex').slice(0, 32)
    if (sig !== expected) return null
    return JSON.parse(Buffer.from(payload, 'base64url').toString())
  } catch { return null }
}

// Middleware: any authenticated user
function requireAuth(req, res, next) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' })
  }
  const decoded = verifyToken(auth.split(' ')[1])
  if (!decoded) return res.status(401).json({ error: 'Invalid or expired token' })
  req.user = decoded
  next()
}

// Middleware: admin only
function adminOnly(req, res, next) {
  requireAuth(req, res, async () => {
    try {
      const result = await query('SELECT role FROM users WHERE user_id = $1', [req.user.userId])
      if (result.rows[0]?.role === 'admin') return next()
      return res.status(403).json({ error: 'Admin access required' })
    } catch (err) { next(err) }
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders
// Place a new order from cart items
// Body: { items: CartItem[], subtotal, discount, tax, total, couponCode }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { items, subtotal, discount, tax, total, couponCode } = req.body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' })
    }

    // Create the order record
    const orderResult = await query(
      `INSERT INTO orders
         (user_id, status, subtotal, discount, tax, total, coupon_code, payment_method)
       VALUES ($1, 'pending', $2, $3, $4, $5, $6, 'razorpay')
       RETURNING *`,
      [
        req.user.userId,
        Number(subtotal)  || 0,
        Number(discount)  || 0,
        Number(tax)       || 0,
        Number(total)     || 0,
        couponCode || null,
      ]
    )
    const order = orderResult.rows[0]

    // Insert each item
    for (const item of items) {
      await query(
        `INSERT INTO order_items
           (order_id, tool_id, tool_name, tool_slug, tool_logo, tool_category,
            plan_name, plan_price, plan_monthly, billing_cycle, quantity)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          order.order_id,
          item.toolId       || '',
          item.toolName     || '',
          item.toolSlug     || '',
          item.toolLogo     || '',
          item.toolCategory || '',
          item.planName     || '',
          item.planPrice    || '',
          Number(item.planMonthly) || 0,
          item.billingCycle || 'monthly',
          Number(item.quantity) || 1,
        ]
      )
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      orderId: order.order_id,
      order: { ...order, items },
    })
  } catch (err) { next(err) }
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/my
// Get order history for the logged-in user
// ─────────────────────────────────────────────────────────────────────────────
router.get('/my', requireAuth, async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    // Get orders
    const ordersResult = await query(
      `SELECT * FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.userId, Number(limit), offset]
    )

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) FROM orders WHERE user_id = $1',
      [req.user.userId]
    )

    // Attach items to each order
    const orders = await Promise.all(
      ordersResult.rows.map(async (order) => {
        const itemsResult = await query(
          'SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at ASC',
          [order.order_id]
        )
        return { ...order, items: itemsResult.rows }
      })
    )

    res.json({
      orders,
      total: parseInt(countResult.rows[0].count, 10),
      page:  Number(page),
      limit: Number(limit),
    })
  } catch (err) { next(err) }
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/:orderId
// Get a single order (owner or admin)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:orderId', requireAuth, async (req, res, next) => {
  try {
    const orderResult = await query(
      'SELECT * FROM orders WHERE order_id = $1',
      [req.params.orderId]
    )
    if (orderResult.rowCount === 0) {
      return res.status(404).json({ error: 'Order not found' })
    }
    const order = orderResult.rows[0]

    // Only owner or admin can view
    const userResult = await query('SELECT role FROM users WHERE user_id = $1', [req.user.userId])
    const isAdmin    = userResult.rows[0]?.role === 'admin'
    if (order.user_id !== req.user.userId && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const itemsResult = await query(
      'SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at ASC',
      [order.order_id]
    )
    res.json({ order: { ...order, items: itemsResult.rows } })
  } catch (err) { next(err) }
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders  (admin only)
// Get all orders with user info, pagination, and optional status filter
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', adminOnly, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    let whereClause = ''
    const params = []

    if (status) {
      params.push(status)
      whereClause += ` AND o.status = $${params.length}`
    }
    if (search) {
      params.push(`%${search}%`)
      whereClause += ` AND (u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`
    }

    params.push(Number(limit), offset)

    const ordersResult = await query(
      `SELECT
         o.*,
         u.name  AS user_name,
         u.email AS user_email
       FROM orders o
       JOIN users u ON u.user_id = o.user_id
       WHERE 1=1 ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    )

    // Count query (without pagination params)
    const countParams = params.slice(0, params.length - 2)
    const countResult = await query(
      `SELECT COUNT(*) FROM orders o
       JOIN users u ON u.user_id = o.user_id
       WHERE 1=1 ${whereClause}`,
      countParams
    )

    // Attach items to each order
    const orders = await Promise.all(
      ordersResult.rows.map(async (order) => {
        const itemsResult = await query(
          'SELECT * FROM order_items WHERE order_id = $1',
          [order.order_id]
        )
        return { ...order, items: itemsResult.rows }
      })
    )

    // Summary stats
    const statsResult = await query(
      `SELECT
         COUNT(*)                                       AS total_orders,
         COUNT(*) FILTER (WHERE status = 'confirmed')  AS confirmed,
         COUNT(*) FILTER (WHERE status = 'completed')  AS completed,
         COUNT(*) FILTER (WHERE status = 'cancelled')  AS cancelled,
         COALESCE(SUM(total), 0)                        AS total_revenue
       FROM orders`,
      []
    )

    res.json({
      orders,
      total:  parseInt(countResult.rows[0].count, 10),
      page:   Number(page),
      limit:  Number(limit),
      stats:  statsResult.rows[0],
    })
  } catch (err) { next(err) }
})

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/orders/:orderId/status  (admin only)
// Update order status
// Body: { status }
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:orderId/status', adminOnly, async (req, res, next) => {
  try {
    const { status } = req.body
    const validStatuses = ['pending', 'confirmed', 'processing', 'completed', 'cancelled', 'refunded']
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` })
    }

    const result = await query(
      `UPDATE orders SET status = $1, updated_at = NOW()
       WHERE order_id = $2
       RETURNING *`,
      [status, req.params.orderId]
    )
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Order not found' })
    }
    res.json({ success: true, order: result.rows[0] })
  } catch (err) { next(err) }
})

module.exports = router
