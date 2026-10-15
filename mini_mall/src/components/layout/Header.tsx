import Link from "next/link";
import { getSession } from "@/lib/auth";
import { ROLE } from "@/lib/constants";
import LogoutButton from "@/components/layout/LogoutButton";

// 顶部导航栏（服务端组件）：从 Cookie 读取登录态，
// 已登录显示「昵称 + 退出」和后台入口，未登录显示「登录/注册」
export default async function Header() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo 链接回首页 */}
        <Link href="/" className="text-xl font-bold text-brand-600">
          🛍️ Mini Mall
        </Link>

        {/* 导航链接：根据登录状态显示不同内容（手机上隐藏部分文字链接防拥挤） */}
        <nav className="flex items-center gap-3 text-sm sm:gap-5">
          <Link href="/" className="hidden text-gray-600 hover:text-brand-600 sm:block">
            首页
          </Link>
          <Link href="/cart" className="text-gray-600 hover:text-brand-600">
            购物车
          </Link>

          {session ? (
            <>
              {/* 管理员才显示后台入口 */}
              {session.role === ROLE.ADMIN && (
                <Link
                  href="/admin"
                  className="text-gray-600 hover:text-brand-600"
                >
                  后台管理
                </Link>
              )}
              <span className="text-gray-400">你好，{session.name}</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-brand-600">
                登录
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700"
              >
                注册
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
