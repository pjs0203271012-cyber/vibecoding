"use client";

// 注册表单（客户端组件）：提交后调用注册接口，注册成功即自动登录
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password"));
    const confirmPassword = String(formData.get("confirmPassword"));

    // 前端基础校验：两次密码一致（服务端还会再校验一遍）
    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        password,
      }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh(); // 注册即登录，刷新 Header 显示登录状态
    } else {
      const data = await res.json();
      setError(data.error ?? "注册失败，请重试");
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm text-gray-600">
          昵称
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="你的昵称"
          className={inputClass}
        />
      </div>

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
          className={inputClass}
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
          minLength={6}
          placeholder="至少 6 位"
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-1 block text-sm text-gray-600"
        >
          确认密码
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          placeholder="再输入一次密码"
          className={inputClass}
        />
      </div>

      {/* 错误提示 */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-brand-600 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {loading ? "注册中…" : "注册并登录"}
      </button>

      <p className="text-center text-sm text-gray-500">
        已有账号？{" "}
        <Link href="/login" className="text-brand-600 hover:underline">
          去登录
        </Link>
      </p>
    </form>
  );
}
