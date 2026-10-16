import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

import { Prisma } from "@prisma/client";

/**
 * GET /api/admin/products
 * 管理员获取商品列表（含分类），支持分页和按分类筛选
 * 查询参数：page（默认 1）、pageSize（默认 10）、category（分类 slug，可选）
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.error;

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10)));
  const category = searchParams.get("category") || "";

  const where: Prisma.ProductWhereInput = {};
  if (category) {
    where.category = { slug: category };
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    products,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}

/**
 * POST /api/admin/products
 * 管理员创建新商品
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.error;

  try {
    const body = await request.json();
    const { name, description, price, imageUrl, stock, categoryId } = body;

    // 参数校验
    if (!name || !price || !categoryId) {
      return NextResponse.json({ error: "名称、价格、分类为必填项" }, { status: 400 });
    }
    if (typeof price !== "number" || price < 0) {
      return NextResponse.json({ error: "价格必须为非负数" }, { status: 400 });
    }
    if (typeof stock !== "number" || stock < 0 || !Number.isInteger(stock)) {
      return NextResponse.json({ error: "库存必须为非负整数" }, { status: 400 });
    }

    // 验证分类存在
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ error: "分类不存在" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: (description || "").trim(),
        price,
        imageUrl: imageUrl || "",
        stock: Math.floor(stock),
        categoryId,
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "创建商品失败" }, { status: 500 });
  }
}
