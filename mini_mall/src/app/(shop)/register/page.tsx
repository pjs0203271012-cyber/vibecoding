import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import RegisterForm from "./RegisterForm";

export const metadata = { title: "注册" };

// 注册页（服务端组件壳）：已登录用户直接跳首页
export default async function RegisterPage() {
  const session = await getSession();
  if (session) redirect("/");

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-16">
      <h1 className="mb-2 text-center text-2xl font-bold">注册 Mini Mall</h1>
      <p className="mb-8 text-center text-sm text-gray-400">
        创建账号，开启购物之旅
      </p>
      <RegisterForm />
    </div>
  );
}
