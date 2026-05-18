/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // hls.js is an optional peer dep of @react-three/drei used only at runtime.
    // Stub it out so the build doesn't fail when it's not installed.
    config.resolve.alias = {
      ...config.resolve.alias,
      'hls.js': false,
    }
    return config
  },
}

export default nextConfig
