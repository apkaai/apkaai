require('dotenv').config()
const express   = require('express')
const cors      = require('cors')
const helmet    = require('helmet')
const morgan    = require('morgan')
const rateLimit = require('express-rate-limit')

// ── Required routes ───────────────────────────────────────────────────────────
const toolsRouter      = require('./routes/tools')
const categoriesRouter = require('./routes/categories')
const contactRouter    = require('./routes/contact')
const authRouter       = require('./routes/auth')
const adminRouter      = require('./routes/admin')
const analyticsRouter  = require('./routes/analytics')
const paymentRouter    = require('./routes/payment')
const ordersRouter     = require('./routes/orders')
const wishlistRouter   = require('./routes/wishlist')
const reviewsRouter    = require('./routes/reviews')
const referralRouter   = require('./routes/referral')
const newsletterRouter = require('./routes/newsletter')
const invoicesRouter   = require('./routes/invoices')

// ── Optional routes (skip if deps missing) ────────────────────────────────────
let cloudRouter    = null
let datalakeRouter = null
try { cloudRouter    = require('./routes/cloud')    } catch (e) { console.warn('[boot] cloud unavailable:', e.message)    }
try { datalakeRouter = require('./routes/datalake') } catch (e) { console.warn('[boot] datalake unavailable:', e.message) }

const app  = express()
const PORT = process.env.PORT || 4000

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet())
app.use(morgan('dev'))

// Raw body for Razorpay webhook (must be before express.json)
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'https://apkaai.com',
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}))

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:      'ok',
    service:     'apkaai-api',
    timestamp:   new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  })
})

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/tools',      toolsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/contact',    contactRouter)
app.use('/api/auth',       authRouter)
app.use('/api/admin',      adminRouter)
app.use('/api/analytics',  analyticsRouter)
app.use('/api/payment',    paymentRouter)
app.use('/api/orders',     ordersRouter)
app.use('/api/wishlist',   wishlistRouter)
app.use('/api/reviews',    reviewsRouter)
app.use('/api/referral',   referralRouter)
app.use('/api/newsletter', newsletterRouter)
app.use('/api/invoices',   invoicesRouter)

if (cloudRouter)    app.use('/api/cloud',    cloudRouter)
if (datalakeRouter) app.use('/api/datalake', datalakeRouter)

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path })
})

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[Error]', err.message)
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  })
})

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ ApkaAI API running on http://localhost:${PORT}`)
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`)
  if (datalakeRouter) console.log(`   Datalake    : /api/datalake (mounted)`)
})

module.exports = app
