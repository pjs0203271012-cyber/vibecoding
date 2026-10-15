// ============================================================
// 认证核心逻辑：JWT 的签发与验证、登录态的获取与校验
// 本文件只在服务端使用（Server Component / Server Action / Route Handler）
// ============================================================
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ROLE, type Role } from "@/lib/constants";

// JWT 签名密钥（在 .env 中配置，至少 32 字节的随机字符串）
const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

// 登录 Cookie 的名字
export const COOKIE_NAME = "token";

// 登录有效期：7 天（秒）
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

// 登录态对象（同时就是 JWT 的载荷，存什么取什么）
export type Session = {
  userId: number;
  email: string;
  name: string;
  role: Role;
};

/**
 * 签发 JWT：登录/注册成功后调用
 * 使用 HS256 算法 + 过期时间，jose 库会在验证时自动校验
 */
export async function signToken(session: Session): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret);
}

/**
 * 获取当前登录态：从 Cookie 读取 JWT 并验证（签名 + 过期时间）
 * 未登录、签名无效、已过期 → 一律返回 null
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies(); // Next 15+ 起 cookies() 是异步的，必须 await
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as Session;
  } catch {
    return null; // token 无效或过期，视为未登录
  }
}

/**
 * 要求已登录：用于需要登录的 Server Action 和页面
 * 未登录时直接 redirect 到登录页（redirect 会抛异常终止执行）
 */
export async function requireUser(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/**
 * 要求是管理员：用于后台的 Action 和页面
 * 未登录 → 跳登录页；已登录但不是管理员 → 打回首页
 */
export async function requireAdmin(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== ROLE.ADMIN) redirect("/");
  return session;
}
