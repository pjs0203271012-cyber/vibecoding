import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

/**
 * PUT /api/admin/products/[id]
 * 管理员更新商品信息
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.error;

  const { id } = await params;

  // 检查商品是否存在
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "商品不存在" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { name, description, price, imageUrl, stock, categoryId } = body;

    // 参数校验
    if (price !== undefined && (typeof price !== "number" || price < 0)) {
      return NextResponse.json({ error: "价格必须为非负数" }, { status: 400 });
    }
    if (stock !== undefined && (typeof stock !== "number" || stock < 0 || !Number.isInteger(stock))) {
      return NextResponse.json({ error: "库存必须为非负整数" }, { status: 400 });
    }

    // 如果修改了分类，验证分类存在
    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) {
        return NextResponse.json({ error: "分类不存在" }, { status: 400 });
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(price !== undefined && { price }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(stock !== undefined && { stock: Math.floor(stock) }),
        ...(categoryId && { categoryId }),
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    return NextResponse.json({ product: updated });
  } catch {
    return NextResponse.json({ error: "更新商品失败" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/products/[id]
 * 管理员删除商品
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.error;

  const { id } = await params;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "商品不存在" }, { status: 404 });
  }

  try {
    // 事务内原子执行：先清理关联数据，再删除商品
    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { productId: id } }),
      prisma.orderItem.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: "商品已删除" });
  } catch {
    return NextResponse.json({ error: "删除商品失败，请确认该商品无关联订单" }, { status: 500 });
  }
}
