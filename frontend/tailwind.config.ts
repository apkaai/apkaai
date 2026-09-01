import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#7C3AED',
          violet: '#6D28D9',
          dark: '#0F0A1E',
          darker: '#08051A',
          card: '#150D2E',
          border: '#2D1B69',
          glow: '#A855F7',
          text: '#C4B5FD',
          muted: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.4) 0%, transparent 70%)',
        'card-gradient': 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(109,40,217,0.05) 100%)',
        'glow-gradient': 'radial-gradient(circle at center, rgba(168,85,247,0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(124,58,237,0.3)',
        'glow-md': '0 0 30px rgba(124,58,237,0.4)',
        'glow-lg': '0 0 60px rgba(124,58,237,0.5)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(124,58,237,0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(124,58,237,0.6)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
