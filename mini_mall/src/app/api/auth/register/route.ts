// ============================================================
// 注册接口 POST /api/auth/register
// 流程：校验 → bcrypt 哈希密码 → 创建用户 → 签发 JWT 写 Cookie（注册即登录）
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth";
import { ROLE } from "@/lib/constants";

export async function POST(request: NextRequest) {
  // 解析请求体（解析失败说明格式不对）
  let body: { name?: string; email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }
  const { name, email, password } = body;

  // ---------- 服务端校验（前端校验只是体验，这里才是安全边界） ----------
  if (!name || !name.trim()) {
    return NextResponse.json({ error: "请填写昵称" }, { status: 400 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "邮箱格式不正确" }, { status: 400 });
  }
  if (!password || password.length < 6) {
    return NextResponse.json({ error: "密码至少 6 位" }, { status: 400 });
  }

  // 邮箱是否已被注册
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "该邮箱已被注册" }, { status: 409 });
  }

  // bcrypt 哈希密码（12 轮加盐），数据库里绝不存明文
  const passwordHash = await bcrypt.hash(password, 12);

  // 创建用户（注册角色固定为普通用户 CUSTOMER）
  const user = await prisma.user.create({
    data: { name: name.trim(), email, passwordHash, role: ROLE.CUSTOMER },
  });

  // 注册即登录：签发 JWT 并写入 httpOnly Cookie
  const token = await signToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role as (typeof ROLE)[keyof typeof ROLE],
  });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true, // JavaScript 读不到，防 XSS 窃取
    sameSite: "lax", // 防 CSRF
    secure: process.env.NODE_ENV === "production", // 生产环境仅 HTTPS 传输
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
