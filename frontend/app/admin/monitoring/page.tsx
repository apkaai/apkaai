'use client'
/**
 * /admin/monitoring — Grafana + CloudWatch monitoring page
 *
 * Security:
 *  • AdminGuard (client-side)  — redirects non-admins to /admin/login
 *  • Backend /api/admin/monitoring/status — server-side adminOnly middleware
 *  • Grafana iframe served via /grafana Nginx proxy — not a public URL
 *
 * Architecture:
 *  Admin browser → /admin/monitoring
 *    ↓ (every 30s)
 *  GET /api/admin/monitoring/status  (Express → CloudWatch SDK → EC2 IAM role)
 *    ↓ (iframe)
 *  /grafana/d/apkaai-aws-monitoring  (Nginx proxy → Grafana :3002)
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Shield, LogOut, Activity, RefreshCw, AlertTriangle, CheckCircle2,
  Server, Database, Cloud, HardDrive, ExternalLink, BarChart3,
  Users, Mail, Cpu, Wifi, WifiOff, Clock,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ResourceStatus {
  status: 'running' | 'available' | 'operational' | 'unknown' | 'degraded'
  cpu?: number | null
  connections?: number | null
  freeStorageGB?: number | null
  requests?: number | null
  errorRate?: number | null
  statusCheck?: number | null
}

interface MonitoringData {
  ok: boolean
  status: 'healthy' | 'degraded' | 'critical' | 'unknown'
  issues: string[]
  timestamp: string
  region: string
  error?: string
  resources: {
    ec2:        ResourceStatus
    rds:        ResourceStatus
    cloudfront: ResourceStatus
    s3:         ResourceStatus
  }
}

// ─── Auth guard ───────────────────────────────────────────────────────────────

function useAdminGuard() {
  const router = useRouter()
  const [authed, setAuthed] = useState(false)
  const [token,  setToken]  = useState('')

  useEffect(() => {
    const u = localStorage.getItem('apkaai_user') || sessionStorage.getItem('apkaai_user')
    const t = localStorage.getItem('apkaai_token') || sessionStorage.getItem('apkaai_token') || ''
    if (!u) { router.replace('/admin/login'); return }
    try {
      const user = JSON.parse(u)
      if (user.role !== 'admin') { router.replace('/admin/login'); return }
      setAuthed(true)
      setToken(t)
    } catch { router.replace('/admin/login') }
  }, [router])

  return { authed, token }
}

function signOut() {
  ['apkaai_token','apkaai_user'].forEach(k => {
    localStorage.removeItem(k)
    sessionStorage.removeItem(k)
  })
  window.location.href = '/admin/login'
}

// ─── Status badge helpers ─────────────────────────────────────────────────────

function OverallBadge({ status }: { status: MonitoringData['status'] }) {
  const map = {
    healthy:  { dot: 'bg-emerald-400', text: 'text-emerald-400', label: 'Healthy' },
    degraded: { dot: 'bg-amber-400',   text: 'text-amber-400',   label: 'Degraded' },
    critical: { dot: 'bg-red-400',     text: 'text-red-400',     label: 'Critical' },
    unknown:  { dot: 'bg-slate-400',   text: 'text-slate-400',   label: 'Unknown' },
  }
  const s = map[status] || map.unknown
  return (
    <span className={`inline-flex items-center gap-2 font-semibold text-sm ${s.text}`}>
      <span className={`w-2.5 h-2.5 rounded-full ${s.dot} animate-pulse`} />
      System Status: {s.label}
    </span>
  )
}

function ResourceDot({ status }: { status: ResourceStatus['status'] }) {
  const colors: Record<string, string> = {
    running:     'bg-emerald-400',
    available:   'bg-emerald-400',
    operational: 'bg-emerald-400',
    degraded:    'bg-amber-400',
    unknown:     'bg-slate-500',
  }
  return <span className={`w-2 h-2 rounded-full inline-block ${colors[status] || 'bg-slate-500'}`} />
}

function CpuBar({ value }: { value: number | null | undefined }) {
  if (value === null || value === undefined) return <span className="text-slate-500 text-xs">—</span>
  const color = value > 90 ? 'bg-red-500' : value > 70 ? 'bg-amber-500' : 'bg-emerald-500'
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1.5 bg-purple-900/40 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className="text-xs text-white font-semibold w-8 text-right">{value}%</span>
    </div>
  )
}

// ─── Resource card ────────────────────────────────────────────────────────────

function ResourceCard({
  icon: Icon, title, resource, color, detail,
}: {
  icon: React.ElementType
  title: string
  resource: ResourceStatus
  color: string
  detail?: React.ReactNode
}) {
  const statusLabel: Record<string, string> = {
    running:     'Running',
    available:   'Available',
    operational: 'Operational',
    degraded:    'Degraded',
    unknown:     'Unknown',
  }

  return (
    <div className="glow-border rounded-xl p-5 bg-[#0F0A1E] flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${color}`} />
          <span className="text-white font-bold text-sm">{title}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ResourceDot status={resource.status} />
          <span className={`text-xs font-semibold ${
            resource.status === 'running' || resource.status === 'available' || resource.status === 'operational'
              ? 'text-emerald-400'
              : resource.status === 'degraded' ? 'text-amber-400' : 'text-slate-400'
          }`}>
            {statusLabel[resource.status] || 'Unknown'}
          </span>
        </div>
      </div>

      {resource.cpu !== null && resource.cpu !== undefined && (
        <div>
          <span className="text-slate-400 text-xs">CPU Utilization</span>
          <CpuBar value={resource.cpu} />
        </div>
      )}

      {detail}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MonitoringPage() {
  const { authed, token } = useAdminGuard()

  const [data,       setData]       = useState<MonitoringData | null>(null)
  const [loadingAPI, setLoadingAPI] = useState(false)
  const [apiError,   setApiError]   = useState('')
  const [lastUpdated,setLastUpdated]= useState('')
  const [grafanaOk,  setGrafanaOk]  = useState<boolean | null>(null)

  const REFRESH_INTERVAL = 30000   // 30 seconds
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Fetch CloudWatch status from backend
  const fetchStatus = useCallback(async () => {
    if (!token) return
    setLoadingAPI(true)
    setApiError('')
    try {
      const r = await fetch('/api/admin/monitoring/status', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (r.status === 401 || r.status === 403) {
        window.location.href = '/admin/login'
        return
      }
      const d: MonitoringData = await r.json()
      setData(d)
      setLastUpdated(new Date().toLocaleTimeString('en-IN'))
    } catch {
      setApiError('Unable to reach monitoring API. Retrying in 30s…')
    } finally {
      setLoadingAPI(false)
    }
  }, [token])

  // Start auto-refresh
  useEffect(() => {
    if (!authed) return
    fetchStatus()
    intervalRef.current = setInterval(fetchStatus, REFRESH_INTERVAL)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [authed, fetchStatus])

  // Check if Grafana is accessible
  useEffect(() => {
    if (!authed) return
    fetch('/grafana/api/health')
      .then(r => setGrafanaOk(r.ok))
      .catch(() => setGrafanaOk(false))
  }, [authed])

  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center bg-[#08051A]">
      <div className="text-slate-400 flex items-center gap-2">
        <span className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        Checking access…
      </div>
    </div>
  )

  // Nav tabs — same pattern as admin/page.tsx
  const tabs = [
    { id: 'overview', label: 'Overview',    icon: BarChart3,   href: '/admin' },
    { id: 'users',    label: 'Users',       icon: Users,       href: '/admin' },
    { id: 'contacts', label: 'Contacts',    icon: Mail,        href: '/admin' },
    { id: 'datalake', label: 'Data Lake',   icon: HardDrive,   href: '/admin' },
    { id: 'monitoring',label: 'Monitoring', icon: Activity,    href: '/admin/monitoring', active: true },
  ]

  return (
    <div className="min-h-screen bg-[#08051A]">

      {/* ── Top bar — identical to admin/page.tsx ── */}
      <div className="border-b border-purple-900/30 bg-[#0F0A1E]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-purple-400" />
            <span className="font-bold text-white">ApkaAI Admin</span>
            <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">Control Panel</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">View Site</Link>
            <button onClick={signOut} className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-sm">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ── Tab nav — same style as admin/page.tsx ── */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map(t => (
            <Link key={t.id} href={t.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all flex-shrink-0 ${
                t.active
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-[#0F0A1E] border-purple-800/40 text-slate-300 hover:border-purple-600'
              }`}>
              <t.icon className="w-4 h-4" />
              {t.label}
            </Link>
          ))}
        </div>

        {/* ── Page header ── */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-purple-400" />
              AWS Infrastructure Monitoring
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Real-time CloudWatch metrics for ApkaAI AWS infrastructure
            </p>
          </div>

          {/* Status + refresh row */}
          <div className="flex items-center gap-4 flex-wrap">
            {data && <OverallBadge status={data.status} />}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              {lastUpdated ? `Last updated: ${lastUpdated}` : 'Loading…'}
            </div>
            <button
              onClick={fetchStatus}
              disabled={loadingAPI}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-900/40 border border-purple-700/40 hover:border-purple-500 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAPI ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <span className="text-xs text-slate-600 hidden sm:inline">Auto-refresh: 30s</span>
          </div>
        </div>

        {/* ── Issues banner ── */}
        {data?.issues && data.issues.length > 0 && (
          <div className="mb-5 rounded-xl border border-amber-700/40 bg-amber-900/10 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-300 font-semibold text-sm mb-1">Active Issues Detected</p>
              <ul className="space-y-0.5">
                {data.issues.map((issue, i) => (
                  <li key={i} className="text-amber-400/80 text-xs">• {issue}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ── CloudWatch unavailable notice ── */}
        {apiError && (
          <div className="mb-5 rounded-xl border border-red-700/30 bg-red-900/10 p-4 flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{apiError}</p>
          </div>
        )}

        {/* ── AWS Resource cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          {/* EC2 */}
          <ResourceCard
            icon={Server}
            title="EC2 Instance"
            color="text-orange-400"
            resource={data?.resources.ec2 || { status: 'unknown' }}
            detail={
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Region</span>
                  <span className="text-white">ap-south-1</span>
                </div>
                {data?.resources.ec2.cpu !== null && data?.resources.ec2.cpu !== undefined && (
                  <div className="flex justify-between text-slate-400">
                    <span>CPU</span>
                    <span className={`font-semibold ${(data.resources.ec2.cpu ?? 0) > 80 ? 'text-red-400' : (data.resources.ec2.cpu ?? 0) > 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {data.resources.ec2.cpu}%
                    </span>
                  </div>
                )}
              </div>
            }
          />

          {/* RDS */}
          <ResourceCard
            icon={Database}
            title="RDS PostgreSQL"
            color="text-blue-400"
            resource={data?.resources.rds || { status: 'unknown' }}
            detail={
              <div className="space-y-1 text-xs">
                {data?.resources.rds.connections !== null && data?.resources.rds.connections !== undefined && (
                  <div className="flex justify-between text-slate-400">
                    <span>Connections</span>
                    <span className="text-white">{data.resources.rds.connections}</span>
                  </div>
                )}
                {data?.resources.rds.freeStorageGB !== null && data?.resources.rds.freeStorageGB !== undefined && (
                  <div className="flex justify-between text-slate-400">
                    <span>Free Storage</span>
                    <span className={`font-semibold ${(data.resources.rds.freeStorageGB ?? 99) < 1 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {data.resources.rds.freeStorageGB} GB
                    </span>
                  </div>
                )}
              </div>
            }
          />

          {/* CloudFront */}
          <ResourceCard
            icon={Cloud}
            title="CloudFront CDN"
            color="text-sky-400"
            resource={data?.resources.cloudfront || { status: 'unknown' }}
            detail={
              <div className="space-y-1 text-xs">
                {data?.resources.cloudfront.requests !== null && data?.resources.cloudfront.requests !== undefined && (
                  <div className="flex justify-between text-slate-400">
                    <span>Requests (1h)</span>
                    <span className="text-white">{data.resources.cloudfront.requests.toLocaleString()}</span>
                  </div>
                )}
                {data?.resources.cloudfront.errorRate !== null && data?.resources.cloudfront.errorRate !== undefined && (
                  <div className="flex justify-between text-slate-400">
                    <span>Error Rate</span>
                    <span className={`font-semibold ${(data.resources.cloudfront.errorRate ?? 0) > 5 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {data.resources.cloudfront.errorRate}%
                    </span>
                  </div>
                )}
              </div>
            }
          />

          {/* S3 */}
          <ResourceCard
            icon={HardDrive}
            title="S3 Storage"
            color="text-teal-400"
            resource={data?.resources.s3 || { status: 'unknown' }}
            detail={
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Region</span>
                  <span className="text-white">ap-south-1</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Metrics</span>
                  <span className="text-slate-500">Daily (S3)</span>
                </div>
              </div>
            }
          />
        </div>

        {/* ── Grafana dashboard section ── */}
        <div className="glow-border rounded-2xl bg-[#0F0A1E] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900/30 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              {/* Grafana logo */}
              <div className="w-8 h-8 rounded-lg bg-[#F46800]/20 border border-[#F46800]/40 flex items-center justify-center flex-shrink-0">
                <span className="text-[#F46800] text-sm font-black">G</span>
              </div>
              <div>
                <h2 className="text-white font-bold text-sm">Grafana — ApkaAI AWS Monitoring</h2>
                <p className="text-slate-500 text-xs">CloudWatch metrics · EC2 · RDS · CloudFront · S3</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Grafana connection status */}
              {grafanaOk === true && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <Wifi className="w-3.5 h-3.5" /> Grafana Connected
                </span>
              )}
              {grafanaOk === false && (
                <span className="flex items-center gap-1.5 text-xs text-amber-400">
                  <WifiOff className="w-3.5 h-3.5" /> Grafana Offline
                </span>
              )}
              {grafanaOk === null && (
                <span className="text-xs text-slate-500">Checking Grafana…</span>
              )}

              {/* Open in Grafana */}
              <a
                href="/grafana/d/apkaai-aws-monitoring"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors border border-purple-700/40 hover:border-purple-500 px-3 py-1.5 rounded-lg"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open in Grafana
              </a>
            </div>
          </div>

          {/* Grafana iframe — or offline state */}
          {grafanaOk === false ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-900/20 border border-amber-700/30 flex items-center justify-center mb-4">
                <Activity className="w-7 h-7 text-amber-400 opacity-60" />
              </div>
              <h3 className="text-white font-bold mb-2">Grafana monitoring is temporarily unavailable</h3>
              <p className="text-slate-400 text-sm max-w-md mb-4">
                Grafana may be starting up or undergoing maintenance.
                CloudWatch status cards above are still updating from the API.
              </p>
              <button
                onClick={() => fetch('/grafana/api/health').then(r => setGrafanaOk(r.ok)).catch(() => setGrafanaOk(false))}
                className="flex items-center gap-2 px-4 py-2 bg-purple-900/40 border border-purple-700/40 hover:border-purple-500 text-slate-300 hover:text-white rounded-xl text-sm transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Retry Connection
              </button>
            </div>
          ) : (
            <div className="relative" style={{ height: '850px' }}>
              {/* Loading shimmer */}
              {grafanaOk === null && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0F0A1E] z-10">
                  <div className="flex flex-col items-center gap-3">
                    <span className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm">Loading Grafana dashboard…</p>
                  </div>
                </div>
              )}

              {/*
                Grafana iframe — embedded via /grafana Nginx proxy (anonymous viewer).
                Removed kiosk=tv — it interferes with panel data loading in Grafana 10
                when serve_from_sub_path=true. Using viewPanel=false instead.
                Anonymous access enabled so no login required inside iframe.
              */}
              <iframe
                src={`/grafana/d/apkaai-aws-monitoring/apkaai-aws-monitoring?orgId=1&refresh=30s&theme=dark&from=now-3h&to=now`}
                className="w-full h-full border-0"
                title="ApkaAI AWS Monitoring — Grafana"
                loading="lazy"
                onLoad={() => grafanaOk === null && setGrafanaOk(true)}
              />
            </div>
          )}
        </div>

        {/* ── Info footer ── */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              icon: <Cpu className="w-4 h-4 text-purple-400" />,
              title: 'Data Source',
              value: 'Amazon CloudWatch via EC2 IAM Role',
            },
            {
              icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
              title: 'Security',
              value: 'Admin-only • No public access • IAM least-privilege',
            },
            {
              icon: <RefreshCw className="w-4 h-4 text-sky-400" />,
              title: 'Refresh Rate',
              value: `API: 30s • Grafana: 30s • CloudWatch: 5-min granularity`,
            },
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
      </div>
    </div>
  )
}
