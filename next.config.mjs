const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    return config;
  },
  experimental: {
    optimizePackageImports: ["@radix-ui/react-*"],
  },
};

export default nextConfig;
