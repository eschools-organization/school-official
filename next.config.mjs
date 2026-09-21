/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["mongodb"],
  compress: true,
  reactStrictMode: false,
  poweredByHeader: false,
};

export default nextConfig;
