import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

/**
 * GET /api/admin/categories
 * 管理员获取所有分类列表（含商品数量）
 */
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.error;

  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { createdAt: "asc" },
  });

  const result = categories.map(({ _count, ...cat }) => ({
    ...cat,
    productCount: _count.products,
  }));

  return NextResponse.json({ categories: result });
}

/**
 * POST /api/admin/categories
 * 管理员创建新分类
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.error;

  try {
    const { name, slug } = await request.json();

    if (!name || !slug) {
      return NextResponse.json({ error: "名称和标识为必填项" }, { status: 400 });
    }

    // slug 格式校验（只允许字母、数字、连字符）
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: "标识只能包含小写字母、数字和连字符" },
        { status: 400 }
      );
    }

    // 检查唯一性
    const existing = await prisma.category.findFirst({
      where: { OR: [{ name }, { slug }] },
    });
    if (existing) {
      return NextResponse.json(
        { error: existing.name === name ? "分类名称已存在" : "标识已存在" },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: { name: name.trim(), slug: slug.trim() },
      include: { _count: { select: { products: true } } },
    });

    return NextResponse.json({
      category: { ...category, productCount: category._count.products },
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "创建分类失败" }, { status: 500 });
  }
}
