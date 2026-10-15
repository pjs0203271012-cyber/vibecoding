import type { Metadata } from "next";
import "./globals.css";

// 站点元信息：浏览器标签页标题、SEO 描述
export const metadata: Metadata = {
  title: {
    default: "Mini Mall 迷你商城",
    template: "%s | Mini Mall", // 子页面标题会自动拼接站点名
  },
  description: "用 Next.js 16 + Prisma 构建的微型电商学习项目",
};

// 根布局：所有页面最外层的 HTML 骨架
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-gray-50 font-sans text-gray-900">
        {children}
      </body>
    </html>
  );
}
