// ============================================================
// PrismaClient 单例
// 开发模式下 Next.js 会热重载，若每次都 new 一个 PrismaClient
// 会不断创建数据库连接。这里把实例挂到 globalThis 上复用，
// 保证整个进程只有一个连接池。
// ============================================================
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
