import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

/**
 * DELETE /api/admin/categories/[id]
 * 管理员删除分类（仅当分类下无商品时允许）
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.error;

  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });

  if (!category) {
    return NextResponse.json({ error: "分类不存在" }, { status: 404 });
  }

  if (category._count.products > 0) {
    return NextResponse.json(
      { error: `该分类下有 ${category._count.products} 个商品，无法删除` },
      { status: 400 }
    );
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ message: "分类已删除" });
}
