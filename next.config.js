/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env?.PAGES_BASE_PATH || '',
  eslint: {
    // We're handling ESLint in our custom scripts
    ignoreDuringBuilds: true,
  },
};

export default nextConfig; 