import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getDiscountRate, calculateFinalAmount } from "@/lib/membership";

/**
 * GET /api/orders
 * 获取当前用户的订单列表（按时间倒序，含订单明细）
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, imageUrl: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}

/**
 * POST /api/orders
 * 从购物车创建订单 — 事务内：创建订单 → 扣减库存 → 清空购物车 → 计算会员折扣
 * 如果任一商品库存不足，整单回滚并返回缺货商品名称
 */
export async function POST(_request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    // 使用事务确保原子性
    const order = await prisma.$transaction(async (tx) => {
      // 1. 获取购物车（含商品信息）
      const cartItems = await tx.cartItem.findMany({
        where: { userId: user.id },
        include: { product: true },
      });

      if (cartItems.length === 0) {
        throw new OrderError("购物车为空");
      }

      // 2. 逐项检查库存
      for (const item of cartItems) {
        if (item.quantity > item.product.stock) {
          throw new OrderError(
            `「${item.product.name}」库存不足（剩余 ${item.product.stock} 件）`
          );
        }
      }

      // 3. 计算原价合计
      const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      // 4. 计算会员折扣（在事务内重新读取，确保数据一致性）
      const currentUser = await tx.user.findUniqueOrThrow({
        where: { id: user.id },
        select: { membershipLevel: true },
      });
      const discountRate = getDiscountRate(currentUser.membershipLevel);
      const finalAmount = calculateFinalAmount(totalAmount, discountRate);

      // 5. 创建订单 + 明细
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          totalAmount,
          discountRate,
          finalAmount,
          status: "PENDING",
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price, // 快照下单时单价
            })),
          },
        },
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, imageUrl: true } },
            },
          },
        },
      });

      // 6. 扣减库存
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 7. 清空购物车
      await tx.cartItem.deleteMany({ where: { userId: user.id } });

      return newOrder;
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "下单失败，请稍后重试" }, { status: 500 });
  }
}

/** 订单业务异常 */
class OrderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderError";
  }
}
