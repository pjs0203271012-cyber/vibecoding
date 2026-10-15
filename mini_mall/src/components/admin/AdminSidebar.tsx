"use client";

// 后台侧边栏（客户端组件）：用 usePathname 高亮当前所在菜单
import Link from "next/link";
import { usePathname } from "next/navigation";

const MENU = [
  { href: "/admin", label: "📊 仪表盘" },
  { href: "/admin/products", label: "📦 商品管理" },
  { href: "/admin/categories", label: "🏷️ 分类管理" },
  { href: "/admin/orders", label: "📋 订单管理" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-48 shrink-0 border-r border-gray-200 bg-white">
      <nav className="flex flex-col gap-1 p-4">
        {MENU.map((item) => {
          // 当前路径以菜单路径开头（含子页面）则高亮
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm ${
                active
                  ? "bg-brand-50 font-medium text-brand-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
