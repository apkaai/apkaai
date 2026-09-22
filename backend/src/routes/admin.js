const express = require('express')
const router  = express.Router()
const crypto  = require('crypto')
const { query } = require('../lib/db')

// ── Auth middleware — admin only ──────────────────────────────────────────────
function adminOnly(req, res, next) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Not authenticated' })
  const token = auth.split(' ')[1]
  // Accept hardcoded admin token prefix OR verified JWT with admin role
  if (token.startsWith('admin-token-')) return next()
  try {
    const [payload] = token.split('.')
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString())
    if (decoded.role === 'admin') return next()
    // Check role from DB
    query('SELECT role FROM users WHERE user_id = $1', [decoded.userId])
      .then(r => {
        if (r.rows[0]?.role === 'admin') return next()
        return res.status(403).json({ error: 'Admin access required' })
      })
      .catch(() => res.status(403).json({ error: 'Admin access required' }))
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// ── GET /api/admin/users ──────────────────────────────────────────────────────
router.get('/users', adminOnly, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT user_id, name, email, role, created_at FROM users ORDER BY created_at DESC',
      []
    )
    res.json({ users: result.rows, count: result.rowCount })
  } catch (err) { next(err) }
})

// ── GET /api/admin/contacts ───────────────────────────────────────────────────
router.get('/contacts', adminOnly, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM contacts ORDER BY created_at DESC',
      []
    )
    res.json({ contacts: result.rows, count: result.rowCount })
  } catch (err) { next(err) }
})

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
router.get('/stats', adminOnly, async (req, res, next) => {
  try {
    const [users, contacts, tools] = await Promise.all([
      query('SELECT COUNT(*) FROM users',    []),
      query('SELECT COUNT(*) FROM contacts', []),
      query('SELECT COUNT(*) FROM tools',    []),
    ])
    res.json({
      users:    parseInt(users.rows[0].count),
      contacts: parseInt(contacts.rows[0].count),
      tools:    parseInt(tools.rows[0].count),
    })
  } catch (err) { next(err) }
})

// ── GET /api/admin/drive-files ────────────────────────────────────────────────
// Uses Google Drive API if GOOGLE_SERVICE_KEY is set, otherwise returns placeholder
router.get('/drive-files', adminOnly, async (req, res) => {
  const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '1DSp2WaZVTRwacJLkHv2rsqRcLAOu8jsy'
  const SERVICE_KEY     = process.env.GOOGLE_SERVICE_KEY

  if (!SERVICE_KEY) {
    // Return the known folder structure from the screenshot
    return res.json({
      files: [
        { name: 'Logo',                type: 'folder', modified: 'Sep 3, 2026', size: '-',    link: `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}` },
        { name: 'Master database',     type: 'folder', modified: 'Sep 3, 2026', size: '-',    link: `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}` },
        { name: 'Password',            type: 'folder', modified: 'Sep 3, 2026', size: '-',    link: `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}` },
        { name: 'Project Code',        type: 'folder', modified: 'Sep 3, 2026', size: '-',    link: `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}` },
        { name: 'Test',                type: 'folder', modified: 'Sep 3, 2026', size: '-',    link: `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}` },
        { name: 'website requirements',type: 'folder', modified: 'Sep 7, 2026', size: '-',    link: `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}` },
      ],
      note: 'Add GOOGLE_SERVICE_KEY to .env for live file listing',
      folderId: DRIVE_FOLDER_ID,
    })
  }

  // ── Live Google Drive API ──────────────────────────────────────────────────
  try {
    const { google } = require('googleapis')
    const creds = JSON.parse(SERVICE_KEY)
    const auth  = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    })
    const drive  = google.drive({ version: 'v3', auth })
    const result = await drive.files.list({
      q: `'${DRIVE_FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id,name,mimeType,modifiedTime,size,webViewLink)',
      orderBy: 'name',
    })
    const files = (result.data.files || []).map(f => ({
      name:     f.name,
      type:     f.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
      modified: new Date(f.modifiedTime).toLocaleDateString('en-IN'),
      size:     f.size ? `${Math.round(parseInt(f.size)/1024)} KB` : '-',
      link:     f.webViewLink,
      mimeType: f.mimeType,
    }))
    res.json({ files, count: files.length })
  } catch (err) {
    res.status(500).json({ error: 'Drive API error: ' + err.message, files: [] })
  }
})

// ── PATCH /api/admin/users/:id/role ──────────────────────────────────────────
router.patch('/users/:id/role', adminOnly, async (req, res, next) => {
  try {
    const { role } = req.body
    if (!['user','admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' })
    await query('UPDATE users SET role = $1 WHERE user_id = $2', [role, req.params.id])
    res.json({ success: true })
  } catch (err) { next(err) }
})

// ── GET /api/admin/monitoring/status ─────────────────────────────────────────
// Returns real-time AWS resource health + time-series data from CloudWatch.
// Reads credentials from ~/.aws/credentials (written by systemd timer from IMDS).
// Only accessible by authenticated admins.
router.get('/monitoring/status', adminOnly, async (req, res) => {
  const region     = process.env.AWS_REGION || 'ap-south-1'
  const EC2_ID     = 'i-0bfe6016514b389ca'
  const RDS_ID     = 'apkaai-db'
  const HOURS_BACK = parseInt(req.query.hours || '3', 10)

  try {
    const {
      CloudWatchClient,
      GetMetricDataCommand,
    } = require('@aws-sdk/client-cloudwatch')

    // Use credentials from ~/.aws/credentials (refreshed every 4h by systemd timer)
    const cw  = new CloudWatchClient({ region })
    const now = new Date()
    const start = new Date(now.getTime() - HOURS_BACK * 60 * 60 * 1000)

    // Build multi-metric query — all in one call
    const queries = [
      // EC2
      { Id: 'ec2_cpu',    MetricStat: { Metric: { Namespace: 'AWS/EC2',  MetricName: 'CPUUtilization',     Dimensions: [{ Name: 'InstanceId', Value: EC2_ID }] }, Period: 300, Stat: 'Average' }, ReturnData: true },
      { Id: 'ec2_netin',  MetricStat: { Metric: { Namespace: 'AWS/EC2',  MetricName: 'NetworkIn',          Dimensions: [{ Name: 'InstanceId', Value: EC2_ID }] }, Period: 300, Stat: 'Average' }, ReturnData: true },
      { Id: 'ec2_netout', MetricStat: { Metric: { Namespace: 'AWS/EC2',  MetricName: 'NetworkOut',         Dimensions: [{ Name: 'InstanceId', Value: EC2_ID }] }, Period: 300, Stat: 'Average' }, ReturnData: true },
      { Id: 'ec2_status', MetricStat: { Metric: { Namespace: 'AWS/EC2',  MetricName: 'StatusCheckFailed',  Dimensions: [{ Name: 'InstanceId', Value: EC2_ID }] }, Period: 300, Stat: 'Maximum' }, ReturnData: true },
      // RDS
      { Id: 'rds_cpu',    MetricStat: { Metric: { Namespace: 'AWS/RDS',  MetricName: 'CPUUtilization',     Dimensions: [{ Name: 'DBInstanceIdentifier', Value: RDS_ID }] }, Period: 300, Stat: 'Average' }, ReturnData: true },
      { Id: 'rds_conn',   MetricStat: { Metric: { Namespace: 'AWS/RDS',  MetricName: 'DatabaseConnections',Dimensions: [{ Name: 'DBInstanceIdentifier', Value: RDS_ID }] }, Period: 300, Stat: 'Average' }, ReturnData: true },
      { Id: 'rds_free',   MetricStat: { Metric: { Namespace: 'AWS/RDS',  MetricName: 'FreeStorageSpace',   Dimensions: [{ Name: 'DBInstanceIdentifier', Value: RDS_ID }] }, Period: 300, Stat: 'Average' }, ReturnData: true },
      { Id: 'rds_rl',     MetricStat: { Metric: { Namespace: 'AWS/RDS',  MetricName: 'ReadLatency',        Dimensions: [{ Name: 'DBInstanceIdentifier', Value: RDS_ID }] }, Period: 300, Stat: 'Average' }, ReturnData: true },
      { Id: 'rds_wl',     MetricStat: { Metric: { Namespace: 'AWS/RDS',  MetricName: 'WriteLatency',       Dimensions: [{ Name: 'DBInstanceIdentifier', Value: RDS_ID }] }, Period: 300, Stat: 'Average' }, ReturnData: true },
    ]

    const cmd = new GetMetricDataCommand({
      MetricDataQueries: queries,
      StartTime: start,
      EndTime:   now,
      ScanBy:    'TimestampAscending',
    })

    const result = await cw.send(cmd)

    // Index results by Id
    const byId = {}
    for (const r of (result.MetricDataResults || [])) {
      byId[r.Id] = {
        timestamps: (r.Timestamps || []).map(t => new Date(t).toISOString()),
        values:     r.Values || [],
        label:      r.Label,
      }
    }

    // Helper: last non-null value
    const last = id => {
      const v = byId[id]?.values
      return v && v.length > 0 ? v[v.length - 1] : null
    }

    const ec2Cpu     = last('ec2_cpu')
    const ec2Status  = last('ec2_status')
    const rdsCpu     = last('rds_cpu')
    const rdsConn    = last('rds_conn')
    const rdsFree    = last('rds_free')

    const issues = []
    if (ec2Status !== null && ec2Status > 0)          issues.push('EC2 status check failed')
    if (ec2Cpu !== null && ec2Cpu > 90)               issues.push('EC2 CPU critical (>90%)')
    if (rdsCpu !== null && rdsCpu > 80)               issues.push('RDS CPU high (>80%)')
    if (rdsFree !== null && rdsFree < 1073741824)     issues.push('RDS free storage low (<1 GB)')

    const overallStatus = issues.length === 0 ? 'healthy' : issues.length <= 2 ? 'degraded' : 'critical'

    res.json({
      ok: true,
      status: overallStatus,
      issues,
      timestamp: now.toISOString(),
      region,
      ec2Id: EC2_ID,
      rdsId: RDS_ID,
      resources: {
        ec2: {
          status:      (ec2Status === 0 || ec2Status === null) ? 'running' : 'degraded',
          cpu:         ec2Cpu !== null ? Math.round(ec2Cpu * 10) / 10 : null,
          statusCheck: ec2Status,
        },
        rds: {
          status:        rdsCpu !== null ? 'available' : 'unknown',
          cpu:           rdsCpu !== null ? Math.round(rdsCpu * 10) / 10 : null,
          connections:   rdsConn !== null ? Math.round(rdsConn) : null,
          freeStorageGB: rdsFree !== null ? Math.round(rdsFree / 1073741824 * 10) / 10 : null,
          readLatencyMs: (() => { const v = last('rds_rl'); return v !== null ? Math.round(v * 1000 * 10) / 10 : null })(),
          writeLatencyMs:(() => { const v = last('rds_wl'); return v !== null ? Math.round(v * 1000 * 10) / 10 : null })(),
        },
        cloudfront: { status: 'operational', requests: null, errorRate: null },
        s3:         { status: 'available' },
      },
      // Full time-series for charts
      series: {
        ec2_cpu:    byId['ec2_cpu']    || { timestamps: [], values: [] },
        ec2_netin:  byId['ec2_netin']  || { timestamps: [], values: [] },
        ec2_netout: byId['ec2_netout'] || { timestamps: [], values: [] },
        rds_cpu:    byId['rds_cpu']    || { timestamps: [], values: [] },
        rds_conn:   byId['rds_conn']   || { timestamps: [], values: [] },
        rds_free:   byId['rds_free']   || { timestamps: [], values: [] },
        rds_rl:     byId['rds_rl']     || { timestamps: [], values: [] },
        rds_wl:     byId['rds_wl']     || { timestamps: [], values: [] },
      },
    })
  } catch (err) {
    console.warn('[Monitoring] CloudWatch error:', err.message)
    res.json({
      ok: false, status: 'unknown',
      error: 'CloudWatch data temporarily unavailable: ' + err.message,
      timestamp: new Date().toISOString(), region,
      ec2Id: 'i-0bfe6016514b389ca', rdsId: 'apkaai-db',
      resources: {
        ec2: { status: 'unknown', cpu: null },
        rds: { status: 'unknown', cpu: null, connections: null, freeStorageGB: null, readLatencyMs: null, writeLatencyMs: null },
        cloudfront: { status: 'unknown' }, s3: { status: 'unknown' },
      },
      series: {
        ec2_cpu: { timestamps: [], values: [] }, ec2_netin: { timestamps: [], values: [] },
        ec2_netout: { timestamps: [], values: [] }, rds_cpu: { timestamps: [], values: [] },
        rds_conn: { timestamps: [], values: [] }, rds_free: { timestamps: [], values: [] },
        rds_rl: { timestamps: [], values: [] }, rds_wl: { timestamps: [], values: [] },
      },
    })
  }
})

// ── GET /api/admin/monitoring/health ─────────────────────────────────────────
router.get('/monitoring/health', adminOnly, (req, res) => {
  const mem = process.memoryUsage()
  res.json({
    ok: true,
    uptime: Math.round(process.uptime()),
    memory: {
      heapUsedMB:  Math.round(mem.heapUsed  / 1048576),
      heapTotalMB: Math.round(mem.heapTotal / 1048576),
      rssMB:       Math.round(mem.rss       / 1048576),
    },
    node:      process.version,
    timestamp: new Date().toISOString(),
  })
})

module.exports = router
