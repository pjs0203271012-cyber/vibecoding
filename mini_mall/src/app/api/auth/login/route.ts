// ============================================================
// 登录接口 POST /api/auth/login
// 流程：查用户 → bcrypt 比对密码 → 签发 JWT 写 Cookie
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth";
import { ROLE } from "@/lib/constants";

export async function POST(request: NextRequest) {
  // 解析请求体
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "请填写邮箱和密码" }, { status: 400 });
  }

  // 查用户 + 比对密码
  // 安全细节：无论「账号不存在」还是「密码错误」都返回同一句提示，
  // 不让攻击者试探出哪个邮箱已注册
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
  }

  // 签发 JWT 并写入 httpOnly Cookie
  const token = await signToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role as (typeof ROLE)[keyof typeof ROLE],
  });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
