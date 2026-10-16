import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * 校验购物车条目是否属于当前用户
 * @returns 不属于时直接返回 403 响应，属于时返回条目
 */
async function verifyCartOwnership(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "请先登录" }, { status: 401 }) };

  const item = await prisma.cartItem.findUnique({
    where: { id },
    include: { product: { select: { stock: true } } },
  });

  if (!item) return { error: NextResponse.json({ error: "购物车条目不存在" }, { status: 404 }) };
  if (item.userId !== user.id) {
    return { error: NextResponse.json({ error: "无权操作此条目" }, { status: 403 }) };
  }

  return { item, user };
}

/**
 * PUT /api/cart/[id]
 * 修改购物车条目数量 — 检查库存
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await verifyCartOwnership(id);

  // 如果返回的是错误响应，直接返回
  if ("error" in result) return result.error;

  const { item } = result;

  try {
    const { quantity } = await request.json();
    const qty = Math.max(1, Math.floor(quantity || 1));

    // 检查库存
    if (qty > item.product.stock) {
      return NextResponse.json(
        { error: `库存不足，当前库存 ${item.product.stock} 件` },
        { status: 400 }
      );
    }

    await prisma.cartItem.update({
      where: { id },
      data: { quantity: qty },
    });

    return NextResponse.json({ message: "数量已更新" });
  } catch {
    return NextResponse.json({ error: "操作失败，请稍后重试" }, { status: 500 });
  }
}

/**
 * DELETE /api/cart/[id]
 * 删除购物车条目
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await verifyCartOwnership(id);

  // 如果返回的是错误响应，直接返回
  if ("error" in result) return result.error;

  try {
    await prisma.cartItem.delete({ where: { id } });
    return NextResponse.json({ message: "已从购物车移除" });
  } catch {
    return NextResponse.json({ error: "操作失败，请稍后重试" }, { status: 500 });
  }
}
