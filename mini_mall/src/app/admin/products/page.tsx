import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export const metadata = { title: "商品管理" };

// 商品管理列表页：支持关键词搜索（?q=）
export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";

  const products = await prisma.product.findMany({
    where: q ? { name: { contains: q } } : {},
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* 顶栏：标题 + 搜索 + 新建按钮 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">商品管理</h1>
        <div className="flex items-center gap-3">
          <form action="/admin/products" method="GET" className="flex gap-2">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="搜索商品…"
              className="w-44 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              搜索
            </button>
          </form>
          <Link
            href="/admin/products/new"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            + 新建商品
          </Link>
        </div>
      </div>

      {/* 商品表格 */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-400">
              <th className="px-4 py-3 font-normal">商品</th>
              <th className="px-4 py-3 font-normal">分类</th>
              <th className="px-4 py-3 font-normal">价格</th>
              <th className="px-4 py-3 font-normal">库存</th>
              <th className="px-4 py-3 font-normal">操作</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  {q ? `没有找到与「${q}」相关的商品` : "暂无商品，点击右上角新建"}
                </td>
              </tr>
            )}
            {products.map((product) => (
              <tr key={product.id} className="border-b border-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-lg">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        "🛍️"
                      )}
                    </div>
                    <span className="font-medium">{product.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{product.category.name}</td>
                <td className="px-4 py-3 font-medium text-brand-600">
                  {formatPrice(product.price)}
                </td>
                <td className="px-4 py-3 text-gray-500">{product.stock}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-4">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-sm text-brand-600 hover:underline"
                    >
                      编辑
                    </Link>
                    <DeleteProductButton productId={product.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
