import { prisma } from "@/lib/prisma";

/** 分类（含商品数量）类型 */
export interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  createdAt: Date;
}

/**
 * 获取所有分类及其商品数量
 * 可被 API Route 和 Server Component 直接复用
 */
export async function getCategories(): Promise<CategoryWithCount[]> {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return categories.map(({ _count, ...cat }) => ({
    ...cat,
    productCount: _count.products,
  }));
}
