/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: false,
  skipTrailingSlashRedirect: true,
  env: {
    TLS_REJECT_UNAUTHORIZED: "0",
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pool.techa.ir',
        port: '',
        pathname: '/staticfiles/**',
      },
    ],
  },
};

export default nextConfig;
