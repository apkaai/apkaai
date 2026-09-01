import Link from 'next/link'
import { ArrowRight, Sparkles, TrendingUp, Shield, Zap, Star, Users, Globe } from 'lucide-react'
import ToolCard from '@/components/ToolCard'
import CategoryCard from '@/components/CategoryCard'
import { featuredTools, categories, tools } from '@/lib/tools-data'

const stats = [
  { icon: Globe, label: 'AI Tools', value: '100+' },
  { icon: Users, label: 'Happy Users', value: '10K+' },
  { icon: Star, label: 'Avg Rating', value: '4.7' },
  { icon: TrendingUp, label: 'Categories', value: '15' },
]

const trustedTools = ['ChatGPT', 'Claude', 'Midjourney', 'Cursor', 'Runway', 'ElevenLabs', 'Perplexity', 'Jasper']

const whyChooseUs = [
  {
    icon: Sparkles,
    title: 'Curated Collection',
    desc: 'Every tool is hand-picked and verified. No spam, no fakes — only the best AI tools.',
  },
  {
    icon: Shield,
    title: 'Trusted Subscriptions',
    desc: 'We partner directly with AI companies to provide legitimate access at the best prices.',
  },
  {
    icon: Zap,
    title: 'Instant Access',
    desc: 'Get access to AI tools instantly after purchase. No waiting, no delays.',
  },
  {
    icon: TrendingUp,
    title: 'Always Updated',
    desc: 'We track every new AI tool launch and update so you never miss out.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 grid-bg overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-700/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-violet-600/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-[300px] h-[300px] bg-purple-600/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-purple-900/40 border border-purple-700/50 rounded-full px-4 py-2 text-sm text-purple-300 mb-8">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            100+ AI Tools · Updated Daily
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
            Discover the
            <span className="block gradient-text glow-text">Best AI Tools</span>
            for Everything
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            India&apos;s #1 AI marketplace. Find, compare and access ChatGPT, Claude, Midjourney, Cursor and 100+ more AI tools — all in one place.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/tools"
              className="btn-primary flex items-center gap-2 text-white font-bold px-8 py-4 rounded-xl text-base shadow-glow-sm"
            >
              Explore All Tools
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/tools#categories"
              className="flex items-center gap-2 text-slate-300 hover:text-white font-semibold px-8 py-4 rounded-xl text-base border border-purple-800/40 hover:border-purple-500/60 transition-all bg-purple-950/20"
            >
              Browse Categories
            </Link>
          </div>

          {/* Trusted by */}
          <div className="mt-16">
            <p className="text-slate-500 text-sm mb-6">Featuring tools from</p>
            <div className="flex flex-wrap justify-center gap-3">
              {trustedTools.map(name => (
                <span
                  key={name}
                  className="px-4 py-2 bg-[#150D2E] border border-purple-900/40 rounded-lg text-slate-300 text-sm font-medium hover:border-purple-600/50 transition-colors"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-y border-purple-900/20">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <div className="flex justify-center mb-2">
                <Icon className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">{value}</div>
              <div className="text-slate-400 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Tools */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider">Featured</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Top AI Tools</h2>
              <p className="text-slate-400 mt-2">The most popular AI tools used by millions</p>
            </div>
            <Link href="/tools" className="hidden sm:flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {featuredTools.slice(0, 8).map(tool => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/tools" className="inline-flex items-center gap-2 btn-primary text-white font-semibold px-8 py-3 rounded-xl text-sm">
              Explore All 100+ Tools <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-20 px-4 bg-[#0A0618]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider">Browse by Category</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
              Every AI Category Covered
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              From chat to code, image to video — we have AI tools for every use case
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map(cat => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
              Why Choose ApkaAI?
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              We make discovering and accessing AI tools simple, safe and affordable
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glow-border rounded-xl p-6 text-center bg-[#0F0A1E] group hover:bg-purple-950/20 transition-all">
                <div className="w-12 h-12 rounded-xl bg-purple-900/40 border border-purple-700/30 flex items-center justify-center mx-auto mb-4 group-hover:border-purple-500 transition-colors">
                  <Icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden border border-purple-700/40 bg-gradient-to-br from-purple-900/30 to-violet-900/20 p-12 text-center">
            <div className="absolute inset-0 bg-glow-gradient opacity-50 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                Start Exploring AI Today
              </h2>
              <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of professionals, creators and businesses already using the best AI tools
              </p>
              <Link
                href="/tools"
                className="btn-primary inline-flex items-center gap-2 text-white font-bold px-10 py-4 rounded-xl text-base shadow-glow-md"
              >
                Browse All Tools <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
