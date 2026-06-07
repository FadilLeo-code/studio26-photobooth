// next.config.ts atau next.config.js
const nextConfig = {
  output: 'export', // Ini kuncinya!
  images: {
    unoptimized: true, // Wajib, karena export statis tidak mendukung Image Optimization bawaan Next.js
  },
};

export default nextConfig;