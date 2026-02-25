/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      }
    ]
  },
  env: {
    NEXT_PUBLIC_STORE_API_URL: process.env.STORE_API_URL,
    STORE_CLIENT_ID: process.env.STORE_CLIENT_ID
  }
};

export default nextConfig;
