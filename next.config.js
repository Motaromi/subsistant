/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during production builds for now
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip type checking during builds (not recommended long-term)
    ignoreBuildErrors: true,
  },
  // Configure serverless functions
  experimental: {
    serverComponentsExternalPackages: ["langchain", "@langchain/openai"],
  },
  // Set longer timeout for API routes
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
}

module.exports = nextConfig 