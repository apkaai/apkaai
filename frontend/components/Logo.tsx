import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const dims = size === 'sm' ? 28 : size === 'lg' ? 44 : 36

  return (
    <Link href="/" className={`flex items-center gap-2.5 group ${className}`}>
      {/* Logo mark: A + bolt */}
      <svg
        width={dims}
        height={dims}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 drop-shadow-lg group-hover:scale-105 transition-transform duration-200"
      >
        {/* Rounded square background */}
        <rect width="40" height="40" rx="10" fill="url(#logoGrad)" />
        {/* Letter A */}
        <path
          d="M8 30 L14 10 L20 10 L26 30 H22 L20.5 25 H13.5 L12 30 H8Z M14.5 22 H19.5 L17 14.5 L14.5 22Z"
          fill="white"
          fillOpacity="0.95"
        />
        {/* Lightning bolt overlapping A */}
        <path
          d="M24 8 L18 20 L22 20 L17 32 L28 17 L23.5 17 L28 8 Z"
          fill="white"
          fillOpacity="0.98"
        />
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#5B21B6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Brand name */}
      <span className={`font-extrabold text-white tracking-tight ${size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-lg' : 'text-xl'}`}>
        apka<span className="text-purple-400">AI</span>
      </span>
    </Link>
  )
}
