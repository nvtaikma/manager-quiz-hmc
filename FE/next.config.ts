import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "ui-avatars.com",
      "cdn.idntimes.com",
      "lh3.googleusercontent.com",
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    resolveAlias: {
      canvas: "./empty-module.js",
    },
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
