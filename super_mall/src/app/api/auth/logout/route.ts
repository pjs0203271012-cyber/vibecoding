import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

/**
 * POST /api/auth/logout
 * 退出登录 — 清除数据库 session + 清除 Cookie
 */
export async function POST() {
  await clearSession();
  return NextResponse.json({ message: "已退出登录" });
}
