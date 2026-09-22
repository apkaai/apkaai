require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

const toolsRouter      = require('./routes/tools')
const categoriesRouter = require('./routes/categories')
const contactRouter    = require('./routes/contact')
const authRouter       = require('./routes/auth')
const adminRouter      = require('./routes/admin')
const analyticsRouter  = require('./routes/analytics')
const datalakeRouter   = require('./routes/datalake')
const paymentRouter    = require('./routes/payment')

// cloud router is optional — only load if the file exists
let cloudRouter = null
try { cloudRouter = require('./routes/cloud') } catch (e) {
  console.warn('[boot] routes/cloud.js not loadable, skipping:', e.message)
}

const app  = express()
const PORT = process.env.PORT || 4000

// ── Security & Middleware ─────────────────────────────────────────────────────
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// CORS — allow Next.js frontend
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'https://apkaai.com',
    'https://non-prod.apkaai.com',
    'http://localhost:3000',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Global rate limiter: 200 requests per 15 minutes per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}))

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:      'ok',
    service:     'apkaai-api',
    timestamp:   new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    datalake:    'mounted',
  })
})

app.use('/api/tools',      toolsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/contact',    contactRouter)
app.use('/api/auth',       authRouter)
app.use('/api/admin',      adminRouter)
app.use('/api/analytics',  analyticsRouter)
app.use('/api/datalake',   datalakeRouter)   // ← DATA LAKE (ETL + SQL + S3 + Athena)
app.use('/api/payment',   paymentRouter)    // ← RAZORPAY PAYMENT GATEWAY

if (cloudRouter) {
  app.use('/api/cloud', cloudRouter)
}

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path })
})

// ── Global Error Handler ──────────────────────────────────────────────────────
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
  console.log(`   AWS Region  : ${process.env.AWS_REGION || 'ap-south-1'}`)
  console.log(`   Datalake    : /api/datalake (mounted)`)
})

module.exports = app
