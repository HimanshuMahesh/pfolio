import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // 90 for the portrait and preview cards, where compression shows
    qualities: [75, 90],
  },
};

export default nextConfig;
