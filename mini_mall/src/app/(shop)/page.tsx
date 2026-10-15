import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/product/ProductCard";
import SearchBar from "@/components/product/SearchBar";
import CategoryFilter from "@/components/product/CategoryFilter";

export const metadata = {
  title: "首页",
};

// 首页 = 商品列表页（Server Component 直接查询数据库渲染）
// 支持两种筛选（可组合，都体现在 URL 上）：
//   ?q=关键词      → 按商品名模糊搜索
//   ?category=id   → 按分类筛选
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  // Next 16 中 searchParams 是 Promise，必须 await
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const categoryId = sp.category ? Number(sp.category) : undefined;

  // 读取所有分类（筛选栏用）
  const categories = await prisma.category.findMany({ orderBy: { id: "asc" } });

  // 拼 Prisma 查询条件：关键词模糊匹配 + 分类筛选，可任意组合
  const products = await prisma.product.findMany({
    where: {
      ...(q ? { name: { contains: q } } : {}),
      ...(categoryId ? { categoryId } : {}),
    },
    include: { category: true }, // 卡片上要显示分类名
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Hero 横幅 */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-700 px-8 py-12 text-white">
        <h1 className="text-3xl font-bold">Mini Mall 迷你商城</h1>
        <p className="mt-2 text-brand-100">优质好物，一站购齐</p>
      </div>

      {/* 搜索框 */}
      <div className="mb-4">
        <SearchBar defaultValue={q} />
      </div>

      {/* 分类筛选栏 */}
      <div className="mb-6">
        <CategoryFilter categories={categories} activeId={categoryId} q={q} />
      </div>

      {/* 商品网格：手机 2 列，平板 3 列，桌面 4 列 */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        // 空结果提示
        <div className="py-24 text-center text-gray-400">
          <p className="text-4xl">🔍</p>
          <p className="mt-3">
            {q ? `没有找到与「${q}」相关的商品` : "该分类下暂无商品"}
          </p>
        </div>
      )}
    </div>
  );
}
