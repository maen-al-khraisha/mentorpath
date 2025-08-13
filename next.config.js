/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Skip ESLint during production builds to avoid unrelated failures
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
