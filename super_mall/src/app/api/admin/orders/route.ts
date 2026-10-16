import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

/**
 * GET /api/admin/orders
 * 管理员获取所有订单列表（含用户和商品信息）
 */
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.error;

  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, imageUrl: true } },
        },
      },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}
