import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import type { CurrentUser } from "@/lib/auth";

/** 鉴权成功 */
interface AdminSuccess {
  ok: true;
  user: CurrentUser;
}

/** 鉴权失败 */
interface AdminFailure {
  ok: false;
  error: ReturnType<typeof NextResponse.json>;
}

/** requireAdmin 返回值 — discriminated union */
type AdminResult = AdminSuccess | AdminFailure;

/**
 * 验证当前用户是否为管理员
 * 返回 discriminated union，通过 ok 字段区分成功/失败
 */
export async function requireAdmin(): Promise<AdminResult> {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, error: NextResponse.json({ error: "请先登录" }, { status: 401 }) };
  }

  if (user.role !== "ADMIN") {
    return { ok: false, error: NextResponse.json({ error: "无权访问，需要管理员权限" }, { status: 403 }) };
  }

  return { ok: true, user };
}
