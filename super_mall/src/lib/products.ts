import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** 商品列表查询参数 */
export interface GetProductsParams {
  search?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

/** 商品列表返回类型 */
export interface ProductListResult {
  products: ProductWithCategory[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/** 带分类的商品类型 */
export interface ProductWithCategory {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  categoryId: string;
  createdAt: Date;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

/** 商品分类关联的查询字段 */
const categorySelect = { id: true, name: true, slug: true } as const;

/**
 * 获取商品列表（支持搜索、分类筛选、分页）
 * 可被 API Route 和 Server Component 直接复用
 */
export async function getProducts(params: GetProductsParams): Promise<ProductListResult> {
  const search = params.search || "";
  const category = params.category || "";
  const page = Math.max(1, params.page || 1);
  const pageSize = params.pageSize || 9;

  // 使用 Prisma 类型安全的 where 构建
  const where: Prisma.ProductWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  if (category) {
    where.category = { slug: category };
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { category: { select: categorySelect } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    products,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * 获取单个商品详情（含分类信息）
 */
export async function getProductById(id: string): Promise<ProductWithCategory | null> {
  return prisma.product.findUnique({
    where: { id },
    include: { category: { select: categorySelect } },
  });
}
