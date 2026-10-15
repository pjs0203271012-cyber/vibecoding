import Link from "next/link";

// 全局 404 页面：访问不存在的路径时显示
export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24">
      <h1 className="text-5xl font-bold text-gray-300">404</h1>
      <p className="text-gray-500">页面不存在或已被删除</p>
      <Link
        href="/"
        className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
      >
        返回首页
      </Link>
    </div>
  );
}
