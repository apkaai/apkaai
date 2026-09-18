import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Tag, ExternalLink, Check, ArrowLeft, Star, Copy, ShoppingCart, Zap } from 'lucide-react'
import { getToolBySlug, tools } from '@/lib/tools-data'
import { SidebarCartCTA } from '@/app/tools/[slug]/ToolDetailCartSection'

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  return tools.map(t => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: Props) {
  const tool = getToolBySlug(params.slug)
  if (!tool) return {}
  return {
    title: `${tool.name} Deals & Discounts — Save in INR | ApkaAI`,
    description: `Get the best deals on ${tool.name}. Compare pricing plans, coupons, and exclusive discounts on ApkaAI.`,
  }
}

// Hardcoded deals/coupons per tool (extend as needed)
const TOOL_DEALS: Record<string, { code: string; discount: string; description: string; expires?: string }[]> = {
  chatgpt:          [{ code: 'APKAAI10', discount: '10% off', description: 'Use on your first ApkaAI order for ChatGPT Plus' }],
  claude:           [{ code: 'APKAAI10', discount: '10% off', description: 'Use on your first ApkaAI order for Claude Pro' }],
  cursor:           [{ code: 'APKAAI10', discount: '10% off', description: 'Use on your first ApkaAI order for Cursor Pro' }],
  midjourney:       [{ code: 'APKAAI10', discount: '10% off', description: 'Use on your first ApkaAI order for Midjourney Basic' }],
  gemini:           [{ code: 'APKAAI10', discount: '10% off', description: 'Use on your first ApkaAI order for Gemini Advanced' }],
  grammarly:        [{ code: 'APKAAI10', discount: '10% off', description: 'Use on your first ApkaAI order for Grammarly Premium' }],
  elevenlabs:       [{ code: 'APKAAI10', discount: '10% off', description: 'Use on your first ApkaAI order for ElevenLabs Starter' }],
  'github-copilot': [{ code: 'APKAAI10', discount: '10% off', description: 'Use on your first ApkaAI order for GitHub Copilot' }],
  suno:             [{ code: 'APKAAI10', discount: '10% off', description: 'Use on your first ApkaAI order for Suno Pro' }],
  runway:           [{ code: 'APKAAI10', discount: '10% off', description: 'Use on your first ApkaAI order for Runway Standard' }],
}
const DEFAULT_DEAL = [{ code: 'APKAAI10', discount: '10% off', description: 'Use coupon APKAAI10 on your first ApkaAI order' }]

function pricingColor(p: string) {
  switch (p) {
    case 'Free':       return 'bg-emerald-900/40 text-emerald-400'
    case 'Free Trial': return 'bg-teal-900/40 text-teal-400'
    case 'Paid':       return 'bg-amber-900/40 text-amber-400'
    default:           return 'bg-blue-900/40 text-blue-400'
  }
}

export default function DealsPage({ params }: Props) {
  const tool = getToolBySlug(params.slug)
  if (!tool) notFound()

  const deals = TOOL_DEALS[tool.slug] || DEFAULT_DEAL

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8 flex-wrap">
          <Link href="/tools" className="hover:text-white transition-colors">Tools</Link>
          <span>/</span>
          <Link href={`/tools/${tool.slug}`} className="hover:text-white transition-colors">{tool.name}</Link>
          <span>/</span>
          <span className="text-slate-300">Deals</span>
        </nav>

        {/* Tool header */}
        <div className="glow-border rounded-2xl p-6 bg-[#0F0A1E] mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-900/40 border border-purple-700/30 flex items-center justify-center text-3xl flex-shrink-0">
              {tool.logo}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-2xl font-extrabold text-white">{tool.name} Deals</h1>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${pricingColor(tool.pricing)}`}>
                  {tool.pricing === 'Freemium' ? 'Premium' : tool.pricing}
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-3">{tool.tagline}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-white font-semibold text-sm">{tool.rating}</span>
                  <span className="text-slate-500 text-xs">({tool.reviews.toLocaleString()} reviews)</span>
                </div>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400 text-sm">Starting {tool.startingPrice}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coupon codes */}
        <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <Tag className="w-5 h-5 text-purple-400" /> Available Coupons & Deals
        </h2>

        <div className="space-y-4 mb-8">
          {deals.map((deal, i) => (
            <DealCard key={i} deal={deal} toolName={tool.name} />
          ))}
        </div>

        {/* Pricing plans */}
        {tool.pricingPlans && tool.pricingPlans.length > 0 && (
          <>
            <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-purple-400" /> Pricing Plans
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {tool.pricingPlans.map(plan => (
                <div key={plan.name} className={`rounded-2xl p-5 border transition-all ${plan.popular ? 'bg-purple-900/20 border-purple-600/50' : 'bg-[#0F0A1E] border-purple-900/30'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-bold">{plan.name}</p>
                      <p className="text-purple-300 text-xl font-extrabold mt-0.5">{plan.price}</p>
                    </div>
                    {plan.popular && (
                      <span className="text-xs bg-purple-600 text-white px-2.5 py-1 rounded-full font-semibold">Popular</span>
                    )}
                  </div>
                  <ul className="space-y-1.5 mb-4">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-xs text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" /> {f}
                      </li>
                    ))}
                  </ul>
                  <SidebarCartCTA tool={tool} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Visit tool */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={tool.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 btn-primary flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-xl text-sm"
          >
            <ExternalLink className="w-4 h-4" /> Visit {tool.name} Official Site
          </a>
          <Link
            href={`/tools/${tool.slug}`}
            className="flex-1 flex items-center justify-center gap-2 border border-purple-700/40 hover:border-purple-500 text-slate-300 hover:text-white font-semibold py-3.5 rounded-xl text-sm transition-all"
          >
            <Zap className="w-4 h-4" /> View Full Details
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Client component for copy button ────────────────────────────────────────
'use client'
function DealCard({ deal, toolName }: { deal: { code: string; discount: string; description: string; expires?: string }; toolName: string }) {
  // This is a server component file — copy handled via JS
  return (
    <div className="glow-border rounded-2xl bg-[#0F0A1E] p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 font-semibold text-sm">{deal.discount} Discount</span>
          </div>
          <p className="text-slate-300 text-sm mb-3">{deal.description}</p>
          {deal.expires && (
            <p className="text-slate-500 text-xs">Expires: {deal.expires}</p>
          )}
        </div>
        {/* Coupon code box */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="bg-purple-950/60 border border-purple-700/40 border-dashed rounded-xl px-4 py-2.5 font-mono text-purple-300 font-bold text-sm tracking-widest">
            {deal.code}
          </div>
          <Link
            href="/cart"
            className="flex items-center gap-1.5 px-4 py-2.5 btn-primary text-white font-bold rounded-xl text-sm"
          >
            <Copy className="w-3.5 h-3.5" /> Use Code
          </Link>
        </div>
      </div>
    </div>
  )
}
