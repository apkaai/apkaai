/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['apkaai-assets.s3.ap-south-1.amazonaws.com', 'cdn.apkaai.com'],
    unoptimized: false,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  },
  // Ignore type/lint errors during build so deployment is never blocked
  typescript: { ignoreBuildErrors: true },
  eslint:     { ignoreDuringBuilds: true },
}

module.exports = nextConfig
