import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 注意：脚手架默认开启的 cacheComponents / partialPrefetching 已移除——
  // 它们会把页面预渲染成静态壳，与基于 Cookie 的登录态页面（redirect 跳转）冲突，
  // 会导致页面出现 NEXT_REDIRECT 错误。教学项目不需要这两个优化。
  images: {
    // 允许 next/image 加载这些域名的外部图片
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
