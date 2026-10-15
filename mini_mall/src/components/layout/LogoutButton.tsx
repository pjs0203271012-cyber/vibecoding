"use client";

// 退出登录按钮（客户端组件）：调用登出接口清除 Cookie，然后刷新页面
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh(); // 让 Header 等 Server Component 重新读取 Cookie
  }

  return (
    <button
      onClick={handleLogout}
      className="text-gray-600 hover:text-brand-600"
    >
      退出登录
    </button>
  );
}
