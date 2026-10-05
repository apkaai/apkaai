'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle, Video, Calendar, ExternalLink,
  Copy, Check, ArrowRight, Mail, Home
} from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

interface Booking {
  id: string
  name: string
  email: string
  company?: string
  slot_date: string
  slot_time: string
  slot_timezone: string
  duration_minutes: number
  status: string
  meeting_link?: string
  calendarLinks?: {
    googleUrl:    string
    outlookUrl:   string
    office365Url: string
    icsUrl:       string
    displayTime:  string
  }
}

function ConfirmContent() {
  const params      = useSearchParams()
  const bookingId   = params.get('id')
  const meetingLink = params.get('meeting') || ''

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied,  setCopied]  = useState(false)

  useEffect(() => {
    if (!bookingId) { setLoading(false); return }
    fetch(`${API}/demo/${bookingId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setBooking(d?.booking || null); setLoading(false) })
      .catch(() => setLoading(false))
  }, [bookingId])

  async function copyLink() {
    const link = meetingLink || booking?.meeting_link || ''
    if (!link) return
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400 animate-pulse">Loading confirmation...</div>
      </div>
    )
  }

  const meetLink    = meetingLink || booking?.meeting_link || ''
  const displayTime = booking?.calendarLinks?.displayTime || `${booking?.slot_date} at ${booking?.slot_time}`
  const cal         = booking?.calendarLinks

  return (
    <div className="min-h-screen pt-20 pb-24 px-4">
      <div className="max-w-lg mx-auto pt-8">

        {/* Success icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-emerald-900/20 border border-emerald-700/30 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Demo Confirmed! 🎉</h1>
          <p className="text-slate-400">
            A confirmation email with the meeting link has been sent to{' '}
            <span className="text-purple-300 font-semibold">{booking?.email || 'your email'}</span>.
          </p>
        </div>

        {/* Booking details card */}
        <div className="glow-border rounded-2xl bg-[#0F0A1E] p-6 mb-5">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" /> Booking Details
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Date & Time</span>
              <span className="text-white font-semibold text-right max-w-[60%]">{displayTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Duration</span>
              <span className="text-white">{booking?.duration_minutes || 30} minutes</span>
            </div>
            {booking?.name && (
              <div className="flex justify-between">
                <span className="text-slate-400">Name</span>
                <span className="text-white">{booking.name}</span>
              </div>
            )}
            {booking?.company && (
              <div className="flex justify-between">
                <span className="text-slate-400">Company</span>
                <span className="text-white">{booking.company}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Booking ID</span>
              <span className="text-purple-300 font-mono text-xs">{bookingId?.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Meeting link card */}
        {meetLink && (
          <div className="glow-border rounded-2xl bg-[#0F0A1E] p-6 mb-5">
            <h2 className="text-white font-bold mb-3 flex items-center gap-2">
              <Video className="w-5 h-5 text-purple-400" /> Meeting Link
            </h2>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-950/30 border border-purple-800/30 mb-3">
              <span className="text-purple-300 text-xs font-mono flex-1 truncate">{meetLink}</span>
              <button onClick={copyLink} className="flex-shrink-0 text-slate-400 hover:text-purple-300 transition-colors">
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <a
              href={meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full btn-primary flex items-center justify-center gap-2 text-white font-bold py-3 rounded-xl text-sm"
            >
              <Video className="w-4 h-4" /> Join Meeting
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        )}

        {/* Add to calendar */}
        {cal && (
          <div className="glow-border rounded-2xl bg-[#0F0A1E] p-6 mb-5">
            <h2 className="text-white font-bold mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" /> Add to Calendar
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <a
                href={cal.googleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-blue-700/40 bg-blue-900/10 text-blue-300 hover:bg-blue-900/20 text-sm font-semibold transition-all"
              >
                📅 Google Calendar
              </a>
              <a
                href={cal.outlookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-sky-700/40 bg-sky-900/10 text-sky-300 hover:bg-sky-900/20 text-sm font-semibold transition-all"
              >
                📅 Outlook
              </a>
              <a
                href={cal.office365Url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-sky-700/40 bg-sky-900/10 text-sky-300 hover:bg-sky-900/20 text-sm font-semibold transition-all"
              >
                📅 Office 365
              </a>
              <a
                href={cal.icsUrl}
                download="apkaai-demo.ics"
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-700/40 bg-slate-800/20 text-slate-300 hover:bg-slate-700/20 text-sm font-semibold transition-all"
              >
                🍎 Apple Calendar
              </a>
            </div>
          </div>
        )}

        {/* Reminder note */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-950/20 border border-purple-900/30 mb-6">
          <Mail className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <p className="text-slate-400 text-sm">
            You&apos;ll receive automatic reminders <strong className="text-white">24 hours</strong> and{' '}
            <strong className="text-white">1 hour</strong> before the demo via email.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 border border-purple-700/40 hover:border-purple-500 text-slate-300 hover:text-white font-semibold py-3 rounded-xl text-sm transition-all"
          >
            <Home className="w-4 h-4" /> Back to Home
          </Link>
          <Link
            href="/tools"
            className="flex-1 flex items-center justify-center gap-2 btn-primary text-white font-bold py-3 rounded-xl text-sm"
          >
            Explore AI Tools <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400 animate-pulse">Loading...</div>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  )
}
