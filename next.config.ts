import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Product/gallery images are local (public/) and remote storefront photos.
  images: {
    // We mostly use plain <img>; keep this permissive for any future next/image use.
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
}

export default nextConfig
