'use client'
/**
 * /admin/monitoring — Native React CloudWatch dashboard
 *
 * NO Grafana iframe. All data comes from /api/admin/monitoring/status
 * which queries AWS CloudWatch via the EC2 IAM role.
 *
 * Charts are pure SVG sparklines — zero external dependencies.
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Shield, LogOut, Activity, RefreshCw, AlertTriangle,
  Server, Database, Cloud, HardDrive, BarChart3,
  Users, Mail, Clock, CheckCircle2, XCircle, Wifi,
  TrendingUp, Cpu, Zap,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Series { timestamps: string[]; values: number[] }

interface MonitoringData {
  ok: boolean
  status: 'healthy' | 'degraded' | 'critical' | 'unknown'
  issues: string[]
  timestamp: string
  region: string
  ec2Id?: string
  rdsId?: string
  error?: string
  resources: {
    ec2:        { status: string; cpu: number | null; statusCheck?: number | null }
    rds:        { status: string; cpu: number | null; connections: number | null; freeStorageGB: number | null; readLatencyMs?: number | null; writeLatencyMs?: number | null }
    cloudfront: { status: string; requests?: number | null; errorRate?: number | null }
    s3:         { status: string }
  }
  series?: {
    ec2_cpu:    Series
    ec2_netin:  Series
    ec2_netout: Series
    rds_cpu:    Series
    rds_conn:   Series
    rds_free:   Series
    rds_rl:     Series
    rds_wl:     Series
  }
}

// ─── Auth guard ───────────────────────────────────────────────────────────────

function useAdminGuard() {
  const router = useRouter()
  const [authed, setAuthed] = useState(false)
  const [token, setToken]   = useState('')

  useEffect(() => {
    const u = localStorage.getItem('apkaai_user') || sessionStorage.getItem('apkaai_user')
    const t = localStorage.getItem('apkaai_token') || sessionStorage.getItem('apkaai_token') || ''
    if (!u) { router.replace('/admin/login'); return }
    try {
      const user = JSON.parse(u)
      if (user.role !== 'admin') { router.replace('/admin/login'); return }
      setAuthed(true); setToken(t)
    } catch { router.replace('/admin/login') }
  }, [router])

  return { authed, token }
}

function signOut() {
  ['apkaai_token', 'apkaai_user'].forEach(k => {
    localStorage.removeItem(k); sessionStorage.removeItem(k)
  })
  window.location.href = '/admin/login'
}

// ─── SVG Sparkline chart ──────────────────────────────────────────────────────

function Sparkline({
  values, color = '#a855f7', height = 48, unit = '', showDots = false,
}: {
  values: number[]
  color?: string
  height?: number
  unit?: string
  showDots?: boolean
}) {
  if (!values || values.length < 2) {
    return (
      <div className="flex items-center justify-center h-12 text-slate-600 text-xs">
        No data yet
      </div>
    )
  }

  const w = 280
  const h = height
  const pad = 4
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2)
    const y = h - pad - ((v - min) / range) * (h - pad * 2)
    return `${x},${y}`
  })

  const pathD = `M ${pts.join(' L ')}`
  const areaD = `M ${pts[0]} L ${pts.join(' L ')} L ${pad + (w - pad * 2)},${h - pad} L ${pad},${h - pad} Z`

  const lastVal = values[values.length - 1]
  const lastPt  = pts[pts.length - 1].split(',')

  return (
    <div className="relative">
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Area fill */}
        <path d={areaD} fill={`url(#grad-${color.replace('#','')})`} />
        {/* Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Latest value dot */}
        {showDots && (
          <circle cx={lastPt[0]} cy={lastPt[1]} r="3" fill={color} />
        )}
      </svg>
      {/* Latest value label */}
      <div className="absolute top-1 right-1 text-xs font-bold" style={{ color }}>
        {typeof lastVal === 'number' ? `${lastVal.toFixed(1)}${unit}` : '—'}
      </div>
    </div>
  )
}

// ─── Metric card ──────────────────────────────────────────────────────────────

function MetricCard({
  title, value, unit, status, series, color, icon: Icon, detail,
}: {
  title: string
  value: number | null | string
  unit?: string
  status?: string
  series?: Series
  color: string
  icon: React.ElementType
  detail?: string
}) {
  const statusColors: Record<string, string> = {
    running: 'text-emerald-400', available: 'text-emerald-400',
    operational: 'text-emerald-400', degraded: 'text-amber-400',
    unknown: 'text-slate-500', critical: 'text-red-400',
  }

  return (
    <div className="glow-border rounded-xl bg-[#0F0A1E] p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="text-slate-400 text-xs font-medium">{title}</span>
        </div>
        {status && (
          <span className={`text-xs font-semibold ${statusColors[status] || 'text-slate-500'}`}>
            ● {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-extrabold text-white">
          {value !== null && value !== undefined ? String(value) : '—'}
        </span>
        {unit && <span className="text-sm text-slate-400">{unit}</span>}
      </div>

      {detail && <p className="text-xs text-slate-500">{detail}</p>}

      {series && series.values.length > 1 && (
        <Sparkline values={series.values} color={color.replace('text-', '').includes('#') ? color : undefined} height={44} unit={unit} showDots />
      )}
      {series && series.values.length > 1 && (
        <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
          <span>{new Date(series.timestamps[0]).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
          <span>now</span>
        </div>
      )}
    </div>
  )
}

// ─── Chart card (larger) ──────────────────────────────────────────────────────

function ChartCard({
  title, series, color, unit, height = 80,
}: {
  title: string
  series: Series
  color: string
  unit: string
  height?: number
}) {
  if (!series || series.values.length < 2) {
    return (
      <div className="glow-border rounded-xl bg-[#0F0A1E] p-4">
        <p className="text-slate-400 text-xs font-medium mb-3">{title}</p>
        <div className="flex items-center justify-center h-20 text-slate-600 text-xs">No data available</div>
      </div>
    )
  }

  const min = Math.min(...series.values)
  const max = Math.max(...series.values)

  return (
    <div className="glow-border rounded-xl bg-[#0F0A1E] p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-slate-300 text-xs font-semibold">{title}</p>
        <div className="text-xs text-slate-500">
          min: {min.toFixed(2)}{unit} · max: {max.toFixed(2)}{unit}
        </div>
      </div>
      <Sparkline values={series.values} color={color} height={height} unit={unit} showDots />
      <div className="flex justify-between text-[10px] text-slate-600 mt-1">
        <span>{new Date(series.timestamps[0]).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
        <span>{series.values.length} points</span>
        <span>now</span>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

const CHART_COLORS = {
  ec2:    '#f97316',   // orange
  rds:    '#3b82f6',   // blue
  net:    '#a855f7',   // purple
  latency:'#06b6d4',   // cyan
  conn:   '#10b981',   // emerald
  free:   '#84cc16',   // lime
}

export default function MonitoringPage() {
  const { authed, token } = useAdminGuard()

  const [data,        setData]        = useState<MonitoringData | null>(null)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [lastUpdated, setLastUpdated] = useState('')
  const [hours,       setHours]       = useState(3)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchData = useCallback(async () => {
    if (!token) return
    setLoading(true); setError('')
    try {
      const r = await fetch(`/api/admin/monitoring/status?hours=${hours}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (r.status === 401 || r.status === 403) { window.location.href = '/admin/login'; return }
      const d: MonitoringData = await r.json()
      setData(d)
      setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    } catch { setError('Cannot reach monitoring API. Retrying in 30s…') }
    finally { setLoading(false) }
  }, [token, hours])

  useEffect(() => {
    if (!authed) return
    fetchData()
    intervalRef.current = setInterval(fetchData, 30000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [authed, fetchData])

  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center bg-[#08051A]">
      <div className="text-slate-400 flex items-center gap-2">
        <span className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        Checking access…
      </div>
    </div>
  )

  const tabs = [
    { id: 'overview',   label: 'Overview',   icon: BarChart3,  href: '/admin' },
    { id: 'users',      label: 'Users',      icon: Users,      href: '/admin' },
    { id: 'contacts',   label: 'Contacts',   icon: Mail,       href: '/admin' },
    { id: 'datalake',   label: 'Data Lake',  icon: HardDrive,  href: '/admin' },
    { id: 'monitoring', label: 'Monitoring', icon: Activity,   href: '/admin/monitoring', active: true },
  ]

  const s = data?.series
  const r = data?.resources

  const statusMap: Record<string, { label: string; color: string; bg: string }> = {
    healthy:  { label: 'All Systems Healthy',  color: 'text-emerald-400', bg: 'bg-emerald-900/20 border-emerald-700/40' },
    degraded: { label: 'Degraded Performance', color: 'text-amber-400',   bg: 'bg-amber-900/20   border-amber-700/40' },
    critical: { label: 'Critical Issues',      color: 'text-red-400',     bg: 'bg-red-900/20     border-red-700/40' },
    unknown:  { label: 'Status Unknown',       color: 'text-slate-400',   bg: 'bg-slate-900/20   border-slate-700/40' },
  }
  const statusInfo = statusMap[data?.status || 'unknown'] || statusMap.unknown

  return (
    <div className="min-h-screen bg-[#08051A]">

      {/* Top bar */}
      <div className="border-b border-purple-900/30 bg-[#0F0A1E]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-purple-400" />
            <span className="font-bold text-white">ApkaAI Admin</span>
            <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">Control Panel</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-white text-sm">View Site</Link>
            <button onClick={signOut} className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-sm">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map(t => (
            <Link key={t.id} href={t.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all flex-shrink-0 ${
                t.active ? 'bg-purple-600 border-purple-500 text-white' : 'bg-[#0F0A1E] border-purple-800/40 text-slate-300 hover:border-purple-600'
              }`}>
              <t.icon className="w-4 h-4" />
              {t.label}
            </Link>
          ))}
        </div>

        {/* Header row */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-purple-400" />
              AWS Infrastructure Monitoring
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Live CloudWatch metrics — EC2 · RDS · ap-south-1
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Time range selector */}
            <div className="flex items-center gap-1 bg-purple-950/40 border border-purple-800/30 rounded-xl p-1">
              {[1, 3, 6, 12].map(h => (
                <button key={h} onClick={() => setHours(h)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    hours === h ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}>
                  {h}h
                </button>
              ))}
            </div>

            {/* Last updated */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              {lastUpdated ? `Updated: ${lastUpdated}` : 'Loading…'}
            </div>

            {/* Refresh */}
            <button onClick={fetchData} disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-900/40 border border-purple-700/40 hover:border-purple-500 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition-all disabled:opacity-50">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <span className="text-xs text-slate-600 hidden sm:block">Auto: 30s</span>
          </div>
        </div>

        {/* Error banner */}
        {(error || (data && !data.ok && data.error)) && (
          <div className="rounded-xl border border-red-700/30 bg-red-900/10 p-4 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error || data?.error}</p>
          </div>
        )}

        {/* Overall status banner */}
        {data && (
          <div className={`rounded-xl border p-4 flex items-center justify-between flex-wrap gap-3 ${statusInfo.bg}`}>
            <div className="flex items-center gap-3">
              <span className={`text-2xl`}>{data.status === 'healthy' ? '✅' : data.status === 'degraded' ? '⚠️' : data.status === 'critical' ? '🔴' : '❓'}</span>
              <div>
                <p className={`font-bold text-sm ${statusInfo.color}`}>{statusInfo.label}</p>
                <p className="text-slate-400 text-xs">
                  Region: {data.region} · EC2: {data.ec2Id?.slice(-8)} · RDS: {data.rdsId}
                </p>
              </div>
            </div>
            {data.issues.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.issues.map((issue, i) => (
                  <span key={i} className="flex items-center gap-1 text-xs bg-amber-900/30 border border-amber-700/40 text-amber-300 px-2.5 py-1 rounded-lg">
                    <AlertTriangle className="w-3 h-3" /> {issue}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && !data && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="glow-border rounded-xl bg-[#0F0A1E] p-4 h-32 animate-pulse">
                <div className="h-3 bg-purple-900/40 rounded w-1/2 mb-3" />
                <div className="h-8 bg-purple-900/40 rounded w-1/3 mb-4" />
                <div className="h-12 bg-purple-900/20 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* ── EC2 Section ── */}
        {data && (
          <>
            <div>
              <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <Server className="w-4 h-4 text-orange-400" /> EC2 Instance
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <MetricCard
                  title="CPU Utilization" value={r?.ec2.cpu ?? '—'} unit="%" status={r?.ec2.status}
                  series={s?.ec2_cpu} color="text-orange-400" icon={Cpu}
                  detail="5-min average · CloudWatch"
                />
                <MetricCard
                  title="Network In" value={s?.ec2_netin.values.length ? Math.round((s.ec2_netin.values.slice(-1)[0] || 0) / 1024) : null} unit=" KB/5min"
                  series={s?.ec2_netin} color="text-purple-400" icon={TrendingUp}
                  detail="Bytes received per 5-minute period"
                />
                <MetricCard
                  title="Network Out" value={s?.ec2_netout.values.length ? Math.round((s.ec2_netout.values.slice(-1)[0] || 0) / 1024) : null} unit=" KB/5min"
                  series={s?.ec2_netout} color="text-violet-400" icon={Wifi}
                  detail="Bytes sent per 5-minute period"
                />
              </div>

              {/* EC2 full-width CPU chart */}
              {s?.ec2_cpu && s.ec2_cpu.values.length > 1 && (
                <div className="mt-4">
                  <ChartCard title="EC2 CPU — Time Series" series={s.ec2_cpu} color={CHART_COLORS.ec2} unit="%" height={90} />
                </div>
              )}
            </div>

            {/* ── RDS Section ── */}
            <div>
              <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" /> RDS PostgreSQL ({data.rdsId})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="CPU Utilization" value={r?.rds.cpu ?? '—'} unit="%" status={r?.rds.status}
                  series={s?.rds_cpu} color="text-blue-400" icon={Cpu}
                  detail="Database CPU usage"
                />
                <MetricCard
                  title="DB Connections" value={r?.rds.connections ?? '—'} unit=""
                  series={s?.rds_conn} color="text-emerald-400" icon={Zap}
                  detail="Active database connections"
                />
                <MetricCard
                  title="Free Storage" value={r?.rds.freeStorageGB ?? '—'} unit=" GB"
                  series={s?.rds_free ? { timestamps: s.rds_free.timestamps, values: s.rds_free.values.map(v => Math.round(v / 1073741824 * 10) / 10) } : undefined}
                  color="text-lime-400" icon={HardDrive}
                  detail="Available disk space on RDS"
                />
                <MetricCard
                  title="Read Latency" value={r?.rds.readLatencyMs ?? '—'} unit=" ms"
                  series={s?.rds_rl ? { timestamps: s.rds_rl.timestamps, values: s.rds_rl.values.map(v => Math.round(v * 1000 * 10) / 10) } : undefined}
                  color="text-cyan-400" icon={Activity}
                  detail="Average read latency"
                />
              </div>

              {/* RDS charts grid */}
              {s && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <ChartCard title="RDS CPU — Time Series" series={s.rds_cpu} color={CHART_COLORS.rds} unit="%" height={80} />
                  <ChartCard title="DB Connections" series={s.rds_conn} color={CHART_COLORS.conn} unit="" height={80} />
                </div>
              )}
            </div>

            {/* ── Other services ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Cloud,    label: 'CloudFront CDN', status: r?.cloudfront.status || 'unknown', color: 'text-sky-400' },
                { icon: HardDrive,label: 'S3 Storage',     status: r?.s3.status || 'unknown',         color: 'text-teal-400' },
                { icon: Server,   label: 'EC2 Region',     status: 'ap-south-1',                      color: 'text-orange-400' },
                { icon: Database, label: 'RDS Engine',     status: 'PostgreSQL 15',                   color: 'text-blue-400' },
              ].map(item => (
                <div key={item.label} className="glow-border rounded-xl bg-[#0F0A1E] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-slate-400 text-xs">{item.label}</span>
                  </div>
                  <p className={`text-sm font-bold ${
                    item.status === 'operational' || item.status === 'available' ? 'text-emerald-400'
                    : item.status === 'unknown' ? 'text-slate-500' : 'text-white'
                  }`}>
                    {item.status === 'operational' ? '● Operational'
                    : item.status === 'available'  ? '● Available'
                    : item.status === 'unknown'    ? '○ Unknown'
                    : item.status}
                  </p>
                </div>
              ))}
            </div>

            {/* Footer info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: <Cpu className="w-4 h-4 text-purple-400" />, title: 'Data Source', value: 'Amazon CloudWatch · EC2 IAM Role · ap-south-1' },
                { icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, title: 'Security', value: 'Admin-only endpoint · Bearer token · No public access' },
                { icon: <RefreshCw className="w-4 h-4 text-sky-400" />, title: 'Granularity', value: '5-minute periods · 30-second page refresh' },
              ].map(item => (
                <div key={item.title} className="rounded-xl border border-purple-900/30 bg-purple-950/10 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    {item.icon}
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{item.title}</span>
                  </div>
                  <p className="text-slate-300 text-xs">{item.value}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
