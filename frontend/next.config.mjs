/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  images: {
    unoptimized: true,
    domains: ['images.unsplash.com', 'commondatastorage.googleapis.com', 'i.ytimg.com', 'img.youtube.com'],
  },
};

export default nextConfig;
