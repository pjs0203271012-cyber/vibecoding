import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata = { title: "登录" };

// 登录页（服务端组件壳）：
// 职责 1：已登录的用户访问登录页 → 直接跳回首页
// 职责 2：渲染客户端表单组件 LoginForm（表单需要 onClick/useState，所以是客户端组件）
export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/");

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-16">
      <h1 className="mb-2 text-center text-2xl font-bold">登录 Mini Mall</h1>
      <p className="mb-8 text-center text-sm text-gray-400">
        欢迎回来，请登录你的账号
      </p>
      <LoginForm />
    </div>
  );
}
