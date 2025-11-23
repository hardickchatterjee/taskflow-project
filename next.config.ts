// next.config.ts
const nextConfig = {
  reactCompiler: true,
  turbopack: {}, // keeps Turbopack happy
  // THIS LINE IS REQUIRED
  experimental: {
    serverComponentsExternalPackages: ['socket.io'],
  },
};

export default nextConfig;