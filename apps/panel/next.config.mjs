/** @type {import('next').NextConfig} */
const isProduction = process.env.NEXT_PUBLIC_APP_ENV === 'production'
const backendBaseUrl = isProduction
  ? process.env.NEXT_PUBLIC_API_URL_PROD
  : process.env.NEXT_PUBLIC_API_URL_DEV

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    if (!backendBaseUrl) {
      return []
    }

    return [
      {
        source: '/api/:path*',
        destination: `${backendBaseUrl}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
