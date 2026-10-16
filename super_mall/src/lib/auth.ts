import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/* ==================== 密码哈希 ==================== */

const SALT_ROUNDS = 10;

/** 对明文密码进行 bcrypt 哈希 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/** 验证明文密码与哈希值是否匹配 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/* ==================== Session 管理 ==================== */

const SESSION_COOKIE = "mini_mall_session";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 天（秒）

/**
 * 创建会话：写入数据库 Session 表 + 设置 httpOnly Cookie
 * 注意：调用前应已执行旧 Session 清理（session 轮换）
 */
export async function setSession(userId: string, role: string): Promise<boolean> {
  const expires = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  // 生成随机 session token
  const token = crypto.randomUUID();

  await prisma.session.create({
    data: {
      sessionToken: token,
      userId,
      expires,
    },
  });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return true;
}

/** 会话信息（从 Cookie 解析得到，不含密码） */
export interface SessionUser {
  userId: string;
  role: string;
}

/**
 * 从 Cookie 读取当前会话
 * @returns 会话信息，未登录返回 null
 */
export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: { user: { select: { id: true, role: true } } },
  });

  // 会话不存在或已过期
  if (!session || session.expires < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  return { userId: session.user.id, role: session.user.role };
}

/** 用户完整信息（不含密码） */
export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: string;
  totalSpent: number;
  membershipLevel: number;
  createdAt: Date;
}

/**
 * 获取当前登录用户的完整信息
 * 单条 SQL 通过 session 关联查询，避免两次 DB 请求
 * @returns 用户信息，未登录返回 null
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          totalSpent: true,
          membershipLevel: true,
          createdAt: true,
        },
      },
    },
  });

  if (!session || session.expires < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  return session.user;
}

/**
 * 清除会话：删除数据库记录 + 清除 Cookie
 */
export async function clearSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;

  if (token) {
    // sessionToken 有 @unique 约束，用 delete 更准确
    await prisma.session.delete({ where: { sessionToken: token } }).catch(() => {
      // token 可能已被清理，忽略
    });
  }

  // 清除浏览器 Cookie
  jar.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0, // 立即过期
  });
}
