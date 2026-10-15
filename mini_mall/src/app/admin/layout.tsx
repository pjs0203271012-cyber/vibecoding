import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = { title: "后台管理" };

// 后台布局（服务端组件）：
// 第一行 await requireAdmin() 做页面级二次校验（proxy 是第一道防线），
// 同时拿到管理员信息显示在顶栏
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* 后台顶栏 */}
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
        <Link href="/admin" className="font-bold text-brand-600">
          🛍️ Mini Mall 后台
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-500">{admin.name}（管理员）</span>
          <Link href="/" className="text-gray-600 hover:text-brand-600">
            返回前台
          </Link>
        </div>
      </header>

      {/* 侧边栏 + 内容区 */}
      <div className="flex flex-1">
        <AdminSidebar />
        {/* min-w-0：flex 子项默认不收缩，宽表格会把页面撑出横向滚动条 */}
        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
