/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  skipTrailingSlashRedirect: true,
  env: {
    TLS_REJECT_UNAUTHORIZED: "0",
  },
  experimental: {
    staticGenerationRetryCount: 3,
    staticGenerationMaxConcurrency: 1,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'techa.ir',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:3500';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/api-docs/:path*',
        destination: `${backendUrl}/api-docs/:path*`,
      },
      {
        source: '/api-docs',
        destination: `${backendUrl}/api-docs`,
      },
      {
        source: '/api-docs.json',
        destination: `${backendUrl}/api-docs.json`,
      },
      {
        source: '/backend',
        destination: `${backendUrl}/`,
      },
    ];
  },
};

export default nextConfig;
