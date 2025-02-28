/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Dangerously allow type errors in production
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 