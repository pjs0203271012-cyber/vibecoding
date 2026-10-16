import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getMembershipLevel } from "@/lib/membership";
import { ALLOWED_TRANSITIONS, getStatusLabel, OrderError } from "@/lib/orders";

/**
 * GET /api/orders/[id]
 * 获取订单详情（含商品明细），仅订单所属用户可查看
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, imageUrl: true } },
        },
      },
      user: { select: { name: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "订单不存在" }, { status: 404 });
  }

  // 权限校验：只能看自己的订单，管理员除外
  if (order.userId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "无权查看此订单" }, { status: 403 });
  }

  return NextResponse.json({ order });
}

/**
 * PUT /api/orders/[id]
 * 更新订单状态（支付 / 发货 / 完成 / 取消）
 * 请求体：{ status: "PAID" | "SHIPPED" | "COMPLETED" | "CANCELLED" }
 *
 * 支付成功后自动更新用户累计消费和会员等级
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { status } = await request.json();

    if (!status || !["PAID", "SHIPPED", "COMPLETED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ error: "无效的状态" }, { status: 400 });
    }

    // 在事务中查询并更新
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id } });

      if (!order) {
        throw new OrderError("订单不存在", 404);
      }

      // 权限校验
      if (order.userId !== user.id && user.role !== "ADMIN") {
        throw new OrderError("无权操作此订单", 403);
      }

      // 状态合法性校验
      const allowed = ALLOWED_TRANSITIONS[order.status];
      if (!allowed || !allowed.includes(status)) {
        throw new OrderError(
          `不能从「${getStatusLabel(order.status)}」转为「${getStatusLabel(status)}」`,
          400
        );
      }

      // 更新订单状态
      const updated = await tx.order.update({
        where: { id },
        data: { status },
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, imageUrl: true } },
            },
          },
          user: { select: { name: true } },
        },
      });

      // 支付成功 → 累加消费金额 + 更新会员等级
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
    return NextResponse.json({ error: "操作失败，请稍后重试" }, { status: 500 });
  }
}
