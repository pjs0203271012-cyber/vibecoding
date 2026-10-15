// ============================================================
// 路由守卫（Next.js 16 起 middleware.ts 已弃用，改名为 proxy.ts）
// 职责：在到达页面之前拦截未登录/非管理员的访问，改善用户体验。
//
// ⚠️ 注意：这只是第一道防线（体验层）！真正的安全边界
// 在每个 Server Action / Route Handler 内部的 requireUser / requireAdmin，
// 因为那些接口可以被绕过页面直接请求。
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { ROLE } from "@/lib/constants";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // 解析登录态：token 缺失或无效都视为未登录
  let session: { role?: string } | null = null;
  if (token) {
    try {
      session = (await jwtVerify(token, secret)).payload as { role?: string };
    } catch {
      // 无效 token 忽略即可，按未登录处理
    }
  }

  // 未登录 → 跳登录页，登录成功后跳回原页面（?next=参数）
  if (!session) {
    return NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url)
    );
  }

  // 访问后台但角色不是管理员 → 打回首页
  if (pathname.startsWith("/admin") && session.role !== ROLE.ADMIN) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// 只匹配需要保护的路径，其余请求不经过 proxy（保持轻量）
export const config = {
  matcher: [
    "/cart/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/admin/:path*",
  ],
};
