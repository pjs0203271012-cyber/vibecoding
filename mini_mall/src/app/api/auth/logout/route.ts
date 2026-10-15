// ============================================================
// 登出接口 POST /api/auth/logout
// 流程：把登录 Cookie 置空（maxAge 0 立即过期）
// ============================================================
import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return response;
}
