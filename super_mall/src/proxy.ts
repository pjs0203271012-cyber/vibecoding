import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 全局路由中间件
 *
 * 职责：
 * - 根据 mini_mall_session Cookie 存在与否，对需要登录的页面做服务端重定向
 * - Cookie 有效性最终由 API 路由逐请求验证（含过期检查、角色检查）
 * - 本中间件只做快速拦截，避免未登录用户看到页面骨架闪烁
 */

/** 需要登录才能访问的页面路径前缀 */
const PROTECTED_PATHS = ["/cart", "/orders", "/checkout", "/profile"];

/** 管理员才能访问的页面路径前缀 */
const ADMIN_PATHS = ["/admin"];

/** session Cookie 名称 — 必须与 src/lib/auth.ts 中 SESSION_COOKIE 一致 */
const SESSION_COOKIE = "mini_mall_session";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  // 检查是否需要登录
  const needsAuth = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const needsAdmin = ADMIN_PATHS.some((p) => pathname.startsWith(p));

  if ((needsAuth || needsAdmin) && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // admin 页面需要 cookie，但角色验证在 API 层完成
  // 这里只做初步拦截，防止非登录用户访问

  return NextResponse.next();
}

/**
 * 仅匹配需要登录保护的路径，其余路径不经过此 proxy
 *
 * - /api/*        : API 路由有独立鉴权，不在此拦截
 * - /login 等公开页 : 仅匹配下方列出的受保护路径
 */
export const config = {
  matcher: [
    "/cart/:path*",
    "/orders/:path*",
    "/checkout/:path*",
    "/profile/:path*",
    "/admin/:path*",
  ],
};
