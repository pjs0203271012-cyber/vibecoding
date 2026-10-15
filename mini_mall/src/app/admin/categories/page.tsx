import { prisma } from "@/lib/prisma";
import CategoryRow from "./CategoryRow";
import CategoryCreateForm from "./CategoryCreateForm";

export const metadata = { title: "分类管理" };

// 分类管理页（服务端组件）：列表 + 行内重命名/删除 + 底部新增表单
export default async function AdminCategoriesPage() {
  // 查询分类并统计每个分类下的商品数（提示用）
  const categories = await prisma.category.findMany({
    orderBy: { id: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">分类管理</h1>

      {/* 分类列表 */}
      <div className="rounded-xl border border-gray-200 bg-white">
        {categories.length === 0 && (
          <p className="py-12 text-center text-sm text-gray-400">暂无分类</p>
        )}
        {categories.map((category) => (
          <CategoryRow
            key={category.id}
            category={{ id: category.id, name: category.name }}
            productCount={category._count.products}
          />
        ))}
      </div>

      {/* 新增分类表单 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-semibold">新增分类</h2>
        <CategoryCreateForm />
      </div>
    </div>
  );
}
