const express = require('express')
const router  = express.Router()
const crypto  = require('crypto')
const { query } = require('../lib/db')

// ─── Auth helper (for admin endpoints) ────────────────────────────────────────
function verifyToken(token) {
  try {
    const [payload, sig] = token.split('.')
    const secret   = process.env.JWT_SECRET || 'apkaai-jwt-secret-2026'
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex').slice(0, 32)
    if (sig !== expected) return null
    return JSON.parse(Buffer.from(payload, 'base64url').toString())
  } catch { return null }
}

function adminOnly(req, res, next) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Not authenticated' })
  const decoded = verifyToken(auth.split(' ')[1])
  if (!decoded) return res.status(401).json({ error: 'Invalid token' })
  query('SELECT role FROM users WHERE user_id = $1', [decoded.userId])
    .then(r => {
      if (r.rows[0]?.role === 'admin') return next()
      return res.status(403).json({ error: 'Admin access required' })
    })
    .catch(() => res.status(403).json({ error: 'Admin access required' }))
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/newsletter/subscribe
// Body: { email, name?, source? }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/subscribe', async (req, res, next) => {
  try {
    const { email, name, source = 'website' } = req.body

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required' })
    }

    // Check if already subscribed
    const existing = await query(
      'SELECT id, status FROM newsletter_subscribers WHERE email = $1',
      [email.toLowerCase().trim()]
    )

    if (existing.rowCount > 0) {
      if (existing.rows[0].status === 'active') {
        return res.json({ success: true, message: 'You are already subscribed!' })
      }
      // Re-subscribe if previously unsubscribed
      await query(
        `UPDATE newsletter_subscribers SET status = 'active', updated_at = NOW()
         WHERE email = $1`,
        [email.toLowerCase().trim()]
      )
      return res.json({ success: true, message: 'Welcome back! You are now re-subscribed.' })
    }

    await query(
      `INSERT INTO newsletter_subscribers (email, name, source)
       VALUES ($1, $2, $3)`,
      [email.toLowerCase().trim(), name?.trim() || null, source]
    )

    res.status(201).json({
      success: true,
      message: 'Thank you for subscribing! You will receive AI tool updates from ApkaAI.',
    })
  } catch (err) { next(err) }
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/newsletter/unsubscribe
// Body: { email }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/unsubscribe', async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email is required' })

    await query(
      `UPDATE newsletter_subscribers SET status = 'unsubscribed', updated_at = NOW()
       WHERE email = $1`,
      [email.toLowerCase().trim()]
    )
    res.json({ success: true, message: 'You have been unsubscribed successfully.' })
  } catch (err) { next(err) }
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/newsletter/subscribers  (admin only)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/subscribers', adminOnly, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, email, name, source, status, created_at
       FROM newsletter_subscribers
       ORDER BY created_at DESC`,
      []
    )
    const active = result.rows.filter(r => r.status === 'active').length
    res.json({ subscribers: result.rows, total: result.rowCount, active })
  } catch (err) { next(err) }
})

module.exports = router
