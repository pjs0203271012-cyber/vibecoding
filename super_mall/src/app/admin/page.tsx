"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/** 后台管理首页 — 总入口仪表盘 */
export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.user || data.user.role !== "ADMIN") {
          router.push("/login?redirect=/admin");
          return;
        }
        setUser(data.user);
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="h-8 w-40 bg-gray-200 rounded mb-6 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: "商品管理",
      description: "查看、新增、编辑、删除商品",
      href: "/admin/products",
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
      icon: "📦",
    },
    {
      title: "订单管理",
      description: "查看所有订单，更新订单状态",
      href: "/admin/orders",
      color: "bg-green-50 border-green-200 hover:bg-green-100",
      icon: "📋",
    },
    {
      title: "分类管理",
      description: "管理商品分类，新增和删除分类",
      href: "/admin/categories",
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
      icon: "🏷️",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">后台管理</h1>
          <p className="text-sm text-gray-500 mt-1">
            欢迎，{user?.name || "管理员"}
          </p>
        </div>
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          返回商城 →
        </Link>
      </div>

      {/* 管理入口卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`block p-6 rounded-xl border-2 transition-all ${card.color}`}
          >
            <div className="text-3xl mb-3">{card.icon}</div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">{card.title}</h2>
            <p className="text-sm text-gray-500">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
