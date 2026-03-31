/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.example.com',
      },
    ],
  },

  // Experimental features
  experimental: {
    // Server Actions configuration
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Strict mode for React
  reactStrictMode: true,

  // Output configuration
  output: 'standalone', // For Docker deployments

  // Environment variables exposed to the browser
  env: {
    // Add public environment variables here
    // NEXT_PUBLIC_API_URL: process.env.API_URL,
  },
};

export default nextConfig;