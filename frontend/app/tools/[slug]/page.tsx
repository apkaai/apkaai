import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star, ExternalLink, Check, ArrowRight, Globe, Tag, Zap } from 'lucide-react'
import ToolCard from '@/components/ToolCard'
import { getToolBySlug, getToolsByCategory, tools } from '@/lib/tools-data'

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  return tools.map(t => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: Props) {
  const tool = getToolBySlug(params.slug)
  if (!tool) return {}
  return {
    title: `${tool.name} — ${tool.tagline} | ApkaAI`,
    description: tool.description,
  }
}

const pricingDetails: Record<string, { plan: string; price: string; features: string[] }[]> = {
  freemium: [
    { plan: 'Free', price: '₹0/mo', features: ['Limited usage', 'Basic features', 'Community support'] },
    { plan: 'Pro', price: 'From ₹830/mo', features: ['Unlimited usage', 'All features', 'Priority support', 'API access'] },
  ],
  paid: [
    { plan: 'Starter', price: 'From ₹830/mo', features: ['Core features', 'Email support', '5 projects'] },
    { plan: 'Pro', price: 'From ₹2,490/mo', features: ['Everything in Starter', 'Priority support', 'Unlimited projects', 'API access'] },
  ],
  free: [
    { plan: 'Free', price: '₹0', features: ['Full access', 'No credit card', 'Community support'] },
  ],
}

export default function ToolDetailPage({ params }: Props) {
  const tool = getToolBySlug(params.slug)
  if (!tool) notFound()

  const related = getToolsByCategory(tool.categorySlug)
    .filter(t => t.slug !== tool.slug)
    .slice(0, 4)

  const plans = pricingDetails[tool.pricing.toLowerCase()] || pricingDetails.freemium

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/tools" className="hover:text-white transition-colors">Tools</Link>
          <span>/</span>
          <Link href={`/category/${tool.categorySlug}`} className="hover:text-white transition-colors">
            {tool.category}
          </Link>
          <span>/</span>
          <span className="text-slate-300">{tool.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Tool Header */}
            <div className="glow-border rounded-2xl p-8 bg-[#0F0A1E]">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-2xl bg-purple-900/40 border border-purple-700/40 flex items-center justify-center text-4xl flex-shrink-0">
                  {tool.logo}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap mb-1">
                        <h1 className="text-3xl font-extrabold text-white">{tool.name}</h1>
                        {tool.badge && (
                          <span className="badge-new text-white">{tool.badge}</span>
                        )}
                        {tool.new && !tool.badge && (
                          <span className="badge-new text-white bg-gradient-to-r from-emerald-600 to-teal-600">New</span>
                        )}
                      </div>
                      <p className="text-slate-300 text-lg">{tool.tagline}</p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-3 mt-4">
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(i => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i <= Math.round(tool.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
                        />
                      ))}
                    </div>
                    <span className="text-white font-bold">{tool.rating}</span>
                    <span className="text-slate-400 text-sm">({tool.reviews.toLocaleString()} reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="glow-border rounded-2xl p-8 bg-[#0F0A1E]">
              <h2 className="text-xl font-bold text-white mb-4">About {tool.name}</h2>
              <p className="text-slate-300 leading-relaxed text-base">{tool.description}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {tool.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-lg bg-purple-900/40 border border-purple-800/40 text-purple-300 text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Key Features */}
            <div className="glow-border rounded-2xl p-8 bg-[#0F0A1E]">
              <h2 className="text-xl font-bold text-white mb-6">Key Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  'Advanced AI capabilities',
                  'Easy to use interface',
                  'Regular model updates',
                  'API access available',
                  'Mobile & desktop support',
                  'Multi-language support',
                ].map(feature => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-900/60 border border-purple-600/40 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-purple-400" />
                    </div>
                    <span className="text-slate-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Use Cases */}
            <div className="glow-border rounded-2xl p-8 bg-[#0F0A1E]">
              <h2 className="text-xl font-bold text-white mb-6">Best For</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tool.tags.map(tag => (
                  <div key={tag} className="flex items-center gap-3 p-3 rounded-xl bg-purple-950/30 border border-purple-900/40">
                    <Zap className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span className="text-slate-300 text-sm">{tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* CTA Card */}
            <div className="glow-border rounded-2xl p-6 bg-[#0F0A1E] sticky top-24">
              <div className="text-center mb-6">
                <p className="text-slate-400 text-sm mb-1">Starting from</p>
                <p className="text-3xl font-extrabold text-white">{tool.startingPrice}</p>
                <span className={`inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full ${
                  tool.pricing === 'Free'
                    ? 'bg-emerald-900/40 text-emerald-400'
                    : tool.pricing === 'Freemium'
                    ? 'bg-blue-900/40 text-blue-400'
                    : 'bg-purple-900/40 text-purple-400'
                }`}>
                  {tool.pricing}
                </span>
              </div>

              <a
                href={tool.website}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center justify-center gap-2 text-white font-bold px-6 py-3.5 rounded-xl w-full text-sm shadow-glow-sm mb-3"
              >
                Visit {tool.name}
                <ExternalLink className="w-4 h-4" />
              </a>

              <button className="w-full flex items-center justify-center gap-2 border border-purple-700/40 hover:border-purple-500 text-slate-300 hover:text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all bg-purple-950/20">
                Get Deal / Discount
                <Tag className="w-4 h-4" />
              </button>

              <div className="mt-6 space-y-3 border-t border-purple-900/30 pt-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Category</span>
                  <Link href={`/category/${tool.categorySlug}`} className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                    {tool.category}
                  </Link>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Website</span>
                  <a href={tool.website} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium">
                    <Globe className="w-3 h-3" />
                    Visit
                  </a>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Rating</span>
                  <span className="text-white font-semibold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    {tool.rating}/5
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Reviews</span>
                  <span className="text-white font-semibold">{tool.reviews.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Pricing Plans */}
            <div className="glow-border rounded-2xl p-6 bg-[#0F0A1E]">
              <h3 className="font-bold text-white mb-4">Pricing Plans</h3>
              <div className="space-y-4">
                {plans.map((plan, i) => (
                  <div key={plan.plan} className={`p-4 rounded-xl border transition-all ${
                    i === 1 ? 'border-purple-500/60 bg-purple-900/20' : 'border-purple-900/40 bg-purple-950/20'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-white text-sm">{plan.plan}</span>
                      <span className="text-purple-300 font-bold text-sm">{plan.price}</span>
                    </div>
                    <ul className="space-y-1">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-xs text-slate-400">
                          <Check className="w-3 h-3 text-purple-400 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Tools */}
        {related.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-white">
                Similar Tools in {tool.category}
              </h2>
              <Link
                href={`/category/${tool.categorySlug}`}
                className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
              >
                See all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map(t => (
                <ToolCard key={t.id} tool={t} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
