import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Las fotos de producto en producción vienen del CDN de Shopify.
  images: { remotePatterns: [{ protocol: "https", hostname: "cdn.shopify.com" }] },
  poweredByHeader: false,
};

export default nextConfig;
