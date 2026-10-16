"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/** 当前用户信息 */
interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
}

/** 导航栏右侧用户区域 */
export default function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // 组件挂载时获取当前登录用户
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {
        /* 未登录 */
      })
      .finally(() => setLoading(false));
  }, []);

  /** 退出登录 */
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.refresh();
  }

  if (loading) {
    return <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
      >
        登录
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {user.role === "ADMIN" && (
        <Link href="/admin" className="text-sm text-amber-600 hover:text-amber-700 transition-colors">
          后台
        </Link>
      )}
      <Link href="/profile" className="text-sm text-gray-700 hover:text-blue-600 transition-colors">
        {user.name}
        {user.role === "ADMIN" && (
          <span className="ml-1 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">管理员</span>
        )}
      </Link>
      <button
        onClick={handleLogout}
        className="text-sm text-gray-500 hover:text-red-600 transition-colors"
      >
        退出
      </button>
    </div>
  );
}
