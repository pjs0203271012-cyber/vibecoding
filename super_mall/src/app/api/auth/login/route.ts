import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, setSession } from "@/lib/auth";
import { checkRateLimit, getClientIP, LOGIN_LIMIT } from "@/lib/rate-limit";

/**
 * 伪造的 bcrypt 哈希，用于用户不存在时仍执行 compare，消除时序侧信道。
 * 格式：$2a$10$ + 22 字符 salt + 31 字符 hash = 总共 60 字符。
 */
const DUMMY_HASH = "$2a$10$AAAAAAAAAAAAAAAAAAAAAACCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC";

/**
 * POST /api/auth/login
 * 用户登录 — 验证邮箱和密码，成功后写入 session
 *
 * 安全策略：
 * - 不论用户是否存在，始终执行 bcrypt.compare，消除时序侧信道
 * - 统一返回"邮箱或密码错误"，防止撞库攻击和用户枚举
 * - 登录时清理该用户的所有旧 Session（session 轮换）
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 参数校验
    if (!email || !password) {
      return NextResponse.json({ error: "请输入邮箱和密码" }, { status: 400 });
    }

    // 速率限制
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP, "login", LOGIN_LIMIT);
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        { error: `请求过于频繁，请 ${retryAfter} 秒后重试` },
        { status: 429 }
      );
    }

    // 邮箱统一转小写
    const normalizedEmail = email.toLowerCase().trim();

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // 始终执行 bcrypt.compare，消除时序侧信道
    // 用户不存在时用假哈希，耗时与真实验证相近
    const isValid = user
      ? await verifyPassword(password, user.password)
      : await verifyPassword(password, DUMMY_HASH);

    // 统一错误信息
    if (!user || !isValid) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    // Session 轮换：删除该用户所有旧 Session
    await prisma.session.deleteMany({ where: { userId: user.id } });

    // 创建新 Session
    await setSession(user.id, user.role);

    return NextResponse.json({
      message: "登录成功",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch {
    return NextResponse.json({ error: "登录失败，请稍后重试" }, { status: 500 });
  }
}
