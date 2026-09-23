import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Tag, Star, Check, ArrowLeft, Zap, Clock, Shield } from 'lucide-react'
import { getToolBySlug, tools } from '@/lib/tools-data'
import DealCTAButtons from './DealCTAButtons'

export async function generateStaticParams() {
  return tools.map(t => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const tool = getToolBySlug(params.slug)
  if (!tool) return {}
  return {
    title: `${tool.name} Deal & Discount — ApkaAI`,
    description: `Get the best deal on ${tool.name}. ${tool.tagline}. Exclusive offers via ApkaAI.`,
  }
}

export default function DealPage({ params }: { params: { slug: string } }) {
  const tool = getToolBySlug(params.slug)
  if (!tool) notFound()

  const freePlan  = tool.pricingPlans?.find(p => p.monthly === 0)
  const paidPlans = tool.pricingPlans?.filter(p => p.monthly > 0) || []

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <Link href={`/tools/${tool.slug}`}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to {tool.name}
        </Link>

        {/* Hero */}
        <div className="glow-border rounded-2xl p-8 bg-gradient-to-br from-purple-900/20 to-[#0F0A1E] mb-6 text-center">
          <div className="text-6xl mb-4">{tool.logo}</div>
          <div className="inline-flex items-center gap-2 bg-purple-600/20 border border-purple-600/40 rounded-full px-4 py-1.5 text-purple-300 text-sm mb-4">
            <Tag className="w-4 h-4" /> Exclusive ApkaAI Deal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Get the Best Deal on {tool.name}
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-6">{tool.tagline}</p>

          <div className="flex items-center justify-center gap-2 mb-6">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className={`w-5 h-5 ${i <= Math.round(tool.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
            ))}
            <span className="text-white font-bold ml-1">{tool.rating}</span>
            <span className="text-slate-400">({tool.reviews.toLocaleString()} reviews)</span>
          </div>

          {/* Main CTA — PAYWALLED */}
          <DealCTAButtons
            website={tool.website}
            toolName={tool.name}
            freePlan={freePlan ? { features: freePlan.features, name: freePlan.name } : undefined}
            paidPlans={paidPlans.map(p => ({ name: p.name, price: p.price, features: p.features, popular: p.popular }))}
          />

          <div className="flex items-center justify-center gap-6 mt-4 text-slate-500 text-xs">
            <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Safe & Official</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Limited Time</span>
            <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> No Hidden Fees</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tool.tags.map(tag => (
            <span key={tag} className="px-3 py-1 rounded-lg bg-purple-900/40 border border-purple-800/40 text-purple-300 text-sm">
              #{tag}
            </span>
          ))}
        </div>

        {/* Browse more */}
        <div className="text-center">
          <p className="text-slate-400 mb-4">Looking for more AI tool deals?</p>
          <Link href="/pricing"
            className="inline-flex items-center gap-2 btn-primary text-white font-semibold px-8 py-3 rounded-xl">
            Browse All AI Tool Deals
          </Link>
        </div>
      </div>
    </div>
  )
}
