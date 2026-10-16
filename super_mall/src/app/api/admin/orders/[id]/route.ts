import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { getMembershipLevel } from "@/lib/membership";
import { ALLOWED_TRANSITIONS, getStatusLabel, OrderError } from "@/lib/orders";

/**
 * GET /api/admin/orders/[id]
 * 管理员查看单个订单详情
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.error;

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, imageUrl: true } },
        },
      },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "订单不存在" }, { status: 404 });
  }

  return NextResponse.json({ order });
}

/**
 * PUT /api/admin/orders/[id]
 * 管理员更新订单状态
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.error;

  const { id } = await params;

  try {
    const { status } = await request.json();

    if (!status || !["PAID", "SHIPPED", "COMPLETED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ error: "无效的状态" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id } });
      if (!order) throw new OrderError("订单不存在", 404);

      const allowed = ALLOWED_TRANSITIONS[order.status];
      if (!allowed || !allowed.includes(status)) {
        throw new OrderError(
          `不能从「${getStatusLabel(order.status)}」转为「${getStatusLabel(status)}」`,
          400
        );
      }

      const updated = await tx.order.update({
        where: { id },
        data: { status },
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, imageUrl: true } },
            },
          },
          user: { select: { id: true, name: true, email: true } },
        },
      });

      if (status === "PAID") {
        const updatedUser = await tx.user.update({
          where: { id: order.userId },
          data: { totalSpent: { increment: order.finalAmount } },
        });
        const newLevel = getMembershipLevel(updatedUser.totalSpent);
        if (newLevel !== updatedUser.membershipLevel) {
          await tx.user.update({
            where: { id: order.userId },
            data: { membershipLevel: newLevel },
          });
        }
      }

      return updated;
    });

    return NextResponse.json({ order: result });
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
