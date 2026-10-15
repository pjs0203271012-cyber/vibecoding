"use client";

// 登录表单（客户端组件）：提交后调用登录接口，成功后跳转
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginFormInner() {
  const router = useRouter();
  // 读取 URL 上的 ?next= 参数：proxy 拦截未登录访问时会把原页面带过来，
  // 登录成功后跳回用户原本想去的页面
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 收集表单数据并调用登录接口
    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });

    if (res.ok) {
      router.push(next);
      // refresh 让所有 Server Component（如 Header）重新读取 Cookie，
      // 登录状态立刻生效
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "登录失败，请重试");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm text-gray-600">
          邮箱
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm text-gray-600">
          密码
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder="请输入密码"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>

      {/* 错误提示 */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-brand-600 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {loading ? "登录中…" : "登录"}
      </button>

      <p className="text-center text-sm text-gray-500">
        还没有账号？{" "}
        <Link href="/register" className="text-brand-600 hover:underline">
          去注册
        </Link>
      </p>
    </form>
  );
}

// useSearchParams 必须包在 Suspense 里（Next.js 对客户端组件的构建要求）
export default function LoginForm() {
  return (
    <Suspense>
      <LoginFormInner />
    </Suspense>
  );
}
