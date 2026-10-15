'use client'
export const dynamic = 'force-dynamic'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Brain, MessageSquare, FileText, BarChart2, Sparkles,
  Paperclip, Send, RefreshCw, Copy, Check, ChevronDown,
  ChevronUp, Loader2, AlertCircle, X, FileImage,
  FileSpreadsheet, File, BookOpen
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────
interface Message { role: 'user' | 'assistant'; text: string; file?: string }
interface Model    { id: string; name: string }

const API = process.env.NEXT_PUBLIC_API_URL || '/api'

const MODELS_DEFAULT: Model[] = [
  { id: 'amazon.nova-micro-v1:0',  name: 'Amazon Nova Micro'  },
  { id: 'amazon.nova-lite-v1:0',   name: 'Amazon Nova Lite'   },
  { id: 'amazon.nova-pro-v1:0',    name: 'Amazon Nova Pro'    },
]

const FEATURE_CHIPS = [
  'Multi-turn Chat', 'Text Summarisation', 'Sentiment & Entities',
  'Content Generation', 'Claude 3.5 + Nova',
]

function fileIcon (mime: string) {
  if (mime?.startsWith('image/'))       return <FileImage       className="w-4 h-4 text-pink-400" />
  if (mime?.includes('spreadsheet') || mime?.includes('csv')) return <FileSpreadsheet className="w-4 h-4 text-green-400" />
  if (mime?.includes('pdf') || mime?.includes('document'))    return <FileText         className="w-4 h-4 text-orange-400" />
  return <File className="w-4 h-4 text-slate-400" />
}

function getToken () {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('apkaai_token') || sessionStorage.getItem('apkaai_token')
}

function authHeaders (extra: Record<string, string> = {}): Record<string, string> {
  const t = getToken()
  const h: Record<string, string> = { ...extra }
  if (t) h['Authorization'] = `Bearer ${t}`
  return h
}

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyButton ({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all">
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function BedrockPage () {
  const [tab,       setTab]       = useState<'chat'|'summarise'|'analyse'|'generate'>('chat')
  const [models,    setModels]    = useState<Model[]>(MODELS_DEFAULT)
  const [modelId,   setModelId]   = useState('amazon.nova-lite-v1:0')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [infoOpen,  setInfoOpen]  = useState(false)
  const [token,     setToken]     = useState<string|null>(null)

  // Chat state
  const [messages,  setMessages]  = useState<Message[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatFile,  setChatFile]  = useState<File|null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Summarise state
  const [sumText,   setSumText]   = useState('')
  const [sumFile,   setSumFile]   = useState<File|null>(null)
  const [sumLength, setSumLength] = useState<'short'|'medium'|'long'>('medium')
  const [sumResult, setSumResult] = useState('')

  // Analyse state
  const [anaText,   setAnaText]   = useState('')
  const [anaFile,   setAnaFile]   = useState<File|null>(null)
  const [anaMode,   setAnaMode]   = useState<'general'|'sentiment'|'topics'|'entities'>('general')
  const [anaResult, setAnaResult] = useState<string|object>('')

  // Generate state
  const [genPrompt, setGenPrompt] = useState('')
  const [genType,   setGenType]   = useState<'text'|'code'|'email'|'blog'>('text')
  const [genResult, setGenResult] = useState('')

  useEffect(() => {
    setToken(getToken())
    // Fetch models
    fetch(`${API}/bedrock/models`).then(r => r.json()).then(d => {
      if (d.models) setModels(d.models)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Chat send ──────────────────────────────────────────────────────────────
  const sendChat = useCallback(async () => {
    if (!chatInput.trim() && !chatFile) return
    setError(''); setLoading(true)
    const userMsg: Message = { role: 'user', text: chatInput, file: chatFile?.name }
    setMessages(p => [...p, userMsg])
    setChatInput('')
    try {
      const fd = new FormData()
      fd.append('message', chatInput)
      fd.append('modelId', modelId)
      if (chatFile) fd.append('file', chatFile)
      setChatFile(null)
      const r = await fetch(`${API}/bedrock/chat`, {
        method: 'POST',
        headers: authHeaders(),
        body: fd,
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Failed')
      setMessages(p => [...p, { role: 'assistant', text: d.reply }])
    } catch (e: any) {
      setError(e.message)
      setMessages(p => [...p, { role: 'assistant', text: `❌ ${e.message}` }])
    } finally { setLoading(false) }
  }, [chatInput, chatFile, modelId])

  // ── Summarise ──────────────────────────────────────────────────────────────
  const runSummarise = async () => {
    if (!sumText.trim() && !sumFile) return
    setError(''); setLoading(true); setSumResult('')
    try {
      const fd = new FormData()
      fd.append('text', sumText)
      fd.append('modelId', modelId)
      fd.append('length', sumLength)
      if (sumFile) fd.append('file', sumFile)
      const r = await fetch(`${API}/bedrock/summarise`, {
        method: 'POST',
        headers: authHeaders(),
        body: fd,
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Failed')
      setSumResult(d.summary)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  // ── Analyse ────────────────────────────────────────────────────────────────
  const runAnalyse = async () => {
    if (!anaText.trim() && !anaFile) return
    setError(''); setLoading(true); setAnaResult('')
    try {
      const fd = new FormData()
      fd.append('text', anaText)
      fd.append('modelId', modelId)
      fd.append('mode', anaMode)
      if (anaFile) fd.append('file', anaFile)
      const r = await fetch(`${API}/bedrock/analyse`, {
        method: 'POST',
        headers: authHeaders(),
        body: fd,
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Failed')
      setAnaResult(d.analysis)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  // ── Generate ───────────────────────────────────────────────────────────────
  const runGenerate = async () => {
    if (!genPrompt.trim()) return
    setError(''); setLoading(true); setGenResult('')
    try {
      const r = await fetch(`${API}/bedrock/generate`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ prompt: genPrompt, modelId, type: genType }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Failed')
      setGenResult(d.generated)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const FileInput = ({ onChange, current, onClear }: { onChange: (f: File) => void; current: File|null; onClear: () => void }) => (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-700/40 text-slate-400 hover:text-white hover:border-purple-500 cursor-pointer text-xs transition-all">
        <Paperclip className="w-3.5 h-3.5" />
        Attach file
        <input type="file" className="hidden" accept=".pdf,.docx,.xlsx,.txt,.csv,.json,image/*"
          onChange={e => e.target.files?.[0] && onChange(e.target.files[0])} />
      </label>
      {current && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-900/30 border border-purple-700/30 text-xs text-purple-300">
          {fileIcon(current.type)}
          <span className="max-w-[120px] truncate">{current.name}</span>
          <button onClick={onClear} className="text-slate-500 hover:text-white ml-1"><X className="w-3 h-3" /></button>
        </div>
      )}
    </div>
  )

  if (!token) {
    return (
      <div className="min-h-screen bg-[#08051A] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-orange-400" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Sign in required</h2>
          <p className="text-slate-400 text-sm mb-6">Please sign in to use apkaAI Agent.</p>
          <a href="/signin" className="btn-primary text-white font-semibold px-6 py-3 rounded-xl inline-block">Sign In</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#08051A] px-4 py-6 max-w-4xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-4 mb-6 sticky top-16 z-10 bg-[#08051A]/95 backdrop-blur-sm py-3 -mx-4 px-4 border-b border-purple-900/20">
        <div className="w-12 h-12 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
          <Brain className="w-6 h-6 text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            apkaAI <span className="text-orange-400">Agent</span>
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Powered by RAH Infotech — Claude &amp; Amazon Nova · File attachment supported
          </p>
          <p className="text-slate-300 text-sm mt-2">
            Enterprise-grade AI via <span className="text-orange-400 font-semibold">AWS Bedrock</span>. Attach{' '}
            <span className="text-orange-400 font-semibold">PDF, DOCX, XLSX, CSV, TXT, JSON or images</span>{' '}
            to any feature.
          </p>
          {/* Feature chips */}
          <div className="flex flex-wrap gap-2 mt-3">
            {FEATURE_CHIPS.map(chip => (
              <span key={chip} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 border border-orange-500/20 text-orange-300">
                {chip === 'Multi-turn Chat'      && <MessageSquare  className="w-3 h-3" />}
                {chip === 'Text Summarisation'   && <FileText        className="w-3 h-3" />}
                {chip === 'Sentiment & Entities' && <BarChart2       className="w-3 h-3" />}
                {chip === 'Content Generation'   && <Sparkles        className="w-3 h-3" />}
                {chip === 'Claude 3.5 + Nova'    && <Brain           className="w-3 h-3" />}
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Model selector ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-4 overflow-x-auto">
        <span className="text-slate-500 text-sm">Model:</span>
        {models.map(m => (
          <button key={m.id} onClick={() => setModelId(m.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all whitespace-nowrap flex-shrink-0 ${
              modelId === m.id
                ? 'bg-orange-500/20 border-orange-500/60 text-orange-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
            }`}>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-600/30 text-orange-300 font-bold uppercase">
              {m.id.startsWith('amazon') ? 'Amazon' : 'Anthropic'}
            </span>
            {m.name}
            {modelId === m.id && <span className="text-orange-400">↑</span>}
          </button>
        ))}
        <button onClick={() => fetch(`${API}/bedrock/models`).then(r=>r.json()).then(d=>{ if(d.models) setModels(d.models) }).catch(()=>{})}
          className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-4 bg-white/5 rounded-xl p-1 w-fit">
        {(['chat','summarise','analyse','generate'] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); setError('') }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}>
            {t === 'chat'      && <MessageSquare className="w-4 h-4" />}
            {t === 'summarise' && <FileText       className="w-4 h-4" />}
            {t === 'analyse'   && <BarChart2      className="w-4 h-4" />}
            {t === 'generate'  && <Sparkles       className="w-4 h-4" />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Error banner ───────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-900/20 border border-red-700/40 text-red-300 text-sm mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
           CHAT TAB
         ══════════════════════════════════════════════════════════════════════ */}
      {tab === 'chat' && (
        <div className="flex flex-col gap-3">
          {/* Messages */}
          <div className="min-h-[300px] max-h-[480px] overflow-y-auto bg-[#0D0826]/60 border border-purple-900/30 rounded-2xl p-4 flex flex-col gap-3">
            {messages.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">
                Start a conversation — ask anything or attach a file
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Brain className="w-3.5 h-3.5 text-orange-400" />
                  </div>
                )}
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-orange-600/20 border border-orange-600/30 text-white rounded-br-sm'
                    : 'bg-[#1A1035] border border-purple-800/30 text-slate-200 rounded-bl-sm'
                }`}>
                  {m.file && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                      <Paperclip className="w-3 h-3" /> {m.file}
                    </div>
                  )}
                  {m.text}
                </div>
                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-purple-700/40 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold text-white">U</div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-3.5 h-3.5 text-orange-400" />
                </div>
                <div className="bg-[#1A1035] border border-purple-800/30 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
                  {[0,1,2].map(d => <span key={d} className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay:`${d*0.15}s` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="flex flex-col gap-2 bg-[#0D0826]/60 border border-purple-900/30 rounded-2xl p-3">
            <FileInput onChange={setChatFile} current={chatFile} onClear={() => setChatFile(null)} />
            <div className="flex gap-2">
              <input
                type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
                placeholder="Type a message... (Enter to send)"
                className="flex-1 bg-transparent text-white placeholder-slate-600 text-sm focus:outline-none px-1"
              />
              <button onClick={sendChat} disabled={loading || (!chatInput.trim() && !chatFile)}
                className="w-9 h-9 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-white flex items-center justify-center transition-all flex-shrink-0">
                <Send className="w-4 h-4" />
              </button>
              <button onClick={() => setMessages([])}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white flex items-center justify-center transition-all flex-shrink-0">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
           SUMMARISE TAB
         ══════════════════════════════════════════════════════════════════════ */}
      {tab === 'summarise' && (
        <div className="flex flex-col gap-4">
          <textarea value={sumText} onChange={e => setSumText(e.target.value)}
            placeholder="Paste text to summarise, or attach a file below..."
            rows={6}
            className="w-full bg-[#0D0826]/60 border border-purple-900/30 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 resize-none"
          />
          <div className="flex flex-wrap items-center gap-3">
            <FileInput onChange={setSumFile} current={sumFile} onClear={() => setSumFile(null)} />
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-slate-500 text-xs">Summary length:</span>
              {(['short','medium','long'] as const).map(l => (
                <button key={l} onClick={() => setSumLength(l)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
                    sumLength === l ? 'bg-orange-500/20 border-orange-500/50 text-orange-300' : 'border-white/10 text-slate-400 hover:text-white'
                  }`}>{l}</button>
              ))}
            </div>
            <button onClick={runSummarise} disabled={loading || (!sumText.trim() && !sumFile)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-white font-semibold text-sm transition-all ml-auto">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Summarise
            </button>
          </div>
          {sumResult && (
            <div className="bg-[#0D0826]/60 border border-orange-700/30 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-orange-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Summary
                </span>
                <CopyButton text={sumResult} />
              </div>
              <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{sumResult}</p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
           ANALYSE TAB
         ══════════════════════════════════════════════════════════════════════ */}
      {tab === 'analyse' && (
        <div className="flex flex-col gap-4">
          <textarea value={anaText} onChange={e => setAnaText(e.target.value)}
            placeholder="Paste text to analyse, or attach a file..."
            rows={6}
            className="w-full bg-[#0D0826]/60 border border-purple-900/30 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 resize-none"
          />
          <div className="flex flex-wrap items-center gap-3">
            <FileInput onChange={setAnaFile} current={anaFile} onClear={() => setAnaFile(null)} />
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-xs">Analysis mode:</span>
              {(['general','sentiment','topics','entities'] as const).map(m => (
                <button key={m} onClick={() => setAnaMode(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
                    anaMode === m ? 'bg-orange-500/20 border-orange-500/50 text-orange-300' : 'border-white/10 text-slate-400 hover:text-white'
                  }`}>{m}</button>
              ))}
            </div>
            <button onClick={runAnalyse} disabled={loading || (!anaText.trim() && !anaFile)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-white font-semibold text-sm transition-all ml-auto">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart2 className="w-4 h-4" />}
              Analyse
            </button>
          </div>
          {anaResult && (
            <div className="bg-[#0D0826]/60 border border-orange-700/30 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-orange-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5" /> Analysis Result
                </span>
                <CopyButton text={typeof anaResult === 'string' ? anaResult : JSON.stringify(anaResult, null, 2)} />
              </div>
              {typeof anaResult === 'object' ? (
                <pre className="text-slate-200 text-xs leading-relaxed overflow-x-auto bg-black/20 rounded-xl p-3 font-mono">
                  {JSON.stringify(anaResult, null, 2)}
                </pre>
              ) : (
                <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{anaResult}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
           GENERATE TAB
         ══════════════════════════════════════════════════════════════════════ */}
      {tab === 'generate' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-slate-500 text-xs">Content type:</span>
            {(['text','code','email','blog'] as const).map(t => (
              <button key={t} onClick={() => setGenType(t)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
                  genType === t ? 'bg-orange-500/20 border-orange-500/50 text-orange-300' : 'border-white/10 text-slate-400 hover:text-white'
                }`}>
                {t === 'text'  && <FileText         className="w-3 h-3" />}
                {t === 'code'  && <span className="font-mono text-[10px]">{'{}'}</span>}
                {t === 'email' && <MessageSquare    className="w-3 h-3" />}
                {t === 'blog'  && <BookOpen         className="w-3 h-3" />}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <textarea value={genPrompt} onChange={e => setGenPrompt(e.target.value)}
            placeholder={
              genType === 'code'  ? 'Describe the code you want to generate...' :
              genType === 'email' ? 'Describe the email topic / context...' :
              genType === 'blog'  ? 'Enter the blog topic...' :
              'Enter your content prompt...'
            }
            rows={5}
            className="w-full bg-[#0D0826]/60 border border-purple-900/30 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 resize-none"
          />
          <button onClick={runGenerate} disabled={loading || !genPrompt.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-white font-semibold text-sm transition-all self-end">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate
          </button>
          {genResult && (
            <div className="bg-[#0D0826]/60 border border-orange-700/30 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-orange-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Generated {genType.charAt(0).toUpperCase() + genType.slice(1)}
                </span>
                <CopyButton text={genResult} />
              </div>
              {genType === 'code' ? (
                <pre className="text-green-300 text-xs leading-relaxed overflow-x-auto bg-black/30 rounded-xl p-4 font-mono whitespace-pre-wrap">
                  {genResult}
                </pre>
              ) : (
                <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{genResult}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── How it works info box ───────────────────────────────────────────── */}
      <div className="mt-6 border border-orange-900/30 rounded-2xl overflow-hidden">
        <button onClick={() => setInfoOpen(p => !p)}
          className="w-full flex items-center gap-3 px-5 py-4 bg-orange-900/10 hover:bg-orange-900/20 transition-colors text-left">
          <Brain className="w-4 h-4 text-orange-400 flex-shrink-0" />
          <span className="text-white text-sm font-semibold">How AWS Bedrock works here</span>
          {infoOpen ? <ChevronUp className="w-4 h-4 text-slate-400 ml-auto" /> : <ChevronDown className="w-4 h-4 text-slate-400 ml-auto" />}
        </button>
        {infoOpen && (
          <div className="px-5 py-4 space-y-2.5 text-sm">
            {[
              { ok: true,  text: 'No API keys needed', sub: 'the EC2 server uses its IAM role to call Bedrock directly.' },
              { ok: true,  text: 'Models available',   sub: 'Amazon Nova Micro/Lite/Pro (fast & cheap) and Anthropic Claude 3 Haiku / Claude 3.5 Sonnet (powerful).' },
              { ok: true,  text: 'Region',             sub: 'us-east-1 (N. Virginia) where all Bedrock models are available.' },
              { ok: true,  text: 'Data stays in AWS',  sub: 'your prompts never leave Amazon\'s infrastructure.' },
              { ok: false, text: 'Model access',       sub: 'if you get an AccessDeniedException, open AWS Bedrock console → Model Access → Enable the model for your account.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-slate-400">
                <span className={`mt-0.5 flex-shrink-0 ${item.ok ? 'text-green-400' : 'text-yellow-400'}`}>
                  {item.ok ? '✅' : '⚠️'}
                </span>
                <span>
                  <span className="text-white font-medium">{item.text}</span>
                  {' — '}
                  <span className="text-sky-400">{item.sub}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
