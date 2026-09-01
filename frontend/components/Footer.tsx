import Link from 'next/link'
import { Zap, Twitter, Linkedin, Github } from 'lucide-react'

const footerLinks = {
  'AI Tools': [
    { label: 'AI Chat', href: '/tools?cat=ai-chat' },
    { label: 'Image Generation', href: '/tools?cat=image-generation' },
    { label: 'Coding Tools', href: '/tools?cat=coding' },
    { label: 'Video Generation', href: '/tools?cat=video-generation' },
    { label: 'Writing', href: '/tools?cat=writing' },
  ],
  'Company': [
    { label: 'About Us', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
  'Support': [
    { label: 'Help Center', href: '/help' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-purple-900/30 bg-[#08051A] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="text-xl font-bold text-white">
                apka<span className="text-purple-400">AI</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              India&apos;s #1 marketplace for AI tools. Discover, compare and access the best AI subscriptions — all in one place.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a href="https://twitter.com/apkaai" target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg border border-purple-800/40 text-slate-400 hover:text-white hover:border-purple-500 transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com/company/apkaai" target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg border border-purple-800/40 text-slate-400 hover:text-white hover:border-purple-500 transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://github.com/apkaai" target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg border border-purple-800/40 text-slate-400 hover:text-white hover:border-purple-500 transition-all">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-white font-semibold text-sm mb-4">{section}</h3>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-slate-400 hover:text-purple-400 text-sm transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-purple-900/20 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} ApkaAI. All rights reserved.
          </p>
          <p className="text-slate-600 text-xs">
            Built with ❤️ in India 🇮🇳
          </p>
        </div>
      </div>
    </footer>
  )
}
