import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/cart
 * 获取当前登录用户的购物车列表（含商品详情）
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          imageUrl: true,
          stock: true,
        },
      },
    },
    orderBy: { id: "asc" },
  });

  // 计算总价
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return NextResponse.json({
    items: cartItems,
    totalAmount,
  });
}

/** 加入购物车请求体 */
interface AddToCartBody {
  productId: string;
  quantity: number;
}

/**
 * POST /api/cart
 * 加入购物车 — 如果已存在则累加数量，检查库存
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const { productId, quantity } = (await request.json()) as AddToCartBody;

    // 参数校验
    if (!productId) {
      return NextResponse.json({ error: "请指定商品" }, { status: 400 });
    }
    const qty = Math.max(1, Math.floor(quantity || 1));

    // 验证商品存在且有效
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "商品不存在" }, { status: 404 });
    }

    // 查找已有的购物车条目
    const existingItem = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
    });

    const newQuantity = (existingItem?.quantity || 0) + qty;

    // 检查库存
    if (newQuantity > product.stock) {
      return NextResponse.json(
        { error: `库存不足，当前库存 ${product.stock} 件` },
        { status: 400 }
      );
    }

    if (existingItem) {
      // 更新数量
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // 新建条目
      await prisma.cartItem.create({
        data: {
          userId: user.id,
          productId,
          quantity: qty,
        },
      });
    }

    return NextResponse.json({ message: "已加入购物车" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "操作失败，请稍后重试" }, { status: 500 });
  }
}
