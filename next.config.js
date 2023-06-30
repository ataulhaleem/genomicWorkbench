/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'export',
  experimental: {
    appDir: true,
    
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { fs: false };
    }
    return config;
  },
  // Add the following line to enable CSS support
  cssModules: true,
};

module.exports = nextConfig;
