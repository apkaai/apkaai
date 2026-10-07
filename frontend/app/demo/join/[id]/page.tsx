'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Video, Calendar, Clock, Mail, ArrowRight, Loader2 } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

interface Booking {
  id: string
  name: string
  email: string
  slot_date: string
  slot_time: string
  slot_timezone: string
  duration_minutes: number
  status: string
  meeting_link: string | null
}

function safeFormatDate(ymd: string): string {
  if (!ymd) return ''
  try {
    const clean = ymd.includes('T') ? ymd.split('T')[0] : ymd
    const d = new Date(clean + 'T12:00:00')
    if (isNaN(d.getTime())) return ymd
    return d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  } catch { return ymd }
}

function safeFormatTime(hhmm: string): string {
  if (!hhmm) return ''
  try {
    const parts = hhmm.split(':').map(Number)
    const h = parts[0], m = parts[1] || 0
    if (isNaN(h)) return hhmm
    return `${h > 12 ? h - 12 : h === 0 ? 12 : h}:${m.toString().padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'} IST`
  } catch { return hhmm }
}

export default function DemoJoinPage({ params }: { params: { id: string } }) {
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (!params.id) { setLoading(false); return }
    fetch(`${API}/demo/${params.id}`)
      .then(r => r.ok ? r.json() : Promise.reject('Not found'))
      .then(d => { setBooking(d.booking || null); setLoading(false) })
      .catch(() => { setError('Booking not found'); setLoading(false) })
  }, [params.id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
    </div>
  )

  if (error || !booking) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-900/20 border border-red-700/30 flex items-center justify-center mx-auto mb-4">
          <Video className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Meeting Not Found</h1>
        <p className="text-slate-400 text-sm mb-6">
          This meeting link may have expired or the booking ID is invalid.
          Please check your confirmation email for the correct link.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/demo" className="btn-primary flex items-center justify-center gap-2 text-white font-bold py-3 rounded-xl text-sm">
            Book a New Demo <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="mailto:ashutoshkumarpandey@apkaai.com"
            className="border border-purple-700/40 hover:border-purple-500 text-slate-300 hover:text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all">
            <Mail className="w-4 h-4" /> Contact Support
          </a>
        </div>
      </div>
    </div>
  )

  // Check if demo is in the future
  const slotDateClean = booking.slot_date?.includes('T') ? booking.slot_date.split('T')[0] : booking.slot_date
  const slotDateTime  = new Date(`${slotDateClean}T${booking.slot_time || '10:00:00'}`)
  const isPast        = slotDateTime < new Date()
  const isCancelled   = booking.status === 'cancelled'

  return (
    <div className="min-h-screen pt-20 pb-24 px-4">
      <div className="max-w-lg mx-auto pt-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 ${
            isCancelled ? 'bg-red-900/20 border border-red-700/30' :
            isPast      ? 'bg-slate-800/40 border border-slate-700/30' :
                          'bg-purple-900/20 border border-purple-700/30'
          }`}>
            <Video className={`w-10 h-10 ${isCancelled ? 'text-red-400' : isPast ? 'text-slate-400' : 'text-purple-400'}`} />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">
            {isCancelled ? 'Demo Cancelled' : isPast ? 'Demo Has Passed' : 'Your Demo Meeting'}
          </h1>
          <p className="text-slate-400 text-sm">
            {isCancelled
              ? 'This demo booking has been cancelled.'
              : isPast
              ? 'This meeting has already taken place.'
              : `Hi ${booking.name}! Your demo is coming up soon.`
            }
          </p>
        </div>

        {/* Booking details */}
        <div className="glow-border rounded-2xl bg-[#0F0A1E] p-6 mb-5">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" /> Meeting Details
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Date</span>
              <span className="text-white font-semibold">{safeFormatDate(booking.slot_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Time</span>
              <span className="text-white font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                {safeFormatTime(booking.slot_time)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Duration</span>
              <span className="text-white">{booking.duration_minutes || 30} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Name</span>
              <span className="text-white">{booking.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Booking ID</span>
              <span className="text-purple-300 font-mono text-xs">{booking.id.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Join button or message */}
        {!isCancelled && !isPast && (
          <div className="glow-border rounded-2xl bg-[#0F0A1E] p-6 mb-5">
            <h2 className="text-white font-bold mb-3">Join the Meeting</h2>
            {booking.meeting_link && !booking.meeting_link.includes('/demo/join/') ? (
              <>
                <p className="text-slate-400 text-sm mb-4">
                  Your meeting is ready. Click the button below to join at the scheduled time.
                </p>
                <a
                  href={booking.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full btn-primary flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-xl text-sm"
                >
                  <Video className="w-4 h-4" /> Join Meeting Now
                </a>
              </>
            ) : (
              <div className="p-4 rounded-xl bg-amber-900/20 border border-amber-700/30">
                <p className="text-amber-300 text-sm font-semibold mb-1">Meeting link being set up</p>
                <p className="text-amber-400/80 text-xs">
                  Your host will share the meeting link shortly via email to{' '}
                  <strong className="text-amber-300">{booking.email}</strong>.
                  Check your inbox closer to the demo time.
                </p>
              </div>
            )}
          </div>
        )}

        {/* What to expect */}
        {!isCancelled && !isPast && (
          <div className="glow-border rounded-2xl bg-[#0F0A1E] p-5 mb-6">
            <h3 className="text-white font-semibold text-sm mb-3">What to expect</h3>
            <ul className="space-y-2">
              {[
                '🔍 Live walkthrough of 100+ AI tools',
                '☁️ Cloud cost comparison across AWS, Azure, GCP',
                '🛒 How to manage subscriptions on ApkaAI',
                '❓ Q&A tailored to your use case',
              ].map(item => (
                <li key={item} className="text-slate-400 text-xs flex items-start gap-2">
                  <span>{item.slice(0, 2)}</span>
                  <span>{item.slice(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/" className="flex-1 flex items-center justify-center gap-2 border border-purple-700/40 hover:border-purple-500 text-slate-300 hover:text-white font-semibold py-3 rounded-xl text-sm transition-all">
            Back to Home
          </Link>
          {(isCancelled || isPast) && (
            <Link href="/demo" className="flex-1 flex items-center justify-center gap-2 btn-primary text-white font-bold py-3 rounded-xl text-sm">
              Book New Demo <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

      </div>
    </div>
  )
}
