/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Skip ESLint during production builds to avoid unrelated failures
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Enable modern CSS features
    optimizeCss: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
