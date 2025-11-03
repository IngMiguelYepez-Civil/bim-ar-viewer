/** @type {import('next').NextConfig} */

const repo = 'bim-ar-viewer';
const assetPrefix = `/${repo}/`;
const basePath = `/${repo}`;

const nextConfig = {
  output: 'export',
  assetPrefix: assetPrefix,
  basePath: basePath,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.licdn.com",
      },
    ],
  },
};

export default nextConfig;
