import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FloatingSocialWidget from '@/components/FloatingSocialWidget'
import AIChatbot from '@/components/AIChatbot'
import StarryBackground from '@/components/StarryBackground'
import GaneshaFloat from '@/components/GaneshaFloat'
import { CartProvider } from '@/lib/cart-context'
import { WishlistProvider } from '@/lib/wishlist-context'
import CartDrawer from '@/components/cart/CartDrawer'

export const metadata: Metadata = {
  title:       'ApkaAI — Discover & Buy the Best AI Tools',
  description: "India's #1 AI Tools Marketplace — 100+ AI tools, cloud cost comparison, and exclusive deals in INR.",
  keywords:    'AI tools, ChatGPT, Claude, Midjourney, Cursor, AI marketplace, buy AI subscriptions, India',
  manifest:    '/manifest.webmanifest',
  icons: {
    icon:    '/apkaai-logo.png',
    shortcut:'/apkaai-logo.png',
    apple:   '/apkaai-logo.png',
  },
  appleWebApp: {
    capable:         true,
    statusBarStyle:  'black-translucent',
    title:           'ApkaAI',
  },
  openGraph: {
    title:       'ApkaAI — Discover & Buy the Best AI Tools',
    description: "India's #1 AI Tools Marketplace",
    url:         'https://apkaai.com',
    siteName:    'ApkaAI',
    type:        'website',
    images:      [{ url: 'https://apkaai.com/apkaai-logo.png', width: 512, height: 512 }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'ApkaAI — Discover & Buy the Best AI Tools',
    description: "India's #1 AI Tools Marketplace",
    images:      ['https://apkaai.com/apkaai-logo.png'],
  },
  other: {
    'mobile-web-app-capable':        'yes',
    'apple-mobile-web-app-capable':  'yes',
    'application-name':              'ApkaAI',
    'msapplication-TileColor':       '#7C3AED',
    'theme-color':                   '#7C3AED',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {/* Flash-prevention: apply theme class before first paint */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(!t)t=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';document.documentElement.classList.toggle('light-mode',t==='light');}catch(e){}})();`
          }}
        />
        <meta name="theme-color" content="#7C3AED" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ApkaAI" />
      </head>
      <body className="bg-[#08051A] text-slate-100 antialiased relative">
        <CartProvider>
          <WishlistProvider>
          <StarryBackground />
          <Navbar />
          <CartDrawer />
          <main>{children}</main>
          <Footer />
          {/* Fixed widget bar — chatbot LEFT, social widget RIGHT, side by side */}
          <div className="fixed bottom-6 right-5 z-[9999] flex flex-row items-end gap-3">
            <AIChatbot />
            <FloatingSocialWidget />
          </div>
          <GaneshaFloat />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  )
}
