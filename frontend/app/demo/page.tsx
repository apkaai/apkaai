'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar, Clock, User, Mail, Building2, Phone,
  MessageSquare, ChevronLeft, ChevronRight, ArrowRight,
  Loader2, CheckCircle, Video, Shield, Zap, Star
} from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Slot { time: string; available: boolean; label: string }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}
function toYMD(date: Date) {
  return date.toISOString().slice(0, 10)
}
function formatDisplayDate(ymd: string) {
  return new Date(ymd + 'T12:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}
function isWeekend(date: Date) {
  return date.getDay() === 0 || date.getDay() === 6
}

// ─── Calendar strip ───────────────────────────────────────────────────────────
function DateStrip({
  selected, onSelect,
}: { selected: string; onSelect: (ymd: string) => void }) {
  const today   = new Date()
  const [offset, setOffset] = useState(0)
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, offset + i))

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setOffset(o => Math.max(0, o - 7))}
          disabled={offset === 0}
          className="p-1.5 rounded-lg border border-purple-800/40 text-slate-400 hover:text-white hover:border-purple-500 disabled:opacity-30 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-slate-300 text-sm font-medium">
          {days[0].toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        </span>
        <button
          onClick={() => setOffset(o => o + 7)}
          className="p-1.5 rounded-lg border border-purple-800/40 text-slate-400 hover:text-white hover:border-purple-500 transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map(day => {
          const ymd       = toYMD(day)
          const weekend   = isWeekend(day)
          const isPast    = day < today && toYMD(day) !== toYMD(today)
          const disabled  = weekend || isPast
          const isActive  = ymd === selected

          return (
            <button
              key={ymd}
              onClick={() => !disabled && onSelect(ymd)}
              disabled={disabled}
              className={`flex flex-col items-center py-2.5 rounded-xl text-center transition-all ${
                isActive
                  ? 'bg-purple-600 border border-purple-500 text-white'
                  : disabled
                  ? 'opacity-30 cursor-not-allowed text-slate-600'
                  : 'border border-purple-900/30 text-slate-300 hover:border-purple-600 hover:bg-purple-900/20'
              }`}
            >
              <span className="text-[10px] font-medium uppercase tracking-wide">
                {day.toLocaleDateString('en-IN', { weekday: 'short' }).slice(0, 3)}
              </span>
              <span className={`text-base font-bold mt-0.5 ${isActive ? 'text-white' : ''}`}>
                {day.getDate()}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Time slot grid ───────────────────────────────────────────────────────────
function TimeSlotGrid({
  slots, selected, onSelect, loading,
}: { slots: Slot[]; selected: string; onSelect: (t: string) => void; loading: boolean }) {
  if (loading) return (
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="h-10 rounded-xl bg-purple-900/10 animate-pulse" />
      ))}
    </div>
  )

  const available = slots.filter(s => s.available)
  if (available.length === 0) return (
    <div className="text-center py-8 text-slate-400 text-sm">
      No slots available for this date. Please choose another day.
    </div>
  )

  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map(slot => (
        <button
          key={slot.time}
          onClick={() => slot.available && onSelect(slot.time)}
          disabled={!slot.available}
          className={`py-2.5 px-2 rounded-xl text-xs font-semibold text-center transition-all ${
            slot.time === selected
              ? 'bg-purple-600 border border-purple-500 text-white'
              : slot.available
              ? 'border border-purple-900/40 text-slate-300 hover:border-purple-500 hover:bg-purple-900/20'
              : 'opacity-30 cursor-not-allowed border border-purple-900/20 text-slate-600 line-through'
          }`}
        >
          {slot.label}
        </button>
      ))}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DemoPage() {
  const router = useRouter()

  // Step: 1 = pick date/time, 2 = fill details
  const [step, setStep] = useState(1)

  // Date/time
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [slots, setSlots]               = useState<Slot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)

  // Form
  const [form, setForm] = useState({
    name: '', email: '', company: '', phone: '', use_case: '',
    calendar_type: 'google',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')

  // Load slots when date changes
  const fetchSlots = useCallback(async (date: string) => {
    if (!date) return
    setSlotsLoading(true)
    try {
      const res  = await fetch(`${API}/demo/slots?date=${date}`)
      const data = await res.json()
      setSlots(data.slots || [])
      setSelectedTime('')
    } catch { setSlots([]) }
    setSlotsLoading(false)
  }, [])

  useEffect(() => {
    if (selectedDate) fetchSlots(selectedDate)
  }, [selectedDate, fetchSlots])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email) { setError('Name and email are required'); return }
    if (!selectedDate || !selectedTime) { setError('Please select a date and time'); return }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch(`${API}/demo/book`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...form,
          slot_date:     selectedDate,
          slot_time:     selectedTime,
          slot_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
          duration_minutes: 30,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Booking failed')
      router.push(`/demo/confirm?id=${data.bookingId}&meeting=${encodeURIComponent(data.meetingLink || '')}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-24 px-4">
      <div className="max-w-5xl mx-auto">

        {/* ── Hero ── */}
        <div className="text-center mb-12 pt-8">
          <div className="inline-flex items-center gap-2 bg-purple-900/40 border border-purple-700/50 rounded-full px-4 py-2 text-sm text-purple-300 mb-6">
            <Video className="w-4 h-4" />
            Free 30-minute demo
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Book a Demo with
            <span className="block bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent mt-1">
              ApkaAI Team
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            See ApkaAI in action — 100+ AI tools, cloud cost intelligence, and enterprise features. 
            Takes 30 minutes. No commitment.
          </p>
        </div>

        {/* ── Value props ── */}
        <div className="grid grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto">
          {[
            { icon: <Zap className="w-4 h-4" />,    text: 'Live product walkthrough' },
            { icon: <Shield className="w-4 h-4" />, text: 'No credit card required' },
            { icon: <Star className="w-4 h-4" />,   text: 'Tailored to your use case' },
          ].map(v => (
            <div key={v.text} className="flex items-center gap-2 text-sm text-slate-400 p-3 rounded-xl bg-purple-950/20 border border-purple-900/30">
              <span className="text-purple-400 flex-shrink-0">{v.icon}</span>
              {v.text}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Left: Date + Time ── */}
          <div className="lg:col-span-3 space-y-6">
            <div className="glow-border rounded-2xl bg-[#0F0A1E] p-6">
              <h2 className="text-white font-bold text-base mb-5 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" /> Select a Date
              </h2>
              <DateStrip selected={selectedDate} onSelect={setSelectedDate} />
            </div>

            {selectedDate && (
              <div className="glow-border rounded-2xl bg-[#0F0A1E] p-6">
                <h2 className="text-white font-bold text-base mb-1 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" /> Available Times
                </h2>
                <p className="text-slate-500 text-xs mb-4">{formatDisplayDate(selectedDate)} · IST (UTC+5:30)</p>
                <TimeSlotGrid
                  slots={slots}
                  selected={selectedTime}
                  onSelect={setSelectedTime}
                  loading={slotsLoading}
                />
              </div>
            )}
          </div>

          {/* ── Right: Details form ── */}
          <div className="lg:col-span-2">
            <div className="glow-border rounded-2xl bg-[#0F0A1E] p-6 sticky top-24">
              {selectedDate && selectedTime ? (
                <>
                  {/* Selected slot summary */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-600/20 border border-purple-600/40 mb-6">
                    <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    <div>
                      <p className="text-white text-sm font-semibold">{formatDisplayDate(selectedDate)}</p>
                      <p className="text-purple-300 text-xs">{slots.find(s => s.time === selectedTime)?.label} IST · 30 min</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Ashutosh Kumar Pandey"
                        className="w-full bg-purple-950/40 border border-purple-800/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" /> Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="you@company.com"
                        className="w-full bg-purple-950/40 border border-purple-800/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                      />
                    </div>

                    {/* Company */}
                    <div>
                      <label className="text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" /> Company
                      </label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                        placeholder="Your company name"
                        className="w-full bg-purple-950/40 border border-purple-800/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" /> Phone (optional)
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="+91 98765 43210"
                        className="w-full bg-purple-950/40 border border-purple-800/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                      />
                    </div>

                    {/* Use case */}
                    <div>
                      <label className="text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" /> What do you want to explore?
                      </label>
                      <textarea
                        value={form.use_case}
                        onChange={e => setForm(f => ({ ...f, use_case: e.target.value }))}
                        placeholder="e.g. AI tools for our marketing team, cloud cost comparison..."
                        rows={2}
                        className="w-full bg-purple-950/40 border border-purple-800/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition resize-none"
                      />
                    </div>

                    {/* Calendar preference */}
                    <div>
                      <label className="text-xs text-slate-400 font-medium mb-2 block">Meeting via</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'google', label: '🟢 Google Meet' },
                          { id: 'teams',  label: '🔵 Teams' },
                          { id: 'none',   label: '🔗 Any' },
                        ].map(opt => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, calendar_type: opt.id }))}
                            className={`py-2 px-2 rounded-lg text-xs font-medium border transition-all ${
                              form.calendar_type === opt.id
                                ? 'border-purple-500 bg-purple-600/20 text-purple-300'
                                : 'border-purple-900/30 text-slate-400 hover:border-purple-700/40'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Error */}
                    {error && (
                      <p className="text-red-400 text-xs bg-red-900/20 border border-red-700/30 rounded-lg px-3 py-2">
                        {error}
                      </p>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full btn-primary text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                    >
                      {submitting
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Confirming...</>
                        : <>Book Demo <ArrowRight className="w-4 h-4" /></>
                      }
                    </button>

                    <p className="text-center text-slate-600 text-xs">
                      By booking you agree to our <Link href="/privacy" className="text-purple-500 hover:text-purple-400">Privacy Policy</Link>.
                      You&apos;ll receive a confirmation email with the meeting link.
                    </p>
                  </form>
                </>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-10 h-10 text-purple-400/50 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Select a date and time to continue</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
