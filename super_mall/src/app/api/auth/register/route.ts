import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSession } from "@/lib/auth";
import { checkRateLimit, getClientIP, REGISTER_LIMIT } from "@/lib/rate-limit";

/** 注册请求体 */
interface RegisterBody {
  email: string;
  password: string;
  name: string;
}

/**
 * POST /api/auth/register
 * 用户注册 — 验证邮箱唯一性，密码至少 8 位，成功后自动登录
 */
export async function POST(request: NextRequest) {
  try {
    const body: RegisterBody = await request.json();
    const { email, password, name } = body;

    // 参数校验
    if (!email || !password || !name) {
      return NextResponse.json({ error: "请填写所有必填字段" }, { status: 400 });
    }

    // 速率限制
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP, "register", REGISTER_LIMIT);
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        { error: `请求过于频繁，请 ${retryAfter} 秒后重试` },
        { status: 429 }
      );
    }

    // 邮箱统一转小写
    const normalizedEmail = email.toLowerCase().trim();

    // 邮箱格式校验
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ error: "邮箱格式不正确" }, { status: 400 });
    }

    // 密码长度校验
    if (password.length < 8) {
      return NextResponse.json({ error: "密码至少需要 8 位" }, { status: 400 });
    }

    // 名称长度校验
    if (name.trim().length === 0) {
      return NextResponse.json({ error: "昵称不能为空" }, { status: 400 });
    }

    // 检查邮箱唯一性
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      return NextResponse.json({ error: "该邮箱已被注册" }, { status: 409 });
    }

    // 创建用户
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: name.trim(),
        role: "USER",
      },
    });

    // 自动登录：写入 session
    await setSession(user.id, user.role);

    return NextResponse.json(
      {
        message: "注册成功",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "注册失败，请稍后重试" }, { status: 500 });
  }
}
