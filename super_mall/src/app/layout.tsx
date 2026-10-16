import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import UserMenu from "@/components/layout/UserMenu";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mini Mall — 微型电商",
  description: "一个功能完整的微型电商系统",
};

/** 顶部导航栏 */
function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-blue-600">
          Mini Mall
        </Link>

        {/* 导航链接 */}
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/cart" className="text-gray-600 hover:text-blue-600 transition-colors">
            购物车
          </Link>
          <Link href="/orders" className="text-gray-600 hover:text-blue-600 transition-colors">
            我的订单
          </Link>
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1">{children}</main>
        {/* 底部 */}
        <footer className="border-t border-gray-200 bg-white py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
            © 2026 Mini Mall. 仅供学习使用。
          </div>
        </footer>
      </body>
    </html>
  );
}
