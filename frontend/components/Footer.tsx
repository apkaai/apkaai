import Link from 'next/link'
import { Twitter, Linkedin, Github, Mail, MapPin, BarChart3 } from 'lucide-react'

// Inline logo
function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="url(#fg)"/>
      <path d="M7 30 L13 10 H19 L25 30 H21 L19.5 25.5 H12.5 L11 30 H7Z M13.5 22.5 H18.5 L16 15 L13.5 22.5Z" fill="white" fillOpacity="0.95"/>
      <path d="M23 8 L17 20 H21 L16 32 L27 17.5 H22.5 L27 8 Z" fill="white"/>
      <defs>
        <linearGradient id="fg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C3AED"/>
          <stop offset="100%" stopColor="#5B21B6"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

const footerLinks = {
  'AI Tools': [
    { label: 'All 70+ Tools',           href: '/tools' },
    { label: 'AI Chat & Research',       href: '/category/ai-chat' },
    { label: 'Image Generation',         href: '/category/image-generation' },
    { label: 'Coding Tools',             href: '/category/coding' },
    { label: 'Video Generation',         href: '/category/video-generation' },
    { label: 'Writing & Content',        href: '/category/writing' },
  ],
  'Company': [
    { label: 'About Us',   href: '/about' },
    { label: 'Blog',       href: '/blog' },
    { label: 'Careers',    href: '/careers' },
    { label: 'Contact Us', href: '/contact' },
  ],
  'Support': [
    { label: 'Help Center',       href: '/help' },
    { label: 'Privacy Policy',    href: '/privacy' },
    { label: 'Terms of Service',  href: '/terms' },
    { label: 'Cookie Policy',     href: '/cookies' },
  ],
}

const socialLinks = [
  { icon: Twitter,  href: 'https://twitter.com/apkaai',                           label: 'Twitter',  color: 'hover:border-sky-500 hover:text-sky-400' },
  { icon: Linkedin, href: 'https://www.linkedin.com/in/apkaai-3784a1433/',        label: 'LinkedIn', color: 'hover:border-blue-500 hover:text-blue-400' },
  { icon: Github,   href: 'https://github.com/AshutoshPanday/apkaai',             label: 'GitHub',   color: 'hover:border-slate-400 hover:text-white' },
  { icon: Mail,     href: 'mailto:coolakpandey@gmail.com',                        label: 'Email',    color: 'hover:border-purple-500 hover:text-purple-400' },
]

export default function Footer() {
  return (
    <footer className="border-t border-purple-900/30 bg-[#08051A] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <LogoMark size={28} />
              <span className="text-xl font-extrabold text-white tracking-tight">
                apka<span className="text-purple-400">AI</span>
              </span>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-5">
              India&apos;s #1 marketplace for AI tools. Discover, compare and access 70+ AI tools — all in one place.
            </p>

            {/* Contact */}
            <div className="space-y-2 mb-5">
              <a
                href="mailto:coolakpandey@gmail.com"
                className="flex items-center gap-2 text-slate-400 hover:text-purple-400 text-sm transition-colors"
              >
                <Mail className="w-4 h-4" />
                coolakpandey@gmail.com
              </a>
              <p className="text-sm text-slate-500">Contact: Ashutosh Kumar Pandey</p>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <MapPin className="w-4 h-4" /> India
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center gap-3 mb-4">
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-900/20 border border-blue-700/40 hover:border-blue-500 text-blue-300 hover:text-white text-sm font-medium transition-all"
            >
              <Linkedin className="w-4 h-4" />
              Follow on LinkedIn
            </a>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-1.5">
                {section === 'AI Tools' && <BarChart3 className="w-4 h-4 text-purple-400" />}
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
            © {new Date().getFullYear()} ApkaAI by Ashutosh Kumar Pandey. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-slate-600 text-xs">
            <Link href="/privacy" className="hover:text-slate-400">Privacy</Link>
            <Link href="/terms"   className="hover:text-slate-400">Terms</Link>
            <span>Built with love in India</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
