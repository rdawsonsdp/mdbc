/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    esmExternals: false
  },
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'lh4.googleusercontent.com',
      'lh5.googleusercontent.com',
      'lh6.googleusercontent.com',
      'avatars.githubusercontent.com',
      'firebasestorage.googleapis.com'
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      path: false,
    };
    return config;
  },
}

module.exports = nextConfig