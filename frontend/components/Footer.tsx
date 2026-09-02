import Link from 'next/link'
import { Zap, Twitter, Linkedin, Github, Mail, MapPin, BarChart3 } from 'lucide-react'

const footerLinks = {
  'AI Tools': [
    { label: 'All 60+ Tools', href: '/tools' },
    { label: 'AI Chat & Research', href: '/tools?cat=ai-chat' },
    { label: 'Image Generation', href: '/tools?cat=image-generation' },
    { label: 'Coding Tools', href: '/tools?cat=coding' },
    { label: 'Video Generation', href: '/tools?cat=video-generation' },
    { label: 'Music & Audio', href: '/tools?cat=music-audio' },
  ],
  'Features': [
    { label: 'Compare Tools', href: '/compare' },
    { label: 'Pricing Guide', href: '/pricing' },
    { label: 'All Categories', href: '/tools#categories' },
    { label: 'Blog & Guides', href: '/blog' },
    { label: 'New Tools', href: '/tools?sort=new' },
    { label: 'Featured Tools', href: '/tools?sort=popular' },
  ],
  'Company': [
    { label: 'About Us', href: '/about' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Submit a Tool', href: '/contact' },
    { label: 'Advertise', href: '/contact' },
  ],
}

const socialLinks = [
  {
    icon: Linkedin,
    href: 'https://www.linkedin.com/in/apkaai-3784a1433/',
    label: 'LinkedIn',
    color: 'hover:border-blue-500 hover:text-blue-400',
  },
  {
    icon: Twitter,
    href: 'https://twitter.com/apkaai',
    label: 'Twitter',
    color: 'hover:border-sky-500 hover:text-sky-400',
  },
  {
    icon: Github,
    href: 'https://github.com/AshutoshPanday/apkaai',
    label: 'GitHub',
    color: 'hover:border-slate-400 hover:text-white',
  },
  {
    icon: Mail,
    href: 'mailto:hello@apkaai.com',
    label: 'Email',
    color: 'hover:border-purple-500 hover:text-purple-400',
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-purple-900/30 bg-[#08051A] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="text-xl font-bold text-white">
                apka<span className="text-purple-400">AI</span>
              </span>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-5">
              India&apos;s #1 marketplace for AI tools. Discover, compare and access 60+ AI tools — ChatGPT, Claude, Midjourney and more.
            </p>

            {/* Contact info */}
            <div className="space-y-2 mb-6">
              <a href="mailto:hello@apkaai.com" className="flex items-center gap-2 text-slate-400 hover:text-purple-400 text-sm transition-colors">
                <Mail className="w-4 h-4" /> hello@apkaai.com
              </a>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <MapPin className="w-4 h-4" /> India 🇮🇳
              </div>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, href, label, color }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`p-2 rounded-lg border border-purple-800/40 text-slate-400 transition-all ${color}`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            {/* LinkedIn highlight */}
            <a
              href="https://www.linkedin.com/in/apkaai-3784a1433/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-blue-900/20 border border-blue-700/40 hover:border-blue-500 text-blue-300 hover:text-white text-sm font-medium transition-all"
            >
              <Linkedin className="w-4 h-4" />
              Follow on LinkedIn
            </a>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-1.5">
                {section === 'Features' && <BarChart3 className="w-4 h-4 text-purple-400" />}
                {section}
              </h3>
              <ul className="space-y-2.5">
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

        {/* Bottom bar */}
        <div className="border-t border-purple-900/20 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} ApkaAI. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-slate-600 text-xs">
            <Link href="/privacy" className="hover:text-slate-400">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-400">Terms</Link>
            <span>Built with ❤️ in India 🇮🇳</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
