/**
 * Cloud Cost Intelligence API — /api/cloud
 *
 * Routes:
 *   GET  /api/cloud/providers          — list providers
 *   GET  /api/cloud/services           — list services (filter by provider/category)
 *   POST /api/cloud/calculate          — calculate cost for a service config
 *   POST /api/cloud/compare            — compare same category across providers
 *   POST /api/cloud/estimates          — save an estimate (auth required)
 *   GET  /api/cloud/estimates          — get user's saved estimates (auth required)
 *   GET  /api/cloud/estimates/:id      — get single estimate
 *   DELETE /api/cloud/estimates/:id    — delete estimate (auth required)
 */

const express   = require('express')
const router    = express.Router()
const crypto    = require('crypto')
const rateLimit = require('express-rate-limit')
const { query } = require('../lib/db')

// ── Rate limiting ──────────────────────────────────────────────────────────────
const calcLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Too many requests. Please slow down.' },
})

// ── Auth middleware ────────────────────────────────────────────────────────────
function verifyToken(token) {
  try {
    const [payload, sig] = token.split('.')
    const secret   = process.env.JWT_SECRET || 'apkaai-jwt-secret-2026'
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex').slice(0, 32)
    if (sig !== expected) return null
    return JSON.parse(Buffer.from(payload, 'base64url').toString())
  } catch { return null }
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' })
  }
  const decoded = verifyToken(auth.split(' ')[1])
  if (!decoded) return res.status(401).json({ error: 'Invalid or expired token.' })
  req.user = decoded
  next()
}

// ── Static data (mirrors frontend pricing engine for SSR calculations) ─────────
const PROVIDERS = [
  { id: 'aws',   name: 'Amazon Web Services',    shortName: 'AWS'   },
  { id: 'azure', name: 'Microsoft Azure',        shortName: 'Azure' },
  { id: 'gcp',   name: 'Google Cloud Platform',  shortName: 'GCP'   },
  { id: 'ace',   name: 'ACE Cloud',              shortName: 'ACE'   },
]

// ── GET /api/cloud/providers ───────────────────────────────────────────────────
router.get('/providers', (req, res) => {
  res.json({ providers: PROVIDERS, dataUpdated: 'September 2026' })
})

// ── GET /api/cloud/services ────────────────────────────────────────────────────
router.get('/services', (req, res) => {
  const { provider, category } = req.query
  const SERVICES = {
    aws:   ['EC2 Compute','S3 Storage','RDS Database','Lambda Serverless','CloudFront CDN','ALB Load Balancer','EKS Kubernetes','EBS Block Storage'],
    azure: ['Virtual Machines','Blob Storage','Azure Database','Azure Functions'],
    gcp:   ['Compute Engine','Cloud Storage','Cloud SQL','Cloud Functions'],
    ace:   ['ACE Compute','ACE Object Storage','ACE Database'],
  }

  const result = provider
    ? (SERVICES[provider] || [])
    : Object.entries(SERVICES).flatMap(([p, svcs]) => svcs.map(s => ({ provider: p, service: s })))

  res.json({ services: result, dataUpdated: 'September 2026' })
})

// ── POST /api/cloud/calculate ──────────────────────────────────────────────────
router.post('/calculate', calcLimiter, (req, res) => {
  const { provider, serviceId, config } = req.body

  if (!provider || !serviceId || !config) {
    return res.status(400).json({ error: 'provider, serviceId and config are required.' })
  }

  // Basic input validation
  const numericFields = ['instances','hours','storage','transfer','requests','duration']
  for (const f of numericFields) {
    if (config[f] !== undefined) {
      const v = Number(config[f])
      if (isNaN(v) || v < 0) {
        return res.status(400).json({ error: `Invalid value for field: ${f}` })
      }
    }
  }

  // The actual calculation is done client-side using the pricing engine.
  // This endpoint is available for server-side use and future integrations.
  res.json({
    message: 'Use the frontend pricing engine (lib/cloud-pricing.ts) for calculations.',
    provider,
    serviceId,
    note: 'Server-side calculation endpoint available for future premium integrations.',
    dataUpdated: 'September 2026',
  })
})

// ── POST /api/cloud/estimates — Save estimate ─────────────────────────────────
router.post('/estimates', requireAuth, async (req, res, next) => {
  try {
    const { estimateId, provider, currency, tax, taxRate, monthly, items, config } = req.body

    if (!provider || !monthly || !items) {
      return res.status(400).json({ error: 'provider, monthly and items are required.' })
    }

    const id = estimateId || `EST-${Date.now().toString(36).toUpperCase()}`

    const result = await query(
      `INSERT INTO cloud_estimates
         (id, user_id, provider, currency, tax, tax_rate, monthly_cost, items, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       ON CONFLICT (id) DO UPDATE
         SET monthly_cost = $7, items = $8, updated_at = NOW()
       RETURNING id, created_at`,
      [
        id,
        req.user.userId,
        provider,
        currency || 'USD',
        !!tax,
        taxRate || 0,
        monthly,
        JSON.stringify(items),
      ]
    )

    res.status(201).json({ success: true, estimateId: result.rows[0].id })
  } catch (err) {
    // Table may not exist yet — return graceful error
    if (err.code === '42P01') {
      return res.status(503).json({ error: 'Cloud estimates storage not yet configured. Run DB migration.' })
    }
    next(err)
  }
})

// ── GET /api/cloud/estimates — List user estimates ────────────────────────────
router.get('/estimates', requireAuth, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, provider, currency, monthly_cost, created_at
         FROM cloud_estimates
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 50`,
      [req.user.userId]
    )
    res.json({ estimates: result.rows })
  } catch (err) {
    if (err.code === '42P01') {
      return res.json({ estimates: [] })
    }
    next(err)
  }
})

// ── GET /api/cloud/estimates/:id ──────────────────────────────────────────────
router.get('/estimates/:id', requireAuth, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT * FROM cloud_estimates WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.userId]
    )
    if (result.rowCount === 0) return res.status(404).json({ error: 'Estimate not found.' })
    const est = result.rows[0]
    est.items = typeof est.items === 'string' ? JSON.parse(est.items) : est.items
    res.json({ estimate: est })
  } catch (err) {
    if (err.code === '42P01') return res.status(404).json({ error: 'Estimate not found.' })
    next(err)
  }
})

// ── DELETE /api/cloud/estimates/:id ──────────────────────────────────────────
router.delete('/estimates/:id', requireAuth, async (req, res, next) => {
  try {
    await query(
      `DELETE FROM cloud_estimates WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.userId]
    )
    res.json({ success: true })
  } catch (err) {
    if (err.code === '42P01') return res.json({ success: true })
    next(err)
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/cloud/aws-live-price
// Fetch live on-demand price from AWS Pricing API (with 24h PostgreSQL cache).
// Query params:
//   instanceType  (default: t3.medium)
//   region        (default: ap-south-1)
//   service       (default: ec2)   — ec2 | rds | s3
//   engine        (default: MySQL) — for RDS only
//   storageGB     (default: 100)   — for S3 only
// ─────────────────────────────────────────────────────────────────────────────
router.get('/aws-live-price', calcLimiter, async (req, res, next) => {
  try {
    const awsPricing = require('../lib/aws-pricing')
    const { instanceType = 't3.medium', region = 'ap-south-1', service = 'ec2', engine = 'MySQL', storageGB = '100' } = req.query

    let result
    if (service === 'rds') {
      result = await awsPricing.getRDSPrice(instanceType, engine, region)
    } else if (service === 's3') {
      result = await awsPricing.getS3Price(Number(storageGB), region)
    } else {
      result = await awsPricing.getEC2Price(instanceType, region)
    }

    // Background cleanup (non-blocking)
    awsPricing.clearExpiredCache().catch(() => {})

    res.json({ success: true, data: result })
  } catch (err) {
    console.error('[Cloud] AWS live price error:', err.message)
    res.status(503).json({
      success: false,
      error:   err.message,
      message: 'AWS Pricing API unavailable. Using static pricing data instead.',
    })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/cloud/compare-live
// Compare EC2/RDS/S3 across all 5 providers — AWS price from live API,
// others from static pricing data.
// Body: { category, vcpu, ram, storageGB?, region? }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/compare-live', calcLimiter, async (req, res, next) => {
  try {
    const awsPricing = require('../lib/aws-pricing')
    const {
      category  = 'compute',
      vcpu      = 2,
      ram       = 4,
      storageGB = 30,
      region    = 'ap-south-1',
    } = req.body

    // Find the closest AWS EC2 instance for the requested spec
    const closest      = awsPricing.findClosestEC2Instance(Number(vcpu), Number(ram))
    let   awsLivePrice = null
    let   awsSource    = 'static'

    try {
      const liveResult = await awsPricing.getEC2Price(closest.type, region)
      awsLivePrice = liveResult
      awsSource    = liveResult.source  // 'aws-live-fresh' or 'aws-live-cached'
    } catch (awsErr) {
      console.warn('[Cloud Compare-Live] AWS live fetch failed, using static:', awsErr.message)
    }

    // Static pricing fallback data for all 5 providers (from frontend pricing engine)
    const STATIC_MONTHLY = {
      aws:   { '2-4':  35.10, '4-8':  70.10, '8-16': 140.30, '2-8': 55.60,  '4-16': 111.20 },
      azure: { '2-4':  36.30, '4-8':  72.50, '8-16': 145.00, '2-8': 60.80,  '4-16': 121.50 },
      gcp:   { '2-4':  34.59, '4-8':  69.00, '8-16': 138.10, '2-8': 52.60,  '4-16': 105.20 },
      ace:   { '2-4':  25.46, '4-8':  50.90, '8-16': 101.80, '2-8': 37.60,  '4-16':  75.20 },
      utho:  { '2-4':  18.70, '4-8':  37.46, '8-16':  57.47, '2-8': 27.00,  '4-16':  54.00 },
    }

    const specKey = `${Number(vcpu)}-${Number(ram)}`

    const providers = [
      { id: 'aws',   name: 'AWS',        service: 'EC2 — Compute',      logo: '🟠' },
      { id: 'azure', name: 'Azure',       service: 'Virtual Machines',   logo: '🔵' },
      { id: 'gcp',   name: 'GCP',         service: 'Compute Engine',     logo: '🔴' },
      { id: 'ace',   name: 'ACE',         service: 'ACE Compute',        logo: '🟢' },
      { id: 'utho',  name: 'Utho 🇮🇳',   service: 'Utho Cloud Server',  logo: '🟤' },
    ]

    const rows = providers.map(p => {
      let monthly = STATIC_MONTHLY[p.id]?.[specKey] || 0
      let source  = 'static'
      let instanceType = closest.type

      // Replace AWS with live price when available
      if (p.id === 'aws' && awsLivePrice) {
        monthly      = awsLivePrice.monthly
        source       = awsSource
        instanceType = awsLivePrice.instanceType
      }

      return {
        provider:    p.id,
        providerName: p.name,
        logo:        p.logo,
        serviceName: p.service,
        vcpu:        Number(vcpu),
        ram:         Number(ram),
        monthly:     parseFloat(monthly.toFixed(2)),
        annual:      parseFloat((monthly * 12).toFixed(2)),
        source,
        instanceType: p.id === 'aws' ? instanceType : undefined,
        isLive:      p.id === 'aws' && awsSource !== 'static',
      }
    })

    // Sort by monthly price
    rows.sort((a, b) => a.monthly - b.monthly)
    const cheapestMonthly = rows.filter(r => r.monthly > 0)[0]?.monthly || 0
    rows.forEach(r => { r.isLowest = r.monthly === cheapestMonthly && r.monthly > 0 })

    awsPricing.clearExpiredCache().catch(() => {})

    res.json({
      success:      true,
      category,
      spec:         { vcpu: Number(vcpu), ram: Number(ram), storageGB: Number(storageGB), region },
      rows,
      awsLive:      awsLivePrice !== null,
      awsSource,
      dataUpdated:  new Date().toISOString(),
    })
  } catch (err) { next(err) }
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/cloud/aws-cache-status  (admin/debug — no auth for simplicity)
// Shows what's currently cached in aws_price_cache
// ─────────────────────────────────────────────────────────────────────────────
router.get('/aws-cache-status', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT cache_key, service_code, region, price_usd, unit, fetched_at, expires_at,
              expires_at > NOW() AS is_valid
       FROM aws_price_cache
       ORDER BY fetched_at DESC
       LIMIT 50`,
      []
    )
    const valid   = result.rows.filter(r => r.is_valid).length
    const expired = result.rows.filter(r => !r.is_valid).length
    res.json({ total: result.rowCount, valid, expired, entries: result.rows })
  } catch (err) {
    if (err.code === '42P01') return res.json({ total: 0, valid: 0, expired: 0, entries: [], note: 'Run DB migration to create aws_price_cache table' })
    next(err)
  }
})

module.exports = router
